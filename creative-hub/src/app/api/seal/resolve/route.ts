import { NextRequest, NextResponse } from "next/server";
import { getSeal, resolveSeal, markSealOnChain } from "@/lib/memeseal";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/seal/resolve
 * Resolve a prediction (admin/oracle function)
 *
 * In production, this would be called by:
 * 1. Automated oracles checking token status
 * 2. DAO voting for disputed outcomes
 * 3. Admin verification for manual cases
 *
 * Body:
 * {
 *   sealId: string,
 *   outcome: string,
 *   proof?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sealId, outcome, proof, action } = body;

    if (!sealId) {
      return NextResponse.json(
        { error: "Seal ID is required" },
        { status: 400 }
      );
    }

    const seal = getSeal(sealId);
    if (!seal) {
      return NextResponse.json(
        { error: "Seal not found" },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === "mark_onchain") {
      // Mark seal as stored on-chain
      const txHash = body.txHash;
      if (!txHash) {
        return NextResponse.json(
          { error: "Transaction hash is required" },
          { status: 400 }
        );
      }

      const updated = markSealOnChain(sealId, txHash);
      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update seal" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Seal marked as stored on-chain",
        seal: {
          id: updated.id,
          status: updated.status,
          onChainTx: updated.onChainTx,
        },
      });
    }

    // Default: resolve the prediction
    if (!outcome) {
      return NextResponse.json(
        { error: "Outcome is required to resolve" },
        { status: 400 }
      );
    }

    // Check if already resolved
    if (seal.status === "resolved") {
      return NextResponse.json(
        { error: "Seal already resolved", resolution: seal.resolution },
        { status: 400 }
      );
    }

    const resolved = resolveSeal(sealId, outcome, proof);
    if (!resolved) {
      return NextResponse.json(
        { error: "Failed to resolve seal" },
        { status: 500 }
      );
    }

    // Determine if prediction was correct
    const predicted = seal.prediction.outcome || seal.prediction.customOutcome;
    const wasCorrect = predicted === outcome;

    return NextResponse.json({
      success: true,
      message: wasCorrect
        ? "Prediction was CORRECT! 🎯"
        : "Prediction was incorrect.",
      seal: {
        id: resolved.id,
        status: resolved.status,
        resolution: resolved.resolution,
        wasCorrect,
        predicted,
        actual: outcome,
      },
    });
  } catch (error) {
    console.error("[Seal] Resolution error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Resolution failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seal/resolve?target=xxx
 * Get resolution status for predictions about a target
 * This could be used by automated oracles to find seals that need resolution
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");
    const status = searchParams.get("status") || "sealed";

    if (!target) {
      return NextResponse.json({
        success: true,
        message: "Oracle endpoint ready",
        supportedActions: [
          "POST with { sealId, outcome, proof } to resolve a prediction",
          "POST with { sealId, action: 'mark_onchain', txHash } to mark as on-chain",
          "GET with ?target=xxx to find seals needing resolution",
        ],
      });
    }

    // In production, this would query the database
    // For now, return guidance
    return NextResponse.json({
      success: true,
      target,
      message: "Query seals for this target at /api/seal?target=" + target,
      oracleInfo: {
        description: "Oracle resolution for MemeSeal predictions",
        resolutionSources: [
          "Minter Credit Score - For rug_pull predictions",
          "DEX Price Feeds - For price_target predictions",
          "Chain Activity - For whale_dump predictions",
          "Community Vote - For disputed outcomes",
        ],
      },
    });
  } catch (error) {
    console.error("[Seal] Oracle query error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    );
  }
}
