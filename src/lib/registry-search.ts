/**
 * Lexical search over BLANK registry installables (components, pages, backend).
 * Used by /registry/search and the blank-direction MCP / direction_lookup.
 */

import {
  getRegistryItemsBySection,
  type LibrarySectionId,
  type RegistryItem,
  registryItemUrl,
} from "./registry.ts";

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

function tokens(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9+#.-]*/g)
      ?.filter((w) => w.length > 1 && !STOP.has(w)) ?? []
  );
}

function scoreItem(
  item: RegistryItem,
  queryTerms: string[],
  queryRaw: string,
): number {
  if (queryTerms.length === 0) return 0;
  const titleT = new Set(tokens(item.title));
  const nameT = new Set(tokens(item.name.replace(/-/g, " ")));
  const descT = tokens(item.description);
  const catT = new Set(tokens(item.category ?? ""));
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
    if (catT.has(term)) {
      score += 3;
      hit = true;
    }
    const descHits = descT.filter((t) => t === term).length;
    if (descHits) {
      score += Math.min(descHits, 3) * 1.2;
      hit = true;
    }
    if ([...titleT].some((t) => t.includes(term) || term.includes(t))) {
      score += 1.5;
      hit = true;
    }
    if (hit) matched++;
  }

  // Multi-word queries need the whole phrase, not "footer" alone matching every footer.
  if (queryTerms.length >= 2 && matched < queryTerms.length) {
    score *= 0.35 + (0.65 * matched) / queryTerms.length;
  }

  return score;
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

  const hits: RegistryHit[] = [];
  for (const sec of sections) {
    for (const item of getRegistryItemsBySection(sec)) {
      const score = scoreItem(item, queryTerms, query);
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
  }

  hits.sort((a, b) => b.score - a.score);

  // Clear winner (exact name match): do not flood with every other "footer".
  if (
    hits.length >= 2 &&
    hits[0].score >= 40 &&
    hits[0].score >= hits[1].score * 1.5
  ) {
    return hits.slice(0, 1);
  }

  // Soft floor: drop stragglers far below the best match.
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
