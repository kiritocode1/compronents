import {
  buildRegistryItem,
  RegistryItemNotFoundError,
} from "@/lib/registry-server";

/**
 * Serves individual registry items at `/r/{name}.json`.
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
  const slug = (name?.join("/") ?? "").replace(/\.json$/, "");

  try {
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
