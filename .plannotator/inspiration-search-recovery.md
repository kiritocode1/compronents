# Faster search with measured relevance

Search became slower, and passing hand-picked tests did not establish better results.
Keep the hosted database for saved links and preferences; serve search from a prepared lexical index and verified source content.
Ship only after a judged query set beats both previous search versions and the deployed owner workflow passes.

```text
Database -> Prepared index -> Candidate IDs -> Current records -> Results
```

The picture shows retrieval. Catalog imports and source extraction update the index separately.

## What we have verified

- The old browser search used `buildInspirationIndex` and `rankExpanded` over the catalog already present on the page. The current page submits an HTTP request instead.
- The new database ranker took 217 ms median and 254 ms p95 in the earlier warm local sample, compared with 195 ms and 211 ms before its latest fixes. These numbers compare two database versions, not the old browser experience.
- `retrieve.ts` runs three or four candidate queries, hydrates resources, reads passages, then reads preferences. It also repeats token coverage calculations over candidate descriptions. Measure each phase before assigning blame to SQL or JavaScript.
- All 39 focused tests pass. Wider probes still produced poor results for `scroll driven animation`, `typescript schema validation`, `font identification`, and `redis queue monitoring`.
- The hosted database now contains 1,348 resources and no extracted passages. Keyword matching cannot recover facts that were never indexed.
- Production sign-in failed because the deployment lacked the database and owner-session configuration. A successful fallback search response did not prove production readiness.

The production connection uses the existing Vercel Neon integration. Search redesign does not require a new subscription.

## Files and responsibilities

| File | Today | After |
| --- | --- | --- |
| `tests/fixtures/inspiration-judgments.json` | Missing | Versioned queries with graded resource relevance, constraint labels, source evidence and a fixed tuning/holdout split |
| `scripts/inspiration-evaluate.mjs` | Missing | Compare old BM25, current PostgreSQL and the candidate implementation on the same corpus; emit quality, phase timing and end-to-end reports |
| `src/lib/inspiration/lexical.ts` | Missing | Compile explicit fields into term statistics and postings once per database revision; reuse the incumbent BM25 formula without inferred capability boosts |
| `src/lib/inspiration/retrieve.ts` | Repeated SQL candidate requests and per-result text processing | Obtain bounded candidate IDs from the prepared index, then hydrate active records, matching passages and current preferences in one database request |
| `src/lib/inspiration/query.ts` | Hard-coded rewrites and text-based technology constraints | Preserve literals and exclusions; use verified required frameworks and optional adapters instead of treating every technology mention as a dependency |
| `src/lib/inspiration/types.ts` | Explicit and inferred fields are separate, but dependency requirements are absent | Add evidence-backed capabilities with `required`, `optional`, or `unknown` support |
| `src/lib/inspiration/schema.ts` | No catalog-wide revision | Add a search revision incremented in the same transaction as searchable writes |
| `src/lib/inspiration/store.ts` | Batch catalog import and separate resource/preference reads | Publish revisions with imports, hydrate a shortlist in one query, and support revision-checked per-resource writes for agents |
| `src/lib/inspiration/ingest.ts` | Bounded extractor and retained source versions, with no backfill | Backfill a reviewed set of 30 useful sources and invalidate the index on successful publication |
| `src/app/inspiration/page.tsx` | Browse uses the TypeScript catalog | Read the database browse snapshot with explicit catalog fallback and a revision |
| `src/components/site/inspiration-index.tsx` | Submit-only remote search | Immediate local title suggestions, plus the authoritative result list from the API; cancel obsolete requests and retain the previous list while loading |
| `src/lib/inspiration/http.ts` | Search, sessions, preferences and feedback | Add a small readiness response and the shared browse reader; return provider/degradation state consistently |
| `scripts/inspiration.mjs` | Whole-catalog imports | Add a validated, idempotent single-resource upsert and a revision-conflict error |
| `.claude/commands/inspo.md` | Requires catalog edit plus verified hosted import | Use single-resource database writes once browse is database-backed; generate the catalog fallback from a reviewed export |
| `docs/inspiration-verification.md` | Setup commands and focused checks | Include reproducible performance runs, judged evaluation, deployed readiness and rollback checks |

`src/lib/inspiration-rank.ts` remains available as the historical baseline. Website and MCP continue to call the same retrieval service with the same viewer, filters and mode.

## 1. Establish the comparison before tuning

Freeze the corpus and query set first. Use 60 queries: 10 exact names/URLs/citations, 10 typos, 15 concrete capability requests, 10 natural-language requests, 5 style requests, and 10 negative or unsupported requests. Reserve 20 as a holdout. Once inspected for tuning, those 20 cease to be a holdout and must be replaced.

Judge the pooled top ten from all three engines against the actual sources. Grade each result 0 for irrelevant, 1 for adjacent, 2 for useful, and 3 for a direct answer. Record hard constraint violations separately. An empty query with no relevant catalog entry is a correct abstention, not a retrieval failure. Keep the user's examples in the tuning set and show the judged result cards for review before adjusting weights.

Example fixture shape, with the grade verified against the linked source:

```json
{
  "query": "react query caching",
  "split": "tuning",
  "mode": "recommend",
  "judgments": [{
    "resourceId": "res_95e84bc9f8f5803ec3d1a7ab",
    "grade": 3,
    "sourceUrl": "https://tkdodo.eu/blog/all",
    "reason": "Maintainer explanations of React Query caching"
  }],
  "constraints": []
}
```

Run five randomized warm passes and at least ten independent cold starts. Report p50/p95 separately for index build, query analysis, candidates, database round trips, ranking and browser input-to-results. Run all engines on the same hardware and corpus, then measure deployed HTTP latency from the same client location. Keep index-build time out of warm query time, but report it explicitly.

## 2. Compile lexical work once

Use the existing BM25 formula and tokenizer as the starting point. Index title, URL, explicit use cases and descriptions in separate weighted fields. Keep category/style context separate from capability evidence. Build postings and term frequencies once instead of re-tokenizing complete descriptions inside every coverage calculation.

The first implementation keeps at most 120 candidate resources. Exact IDs, aliases and URLs have their own lookup. Only invoke bounded spelling correction when an input term is absent from the vocabulary. Preserve the original query alongside any correction. Do not apply whole-description trigram scoring to every query.

```diff
- const [fts, fuzzy, source, constrained] = await lexicalCandidates(db, ...);
- const rows = await db.query(resourceHydrationSql, [ids, text]);
- passages = await passagesFor(db, resources.map(r => r.id), text);
- personal = effectivePreferences(await preferences(db, context), context);
+ const index = await getLexicalIndex(db);
+ const ids = index.candidates(query, { limit: 120 });
+ const current = await hydrateCandidates(db, ids, query, viewer, context);
+ return rankEligible(current, query);
```

`getLexicalIndex` checks a database revision at most once every five seconds per process and coalesces concurrent rebuilds. A cold process loads the index once. Hydration always checks active resources and current preferences, so stale candidate IDs cannot expose deleted resources or ignore Avoid. If a record or passage has changed since indexing, discard its cached score and evaluate its current content. New additions become searchable within five seconds; `/inspo` waits for the deployed exact lookup before reporting completion.

Index rebuild failure keeps the previous index only while database hydration remains available. If the database is down, owner requests fail explicitly; anonymous search retains the labeled catalog fallback. A revision check failure must not reset the cache expiry or indefinitely postpone a rebuild.

## 3. Fix content and constraints before adding semantic retrieval

Backfill 30 sources selected from misses in the tuning set. Preserve headings and enough adjacent context to interpret each passage. Inspect extraction for navigation text and missing context before calling it evidence. Failed fetches retain the previous successful version.

From wall: [Building a web search engine from scratch](https://blog.wilsonl.in/search-engine/), `insp_building-a-web-search-engine-from-scratch-blog`. Adapt its context-preserving passage extraction and concrete query/answer examples. Reject its large-scale crawler and custom storage architecture for this 1,348-resource catalog.

Represent technology requirements from inspected evidence:

```ts
type Capability = {
  technology: string;
  support: "required" | "optional" | "unknown";
  sourceUrl: string;
  excerpt: string;
};
```

For `without React`, reject a verified required React dependency. An optional React adapter does not disqualify a framework-independent tool. An unknown requirement cannot establish a strict recommendation; keep it available for inspection with that uncertainty. A query mentioning React Native must retain that phrase as a unit.

Do not add more one-off rewrites to satisfy the holdout. Measure source recall and constraint correctness before enabling the already-supported Upstash experiment. Semantic candidates still require current resource hydration and factual eligibility.

## 4. Make database authoring complete

Switch browse and per-resource writes together. Until that change lands, the updated `/inspo` workflow must continue the source edit plus hosted import.

```diff
- edit src/lib/inspiration.ts
- pnpm inspiration:production import
+ pnpm inspiration:production upsert /tmp/inspiration-entry.json --dry-run
+ pnpm inspiration:production upsert /tmp/inspiration-entry.json --expected-revision 0
+ pnpm inspiration:production inspect <resource-id>
```

A transaction writes the resource, aliases and search revision. Repeating the same canonical URL updates the existing identity. A stale revision returns a conflict without overwriting another agent's work. Generate a catalog fallback snapshot from reviewed database records so a deploy does not overwrite database-only edits. Preferences remain outside public snapshots.

## Release gates

These are proposed acceptance criteria, not measurements already achieved:

- All exact lookups rank first, and no strict recommendation violates a verified framework exclusion.
- Holdout nDCG@5 improves by at least 10% relative to the stronger baseline. Report raw values, per-query changes and bootstrap uncertainty; investigate every grade-3 result lost from the top five.
- Unsupported-query false positives do not increase. Judge exact relevance separately from bounded discovery.
- Warm ranking CPU p95 is at most 25 ms. Deployed submitted-search p95 is at least 30% faster than the current deployed database path. Local title suggestions appear within 50 ms. Report cold starts separately with a proposed 1.5-second p95 ceiling.
- API, compatibility routes and MCP return identical IDs for identical inputs and viewer. Preferences take effect on the next request, and new imports pass the five-second visibility requirement.
- Deployed readiness proves database connectivity, migration state, owner sign-in, preference persistence and sign-out. Tests restore the previous preference values.

Keep the current PostgreSQL ranker behind an explicit `INSPIRATION_SEARCH_ENGINE=postgres|lexical` switch during evaluation. Enable lexical search in a preview first and compare the actual browser flow. Review the diff before production. Roll back the flag if quality or speed fails; keep the database and saved preferences intact.

## Excluded scope

No paid reranker, new provider subscription, full-catalog crawl, community voting, automatic taxonomy rewrite, or mass deletion. No claim that embeddings alone fix missing content. No production ranking switch just because the unit tests pass.

This is the next implementation plan. The current hosted connection and `/inspo` production import are separate readiness work; they do not establish that relevance or speed improved.
