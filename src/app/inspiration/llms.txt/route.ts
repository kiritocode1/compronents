import { inspirationIndexToMarkdown } from "@/lib/inspiration";

export const dynamic = "force-static";

// Compact by design: the full catalog moved to /inspiration/llms-full.txt so
// that fetching the well-known path can no longer blow an agent's context.
export function GET() {
  return new Response(inspirationIndexToMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
