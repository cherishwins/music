import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { QdrantClient } from "@qdrant/js-client-rest";

/**
 * Health check endpoint for all services
 * GET /api/health
 *
 * Tests:
 * - Turso database connectivity
 * - Qdrant vector database
 * - External API keys (existence only, not validity)
 * - Wallet addresses configured
 */

interface ServiceStatus {
  status: "ok" | "error" | "not_configured" | "degraded";
  latency?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export async function GET() {
  const services: Record<string, ServiceStatus> = {};
  const startTime = Date.now();

  // 1. Check Turso Database
  try {
    const start = Date.now();
    const users = await db.query.users.findMany({ limit: 1 });
    const userCount = await db.query.users.findMany();
    services.turso = {
      status: "ok",
      latency: Date.now() - start,
      details: {
        userCount: userCount.length,
        connected: true,
      },
    };
  } catch (error) {
    services.turso = {
      status: "error",
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }

  // 2. Check Qdrant Vector Database
  try {
    const start = Date.now();
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantKey = process.env.QDRANT_API_KEY;

    if (!qdrantUrl || !qdrantKey) {
      services.qdrant = { status: "not_configured" };
    } else {
      const client = new QdrantClient({
        url: qdrantUrl,
        apiKey: qdrantKey,
      });

      const collections = await client.getCollections();
      // Check for new hip hop collection first, fallback to old
      const hiphopCollection = collections.collections.find(
        (c) => c.name === "hiphop_viral"
      );
      const lyricCollection = collections.collections.find(
        (c) => c.name === "lyric_patterns"
      );
      const targetCollection = hiphopCollection || lyricCollection;

      if (targetCollection) {
        const info = await client.getCollection(targetCollection.name);
        services.qdrant = {
          status: "ok",
          latency: Date.now() - start,
          details: {
            collection: targetCollection.name,
            // @ts-expect-error - points_count exists
            vectorCount: info.points_count || info.vectors_count || 0,
            status: info.status,
          },
        };
      } else {
        services.qdrant = {
          status: "degraded",
          latency: Date.now() - start,
          details: {
            message: "Connected but lyric_patterns collection not found",
            collections: collections.collections.map((c) => c.name),
          },
        };
      }
    }
  } catch (error) {
    services.qdrant = {
      status: "error",
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }

  // 3. Check API Keys (existence only - not validity)
  const apiKeys = {
    telegram: !!process.env.TELEGRAM_BOT_TOKEN,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    google_ai: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    replicate: !!process.env.REPLICATE_API_TOKEN,
  };

  const configuredKeys = Object.values(apiKeys).filter(Boolean).length;
  const totalKeys = Object.keys(apiKeys).length;

  services.api_keys = {
    status: configuredKeys === totalKeys ? "ok" : configuredKeys > 0 ? "degraded" : "error",
    details: {
      configured: configuredKeys,
      total: totalKeys,
      keys: apiKeys,
    },
  };

  // 4. Check Payment Configuration
  const payments = {
    ton_wallet: !!process.env.NEXT_PUBLIC_TON_WALLET_ADDRESS,
    x402_address: !!process.env.X402_PAYMENT_ADDRESS,
    x402_enabled: process.env.X402_ENABLED === "true",
  };

  services.payments = {
    status: payments.ton_wallet && payments.x402_address ? "ok" : "degraded",
    details: payments,
  };

  // 5. Check Vercel Blob (for file storage)
  services.blob_storage = {
    status: process.env.BLOB_READ_WRITE_TOKEN ? "ok" : "not_configured",
  };

  // Calculate overall health
  const statuses = Object.values(services).map((s) => s.status);
  const hasError = statuses.includes("error");
  const hasDegraded = statuses.includes("degraded");

  let overallStatus: "healthy" | "degraded" | "unhealthy";
  if (hasError) {
    overallStatus = "unhealthy";
  } else if (hasDegraded) {
    overallStatus = "degraded";
  } else {
    overallStatus = "healthy";
  }

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    totalLatency: Date.now() - startTime,
    services,
    environment: process.env.NODE_ENV,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  });
}
