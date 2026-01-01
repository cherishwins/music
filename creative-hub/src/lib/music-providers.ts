/**
 * Unified Music Generation Providers
 *
 * Multi-provider strategy for resilience and cost optimization:
 * 1. ElevenLabs - Best vocals, highest quality (current)
 * 2. MiniMax - 40x cheaper, S-tier vocals, style transfer
 * 3. ACE-Step - Open source, uncensored, local option
 *
 * @see research/MEME_COIN_RECORD_LABEL.md for full architecture
 */

export type MusicProvider = 'elevenlabs' | 'minimax-fal' | 'minimax-replicate' | 'ace-step';

export interface GenerationRequest {
  prompt: string;
  lyrics?: string;
  genre?: string;
  bpm?: number;
  duration?: number; // seconds
  referenceAudioUrl?: string;
  voiceStyle?: 'male' | 'female' | 'aggressive' | 'melodic';
}

export interface GenerationResult {
  audioUrl: string;
  audioBase64?: string;
  duration: number;
  cost: number;
  provider: MusicProvider;
  metadata?: {
    sampleRate: number;
    bitrate: number;
    format: string;
  };
}

export interface ProviderConfig {
  provider: MusicProvider;
  priority: number; // Lower = higher priority
  enabled: boolean;
  costPerGeneration: number;
  maxDuration: number;
  supportsLyrics: boolean;
  supportsStyleTransfer: boolean;
  uncensored: boolean;
}

/**
 * Provider configuration - order by priority
 */
export const PROVIDERS: ProviderConfig[] = [
  {
    provider: 'elevenlabs',
    priority: 1,
    enabled: !!process.env.ELEVENLABS_API_KEY,
    costPerGeneration: 0.32, // ~$0.08/min * 4 min
    maxDuration: 240, // 4 min
    supportsLyrics: true,
    supportsStyleTransfer: false,
    uncensored: false,
  },
  {
    provider: 'minimax-fal',
    priority: 2,
    enabled: !!process.env.FAL_KEY,
    costPerGeneration: 0.03,
    maxDuration: 300, // 5 min
    supportsLyrics: true,
    supportsStyleTransfer: true,
    uncensored: true, // Chinese provider, looser filters
  },
  {
    provider: 'minimax-replicate',
    priority: 3,
    enabled: !!process.env.REPLICATE_API_TOKEN,
    costPerGeneration: 0.035,
    maxDuration: 60, // 1 min for music-01
    supportsLyrics: true,
    supportsStyleTransfer: true,
    uncensored: true,
  },
  {
    provider: 'ace-step',
    priority: 4,
    enabled: false, // Requires local GPU or RunPod
    costPerGeneration: 0.011, // H100 at $4/hr = 360 songs/hr
    maxDuration: 240, // 4 min
    supportsLyrics: true,
    supportsStyleTransfer: false,
    uncensored: true, // Fully uncensored local
  },
];

/**
 * Get available providers sorted by priority
 */
export function getAvailableProviders(): ProviderConfig[] {
  return PROVIDERS
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get the cheapest available provider
 */
export function getCheapestProvider(): ProviderConfig | null {
  const available = getAvailableProviders();
  if (available.length === 0) return null;

  return available.reduce((cheapest, current) =>
    current.costPerGeneration < cheapest.costPerGeneration ? current : cheapest
  );
}

/**
 * Get the best provider for uncensored content
 */
export function getUncensoredProvider(): ProviderConfig | null {
  return getAvailableProviders().find(p => p.uncensored) || null;
}

/**
 * Cost comparison helper
 */
export function compareCosts(duration: number = 240): Record<MusicProvider, number> {
  const durationMinutes = duration / 60;

  return {
    'elevenlabs': 0.08 * durationMinutes,
    'minimax-fal': 0.03, // Flat rate
    'minimax-replicate': 0.035, // Flat rate
    'ace-step': 0.011, // Self-hosted
  };
}

/**
 * Format genre for optimal prompting
 *
 * Based on research: specific musical vocabulary unlocks model potential
 * @see research/MEME_COIN_VIRALITY.md
 */
export function formatGenrePrompt(genre: string, bpm?: number): string {
  const genreTemplates: Record<string, string> = {
    'phonk': `Drift phonk, distorted 808 bass, cowbell melody, aggressive Memphis vocal samples, lo-fi, dark atmosphere, ${bpm || 140} BPM`,
    'trap': `Hard trap beat, 808 bass hits, hi-hats rolls, snare patterns, ${bpm || 150} BPM, aggressive energy`,
    'hyperpop': `Hyperpop, glitchy synths, pitched vocals, chaotic energy, maximalist production, ${bpm || 160} BPM`,
    'nightcore': `Nightcore style, sped-up vocals, high energy, euphoric synths, ${bpm || 170} BPM`,
    'lofi': `Lo-fi hip hop, jazzy samples, vinyl crackle, mellow vibes, ${bpm || 85} BPM, chill atmosphere`,
    'edm': `EDM banger, festival energy, massive drops, synth leads, ${bpm || 128} BPM, euphoric`,
    'memecoin': `Aggressive meme coin anthem, crypto hype, moon mission energy, distorted bass, ${bpm || 145} BPM`,
  };

  return genreTemplates[genre.toLowerCase()] || genre;
}

/**
 * Viral optimization based on research
 * @see research/MEME_COIN_VIRALITY.md - "The Viral Zone is 140-175 BPM"
 */
export const VIRAL_CONFIG = {
  // Tempo zones by purpose
  tempo: {
    hype: { min: 140, max: 175, description: 'Aggressive pump tracks' },
    dopamine: { min: 120, max: 130, description: 'Looping dance tracks' },
    chill: { min: 70, max: 90, description: 'Background/ambient' },
  },

  // Format by platform
  format: {
    tiktok: { duration: 15, description: 'The Loop - earworm imprinting' },
    twitter: { duration: 45, description: 'The Edit - high energy clips' },
    telegram: { duration: 180, description: 'The Anthem - community lore' },
    spotify: { duration: 180, description: 'Full track for streaming' },
  },

  // Hook timing
  hookTiming: {
    firstThreeSeconds: true, // Hook must hit in first 3 seconds
    repetitionCount: 3, // Repeat hook 3x minimum for memorability
  },
};
