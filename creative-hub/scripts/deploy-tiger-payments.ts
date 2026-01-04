#!/usr/bin/env npx tsx
/**
 * Deploy TigerPayments Contract
 *
 * Deploys to Base Sepolia (testnet) or Base Mainnet
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/deploy-tiger-payments.ts
 *   PRIVATE_KEY=0x... MAINNET=true npx tsx scripts/deploy-tiger-payments.ts
 */

import {
  createWalletClient,
  createPublicClient,
  http,
  encodeFunctionData,
  parseAbi,
  formatUnits,
} from "viem";
import { baseSepolia, base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Contract bytecode - compiled from TigerPayments.sol
// You'll need to compile with solc or use Foundry
const TIGER_PAYMENTS_BYTECODE = "0x" as `0x${string}`; // We'll fill this after compilation

// Constructor ABI
const CONSTRUCTOR_ABI = parseAbi([
  "constructor(address _usdc, address _treasury)",
]);

// Network configurations
const NETWORKS = {
  testnet: {
    chain: baseSepolia,
    rpc: "https://sepolia.base.org",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
    explorer: "https://sepolia.basescan.org",
  },
  mainnet: {
    chain: base,
    rpc: "https://mainnet.base.org",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC
    explorer: "https://basescan.org",
  },
};

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error("Error: PRIVATE_KEY environment variable required");
    console.log("\nUsage:");
    console.log("  PRIVATE_KEY=0x... npx tsx scripts/deploy-tiger-payments.ts");
    process.exit(1);
  }

  const isMainnet = process.env.MAINNET === "true";
  const network = isMainnet ? NETWORKS.mainnet : NETWORKS.testnet;

  console.log("\n🐯 TigerPayments Deployment");
  console.log("=".repeat(50));
  console.log(`Network: ${isMainnet ? "Base Mainnet" : "Base Sepolia (testnet)"}`);
  console.log(`USDC: ${network.usdc}`);
  console.log("");

  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  console.log(`Deployer: ${account.address}`);

  // Create clients
  const publicClient = createPublicClient({
    chain: network.chain,
    transport: http(network.rpc),
  });

  const walletClient = createWalletClient({
    account,
    chain: network.chain,
    transport: http(network.rpc),
  });

  // Check deployer balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${formatUnits(balance, 18)} ETH`);

  if (balance < BigInt(1e15)) {
    console.error("\n❌ Insufficient ETH for deployment gas");
    console.log(`Get testnet ETH: https://www.coinbase.com/faucets/base-sepolia`);
    process.exit(1);
  }

  // Treasury = deployer by default (you control it!)
  const treasury = account.address;
  console.log(`Treasury: ${treasury}`);
  console.log("");

  // Check if we have bytecode
  if (TIGER_PAYMENTS_BYTECODE === "0x") {
    console.log("⚠️  Contract bytecode not compiled yet!");
    console.log("");
    console.log("To compile with Foundry:");
    console.log("  1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash");
    console.log("  2. Run: forge build contracts/TigerPayments.sol");
    console.log("  3. Copy bytecode from out/TigerPayments.sol/TigerPayments.json");
    console.log("");
    console.log("Or use Remix:");
    console.log("  1. Go to https://remix.ethereum.org");
    console.log("  2. Paste TigerPayments.sol");
    console.log("  3. Compile and copy bytecode");
    console.log("");

    // For now, let's use a simpler approach - direct USDC transfers
    console.log("💡 Alternative: Skip the contract entirely!");
    console.log("   Users can pay directly to your wallet via USDC.transfer()");
    console.log("   Your treasury: 0x14E6076eAC2420e56b4E2E18c815b2DD52264D54");
    process.exit(0);
  }

  console.log("📜 Deploying TigerPayments contract...");

  try {
    // Encode constructor arguments
    const constructorData = encodeFunctionData({
      abi: CONSTRUCTOR_ABI,
      functionName: undefined,
      args: [network.usdc, treasury],
    });

    // Combine bytecode + constructor args
    const deployData = (TIGER_PAYMENTS_BYTECODE + constructorData.slice(2)) as `0x${string}`;

    // Deploy
    const hash = await walletClient.deployContract({
      abi: [],
      bytecode: deployData,
    });

    console.log(`Transaction: ${hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success" && receipt.contractAddress) {
      console.log("\n✅ Contract deployed!");
      console.log(`Address: ${receipt.contractAddress}`);
      console.log(`Explorer: ${network.explorer}/address/${receipt.contractAddress}`);
      console.log("");
      console.log("Add to .env:");
      console.log(`TIGER_PAYMENTS_ADDRESS=${receipt.contractAddress}`);
    } else {
      console.error("❌ Deployment failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("Deployment error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
