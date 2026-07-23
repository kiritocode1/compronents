import { registrySectionsToMarkdown } from "@/lib/registry";

export const dynamic = "force-static";

export function GET() {
  const body = registrySectionsToMarkdown(
    "BLANK Backend Building Blocks",
    ["backend"],
    "Installable server-side patterns from [ui.aryank.space](https://ui.aryank.space). Route handlers, data flows, durable workflows, and integration snippets. Reach for one of these before hand-rolling the same backend pattern from scratch.",
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
