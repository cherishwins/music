/**
 * Contract Configuration - Self-Sovereign Payment Infrastructure
 *
 * TigerPayments contract addresses by network.
 * Update after deployment.
 */

export const CONTRACTS = {
  // Base Sepolia (testnet) - For development
  baseSepolia: {
    tigerPayments: "" as `0x${string}`, // UPDATE AFTER TESTNET DEPLOYMENT
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  },
  // Base Mainnet - For production
  base: {
    tigerPayments: "" as `0x${string}`, // UPDATE AFTER MAINNET DEPLOYMENT
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  },
};

// Treasury address - where direct USDC transfers go
export const TREASURY_ADDRESS =
  "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54" as `0x${string}`;

// Default network based on environment
export const DEFAULT_NETWORK =
  process.env.NODE_ENV === "production" ? "base" : "baseSepolia";

// Get contract addresses for current network
export function getContracts() {
  return CONTRACTS[DEFAULT_NETWORK];
}

// TigerPayments ABI
export const TIGER_PAYMENTS_ABI = [
  {
    name: "pay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "invoiceId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "isPaid",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "invoiceId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getPayment",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "invoiceId", type: "bytes32" }],
    outputs: [
      { name: "payer", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "fulfilled", type: "bool" },
    ],
  },
  {
    name: "markFulfilled",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "invoiceId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "event",
    name: "PaymentReceived",
    inputs: [
      { name: "invoiceId", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PaymentFulfilled",
    inputs: [{ name: "invoiceId", type: "bytes32", indexed: true }],
  },
] as const;
