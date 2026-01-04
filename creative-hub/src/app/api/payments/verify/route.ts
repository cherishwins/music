/**
 * /api/payments/verify - Verify on-chain USDC payment
 *
 * Self-sovereign payment verification:
 * 1. Client sends tx hash
 * 2. We check the chain directly
 * 3. Verify amount, recipient, and status
 * 4. Return verified or not
 *
 * NO MIDDLEMAN. We verify against the blockchain ourselves.
 */

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi, formatUnits } from "viem";
import { base, baseSepolia } from "viem/chains";

// USDC addresses
const USDC_ADDRESSES = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;

// Treasury address - where payments should go
const TREASURY_ADDRESS = "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54".toLowerCase();

// Product prices in USDC (6 decimals)
const PRODUCT_PRICES: Record<string, bigint> = {
  music_track: BigInt(500000), // $0.50
  music_track_premium: BigInt(2000000), // $2.00
  album_art: BigInt(100000), // $0.10
  brand_package: BigInt(250000), // $0.25
  anthem: BigInt(500000), // $0.50
};

// ERC20 Transfer event signature
const TRANSFER_EVENT = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

interface VerifyRequest {
  txHash: string;
  productId: string;
  chainId?: number;
}

interface VerifyResponse {
  verified: boolean;
  txHash?: string;
  payer?: string;
  amount?: string;
  amountFormatted?: string;
  product?: string;
  timestamp?: number;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<VerifyResponse>> {
  try {
    const body: VerifyRequest = await request.json();
    const { txHash, productId, chainId = baseSepolia.id } = body;

    if (!txHash) {
      return NextResponse.json(
        { verified: false, error: "Transaction hash required" },
        { status: 400 }
      );
    }

    if (!productId || !PRODUCT_PRICES[productId]) {
      return NextResponse.json(
        { verified: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const expectedAmount = PRODUCT_PRICES[productId];
    const chain = chainId === base.id ? base : baseSepolia;
    const usdcAddress = USDC_ADDRESSES[chain.id as keyof typeof USDC_ADDRESSES];

    // Create public client to read from chain
    const client = createPublicClient({
      chain,
      transport: http(),
    });

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return NextResponse.json(
        { verified: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (receipt.status !== "success") {
      return NextResponse.json(
        { verified: false, error: "Transaction failed on-chain" },
        { status: 400 }
      );
    }

    // Find USDC Transfer event to our treasury
    let payer: string | undefined;
    let amount: bigint | undefined;

    for (const log of receipt.logs) {
      // Check if this is a USDC contract log
      if (log.address.toLowerCase() !== usdcAddress.toLowerCase()) {
        continue;
      }

      // Check for Transfer event (topic[0] = keccak256("Transfer(address,address,uint256)"))
      const transferSig = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
      if (log.topics[0] !== transferSig) {
        continue;
      }

      // Decode from and to addresses (they're padded to 32 bytes)
      const from = "0x" + log.topics[1]?.slice(26);
      const to = "0x" + log.topics[2]?.slice(26);

      // Check if this is a transfer TO our treasury
      if (to?.toLowerCase() === TREASURY_ADDRESS) {
        payer = from;
        // Amount is in the data field
        amount = BigInt(log.data);
        break;
      }
    }

    if (!payer || amount === undefined) {
      return NextResponse.json(
        { verified: false, error: "No USDC transfer to treasury found" },
        { status: 400 }
      );
    }

    // Verify amount is sufficient
    if (amount < expectedAmount) {
      return NextResponse.json({
        verified: false,
        error: `Insufficient payment. Expected $${formatUnits(expectedAmount, 6)}, got $${formatUnits(amount, 6)}`,
        payer,
        amount: amount.toString(),
        amountFormatted: formatUnits(amount, 6),
      });
    }

    // Get block timestamp
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });

    // Payment verified!
    return NextResponse.json({
      verified: true,
      txHash,
      payer,
      amount: amount.toString(),
      amountFormatted: formatUnits(amount, 6),
      product: productId,
      timestamp: Number(block.timestamp),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        verified: false,
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Quick check if a tx is verified
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const txHash = searchParams.get("tx");
  const productId = searchParams.get("product") || "music_track";

  if (!txHash) {
    return NextResponse.json({ verified: false, error: "tx param required" });
  }

  // Delegate to POST handler
  const fakeRequest = new Request(request.url, {
    method: "POST",
    body: JSON.stringify({ txHash, productId }),
    headers: { "Content-Type": "application/json" },
  });

  return POST(fakeRequest as NextRequest);
}
