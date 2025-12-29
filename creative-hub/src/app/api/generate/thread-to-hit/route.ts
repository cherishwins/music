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
import { generateBeatBase64, downloadAudioAsBase64 } from "@/lib/beats";
import { mixTrack } from "@/lib/mixer";
import { uploadTrack, generateTrackFilename } from "@/lib/storage";

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
      includeBeat = false,
      beatStyle = "hiphop",
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

    // Generate beat if requested (uses Replicate/MusicGen)
    let beatBuffer: Buffer | undefined;
    if (includeBeat && process.env.REPLICATE_API_TOKEN) {
      try {
        const beatBase64 = await generateBeatBase64({
          prompt: `${result.title} - motivational anthem`,
          duration: 30,
          bpm: 120,
          style: beatStyle as "trap" | "lofi" | "edm" | "cinematic" | "hiphop",
        });
        beatBuffer = Buffer.from(beatBase64, "base64");
      } catch (beatError) {
        console.error("Beat generation failed:", beatError);
        // Continue without beat - don't fail the whole request
      }
    }

    // Mix voice + beat into final production track
    let finalBuffer: Buffer = result.mainAudio;
    if (beatBuffer) {
      try {
        finalBuffer = await mixTrack(result.mainAudio, beatBuffer, {
          voiceVolume: 1.0,
          beatVolume: 0.4,
          normalize: true,
          fadeIn: 0.3,
          fadeOut: 2.0,
        });
        console.log("Mixed track created:", finalBuffer.length, "bytes");
      } catch (mixError) {
        console.error("Mixing failed, using voice only:", mixError);
        finalBuffer = result.mainAudio;
      }
    }

    // Upload to storage if BLOB token is configured
    let downloadUrl: string | undefined;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const filename = generateTrackFilename(result.title, "final");
        const stored = await uploadTrack(finalBuffer, filename);
        downloadUrl = stored.downloadUrl;
        console.log("Track uploaded:", downloadUrl);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        // Fall back to base64 response
      }
    }

    // Return with download URL if available, otherwise base64
    return NextResponse.json({
      title: result.title,
      lyrics: result.lyrics,
      downloadUrl, // Direct download link for customer!
      audio: downloadUrl ? undefined : {
        main: result.mainAudio.toString("base64"),
        intro: result.introAudio?.toString("base64"),
        outro: result.outroAudio?.toString("base64"),
        beat: beatBuffer?.toString("base64"),
        final: finalBuffer.toString("base64"),
      },
      format: "mp3",
      voice,
      style,
      language: language || "en",
      hasBeat: !!beatBuffer,
      isMixed: !!beatBuffer,
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
