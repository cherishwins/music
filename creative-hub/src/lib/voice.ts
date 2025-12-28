/**
 * Voice Generation with ElevenLabs
 * Using direct API calls for maximum quality
 */

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

// Supported languages for multilingual v2 model
export const LANGUAGES = {
  en: "English",
  ko: "Korean",
  ja: "Japanese",
  zh: "Chinese",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  pl: "Polish",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Audio quality presets
export const AUDIO_FORMATS = {
  standard: "mp3_44100_128",    // Good quality, smaller file
  high: "mp3_44100_192",        // Highest MP3 quality
  lossless: "pcm_44100",        // Lossless PCM
} as const;

export type AudioFormat = keyof typeof AUDIO_FORMATS;

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }
  return apiKey;
}

// Voice presets optimized for different content types
export const VOICES = {
  // Powerful voices for spoken word/rap
  adam: "pNInz6obpgDQGcFmaJgB",      // Deep male - great for hype content
  arnold: "VR6AewLTigWG4xSOukaG",   // Strong male - powerful delivery
  josh: "TxGEqnHWrfWFTfGW9XjX",     // Casual male - authentic vibe

  // Smooth voices for narration
  sam: "yoZ06aMxZJJ28mfd3POQ",      // Narrator - professional
  antoni: "ErXwobaYiN019PkySvjV",   // Warm male - emotional

  // Female voices
  rachel: "21m00Tcm4TlvDq8ikWAM",   // Calm female - soothing
  domi: "AZnzlk1XvdvUeBnXmlld",     // Energetic female - dynamic
  bella: "EXAVITQu4vr4xnSDxMaL",    // Soft female - gentle
} as const;

export type VoiceId = keyof typeof VOICES;

// Voice setting presets for different content styles
export const VOICE_PRESETS = {
  // For hype/motivational spoken word
  hype: {
    stability: 0.3,           // More dynamic, expressive
    similarityBoost: 0.85,    // Stay close to voice character
    style: 0.8,               // Maximum style/emotion
    speed: 1.05,              // Slightly faster, energetic
  },
  // For emotional storytelling
  emotional: {
    stability: 0.4,
    similarityBoost: 0.9,
    style: 0.7,
    speed: 0.95,              // Slightly slower, more weight
  },
  // For clean narration
  narration: {
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0.4,
    speed: 1.0,
  },
  // For aggressive/intense delivery
  intense: {
    stability: 0.25,
    similarityBoost: 0.9,
    style: 0.9,
    speed: 1.1,
  },
} as const;

export type VoicePreset = keyof typeof VOICE_PRESETS;

/**
 * Generate high-quality speech from text
 */
export async function generateSpeech(
  text: string,
  voiceId: VoiceId = "adam",
  options: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    speed?: number;
    preset?: VoicePreset;
    language?: LanguageCode;
    quality?: AudioFormat;
  } = {}
): Promise<Buffer> {
  const apiKey = getApiKey();

  // Use preset if provided, otherwise use individual settings
  const settings = options.preset
    ? VOICE_PRESETS[options.preset]
    : {
        stability: options.stability ?? 0.5,
        similarityBoost: options.similarityBoost ?? 0.75,
        style: options.style ?? 0.5,
        speed: options.speed ?? 1.0,
      };

  // Default to high quality audio
  const outputFormat = AUDIO_FORMATS[options.quality ?? "high"];

  const response = await fetch(
    `${ELEVENLABS_API_BASE}/text-to-speech/${VOICES[voiceId]}?output_format=${outputFormat}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: options.language,
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarityBoost,
          style: settings.style,
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
 * Generate sound effects from text description
 */
export async function generateSoundEffect(
  description: string,
  options: {
    duration?: number;  // seconds
    quality?: AudioFormat;
  } = {}
): Promise<Buffer> {
  const apiKey = getApiKey();
  const outputFormat = AUDIO_FORMATS[options.quality ?? "high"];

  const response = await fetch(
    `${ELEVENLABS_API_BASE}/sound-generation?output_format=${outputFormat}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: description,
        duration_seconds: options.duration,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sound effect error: ${response.status} - ${error}`);
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
 * Generate high-quality spoken word from lyrics
 * Optimized for motivational/hype delivery
 */
export async function generateLyricsSpeech(
  lyrics: string,
  voiceId: VoiceId = "adam",
  options: {
    preset?: VoicePreset;
    language?: LanguageCode;
  } = {}
): Promise<Buffer> {
  // Process lyrics for natural spoken word flow
  const processedLyrics = lyrics
    .replace(/\*\*\[.*?\]\*\*/g, "")   // Remove markdown section headers
    .replace(/\[.*?\]/g, "")           // Remove plain section markers
    .replace(/#{1,3}\s*/g, "")         // Remove markdown headers
    .replace(/\*\*/g, "")              // Remove bold markers
    .replace(/\n\n+/g, " ... ")        // Pauses between sections
    .replace(/\n/g, ", ")              // Brief pauses between lines
    .trim();

  return generateSpeech(processedLyrics, voiceId, {
    preset: options.preset ?? "hype",
    language: options.language,
    quality: "high",
  });
}

/**
 * Complete Thread-to-Hit pipeline
 * Generates spoken word audio from any text content
 */
export async function threadToHitAudio(
  content: string,
  options: {
    voice?: VoiceId;
    style?: VoicePreset;
    language?: LanguageCode;
    includeIntro?: boolean;
    includeOutro?: boolean;
  } = {}
): Promise<{
  mainAudio: Buffer;
  introAudio?: Buffer;
  outroAudio?: Buffer;
  title: string;
  lyrics: string;
}> {
  // Import AI module for content generation
  const { extractStory, generateLyrics } = await import("./ai");

  // Step 1: Extract story and generate lyrics with Claude
  const story = await extractStory(content);
  const lyrics = await generateLyrics(story);

  // Step 2: Generate main spoken word audio
  const mainAudio = await generateLyricsSpeech(
    lyrics,
    options.voice ?? "adam",
    {
      preset: options.style ?? "hype",
      language: options.language,
    }
  );

  // Step 3: Generate intro sound effect if requested
  let introAudio: Buffer | undefined;
  if (options.includeIntro) {
    introAudio = await generateSoundEffect(
      "Epic cinematic intro whoosh with deep bass hit",
      { duration: 3 }
    );
  }

  // Step 4: Generate outro sound effect if requested
  let outroAudio: Buffer | undefined;
  if (options.includeOutro) {
    outroAudio = await generateSoundEffect(
      "Powerful outro with reverb fade and bass drop",
      { duration: 4 }
    );
  }

  return {
    mainAudio,
    introAudio,
    outroAudio,
    title: story.title,
    lyrics,
  };
}
