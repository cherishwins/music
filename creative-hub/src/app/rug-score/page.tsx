"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  Activity,
  PieChart,
  BarChart3,
} from "lucide-react";

const safetyMetrics = [
  {
    icon: Lock,
    title: "Liquidity Lock",
    description: "Check if liquidity is locked and for how long",
  },
  {
    icon: Users,
    title: "Holder Distribution",
    description: "Identify whale concentration and dump risk",
  },
  {
    icon: Eye,
    title: "Contract Scan",
    description: "Analyze for honeypots, mint functions, and backdoors",
  },
  {
    icon: Activity,
    title: "Trading Activity",
    description: "Monitor buy/sell patterns and suspicious behavior",
  },
  {
    icon: PieChart,
    title: "Tokenomics",
    description: "Verify supply, taxes, and distribution fairness",
  },
  {
    icon: BarChart3,
    title: "Social Verification",
    description: "Check socials, team info, and community activity",
  },
];

const creditTiers = [
  { score: "90-100", grade: "A+", label: "Diamond Hands Certified", color: "neon-green", desc: "Extremely safe. Strong fundamentals." },
  { score: "70-89", grade: "B", label: "Solid Project", color: "neon-cyan", desc: "Good metrics. Some minor concerns." },
  { score: "50-69", grade: "C", label: "Proceed with Caution", color: "yellow-400", desc: "Mixed signals. DYOR heavily." },
  { score: "30-49", grade: "D", label: "High Risk", color: "orange-400", desc: "Multiple red flags detected." },
  { score: "0-29", grade: "F", label: "RUG ALERT", color: "red-500", desc: "Do not ape. Likely scam." },
];

export default function RugScorePage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (!tokenAddress) return;
    setIsScanning(true);
    // Simulate scan
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/assets/brand/rug-score/hero-rug-insurance.png"
            alt="Rug Pull Insurance"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/70 to-obsidian" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20 mb-6"
          >
            <Shield className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-neon-green font-medium">100% Free • No Sign Up</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-headline mb-6"
          >
            <span className="text-white">RUG PULL</span>
            <br />
            <span className="text-neon-green">INSURANCE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-4"
          >
            Minter Credit Scoring & Whale Behavioral Analytics
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-lg text-white/40 max-w-xl mx-auto mb-8"
          >
            Know before you ape. Check any TON token&apos;s safety score in seconds.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl glass-neon">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Paste TON token address..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-neon-green/50"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning || !tokenAddress}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Check Safety
                  </>
                )}
              </button>
            </div>
            <p className="text-white/40 text-sm mt-3">
              Example: EQC...xxx (any TON jetton address)
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Check */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              What We <span className="text-neon-green">Analyze</span>
            </h2>
            <p className="text-white/60">Comprehensive safety check in seconds</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyMetrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl glass hover:glass-neon transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center mb-4">
                  <metric.icon className="w-6 h-6 text-neon-green" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{metric.title}</h3>
                <p className="text-white/60 text-sm">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Scoring Tiers */}
      <section className="py-20 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              <span className="text-neon-green">Credit</span> Scoring System
            </h2>
            <p className="text-white/60">Understand what the scores mean</p>
          </motion.div>

          <div className="space-y-4">
            {creditTiers.map((tier, index) => (
              <motion.div
                key={tier.grade}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl glass"
              >
                <div className={`w-16 h-16 rounded-xl bg-${tier.color}/20 flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-2xl font-bold text-${tier.color}`}>{tier.grade}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">{tier.label}</span>
                    <span className="text-xs text-white/40">Score: {tier.score}</span>
                  </div>
                  <p className="text-white/60 text-sm">{tier.desc}</p>
                </div>
                {tier.grade === "A+" && <CheckCircle className="w-6 h-6 text-neon-green" />}
                {tier.grade === "F" && <XCircle className="w-6 h-6 text-red-500" />}
                {tier.grade === "C" && <AlertTriangle className="w-6 h-6 text-yellow-400" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-headline mb-6">
                Why <span className="text-neon-green">Degens</span> Trust Us
              </h2>
              <ul className="space-y-4">
                {[
                  "Real-time blockchain data analysis",
                  "Whale wallet tracking and alerts",
                  "Historical minter behavior scoring",
                  "Community-driven risk reports",
                  "Integration with major TON DEXs",
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-2xl overflow-hidden"
            >
              <Image
                src="/assets/brand/banners/white-tiger-party.png"
                alt="White Tiger Studio"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl glass-neon"
          >
            <Shield className="w-16 h-16 text-neon-green mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Safety First, <span className="text-neon-green">Ape Second</span>
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Don&apos;t get rugged. Check any token before you throw your bags at it.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-obsidian text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Zap className="w-6 h-6" />
              Check a Token Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
