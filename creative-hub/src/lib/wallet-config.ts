/**
 * Wallet Configuration - Self-Sovereign Payments
 *
 * We control everything:
 * - Our own wallet connections
 * - Our own payment flow
 * - Our own verification
 */

import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Your payment receiving address
export const TREASURY_ADDRESS = "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54" as const;

// USDC contract addresses
export const USDC_ADDRESSES = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;

// Default to testnet in development
export const DEFAULT_CHAIN = process.env.NODE_ENV === "production" ? base : baseSepolia;

// Wagmi config - Coinbase Wallet only (no MetaMask SDK dependency issues)
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "White Tiger",
      appLogoUrl: "https://creative-hub-virid.vercel.app/assets/brand/logo-primary.jpg",
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

// USDC ABI - just what we need
export const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Product pricing (in USDC, 6 decimals)
export const PRODUCTS = {
  music_track: {
    name: "AI Music Track",
    description: "Full-length AI-generated track",
    priceUsdc: "500000", // $0.50
    priceDisplay: "$0.50",
  },
  music_track_premium: {
    name: "Premium Music Track",
    description: "Extended track with higher quality",
    priceUsdc: "2000000", // $2.00
    priceDisplay: "$2.00",
  },
  album_art: {
    name: "Album Artwork",
    description: "AI-generated album cover",
    priceUsdc: "100000", // $0.10
    priceDisplay: "$0.10",
  },
  brand_package: {
    name: "Brand Package",
    description: "Logo + colors + social kit",
    priceUsdc: "250000", // $0.25
    priceDisplay: "$0.25",
  },
  anthem: {
    name: "Community Anthem",
    description: "30-second meme coin anthem",
    priceUsdc: "500000", // $0.50
    priceDisplay: "$0.50",
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
