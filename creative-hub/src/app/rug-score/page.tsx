"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  Activity,
  PieChart,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  AlertOctagon,
  Loader2,
} from "lucide-react";

// Types matching our API response
interface MinterCreditScore {
  score: number;
  grade: string;
  gradeInfo: {
    min: number;
    color: string;
    description: string;
  };
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  components: {
    history: {
      score: number;
      weight: number;
      details: {
        totalLaunches: number;
        survivalRate: number;
        rugRate: number;
        averageLifespan: number;
      };
    };
    safety: {
      score: number;
      weight: number;
      details: {
        mintAuthority: boolean;
        freezeAuthority: boolean;
        liquidityLocked: boolean;
        topHolderConcentration: number;
        honeypotRisk: boolean;
        contractVerified: boolean;
      };
    };
    behavior: {
      score: number;
      weight: number;
      details: {
        walletAge: number;
        transactionCount: number;
        diversification: number;
        socialVerified: boolean;
      };
    };
  };
  recommendation: string;
  warnings: string[];
  analyzedAt: string;
}

interface ScanResult {
  success: boolean;
  type: string;
  address: string;
  data: MinterCreditScore;
  error?: string;
}

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
    title: "Minter History",
    description: "Track record of previous token launches",
  },
];

const creditTiers = [
  { score: "900-1000", grade: "A+", label: "Diamond Hands Certified", color: "neon-green", desc: "Extremely safe. Strong fundamentals." },
  { score: "700-899", grade: "B", label: "Solid Project", color: "neon-cyan", desc: "Good metrics. Some minor concerns." },
  { score: "500-699", grade: "C", label: "Proceed with Caution", color: "yellow-400", desc: "Mixed signals. DYOR heavily." },
  { score: "300-499", grade: "D", label: "High Risk", color: "orange-400", desc: "Multiple red flags detected." },
  { score: "0-299", grade: "F", label: "RUG ALERT", color: "red-500", desc: "Do not ape. Likely scam." },
];

// Example tokens for quick analysis
const exampleTokens = [
  { address: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA", name: "STON.fi", verified: true },
  { address: "EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE", name: "SCALE", verified: true },
  { address: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT", name: "NOT", verified: true },
];

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+": return "text-green-400";
    case "A": return "text-green-500";
    case "B": return "text-cyan-400";
    case "C": return "text-yellow-400";
    case "D": return "text-orange-400";
    case "F": return "text-red-500";
    default: return "text-white";
  }
}

function getRiskBg(risk: string): string {
  switch (risk) {
    case "LOW": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "HIGH": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "CRITICAL": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-white/10 text-white border-white/20";
  }
}

export default function RugScorePage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!tokenAddress.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch(`/api/minter-score/${encodeURIComponent(tokenAddress.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Scan failed");
      }

      setScanResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan token");
    } finally {
      setIsScanning(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(tokenAddress);
  };

  const quickCheck = async (address: string) => {
    setTokenAddress(address);
    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch(`/api/minter-score/${encodeURIComponent(address)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Scan failed");
      }

      setScanResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan token");
    } finally {
      setIsScanning(false);
    }
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
            <span className="text-white">MINTER</span>
            <br />
            <span className="text-neon-green">CREDIT SCORE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-4"
          >
            The Equifax of Memecoins
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-lg text-white/40 max-w-xl mx-auto mb-8"
          >
            Know before you ape. Check any TON wallet or token&apos;s safety score in seconds.
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
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  placeholder="Paste TON wallet or token address..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-neon-green/50 font-mono text-sm"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning || !tokenAddress.trim()}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-cyan text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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
              Example: EQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf
            </p>

            {/* Quick Check Popular Tokens */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-white/40 text-sm">Quick check:</span>
              {exampleTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => quickCheck(token.address)}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:border-neon-green/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {token.verified && <CheckCircle className="w-3 h-3 text-neon-green" />}
                  {token.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 pb-8"
          >
            <div className="max-w-2xl mx-auto">
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Scan Results */}
      <AnimatePresence>
        {scanResult && scanResult.data && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 pb-20"
          >
            <div className="max-w-4xl mx-auto">
              {/* Main Score Card */}
              <div className="p-8 rounded-3xl glass-neon mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border-4 border-white/10">
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${getGradeColor(scanResult.data.grade)}`}>
                          {scanResult.data.grade}
                        </div>
                        <div className="text-3xl font-semibold text-white/80">{scanResult.data.score}</div>
                        <div className="text-xs text-white/40">/ 1000</div>
                      </div>
                    </div>
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBg(scanResult.data.riskLevel)}`}>
                      {scanResult.data.riskLevel} RISK
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-headline text-white mb-2">
                      {scanResult.data.gradeInfo.description}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <code className="text-sm text-white/60 font-mono truncate max-w-[200px]">
                        {scanResult.address}
                      </code>
                      <button onClick={copyAddress} className="text-white/40 hover:text-white">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://tonviewer.com/${scanResult.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:text-neon-cyan/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-white/60">{scanResult.data.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {scanResult.data.warnings.length > 0 && (
                <div className="mb-8 space-y-2">
                  {scanResult.data.warnings.map((warning, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl flex items-start gap-3 ${
                        warning.startsWith("CRITICAL")
                          ? "bg-red-500/20 border border-red-500/30"
                          : warning.startsWith("WARNING")
                          ? "bg-orange-500/20 border border-orange-500/30"
                          : "bg-yellow-500/20 border border-yellow-500/30"
                      }`}
                    >
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                        warning.startsWith("CRITICAL") ? "text-red-400" :
                        warning.startsWith("WARNING") ? "text-orange-400" : "text-yellow-400"
                      }`} />
                      <span className="text-white/80 text-sm">{warning}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Component Scores */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl glass"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Minter History</h3>
                      <p className="text-xs text-white/40">35% weight</p>
                    </div>
                    <div className="ml-auto text-2xl font-bold text-purple-400">
                      {Math.round(scanResult.data.components.history.score)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Tokens Launched</span>
                      <span className="text-white">{scanResult.data.components.history.details.totalLaunches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Survival Rate</span>
                      <span className={scanResult.data.components.history.details.survivalRate > 50 ? "text-green-400" : "text-red-400"}>
                        {scanResult.data.components.history.details.survivalRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Rug Rate</span>
                      <span className={scanResult.data.components.history.details.rugRate < 20 ? "text-green-400" : "text-red-400"}>
                        {scanResult.data.components.history.details.rugRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Avg Lifespan</span>
                      <span className="text-white">{scanResult.data.components.history.details.averageLifespan} days</span>
                    </div>
                  </div>
                </motion.div>

                {/* Safety */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl glass"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Token Safety</h3>
                      <p className="text-xs text-white/40">40% weight</p>
                    </div>
                    <div className="ml-auto text-2xl font-bold text-neon-green">
                      {Math.round(scanResult.data.components.safety.score)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Mint Authority</span>
                      {scanResult.data.components.safety.details.mintAuthority ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Freeze Authority</span>
                      {scanResult.data.components.safety.details.freezeAuthority ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Liquidity Locked</span>
                      {scanResult.data.components.safety.details.liquidityLocked ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Honeypot Risk</span>
                      {scanResult.data.components.safety.details.honeypotRisk ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Top Holder %</span>
                      <span className={scanResult.data.components.safety.details.topHolderConcentration < 50 ? "text-green-400" : "text-orange-400"}>
                        {scanResult.data.components.safety.details.topHolderConcentration}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Behavior */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-2xl glass"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Behavior</h3>
                      <p className="text-xs text-white/40">25% weight</p>
                    </div>
                    <div className="ml-auto text-2xl font-bold text-neon-cyan">
                      {Math.round(scanResult.data.components.behavior.score)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Wallet Age</span>
                      <span className="text-white">{scanResult.data.components.behavior.details.walletAge} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Transactions</span>
                      <span className="text-white">{scanResult.data.components.behavior.details.transactionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Diversification</span>
                      <span className="text-white">{scanResult.data.components.behavior.details.diversification}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Social Verified</span>
                      {scanResult.data.components.behavior.details.socialVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-white/40 text-xs">Coming Soon</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Timestamp */}
              <div className="mt-6 text-center text-white/40 text-xs">
                Analyzed at {new Date(scanResult.data.analyzedAt).toLocaleString()}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* What We Check - Only show if no results */}
      {!scanResult && (
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
      )}

      {/* Credit Scoring Tiers - Only show if no results */}
      {!scanResult && (
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
      )}

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
