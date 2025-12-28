import { NextRequest, NextResponse } from "next/server";
import { parsePaymentPayload, sendMessage } from "@/lib/telegram";

// Telegram sends updates here when payments complete
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Telegram update:", JSON.stringify(update, null, 2));

    // Handle successful payment
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const chatId = update.message.chat.id;

      // Parse our custom payload
      const payload = parsePaymentPayload(payment.invoice_payload);

      console.log("Payment received:", {
        stars: payment.total_amount,
        currency: payment.currency,
        planId: payload.planId,
        userId: payload.userId,
        credits: payload.credits,
      });

      // TODO: Add credits to user's account in database
      // For now, just send confirmation

      await sendMessage(
        chatId,
        `<b>Payment Received!</b>\n\n` +
          `Plan: ${payload.planId}\n` +
          `Credits: ${payload.credits}\n` +
          `Stars: ${payment.total_amount}\n\n` +
          `Your credits are now available. Start creating!`
      );

      return NextResponse.json({ ok: true, type: "payment_processed" });
    }

    // Handle pre-checkout query (required for payments)
    if (update.pre_checkout_query) {
      const query = update.pre_checkout_query;
      console.log("Pre-checkout query:", query.id);

      // Answer the pre-checkout query to confirm the payment
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(
        `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pre_checkout_query_id: query.id,
            ok: true,
          }),
        }
      );

      return NextResponse.json({ ok: true, type: "pre_checkout_answered" });
    }

    // Handle /start command
    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
      await sendMessage(
        chatId,
        `<b>Welcome to Creative Hub!</b>\n\n` +
          `Generate meme coin brands, music, and more with AI.\n\n` +
          `Open the Mini App to get started.`
      );
      return NextResponse.json({ ok: true, type: "start_handled" });
    }

    return NextResponse.json({ ok: true, type: "ignored" });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to Telegram to prevent retries
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

// Telegram also sends GET for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "Telegram webhook endpoint active",
    timestamp: new Date().toISOString(),
  });
}
