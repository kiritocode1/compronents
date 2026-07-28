import { assetItems, getHostedAssetUrl } from "@/lib/assets";

/**
 * UI-only metadata: the documented public API (props) for each component, and
 * the on-disk path of its `demo.tsx`. Kept separate from `registry.ts` so the
 * registry JSON stays lean.
 *
 * To add one: set `demoPath` to `src/components/demos/<name>.tsx` and list the
 * component's props in `api`.
 */

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface NuanceDoc {
  label: string;
  description: string;
}

export interface EditableDoc {
  name: string;
  control: "text" | "textarea" | "color" | "tuple" | "links" | "asset-url";
  description: string;
}

export interface ComponentAssetDoc {
  id: string;
  label: string;
  provider: "vercel-blob";
  pathname: string;
  fallbackPath: string;
  role: string;
}

export interface ComponentMeta {
  /** Path on disk to the demo source, relative to the repo root. */
  demoPath: string;
  studioPath?: string;
  api: PropDoc[];
  nuance: NuanceDoc[];
  editable: EditableDoc[];
  assets: ComponentAssetDoc[];
}

const animatedFooterAssets = assetItems
  .filter((asset) => asset.id.startsWith("animated-footer-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

// The accordion ships a 20-image set; document a representative few rather than
// rendering twenty near-identical asset cards.
const accordionFramesAssets = assetItems
  .filter((asset) => asset.id.startsWith("accordion-frames-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "accordion-frames-spotlight-1"
        ? "First of the numbered panel set spotlight-1.jpg … spotlight-20.jpg, each revealed when its slat is focused."
        : asset.role,
  }));

const asciiImageRevealAssets = assetItems
  .filter((asset) => asset.id.startsWith("ascii-image-reveal-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "ascii-image-reveal-img-1"
        ? "First of the 15-image set img1.jpg ... img15.jpg, each sampled into ASCII before its photo reveal."
        : asset.role,
  }));

const detroitParisSliderAssets = assetItems
  .filter((asset) => asset.id.startsWith("detroit-paris-slider-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "detroit-paris-slider-img-1"
        ? "First of the 10-image set slide-img-1.jpg ... slide-img-10.jpg, wrapped through the infinite stream."
        : asset.role,
  }));

const scrollTunnel3dAssets = assetItems
  .filter((asset) => asset.id.startsWith("scroll-tunnel-3d-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "scroll-tunnel-3d-img-1"
        ? "First of the 12-image set img-1.jpg ... img-12.jpg, ringed around the tunnel and pulled past the camera."
        : asset.role,
  }));

const curveGalleryAssets = scrollTunnel3dAssets.map((asset) => ({
  ...asset,
  role:
    asset.id === "scroll-tunnel-3d-img-1"
      ? "First of the reused 12-image set img-1.jpg ... img-12.jpg, scattered along each generated camera curve."
      : "Existing Scroll Tunnel photograph reused as a plane along the curve.",
}));

const spiralGalleryAssets = assetItems
  .filter((asset) => asset.id.startsWith("spiral-gallery-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "spiral-gallery-img-1"
        ? "First of the 12-image set img-1.jpg ... img-12.jpg cycled around the helix tiles."
        : asset.role,
  }));

const frameScrollAssets = assetItems
  .filter((asset) => asset.id.startsWith("frame-scroll-"))
  .filter(
    (asset) =>
      asset.id === "frame-scroll-hero" || asset.id === "frame-scroll-img-1",
  )
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "frame-scroll-img-1"
        ? "First of the 16-image set img-1.jpg ... img-16.jpg laid into the four parallax columns."
        : asset.role,
  }));

const fallingTagListAssets = assetItems
  .filter((asset) => asset.id.startsWith("falling-tag-list-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "falling-tag-list-service-1-img-1"
        ? "First of the 9-image set (three thumbnails per service) fanned up on hover."
        : asset.role,
  }));

const crtDisplayAssets = assetItems
  .filter((asset) => asset.id.startsWith("crt-display-"))
  .filter(
    (asset) =>
      asset.id === "crt-display-model" ||
      asset.id === "crt-display-default" ||
      asset.id === "crt-display-project-1",
  )
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "crt-display-project-1"
        ? "First of the 5-image set project-img-1.jpg ... project-img-5.jpg loaded on hover."
        : asset.role,
  }));

const creativeClutterAssets = assetItems
  .filter((asset) => asset.id.startsWith("creative-clutter-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "creative-clutter-music"
        ? "First of the 11 cutout props (music, cd, dialog, folder, and so on) arranged on the desk."
        : asset.role,
  }));

const preloaderRevealAssets = assetItems
  .filter((asset) => asset.id.startsWith("preloader-reveal-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const inkCoreLayoutAssetDocs = assetItems
  .filter((asset) => asset.id.startsWith("ink-core-layout-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const scrollWaveGalleryAssets = assetItems
  .filter((asset) => asset.id.startsWith("scroll-wave-gallery-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role:
      asset.id === "scroll-wave-gallery-img-1"
        ? "First of the 12-image set img-1.jpg ... img-12.jpg, stacked in the swaying column."
        : asset.role,
  }));

const asciiLogoAssets = assetItems
  .filter((asset) => asset.id.startsWith("ascii-logo-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const overlayMenuAssets = assetItems
  .filter((asset) => asset.id.startsWith("overlay-menu-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const mosaicFlipAssets = assetItems
  .filter((asset) => asset.id.startsWith("mosaic-flip-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const imageRevealAssets = assetItems
  .filter((asset) => asset.id.startsWith("image-reveal-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const awardListAssets = assetItems
  .filter((asset) => asset.id.startsWith("award-list-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const inversaScrollAssets = assetItems
  .filter((asset) => asset.id.startsWith("inversa-scroll-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const materialSpotlightAssets = assetItems
  .filter((asset) => asset.id.startsWith("material-spotlight-"))
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

const portfolioPageAssets = assetItems
  .filter((asset) => asset.id.startsWith("portfolio-page-"))
  .slice(0, 3)
  .map((asset) => ({
    id: asset.id,
    label: asset.label,
    provider: asset.provider,
    pathname: asset.pathname,
    fallbackPath: asset.fallbackPath,
    role: asset.role,
  }));

function pageAssets(prefix: string, limit = 4): ComponentAssetDoc[] {
  return assetItems
    .filter((asset) => asset.id.startsWith(prefix))
    .slice(0, limit)
    .map((asset) => ({
      id: asset.id,
      label: asset.label,
      provider: asset.provider,
      pathname: asset.pathname,
      fallbackPath: asset.fallbackPath,
      role: asset.role,
    }));
}

function assetsByIds(ids: string[]): ComponentAssetDoc[] {
  return ids
    .map((id) => assetItems.find((asset) => asset.id === id))
    .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset))
    .map((asset) => ({
      id: asset.id,
      label: asset.label,
      provider: asset.provider,
      pathname: asset.pathname,
      fallbackPath: asset.fallbackPath,
      role: asset.role,
    }));
}

const march2025TemplateAssetDocs = assetsByIds([
  "march-2025-home-hero",
  "march-2025-fonts-rader-pprader-bold",
  "march-2025-fonts-messina-sans-messinasans-regular",
  "march-2025-fonts-messina-sans-mono-messinasansmono-regular",
  "march-2025-work-work-1",
  "march-2025-project-banner",
  "march-2025-about-about-hero",
  "march-2025-reviews-review-1",
]);
const archiveCommercePageAssetDocs = pageAssets("archive-commerce-page-", 5);
const interiorStudioPageAssetDocs = pageAssets("interior-studio-page-", 5);
const diningRoomPageAssetDocs = pageAssets("dining-room-page-", 5);
const filmStudioPageAssetDocs = pageAssets("film-studio-page-", 5);
const darkCatalogPageAssetDocs = pageAssets("dark-catalog-page-", 5);
const deadspacePageAssetDocs = pageAssets("deadspace-page-", 5);
const damienTsarantosPageAssetDocs = pageAssets("damien-tsarantos-page-", 5);
const wuWeiPageAssetDocs = pageAssets("wu-wei-page-", 5);
const otisValenPageAssetDocs = pageAssets("otis-valen-page-", 5);
const houseOfEpochsPageAssetDocs = pageAssets("house-of-epochs-page-", 5);
const contentArchitecturePageAssetDocs = pageAssets(
  "content-architecture-page-",
  6,
);
const politeChaosPageAssetDocs = pageAssets("polite-chaos-page-", 5);
const orbitMatterPageAssetDocs = pageAssets("orbit-matter-page-", 5);
const lemonBureauPageAssetDocs = pageAssets("lemon-bureau-page-", 5);
const velascoSolariPageAssetDocs = pageAssets("velasco-solari-page-", 5);
const sorenPageAssetDocs = pageAssets("soren-page-", 5);
const neotericPageAssetDocs = pageAssets("neoteric-page-", 5);
const unusualStudioPageAssetDocs = pageAssets("unusual-studio-page-", 5);
const brutalistPortfolioPageAssetDocs = pageAssets(
  "brutalist-portfolio-page-",
  5,
);
const nullStudioPageAssetDocs = pageAssets("null-studio-page-", 5);
const isochromePageAssetDocs = pageAssets("isochrome-page-", 5);
const landingImageRevealAssetDocs = pageAssets("landing-image-reveal-", 5);
const spotlightGalleryScrollAssetDocs = pageAssets(
  "spotlight-gallery-scroll-",
  5,
);
const drawnPathFeaturesAssetDocs = assetsByIds(
  Array.from({ length: 4 }, (_, i) => `drawn-path-features-img-${i + 1}`),
);
const circularWidgetDialAssetDocs = assetsByIds(
  Array.from({ length: 10 }, (_, i) => `circular-widget-dial-widget-${i + 1}`),
);
const slidingIndexMenuAssetDocs = assetsByIds(["sliding-index-menu-menu-img"]);
const elasticCurtainMenuAssetDocs = assetsByIds(["elastic-curtain-menu-bg"]);
const tiltAwayMenuAssetDocs = assetsByIds([
  "tilt-away-menu-hero",
  ...Array.from({ length: 4 }, (_, i) => `tilt-away-menu-img-${i + 1}`),
]);
const pushDownOverlayMenuAssetDocs = assetsByIds([
  "push-down-overlay-menu-hero",
  "push-down-overlay-menu-menu-media",
]);
const dealtTeamCardsAssetDocs = assetsByIds(
  Array.from({ length: 3 }, (_, i) => `dealt-team-cards-team-member-${i + 1}`),
);
const wedgeClipWorkScrollAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `wedge-clip-work-scroll-work-0${i + 1}`),
);

const splitColumnInfiniteSliderAssetDocs = assetsByIds([
  ...Array.from(
    { length: 5 },
    (_, i) => `split-column-infinite-slider-slide-img-left-${i + 1}`,
  ),
  ...Array.from(
    { length: 5 },
    (_, i) => `split-column-infinite-slider-slide-img-right-${i + 1}`,
  ),
]);
const dialProductSliderAssetDocs = assetsByIds(
  Array.from({ length: 10 }, (_, i) => `dial-product-slider-product-${i + 1}`),
);
const parallaxDragRailAssetDocs = assetsByIds(
  Array.from(
    { length: 8 },
    (_, i) => `parallax-drag-rail-slider-img-0${i + 1}`,
  ),
);
const endlessSideStoryAssetDocs = assetsByIds(
  Array.from({ length: 4 }, (_, i) => `endless-side-story-img${i + 1}`),
);
const marqueeCarouselScrollAssetDocs = assetsByIds(
  Array.from(
    { length: 5 },
    (_, i) => `marquee-carousel-scroll-slide-img-${i + 1}`,
  ),
);
const throwAwayWorkSliderAssetDocs = assetsByIds(
  Array.from(
    { length: 4 },
    (_, i) => `throw-away-work-slider-slide-img-${i + 1}`,
  ),
);

const flipMarqueeHorizontalAssetDocs = assetsByIds([
  ...Array.from(
    { length: 13 },
    (_, i) => `flip-marquee-horizontal-img-${i + 1}`,
  ),
  "flip-marquee-horizontal-slide-1",
  "flip-marquee-horizontal-slide-2",
]);
const clipRevealServicesAssetDocs = assetsByIds([
  "clip-reveal-services-hero",
  "clip-reveal-services-outro",
  "clip-reveal-services-whatido",
]);
const swingInWorkGridAssetDocs = assetsByIds(
  Array.from({ length: 10 }, (_, i) => `swing-in-work-grid-work-${i + 1}`),
);
const stickyParallaxSlidesAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `sticky-parallax-slides-img${i + 1}`),
);
const maskedSpotlightScrollAssetDocs = assetsByIds([
  ...Array.from({ length: 9 }, (_, i) => `masked-spotlight-scroll-img${i + 1}`),
  "masked-spotlight-scroll-spotlight-banner",
  "masked-spotlight-scroll-spotlight-mask",
]);
const dealStackCardsScrollAssetDocs = assetsByIds(
  Array.from({ length: 6 }, (_, i) => `deal-stack-cards-scroll-card-${i + 1}`),
);

const frameSequenceHeroAssetDocs = assetsByIds([
  "frame-sequence-hero-frame-0001",
  "frame-sequence-hero-frame-0104",
  "frame-sequence-hero-frame-0207",
  ...Array.from(
    { length: 4 },
    (_, i) => `frame-sequence-hero-client-logo-${i + 1}`,
  ),
  "frame-sequence-hero-dashboard",
  "frame-sequence-hero-logo",
]);
const snapParallaxProjectsAssetDocs = assetsByIds(
  Array.from({ length: 6 }, (_, i) => `snap-parallax-projects-img${i + 1}`),
);
const triangleFillScrollAssetDocs = assetsByIds([
  "triangle-fill-scroll-bg",
  ...Array.from({ length: 3 }, (_, i) => `triangle-fill-scroll-card-${i + 1}`),
]);
const nestedMaskBannerAssetDocs = assetsByIds([
  "nested-mask-banner-banner-img",
  "nested-mask-banner-banner-img-mask",
]);
const pinnedScaleMosaicAssetDocs = assetsByIds(
  Array.from({ length: 19 }, (_, i) => `pinned-scale-mosaic-img${i + 1}`),
);
const curvedLetterPathScrollAssetDocs = assetsByIds(
  Array.from({ length: 7 }, (_, i) => `curved-letter-path-scroll-img${i + 1}`),
);

const carouselRingGalleryAssetDocs = assetsByIds(
  Array.from({ length: 20 }, (_, i) => `carousel-ring-gallery-img${i + 1}`),
);
const infiniteDragCanvasAssetDocs = assetsByIds(
  Array.from({ length: 20 }, (_, i) => `infinite-drag-canvas-img${i + 1}`),
);
const cardFanLandingRevealAssetDocs = assetsByIds(
  Array.from({ length: 8 }, (_, i) => `card-fan-landing-reveal-card-${i + 1}`),
);
const counterWordPreloaderAssetDocs = assetsByIds(
  Array.from({ length: 10 }, (_, i) => `counter-word-preloader-img${i + 1}`),
);
const shuffleGridPreloaderAssetDocs = assetsByIds(
  Array.from({ length: 35 }, (_, i) => `shuffle-grid-preloader-img${i + 1}`),
);
const logoMaskZoomScrollAssetDocs = assetsByIds([
  "logo-mask-zoom-scroll-hero-img-layer-1",
  "logo-mask-zoom-scroll-hero-img-layer-2",
  "logo-mask-zoom-scroll-logo",
]);

const photoSphereOrbAssetDocs = assetsByIds(
  Array.from({ length: 30 }, (_, i) => `photo-sphere-orb-img${i + 1}`),
);
const flyingCubeScrollAssetDocs = assetsByIds(
  Array.from({ length: 33 }, (_, i) => `flying-cube-scroll-img${i + 1}`),
);
const shaderWarpSliderAssetDocs = assetsByIds(
  Array.from({ length: 7 }, (_, i) => `shader-warp-slider-img${i + 1}`),
);
const cardPartingRevealAssetDocs = assetsByIds([
  ...Array.from({ length: 6 }, (_, i) => `card-parting-reveal-img-${i + 1}`),
  "card-parting-reveal-logo",
  "card-parting-reveal-pro-logo",
]);
const imageExplosionFooterAssetDocs = assetsByIds([
  "image-explosion-footer-hero",
  "image-explosion-footer-outro",
  ...Array.from({ length: 15 }, (_, i) => `image-explosion-footer-img${i + 1}`),
]);
const pushupCardStackAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `pushup-card-stack-img${i + 1}`),
);

const clipMaskTransitionPageAssetDocs = assetsByIds(
  Array.from({ length: 3 }, (_, i) => `clip-mask-transition-page-img${i + 1}`),
);
const viewTransitionFolioPageAssetDocs = assetsByIds([
  ...Array.from(
    { length: 4 },
    (_, i) => `view-transition-folio-page-img${i + 1}`,
  ),
  "view-transition-folio-page-portrait",
]);
const revealerTransitionPageAssetDocs = assetsByIds([
  "revealer-transition-page-hero",
  "revealer-transition-page-studio",
  ...Array.from(
    { length: 4 },
    (_, i) => `revealer-transition-page-img${i + 1}`,
  ),
]);
const blockLogoTransitionPageAssetDocs = assetsByIds(
  Array.from(
    { length: 4 },
    (_, i) => `block-logo-transition-page-img-0${i + 1}`,
  ),
);
const scrollAdvanceProjectPageAssetDocs = assetsByIds(
  Array.from({ length: 3 }, (_, p) =>
    Array.from(
      { length: 5 },
      (_, i) => `scroll-advance-project-page-project-${p + 1}-${i + 1}`,
    ),
  ).flat(),
);

const stripMergeRevealAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `strip-merge-reveal-img-${i + 1}`),
);
const parallaxModelFooterAssetDocs = assetsByIds([
  "parallax-model-footer-model",
]);
const rotatingHalvesMenuAssetDocs = assetsByIds(["rotating-halves-menu-hero"]);
const stackedBrandCardsAssetDocs = assetsByIds([
  "stacked-brand-cards-hero",
  ...Array.from({ length: 4 }, (_, i) => `stacked-brand-cards-card-${i + 1}`),
]);
const cylinderBlockGalleryAssetDocs = assetsByIds(
  Array.from({ length: 50 }, (_, i) => `cylinder-block-gallery-img-${i + 1}`),
);
const floatingModelScrollAssetDocs = assetsByIds([
  "floating-model-scroll-model",
]);
const emojiTrailPreloaderAssetDocs = assetsByIds([
  "emoji-trail-preloader-cursor",
  "emoji-trail-preloader-logo",
  "emoji-trail-preloader-menu",
  "emoji-trail-preloader-hero",
  ...Array.from(
    { length: 4 },
    (_, i) => `emoji-trail-preloader-badge-${i + 1}`,
  ),
]);
const garageScene3DAssetDocs = assetsByIds(["garage-scene-3d-model"]);

const wheelClipSliderAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `wheel-clip-slider-img-${i + 1}`),
);
const rotatingPanelSliderAssetDocs = assetsByIds(
  Array.from({ length: 7 }, (_, i) => `rotating-panel-slider-img-${i + 1}`),
);
const flipTileBoardAssetDocs = assetsByIds([
  "flip-tile-board-front",
  "flip-tile-board-back",
]);

const cycleScrubShowcaseAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `cycle-scrub-showcase-img-${i + 1}`),
);
const splitClickSliderAssetDocs = assetsByIds(
  Array.from({ length: 5 }, (_, i) => `split-click-slider-img-${i + 1}`),
);
const driftingCardMarqueeAssetDocs = assetsByIds([
  "drifting-card-marquee-hero",
  ...Array.from({ length: 5 }, (_, i) => `drifting-card-marquee-img-${i + 1}`),
]);

const contactSheetZoomAssetDocs = assetsByIds(
  Array.from({ length: 50 }, (_, i) => `contact-sheet-zoom-img-${i + 1}`),
);
const serviceIndexScrubAssetDocs = assetsByIds([
  "service-index-scrub-hero",
  ...Array.from({ length: 8 }, (_, i) => `service-index-scrub-img-${i + 1}`),
]);

export const componentMeta: Record<string, ComponentMeta> = {
  "clip-mask-transition-page": {
    demoPath: "src/components/demos/clip-mask-transition-page.tsx",
    nuance: [
      {
        label: "The browser owns the transition",
        description:
          "Both pages are snapshotted by startViewTransition and animated through ::view-transition pseudo-elements, so there is no JS timeline, no duplicated DOM, and the two states cannot drift out of sync.",
      },
      {
        label: "The navbar opts out",
        description:
          "Giving the nav its own view-transition-name and setting its group animation to none excludes it from the snapshot pair entirely, which is what keeps it rock steady while the page behind it moves.",
      },
      {
        label: "Enter and exit are different shapes",
        description:
          "The outgoing page only translates and fades, while the incoming one also opens a clip path from a flat line at the bottom edge, so arrival reads as unrolling rather than as the exit reversed.",
      },
    ],
    editable: [
      {
        name: "brand",
        control: "text",
        description: "The wordmark in the fixed nav.",
      },
    ],
    assets: clipMaskTransitionPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: "Blob asset base",
        description: "Base URL the three route backdrops are loaded from.",
      },
      {
        name: "initialPath",
        type: "ClipMaskRoute",
        default: '"/"',
        description: "Which route the internal router starts on.",
      },
    ],
  },
  "view-transition-folio-page": {
    demoPath: "src/components/demos/view-transition-folio-page.tsx",
    nuance: [
      {
        label: "Entrances re-run per route",
        description:
          "The source replaced the whole document body on navigation and re-initialised from scratch. The port keys its container on the route so React remounts it, which reproduces that fresh-mount behaviour without touching innerHTML.",
      },
      {
        label: "Clip path, not opacity",
        description:
          "The incoming page opens a polygon from the bottom edge upward, so content is uncovered rather than faded, and nothing is ever semi-transparent mid-transition.",
      },
    ],
    editable: [
      {
        name: "name / aboutCopy",
        control: "text",
        description: "The hero wordmark and the about paragraph.",
      },
    ],
    assets: viewTransitionFolioPageAssetDocs,
    api: [
      {
        name: "assetBase / workImages / portraitImage",
        type: "string / string[]",
        default: "Blob asset base",
        description: "Work grid photographs and the about portrait.",
      },
      {
        name: "name / aboutCopy / initialPath",
        type: "string / FolioRoute",
        default: "BLANK copy",
        description: "Folio copy and the route the internal router starts on.",
      },
    ],
  },
  "revealer-transition-page": {
    demoPath: "src/components/demos/revealer-transition-page.tsx",
    nuance: [
      {
        label: "Two transitions stacked",
        description:
          "A GSAP revealer wipes each page in on arrival, while the View Transition API separately grows the incoming snapshot from a small centered rectangle. One handles the page's own entrance, the other the crossing between pages.",
      },
      {
        label: "The default transition is cancelled",
        description:
          "Both pseudo-elements are set to animation: none, so the only motion is the explicit clip-path keyframe run on the documentElement. Without that override the browser's own crossfade would fight it.",
      },
      {
        label: "Split type follows the route",
        description:
          "The home hero splits by character and every other route by word, matching the source's per-page choice, with different delays so the copy always lands after the revealer has cleared.",
      },
    ],
    editable: [
      {
        name: "studioCopy / contactEmails",
        control: "text",
        description: "Studio paragraph and the contact addresses.",
      },
    ],
    assets: revealerTransitionPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: "Blob asset base",
        description: "Base URL for the hero, work, and studio imagery.",
      },
      {
        name: "brand / location / studioCopy / contactEmails / socials",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Site copy across the four routes.",
      },
      {
        name: "initialPath",
        type: "RevealerRoute",
        default: '"/"',
        description: "Which route the internal router starts on.",
      },
    ],
  },
  "block-logo-transition-page": {
    demoPath: "src/components/demos/block-logo-transition-page.tsx",
    nuance: [
      {
        label: "The wipe never reverses",
        description:
          "Blocks close from their left origin and open from their right, so the sweep continues in one direction across the whole transition instead of retracing its own path.",
      },
      {
        label: "The mark measures itself",
        description:
          "getTotalLength on the path supplies both the dash array and the starting offset, so any replacement logo traces correctly with no hand-tuned numbers.",
      },
      {
        label: "Navigation waits for the cover",
        description:
          "The route only changes in the timeline's onComplete, after the blocks have fully closed, so the incoming page is never visible while the cover is still animating.",
      },
    ],
    editable: [
      {
        name: "homeHeading / contactHeading",
        control: "text",
        description: "The two oversized route headings.",
      },
    ],
    assets: blockLogoTransitionPageAssetDocs,
    api: [
      {
        name: "assetBase / archiveImages",
        type: "string / string[]",
        default: "Blob asset base",
        description: "Photographs listed on the archive route.",
      },
      {
        name: "brand / homeHeading / contactHeading",
        type: "string",
        default: "BLANK copy",
        description: "Nav wordmark and the route headings.",
      },
      {
        name: "initialPath",
        type: "BlockLogoRoute",
        default: '"/"',
        description: "Which route the internal router starts on.",
      },
    ],
  },
  "scroll-advance-project-page": {
    demoPath: "src/components/demos/scroll-advance-project-page.tsx",
    nuance: [
      {
        label: "Scrolling past the end is the navigation",
        description:
          "The footer pins for three viewports and its progress bar fills across that pin. Completing it triggers the move to the next project, so the reader advances by continuing rather than by clicking.",
      },
      {
        label: "Two progress bars, two scopes",
        description:
          "One tracks the whole document for the nav readout, the other tracks only the pinned footer. They run from separate triggers so the nav bar is not affected by the footer's own scroll range.",
      },
      {
        label: "A latch prevents a double handoff",
        description:
          "Once progress reaches one, a ref is flipped before the timeline starts, so scrubbing back and forth across the end of the pin cannot queue a second navigation.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "text",
        description: "Project slugs, titles, descriptions, and image sets.",
      },
    ],
    assets: scrollAdvanceProjectPageAssetDocs,
    api: [
      {
        name: "projects",
        type: "ScrollAdvanceProject[]",
        default: "Three BLANK projects",
        description:
          "Slug, title, description, and images per project. The list wraps, so the last hands back to the first.",
      },
      {
        name: "assetBase / initialSlug",
        type: "string",
        default: "Blob asset base",
        description:
          "Where the default project images load from, and which project to open on.",
      },
    ],
  },
  "photo-sphere-orb": {
    demoPath: "src/components/demos/photo-sphere-orb.tsx",
    nuance: [
      {
        label: "Fibonacci spacing, not lat/long",
        description:
          "Polar angle comes from acos of a linear ramp, which distributes points evenly over the sphere's surface. A naive nested loop over latitude and longitude would crowd the poles and thin the equator.",
      },
      {
        label: "Each plane matches its own texture",
        description:
          "Geometry is built after the image loads, from the texture's real aspect ratio, so portrait and landscape shots both sit undistorted on the same ball.",
      },
      {
        label: "Pan is disabled on purpose",
        description:
          "Orbit and zoom are allowed but panning is not, so the sphere always stays centered and cannot be dragged out of frame.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "text",
        description: "Pool the sphere's tiles are drawn from at random.",
      },
      {
        name: "totalItems / sphereRadius",
        control: "text",
        description: "How many tiles and how large the ball is.",
      },
    ],
    assets: photoSphereOrbAssetDocs,
    api: [
      {
        name: "images / totalItems",
        type: "string[] / number",
        default: "30 stills / 100 tiles",
        description:
          "Each of the totalItems planes draws a random image from the pool, so tiles repeat across the sphere.",
      },
      {
        name: "sphereRadius / backgroundColor",
        type: "number / string",
        default: "5 / #000000",
        description: "Ball radius in scene units and the clear color.",
      },
    ],
  },
  "flying-cube-scroll": {
    demoPath: "src/components/demos/flying-cube-scroll.tsx",
    nuance: [
      {
        label: "Real CSS cubes, six images each",
        description:
          "Every cube is a preserve-3d box with six faces translated and rotated into place, each carrying its own photograph, so the cubes have genuine volume and show different pictures as they tumble.",
      },
      {
        label: "Two phases on one pin",
        description:
          "All six cubes fly in across the first half of the scroll, then two of them keep rotating an extra half turn across the second, so the arrangement keeps developing after it has apparently settled.",
      },
      {
        label: "Copy hands off through blur",
        description:
          "The opening headline scales up and blurs out while the second resolves from blurred and undersized, so the two never read as a crossfade.",
      },
    ],
    editable: [
      {
        name: "heading / outroHeading / outroBody",
        control: "text",
        description: "The two headline blocks.",
      },
    ],
    assets: flyingCubeScrollAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "33 BLANK stills",
        description:
          "Consumed six at a time, one per cube face, in order across the six cubes.",
      },
      {
        name: "heading / outroHeading / outroBody / aboutHeading",
        type: "string",
        default: "BLANK copy",
        description: "Copy for both phases and the closing section.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "shader-warp-slider": {
    demoPath: "src/components/demos/shader-warp-slider.tsx",
    nuance: [
      {
        label: "One plane, two textures",
        description:
          "The fragment shader picks between the current and next texture based on the UV's Y against scroll position, so the transition needs a single mesh and there is no second object to keep in sync.",
      },
      {
        label: "Warp is velocity, not position",
        description:
          "The vertex shader displaces Z by scroll intensity, which decays independently of scroll position, so the plane bows during a fast flick and flattens as it coasts to a stop.",
      },
      {
        label: "Stability is a separate state",
        description:
          "Once motion falls below threshold the component snaps to a whole slide and pins the shader's position uniform to zero, so tiny residual drift cannot leave a hairline of the next image showing.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "Slide images, titles, and links.",
      },
    ],
    assets: shaderWarpSliderAssetDocs,
    api: [
      {
        name: "slides",
        type: "ShaderSlide[]",
        default: "7 BLANK projects",
        description:
          "Title, link, and image per slide. The set wraps, so scrolling never reaches an end.",
      },
      {
        name: "brand / navLinks / socials / footerLeft / footerRight",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Chrome around the slider.",
      },
    ],
  },
  "skew-char-header": {
    demoPath: "src/components/demos/skew-char-header.tsx",
    nuance: [
      {
        label: "Stagger is per line, not per heading",
        description:
          "Each character's delay comes from its index inside its own line, so a three line heading fires three simultaneous ripples rather than one long sweep that leaves the last line arriving very late.",
      },
      {
        label: "Three behaviours, one implementation",
        description:
          "Load, enter, and scrub all build the same timeline and differ only in how it is driven: played immediately, restarted by a trigger, or bound to scrub. Adding a mode does not change the animation code.",
      },
      {
        label: "Skew is released with the travel",
        description:
          "Characters arrive from x:100 with 20 degrees of skew, both easing out together on power3, so the type appears to straighten as it decelerates rather than snapping upright at the end.",
      },
    ],
    editable: [
      {
        name: "sections",
        control: "text",
        description: "Heading, animation mode, and colors per section.",
      },
      {
        name: "stagger / duration",
        control: "text",
        description: "Per-character delay and travel time.",
      },
    ],
    assets: [],
    api: [
      {
        name: "sections",
        type: "SkewCharSection[]",
        default: "Three BLANK sections",
        description:
          "Heading plus a mode of load, enter, or scrub, and the section's background and text colors.",
      },
      {
        name: "stagger / duration",
        type: "number",
        default: "0.05 / 0.65",
        description:
          "Delay between characters within a line, and how long each takes to arrive.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "card-parting-reveal": {
    demoPath: "src/components/demos/card-parting-reveal.tsx",
    nuance: [
      {
        label: "Every row leaves differently",
        description:
          "Horizontal distance, vertical drift, and rotation are all indexed per row, so the three pairs fan away on distinct arcs instead of reading as one wall sliding apart.",
      },
      {
        label: "Transforms are written directly",
        description:
          "The scrub handler composes translate and rotate as a style string rather than tweening properties, so all three axes stay exactly in phase with scroll with no interpolation lag between them.",
      },
      {
        label: "The reveal plays both ways",
        description:
          "The centered block uses play reverse play reverse, so scrolling back up re-hides the copy and it replays cleanly rather than staying stuck open.",
      },
    ],
    editable: [
      {
        name: "lines / buttonLabel",
        control: "text",
        description: "The three revealed lines and the call to action.",
      },
    ],
    assets: cardPartingRevealAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "6 BLANK stills",
        description: "Consumed in pairs, one left and one right per row.",
      },
      {
        name: "heroImage / badgeImage",
        type: "string",
        default: "Blob-hosted marks",
        description:
          "The opening plate and the circular badge behind the rows.",
      },
      {
        name: "lines / buttonLabel / footerLink",
        type: "string[] / string",
        default: "BLANK copy",
        description: "Revealed copy and the closing link.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "image-explosion-footer": {
    demoPath: "src/components/demos/image-explosion-footer.tsx",
    nuance: [
      {
        label: "A real integrator, not a tween",
        description:
          "Gravity is added to velocity each frame and friction multiplies it, so the trajectory is computed rather than eased. Changing gravity or friction changes the physics, not just the timing.",
      },
      {
        label: "It re-arms, it does not replay",
        description:
          "The burst only becomes available again once every particle has fallen past the halfway mark, so scrolling away and back fires a genuinely new explosion with fresh random forces.",
      },
      {
        label: "Images are warmed before the trigger",
        description:
          "All fifteen are preloaded on mount, so the first frame of the burst is never a set of empty boxes waiting on the network.",
      },
    ],
    editable: [
      {
        name: "gravity / friction / verticalForce",
        control: "text",
        description: "The physics constants driving the burst.",
      },
      {
        name: "footerHeading / aboutCopy",
        control: "text",
        description: "Footer and section copy.",
      },
    ],
    assets: imageExplosionFooterAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "15 BLANK cards",
        description: "One particle per image, launched together.",
      },
      {
        name: "gravity / friction / horizontalForce / verticalForce / imageSize",
        type: "number",
        default: "0.25 / 0.99 / 20 / 15 / 150",
        description:
          "Per-frame downward acceleration, velocity decay, launch spread, launch strength, and particle width.",
      },
      {
        name: "heroImage / outroImage",
        type: "string",
        default: "Blob-hosted plates",
        description: "The full-bleed sections above the footer.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "pushup-card-stack": {
    demoPath: "src/components/demos/pushup-card-stack.tsx",
    nuance: [
      {
        label: "The image counter-zooms as the card shrinks",
        description:
          "The card scales to 0.5 while its photograph scales to 1.5 over the same window, so the picture holds roughly its apparent size while the frame retreats, which is what sells the card as sliding backwards rather than simply shrinking.",
      },
      {
        label: "Exit and entry share a timeline position",
        description:
          "All three tweens per step are placed at the same index, so the outgoing card leaves at exactly the rate the incoming one arrives and no gap can open between them.",
      },
      {
        label: "Pin length follows the card count",
        description:
          "The scroll distance is one viewport per transition, so adding a card lengthens the pin instead of compressing every step.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "text",
        description: "Card images and their corner tags.",
      },
      {
        name: "introHeading / outroHeading",
        control: "text",
        description: "The screens either side of the stack.",
      },
    ],
    assets: pushupCardStackAssetDocs,
    api: [
      {
        name: "cards",
        type: "PushupCard[]",
        default: "Five BLANK cards",
        description:
          "Tag and image per card. Pin length scales with how many are supplied.",
      },
      {
        name: "introHeading / outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "Copy on the screens around the stack.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "carousel-ring-gallery": {
    demoPath: "src/components/demos/carousel-ring-gallery.tsx",
    nuance: [
      {
        label: "Distance drives every property at once",
        description:
          "One falloff factor from pointer distance feeds flip angle, scale, and outward push together, so a card near the cursor is fully turned and displaced while its neighbours are partway through, producing a continuous wave rather than a hover state.",
      },
      {
        label: "Opening rotates before it zooms",
        description:
          "The clicked card's angle is solved to bring it to the bottom of the ring, normalised to the shorter way round, so the ring never spins the long way to reach the card you picked.",
      },
      {
        label: "The tilt is on the container, cards on themselves",
        description:
          "Pointer parallax rotates the wrapper on three axes while cards handle their own flip and offset, so the two effects compose instead of fighting for the same transform.",
      },
    ],
    editable: [
      {
        name: "collection",
        control: "text",
        description: "Card images and the title shown when opened.",
      },
      {
        name: "imageCount / radius",
        control: "text",
        description: "How many cards sit on the ring and how wide it is.",
      },
    ],
    assets: carouselRingGalleryAssetDocs,
    api: [
      {
        name: "collection",
        type: "RingGalleryItem[]",
        default: "20 BLANK stills",
        description:
          "Image and title per card. Cards cycle through the collection if imageCount exceeds its length.",
      },
      {
        name: "imageCount / radius",
        type: "number",
        default: "25 / 275",
        description: "Cards on the ring and the ring's radius in pixels.",
      },
    ],
  },
  "infinite-drag-canvas": {
    demoPath: "src/components/demos/infinite-drag-canvas.tsx",
    nuance: [
      {
        label: "The buffer leans into the throw",
        description:
          "The build window is offset 300px toward the direction of travel, so tiles exist before they are needed on the leading edge and are torn down behind, which is what keeps a hard fling from arriving on empty space.",
      },
      {
        label: "Rebuild is throttled two ways",
        description:
          "Tiles are only recomputed after 100px of movement or 120ms, whichever comes first, so a slow drag does not rebuild the grid every frame.",
      },
      {
        label: "Expand starts from the real box",
        description:
          "The clicked tile's screen rect is measured and the free copy is placed there before growing, so the plate appears to lift out of the grid rather than fading in at the middle.",
      },
    ],
    editable: [
      {
        name: "titles / images",
        control: "text",
        description: "Tile images and the title shown when one opens.",
      },
      {
        name: "itemWidth / itemHeight / itemGap",
        control: "text",
        description: "Tile size and grid spacing.",
      },
    ],
    assets: infiniteDragCanvasAssetDocs,
    api: [
      {
        name: "images / titles",
        type: "string[]",
        default: "20 BLANK stills and titles",
        description:
          "Tiles cycle through the image list by grid position, so the same picture recurs on a fixed lattice.",
      },
      {
        name: "itemWidth / itemHeight / itemGap / columns",
        type: "number",
        default: "120 / 160 / 150 / 4",
        description:
          "Tile box, spacing, and the column stride used to pick which image a cell gets.",
      },
    ],
  },
  "card-fan-landing-reveal": {
    demoPath: "src/components/demos/card-fan-landing-reveal.tsx",
    nuance: [
      {
        label: "The second hand starts where the first ended",
        description:
          "Outro cards are positioned at the first intro card's exact slot on the circle, face down and at a tenth scale, so the deal reads as the same hand being re-dealt rather than a new set appearing.",
      },
      {
        label: "Fan positions are measured, not fixed",
        description:
          "Final x positions are computed from the real frame width minus padding and card width, so the spread reaches the edges without overflowing at any size.",
      },
      {
        label: "Transform origins set the fan direction",
        description:
          "The two left cards pivot from their bottom-right corner and the two right ones from bottom-left, which is what makes the hand splay outward instead of sliding sideways.",
      },
    ],
    editable: [
      {
        name: "outroCards",
        control: "text",
        description: "The code and number printed on each fanned card.",
      },
      {
        name: "background",
        control: "color",
        description: "The page color behind the deal.",
      },
    ],
    assets: cardFanLandingRevealAssetDocs,
    api: [
      {
        name: "introImages",
        type: "string[]",
        default: "8 BLANK cards",
        description:
          "Faces of the cards that pop around the circle. Count drives the circle spacing.",
      },
      {
        name: "outroCards",
        type: "FanCard[]",
        default: "Five lettered cards",
        description:
          "Code and number on each fanned card. The first also carries an image on its back face.",
      },
      {
        name: "wordmark / background",
        type: "string",
        default: "BLANK / #6c9a8b",
        description: "Footer wordmark and page color.",
      },
    ],
  },
  "counter-word-preloader": {
    demoPath: "src/components/demos/counter-word-preloader.tsx",
    nuance: [
      {
        label: "One clock, four readouts",
        description:
          "Counter, word cycle, image cycle, and the frame's slide all run as three second tweens started at position zero, so they finish together without any of them knowing about the others.",
      },
      {
        label: "Cycles are rounded progress, not timers",
        description:
          "The word and image indexes are derived by rounding a tweened progress value, so they stay in step with the counter even if a frame is dropped, and reverse correctly if the timeline is scrubbed.",
      },
      {
        label: "The handoff freezes the box first",
        description:
          "Before expanding, the hero rows are locked to their measured heights and the frame is pinned at its current rect. Without that the layout would reflow the instant the frame leaves the flow and the growth would start from the wrong place.",
      },
    ],
    editable: [
      {
        name: "rotatingWords",
        control: "text",
        description: "Words cycled through during the load.",
      },
      {
        name: "headingRows",
        control: "text",
        description: "The three headline rows.",
      },
    ],
    assets: counterWordPreloaderAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "10 BLANK frames",
        description:
          "Flicked through during load. The one showing when the timeline ends becomes the page background.",
      },
      {
        name: "rotatingWords / headingRows / footerCopy",
        type: "string[] / [string, string, string] / string",
        default: "BLANK copy",
        description: "Preloader and hero copy.",
      },
      {
        name: "preloaderBackground",
        type: "string",
        default: "#272d2d",
        description: "Color of the loading curtain.",
      },
    ],
  },
  "shuffle-grid-preloader": {
    demoPath: "src/components/demos/shuffle-grid-preloader.tsx",
    nuance: [
      {
        label: "Shuffling is twenty scheduled swaps",
        description:
          "Rather than animating, twenty zero-duration tweens fire 150ms apart, each replacing all nine sources with a fresh random draw. The flicker is discrete by design, which is what makes it read as riffling rather than crossfading.",
      },
      {
        label: "The last round is rigged",
        description:
          "On the final cycle the center tile is forced back to the real hero image and pre-scaled to two, so the shuffle resolves on the intended picture and the zoom has room to counter-scale.",
      },
      {
        label: "The wordmark fills by moving its background",
        description:
          "Each line is a gradient clipped to text with a 200 percent tall background, so animating background-position walks the fill up through the letters instead of fading them.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "text",
        description: "Credits listed in the two loading columns.",
      },
      {
        name: "title / introCopy",
        control: "text",
        description: "Headline and the two intro lines.",
      },
    ],
    assets: shuffleGridPreloaderAssetDocs,
    api: [
      {
        name: "images / heroImage",
        type: "string[] / string",
        default: "35 BLANK stills",
        description:
          "The pool the shuffle draws from, and the picture the center tile resolves to.",
      },
      {
        name: "projects",
        type: "ShuffleProject[]",
        default: "16 BLANK credits",
        description: "Name, director, and location for the loading columns.",
      },
      {
        name: "wordmarkLines / title / introCopy",
        type: "[string, string] / string",
        default: "BLANK copy",
        description: "Loader wordmark and the hero copy revealed after it.",
      },
    ],
  },
  "logo-mask-zoom-scroll": {
    demoPath: "src/components/demos/logo-mask-zoom-scroll.tsx",
    nuance: [
      {
        label: "The mark is a hole, not a drawing",
        description:
          "The logo is subtracted from a full-bleed rect through an SVG mask. At 500x the hole is bigger than the frame so you see straight through it; shrinking the panel to 1x is what makes the mark appear, without ever animating the logo itself.",
      },
      {
        label: "Panel scale is exponential",
        description:
          "Scale runs as initial^(1-progress) rather than linearly, so the hole closes at a perceptually even rate instead of collapsing almost entirely in the first few percent.",
      },
      {
        label: "The mask fits itself to its box",
        description:
          "The path's real bounding box is measured with getBBox and fitted to the logo container, so any replacement path lands correctly sized and centered with no manual numbers.",
      },
      {
        label: "The headline is filled by a moving gradient",
        description:
          "Reveal copy is a two-stop gradient clipped to text whose stops are dragged upward, so the text fills from the bottom rather than fading in.",
      },
    ],
    editable: [
      {
        name: "logoPath",
        control: "text",
        description: "The SVG path punched through the panel.",
      },
      {
        name: "panelColor / revealColor",
        control: "color",
        description: "Panel fill and the gradient color of the reveal copy.",
      },
    ],
    assets: logoMaskZoomScrollAssetDocs,
    api: [
      {
        name: "logoPath",
        type: "string",
        default: "A neutral BLANK-safe mark",
        description:
          "Single SVG path used as the mask. Its bounding box is measured and fitted automatically, so any path works without manual sizing.",
      },
      {
        name: "backgroundImage / foregroundImage / logoImage",
        type: "string",
        default: "Blob-hosted layers",
        description:
          "Back plate, cut-out front layer that parallaxes over it, and the small mark shown before the scroll starts.",
      },
      {
        name: "panelColor / revealColor",
        type: "string",
        default: "#111117 / #e66461",
        description: "Panel fill and the reveal gradient color.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "frame-sequence-hero": {
    demoPath: "src/components/demos/frame-sequence-hero.tsx",
    nuance: [
      {
        label: "Nothing runs until every frame is decoded",
        description:
          "A countdown across all 207 loads gates the ScrollTrigger, and errors decrement it too. Scrubbing therefore cannot outrun the network and land on an empty canvas mid-sequence.",
      },
      {
        label: "Cover fit is recomputed per draw",
        description:
          "Each render compares the frame's aspect to the canvas aspect and derives its own draw rect, so the sequence fills any container shape without stretching and needs no CSS object-fit.",
      },
      {
        label: "Frames finish before the pin does",
        description:
          "Frame index maps to the first 90 percent of the pin, leaving the last stretch for the product shot to arrive after the footage has already settled.",
      },
    ],
    editable: [
      {
        name: "heading",
        control: "text",
        description: "The hero headline that recedes on Z.",
      },
      {
        name: "frameCount / frameBase",
        control: "text",
        description: "How many frames to load and where they live.",
      },
    ],
    assets: frameSequenceHeroAssetDocs,
    api: [
      {
        name: "frameCount / frameBase",
        type: "number / string",
        default: "207 / Blob asset base",
        description:
          "Sequence length and the base URL. Frames are addressed as frame_0001.jpg through frame_0207.jpg.",
      },
      {
        name: "productImage / clientLogos / logoImage",
        type: "string / string[]",
        default: "Blob-hosted assets",
        description: "The dashboard shot, trust logos, and the nav mark.",
      },
      {
        name: "heading / brand / navLinks / outroHeading",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Navigation and editorial copy.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "snap-parallax-projects": {
    demoPath: "src/components/demos/snap-parallax-projects.tsx",
    nuance: [
      {
        label: "Snap waits for genuine stillness",
        description:
          "A snap only starts 100ms after the last input and never while dragging, so it feels like the list settling rather than fighting the gesture. Any new input cancels it immediately.",
      },
      {
        label: "Parallax reads list space, not screen space",
        description:
          "Each image offsets from its panel index times panel height, which is stable across recycling, so a panel that was destroyed and rebuilt returns with the correct offset instead of jumping.",
      },
      {
        label: "Build and destroy have different radii",
        description:
          "Panels are created within fifteen of center but only destroyed past fifty, so normal scrolling never crosses the destroy boundary and nothing is rebuilt on every frame.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "text",
        description: "Titles, images, and which side the image sits on.",
      },
    ],
    assets: snapParallaxProjectsAssetDocs,
    api: [
      {
        name: "projects",
        type: "SnapProject[]",
        default: "Six BLANK projects",
        description:
          "Title, image, and isAlternate, which swaps the image to the left half.",
      },
      {
        name: "scrollSpeed / lerpFactor / snapDuration",
        type: "number",
        default: "0.75 / 0.05 / 500",
        description:
          "Wheel multiplier, easing factor, and how long the settle to the nearest panel takes.",
      },
    ],
  },
  "triangle-fill-scroll": {
    demoPath: "src/components/demos/triangle-fill-scroll.tsx",
    nuance: [
      {
        label: "The order is shuffled once, at build",
        description:
          "Every cell gets a permanent random position in the fill sequence, so the flood pattern is arbitrary but stable, and scrubbing backwards empties in exactly the reverse order.",
      },
      {
        label: "Two canvases sandwich the content",
        description:
          "Outlines render below the cards and fills above them, so a triangle appears to pass in front of the cards at the moment it fills, which is what makes the grid swallow them.",
      },
      {
        label: "Each triangle eases independently",
        description:
          "Cells lerp toward their target scale at 0.15 per frame rather than jumping, and the redraw loop only continues while at least one is still moving.",
      },
    ],
    editable: [
      {
        name: "accent",
        control: "color",
        description: "Fill color of the triangles and the accent type.",
      },
      {
        name: "triangleSize",
        control: "text",
        description: "Cell size in pixels, which sets the grid density.",
      },
    ],
    assets: triangleFillScrollAssetDocs,
    api: [
      {
        name: "cards",
        type: "TriangleCard[]",
        default: "Three BLANK products",
        description: "Title, code, and image for each card in the strip.",
      },
      {
        name: "accent / triangleSize",
        type: "string / number",
        default: "#ff6b00 / 150",
        description: "Fill color and cell size, which drives grid density.",
      },
      {
        name: "backgroundImage",
        type: "string",
        default: "Blob-hosted scene",
        description: "The photograph behind the grid.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "nested-mask-banner": {
    demoPath: "src/components/demos/nested-mask-banner.tsx",
    nuance: [
      {
        label: "Rings are the same image, offset in scale",
        description:
          "Every masked layer starts 0.2 smaller than the one above it. Since they all share one mask shape and one photograph, the stack reads as nested apertures rather than separate pictures.",
      },
      {
        label: "The rings converge before the container finishes",
        description:
          "Layer scales close on 1.0 over the first 90 percent of the pin while the container is still growing, so the rings merge into a single clean image just before the banner reaches full size.",
      },
      {
        label: "The intro words part with the opening",
        description:
          "Two words slide to opposite edges over the same 90 percent window, so they clear the frame exactly as it becomes readable.",
      },
    ],
    editable: [
      {
        name: "bannerHeading / introWords",
        control: "text",
        description: "The masked headline and the two parting words.",
      },
      {
        name: "maskLayers",
        control: "text",
        description: "How many nested rings the telescope has.",
      },
    ],
    assets: nestedMaskBannerAssetDocs,
    api: [
      {
        name: "bannerImage / maskImage",
        type: "string",
        default: "Blob-hosted assets",
        description:
          "The photograph repeated per ring, and the shape masking each one.",
      },
      {
        name: "maskLayers",
        type: "number",
        default: "6",
        description:
          "Number of masked rings above the base image. Each starts 0.2 smaller than the last.",
      },
      {
        name: "heroHeading / bannerHeading / introWords / outroHeading",
        type: "string / [string, string]",
        default: "BLANK copy",
        description: "Copy around and inside the banner.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "pinned-scale-mosaic": {
    demoPath: "src/components/demos/pinned-scale-mosaic.tsx",
    nuance: [
      {
        label: "Two triggers per row, plus a guard",
        description:
          "One scales in, one pins and scales out, and a third restores full scale when a row is re-entered without its exit having started. Without that guard, scrubbing back leaves rows stuck at zero.",
      },
      {
        label: "pinSpacing off is what stacks the rows",
        description:
          "Because the pinned row reserves no space, the following row slides up over it while it shrinks, so rows overlap instead of queueing.",
      },
      {
        label: "Corner origins open the row outward",
        description:
          "Images scale about their outer corner, alternating left and right, so a row unfolds from the edges of the grid rather than blooming from its middle.",
      },
    ],
    editable: [
      {
        name: "rows",
        control: "text",
        description: "The grid layout: four cells per row, null for a gap.",
      },
    ],
    assets: pinnedScaleMosaicAssetDocs,
    api: [
      {
        name: "rows",
        type: "MosaicCell[][]",
        default: "Ten sparse rows",
        description:
          "Four cells per row. Each cell is an image plus a scale origin, or null for an empty slot.",
      },
      {
        name: "introHeading / introLabel / outroLabel",
        type: "string",
        default: "BLANK copy",
        description: "The screens either side of the grid.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "curved-letter-path-scroll": {
    demoPath: "src/components/demos/curved-letter-path-scroll.tsx",
    nuance: [
      {
        label: "DOM text with WebGL perspective",
        description:
          "Letters stay real DOM nodes but their positions come from projecting curve points through the Three camera, so they pick up genuine 3D perspective while remaining selectable, crisp, and font-hinted.",
      },
      {
        label: "Wrapping snaps instead of easing",
        description:
          "A letter whose target jumps more than seventy percent of the frame is teleported rather than lerped, which is what stops a wrapped letter from streaking back across the screen.",
      },
      {
        label: "The card strip is one canvas texture",
        description:
          "All cards are painted into a single 4096 wide offscreen canvas that feeds one plane, so the whole strip costs one draw call and can be scrolled by redrawing at an offset.",
      },
      {
        label: "The curve comes from displaced vertices",
        description:
          "The plane's Z is displaced on a parabola across its width, so the strip bends away at both ends and the cards appear to wrap around a cylinder.",
      },
    ],
    editable: [
      {
        name: "letters",
        control: "text",
        description: "One character per travelling row.",
      },
      {
        name: "accent",
        control: "color",
        description: "Letter color, dot grid color, and page color.",
      },
    ],
    assets: curvedLetterPathScrollAssetDocs,
    api: [
      {
        name: "letters",
        type: "string[]",
        default: "W, O, R, K",
        description:
          "One character per curve. Each row repeats its character fifteen times along the path.",
      },
      {
        name: "images",
        type: "string[]",
        default: "Seven Blob-hosted cards",
        description: "Cards painted into the curved strip's texture atlas.",
      },
      {
        name: "accent",
        type: "string",
        default: "#f40c3f",
        description: "Letter, dot grid, and surrounding page color.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "flip-marquee-horizontal": {
    demoPath: "src/components/demos/flip-marquee-horizontal.tsx",
    nuance: [
      {
        label: "Flip carries the frame across sections",
        description:
          "The marquee image is cloned into a free element and Flip records its state in the tilted strip, so the growth to full-bleed is computed from its real position rather than animated between two guessed transforms.",
      },
      {
        label: "The Flip runs on scroll, not on time",
        description:
          "The Flip timeline is created paused and its progress is driven directly by the first fifth of the pin, so the plate opens exactly in step with the scrollbar and reverses cleanly.",
      },
      {
        label: "Plate and track move at different rates",
        description:
          "The horizontal wrapper travels 66.67 percent while the plate travels three times its slide distance, so the plate visibly slides out from behind the slides instead of moving with them.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "The horizontal panel copy and images.",
      },
      {
        name: "light / dark",
        control: "color",
        description: "Page color before and after the pin darkens it.",
      },
    ],
    assets: flipMarqueeHorizontalAssetDocs,
    api: [
      {
        name: "marqueeImages / pinnedIndex",
        type: "string[] / number",
        default: "13 images, index 6",
        description:
          "The tilted strip's frames, and which one is cloned and flipped into the next section.",
      },
      {
        name: "slides",
        type: "FlipMarqueeSlide[]",
        default: "Two BLANK panels",
        description: "Copy and image for each horizontal panel.",
      },
      {
        name: "light / dark",
        type: "string",
        default: "#edf1e8 / #101010",
        description: "Page colors interpolated across the start of the pin.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "clip-reveal-services": {
    demoPath: "src/components/demos/clip-reveal-services.tsx",
    nuance: [
      {
        label: "Two copies of the same text, one clipped",
        description:
          "The bright text is a pseudo element fed from a data attribute and clipped with inset from the bottom, so it overwrites the grey original in place. No per-word splitting, so line breaks can never disagree between the layers.",
      },
      {
        label: "The masthead assembles then shrinks",
        description:
          "The first half of the pin closes the outer two lines onto the middle one, the second half scales all three down together, so stacking and shrinking never overlap.",
      },
      {
        label: "pinSpacing is off on purpose",
        description:
          "The services section pins without reserving space, which is what lets the copy below slide up over it on its own large top margin.",
      },
    ],
    editable: [
      {
        name: "aboutCopy / servicesCopy",
        control: "text",
        description: "The two clip-revealed paragraphs.",
      },
    ],
    assets: clipRevealServicesAssetDocs,
    api: [
      {
        name: "aboutCopy / servicesCopy",
        type: "string",
        default: "BLANK copy",
        description:
          "Paragraphs revealed by the clip. Both are mirrored into a pseudo element automatically.",
      },
      {
        name: "heroImage / outroImage / headerImage",
        type: "string",
        default: "Blob-hosted assets",
        description:
          "Opening and closing portraits, and the lockup repeated three times as the masthead.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "swing-in-work-grid": {
    demoPath: "src/components/demos/swing-in-work-grid.tsx",
    nuance: [
      {
        label: "Mirrored rotation makes it a hinge",
        description:
          "The left card starts at minus sixty degrees and the right at plus sixty, both about their own centers, so the pair reads as two panels closing rather than two cards rotating the same way.",
      },
      {
        label: "Fires once per row, not scrubbed",
        description:
          "Each row triggers a one second power4.out on entry instead of tracking scroll, so the landing keeps its ease no matter how fast the reader is moving.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "text",
        description: "Project names, descriptions, images, and routes.",
      },
    ],
    assets: swingInWorkGridAssetDocs,
    api: [
      {
        name: "projects",
        type: "WorkProject[]",
        default: "Ten BLANK projects",
        description:
          "Name, description, image, and route. Projects are paired into rows automatically.",
      },
      {
        name: "heading / footerLeft / footerRight",
        type: "string",
        default: "BLANK copy",
        description: "Page heading and the two footer lines.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "sticky-parallax-slides": {
    demoPath: "src/components/demos/sticky-parallax-slides.tsx",
    nuance: [
      {
        label: "Only the crossing pair is offset",
        description:
          "Parallax is applied to the outgoing and incoming slide only, computed from their relative progress. Every other image sits at zero, so nothing drifts out of place while off screen.",
      },
      {
        label: "Titles are observed, not calculated",
        description:
          "An IntersectionObserver rooted on the slider switches captions at the quarter visible mark, and on reverse it explicitly restores the previous slide's title, so scrubbing backwards does not leave the caption blank.",
      },
      {
        label: "The zoom is the parallax budget",
        description:
          "Images sit at 1.35 scale so a quarter-width push never exposes an edge. Lower the scale and the offset has to come down with it.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "Panel images and their two-line titles.",
      },
    ],
    assets: stickyParallaxSlidesAssetDocs,
    api: [
      {
        name: "slides",
        type: "StickyParallaxSlide[]",
        default: "Five BLANK interiors",
        description:
          "Image plus a two line title. Track width scales to the slide count automatically.",
      },
      {
        name: "outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "The closing screen after the pin releases.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "masked-spotlight-scroll": {
    demoPath: "src/components/demos/masked-spotlight-scroll.tsx",
    nuance: [
      {
        label: "The image counter-scales against the mask",
        description:
          "As the mask grows to 450 percent the photograph shrinks from 1.5 to 1. Without the counter-scale the picture would appear to be dragged open by the aperture instead of resolving inside it.",
      },
      {
        label: "Three phases share one pin",
        description:
          "The wall drifts across the first half, the mask opens between 25 and 75 percent, and the headline fills between 75 and 95, so the phases overlap deliberately rather than running back to back.",
      },
      {
        label: "The wall is deliberately sparse",
        description:
          "Only some cells in each four-wide row carry an image. The empty slots are what give the drifting wall its scattered rhythm rather than reading as a solid grid.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "text",
        description: "The nine stills scattered through the drifting wall.",
      },
      {
        name: "maskHeading / spotlightHeading",
        control: "text",
        description: "Headlines revealed through and after the mask.",
      },
    ],
    assets: maskedSpotlightScrollAssetDocs,
    api: [
      {
        name: "images / bannerImage / maskImage",
        type: "string[] / string",
        default: "Blob-hosted assets",
        description:
          "Wall stills, the photograph revealed through the aperture, and the SVG shape used as the mask.",
      },
      {
        name: "introHeading / spotlightHeading / maskHeading / outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "Copy for each phase of the sequence.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "deal-stack-cards-scroll": {
    demoPath: "src/components/demos/deal-stack-cards-scroll.tsx",
    nuance: [
      {
        label: "Arrival and departure are separate clocks",
        description:
          "A card rises across its own slice of the pin, but only begins leaving once that slice is complete, measured against the remaining scroll. The two motions never blend into a single drift.",
      },
      {
        label: "Earlier cards travel further",
        description:
          "Departure distance is scaled by 1 minus fifteen percent per index, so the first card ends up furthest off screen and the pile fans diagonally rather than exiting as one block.",
      },
      {
        label: "Tilts are fixed, not random",
        description:
          "Each card keeps a hand-picked rotation for its whole life, so the stack always settles into the same deliberate arrangement.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "text",
        description: "Card images and their reference labels.",
      },
      {
        name: "rotations",
        control: "text",
        description: "Per-card resting tilt in degrees.",
      },
    ],
    assets: dealStackCardsScrollAssetDocs,
    api: [
      {
        name: "cards",
        type: "DealStackCard[]",
        default: "Six BLANK cards",
        description:
          "Image and label per card. The pin length and per-card slice both follow the array length.",
      },
      {
        name: "rotations",
        type: "number[]",
        default: "[-12, 10, -5, 5, -5, -2]",
        description: "Resting tilt for each card, applied on arrival.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "split-column-infinite-slider": {
    demoPath: "src/components/demos/split-column-infinite-slider.tsx",
    nuance: [
      {
        label: "The reveal overshoots by half a percent",
        description:
          "Clip paths grow to 100.5 percent rather than 100, so consecutive slides always overlap by a sliver and no hairline of background can appear between them at any scroll position.",
      },
      {
        label: "Zoom exists to hide the drift",
        description:
          "Images are held at 1.25 scale purely so the counter-drift against the reveal never pulls an edge into frame. The drift direction is inverted per column, which is what makes the two sides read as moving apart.",
      },
      {
        label: "Copy holds, then leaves on a smoothstep",
        description:
          "Titles stay pinned dead center through a ten percent window either side of the slide's midpoint, then depart on a t*t*(3-2t) curve, so the type feels held rather than continuously sliding.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "Title, tags, accent, and the two column images.",
      },
    ],
    assets: splitColumnInfiniteSliderAssetDocs,
    api: [
      {
        name: "slides",
        type: "SplitSlide[]",
        default: "Five BLANK projects",
        description:
          "Title, tag lines, accent color, link, and a separate image per column.",
      },
      {
        name: "scrollSensitivity / smoothness / imageZoom",
        type: "number",
        default: "1200 / 0.05 / 1.25",
        description:
          "Wheel divisor, lerp factor toward the target, and the image scale that hides the parallax drift.",
      },
    ],
  },
  "dial-product-slider": {
    demoPath: "src/components/demos/dial-product-slider.tsx",
    nuance: [
      {
        label: "The dial turns inside out",
        description:
          "Open and close are one gesture: the outer ring's clip circle shrinks to zero while the inner disc's grows to fill, so the control reads as inverting rather than two elements swapping.",
      },
      {
        label: "A buffer either side, not a clone set",
        description:
          "Five items are kept on each side of center and the far one is destroyed as a new one is built on the opposite end, so the reel loops through any length of catalogue at constant DOM cost.",
      },
      {
        label: "Stepping is locked while the card is open",
        description:
          "Both arrows disable during the transition and for as long as the detail card is up, so the reel underneath can never advance out from behind the product being read.",
      },
    ],
    editable: [
      {
        name: "products",
        control: "text",
        description: "Name, image, price, tag, and link per product.",
      },
    ],
    assets: dialProductSliderAssetDocs,
    api: [
      {
        name: "products",
        type: "DialProduct[]",
        default: "Ten BLANK products",
        description:
          "Each product's cutout, name, tag, price, and detail link. The reel loops through however many are supplied.",
      },
      {
        name: "brand / menuLabel / detailLabel",
        type: "string",
        default: "BLANK copy",
        description: "Nav label, dial caption, and the detail card button.",
      },
    ],
  },
  "parallax-drag-rail": {
    demoPath: "src/components/demos/parallax-drag-rail.tsx",
    nuance: [
      {
        label: "The jump happens in the safe band",
        description:
          "Six sequences are laid out and the track is teleported one sequence back whenever it leaves the middle band. Because the jump distance equals exactly one sequence, the visible arrangement is identical before and after and the seam is invisible.",
      },
      {
        label: "Parallax is per card, from screen position",
        description:
          "Each image is offset by a quarter of its distance from the rail's center, read live from its bounding box, so the effect is correct no matter where the track has been teleported to.",
      },
      {
        label: "Captions gate on real stillness",
        description:
          "A caption only fades in when velocity drops below 0.1 and no input has landed for 200ms, exposed as a CSS variable, so hover labels never flicker during a fling.",
      },
      {
        label: "A drag is not a click",
        description:
          "Movement past five pixels marks the gesture as a drag and suppresses the navigation on release, so throwing the rail never opens a project by accident.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "Project titles, images, and links.",
      },
      {
        name: "scrollSpeed / lerpFactor",
        control: "text",
        description: "Wheel multiplier and how hard the rail eases.",
      },
    ],
    assets: parallaxDragRailAssetDocs,
    api: [
      {
        name: "slides",
        type: "RailSlide[]",
        default: "Eight BLANK projects",
        description: "Title, image, and link per card.",
      },
      {
        name: "scrollSpeed / lerpFactor / maxVelocity",
        type: "number",
        default: "1.75 / 0.05 / 150",
        description:
          "Wheel multiplier, easing factor, and the per-event clamp that stops a trackpad flick from teleporting the rail.",
      },
    ],
  },
  "endless-side-story": {
    demoPath: "src/components/demos/endless-side-story.tsx",
    nuance: [
      {
        label: "Real sections, cloned in place",
        description:
          "The markup is written once as ordinary sections, then measured and cloned two sequences either side at runtime, so the content stays authorable as normal HTML rather than a data array.",
      },
      {
        label: "The progress bar snaps across the wrap",
        description:
          "When the reading jumps from high to low percent, the bar's eased value is force-set instead of lerped, so it never animates backwards across the entire width on every loop.",
      },
      {
        label: "The loop guard sits at the halfway mark",
        description:
          "The teleport fires at half a sequence past the buffer rather than at the edge, leaving a full sequence of slack in both directions so a fast fling cannot outrun the reset.",
      },
    ],
    editable: [
      {
        name: "storyHeadings / aboutParagraphs",
        control: "text",
        description: "The editorial copy across the sideways run.",
      },
    ],
    assets: endlessSideStoryAssetDocs,
    api: [
      {
        name: "heroImage / aboutImage / bannerImage / conceptImage",
        type: "string",
        default: "Blob-hosted images",
        description: "The four full-height photographic panels.",
      },
      {
        name: "introHeading / headerHeading / aboutHeading / storyHeadings / outroHeading",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Copy for each panel in the sequence.",
      },
      {
        name: "smoothFactor",
        type: "number",
        default: "0.05",
        description: "How hard the track eases toward the scroll target.",
      },
    ],
  },
  "marquee-carousel-scroll": {
    demoPath: "src/components/demos/marquee-carousel-scroll.tsx",
    nuance: [
      {
        label: "Direction changes the shape",
        description:
          "Forward and backward build different clip path polygons, so a slide entering upward wedges from the bottom edge and one entering downward wedges from the top. The transition is never just played in reverse.",
      },
      {
        label: "Image and copy travel at different rates",
        description:
          "Inside a slide the image moves 25 percent while the copy moves 100 percent, so the two layers visibly separate during the cross rather than sliding as one block.",
      },
      {
        label: "Titles are tripled for a seamless marquee",
        description:
          "Each headline is repeated three times and translated exactly one third, so the loop point lands on an identical glyph run and the scroll never appears to jump.",
      },
      {
        label: "Transitions are not re-entrant",
        description:
          "While a slide is animating, scroll progress is recorded but ignored, so scrubbing quickly through the pin cannot start a second transition on top of a running one.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "Tag, marquee headline, and image per project.",
      },
    ],
    assets: marqueeCarouselScrollAssetDocs,
    api: [
      {
        name: "slides",
        type: "MarqueeSlide[]",
        default: "Five BLANK projects",
        description:
          "Tag, marquee headline, and image. Pin length and the progress bar count both scale to how many are supplied.",
      },
      {
        name: "brand / navItems / introCopy / outroCopy",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Navigation and the screens either side of the carousel.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "throw-away-work-slider": {
    demoPath: "src/components/demos/throw-away-work-slider.tsx",
    nuance: [
      {
        label: "The exit is a throw, not a fade",
        description:
          "The outgoing slide scales to a quarter, rotates thirty degrees and travels two full frames off screen over two seconds, so it reads as discarded rather than dissolved.",
      },
      {
        label: "The incoming slide is built 750ms late",
        description:
          "Construction is deliberately delayed into the middle of the exit, so the new slide is never on screen alongside the old one at full size and the clip path opening is the first thing you see of it.",
      },
      {
        label: "Copy is split per slide, not once",
        description:
          "Words and lines are re-split on every freshly built slide, so line breaks are measured against the actual box each time and masks always match the real wrap.",
      },
      {
        label: "One slide per second, hard limit",
        description:
          "A timestamp gate plus two flags mean a fast wheel or a flick cannot queue transitions, which is what keeps the two second exit from ever overlapping itself.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "text",
        description: "Title, description, tags, link, and image per project.",
      },
    ],
    assets: throwAwayWorkSliderAssetDocs,
    api: [
      {
        name: "slides",
        type: "WorkSlide[]",
        default: "Four BLANK projects",
        description:
          "Title, description, tag list, link, and full-bleed image. The index readout and wrap-around both follow the array length.",
      },
      {
        name: "linkLabel / tagsLabel",
        type: "string",
        default: "View Project / Tags",
        description: "The per-slide link text and the tag column heading.",
      },
    ],
  },
  "sliding-index-menu": {
    demoPath: "src/components/demos/sliding-index-menu.tsx",
    nuance: [
      {
        label: "The rail is longer than the frame on purpose",
        description:
          "The link row is sized to its content and can overflow the panel. Pointer position maps to how far it slides, using only the middle half of the frame as the sensitive range, so small movements near the edges do nothing and the far links stay reachable.",
      },
      {
        label: "The highlighter eases two properties at once",
        description:
          "Position and width are both lerped toward the hovered link's box every frame, so the bar stretches and travels as one motion instead of snapping to each new word.",
      },
      {
        label: "Overflow is only unlocked once open",
        description:
          "Links keep overflow hidden through the wipe so they cannot poke outside the panel mid-animation, then switch to visible on completion, which is what lets the hover roll push characters past their own box.",
      },
    ],
    editable: [
      {
        name: "links",
        control: "text",
        description: "The oversized index entries.",
      },
      {
        name: "leftColumn / rightColumn",
        control: "text",
        description:
          "The two info columns. An empty string renders as a spacer line.",
      },
      {
        name: "accent",
        control: "color",
        description: "The highlighter bar color.",
      },
    ],
    assets: slidingIndexMenuAssetDocs,
    api: [
      {
        name: "links",
        type: "string[]",
        default: "Index, Persona, Biography, Work, Journal",
        description:
          "Index entries. Each renders twice so the hover roll has a copy to swap in.",
      },
      {
        name: "leftColumn / rightColumn",
        type: "string[]",
        default: "BLANK contact and credits",
        description:
          "Info columns beside the plate. Empty strings become spacing breaks.",
      },
      {
        name: "menuImage",
        type: "string",
        default: "Blob-hosted plate",
        description: "The centered image that scales up when the menu opens.",
      },
      {
        name: "accent",
        type: "string",
        default: "#fca311",
        description: "Highlighter bar color.",
      },
    ],
  },
  "elastic-curtain-menu": {
    demoPath: "src/components/demos/elastic-curtain-menu.tsx",
    nuance: [
      {
        label: "The panel is one path, not a box",
        description:
          "The whole sheet is a single quadratic path whose control point is dragged past the end points, so the leading edge sags in the middle. Two chained tweens, power4.in then power4.out, make it accelerate into the sag and settle out of it.",
      },
      {
        label: "Closing rebuilds the path from the other anchor",
        description:
          "Before the close runs, the path is reset to a bottom-anchored variant. The sag then lifts upward instead of replaying the open in reverse, so entry and exit read as different motions.",
      },
      {
        label: "Links arrive from far off the right",
        description:
          "Characters start at 750 percent x and return on elastic.out with a 0.01 stagger, so the word assembles as a fast ripple that overshoots and settles rather than a uniform slide.",
      },
    ],
    editable: [
      {
        name: "links",
        control: "text",
        description: "The menu link labels.",
      },
      {
        name: "panelColor / accent",
        control: "color",
        description: "Curtain fill and the contact label color.",
      },
    ],
    assets: elasticCurtainMenuAssetDocs,
    api: [
      {
        name: "links",
        type: "string[]",
        default: "work, services, about, insights, careers, contact",
        description: "Menu entries, split into characters for the fly-in.",
      },
      {
        name: "contactLabel / contactLines / addressLines",
        type: "string / string[]",
        default: "BLANK contact block",
        description: "The information column beside the links.",
      },
      {
        name: "backgroundImage",
        type: "string",
        default: "Blob-hosted hero",
        description: "The page image the curtain drops over.",
      },
      {
        name: "panelColor / accent",
        type: "string",
        default: "#f0eeee / #a374ff",
        description: "Curtain fill and contact label color.",
      },
    ],
  },
  "tilt-away-menu": {
    demoPath: "src/components/demos/tilt-away-menu.tsx",
    nuance: [
      {
        label: "The page leaves, the panel arrives",
        description:
          "Both moves run on the same 1.25s power4.inOut, but from opposite corners: the hero uses a right-top transform origin and exits rotated and scaled, the panel uses left-bottom and comes back from rotated, oversized, quarter opacity.",
      },
      {
        label: "The clip path overshoots the frame",
        description:
          "The open state clips to 175 percent on one side, so the panel edge lands beyond the bottom of the box and the sheet reads as skewed rather than square.",
      },
      {
        label: "Previews stack instead of swapping",
        description:
          "Hovering a link appends a new image at scale 1.25 and 10 degrees and eases it flat over the previous one, so there is never an empty frame. Only the last three stay in the DOM.",
      },
    ],
    editable: [
      {
        name: "links",
        control: "text",
        description: "Menu labels and the preview image each one shows.",
      },
      {
        name: "heroHeading",
        control: "text",
        description: "The headline on the page behind the menu.",
      },
    ],
    assets: tiltAwayMenuAssetDocs,
    api: [
      {
        name: "links",
        type: "TiltAwayMenuLink[]",
        default: "Visions, Core, Signals, Connect",
        description: "Label plus the preview image swapped in on hover.",
      },
      {
        name: "heroImage / heroHeading",
        type: "string",
        default: "Blob-hosted hero",
        description: "The page behind the menu.",
      },
      {
        name: "socials / footerPrimary / footerLinks",
        type: "string[] / string",
        default: "Behance, Dribbble, LinkedIn, Instagram",
        description: "Secondary link groups in the panel.",
      },
    ],
  },
  "push-down-overlay-menu": {
    demoPath: "src/components/demos/push-down-overlay-menu.tsx",
    nuance: [
      {
        label: "Page and panel move as one sheet",
        description:
          "The document is driven down exactly one viewport while the panel content slides from minus fifty percent to zero, so the two travel together and the seam between them never separates.",
      },
      {
        label: "Copy staggers backwards",
        description:
          "Lines animate with a negative stagger, so the last line of each column starts first. Combined with a 2s duration against the 1s panel wipe, the text is still arriving after the panel has landed.",
      },
      {
        label: "Scrolling is stopped, not hidden",
        description:
          "Lenis is halted for the duration the menu is open and restarted in the close callback, so the pushed page cannot be scrolled out from under the panel.",
      },
    ],
    editable: [
      {
        name: "links / tags",
        control: "text",
        description: "The two menu columns.",
      },
      {
        name: "heroHeading / outroHeading",
        control: "text",
        description: "Headlines on the pushed page.",
      },
    ],
    assets: pushDownOverlayMenuAssetDocs,
    api: [
      {
        name: "links / tags",
        type: "string[]",
        default: "BLANK menu columns",
        description:
          "Primary navigation and the secondary discipline list beside it.",
      },
      {
        name: "location / contactLines",
        type: "string / string[]",
        default: "BLANK contact block",
        description: "The panel footer.",
      },
      {
        name: "bannerImage / menuImage",
        type: "string",
        default: "Blob-hosted images",
        description: "Page banner and the dimmed plate inside the panel.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "dealt-team-cards": {
    demoPath: "src/components/demos/dealt-team-cards.tsx",
    nuance: [
      {
        label: "Two triggers, two jobs",
        description:
          "An unpinned trigger raises the dashed frames on approach, then a separate pinned trigger three viewports long deals the real cards in. Splitting them means the frames finish arriving before any card starts flying.",
      },
      {
        label: "Each card has its own window",
        description:
          "Slide-in and scale-up run on staggered sub-ranges of the pinned progress rather than a shared tween, so the third card is still rotating flat while the first has already reached full size.",
      },
      {
        label: "Narrow layouts opt out entirely",
        description:
          "Below 1000px the triggers are killed and every animated property is cleared, so the section falls back to a plain stacked column instead of a squeezed version of the deal.",
      },
    ],
    editable: [
      {
        name: "members",
        control: "text",
        description: "Names, roles, and portraits.",
      },
      {
        name: "heroHeading / outroHeading",
        control: "text",
        description: "The lead-in and closing screens.",
      },
    ],
    assets: dealtTeamCardsAssetDocs,
    api: [
      {
        name: "members",
        type: "TeamMember[]",
        default: "Three BLANK team members",
        description:
          "First name, last name, role, and portrait. The giant placeholder initial is taken from the first name.",
      },
      {
        name: "heroHeading / outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "Copy on the screens around the team section.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "wedge-clip-work-scroll": {
    demoPath: "src/components/demos/wedge-clip-work-scroll.tsx",
    nuance: [
      {
        label: "Open and close are separate triggers",
        description:
          "One trigger runs while the panel enters and clips the wedge out to a full rectangle, a second runs as it leaves and folds the bottom edge back in, so the exit shape is not just the entrance played backwards.",
      },
      {
        label: "Characters get pixel windows, not percentages",
        description:
          "Each character's trigger is offset by 25px from the previous one, so the title types out at a rate tied to actual scroll distance and stays consistent no matter how long the name is.",
      },
      {
        label: "Panels are one and a half viewports",
        description:
          "At 150svh each project has room to open, hold, and close without a neighbouring panel's triggers overlapping it.",
      },
    ],
    editable: [
      {
        name: "items",
        control: "text",
        description: "Project names and their images.",
      },
      {
        name: "heroHeading / outroHeading",
        control: "text",
        description: "The lead-in and closing screens.",
      },
    ],
    assets: wedgeClipWorkScrollAssetDocs,
    api: [
      {
        name: "items",
        type: "WedgeWorkItem[]",
        default: "Five BLANK projects",
        description: "Project name and image for each full-height panel.",
      },
      {
        name: "heroHeading / outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "Copy on the screens around the index.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "starfield-warp-scroll": {
    demoPath: "src/components/demos/starfield-warp-scroll.tsx",
    nuance: [
      {
        label: "Speed is a curve, not the raw progress",
        description:
          "Scroll progress is first lifted off a resting fill of 0.25 so the field is already drifting at rest, then raised to a fractional power, so the warp accelerates late instead of tracking the scrollbar linearly.",
      },
      {
        label: "Streaks are drawn, never simulated",
        description:
          "Each star keeps only a direction, a phase offset, and a length. Its head position is derived from scroll progress modulo one, so the field loops seamlessly and nothing needs a per-frame physics step.",
      },
      {
        label: "Headline handoff is measured in words",
        description:
          "The timeline length is computed from the total word count across all three headlines, so adding or shortening copy redistributes the fades automatically and the scroll distance stays the same.",
      },
    ],
    editable: [
      {
        name: "headings",
        control: "text",
        description: "The three headlines that hand off across the warp.",
      },
      {
        name: "palette",
        control: "color",
        description: "Streak colors, sampled with per-color weights.",
      },
      {
        name: "starCount",
        control: "text",
        description: "How many streaks are drawn each frame.",
      },
    ],
    assets: [],
    api: [
      {
        name: "introHeading / headings / outroHeading",
        type: "string / [string, string, string] / string",
        default: "BLANK copy",
        description:
          "Copy for the lead-in section, the three warp headlines, and the closing section.",
      },
      {
        name: "starCount",
        type: "number",
        default: "1000",
        description: "Number of streaks in the field.",
      },
      {
        name: "palette / paletteWeights",
        type: "string[] / number[]",
        default: "6 cyan-to-pink hexes",
        description:
          "Streak colors and the probability weight of each, sampled once per star at creation.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "physics-tag-footer": {
    demoPath: "src/components/demos/physics-tag-footer.tsx",
    nuance: [
      {
        label: "The lid arrives late",
        description:
          "Only the floor and side walls exist at first, so the labels can rain in from far above the frame. A top wall is added three seconds later, which is what stops a hard throw from launching a pill out of the box.",
      },
      {
        label: "Dragging suspends rotation",
        description:
          "A grabbed body gets infinite inertia for the length of the drag, so it translates without spinning, then has its real inertia restored on release. Its position and velocity are clamped every step so it cannot be dragged through a wall.",
      },
      {
        label: "Physics runs in the footer's own coordinate space",
        description:
          "Walls and bodies are built from the container rect, not the viewport, so the pile fits whatever box the footer occupies.",
      },
    ],
    editable: [
      {
        name: "tags",
        control: "text",
        description: "The labels that drop in as physics bodies.",
      },
      {
        name: "heroHeading / footerHeading",
        control: "text",
        description: "The lead-in headline and the headline behind the pile.",
      },
    ],
    assets: [],
    api: [
      {
        name: "tags",
        type: "string[]",
        default: "12 BLANK stack labels",
        description:
          "Labels rendered as draggable pills. Each becomes one Matter.js body sized from its rendered box.",
      },
      {
        name: "heroHeading / footerHeading",
        type: "string",
        default: "BLANK copy",
        description: "Copy for the first screen and the footer screen.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "showreel-zoom-scroll": {
    demoPath: "src/components/demos/showreel-zoom-scroll.tsx",
    nuance: [
      {
        label: "Pointer drift scales with distance",
        description:
          "Horizontal tracking is multiplied by (1 - scale), so the card swings widest while it is a distant thumbnail and stops moving entirely once it passes 95 percent scale and becomes the subject.",
      },
      {
        label: "Caption shrinks on two slopes",
        description:
          "Font size runs 80 to 40 across the first 40 percent of the scroll and 40 to 20 across the remaining 60 percent, so the type drops fast while the card is small and eases into its final reading size.",
      },
      {
        label: "Start offset is breakpoint aware",
        description:
          "The initial translate and the pointer multiplier are picked from a width table, so the thumbnail starts fully above the fold on narrow screens without overshooting on wide ones.",
      },
    ],
    editable: [
      {
        name: "videoSrc",
        control: "text",
        description: "The looping clip shown in the card.",
      },
      {
        name: "heroHeading / heroCopy / outroCopy",
        control: "text",
        description: "Oversized brand headline and the surrounding copy.",
      },
    ],
    assets: [],
    api: [
      {
        name: "videoSrc",
        type: "string",
        default: "Blob-hosted loop",
        description:
          "Muted, autoplaying, looping video source used for the showreel card.",
      },
      {
        name: "brand / navLinks / heroHeading / heroCopy / scrollLabel / outroCopy",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Navigation and editorial copy around the reel.",
      },
      {
        name: "videoTitle / videoYears",
        type: "string",
        default: "Studio Showreel / 2023 - 2024",
        description: "The caption pair under the card.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "interlock-title-scroll": {
    demoPath: "src/components/demos/interlock-title-scroll.tsx",
    nuance: [
      {
        label: "Per-character windows, not a stagger",
        description:
          "Each character gets its own start delay and duration computed from its index and the character count, then reads scroll progress directly. The comb closes evenly no matter how long the word is.",
      },
      {
        label: "The middle band runs backwards",
        description:
          "Bands one and three stagger left to right and slide in from the right, band two reverses both, so consecutive titles never resolve in the same direction.",
      },
      {
        label: "Bands are shorter than the viewport",
        description:
          "Each title occupies 85svh, so the next band is always visible under the current one and the animations overlap as you scroll.",
      },
    ],
    editable: [
      {
        name: "titles",
        control: "text",
        description: "The full-bleed titles, one per band.",
      },
      {
        name: "accent / background / foreground",
        control: "color",
        description: "Alternating band color, page color, and type color.",
      },
    ],
    assets: [],
    api: [
      {
        name: "titles",
        type: "string[]",
        default: "Subtle Phase, Hidden Flow, Calm Glide",
        description:
          "One title per band. Odd bands take the accent background, even bands the page background.",
      },
      {
        name: "introHeading / outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "The lead-in and closing screens.",
      },
      {
        name: "background / foreground / accent",
        type: "string",
        default: "#f4f3ef / #141414 / #e3f794",
        description: "Page, type, and alternating band colors.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "drawn-path-features": {
    demoPath: "src/components/demos/drawn-path-features.tsx",
    nuance: [
      {
        label: "One dash offset, measured at runtime",
        description:
          "The path's real length is read with getTotalLength and used for both the dash array and the starting offset, so the stroke draws exactly once across the section regardless of viewport size.",
      },
      {
        label: "The line lives behind the content",
        description:
          "The SVG sits on a negative layer inside the section, so the stroke passes behind the cards while remaining visible over the page background.",
      },
      {
        label: "Scrub is tied to the section, not a pin",
        description:
          "The trigger runs top top to bottom bottom on the feature section itself, so nothing is pinned and the drawing rate stays locked to natural reading speed.",
      },
    ],
    editable: [
      {
        name: "strokeColor / strokeWidth",
        control: "color",
        description: "Color and thickness of the threading stroke.",
      },
      {
        name: "cards",
        control: "text",
        description: "The two feature card headings and bodies.",
      },
    ],
    assets: drawnPathFeaturesAssetDocs,
    api: [
      {
        name: "images",
        type: "[string, string, string, string]",
        default: "Blob-hosted illustrations",
        description: "The four illustrations the stroke threads past.",
      },
      {
        name: "cards",
        type: "[StrokePathCard, StrokePathCard]",
        default: "Two BLANK feature cards",
        description: "Heading and body for each of the two text cards.",
      },
      {
        name: "strokeColor / strokeWidth",
        type: "string / number",
        default: "#FF5F0A / 200",
        description: "Color and thickness of the drawn path.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container so it fits a bounded box. Set false to drive it from the window scroll.",
      },
    ],
  },
  "circular-widget-dial": {
    demoPath: "src/components/demos/circular-widget-dial.tsx",
    nuance: [
      {
        label: "Two counter-rotations, one readout",
        description:
          "The indicator advances and the ring retreats at a quarter that rate. The active segment is derived from the difference between the two angles, so a wheel gesture changes the readout faster than either element alone appears to move.",
      },
      {
        label: "Segments are clipped arcs, not masks",
        description:
          "Each slice is an SVG clipPath built from two arcs and two radial edges. The image inside is oversized by 25 percent and pre-rotated to the slice's mid-angle so it fills the wedge with no seams.",
      },
      {
        label: "Backdrop swaps are stacked, then trimmed",
        description:
          "A new full-bleed image is appended and faded in over 100ms rather than swapping a src, so there is never a blank frame. Only the last three are kept in the DOM.",
      },
    ],
    editable: [
      {
        name: "widgets",
        control: "text",
        description: "Segment images and their names.",
      },
      {
        name: "accent / background",
        control: "color",
        description: "Indicator and name-chip color, and the base color.",
      },
      {
        name: "spinSpeed",
        control: "text",
        description: "Degrees per second the indicator advances at rest.",
      },
    ],
    assets: circularWidgetDialAssetDocs,
    api: [
      {
        name: "widgets",
        type: "CircularWidget[]",
        default: "10 Blob-hosted segments",
        description:
          "Image and name per ring segment. The ring divides evenly by however many are supplied.",
      },
      {
        name: "accent / background",
        type: "string",
        default: "#ffff2b / #000",
        description: "Indicator and chip color, and the base color.",
      },
      {
        name: "spinSpeed",
        type: "number",
        default: "18",
        description:
          "Idle rotation speed in degrees per second. The ring counter-rotates at a quarter of it.",
      },
    ],
  },
  "edge-warp-rail": {
    demoPath: "src/components/demos/edge-warp-rail.tsx",
    nuance: [
      {
        label: "Scroll becomes travel",
        description:
          "The component owns a vertical scroll container whose height equals the rail's overflow plus one viewport. A sticky band is pinned while the rail translates left by exactly the scroll offset, so one pixel of scroll is one pixel of sideways travel. Wheel and drag both write to that same scroll position, so every input agrees.",
      },
      {
        label: "The rim curls",
        description:
          "Each tile measures its position against the band every frame. Within the outer twelve percent on either side it rotates on Y toward a shared vanishing point and recedes on Z, with a flat middle and a fast falloff at the very edge, while a horizontal mask fades it out as it clears the frame.",
      },
      {
        label: "Owns its scroll, degrades cleanly",
        description:
          "Because it scrolls its own box rather than the window, it embeds in a bounded stage or fills the screen unchanged. Below 768px it renders a plain vertical stack, and with reduced motion it becomes a native horizontal scroller, so the warp rig only runs when it can.",
      },
    ],
    editable: [
      {
        name: "background / textColor / mutedColor",
        control: "color",
        description:
          "Surface, primary ink, and the muted note and caption ink.",
      },
      {
        name: "label / intro / tags",
        control: "text",
        description: "The corner wordmark, its intro line, and the meta lines.",
      },
      {
        name: "items",
        control: "text",
        description:
          "The ordered rail: media tiles (src, alt, aspect) and note cards (eyebrow, heading, body) interleaved.",
      },
    ],
    assets: [],
    api: [
      {
        name: "items",
        type: "EdgeWarpItem[]",
        default: "sample rail of 15 frames and 4 notes",
        description:
          "Ordered tiles. A media item sizes to the band height at its aspect; a note is a text card.",
      },
      {
        name: "label / intro / tags",
        type: "string / string / string[]",
        default: '"BLANK" / intro line / three meta lines',
        description: "Fixed corner overlay content.",
      },
      {
        name: "background / textColor / mutedColor",
        type: "string",
        default: '"#f6f5f1" / "#17150f" / "#8b877c"',
        description: "Surface, primary ink, and muted ink.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the scroll container root.",
      },
    ],
  },
  "blnk-agency-page": {
    demoPath: "src/components/demos/blnk-agency-page.tsx",
    studioPath: "src/components/studios/blnk-agency-page.tsx",
    assets: [
      {
        id: "blnk-agency-page-award-img",
        label: "BLNK agency project frame",
        provider: "vercel-blob",
        pathname: "award-list/img1.jpg",
        fallbackPath: "https://ui.aryank.space/assets/award-list/img1.jpg",
        role: "Shared award-list imagery reused as project frames.",
      },
      {
        id: "blnk-agency-page-portfolio-img",
        label: "BLNK agency portfolio image",
        provider: "vercel-blob",
        pathname: "portfolio-page/project-1.jpg",
        fallbackPath:
          "https://ui.aryank.space/assets/portfolio-page/project-1.jpg",
        role: "Shared portfolio imagery for later project slots.",
      },
    ],
    nuance: [
      {
        label: "Wheel-driven infinite gallery (source scrollS)",
        description:
          "Matches obys.agency home: wheel/touch updates tar, RAF lerps cur (damp ~0.09 / 0.07 when snapping), list is tripled and wraps in the middle buffer, idle snaps to nearest item. Titles and meta follow the centered index.",
      },
      {
        label: "Logo brackets with is-spread",
        description:
          "Source #logo SVG halves translate ±137% when spread on Vertical/Horizontal. Removed on Grid; header wordmark shrinks on case study and About.",
      },
      {
        label: "Click opens work case study",
        description:
          "Source navigates to /work/* with a preloader-bg veil. This port runs the same fade veil then shows the #wo layout: Back, title, meta, Live Website, and a wheel-scrolled #wo-ga image column.",
      },
      {
        label: "Mode switch V↔H group rotation",
        description:
          "Source group.start rotates planes 90deg around the active item. Approximated by rotating the mode wrap while the new layout mounts.",
      },
    ],
    editable: [
      {
        name: "studioName / email",
        control: "text",
        description:
          "Wordmark and contact target used across header and caption.",
      },
      {
        name: "projects",
        control: "text",
        description:
          "Name, category, service, aspect, width, image, and grid placement per project.",
      },
      {
        name: "initialMode / initialRoute",
        control: "text",
        description: "Start on work (vertical, horizontal, grid) or about.",
      },
    ],
    api: [
      {
        name: "projects",
        type: "BlnkAgencyProject[]",
        default: "19 BLNK projects",
        description:
          "Work items powering all three layouts and the active meta rail.",
      },
      {
        name: "studioName",
        type: "string",
        default: '"BLNK"',
        description: "Header wordmark and about mark.",
      },
      {
        name: "email",
        type: "string",
        default: '"hello@aryank.space"',
        description: "Contact button copies this; caption and about link it.",
      },
      {
        name: "initialMode",
        type: '"vertical" | "horizontal" | "grid"',
        default: '"vertical"',
        description: "Which work layout is active on mount.",
      },
      {
        name: "initialRoute",
        type: '"work" | "about"',
        default: '"work"',
        description: "Work stage or About page.",
      },
      {
        name: "skipPreloader",
        type: "boolean",
        default: "false",
        description: "Skip the black progress intro (studio uses true).",
      },
    ],
  },
  "content-architecture-page": {
    demoPath: "src/components/demos/content-architecture-page.tsx",
    assets: contentArchitecturePageAssetDocs,
    nuance: [
      {
        label: "Complete production capture",
        description:
          "The reference set includes the rendered HTML, minified CSS, 33 JavaScript chunks, 21 RSC payloads, both fonts, every requested responsive image, desktop and mobile geometry, and interaction snapshots from July 23, 2026.",
      },
      {
        label: "ASCII generated from source images",
        description:
          "The eleven showcase frames sample the exact Blob-backed source captures into deterministic luminance glyphs at the rendered card width.",
      },
      {
        label: "Contained page interactions",
        description:
          "Navigation targets the page's own scroll parent. The mobile menu, active minimap, repository explorer, terminal, carousel, FAQ, newsletter, and learn-more drawer remain functional inside a registry preview.",
      },
    ],
    editable: [
      {
        name: "assetBase",
        control: "asset-url",
        description:
          "Stable base URL containing the source showcase images, portraits, and Geist font files.",
      },
    ],
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/content-architecture-page"',
        description:
          "Base path for all sixteen Blob-backed media and font assets.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the isolated full-page root.",
      },
    ],
  },
  "chrome-folio-page": {
    demoPath: "src/components/demos/chrome-folio-page.tsx",
    assets: [],
    nuance: [
      {
        label: "Noise rotates the sampling frame",
        description:
          "The sphere's fragment shader runs 3D value noise over the vertex position and uses that value as a rotation angle for the UV before sampling two smoothstepped sine bands. Rotating the frame is what folds the bands into the liquid-metal read, rather than sliding them.",
      },
      {
        label: "Linear output keeps the greys",
        description:
          "The renderer writes linear sRGB instead of the managed default. The shader already emits display-referred greys, so letting three convert them a second time would wash the chrome toward white.",
      },
      {
        label: "The camera sits inside the sphere",
        description:
          "A 1.5 unit sphere with the camera at z=1 puts the near surface past the camera, so the mesh fills the frame as a surface rather than reading as a ball. The band scale is tuned for that distance.",
      },
      {
        label: "Pointer rotation is lerped, not bound",
        description:
          "The pointer sets a target angle and each frame closes five percent of the remaining distance, so the chrome keeps drifting after the cursor stops instead of locking to it.",
      },
      {
        label: "Cube arrives from deep Z",
        description:
          "The cube interpolates from a 180000px Z offset with full rotations on all three axes. The first half of the pinned scroll flies it in, the second half adds a 360 degree spin on top of the settled transform.",
      },
      {
        label: "Cards run off one driver object",
        description:
          "All cards read a single tweened value rather than owning timelines. Each offsets that value by its index and clamps, then picks a segment out of a four-stop keyframe array, which is what lets them fan out and recombine without drifting apart.",
      },
    ],
    editable: [
      {
        name: "wordmark / subline",
        control: "text",
        description:
          "Braced runs render in italic serif, so BLAN{K} mixes both faces without markup.",
      },
      {
        name: "projects",
        control: "text",
        description: "Title, blurb, and a two-color tint per project card.",
      },
    ],
    api: [
      {
        name: "wordmark",
        type: "string",
        default: '"BLAN{K} \'{25}"',
        description:
          "Masthead wordmark. Characters inside braces are set in italic serif.",
      },
      {
        name: "tagline",
        type: "string",
        default: "Studio one-liner",
        description: "Small mono line centered in the masthead.",
      },
      {
        name: "subline",
        type: "string",
        default: '"DESIGN - {FOLIO}"',
        description:
          "Secondary display line, same brace syntax as the wordmark.",
      },
      {
        name: "standfirst",
        type: "string[]",
        default: "Two BLANK lines",
        description: "Mono lines pinned to the bottom of the viewport.",
      },
      {
        name: "worksIntro",
        type: "string[]",
        default: "Three BLANK lines",
        description: "Mono intro above the project fly-through.",
      },
      {
        name: "cubeWord / projectsWord",
        type: "string",
        default: '"FEEL" / "PROJECTS"',
        description:
          "Oversized words behind the cube (italic serif) and the cards (grotesque).",
      },
      {
        name: "projects",
        type: "FolioProject[]",
        default: "Five BLANK projects",
        description:
          "Title, blurb, and a two-color tint that generates both the card media and a cube face.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container and point ScrollTrigger at it; set false to ride the window scroll.",
      },
    ],
  },
  "procedural-computer-page": {
    demoPath: "src/components/demos/procedural-computer-page.tsx",
    assets: [],
    nuance: [
      {
        label: "One triangle covers the whole page",
        description:
          "The scene is a single fragment shader rasterized over one oversized triangle at [-1,-1],[3,-1],[-1,3]. There is no geometry for the rings; every pixel independently raymarches the signed-distance field, so the cost scales with resolution, not with scene complexity.",
      },
      {
        label: "Rings are analytic ellipse SDFs, not sampled circles",
        description:
          "Each ring rotates a 3D circle by a rotation matrix and projects it, which turns it into an ellipse in screen space. The exact distance to that ellipse is solved with a twelve-step Newton iteration over the ellipse's parametric normal, then onioned to give the ring its thickness. That is what keeps the edges razor sharp at any orientation instead of blurring as they turn edge-on.",
      },
      {
        label: "Two passes, cross-faded by a key",
        description:
          "The field is evaluated twice with different line and crosshair widths: a flat pass anti-aliased with fwidth for crisp strokes, and an emboss pass that reads the SDF at four neighbours to build a surface normal and light it. Pressing B lerps uEmboss between them, so the same rings read as line art or as raised metal without a second scene.",
      },
      {
        label: "The loop is deterministic, the input is not",
        description:
          "Time is wrapped to a fifteen second period so the ring orbit is perfectly seamless. Everything reactive is added on top as an offset: the wheel feeds a velocity that decays into uScroll, the pointer is exponentially smoothed toward the crosshair, and dark mode eases uInvert. Nothing accumulates permanently, so the background never drifts out of frame.",
      },
      {
        label: "Dark mode is a shader uniform, not a repaint",
        description:
          "uInvert mixes the background from a light grey to near-black and swaps the line colour the opposite way inside the shader. Toggling the theme does not touch the DOM canvas; it eases a single float, so the whole field crossfades its palette in one smooth motion.",
      },
    ],
    editable: [
      {
        name: "wordmark",
        control: "text",
        description: "Fixed top-left studio mark.",
      },
      {
        name: "intro",
        control: "textarea",
        description: "Copy inside the blurred glass card.",
      },
      {
        name: "links",
        control: "links",
        description: "Bottom-right social nav.",
      },
    ],
    api: [
      {
        name: "wordmark",
        type: "string",
        default: '"BLANK"',
        description: "Fixed top-left wordmark over the canvas.",
      },
      {
        name: "intro",
        type: "string",
        default: "Studio intro",
        description: "Paragraph rendered in the blurred backdrop card.",
      },
      {
        name: "contactEmail",
        type: "string",
        default: '"hello@aryank.space"',
        description: "Address opened by the Contact button and the C shortcut.",
      },
      {
        name: "links",
        type: "ProceduralComputerPageLink[]",
        default: "Three BLANK links",
        description: "Bottom-right social navigation as { label, href } pairs.",
      },
      {
        name: "defaultDark",
        type: "boolean",
        default: "false",
        description:
          "Start with the inverted (dark) palette; press T to toggle.",
      },
    ],
  },
  "fanned-card-deck": {
    demoPath: "src/components/demos/fanned-card-deck.tsx",
    assets: [],
    nuance: [
      {
        label: "Two poses, one spring",
        description:
          "Every card holds a resting fan pose and a cluster pose. With nothing selected the fan pose runs, with a card open that card centers and the rest drop into the cluster, so the whole set is one interpolation rather than a sequence of separate animations.",
      },
      {
        label: "Fixed-resolution textures",
        description:
          "Each canvas always draws at 312 by 192 and is scaled into the card's current slot. The pattern keeps its line weight and density when a card grows, instead of regenerating coarser at the larger size.",
      },
      {
        label: "Seeded and deterministic",
        description:
          "The textures use a mulberry32 generator seeded per card, so a card redraws the same pattern on every mount and there is no flicker between server and client render.",
      },
      {
        label: "Fan offsets track viewport width",
        description:
          "The horizontal spread and the cluster scale are both interpolated between 400px and 1080px of viewport, so the hand tightens on small screens rather than pushing cards off the stage.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "text",
        description:
          "Title, description, background, foreground, body color, texture, and seed per card.",
      },
    ],
    api: [
      {
        name: "cards",
        type: "DeckCard[]",
        default: "Five BLANK collection cards",
        description:
          "Each card's title (newlines split the lines), description, background, foreground, bodyColor, graphicType, and seed.",
      },
      {
        name: "className",
        type: "string",
        default: "undefined",
        description: "Extra classes on the deck stage wrapper.",
      },
    ],
  },
  "orbit-matter-page": {
    demoPath: "src/components/demos/orbit-matter-page.tsx",
    nuance: [
      {
        label: "Vanilla source, scoped runtime",
        description:
          "The original HTML and CSS remain intact while its document-level Vite scripts are translated into a contained React effect runtime for safe registry use.",
      },
      {
        label: "Signal system stays live",
        description:
          "The preloader grid, pointer highlights, menu, Toronto zone clock, SplitText reveals, introduction fill, mission pin, and CTA dispersion remain interactive.",
      },
      {
        label: "Full editorial depth",
        description:
          "The install includes the complete hero, statistics, introduction, five mission records, six-card transmission sequence, and observatory footer.",
      },
    ],
    editable: [],
    assets: orbitMatterPageAssetDocs,
    api: [
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the isolated full-page root wrapper.",
      },
    ],
  },
  "polite-chaos-page": {
    demoPath: "src/components/demos/polite-chaos-page.tsx",
    nuance: [
      {
        label: "Complete homepage sequence",
        description:
          "The original hero, showreel, featured work, review stack, spotlight marquees, contact card, menu, and footer remain one continuous studio page.",
      },
      {
        label: "Source motion retained",
        description:
          "The image preloader, SplitText copy, pinned showreel, project entrances, review pins, weight-shifting marquees, menu overlay, and footer interactions use the source GSAP logic.",
      },
      {
        label: "Contained handoff",
        description:
          "Internal links stay inside the registry preview while the page keeps its full navigation and CTA presentation.",
      },
    ],
    editable: [],
    assets: politeChaosPageAssetDocs,
    api: [
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the isolated full-page root wrapper.",
      },
    ],
  },
  "house-of-epochs-page": {
    demoPath: "src/components/demos/house-of-epochs-page.tsx",
    nuance: [
      {
        label: "Original page composition",
        description:
          "The port keeps the archive hero, institution section, discipline cards, showreel, compass CTA, survey stack, menu, music control, and footer as one continuous page.",
      },
      {
        label: "Source GSAP timelines",
        description:
          "The preloader, SplitText reveals, Flip showreel, pinned card stack, compass rotation, menu clip, and footer arc motion remain in the source-authored React sections.",
      },
      {
        label: "Blob media tree",
        description:
          "The original Palace, Bellefair, and DM Mono fonts plus photographs, SVG artwork, and soundtrack resolve from stable Blob paths.",
      },
    ],
    editable: [],
    assets: houseOfEpochsPageAssetDocs,
    api: [
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the isolated full-page root wrapper.",
      },
    ],
  },
  "march-2025-template": {
    demoPath: "src/components/demos/march-2025-template.tsx",
    studioPath: "src/components/studios/march-2025-template.tsx",
    nuance: [
      {
        label: "The whole site is the component",
        description:
          "The template keeps the original Home, Work, Project, About, FAQ, and Contact route set inside a MemoryRouter, with Framer Motion AnimatePresence preserving the block transition between pages.",
      },
      {
        label: "Typography is part of the replication",
        description:
          "The Rader display family plus Messina Sans and Messina Sans Mono are uploaded to Blob and loaded through scoped font-face rules so the page keeps the source character.",
      },
      {
        label: "Motion is source-backed",
        description:
          "GSAP, ScrollTrigger, SplitType, and @gsap/react recreate the line reveals, sticky title sequence, menu expansion, FAQ accordion, work carousel swaps, and review text transitions.",
      },
      {
        label: "Scroll nuance is preserved",
        description:
          "Lenis drives smooth scroll and project-image parallax, while the Work view stays as the original fixed carousel with animated title and image replacement.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Start the embedded website on /, /work, /sample-project, /about, /faq, or /contact.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted asset base starting at ${getHostedAssetUrl(
          "march-2025-template/home/hero.jpg",
        )}.`,
      },
      {
        name: "className / style",
        control: "text",
        description:
          "Optional wrapper styling for consumers embedding the full website template.",
      },
    ],
    assets: march2025TemplateAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/march-2025-template"',
        description:
          "Base URL for the 53 Blob-hosted source assets, including images and fonts.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/sample-project" | "/about" | "/contact" | "/faq"',
        default: '"/"',
        description:
          "Initial route used by the internal MemoryRouter when the template mounts.",
      },
      {
        name: "className",
        type: "string",
        default: '""',
        description: "Optional class added to the March template root.",
      },
      {
        name: "style",
        type: "CSSProperties",
        description: "Optional inline styles for the March template root.",
      },
    ],
  },
  "archive-commerce-page": {
    demoPath: "src/components/demos/archive-commerce-page.tsx",
    studioPath: "src/components/studios/archive-commerce-page.tsx",
    nuance: [
      {
        label: "A real port, not a frame",
        description:
          "Every route is React: home with the counter preloader, catalogue, product detail, archive, editorial, article detail, and info, joined by a clip-path page transition that replaces the source's view transitions.",
      },
      {
        label: "The cart is functional",
        description:
          "Add to cart, remove, quantities, and the subtotal work against a persistent local store, and the drawer slides in with the source's custom ease.",
      },
      {
        label: "The archive leaves a trail",
        description:
          "Hovering archive rows stacks preview images in a fixed viewer that scales old frames away, matching the source's mouse-trail behavior.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route the template opens on: /, /catalogue, /catalogue/<slug>, /archive, /editorial, /editorial/<slug>, or /info.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Base URL for the template's Blob-hosted imagery, starting at ${getHostedAssetUrl(
          "archive-commerce-page/hero.gif",
        )}.`,
      },
    ],
    assets: archiveCommercePageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/archive-commerce-page"',
        description:
          "Base URL prefixed to every image the template renders (hero GIF, product imagery, editorial imagery).",
      },
      {
        name: "initialPath",
        type: "string",
        default: '"/"',
        description:
          "Source route the internal router mounts first, including product and article slugs.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root <main> wrapper for sizing and layout.",
      },
    ],
  },
  "interior-studio-page": {
    demoPath: "src/components/demos/interior-studio-page.tsx",
    studioPath: "src/components/studios/interior-studio-page.tsx",
    nuance: [
      {
        label: "A real port, not a frame",
        description:
          "Every route is React: home behind the counter preloader, studio with the pinned process steps and arc-path spotlight, spaces, sample space, the draggable blueprint gallery, and connect, joined by a circular clip-path page transition.",
      },
      {
        label: "The gallery is infinite",
        description:
          "Blueprints renders a draggable canvas that virtualizes tiles in every direction with momentum, and clicking a tile expands it over an overlay with a word-split title reveal.",
      },
      {
        label: "Scroll drives the set pieces",
        description:
          "The featured-projects deck pins and folds cards away in 3D, the spotlight pins for ten viewport heights while titles and images ride a bezier arc, and the top bar hides on scroll down.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route the template opens on: /, /studio, /spaces, /sample-space, /blueprints, or /connect.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Base URL for the template's Blob-hosted imagery, starting at ${getHostedAssetUrl(
          "interior-studio-page/home/hero.jpg",
        )}.`,
      },
    ],
    assets: interiorStudioPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/interior-studio-page"',
        description:
          "Base URL prefixed to every image the template renders (hero, projects, reviews, gallery, spotlight, logos).",
      },
      {
        name: "initialPath",
        type: "string",
        default: '"/"',
        description: "Source route the internal router mounts first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root <main> wrapper for sizing and layout.",
      },
    ],
  },
  "dining-room-page": {
    demoPath: "src/components/demos/dining-room-page.tsx",
    studioPath: "src/components/studios/dining-room-page.tsx",
    nuance: [
      {
        label: "Classic type, modern layout",
        description:
          "The page uses serif display type for the dining identity, then switches to a restrained sans-serif for navigation, captions, and controls.",
      },
      {
        label: "Collage behaves like a long page",
        description:
          "The about section stretches to 220svh and places six images around a sticky text block, preserving the full-page dining source rhythm.",
      },
      {
        label: "Menu and reservation are included",
        description:
          "The shipped component includes menu category cards and a reservation CTA so it is a complete page template.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route the template opens on: /, /about, /menu, or /reservation.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Base URL for the template's Blob-hosted imagery, starting at ${getHostedAssetUrl(
          "dining-room-page/home/hero.jpg",
        )}.`,
      },
    ],
    assets: diningRoomPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/dining-room-page"',
        description:
          "Base URL prefixed to every image the template renders (home, dining, chefs, footer, menu).",
      },
      {
        name: "initialPath",
        type: '"/" | "/about" | "/menu" | "/reservation"',
        default: '"/"',
        description: "Source route the MemoryRouter mounts first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root <main> wrapper for sizing and layout.",
      },
    ],
  },
  "film-studio-page": {
    demoPath: "src/components/demos/film-studio-page.tsx",
    studioPath: "src/components/studios/film-studio-page.tsx",
    nuance: [
      {
        label: "The hero is a WebGL video",
        description:
          "A Three.js data-texture shader pixel-distorts the looping MP4 hero around the cursor, so the first viewport reacts to pointer movement on desktop.",
      },
      {
        label: "Text is captured, then distorted",
        description:
          "Section headlines are rasterised with html2canvas and pushed through the same distortion shader, and the work slider crossfades stills through a lens-bubble shader.",
      },
      {
        label: "Every route ships",
        description:
          "The template includes index, work, culture, directors, contact, and a sample film route behind a project-grid preloader and scramble nav, so it is a complete site, not one screen.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route the template opens on: /, /work, /culture, /directors, /contact, or /film.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Base URL for the template's Blob-hosted media, starting at ${getHostedAssetUrl(
          "film-studio-page/hero/hero-footage.mp4",
        )}.`,
      },
    ],
    assets: filmStudioPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/film-studio-page"',
        description:
          "Base URL prefixed to every image, video, and CSS background the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/culture" | "/directors" | "/contact" | "/film"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root <main> wrapper for sizing and layout.",
      },
    ],
  },
  "dark-catalog-page": {
    demoPath: "src/components/demos/dark-catalog-page.tsx",
    studioPath: "src/components/studios/dark-catalog-page.tsx",
    nuance: [
      {
        label: "Full routed source port",
        description:
          "The template includes the Deadlock index, studio, catalog, brief, and connect pages behind a local router so it installs as one component.",
      },
      {
        label: "WebGL atmosphere stays in the page",
        description:
          "The fluorescent hero, scroll god-rays logo stage, catalog canvas, spiral gallery, trail images, and smoke footer are kept in React rather than framed as an iframe.",
      },
      {
        label: "Blob source media",
        description:
          "Fonts, logos, featured work, catalog frames, brief imagery, team portraits, accordion panels, spiral frames, and trail images resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /studio, /catalog, /brief, or /connect.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "dark-catalog-page/logo-type.png",
        )}.`,
      },
    ],
    assets: darkCatalogPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/dark-catalog-page"',
        description:
          "Base URL prefixed to every image, font, and CSS background the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/studio" | "/catalog" | "/brief" | "/connect"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root <main> wrapper for sizing and layout.",
      },
    ],
  },
  "deadspace-page": {
    demoPath: "src/components/demos/deadspace-page.tsx",
    studioPath: "src/components/studios/deadspace-page.tsx",
    nuance: [
      {
        label: "Full routed source port",
        description:
          "The template includes the Deadspace index, lab, archive, record, and connect pages behind a local router so it installs as one component.",
      },
      {
        label: "Source motion translated",
        description:
          "The preloader grid, block page transition, circular WebGL menu, skyline canvas, SplitText reveals, pinned lab sequence, stats motion, contact ticker, and image distortion are recreated with scoped GSAP and Three.js effects.",
      },
      {
        label: "Blob source media",
        description:
          "Fonts, project images, work stills, contact icons, menu sounds, logo artwork, and lab visuals resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /lab, /work, /project, or /contact.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "deadspace-page/lab/hero-visual.png",
        )}.`,
      },
    ],
    assets: deadspacePageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/deadspace-page"',
        description:
          "Base URL prefixed to every image, font, icon, and sound the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/lab" | "/work" | "/project" | "/contact"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "isochrome-page": {
    demoPath: "src/components/demos/isochrome-page.tsx",
    studioPath: "src/components/studios/isochrome-page.tsx",
    nuance: [
      {
        label: "Full routed agency site port",
        description:
          "The component ships the ISOChrome home, about, work, project, and contact pages behind a local router, so the whole Next App Router site installs as one page template.",
      },
      {
        label: "Deps swapped for the registry",
        description:
          "split-type line reveals become gsap SplitText, Lenis parallax and ScrollTrigger run against the preview's own scroll container, and next-view-transitions routing becomes a local state router, so it depends only on gsap and @gsap/react.",
      },
      {
        label: "Blob source media",
        description:
          "Every source image, all sixteen client logos, and the Druk and Akkurat Mono fonts resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /about, /work, /project, or /contact.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "isochrome-page/home/hero-img.jpg",
        )}.`,
      },
    ],
    assets: isochromePageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/isochrome-page"',
        description:
          "Base URL prefixed to every image and font the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/about" | "/work" | "/project" | "/contact"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "liquid-stat-grid": {
    demoPath: "src/components/demos/liquid-stat-grid.tsx",
    studioPath: "src/components/studios/liquid-stat-grid.tsx",
    nuance: [
      {
        label: "Six-stage shader chain",
        description:
          "A flat plate, a mouse-tracked colour blob, a domain warp with chromatic aberration, two noise-blur passes and a second faster warp. Each stage renders into its own framebuffer at its own resolution scale and samples the previous stage, so the blur passes run at a quarter resolution while the warps run full size.",
      },
      {
        label: "Hover reveal, inverted copy",
        description:
          "Cells sit flat and quiet until hovered, then the gradient fades up behind the copy and the text switches to white. Set reveal to always to leave every cell running.",
      },
      {
        label: "Procedural, no assets",
        description:
          "Nothing is fetched at runtime and no textures ship with the component. The gradients exist only as shader output, so a cell costs one canvas and no network requests.",
      },
      {
        label: "Paused when off screen",
        description:
          "Each canvas holds an IntersectionObserver and skips its render loop while scrolled out of view, so three simultaneous shader chains do not burn GPU on a long page.",
      },
    ],
    editable: [
      {
        name: "reveal",
        control: "text",
        description:
          "Either hover, so a cell only animates while pointed at, or always.",
      },
    ],
    assets: [],
    api: [
      {
        name: "stats",
        type: "LiquidStat[]",
        default: "DEFAULT_STATS",
        description:
          "Cells to render: value, optional suffix, description, and which colour variant backs it.",
      },
      {
        name: "reveal",
        type: '"hover" | "always"',
        default: '"hover"',
        description: "Whether the gradient waits for hover or runs constantly.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "dither-studio-page": {
    demoPath: "src/components/demos/dither-studio-page.tsx",
    studioPath: "src/components/studios/dither-studio-page.tsx",
    nuance: [
      {
        label: "The page sits on a live dither field",
        description:
          "A fixed WebGL2 pass renders an fbm field quantised through a 4x4 Bayer matrix into drifting specks behind every section, and the field warps toward a lerped cursor. The hero blends over it with mix-blend exclusion.",
      },
      {
        label: "Load choreography",
        description:
          "A counter runs 0 to 100% on a black plate, then a second dither pass eats the plate away from its thinnest areas outward while the bracketed eyebrow settles out of random scramble glyphs.",
      },
      {
        label: "Mouse animations across every image",
        description:
          "Each media slot draws through a canvas; moving the pointer across one smears a decaying trail of coarse pixelation behind the cursor. A label pill also chases the pointer across case rows and media, summoned by data-cursor attributes.",
      },
      {
        label: "Chrome that follows the scroll",
        description:
          "The pill nav's 4x4 pixel mark morphs and its message rolls over per section, the right-rail panels open to match the section in view, and a bottom status rail keeps a live tabular-numeral clock. Case rows expand in place; videos passed via props are requantised to duotone dither every frame.",
      },
    ],
    editable: [
      {
        name: "heroVideoSrc",
        control: "text",
        description:
          "Looping footage dithered into the hero plate. Omit it to let the field show through.",
      },
    ],
    assets: [],
    api: [
      {
        name: "heroVideoSrc",
        type: "string",
        default: "undefined",
        description:
          "Looping footage for the hero plate, requantised to duotone dither per frame; the field shows through when absent.",
      },
      {
        name: "heroPoster",
        type: "string",
        default: "undefined",
        description:
          "Still image used as the hero plate when no video is passed.",
      },
      {
        name: "reelVideoSrc",
        type: "string",
        default: "undefined",
        description:
          "Footage for the This is us rail panel, rendered as dither.",
      },
      {
        name: "reelPoster",
        type: "string",
        default: "undefined",
        description: "Still fallback for the rail panel.",
      },
      {
        name: "avatarSrc",
        type: "string",
        default: "undefined",
        description: "Avatar shown inside the contact cards.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "null-studio-page": {
    demoPath: "src/components/demos/null-studio-page.tsx",
    studioPath: "src/components/studios/null-studio-page.tsx",
    nuance: [
      {
        label: "Full routed agency site port",
        description:
          "The component ships the Null Studio home, projects, about, sample project, careers, and contact pages behind a local router, so the whole agency site installs as one page template.",
      },
      {
        label: "Interactions rebuilt without deps",
        description:
          "The fullscreen overlay menu, the draggable auto-playing team carousel, and the sample project's custom video player and collapsible copy are rebuilt with React state and CSS, so the template ships no runtime dependencies.",
      },
      {
        label: "Blob source media",
        description:
          "Every source image and the Cosi Times, PP Eiko, and PP Neue Montreal fonts resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /work, /about, /contact, /careers, or /work-sample.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "null-studio-page/images/home/hero.jpg",
        )}.`,
      },
    ],
    assets: nullStudioPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/null-studio-page"',
        description:
          "Base URL prefixed to every image and font the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/about" | "/contact" | "/careers" | "/work-sample"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "ink-core-layout": {
    demoPath: "src/components/demos/ink-core-layout.tsx",
    nuance: [
      {
        label: "Live cursor ink",
        description:
          "A scoped canvas lays down a narrow two-layer ink ribbon and gradually fades it directly under the cursor. The display control clears the field by unmounting it.",
      },
      {
        label: "Horizontal editorial field",
        description:
          "The tiles use viewport-derived units rather than fixed coordinates, preserving the sparse, wide composition across screen heights.",
      },
    ],
    editable: [
      {
        name: "loadingDuration",
        control: "text",
        description:
          "Milliseconds the opening ink screen remains visible after mount.",
      },
    ],
    assets: inkCoreLayoutAssetDocs,
    api: [
      {
        name: "loadingDuration",
        type: "number",
        default: "5667",
        description:
          "Duration of the initial ink loading screen in milliseconds.",
      },
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/ink-core-layout"',
        description:
          "Blob base URL for the tiles, intro and looping videos, and Switzer font.",
      },
      {
        name: "className",
        type: "string",
        default: "undefined",
        description: "Optional class applied to the page root.",
      },
    ],
  },
  "brutalist-portfolio-page": {
    demoPath: "src/components/demos/brutalist-portfolio-page.tsx",
    studioPath: "src/components/studios/brutalist-portfolio-page.tsx",
    nuance: [
      {
        label: "Full routed portfolio port",
        description:
          "The component ships the Brutal Portfolio home, about, and case-studies pages behind a local router, so the whole portfolio installs as one page template.",
      },
      {
        label: "Cursor image-trail in gsap 3",
        description:
          "The original TweenMax image trail that follows the cursor across the home is reimplemented with gsap 3, scoped to the component and aligned to its own bounding box.",
      },
      {
        label: "Blob source media",
        description:
          "All nine source images and the PP Mondwest and PP NeueBit fonts resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /case-studies, or /about.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "brutalist-portfolio-page/images/01.png",
        )}.`,
      },
    ],
    assets: brutalistPortfolioPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/brutalist-portfolio-page"',
        description:
          "Base URL prefixed to every image and font the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/case-studies" | "/about"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "unusual-studio-page": {
    demoPath: "src/components/demos/unusual-studio-page.tsx",
    studioPath: "src/components/studios/unusual-studio-page.tsx",
    nuance: [
      {
        label: "Full routed studio site port",
        description:
          "The component ships the Unusual Designs home, portfolio, about, careers, contact, and sample project pages behind a local router, so the whole studio site installs as one page template.",
      },
      {
        label: "Source motion, no heavy deps",
        description:
          "framer-motion drives the slide page transition, a CSS marquee replaces react-fast-marquee, the about page keeps its native sticky panels, and the careers Lottie loads through the official web-component player; locomotive-scroll is dropped for native scroll.",
      },
      {
        label: "Blob source media",
        description:
          "All twelve source images, the four Neue Montreal weights, and the careers Lottie resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /projects, /about, /careers, /contact, or /sample-project-page.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "unusual-studio-page/images/banner-img.jpg",
        )}.`,
      },
    ],
    assets: unusualStudioPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/unusual-studio-page"',
        description:
          "Base URL prefixed to every image, font, and the Lottie the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/projects" | "/about" | "/careers" | "/contact" | "/sample-project-page"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "neoteric-page": {
    demoPath: "src/components/demos/neoteric-page.tsx",
    studioPath: "src/components/studios/neoteric-page.tsx",
    nuance: [
      {
        label: "Full routed agency site port",
        description:
          "The component ships the Neoteric home, work, studio, thinking, feed, contact, and sample project pages behind a local router, so the whole agency site installs as one page template.",
      },
      {
        label: "Source motion preserved",
        description:
          "The framer-motion slide-in/slide-out page transition, the dark nav and footer on the thinking route, and a self-contained masonry grid (replacing react-masonry-css) recreate the source.",
      },
      {
        label: "Blob source media",
        description:
          "All 11 project images and 2 team portraits resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /work, /studio, /thinking, /feed, /contact, or /work/sample-project.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "neoteric-page/project-images/img1.jpg",
        )}.`,
      },
    ],
    assets: neotericPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/neoteric-page"',
        description: "Base URL prefixed to every image the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/studio" | "/thinking" | "/feed" | "/contact" | "/work/sample-project"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "soren-page": {
    demoPath: "src/components/demos/soren-page.tsx",
    studioPath: "src/components/studios/soren-page.tsx",
    nuance: [
      {
        label: "Full routed portfolio port",
        description:
          "The component ships the Soren home, work masonry, projects list, photos grid, and sample post behind a local router, so the whole portfolio installs as one page template.",
      },
      {
        label: "Source interactions preserved",
        description:
          "The magnifying macOS-style dock, GSAP entrance staggers on work and photos, and a self-contained scramble reveal on the projects list are recreated from the source; the Spline 3D hero loads through the official web-component viewer.",
      },
      {
        label: "Blob source media",
        description:
          "All 22 source work images resolve through the stable asset base; fonts are the Google Urbanist and JetBrains Mono families.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /work, /projects, /photos, or /post.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "soren-page/work/work-1.jpg",
        )}.`,
      },
    ],
    assets: sorenPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/soren-page"',
        description: "Base URL prefixed to every image the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/projects" | "/photos" | "/post"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "velasco-solari-page": {
    demoPath: "src/components/demos/velasco-solari-page.tsx",
    studioPath: "src/components/studios/velasco-solari-page.tsx",
    nuance: [
      {
        label: "Full routed portfolio port",
        description:
          "The component ships the Velasco Solari home reel, work grid, overview table, Mustang film page, info, and sample project layouts behind a local router, so the whole director portfolio installs as one page template.",
      },
      {
        label: "Source interactions preserved",
        description:
          "The hover blur and slide on the work grid, the focus-dim on the overview table rows, the fixed nav, and the scaled background reels are recreated 1:1 from the source CSS.",
      },
      {
        label: "Blob source media",
        description:
          "The five Founders Grotesk weights and all eight project images resolve through the stable asset base; the reels stream from Vimeo as native background players.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /work, /overview, /mustang, /info, or /sample-project.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "velasco-solari-page/project-images/01.jpg",
        )}.`,
      },
    ],
    assets: velascoSolariPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/velasco-solari-page"',
        description:
          "Base URL prefixed to every image and font the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/overview" | "/mustang" | "/info" | "/sample-project"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "otis-valen-page": {
    demoPath: "src/components/demos/otis-valen-page.tsx",
    studioPath: "src/components/studios/otis-valen-page.tsx",
    nuance: [
      {
        label: "Full routed portfolio port",
        description:
          "The component includes the Otis Valen index, work, project, about, and contact pages behind a local router so the whole portfolio installs as one page template.",
      },
      {
        label: "Source motion translated",
        description:
          "The block page transition, menu reveal, pinned hero image, horizontal featured-work stage, service-card stack, work item entrances, project preview zoom, about tag drift, contact trail, and footer burst are recreated with scoped GSAP.",
      },
      {
        label: "Blob source media",
        description:
          "Formula, Rader, and Supply Mono fonts plus all portraits, symbols, hero images, service images, and work cards resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /work, /project, /about, or /contact.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "otis-valen-page/images/work-items/work-item-1.jpg",
        )}.`,
      },
    ],
    assets: otisValenPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/otis-valen-page"',
        description:
          "Base URL prefixed to every image and font the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/project" | "/about" | "/contact"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "damien-tsarantos-page": {
    demoPath: "src/components/demos/damien-tsarantos-page.tsx",
    studioPath: "src/components/studios/damien-tsarantos-page.tsx",
    nuance: [
      {
        label: "Six source routes",
        description:
          "The component includes the Damien Tsarantos home, about, projects, project detail, awards, and contact pages behind a local router.",
      },
      {
        label: "Source motion translated",
        description:
          "The original Lenis scroll, magnetic button tracking, contact-card ScrollTrigger stack, marquee loops, and h1 letter reveals are recreated with scoped GSAP.",
      },
      {
        label: "Blob source media",
        description:
          "All work thumbnails, project device shots, and contact cards resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /about, /work, /project, /awards, or /contact.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "damien-tsarantos-page/work/img1.jpg",
        )}.`,
      },
    ],
    assets: damienTsarantosPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/damien-tsarantos-page"',
        description: "Base URL prefixed to every image the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/about" | "/work" | "/project" | "/awards" | "/contact"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "wu-wei-page": {
    demoPath: "src/components/demos/wu-wei-page.tsx",
    studioPath: "src/components/studios/wu-wei-page.tsx",
    nuance: [
      {
        label: "Six source routes",
        description:
          "The component includes the Wu Wei index, work, studio, archive, contact, and sample project pages behind a local router.",
      },
      {
        label: "Source motion translated",
        description:
          "The GSAP preloader, menu reveal, WebGL particle logo, SplitText copy reveals, work-year ScrollTriggers, pinned studio stage, stacked process cards, archive drag field, and sample-project progress counter are recreated with scoped motion.",
      },
      {
        label: "Blob source media",
        description:
          "The nm font, logo, archive grid, work images, team portraits, process images, studio hero, and contact image resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /work, /studio, /archive, /contact, or /sample-project.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "wu-wei-page/images/work/work_001.jpeg",
        )}.`,
      },
    ],
    assets: wuWeiPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/wu-wei-page"',
        description:
          "Base URL prefixed to every image, logo, and font the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/work" | "/studio" | "/archive" | "/contact" | "/sample-project"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "lemon-bureau-page": {
    demoPath: "src/components/demos/lemon-bureau-page.tsx",
    studioPath: "src/components/studios/lemon-bureau-page.tsx",
    nuance: [
      {
        label: "Five source routes",
        description:
          "The component includes the Lemon Bureau home, studio, work, project, and contact pages behind a local router.",
      },
      {
        label: "Source motion translated",
        description:
          "The GSAP preloader split, menu overlay reveal, full-page WebGL fluid-ink cursor trail, WebGL particle logo, pinned studio hero, stacked team cards, boosted client marquee, SVG work carousel, three.js contact cube, and GPU FLIP fluid footer are recreated with scoped motion and cleanup.",
      },
      {
        label: "Blob source media",
        description:
          "The Humane and Neue Montreal fonts, logo, icons, client logos, team portraits, work images, studio hero, project imagery, and footer fluid shaders resolve through the stable asset base.",
      },
    ],
    editable: [
      {
        name: "initialPath",
        control: "text",
        description:
          "Which source route opens first: /, /studio, /work, /sample-project, or /contact.",
      },
      {
        name: "assetBase",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "lemon-bureau-page/logo/nav-logo.svg",
        )}.`,
      },
    ],
    assets: lemonBureauPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/assets/lemon-bureau-page"',
        description:
          "Base URL prefixed to every image, font, and footer fluid shader the template renders.",
      },
      {
        name: "initialPath",
        type: '"/" | "/studio" | "/work" | "/sample-project" | "/contact"',
        default: '"/"',
        description: "Source route mounted first.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "spiral-gallery": {
    demoPath: "src/components/demos/spiral-gallery.tsx",
    studioPath: "src/components/studios/spiral-gallery.tsx",
    nuance: [
      {
        label: "Tiles are bent geometry",
        description:
          "Each tile is a small grid of vertices wrapped onto a cylinder radius, not a flat plane, so the images curve with the coil. The radius eases from wide at the top to tighter at the bottom as the helix descends.",
      },
      {
        label: "Scroll drives spin and descent",
        description:
          "The spiral always rotates slowly; scroll velocity adds spin that decays, and scroll position eases the camera down the coil, so flicking the wheel spins it and holding a scroll walks you through.",
      },
      {
        label: "Facing brightens the image",
        description:
          "A small shader compares each tile's normal to the view direction, so tiles turning to face you brighten and those edge-on fade toward white, giving the rotation depth without any scene lights.",
      },
    ],
    editable: [
      {
        name: "heroBackground / aboutBackground",
        control: "color",
        description:
          "The two section backgrounds the transparent canvas sits over.",
      },
      {
        name: "textColor",
        control: "color",
        description: "Heading ink in the hero and about panels.",
      },
      {
        name: "heading / aboutText",
        control: "text",
        description: "The justified hero headline and the centered about line.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Twelve images, hosted through ${getHostedAssetUrl(
          "spiral-gallery/img-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: spiralGalleryAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "12 Compronents-hosted JPGs",
        description: "Images cycled around the curved helix tiles.",
      },
      {
        name: "heading / aboutText",
        type: "string",
        default: "hero headline / about line",
        description: "Copy in the hero and about sections.",
      },
      {
        name: "heroBackground / aboutBackground",
        type: "string",
        default: '"#242424" / "#171717"',
        description: "Section backdrops behind the transparent 3D canvas.",
      },
      {
        name: "textColor",
        type: "string",
        default: '"#d2d2d2"',
        description: "Heading color in both sections.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "voku-image-slider": {
    demoPath: "src/components/demos/voku-image-slider.tsx",
    nuance: [
      {
        label: "One eased target",
        description:
          "Wheel, pointer drag, and touch all move the same scroll target, so the component never has competing input paths.",
      },
      {
        label: "Arc from geometry",
        description:
          "Each slide computes its wrapped distance from center, then derives scale, vertical drop, lift, and stacking from that single number.",
      },
    ],
    editable: [
      {
        name: "images / titles",
        control: "asset-url",
        description: "The frame URLs and labels displayed at center.",
      },
      {
        name: "slideWidth / slideHeight / gap",
        control: "tuple",
        description:
          "The base image size and spacing before the arc transform.",
      },
    ],
    assets: pageAssets("voku-image-slider-", 3),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "9 Compronents-hosted JPGs",
        description: "Images wrapped through the curved track.",
      },
      {
        name: "titles",
        type: "string[]",
        default: "Profile Study / Pump Noir / ...",
        description: "Labels synced to the closest centered slide.",
      },
      {
        name: "slideWidth / slideHeight / gap",
        type: "number",
        default: "200 / 275 / 100",
        description: "Base sizing used before distance-based scaling.",
      },
    ],
  },
  "threejs-infinite-slider": {
    demoPath: "src/components/demos/threejs-infinite-slider.tsx",
    nuance: [
      {
        label: "Looping plane stack",
        description:
          "Slides are WebGL planes assigned offsets inside a loop length. Each frame wraps through the same vertical range.",
      },
      {
        label: "Velocity bends vertices",
        description:
          "Fast input raises a distortion target, then each plane's vertices bend forward based on distance from the viewport center.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "asset-url",
        description:
          "Slide names and texture URLs mapped onto the WebGL planes.",
      },
      {
        name: "distortionStrength",
        control: "tuple",
        description: "How far the mesh bends when wheel or drag input spikes.",
      },
    ],
    assets: pageAssets("threejs-infinite-slider-", 3),
    api: [
      {
        name: "slides",
        type: "{ name: string; image: string }[]",
        default: "10 Compronents-hosted JPGs",
        description: "Named texture set used by the infinite stack.",
      },
      {
        name: "minHeight / maxHeight / aspectRatio",
        type: "number",
        default: "1 / 1.5 / 1.5",
        description: "Plane sizing range in world units.",
      },
      {
        name: "distortionStrength",
        type: "number",
        default: "2.5",
        description: "Strength multiplier for velocity-based vertex bending.",
      },
    ],
  },
  "grid-scramble-hover": {
    demoPath: "src/components/demos/grid-scramble-hover.tsx",
    nuance: [
      {
        label: "Nearest cell wakes first",
        description:
          "The pointer activates the closest grid block inside a detection radius, then randomly walks adjacent cells for a small cluster.",
      },
      {
        label: "Scramble is local",
        description:
          "Only selected active cells spin their symbol interval, and each interval is cleared as soon as that cell expires.",
      },
    ],
    editable: [
      {
        name: "image",
        control: "asset-url",
        description: "The image underneath the generated symbol grid.",
      },
      {
        name: "symbols / blockSize / detectionRadius",
        control: "tuple",
        description: "Glyph set and grid sensitivity.",
      },
    ],
    assets: pageAssets("grid-scramble-hover-", 1),
    api: [
      {
        name: "image",
        type: "string",
        default: "Compronents-hosted JPG",
        description: "Image covered by the symbol grid.",
      },
      {
        name: "symbols",
        type: "string[]",
        default: "O / X / * / > / $ / W",
        description: "Glyphs randomly assigned and scrambled in active cells.",
      },
      {
        name: "blockSize / detectionRadius",
        type: "number",
        default: "25 / 50",
        description: "Grid cell size and pointer activation radius in pixels.",
      },
    ],
  },
  "flow-field-text": {
    demoPath: "src/components/demos/flow-field-text.tsx",
    nuance: [
      {
        label: "Sampled, not drawn",
        description:
          "Each grid cell reads its glyph from a noise-displaced position in the source copy, so text smears and doubles instead of a font simply animating.",
      },
      {
        label: "Scroll re-samples, it does not move",
        description:
          "The canvas is fixed; dragging or wheeling updates a scroll offset the field samples at, so text flows sideways while serif headers translate in lockstep above it.",
      },
      {
        label: "Quadratic vertical mask",
        description:
          "Displacement is zero at the top and grows with the square of depth, so headings stay legible while lower lines fray into scattered fragments, matching the source.",
      },
      {
        label: "Color follows the character",
        description:
          "The accent is decided by the sampled column's url, not the cell, so a hovered column's red bleeds across borders wherever the field borrowed a neighbor's letter.",
      },
    ],
    editable: [
      {
        name: "items",
        control: "textarea",
        description:
          "Editorial columns ({ text, title, subtitle, author, label, url }) tiled left to right. A bare string renders one column.",
      },
      {
        name: "textColor / accentColor / background",
        control: "color",
        description:
          "Base glyph color, hovered-column accent, and field background.",
      },
      {
        name: "speed / magnitude",
        control: "tuple",
        description:
          "Field drift multiplier and peak pixel displacement (source uses 1800).",
      },
    ],
    assets: [],
    api: [
      {
        name: "items",
        type: "FlowFieldItem[] | string[] | string",
        default: "themed BLANK editorial copy",
        description:
          "Columns of copy ({ text, title?, subtitle?, author?, label?, isNew?, url? }); hover and onSelect match by url.",
      },
      {
        name: "onSelect",
        type: "(url, item, index) => void",
        default: "undefined",
        description:
          "Fired when a column is tapped (a pointer press released without a drag).",
      },
      {
        name: "background / textColor / accentColor",
        type: "string",
        default: '"#ffffff" / "#111111" / "#f0341f"',
        description: "Field background, base glyph color, and hover accent.",
      },
      {
        name: "monoFamily / serifFamily",
        type: "string",
        default: "Next Mono stack / Century Schoolbook stack",
        description:
          "Field + badge monospace family (keeps glyphs on the grid) and the header serif family.",
      },
      {
        name: "fontSize / lineHeight",
        type: "number",
        default: "10 / 1.3",
        description: "Type metrics for the sampled grid.",
      },
      {
        name: "speed / magnitude",
        type: "number",
        default: "1 / 1800",
        description: "Drift time multiplier and peak displacement in pixels.",
      },
      {
        name: "itemWidth / gutter / headerHeight",
        type: "number",
        default: "~300 snapped / 10.4 / 265",
        description:
          "Column pitch, body left-indent, and the serif header band height (canvas starts below it).",
      },
      {
        name: "hoverHighlight",
        type: "boolean",
        default: "true",
        description:
          "Accent the column under the pointer and enable grab-cursor scroll.",
      },
    ],
  },
  "text-displacement-field": {
    demoPath: "src/components/demos/text-displacement-field.tsx",
    nuance: [
      {
        label: "Measured spans",
        description:
          "The copy is rendered as spans, measured after layout, and moved with transform only, so the paragraph stays readable.",
      },
      {
        label: "Soft field",
        description:
          "Each span eases toward a target derived from pointer distance and returns to zero when the pointer leaves.",
      },
    ],
    editable: [
      {
        name: "intro / body / outro",
        control: "textarea",
        description:
          "Display lines and paragraph copy split into moving spans.",
      },
      {
        name: "radius / displacement / ease",
        control: "tuple",
        description: "Pointer field radius, maximum push, and easing factor.",
      },
    ],
    assets: [],
    api: [
      {
        name: "intro / body / outro",
        type: "string",
        default: "source-inspired copy",
        description: "Text split into letters and words for displacement.",
      },
      {
        name: "radius",
        type: "number",
        default: "150",
        description: "Pointer influence radius in pixels.",
      },
      {
        name: "displacement / ease",
        type: "number",
        default: "300 / 0.1",
        description: "Maximum span offset and interpolation amount.",
      },
    ],
  },
  "vinyl-orbit-player": {
    demoPath: "src/components/demos/vinyl-orbit-player.tsx",
    nuance: [
      {
        label: "Native SVG orbit",
        description:
          "The curved copy rides real SVG text paths, so the motion stays crisp without canvas or animation libraries.",
      },
      {
        label: "Single spinning layer",
        description:
          "The record and center cover rotate as one circle, matching the source behavior with a small CSS loop.",
      },
    ],
    editable: [
      {
        name: "coverImage / diskImage",
        control: "asset-url",
        description: "The circular cover art and record texture.",
      },
      {
        name: "primaryText / secondaryText",
        control: "text",
        description: "The phrases rendered on the large and small text paths.",
      },
    ],
    assets: pageAssets("vinyl-orbit-player-", 4),
    api: [
      {
        name: "coverImage",
        type: "string",
        default: "Compronents-hosted JPG",
        description: "Circular cover image placed at the center of the record.",
      },
      {
        name: "diskImage",
        type: "string",
        default: "Compronents-hosted PNG",
        description: "Record texture spun behind the cover.",
      },
      {
        name: "primaryText / secondaryText",
        type: "string",
        default: "Fly to the moon now / Throwback Music Vol",
        description: "Curved text shown around the record.",
      },
    ],
  },
  "orbit-text-preloader": {
    demoPath: "src/components/demos/orbit-text-preloader.tsx",
    nuance: [
      {
        label: "Orbits breathe",
        description:
          "Each ring's textLength stretches toward a target and yoyos back, with duration scaled by orbit radius, so outer rings move slower than inner ones.",
      },
      {
        label: "Offset compensation",
        description:
          "As textLength grows the startOffset shifts back by half the increase over the path length, so each word stays centered on its ring.",
      },
    ],
    editable: [
      {
        name: "heroImage",
        control: "asset-url",
        description: "The hero revealed after the loader fades.",
      },
      {
        name: "orbitWords / heroText",
        control: "text",
        description: "The eight ring words and the hero copy line.",
      },
    ],
    assets: pageAssets("orbit-text-preloader-", 1),
    api: [
      {
        name: "heroImage",
        type: "string",
        default: "BLANK-hosted JPG",
        description: "Background image scaled from 1.25 to 1 on reveal.",
      },
      {
        name: "orbitWords",
        type: "string[]",
        default: "Developer / Frontend / ... / Design",
        description: "Words placed on the eight concentric orbit paths.",
      },
      {
        name: "loaderBackground / loaderColor",
        type: "string",
        default: '"#d1d9b8" / "#0f0f0f"',
        description: "Loader plate color and orbit text color.",
      },
    ],
  },
  "scroll-text-blocks": {
    demoPath: "src/components/demos/scroll-text-blocks.tsx",
    nuance: [
      {
        label: "Word-level scrub",
        description:
          "Scroll progress maps to per-word offsets with an overlap window, so outgoing words drop while incoming words rise in a staggered wave.",
      },
      {
        label: "Velocity-fed marquee",
        description:
          "The image marquee always drifts, and Lenis scroll velocity is smoothed into a speed boost that decays when you stop scrolling.",
      },
    ],
    editable: [
      {
        name: "blocks",
        control: "textarea",
        description: "The three copy paragraphs that swap as you scroll.",
      },
      {
        name: "images",
        control: "asset-url",
        description: "The ten marquee images.",
      },
    ],
    assets: pageAssets("scroll-text-blocks-", 10),
    api: [
      {
        name: "blocks",
        type: "[string, string, string]",
        default: "source-inspired copy",
        description: "Copy blocks split into masked words.",
      },
      {
        name: "images",
        type: "string[]",
        default: "10 BLANK-hosted JPGs",
        description: "Marquee tiles, duplicated for the seamless loop.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "video-card-stack": {
    demoPath: "src/components/demos/video-card-stack.tsx",
    nuance: [
      {
        label: "DOM-order deck",
        description:
          "The deck order lives in the DOM: the front card animates off, is prepended to the slider, and every card re-tweens into its stacked slot.",
      },
      {
        label: "Perspective stage",
        description:
          "A tight 175px perspective with origin at the bottom center gives the stack its deep lean without any 3D library.",
      },
    ],
    editable: [
      {
        name: "videos",
        control: "links",
        description: "Vimeo id, title, category, and date per card.",
      },
      {
        name: "logoText / navLinks / ctaText",
        control: "text",
        description: "The chrome copy above the deck.",
      },
    ],
    assets: pageAssets("video-card-stack-", 1),
    api: [
      {
        name: "videos",
        type: "{ id: string; title: string; category: string; date: string }[]",
        default: "4 Vimeo films",
        description: "Looping muted players stacked as cards.",
      },
      {
        name: "logoText / navLinks / ctaText",
        type: "string / string[] / string",
        default: "Directory / Home... / Contact",
        description: "Navbar copy rendered above the stack.",
      },
    ],
  },
  "client-hover-preview": {
    demoPath: "src/components/demos/client-hover-preview.tsx",
    nuance: [
      {
        label: "Clip-path wipe",
        description:
          "Each hover creates a fresh wrapper clipped to a center point and expands it to the full box, so quick hops between names stack cross-fading previews.",
      },
      {
        label: "Blend-mode text",
        description:
          "Names and chrome sit in mix-blend-mode difference, flipping from black-on-white to white when the preview image passes underneath.",
      },
    ],
    editable: [
      {
        name: "clients",
        control: "textarea",
        description: "The client names in the wall.",
      },
      {
        name: "images",
        control: "asset-url",
        description: "One preview image per client, matched by index.",
      },
    ],
    assets: pageAssets("client-hover-preview-", 12),
    api: [
      {
        name: "clients",
        type: "string[]",
        default: "12 product studios",
        description: "Hoverable names, punctuation included.",
      },
      {
        name: "images",
        type: "string[]",
        default: "12 BLANK-hosted JPGs",
        description: "Centered preview images revealed per client.",
      },
      {
        name: "header / footerLeft / footerRight",
        type: "string",
        default: "Trusted Us / Experiment 503 / Developed by BLANK",
        description: "Chrome copy around the client wall.",
      },
    ],
  },
  "folder-preview-hover": {
    demoPath: "src/components/demos/folder-preview-hover.tsx",
    nuance: [
      {
        label: "Randomized pop",
        description:
          "The three preview photos rise out of the folder with randomized rotation per slot (left leans left, right leans right) on every hover.",
      },
      {
        label: "Sibling dimming",
        description:
          "Hovering one folder adds a disabled state to every other folder, dropping them to the muted palette until the pointer leaves.",
      },
    ],
    editable: [
      {
        name: "folders",
        control: "links",
        description: "Folder index, name, color variant, and three images.",
      },
      {
        name: "navLeft / navRight",
        control: "text",
        description: "The header line above the folder stack.",
      },
    ],
    assets: pageAssets("folder-preview-hover-", 18),
    api: [
      {
        name: "folders",
        type: "{ index: string; name: string; variant: 1 | 2 | 3; images: [string, string, string] }[]",
        default: "6 folders, 18 BLANK-hosted JPGs",
        description: "Rows of two folders with per-folder preview photos.",
      },
      {
        name: "background / textColor",
        type: "string",
        default: '"#f4f7f0" / "#0f0f0f"',
        description: "Page background and folder label color.",
      },
    ],
  },
  "minimap-parallax-scroll": {
    demoPath: "src/components/demos/minimap-parallax-scroll.tsx",
    nuance: [
      {
        label: "Windowed infinity",
        description:
          "Only a buffer of eleven slides exists at once; elements outside the window are removed and recreated as you scroll, so the feed loops forever without growing the DOM.",
      },
      {
        label: "Idle snap",
        description:
          "After 100ms without input the feed eases to the nearest project with a cubic ease-out, and the minimap mirrors the exact same scroll at 250px scale.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "links",
        description: "Title, image, category, and year per project.",
      },
      {
        name: "scrollSpeed / lerpFactor",
        control: "tuple",
        description: "Wheel multiplier and inertia smoothing.",
      },
    ],
    assets: pageAssets("minimap-parallax-scroll-", 5),
    api: [
      {
        name: "projects",
        type: "{ title: string; image: string; category: string; year: string }[]",
        default: "5 BLANK-hosted JPGs",
        description:
          "Looped project entries shown full screen and in the minimap.",
      },
      {
        name: "scrollSpeed / lerpFactor",
        type: "number",
        default: "0.75 / 0.05",
        description: "Wheel delta multiplier and per-frame interpolation.",
      },
    ],
  },
  "scroll-scrub-slider": {
    demoPath: "src/components/demos/scroll-scrub-slider.tsx",
    nuance: [
      {
        label: "Pin-scrubbed steps",
        description:
          "The slider pins for one viewport per slide; crossing a step boundary appends a fresh image that fades and settles from a 1.1 scale, keeping at most three stacked.",
      },
      {
        label: "Rebuilt titles",
        description:
          "Each step replaces the headline and re-splits it into masked lines, so the copy always animates up from a clean state.",
      },
    ],
    editable: [
      {
        name: "slides",
        control: "links",
        description: "Image and headline per step.",
      },
      {
        name: "introText / outroText",
        control: "textarea",
        description: "The full-screen copy before and after the pin.",
      },
    ],
    assets: pageAssets("scroll-scrub-slider-", 7),
    api: [
      {
        name: "slides",
        type: "{ title: string; image: string }[]",
        default: "7 BLANK-hosted JPGs",
        description: "Scrub steps; pin length is one viewport per slide.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "split-card-scroll": {
    demoPath: "src/components/demos/split-card-scroll.tsx",
    nuance: [
      {
        label: "Threshold tweens",
        description:
          "The width scrubs continuously, but the gap split and the flip fire once as tweens when progress crosses 0.35 and 0.7, and reverse when it crosses back.",
      },
      {
        label: "Desktop-only pin",
        description:
          "A gsap.matchMedia gates the whole ScrollTrigger to 1000px and up; below that the cards stack statically with their inline styles cleared.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "links",
        description: "Cover image, label, text, and back color per card.",
      },
      {
        name: "introText / headerText / outroText",
        control: "text",
        description: "The serif copy around the card strip.",
      },
    ],
    assets: pageAssets("split-card-scroll-", 3),
    api: [
      {
        name: "cards",
        type: "[SplitCard, SplitCard, SplitCard]",
        default: "3 BLANK-hosted JPGs",
        description: "Front covers and colored backs of the strip.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "hour-timeline-slider": {
    demoPath: "src/components/demos/hour-timeline-slider.tsx",
    nuance: [
      {
        label: "Elastic hours",
        description:
          "Each click shifts every hour's flex-grow to its neighbor's value, so past hours compress toward zero width while the current hour stretches widest.",
      },
      {
        label: "Recycled slides",
        description:
          "The outgoing slide is re-appended to the end of the deck with its clip-path reset, so the five images loop forever.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "The five looping slides.",
      },
      {
        name: "navLeft / navRight / footerLeft / footerRight",
        control: "text",
        description: "The chrome copy around the slider.",
      },
    ],
    assets: pageAssets("hour-timeline-slider-", 6),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "5 BLANK-hosted JPGs",
        description: "Slides wiped in by the clip-path reveal.",
      },
      {
        name: "duration",
        type: "number",
        default: "1.5",
        description: "Length of the wipe and timeline redistribution.",
      },
    ],
  },
  "drag-timeline-scroll": {
    demoPath: "src/components/demos/drag-timeline-scroll.tsx",
    nuance: [
      {
        label: "Drag maps to travel",
        description:
          "Scrubber progress along the tick timeline maps to minus four screen-widths of container travel, eased with power3 so the page glides after the pointer.",
      },
      {
        label: "Generated ticks",
        description:
          "Fifty tick marks are appended at mount and spaced with justify-content, so the timeline stays evenly divided at any width.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "The nine editorial images across three screens.",
      },
      {
        name: "firstSection / fourthSection",
        control: "textarea",
        description: "Heading and body copy of the two text screens.",
      },
    ],
    assets: pageAssets("drag-timeline-scroll-", 10),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "9 BLANK-hosted JPGs",
        description: "Images split into three horizontal screens.",
      },
      {
        name: "firstSection / fourthSection",
        type: "{ heading: string; body: string }",
        default: "source-inspired copy",
        description:
          "The two text screens; body paragraphs split on blank lines.",
      },
      {
        name: "dragLabel",
        type: "string",
        default: '"Drag"',
        description: "Label inside the timeline scrubber.",
      },
    ],
  },
  "svg-stroke-hover": {
    demoPath: "src/components/demos/svg-stroke-hover.tsx",
    nuance: [
      {
        label: "Stroke reveal",
        description:
          "Each card uses SVG paths with pathLength, so the scribble reveal runs from CSS without measuring path length in JavaScript.",
      },
      {
        label: "Title lift",
        description:
          "The card title stays tucked below the image until hover, then rises into the same frame as the broad strokes.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "links",
        description: "Card titles, image URLs, and accent colors.",
      },
      {
        name: "heading",
        control: "text",
        description: "The large heading above the hover grid.",
      },
    ],
    assets: pageAssets("svg-stroke-hover-", 3),
    api: [
      {
        name: "cards",
        type: "{ title: string; image: string; accent: string }[]",
        default: "6 Compronents-hosted JPGs",
        description: "Image cards and accent stroke colors.",
      },
      {
        name: "heading",
        type: "string",
        default: "The Hover State",
        description: "Large heading rendered above the image grid.",
      },
      {
        name: "background / textColor",
        type: "string",
        default: '"#f2f0eb" / "#111111"',
        description: "Page background and heading color.",
      },
    ],
  },
  "terminal-text-reveal": {
    demoPath: "src/components/demos/terminal-text-reveal.tsx",
    nuance: [
      {
        label: "Scroll parent aware",
        description:
          "The copy measures against the nearest scrolling parent, so it works in the bounded demo stage and fullscreen preview.",
      },
      {
        label: "Word progress",
        description:
          "Each paragraph splits into words and advances through muted, accent, and final colors as the block crosses the viewport.",
      },
    ],
    editable: [
      {
        name: "headline / intro / outro",
        control: "textarea",
        description: "Editorial copy shown around the image sections.",
      },
      {
        name: "services",
        control: "links",
        description: "Service titles, body copy, and image URLs.",
      },
    ],
    assets: pageAssets("terminal-text-reveal-", 4),
    api: [
      {
        name: "introImage / bannerImage",
        type: "string",
        default: "Compronents-hosted JPGs",
        description: "Full-bleed images at the start and middle of the layout.",
      },
      {
        name: "services",
        type: "{ title: string; body: string; image: string }[]",
        default: "4 service sections",
        description: "Text and image pairs used by the reveal sections.",
      },
      {
        name: "initialColor / accentColor / finalColor",
        type: "string",
        default: '"#d5d5d5" / "#abff02" / "#101010"',
        description: "The three colors used during the word reveal pass.",
      },
    ],
  },
  "frame-scroll": {
    demoPath: "src/components/demos/frame-scroll.tsx",
    studioPath: "src/components/studios/frame-scroll.tsx",
    nuance: [
      {
        label: "One pin, phased by hand",
        description:
          "A single pinned ScrollTrigger drives the whole hero in onUpdate. The header lift, the word fade, the copy hide, and the image shrink each own a slice of progress, so they overlap and hand off without a timeline.",
      },
      {
        label: "Image becomes a tile",
        description:
          "The hero photo is full-bleed, then its width, height, and corner radius interpolate down to a small centered tile over the last stretch of the pin, so the frame literally shrinks rather than cutting to the next section.",
      },
      {
        label: "Owns its scroll",
        description:
          "By default it pins and parallaxes inside its own Lenis-smoothed container, so it embeds in a bounded box. Pass embedded={false} to run on the window scroll.",
      },
    ],
    editable: [
      {
        name: "background / textColor",
        control: "color",
        description: "Page surface and the about / outro ink.",
      },
      {
        name: "heroTextColor",
        control: "color",
        description: "Headline and copy color over the hero image.",
      },
      {
        name: "heading / copy / aboutText / outroText",
        control: "text",
        description:
          "The pinned headline, the fading line, and the two panels.",
      },
      {
        name: "heroImage / images",
        control: "asset-url",
        description: `Hero photo and 16 thumbnails, hosted through ${getHostedAssetUrl(
          "frame-scroll/hero.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: frameScrollAssets,
    api: [
      {
        name: "heroImage",
        type: "string",
        default: '"…/frame-scroll/hero.jpg"',
        description: "Full-bleed hero photo that shrinks to a tile.",
      },
      {
        name: "images",
        type: "string[]",
        default: "16 Compronents-hosted JPGs",
        description: "Thumbnails laid into four parallax columns.",
      },
      {
        name: "heading / copy",
        type: "string",
        default: "headline / fading second line",
        description: "The pinned headline and the word-by-word copy line.",
      },
      {
        name: "aboutText / outroText",
        type: "string",
        default: "about line / outro line",
        description: "Copy in the parallax panel and the closing panel.",
      },
      {
        name: "background / textColor / heroTextColor",
        type: "string",
        default: '"#e3e3db" / "#171717" / "#ffffff"',
        description: "Surface, body ink, and the color over the hero image.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "falling-tag-list": {
    demoPath: "src/components/demos/falling-tag-list.tsx",
    studioPath: "src/components/studios/falling-tag-list.tsx",
    nuance: [
      {
        label: "A real physics pile",
        description:
          "On hover the row spins up a Matter.js world with a floor and two walls, drops a body per tag, and copies each body's position and angle onto a DOM pill every frame, so the tags actually tumble and stack instead of animating along a path.",
      },
      {
        label: "Springs, not eases",
        description:
          "The row height, the fanned thumbnails, and the collapse all use elastic easing, so opening and closing overshoot and settle. The drop is delayed a beat so the pills land into an already-open row.",
      },
      {
        label: "Built to be interrupted",
        description:
          "Entering and leaving kill in-flight tweens, fade and clear the pile, and tear down the engine, so flicking across the list never leaves stray pills or a running simulation behind.",
      },
    ],
    editable: [
      {
        name: "background",
        control: "color",
        description: "List backdrop and the chip fill behind each name.",
      },
      {
        name: "nameColor / hoverColor",
        control: "color",
        description: "Resting and active name color.",
      },
      {
        name: "tagColor",
        control: "color",
        description: "Pill text and border color.",
      },
      {
        name: "services",
        control: "asset-url",
        description: `Each service's name, tags, and thumbnails, hosted through ${getHostedAssetUrl(
          "falling-tag-list/service_1_img_1.jpg",
        )} and the rest of the set.`,
      },
    ],
    assets: fallingTagListAssets,
    api: [
      {
        name: "services",
        type: "{ name; tags: string[]; images: string[] }[]",
        default: "Silhouette / Chroma / Persona",
        description: "Each row's name, descriptor tags, and fanned thumbnails.",
      },
      {
        name: "background",
        type: "string",
        default: '"#171717"',
        description: "List background and the chip behind each name.",
      },
      {
        name: "nameColor / hoverColor",
        type: "string",
        default: '"#ff3831" / "#ffffd9"',
        description: "Resting and active name color.",
      },
      {
        name: "tagColor",
        type: "string",
        default: '"#ffffd9"',
        description: "Pill text and border color.",
      },
    ],
  },
  "crt-display": {
    demoPath: "src/components/demos/crt-display.tsx",
    studioPath: "src/components/studios/crt-display.tsx",
    nuance: [
      {
        label: "The screen is a shader",
        description:
          "A curved plane re-UVs a rounded-rect geometry and runs a single fragment shader for the whole tube look: cover-fit, scanlines, aperture mask, vignette, and a chromatic split, so the image always reads as a CRT and never a flat photo.",
      },
      {
        label: "Swap spikes the tear",
        description:
          "Changing the source sets a glitch value to 1, which the frame loop decays exponentially. The shader uses it to drive horizontal hash-tear and RGB noise, so every image change arrives through static instead of cutting.",
      },
      {
        label: "Eased parallax tilt",
        description:
          "The cursor target is lerped every frame and mapped to the monitor group's rotation, so the model leans toward the pointer and glides back rather than tracking it rigidly.",
      },
    ],
    editable: [
      {
        name: "background",
        control: "color",
        description: "Backdrop color behind the monitor.",
      },
      {
        name: "exposure",
        control: "text",
        description: "ACES tone-mapping exposure for the whole scene.",
      },
      {
        name: "projects",
        control: "text",
        description: "Each project's name and the frame it loads on hover.",
      },
      {
        name: "src / defaultImage",
        control: "asset-url",
        description: `Monitor GLB and the resting frame, hosted through ${getHostedAssetUrl(
          "crt-display/monitor.glb",
        )} and the default image.`,
      },
    ],
    assets: crtDisplayAssets,
    api: [
      {
        name: "src",
        type: "string",
        default: '"…/crt-display/monitor.glb"',
        description: "Monitor model URL (.glb / .gltf), same-origin or CORS.",
      },
      {
        name: "defaultImage",
        type: "string",
        default: '"…/crt-display/default.jpg"',
        description: "Frame shown at rest and on pointer leave.",
      },
      {
        name: "projects",
        type: "{ label: string; image: string }[]",
        default: "District / Waypoint / Corridor / Archive / Terminal",
        description: "Project names and the image each loads on hover.",
      },
      {
        name: "background",
        type: "string",
        default: '"#b0b0b0"',
        description: "Backdrop color behind the monitor.",
      },
      {
        name: "exposure",
        type: "number",
        default: "1.25",
        description: "ACES tone-mapping exposure.",
      },
    ],
  },
  "creative-clutter": {
    demoPath: "src/components/demos/creative-clutter.tsx",
    studioPath: "src/components/studios/creative-clutter.tsx",
    nuance: [
      {
        label: "Flip does the work",
        description:
          "Layouts are just sets of percentage coordinates. The component sets the new positions instantly, then GSAP Flip reads the before and after and animates the difference, so adding a layout is data, not animation code.",
      },
      {
        label: "Percent of the board",
        description:
          "Every object and the heading are placed as a fraction of the desk size and re-applied on resize, so the same arrangement holds its composition from a small card to a full screen.",
      },
      {
        label: "Staggered from center",
        description:
          "The transition staggers outward from the middle of the set, so a reflow reads as the desk settling rather than every piece snapping at once.",
      },
    ],
    editable: [
      {
        name: "background / textColor / mutedColor",
        control: "color",
        description: "Board surface, heading ink, and the paragraph tone.",
      },
      {
        name: "surfaceColor / borderColor",
        control: "color",
        description: "The mode button surface and border.",
      },
      {
        name: "heading / paragraph",
        control: "text",
        description: "The floating title and its supporting line.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Eleven cutout props, hosted through ${getHostedAssetUrl(
          "creative-clutter/music.png",
        )} and the rest of the named set.`,
      },
    ],
    assets: creativeClutterAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "11 Compronents-hosted PNGs",
        description:
          "Cutout props in order: music, cd, dialog, folder, macmini, paper, passport, portrait, appicon, lighter, cursor.",
      },
      {
        name: "heading / paragraph",
        type: "string",
        default: '"Creative Clutter" / a short line',
        description: "The floating headline and its supporting copy.",
      },
      {
        name: "background / textColor / mutedColor",
        type: "string",
        default: '"#f5f2ed" / "#171717" / "#5f5f5f"',
        description: "Board background, heading ink, and paragraph tone.",
      },
      {
        name: "surfaceColor / borderColor",
        type: "string",
        default: '"#f5f2ed" / "#e0dfd7"',
        description: "Mode button surface and border colors.",
      },
    ],
  },
  "preloader-reveal": {
    demoPath: "src/components/demos/preloader-reveal.tsx",
    studioPath: "src/components/studios/preloader-reveal.tsx",
    nuance: [
      {
        label: "Two sheets, one wipe",
        description:
          "A black preloader sits over the hero, and a white annotation backdrop sits under it. Both the preloader and the hero's white revealer collapse to the left in sequence, so the eye reads black sheet, then white document, then the hero resolving.",
      },
      {
        label: "The ring is the loader",
        description:
          "Two stacked circles draw with stroke-dashoffset: a muted track and a light progress arc that steps through staged stops, while the whole SVG rotates a quarter turn. It is a real progress gesture, not a spinner.",
      },
      {
        label: "Masked, hand-split text",
        description:
          "Readouts, labels, and the hero headline are split into masked spans in markup, not by a runtime plugin, so each line and word rises from behind its own clip with no layout flash on load.",
      },
    ],
    editable: [
      {
        name: "dark / light / muted",
        control: "color",
        description:
          "Preloader and hero surface, the ring and ink, and the backdrop note tint.",
      },
      {
        name: "heading",
        control: "text",
        description: "Hero headline revealed word by word after the wipe.",
      },
      {
        name: "engageLabel / grantedLabel",
        control: "text",
        description: "Control labels before and after engaging.",
      },
      {
        name: "logo / buttonLogo",
        control: "asset-url",
        description: `Backdrop and control marks, hosted through ${getHostedAssetUrl(
          "preloader-reveal/logo.png",
        )} and the light variant.`,
      },
    ],
    assets: preloaderRevealAssets,
    api: [
      {
        name: "heading",
        type: "string",
        default: '"The system is now visible"',
        description: "Hero headline, revealed word by word after the wipe.",
      },
      {
        name: "engageLabel / grantedLabel",
        type: "string",
        default: '"Engage" / "Access Granted"',
        description: "Boot control labels before and after engaging.",
      },
      {
        name: "initiatingLabel",
        type: "string",
        default: '"Initiating"',
        description: "Small label in the top-left of the preloader.",
      },
      {
        name: "logo / buttonLogo",
        type: "string",
        default: "preloader-reveal/logo.png / logo-light.png",
        description: "Backdrop annotation mark and the boot control mark.",
      },
      {
        name: "dark / light / muted",
        type: "string",
        default: '"#000000" / "#ffffff" / "#7a7a7a"',
        description: "Surface, ring/ink, and backdrop-note colors.",
      },
      {
        name: "loop",
        type: "boolean",
        default: "true",
        description:
          "Auto-run the full sequence on a loop (true) or hold until the control is clicked (false).",
      },
    ],
  },
  "scroll-wave-gallery": {
    demoPath: "src/components/demos/scroll-wave-gallery.tsx",
    studioPath: "src/components/studios/scroll-wave-gallery.tsx",
    nuance: [
      {
        label: "Three waves, one drift",
        description:
          "Each frame's horizontal offset is the sum of a slow base swing, a faster flow, and a fine detail jitter, all keyed to the image's index and its scroll progress, so the column sways like a loose ribbon instead of a rigid grid.",
      },
      {
        label: "Pinch at the crossing",
        description:
          "The clip-path insets from both edges in proportion to distance from the viewport center, squared, so a frame is widest as it passes the middle and clipped to a sliver at the top and bottom of its travel.",
      },
      {
        label: "Owns its scroll",
        description:
          "By default it runs a Lenis-smoothed scroll inside its own container with per-image ScrollTriggers, so it embeds in a bounded box. Pass embedded={false} to drive it from the window scroll.",
      },
    ],
    editable: [
      {
        name: "background / textColor",
        control: "color",
        description: "Page surface and the intro / outro heading ink.",
      },
      {
        name: "introText / outroText",
        control: "text",
        description: "The two headings that bookend the gallery.",
      },
      {
        name: "waveStrength / clipMax",
        control: "text",
        description: "Sway amplitude and the maximum center pinch in percent.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Twelve frames hosted through ${getHostedAssetUrl(
          "scroll-wave-gallery/img-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: scrollWaveGalleryAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "12 Compronents-hosted JPGs",
        description: "Frames stacked top to bottom through the scroll.",
      },
      {
        name: "introText / outroText",
        type: "string",
        default: '"Loose Structure" / "Crafted by BLANK"',
        description: "Headings shown in the intro and outro panels.",
      },
      {
        name: "background / textColor",
        type: "string",
        default: '"#e3e4d8" / "#000000"',
        description: "Page background and heading ink.",
      },
      {
        name: "waveStrength",
        type: "number",
        default: "1",
        description: "Scales the horizontal sway; 0 holds the column straight.",
      },
      {
        name: "clipMax",
        type: "number",
        default: "20",
        description: "Maximum edge pinch at the center crossing, in percent.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "scroll-tunnel-3d": {
    demoPath: "src/components/demos/scroll-tunnel-3d.tsx",
    studioPath: "src/components/studios/scroll-tunnel-3d.tsx",
    nuance: [
      {
        label: "Endless by wrap",
        description:
          "A fixed set of layers wraps in Z with a modulo, so the camera can fall forever through a handful of rings. Far frames re-enter from the back rather than running out.",
      },
      {
        label: "Overlay is the fog",
        description:
          "Depth is faked with a per-layer black overlay, not real fog. Its opacity is a hand-written curve of Z: frames fade in from the far end, hold clear through the visible band, and black out as they pass the lens.",
      },
      {
        label: "One target, three inputs",
        description:
          "Wheel, drag, and idle autoplay all push a single scroll target that is lerped into the current depth, so every input shares the same soft, mechanical follow.",
      },
    ],
    editable: [
      {
        name: "background",
        control: "color",
        description:
          "Tunnel backdrop and the color the depth overlay fades to.",
      },
      {
        name: "title / caption",
        control: "text",
        description: "Optional corner HUD copy laid over the tunnel.",
      },
      {
        name: "scrollSpeed / layerGap / lerp",
        control: "text",
        description: "Input sensitivity, ring spacing, and follow smoothing.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Twelve photos hosted through ${getHostedAssetUrl(
          "scroll-tunnel-3d/img-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: scrollTunnel3dAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "12 Compronents-hosted JPGs",
        description: "Photos ringed four-to-a-layer along the tunnel.",
      },
      {
        name: "title / caption",
        type: "string",
        default: "undefined",
        description: "Optional HUD copy in the lower-left corner.",
      },
      {
        name: "background",
        type: "string",
        default: '"#000000"',
        description: "Tunnel background and depth-overlay color.",
      },
      {
        name: "scrollSpeed / layerGap / lerp",
        type: "number",
        default: "2 / 2500 / 0.07",
        description:
          "Input sensitivity, ring depth spacing (px), and smoothing.",
      },
      {
        name: "radiusX / radiusY",
        type: "number",
        default: "400 / 280",
        description:
          "Ellipse radii (px) the four images ring around each layer.",
      },
      {
        name: "itemWidth / itemHeight",
        type: "number",
        default: "180 / 220",
        description: "Size of each image card in the tunnel, in px.",
      },
      {
        name: "perspective",
        type: "number",
        default: "1000",
        description: "CSS perspective applied to the 3D scene, in px.",
      },
      {
        name: "autoplay / autoplaySpeed",
        type: "boolean / number",
        default: "true / 6",
        description: "Idle forward drift so the tunnel moves before input.",
      },
    ],
  },
  "cappen-fluid-simulation": {
    demoPath: "src/components/demos/cappen-fluid-simulation.tsx",
    studioPath: "src/components/studios/cappen-fluid-simulation.tsx",
    nuance: [
      {
        label: "The canvas is the material",
        description:
          "The text remains ordinary DOM. A transparent WebGL canvas sits above it with mix-blend-mode difference, so the ink reads as an optical layer rather than a background animation.",
      },
      {
        label: "Scoped fluid state",
        description:
          "Renderer, render targets, pointer listeners, resize observer, and rAF loop are all owned by the component and disposed on unmount.",
      },
      {
        label: "Idle splats prevent silence",
        description:
          "The original waits for input. This port seeds the field and adds subtle idle splats so a registry preview is never blank.",
      },
    ],
    editable: [
      {
        name: "headline",
        control: "tuple",
        description: "Three uppercase lines arranged left, right, and center.",
      },
      {
        name: "inkColor / blendMode",
        control: "color",
        description:
          "The shader output color and the CSS compositing mode used over the typography.",
      },
      {
        name: "curl / forceStrength",
        control: "text",
        description:
          "Simulation energy controls: vortex pull and pointer velocity injection.",
      },
    ],
    assets: [],
    api: [
      {
        name: "headline",
        type: "string[]",
        default: '["Fluid System In", "Constant Field", "Of Interaction"]',
        description: "Three hero lines rendered behind the fluid layer.",
      },
      {
        name: "navLinks",
        type: "{ label: string; href: string }[]",
        default: "works / about / updates / start a project",
        description: "Optional mono navigation row.",
      },
      {
        name: "inkColor / background / textColor",
        type: "string",
        default: '"#ffffff" / "#ffffff" / "#000000"',
        description: "Color system for the ink pass and page layer.",
      },
      {
        name: "simResolution / dyeResolution",
        type: "number",
        default: "256 / 1024",
        description: "Render target resolution for velocity and dye fields.",
      },
      {
        name: "curl / forceStrength / splatRadius",
        type: "number",
        default: "50 / 8.5 / 0.3",
        description: "Fluid behavior controls.",
      },
    ],
  },
  "ascii-image-reveal": {
    demoPath: "src/components/demos/ascii-image-reveal.tsx",
    studioPath: "src/components/studios/ascii-image-reveal.tsx",
    nuance: [
      {
        label: "ASCII before image",
        description:
          "The photo is hidden while a canvas version appears cell-by-cell. Only once the glyph grid settles does the real image fade in.",
      },
      {
        label: "Shadows scramble longer",
        description:
          "Darker sampled cells use a denser character subset and continue scrambling, giving silhouettes a noisy darkroom feel.",
      },
      {
        label: "Grid positions matter",
        description:
          "The desktop layout intentionally leaves holes across a 10-column stage. Mobile collapses to a clean two-column gallery.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: `Fifteen images hosted through ${getHostedAssetUrl(
          "ascii-image-reveal/img1.jpg",
        )} and the numbered set.`,
      },
      {
        name: "chars / columns",
        control: "text",
        description: "Glyph ramp and sampling density.",
      },
      {
        name: "glyphColor / canvasBackground",
        control: "color",
        description: "ASCII plate colors before the image reveal.",
      },
    ],
    assets: asciiImageRevealAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "15 Compronents-hosted JPGs",
        description: "Images sampled into the ASCII reveal tiles.",
      },
      {
        name: "chars",
        type: "string",
        default: '"........:::=+xX#0369"',
        description: "Dark-to-bright glyph ramp.",
      },
      {
        name: "columns / fontSize",
        type: "number",
        default: "25 / 14",
        description: "ASCII sampling grid and canvas font size.",
      },
      {
        name: "scrambleCount / scrambleSpeedMs",
        type: "number",
        default: "10 / 100",
        description: "How long dark cells keep cycling random dense glyphs.",
      },
      {
        name: "gap / background",
        type: "string",
        default: '"2rem" / "#111111"',
        description: "Gallery spacing and page background.",
      },
    ],
  },
  "detroit-paris-slider": {
    demoPath: "src/components/demos/detroit-paris-slider.tsx",
    studioPath: "src/components/studios/detroit-paris-slider.tsx",
    nuance: [
      {
        label: "Exponential track",
        description:
          "Slide edges are not linearly spaced. The width grows exponentially as a slide approaches the foreground.",
      },
      {
        label: "One scroll target",
        description:
          "Wheel, drag, and idle motion all push a single target that is lerped into the current scroll for a soft mechanical feel.",
      },
      {
        label: "Images wrap, not clone",
        description:
          "A fixed pool of slide elements changes image source when its stream index wraps back into view.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: `Ten poster images hosted through ${getHostedAssetUrl(
          "detroit-paris-slider/slide-img-1.jpg",
        )} and the numbered set.`,
      },
      {
        name: "title",
        control: "text",
        description: "Large header over the stream.",
      },
      {
        name: "growth / scrollSpeed",
        control: "text",
        description:
          "Exponential spacing strength and pointer/wheel sensitivity.",
      },
    ],
    assets: detroitParisSliderAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "10 Compronents-hosted JPGs",
        description: "Poster images wrapped through the stream.",
      },
      {
        name: "title",
        type: "string",
        default: '"Perpetual Motion"',
        description: "Display title placed over the slider.",
      },
      {
        name: "lerp / scrollSpeed",
        type: "number",
        default: "0.075 / 3.5",
        description: "Smoothing and input sensitivity.",
      },
      {
        name: "minSize / growth / aspect",
        type: "number",
        default: "0.1 / 0.25 / 0.8",
        description: "The math that determines slide sizes along the track.",
      },
      {
        name: "autoplay / autoplaySpeed",
        type: "boolean / number",
        default: "true / 0.004",
        description: "Idle motion so the stream moves before user input.",
      },
    ],
  },
  "portfolio-page": {
    demoPath: "src/components/demos/portfolio-page.tsx",
    studioPath: "src/components/studios/portfolio-page.tsx",
    nuance: [
      {
        label: "The screen is a clip-path",
        description:
          "Home and project are two states of one AnimatePresence. Each enters and exits by animating a polygon clip-path, so the whole screen wipes shut and open instead of routing.",
      },
      {
        label: "Reveal from behind bars",
        description:
          "The wordmark lines sit under masking bars and slide up into view on load, staggered. It reads as type being printed rather than faded in.",
      },
      {
        label: "Grain ties it together",
        description:
          "An inline SVG noise layer animates over everything at a low opacity — no external image — giving the flat colors a filmic texture.",
      },
    ],
    editable: [
      {
        name: "bg / text",
        control: "color",
        description: "Landing backdrop and ink color.",
      },
      {
        name: "projectBg",
        control: "color",
        description: "The project view's background — usually the inverse.",
      },
      {
        name: "projects",
        control: "asset-url",
        description: `Each project's name, copy, and thumbnail — hosted through ${getHostedAssetUrl(
          "portfolio-page/project-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: portfolioPageAssets,
    api: [
      {
        name: "primaryLines / secondaryLines",
        type: "[string, string, string]",
        default: '["blank","visual","dev."] / …',
        description: "The two big landing wordmark columns.",
      },
      {
        name: "projects",
        type: "PortfolioProject[]",
        default: "5 sample projects",
        description:
          "Each { name, category, year, image, description }; click opens the project view.",
      },
      {
        name: "aboutLead / aboutBody",
        type: "string",
        default: "(about this guy) / …",
        description: "The about section's small label and paragraph.",
      },
      {
        name: "socials",
        type: "{ label, href }[]",
        default: "email / twitter / linkedin",
        description: "Links in the about column.",
      },
      {
        name: "credits",
        type: "[string, string, string]",
        default: '"currently creating at|aryank.space" …',
        description: "Three label|value credits in the landing footer.",
      },
      {
        name: "bg / text / projectBg",
        type: "string",
        default: '"#191c1a" / "#b0b0b0" / "#b0b0b0"',
        description: "Landing background, ink, and project-view background.",
      },
    ],
  },
  "material-spotlight": {
    demoPath: "src/components/demos/material-spotlight.tsx",
    studioPath: "src/components/studios/material-spotlight.tsx",
    nuance: [
      {
        label: "A patch, not a new shader",
        description:
          "onBeforeCompile splices four small chunks into MeshStandardMaterial — it keeps all of the standard PBR lighting and only overrides roughness and diffuse inside the sphere of influence.",
      },
      {
        label: "World-space, ray-picked",
        description:
          "The cursor is ray-cast onto a plane to get a world point; the fragment shader measures distance to it, so the spotlight sticks to the surface in 3D rather than sliding across the screen.",
      },
      {
        label: "Eased, never snapped",
        description:
          "Both the hit point and the activation amount lerp every frame, so the spot glides to the cursor and fades out smoothly when the pointer leaves.",
      },
    ],
    editable: [
      {
        name: "background",
        control: "color",
        description: "Clear color behind the model.",
      },
      {
        name: "radius / softness",
        control: "text",
        description:
          "Size of the polished sphere and the feather past its edge.",
      },
      {
        name: "src",
        control: "asset-url",
        description: `GLB model, hosted through ${getHostedAssetUrl(
          "material-spotlight/model.glb",
        )}.`,
      },
    ],
    assets: materialSpotlightAssets,
    api: [
      {
        name: "src",
        type: "string",
        default: '"…/material-spotlight/model.glb"',
        description: "Model URL (.glb / .gltf), same-origin or CORS-enabled.",
      },
      {
        name: "background",
        type: "string",
        default: '"#dddcd7"',
        description: "Clear / background color.",
      },
      {
        name: "radius",
        type: "number",
        default: "0.15",
        description: "Radius of the polished spotlight, in world units.",
      },
      {
        name: "softness",
        type: "number",
        default: "0.35",
        description: "Soft falloff width past the radius.",
      },
      {
        name: "lerp",
        type: "number",
        default: "0.05",
        description:
          "Follow easing for the hit point and activation per frame.",
      },
      {
        name: "exposure",
        type: "number",
        default: "0.65",
        description: "ACES tone-mapping exposure.",
      },
    ],
  },
  "inversa-scroll": {
    demoPath: "src/components/demos/inversa-scroll.tsx",
    studioPath: "src/components/studios/inversa-scroll.tsx",
    nuance: [
      {
        label: "One scroll, many phases",
        description:
          "A single pinned ScrollTrigger drives everything by hand in onUpdate. Each effect — parallax, mask scale, saturation, grid, markers, copy — owns its own slice of progress with smoothstep easing, so they overlap without a timeline.",
      },
      {
        label: "Subtract-mask window",
        description:
          "The dark overlay is masked by a solid layer minus the SVG slats (mask-composite: subtract), so the slats read as a hole. Scaling the mask grows or closes that window.",
      },
      {
        label: "Owns its scroll",
        description:
          "By default it pins inside its own scroll container so it embeds in a bounded box. Pass embedded={false} to run it as a full-page section on the window scroll.",
      },
    ],
    editable: [
      {
        name: "markers[].color",
        control: "color",
        description: "The two pulsing location-marker colors.",
      },
      {
        name: "dark",
        control: "color",
        description: "Backdrop and overlay color.",
      },
      {
        name: "title / blocks / outroText",
        control: "text",
        description:
          "The headline, the three sliding copy blocks, and the outro.",
      },
      {
        name: "heroImage / maskImage / gridImage",
        control: "asset-url",
        description: `Hosted through ${getHostedAssetUrl(
          "inversa-scroll/hero-img.jpg",
        )} and the mask / grid SVGs.`,
      },
    ],
    assets: inversaScrollAssets,
    api: [
      {
        name: "heroImage",
        type: "string",
        default: '"…/inversa-scroll/hero-img.jpg"',
        description:
          "Parallaxing hero photo, masked and desaturated on scroll.",
      },
      {
        name: "maskImage",
        type: "string",
        default: '"…/inversa-scroll/mask.svg"',
        description: "SVG mask scaled to open / close the inverted window.",
      },
      {
        name: "gridImage",
        type: "string",
        default: '"…/inversa-scroll/grid-overlay.svg"',
        description: "Wireframe grid SVG that fades in over the window.",
      },
      {
        name: "title",
        type: "string",
        default: '"Location Framework"',
        description: "The big headline in the first copy block.",
      },
      {
        name: "blocks",
        type: "[InversaBlock, InversaBlock, InversaBlock]",
        default: "Coordinate Mapping / …",
        description: "The three { heading, body } blocks that slide past.",
      },
      {
        name: "markers",
        type: "[InversaMarker, InversaMarker]",
        default: "Anchor / Drift Field",
        description: "Two { label, color, top, left } pulsing markers.",
      },
      {
        name: "outroText",
        type: "string",
        default: '"The system has reached…"',
        description: "Copy in the closing panel.",
      },
      {
        name: "dark / light",
        type: "string",
        default: '"#141414" / "#ffffff"',
        description: "Backdrop/overlay color and text/foreground color.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "award-list": {
    demoPath: "src/components/demos/award-list.tsx",
    studioPath: "src/components/studios/award-list.tsx",
    nuance: [
      {
        label: "Three-state shutter",
        description:
          "Each row is a 240px column clipped to 80px: name, project, name. Hover parks it on the middle (project) band; the exit edge decides whether it settles back up or rolls down to the next name.",
      },
      {
        label: "Scroll keeps up",
        description:
          "A scroll listener re-runs the hit-test against the last cursor position, so a row entered while scrolling still opens and closes correctly instead of sticking.",
      },
      {
        label: "The preview pile",
        description:
          "Hovered rows stack their image in the corner; pause and it collapses to the most recent, leave the list and the whole pile scales away.",
      },
    ],
    editable: [
      {
        name: "nameBackground / nameColor",
        control: "color",
        description: "Resting name-row surface and ink.",
      },
      {
        name: "projectBackground / projectColor",
        control: "color",
        description: "The inverted project band revealed on hover.",
      },
      {
        name: "awards",
        control: "asset-url",
        description: `Each row's name, credit, and image — hosted through ${getHostedAssetUrl(
          "award-list/img1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: awardListAssets,
    api: [
      {
        name: "awards",
        type: "Award[]",
        default: "17 sample awards",
        description:
          "Rows of { name, type, project, label, image }; image lands on the preview pile.",
      },
      {
        name: "heading",
        type: "string",
        default: '"Recognition and awards"',
        description: "Label above the list. Pass empty string to hide.",
      },
      {
        name: "nameBackground",
        type: "string",
        default: '"#e3e3db"',
        description: "Resting name-row background.",
      },
      {
        name: "nameColor",
        type: "string",
        default: '"#000000"',
        description: "Resting name-row text color.",
      },
      {
        name: "projectBackground",
        type: "string",
        default: '"#000000"',
        description: "Hover project-band background.",
      },
      {
        name: "projectColor",
        type: "string",
        default: '"#e3e3db"',
        description: "Hover project-band text color.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "image-reveal": {
    demoPath: "src/components/demos/image-reveal.tsx",
    studioPath: "src/components/studios/image-reveal.tsx",
    nuance: [
      {
        label: "Owns its scroll",
        description:
          "By default it pins inside its own scroll container (custom ScrollTrigger scroller + Lenis wrapper), so it embeds in a bounded box. Pass embedded={false} to drive it from the window instead.",
      },
      {
        label: "Decode band",
        description:
          "The dissolve is a density field: a solid core at the seam scattering to noise at the edges, gated per-cell by a stable hash so the static looks organic instead of uniform.",
      },
      {
        label: "Clip, not crossfade",
        description:
          "Each frame is wiped with a polygon clip-path rather than faded, so the transition has a hard moving edge — the band rides exactly that edge.",
      },
    ],
    editable: [
      {
        name: "dissolveColor",
        control: "color",
        description: "Color of the scattering dissolve characters.",
      },
      {
        name: "dissolveCellSize",
        control: "text",
        description:
          "Cell size in px; smaller is fine static, larger teletext.",
      },
      {
        name: "introText / outroText",
        control: "text",
        description: "Copy in the intro and outro panels.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Stacked frames, hosted through ${getHostedAssetUrl(
          "image-reveal/img-1.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: imageRevealAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "img-1…5 (Compronents assets)",
        description: "Stacked images, revealed top to bottom as you scroll.",
      },
      {
        name: "introText",
        type: "string",
        default: '"Scroll down to decode the craft"',
        description: "Copy shown in the intro panel.",
      },
      {
        name: "outroText",
        type: "string",
        default: '"The rest is under NDA"',
        description: "Copy shown in the outro panel.",
      },
      {
        name: "dissolveColor",
        type: "string",
        default: '"#ff6426"',
        description: "Color of the dissolve characters.",
      },
      {
        name: "dissolveCellSize",
        type: "number",
        default: "16",
        description: "Size of each dissolve cell, in px.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own an internal scroll container (true) or use the window scroll (false).",
      },
    ],
  },
  "mosaic-flip": {
    demoPath: "src/components/demos/mosaic-flip.tsx",
    studioPath: "src/components/studios/mosaic-flip.tsx",
    nuance: [
      {
        label: "Sliced, not tiled",
        description:
          "Every cube paints the same full image with a shifted background-position, so the grid reassembles one picture. The flip turns that picture over rather than swapping a mosaic of thumbnails.",
      },
      {
        label: "Hidden-face swap",
        description:
          "The incoming image is painted onto whichever face is currently turned away, then the grid rotates 180°. You never see the paint happen — only the reveal.",
      },
      {
        label: "Queued hovers",
        description:
          "A reveal in flight parks the next request and runs it on completion, so dragging across the list resolves to the last project instead of stuttering.",
      },
    ],
    editable: [
      {
        name: "tilesX / tilesY",
        control: "text",
        description: "Grid resolution; finer grids ripple, coarser ones plate.",
      },
      {
        name: "tileSize",
        control: "text",
        description: "Cube edge length in px (also sets the 3D depth).",
      },
      {
        name: "edgeColor",
        control: "color",
        description: "Color of the cube top and bottom faces.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Idle + project images, hosted through ${getHostedAssetUrl(
          "mosaic-flip/default.jpg",
        )} and the numbered set.`,
      },
    ],
    assets: mosaicFlipAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "default + img1…6 (Compronents assets)",
        description:
          "Image URLs; index 0 is the idle image, 1…N map to the projects.",
      },
      {
        name: "projects",
        type: "{ label: string }[]",
        default: "NX-09 / Deep Space / …",
        description: "Project names; project i (1-based) reveals images[i].",
      },
      {
        name: "tilesX",
        type: "number",
        default: "12",
        description: "Number of cube columns.",
      },
      {
        name: "tilesY",
        type: "number",
        default: "9",
        description: "Number of cube rows.",
      },
      {
        name: "tileSize",
        type: "number",
        default: "60",
        description: "Cube edge length in px; the 3D depth is half of this.",
      },
      {
        name: "edgeColor",
        type: "string",
        default: '"#222222"',
        description: "Color of the cube top/bottom faces.",
      },
      {
        name: "background",
        type: "string",
        default: '"#171717"',
        description: "Frame background color.",
      },
      {
        name: "perspective",
        type: "number",
        default: "800",
        description: "CSS perspective applied to the 3D scene, in px.",
      },
    ],
  },
  "overlay-menu": {
    demoPath: "src/components/demos/overlay-menu.tsx",
    studioPath: "src/components/studios/overlay-menu.tsx",
    nuance: [
      {
        label: "Layered reveal",
        description:
          "Four curtain panels scaleY in sequence, then the dark surface clip-reveals beneath them. The overlap (a negative timeline offset) is what makes it read as depth rather than a single wipe.",
      },
      {
        label: "Masked line slide",
        description:
          "Each link is split into masked lines that slide up from behind their own clip. The slide is deliberately delayed until the curtains have mostly landed.",
      },
      {
        label: "Wraps your page",
        description:
          "The component is a layout: it renders the bar and overlay over whatever you pass as children, so it composes with an existing hero instead of replacing it.",
      },
    ],
    editable: [
      {
        name: "panelColors",
        control: "tuple",
        description: "The four curtain panel colors, swept in order.",
      },
      {
        name: "menuColor",
        control: "color",
        description: "Menu surface revealed beneath the curtains.",
      },
      {
        name: "togglerColor",
        control: "color",
        description: "Hamburger bar color.",
      },
      {
        name: "logo",
        control: "asset-url",
        description: `Bar logo, hosted through ${getHostedAssetUrl(
          "overlay-menu/logo.png",
        )}.`,
      },
    ],
    assets: overlayMenuAssets,
    api: [
      {
        name: "logo",
        type: "string",
        default: '"…/overlay-menu/logo.png"',
        description: "Logo image shown in the top-left of the bar.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Page / hero content rendered behind the menu.",
      },
      {
        name: "socials",
        type: "{ label, href }[]",
        default: "Bluesky / Pinterest / …",
        description: "Social links column.",
      },
      {
        name: "legal",
        type: "{ label, href }[]",
        default: "Cookie Policy / …",
        description: "Small legal links column.",
      },
      {
        name: "primaryLinks",
        type: "{ label, href }[]",
        default: "Home / Experiments / …",
        description: "Large primary navigation links.",
      },
      {
        name: "secondaryLinks",
        type: "{ label, href }[]",
        default: "Playground / …",
        description: "Mid-size secondary links.",
      },
      {
        name: "panelColors",
        type: "[string, string, string, string]",
        default: '["#57cea5","#063124","#0b5c43","#21ba80"]',
        description: "The four curtain panel colors, swept in order.",
      },
      {
        name: "menuColor",
        type: "string",
        default: '"#084331"',
        description: "Menu surface color revealed under the curtains.",
      },
      {
        name: "togglerColor",
        type: "string",
        default: '"#ffffff"',
        description: "Hamburger bar color.",
      },
    ],
  },
  "ascii-logo": {
    demoPath: "src/components/demos/ascii-logo.tsx",
    studioPath: "src/components/studios/ascii-logo.tsx",
    nuance: [
      {
        label: "Image fidelity",
        description:
          "Every glyph comes from a sampled pixel, so the source needs real contrast against the threshold. The canvas reads pixels back, so keep it same-origin or CORS-open.",
      },
      {
        label: "Spring, not snap",
        description:
          "The cursor pushes glyphs out and a spring pulls them home. Stiffness and damping decide whether the wordmark ripples or violently scatters.",
      },
      {
        label: "Density is brightness",
        description:
          "The glyph ramp maps low-to-high brightness; denser characters read as brighter pixels, so the ramp order is the contrast curve.",
      },
    ],
    editable: [
      {
        name: "charColor / gridColor / background",
        control: "color",
        description:
          "Lit glyphs, the resting dot grid, and the frame backdrop.",
      },
      {
        name: "chars",
        control: "text",
        description: "Glyph ramp, ordered dark to bright.",
      },
      {
        name: "pushForce",
        control: "text",
        description: "How hard the cursor scatters nearby glyphs.",
      },
      {
        name: "src",
        control: "asset-url",
        description: `Sampled wordmark, hosted through ${getHostedAssetUrl(
          "ascii-logo/logo.png",
        )}.`,
      },
    ],
    assets: asciiLogoAssets,
    api: [
      {
        name: "src",
        type: "string",
        default: '"https://ui.aryank.space/assets/ascii-logo/logo.png"',
        description:
          "Logo image, sampled into glyphs. Same-origin or CORS-enabled.",
      },
      {
        name: "background",
        type: "string",
        default: '"#0f0f0f"',
        description: "Frame background color.",
      },
      {
        name: "gridColor",
        type: "string",
        default: '"#171717"',
        description: "Resting dot-grid color.",
      },
      {
        name: "charColor",
        type: "string",
        default: '"#dadada"',
        description: "Lit glyph color.",
      },
      {
        name: "chars",
        type: "string",
        default: '".:+*#%@0369"',
        description: "Glyph ramp, dark to bright.",
      },
      {
        name: "threshold",
        type: "number",
        default: "0.5",
        description: "Brightness (0–1) a pixel must clear to become a glyph.",
      },
      {
        name: "cellSize / cellGap",
        type: "number",
        default: "8 / 2",
        description: "Glyph cell size and gap in px on desktop.",
      },
      {
        name: "mobileCellSize / mobileCellGap",
        type: "number",
        default: "3 / 1",
        description: "Cell size and gap below mobileBreakpoint.",
      },
      {
        name: "mobileBreakpoint",
        type: "number",
        default: "768",
        description:
          "Viewport width under which the denser mobile grid kicks in.",
      },
      {
        name: "pushRadius",
        type: "number",
        default: "5",
        description: "Cursor influence radius, in cells.",
      },
      {
        name: "pushForce",
        type: "number",
        default: "30",
        description: "Strength of the cursor push.",
      },
      {
        name: "spring",
        type: "number",
        default: "0.025",
        description: "Spring stiffness pulling glyphs back home.",
      },
      {
        name: "damping",
        type: "number",
        default: "0.5",
        description: "Velocity damping per frame.",
      },
      {
        name: "flickerMs",
        type: "number",
        default: "50",
        description: "Interval at which lit glyphs reshuffle their character.",
      },
      {
        name: "logoScale",
        type: "number",
        default: "75",
        description: "Logo width as a percentage of the container.",
      },
    ],
  },
  "accordion-frames": {
    demoPath: "src/components/demos/accordion-frames.tsx",
    studioPath: "src/components/studios/accordion-frames.tsx",
    nuance: [
      {
        label: "No animation library",
        description:
          "Every move is one CSS transition on left/width. The component only computes geometry — the browser does the easing, so it stays cheap even with twenty panels.",
      },
      {
        label: "Centered as a set",
        description:
          "The strip is sized for exactly one open panel and centered as a whole, so it never jumps. The focused slat widens in place while the rest compress, and the indicator beams track wherever it lands.",
      },
      {
        label: "Touch vs. hover",
        description:
          "Below the breakpoint the layout thins to fewer panels and focus switches from hover to tap, so the accordion stays usable on a phone.",
      },
    ],
    editable: [
      {
        name: "accentColor",
        control: "color",
        description: "Focus indicator border and the vertical beam color.",
      },
      {
        name: "background",
        control: "color",
        description: "Frame backdrop behind the panels.",
      },
      {
        name: "expandedWidth",
        control: "text",
        description: "Open-panel width in px; the resting slats stay thin.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `Panel images, hosted through ${getHostedAssetUrl(
          "accordion-frames/spotlight-1.jpg",
        )} and the rest of the numbered set.`,
      },
    ],
    assets: accordionFramesAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "spotlight-1…20 (Compronents assets)",
        description:
          "Panel image URLs. The accordion shows up to desktopCount of them.",
      },
      {
        name: "desktopCount",
        type: "number",
        default: "20",
        description: "How many panels to show on wide viewports.",
      },
      {
        name: "mobileCount",
        type: "number",
        default: "10",
        description: "How many panels to show below mobileBreakpoint.",
      },
      {
        name: "expandedWidth",
        type: "number",
        default: "400",
        description: "Open-panel width in px on desktop.",
      },
      {
        name: "mobileExpandedWidth",
        type: "number",
        default: "100",
        description: "Open-panel width in px on mobile.",
      },
      {
        name: "collapsedWidth",
        type: "number",
        default: "20",
        description: "Resting slat width in px.",
      },
      {
        name: "gap",
        type: "number",
        default: "5",
        description: "Gap between slats in px.",
      },
      {
        name: "panelHeight",
        type: "number",
        default: "400",
        description: "Track height in px on desktop.",
      },
      {
        name: "mobilePanelHeight",
        type: "number",
        default: "260",
        description: "Track height in px on mobile.",
      },
      {
        name: "mobileBreakpoint",
        type: "number",
        default: "1000",
        description: "Viewport width under which the mobile layout applies.",
      },
      {
        name: "defaultFocus",
        type: "number",
        default: "0",
        description: "Index of the panel open on first paint.",
      },
      {
        name: "focusIndicator",
        type: "boolean",
        default: "true",
        description: "Draw the bordered focus box with the vertical beams.",
      },
      {
        name: "accentColor",
        type: "string",
        default: '"#ffffff"',
        description: "Focus indicator and beam color.",
      },
      {
        name: "background",
        type: "string",
        default: '"#0f0f0f"',
        description: "Frame background color.",
      },
    ],
  },
  "animated-footer": {
    demoPath: "src/components/demos/animated-footer.tsx",
    studioPath: "src/components/studios/animated-footer.tsx",
    nuance: [
      {
        label: "Image fidelity",
        description:
          "The hand photos are not decorative; their contrast determines every ASCII cell. Keep CORS open so the canvas can sample pixels.",
      },
      {
        label: "Reveal behavior",
        description:
          "Fullscreen mode owns scroll with Lenis and GSAP. Embedded mode avoids scroll hijacking and reveals from an IntersectionObserver.",
      },
      {
        label: "Color dramaturgy",
        description:
          "The base glyph color should stay low and earthen while hover color carries the heat of the interaction.",
      },
    ],
    editable: [
      {
        name: "heading",
        control: "tuple",
        description:
          "Two wordmark halves, tuned independently so narrow names still hold the footer edges.",
      },
      {
        name: "description",
        control: "textarea",
        description:
          "The studio paragraph in the upper-right; short copy preserves the wide empty field.",
      },
      {
        name: "links",
        control: "links",
        description:
          "Four compact nav links work best because the line reveal has room to breathe.",
      },
      {
        name: "charColor",
        control: "color",
        description: "Resting ASCII glyph color.",
      },
      {
        name: "hoverColor",
        control: "color",
        description: "Lit cluster fill color.",
      },
      {
        name: "leftImage/rightImage",
        control: "asset-url",
        description: `Hosted through ${getHostedAssetUrl(
          "animated-footer/blank-hand-right.png",
        )} and the matching right-hand route.`,
      },
    ],
    assets: animatedFooterAssets,
    api: [
      {
        name: "heading",
        type: "[string, string]",
        default: '["Blank", "Space"]',
        description:
          "The big two-part wordmark, shown bottom-left and bottom-right.",
      },
      {
        name: "links",
        type: "{ label: string; href: string }[]",
        default: "Work / About / Writing / Contact",
        description: "Nav links rendered in the top-left.",
      },
      {
        name: "description",
        type: "string",
        default: '"Blank — a software developer…"',
        description: "Short studio paragraph rendered in the top-right.",
      },
      {
        name: "leftImage",
        type: "string",
        default:
          '"https://ui.aryank.space/assets/animated-footer/blank-hand-right.png"',
        description:
          "Left hand image, sampled into ASCII. Defaults to the Compronents asset route backed by Vercel Blob.",
      },
      {
        name: "rightImage",
        type: "string",
        default:
          '"https://ui.aryank.space/assets/animated-footer/blank-hand-left.png"',
        description:
          "Right hand image, sampled into ASCII. Defaults to the Compronents asset route backed by Vercel Blob.",
      },
      {
        name: "charColor",
        type: "string",
        default: '"#803500"',
        description: "Base color of the resting ASCII glyphs.",
      },
      {
        name: "hoverColor",
        type: "string",
        default: '"#ff6a00"',
        description: "Color of the glyph clusters lit under the cursor.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "false",
        description:
          "Contain the footer to a bounded, relatively-positioned parent (absolute + reveal-on-enter) instead of taking over the viewport.",
      },
    ],
  },
  "counter-star-loader": {
    demoPath: "src/components/demos/counter-star-loader.tsx",
    nuance: [
      {
        label: "Odometer walk",
        description:
          "The digit strip slides in six power4 steps while the clipped wrapper simultaneously walks one sixth of the free width per step, so the counter both rolls and travels across the bottom edge.",
      },
      {
        label: "Star wipe handoff",
        description:
          "Three stars scale to 45x on staggered delays in white, lime, then black; the last one's onComplete hides the loader, so the final black star becomes the page background.",
      },
    ],
    editable: [
      {
        name: "digitsLeft / digitsRight",
        control: "tuple",
        description: "The six-digit values in each odometer column.",
      },
      {
        name: "headline / infoLines / revealerColors",
        control: "text",
        description: "The 3D headline, corner info lines, and star colors.",
      },
    ],
    assets: [],
    api: [
      {
        name: "digitsLeft / digitsRight",
        type: "[number x6]",
        default: "9 8 7 4 2 0 / 9 5 9 7 4 0",
        description: "Digit values shown in the two rolling columns.",
      },
      {
        name: "headline",
        type: "string",
        default: '"HauteMuse"',
        description: "The headline that swings in from a 3D rotation.",
      },
      {
        name: "revealerColors",
        type: "[string, string, string]",
        default: "white, lime, black",
        description: "Fills of the three scaling star revealers.",
      },
    ],
  },
  "inversion-lens-hover": {
    demoPath: "src/components/demos/inversion-lens-hover.tsx",
    nuance: [
      {
        label: "Turbulent lens edge",
        description:
          "The mask is a distance step whose threshold is perturbed by 8-octave time-scrolling turbulence, so the lens boundary is never a clean circle but a churning organic edge.",
      },
      {
        label: "Eased open and close",
        description:
          "Cursor position and lens radius both lerp toward their targets; leaving the element or scrolling it out of view (via IntersectionObserver) drives the radius back to zero so the lens closes smoothly.",
      },
    ],
    editable: [
      {
        name: "maskRadius / turbulenceIntensity",
        control: "tuple",
        description: "Lens size and how ragged its edge churns.",
      },
      {
        name: "maskSpeed / lerpFactor",
        control: "tuple",
        description: "Turbulence scroll speed and cursor easing.",
      },
    ],
    assets: assetsByIds(["inversion-lens-hover-portrait"]),
    api: [
      {
        name: "src",
        type: "string",
        default: "BLANK-hosted JPEG",
        description: "Image inverted inside the lens.",
      },
      {
        name: "maskRadius / turbulenceIntensity / maskSpeed",
        type: "number",
        default: "0.15 / 0.075 / 0.75",
        description: "Lens radius, edge turbulence, and churn speed.",
      },
      {
        name: "lerpFactor / radiusLerpSpeed",
        type: "number",
        default: "0.05 / 0.1",
        description: "Cursor follow easing and lens open/close easing.",
      },
    ],
  },
  "line-rise-text": {
    demoPath: "src/components/demos/line-rise-text.tsx",
    nuance: [
      {
        label: "Indent-aware split",
        description:
          "Blocks with a text-indent have the indent moved onto the first split line as padding, then cleared on the element, so only the opening line stays indented after the mask split.",
      },
      {
        label: "Grouped reveals",
        description:
          "A copy block can wrap several children; they split together and their lines share one scroll trigger, so a whole paragraph group rises as a single staggered sequence.",
      },
      {
        label: "Portrait opening",
        description:
          "The central portrait begins enlarged inside a tight inset clip, then opens to its full frame as its section crosses the viewport center.",
      },
    ],
    editable: [
      {
        name: "brand",
        control: "text",
        description: "Studio name used across the nav, story, and footer.",
      },
      {
        name: "heroImage / aboutImage",
        control: "asset-url",
        description: "The hero backdrop and the portrait panel.",
      },
    ],
    assets: assetsByIds(["line-rise-text-hero", "line-rise-text-about"]),
    api: [
      {
        name: "heroImage / aboutImage",
        type: "string",
        default: "BLANK-hosted JPGs",
        description: "Hero backdrop and mid-page portrait.",
      },
      {
        name: "brand",
        type: "string",
        default: '"Greyloom"',
        description: "Studio name woven through the copy.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "mask-reveal-preloader": {
    demoPath: "src/components/demos/mask-reveal-preloader.tsx",
    nuance: [
      {
        label: "SVG mask cut-out",
        description:
          "The reveal layer composites a solid fill against the capsule SVG with mask-composite, so the shape is a hole in the fill; scaling that layer to 6x grows the hole until the hero shows through.",
      },
      {
        label: "Nested onStart timeline",
        description:
          "When the pill buttons pop in, their onStart appends icon clip-path and label tweens to the same timeline with negative delays, so the icon fills and label rises overlap the button scaling.",
      },
    ],
    editable: [
      {
        name: "maskShape",
        control: "asset-url",
        description: "The SVG whose shape is cut from the reveal fill.",
      },
      {
        name: "headline / footerHeading / footerText",
        control: "text",
        description: "The hero copy revealed after the mask.",
      },
    ],
    assets: assetsByIds([
      "mask-reveal-preloader-hero",
      "mask-reveal-preloader-mask",
    ]),
    api: [
      {
        name: "heroImage / maskShape",
        type: "string",
        default: "BLANK-hosted JPG / SVG",
        description: "Revealed hero and the capsule mask shape.",
      },
      {
        name: "logo / headline",
        type: "string",
        default: '"Obsidian"',
        description: "Preloader logo and hero headline.",
      },
      {
        name: "contactLabel / menuLabel",
        type: "string",
        default: '"Contact" / "Menu"',
        description: "Labels on the two pill buttons.",
      },
    ],
  },
  "converging-search-scroll": {
    demoPath: "src/components/demos/converging-search-scroll.tsx",
    nuance: [
      {
        label: "Phased single pin",
        description:
          "One pinned ScrollTrigger drives the whole sequence off progress bands: 0 to 0.5 converges the pills, 0.5 to 0.75 grows the search bar, 0.75 to 1 fades in the final header, all from a single scrub.",
      },
      {
        label: "Measured pill morph",
        description:
          "Each pill's starting box is measured on mount, then width, height, radius, and border are interpolated to a 3rem dot, so every label collapses into the same rounded target regardless of its text length.",
      },
    ],
    editable: [
      {
        name: "features",
        control: "links",
        description: "The scattered feature pill labels.",
      },
      {
        name: "spotlightText / headerText / searchLabel",
        control: "text",
        description: "The copy across the three phases.",
      },
    ],
    assets: assetsByIds(["converging-search-scroll-mesh"]),
    api: [
      {
        name: "features",
        type: "string[]",
        default: "7 feature labels",
        description:
          "Pills placed at fixed start points that converge to center.",
      },
      {
        name: "meshImage",
        type: "string",
        default: "BLANK-hosted PNG",
        description: "Faint mesh behind the spotlight line.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "model-menu-3d": {
    demoPath: "src/components/demos/model-menu-3d.tsx",
    nuance: [
      {
        label: "Auto-framed model",
        description:
          "The GLB is measured with a bounding box on load, then centered and pushed back by a multiple of its largest dimension, so any model you drop in is framed the same way without hand-tuning the camera.",
      },
      {
        label: "Cursor light and tilt",
        description:
          "The pointer drives both an eased parallax rotation of the model and a point light that trails the cursor in the scene, so the object catches light as it turns toward you.",
      },
    ],
    editable: [
      {
        name: "menuItems",
        control: "links",
        description: "The menu labels with the gradient hover wipe.",
      },
      {
        name: "modelSrc / heroImage",
        control: "asset-url",
        description: "The GLB object and the hero background.",
      },
    ],
    assets: assetsByIds(["model-menu-3d-model", "model-menu-3d-hero"]),
    api: [
      {
        name: "modelSrc",
        type: "string",
        default: "BLANK-hosted GLB",
        description: "The 3D object framed behind the menu links.",
      },
      {
        name: "menuItems",
        type: "string[]",
        default: "8 menu labels",
        description: "Links shown when the overlay is open.",
      },
      {
        name: "canvasBg",
        type: "string",
        default: '"#1a1a1a"',
        description: "Scene background behind the model.",
      },
    ],
  },
  "name-preloader-reveal": {
    demoPath: "src/components/demos/name-preloader-reveal.tsx",
    nuance: [
      {
        label: "Split-then-reunite name",
        description:
          "Every letter starts offset up or down by parity and settles, then all but the first and last letters leave again while those two slide to the measured center and the name scales into a corner mark.",
      },
      {
        label: "Blend-mode handoff",
        description:
          "Once the letters meet, the header switches to mix-blend-mode difference and shrinks, so the mark inverts against whatever hero content sits behind it.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "The four stacked preloader portraits.",
      },
      {
        name: "name / caption / headingLines",
        control: "text",
        description: "The reveal name, caption, and hero heading rows.",
      },
    ],
    assets: pageAssets("name-preloader-reveal-", 4),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "4 BLANK-hosted JPGs",
        description: "Portraits clipped open in sequence in the center.",
      },
      {
        name: "name",
        type: "string",
        default: '"Dorian Valez"',
        description: "The name split into the reuniting character mark.",
      },
      {
        name: "headingLines",
        type: "string[]",
        default: "3 hero lines",
        description: "The hero headline rows revealed after the preloader.",
      },
    ],
  },
  "fractal-glass-hover": {
    demoPath: "src/components/demos/fractal-glass-hover.tsx",
    nuance: [
      {
        label: "Sampled refraction",
        description:
          "Each stripe's offset is the average of 11 samples of a mod-based displacement, giving the fluted edges a soft, glassy falloff instead of hard steps.",
      },
      {
        label: "Distortion-weighted parallax",
        description:
          "The cursor parallax is multiplied by the local distortion factor, so the image shifts more through the thickest part of the flute and the glass feels physically responsive.",
      },
    ],
    editable: [
      {
        name: "stripesFrequency / glassStrength",
        control: "tuple",
        description: "Number of flutes and refraction strength.",
      },
      {
        name: "parallaxStrength / lerpFactor",
        control: "tuple",
        description: "Cursor parallax amount and easing.",
      },
    ],
    assets: assetsByIds(["fractal-glass-hover-hero"]),
    api: [
      {
        name: "imgSrc",
        type: "string",
        default: "BLANK-hosted JPG",
        description: "Image refracted through the glass.",
      },
      {
        name: "stripesFrequency / glassStrength / glassSmoothness",
        type: "number",
        default: "35 / 2.0 / 0.0001",
        description: "Flute count, refraction strength, and edge softness.",
      },
      {
        name: "parallaxStrength / distortionMultiplier / lerpFactor",
        type: "number",
        default: "0.1 / 10 / 0.035",
        description:
          "Cursor parallax amount, distortion weighting, and easing.",
      },
    ],
  },
  "preloader-panel-reveal": {
    demoPath: "src/components/demos/preloader-panel-reveal.tsx",
    nuance: [
      {
        label: "Stepped panel growth",
        description:
          "The center square is not one tween: it steps through 0.1, 0.25, 0.5, 0.75, then 1 with different eases, so the fill lands in deliberate stages rather than one smooth push.",
      },
      {
        label: "Glitch counter",
        description:
          "The NN counter jumps by a random 5 to 30 each tick, clamped to the elapsed-time target, so it stutters upward to 100 instead of counting evenly.",
      },
    ],
    editable: [
      {
        name: "navLinks / copyColumns",
        control: "links",
        description: "Nav items and the two preloader copy columns.",
      },
      {
        name: "logo / productName / productLink",
        control: "text",
        description: "The wordmark and the hero product card copy.",
      },
    ],
    assets: assetsByIds(["preloader-panel-reveal-hero"]),
    api: [
      {
        name: "heroImage",
        type: "string",
        default: "BLANK-hosted JPG",
        description: "Hero image revealed behind the preloader.",
      },
      {
        name: "copyColumns",
        type: "[string, string]",
        default: "Two studio blurbs",
        description: "The two masked copy columns in the preloader.",
      },
      {
        name: "navLinks",
        type: "string[]",
        default: "4 nav items",
        description: "Links in the revealed nav bar.",
      },
    ],
  },
  "block-reveal-text": {
    demoPath: "src/components/demos/block-reveal-text.tsx",
    nuance: [
      {
        label: "Wipe then retract",
        description:
          "Each line's bar scales in from the left to cover the line, the line is flipped to visible under it, then the bar's origin switches to the right and it scales back out, so the reveal reads as a bar sliding through.",
      },
      {
        label: "Line-wrapped SplitText",
        description:
          "SplitText breaks each block into lines, then each line is wrapped in a positioned container that hosts its own reveal bar; the wrappers are unwound on cleanup so the DOM is left as it started.",
      },
    ],
    editable: [
      {
        name: "sections",
        control: "links",
        description: "Ordered image, heading, and body blocks.",
      },
      {
        name: "stagger / duration",
        control: "tuple",
        description: "Per-line delay and bar wipe duration.",
      },
    ],
    assets: pageAssets("block-reveal-text-", 4),
    api: [
      {
        name: "sections",
        type: "RevealSection[]",
        default: "7 mixed image/copy blocks",
        description:
          "The page composition; copy blocks carry a reveal-bar color.",
      },
      {
        name: "stagger / duration",
        type: "number",
        default: "0.15 / 0.75",
        description: "Line stagger and wipe duration in seconds.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container and scope the fixed nav to it; set false for a viewport-fixed nav on window scroll.",
      },
    ],
  },
  "landing-counter-reveal": {
    demoPath: "src/components/demos/landing-counter-reveal.tsx",
    nuance: [
      {
        label: "Diamond clip-path",
        description:
          "The hero opens in two clip-path stages on a custom 0.9,0,0.1,1 ease: first to a centered diamond while the image scales, then to the full rectangle as it settles back to 1x.",
      },
      {
        label: "Masked SplitText",
        description:
          "Headline chars, nav words, and footer words are split with masking so they slide up and in from behind their own overflow edge; the counter itself is re-split into digits to slide out.",
      },
    ],
    editable: [
      {
        name: "navLinks / footerTags",
        control: "links",
        description: "The nav items and the three footer tags.",
      },
      {
        name: "logo / headline",
        control: "text",
        description: "The wordmark and the large hero headline.",
      },
    ],
    assets: assetsByIds(["landing-counter-reveal-hero"]),
    api: [
      {
        name: "heroImage",
        type: "string",
        default: "BLANK-hosted JPG",
        description: "Image revealed by the clip-path stages.",
      },
      {
        name: "navLinks / footerTags",
        type: "string[]",
        default: "5 nav items / 3 tags",
        description: "Nav links and footer tag words.",
      },
      {
        name: "headline",
        type: "string",
        default: '"Canon"',
        description: "The large hero headline split into sliding characters.",
      },
    ],
  },
  "webgl-dissolve-scroll": {
    demoPath: "src/components/demos/webgl-dissolve-scroll.tsx",
    nuance: [
      {
        label: "fbm dissolve edge",
        description:
          "The fragment shader compares each pixel's y against scroll progress plus a fractal-noise offset, so the wash eats across the image with a ragged, organic edge instead of a straight line.",
      },
      {
        label: "Word-by-word copy",
        description:
          "The body headline is split into word spans and each owns a slice of the copy block's scroll, fading in in sequence rather than all at once.",
      },
    ],
    editable: [
      {
        name: "dissolveColor / spread / speed",
        control: "tuple",
        description: "Wash color, noise displacement, and scroll multiplier.",
      },
      {
        name: "eyebrow / headerText / bodyText / aboutText",
        control: "textarea",
        description: "The layered hero and about copy.",
      },
    ],
    assets: assetsByIds(["webgl-dissolve-scroll-hero"]),
    api: [
      {
        name: "heroImage",
        type: "string",
        default: "BLANK-hosted JPG",
        description: "Image dissolved by the WebGL field.",
      },
      {
        name: "dissolveColor / spread / speed",
        type: "string / number / number",
        default: '"#ebf5df" / 0.5 / 2',
        description:
          "Wash color, edge noise amount, and scroll-to-dissolve rate.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "expanding-navbar-reveal": {
    demoPath: "src/components/demos/expanding-navbar-reveal.tsx",
    nuance: [
      {
        label: "FLIP logo handoff",
        description:
          "The logo's before and after layout is captured with GSAP Flip, then driven by scroll progress, so it travels smoothly from the card's bottom center to the pinned top bar without a layout jump.",
      },
      {
        label: "Scoped when embedded",
        description:
          "In embedded mode the root gets a transform so its position:fixed navbar is contained to the bounded stage instead of the whole viewport; drop embedded for a true full-page fixed navbar.",
      },
    ],
    editable: [
      {
        name: "leftLinks / rightLinks",
        control: "links",
        description: "The two navbar link pairs.",
      },
      {
        name: "backdropImage / logoImage",
        control: "asset-url",
        description: "The revealed image and the FLIPping wordmark.",
      },
    ],
    assets: assetsByIds([
      "expanding-navbar-reveal-backdrop",
      "expanding-navbar-reveal-logo",
    ]),
    api: [
      {
        name: "backdropImage / logoImage",
        type: "string",
        default: "BLANK-hosted JPG / SVG",
        description: "Revealed backdrop and the navbar wordmark.",
      },
      {
        name: "leftLinks / rightLinks",
        type: "[NavLink, NavLink]",
        default: "Index/Studio and Archive/Connect",
        description: "The link pairs flanking the logo.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container and scope the fixed navbar to it; set false to ride the window scroll with a viewport-fixed navbar.",
      },
    ],
  },
  "block-page-transition": {
    demoPath: "src/components/demos/block-page-transition.tsx",
    nuance: [
      {
        label: "Two-sided row wipe",
        description:
          "Four rows scale from the left with a 75ms stagger, hold while the scene swaps, then collapse toward the right with the same cadence.",
      },
      {
        label: "Masked wordmark",
        description:
          "GSAP SplitText masks the transition wordmark by word and overlaps its rise with the incoming rows, matching the source timing.",
      },
    ],
    editable: [
      {
        name: "scenes",
        control: "links",
        description: "Navigation label and Blob image for each scene.",
      },
      {
        name: "brand / transitionText",
        control: "text",
        description: "Top-left brand and the wordmark shown during each wipe.",
      },
    ],
    assets: assetsByIds([
      "block-page-transition-img-1",
      "block-page-transition-img-2",
      "block-page-transition-img-3",
    ]),
    api: [
      {
        name: "scenes",
        type: "BlockPageTransitionScene[]",
        default: "Genesis, Threshold, Sanctum",
        description: "Full-screen scenes switched by the navigation.",
      },
      {
        name: "brand / transitionText",
        type: "string",
        default: '"Emberfall" / "BLANK Studio"',
        description: "Persistent navigation brand and transition overlay copy.",
      },
    ],
  },
  "magnetic-spotlight-marquee": {
    demoPath: "src/components/demos/magnetic-spotlight-marquee.tsx",
    nuance: [
      {
        label: "Pointer-led strip",
        description:
          "The marquee loops at the source speed while its vertical center eases toward the pointer inside the original 175-pixel edge limits.",
      },
      {
        label: "Velocity wake",
        description:
          "Every SplitText line reacts independently to the strip velocity and proximity, then settles toward the lifted content position using the original constants.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "Six photographs in the repeating marquee set.",
      },
      {
        name: "title / tagline / copy / footer",
        control: "text",
        description: "Studio heading and supporting copy moved by the strip.",
      },
    ],
    assets: assetsByIds(
      Array.from(
        { length: 6 },
        (_, i) => `magnetic-spotlight-marquee-img-${i + 1}`,
      ),
    ),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "6 BLANK-hosted JPGs",
        description: "Images cloned into the infinite horizontal track.",
      },
      {
        name: "title / tagline / email / socialLinks",
        type: "string",
        default: "BLANK studio copy",
        description: "Primary identity and navigation copy.",
      },
      {
        name: "copy / footer",
        type: "[string, string] / string",
        default: "BLANK studio copy",
        description: "Body columns and centered footer description.",
      },
    ],
  },
  "stroke-wipe-spotlight": {
    demoPath: "src/components/demos/stroke-wipe-spotlight.tsx",
    nuance: [
      {
        label: "Outlined draw order",
        description:
          "Each source stroke is cloned into a dark outline, then both layers draw in the original alternating order with the same stagger, timing wobble, and duration cycle.",
      },
      {
        label: "Covered-frame handoff",
        description:
          "The centered copy swaps only when the longest stroke fully covers the stage; the reverse erase and three sparkle pops share that exact timeline position.",
      },
    ],
    editable: [
      {
        name: "intro / beforeTitle / beforeCopy",
        control: "text",
        description: "Opening panel and first pinned message.",
      },
      {
        name: "afterTitle / afterCopy / outro",
        control: "text",
        description: "Covered-frame message and closing panel.",
      },
    ],
    assets: [],
    api: [
      {
        name: "intro / beforeTitle / beforeCopy",
        type: "string",
        default: "Source copy",
        description: "Opening panel and message visible before the wipe.",
      },
      {
        name: "afterTitle / afterCopy / outro",
        type: "string",
        default: "Source copy",
        description: "Message revealed beneath the strokes and closing panel.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to use the window scroll.",
      },
    ],
  },
  "circle-preloader-hero": {
    demoPath: "src/components/demos/circle-preloader-hero.tsx",
    nuance: [
      {
        label: "Four-circle reveal",
        description:
          "Four full-screen circles expand with a 250ms stagger, reproducing the source color cadence before the floating item sequence begins.",
      },
      {
        label: "Layered handoff",
        description:
          "The item exits overlap the logo, navigation, elastic headline characters, footer lines, orange plate, and hero image so the preloader resolves into the final composition without a blank frame.",
      },
    ],
    editable: [
      {
        name: "itemImages / logoImage / heroImage",
        control: "asset-url",
        description: "Floating cutouts, logo, and plated hero image.",
      },
      {
        name: "navLinks / heading / footer",
        control: "text",
        description: "Restaurant navigation and hero copy.",
      },
    ],
    assets: assetsByIds([
      "circle-preloader-hero-item-1",
      "circle-preloader-hero-item-2",
      "circle-preloader-hero-item-3",
      "circle-preloader-hero-item-4",
      "circle-preloader-hero-item-6",
      "circle-preloader-hero-logo",
    ]),
    api: [
      {
        name: "itemImages",
        type: "string[]",
        default: "4 BLANK-hosted PNGs",
        description: "Cutout images thrown across the preloader.",
      },
      {
        name: "logoImage / heroImage",
        type: "string",
        default: "BLANK-hosted PNGs",
        description: "Centered brand mark and final plated centerpiece.",
      },
      {
        name: "navLinks / heading / footer",
        type: "string[] / string / [string, string]",
        default: "Restaurant copy",
        description: "Text revealed after the preloader exits.",
      },
    ],
  },
  "wordmark-spotlight-scroll": {
    demoPath: "src/components/demos/wordmark-spotlight-scroll.tsx",
    nuance: [
      {
        label: "Source SVG geometry",
        description:
          "The seven source SVGs are fetched from Blob, inlined, and stretched with preserveAspectRatio set to none, matching the original wordmark distortion exactly.",
      },
      {
        label: "Paired project motion",
        description:
          "Each image scales from zero during its wordmark step, then scales back to zero while drifting upward by 300 percent during the following step.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "Six project images paired with the source wordmarks.",
      },
      {
        name: "driftAmount",
        control: "text",
        description: "Vertical exit travel in percent for each project image.",
      },
    ],
    assets: assetsByIds([
      "wordmark-spotlight-scroll-header",
      ...Array.from(
        { length: 6 },
        (_, i) => `wordmark-spotlight-scroll-name-${i + 1}`,
      ),
      ...Array.from(
        { length: 6 },
        (_, i) => `wordmark-spotlight-scroll-image-${i + 1}`,
      ),
    ]),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "6 BLANK-hosted JPGs",
        description: "Project stills shown in sequence.",
      },
      {
        name: "driftAmount",
        type: "number",
        default: "300",
        description: "Image exit distance as yPercent.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to use window scroll.",
      },
    ],
  },
  "spotlight-index-scroll": {
    demoPath: "src/components/demos/spotlight-index-scroll.tsx",
    nuance: [
      {
        label: "Center-line spotlight",
        description:
          "Each frame checks which image straddles the half-viewport line by its live bounding box and sets that one to full opacity, so the highlight tracks the scroll exactly.",
      },
      {
        label: "Per-name windows",
        description:
          "Every project name owns a 1/N slice of the scroll; inside its slice it slides up and turns white, then hands off to the next as the counter ticks over.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "links",
        description: "Name and image per gallery entry.",
      },
      {
        name: "introText / outroText",
        control: "text",
        description: "The centered copy before and after the pin.",
      },
    ],
    assets: pageAssets("spotlight-index-scroll-", 4),
    api: [
      {
        name: "projects",
        type: "{ name: string; image: string }[]",
        default: "10 BLANK-hosted JPGs",
        description:
          "Gallery entries; the counter and name list size to this length.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "aperture-zoom-hero": {
    demoPath: "src/components/demos/aperture-zoom-hero.tsx",
    nuance: [
      {
        label: "Two-phase zoom",
        description:
          "The window scales from 1x to 4x over the first half of the pin, then holds at 4x while the header keeps translating in Z, so the frame appears to pass the camera.",
      },
      {
        label: "Late copy rise",
        description:
          "The closing headline stays fully below the fold until 66% progress, then eases up to zero, arriving only as the zoom finishes.",
      },
    ],
    editable: [
      {
        name: "skyImage / windowImage",
        control: "asset-url",
        description: "The panning backdrop and the zooming frame overlay.",
      },
      {
        name: "leftHeading / rightHeading / copyText",
        control: "textarea",
        description: "The layered hero copy.",
      },
    ],
    assets: assetsByIds([
      "aperture-zoom-hero-sky",
      "aperture-zoom-hero-window",
    ]),
    api: [
      {
        name: "skyImage",
        type: "string",
        default: "BLANK-hosted JPG",
        description: "Tall backdrop that pans as the frame zooms.",
      },
      {
        name: "windowImage",
        type: "string",
        default: "BLANK-hosted PNG",
        description: "Window frame overlay that scales toward the camera.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "halftone-interface-hero": {
    demoPath: "src/components/demos/halftone-interface-hero.tsx",
    nuance: [
      {
        label: "Sampled, not typeset",
        description:
          "The two headline lines are rendered to an offscreen canvas, fitted to a 2.52:1 lockup, and sampled on a 10px desktop grid. Every visible tile comes from the text mask rather than an image asset.",
      },
      {
        label: "Two-layer pointer response",
        description:
          "Nearby dots split into three color channels while fast pointer movement sheds snapped square particles. Both effects settle independently, which keeps slow movement precise and fast movement messy.",
      },
      {
        label: "Idle-aware rendering",
        description:
          "The animation loop stops once easing and trail particles have settled, pauses outside the viewport, and leaves the typography static when reduced motion is requested.",
      },
    ],
    editable: [
      {
        name: "headline / brand / footerLabel",
        control: "textarea",
        description:
          "The canvas wordmark and the surrounding identity copy. No source image is required.",
      },
      {
        name: "background / foreground / accentColors",
        control: "color",
        description:
          "The dark frame, halftone ink, and three-channel pointer palette.",
      },
      {
        name: "navigation / utilityLinks",
        control: "links",
        description: "The centered and right-aligned header destinations.",
      },
    ],
    assets: [],
    api: [
      {
        name: "headline",
        type: "[string, string]",
        default: '["blank", "interfaces"]',
        description: "The two lines sampled into the halftone field.",
      },
      {
        name: "navigation",
        type: "{ label: string; href: string }[]",
        default: "Four section links",
        description: "Centered primary navigation links.",
      },
      {
        name: "utilityLinks",
        type: "{ label: string; href: string }[]",
        default: "Follow and subscribe links",
        description: "Right-aligned utility navigation links.",
      },
      {
        name: "brand",
        type: "[string, string]",
        default: '["blank", "interfaces"]',
        description: "Compact two-line identity at the top left.",
      },
      {
        name: "timeZone",
        type: "string",
        default: '"America/New_York"',
        description: "IANA time zone used by the live footer clock.",
      },
      {
        name: "accentColors",
        type: "[string, string, string]",
        default: "Pink, green, and blue",
        description: "Three colors used for cursor splitting and particles.",
      },
    ],
  },
  "ascii-monogram-hero": {
    demoPath: "src/components/demos/ascii-monogram-hero.tsx",
    nuance: [
      {
        label: "A loader that dissolves, not wipes",
        description:
          "The cover is 700 individual grid cells. When the stepped progress bar lands, each cell fades over 0.1s in a random grid stagger spread across two seconds, so the hero is revealed as scattered pixels rather than a curtain.",
      },
      {
        label: "The zoom starts under the cover",
        description:
          "The monogram begins its 6 second power3 zoom from 10x scale the moment the progress bar starts, roughly a second before the cells dissolve, so the reveal always catches it mid-flight.",
      },
      {
        label: "Text as the render target",
        description:
          "Each frame the WebGL scene is downsampled to one sample per glyph cell and redrawn as monospace characters from a density ramp. The fog, the pointer light, and the noise backdrop all arrive on screen as flickering type.",
      },
    ],
    editable: [
      {
        name: "name / role",
        control: "text",
        description: "Corner copy shared by the loader and the sticky hero.",
      },
      {
        name: "monogram",
        control: "text",
        description:
          "Characters drawn as the giant blackletter shape at runtime.",
      },
      {
        name: "theme",
        control: "text",
        description: 'Page scheme: "white" (ink on paper) or "black".',
      },
    ],
    assets: [],
    api: [
      {
        name: "name",
        type: "string",
        default: '"BLANK"',
        description: "Name shown top left in the loader and the hero.",
      },
      {
        name: "role",
        type: "string",
        default: '"Component Registry"',
        description: "Role or tagline shown top right.",
      },
      {
        name: "monogram",
        type: "string",
        default: '"Bk"',
        description: "One or two characters drawn as the blackletter monogram.",
      },
      {
        name: "monogramImage",
        type: "string",
        default: "undefined",
        description:
          "Optional white-on-black silhouette image used instead of the drawn monogram.",
      },
      {
        name: "theme",
        type: '"white" | "black"',
        default: '"white"',
        description: "Ink on paper, or paper on ink.",
      },
      {
        name: "scrollLength",
        type: "number",
        default: "2.75",
        description:
          "Total scroll length in multiples of the container height.",
      },
      {
        name: "className / style",
        type: "string / React.CSSProperties",
        default: "undefined",
        description: "Passed through to the scroll container root.",
      },
    ],
  },
  "halftone-scene-footer": {
    demoPath: "src/components/demos/halftone-scene-footer.tsx",
    nuance: [
      {
        label: "One line per cell",
        description:
          "A fragment shader samples the video once per grid cell, runs a levels pass (black point, white point, gamma), and converts the result to the width of a single centered vertical line. Darker cells grow wider lines, and the sweep overshoots the cell by 2% on each side so full darkness fuses into a solid field.",
      },
      {
        label: "Two layers, two logics",
        description:
          "The sheep layer draws light lines on an opaque dark field. The mountain layer inverts its levels, samples its video upside down, and sets fill opacity to zero, so the flipped bright sky becomes transparent slits revealing the warm ground plane behind the canvas, and the ridge gradient reads as a fence of stripes. The backdrop block is shorter than the band on purpose: slits above it land on the dark page and vanish, cutting the fence at one uniform height.",
      },
      {
        label: "Trimmed to the subject",
        description:
          "Cells whose sampled texel, or any texel in a two-texel ring around it, is transparent or near-black are discarded. That clips the halftone cleanly to the silhouette instead of leaving a hard rectangular video frame, and lets layers composite over each other.",
      },
    ],
    editable: [
      {
        name: "backgroundColor / inkColor",
        control: "color",
        description:
          "The two inks: the dark field and page backdrop, and the light halftone lines, ground plane, and text.",
      },
      {
        name: "layers",
        control: "text",
        description:
          "Full scene override: each layer is a video source plus placement, levels, grid density, and opacities.",
      },
      {
        name: "phone / email",
        control: "text",
        description: "The two large underlined contact links.",
      },
    ],
    assets: [
      {
        id: "halftone-scene-footer-sheep",
        label: "Halftone Scene Footer sheep footage",
        provider: "vercel-blob",
        pathname: "halftone-scene-footer/sheep.mp4",
        fallbackPath:
          "https://ui.aryank.space/assets/halftone-scene-footer/sheep.mp4",
        role: "Portrait loop of grazing sheep sampled into the central halftone figure.",
      },
      {
        id: "halftone-scene-footer-mountain",
        label: "Halftone Scene Footer mountain footage",
        provider: "vercel-blob",
        pathname: "halftone-scene-footer/mountain.mp4",
        fallbackPath:
          "https://ui.aryank.space/assets/halftone-scene-footer/mountain.mp4",
        role: "Wide mountain ridge loop rendered as the striped ground plane across the footer base.",
      },
    ],
    api: [
      {
        name: "layers",
        type: "HalftoneLayer[]",
        default: "sheep + mountain scene",
        description:
          "Video layers: src, placement percentages, black/white points, gamma, threshold, grid density, bg/fill opacities, and an optional flipY.",
      },
      {
        name: "backgroundColor",
        type: "string",
        default: '"#2c2824"',
        description: "Dark ink: canvas field and page backdrop.",
      },
      {
        name: "inkColor",
        type: "string",
        default: '"#a89474"',
        description: "Light ink: halftone lines, ground plane, and text.",
      },
      {
        name: "brand",
        type: "string",
        default: '"BLANK"',
        description: "Center wordmark in the top row.",
      },
      {
        name: "locationEyebrow / locationLines",
        type: "string / string[]",
        default: "BLANK location block",
        description: "Top-left eyebrow and address lines.",
      },
      {
        name: "officeEyebrow / officeLines",
        type: "string / string[]",
        default: "BLANK studio block",
        description: "Top-right eyebrow and studio lines.",
      },
      {
        name: "phone",
        type: "string",
        default: '"+91 8421911353"',
        description: "Large underlined tel: link, bottom left.",
      },
      {
        name: "email",
        type: "string",
        default: '"hello@aryank.space"',
        description: "Large underlined mailto: link, bottom right.",
      },
      {
        name: "copyright / privacyLabel",
        type: "string",
        default: "BLANK copy",
        description: "Small print on the ground plane.",
      },
    ],
  },
  "ascii-tv-hero": {
    demoPath: "src/components/demos/ascii-tv-hero.tsx",
    nuance: [
      {
        label: "Glyphs, not pixels",
        description:
          "Every cell samples the video once, maps its brightness to a character in a runtime-drawn atlas strip (dense ink for shadows, space for highlights), and tints the glyph with the sampled color, so the picture stays legible as type.",
      },
      {
        label: "A tube that scrolls away",
        description:
          "The screen silhouette is a signed-distance TV shape with bulged edges plus fisheye distortion, both driven by a single tvness value. Scroll progress lerps the element from its base size to the full viewport while tvness falls to zero, flattening the CRT into a plain wall.",
      },
      {
        label: "Pointer static",
        description:
          "Recent pointer positions form a decaying trail; cells near it get cell-quantized drag, chunkier re-pixelation, RGB channel separation, a scanline tear, and luma noise, which reads as a magnet held to the tube.",
      },
    ],
    editable: [
      {
        name: "videoSrc",
        control: "asset-url",
        description: "The video the glyph wall samples. Must be CORS-readable.",
      },
      {
        name: "headline",
        control: "textarea",
        description: "Two lines pinned bottom left that fade as the TV grows.",
      },
      {
        name: "cellSize / glyphRamp",
        control: "text",
        description:
          "Cell size in CSS pixels and the character ramp from densest to empty.",
      },
    ],
    assets: [
      {
        id: "ascii-tv-hero-footage",
        label: "ASCII TV hero footage",
        provider: "vercel-blob",
        pathname: "film-studio-page/hero/hero-footage.mp4",
        fallbackPath:
          "https://ui.aryank.space/assets/film-studio-page/hero/hero-footage.mp4",
        role: "Default demo footage sampled into the glyph wall, reused from the film studio page.",
      },
    ],
    api: [
      {
        name: "videoSrc",
        type: "string",
        default: "BLANK hero footage",
        description: "CORS-readable video sampled into the glyph wall.",
      },
      {
        name: "headline",
        type: "[string, string]",
        default: '["Interfaces, motion and code.", "One integrated practice."]',
        description: "Bottom-left copy that fades out during expansion.",
      },
      {
        name: "scrollLength",
        type: "number",
        default: "3",
        description:
          "Scroll distance of the expansion, in multiples of the container height.",
      },
      {
        name: "cellSize",
        type: "number",
        default: "6",
        description: "Glyph cell size in CSS pixels.",
      },
      {
        name: "glyphRamp",
        type: "string",
        default: '"@#W$9876543210?!abc;:+=-,._  "',
        description: "Characters ordered from densest ink to empty space.",
      },
    ],
  },
  "sandy-grain-background": {
    demoPath: "src/components/demos/sandy-grain-background.tsx",
    nuance: [
      {
        label: "A real fluid, not a tracked blob",
        description:
          "The trail lives in a ping-pong WebGL buffer that stores velocity and heat per texel. Each frame the field advects along its own velocity, diffuses, and decays before the pointer splats new energy along its path, so the glow smears and drifts like smoke.",
      },
      {
        label: "One canvas, three layers",
        description:
          "The composite pass draws the base color shaded by slow value noise, adds the amber heat additively, and overlay-blends per-pixel animated grain at 32 percent, all in a single fragment shader.",
      },
      {
        label: "Cursor with etiquette",
        description:
          "The square dot eases after the pointer at a hard 0.85 lerp, swells to a translucent 20px over links, buttons, and [data-cursor] elements, and steps aside entirely on touch devices where the native cursor returns.",
      },
    ],
    editable: [
      {
        name: "baseColor / cursorColor",
        control: "color",
        description: "The near-black backdrop and the square cursor dot.",
      },
      {
        name: "glowColor",
        control: "text",
        description:
          "The amber pointer glow as an [r, g, b] triple, blended additively over the backdrop.",
      },
      {
        name: "grainOpacity",
        control: "text",
        description: "Strength of the film-grain overlay, 0 to 1.",
      },
    ],
    assets: [],
    api: [
      {
        name: "baseColor",
        type: "string",
        default: '"#090703"',
        description: "Backdrop color under the glow and grain.",
      },
      {
        name: "glowColor",
        type: "[number, number, number]",
        default: "[152, 99, 0]",
        description: "Pointer-trail glow color as an RGB triple.",
      },
      {
        name: "cursorColor",
        type: "string",
        default: '"#c8b89a"',
        description: "Fill of the square cursor dot.",
      },
      {
        name: "grainOpacity",
        type: "number",
        default: "0.32",
        description: "Opacity of the animated grain overlay.",
      },
      {
        name: "children",
        type: "React.ReactNode",
        default: "undefined",
        description:
          "Content layered above the backdrop; its links and buttons grow the cursor on hover.",
      },
    ],
  },
  "infinite-contact-scroll": {
    demoPath: "src/components/demos/infinite-contact-scroll.tsx",
    nuance: [
      {
        label: "Gap ripple",
        description:
          "Two overlapping ScrollTriggers per row scrub the flex gap from 1rem to 10rem and back, so a wave of spacing travels through the sheet as it scrolls.",
      },
      {
        label: "Center lock icon",
        description:
          "On every Lenis scroll event the row nearest the center line (within 25px) is found; when it changes, the pinned icon advances to the next glyph.",
      },
    ],
    editable: [
      {
        name: "rows",
        control: "links",
        description: "Label and value per contact row.",
      },
      {
        name: "icons",
        control: "asset-url",
        description: "The cycling center glyphs.",
      },
    ],
    assets: pageAssets("infinite-contact-scroll-", 4),
    api: [
      {
        name: "rows",
        type: "{ label: string; value: string }[]",
        default: "8 BLANK contact rows",
        description: "The contact sheet entries, repeated for the loop.",
      },
      {
        name: "icons",
        type: "string[]",
        default: "7 BLANK-hosted PNGs",
        description: "Glyphs cycled by the pinned center icon.",
      },
      {
        name: "copies",
        type: "number",
        default: "11",
        description: "Stacked copies of the sheet that feed the infinite loop.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "ribbon-stroke-scroll": {
    demoPath: "src/components/demos/ribbon-stroke-scroll.tsx",
    nuance: [
      {
        label: "Outlined ribbons",
        description:
          "Every ribbon is two stacked paths: a border stroke 10px wider under the colored stroke, so each ribbon carries a dark outline as it draws in.",
      },
      {
        label: "Draw then erase",
        description:
          "The two curve ribbons animate strokeDashoffset to zero to draw, then keep going negative to erase themselves tail-first before the rows exit.",
      },
    ],
    editable: [
      {
        name: "rowColors / curveColors",
        control: "color",
        description: "The ribbon palette per row and for the two sweeps.",
      },
      {
        name: "introInText / introOutText / outroText",
        control: "text",
        description: "Headline copy before and after the dark flip.",
      },
    ],
    assets: [],
    api: [
      {
        name: "rowColors",
        type: "[string, string, string][]",
        default: "3x3 warm and cool palette",
        description: "Stroke colors of the nine straight ribbons.",
      },
      {
        name: "curveColors",
        type: "[string, string]",
        default: '["#FFC412", "#FF6D38"]',
        description: "Stroke colors of the two curved sweep ribbons.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "expanding-rows-gallery": {
    demoPath: "src/components/demos/expanding-rows-gallery.tsx",
    nuance: [
      {
        label: "Measured height",
        description:
          "The section pre-measures its height with every row at full 500% width, so the page length never jumps while rows stretch.",
      },
      {
        label: "Ticker-driven widths",
        description:
          "Row width is written every frame from each row's scroll progress on the gsap ticker, not from a ScrollTrigger, so it stays exact under Lenis smoothing.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "links",
        description: "Name, year, and image per project card.",
      },
      {
        name: "introText / outroText",
        control: "text",
        description: "The centered copy before and after the grid.",
      },
    ],
    assets: pageAssets("expanding-rows-gallery-", 4),
    api: [
      {
        name: "projects",
        type: "{ name: string; year: number; img: string }[]",
        default: "16 BLANK-hosted JPGs",
        description:
          "Cards tiled across the rows, looping when rows need more.",
      },
      {
        name: "projectsPerRow / totalRows",
        type: "number",
        default: "9 / 10",
        description: "Grid density; cards repeat from the projects list.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "corridor-scene-3d": {
    demoPath: "src/components/demos/corridor-scene-3d.tsx",
    nuance: [
      {
        label: "Scene-first reveal",
        description:
          "The loader only begins its stepped count after the GLTF and relative texture files resolve, so the overlay never reveals an empty canvas.",
      },
      {
        label: "Slow orbital parallax",
        description:
          "The camera rotates through half a turn during the intro, then eases toward a narrow pointer-driven orbit while bloom and additive grain remain in one postprocessing pass.",
      },
    ],
    editable: [
      {
        name: "modelSrc",
        control: "asset-url",
        description: "GLTF scene with its binary and texture dependencies.",
      },
      {
        name: "brand / navItems / statement / year / credit",
        control: "text",
        description: "All copy placed over the corridor scene.",
      },
    ],
    assets: assetsByIds([
      "corridor-scene-3d-gltf",
      "corridor-scene-3d-bin",
      "corridor-scene-3d-base-color",
      "corridor-scene-3d-metallic-roughness",
      "corridor-scene-3d-emissive",
      "corridor-scene-3d-normal",
    ]),
    api: [
      {
        name: "modelSrc",
        type: "string",
        default: "BLANK-hosted scene.gltf",
        description: "CORS-enabled GLTF URL for the corridor scene.",
      },
      {
        name: "brand / navItems / statement",
        type: "string / string[] / string",
        default: "Astrolume / three links / editorial statement",
        description: "Brand, navigation, and headline content.",
      },
    ],
  },
  "drone-fleet": {
    demoPath: "src/components/demos/drone-fleet.tsx",
    nuance: [
      {
        label: "Boids steering",
        description:
          "Each drone sums separation, alignment, cohesion, and a wander term, then a turn-rate limit and speed easing keep the motion smooth so the flock reads as a coordinated fleet rather than jittering points.",
      },
      {
        label: "Pointer and waypoints",
        description:
          "The smoothed pointer is a weak attractor for free roam; clicking queues waypoints the flock chases in order, advancing once its centroid arrives, then returning to pointer-follow once the queue is cleared.",
      },
    ],
    editable: [
      {
        name: "count",
        control: "text",
        description: "Drone count. Defaults to 12, or 6 on narrow screens.",
      },
    ],
    assets: [],
    api: [
      {
        name: "count",
        type: "number",
        default: "12 (6 under 768px)",
        description: "Number of drones in the flock.",
      },
    ],
  },
  "motion-tracking": {
    demoPath: "src/components/demos/motion-tracking.tsx",
    nuance: [
      {
        label: "Compute-shader frame differencing",
        description:
          "A WGSL compute pass diffs successive grayscale frames at quarter resolution and accumulates a decaying trail, so movement leaves a fading mask instead of a single-frame flicker.",
      },
      {
        label: "ASCII from motion",
        description:
          "The trail value picks a glyph from a rendered ASCII atlas per screen cell, tints it, and composites it over the darkened video, with a bloom pass lifting the brightest strokes.",
      },
    ],
    editable: [
      {
        name: "videoSrc",
        control: "asset-url",
        description: "CORS-enabled looping video the motion is detected from.",
      },
      {
        name: "color / debug",
        control: "text",
        description:
          "Glyph tint (blue, red, green) and the raw motion-mask toggle.",
      },
    ],
    assets: [],
    api: [
      {
        name: "videoSrc",
        type: "string",
        default: "river footage (rehost on Blob)",
        description: "CORS-enabled looping video source.",
      },
      {
        name: "color",
        type: '"blue" | "red" | "green"',
        default: '"blue"',
        description: "Tint applied to the ASCII glyphs.",
      },
      {
        name: "debug",
        type: "boolean",
        default: "false",
        description:
          "Show the raw grayscale motion mask instead of the effect.",
      },
      {
        name: "videoBrightness",
        type: "number",
        default: "0.55",
        description:
          "Brightness of the footage behind the glyphs, 0 (black) to 1 (full).",
      },
    ],
  },
  "cursor-trail-scroll": {
    demoPath: "src/components/demos/cursor-trail-scroll.tsx",
    nuance: [
      {
        label: "Document-length trail",
        description:
          "The canvas matches the complete editorial height, so the blurred pointer line remains painted as the page scrolls instead of being clipped to one viewport.",
      },
      {
        label: "Scroll-aware drawing",
        description:
          "Lenis scroll deltas are added to the last pointer coordinate, which keeps the trail connected even while the pointer stays still and the document moves underneath it.",
      },
    ],
    editable: [
      {
        name: "logoImage / images",
        control: "asset-url",
        description: "Wordmark and three full-width editorial images.",
      },
      {
        name: "brand / discipline / about",
        control: "text",
        description: "Pinned navigation and studio description copy.",
      },
    ],
    assets: assetsByIds([
      "cursor-trail-scroll-logo",
      "cursor-trail-scroll-image-1",
      "cursor-trail-scroll-image-2",
      "cursor-trail-scroll-image-3",
    ]),
    api: [
      {
        name: "logoImage / images",
        type: "string / [string, string, string]",
        default: "Four BLANK-hosted images",
        description: "Wordmark and monochrome editorial image sequence.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "sticky-flip-cards": {
    demoPath: "src/components/demos/sticky-flip-cards.tsx",
    nuance: [
      {
        label: "Progress sliced into phases",
        description:
          "One pinned scroll progress is mapped to svh milestones: cards enter, the front card flips at a trigger point, then each back card dismisses across its own 100svh window, so entry, flip, and exit never share frames.",
      },
      {
        label: "Reverse dismiss order",
        description:
          "The back cards peel off top of stack first (dismiss order is reversed from render order), and each keeps an elastic flip tilt that eases into a steeper dismiss tilt.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "text",
        description: "The four back-card titles, bodies, and icon names.",
      },
      {
        name: "heroHeading / frontTitle / frontBody / outroHeading",
        control: "text",
        description: "The hero headline, front card copy, and outro statement.",
      },
    ],
    assets: [],
    api: [
      {
        name: "cards",
        type: "FlipCardItem[]",
        default: "Four BLANK cards",
        description:
          "Back-card title, body, and icon (lock-open/layers/prism/infinite).",
      },
      {
        name: "heroHeading / frontTitle / frontLabel / frontBody / outroHeading",
        type: "string",
        default: "BLANK copy",
        description: "Hero, front-card, and outro copy.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "smudge-cursor-reveal": {
    demoPath: "src/components/demos/smudge-cursor-reveal.tsx",
    nuance: [
      {
        label: "Goo-filter mask",
        description:
          "Circles stamped along the smoothed pointer path feed an SVG feGaussianBlur plus feColorMatrix goo filter, so overlapping stamps merge into organic blobs that mask the layer beneath.",
      },
      {
        label: "Speed-scaled stamps",
        description:
          "Each stamp's radius scales with pointer speed, then a per-stamp timeline expands and dissolves it, so fast strokes clear more and every smudge heals itself.",
      },
    ],
    editable: [
      {
        name: "foreground / background",
        control: "text",
        description:
          "The top-layer word and the hidden message revealed underneath.",
      },
    ],
    assets: [],
    api: [
      {
        name: "foreground / background",
        type: "string",
        default: '"Dig in" / hidden line',
        description: "Top-layer headline and the revealed message.",
      },
    ],
  },
  "landing-image-reveal": {
    demoPath: "src/components/demos/landing-image-reveal.tsx",
    nuance: [
      {
        label: "Off-screen row math",
        description:
          "The five images are laid out as a scaled, rotated row computed from the container width, parked off-screen, then glided to their centered slots before the outer pairs exit and the center image scales to full bleed.",
      },
      {
        label: "Masked line reveals",
        description:
          "SplitText splits the nav, headline, and contact lines into masked lines that rise into place on the same timeline, timed against the image choreography.",
      },
    ],
    editable: [
      {
        name: "heading / logo / navItems / email",
        control: "text",
        description: "Hero headline, wordmark, nav links, and contact email.",
      },
      {
        name: "images",
        control: "asset-url",
        description: `The five hero images, starting at ${getHostedAssetUrl(
          "landing-image-reveal/img-1.jpg",
        )}.`,
      },
    ],
    assets: landingImageRevealAssetDocs,
    api: [
      {
        name: "images",
        type: "[string, string, string, string, string]",
        default: "Blob-hosted img-1..5",
        description: "The five images; the third is the center hero image.",
      },
      {
        name: "heading / logo / navItems / email",
        type: "string / string[]",
        default: "BLANK copy",
        description: "Hero and nav copy.",
      },
    ],
  },
  "spotlight-gallery-scroll": {
    demoPath: "src/components/demos/spotlight-gallery-scroll.tsx",
    nuance: [
      {
        label: "One progress, many mappings",
        description:
          "The pinned progress is remapped into separate ranges that scale the gallery, counter-scale the images, shrink and travel the logo, blur out the footer, and fade the headline in word by word.",
      },
      {
        label: "Scrubbed handoff",
        description:
          "A second ScrollTrigger on the next section scrubs the hero up and fades a black overlay in as it scrolls away, so the pinned stage hands off cleanly.",
      },
    ],
    editable: [
      {
        name: "heading / buttonLabel / footer / studioHeading / connectHeading",
        control: "text",
        description:
          "Hero headline, CTA, footer, and the two section headings.",
      },
      {
        name: "images / logo",
        control: "asset-url",
        description: `The nine gallery images and the logo, starting at ${getHostedAssetUrl(
          "spotlight-gallery-scroll/img1.jpg",
        )}.`,
      },
    ],
    assets: spotlightGalleryScrollAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "Blob-hosted img1..9",
        description: "Nine images filling the three-column wall.",
      },
      {
        name: "logo / heading / buttonLabel / footer / studioHeading / connectHeading",
        type: "string",
        default: "BLANK copy",
        description: "Logo asset and hero/section copy.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "scroll-flip-cards": {
    demoPath: "src/components/demos/scroll-flip-cards.tsx",
    nuance: [
      {
        label: "Staggered card timelines",
        description:
          "Each card reads the same pinned scroll progress but offsets its start by index, so the three fly in, gather, and flip in a rolling sequence instead of moving as one block.",
      },
      {
        label: "Phased flight and flip",
        description:
          "A single card progress value is sliced into phases: rise and scale up to 60 percent, then translate to center while the inner face rotates the final 180 degrees, so motion and flip never fight for the same frames.",
      },
    ],
    editable: [
      {
        name: "services",
        control: "text",
        description: "The three card names, numbers, and their service lists.",
      },
      {
        name: "aboutHeading / servicesHeading / outroHeading",
        control: "text",
        description: "The three section headings.",
      },
      {
        name: "logo / menuLabel",
        control: "text",
        description: "Fixed nav wordmark and menu label.",
      },
    ],
    assets: [],
    api: [
      {
        name: "services",
        type: "[FlipCardService, FlipCardService, FlipCardService]",
        default: "Plan / Design / Develop",
        description:
          "Card name, number, and service list for each of the three.",
      },
      {
        name: "aboutHeading / servicesHeading / outroHeading / logo / menuLabel",
        type: "string",
        default: "BLANK copy",
        description: "Section headings and nav labels.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "word-highlight-scroll": {
    demoPath: "src/components/demos/word-highlight-scroll.tsx",
    nuance: [
      {
        label: "Overlapping word timeline",
        description:
          "Each word's reveal window is offset by its index but stretched to overlap the next fifteen, so the highlight reads as a continuous sweep across the paragraph rather than fifteen discrete pops.",
      },
      {
        label: "Chip-then-text handoff",
        description:
          "A word's grey chip reaches full opacity before the letters fade in through it, and the chip only clears in the final tenth of that word's progress, so the color always precedes the reading.",
      },
    ],
    editable: [
      {
        name: "headlineHero / headlineCta / headlineOutro",
        control: "text",
        description: "The three bold color-card headlines.",
      },
      {
        name: "aboutParagraphs / featuresParagraphs",
        control: "text",
        description: "The two pinned, word-revealed paragraph blocks.",
      },
      {
        name: "keywords",
        control: "text",
        description: "Words that get a colored pill during the reveal.",
      },
    ],
    assets: [],
    api: [
      {
        name: "headlineHero / headlineCta / headlineOutro",
        type: "string",
        default: "BLANK editorial headlines",
        description: "Color-card headlines between the paragraph sections.",
      },
      {
        name: "aboutParagraphs / featuresParagraphs",
        type: "[string, string]",
        default: "BLANK studio copy",
        description: "The two pinned word-reveal paragraph blocks.",
      },
      {
        name: "keywords / embedded",
        type: "string[] / boolean",
        default: "Nine keywords / true",
        description:
          "Pill-highlighted words; embedded owns the scroll container.",
      },
    ],
  },
  "split-reveal-preloader": {
    demoPath: "src/components/demos/split-reveal-preloader.tsx",
    nuance: [
      {
        label: "First-letter logo morph",
        description:
          "The opening letter of the studio name is tracked separately, sliding up and scaling to 0.75 with a heavier weight so the wordmark collapses into the compact N10-style mark instead of just fading between two logos.",
      },
      {
        label: "Mirrored split halves",
        description:
          "A duplicate overlay is pre-set to the finished logo state and clipped to the bottom half; when the seam parts, the top preloader lifts and this bottom copy drops, so the split looks like one surface tearing rather than two layers.",
      },
    ],
    editable: [
      {
        name: "studio / numeral / logo / cardWord",
        control: "text",
        description: "Intro name, numeral, compact logo, and hero card word.",
      },
      {
        name: "tags",
        control: "text",
        description: "The three floating tags shown during the intro.",
      },
      {
        name: "heroImage",
        control: "asset-url",
        description: "Hero backdrop revealed behind the split.",
      },
    ],
    assets: assetsByIds(["split-reveal-preloader-hero"]),
    api: [
      {
        name: "studio / numeral / logo / cardWord",
        type: "string",
        default: "Nullspace Studio / 10 / N10 / Nullspace",
        description: "Intro name, numeral, compact logo, and hero card word.",
      },
      {
        name: "tags / heroImage",
        type: "[string, string, string] / string",
        default: "BLANK tags and hero",
        description: "Floating intro tags and the revealed hero backdrop.",
      },
      {
        name: "menuLabel / footerLeft / footerRight",
        type: "string",
        default: "Menu / Scroll Down / Made by BLANK",
        description: "Hero nav and footer copy.",
      },
    ],
  },
  "cursor-image-trail": {
    demoPath: "src/components/demos/cursor-image-trail.tsx",
    nuance: [
      {
        label: "Center-out mask reveal",
        description:
          "Each dropped frame is split into ten horizontal bands whose clip-paths open from a center seam outward, staggered by distance from the middle, so the image unzips rather than simply fading in.",
      },
      {
        label: "Distance-gated spawns",
        description:
          "A new frame only appears once the pointer has moved past a 150px threshold from the last drop, so the trail spaces itself by speed instead of flooding on every mouse event.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "The pool of frames cycled through the trail.",
      },
      {
        name: "heroImage",
        control: "asset-url",
        description: "Dimmed backdrop behind the trail.",
      },
      {
        name: "captionTop / captionBottom",
        control: "text",
        description: "The two centered hero captions.",
      },
    ],
    assets: assetsByIds([
      "cursor-image-trail-hero",
      ...Array.from(
        { length: 20 },
        (_, i) => `cursor-image-trail-img-${i + 1}`,
      ),
    ]),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "Twenty BLANK-hosted frames",
        description: "Frames cycled into the pointer trail.",
      },
      {
        name: "heroImage / captionTop / captionBottom",
        type: "string / string / string",
        default: "BLANK-hosted backdrop and captions",
        description: "Dimmed backdrop and the two centered captions.",
      },
    ],
  },
  "converging-icons-text": {
    demoPath: "src/components/demos/converging-icons-text.tsx",
    nuance: [
      {
        label: "Clone-and-fly handoff",
        description:
          "The real icon row scales into caption size, then live clones take over the last leg, flying into the headline slots so the originals never have to leave their flex row and break the layout.",
      },
      {
        label: "Two-axis approach",
        description:
          "Each clone covers its vertical distance to the slot in the first half of the phase and its horizontal distance in the second, so icons drop into their line before sliding to the exact word position.",
      },
    ],
    editable: [
      {
        name: "icons",
        control: "asset-url",
        description: "The five icons that fly into the sentence.",
      },
      {
        name: "heroTitle / heroSubtitle / outroText",
        control: "text",
        description: "Opening header, subtitle, and closing line.",
      },
      {
        name: "segments",
        control: "text",
        description: "The six word groups the icons slot between.",
      },
    ],
    assets: assetsByIds(
      Array.from(
        { length: 5 },
        (_, i) => `converging-icons-text-icon-${i + 1}`,
      ),
    ),
    api: [
      {
        name: "icons",
        type: "[string, string, string, string, string]",
        default: "Five BLANK-hosted icons",
        description: "Icons that clone and fly into the headline slots.",
      },
      {
        name: "heroTitle / heroSubtitle / segments / outroText",
        type: "string / string / [string x6] / string",
        default: "BLANK PRO copy",
        description: "Header, subtitle, sentence fragments, and closing line.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "curtain-reveal-hero": {
    demoPath: "src/components/demos/curtain-reveal-hero.tsx",
    nuance: [
      {
        label: "Cloned split curtain",
        description:
          "The outro statement is duplicated at runtime and each copy clipped to one half, so the single headline can split down its center and slide apart as two curtains without any seam.",
      },
      {
        label: "One timeline, many beats",
        description:
          "Background scale, the seam wipe, the staggered image cascade, and the curtain exit are all placed on one scrubbed timeline at fixed positions, so scroll speed alone drives the whole sequence in order.",
      },
    ],
    editable: [
      {
        name: "heroImage / images",
        control: "asset-url",
        description: "Backdrop and the three cascade images.",
      },
      {
        name: "heroHeading / outroHeading",
        control: "text",
        description: "Opening headline and the split curtain statement.",
      },
      {
        name: "aboutHeading / aboutBody",
        control: "text",
        description: "The following section's heading and copy.",
      },
    ],
    assets: assetsByIds([
      "curtain-reveal-hero-bg",
      "curtain-reveal-hero-img-1",
      "curtain-reveal-hero-img-2",
      "curtain-reveal-hero-img-3",
    ]),
    api: [
      {
        name: "heroImage / images",
        type: "string / [string, string, string]",
        default: "Four BLANK-hosted images",
        description: "Backdrop and the three cascade images.",
      },
      {
        name: "heroHeading / outroHeading / aboutHeading / aboutBody",
        type: "string",
        default: "BLANK editorial copy",
        description: "Hero, curtain, and following-section text.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "slit-reveal-hero": {
    demoPath: "src/components/demos/slit-reveal-hero.tsx",
    nuance: [
      {
        label: "Sequenced phases",
        description:
          "One scroll progress value is split into overlapping windows for the slit, rotation, scale, copy slide, and outro clips, so each stage owns its own slice of the timeline and hands off cleanly to the next.",
      },
      {
        label: "Masked line outro",
        description:
          "The closing headline is split into masked lines held below their clip; only past 90 percent do they rise, and scrolling back drops them again, so the reveal is a discrete beat rather than a scrubbed tween.",
      },
    ],
    editable: [
      {
        name: "heroImage / outroImages",
        control: "asset-url",
        description: "Lead image and the two outro images.",
      },
      {
        name: "heroHeading / columns / outroHeading / aboutHeading",
        control: "text",
        description: "All headline and column copy.",
      },
    ],
    assets: assetsByIds([
      "slit-reveal-hero-hero",
      "slit-reveal-hero-outro-1",
      "slit-reveal-hero-outro-2",
    ]),
    api: [
      {
        name: "heroImage / outroImages",
        type: "string / [string, string]",
        default: "Three BLANK-hosted images",
        description: "Lead hero image and the two outro images.",
      },
      {
        name: "heroHeading / columns / outroHeading / aboutHeading",
        type: "string / [SlitColumn, SlitColumn] / string / string",
        default: "BLANK editorial copy",
        description: "Hero headline, the two copy columns, and closing lines.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "tilt-card-stack": {
    demoPath: "src/components/demos/tilt-card-stack.tsx",
    nuance: [
      {
        label: "Next-card triggers",
        description:
          "Every card's tilt is driven by the following card's position, not its own, so a card only begins to fall back once the next one is genuinely climbing over it.",
      },
      {
        label: "Origin at the base",
        description:
          "The inner card rotates around its bottom edge and recedes in Z, so it hinges backward like a turning page rather than shrinking toward its center.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "text",
        description:
          "Info line, title, description, image, and accent per card.",
      },
      {
        name: "heroHeading / outroHeading",
        control: "text",
        description: "The opening and closing full-screen headings.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 4 }, (_, i) => `tilt-card-stack-img-${i + 1}`),
    ),
    api: [
      {
        name: "cards",
        type: "TiltCard[]",
        default: "Four BLANK artwork cards",
        description:
          "Info, title, description, image, and accent color per card.",
      },
      {
        name: "heroHeading / outroHeading",
        type: "string",
        default: "BLANK headings",
        description: "Opening and closing full-screen headings.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "montage-reveal-hero": {
    demoPath: "src/components/demos/montage-reveal-hero.tsx",
    nuance: [
      {
        label: "Flip-driven relocation",
        description:
          "The thumbnails are laid out at one corner, then the target class moves them to the other; GSAP Flip captures the before state and animates the transition, so the montage travels along real layout positions rather than tweened offsets.",
      },
      {
        label: "Odometer counters",
        description:
          "Each digit column is a tall strip of numbers translated up by its measured height, with three columns of different lengths and speeds combining into a single 0-to-100 roll.",
      },
    ],
    editable: [
      {
        name: "images / logo",
        control: "asset-url",
        description: "The fifteen montage thumbnails and the sidebar mark.",
      },
      {
        name: "brand / navLinks / cta",
        control: "text",
        description: "Wordmark, nav links, and the call-to-action.",
      },
      {
        name: "heading / subheading / infoLines / footer",
        control: "text",
        description: "Headline, supporting lines, and the showreel footer.",
      },
    ],
    assets: assetsByIds([
      "montage-reveal-hero-logo",
      ...Array.from(
        { length: 15 },
        (_, i) => `montage-reveal-hero-img-${i + 1}`,
      ),
    ]),
    api: [
      {
        name: "images / logo",
        type: "string[] / string",
        default: "Fifteen BLANK thumbnails and a logo",
        description: "Montage thumbnails and the sidebar mark.",
      },
      {
        name: "brand / navLinks / cta / heading / subheading / infoLines / footer",
        type: "string / [string, string] / string / string / string / [string, string] / string",
        default: "BLANK landing copy",
        description: "All hero and navigation text.",
      },
    ],
  },
  "shader-grid-gallery": {
    demoPath: "src/components/demos/shader-grid-gallery.tsx",
    nuance: [
      {
        label: "Everything in one draw",
        description:
          "The whole gallery is a single plane and one fragment shader: cells, borders, images, and captions are all resolved per pixel from two atlases, so panning an infinite field costs one draw call rather than one mesh per tile.",
      },
      {
        label: "Barrel-warped picking",
        description:
          "The same lens distortion applied in the shader is reproduced in JavaScript on click, so the cell you select matches the warped tile you actually see under the pointer instead of a flat projection.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "text",
        description: "Title, year, image, and optional link for each cell.",
      },
      {
        name: "onSelect",
        control: "text",
        description:
          "Callback fired with the project of a clicked (non-dragged) cell.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 25 }, (_, i) => `shader-grid-gallery-img-${i + 1}`),
    ),
    api: [
      {
        name: "projects",
        type: "ShaderGridProject[]",
        default: "Twenty-five BLANK projects",
        description:
          "Title, year, image, and optional href tiled across the grid.",
      },
      {
        name: "onSelect",
        type: "(project) => void",
        default: "undefined",
        description: "Called when a cell is clicked without dragging.",
      },
    ],
  },
  "minimap-scrubber": {
    demoPath: "src/components/demos/minimap-scrubber.tsx",
    nuance: [
      {
        label: "Overlap-based selection",
        description:
          "Active state is decided by measuring which thumbnail overlaps the fixed indicator window the most, so the selection is precise even mid-glide rather than snapped to discrete steps.",
      },
      {
        label: "Two lerp speeds",
        description:
          "Wheel and drag settle with a 0.075 lerp for responsiveness, while clicking a thumbnail uses a slower 0.05 lerp so the programmatic ease into the indicator reads as deliberate.",
      },
    ],
    editable: [
      {
        name: "images",
        control: "asset-url",
        description: "Thumbnail filmstrip and the frames shown in the preview.",
      },
      {
        name: "brand / code / label",
        control: "text",
        description: "Nav wordmark and the two site-info lines.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 15 }, (_, i) => `minimap-scrubber-img-${i + 1}`),
    ),
    api: [
      {
        name: "images",
        type: "string[]",
        default: "Fifteen BLANK-hosted frames",
        description: "Filmstrip thumbnails; the active one fills the preview.",
      },
      {
        name: "brand / code / label",
        type: "string / string / string",
        default: "BLANK / E427 / Responsive Minimap",
        description: "Nav wordmark and the two site-info lines.",
      },
    ],
  },
  "curved-plane-slider": {
    demoPath: "src/components/demos/curved-plane-slider.tsx",
    nuance: [
      {
        label: "Texture-space scroll",
        description:
          "Nothing in the 3D scene actually moves; scroll progress offsets where the slides are drawn in a repeating 2048x8192 canvas, and RepeatWrapping loops the strip so the plane appears to scroll forever.",
      },
      {
        label: "Parabolic plane",
        description:
          "The plane's vertices are pushed along z by the square of their distance from center, curving it into a concave sheet, then tilted on two axes so the slides read as a receding ribbon.",
      },
    ],
    editable: [
      {
        name: "images / titles",
        control: "asset-url",
        description: "The seven slide stills and their captions.",
      },
      {
        name: "brand / tagline / navLinks",
        control: "text",
        description: "Fixed nav wordmark, tagline, and links.",
      },
      {
        name: "experiment / copyright",
        control: "text",
        description: "Footer experiment label and copyright line.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 7 }, (_, i) => `curved-plane-slider-img-${i + 1}`),
    ),
    api: [
      {
        name: "images / titles",
        type: "string[] / string[]",
        default: "Seven BLANK stills and captions",
        description: "Slide stills and the caption drawn over each.",
      },
      {
        name: "brand / tagline / navLinks / experiment / copyright",
        type: "string / string / [string, string] / string / string",
        default: "BLANK chrome copy",
        description: "Fixed nav and footer text around the slider.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "curve-gallery": {
    demoPath: "src/components/demos/curve-gallery.tsx",
    studioPath: "src/components/studios/curve-gallery.tsx",
    nuance: [
      {
        label: "The camera is the scroll",
        description:
          "Wheel, drag, arrow keys, and autoplay all move one eased progress value. That value samples the active Catmull-Rom curve, so input feels like moving a camera rather than translating a flat gallery.",
      },
      {
        label: "Focus is spatial",
        description:
          "Every plane keeps its place on the curve. Frames near the camera in both curve progress and screen-space distance grow with a cubic falloff, allowing one image to bloom without hiding the field around it.",
      },
      {
        label: "Five paths, one field",
        description:
          "Switching paths retargets the same plane set and eases every mesh into its new position. The curve definitions are generated in the component, so there are no external Blender JSON files to ship.",
      },
    ],
    editable: [
      {
        name: "background / foreground",
        control: "color",
        description: "Canvas fog color and the minimal interface color.",
      },
      {
        name: "focusDistance / maxScale",
        control: "text",
        description:
          "Radius of the focus zone and the maximum scale of its nearest frame.",
      },
      {
        name: "images",
        control: "asset-url",
        description:
          "The existing 12-image Scroll Tunnel set, reused across the curve field.",
      },
      {
        name: "pathLabels / brand / label",
        control: "text",
        description: "Curve selector labels and the two corner captions.",
      },
    ],
    assets: curveGalleryAssets,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "Twelve existing BLANK-hosted photographs",
        description: "Textures distributed repeatedly across the image field.",
      },
      {
        name: "background / foreground",
        type: "string / string",
        default: '"#f2f0eb" / "#171715"',
        description: "Scene fog and minimal interface colors.",
      },
      {
        name: "planeCount",
        type: "number",
        default: "320",
        description: "Number of image planes distributed along the curve.",
      },
      {
        name: "focusDistance / maxScale / cameraOffset",
        type: "number / number / number",
        default: "4.8 / 11 / 9.5",
        description:
          "Focus radius, scale peak, and lens distance from the path.",
      },
      {
        name: "autoplay / autoplayDuration",
        type: "boolean / number",
        default: "false / 12",
        description: "Initial motion mode and seconds per complete path lap.",
      },
      {
        name: "initialPath / pathLabels",
        type: "number / string[]",
        default: "0 / 01 through 05",
        description: "Initial curve and the five selector labels.",
      },
      {
        name: "brand / label",
        type: "string / string",
        default: '"BLANK" / "Curve archive"',
        description: "Small fixed captions framing the gallery.",
      },
    ],
  },
  "lego-dither": {
    demoPath: "src/components/demos/lego-dither.tsx",
    studioPath: "src/components/studios/lego-dither.tsx",
    nuance: [
      {
        label: "The model is only a light field",
        description:
          "The GLB never reaches the screen directly. It renders in white against black so the final shader can turn its light and shade into six discrete Lego colors.",
      },
      {
        label: "One sprite, six luminance steps",
        description:
          "Each screen cell samples the hand once, chooses one of six 48-pixel stud glyphs, then draws that glyph at native hard edges. The white background is the darkest source level, not a CSS backdrop.",
      },
      {
        label: "The pointer enters before dithering",
        description:
          "Pointer motion updates a fading canvas trail. Its gradient warps the hand sample and its intensity lifts nearby cells, so the cursor leaves real Lego marks instead of an overlay.",
      },
    ],
    editable: [
      {
        name: "modelUrl / spriteUrl",
        control: "asset-url",
        description:
          "Blob-hosted GLB and six-frame Lego stud sprite sheet used by the two render passes.",
      },
      {
        name: "cellSize / modelScale / spinSpeed",
        control: "text",
        description:
          "Stud resolution, fitted hand size, and autonomous rotation speed.",
      },
      {
        name: "pointerRotation / trailSize / trailDecay / distortion",
        control: "text",
        description:
          "Pointer tilt, stacked-color trail timing, and the hand scatter strength.",
      },
    ],
    assets: assetsByIds(["lego-dither-hand", "lego-dither-sprite"]),
    api: [
      {
        name: "modelUrl / spriteUrl",
        type: "string / string",
        default: "BLANK-hosted Lego Dither assets",
        description: "GLB hand model and horizontal six-glyph sprite sheet.",
      },
      {
        name: "cellSize / modelScale",
        type: "number / number",
        default: "7 / 1.15",
        description: "Stud size in CSS pixels and normalized hand scale.",
      },
      {
        name: "spinSpeed / pointerRotation",
        type: "number / number",
        default: "0.26 / 0.15",
        description: "Automatic Y rotation and pointer-driven X/Z rotation.",
      },
      {
        name: "trailSize / trailDecay / distortion",
        type: "number / number / number",
        default: "0.041 / 0.08 / 0.18",
        description:
          "Pointer stroke width, color-step delay, and hand scatter.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional class applied to the full-size canvas wrapper.",
      },
    ],
  },
  "rotating-hand-scroll": {
    demoPath: "src/components/demos/rotating-hand-scroll.tsx",
    nuance: [
      {
        label: "Cycle-mapped headlines",
        description:
          "Total rotation is divided into 360-degree cycles; each completed cycle advances the headline, and cycle four is the trigger that fades the portrait in and slides the body copy into place.",
      },
      {
        label: "Staged end transition",
        description:
          "The final eighth of the scroll is choreographed in steps: the hand grows to full height, scales past twentyfold, fades out, and only then does the wordmark fade up, so the phases read as one continuous zoom.",
      },
    ],
    editable: [
      {
        name: "headlines",
        control: "text",
        description: "The muted lead and bright tail shown on each rotation.",
      },
      {
        name: "portrait / copy",
        control: "asset-url",
        description:
          "Portrait revealed in the hand and the two body paragraphs.",
      },
      {
        name: "brand / aboutText",
        control: "text",
        description:
          "Closing wordmark and the following section's placeholder.",
      },
    ],
    assets: assetsByIds(["rotating-hand-scroll-portrait"]),
    api: [
      {
        name: "headlines",
        type: "RotatingHeadline[]",
        default: "Five BLANK headlines",
        description: "Muted lead and bright tail swapped on each full turn.",
      },
      {
        name: "portrait / copy / brand",
        type: "string / [string, string] / string",
        default: "BLANK-hosted portrait and copy",
        description:
          "Portrait revealed in the hand, body paragraphs, and wordmark.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "catalog-swap-gallery": {
    demoPath: "src/components/demos/catalog-swap-gallery.tsx",
    nuance: [
      {
        label: "Rebuilt detail block",
        description:
          "Each swap fully removes the old detail column and image, then constructs the next one and re-splits its synopsis into lines, so the exit and entrance never share DOM and can overlap cleanly.",
      },
      {
        label: "Layered cross-fade backdrop",
        description:
          "A fresh blurred still is inserted behind the current one and fades in on a half-second delay while the old fades out, keeping a full-bleed color wash under the frosted glass at all times.",
      },
    ],
    editable: [
      {
        name: "items",
        control: "text",
        description:
          "Title, synopsis, director, and cinematographer per entry.",
      },
      {
        name: "images",
        control: "asset-url",
        description: "Still for each catalog entry (thumbnail and feature).",
      },
      {
        name: "brand / navLinks / intro",
        control: "text",
        description: "Studio wordmark, navigation, and the standing blurb.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 15 }, (_, i) => `catalog-swap-gallery-img-${i + 1}`),
    ),
    api: [
      {
        name: "items",
        type: "CatalogItem[]",
        default: "Fifteen BLANK documentary entries",
        description:
          "Title, synopsis, director, and cinematographer per entry.",
      },
      {
        name: "images",
        type: "string[]",
        default: "Fifteen BLANK-hosted stills",
        description: "Still for each entry; index-aligned to items.",
      },
      {
        name: "brand / navLinks / intro",
        type: "string / string[] / string",
        default: "BLANK / Home, Work, Contact / standing blurb",
        description:
          "Studio wordmark, navigation links, and the left-column copy.",
      },
    ],
  },
  "filter-scrub-gallery": {
    demoPath: "src/components/demos/filter-scrub-gallery.tsx",
    nuance: [
      {
        label: "Pointer-mapped scrub",
        description:
          "Cursor x is converted to a percentage of the container and multiplied by the overflow, then eased toward with a 0.025 lerp, so the strip trails the pointer smoothly instead of snapping to it.",
      },
      {
        label: "Width-grow filtering",
        description:
          "Matching cards animate from a 25px sliver to full width while the rest collapse to display none; the track is re-measured on completion so the scrub range always matches the visible set.",
      },
    ],
    editable: [
      {
        name: "filters",
        control: "text",
        description: "Category labels and the item indices each one shows.",
      },
      {
        name: "images",
        control: "asset-url",
        description: "The pool of card images (index-aligned to the filters).",
      },
      {
        name: "brand / navLinks",
        control: "text",
        description: "Wordmark and the center navigation links.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 50 }, (_, i) => `filter-scrub-gallery-img-${i + 1}`),
    ),
    api: [
      {
        name: "filters",
        type: "GalleryFilter[]",
        default: "Six BLANK categories",
        description:
          "Each filter's label and the 1-based item indices it shows.",
      },
      {
        name: "images",
        type: "string[]",
        default: "Fifty BLANK-hosted images",
        description: "Card image pool; item index maps to filter membership.",
      },
      {
        name: "brand / navLinks",
        type: "string / string[]",
        default: "BLANK / Services, Work, Contact",
        description: "Wordmark and center navigation links.",
      },
    ],
  },
  "cross-reveal-scroll": {
    demoPath: "src/components/demos/cross-reveal-scroll.tsx",
    nuance: [
      {
        label: "Layered pin timing",
        description:
          "The editorial copy and the cross are pinned on separate triggers that both release at the whitespace boundary, so the text holds still while the mark keeps rotating and scaling over it.",
      },
      {
        label: "Bar clip-path spread",
        description:
          "Each bar starts as a 10% slit and widens symmetrically to a full quadrant; combined with the 90-degree offset of the second bar, the thin cross fills into a solid square exactly as it reaches full scale.",
      },
    ],
    editable: [
      {
        name: "brand / headerRows / outro",
        control: "text",
        description: "Hero wordmark, the two banner rows, and closing line.",
      },
      {
        name: "intro / images",
        control: "text",
        description: "Editorial paragraph and the four-up image strip.",
      },
      {
        name: "heroImage",
        control: "asset-url",
        description: "Fullscreen hero backdrop.",
      },
    ],
    assets: assetsByIds([
      "cross-reveal-scroll-hero",
      "cross-reveal-scroll-img-1",
      "cross-reveal-scroll-img-2",
      "cross-reveal-scroll-img-3",
      "cross-reveal-scroll-img-4",
    ]),
    api: [
      {
        name: "brand / headerRows / intro / outro",
        type: "string / [string, string] / string / string",
        default: "BLANK editorial copy",
        description: "Hero wordmark, banner rows, paragraph, and closing line.",
      },
      {
        name: "images / heroImage",
        type: "[string, string, string, string] / string",
        default: "Five BLANK-hosted images",
        description: "Four-up image strip and the hero backdrop.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container; set false to ride the window scroll.",
      },
    ],
  },
  "folding-panel-menu": {
    demoPath: "src/components/demos/folding-panel-menu.tsx",
    nuance: [
      {
        label: "Clip-path strip reveal",
        description:
          "Each panel clips to its own rectangle, so the oversized rotated word is hidden inside the thin folded column and only becomes legible as the strip widens to the full frame.",
      },
      {
        label: "Directional letter stagger",
        description:
          "Opening raises the letters bottom-up with a negative stagger; closing drops them top-down with a positive one, so the type feels weighted in both directions rather than simply reversed.",
      },
    ],
    editable: [
      {
        name: "items",
        control: "text",
        description: "Panel index, label, and per-panel image.",
      },
      {
        name: "heroImage",
        control: "asset-url",
        description: "Fullscreen backdrop behind the folded strip.",
      },
      {
        name: "cream / muted / ink",
        control: "color",
        description: "Panel surface, index, and display-type colors.",
      },
    ],
    assets: assetsByIds([
      "folding-panel-menu-hero",
      "folding-panel-menu-img-1",
      "folding-panel-menu-img-2",
      "folding-panel-menu-img-3",
      "folding-panel-menu-img-4",
      "folding-panel-menu-img-5",
    ]),
    api: [
      {
        name: "items",
        type: "FoldingPanelMenuItem[]",
        default: "Five BLANK panels (Why, Who, What, How, Join)",
        description: "Panel index, label, and image for each folded column.",
      },
      {
        name: "heroImage",
        type: "string",
        default: "BLANK-hosted image",
        description: "Fullscreen backdrop shown behind the menu.",
      },
      {
        name: "cream / muted / ink",
        type: "string",
        default: "#eee5d2 / #a39b89 / #2c221d",
        description: "Panel surface, index text, and display-type colors.",
      },
    ],
  },
  "stretch-text-scroll": {
    demoPath: "src/components/demos/stretch-text-scroll.tsx",
    nuance: [
      {
        label: "Height-fitted scaleY",
        description:
          "Each word's target scale is measured live as the panel height divided by the glyph height, so a single word stretches to exactly fill its section rather than to a fixed multiplier that would break at other viewports.",
      },
      {
        label: "Staged final blowup",
        description:
          "On the last panel the word keeps scaling to ten times while its dark wash fades between 25 and 50 percent progress, the word itself fades between 50 and 75, and the headline reads in word by word after 75, so the image, the type, and the copy never overlap.",
      },
    ],
    editable: [
      {
        name: "words",
        control: "text",
        description: "The three oversized panel words that stretch in and out.",
      },
      {
        name: "heroText / header / outroText",
        control: "text",
        description: "Opening line, revealed headline, and closing line.",
      },
      {
        name: "image",
        control: "asset-url",
        description: "Still revealed behind the final scaling panel.",
      },
    ],
    assets: assetsByIds(["stretch-text-scroll-img"]),
    api: [
      {
        name: "words",
        type: "[string, string, string]",
        default: "Overdrive / Static / Friction",
        description: "The three stretched panel words.",
      },
      {
        name: "heroText / header / outroText",
        type: "string",
        default: "BLANK editorial lines",
        description: "Opening, revealed headline, and closing copy.",
      },
      {
        name: "image / embedded",
        type: "string / boolean",
        default: "BLANK-hosted still / true",
        description:
          "Backdrop for the final panel; embedded owns the scroll container.",
      },
    ],
  },
  "arc-spotlight-scroll": {
    demoPath: "src/components/demos/arc-spotlight-scroll.tsx",
    nuance: [
      {
        label: "Bezier arc timing",
        description:
          "Each thumbnail rides a quadratic bezier whose start and end share an x, so the frames bow out to the right and back; a per-index gap and shared speed stagger them into a continuous stream keyed to the same scroll progress that moves the titles.",
      },
      {
        label: "Center-nearest activation",
        description:
          "On every update the title closest to the viewport middle is measured by bounding rect, and only when that index changes does the backdrop still swap and the highlight move, so the active state tracks reading position instead of a fixed step count.",
      },
    ],
    editable: [
      {
        name: "items",
        control: "text",
        description: "Name and still for each entry in the telescope column.",
      },
      {
        name: "items[].img",
        control: "asset-url",
        description: "Backdrop still and arcing thumbnail per entry.",
      },
      {
        name: "intro / outro / introWords / headerLabel",
        control: "text",
        description: "Opening line, closing line, split words, and side label.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 10 }, (_, i) => `arc-spotlight-scroll-img-${i + 1}`),
    ),
    api: [
      {
        name: "items",
        type: "ArcSpotlightItem[]",
        default: "Ten BLANK stills with titles",
        description: "Name and image for each telescope entry.",
      },
      {
        name: "intro / outro / introWords / headerLabel",
        type: "string / string / [string, string] / string",
        default: "BLANK editorial copy / Beneath, Beyond / Discover",
        description: "Framing copy, the split intro words, and the side label.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description: "Owns the scroll container so it fits a bounded box.",
      },
    ],
  },
  "depoluxe-sideways-carousel": {
    demoPath: "src/components/demos/depoluxe-sideways-carousel.tsx",
    nuance: [
      {
        label: "Two linked presentation states",
        description:
          "The idle state is a full-viewport film. Wheel, drag, and the triangular focus zone at the left open the same project data into the diagonal stack, then return it to the film when input settles.",
      },
      {
        label: "Exponential diagonal geometry",
        description:
          "Each neighboring project is half the size of the one before it. Past projects collect along the lower edge while upcoming projects climb the left edge.",
      },
      {
        label: "One inertial target",
        description:
          "Wheel, pointer drag, keyboard navigation, and the slow idle advance all feed one target value that is eased once per animation frame.",
      },
    ],
    editable: [
      {
        name: "projects",
        control: "text",
        description:
          "Project title, director, client, hosted video URL, and starting frame time.",
      },
      {
        name: "brand / claim / nav",
        control: "text",
        description: "Centered masthead and portfolio navigation copy.",
      },
    ],
    assets: assetsByIds([
      "film-studio-page-hero-hero-footage",
      "film-studio-page-contact-contact-hero",
      ...Array.from(
        { length: 8 },
        (_, index) => `film-studio-page-spotlight-spotlight-${index + 1}`,
      ),
    ]),
    api: [
      {
        name: "projects",
        type: "SidewaysProject[]",
        default: "Eight BLANK film projects",
        description:
          "Project metadata, video source, poster, and optional start time used by both carousel states.",
      },
      {
        name: "brand",
        type: "[string, string]",
        default: '["BLANK", "FILMS"]',
        description: "Two-part wordmark aligned across the masthead.",
      },
      {
        name: "claim",
        type: "string",
        default: '"A cinematic practice for image, motion and culture"',
        description: "Italic positioning line below the wordmark.",
      },
      {
        name: "nav",
        type: "Array<{ label: string; href: string }>",
        default: "Five portfolio links",
        description: "Masthead navigation items.",
      },
      {
        name: "className",
        type: "string",
        default: '""',
        description: "Additional class applied to the fullscreen root.",
      },
    ],
  },
  "sticky-stack-cards": {
    demoPath: "src/components/demos/sticky-stack-cards.tsx",
    nuance: [
      {
        label: "Pin-to-last handoff",
        description:
          "Every card but the last pins from its own top down to the final card's top, so each stays fixed while the ones after it slide up over it and the stack builds without any card releasing early.",
      },
      {
        label: "Alternating tilt and shade",
        description:
          "As the next card advances, the card underneath scales to 0.75 and rotates plus or minus five degrees by parity, while a shadow overlay fades in on the same progress, so buried cards read as tilted and dimmed rather than simply covered.",
      },
    ],
    editable: [
      {
        name: "cards",
        control: "text",
        description: "Index, title, image, and description per card.",
      },
      {
        name: "cards[].image",
        control: "asset-url",
        description: "Feature image inside each card.",
      },
      {
        name: "intro / outro / captionLabel",
        control: "text",
        description: "Opening panel, closing panel, and the small caption.",
      },
    ],
    assets: assetsByIds(
      Array.from({ length: 4 }, (_, i) => `sticky-stack-cards-img-${i + 1}`),
    ),
    api: [
      {
        name: "cards",
        type: "StickyStackCard[]",
        default: "Four BLANK principle cards",
        description: "Index, title, image, and description per card.",
      },
      {
        name: "intro / outro / captionLabel",
        type: "string",
        default: "The Foundations / Ends in Form / (About the state)",
        description: "Opening panel, closing panel, and card caption.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description: "Owns the scroll container so it fits a bounded box.",
      },
    ],
  },
  "pixelgrid-studio-page": {
    demoPath: "src/components/demos/pixelgrid-studio-page.tsx",
    studioPath: "src/components/studios/pixelgrid-studio-page.tsx",
    nuance: [
      {
        label: "Generative hero, not a hero image",
        description:
          "The hero backdrop is a canvas particle field, not a static asset: it charges and detonates on click/hold, wanders as a Pac-Man when idle, decodes the headline into real text, and reacts to the smiley faces and the origin story below it. Typing 'blank' or 'pixel', or the classic Konami sequence, triggers a stamped-pixel easter egg.",
      },
      {
        label: "No stock media",
        description:
          "Every case-study tile renders one of four generative canvas modes (thermal, dots, fluid, reveal) instead of client video, so the port never re-hosts another studio's real client work.",
      },
      {
        label: "A playable footer",
        description:
          "The footer's ambient auto-building skyline is clickable: it expands to a full-width Tetris board with score, on-screen controls, and a game-over panel, recreated 1:1 from the source's footer-tetris.js.",
      },
      {
        label: "Renders correctly bounded or full-bleed",
        description:
          "The source pinned its backdrop with `position: fixed` to the real browser viewport, which only works full-bleed. This port uses a CSS-grid sticky overlay and a small scroll-container adapter instead, so the same hero, reveal-on-scroll, and Tetris scroll-to-bottom all work correctly inside this bounded studio panel too.",
      },
    ],
    editable: [],
    assets: [],
    api: [
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description: "Passed to the root wrapper for sizing and layout.",
      },
    ],
  },
  "surprise-box": {
    demoPath: "src/components/demos/surprise-box.tsx",
    nuance: [
      {
        label: "The scene is drawn twice",
        description:
          "A second, pointer-transparent copy of just the front and right faces sits above the confetti layer. Cubes spawn behind it and are promoted in front only when their vertical velocity turns positive, so they read as leaving from inside the box on the way up and falling past it on the way down.",
      },
      {
        label: "Pokes stack, then give",
        description:
          "Each click inside a 400ms combo window raises the poke count. Hop height, tilt, and flap rattle all scale with count over target, and the poke sample plays faster (with pitch correction off) so repeat clicks walk up a scale. Miss the window and the count resets to one.",
      },
      {
        label: "Confetti runs on real gravity",
        description:
          "Cubes are six absolutely positioned faces in a preserve-3d wrapper, integrated at 1600px/s squared with a clamped timestep, tumbling on independent X and Y spin rates. The burst throws one immediate volley then eight more 85ms apart, and the loop stops itself once the last cube clears the floor.",
      },
      {
        label: "The lid opens fast and closes slow",
        description:
          "Opening swaps the flap transition to an overshooting spring with no delay, so all four throw open together. Closing falls back to the base ease with the two long flaps delayed 280ms behind the short ones, so the box tucks its sides in first like real cardboard.",
      },
    ],
    editable: [
      {
        name: "label / specCode / specNote / brand",
        control: "text",
        description: "Printed copy on the front and right faces.",
      },
      {
        name: "pokesToOpen",
        control: "text",
        description: "Clicks inside the combo window before the box bursts.",
      },
      {
        name: "colors",
        control: "color",
        description:
          "Confetti palette. Each entry also produces a 0.7 shade for the cube side faces.",
      },
      {
        name: "sound",
        control: "text",
        description: "Set false to run the box silently.",
      },
    ],
    assets: [
      {
        id: "surprise-box-poke",
        label: "Surprise Box poke sound",
        provider: "vercel-blob",
        pathname: "surprise-box/poke.mp3",
        fallbackPath:
          "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/surprise-box/poke.mp3",
        role: "Poke thud, pitched up a step on every repeat click.",
      },
      {
        id: "surprise-box-land",
        label: "Surprise Box land sound",
        provider: "vercel-blob",
        pathname: "surprise-box/box_land.mp3",
        fallbackPath:
          "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/surprise-box/box_land.mp3",
        role: "Cardboard landing hit fired as the hop settles back down.",
      },
      {
        id: "surprise-box-explode",
        label: "Surprise Box burst sound",
        provider: "vercel-blob",
        pathname: "surprise-box/box_explode.mp3",
        fallbackPath:
          "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/surprise-box/box_explode.mp3",
        role: "Burst that fires with the lid opening and the confetti wave.",
      },
      {
        id: "surprise-box-close",
        label: "Surprise Box close sound",
        provider: "vercel-blob",
        pathname: "surprise-box/box_close.mp3",
        fallbackPath:
          "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/surprise-box/box_close.mp3",
        role: "Flaps folding shut when the box resets after a burst.",
      },
    ],
    api: [
      {
        name: "label",
        type: "string",
        default: '"aryank.space"',
        description: "Wordmark printed along the bottom of the front face.",
      },
      {
        name: "specCode / specNote",
        type: "string",
        default: '"BLK-STD-01" / "HANDLE WITH CARE"',
        description: "Stencil lines printed at the top of the front face.",
      },
      {
        name: "brand",
        type: "string",
        default: '"Powered by BLANK"',
        description: "Credit line printed on the right face beside the mark.",
      },
      {
        name: "pokesToOpen",
        type: "number",
        default: "5",
        description:
          "Pokes needed inside the 400ms combo window before the lid bursts open.",
      },
      {
        name: "colors",
        type: "string[]",
        default: "15 hex colors",
        description:
          "Confetti palette; each color also yields a 0.7 shade used on alternating cube faces.",
      },
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description: "Whether poke, land, burst, and close cues play.",
      },
      {
        name: "assetBase",
        type: "string",
        default: "hosted /assets/surprise-box",
        description:
          "Origin serving poke.mp3, box_land.mp3, box_explode.mp3, and box_close.mp3.",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        default: "undefined",
        description:
          "Applied to the root; the box fills whatever box you give it.",
      },
    ],
  },
  "starry-night-flow": {
    demoPath: "src/components/demos/starry-night-flow.tsx",
    nuance: [
      {
        label: "The flow field comes from the pixels",
        description:
          "The original Still Night ships a hand-baked flow texture for one painting. This port computes brushstroke direction and coherence at load time with a structure tensor over the luminance field, so any painterly image produces its own flow.",
      },
      {
        label: "Dither decides who exists",
        description:
          "Floyd-Steinberg error diffusion in linear light picks which pixels become particles, so particle density is proportional to brightness: the moon and stars are dense, the night sky is sparse. Each particle keeps its original canvas color.",
      },
      {
        label: "Only coherent strokes move",
        description:
          "Particles below the coherence threshold hold still at full opacity, anchoring the painting. Strong strokes cycle through staggered drift lifecycles (fade in, S-curve drift along the stroke, fade out), with wind gust noise traveling along the flow direction.",
      },
      {
        label: "The cursor is a wind source",
        description:
          "While the pointer moves, painted flow near it bends toward the cursor's direction of travel and particles take shorter, denser trips. Influence eases in and decays when the pointer rests.",
      },
    ],
    editable: [
      {
        name: "src",
        control: "asset-url",
        description: "The painting sampled into the particle field.",
      },
      {
        name: "background",
        control: "color",
        description: "Canvas clear color behind the particles.",
      },
      {
        name: "cyclePeriod / maxDrift / gustAmplitude",
        control: "text",
        description:
          "Motion energy: lifecycle length, drift distance, wind surge strength.",
      },
    ],
    assets: [
      {
        id: "starry-night-flow-painting",
        label: "Starry Night Flow painting",
        provider: "vercel-blob",
        pathname: "starry-night-flow/starry-night.webp",
        fallbackPath:
          "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/starry-night-flow/starry-night.webp",
        role: "Van Gogh's The Starry Night, sampled into the dithered particle field.",
      },
    ],
    api: [
      {
        name: "src",
        type: "string",
        default: "hosted Starry Night webp",
        description: "CORS-readable image URL sampled into the particle field.",
      },
      {
        name: "background",
        type: "string",
        default: '"#0b0b0d"',
        description: "Canvas clear color.",
      },
      {
        name: "resolution / density",
        type: "number",
        default: "640 / 1",
        description:
          "Sampling width in pixels and the fraction of dithered points kept.",
      },
      {
        name: "cyclePeriod / driftFrac / maxDrift",
        type: "number",
        default: "6 / 0.9 / 0.02",
        description:
          "Drift lifecycle: seconds per cycle, drifting fraction of the cycle, and max UV displacement.",
      },
      {
        name: "flowThreshold",
        type: "number",
        default: "0.25",
        description:
          "Minimum stroke coherence required for a particle to join the flow.",
      },
      {
        name: "gustAmplitude / gustPeriod",
        type: "number",
        default: "0.75 / 10",
        description: "Wind surge intensity and cycle length in seconds.",
      },
      {
        name: "colorBoost / pointScale",
        type: "number",
        default: "0.35 / 1",
        description:
          "Blend toward peak-normalized luminous color, and particle size multiplier.",
      },
      {
        name: "cursorRadius / interactive",
        type: "number / boolean",
        default: "0.14 / true",
        description:
          "Pointer steering radius in UV units, and whether steering is enabled.",
      },
    ],
  },
  "strip-merge-reveal": {
    demoPath: "src/components/demos/strip-merge-reveal.tsx",
    nuance: [
      {
        label: "Three timelines, no shared clock",
        description:
          "Counter, status list, and image reveal are separate timelines with their own delays. Nothing waits on anything else, so the counter can still be climbing while the strips have already merged, which is what makes the intro feel busy rather than choreographed.",
      },
      {
        label: "The status list is one window, not three fades",
        description:
          "All three lines live in a column inside a one line tall clip, and the column steps by exactly its line height. Each move is a single tween on the same element, so the lines cannot drift out of register with each other.",
      },
      {
        label: "The closed gap is resolved before GSAP sees it",
        description:
          "The row is sized in container units so it scales with the box, but GSAP cannot interpolate a cqw value. The closed gap is converted to pixels against the component's own width first, which is why the merge lands identically at any size.",
      },
    ],
    editable: [
      {
        name: "brand",
        control: "text",
        description:
          "Name in the nav and in the headline that rises at the end.",
      },
      {
        name: "statusLines",
        control: "text",
        description: "The three lines stepped through during the load.",
      },
    ],
    assets: stripMergeRevealAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "5 BLANK strips",
        description:
          "Strips in the row. Any count works; the one at heroIndex is the one that survives.",
      },
      {
        name: "heroIndex",
        type: "number",
        default: "2",
        description:
          "Which strip stays and doubles once the others have wiped away.",
      },
      {
        name: "navItems / statusLines",
        type: "string[]",
        default: "BLANK copy",
        description: "Navigation links and the three loading lines.",
      },
      {
        name: "overlayColor",
        type: "string",
        default: "#0f0f0f",
        description: "Colour of the dark card that lifts away at the end.",
      },
    ],
  },
  "parallax-model-footer": {
    demoPath: "src/components/demos/parallax-model-footer.tsx",
    nuance: [
      {
        label: "The offset is the effect",
        description:
          "The footer content starts at minus thirty five percent of the footer's height and is driven to zero across the footer's entry. The footer itself never moves, so the parallax costs one transform and no pinning.",
      },
      {
        label: "The model settles on scroll, drifts on pointer",
        description:
          "Scroll progress sets a base Z and base X rotation; the pointer adds an offset on top. Both are applied through the same eased follow in the render loop, so a scroll and a mouse move mid-flight blend instead of fighting.",
      },
      {
        label: "Pointer is measured against the component",
        description:
          "The source normalises the mouse against the window. Here it is normalised against the component's own rect, so the tilt still reaches full range when the footer occupies part of the screen.",
      },
    ],
    editable: [
      {
        name: "statement",
        control: "text",
        description: "The large closing line in the footer.",
      },
      {
        name: "metaRight",
        control: "text",
        description: "Credit line in the bottom right.",
      },
    ],
    assets: parallaxModelFooterAssetDocs,
    api: [
      {
        name: "modelSrc",
        type: "string",
        default: "BLANK model.glb",
        description:
          "GLTF loaded behind the footer. It is auto-centred and scaled to a unit box, so any model fits.",
      },
      {
        name: "sections",
        type: "ParallaxModelFooterSection[]",
        default: "3 colour blocks",
        description:
          "Page above the footer, present only so the footer has something to arrive from.",
      },
      {
        name: "links / statusLabel / statusValue",
        type: "string[] / string / string",
        default: "BLANK copy",
        description: "Footer column contents.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
  "rotating-halves-menu": {
    demoPath: "src/components/demos/rotating-halves-menu.tsx",
    nuance: [
      {
        label: "Scaled twice over so the corners never show",
        description:
          "Each panel is scaled 2x before being rotated about the seam edge. Without that the rotating rectangle's corners would sweep inside its own clip and leave a wedge of background visible mid-turn.",
      },
      {
        label: "One paused timeline, played and reversed",
        description:
          "Open and close are the same timeline run in both directions, so an interrupted close resumes from wherever it was rather than snapping to a start state.",
      },
      {
        label: "Links rise late on purpose",
        description:
          "The masked lines start at 0.6s, while the panels take a full second. They arrive over a surface that is already mostly filled, which reads as the menu settling rather than two separate animations.",
      },
    ],
    editable: [
      {
        name: "primaryLinks",
        control: "text",
        description: "Uppercase column of the menu.",
      },
      {
        name: "secondaryLinks",
        control: "text",
        description: "Serif column of the menu.",
      },
    ],
    assets: rotatingHalvesMenuAssetDocs,
    api: [
      {
        name: "leftPanelColor / rightPanelColor",
        type: "string",
        default: "#474437 / #403d31",
        description:
          "The two halves. Two close values read as one surface with a fold; two distant ones read as a split.",
      },
      {
        name: "heroImage / heroHeading",
        type: "string",
        default: "BLANK hero",
        description: "Page behind the menu.",
      },
      {
        name: "footerLinks / footerNote",
        type: "string[] / string",
        default: "BLANK copy",
        description: "Legal row along the bottom of the open menu.",
      },
    ],
  },
  "stacked-brand-cards": {
    demoPath: "src/components/demos/stacked-brand-cards.tsx",
    nuance: [
      {
        label: "Every card ends at the same trigger",
        description:
          "All the pins share one endTrigger, the outro. That is why the deck releases together instead of unstacking in the order it stacked.",
      },
      {
        label: "The lift scales with what is left",
        description:
          "A card's inner panel is pulled up by (remaining cards) x 14% of the viewport, so the first card travels furthest. Equal lifts would produce a flat overlap rather than a compressed pile.",
      },
      {
        label: "pinSpacing is off everywhere",
        description:
          "With pin spacing on, each pin would insert its own duration of blank scroll and the cards would never meet. Off, they share the same stretch of page, which is what puts them on top of each other.",
      },
    ],
    editable: [
      {
        name: "introHeading",
        control: "text",
        description: "The pinned line above the deck.",
      },
      {
        name: "outroHeading",
        control: "text",
        description: "Closing line that releases the pins.",
      },
    ],
    assets: stackedBrandCardsAssetDocs,
    api: [
      {
        name: "cards",
        type: "StackedBrandCard[]",
        default: "4 BLANK services",
        description:
          "Title, copy, image, and background per card. The last card does not pin, it scrolls over the pile.",
      },
      {
        name: "heroImage",
        type: "string",
        default: "BLANK hero",
        description: "Opening full-bleed image.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
  "cylinder-block-gallery": {
    demoPath: "src/components/demos/cylinder-block-gallery.tsx",
    nuance: [
      {
        label: "The panels are bent, not billboarded",
        description:
          "Each panel is a generated buffer geometry whose vertices follow the cylinder's arc. A flat plane rotated to the same angle would visibly chord away from the wall at this radius.",
      },
      {
        label: "UVs are inset a tenth on each side",
        description:
          "The horizontal UV runs 0.1 to 0.9 rather than 0 to 1, so the edge texels are never stretched across the curve. It costs a slight crop and removes the smear at the panel edges.",
      },
      {
        label: "Spin is base plus impulse",
        description:
          "The ring always turns at a constant crawl; scroll velocity is added on top and is overwritten by the next scroll event. Stopping the scroll leaves the idle rotation behind rather than a dead ring.",
      },
    ],
    editable: [
      {
        name: "rows",
        control: "text",
        description: "Horizontal bands of panels up the cylinder.",
      },
      {
        name: "panelsPerRow",
        control: "text",
        description: "Panels evenly spaced around each band.",
      },
    ],
    assets: cylinderBlockGalleryAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "50 BLANK photographs",
        description:
          "Pool drawn from at random per panel, so the same set gives a different wall each mount.",
      },
      {
        name: "rows / panelsPerRow / rowSpacing",
        type: "number",
        default: "12 / 4 / 3.25",
        description:
          "Density of the wall. More panels per row with less spacing reads as a mosaic; fewer reads as an archive.",
      },
      {
        name: "panelSize",
        type: "[number, number]",
        default: "[5, 3]",
        description: "Panel width and height in world units before the curve.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
  "floating-model-scroll": {
    demoPath: "src/components/demos/floating-model-scroll.tsx",
    nuance: [
      {
        label: "Two motions on one object",
        description:
          "The bob runs off wall clock time and the rotation runs off scroll progress. Neither is a timeline, so the object keeps breathing when the page is still and keeps bobbing while it is being scrubbed.",
      },
      {
        label: "The cheap loop runs first",
        description:
          "A render-only loop starts before the model arrives, so the canvas is composited and sized correctly from the first frame; the animated loop replaces it once the file lands.",
      },
      {
        label: "Copy passes through the model, not around it",
        description:
          "The canvas layer sits above the scrolling content with pointer events off. That is what lets the headline slide behind the object instead of the object sitting in a boxed-out slot.",
      },
    ],
    editable: [
      {
        name: "headingRows",
        control: "text",
        description: "The three lines of the opening statement.",
      },
      {
        name: "archiveLabel",
        control: "text",
        description: "Small italic label above the collection list.",
      },
    ],
    assets: floatingModelScrollAssetDocs,
    api: [
      {
        name: "modelSrc",
        type: "string",
        default: "BLANK chair.glb",
        description:
          "GLTF product. It is centred and the camera distance is derived from its bounding box, so any model frames itself.",
      },
      {
        name: "archiveItems",
        type: "FloatingModelArchiveItem[]",
        default: "6 BLANK products",
        description: "Title plus four metadata columns per row.",
      },
      {
        name: "outroCopy / contactRows / footerCopy",
        type: "string / [string, string][] / string",
        default: "BLANK copy",
        description: "Closing section, revealed line by line on entry.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
  "particle-fluid-hero": {
    demoPath: "src/components/demos/particle-fluid-hero.tsx",
    nuance: [
      {
        label: "Density is the whole trick",
        description:
          "Every close pair raises a density count on both bodies, and that count is then read back to soften gravity, the separation correction, and the velocity blend for that frame. Without it a settled pile keeps injecting energy into itself and boils.",
      },
      {
        label: "Neighbours come from a hash, not a scan",
        description:
          "Bodies are bucketed into cells the width of the interaction radius each frame, and only the nine surrounding cells are tested. Two hundred and fifty bodies at full quadratic cost would be thirty thousand pair tests per frame.",
      },
      {
        label: "Drawn between the last two positions",
        description:
          "Each shape is rendered at the midpoint of its previous and current position rather than at its current one. It is a half-frame of motion blur for free, and it hides the jitter from the position corrections.",
      },
    ],
    editable: [
      {
        name: "particleCount",
        control: "text",
        description: "Bodies in the pit.",
      },
      {
        name: "background",
        control: "color",
        description: "Field colour, repainted every frame.",
      },
    ],
    assets: [],
    api: [
      {
        name: "particleCount / particleSize",
        type: "number",
        default: "250 / 12",
        description:
          "Size also sets the interaction radius, which is twelve times the shape, so raising it thickens the fluid as well as the shapes.",
      },
      {
        name: "background / particleColor",
        type: "string",
        default: "#1a2ffb / #ffffff",
        description: "Field and shape colours.",
      },
      {
        name: "eyebrow / headingLines / ctaLabel",
        type: "string / string[] / string",
        default: "BLANK copy",
        description: "The call to action floating over the field.",
      },
    ],
  },
  "emoji-trail-preloader": {
    demoPath: "src/components/demos/emoji-trail-preloader.tsx",
    nuance: [
      {
        label: "The trail only exists while loading",
        description:
          "Badges spawn only before the loader hands off. The playable moment is deliberately confined to the wait, so the page it reveals is not left with a decoration that outstays it.",
      },
      {
        label: "Spacing is distance, staggering is time",
        description:
          "A badge needs four hundred pixels of pointer travel to spawn, but the fall is additionally delayed by how recently the last one dropped. Distance alone would let one fast sweep drop a whole row at once.",
      },
      {
        label: "Each badge cleans itself up",
        description:
          "The fall tween's completion removes the element. Nothing tracks the trail, so a long wait cannot accumulate hundreds of nodes.",
      },
    ],
    editable: [
      {
        name: "headingRows",
        control: "text",
        description: "Headline rows, split to characters that rise per row.",
      },
      {
        name: "heroBackground",
        control: "color",
        description: "Page colour revealed under the loader.",
      },
    ],
    assets: emojiTrailPreloaderAssetDocs,
    api: [
      {
        name: "badges",
        type: "string[]",
        default: "4 BLANK badges",
        description: "Pool drawn from at random for each drop.",
      },
      {
        name: "heroImage",
        type: "string",
        default: "BLANK badge",
        description:
          "Centre image that pops in and then spins continuously for twenty seconds a turn.",
      },
      {
        name: "cursor",
        type: "string",
        default: "BLANK cursor.svg",
        description: "Custom pointer, hot spot at 32 32.",
      },
      {
        name: "preloaderBackground / loaderColor",
        type: "string",
        default: "#ded7ce / #c5beb5",
        description: "The loading card and the square rotating on it.",
      },
    ],
  },
  "garage-scene-3d": {
    demoPath: "src/components/demos/garage-scene-3d.tsx",
    nuance: [
      {
        label: "Ambient is zero on purpose",
        description:
          "Nothing is lit for legibility. Every visible surface is reached by one of four points with hand-tuned decay, which is why the room has deep unlit corners instead of a flat floor.",
      },
      {
        label: "Bloom does the neon, not the materials",
        description:
          "The lights are ordinary point lights; the glow is an UnrealBloom pass reading the tone-mapped render. Raising the strength spreads the halo without touching a single material.",
      },
      {
        label: "The orbit is fenced",
        description:
          "Polar angle is clamped to a half turn and distance to a ten-to-fifty range, so the camera cannot pass through the floor or leave the room and expose the model's open back.",
      },
    ],
    editable: [
      {
        name: "bloomStrength",
        control: "text",
        description: "How far the hot spots bleed.",
      },
      {
        name: "background",
        control: "color",
        description: "Scene clear colour behind the model.",
      },
    ],
    assets: garageScene3DAssetDocs,
    api: [
      {
        name: "modelSrc",
        type: "string",
        default: "BLANK scene.gltf",
        description:
          "GLTF interior, auto-centred on load. Its scene.bin and textures/ must sit beside it.",
      },
      {
        name: "bloomStrength",
        type: "number",
        default: "0.6",
        description: "UnrealBloom strength. Radius and threshold stay fixed.",
      },
      {
        name: "brand / navItems / statement / credit",
        type: "string / string[] / string / string",
        default: "BLANK copy",
        description: "Overlay chrome sitting above the canvas.",
      },
    ],
  },
  "wheel-clip-slider": {
    demoPath: "src/components/demos/wheel-clip-slider.tsx",
    nuance: [
      {
        label: "The frame opens, it does not travel",
        description:
          "The incoming slide is already full size and full bleed; only its clip-path changes. Nothing slides, which is why the transition reads as a reveal rather than a carousel step.",
      },
      {
        label: "Two images cross in depth",
        description:
          "Outgoing goes to scale two, incoming comes from scale two down to one, both over the same two seconds. The overlap is what sells the depth; matching the durations is what keeps them from fighting.",
      },
      {
        label: "The DOM stays at five nodes",
        description:
          "Slides are created on demand and anything more than two away is removed after each transition, so scrolling a hundred times does not accumulate a hundred images.",
      },
    ],
    editable: [
      {
        name: "prefix",
        control: "text",
        description: "Fixed first word of the title.",
      },
      {
        name: "words",
        control: "text",
        description: "Column stepped one row per slide.",
      },
    ],
    assets: wheelClipSliderAssetDocs,
    api: [
      {
        name: "images / words / linkUrls",
        type: "string[]",
        default: "5 BLANK entries",
        description:
          "Indexes are wrapped, so the slider loops in both directions regardless of count.",
      },
      {
        name: "lineHeight / fontSize",
        type: "number",
        default: "150 / 120",
        description:
          "The word column steps by exactly lineHeight, so the two must move together.",
      },
      {
        name: "accent",
        type: "string",
        default: "#f9b165",
        description: "Title, indicator, ring, and label colour.",
      },
    ],
  },
  "rotating-panel-slider": {
    demoPath: "src/components/demos/rotating-panel-slider.tsx",
    nuance: [
      {
        label: "Frame turns, picture does not",
        description:
          "Each panel is rotated to its station and its inner image is tweened to the exact negative of that rotation. The photograph stays upright while its frame lies flat, which is the whole illusion.",
      },
      {
        label: "Four panels for three slots",
        description:
          "A replacement is built at scale zero in the slot being vacated before the far panel is scaled away, so the arc is never seen with a gap in it.",
      },
      {
        label: "Class names are the state machine",
        description:
          "prev/active/next are read back out of the DOM to find the panels, then reassigned after two seconds. There is no separate index for panel identity, only for content.",
      },
    ],
    editable: [
      { name: "brand", control: "text", description: "Wordmark in the nav." },
      {
        name: "footerLeft",
        control: "text",
        description: "Experiment label, bottom right.",
      },
    ],
    assets: rotatingPanelSliderAssetDocs,
    api: [
      {
        name: "slides",
        type: "RotatingPanelSlide[]",
        default: "7 BLANK entries",
        description:
          "Name and image per slide. The index list, counter, title, and backdrop all read from this one array.",
      },
      {
        name: "brand / navLink",
        type: "string",
        default: "BLANK copy",
        description: "Navigation row.",
      },
      {
        name: "footerLeft / footerRight",
        type: "string",
        default: "BLANK copy",
        description: "Footer row.",
      },
    ],
  },
  "flip-tile-board": {
    demoPath: "src/components/demos/flip-tile-board.tsx",
    nuance: [
      {
        label: "One image, thirty six windows",
        description:
          "Every tile paints the same picture at six hundred percent and offsets it by its own column and row. Change the source image and the whole board re-slices itself with no other work.",
      },
      {
        label: "The yaw comes from the column",
        description:
          "Tilt is picked by index modulo six: forty degrees at the edges, ten in the middle, mirrored either side. A single shared value would read as the whole row rotating rather than splaying.",
      },
      {
        label: "Cooldown is per tile, not global",
        description:
          "Each tile keeps its own last-entered timestamp, so sweeping across the board triggers every tile once but re-entering one within a second does nothing.",
      },
    ],
    editable: [
      {
        name: "flipLabel",
        control: "text",
        description: "Label on the flip-all button.",
      },
      { name: "brand", control: "text", description: "Wordmark in the nav." },
    ],
    assets: flipTileBoardAssetDocs,
    api: [
      {
        name: "frontImage / backImage",
        type: "string",
        default: "BLANK photographs",
        description: "Sliced across the fronts and the backs of the grid.",
      },
      {
        name: "rows / cols",
        type: "number",
        default: "6 / 6",
        description:
          "The background offset step is fixed at twenty percent, which is what a six by six grid needs; other sizes re-slice but will crop.",
      },
      {
        name: "blockSize / cooldown",
        type: "number",
        default: "50 / 1000",
        description:
          "Cursor highlight cell size in px, and per-tile re-entry lockout in ms.",
      },
    ],
  },
  "cycle-scrub-showcase": {
    demoPath: "src/components/demos/cycle-scrub-showcase.tsx",
    nuance: [
      {
        label: "One number is both the index and the easing",
        description:
          "Progress times the project count gives a value whose integer part selects the project and whose fraction drives the scale and the bar. There is no separate index state to fall out of sync with the scroll.",
      },
      {
        label: "Reversing is a different animation",
        description:
          "Forward, the outgoing frame shrinks to half and fades. Backward, it re-clips downward and blows its contrast out. Playing the forward transition in reverse would lose the film-burn look the entry has.",
      },
      {
        label: "The swap is discrete inside a scrub",
        description:
          "Crossing an integer boundary fires one-shot tweens rather than scrubbed ones, so a slow scroll through a boundary still gets the full entry at full speed.",
      },
    ],
    editable: [
      {
        name: "linkLabel",
        control: "text",
        description: "Label on the project link.",
      },
      {
        name: "outroCopy",
        control: "text",
        description: "Copy in the section after the pin.",
      },
    ],
    assets: cycleScrubShowcaseAssetDocs,
    api: [
      {
        name: "projects",
        type: "CycleScrubProject[]",
        default: "5 BLANK projects",
        description:
          "Title, tagline, year, tag, link, and image. The cycle count is the array length, so adding a project lengthens the pin automatically.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
  "split-click-slider": {
    demoPath: "src/components/demos/split-click-slider.tsx",
    nuance: [
      {
        label: "The frame is the control",
        description:
          "There are no arrows. A click is measured against the slider's own midpoint, so the left half goes back and the right half forward, and the thumbnails opt out of that by returning early.",
      },
      {
        label: "Both images move, in the same direction",
        description:
          "The outgoing picture slides 500px one way while the incoming one arrives from 500px the other. Only moving the new image would read as a wipe; moving both is what gives it depth.",
      },
      {
        label: "The plus marks never reset",
        description:
          "Rotation accumulates by 90 degrees per change rather than being set from the index, so going back and forth keeps winding them instead of snapping to a canonical angle.",
      },
    ],
    editable: [
      {
        name: "navLinks",
        control: "text",
        description: "Links centred at the top.",
      },
      {
        name: "counterStep",
        control: "text",
        description: "Row height of the counter strip, in px.",
      },
    ],
    assets: splitClickSliderAssetDocs,
    api: [
      {
        name: "slides",
        type: "SplitClickSlide[]",
        default: "5 BLANK slides",
        description:
          "Title and image. Drives the layers, the title strip, the counter, and the thumbnails.",
      },
      {
        name: "counterStep / titleStep",
        type: "number",
        default: "20 / 60",
        description:
          "Both strips step by exactly one row, so these must match the CSS line heights.",
      },
    ],
  },
  "drifting-card-marquee": {
    demoPath: "src/components/demos/drifting-card-marquee.tsx",
    nuance: [
      {
        label: "Paths are authored, not simulated",
        description:
          "Each card has four y stops and four rotation stops. Progress times three picks the segment and the remainder interpolates inside it, which is why the cards arc and tumble on distinct routes rather than sharing one curve.",
      },
      {
        label: "Cards are staggered by slicing progress",
        description:
          "A card's progress is (progress - index * 0.1125) * 2, clamped. The delay staggers the entries and the doubling means each card finishes its route before the pin ends.",
      },
      {
        label: "The wordmark pan is measured, not guessed",
        description:
          "Translation is the header's real overflow (offsetWidth minus the viewport), so the last letter lands exactly at the right edge whatever the text or the screen width.",
      },
    ],
    editable: [
      {
        name: "heading",
        control: "text",
        description: "The oversized wordmark that pans.",
      },
      {
        name: "outroCopy",
        control: "text",
        description: "Copy in the section after the pin.",
      },
    ],
    assets: driftingCardMarqueeAssetDocs,
    api: [
      {
        name: "cards",
        type: "DriftingCard[]",
        default: "5 BLANK cards",
        description: "Title, description, and image per drifting card.",
      },
      {
        name: "transforms",
        type: "[number[], number[]][]",
        default: "5 authored routes",
        description:
          "Per card, four y-percent stops and four rotation stops. Must have one entry per card.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
  "contact-sheet-zoom": {
    demoPath: "src/components/demos/contact-sheet-zoom.tsx",
    nuance: [
      {
        label: "The container never scales",
        description:
          "Each tile is displaced along its own vector from the centre and scaled individually. Scaling the container instead would keep the grid rigid; this is what lets the sheet fan out.",
      },
      {
        label: "The spread is deliberately anisotropic",
        description:
          "1200 across against 600 down. Equal multipliers would fan it uniformly; the mismatch is what makes it read as a wall you pan rather than a zoom.",
      },
      {
        label: "A transparent layer takes the drag",
        description:
          "Tiles are pointer-events: none and a full-bleed layer is switched on only while zoomed. Without it, every one of the twelve hundred images would try to start a native image drag.",
      },
    ],
    editable: [
      {
        name: "brand",
        control: "text",
        description: "Label on the floating pill.",
      },
      {
        name: "totalRows",
        control: "text",
        description: "Rows of tiles on the sheet.",
      },
    ],
    assets: contactSheetZoomAssetDocs,
    api: [
      {
        name: "images",
        type: "string[]",
        default: "50 BLANK photographs",
        description:
          "Pool drawn from at random per tile, so each mount lays out differently.",
      },
      {
        name: "totalRows / imagesPerRow",
        type: "number",
        default: "20 / 60",
        description:
          "Tile count is the product of these. The tile width is a calc against imagesPerRow, so changing it needs the CSS changed with it.",
      },
      {
        name: "zoomScale / spread",
        type: "number / [number, number]",
        default: "5 / [1200, 600]",
        description:
          "Per-tile scale at full zoom, and the horizontal and vertical fan multipliers.",
      },
    ],
  },
  "service-index-scrub": {
    demoPath: "src/components/demos/service-index-scrub.tsx",
    nuance: [
      {
        label: "Distance selects, it does not scrub",
        description:
          "The active index is the floor of scroll distance over one viewport, so each service holds for a full screen and the change is a discrete transition rather than a scrubbed one.",
      },
      {
        label: "Label widths are measured, not guessed",
        description:
          "A hidden node is rendered at the real display font and each label's width read off it before anything animates. That is what lets the indicator hug names of very different lengths.",
      },
      {
        label: "One strip, not eight crossfades",
        description:
          "All the images live in a single tall column translated by exactly one image height, so the media change is one transform and can never desync from the label.",
      },
    ],
    editable: [
      {
        name: "accent",
        control: "color",
        description: "Separator and outro colour.",
      },
      {
        name: "heroCopy",
        control: "text",
        description: "Prompt at the bottom of the opening image.",
      },
    ],
    assets: serviceIndexScrubAssetDocs,
    api: [
      {
        name: "services",
        type: "ServiceIndexEntry[]",
        default: "8 BLANK services",
        description:
          "Label, copy, and image. The pin length is one viewport per entry, so the list length sets the scroll distance.",
      },
      {
        name: "serviceHeight / imgHeight",
        type: "number",
        default: "38 / 250",
        description:
          "Row height and image frame height in px. Both are step sizes for transforms, so they must match the CSS.",
      },
      {
        name: "embedded",
        type: "boolean",
        default: "true",
        description:
          "Own the scroll container. Set false to drive it from the window scroll.",
      },
    ],
  },
};

export function getComponentMeta(name: string): ComponentMeta | undefined {
  return componentMeta[name];
}
