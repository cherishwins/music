/**
 * Which on-chain TON payments a user may claim credits for.
 *
 * Pure functions, no network or database, so the rules can be tested alone.
 * The payment comment is written into the transfer by the payer's wallet
 * (`creative-hub:<planId>:<telegramId>:<timestamp>`), so it is the only
 * thing that says who a payment is for. Credits go to that user, never to
 * whoever happens to ask first.
 */

import { parsePaymentComment, TON_PRICING, type TonPlanId } from "./ton";

export interface IncomingTonTransfer {
  hash: string;
  utime: number;
  /** nanotons, as a decimal string */
  value: string;
  /** decoded text comment, if any */
  message: string;
}

export interface ClaimableTonPayment {
  hash: string;
  nanotons: bigint;
}

export function isTonPlanId(value: unknown): value is TonPlanId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(TON_PRICING, value)
  );
}

/**
 * A Telegram user id: a positive safe integer. Accepts a number or its
 * canonical decimal string; anything else (0, "anon", "007", "12abc") is null.
 */
export function parseTelegramId(raw: unknown): number | null {
  let id: number;
  if (typeof raw === "number") {
    id = raw;
  } else if (typeof raw === "string" && /^[1-9][0-9]*$/.test(raw)) {
    id = Number(raw);
  } else {
    return null;
  }
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Transfers that pay for `planId` and whose comment names `telegramId`,
 * in the order given. A transfer whose comment names anyone else, or
 * nobody, is never returned.
 */
export function findClaimableTonPayments(
  transfers: IncomingTonTransfer[],
  claim: { planId: TonPlanId; telegramId: number; notBefore: number }
): ClaimableTonPayment[] {
  const plan = TON_PRICING[claim.planId];
  const expectedNanotons = BigInt(Math.round(parseFloat(plan.ton) * 1e9));
  // Allow 1% under the price for wallet rounding
  const minNanotons = (expectedNanotons * BigInt(99)) / BigInt(100);
  const claimant = String(claim.telegramId);

  const matches: ClaimableTonPayment[] = [];
  for (const transfer of transfers) {
    if (transfer.utime < claim.notBefore) continue;
    if (!/^[0-9]+$/.test(transfer.value)) continue;

    const nanotons = BigInt(transfer.value);
    if (nanotons < minNanotons) continue;

    const parsed = parsePaymentComment(transfer.message);
    if (!parsed) continue;
    if (parsed.planId !== claim.planId) continue;
    // The comment must name exactly the user being credited
    if (parseTelegramId(parsed.userId) === null) continue;
    if (parsed.userId !== claimant) continue;

    matches.push({ hash: transfer.hash, nanotons });
  }
  return matches;
}

/**
 * True when a database error is a UNIQUE constraint violation (libSQL,
 * possibly wrapped by Drizzle in `cause`).
 */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth++) {
    const err = current as { code?: unknown; message?: unknown; cause?: unknown };
    if (typeof err.code === "string" && err.code.startsWith("SQLITE_CONSTRAINT_UNIQUE")) {
      return true;
    }
    if (typeof err.message === "string" && err.message.includes("UNIQUE constraint failed")) {
      return true;
    }
    current = err.cause;
  }
  return false;
}
