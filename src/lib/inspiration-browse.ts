/**
 * What the /inspiration search box does to the wall.
 *
 * Same engine as the MCP (`rankExpanded` in inspiration-rank.ts), different
 * cutoffs: an agent owes the caller three picks, a person browsing wants every
 * link that is actually relevant. Keeping both on one ranking is the point, so
 * the website cannot quietly drift into being worse at search than the agents.
 *
 * Empty query / shelf name: groups and link order stay as on the wall.
 * Text query: the wall is narrowed AND reordered by relevance score, so the
 * best hit is not buried under an older link that merely shares a word.
 */

import type { InspirationGroup, InspirationLink } from "./inspiration.ts";
import {
  buildInspirationIndex,
  type InspirationIndex,
  rankExpanded,
} from "./inspiration-rank.ts";
import { matchesDateRange, parseTimeQuery } from "./search-time.ts";

/**
 * Keyed on the array identity, so the index is built once, lazily, on the first
 * real query, and survives a remount. The inspiration page already serializes
 * every link to the client as props, so the browser indexes what it holds
 * rather than importing (and re-shipping) the data module.
 */
const indexCache = new WeakMap<InspirationGroup[], InspirationIndex>();

function indexFor(groups: InspirationGroup[]): InspirationIndex {
  let index = indexCache.get(groups);
  if (!index) {
    index = buildInspirationIndex(groups);
    indexCache.set(groups, index);
  }
  return index;
}

/** Per-variant BM25 pool. Wide, because a person browsing wants every match. */
const CANDIDATE_POOL = 300;
/**
 * How far below the reference match a link can score and still show.
 *
 * `recommendInspiration` cuts hard because it owes an agent three picks. Here
 * the floor only drops partial-term noise: someone who knows a link is on the
 * wall should be able to find it.
 */
const RELATIVE_FLOOR = 0.4;
const ABSOLUTE_FLOOR = 4;
/**
 * The floor scales off the Nth best score, not the best.
 *
 * One runaway winner is common ("grain texture" → Grainrad scores far above
 * everything else) and against the top score it dragged the floor up until the
 * whole tail vanished: 13 genuinely relevant links collapsed to 1. Taking the
 * reference a few places down means a lone spike no longer speaks for the
 * query, while a query whose top hits all score alike is unaffected.
 */
const FLOOR_REFERENCE_RANK = 4;

/**
 * Narrow the wall to a query, which may carry a date phrase ("react added last
 * week"), be date-only ("last week"), name a shelf outright ("typography
 * tools"), or be plain text. Empty / date-only / shelf keep wall order. Text
 * search reorders links (and groups) by rank score.
 */
export function browseInspiration(
  groups: InspirationGroup[],
  rawQuery: string,
  now = new Date(),
): InspirationGroup[] {
  const { query, date, words } = parseTimeQuery(rawQuery, now);
  if (!query) return groups;

  const inRange = (group: InspirationGroup) => ({
    ...group,
    links: group.links.filter((link) => matchesDateRange(link.dateAdded, date)),
  });
  const nonEmpty = (group: InspirationGroup) => group.links.length > 0;

  // Date-only ask ("added last week"): the whole wall, narrowed to the range.
  const text = words.join(" ");
  if (!text) return groups.map(inRange).filter(nonEmpty);

  // Naming a shelf outright shows that shelf, whole and in registry order.
  const shelf = groups.find((group) => group.title.toLowerCase() === text);
  if (shelf) return [inRange(shelf)].filter(nonEmpty);

  const { ranked } = rankExpanded(indexFor(groups), text, {
    candidatePool: CANDIDATE_POOL,
  });
  if (ranked.length === 0) return [];

  const reference =
    ranked[Math.min(FLOOR_REFERENCE_RANK, ranked.length - 1)].score;
  const floor = Math.max(ABSOLUTE_FLOOR, reference * RELATIVE_FLOOR);

  // href → score for survivors only; used to sort within and across groups.
  const scoreByHref = new Map<string, number>();
  for (const scored of ranked) {
    if (scored.score >= floor) scoreByHref.set(scored.hit.href, scored.score);
  }

  const byScore = (a: InspirationLink, b: InspirationLink) =>
    (scoreByHref.get(b.href) ?? 0) - (scoreByHref.get(a.href) ?? 0);

  const narrowed = groups
    .map((group) => ({
      ...group,
      links: group.links
        .filter(
          (link) =>
            scoreByHref.has(link.href) &&
            matchesDateRange(link.dateAdded, date),
        )
        .sort(byScore),
    }))
    .filter(nonEmpty);

  // Strongest group first (its best remaining link).
  narrowed.sort((a, b) => {
    const aBest = Math.max(...a.links.map((l) => scoreByHref.get(l.href) ?? 0));
    const bBest = Math.max(...b.links.map((l) => scoreByHref.get(l.href) ?? 0));
    return bBest - aBest;
  });

  return narrowed;
}
