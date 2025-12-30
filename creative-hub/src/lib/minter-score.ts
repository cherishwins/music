/**
 * Minter Credit Score (MCS) Calculator
 * The Equifax of Memecoins - proprietary scoring algorithm
 *
 * Score Components:
 * - Minter History: 35% - Track record of previous launches
 * - Token Safety: 40% - Contract analysis, honeypot detection
 * - Behavior Signals: 25% - Trading patterns, social verification
 */

import { dyorApi, type DYORTrustScore, type DYORTokenInfo, type DYORPoolInfo } from "./dyor-api";
import { tonApi, type MinterHistory, type TonWalletInfo } from "./tonapi";

// Score thresholds and grades
const GRADES = {
  "A+": { min: 900, color: "#22C55E", description: "Exceptional - Highly Trusted" },
  A: { min: 800, color: "#4ADE80", description: "Excellent - Very Reliable" },
  B: { min: 700, color: "#84CC16", description: "Good - Generally Safe" },
  C: { min: 600, color: "#FACC15", description: "Fair - Exercise Caution" },
  D: { min: 500, color: "#F97316", description: "Poor - High Risk" },
  F: { min: 0, color: "#EF4444", description: "Fail - Extreme Risk / Likely Rug" },
} as const;

type Grade = keyof typeof GRADES;

export interface MinterCreditScore {
  score: number; // 0-1000
  grade: Grade;
  gradeInfo: (typeof GRADES)[Grade];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  components: {
    history: {
      score: number;
      weight: 0.35;
      details: {
        totalLaunches: number;
        survivalRate: number;
        rugRate: number;
        averageLifespan: number;
      };
    };
    safety: {
      score: number;
      weight: 0.4;
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
      weight: 0.25;
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

export interface TokenAnalysis {
  tokenAddress: string;
  minterAddress: string;
  tokenInfo: DYORTokenInfo | null;
  trustScore: DYORTrustScore | null;
  pools: DYORPoolInfo[];
  minterScore: MinterCreditScore;
}

/**
 * Calculate the Minter Credit Score for a wallet
 */
export async function calculateMinterScore(
  walletAddress: string,
  tokenAddress?: string
): Promise<MinterCreditScore> {
  // Fetch all required data in parallel
  const [minterHistoryRes, walletInfoRes, trustScoreRes] = await Promise.all([
    tonApi.getMinterHistory(walletAddress),
    tonApi.getWalletInfo(walletAddress),
    tokenAddress
      ? dyorApi.getTrustScore(tokenAddress)
      : Promise.resolve({ success: false, data: undefined }),
  ]);

  const minterHistory = minterHistoryRes.data;
  const walletInfo = walletInfoRes.data;
  const trustScore = trustScoreRes.success ? trustScoreRes.data : undefined;

  // Calculate component scores
  const historyScore = calculateHistoryScore(minterHistory);
  const safetyScore = calculateSafetyScore(trustScore);
  const behaviorScore = calculateBehaviorScore(walletInfo, minterHistory);

  // Weighted combination (scale to 0-1000)
  const rawScore =
    historyScore.score * 0.35 + safetyScore.score * 0.4 + behaviorScore.score * 0.25;
  const finalScore = Math.round(rawScore * 10);

  // Determine grade
  const grade = getGrade(finalScore);
  const riskLevel = getRiskLevel(finalScore);
  const warnings = generateWarnings(historyScore, safetyScore, behaviorScore);
  const recommendation = generateRecommendation(finalScore, warnings);

  return {
    score: finalScore,
    grade,
    gradeInfo: GRADES[grade],
    riskLevel,
    components: {
      history: {
        score: historyScore.score,
        weight: 0.35,
        details: historyScore.details,
      },
      safety: {
        score: safetyScore.score,
        weight: 0.4,
        details: safetyScore.details,
      },
      behavior: {
        score: behaviorScore.score,
        weight: 0.25,
        details: behaviorScore.details,
      },
    },
    recommendation,
    warnings,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Full token analysis including minter score
 */
export async function analyzeToken(tokenAddress: string): Promise<TokenAnalysis> {
  // Get token info first to find the deployer
  const tokenInfoRes = await dyorApi.getTokenInfo(tokenAddress);
  const tokenInfo = tokenInfoRes.data || null;

  // Use deployer address or fall back to a placeholder
  const minterAddress = tokenInfo?.deployer || "unknown";

  // Fetch remaining data
  const [trustScoreRes, poolsRes, minterScore] = await Promise.all([
    dyorApi.getTrustScore(tokenAddress),
    dyorApi.getPoolInfo(tokenAddress),
    calculateMinterScore(minterAddress, tokenAddress),
  ]);

  return {
    tokenAddress,
    minterAddress,
    tokenInfo,
    trustScore: trustScoreRes.data || null,
    pools: poolsRes.data || [],
    minterScore,
  };
}

// === Component Score Calculators ===

function calculateHistoryScore(history?: MinterHistory): {
  score: number;
  details: MinterCreditScore["components"]["history"]["details"];
} {
  if (!history) {
    // New minter - neutral score
    return {
      score: 50,
      details: {
        totalLaunches: 0,
        survivalRate: 100,
        rugRate: 0,
        averageLifespan: 0,
      },
    };
  }

  let score = 50; // Base score

  // Survival rate (0-30 points)
  score += (history.survivalRate / 100) * 30;

  // Rug rate penalty (-50 to 0 points)
  score -= (history.rugRate / 100) * 50;

  // Experience bonus (0-10 points, diminishing returns)
  const experienceBonus = Math.min(10, Math.log10(history.totalTokensLaunched + 1) * 5);
  score += experienceBonus;

  // Longevity bonus (0-10 points)
  if (history.averageLifespan > 90) score += 10;
  else if (history.averageLifespan > 30) score += 5;
  else if (history.averageLifespan > 7) score += 2;

  return {
    score: Math.max(0, Math.min(100, score)),
    details: {
      totalLaunches: history.totalTokensLaunched,
      survivalRate: Math.round(history.survivalRate),
      rugRate: Math.round(history.rugRate),
      averageLifespan: history.averageLifespan,
    },
  };
}

function calculateSafetyScore(trustScore?: DYORTrustScore): {
  score: number;
  details: MinterCreditScore["components"]["safety"]["details"];
} {
  if (!trustScore) {
    // No token to analyze - return neutral
    return {
      score: 50,
      details: {
        mintAuthority: false,
        freezeAuthority: false,
        liquidityLocked: false,
        topHolderConcentration: 0,
        honeypotRisk: false,
        contractVerified: false,
      },
    };
  }

  let score = trustScore.score; // Start with DYOR's score as base

  // Apply our own adjustments
  const factors = trustScore.factors;

  // Critical penalties
  if (factors.mintAuthority) score -= 20;
  if (factors.freezeAuthority) score -= 15;
  if (factors.honeypotRisk) score -= 30;
  if (!factors.liquidityLocked) score -= 15;

  // Concentration penalty (if >50% held by top 10)
  if (factors.topHolderConcentration > 50) {
    score -= Math.min(20, (factors.topHolderConcentration - 50) * 0.5);
  }

  // Verification bonus
  if (factors.contractVerified) score += 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    details: {
      mintAuthority: factors.mintAuthority,
      freezeAuthority: factors.freezeAuthority,
      liquidityLocked: factors.liquidityLocked,
      topHolderConcentration: Math.round(factors.topHolderConcentration),
      honeypotRisk: factors.honeypotRisk,
      contractVerified: factors.contractVerified,
    },
  };
}

function calculateBehaviorScore(
  walletInfo?: TonWalletInfo,
  minterHistory?: MinterHistory
): {
  score: number;
  details: MinterCreditScore["components"]["behavior"]["details"];
} {
  let score = 50; // Base score

  // Wallet age bonus (check last activity)
  let walletAge = 0;
  if (walletInfo?.lastActivity) {
    const lastActive = new Date(walletInfo.lastActivity);
    walletAge = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    // Older wallets get bonus (max 20 points for 365+ days)
    score += Math.min(20, walletAge / 18);
  }

  // Transaction diversity (based on minter history variety)
  let diversification = 0;
  if (minterHistory && minterHistory.totalTokensLaunched > 0) {
    diversification = Math.min(100, minterHistory.totalTokensLaunched * 10);
    score += diversification * 0.15;
  }

  // Activity level (placeholder for transaction count analysis)
  const transactionCount = minterHistory?.launches?.length || 0;
  score += Math.min(15, transactionCount * 2);

  return {
    score: Math.max(0, Math.min(100, score)),
    details: {
      walletAge,
      transactionCount,
      diversification: Math.round(diversification),
      socialVerified: false, // Future: Telegram/social verification
    },
  };
}

// === Helper Functions ===

function getGrade(score: number): Grade {
  if (score >= 900) return "A+";
  if (score >= 800) return "A";
  if (score >= 700) return "B";
  if (score >= 600) return "C";
  if (score >= 500) return "D";
  return "F";
}

function getRiskLevel(score: number): MinterCreditScore["riskLevel"] {
  if (score >= 700) return "LOW";
  if (score >= 500) return "MEDIUM";
  if (score >= 300) return "HIGH";
  return "CRITICAL";
}

function generateWarnings(
  history: ReturnType<typeof calculateHistoryScore>,
  safety: ReturnType<typeof calculateSafetyScore>,
  behavior: ReturnType<typeof calculateBehaviorScore>
): string[] {
  const warnings: string[] = [];

  // History warnings
  if (history.details.rugRate > 20) {
    warnings.push(`High rug rate: ${history.details.rugRate}% of previous launches failed`);
  }
  if (history.details.totalLaunches === 0) {
    warnings.push("New minter: No track record available");
  }
  if (history.details.averageLifespan < 7 && history.details.totalLaunches > 0) {
    warnings.push("Short-lived tokens: Average lifespan under 7 days");
  }

  // Safety warnings
  if (safety.details.mintAuthority) {
    warnings.push("CRITICAL: Mint authority enabled - can create unlimited tokens");
  }
  if (safety.details.freezeAuthority) {
    warnings.push("WARNING: Freeze authority enabled - can freeze your wallet");
  }
  if (safety.details.honeypotRisk) {
    warnings.push("CRITICAL: Honeypot detected - you may not be able to sell");
  }
  if (!safety.details.liquidityLocked) {
    warnings.push("WARNING: Liquidity not locked - rug pull risk");
  }
  if (safety.details.topHolderConcentration > 50) {
    warnings.push(
      `High concentration: Top holders control ${safety.details.topHolderConcentration}%`
    );
  }

  // Behavior warnings
  if (behavior.details.walletAge < 7) {
    warnings.push("New wallet: Less than 7 days old");
  }

  return warnings;
}

function generateRecommendation(score: number, warnings: string[]): string {
  const criticalWarnings = warnings.filter((w) => w.startsWith("CRITICAL")).length;

  if (criticalWarnings > 0) {
    return "DO NOT INVEST - Critical security issues detected. High probability of rug pull.";
  }

  if (score >= 800) {
    return "Generally safe to invest. This minter has a strong track record and the token passes security checks.";
  }

  if (score >= 600) {
    return "Proceed with caution. Some risk factors present. Only invest what you can afford to lose.";
  }

  if (score >= 400) {
    return "High risk investment. Multiple warning signs detected. Consider this a gamble, not an investment.";
  }

  return "Extreme risk. This has all the hallmarks of a rug pull. Avoid unless you're okay losing 100%.";
}

// Export types
export type { Grade };
