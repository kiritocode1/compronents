import {
  deleteRegistryAsset,
  getRegistryAssetBlob,
  normalizeAssetPathname,
  requireRegistryAssetAdmin,
} from "@/lib/blob-assets";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ pathname: string[] }> },
) {
  const authError = requireRegistryAssetAdmin(request);
  if (authError) return authError;

  try {
    const { pathname } = await context.params;
    const safePathname = normalizeAssetPathname(pathname.join("/"));
    const blob = await getRegistryAssetBlob(safePathname);

    if (!blob) {
      return Response.json({ error: "Asset not found." }, { status: 404 });
    }

    return Response.json({ blob, servedFrom: `/assets/${blob.pathname}` });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to read asset.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ pathname: string[] }> },
) {
  const authError = requireRegistryAssetAdmin(request);
  if (authError) return authError;

  try {
    const { pathname } = await context.params;
    const deleted = await deleteRegistryAsset(
      pathname.join("/"),
      request.headers.get("if-match") ?? undefined,
    );

    return Response.json({ deleted });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete asset.",
      },
      { status: 400 },
    );
  }
}
