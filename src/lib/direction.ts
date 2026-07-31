/**
 * Joint blank-direction lookup: registry first, then inspiration wall.
 * This is the single entry agents should call when choosing UI/build direction.
 */

import {
  type RecommendResult,
  recommendInspiration,
  recommendToMarkdown,
} from "./inspiration-recommend.ts";
import {
  type RegistryHit,
  registryHitsToMarkdown,
  searchRegistry,
} from "./registry-search.ts";

export interface DirectionResult {
  query: string;
  protocol: string[];
  registry: RegistryHit[];
  wall: RecommendResult;
  /** True when both sides are empty. */
  empty: boolean;
}

export function directionLookup(
  query: string,
  {
    registryLimit = 3,
    wallLimit = 3,
    section,
  }: {
    registryLimit?: number;
    wallLimit?: number;
    section?: "components" | "pages" | "backend" | "all";
  } = {},
): DirectionResult {
  const trimmed = query.trim();
  const registry = searchRegistry(trimmed, {
    limit: registryLimit,
    section: section ?? "all",
  });
  const wall = recommendInspiration(trimmed, { limit: wallLimit });
  return {
    query: trimmed,
    protocol: [
      "1. Prefer registry picks when the user is building/installing UI or backend patterns.",
      "2. Use wall picks for taste, reference, libraries to study, portfolios, craft.",
      "3. Cite every pick with its id (reg_* or insp_*).",
      "4. If both miss: say so, then off-wall options tagged outside-second-brain: …",
    ],
    registry,
    wall,
    empty: registry.length === 0 && wall.picks.length === 0,
  };
}

export function directionToMarkdown(result: DirectionResult): string {
  const lines: string[] = [
    `# Direction for "${result.query}"`,
    "",
    "_BLANK direction protocol: registry (install) → wall (taste) → memory (last, labeled)._",
    "",
    ...result.protocol.map((p) => `- ${p}`),
    "",
  ];

  if (result.registry.length) {
    lines.push(registryHitsToMarkdown(result.registry).trimEnd(), "");
  } else {
    lines.push(
      "## Registry picks",
      "",
      "_Nothing in the BLANK registry matched. Skip install suggestions from memory unless tagged outside-second-brain._",
      "",
    );
  }

  lines.push(recommendToMarkdown(result.wall).trimEnd(), "");

  lines.push(
    "---",
    "## Citation format (required)",
    "",
    "```",
    "From registry: <Title> (reg_<name>)",
    "From wall: <Title> (insp_<slug>) — <why>",
    "outside-second-brain: <name> — <why not on wall/registry>",
    "```",
    "",
  );

  if (result.empty) {
    lines.push(
      "**Both sides empty.** Say nothing in BLANK covers this, then you may suggest off-wall options with the outside-second-brain tag.",
      "",
    );
  }

  return lines.join("\n");
}
