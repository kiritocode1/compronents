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
const lemonBureauPageAssetDocs = pageAssets("lemon-bureau-page-", 5);
const velascoSolariPageAssetDocs = pageAssets("velasco-solari-page-", 5);
const sorenPageAssetDocs = pageAssets("soren-page-", 5);
const neotericPageAssetDocs = pageAssets("neoteric-page-", 5);
const unusualStudioPageAssetDocs = pageAssets("unusual-studio-page-", 5);

export const componentMeta: Record<string, ComponentMeta> = {
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
        description:
          "Base URL prefixed to every image the template renders.",
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
        description:
          "Base URL prefixed to every image the template renders.",
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
};

export function getComponentMeta(name: string): ComponentMeta | undefined {
  return componentMeta[name];
}
