// Diagnostic acceptance cases over the real catalog. These are not a held-out benchmark.
// Run with node --import ./tests/alias-hooks.mjs --test tests/inspiration-retrieval-quality.test.mjs
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { localDatabase, migrate } from "../src/lib/inspiration/db.ts";
import { retrieve } from "../src/lib/inspiration/retrieve.ts";
import { importCatalog } from "../src/lib/inspiration/store.ts";

let db;
before(async () => {
  db = await localDatabase();
  await migrate(db);
  await importCatalog(db);
});
after(async () => {
  await db?.close();
});
const search = (query) =>
  retrieve({ query, limit: 5 }, { owner: false }, { db });
const titles = (result) => result.hits.map((hit) => hit.resource.title);

for (const title of [
  "Orama",
  "React Native RAG",
  "Animate UI icons",
  "Fonts In Use",
  "Domain SDK",
  "Invoicely",
  "Spritesheet pointer translate (jhey)",
]) {
  test(`exact title ranks first: ${title}`, async () => {
    assert.equal(titles(await search(title))[0], title);
  });
}

test("spriteshet typo retrieves the spritesheet reference first", async () => {
  assert.equal(
    titles(await search("spriteshet"))[0],
    "Spritesheet pointer translate (jhey)",
  );
});

test("font pairing retrieves a dedicated pairing resource", async () => {
  const hits = titles(await search("font pairing"));
  assert.ok(
    hits.some((title) =>
      ["Font Trio pairs", "Fontshare pairs", "Fontastic"].includes(title),
    ),
    hits.join(", "),
  );
});

test("hybrid search retains Orama and turbopuffer", async () => {
  const hits = titles(await search("hybrid search"));
  assert.ok(
    hits.includes("Orama") && hits.includes("turbopuffer"),
    hits.join(", "),
  );
});

test("RAG retrieval keeps a resource explicitly about RAG", async () => {
  const hits = titles(await search("RAG retrieval"));
  assert.ok(
    hits.some((title) =>
      ["React Native RAG", "Chroma", "Orama", "code-chunk"].includes(title),
    ),
    `Returned: ${hits.join(", ") || "nothing"}`,
  );
});

test("React Query caching leads with React Query expertise", async () => {
  const hits = titles(await search("react query caching"));
  assert.ok(
    ["TkDodo's blog", "TanStack"].includes(hits[0]),
    `Returned first: ${hits[0]}`,
  );
});

test("studying LLM internals keeps an LLM explanation", async () => {
  const hits = titles(await search("study how llms are designed internally"));
  assert.ok(
    hits.some((title) =>
      [
        "How LLMs actually work",
        "LLM Architecture Gallery",
        "LLM Visualization",
      ].includes(title),
    ),
    `Returned: ${hits.join(", ") || "nothing"}`,
  );
});

test("less vibe coded preserves the established interface-craft intent", async () => {
  const hits = titles(await search("less vibe coded"));
  assert.ok(
    hits.some((title) =>
      [
        "Vercel Web Interface Guidelines",
        "Interfaces.dev",
        "Designing Depth",
        "Impeccable",
      ].includes(title),
    ),
    `Returned: ${hits.join(", ") || "nothing"}`,
  );
});

test("without React excludes the explicitly React-only Animate Icons package", async () => {
  const result = await retrieve(
    { query: "animated icons without React", limit: 50 },
    { owner: false },
    { db },
  );
  const hits = titles(result);
  assert.ok(
    !hits.includes("Animate Icons"),
    `React-only Animate Icons was returned: ${hits.join(", ")}`,
  );
  assert.ok(
    hits.includes("lucide-motion-vue") || hits.includes("Material Line Icons"),
    hits.join(", "),
  );
  for (const hit of result.hits) {
    assert.doesNotMatch(
      [hit.resource.description, ...hit.resource.stack].join(" "),
      /\b(?:react|shadcn)\b/i,
      hit.resource.title,
    );
  }
});

test("recommendation mode also recovers design-craft intent", async () => {
  const hits = titles(
    await retrieve(
      { query: "less vibe coded", mode: "recommend" },
      { owner: false },
      { db },
    ),
  );
  assert.ok(hits.length > 0);
  assert.ok(
    hits.every((title) => !/VibeIndex|Vibe coding/.test(title)),
    hits.join(", "),
  );
});

test("grain typo uses texture context instead of a research grant", async () => {
  const hits = titles(await search("grann texture"));
  assert.equal(hits[0], "Grainrad");
  assert.ok(!hits.includes("V8 research grant"));
});

test("React Native workers require the worker subject", async () => {
  const hits = titles(await search("react native worker"));
  assert.equal(hits[0], "React Native Workers");
  assert.ok(!hits.includes("react-native-system-navigation-bar"));
  assert.ok(!hits.includes("Satori"));
});

test("self-hosted analytics does not recommend a generic hosting explainer", async () => {
  const hits = titles(await search("self hosted analytics"));
  assert.ok(
    hits.some((title) => ["Slash", "YOURLS"].includes(title)),
    hits.join(", "),
  );
  assert.ok(!hits.some((title) => title.includes("Next.js hosting")));
});

test("Linear design intent rejects gradients and a database with Linear as a customer", async () => {
  const hits = titles(await search("like linear"));
  assert.ok(hits.includes("Refero Styles"), hits.join(", "));
  assert.ok(
    hits.every(
      (title) =>
        ![
          "GRADIENTOOL",
          "Understanding Gradients",
          "turbopuffer",
          "Fanout",
        ].includes(title),
    ),
    hits.join(", "),
  );
});

test("quiet motion keeps the motion requirement when expanding the setting", async () => {
  const hits = titles(await search("quiet motion for a dense issue tracker"));
  assert.ok(
    hits.some((title) => ["Iconiqui", "Rauno Freiberg on X"].includes(title)),
    hits.join(", "),
  );
  assert.ok(!hits.includes("Wall of Portfolios"));
});

test("an explicit static-only description does not count as animated", async () => {
  const result = await retrieve(
    { query: "animated icons", limit: 50 },
    { owner: false },
    { db },
  );
  assert.ok(!titles(result).includes("Eva Icons"));
});

test("Vue and a middle exclusion survive query rewriting", async () => {
  const hits = titles(await search("animated icons without React for Vue"));
  assert.equal(hits[0], "lucide-motion-vue");
  assert.ok(!hits.includes("Animate Icons"));
});

test("absent technologies and nonsense queries stay empty", async () => {
  for (const query of [
    "pgvector",
    "zzzqqxx wibblefrotz",
    "Python vector database not UI components",
  ]) {
    assert.equal((await search(query)).hits.length, 0, query);
  }
});
