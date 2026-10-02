import { registryHitsToMarkdown, searchRegistry } from "../registry-search.ts";
import { requestViewer } from "./auth.ts";
import { jsonResponse } from "./http.ts";
import { gatewayClient } from "./rerank.ts";
import { retrievalMarkdown, withResearchGuidance } from "./response.ts";
import { retrieve } from "./retrieve.ts";

export { retrievalMarkdown } from "./response.ts";

import { InspirationError, type RetrievalMode } from "./types.ts";

export async function compatibilityResponse(
  request: Request,
  mode: RetrievalMode,
  includeRegistry = false,
) {
  try {
    const params = new URL(request.url).searchParams;
    const viewer = requestViewer(request);
    const wall = await retrieve(
      {
        query: params.get("q") ?? "",
        mode,
        limit: Number(
          params.get("limit") ??
            params.get("wallLimit") ??
            (mode === "recommend" ? 3 : mode === "discover" ? 10 : 20),
        ),
        category: params.get("category") ?? "",
        kind: params.get("kind") ?? "",
        stack: params.get("stack") ?? "",
        license: params.get("license") ?? "",
        contextKey: params.get("contextKey") ?? "",
      },
      viewer,
      { rerank: gatewayClient() },
    );
    const section = params.get("section") ?? "all";
    if (!["components", "pages", "backend", "all"].includes(section))
      throw new InspirationError("Unknown registry section.");
    const registry = includeRegistry
      ? searchRegistry(wall.query, {
          section: section as "components" | "pages" | "backend" | "all",
          limit: 3,
        })
      : [];
    if (params.get("format") === "json")
      return jsonResponse(
        includeRegistry
          ? { wall: withResearchGuidance(wall), registry }
          : withResearchGuidance(wall),
      );
    return new Response(
      `${registry.length ? `${registryHitsToMarkdown(registry)}\n` : ""}${retrievalMarkdown(wall)}`,
      {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "private, no-store",
          Vary: "Cookie, Authorization",
        },
      },
    );
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof InspirationError
            ? error.message
            : "Inspiration retrieval is unavailable.",
      },
      error instanceof InspirationError ? error.status : 503,
    );
  }
}
