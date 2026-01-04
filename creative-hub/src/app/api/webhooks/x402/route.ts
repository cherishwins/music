/**
 * x402 Payment Webhook
 *
 * Receives async payment notifications from the x402 facilitator.
 * This is called after a payment is confirmed on-chain.
 */

import { type NextRequest, NextResponse } from "next/server";
import { verifyUsdcTransfer } from "@/lib/cdp-wallet";
import { settleUsdcPayment, processOrder } from "@/lib/settlement";
import { ProductId } from "@/lib/cdp-wallet";

// Webhook payload from x402 facilitator
interface X402WebhookPayload {
  event: "payment.confirmed" | "payment.failed";
  invoiceId: string;
  txHash: string;
  payer: string;
  amount: string;
  resource: string;
  timestamp: number;
  signature?: string; // HMAC signature for verification
}

export async function POST(request: NextRequest) {
  try {
    const payload: X402WebhookPayload = await request.json();

    // Verify webhook signature if configured
    const webhookSecret = process.env.X402_WEBHOOK_SECRET;
    if (webhookSecret && payload.signature) {
      const expectedSig = await computeSignature(payload, webhookSecret);
      if (payload.signature !== expectedSig) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    console.log("[x402 Webhook]", {
      event: payload.event,
      invoiceId: payload.invoiceId,
      txHash: payload.txHash,
    });

    // Handle different event types
    switch (payload.event) {
      case "payment.confirmed":
        return await handlePaymentConfirmed(payload);

      case "payment.failed":
        return await handlePaymentFailed(payload);

      default:
        return NextResponse.json(
          { error: `Unknown event: ${payload.event}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[x402 Webhook] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle confirmed payment
 */
async function handlePaymentConfirmed(payload: X402WebhookPayload) {
  const invoiceId = payload.invoiceId as `0x${string}`;
  const txHash = payload.txHash as `0x${string}`;

  // Verify on-chain (belt and suspenders)
  const treasury = (process.env.X402_PAYMENT_ADDRESS ||
    "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54") as `0x${string}`;
  const verification = await verifyUsdcTransfer(txHash, treasury, BigInt(0));

  if (!verification.verified) {
    console.error("[x402 Webhook] On-chain verification failed:", verification.error);
    return NextResponse.json(
      { error: "On-chain verification failed", details: verification.error },
      { status: 400 }
    );
  }

  // Extract product and user from resource URL
  const productId = extractProductFromResource(payload.resource);
  const userId = extractUserFromResource(payload.resource);

  if (!productId) {
    return NextResponse.json(
      { error: "Could not determine product from resource" },
      { status: 400 }
    );
  }

  // Settle the payment
  const settlement = await settleUsdcPayment({
    invoiceId,
    productId,
    userId: userId || "anonymous",
    txHash,
  });

  if (!settlement.success) {
    console.error("[x402 Webhook] Settlement failed:", settlement.error);
    return NextResponse.json(
      { error: "Settlement failed", details: settlement.error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    invoiceId,
    status: settlement.status,
    message: "Payment confirmed and settled",
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: X402WebhookPayload) {
  console.error("[x402 Webhook] Payment failed:", {
    invoiceId: payload.invoiceId,
    txHash: payload.txHash,
  });

  // Could add retry logic or notification here
  return NextResponse.json({
    success: true,
    message: "Payment failure recorded",
  });
}

/**
 * Extract product ID from resource URL
 */
function extractProductFromResource(resource: string): ProductId | null {
  if (resource.includes("/music")) return "music_track";
  if (resource.includes("/album-art")) return "album_art";
  if (resource.includes("/brand")) return "brand_package";
  if (resource.includes("/anthem")) return "anthem";
  if (resource.includes("/thread-to-hit")) return "thread_to_hit";
  return null;
}

/**
 * Extract user ID from resource URL
 */
function extractUserFromResource(resource: string): string | null {
  const url = new URL(resource);
  return url.searchParams.get("userId") || url.searchParams.get("user");
}

/**
 * Compute HMAC signature for verification
 */
async function computeSignature(
  payload: X402WebhookPayload,
  secret: string
): Promise<string> {
  const data = `${payload.event}:${payload.invoiceId}:${payload.txHash}:${payload.timestamp}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  return Buffer.from(signature).toString("hex");
}
