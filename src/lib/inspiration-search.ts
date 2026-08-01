/**
 * Server-side retrieval over the inspiration wall.
 *
 * The full feed is ~400KB of markdown, which is far past what an agent can
 * read in one shot, so `/inspiration/llms.txt` gets truncated and the pick is
 * made from whatever fraction survived. This narrows 1000+ links down to a
 * handful of candidates first; the agent does the semantic judgement on those.
 *
 * This module is only the binding of the wall data to the engine in
 * `inspiration-rank.ts`. The scoring itself lives there so the browser search
 * on /inspiration can run the identical ranking against the links it already
 * holds as props, instead of a weaker client-side approximation.
 */

// Relative + extension so `node --test` can import this directly, as
// registry.ts does with search-time.ts.
import { inspirationGroups } from "./inspiration.ts";
import {
  buildInspirationIndex,
  type InspirationIndex,
  rank,
  type SearchHit,
  unmatchedInIndex,
} from "./inspiration-rank.ts";

export type { SearchHit };

let cached: InspirationIndex | null = null;

/** The wall-bound index. Built once per process, on first query. */
export function getInspirationIndex(): InspirationIndex {
  cached ??= buildInspirationIndex(inspirationGroups);
  return cached;
}

export function searchInspiration(
  query: string,
  options: { limit?: number; category?: string } = {},
): SearchHit[] {
  return rank(getInspirationIndex(), query, options);
}

/**
 * Query words that appear nowhere in the collection.
 *
 * Lexical scoring can only match shared vocabulary, so a question phrased in
 * words the entries never use is the one failure mode here, and it is silent:
 * you still get twelve confident-looking results. Surfacing the dead words
 * turns that into something the caller can act on by rewording.
 */
export function unmatchedTerms(query: string): string[] {
  return unmatchedInIndex(getInspirationIndex(), query);
}

export function listByCategory(category: string, limit = 60): SearchHit[] {
  const wanted = category.toLowerCase().trim();
  const group = inspirationGroups.find(
    (candidate) =>
      candidate.title.toLowerCase() === wanted ||
      candidate.title.toLowerCase().includes(wanted),
  );
  if (!group) return [];

  return group.links.slice(0, limit).map((link) => ({
    title: link.title,
    href: link.href,
    description: link.description,
    category: group.title,
    score: 0,
  }));
}

export function categoryIndex(): { title: string; count: number }[] {
  return inspirationGroups.map((group) => ({
    title: group.title,
    count: group.links.length,
  }));
}

export function hitsToMarkdown(hits: SearchHit[]): string {
  return hits
    .map((hit) => {
      const suffix = hit.description ? `: ${hit.description}` : "";
      return `- [${hit.title}](${hit.href}) _(${hit.category})_${suffix}`;
    })
    .join("\n");
}
