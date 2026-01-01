/**
 * fal.ai Music API Integration
 *
 * Two options:
 * 1. CassetteAI - Text-only, no reference needed, fast (~2s for 30s sample)
 * 2. MiniMax - Higher quality, requires reference audio
 *
 * Cost: ~$0.03 per song (40x cheaper than ElevenLabs)
 *
 * @see https://fal.ai/models/cassetteai/music-generator
 * @see https://fal.ai/models/fal-ai/minimax-music
 */

interface MiniMaxGenerateOptions {
  prompt: string;
  lyrics?: string;
  referenceAudioUrl?: string;
  stylePrompt?: string; // Alternative to reference audio - describes the style
  duration?: number; // seconds, max 300 (5 min)
  sampleRate?: 16000 | 24000 | 32000 | 44100;
  bitrate?: 32000 | 64000 | 128000 | 256000; // bps, not kbps
}

interface MiniMaxResult {
  audioUrl: string;
  duration: number;
  cost: number;
  provider: 'fal' | 'replicate';
}

/**
 * Generate music via fal.ai CassetteAI
 * Text-only generation - no reference audio needed!
 * Fast: 30s sample in ~2 seconds, 3min track in ~10 seconds
 */
export async function generateWithFal(options: MiniMaxGenerateOptions): Promise<MiniMaxResult> {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    throw new Error('FAL_KEY not configured. Sign up at https://fal.ai');
  }

  // CassetteAI - simple API: just prompt and duration
  // Include lyrics in the prompt if provided
  const fullPrompt = options.lyrics
    ? `${options.prompt}\n\nLyrics:\n${options.lyrics}`
    : options.prompt;

  const response = await fetch('https://fal.run/cassetteai/music-generator', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      duration: options.duration || 120, // Default 2 min for anthems
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`fal.ai CassetteAI error: ${error}`);
  }

  const result = await response.json();

  return {
    audioUrl: result.audio_file?.url || result.audio?.url,
    duration: options.duration || 120,
    cost: 0.03, // Estimated per-generation cost
    provider: 'fal',
  };
}

/**
 * Generate music via Replicate MiniMax API
 * Requires REPLICATE_API_TOKEN in environment
 */
export async function generateWithReplicate(options: MiniMaxGenerateOptions): Promise<MiniMaxResult> {
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  // Create prediction
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'minimax/music-01', // or music-1.5 for longer tracks
      input: {
        prompt: options.prompt,
        lyrics: options.lyrics,
        reference_audio: options.referenceAudioUrl,
        sample_rate: options.sampleRate || 44100,
        bitrate: options.bitrate || 128000, // bps
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate create error: ${error}`);
  }

  const prediction = await createResponse.json();

  // Poll for completion
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pollResponse = await fetch(result.urls.get, {
      headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate generation failed: ${result.error}`);
  }

  return {
    audioUrl: result.output,
    duration: options.duration || 60,
    cost: 0.035, // Replicate pricing
    provider: 'replicate',
  };
}

/**
 * Smart provider selection - tries fal.ai first (cheaper), falls back to Replicate
 */
export async function generateMusic(options: MiniMaxGenerateOptions): Promise<MiniMaxResult> {
  // Try fal.ai first (cheaper at $0.03)
  if (process.env.FAL_KEY) {
    try {
      return await generateWithFal(options);
    } catch (error) {
      console.warn('fal.ai failed, trying Replicate:', error);
    }
  }

  // Fallback to Replicate
  if (process.env.REPLICATE_API_TOKEN) {
    return await generateWithReplicate(options);
  }

  throw new Error('No MiniMax provider configured. Set FAL_KEY or REPLICATE_API_TOKEN');
}

/**
 * Compare cost: MiniMax vs ElevenLabs
 *
 * ElevenLabs: ~$0.08/min = $0.32 for 4-min track
 * MiniMax:    $0.03 flat = $0.03 for 5-min track
 *
 * Savings: 90%+ on high-volume generation
 */
export const COST_COMPARISON = {
  elevenLabs: {
    perMinute: 0.08,
    fourMinTrack: 0.32,
  },
  miniMax: {
    perGeneration: 0.03,
    fiveMinTrack: 0.03,
  },
  savings: '90%+',
};
