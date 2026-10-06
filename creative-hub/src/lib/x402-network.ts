/**
 * Which network, if any, the x402 / USDC rail may ask buyers to pay on.
 *
 * Off unless configured. X402_NETWORK=base plus an X402_PAYMENT_ADDRESS
 * turns on Base mainnet. X402_NETWORK=base-sepolia (testnet) is honoured
 * only outside production, so a live deployment never asks for test money.
 *
 * Pure and client-safe: the server reads its env directly, the browser gets
 * the same values through next.config.js (NEXT_PUBLIC_X402_*).
 */

export type X402Network = "base" | "base-sepolia";

export function resolveX402Network(env: {
  network?: string;
  payTo?: string;
  /** VERCEL_ENV: "production" | "preview" | "development", unset off Vercel */
  vercelEnv?: string;
  nodeEnv?: string;
}): X402Network | null {
  if (!env.payTo || !/^0x[0-9a-fA-F]{40}$/.test(env.payTo)) return null;

  if (env.network === "base") return "base";

  if (env.network === "base-sepolia") {
    const production = env.vercelEnv
      ? env.vercelEnv === "production"
      : env.nodeEnv === "production";
    return production ? null : "base-sepolia";
  }

  return null;
}

/** For client components: the network the server will accept, or null. */
export function publicX402Network(): X402Network | null {
  return resolveX402Network({
    network: process.env.NEXT_PUBLIC_X402_NETWORK,
    payTo: process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS,
    vercelEnv: process.env.NEXT_PUBLIC_X402_DEPLOY_ENV,
    nodeEnv: process.env.NODE_ENV,
  });
}
