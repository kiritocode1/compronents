const ASSET_ORIGIN = "https://compronents.dev";
export const ASSET_ROUTE_PREFIX = "/assets";

export type AssetProvider = "vercel-blob";

export interface AssetItem {
  id: string;
  label: string;
  provider: AssetProvider;
  pathname: string;
  fallbackPath: string;
  role: string;
  notes: string;
}

export const assetItems = [
  {
    id: "animated-footer-left-hand",
    label: "Animated Footer left hand source",
    provider: "vercel-blob",
    pathname: "animated-footer/blank-hand-right.png",
    fallbackPath: "/blank-hand-right.png",
    role: "Canvas-sampled source image for the left ASCII hand.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "animated-footer-right-hand",
    label: "Animated Footer right hand source",
    provider: "vercel-blob",
    pathname: "animated-footer/blank-hand-left.png",
    fallbackPath: "/blank-hand-left.png",
    role: "Canvas-sampled source image for the right ASCII hand.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
] as const satisfies readonly AssetItem[];

export function getAssetByPathname(pathname: string) {
  return assetItems.find((asset) => asset.pathname === pathname);
}

export function getAssetById(id: string) {
  return assetItems.find((asset) => asset.id === id);
}

export function getHostedAssetUrl(pathname: string) {
  return `${ASSET_ORIGIN}${ASSET_ROUTE_PREFIX}/${pathname}`;
}

export function getLocalAssetRoute(pathname: string) {
  return `${ASSET_ROUTE_PREFIX}/${pathname}`;
}
