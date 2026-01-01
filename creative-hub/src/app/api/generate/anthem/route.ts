/**
 * /api/generate/anthem - Meme Coin Anthem Generator
 *
 * Optimized for viral meme coin music:
 * - Multi-provider fallback (ElevenLabs → MiniMax → ACE-Step)
 * - Viral tempo/structure optimization
 * - Cost-aware routing
 *
 * @see research/MEME_COIN_RECORD_LABEL.md
 * @see research/MEME_COIN_VIRALITY.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMusic as generateWithMiniMax } from '@/lib/minimax';
import { generateFullSong } from '@/lib/voice';
import {
  getCheapestProvider,
  formatGenrePrompt,
  VIRAL_CONFIG,
  type MusicProvider,
} from '@/lib/music-providers';

interface AnthemRequest {
  // Core inputs
  tokenName: string;
  ticker: string;
  theme?: string; // "moon mission", "diamond hands", "rug revenge"

  // Optional context (auto-fetched if CA provided)
  contractAddress?: string;
  marketCap?: string;
  priceChange24h?: string;

  // Style
  genre?: 'phonk' | 'trap' | 'hyperpop' | 'edm' | 'memecoin';
  vibeType?: 'hype' | 'dopamine' | 'chill';
  voiceStyle?: 'male' | 'female' | 'aggressive';

  // Provider preference
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
  provider?: MusicProvider;
  lyrics?: string;
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
      voiceStyle = 'aggressive',
      preferCheap = false,
      preferUncensored = false,
      marketCap,
      priceChange24h,
    } = body;

    // Validate required fields
    if (!tokenName || !ticker) {
      return NextResponse.json({
        success: false,
        error: 'tokenName and ticker are required',
      }, { status: 400 });
    }

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

    // Determine provider
    let selectedProvider: MusicProvider = 'elevenlabs';

    if (preferCheap) {
      const cheapest = getCheapestProvider();
      if (cheapest) selectedProvider = cheapest.provider;
    } else if (preferUncensored) {
      // MiniMax is more permissive than ElevenLabs
      if (process.env.FAL_KEY) selectedProvider = 'minimax-fal';
      else if (process.env.REPLICATE_API_TOKEN) selectedProvider = 'minimax-replicate';
    } else if (body.provider) {
      selectedProvider = body.provider;
    }

    // Generate based on provider
    let result: { audioUrl?: string; audioBase64?: string; duration: number; cost: number };

    if (selectedProvider.startsWith('minimax')) {
      // Build style prompt based on genre
      const stylePrompts: Record<string, string> = {
        'phonk': 'drift phonk, distorted 808 bass, cowbell melody, aggressive Memphis samples, dark atmosphere',
        'trap': 'hard trap beat, heavy 808s, rapid hi-hats, aggressive snare patterns, dark energy',
        'hyperpop': 'hyperpop, glitchy synths, pitched vocals, chaotic maximalist production',
        'edm': 'EDM banger, festival energy, massive drops, euphoric synth leads',
        'memecoin': 'aggressive crypto anthem, pump energy, distorted bass, triumphant synths',
      };

      // Use MiniMax
      const miniMaxResult = await generateWithMiniMax({
        prompt: `${genrePrompt}. Create an anthem for the ${tokenName} ($${ticker}) cryptocurrency community.`,
        lyrics: lyrics,
        stylePrompt: stylePrompts[genre] || stylePrompts['memecoin'],
      });

      result = {
        audioUrl: miniMaxResult.audioUrl,
        duration: miniMaxResult.duration,
        cost: miniMaxResult.cost,
      };
    } else {
      // Use ElevenLabs (default)
      const elevenLabsResult = await generateFullSong(
        lyrics,
        genre === 'trap' ? 'trap' : genre === 'phonk' ? 'phonk' : 'trap',
        { bpm }
      );

      // Convert Buffer to base64
      const audioBase64 = elevenLabsResult.audio.toString('base64');

      result = {
        audioBase64: audioBase64,
        duration: 120, // Estimated 2 min
        cost: 0.08 * 2, // ~$0.08/min * 2 min
      };
    }

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      audioBase64: result.audioBase64,
      duration: result.duration,
      cost: result.cost,
      provider: selectedProvider,
      lyrics: lyrics,
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
