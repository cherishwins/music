import { NextRequest, NextResponse } from "next/server";
import { parsePaymentPayload, sendMessage, STAR_PLANS } from "@/lib/telegram";
import { db, getOrCreateUser, recordRevenue, generateId } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Telegram sends updates here when payments complete
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log("Telegram update:", JSON.stringify(update, null, 2));

    // Handle successful payment
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const chatId = update.message.chat.id;
      const telegramUser = update.message.from;

      // Parse our custom payload
      const payload = parsePaymentPayload(payment.invoice_payload);

      console.log("Payment received:", {
        stars: payment.total_amount,
        currency: payment.currency,
        planId: payload.planId,
        userId: payload.userId,
        credits: payload.credits,
        telegramUserId: telegramUser?.id,
      });

      // Get or create user in database
      const user = await getOrCreateUser({
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
      });

      // Add credits to user's account
      const plan = STAR_PLANS[payload.planId];
      const creditsToAdd = plan?.credits || payload.credits;

      await db
        .update(schema.users)
        .set({
          credits: user.credits + creditsToAdd,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, user.id));

      // Calculate revenue (Telegram takes ~30% for digital goods)
      const starsAmount = payment.total_amount;
      const usdPerStar = 0.02; // Approximate: 1 Star ≈ $0.02
      const grossUsd = starsAmount * usdPerStar;
      const platformFee = grossUsd * 0.3; // Telegram's 30%
      const netUsd = grossUsd - platformFee;

      // Record the transaction
      await recordRevenue({
        userId: user.id,
        type: "credits",
        paymentMethod: "stars",
        grossAmount: grossUsd,
        platformFee: platformFee,
        netAmount: netUsd,
        currency: "XTR",
        product: payload.planId,
        telegramPaymentId: payment.telegram_payment_charge_id,
      });

      console.log("Payment processed:", {
        userId: user.id,
        creditsAdded: creditsToAdd,
        newBalance: user.credits + creditsToAdd,
        grossUsd,
        netUsd,
      });

      await sendMessage(
        chatId,
        `<b>✅ Payment Received!</b>\n\n` +
          `Plan: ${plan?.title || payload.planId}\n` +
          `Credits Added: <b>+${creditsToAdd}</b>\n` +
          `New Balance: <b>${user.credits + creditsToAdd} credits</b>\n\n` +
          `Your credits are ready. Start creating! 🎨`
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
      const telegramUser = update.message.from;

      // Ensure user exists in database
      await getOrCreateUser({
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
      });

      // Send welcome with inline keyboard
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🐯 <b>Welcome to White Tiger Studio!</b>\n\n` +
            `Create AI-powered meme coin anthems in seconds.\n\n` +
            `✅ <b>FREE</b> - Generate your first anthem\n` +
            `🎵 Professional AI vocals + beats\n` +
            `🎨 Album art included\n` +
            `📱 Share instantly to Telegram\n\n` +
            `<i>Tap the button below to start creating!</i>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🎵 Create Your Anthem", web_app: { url: "https://creative-hub-virid.vercel.app" } }],
              [{ text: "💜 Join @MemeSeal", url: "https://t.me/MemeSeal" }]
            ]
          }
        }),
      });

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
