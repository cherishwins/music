/**
 * Database Client
 * Turso (LibSQL) + Drizzle ORM
 *
 * Uses edge-compatible LibSQL client that works everywhere:
 * - Vercel Edge Functions
 * - Cloudflare Workers
 * - Node.js
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Create LibSQL client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export * from "./schema";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a UUID (compatible with SQLite)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get or create user by Telegram ID
 */
export async function getOrCreateUser(telegramUser: {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}) {
  const existing = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.telegramId, telegramUser.id),
  });

  if (existing) {
    return existing;
  }

  const displayName = [telegramUser.first_name, telegramUser.last_name]
    .filter(Boolean)
    .join(" ");

  const [newUser] = await db
    .insert(schema.users)
    .values({
      id: generateId(),
      telegramId: telegramUser.id,
      telegramUsername: telegramUser.username,
      displayName: displayName || `User ${telegramUser.id}`,
    })
    .returning();

  return newUser;
}

/**
 * Track API cost
 */
export async function trackCost(event: {
  service: schema.CostEvent["service"];
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  durationSeconds?: number;
  bytesStored?: number;
  estimatedCost: number;
  userId?: string;
  trackId?: string;
}) {
  await db.insert(schema.costEvents).values({
    id: generateId(),
    ...event,
  });
}

/**
 * Record revenue
 */
export async function recordRevenue(event: {
  userId: string;
  type: schema.Transaction["type"];
  paymentMethod: schema.Transaction["paymentMethod"];
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  product: string;
  telegramPaymentId?: string;
  tonTransactionHash?: string;
  x402PaymentId?: string;
}) {
  await db.insert(schema.transactions).values({
    id: generateId(),
    ...event,
    status: "completed",
  });
}

/**
 * Upgrade user tier
 */
export async function upgradeTier(
  userId: string,
  tier: "creator" | "studio",
  durationDays: number = 30
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await db
    .update(schema.users)
    .set({
      tier,
      tierExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where((users, { eq }) => eq(users.id, userId));
}

/**
 * Check if user can generate (tier + limits)
 */
export async function canGenerate(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  tier: string;
}> {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user) {
    return { allowed: false, reason: "User not found", tier: "free" };
  }

  // Check tier expiration
  if (user.tier !== "free" && user.tierExpiresAt) {
    if (new Date() > user.tierExpiresAt) {
      // Tier expired, downgrade
      await db
        .update(schema.users)
        .set({ tier: "free", updatedAt: new Date() })
        .where((users, { eq }) => eq(users.id, userId));

      return { allowed: false, reason: "Subscription expired", tier: "free" };
    }
  }

  // Check monthly limits
  const limits = {
    free: 3,
    creator: 50,
    studio: Infinity,
  };

  const limit = limits[user.tier as keyof typeof limits];

  if (user.monthlyGenerations >= limit) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${limit} tracks)`,
      tier: user.tier,
    };
  }

  return { allowed: true, tier: user.tier };
}

/**
 * Increment generation count
 */
export async function incrementGenerations(userId: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (!user) return;

  // Reset if new month
  const now = new Date();
  const resetAt = user.monthlyGenerationsResetAt;
  const shouldReset = !resetAt || now.getMonth() !== resetAt.getMonth();

  await db
    .update(schema.users)
    .set({
      monthlyGenerations: shouldReset ? 1 : user.monthlyGenerations + 1,
      monthlyGenerationsResetAt: now,
      trackCount: user.trackCount + 1,
      updatedAt: now,
    })
    .where((users, { eq }) => eq(users.id, userId));
}
