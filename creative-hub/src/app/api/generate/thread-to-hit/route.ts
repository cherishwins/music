import { NextRequest, NextResponse } from "next/server";
import {
  threadToHitAudio,
  MUSIC_STYLES,
  type MusicStyle,
} from "@/lib/voice";
import { uploadTrack, generateTrackFilename } from "@/lib/storage";
import { requirePayment } from "@/lib/x402";

export async function POST(request: NextRequest) {
  // Require payment first
  if (process.env.X402_ENABLED === "true") {
    const paymentResponse = await requirePayment(request, "/api/generate/thread-to-hit");
    if (paymentResponse) return paymentResponse;
  }

  try {
    const body = await request.json();
    const {
      content,
      style = "trap",       // Music style: trap, drill, boombap, etc.
      durationMs = 120000,  // 2 minutes default
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

    // Validate music style
    if (style && !MUSIC_STYLES[style as MusicStyle]) {
      return NextResponse.json(
        { error: `Invalid style. Available: ${Object.keys(MUSIC_STYLES).join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`[ThreadToHit] Starting generation...`);
    console.log(`[ThreadToHit] Style: ${style}, Duration: ${durationMs}ms`);

    // Generate REAL SONG with vocals + music using ElevenLabs Music API
    const result = await threadToHitAudio(content, {
      musicStyle: style as MusicStyle,
      durationMs,
    });

    console.log(`[ThreadToHit] Song generated: "${result.title}"`);

    // Upload to storage if BLOB token is configured
    let downloadUrl: string | undefined;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const filename = generateTrackFilename(result.title, "song");
        const stored = await uploadTrack(result.mainAudio, filename);
        downloadUrl = stored.downloadUrl;
        console.log("[ThreadToHit] Uploaded:", downloadUrl);
      } catch (uploadError) {
        console.error("[ThreadToHit] Upload failed:", uploadError);
      }
    }

    // Return with download URL if available, otherwise base64
    return NextResponse.json({
      success: true,
      title: result.title,
      lyrics: result.lyrics,
      downloadUrl,
      audio: downloadUrl ? undefined : result.mainAudio.toString("base64"),
      songId: result.songId,
      format: "mp3",
      style,
      durationMs,
    });

  } catch (error) {
    console.error("[ThreadToHit] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate song";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available options
export async function GET() {
  return NextResponse.json({
    description: "Transform any text content into a REAL song with vocals + music",
    styles: Object.entries(MUSIC_STYLES).map(([id, traits]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      traits,
    })),
    limits: {
      minDurationMs: 30000,
      maxDurationMs: 300000,
      defaultDurationMs: 120000,
    },
    poweredBy: "ElevenLabs Music API",
  });
}
