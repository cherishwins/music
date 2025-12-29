"use client";

/**
 * Multi-Rail Checkout Component
 * Let users pay with whatever they have:
 * - Telegram Stars (native TG)
 * - TON (crypto native)
 * - USDC via x402 (web3)
 * - Card via Stripe (traditional)
 * - Coinbase Onramp (fiat → crypto)
 */

import { useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { createTonPayment, TON_PRICING, type TonPlanId } from "@/lib/ton";
import { createOnrampUrl, CREDIT_PACKAGES, type PackageId } from "@/lib/coinbase";
import { STAR_PLANS, type PlanId } from "@/lib/telegram";

interface CheckoutProps {
  productId: string;
  productName: string;
  priceUsd: number;
  onSuccess?: (method: string, txId?: string) => void;
  onCancel?: () => void;
}

type PaymentMethod = "stars" | "ton" | "usdc" | "card" | "onramp";

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}> = [
  {
    id: "stars",
    name: "Telegram Stars",
    icon: "⭐",
    description: "Pay with Telegram's native currency",
    available: typeof window !== "undefined" && !!(window as Window & { Telegram?: unknown }).Telegram,
  },
  {
    id: "ton",
    name: "TON",
    icon: "💎",
    description: "Pay with Toncoin from your wallet",
    available: true,
  },
  {
    id: "usdc",
    name: "USDC (x402)",
    icon: "🔷",
    description: "Auto-pay with USDC on Base",
    available: true,
  },
  {
    id: "card",
    name: "Card",
    icon: "💳",
    description: "Pay with credit/debit card",
    available: true,
  },
  {
    id: "onramp",
    name: "Buy Crypto",
    icon: "🏦",
    description: "Buy USDC with Apple Pay or bank",
    available: true,
  },
];

export function MultiRailCheckout({
  productId,
  productName,
  priceUsd,
  onSuccess,
  onCancel,
}: CheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tonConnectUI] = useTonConnectUI();

  // Convert USD to other currencies (approximate)
  const priceStars = Math.ceil(priceUsd * 100); // ~100 stars per $1
  const priceTon = (priceUsd / 1.0).toFixed(2); // ~$1 per TON (update with real rate)
  const priceUsdc = priceUsd.toFixed(2);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    setError(null);

    try {
      switch (selectedMethod) {
        case "stars":
          await handleStarsPayment();
          break;
        case "ton":
          await handleTonPayment();
          break;
        case "usdc":
          await handleUsdcPayment();
          break;
        case "card":
          await handleCardPayment();
          break;
        case "onramp":
          await handleOnrampPayment();
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStarsPayment = async () => {
    // Create invoice via API
    const response = await fetch("/api/payments/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: productId,
        userId: "user-id", // Get from auth
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Open Telegram payment
    if (data.invoiceUrl) {
      window.open(data.invoiceUrl, "_blank");
      onSuccess?.("stars");
    }
  };

  const handleTonPayment = async () => {
    if (!tonConnectUI.connected) {
      await tonConnectUI.openModal();
      return;
    }

    const payment = createTonPayment(productId as TonPlanId, "user-id");
    const result = await tonConnectUI.sendTransaction(payment);

    if (result) {
      onSuccess?.("ton", result.boc);
    }
  };

  const handleUsdcPayment = async () => {
    // For x402, the payment happens automatically when making the API call
    // This is handled by the x402 interceptor in the client
    onSuccess?.("usdc");
  };

  const handleCardPayment = async () => {
    // Create Stripe checkout session
    const response = await fetch("/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        priceUsd,
      }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleOnrampPayment = async () => {
    // Get user's wallet address or create one
    const walletAddress = process.env.NEXT_PUBLIC_TON_WALLET_ADDRESS || "";

    const onrampUrl = createOnrampUrl(walletAddress, priceUsd, {
      successUrl: `${window.location.origin}/payment-success`,
    });

    window.open(onrampUrl, "_blank");
    onSuccess?.("onramp");
  };

  return (
    <div className="glass p-6 rounded-xl max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{productName}</h2>
      <p className="text-gray-400 mb-6">${priceUsd.toFixed(2)} USD</p>

      {/* Payment method selection */}
      <div className="space-y-3 mb-6">
        {PAYMENT_METHODS.filter((m) => m.available).map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full p-4 rounded-lg border transition-all ${
              selectedMethod === method.id
                ? "border-gold-500 bg-gold-500/10"
                : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div className="text-left flex-1">
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-gray-400">{method.description}</div>
              </div>
              <div className="text-right text-sm">
                {method.id === "stars" && `${priceStars} ⭐`}
                {method.id === "ton" && `${priceTon} TON`}
                {method.id === "usdc" && `${priceUsdc} USDC`}
                {method.id === "card" && `$${priceUsd.toFixed(2)}`}
                {method.id === "onramp" && `$${priceUsd.toFixed(2)}`}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={!selectedMethod || loading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            selectedMethod && !loading
              ? "bg-gold-500 hover:bg-gold-600 text-black"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>

      {/* x402 badge */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Crypto payments secured by x402 protocol
      </div>
    </div>
  );
}

export default MultiRailCheckout;
