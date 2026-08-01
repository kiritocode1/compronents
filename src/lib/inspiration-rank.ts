/**
 * Retrieval engine over inspiration links, with no dependency on the wall data.
 *
 * The scoring lives apart from `inspiration.ts` for one reason: the website
 * search runs in the browser. The inspiration page already serializes every
 * link to the client as props, so a client component that imported the data
 * module would ship the same ~400KB twice. Taking `groups` as an argument lets
 * the browser index the props it already has, while the server keeps its
 * module-level singleton.
 *
 * That split is also what keeps the site honest: `inspiration-search.ts`
 * (routes, llms.txt), `inspiration-recommend.ts` (agents, MCP) and the
 * inspiration index component all rank through this one implementation, so the
 * website cannot quietly drift into being worse at search than the MCP.
 *
 * BM25 over title/category/description/host/facets, no embeddings. The
 * descriptions are keyword-dense (library names, authors, techniques), so
 * lexical scoring gets the right entries into a candidate pool and the facet
 * layer supplies intent. Add vectors only if real queries start missing.
 */

// Relative + extension so `node --test` can import this directly, as
// registry.ts does with search-time.ts.
import type { InspirationGroup, InspirationLink } from "./inspiration.ts";
import {
  expandQuery,
  type InspirationFacets,
  inferCategoryHints,
  inferStyleHints,
  resolveFacets,
} from "./inspiration-meta.ts";

export interface SearchHit {
  title: string;
  href: string;
  description?: string;
  category: string;
  score: number;
  kind?: string[];
  stack?: string[];
  useFor?: string[];
}

/** A merged, facet-boosted hit: what both the site and the agents rank on. */
export interface ScoredHit {
  hit: SearchHit;
  score: number;
  /** Query variants that retrieved this entry (primary phrasing plus rewrites). */
  variants: string[];
  /** Why it was boosted, e.g. "category match (Icons)", "stack:react". */
  reasons: string[];
}

const STOP_WORDS = new Set(
  "a an and any are as at be best but by can do does for from good great have how i in into is it its like me my need new of on or should show that the their them then there these this to top use used using want was what when where which who why will with you your".split(
    " ",
  ),
);

/** Consistent both sides of the index, so exact form never matters. */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && !word.endsWith("ss") && word.endsWith("s")) {
    return word.slice(0, -1);
  }
  return word;
}

export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]*/g) ?? [];
  return words
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .map(stem);
}

interface IndexedDoc {
  link: InspirationLink;
  category: string;
  /** Term frequencies, with title and category counted extra. */
  freq: Map<string, number>;
  length: number;
  /** Resolved once at build time; read by scoring, hits and facet boosts. */
  facets: InspirationFacets;
}

export interface InspirationIndex {
  docs: IndexedDoc[];
  /** Document frequency per term. */
  df: Map<string, number>;
  avgLength: number;
  /** href → doc, so facet boosts skip a linear scan per hit. */
  byHref: Map<string, IndexedDoc>;
}

const TITLE_BOOST = 3;
const CATEGORY_BOOST = 2;
const K1 = 1.5;
const B = 0.75;

export function buildInspirationIndex(
  groups: InspirationGroup[],
): InspirationIndex {
  const docs: IndexedDoc[] = [];
  const df = new Map<string, number>();
  const byHref = new Map<string, IndexedDoc>();

  for (const group of groups) {
    const categoryTokens = tokenize(group.title);
    for (const link of group.links) {
      const freq = new Map<string, number>();
      const add = (tokens: string[], weight: number) => {
        for (const token of tokens) {
          freq.set(token, (freq.get(token) ?? 0) + weight);
        }
      };

      add(tokenize(link.title), TITLE_BOOST);
      add(categoryTokens, CATEGORY_BOOST);
      add(tokenize(link.description ?? ""), 1);
      // The host carries signal too ("reactbits.dev", "fonts.google.com").
      add(
        tokenize(link.href.replace(/https?:\/\//, "").replace(/\//g, " ")),
        1,
      );

      // Facets: category defaults + per-link overrides. Weighted like body text
      // so "animated icons" hits useFor phrases without drowning titles.
      const facets = resolveFacets(group.title, link);
      add(tokenize(facets.kind.join(" ")), 2);
      add(tokenize(facets.stack.join(" ")), 2);
      add(tokenize(facets.useFor.join(" ")), 2);

      let length = 0;
      for (const [term, count] of freq) {
        length += count;
        df.set(term, (df.get(term) ?? 0) + 1);
      }

      const doc: IndexedDoc = {
        link,
        category: group.title,
        freq,
        length,
        facets,
      };
      docs.push(doc);
      byHref.set(link.href, doc);
    }
  }

  const total = docs.reduce((sum, doc) => sum + doc.length, 0);
  return { docs, df, avgLength: total / Math.max(docs.length, 1), byHref };
}

// Generic English that often appears in catalog blurbs ("designed by",
// "case study"). When the query also has a content term (llm, react, …),
// down-weight these so they cannot outrank the real signal alone.
const WEAK_QUERY_TERMS = new Set(
  "designed built made using based create creating study studies internally actually really simple free best great useful popular modern".split(
    " ",
  ),
);

function toHit(doc: IndexedDoc, score: number): SearchHit {
  return {
    title: doc.link.title,
    href: doc.link.href,
    description: doc.link.description,
    category: doc.category,
    score: Number(score.toFixed(3)),
    kind: doc.facets.kind,
    stack: doc.facets.stack,
    useFor: doc.facets.useFor,
  };
}

/** Single-phrasing BM25. `rankExpanded` is the one that understands intent. */
export function rank(
  index: InspirationIndex,
  query: string,
  { limit = 12, category }: { limit?: number; category?: string } = {},
): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const wanted = category?.toLowerCase().trim();
  const hits: SearchHit[] = [];

  const hasStrongTerm = terms.some((term) => !WEAK_QUERY_TERMS.has(term));

  const termIdf = new Map<string, number>();
  for (const term of terms) {
    const docFreq = index.df.get(term) ?? 0;
    const idf = Math.log(
      1 + (index.docs.length - docFreq + 0.5) / (docFreq + 0.5),
    );
    termIdf.set(term, idf);
  }

  const strongTerms = terms.filter((term) => !WEAK_QUERY_TERMS.has(term));

  for (const doc of index.docs) {
    if (wanted && !doc.category.toLowerCase().includes(wanted)) continue;

    let score = 0;
    const matchedStrong: string[] = [];
    for (const term of terms) {
      const freq = doc.freq.get(term);
      if (!freq) continue;
      const idf = termIdf.get(term) ?? 0;
      const norm = 1 - B + (B * doc.length) / index.avgLength;
      const weak = hasStrongTerm && WEAK_QUERY_TERMS.has(term) ? 0.18 : 1;
      score += weak * idf * ((freq * (K1 + 1)) / (freq + K1 * norm));
      if (!WEAK_QUERY_TERMS.has(term)) matchedStrong.push(term);
    }

    // Multi-word asks like "animated footer" must not rank on only one half
    // ("animated" → icon libraries). Require full strong-term coverage for
    // short queries; for longer ones require the majority of strong terms.
    if (score > 0 && strongTerms.length >= 2) {
      const need =
        strongTerms.length <= 3
          ? strongTerms.length
          : Math.ceil(strongTerms.length * 0.6);
      if (matchedStrong.length < need) {
        score *= 0.08;
      }
    }

    if (score > 0.5) hits.push(toHit(doc, score));
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Query words that appear nowhere in the collection.
 *
 * Lexical scoring can only match shared vocabulary, so a question phrased in
 * words the entries never use is the one failure mode here, and it is silent:
 * you still get twelve confident-looking results. Surfacing the dead words
 * turns that into something the caller can act on by rewording.
 */
export function unmatchedInIndex(
  index: InspirationIndex,
  query: string,
): string[] {
  return [...new Set(tokenize(query))].filter((term) => !index.df.has(term));
}

/** Resolved facets for an indexed link, or null when the href is unknown. */
export function facetsFor(
  index: InspirationIndex,
  href: string,
): InspirationFacets | null {
  return index.byHref.get(href)?.facets ?? null;
}

const CATEGORY_HINT_BOOST = 4.2;
/** Full useFor phrase appears in the query (best signal). */
const USE_FOR_EXACT_BOOST = 6.5;
/** Every token of a useFor phrase appears somewhere in the query. */
const USE_FOR_TOKEN_BOOST = 2.2;
const KIND_HINT_BOOST = 1.8;
const STYLE_HINT_BOOST = 5.5;

function facetBoost(
  index: InspirationIndex,
  hit: SearchHit,
  query: string,
  categoryHints: string[],
  styleHints: string[],
): { boost: number; reasons: string[] } {
  const doc = index.byHref.get(hit.href);
  if (!doc) return { boost: 0, reasons: [] };

  const facets = doc.facets;
  const q = query.toLowerCase();
  const reasons: string[] = [];
  let boost = 0;

  if (categoryHints.includes(hit.category)) {
    boost += CATEGORY_HINT_BOOST;
    reasons.push(`category match (${hit.category})`);
  }

  const styleOverlap = facets.style.filter((s) => styleHints.includes(s));
  if (styleOverlap.length) {
    boost += STYLE_HINT_BOOST * styleOverlap.length;
    reasons.push(`style:${styleOverlap.join("+")}`);
  }

  // Prefer the longest useFor phrase contained in the query. Short phrases
  // like "designer portfolio" are substrings of "motion designer portfolio"
  // and would otherwise tie every portfolio entry at the same boost.
  let bestUseFor = 0;
  let bestUseForPhrase = "";
  for (const phrase of facets.useFor) {
    const p = phrase.toLowerCase();
    const words = p.split(/\s+/).filter(Boolean);
    if (q.includes(p)) {
      // Length-weighted exact containment.
      const score = USE_FOR_EXACT_BOOST + words.length * 2.4;
      if (score > bestUseFor) {
        bestUseFor = score;
        bestUseForPhrase = phrase;
      }
      continue;
    }
    const tokens = words.filter((w) => w.length > 2);
    // Loose token overlap only when no containment match exists yet, and only
    // for phrases of 3+ tokens so two-word category defaults do not flood.
    if (
      bestUseFor === 0 &&
      tokens.length >= 3 &&
      tokens.every((w) => q.includes(w))
    ) {
      bestUseFor = USE_FOR_TOKEN_BOOST;
      bestUseForPhrase = phrase;
    }
  }
  if (bestUseFor > 0) {
    boost += bestUseFor;
    reasons.push(`use-for "${bestUseForPhrase}"`);
  }

  // Kind-shaped asks.
  if (
    /\b(essay|article|guide|write-?up)\b/.test(q) &&
    facets.kind.includes("essay")
  ) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:essay");
  }
  if (
    /\b(library|package|kit|components?)\b/.test(q) &&
    facets.kind.includes("library")
  ) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:library");
  }
  if (
    /\b(gallery|inspiration|showcase)\b/.test(q) &&
    facets.kind.includes("gallery")
  ) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:gallery");
  }
  if (/\b(portfolio|studio)\b/.test(q) && facets.kind.includes("portfolio")) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:portfolio");
  }
  if (/\b(tool|cli|utility)\b/.test(q) && facets.kind.includes("tool")) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:tool");
  }
  if (/\b(video|youtube|talk)\b/.test(q) && facets.kind.includes("video")) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:video");
  }
  if (
    /\b(course|tutorial series|learning path)\b/.test(q) &&
    facets.kind.includes("course")
  ) {
    boost += KIND_HINT_BOOST;
    reasons.push("kind:course");
  }

  for (const s of facets.stack) {
    if (q.includes(s.toLowerCase())) {
      boost += 1.2;
      reasons.push(`stack:${s}`);
      break;
    }
  }

  // Title/description phrase echo: if the user asked for a specific role
  // ("motion designer") and the entry states it, that beats category defaults.
  const blob = `${hit.title} ${hit.description ?? ""}`.toLowerCase();
  for (const phrase of [
    "motion designer",
    "motion design",
    "design engineer",
    "creative developer",
    "product designer",
  ]) {
    if (q.includes(phrase) && blob.includes(phrase)) {
      boost += 9;
      reasons.push(`echo "${phrase}"`);
      break;
    }
  }

  return { boost, reasons };
}

export interface ExpandedRanking {
  query: string;
  variants: string[];
  categoryHints: string[];
  styleHints: string[];
  unmatched: string[];
  ranked: ScoredHit[];
}

/**
 * The full-intent ranking: expand the query into phrasings, merge BM25 pools,
 * then add facet boosts. Callers decide their own cutoffs on top of `ranked`,
 * which is why an agent can take a strict top 3 while the website shows every
 * match without the two disagreeing about what is actually most relevant.
 */
export function rankExpanded(
  index: InspirationIndex,
  query: string,
  { candidatePool = 40 }: { candidatePool?: number } = {},
): ExpandedRanking {
  const trimmed = query.trim();
  const empty: ExpandedRanking = {
    query: "",
    variants: [],
    categoryHints: [],
    styleHints: [],
    unmatched: [],
    ranked: [],
  };
  if (!trimmed) return empty;

  const variants = expandQuery(trimmed);
  const categoryHints = inferCategoryHints(trimmed);
  const styleHints = inferStyleHints(trimmed);
  const unmatched = unmatchedInIndex(index, trimmed);

  const byHref = new Map<string, ScoredHit>();

  for (const variant of variants) {
    // Primary phrasing counts more; synonym rewrites are supporting evidence.
    // Without this, "motion" → "micro-interaction" floods out the true best hit.
    const isPrimary =
      variant === trimmed ||
      variant === variants[0] ||
      variant === trimmed.toLowerCase();
    const weight = isPrimary ? 1.6 : 0.55;
    const hits = rank(index, variant, { limit: candidatePool });
    for (const hit of hits) {
      const prev = byHref.get(hit.href);
      const add = hit.score * weight;
      if (prev) {
        prev.score += add;
        if (!prev.variants.includes(variant)) prev.variants.push(variant);
      } else {
        byHref.set(hit.href, {
          hit,
          score: add,
          variants: [variant],
          reasons: [],
        });
      }
    }
  }

  // Multi-variant hits get a small cohesion bonus (same entry, different words).
  for (const acc of byHref.values()) {
    if (acc.variants.length > 1) {
      acc.score *= 1 + 0.08 * Math.min(acc.variants.length - 1, 4);
    }
    const { boost, reasons } = facetBoost(
      index,
      acc.hit,
      trimmed,
      categoryHints,
      styleHints,
    );
    acc.score += boost;
    acc.reasons = reasons;
  }

  return {
    query: trimmed,
    variants,
    categoryHints,
    styleHints,
    unmatched,
    ranked: [...byHref.values()].sort((a, b) => b.score - a.score),
  };
}
