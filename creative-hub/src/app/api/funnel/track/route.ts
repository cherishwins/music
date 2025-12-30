/**
 * Funnel Event Tracking API
 * POST /api/funnel/track
 *
 * Fire-and-forget tracking for customer journey events
 */

import { NextRequest, NextResponse } from "next/server";
import { trackFunnelEvent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      event,
      sessionId,
      userId,
      anonymousId,
      discoverySource,
      referralCode,
      utmSource,
      utmMedium,
      utmCampaign,
      trackId,
      pageUrl,
      experimentId,
      variant,
      platform,
      userAgent,
    } = body;

    // Validate required fields
    if (!event || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields: event, sessionId" },
        { status: 400 }
      );
    }

    // Valid event types
    const validEvents = [
      "page_view",
      "generate_start",
      "generate_complete",
      "preview_play",
      "download_watermarked",
      "download_attempt_clean",
      "payment_started",
      "payment_completed",
      "signup",
      "share",
    ];

    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validEvents.join(", ")}` },
        { status: 400 }
      );
    }

    // Track the event
    await trackFunnelEvent({
      event,
      sessionId,
      userId: userId || null,
      anonymousId,
      discoverySource,
      referralCode,
      utmSource,
      utmMedium,
      utmCampaign,
      trackId,
      pageUrl,
      experimentId,
      variant,
      platform,
      userAgent: userAgent || request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Funnel tracking error:", error);
    // Don't fail the request - tracking errors shouldn't break the app
    return NextResponse.json({ success: false, error: "Tracking failed" });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/funnel/track",
    method: "POST",
    events: [
      "page_view",
      "generate_start",
      "generate_complete",
      "preview_play",
      "download_watermarked",
      "download_attempt_clean",
      "payment_started",
      "payment_completed",
      "signup",
      "share",
    ],
  });
}
