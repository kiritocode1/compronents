import { directionLookup } from "./direction.ts";
import {
  clampDiscoveryLimit,
  type DiscoveryCandidate,
  discoverInspiration,
} from "./inspiration-discover.ts";
import { resolveEngagement } from "./inspiration-engagement.ts";
import type { RecommendPick } from "./inspiration-recommend.ts";
import type { RegistryHit } from "./registry-search.ts";

type RegistrySection = "components" | "pages" | "backend" | "all";

export interface DirectionDiscovery {
  task: string;
  exact: readonly DiscoveryCandidate[];
  candidates: readonly DiscoveryCandidate[];
  coverage: {
    categories: readonly string[];
    roles: readonly DiscoveryCandidate["roles"][number][];
    sources: readonly ("registry" | "wall")[];
  };
  budget: { scanLimit: number; studyAttempts: 3 };
  unmatched: readonly string[];
  protocol: readonly string[];
}

function registryCandidate(hit: RegistryHit): DiscoveryCandidate {
  return {
    id: hit.id as `reg_${string}`,
    source: "registry",
    title: hit.title,
    href: hit.pageUrl,
    category: `Registry ${hit.section}${hit.category ? ` / ${hit.category}` : ""}`,
    roles: ["installable"],
    band: "exact",
    description: hit.description,
    score: hit.score,
    matchedSignals: ["strict registry match"],
    whySurfaced: "strict registry match",
    engagement: resolveEngagement({
      source: "registry",
      category: hit.category ?? hit.section,
      kind: [],
    }),
    install: hit.install,
  };
}

function wallExactCandidate(pick: RecommendPick): DiscoveryCandidate {
  const engagement = resolveEngagement({
    source: "wall",
    category: pick.category,
    kind: pick.kind,
  });
  return {
    id: pick.id as `insp_${string}`,
    source: "wall",
    title: pick.title,
    href: pick.href,
    category: pick.category,
    roles: pick.kind.includes("library")
      ? ["library"]
      : pick.kind.includes("skill")
        ? ["skill"]
        : pick.kind.includes("tool")
          ? ["tool"]
          : pick.kind.includes("essay")
            ? ["essay"]
            : pick.kind.includes("portfolio")
              ? ["portfolio"]
              : pick.kind.includes("gallery")
                ? ["gallery"]
                : ["reference"],
    band: "exact",
    description: pick.description,
    score: pick.score,
    matchedSignals: [pick.why],
    whySurfaced: pick.why,
    engagement,
  };
}

export function discoverDirection({
  task,
  section = "all",
  limit = 10,
}: {
  task: string;
  section?: RegistrySection;
  limit?: number;
}): DirectionDiscovery {
  const wanted = clampDiscoveryLimit(limit);
  const exactResult = directionLookup(task, {
    section,
    registryLimit: 3,
    wallLimit: 3,
  });
  const exact = [
    ...exactResult.registry.map(registryCandidate),
    ...exactResult.wall.picks.map(wallExactCandidate),
  ];
  const wall = discoverInspiration(task, { limit: 12 });
  const candidates: DiscoveryCandidate[] = [];
  const seen = new Set<string>();
  for (const candidate of [...exact, ...wall.candidates]) {
    if (candidates.length >= wanted) break;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    candidates.push(candidate);
  }

  return {
    task: task.trim(),
    exact,
    candidates,
    coverage: {
      categories: [...new Set(candidates.map((item) => item.category))],
      roles: [...new Set(candidates.flatMap((item) => item.roles))],
      sources: [...new Set(candidates.map((item) => item.source))],
    },
    budget: { scanLimit: wanted, studyAttempts: 3 },
    unmatched: wall.unmatched,
    protocol: [
      "Scan all candidates before choosing.",
      "Attempt to inspect at most three live sources.",
      "For each inspected source, name the mechanism, why it works here, and whether you will adopt, adapt, or reject it.",
      "Apply chosen mechanisms, then compare the result with the intended property.",
      "Cite only actual influences. Catalog descriptions and inaccessible sources are leads, not evidence of influence.",
    ],
  };
}

function laneFor(candidate: DiscoveryCandidate): string {
  if (
    candidate.band === "exact" ||
    candidate.roles.some((role) =>
      ["installable", "library", "skill", "tool"].includes(role),
    )
  ) {
    return "Use now";
  }
  if (candidate.band === "direct") return "Study mechanics";
  return "Broaden the frame";
}

export function directionDiscoveryToMarkdown(
  result: DirectionDiscovery,
): string {
  const lines = [
    `# BLANK taste preflight for "${result.task}"`,
    "",
    `Budget: scan ${result.budget.scanLimit}, attempt to inspect at most three live sources.`,
    "",
  ];

  for (const lane of ["Use now", "Study mechanics", "Broaden the frame"]) {
    const candidates = result.candidates.filter(
      (candidate) => laneFor(candidate) === lane,
    );
    if (candidates.length === 0) continue;
    lines.push(`## ${lane}`, "");
    for (const candidate of candidates) {
      lines.push(
        `- [${candidate.title}](${candidate.href}) \`${candidate.id}\` (${candidate.category})`,
        `  - surfaced by: ${candidate.whySurfaced}`,
        `  - next action: ${candidate.engagement.instruction}`,
        `  - evidence needed: ${candidate.engagement.evidenceRequired}`,
      );
      if (candidate.install)
        lines.push(`  - install: \`${candidate.install}\``);
    }
    lines.push("");
  }

  lines.push(
    "## Taste loop",
    "",
    ...result.protocol.map((step, index) => `${index + 1}. ${step}`),
    "",
  );
  return lines.join("\n");
}
