import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, test } from "node:test";
import { GET as registrySearch } from "../src/app/registry/search/route.ts";
import { resourceId } from "../src/lib/inspiration/catalog.ts";
import { compatibilityResponse } from "../src/lib/inspiration/compat.ts";
import { localDatabase, migrate } from "../src/lib/inspiration/db.ts";
import { handleInspiration } from "../src/lib/inspiration/http.ts";
import { researchWorkflow } from "../src/lib/inspiration/response.ts";
import { retrieve } from "../src/lib/inspiration/retrieve.ts";
import { importCatalog, savePreference } from "../src/lib/inspiration/store.ts";

const resource = {
  id: resourceId("https://example.com/research-library"),
  aliases: ["insp_research-library"],
  title: "Research library",
  href: "https://example.com/research-library",
  description: "A component library for command menus and settings pages.",
  categories: ["Component libraries and blocks"],
  dateAdded: "2026-09-22",
  kind: ["library"],
  stack: [],
  useFor: [],
  inferred: { kind: [], stack: [], useFor: [] },
};
let db;
const originalDb = globalThis.inspirationDatabase;
const originalToken = process.env.INSPIRATION_MCP_TOKEN;
const originalGateway = process.env.AI_GATEWAY_API_KEY;
const token = randomBytes(32).toString("hex");
const request = (path, owner = false) =>
  new Request(`https://example.com${path}`, {
    headers: owner ? { Authorization: `Bearer ${token}` } : {},
  });
before(async () => {
  db = await localDatabase();
  await migrate(db);
  await importCatalog(db, [resource]);
  await savePreference(db, {
    resourceId: resource.id,
    contextKey: "",
    preference: "prefer",
    rating: 5,
    note: "Private research fixture",
    testedAt: null,
    revision: 0,
  });
  globalThis.inspirationDatabase = Promise.resolve(db);
  process.env.INSPIRATION_MCP_TOKEN = token;
  delete process.env.AI_GATEWAY_API_KEY;
});
after(async () => {
  globalThis.inspirationDatabase = originalDb;
  for (const [key, value] of [
    ["INSPIRATION_MCP_TOKEN", originalToken],
    ["AI_GATEWAY_API_KEY", originalGateway],
  ]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  await db?.close();
});
function checkMarkdown(text, result) {
  for (const hit of result.hits) {
    assert.ok(text.includes(hit.resource.id));
    assert.ok(text.includes(hit.engagement.instruction));
    assert.ok(text.includes(hit.engagement.evidenceRequired));
  }
  for (const [key, instruction] of Object.entries(result.research)) {
    if (key !== "execution") assert.ok(text.includes(instruction), key);
  }
}

test("website search keeps ranking and private preferences while both formats deliver research guidance", async () => {
  for (const owner of [false, true]) {
    const base = await retrieve(
      { query: "Research library" },
      { owner },
      { db },
    );
    const response = await handleInspiration(
      request("/api/inspiration/search?q=Research+library", owner),
      db,
    );
    assert.match(response.headers.get("content-type"), /application\/json/);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("vary"), "Cookie, Authorization");
    const json = await response.json();
    assert.equal(json.hits.length, 1);
    assert.deepEqual(
      json.hits.map(({ engagement, ...hit }) => hit),
      base.hits,
    );
    assert.deepEqual(json.research, researchWorkflow);
    assert.equal(json.hits[0].engagement.mode, "search-source-catalog");
    const markdownResponse = await handleInspiration(
      request(
        "/api/inspiration/search?q=Research+library&format=markdown",
        owner,
      ),
      db,
    );
    assert.match(
      markdownResponse.headers.get("content-type"),
      /text\/markdown/,
    );
    const markdown = await markdownResponse.text();
    checkMarkdown(markdown, json);
    assert.equal(markdown.includes("Private research fixture"), owner);
  }
});

test("joint lookup, discovery and recommendations deliver the same evidence contract", async () => {
  for (const mode of ["recommend", "discover"]) {
    const jsonResponse = await compatibilityResponse(
      request("/direction?q=command+menu&format=json"),
      mode,
      true,
    );
    assert.equal(jsonResponse.status, 200);
    const json = await jsonResponse.json();
    assert.ok(json.registry.length > 0);
    const markdown = await (
      await compatibilityResponse(
        request("/direction?q=command+menu"),
        mode,
        true,
      )
    ).text();
    checkMarkdown(markdown, json.wall);
    for (const hit of json.registry) {
      assert.ok(markdown.includes(hit.engagement.instruction));
      assert.ok(markdown.includes(hit.engagement.evidenceRequired));
      assert.ok(markdown.includes(hit.install));
    }
  }
});

test("registry route keeps install commands and emits guidance in either format", async () => {
  const json = await registrySearch(
    request("/registry/search?q=command+menu&format=json"),
  ).json();
  const markdown = await registrySearch(
    request("/registry/search?q=command+menu"),
  ).text();
  assert.ok(json.hits.length > 0);
  assert.deepEqual(json.research, researchWorkflow);
  for (const hit of json.hits) {
    assert.equal(hit.engagement.mode, "inspect-install-run");
    assert.ok(markdown.includes(hit.install));
    assert.ok(markdown.includes(hit.engagement.evidenceRequired));
  }
});

test("inspection labels stored evidence and retains its owner access boundary", async () => {
  const path = `/api/inspiration/inspect?id=${resource.id}`;
  assert.equal((await handleInspiration(request(path), db)).status, 401);
  const result = await (
    await handleInspiration(request(path, true), db)
  ).json();
  assert.equal(result.resource.id, resource.id);
  assert.match(result.inspection, /Stored passages only/);
  assert.equal(result.engagement.mode, "search-source-catalog");
  assert.equal(result.preference.note, "Private research fixture");
  assert.deepEqual(result.research, researchWorkflow);
});
