/**
 * Run: pnpm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import { resolveX402Network } from "./x402-network";

const payTo = "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54";

test("off unless a network and a pay-to address are configured", () => {
  assert.equal(resolveX402Network({}), null);
  assert.equal(resolveX402Network({ payTo }), null);
  assert.equal(resolveX402Network({ network: "base" }), null);
  assert.equal(resolveX402Network({ network: "base", payTo: "not-an-address" }), null);
  assert.equal(resolveX402Network({ network: "ethereum", payTo }), null);
});

test("Base mainnet when explicitly configured, in any environment", () => {
  assert.equal(resolveX402Network({ network: "base", payTo, vercelEnv: "production" }), "base");
  assert.equal(resolveX402Network({ network: "base", payTo, nodeEnv: "development" }), "base");
});

test("testnet is never offered in production", () => {
  const sepolia = { network: "base-sepolia", payTo };
  assert.equal(resolveX402Network({ ...sepolia, vercelEnv: "production", nodeEnv: "production" }), null);
  assert.equal(resolveX402Network({ ...sepolia, nodeEnv: "production" }), null);
  // Explicitly configured dev and preview deployments keep it
  assert.equal(resolveX402Network({ ...sepolia, nodeEnv: "development" }), "base-sepolia");
  assert.equal(
    resolveX402Network({ ...sepolia, vercelEnv: "preview", nodeEnv: "production" }),
    "base-sepolia"
  );
});
