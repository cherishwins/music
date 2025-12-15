import { NextRequest, NextResponse } from "next/server";

// This endpoint creates Telegram Stars invoices
// In production, this would interact with your Telegram Bot API

export async function POST(request: NextRequest) {
  try {
    const { planId, amount, currency } = await request.json();

    // Validate request
    if (!planId || !amount || currency !== "XTR") {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Get plan details
    const plans: Record<string, { title: string; description: string; credits: number }> = {
      starter: {
        title: "Starter Plan",
        description: "100 AI generation credits",
        credits: 100,
      },
      creator: {
        title: "Creator Plan",
        description: "500 AI generation credits",
        credits: 500,
      },
      studio: {
        title: "Studio Plan",
        description: "2000 AI generation credits",
        credits: 2000,
      },
    };

    const plan = plans[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // In production, call Telegram Bot API to create invoice
    // Using grammY or direct HTTP to Bot API:
    //
    // const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    // const invoiceLink = await bot.api.createInvoiceLink({
    //   title: plan.title,
    //   description: plan.description,
    //   payload: JSON.stringify({ planId, userId: "user-id-here" }),
    //   provider_token: "", // Empty for digital goods
    //   currency: "XTR",
    //   prices: [{ label: plan.title, amount: amount }],
    // });

    // For demo, return a mock invoice URL
    // Replace with actual Telegram Bot API integration
    const mockInvoiceUrl = `https://t.me/$CreativeHubBot?startattach=invoice_${planId}_${Date.now()}`;

    return NextResponse.json({
      invoiceUrl: mockInvoiceUrl,
      planId,
      amount,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
