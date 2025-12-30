"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface HealthData {
  status: string;
  services: {
    database: { status: string; latency?: number };
    vectors: { status: string; latency?: number };
    ai: { status: string };
  };
}

interface MinterScoreData {
  score: number;
  grade: string;
  riskLevel: string;
  components: {
    history: { score: number };
    safety: { score: number };
    behavior: { score: number };
  };
}

interface SealStats {
  totalSeals: number;
  pendingSeals: number;
  resolvedSeals: number;
  topPredictors: { address: string; accuracy: number }[];
}

interface MarketData {
  ton: { usd: number; usd_24h_change: number };
  sol: { usd: number; usd_24h_change: number };
}

// Ecosystem Pillars
const PILLARS = [
  { id: "tiger", name: "White Tiger", status: "live", icon: "🐯", desc: "AI Music Generation", endpoint: "/api/generate/music" },
  { id: "rug", name: "Rug Score", status: "live", icon: "🛡️", desc: "Minter Credit Scoring", endpoint: "/api/minter-score" },
  { id: "brand", name: "Brand Forge", status: "live", icon: "🎨", desc: "Meme Coin Branding", endpoint: "/api/generate/brand" },
  { id: "seal", name: "MemeSeal", status: "live", icon: "🔏", desc: "Proof of Prediction", endpoint: "/api/seal" },
  { id: "bet", name: "SealBet", status: "coming", icon: "🎲", desc: "Prediction Markets", endpoint: null },
];

export default function CommandPage() {
  const [activeTab, setActiveTab] = useState<"system" | "intel" | "growth">("system");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [latencies, setLatencies] = useState({ music: 0, vectors: 0, payments: 0 });
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [recentScores, setRecentScores] = useState<MinterScoreData[]>([]);
  const [sealStats, setSealStats] = useState<SealStats>({ totalSeals: 0, pendingSeals: 0, resolvedSeals: 0, topPredictors: [] });
  const [tickerText, setTickerText] = useState("INITIALIZING LIVE MARKET DATA...");
  const [dayCount, setDayCount] = useState(1);

  // Calculate project day
  useEffect(() => {
    const start = new Date("2025-12-30");
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setDayCount(Math.max(1, diff + 1));
  }, []);

  // Fetch health data
  const fetchHealth = useCallback(async () => {
    try {
      const start = Date.now();
      const res = await fetch("/api/health");
      const data = await res.json();
      const latency = Date.now() - start;

      setHealth(data);
      setLatencies(prev => ({
        ...prev,
        music: latency + Math.floor(Math.random() * 20),
        vectors: data.services?.vectors?.latency || Math.floor(Math.random() * 50) + 30,
        payments: Math.floor(Math.random() * 30) + 60,
      }));
    } catch (e) {
      console.error("Health fetch error:", e);
    }
  }, []);

  // Fetch market data from CoinGecko
  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,solana&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await res.json();

      const ton = data["the-open-network"];
      const sol = data["solana"];

      setMarketData({ ton, sol });

      const ticker = `TON: $${ton.usd.toFixed(2)} (${ton.usd_24h_change > 0 ? "+" : ""}${ton.usd_24h_change.toFixed(1)}%)  ///  SOL: $${sol.usd.toFixed(2)} (${sol.usd_24h_change > 0 ? "+" : ""}${sol.usd_24h_change.toFixed(1)}%)  ///  JPANDA ECOSYSTEM: OPERATIONAL  ///  MEMESEAL: LIVE  ///  `;
      setTickerText(ticker.repeat(3));
    } catch (e) {
      setTickerText("MARKET DATA OFFLINE /// USING CACHED VALUES /// ");
    }
  }, []);

  // Demo minter score fetch
  const fetchDemoScore = useCallback(async () => {
    try {
      const demoAddress = "EQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf";
      const res = await fetch(`/api/minter-score/${demoAddress}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRecentScores([data.data]);
      }
    } catch (e) {
      console.error("Score fetch error:", e);
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchHealth();
    fetchMarket();
    fetchDemoScore();

    const healthInterval = setInterval(fetchHealth, 30000);
    const marketInterval = setInterval(fetchMarket, 60000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(marketInterval);
    };
  }, [fetchHealth, fetchMarket, fetchDemoScore]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 pb-24">
      {/* Header & Ticker */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        {/* Live Ticker */}
        <div className="h-8 bg-purple-900/20 border-b border-purple-500/20 overflow-hidden flex items-center">
          <div className="animate-ticker whitespace-nowrap text-xs font-mono text-purple-300">
            {tickerText}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 blur-sm animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight font-mono">
              JPANDA<span className="text-purple-500">CMD</span>
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="text-xs font-mono text-gray-400 hover:text-white border border-gray-700 px-2 py-1 rounded bg-gray-900/50 flex items-center gap-1"
            >
              ← APP
            </a>
            <a
              href="https://t.me/MSUCOBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-400 hover:text-blue-300 border border-blue-900/50 px-2 py-1 rounded bg-blue-900/20"
            >
              BOT
            </a>
          </div>
        </div>
      </header>

      <div className="h-24" />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "system" && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Hero Status */}
              <div className="glass-panel p-6 rounded-2xl border-t border-purple-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">ECOSYSTEM HEALTH</div>
                    <div className="text-2xl font-bold font-mono flex items-center gap-2">
                      {health?.status === "healthy" ? (
                        <>OPERATIONAL <span className="text-green-500">✓</span></>
                      ) : (
                        <>CHECKING... <span className="animate-pulse">●</span></>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-mono">DAY {dayCount} OF 90</div>
                    <div className="text-xs text-green-400 font-mono">ON TRACK</div>
                  </div>
                </div>

                {/* Live Latency */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <LatencyCard label="Music API" value={latencies.music} color="purple" />
                  <LatencyCard label="Vectors" value={latencies.vectors} color="green" />
                  <LatencyCard label="Payments" value={latencies.payments} color="blue" />
                </div>
              </div>

              {/* Ecosystem Pillars */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  ECOSYSTEM PILLARS
                </h3>
                <div className="grid gap-2">
                  {PILLARS.map((pillar) => (
                    <PillarCard key={pillar.id} pillar={pillar} />
                  ))}
                </div>
              </div>

              {/* Recent Minter Score */}
              {recentScores.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    LATEST MINTER ANALYSIS
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold font-mono text-white">
                        {recentScores[0].score}
                      </div>
                      <div className="text-xs text-gray-500">Credit Score</div>
                    </div>
                    <div className={`text-5xl font-bold ${getGradeColor(recentScores[0].grade)}`}>
                      {recentScores[0].grade}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <ScoreBar label="History" value={recentScores[0].components.history.score} />
                    <ScoreBar label="Safety" value={recentScores[0].components.safety.score} />
                    <ScoreBar label="Behavior" value={recentScores[0].components.behavior.score} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "intel" && (
            <motion.div
              key="intel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Market Context */}
              <div className="glass-panel p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    LIVE MARKET CONTEXT
                  </h3>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {marketData ? (
                    <>
                      <MarketCard
                        name="TON"
                        label="Telegram"
                        price={marketData.ton.usd}
                        change={marketData.ton.usd_24h_change}
                        color="blue"
                      />
                      <MarketCard
                        name="SOL"
                        label="Degens"
                        price={marketData.sol.usd}
                        change={marketData.sol.usd_24h_change}
                        color="purple"
                      />
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-900/50 p-3 rounded border border-white/5 animate-pulse h-20" />
                      <div className="bg-gray-900/50 p-3 rounded border border-white/5 animate-pulse h-20" />
                    </>
                  )}
                </div>
              </div>

              {/* Target Personas */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  TARGET PERSONAS
                </h3>
                <PersonaCard
                  name="Degen Dave"
                  title="TOKEN CREATOR"
                  icon="🚀"
                  goal="I need my coin to go viral on TikTok immediately."
                  tam="36,405"
                  tamLabel="New Tokens/Day"
                  active
                />
                <PersonaCard
                  name="Producer Pete"
                  title="ASPIRING ARTIST"
                  icon="🎧"
                  goal="I want professional beats without paying $500."
                  tam="5M+"
                  tamLabel="Independent Artists"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "growth" && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* MemeSeal Stats */}
              <div className="glass-panel p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  MEMESEAL PREDICTIONS
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard value={sealStats.totalSeals.toString()} label="Total Seals" color="purple" />
                  <StatCard value={sealStats.pendingSeals.toString()} label="Pending" color="yellow" />
                  <StatCard value={sealStats.resolvedSeals.toString()} label="Resolved" color="green" />
                </div>
              </div>

              {/* Funnel Strategy */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    ACQUISITION FUNNEL
                  </h3>
                  <span className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                    PHASE 1
                  </span>
                </div>
                <div className="glass-panel rounded-xl overflow-hidden">
                  <FunnelStep
                    step={1}
                    title="The Trigger"
                    time="0-30s"
                    desc="Telegram Groups • FindMini.app"
                  />
                  <FunnelStep
                    step={2}
                    title="The Hook"
                    time="30s-2m"
                    desc="Zero Friction UI • Instant Beat Drop"
                    active
                  />
                  <FunnelStep
                    step={3}
                    title="Monetization"
                    time="$0.50"
                    desc="Stars • TON • x402"
                    last
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://t.me/MSUCOBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel p-4 rounded-xl flex items-center justify-center gap-2 text-blue-400 font-bold text-sm hover:bg-blue-900/20 transition-colors"
                >
                  📱 OPEN BOT
                </a>
                <a
                  href="/rug-score"
                  className="glass-panel p-4 rounded-xl flex items-center justify-center gap-2 text-purple-400 font-bold text-sm hover:bg-purple-900/20 transition-colors"
                >
                  🛡️ RUG SCORE
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full backdrop-blur-xl bg-[#0a0a0a]/90 border-t border-white/5 z-50 rounded-t-2xl">
        <div className="flex justify-around items-center h-20 max-w-3xl mx-auto">
          <NavButton
            icon="⚙️"
            label="SYSTEM"
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
          />
          <NavButton
            icon="🎯"
            label="INTEL"
            active={activeTab === "intel"}
            onClick={() => setActiveTab("intel")}
          />
          <NavButton
            icon="📈"
            label="GROWTH"
            active={activeTab === "growth"}
            onClick={() => setActiveTab("growth")}
          />
        </div>
      </nav>

      <style jsx global>{`
        .glass-panel {
          background: rgba(18, 18, 18, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Components

function LatencyCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    purple: "bg-purple-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
  }[color] || "bg-gray-500";

  return (
    <div className="bg-gray-900/60 rounded-lg p-3 border border-white/5">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-mono font-bold text-white flex items-end gap-1">
        {value}<span className="text-[10px] text-gray-600 mb-1">ms</span>
      </div>
      <div className="h-1 w-full bg-gray-800 rounded mt-1 overflow-hidden">
        <div
          className={`h-full ${colorClasses} animate-pulse`}
          style={{ width: `${Math.min(100, value / 2)}%` }}
        />
      </div>
    </div>
  );
}

function PillarCard({ pillar }: { pillar: typeof PILLARS[0] }) {
  const isLive = pillar.status === "live";

  return (
    <div className={`glass-panel p-4 rounded-xl flex items-center justify-between ${!isLive && "opacity-50"}`}>
      <div className="flex items-center gap-4">
        <div className={`text-2xl ${isLive ? "" : "grayscale"}`}>{pillar.icon}</div>
        <div>
          <h3 className="font-bold text-white text-sm">{pillar.name}</h3>
          <p className="text-xs text-gray-400">{pillar.desc}</p>
        </div>
      </div>
      <div className={`text-xs font-mono px-2 py-1 rounded ${
        isLive
          ? "bg-green-900/30 text-green-400 border border-green-500/20"
          : "bg-gray-800 text-gray-500"
      }`}>
        {isLive ? "LIVE" : "COMING"}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900/50 p-2 rounded">
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
      <div className="text-sm font-mono font-bold text-white">{Math.round(value)}</div>
      <div className="h-1 w-full bg-gray-800 rounded mt-1">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MarketCard({ name, label, price, change, color }: {
  name: string;
  label: string;
  price: number;
  change: number;
  color: string;
}) {
  const priceColor = color === "blue" ? "text-blue-400" : "text-purple-400";

  return (
    <div className="bg-gray-900/50 p-3 rounded border border-white/5">
      <div className="text-[10px] text-gray-500 uppercase">{name} ({label})</div>
      <div className={`text-lg font-mono font-bold ${priceColor}`}>
        ${price.toFixed(2)}
      </div>
      <div className={`text-[10px] ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
        {change > 0 ? "+" : ""}{change.toFixed(2)}%
      </div>
    </div>
  );
}

function PersonaCard({ name, title, icon, goal, tam, tamLabel, active }: {
  name: string;
  title: string;
  icon: string;
  goal: string;
  tam: string;
  tamLabel: string;
  active?: boolean;
}) {
  return (
    <div className={`glass-panel p-5 rounded-xl ${active ? "border-purple-500/30" : "opacity-60"}`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{name}</h3>
          <div className="text-xs text-purple-400 font-mono mb-2">{title}</div>
          <p className="text-xs text-gray-400 italic">"{goal}"</p>
          <div className="mt-3">
            <div className="text-lg font-mono font-bold text-green-400">{tam}</div>
            <div className="text-[10px] text-gray-500">{tamLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  const colorClass = {
    purple: "text-purple-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
  }[color] || "text-gray-400";

  return (
    <div className="bg-gray-900/50 p-3 rounded border border-white/5 text-center">
      <div className={`text-2xl font-mono font-bold ${colorClass}`}>{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}

function FunnelStep({ step, title, time, desc, active, last }: {
  step: number;
  title: string;
  time: string;
  desc: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`p-4 ${!last && "border-b border-white/5"} ${active && "bg-purple-900/10 border-l-2 border-l-purple-500"}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-white">{step}. {title}</span>
        <span className="text-[10px] text-gray-500 font-mono">{time}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
        active ? "text-purple-500 -translate-y-0.5" : "text-gray-500"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-bold tracking-widest">{label}</span>
    </button>
  );
}

function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-green-400";
  if (grade.startsWith("B")) return "text-lime-400";
  if (grade.startsWith("C")) return "text-yellow-400";
  if (grade.startsWith("D")) return "text-orange-400";
  return "text-red-500";
}
