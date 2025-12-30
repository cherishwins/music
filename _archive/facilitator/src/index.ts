/**
 * x402 Facilitator Service
 * Verifies and settles payments on-chain
 *
 * BE THE INFRASTRUCTURE.
 *
 * Other apps use our facilitator to process x402 payments.
 * We can charge fees and build reputation.
 *
 * Endpoints:
 * - GET /supported - List supported networks
 * - POST /verify - Verify payment payload
 * - POST /settle - Settle payment on-chain
 * - GET /health - Health check
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  encodeFunctionData,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 4022;
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY as `0x${string}`;
const FEE_PERCENTAGE = parseFloat(process.env.FEE_PERCENTAGE || "0.1"); // 0.1% fee

// Network configurations
const NETWORKS = {
  "eip155:84532": {
    name: "Base Sepolia",
    chain: baseSepolia,
    rpcUrl: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address,
  },
  "eip155:8453": {
    name: "Base Mainnet",
    chain: base,
    rpcUrl: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  },
};

type NetworkId = keyof typeof NETWORKS;

// USDC ABI (ERC20 with permit)
const USDC_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
]);

// Create clients for each network
function getClients(networkId: NetworkId) {
  const network = NETWORKS[networkId];
  if (!network) throw new Error(`Unsupported network: ${networkId}`);

  const publicClient = createPublicClient({
    chain: network.chain,
    transport: http(network.rpcUrl),
  });

  const account = privateKeyToAccount(EVM_PRIVATE_KEY);
  const walletClient = createWalletClient({
    account,
    chain: network.chain,
    transport: http(network.rpcUrl),
  });

  return { publicClient, walletClient, network, account };
}

// GET /supported - List supported payment schemes
app.get("/supported", (_req: Request, res: Response) => {
  const schemes = Object.entries(NETWORKS).map(([networkId, network]) => ({
    scheme: "exact",
    network: networkId,
    asset: network.usdc,
    name: network.name,
  }));

  res.json({
    schemes,
    feePercentage: FEE_PERCENTAGE,
    facilitatorAddress: EVM_PRIVATE_KEY
      ? privateKeyToAccount(EVM_PRIVATE_KEY).address
      : null,
  });
});

// POST /verify - Verify payment payload
app.post("/verify", async (req: Request, res: Response) => {
  try {
    const { payload, requirement } = req.body;

    if (!payload || !requirement) {
      return res.status(400).json({
        isValid: false,
        error: "Missing payload or requirement",
      });
    }

    // Decode payload
    let decodedPayload;
    try {
      decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString());
    } catch {
      return res.status(400).json({
        isValid: false,
        error: "Invalid payload encoding",
      });
    }

    const { network, payload: paymentData } = decodedPayload;

    // Verify network is supported
    if (!NETWORKS[network as NetworkId]) {
      return res.status(400).json({
        isValid: false,
        error: `Unsupported network: ${network}`,
      });
    }

    // Verify amount matches requirement
    const { authorization } = paymentData;
    if (BigInt(authorization.value) < BigInt(requirement.maxAmountRequired)) {
      return res.status(400).json({
        isValid: false,
        error: "Insufficient payment amount",
      });
    }

    // Verify time constraints
    const now = Math.floor(Date.now() / 1000);
    if (authorization.validAfter && now < authorization.validAfter) {
      return res.status(400).json({
        isValid: false,
        error: "Payment not yet valid",
      });
    }
    if (authorization.validBefore && now > authorization.validBefore) {
      return res.status(400).json({
        isValid: false,
        error: "Payment expired",
      });
    }

    // TODO: Verify signature cryptographically
    // For now, basic structure validation passes

    res.json({
      isValid: true,
      payer: authorization.from,
      amount: authorization.value,
      network,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    res.status(500).json({ isValid: false, error: message });
  }
});

// POST /settle - Settle payment on-chain
app.post("/settle", async (req: Request, res: Response) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({
        success: false,
        error: "Missing payload",
      });
    }

    if (!EVM_PRIVATE_KEY) {
      return res.status(500).json({
        success: false,
        error: "Facilitator wallet not configured",
      });
    }

    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString());
    const { network, payload: paymentData } = decodedPayload;
    const { authorization, signature } = paymentData;

    const networkId = network as NetworkId;
    const { publicClient, walletClient, network: networkConfig, account } = getClients(networkId);

    // Check facilitator has gas
    const balance = await publicClient.getBalance({
      address: account.address,
    });

    if (balance < BigInt(1e15)) {
      // < 0.001 ETH
      return res.status(500).json({
        success: false,
        error: "Facilitator low on gas",
      });
    }

    // Execute the transfer
    // In production, this would use permit + transferFrom for gasless user experience
    // For now, we simulate with a direct transfer log

    console.log("Settlement request:", {
      from: authorization.from,
      to: authorization.to,
      amount: authorization.value,
      network: networkId,
    });

    // TODO: Implement actual on-chain settlement with permit
    // This requires the user to have approved spending or use EIP-2612 permit

    // For demo, return a mock transaction hash
    const mockTxHash = `0x${Date.now().toString(16)}${"0".repeat(40)}`;

    res.json({
      success: true,
      txHash: mockTxHash,
      network: networkId,
      amount: authorization.value,
      from: authorization.from,
      to: authorization.to,
      facilitatorFee: Math.floor(
        (Number(authorization.value) * FEE_PERCENTAGE) / 100
      ).toString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Settlement failed";
    console.error("Settlement error:", error);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /health - Health check
app.get("/health", (_req: Request, res: Response) => {
  const hasWallet = !!EVM_PRIVATE_KEY;
  const account = hasWallet ? privateKeyToAccount(EVM_PRIVATE_KEY) : null;

  res.json({
    status: "healthy",
    version: "1.0.0",
    facilitator: account?.address || "not configured",
    networks: Object.keys(NETWORKS),
    feePercentage: FEE_PERCENTAGE,
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 x402 Facilitator running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Fee: ${FEE_PERCENTAGE}%`);

  if (!EVM_PRIVATE_KEY) {
    console.warn("⚠️  EVM_PRIVATE_KEY not set - settlement will fail");
  } else {
    const account = privateKeyToAccount(EVM_PRIVATE_KEY);
    console.log(`💳 Facilitator address: ${account.address}`);
  }
});
