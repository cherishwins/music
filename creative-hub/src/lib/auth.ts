/**
 * Shared-secret checks for webhooks and operator-only routes.
 *
 * Every check fails closed: an unset secret switches the route off (503)
 * until the operator configures it, and a missing or wrong credential is 401.
 * Comparisons are constant-time.
 */

import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Constant-time string comparison. Both sides are hashed first so the
 * buffers are the same length and the secret's length does not leak either.
 */
export function safeEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

/**
 * Check a presented token against a secret from env.
 * Returns a response to send back, or null when the token matches.
 */
export function requireSharedSecret(
  presented: string | null,
  secret: string | undefined,
  secretName: string
): NextResponse | null {
  if (!secret) {
    console.error(`[auth] ${secretName} is not configured - refusing request`);
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  if (!presented || !safeEqual(presented, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

/**
 * Operator-only routes: require `Authorization: Bearer <ADMIN_TOKEN>`.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return requireSharedSecret(token, process.env.ADMIN_TOKEN, "ADMIN_TOKEN");
}

/**
 * Paid-order fulfilment: lib/settlement.ts calls the generate routes itself
 * once an order is paid, sending SETTLEMENT_SECRET in X-INTERNAL-SETTLEMENT.
 * True only when the secret is configured and matches; unset never matches.
 */
export function isInternalSettlement(request: NextRequest): boolean {
  const secret = process.env.SETTLEMENT_SECRET;
  const presented = request.headers.get("x-internal-settlement");
  return Boolean(secret && presented && safeEqual(presented, secret));
}
