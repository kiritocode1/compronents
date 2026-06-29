import { assetItems, getAssetByPathname, getBlobAssetUrl } from "@/lib/assets";

export function generateStaticParams() {
  return assetItems.map((asset) => ({
    pathname: asset.pathname.split("/"),
  }));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ pathname: string[] }> },
) {
  const { pathname } = await context.params;
  const asset = getAssetByPathname(pathname.join("/"));

  if (!asset) {
    return Response.json({ error: "Asset not found." }, { status: 404 });
  }

  const target = getBlobAssetUrl(asset) ?? asset.fallbackPath;
  return Response.redirect(new URL(target, request.url), 307);
}
