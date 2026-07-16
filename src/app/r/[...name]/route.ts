import { buildRegistryItemMarkdown } from "@/lib/registry-markdown";
import {
  buildRegistryItem,
  RegistryItemNotFoundError,
} from "@/lib/registry-server";

/**
 * Serves individual registry items at `/r/{name}.json` and complete handoff
 * documents at `/r/{name}.md`.
 *
 * Implemented as a catch-all because Turbopack does not route a dynamic
 * segment with a literal suffix (`[name].json`). The catalog at
 * `/r/registry.json` is a static segment, so it takes precedence over this.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string[] }> },
) {
  const { name } = await context.params;
  const requestedPath = name?.join("/") ?? "";
  const wantsMarkdown = requestedPath.endsWith(".md");
  const slug = requestedPath.replace(/\.(?:json|md)$/, "");

  try {
    if (wantsMarkdown) {
      const markdown = await buildRegistryItemMarkdown(slug);
      return new Response(markdown, {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    }

    const item = await buildRegistryItem(slug);
    return Response.json(item);
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return Response.json(
      { error: "Failed to load registry item." },
      { status: 500 },
    );
  }
}
