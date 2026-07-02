const ASSET_ORIGIN = "https://compronents.dev";
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

export const assetItems = [
  ...march2025TemplateAssets,
  ...archiveCommercePageAssets,
  ...interiorStudioPageAssets,
  ...diningRoomPageAssets,
  ...filmStudioPageAssets,
  ...darkCatalogPageAssets,
  ...spiralGalleryAssets,
  ...frameScrollAssets,
  ...fallingTagListAssets,
  ...crtDisplayAssets,
  ...creativeClutterAssets,
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
