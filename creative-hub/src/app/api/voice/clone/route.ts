/**
 * Voice Cloning API
 * Uses ElevenLabs Instant Voice Cloning
 *
 * Requirements:
 * - 1-3 minutes of audio (more isn't better for instant clone)
 * - MP3 128kbps+ or WAV
 * - Clear audio without background noise
 */

import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }
  return apiKey;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const audioFile = formData.get("audio") as File;
    const userId = formData.get("userId") as string;

    // Validate inputs
    if (!name || name.length < 1) {
      return NextResponse.json(
        { error: "Voice name is required" },
        { status: 400 }
      );
    }

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "Audio file must be under 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/m4a",
      "audio/mp4",
    ];
    if (!allowedTypes.includes(audioFile.type) && !audioFile.name.match(/\.(mp3|wav|m4a)$/i)) {
      return NextResponse.json(
        { error: "Audio must be MP3, WAV, or M4A format" },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    // Create FormData for ElevenLabs
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("name", `White Tiger - ${name}`);
    elevenLabsFormData.append("description", description || `Voice clone for ${name}`);
    elevenLabsFormData.append("files", audioFile, audioFile.name);
    elevenLabsFormData.append("remove_background_noise", "true");

    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_API_BASE}/voices/add`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("ElevenLabs voice clone error:", error);

      // Parse common errors
      if (error.includes("subscription")) {
        return NextResponse.json(
          { error: "Voice cloning requires ElevenLabs Pro subscription" },
          { status: 402 }
        );
      }
      if (error.includes("audio")) {
        return NextResponse.json(
          { error: "Audio quality too low. Please upload 1-3 minutes of clear speech." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Voice cloning failed. Please try again with clearer audio." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const voiceId = data.voice_id;

    // If we have a userId, store in database
    if (userId) {
      try {
        const { db } = await import("@/lib/db");
        const { clonedVoices } = await import("@/lib/db/schema");

        await db.insert(clonedVoices).values({
          id: crypto.randomUUID(),
          userId,
          elevenlabsVoiceId: voiceId,
          name,
          description: description || null,
          sampleSizeBytes: audioFile.size,
          status: "ready",
        });
      } catch (dbError) {
        console.error("Failed to store cloned voice:", dbError);
        // Don't fail the request, voice was created successfully
      }
    }

    return NextResponse.json({
      success: true,
      voiceId,
      name,
      message: "Voice cloned successfully! You can now use it for music generation.",
    });
  } catch (error) {
    console.error("Voice cloning error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to clone voice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get user's cloned voices
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      // Return available preset voices
      const { VOICES } = await import("@/lib/voice");
      return NextResponse.json({
        voices: Object.entries(VOICES).map(([key, id]) => ({
          id,
          key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "preset",
        })),
      });
    }

    // Get user's cloned voices from database
    const { db } = await import("@/lib/db");
    const { clonedVoices } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const userVoices = await db
      .select()
      .from(clonedVoices)
      .where(eq(clonedVoices.userId, userId));

    const { VOICES } = await import("@/lib/voice");

    return NextResponse.json({
      voices: [
        // User's cloned voices first
        ...userVoices.map((v) => ({
          id: v.elevenlabsVoiceId,
          key: v.id,
          name: v.name,
          type: "cloned",
          status: v.status,
          createdAt: v.createdAt,
        })),
        // Then preset voices
        ...Object.entries(VOICES).map(([key, id]) => ({
          id,
          key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          type: "preset",
        })),
      ],
    });
  } catch (error) {
    console.error("Get voices error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get voices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Delete a cloned voice
export async function DELETE(request: NextRequest) {
  try {
    const { voiceId, userId } = await request.json();

    if (!voiceId || !userId) {
      return NextResponse.json(
        { error: "voiceId and userId are required" },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    // Get the ElevenLabs voice ID from our database
    const { db } = await import("@/lib/db");
    const { clonedVoices } = await import("@/lib/db/schema");
    const { eq, and } = await import("drizzle-orm");

    const [voice] = await db
      .select()
      .from(clonedVoices)
      .where(and(eq(clonedVoices.id, voiceId), eq(clonedVoices.userId, userId)));

    if (!voice) {
      return NextResponse.json(
        { error: "Voice not found" },
        { status: 404 }
      );
    }

    // Delete from ElevenLabs
    const response = await fetch(
      `${ELEVENLABS_API_BASE}/voices/${voice.elevenlabsVoiceId}`,
      {
        method: "DELETE",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      console.error("Failed to delete voice from ElevenLabs");
    }

    // Delete from our database
    await db
      .delete(clonedVoices)
      .where(eq(clonedVoices.id, voiceId));

    return NextResponse.json({
      success: true,
      message: "Voice deleted successfully",
    });
  } catch (error) {
    console.error("Delete voice error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete voice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
