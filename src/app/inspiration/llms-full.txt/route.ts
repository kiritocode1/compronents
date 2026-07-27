import {
  inspirationGroups,
  inspirationGroupsToMarkdown,
} from "@/lib/inspiration";

export const dynamic = "force-static";

// The complete corpus, every link with its full description. Kept reachable so
// nothing is lost, but off the well-known path: /inspiration/llms.txt is the
// small index that points here, and most callers want the search endpoint.
export function GET() {
  const body = inspirationGroupsToMarkdown(inspirationGroups);

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
