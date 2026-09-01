import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hashToken,
  mintRawToken,
  TOKEN_PREFIX,
  tokenPrefix,
} from "../src/lib/token-contract.ts";

// This file is duplicated verbatim in the compronents repo, which reads the
// same registry_tokens table. It pins the wire contract between the two apps:
// if either side changes the token format or the hash, its own suite fails here
// instead of every registry install silently returning 401.

const VECTOR = "blank_00112233445566778899aabbccddeeff00112233";
const DIGEST =
  "6b1428659d50fa521ae018b0fa9d9fbd48ed0d1b4bb15cc708d03b783701077f";

test("token format is blank_ plus 40 lowercase hex", () => {
  const raw = mintRawToken();
  assert.match(raw, /^blank_[0-9a-f]{40}$/);
  assert.equal(raw.length, TOKEN_PREFIX.length + 40);
});

test("hash of the pinned vector never changes", () => {
  assert.equal(hashToken(VECTOR), DIGEST);
});

test("hashing trims, so a copied token with stray whitespace still resolves", () => {
  assert.equal(hashToken(`  ${VECTOR}\n`), DIGEST);
});

test("displayed prefix is short and not the whole secret", () => {
  const raw = mintRawToken();
  assert.equal(tokenPrefix(raw).length, TOKEN_PREFIX.length + 6);
  assert.ok(!raw.startsWith(tokenPrefix(raw) + raw.slice(-1)));
});

test("two tokens never collide", () => {
  const seen = new Set(Array.from({ length: 500 }, () => mintRawToken()));
  assert.equal(seen.size, 500);
});
