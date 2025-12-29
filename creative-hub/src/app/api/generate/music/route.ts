import { NextRequest, NextResponse } from "next/server";
import {
  composeMusic,
  generateBeat,
  generateFullSong,
  MUSIC_STYLES,
  type MusicStyle,
} from "@/lib/voice";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode = "prompt",  // "prompt" | "beat" | "song"
      prompt,
      style = "trap",
      lyrics,
      durationMs = 60000,
      instrumental = false,
      mood,
      tempo,
      bpm,
    } = body;

    // Validate API key
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Validate style
    if (style && !MUSIC_STYLES[style as MusicStyle]) {
      return NextResponse.json(
        { error: `Invalid style. Available: ${Object.keys(MUSIC_STYLES).join(", ")}` },
        { status: 400 }
      );
    }

    // Validate duration (3 seconds to 10 minutes)
    if (durationMs < 3000 || durationMs > 600000) {
      return NextResponse.json(
        { error: "Duration must be between 3000ms (3s) and 600000ms (10min)" },
        { status: 400 }
      );
    }

    let result: { audio: Buffer; songId?: string };

    switch (mode) {
      case "prompt":
        // Simple prompt-based generation
        if (!prompt || prompt.length < 10) {
          return NextResponse.json(
            { error: "Prompt must be at least 10 characters" },
            { status: 400 }
          );
        }
        result = await composeMusic(prompt, {
          durationMs,
          instrumental,
        });
        break;

      case "beat":
        // Style-specific beat generation
        result = await generateBeat(style as MusicStyle, {
          durationMs,
          mood,
          tempo,
        });
        break;

      case "song":
        // Full song with lyrics
        if (!lyrics || lyrics.length < 50) {
          return NextResponse.json(
            { error: "Lyrics must be at least 50 characters" },
            { status: 400 }
          );
        }
        result = await generateFullSong(lyrics, style as MusicStyle, {
          durationMs,
          bpm: bpm ? parseInt(bpm) : undefined,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid mode. Use: prompt, beat, or song" },
          { status: 400 }
        );
    }

    // Return audio as base64
    return NextResponse.json({
      success: true,
      mode,
      style,
      audio: result.audio.toString("base64"),
      songId: result.songId,
      format: "mp3",
      durationMs,
    });

  } catch (error) {
    console.error("Music generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate music";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available styles and options
export async function GET() {
  return NextResponse.json({
    modes: [
      { id: "prompt", description: "Generate from text description" },
      { id: "beat", description: "Generate instrumental beat in a style" },
      { id: "song", description: "Generate full song with lyrics" },
    ],
    styles: Object.entries(MUSIC_STYLES).map(([id, traits]) => ({
      id,
      traits,
    })),
    limits: {
      minDurationMs: 3000,
      maxDurationMs: 600000,
      defaultDurationMs: 60000,
    },
  });
}
