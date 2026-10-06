/**
 * TonAPI Integration for TON Blockchain Data
 * Provides wallet info, transaction history, and jetton data
 *
 * A failed call returns success: false. It never falls back to invented
 * data: these results feed risk scores about real addresses.
 */

export interface TonWalletInfo {
  address: string;
  balance: string;
  lastActivity: string;
  status: "active" | "uninit" | "frozen";
  interfaces: string[];
}

export interface TonTransaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  fee: string;
  success: boolean;
  operation?: string;
}

export interface TonJettonBalance {
  jetton: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image?: string;
  };
  balance: string;
  wallet_address: string;
}

export interface TonJettonTransfer {
  queryId: string;
  source: string;
  destination: string;
  amount: string;
  jettonAddress: string;
  timestamp: number;
  comment?: string;
}

export interface MinterHistory {
  totalTokensLaunched: number;
  tokensAlive: number;
  tokensRugged: number;
  averageLifespan: number; // days
  survivalRate: number; // percentage
  rugRate: number; // percentage
  launches: {
    tokenAddress: string;
    tokenName: string;
    launchDate: string;
    status: "alive" | "rugged" | "dead";
    lifespanDays: number;
  }[];
}

interface TonAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class TonApiClient {
  private baseUrl = "https://tonapi.io/v2";
  private _apiKey?: string;

  constructor(apiKey?: string) {
    this._apiKey = apiKey;
  }

  // Get API key at request time, not module load time (important for Edge runtime)
  private get apiKey(): string {
    return this._apiKey || process.env.TONAPI_KEY || "";
  }

  private async fetch<T>(endpoint: string): Promise<TonAPIResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.error(`[TonAPI] ${response.status} at ${endpoint}: ${errorBody.slice(0, 200)}`);
        if (response.status === 401 && !this.apiKey) {
          console.warn("[TonAPI] Consider adding TONAPI_KEY for higher rate limits");
        }
        throw new Error(`TonAPI error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("[TonAPI] API Error at", endpoint, ":", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "TonAPI request failed",
      };
    }
  }

  /**
   * Get wallet/account info
   */
  async getWalletInfo(address: string): Promise<TonAPIResponse<TonWalletInfo>> {
    return this.fetch<TonWalletInfo>(`/accounts/${address}`);
  }

  /**
   * Get wallet transaction history
   */
  async getTransactions(
    address: string,
    limit: number = 100
  ): Promise<TonAPIResponse<{ events: TonTransaction[] }>> {
    return this.fetch(`/accounts/${address}/events?limit=${limit}`);
  }

  /**
   * Get jetton (token) balances for a wallet
   */
  async getJettonBalances(address: string): Promise<TonAPIResponse<{ balances: TonJettonBalance[] }>> {
    return this.fetch(`/accounts/${address}/jettons`);
  }

  /**
   * Get jetton transfer history for a wallet
   * Uses the events endpoint with jetton filter
   */
  async getJettonTransfers(
    address: string,
    limit: number = 100
  ): Promise<TonAPIResponse<{ events: TonJettonTransfer[] }>> {
    // TonAPI v2 uses events endpoint with subject_only filter for jetton transfers
    return this.fetch(`/accounts/${address}/events?limit=${limit}&subject_only=true`);
  }

  /**
   * Analyze minter history - track record of token launches
   * This is our proprietary calculation based on TonAPI data
   */
  async getMinterHistory(walletAddress: string): Promise<TonAPIResponse<MinterHistory>> {
    try {
      // Get transactions to find token creation events (TonAPI max is 100)
      const txResponse = await this.getTransactions(walletAddress, 100);
      if (!txResponse.success || !txResponse.data) {
        return { success: false, error: "Failed to fetch transactions" };
      }

      // Get jetton transfers to identify token deployments
      const jettonResponse = await this.getJettonTransfers(walletAddress, 100);
      if (!jettonResponse.success) {
        // Without it every wallet would look like a minter with no history
        return { success: false, error: "Failed to fetch jetton transfers" };
      }

      // Analyze transactions for token creation patterns
      // Token creation on TON typically involves:
      // 1. Deploy contract with jetton master code
      // 2. Initialize jetton with metadata
      const launches: MinterHistory["launches"] = [];
      const now = Date.now();

      // In production, we'd analyze actual contract deployments
      // For now, we track jetton interactions as proxy
      const uniqueJettons = new Set<string>();

      if (jettonResponse.success && jettonResponse.data?.events) {
        for (const transfer of jettonResponse.data.events) {
          if (transfer.source === walletAddress && !uniqueJettons.has(transfer.jettonAddress)) {
            uniqueJettons.add(transfer.jettonAddress);
            const launchDate = new Date(transfer.timestamp * 1000);
            const lifespanDays = Math.floor((now - transfer.timestamp * 1000) / (1000 * 60 * 60 * 24));

            launches.push({
              tokenAddress: transfer.jettonAddress,
              tokenName: `Token ${uniqueJettons.size}`,
              launchDate: launchDate.toISOString(),
              status: lifespanDays > 30 ? "alive" : lifespanDays > 7 ? "dead" : "alive",
              lifespanDays,
            });
          }
        }
      }

      const totalLaunched = launches.length;
      const alive = launches.filter((l) => l.status === "alive").length;
      const rugged = launches.filter((l) => l.status === "rugged").length;
      const avgLifespan = launches.length > 0
        ? launches.reduce((sum, l) => sum + l.lifespanDays, 0) / launches.length
        : 0;

      return {
        success: true,
        data: {
          totalTokensLaunched: totalLaunched,
          tokensAlive: alive,
          tokensRugged: rugged,
          averageLifespan: Math.round(avgLifespan),
          survivalRate: totalLaunched > 0 ? (alive / totalLaunched) * 100 : 100,
          rugRate: totalLaunched > 0 ? (rugged / totalLaunched) * 100 : 0,
          launches,
        },
      };
    } catch (error) {
      console.error("[TonAPI] Minter history error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze minter history",
      };
    }
  }
}

// Singleton export
export const tonApi = new TonApiClient();

// Factory for custom instances
export function createTonApiClient(apiKey: string): TonApiClient {
  return new TonApiClient(apiKey);
}
