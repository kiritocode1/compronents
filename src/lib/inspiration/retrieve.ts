import { matchesDateRange, parseTimeQuery } from "../search-time.ts";
import { resourceText, seedCatalog } from "./catalog.ts";
import { getInspirationDatabase, type InspirationDatabase } from "./db.ts";
import {
  analyzeQuery,
  candidateText,
  constraintTsQuery,
  correctQuery,
  coverage,
  meetsConstraints,
  nearbyCoverage,
  queryTerms,
} from "./query.ts";
import {
  effectivePreferences,
  importCatalog,
  passagesFor,
  preferences,
} from "./store.ts";
import {
  InspirationError,
  type Passage,
  type Resource,
  type RetrievalHit,
  type RetrievalRequest,
  type RetrievalResult,
  type Viewer,
} from "./types.ts";
import { parseRetrieval } from "./validation.ts";

let dictionary:
  | { known: Map<string, Set<number>>; titles: Set<string> }
  | undefined;
function spellingDictionary() {
  if (dictionary) return dictionary;
  const known = new Map<string, Set<number>>();
  for (const [index, resource] of seedCatalog().entries()) {
    const words = queryTerms(resourceText(resource));
    for (const word of words) {
      const context = known.get(word) ?? new Set<number>();
      context.add(index);
      known.set(word, context);
    }
  }
  dictionary = {
    known,
    titles: new Set(
      seedCatalog().flatMap((resource) =>
        queryTerms(
          [resource.title, ...resource.stack, ...resource.useFor].join(" "),
        ),
      ),
    ),
  };
  return dictionary;
}

function normalized(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function exactResource(resource: Resource, query: string) {
  const q = normalized(query);
  return (
    q === normalized(resource.title) ||
    q === normalized(resource.href) ||
    q === resource.id ||
    resource.aliases.includes(q)
  );
}

interface Dependencies {
  db?: InspirationDatabase | null;
  /** Injectable so a test can force the degraded path without a database error. */
  semantic?: (db: InspirationDatabase, query: string) => Promise<string[]>;
}

/**
 * Nearest neighbours by cosine distance over the HNSW index. `embedding_for_query`
 * is the query-side counterpart to `embedding_for_passage`: bge models prefix the
 * two differently, so using the passage function here would quietly rank worse.
 */
async function semanticCandidates(
  db: InspirationDatabase,
  text: string,
): Promise<string[]> {
  const rows = await db.query<{ id: string }>(
    `SELECT id FROM inspiration_resources
     WHERE active AND embedding IS NOT NULL
     ORDER BY embedding <=> rag_bge_small_en_v15.embedding_for_query($1)
     LIMIT 40`,
    [text],
  );
  return rows.map((row) => row.id);
}

async function lexicalCandidates(
  db: InspirationDatabase,
  text: string,
  expanded: string,
  constraints: string,
) {
  const terms = [
    ...new Set(expanded.toLowerCase().match(/[a-z0-9]+/g) ?? []),
  ].slice(0, 96);
  const tsquery = terms.join(" | ");
  return Promise.all([
    db.query<{ id: string }>(
      `SELECT id FROM inspiration_resources WHERE active AND
      ($1 = '' OR search_vector @@ to_tsquery('english', $1))
      ORDER BY ts_rank_cd(search_vector, to_tsquery('english', $1)) DESC, id LIMIT 120`,
      [tsquery],
    ),
    db.query<{ id: string }>(
      `SELECT id FROM inspiration_resources WHERE active AND
      ($1 <% search_text OR lower(document->>'title') = lower($1) OR id = $1 OR canonical_url = $1 OR
       id IN (SELECT resource_id FROM inspiration_aliases WHERE alias = $1))
      ORDER BY (lower(document->>'title') = lower($1) OR id = $1 OR canonical_url = $1) DESC,
        word_similarity($1, search_text) DESC, id LIMIT 60`,
      [text],
    ),
    db.query<{ id: string; resource_id: string }>(
      `SELECT p.id, p.resource_id FROM inspiration_passages p
      JOIN inspiration_resources r ON r.id = p.resource_id AND r.active
      WHERE p.active AND $1 <> '' AND p.search_vector @@ to_tsquery('english', $1)
      ORDER BY ts_rank_cd(p.search_vector, to_tsquery('english', $1)) DESC, p.id LIMIT 60`,
      [tsquery],
    ),
    constraints
      ? db.query<{ id: string }>(
          `SELECT id FROM inspiration_resources WHERE active AND search_vector @@ to_tsquery('english', $1)
      ORDER BY ts_rank_cd(search_vector, to_tsquery('english', $1)) DESC, id LIMIT 120`,
          [constraints],
        )
      : Promise.resolve([]),
  ]);
}

export async function retrieve(
  input: RetrievalRequest,
  viewer: Viewer,
  deps: Dependencies = {},
): Promise<RetrievalResult> {
  const request = parseRetrieval(input);
  const mode = request.mode ?? "search";
  const result: RetrievalResult = {
    query: request.query,
    mode,
    hits: [],
    provider: "postgres",
  };
  if (!request.query && !request.category) return result;
  const parsed = parseTimeQuery(request.query);
  const text = parsed.words.join(" ");
  const query = analyzeQuery(text);
  const vocabulary = spellingDictionary();
  correctQuery(query, vocabulary.known, vocabulary.titles);
  const terms = query.terms;
  let db: InspirationDatabase | null;
  try {
    db = deps.db !== undefined ? deps.db : await getInspirationDatabase();
  } catch {
    db = null;
  }
  if (!db && viewer.owner)
    throw new InspirationError(
      "Personal search is unavailable while the inspiration database is offline.",
      503,
    );

  let resources: Resource[] = [];
  let passages: Passage[] = [];
  const rrf = new Map<string, number>();
  const semanticIds = new Set<string>();
  const addRanks = (ids: string[], weight = 1) => {
    [...new Set(ids)].forEach((id, rank) => {
      rrf.set(id, (rrf.get(id) ?? 0) + weight / (60 + rank + 1));
    });
  };
  let personal = new Map<string, import("./types.ts").PersonalPreference>();
  if (db) {
    try {
      if (db.kind === "local") {
        const [row] = await db.query<{ count: number }>(
          "SELECT count(*)::integer AS count FROM inspiration_resources",
        );
        if (row.count === 0) await importCatalog(db);
      }
      const [fts, fuzzy, source, constrained] = await lexicalCandidates(
        db,
        query.positive,
        candidateText(query),
        constraintTsQuery(query),
      );
      addRanks(fts.map((row) => row.id));
      addRanks(fuzzy.map((row) => row.id));
      addRanks(source.map((row) => row.resource_id));
      addRanks(constrained.map((row) => row.id));
      // Nearest neighbours over the embedding column, joined by the same addRanks
      // the lexical passes use, so RRF and the BM25 floor are untouched. The
      // catch is the normal path on local PGlite, which has no embedding column.
      // Nearest neighbours always return something, so gibberish would otherwise
      // get a full page of confident-looking noise. Cosine distance cannot tell
      // them apart: measured against this wall, "zzzqqxx wibblefrotz" lands at
      // 0.381 while a real vague question sits at 0.397. Corpus vocabulary can:
      // the same queries score 0.00 and 0.75-1.00. So a query has to name at
      // least one thing this wall knows about before it earns semantic recall.
      const grounded = terms.some((term) => vocabulary.known.has(term));
      if (viewer.owner && text && grounded) {
        try {
          const near = await (deps.semantic ?? semanticCandidates)(db, text);
          addRanks(near);
          for (const id of near) semanticIds.add(id);
          if (near.length) result.provider = "hybrid";
        } catch {
          // Only worth saying when the rows exist but the query could not run.
          if (db.kind === "neon")
            result.notice =
              "Semantic search is unavailable. Showing PostgreSQL matches.";
        }
      }
      const ids = [...rrf.keys()];
      const rows = await db.query<{ document: Resource }>(
        `SELECT document FROM inspiration_resources
        WHERE active AND (id = ANY($1::text[]) OR $2 = '') ORDER BY id`,
        [ids, text],
      );
      resources = rows.map((row) => row.document);
      // Source evidence is only available to the owner or an authenticated read token.
      passages = await passagesFor(
        db,
        resources.map((r) => r.id),
        text,
      );
      personal = viewer.owner
        ? effectivePreferences(
            await preferences(db, request.contextKey ?? ""),
            request.contextKey ?? "",
          )
        : personal;
    } catch {
      if (viewer.owner)
        throw new InspirationError(
          "Personal search is unavailable. Check database health before retrying.",
          503,
        );
      resources = seedCatalog();
      result.provider = "catalog";
      result.notice = "Database unavailable. Showing catalog text matches.";
    }
  } else {
    resources = seedCatalog();
    result.provider = "catalog";
    result.notice = "Database not connected. Showing catalog text matches.";
  }

  const candidates: RetrievalHit[] = [];
  for (const resource of resources) {
    if (
      request.category &&
      !resource.categories.some((c) =>
        normalized(c).includes(normalized(request.category ?? "")),
      )
    )
      continue;
    if (request.kind && !resource.kind.includes(request.kind)) continue;
    if (
      request.stack &&
      !resource.stack.some(
        (s) => normalized(s) === normalized(request.stack ?? ""),
      )
    )
      continue;
    if (!matchesDateRange(resource.dateAdded, parsed.date)) continue;
    const pref = personal.get(resource.id);
    const exact =
      exactResource(resource, request.query) || exactResource(resource, text);
    const catalogText = resourceText(resource);
    // Avoid stays discoverable for direct lookup, with an explicit warning.
    if (pref?.preference === "avoid" && !exact) continue;
    const evidence = passages
      .filter((p) => p.resourceId === resource.id)
      .sort(
        (a, b) =>
          coverage(terms, b.text) - coverage(terms, a.text) ||
          a.ordinal - b.ordinal,
      )
      .slice(0, 2);
    const evidenceText = `${catalogText} ${evidence.map((p) => p.text).join(" ")}`;
    if (!exact && !meetsConstraints(query, evidenceText)) continue;
    if (
      !exact &&
      query.style &&
      !resource.categories.some((category) =>
        /design|animation|motion|portfolio|component|ui |icon|skill|frontend/i.test(
          category,
        ),
      )
    )
      continue;
    const directSupport = coverage(terms, evidenceText);
    const explicitIntent =
      terms.length > 0 &&
      resource.useFor.some((value) => coverage(terms, value) === 1);
    const localSupport = Math.max(
      0,
      ...[
        resource.title,
        ...resource.useFor,
        resource.description,
        ...evidence.map((p) => p.text),
      ].map((value) => nearbyCoverage(terms, value)),
    );
    // Editorial categories can recover a style intent, but never a capability.
    const expandedSupport = Math.max(
      0,
      ...query.variants.map((variant) =>
        coverage(variant, evidenceText) >= 0.5
          ? coverage(
              variant,
              `${evidenceText} ${resource.categories.join(" ")}`,
            ) * 0.85
          : 0,
      ),
    );
    const literalEligible =
      (!(query.style && terms.length === 1) || explicitIntent) &&
      Math.min(directSupport, localSupport) >=
        requiredCoverage(mode, terms.length);
    const support =
      query.style && terms.length === 1 && !explicitIntent
        ? expandedSupport
        : Math.max(directSupport, expandedSupport);
    const titleSupport = terms.length ? coverage(terms, resource.title) : 0;
    const categoryMatch = resource.categories.some(
      (c) => normalized(c) === normalized(text),
    );
    const required = requiredCoverage(mode, terms.length);
    const textEligible =
      exact ||
      categoryMatch ||
      !text ||
      literalEligible ||
      expandedSupport >= 0.8;
    // Semantic candidates now reach recommend too. Whether they are shown there
    // is decided after sorting, once it is known if anything verified exists.
    if (!textEligible && !semanticIds.has(resource.id)) continue;
    if (!exact && terms.length === 0 && text && !categoryMatch) continue;
    const related = !textEligible;
    const base =
      (rrf.get(resource.id) ?? 0) * 0.3 +
      support * 0.1 +
      titleSupport * 0.06 +
      (categoryMatch ? 0.05 : 0);
    const boost =
      !related && pref && pref.preference !== "avoid"
        ? (pref.preference === "prefer" ? 0.005 : 0) +
          ((pref.rating ?? 3) - 3) * 0.001
        : 0;
    candidates.push({
      resource,
      score: base + boost,
      match: exact ? "exact" : related ? "related" : "text",
      reasons: [
        exact
          ? "Exact title, URL or citation"
          : related
            ? "Semantic candidate; inspect before recommending"
            : !literalEligible && expandedSupport >= 0.8
              ? "Matching design intent and catalog topic"
              : evidence.some((p) => coverage(terms, p.text) >= required)
                ? "Matching source passage"
                : "Matching catalog description",
        ...(boost > 0
          ? ["Your preference raised this relevant result"]
          : boost < 0
            ? ["Your rating lowered this relevant result"]
            : []),
        ...(pref?.preference === "avoid"
          ? ["You marked this resource Avoid"]
          : []),
      ],
      ...(pref ? { preference: pref } : {}),
      evidence: viewer.owner ? evidence : [],
    });
  }
  candidates.sort(
    (a, b) =>
      Number(b.match === "exact") - Number(a.match === "exact") ||
      Number(a.match === "related") - Number(b.match === "related") ||
      b.score - a.score ||
      a.resource.id.localeCompare(b.resource.id),
  );
  if (mode === "discover") {
    const categories = new Map<string, number>();
    const hosts = new Map<string, number>();
    result.hits = candidates
      .filter((hit) => {
        const category = hit.resource.categories[0];
        const host = new URL(hit.resource.href).hostname;
        if ((categories.get(category) ?? 0) >= 3 || (hosts.get(host) ?? 0) >= 2)
          return false;
        categories.set(category, (categories.get(category) ?? 0) + 1);
        hosts.set(host, (hosts.get(host) ?? 0) + 1);
        return true;
      })
      .slice(0, request.limit);
  } else if (mode === "recommend") {
    // Recommend answers with verified matches whenever it has them. When it has
    // none, an approximate answer labelled "related" beats returning nothing to
    // someone who asked a vague question in good faith. Gibberish never reaches
    // here: it fails the vocabulary gate before semantic recall runs at all.
    const verified = candidates.filter((hit) => hit.match !== "related");
    result.hits = (verified.length ? verified : candidates).slice(
      0,
      request.limit,
    );
  } else result.hits = candidates.slice(0, request.limit);
  return result;
}

function requiredCoverage(mode: RetrievalResult["mode"], termCount: number) {
  return mode === "discover"
    ? 0.5
    : mode === "recommend"
      ? termCount <= 2
        ? 1
        : 0.65
      : 0.6;
}
