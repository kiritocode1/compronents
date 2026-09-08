import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import {
  createOwnerSession,
  OWNER_COOKIE,
  OWNER_SESSION_SECONDS,
  requireSameOrigin,
  validOwnerSession,
} from "../src/lib/inspiration/auth.ts";
import { resourceId } from "../src/lib/inspiration/catalog.ts";
import { localDatabase, migrate } from "../src/lib/inspiration/db.ts";
import { handleInspiration } from "../src/lib/inspiration/http.ts";
import {
  chunkSource,
  claimJob,
  enqueue,
  fetchSource,
  publishSource,
} from "../src/lib/inspiration/ingest.ts";
import { retrieve } from "../src/lib/inspiration/retrieve.ts";
import {
  allResources,
  importCatalog,
  passagesFor,
  preferences,
  reserveUsage,
  savePreference,
} from "../src/lib/inspiration/store.ts";

const resource = (name, description) => ({
  id: resourceId(`https://example.com/${name}`),
  aliases: [`insp_${name}`],
  title: name,
  href: `https://example.com/${name}`,
  description,
  categories: ["Testing"],
  dateAdded: "2026-09-05",
  kind: ["tool"],
  stack: [],
  useFor: [],
  inferred: { kind: [], stack: [], useFor: [] },
});
const alpha = resource("Alpha", "A background job queue with retry support.");
const beta = resource("Beta", "A background job queue for scheduled work.");
const unrelated = resource("Palette", "A color palette collection.");
let db;
let directory;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "inspiration-db-test-"));
  db = await localDatabase(join(directory, "database"));
  await migrate(db);
  await importCatalog(db, [alpha, beta, unrelated]);
});
after(async () => {
  await db?.close();
  await rm(directory, { recursive: true, force: true });
});
const search = (query, owner = true, options = {}, dependencies = {}) =>
  retrieve({ query, ...options }, { owner }, { db, ...dependencies });
const pref = (resource, preference, overrides = {}) => ({
  resourceId: resource.id,
  contextKey: "",
  preference,
  rating: null,
  note: "",
  testedAt: null,
  revision: 0,
  ...overrides,
});

test("import is repeatable and data survives closing and reopening PostgreSQL", async () => {
  await importCatalog(db, [alpha, beta, unrelated]);
  assert.equal((await allResources(db)).length, 3);
  await db.close();
  db = await localDatabase(join(directory, "database"));
  assert.equal((await allResources(db)).length, 3);
  assert.equal((await search("Alpha")).hits[0]?.resource.id, alpha.id);
});

test("a second process cannot open the same local database", async () => {
  await assert.rejects(
    localDatabase(join(directory, "database")),
    /another process/,
  );
});

test("owner preference persists and stale writes conflict", async (t) => {
  t.after(() => db.query("DELETE FROM inspiration_preferences"));
  const saved = await savePreference(
    db,
    pref(alpha, "prefer", { rating: 5, note: "Private test note" }),
  );
  assert.equal(saved.revision, 1);
  await db.close();
  db = await localDatabase(join(directory, "database"));
  assert.equal((await preferences(db, ""))[0]?.note, "Private test note");
  await assert.rejects(
    savePreference(db, pref(alpha, "avoid")),
    (error) => error.status === 409,
  );
  assert.equal((await search("Alpha")).hits[0]?.preference.rating, 5);
  assert.ok(
    (await search("Alpha", false)).hits.every((hit) => !hit.preference),
  );
});

test("Avoid removes broad recommendations but preserves explicit lookup", async (t) => {
  t.after(() => db.query("DELETE FROM inspiration_preferences"));
  await savePreference(db, pref(alpha, "avoid", { rating: 5 }));
  assert.ok(
    (await search("job queue", true, { mode: "recommend" })).hits.every(
      (hit) => hit.resource.id !== alpha.id,
    ),
  );
  const exact = (await search("Alpha", true, { mode: "recommend" })).hits[0];
  assert.equal(exact?.resource.id, alpha.id);
  assert.match(exact.reasons.join(" "), /Avoid/);
  assert.doesNotMatch(exact.reasons.join(" "), /raised/);
});

test("scoped preference overrides global only in its own context", async (t) => {
  t.after(() => db.query("DELETE FROM inspiration_preferences"));
  await savePreference(db, pref(alpha, "avoid"));
  await savePreference(db, pref(alpha, "prefer", { contextKey: "backend" }));
  assert.ok(
    (await search("job queue", true, { contextKey: "backend" })).hits.some(
      (hit) => hit.resource.id === alpha.id,
    ),
  );
  assert.ok(
    (await search("job queue", true, { contextKey: "design" })).hits.every(
      (hit) => hit.resource.id !== alpha.id,
    ),
  );
});

test("a five-star unrelated favorite cannot enter recommendations", async (t) => {
  t.after(() => db.query("DELETE FROM inspiration_preferences"));
  await savePreference(db, pref(unrelated, "prefer", { rating: 5 }));
  assert.ok(
    (await search("job queue", true, { mode: "recommend" })).hits.every(
      (hit) => hit.resource.id !== unrelated.id,
    ),
  );
});

test("website API and retrieval return identical IDs for the same viewer and mode", async () => {
  const request = new Request(
    "https://compronents.localhost/api/inspiration/search?q=job+queue&mode=recommend",
  );
  const response = await handleInspiration(request, db);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const api = await response.json();
  assert.deepEqual(
    api.hits.map((hit) => hit.resource.id),
    (await search("job queue", false, { mode: "recommend" })).hits.map(
      (hit) => hit.resource.id,
    ),
  );
});

test("reader cookies and read tokens cannot write owner preferences", async () => {
  const url = "https://compronents.localhost/api/inspiration/preference";
  const body = JSON.stringify(pref(alpha, "prefer"));
  const token = randomBytes(32).toString("hex");
  const previous = process.env.INSPIRATION_MCP_TOKEN;
  process.env.INSPIRATION_MCP_TOKEN = token;
  try {
    for (const auth of [
      { Cookie: "inspiration_unlock=unlocked" },
      { Authorization: `Bearer ${token}` },
    ]) {
      const response = await handleInspiration(
        new Request(url, {
          method: "POST",
          headers: {
            ...auth,
            "Content-Type": "application/json",
            Origin: "https://compronents.localhost",
          },
          body,
        }),
        db,
      );
      assert.equal(response.status, 401);
    }
    const ownerCookie = `${OWNER_COOKIE}=${createOwnerSession()}`;
    const response = await handleInspiration(
      new Request(url, {
        method: "POST",
        headers: {
          Cookie: ownerCookie,
          "Content-Type": "application/json",
          Origin: "https://other.example",
        },
        body,
      }),
      db,
    );
    assert.equal(response.status, 403);
  } finally {
    if (previous === undefined) delete process.env.INSPIRATION_MCP_TOKEN;
    else process.env.INSPIRATION_MCP_TOKEN = previous;
  }
});

test("forged and expired owner sessions fail validation", () => {
  const now = Date.now();
  const token = createOwnerSession(now);
  assert.equal(validOwnerSession(token, now), true);
  assert.equal(validOwnerSession(`${token}x`, now), false);
  assert.equal(
    validOwnerSession(token, now + (OWNER_SESSION_SECONDS + 1) * 1000),
    false,
  );
  assert.equal(validOwnerSession("unlocked", now), false);
});

test("configured proxy origin permits owner writes and rejects forged forwarded origins", async (t) => {
  const previous = process.env.INSPIRATION_ORIGIN;
  process.env.INSPIRATION_ORIGIN = "https://compronents.localhost:1355";
  t.after(() => {
    if (previous === undefined) delete process.env.INSPIRATION_ORIGIN;
    else process.env.INSPIRATION_ORIGIN = previous;
  });
  t.after(() => db.query("DELETE FROM inspiration_preferences"));
  const url = "http://localhost:4597/api/inspiration/preference";
  const response = await handleInspiration(
    new Request(url, {
      method: "POST",
      headers: {
        Origin: process.env.INSPIRATION_ORIGIN,
        Cookie: `${OWNER_COOKIE}=${createOwnerSession()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pref(alpha, "prefer")),
    }),
    db,
  );
  assert.equal(response.status, 200);
  for (const origin of [
    undefined,
    "null",
    "https://foreign.example",
    "https://compronents.localhost:1356",
  ]) {
    assert.throws(
      () =>
        requireSameOrigin(
          new Request(url, {
            headers: {
              ...(origin ? { Origin: origin } : {}),
              "X-Forwarded-Host": "foreign.example",
              "X-Forwarded-Proto": "https",
            },
          }),
        ),
      (error) => error.status === 403,
    );
  }
});

test("portless public URL is accepted only in local development", (t) => {
  const saved = Object.fromEntries(
    ["INSPIRATION_ORIGIN", "PORTLESS_URL", "NODE_ENV", "VERCEL"].map((key) => [
      key,
      process.env[key],
    ]),
  );
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  delete process.env.INSPIRATION_ORIGIN;
  delete process.env.VERCEL;
  process.env.NODE_ENV = "development";
  process.env.PORTLESS_URL = "https://compronents.localhost:1355";
  const request = new Request("http://localhost:4597/api/inspiration/session", {
    headers: { Origin: process.env.PORTLESS_URL },
  });
  assert.doesNotThrow(() => requireSameOrigin(request));
  process.env.NODE_ENV = "production";
  assert.throws(
    () => requireSameOrigin(request),
    (error) => error.status === 403,
  );
});

test("semantic failure preserves PostgreSQL matches and stays quiet on local", async () => {
  const result = await search(
    "job queue",
    true,
    {},
    {
      semantic: async () => {
        throw new Error("fixture outage");
      },
    },
  );
  assert.equal(result.provider, "postgres");
  assert.equal(result.hits.length, 2);
  // Local PGlite has no embedding column, so the failure is expected, not news.
  assert.equal(result.notice, undefined);
  await assert.rejects(
    retrieve({ query: "job queue" }, { owner: true }, { db: null }),
    (error) => error.status === 503,
  );
});

test("gibberish never reaches semantic recall", async () => {
  // Cosine distance cannot separate nonsense from a real vague question: measured
  // against the live wall, "zzzqqxx wibblefrotz" scored 0.381 while "keep a job
  // going after the server dies halfway" scored 0.397. Corpus vocabulary can, so
  // an unrecognised query must not spend a query embedding or return neighbours.
  let called = 0;
  const result = await search("zzzqqxx wibblefrotz", true, {}, {
    semantic: async () => {
      called += 1;
      return [alpha.id];
    },
  });
  assert.equal(called, 0, "semantic ran for a query naming nothing on the wall");
  assert.equal(result.hits.length, 0);
});

test("recommend prefers verified matches and falls back to approximate ones", async () => {
  // "typography" is real vocabulary on the wall, so it clears the gate, but no
  // fixture resource mentions it. The only candidate is therefore the semantic one.
  const vague = await search("typography", true, { mode: "recommend" }, {
    semantic: async () => [alpha.id],
  });
  assert.equal(vague.hits[0]?.resource.id, alpha.id);
  assert.equal(vague.hits[0]?.match, "related", "approximate hits must say so");

  // "job queue" matches alpha and beta on text, so the semantic-only unrelated
  // suggestion must not dilute a recommendation that has verified answers.
  const solid = await search("job queue", true, { mode: "recommend" }, {
    semantic: async () => [unrelated.id],
  });
  assert.ok(solid.hits.length > 0);
  assert.ok(
    solid.hits.every((hit) => hit.match !== "related"),
    "a verified recommendation was padded with a semantic guess",
  );
});

test("usage reservations remain inside the limit under concurrent requests", async () => {
  const outcomes = await Promise.all(
    Array.from({ length: 20 }, () => reserveUsage(db, "test-budget", 2, 10)),
  );
  assert.equal(outcomes.filter(Boolean).length, 5);
  assert.equal(
    (
      await db.query(
        "SELECT requests FROM inspiration_usage WHERE bucket = 'test-budget'",
      )
    )[0].requests,
    10,
  );
});

test("source publication is searchable, rejects stale leases and retires old passages", async () => {
  await enqueue(db, alpha.id);
  const job = await claimJob(db);
  assert.equal(await claimJob(db), undefined);
  const first = chunkSource(
    "# First section\n\nA zebracorn example explains lease ownership.",
    alpha.id,
    alpha.href,
    "a".repeat(64),
    new Date().toISOString(),
  );
  await assert.rejects(
    publishSource(
      db,
      { ...job, lease_token: "stale" },
      first,
      "fixture://snapshot-a",
    ),
    /lease/,
  );
  await publishSource(db, job, first, "fixture://snapshot-a");
  const match = (await search("zebracorn")).hits[0];
  assert.equal(match?.resource.id, alpha.id);
  assert.equal(match.evidence[0].hash, first[0].hash);
  await enqueue(db, alpha.id);
  const next = await claimJob(db);
  const second = chunkSource(
    "# Replacement\n\nA silverotter example replaces the previous section.",
    alpha.id,
    alpha.href,
    "b".repeat(64),
    new Date().toISOString(),
  );
  await publishSource(db, next, second, "fixture://snapshot-b");
  assert.equal((await search("zebracorn")).hits.length, 0);
  assert.equal((await passagesFor(db, [alpha.id]))[0].hash, second[0].hash);
});

test("private network sources are rejected before a connection is opened", async () => {
  await assert.rejects(fetchSource("http://127.0.0.1/"), /non-public/);
  await assert.rejects(fetchSource("http://169.254.169.254/"), /non-public/);
});
