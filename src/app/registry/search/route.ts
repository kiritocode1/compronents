import { registryHitsToMarkdown, searchRegistry } from "@/lib/registry-search";

const USAGE = [
  "# Registry search",
  "",
  "Search BLANK installable components, pages, and backend items.",
  "",
  "- `/registry/search?q=footer`",
  "- `/registry/search?q=queue&section=backend&limit=5`",
  "",
  "For joint direction (registry + wall), use `/direction?q=...` instead.",
  "",
].join("\n");

function text(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  });
}

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  if (!query) return text(USAGE);

  const limit = Math.min(Number(params.get("limit")) || 5, 15);
  const sectionParam = params.get("section")?.trim() ?? "all";
  const section = (["components", "pages", "backend", "all"] as const).includes(
    sectionParam as "all",
  )
    ? (sectionParam as "components" | "pages" | "backend" | "all")
    : "all";

  const hits = searchRegistry(query, { limit, section });
  return text(
    `# Registry search for "${query}"\n\n${registryHitsToMarkdown(hits)}`,
  );
}
