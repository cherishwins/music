/**
 * Coinbase Integration
 * - Onramp: Fiat → Crypto (for users without wallets)
 * - AgentKit: Autonomous AI agent transactions
 */

// Coinbase Developer Platform project ID
export const COINBASE_PROJECT_ID = process.env.NEXT_PUBLIC_COINBASE_PROJECT_ID;

// Target chain for purchases
export const ONRAMP_CHAIN = "base"; // Base mainnet

// Default asset for purchases
export const ONRAMP_ASSET = "USDC";

/**
 * Credit packages available for purchase
 */
export const CREDIT_PACKAGES = {
  small: {
    credits: 100,
    usdAmount: 5,
    description: "100 AI credits",
  },
  medium: {
    credits: 500,
    usdAmount: 20,
    description: "500 AI credits + priority",
  },
  large: {
    credits: 2000,
    usdAmount: 50,
    description: "2000 AI credits + all features",
  },
} as const;

export type PackageId = keyof typeof CREDIT_PACKAGES;

/**
 * Create onramp URL for direct purchase
 * Uses Coinbase's one-click-buy flow
 */
export function createOnrampUrl(
  recipientAddress: string,
  usdAmount: number,
  options?: {
    asset?: string;
    chain?: string;
    successUrl?: string;
  }
): string {
  if (!COINBASE_PROJECT_ID) {
    throw new Error("COINBASE_PROJECT_ID not configured");
  }

  const params = new URLSearchParams({
    appId: COINBASE_PROJECT_ID,
    destinationWallets: JSON.stringify([
      {
        address: recipientAddress,
        assets: [options?.asset || ONRAMP_ASSET],
        supportedNetworks: [options?.chain || ONRAMP_CHAIN],
      },
    ]),
    presetCryptoAmount: usdAmount.toString(),
  });

  if (options?.successUrl) {
    params.set("successUrl", options.successUrl);
  }

  return `https://pay.coinbase.com/buy/select-asset?${params.toString()}`;
}

/**
 * Check if Coinbase Onramp is configured
 */
export function isOnrampConfigured(): boolean {
  return !!COINBASE_PROJECT_ID;
}

/**
 * Get package by ID
 */
export function getPackage(packageId: PackageId) {
  return CREDIT_PACKAGES[packageId];
}
