/**
 * Optional free-model rerank and query expansion through Vercel AI Gateway.
 *
 * Spend stays at zero by construction: only `-free` suffixed model IDs are
 * ever requested, which stop serving when the offer ends instead of billing.
 * The model ID reads from INSPIRATION_RERANK_MODEL with a free default, so a
 * retired model is a config change, not a code change.
 *
 * Every failure degrades to today's ranking. Callers catch and fall back.
 */

export interface RerankCandidate {
  id: string;
  title: string;
  description: string;
  categories: string[];
}

export interface RerankClient {
  rerank(query: string, candidates: RerankCandidate[]): Promise<string[]>;
  expand(query: string): Promise<string[]>;
}

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const DEFAULT_MODEL = "inclusionai/ling-3.0-flash-sante-free";
const TIMEOUT_MS = 8000;

/** Client when the gateway key is configured, otherwise undefined. Retrieval
 *  treats undefined as rerank-off and returns today's ranking unchanged. */
export function gatewayClient(): RerankClient | undefined {
  if (!process.env.AI_GATEWAY_API_KEY) return undefined;
  return {
    rerank: (query, candidates) => gatewayRerank(query, candidates),
    expand: (query) => gatewayExpand(query),
  };
}

function config() {
  const apiKey = process.env.AI_GATEWAY_API_KEY ?? "";
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.INSPIRATION_RERANK_MODEL || DEFAULT_MODEL,
  };
}

async function chat(
  model: string,
  apiKey: string,
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Gateway returned HTTP ${res.status}.`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("Gateway returned an empty completion.");
  return content;
}

/** Order candidate IDs best-first. Unknown IDs are ignored by the caller. */
export async function gatewayRerank(
  query: string,
  candidates: RerankCandidate[],
  rerank = chat,
): Promise<string[]> {
  const cfg = config();
  if (!cfg || !candidates.length)
    throw new Error("Rerank is unconfigured or has nothing to order.");
  const list = candidates
    .slice(0, 20)
    .map(
      (c, n) =>
        `${n + 1}. ${c.id} — ${c.title}: ${c.description.slice(0, 300)} (${c.categories.join(", ")})`,
    )
    .join("\n");
  const content = await rerank(
    cfg.model,
    cfg.apiKey,
    "You reorder resource IDs by fit for the query. Reply with a JSON array of IDs, best first. You may drop poor fits. Reply with nothing else.",
    `Query: ${query}\nCandidates:\n${list}`,
  );
  const match = content.match(/\[[\s\S]*?\]/);
  if (!match) throw new Error("Rerank reply contained no ID list.");
  const ids = JSON.parse(match[0]) as unknown;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    throw new Error("Rerank reply was not an ID list.");
  const known = new Set(candidates.map((c) => c.id));
  return ids.filter((id) => known.has(id));
}

/** Short variant phrases for the existing variant path. At most three. */
export async function gatewayExpand(
  query: string,
  expand = chat,
): Promise<string[]> {
  const cfg = config();
  if (!cfg || !query.trim())
    throw new Error("Expansion is unconfigured or the query is empty.");
  const content = await expand(
    cfg.model,
    cfg.apiKey,
    "You rewrite a resource-search query into short variant phrases. Reply with a JSON array of at most 3 strings, each under 8 words. Reply with nothing else.",
    `Query: ${query}`,
  );
  const match = content.match(/\[[\s\S]*?\]/);
  if (!match) throw new Error("Expansion reply contained no phrase list.");
  const phrases = JSON.parse(match[0]) as unknown;
  if (!Array.isArray(phrases))
    throw new Error("Expansion reply was not a list.");
  return phrases
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .slice(0, 3);
}
