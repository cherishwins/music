/**
 * Infrastructure Score API
 *
 * Novel crypto intelligence: Monitor exchange/protocol INFRASTRUCTURE
 * to detect pre-hack degradation signals before on-chain exploits happen.
 *
 * GET /api/infra-score?entity=binance
 * GET /api/infra-score?entity=ton
 * GET /api/infra-score/leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createShodanClient,
  calculateInfraScore,
  CRYPTO_EXCHANGES,
  scanTONInfrastructure,
  type InfrastructureScore,
} from '@/lib/shodan';

// Cache scores for 1 hour to preserve API credits
const scoreCache = new Map<string, { score: InfrastructureScore; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get('entity')?.toLowerCase();
  const action = searchParams.get('action');

  // Check for API key
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'SHODAN_API_KEY not configured',
        setup: {
          step1: 'Buy membership: https://account.shodan.io/billing ($49 one-time)',
          step2: 'Get API key from: https://account.shodan.io',
          step3: 'Add to .env: SHODAN_API_KEY=your_key',
        },
      },
      { status: 503 }
    );
  }

  const client = createShodanClient(apiKey);

  try {
    // Get API info/credits
    if (action === 'info') {
      const info = await client.info();
      return NextResponse.json({
        plan: info.plan,
        queryCredits: info.query_credits,
        scanCredits: info.scan_credits,
      });
    }

    // Scan TON infrastructure
    if (entity === 'ton') {
      const cached = scoreCache.get('ton');
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({
          ...cached.score,
          cached: true,
          cacheAge: Math.round((Date.now() - cached.timestamp) / 1000),
        });
      }

      const tonInfra = await scanTONInfrastructure(client);
      return NextResponse.json({
        entity: 'TON Network',
        infrastructure: tonInfra,
        lastScanned: new Date().toISOString(),
      });
    }

    // Scan specific exchange
    if (entity && entity in CRYPTO_EXCHANGES) {
      const exchange = CRYPTO_EXCHANGES[entity as keyof typeof CRYPTO_EXCHANGES];

      // Check cache
      const cached = scoreCache.get(entity);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({
          ...cached.score,
          cached: true,
          cacheAge: Math.round((Date.now() - cached.timestamp) / 1000),
        });
      }

      const score = await calculateInfraScore(client, exchange.name, exchange.org);

      // Cache the result
      scoreCache.set(entity, { score, timestamp: Date.now() });

      return NextResponse.json(score);
    }

    // List available entities
    return NextResponse.json({
      message: 'Crypto Infrastructure Intelligence API',
      description: 'Monitor exchange/protocol infrastructure security before hacks happen',
      usage: {
        getScore: '/api/infra-score?entity=binance',
        tonNetwork: '/api/infra-score?entity=ton',
        apiInfo: '/api/infra-score?action=info',
      },
      availableExchanges: Object.keys(CRYPTO_EXCHANGES),
      grading: {
        A: '90-100 - Excellent security posture',
        B: '80-89 - Good, minor issues',
        C: '70-79 - Fair, some concerns',
        D: '60-69 - Poor, significant risks',
        F: '0-59 - Critical, high hack probability',
      },
    });
  } catch (error) {
    console.error('Shodan API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to query infrastructure',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
