/**
 * Settlement Service - Order Processing After Payment
 *
 * This module handles the complete order fulfillment flow:
 * 1. Verify payment (on-chain or via webhook)
 * 2. Process the order (generate content)
 * 3. Store results
 * 4. Mark as fulfilled
 */

import { db } from "./db";
import {
  checkPayment,
  verifyUsdcTransfer,
  PRODUCT_PRICES,
  ACTIVE_CONTRACTS,
  type ProductId,
} from "./cdp-wallet";
import { transactions, tracks, users } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Order types for settlement
 */
export interface Order {
  id: string;
  invoiceId: `0x${string}`;
  productId: ProductId;
  userId: string;
  status: "pending" | "paid" | "processing" | "completed" | "failed";
  paymentMethod: "usdc_contract" | "usdc_direct" | "stars" | "ton";
  txHash?: string;
  payer?: string;
  amount?: string;
  createdAt: Date;
  completedAt?: Date;
  resultUrl?: string;
  error?: string;
}

/**
 * Settlement result
 */
export interface SettlementResult {
  success: boolean;
  orderId: string;
  status: Order["status"];
  resultUrl?: string;
  error?: string;
}

/**
 * Verify and settle a USDC payment
 */
export async function settleUsdcPayment(params: {
  invoiceId: `0x${string}`;
  productId: ProductId;
  userId: string;
  txHash?: `0x${string}`;
}): Promise<SettlementResult> {
  const { invoiceId, productId, userId, txHash } = params;
  const product = PRODUCT_PRICES[productId];

  if (!product) {
    return {
      success: false,
      orderId: invoiceId,
      status: "failed",
      error: `Unknown product: ${productId}`,
    };
  }

  // Try contract verification first, then direct USDC transfer
  let verified = false;
  let payer: string | undefined;
  let amount: bigint | undefined;

  // Method 1: Check TigerPayments contract
  if (ACTIVE_CONTRACTS.tigerPayments) {
    const contractPayment = await checkPayment(invoiceId);
    if (contractPayment.paid && !contractPayment.fulfilled) {
      verified = true;
      payer = contractPayment.payer;
      amount = contractPayment.amount;
    }
  }

  // Method 2: Verify direct USDC transfer (if tx hash provided)
  if (!verified && txHash) {
    const treasury = (process.env.X402_PAYMENT_ADDRESS ||
      "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54") as `0x${string}`;
    const directVerify = await verifyUsdcTransfer(
      txHash,
      treasury,
      product.amount
    );
    if (directVerify.verified) {
      verified = true;
      payer = directVerify.payer;
      amount = directVerify.amount;
    }
  }

  if (!verified) {
    return {
      success: false,
      orderId: invoiceId,
      status: "pending",
      error: "Payment not verified",
    };
  }

  // Payment verified - record in database
  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Calculate amounts
    const grossAmount = Number(amount || product.amount) / 1_000_000; // Convert from USDC decimals
    const platformFee = 0; // No platform fee for direct USDC
    const netAmount = grossAmount;

    // Record transaction
    const txId = globalThis.crypto.randomUUID();
    await db.insert(transactions).values({
      id: txId,
      userId: existingUser?.id || txId, // Use existing user or fallback
      type: "x402",
      paymentMethod: "x402",
      grossAmount,
      platformFee,
      netAmount,
      currency: "USDC",
      product: productId,
      x402PaymentId: txHash || invoiceId,
      status: "completed",
    });

    return {
      success: true,
      orderId: invoiceId,
      status: "paid",
    };
  } catch (error) {
    console.error("Settlement DB error:", error);
    return {
      success: false,
      orderId: invoiceId,
      status: "failed",
      error: error instanceof Error ? error.message : "Database error",
    };
  }
}

/**
 * Process an order after payment verification
 */
export async function processOrder(params: {
  orderId: string;
  productId: ProductId;
  userId: string;
  requestData: Record<string, unknown>;
}): Promise<SettlementResult> {
  const { orderId, productId, userId, requestData } = params;

  try {
    // Route to appropriate handler based on product
    switch (productId) {
      case "music_track":
      case "music_track_premium":
      case "anthem":
        return await processMusicOrder({
          orderId,
          productId,
          userId,
          requestData,
        });

      case "album_art":
        return await processAlbumArtOrder({
          orderId,
          userId,
          requestData,
        });

      case "brand_package":
        return await processBrandOrder({
          orderId,
          userId,
          requestData,
        });

      case "thread_to_hit":
        return await processThreadToHitOrder({
          orderId,
          userId,
          requestData,
        });

      default:
        return {
          success: false,
          orderId,
          status: "failed",
          error: `Unknown product type: ${productId}`,
        };
    }
  } catch (error) {
    console.error("Order processing error:", error);
    return {
      success: false,
      orderId,
      status: "failed",
      error: error instanceof Error ? error.message : "Processing failed",
    };
  }
}

/**
 * Process music generation order
 */
async function processMusicOrder(params: {
  orderId: string;
  productId: ProductId;
  userId: string;
  requestData: Record<string, unknown>;
}): Promise<SettlementResult> {
  const { orderId, userId, requestData } = params;

  // Call the music generation API internally
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate/music`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Internal bypass header for paid orders
        "X-INTERNAL-SETTLEMENT": process.env.SETTLEMENT_SECRET || "",
      },
      body: JSON.stringify({
        ...requestData,
        orderId,
        userId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      orderId,
      status: "failed",
      error: `Music generation failed: ${error}`,
    };
  }

  const result = await response.json();

  // Store the track in database
  try {
    const trackId = globalThis.crypto.randomUUID();
    await db.insert(tracks).values({
      id: trackId,
      userId: userId, // Text reference to users.id
      title: (requestData.title as string) || "Generated Track",
      description: (requestData.prompt as string) || "",
      genre: (requestData.style as string) || "electronic",
      audioUrl: result.audioUrl,
      prompt: (requestData.prompt as string) || "",
      compositionPlan: result.metadata ? JSON.stringify(result.metadata) : undefined,
    });
  } catch (dbError) {
    console.error("Failed to store track:", dbError);
    // Continue anyway - track was generated
  }

  return {
    success: true,
    orderId,
    status: "completed",
    resultUrl: result.audioUrl,
  };
}

/**
 * Process album art generation order
 */
async function processAlbumArtOrder(params: {
  orderId: string;
  userId: string;
  requestData: Record<string, unknown>;
}): Promise<SettlementResult> {
  const { orderId, userId, requestData } = params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate/album-art`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-INTERNAL-SETTLEMENT": process.env.SETTLEMENT_SECRET || "",
      },
      body: JSON.stringify({
        ...requestData,
        orderId,
        userId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      orderId,
      status: "failed",
      error: `Album art generation failed: ${error}`,
    };
  }

  const result = await response.json();

  return {
    success: true,
    orderId,
    status: "completed",
    resultUrl: result.imageUrl,
  };
}

/**
 * Process brand package order
 */
async function processBrandOrder(params: {
  orderId: string;
  userId: string;
  requestData: Record<string, unknown>;
}): Promise<SettlementResult> {
  const { orderId, userId, requestData } = params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate/brand`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-INTERNAL-SETTLEMENT": process.env.SETTLEMENT_SECRET || "",
      },
      body: JSON.stringify({
        ...requestData,
        orderId,
        userId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      orderId,
      status: "failed",
      error: `Brand generation failed: ${error}`,
    };
  }

  const result = await response.json();

  return {
    success: true,
    orderId,
    status: "completed",
    resultUrl: result.downloadUrl,
  };
}

/**
 * Process thread-to-hit order
 */
async function processThreadToHitOrder(params: {
  orderId: string;
  userId: string;
  requestData: Record<string, unknown>;
}): Promise<SettlementResult> {
  const { orderId, userId, requestData } = params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate/thread-to-hit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-INTERNAL-SETTLEMENT": process.env.SETTLEMENT_SECRET || "",
      },
      body: JSON.stringify({
        ...requestData,
        orderId,
        userId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      orderId,
      status: "failed",
      error: `Thread-to-hit generation failed: ${error}`,
    };
  }

  const result = await response.json();

  return {
    success: true,
    orderId,
    status: "completed",
    resultUrl: result.audioUrl,
  };
}

/**
 * Get order status by ID
 */
export async function getOrderStatus(orderId: string): Promise<{
  found: boolean;
  status?: Order["status"];
  resultUrl?: string;
  error?: string;
}> {
  try {
    const tx = await db.query.transactions.findFirst({
      where: eq(transactions.x402PaymentId, orderId),
    });

    if (!tx) {
      return { found: false };
    }

    return {
      found: true,
      status: tx.status as Order["status"],
      // Note: resultUrl would need to be stored separately or in a linked table
      resultUrl: undefined,
    };
  } catch (error) {
    return {
      found: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}
