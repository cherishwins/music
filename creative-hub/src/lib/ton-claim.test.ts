/**
 * Run: pnpm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  findClaimableTonPayments,
  isTonPlanId,
  isUniqueViolation,
  parseTelegramId,
  type IncomingTonTransfer,
} from "./ton-claim";

const STARTER_NANOTONS = "500000000"; // 0.5 TON

function transfer(overrides: Partial<IncomingTonTransfer>): IncomingTonTransfer {
  return {
    hash: "hash-1",
    utime: 1_000,
    value: STARTER_NANOTONS,
    message: "creative-hub:starter:111:1700000000000",
    ...overrides,
  };
}

const claim = { planId: "starter" as const, telegramId: 111, notBefore: 0 };

test("a payment whose comment names the claimant is claimable", () => {
  const found = findClaimableTonPayments([transfer({})], claim);
  assert.deepEqual(found, [{ hash: "hash-1", nanotons: BigInt(STARTER_NANOTONS) }]);
});

test("someone else's payment cannot be claimed", () => {
  const victims = [transfer({ message: "creative-hub:starter:222:1700000000000" })];
  assert.deepEqual(findClaimableTonPayments(victims, claim), []);
  // The payer named in the comment can still claim it
  assert.equal(
    findClaimableTonPayments(victims, { ...claim, telegramId: 222 }).length,
    1
  );
});

test("comments that name nobody are never claimable", () => {
  for (const user of ["anon", "anonymous", "0", "", "0111", "111abc", "-111"]) {
    const found = findClaimableTonPayments(
      [transfer({ message: `creative-hub:starter:${user}:1700000000000` })],
      claim
    );
    assert.deepEqual(found, [], `comment user ${JSON.stringify(user)}`);
  }
});

test("wrong plan, short amount, stale or malformed transfers are skipped", () => {
  const transfers = [
    transfer({ hash: "plan", message: "creative-hub:creator:111:1" }),
    transfer({ hash: "short", value: "494999999" }),
    transfer({ hash: "old", utime: 10 }),
    transfer({ hash: "junk", value: "1e9" }),
    transfer({ hash: "nocomment", message: "" }),
    transfer({ hash: "ok", value: "495000000" }), // within 1%
  ];
  const found = findClaimableTonPayments(transfers, { ...claim, notBefore: 100 });
  assert.deepEqual(found.map((p) => p.hash), ["ok"]);
});

test("every matching payment is returned in order", () => {
  const found = findClaimableTonPayments(
    [transfer({ hash: "a" }), transfer({ hash: "b" })],
    claim
  );
  assert.deepEqual(found.map((p) => p.hash), ["a", "b"]);
});

test("parseTelegramId accepts only positive integers", () => {
  assert.equal(parseTelegramId(111), 111);
  assert.equal(parseTelegramId("111"), 111);
  for (const bad of [0, -1, 1.5, NaN, "0", "01", "1e3", " 1", "abc", null, undefined, {}]) {
    assert.equal(parseTelegramId(bad), null, `input ${String(bad)}`);
  }
  assert.equal(parseTelegramId(Number.MAX_SAFE_INTEGER + 1), null);
});

test("isTonPlanId rejects inherited object keys", () => {
  assert.equal(isTonPlanId("starter"), true);
  assert.equal(isTonPlanId("constructor"), false);
  assert.equal(isTonPlanId("toString"), false);
  assert.equal(isTonPlanId(1), false);
});

test("isUniqueViolation recognises libSQL errors, wrapped or not", () => {
  const libsql = Object.assign(
    new Error("SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: transactions.ton_transaction_hash"),
    { code: "SQLITE_CONSTRAINT" }
  );
  assert.equal(isUniqueViolation(libsql), true);
  assert.equal(isUniqueViolation(new Error("Failed query", { cause: libsql })), true);
  assert.equal(isUniqueViolation({ code: "SQLITE_CONSTRAINT_UNIQUE" }), true);
  assert.equal(isUniqueViolation(new Error("FOREIGN KEY constraint failed")), false);
  assert.equal(isUniqueViolation(new Error("network down")), false);
  assert.equal(isUniqueViolation(undefined), false);
});
