import { NextRequest, NextResponse } from "next/server";
import {
  getSeal,
  verifySeal,
  resolveSeal,
  calculatePredictorScore,
} from "@/lib/memeseal";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/seal/verify
 * Verify a prediction seal
 *
 * Body:
 * {
 *   sealId: string,
 *   predictionContent: string,
 *   creatorAddress: string,
 *   timestamp: number,
 *   nonce: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sealId, predictionContent, creatorAddress, timestamp, nonce } = body;

    if (!sealId) {
      return NextResponse.json(
        { error: "Seal ID is required" },
        { status: 400 }
      );
    }

    // Get the seal
    const seal = getSeal(sealId);
    if (!seal) {
      return NextResponse.json(
        { error: "Seal not found" },
        { status: 404 }
      );
    }

    // If verification data provided, verify the content matches
    if (predictionContent && creatorAddress && timestamp && nonce) {
      const isValid = await verifySeal(
        sealId,
        predictionContent,
        creatorAddress,
        timestamp,
        nonce
      );

      return NextResponse.json({
        success: true,
        verified: isValid,
        seal: {
          id: seal.id,
          hash: seal.hash,
          createdAt: seal.createdAt,
          status: seal.status,
        },
        message: isValid
          ? "Prediction verified! The content matches the sealed hash."
          : "Verification failed. Content does not match the sealed prediction.",
      });
    }

    // Return seal info for basic lookup
    return NextResponse.json({
      success: true,
      seal: {
        id: seal.id,
        hash: seal.hash,
        createdAt: seal.createdAt,
        createdAtHuman: new Date(seal.createdAt).toISOString(),
        status: seal.status,
        onChainTx: seal.onChainTx,
        predictionType: seal.prediction.predictionType,
        targetAddress: seal.prediction.targetAddress,
      },
      message: "Seal exists. Provide full prediction content to verify.",
    });
  } catch (error) {
    console.error("[Seal] Verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seal/verify?creator=xxx
 * Get predictor reputation score
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 }
      );
    }

    const score = calculatePredictorScore(creator);

    return NextResponse.json({
      success: true,
      creator,
      reputation: {
        ...score,
        accuracyFormatted: `${score.accuracy.toFixed(1)}%`,
        level: score.reputation,
        levelEmoji: {
          novice: "🌱",
          apprentice: "🔮",
          expert: "🎯",
          oracle: "👁️",
        }[score.reputation],
      },
      badges: getBadges(score),
    });
  } catch (error) {
    console.error("[Seal] Score error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get score" },
      { status: 500 }
    );
  }
}

/**
 * Generate badges based on predictor performance
 */
function getBadges(score: ReturnType<typeof calculatePredictorScore>): string[] {
  const badges: string[] = [];

  if (score.totalPredictions >= 1) badges.push("First Seal");
  if (score.totalPredictions >= 10) badges.push("Serial Predictor");
  if (score.totalPredictions >= 50) badges.push("Prediction Machine");
  if (score.totalPredictions >= 100) badges.push("Century Club");

  if (score.accuracy >= 50 && score.resolved >= 5) badges.push("Better Than Coin Flip");
  if (score.accuracy >= 60 && score.resolved >= 10) badges.push("Sharp Eye");
  if (score.accuracy >= 70 && score.resolved >= 20) badges.push("Crystal Ball");
  if (score.accuracy >= 80 && score.resolved >= 30) badges.push("Future Seer");
  if (score.accuracy >= 90 && score.resolved >= 50) badges.push("The Oracle");

  if (score.streak >= 3) badges.push("Hot Streak 🔥");
  if (score.streak >= 5) badges.push("On Fire 🔥🔥");
  if (score.streak >= 10) badges.push("Unstoppable 🔥🔥🔥");

  return badges;
}
