import {
  type EngagementStrategy,
  resolveEngagement,
} from "./inspiration-engagement.ts";
import { inspirationPickId } from "./inspiration-id.ts";
import { facetsFor, rankExpanded, type ScoredHit } from "./inspiration-rank.ts";
import { getInspirationIndex } from "./inspiration-search.ts";

export type CandidateRole =
  | "installable"
  | "library"
  | "skill"
  | "tool"
  | "implementation"
  | "essay"
  | "case-study"
  | "portfolio"
  | "gallery"
  | "reference";

export type RelevanceBand = "exact" | "direct" | "adjacent";

export interface DiscoveryCandidate {
  id: `reg_${string}` | `insp_${string}`;
  source: "registry" | "wall";
  title: string;
  href: string;
  category: string;
  roles: readonly CandidateRole[];
  band: RelevanceBand;
  description?: string;
  score: number;
  matchedSignals: readonly string[];
  whySurfaced: string;
  engagement: EngagementStrategy;
  install?: string;
}

export interface WallDiscovery {
  query: string;
  candidates: readonly DiscoveryCandidate[];
  unmatched: readonly string[];
  coverage: {
    categories: readonly string[];
    roles: readonly CandidateRole[];
  };
  exhausted: boolean;
}

interface SelectOptions {
  limit: number;
  maxPerCategory: number;
  maxPerHost: number;
}

const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 8;
const MAX_LIMIT = 12;
const DEFAULT_POOL = 120;
const ELIGIBLE_POOL = 120;

export function clampDiscoveryLimit(limit = DEFAULT_LIMIT): number {
  return Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, Math.floor(limit)));
}

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function canonicalUrl(href: string): string {
  try {
    const url = new URL(href);
    url.hash = "";
    url.pathname = url.pathname.replace(/\/$/, "") || "/";
    return url.toString().toLowerCase();
  } catch {
    return href.toLowerCase();
  }
}

function rolesFor(
  kinds: readonly string[],
  engagement: EngagementStrategy,
): CandidateRole[] {
  const roles = new Set<CandidateRole>();
  for (const kind of kinds) {
    if (kind === "library") roles.add("library");
    else if (kind === "skill") roles.add("skill");
    else if (kind === "tool") roles.add("tool");
    else if (kind === "essay") roles.add("essay");
    else if (kind === "portfolio") roles.add("portfolio");
    else if (kind === "gallery") roles.add("gallery");
    else if (kind === "demo") roles.add("implementation");
    else roles.add("reference");
  }
  if (roles.size === 0) {
    if (engagement.mode === "search-source-catalog") roles.add("library");
    else if (
      engagement.mode === "use-evaluate" ||
      engagement.mode === "load-skill"
    ) {
      roles.add("tool");
    } else if (engagement.mode === "read-study") roles.add("essay");
    else if (engagement.mode === "curate-with-argent") roles.add("reference");
    else roles.add("reference");
  }
  return [...roles];
}

function toCandidate(
  scored: ScoredHit,
  index: number,
  bestScore: number,
): DiscoveryCandidate {
  const facets = facetsFor(getInspirationIndex(), scored.hit.href) ?? {
    kind: [],
    stack: [],
    useFor: [],
    style: [],
  };
  const engagement = resolveEngagement({
    source: "wall",
    category: scored.hit.category,
    kind: facets.kind,
  });
  const variantSignal = scored.variants[0]
    ? `matched query variant "${scored.variants[0]}"`
    : "positive catalog match";
  const matchedSignals = scored.reasons.length
    ? [...scored.reasons, variantSignal]
    : [variantSignal];
  const directFloor = Math.max(8, bestScore * 0.45);

  return {
    id: inspirationPickId(scored.hit.title, scored.hit.href),
    source: "wall",
    title: scored.hit.title,
    href: scored.hit.href,
    category: scored.hit.category,
    roles: rolesFor(facets.kind, engagement),
    band: index < 4 || scored.score >= directFloor ? "direct" : "adjacent",
    description: scored.hit.description,
    score: Number(scored.score.toFixed(3)),
    matchedSignals,
    whySurfaced: matchedSignals.slice(0, 2).join("; "),
    engagement,
  };
}

function deduplicate(
  candidates: readonly DiscoveryCandidate[],
): DiscoveryCandidate[] {
  const ids = new Set<string>();
  const urls = new Set<string>();
  const titleHosts = new Set<string>();
  return candidates.filter((candidate) => {
    const url = canonicalUrl(candidate.href);
    const titleHost = `${candidate.title.toLowerCase()}|${hostOf(candidate.href)}`;
    if (ids.has(candidate.id) || urls.has(url) || titleHosts.has(titleHost)) {
      return false;
    }
    ids.add(candidate.id);
    urls.add(url);
    titleHosts.add(titleHost);
    return true;
  });
}

function underCaps(
  candidate: DiscoveryCandidate,
  categoryCounts: Map<string, number>,
  hostCounts: Map<string, number>,
  maxPerCategory: number,
  maxPerHost: number,
): boolean {
  return (
    (categoryCounts.get(candidate.category) ?? 0) < maxPerCategory &&
    (hostCounts.get(hostOf(candidate.href)) ?? 0) < maxPerHost
  );
}

function addCandidate(
  candidate: DiscoveryCandidate,
  selected: DiscoveryCandidate[],
  selectedIds: Set<string>,
  categoryCounts: Map<string, number>,
  hostCounts: Map<string, number>,
) {
  selected.push(candidate);
  selectedIds.add(candidate.id);
  categoryCounts.set(
    candidate.category,
    (categoryCounts.get(candidate.category) ?? 0) + 1,
  );
  const host = hostOf(candidate.href);
  hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
}

export function diversifyCandidates(
  candidates: readonly DiscoveryCandidate[],
  options: SelectOptions,
): readonly DiscoveryCandidate[] {
  const pool = deduplicate(candidates).slice(0, ELIGIBLE_POOL);
  const selected: DiscoveryCandidate[] = [];
  const selectedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const hostCounts = new Map<string, number>();
  const seededRoles = new Set<CandidateRole>();

  for (const candidate of pool) {
    if (selected.length >= options.limit || seededRoles.size >= 5) break;
    const newRoles = candidate.roles.filter((role) => !seededRoles.has(role));
    if (newRoles.length === 0) continue;
    if (
      !underCaps(
        candidate,
        categoryCounts,
        hostCounts,
        options.maxPerCategory,
        options.maxPerHost,
      )
    ) {
      continue;
    }
    addCandidate(candidate, selected, selectedIds, categoryCounts, hostCounts);
    for (const role of newRoles) seededRoles.add(role);
  }

  const fill = (maxPerCategory: number, maxPerHost: number) => {
    for (const candidate of pool) {
      if (selected.length >= options.limit) break;
      if (selectedIds.has(candidate.id)) continue;
      if (
        !underCaps(
          candidate,
          categoryCounts,
          hostCounts,
          maxPerCategory,
          maxPerHost,
        )
      ) {
        continue;
      }
      addCandidate(
        candidate,
        selected,
        selectedIds,
        categoryCounts,
        hostCounts,
      );
    }
  };

  fill(options.maxPerCategory, options.maxPerHost);
  if (selected.length < options.limit) fill(options.limit, options.maxPerHost);
  if (selected.length < options.limit) fill(options.limit, options.limit);

  return selected;
}

export function discoverInspiration(
  query: string,
  {
    limit = DEFAULT_LIMIT,
    candidatePool = DEFAULT_POOL,
  }: { limit?: number; candidatePool?: number } = {},
): WallDiscovery {
  const trimmed = query.trim();
  const wanted = clampDiscoveryLimit(limit);
  const index = getInspirationIndex();
  const expanded = rankExpanded(index, trimmed, {
    candidatePool: Math.max(candidatePool, DEFAULT_POOL),
  });
  const bestScore = expanded.ranked[0]?.score ?? 0;
  const candidates = expanded.ranked.map((scored, position) =>
    toCandidate(scored, position, bestScore),
  );
  const selected = diversifyCandidates(candidates, {
    limit: wanted,
    maxPerCategory: 2,
    maxPerHost: 2,
  });

  return {
    query: trimmed,
    candidates: selected,
    unmatched: expanded.unmatched,
    coverage: {
      categories: [...new Set(selected.map((item) => item.category))],
      roles: [...new Set(selected.flatMap((item) => item.roles))],
    },
    exhausted: selected.length < wanted,
  };
}
