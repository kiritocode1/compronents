/**
 * What the /inspiration search box does to the wall.
 *
 * Free-text path is real fuzzy search via Fuse.js (Bitap), with multi-term
 * scoring (OR + coverage bonus so "grain texture" and "grann texture" both
 * work), merged with the shared BM25 + facet engine for intent queries the
 * wall was written for ("like linear", "scroll driven animation").
 *
 * Empty query / shelf name keep wall order. Date phrases still come from
 * `parseTimeQuery`.
 */

import Fuse from "fuse.js";
import type { InspirationGroup, InspirationLink } from "./inspiration.ts";
import { resolveFacets } from "./inspiration-meta.ts";
import {
  buildInspirationIndex,
  type InspirationIndex,
  rankExpanded,
} from "./inspiration-rank.ts";
import { matchesDateRange, parseTimeQuery } from "./search-time.ts";

interface FuseDoc {
  link: InspirationLink;
  category: string;
  title: string;
  description: string;
  host: string;
  useFor: string;
  stack: string;
  kind: string;
}

/** Per-term Fuse cutoff (0 = perfect). ~0.55 still catches one-edit typos. */
const TERM_THRESHOLD = 0.58;
const PHRASE_THRESHOLD = 0.5;
const CANDIDATE_POOL = 300;
const RELATIVE_FLOOR = 0.4;
const ABSOLUTE_FLOOR = 4;
const FLOOR_REFERENCE_RANK = 4;

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function toDocs(groups: InspirationGroup[]): FuseDoc[] {
  const docs: FuseDoc[] = [];
  for (const group of groups) {
    for (const link of group.links) {
      const facets = resolveFacets(group.title, link);
      docs.push({
        link,
        category: group.title,
        title: link.title,
        description: link.description ?? "",
        host: hostOf(link.href),
        useFor: facets.useFor.join(" "),
        stack: facets.stack.join(" "),
        kind: facets.kind.join(" "),
      });
    }
  }
  return docs;
}

const fuseCache = new WeakMap<InspirationGroup[], Fuse<FuseDoc>>();
const indexCache = new WeakMap<InspirationGroup[], InspirationIndex>();

function fuseFor(groups: InspirationGroup[]): Fuse<FuseDoc> {
  let fuse = fuseCache.get(groups);
  if (!fuse) {
    fuse = new Fuse(toDocs(groups), {
      keys: [
        { name: "title", weight: 0.34 },
        { name: "useFor", weight: 0.26 },
        { name: "host", weight: 0.12 },
        { name: "stack", weight: 0.1 },
        { name: "category", weight: 0.08 },
        { name: "kind", weight: 0.04 },
        { name: "description", weight: 0.06 },
      ],
      threshold: 0.55,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
      shouldSort: true,
      fieldNormWeight: 0.75,
    });
    fuseCache.set(groups, fuse);
  }
  return fuse;
}

function indexFor(groups: InspirationGroup[]): InspirationIndex {
  let index = indexCache.get(groups);
  if (!index) {
    index = buildInspirationIndex(groups);
    indexCache.set(groups, index);
  }
  return index;
}

/**
 * Multi-term Fuse with OR + coverage: each query word is fuzzy-matched on its
 * own, a link needs at least one term (or a phrase hit), and matching more
 * terms raises the score. Returns higher-is-better scores in roughly [0, 1].
 */
function fuseScores(
  groups: InspirationGroup[],
  text: string,
): Map<string, number> {
  const fuse = fuseFor(groups);
  const terms = text
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .filter((t) => t.length > 1);

  type Row = {
    link: InspirationLink;
    /** best (lowest) fuse score per term index; 1 = unmatched */
    termBest: number[];
    phrase: number;
  };
  const byHref = new Map<string, Row>();

  const ensure = (link: InspirationLink): Row => {
    let row = byHref.get(link.href);
    if (!row) {
      row = {
        link,
        termBest: Array.from({ length: Math.max(terms.length, 1) }, () => 1),
        phrase: 1,
      };
      byHref.set(link.href, row);
    }
    return row;
  };

  for (let i = 0; i < terms.length; i++) {
    for (const hit of fuse.search(terms[i])) {
      const fuseScore = hit.score ?? 1;
      if (fuseScore > TERM_THRESHOLD) continue;
      const row = ensure(hit.item.link);
      row.termBest[i] = Math.min(row.termBest[i], fuseScore);
    }
  }

  for (const hit of fuse.search(text)) {
    const fuseScore = hit.score ?? 1;
    if (fuseScore > PHRASE_THRESHOLD) continue;
    const row = ensure(hit.item.link);
    row.phrase = Math.min(row.phrase, fuseScore);
  }

  const out = new Map<string, number>();
  const n = Math.max(terms.length, 1);

  for (const [href, row] of byHref) {
    const matched = row.termBest.filter((s) => s < TERM_THRESHOLD);
    const hasPhrase = row.phrase < PHRASE_THRESHOLD;
    if (matched.length === 0 && !hasPhrase) continue;

    // Multi-word queries: demand at least half the terms (ceil), so a single
    // weak "react" hit cannot pull in half the wall for "react animation library".
    const need = terms.length <= 1 ? 1 : Math.ceil(terms.length * 0.5);
    if (matched.length < need && !hasPhrase) continue;

    // Average inverted term scores over ALL query terms (unmatched count as 0).
    let termSum = 0;
    for (const s of row.termBest) {
      if (s < TERM_THRESHOLD) termSum += 1 - s;
    }
    const termPart = termSum / n;
    const phrasePart = hasPhrase ? 1 - row.phrase : 0;
    const coverage = matched.length / n;
    // Coverage bonus: hitting 2/2 terms beats hitting 1/2 strongly.
    const score =
      Math.max(termPart, phrasePart) *
      (0.65 + 0.35 * Math.max(coverage, hasPhrase ? 1 : 0));
    out.set(href, score);
  }
  return out;
}

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

  const text = words.join(" ");
  if (!text) return groups.map(inRange).filter(nonEmpty);

  const shelf = groups.find((group) => group.title.toLowerCase() === text);
  if (shelf) return [inRange(shelf)].filter(nonEmpty);

  const fuzzy = fuseScores(groups, text);
  const { ranked } = rankExpanded(indexFor(groups), text, {
    candidatePool: CANDIDATE_POOL,
  });

  // BM25 floor (raw scores), same logic as the previous browse path.
  let bmFloor = Number.POSITIVE_INFINITY;
  if (ranked.length > 0) {
    const reference =
      ranked[Math.min(FLOOR_REFERENCE_RANK, ranked.length - 1)].score;
    bmFloor = Math.max(ABSOLUTE_FLOOR, reference * RELATIVE_FLOOR);
  }
  const bestBm = ranked[0]?.score ?? 0;

  /** href → higher-is-better combined score */
  const scoreByHref = new Map<string, number>();

  for (const scored of ranked) {
    if (scored.score < bmFloor) continue;
    const bm = bestBm > 0 ? scored.score / bestBm : 0;
    const fu = fuzzy.get(scored.hit.href) ?? 0;
    // Intent + fuzzy agreement.
    scoreByHref.set(
      scored.hit.href,
      Math.max(bm, fu) + (fu > 0 && bm > 0 ? 0.1 : 0),
    );
  }

  // Pure fuzzy survivors (typos BM25 cannot see): e.g. "spriteshet", "grann".
  // ~0.42 is a solid single-edit title hit after inversion; stay above weak OR noise.
  for (const [href, fu] of fuzzy) {
    if (fu < 0.42) continue;
    const prev = scoreByHref.get(href) ?? 0;
    if (fu > prev) scoreByHref.set(href, fu);
  }

  if (scoreByHref.size === 0) return [];

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

  narrowed.sort((a, b) => {
    const aBest = Math.max(...a.links.map((l) => scoreByHref.get(l.href) ?? 0));
    const bBest = Math.max(...b.links.map((l) => scoreByHref.get(l.href) ?? 0));
    return bBest - aBest;
  });

  return narrowed;
}
