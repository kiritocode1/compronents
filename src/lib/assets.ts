const ASSET_ORIGIN = "https://ui.aryank.space";
export const BLOB_PUBLIC_ORIGIN =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com";
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

const splitRevealPreloaderAssets = [
  {
    id: "split-reveal-preloader-hero",
    label: "Split Reveal Preloader hero",
    provider: "vercel-blob",
    pathname: "split-reveal-preloader/hero-img.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/split-reveal-preloader/hero-img.jpg`,
    role: "Hero backdrop revealed as the split preloader opens.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
];

const inkCoreLayoutAssets = [
  ["01", "1.png", "Tall monochrome editorial tile."],
  ["02", "2.png", "Vertical abstract ink tile."],
  ["03", "3.png", "Calligraphic monochrome tile."],
  ["04", "4.png", "Floral monochrome tile."],
  ["05", "5.png", "Opening monochrome tile."],
  ["07", "7-r2.png", "Wide ink field used by the loader and studio tile."],
  ["08", "8.png", "Shogi-board monochrome tile."],
  ["motion", "8.mp4", "Looping final editorial tile."],
  ["intro", "intro.mp4", "Monochrome intro film behind the loading status."],
  ["font", "switzer.ttf", "Variable display and UI font."],
].map(
  ([id, filename, role]) =>
    ({
      id: `ink-core-layout-${id}`,
      label: `Ink Core Layout ${id}`,
      provider: "vercel-blob",
      pathname: `ink-core-layout/${filename}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/ink-core-layout/${filename}`,
      role,
      notes: "Served from Vercel Blob at the stable registry pathname.",
    }) as const satisfies AssetItem,
);

const convergingIconsTextAssets = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return {
    id: `converging-icons-text-icon-${n}`,
    label: `Converging Icons Text icon ${n}`,
    provider: "vercel-blob",
    pathname: `converging-icons-text/icon_${n}.png`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/converging-icons-text/icon_${n}.png`,
    role: "Icon in the floating row that clones and flies into a headline slot.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const curtainRevealHeroAssets = [
  [
    "bg",
    "hero-bg.jpg",
    "Full-bleed hero backdrop that scales down as the reveal begins.",
  ],
  ["img-1", "hero-img-1.jpg", "First interior image in the cascade reveal."],
  ["img-2", "hero-img-2.jpg", "Second interior image in the cascade reveal."],
  ["img-3", "hero-img-3.jpg", "Third interior image in the cascade reveal."],
].map(
  ([id, filename, role]) =>
    ({
      id: `curtain-reveal-hero-${id}`,
      label: `Curtain Reveal Hero ${id}`,
      provider: "vercel-blob",
      pathname: `curtain-reveal-hero/${filename}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/curtain-reveal-hero/${filename}`,
      role,
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    }) as const satisfies AssetItem,
);

const slitRevealHeroAssets = [
  [
    "hero",
    "hero.jpg",
    "Lead hero image that narrows to a slit and rotates away.",
  ],
  [
    "outro-1",
    "hero-outro-img-1.jpg",
    "Top outro image clipped in from the top.",
  ],
  [
    "outro-2",
    "hero-outro-img-2.jpg",
    "Bottom outro image clipped in from the bottom.",
  ],
].map(
  ([id, filename, role]) =>
    ({
      id: `slit-reveal-hero-${id}`,
      label: `Slit Reveal Hero ${id}`,
      provider: "vercel-blob",
      pathname: `slit-reveal-hero/${filename}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/slit-reveal-hero/${filename}`,
      role,
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    }) as const satisfies AssetItem,
);

const tiltCardStackAssets = Array.from({ length: 4 }, (_, i) => {
  const n = i + 1;
  return {
    id: `tilt-card-stack-img-${n}`,
    label: `Tilt Card Stack image ${n}`,
    provider: "vercel-blob",
    pathname: `tilt-card-stack/img${n}.jpg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/tilt-card-stack/img${n}.jpg`,
    role: "Artwork filling the lower half of each stacked card.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const montageRevealHeroAssets = [
  {
    id: "montage-reveal-hero-logo",
    label: "Montage Reveal Hero logo",
    provider: "vercel-blob",
    pathname: "montage-reveal-hero/logo.png",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/montage-reveal-hero/logo.png`,
    role: "Sidebar mark that scales in after the counter finishes.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
  ...Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    return {
      id: `montage-reveal-hero-img-${n}`,
      label: `Montage Reveal Hero image ${n}`,
      provider: "vercel-blob",
      pathname: `montage-reveal-hero/img${n}.jpg`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/montage-reveal-hero/img${n}.jpg`,
      role: "Thumbnail that pops in and Flips across the frame during the intro.",
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    } as const satisfies AssetItem;
  }),
];

const shaderGridGalleryAssets = Array.from({ length: 25 }, (_, i) => {
  const n = i + 1;
  return {
    id: `shader-grid-gallery-img-${n}`,
    label: `Shader Grid Gallery image ${n}`,
    provider: "vercel-blob",
    pathname: `shader-grid-gallery/img${n}.jpeg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/shader-grid-gallery/img${n}.jpeg`,
    role: "Project still packed into the image atlas and tiled across the shader grid.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const cursorImageTrailAssets = [
  {
    id: "cursor-image-trail-hero",
    label: "Cursor Image Trail hero",
    provider: "vercel-blob",
    pathname: "cursor-image-trail/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/cursor-image-trail/hero.jpg`,
    role: "Dimmed hero backdrop behind the pointer image trail.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
  ...Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    return {
      id: `cursor-image-trail-img-${n}`,
      label: `Cursor Image Trail image ${n}`,
      provider: "vercel-blob",
      pathname: `cursor-image-trail/img${n}.jpeg`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/cursor-image-trail/img${n}.jpeg`,
      role: "Frame dropped into the pointer trail and revealed by the mask layers.",
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    } as const satisfies AssetItem;
  }),
];

const minimapScrubberAssets = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return {
    id: `minimap-scrubber-img-${n}`,
    label: `Minimap Scrubber image ${n}`,
    provider: "vercel-blob",
    pathname: `minimap-scrubber/img${n}.jpeg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/minimap-scrubber/img${n}.jpeg`,
    role: "Thumbnail in the filmstrip and the full frame shown in the preview.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const curvedPlaneSliderAssets = Array.from({ length: 7 }, (_, i) => {
  const n = i + 1;
  return {
    id: `curved-plane-slider-img-${n}`,
    label: `Curved Plane Slider image ${n}`,
    provider: "vercel-blob",
    pathname: `curved-plane-slider/img${n}.jpg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/curved-plane-slider/img${n}.jpg`,
    role: "Slide still painted into the repeating texture wrapped around the curved plane.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const rotatingHandScrollAssets = [
  {
    id: "rotating-hand-scroll-portrait",
    label: "Rotating Hand Scroll portrait",
    provider: "vercel-blob",
    pathname: "rotating-hand-scroll/portrait.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/rotating-hand-scroll/portrait.jpg`,
    role: "Portrait revealed inside the rotating hand and zoomed to fill the frame.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
];

const catalogSwapGalleryAssets = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return {
    id: `catalog-swap-gallery-img-${n}`,
    label: `Catalog Swap Gallery image ${n}`,
    provider: "vercel-blob",
    pathname: `catalog-swap-gallery/img${n}.jpg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/catalog-swap-gallery/img${n}.jpg`,
    role: "Documentary still used as a thumbnail, featured image, and blurred backdrop.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const filterScrubGalleryAssets = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  return {
    id: `filter-scrub-gallery-img-${n}`,
    label: `Filter Scrub Gallery image ${n}`,
    provider: "vercel-blob",
    pathname: `filter-scrub-gallery/img${n}.jpg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/filter-scrub-gallery/img${n}.jpg`,
    role: "Project card image in the mouse-scrubbed, category-filtered strip.",
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

const march2025TemplateAssetSources = [
  ["about/about-banner.jpg", "About banner", "About page image"],
  ["about/about-hero.jpg", "About hero", "About page image"],
  ["about/services-banner.jpg", "Services banner", "About page image"],
  ["about/tool-1.jpg", "Tool 1", "About page tool image"],
  ["about/tool-2.jpg", "Tool 2", "About page tool image"],
  ["about/tool-3.jpg", "Tool 3", "About page tool image"],
  ["about/tool-4.jpg", "Tool 4", "About page tool image"],
  ["about/tool-5.jpg", "Tool 5", "About page tool image"],
  ["about/tool-6.jpg", "Tool 6", "About page tool image"],
  [
    "fonts/messina-sans-mono/MessinaSansMono-Black.otf",
    "Messina Sans Mono Black",
    "Source font",
  ],
  [
    "fonts/messina-sans-mono/MessinaSansMono-Bold.otf",
    "Messina Sans Mono Bold",
    "Source font",
  ],
  [
    "fonts/messina-sans-mono/MessinaSansMono-Book.otf",
    "Messina Sans Mono Book",
    "Source font",
  ],
  [
    "fonts/messina-sans-mono/MessinaSansMono-Light.otf",
    "Messina Sans Mono Light",
    "Source font",
  ],
  [
    "fonts/messina-sans-mono/MessinaSansMono-Regular.otf",
    "Messina Sans Mono Regular",
    "Source font",
  ],
  [
    "fonts/messina-sans-mono/MessinaSansMono-SemiBold.otf",
    "Messina Sans Mono SemiBold",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-Black.otf",
    "Messina Sans Black",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-BlackItalic.otf",
    "Messina Sans Black Italic",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-Bold.otf",
    "Messina Sans Bold",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-BoldItalic.otf",
    "Messina Sans Bold Italic",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-Book.otf",
    "Messina Sans Book",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-BookItalic.otf",
    "Messina Sans Book Italic",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-Light.otf",
    "Messina Sans Light",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-LightItalic.otf",
    "Messina Sans Light Italic",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-Regular.otf",
    "Messina Sans Regular",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-RegularItalic.otf",
    "Messina Sans Regular Italic",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-SemiBold.otf",
    "Messina Sans SemiBold",
    "Source font",
  ],
  [
    "fonts/messina-sans/MessinaSans-SemiBoldItalic.otf",
    "Messina Sans SemiBold Italic",
    "Source font",
  ],
  ["fonts/rader/PPRader-Bold.ttf", "Rader Bold", "Source font"],
  ["fonts/rader/PPRader-BoldItalic.ttf", "Rader Bold Italic", "Source font"],
  ["fonts/rader/PPRader-Hairline.ttf", "Rader Hairline", "Source font"],
  [
    "fonts/rader/PPRader-HairlineItalic.ttf",
    "Rader Hairline Italic",
    "Source font",
  ],
  ["fonts/rader/PPRader-Italic.ttf", "Rader Italic", "Source font"],
  ["fonts/rader/PPRader-Medium.ttf", "Rader Medium", "Source font"],
  [
    "fonts/rader/PPRader-MediumItalic.ttf",
    "Rader Medium Italic",
    "Source font",
  ],
  ["fonts/rader/PPRader-Regular.ttf", "Rader Regular", "Source font"],
  ["fonts/rader/PPRader-Thin.ttf", "Rader Thin", "Source font"],
  ["fonts/rader/PPRader-ThinItalic.ttf", "Rader Thin Italic", "Source font"],
  ["home/hero.jpg", "Home hero", "Home page hero image"],
  ["project/banner.jpg", "Project banner", "Project detail image"],
  ["project/project-1.jpg", "Project 1", "Project detail image"],
  ["project/project-2.jpg", "Project 2", "Project detail image"],
  ["project/project-3.jpg", "Project 3", "Project detail image"],
  ["project/project-4.jpg", "Project 4", "Project detail image"],
  ["project/project-5.jpg", "Project 5", "Project detail image"],
  ["reviews/review-1.jpg", "Review 1", "Review thumbnail image"],
  ["reviews/review-2.jpg", "Review 2", "Review thumbnail image"],
  ["reviews/review-3.jpg", "Review 3", "Review thumbnail image"],
  ["site-icon.png", "Site icon", "Source site icon"],
  ["work/work-1.jpg", "Work 1", "Work carousel image"],
  ["work/work-2.jpg", "Work 2", "Work carousel image"],
  ["work/work-3.jpg", "Work 3", "Work carousel image"],
  ["work/work-4.jpg", "Work 4", "Work carousel image"],
  ["work/work-5.jpg", "Work 5", "Work carousel image"],
] as const;

const march2025TemplateAssets = march2025TemplateAssetSources.map(
  ([pathname, label, role]) =>
    ({
      id: `march-2025-${pathname
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      label: `March 2025 ${label}`,
      provider: "vercel-blob",
      pathname: `march-2025-template/${pathname}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/march-2025-template/${pathname}`,
      role: `${role} from the March 2025 source template.`,
      notes:
        "Uploaded to Vercel Blob with a stable pathname for the March 2025 registry page template.",
    }) as const satisfies AssetItem,
);

const creativeClutterIds = [
  "music",
  "cd",
  "dialog",
  "folder",
  "macmini",
  "paper",
  "passport",
  "portrait",
  "appicon",
  "lighter",
  "cursor",
];
const creativeClutterAssets = creativeClutterIds.map(
  (id) =>
    ({
      id: `creative-clutter-${id}`,
      label: `Creative Clutter ${id}`,
      provider: "vercel-blob",
      pathname: `creative-clutter/${id}.png`,
      fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/creative-clutter/${id}.png`,
      role: "Transparent cutout prop arranged on the desk and reflowed between layouts.",
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    }) as const satisfies AssetItem,
);

const crtDisplayAssets = [
  {
    id: "crt-display-model",
    label: "CRT Display monitor model",
    provider: "vercel-blob",
    pathname: "crt-display/monitor.glb",
    fallbackPath:
      "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/crt-display/monitor.glb",
    role: "GLB monitor model that holds the curved CRT screen plane.",
    notes:
      "Upload this GLB to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
  {
    id: "crt-display-default",
    label: "CRT Display default frame",
    provider: "vercel-blob",
    pathname: "crt-display/default.jpg",
    fallbackPath:
      "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/crt-display/default.jpg",
    role: "Image shown on the tube at rest and on pointer leave.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
  ...Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return {
      id: `crt-display-project-${n}`,
      label: `CRT Display project ${n}`,
      provider: "vercel-blob",
      pathname: `crt-display/project-img-${n}.jpg`,
      fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/crt-display/project-img-${n}.jpg`,
      role: "Frame loaded onto the tube when its project name is hovered.",
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    } as const satisfies AssetItem;
  }),
];

const fallingTagListAssets = Array.from({ length: 9 }, (_, i) => {
  const service = Math.floor(i / 3) + 1;
  const img = (i % 3) + 1;
  return {
    id: `falling-tag-list-service-${service}-img-${img}`,
    label: `Falling Tag List service ${service} image ${img}`,
    provider: "vercel-blob",
    pathname: `falling-tag-list/service_${service}_img_${img}.jpg`,
    fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/falling-tag-list/service_${service}_img_${img}.jpg`,
    role: "Thumbnail fanned up behind a service name on hover.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const frameScrollAssets = [
  {
    id: "frame-scroll-hero",
    label: "Frame Scroll hero image",
    provider: "vercel-blob",
    pathname: "frame-scroll/hero.jpg",
    fallbackPath:
      "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/frame-scroll/hero.jpg",
    role: "Full-bleed hero photo that shrinks to a tile as the hero pins.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
  ...Array.from({ length: 16 }, (_, i) => {
    const n = i + 1;
    return {
      id: `frame-scroll-img-${n}`,
      label: `Frame Scroll thumbnail ${n}`,
      provider: "vercel-blob",
      pathname: `frame-scroll/img-${n}.jpg`,
      fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/frame-scroll/img-${n}.jpg`,
      role: "Thumbnail drifting in one of the four parallax columns.",
      notes:
        "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
    } as const satisfies AssetItem;
  }),
];

const spiralGalleryAssets = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return {
    id: `spiral-gallery-img-${n}`,
    label: `Spiral Gallery image ${n}`,
    provider: "vercel-blob",
    pathname: `spiral-gallery/img-${n}.jpg`,
    fallbackPath: `https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/spiral-gallery/img-${n}.jpg`,
    role: "Image mapped onto the curved tiles cycling around the helix.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const archiveCommercePageAssets = [
  {
    id: "archive-commerce-page-hero",
    label: "Archive Commerce Page hero motion",
    provider: "vercel-blob",
    pathname: "archive-commerce-page/hero.gif",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/archive-commerce-page/hero.gif`,
    role: "Animated visual used as the hero's central archive window.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
  ...Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    const file = `product_${String(n).padStart(3, "0")}.jpeg`;
    return {
      id: `archive-commerce-page-product-${n}`,
      label: `Archive Commerce Page product ${n}`,
      provider: "vercel-blob",
      pathname: `archive-commerce-page/product_images/${file}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/archive-commerce-page/product_images/${file}`,
      role: "Product surface from the Format Archive catalogue and product detail routes.",
      notes:
        "Uploaded to Vercel Blob with the source pathname for the Format Archive static site bundle.",
    } as const satisfies AssetItem;
  }),
  ...Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    const file = `article_${String(n).padStart(3, "0")}.jpeg`;
    return {
      id: `archive-commerce-page-article-${n}`,
      label: `Archive Commerce Page note ${n}`,
      provider: "vercel-blob",
      pathname: `archive-commerce-page/article_images/${file}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/archive-commerce-page/article_images/${file}`,
      role: "Editorial image from the Format Archive editorial routes.",
      notes:
        "Uploaded to Vercel Blob with the source pathname for the Format Archive static site bundle.",
    } as const satisfies AssetItem;
  }),
];

const interiorStudioPageAssetSources = [
  "archive/archive-1.jpg",
  "archive/archive-2.jpg",
  "archive/archive-3.jpg",
  "archive/archive-4.jpg",
  "archive/archive-5.jpg",
  "archive/archive-6.jpg",
  "archive/archive-7.jpg",
  "archive/archive-8.jpg",
  "archive/archive-9.jpg",
  "archive/archive-10.jpg",
  "archive/archive-11.jpg",
  "archive/archive-12.jpg",
  "archive/archive-13.jpg",
  "archive/archive-14.jpg",
  "archive/archive-15.jpg",
  "archive/archive-16.jpg",
  "archive/archive-17.jpg",
  "archive/archive-18.jpg",
  "archive/archive-19.jpg",
  "archive/archive-20.jpg",
  "client-reviews/client-review-1.jpg",
  "client-reviews/client-review-2.jpg",
  "client-reviews/client-review-3.jpg",
  "client-reviews/client-review-4.jpg",
  "client-reviews/client-review-5.jpg",
  "clients/client-1.jpg",
  "clients/client-2.jpg",
  "clients/client-3.jpg",
  "clients/client-4.jpg",
  "clients/client-5.jpg",
  "contact/contact-img.jpg",
  "featured-projects/featured-work-1.jpg",
  "featured-projects/featured-work-2.jpg",
  "featured-projects/featured-work-3.jpg",
  "featured-projects/featured-work-4.jpg",
  "gallery-callout/gallery-callout-1.jpg",
  "gallery-callout/gallery-callout-2.jpg",
  "gallery-callout/gallery-callout-3.jpg",
  "gallery-callout/gallery-callout-4.jpg",
  "home/hero.jpg",
  "home/home-cta-window.jpg",
  "how-we-work/process-1.jpg",
  "how-we-work/process-2.jpg",
  "how-we-work/process-3.jpg",
  "how-we-work/process-4.jpg",
  "logos/terrene-footer-logo.svg",
  "logos/terrene-logo-symbol.png",
  "logos/terrene-logo.png",
  "sample-space/hero.jpg",
  "sample-space/next-project.jpg",
  "sample-space/sample-space-1.jpg",
  "sample-space/sample-space-2.jpg",
  "spaces/client-1.jpeg",
  "spaces/client-2.jpeg",
  "spaces/client-3.jpeg",
  "spaces/client-4.jpeg",
  "spaces/client-5.jpeg",
  "spaces/client-6.jpeg",
  "spaces/client-7.jpeg",
  "spaces/space-1.jpg",
  "spaces/space-2.jpg",
  "spaces/space-3.jpg",
  "spaces/space-4.jpg",
  "spaces/space-5.jpg",
  "spaces/space-6.jpg",
  "spaces/space-7.jpg",
  "spotlight/spotlight-img-1.jpg",
  "spotlight/spotlight-img-2.jpg",
  "spotlight/spotlight-img-3.jpg",
  "spotlight/spotlight-img-4.jpg",
  "spotlight/spotlight-img-5.jpg",
  "spotlight/spotlight-img-6.jpg",
  "spotlight/spotlight-img-7.jpg",
  "spotlight/spotlight-img-8.jpg",
  "spotlight/spotlight-img-9.jpg",
  "spotlight/spotlight-img-10.jpg",
  "studio/about-cta-window.jpg",
  "studio/about-hero.png",
] as const;

const interiorStudioPageAssets = interiorStudioPageAssetSources.map(
  (pathname) =>
    ({
      id: `interior-studio-page-${pathname
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      label: `Interior Studio Page ${pathname
        .replace(/\.[^.]+$/, "")
        .replace(/[-_/]+/g, " ")}`,
      provider: "vercel-blob",
      pathname: `interior-studio-page/${pathname}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/interior-studio-page/${pathname}`,
      role: "Source media from the Terrene static website template.",
      notes:
        "Uploaded to Vercel Blob with the source pathname for the Terrene static site bundle.",
    }) as const satisfies AssetItem,
);

const diningRoomPageAssetPaths = [
  "about/about-hero.jpg",
  "about/about-image-banner.jpg",
  "about/sticky-card-1.jpg",
  "about/sticky-card-2.jpg",
  "about/sticky-card-3.jpg",
  "about/sticky-card-4.jpg",
  "about/sticky-card-5.jpg",
  "about/sticky-card-6.jpg",
  "chefs/avatar1.jpg",
  "chefs/avatar2.jpg",
  "chefs/avatar3.jpg",
  "chefs/avatar4.jpg",
  "chefs/avatar5.jpg",
  "chefs/avatar6.jpg",
  "chefs/avatar7.jpg",
  "chefs/avatar8.jpg",
  "cta/cta-img.jpg",
  "dining-menu/dining-menu-breakfast.jpg",
  "dining-menu/dining-menu-drinks.jpg",
  "dining-menu/dining-menu-foodsharing.jpg",
  "dining-menu/dining-menu-ice-cream.jpg",
  "dining-menu/dining-menu-pizza.jpg",
  "dining-menu/dining-menu.jpg",
  "footer/footer-img-1.jpg",
  "footer/footer-img-2.jpg",
  "footer/footer-img-3.jpg",
  "footer/footer-img-4.jpg",
  "footer/footer-img-5.jpg",
  "home/about-1.jpg",
  "home/about-2.jpg",
  "home/about-3.jpg",
  "home/about-4.jpg",
  "home/about-5.jpg",
  "home/about-6.jpg",
  "home/hero.jpg",
  "home/image-banner.jpg",
  "image-banner/image-banner.jpg",
  "menu/menu-book.jpg",
  "menu/menu-carte.jpg",
  "menu/menu-essence.jpg",
  "menu/menu-home.jpg",
  "testimonials/clara.jpg",
  "testimonials/emma.jpg",
  "testimonials/fine.jpg",
  "testimonials/james.jpg",
  "testimonials/lucas.jpg",
  "testimonials/olivia.jpg",
  "testimonials/sophie.jpg",
];

const diningRoomPageAssets = diningRoomPageAssetPaths.map(
  (rel) =>
    ({
      id: `dining-room-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Dining Room Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `dining-room-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/dining-room-page/${rel}`,
      role: "Salle Blanche restaurant template image (hero, dining, chefs, footer, or menu).",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the dining-room-page template.",
    }) as const satisfies AssetItem,
);

const filmStudioPageAssetPaths = [
  "contact/contact-hero.mp4",
  "culture/hero.jpg",
  "culture/team/team-1.jpg",
  "culture/team/team-2.jpg",
  "culture/team/team-3.jpg",
  "culture/team/team-4.jpg",
  "culture/team/team-5.jpg",
  "culture/team/team-6.jpg",
  "culture/team/team-7.jpg",
  "culture/team/team-8.jpg",
  "culture/team/team-9.jpg",
  "culture/team/team-10.jpg",
  "culture/team/team-11.jpg",
  "culture/team/team-12.jpg",
  "culture/team/team-13.jpg",
  "culture/team/team-14.jpg",
  "culture/team/team-15.jpg",
  "culture/team/team-16.jpg",
  "culture/team/team-17.jpg",
  "directors/director-1.jpg",
  "directors/director-2.jpg",
  "directors/director-3.jpg",
  "directors/director-4.jpg",
  "directors/director-5.jpg",
  "directors/director-6.jpg",
  "directors/director-7.jpg",
  "directors/director-8.jpg",
  "directors/director-9.jpg",
  "directors/director-10.jpg",
  "hero/hero-footage.mp4",
  "home/banner.jpg",
  "home/cta-team.jpg",
  "home/form.svg",
  "sample-film/banner.jpg",
  "sample-film/film-snapshot-1.jpg",
  "sample-film/film-snapshot-2.jpg",
  "sample-film/film-snapshot-3.jpg",
  "sample-film/film-snapshot-4.jpg",
  "sample-film/film-snapshot-5.jpg",
  "sample-film/film-snapshot-6.jpg",
  "site-icon.png",
  "spotlight/spotlight-1.jpg",
  "spotlight/spotlight-2.jpg",
  "spotlight/spotlight-3.jpg",
  "spotlight/spotlight-4.jpg",
  "spotlight/spotlight-5.jpg",
  "spotlight/spotlight-6.jpg",
  "spotlight/spotlight-7.jpg",
  "spotlight/spotlight-8.jpg",
  "spotlight/spotlight-9.jpg",
  "spotlight/spotlight-10.jpg",
  "spotlight/spotlight-11.jpg",
  "spotlight/spotlight-12.jpg",
  "spotlight/spotlight-13.jpg",
  "spotlight/spotlight-14.jpg",
  "spotlight/spotlight-15.jpg",
  "spotlight/spotlight-16.jpg",
  "spotlight/spotlight-17.jpg",
  "spotlight/spotlight-18.jpg",
  "spotlight/spotlight-19.jpg",
  "spotlight/spotlight-20.jpg",
  "work/work-1.jpg",
  "work/work-2.jpg",
  "work/work-3.jpg",
  "work/work-4.jpg",
];

const filmStudioPageAssets = filmStudioPageAssetPaths.map(
  (rel) =>
    ({
      id: `film-studio-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Film Studio Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `film-studio-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/film-studio-page/${rel}`,
      role: "Negative Films template media (hero footage, spotlight frames, directors, team, or work stills).",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the film-studio-page template.",
    }) as const satisfies AssetItem,
);

const darkCatalogPageAssetPaths = [
  "accordion/accordion-1.jpg",
  "accordion/accordion-2.jpg",
  "accordion/accordion-3.jpg",
  "accordion/accordion-4.jpg",
  "brief/brief-img-1.jpg",
  "brief/brief-img-2.jpg",
  "brief/brief-img-3.jpg",
  "brief/brief-img-4.jpg",
  "catalog/catalog-1.jpg",
  "catalog/catalog-2.jpg",
  "catalog/catalog-3.jpg",
  "catalog/catalog-4.jpg",
  "featured-work/featured-work-1.jpg",
  "featured-work/featured-work-2.jpg",
  "featured-work/featured-work-3.jpg",
  "featured-work/featured-work-4.jpg",
  "fonts/cossette-titre.ttf",
  "fonts/suse-mono-variable.ttf",
  "fonts/verilet.ttf",
  "logo-type.png",
  "logo.png",
  "spiral/spiral-1.jpg",
  "spiral/spiral-2.jpg",
  "spiral/spiral-3.jpg",
  "spiral/spiral-4.jpg",
  "spiral/spiral-5.jpg",
  "spiral/spiral-6.jpg",
  "spiral/spiral-7.jpg",
  "spiral/spiral-8.jpg",
  "spiral/spiral-9.jpg",
  "spiral/spiral-10.jpg",
  "spiral/spiral-11.jpg",
  "spiral/spiral-12.jpg",
  "spiral/spiral-13.jpg",
  "spiral/spiral-14.jpg",
  "spiral/spiral-15.jpg",
  "spiral/spiral-16.jpg",
  "spiral/spiral-17.jpg",
  "spiral/spiral-18.jpg",
  "spiral/spiral-19.jpg",
  "team/team-1.jpg",
  "team/team-2.jpg",
  "team/team-3.jpg",
  "team/team-4.jpg",
  "team/team-5.jpg",
  "trail-images/trail-1.jpg",
  "trail-images/trail-2.jpg",
  "trail-images/trail-3.jpg",
  "trail-images/trail-4.jpg",
  "trail-images/trail-5.jpg",
  "trail-images/trail-6.jpg",
  "trail-images/trail-7.jpg",
  "trail-images/trail-8.jpg",
  "trail-images/trail-9.jpg",
  "trail-images/trail-10.jpg",
  "trail-images/trail-11.jpg",
  "trail-images/trail-12.jpg",
  "trail-images/trail-13.jpg",
  "trail-images/trail-14.jpg",
  "trail-images/trail-15.jpg",
  "trail-images/trail-16.jpg",
  "trail-images/trail-17.jpg",
  "trail-images/trail-18.jpg",
  "trail-images/trail-19.jpg",
] as const;

const darkCatalogPageAssets = darkCatalogPageAssetPaths.map(
  (rel) =>
    ({
      id: `dark-catalog-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Dark Catalog Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `dark-catalog-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/dark-catalog-page/${rel}`,
      role: "Deadlock Studios source template image, font, logo, or gallery asset.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the dark-catalog-page template.",
    }) as const satisfies AssetItem,
);

const deadspacePageAssetPaths = [
  "contact/contact_icon_1.png",
  "contact/contact_icon_2.png",
  "contact/contact_icon_3.png",
  "contact/contact_icon_4.png",
  "contact/contact_icon_5.png",
  "contact/icon_1.svg",
  "contact/icon_10.svg",
  "contact/icon_2.svg",
  "contact/icon_3.svg",
  "contact/icon_4.svg",
  "contact/icon_5.svg",
  "contact/icon_6.svg",
  "contact/icon_7.svg",
  "contact/icon_8.svg",
  "contact/icon_9.svg",
  "fonts/de-fonte-plus.ttf",
  "fonts/dm-mono.ttf",
  "fonts/stylish.ttf",
  "global/logo.svg",
  "lab/hero-visual.png",
  "project/project_1.jpg",
  "project/project_2.jpg",
  "project/project_3.jpg",
  "project/project_4.jpg",
  "project/project_5.jpg",
  "sfx/menu-close.mp3",
  "sfx/menu-open.mp3",
  "sfx/menu-select.mp3",
  "site-icon.png",
  "work/work_01.jpg",
  "work/work_02.jpg",
  "work/work_03.jpg",
  "work/work_04.jpg",
  "work/work_05.jpg",
] as const;

const deadspacePageAssets = deadspacePageAssetPaths.map(
  (rel) =>
    ({
      id: `deadspace-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Deadspace Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `deadspace-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/deadspace-page/${rel}`,
      role: "Deadspace source template image, font, logo, icon, or sound asset.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the deadspace-page template.",
    }) as const satisfies AssetItem,
);

const damienTsarantosPageAssetPaths = [
  "contact-dark.png",
  "contact-light.png",
  "work/img1.jpg",
  "work/img2.jpg",
  "work/img3.jpg",
  "work/img4.jpg",
  "work/img5.jpg",
  "work/img6.jpg",
  "work/img7.jpg",
  "work/img8.jpg",
  "work/img9.jpg",
  "work/project-a.png",
  "work/project-d.png",
  "work/project-m-1.png",
  "work/project-m-2.png",
  "work/project-m-3.png",
  "work/project-m-4.png",
  "work/project-m-5.png",
  "work/project-m-6.png",
  "work/project-t.png",
] as const;

const damienTsarantosPageAssets = damienTsarantosPageAssetPaths.map(
  (rel) =>
    ({
      id: `damien-tsarantos-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Damien Tsarantos Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `damien-tsarantos-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/damien-tsarantos-page/${rel}`,
      role: "Damien Tsarantos source template work image or contact card asset.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the damien-tsarantos-page template.",
    }) as const satisfies AssetItem,
);

const wuWeiPageAssetPaths = [
  "fonts/nm/nm-medium.otf",
  "images/archive/img1.jpeg",
  "images/archive/img10.jpeg",
  "images/archive/img11.jpeg",
  "images/archive/img12.jpeg",
  "images/archive/img13.jpeg",
  "images/archive/img14.jpeg",
  "images/archive/img15.jpeg",
  "images/archive/img16.jpeg",
  "images/archive/img17.jpeg",
  "images/archive/img18.jpeg",
  "images/archive/img19.jpeg",
  "images/archive/img2.jpeg",
  "images/archive/img20.jpeg",
  "images/archive/img21.jpeg",
  "images/archive/img22.jpeg",
  "images/archive/img23.jpeg",
  "images/archive/img24.jpeg",
  "images/archive/img25.jpeg",
  "images/archive/img26.jpeg",
  "images/archive/img27.jpeg",
  "images/archive/img28.jpeg",
  "images/archive/img29.jpeg",
  "images/archive/img3.jpeg",
  "images/archive/img30.jpeg",
  "images/archive/img31.jpeg",
  "images/archive/img32.jpeg",
  "images/archive/img33.jpeg",
  "images/archive/img34.jpeg",
  "images/archive/img35.jpeg",
  "images/archive/img36.jpeg",
  "images/archive/img37.jpeg",
  "images/archive/img38.jpeg",
  "images/archive/img39.jpeg",
  "images/archive/img4.jpeg",
  "images/archive/img40.jpeg",
  "images/archive/img41.jpeg",
  "images/archive/img42.jpeg",
  "images/archive/img43.jpeg",
  "images/archive/img44.jpeg",
  "images/archive/img45.jpeg",
  "images/archive/img46.jpeg",
  "images/archive/img47.jpeg",
  "images/archive/img48.jpeg",
  "images/archive/img49.jpeg",
  "images/archive/img5.jpeg",
  "images/archive/img50.jpeg",
  "images/archive/img6.jpeg",
  "images/archive/img7.jpeg",
  "images/archive/img8.jpeg",
  "images/archive/img9.jpeg",
  "images/contact/contact.jpeg",
  "images/logos/logo_light.png",
  "images/process/process_001.jpeg",
  "images/process/process_002.jpeg",
  "images/process/process_003.jpeg",
  "images/process/process_004.jpeg",
  "images/studio/hero.jpeg",
  "images/who-we-are/team-1.jpg",
  "images/who-we-are/team-2.jpg",
  "images/who-we-are/team-3.jpg",
  "images/who-we-are/team-4.jpg",
  "images/who-we-are/team-5.jpg",
  "images/work/work_001.jpeg",
  "images/work/work_002.jpeg",
  "images/work/work_003.jpeg",
  "images/work/work_004.jpeg",
  "images/work/work_005.jpeg",
  "images/work/work_006.jpeg",
  "images/work/work_007.jpeg",
  "images/work/work_008.jpeg",
  "images/work/work_009.jpeg",
  "images/work/work_010.jpeg",
  "images/work/work_011.jpeg",
  "images/work/work_012.jpeg",
  "images/work/work_013.jpeg",
  "images/work/work_014.jpeg",
  "images/work/work_015.jpeg",
  "images/work/work_016.jpeg",
  "images/work/work_017.jpeg",
  "images/work/work_018.jpeg",
  "images/work/work_019.jpeg",
  "images/work/work_020.jpeg",
  "images/work/work_021.jpeg",
  "images/work/work_022.jpeg",
  "images/work/work_023.jpeg",
  "images/work/work_024.jpeg",
  "images/work/work_025.jpeg",
] as const;

const wuWeiPageAssets = wuWeiPageAssetPaths.map(
  (rel) =>
    ({
      id: `wu-wei-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Wu Wei Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `wu-wei-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/wu-wei-page/${rel}`,
      role: "Wu Wei source template image, font, logo, work, archive, process, or team asset.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the wu-wei-page template.",
    }) as const satisfies AssetItem,
);

const otisValenPageAssetPaths = [
  "fonts/formula/PPFormula-CondensedBlack.ttf",
  "fonts/formula/PPFormula-CondensedExtralight.ttf",
  "fonts/formula/PPFormula-CondensedLightItalic.ttf",
  "fonts/formula/PPFormula-CondensedRegular.ttf",
  "fonts/formula/PPFormula-CondensedRegularItalic.ttf",
  "fonts/formula/PPFormula-ExtendedBold.ttf",
  "fonts/formula/PPFormula-ExtendedLight.ttf",
  "fonts/formula/PPFormula-ExtendedLightItalic.ttf",
  "fonts/formula/PPFormula-ExtendedMedium.ttf",
  "fonts/formula/PPFormula-Extrabold.ttf",
  "fonts/formula/PPFormula-ExtraboldItalic.ttf",
  "fonts/formula/PPFormula-Light.ttf",
  "fonts/formula/PPFormula-Medium.ttf",
  "fonts/formula/PPFormula-MediumItalic.ttf",
  "fonts/formula/PPFormula-NarrowBold.ttf",
  "fonts/formula/PPFormula-NarrowBoldItalic.ttf",
  "fonts/formula/PPFormula-NarrowRegular.ttf",
  "fonts/formula/PPFormula-NarrowSemibold.ttf",
  "fonts/formula/PPFormula-Regular.ttf",
  "fonts/formula/PPFormula-RegularItalic.ttf",
  "fonts/formula/PPFormula-SemiCondensedExtralight.ttf",
  "fonts/formula/PPFormula-SemiCondensedExtralightItalic.ttf",
  "fonts/formula/PPFormula-SemiCondensedMedium.ttf",
  "fonts/formula/PPFormula-SemiCondensedThin.ttf",
  "fonts/formula/PPFormula-SemiExtendedBold.ttf",
  "fonts/rader/PPRader-Bold.ttf",
  "fonts/rader/PPRader-BoldItalic.ttf",
  "fonts/rader/PPRader-Hairline.ttf",
  "fonts/rader/PPRader-HairlineItalic.ttf",
  "fonts/rader/PPRader-Italic.ttf",
  "fonts/rader/PPRader-Medium.ttf",
  "fonts/rader/PPRader-MediumItalic.ttf",
  "fonts/rader/PPRader-Regular.ttf",
  "fonts/rader/PPRader-Thin.ttf",
  "fonts/rader/PPRader-ThinItalic.ttf",
  "fonts/supply-mono/PPSupplyMono-Bold.ttf",
  "fonts/supply-mono/PPSupplyMono-Medium.ttf",
  "fonts/supply-mono/PPSupplyMono-Regular.ttf",
  "fonts/supply-mono/PPSupplyMono-Ultralight.ttf",
  "images/global/s1.png",
  "images/global/s2.png",
  "images/global/s3.png",
  "images/global/s4.png",
  "images/global/s5.png",
  "images/global/s6-dark.png",
  "images/global/s6.png",
  "images/global/site-icon.png",
  "images/global/symbols-light.png",
  "images/global/symbols.png",
  "images/hero/img1.jpg",
  "images/hero/img10.jpg",
  "images/hero/img2.jpg",
  "images/hero/img3.jpg",
  "images/hero/img4.jpg",
  "images/hero/img5.jpg",
  "images/hero/img6.jpg",
  "images/hero/img7.jpg",
  "images/hero/img8.jpg",
  "images/hero/img9.jpg",
  "images/project/client-portrait.jpg",
  "images/services-header/portrait.jpeg",
  "images/services/service-1.jpg",
  "images/services/service-2.jpg",
  "images/services/service-3.jpg",
  "images/services/service-4.jpg",
  "images/work-header/work-portrait.jpg",
  "images/work-items/work-item-1.jpg",
  "images/work-items/work-item-10.jpg",
  "images/work-items/work-item-2.jpg",
  "images/work-items/work-item-3.jpg",
  "images/work-items/work-item-4.jpg",
  "images/work-items/work-item-5.jpg",
  "images/work-items/work-item-6.jpg",
  "images/work-items/work-item-7.jpg",
  "images/work-items/work-item-8.jpg",
  "images/work-items/work-item-9.jpg",
] as const;

const otisValenPageAssets = otisValenPageAssetPaths.map(
  (rel) =>
    ({
      id: `otis-valen-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Otis Valen Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `otis-valen-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/otis-valen-page/${rel}`,
      role: "Otis Valen source template image, font, symbol, or portrait asset.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the otis-valen-page template.",
    }) as const satisfies AssetItem,
);

const juanMoraPageAssetPaths = [
  "documents/icon-jm.json",
  "documents/juan-name-mouse.json",
  "documents/ll-scroll.json",
  "fonts/Goga-Medium.otf",
  "fonts/Goga-Regular.otf",
  "fonts/Goga-SemiBold.otf",
  "images/about-juan-mora.jpg",
  "images/arrow-grey.svg",
  "images/big-circle-scroll1-p-500.png",
  "images/big-circle-scroll1.png",
  "images/big-circle-scroll2-p-500.png",
  "images/big-circle-scroll2-p-800.png",
  "images/big-circle-scroll2.png",
  "images/big-circle-scroll3-p-500.png",
  "images/big-circle-scroll3.png",
  "images/big-hexagon-scroll1-p-500.png",
  "images/big-hexagon-scroll1.png",
  "images/big-pill-scroll1-p-500.png",
  "images/big-pill-scroll1.png",
  "images/big-square-scroll1-p-500.png",
  "images/big-square-scroll1.png",
  "images/blue-circle-scroll.svg",
  "images/blue-hexagon-scroll.svg",
  "images/blue-pill-scroll.svg",
  "images/check-mark-icon.svg",
  "images/favicon.png",
  "images/folder-icon-back-p-500.png",
  "images/folder-icon-back.png",
  "images/folder-icon-front-p-500.png",
  "images/folder-icon-front.png",
  "images/framer-frame.svg",
  "images/framer-tag-juan-mora.svg",
  "images/hero-photo-test2.jpg",
  "images/home-about-jm-1-p-1080.jpg",
  "images/home-about-jm-1-p-1600.jpg",
  "images/home-about-jm-1-p-2000.jpg",
  "images/home-about-jm-1-p-2600.jpg",
  "images/home-about-jm-1-p-500.jpg",
  "images/home-about-jm-1-p-800.jpg",
  "images/home-about-jm-1.jpg",
  "images/home-about-jm-2-p-1080.png",
  "images/home-about-jm-2-p-1600.png",
  "images/home-about-jm-2-p-2000.png",
  "images/home-about-jm-2-p-500.png",
  "images/home-about-jm-2-p-800.png",
  "images/home-about-jm-2.png",
  "images/home-about-jm-3-p-1080.jpg",
  "images/home-about-jm-3-p-1600.jpg",
  "images/home-about-jm-3-p-2000.jpg",
  "images/home-about-jm-3-p-2600.jpg",
  "images/home-about-jm-3-p-500.jpg",
  "images/home-about-jm-3-p-800.jpg",
  "images/home-about-jm-3.jpg",
  "images/home-work1-p-500.jpg",
  "images/home-work1.jpg",
  "images/home-work2-p-500.jpg",
  "images/home-work2.jpg",
  "images/home-work3-p-500.jpg",
  "images/home-work3.jpg",
  "images/home-work4-p-500.jpg",
  "images/home-work4.jpg",
  "images/home-work5-p-500.jpg",
  "images/home-work5.jpg",
  "images/home-work6-p-500.jpg",
  "images/home-work6.jpg",
  "images/home-work7-p-500.jpg",
  "images/home-work7.jpg",
  "images/home-work8-p-500.jpg",
  "images/home-work8.jpg",
  "images/home-work9-p-500.jpg",
  "images/home-work9.jpg",
  "images/juan-about-hero.jpg",
  "images/juan-mora-logo-footer.svg",
  "images/projects-folder-p-500.png",
  "images/projects-folder.png",
  "images/webclip.png",
  "images/webflow-frame.svg",
  "images/webflow-tag-juan-mora.svg",
  "videos-work/desk_jm3.mp4",
  "videos-work/home/home-alena.mp4",
  "videos-work/home/home-ampli-brand.mp4",
  "videos-work/home/home-ampli.mp4",
  "videos-work/home/home-apechain.mp4",
  "videos-work/home/home-brudget1.mp4",
  "videos-work/home/home-shopping.mp4",
  "videos-work/juan-video-loading.jpg",
] as readonly string[];

const juanMoraPageAssets = juanMoraPageAssetPaths.map(
  (rel) =>
    ({
      id: `juan-mora-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Juan Mora Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `juan-mora-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/juan-mora-page/${rel}`,
      role: "Juan Mora source image, responsive derivative, Lottie animation, Goga font, or work reel.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the juan-mora-page template.",
    }) as const satisfies AssetItem,
);

const isochromePageAssetPaths = [
  "home/hero-img.jpg",
  "about/hero.jpg",
  "about/founder.jpg",
  "about/about-copy.jpg",
  "about/about-outro.jpg",
  "about/expertise-img-1.jpg",
  "about/expertise-img-2.jpg",
  "contact/banner.jpg",
  ...Array.from(
    { length: 7 },
    (_, i) => `projects/project-banner-${i + 1}.jpg`,
  ),
  ...[1, 2, 3].map((i) => `project/project-img-${i}.jpg`),
  ..."ABCDEFGH"
    .split("")
    .flatMap((c) => [`client-logos/${c}1.png`, `client-logos/${c}2.png`]),
  "fonts/akkuratmono.ttf",
  "fonts/druk-bold.otf",
  "fonts/druk-heavy.otf",
  "fonts/druk-medium.otf",
  "fonts/druk-super.otf",
] as readonly string[];

const houseOfEpochsPageAssetPaths = [
  "assets/showreel-header.svg",
  ...Array.from({ length: 10 }, (_, index) => `catalog/img${index + 1}.jpg`),
  "fonts/bellefair/bellefair-regular.ttf",
  "fonts/dm-mono/dm-mono-light.ttf",
  "fonts/dm-mono/dm-mono-medium.ttf",
  "fonts/dm-mono/dm-mono-regular.ttf",
  "fonts/palace/palace-italic.ttf",
  "fonts/palace/palace-regular.ttf",
  ...Array.from({ length: 10 }, (_, index) => `images/img${index + 1}.jpg`),
  "logo.svg",
  "music/bg.mp3",
  ...Array.from(
    { length: 3 },
    (_, index) => `transmit/transmit-card-${index + 1}.jpg`,
  ),
] as readonly string[];

const houseOfEpochsPageAssets = houseOfEpochsPageAssetPaths.map(
  (rel) =>
    ({
      id: `house-of-epochs-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `House of Epochs Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `house-of-epochs-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/house-of-epochs-page/${rel}`,
      role: "Source image, font, SVG, or audio used by the House of Epochs page.",
      notes:
        "Uploaded to Vercel Blob at the original source pathname for this page.",
    }) as const satisfies AssetItem,
);

const politeChaosPageAssetPaths = [
  ...Array.from(
    { length: 6 },
    (_, index) => `featured-work/work-${index + 1}.jpg`,
  ),
  "fonts/big-shoulders-display/BigShouldersDisplay.ttf",
  "fonts/geist-mono/geist-mono-variable.ttf",
  ...["Thin", "Light", "Regular", "Book", "Medium", "Bold"].map(
    (weight) => `fonts/neue-montral/PPNeueMontreal-${weight}.otf`,
  ),
  ...[
    "Thin",
    "Light",
    "Regular",
    "Medium",
    "Semibold",
    "Bold",
    "Extrabold",
  ].map((weight) => `fonts/pangram-sans/PPPangramSans-${weight}.otf`),
  "logo.svg",
  "menu/menu_img.jpg",
  ...Array.from(
    { length: 6 },
    (_, index) => `showreel/showreel-frame-${index + 1}.jpg`,
  ),
  "showreel/showreel_music.mp3",
  ...Array.from(
    { length: 16 },
    (_, index) => `spotlight/spotlight-${index + 1}.jpg`,
  ),
] as readonly string[];

const politeChaosPageAssets = politeChaosPageAssetPaths.map(
  (rel) =>
    ({
      id: `polite-chaos-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Polite Chaos Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `polite-chaos-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/polite-chaos-page/${rel}`,
      role: "Source image, font, SVG, or audio used by the Polite Chaos page.",
      notes:
        "Uploaded to Vercel Blob at the original source pathname for this page.",
    }) as const satisfies AssetItem,
);

const orbitMatterPageAssetPaths = [
  "index/hero.jpg",
  ...Array.from(
    { length: 5 },
    (_, index) => `index/highlight_img_0${index + 1}.jpg`,
  ),
  "index/logo_cta.png",
  ...Array.from({ length: 6 }, (_, index) => `index/cta_img_0${index + 1}.jpg`),
] as readonly string[];

const orbitMatterPageAssets = orbitMatterPageAssetPaths.map(
  (rel) =>
    ({
      id: `orbit-matter-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Orbit Matter Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `orbit-matter-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/orbit-matter-page/${rel}`,
      role: "Source hero, mission, logo, or CTA image used by Orbit Matter.",
      notes:
        "Uploaded to Vercel Blob at the original source pathname for this page.",
    }) as const satisfies AssetItem,
);

const isochromePageAssets = isochromePageAssetPaths.map(
  (rel) =>
    ({
      id: `isochrome-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `ISOChrome Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `isochrome-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/isochrome-page/${rel}`,
      role: "ISOChrome source template image, client logo, or Druk font.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the isochrome-page template.",
    }) as const satisfies AssetItem,
);

const landingImageRevealAssets = Array.from(
  { length: 5 },
  (_, i) => `img-${i + 1}.jpg`,
).map(
  (rel) =>
    ({
      id: `landing-image-reveal-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Landing Image Reveal asset ${rel}`,
      provider: "vercel-blob",
      pathname: `landing-image-reveal/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/landing-image-reveal/${rel}`,
      role: "Landing Image Reveal source template image.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the landing-image-reveal component.",
    }) as const satisfies AssetItem,
);

const spotlightGalleryScrollAssets = [
  ...Array.from({ length: 9 }, (_, i) => `img${i + 1}.jpg`),
  "logo.svg",
].map(
  (rel) =>
    ({
      id: `spotlight-gallery-scroll-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Spotlight Gallery Scroll asset ${rel}`,
      provider: "vercel-blob",
      pathname: `spotlight-gallery-scroll/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/spotlight-gallery-scroll/${rel}`,
      role: "Spotlight Gallery Scroll source template image or logo.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the spotlight-gallery-scroll component.",
    }) as const satisfies AssetItem,
);

const nullStudioPageAssetPaths = [
  "images/home/hero.jpg",
  "images/home/article-1.jpg",
  "images/home/article-2.jpg",
  "images/about/about-hero.jpg",
  ...Array.from({ length: 6 }, (_, i) => `images/about/logo-${i + 1}.webp`),
  ...[1, 2, 3, 4, 5, 6, 7].map((i) => `images/about/team-${i}.jpg`),
  "images/work/project-1.jpg",
  "images/work/project-2.jpg",
  "images/work/project-4.jpg",
  "fonts/CosiTimes-Roman.ttf",
  "fonts/CosiTimes-Bold.ttf",
  "fonts/CosiTimes-Light.ttf",
  "fonts/PPEiko-Light.otf",
  "fonts/PPEiko-Medium.otf",
  "fonts/PPEiko-Regular.otf",
  "fonts/NeueMontreal-Light.otf",
  "fonts/NeueMontreal-Medium.otf",
  "fonts/NeueMontreal-Regular.otf",
] as readonly string[];

const nullStudioPageAssets = nullStudioPageAssetPaths.map(
  (rel) =>
    ({
      id: `null-studio-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Null Studio Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `null-studio-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/null-studio-page/${rel}`,
      role: "Null Studio source template image or font.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the null-studio-page template.",
    }) as const satisfies AssetItem,
);

const brutalistPortfolioPageAssetPaths = [
  ...Array.from({ length: 9 }, (_, i) => `images/0${i + 1}.png`),
  "fonts/PPMondwest-Regular.otf",
  "fonts/PPNeueBit-Bold.otf",
] as readonly string[];

const brutalistPortfolioPageAssets = brutalistPortfolioPageAssetPaths.map(
  (rel) =>
    ({
      id: `brutalist-portfolio-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Brutalist Portfolio Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `brutalist-portfolio-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/brutalist-portfolio-page/${rel}`,
      role: "Brutalist Portfolio source template image or PP font.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the brutalist-portfolio-page template.",
    }) as const satisfies AssetItem,
);

const unusualStudioPageAssetPaths = [
  "images/about-feature.jpg",
  "images/about-hero.jpg",
  "images/about-office.jpg",
  "images/article-img.jpg",
  "images/banner-img.jpg",
  "images/hero-img.jpg",
  "images/project-img-1.jpg",
  "images/project-img-2.jpg",
  "images/project-img-3.jpg",
  "images/project-img-4.jpg",
  "images/project-img.jpg",
  "images/project-page-img-2.jpg",
  "fonts/NeueMontreal-Light.otf",
  "fonts/NeueMontreal-Regular.otf",
  "fonts/NeueMontreal-Medium.otf",
  "fonts/NeueMontreal-Bold.otf",
  "careers-lottie.json",
] as readonly string[];

const unusualStudioPageAssets = unusualStudioPageAssetPaths.map(
  (rel) =>
    ({
      id: `unusual-studio-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Unusual Studio Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `unusual-studio-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/unusual-studio-page/${rel}`,
      role: "Unusual Studio source template image, Neue Montreal font, or Lottie animation.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the unusual-studio-page template.",
    }) as const satisfies AssetItem,
);

const neotericPageAssetPaths = [
  ...Array.from({ length: 11 }, (_, i) => `project-images/img${i + 1}.jpg`),
  "team/team1.jpg",
  "team/team2.jpg",
] as readonly string[];

const neotericPageAssets = neotericPageAssetPaths.map(
  (rel) =>
    ({
      id: `neoteric-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Neoteric Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `neoteric-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/neoteric-page/${rel}`,
      role: "Neoteric source template project or team image.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the neoteric-page template.",
    }) as const satisfies AssetItem,
);

const sorenPageAssetPaths = Array.from(
  { length: 22 },
  (_, i) => `work/work-${i + 1}.jpg`,
) as readonly string[];

const sorenPageAssets = sorenPageAssetPaths.map(
  (rel) =>
    ({
      id: `soren-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Soren Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `soren-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/soren-page/${rel}`,
      role: "Soren source template work and photo image.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the soren-page template.",
    }) as const satisfies AssetItem,
);

const velascoSolariPageAssetPaths = [
  "project-images/01.jpg",
  "project-images/02.jpg",
  "project-images/03.jpg",
  "project-images/04.jpg",
  "project-images/05.jpg",
  "project-images/06.jpg",
  "project-images/07.jpg",
  "project-images/08.jpg",
  "fonts/TestFoundersGrotesk-Light.otf",
  "fonts/TestFoundersGrotesk-Regular.otf",
  "fonts/TestFoundersGrotesk-Medium.otf",
  "fonts/TestFoundersGrotesk-Semibold.otf",
  "fonts/TestFoundersGrotesk-Bold.otf",
] as const;

const velascoSolariPageAssets = velascoSolariPageAssetPaths.map(
  (rel) =>
    ({
      id: `velasco-solari-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Velasco Solari Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `velasco-solari-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/velasco-solari-page/${rel}`,
      role: "Velasco Solari source template project image or Founders Grotesk font.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the velasco-solari-page template.",
    }) as const satisfies AssetItem,
);

const lemonBureauPageAssetPaths = [
  "clients/client-logo-1.svg",
  "clients/client-logo-2.svg",
  "clients/client-logo-3.svg",
  "clients/client-logo-4.svg",
  "clients/client-logo-5.svg",
  "fonts/dm-mono/dm-mono-light.ttf",
  "fonts/dm-mono/dm-mono-medium.ttf",
  "fonts/dm-mono/dm-mono-regular.ttf",
  "fonts/humane/humane-bold.woff2",
  "fonts/humane/humane-extralight.woff2",
  "fonts/humane/humane-light.woff2",
  "fonts/humane/humane-medium.woff2",
  "fonts/humane/humane-regular.woff2",
  "fonts/humane/humane-semibold.woff2",
  "fonts/humane/humane-thin.woff2",
  "fonts/neue-montreal/neue-montreal-bold.ttf",
  "fonts/neue-montreal/neue-montreal-book.ttf",
  "fonts/neue-montreal/neue-montreal-light.ttf",
  "fonts/neue-montreal/neue-montreal-medium.ttf",
  "fonts/neue-montreal/neue-montreal-regular.ttf",
  "fonts/neue-montreal/neue-montreal-thin.ttf",
  "home/particle-visual.png",
  "icons/cursor.png",
  "icons/nav-icon.png",
  "icons/site-icon.png",
  "logo/nav-logo.svg",
  "menu/menu-img.jpg",
  "sample-project/details-1.jpg",
  "sample-project/details-2.jpg",
  "sample-project/hero.jpg",
  "studio/hero.jpg",
  "team-cards/team-member-1.jpg",
  "team-cards/team-member-2.jpg",
  "team-cards/team-member-3.jpg",
  "team-cards/team-member-4.jpg",
  "team-cards/team-member-5.jpg",
  "work/work1.jpg",
  "work/work2.jpg",
  "work/work3.jpg",
  "work/work4.jpg",
  "work/work5.jpg",
  "work/work6.jpg",
] as const;

const lemonBureauPageAssets = lemonBureauPageAssetPaths.map(
  (rel) =>
    ({
      id: `lemon-bureau-page-${rel.replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/gi, "-")}`,
      label: `Lemon Bureau Page asset ${rel}`,
      provider: "vercel-blob",
      pathname: `lemon-bureau-page/${rel}`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/lemon-bureau-page/${rel}`,
      role: "Lemon Bureau source template font, logo, icon, client, team, work, studio, or project asset.",
      notes:
        "Uploaded to Vercel Blob at the source pathname for the lemon-bureau-page template.",
    }) as const satisfies AssetItem,
);

const stretchTextScrollAssets = [
  {
    id: "stretch-text-scroll-img",
    label: "Stretch Text Scroll background",
    provider: "vercel-blob",
    pathname: "stretch-text-scroll/img.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/stretch-text-scroll/img.jpg`,
    role: "Full-bleed still revealed behind the final pinned panel as its word scales past the frame.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem,
];

const arcSpotlightScrollAssets = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return {
    id: `arc-spotlight-scroll-img-${n}`,
    label: `Arc Spotlight Scroll image ${n}`,
    provider: "vercel-blob",
    pathname: `arc-spotlight-scroll/img${n}.jpg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/arc-spotlight-scroll/img${n}.jpg`,
    role: "Backdrop still and arcing thumbnail for one entry in the telescope reveal.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

const stickyStackCardsAssets = Array.from({ length: 4 }, (_, i) => {
  const n = i + 1;
  return {
    id: `sticky-stack-cards-img-${n}`,
    label: `Sticky Stack Cards image ${n}`,
    provider: "vercel-blob",
    pathname: `sticky-stack-cards/card${n}.jpg`,
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/sticky-stack-cards/card${n}.jpg`,
    role: "Feature image inside one of the pinned, stacking cards.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  } as const satisfies AssetItem;
});

export const assetItems = [
  ...Array.from({ length: 6 }, (_, i) => {
    const n = i + 1;
    return {
      id: `magnetic-spotlight-marquee-img-${n}`,
      label: `Magnetic Spotlight Marquee image ${n}`,
      provider: "vercel-blob",
      pathname: `magnetic-spotlight-marquee/marquee-img-${n}.jpg`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/magnetic-spotlight-marquee/marquee-img-${n}.jpg`,
      role: "Photograph in the continuously looping magnetic strip.",
      notes: "Served from Vercel Blob at the stable registry pathname.",
    } as const satisfies AssetItem;
  }),
  {
    id: "wordmark-spotlight-scroll-header",
    label: "Wordmark Spotlight Scroll header",
    provider: "vercel-blob",
    pathname: "wordmark-spotlight-scroll/header.svg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/wordmark-spotlight-scroll/header.svg`,
    role: "Opening full-width SVG wordmark.",
    notes: "Served from Vercel Blob at the stable registry pathname.",
  } as const satisfies AssetItem,
  ...Array.from({ length: 6 }, (_, i) => {
    const n = i + 1;
    return {
      id: `wordmark-spotlight-scroll-name-${n}`,
      label: `Wordmark Spotlight Scroll name ${n}`,
      provider: "vercel-blob",
      pathname: `wordmark-spotlight-scroll/project_name_${n}.svg`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/wordmark-spotlight-scroll/project_name_${n}.svg`,
      role: "Project wordmark stretched into the next scroll step.",
      notes: "Served from Vercel Blob at the stable registry pathname.",
    } as const satisfies AssetItem;
  }),
  ...Array.from({ length: 6 }, (_, i) => {
    const n = i + 1;
    return {
      id: `wordmark-spotlight-scroll-image-${n}`,
      label: `Wordmark Spotlight Scroll image ${n}`,
      provider: "vercel-blob",
      pathname: `wordmark-spotlight-scroll/project_img_${n}.jpg`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/wordmark-spotlight-scroll/project_img_${n}.jpg`,
      role: "Square project still scaled in beneath its wordmark.",
      notes: "Served from Vercel Blob at the stable registry pathname.",
    } as const satisfies AssetItem;
  }),
  ...[
    ["item-1", "item1.png", "First floating cutout in the preloader."],
    ["item-2", "item2.png", "Second floating cutout in the preloader."],
    ["item-3", "item3.png", "Third floating cutout in the preloader."],
    ["item-4", "item4.png", "Fourth floating cutout in the preloader."],
    ["item-6", "item6.png", "Centerpiece image revealed over the hero circle."],
    ["logo", "logo.png", "Brand mark shared by the preloader and navigation."],
  ].map(
    ([id, filename, role]) =>
      ({
        id: `circle-preloader-hero-${id}`,
        label: `Circle Preloader Hero ${id}`,
        provider: "vercel-blob",
        pathname: `circle-preloader-hero/${filename}`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/circle-preloader-hero/${filename}`,
        role,
        notes: "Served from Vercel Blob at the stable registry pathname.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from({ length: 3 }, (_, i) => {
    const n = i + 1;
    return {
      id: `block-page-transition-img-${n}`,
      label: `Block Page Transition scene ${n}`,
      provider: "vercel-blob",
      pathname: `block-page-transition/img${n}.jpg`,
      fallbackPath: `${BLOB_PUBLIC_ORIGIN}/block-page-transition/img${n}.jpg`,
      role: "Full-screen scene shown before or after the transition wipe.",
      notes: "Served from Vercel Blob at the stable registry pathname.",
    } as const satisfies AssetItem;
  }),
  ...stretchTextScrollAssets,
  ...arcSpotlightScrollAssets,
  ...stickyStackCardsAssets,
  ...march2025TemplateAssets,
  ...archiveCommercePageAssets,
  ...interiorStudioPageAssets,
  ...diningRoomPageAssets,
  ...filmStudioPageAssets,
  ...darkCatalogPageAssets,
  ...deadspacePageAssets,
  ...damienTsarantosPageAssets,
  ...wuWeiPageAssets,
  ...otisValenPageAssets,
  ...houseOfEpochsPageAssets,
  ...politeChaosPageAssets,
  ...orbitMatterPageAssets,
  ...velascoSolariPageAssets,
  ...sorenPageAssets,
  ...neotericPageAssets,
  ...unusualStudioPageAssets,
  ...brutalistPortfolioPageAssets,
  ...nullStudioPageAssets,
  ...isochromePageAssets,
  ...juanMoraPageAssets,
  ...landingImageRevealAssets,
  ...spotlightGalleryScrollAssets,
  ...lemonBureauPageAssets,
  ...spiralGalleryAssets,
  ...frameScrollAssets,
  ...fallingTagListAssets,
  ...crtDisplayAssets,
  ...creativeClutterAssets,
  ...accordionFramesAssets,
  ...asciiImageRevealAssets,
  ...detroitParisSliderAssets,
  ...scrollTunnel3dAssets,
  ...filterScrubGalleryAssets,
  ...catalogSwapGalleryAssets,
  ...rotatingHandScrollAssets,
  ...curvedPlaneSliderAssets,
  ...minimapScrubberAssets,
  ...cursorImageTrailAssets,
  ...shaderGridGalleryAssets,
  ...montageRevealHeroAssets,
  ...tiltCardStackAssets,
  ...slitRevealHeroAssets,
  ...curtainRevealHeroAssets,
  ...convergingIconsTextAssets,
  ...splitRevealPreloaderAssets,
  ...inkCoreLayoutAssets,
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
  ...Array.from(
    { length: 9 },
    (_, index) =>
      ({
        id: `voku-image-slider-img-${index + 1}`,
        label: `Voku Image Slider frame ${index + 1}`,
        provider: "vercel-blob",
        pathname: `voku-image-slider/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/voku-image-slider/img${index + 1}.jpg`,
        role: "Image wrapped through the curved slider track.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 10 },
    (_, index) =>
      ({
        id: `threejs-infinite-slider-img-${index + 1}`,
        label: `Three.js Infinite Slider frame ${index + 1}`,
        provider: "vercel-blob",
        pathname: `threejs-infinite-slider/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/threejs-infinite-slider/img${index + 1}.jpg`,
        role: "Texture mapped onto a looping vertical WebGL plane.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "grid-scramble-hover-img",
    label: "Grid Scramble Hover image",
    provider: "vercel-blob",
    pathname: "grid-scramble-hover/img.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/grid-scramble-hover/img.jpg`,
    role: "Image covered by the pointer-reactive symbol grid.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "vinyl-orbit-player-disk",
    label: "Vinyl Orbit Player disk",
    provider: "vercel-blob",
    pathname: "vinyl-orbit-player/disk.png",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/vinyl-orbit-player/disk.png`,
    role: "Spinning record texture under the circular cover image.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "vinyl-orbit-player-cover",
    label: "Vinyl Orbit Player cover",
    provider: "vercel-blob",
    pathname: "vinyl-orbit-player/sample-cover.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/vinyl-orbit-player/sample-cover.jpg`,
    role: "Circular center cover mounted on top of the spinning record.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "vinyl-orbit-player-font-primary",
    label: "Vinyl Orbit Player display font",
    provider: "vercel-blob",
    pathname: "vinyl-orbit-player/fonts/primary-display.ttf",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/vinyl-orbit-player/fonts/primary-display.ttf`,
    role: "Condensed display face for the large curved marquee text.",
    notes:
      "Stand-in for the source's Tusker Grotesk. Upload this font to Vercel Blob at the same pathname.",
  },
  {
    id: "vinyl-orbit-player-font-label",
    label: "Vinyl Orbit Player label font",
    provider: "vercel-blob",
    pathname: "vinyl-orbit-player/fonts/neue-montreal-medium.otf",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/vinyl-orbit-player/fonts/neue-montreal-medium.otf`,
    role: "Grotesque face for the smaller lower curve label.",
    notes:
      "Matches the source's PP Neue Montreal. Upload this font to Vercel Blob at the same pathname.",
  },
  {
    id: "orbit-text-preloader-hero",
    label: "Orbit Text Preloader hero",
    provider: "vercel-blob",
    pathname: "orbit-text-preloader/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/orbit-text-preloader/hero.jpg`,
    role: "Hero image revealed once the orbit loader fades out.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    { length: 10 },
    (_, index) =>
      ({
        id: `scroll-text-blocks-img-${index + 1}`,
        label: `Scroll Text Blocks image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `scroll-text-blocks/img_${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/scroll-text-blocks/img_${index + 1}.jpg`,
        role: "Portrait tile in the scroll-velocity-reactive marquee.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "video-card-stack-font-label",
    label: "Video Card Stack label font",
    provider: "vercel-blob",
    pathname: "video-card-stack/fonts/neue-montreal-medium.otf",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/video-card-stack/fonts/neue-montreal-medium.otf`,
    role: "Grotesque face for the nav and card metadata.",
    notes:
      "Matches the source's PP Neue Montreal. Upload this font to Vercel Blob at the same pathname.",
  },
  ...Array.from(
    { length: 12 },
    (_, index) =>
      ({
        id: `client-hover-preview-img-${index + 1}`,
        label: `Client Hover Preview image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `client-hover-preview/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/client-hover-preview/img${index + 1}.jpg`,
        role: "Preview image wiped open when its client name is hovered.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 5 },
    (_, index) =>
      ({
        id: `minimap-parallax-scroll-img-${index + 1}`,
        label: `Minimap Parallax Scroll image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `minimap-parallax-scroll/img_${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/minimap-parallax-scroll/img_${index + 1}.jpg`,
        role: "Full-screen project image mirrored in the minimap strip.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 7 },
    (_, index) =>
      ({
        id: `scroll-scrub-slider-img-${index + 1}`,
        label: `Scroll Scrub Slider image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `scroll-scrub-slider/slider_img_${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/scroll-scrub-slider/slider_img_${index + 1}.jpg`,
        role: "Full-screen slide cross-faded in as the pin is scrubbed.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 3 },
    (_, index) =>
      ({
        id: `split-card-scroll-img-${index + 1}`,
        label: `Split Card Scroll cover ${index + 1}`,
        provider: "vercel-blob",
        pathname: `split-card-scroll/card_cover_${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/split-card-scroll/card_cover_${index + 1}.jpg`,
        role: "Front face of one of the three splitting cards.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 5 },
    (_, index) =>
      ({
        id: `hour-timeline-slider-img-${index + 1}`,
        label: `Hour Timeline Slider image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `hour-timeline-slider/img-${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/hour-timeline-slider/img-${index + 1}.jpg`,
        role: "Full-screen slide revealed by the clip-path wipe.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "hour-timeline-slider-font-display",
    label: "Hour Timeline Slider display font",
    provider: "vercel-blob",
    pathname: "hour-timeline-slider/fonts/neue-montreal-medium.otf",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/hour-timeline-slider/fonts/neue-montreal-medium.otf`,
    role: "Grotesque face for the hour numerals.",
    notes:
      "Matches the source's PP Neue Montreal. Upload this font to Vercel Blob at the same pathname.",
  },
  ...Array.from(
    { length: 9 },
    (_, index) =>
      ({
        id: `drag-timeline-scroll-img-${index + 1}`,
        label: `Drag Timeline Scroll image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `drag-timeline-scroll/img-${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/drag-timeline-scroll/img-${index + 1}.jpg`,
        role: "Editorial image in one of the horizontal image screens.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "drag-timeline-scroll-font-display",
    label: "Drag Timeline Scroll display font",
    provider: "vercel-blob",
    pathname: "drag-timeline-scroll/fonts/neue-montreal-medium.otf",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/drag-timeline-scroll/fonts/neue-montreal-medium.otf`,
    role: "Grotesque face for the headings and body copy.",
    notes:
      "Matches the source's PP Neue Montreal. Upload this font to Vercel Blob at the same pathname.",
  },
  ...Array.from(
    { length: 18 },
    (_, index) =>
      ({
        id: `folder-preview-hover-img-${index + 1}`,
        label: `Folder Preview Hover image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `folder-preview-hover/img-${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/folder-preview-hover/img-${index + 1}.jpg`,
        role: "Photo that pops out of a folder mouth on hover.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 6 },
    (_, index) =>
      ({
        id: `svg-stroke-hover-img-${index + 1}`,
        label: `SVG Stroke Hover image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `svg-stroke-hover/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/svg-stroke-hover/img${index + 1}.jpg`,
        role: "Image card revealed under the animated SVG scribble stroke.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "terminal-text-reveal-intro",
    label: "Terminal Text Reveal intro",
    provider: "vercel-blob",
    pathname: "terminal-text-reveal/intro.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/terminal-text-reveal/intro.jpg`,
    role: "Opening full-bleed image before the copy reveal sections.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    { length: 5 },
    (_, index) =>
      ({
        id: `terminal-text-reveal-img-${index + 1}`,
        label: `Terminal Text Reveal image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `terminal-text-reveal/img_${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/terminal-text-reveal/img_${index + 1}.jpg`,
        role:
          index === 0
            ? "Banner image between the intro copy and service sections."
            : "Service image paired with scroll-reactive copy.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "inversion-lens-hover-portrait",
    label: "Inversion Lens Hover portrait",
    provider: "vercel-blob",
    pathname: "inversion-lens-hover/portrait.jpeg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/inversion-lens-hover/portrait.jpeg`,
    role: "Image sampled and inverted inside the turbulent cursor lens.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "line-rise-text-hero",
    label: "Line Rise Text hero",
    provider: "vercel-blob",
    pathname: "line-rise-text/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/line-rise-text/hero.jpg`,
    role: "Full-bleed hero behind the delayed rising headline.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "line-rise-text-about",
    label: "Line Rise Text about image",
    provider: "vercel-blob",
    pathname: "line-rise-text/about.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/line-rise-text/about.jpg`,
    role: "Portrait panel between the about and story sections.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "mask-reveal-preloader-hero",
    label: "Mask Reveal Preloader hero",
    provider: "vercel-blob",
    pathname: "mask-reveal-preloader/hero-img.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/mask-reveal-preloader/hero-img.jpg`,
    role: "Hero image punched through by the scaling capsule mask.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "mask-reveal-preloader-mask",
    label: "Mask Reveal Preloader mask",
    provider: "vercel-blob",
    pathname: "mask-reveal-preloader/mask.svg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/mask-reveal-preloader/mask.svg`,
    role: "Rounded capsule shape cut out of the preloader fill.",
    notes:
      "Upload this SVG to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "converging-search-scroll-mesh",
    label: "Converging Search Scroll mesh",
    provider: "vercel-blob",
    pathname: "converging-search-scroll/mesh.png",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/converging-search-scroll/mesh.png`,
    role: "Faint mesh graphic behind the spotlight line.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "model-menu-3d-model",
    label: "Model Menu 3D model",
    provider: "vercel-blob",
    pathname: "model-menu-3d/model.glb",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/model-menu-3d/model.glb`,
    role: "GLB object lit behind the menu links and driven by the cursor.",
    notes:
      "Upload this GLB to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "model-menu-3d-hero",
    label: "Model Menu 3D hero",
    provider: "vercel-blob",
    pathname: "model-menu-3d/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/model-menu-3d/hero.jpg`,
    role: "Hero background behind the closed menu.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    { length: 4 },
    (_, index) =>
      ({
        id: `name-preloader-reveal-img-${index + 1}`,
        label: `Name Preloader Reveal image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `name-preloader-reveal/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/name-preloader-reveal/img${index + 1}.jpg`,
        role: "Portrait stacked and clipped open in the preloader center.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "fractal-glass-hover-hero",
    label: "Fractal Glass Hover hero",
    provider: "vercel-blob",
    pathname: "fractal-glass-hover/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/fractal-glass-hover/hero.jpg`,
    role: "Hero image refracted through the fluted-glass shader.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "preloader-panel-reveal-hero",
    label: "Preloader Panel Reveal hero",
    provider: "vercel-blob",
    pathname: "preloader-panel-reveal/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/preloader-panel-reveal/hero.jpg`,
    role: "Hero image slid up into place as the preloader panel wipes away.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    { length: 4 },
    (_, index) =>
      ({
        id: `block-reveal-text-img-${index + 1}`,
        label: `Block Reveal Text image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `block-reveal-text/img_${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/block-reveal-text/img_${index + 1}.jpg`,
        role: "Full-bleed image between the block-reveal copy sections.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "landing-counter-reveal-hero",
    label: "Landing Counter Reveal hero",
    provider: "vercel-blob",
    pathname: "landing-counter-reveal/hero.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/landing-counter-reveal/hero.jpg`,
    role: "Hero image opened by the clip-path reveal after the counter.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "webgl-dissolve-scroll-hero",
    label: "WebGL Dissolve Scroll hero",
    provider: "vercel-blob",
    pathname: "webgl-dissolve-scroll/hero-img.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/webgl-dissolve-scroll/hero-img.jpg`,
    role: "Hero image dissolved from the bottom up by the WebGL noise field.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "expanding-navbar-reveal-backdrop",
    label: "Expanding Navbar Reveal backdrop",
    provider: "vercel-blob",
    pathname: "expanding-navbar-reveal/navbar-img.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/expanding-navbar-reveal/navbar-img.jpg`,
    role: "Full-bleed image uncovered as the navbar card expands.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "expanding-navbar-reveal-logo",
    label: "Expanding Navbar Reveal logo",
    provider: "vercel-blob",
    pathname: "expanding-navbar-reveal/logo.svg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/expanding-navbar-reveal/logo.svg`,
    role: "Wordmark that FLIPs from the card's bottom center to the top bar.",
    notes:
      "Upload this SVG to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    { length: 10 },
    (_, index) =>
      ({
        id: `spotlight-index-scroll-img-${index + 1}`,
        label: `Spotlight Index Scroll image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `spotlight-index-scroll/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/spotlight-index-scroll/img${index + 1}.jpg`,
        role: "Gallery image that brightens when it crosses the center sightline.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "aperture-zoom-hero-sky",
    label: "Aperture Zoom Hero sky",
    provider: "vercel-blob",
    pathname: "aperture-zoom-hero/sky.jpg",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/aperture-zoom-hero/sky.jpg`,
    role: "Tall sky image that pans behind the zooming window frame.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  {
    id: "aperture-zoom-hero-window",
    label: "Aperture Zoom Hero window frame",
    provider: "vercel-blob",
    pathname: "aperture-zoom-hero/window.png",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/aperture-zoom-hero/window.png`,
    role: "Window frame overlay scaled toward the camera as you scroll.",
    notes:
      "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
  },
  ...Array.from(
    { length: 7 },
    (_, index) =>
      ({
        id: `infinite-contact-scroll-icon-${index + 1}`,
        label: `Infinite Contact Scroll icon ${index + 1}`,
        provider: "vercel-blob",
        pathname: `infinite-contact-scroll/icon_${index + 1}.png`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/infinite-contact-scroll/icon_${index + 1}.png`,
        role: "Center glyph swapped in when a new row locks to center.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...Array.from(
    { length: 16 },
    (_, index) =>
      ({
        id: `expanding-rows-gallery-img-${index + 1}`,
        label: `Expanding Rows Gallery image ${index + 1}`,
        provider: "vercel-blob",
        pathname: `expanding-rows-gallery/img${index + 1}.jpg`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/expanding-rows-gallery/img${index + 1}.jpg`,
        role: "Project card image tiled across the expanding rows.",
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "corridor-scene-3d-gltf",
    label: "Corridor Scene 3D GLTF",
    provider: "vercel-blob",
    pathname: "corridor-scene-3d/scene.gltf",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/corridor-scene-3d/scene.gltf`,
    role: "Brutalist corridor scene loaded by GLTFLoader.",
    notes:
      "Keep scene.bin and the textures directory beside this file so its relative URIs resolve.",
  },
  {
    id: "corridor-scene-3d-bin",
    label: "Corridor Scene 3D geometry",
    provider: "vercel-blob",
    pathname: "corridor-scene-3d/scene.bin",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/corridor-scene-3d/scene.bin`,
    role: "Binary geometry buffer referenced by the corridor GLTF.",
    notes: "Upload beside scene.gltf with the original filename.",
  },
  ...[
    ["base-color", "Concrete_Tiles_baseColor.jpeg", "Concrete base-color map."],
    [
      "metallic-roughness",
      "Concrete_Tiles_metallicRoughness.png",
      "Concrete metallic and roughness map.",
    ],
    ["emissive", "Concrete_Tiles_emissive.png", "Concrete emissive map."],
    ["normal", "Concrete_Tiles_normal.png", "Concrete normal map."],
  ].map(
    ([id, filename, role]) =>
      ({
        id: `corridor-scene-3d-${id}`,
        label: `Corridor Scene 3D ${id}`,
        provider: "vercel-blob",
        pathname: `corridor-scene-3d/textures/${filename}`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/corridor-scene-3d/textures/${filename}`,
        role,
        notes:
          "Keep this file under textures/ because scene.gltf references the relative path.",
      }) as const satisfies AssetItem,
  ),
  ...[
    ["logo", "logo.png", "Editorial wordmark shown at the top and bottom."],
    ["image-1", "img-1.jpg", "First full-width monochrome editorial image."],
    ["image-2", "img-2.jpg", "Second full-width monochrome editorial image."],
    ["image-3", "img-3.jpg", "Third full-width monochrome editorial image."],
  ].map(
    ([id, filename, role]) =>
      ({
        id: `cursor-trail-scroll-${id}`,
        label: `Cursor Trail Scroll ${id}`,
        provider: "vercel-blob",
        pathname: `cursor-trail-scroll/${filename}`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/cursor-trail-scroll/${filename}`,
        role,
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...[
    [
      "hero",
      "hero.jpg",
      "Fullscreen backdrop shown behind the folded menu strip.",
    ],
    ["img-1", "img1.jpg", "Panel 01 image, clip-revealed on hover when open."],
    ["img-2", "img2.jpg", "Panel 02 image, clip-revealed on hover when open."],
    ["img-3", "img3.jpg", "Panel 03 image, clip-revealed on hover when open."],
    ["img-4", "img4.jpg", "Panel 04 image, clip-revealed on hover when open."],
    ["img-5", "img5.jpg", "Panel 05 image, clip-revealed on hover when open."],
  ].map(
    ([id, filename, role]) =>
      ({
        id: `folding-panel-menu-${id}`,
        label: `Folding Panel Menu ${id}`,
        provider: "vercel-blob",
        pathname: `folding-panel-menu/${filename}`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/folding-panel-menu/${filename}`,
        role,
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  ...[
    [
      "hero",
      "hero.jpg",
      "Fullscreen hero backdrop behind the opening wordmark.",
    ],
    ["img-1", "img-1.jpg", "First editorial frame in the four-up strip."],
    ["img-2", "img-2.jpg", "Second editorial frame in the four-up strip."],
    ["img-3", "img-3.jpg", "Third editorial frame in the four-up strip."],
    ["img-4", "img-4.jpg", "Fourth editorial frame in the four-up strip."],
  ].map(
    ([id, filename, role]) =>
      ({
        id: `cross-reveal-scroll-${id}`,
        label: `Cross Reveal Scroll ${id}`,
        provider: "vercel-blob",
        pathname: `cross-reveal-scroll/${filename}`,
        fallbackPath: `${BLOB_PUBLIC_ORIGIN}/cross-reveal-scroll/${filename}`,
        role,
        notes:
          "Upload this image to Vercel Blob at the same pathname and serve it with public access.",
      }) as const satisfies AssetItem,
  ),
  {
    id: "starry-night-flow-painting",
    label: "Starry Night Flow painting",
    provider: "vercel-blob",
    pathname: "starry-night-flow/starry-night.webp",
    fallbackPath: `${BLOB_PUBLIC_ORIGIN}/starry-night-flow/starry-night.webp`,
    role: "Van Gogh's The Starry Night, sampled into the dithered particle field.",
    notes: "Served from Vercel Blob at the stable registry pathname.",
  } as const satisfies AssetItem,
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
