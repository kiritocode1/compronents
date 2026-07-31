import { directionLookup, directionToMarkdown } from "@/lib/direction";

const USAGE = [
  "# BLANK direction",
  "",
  "Joint protocol for directing AI: registry (install) → wall (taste) → memory.",
  "",
  "- `/direction?q=animated+footer`",
  "- `/direction?q=something+like+linear&wallLimit=3&registryLimit=3`",
  "- section filter: `&section=components|pages|backend|all`",
  "",
  "Prefer this over calling registry and inspiration separately.",
  "Cite every pick with its id (reg_* or insp_*).",
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

  const wallLimit = Math.min(Number(params.get("wallLimit")) || 3, 5);
  const registryLimit = Math.min(Number(params.get("registryLimit")) || 3, 8);
  const sectionParam = params.get("section")?.trim() ?? "all";
  const section = (["components", "pages", "backend", "all"] as const).includes(
    sectionParam as "all",
  )
    ? (sectionParam as "components" | "pages" | "backend" | "all")
    : "all";

  const result = directionLookup(query, {
    wallLimit,
    registryLimit,
    section,
  });
  return text(directionToMarkdown(result));
}
