/**
 * Opinionated recommend layer on top of the shared ranking engine.
 *
 * `rankExpanded` (inspiration-rank.ts) does the retrieval: expand the query,
 * merge multi-query BM25 scores, boost facets and category hints. This module
 * does the agent job on top of that ranking: drop weak matches, enforce
 * compound coverage, and return at most a few picks with a short why.
 *
 * The website search shares the same `rankExpanded` call and only differs in
 * the cutoffs it applies, which is the point: an agent wants a strict top 3,
 * a browsing human wants every match, and neither should disagree with the
 * other about what is most relevant.
 */

import { inspirationPickId } from "./inspiration-id.ts";
import { cleanQuery } from "./inspiration-meta.ts";
import {
  facetsFor,
  type InspirationIndex,
  rankExpanded,
  type SearchHit,
} from "./inspiration-rank.ts";
import { getInspirationIndex } from "./inspiration-search.ts";

export interface RecommendPick {
  /** Stable citation id, e.g. insp_lucide-animated. */
  id: string;
  title: string;
  href: string;
  description?: string;
  category: string;
  score: number;
  kind: string[];
  stack: string[];
  useFor: string[];
  style: string[];
  /** One-line reason this pick survived ranking. */
  why: string;
  /** Ready-to-paste citation line for agent answers. */
  cite: string;
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

function toPick(
  index: InspirationIndex,
  hit: SearchHit,
  score: number,
  reasons: string[],
  variantsHit: string[],
): RecommendPick {
  const facets = facetsFor(index, hit.href) ?? {
    kind: [],
    stack: [],
    useFor: [],
    style: [],
  };

  const whyParts = [
    ...reasons.slice(0, 2),
    variantsHit.length > 1
      ? `matched ${variantsHit.length} query variants`
      : null,
  ].filter(Boolean);

  const id = inspirationPickId(hit.title, hit.href);
  const why = whyParts.join("; ") || "strong lexical match";
  return {
    id,
    title: hit.title,
    href: hit.href,
    description: hit.description,
    category: hit.category,
    score: Number(score.toFixed(3)),
    kind: facets.kind,
    stack: facets.stack,
    useFor: facets.useFor,
    style: facets.style,
    why,
    cite: `From wall: ${hit.title} (${id}) — ${why}`,
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

  const index = getInspirationIndex();
  const { variants, categoryHints, styleHints, unmatched, ranked } =
    rankExpanded(index, trimmed, { candidatePool: CANDIDATE_POOL });

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
  // Absolute floor rises when the best hit is still weak (partial-term junk).
  const floor = Math.max(
    ABSOLUTE_FLOOR,
    best * RELATIVE_FLOOR,
    best < 25 ? best * 0.85 : 0,
  );
  let survivors = ranked.filter((acc) => acc.score >= floor);

  // Drop picks that miss content words of a short compound query.
  // Stops "animated footer" → animated icon packs. Use cleanQuery so fluff
  // like "something like" does not force every word onto the document.
  // Strict compound coverage only when the query is a concrete product phrase
  // (animated footer), not vibe rewrites that expand into craft synonyms.
  const strongWords =
    cleanQuery(trimmed)
      .match(/[a-z0-9][a-z0-9+#.-]*/g)
      ?.filter((w) => w.length > 2) ?? [];
  const isVibeQuery = styleHints.length > 0;
  if (!isVibeQuery && strongWords.length >= 2 && strongWords.length <= 3) {
    survivors = survivors.filter((acc) => {
      const blob =
        `${acc.hit.title} ${acc.hit.description ?? ""} ${acc.hit.category} ${(acc.hit.useFor ?? []).join(" ")}`.toLowerCase();
      const hits = strongWords.filter((w) => blob.includes(w));
      if (hits.length === strongWords.length) return true;
      return acc.score >= 40 && hits.length >= 1;
    });
  }

  const picks = survivors
    .slice(0, Math.min(limit, 5))
    .map((acc) => toPick(index, acc.hit, acc.score, acc.reasons, acc.variants));
  const alsoConsider = survivors
    .slice(picks.length, picks.length + 3)
    .map((acc) => toPick(index, acc.hit, acc.score, acc.reasons, acc.variants));

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
      pick.id,
      pick.category,
      pick.kind.length ? `kind: ${pick.kind.join("/")}` : null,
      pick.style.length ? `style: ${pick.style.join("+")}` : null,
      `score ${pick.score}`,
    ]
      .filter(Boolean)
      .join(" · ");
    lines.push(`${i + 1}. **[${pick.title}](${pick.href})** _(${meta})_`);
    lines.push(`   - why: ${pick.why}`);
    lines.push(`   - cite: \`${pick.cite}\``);
    if (pick.description) lines.push(`   - ${pick.description}`);
    lines.push("");
  }

  if (result.alsoConsider.length) {
    lines.push("## Also consider", "");
    for (const pick of result.alsoConsider) {
      lines.push(
        `- [${pick.title}](${pick.href}) \`${pick.id}\` _(${pick.category}, ${pick.score})_ — ${pick.why}`,
      );
    }
    lines.push("");
  }

  lines.push(
    "---",
    "Agent rules: recommend only from Picks (at most 3).",
    "Every recommendation MUST include the cite line with the insp_ id.",
    "Format: `From wall: <Title> (insp_<slug>) — <why>`",
    "If none fit: say so, then off-wall options as `outside-second-brain: <name> — <why>`.",
    "",
  );

  return lines.join("\n");
}
