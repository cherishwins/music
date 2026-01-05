/**
 * Cross-App Schema Extensions
 *
 * These tables extend the base schema to support data flows
 * from all apps in the jpanda-network ecosystem:
 * - blockburnnn (token scanner)
 * - notaryton-bot (notary seals)
 * - memeseal-casino (gaming)
 * - 1929-world (finance dashboard)
 */

import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { users } from "./schema";

// ============================================
// TOKEN SCORES (From blockburnnn scanner)
// ============================================

export const tokenScores = sqliteTable("token_scores", {
  id: text("id").primaryKey(), // UUID

  // Token identification
  contractAddress: text("contract_address").notNull().unique(),
  chain: text("chain", {
    enum: ["ton", "base", "solana", "ethereum"],
  }).default("ton").notNull(),

  // Basic info
  name: text("name"),
  symbol: text("symbol"),
  decimals: integer("decimals"),
  totalSupply: text("total_supply"), // String for large numbers

  // Rug score (0-100, higher = safer)
  rugScore: integer("rug_score").notNull(),
  rugGrade: text("rug_grade", {
    enum: ["A", "B", "C", "D", "F"],
  }).notNull(),

  // Score factors (JSON breakdown)
  factors: text("factors").notNull(), // JSON: {liquidityLocked, ownershipRenounced, honeypotRisk, etc.}

  // Market data
  price: real("price"),
  marketCap: real("market_cap"),
  liquidity: real("liquidity"),
  holders: integer("holders"),

  // Risk flags
  isHoneypot: integer("is_honeypot", { mode: "boolean" }).default(false),
  hasUnlimitedMint: integer("has_unlimited_mint", { mode: "boolean" }).default(false),
  ownerCanPause: integer("owner_can_pause", { mode: "boolean" }).default(false),
  hiddenOwner: integer("hidden_owner", { mode: "boolean" }).default(false),

  // Social links (if available)
  telegramUrl: text("telegram_url"),
  twitterUrl: text("twitter_url"),
  websiteUrl: text("website_url"),

  // Vector reference for similarity search
  qdrantPointId: text("qdrant_point_id"),

  // Scan metadata
  scanCount: integer("scan_count").default(1),
  lastScannedAt: integer("last_scanned_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// NOTARY SEALS (From notaryton-bot)
// ============================================

export const notarySeals = sqliteTable("notary_seals", {
  id: text("id").primaryKey(), // UUID

  // Who created the seal
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  telegramId: integer("telegram_id"), // For non-registered users

  // Content being sealed
  contentType: text("content_type", {
    enum: ["message", "document", "image", "transaction", "contract"],
  }).notNull(),
  contentHash: text("content_hash").notNull(), // SHA-256 of content
  contentPreview: text("content_preview"), // First 100 chars or thumbnail URL

  // Blockchain attestation
  chain: text("chain", {
    enum: ["ton"],
  }).default("ton").notNull(),
  txHash: text("tx_hash"), // Blockchain transaction hash
  blockNumber: integer("block_number"),
  attestedAt: integer("attested_at", { mode: "timestamp" }),

  // Payment
  paidStars: integer("paid_stars").default(1),

  // Verification
  verificationUrl: text("verification_url"), // Public URL to verify
  qrCodeUrl: text("qr_code_url"),

  // Status
  status: text("status", {
    enum: ["pending", "attested", "failed"],
  }).default("pending").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// CASINO SESSIONS (From memeseal-casino)
// ============================================

export const casinoSessions = sqliteTable("casino_sessions", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  telegramId: integer("telegram_id").notNull(),

  // Game details
  game: text("game", {
    enum: ["slots", "roulette", "crash", "dice", "coin_flip"],
  }).notNull(),

  // Betting
  betAmount: real("bet_amount").notNull(),
  currency: text("currency", {
    enum: ["stars", "ton", "points"],
  }).default("points").notNull(),

  // Result
  outcome: text("outcome", {
    enum: ["win", "loss", "draw", "jackpot"],
  }).notNull(),
  winAmount: real("win_amount"),
  multiplier: real("multiplier"),

  // Game-specific data
  gameData: text("game_data"), // JSON with slot symbols, roulette number, etc.

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// CROSS-APP ANALYTICS EVENTS
// ============================================

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").primaryKey(), // UUID

  // User identification (flexible for cross-app)
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  telegramId: integer("telegram_id"),
  tonAddress: text("ton_address"),
  evmAddress: text("evm_address"), // Base/ETH address
  sessionId: text("session_id"),

  // Event details
  app: text("app", {
    enum: ["creative-hub", "blockburnnn", "notaryton-bot", "memeseal-casino", "1929-world"],
  }).notNull(),
  event: text("event").notNull(), // e.g., "token_scanned", "seal_created", "game_played"
  category: text("category", {
    enum: ["engagement", "conversion", "revenue", "feature", "error"],
  }).notNull(),

  // Event properties (flexible JSON)
  properties: text("properties"), // JSON with event-specific data

  // Value tracking
  value: real("value"), // Monetary value if applicable
  currency: text("currency"),

  // Context
  platform: text("platform", {
    enum: ["telegram_miniapp", "web", "bot", "api"],
  }),
  referrer: text("referrer"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// USER WALLET LINKS (Cross-chain identity)
// ============================================

export const userWallets = sqliteTable("user_wallets", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Wallet details
  chain: text("chain", {
    enum: ["ton", "base", "ethereum", "solana"],
  }).notNull(),
  address: text("address").notNull(),

  // Verification
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  verificationMethod: text("verification_method", {
    enum: ["ton_connect", "wallet_connect", "signature", "manual"],
  }),

  // Primary wallet flag
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),

  // Activity
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// API KEYS (For external integrations)
// ============================================

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Key details
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(), // SHA-256 hash (don't store plaintext!)
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for identification

  // Permissions
  permissions: text("permissions").notNull(), // JSON array: ["music:generate", "rug:score", etc.]

  // Rate limits
  rateLimit: integer("rate_limit").default(100), // Requests per hour

  // Usage
  requestCount: integer("request_count").default(0),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),

  // Status
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  expiresAt: integer("expires_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type TokenScore = typeof tokenScores.$inferSelect;
export type NewTokenScore = typeof tokenScores.$inferInsert;
export type NotarySeal = typeof notarySeals.$inferSelect;
export type NewNotarySeal = typeof notarySeals.$inferInsert;
export type CasinoSession = typeof casinoSessions.$inferSelect;
export type NewCasinoSession = typeof casinoSessions.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type UserWallet = typeof userWallets.$inferSelect;
export type NewUserWallet = typeof userWallets.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
