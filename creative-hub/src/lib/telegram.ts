/**
 * Telegram Bot Integration
 * Handles Stars payments and bot interactions
 */

import { Bot } from "grammy";

// Initialize bot (lazy - only when needed)
let bot: Bot | null = null;

function getBot(): Bot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }
    bot = new Bot(token);
  }
  return bot;
}

// Plan configuration with Star prices
export const STAR_PLANS = {
  starter: {
    title: "Starter Plan",
    description: "100 AI generation credits for Creative Hub",
    stars: 50,
    credits: 100,
  },
  creator: {
    title: "Creator Plan",
    description: "500 AI generation credits with priority processing",
    stars: 200,
    credits: 500,
  },
  studio: {
    title: "Studio Plan",
    description: "2000 AI generation credits with all premium features",
    stars: 500,
    credits: 2000,
  },
} as const;

export type PlanId = keyof typeof STAR_PLANS;

/**
 * Create a Telegram Stars invoice link
 */
export async function createStarsInvoice(
  planId: PlanId,
  userId: string
): Promise<string> {
  const plan = STAR_PLANS[planId];
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  const telegramBot = getBot();

  const payload = JSON.stringify({
    planId,
    userId,
    credits: plan.credits,
    timestamp: Date.now(),
  });

  const prices = [
    {
      label: plan.title,
      amount: plan.stars, // Stars amount (no decimal conversion needed)
    },
  ];

  // Create invoice link using Telegram Bot API
  // grammY's createInvoiceLink takes individual parameters
  const invoiceLink = await telegramBot.api.createInvoiceLink(
    plan.title,
    plan.description,
    payload,
    "", // provider_token - Empty for Telegram Stars (digital goods)
    "XTR", // currency - XTR = Telegram Stars
    prices
  );

  return invoiceLink;
}

/**
 * Verify a successful payment from Telegram
 */
export interface PaymentPayload {
  planId: PlanId;
  userId: string;
  credits: number;
  timestamp: number;
}

export function parsePaymentPayload(payload: string): PaymentPayload {
  try {
    return JSON.parse(payload) as PaymentPayload;
  } catch {
    throw new Error("Invalid payment payload");
  }
}

/**
 * Send a message to a user
 */
export async function sendMessage(
  chatId: number | string,
  text: string
): Promise<void> {
  const telegramBot = getBot();
  await telegramBot.api.sendMessage(chatId, text, {
    parse_mode: "HTML",
  });
}

/**
 * Validate Telegram WebApp init data
 * Implements HMAC-SHA256 validation per Telegram spec
 * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData: string): boolean {
  if (!initData) return false;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("[Telegram] No bot token configured for validation");
    return false;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");

    if (!hash) {
      return false;
    }

    // Remove hash from params for verification
    params.delete("hash");

    // Sort params alphabetically and create data check string
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Create secret key: HMAC-SHA256 of bot token with "WebAppData"
    const crypto = require("crypto");
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Calculate expected hash
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Compare hashes
    return calculatedHash === hash;
  } catch (err) {
    console.error("[Telegram] Validation error:", err);
    return false;
  }
}

/**
 * Parse user data from init data
 */
export function parseInitData(initData: string): {
  user?: { id: number; first_name: string; username?: string };
  query_id?: string;
  auth_date?: number;
} | null {
  if (!initData) return null;

  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get("user");

    return {
      user: userJson ? JSON.parse(userJson) : undefined,
      query_id: params.get("query_id") || undefined,
      auth_date: params.get("auth_date") ? parseInt(params.get("auth_date")!) : undefined,
    };
  } catch {
    return null;
  }
}
