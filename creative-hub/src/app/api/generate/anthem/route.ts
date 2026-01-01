/**
 * /api/generate/anthem - Meme Coin Anthem Generator
 *
 * TIERED PRICING:
 * - free: 30s preview, watermarked ($0.01 cost, $0 price)
 * - good: 2min full, watermarked ($0.03 cost, $0.50 price)
 * - better: 2min full, clean ($0.03 cost, $1.00 price)
 * - best: 2min full, ElevenLabs quality ($0.32 cost, $2.00 price)
 *
 * @see research/MEME_COIN_RECORD_LABEL.md
 * @see docs/GROWTH_ENGINE.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMusic as generateWithFal } from '@/lib/minimax';
import { generateFullSong } from '@/lib/voice';
import { applyWatermark } from '@/lib/watermark';
import {
  formatGenrePrompt,
  VIRAL_CONFIG,
  type MusicProvider,
} from '@/lib/music-providers';

// Pricing tiers
type PricingTier = 'free' | 'good' | 'better' | 'best';

const TIER_CONFIG: Record<PricingTier, {
  maxDuration: number;
  watermark: boolean;
  provider: 'fal' | 'elevenlabs';
  cost: number;
  price: number;
}> = {
  free: { maxDuration: 30, watermark: true, provider: 'fal', cost: 0.01, price: 0 },
  good: { maxDuration: 120, watermark: true, provider: 'fal', cost: 0.03, price: 0.50 },
  better: { maxDuration: 120, watermark: false, provider: 'fal', cost: 0.03, price: 1.00 },
  best: { maxDuration: 120, watermark: false, provider: 'elevenlabs', cost: 0.32, price: 2.00 },
};

interface AnthemRequest {
  // Core inputs
  tokenName: string;
  ticker: string;
  theme?: string; // "moon mission", "diamond hands", "rug revenge"

  // Pricing tier
  tier?: PricingTier;

  // Optional context (auto-fetched if CA provided)
  contractAddress?: string;
  marketCap?: string;
  priceChange24h?: string;

  // Style
  genre?: 'phonk' | 'trap' | 'hyperpop' | 'edm' | 'memecoin';
  vibeType?: 'hype' | 'dopamine' | 'chill';
  voiceStyle?: 'male' | 'female' | 'aggressive';

  // Legacy: Provider preference (still supported)
  preferCheap?: boolean;
  preferUncensored?: boolean;
  provider?: MusicProvider;
}

interface AnthemResponse {
  success: boolean;
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  cost?: number;
  price?: number;
  tier?: PricingTier;
  watermarked?: boolean;
  provider?: MusicProvider;
  lyrics?: string;
  upgradePrompt?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnthemResponse>> {
  try {
    const body: AnthemRequest = await request.json();

    const {
      tokenName,
      ticker,
      theme = 'moon mission',
      genre = 'memecoin',
      vibeType = 'hype',
      tier = 'free', // Default to free tier
      marketCap,
      priceChange24h,
      // Legacy support
      preferCheap,
    } = body;

    // Validate required fields
    if (!tokenName || !ticker) {
      return NextResponse.json({
        success: false,
        error: 'tokenName and ticker are required',
      }, { status: 400 });
    }

    // Get tier config (legacy preferCheap maps to 'good')
    const effectiveTier: PricingTier = preferCheap ? 'good' : tier;
    const tierConfig = TIER_CONFIG[effectiveTier];

    // Get tempo based on vibe type
    const tempoConfig = VIRAL_CONFIG.tempo[vibeType];
    const bpm = Math.floor(Math.random() * (tempoConfig.max - tempoConfig.min) + tempoConfig.min);

    // Generate crypto-native lyrics
    const lyrics = generateCryptoLyrics({
      tokenName,
      ticker,
      theme,
      marketCap,
      priceChange24h,
    });

    // Build optimized genre prompt
    const genrePrompt = formatGenrePrompt(genre, bpm);

    // Build style prompt based on genre
    const stylePrompts: Record<string, string> = {
      'phonk': 'drift phonk, distorted 808 bass, cowbell melody, aggressive Memphis samples, dark atmosphere',
      'trap': 'hard trap beat, heavy 808s, rapid hi-hats, aggressive snare patterns, dark energy',
      'hyperpop': 'hyperpop, glitchy synths, pitched vocals, chaotic maximalist production',
      'edm': 'EDM banger, festival energy, massive drops, euphoric synth leads',
      'memecoin': 'aggressive crypto anthem, pump energy, distorted bass, triumphant synths',
    };

    // Generate based on tier
    let result: { audioUrl?: string; audioBase64?: string; duration: number; cost: number };
    let selectedProvider: MusicProvider = 'minimax-fal';

    if (tierConfig.provider === 'elevenlabs') {
      // Best tier: Use ElevenLabs
      selectedProvider = 'elevenlabs';
      const elevenLabsResult = await generateFullSong(
        lyrics,
        genre === 'trap' ? 'trap' : genre === 'phonk' ? 'phonk' : 'trap',
        { bpm }
      );

      const audioBase64 = elevenLabsResult.audio.toString('base64');
      result = {
        audioBase64,
        duration: tierConfig.maxDuration,
        cost: tierConfig.cost,
      };
    } else {
      // Free/Good/Better tiers: Use fal.ai (CassetteAI)
      const falResult = await generateWithFal({
        prompt: `${genrePrompt}. Create an anthem for the ${tokenName} ($${ticker}) cryptocurrency community.`,
        lyrics: lyrics,
        stylePrompt: stylePrompts[genre] || stylePrompts['memecoin'],
        duration: tierConfig.maxDuration,
      });

      result = {
        audioUrl: falResult.audioUrl,
        duration: falResult.duration,
        cost: tierConfig.cost,
      };
    }

    // Apply watermark for free/good tiers
    let watermarked = false;
    if (tierConfig.watermark && result.audioUrl) {
      try {
        // Fetch the audio and apply watermark
        const audioResponse = await fetch(result.audioUrl);
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

        const watermarkResult = await applyWatermark({
          inputBuffer: audioBuffer,
          inputFormat: 'wav',
          outputFormat: 'mp3',
        });

        if (watermarkResult.watermarked) {
          // Convert watermarked audio to base64
          result.audioBase64 = watermarkResult.buffer.toString('base64');
          result.audioUrl = undefined; // Use base64 instead
          watermarked = true;
        }
      } catch (e) {
        console.warn('Watermarking failed, returning original:', e);
        // Continue without watermark if it fails
      }
    }

    // Build upgrade prompt for free tier
    let upgradePrompt: string | undefined;
    if (effectiveTier === 'free') {
      upgradePrompt = `🎵 This is a 30-second preview. Get the full 2-minute anthem for just $0.50!`;
    } else if (effectiveTier === 'good') {
      upgradePrompt = `🎧 Want a clean version without the watermark? Upgrade to Better tier for $1.00`;
    }

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      audioBase64: result.audioBase64,
      duration: result.duration,
      cost: result.cost,
      price: tierConfig.price,
      tier: effectiveTier,
      watermarked,
      provider: selectedProvider,
      lyrics: lyrics,
      upgradePrompt,
    });

  } catch (error) {
    console.error('Anthem generation error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    }, { status: 500 });
  }
}

/**
 * Generate crypto-native lyrics
 * Based on research: tribal themes, karma/skill, absurdity
 * @see research/MEME_COIN_VIRALITY.md Section 10.2
 */
function generateCryptoLyrics(params: {
  tokenName: string;
  ticker: string;
  theme: string;
  marketCap?: string;
  priceChange24h?: string;
}): string {
  const { tokenName, ticker, theme, marketCap, priceChange24h } = params;

  // Viral hook - monosyllabic, rhythmic, coin name prominent
  const hook = `$${ticker}! $${ticker}! We going to the moon!
$${ticker}! $${ticker}! Diamond hands, we never fold!`;

  // Verse with crypto slang
  const verse1 = `[Verse 1]
${tokenName} gang, we run the game
Jeets get rekt, they all the same
${priceChange24h ? `Up ${priceChange24h}, that's how we play` : 'Charts go up, that\'s how we play'}
${marketCap ? `${marketCap} market cap, we here to stay` : 'Building empire every day'}`;

  // Chorus - maximum repetition for virality
  const chorus = `[Chorus]
${hook}
Send it higher, break the ceiling
${tokenName} army got that feeling!`;

  // Verse 2 - tribal/community themes
  const verse2 = `[Verse 2]
Paper hands cry when we pump
Diamond army, never dump
${theme === 'rug revenge' ? 'They tried to rug, we came back strong' : 'Every dip, we buy along'}
${tokenName} community a hundred thousand strong`;

  // Bridge - the "Nice Shot" karma element
  const bridge = `[Bridge]
They said we'd fail, they said we'd crash
Now they watch us stacking cash
${tokenName} forever, to the moon we go
${ticker} army putting on a show!`;

  // Outro - simple hook repetition
  const outro = `[Outro]
${hook}
${hook}`;

  return `${verse1}\n\n${chorus}\n\n${verse2}\n\n${chorus}\n\n${bridge}\n\n${chorus}\n\n${outro}`;
}

/**
 * Build ElevenLabs composition plan
 */
function buildCompositionPlan(params: {
  tokenName: string;
  ticker: string;
  theme: string;
  genre: string;
  bpm: number;
  lyrics: string;
}): string {
  const { tokenName, genre, bpm } = params;

  return `Create an aggressive ${genre} anthem for a cryptocurrency called ${tokenName}.

Style: ${genre === 'phonk' ? 'Drift phonk with distorted 808s and cowbell melody' :
    genre === 'trap' ? 'Hard trap with heavy 808s and rapid hi-hats' :
    genre === 'hyperpop' ? 'Glitchy hyperpop with pitched vocals and chaotic synths' :
    'High-energy electronic with massive drops'}

Tempo: ${bpm} BPM
Mood: Aggressive, triumphant, hype
Vocals: ${params.theme === 'rug revenge' ? 'Angry and defiant' : 'Confident and celebratory'}

Structure:
- Intro: 4 bars instrumental build
- Verse 1: Aggressive delivery
- Chorus: Maximum energy, hook-focused
- Verse 2: Community/tribal themes
- Chorus: Repeat with more intensity
- Bridge: Emotional peak
- Outro: Hook repetition, fade out

CRITICAL: Hook must hit within first 3 seconds. Use heavy repetition of "${params.ticker}" in the chorus.`;
}

// Helper functions are internal only
