/**
 * Post-inspo semantic gate. After import and retrieval checks, Jev judges
 * whether the entry is semantically sound from all collected data: the
 * catalog text, its facets, where retrieval surfaces it, and whether source
 * passages exist. Atomic Noul questions in one call, combined in code.
 *
 * Injectable evaluate function keeps tests hermetic; production passes the
 * AI SDK experimental_evaluate bound to typesafe-ai/jev on AI Gateway.
 */

export interface InspoEvidence {
  title: string;
  href: string;
  description: string;
  kind: string[];
  stack: string[];
  useFor: string[];
  license: string;
  categories: string[];
  dateAdded: string;
  exactRank: number | null;
  intentRanks: { intent: string; rank: number | null; topTitle: string }[];
  passageCount: number;
  firstPassageHeading: string;
}

export interface NoulVerdict {
  name: string;
  probability: number;
  pass: boolean;
}

export type EvaluateFn = (input: {
  model: string;
  state: string;
  questions: Record<string, { type: "boolean"; instructions: string }>;
}) => Promise<{ answers: Record<string, { probability?: number }> }>;

export const JEV_MODEL = "typesafe-ai/jev";
export const PASS_THRESHOLD = 0.5;

export function buildInspoState(evidence: InspoEvidence): string {
  const lines = [
    `Title: ${evidence.title}`,
    `URL: ${evidence.href}`,
    `Description: ${evidence.description}`,
    `Kind: ${evidence.kind.join(", ") || "unset"}`,
    `Stack: ${evidence.stack.join(", ") || "unset"}`,
    `Use-for: ${evidence.useFor.join("; ") || "unset"}`,
    `License: ${evidence.license}`,
    `Categories: ${evidence.categories.join(", ")}`,
    `Exact-title rank: ${evidence.exactRank ?? "not found"}`,
  ];
  for (const intent of evidence.intentRanks) {
    lines.push(
      `Intent "${intent.intent}" ranks #${intent.rank ?? "not found"}${intent.topTitle ? ` (top: ${intent.topTitle})` : ""}`,
    );
  }
  lines.push(
    `Source passages: ${evidence.passageCount}${evidence.firstPassageHeading ? ` (first: ${evidence.firstPassageHeading})` : ""}`,
  );
  return lines.join("\n");
}

const QUESTIONS: Record<string, string> = {
  describes_source:
    "The description accurately describes what the linked source is and does.",
  surfaces_for_uses:
    "Retrieval surfaces this resource for its stated use cases (exact title and intents rank).",
  facets_supported:
    "The kind, stack, and license tags are consistent with the description and retrieval behavior.",
};

/** Returns per-question verdicts plus an overall pass. Throws on gateway failure. */
export async function judgeInspo(
  evidence: InspoEvidence,
  evaluateFn: EvaluateFn,
): Promise<{ verdicts: NoulVerdict[]; pass: boolean; state: string }> {
  const state = buildInspoState(evidence);
  const questions = Object.fromEntries(
    Object.entries(QUESTIONS).map(([name, instructions]) => [
      name,
      { type: "boolean" as const, instructions },
    ]),
  );
  const result = await evaluateFn({ model: JEV_MODEL, state, questions });
  const verdicts = Object.keys(QUESTIONS).map((name) => {
    const probability = result.answers[name]?.probability;
    if (typeof probability !== "number" || Number.isNaN(probability)) {
      throw new Error(`Judge returned no probability for ${name}.`);
    }
    return { name, probability, pass: probability >= PASS_THRESHOLD };
  });
  return { verdicts, pass: verdicts.every((v) => v.pass), state };
}
