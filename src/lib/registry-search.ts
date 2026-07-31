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

function scoreItem(item: RegistryItem, queryTerms: string[]): number {
  if (queryTerms.length === 0) return 0;
  const titleT = new Set(tokens(item.title));
  const nameT = new Set(tokens(item.name.replace(/-/g, " ")));
  const descT = tokens(item.description);
  const catT = new Set(tokens(item.category ?? ""));
  let score = 0;
  for (const term of queryTerms) {
    if (nameT.has(term) || item.name.includes(term)) score += 6;
    if (titleT.has(term)) score += 5;
    if (catT.has(term)) score += 3;
    const descHits = descT.filter((t) => t === term).length;
    score += Math.min(descHits, 3) * 1.2;
    // Prefix / contains soft match on title
    if ([...titleT].some((t) => t.includes(term) || term.includes(t))) {
      score += 1.5;
    }
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
      const score = scoreItem(item, queryTerms);
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

  return hits.sort((a, b) => b.score - a.score).slice(0, Math.min(limit, 15));
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
