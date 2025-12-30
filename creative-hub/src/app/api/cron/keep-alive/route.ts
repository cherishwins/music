import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { QdrantClient } from "@qdrant/js-client-rest";

/**
 * Cron endpoint to keep Qdrant and Turso alive
 * Runs daily to prevent free tier auto-deletion
 *
 * Vercel Cron: configured in vercel.json
 */

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret (prevents unauthorized calls)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    // Allow calls without secret in dev or if not configured
    if (process.env.NODE_ENV === "production" && CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: Record<string, { status: string; latency?: number; error?: string }> = {};
  const startTime = Date.now();

  // 1. Ping Turso (SQLite)
  try {
    const tursoStart = Date.now();
    const count = await db.query.users.findMany({ limit: 1 });
    results.turso = {
      status: "ok",
      latency: Date.now() - tursoStart,
    };
  } catch (error) {
    results.turso = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // 2. Ping Qdrant (Vector DB)
  try {
    const qdrantStart = Date.now();
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantKey = process.env.QDRANT_API_KEY;

    if (!qdrantUrl || !qdrantKey) {
      results.qdrant = { status: "not_configured" };
    } else {
      const client = new QdrantClient({
        url: qdrantUrl,
        apiKey: qdrantKey,
      });

      // Get collection info to verify connection
      const collections = await client.getCollections();
      const lyricCollection = collections.collections.find(
        (c) => c.name === "lyric_patterns"
      );

      results.qdrant = {
        status: "ok",
        latency: Date.now() - qdrantStart,
      };

      // Add collection stats if available
      if (lyricCollection) {
        const info = await client.getCollection("lyric_patterns");
        // @ts-expect-error - points_count exists on collection info
        const vectorCount = info.points_count || info.vectors_count || 0;
        results.qdrant = {
          status: "ok",
          latency: Date.now() - qdrantStart,
          // @ts-expect-error - adding extra info
          vectorCount,
        };
      }
    }
  } catch (error) {
    results.qdrant = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const totalLatency = Date.now() - startTime;
  const allOk = Object.values(results).every(
    (r) => typeof r === "object" && "status" in r && (r.status === "ok" || r.status === "not_configured")
  );

  console.log("[CRON] Keep-alive completed:", {
    timestamp: new Date().toISOString(),
    totalLatency,
    results,
  });

  return NextResponse.json({
    success: allOk,
    timestamp: new Date().toISOString(),
    totalLatency,
    services: results,
  });
}
