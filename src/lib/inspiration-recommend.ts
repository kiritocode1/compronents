/**
 * Opinionated recommend layer on top of BM25 search.
 *
 * searchInspiration returns a wide candidate pool. This does the agent job:
 * expand the query, merge multi-query scores, boost facets/category hints,
 * drop weak matches, return at most a few picks with a short why.
 */

import { inspirationGroups } from "./inspiration.ts";
import {
  expandQuery,
  inferCategoryHints,
  resolveFacets,
} from "./inspiration-meta.ts";
import {
  type SearchHit,
  searchInspiration,
  unmatchedTerms,
} from "./inspiration-search.ts";

export interface RecommendPick {
  title: string;
  href: string;
  description?: string;
  category: string;
  score: number;
  kind: string[];
  stack: string[];
  useFor: string[];
  /** One-line reason this pick survived ranking. */
  why: string;
}

export interface RecommendResult {
  query: string;
  variants: string[];
  categoryHints: string[];
  unmatched: string[];
  picks: RecommendPick[];
  /** Strong candidates that lost on the final cut; useful for the agent to mention. */
  alsoConsider: RecommendPick[];
}

const DEFAULT_LIMIT = 3;
const CANDIDATE_POOL = 40;
/** Keep a hit only if it is within this fraction of the best merged score. */
const RELATIVE_FLOOR = 0.32;
/** Absolute floor after merge; kills pure fluff matches. */
const ABSOLUTE_FLOOR = 4.5;
const CATEGORY_HINT_BOOST = 4.2;
/** Full useFor phrase appears in the query (best signal). */
const USE_FOR_EXACT_BOOST = 6.5;
/** Every token of a useFor phrase appears somewhere in the query. */
const USE_FOR_TOKEN_BOOST = 2.2;
const KIND_HINT_BOOST = 1.8;

function findLink(href: string) {
  for (const group of inspirationGroups) {
    for (const link of group.links) {
      if (link.href === href) return { group, link };
    }
  }
  return null;
}

function facetBoost(
  hit: SearchHit,
  query: string,
  categoryHints: string[],
): { boost: number; reasons: string[] } {
  const found = findLink(hit.href);
  if (!found) return { boost: 0, reasons: [] };

  const facets = resolveFacets(found.group.title, found.link);
  const q = query.toLowerCase();
  const reasons: string[] = [];
  let boost = 0;

  if (categoryHints.includes(hit.category)) {
    boost += CATEGORY_HINT_BOOST;
    reasons.push(`category match (${hit.category})`);
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

function toPick(
  hit: SearchHit,
  score: number,
  reasons: string[],
  variantsHit: string[],
): RecommendPick {
  const found = findLink(hit.href);
  const facets = found
    ? resolveFacets(found.group.title, found.link)
    : { kind: [], stack: [], useFor: [] };

  const whyParts = [
    ...reasons.slice(0, 2),
    variantsHit.length > 1
      ? `matched ${variantsHit.length} query variants`
      : null,
  ].filter(Boolean);

  return {
    title: hit.title,
    href: hit.href,
    description: hit.description,
    category: hit.category,
    score: Number(score.toFixed(3)),
    kind: facets.kind,
    stack: facets.stack,
    useFor: facets.useFor,
    why: whyParts.join("; ") || "strong lexical match",
  };
}

export function recommendInspiration(
  query: string,
  { limit = DEFAULT_LIMIT }: { limit?: number } = {},
): RecommendResult {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
      variants: [],
      categoryHints: [],
      unmatched: [],
      picks: [],
      alsoConsider: [],
    };
  }

  const variants = expandQuery(trimmed);
  const categoryHints = inferCategoryHints(trimmed);
  const unmatched = unmatchedTerms(trimmed);

  type Acc = {
    hit: SearchHit;
    score: number;
    variants: string[];
    reasons: string[];
  };
  const byHref = new Map<string, Acc>();

  for (const variant of variants) {
    // Primary phrasing counts more; synonym rewrites are supporting evidence.
    // Without this, "motion" → "micro-interaction" floods out the true best hit.
    const isPrimary =
      variant === trimmed ||
      variant === variants[0] ||
      variant === trimmed.toLowerCase();
    const weight = isPrimary ? 1.6 : 0.55;
    const hits = searchInspiration(variant, { limit: CANDIDATE_POOL });
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
    const { boost, reasons } = facetBoost(acc.hit, trimmed, categoryHints);
    acc.score += boost;
    acc.reasons = reasons;
  }

  const ranked = [...byHref.values()].sort((a, b) => b.score - a.score);
  if (ranked.length === 0) {
    return {
      query: trimmed,
      variants,
      categoryHints,
      unmatched,
      picks: [],
      alsoConsider: [],
    };
  }

  const best = ranked[0].score;
  const floor = Math.max(ABSOLUTE_FLOOR, best * RELATIVE_FLOOR);
  const survivors = ranked.filter((acc) => acc.score >= floor);

  const picks = survivors
    .slice(0, Math.min(limit, 5))
    .map((acc) => toPick(acc.hit, acc.score, acc.reasons, acc.variants));
  const alsoConsider = survivors
    .slice(picks.length, picks.length + 3)
    .map((acc) => toPick(acc.hit, acc.score, acc.reasons, acc.variants));

  return {
    query: trimmed,
    variants,
    categoryHints,
    unmatched,
    picks,
    alsoConsider,
  };
}

export function recommendToMarkdown(result: RecommendResult): string {
  const lines: string[] = [`# Recommend for "${result.query}"`, ""];

  if (result.unmatched.length) {
    lines.push(
      `_No entry uses: ${result.unmatched.join(", ")}. Reword if the picks miss._`,
      "",
    );
  }

  if (result.categoryHints.length) {
    lines.push(`_Category hints: ${result.categoryHints.join(", ")}_`, "");
  }

  lines.push(
    `_Variants searched: ${result.variants.map((v) => `"${v}"`).join(", ")}_`,
    "",
  );

  if (result.picks.length === 0) {
    lines.push(
      "No strong picks. Try a more specific ask (library name, technique, or category),",
      "or browse with `/inspiration/search?category=...`.",
      "",
    );
    return lines.join("\n");
  }

  lines.push("## Picks (use these)", "");
  for (const [i, pick] of result.picks.entries()) {
    const meta = [
      pick.category,
      pick.kind.length ? `kind: ${pick.kind.join("/")}` : null,
      `score ${pick.score}`,
    ]
      .filter(Boolean)
      .join(" · ");
    lines.push(`${i + 1}. **[${pick.title}](${pick.href})** _(${meta})_`);
    lines.push(`   - why: ${pick.why}`);
    if (pick.description) lines.push(`   - ${pick.description}`);
    lines.push("");
  }

  if (result.alsoConsider.length) {
    lines.push("## Also consider", "");
    for (const pick of result.alsoConsider) {
      lines.push(
        `- [${pick.title}](${pick.href}) _(${pick.category}, ${pick.score})_ — ${pick.why}`,
      );
    }
    lines.push("");
  }

  lines.push(
    "---",
    "Agent rules: recommend only from Picks (at most 3). Cite name + link.",
    "If none fit the user's intent, say so; do not invent off-wall alternatives",
    "unless you explicitly mark them as outside the second brain.",
    "",
  );

  return lines.join("\n");
}
