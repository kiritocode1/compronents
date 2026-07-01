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
        label: "Source export, not a repaint",
        description:
          "The component frames the exported Format Archive source site, including its preloader, cart drawer, product catalogue, editorial routes, GSAP reveals, Lenis scroll, and view-transition choreography.",
      },
      {
        label: "The full route set is preserved",
        description:
          "The hosted bundle includes the homepage, catalogue, archive, info, 15 product detail pages, the editorial index, and 5 article pages.",
      },
      {
        label: "Blob carries the heavy parts",
        description:
          "The generated static site bundle, hero GIF, product imagery, editorial imagery, CSS, and JavaScript chunks are stored in Vercel Blob and streamed through a hosted template route.",
      },
    ],
    editable: [
      {
        name: "assetBase",
        control: "text",
        description: "Hosted template base, defaults to the Compronents route.",
      },
      {
        name: "route",
        control: "text",
        description:
          "Start the frame on catalogue, archive, editorial, info, or a source detail route.",
      },
    ],
    assets: archiveCommercePageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/archive-commerce-page"',
        description:
          "Hosted base URL for the static source export. The hosted route streams Blob files with iframe-safe headers.",
      },
      {
        name: "route",
        type: "string",
        default: '""',
        description:
          "Optional source route such as catalogue, archive, editorial, or catalogue/mirror-orb-mockup.",
      },
      {
        name: "height",
        type: "CSSProperties['height']",
        default: '"100svh"',
        description: "Frame height for embeds, previews, and studio canvases.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional class added to the frame wrapper.",
      },
    ],
  },
  "interior-studio-page": {
    demoPath: "src/components/demos/interior-studio-page.tsx",
    studioPath: "src/components/studios/interior-studio-page.tsx",
    nuance: [
      {
        label: "Terrene source export",
        description:
          "The component frames the exported Terrene source site with homepage, studio, spaces, sample-space, blueprints, and connect routes intact.",
      },
      {
        label: "Motion stack is preserved",
        description:
          "Lenis, GSAP, ScrollTrigger, SplitType copy reveals, the animated menu, preloader sequence, spotlight gallery, review carousel, and view-transition navigation remain in the hosted bundle.",
      },
      {
        label: "Source media stays in Blob",
        description:
          "The Terrene logos, home hero, studio images, spaces, clients, reviews, gallery, archive, process, and spotlight imagery are uploaded under the source pathnames in Vercel Blob.",
      },
    ],
    editable: [
      {
        name: "assetBase",
        control: "text",
        description: "Hosted template base, defaults to the Compronents route.",
      },
      {
        name: "route",
        control: "text",
        description:
          "Start the frame on studio, spaces, sample-space, blueprints, or connect.",
      },
    ],
    assets: interiorStudioPageAssetDocs,
    api: [
      {
        name: "assetBase",
        type: "string",
        default: '"https://ui.aryank.space/interior-studio-page"',
        description:
          "Hosted base URL for the static Terrene export. The route streams Blob files with iframe-safe headers.",
      },
      {
        name: "route",
        type: "string",
        default: '""',
        description:
          "Optional source route such as studio, spaces, sample-space, blueprints, or connect.",
      },
      {
        name: "height",
        type: "CSSProperties['height']",
        default: '"100svh"',
        description: "Frame height for embeds, previews, and studio canvases.",
      },
      {
        name: "className",
        type: "string",
        description: "Optional class added to the frame wrapper.",
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
        label: "A product world before a product grid",
        description:
          "The first viewport uses a gridded light field, side signals, and a centered wordmark to establish atmosphere before showing the catalog.",
      },
      {
        label: "High contrast but not one-note",
        description:
          "The accent can move from hazard yellow to cyan or orange while muted copy and image grids keep the page readable.",
      },
      {
        label: "Catalog and team are part of the page",
        description:
          "Featured releases, active catalog cards, and operator portraits are included so the composition works as a launch page.",
      },
    ],
    editable: [
      {
        name: "title / leftSignal / rightSignal / manifesto",
        control: "text",
        description: "Hero labels, image alt title, and central statement.",
      },
      {
        name: "background / textColor / mutedColor / accentColor",
        control: "color",
        description: "Dark catalog palette and signal color.",
      },
      {
        name: "logoImage / featuredImages / catalogImages / teamImages",
        control: "asset-url",
        description: `Blob-hosted media starting at ${getHostedAssetUrl(
          "dark-catalog-page/wordmark.png",
        )}.`,
      },
    ],
    assets: darkCatalogPageAssetDocs,
    api: [
      {
        name: "title / leftSignal / rightSignal / manifesto",
        type: "string",
        default: "BLANK LOCK / signal labels / manifesto copy",
        description: "Hero and manifesto copy.",
      },
      {
        name: "logoImage",
        type: "string",
        default: '".../dark-catalog-page/wordmark.png"',
        description: "Centered hero wordmark image.",
      },
      {
        name: "featuredImages / catalogImages / teamImages",
        type: "string[]",
        default: "4 featured / 4 catalog / 5 team images",
        description: "Image sets for release tiles, catalog cards, and team.",
      },
      {
        name: "background / textColor / mutedColor / accentColor",
        type: "string",
        default: '"#050507" / "#e9e5d7" / "#807a70" / "#ddff39"',
        description: "Page palette and signal accent.",
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
        default: '"https://compronents.dev/assets/ascii-logo/logo.png"',
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
          '"https://compronents.dev/assets/animated-footer/blank-hand-right.png"',
        description:
          "Left hand image, sampled into ASCII. Defaults to the Compronents asset route backed by Vercel Blob.",
      },
      {
        name: "rightImage",
        type: "string",
        default:
          '"https://compronents.dev/assets/animated-footer/blank-hand-left.png"',
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
};

export function getComponentMeta(name: string): ComponentMeta | undefined {
  return componentMeta[name];
}
