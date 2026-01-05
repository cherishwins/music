/**
 * Shared API Layer - Cross-App Data Access
 *
 * Central data access layer for all jpanda-network apps.
 * This module provides:
 * - Unified user management across apps
 * - Cross-app analytics tracking
 * - Shared authentication
 */

import { db } from "../db";
import {
  users,
  analyticsEvents,
  userWallets,
  apiKeys,
  NewAnalyticsEvent,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get or create user by Telegram ID
 * This is the primary identity method across all apps
 */
export async function getOrCreateUser(params: {
  telegramId: number;
  telegramUsername?: string;
  displayName?: string;
  discoverySource?: string;
}) {
  const { telegramId, telegramUsername, displayName, discoverySource } = params;

  // Try to find existing user
  const existing = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });

  if (existing) {
    // Update username if changed
    if (telegramUsername && telegramUsername !== existing.telegramUsername) {
      await db
        .update(users)
        .set({ telegramUsername, updatedAt: new Date() })
        .where(eq(users.id, existing.id));
    }
    return existing;
  }

  // Create new user
  const userId = crypto.randomUUID();
  await db.insert(users).values({
    id: userId,
    telegramId,
    telegramUsername,
    displayName: displayName || telegramUsername || `User ${telegramId}`,
    discoverySource: discoverySource as any || "unknown",
  });

  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

/**
 * Get user by any identifier (Telegram ID, wallet address, or user ID)
 */
export async function getUserByIdentifier(identifier: {
  userId?: string;
  telegramId?: number;
  tonAddress?: string;
  evmAddress?: string;
}) {
  if (identifier.userId) {
    return db.query.users.findFirst({
      where: eq(users.id, identifier.userId),
    });
  }

  if (identifier.telegramId) {
    return db.query.users.findFirst({
      where: eq(users.telegramId, identifier.telegramId),
    });
  }

  if (identifier.tonAddress || identifier.evmAddress) {
    const wallet = await db.query.userWallets.findFirst({
      where: identifier.tonAddress
        ? and(
            eq(userWallets.address, identifier.tonAddress),
            eq(userWallets.chain, "ton")
          )
        : and(
            eq(userWallets.address, identifier.evmAddress!),
            eq(userWallets.chain, "base")
          ),
    });

    if (wallet) {
      return db.query.users.findFirst({
        where: eq(users.id, wallet.userId),
      });
    }
  }

  return null;
}

/**
 * Link a wallet to a user
 */
export async function linkWallet(params: {
  userId: string;
  chain: "ton" | "base" | "ethereum" | "solana";
  address: string;
  isPrimary?: boolean;
  verificationMethod?: "ton_connect" | "wallet_connect" | "signature" | "manual";
}) {
  const { userId, chain, address, isPrimary, verificationMethod } = params;
  const walletId = crypto.randomUUID();

  // If setting as primary, unset other primary wallets for this chain
  if (isPrimary) {
    await db
      .update(userWallets)
      .set({ isPrimary: false })
      .where(and(eq(userWallets.userId, userId), eq(userWallets.chain, chain)));
  }

  await db.insert(userWallets).values({
    id: walletId,
    userId,
    chain,
    address,
    isPrimary: isPrimary ?? false,
    isVerified: !!verificationMethod,
    verifiedAt: verificationMethod ? new Date() : undefined,
    verificationMethod,
  });

  return walletId;
}

// ============================================
// ANALYTICS
// ============================================

type AppName = "creative-hub" | "blockburnnn" | "notaryton-bot" | "memeseal-casino" | "1929-world";
type EventCategory = "engagement" | "conversion" | "revenue" | "feature" | "error";

/**
 * Track an analytics event from any app
 */
export async function trackEvent(params: {
  app: AppName;
  event: string;
  category: EventCategory;
  userId?: string;
  telegramId?: number;
  tonAddress?: string;
  evmAddress?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  value?: number;
  currency?: string;
  platform?: "telegram_miniapp" | "web" | "bot" | "api";
  referrer?: string;
}) {
  const eventId = crypto.randomUUID();

  await db.insert(analyticsEvents).values({
    id: eventId,
    app: params.app,
    event: params.event,
    category: params.category,
    userId: params.userId,
    telegramId: params.telegramId,
    tonAddress: params.tonAddress,
    evmAddress: params.evmAddress,
    sessionId: params.sessionId,
    properties: params.properties ? JSON.stringify(params.properties) : undefined,
    value: params.value,
    currency: params.currency,
    platform: params.platform,
    referrer: params.referrer,
  });

  return eventId;
}

/**
 * Batch track multiple events
 */
export async function trackEvents(events: Array<{
  app: AppName;
  event: string;
  category: EventCategory;
  userId?: string;
  telegramId?: number;
  properties?: Record<string, unknown>;
}>) {
  const values = events.map((e) => ({
    id: crypto.randomUUID(),
    app: e.app,
    event: e.event,
    category: e.category,
    userId: e.userId,
    telegramId: e.telegramId,
    properties: e.properties ? JSON.stringify(e.properties) : undefined,
  }));

  await db.insert(analyticsEvents).values(values);
  return values.map((v) => v.id);
}

// ============================================
// API KEY MANAGEMENT
// ============================================

/**
 * Generate a new API key for a user
 */
export async function generateApiKey(params: {
  userId: string;
  name: string;
  permissions: string[];
  rateLimit?: number;
  expiresInDays?: number;
}): Promise<{ key: string; keyId: string }> {
  const { userId, name, permissions, rateLimit, expiresInDays } = params;

  // Generate random key
  const keyBytes = crypto.randomBytes(32);
  const key = `jpn_${keyBytes.toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const keyPrefix = key.substring(0, 12);
  const keyId = crypto.randomUUID();

  await db.insert(apiKeys).values({
    id: keyId,
    userId,
    name,
    keyHash,
    keyPrefix,
    permissions: JSON.stringify(permissions),
    rateLimit: rateLimit ?? 100,
    expiresAt: expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined,
  });

  return { key, keyId };
}

/**
 * Validate an API key and return the user
 */
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
}> {
  if (!key.startsWith("jpn_")) {
    return { valid: false, error: "Invalid key format" };
  }

  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const apiKey = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, keyHash),
  });

  if (!apiKey) {
    return { valid: false, error: "Key not found" };
  }

  if (!apiKey.isActive) {
    return { valid: false, error: "Key is inactive" };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: "Key has expired" };
  }

  // Update usage stats
  await db
    .update(apiKeys)
    .set({
      requestCount: (apiKey.requestCount ?? 0) + 1,
      lastUsedAt: new Date(),
    })
    .where(eq(apiKeys.id, apiKey.id));

  return {
    valid: true,
    userId: apiKey.userId,
    permissions: JSON.parse(apiKey.permissions),
  };
}

// ============================================
// CROSS-APP QUERIES
// ============================================

/**
 * Get user's activity across all apps
 */
export async function getUserCrossAppActivity(userId: string) {
  const [user, wallets, events] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    db.query.userWallets.findMany({
      where: eq(userWallets.userId, userId),
    }),
    db.query.analyticsEvents.findMany({
      where: eq(analyticsEvents.userId, userId),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
      limit: 100,
    }),
  ]);

  // Group events by app
  const eventsByApp = events.reduce(
    (acc, event) => {
      if (!acc[event.app]) {
        acc[event.app] = [];
      }
      acc[event.app].push(event);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  return {
    user,
    wallets,
    activity: eventsByApp,
    stats: {
      totalEvents: events.length,
      appsUsed: Object.keys(eventsByApp).length,
      walletsLinked: wallets.length,
    },
  };
}
