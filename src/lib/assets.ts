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

const accordionFramesAssets = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return {
    id: `accordion-frames-spotlight-${n}`,
    label: `Accordion Frames panel ${n}`,
    provider: "vercel-blob",
    pathname: `accordion-frames/spotlight-${n}.jpg`,
    fallbackPath: `/accordion-frames/spotlight-${n}.jpg`,
    role: "Panel image revealed when its slat is focused.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const asciiImageRevealAssets = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return {
    id: `ascii-image-reveal-img-${n}`,
    label: `ASCII Image Reveal frame ${n}`,
    provider: "vercel-blob",
    pathname: `ascii-image-reveal/img${n}.jpg`,
    fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/ascii-image-reveal/img${n}.jpg`,
    role: "Photo sampled into the staggered ASCII grid before the original image is revealed.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const detroitParisSliderAssets = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return {
    id: `detroit-paris-slider-img-${n}`,
    label: `Detroit Paris Slider image ${n}`,
    provider: "vercel-blob",
    pathname: `detroit-paris-slider/slide-img-${n}.jpg`,
    fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/detroit-paris-slider/slide-img-${n}.jpg`,
    role: "Looping slide image resized along the exponential infinite track.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const scrollTunnel3dAssets = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return {
    id: `scroll-tunnel-3d-img-${n}`,
    label: `Scroll Tunnel 3D image ${n}`,
    provider: "vercel-blob",
    pathname: `scroll-tunnel-3d/img-${n}.jpg`,
    fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/scroll-tunnel-3d/img-${n}.jpg`,
    role: "Photo placed on the tunnel rings and pulled past the camera on scroll.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const scrollWaveGalleryAssets = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return {
    id: `scroll-wave-gallery-img-${n}`,
    label: `Scroll Wave Gallery image ${n}`,
    provider: "vercel-blob",
    pathname: `scroll-wave-gallery/img-${n}.jpg`,
    fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/scroll-wave-gallery/img-${n}.jpg`,
    role: "Frame stacked in the column and swayed past the viewport on scroll.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

export const assetItems = [
  ...accordionFramesAssets,
  ...asciiImageRevealAssets,
  ...detroitParisSliderAssets,
  ...scrollTunnel3dAssets,
  ...scrollWaveGalleryAssets,
  {
    id: "preloader-reveal-logo",
    label: "Preloader Reveal backdrop mark",
    provider: "vercel-blob",
    pathname: "preloader-reveal/logo.png",
    fallbackPath:
      "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/preloader-reveal/logo.png",
    role: "Small annotation mark dashed into the white backdrop sheet.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "preloader-reveal-button-logo",
    label: "Preloader Reveal control mark",
    provider: "vercel-blob",
    pathname: "preloader-reveal/logo-light.png",
    fallbackPath:
      "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/preloader-reveal/logo-light.png",
    role: "Light mark centered in the boot control that fades as the ring resolves.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "ascii-logo-source",
    label: "ASCII Logo source wordmark",
    provider: "vercel-blob",
    pathname: "ascii-logo/logo.png",
    fallbackPath: "/ascii-logo/logo.png",
    role: "Canvas-sampled source image dissolved into the ASCII glyph grid.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    [1, 2, 3, 4, 5],
    (n) =>
      ({
        id: `portfolio-page-project-${n}`,
        label: `Portfolio Page project ${n}`,
        provider: "vercel-blob",
        pathname: `portfolio-page/project-${n}.jpg`,
        fallbackPath: `/portfolio-page/project-${n}.jpg`,
        role: "Project thumbnail revealed on hover and shown in the project view.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    Array.from({ length: 17 }, (_, i) => i + 1),
    (n) =>
      ({
        id: `award-list-img-${n}`,
        label: `Award List preview image ${n}`,
        provider: "vercel-blob",
        pathname: `award-list/img${n}.jpg`,
        fallbackPath: `/award-list/img${n}.jpg`,
        role: "Image tossed onto the corner preview pile when its row is hovered.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    [1, 2, 3, 4, 5],
    (n) =>
      ({
        id: `image-reveal-img-${n}`,
        label: `Image Reveal frame ${n}`,
        provider: "vercel-blob",
        pathname: `image-reveal/img-${n}.jpg`,
        fallbackPath: `/image-reveal/img-${n}.jpg`,
        role: "Stacked image wiped away on scroll to expose the next frame.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    ["default", "img1", "img2", "img3", "img4", "img5", "img6"],
    (name, i) =>
      ({
        id: `mosaic-flip-${name}`,
        label:
          i === 0 ? "Mosaic Flip idle image" : `Mosaic Flip project image ${i}`,
        provider: "vercel-blob",
        pathname: `mosaic-flip/${name}.jpg`,
        fallbackPath: `/mosaic-flip/${name}.jpg`,
        role:
          i === 0
            ? "Image shown on the cube wall at rest and on mouse-leave."
            : "Project image flipped onto the cube wall on hover.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "material-spotlight-model",
    label: "Material Spotlight model",
    provider: "vercel-blob",
    pathname: "material-spotlight/model.glb",
    fallbackPath: "/material-spotlight/model.glb",
    role: "GLB model lit by IBL and revealed by the cursor-driven shader patch.",
    notes:
      "Upload this GLB to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "inversa-scroll-hero",
    label: "Inversa Scroll hero image",
    provider: "vercel-blob",
    pathname: "inversa-scroll/hero-img.jpg",
    fallbackPath: "/inversa-scroll/hero-img.jpg",
    role: "Parallaxing hero photo masked and desaturated through the scroll.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "inversa-scroll-mask",
    label: "Inversa Scroll slat mask",
    provider: "vercel-blob",
    pathname: "inversa-scroll/mask.svg",
    fallbackPath: "/inversa-scroll/mask.svg",
    role: "SVG mask scaled to punch the inverted window through the overlay.",
    notes:
      "Upload this SVG to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "inversa-scroll-grid",
    label: "Inversa Scroll grid overlay",
    provider: "vercel-blob",
    pathname: "inversa-scroll/grid-overlay.svg",
    fallbackPath: "/inversa-scroll/grid-overlay.svg",
    role: "Wireframe grid SVG that fades in over the greyscale window.",
    notes:
      "Upload this SVG to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "overlay-menu-logo",
    label: "Overlay Menu logo mark",
    provider: "vercel-blob",
    pathname: "overlay-menu/logo.png",
    fallbackPath: "/overlay-menu/logo.png",
    role: "Small logo shown in the top-left of the navigation bar.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "overlay-menu-hero",
    label: "Overlay Menu hero backdrop",
    provider: "vercel-blob",
    pathname: "overlay-menu/hero.jpg",
    fallbackPath: "/overlay-menu/hero.jpg",
    role: "Background image used behind the menu in the demo and preview.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
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
