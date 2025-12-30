import { NextRequest, NextResponse } from "next/server";
import { parsePaymentComment, TON_PRICING, type TonPlanId } from "@/lib/ton";
import { db, getOrCreateUser, recordRevenue } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

const TON_CENTER_API = "https://toncenter.com/api/v2";
const TON_WALLET = process.env.NEXT_PUBLIC_TON_WALLET_ADDRESS;

interface TonTransaction {
  transaction_id: {
    lt: string;
    hash: string;
  };
  in_msg?: {
    source: string;
    value: string;
    message?: string;
  };
  utime: number;
}

/**
 * Verify TON payment by checking blockchain transactions
 *
 * POST /api/payments/verify-ton
 * Body: { telegramId: number, planId: string, timestamp: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, planId, timestamp } = body;

    if (!telegramId || !planId) {
      return NextResponse.json(
        { error: "Missing telegramId or planId" },
        { status: 400 }
      );
    }

    if (!TON_WALLET) {
      return NextResponse.json(
        { error: "TON wallet not configured" },
        { status: 500 }
      );
    }

    // Get expected amount for this plan
    const plan = TON_PRICING[planId as TonPlanId];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const expectedNanotons = BigInt(parseFloat(plan.ton) * 1e9);
    const searchAfter = timestamp ? Math.floor(timestamp / 1000) - 300 : Math.floor(Date.now() / 1000) - 3600;

    // Fetch recent transactions to our wallet
    const response = await fetch(
      `${TON_CENTER_API}/getTransactions?address=${TON_WALLET}&limit=50`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("TON Center API error:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.ok || !data.result) {
      return NextResponse.json(
        { error: "Invalid response from TON Center" },
        { status: 502 }
      );
    }

    const transactions: TonTransaction[] = data.result;

    // Look for matching transaction
    for (const tx of transactions) {
      // Skip if too old
      if (tx.utime < searchAfter) continue;

      // Check incoming message
      const inMsg = tx.in_msg;
      if (!inMsg || !inMsg.value) continue;

      const value = BigInt(inMsg.value);
      const message = inMsg.message || "";

      // Check if amount matches (allow 1% tolerance for fees)
      const minAmount = expectedNanotons * BigInt(99) / BigInt(100);
      if (value < minAmount) continue;

      // Parse the payment comment
      const parsed = parsePaymentComment(message);
      if (!parsed) continue;

      // Check if this matches our expected payment
      if (parsed.planId !== planId) continue;

      // Found a matching transaction!
      const txHash = tx.transaction_id.hash;

      // Check if we already processed this transaction
      const existing = await db.query.transactions.findFirst({
        where: (t, { eq }) => eq(t.tonTransactionHash, txHash),
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          already_processed: true,
          message: "Payment already credited",
          txHash,
        });
      }

      // Get or create user
      const user = await getOrCreateUser({
        id: telegramId,
        username: undefined,
        first_name: undefined,
        last_name: undefined,
      });

      // Add credits
      const creditsToAdd = plan.credits;
      await db
        .update(schema.users)
        .set({
          credits: user.credits + creditsToAdd,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, user.id));

      // Record transaction
      const tonAmount = Number(value) / 1e9;
      const usdAmount = tonAmount * 1.0; // Approximate rate
      const platformFee = 0; // No platform fee for TON

      await recordRevenue({
        userId: user.id,
        type: "credits",
        paymentMethod: "ton",
        grossAmount: usdAmount,
        platformFee,
        netAmount: usdAmount,
        currency: "TON",
        product: planId,
        tonTransactionHash: txHash,
      });

      console.log("TON payment verified:", {
        userId: user.id,
        txHash,
        amount: tonAmount,
        credits: creditsToAdd,
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified and credits added",
        txHash,
        creditsAdded: creditsToAdd,
        newBalance: user.credits + creditsToAdd,
      });
    }

    // No matching transaction found
    return NextResponse.json({
      success: false,
      message: "Payment not found yet. Please wait a moment and try again.",
    });

  } catch (error) {
    console.error("TON verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if TON verification is available
 */
export async function GET() {
  return NextResponse.json({
    status: "TON verification endpoint active",
    wallet: TON_WALLET ? TON_WALLET.slice(0, 10) + "..." : "not configured",
    timestamp: new Date().toISOString(),
  });
}
