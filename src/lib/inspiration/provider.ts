import type { InspirationDatabase } from "./db.ts";
import { reserveUsage } from "./store.ts";

export interface ProviderCandidate { id: string; resourceId: string; passageId?: string }
export interface SearchDocument {
  id: string;
  content: { title: string; text: string };
  metadata: { resourceId: string; passageId?: string };
}

export function hasSearchProvider() {
  return Boolean(process.env.UPSTASH_SEARCH_REST_URL && process.env.UPSTASH_SEARCH_REST_TOKEN);
}

/** REST uses an abort deadline, with no implicit retries or advanced reranking. */
async function providerRequest(path: string, body: unknown): Promise<unknown> {
  const url = process.env.UPSTASH_SEARCH_REST_URL;
  const token = process.env.UPSTASH_SEARCH_REST_TOKEN;
  if (!url || !token) throw new Error("Search provider is not configured.");
  const response = await fetch(`${url.replace(/\/$/, "")}/${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(1800), cache: "no-store",
  });
  if (!response.ok) throw new Error(`Search provider returned ${response.status}.`);
  const data = await response.json() as { result?: unknown; error?: unknown };
  if (data.error || data.result === undefined) throw new Error("Invalid search provider response.");
  return data.result;
}

export async function hybridCandidates(db: InspirationDatabase, query: string): Promise<ProviderCandidate[][]> {
  const month = new Date().toISOString().slice(0, 7);
  // Separate allocations total 18,000, leaving headroom under the 20,000 free quota.
  if (!await reserveUsage(db, `search:${month}`, 2, 14000)) throw new Error("Monthly hybrid search allowance reached.");
  const results = await Promise.all(["inspiration-cards", "inspiration-passages"].map(async index => {
    const rows = await providerRequest(`search/${index}`, {
      query, topK: 40, includeData: false, includeMetadata: true,
      semanticWeight: 0.5, inputEnrichment: false, reranking: false,
    });
    if (!Array.isArray(rows)) throw new Error("Invalid provider candidates.");
    return rows.flatMap((row: unknown): ProviderCandidate[] => {
      if (!row || typeof row !== "object") return [];
      const v = row as { id?: unknown; metadata?: { resourceId?: unknown; passageId?: unknown } };
      if (typeof v.id !== "string" || typeof v.metadata?.resourceId !== "string") return [];
      return [{ id: v.id, resourceId: v.metadata.resourceId,
        passageId: typeof v.metadata.passageId === "string" ? v.metadata.passageId : undefined }];
    });
  }));
  return results;
}

export async function indexDocuments(db: InspirationDatabase, index: "cards" | "passages", documents: SearchDocument[]) {
  for (const doc of documents) {
    if (JSON.stringify(doc.content).length > 4000) throw new Error(`Index content exceeds 4,000 characters for ${doc.id}. Split it before indexing.`);
  }
  const month = new Date().toISOString().slice(0, 7);
  // Charge per document conservatively, even when the provider counts a batch as one request.
  if (!await reserveUsage(db, `ingest:${month}`, documents.length, 4000)) throw new Error("Monthly indexing allowance reached. Resume next month or use a smaller pilot.");
  await providerRequest(`upsert-data/inspiration-${index}`, documents);
}
