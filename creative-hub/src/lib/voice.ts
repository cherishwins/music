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

/**
 * Create a composition plan from a text prompt
 * THIS IS FREE - NO CREDITS USED
 * Use this to iterate on song structure before generating
 */
export async function createCompositionPlan(
  prompt: string,
  options: {
    durationMs?: number;  // 3000 - 300000 (3s to 5min)
  } = {}
): Promise<CompositionPlan> {
  const apiKey = getApiKey();

  const response = await fetch(`${ELEVENLABS_API_BASE}/music/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt,
      music_length_ms: options.durationMs ?? 120000, // Default 2 min
      model_id: "music_v1",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Composition plan error: ${response.status} - ${error}`);
  }

  const plan = await response.json();

  // Normalize the response to our interface (API uses camelCase)
  return {
    positive_global_styles: plan.positiveGlobalStyles || plan.positive_global_styles || [],
    negative_global_styles: plan.negativeGlobalStyles || plan.negative_global_styles || [],
    sections: (plan.sections || []).map((section: {
      sectionName?: string;
      section_name?: string;
      positiveLocalStyles?: string[];
      positive_local_styles?: string[];
      negativeLocalStyles?: string[];
      negative_local_styles?: string[];
      durationMs?: number;
      duration_ms?: number;
      lines?: string[];
    }) => ({
      section_name: section.sectionName || section.section_name || "Section",
      positive_local_styles: section.positiveLocalStyles || section.positive_local_styles || [],
      negative_local_styles: section.negativeLocalStyles || section.negative_local_styles || [],
      duration_ms: section.durationMs || section.duration_ms || 30000,
      lines: section.lines || [],
    })),
  };
}

/**
 * Validate a composition plan before generation
 * Returns issues if any are found
 */
export function validateCompositionPlan(plan: CompositionPlan): {
  valid: boolean;
  issues: string[];
  totalDurationMs: number;
} {
  const issues: string[] = [];

  // Check global styles
  if (!plan.positive_global_styles || plan.positive_global_styles.length === 0) {
    issues.push("Missing positive global styles");
  }

  // Check sections
  if (!plan.sections || plan.sections.length === 0) {
    issues.push("No sections defined");
  }

  // Calculate total duration
  const totalDurationMs = plan.sections.reduce((sum, s) => sum + s.duration_ms, 0);

  // Check duration limits
  if (totalDurationMs < 3000) {
    issues.push("Total duration too short (minimum 3 seconds)");
  }
  if (totalDurationMs > 300000) {
    issues.push("Total duration too long (maximum 5 minutes)");
  }

  // Check each section
  plan.sections.forEach((section, i) => {
    if (!section.section_name) {
      issues.push(`Section ${i + 1}: Missing section name`);
    }
    if (section.duration_ms < 1000) {
      issues.push(`Section ${i + 1} (${section.section_name}): Duration too short`);
    }
    if (section.duration_ms > 60000) {
      issues.push(`Section ${i + 1} (${section.section_name}): Duration over 60s may have issues`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    totalDurationMs,
  };
}

// Music generation styles - GRAMMY-LEVEL PRODUCTION TEMPLATES
export const MUSIC_STYLES = {
  // Hip-hop/Trap styles - Pro production
  trap: [
    "trap",
    "808 sub bass with distortion",
    "crisp hi-hats with rolls",
    "dark ambient pads",
    "professional mixing",
    "Metro Boomin style production",
    "punchy kick drums",
    "modern trap melodies",
  ],
  boombap: [
    "boom bap",
    "90s hip hop",
    "vinyl sample chops with warmth",
    "jazzy piano loops",
    "dusty drum breaks",
    "J Dilla inspired",
    "soulful samples",
    "classic hip hop production",
  ],
  gfunk: [
    "g-funk",
    "west coast",
    "talk box synths",
    "funky bass lines",
    "Dr. Dre style",
    "smooth synth pads",
    "bouncy drums",
    "California vibes",
  ],
  drill: [
    "UK drill",
    "sliding 808 bass",
    "dark minor key piano",
    "aggressive delivery",
    "808 Melo style",
    "eerie melodies",
    "hard hitting drums",
    "London sound",
  ],

  // Phonk - TikTok Viral (31 BILLION views)
  phonk: [
    "phonk",
    "Memphis rap samples",
    "dark cowbell patterns",
    "aggressive 808 bass",
    "drift culture aesthetic",
    "Russian phonk influence",
    "distorted kicks",
    "lo-fi dark atmosphere",
    "hard-hitting drops",
    "TikTok viral energy",
  ],
  kphonk: [
    "K-phonk",
    "Korean phonk fusion",
    "aggressive 808s",
    "K-pop melodic hooks",
    "Seoul street racing vibes",
    "dark synth layers",
    "Memphis meets Korea",
    "viral TikTok sound",
  ],

  // Soul/R&B - Premium quality
  rnb: [
    "R&B",
    "smooth neo-soul",
    "lush Rhodes piano",
    "warm bass",
    "live drums feel",
    "romantic",
    "The Weeknd production style",
    "silky vocals",
    "professional mix",
  ],
  soul: [
    "soul music",
    "gospel piano chords",
    "organ",
    "live band feel",
    "emotional vocals",
    "Motown inspired",
    "strings section",
    "warm analog sound",
  ],

  // Electronic styles - Festival ready
  edm: [
    "EDM",
    "electronic",
    "massive synth drops",
    "energetic build-ups",
    "festival ready",
    "punchy sidechain compression",
    "euphoric melodies",
    "professional mastering",
  ],
  lofi: [
    "lo-fi hip hop",
    "chill beats",
    "vinyl crackle texture",
    "jazz samples",
    "mellow piano",
    "relaxing atmosphere",
    "study music",
    "warm analog filters",
  ],
  synthwave: [
    "synthwave",
    "80s retro",
    "analog synthesizers",
    "neon aesthetic",
    "driving arpeggios",
    "The Midnight style",
    "nostalgic melodies",
    "polished production",
  ],

  // Pop - Radio ready
  pop: [
    "pop",
    "catchy hooks",
    "radio-friendly production",
    "upbeat energy",
    "Max Martin style",
    "polished vocals",
    "memorable melodies",
    "chart-ready mix",
  ],

  // Rock/Alternative
  rock: [
    "rock",
    "electric guitars",
    "powerful drums",
    "energetic performance",
    "stadium rock feel",
    "guitar solos",
    "anthemic chorus",
    "live band sound",
  ],

  // Cinematic - Epic production
  cinematic: [
    "cinematic",
    "orchestral arrangement",
    "epic strings",
    "dramatic brass",
    "Hans Zimmer inspired",
    "powerful percussion",
    "emotional crescendos",
    "film score quality",
    "grand piano",
  ],

  // NEW: Premium production styles
  piano: [
    "piano ballad",
    "grand piano",
    "emotional",
    "intimate performance",
    "classical influence",
    "Adele style production",
    "strings accompaniment",
    "powerful vocals",
    "Grammy-quality mixing",
  ],
  gospel: [
    "gospel",
    "church organ",
    "choir harmonies",
    "powerful vocals",
    "uplifting",
    "spiritual",
    "Kirk Franklin style",
    "live band feel",
    "emotional delivery",
  ],
  afrobeats: [
    "afrobeats",
    "Nigerian pop",
    "danceable rhythms",
    "afro-fusion",
    "Burna Boy style",
    "tropical percussion",
    "guitar licks",
    "infectious groove",
  ],
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

    // Determine section-specific style (copy to mutable array)
    const localStyles: string[] = [...styleTraits];
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
      positive_local_styles: [...styleTraits],
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
 * Uses composition plans for Grammy-level control
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

  // Step 3: Build a composition plan for Grammy-level control
  const compositionPlan = buildCompositionPlan(story, lyrics, musicStyle, options.durationMs);

  console.log("[ThreadToHit] Generating song with ElevenLabs Music API...");
  console.log("[ThreadToHit] Style:", musicStyle, "Duration:", options.durationMs ?? 120000, "ms");
  console.log("[ThreadToHit] Using composition plan with", compositionPlan.sections.length, "sections");

  // Step 4: Generate with composition plan for pro-level output
  const result = await composeMusicWithPlan(compositionPlan, {
    respectDurations: true,
  });

  console.log("[ThreadToHit] Song generated successfully!");

  return {
    mainAudio: result.audio,
    introAudio: undefined,
    outroAudio: undefined,
    title: story.title,
    lyrics,
    songId: result.songId,
  };
}

/**
 * Build a professional composition plan from story and lyrics
 */
function buildCompositionPlan(
  story: { title: string; hook: string; theme: string },
  lyrics: string,
  style: MusicStyle,
  durationMs?: number
): CompositionPlan {
  const styleTraits = MUSIC_STYLES[style];
  const totalDuration = durationMs ?? 120000;

  // Get negative styles (what to avoid)
  const negativeStyles = getNegativeStyles(style);

  // Parse lyrics into sections
  const sections = parseLyricsIntoSections(lyrics, style, totalDuration);

  return {
    positive_global_styles: [
      ...styleTraits.slice(0, 6),
      "professional mixing",
      "Grammy-quality production",
      "clear powerful vocals",
    ],
    negative_global_styles: negativeStyles,
    sections,
  };
}

/**
 * Get negative styles to avoid based on the chosen style
 */
function getNegativeStyles(style: MusicStyle): string[] {
  const negativeMap: Record<string, string[]> = {
    trap: ["acoustic", "soft", "classical", "country", "jazz", "minimal"],
    drill: ["happy", "upbeat", "acoustic", "soft", "country"],
    boombap: ["EDM", "dubstep", "country", "classical", "modern trap"],
    piano: ["aggressive", "trap", "EDM", "heavy drums", "electronic"],
    rnb: ["aggressive", "trap heavy", "rock", "country", "EDM"],
    gospel: ["dark", "aggressive", "trap", "EDM", "metal"],
    cinematic: ["lo-fi", "trap", "punk", "minimal"],
    afrobeats: ["dark", "aggressive", "slow", "classical"],
    pop: ["dark", "aggressive", "underground", "experimental"],
    soul: ["electronic", "EDM", "trap", "aggressive"],
    lofi: ["aggressive", "EDM", "intense", "fast tempo"],
    phonk: ["happy", "upbeat", "acoustic", "soft", "jazz", "classical", "clean"],
    kphonk: ["happy", "soft", "acoustic", "classical", "country", "jazz"],
  };

  return negativeMap[style] || ["low quality", "amateur", "distorted"];
}

/**
 * Parse lyrics into proper song sections for the composition plan
 */
function parseLyricsIntoSections(
  lyrics: string,
  style: MusicStyle,
  totalDurationMs: number
): SongSection[] {
  const sections: SongSection[] = [];
  const styleTraits = MUSIC_STYLES[style];

  // Try to extract sections from markdown-formatted lyrics
  const sectionRegex = /\*\*\[(.*?)\]\*\*\s*([\s\S]*?)(?=\*\*\[|$)/g;
  let match;
  const parsedSections: { name: string; lines: string[] }[] = [];

  while ((match = sectionRegex.exec(lyrics)) !== null) {
    const sectionName = match[1].trim();
    const sectionContent = match[2].trim();
    const lines = sectionContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    if (lines.length > 0) {
      parsedSections.push({ name: sectionName, lines: lines.slice(0, 8) }); // Max 8 lines per section
    }
  }

  // If no sections found, create default structure
  if (parsedSections.length === 0) {
    const allLines = lyrics.split('\n').filter(line =>
      line.trim() &&
      !line.startsWith('#') &&
      !line.startsWith('**') &&
      !line.startsWith('[')
    );

    // Create a simple structure
    parsedSections.push(
      { name: "Intro", lines: ["[Instrumental intro building atmosphere]"] },
      { name: "Verse 1", lines: allLines.slice(0, 6) },
      { name: "Hook", lines: allLines.slice(6, 10) },
      { name: "Verse 2", lines: allLines.slice(10, 16) },
      { name: "Hook", lines: allLines.slice(6, 10) }, // Repeat hook
      { name: "Outro", lines: ["[Song fades with final hook]"] }
    );
  }

  // Calculate duration per section
  const durationPerSection = Math.floor(totalDurationMs / parsedSections.length);

  // Build sections with proper styles
  for (const parsed of parsedSections) {
    const localStyles = getSectionStyles(parsed.name, styleTraits);

    sections.push({
      section_name: parsed.name,
      positive_local_styles: localStyles.positive,
      negative_local_styles: localStyles.negative,
      duration_ms: Math.min(durationPerSection, 45000), // Max 45s per section
      lines: parsed.lines,
    });
  }

  return sections;
}

/**
 * Get appropriate styles for each section type
 */
function getSectionStyles(
  sectionName: string,
  globalStyles: readonly string[]
): { positive: string[]; negative: string[] } {
  const name = sectionName.toLowerCase();

  if (name.includes('intro')) {
    return {
      positive: ["building tension", "atmospheric", "filtered", ...globalStyles.slice(0, 3)],
      negative: ["full drums", "maximum energy"],
    };
  }

  if (name.includes('hook') || name.includes('chorus')) {
    return {
      positive: ["catchy melody", "memorable", "full production", "anthemic", ...globalStyles.slice(0, 4)],
      negative: ["sparse", "spoken word only", "quiet"],
    };
  }

  if (name.includes('verse')) {
    return {
      positive: ["rhythmic", "clear vocals", "driving beat", ...globalStyles.slice(0, 4)],
      negative: ["too busy", "overshadowing vocals"],
    };
  }

  if (name.includes('bridge')) {
    return {
      positive: ["emotional shift", "stripped back", "building to climax"],
      negative: ["same as verse", "full production"],
    };
  }

  if (name.includes('outro')) {
    return {
      positive: ["triumphant finale", "resolution", "fading elements"],
      negative: ["abrupt ending", "building tension"],
    };
  }

  // Default
  return {
    positive: [...globalStyles.slice(0, 5)],
    negative: ["off-beat", "low quality"],
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
 * Build a Grammy-level prompt for the music API
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
    .replace(/\[.*?\]/g, "") // Remove section markers for cleaner prompt
    .substring(0, 1800); // API has limits

  // Build a detailed, professional prompt
  return [
    // Production style
    `Create a ${styleTraits.slice(0, 5).join(", ")} song.`,
    "",
    // Professional production requirements
    "PRODUCTION REQUIREMENTS:",
    "- Grammy-quality mixing and mastering",
    "- Clear, powerful vocals in the mix",
    "- Professional arrangement with intro, verses, hooks, and outro",
    "- Punchy drums and clean bass",
    "- Emotional dynamics throughout",
    "",
    // Style details
    `STYLE: ${styleTraits.join(", ")}`,
    "",
    // Theme and hook
    `SONG THEME: ${story.theme || story.title}`,
    `MAIN HOOK: "${story.hook}"`,
    "",
    // Lyrics
    "LYRICS TO SING:",
    cleanedLyrics,
    "",
    // Final instructions
    "Make this a radio-ready hit with memorable melodies, powerful delivery, and professional production quality.",
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
