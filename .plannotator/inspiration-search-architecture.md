# BLANK inspiration search architecture

## Goal

Today, useful resources disappear or rank for incidental words, and agents cannot read your preferences or supporting source passages.
After this change, the website and MCP share one search service over resource cards, source evidence, and your personal ratings.
We prove improvement with judged queries, exact citation checks, preference tests, and an outage drill before switching production.

## Shape

```text
today   Catalog blurbs -> Separate rankers -> Links
after   Cards + evidence -> Shared search + your preferences -> Supported picks
```

Recommendation: keep the app on Vercel, use Neon for authoritative data and Upstash Search as a replaceable search index. Store source snapshots in private Vercel Blob. Start with free allowances and standard search, with paid inference disabled. Your preferences come first; there are no community ratings in this design.

## File responsibilities

These are the proposed change-bearing files, not changes already made. The retrieval modules also own their existing unit-test updates.

| File | Today | After |
| --- | --- | --- |
| `src/lib/inspiration.ts` | 1,350 catalog entries in TypeScript | One-time import source and legacy rollback data; live edits move to the database at cutover |
| `migrations/001-inspiration.sql` | Absent | Catalog, sources, passages, preferences, jobs, query feedback, indexes and revision records |
| `src/lib/inspiration-store.ts` | Absent | Owns catalog SQL, title/URL lookup, full-text fallback, preference writes and job claims |
| `src/lib/inspiration-retrieval.ts` | Absent | One typed request/result contract, candidate merge, eligibility and personalization |
| `src/lib/inspiration-search-provider.ts` | Absent | Upstash adapter, document serialization, timeouts and usage reservation |
| `src/lib/inspiration-ingest.ts` | Absent | Fetch, extract, chunk, snapshot, index and retry with durable progress |
| `src/lib/inspiration-search.ts` | Raw BM25 wall search | Compatibility entry into shared retrieval with search policy |
| `src/lib/inspiration-recommend.ts` | Expansion and several score cutoffs | Shared retrieval with strict recommendation policy and evidence |
| `src/lib/inspiration-discover.ts` | Diversifies expanded lexical hits | Diversifies eligible shared candidates without manufacturing confidence |
| `src/lib/inspiration-browse.ts` | Browser Fuse plus BM25 and grouped ranking | Category/date browsing and lightweight title suggestions only |
| `src/lib/direction.ts` | Registry-first merge with another wall cutoff | One eligibility policy for both resource origins; no unconditional registry priority |
| `src/lib/direction-discover.ts` | Can label a weak library match "Use now" | Candidate labels reflect task fit; source kind only determines the next action |
| `src/lib/inspiration-auth.ts` | Shared-password wall unlock | Preserve reader gate; add separate verified owner session and scoped token checks |
| `src/app/api/inspiration/[...operation]/route.ts` | Absent | Validated search, inspect, owner preference, ingest and feedback operations |
| `src/app/inspiration/page.tsx` | Sends the whole unlocked catalog to the browser | Initial browse page from the catalog store; query results through the same API as MCP |
| `src/components/site/inspiration-index.tsx` | Grouped link titles and hostnames | Keep category browsing; query mode shows global rank, snippets, evidence and owner controls |
| `mcp/blank-direction/server.mjs` | Four tools returning Markdown only | Preserve tool names; add structured results, inspect and outcome feedback |
| `scripts/inspiration.mjs` | Absent | Import, ingest, inspect, explain, evaluate, rebuild, export and health commands |
| `tests/fixtures/inspiration-relevance.json` | Absent | Judged questions, expected resources, exclusions, intent and held-out split |
| `docs/inspiration-verification.md` | Absent | Feature map, operating commands, failure recovery and acceptance criteria |
| `package.json` | Neon, Blob and Fuse already installed | Add search and extraction dependencies, plus the control command |
| `vercel.json` | Absent | One daily bounded ingestion trigger |

The existing `/inspiration/search`, `/inspiration/recommend`, `/direction` and `/direction/discover` route files become asynchronous serializers of the compatibility entry points. They retain existing URLs. Their public responses remain unpersonalized; authenticated requests use private caching rules. `src/lib/registry-search.ts` remains the exact installable lookup and fallback. Registry metadata also enters the shared resource index, while existing source-access gates remain authoritative.

`src/lib/db.ts` documents that `registry_tokens` belongs to mint-me. Do not migrate that table. Use a separate `INSPIRATION_DATABASE_URL` and restricted role for this feature, reusing the installed Neon driver.

## Code choices

### One request contract for the website and agents

```diff
- browseInspiration(groups, query)
- recommendInspiration(query)
- directionLookup(query)
+ await retrieve({ query, mode: "search", filters }, viewer)
+ await retrieve({ query, mode: "recommend", filters }, viewer)
+ await retrieve({ query, mode: "discover", filters }, viewer)
```

The caller chooses the presentation policy. Authentication supplies the viewer; a model cannot nominate an arbitrary owner ID.

```ts
type SearchMode = "search" | "recommend" | "discover";
type Preference = "prefer" | "neutral" | "avoid";
type Rating = 1 | 2 | 3 | 4 | 5;

interface OwnerPreference {
  resourceId: string;                 // Immutable database identity
  contextKey: string;                 // Empty means global
  rating: Rating | null;              // Unrated is neutral
  preference: Preference;
  note: string;
  testedAt: string | null;
  revision: number;
}

type Evidence =
  | { kind: "catalog"; resourceId: string; text: string }
  | { kind: "owner-note"; resourceId: string; text: string }
  | {
      kind: "source";
      resourceId: string;
      passageId: string;
      sourceUrl: string;
      headingPath: string[];
      snapshotHash: string;
      fetchedAt: string;
      text: string;
    };

interface SearchResult {
  queryId: string;
  mode: SearchMode;
  status: "ok" | "degraded" | "no-match";
  indexRevision: string;
  preferenceRevision: number | null;
  // Hits include identity, fit reasons, evidence, preference and next action.
  hits: ResourceHit[];
}
```

`ResourceHit` is the shared output type described in the agent contract below. These are architecture sketches, not compiled implementation.

### Search public content, apply private preferences afterward

```ts
const options = {
  query: request.query,
  limit: 40,
  semanticWeight: 0.5,
  inputEnrichment: false,
  reranking: false,
} as const;

const candidates = await retrieveCandidates(options, request.filters);
const current = await store.hydrateAndCheckVisibility(candidates);
const eligible = enforceTaskConstraints(current, request);
const relevant = applyRelevancePolicy(eligible, request.mode);
const preferred = applyOwnerPreferences(relevant, viewer);
return present(preferred, request.mode);
```

`retrieveCandidates` runs PostgreSQL title/alias/full-text retrieval and the two Upstash indexes concurrently. It handles a failed provider independently. Private notes can contribute PostgreSQL candidates for the authenticated owner. Provider scores never become confidence percentages.

The initial Upstash configuration disables query rewriting so named technologies and exclusions retain their meaning. Standard reranking is the default provider path. Advanced reranking stays disabled. Test enrichment on and off as an isolated evaluation, preserving the original query if enabled later. The provider supports these controls. [Upstash algorithm](https://upstash.com/docs/search/features/algorithm), [search arguments](https://upstash.com/docs/search/sdks/ts/commands/search).

### Preserve the context of each passage

```diff
- indexedText = title + description + inferredCategoryTags
+ cardText = title + description + confirmedCapabilities + bestFor + limitations
+ passageText = resourceTitle + pageTitle + headingPath + sourcePassage
```

Do not embed a rating, a click count, a fabricated summary, or inherited category tags as factual capability evidence. Changing a rating requires one database write and no re-embedding.

## Scope exclusions

No community ranking, public voting, chat interface, graph database, model fine-tuning, whole-web crawler, or always-running model server. No paid reranker, crawling subscription, or extra job platform by default. No claim that a vector match proves relevance. No automatic rating changes based on agent choices.

This proposal covers architecture. It does not authorize a production cutover, provision services, or change application code.

---

## What the current system actually does

Measured on 5 September 2026 against this checkout, with matching representative live HTTP probes.

| Finding | Evidence | Consequence |
| --- | --- | --- |
| The corpus is 1,350 entries across 51 groups | Direct import of `inspirationGroups`; 1,349 unique URL strings | Small enough for a simple database and bounded index |
| Only 234 entries have an explicit kind, and 248 have explicit `useFor` | Direct field count | Much of the apparent structure comes from inference |
| Search indexes blurbs and facets, without source bodies | `inspiration-rank.ts:16`, `buildInspirationIndex` | It cannot retrieve details that only exist inside an article or component catalog |
| Fuzzy recovery only exists in the website path | `inspiration-browse.ts:112` versus `inspiration-search.ts` | The same typo succeeds in the UI and fails for agents |
| Recommendations apply multiple numeric cutoffs | `inspiration-recommend.ts:56`, `direction.ts:47` | Strong candidates can disappear between APIs |
| A kind can determine the "Use now" label | `direction-discover.ts:133`; discovery marks the first four hits direct | Presentation can imply more certainty than the evidence supports |
| Search results retain category blocks | `inspiration-browse.ts:263` and `inspiration-index.tsx` | A category's lower-ranked items can appear above another category's stronger result |
| Preference storage and retrieval feedback are absent | Data types, database module and caller trace | Neither you nor agents can establish durable preferred tools |

Concrete reproductions:

| Query | Observed behavior |
| --- | --- |
| `spriteshet` | Website finds Spritesheet pointer translate; raw search and recommend return nothing |
| `RAG retrieval` | Website finds React Native RAG, Chroma, Orama and code-chunk; recommend returns nothing |
| `search engine typo tolerance` | Live direction suggests the Converging Search Scroll animation as an installable |
| Full task asking for search/RAG architecture, ratings and Vercel | Live discovery largely returns galleries and UI kits, boosted by "curated" and "Vercel" |

This is a combination of sparse content, inconsistent retrieval, loose inferred metadata and missing feedback. Adding embeddings alone would preserve several of these failures.

## How it should feel to use

1. Save a URL. It becomes searchable immediately as a catalog card. The UI separately shows whether source indexing is pending, ready or needs attention.
2. Search normally. Exact names and typos work; a full sentence can find a useful passage inside a saved resource. Query mode is a globally ranked list with snippets. An empty query keeps your category wall.
3. Rate a resource from 1 to 5. Add Prefer, Neutral or Avoid, plus an optional context and note. Editing these does not require a deployment.
4. Ask an agent. It receives the same relevant resources, your applicable preferences, source passages, and the correct next action.
5. Inspect why a pick appeared. See task match, your preference, source freshness and evidence. Mark a result irrelevant or a source used successfully.

For example, you can mark a library 5/5, prefer it for "React dashboards", and note a mobile limitation. It should win among suitable dashboard libraries. It should not displace a backend queue simply because its rating is higher. This is example behavior, not a preference inferred about any particular library.

## Data ownership

Neon holds the authoritative records. Upstash receives derived search documents. Losing an index must never lose a rating, saved link or source history.

| Record | Important fields and constraints |
| --- | --- |
| Resource | Immutable UUID, origin `wall` or `registry`, canonical URL, title, description, categories, confirmed kind/stack, best-for, limitations, added date, visibility, content revision |
| Resource alias | Previous `insp_*` or `reg_*` citation, URL aliases and names pointing to the immutable resource |
| Source | Resource ID, exact page/repo URL, source type, extraction state, latest attempt, latest success, current snapshot hash |
| Snapshot | Source ID, content hash, fetch time, HTTP validators, extractor version, private Blob key |
| Passage | Source and snapshot IDs, heading path, body, locator, ordinal, content hash and PostgreSQL text index |
| Preference | Resource ID plus owner/context, nullable rating, prefer/neutral/avoid, note, tested date and revision |
| Job | Resource/source, stage, attempt count, next attempt, lease expiry, idempotency key and failure reason |
| Query/outcome | Query ID, bounded query text, mode, ordered resource IDs, config/revisions, latency, rejection or usage outcome |

Use a uniqueness constraint on the normalized URL, with category membership preserved across merged duplicates. Normalize scheme/host and remove tracking parameters; preserve meaningful query parameters and case-sensitive paths. Report ambiguous canonicalization instead of merging different resources silently.

The current citation ID derives from title and host. A rename changes it. Import existing IDs as aliases and assign immutable IDs once. The checkout already contains trailing-slash variants for Domain SDK and Invoicely that share generated IDs. Resolve duplicate aliases during import and keep old citations valid.

Start imported metadata as `catalog` evidence. Record whether a facet came from the owner, a source or an old heuristic. Category defaults help browsing; they cannot establish that a resource supports React, a license, or a specific feature. A changed source cannot overwrite owner-authored notes.

## Ingestion and RAG

Index two levels because they answer different questions.

| Index | Purpose | Contents |
| --- | --- | --- |
| Resource cards | "Which tool or reference should I use?" | One record per resource: title, purpose, confirmed capabilities, use cases and limitations |
| Source passages | "Where does it explain or demonstrate this?" | Bounded excerpts with resource/page identity and section context |

Upstash indexes `content`; `metadata` is returned/filterable but not searchable. Keep searchable capability text in content. Store resource IDs, source IDs, origin and snapshot revisions as metadata. Personal notes and ratings stay in Neon. [Content and metadata](https://upstash.com/docs/search/features/content-and-metadata).

Choose ingestion by source type:

| Source | Default ingestion |
| --- | --- |
| Article or guide | Saved page body, section headings, code and table context |
| Tool or library | Saved page or repository README first; add up to two owner-selected documentation pages |
| Component library | Card plus concrete component documentation/source pages; link these as children of the library |
| Skill | Exact `SKILL.md` with repository revision and related entry-point links |
| Gallery, portfolio or motion demo | Catalog card plus manually captured visual observations; text extraction alone cannot establish visual qualities |
| Video or inaccessible source | Curated description or supplied transcript/notes, explicitly marked as partial |

Use Node fetch and Mozilla Readability with jsdom for HTML extraction, with script execution and remote subresources disabled. Keep structured HTML internally for headings/code boundaries, and render escaped text excerpts in the product. If extraction yields little useful content, retain the card and mark the source `needs-review`; do not fabricate a page summary. GitHub/raw Markdown uses a direct text path. [Readability](https://github.com/mozilla/readability).

Chunk on headings, paragraphs and code boundaries. Target roughly 2,500 characters of body, reserve space for contextual prefixes, and enforce a 4,000-character serialized-content ceiling before upload. Split oversized code blocks with repeated labels and continuation markers. Never silently truncate a document to satisfy the provider limit.

Keep a small overlap only where a paragraph crosses a chunk boundary. Store original offsets and section locators so a retrieved excerpt can be checked against its snapshot. Return at most two evidence passages per resource by default. A resource with 500 indexed sections gets no popularity bonus for producing 500 hits.

The initial backfill indexes one source per resource, starting with 150 resources covering difficult queries and your likely preferences. Expand after extraction review. Higher-depth documentation coverage is explicit, not an automatic crawl of every domain.

Each successful source fetch produces one compressed snapshot containing raw response and extracted structure. Content hashes skip unchanged writes and embedding work. New source versions remain staged until their search documents are queryable; then activate the revision. Query-time hydration rejects deleted/private resources and stale passage revisions immediately. Remove retired index documents asynchronously.

Daily processing claims persisted jobs with short leases. Bound a Vercel invocation to 45 seconds, at most six source attempts and two concurrent fetches; checkpoint each stage. Expired leases allow recovery. Retry transient errors with backoff, stop after three failed attempts, and show actionable failures. Use the same worker from the local CLI for the initial backfill and manual drain. The catalog search does not wait for a crawl.

For URLs, reject private-network destinations and re-check redirects, cap response size and redirects, respect site restrictions and never bypass access controls. Crawled prose is untrusted evidence, never executable instructions for an agent. These checks belong in the ingest boundary.

## Retrieval and personal ranking

The shared service runs this sequence:

1. Parse bounded query text, exact URL/name, explicit filters and date range. Accept structured kind/stack/section constraints from MCP. Keep unknown facts unknown; don't infer hard exclusions from a weak category guess.
2. Retrieve exact aliases and typo candidates from Neon. Run card search and passage search concurrently in Upstash, up to 40 results each. Search owner notes in Neon only for the authenticated owner.
3. Collapse passage hits to resource IDs before merging. Use reciprocal-rank fusion with an initial constant of 60 to combine differently scaled lists. Preserve exact identities separately. Scores rank candidates; they are not relevance probabilities.
4. Hydrate authoritative records. Check visibility, current source revision, explicit constraints, owner Avoid rules and known incompatible capabilities. The user's explicit request for a named avoided item still finds it with the reason shown.
5. Apply mode-specific relevance eligibility. Exact IDs/names remain exact. Recommendation thresholds are calibrated on judged queries, separately from discovery. Until those thresholds pass the held-out checks, semantic matches remain candidates, not asserted recommendations.
6. Apply owner preferences only inside the eligible set. A matching scoped preference takes precedence over the global preference. Use controlled context keys rather than arbitrary fuzzy matches to decide scope.
7. Return search results globally ranked. Recommend returns at most three supported picks. Discovery targets eight to twelve with relevant variety and at most three source inspections; it returns fewer when there aren't enough suitable candidates.

For personalization, start with a bounded boost of at most 10% of the top fused relevance score. Prefer contributes 6%; a 5/5 rating contributes at most another 4%; unrated contributes zero. Ratings below 3 apply a corresponding small penalty. Apply these only after eligibility, and never reorder another item ahead of an explicit identity match. Treat these weights as versioned starting parameters and measure them rather than presenting them as learned truth.

Retain diversity inside discovery, with at most two picks per host by default. Reserve room for relevant unrated material so your favorites do not suppress discovery. Do not add an unrelated category solely to fill a diversity quota.

Strict filters must apply across both origins. A backend request must not receive a component animation because its title contains "search". Upstash warns that selective filters can return fewer than the requested count, so hydrate/check candidates and return a coverage gap rather than silently dropping the filter. [Filtering](https://upstash.com/docs/search/features/filtering).

## Agent contract

Keep the current familiar tool names. All call the shared service, with structured JSON and a compact Markdown rendering.

| Tool | Result |
| --- | --- |
| `direction_lookup` | Concrete matches across installables and references, with explicit filters |
| `direction_discover` | A bounded varied set, fit labels, gaps and next actions |
| `inspiration_recommend` | At most three eligible wall picks, including your applicable preferences |
| `inspiration_inspect` | Current resource card, selected source passages, freshness and exact inspection targets |
| `inspiration_feedback` | Records irrelevant, inspected, adopted or used-successfully outcomes; cannot modify owner ratings |

A hit includes `resourceId`, old citation alias, origin, title, URL, kind, fit reasons, evidence, source coverage/freshness, applicable owner preference, and next action. Registry hits retain their verified install command and existing entitlement checks. Search results may explain "matches your React constraint" or "you prefer this for dashboards"; "matched eight query variants" is debugging data only.

Evidence does not replace engagement. A skill still requires reading the skill; a library requires inspecting the actual API/component; a visual reference requires visual inspection. `inspiration_inspect` makes the right next step concrete and less expensive.

Do not generate a second LLM answer inside the search service by default. The caller already has a model. Give it compact evidence and your preferences, cap the response budget, and require source-backed citations. This removes a separate inference bill and an extra place to invent claims.

Retrieval quality and tool adoption are separate. Test that agents call the tool with the original task and relevant filters, inspect the intended source, and cite only returned/current evidence. An architecture cannot force an arbitrary external model to follow instructions. Record observable tool/inspection/outcome events and evaluate sample agent traces.

## Free-first infrastructure and cost

Published allowances checked on 5 September 2026. These are provider limits, not verified remaining allowance in your accounts.

| Piece | Choice | Cost or constraint |
| --- | --- | --- |
| App/API | Existing Vercel project | Reuse current deployment; API/CPU/transfer consume its plan allowance |
| Catalog/preferences | Neon Free | 0.5 GB/project, 100 CU-hours/project/month and 5 GB egress/project in current docs. [Neon plans](https://neon.com/docs/introduction/plans) |
| Search | Upstash Search Free | 20,000 monthly requests, 200,000 documents, 1 GB, one free database, ten indexes. Content is limited to 4,096 characters/document. [Search pricing](https://upstash.com/pricing/search) |
| Source snapshots | Private Vercel Blob | Hobby includes 1 GB, 2,000 advanced operations, 10,000 simple operations and 10 GB transfer. Existing asset use competes for allowances. [Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) |
| Scheduling | Vercel Cron plus the same local CLI | Hobby supports daily execution with timing imprecision; cron invokes a billed/limited Function. [Cron usage](https://vercel.com/docs/cron-jobs/usage-and-pricing) |
| Extraction | Readability/jsdom and direct Markdown fetch | Open-source libraries run within worker compute; no hosted crawler subscription |
| Answer generation | Calling agent | No separate application model call in the default path |

Illustrative initial workload: 1,350 inspiration cards plus four passages/resource gives 6,750 index records. Add 355 registry cards from this checkout, giving 7,105 records. Registry source passages remain gated and outside this first estimate. Conservatively counting one request per document, initial indexing uses 7,105 requests. At 3,000 submitted searches/month and two provider searches each, retrieval adds 6,000. Allow 1,000 changed-record writes and the total is approximately 14,105, before retries and optional searches. Actual provider batching can reduce calls; verify its accounting in the pilot.

At 2,500 characters per passage, passage text is roughly 13.5 million characters before metadata and database index overhead. Measure actual PostgreSQL and provider storage, keeping snapshots in Blob. A full first pass of one snapshot/resource is 1,350 Blob writes; two versions of every resource in the same month would exceed the stated Hobby write allowance before existing usage. Backfill and refresh therefore have separate operation budgets.

Target incremental service cost is $0 while within allowances, with no automatic upgrade. Free service capacity is finite. A Vercel Pro account uses its own credit/usage model rather than the Hobby allowances in this table.

If explicitly upgraded later, the published Upstash base rates are $0.05/1,000 requests and $0.10/1,000 documents/month. At 20,000 requests and 10,000 documents that is about $2/month for base search, excluding other services and advanced reranking. Its pricing and feature pages describe advanced-rerank billing units differently, so leave it disabled until the actual account billing semantics are confirmed. [Search pricing](https://upstash.com/pricing/search), [reranking details](https://upstash.com/docs/search/features/reranking).

Upstash currently labels Search preview/early access with no uptime SLA. That is a material limitation for an essential project. Keep its index rebuildable and use Neon full-text plus `pg_trgm` as the default fallback. This is keyword search, not a promise of equivalent semantic recall. [Search service status](https://upstash.com/pricing/search), [Neon pg_trgm](https://neon.com/docs/extensions/pg_trgm).

Avoid remote search on every keystroke. Offer local title suggestions and run full retrieval on submit. Public unauthenticated calls use a bounded unpersonalized lexical path; authenticate owner/MCP hybrid calls so anonymous requests cannot exhaust the free semantic budget. Legacy public URLs stay readable.

Atomically reserve provider-call quota in Neon before dispatch, count retries, reserve ingestion headroom and stop semantic calls before the free limit. Use a monthly default ceiling of 18,000 requests, with 4,000 reserved for ingestion; permit a temporary backfill allocation at the expense of search, not beyond the ceiling. If the quota store is unavailable, skip paid-capable calls. Memoize unpersonalized candidate IDs by query, filters, index/config revision and a short TTL. Read preferences after that cache, every time.

## Access, freshness and recovery

The current wall cookie contains the literal value `unlocked`. It cannot authorize personal preference writes. Add a distinct owner login that verifies the server-side secret and issues a signed, expiring HttpOnly/Secure session. Rate-limit login and validate origin on writes. MCP uses a scoped credential with read, feedback or owner-write capability; ordinary agent feedback cannot promote itself to owner-write. Configure secrets through existing environment management, never in catalog data or exports.

Personalized and inspection responses are `private, no-store`. Private notes never enter a public CDN cache or the public Upstash indexes. Public compatibility responses contain no owner notes or ratings. Logged owner query text has short retention; persist feedback and aggregate failures without retaining unrestricted prompts forever.

| Failure | Behavior |
| --- | --- |
| Upstash timeout, preview outage or request budget reached | Neon lexical results with `status: degraded`; no retry loop on the user request |
| Neon unavailable or suspended | Static catalog browsing remains available; personalized recommendations and writes report unavailable rather than ignoring Avoid rules |
| Blob unavailable | Serve retained passage text and provenance from Neon; source-snapshot expansion is unavailable |
| Crawl blocked or empty | Keep the card and last successful source version; show partial/stale coverage |
| New index build incomplete | Keep the active revision; do not publish a partial rebuild |
| Resource removed or made private | Exclude at authoritative hydration immediately; purge index documents asynchronously |
| Source refreshed | Old passage IDs remain traceable to snapshots but cannot masquerade as current evidence |

The six-attempt daily limit permits roughly 180 source attempts/month, not a monthly refresh of the entire catalog. Reserve monthly checks for up to 100 preferred or recently used tool/docs sources; use the remaining capacity for new links and retries. Other sources refresh on demand or through a manual CLI drain. Keep latest attempt separate from last successful fetch. Important mutable facts such as price and license should prompt source verification when stale.

## Alternatives considered

| Approach | Decision |
| --- | --- |
| More keyword boosts in the existing engine | Useful as a short-term patch, but leaves missing source content and divergent callers |
| Orama as the whole replacement | Good embedded engine; not the selected default. A local lexical check over all 1,350 entries recovered `spriteshet`, but `RAG retrieval` also returned tag/bag resources. This was an untuned diagnostic, not a verdict on Orama's best quality. Embeddings and durable updates still need an operating plan. [Orama source](https://github.com/oramasearch/orama/blob/main/packages/orama/README.md) |
| Neon full-text, pg_trgm and pgvector only | Strong alternative if Upstash fails evaluation. Fewer providers, but query/document embedding inference and semantic reranking remain our responsibility. Use PostgreSQL lexical retrieval immediately as fallback; defer vector ownership until needed |
| Hosted crawler for every URL | Adds a separate quota/bill and still needs source review. Start with fetch/extraction and manual attention for blocked pages |
| Knowledge graph or learned recommendation model | No evidence this complexity is needed at the current size; collect explicit judgments first |

From wall: Building a web search engine from scratch, `insp_building-a-web-search-engine-from-scratch-blog`. Adopt its preservation of heading/table context, source normalization and inspectable evaluation loop. The proposal applies these through passage prefixes, locators and the explain command. Its web-scale GPU/storage architecture is outside this project's needs. [Source](https://blog.wilsonl.in/search-engine/).

From wall: Orama, `insp_orama-github`. Evaluated its actual lexical engine in an isolated temporary directory, without changing project dependencies. Retain the distinction between a search engine and the content/operating workflow; do not claim a replacement engine alone fixes this catalog.

BLANK discovery and exact searches produced no relevant Upstash Search entry and no Neon database entry; incidental matches were rejected. Outside-second-brain: Upstash Search supplies managed hybrid retrieval within a published free tier. Neon and Blob are existing repository dependencies. Outside-second-brain: Mozilla Readability supplies maintained HTML body extraction. These choices came from current primary documentation, not catalog blurbs.

## Delivery and proof

| Stage | Deliverable | Exit condition |
| --- | --- | --- |
| 1. Baseline and pilot | 60 judged queries, catalog import, 150 diverse source ingestions, provider comparison | Review extraction quality and held-out retrieval before committing to the provider |
| 2. Owner controls | Ratings, scoped prefer/avoid, source state, shared API and owner auth | Change a preference and verify the next website/MCP request reflects it without reindexing |
| 3. RAG and cutover | Source passages, hybrid search, inspect tool, compatibility routes, staged backfill | Quality targets, citation validation and fallback drills pass |
| 4. Maintenance | Daily bounded refresh, feedback triage, export/rebuild and feature map | Rebuild from authoritative records; reproduce a failed query with one CLI command |

Use 40 development queries and 20 held-out queries. Cover exact names, misspellings, paraphrases, compound needs, exclusions, visual concepts, sparse/absent material and personal preferences. Label multiple acceptable resources and adjacent negatives, not only one expected title. Preserve existing useful tests, but do not mistake "contains a hit" for useful ranking.

Proposed acceptance targets, not measurements already achieved:

- Exact saved name/URL top-one accuracy: 100% on the fixture set.
- Judged relevant resource recall within 20 candidates: at least 90%.
- Top-five ranking quality, measured with graded NDCG: at least 20% relative improvement over the captured baseline, without weakening exact lookup.
- Strict recommendation precision: at least 90% on judged queries, allowing fewer than three picks. Add more held-out queries as the catalog grows.
- No known constraint/Avoid violations; unrated items remain eligible; contextual preferences do not leak into unrelated tasks.
- Every returned source passage resolves to the expected resource, URL and snapshot. No invented citation or source-backed claim from a catalog-only entry.
- Website and MCP receive the same ordered IDs for the same mode, filters and viewer.
- Warm hybrid p95 under 1.5 seconds as an initial target. Measure cold requests separately. Fall back by a bounded deadline and show degradation honestly.
- Crawl duplicates, worker interruption, deletion, stale index records and provider quota exhaustion recover as specified.

Run the existing focused search/direction tests plus the new judged evaluation. Before visible cutover, verify search, rating, inspection and degraded behavior through the named local URL with Agent Browser. Review the diff in Plannotator. A later implementation plan should read the installed Next.js guides before changing route/cache behavior.

The operating commands should be small and inspectable:

```text
pnpm inspiration import --dry-run
pnpm inspiration inspect <resource-id>
pnpm inspiration explain "RAG retrieval" --mode recommend
pnpm inspiration ingest --limit 20
pnpm inspiration jobs --failed
pnpm inspiration evaluate --split held-out
pnpm inspiration export
pnpm inspiration rebuild --dry-run
pnpm inspiration health
```

Current validation is source tracing, read-only local catalog probes, live endpoint reproductions, official documentation checks and an isolated Orama diagnostic. Upstash has not been provisioned or benchmarked against this corpus. Provider quality, extraction coverage, live latency and account-specific free allowance remain pilot measurements, not promises.
