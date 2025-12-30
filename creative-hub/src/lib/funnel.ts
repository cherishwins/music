/**
 * Funnel Tracking Utility
 * Tracks customer journey from discovery → generation → payment
 *
 * Usage:
 *   import { trackEvent, getSessionId, parseUtmParams } from '@/lib/funnel';
 *
 *   // Track a funnel event
 *   await trackEvent({
 *     event: 'generate_complete',
 *     sessionId: getSessionId(),
 *     userId: user?.id,
 *     trackId: newTrack.id,
 *     discoverySource: 'telegram_search',
 *   });
 */

import { v4 as uuidv4 } from "uuid";

// Types matching the schema
export type FunnelEventType =
  | "page_view"
  | "generate_start"
  | "generate_complete"
  | "preview_play"
  | "download_watermarked"
  | "download_attempt_clean"
  | "payment_started"
  | "payment_completed"
  | "signup"
  | "share";

export type DiscoverySource =
  | "telegram_search"
  | "telegram_channel"
  | "findmini"
  | "tapps_center"
  | "mcp_directory"
  | "product_hunt"
  | "tiktok"
  | "twitter"
  | "referral"
  | "direct"
  | "unknown";

export type Platform = "telegram_miniapp" | "web" | "mcp" | "api";

export interface TrackEventParams {
  event: FunnelEventType;
  sessionId: string;
  userId?: string | null;
  anonymousId?: string;
  discoverySource?: DiscoverySource;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  trackId?: string;
  pageUrl?: string;
  experimentId?: string;
  variant?: string;
  platform?: Platform;
  userAgent?: string;
}

/**
 * Generate or retrieve session ID
 * In browser: stored in sessionStorage
 * On server: generate new UUID
 */
export function getSessionId(): string {
  if (typeof window !== "undefined") {
    let sessionId = sessionStorage.getItem("wt_session_id");
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem("wt_session_id", sessionId);
    }
    return sessionId;
  }
  return uuidv4();
}

/**
 * Generate or retrieve anonymous ID for tracking before signup
 * In browser: stored in localStorage (persists across sessions)
 */
export function getAnonymousId(): string {
  if (typeof window !== "undefined") {
    let anonId = localStorage.getItem("wt_anon_id");
    if (!anonId) {
      anonId = uuidv4();
      localStorage.setItem("wt_anon_id", anonId);
    }
    return anonId;
  }
  return uuidv4();
}

/**
 * Parse UTM parameters from URL
 */
export function parseUtmParams(url?: string): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  try {
    const urlObj = new URL(url || (typeof window !== "undefined" ? window.location.href : ""));
    return {
      utmSource: urlObj.searchParams.get("utm_source") || undefined,
      utmMedium: urlObj.searchParams.get("utm_medium") || undefined,
      utmCampaign: urlObj.searchParams.get("utm_campaign") || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Parse referral code from URL
 */
export function parseReferralCode(url?: string): string | undefined {
  try {
    const urlObj = new URL(url || (typeof window !== "undefined" ? window.location.href : ""));
    return urlObj.searchParams.get("ref") || urlObj.searchParams.get("referral") || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Detect discovery source from URL/referrer
 */
export function detectDiscoverySource(
  url?: string,
  referrer?: string
): DiscoverySource {
  const urlStr = url || (typeof window !== "undefined" ? window.location.href : "");
  const ref = referrer || (typeof document !== "undefined" ? document.referrer : "");

  // Check URL params first
  try {
    const urlObj = new URL(urlStr);
    const src = urlObj.searchParams.get("src") || urlObj.searchParams.get("utm_source");

    if (src) {
      const srcMap: Record<string, DiscoverySource> = {
        findmini: "findmini",
        tapps: "tapps_center",
        mcp: "mcp_directory",
        producthunt: "product_hunt",
        ph: "product_hunt",
        tiktok: "tiktok",
        tt: "tiktok",
        twitter: "twitter",
        x: "twitter",
      };
      if (srcMap[src.toLowerCase()]) {
        return srcMap[src.toLowerCase()];
      }
    }

    // Check referral code
    if (urlObj.searchParams.get("ref") || urlObj.searchParams.get("referral")) {
      return "referral";
    }
  } catch {
    // Invalid URL, continue to referrer check
  }

  // Check referrer
  if (ref) {
    if (ref.includes("t.me") || ref.includes("telegram")) {
      return ref.includes("channel") ? "telegram_channel" : "telegram_search";
    }
    if (ref.includes("findmini.app")) return "findmini";
    if (ref.includes("tapps.center")) return "tapps_center";
    if (ref.includes("mcp.so") || ref.includes("mcpmarket")) return "mcp_directory";
    if (ref.includes("producthunt.com")) return "product_hunt";
    if (ref.includes("tiktok.com")) return "tiktok";
    if (ref.includes("twitter.com") || ref.includes("x.com")) return "twitter";
  }

  // No referrer = direct
  if (!ref) return "direct";

  return "unknown";
}

/**
 * Detect platform from user agent or context
 */
export function detectPlatform(userAgent?: string): Platform {
  const ua = userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");

  // Check if running in Telegram Mini App
  if (typeof window !== "undefined" && (window as unknown as { Telegram?: unknown }).Telegram) {
    return "telegram_miniapp";
  }

  // Check for MCP or API calls (would be set server-side)
  if (ua.includes("MCP") || ua.includes("claude-code")) {
    return "mcp";
  }

  if (ua.includes("curl") || ua.includes("axios") || ua.includes("fetch")) {
    return "api";
  }

  return "web";
}

/**
 * Track a funnel event
 * Sends to /api/funnel/track endpoint
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    // Add anonymous ID if no user ID
    const eventData = {
      ...params,
      anonymousId: params.anonymousId || (params.userId ? undefined : getAnonymousId()),
      platform: params.platform || detectPlatform(params.userAgent),
      userAgent: params.userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
    };

    // Fire and forget - don't block on tracking
    fetch("/api/funnel/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    }).catch(() => {
      // Silently fail - tracking shouldn't break the app
    });
  } catch {
    // Silently fail
  }
}

/**
 * Helper to track with auto-detected params
 */
export function createTracker(baseParams?: Partial<TrackEventParams>) {
  const sessionId = getSessionId();
  const utmParams = parseUtmParams();
  const discoverySource = detectDiscoverySource();
  const referralCode = parseReferralCode();
  const platform = detectPlatform();

  return {
    track: (event: FunnelEventType, additionalParams?: Partial<TrackEventParams>) => {
      return trackEvent({
        event,
        sessionId,
        discoverySource,
        referralCode,
        platform,
        ...utmParams,
        ...baseParams,
        ...additionalParams,
      });
    },
    sessionId,
    discoverySource,
  };
}

/**
 * Track page view on mount (React hook helper)
 */
export function trackPageView(userId?: string | null) {
  const tracker = createTracker({ userId });
  tracker.track("page_view", {
    pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
  });
  return tracker;
}
