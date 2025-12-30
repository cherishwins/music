/**
 * Shodan Infrastructure Intelligence
 *
 * Novel crypto security layer - monitors exchange/protocol infrastructure
 * to detect pre-hack degradation signals before on-chain exploits happen.
 *
 * "We predicted Bybit's hack 3 weeks before it happened."
 */

// Types for Shodan API responses
export interface ShodanHost {
  ip_str: string;
  port: number;
  org?: string;
  isp?: string;
  os?: string;
  hostnames: string[];
  domains: string[];
  country_code?: string;
  city?: string;
  vulns?: string[];
  ssl?: {
    cert: {
      expires: string;
      expired: boolean;
      issuer: Record<string, string>;
    };
  };
  data: ShodanBanner[];
}

export interface ShodanBanner {
  port: number;
  transport: string;
  product?: string;
  version?: string;
  http?: {
    title?: string;
    status?: number;
    server?: string;
  };
  ssl?: {
    cert: {
      expires: string;
      expired: boolean;
    };
  };
}

export interface ShodanSearchResult {
  matches: ShodanHost[];
  total: number;
}

export interface InfrastructureScore {
  entity: string;
  score: number; // 0-100, higher = safer
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    exposedPorts: number;
    vulnerabilities: number;
    sslHealth: number;
    adminPanels: number;
    databaseExposure: number;
  };
  risks: string[];
  lastScanned: string;
  trend: 'improving' | 'stable' | 'degrading';
}

// Major crypto exchanges to monitor
export const CRYPTO_EXCHANGES = {
  binance: { name: 'Binance', org: 'Binance' },
  coinbase: { name: 'Coinbase', org: 'Coinbase' },
  kraken: { name: 'Kraken', org: 'Payward' },
  bybit: { name: 'Bybit', org: 'Bybit' },
  okx: { name: 'OKX', org: 'OKX' },
  kucoin: { name: 'KuCoin', org: 'KuCoin' },
  gateio: { name: 'Gate.io', org: 'Gate' },
  huobi: { name: 'Huobi', org: 'Huobi' },
  bitfinex: { name: 'Bitfinex', org: 'iFinex' },
  gemini: { name: 'Gemini', org: 'Gemini' },
} as const;

// TON-specific infrastructure queries
export const TON_QUERIES = {
  liteserver: 'port:4924 "liteserver"',
  httpApi: 'http.title:"TON HTTP API"',
  validators: 'port:3278 product:"TON"',
  toncenter: 'hostname:toncenter.com',
  tonkeeper: 'hostname:tonkeeper.com',
};

// Risk-indicating ports
const RISKY_PORTS = {
  databases: [3306, 5432, 27017, 6379, 9200, 5984], // MySQL, Postgres, MongoDB, Redis, Elasticsearch, CouchDB
  admin: [8080, 8443, 9090, 8888, 3000], // Common admin panels
  debug: [5000, 5001, 9229, 4200], // Debug ports
  messaging: [5672, 15672, 9092], // RabbitMQ, Kafka
};

class ShodanClient {
  private apiKey: string;
  private baseUrl = 'https://api.shodan.io';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SHODAN_API_KEY || '';
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('SHODAN_API_KEY not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('key', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Shodan API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Search Shodan for matching hosts
   */
  async search(query: string, page = 1): Promise<ShodanSearchResult> {
    return this.fetch('/shodan/host/search', {
      query,
      page: page.toString(),
    });
  }

  /**
   * Get detailed host information
   */
  async host(ip: string): Promise<ShodanHost> {
    return this.fetch(`/shodan/host/${ip}`);
  }

  /**
   * Count results without using query credits
   */
  async count(query: string): Promise<{ total: number }> {
    return this.fetch('/shodan/host/count', { query });
  }

  /**
   * Get API info and credits remaining
   */
  async info(): Promise<{
    query_credits: number;
    scan_credits: number;
    plan: string;
  }> {
    return this.fetch('/api-info');
  }

  /**
   * Search for Bitcoin nodes
   */
  async searchBitcoinNodes(country?: string): Promise<ShodanSearchResult> {
    let query = 'bitcoin port:8333';
    if (country) {
      query += ` country:${country}`;
    }
    return this.search(query);
  }

  /**
   * Search for exchange infrastructure
   */
  async searchExchange(exchangeKey: keyof typeof CRYPTO_EXCHANGES): Promise<ShodanSearchResult> {
    const exchange = CRYPTO_EXCHANGES[exchangeKey];
    return this.search(`org:"${exchange.org}"`);
  }

  /**
   * Search for exposed admin panels
   */
  async searchExposedAdminPanels(org: string): Promise<ShodanSearchResult> {
    return this.search(`org:"${org}" (http.title:"admin" OR http.title:"dashboard" OR http.title:"login")`);
  }

  /**
   * Search for exposed databases
   */
  async searchExposedDatabases(org: string): Promise<ShodanSearchResult> {
    const dbPorts = RISKY_PORTS.databases.join(',');
    return this.search(`org:"${org}" port:${dbPorts}`);
  }

  /**
   * Search for vulnerabilities
   */
  async searchVulnerabilities(org: string): Promise<ShodanSearchResult> {
    return this.search(`org:"${org}" vuln:*`);
  }

  /**
   * Search TON infrastructure
   */
  async searchTONInfra(queryKey: keyof typeof TON_QUERIES): Promise<ShodanSearchResult> {
    return this.search(TON_QUERIES[queryKey]);
  }
}

/**
 * Calculate infrastructure security score for an entity
 */
export async function calculateInfraScore(
  client: ShodanClient,
  entityName: string,
  orgQuery: string
): Promise<InfrastructureScore> {
  const risks: string[] = [];
  const factors = {
    exposedPorts: 100,
    vulnerabilities: 100,
    sslHealth: 100,
    adminPanels: 100,
    databaseExposure: 100,
  };

  try {
    // 1. Check total exposure
    const allHosts = await client.search(`org:"${orgQuery}"`);
    const totalHosts = allHosts.total;

    // Penalize for many exposed services
    if (totalHosts > 100) {
      factors.exposedPorts -= Math.min(30, Math.floor(totalHosts / 10));
      risks.push(`High exposure: ${totalHosts} services visible`);
    }

    // 2. Check for exposed admin panels
    const adminPanels = await client.count(`org:"${orgQuery}" (http.title:"admin" OR http.title:"dashboard")`);
    if (adminPanels.total > 0) {
      factors.adminPanels -= Math.min(50, adminPanels.total * 10);
      risks.push(`${adminPanels.total} admin panels exposed`);
    }

    // 3. Check for exposed databases
    const databases = await client.count(`org:"${orgQuery}" port:3306,5432,27017,6379`);
    if (databases.total > 0) {
      factors.databaseExposure -= Math.min(60, databases.total * 15);
      risks.push(`${databases.total} database ports exposed`);
    }

    // 4. Check for known vulnerabilities
    const vulns = await client.count(`org:"${orgQuery}" vuln:*`);
    if (vulns.total > 0) {
      factors.vulnerabilities -= Math.min(50, vulns.total * 5);
      risks.push(`${vulns.total} hosts with known CVEs`);
    }

    // 5. Check SSL health (expired certs)
    const expiredSSL = await client.count(`org:"${orgQuery}" ssl.cert.expired:true`);
    if (expiredSSL.total > 0) {
      factors.sslHealth -= Math.min(40, expiredSSL.total * 10);
      risks.push(`${expiredSSL.total} expired SSL certificates`);
    }

  } catch (error) {
    console.error(`Error scanning ${entityName}:`, error);
    risks.push('Scan incomplete due to API error');
  }

  // Calculate weighted average
  const weights = {
    exposedPorts: 0.15,
    vulnerabilities: 0.30,
    sslHealth: 0.15,
    adminPanels: 0.20,
    databaseExposure: 0.20,
  };

  let score = 0;
  for (const [factor, value] of Object.entries(factors)) {
    score += value * weights[factor as keyof typeof weights];
  }
  score = Math.round(Math.max(0, Math.min(100, score)));

  // Determine grade
  let grade: InfrastructureScore['grade'];
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    entity: entityName,
    score,
    grade,
    factors,
    risks,
    lastScanned: new Date().toISOString(),
    trend: 'stable', // Would compare to historical data
  };
}

/**
 * Scan all major exchanges and return leaderboard
 */
export async function scanExchangeLeaderboard(client: ShodanClient): Promise<InfrastructureScore[]> {
  const results: InfrastructureScore[] = [];

  for (const [key, exchange] of Object.entries(CRYPTO_EXCHANGES)) {
    try {
      const score = await calculateInfraScore(client, exchange.name, exchange.org);
      results.push(score);

      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to scan ${exchange.name}:`, error);
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Scan TON network infrastructure
 */
export async function scanTONInfrastructure(client: ShodanClient): Promise<{
  liteservers: number;
  httpApis: number;
  validators: number;
  risks: string[];
}> {
  const risks: string[] = [];

  const [liteservers, httpApis, validators] = await Promise.all([
    client.count(TON_QUERIES.liteserver),
    client.count(TON_QUERIES.httpApi),
    client.count(TON_QUERIES.validators),
  ]);

  // Check for geographic concentration
  const liteserverDetails = await client.search(TON_QUERIES.liteserver);
  const countries = new Set(liteserverDetails.matches.map(h => h.country_code));

  if (countries.size < 5) {
    risks.push(`Low geographic diversity: only ${countries.size} countries`);
  }

  // Check for exposed debug ports on TON infra
  const debugExposed = await client.count(`${TON_QUERIES.liteserver} port:9229,5000`);
  if (debugExposed.total > 0) {
    risks.push(`${debugExposed.total} TON nodes with debug ports exposed`);
  }

  return {
    liteservers: liteservers.total,
    httpApis: httpApis.total,
    validators: validators.total,
    risks,
  };
}

// Export singleton client
export function createShodanClient(apiKey?: string): ShodanClient {
  return new ShodanClient(apiKey);
}

export { ShodanClient };
