/**
 * Voice Generation with ElevenLabs
 */

import { ElevenLabsClient } from "elevenlabs";

let client: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient {
  if (!client) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }
    client = new ElevenLabsClient({ apiKey });
  }
  return client;
}

// Popular voice IDs from ElevenLabs
export const VOICES = {
  adam: "pNInz6obpgDQGcFmaJgB", // Deep male
  rachel: "21m00Tcm4TlvDq8ikWAM", // Calm female
  domi: "AZnzlk1XvdvUeBnXmlld", // Energetic female
  bella: "EXAVITQu4vr4xnSDxMaL", // Soft female
  antoni: "ErXwobaYiN019PkySvjV", // Warm male
  josh: "TxGEqnHWrfWFTfGW9XjX", // Casual male
  arnold: "VR6AewLTigWG4xSOukaG", // Strong male
  sam: "yoZ06aMxZJJ28mfd3POQ", // Narrator
} as const;

export type VoiceId = keyof typeof VOICES;

/**
 * Generate speech from text
 */
export async function generateSpeech(
  text: string,
  voiceId: VoiceId = "adam",
  options: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
  } = {}
): Promise<Buffer> {
  const elevenlabs = getClient();

  const audioStream = await elevenlabs.textToSpeech.convert(
    VOICES[voiceId],
    {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.5,
        use_speaker_boost: true,
      },
    }
  );

  // Convert stream to buffer
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Get available voices
 */
export async function getVoices(): Promise<
  Array<{
    id: string;
    name: string;
    category: string;
    description: string;
  }>
> {
  const elevenlabs = getClient();

  const response = await elevenlabs.voices.getAll();

  return response.voices.map((voice) => ({
    id: voice.voice_id,
    name: voice.name || "Unknown",
    category: String(voice.category || "generated"),
    description: voice.description || "",
  }));
}

/**
 * Clone a voice from audio sample
 * Note: Voice cloning requires ElevenLabs Pro subscription
 */
export async function cloneVoice(
  name: string,
  description: string,
  audioFiles: Blob[]
): Promise<string> {
  const elevenlabs = getClient();

  const response = await elevenlabs.voices.add({
    name,
    description,
    files: audioFiles as unknown as File[],
  });

  return response.voice_id;
}

/**
 * Generate speech for lyrics (with natural pacing)
 */
export async function generateLyricsSpeech(
  lyrics: string,
  voiceId: VoiceId = "adam"
): Promise<Buffer> {
  // Add SSML-style pauses for natural flow
  const processedLyrics = lyrics
    .replace(/\[.*?\]/g, "") // Remove section markers
    .replace(/\n\n/g, " ... ") // Add pauses between sections
    .replace(/\n/g, ", "); // Add brief pauses between lines

  return generateSpeech(processedLyrics, voiceId, {
    stability: 0.4, // More expressive
    similarityBoost: 0.8,
    style: 0.7, // More stylized delivery
  });
}
