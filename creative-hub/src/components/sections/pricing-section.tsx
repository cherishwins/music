"use client";

import { motion } from "framer-motion";
import { PricingCard } from "@/components/payments/telegram-payment";
import { useAppStore, PRICING_PLANS } from "@/lib/store";
import { HelpCircle, DollarSign, Star, Coins } from "lucide-react";

export function PricingSection() {
  const { setSelectedPlan, setShowPaymentModal } = useAppStore();

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-headline mb-4">
            <span className="gradient-text-cyberpunk">Simple Pricing</span> 💰
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-6">
            Pay per item. No subscriptions. No BS.
          </p>
        </motion.div>

        {/* Payment explainer - SUPER CLEAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 mb-12 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-tiger" />
            <span className="font-semibold text-white">How payment works (it&apos;s easy)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <Star className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Telegram Stars</div>
                <div className="text-white/60">1 Star ≈ $0.02 USD</div>
                <div className="text-tiger text-xs mt-1">Pay in Telegram app</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <Coins className="w-8 h-8 text-neon-cyan flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">TON Coin</div>
                <div className="text-white/60">1 TON ≈ $5 USD</div>
                <div className="text-neon-cyan text-xs mt-1">Crypto wallet</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <DollarSign className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">USDC / Card</div>
                <div className="text-white/60">1 USDC = $1 USD</div>
                <div className="text-green-400 text-xs mt-1">Stable, simple</div>
              </div>
            </div>
          </div>
          <p className="text-center text-white/40 text-xs mt-4">
            All prices shown in USD. Pick whichever payment you prefer — same result! 🎯
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingCard plan={plan} onSelect={handleSelectPlan} />
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-tiger-muted"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <span className="text-sm">Powered by TON</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-sm">Telegram Stars</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="text-sm">Instant Generation</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
