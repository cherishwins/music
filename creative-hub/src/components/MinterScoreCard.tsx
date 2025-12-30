"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MinterScoreData {
  score: number;
  grade: string;
  riskLevel: string;
  gradeInfo: {
    color: string;
    description: string;
  };
  components: {
    history: {
      score: number;
      details: {
        totalLaunches: number;
        survivalRate: number;
        rugRate: number;
        averageLifespan: number;
      };
    };
    safety: {
      score: number;
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
}

interface Props {
  walletAddress: string;
  tokenAddress?: string;
  compact?: boolean;
}

export function MinterScoreCard({ walletAddress, tokenAddress, compact = false }: Props) {
  const [data, setData] = useState<MinterScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScore() {
      try {
        setLoading(true);
        setError(null);

        let url = `/api/minter-score/${walletAddress}`;
        if (tokenAddress) {
          url += `?token=${tokenAddress}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch score");
        }

        const result = await res.json();
        setData(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (walletAddress) {
      fetchScore();
    }
  }, [walletAddress, tokenAddress]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorCard error={error} />;
  if (!data) return null;

  if (compact) {
    return <CompactCard data={data} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-900/50 via-crucible to-black rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm"
    >
      {/* Header with Score Circle and Grade */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="10"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke={getScoreColor(data.score)}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 302" }}
              animate={{
                strokeDasharray: `${(data.score / 1000) * 302} 302`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {data.score}
            </motion.span>
            <span className="text-xs text-gray-400">/ 1000</span>
          </div>
        </div>

        <div className="text-right">
          <motion.div
            className={`text-5xl font-bold ${getGradeColor(data.grade)}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {data.grade}
          </motion.div>
          <div
            className={`text-sm font-medium px-3 py-1 rounded-full inline-block mt-2 ${getRiskBadgeStyles(
              data.riskLevel
            )}`}
          >
            {data.riskLevel} RISK
          </div>
        </div>
      </div>

      {/* Component Score Bars */}
      <div className="space-y-4 mb-6">
        <ComponentBar
          label="History"
          value={data.components.history.score}
          weight="35%"
          icon="📜"
        />
        <ComponentBar
          label="Safety"
          value={data.components.safety.score}
          weight="40%"
          icon="🛡️"
        />
        <ComponentBar
          label="Behavior"
          value={data.components.behavior.score}
          weight="25%"
          icon="🎯"
        />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox
          value={data.components.history.details.totalLaunches.toString()}
          label="Launches"
          color="cyan"
        />
        <StatBox
          value={`${data.components.history.details.rugRate.toFixed(0)}%`}
          label="Rug Rate"
          color={data.components.history.details.rugRate > 30 ? "red" : "green"}
        />
        <StatBox
          value={`${data.components.history.details.survivalRate.toFixed(0)}%`}
          label="Survival"
          color={data.components.history.details.survivalRate > 70 ? "green" : "yellow"}
        />
      </div>

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {data.warnings.slice(0, 3).map((warning, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className={`text-sm p-2 rounded-lg ${
                warning.startsWith("CRITICAL")
                  ? "bg-red-900/30 text-red-400 border border-red-500/30"
                  : warning.startsWith("WARNING")
                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30"
                  : "bg-gray-800/50 text-gray-300 border border-gray-600/30"
              }`}
            >
              {warning}
            </motion.div>
          ))}
        </div>
      )}

      {/* Safety Details */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <SafetyIndicator
          label="Mint Authority"
          safe={!data.components.safety.details.mintAuthority}
        />
        <SafetyIndicator
          label="Freeze Authority"
          safe={!data.components.safety.details.freezeAuthority}
        />
        <SafetyIndicator
          label="Liquidity Locked"
          safe={data.components.safety.details.liquidityLocked}
        />
        <SafetyIndicator
          label="Contract Verified"
          safe={data.components.safety.details.contractVerified}
        />
      </div>

      {/* Recommendation */}
      <div className="text-sm text-gray-300 bg-black/40 rounded-xl p-4 border border-gray-700/50">
        <div className="font-semibold text-white mb-1">Recommendation</div>
        {data.recommendation}
      </div>
    </motion.div>
  );
}

function CompactCard({ data }: { data: MinterScoreData }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-purple-900/30 to-crucible rounded-xl p-4 border border-purple-500/20 flex items-center gap-4"
    >
      {/* Score Circle */}
      <div className="relative flex-shrink-0">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={getScoreColor(data.score)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(data.score / 1000) * 176} 176`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{data.score}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getGradeColor(data.grade)}`}>
            {data.grade}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeStyles(
              data.riskLevel
            )}`}
          >
            {data.riskLevel}
          </span>
        </div>
        <div className="text-xs text-gray-400 truncate">
          {data.components.history.details.totalLaunches} launches •{" "}
          {data.components.history.details.survivalRate.toFixed(0)}% survival
        </div>
      </div>

      {/* Quick Indicators */}
      <div className="flex gap-1">
        {data.components.safety.details.honeypotRisk && (
          <span title="Honeypot Risk" className="text-red-500">
            🍯
          </span>
        )}
        {data.components.safety.details.mintAuthority && (
          <span title="Mint Authority" className="text-yellow-500">
            ⚠️
          </span>
        )}
        {!data.components.safety.details.liquidityLocked && (
          <span title="Liquidity Not Locked" className="text-orange-500">
            🔓
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ComponentBar({
  label,
  value,
  weight,
  icon,
}: {
  label: string;
  value: number;
  weight: string;
  icon: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-400 flex items-center gap-1.5">
          <span>{icon}</span>
          <span>{label}</span>
          <span className="text-xs text-gray-600">({weight})</span>
        </span>
        <span className="text-white font-medium">{Math.round(value)}/100</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${getBarGradient(value)})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: "cyan" | "red" | "green" | "yellow";
}) {
  const colorClasses = {
    cyan: "text-cyan-400",
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
  };

  return (
    <div className="bg-black/30 rounded-lg p-3 text-center">
      <div className={`text-xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function SafetyIndicator({ label, safe }: { label: string; safe: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
        safe
          ? "bg-green-900/20 text-green-400"
          : "bg-red-900/20 text-red-400"
      }`}
    >
      <span>{safe ? "✓" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-purple-500/20" />
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
      <div className="text-red-400 text-2xl mb-2">⚠️</div>
      <div className="text-red-400 font-medium mb-1">Analysis Failed</div>
      <div className="text-gray-400 text-sm">{error}</div>
    </div>
  );
}

// Helper functions
function getScoreColor(score: number): string {
  if (score >= 700) return "#10b981"; // green
  if (score >= 500) return "#f59e0b"; // amber
  if (score >= 300) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-green-400";
  if (grade.startsWith("B")) return "text-lime-400";
  if (grade.startsWith("C")) return "text-yellow-400";
  if (grade.startsWith("D")) return "text-orange-400";
  return "text-red-500";
}

function getRiskBadgeStyles(level: string): string {
  switch (level) {
    case "LOW":
      return "bg-green-900/40 text-green-400 border border-green-500/30";
    case "MEDIUM":
      return "bg-yellow-900/40 text-yellow-400 border border-yellow-500/30";
    case "HIGH":
      return "bg-orange-900/40 text-orange-400 border border-orange-500/30";
    case "CRITICAL":
      return "bg-red-900/40 text-red-400 border border-red-500/30";
    default:
      return "bg-gray-800 text-gray-300";
  }
}

function getBarGradient(value: number): string {
  if (value >= 70) return "#10b981, #34d399";
  if (value >= 50) return "#f59e0b, #fbbf24";
  if (value >= 30) return "#f97316, #fb923c";
  return "#ef4444, #f87171";
}
