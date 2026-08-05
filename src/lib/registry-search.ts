/**
 * Lexical search over BLANK registry installables (components, pages, backend).
 *
 * One scorer, two consumers:
 * - `/registry/search` + blank-direction MCP (`searchRegistry`)
 * - the site catalog search bar (`rankRegistryItems`)
 *
 * Both paths must agree on what is most relevant. The bug that made the
 * searchbar feel "inaccurate" was the site doing a boolean filter and keeping
 * date order, while this module already knew "animated footer" is a clear
 * winner. Ranking lives here so that cannot drift again.
 */

import {
  getRegistryItemsBySection,
  type LibrarySectionId,
  type RegistryItem,
  registryItemUrl,
} from "./registry.ts";
import {
  closestWord,
  matchesDateRange,
  parseTimeQuery,
} from "./search-time.ts";

const REGISTRY_BASE = "https://ui.aryank.space";

export interface RegistryHit {
  id: string;
  name: string;
  title: string;
  description: string;
  section: LibrarySectionId;
  category?: string;
  pageUrl: string;
  install: string;
  score: number;
}

const STOP = new Set(
  "a an and the for with from that this into your our their is are be to of in on or".split(
    " ",
  ),
);

export function tokens(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9+#.-]*/g)
      ?.filter((w) => w.length > 1 && !STOP.has(w)) ?? []
  );
}

/** Title + name tokens only: the vocabulary used for typo expansion. */
function nameVocab(items: Iterable<RegistryItem>): string[] {
  const set = new Set<string>();
  for (const item of items) {
    for (const t of tokens(item.title)) set.add(t);
    for (const t of tokens(item.name.replace(/-/g, " "))) set.add(t);
  }
  return [...set];
}

/**
 * Expand query terms against title/name vocabulary so "pixlgrid" scores like
 * "pixelgrid". Description blobs are deliberately not in the vocab: fuzzy
 * against long prose is what made short queries inaccurate.
 */
function expandQueryTerms(terms: string[], vocab: string[]): string[] {
  if (vocab.length === 0) return terms;
  return terms.map((term) => {
    const hit = closestWord(term, vocab);
    return hit !== term ? hit : term;
  });
}

/**
 * Score one item for one query. Higher is better. Exact name/title wins hard;
 * description hits are soft evidence and cannot outrank a true title match.
 */
export function scoreRegistryItem(
  item: RegistryItem,
  queryTerms: string[],
  queryRaw: string,
): number {
  if (queryTerms.length === 0) return 0;
  const titleT = new Set(tokens(item.title));
  const nameT = new Set(tokens(item.name.replace(/-/g, " ")));
  const descT = tokens(item.description);
  const catT = new Set(tokens(item.category ?? ""));
  const sectionT = new Set(tokens(item.section));
  const qNorm = queryRaw.toLowerCase().trim();
  const qSlug = qNorm.replace(/\s+/g, "-");
  let score = 0;

  // Exact / near-exact name or title wins hard (e.g. "animated footer").
  if (item.name === qSlug || item.name.replace(/-/g, " ") === qNorm) {
    score += 50;
  } else if (item.title.toLowerCase() === qNorm) {
    score += 48;
  } else if (
    item.name.includes(qSlug) ||
    qSlug.includes(item.name) ||
    item.title.toLowerCase().includes(qNorm)
  ) {
    score += 18;
  }

  let matched = 0;
  for (const term of queryTerms) {
    let hit = false;
    if (nameT.has(term) || item.name.includes(term)) {
      score += 6;
      hit = true;
    }
    if (titleT.has(term)) {
      score += 5;
      hit = true;
    }
    if (catT.has(term) || sectionT.has(term)) {
      score += 3;
      hit = true;
    }
    const descHits = descT.filter((t) => t === term).length;
    if (descHits) {
      score += Math.min(descHits, 3) * 1.2;
      hit = true;
    }
    // Soft prefix on title/name only (not description).
    if (
      [...titleT, ...nameT].some(
        (t) =>
          t.startsWith(term) ||
          (term.startsWith(t) && t.length >= 4 && term.length <= t.length + 2),
      )
    ) {
      score += 1.5;
      hit = true;
    }
    if (hit) matched++;
  }

  // Multi-word queries need the whole phrase, not "footer" alone matching every footer.
  if (queryTerms.length >= 2 && matched < queryTerms.length) {
    score *= 0.35 + (0.65 * matched) / queryTerms.length;
  }

  // Prefer title/name hits over description-only noise.
  const titleOrNameHit = queryTerms.some(
    (term) =>
      titleT.has(term) ||
      nameT.has(term) ||
      item.name.includes(term) ||
      [...titleT, ...nameT].some((t) => t.startsWith(term) && term.length >= 3),
  );
  if (!titleOrNameHit && score > 0) {
    score *= 0.45;
  }

  return score;
}

/**
 * Rank a provided list of registry items for the site search bar.
 * Honours natural-language dates from parseTimeQuery, then sorts by score.
 */
export function rankRegistryItems(
  items: RegistryItem[],
  rawQuery: string,
  now = new Date(),
): RegistryItem[] {
  const { query, date, words } = parseTimeQuery(rawQuery, now);
  if (!query) return items;

  const dated = items.filter((item) => matchesDateRange(item.date, date));
  // Date-only ask ("last week"): keep list order (usually date sort).
  if (words.length === 0) return dated;

  const qText = words.join(" ");
  const rawTerms = tokens(qText);
  if (rawTerms.length === 0) return dated;

  const vocab = nameVocab(dated);
  const queryTerms = expandQueryTerms(rawTerms, vocab);

  const scored = dated
    .map((item) => ({
      item,
      score: scoreRegistryItem(item, queryTerms, qText),
    }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title),
    );

  if (scored.length === 0) return [];

  // Clear winner (exact name/title): do not flood with every other "footer".
  if (
    scored.length >= 2 &&
    scored[0].score >= 40 &&
    scored[0].score >= scored[1].score * 1.5
  ) {
    return [scored[0].item];
  }

  // Soft floor: drop stragglers far below the best match.
  if (scored.length >= 2) {
    const floor = Math.max(scored[0].score * 0.45, 8);
    return scored.filter((row) => row.score >= floor).map((row) => row.item);
  }

  return scored.map((row) => row.item);
}

export function searchRegistry(
  query: string,
  {
    limit = 5,
    section,
  }: { limit?: number; section?: LibrarySectionId | "all" } = {},
): RegistryHit[] {
  const queryTerms = tokens(query);
  if (queryTerms.length === 0) return [];

  const sections: LibrarySectionId[] =
    !section || section === "all"
      ? ["components", "pages", "backend"]
      : [section];

  const pool: RegistryItem[] = [];
  for (const sec of sections) {
    pool.push(...getRegistryItemsBySection(sec));
  }

  const vocab = nameVocab(pool);
  const expanded = expandQueryTerms(queryTerms, vocab);

  const hits: RegistryHit[] = [];
  for (const item of pool) {
    const score = scoreRegistryItem(item, expanded, query);
    if (score <= 0) continue;
    hits.push({
      id: `reg_${item.name}`,
      name: item.name,
      title: item.title,
      description: item.description,
      section: item.section,
      category: item.category,
      pageUrl: `${REGISTRY_BASE}/${item.section}/${item.name}`,
      install: `npx shadcn@latest add ${registryItemUrl(item.name)}`,
      score: Number(score.toFixed(3)),
    });
  }

  hits.sort((a, b) => b.score - a.score);

  if (
    hits.length >= 2 &&
    hits[0].score >= 40 &&
    hits[0].score >= hits[1].score * 1.5
  ) {
    return hits.slice(0, 1);
  }

  if (hits.length >= 2) {
    const floor = Math.max(hits[0].score * 0.45, 8);
    const kept = hits.filter((h) => h.score >= floor);
    return kept.slice(0, Math.min(limit, 15));
  }

  return hits.slice(0, Math.min(limit, 15));
}

export function registryHitsToMarkdown(hits: RegistryHit[]): string {
  if (hits.length === 0) {
    return "No registry installables matched. Try a more specific component name or pattern.\n";
  }
  const lines = ["## Registry picks (install these)", ""];
  for (const [i, hit] of hits.entries()) {
    lines.push(
      `${i + 1}. **${hit.title}** \`${hit.id}\` _(${hit.section}${hit.category ? ` · ${hit.category}` : ""})_`,
    );
    lines.push(`   - page: ${hit.pageUrl}`);
    lines.push(`   - install: \`${hit.install}\``);
    lines.push(`   - ${hit.description}`);
    lines.push(`   - cite: \`From registry: ${hit.title} (${hit.id})\``);
    lines.push("");
  }
  return lines.join("\n");
}
