/**
 * Noul gate substitute. The CLI's `noul` command hardcodes
 * JEV_MODEL = "typesafe-ai/jev" in src/lib/inspiration/judge.ts, which the
 * gateway rejects on plan-gated accounts ("Free tier users do not have access
 * to this model"). This script replicates the CLI noul flow exactly (same
 * evidence, same three questions, same 0.5 threshold via judgeInspo) and
 * probes gateway decision models cheapest-first for the first accessible one,
 * printing which model judged. When the account gains jev access, prefer the
 * real `noul` command; the candidates below keep it working until then.
 *
 * Usage (under the production wrapper):
 *   node --import ./tests/alias-hooks.mjs scripts/inspiration-noul-substitute.mjs <url> [url...]
 */
import { getInspirationDatabase } from "../src/lib/inspiration/db.ts";
import { judgeInspo } from "../src/lib/inspiration/judge.ts";
import { retrieve } from "../src/lib/inspiration/retrieve.ts";
import { passagesFor, resolveResource } from "../src/lib/inspiration/store.ts";

const urls = process.argv.slice(2);
if (urls.length === 0)
  throw new Error(
    "Usage: node scripts/inspiration-noul-substitute.mjs <url> [url...]",
  );

// Gateway decision models from /config (see scripts/inspiration-eval-models.mjs),
// cheapest first. Plan-gated jev variants sit last as a fallback.
const CANDIDATES = [
  "convaiinnovations/laya",
  "perplexity/pplx-decider-flash-v1.2",
  "liquid/d1",
  "perplexity/pplx-decider-v1.2",
  "baseten/elephant-1",
  "liquid/d1-ultra",
  "microsoft/microsoft-decision-1",
  "typesafe-ai/jev",
  "typesafe-ai/jev-1.13.0",
  "typesafe-ai/jev-1.14.0",
  "scaledown/scaledown-classify-1",
  "baseten/mammoth-1",
  "openai/gpt-6-luna-decisions",
];

async function findModel() {
  const { experimental_evaluate: evaluate } = await import("ai");
  for (const model of CANDIDATES) {
    try {
      const probe = await evaluate({
        model,
        state: "Title: probe\nURL: https://example.com",
        questions: {
          probe: { type: "boolean", instructions: "Answer true." },
        },
      });
      const p = probe.answers.probe?.probability;
      if (typeof p === "number") return model;
    } catch (err) {
      console.error(
        `probe failed for ${model}: ${String(err.message || err).slice(0, 120)}`,
      );
    }
  }
  throw new Error("No accessible gateway decision model found.");
}

const model = await findModel();
console.log("judge model (substitute):", model);
const { experimental_evaluate: evaluate } = await import("ai");

const db = await getInspirationDatabase();
if (!db) throw new Error("No inspiration database configured.");

for (const url of urls) {
  const target = await resolveResource(db, url);
  if (!target) throw new Error(`Resource not found: ${url}`);
  const evidence = await passagesFor(db, [target.id]);
  const exact = await retrieve(
    { query: target.title, mode: "search", limit: 5 },
    { owner: true },
    { db },
  );
  const exactAt = exact.hits.findIndex((hit) => hit.resource.id === target.id);
  const intentRanks = [];
  for (const intent of target.useFor.slice(0, 2)) {
    const found = await retrieve(
      { query: intent, mode: "recommend", limit: 3 },
      { owner: true },
      { db },
    );
    const rank = found.hits.findIndex((hit) => hit.resource.id === target.id);
    intentRanks.push({
      intent,
      rank: rank === -1 ? null : rank + 1,
      topTitle: found.hits[0]?.resource.title ?? "",
    });
  }
  const verdict = await judgeInspo(
    {
      title: target.title,
      href: target.href,
      description: target.description,
      kind: target.kind,
      stack: target.stack,
      useFor: target.useFor,
      license: target.license ?? "unknown",
      categories: target.categories,
      dateAdded: target.dateAdded,
      exactRank: exactAt === -1 ? null : exactAt + 1,
      intentRanks,
      passageCount: evidence.length,
      firstPassageHeading: evidence[0]?.heading ?? "",
    },
    (input) => evaluate({ ...input, model }),
  );
  console.log(`\n== ${url}`);
  console.log(JSON.stringify(verdict.verdicts, null, 2));
  console.log("pass:", verdict.pass);
}
