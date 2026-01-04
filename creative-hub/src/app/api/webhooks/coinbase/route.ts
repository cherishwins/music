/**
 * Coinbase Webhook Handler
 *
 * Receives payment notifications from Coinbase Commerce or Onramp.
 * Verifies signature, validates payment, and triggers order processing.
 */

import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { settleUsdcPayment, processOrder } from "@/lib/settlement";
import { ProductId } from "@/lib/cdp-wallet";

// Coinbase Commerce webhook event
interface CoinbaseWebhookEvent {
  id: string;
  scheduled_for: string;
  event: {
    id: string;
    type: "charge:confirmed" | "charge:failed" | "charge:pending";
    api_version: string;
    created_at: string;
    data: {
      id: string;
      code: string;
      name: string;
      description: string;
      pricing: {
        local: { amount: string; currency: string };
        bitcoin?: { amount: string; currency: string };
        ethereum?: { amount: string; currency: string };
        usdc?: { amount: string; currency: string };
      };
      payments: Array<{
        network: string;
        transaction_id: string;
        status: string;
        value: { local: { amount: string; currency: string } };
        block: { height: number; hash: string };
      }>;
      metadata: {
        orderId?: string;
        productId?: string;
        userId?: string;
      };
      timeline: Array<{
        time: string;
        status: string;
      }>;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("X-CC-Webhook-Signature");
    const rawBody = await request.text();

    // Verify signature
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const computedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== computedSig) {
        console.error("[Coinbase Webhook] Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event: CoinbaseWebhookEvent = JSON.parse(rawBody);

    console.log("[Coinbase Webhook]", {
      type: event.event.type,
      chargeId: event.event.data.id,
      code: event.event.data.code,
    });

    // Handle different event types
    switch (event.event.type) {
      case "charge:confirmed":
        return await handleChargeConfirmed(event);

      case "charge:pending":
        return await handleChargePending(event);

      case "charge:failed":
        return await handleChargeFailed(event);

      default:
        console.log("[Coinbase Webhook] Unhandled event type:", event.event.type);
        return NextResponse.json({ success: true, message: "Event received" });
    }
  } catch (error) {
    console.error("[Coinbase Webhook] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle confirmed charge
 */
async function handleChargeConfirmed(event: CoinbaseWebhookEvent) {
  const { data } = event.event;
  const { metadata, payments } = data;

  // Get the completed payment
  const payment = payments.find((p) => p.status === "CONFIRMED");
  if (!payment) {
    return NextResponse.json(
      { error: "No confirmed payment found" },
      { status: 400 }
    );
  }

  // Extract order details from metadata
  const orderId = metadata.orderId || data.code;
  const productId = (metadata.productId || "music_track") as ProductId;
  const userId = metadata.userId || "anonymous";

  // Get amount from pricing
  const amount = data.pricing.usdc?.amount || data.pricing.local.amount;

  // Settle the payment
  const settlement = await settleUsdcPayment({
    invoiceId: `0x${orderId.padEnd(64, "0")}` as `0x${string}`,
    productId,
    userId,
    txHash: payment.transaction_id as `0x${string}`,
  });

  if (!settlement.success) {
    console.error("[Coinbase Webhook] Settlement failed:", settlement.error);
    return NextResponse.json(
      { error: "Settlement failed", details: settlement.error },
      { status: 500 }
    );
  }

  console.log("[Coinbase Webhook] Payment settled:", {
    orderId,
    amount,
    network: payment.network,
    txHash: payment.transaction_id,
  });

  return NextResponse.json({
    success: true,
    orderId,
    status: "settled",
    message: "Payment confirmed and settled",
  });
}

/**
 * Handle pending charge
 */
async function handleChargePending(event: CoinbaseWebhookEvent) {
  const { data } = event.event;

  console.log("[Coinbase Webhook] Charge pending:", {
    code: data.code,
    timeline: data.timeline,
  });

  return NextResponse.json({
    success: true,
    message: "Pending charge recorded",
  });
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(event: CoinbaseWebhookEvent) {
  const { data } = event.event;

  console.error("[Coinbase Webhook] Charge failed:", {
    code: data.code,
    timeline: data.timeline,
  });

  // Could add notification or retry logic here
  return NextResponse.json({
    success: true,
    message: "Failed charge recorded",
  });
}
