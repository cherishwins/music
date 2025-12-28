import { NextRequest, NextResponse } from "next/server";
import { createStarsInvoice, STAR_PLANS, type PlanId } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();

    // Validate plan
    if (!planId || !STAR_PLANS[planId as PlanId]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Check if Telegram bot is configured
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      // Return mock for development
      console.warn("TELEGRAM_BOT_TOKEN not set - returning mock invoice");
      return NextResponse.json({
        invoiceUrl: `https://t.me/$CreativeHubBot?startattach=invoice_${planId}_${Date.now()}`,
        planId,
        mock: true,
      });
    }

    // Create real Telegram Stars invoice
    const invoiceUrl = await createStarsInvoice(
      planId as PlanId,
      userId || "anonymous"
    );

    return NextResponse.json({
      invoiceUrl,
      planId,
      amount: STAR_PLANS[planId as PlanId].stars,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create invoice";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
