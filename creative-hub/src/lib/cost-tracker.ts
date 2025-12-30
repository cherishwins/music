/**
 * Cost Tracking Utility
 *
 * Use this to log costs for every API call to external services.
 * Enables runway monitoring and unit economics calculation.
 */

import { db } from "@/lib/db";
import { costEvents } from "@/lib/db/schema";

// Cost rates per service (2025 pricing)
export const COST_RATES = {
  // ElevenLabs
  elevenlabs_music: {
    name: "ElevenLabs Music",
    ratePerMinute: 0.08, // ~$0.08/min on Creator plan (62 min included)
    monthlyIncluded: 62,
  },
  elevenlabs_voice: {
    name: "ElevenLabs Voice",
    ratePerChar: 0.00002, // ~$0.002/100 chars
    monthlyIncluded: 100000,
  },

  // Anthropic Claude
  anthropic_haiku: {
    name: "Claude Haiku",
    inputRatePerToken: 0.00000025, // $0.25/1M tokens
    outputRatePerToken: 0.00000125, // $1.25/1M tokens
  },
  anthropic_haiku35: {
    name: "Claude Haiku 3.5",
    inputRatePerToken: 0.0000008, // $0.80/1M tokens
    outputRatePerToken: 0.000004, // $4/1M tokens
  },
  anthropic_sonnet: {
    name: "Claude Sonnet",
    inputRatePerToken: 0.000003, // $3/1M tokens
    outputRatePerToken: 0.000015, // $15/1M tokens
  },

  // Replicate
  replicate_flux_schnell: {
    name: "Flux Schnell",
    ratePerImage: 0.003,
  },
  replicate_flux_dev: {
    name: "Flux Dev",
    ratePerImage: 0.025,
  },

  // xAI
  xai_grok: {
    name: "xAI Grok",
    inputRatePerToken: 0.000002, // $2/1M tokens
    outputRatePerToken: 0.000006, // $6/1M tokens
  },

  // Storage
  vercel_blob: {
    name: "Vercel Blob",
    ratePerGBStored: 0.15,
    ratePerGBTransfer: 0.10,
  },
} as const;

export type ServiceType = keyof typeof COST_RATES;

// Valid service types for database (must match schema enum)
export type DbServiceType =
  | "elevenlabs_music"
  | "elevenlabs_voice"
  | "anthropic"
  | "xai"
  | "replicate"
  | "storage"
  | "embedding";

// Map extended service names to base database enum values
function mapToDbService(service: string): DbServiceType {
  if (service.startsWith("anthropic")) return "anthropic";
  if (service.startsWith("replicate")) return "replicate";
  if (service.startsWith("elevenlabs_music")) return "elevenlabs_music";
  if (service.startsWith("elevenlabs_voice")) return "elevenlabs_voice";
  if (service.startsWith("xai")) return "xai";
  if (service === "storage" || service === "vercel_blob") return "storage";
  if (service === "embedding") return "embedding";
  // Default fallback
  return service as DbServiceType;
}

export interface CostEventInput {
  service: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  durationSeconds?: number;
  bytesStored?: number;
  userId?: string;
  trackId?: string;
}

/**
 * Calculate estimated cost for a service usage
 */
export function calculateCost(event: CostEventInput): number {
  const { service, inputTokens, outputTokens, durationSeconds, bytesStored } = event;

  switch (service) {
    // ElevenLabs Music - time based
    case "elevenlabs_music":
      return ((durationSeconds || 0) / 60) * COST_RATES.elevenlabs_music.ratePerMinute;

    // ElevenLabs Voice - character based (chars passed as inputTokens)
    case "elevenlabs_voice":
      return (inputTokens || 0) * COST_RATES.elevenlabs_voice.ratePerChar;

    // Anthropic - token based
    case "anthropic":
    case "anthropic_haiku":
      return (
        (inputTokens || 0) * COST_RATES.anthropic_haiku.inputRatePerToken +
        (outputTokens || 0) * COST_RATES.anthropic_haiku.outputRatePerToken
      );
    case "anthropic_haiku35":
      return (
        (inputTokens || 0) * COST_RATES.anthropic_haiku35.inputRatePerToken +
        (outputTokens || 0) * COST_RATES.anthropic_haiku35.outputRatePerToken
      );
    case "anthropic_sonnet":
      return (
        (inputTokens || 0) * COST_RATES.anthropic_sonnet.inputRatePerToken +
        (outputTokens || 0) * COST_RATES.anthropic_sonnet.outputRatePerToken
      );

    // Replicate - per image
    case "replicate":
    case "replicate_flux_schnell":
      return COST_RATES.replicate_flux_schnell.ratePerImage;
    case "replicate_flux_dev":
      return COST_RATES.replicate_flux_dev.ratePerImage;

    // xAI - token based
    case "xai":
    case "xai_grok":
      return (
        (inputTokens || 0) * COST_RATES.xai_grok.inputRatePerToken +
        (outputTokens || 0) * COST_RATES.xai_grok.outputRatePerToken
      );

    // Storage - size based
    case "storage":
    case "vercel_blob":
      return ((bytesStored || 0) / (1024 * 1024 * 1024)) * COST_RATES.vercel_blob.ratePerGBStored;

    default:
      console.warn(`Unknown service for cost calculation: ${service}`);
      return 0;
  }
}

/**
 * Log a cost event to the database
 */
export async function trackCost(event: CostEventInput): Promise<number> {
  const estimatedCost = calculateCost(event);

  try {
    // Map extended service names to base DB enum values
    // Store the original service name in model if not already set
    const dbService = mapToDbService(event.service);
    const model = event.model || (event.service !== dbService ? event.service : undefined);

    await db.insert(costEvents).values({
      id: crypto.randomUUID(),
      service: dbService,
      model,
      inputTokens: event.inputTokens,
      outputTokens: event.outputTokens,
      durationSeconds: event.durationSeconds,
      bytesStored: event.bytesStored,
      estimatedCost,
      userId: event.userId,
      trackId: event.trackId,
    });

    return estimatedCost;
  } catch (error) {
    console.error("Failed to track cost:", error);
    return estimatedCost;
  }
}

/**
 * Track ElevenLabs music generation
 */
export async function trackMusicGeneration(
  durationSeconds: number,
  userId?: string,
  trackId?: string
): Promise<number> {
  return trackCost({
    service: "elevenlabs_music",
    model: "music_v1",
    durationSeconds,
    userId,
    trackId,
  });
}

/**
 * Track Claude API call
 */
export async function trackClaudeCall(
  model: "haiku" | "haiku35" | "sonnet",
  inputTokens: number,
  outputTokens: number,
  userId?: string,
  trackId?: string
): Promise<number> {
  const serviceMap = {
    haiku: "anthropic_haiku",
    haiku35: "anthropic_haiku35",
    sonnet: "anthropic_sonnet",
  };

  return trackCost({
    service: serviceMap[model],
    model: `claude-3${model === "haiku35" ? ".5" : ""}-${model === "sonnet" ? "sonnet" : "haiku"}`,
    inputTokens,
    outputTokens,
    userId,
    trackId,
  });
}

/**
 * Track Replicate image generation
 */
export async function trackImageGeneration(
  model: "schnell" | "dev" = "schnell",
  userId?: string,
  trackId?: string
): Promise<number> {
  return trackCost({
    service: model === "schnell" ? "replicate_flux_schnell" : "replicate_flux_dev",
    model: `flux-${model}`,
    userId,
    trackId,
  });
}

/**
 * Track ElevenLabs voice/TTS
 */
export async function trackVoiceGeneration(
  characters: number,
  userId?: string,
  trackId?: string
): Promise<number> {
  return trackCost({
    service: "elevenlabs_voice",
    model: "eleven_multilingual_v2",
    inputTokens: characters, // Store chars as "tokens" for simplicity
    userId,
    trackId,
  });
}

/**
 * Get cost summary for a user
 */
export async function getUserCostSummary(
  userId: string,
  startDate?: Date
): Promise<{
  total: number;
  byService: Record<string, number>;
}> {
  const { sql: sqlFn, gte, eq, and, sum } = await import("drizzle-orm");

  const query = startDate
    ? and(eq(costEvents.userId, userId), gte(costEvents.createdAt, startDate))
    : eq(costEvents.userId, userId);

  const results = await db
    .select({
      service: costEvents.service,
      total: sum(costEvents.estimatedCost),
    })
    .from(costEvents)
    .where(query)
    .groupBy(costEvents.service);

  const byService: Record<string, number> = {};
  let total = 0;

  for (const row of results) {
    const amount = Number(row.total) || 0;
    byService[row.service || "unknown"] = amount;
    total += amount;
  }

  return { total, byService };
}

/**
 * Estimate cost for a track generation
 */
export function estimateTrackCost(options: {
  musicDurationSeconds?: number;
  lyricsTokens?: number;
  storyTokens?: number;
  albumArt?: boolean;
  model?: "haiku" | "sonnet";
}): number {
  const {
    musicDurationSeconds = 60,
    lyricsTokens = 1500,
    storyTokens = 500,
    albumArt = false,
    model = "haiku",
  } = options;

  let cost = 0;

  // Music generation
  cost += (musicDurationSeconds / 60) * COST_RATES.elevenlabs_music.ratePerMinute;

  // Claude for lyrics + story
  const claudeRates = model === "sonnet" ? COST_RATES.anthropic_sonnet : COST_RATES.anthropic_haiku;
  cost += (lyricsTokens + storyTokens) * claudeRates.inputRatePerToken;
  cost += (lyricsTokens / 2) * claudeRates.outputRatePerToken; // Estimate output

  // Album art
  if (albumArt) {
    cost += COST_RATES.replicate_flux_schnell.ratePerImage;
  }

  return cost;
}
