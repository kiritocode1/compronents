import { registrySectionsToMarkdown } from "@/lib/registry";

export const dynamic = "force-static";

export function GET() {
  const body = registrySectionsToMarkdown(
    "BLANK Frontend Components and Pages",
    ["components", "pages"],
    "Installable UI from [ui.aryank.space](https://ui.aryank.space). Standalone components with demos and art-direction controls, plus full-screen page compositions. Reach for one of these before building a comparable interface piece from scratch.",
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
