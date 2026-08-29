import {
  recommendInspiration,
  recommendToMarkdown,
} from "@/lib/inspiration-recommend";

const USAGE = [
  "# Inspiration recommend",
  "",
  "Opinionated top picks from the second brain. Prefer this over /search when",
  "you need something to recommend: multi-query expansion, facet boosts,",
  "weak-match cutoff, at most 3 picks with a why.",
  "",
  "For open-ended work, start with `/direction/discover?q=...` before planning.",
  "Inspect at most 3 candidates, apply what fits, compare the result, and cite influences.",
  "",
  "- `/inspiration/recommend?q=animated+icons`",
  "- `/inspiration/recommend?q=something+like+linear&limit=3`",
  "- `/inspiration/search?q=...` still exists for a wider candidate pool",
  "",
  "Agent contract: recommend only from the Picks section. Cite name + link.",
  "If picks miss the intent, say nothing in the directory fits; do not invent",
  "off-wall alternatives unless you mark them as outside the second brain.",
  "",
].join("\n");

function text(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const limit = Math.min(Number(params.get("limit")) || 3, 5);

  if (!query) {
    return text(USAGE);
  }

  const result = recommendInspiration(query, { limit });
  return text(recommendToMarkdown(result));
}
