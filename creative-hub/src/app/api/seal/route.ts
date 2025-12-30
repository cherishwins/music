import { NextRequest, NextResponse } from "next/server";
import {
  createSeal,
  getSeal,
  getSealsByCreator,
  getSealsByTarget,
  type Prediction,
  type PredictionType,
} from "@/lib/memeseal";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/seal
 * Create a new prediction seal
 *
 * Body:
 * {
 *   prediction: {
 *     content: string,
 *     targetAddress?: string,
 *     predictionType: "rug_pull" | "price_target" | "launch_success" | "whale_dump" | "custom",
 *     outcome?: "rug" | "moon" | "stable" | "custom",
 *     customOutcome?: string,
 *     timeframe?: number,
 *     confidence?: number
 *   },
 *   creatorAddress: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prediction, creatorAddress } = body;

    // Validate required fields
    if (!prediction || !prediction.content) {
      return NextResponse.json(
        { error: "Prediction content is required" },
        { status: 400 }
      );
    }

    if (!creatorAddress) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 }
      );
    }

    // Validate prediction type
    const validTypes: PredictionType[] = [
      "rug_pull",
      "price_target",
      "launch_success",
      "whale_dump",
      "custom",
    ];
    if (prediction.predictionType && !validTypes.includes(prediction.predictionType)) {
      return NextResponse.json(
        { error: "Invalid prediction type" },
        { status: 400 }
      );
    }

    // Create the seal
    const seal = await createSeal(prediction as Prediction, creatorAddress);

    return NextResponse.json({
      success: true,
      seal: {
        id: seal.id,
        hash: seal.hash,
        createdAt: seal.createdAt,
        status: seal.status,
        predictionType: seal.prediction.predictionType,
        targetAddress: seal.prediction.targetAddress,
        timeframe: seal.prediction.timeframe,
      },
      message: "Prediction sealed! Store your seal ID to prove when you made this prediction.",
      nextSteps: [
        "Save your seal ID: " + seal.id,
        "Optionally store on-chain for permanent proof",
        "When the outcome occurs, reveal your prediction to prove accuracy",
      ],
    });
  } catch (error) {
    console.error("[Seal] Error creating seal:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create seal" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seal?id=xxx or ?creator=xxx or ?target=xxx
 * Retrieve seal(s) by ID, creator, or target
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sealId = searchParams.get("id");
    const creator = searchParams.get("creator");
    const target = searchParams.get("target");

    // Get single seal by ID
    if (sealId) {
      const seal = getSeal(sealId);
      if (!seal) {
        return NextResponse.json(
          { error: "Seal not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        seal: {
          id: seal.id,
          hash: seal.hash,
          createdAt: seal.createdAt,
          creatorAddress: seal.creatorAddress,
          status: seal.status,
          onChainTx: seal.onChainTx,
          predictionType: seal.prediction.predictionType,
          targetAddress: seal.prediction.targetAddress,
          timeframe: seal.prediction.timeframe,
          confidence: seal.prediction.confidence,
          resolution: seal.resolution,
          // Don't reveal full prediction content until explicitly revealed
          contentRevealed: seal.status === "revealed" || seal.status === "resolved",
          content: seal.status === "revealed" || seal.status === "resolved"
            ? seal.prediction.content
            : "[SEALED - Content hidden until reveal]",
        },
      });
    }

    // Get seals by creator
    if (creator) {
      const seals = getSealsByCreator(creator);
      return NextResponse.json({
        success: true,
        count: seals.length,
        seals: seals.map((s) => ({
          id: s.id,
          hash: s.hash,
          createdAt: s.createdAt,
          status: s.status,
          predictionType: s.prediction.predictionType,
          targetAddress: s.prediction.targetAddress,
        })),
      });
    }

    // Get seals by target (token/address being predicted about)
    if (target) {
      const seals = getSealsByTarget(target);
      return NextResponse.json({
        success: true,
        count: seals.length,
        seals: seals.map((s) => ({
          id: s.id,
          hash: s.hash,
          createdAt: s.createdAt,
          creatorAddress: s.creatorAddress,
          status: s.status,
          predictionType: s.prediction.predictionType,
        })),
      });
    }

    return NextResponse.json(
      { error: "Provide id, creator, or target parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Seal] Error fetching seal:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch seal" },
      { status: 500 }
    );
  }
}
