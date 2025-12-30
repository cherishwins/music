/**
 * DYOR.io API Integration for TON Token Analysis
 * Provides trust scores, token info, and risk assessment
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
      // Return mock data for development
      console.warn("[DYOR] No API key - returning mock data");
      return this.getMockData<T>(endpoint);
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

  /**
   * Mock data for development when no API key is available
   */
  private getMockData<T>(endpoint: string): DYORAPIResponse<T> {
    // Extract token address from endpoint
    const addressMatch = endpoint.match(/jettons\/([^/]+)/);
    const address = addressMatch ? addressMatch[1] : "unknown";

    if (endpoint.includes("trust-score")) {
      return {
        success: true,
        data: {
          score: Math.floor(Math.random() * 40) + 30, // 30-70 range for mock
          grade: "C",
          riskLevel: "MEDIUM",
          factors: {
            mintAuthority: Math.random() > 0.5,
            freezeAuthority: Math.random() > 0.7,
            liquidityLocked: Math.random() > 0.4,
            topHolderConcentration: Math.random() * 50 + 20,
            contractVerified: Math.random() > 0.3,
            honeypotRisk: Math.random() > 0.8,
          },
        } as unknown as T,
      };
    }

    if (endpoint.includes("pools")) {
      return {
        success: true,
        data: [
          {
            address: `pool_${address.slice(0, 8)}`,
            dex: "DeDust",
            token0: address,
            token1: "TON",
            liquidity: Math.random() * 100000,
            volume24h: Math.random() * 50000,
            locked: Math.random() > 0.5,
            lockDuration: Math.floor(Math.random() * 365),
          },
        ] as unknown as T,
      };
    }

    // Default token info
    return {
      success: true,
      data: {
        address,
        name: "Mock Token",
        symbol: "MOCK",
        decimals: 9,
        totalSupply: "1000000000",
        price: Math.random() * 0.001,
        priceChange24h: (Math.random() - 0.5) * 50,
        marketCap: Math.random() * 100000,
        liquidity: Math.random() * 50000,
        holders: Math.floor(Math.random() * 1000) + 100,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        deployer: `EQ${address.slice(0, 40)}...`,
      } as unknown as T,
    };
  }
}

// Singleton export
export const dyorApi = new DYORApiClient();

// Factory for custom instances
export function createDYORClient(apiKey: string): DYORApiClient {
  return new DYORApiClient(apiKey);
}
