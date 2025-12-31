/**
 * x402 Payment Integration
 * HTTP-native micropayments for AI-generated content
 *
 * Flow:
 * 1. Request comes in without payment
 * 2. We return 402 Payment Required with payment details
 * 3. Client signs USDC transfer with their wallet
 * 4. Client retries with X-PAYMENT header
 * 5. We verify and settle, then serve content
 */

import { NextRequest, NextResponse } from "next/server";

// Payment configuration for each endpoint
export interface PaymentConfig {
  price: string; // e.g., "$0.50" or "0.5" (USD)
  description: string;
  recipient?: string; // defaults to env var
}

// Payment requirement returned in 402 response
export interface PaymentRequirement {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, unknown>;
}

// The facilitator URL (Coinbase's managed service or our own)
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL ||
  "https://x402.org/facilitator";

// Our payment receiving address
const PAYMENT_ADDRESS = process.env.X402_PAYMENT_ADDRESS ||
  process.env.NEXT_PUBLIC_TON_WALLET_ADDRESS;

// Supported networks
const SUPPORTED_NETWORKS = {
  "base-sepolia": {
    chainId: "eip155:84532",
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
  },
  "base": {
    chainId: "eip155:8453",
    asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base Mainnet
  },
} as const;

type NetworkId = keyof typeof SUPPORTED_NETWORKS;

/**
 * Parse price string to USDC amount (6 decimals)
 */
function parsePrice(price: string): string {
  const numericPrice = parseFloat(price.replace("$", ""));
  // USDC has 6 decimals
  return Math.floor(numericPrice * 1_000_000).toString();
}

/**
 * Create a 402 Payment Required response
 */
export function createPaymentRequiredResponse(
  request: NextRequest,
  config: PaymentConfig,
  network: NetworkId = "base-sepolia"
): NextResponse {
  const networkConfig = SUPPORTED_NETWORKS[network];
  const recipient = config.recipient || PAYMENT_ADDRESS;

  if (!recipient) {
    console.error("No payment address configured");
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 500 }
    );
  }

  const requirement: PaymentRequirement = {
    scheme: "exact",
    network: networkConfig.chainId,
    maxAmountRequired: parsePrice(config.price),
    resource: request.url,
    description: config.description,
    mimeType: "application/json",
    payTo: recipient,
    maxTimeoutSeconds: 60,
    asset: networkConfig.asset,
  };

  // Encode as base64 for header
  const paymentRequiredB64 = Buffer.from(
    JSON.stringify({ accepts: [requirement] })
  ).toString("base64");

  return new NextResponse(
    JSON.stringify({
      error: "Payment Required",
      message: `This endpoint requires payment of ${config.price}`,
      accepts: [requirement],
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT-REQUIRED": paymentRequiredB64,
        "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED",
      },
    }
  );
}

/**
 * Verify payment with facilitator
 */
export async function verifyPayment(
  paymentHeader: string,
  expectedAmount: string,
  resource: string
): Promise<{ valid: boolean; payer?: string; error?: string }> {
  try {
    const response = await fetch(`${FACILITATOR_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: paymentHeader,
        requirement: {
          scheme: "exact",
          maxAmountRequired: expectedAmount,
          resource,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { valid: false, error };
    }

    const result = await response.json();
    return { valid: result.isValid, payer: result.payer };
  } catch (error) {
    console.error("Payment verification failed:", error);
    return { valid: false, error: "Verification service unavailable" };
  }
}

/**
 * Settle payment on-chain via facilitator
 */
export async function settlePayment(
  paymentHeader: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const response = await fetch(`${FACILITATOR_URL}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: paymentHeader }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, txHash: result.txHash };
  } catch (error) {
    console.error("Payment settlement failed:", error);
    return { success: false, error: "Settlement service unavailable" };
  }
}

/**
 * Higher-order function to wrap API routes with x402 payment
 */
export function withPayment(
  config: PaymentConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function paymentHandler(request: NextRequest): Promise<NextResponse> {
    // Check for payment header
    const paymentHeader = request.headers.get("X-PAYMENT");

    if (!paymentHeader) {
      // No payment - return 402
      return createPaymentRequiredResponse(request, config);
    }

    // Verify the payment
    const verification = await verifyPayment(
      paymentHeader,
      parsePrice(config.price),
      request.url
    );

    if (!verification.valid) {
      return NextResponse.json(
        { error: "Invalid payment", details: verification.error },
        { status: 402 }
      );
    }

    // Settle the payment on-chain
    const settlement = await settlePayment(paymentHeader);

    if (!settlement.success) {
      return NextResponse.json(
        { error: "Payment settlement failed", details: settlement.error },
        { status: 402 }
      );
    }

    // Payment successful - execute the handler
    const response = await handler(request);

    // Add payment receipt to response headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-PAYMENT-TX", settlement.txHash || "");
    newHeaders.set("X-PAYMENT-PAYER", verification.payer || "");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Endpoint pricing configuration
 */
export const ENDPOINT_PRICING: Record<string, PaymentConfig> = {
  "/api/generate/music": {
    price: "$0.50",
    description: "Generate AI music track",
  },
  "/api/generate/album-art": {
    price: "$0.10",
    description: "Generate AI album artwork",
  },
  "/api/generate/brand": {
    price: "$0.25",
    description: "Generate complete brand package",
  },
  "/api/generate/thread-to-hit": {
    price: "$1.00",
    description: "Transform thread into full song with vocals",
  },
  "/api/generate/voice": {
    price: "$0.10",
    description: "Generate AI voice audio",
  },
  "/api/generate/slides": {
    price: "$0.25",
    description: "Generate AI presentation slides",
  },
  "/api/generate/social-kit": {
    price: "$0.25",
    description: "Generate social media brand kit",
  },
  "/api/generate/video-prompt": {
    price: "$0.25",
    description: "Generate optimized video prompts",
  },
};

/**
 * Check if request has valid payment for endpoint
 * Use this in individual route handlers
 */
export async function requirePayment(
  request: NextRequest,
  endpoint: string
): Promise<NextResponse | null> {
  const config = ENDPOINT_PRICING[endpoint];

  if (!config) {
    // No pricing configured - allow free access
    return null;
  }

  const paymentHeader = request.headers.get("X-PAYMENT");

  if (!paymentHeader) {
    return createPaymentRequiredResponse(request, config);
  }

  const verification = await verifyPayment(
    paymentHeader,
    parsePrice(config.price),
    request.url
  );

  if (!verification.valid) {
    return NextResponse.json(
      { error: "Invalid payment", details: verification.error },
      { status: 402 }
    );
  }

  const settlement = await settlePayment(paymentHeader);

  if (!settlement.success) {
    return NextResponse.json(
      { error: "Payment settlement failed", details: settlement.error },
      { status: 402 }
    );
  }

  // Payment valid - return null to continue with handler
  return null;
}
