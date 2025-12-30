/**
 * Master DJ - The Viral Hit Machine
 *
 * Orchestrates all viral generation components to deliver
 * the highest quality, most viral-optimized outputs.
 *
 * Pipeline:
 * 1. Query Qdrant for high-viral patterns
 * 2. Extract winning hooks and structures
 * 3. Generate content using Loop-First design
 * 4. Validate against viral thresholds
 * 5. Retry/optimize until quality bar is met
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import Anthropic from "@anthropic-ai/sdk";
import {
  analyzeViralScore,
  generateViralHookPrompt,
  generateViralBeatPrompt,
  optimizeLyrics,
  meetsViralThreshold,
  VIRAL_THRESHOLDS,
} from "./viral-optimizer";
import {
  MUSIC_STYLES,
  type MusicStyle,
  composeMusicWithPlan,
  type CompositionPlan,
} from "./voice";

// Configuration
const QDRANT_COLLECTION = "hiphop_viral";
const MIN_VIRAL_SCORE = 50;
const MAX_GENERATION_ATTEMPTS = 3;

// Types
interface ViralPattern {
  id: string;
  lyrics: string;
  viralScore: number;
  hookScore: number;
  repetitionRatio: number;
  topHooks: string[];
  artist?: string;
}

interface GenerationRequest {
  theme: string;
  style?: MusicStyle;
  targetViralScore?: number;
  includeMusic?: boolean;
  durationMs?: number;
  bpm?: number;
}

interface GenerationResult {
  lyrics: string;
  viralScore: number;
  metrics: {
    repetitionRatio: number;
    hookScore: number;
    shortLineRatio: number;
    topHooks: string[];
  };
  music?: {
    audio: Buffer;
    songId?: string;
  };
  inspirationPatterns: string[];
  attempts: number;
}

/**
 * Master DJ - Orchestrates viral content generation
 */
export class MasterDJ {
  private qdrant: QdrantClient | null = null;
  private anthropic: Anthropic;
  private initialized = false;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Initialize connections (lazy loading)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize Qdrant if credentials available
    if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
      this.qdrant = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
      });
    }

    this.initialized = true;
  }

  /**
   * Generate viral content with quality guarantee
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    await this.initialize();

    const style = request.style || "phonk";
    const targetScore = request.targetViralScore || MIN_VIRAL_SCORE;

    console.log(`[MasterDJ] Starting generation - Theme: "${request.theme}", Style: ${style}`);

    // Step 1: Get viral patterns for inspiration
    const patterns = await this.getViralPatterns(style, 10);
    console.log(`[MasterDJ] Found ${patterns.length} high-viral patterns for inspiration`);

    // Extract top hooks from patterns
    const inspirationHooks = patterns
      .flatMap(p => p.topHooks)
      .slice(0, 15);

    // Step 2: Generate with retry loop until quality bar met
    let bestResult: { lyrics: string; analysis: ReturnType<typeof analyzeViralScore> } | null = null;
    let attempts = 0;

    while (attempts < MAX_GENERATION_ATTEMPTS) {
      attempts++;
      console.log(`[MasterDJ] Generation attempt ${attempts}/${MAX_GENERATION_ATTEMPTS}`);

      const lyrics = await this.generateLyrics(request.theme, style, inspirationHooks, attempts);
      const analysis = analyzeViralScore(lyrics);

      console.log(`[MasterDJ] Attempt ${attempts} score: ${analysis.score}`);

      // Keep best result
      if (!bestResult || analysis.score > bestResult.analysis.score) {
        bestResult = { lyrics, analysis };
      }

      // If we hit target, we're done
      if (analysis.score >= targetScore) {
        console.log(`[MasterDJ] Target score reached (${analysis.score} >= ${targetScore})`);
        break;
      }

      // If not at target, try to optimize
      if (attempts < MAX_GENERATION_ATTEMPTS) {
        const { optimized, changes } = optimizeLyrics(lyrics);
        const optimizedAnalysis = analyzeViralScore(optimized);

        if (optimizedAnalysis.score > analysis.score) {
          console.log(`[MasterDJ] Optimization improved score: ${analysis.score} → ${optimizedAnalysis.score}`);
          bestResult = { lyrics: optimized, analysis: optimizedAnalysis };

          if (optimizedAnalysis.score >= targetScore) {
            break;
          }
        }
      }
    }

    if (!bestResult) {
      throw new Error("Failed to generate content");
    }

    // Step 3: Generate music if requested
    let music: { audio: Buffer; songId?: string } | undefined;
    if (request.includeMusic) {
      console.log(`[MasterDJ] Generating music...`);
      music = await this.generateMusic(
        bestResult.lyrics,
        style,
        request.durationMs,
        request.bpm
      );
    }

    console.log(`[MasterDJ] Generation complete - Final score: ${bestResult.analysis.score}`);

    return {
      lyrics: bestResult.lyrics,
      viralScore: bestResult.analysis.score,
      metrics: {
        repetitionRatio: bestResult.analysis.metrics.repetitionRatio,
        hookScore: bestResult.analysis.metrics.hookScore,
        shortLineRatio: bestResult.analysis.metrics.shortLineRatio,
        topHooks: bestResult.analysis.metrics.topHooks,
      },
      music,
      inspirationPatterns: inspirationHooks,
      attempts,
    };
  }

  /**
   * Query Qdrant for high-viral patterns
   */
  private async getViralPatterns(style: MusicStyle, limit: number): Promise<ViralPattern[]> {
    if (!this.qdrant) {
      console.log("[MasterDJ] Qdrant not configured, using built-in patterns");
      return this.getBuiltInPatterns(style);
    }

    try {
      const result = await this.qdrant.scroll(QDRANT_COLLECTION, {
        filter: {
          must: [
            { key: "viral_score", range: { gte: MIN_VIRAL_SCORE } },
          ],
        },
        limit,
        with_payload: true,
      });

      return result.points.map((point) => ({
        id: String(point.id),
        lyrics: (point.payload?.lyrics as string) || "",
        viralScore: (point.payload?.viral_score as number) || 0,
        hookScore: (point.payload?.hook_score as number) || 0,
        repetitionRatio: (point.payload?.repetition_ratio as number) || 0,
        topHooks: (point.payload?.top_hooks as string[]) || [],
        artist: point.payload?.artist as string | undefined,
      }));
    } catch (error) {
      console.error("[MasterDJ] Qdrant query failed:", error);
      return this.getBuiltInPatterns(style);
    }
  }

  /**
   * Built-in high-performing patterns as fallback
   */
  private getBuiltInPatterns(style: MusicStyle): ViralPattern[] {
    const patterns: Record<string, ViralPattern[]> = {
      phonk: [
        {
          id: "builtin-1",
          lyrics: "Get paid, get paid, get paid\nEvery day we get paid\nCan't fade what I made",
          viralScore: 85,
          hookScore: 8,
          repetitionRatio: 0.52,
          topHooks: ["get paid", "every day", "can't fade"],
        },
        {
          id: "builtin-2",
          lyrics: "Run it up, run it up\nNever stop, never stop\nTo the top, to the top",
          viralScore: 78,
          hookScore: 6,
          repetitionRatio: 0.48,
          topHooks: ["run it up", "never stop", "to the top"],
        },
      ],
      trap: [
        {
          id: "builtin-3",
          lyrics: "Money talk, I don't speak\nEvery week, on repeat\nIn the streets, feel the heat",
          viralScore: 72,
          hookScore: 5,
          repetitionRatio: 0.45,
          topHooks: ["money talk", "every week", "in the streets"],
        },
      ],
      drill: [
        {
          id: "builtin-4",
          lyrics: "Don't play, don't play\nEvery day, same way\nMake it pay, make it pay",
          viralScore: 70,
          hookScore: 6,
          repetitionRatio: 0.55,
          topHooks: ["don't play", "every day", "make it pay"],
        },
      ],
      kphonk: [
        {
          id: "builtin-5",
          lyrics: "Seoul nights, neon lights\nMove right, move right\nFeel the vibe, feel the vibe",
          viralScore: 75,
          hookScore: 5,
          repetitionRatio: 0.50,
          topHooks: ["seoul nights", "move right", "feel the vibe"],
        },
      ],
    };

    return patterns[style] || patterns.phonk;
  }

  /**
   * Generate lyrics using Claude with Loop-First design
   */
  private async generateLyrics(
    theme: string,
    style: MusicStyle,
    inspirationHooks: string[],
    attempt: number
  ): Promise<string> {
    // Increase creativity on retries
    const temperature = 0.7 + (attempt - 1) * 0.1;

    const systemPrompt = `You are a viral hit songwriter specializing in ${style} music.
You ONLY output lyrics - no explanations, no commentary.

Your secret weapon: Loop-First Lyric Design
- First 8 words must SLAP (TikTok scroll survival)
- Stack repetition IMMEDIATELY (3x in a row, not spread out)
- 70%+ lines should be 6 words or fewer
- ONE hook that loops in people's heads forever
- Include 2-3 ad-libs (yeah, sheesh, let's go, skrt)

Reference hooks from hits: ${inspirationHooks.slice(0, 8).join(", ")}`;

    const userPrompt = generateViralHookPrompt(theme, style as "phonk" | "trap" | "drill" | "kphonk");

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return content.text.trim();
  }

  /**
   * Generate music using ElevenLabs with viral optimization
   */
  private async generateMusic(
    lyrics: string,
    style: MusicStyle,
    durationMs?: number,
    bpm?: number
  ): Promise<{ audio: Buffer; songId?: string }> {
    const styleTraits = [...(MUSIC_STYLES[style] || MUSIC_STYLES.phonk)];

    // Build viral-optimized composition plan
    const plan: CompositionPlan = {
      positive_global_styles: [
        ...styleTraits.slice(0, 6),
        "TikTok viral energy",
        "hard-hitting drops every 8 bars",
        "loopable structure",
        "professional mix",
      ],
      negative_global_styles: [
        "amateur",
        "low quality",
        "muddy mix",
        "weak drops",
      ],
      sections: this.buildViralSections(lyrics, styleTraits, durationMs || 90000),
    };

    return composeMusicWithPlan(plan, { respectDurations: true });
  }

  /**
   * Build song sections optimized for viral clips
   */
  private buildViralSections(
    lyrics: string,
    styleTraits: string[],
    totalDurationMs: number
  ): CompositionPlan["sections"] {
    const lines = lyrics.split('\n').filter(l => l.trim() && !l.startsWith('['));

    // Viral structure: Hook-heavy with drops
    return [
      {
        section_name: "Intro Drop",
        positive_local_styles: [...styleTraits, "building tension", "hard drop"],
        negative_local_styles: ["soft", "weak"],
        duration_ms: Math.min(8000, totalDurationMs * 0.1),
        lines: ["[Instrumental drop building to hook]"],
      },
      {
        section_name: "Hook",
        positive_local_styles: [...styleTraits, "catchy", "memorable", "loopable"],
        negative_local_styles: ["forgettable", "weak"],
        duration_ms: Math.min(20000, totalDurationMs * 0.25),
        lines: lines.slice(0, 8),
      },
      {
        section_name: "Verse",
        positive_local_styles: [...styleTraits, "rhythmic", "driving"],
        negative_local_styles: ["slow", "boring"],
        duration_ms: Math.min(30000, totalDurationMs * 0.3),
        lines: lines.slice(8, 16),
      },
      {
        section_name: "Hook",
        positive_local_styles: [...styleTraits, "catchy", "memorable", "peak energy"],
        negative_local_styles: ["forgettable", "weak"],
        duration_ms: Math.min(20000, totalDurationMs * 0.25),
        lines: lines.slice(0, 8),
      },
      {
        section_name: "Outro Drop",
        positive_local_styles: [...styleTraits, "final drop", "memorable ending"],
        negative_local_styles: ["weak", "forgettable"],
        duration_ms: Math.min(12000, totalDurationMs * 0.1),
        lines: lines.slice(0, 4),
      },
    ];
  }

  /**
   * Quick hook generation (lyrics only, no music)
   */
  async generateQuickHook(theme: string, style: MusicStyle = "phonk"): Promise<{
    hook: string;
    viralScore: number;
    feedback: string[];
  }> {
    await this.initialize();

    const patterns = await this.getViralPatterns(style, 5);
    const inspirationHooks = patterns.flatMap(p => p.topHooks).slice(0, 10);

    const hook = await this.generateLyrics(theme, style, inspirationHooks, 1);
    const analysis = analyzeViralScore(hook);

    return {
      hook,
      viralScore: analysis.score,
      feedback: analysis.feedback,
    };
  }

  /**
   * Validate existing lyrics against viral standards
   */
  validateLyrics(lyrics: string, threshold: keyof typeof VIRAL_THRESHOLDS = "medium"): {
    passes: boolean;
    score: number;
    metrics: ReturnType<typeof analyzeViralScore>["metrics"];
    feedback: string[];
  } {
    const result = meetsViralThreshold(lyrics, threshold);
    const analysis = analyzeViralScore(lyrics);

    return {
      passes: result.passes,
      score: result.score,
      metrics: analysis.metrics,
      feedback: result.feedback,
    };
  }
}

// Singleton instance
let masterDJ: MasterDJ | null = null;

export function getMasterDJ(): MasterDJ {
  if (!masterDJ) {
    masterDJ = new MasterDJ();
  }
  return masterDJ;
}

// Convenience exports
export {
  analyzeViralScore,
  generateViralHookPrompt,
  generateViralBeatPrompt,
  optimizeLyrics,
  meetsViralThreshold,
  VIRAL_THRESHOLDS,
} from "./viral-optimizer";
