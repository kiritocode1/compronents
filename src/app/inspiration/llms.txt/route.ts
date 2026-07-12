import {
  inspirationGroups,
  inspirationGroupsToMarkdown,
} from "@/lib/inspiration";

export const dynamic = "force-static";

export function GET() {
  const body = inspirationGroupsToMarkdown(inspirationGroups);

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
