import {
  directionDiscoveryToMarkdown,
  discoverDirection,
} from "@/lib/direction-discover";

const USAGE = [
  "# BLANK direction discovery",
  "",
  "Use this before planning work with open UI, frontend, library, tool, or craft choices.",
  "",
  "- `/direction/discover?q=developer+tool+interface`",
  "- `/direction/discover?q=animated+footer&section=components&limit=10`",
  "",
  "Scan the 8 to 12 candidates, inspect at most 3, record the mechanism and why it fits,",
  "apply the useful parts, compare the result, and cite only sources that changed the work.",
  "Use `/direction?q=...` when the need is already concrete.",
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

  const limit = Math.min(Math.max(Number(params.get("limit")) || 10, 8), 12);
  const sectionParam = params.get("section")?.trim() ?? "all";
  const section = (["components", "pages", "backend", "all"] as const).includes(
    sectionParam as "all",
  )
    ? (sectionParam as "components" | "pages" | "backend" | "all")
    : "all";

  return text(
    directionDiscoveryToMarkdown(
      discoverDirection({ task: query, limit, section }),
    ),
  );
}
