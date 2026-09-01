import { createHash, randomBytes } from "node:crypto";

/**
 * The contract shared with the mint-me app, which owns the `registry_tokens`
 * table. These three functions are duplicated verbatim there.
 *
 * Changing any constant here invalidates every token already in circulation, so
 * tests/token-contract.test.mjs pins the format and a known digest in both
 * repos. If the copies ever drift, those tests fail rather than every install
 * silently returning 401.
 */
export const TOKEN_PREFIX = "blank_";
export const TOKEN_BYTES = 20;

/** A fresh raw token. Shown to the operator once, never persisted. */
export function mintRawToken() {
  return `${TOKEN_PREFIX}${randomBytes(TOKEN_BYTES).toString("hex")}`;
}

/** The only derivation of a token that reaches the database. */
export function hashToken(raw: string) {
  return createHash("sha256").update(raw.trim(), "utf8").digest("hex");
}

/** Short, non-secret fragment so a row stays identifiable in the dashboard. */
export function tokenPrefix(raw: string) {
  return raw.trim().slice(0, TOKEN_PREFIX.length + 6);
}
