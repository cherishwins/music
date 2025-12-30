import { NextRequest, NextResponse } from "next/server";
import {
  composeMusic,
  generateBeat,
  generateFullSong,
  MUSIC_STYLES,
  type MusicStyle,
} from "@/lib/voice";
import { requirePayment } from "@/lib/x402";
import { getMasterDJ } from "@/lib/master-dj";
import { trackFunnelEvent, canGenerateFree, markFreeGenerationUsed, generateId } from "@/lib/db";
import { applyWatermark, quickWatermark } from "@/lib/watermark";

export async function POST(request: NextRequest) {
  // Parse session info from headers/cookies for tracking
  const sessionId = request.headers.get("x-session-id") || generateId();
  const userId = request.headers.get("x-user-id") || null;
  const anonymousId = request.headers.get("x-anonymous-id") || undefined;

  try {
    const body = await request.json();

    // Track generation start
    await trackFunnelEvent({
      event: "generate_start",
      sessionId,
      userId,
      anonymousId,
      platform: detectPlatform(request),
      userAgent: request.headers.get("user-agent") || undefined,
    }).catch(() => {}); // Don't fail on tracking errors

    // Check if user qualifies for free generation
    const freeCheck = await canGenerateFree(userId);

    // Determine if payment is required
    let requiresPayment = false;
    let isWatermarked = true;

    if (process.env.X402_ENABLED === "true") {
      if (freeCheck.allowed && freeCheck.reason === "first_free") {
        // First generation is free! Zero-friction onboarding
        requiresPayment = false;
        isWatermarked = true; // But still watermarked
      } else if (freeCheck.allowed && freeCheck.reason === "tier_limit") {
        // Within tier limits, still watermarked for free tier
        requiresPayment = false;
        isWatermarked = true;
      } else {
        // Must pay for clean version
        const paymentResponse = await requirePayment(request, "/api/generate/music");
        if (paymentResponse) {
          // Track payment attempt
          await trackFunnelEvent({
            event: "download_attempt_clean",
            sessionId,
            userId,
            anonymousId,
          }).catch(() => {});
          return paymentResponse; // Returns 402 if payment needed
        }
        // Payment successful
        requiresPayment = false;
        isWatermarked = false; // Clean version after payment
      }
    }
    const {
      mode = "prompt",  // "prompt" | "beat" | "song" | "viral"
      prompt,
      style = "trap",
      lyrics,
      durationMs = 60000,
      instrumental = false,
      mood,
      tempo,
      bpm,
      // Viral mode params
      theme,
      targetViralScore = 50,
      includeMusic = false,
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

      case "viral":
        // Master DJ viral generation
        if (!theme || theme.length < 3) {
          return NextResponse.json(
            { error: "Theme must be at least 3 characters" },
            { status: 400 }
          );
        }

        const masterDJ = getMasterDJ();
        const viralResult = await masterDJ.generate({
          theme,
          style: style as MusicStyle,
          targetViralScore,
          includeMusic,
          durationMs,
          bpm: bpm ? parseInt(bpm) : undefined,
        });

        // Apply watermark to viral audio if present
        let viralAudio = viralResult.music?.audio;
        if (viralAudio && isWatermarked) {
          const watermarkResult = await quickWatermark(viralAudio, "mp3");
          viralAudio = watermarkResult.buffer;
        }

        // Mark first free generation as used
        if (userId && freeCheck.reason === "first_free") {
          await markFreeGenerationUsed(userId).catch(() => {});
        }

        // Track generation complete
        await trackFunnelEvent({
          event: "generate_complete",
          sessionId,
          userId,
          anonymousId,
          trackId: viralResult.music?.songId,
        }).catch(() => {});

        // Return viral-specific response
        return NextResponse.json({
          success: true,
          mode: "viral",
          style,
          lyrics: viralResult.lyrics,
          viralScore: viralResult.viralScore,
          metrics: viralResult.metrics,
          audio: viralAudio?.toString("base64"),
          songId: viralResult.music?.songId,
          format: "mp3",
          durationMs,
          attempts: viralResult.attempts,
          inspirationPatterns: viralResult.inspirationPatterns.slice(0, 5),
          isWatermarked,
          freeGenerationsRemaining: freeCheck.remainingFree,
        });

      default:
        return NextResponse.json(
          { error: "Invalid mode. Use: prompt, beat, song, or viral" },
          { status: 400 }
        );
    }

    // Apply watermark if needed
    let finalAudio = result.audio;
    if (isWatermarked) {
      const watermarkResult = await quickWatermark(result.audio, "mp3");
      finalAudio = watermarkResult.buffer;
    }

    // Mark first free generation as used
    if (userId && freeCheck.reason === "first_free") {
      await markFreeGenerationUsed(userId).catch(() => {});
    }

    // Track generation complete
    await trackFunnelEvent({
      event: "generate_complete",
      sessionId,
      userId,
      anonymousId,
      trackId: result.songId,
    }).catch(() => {});

    // Return audio as base64
    return NextResponse.json({
      success: true,
      mode,
      style,
      audio: finalAudio.toString("base64"),
      songId: result.songId,
      format: "mp3",
      durationMs,
      isWatermarked,
      freeGenerationsRemaining: freeCheck.remainingFree,
    });

  } catch (error) {
    console.error("Music generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate music";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Detect platform from request
 */
function detectPlatform(
  request: NextRequest
): "telegram_miniapp" | "web" | "mcp" | "api" {
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";

  if (referer.includes("telegram") || userAgent.includes("Telegram")) {
    return "telegram_miniapp";
  }
  if (userAgent.includes("MCP") || userAgent.includes("claude")) {
    return "mcp";
  }
  if (
    userAgent.includes("curl") ||
    userAgent.includes("axios") ||
    !referer
  ) {
    return "api";
  }
  return "web";
}

// Get available styles and options
export async function GET() {
  return NextResponse.json({
    modes: [
      { id: "prompt", description: "Generate from text description" },
      { id: "beat", description: "Generate instrumental beat in a style" },
      { id: "song", description: "Generate full song with lyrics" },
      {
        id: "viral",
        description: "Master DJ viral generation with Loop-First optimization",
        params: {
          theme: "Required - topic/mood for the track",
          style: "Music style (phonk, trap, drill, kphonk recommended)",
          targetViralScore: "Minimum viral score to achieve (default: 50)",
          includeMusic: "Generate music along with lyrics (default: false)",
        },
      },
    ],
    styles: Object.entries(MUSIC_STYLES).map(([id, traits]) => ({
      id,
      traits,
      viral: ["phonk", "kphonk", "trap", "drill"].includes(id),
    })),
    viralStyles: ["phonk", "kphonk", "trap", "drill"],
    limits: {
      minDurationMs: 3000,
      maxDurationMs: 600000,
      defaultDurationMs: 60000,
    },
    viralMetrics: {
      repetitionRatio: "Target: 40%+ (words that repeat)",
      hookScore: "Target: 5+ (repeated 2-5 word phrases)",
      shortLineRatio: "Target: 60%+ (lines ≤6 words)",
      firstLinePunch: "First line ≤8 words, high impact",
    },
  });
}
