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

// ============================================
// MUSIC COMPOSITION (ElevenLabs Music API)
// ============================================

// Music generation styles
export const MUSIC_STYLES = {
  // Hip-hop/Trap styles
  trap: ["trap", "808 bass", "hi-hats", "dark atmosphere"],
  boombap: ["boom bap", "90s hip hop", "vinyl samples", "jazzy"],
  gfunk: ["g-funk", "west coast", "synth pads", "funky bass"],
  drill: ["drill", "sliding 808s", "dark piano", "aggressive"],

  // Electronic styles
  edm: ["EDM", "electronic", "synth drops", "energetic"],
  lofi: ["lo-fi", "chill", "dusty samples", "relaxing"],
  synthwave: ["synthwave", "80s retro", "analog synths", "neon"],

  // Other genres
  rnb: ["R&B", "smooth", "soulful", "romantic"],
  pop: ["pop", "catchy", "radio-friendly", "upbeat"],
  rock: ["rock", "guitar driven", "drums", "energetic"],
  cinematic: ["cinematic", "orchestral", "epic", "dramatic"],
} as const;

export type MusicStyle = keyof typeof MUSIC_STYLES;

// Song section types
export interface SongSection {
  section_name: string;
  positive_local_styles: string[];
  negative_local_styles: string[];
  duration_ms: number;
  lines: string[];  // lyrics
}

export interface CompositionPlan {
  positive_global_styles: string[];
  negative_global_styles: string[];
  sections: SongSection[];
}

/**
 * Compose music from a simple text prompt
 * Best for quick instrumental generation
 */
export async function composeMusic(
  prompt: string,
  options: {
    durationMs?: number;        // 3000 - 600000 (3s to 10min)
    instrumental?: boolean;      // Force no vocals
    outputFormat?: string;       // mp3_44100_128, mp3_44100_192, etc
  } = {}
): Promise<{ audio: Buffer; songId?: string }> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_BASE}/music`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt,
      music_length_ms: options.durationMs ?? 60000, // Default 1 minute
      model_id: "music_v1",
      force_instrumental: options.instrumental ?? false,
      respect_sections_durations: true,
      store_for_inpainting: false,
      sign_with_c2pa: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Music composition error: ${response.status} - ${error}`);
  }

  // Get song ID from response headers for potential remixing
  const songId = response.headers.get("x-song-id") || undefined;

  const arrayBuffer = await response.arrayBuffer();
  return {
    audio: Buffer.from(arrayBuffer),
    songId,
  };
}

/**
 * Compose music with a detailed composition plan
 * For full control over sections, styles, and lyrics
 */
export async function composeMusicWithPlan(
  plan: CompositionPlan,
  options: {
    respectDurations?: boolean;  // Strict timing vs flexible
    outputFormat?: string;
  } = {}
): Promise<{ audio: Buffer; songId?: string }> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_BASE}/music`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      composition_plan: plan,
      model_id: "music_v1",
      respect_sections_durations: options.respectDurations ?? true,
      store_for_inpainting: false,
      sign_with_c2pa: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Music composition error: ${response.status} - ${error}`);
  }

  const songId = response.headers.get("x-song-id") || undefined;
  const arrayBuffer = await response.arrayBuffer();

  return {
    audio: Buffer.from(arrayBuffer),
    songId,
  };
}

/**
 * Generate a full song with lyrics in a specific style
 * Combines our skills system with ElevenLabs Music
 */
export async function generateFullSong(
  lyrics: string,
  style: MusicStyle = "trap",
  options: {
    durationMs?: number;
    bpm?: number;
  } = {}
): Promise<{ audio: Buffer; songId?: string }> {

  // Parse lyrics into sections
  const sections = parseLyricsToSections(lyrics, style);

  // Build composition plan
  const plan: CompositionPlan = {
    positive_global_styles: [
      ...MUSIC_STYLES[style],
      options.bpm ? `${options.bpm} BPM` : "120 BPM",
      "professional mix",
      "high quality",
    ],
    negative_global_styles: [
      "amateur",
      "low quality",
      "distorted",
      "off-key",
    ],
    sections,
  };

  return composeMusicWithPlan(plan, { respectDurations: false });
}

/**
 * Parse lyrics text into song sections for composition plan
 */
function parseLyricsToSections(lyrics: string, style: MusicStyle): SongSection[] {
  const sections: SongSection[] = [];
  const styleTraits = MUSIC_STYLES[style];

  // Split by section markers like [Verse 1], [Hook], etc.
  const sectionRegex = /\[(.*?)\]([\s\S]*?)(?=\[|$)/g;
  let match;

  while ((match = sectionRegex.exec(lyrics)) !== null) {
    const sectionName = match[1].trim();
    const sectionLyrics = match[2].trim();
    const lines = sectionLyrics.split('\n').filter(line => line.trim());

    // Determine section-specific style
    let localStyles = [...styleTraits];
    const lowerName = sectionName.toLowerCase();

    if (lowerName.includes('hook') || lowerName.includes('chorus')) {
      localStyles.push("catchy", "melodic", "memorable");
    } else if (lowerName.includes('verse')) {
      localStyles.push("rhythmic", "driving");
    } else if (lowerName.includes('bridge')) {
      localStyles.push("building", "transition", "emotional");
    } else if (lowerName.includes('intro')) {
      localStyles.push("building", "ambient intro");
    } else if (lowerName.includes('outro')) {
      localStyles.push("fading", "resolution");
    }

    // Estimate duration based on line count (roughly 3-4 seconds per line)
    const estimatedDuration = Math.max(10000, lines.length * 3500);

    sections.push({
      section_name: sectionName,
      positive_local_styles: localStyles,
      negative_local_styles: ["off-beat", "clashing"],
      duration_ms: Math.min(estimatedDuration, 60000), // Cap at 60s per section
      lines: lines.slice(0, 10), // ElevenLabs has limits
    });
  }

  // If no sections found, treat entire lyrics as one section
  if (sections.length === 0) {
    const lines = lyrics.split('\n').filter(line => line.trim() && !line.startsWith('['));
    sections.push({
      section_name: "Main",
      positive_local_styles: styleTraits,
      negative_local_styles: ["off-beat"],
      duration_ms: Math.min(lines.length * 3500, 180000),
      lines: lines.slice(0, 20),
    });
  }

  return sections;
}

/**
 * Quick instrumental beat generation
 * Uses producer skill prompts for style-specific beats
 */
export async function generateBeat(
  style: MusicStyle,
  options: {
    durationMs?: number;
    mood?: string;
    tempo?: string;
  } = {}
): Promise<{ audio: Buffer; songId?: string }> {
  const styleTraits = MUSIC_STYLES[style];

  const prompt = [
    `${styleTraits.join(", ")} instrumental beat`,
    options.mood ? `${options.mood} mood` : "",
    options.tempo ? `${options.tempo} tempo` : "120 BPM",
    "professional quality",
    "clean mix",
    "no vocals",
  ].filter(Boolean).join(", ");

  return composeMusic(prompt, {
    durationMs: options.durationMs ?? 90000, // 1.5 min default for beats
    instrumental: true,
  });
}

// ============================================
// THREAD-TO-HIT PIPELINE (ElevenLabs Music API)
// ============================================

/**
 * Complete Thread-to-Hit pipeline
 * Generates REAL SONGS with vocals + music using ElevenLabs Music API
 */
export async function threadToHitAudio(
  content: string,
  options: {
    voice?: VoiceId;           // Not used in music mode, kept for backwards compat
    style?: VoicePreset;       // Maps to music style
    language?: LanguageCode;   // Not used in music mode
    includeIntro?: boolean;
    includeOutro?: boolean;
    musicStyle?: MusicStyle;   // Trap, boom bap, drill, etc.
    durationMs?: number;       // Song length
  } = {}
): Promise<{
  mainAudio: Buffer;
  introAudio?: Buffer;
  outroAudio?: Buffer;
  title: string;
  lyrics: string;
  songId?: string;
}> {
  // Import AI module for content generation
  const { extractStory, generateLyrics } = await import("./ai");

  // Step 1: Extract story and generate lyrics with Claude
  console.log("[ThreadToHit] Extracting story from content...");
  const story = await extractStory(content);
  console.log("[ThreadToHit] Story extracted:", story.title);

  console.log("[ThreadToHit] Generating lyrics...");
  const lyrics = await generateLyrics(story);
  console.log("[ThreadToHit] Lyrics generated:", lyrics.substring(0, 100) + "...");

  // Step 2: Determine music style from options or voice preset
  const musicStyle = options.musicStyle ?? getMusicStyleFromPreset(options.style);
  const styleTraits = MUSIC_STYLES[musicStyle];

  // Step 3: Build the song prompt with lyrics + style
  const songPrompt = buildSongPrompt(story, lyrics, styleTraits, options);

  console.log("[ThreadToHit] Generating song with ElevenLabs Music API...");
  console.log("[ThreadToHit] Style:", musicStyle, "Duration:", options.durationMs ?? 120000, "ms");

  // Step 4: Generate the actual song with vocals + music
  const result = await composeMusic(songPrompt, {
    durationMs: options.durationMs ?? 120000, // 2 minutes default
    instrumental: false,
  });

  console.log("[ThreadToHit] Song generated successfully!");

  return {
    mainAudio: result.audio,
    introAudio: undefined,  // ElevenLabs handles intros
    outroAudio: undefined,  // ElevenLabs handles outros
    title: story.title,
    lyrics,
    songId: result.songId,
  };
}

/**
 * Map voice presets to music styles
 */
function getMusicStyleFromPreset(preset?: VoicePreset): MusicStyle {
  switch (preset) {
    case "hype":
    case "intense":
      return "trap";
    case "emotional":
      return "rnb";
    case "narration":
      return "cinematic";
    default:
      return "trap";
  }
}

/**
 * Build a rich prompt for the music API
 */
function buildSongPrompt(
  story: { title: string; hook: string; theme: string },
  lyrics: string,
  styleTraits: readonly string[],
  options: { durationMs?: number }
): string {
  // Clean lyrics for prompt
  const cleanedLyrics = lyrics
    .replace(/\*\*/g, "")
    .replace(/#{1,3}\s*/g, "")
    .substring(0, 2000); // API has limits

  return [
    `${styleTraits.join(", ")} song.`,
    `Theme: ${story.theme || story.title}`,
    `Hook: "${story.hook}"`,
    "",
    "Lyrics:",
    cleanedLyrics,
    "",
    "Style: Professional mix, powerful vocals, radio-quality production.",
    "Make it a hit song with catchy hooks and hard-hitting beats.",
  ].join("\n");
}

/**
 * Quick song generation from a simple prompt
 * For when you just want a song without the full pipeline
 */
export async function quickSong(
  description: string,
  options: {
    style?: MusicStyle;
    durationMs?: number;
    lyrics?: string;
  } = {}
): Promise<{ audio: Buffer; songId?: string }> {
  const style = options.style ?? "trap";
  const styleTraits = MUSIC_STYLES[style];

  const prompt = options.lyrics
    ? `${styleTraits.join(", ")} song. ${description}\n\nLyrics:\n${options.lyrics}`
    : `${styleTraits.join(", ")} song. ${description}. Make it catchy with memorable hooks.`;

  return composeMusic(prompt, {
    durationMs: options.durationMs ?? 90000,
    instrumental: false,
  });
}
