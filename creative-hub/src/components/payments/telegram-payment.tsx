"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Gem, Check, Zap } from "lucide-react";
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useAppStore, PRICING_PLANS } from "@/lib/store";

// Telegram Stars payment handler
async function createStarsInvoice(
  planId: string,
  amount: number
): Promise<string> {
  // In production, this would call your backend API which uses the Bot API
  // to create an invoice link
  const response = await fetch("/api/payments/create-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId, amount, currency: "XTR" }),
  });

  if (!response.ok) {
    throw new Error("Failed to create invoice");
  }

  const { invoiceUrl } = await response.json();
  return invoiceUrl;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { selectedPlan, setSelectedPlan, addCredits, user } = useAppStore();
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const selectedPlanData = PRICING_PLANS.find((p) => p.id === selectedPlan);

  // Handle Telegram Stars payment
  const handleStarsPayment = useCallback(async () => {
    if (!selectedPlanData) return;

    try {
      // Check if we're in Telegram WebApp
      if (window.Telegram?.WebApp) {
        const invoiceUrl = await createStarsInvoice(
          selectedPlanData.id,
          selectedPlanData.priceStars
        );

        window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
          if (status === "paid") {
            addCredits(selectedPlanData.credits);
            onClose();
          }
        });
      } else {
        // Fallback for non-Telegram browsers (redirect to bot)
        window.open(
          `https://t.me/YourCreativeHubBot?start=buy_${selectedPlanData.id}`,
          "_blank"
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  }, [selectedPlanData, addCredits, onClose]);

  // Handle TON payment
  const handleTonPayment = useCallback(async () => {
    if (!selectedPlanData || !tonAddress) return;

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: process.env.NEXT_PUBLIC_TON_WALLET_ADDRESS || "",
            amount: (selectedPlanData.priceTon * 1e9).toString(), // Convert to nanoTON
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      addCredits(selectedPlanData.credits);
      onClose();
    } catch (error) {
      console.error("TON payment error:", error);
    }
  }, [selectedPlanData, tonAddress, tonConnectUI, addCredits, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg glass rounded-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-display gradient-text">
                Choose Payment Method
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Summary */}
            {selectedPlanData && (
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedPlanData.name} Plan
                    </h3>
                    <p className="text-white/60 text-sm">
                      {selectedPlanData.credits} credits
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-gold-400">
                      <Star className="w-4 h-4" />
                      <span className="font-bold">
                        {selectedPlanData.priceStars}
                      </span>
                    </div>
                    <div className="text-white/40 text-sm">
                      ~{selectedPlanData.priceTon} TON
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Options */}
            <div className="p-6 space-y-4">
              {/* Telegram Stars */}
              <button
                onClick={handleStarsPayment}
                className="w-full p-4 glass-gold rounded-xl flex items-center gap-4 hover:bg-gold-500/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold group-hover:text-gold-400 transition-colors">
                    Pay with Telegram Stars
                  </div>
                  <div className="text-white/60 text-sm">
                    Instant, no KYC required
                  </div>
                </div>
                <Zap className="w-5 h-5 text-gold-400" />
              </button>

              {/* TON Payment */}
              <div className="space-y-3">
                <button
                  onClick={handleTonPayment}
                  disabled={!tonAddress}
                  className="w-full p-4 glass rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-400 to-cosmic-600 flex items-center justify-center">
                    <Gem className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold group-hover:text-cosmic-400 transition-colors">
                      Pay with TON
                    </div>
                    <div className="text-white/60 text-sm">
                      {tonAddress
                        ? `Connected: ${tonAddress.slice(0, 6)}...${tonAddress.slice(-4)}`
                        : "Connect wallet first"}
                    </div>
                  </div>
                </button>

                {!tonAddress && (
                  <div className="flex justify-center">
                    <TonConnectButton />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-white/40 text-xs">
                Secure payments powered by Telegram & TON blockchain
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pricing card component
interface PricingCardProps {
  plan: (typeof PRICING_PLANS)[0];
  onSelect: (planId: string) => void;
}

export function PricingCard({ plan, onSelect }: PricingCardProps) {
  return (
    <motion.div
      className={`relative p-6 rounded-2xl ${
        plan.popular ? "glass-gold" : "glass"
      } card-hover`}
      whileHover={{ y: -8 }}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full text-black text-xs font-bold">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-display mb-1">{plan.name}</h3>
        <p className="text-white/60 text-sm">{plan.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-gold-400" />
          <span className="text-4xl font-bold gradient-text">
            {plan.priceStars}
          </span>
        </div>
        <div className="text-white/40 text-sm">~{plan.priceTon} TON</div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <Check className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <span className="text-white/80">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          plan.popular
            ? "bg-gradient-to-r from-gold-400 to-gold-600 text-black hover:from-gold-300 hover:to-gold-500"
            : "glass border border-white/20 hover:bg-white/10"
        }`}
      >
        Get Started
      </button>
    </motion.div>
  );
}
