import { NextRequest, NextResponse } from "next/server";
import {
  threadToHitAudio,
  VOICES,
  VOICE_PRESETS,
  LANGUAGES,
  type VoiceId,
  type VoicePreset,
  type LanguageCode,
} from "@/lib/voice";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      voice = "adam",
      style = "hype",
      language,
      includeIntro = false,
      includeOutro = false,
    } = body;

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: "Content must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Validate voice selection
    if (voice && !VOICES[voice as VoiceId]) {
      return NextResponse.json(
        { error: `Invalid voice. Available: ${Object.keys(VOICES).join(", ")}` },
        { status: 400 }
      );
    }

    // Validate style preset
    if (style && !VOICE_PRESETS[style as VoicePreset]) {
      return NextResponse.json(
        { error: `Invalid style. Available: ${Object.keys(VOICE_PRESETS).join(", ")}` },
        { status: 400 }
      );
    }

    // Validate language if provided
    if (language && !LANGUAGES[language as LanguageCode]) {
      return NextResponse.json(
        { error: `Invalid language. Available: ${Object.keys(LANGUAGES).join(", ")}` },
        { status: 400 }
      );
    }

    // Generate the spoken word audio
    const result = await threadToHitAudio(content, {
      voice: voice as VoiceId,
      style: style as VoicePreset,
      language: language as LanguageCode | undefined,
      includeIntro,
      includeOutro,
    });

    // Return audio as base64
    return NextResponse.json({
      title: result.title,
      lyrics: result.lyrics,
      audio: {
        main: result.mainAudio.toString("base64"),
        intro: result.introAudio?.toString("base64"),
        outro: result.outroAudio?.toString("base64"),
      },
      format: "mp3",
      voice,
      style,
      language: language || "en",
    });
  } catch (error) {
    console.error("Thread to hit error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available options
export async function GET() {
  return NextResponse.json({
    voices: Object.entries(VOICES).map(([key]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
    })),
    styles: Object.keys(VOICE_PRESETS),
    languages: Object.entries(LANGUAGES).map(([code, name]) => ({
      code,
      name,
    })),
  });
}
