/**
 * Cost Monitoring & Runway API
 *
 * Provides:
 * - Current period costs by service
 * - Revenue vs costs comparison
 * - Runway calculation
 * - Service usage alerts
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { costEvents, transactions, dailyMetrics } from "@/lib/db/schema";
import { sql, desc, gte, and, eq, sum } from "drizzle-orm";

// Cost rates per service (2025 pricing)
const COST_RATES = {
  elevenlabs_music: {
    name: "ElevenLabs Music",
    unit: "minute",
    rate: 0.08, // ~$0.08/min on Creator plan
    monthlyIncluded: 62, // Creator plan: 62 min/mo
    planCost: 22, // $22/mo
  },
  elevenlabs_voice: {
    name: "ElevenLabs Voice",
    unit: "character",
    rate: 0.00002, // ~$0.002/100 chars
    monthlyIncluded: 100000, // Creator plan: 100K chars
  },
  anthropic: {
    name: "Anthropic Claude",
    unit: "token",
    inputRate: 0.00000025, // Haiku 3: $0.25/1M
    outputRate: 0.00000125, // Haiku 3: $1.25/1M
  },
  replicate: {
    name: "Replicate Flux",
    unit: "image",
    rate: 0.003, // FLUX.1-schnell
  },
  xai: {
    name: "xAI Grok",
    unit: "token",
    inputRate: 0.000002, // $2/1M
    outputRate: 0.000006, // $6/1M
  },
};

// Monthly fixed costs
const FIXED_COSTS = {
  elevenlabs: 22,  // Creator plan
  turso: 0,        // Free tier
  qdrant: 0,       // Free tier
  vercel: 0,       // Hobby plan
  total: 22,
};

// Free tier limits
const FREE_TIER_LIMITS = {
  turso_reads: 1_000_000_000,
  turso_writes: 25_000_000,
  qdrant_vectors: 1_000_000,
  vercel_invocations: 100_000,
  elevenlabs_minutes: 62,
};

export async function GET(request: NextRequest) {
  try {
    // Get period from query params (default: current month)
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get costs by service
    const costs = await db
      .select({
        service: costEvents.service,
        totalCost: sum(costEvents.estimatedCost),
        eventCount: sql<number>`count(*)`,
        totalInputTokens: sum(costEvents.inputTokens),
        totalOutputTokens: sum(costEvents.outputTokens),
        totalDuration: sum(costEvents.durationSeconds),
      })
      .from(costEvents)
      .where(gte(costEvents.createdAt, startDate))
      .groupBy(costEvents.service);

    // Get revenue by payment method
    const revenue = await db
      .select({
        paymentMethod: transactions.paymentMethod,
        grossTotal: sum(transactions.grossAmount),
        netTotal: sum(transactions.netAmount),
        feeTotal: sum(transactions.platformFee),
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          eq(transactions.status, "completed")
        )
      )
      .groupBy(transactions.paymentMethod);

    // Calculate totals
    const totalVariableCosts = costs.reduce(
      (sum, c) => sum + (Number(c.totalCost) || 0),
      0
    );
    const totalRevenue = revenue.reduce(
      (sum, r) => sum + (Number(r.netTotal) || 0),
      0
    );
    const totalGrossRevenue = revenue.reduce(
      (sum, r) => sum + (Number(r.grossTotal) || 0),
      0
    );

    // Calculate monthly burn rate (fixed + variable)
    const monthlyBurn = FIXED_COSTS.total + totalVariableCosts;

    // Calculate runway (assuming $100 budget for now - should be configurable)
    const availableFunds = 100; // TODO: Make this configurable
    const runwayMonths = monthlyBurn > 0 ? availableFunds / monthlyBurn : Infinity;

    // Check for alerts
    const alerts: Array<{ service: string; message: string; severity: "warning" | "critical" }> = [];

    // Check ElevenLabs minutes usage
    const elevenLabsCost = costs.find((c) => c.service === "elevenlabs_music");
    if (elevenLabsCost) {
      const minutesUsed = Number(elevenLabsCost.totalDuration) / 60 || 0;
      const percentUsed = (minutesUsed / FREE_TIER_LIMITS.elevenlabs_minutes) * 100;

      if (percentUsed >= 95) {
        alerts.push({
          service: "ElevenLabs",
          message: `${percentUsed.toFixed(0)}% of monthly music minutes used`,
          severity: "critical",
        });
      } else if (percentUsed >= 80) {
        alerts.push({
          service: "ElevenLabs",
          message: `${percentUsed.toFixed(0)}% of monthly music minutes used`,
          severity: "warning",
        });
      }
    }

    // Format response
    const response = {
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        type: period,
      },
      costs: {
        byService: costs.map((c) => ({
          service: c.service,
          name: COST_RATES[c.service as keyof typeof COST_RATES]?.name || c.service,
          total: Number(c.totalCost) || 0,
          events: Number(c.eventCount) || 0,
          details: {
            inputTokens: Number(c.totalInputTokens) || 0,
            outputTokens: Number(c.totalOutputTokens) || 0,
            durationSeconds: Number(c.totalDuration) || 0,
          },
        })),
        variable: totalVariableCosts,
        fixed: FIXED_COSTS.total,
        total: monthlyBurn,
      },
      revenue: {
        byMethod: revenue.map((r) => ({
          method: r.paymentMethod,
          gross: Number(r.grossTotal) || 0,
          net: Number(r.netTotal) || 0,
          fees: Number(r.feeTotal) || 0,
          transactions: Number(r.count) || 0,
        })),
        gross: totalGrossRevenue,
        net: totalRevenue,
      },
      profitLoss: {
        gross: totalGrossRevenue - monthlyBurn,
        net: totalRevenue - monthlyBurn,
        margin: totalRevenue > 0 ? ((totalRevenue - monthlyBurn) / totalRevenue) * 100 : 0,
      },
      runway: {
        availableFunds,
        monthlyBurn,
        monthsRemaining: runwayMonths === Infinity ? null : runwayMonths,
        status: runwayMonths > 6 ? "healthy" : runwayMonths > 3 ? "warning" : "critical",
      },
      alerts,
      rates: COST_RATES,
      freeTierLimits: FREE_TIER_LIMITS,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Cost monitoring error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost data" },
      { status: 500 }
    );
  }
}

// Helper to log a cost event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      service,
      model,
      inputTokens,
      outputTokens,
      durationSeconds,
      bytesStored,
      userId,
      trackId,
    } = body;

    if (!service) {
      return NextResponse.json(
        { error: "Service is required" },
        { status: 400 }
      );
    }

    // Calculate estimated cost based on service
    let estimatedCost = 0;
    const rates = COST_RATES[service as keyof typeof COST_RATES];

    if (rates) {
      if ("rate" in rates && durationSeconds) {
        // Time-based (ElevenLabs music)
        estimatedCost = (durationSeconds / 60) * rates.rate;
      } else if ("inputRate" in rates && "outputRate" in rates) {
        // Token-based (Claude, xAI)
        estimatedCost =
          (inputTokens || 0) * rates.inputRate +
          (outputTokens || 0) * rates.outputRate;
      } else if ("rate" in rates) {
        // Per-unit (Replicate images)
        estimatedCost = rates.rate;
      }
    }

    // Insert cost event
    await db.insert(costEvents).values({
      id: crypto.randomUUID(),
      service,
      model,
      inputTokens,
      outputTokens,
      durationSeconds,
      bytesStored,
      estimatedCost,
      userId,
      trackId,
    });

    return NextResponse.json({
      success: true,
      estimatedCost,
      service,
    });
  } catch (error) {
    console.error("Cost logging error:", error);
    return NextResponse.json(
      { error: "Failed to log cost" },
      { status: 500 }
    );
  }
}
