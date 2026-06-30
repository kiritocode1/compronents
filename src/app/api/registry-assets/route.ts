import {
  listRegistryAssets,
  requireRegistryAssetAdmin,
  uploadRegistryAsset,
} from "@/lib/blob-assets";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = requireRegistryAssetAdmin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix") ?? undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? 100);

  try {
    return Response.json(
      await listRegistryAssets({
        prefix,
        cursor,
        limit: Number.isFinite(limit) ? limit : 100,
      }),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list assets.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const authError = requireRegistryAssetAdmin(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const pathname = formData.get("pathname");
    const allowOverwrite = formData.get("allowOverwrite") === "true";

    if (!(file instanceof File)) {
      return Response.json(
        { error: "A file field is required." },
        { status: 400 },
      );
    }

    if (typeof pathname !== "string") {
      return Response.json(
        { error: "A pathname field is required." },
        { status: 400 },
      );
    }

    const blob = await uploadRegistryAsset({
      pathname,
      file,
      allowOverwrite,
    });

    return Response.json(
      {
        blob,
        servedFrom: `/assets/${blob.pathname}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload asset.",
      },
      { status: 400 },
    );
  }
}
