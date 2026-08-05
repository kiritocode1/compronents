/**
 * Fuzzy search over BLANK registry installables (components, pages, backend).
 *
 * Powered by Fuse.js (Bitap / approximate string matching) with weighted
 * fields so title/name typos still hit and description noise does not drown
 * them. One engine for:
 * - the site catalog search bar (`rankRegistryItems`)
 * - `/registry/search` + blank-direction MCP (`searchRegistry`)
 *
 * Natural-language dates still come from `parseTimeQuery`; Fuse only ranks
 * the surviving pool.
 */

import Fuse from "fuse.js";
import {
  getRegistryItemsBySection,
  type LibrarySectionId,
  type RegistryItem,
  registryItemUrl,
} from "./registry.ts";
import { matchesDateRange, parseTimeQuery } from "./search-time.ts";

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
  /** Higher is better. Derived from Fuse (0 perfect → 1 miss) as 1 - fuseScore. */
  score: number;
}

/** Flat document Fuse indexes; item is the original registry row. */
interface FuseDoc {
  item: RegistryItem;
  title: string;
  name: string;
  nameSpaces: string;
  category: string;
  section: string;
  description: string;
}

/**
 * Fuse score: 0 = perfect, 1 = no match. Keep results at or under this unless
 * the best hit is looser (then we widen slightly so a weak query still shows).
 */
const FUSE_THRESHOLD = 0.38;

const FUSE_KEYS = [
  { name: "title", weight: 0.38 },
  { name: "nameSpaces", weight: 0.28 },
  { name: "name", weight: 0.14 },
  { name: "category", weight: 0.08 },
  { name: "section", weight: 0.04 },
  { name: "description", weight: 0.08 },
];

function toDocs(items: RegistryItem[]): FuseDoc[] {
  return items.map((item) => ({
    item,
    title: item.title,
    name: item.name,
    nameSpaces: item.name.replace(/-/g, " "),
    category: item.category ?? "",
    section: item.section,
    description: item.description,
  }));
}

function buildFuse(items: RegistryItem[]) {
  return new Fuse(toDocs(items), {
    keys: FUSE_KEYS,
    threshold: FUSE_THRESHOLD,
    // Whole-string match: titles are short, descriptions are long; location
    // bias would punish a hit near the end of a description unfairly.
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
    shouldSort: true,
    // Default field-length norm boosts short fields (good for titles).
    ignoreFieldNorm: false,
    fieldNormWeight: 0.8,
  });
}

/** Cache Fuse indexes by the source array identity (the full section list). */
const fuseCache = new WeakMap<RegistryItem[], Fuse<FuseDoc>>();

function fuseFor(items: RegistryItem[]): Fuse<FuseDoc> {
  let fuse = fuseCache.get(items);
  if (!fuse) {
    fuse = buildFuse(items);
    fuseCache.set(items, fuse);
  }
  return fuse;
}

function isExactNameOrTitle(item: RegistryItem, qText: string): boolean {
  const q = qText.toLowerCase().trim();
  const slug = q.replace(/\s+/g, "-");
  return (
    item.name === slug ||
    item.name.replace(/-/g, " ") === q ||
    item.title.toLowerCase() === q
  );
}

/**
 * Multi-term Fuse rank: search the full phrase and each word, OR-merge with a
 * coverage bonus so "flow feild" still lands Flow Field Text when "flow" is
 * exact and "feild" is a near-miss on "field".
 *
 * Fuse scores: lower is better. We invert to a higher-is-better `score`.
 */
function fuseRank(
  items: RegistryItem[],
  qText: string,
): { item: RegistryItem; score: number; fuseScore: number }[] {
  if (items.length === 0 || !qText.trim()) return [];

  const fuse = fuseFor(items);
  const text = qText.trim();
  const terms = text
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .filter((t) => t.length > 1);

  type Acc = {
    item: RegistryItem;
    /** best fuse score per term; 1 = unmatched */
    termBest: number[];
    phrase: number;
  };
  const byName = new Map<string, Acc>();

  const ensure = (item: RegistryItem): Acc => {
    let row = byName.get(item.name);
    if (!row) {
      row = {
        item,
        termBest: Array.from({ length: Math.max(terms.length, 1) }, () => 1),
        phrase: 1,
      };
      byName.set(item.name, row);
    }
    return row;
  };

  const TERM_CUT = 0.55;
  const PHRASE_CUT = FUSE_THRESHOLD;

  for (let i = 0; i < terms.length; i++) {
    for (const hit of fuse.search(terms[i])) {
      const s = hit.score ?? 1;
      if (s > TERM_CUT) continue;
      const row = ensure(hit.item.item);
      row.termBest[i] = Math.min(row.termBest[i], s);
    }
  }
  for (const hit of fuse.search(text)) {
    const s = hit.score ?? 1;
    if (s > PHRASE_CUT) continue;
    const row = ensure(hit.item.item);
    row.phrase = Math.min(row.phrase, s);
  }

  const ranked: { item: RegistryItem; score: number; fuseScore: number }[] = [];
  const n = Math.max(terms.length, 1);

  for (const row of byName.values()) {
    const matched = row.termBest.filter((s) => s < TERM_CUT);
    const hasPhrase = row.phrase < PHRASE_CUT;
    if (matched.length === 0 && !hasPhrase) continue;

    // Multi-word: need at least half the terms, or a solid phrase hit.
    const need = terms.length <= 1 ? 1 : Math.ceil(terms.length * 0.5);
    if (matched.length < need && !hasPhrase) continue;

    let termSum = 0;
    for (const s of row.termBest) {
      if (s < TERM_CUT) termSum += 1 - s;
    }
    const termPart = termSum / n;
    const phrasePart = hasPhrase ? 1 - row.phrase : 0;
    const coverage = matched.length / n;
    const score =
      Math.max(termPart, phrasePart) *
      (0.65 + 0.35 * Math.max(coverage, hasPhrase ? 1 : 0));
    // Represent fuseScore as inverted score for clear-winner checks.
    ranked.push({
      item: row.item,
      score: Number(score.toFixed(4)),
      fuseScore: Number((1 - score).toFixed(4)),
    });
  }

  ranked.sort((a, b) => b.score - a.score);
  if (ranked.length === 0) return [];

  // Exact name/title always wins alone when present near the top.
  const exact = ranked.filter((row) => isExactNameOrTitle(row.item, text));
  if (exact.length >= 1 && exact[0].score >= 0.75) {
    exact.sort((a, b) => b.score - a.score);
    return [exact[0]];
  }

  // Soft floor relative to the best hit. A clear leader (e.g. typo of a
  // specific title) should not drag every sibling that only shares one word.
  const best = ranked[0].score;
  const floor = Math.max(0.28, best * (best >= 0.75 ? 0.55 : 0.45));
  return ranked.filter((row) => row.score >= floor);
}

/**
 * Rank a provided list of registry items for the site search bar.
 * Honours natural-language dates, then Fuse-ranks free text.
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

  // Fuse over the full list (stable WeakMap cache), then keep dated survivors.
  const datedNames = new Set(dated.map((item) => item.name));
  return fuseRank(items, words.join(" "))
    .filter((row) => datedNames.has(row.item.name))
    .map((row) => row.item);
}

export function searchRegistry(
  query: string,
  {
    limit = 5,
    section,
  }: { limit?: number; section?: LibrarySectionId | "all" } = {},
): RegistryHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const sections: LibrarySectionId[] =
    !section || section === "all"
      ? ["components", "pages", "backend"]
      : [section];

  const pool: RegistryItem[] = [];
  for (const sec of sections) {
    pool.push(...getRegistryItemsBySection(sec));
  }

  // Dates in the MCP query string still work.
  const { date, words } = parseTimeQuery(trimmed);
  const dated = pool.filter((item) => matchesDateRange(item.date, date));
  const text = words.join(" ") || trimmed;
  // Pure date → no Fuse text; return dated slice by recency (name order).
  if (words.length === 0 && date) {
    return dated.slice(0, Math.min(limit, 15)).map((item) => toHit(item, 1));
  }

  const ranked = fuseRank(dated.length ? dated : pool, text);
  return ranked
    .slice(0, Math.min(limit, 15))
    .map((row) => toHit(row.item, row.score));
}

function toHit(item: RegistryItem, score: number): RegistryHit {
  return {
    id: `reg_${item.name}`,
    name: item.name,
    title: item.title,
    description: item.description,
    section: item.section,
    category: item.category,
    pageUrl: `${REGISTRY_BASE}/${item.section}/${item.name}`,
    install: `npx shadcn@latest add ${registryItemUrl(item.name)}`,
    score: Number(score.toFixed(3)),
  };
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
