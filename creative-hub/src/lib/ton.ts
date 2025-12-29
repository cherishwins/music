/**
 * TON Connect Payment Integration
 * For Telegram Mini App native crypto payments
 *
 * As of Feb 2025, TON is the ONLY blockchain allowed in Telegram Mini Apps.
 * 87M+ US users have TON Wallet built into Telegram.
 */

// TON Connect manifest URL (update with your deployed URL)
export const TON_MANIFEST_URL =
  process.env.NEXT_PUBLIC_TON_MANIFEST_URL ||
  "https://creative-hub.vercel.app/tonconnect-manifest.json";

// Payment receiving address
export const TON_PAYMENT_ADDRESS =
  process.env.NEXT_PUBLIC_TON_PAYMENT_ADDRESS ||
  process.env.TON_PAYMENT_ADDRESS;

// Pricing in TON (approximate, update based on TON/USD rate)
export const TON_PRICING = {
  starter: {
    ton: "0.5", // ~$0.50
    credits: 100,
  },
  creator: {
    ton: "2", // ~$2
    credits: 500,
  },
  studio: {
    ton: "5", // ~$5
    credits: 2000,
  },
} as const;

export type TonPlanId = keyof typeof TON_PRICING;

/**
 * Create TON transfer transaction parameters
 */
export function createTonPayment(
  planId: TonPlanId,
  userId?: string
): {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
  }>;
} {
  const plan = TON_PRICING[planId];
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  if (!TON_PAYMENT_ADDRESS) {
    throw new Error("TON_PAYMENT_ADDRESS not configured");
  }

  // Convert TON to nanotons (1 TON = 10^9 nanotons)
  const amountNanotons = (parseFloat(plan.ton) * 1e9).toString();

  // Create payload with plan info (for tracking)
  const payloadComment = `creative-hub:${planId}:${userId || "anon"}:${Date.now()}`;

  return {
    validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    messages: [
      {
        address: TON_PAYMENT_ADDRESS,
        amount: amountNanotons,
        payload: payloadComment,
      },
    ],
  };
}

/**
 * Parse payment comment to extract plan info
 */
export function parsePaymentComment(comment: string): {
  planId: TonPlanId;
  userId: string;
  timestamp: number;
} | null {
  if (!comment.startsWith("creative-hub:")) {
    return null;
  }

  const parts = comment.split(":");
  if (parts.length !== 4) {
    return null;
  }

  const [, planId, userId, timestamp] = parts;

  if (!TON_PRICING[planId as TonPlanId]) {
    return null;
  }

  return {
    planId: planId as TonPlanId,
    userId,
    timestamp: parseInt(timestamp, 10),
  };
}

/**
 * Format TON amount for display
 */
export function formatTon(nanotons: string | number): string {
  const ton = Number(nanotons) / 1e9;
  return ton.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

/**
 * Convert TON to USD (approximate)
 * In production, use a price feed API
 */
export function tonToUsd(ton: number, rate: number = 1.0): number {
  return ton * rate;
}

/**
 * Check if running inside Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp;
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp || null;
}
