import { NextRequest, NextResponse } from "next/server";
import { generateSpeech, VOICES, type VoiceId } from "@/lib/voice";
import { requirePayment } from "@/lib/x402";

export async function POST(request: NextRequest) {
  // Require payment first
  if (process.env.X402_ENABLED === "true") {
    const paymentResponse = await requirePayment(request, "/api/generate/voice");
    if (paymentResponse) return paymentResponse;
  }

  try {
    const { text, voiceId, stability, similarityBoost, style } =
      await request.json();

    if (!text || text.length < 1) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text must be under 5000 characters" },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Validate voice ID
    const voice = (voiceId as VoiceId) || "adam";
    if (!VOICES[voice]) {
      return NextResponse.json(
        { error: "Invalid voice ID" },
        { status: 400 }
      );
    }

    const audioBuffer = await generateSpeech(text, voice, {
      stability,
      similarityBoost,
      style,
    });

    // Return audio as base64
    return NextResponse.json({
      simpleAudio: audioBuffer.toString("base64"),
      format: "mp3",
      voiceId: voice,
      characters: text.length,
    });
  } catch (error) {
    console.error("Voice generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate voice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available voices
export async function GET() {
  return NextResponse.json({
    voices: Object.entries(VOICES).map(([key, id]) => ({
      key,
      id,
      name: key.charAt(0).toUpperCase() + key.slice(1),
    })),
  });
}
