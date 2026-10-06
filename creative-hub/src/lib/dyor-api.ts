/**
 * DYOR.io API Integration for TON Token Analysis
 * Provides trust scores, token info, and risk assessment
 *
 * Without DYOR_API_KEY every call fails with success: false. These are
 * statements about real tokens, so nothing here is ever made up.
 */

export interface DYORTrustScore {
  score: number; // 0-100
  grade: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: {
    mintAuthority: boolean;
    freezeAuthority: boolean;
    liquidityLocked: boolean;
    topHolderConcentration: number;
    contractVerified: boolean;
    honeypotRisk: boolean;
  };
}

export interface DYORTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  createdAt: string;
  deployer: string;
}

export interface DYORPoolInfo {
  address: string;
  dex: string;
  token0: string;
  token1: string;
  liquidity: number;
  volume24h: number;
  locked: boolean;
  lockDuration?: number;
  lockExpiry?: string;
}

interface DYORAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class DYORApiClient {
  private baseUrl = "https://api.dyor.io/v1";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DYOR_API_KEY || "";
  }

  private async fetch<T>(endpoint: string): Promise<DYORAPIResponse<T>> {
    if (!this.apiKey) {
      return { success: false, error: "DYOR_API_KEY not configured" };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`DYOR API error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("[DYOR] API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get trust score for a jetton (token)
   */
  async getTrustScore(tokenAddress: string): Promise<DYORAPIResponse<DYORTrustScore>> {
    return this.fetch<DYORTrustScore>(`/jettons/${tokenAddress}/trust-score`);
  }

  /**
   * Get token info including price, supply, holders
   */
  async getTokenInfo(tokenAddress: string): Promise<DYORAPIResponse<DYORTokenInfo>> {
    return this.fetch<DYORTokenInfo>(`/jettons/${tokenAddress}`);
  }

  /**
   * Get liquidity pool info
   */
  async getPoolInfo(tokenAddress: string): Promise<DYORAPIResponse<DYORPoolInfo[]>> {
    return this.fetch<DYORPoolInfo[]>(`/jettons/${tokenAddress}/pools`);
  }

  /**
   * Get historical price data
   */
  async getPriceHistory(
    tokenAddress: string,
    interval: "1h" | "24h" | "7d" | "30d" = "24h"
  ): Promise<DYORAPIResponse<{ timestamp: number; price: number }[]>> {
    return this.fetch(`/jettons/${tokenAddress}/price-history?interval=${interval}`);
  }
}

// Singleton export
export const dyorApi = new DYORApiClient();

// Factory for custom instances
export function createDYORClient(apiKey: string): DYORApiClient {
  return new DYORApiClient(apiKey);
}
