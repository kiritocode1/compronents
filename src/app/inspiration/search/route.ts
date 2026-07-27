import {
  categoryIndex,
  hitsToMarkdown,
  listByCategory,
  searchInspiration,
  unmatchedTerms,
} from "@/lib/inspiration-search";

const USAGE = [
  "# Inspiration search",
  "",
  "Retrieval over the curated inspiration wall, so you never have to read the",
  "whole 400KB feed at /inspiration/llms.txt.",
  "",
  "- `/inspiration/search?q=scroll+driven+animation`: ranked matches",
  "- `/inspiration/search?q=grain+texture&limit=25`: widen the candidate pool",
  "- `/inspiration/search?category=Typography+tools`: browse one category",
  "- `/inspiration/search`: this page, with every category",
  "",
  "Run two or three differently worded queries and merge the results; each one",
  "is cheap, and the vocabulary in these descriptions varies.",
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
  const category = params.get("category")?.trim() ?? "";
  const limit = Math.min(Number(params.get("limit")) || 12, 50);

  if (!query && !category) {
    const categories = categoryIndex()
      .map((group) => `- ${group.title} (${group.count})`)
      .join("\n");
    return text(`${USAGE}## Categories\n\n${categories}\n`);
  }

  if (!query) {
    const hits = listByCategory(category, limit);
    if (hits.length === 0) {
      return text(`No category matching "${category}".\n\n${USAGE}`);
    }
    return text(`# ${hits[0].category}\n\n${hitsToMarkdown(hits)}\n`);
  }

  const hits = searchInspiration(query, {
    limit,
    category: category || undefined,
  });
  const dead = unmatchedTerms(query);
  const warning = dead.length
    ? `\n_No entry in the collection uses: ${dead.join(", ")}. ` +
      `These results matched on the rest of your query, so if none of them fit, ` +
      `reword with different vocabulary rather than trusting the ranking._\n`
    : "";

  if (hits.length === 0) {
    return text(
      `No matches for "${query}". Try fewer or more common words.\n${warning}\n${USAGE}`,
    );
  }

  return text(
    `# ${hits.length} matches for "${query}"\n${warning}\n${hitsToMarkdown(hits)}\n`,
  );
}
