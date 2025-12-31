"use client";

/**
 * Simplified Checkout for Telegram Users
 * Primary: Telegram Stars (one tap, no friction)
 * Secondary: TON (for crypto users)
 * Everything else hidden - too confusing
 */

import { useState, useCallback } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { createTonPayment, type TonPlanId } from "@/lib/ton";

interface CheckoutProps {
  productId: string;
  productName: string;
  priceUsd: number;
  userId?: string;
  onSuccess?: (method: string, txId?: string) => void;
  onCancel?: () => void;
}

// Check if we're in Telegram
const isTelegram = () => {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp;
};

export function MultiRailCheckout({
  productId,
  productName,
  priceUsd,
  userId,
  onSuccess,
  onCancel,
}: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [tonConnectUI] = useTonConnectUI();

  // Pricing
  const priceStars = Math.ceil(priceUsd * 100); // ~100 stars per $1
  const priceTon = (priceUsd / 2.5).toFixed(2); // ~$2.50 per TON

  // ============================================
  // TELEGRAM STARS - Primary Payment Method
  // ============================================
  const handleStarsPayment = useCallback(async () => {
    setLoading(true);
    setLoadingMethod("stars");
    setError(null);
    setStatus("Creating invoice...");

    try {
      // Create invoice
      const response = await fetch("/api/payments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: productId,
          userId: userId || "anonymous",
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.invoiceUrl) {
        throw new Error("Failed to create invoice");
      }

      // Open Telegram native payment
      const tg = (window as Window & {
        Telegram?: {
          WebApp?: {
            openInvoice: (url: string, callback?: (status: string) => void) => void
          }
        }
      }).Telegram?.WebApp;

      if (tg?.openInvoice) {
        setStatus("Opening payment...");

        // Use callback to know when payment completes
        tg.openInvoice(data.invoiceUrl, (status: string) => {
          if (status === "paid") {
            setStatus("Payment complete! ✓");
            onSuccess?.("stars");
          } else if (status === "cancelled") {
            setError("Payment cancelled");
            setStatus(null);
          } else if (status === "failed") {
            setError("Payment failed - please try again");
            setStatus(null);
          } else if (status === "pending") {
            setStatus("Payment pending...");
          }
          setLoading(false);
          setLoadingMethod(null);
        });
      } else {
        // Fallback for non-Telegram browsers
        window.open(data.invoiceUrl, "_blank");
        setStatus("Complete payment in new window");
        // Can't verify - user needs to manually confirm
        setTimeout(() => {
          setLoading(false);
          setLoadingMethod(null);
          setStatus(null);
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStatus(null);
      setLoading(false);
      setLoadingMethod(null);
    }
  }, [productId, userId, onSuccess]);

  // ============================================
  // TON - Secondary Payment Method
  // ============================================
  const handleTonPayment = useCallback(async () => {
    setLoading(true);
    setLoadingMethod("ton");
    setError(null);

    try {
      // Connect wallet if not connected
      if (!tonConnectUI.connected) {
        setStatus("Connect your wallet...");
        await tonConnectUI.openModal();
        setLoading(false);
        setLoadingMethod(null);
        setStatus(null);
        return;
      }

      setStatus("Sending transaction...");
      const paymentTimestamp = Date.now();
      const payment = createTonPayment(productId as TonPlanId, userId || "anonymous");
      const result = await tonConnectUI.sendTransaction(payment);

      if (!result) {
        throw new Error("Transaction cancelled");
      }

      // Transaction sent - verify on chain
      // Extended polling: 20 attempts x 5s = 100 seconds max
      setStatus("Confirming on blockchain...");

      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        setStatus(`Confirming... (${attempt + 1}/20)`);

        try {
          const verifyResponse = await fetch("/api/payments/verify-ton", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              telegramId: userId ? parseInt(userId) : 0,
              planId: productId,
              timestamp: paymentTimestamp,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            setStatus("Payment confirmed! ✓");
            onSuccess?.("ton", verifyData.txHash);
            setLoading(false);
            setLoadingMethod(null);
            return;
          }
        } catch (e) {
          console.error("Verification attempt failed:", e);
        }
      }

      // After 100s, show pending message but don't fail
      setStatus("Transaction sent! Credits will be added once confirmed.");
      setError(null);

      // Still call success with the boc - credits will be added by webhook
      onSuccess?.("ton", result.boc);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStatus(null);
    } finally {
      setLoading(false);
      setLoadingMethod(null);
    }
  }, [tonConnectUI, productId, userId, onSuccess]);

  // ============================================
  // UI
  // ============================================
  const inTelegram = isTelegram();

  return (
    <div className="glass p-6 rounded-xl max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1">{productName}</h2>
        <p className="text-2xl font-bold text-tiger-400">${priceUsd.toFixed(2)}</p>
      </div>

      {/* Status message */}
      {status && (
        <div className="mb-4 p-3 bg-tiger-500/20 border border-tiger-500 rounded-lg text-tiger-300 text-sm text-center">
          {status}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Payment buttons - Stars primary, TON secondary */}
      <div className="space-y-3 mb-6">

        {/* TELEGRAM STARS - Primary */}
        <button
          onClick={handleStarsPayment}
          disabled={loading}
          className={`w-full p-4 rounded-xl transition-all ${
            loading && loadingMethod === "stars"
              ? "bg-tiger-600 cursor-wait"
              : "bg-gradient-to-r from-tiger-500 to-tiger-600 hover:from-tiger-400 hover:to-tiger-500 active:scale-[0.98]"
          } text-white font-semibold shadow-lg shadow-tiger-500/25`}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-lg">Pay with Stars</div>
              <div className="text-sm opacity-80">{priceStars} Stars</div>
            </div>
          </div>
          {!inTelegram && (
            <div className="text-xs mt-2 opacity-70">
              Best in Telegram app
            </div>
          )}
        </button>

        {/* TON - Secondary */}
        <button
          onClick={handleTonPayment}
          disabled={loading}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            loading && loadingMethod === "ton"
              ? "border-blue-500 bg-blue-500/20 cursor-wait"
              : "border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 active:scale-[0.98]"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <div className="font-medium">Pay with TON</div>
              <div className="text-sm text-gray-400">{priceTon} TON</div>
            </div>
          </div>
        </button>
      </div>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        disabled={loading}
        className="w-full py-3 text-gray-400 hover:text-white transition-colors"
      >
        Cancel
      </button>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Secure payment • Instant delivery
      </div>
    </div>
  );
}

export default MultiRailCheckout;
