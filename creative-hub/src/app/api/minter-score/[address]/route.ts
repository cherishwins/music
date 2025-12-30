import { NextRequest, NextResponse } from "next/server";
import { calculateMinterScore, analyzeToken } from "@/lib/minter-score";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/minter-score/[address]
 *
 * Analyze a TON wallet or token address and return the Minter Credit Score.
 *
 * Query params:
 * - type: "wallet" | "token" (default: auto-detect)
 * - token: optional token address to analyze alongside wallet
 *
 * Examples:
 * - /api/minter-score/EQxyz...?type=wallet
 * - /api/minter-score/EQabc...?type=token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "auto";
    const tokenAddress = searchParams.get("token");

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    // Validate TON address format (basic check)
    if (!isValidTonAddress(address)) {
      return NextResponse.json(
        { error: "Invalid TON address format" },
        { status: 400 }
      );
    }

    // Determine analysis type
    const analysisType = type === "auto" ? detectAddressType(address) : type;

    if (analysisType === "token") {
      // Full token analysis including minter score
      const analysis = await analyzeToken(address);
      return NextResponse.json({
        success: true,
        type: "token",
        data: analysis,
      });
    } else {
      // Wallet/minter analysis only
      const minterScore = await calculateMinterScore(address, tokenAddress || undefined);
      return NextResponse.json({
        success: true,
        type: "wallet",
        address,
        data: minterScore,
      });
    }
  } catch (error) {
    console.error("[MinterScore] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/minter-score/[address]
 *
 * Batch analyze multiple addresses
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { addresses = [], tokens = [] } = body;

    // Include the URL address in the list
    const allAddresses = [address, ...addresses].filter(Boolean);

    if (allAddresses.length === 0) {
      return NextResponse.json(
        { error: "At least one address required" },
        { status: 400 }
      );
    }

    // Limit batch size
    if (allAddresses.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 addresses per batch" },
        { status: 400 }
      );
    }

    // Analyze all addresses in parallel
    const results = await Promise.all(
      allAddresses.map(async (addr: string) => {
        try {
          const score = await calculateMinterScore(addr);
          return { address: addr, success: true, data: score };
        } catch (error) {
          return {
            address: addr,
            success: false,
            error: error instanceof Error ? error.message : "Failed",
          };
        }
      })
    );

    // Also analyze any tokens provided
    const tokenResults = await Promise.all(
      tokens.slice(0, 5).map(async (tokenAddr: string) => {
        try {
          const analysis = await analyzeToken(tokenAddr);
          return { address: tokenAddr, success: true, type: "token", data: analysis };
        } catch (error) {
          return {
            address: tokenAddr,
            success: false,
            type: "token",
            error: error instanceof Error ? error.message : "Failed",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results: [...results, ...tokenResults],
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[MinterScore] Batch error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Batch analysis failed",
        success: false,
      },
      { status: 500 }
    );
  }
}

// === Helper Functions ===

function isValidTonAddress(address: string): boolean {
  // TON addresses can be:
  // - Raw: 0:... (66 chars with prefix)
  // - User-friendly: EQ.../UQ.../kQ.../0Q... (48 chars base64)
  if (address.startsWith("0:") && address.length === 66) {
    return /^0:[a-fA-F0-9]{64}$/.test(address);
  }

  if (/^[EUk0]Q[a-zA-Z0-9_-]{46}$/.test(address)) {
    return true;
  }

  // Also accept shortened demo addresses for testing
  if (address.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(address)) {
    return true;
  }

  return false;
}

function detectAddressType(address: string): "wallet" | "token" {
  // In practice, we'd query the blockchain to determine if this is a
  // wallet (wallet contract) or jetton (token contract)
  // For now, we default to wallet and let the API handle it
  return "wallet";
}
