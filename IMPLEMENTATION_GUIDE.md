# Technical Implementation Guide
## Minter Credit Scoring System

---

## API Integration Examples

### 1. DYOR.io Trust Score Integration

```typescript
// lib/dyor-api.ts
const DYOR_API_BASE = 'https://api.dyor.io/v1';
const DYOR_API_KEY = process.env.DYOR_API_KEY;

interface TrustScoreResponse {
  trustScore: number;        // 0-100
  verification: 'verified' | 'unverified';
  mintable: boolean;
  modifiedContract: boolean;
  holdersCount: string;
  totalSupply: string;
}

interface TokenDetails {
  metadata: {
    symbol: string;
    name: string;
    description: string;
    address: string;
  };
  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  trustScore: number;
}

export async function getTokenTrustScore(tokenAddress: string): Promise<TrustScoreResponse> {
  const response = await fetch(
    `${DYOR_API_BASE}/jettons/${tokenAddress}/trust-score`,
    {
      headers: {
        'Authorization': `Bearer ${DYOR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`DYOR API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getTokenDetails(tokenAddress: string): Promise<TokenDetails> {
  const response = await fetch(
    `${DYOR_API_BASE}/jettons/${tokenAddress}`,
    {
      headers: {
        'Authorization': `Bearer ${DYOR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
}

export async function getTokenHolders(tokenAddress: string, limit: number = 100) {
  const response = await fetch(
    `${DYOR_API_BASE}/jettons/${tokenAddress}/holders?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${DYOR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
}
```

### 2. TonAPI Integration for Wallet Analysis

```typescript
// lib/tonapi.ts
const TONAPI_BASE = 'https://tonapi.io/v2';
const TONAPI_KEY = process.env.TONAPI_KEY;

interface WalletEvent {
  event_id: string;
  timestamp: number;
  actions: Array<{
    type: string;
    JettonMint?: {
      jetton: {
        address: string;
        name: string;
        symbol: string;
      };
      amount: string;
    };
  }>;
}

interface AccountInfo {
  address: string;
  balance: number;
  last_activity: number;
  status: string;
  interfaces: string[];
}

export async function getWalletEvents(
  walletAddress: string, 
  limit: number = 100
): Promise<WalletEvent[]> {
  const response = await fetch(
    `${TONAPI_BASE}/accounts/${walletAddress}/events?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${TONAPI_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.events || [];
}

export async function getMinterHistory(walletAddress: string) {
  // Get all events and filter for token creation
  const events = await getWalletEvents(walletAddress, 1000);
  
  const tokenLaunches = events.filter(event => 
    event.actions.some(action => 
      action.type === 'JettonMint' || 
      action.type === 'JettonDeploy'
    )
  );
  
  return {
    totalLaunches: tokenLaunches.length,
    launches: tokenLaunches.map(event => ({
      eventId: event.event_id,
      timestamp: event.timestamp,
      token: event.actions.find(a => a.JettonMint)?.JettonMint?.jetton
    }))
  };
}

export async function getAccountInfo(address: string): Promise<AccountInfo> {
  const response = await fetch(
    `${TONAPI_BASE}/accounts/${address}`,
    {
      headers: {
        'Authorization': `Bearer ${TONAPI_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
}

export async function getJettonWallets(ownerAddress: string) {
  const response = await fetch(
    `${TONAPI_BASE}/accounts/${ownerAddress}/jettons`,
    {
      headers: {
        'Authorization': `Bearer ${TONAPI_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
}
```

### 3. Minter Credit Score Calculator

```typescript
// lib/minter-score.ts
import { getTokenTrustScore, getTokenDetails, getTokenHolders } from './dyor-api';
import { getMinterHistory, getAccountInfo } from './tonapi';

interface MinterScore {
  score: number;          // 0-1000
  grade: string;          // A+ to F
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  components: {
    history: number;      // 0-100
    safety: number;       // 0-100
    behavior: number;     // 0-100
  };
  details: {
    totalLaunches: number;
    rugRate: number;
    averageTokenTrust: number;
    walletAge: number;
    lastActivity: number;
  };
  recommendation: string;
}

export async function calculateMinterCreditScore(
  walletAddress: string
): Promise<MinterScore> {
  
  // 1. Fetch minter history
  const minterHistory = await getMinterHistory(walletAddress);
  const accountInfo = await getAccountInfo(walletAddress);
  
  // 2. Analyze each launched token
  const tokenScores: number[] = [];
  let ruggedCount = 0;
  
  for (const launch of minterHistory.launches.slice(0, 20)) { // Last 20 tokens
    if (launch.token?.address) {
      try {
        const trustData = await getTokenTrustScore(launch.token.address);
        tokenScores.push(trustData.trustScore);
        
        // Consider trust score < 20 as rugged/dead
        if (trustData.trustScore < 20) {
          ruggedCount++;
        }
      } catch (e) {
        // Token no longer exists = likely rugged
        ruggedCount++;
      }
    }
  }
  
  // 3. Calculate component scores
  const historyScore = calculateHistoryScore(minterHistory, ruggedCount);
  const safetyScore = calculateSafetyScore(tokenScores);
  const behaviorScore = calculateBehaviorScore(accountInfo, minterHistory);
  
  // 4. Weighted combination
  const rawScore = (
    historyScore * 0.35 +
    safetyScore * 0.40 +
    behaviorScore * 0.25
  ) * 10;
  
  const score = Math.round(Math.min(1000, Math.max(0, rawScore)));
  
  return {
    score,
    grade: getGrade(score),
    riskLevel: getRiskLevel(score),
    components: {
      history: Math.round(historyScore),
      safety: Math.round(safetyScore),
      behavior: Math.round(behaviorScore)
    },
    details: {
      totalLaunches: minterHistory.totalLaunches,
      rugRate: minterHistory.totalLaunches > 0 
        ? (ruggedCount / minterHistory.totalLaunches) * 100 
        : 0,
      averageTokenTrust: tokenScores.length > 0
        ? tokenScores.reduce((a, b) => a + b, 0) / tokenScores.length
        : 50,
      walletAge: Date.now() - accountInfo.last_activity * 1000,
      lastActivity: accountInfo.last_activity
    },
    recommendation: getRecommendation(score)
  };
}

function calculateHistoryScore(
  history: { totalLaunches: number; launches: any[] },
  ruggedCount: number
): number {
  // New minter = neutral 50
  if (history.totalLaunches === 0) return 50;
  
  // Experience bonus (caps at 20 launches)
  const experienceScore = Math.min(history.totalLaunches / 20, 1) * 20;
  
  // Rug rate penalty
  const rugRate = ruggedCount / history.totalLaunches;
  const rugPenalty = rugRate * 60; // Up to -60 points
  
  // Survival rate bonus
  const survivalRate = 1 - rugRate;
  const survivalBonus = survivalRate * 40;
  
  return Math.max(0, experienceScore + survivalBonus - rugPenalty + 20);
}

function calculateSafetyScore(tokenScores: number[]): number {
  if (tokenScores.length === 0) return 50;
  
  // Average trust score of launched tokens
  const avgTrust = tokenScores.reduce((a, b) => a + b, 0) / tokenScores.length;
  
  // Consistency bonus (low variance = more predictable)
  const variance = tokenScores.reduce((sum, score) => 
    sum + Math.pow(score - avgTrust, 2), 0
  ) / tokenScores.length;
  const consistencyBonus = Math.max(0, 20 - variance / 5);
  
  return Math.min(100, avgTrust * 0.8 + consistencyBonus);
}

function calculateBehaviorScore(
  accountInfo: any,
  history: { totalLaunches: number; launches: any[] }
): number {
  let score = 50;
  
  // Wallet age bonus (older = more trustworthy)
  const walletAgeMs = Date.now() - accountInfo.last_activity * 1000;
  const walletAgeDays = walletAgeMs / (1000 * 60 * 60 * 24);
  const ageBonus = Math.min(walletAgeDays / 365, 1) * 20; // Up to 20 points for 1 year
  
  // Activity consistency
  if (history.launches.length >= 2) {
    const timestamps = history.launches.map(l => l.timestamp);
    const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Regular launching pattern = +10, erratic = -10
    const variance = intervals.reduce((sum, i) => 
      sum + Math.pow(i - avgInterval, 2), 0
    ) / intervals.length;
    
    score += variance < 86400 * 7 ? 10 : -10; // 1 week variance threshold
  }
  
  // Balance check (has skin in the game)
  if (accountInfo.balance > 1000000000) { // > 1 TON
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score + ageBonus));
}

function getGrade(score: number): string {
  if (score >= 900) return 'A+';
  if (score >= 800) return 'A';
  if (score >= 700) return 'B+';
  if (score >= 600) return 'B';
  if (score >= 500) return 'C';
  if (score >= 400) return 'D';
  return 'F';
}

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (score >= 700) return 'LOW';
  if (score >= 500) return 'MEDIUM';
  if (score >= 300) return 'HIGH';
  return 'EXTREME';
}

function getRecommendation(score: number): string {
  if (score >= 800) {
    return '✅ Highly trusted minter. Track record shows consistent, legitimate token launches.';
  }
  if (score >= 600) {
    return '🟡 Moderately trusted. Exercise normal caution, verify token details before investing.';
  }
  if (score >= 400) {
    return '⚠️ Elevated risk. Limited or concerning history. DYOR heavily before investing.';
  }
  return '🚨 HIGH RISK! New or problematic minter. Approach with extreme caution.';
}
```

### 4. Whale Watch Module

```typescript
// lib/whale-watch.ts
import WebSocket from 'ws';

interface WhaleAlert {
  type: 'WHALE_BUY' | 'WHALE_SELL' | 'WHALE_DUMP' | 'DEV_MOVE' | 'LP_CHANGE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  tokenAddress: string;
  tokenSymbol: string;
  walletAddress: string;
  amount: number;
  amountUSD: number;
  percentOfSupply: number;
  timestamp: number;
  txHash: string;
}

// Thresholds for whale alerts
const WHALE_THRESHOLDS = {
  TON_AMOUNT: 10000,        // 10k TON
  USD_AMOUNT: 10000,        // $10k USD
  SUPPLY_PERCENT: 1,        // 1% of supply
  DUMP_PERCENT: 5,          // 5% = dump alert
  LP_CHANGE_PERCENT: 20,    // 20% LP change = alert
};

export class WhaleWatcher {
  private subscribers: Map<string, (alert: WhaleAlert) => void> = new Map();
  private ws: WebSocket | null = null;
  
  constructor() {
    this.connect();
  }
  
  private connect() {
    // Connect to TonAPI streaming endpoint
    this.ws = new WebSocket('wss://tonapi.io/v2/sse/accounts/transactions');
    
    this.ws.on('message', (data: string) => {
      const tx = JSON.parse(data);
      this.analyzeTransaction(tx);
    });
    
    this.ws.on('close', () => {
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    });
  }
  
  async watchToken(tokenAddress: string, callback: (alert: WhaleAlert) => void) {
    this.subscribers.set(tokenAddress, callback);
    
    // Subscribe to token transfers
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        account: tokenAddress
      }));
    }
  }
  
  private async analyzeTransaction(tx: any) {
    // Check if this is a large transfer
    const tokenAddress = tx.token_address;
    const amount = tx.amount;
    const amountUSD = tx.amount_usd;
    
    if (!this.subscribers.has(tokenAddress)) return;
    
    // Calculate alert type and severity
    let alertType: WhaleAlert['type'] = 'WHALE_BUY';
    let severity: WhaleAlert['severity'] = 'INFO';
    
    if (tx.direction === 'out') {
      alertType = 'WHALE_SELL';
      
      if (tx.percent_of_supply > WHALE_THRESHOLDS.DUMP_PERCENT) {
        alertType = 'WHALE_DUMP';
        severity = 'CRITICAL';
      } else if (amountUSD > 50000) {
        severity = 'WARNING';
      }
    }
    
    // Check if from dev wallet
    if (tx.is_dev_wallet) {
      alertType = 'DEV_MOVE';
      severity = 'CRITICAL';
    }
    
    // Create alert
    const alert: WhaleAlert = {
      type: alertType,
      severity,
      tokenAddress,
      tokenSymbol: tx.token_symbol,
      walletAddress: tx.from_address,
      amount,
      amountUSD,
      percentOfSupply: tx.percent_of_supply,
      timestamp: Date.now(),
      txHash: tx.hash
    };
    
    // Notify subscribers
    const callback = this.subscribers.get(tokenAddress);
    if (callback) {
      callback(alert);
    }
  }
  
  unwatch(tokenAddress: string) {
    this.subscribers.delete(tokenAddress);
  }
}

// Usage example
export async function setupWhaleAlerts(tokenAddress: string) {
  const watcher = new WhaleWatcher();
  
  watcher.watchToken(tokenAddress, (alert) => {
    console.log(`🐋 WHALE ALERT: ${alert.type}`);
    console.log(`   Token: ${alert.tokenSymbol}`);
    console.log(`   Amount: $${alert.amountUSD.toLocaleString()}`);
    console.log(`   Supply %: ${alert.percentOfSupply.toFixed(2)}%`);
    
    // Send to Telegram, Discord, etc.
    // sendTelegramAlert(alert);
  });
}
```

### 5. API Endpoint (Next.js)

```typescript
// app/api/minter-score/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateMinterCreditScore } from '@/lib/minter-score';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    // Validate TON address format
    if (!isValidTonAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid TON address' },
        { status: 400 }
      );
    }
    
    // Calculate score
    const score = await calculateMinterCreditScore(address);
    
    // Cache for 5 minutes
    return NextResponse.json(score, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      }
    });
    
  } catch (error: any) {
    console.error('Minter score error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function isValidTonAddress(address: string): boolean {
  // Basic TON address validation
  return /^(EQ|UQ|0:)?[a-zA-Z0-9_-]{48}$/.test(address);
}
```

### 6. React Component

```tsx
// components/MinterScoreCard.tsx
'use client';

import { useState, useEffect } from 'react';

interface MinterScoreData {
  score: number;
  grade: string;
  riskLevel: string;
  components: {
    history: number;
    safety: number;
    behavior: number;
  };
  details: {
    totalLaunches: number;
    rugRate: number;
    averageTokenTrust: number;
  };
  recommendation: string;
}

interface Props {
  walletAddress: string;
}

export function MinterScoreCard({ walletAddress }: Props) {
  const [data, setData] = useState<MinterScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/minter-score/${walletAddress}`);
        if (!res.ok) throw new Error('Failed to fetch score');
        const score = await res.json();
        setData(score);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchScore();
  }, [walletAddress]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorCard error={error} />;
  if (!data) return null;
  
  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-black rounded-2xl p-6 border border-purple-500/30">
      {/* Score Circle */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48" cy="48" r="42"
              fill="none"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="8"
            />
            <circle
              cx="48" cy="48" r="42"
              fill="none"
              stroke={getScoreColor(data.score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(data.score / 1000) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{data.score}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-4xl font-bold ${getGradeColor(data.grade)}`}>
            {data.grade}
          </div>
          <div className={`text-sm ${getRiskColor(data.riskLevel)}`}>
            {data.riskLevel} RISK
          </div>
        </div>
      </div>
      
      {/* Component Bars */}
      <div className="space-y-3 mb-6">
        <ComponentBar label="History" value={data.components.history} />
        <ComponentBar label="Safety" value={data.components.safety} />
        <ComponentBar label="Behavior" value={data.components.behavior} />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-cyan-400">
            {data.details.totalLaunches}
          </div>
          <div className="text-xs text-gray-400">Tokens Launched</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className={`text-2xl font-bold ${
            data.details.rugRate > 50 ? 'text-red-500' : 'text-green-400'
          }`}>
            {data.details.rugRate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Rug Rate</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-400">
            {data.details.averageTokenTrust.toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">Avg Trust</div>
        </div>
      </div>
      
      {/* Recommendation */}
      <div className="text-sm text-gray-300 bg-black/30 rounded-lg p-4">
        {data.recommendation}
      </div>
    </div>
  );
}

function ComponentBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 700) return '#10b981';
  if (score >= 500) return '#f59e0b';
  if (score >= 300) return '#f97316';
  return '#ef4444';
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-400';
  if (grade.startsWith('B')) return 'text-yellow-400';
  if (grade.startsWith('C')) return 'text-orange-400';
  return 'text-red-500';
}

function getRiskColor(level: string): string {
  if (level === 'LOW') return 'text-green-400';
  if (level === 'MEDIUM') return 'text-yellow-400';
  if (level === 'HIGH') return 'text-orange-400';
  return 'text-red-500';
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
      <div className="text-red-400 mb-2">⚠️ Error</div>
      <div className="text-gray-300">{error}</div>
    </div>
  );
}
```

---

## Environment Variables

```env
# .env.local
DYOR_API_KEY=your_dyor_api_key
TONAPI_KEY=your_tonapi_key
WHALE_ALERT_API_KEY=your_whale_alert_key (optional)
```

---

## Next Steps

1. **Get API keys** from DYOR.io and TonAPI
2. **Copy these files** to your MemeScan project
3. **Add the API route** for minter score lookups
4. **Integrate the component** into your UI
5. **Connect to your Telegram bot** for alerts

---

*Let's build the Equifax of memecoins! 🚀*
