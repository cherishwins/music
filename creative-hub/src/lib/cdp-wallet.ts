/**
 * CDP Wallet Integration - Server-Side Operations
 *
 * This module handles server-side wallet operations using Coinbase CDP SDK.
 * Use this for:
 * - Verifying payments on-chain
 * - Marking orders as fulfilled via contract
 * - Treasury operations
 */

import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http, parseAbi } from "viem";
import { base, baseSepolia } from "viem/chains";

// Contract addresses
export const CONTRACTS = {
  base: {
    tigerPayments: process.env.TIGER_PAYMENTS_ADDRESS as `0x${string}` | undefined,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  },
  baseSepolia: {
    tigerPayments: process.env.TIGER_PAYMENTS_ADDRESS_TESTNET as `0x${string}` | undefined,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  },
};

// TigerPayments ABI (only what we need)
export const TIGER_PAYMENTS_ABI = parseAbi([
  "function isPaid(bytes32 invoiceId) view returns (bool)",
  "function getPayment(bytes32 invoiceId) view returns (address payer, uint256 amount, uint256 timestamp, bool fulfilled)",
  "function markFulfilled(bytes32 invoiceId)",
  "event PaymentReceived(bytes32 indexed invoiceId, address indexed payer, uint256 amount, uint256 timestamp)",
  "event PaymentFulfilled(bytes32 indexed invoiceId)",
]);

// Network selection
const isProduction = process.env.NODE_ENV === "production";
export const ACTIVE_NETWORK = isProduction ? base : baseSepolia;
export const ACTIVE_CONTRACTS = isProduction ? CONTRACTS.base : CONTRACTS.baseSepolia;

/**
 * Initialize CDP client with API keys
 * Note: CDP client is optional - we can do on-chain verification without it
 */
export function createCdpClient(): CdpClient | null {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyId || !apiKeySecret) {
    console.warn("CDP_API_KEY_ID and CDP_API_KEY_SECRET not configured - CDP features disabled");
    return null;
  }

  try {
    return new CdpClient({
      apiKeyId,
      apiKeySecret,
    });
  } catch (error) {
    console.error("Failed to create CDP client:", error);
    return null;
  }
}

/**
 * Create a public client for reading from chain
 */
export function createChainClient() {
  return createPublicClient({
    chain: ACTIVE_NETWORK,
    transport: http(),
  });
}

/**
 * Generate invoice ID from order details
 * This creates a deterministic ID that both frontend and backend can compute
 */
export function generateInvoiceId(params: {
  productId: string;
  userId: string;
  timestamp: number;
}): `0x${string}` {
  const data = `${params.productId}:${params.userId}:${params.timestamp}`;
  // Simple hash using FNV-1a algorithm (no iteration needed)
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Convert to 32-byte hex string
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x${hex.repeat(8)}` as `0x${string}`;
}

/**
 * Check if an invoice has been paid on-chain
 */
export async function checkPayment(invoiceId: `0x${string}`): Promise<{
  paid: boolean;
  payer?: string;
  amount?: bigint;
  timestamp?: number;
  fulfilled?: boolean;
}> {
  const client = createChainClient();
  const contractAddress = ACTIVE_CONTRACTS.tigerPayments;

  if (!contractAddress) {
    console.warn("TigerPayments contract not deployed");
    return { paid: false };
  }

  try {
    // Check if paid
    const isPaid = await client.readContract({
      address: contractAddress,
      abi: TIGER_PAYMENTS_ABI,
      functionName: "isPaid",
      args: [invoiceId],
    });

    if (!isPaid) {
      return { paid: false };
    }

    // Get full payment details
    const payment = await client.readContract({
      address: contractAddress,
      abi: TIGER_PAYMENTS_ABI,
      functionName: "getPayment",
      args: [invoiceId],
    });

    return {
      paid: true,
      payer: payment[0],
      amount: payment[1],
      timestamp: Number(payment[2]),
      fulfilled: payment[3],
    };
  } catch (error) {
    console.error("Error checking payment:", error);
    return { paid: false };
  }
}

/**
 * Verify USDC transfer directly (without contract)
 * Use this if not using the TigerPayments contract
 */
export async function verifyUsdcTransfer(
  txHash: `0x${string}`,
  expectedRecipient: `0x${string}`,
  minAmount: bigint
): Promise<{
  verified: boolean;
  payer?: string;
  amount?: bigint;
  error?: string;
}> {
  const client = createChainClient();

  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash });

    if (!receipt || receipt.status !== "success") {
      return { verified: false, error: "Transaction failed or not found" };
    }

    // Look for USDC Transfer event
    const transferSig =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const usdcAddress = ACTIVE_CONTRACTS.usdc.toLowerCase();

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== usdcAddress) continue;
      if (log.topics[0] !== transferSig) continue;

      const to = ("0x" + log.topics[2]?.slice(26)) as `0x${string}`;
      if (to.toLowerCase() !== expectedRecipient.toLowerCase()) continue;

      const payer = ("0x" + log.topics[1]?.slice(26)) as string;
      const amount = BigInt(log.data);

      if (amount >= minAmount) {
        return { verified: true, payer, amount };
      }

      return {
        verified: false,
        payer,
        amount,
        error: `Amount ${amount} < required ${minAmount}`,
      };
    }

    return { verified: false, error: "No matching USDC transfer found" };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Get all payments from contract events (for debugging/admin)
 */
export async function getRecentPayments(fromBlock: bigint = BigInt(0)): Promise<
  Array<{
    invoiceId: string;
    payer: string;
    amount: bigint;
    timestamp: bigint;
    blockNumber: bigint;
    txHash: string;
  }>
> {
  const client = createChainClient();
  const contractAddress = ACTIVE_CONTRACTS.tigerPayments;

  if (!contractAddress) {
    return [];
  }

  try {
    const logs = await client.getLogs({
      address: contractAddress,
      event: {
        type: "event",
        name: "PaymentReceived",
        inputs: [
          { type: "bytes32", name: "invoiceId", indexed: true },
          { type: "address", name: "payer", indexed: true },
          { type: "uint256", name: "amount", indexed: false },
          { type: "uint256", name: "timestamp", indexed: false },
        ],
      },
      fromBlock,
      toBlock: "latest",
    });

    return logs.map((log) => ({
      invoiceId: log.args.invoiceId!,
      payer: log.args.payer!,
      amount: log.args.amount!,
      timestamp: log.args.timestamp!,
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
    }));
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
}

/**
 * Product pricing in USDC (6 decimals)
 */
export const PRODUCT_PRICES: Record<
  string,
  { amount: bigint; name: string; description: string }
> = {
  music_track: {
    amount: BigInt(500000), // $0.50
    name: "AI Music Track",
    description: "Full-length AI-generated track",
  },
  music_track_premium: {
    amount: BigInt(2000000), // $2.00
    name: "Premium Music Track",
    description: "Extended track with higher quality",
  },
  album_art: {
    amount: BigInt(100000), // $0.10
    name: "Album Artwork",
    description: "AI-generated album cover",
  },
  brand_package: {
    amount: BigInt(250000), // $0.25
    name: "Brand Package",
    description: "Logo + colors + social kit",
  },
  anthem: {
    amount: BigInt(500000), // $0.50
    name: "Community Anthem",
    description: "30-second meme coin anthem",
  },
  thread_to_hit: {
    amount: BigInt(1000000), // $1.00
    name: "Thread to Hit",
    description: "Transform thread into full song",
  },
};

export type ProductId = keyof typeof PRODUCT_PRICES;
