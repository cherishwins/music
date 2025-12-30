/**
 * Creative Hub Database Schema
 * Turso (LibSQL) + Drizzle ORM
 *
 * This is the source of truth for:
 * - Users (tied to Telegram ID)
 * - Tracks (metadata + storage URLs)
 * - Transactions (Stars, TON, x402)
 * - Cost tracking (API usage analytics)
 * - Revenue tracking (payment events)
 */

import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
} from "drizzle-orm/sqlite-core";

// ============================================
// USERS
// ============================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  telegramId: integer("telegram_id").unique().notNull(),
  telegramUsername: text("telegram_username"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),

  // Monetization
  tier: text("tier", { enum: ["free", "creator", "studio"] })
    .default("free")
    .notNull(),
  tierExpiresAt: integer("tier_expires_at", { mode: "timestamp" }),
  credits: integer("credits").default(0).notNull(),

  // Limits
  trackCount: integer("track_count").default(0).notNull(),
  monthlyGenerations: integer("monthly_generations").default(0).notNull(),
  monthlyGenerationsResetAt: integer("monthly_generations_reset_at", {
    mode: "timestamp",
  }),

  // First generation free (zero-friction onboarding)
  hasUsedFreeGeneration: integer("has_used_free_generation", { mode: "boolean" }).default(false),

  // Attribution
  discoverySource: text("discovery_source", {
    enum: [
      "telegram_search",
      "telegram_channel",
      "findmini",
      "tapps_center",
      "mcp_directory",
      "product_hunt",
      "tiktok",
      "twitter",
      "referral",
      "direct",
      "unknown",
    ],
  }),
  referredBy: text("referred_by"), // referral code that brought them

  // Metadata
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// TRACKS
// ============================================

export const tracks = sqliteTable("tracks", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Track metadata
  title: text("title").notNull(),
  description: text("description"),
  genre: text("genre"),
  bpm: integer("bpm"),
  key: text("key"),
  durationSeconds: integer("duration_seconds"),

  // Files (Vercel Blob URLs)
  audioUrl: text("audio_url").notNull(), // Watermarked for free tier
  audioUrlClean: text("audio_url_clean"), // Unwatermarked for paid
  coverUrl: text("cover_url"),

  // AI generation metadata
  prompt: text("prompt"),
  compositionPlan: text("composition_plan"), // JSON string
  artistProfile: text("artist_profile"), // JucheGang character used
  generationCost: real("generation_cost"), // $ spent to generate

  // Hit DNA (vector reference)
  qdrantPointId: text("qdrant_point_id"), // Link to Qdrant vector

  // Community
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  likesCount: integer("likes_count").default(0),
  playsCount: integer("plays_count").default(0),
  sharesCount: integer("shares_count").default(0),

  // Monetization
  isWatermarked: integer("is_watermarked", { mode: "boolean" }).default(true),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// TRANSACTIONS (Revenue tracking)
// ============================================

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Payment details
  type: text("type", {
    enum: ["subscription", "credits", "one_time", "x402"],
  }).notNull(),
  paymentMethod: text("payment_method", {
    enum: ["stars", "ton", "x402", "stripe", "coinbase"],
  }).notNull(),

  // Amounts
  grossAmount: real("gross_amount").notNull(),
  platformFee: real("platform_fee").default(0), // Telegram's 30%, etc.
  netAmount: real("net_amount").notNull(),
  currency: text("currency").notNull(), // USD, TON, STARS

  // What they bought
  product: text("product").notNull(), // 'creator_tier', 'studio_tier', etc.

  // External IDs for reconciliation
  telegramPaymentId: text("telegram_payment_id"),
  tonTransactionHash: text("ton_transaction_hash"),
  x402PaymentId: text("x402_payment_id"),
  stripePaymentId: text("stripe_payment_id"),

  // Status
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"],
  })
    .default("pending")
    .notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// COST EVENTS (API usage tracking)
// ============================================

export const costEvents = sqliteTable("cost_events", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  trackId: text("track_id").references(() => tracks.id, { onDelete: "set null" }),

  // Service details
  service: text("service", {
    enum: [
      "elevenlabs_music",
      "elevenlabs_voice",
      "anthropic",
      "xai",
      "replicate",
      "storage",
      "embedding",
    ],
  }).notNull(),
  model: text("model"),

  // Usage metrics
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  durationSeconds: integer("duration_seconds"),
  bytesStored: integer("bytes_stored"),

  // Cost
  estimatedCost: real("estimated_cost").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// COMMUNITY POSTS
// ============================================

export const communityPosts = sqliteTable("community_posts", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  trackId: text("track_id")
    .references(() => tracks.id, { onDelete: "cascade" })
    .notNull(),

  caption: text("caption"),

  // Engagement
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),

  // Visibility
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// LIKES
// ============================================

export const likes = sqliteTable("likes", {
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  postId: text("post_id")
    .references(() => communityPosts.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// HIT SONGS (Reference library for learning)
// ============================================

export const hitSongs = sqliteTable("hit_songs", {
  id: text("id").primaryKey(), // UUID

  // Song metadata
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  releaseYear: integer("release_year"),
  genre: text("genre"),

  // Audio features
  bpm: real("bpm"),
  key: text("key"),
  durationSeconds: integer("duration_seconds"),
  energy: real("energy"), // 0-1
  danceability: real("danceability"), // 0-1
  valence: real("valence"), // 0-1 (positivity)

  // Chart performance
  peakPosition: integer("peak_position"),
  weeksOnChart: integer("weeks_on_chart"),
  spotifyStreams: integer("spotify_streams"),

  // Vector reference
  qdrantPointId: text("qdrant_point_id"), // Link to Qdrant embedding

  // Analysis
  hookTimingSeconds: real("hook_timing_seconds"),
  sectionStructure: text("section_structure"), // JSON: [{type, start, end}]
  energyCurve: text("energy_curve"), // JSON: [0.2, 0.4, 0.8, ...]

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// ANALYTICS (Daily aggregates)
// ============================================

export const dailyMetrics = sqliteTable("daily_metrics", {
  id: text("id").primaryKey(), // date-based ID: "2024-12-28"
  date: text("date").notNull().unique(),

  // Revenue
  revenueStars: real("revenue_stars").default(0),
  revenueTon: real("revenue_ton").default(0),
  revenueX402: real("revenue_x402").default(0),
  revenueTotal: real("revenue_total").default(0),

  // Costs
  costElevenlabs: real("cost_elevenlabs").default(0),
  costAnthropic: real("cost_anthropic").default(0),
  costStorage: real("cost_storage").default(0),
  costTotal: real("cost_total").default(0),

  // Profit
  netProfit: real("net_profit").default(0),

  // Usage
  tracksGenerated: integer("tracks_generated").default(0),
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),
  conversions: integer("conversions").default(0), // Free → Paid

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// FUNNEL EVENTS (Customer Journey Tracking)
// ============================================

export const funnelEvents = sqliteTable("funnel_events", {
  id: text("id").primaryKey(), // UUID

  // User identification (can be null for anonymous first visit)
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  anonymousId: text("anonymous_id"), // fingerprint/session for pre-signup tracking
  sessionId: text("session_id").notNull(), // ties events in same session

  // Event details
  event: text("event", {
    enum: [
      "page_view",
      "generate_start",
      "generate_complete",
      "preview_play",
      "download_watermarked",
      "download_attempt_clean", // tried to download clean (paywall shown)
      "payment_started",
      "payment_completed",
      "signup",
      "share",
    ],
  }).notNull(),

  // Discovery attribution
  discoverySource: text("discovery_source", {
    enum: [
      "telegram_search",
      "telegram_channel",
      "findmini",
      "tapps_center",
      "mcp_directory",
      "product_hunt",
      "tiktok",
      "twitter",
      "referral",
      "direct",
      "unknown",
    ],
  }),
  referralCode: text("referral_code"), // if referred by another user
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),

  // Context
  trackId: text("track_id").references(() => tracks.id, { onDelete: "set null" }),
  pageUrl: text("page_url"),

  // A/B Testing
  experimentId: text("experiment_id"), // e.g., "watermark_severity_test"
  variant: text("variant"), // e.g., "audio_watermark" vs "fade_watermark"

  // Device info
  platform: text("platform", {
    enum: ["telegram_miniapp", "web", "mcp", "api"],
  }),
  userAgent: text("user_agent"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// A/B EXPERIMENTS
// ============================================

export const experiments = sqliteTable("experiments", {
  id: text("id").primaryKey(), // e.g., "first_gen_free_v1"
  name: text("name").notNull(),
  description: text("description"),

  // Variants as JSON: [{"id": "control", "weight": 50}, {"id": "treatment", "weight": 50}]
  variants: text("variants").notNull(),

  // Targeting
  targetPercentage: integer("target_percentage").default(100), // % of users in experiment

  // Status
  status: text("status", {
    enum: ["draft", "running", "paused", "completed"],
  }).default("draft").notNull(),

  // Results tracking
  primaryMetric: text("primary_metric"), // e.g., "payment_completed"
  secondaryMetrics: text("secondary_metrics"), // JSON array

  startedAt: integer("started_at", { mode: "timestamp" }),
  endedAt: integer("ended_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// REFERRALS
// ============================================

export const referrals = sqliteTable("referrals", {
  id: text("id").primaryKey(),

  // Referrer
  referrerId: text("referrer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  referralCode: text("referral_code").unique().notNull(), // e.g., "TIGER_ABC123"

  // Stats
  clickCount: integer("click_count").default(0),
  signupCount: integer("signup_count").default(0),
  conversionCount: integer("conversion_count").default(0), // signups who paid

  // Rewards
  creditsEarned: integer("credits_earned").default(0),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type CostEvent = typeof costEvents.$inferSelect;
export type NewCostEvent = typeof costEvents.$inferInsert;
export type HitSong = typeof hitSongs.$inferSelect;
export type NewHitSong = typeof hitSongs.$inferInsert;
export type FunnelEvent = typeof funnelEvents.$inferSelect;
export type NewFunnelEvent = typeof funnelEvents.$inferInsert;
export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
