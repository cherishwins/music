/**
 * Viral Optimizer - Loop-First Lyric Design
 *
 * Research-backed utilities for generating TikTok-viral content.
 * Based on analysis of 4,832 hip hop tracks in hiphop_viral collection.
 */

// Viral score thresholds
export const VIRAL_THRESHOLDS = {
  low: 20,
  medium: 40,
  high: 60,
  viral: 80,
} as const;

// Target metrics for viral content
export const VIRAL_TARGETS = {
  repetitionRatio: 0.4,      // 40% of words should repeat
  hookScore: 5,              // At least 5 repeated phrases
  shortLineRatio: 0.6,       // 60%+ lines should be ≤6 words
  firstLinePunch: true,      // First line ≤8 words, high impact
  adlibDensity: 0.04,        // 3-5% ad-libs
} as const;

// Common ad-libs for energy markers
export const ADLIBS = [
  "yeah", "yuh", "aye", "sheesh", "let's go", "woo",
  "skrt", "brr", "gang", "uh", "ayy", "damn",
] as const;

// High-impact opening words/phrases
export const PUNCH_STARTERS = [
  "Pull up", "We up", "Run it", "Get paid", "Money talk",
  "Can't stop", "Won't stop", "Don't play", "Ice cold",
  "Stack it", "Count it", "Move it", "Feel it",
] as const;

/**
 * Analyze lyrics for viral potential
 */
export function analyzeViralScore(lyrics: string): {
  score: number;
  metrics: {
    repetitionRatio: number;
    hookScore: number;
    shortLineRatio: number;
    firstLinePunch: boolean;
    adlibDensity: number;
    topHooks: string[];
  };
  feedback: string[];
} {
  const lines = lyrics.split('\n').filter(l => l.trim() && !l.startsWith('['));
  const words = lyrics.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

  // Calculate repetition ratio
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  const repeatingWords = Array.from(wordCounts.values()).filter(c => c > 1).reduce((a, b) => a + b, 0);
  const repetitionRatio = words.length > 0 ? repeatingWords / words.length : 0;

  // Calculate hook score (2-5 word phrases appearing 3+ times)
  const phrases = extractPhrases(lyrics, 2, 5);
  const hooks = phrases.filter(p => p.count >= 3);
  const hookScore = hooks.length;
  const topHooks = hooks.slice(0, 5).map(h => h.phrase);

  // Calculate short line ratio
  const shortLines = lines.filter(l => l.split(/\s+/).length <= 6);
  const shortLineRatio = lines.length > 0 ? shortLines.length / lines.length : 0;

  // Check first line punch
  const firstLine = lines[0] || '';
  const firstLineWords = firstLine.split(/\s+/).length;
  const firstLinePunch = firstLineWords <= 8 && firstLineWords >= 2;

  // Calculate ad-lib density
  const adlibCount = words.filter(w => ADLIBS.includes(w as typeof ADLIBS[number])).length;
  const adlibDensity = words.length > 0 ? adlibCount / words.length : 0;

  // Calculate overall score (0-100)
  const score = calculateViralScore({
    repetitionRatio,
    hookScore,
    shortLineRatio,
    firstLinePunch,
    adlibDensity,
  });

  // Generate feedback
  const feedback: string[] = [];
  if (repetitionRatio < VIRAL_TARGETS.repetitionRatio) {
    feedback.push(`Increase repetition (${(repetitionRatio * 100).toFixed(1)}% → target 40%+)`);
  }
  if (hookScore < VIRAL_TARGETS.hookScore) {
    feedback.push(`Add more repeated hooks (${hookScore} → target 5+)`);
  }
  if (shortLineRatio < VIRAL_TARGETS.shortLineRatio) {
    feedback.push(`Use shorter lines (${(shortLineRatio * 100).toFixed(1)}% short → target 60%+)`);
  }
  if (!firstLinePunch) {
    feedback.push(`First line should be punchy (≤8 words, high impact)`);
  }
  if (adlibDensity < 0.03) {
    feedback.push(`Add more ad-libs for energy (${(adlibDensity * 100).toFixed(1)}% → target 3-5%)`);
  }

  return {
    score,
    metrics: {
      repetitionRatio,
      hookScore,
      shortLineRatio,
      firstLinePunch,
      adlibDensity,
      topHooks,
    },
    feedback,
  };
}

/**
 * Extract repeated phrases from lyrics
 */
function extractPhrases(text: string, minWords: number, maxWords: number): { phrase: string; count: number }[] {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const phraseCounts = new Map<string, number>();

  for (let len = minWords; len <= maxWords; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    }
  }

  return Array.from(phraseCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate overall viral score from metrics
 */
function calculateViralScore(metrics: {
  repetitionRatio: number;
  hookScore: number;
  shortLineRatio: number;
  firstLinePunch: boolean;
  adlibDensity: number;
}): number {
  let score = 0;

  // Repetition ratio (0-30 points)
  score += Math.min(30, (metrics.repetitionRatio / 0.5) * 30);

  // Hook score (0-30 points)
  score += Math.min(30, (metrics.hookScore / 8) * 30);

  // Short line ratio (0-20 points)
  score += Math.min(20, (metrics.shortLineRatio / 0.7) * 20);

  // First line punch (0-10 points)
  score += metrics.firstLinePunch ? 10 : 0;

  // Ad-lib density (0-10 points) - optimal around 4%
  const adlibScore = 1 - Math.abs(metrics.adlibDensity - 0.04) / 0.04;
  score += Math.max(0, adlibScore * 10);

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Optimize lyrics for viral potential
 */
export function optimizeLyrics(lyrics: string): {
  optimized: string;
  changes: string[];
} {
  const changes: string[] = [];
  let optimized = lyrics;

  // Add hook repetition if missing
  const lines = optimized.split('\n');
  const hookIndex = lines.findIndex(l => l.toLowerCase().includes('[hook]'));

  if (hookIndex >= 0 && hookIndex + 1 < lines.length) {
    const hookLine = lines[hookIndex + 1];
    // Check if hook is repeated enough
    const hookCount = lines.filter(l => l.trim() === hookLine.trim()).length;
    if (hookCount < 3) {
      // Add hook repetition
      lines.splice(hookIndex + 2, 0, hookLine, hookLine);
      changes.push('Added hook repetition (3x stack)');
    }
  }

  // Add ad-libs where missing
  let adlibsAdded = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() && !line.startsWith('[') && !line.includes('(')) {
      // Every 4th line, consider adding an ad-lib
      if (i % 4 === 0 && adlibsAdded < 5) {
        const randomAdlib = ADLIBS[Math.floor(Math.random() * ADLIBS.length)];
        lines[i] = `${line} (${randomAdlib})`;
        adlibsAdded++;
      }
    }
  }
  if (adlibsAdded > 0) {
    changes.push(`Added ${adlibsAdded} ad-libs for energy`);
  }

  optimized = lines.join('\n');
  return { optimized, changes };
}

/**
 * Generate a viral hook from a theme
 */
export function generateViralHookPrompt(theme: string, style: 'phonk' | 'trap' | 'drill' | 'kphonk' = 'phonk'): string {
  const styleGuides = {
    phonk: {
      energy: "dark, aggressive, relentless",
      bpm: "140",
      adlibs: ["yeah", "sheesh", "brr"],
    },
    trap: {
      energy: "flex, money, status",
      bpm: "145",
      adlibs: ["yeah", "aye", "let's go"],
    },
    drill: {
      energy: "cold, menacing, street",
      bpm: "140",
      adlibs: ["uh", "gang", "woo"],
    },
    kphonk: {
      energy: "aggressive yet melodic, Seoul vibes",
      bpm: "138",
      adlibs: ["yeah", "sheesh", "ayy"],
    },
  };

  const guide = styleGuides[style];

  return `Write a TikTok-viral ${style} hook that:
- Opens with a 6-word punch line (no setup, instant impact)
- Repeats the core hook phrase 3x IN A ROW immediately
- Uses only lines with 6 words or fewer
- Includes 2-3 ad-libs: ${guide.adlibs.join(', ')}
- Has ONE phrase designed to loop in someone's head forever

Theme: ${theme}
Style: ${style}
Energy: ${guide.energy}
Target BPM: ${guide.bpm}

CRITICAL - Apply Loop-First Design:
1. First 8 words must SLAP (TikTok scroll survival)
2. Stack repetition immediately (not spread out)
3. 70%+ short lines (each line = potential clip)
4. ONE hook that people can't get out of their head

Format:
[Hook - 8 lines, 3x main phrase at start]

Output ONLY the hook, nothing else.`;
}

/**
 * Generate a viral beat prompt for ElevenLabs
 */
export function generateViralBeatPrompt(
  style: 'phonk' | 'trap' | 'drill' | 'kphonk',
  options: {
    bpm?: number;
    mood?: string;
    duration?: string;
  } = {}
): string {
  const stylePrompts = {
    phonk: "phonk, Memphis rap samples, dark cowbell patterns, aggressive 808 bass, drift culture aesthetic, distorted kicks, hard-hitting drops",
    trap: "trap, 808 sub bass with distortion, crisp hi-hats with rolls, Metro Boomin style, dark ambient pads, punchy kicks",
    drill: "UK drill, sliding 808 bass, dark minor key piano, aggressive energy, 808 Melo style, eerie melodies",
    kphonk: "K-phonk, Korean phonk fusion, aggressive 808s, K-pop melodic hooks, Seoul street racing vibes, dark synth layers",
  };

  const bpm = options.bpm || { phonk: 140, trap: 145, drill: 140, kphonk: 138 }[style];
  const mood = options.mood || { phonk: "dark and aggressive", trap: "hard-hitting", drill: "cold and menacing", kphonk: "aggressive yet melodic" }[style];

  return `${stylePrompts[style]}, ${bpm} BPM, ${mood}, TikTok viral energy, hard-hitting drops every 8 bars, loopable structure, perfect for 15-second clips, professional mix, viral potential, ${options.duration || "60 seconds"}`;
}

/**
 * Check if content meets viral threshold
 */
export function meetsViralThreshold(lyrics: string, threshold: keyof typeof VIRAL_THRESHOLDS = 'medium'): {
  passes: boolean;
  score: number;
  feedback: string[];
} {
  const analysis = analyzeViralScore(lyrics);
  const targetScore = VIRAL_THRESHOLDS[threshold];

  return {
    passes: analysis.score >= targetScore,
    score: analysis.score,
    feedback: analysis.feedback,
  };
}
