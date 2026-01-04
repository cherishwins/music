"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { baseSepolia, base } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import {
  USDC_ADDRESSES,
  USDC_ABI,
  TREASURY_ADDRESS,
  PRODUCTS,
  type ProductId,
} from "@/lib/wallet-config";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { WalletButton } from "./wallet-button";

interface USDCPaymentProps {
  productId: ProductId;
  invoiceId?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

type PaymentStep = "connect" | "switch" | "approve" | "pay" | "confirming" | "success" | "error";

export function USDCPayment({
  productId,
  invoiceId,
  onSuccess,
  onError,
}: USDCPaymentProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [step, setStep] = useState<PaymentStep>("connect");
  const [error, setError] = useState<string | null>(null);

  const product = PRODUCTS[productId];
  const amount = BigInt(product.priceUsdc);

  // Use testnet for now
  const targetChainId = baseSepolia.id;
  const usdcAddress = USDC_ADDRESSES[targetChainId];
  const isCorrectChain = chainId === targetChainId;

  // Read USDC balance
  const { data: balance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isCorrectChain },
  });

  // Write contract
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update step based on state
  useEffect(() => {
    if (!isConnected) {
      setStep("connect");
    } else if (!isCorrectChain) {
      setStep("switch");
    } else if (isWritePending) {
      setStep("approve");
    } else if (isConfirming) {
      setStep("confirming");
    } else if (isConfirmed && txHash) {
      setStep("success");
      onSuccess?.(txHash);
    } else if (writeError || confirmError) {
      setStep("error");
      const err = writeError || confirmError;
      setError(err?.message || "Payment failed");
      onError?.(err as Error);
    } else {
      setStep("pay");
    }
  }, [
    isConnected,
    isCorrectChain,
    isWritePending,
    isConfirming,
    isConfirmed,
    txHash,
    writeError,
    confirmError,
    onSuccess,
    onError,
  ]);

  const handlePay = async () => {
    if (!address) return;

    try {
      // Direct USDC transfer to treasury
      writeContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [TREASURY_ADDRESS, amount],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStep("error");
    }
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: targetChainId });
  };

  const hasEnoughBalance = balance && balance >= amount;
  const explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`;

  return (
    <div className="p-6 rounded-2xl bg-crucible border border-white/10">
      {/* Product info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-white/60 text-sm">{product.description}</p>
        <div className="mt-2 text-2xl font-bold text-tiger">
          {product.priceDisplay} <span className="text-sm text-white/50">USDC</span>
        </div>
      </div>

      {/* Step UI */}
      <div className="space-y-4">
        {step === "connect" && (
          <div className="text-center">
            <p className="text-white/60 mb-4">Connect your wallet to pay with USDC</p>
            <WalletButton />
          </div>
        )}

        {step === "switch" && (
          <div className="text-center">
            <p className="text-white/60 mb-4">
              Please switch to Base Sepolia network
            </p>
            <Button onClick={handleSwitchChain} className="bg-tiger hover:bg-tiger-muted">
              Switch Network
            </Button>
          </div>
        )}

        {step === "pay" && (
          <div>
            {balance !== undefined && (
              <div className="mb-4 p-3 rounded-lg bg-white/5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Your USDC balance:</span>
                  <span className="font-mono">
                    ${formatUnits(balance, 6)}
                  </span>
                </div>
              </div>
            )}

            {!hasEnoughBalance && balance !== undefined && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                Insufficient USDC balance. You need {product.priceDisplay}.
              </div>
            )}

            <Button
              onClick={handlePay}
              disabled={!hasEnoughBalance}
              className="w-full bg-tiger hover:bg-tiger-muted h-12 text-lg"
            >
              Pay {product.priceDisplay} USDC
            </Button>

            <p className="text-center text-xs text-white/40 mt-3">
              Paying to: {TREASURY_ADDRESS.slice(0, 10)}...
            </p>
          </div>
        )}

        {step === "approve" && (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-tiger mx-auto mb-4" />
            <p className="text-white/60">Confirm transaction in your wallet...</p>
          </div>
        )}

        {step === "confirming" && (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-tiger mx-auto mb-4" />
            <p className="text-white/60">Confirming on-chain...</p>
            {txHash && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-tiger hover:underline inline-flex items-center gap-1 mt-2"
              >
                View transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-lg font-bold mb-2">Payment successful!</p>
            <p className="text-white/60 text-sm mb-4">
              Your content is being generated...
            </p>
            {txHash && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-tiger hover:underline inline-flex items-center gap-1"
              >
                View on BaseScan <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-bold mb-2">Payment failed</p>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setStep("pay");
              }}
              variant="outline"
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
