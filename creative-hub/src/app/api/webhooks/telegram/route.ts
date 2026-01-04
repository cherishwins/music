/**
 * Telegram Stars Payment Webhook
 *
 * Receives payment notifications from Telegram Stars.
 * Part of the multi-rail payment system.
 */

import { type NextRequest, NextResponse } from "next/server";
import { settleUsdcPayment, processOrder } from "@/lib/settlement";
import { ProductId } from "@/lib/cdp-wallet";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";

// Telegram Stars payment update
interface TelegramPaymentUpdate {
  update_id: number;
  pre_checkout_query?: {
    id: string;
    from: { id: number; username?: string };
    currency: string;
    total_amount: number;
    invoice_payload: string;
  };
  message?: {
    from: { id: number; username?: string };
    successful_payment?: {
      currency: string;
      total_amount: number;
      invoice_payload: string;
      telegram_payment_charge_id: string;
      provider_payment_charge_id: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Verify Telegram secret token
    const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (expectedToken && secretToken !== expectedToken) {
      console.error("[Telegram Webhook] Invalid secret token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update: TelegramPaymentUpdate = JSON.parse(rawBody);

    console.log("[Telegram Webhook]", {
      updateId: update.update_id,
      hasPreCheckout: !!update.pre_checkout_query,
      hasPayment: !!update.message?.successful_payment,
    });

    // Handle pre-checkout query (required - must answer within 10 seconds)
    if (update.pre_checkout_query) {
      return await handlePreCheckout(update.pre_checkout_query);
    }

    // Handle successful payment
    if (update.message?.successful_payment) {
      return await handleSuccessfulPayment(
        update.message.from,
        update.message.successful_payment
      );
    }

    // Unknown update type
    return NextResponse.json({ success: true, message: "Update received" });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle pre-checkout query
 * MUST respond within 10 seconds with answerPreCheckoutQuery
 */
async function handlePreCheckout(query: TelegramPaymentUpdate["pre_checkout_query"]) {
  if (!query) {
    return NextResponse.json({ ok: false });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("[Telegram Webhook] No bot token configured");
    return NextResponse.json({ ok: false, error: "Bot not configured" });
  }

  try {
    // Parse the payload to validate the order
    const payload = JSON.parse(query.invoice_payload);
    const productId = payload.productId as ProductId;

    // Validate the product exists
    const validProducts = [
      "music_track",
      "music_track_premium",
      "album_art",
      "brand_package",
      "anthem",
      "thread_to_hit",
    ];

    const isValid = validProducts.includes(productId);

    // Answer the pre-checkout query
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_checkout_query_id: query.id,
          ok: isValid,
          error_message: isValid ? undefined : "Invalid product",
        }),
      }
    );

    const result = await response.json();

    console.log("[Telegram Webhook] Pre-checkout answered:", {
      queryId: query.id,
      ok: isValid,
      result: result.ok,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Pre-checkout error:", error);

    // Try to reject the pre-checkout
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      await fetch(
        `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pre_checkout_query_id: query.id,
            ok: false,
            error_message: "Server error, please try again",
          }),
        }
      );
    }

    return NextResponse.json({ ok: false });
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(
  from: { id: number; username?: string },
  payment: NonNullable<TelegramPaymentUpdate["message"]>["successful_payment"]
) {
  if (!payment) {
    return NextResponse.json({ ok: false });
  }

  try {
    // Parse the payload
    const payload = JSON.parse(payment.invoice_payload);
    const productId = (payload.productId || "music_track") as ProductId;
    const userId = from.id.toString();

    // Convert Stars to USD (1000 stars = ~$20)
    const starsAmount = payment.total_amount;
    const usdAmount = (starsAmount / 1000) * 20;

    console.log("[Telegram Webhook] Successful payment:", {
      userId,
      username: from.username,
      productId,
      stars: starsAmount,
      usd: usdAmount.toFixed(2),
      chargeId: payment.telegram_payment_charge_id,
    });

    // Record the transaction
    // Note: userId must be a valid UUID from users table
    // For now, we create a transaction record with a generated ID
    const txId = globalThis.crypto.randomUUID();
    await db.insert(transactions).values({
      id: txId,
      userId: payload.userId || txId, // Use payload userId or fallback
      type: "one_time",
      paymentMethod: "stars",
      grossAmount: usdAmount,
      platformFee: usdAmount * 0.3, // Telegram's 30%
      netAmount: usdAmount * 0.7,
      currency: "STARS",
      product: productId,
      telegramPaymentId: payment.telegram_payment_charge_id,
      status: "completed",
    });

    // Process the order (generate content)
    const result = await processOrder({
      orderId: payment.telegram_payment_charge_id,
      productId,
      userId,
      requestData: payload.requestData || {},
    });

    console.log("[Telegram Webhook] Order processed:", {
      orderId: payment.telegram_payment_charge_id,
      success: result.success,
      resultUrl: result.resultUrl,
    });

    // Send result back to user via Telegram
    if (result.success && result.resultUrl) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: from.id,
              text: `Your ${productId.replace(/_/g, " ")} is ready! Download here: ${result.resultUrl}`,
              parse_mode: "HTML",
            }),
          }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      success: result.success,
      resultUrl: result.resultUrl,
    });
  } catch (error) {
    console.error("[Telegram Webhook] Payment processing error:", error);
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Processing failed",
    });
  }
}
