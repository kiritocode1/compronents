import { assetItems, getAssetByPathname } from "@/lib/assets";
import {
  getRegistryAssetServingUrl,
  normalizeAssetPathname,
} from "@/lib/blob-assets";

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
  let safePathname: string;

  try {
    safePathname = normalizeAssetPathname(pathname.join("/"));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid pathname." },
      { status: 400 },
    );
  }

  const target = await getRegistryAssetServingUrl(
    safePathname,
    getAssetByPathname(safePathname),
  );

  if (!target) {
    return Response.json({ error: "Asset not found." }, { status: 404 });
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(target, request.url).toString(),
      "Cache-Control": "public, max-age=60",
      // WebGL loaders (TextureLoader, GLTFLoader) request cross-origin assets
      // with crossOrigin="anonymous"; the browser CORS-checks this redirect
      // itself, so it must carry ACAO or the load fails with "Failed to fetch".
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
