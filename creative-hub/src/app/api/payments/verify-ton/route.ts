import { NextRequest, NextResponse } from "next/server";
import { TON_PRICING } from "@/lib/ton";
import { db, generateId, getOrCreateUser } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseInitData, validateInitData } from "@/lib/telegram";
import {
  findClaimableTonPayments,
  isTonPlanId,
  isUniqueViolation,
  parseTelegramId,
  type IncomingTonTransfer,
} from "@/lib/ton-claim";

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
 * A transaction hash may be credited once. The schema declares this index
 * (transactions.tonTransactionHash is unique), but the live database only
 * gets it on the next `drizzle-kit push`, so make sure it exists before
 * crediting anything. Same name drizzle-kit gives it, so push sees no diff.
 */
let tonHashIndexReady: Promise<unknown> | null = null;
function ensureTonHashUnique(): Promise<unknown> {
  if (!tonHashIndexReady) {
    tonHashIndexReady = db
      .run(
        sql`CREATE UNIQUE INDEX IF NOT EXISTS transactions_ton_transaction_hash_unique ON transactions (ton_transaction_hash)`
      )
      .catch((error) => {
        tonHashIndexReady = null;
        throw error;
      });
  }
  return tonHashIndexReady;
}

/**
 * Verify TON payment by checking blockchain transactions
 *
 * POST /api/payments/verify-ton
 * Body: { telegramId: number, planId: string, timestamp: number }
 * Header (optional): X-Telegram-Init-Data - when present it must verify,
 * and the user it names replaces body.telegramId.
 *
 * Only a payment whose comment names the user being credited is accepted,
 * so asking with someone else's id can at most credit them for their own
 * payment.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { planId, timestamp } = body;

    let telegramId = parseTelegramId(body.telegramId);
    const initData = request.headers.get("x-telegram-init-data");
    if (initData) {
      const verifiedId = validateInitData(initData)
        ? parseTelegramId(parseInitData(initData)?.user?.id)
        : null;
      if (verifiedId === null) {
        return NextResponse.json(
          { error: "Invalid Telegram init data" },
          { status: 401 }
        );
      }
      telegramId = verifiedId;
    }

    if (telegramId === null || !planId) {
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

    if (!isTonPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }
    const plan = TON_PRICING[planId];

    const searchAfter =
      typeof timestamp === "number" && Number.isFinite(timestamp)
        ? Math.floor(timestamp / 1000) - 300
        : Math.floor(Date.now() / 1000) - 3600;

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

    const transfers: IncomingTonTransfer[] = (data.result as TonTransaction[])
      .filter((tx) => tx.in_msg?.value)
      .map((tx) => ({
        hash: tx.transaction_id.hash,
        utime: tx.utime,
        value: tx.in_msg!.value,
        message: tx.in_msg!.message || "",
      }));

    const candidates = findClaimableTonPayments(transfers, {
      planId,
      telegramId,
      notBefore: searchAfter,
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Payment not found yet. Please wait a moment and try again.",
      });
    }

    try {
      await ensureTonHashUnique();
    } catch (error) {
      // Without the index two requests could both credit one payment
      console.error("TON verification disabled: cannot ensure unique tx hash index:", error);
      return NextResponse.json(
        { error: "TON verification unavailable" },
        { status: 503 }
      );
    }

    const user = await getOrCreateUser({
      id: telegramId,
      username: undefined,
      first_name: undefined,
      last_name: undefined,
    });

    const creditsToAdd = plan.credits;

    // Claim by inserting first: the unique index on the hash lets exactly
    // one request record a payment, and the credit is in the same batch,
    // so it is applied if and only if that insert succeeded.
    for (const candidate of candidates) {
      const tonAmount = Number(candidate.nanotons) / 1e9;
      const usdAmount = tonAmount * 1.0; // Approximate rate

      try {
        const [, updated] = await db.batch([
          db.insert(schema.transactions).values({
            id: generateId(),
            userId: user.id,
            type: "credits",
            paymentMethod: "ton",
            grossAmount: usdAmount,
            platformFee: 0, // No platform fee for TON
            netAmount: usdAmount,
            currency: "TON",
            product: planId,
            tonTransactionHash: candidate.hash,
            status: "completed",
          }),
          db
            .update(schema.users)
            .set({
              credits: sql`${schema.users.credits} + ${creditsToAdd}`,
              updatedAt: new Date(),
            })
            .where(eq(schema.users.id, user.id))
            .returning({ credits: schema.users.credits }),
        ]);

        console.log("TON payment verified:", {
          userId: user.id,
          txHash: candidate.hash,
          amount: tonAmount,
          credits: creditsToAdd,
        });

        return NextResponse.json({
          success: true,
          message: "Payment verified and credits added",
          txHash: candidate.hash,
          creditsAdded: creditsToAdd,
          newBalance: updated[0]?.credits,
        });
      } catch (error) {
        if (isUniqueViolation(error)) continue; // already credited
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      already_processed: true,
      message: "Payment already credited",
      txHash: candidates[0].hash,
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
