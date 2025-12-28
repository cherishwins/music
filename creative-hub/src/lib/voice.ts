/**
 * Voice Generation with ElevenLabs
 * Using direct API calls for reliability
 */

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }
  return apiKey;
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
 * Generate speech from text using direct API call
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
  const apiKey = getApiKey();

  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${VOICES[voiceId]}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`);
  }

  const data = await response.json();

  return data.voices.map((voice: { voice_id: string; name?: string; category?: string; description?: string }) => ({
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
  const apiKey = getApiKey();

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  audioFiles.forEach((file, i) => formData.append(`files`, file, `sample${i}.mp3`));

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voice cloning error: ${error}`);
  }

  const data = await response.json();
  return data.voice_id;
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
