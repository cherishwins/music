"use client";

import { motion } from "framer-motion";
import { PricingCard } from "@/components/payments/telegram-payment";
import { useAppStore, PRICING_PLANS } from "@/lib/store";

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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-headline mb-4">
            <span className="gradient-text-cyberpunk">Simple Pricing</span> 💰
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Pay per generation. No subscriptions, no hidden fees.
            <br />
            <span className="text-tiger">Stars, TON, or USDC — your choice.</span>
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
