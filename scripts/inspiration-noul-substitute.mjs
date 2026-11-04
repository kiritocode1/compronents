/**
 * Noul gate substitute. The CLI's `noul` command judges with JUDGE_MODEL in
 * src/lib/inspiration/judge.ts. This script replicates that flow exactly
 * (same evidence, same three questions, same 0.5 threshold via judgeInspo)
 * but probes the candidates below for the first accessible one, printing
 * which model judged. Use it when JUDGE_MODEL itself is refused or down.
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
// best judge first: ordered by how far apart they scored a true and a false
// description (2026-11-04). Only models the free tier can call: liquid/d1,
// microsoft/microsoft-decision-1, openai/gpt-6-luna-decisions and the three
// typesafe-ai/jev versions all return 403 "Free tier users do not have access
// to this model", so they are left out until the team has credits.
const CANDIDATES = [
  "perplexity/pplx-decider-v1.2",
  "baseten/mammoth-1",
  "convaiinnovations/laya",
  "liquid/d1-ultra",
  "perplexity/pplx-decider-flash-v1.2",
  "baseten/elephant-1",
  "scaledown/scaledown-classify-1",
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
