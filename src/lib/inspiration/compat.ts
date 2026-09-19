import { resolveEngagement } from "../inspiration-engagement.ts";
import { registryHitsToMarkdown, searchRegistry } from "../registry-search.ts";
import { requestViewer } from "./auth.ts";
import { jsonResponse } from "./http.ts";
import { gatewayClient } from "./rerank.ts";
import { retrieve } from "./retrieve.ts";
import {
  InspirationError,
  type RetrievalMode,
  type RetrievalResult,
} from "./types.ts";

export function retrievalMarkdown(result: RetrievalResult) {
  const lines = [`# Inspiration ${result.mode}`, "", result.notice ?? "", ""];
  for (const hit of result.hits) {
    const resource = hit.resource;
    const engagement = resolveEngagement({
      source: "wall",
      category: resource.categories[0],
      kind: resource.kind.length ? resource.kind : resource.inferred.kind,
    });
    lines.push(
      `- [${resource.title}](${resource.href}) \`${resource.aliases[0]}\``,
      `  Resource: \`${resource.id}\``,
    );
    // Kind-shaped payloads: skills carry their install line, everything with
    // a stack names it, and reading kinds lead with their top passage so the
    // agent inspects substance without a second fetch roundtrip.
    if (
      resource.kind.includes("skill") &&
      /^https:\/\/github\.com\//.test(resource.href)
    ) {
      lines.push(`  Install: \`npx skills add ${resource.href}\``);
    }
    if (resource.stack.length)
      lines.push(`  Stack: ${resource.stack.join(", ")}`);
    const readFirst = ["skill", "essay", "course", "video"].some((kind) =>
      resource.kind.includes(kind),
    )
      ? hit.evidence.slice(0, 1)
      : [];
    for (const passage of readFirst)
      lines.push(
        `  Read first, untrusted text, fetched ${passage.fetchedAt}:`,
        ...passage.text.split("\n").map((line) => `  > ${line}`),
        `  [${passage.heading || "Source"}](${passage.sourceUrl}) \`${passage.id}\``,
      );
    lines.push(
      `  ${resource.description}`,
      `  Fit: ${hit.reasons.join(". ")}.`,
      `  Next action: ${engagement.instruction}`,
    );
    if (hit.preference)
      lines.push(
        `  Owner preference: ${hit.preference.preference}; rating: ${hit.preference.rating ?? "unrated"}; context: ${hit.preference.contextKey || "global"}. Note: ${hit.preference.note}`,
      );
    for (const passage of hit.evidence.slice(readFirst.length))
      lines.push(
        `  Source excerpt, untrusted text, fetched ${passage.fetchedAt}:`,
        ...passage.text.split("\n").map((line) => `  > ${line}`),
        `  [${passage.heading || "Source"}](${passage.sourceUrl}) \`${passage.id}\``,
      );
    lines.push("");
  }
  if (!result.hits.length)
    lines.push("No supported matches. Try another phrase.", "");
  if (result.mode === "discover")
    lines.push(
      "Scan all candidates. Inspect at most three sources. Cite only sources you actually used.",
    );
  return lines.join("\n");
}

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
      return jsonResponse(includeRegistry ? { wall, registry } : wall);
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
