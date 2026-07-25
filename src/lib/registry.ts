/**
 * Single source of truth for the Compronents registry.
 *
 * Both the website (index + detail pages) and the JSON API
 * (`/r/registry.json`, `/r/[name].json`) read from this module.
 *
 * To add a component (make a raw .tsx file shadcn-installable):
 *   1. Drop the source at `src/registry/<name>.tsx`.
 *   2. Add an entry to `registryItems` below.
 *   3. Add a usage demo at `src/components/demos/<name>.tsx` and register it
 *      in `src/components/demos/index.tsx`.
 *   4. Document its props in `src/lib/component-meta.ts`.
 * The item then appears on the index, gets a detail page, and is served at
 * `/r/<name>.json` for `npx shadcn@latest add @compronents/<name>`.
 *
 * `files[].path` is the file on disk (relative to the repo root); the route
 * handler inlines its contents into the JSON. `files[].target` is where the
 * shadcn CLI drops the file in a consumer project.
 */

import {
  closestWord,
  matchesDateRange,
  parseTimeQuery,
} from "./search-time.ts";

export const REGISTRY_NAME = "Compronents";
export const REGISTRY_NAMESPACE = "@compronents";
export const REGISTRY_HOMEPAGE = "https://ui.aryank.space";

/** Public origin the shadcn registry is served from (used in install commands). */
export const REGISTRY_BASE_URL = "https://ui.aryank.space";

/** URL of a single installable item's JSON, e.g. for `shadcn add <url>`. */
export function registryItemUrl(name: string) {
  return `${REGISTRY_BASE_URL}/r/${name}.json`;
}

/** Per-package-manager `shadcn add` invocations for a registry item. */
export const PACKAGE_MANAGERS = [
  { id: "npm", label: "npm", exec: "npx" },
  { id: "pnpm", label: "pnpm", exec: "pnpm dlx" },
  { id: "yarn", label: "yarn", exec: "yarn dlx" },
  { id: "bun", label: "bun", exec: "bunx --bun" },
] as const;

export function installCommands(name: string) {
  const url = registryItemUrl(name);
  return PACKAGE_MANAGERS.map((pm) => ({
    id: pm.id,
    label: pm.label,
    command: `${pm.exec} shadcn@latest add ${url}`,
  }));
}

export type LibrarySectionId =
  | "components"
  | "pages"
  | "backend"
  | "inspiration";

export interface LibrarySection {
  id: LibrarySectionId;
  label: string;
  eyebrow: string;
  description: string;
}

export const librarySections: LibrarySection[] = [
  {
    id: "components",
    label: "Components",
    eyebrow: "Installable interface pieces",
    description:
      "Standalone shadcn-compatible components with demos, source, API notes, asset requirements, and art-direction controls.",
  },
  {
    id: "pages",
    label: "Pages",
    eyebrow: "Full-screen compositions",
    description:
      "Complete page sections and templates for when a component wants the whole viewport, not a small slot in a UI.",
  },
  {
    id: "backend",
    label: "Backend",
    eyebrow: "Server-side building blocks",
    description:
      "Route handlers, server utilities, data flows, and integration snippets that pair with the visual library.",
  },
  {
    id: "inspiration",
    label: "Inspiration",
    eyebrow: "References and studies",
    description:
      "Curated interface references, replication notes, motion studies, and useful experiments that shape future drops.",
  },
];

export type ComponentCategory =
  | "Buttons"
  | "Inputs"
  | "Overlays"
  | "Feedback"
  | "Layout"
  | "Animations"
  | "Icons"
  | "Text"
  | "Backend";

export interface RegistryFile {
  /** Path on disk, relative to the repo root. Also used as the JSON `path`. */
  path: string;
  /** Where the shadcn CLI installs this file in a consumer project. */
  target: string;
  /** shadcn registry file type. */
  type: "registry:ui" | "registry:component" | "registry:hook" | "registry:lib";
}

export interface RegistryItem {
  name: string;
  title: string;
  description: string;
  section: LibrarySectionId;
  category: ComponentCategory;
  /** Badged "Pro" in the UI (all items remain installable). */
  pro: boolean;
  /** Released date, ISO `YYYY-MM-DD`. */
  date: string;
  type: "registry:ui" | "registry:component" | "registry:lib";
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

export interface RegistryDesignGuidance {
  style: string;
  use: string;
  pair: string;
  avoid: string;
}

export function matchesRegistrySearch(
  item: RegistryItem,
  rawQuery: string,
  now = new Date(),
) {
  const { query, date, words } = parseTimeQuery(rawQuery, now);
  if (!query) return true;
  if (!matchesDateRange(item.date, date)) return false;
  if (words.length === 0) return Boolean(date?.start && date.end);

  const [, month, day] = item.date.split("-");
  const haystack = [
    item.title,
    item.name,
    item.description,
    item.category,
    item.section,
    item.date,
    `${Number(month)}/${Number(day)}`,
  ]
    .join(" ")
    .toLowerCase();
  const haystackWords = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  return words.every(
    (word) =>
      haystack.includes(word) || closestWord(word, haystackWords) !== word,
  );
}

export const registryItems: RegistryItem[] = [
  {
    name: "flow-field-text",
    title: "Flow Field Text",
    description:
      "A rebuild of the schemasofuncertainty.com home page. Editorial columns tile across a horizontally drag- and wheel-scrollable strip: serif headers (a NEW or type badge, a byline, an uppercase title with optional subtitle) sit above each column and translate in lockstep, while the body copy is drawn as a monospace character grid where every cell reads its glyph from a position pushed by an animated 3D simplex-noise displacement field. Legible text smears, duplicates, and dissolves into scattered fragments toward the bottom, then reforms as it breathes; a quadratic vertical mask keeps the top rows sharp. The canvas never moves, it re-samples at the scroll offset, so text flows sideways as you drag. Hover a column to pull it into an accent color, tap it to fire onSelect, and because color follows the sampled character rather than the cell, the accent bleeds across a border wherever the field borrowed a neighbor's letter. Uses the exact josephg/noisejs simplex3 and displacement constants. No dependencies.",
    section: "components",
    category: "Text",
    pro: false,
    date: "2026-07-24",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/flow-field-text.tsx",
        target: "components/ui/flow-field-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "blnk-agency-page",
    title: "BLNK Agency Page",
    description:
      "An Obys-inspired agency homepage branded BLNK: black preloader with progress and a split logo intro, fixed difference-blend header with live timezone clock and contact copy, studio caption, and three wheel-driven infinite work galleries (vertical image stack with title rail, horizontal rotated rail, and a numbered grid with center expand previews). Idle scroll snaps to the nearest project. Includes an About route. GSAP preloader; Instrument Sans; existing award-list and portfolio imagery.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-22",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/blnk-agency-page/index.tsx",
        target: "components/ui/blnk-agency-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/blnk-agency-page/styles.ts",
        target: "components/ui/blnk-agency-page/styles.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/blnk-agency-page/logo-paths.ts",
        target: "components/ui/blnk-agency-page/logo-paths.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/blnk-agency-page/boot.ts",
        target: "components/ui/blnk-agency-page/boot.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "chrome-folio-page",
    title: "Chrome Folio Page",
    description:
      "A dark portfolio homepage built from four scroll movements. The masthead sets a wordmark in mixed grotesque and italic serif over a liquid-chrome WebGL sphere, shaded with noise-rotated line bands under a screen-space grain pass and steered by the pointer. Scrolling grows the chrome band to full bleed while the masthead layers lift at three rates, then a cube warps in from deep Z as the mark blurs away, and a pinned fly-through sends project cards across an oversized word. Three.js, GSAP ScrollTrigger, SplitText, and Lenis.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-21",
    type: "registry:ui",
    dependencies: ["three", "gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/chrome-folio-page.tsx",
        target: "components/ui/chrome-folio-page.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "procedural-computer-page",
    title: "Procedural Computer Page",
    description:
      "A full-bleed WebGL2 studio homepage whose entire background is a single raymarched fragment shader. Three tumbling 3D rings, each an analytic ellipse SDF resolved with a twelve-step Newton refinement, are smooth-unioned with a pointer-tracked crosshair and drawn twice per frame: a crisp flat line pass and a normal-shaded emboss pass, cross-faded live by pressing B. The rings orbit on a fixed fifteen second loop, the wheel injects decaying rotational velocity, the pointer is lerped toward the crosshair with exponential smoothing, and toggling dark mode inverts the grey palette. Fixed wordmark, blurred intro card, contact button, and social nav sit over the canvas. Pure WebGL2, no dependencies; keyboard shortcuts for theme (T), contact (C), and emboss (B).",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-24",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/procedural-computer-page.tsx",
        target: "components/ui/procedural-computer-page.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "content-architecture-page",
    title: "Content Architecture Page",
    description:
      "A source-captured React port of contentarchitecture.dev: split editorial hero with concentric type, fixed dither navigation and minimap, quantified problem table, nine-part agent-ready feature field, interactive repository explorer and terminal, Blob-backed ASCII showcase, testimonial carousel, one-time pricing card, full FAQ, source banner, newsletter footer, responsive menu, and learn-more drawer. Captured from the complete production HTML, CSS, JavaScript, RSC, font, and media request set on July 23, 2026.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-23",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/content-architecture-page/index.tsx",
        target: "components/ui/content-architecture-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/content-architecture-page/styles.ts",
        target: "components/ui/content-architecture-page/styles.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/content-architecture-page/spiral.ts",
        target: "components/ui/content-architecture-page/spiral.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/content-architecture-page/glyph-field.ts",
        target: "components/ui/content-architecture-page/glyph-field.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/content-architecture-page/minimap.tsx",
        target: "components/ui/content-architecture-page/minimap.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/content-architecture-page/ascii-curtain.ts",
        target: "components/ui/content-architecture-page/ascii-curtain.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/content-architecture-page/blog.tsx",
        target: "components/ui/content-architecture-page/blog.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/content-architecture-page/repo-explorer.tsx",
        target: "components/ui/content-architecture-page/repo-explorer.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/content-architecture-page/hand-model.ts",
        target: "components/ui/content-architecture-page/hand-model.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "fanned-card-deck",
    title: "Fanned Card Deck",
    description:
      "Five collection cards laid out as a spread hand, each carrying its own generative canvas texture: waveform bars, an opacity mosaic, stacked ribbons, a flowing block grid, and a scrolling blueprint frame. Hovering lifts a card off the fan; clicking one grows it to full size, fades in its body copy, and sweeps the rest into a small overlapping cluster below. Textures are seeded, so a card always draws the same pattern, and they animate continuously on a canvas at a fixed resolution scaled into whichever slot the card holds. Motion for React.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-21",
    type: "registry:ui",
    dependencies: ["motion"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/fanned-card-deck.tsx",
        target: "components/ui/fanned-card-deck.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "orbit-matter-page",
    title: "Orbit Matter Page",
    description:
      "A source-backed interplanetary observatory page with a signal-grid preloader, pointer-reactive background grid, responsive navigation overlay, timed hero transmission, SplitText reveals, character-fill introduction, pinned mission archive, dispersing CTA image pairs, and a dense communications footer. Source imagery is served from Blob.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/orbit-matter-page/index.tsx",
        target: "components/ui/orbit-matter-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/orbit-matter-page/fragment.ts",
        target: "components/ui/orbit-matter-page/fragment.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/orbit-matter-page/styles.ts",
        target: "components/ui/orbit-matter-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "polite-chaos-page",
    title: "Polite Chaos Page",
    description:
      "A source-backed creative studio page with a cinematic image preloader, oversized editorial hero, frame-cycling showreel, staggered project rows, pinned client reviews, SplitType spotlight marquees, an animated contact card, full overlay menu, and production footer. All source imagery, fonts, and audio are served from Blob.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["@gsap/react", "gsap", "lenis", "react-icons", "split-type"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/polite-chaos-page/index.tsx",
        target: "components/ui/polite-chaos-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/polite-chaos-page/styles.ts",
        target: "components/ui/polite-chaos-page/styles.ts",
        type: "registry:lib",
      },
      ...[
        ["Button/Button.tsx", "registry:lib"],
        ["ClientReviews/ClientReviews.tsx", "registry:lib"],
        ["ClientReviews/clientReviewsData.ts", "registry:lib"],
        ["Copy/Copy.tsx", "registry:lib"],
        ["CTACard/CTACard.tsx", "registry:lib"],
        ["FeaturedWork/FeaturedWork.tsx", "registry:lib"],
        ["FeaturedWork/project.ts", "registry:lib"],
        ["Footer/Footer.tsx", "registry:lib"],
        ["Menu/Menu.tsx", "registry:lib"],
        ["Preloader/Preloader.tsx", "registry:lib"],
        ["Showreel/Showreel.tsx", "registry:lib"],
        ["Spotlight/Spotlight.tsx", "registry:lib"],
        ["useViewTransition.ts", "registry:lib"],
      ].map(([file, type]) => ({
        path: `src/registry/polite-chaos-page/source/${file}`,
        target: `components/ui/polite-chaos-page/source/${file}`,
        type: type as "registry:lib",
      })),
    ],
  },
  {
    name: "house-of-epochs-page",
    title: "House of Epochs Page",
    description:
      "A source-backed preservation archive page with a plotted-path grid preloader, layered monument hero, animated institutional copy, sticky discipline cards, a Flip-powered showreel reveal, scroll-driven compass, stacked survey cards, audio control, archival navigation, and a curved-text footer. All source images, fonts, SVGs, and audio are served from Blob.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["@gsap/react", "gsap", "lenis", "react-icons"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/house-of-epochs-page/index.tsx",
        target: "components/ui/house-of-epochs-page/index.tsx",
        type: "registry:ui",
      },
      ...["fonts.css", "globals.css", "home.css"].map((file) => ({
        path: `src/registry/house-of-epochs-page/${file}`,
        target: `components/ui/house-of-epochs-page/${file}`,
        type: "registry:lib" as const,
      })),
      ...[
        "About/About.tsx",
        "About/About.css",
        "Button/Button.tsx",
        "Button/Buttons.css",
        "Copy/Copy.tsx",
        "Copy/Copy.css",
        "CTA/CTA.tsx",
        "CTA/CTA.css",
        "FeaturedCards/FeaturedCards.tsx",
        "FeaturedCards/FeaturedCards.css",
        "Footer/Footer.tsx",
        "Footer/Footer.css",
        "Menu/Menu.tsx",
        "Menu/Menu.css",
        "MusicToggle/MusicToggle.tsx",
        "MusicToggle/MusicToggle.css",
        "Preloader/Preloader.tsx",
        "Preloader/Preloader.css",
        "Showreel/Showreel.tsx",
        "Showreel/Showreel.css",
      ].map((file) => ({
        path: `src/registry/house-of-epochs-page/source/${file}`,
        target: `components/ui/house-of-epochs-page/source/${file}`,
        type: "registry:lib" as const,
      })),
    ],
  },
  {
    name: "march-2025-template",
    title: "March 2025 Template",
    description:
      "A source-backed full website template from the March 2025 portfolio app. It ships the complete routed experience with Blob-hosted images and fonts, Rader and Messina typography, GSAP SplitType text reveals, block route transitions, Lenis smooth scroll, parallax project images, work carousel, reviews, FAQ, contact, and footer.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-01",
    type: "registry:ui",
    dependencies: [
      "@gsap/react",
      "framer-motion",
      "gsap",
      "lenis",
      "lucide-react",
      "react-icons",
      "react-router-dom",
      "split-type",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/march-2025-template/index.tsx",
        target: "components/ui/march-2025-template/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/march-2025-template/styles.ts",
        target: "components/ui/march-2025-template/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "archive-commerce-page",
    title: "Archive Commerce Page",
    description:
      "A source-backed Format Archive commerce template. It ships the full routed experience (home, catalogue, product detail, archive, editorial, article detail, info) with a counter preloader, clip-path menu overlay, cart drawer with local persistence, hover-trail archive previews, staggered catalogue reveals, SplitType line reveals, Lenis smooth scroll, and a clip-path page transition. Imagery is served from Blob with PP Neue Montreal typography.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-10",
    type: "registry:ui",
    dependencies: ["@gsap/react", "gsap", "lenis", "split-type"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/archive-commerce-page/index.tsx",
        target: "components/ui/archive-commerce-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/archive-commerce-page/styles.ts",
        target: "components/ui/archive-commerce-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "interior-studio-page",
    title: "Interior Studio Page",
    description:
      "A source-backed Terrene interior studio template. It ships the full routed experience (home, studio, spaces, sample space, blueprints, connect) with a counter preloader, circular clip-path menu, hide-on-scroll top bar, SplitText copy reveals, pinned featured-projects deck, expanding client reviews, arc-path spotlight sequence, pinned process steps, draggable infinite blueprint gallery, Lenis smooth scroll, and a circular clip-path page transition. Imagery is served from Blob with Manrope and DM Mono typography.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-10",
    type: "registry:ui",
    dependencies: ["@gsap/react", "gsap", "lenis", "react-icons"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/interior-studio-page/index.tsx",
        target: "components/ui/interior-studio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/interior-studio-page/styles.ts",
        target: "components/ui/interior-studio-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "dining-room-page",
    title: "Dining Room Page",
    description:
      "A source-backed Salle Blanche restaurant template. It ships the full routed experience (home, essence, carte, book) with a progress Preloader, rotating nav menu, GSAP SplitText copy reveals, Lenis smooth scroll, scaling image collage, dining menu selector, dragging testimonials carousel, marquee, sticky cards, chefs hover reveal, pinned reservation cards, and a clip-path page transition. Imagery is served from Blob with Host Grotesk, DM Mono, and Roslindale typography.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-01",
    type: "registry:ui",
    dependencies: ["@gsap/react", "gsap", "lenis", "react-icons"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/dining-room-page/index.tsx",
        target: "components/ui/dining-room-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/dining-room-page/styles.ts",
        target: "components/ui/dining-room-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "film-studio-page",
    title: "Film Studio Page",
    description:
      "A source-backed Negative Films website template. It ships the full routed experience (index, work, culture, directors, contact, sample film) with a project-grid Preloader, scramble nav menu, Three.js pixelated-video hero, html2canvas pixelated-text, lens-distortion work slider, expanding spotlight gallery, Lenis smooth scroll, ukiyojs parallax, split-image scroll, and a clip-path page transition. Media is served from Blob with Cossette Titre typography.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-01",
    type: "registry:ui",
    dependencies: [
      "@gsap/react",
      "gsap",
      "html2canvas",
      "lenis",
      "three",
      "ukiyojs",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/film-studio-page/index.tsx",
        target: "components/ui/film-studio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/film-studio-page/styles.ts",
        target: "components/ui/film-studio-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "dark-catalog-page",
    title: "Dark Catalog Page",
    description:
      "A source-backed Deadlock Studios game-template port. It ships the routed index, studio, catalog, brief, and connect pages with a preloader, scramble menu, WebGL fluorescent hero, god-rays logo section, pinned featured work, spiral studio gallery, catalog viewer, mouse-trail contact page, team arc, smoke footer, and Blob-hosted source fonts and images.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-03",
    type: "registry:ui",
    dependencies: ["@gsap/react", "gsap", "lenis", "postprocessing", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/dark-catalog-page/index.tsx",
        target: "components/ui/dark-catalog-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/dark-catalog-page/components/Accordion/Accordion.tsx",
        target:
          "components/ui/dark-catalog-page/components/Accordion/Accordion.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/AnimeText/AnimeText.tsx",
        target:
          "components/ui/dark-catalog-page/components/AnimeText/AnimeText.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/BlindingLight/BlindingLight.tsx",
        target:
          "components/ui/dark-catalog-page/components/BlindingLight/BlindingLight.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/BlindingLight/logoPath.ts",
        target:
          "components/ui/dark-catalog-page/components/BlindingLight/logoPath.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Copy/Copy.tsx",
        target: "components/ui/dark-catalog-page/components/Copy/Copy.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/FeaturedProjects/FeaturedProjects.tsx",
        target:
          "components/ui/dark-catalog-page/components/FeaturedProjects/FeaturedProjects.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Fluorescent/Fluorescent.tsx",
        target:
          "components/ui/dark-catalog-page/components/Fluorescent/Fluorescent.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Footer/Footer.tsx",
        target: "components/ui/dark-catalog-page/components/Footer/Footer.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Menu/Menu.tsx",
        target: "components/ui/dark-catalog-page/components/Menu/Menu.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Menu/scramble.ts",
        target: "components/ui/dark-catalog-page/components/Menu/scramble.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Preloader/Preloader.tsx",
        target:
          "components/ui/dark-catalog-page/components/Preloader/Preloader.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Spiral/Spiral.tsx",
        target: "components/ui/dark-catalog-page/components/Spiral/Spiral.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/Team/Team.tsx",
        target: "components/ui/dark-catalog-page/components/Team/Team.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/components/TrailContainer/TrailContainer.tsx",
        target:
          "components/ui/dark-catalog-page/components/TrailContainer/TrailContainer.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/pages/brief.tsx",
        target: "components/ui/dark-catalog-page/pages/brief.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/pages/catalog.tsx",
        target: "components/ui/dark-catalog-page/pages/catalog.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/pages/connect.tsx",
        target: "components/ui/dark-catalog-page/pages/connect.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/pages/home.tsx",
        target: "components/ui/dark-catalog-page/pages/home.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/pages/studio.tsx",
        target: "components/ui/dark-catalog-page/pages/studio.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/providers/TransitionProvider.tsx",
        target:
          "components/ui/dark-catalog-page/providers/TransitionProvider.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/runtime.tsx",
        target: "components/ui/dark-catalog-page/runtime.tsx",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/styles.ts",
        target: "components/ui/dark-catalog-page/styles.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/utils/menuClose.ts",
        target: "components/ui/dark-catalog-page/utils/menuClose.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/dark-catalog-page/utils/scramble.ts",
        target: "components/ui/dark-catalog-page/utils/scramble.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "deadspace-page",
    title: "Deadspace Page",
    description:
      "A source-backed Deadspace spatial-design template. It ships the routed index, lab, archive, record, and connect pages with a boot preloader, block transition, circular WebGL menu, procedural skyline hero, SplitText copy reveals, pinned lab sequence, stats and client scroll motion, contact ticker, image distortion, and Blob-hosted source fonts, images, icons, and sounds.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-03",
    type: "registry:ui",
    dependencies: ["gsap", "lenis", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/deadspace-page/index.tsx",
        target: "components/ui/deadspace-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/deadspace-page/fragments.ts",
        target: "components/ui/deadspace-page/fragments.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/deadspace-page/menu-shader.ts",
        target: "components/ui/deadspace-page/menu-shader.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/deadspace-page/styles.ts",
        target: "components/ui/deadspace-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "otis-valen-page",
    title: "Otis Valen Page",
    description:
      "A source-backed Otis Valen portfolio template. It ships the routed index, work, project, about, and contact pages with the block transition, menu reveal, pinned hero image, horizontal featured-work stage, stacked services, SplitText work and project reveals, project preview zoom, about tag motion, contact cursor trail, footer image burst, Lenis scroll, and Blob-hosted source fonts and images.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-03",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/otis-valen-page/index.tsx",
        target: "components/ui/otis-valen-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/otis-valen-page/fragments.ts",
        target: "components/ui/otis-valen-page/fragments.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/otis-valen-page/styles.ts",
        target: "components/ui/otis-valen-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "damien-tsarantos-page",
    title: "Damien Tsarantos Page",
    description:
      "A source-backed Damien Tsarantos portfolio template. It ships the routed home, about, projects, project detail, awards, and contact pages with Lenis scroll, magnetic buttons, contact-card ScrollTrigger stack, split h1 letter reveals, marquee strips, scoped GSAP, and Blob-hosted source images.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-03",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/damien-tsarantos-page/index.tsx",
        target: "components/ui/damien-tsarantos-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/damien-tsarantos-page/fragments.ts",
        target: "components/ui/damien-tsarantos-page/fragments.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/damien-tsarantos-page/styles.ts",
        target: "components/ui/damien-tsarantos-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "wu-wei-page",
    title: "Wu Wei Page",
    description:
      "A source-backed Wu Wei creative studio template. It ships the routed index, work, studio, archive, contact, and sample project pages with the original preloader cadence, menu overlay reveal, WebGL particle logo, SplitText copy reveals, work-year ScrollTriggers, pinned studio stage, stacked process cards, draggable archive field, contact reveal, sample-project progress counter, Lenis scroll, and Blob-hosted source font and images.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-03",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/wu-wei-page/index.tsx",
        target: "components/ui/wu-wei-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/wu-wei-page/styles.ts",
        target: "components/ui/wu-wei-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "lemon-bureau-page",
    title: "Lemon Bureau Page",
    description:
      "A source-backed Lemon Bureau creative-studio template. It ships the routed home, studio, work, project, and contact pages with the original GSAP preloader split, menu overlay reveal, full-page WebGL fluid-ink cursor trail, WebGL particle logo, pinned studio hero, stacked team cards, boosted client marquee, SVG work carousel, a three.js bouncing-ball contact cube, a GPU FLIP fluid footer, Lenis scroll, and Blob-hosted source fonts and images.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: ["gsap", "lenis", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/lemon-bureau-page/index.tsx",
        target: "components/ui/lemon-bureau-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/lemon-bureau-page/fragments.ts",
        target: "components/ui/lemon-bureau-page/fragments.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/lemon-bureau-page/styles.ts",
        target: "components/ui/lemon-bureau-page/styles.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/lemon-bureau-page/webgl.ts",
        target: "components/ui/lemon-bureau-page/webgl.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/lemon-bureau-page/simulation.ts",
        target: "components/ui/lemon-bureau-page/simulation.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/lemon-bureau-page/particle-visual.ts",
        target: "components/ui/lemon-bureau-page/particle-visual.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "spiral-gallery",
    title: "Spiral Gallery",
    description:
      "A 3D helix of curved image tiles you scroll through. Tiles are bent into shallow arcs and stacked along a descending coil; the whole spiral idles with a slow rotation, picks up spin from scroll velocity, and tilts toward the cursor with eased parallax while the camera descends through it. A small facing shader brightens tiles as they turn to face you. Three.js + Lenis; owns its scroll container so it embeds anywhere.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["three", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/spiral-gallery.tsx",
        target: "components/ui/spiral-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "voku-image-slider",
    title: "Voku Image Slider",
    description:
      "A looping image slider arranged along a shallow arc. Wheel, drag, and touch move the same eased target; frames scale down toward the edges and lift into focus at center while the active title follows the closest slide.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/voku-image-slider.tsx",
        target: "components/ui/voku-image-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "threejs-infinite-slider",
    title: "Three.js Infinite Slider",
    description:
      "A vertical WebGL image loop with velocity distortion. Drag, wheel, and touch input move a wrapped plane stack while mesh vertices bend forward during fast motion and the active title tracks the nearest frame.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/threejs-infinite-slider.tsx",
        target: "components/ui/threejs-infinite-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "grid-scramble-hover",
    title: "Grid Scramble Hover",
    description:
      "A hover image covered by a symbol grid. Moving near a cell wakes it, spills activation across neighboring cells, and scrambles selected glyphs before the field cools back down.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/grid-scramble-hover.tsx",
        target: "components/ui/grid-scramble-hover.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "text-displacement-field",
    title: "Text Displacement Field",
    description:
      "A readable field of words and display letters pushed away by cursor proximity. Each span keeps an eased target, so the copy ripples around the pointer and then settles home.",
    section: "components",
    category: "Text",
    pro: false,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/text-displacement-field.tsx",
        target: "components/ui/text-displacement-field.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "vinyl-orbit-player",
    title: "Vinyl Orbit Player",
    description:
      "A spinning vinyl record with circular cover art and two curved SVG text paths. The primary phrase loops around a wide orbit while the secondary label sits on a smaller lower curve.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/vinyl-orbit-player.tsx",
        target: "components/ui/vinyl-orbit-player.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "orbit-text-preloader",
    title: "Orbit Text Preloader",
    description:
      "A preloader of eight concentric text orbits that stretch, spin, and breathe around a counting percentage, then fade out to reveal a scaling hero image and rising copy.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/orbit-text-preloader.tsx",
        target: "components/ui/orbit-text-preloader.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-text-blocks",
    title: "Scroll Text Blocks",
    description:
      "Three columns of copy whose words roll out and in per-word as you scroll a pinned hero, with a scroll-velocity-reactive image marquee and a thin progress bar.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/scroll-text-blocks.tsx",
        target: "components/ui/scroll-text-blocks.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "video-card-stack",
    title: "Video Card Stack",
    description:
      "A 3D perspective deck of looping video cards. Clicking anywhere throws the front card down and off, then tucks it behind the stack with a staggered re-layout.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "react-player"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/video-card-stack.tsx",
        target: "components/ui/video-card-stack.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "client-hover-preview",
    title: "Client Hover Preview",
    description:
      "A wall of client names under blend-mode chrome. Hovering a name wipes a centered image preview open with a clip-path and cross-fades as you move between clients.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/client-hover-preview.tsx",
        target: "components/ui/client-hover-preview.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "folder-preview-hover",
    title: "Folder Preview Hover",
    description:
      "Stacked folder rows in three color variants. Hovering lifts a folder, dims its siblings, and pops three photos out of the folder mouth with randomized tilt.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/folder-preview-hover.tsx",
        target: "components/ui/folder-preview-hover.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "minimap-parallax-scroll",
    title: "Minimap Parallax Scroll",
    description:
      "An infinite full-screen project feed with wheel and touch inertia, snap-to-project, parallax images, and a centered minimap strip that mirrors the scroll in miniature.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/minimap-parallax-scroll.tsx",
        target: "components/ui/minimap-parallax-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-scrub-slider",
    title: "Scroll Scrub Slider",
    description:
      "A pinned full-screen slider scrubbed by scroll. Each step cross-fades a new image, rebuilds the headline line-by-line, and updates numbered indices with sliding markers and a vertical progress bar.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/scroll-scrub-slider.tsx",
        target: "components/ui/scroll-scrub-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "split-card-scroll",
    title: "Split Card Scroll",
    description:
      "Three joined cards pinned on scroll: the strip narrows, splits apart into rounded cards with a gap, then each card flips to its colored back with staggered tilt.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/split-card-scroll.tsx",
        target: "components/ui/split-card-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "hour-timeline-slider",
    title: "Hour Timeline Slider",
    description:
      "Click anywhere to wipe in the next slide with a clip-path reveal while an elastic timeline of hours redistributes its flex spacing, compressing the past and stretching the present.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/hour-timeline-slider.tsx",
        target: "components/ui/hour-timeline-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "counter-star-loader",
    title: "Counter Star Loader",
    description:
      "A one-shot loader: two odometer columns roll their digits while the counter walks across the bottom of the screen in six steps, then three four-point stars scale up in sequence to wipe the screen, and the headline swings in from a 3D Y-rotation as the site info lines and a toggle button pop in.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/counter-star-loader.tsx",
        target: "components/ui/counter-star-loader.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "inversion-lens-hover",
    title: "Inversion Lens Hover",
    description:
      "A WebGL image where a soft circular lens tracks the cursor and inverts a grayscale version of the image inside it, its edge broken up by 8-octave turbulence scrolling over time so the boundary churns like a living blot; the lens eases open on enter and closes when the pointer leaves or the element scrolls out of view.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/inversion-lens-hover.tsx",
        target: "components/ui/inversion-lens-hover.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "line-rise-text",
    title: "Line Rise Text",
    description:
      "A long editorial page where every copy block is split into masked lines that rise from behind their baseline as it scrolls into view, while the central portrait opens from a cropped close-up; indented paragraphs preserve their opening indent after splitting.",
    section: "components",
    category: "Text",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/line-rise-text.tsx",
        target: "components/ui/line-rise-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "mask-reveal-preloader",
    title: "Mask Reveal Preloader",
    description:
      "A one-shot intro: a logo slides in char by char over a filling progress bar with a mix-blend footer line, then an SVG-shaped mask (a rounded capsule cut from a solid fill) scales up to punch through and reveal the hero, whose image settles from a zoom as the headline, footer copy, and pill buttons animate in.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "react-icons"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/mask-reveal-preloader.tsx",
        target: "components/ui/mask-reveal-preloader.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "converging-search-scroll",
    title: "Converging Search Scroll",
    description:
      "A pinned sequence: scattered labelled feature pills slide to the center and shrink into a single rounded dot while their text fades, the spotlight line lifts away, then the dot grows into a search bar that drops into place and a final header fades up beneath it.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/converging-search-scroll.tsx",
        target: "components/ui/converging-search-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "model-menu-3d",
    title: "Model Menu 3D",
    description:
      "A fullscreen menu overlay built around a lit 3D model: a toggle fades the panel in, a GLB object behind the links reacts to the cursor with eased parallax rotation and a pointer-tracked point light, and each menu label fills with a left-to-right gradient wipe on hover.",
    section: "components",
    category: "Overlays",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/model-menu-3d.tsx",
        target: "components/ui/model-menu-3d.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "name-preloader-reveal",
    title: "Name Preloader Reveal",
    description:
      "A one-shot editorial intro: a progress bar fills and empties while four portraits stack and clip open in the center, a caption rises line by line, and a large name splits into alternating characters, then its first and last letters slide to center and the whole name shrinks into a mix-blend corner mark as the hero headline rises with its dividers.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/name-preloader-reveal.tsx",
        target: "components/ui/name-preloader-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "fractal-glass-hover",
    title: "Fractal Glass Hover",
    description:
      "A hero image seen through vertical fluted glass: a WebGL shader slices it into ~35 refracted stripes, then eased cursor movement drives a subtle parallax that pushes harder where the distortion is strongest, so the surface reads like real ribbed glass reacting to the pointer.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/fractal-glass-hover.tsx",
        target: "components/ui/fractal-glass-hover.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "preloader-panel-reveal",
    title: "Preloader Panel Reveal",
    description:
      "A one-shot intro: two columns of masked copy and a glitching NN counter animate over a black panel while a center square grows in stepped scales to full frame, then the panel wipes up and out as the nav, hero image, and product card slide up into place.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/preloader-panel-reveal.tsx",
        target: "components/ui/preloader-panel-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "block-reveal-text",
    title: "Block Reveal Text",
    description:
      "An editorial scroll page where every copy block is split into lines and each line is uncovered by a colored bar that wipes across left to right then retracts, timed off a scroll trigger so the text reveals line by line as it enters view, with full-bleed image sections between the copy.",
    section: "components",
    category: "Text",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/block-reveal-text.tsx",
        target: "components/ui/block-reveal-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "stroke-wipe-spotlight",
    title: "Stroke Wipe Spotlight",
    description:
      "A pinned scroll reveal where thirteen outlined pink-to-yellow strokes draw across the frame in a staggered order, swap the centered message, then erase in reverse while three bordered sparkles pop through the handoff.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/stroke-wipe-spotlight.tsx",
        target: "components/ui/stroke-wipe-spotlight.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "magnetic-spotlight-marquee",
    title: "Magnetic Spotlight Marquee",
    description:
      "A continuously looping row of six images that follows the pointer vertically. As the strip travels down the frame, nearby text lines rise with its wake and settle independently, preserving the source motion model and responsive composition.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/magnetic-spotlight-marquee.tsx",
        target: "components/ui/magnetic-spotlight-marquee.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "wordmark-spotlight-scroll",
    title: "Wordmark Spotlight Scroll",
    description:
      "A fixed dark stage where giant SVG wordmarks stretch vertically into one another across six scroll steps. Each project transition grows a square image from the lower-left corner, then shrinks and drifts it upward as the next wordmark takes over.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/wordmark-spotlight-scroll.tsx",
        target: "components/ui/wordmark-spotlight-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "circle-preloader-hero",
    title: "Circle Preloader Hero",
    description:
      "A layered circular preloader that expands through four brand colors, throws four floating cutout images across the frame, then sends them outward while the restaurant hero, navigation, footer copy, and plated centerpiece animate into place.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/circle-preloader-hero.tsx",
        target: "components/ui/circle-preloader-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "block-page-transition",
    title: "Block Page Transition",
    description:
      "A four-row page transition that wipes across the viewport, reveals a centered wordmark, swaps the full-screen scene, then retracts from the opposite edge. It includes three navigable image scenes and the original GSAP stagger and easing cadence.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-16",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/block-page-transition.tsx",
        target: "components/ui/block-page-transition.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "landing-counter-reveal",
    title: "Landing Counter Reveal",
    description:
      "A one-shot intro: a giant 0 to 100 counter scales up from the corner while a progress bar fills, then the digits slide out and a clip-path opens the hero from a center diamond to full frame before the headline characters slide in and the nav and footer words rise.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/landing-counter-reveal.tsx",
        target: "components/ui/landing-counter-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "webgl-dissolve-scroll",
    title: "WebGL Dissolve Scroll",
    description:
      "A hero image progressively dissolved from the bottom up by a real-time WebGL noise field as you scroll: an fbm-driven edge eats across the frame in a colored wash while a stacked headline below fades in one word at a time.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/webgl-dissolve-scroll.tsx",
        target: "components/ui/webgl-dissolve-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "expanding-navbar-reveal",
    title: "Expanding Navbar Reveal",
    description:
      "A fixed 16:9 navbar card centered over a full-bleed image; scrolling the first viewport expands the card's background and link row to fill the screen while the logo FLIPs from the card's bottom center up to a pinned top bar, uncovering the hero beneath.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/expanding-navbar-reveal.tsx",
        target: "components/ui/expanding-navbar-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "spotlight-index-scroll",
    title: "Spotlight Index Scroll",
    description:
      "A pinned gallery where a centered column of images scrolls past a fixed sightline: whichever image sits on the center line brightens, a running NN/TT index counter climbs the left edge, and a stacked list of project names on the right lights up and slides one entry at a time.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/spotlight-index-scroll.tsx",
        target: "components/ui/spotlight-index-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "liquid-stat-grid",
    title: "Liquid Stat Grid",
    description:
      "Three statistic cells split by dashed rules, each hiding a liquid gradient backdrop that fades up on hover while the copy inverts to white. The backdrop is a six-stage WebGL2 chain: a flat plate, a mouse-tracked colour blob, a domain warp with chromatic aberration, two noise-blur passes and a second faster warp, each stage rendering into its own framebuffer at its own resolution scale and sampling the previous one. Fully procedural, so it ships no textures and no runtime dependencies.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-21",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/liquid-stat-grid/index.tsx",
        target: "components/ui/liquid-stat-grid/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/liquid-stat-grid/liquid-canvas.tsx",
        target: "components/ui/liquid-stat-grid/liquid-canvas.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/liquid-stat-grid/shaders.ts",
        target: "components/ui/liquid-stat-grid/shaders.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "halftone-interface-hero",
    title: "Halftone Interface Hero",
    description:
      "A full-screen dark hero whose two-line wordmark is sampled into rounded halftone pixels, relit around the pointer with chromatic channel separation, and overlaid with a short RGB square-particle trail, complete with balanced navigation and a live location clock.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-15",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/halftone-interface-hero.tsx",
        target: "components/ui/halftone-interface-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "halftone-scene-footer",
    title: "Halftone Scene Footer",
    description:
      "A footer whose backdrop is live video redrawn as a vertical-line halftone: a WebGL shader samples grazing sheep and a mountain ridge on a coarse grid, mapping each cell's darkness to the width of one vertical line, so the footage reads as a woven, barcode-like engraving in two inks over a warm ground plane.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-22",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/halftone-scene-footer.tsx",
        target: "components/ui/halftone-scene-footer.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ascii-tv-hero",
    title: "ASCII TV Hero",
    description:
      "A hero where a video plays as a wall of luminance-mapped ASCII glyphs inside a bulging CRT tube, with pointer movement smearing nearby cells along a chromatic trail, and scrolling expanding the set from a floating television to a flat fullscreen wall.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-15",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/ascii-tv-hero.tsx",
        target: "components/ui/ascii-tv-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sandy-grain-background",
    title: "Sandy Grain Background",
    description:
      "A near-black sandy backdrop where the pointer paints a warm amber glow that slowly burns off under a live film-grain overlay, while a small square cursor dot eases after the pointer and swells over links and buttons.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-15",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sandy-grain-background.tsx",
        target: "components/ui/sandy-grain-background.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "aperture-zoom-hero",
    title: "Aperture Zoom Hero",
    description:
      "A pinned hero that pushes a window frame toward the camera on scroll: the frame and header scale up and translate in Z while a tall sky image pans behind them, then a closing headline rises into place as the zoom settles.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/aperture-zoom-hero.tsx",
        target: "components/ui/aperture-zoom-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "infinite-contact-scroll",
    title: "Infinite Contact Scroll",
    description:
      "A looping contact sheet where each row's column gap breathes open and closed as it crosses the center line, while a pinned icon in the middle swaps to the next glyph every time a new row locks to center.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/infinite-contact-scroll.tsx",
        target: "components/ui/infinite-contact-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ribbon-stroke-scroll",
    title: "Ribbon Stroke Scroll",
    description:
      "A pinned intro where thick rounded ribbons draw themselves across three oversized rows on scroll, two curved ribbons sweep through and erase themselves, the palette flips to dark halfway, and the rows finally slide off screen.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/ribbon-stroke-scroll.tsx",
        target: "components/ui/ribbon-stroke-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "expanding-rows-gallery",
    title: "Ingamana Projects Page",
    description:
      "A full project-index page where ten rows of image cards stretch from a tight 125% strip to 500% width as they scroll through view, so the entire archive feels like it zooms past the camera.",
    section: "pages",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/expanding-rows-gallery.tsx",
        target: "components/ui/expanding-rows-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "drag-timeline-scroll",
    title: "Drag Timeline Scroll",
    description:
      "A five-screen horizontal layout driven by a draggable scrubber riding a tick-mark timeline along the bottom edge, easing the whole page sideways as you drag.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drag-timeline-scroll.tsx",
        target: "components/ui/drag-timeline-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "svg-stroke-hover",
    title: "SVG Stroke Hover",
    description:
      "A two-column image grid where each card draws broad SVG scribble strokes on hover and raises its title over the image.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/svg-stroke-hover.tsx",
        target: "components/ui/svg-stroke-hover.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "terminal-text-reveal",
    title: "Terminal Text Reveal",
    description:
      "A scroll-reactive editorial layout where paragraph words move from muted gray to bright accent and then settle into final black as each section enters view.",
    section: "components",
    category: "Text",
    pro: false,
    date: "2026-07-09",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/terminal-text-reveal.tsx",
        target: "components/ui/terminal-text-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "edge-warp-rail",
    title: "Edge Warp Rail",
    description:
      "A case study read sideways. Vertical scroll drives a horizontal rail of media: wheel down, swipe, or grab the rail and drag, and the whole strip travels left. Tiles bend and recede at the left and right of the frame like a page turning, so leaving the viewport reads as motion rather than a cut, and a soft edge mask dissolves them at the rim. Portrait, square, and wide frames sit in one continuous line sized by their own proportions, with short note cards set between them. Images fade up from transparent as they load. It owns its own scroll container, so it embeds in a bounded box or fills the viewport; on small screens it becomes a plain vertical stack, and with reduced motion a native horizontal scroller with no scroll hijacking. No animation library.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-24",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/edge-warp-rail.tsx",
        target: "components/ui/edge-warp-rail.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "frame-scroll",
    title: "Frame Scroll",
    description:
      "A pinned hero that collapses into a drifting grid. As you scroll, the headline slides up out of frame, a second line fades in word by word, then the full-bleed image shrinks to a small rounded tile in the center. Below it, four columns of thumbnails parallax past at staggered speeds before the frame settles into a quiet outro. GSAP ScrollTrigger with Lenis; owns its scroll container so it embeds anywhere.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/frame-scroll.tsx",
        target: "components/ui/frame-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "falling-tag-list",
    title: "Falling Tag List",
    description:
      "A hover list where each oversized name springs open, fans a small stack of thumbnails up from behind it, and drops its descriptor tags in as rounded physics pills that tumble and settle on a floor. Leaving fades the pills, collapses the row, and slides the images back down, with the name flipping between a resting and an active color. GSAP for the springs, Matter.js for the pile.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap", "matter-js"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/falling-tag-list.tsx",
        target: "components/ui/falling-tag-list.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "crt-display",
    title: "CRT Display",
    description:
      "A 3D monitor whose curved screen swaps images with a glitch. A GLB monitor model sits in a lit scene and follows the cursor with an eased parallax tilt; a CRT shader draws the tube with scanlines, an aperture-grille mask, vignette, chromatic split, and a noisy RGB tear that spikes whenever the displayed image changes, then decays. Hovering a project name loads that frame; leaving resets to default. Three.js, no animation library.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/crt-display.tsx",
        target: "components/ui/crt-display.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "creative-clutter",
    title: "Creative Clutter",
    description:
      "A desk of scattered cutout objects that reflows between three named layouts. Eleven props are placed as a percentage of the board with a headline floating among them; chaos, cleanup, and notebook buttons swap the whole arrangement while GSAP Flip tweens every object and the heading from where they were to where they land, staggered from the center. Reads from its own box, so it embeds anywhere.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/creative-clutter.tsx",
        target: "components/ui/creative-clutter.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "preloader-reveal",
    title: "Preloader Reveal",
    description:
      "A system-boot intro that wipes away into a hero. A black preloader draws a circular progress ring and reveals stacked telemetry readouts, settling on an Engage control; engaging collapses the sheet to the left, swaps the label to a granted state, and clip-wipes through to a hero whose headline rises word by word. A white annotation backdrop underneath makes the margins read like a technical document mid-assembly. GSAP timeline with CustomEase; runs on a loop or waits for a click.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/preloader-reveal.tsx",
        target: "components/ui/preloader-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-wave-gallery",
    title: "Scroll Wave Gallery",
    description:
      "A vertical column of photographs that sway as they scroll. Each frame rides a sum of three sine waves, a slow base swing, a faster flow, and a fine detail jitter, drifting left and right while its clip-path pinches inward at the center of the viewport. The last quarter of the set shrinks for a sense of recession. Per-image GSAP ScrollTriggers with Lenis; owns its scroll container so it embeds anywhere.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/scroll-wave-gallery.tsx",
        target: "components/ui/scroll-wave-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-tunnel-3d",
    title: "Scroll Tunnel 3D",
    description:
      "An endless depth tunnel of images: photos ring an ellipse four at a time and stack back along the Z axis, while wheel, drag, and idle motion pull the camera forward through them. Each layer wraps in depth so the tunnel never ends, and a per-layer black overlay fogs frames in from the far end and out as they pass the lens. One requestAnimationFrame loop, no animation library.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/scroll-tunnel-3d.tsx",
        target: "components/ui/scroll-tunnel-3d.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "cappen-fluid-simulation",
    title: "Cappen Fluid Simulation",
    description:
      "A WebGL fluid field laid over a hard typographic hero. Pointer velocity splats into a GPU dye simulation, the display pass thresholds it into an ink mask, and idle currents keep the canvas alive even before interaction. Three.js render targets, scoped to a React component.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cappen-fluid-simulation.tsx",
        target: "components/ui/cappen-fluid-simulation.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ascii-image-reveal",
    title: "ASCII Image Reveal",
    description:
      "A gallery of photos that decode from canvas glyphs. Each tile samples its image into a luminance grid, reveals cells in a shuffled order, scrambles dense shadow characters, then fades the original photograph through the ASCII plate.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/ascii-image-reveal.tsx",
        target: "components/ui/ascii-image-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "detroit-paris-slider",
    title: "Detroit Paris Slider",
    description:
      "An infinite image stream whose slides grow along an exponential baseline. Wheel, drag, and idle motion push one scroll target while each poster wraps through the track and swaps images as it re-enters.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/detroit-paris-slider.tsx",
        target: "components/ui/detroit-paris-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "accordion-frames",
    title: "Accordion Frames",
    description:
      "A horizontal focus accordion: a row of thin image slats that spring open to a wide panel on hover (or tap), with a bordered focus indicator and light beams that track the open frame. Pure React, motion handled entirely by one CSS transition.",
    section: "components",
    category: "Layout",
    pro: false,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/accordion-frames.tsx",
        target: "components/ui/accordion-frames.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "portfolio-page",
    title: "Portfolio Page",
    description:
      "A full single-screen portfolio with a clip-path page wipe. A dark landing reveals its wordmark line-by-line from behind masking bars, lists projects whose thumbnails slide open on hover, and carries a grainy noise overlay; clicking a project wipes the whole screen into a light project view and back. Built with Motion and AnimatePresence.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["motion"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/portfolio-page.tsx",
        target: "components/ui/portfolio-page.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "material-spotlight",
    title: "Material Spotlight",
    description:
      "A cursor-driven material reveal on a 3D model. A near-matte standard material lit by a room-environment IBL gets a shader patch that carves a soft sphere of low-roughness, darker diffuse around the pointer's world-space hit — a wet, polished spotlight that follows the cursor and eases away. Three.js + WebGL.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/material-spotlight.tsx",
        target: "components/ui/material-spotlight.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "inversa-scroll",
    title: "Inversa Scroll",
    description:
      "A pinned hero that inverts through a masked window on scroll: the photo parallaxes up while an SVG slat-mask shrinks to punch a window through a dark overlay, the image desaturates inside it, a wireframe grid and pulsing markers fade in, copy blocks slide past, and a progress bar fills — then it re-opens to color. GSAP ScrollTrigger + Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/inversa-scroll.tsx",
        target: "components/ui/inversa-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "award-list",
    title: "Award List",
    description:
      "A hover-reactive list of accolades: each row is a three-state shutter that slides to reveal the project credit, settling up or down by exit edge, while the hovered row's image lands on a stacking preview pile in the corner that collapses on pause and clears on leave. GSAP + Lenis.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/award-list.tsx",
        target: "components/ui/award-list.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "image-reveal",
    title: "Image Reveal",
    description:
      "A scroll-powered stack of images that dissolve into each other: a clip-path wipes each frame away to expose the next, and a band of randomized ASCII characters scatters across the seam as it travels. Pinned GSAP ScrollTrigger with Lenis; owns its scroll container so it embeds anywhere.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/image-reveal.tsx",
        target: "components/ui/image-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "mosaic-flip",
    title: "Mosaic Flip",
    description:
      "A wall of 3D cubes that idles with a slow random breathing, then flips over in a center-out stagger to swap project images — each picture sliced across the grid and turned tile-by-tile. A queue absorbs rapid hovers. Built with GSAP.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/mosaic-flip.tsx",
        target: "components/ui/mosaic-flip.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "overlay-menu",
    title: "Overlay Menu",
    description:
      "A layered, curtain-style fullscreen navigation. A hamburger sweeps four colored panels down in sequence, clip-reveals a dark menu surface, and slides each link group up line-by-line. Built with a GSAP timeline and SplitText; wraps your page as a layout.",
    section: "components",
    category: "Overlays",
    pro: true,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/overlay-menu.tsx",
        target: "components/ui/overlay-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ascii-logo",
    title: "Interactive ASCII Logo",
    description:
      "A logo sampled onto a dot grid and rendered as flickering ASCII glyphs on a canvas. The cursor shoves nearby characters outward with spring physics, so the wordmark scatters and reforms as you move through it. No dependencies.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-06-30",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/ascii-logo.tsx",
        target: "components/ui/ascii-logo.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "animated-footer",
    title: "Animated Footer",
    description:
      "A breathing, full-screen footer: two hands rendered as live, hover-reactive ASCII art with soft parallax, and a wordmark that splits and reveals on scroll. Built with GSAP and Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-06-29",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/animated-footer.tsx",
        target: "components/ui/animated-footer.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "corridor-scene-3d",
    title: "Corridor Scene 3D",
    description:
      "A brutalist sci-fi corridor that rotates into view behind a stepped loading counter, then follows the pointer with slow orbital camera parallax while bloom and film grain shape the rendered scene.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["gsap", "postprocessing", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/corridor-scene-3d.tsx",
        target: "components/ui/corridor-scene-3d.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "drone-fleet",
    title: "Drone Fleet",
    description:
      "A flock of crosshair drones steering by the boids rules (separation, alignment, cohesion) plus wander. The pointer attracts the flock; clicking queues waypoints it flies to in order before returning to free roam, with dashed mesh links and live HUD telemetry.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-18",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drone-fleet.tsx",
        target: "components/ui/drone-fleet.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "motion-tracking",
    title: "Motion Tracking",
    description:
      "A WebGPU motion-detection effect: a looping video is frame-differenced in a compute shader to build a decaying trail of movement, then rendered as tinted ASCII glyphs over the darkened footage with a bloom pass on top.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-18",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/motion-tracking.tsx",
        target: "components/ui/motion-tracking.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "cursor-trail-scroll",
    title: "Cursor Trail Scroll",
    description:
      "A monochrome editorial page where the pointer paints a persistent blurred line across the full document, with scroll deltas extending the trail beneath a pinned three-column navigation.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-11",
    type: "registry:ui",
    dependencies: ["lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cursor-trail-scroll.tsx",
        target: "components/ui/cursor-trail-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-flip-cards",
    title: "Scroll Flip Cards",
    description:
      "A process section choreographed entirely by scroll. Three hero cards fan apart and drop away, then a pinned services panel draws the heading up from below while the same cards fly in from underneath, scale up, gather to center, and flip a half turn to reveal their service lists. Below 1000px it falls back to a static stacked layout. GSAP ScrollTrigger with Lenis, no images.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/scroll-flip-cards.tsx",
        target: "components/ui/scroll-flip-cards.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "word-highlight-scroll",
    title: "Word Highlight Scroll",
    description:
      "Pinned copy that reads itself in as you scroll. Each paragraph section pins while its words light up one after another: a grey chip fades in, the word resolves through it, and selected keywords carry a colored pill; past 70 percent the sweep reverses. Bold color-card headlines sit between the sections. GSAP ScrollTrigger with Lenis, no images.",
    section: "components",
    category: "Text",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/word-highlight-scroll.tsx",
        target: "components/ui/word-highlight-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "split-reveal-preloader",
    title: "Split Reveal Preloader",
    description:
      "A one-shot intro where a studio name and numeral settle, the first letter drifts up into a compact logo mark, floating tags fade through, then the screen splits along its middle: the top lifts, the bottom drops, and a thin seam widens into the hero with a centered card whose title rolls up. GSAP timeline with SplitText and CustomEase.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/split-reveal-preloader.tsx",
        target: "components/ui/split-reveal-preloader.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "cursor-image-trail",
    title: "Cursor Image Trail",
    description:
      "A hero that spawns a trail of images behind a fast pointer. Once the cursor travels far enough inside the frame, an image is dropped at the interpolated position and slides to the live one, revealed by ten horizontal mask layers that clip open from the center out, then collapse and fade as each image ages out. Desktop only, no dependencies.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cursor-image-trail.tsx",
        target: "components/ui/cursor-image-trail.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "converging-icons-text",
    title: "Converging Icons Text",
    description:
      "A pinned hero where a row of icons collects itself into a sentence. As you scroll, the header fades, the floating icon row lifts and scales down to caption size, then clones of each icon peel off and travel into inline slots inside a headline, moving vertically then horizontally into place, and the surrounding words fade in one by one in a shuffled order. GSAP ScrollTrigger with Lenis, desktop only.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/converging-icons-text.tsx",
        target: "components/ui/converging-icons-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "isochrome-page",
    title: "ISOChrome Page",
    description:
      "A source-backed ISOChrome creative-agency template ported from a Next App Router build. It ships the routed home (preloader), about (pinned expertise panel, parallax), work, project, and contact pages behind a lightweight internal router. Line-reveal text uses gsap SplitText (replacing split-type), parallax and ScrollTrigger run against the preview's own scroll container (replacing Lenis), and routing is local (replacing next-view-transitions), so it depends only on gsap. Druk and Akkurat Mono fonts and imagery are Blob-hosted.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "@gsap/react"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/isochrome-page/index.tsx",
        target: "components/ui/isochrome-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/isochrome-page/styles.ts",
        target: "components/ui/isochrome-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "dither-studio-page",
    title: "Dither Studio Page",
    description:
      "A full-bleed agency homepage built on dither. The whole page sits on a fixed WebGL fbm field quantised through a Bayer matrix that drifts and warps toward the cursor. A floating pill nav carries a morphing pixel mark and a per-section message, and unfolds into a full menu behind a page-wide blur. A right rail stacks a contact card and collapsible panels that follow the section in view, case rows expand in place with seeded procedural dither plates, every image slot smears into coarse pixels under the cursor, a label chases the pointer across hoverables, and a status rail pins to the bottom with a live clock. On load a counter runs to 100% before the plate dissolves from its thinnest areas outward. No media bundled, no runtime dependencies; pass footage through props.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-21",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/dither-studio-page/index.tsx",
        target: "components/ui/dither-studio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/dither-studio-page/dither-canvas.tsx",
        target: "components/ui/dither-studio-page/dither-canvas.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/dither-studio-page/reveals.tsx",
        target: "components/ui/dither-studio-page/reveals.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "null-studio-page",
    title: "Null Studio Page",
    description:
      "A source-backed Null Studio agency template. It ships the routed home, projects, about (with a draggable auto-playing team carousel), sample project (custom video player and collapsible copy), careers, and contact pages behind a lightweight internal router. The fullscreen overlay menu and interactions are rebuilt with React state and CSS, so it ships no runtime dependencies, with Blob-hosted Cosi Times, PP Eiko, and PP Neue Montreal fonts and imagery.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/null-studio-page/index.tsx",
        target: "components/ui/null-studio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/null-studio-page/styles.ts",
        target: "components/ui/null-studio-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "ink-core-layout",
    title: "Ink Core Layout",
    description:
      "A source-backed horizontal editorial layout: segmented monochrome tiles, display controls, a cursor-drawn black ink field, and the original monochrome intro-film loader.",
    section: "pages",
    category: "Animations",
    pro: false,
    date: "2026-07-18",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/ink-core-layout.tsx",
        target: "components/ui/ink-core-layout.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ascii-monogram-hero",
    title: "ASCII Monogram Hero",
    description:
      "A load-in and hero sequence where a 50 by 14 grid of solid cells dissolves in a random stagger behind a stepped glyph progress bar, revealing a giant blackletter monogram zooming from 10x scale, lit by a pointer-following light in a fogged Three.js scene and rendered entirely as monospace ASCII characters.",
    section: "components",
    category: "Animations",
    pro: false,
    date: "2026-07-19",
    type: "registry:ui",
    dependencies: ["gsap", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/ascii-monogram-hero.tsx",
        target: "components/ui/ascii-monogram-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "brutalist-portfolio-page",
    title: "Brutalist Portfolio Page",
    description:
      "A source-backed Brutal Portfolio template. It ships the routed home (a cursor image-trail over a red brutalist layout), an about page, and a case-studies list behind a lightweight internal router. The original TweenMax image trail is reimplemented in gsap 3, scoped to the component, with Blob-hosted PP Mondwest and PP NeueBit fonts and imagery.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/brutalist-portfolio-page/index.tsx",
        target: "components/ui/brutalist-portfolio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/brutalist-portfolio-page/styles.ts",
        target: "components/ui/brutalist-portfolio-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "unusual-studio-page",
    title: "Unusual Studio Page",
    description:
      "A source-backed Unusual Designs creative-studio template. It ships the routed home, portfolio, about (with native sticky panels), careers (Lottie), contact, and sample project pages behind a lightweight internal router, with a framer-motion slide page transition, a CSS marquee, the official Lottie web-component player, and Blob-hosted Neue Montreal fonts and images. Locomotive-scroll is dropped for native container scroll.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["framer-motion"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/unusual-studio-page/index.tsx",
        target: "components/ui/unusual-studio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/unusual-studio-page/styles.ts",
        target: "components/ui/unusual-studio-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "neoteric-page",
    title: "Neoteric Page",
    description:
      "A source-backed Neoteric Studio agency template. It ships the routed home, work, studio, dark thinking, feed, contact, and sample project pages behind a lightweight internal router, with a framer-motion slide-in/slide-out page transition, dark nav and footer on the thinking route, a self-contained masonry grid, and Blob-hosted imagery.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["framer-motion"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/neoteric-page/index.tsx",
        target: "components/ui/neoteric-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/neoteric-page/styles.ts",
        target: "components/ui/neoteric-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "soren-page",
    title: "Soren Page",
    description:
      "A source-backed Soren personal portfolio template. It ships the routed home with a Spline 3D hero and live clock, a magnifying macOS-style dock, a GSAP work masonry, a projects list with scramble text, a photos grid, and a sample blog post, all behind a lightweight internal router with Blob-hosted imagery. The Spline scene loads through the official web-component viewer.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "@gsap/react", "react-icons"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/soren-page/index.tsx",
        target: "components/ui/soren-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/soren-page/styles.ts",
        target: "components/ui/soren-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "velasco-solari-page",
    title: "Velasco Solari Page",
    description:
      "A source-backed Velasco Solari director portfolio template. It ships the routed home reel, work grid, overview table, Mustang film page, info, and sample project pages behind a lightweight internal router, with the original fixed nav, hover blur-and-slide work grid, focus-dimming overview table, Vimeo background reels, and Blob-hosted Founders Grotesk fonts and project images.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/velasco-solari-page/index.tsx",
        target: "components/ui/velasco-solari-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/velasco-solari-page/styles.ts",
        target: "components/ui/velasco-solari-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "pixelgrid-studio-page",
    title: "Pixelgrid Studio Page",
    description:
      "A source-backed design-studio marketing page built entirely on a 9px pixel grid: a generative cursor-reactive hero field with a decode-to-text headline and keyboard easter eggs, springy drag carousels with generative case-study art, cursor-tracking smiley faces, a diamond-tessellation protocol visualization, a double-helix process flow, and a fully playable Tetris game hidden in the footer.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-14",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/pixelgrid-studio-page/index.tsx",
        target: "components/ui/pixelgrid-studio-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/pixelgrid-studio-page/styles.ts",
        target: "components/ui/pixelgrid-studio-page/styles.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/scroll-adapter.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/scroll-adapter.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/hero-field.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/hero-field.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/reveals.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/reveals.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/carousel.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/carousel.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/preview-fx.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/preview-fx.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/hover-crumble.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/hover-crumble.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/process-viz.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/process-viz.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/flow-canvases.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/flow-canvases.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/footer-tetris.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/footer-tetris.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pixelgrid-studio-page/scripts/misc-ui.ts",
        target: "components/ui/pixelgrid-studio-page/scripts/misc-ui.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "sticky-flip-cards",
    title: "Sticky Flip Cards",
    description:
      "A pinned hero where a single front card flips a half turn to reveal a fanned stack of color-coded back cards, which then peel off and dismiss one by one with a tilt as you scroll. The headline lifts away on entry and an outro statement closes it out. GSAP ScrollTrigger with Lenis, no images.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-13",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sticky-flip-cards.tsx",
        target: "components/ui/sticky-flip-cards.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "smudge-cursor-reveal",
    title: "Smudge Cursor Reveal",
    description:
      "A hero where moving the cursor smudges away the top layer to reveal a hidden message underneath. Circles are stamped along the pointer path into an SVG goo-filter mask, then expand and dissolve, so the reveal reads like wiping fog off glass. Pointer and touch driven, GSAP only, no scroll.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-13",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/smudge-cursor-reveal.tsx",
        target: "components/ui/smudge-cursor-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "landing-image-reveal",
    title: "Landing Image Reveal",
    description:
      "A load intro where a progress bar wipes away, five scattered images slide in and line up across the frame, then the outer pairs fly off-screen while the center image scales up to fill the hero. The nav, headline, and contact lines reveal in masked lines on top. GSAP timeline with SplitText, Blob-hosted images.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-13",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/landing-image-reveal.tsx",
        target: "components/ui/landing-image-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "spotlight-gallery-scroll",
    title: "Spotlight Gallery Scroll",
    description:
      "A pinned hero where a giant three-column image wall shrinks to a tidy grid as you scroll, a corner logo scales down and rides up into place, the headline fades in word by word while the footer blurs away, then the whole hero lifts and dims to hand off to the next sections. GSAP ScrollTrigger with SplitText and Lenis, Blob-hosted images.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-13",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/spotlight-gallery-scroll.tsx",
        target: "components/ui/spotlight-gallery-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "curtain-reveal-hero",
    title: "Curtain Reveal Hero",
    description:
      "A long pinned hero that stages a full reveal on scroll. A red wipe splits from a center seam to fill the frame, three images cascade open from nothing with a clip-and-scale, and a closing statement scales up, then that statement is cut down the middle and its two halves slide apart like curtains to hand off to the next section. GSAP timeline ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/curtain-reveal-hero.tsx",
        target: "components/ui/curtain-reveal-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "slit-reveal-hero",
    title: "Slit Reveal Hero",
    description:
      "A pinned hero that peels itself apart in stages. The lead image narrows to a vertical slit as a dark veil closes over it, then the whole panel rotates and shrinks to nothing while two columns of copy slide off behind it under a red wash, and finally two outro images clip in from top and bottom as the closing headline rises line by line. GSAP ScrollTrigger with SplitText and Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/slit-reveal-hero.tsx",
        target: "components/ui/slit-reveal-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "tilt-card-stack",
    title: "Tilt Card Stack",
    description:
      "Full-screen colored cards that pin and fall back as the next one climbs over them. Each card holds until the following card reaches the top of the frame, then tilts away on its X axis, sinks in Z, and darkens under a black veil, so the deck reads as pages laid down one behind another. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/tilt-card-stack.tsx",
        target: "components/ui/tilt-card-stack.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "montage-reveal-hero",
    title: "Montage Reveal Hero",
    description:
      "A landing intro that counts itself in. A rolling three-digit counter runs to 100 while a loader panel wipes up and a stack of thumbnails pops in at one corner, then the whole stack Flips across to the opposite corner with a scale pulse as the counter fades, and the navigation, sidebar, dividers, and headline rise into place line by line. GSAP Flip with SplitText.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/montage-reveal-hero.tsx",
        target: "components/ui/montage-reveal-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "shader-grid-gallery",
    title: "Shader Grid Gallery",
    description:
      "An infinite, draggable grid of framed images rendered entirely in one fragment shader. A single full-screen plane tiles the projects into cells with borders, captions, and a lens-warped vignette; dragging pans the field with inertia and eases in a slight zoom, the cell under the pointer lifts, and a click that does not drag selects that project. Three.js with on-the-fly image and text atlases.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/shader-grid-gallery.tsx",
        target: "components/ui/shader-grid-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "minimap-scrubber",
    title: "Minimap Scrubber",
    description:
      "A filmstrip navigator with a fixed selector window. A column of thumbnails glides under a bordered indicator as you wheel or drag; whichever overlaps the indicator most dims to mark itself active and swaps the large centered preview, and clicking a thumbnail eases it into the indicator. Turns horizontal on narrow screens. Lerped, no dependencies.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/minimap-scrubber.tsx",
        target: "components/ui/minimap-scrubber.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "curved-plane-slider",
    title: "Curved Plane Slider",
    description:
      "A WebGL slider that wraps its images around a curved plane. Stills and titles are painted into a tall repeating canvas texture mapped onto a parabolic plane tilted in 3D; scrolling shifts the texture so the slides glide up the curve and loop seamlessly, framed by a fixed nav, footer, and vignette. Three.js with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["three", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/curved-plane-slider.tsx",
        target: "components/ui/curved-plane-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "curve-gallery",
    title: "Curve Gallery",
    description:
      "A scroll-driven 3D image field inspired by gaspoorf's Curve Gallery. Hundreds of photographs sit along a closed Catmull-Rom path while the camera travels through them; nearby frames swell with a cubic focus falloff, five path controls reshape the same field, and wheel, drag, keyboard, or autoplay share one eased progress value. One self-contained Three.js component using existing hosted images.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-15",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/curve-gallery.tsx",
        target: "components/ui/curve-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "lego-dither",
    title: "Lego Dither",
    description:
      "A spinning 3D marble hand rebuilt from a six-frame Lego stud sprite sheet. The hand renders into a luminance buffer, a fullscreen shader selects one colored stud per cell, and pointer movement rotates the model while painting a fading, warping trail through the same dither field. A self-contained Three.js interpretation of DEEO Studio's 3D Lego Dither artifact.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-23",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/lego-dither.tsx",
        target: "components/ui/lego-dither.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "rotating-hand-scroll",
    title: "Rotating Hand Scroll",
    description:
      "A long pinned section built around a single clock-hand pill. Scrolling sweeps it through five full turns, each swapping the headline; on the fourth a portrait fades into the hand as body copy slides in, then the hand grows, scales up more than twentyfold to fill the frame, and dissolves to reveal the closing wordmark. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/rotating-hand-scroll.tsx",
        target: "components/ui/rotating-hand-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "catalog-swap-gallery",
    title: "Catalog Swap Gallery",
    description:
      "A documentary catalog with a scrolling thumbnail rail. Picking a thumbnail throws the current project out (title, line-split synopsis and credits lift and clip away while the featured still scales down and drops) then builds the next one in from below over a blurred backdrop that cross-fades to the new frame. GSAP with SplitText.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/catalog-swap-gallery.tsx",
        target: "components/ui/catalog-swap-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "filter-scrub-gallery",
    title: "Filter Scrub Gallery",
    description:
      "A horizontal wall of image cards panned by pointer position with a lerped offset, plus a column of category filters that expand matching cards from a sliver to full width with a custom hop ease and collapse the rest, re-measuring the scrub range each time. GSAP with CustomEase, no other dependencies.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/filter-scrub-gallery.tsx",
        target: "components/ui/filter-scrub-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "cross-reveal-scroll",
    title: "Cross Reveal Scroll",
    description:
      "A pinned scroll sequence that resolves onto a single white cross. As you scroll it rotates a full turn, its two bars widen from thin slits into solid quadrants, drifts to center, then scales up more than tenfold to wipe the screen and reveal the closing statement. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cross-reveal-scroll.tsx",
        target: "components/ui/cross-reveal-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "folding-panel-menu",
    title: "Folding Panel Menu",
    description:
      "A strip of numbered panels pinned to the right edge that unfolds into a fullscreen navigation. Tapping Menu widens the strip with a custom hop ease while each panel's giant rotated word rises letter by letter; once open, hovering a panel swaps its label and clip-reveals its image. GSAP timeline with CustomEase.",
    section: "components",
    category: "Overlays",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/folding-panel-menu.tsx",
        target: "components/ui/folding-panel-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "stretch-text-scroll",
    title: "Stretch Text Scroll",
    description:
      "Three pinned panels whose oversized words grow on a vertical scaleY as you scroll in, snap to full height, then collapse back out. The final panel keeps scaling its word past the frame until a background still takes over, its wash fades, and a centered headline reads in word by word. GSAP ScrollTrigger with SplitText and Lenis.",
    section: "components",
    category: "Text",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/stretch-text-scroll.tsx",
        target: "components/ui/stretch-text-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "arc-spotlight-scroll",
    title: "Arc Spotlight Scroll",
    description:
      "A pinned telescope reveal. Two words split apart to open a scaling background frame, then a diagonally clipped viewport scrolls a column of titles past its center. As each title reaches the middle it lights up, the backdrop swaps to its still, and thumbnail frames arc down a bezier path on the right. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/arc-spotlight-scroll.tsx",
        target: "components/ui/arc-spotlight-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sticky-stack-cards",
    title: "Sticky Stack Cards",
    description:
      "Full-height cards that pin in place and stack. As the next card scrolls up over the current one, the underlying card scales down, tilts a few degrees in alternating directions, and darkens under a shadow overlay, so the deck compresses into a layered pile. GSAP ScrollTrigger.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-12",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sticky-stack-cards.tsx",
        target: "components/ui/sticky-stack-cards.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "depoluxe-sideways-carousel",
    title: "Depoluxe Sideways Carousel",
    description:
      "An infinite cinematic project reel that rests as a fullscreen film, then opens into a diagonal stack while the user wheels, drags, or enters the left focus zone. Neighboring videos halve in size along the track before the stack folds back into the active project.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-15",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/depoluxe-sideways-carousel.tsx",
        target: "components/ui/depoluxe-sideways-carousel.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "starry-night-flow",
    title: "Starry Night Flow",
    description:
      "Van Gogh's Starry Night rendered as a living particle field. The painting is Floyd-Steinberg dithered into a WebGL point cloud, a structure tensor recovers brushstroke direction and coherence from the pixels, and coherent particles drift along their strokes in staggered lifecycles under traveling wind gusts. Moving the pointer bends nearby strokes toward the cursor. Works with any painterly image; inspired by Joshua Garcia's Still Night.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-19",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/starry-night-flow.tsx",
        target: "components/ui/starry-night-flow.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "surprise-box",
    title: "Surprise Box",
    description:
      "A wireframe shipping box alone on black that begs to be clicked. Each poke hops the box, rattles its top flaps, and pitches the poke sound up a step; land five pokes inside the combo window and the lid bursts open, firing waves of tumbling 3D cubes on real gravity. A pointer-transparent stencil of the box front is painted over the rising confetti, so cubes read as leaving from inside the box and only jump in front once they start falling. Inspired by workbox.sh.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/surprise-box.tsx",
        target: "components/ui/surprise-box.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "starfield-warp-scroll",
    title: "Starfield Warp Scroll",
    description:
      "A pinned canvas starfield where scroll drives the warp. A thousand weighted-color streaks fire out of a center hole, stretching and brightening the further they travel, while three headlines hand off word by word: one fades out as it swells past full size, the next fades in as it settles. Canvas 2D with GSAP ScrollTrigger, SplitText, and Lenis. No images.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/starfield-warp-scroll.tsx",
        target: "components/ui/starfield-warp-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "physics-tag-footer",
    title: "Physics Tag Footer",
    description:
      "A footer that fills itself by dropping. Scroll it into view and a stack of rounded labels rains in from above, tumbles off the walls, and piles up on the floor, each one grabbable and throwable afterwards. A top wall seals the box three seconds in so nothing can be flung back out, and dragged bodies are clamped so they cannot be dragged through a wall. Matter.js bodies driving real DOM elements.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis", "matter-js"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/physics-tag-footer.tsx",
        target: "components/ui/physics-tag-footer.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "showreel-zoom-scroll",
    title: "Showreel Zoom Scroll",
    description:
      "A showreel that starts as a thumbnail floating above the fold and grows into the frame as you scroll. The card tracks the pointer horizontally while it is still small, drifting further the smaller it is, then locks dead center once it reaches full size. Its caption shrinks on a two stage curve so the type lands at reading size exactly when the video does. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/showreel-zoom-scroll.tsx",
        target: "components/ui/showreel-zoom-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "interlock-title-scroll",
    title: "Interlock Title Scroll",
    description:
      "Full-bleed titles that assemble themselves as they enter. Every other character starts pushed above the line and the rest below, so the word reads as two combs sliding into each other, while the whole block drifts in from the side. Each band staggers from a different end and the middle one runs the opposite direction to its neighbours. GSAP SplitText and ScrollTrigger with Lenis, no images.",
    section: "components",
    category: "Text",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/interlock-title-scroll.tsx",
        target: "components/ui/interlock-title-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "drawn-path-features",
    title: "Drawn Path Features",
    description:
      "A feature section threaded together by one fat orange stroke. The path sits behind the content on a negative layer and draws itself in exact step with the scroll, so the line arrives at each illustration and card just as that block reaches reading position, and completes on the last row. Stroke dash offset driven by GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drawn-path-features.tsx",
        target: "components/ui/drawn-path-features.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "circular-widget-dial",
    title: "Circular Widget Dial",
    description:
      "A ring of image segments that never stops turning. The ring rotates one way, a thin indicator line sweeps the other, and whichever segment sits under the line becomes the desaturated full-bleed backdrop with its name on a chip in the middle. Wheeling over it spins both faster or throws them into reverse, and every value eases on a lerp so the dial coasts instead of snapping. SVG arcs built and clipped at runtime.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/circular-widget-dial.tsx",
        target: "components/ui/circular-widget-dial.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sliding-index-menu",
    title: "Sliding Index Menu",
    description:
      "A full-screen menu that wipes up from the bottom edge and hands the page over to an oversized link index. The whole rail slides horizontally against the pointer so moving right pulls the far links into reach, and an accent bar chases whichever link is hovered, easing its position and its width at once. Each link swaps to a duplicate copy on a per-character roll. GSAP SplitText with Lenis.",
    section: "components",
    category: "Overlays",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sliding-index-menu.tsx",
        target: "components/ui/sliding-index-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "elastic-curtain-menu",
    title: "Elastic Curtain Menu",
    description:
      "A full-screen menu whose panel is a single SVG path with a quadratic control point, so it drops in as a sagging sheet rather than a rectangle. Opening runs the curve past its resting position and settles it, closing flips the anchor to the bottom and lifts the sag the other way. Link characters fly in from far right on an elastic ease while the contact block staggers up underneath.",
    section: "components",
    category: "Overlays",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/elastic-curtain-menu.tsx",
        target: "components/ui/elastic-curtain-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "tilt-away-menu",
    title: "Tilt Away Menu",
    description:
      "Opening this menu does not cover the page, it throws it. The hero rotates, scales up and slides off toward the bottom right while the panel unfolds from the opposite corner, arriving from a rotated, oversized, quarter-opacity state. The clip path overshoots past the bottom edge so the panel lands as a skewed sheet, links roll up from below their baseline, and hovering a link stacks a new preview in over the last.",
    section: "components",
    category: "Overlays",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/tilt-away-menu.tsx",
        target: "components/ui/tilt-away-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "push-down-overlay-menu",
    title: "Push Down Overlay Menu",
    description:
      "The menu does not sit on top of the page, it pushes it. Opening drives the whole document down a full viewport while the panel wipes in from the top edge and its own content slides down from half a screen above, so the two read as one sheet. Every line of menu copy is masked and dropped in with a negative stagger, and the hamburger folds into a cross on the same custom ease. GSAP CustomEase and SplitText with Lenis.",
    section: "components",
    category: "Overlays",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/push-down-overlay-menu.tsx",
        target: "components/ui/push-down-overlay-menu.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "dealt-team-cards",
    title: "Dealt Team Cards",
    description:
      "A team section that deals itself out. Dashed placeholder frames rise into their slots as the section approaches, each popping its giant initial once the frame is most of the way up. The section then pins and the real cards fly in from off to the right, rotating flat and scaling up on staggered windows, so the last card is still arriving while the first has settled. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/dealt-team-cards.tsx",
        target: "components/ui/dealt-team-cards.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "wedge-clip-work-scroll",
    title: "Wedge Clip Work Scroll",
    description:
      "A work index where each project opens and closes like an aperture. The image starts as an angled wedge, widens to a full rectangle as the panel arrives, then folds shut from the bottom as it leaves. The project title is masked per character and each character gets its own short scroll window, so the name types itself upward slightly ahead of the image finishing its opening. GSAP SplitText and ScrollTrigger with Lenis.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/wedge-clip-work-scroll.tsx",
        target: "components/ui/wedge-clip-work-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "split-column-infinite-slider",
    title: "Split Column Infinite Slider",
    description:
      "Two columns that scroll in opposite directions off one wheel. Each slide is revealed by a clip path growing from the bottom on the left and the top on the right, with a half percent overlap so no seam ever shows. Images drift against the reveal at 1.25 zoom so the drift never exposes an edge, and copy holds dead center through a short window before easing away on a smoothstep. Slides are built and destroyed around a three slide buffer, so the loop is endless without cloning the set.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/split-column-infinite-slider.tsx",
        target: "components/ui/split-column-infinite-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "dial-product-slider",
    title: "Dial Product Slider",
    description:
      "A product reel driven by a single round controller. Arrows step the reel, which keeps a fixed buffer either side of center and recycles the far items so the catalogue loops without cloning. Pressing the middle turns the dial inside out: the outer ring closes to a point, the inner disc opens into a close button, the flanking products fan out and fade, the background fills with the product shot, and a detail card slides up into the middle.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/dial-product-slider.tsx",
        target: "components/ui/dial-product-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "parallax-drag-rail",
    title: "Parallax Drag Rail",
    description:
      "An endless horizontal rail you can wheel or drag. Six copies of the set are laid end to end and the track silently jumps back a full sequence whenever it drifts past the safe band, so the loop never runs out and never visibly seams. Each image is held at 2.25 zoom and slid against its own frame by its distance from center, so cards read as windows onto one continuous scene. Captions only appear once the rail is genuinely still, and a real drag suppresses the click.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/parallax-drag-rail.tsx",
        target: "components/ui/parallax-drag-rail.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "endless-side-story",
    title: "Endless Side Story",
    description:
      "A whole editorial page laid out sideways and looped. The section run is cloned two sequences either side of the original and the track jumps a full sequence whenever it drifts past the halfway guard, so scrolling never reaches an end in either direction. The progress bar and counter read position modulo one sequence and snap rather than ease across the wrap, so the bar never runs backwards through the whole width.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/endless-side-story.tsx",
        target: "components/ui/endless-side-story.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "marquee-carousel-scroll",
    title: "Marquee Carousel Scroll",
    description:
      "A pinned carousel where each project arrives as a wedge. Scrolling forward tilts the incoming slide's clip path up from the bottom edge while the outgoing one closes off the top, and the image and copy inside slide at different rates so the layers separate as they cross. Each title is tripled and marqueed on an infinite linear loop, and a row of segmented bars fills one at a time to show position in the set.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/marquee-carousel-scroll.tsx",
        target: "components/ui/marquee-carousel-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "throw-away-work-slider",
    title: "Throw Away Work Slider",
    description:
      "A wheel-driven project slider where the outgoing slide is thrown rather than faded. It shrinks to a quarter, rotates thirty degrees and flies two viewports off screen, while the incoming one enters from the opposite edge through a narrow clip path that widens to full frame. Copy is split fresh on every slide so words and lines climb out from behind their own masks. Input is rate limited to one slide per second so a fast scroll cannot stack transitions.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/throw-away-work-slider.tsx",
        target: "components/ui/throw-away-work-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "flip-marquee-horizontal",
    title: "Flip Marquee Horizontal",
    description:
      "A tilted marquee that hands one of its own frames over to the next section. As the marquee passes, one image is cloned in place, and when the horizontal section pins, GSAP Flip grows that clone from its slot in the rotated strip to a full-bleed plate, straightening it on the way. The page darkens across the first five percent of the pin, then the track and the plate travel at different rates so the plate slides out from behind the slides.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/flip-marquee-horizontal.tsx",
        target: "components/ui/flip-marquee-horizontal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "clip-reveal-services",
    title: "Clip Reveal Services",
    description:
      "Copy that fills in as you read it, and a three line masthead that assembles then collapses. Each paragraph is duplicated through a pseudo element and the bright copy is clipped from the bottom up on scroll, so the grey text is overwritten line by line rather than faded. The service lines slide in from alternating sides, then the section pins: the outer two close on the middle one, and once stacked all three scale down together.",
    section: "components",
    category: "Text",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/clip-reveal-services.tsx",
        target: "components/ui/clip-reveal-services.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "swing-in-work-grid",
    title: "Swing In Work Grid",
    description:
      "A work index where each row swings into place. Cards start a thousand pixels low and rotated sixty degrees, mirrored left against right, so a row reads as two panels hinging shut. The row fires once when it reaches mid viewport and the pair lands on a quarter second stagger, which keeps the second card still turning as the first settles. GSAP ScrollTrigger with Lenis.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/swing-in-work-grid.tsx",
        target: "components/ui/swing-in-work-grid.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sticky-parallax-slides",
    title: "Sticky Parallax Slides",
    description:
      "A pinned horizontal run where the images resist the track. Each photo is held at 1.35 zoom and pushed back a quarter of the slide width as its panel crosses, so the frames slide over the pictures instead of carrying them. Only the outgoing and incoming pair are offset at any moment. Titles are governed by an IntersectionObserver against the slider, so the caption swaps at the quarter visible mark and steps back correctly on reverse.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sticky-parallax-slides.tsx",
        target: "components/ui/sticky-parallax-slides.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "masked-spotlight-scroll",
    title: "Masked Spotlight Scroll",
    description:
      "A pinned sequence where a wall of desaturated stills drifts past, then a shaped mask opens through it. The mask grows from nothing to 450 percent while the photograph behind it counter-scales from 1.5 down to 1, so the image appears to settle as the aperture widens rather than being pushed by it. Once the mask is fully open the closing headline fills in word by word against scroll position.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/masked-spotlight-scroll.tsx",
        target: "components/ui/masked-spotlight-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "deal-stack-cards-scroll",
    title: "Deal Stack Cards Scroll",
    description:
      "A pinned deck where each card rises from below, lands on the pile at its own fixed tilt, then gets pushed off toward the top left as the cards behind it arrive. Departure speed is scaled per card, so the earliest card travels furthest and the stack fans out diagonally instead of leaving as one block. Each card only starts moving once the previous one has fully landed.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/deal-stack-cards-scroll.tsx",
        target: "components/ui/deal-stack-cards-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "frame-sequence-hero",
    title: "Frame Sequence Hero",
    description:
      "A scroll-scrubbed video played as 207 individual frames on a canvas. Every frame is preloaded before the trigger is created, so scrubbing never lands on a blank canvas, and each draw recomputes its own cover fit so the sequence fills any aspect ratio without distortion. Over the same pin the nav fades in the first tenth, the headline recedes on Z and fades by a quarter, and the product shot flies in from a thousand pixels forward.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/frame-sequence-hero.tsx",
        target: "components/ui/frame-sequence-hero.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "snap-parallax-projects",
    title: "Snap Parallax Projects",
    description:
      "An endlessly scrolling project list that settles on whole panels. Wheel or drag moves it freely, but a tenth of a second after input stops it eases to the nearest panel boundary on a cubic curve, so it never rests half way between two projects. Panels are built into a fifteen either side buffer and destroyed past fifty. Each image is held at 1.5 zoom and lags its panel by a fifth, and the layout alternates so the picture swaps sides project to project.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/snap-parallax-projects.tsx",
        target: "components/ui/snap-parallax-projects.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "triangle-fill-scroll",
    title: "Triangle Fill Scroll",
    description:
      "A pinned scene where a lattice of alternating triangles floods with color in a random order. Every cell is assigned a shuffled position in the sequence at build time, then fills once scroll passes its slot, each easing toward its target scale on its own, so the fill spreads as scattered noise rather than a wipe. Two canvases stack around the cards: hollow outlines behind and filled triangles in front, so the cards are swallowed as the grid closes over them.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/triangle-fill-scroll.tsx",
        target: "components/ui/triangle-fill-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "nested-mask-banner",
    title: "Nested Mask Banner",
    description:
      "A banner that opens like a telescope. Seven copies of the same photograph are stacked, each masked by the same shape and each starting at a smaller scale than the one above, so the frame reads as concentric rings rather than a single picture. Scroll grows the container from nothing while every ring closes on full size at a different rate, so the rings collapse into one image at the end. Two words slide apart as it opens.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/nested-mask-banner.tsx",
        target: "components/ui/nested-mask-banner.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "pinned-scale-mosaic",
    title: "Pinned Scale Mosaic",
    description:
      "A sparse photo grid where every row grows in and then collapses away. Each row runs two triggers: one scales its images up from nothing as the row rises into view, a second pins the row at the top and scales them back to zero as it leaves, with pinSpacing off so the next row slides up over it. Images scale about their outer corner rather than their center, alternating left and right, so a row opens outward from the edges.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/pinned-scale-mosaic.tsx",
        target: "components/ui/pinned-scale-mosaic.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "curved-letter-path-scroll",
    title: "Curved Letter Path Scroll",
    description:
      "Four rows of letters travelling along invisible 3D curves, over a card strip bent into a cylinder. The letters are real DOM elements: each frame their position is sampled from a CatmullRom curve, projected through the Three camera, and eased toward that screen coordinate, so they get true perspective while staying crisp text. Each row runs at its own speed, and a letter that wraps past the edge snaps rather than easing. The cards are painted into one offscreen canvas used as a texture on a plane whose vertices are displaced on a parabola.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis", "three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/curved-letter-path-scroll.tsx",
        target: "components/ui/curved-letter-path-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "carousel-ring-gallery",
    title: "Carousel Ring Gallery",
    description:
      "Twenty-five cards arranged on a ring, each rotated to face outward from the center. Moving the pointer tilts the whole ring on two axes, and any card within range flips a half turn, scales up, and pushes outward along its own radius, with the amount falling off by distance so the effect reads as a wave. Clicking a card rotates the ring so that card reaches the bottom, then scales the ring five times and drives it down past the frame, leaving the picture filling the view.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/carousel-ring-gallery.tsx",
        target: "components/ui/carousel-ring-gallery.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "infinite-drag-canvas",
    title: "Infinite Drag Canvas",
    description:
      "A grid you can throw in any direction that never runs out. Tiles are keyed by column and row, built as the viewport approaches and destroyed once it passes, with the buffer biased toward the direction of travel so a fast fling still arrives on populated space. Release keeps the last measured velocity and coasts. Clicking a tile hides the original, spawns a free copy at its exact screen box, and grows it to a centered plate, so the expand starts where you clicked.",
    section: "components",
    category: "Layout",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/infinite-drag-canvas.tsx",
        target: "components/ui/infinite-drag-canvas.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "card-fan-landing-reveal",
    title: "Card Fan Landing Reveal",
    description:
      "A load sequence that deals a hand. Eight cards pop out around a circle one at a time, then collapse back to nothing. As they go, a second set is already stacked at the first card's exact slot, face down and scaled to a tenth. Those five lift, the front one flips over, and they fan out to evenly spaced positions measured from the real frame width, so the spread always fits its container.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/card-fan-landing-reveal.tsx",
        target: "components/ui/card-fan-landing-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "counter-word-preloader",
    title: "Counter Word Preloader",
    description:
      "A loading screen where four things run off one three second clock: a counter to 100, a word cycling through five variants, an image flicking through ten frames, and that image frame sliding from the left edge to its slot in the headline. When the curtain wipes up, headline words slide in from alternating sides, and the small image frame is measured, frozen at that exact box, then grown to fill the frame, so the thumbnail becomes the page background in one move.",
    section: "components",
    category: "Feedback",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/counter-word-preloader.tsx",
        target: "components/ui/counter-word-preloader.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "shuffle-grid-preloader",
    title: "Shuffle Grid Preloader",
    description:
      "A load sequence built from a three by three grid that riffles. Two columns of credits fade up against a wordmark whose fill climbs line by line, then the panel clears and the grid wipes in. Twenty rounds of random nine-image sets are swapped through at 150ms so the tiles flicker like a shuffling deck, and the final round restores the real center frame. Everything but that tile wipes away, and it scales four times while its own image counter-scales back to one.",
    section: "components",
    category: "Feedback",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/shuffle-grid-preloader.tsx",
        target: "components/ui/shuffle-grid-preloader.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "logo-mask-zoom-scroll",
    title: "Logo Mask Zoom Scroll",
    description:
      "The page is covered by a solid panel with a logo-shaped hole punched through it. That panel starts at 500 times scale, so the hole is far larger than the frame and you only see the photograph behind it. Scroll shrinks the panel on an exponential curve until the hole is exactly logo-sized, at which point the mark reads as drawn on a flat field. The picture counter-zooms while a white sheet fades over it, and the closing headline is filled by a gradient dragged upward through its own background clip.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/logo-mask-zoom-scroll.tsx",
        target: "components/ui/logo-mask-zoom-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "photo-sphere-orb",
    title: "Photo Sphere Orb",
    description:
      "A hundred photographs distributed over the surface of a sphere, each turned to face the middle. Positions come from a Fibonacci spiral rather than a lat/long grid, so the tiles space evenly instead of bunching at the poles. Each plane is built at the real aspect ratio of the texture it received, so nothing is stretched, and the ball is dragged with damped orbit controls that allow rotation and zoom but no panning.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/photo-sphere-orb.tsx",
        target: "components/ui/photo-sphere-orb.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "flying-cube-scroll",
    title: "Flying Cube Scroll",
    description:
      "Six CSS cubes flying in from thirty thousand pixels away and settling into a spread. Every face is a real image on a preserve-3d box, so the cubes are genuinely dimensional rather than pre-rendered. Position, three rotations, and Z are each interpolated per cube across the first half of the pin, and two keep spinning a further half turn in the second. The logo blurs out, the opening headline scales and blurs away, and a second block resolves once the cubes land.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/flying-cube-scroll.tsx",
        target: "components/ui/flying-cube-scroll.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "shader-warp-slider",
    title: "Shader Warp Slider",
    description:
      "A wheel-driven slider where the transition happens in the fragment shader rather than in transforms. Both the outgoing and incoming textures are sampled on the same plane, split at the scroll position, so one image slides out as the next arrives with no second mesh. The vertex shader bows the plane by scroll velocity, bending the sides more than the top and bottom, so the frame flexes like film during a fast flick.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["three"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/shader-warp-slider.tsx",
        target: "components/ui/shader-warp-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "skew-char-header",
    title: "Skew Char Header",
    description:
      "Headlines that assemble character by character, skewed and thrown in from the right. The stagger is keyed to each character's index within its own line rather than its index in the whole heading, so every line starts its ripple at the same moment and multi-line copy reads as several parallel waves instead of one long queue. Three modes on the same component: play on mount, play once on entry, and scrub against scroll.",
    section: "components",
    category: "Text",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/skew-char-header.tsx",
        target: "components/ui/skew-char-header.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "card-parting-reveal",
    title: "Card Parting Reveal",
    description:
      "Three rows of paired cards that split apart to uncover the message behind them. Each row is pushed a different distance, height, and angle, so the pairs fan away at their own rates rather than sliding as one wall. The centered block behind them pops its badge from zero, rolls three lines up from behind their own masks, and lifts the button in last on a short delay.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/card-parting-reveal.tsx",
        target: "components/ui/card-parting-reveal.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "image-explosion-footer",
    title: "Image Explosion Footer",
    description:
      "A footer that erupts when it comes into view. Fifteen cards are launched upward with randomised sideways force and spin, then run on a real integrator: gravity accumulates into velocity every frame while friction bleeds off horizontal drift and rotation, so the arc is genuinely ballistic rather than an eased tween. The burst arms itself again once every particle has fallen back below the midpoint.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/image-explosion-footer.tsx",
        target: "components/ui/image-explosion-footer.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "pushup-card-stack",
    title: "Pushup Card Stack",
    description:
      "A pinned frame where each card is pushed out of view by the one behind it. The outgoing card shrinks to half and tilts ten degrees while its own photograph counter-zooms to 1.5, so the picture appears to hold still as its frame retreats. All three moves run at the same timeline position, so a card leaves at exactly the rate the next one arrives and there is never a gap between them.",
    section: "components",
    category: "Animations",
    pro: true,
    date: "2026-07-25",
    type: "registry:ui",
    dependencies: ["gsap", "lenis"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/pushup-card-stack.tsx",
        target: "components/ui/pushup-card-stack.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "effect-cloudflare-event-api",
    title: "Effect Cloudflare Event API",
    description:
      "A production-shaped Effect 4 beta API for Cloudflare Workers. It includes schema-validated HTTP boundaries, branded identifiers, tagged domain and infrastructure errors, Context.Service modules, explicit Layer composition, KV persistence, traced service functions, structured logs, waitUntil background work, and an Alchemy stack with local development and observability.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-15",
    type: "registry:lib",
    dependencies: [
      "@cloudflare/workers-types@5.20260715.1",
      "alchemy@0.93.12",
      "effect@4.0.0-beta.98",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-cloudflare-event-api/domain.ts",
        target: "src/event-api/domain.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-cloudflare-event-api/services.ts",
        target: "src/event-api/services.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-cloudflare-event-api/worker.ts",
        target: "src/event-api/worker.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-cloudflare-event-api/alchemy.run.ts",
        target: "alchemy.run.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "websocket-route-handler",
    title: "WebSocket Route Handler",
    description:
      "Native WebSocket upgrade support in a Next.js route handler via NextResponse.upgrade(), powered by crossws (bundled with Next.js, no extra install). Requires the experimental.webSocketRouteHandlers flag in next.config.ts; Node.js runtime only, not supported on Edge, static export, or Vercel Functions.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-15",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/websocket-route-handler.ts",
        target: "app/api/ws/route.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "better-auth-jwks-cookie-cache",
    title: "Better Auth JWKS Cookie Cache",
    description:
      'Better Auth 1.7 session cookie cache signed with the jwt() plugin\'s asymmetric keyring instead of the server secret, so an edge worker or a separate service can verify a session from the public JWKS with no database round trip and no ability to mint sessions. Includes the betterAuth() config (strategy "jwt", signingKey "jwt-plugin", secure cookie prefix, boot-time secret check) and an edge reader that fetches and TTL-caches the JWKS, pins the issuer and audience claims, serves a stale keyring through auth-server blips, and documents the revocation lag the cookie cache carries.',
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["better-auth@1.7.0-rc.1", "jose@6.2.3"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/better-auth-jwks-cookie-cache/auth.ts",
        target: "src/better-auth-jwks-cookie-cache/auth.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/better-auth-jwks-cookie-cache/edge-session.ts",
        target: "src/better-auth-jwks-cookie-cache/edge-session.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "better-auth-provisioning-gate",
    title: "Better Auth Provisioning Gate",
    description:
      "A tenant admission gate built on Better Auth 1.7's user.validateUserInfo hook, which runs across every authentication method at create-user, link-account, and OAuth or SSO sign-in. Enforces an email domain allowlist, narrows each SSO provider to the domains it is authoritative for, rejects anonymous sessions, and refuses to admit a new identity whose provider does not assert a verified address. Re-checks the fresh provider email on sign-in, so an account whose IdP identity moved out of the tenant is caught rather than grandfathered.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["better-auth@1.7.0-rc.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/better-auth-provisioning-gate/validate-user-info.ts",
        target: "src/better-auth-provisioning-gate/validate-user-info.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "better-auth-atomic-rate-limit",
    title: "Better Auth Atomic Rate Limit",
    description:
      "A Redis-backed rateLimit.customStorage for Better Auth 1.7, which replaced the old get/set storage pair with a single required atomic consume call. INCR and PEXPIRE run inside one Lua invocation so concurrent sign-in attempts cannot all pass the same stale count, repairs a counter key left without an expiry, rounds Retry-After up, fails closed by default when Redis is unreachable, and keeps the client identifier out of the error path. Typed against the published storage interface and shaped for the Upstash eval signature with an ioredis adapter note.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["better-auth@1.7.0-rc.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/better-auth-atomic-rate-limit/rate-limit-storage.ts",
        target: "src/better-auth-atomic-rate-limit/rate-limit-storage.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "cloudflare-workflow-saga-rollback",
    title: "Cloudflare Workflow Saga Rollback",
    description:
      "A Cloudflare Workflow that compensates instead of unwinding by hand. Each side-effecting step.do registers a WorkflowStepRollbackOptions handler with its own rollbackConfig retry budget, so a terminal failure refunds the charge and revokes the seats in reverse step-start order. Includes a dynamic retries.delay function that reads the provider's Retry-After out of the error, NonRetryableError fail-fast on 402/409, sensitive step output, cron-versus-user detection through WorkflowEvent.schedule, and a control-plane Worker doing terminate({ rollback: true }) and restart({ from }).",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cloudflare-workflow-saga-rollback/workflow.ts",
        target: "src/subscription-saga/workflow.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/cloudflare-workflow-saga-rollback/worker.ts",
        target: "src/subscription-saga/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "cloudflare-worker-test-harness",
    title: "Cloudflare Worker Test Harness",
    description:
      "Integration tests for a real Cloudflare Worker build using wrangler's createTestHarness(), which runs your production output in a local preview server and is driven from an ordinary Node test process. Covers getDurableObjectStorage().exec() to seed and assert SQLite rows, evictDurableObject() to prove state survives a teardown, listDurableObjectIds(), getEnv() for direct Durable Object RPC, plus getLogs, clearLogs, reset, and debug. Ships with the Worker under test: a SQLite-backed rate limit Durable Object with an alarm sweep and a declarative exports config.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: [
      "@cloudflare/workers-types@5.20260719.1",
      "wrangler@4.112.0",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cloudflare-worker-test-harness/worker.ts",
        target: "src/quota/worker.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/cloudflare-worker-test-harness/quota.test.ts",
        target: "src/quota/quota.test.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "cloudflare-worker-cache-tags",
    title: "Cloudflare Worker Cache Tags",
    description:
      "Workers HTTP Cache used the way it is meant to be used: cache: { enabled: true } puts a cache in front of the fetch handler so a hit never invokes the Worker, and the Worker's only job becomes emitting Cache-Control plus Cache-Tag and purging tags on write. Includes a derived tag vocabulary, tagged negative caching for 404s, stale-while-revalidate, ctx.cache.purge({ tags }) from a WorkerEntrypoint, the module-level cache import from cloudflare:workers for a queue consumer that has no ctx, pathPrefixes purge, and a per-export cache override so the admin entrypoint stays uncached.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/cloudflare-worker-cache-tags/worker.ts",
        target: "src/catalog/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "drizzle-pg-jit-query-layer",
    title: "Drizzle Postgres JIT Query Layer",
    description:
      "A Postgres schema and typed query layer on the Drizzle 1.0 release candidate. It uses the rc.1 casing API (snakeCase.table replaces the removed drizzle({ casing }) option), a defineRelations graph with a filtered relation and a non-optional one-to-one, opt-in JIT row mappers, module-scope prepared statements bound with sql.placeholder, rc.4 nullability-preserving sql aggregates via .mapWith() and .nullable(), and an insert().select() backfill that skips defaulted columns.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["drizzle-orm@1.0.0-rc.4", "pg@8.22.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drizzle-pg-jit-query-layer/schema.ts",
        target: "src/db/schema.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/drizzle-pg-jit-query-layer/relations.ts",
        target: "src/db/relations.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/drizzle-pg-jit-query-layer/queries.ts",
        target: "src/db/queries.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "drizzle-kit-migration-gate",
    title: "Drizzle Kit Migration Gate",
    description:
      "A non-interactive migration gate built on the drizzle-kit 1.0 rc.4 programmatic SDK at the drizzle-kit/cli subpath. It keeps rename-versus-create and confirm-data-loss decisions in a reviewed Hint array in the repository, asserts in CI that the schema and the committed migration folder agree by treating a no_changes result as the pass condition, rejects any unapproved destructive change by name with the reason drizzle-kit reported, and applies the same ledger on preview databases through push without ever reaching for force.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["drizzle-kit@1.0.0-rc.4"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drizzle-kit-migration-gate/migration-gate.ts",
        target: "src/db/migration-gate.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "drizzle-effect-pg-repository",
    title: "Drizzle Effect Postgres Repository",
    description:
      "A repository layer over the native Effect v4 Postgres support that Drizzle shipped in 1.0.0-rc.1. Drizzle query builders extend Effect.Effect directly, so there is no tryPromise wrapper and no execute call; this snippet uses that to place the seam at the repository, catching EffectDrizzleQueryError by tag and re-raising tagged domain errors, building the database with makeWithDefaults so only PgClient stays in the requirement channel, and composing a single Live layer whose connection string is the only place Postgres is named.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: [
      "drizzle-orm@1.0.0-rc.4",
      "effect@4.0.0-beta.98",
      "@effect/sql-pg@4.0.0-beta.98",
      "pg@8.22.0",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drizzle-effect-pg-repository/schema.ts",
        target: "src/registry-db/schema.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/drizzle-effect-pg-repository/repository.ts",
        target: "src/registry-db/repository.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-durable-workflow-queue",
    title: "Effect Durable Workflow Queue",
    description:
      "A durable payout settlement workflow built on the Effect 4 execution engine that now ships inside core as effect/unstable/workflow. It includes tag-first Workflow.make with a subclassed workflow, replay-safe Activity checkpoints with attempt tracking, a DurableQueue that persists an item and suspends the workflow until a worker settles it, schema-encoded tagged failures on both the workflow and the queue, and the full layer stack of WorkflowEngine, PersistedQueueFactory, and PersistedQueueStore with fire-and-forget execution, polling, and interruption helpers.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-durable-workflow-queue/workflow.ts",
        target: "src/durable-workflow/workflow.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-durable-workflow-queue/runtime.ts",
        target: "src/durable-workflow/runtime.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-workflow-v4-migration",
    title: "Effect Workflow v4 Migration",
    description:
      "A working Effect 4 workflow annotated line by line with the Effect 3 spelling it replaces, covering the six verified breaks between @effect/workflow 0.19.0 and effect/unstable/workflow: the package move into core, tag-first Workflow.make with a subclassable result and an exposed _tag, the Schema.Schema.Any to Schema.Top generic bound change that only bites user-written helpers, TaggedError to TaggedErrorClass, variadic Schema.Literal to array Schema.Literals, and the Context.Service Type to Service rename on WorkflowEngine.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-workflow-v4-migration/migration.ts",
        target: "src/workflow-migration/migration.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "elysia-plugin-scope-model",
    title: "Elysia 2 Plugin Scope Model",
    description:
      "A working Elysia 2.0 auth plugin that encodes the four renames stale code trips over: route arguments are now (path, hook, handler) rather than (path, handler, hook), every lifecycle method dropped its on prefix (onAfterResponse became afterResponse, onStart became setup, onStop became cleanup), resolve and mapResolve were removed in favour of derive and mapDerive, and the third scope is 'plugin' with the type renamed from LifeCycleType to EventScope. Shows local, plugin, and global scope side by side, as('global') promotion on an ambient timing plugin, a v2 macro using the renamed derive key, and the derive-phase ordering rule that stops a macro derive from reading a mounted plugin's context.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["elysia@2.0.0-exp.46", "typebox@1.3.6"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/elysia-plugin-scope-model/scope.ts",
        target: "src/elysia-plugin-scope-model/scope.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "elysia-aot-build-manifest",
    title: "Elysia 2 AOT Build Manifest",
    description:
      "A Bun.build script that runs Elysia's Sucrose JIT at build time instead of on boot, using the elysia/plugin/aot bundler plugins introduced in the 2.0 experimental line. Covers every ElysiaAotOptions field with the reasoning behind each: strip to stub the handler codegen so the bundler can drop it, lazy for grouped validator thunks, treeShake to rewrite the t import so unused TypeBox constructors disappear, production to bake isProduction, and a second cross-target build using target workerd plus registerFrom and reconstructFrom to emit a Cloudflare Workers valid manifest from a Bun toolchain. Measured at 392,129 bytes down to 133,671 bytes minified with validation intact.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["elysia@2.0.0-exp.46"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/elysia-aot-build-manifest/aot-build.ts",
        target: "src/elysia-aot-build-manifest/aot-build.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "elysia-standard-schema-guard",
    title: "Elysia 2 Standard Schema Guard",
    description:
      "A deployments API that validates with Zod on the way in and TypeBox on the way out, on the same route, documenting the TypeBox v1 dependency swap that Elysia 2.0 forces: the peer moved from @sinclair/typebox at 0.34 to the renamed typebox package at 1.3, and leaving the old one installed yields two TypeBox copies whose validators reject valid input. Also covers when to reach for which validator (TypeBox for responses so the exact-mirror encoder can compile them, TypeBox for params so path coercion applies, Standard Schema for anything shared with a client), and replaces the removed schema.static with Elysia's UnwrapSchema.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["elysia@2.0.0-exp.46", "typebox@1.3.6", "zod@4.1.5"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/elysia-standard-schema-guard/schema.ts",
        target: "src/elysia-standard-schema-guard/schema.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "rivet-durable-workflow-actor",
    title: "Rivet Durable Workflow Actor",
    description:
      "A Rivet actor whose run handler is a durable, replayable workflow, written against the rivetkit 2.3.x split context. Covers the 2.3.1 breaking change that moved actor state, vars, db, client and broadcast off the workflow context onto the step context, plus the 2.3.3 getVersion primitive for shipping new workflow code without corrupting in-flight replay histories. Shows persisted steps, tryStep with retry and rollback config, a durable queue-driven loop with Loop.break and Loop.continue, a durable sleep that survives process death, and typed event and queue tokens that need no runtime schema library.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["rivetkit@2.3.4"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/rivet-durable-workflow-actor/shipment-workflow.ts",
        target: "src/rivet-durable-workflow-actor/shipment-workflow.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "rivet-dynamic-actor-registry",
    title: "Rivet Dynamic Actor Registry",
    description:
      "Per-tenant untrusted code running as isolated Rivet actors, using the dynamicActor loader added in rivetkit 2.3.0. One dynamic definition backs every workspace: the load hook resolves actor source as a string per actor key, from a sibling actor, object storage or an HTTP fetch, and the runtime evaluates it in a Node process capped by memoryLimit and cpuTimeLimitMs. Includes an editable source actor with revision tracking, registry setup, a typed client, and the untyped action() escape hatch that dynamic actors require because they have no compile time action map.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["rivetkit@2.3.4"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/rivet-dynamic-actor-registry/dynamic-runner.ts",
        target: "src/rivet-dynamic-actor-registry/dynamic-runner.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "sveltekit-live-query-stream",
    title: "SvelteKit Live Query Stream",
    description:
      "Server-push status streaming with SvelteKit's experimental query.live remote function, pinned to @sveltejs/kit 2.70.1. A *.remote.ts module exposes a live query backed by a plain async generator that SvelteKit drives as an SSE stream, with a per-process pub/sub hub, first-yield SSR seeding, and a finally block that unregisters listeners when a subscriber disconnects. A paired command records a phase transition and, in the same response, walks requested(fn, limit) to reconnect only the live subscriptions whose argument actually changed, using the { arg, query } entry shape introduced in 2.58.0. Includes locals-based auth, hand validation of the 'unchecked' argument, and comments pinning the 2.59.0, 2.63.1 and 2.66.0 behaviour changes.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@sveltejs/kit@2.70.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sveltekit-live-query-stream/deploy-status.remote.ts",
        target: "src/lib/deploy-status.remote.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "sveltekit-explicit-env-vars",
    title: "SvelteKit Explicit Env Vars",
    description:
      "A src/env.ts manifest using defineEnvVars from @sveltejs/kit/env, the import path introduced in 2.70.0 (the older @sveltejs/kit export is now deprecated). Replaces prefix-based $env/static and $env/dynamic with one declared table where every variable states its visibility, whether it is inlined at build time, a description that becomes editor hover documentation, and a Standard Schema validator that runs once at startup so a bad value fails the boot rather than the first request that needs it. Ships dependency-free Standard Schema validators for https origins, bounded integers and Postgres URLs, so env values arrive typed as number or string rather than as raw strings. Covers all four visibility and staticness combinations.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@sveltejs/kit@2.70.1", "@standard-schema/spec@1.0.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sveltekit-explicit-env-vars/env.ts",
        target: "src/env.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "sveltekit-batched-query-refresh",
    title: "SvelteKit Batched Query Refresh",
    description:
      "N+1 elimination and single-flight mutations for SvelteKit remote functions, pinned to @sveltejs/kit 2.70.1. A query.batch collects the calls twenty components make in one macrotask into a single server invocation that returns a lookup callback, so ordering and duplicate arguments are handled for you. A remote form then publishes a record and calls requested(query, limit).refreshAll(), sending refreshed values back on the mutation response instead of paying a second round trip, and because the query is batched those refreshes collapse into one call. A command shows the manual alternative, iterating { arg, query } entries and using set() to write straight into the client cache with no refetch. Comments pin the 2.58.0 requested() reshape and the 2.61.0 removal of query.run().",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@sveltejs/kit@2.70.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/sveltekit-batched-query-refresh/component-stats.remote.ts",
        target: "src/lib/component-stats.remote.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "prisma-driver-adapter-runtime",
    title: "Prisma Driver Adapter Runtime",
    description:
      "The two-runtime client setup Prisma ORM 7 forces once the Rust query engine is gone and every database needs an explicit driver adapter. Its reason to exist is the upgrade guide's warning that adapters now inherit the underlying Node driver's pool defaults, which may differ significantly from v6: pg ships no connection timeout at all (0) where v6 used 5 seconds, so pool exhaustion stops surfacing as a database error and starts presenting as a hung service. The Node client pins max, connectionTimeoutMillis, idleTimeoutMillis, maxLifetimeSeconds and allowExitOnIdle explicitly, attaches the onPoolError and onConnectionError handlers that keep an idle-client error from taking the process down, and survives hot reload on globalThis so watch mode cannot leak a pool per save. The edge client uses PrismaPostgresAdapter over the Prisma Postgres serverless driver, where a single connectionString is the whole surface and there is no pool to inherit anything from. A prisma.config.ts rounds it out with the dotenv import that v7 no longer does for you and the direct, unpooled migration URL that replaces the removed directUrl.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: [
      "prisma@7.8.0",
      "@prisma/client@7.8.0",
      "@prisma/adapter-pg@7.8.0",
      "@prisma/adapter-ppg@7.8.0",
      "@prisma/ppg@1.0.1",
      "pg@8.22.0",
      "dotenv@17.4.2",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/prisma-driver-adapter-runtime/prisma.config.ts",
        target: "prisma.config.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/prisma-driver-adapter-runtime/client.ts",
        target: "src/db/client.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/prisma-driver-adapter-runtime/edge-client.ts",
        target: "src/db/edge-client.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "prisma-client-extension-audit",
    title: "Prisma Client Extension Audit Trail",
    description:
      "A soft delete and audit trail extension for Prisma 7, which removed the $use client middleware API in 7.0.0 and left client extensions as the only interception point. It splits the work across two components because neither can do both jobs: query.$allModels.$allOperations injects deletedAt: null into the filtered read operations and records writes to an audit sink, while model.$allModels rewrites delete and deleteMany into an update through Prisma.getExtensionContext(this), preserving the row and count return shapes. The actor is bound per request rather than globally, since $extends returns a new proxy client instead of mutating the receiver, so a module-scoped extended client would attribute every write in the process to whoever was in scope at import time. Audit rows are written through the unextended base client, which removes the recursion class of bug rather than policing it with a model name guard. The caveats that actually bite migrators are documented inline: query extensions never fire for nested reads or writes, so a nested create is invisible and an include of a soft-delete model is unfiltered, and $connect is not guaranteed to exist on an extended client.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["prisma@7.8.0", "@prisma/client@7.8.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/prisma-client-extension-audit/soft-delete-audit.ts",
        target: "src/db/soft-delete-audit.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/prisma-client-extension-audit/request-client.ts",
        target: "src/db/request-client.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "drizzle-cache-tag-invalidation",
    title: "Drizzle Cache Tag Invalidation",
    description:
      "A cached Postgres read layer on drizzle-orm 1.0 rc.4 built around the opt-in query cache and the upstashCache provider from drizzle-orm/cache/upstash. It keeps the default global: false so the cache strategy stays explicit and every cached read is visible at its call site, uses .$withCache tags for the reads that a raw SQL write has to reach by name, reserves autoInvalidate: false for one aggregate that trades bounded staleness for a stable hit rate, and pairs db.$cache.invalidate by tag and by table with the writes the ORM cannot see. Most of the file confronts the eligibility list directly: raw SQL fails open and leaves stale entries, relational queries have no $withCache method at all so a hot read must be rewritten as an explicit join select, and a cached view read is indexed under zero tables so no write will ever drop it.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: [
      "drizzle-orm@1.0.0-rc.4",
      "@upstash/redis@1.38.0",
      "pg@8.22.0",
    ],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/drizzle-cache-tag-invalidation/cache.ts",
        target: "src/db/cache.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/drizzle-cache-tag-invalidation/cached-queries.ts",
        target: "src/db/cached-queries.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "neon-http-composable-sql",
    title: "Neon HTTP Composable SQL",
    description:
      "A query module for edge handlers built on the composable HTTP query path that @neondatabase/serverless shipped in 1.0.0. Compilation to SQL-with-placeholders moved to query time, so a sql fragment is inert until an outer query consumes it and its parameters get renumbered in traversal order; this snippet uses that to turn optional status, search, date, and service filters into fragments folded pairwise into one WHERE clause, replacing the string concatenation or the one-query-per-filter-combination that 0.x forced. It documents the traps the release notes skip: an interpolated array of fragments binds as a single parameter instead of composing, and a parameterized sql.query() result throws a not-composable error, which makes it a whole-query escape hatch rather than a fragment. The client pins down what one-shot HTTP cannot do, covering non-interactive sql.transaction, no surviving session state, and the WebSocket Pool path for anything needing BEGIN, and explains why sql(...) with parentheses now throws so a 0.x migration knows what broke.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@neondatabase/serverless@1.1.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/neon-http-composable-sql/client.ts",
        target: "src/db/neon/client.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/neon-http-composable-sql/queries.ts",
        target: "src/db/neon/queries.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "pg-advisory-lock-keyset-scan",
    title: "Postgres Advisory Lock and Keyset Scan",
    description:
      "Two plain-Postgres patterns on the node-postgres driver with no ORM and no lock table. Job locks are transaction-level only, because the manual states that session-level locks survive a rolled-back transaction and need matched unlock pairs, so a worker that dies mid-job strands a lock on a pooled connection; pg_advisory_xact_lock releases on COMMIT, ROLLBACK, and a dropped socket alike, and pg_try_advisory_xact_lock gives a cron worker the skip signal instead of a queue. String keys hash through SHA-256 into the full signed int64 space, and the manual's own LIMIT footgun is documented in place so nobody reintroduces a locking function in the target list of a paginated query. The scan half replaces OFFSET with the seek method, using the row-value predicate that Postgres can turn into an index access predicate rather than the OR expansion that it cannot. Cursors are opaque base64url tuples validated on decode against length, charset, arity, field types, timestamp parseability, and UUID shape, since a cursor arrives off a query string and is a trust boundary.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["pg@8.22.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/pg-advisory-lock-keyset-scan/advisory-lock.ts",
        target: "src/db/advisory-lock.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/pg-advisory-lock-keyset-scan/keyset-page.ts",
        target: "src/db/keyset-page.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "indexeddb-sync-outbox",
    title: "IndexedDB Sync Outbox",
    description:
      "A durable client-side write outbox on IndexedDB, built on idb 8.0.3, that survives reload and drains to a server API. Reads are paged with getAllFromIndex over an exclusive-lower-bound IDBKeyRange rather than stepping a cursor, the mistake Nolan Lawson measured at 1194.2ms versus 702.8ms for 50,000 records in Chrome and 11ms versus 1ms for 100 records in Safari. The drain loop is split across two transactions because an IndexedDB transaction auto-commits the moment it yields to the event loop, so it reads a batch, lets that transaction close, POSTs, then opens a fresh readwrite transaction to delete or mark-failed. Retries are counted per record with a dead-letter status, transport failures stop the loop instead of burning attempts on every record behind them, and 4xx responses are treated as permanent. Delivery is at-least-once by construction, so every record carries an Idempotency-Key the server dedupes on.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["idb@8.0.3"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/indexeddb-sync-outbox/outbox-db.ts",
        target: "src/sync-outbox/outbox-db.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/indexeddb-sync-outbox/drain.ts",
        target: "src/sync-outbox/drain.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "d1-session-read-replica",
    title: "D1 Session Read Replica",
    description:
      "Cloudflare D1 read replication done so the write-then-redirect-then-read flow stays correct. Sequential consistency is scoped to one D1DatabaseSession, which dies with the Worker invocation, so a POST that INSERTs and answers 303 hands the follow-up GET a fresh unconstrained session that can read a replica behind the write. This carries session.getBookmark() across the redirect in a Set-Cookie, since a browser drops the redirect's custom headers and replays only cookies. Includes the constraint policy per route type (first-primary on writes to protect the read half of a read-modify-write, the incoming bookmark on the owner's dashboard, an explicit anonymous opt-out on the public cached feed), a commit that no-ops on a null bookmark and still fires on the 429 path, rejection of client-supplied constraint literals in the bookmark slot, and D1Meta served_by_primary logging.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/d1-session-read-replica/session.ts",
        target: "src/notes/session.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/d1-session-read-replica/worker.ts",
        target: "src/notes/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "durable-object-websocket-hibernation",
    title: "Durable Object WebSocket Hibernation",
    description:
      'A chat room Durable Object that holds open WebSockets without being pinned to memory, using ctx.acceptWebSocket() instead of ws.accept() so the runtime owns the sockets and the object can be evicted while every connection stays open. Built around the constraint that eviction erases all instance state: per-connection identity and subscriptions live in ws.serializeAttachment() under the 16,384 byte limit, never in a Map on the class, and the connection set is recovered from ctx.getWebSockets() on the first call after a wake. Covers tag-scoped fan out via acceptWebSocket(ws, tags) and getWebSockets(tag), the webSocketMessage, webSocketClose, and webSocketError class handlers that replace addEventListener, and a broadcast path that is correct on a cold instance. Heartbeats go through ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong")), which answers without waking the object, and getWebSocketAutoResponseTimestamp() reaps stale connections off that signal for free.',
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/durable-object-websocket-hibernation/room.ts",
        target: "src/chat/room.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/durable-object-websocket-hibernation/worker.ts",
        target: "src/chat/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "vercel-queue-consumer-groups",
    title: "Vercel Queue Consumer Groups",
    description:
      "A @vercel/queue producer and consumer built around the fact that Vercel Queues inverts the publish/consume race: the docs state the publish acknowledgment and consumer notification happen simultaneously, so a consumer may begin processing a message before send() returns and the near-universal send-then-write idiom is a guaranteed intermittent 404. The producer commits first, then publishes with an idempotencyKey and a deliberately short retentionSeconds, and documents the hazard at the exact line where it bites. The consumer is one handler in one consumer group, because multiple route files on the same topic create separate groups that each receive a copy of every message, which is fan-out dressed up as scaling. Since there is no dead-letter queue, it implements a real poison-message policy: permanent versus transient classification, a deliveryCount cap, and acknowledge-with-record inside the handler where the write can be awaited. Also covers deployment-ID topic partitioning, the 300s SDK versus 60s raw API visibility timeout split, and the absence of FIFO ordering.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@vercel/queue@0.4.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/vercel-queue-consumer-groups/producer.ts",
        target: "src/queue/producer.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/vercel-queue-consumer-groups/consumer.ts",
        target: "src/queue/consumer.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "fluid-compute-instance-safety",
    title: "Fluid Compute Instance Safety",
    description:
      "Fluid compute lets multiple invocations share the same physical instance concurrently, which turns any module-scope mutable request state into a cross-user data leak rather than the merely wasteful pattern it was on classic serverless, and it does so silently on projects that never opted in because Fluid has been default-on for new projects since April 23 2025. The request-context file shows the broken shape, a module-level current user clobbered by a neighbouring request across an await, explains why it passes every local test and every preview deployment, and replaces it with an AsyncLocalStorage store plus a tenant accessor that throws instead of quietly querying unscoped. The lifecycle file draws the background-work boundary that waitUntil does not draw for you: promises passed to it share the function's timeout and are cancelled if the function times out, so webhooks, audit rows, and billing meters silently vanish after a 200 and belong in a durable queue instead. It also wires attachDatabasePool, which exists because Fluid suspends instances and keeps the instance alive long enough for idle clients to be evicted, and documents the uncaught-exception change where the platform now drains in-flight requests before stopping the process.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@vercel/functions@3.7.5", "pg@8.22.0"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/fluid-compute-instance-safety/request-context.ts",
        target: "src/lib/request-context.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/fluid-compute-instance-safety/lifecycle.ts",
        target: "src/lib/lifecycle.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "durable-object-sql-tenant-db",
    title: "Durable Object SQL Tenant Database",
    description:
      "One SQLite database per tenant, living inside the Durable Object that serves that tenant, so the compute sits on top of the storage instead of a connection away from it. Serverless could only express this as a WHERE clause on one shared database, where every read pays a round trip and isolation is a code review promise; here a query is a synchronous call into storage that is physically part of the object, joins and aggregates cost microseconds, and there is no pool, no connection ceiling, and no way for one tenant's query to reach another's rows. The tenant file runs its migrations inside blockConcurrencyWhile, which is the only place that holds every inbound event including alarms and RPC, wraps each migration and its version row in transactionSync, and documents the cursor rule that bites everyone once: sql.exec returns a lazy cursor that the next exec invalidates, so toArray comes before the next query and raw() streams an export without materializing the table. It states the platform limits in place rather than in a runbook: 10 GB per object, 100 columns per table, 2 MB per row, 100 KB per statement, 100 bound parameters. The recovery file is the operation a shared Postgres cannot perform at all, restoring a single tenant to a point in time with getBookmarkForTime and onNextSessionRestoreBookmark, including the part everyone misses, that arming a restore does nothing until the object restarts and ctx.abort is what causes that, and the undo bookmark that has to be captured and stored outside the object before the rollback runs.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/durable-object-sql-tenant-db/tenant.ts",
        target: "src/tenant/tenant.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/durable-object-sql-tenant-db/recovery.ts",
        target: "src/tenant/recovery.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "worker-rpc-promise-pipelining",
    title: "Worker RPC Promise Pipelining",
    description:
      "A service that exposes objects rather than endpoints, built on Workers RPC, where a call between two Workers is not an HTTP request and therefore does not pay for JSON, a socket, or a round trip. That tax is why service APIs drift coarse: nobody ships getCart then cart.items then item.product across a network, so someone writes getCartWithItemsAndProducts and six months later there are four near-identical aggregate endpoints. The catalog file returns live objects instead, classes extending RpcTarget that the caller receives as stubs backed by state still resident on the service side, including a session that resolves locale and currency once and a cart reachable through it, plus a Map return value that structured clone carries intact and a disposer that runs when the caller releases the stub. It documents the two rules the runtime enforces quietly: only prototype methods are exposed, so a class property arrow function deploys fine and then fails at every call site, and a stub is scoped to the I/O context that created it and cannot be cached across requests. The gateway file is the calling half, where `using` ties stub disposal to the block rather than to the end of the request, and where pipelining is spelled out against the two versions that look identical and cost twice and four times as much, because invoking a method on an unawaited promise sends both hops together and makes the fine-grained API the cheap one.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/worker-rpc-promise-pipelining/catalog-service.ts",
        target: "src/catalog/catalog-service.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/worker-rpc-promise-pipelining/gateway.ts",
        target: "src/gateway/gateway.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "durable-object-alarm-scheduler",
    title: "Durable Object Alarm Scheduler",
    description:
      "Per-entity durable timers, where the schedule lives with the thing being scheduled instead of in a table that a cron job sweeps. The serverless answer to send this in 36 hours has been a trigger every minute plus a due-at query, which runs 1,440 times a day whether or not anything is due, floors granularity at a minute, turns its LIMIT into a throughput ceiling under a spike, needs a lock so two overlapping sweeps do not double-send, and concentrates every tenant on one hot row range. An alarm is a timer the platform holds per object, so ten million pending reminders are ten million sleeping objects and zero running queries. The scheduler file is built around the constraint that there is exactly one alarm per object and setAlarm overwrites rather than enqueues: tasks live in the object's own SQLite table, every mutation routes through a single sync step that re-points the alarm at the earliest due row and deletes it when the queue empties, because a stale alarm bills a wake on every entity that ever had a task. The handler drains everything due rather than one row, counts the attempt before running it so a poison task gives up deliberately instead of exhausting the platform's retry budget and disappearing, uses alarmInfo.retryCount to reschedule rather than burn the last retry, anchors recurrence to now so a late wake does not fire every occurrence it slept through, and treats the caller-supplied task id as the idempotency key because a retry re-runs the side effect. The worker file makes the naming decision explicit, since getByName is the address and the grain chosen there is the one thing nothing downstream can fix, and it deliberately ships no cron trigger.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/durable-object-alarm-scheduler/scheduler.ts",
        target: "src/scheduler/scheduler.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/durable-object-alarm-scheduler/worker.ts",
        target: "src/scheduler/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "fluid-stream-lifecycle",
    title: "Fluid Stream Lifecycle",
    description:
      "A long-lived server-sent events endpoint on Vercel Fluid compute, written around the two things Fluid changes: how long a function may stay open, and who else is sharing the instance while it does. On classic serverless one invocation owned one instance and was billed for every wall-clock second, which priced streaming out of existence and made polling the standard advice; Fluid serves concurrent invocations from one instance and weights billing towards active CPU, so a handler that spends nine of its ten minutes awaiting an upstream token is no longer being charged as if it were alone. The route file is mostly lifecycle because that is where the new failure modes are: request.signal is threaded into the upstream fetch so a closed tab cancels the model request instead of streaming tokens nobody will read, an aborted stream is not logged as an error since otherwise the dashboard shows a large error rate that is entirely users closing tabs, the partial transcript is persisted from finally through waitUntil with a note that waitUntil shares the function timeout and is for cleanup rather than work that must not be lost, and the reader lock is released so the abort actually tears the socket down. The stream file holds the plumbing with the sharp edges: controller.enqueue accepts everything and buffers in memory regardless of whether the client is reading, which on a shared instance means filling memory for a client in a tunnel, so writes await desiredSize and give up on a deadline; close is guarded because the runtime may already have closed the stream after a disconnect and the throw would mask the real error; and the heartbeat returns its own stop function because an interval that outlives its stream now keeps a real invocation alive.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-20",
    type: "registry:lib",
    dependencies: ["@vercel/functions@3.7.5"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/fluid-stream-lifecycle/route.ts",
        target: "src/app/api/chat/route.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/fluid-stream-lifecycle/stream.ts",
        target: "src/app/api/chat/stream.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "artifacts-repo-provisioner",
    title: "Artifacts Repo Provisioner",
    description:
      "The control plane for Cloudflare Artifacts, the versioned filesystem that speaks Git and is meant to have repos created programmatically at fleet scale, written around the fact that the documented advice (if you have 10,000 agents, create 10,000 repos) is correct and is also an invoice. The provisioner file starts where nothing downstream can recover from a mistake: the name, which is the address, is unique per namespace, and cannot be renamed, so it is computed as fleet-YYYYMMDD-taskId from the task's own createdAt rather than from the clock, which makes the name a pure function of the task and therefore makes retry idempotency free. Creation attempts a fork of a reviewed baseline with defaultBranchOnly set, since a fork that copies every stale branch multiplies storage across every task, and reads the ALREADY_EXISTS error as evidence that an earlier attempt won rather than as a failure, adopting that repo instead of inventing a second name. The reuse path mints a fresh short-lived write token because create, import, and fork return the initial token exactly once and nothing serves it again, and it tolerates IMPORT_IN_PROGRESS and FORK_IN_PROGRESS while polling, since a repo that exists but is not ready throws from get() and looks identical to a repo that is missing. Token rotation mints before revoking so a running agent never has a window with no credential, revokes by plaintext so it never has to reconcile against a token list, and clamps TTL above the 60 second floor. Reaping splits the two questions it is actually asking: age comes from the server-side createdAt that list() returns, because a timestamp baked into a name is supplied by whoever created the repo and is not evidence of anything, while the name prefix is what proves ownership, since delete() takes a bare name and a sweep filtering on age alone would reap the reviewed baseline that every task repo forks from. The sweep also skips repos pushed to recently, counts delete()'s boolean rather than its attempts, caps deletions to stay under the 2,000 requests per 10 seconds namespace limit, and defaults to dry run. A cost estimator prices operations at $0.15 per 1,000 past the 10,000 monthly allowance and storage at $0.50 per GB-month past the first, prorated by retention, because storage is billed on daily peak and a repo reaped on day 14 bills for half a month rather than nothing.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/artifacts-repo-provisioner/provisioner.ts",
        target: "src/provisioner/provisioner.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/artifacts-repo-provisioner/worker.ts",
        target: "src/provisioner/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "artifacts-agent-commit-notes",
    title: "Artifacts Agent Commit Notes",
    description:
      "Agent attribution carried in git-notes on a Cloudflare Artifacts repo, built around the reason the metadata does not go in the commit message: a message is an input to the commit SHA, so writing attribution at commit time means recording it before review has happened and before any eval score exists, and adding it later means rewriting history and invalidating every downstream reference. A note is a separate object pointing at a commit, mutable, attachable hours after the fact, replaceable when the reviewer signs off, and it never changes the SHA of the thing it describes. The cost is the two facts the three files are organised around. Notes live on their own refs under refs/notes, which are in neither the default fetch refspec nor the default push refspec, so a clone that does not ask for them gets complete history and zero provenance with no error and no empty directory to hint that anything was skipped; the clone helper adds the refspec to the config rather than passing it once, and sets notes.displayRef so fetched notes are actually visible in git log rather than sitting in the object database unreferenced by any command a human runs. And notes are keyed by the SHA they annotate, so a rebase, amend, or squash strands every note on commits that are no longer reachable, which is why the commit path sets notes.rewriteRef (a config with no default value, meaning git copies notes forward for no ref at all until it is set) and why the read path returns 404 rather than an empty 200, since human wrote this and a rebase orphaned the note are indistinguishable from the reader's side. Each agent writes to its own ref because a notes tree cannot hold two entries under one name, so on a shared ref the second agent either fails or discards the first agent's record with add -f, and append concatenates raw bytes into something that parses as neither document. The Worker never commits, because the Artifacts binding is a control plane plus log, readCommit, and readTree with no content write anywhere on it: it authorises the run, mints a fifteen-minute write-scoped repo token, hands back the exact push refspec so no harness has to remember it, and revokes early rather than waiting out the TTL. Credentials go through http.extraHeader rather than the basic-auth remote URL form, which would write the secret into .git/config where git remote -v prints it into CI logs. Reading a note back handles the notes-tree fanout, which git rebalances from flat to two-level to three-level as the count grows, so the path that worked at fifty commits stops working at fifty thousand.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/artifacts-agent-commit-notes/attribution.ts",
        target: "src/provenance/attribution.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/artifacts-agent-commit-notes/commit-run.ts",
        target: "src/provenance/commit-run.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/artifacts-agent-commit-notes/worker.ts",
        target: "src/provenance/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "artifacts-fork-run-workflow",
    title: "Artifacts Fork Run Workflow",
    description:
      "A durable Cloudflare Workflow that gives every agent run its own disposable fork of a reviewed Artifacts baseline, then gates the merge back. The baseline is created readOnly so no agent token can push to it, and each run forks it with defaultBranchOnly so the copy carries the tip instead of every branch and tag it will never read. The fork name is derived from the Workflow instanceId and event.timestamp, never Date.now(), which is what makes the fork step idempotent: a retry recomputes the same name, collides with ALREADY_EXISTS (10201), and adopts the existing repo rather than creating a second one, while FORK_IN_PROGRESS (10303) is absorbed by a retrying readiness step instead of handing the sandbox a remote that is not clonable yet. Write tokens are minted per run with a two hour TTL and sensitive step output, the agent is dispatched with an ArtifactFS blobless mount so file contents hydrate on read, and promotion into the baseline happens only after a merge-decision event from a human or a policy engine, since the binding has no merge call. The review step is deliberately thin about what it can prove, because the binding is a control plane with no log, readCommit, or readTree on it: what it checks is lastPushAt, the one server-side fact the sandbox cannot forge in its completion event, and anything richer is a git clone by whatever renders the review. Teardown runs in a finally block and again in a cron sweeper that decides on createdAt and guards on the run-name prefix, because terminate() skips the finally and Artifacts bills storage at $0.50 per GB-month until a repo is explicitly deleted.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/artifacts-fork-run-workflow/run-workflow.ts",
        target: "src/agent-run-forks/run-workflow.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/artifacts-fork-run-workflow/worker.ts",
        target: "src/agent-run-forks/worker.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-cluster-entity-sharding",
    title: "Effect Cluster Entity Sharding",
    description:
      "A per-account ledger built as an Effect 4 cluster entity, where the single-writer guarantee is the shape of the runtime rather than a lock the handler has to remember to take. The contention case this replaces is money moving between accounts: two withdrawals that interleave either double-spend or need a SELECT FOR UPDATE, an advisory lock, or a serializable retry, each of which makes the account row a point every worker fights over and rests correctness on nobody forgetting the guard. An entity is addressed by a string id, and the cluster runs exactly one copy of a given id at a time, so messages to that account land in one mailbox and are processed one at a time; ten million accounts are ten million addresses spread across the runners, and one account's balance is only ever touched by the one fiber draining its mailbox, which is why the in-memory balance needs no lock. Deposit and Withdraw are annotated Persisted so the cluster writes them to MessageStorage before acknowledging, which is what makes at-least-once redelivery real and therefore why every handler is idempotent against the payload requestId: a redelivered deposit is recognised and dropped instead of minting money from a retry. GetBalance is left unpersisted because persisting a read would write a storage row per balance check. The concurrency option is pinned to one, the single-writer guarantee stated as a number, and maxIdleTime evicts a silent entity to free memory with the next message rehydrating it, which is why durable balance must come from storage rather than the map idle eviction discards. The runtime file assembles a real single-node Sharding stack from ShardingConfig, MessageStorage, Runners, RunnerStorage, and RunnerHealth, and scaling out to real runners is a change to that file alone, since the entity never knew how many runners existed. Verified against effect@4.0.0-beta.98, much of the cluster layer being Tim Smart's work.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-cluster-entity-sharding/ledger-entity.ts",
        target: "src/ledger/ledger-entity.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-cluster-entity-sharding/ledger-runtime.ts",
        target: "src/ledger/ledger-runtime.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-durable-activity-workflow",
    title: "Effect Durable Activity Workflow",
    description:
      "A subscription dunning sequence as a durable Effect 4 workflow: retry a failed payment on a schedule, wait real days between attempts, and cancel if every attempt fails, all surviving a deploy in the middle. The flow reads top to bottom like an ordinary function, but every Activity in it is journaled, so when the process dies and the workflow replays, a completed Activity is not run again; its recorded result is handed back and execution fast-forwards to the first Activity that never finished. A DurableClock.sleep of three days does not hold a fiber or a machine open, the workflow suspends and a timer wakes it, so the deploy that ships on day two interrupts nothing because on day two nothing is running. The guarantee is that each Activity's result is recorded once, not that its side effect happens exactly once: an Activity that charges a card and dies before the journal write runs again on replay, which is why the charge sends a provider-side idempotency key derived from the invoice and attempt rather than a fresh id each call. The control flow between Activities re-executes on every replay and so must be deterministic, which is why non-determinism (reading the clock, the attempt count) lives inside an Activity where its result is journaled, and a bare Date.now in the body would take a different branch on replay and desync the journal. The workflow's idempotency key is the invoice id, so a retried webhook or redelivered queue message joins the run the first delivery started instead of dunning the customer twice, and a hard decline short-circuits the schedule rather than paying for attempts that cannot succeed. The runtime file backs it with the in-memory WorkflowEngine and swaps to the cluster engine for cross-machine durability without touching the body. Verified against effect@4.0.0-beta.98, the engine largely Tim Smart's work.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-durable-activity-workflow/dunning-workflow.ts",
        target: "src/dunning/dunning-workflow.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-durable-activity-workflow/dunning-runtime.ts",
        target: "src/dunning/dunning-runtime.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-rpc-contract-transport",
    title: "Effect RPC Contract Transport",
    description:
      "An internal job-control API defined once as an Effect 4 RpcGroup that the server and the client both import, with the transport left swappable. The problem it replaces is the usual internal service: route handlers on one side, a hand-written fetch wrapper on the other, and a types package in the middle that drifts until a field is undefined in production and was a string in the caller's head. Here one file is the contract: each Rpc.make binds a tag to a payload schema, a success schema, and a typed error schema, so the wire shape has a single author and there is no second definition to fall out of sync. Enforcement is two layers and both hold: the handler and client types are derived from the group, so a handler that returns the wrong shape or a call with the wrong payload does not compile, and the schema validates the same shapes at the boundary at runtime as an independent guard, rejecting a request that does not decode before a handler runs and encoding the reply through the success schema on the way out. Declared errors cross the wire as tagged failures: JobNotFound is a TaggedErrorClass, so it travels with its _tag intact and the client matches it with catchTag by name at runtime, while a defect that is not in the schema stays a defect and pages someone rather than arriving as a typed error. The transport is deliberately unnamed in the contract, because HTTP with ndjson, WebSocket, and a Worker MessagePort are the same contract with a different protocol layer chosen in the service file, and the handlers do not move when it changes. Auth is RPC middleware that runs before every handler and provides the authenticated operator, so a handler reads who is calling without re-checking a token. Verified against effect@4.0.0-beta.98, the RPC layer largely Tim Smart's work.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-rpc-contract-transport/job-control-contract.ts",
        target: "src/job-control/job-control-contract.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-rpc-contract-transport/job-control-service.ts",
        target: "src/job-control/job-control-service.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-httpapi-derived-client",
    title: "Effect HttpApi Derived Client",
    description:
      "A content-publishing HTTP API declared once as an Effect 4 HttpApi, so the server, the client, and the OpenAPI document all come from a single source. The problem it replaces is the usual REST service with three artefacts that are supposed to agree and do not: the server routes, a client SDK, and an OpenAPI file that a generator produces from annotations nobody keeps current, the doc being the first to rot because nothing breaks when it is wrong. Here one declaration lists groups of endpoints, each naming its method, path, path params, query, payload, success, and errors as schemas, and from that one value three things are derived: the server implements handlers against it, a client is produced from it with no codegen step, and OpenApi.fromApi turns it into an OpenAPI document, so the doc cannot describe a route the API does not declare and the client cannot call a path the server does not expose. Everything crossing the boundary is validated by its schema at runtime before a handler runs and encoded on the way out, so a params.id declared Schema.Int arrives at the handler as a number because the URL string was decoded and a non-integer was rejected with a 400 first. Status codes live on the error schema rather than the route, so the AlreadyPublished error is mapped to a conflict wherever it is raised, and the prebuilt HttpApiError.NotFound and Forbidden carry their statuses already. Enforcement is two layers: the handler and client types are derived from the declaration, so a handler that returns the wrong shape or a call with the wrong params does not compile, and the schema validates the same shapes at runtime as an independent guard, which is why the handler reads its decoded request under the params and query keys the framework passes. The server file wires HttpApiBuilder.layer with the OpenAPI document mounted as a route, and the derived client calls endpoints by group and name from the same declaration. Verified against effect@4.0.0-beta.98, the HttpApi layer largely Tim Smart's work.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-httpapi-derived-client/publishing-api.ts",
        target: "src/publishing/publishing-api.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-httpapi-derived-client/publishing-server.ts",
        target: "src/publishing/publishing-server.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-sql-transactional-repository",
    title: "Effect SQL Transactional Repository",
    description:
      "A double-entry ledger repository on Effect 4's SQL layer, where the transaction boundary is a scope rather than a callback convention and a row is untrusted input until a schema decodes it. The usual repository gets two things wrong. Its transaction is db.transaction(async (tx) => ...), whose correctness rests on every query inside remembering to use tx rather than the pooled db, and a single missed one runs outside the transaction, commits on its own, and is not rolled back when the block throws. Here the boundary is sql.withTransaction wrapping an Effect: every query run inside is on the transaction's connection because the SqlClient service carries it, there is no second handle to forget, a failure anywhere in the wrapped Effect rolls the whole thing back because the rollback is tied to the Effect failing, and a nested withTransaction becomes a savepoint rather than a second physical transaction. The other mistake is treating a row as the type it was cast to: db.query(...) as Account[] is a lie the compiler believes, since the database can return a null in a non-null column or a shape a migration changed last week, and the cast waves it through to blow up three functions later. SqlSchema.findOne and findAll decode each row through a schema, so a row that does not match fails at the boundary with a typed SchemaError naming the column rather than becoming an undefined that surfaces far away, and because the decode runs inside the transaction a corrupt read aborts the write beside it. The transfer reads the source account FOR UPDATE, checks the balance, writes both balance updates and both postings, and commits or rolls back as one unit, with InsufficientFunds and AccountNotFound as tagged errors. The SqlClient is a service the repository depends on and never constructs, so the same code runs against Postgres in production and a test double, swapped by the driver layer at the edge. Context.Service infers the repository's shape from its make effect, so a caller gets its methods typed and the transfer's declared errors in the error channel, with the schema decode as the runtime guard on top. Verified against effect@4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-sql-transactional-repository/account-repository.ts",
        target: "src/ledger/account-repository.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-sql-transactional-repository/account-runtime.ts",
        target: "src/ledger/account-runtime.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-service-lifecycle-runtime",
    title: "Effect Service Lifecycle Runtime",
    description:
      "The service, layer, scope, and fiber foundations a long-lived Effect 4 server sits on, built so it shuts down without leaking. Three facts drive it. A resource is acquired and released as a pair by the runtime, not by a finally you maintain: Effect.acquireRelease binds a release to an acquire and the release runs when the enclosing scope closes, whether that is a clean shutdown or an interruption partway through startup, so the connection pool here is drained on SIGTERM without anyone writing the teardown path that is always wrong because it is never tested. A layer is memoized, so a service built once is built once: in v4 the memo map is shared across Effect.provide calls, so two services depending on the pool share one pool rather than opening two against a database sized for one, a doubled connection count the dashboard does not show, and a release path that closes one pool while the other keeps serving. A service is a declared dependency, not a global reached for, so a test provides a different pool by providing a different layer and nothing in the consumer changes. The runtime file supervises background workers in a FiberSet: every worker is run into the set, the set lives in a scope, and when the scope closes every fiber is interrupted, so nothing leaks because membership is the mechanism rather than a list someone maintains. Shutdown is not process.exit: SIGTERM interrupts the root fiber, interruption closes the scope, closing the scope interrupts the workers and runs the acquireRelease finalizers, and the pool closes after the workers that use it stop because that is how scope finalizers compose in reverse. It also notes the v4 fork renames, Effect.fork to forkChild and forkDaemon to forkDetach, that a server built on v3 habits gets wrong. Verified against effect@4.0.0-beta.98, with Layer, Fiber, and FiberSet largely Tim Smart's work.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-21",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-service-lifecycle-runtime/server-services.ts",
        target: "src/server/server-services.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/effect-service-lifecycle-runtime/server-runtime.ts",
        target: "src/server/server-runtime.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "bun-secrets-vault",
    title: "Bun Secrets Vault",
    description:
      "A config loader that keeps secrets out of git by storing them in the OS credential store through Bun.secrets: macOS Keychain, Linux libsecret, or Windows Credential Manager, encrypted at rest and scoped to the logged-in user. Because Bun.secrets has no native list, the vault maintains its own key index as one extra secret so set, get, list, and rm behave the way a CLI user expects, with a process.env fallback for CI. Ships a small CLI plus a run subcommand that injects every stored secret into a spawned child process env through Bun.spawn, and a loadConfig(keys) library export for application code. Zero npm dependencies: Bun.secrets, Bun.spawn, and process.env cover the whole surface.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/bun-secrets-vault/vault.ts",
        target: "src/vault/vault.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "bun-sqlite-job-queue",
    title: "Bun SQLite Job Queue",
    description:
      "A durable background job queue with BullMQ semantics and no Redis, built on bun:sqlite and the Bun Worker global. Jobs are claimed race-free across threads with a single UPDATE ... RETURNING, so two workers never take the same row; a visibility timeout makes a crashed worker's in-flight job claimable again instead of lost; failures retry with exponential backoff and land in a dead_letters table after a max-attempts budget. The consumer pool is the same file re-imported as a worker through Bun.isMainThread, and WAL mode with a busy_timeout lets N threads share one .db safely. Zero npm dependencies: storage and the pool both ship inside Bun.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/bun-sqlite-job-queue/queue.ts",
        target: "src/queue/queue.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "bun-auth-gateway",
    title: "Bun Auth Gateway",
    description:
      "A session-auth gateway assembled entirely from Bun runtime primitives, no auth library and no Redis. Bun.serve routes carry the HTTP surface, req.cookies (Bun.CookieMap) manages sessions with automatic Set-Cookie, Bun.CSRF issues and verifies tokens bound to the session id, and Bun.password (argon2id) hashes credentials with a dummy-hash verify on unknown users so signin timing does not leak which emails exist. A sliding-window rate limiter and a request log live in bun:sqlite. Routes cover signup, login, logout, a session-scoped me, csrf issuance, a CSRF-protected mutation, and an admin log view. Notes the real quirk that Bun.CSRF.verify throws on an empty token rather than returning false, wrapped so any throw reads as invalid.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/bun-auth-gateway/gateway.ts",
        target: "src/gateway/gateway.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "deno-kv-leader-election",
    title: "Deno KV Leader Election",
    description:
      "Distributed mutual exclusion and leader election across processes, isolates, and Deploy regions on Deno KV alone. withLock(kv, name, fn) is a distributed compare-and-swap through kv.atomic().check(versionstamp).set() with an expireIn lease so a dead holder cannot wedge the lock, and kv.watch() turns poll-until-free into notify-on-release for instant handoff. onLeader(kv, name, cb) runs an election loop that renews at half the TTL and aborts an AbortSignal the moment leadership is lost. Because KV expiry marks the earliest deletion, not the exact moment, each lease also stores its own expiresAt in the value and waiters validate it, so failover latency stays bounded by the TTL even when the expiry sweep lags. Zero dependencies.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/deno-kv-leader-election/lock.ts",
        target: "src/lock/lock.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "deno-kv-rate-limit",
    title: "Deno KV Rate Limit",
    description:
      "A sliding-window rate limiter middleware for Deno.serve backed by Deno KV, so the limit holds across isolates and regions on Deploy rather than in one process memory. rateLimit({ limit, windowMs })(handler) wraps a handler and enforces a per-client window using the two-bucket weighted approximation, where each increment is kv.atomic().mutate({ type: sum, expireIn }) so the counter buckets self-garbage-collect on their own TTL with no sweeper. Emits the IETF draft RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, and RateLimit-Policy headers plus Retry-After on a 429. Zero dependencies.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/deno-kv-rate-limit/ratelimit.ts",
        target: "src/ratelimit/ratelimit.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "deno-kv-realtime-sync",
    title: "Deno KV Realtime Sync",
    description:
      "Multiplayer state sync over plain HTTP with no WebSocket infrastructure. Every table is one KV document: clients subscribe with GET /table/:name, whose SSE body is literally kv.watch().pipeThrough(TransformStream).pipeThrough(TextEncoderStream), so a client disconnect cancels the watch through stream teardown with no bookkeeping. Mutations POST the versionstamp the client last saw, and the write runs through kv.atomic().check() so concurrent editors get clean optimistic-concurrency conflicts (409 with the current state to rebase on) instead of silent lost updates, and every subscriber sees each committed change pushed live. Zero dependencies.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/deno-kv-realtime-sync/sync.ts",
        target: "src/sync/sync.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "node-permission-sandbox",
    title: "Node Permission Sandbox",
    description:
      "A plugin runner that executes untrusted code in a child Node process under the permission model, so a plugin can read only a whitelisted data directory plus its own file and gets ERR_ACCESS_DENIED on any fs write, out-of-scope read, child process spawn, or worker thread. The child receives a clean env with no parent secrets, a JSON input payload, and a wall-clock timeout that ends in SIGKILL, and reports results over a structured stdout line protocol parsed back into a typed allowed, blocked, or killed outcome. Documents the load-bearing gotcha that allowlist paths must be realpath resolved, since on macOS the /tmp to /private/tmp symlink otherwise denies everything, and the honest ceiling that the network scope needs Node 24 (the runner detects the flag). Zero dependencies.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/node-permission-sandbox/sandbox.ts",
        target: "src/sandbox/sandbox.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "node-diagnostics-telemetry",
    title: "Node Diagnostics Telemetry",
    description:
      "Zero-instrumentation HTTP observability with no APM vendor and no logging code in the handlers at all. Everything is observed from outside through the diagnostics channels Node core already publishes: http.server.request.start and response.finish for inbound requests, undici:request:create for outbound fetch, and net.server.socket for connection counts, with request ids from AsyncLocalStorage so an outbound call correlates to the request that made it. Emits JSON logs, per-route latency histograms, and a Prometheus /metrics endpoint. Documents two real behaviors on current Node: bindStore on http.server.request.start does not propagate for server requests so it uses enterWith in a synchronous subscriber, and response.finish can fire outside the request context so it correlates through a WeakMap keyed by the request object. Zero dependencies.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/node-diagnostics-telemetry/telemetry.ts",
        target: "src/telemetry/telemetry.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "node-sqlite-worker-pool",
    title: "Node SQLite Worker Pool",
    description:
      "A durable job queue on node:sqlite feeding a worker_threads pool, where jobs survive process restarts: any row left running by a crash is re-queued on boot. The same file is its own worker through isMainThread, and the main thread claims a job with an atomic UPDATE ... RETURNING only when a worker is idle, so backpressure is structural rather than a buffer that grows without bound. Failures retry with capped exponential backoff plus full jitter, then land in a dead state, and SIGINT drains in-flight jobs before terminating workers and closing the DB. Ships a node:test suite that uses mock timers and a mocked clock to prove the backoff fires at exactly the computed delays and that a failed job stays unclaimable until its window elapses, with no real waiting.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/node-sqlite-worker-pool/workq.ts",
        target: "src/workq/workq.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/node-sqlite-worker-pool/workq.test.ts",
        target: "src/workq/workq.test.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "durable-object-rpc-rate-limit",
    title: "Durable Object RPC Rate Limit",
    description:
      "A globally consistent token bucket rate limiter, one Durable Object per API key, consumed over native RPC rather than fetch: the fronting Worker calls take() and peek() directly on a stub from env.LIMITER.getByName(apiKey), so each key shards to its own strongly consistent bucket worldwide. Bucket state lives in DO SQLite and survives eviction, the schema is initialized inside blockConcurrencyWhile and refilled inside transactionSync, and refill is alarm driven: an alarm is armed only while the bucket is below capacity and goes quiet once full, so an idle key costs nothing. The Worker maps the RPC result to RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, and Retry-After headers. This is the accounting-correct counterpart to the eventually consistent Rate Limiting binding.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: ["@cloudflare/workers-types@5.20260719.1"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/durable-object-rpc-rate-limit/worker.ts",
        target: "src/rate-limiter/worker.ts",
        type: "registry:lib",
      },
      {
        path: "src/registry/durable-object-rpc-rate-limit/wrangler.jsonc",
        target: "wrangler.jsonc",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-cache-stampede-guard",
    title: "Effect Cache Stampede Guard",
    description:
      "A read-through cache that survives a hot-key expiry and a cold-start traffic spike, built on the Effect Cache. When a key is missing, concurrent lookups of that key are coalesced onto a single origin fiber (single-flight), so a thousand simultaneous misses cause exactly one database load instead of a thundering herd. A Semaphore wraps the origin lookup as an admission gate, so even a burst of distinct cold keys can never open more than the permit count of concurrent origin loads and melt the database. Stale entries are served immediately while a detached fiber refreshes them through Cache.refresh, so a slow origin never blocks a reader. Solves cache stampede and thundering herd. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-cache-stampede-guard/stampede.ts",
        target: "src/cache/stampede.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-circuit-breaker-budget",
    title: "Effect Circuit Breaker and Retry Budget",
    description:
      "Resilience primitives that stop a wobbling dependency from becoming a self-inflicted outage. The retry budget is an atomic token bucket over a Ref: traffic funds tokens, each retry spends one, and an empty bucket rewrites the failure into a non-retryable error, so retries can never exceed a fixed percentage of live traffic no matter how many callers are failing at once. Backoff is Schedule.jittered over Schedule.exponential so a synchronized retry wave desynchronizes. The circuit breaker is a Ref state machine (closed, open, half-open) keyed on the Clock that admits exactly one half-open probe before deciding to close or re-open, and a per-dependency Semaphore bulkhead fails fast so one slow dependency cannot exhaust the shared fiber pool. Every call carries an Effect.timeout. Solves retry storms and cascading failures. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-circuit-breaker-budget/resilience.ts",
        target: "src/resilience/resilience.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-shard-router-backpressure",
    title: "Effect Shard Router with Backpressure",
    description:
      "A work router that keeps one viral key or one noisy tenant from drowning a single worker. A consistent-hash ring (FNV-1a with virtual nodes) places cold keys, and any key that crosses a frequency threshold is split by power-of-two-choices: hash two ring positions and dispatch to the shallower shard, so a hot key spreads across several workers instead of pinning one. Each shard is a bounded Queue, so a full queue makes offer block and backpressure propagates to the producer rather than growing an unbounded backlog in memory. Low-priority work goes to a dropping Queue that sheds load under pressure instead of blocking, and a per-shard Metric gauge exposes live depth for autoscaling. Solves hot partitions and queue backlog. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-shard-router-backpressure/shards.ts",
        target: "src/shards/shards.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-fencing-token-hlc",
    title: "Effect Fencing Token and Hybrid Clock",
    description:
      "Two coordination primitives that keep a distributed write correct when leadership and time both misbehave. A lease manager mints strictly increasing fencing tokens through Ref.updateAndGet, and the protected resource remembers the highest token it has accepted and rejects any lower one, so a leader that was presumed dead during a GC pause or partition has its late write refused by the resource itself, not by a race it might win. Causality is carried by a Hybrid Logical Clock built on the Clock service, whose physical component is clamped so it never regresses, so event ordering survives a wall clock that jumps backward across a time sync. The whole thing is tested deterministically with TestClock across a five-minute backward jump. Solves split brain and clock skew. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-fencing-token-hlc/fencing.ts",
        target: "src/fencing/fencing.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-outbox-replicator",
    title: "Effect Outbox Replicator",
    description:
      "A durable replication path plus leak-proof fiber lifecycles. The business record and its outbox entry commit in one atomic Ref.update, closing the dual-write gap where a row is acknowledged to the client but the follow-up publish is lost to a crash. A replicator drains the outbox with a cursor that advances only after a durable apply, giving at-least-once delivery across restarts, and the apply is idempotent on sequence number so the inevitable re-delivery after a crash does not double-apply. Every background worker is forked into a FiberSet owned by a Scope with ensuring finalizers, so no consumer or subscription can be orphaned when its owner shuts down, and a Metric gauge acts as a leak canary that catches a detached fiber that outlived its scope. Solves data loss and memory leaks. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-22",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-outbox-replicator/durability.ts",
        target: "src/outbox/durability.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-idempotency-key-store",
    title: "Effect Idempotency Key Store",
    description:
      "An execution guard that makes retried requests safe: every request carries an idempotency key, and the store makes the key the single author of execution. The in-flight slot is claimed with one atomic Ref.modify, so of two racing duplicates exactly one runs the effect while the other awaits a Deferred the winner completes, and a late retry after completion replays the stored result inside its TTL without re-executing. Failures propagate to every waiting duplicate and release the key, so a declined card can be retried deliberately while a double charge stays impossible. Solves the double charge on retry and the check-then-insert race. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-idempotency-key-store/idempotency.ts",
        target: "src/idempotency/idempotency.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-hedged-request-race",
    title: "Effect Hedged Request Race",
    description:
      "A tail-latency cap built on Effect.raceFirst: run the request, and if it has not answered within the hedge delay (typically the observed p95), fire one backup attempt and take whichever lands first, interrupting the loser so an abandoned attempt never holds a connection. A token-bucket hedge budget funded by completed traffic caps hedges to a fixed fraction of requests, so a systemic slowdown exhausts the budget and degrades to plain single requests instead of doubling load on a backend that is already hurting. Solves p99 stragglers and the hedge storm that doubles traffic during an outage. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-hedged-request-race/hedge.ts",
        target: "src/latency/hedge.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-read-replica-router",
    title: "Effect Read Replica Router",
    description:
      "A read/write router for a primary with asynchronous replicas that keeps read-your-writes true: writes go to the primary and record the session's write LSN, and a read is only served from a replica whose applied LSN has caught up to that mark, otherwise it routes to the primary. Freshness is a comparison of two LSN Refs, not a timer guess, and any replica lagging beyond a configured ceiling is ejected for all sessions until it catches up, so a replica that silently falls minutes behind stops serving stale data to anyone. Solves the vanishing update after a save and unbounded staleness under replication lag. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-read-replica-router/replica.ts",
        target: "src/db/replica.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-heartbeat-failure-detector",
    title: "Effect Heartbeat Failure Detector",
    description:
      "A phi-accrual failure detector instead of a fixed heartbeat timeout: the monitor stamps arrivals with its own Clock, learns each node's inter-arrival rhythm in a sliding window Ref, and reports a suspicion level (phi) that grows with silence relative to what is normal for that node. One congested heartbeat nudges phi and recovers on arrival, while sustained silence crosses the threshold and declares the node dead, so the cluster stops evicting healthy nodes over a single delayed packet. Nothing depends on the sick node self-reporting: a wedged process simply stops producing arrivals. Solves false-positive node kills and detection built on trusting the sender. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-heartbeat-failure-detector/heartbeat.ts",
        target: "src/cluster/heartbeat.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-multipart-upload-resume",
    title: "Effect Multipart Upload with Abort Scope",
    description:
      "A multipart object upload where cleanup is a property of the scope, not a finally the caller must remember: initiate is the acquire, and the release aborts the upload on every exit path (failure, defect, interrupt) unless complete() landed, so a crash mid-transfer can never leave orphaned parts billing invisibly in storage. Parts upload in parallel under bounded concurrency with per-part retry, so one flaky part re-uploads alone, and a resumed session reads the store's acknowledged part list and uploads only the gap. Solves the restart-from-zero upload and the orphaned parts that bill forever. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-multipart-upload-resume/multipart.ts",
        target: "src/storage/multipart.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-exactly-once-consumer",
    title: "Effect Exactly-Once Consumer",
    description:
      "A queue consumer that turns at-least-once delivery into exactly-once effect: it processes first and commits second, so a crash between the two causes redelivery instead of loss, and the dedupe check lives in the same atomic Ref.modify as the side effect, so a redelivered message is recognized, skipped, and committed without a window where it looks unprocessed twice. The demo also plays the wrong ordering (commit-then-process) to show the acknowledged message the broker never redelivers, which is how money disappears silently. Solves the lost message and the double-applied message, the two failure modes on either side of correct commit ordering. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-exactly-once-consumer/consumer.ts",
        target: "src/messaging/consumer.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-webhook-dispatcher",
    title: "Effect Webhook Dispatcher",
    description:
      "Signed, retried, dead-lettered webhook delivery: every payload is signed HMAC-SHA256 over timestamp.body, delivery retries on Schedule.jittered exponential backoff with a per-attempt timeout, and an endpoint that stays down moves the event to a dead-letter queue with its attempt history instead of dropping it. The consumer-side verify uses a constant-time comparison and rejects timestamps outside a tolerance window, so a tampered body and a captured-and-replayed request both fail. Solves the silently dropped event and the forged webhook hitting an endpoint that trusts any JSON. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-webhook-dispatcher/webhook.ts",
        target: "src/webhooks/webhook.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-consistent-hash-ring",
    title: "Effect Consistent Hash Ring",
    description:
      "Ring placement that survives membership churn: keys and nodes hash onto the same 2^32 circle (FNV-1a with an avalanche finisher), a key belongs to the first node clockwise, and each node appears as many virtual nodes so the arcs stay statistically even. Adding a node moves roughly 1/N of the keys (all onto the new node, none between old ones) where hash(key) % N would move nearly all of them, and removing a node reassigns only the leaver's keys. The ring is an immutable sorted array swapped atomically in one Ref, so a lookup never observes a half-applied membership change, and lookup is a binary search. Solves the full reshuffle on scale-out and the lumpy ring hotspot. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-consistent-hash-ring/hashring.ts",
        target: "src/routing/hashring.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-snowflake-id-generator",
    title: "Effect Snowflake ID Generator",
    description:
      "Coordination-free 64-bit ids that refuse to trust the clock: 41 bits of milliseconds since a custom epoch, 10 bits of machine id, 12 bits of sequence, minted locally at up to 4096 ids per millisecond per machine and still roughly time-sorted. The (lastTimestamp, sequence) pair lives in one Ref and every mint is one atomic Ref.modify, so concurrent fibers cannot interleave into a duplicate, an exhausted sequence parks until the next tick, a small clock rollback parks until the clock re-passes the high-water mark, and a rollback beyond tolerance is a typed ClockMovedBackward failure instead of a silent collision. Solves the central sequence bottleneck and duplicate ids on clock rollback. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-snowflake-id-generator/snowflake.ts",
        target: "src/ids/snowflake.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-bulkhead-isolation",
    title: "Effect Bulkhead Isolation",
    description:
      "Watertight compartments per dependency, the ship pattern: each downstream service gets its own Semaphore of permits plus a small bounded waiting room, so a dependency that goes slow saturates its own compartment while every other dependency's calls flow untouched, instead of one sick service absorbing the shared pool and taking checkout down with it. Beyond the waiting room, calls are shed immediately with a typed BulkheadRejected, a fast no the caller can map to a fallback, rather than queueing into latency debt that clients time out on anyway. Solves the sympathetic outage and the unbounded queue behind a full pool. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-bulkhead-isolation/bulkhead.ts",
        target: "src/resilience/bulkhead.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-payment-reconciliation",
    title: "Effect Payment Reconciliation",
    description:
      "The safety net under exactly-once: normalize records from your ledger and the processor's statement (each source's date and amount quirks absorbed in one transformation layer), match by transaction id, and classify every difference into an explicit bucket: matched, amount mismatch, missing internal, missing external. A transaction stamped 23:59:55 internally that the processor shows at 00:00:30 next day is held as pending_cutoff and carried to the next run instead of paging anyone at 1am; it resolves to a match when the counterpart arrives or escalates to a real discrepancy when it never does. One cent of drift is caught, never absorbed. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-payment-reconciliation/reconcile.ts",
        target: "src/payments/reconcile.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-hot-account-ledger",
    title: "Effect Hot Account Ledger",
    description:
      "Account subdivision for the merchant whose promotion day melts the ledger: the balance becomes N sub-accounts, each behind its own Semaphore row lock, and a credit locks exactly one, so concurrent credits spread across independent locks instead of queueing in a single-row convoy. The balance is the sum over sub-accounts and the demo proves it lands to the cent while finishing several times faster than the serialized row. Debits that need the full balance take every lock in fixed index order (the resource ordering that cannot deadlock), settle across shards atomically, and refuse over-drafts with a typed InsufficientFunds carrying the true balance. Solves the row-lock convoy on hotspot accounts. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-hot-account-ledger/hotaccount.ts",
        target: "src/payments/hotaccount.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-weighted-load-balancer",
    title: "Effect Weighted Load Balancer",
    description:
      "Load balancing that notices a degraded backend instead of feeding it its rotation share. Round-robin routes a fixed slice to a server whose in-flight queue is climbing (GC pause, cold cache); the power-of-two-choices strategy samples two random backends and picks the one with fewer in-flight requests, near-optimal balance with two counter reads and no global scan or herd. Each backend's in-flight count is a Ref bracketed by Effect.ensuring so a failed or interrupted request still decrements, and the demo shows a 12x-slower backend shedding to a third of its round-robin load. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-weighted-load-balancer/balancer.ts",
        target: "src/net/balancer.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-lru-cache-eviction",
    title: "Effect Segmented LRU Cache",
    description:
      "The eviction policy that survives a table scan. A plain LRU treats a one-touch batch job like real traffic, so a single sequential scan marches every hot key out of the cache and the next minute is all misses. Segmented LRU admits new keys to a probation segment and only promotes to protected on a second hit, so scan keys live and die in probation without displacing anything hot, while quiet protected keys demote back so squatters age out. The demo plays a 100-key scan against 4 twice-touched hot keys: plain LRU loses all 4, segmented LRU keeps all 4. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-lru-cache-eviction/slru.ts",
        target: "src/cache/slru.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-write-behind-cache",
    title: "Effect Write-Behind Cache",
    description:
      "Write coalescing with a journal so eventual durability is not data loss. Write-through pays the store on every keystroke (100 counter bumps, 100 store writes); naive write-behind buffers in memory and a crash between flushes silently drops every acknowledged write. This holds both ends: writes coalesce per key (100 bumps flush as one store write) but every accepted write is journaled first, and recovery replays the journal so a crash costs zero acknowledged writes. The demo proves 100x fewer writes than write-through and full recovery where the unjournaled buffer evaporates. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-write-behind-cache/write-behind.ts",
        target: "src/cache/write-behind.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-cache-penetration-shield",
    title: "Effect Cache Penetration Shield",
    description:
      "The shield for keys that do not exist, which a plain cache cannot protect. A cache only helps for keys that are present, so an attacker iterating random ids misses every time and points the full request rate at the database (the cache-miss attack). A bloom filter seeded with every existing key answers definitely-absent in memory so made-up keys die before the database hears them, and a TTL'd negative cache absorbs repeats for keys that existed then vanished. Index math uses (h >>> 0) so a negative typed-array index can never drop a bloom bit into a false negative. The demo: 50 fake-key requests, 0 database hits. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-cache-penetration-shield/penetration.ts",
        target: "src/cache/penetration.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-cdn-origin-shield",
    title: "Effect CDN Origin Shield",
    description:
      "One origin fetch per object no matter how many edges miss at once. A CDN with 12 POPs that all miss on the same fresh object sends 12 simultaneous origin fetches; multiply by every object that just expired and the origin serves the whole internet again in spikes. A shield tier collapses the fan-in: edges fill from one shield cache, and concurrent misses for the same key coalesce onto a single in-flight fetch via a per-key Deferred claimed in one Ref.modify. The winner resolves the Deferred inside Effect.ensuring so even a failed fetch releases the waiters. The demo: 6 simultaneous edge misses become 1 origin fetch. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-cdn-origin-shield/origin-shield.ts",
        target: "src/cdn/origin-shield.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-dns-resolver-cache",
    title: "Effect DNS Resolver Cache",
    description:
      "A recursive resolver that caches both answers and their absence. Every uncached lookup walks root to TLD to authoritative, three hops before your app sends a byte; the cache collapses that to zero hops until the record's per-name TTL expires, so a rotated IP still propagates on the authority's schedule. NXDOMAIN is the answer nobody caches by default, so a typo'd host in a hot loop re-walks the recursion every time; negative caching (RFC 2308) stores the non-existence with its own shorter TTL. The demo: 41 lookups cost 3 upstream queries, and a nonexistent name's 31 repeats cost 3. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-dns-resolver-cache/resolver.ts",
        target: "src/net/resolver.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-two-phase-commit",
    title: "Effect Two-Phase Commit",
    description:
      "The commit protocol that will not leave money half-transferred across services. Telling three services commit now in a loop works until the second refuses, and then the first has committed and there is no way back. Two-phase commit splits the write into a prepare round (every participant durably stages and votes) and a commit round that only starts on unanimous yes, so a refusal aborts everyone. The decision is written to a durable log before any commit message is sent, so a coordinator crash blocks but never forks: recovery re-delivers the logged decision. The demo shows one-phase commit minting 150 from nothing versus 2PC conserving every cent. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-two-phase-commit/two-phase.ts",
        target: "src/tx/two-phase.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-token-bucket-shaper",
    title: "Effect Token Bucket Shaper",
    description:
      "Rate limiting that allows a real burst but bounds the true rate. A fixed window counted in wall-clock minutes admits 1000 at 0:59 and 1000 more at 1:00, so 2000 requests land in two seconds, the exact spike the limit forbids. A token bucket meters continuously: tokens refill at a steady rate with no boundary reset, and capacity sets the burst a normal page load is allowed before throughput settles to the refill rate. Lazy refill computes accrued tokens from elapsed logical time in one Ref.modify per request, so concurrent requests can never both spend the same token. The demo: 50 racing requests for a 1-token bucket admit exactly 1. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-token-bucket-shaper/token-bucket.ts",
        target: "src/net/token-bucket.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-saga-payment-orchestrator",
    title: "Effect Saga Orchestrator",
    description:
      "The pattern for a multi-vendor booking that fails halfway and must not keep your money. Charge the card, reserve the seat, issue the ticket: if the ticket service is down after the charge, a plain sequence leaves the customer charged for a seat they cannot use. There is no distributed transaction across three vendors' APIs, so the saga registers each step's compensation as it succeeds and, on failure, runs the compensations in reverse for exactly the steps that completed. A compensation that itself fails surfaces as a typed CompensationFailed carrying the stuck steps, not a swallowed refund. The demo unwinds a charge and a seat reservation cleanly when ticketing fails. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-saga-payment-orchestrator/saga.ts",
        target: "src/tx/saga.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-mvcc-snapshot-isolation",
    title: "Effect MVCC Snapshot Isolation",
    description:
      "Readers that never block writers and never tear, plus the lost update snapshot isolation misses. Multi-version concurrency control gives every transaction a snapshot (the last version committed before it began), so a long read sees a stable point-in-time view while writers append new versions and neither waits. Snapshot isolation alone still allows two transactions to both read 100, both write 150, and lose one; first-committer-wins aborts the second with a typed WriteConflict. Each key keeps an append-only version list in a Ref and commit validates the write set in one atomic Ref.modify. The demo proves a stable read across a concurrent commit and a refused lost update. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-mvcc-snapshot-isolation/mvcc.ts",
        target: "src/db/mvcc.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-event-sourced-aggregate",
    title: "Effect Event-Sourced Aggregate",
    description:
      "State as a fold over facts, with optimistic concurrency on the stream. Storing just the current balance forgets how it got there: no audit trail, no dispute history, no way to replay a bug. Event sourcing stores the ordered facts and derives state by folding them, so history is the source of truth and any past state is reproducible by folding a prefix. Two commands that both load version 7 and append event 8 would lose one; compare-and-append expects a version and fails with a typed ConcurrencyConflict if the stream advanced, so the log never loses or double-applies a fact. The demo shows time-travel to any version and a refused stale append. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-event-sourced-aggregate/event-sourcing.ts",
        target: "src/domain/event-sourcing.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-leader-lease-election",
    title: "Effect Leader Lease Election",
    description:
      "Leader election that recovers from a dead leader and fences a zombie one. A plain lock leader that crashes without releasing holds the role forever; a time-bounded lease expires unless renewed, so a dead leader's grip lapses and a follower wins the next election with no human. A leader that pauses past its lease (GC, VM freeze) and resumes must not act on stale authority: every lease carries a monotonic fencing token, and the protected resource rejects any write stamped below the highest token it has seen. The demo elects one leader from a contested lease, hands off after a lapse, and fences a thawed zombie's overwrite. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-leader-lease-election/lease.ts",
        target: "src/cluster/lease.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-vector-clock-causality",
    title: "Effect Vector Clock Causality",
    description:
      "Ordering distributed events by causality instead of two lying wall clocks. Deciding a conflict by timestamp drops the real later edit when clocks disagree by 200ms; vector clocks track what each node had observed, so happened-before is a fact, not a guess. Genuinely concurrent edits (neither saw the other) are detected as concurrent rather than ranked, so the system surfaces a conflict to merge instead of silently overwriting a real change. Each node bumps only its own counter on a local event and merges element-wise maxima on receive, and comparison is a pure total function returning before, after, equal, or concurrent. The demo catches a conflict last-write-wins would have dropped. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-vector-clock-causality/vector-clock.ts",
        target: "src/cluster/vector-clock.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-lsm-memtable-compaction",
    title: "Effect LSM Memtable Compaction",
    description:
      "A log-structured merge tree so random writes become sequential appends. Updating rows in place makes a write-heavy workload thrash on scattered seeks; an LSM appends every write to an in-memory memtable that flushes as one sorted immutable SSTable, so writes are sequential regardless of key order. Reads walk memtable then newest-to-oldest segment and stop at the first hit, and a delete is a tombstone that masks older values rather than a gap that lets them resurrect. Background compaction merges segments newest-first, dropping obsolete versions and tombstones to bound read cost. The demo proves newest-wins across segments and compaction collapsing three segments to one. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-lsm-memtable-compaction/lsm.ts",
        target: "src/db/lsm.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-wal-crash-recovery",
    title: "Effect WAL Crash Recovery",
    description:
      "A write-ahead log so a crash mid-write can always be finished or discarded. Applying updates straight to pages leaves a crash with some pages new and some old and no way to tell which; the WAL rule appends the change and fsyncs it before touching pages, so recovery redoes committed transactions and ignores uncommitted ones. Without checkpoints recovery would replay all of history and the log would grow forever; a checkpoint flushes a durable page image and records that everything up to LSN N is safe, so recovery only replays the suffix. The demo survives a crash for committed writes, discards an uncommitted one, and bounds replay to the post-checkpoint tail. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-wal-crash-recovery/wal.ts",
        target: "src/db/wal.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-fair-priority-scheduler",
    title: "Effect Fair Priority Scheduler",
    description:
      "A binary-heap priority queue with FIFO ties and aging so nothing starves. A sorted-array priority queue breaks ties unstably and lets a job's position jump as peers arrive; a binary heap with a monotonic sequence tiebreaker gives a stable total order, highest priority first and first-in-first-out among equals. Strict priority starves the low tier under a steady stream of urgent work, so a job's effective priority rises with the time it has waited, and even the lowest tier eventually outranks fresh arrivals, bounding the worst-case wait. Push and pop are O(log n) heap sifts in a single Ref. The demo starves a backup job under strict priority, then runs it under aging. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-fair-priority-scheduler/priority.ts",
        target: "src/sched/priority.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-merkle-anti-entropy",
    title: "Effect Merkle Anti-Entropy Sync",
    description:
      "Reconciling two replicas by shipping the difference, not the dataset. Comparing a million keys row by row (or resending everything) costs bandwidth proportional to the data even when replicas differ by one row. A Merkle tree hashes data into a tree of digests; two nodes compare root hashes and only descend into subtrees whose hashes differ, so bytes moved track the number of changed keys. A collision-resistant hash rolled to the root means equal roots imply equal contents and any single change alters every hash on its path, so divergence cannot hide. The demo finds one changed key among 64 by visiting 13 tree nodes, then repairs to convergence. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-merkle-anti-entropy/merkle.ts",
        target: "src/replication/merkle.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-connection-pool-fair",
    title: "Effect Fair Connection Pool",
    description:
      "A bounded pool with FIFO waiting and a fast-fail timeout instead of a hang. Opening a connection per request lets a spike exhaust the database's connection limit so even cheap queries fail; a bounded pool caps concurrency at what the database can serve and makes surplus demand wait. An unbounded wait turns backpressure into a hang, so waiting is FIFO (no waiter starves) and bounded by an acquire timeout that fails with a typed AcquireTimeout under saturation. Acquire and release are single Ref.modify hand-offs, so a connection is issued to exactly one waiter and never double-issued. The demo caps 12 concurrent requests at 3 and fails fast when saturated. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-connection-pool-fair/pool.ts",
        target: "src/db/pool.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-gossip-dissemination",
    title: "Effect Gossip Dissemination",
    description:
      "Epidemic state dissemination that reaches everyone in O(log N) with no coordinator. A coordinator pushing every update to every node is O(N) work on one machine and a single point of failure; gossip has each node tell a few random peers what it knows, so an update reaches the whole cluster in logarithmic rounds and any node's failure barely dents it. Version vectors make it convergent: nodes merge by keeping the highest version per key, so exchanges are idempotent and order-independent and the system reaches a fixed point where further rounds change nothing. The demo spreads one write to 32 nodes in 3 rounds and converges two concurrent writers. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-gossip-dissemination/gossip.ts",
        target: "src/cluster/gossip.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-dataloader-batch",
    title: "Effect DataLoader Batch",
    description:
      "The batching loader that turns an N+1 query storm into two queries. Rendering 100 posts that each fetch their author fires 1 query for posts and 100 for authors; a loader collects every key requested within one tick and issues a single WHERE id IN (...) query, so N+1 becomes 2. Identical keys in a batch are deduped so a shared author is fetched once, and the one batched result scatters back to the exact callers that asked. Pending requests accumulate in a Ref, the first schedules a microtask flush that drains atomically, and each caller's Deferred is resolved from the result map. The demo collapses 100 author lookups to 1 query for 3 distinct ids. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-dataloader-batch/dataloader.ts",
        target: "src/data/dataloader.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-adaptive-concurrency-limit",
    title: "Effect Adaptive Concurrency Limit",
    description:
      "A concurrency limiter that discovers the right ceiling instead of guessing it. Any fixed limit is wrong: too low throttles a healthy downstream, too high buries a degraded one and cascades timeouts. Additive-increase-multiplicative-decrease (the control law TCP uses) nudges the limit up while healthy and halves it fast on overload, converging on whatever the downstream can handle right now. Watching latency, not just errors, backs off before hard failures start, so the system rides just under the cliff. Admission and feedback are single Ref.modify steps clamped to a range so the loop cannot run away. The demo grows the limit on healthy traffic, halves it on a latency spike, and settles near real capacity. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-adaptive-concurrency-limit/aimd.ts",
        target: "src/net/aimd.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-crdt-counter-merge",
    title: "Effect CRDT Counter Merge",
    description:
      "A conflict-free counter that never loses an increment under partition. Representing a distributed count as one mutable cell means two servers reading 10 and writing 11 turn two likes into one; last-write-wins silently drops increments under any race. A state-based grow-only counter gives each replica its own slot that it only increments, the value is the sum of slots, and merge is element-wise max, commutative, associative, and idempotent, so replicas that exchanged updates in any order and any number of times always converge with no coordinator. The demo shows LWW losing a like, then 3+5+2 taken under partition converging to 10 on every replica with re-delivered stale merges harmless. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-crdt-counter-merge/gcounter.ts",
        target: "src/crdt/gcounter.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-sliding-window-rate-limit",
    title: "Effect Sliding Window Rate Limit",
    description:
      "Rate limiting that stops the fixed-window boundary burst with O(1) state. A fixed window admits 100 at 0:59.9 and 100 more at 1:00.0, the exact spike it was meant to forbid, because the window snaps to a grid. A true sliding log is accurate but stores a timestamp per request, a memory-exhaustion vector; the sliding-window-counter keeps just the current and previous window counts and weights the previous by how much of it still overlaps, bounding both the burst and memory to O(1) per key. The decision and count bump happen in one atomic Ref.modify so two concurrent requests at the limit cannot both slip through. The demo halves the boundary burst and refills as the window slides. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-sliding-window-rate-limit/sliding-window.ts",
        target: "src/net/sliding-window.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-scatter-gather-quorum",
    title: "Effect Scatter-Gather Quorum",
    description:
      "Fan-out that returns on a quorum instead of waiting for the slowest shard. A search hitting 20 shards that blocks until all 20 answer is as slow as its worst shard every time; a completeness threshold returns once enough shards answer, so one straggler cannot hold the response and latency is the k-th fastest, not the slowest. A per-gather timeout returns the partial result gathered so far rather than hanging on a dead shard, and remaining shard fibers are interrupted on completion so a slow shard cannot leak a running fiber. The demo meets a 3-of-5 quorum in 16ms past two 500ms stragglers, degrades to a partial result when the quorum is impossible, and leaks no fibers. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-scatter-gather-quorum/scatter-gather.ts",
        target: "src/net/scatter-gather.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-chunked-upload-integrity",
    title: "Effect Chunked Upload Integrity",
    description:
      "Resumable chunked upload with per-chunk and whole-object checksums. Sending a large file as one stream lets a single flipped byte produce a silently wrong object the server stores as fine; per-chunk checksums catch corruption at the boundary and reject that chunk for re-send instead of poisoning the whole upload. Tracking which chunks are verified lets a connection lost at 95% resume by sending only the missing ones, and a final whole-object digest proves the reassembled file matches what the client meant to send. Accepting a chunk recomputes and compares its checksum in one Ref.modify, so a re-sent chunk is idempotent and a corrupt one is a typed ChecksumMismatch. The demo rejects a corrupt chunk, resumes after a drop, and refuses a whole-object mismatch. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-chunked-upload-integrity/integrity.ts",
        target: "src/storage/integrity.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-bloom-url-frontier",
    title: "Effect Bloom Filter URL Frontier",
    description:
      "Crawler-grade dedupe in a fixed bit array: k hash positions per URL (double hashing over FNV-1a with an avalanche finisher), textbook sizing from capacity and target false-positive rate, and a bounded frontier Queue so discovery backpressures fetchers instead of buffering the web in memory. The trade sits on the safe side by construction: false negatives are impossible, so a seen URL is never re-crawled and the crawler cannot loop, while false positives arrive at the configured rate and each costs one missed page, never correctness. The demo measures 100k URLs in ~117KB against a ~12MB exact Set and confirms the observed false-positive rate against the predicted one. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-bloom-url-frontier/frontier.ts",
        target: "src/crawler/frontier.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-password-hash-vault",
    title: "Effect Password Hash Vault",
    description:
      "Password storage the way the leaked-table postmortem wishes it had been: every user gets a random 16-byte salt, the hash is scrypt (memory-hard, so each offline guess is expensive by design), and the stored record embeds its own parameters as scrypt$N$r$p$salt$hash. Verification recomputes with the record's embedded cost and compares with timingSafeEqual, unknown user and wrong password fail with one identical typed error so login cannot enumerate accounts, and a successful login through an outdated cost transparently re-hashes at the current cost, the only moment the plaintext exists being the only upgrade window. Uses node:crypto only. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-password-hash-vault/passwords.ts",
        target: "src/auth/passwords.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-quorum-read-repair",
    title: "Effect Quorum Reads with Read Repair",
    description:
      "Eventual consistency with an actual mechanism: N replicas, write to W, read from R, R + W > N, so every read set overlaps every write set and the newest version is always among the answers; the reader takes the highest version, so a partitioned replica's stale copy cannot win a quorum read. Divergence heals instead of lingering: a read that observes disagreeing versions writes the winner back to the stale replicas on a detached fiber (read repair off the read path), replicas reject version regressions so repair can never move a copy backward, and losing quorum is a typed QuorumUnreachable refusal rather than a wrong answer. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-quorum-read-repair/quorum.ts",
        target: "src/replication/quorum.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-optimistic-lock-retry",
    title: "Effect Optimistic Lock with Retry",
    description:
      "Version-column concurrency for the workload where conflicts are rare and locks are waste: every row carries a version, the write is one atomic compare-and-set (the same shape as UPDATE ... WHERE version = ?), and a write that lost the race surfaces as a typed VersionConflict carrying both versions instead of silently clobbering. The optimistic loop re-reads before every attempt so it never replays a stale computation, retries with jittered exponential backoff a bounded number of times, and exhaustion on a genuine hot spot is a typed RetriesExhausted you can route to a queue. The demo shows 50 unguarded concurrent increments landing as 1 (49 silent lost updates) versus the versioned loop landing all 50 through 286 retried conflicts. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-optimistic-lock-retry/optimistic.ts",
        target: "src/db/optimistic.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-deadlock-detector",
    title: "Effect Deadlock Detector",
    description:
      "A lock manager that refuses to let the circular wait form: the owners table and wait-for edges live in one Ref, every lock request checks (inside the same atomic decision that would enqueue it) whether waiting would close a cycle, and the request that would complete the ring fails with a typed DeadlockVictim carrying the cycle instead of hanging forever. Victim locks actually release: withTransaction scopes every grant and its release runs on success, failure, and the victim path alike, so the survivor's blocked locks free automatically. Detects transitive rings (T1 waits on T2 waits on T3 waits on T1), and the demo also shows the prevention strategy, fixed resource ordering, committing 10 of 10. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-deadlock-detector/deadlock.ts",
        target: "src/locks/deadlock.ts",
        type: "registry:lib",
      },
    ],
  },

  {
    name: "effect-geohash-proximity",
    title: "Effect Geohash Proximity Index",
    description:
      "Nearby search without the full-table haversine scan: points are geohashed (interleaved lat/lng bisection, base32) into a Ref-held cell index, and a radius query reads the query point's cell plus its 8 neighbors, then applies the exact haversine circle test to just those candidates. The neighbor scan is the correctness half: two points meters apart on opposite sides of a cell boundary share no useful prefix, and a naive single-cell lookup silently drops one of them, so the grid is only ever a candidate generator and the final circle test decides. Neighbors are derived by decoding the center cell's bounds and re-encoding one cell-width away, immune to base32 edge tables, with antimeridian wrap handled. Pinned to effect 4.0.0-beta.98.",
    section: "backend",
    category: "Backend",
    pro: false,
    date: "2026-07-23",
    type: "registry:lib",
    dependencies: ["effect@4.0.0-beta.98"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/effect-geohash-proximity/proximity.ts",
        target: "src/geo/proximity.ts",
        type: "registry:lib",
      },
    ],
  },
];

export function getRegistryDesignGuidance(
  item: RegistryItem,
): RegistryDesignGuidance {
  if (item.section === "pages" && item.name !== "expanding-rows-gallery") {
    const subject = /commerce|cart|shop/i.test(item.description)
      ? "an editorial store or product archive"
      : /portfolio|agency|studio|bureau/i.test(item.description)
        ? "a portfolio or creative studio site"
        : /archive|observatory|institution|film/i.test(item.description)
          ? "a cultural, archival, or editorial site"
          : "a campaign, launch, or editorial site";
    return {
      style:
        "A full-page, motion-led composition whose typography, media, and transitions work as one visual system.",
      use: `Use ${item.title} as the main foundation for ${subject} that can support its complete page rhythm.`,
      pair: "Pair it with project-specific copy and media, restrained brand tokens, and only the forms, analytics, or backend features the finished site needs.",
      avoid:
        "Avoid combining it with another full-page template or a competing global animation system. Use a smaller component when you only need one interaction.",
    };
  }

  if (item.name === "effect-cloudflare-event-api") {
    return {
      style:
        "Typed, explicit, and operations-minded backend architecture built around Effect services, layers, schemas, and tagged errors.",
      use: `Use ${item.title} for a Cloudflare Worker API that needs validated boundaries, KV persistence, tracing, and background work without a large framework shell.`,
      pair: "Pair it with authentication at the HTTP boundary, a durable store when KV consistency is insufficient, and the target project's existing telemetry exporter.",
      avoid:
        "Avoid it for a tiny stateless endpoint or a project that does not use Effect, because the service and layer model would add ceremony without leverage.",
    };
  }

  if (item.name === "websocket-route-handler") {
    return {
      style:
        "A minimal, native Next.js realtime transport that keeps the WebSocket upgrade inside a route handler.",
      use: `Use ${item.title} for Node.js deployments that need direct bidirectional updates such as presence, live dashboards, collaborative state, or streaming events.`,
      pair: "Pair it with client reconnect and heartbeat handling, authentication during upgrade, and shared state or pub-sub when more than one server instance participates.",
      avoid:
        "Avoid it on Edge, static export, or Vercel Functions, and prefer SSE when the browser only needs one-way server updates.",
    };
  }

  if (item.name === "better-auth-jwks-cookie-cache") {
    return {
      style:
        "Two small server files, heavy on comments that name the exact 1.7.0 API and the failure mode each guard prevents. No demo scaffolding, no console output.",
      use: `Use ${item.title} for verifying a Better Auth session at the edge or in a second service without handing it the signing secret.`,
      pair: "Pairs with the Drizzle adapter entry for the database side, and with Better Auth Provisioning Gate on the same auth instance.",
      avoid:
        "Avoid treating the cached read as proof the session is still live: sign-out, ban, and revocation lag by cookieCache.maxAge, so re-read through auth.api.getSession before anything destructive. Avoid it entirely on better-auth 1.6.x, where getCookieCache has no jwt config.",
    };
  }

  if (item.name === "better-auth-provisioning-gate") {
    return {
      style:
        "One pure function factory returning the validateUserInfo hook. Machine-readable rejection codes, fail-closed branches, no I/O so it stays trivially testable.",
      use: `Use ${item.title} for restricting which identities a B2B or workspace deployment will admit, across every sign-in method at once.`,
      pair: "Pairs with the organization plugin for tenant membership, and with Better Auth JWKS Cookie Cache on the same auth instance.",
      avoid:
        "Avoid relying on it to block already-provisioned users on non-provider sign-ins: those are not re-validated, so use the admin plugin's ban controls or a session-create hook. Avoid putting internal detail in errorDescription, it is surfaced to the client.",
    };
  }

  if (item.name === "better-auth-atomic-rate-limit") {
    return {
      style:
        "One factory returning the storage object, with the Lua script inline so the atomicity claim is readable at the call site. Structural Redis type, no client dependency pinned.",
      use: `Use ${item.title} for enforcing Better Auth rate limits across multiple instances, where an in-memory counter cannot see the other processes.`,
      pair: "Pairs with rateLimit.customRules tightened on the credential endpoints, and with the Better Auth Provisioning Gate for the admission side.",
      avoid:
        'Avoid setting onError to "open" on credential endpoints: a Redis outage then becomes an unthrottled window. Avoid it on better-auth 1.6.x, where the storage interface still requires get and set.',
    };
  }

  if (item.name === "bun-secrets-vault") {
    return {
      style:
        "A library export plus a thin CLI over one runtime API. The key index is the only cleverness, and it exists because Bun.secrets has no list, stated where it is read.",
      use: `Use ${item.title} for keeping local and CI secrets out of git, in the OS keychain, with a run subcommand that hands them to any child process as env.`,
      pair: "Pair it with process.env in CI where no keychain exists, and with the Bun SQLite Job Queue or Bun Auth Gateway, which read their credentials through loadConfig rather than a committed .env.",
      avoid:
        "Avoid it on a runtime other than Bun, since Bun.secrets is the whole mechanism, and avoid treating the run injection as isolation: the child sees every secret, so scope the vault per service rather than sharing one.",
    };
  }

  if (item.name === "bun-sqlite-job-queue") {
    return {
      style:
        "One file that is both the queue API and its own worker, gated on isMainThread. The claim is a single SQL statement, so the concurrency argument is readable in one line.",
      use: `Use ${item.title} for durable background work on a single Bun host: emails, webhooks, thumbnails, anything that must retry and survive a crash without standing up Redis.`,
      pair: "Pair it with Bun.cron for scheduled enqueues and with the Bun Secrets Vault for any credentials the job handlers need.",
      avoid:
        "Avoid it across more than one machine, since a local .db does not coordinate hosts; reach for a network queue there. Avoid long visibility timeouts on fast jobs, which delays recovery of a genuinely crashed worker.",
    };
  }

  if (item.name === "bun-auth-gateway") {
    return {
      style:
        "Session auth assembled from runtime primitives, not a framework. Each security decision (argon2id, dummy-hash timing, CSRF binding, sliding window) sits at its call site with the reason next to it.",
      use: `Use ${item.title} for a small first-party service that needs real signup, sessions, CSRF, and rate limiting without adopting an auth library or a second datastore.`,
      pair: "Pair it with the Bun Secrets Vault for the signing and database config, and with the Bun SQLite Job Queue for post-signup side effects like verification mail.",
      avoid:
        "Avoid it when you need SSO, OAuth providers, or multi-device session management, where a dedicated auth system earns its weight. Avoid running it multi-host on a local sqlite, since sessions and the rate window would not be shared.",
    };
  }

  if (item.name === "deno-kv-leader-election") {
    return {
      style:
        "Coordination as compare-and-swap. The lease stores its own expiry so a waiter never trusts the sweep, and that single decision is what makes the failover bound honest.",
      use: `Use ${item.title} for singleton work across a fleet: one cron runner, one migration, one compactor, where exactly one process may act at a time and it must hand off cleanly on death.`,
      pair: "Pair it with the Deno KV Realtime Sync or Rate Limit entries on the same KV, and with a short TTL when fast failover matters more than renewal chatter.",
      avoid:
        "Avoid a TTL shorter than the work a critical section must finish, or the lease can expire mid-write. Avoid assuming the lock alone makes a side effect idempotent: a rejected stale holder may already have acted, so fence the write too.",
    };
  }

  if (item.name === "deno-kv-rate-limit") {
    return {
      style:
        "A limiter that leaves no sweeper behind. The counter buckets expire themselves through expireIn on the sum mutation, so the data model has no cleanup path to forget.",
      use: `Use ${item.title} for per-client throttling on Deno Deploy where the limit must hold across isolates and regions, not just one process.`,
      pair: "Pair it with the Deno KV Leader Election entry for singleton control-plane work and with tighter windows on credential or write endpoints.",
      avoid:
        "Avoid it where every request already runs single-process, where an in-memory counter is cheaper, and avoid treating the two-bucket window as exact: it is a weighted approximation, correct for throttling, not for billing counts.",
    };
  }

  if (item.name === "deno-kv-realtime-sync") {
    return {
      style:
        "The stream is the subscription and the versionstamp is the concurrency control. There is no socket layer to reason about, because kv.watch teardown is the unsubscribe.",
      use: `Use ${item.title} for small shared documents that several clients edit live: a kanban column, a settings panel, a lobby roster, where optimistic conflicts are acceptable and history is not needed.`,
      pair: "Pair it with the Deno KV Leader Election entry when one writer must own a merge step, and with an EventSource client that retries on disconnect.",
      avoid:
        "Avoid it for large or fast-moving tables, since every subscriber receives the whole document on each change, and avoid it where you need an ordered change log or server-push under load caps, which SSE duration limits will cut.",
    };
  }

  if (item.name === "node-permission-sandbox") {
    return {
      style:
        "Isolation by process boundary, not by cleverness in-process. The trust decision is a child launched under --permission with a clean env, and the protocol between parent and child is a few lines of stdout JSON.",
      use: `Use ${item.title} for running user-supplied or third-party plugin code that should touch only a data directory and nothing else: extension points, importers, formatters, evaluators.`,
      pair: "Pair it with the Node Diagnostics Telemetry entry to observe plugin runs, and with a Node 24 runtime when you also need to deny the network, which the runner detects and applies.",
      avoid:
        "Avoid trusting an unrealpathed allowlist path, which silently denies everything behind a symlink, and avoid presenting it as a full sandbox on Node 22, where there is no network scope: pair it with an outbound firewall until you can run 24.",
    };
  }

  if (item.name === "node-diagnostics-telemetry") {
    return {
      style:
        "Observability that touches no handler. The whole artifact is subscribers on channels Node already publishes, so the application code stays free of timing and logging entirely.",
      use: `Use ${item.title} for structured request logs, per-route latency histograms, and a /metrics endpoint on a plain node:http or Express service without adopting an APM agent.`,
      pair: "Pair it with a Prometheus scrape of /metrics and with the Node Permission Sandbox entry so plugin executions show up on the same channels.",
      avoid:
        "Avoid assuming bindStore propagates on http.server.request.start, which it does not for server requests here, and avoid it where you need full distributed tracing across services, which wants an OpenTelemetry SDK rather than local channels.",
    };
  }

  if (item.name === "node-sqlite-worker-pool") {
    return {
      style:
        "Backpressure by construction: the pool claims from SQLite only when a worker is free, so the queue depth lives in the database, never in an unbounded in-memory buffer.",
      use: `Use ${item.title} for CPU-bound durable work on one Node host, where jobs must survive a restart and where a growing backlog should stay on disk rather than in heap.`,
      pair: "Pair it with the Node Diagnostics Telemetry entry to watch throughput and with the included node:test mock-timer suite as the template for asserting your own backoff.",
      avoid:
        "Avoid it across multiple machines on a shared file, since node:sqlite does not coordinate hosts, and avoid TypeScript parameter properties in the worker file, which type stripping rejects: the code uses explicit fields for that reason.",
    };
  }

  if (item.name === "durable-object-rpc-rate-limit") {
    return {
      style:
        "The limiter is a method call, not a request. State is the socket's own SQLite and refill is an alarm that disarms when full, so an idle key is genuinely free and the RPC reads like a local function.",
      use: `Use ${item.title} for globally correct per-key quotas on Cloudflare where accounting must be exact: paid API tiers, abuse ceilings, anything a per-colo approximation would undercount.`,
      pair: "Pair it with the Cloudflare Worker Test Harness entry, whose Durable Object storage access can assert the bucket math, and with the eventually consistent Rate Limiting binding in front of it for a cheap first cut.",
      avoid:
        "Avoid it where a per-colo approximation is good enough, since a single object per key adds a network hop, and avoid very high single-key throughput, where one object becomes the hot partition the limiter was meant to prevent elsewhere.",
    };
  }

  if (item.name === "effect-cache-stampede-guard") {
    return {
      style:
        "Two guarantees stacked in one read path: the Cache gives single-flight, the Semaphore gives an origin ceiling. Each is a few lines, and the demo proves the count rather than asserting it in prose.",
      use: `Use ${item.title} for a read-through cache in front of an expensive origin (a database, a pricing service, a rendered page) where a hot key expiry or a cold start would otherwise send a herd straight through.`,
      pair: "Pair it with the Effect Circuit Breaker and Retry Budget entry on the origin call itself, so a stampede that does get through still cannot hammer a sick dependency.",
      avoid:
        "Avoid it for per-user data that is never shared, where coalescing buys nothing, and avoid setting the admission ceiling so low that warm traffic queues behind it: the gate is for cold-start protection, not steady-state throttling.",
    };
  }

  if (item.name === "effect-circuit-breaker-budget") {
    return {
      style:
        "Resilience as explicit state, not decorators. The budget, the breaker, and the bulkhead are each a Ref you can read and reason about, and the retry ceiling is enforced by accounting rather than by a magic backoff schedule.",
      use: `Use ${item.title} for calls to any dependency that can fail in bursts (a third-party API, a shared database, another service) where naive per-caller retries would amplify an outage.`,
      pair: "Pair it with the Effect Cache Stampede Guard on read paths and with a Metric export so the open-circuit and budget-exhausted transitions are visible on a dashboard.",
      avoid:
        "Avoid wrapping an idempotent local write that cannot cascade, where the machinery is overhead, and avoid a retry budget so generous it never bites: the point is a hard ceiling on retry-as-a-fraction-of-traffic, so size it to the origin, not to optimism.",
    };
  }

  if (item.name === "effect-shard-router-backpressure") {
    return {
      style:
        "Routing plus flow control in one module. The hot-key split is a two-hash decision at the call site, and backpressure is a property of the bounded Queue rather than a check the caller has to remember.",
      use: `Use ${item.title} for fan-out work with a skewed key distribution: per-tenant pipelines, per-room event processing, anything where one key can go viral and starve the rest.`,
      pair: "Pair it with the Effect Circuit Breaker and Retry Budget inside each shard worker and with the per-shard gauges wired to an autoscaler or an alert on sustained depth.",
      avoid:
        "Avoid it when the key distribution is already uniform, where a plain hash router is simpler, and avoid the dropping queue for work that must not be lost: shedding is for low-priority traffic, and anything durable belongs on the bounded path or in the Effect Outbox Replicator.",
    };
  }

  if (item.name === "effect-fencing-token-hlc") {
    return {
      style:
        "Correctness that does not trust the clock or the lease. The resource enforces the fencing token itself, so safety does not depend on the old leader noticing it lost, and the HLC makes ordering independent of wall-clock monotonicity.",
      use: `Use ${item.title} for a single-writer resource behind a lease (a compactor, a migration, an exactly-one job) where a paused or partitioned leader must never land a stale write, and for ordering events across nodes whose clocks drift.`,
      pair: "Pair it with the Deno KV Leader Election or a Durable Object for the lease itself, and carry the fencing token into the Effect Outbox Replicator so a rejected write never reaches the replica.",
      avoid:
        "Avoid it where writes are already commutative or idempotent and order does not matter, where the token adds ceremony for no safety, and avoid trusting the lease TTL alone without the token: the token is what makes a late write safe, the TTL only decides when to elect.",
    };
  }

  if (item.name === "effect-outbox-replicator") {
    return {
      style:
        "Durability and lifecycle treated as one concern. The atomic commit closes the dual-write gap, the cursor makes redelivery safe, and every background fiber is owned by a Scope so shutdown is a finalizer, not a hope.",
      use: `Use ${item.title} for publishing a change to a replica, a search index, or a message bus exactly when a row is written, where a crash between the two must not lose the event and a restart must not double-apply it.`,
      pair: "Pair it with the Effect Fencing Token and Hybrid Clock so a stale leader's record never enters the outbox, and with a real broker or database in place of the in-memory stand-ins the demo uses.",
      avoid:
        "Avoid it when the consumer is not idempotent, where at-least-once redelivery will double-apply and the sequence guard is the whole point, and avoid skipping the FiberSet ownership on the workers: an orphaned replicator fiber is the leak this component exists to prevent.",
    };
  }

  if (item.name === "effect-idempotency-key-store") {
    return {
      style:
        "One atomic decision per request. Ref.modify either claims the key or tells you who owns it, and the Deferred is the only channel a duplicate learns the result through, so the race has one winner by construction.",
      use: `Use ${item.title} in front of any non-idempotent effect a client can retry: charges, order submission, account creation, anything where the request may arrive twice and the effect must land once.`,
      pair: "Pair it with the Effect Exactly-Once Consumer on the message side (the same dedupe idea at the queue boundary) and swap the in-memory Ref for a SQL or KV table when keys must survive a restart.",
      avoid:
        "Avoid it on effects that are already idempotent writes keyed by the same id, where it only adds a hop, and avoid an unbounded TTL: a replayed result is a cached response, and cached responses need an expiry.",
    };
  }

  if (item.name === "effect-hedged-request-race") {
    return {
      style:
        "Latency treated as a race you can enter twice. raceFirst does the interruption bookkeeping, and the hedge budget is a token bucket in one Ref, so the protection cannot itself become the outage.",
      use: `Use ${item.title} for read paths against replicated backends (replica pools, key-value stores, search fan-outs) where any node can answer and the p99 is dominated by stragglers.`,
      pair: "Pair it with the Effect Bulkhead Isolation entry so hedged calls draw from the same compartment as their primaries, and feed the hedge delay from a live p95 metric rather than a constant.",
      avoid:
        "Avoid it on writes and anything non-idempotent, where two attempts can both land, and avoid hedging a single-instance dependency: a second request to the same slow node just doubles its queue.",
    };
  }

  if (item.name === "effect-read-replica-router") {
    return {
      style:
        "Freshness as arithmetic, not vibes. The session mark and the replica's applied LSN are two numbers, and every routing decision is a comparison of them, so there is no staleness heuristic to tune.",
      use: `Use ${item.title} when read traffic outgrows one database and you add replicas, the moment users start reporting that a save then a reload shows the old value.`,
      pair: "Pair it with the Drizzle Effect PG Repository for the actual queries on each target, and surface per-replica lag as a gauge so the ejection ceiling alerts before users notice.",
      avoid:
        "Avoid it when all reads can tolerate staleness (route everything to replicas and skip the machinery) and avoid session marks stored client-side without signing: the mark decides where reads go, so it is an integrity input.",
    };
  }

  if (item.name === "effect-heartbeat-failure-detector") {
    return {
      style:
        "Suspicion as a number, not a boolean. Phi is a pure function of the learned arrival window and the current clock, so the detector has no timer state that can wedge along with the node it watches.",
      use: `Use ${item.title} wherever a fixed heartbeat timeout keeps paging you at 3am: cluster membership, worker liveness, any monitor that must distinguish a congested network from a dead process.`,
      pair: "Pair it with the Deno KV Leader Election so a leader is only deposed when phi crosses the threshold, and with the Effect Consistent Hash Ring so a confirmed death triggers a minimal reshard.",
      avoid:
        "Avoid it for request-scoped deadlines, where Effect.timeout is the right tool, and avoid a threshold below 5 unless false positives are cheaper than slow detection: 8 is the classic default for a reason.",
    };
  }

  if (item.name === "effect-multipart-upload-resume") {
    return {
      style:
        "Cleanup as a property of the scope. The abort finalizer is bound to the initiate, runs on failure and interrupt alike, and skips itself after complete, so no code path can forget it.",
      use: `Use ${item.title} for any large-object push to S3-style storage (backups, exports, video) where a dropped connection at 95% must not restart the transfer and an abandoned session must not bill forever.`,
      pair: "Pair it with the Effect Hedged Request Race on individual part uploads if part latency is spiky, and keep the uploadId in durable storage so a process restart can pass resumeFrom.",
      avoid:
        "Avoid it for objects below the multipart minimum, where a single put is simpler and atomic, and avoid unbounded part concurrency: the bound is what keeps a 10GB upload from starving the rest of the process.",
    };
  }

  if (item.name === "effect-exactly-once-consumer") {
    return {
      style:
        "Ordering as the whole argument. Process-then-commit turns every crash into a redelivery, the dedupe lives inside the same Ref.modify as the effect, and the demo plays the wrong ordering so the loss is a number you can read.",
      use: `Use ${item.title} for consuming payment events, ledger postings, or anything where both losing a message and applying it twice are incidents, which is to say most queues that touch money or state.`,
      pair: "Pair it with the Effect Outbox Replicator on the producing side (atomic write-and-publish feeding at-least-once delivery) and with the Effect Idempotency Key Store when the side effect calls a third party.",
      avoid:
        "Avoid the machinery for metrics-grade streams where at-most-once is acceptable and cheaper, and avoid a dedupe set that only lives in memory if redelivery can span restarts: persist the applied ids with the state they guard, ideally in the same transaction.",
    };
  }

  if (item.name === "effect-webhook-dispatcher") {
    return {
      style:
        "Delivery as a lifecycle, not a fetch. The retry policy, per-attempt timeout, and dead-letter transition are all explicit, and the signature scheme is the one the consumer can verify in constant time.",
      use: `Use ${item.title} to push events into customer or partner endpoints, where their downtime is a certainty and a forged POST to their handler must be impossible.`,
      pair: "Pair it with the Effect Exactly-Once Consumer on the receiving end (the event id is the dedupe key) and drive redelivery of dead letters from an operator action, not a timer.",
      avoid:
        "Avoid unsigned webhooks even for internal consumers (the URL always leaks eventually), and avoid retrying 4xx responses: a rejection is a contract disagreement to surface, not a transient to back off on.",
    };
  }

  if (item.name === "effect-consistent-hash-ring") {
    return {
      style:
        "Placement as geometry. The ring is one immutable sorted array swapped in a Ref, the lookup is a binary search, and the demo measures the remap fraction instead of asserting it.",
      use: `Use ${item.title} to place keys on a changing set of nodes: cache tiers, connection pinning, shard assignment, anywhere hash(key) % N would stampede the cluster every time N changes.`,
      pair: "Pair it with the Effect Heartbeat Failure Detector to drive membership changes off confirmed deaths, and with the Effect Shard Router with Backpressure when hot keys need splitting beyond placement.",
      avoid:
        "Avoid it for a fixed-size cluster that will genuinely never change, where modulo is simpler, and avoid tiny vnode counts: the evenness of the arcs is statistical and needs the replication to work.",
    };
  }

  if (item.name === "effect-snowflake-id-generator") {
    return {
      style:
        "Uniqueness by construction. The mint is one Ref.modify over (lastTimestamp, sequence), so every failure branch (exhausted sequence, clock rollback) is a visible case, not an interleaving.",
      use: `Use ${item.title} when inserts outgrow a central sequence: event ids, order numbers, message ids across services, anywhere you need locally-minted 64-bit ids that still sort and paginate by time.`,
      pair: "Pair it with the Effect Fencing Token and Hybrid Clock where cross-node ORDERING must be correct rather than approximate, and assign machine ids from your deploy topology, never randomly.",
      avoid:
        "Avoid it where ids must be unguessable (these leak timing and volume; use random ids there), and avoid trusting NTP to never step: the rollback guard is the component, not an edge case.",
    };
  }

  if (item.name === "effect-bulkhead-isolation") {
    return {
      style:
        "Failure domains drawn in code. Each compartment is a Semaphore plus a bounded waiting room, admission is one atomic decision, and rejection is a typed error the caller plans for in the signature.",
      use: `Use ${item.title} when one service calls several dependencies through shared capacity, and a slowdown in the least important one (recommendations, enrichment) must not take down the most important one (checkout).`,
      pair: "Pair it with the Effect Circuit Breaker and Retry Budget inside each compartment (the breaker stops calling a sick dependency, the bulkhead contains it meanwhile) and map BulkheadRejected to a degraded fallback.",
      avoid:
        "Avoid slicing one dependency into many tiny compartments, which just lowers its ceiling, and avoid a large waiting room: the room converts shed into queueing, and queueing is the failure mode this exists to stop.",
    };
  }

  if (item.name === "effect-payment-reconciliation") {
    return {
      style:
        "A total function over the joined ids: every record lands in exactly one bucket, so 'unexplained' is not a representable outcome, and the cut-off window turns the midnight false alarm into a carried state.",
      use: `Use ${item.title} as the nightly safety net wherever money crosses systems (your platform, a processor, a ledger), because exactly-once engineering reduces the discrepancy count, it never makes the check unnecessary.`,
      pair: "Pair it with the Effect Exactly-Once Consumer feeding the ledger side and route amount_mismatch and escalated missing_* findings to an operator queue with the raw records attached.",
      avoid:
        "Avoid auto-repairing mismatches (the reconciler's job is to find and classify, a human or a dedicated workflow owns the fix) and avoid a cut-off tolerance so wide it hides genuinely missing settlements for days.",
    };
  }

  if (item.name === "effect-hot-account-ledger") {
    return {
      style:
        "The lock convoy dissolved by arithmetic: N sub-accounts means N independent locks for credits, one fixed-order sweep for debits, and the balance stays a sum you can prove to the cent.",
      use: `Use ${item.title} for the accounts that concentrate traffic: the big merchant on promotion day, the platform fee account, any row whose lock queue shows up in p99 write latency.`,
      pair: "Pair it with the Effect Idempotency Key Store on the credit path so retried payments land once, and persist sub-accounts as real rows so the pattern survives the move from Refs to your database.",
      avoid:
        "Avoid it for ordinary accounts where a single row never queues (the sweep debit costs N locks for no benefit) and avoid sizing N above your real concurrency: idle sub-accounts just make every debit wider.",
    };
  }

  if (item.name === "effect-weighted-load-balancer") {
    return {
      style:
        "Balance as a live measurement, not a static schedule: two counter reads decide each route, so a backend that slows down sheds traffic the instant its queue grows, with no health-check lag.",
      use: `Use ${item.title} in front of a pool of interchangeable backends (stateless API replicas, worker fleets, cache nodes) where one member can degrade independently and you want load to follow live capacity.`,
      pair: "Pair it with the Effect Heartbeat Failure Detector to eject a backend that is truly down (not just slow) and with the Effect Adaptive Concurrency Limit to cap total in-flight work per backend.",
      avoid:
        "Avoid it for sticky-session or sharded routing where a request must reach a specific backend (the point is interchangeability), and avoid pure random or round-robin when tail latency matters: they cannot see the slow node.",
    };
  }

  if (item.name === "effect-lru-cache-eviction") {
    return {
      style:
        "Recency and frequency together: probation catches scans, a second hit earns tenure, and protected keys demote when quiet, so the hot set survives a batch job that a plain LRU would flush.",
      use: `Use ${item.title} for read caches that sit in front of a database and are periodically walked by analytics, exports, or crawlers, exactly where a single scan would otherwise evict everything real traffic needs.`,
      pair: "Pair it with the Effect Cache Penetration Shield so nonexistent keys never reach the cache at all, and with the Effect CDN Origin Shield when the miss cost is a slow upstream fetch worth coalescing.",
      avoid:
        "Avoid it when your working set fits entirely in cache (eviction never fires, so segmentation is pure overhead) and when access is uniformly random with no hot set to protect.",
    };
  }

  if (item.name === "effect-write-behind-cache") {
    return {
      style:
        "Coalesce for throughput, journal for safety: only the last value per key reaches the store, but nothing is acknowledged that is not also recoverable, so eventual durability is never data loss.",
      use: `Use ${item.title} for high-frequency counters and state that only needs to be eventually durable: view counts, presence, last-seen timestamps, anything hammered far faster than it must be persisted.`,
      pair: "Pair it with the Effect WAL Crash Recovery mental model for the journal, and with the Effect Outbox Replicator when the downstream write must also reach another system exactly once.",
      avoid:
        "Avoid it for money or anything requiring read-your-write durability the instant you acknowledge (use write-through there), and avoid unbounded flush intervals that let the buffer grow past what recovery can replay quickly.",
    };
  }

  if (item.name === "effect-cache-penetration-shield") {
    return {
      style:
        "A cache that also shields absence: the bloom filter answers definitely-absent in memory and the negative cache remembers a real key that vanished, so made-up keys never touch the database.",
      use: `Use ${item.title} anywhere clients can request ids you do not control (public APIs, user-supplied keys, enumerable resources) and a miss is an expensive database round-trip an attacker can weaponize.`,
      pair: "Pair it with the Effect Segmented LRU Cache for the positive path and with the Effect Sliding Window Rate Limit to bound how fast one client can probe distinct keys at all.",
      avoid:
        "Avoid it when the key space is small and fully cacheable (a plain map suffices) and remember a bloom false positive costs one wasted lookup, so size k and the bit array for your real false-positive budget.",
    };
  }

  if (item.name === "effect-cdn-origin-shield") {
    return {
      style:
        "One fetch per object, total: edges fill from a shield tier and concurrent misses coalesce onto a single in-flight fetch, so a synchronized expiry storm cannot fan out to the origin.",
      use: `Use ${item.title} as a mid-tier between many edge caches and one origin, or as request coalescing in front of any expensive idempotent fetch (a render, a signed-URL mint, a slow upstream API).`,
      pair: "Pair it with the Effect Cache Stampede Guard for the single-flight refresh of hot keys and with the Effect Segmented LRU Cache to decide what the shield keeps resident.",
      avoid:
        "Avoid it for per-user or non-idempotent responses that cannot be shared across callers (coalescing would serve one user another's data) and when the origin is already cheap enough that a fan-out does not hurt.",
    };
  }

  if (item.name === "effect-dns-resolver-cache") {
    return {
      style:
        "Cache the answer and the absence: TTL'd positive records collapse the recursion to zero hops, and a shorter-TTL tombstone stops a nonexistent name from re-walking root, TLD, and authority every time.",
      use: `Use ${item.title} whenever you resolve names (or any recursive, TTL-bearing lookup) in a hot path and both real answers and NXDOMAIN storms would otherwise cost a full upstream round-trip each.`,
      pair: "Pair it with the Effect Weighted Load Balancer once a name resolves to several addresses and with the Effect Heartbeat Failure Detector to stop routing to a resolved-but-dead host.",
      avoid:
        "Avoid caching past the record's TTL (a rotated IP must propagate on the authority's schedule) and avoid a negative TTL so long that a freshly registered name stays invisible after it starts existing.",
    };
  }

  if (item.name === "effect-two-phase-commit") {
    return {
      style:
        "Prepare, then commit, with the decision made durable before anyone hears it: unanimous yes commits everyone, a single no aborts everyone, and a coordinator crash blocks but can never fork.",
      use: `Use ${item.title} when one logical write must land atomically across a few services you control and none of them offers a shared transaction, so the alternative is a hand-rolled sequence that can strand state.`,
      pair: "Pair it with the Effect Saga Orchestrator for the long-running or compensatable variant, and with the Effect Idempotency Key Store so re-delivered commit messages apply exactly once.",
      avoid:
        "Avoid it across many participants or over high-latency links where the blocking window is unacceptable (favor a saga), and never skip the durable decision log: it is the whole reason a crash cannot split the brain.",
    };
  }

  if (item.name === "effect-token-bucket-shaper") {
    return {
      style:
        "Continuous metering with a burst allowance: tokens refill at a steady rate with no boundary to game, so a normal burst passes up to capacity and sustained abuse is shaped down to the refill rate.",
      use: `Use ${item.title} for per-client API rate limits, outbound call shaping to a third party, or any place a real client is legitimately bursty but the long-run rate must stay bounded.`,
      pair: "Pair it with the Effect Sliding Window Rate Limit when you need a request-count-per-window guarantee instead of a rate, and with the Effect Adaptive Concurrency Limit to cap in-flight work as well as arrival rate.",
      avoid:
        "Avoid a fixed-window counter for the same job (it leaks 2x at the boundary) and size capacity honestly: a bucket larger than your backend can absorb just moves the spike downstream.",
    };
  }

  if (item.name === "effect-saga-payment-orchestrator") {
    return {
      style:
        "Undo in reverse of do: each forward step registers its compensation, a failure rolls back exactly the steps that succeeded, and a compensation that itself fails is surfaced, not swallowed.",
      use: `Use ${item.title} for multi-step workflows across services that cannot share a transaction (book, charge, notify) where a partial failure must leave no money charged and no resource half-reserved.`,
      pair: "Pair it with the Effect Two-Phase Commit for the short atomic variant and with the Effect Idempotency Key Store so a retried forward step or compensation runs once.",
      avoid:
        "Avoid it when a real distributed transaction is available (use it) and avoid compensations that are not truly inverse: a refund that can fail needs the CompensationFailed path wired to a human or a retry queue.",
    };
  }

  if (item.name === "effect-mvcc-snapshot-isolation") {
    return {
      style:
        "Versions instead of locks on the read path: a transaction reads the snapshot it began with while writers append, and first-committer-wins turns a silent lost update into a typed conflict.",
      use: `Use ${item.title} to model or reason about snapshot-isolation semantics, to build an in-memory store with non-blocking reads, or to demonstrate exactly which anomalies snapshot isolation does and does not prevent.`,
      pair: "Pair it with the Effect Optimistic Lock with Retry for the single-row version-column case and with the Effect Event-Sourced Aggregate when you want the full history, not just the latest versions.",
      avoid:
        "Avoid it where your database already provides snapshot isolation (do not reimplement the engine) and remember it does not stop write skew: that needs serializable isolation or an explicit predicate lock.",
    };
  }

  if (item.name === "effect-event-sourced-aggregate") {
    return {
      style:
        "The log is the truth and state is a fold: every fact is retained, any past state is a prefix fold away, and compare-and-append stops two commands from overwriting each other's history.",
      use: `Use ${item.title} where the audit trail and the ability to replay matter (ledgers, workflows, anything disputed) and current state is better derived from events than stored as a mutable row.`,
      pair: "Pair it with the Effect MVCC Snapshot Isolation for read models over the same data and with the Effect Outbox Replicator to publish each new event to downstream consumers exactly once.",
      avoid:
        "Avoid it for simple CRUD where the history is never read (the fold is pure overhead) and plan for snapshots once streams grow long, so a fold does not replay millions of events on every load.",
    };
  }

  if (item.name === "effect-leader-lease-election") {
    return {
      style:
        "Leadership that expires and fences: a lease lapses if a dead leader stops renewing, and a monotonic fencing token means a frozen leader that thaws cannot write behind the new one's back.",
      use: `Use ${item.title} for singleton work in a cluster (one scheduler, one compactor, one migration runner) where exactly one node must act and a crash must hand the role over without a human.`,
      pair: "Pair it with the Effect Heartbeat Failure Detector to shorten the time a dead leader's lease is honored and with any fenced resource so the token actually gates writes, not just the election.",
      avoid:
        "Avoid leader election when the work is safely idempotent across nodes (you may not need a singleton at all) and never grant authority without the fencing token: the lease alone does not stop split-brain writes.",
    };
  }

  if (item.name === "effect-vector-clock-causality") {
    return {
      style:
        "Order by what was observed, not by a clock: happened-before is a fact about causality, and genuinely concurrent edits are detected as concurrent so a real change is never silently ranked away.",
      use: `Use ${item.title} in multi-writer replication, collaborative editing, or offline-sync where you must distinguish a true update from a concurrent conflict that needs merging.`,
      pair: "Pair it with the Effect CRDT Counter Merge when the conflict has a lattice merge and with the Effect Gossip Dissemination to actually propagate the stamped updates between replicas.",
      avoid:
        "Avoid vector clocks when a single writer or a total order already exists (a scalar version suffices) and watch the per-node entry growth: prune or cap the clock as the participant set changes.",
    };
  }

  if (item.name === "effect-lsm-memtable-compaction") {
    return {
      style:
        "Writes become sequential appends, reads stop at the newest version, and compaction reclaims the garbage: a delete is a tombstone that masks, never a gap that resurrects.",
      use: `Use ${item.title} to understand or model an LSM storage engine (the shape behind RocksDB, Cassandra, and many time-series stores) or to build a write-optimized in-memory index with tombstone deletes.`,
      pair: "Pair it with the Effect WAL Crash Recovery for durability of the memtable before it flushes and with the Effect Merkle Anti-Entropy Sync to reconcile SSTables across replicas.",
      avoid:
        "Avoid an LSM for read-mostly point-lookup workloads that a B-tree serves with fewer seeks, and schedule compaction: unbounded segment growth turns every read into a march through stale versions.",
    };
  }

  if (item.name === "effect-wal-crash-recovery") {
    return {
      style:
        "Log before you write, checkpoint to bound replay: recovery redoes committed transactions, discards uncommitted ones, and starts from the last durable page image instead of the beginning of time.",
      use: `Use ${item.title} to reason about durability and atomicity in a storage layer, or as the recovery model behind the Effect Write-Behind Cache and Effect LSM Memtable Compaction memtables.`,
      pair: "Pair it with the Effect LSM Memtable Compaction (the WAL protects the memtable) and with the Effect Event-Sourced Aggregate, whose append-only log is the same idea at the domain level.",
      avoid:
        "Avoid a WAL where the store is already durable and transactional (you would be logging a log) and never let the log grow without checkpoints: replay time and disk both scale with the un-checkpointed suffix.",
    };
  }

  if (item.name === "effect-fair-priority-scheduler") {
    return {
      style:
        "A real heap with a stable tiebreak and aging: highest priority first, FIFO among equals, and a waiting job's rank climbs until even the lowest tier runs, so nothing starves.",
      use: `Use ${item.title} for job queues and task schedulers where priorities are real but the low tier must still make progress (background jobs behind interactive work, cheap tasks behind expensive ones).`,
      pair: "Pair it with the Effect Fair Connection Pool when scheduled jobs contend for a scarce resource and with the Effect Adaptive Concurrency Limit to bound how many run at once.",
      avoid:
        "Avoid aging when strict priority is actually required (real-time deadlines) and avoid a sorted array masquerading as a heap: it is O(n) per insert and its tie order is whatever the sort happens to do.",
    };
  }

  if (item.name === "effect-merkle-anti-entropy") {
    return {
      style:
        "Compare hashes, not rows: equal roots prove equal contents, and a diff descends only into subtrees that disagree, so the bytes moved track the number of differences, not the dataset size.",
      use: `Use ${item.title} to reconcile replicas, verify a synced dataset, or detect drift between two copies of a large keyspace where shipping everything or comparing key-by-key is too expensive.`,
      pair: "Pair it with the Effect Gossip Dissemination to spread the repairs the diff identifies and with the Effect CRDT Counter Merge or vector clocks to decide which side wins a differing key.",
      avoid:
        "Avoid rebuilding the whole tree on every tiny change (maintain it incrementally at scale) and remember the tree finds which keys differ, not how to merge them: pair it with a conflict rule.",
    };
  }

  if (item.name === "effect-connection-pool-fair") {
    return {
      style:
        "Bounded connections, FIFO waiting, fast-fail under saturation: surplus demand queues in arrival order and a stuck caller times out with a typed error instead of hanging on a dead borrow.",
      use: `Use ${item.title} in front of any scarce, expensive-to-open resource (database connections, upstream sockets, licensed handles) where unbounded opening would exhaust the far side.`,
      pair: "Pair it with the Effect Adaptive Concurrency Limit to size the pool to live downstream capacity and with the Effect Fair Priority Scheduler when borrowers should not all be equal.",
      avoid:
        "Avoid a pool for cheap, unlimited resources (it only adds a queue) and never leave the acquire wait unbounded: a pool with no acquire timeout converts backpressure into a silent hang.",
    };
  }

  if (item.name === "effect-gossip-dissemination") {
    return {
      style:
        "Epidemic spread with convergent merges: each node tells a few random peers, updates reach everyone in logarithmic rounds, and version-vector maxima make re-exchange idempotent so the cluster reaches a fixed point.",
      use: `Use ${item.title} for cluster membership, config fan-out, or presence where a central broadcaster would be a bottleneck and a single point of failure, and eventual consistency is acceptable.`,
      pair: "Pair it with the Effect Heartbeat Failure Detector (gossip the health signals) and with the Effect Merkle Anti-Entropy Sync to reconcile whatever gossip has not yet converged.",
      avoid:
        "Avoid gossip when you need immediate, strongly-consistent propagation (use a coordinator or consensus) and tune fanout and interval: too low is slow, too high just floods the network.",
    };
  }

  if (item.name === "effect-dataloader-batch") {
    return {
      style:
        "Collect within a tick, dedupe, scatter back: N per-item fetches become one batched query, identical keys share a fetch, and every caller still gets its own value.",
      use: `Use ${item.title} to kill N+1 query storms in GraphQL resolvers, ORM associations, or any per-item fetch that runs inside a loop or a fan-out render.`,
      pair: "Pair it with the Effect Segmented LRU Cache to memoize across ticks and with the Effect CDN Origin Shield when the batched fetch itself is an expensive shared upstream call.",
      avoid:
        "Avoid it when calls are naturally already batched or genuinely independent across ticks (the microtask flush adds latency for no dedupe), and give it a stable key so dedup actually collapses duplicates.",
    };
  }

  if (item.name === "effect-adaptive-concurrency-limit") {
    return {
      style:
        "AIMD borrowed from TCP: additive-increase while healthy, multiplicative-decrease on a latency spike, so the limit converges on whatever the downstream can serve right now instead of a guessed constant.",
      use: `Use ${item.title} in front of a downstream whose capacity varies (a shared database, a third-party API, an autoscaling service) where any fixed concurrency cap is wrong at some point in the day.`,
      pair: "Pair it with the Effect Fair Connection Pool to enforce the discovered limit and with the Effect Weighted Load Balancer to spread the admitted work across healthy backends.",
      avoid:
        "Avoid it when the safe limit is genuinely fixed and known (a hard connection cap) and clamp the range: an unbounded control loop can oscillate or starve, so min and max are not optional.",
    };
  }

  if (item.name === "effect-crdt-counter-merge") {
    return {
      style:
        "Per-replica slots, summed, merged by max: each node only increments its own slot, so partitioned increments all survive and re-delivered or reordered merges are provably harmless.",
      use: `Use ${item.title} for distributed counters that must not lose increments under partition (likes, views, inventory reservations across regions) where coordination on every increment is too costly.`,
      pair: "Pair it with the Effect Gossip Dissemination to propagate replica states and with the Effect Vector Clock Causality when the payload is more than a count and conflicts need causal ordering.",
      avoid:
        "Avoid a G-Counter when you also need to decrement (reach for a PN-Counter) and remember slots grow with the replica set: bound or reap retired replica ids so the state does not accrete forever.",
    };
  }

  if (item.name === "effect-sliding-window-rate-limit") {
    return {
      style:
        "The boundary burst closed with O(1) state: current and previous window counts, the previous one weighted by its remaining overlap, so no grid to game and no per-request timestamp to store.",
      use: `Use ${item.title} for per-client request-count limits where a fixed window's 2x boundary leak is unacceptable and a full request log's memory cost is a denial-of-service vector.`,
      pair: "Pair it with the Effect Token Bucket Shaper when you want a rate with a burst allowance instead of a count and with the Effect Cache Penetration Shield to bound distinct-key probing per client.",
      avoid:
        "Avoid a fixed-window counter for the same guarantee (it leaks at the boundary) and note the counter is an approximation: for exact per-request accounting you need the full log and its memory.",
    };
  }

  if (item.name === "effect-scatter-gather-quorum") {
    return {
      style:
        "Return on enough, not on all: a completeness threshold answers on the k-th fastest shard, a timeout degrades to a partial result rather than hanging, and stragglers are interrupted so no fiber leaks.",
      use: `Use ${item.title} for fan-out reads across shards or replicas (search, multi-region lookups, redundant sources) where one slow member should not dictate the whole request's latency.`,
      pair: "Pair it with the Effect Quorum Reads with Read Repair when the quorum must also be consistent and with the Effect Weighted Load Balancer to pick which replicas to scatter to.",
      avoid:
        "Avoid a quorum when every shard's answer is required for correctness (partial results would be wrong) and size the quorum against your replication factor so a normal failure still meets it.",
    };
  }

  if (item.name === "effect-chunked-upload-integrity") {
    return {
      style:
        "Verify at the chunk and at the whole: a per-chunk checksum rejects corruption at the boundary for re-send, resume ships only the missing chunks, and a final object digest is the last line of defense.",
      use: `Use ${item.title} for large-file upload endpoints and object stores where a flaky network can corrupt or truncate a transfer and re-uploading the whole file after a drop is unacceptable.`,
      pair: "Pair it with the Effect Multipart Upload Resume flow for the client side and with the Effect Idempotency Key Store so a retried finalize request completes the object exactly once.",
      avoid:
        "Avoid the ceremony for small payloads a single request delivers atomically, and pick a real content hash (SHA-256) in production: the demo's FNV digest teaches the mechanism, not collision resistance.",
    };
  }

  if (item.name === "effect-bloom-url-frontier") {
    return {
      style:
        "Memory as a chosen formula instead of a growing set, and the error budget deliberately parked on the safe side: skips cost a page, loops are impossible.",
      use: `Use ${item.title} for crawl frontiers, seen-item suppression, and any have-I-processed-this check at a scale where the exact set is the biggest object in the process.`,
      pair: "Pair it with the Effect Shard Router with Backpressure to spread fetches across workers, and check robots and politeness budgets after the filter, so a skipped URL never even costs a lookup.",
      avoid:
        "Avoid it where a miss is unacceptable (payments dedupe belongs in the Effect Idempotency Key Store, which is exact) and avoid filling past the sized capacity: the false-positive rate climbs steeply beyond it, and a bloom filter cannot delete.",
    };
  }

  if (item.name === "effect-password-hash-vault") {
    return {
      style:
        "Every record self-describing, every comparison constant-time, every failure identical from the outside. The parameters live in the row, so policy upgrades are data migrations that happen one login at a time.",
      use: `Use ${item.title} wherever you store first-party credentials and cannot hand the problem to an identity provider, and as the reference for the rehash-on-login upgrade loop if you already have a table of aging hashes.`,
      pair: "Pair it with the Better Auth entries if you want sessions and flows around it, and with a rate limit on the login route, because scrypt slows offline cracking, not online guessing.",
      avoid:
        "Avoid inventing reasons to read the plaintext outside login (the upgrade window exists because there is exactly one), and avoid distinguishable unknown-user and wrong-password responses anywhere in the stack, including timing and copy.",
    };
  }

  if (item.name === "effect-quorum-read-repair") {
    return {
      style:
        "Consistency as overlap arithmetic: R + W > N is the whole theorem, versions are monotonic, and healing is an active side effect of reading, not a cron job you hope runs.",
      use: `Use ${item.title} when you replicate state across nodes yourself (session stores, config fan-out, presence) and need reads that cannot return yesterday, plus divergence that shrinks on contact.`,
      pair: "Pair it with the Effect Heartbeat Failure Detector to know which replicas are genuinely down versus slow, and with the Effect Fencing Token and Hybrid Clock if multiple writers can race on one key.",
      avoid:
        "Avoid it in front of a database that already gives you quorum semantics, where it duplicates the engine's job, and avoid W=1 configurations: the arithmetic only protects you when write sets actually overlap read sets.",
    };
  }

  if (item.name === "effect-optimistic-lock-retry") {
    return {
      style:
        "Charge the losers, not everyone: no lock on the read path, one conditional write, and the conflict is a typed value carrying both versions, so the caller can retry, merge, or surrender explicitly.",
      use: `Use ${item.title} for read-modify-write on rows where conflicts are the exception: user settings, inventory decrements, document saves, anything currently protected by nothing at all (check the demo's lost-update count).`,
      pair: "Pair it with the PG Advisory Lock entry for the opposite regime (long transactions, likely conflicts, pessimistic is right) and with the Effect Hot Account Ledger when one row is so hot that retries would exhaust constantly.",
      avoid:
        "Avoid computing side effects inside the retry loop (the computation may run several times, only the CAS is once) and avoid unbounded retries: exhaustion is a signal the row needs the pessimistic path or subdivision, not more attempts.",
    };
  }

  if (item.name === "effect-deadlock-detector") {
    return {
      style:
        "The wait-for graph maintained where waits are decided, so detection is a lookup, not a periodic sweep, and the victim is chosen before anyone has waited a millisecond on a doomed cycle.",
      use: `Use ${item.title} for in-process lock managers over named resources (per-account locks, per-document locks, job claims) where callers take multiple locks and you cannot force every code path into one ordering.`,
      pair: "Pair it with fixed resource ordering wherever you CAN enforce it (the demo shows it committing 10 of 10 with zero victims) and map DeadlockVictim to a retry-with-ordering fallback at the call site.",
      avoid:
        "Avoid it for locks your database already arbitrates (Postgres detects its own deadlocks; do not double-manage) and avoid holding locks across network calls, which turns every slow dependency into a suspected cycle.",
    };
  }

  if (item.name === "effect-geohash-proximity") {
    return {
      style:
        "The grid proposes, the circle disposes: cells are only a candidate generator, so correctness never depends on cell shape, and the boundary problem is handled by construction rather than by hoping prefixes match.",
      use: `Use ${item.title} for store locators, delivery zones, nearby-driver matching, any radius query that is currently a full-table distance scan, at precisions you pick per use case (6 chars is city-block grade).`,
      pair: "Pair it with a persistent index (the cell string is a perfect database index key: WHERE geohash LIKE 'dr5rs%') and with the Effect Consistent Hash Ring if the index itself must shard across nodes.",
      avoid:
        "Avoid radius queries much larger than the cell size without dropping precision first (candidates approach a full scan) and avoid uniform-grid assumptions where density is extreme: downtown needs finer cells than the ocean, which is the quadtree's argument.",
    };
  }

  if (item.name === "cloudflare-workflow-saga-rollback") {
    return {
      style:
        "Durable execution shaped like a ledger. Each step declares its own undo next to its do, so the failure path is readable in the same place as the happy path.",
      use: `Use ${item.title} for multi-step provisioning, billing, or fulfilment flows on Cloudflare Workflows where a partial failure must leave no orphaned side effects.`,
      pair: "Pair it with the Cloudflare Worker Test Harness entry, whose introspectWorkflow() can disable sleeps and force step errors so the rollback chain is actually exercised in CI.",
      avoid:
        "Avoid it for read-only pipelines, for steps whose side effects are already idempotent writes to your own storage, and for anything that needs cron-triggered instances today, since the Workflow binding schedule field is config-only groundwork.",
    };
  }

  if (item.name === "cloudflare-worker-test-harness") {
    return {
      style:
        "Black-box tests against the real build. No test seams in the Worker, no injected clock, no debug endpoints, with storage reached from outside when an assertion needs it.",
      use: `Use ${item.title} for integration-testing a Cloudflare Worker with Durable Objects, D1, or Workflows from an ordinary Node, Vitest, or Jest process.`,
      pair: "Pair it with MSW or any globalThis.fetch interceptor, which works here because the test process is a normal Node process, and with the Cloudflare Workflow Saga Rollback entry as the system under test.",
      avoid:
        "Avoid it for unit tests of pure functions, where it is far too heavy, and for pinning to a Wrangler older than 4.112.0, since the Durable Object methods used here arrived across 4.99.0 through 4.112.0.",
    };
  }

  if (item.name === "cloudflare-worker-cache-tags") {
    return {
      style:
        "Cache as configuration plus two headers. The Worker emits Cache-Control and Cache-Tag on the read path and purges tags on the write path, and nothing else.",
      use: `Use ${item.title} for read-heavy Cloudflare Worker APIs backed by content that changes on a known event, such as a catalog, a CMS, or a pricing feed.`,
      pair: "Pair it with a Queue consumer for batched invalidation and with KV or R2 as the origin store, since both give you a clear write moment to hang the purge on.",
      avoid:
        "Avoid it for per-user or authenticated responses, which bypass the cache anyway, for anything needing read-after-write consistency, since tag purge is eventually consistent, and for the old caches.default Cache API pattern, which this replaces rather than extends.",
    };
  }

  if (item.name === "drizzle-pg-jit-query-layer") {
    return {
      style:
        "Three files that separate table shape, relation graph, and read paths, so a query module never redefines a join that belongs in the schema.",
      use: `Use Drizzle Postgres JIT Query Layer for a Postgres data layer on drizzle-orm 1.0 rc where hot reads should be prepared once at module scope and relation filters should live in one place.`,
      pair: "Pair it with Drizzle Kit Migration Gate so the schema in these files and the committed migrations cannot drift.",
      avoid:
        "Avoid jit: true in short-lived processes such as migration scripts, serverless one-shot handlers, and tests, where the first-prepare compile cost is never amortised.",
    };
  }

  if (item.name === "drizzle-kit-migration-gate") {
    return {
      style:
        "An approval ledger plus two exhaustive switches over the drizzle-kit JSON envelope, so every status the SDK can return is handled explicitly rather than falling through.",
      use: `Use Drizzle Kit Migration Gate for CI and deploy pipelines that must run drizzle-kit without a TTY and must refuse destructive schema changes that no human approved in a pull request.`,
      pair: "Pair it with Drizzle Postgres JIT Query Layer, whose schema file is the input this gate diffs against.",
      avoid:
        "Avoid passing force: true to push alongside this gate; force approves every destructive change in the diff and defeats the entire ledger.",
    };
  }

  if (item.name === "drizzle-effect-pg-repository") {
    return {
      style:
        "A Context.Service interface with a Layer.effect implementation, where every method's error channel is closed to tagged domain errors before it leaves the file.",
      use: `Use Drizzle Effect Postgres Repository for an Effect v4 application that needs typed Postgres access without wrapping every query in tryPromise and without leaking driver errors into business logic.`,
      pair: "Pair it with Effect Cloudflare Event API, which uses the same Context.Service and tagged-error conventions at the HTTP boundary.",
      avoid:
        "Avoid returning the raw builder from a repository method; the EffectDrizzleQueryError then escapes into every caller's error union and the seam stops being a seam.",
    };
  }

  if (item.name === "effect-durable-workflow-queue") {
    return {
      style:
        "Replay-aware backend architecture where every side effect sits behind an activity checkpoint and long waits are expressed as durable suspensions rather than held connections.",
      use: `Use ${item.title} for a multi-step backend process that must survive restarts, deduplicate retried requests by idempotency key, and park for minutes or days while an external system settles.`,
      pair: "Pair it with PersistedQueue.layerStoreSql or layerStoreRedis instead of the memory store, a cluster-backed WorkflowEngine once more than one process runs workflows, and an HTTP boundary that returns the execution id and polls it.",
      avoid:
        "Avoid it for a request that completes inside one handler, because the engine, persistence, and worker layers add real operational surface for no durability benefit.",
    };
  }

  if (item.name === "effect-workflow-v4-migration") {
    return {
      style:
        "Annotated before-and-after reference code that keeps the old spelling next to the new one at each call site instead of in a separate prose guide.",
      use: `Use ${item.title} for porting an existing Effect 3 durable workflow onto Effect 4, or for reading the exact shape of the breaks before committing to the upgrade.`,
      pair: "Pair it with the effect CHANGELOG entries it cites, a typecheck run against the target beta, and a staged rollout that ports one workflow before the rest of the service.",
      avoid:
        "Avoid it as a starting point for a new Effect 4 project, since the v3 annotations are dead weight when there is nothing to migrate from.",
    };
  }

  if (item.name === "elysia-plugin-scope-model") {
    return {
      style:
        "Migration-shaped reference code. Every breaking rename is stated as a before and after pair in a comment directly above the line that demonstrates it, so the file doubles as a diff you can read top to bottom.",
      use: `Use ${item.title} for porting an Elysia 1.4 app to the 2.0 line, or for getting plugin auth, lifecycle scope, and v2 macros right the first time on a new 2.0 service.`,
      pair: "Pair with Elysia 2 Standard Schema Guard for the validation half of the same migration, and with Elysia 2 AOT Build Manifest once the app compiles and you want it to boot fast.",
      avoid:
        "Avoid on Elysia 1.4 and earlier: every method name here is the renamed 2.0 spelling and none of it compiles against 1.4. Avoid reaching for 'global' scope by default, it promotes hooks into every ancestor instance and is rarely what an auth plugin wants.",
    };
  }

  if (item.name === "elysia-aot-build-manifest") {
    return {
      style:
        "A build script, not an app. Dense option-by-option commentary with the measured bundle numbers stated inline rather than claimed in the abstract.",
      use: `Use ${item.title} for cutting Elysia cold start and bundle size by moving route compilation into the bundler, and for producing a Cloudflare Workers manifest from a Bun build.`,
      pair: "Pair with Elysia 2 Plugin Scope Model, which is the kind of app this build script consumes as its entry.",
      avoid:
        "Avoid in dev: keep runtime JIT while iterating, the Vite plugin already gates itself to build only. Avoid strip true until the app is route-complete, since a route still reaching handler JIT turns the build into a hard failure by design.",
    };
  }

  if (item.name === "elysia-standard-schema-guard") {
    return {
      style:
        "Two validator libraries deliberately side by side in one route table, with the choice between them justified per channel rather than left to taste.",
      use: `Use ${item.title} for wiring Zod, Valibot, or ArkType schemas into Elysia 2.0 without an adapter, and for surviving the @sinclair/typebox to typebox v1 dependency swap.`,
      pair: "Pair with Elysia 2 Plugin Scope Model for the lifecycle half of a 2.0 migration.",
      avoid:
        "Avoid putting a Standard Schema on params or query when you want Elysia's numeric and boolean path coercion, since it only applies to TypeBox. Avoid keeping @sinclair/typebox in package.json after upgrading, two resident copies produce validators that reject valid input.",
    };
  }

  if (item.name === "rivet-durable-workflow-actor") {
    return {
      style:
        "Terse orchestration code: a deterministic outer workflow that reads as a list of named checkpoints, with every mutation pushed down into a step callback. Comments explain only the version-sensitive lines.",
      use: `Use Rivet Durable Workflow Actor for long-running, restart-safe processes that own their own state: order fulfilment, onboarding sequences, payment retries, anything that must survive a deploy mid-flight.`,
      pair: "Pair with a Hono route that mounts registry.handler, and with rivetkit/db or rivetkit/db/drizzle when a step needs per-actor SQLite rather than plain actor state.",
      avoid:
        "Avoid on rivetkit below 2.3.3: the split context landed in 2.3.1 and getVersion in 2.3.3, so neither compiles on 2.2.x. Avoid reaching for state, db or client from the outer workflow context; that is exactly what 2.3.1 made illegal, and it is illegal because replay would diverge.",
    };
  }

  if (item.name === "rivet-dynamic-actor-registry") {
    return {
      style:
        "Two-layer registry: a plain actor that stores editable source with a revision counter, and a bodyless dynamic actor that loads that source per key. Resource limits are stated inline, not buried in config.",
      use: `Use Rivet Dynamic Actor Registry for multi-tenant platforms where each customer supplies their own automation, plugin or agent code and it must run isolated from every other tenant.`,
      pair: "Pair with a Hono server that mounts registry.handler, and with an editor surface that posts new source through the source actor so the next actor start picks it up.",
      avoid:
        "Avoid on rivetkit below 2.3.0: rivetkit/dynamic did not exist. Avoid treating the action() generics as validation; they are an assertion about source you did not write, so keep memoryLimit and cpuTimeLimitMs set and treat every return value as untrusted.",
    };
  }

  if (item.name === "sveltekit-live-query-stream") {
    return {
      style:
        "Server-side streaming module. No markup, no styling surface: the whole artifact is one *.remote.ts file whose shape is a generator plus a command.",
      use: `Use SvelteKit Live Query Stream for pushing server state to connected clients without hand-rolling an SSE endpoint: build progress, job queues, presence, log tails, anything where the server knows first.`,
      pair: "Pair with SvelteKit Batched Query Refresh for the request-response half of the same app, and with SvelteKit Explicit Env Vars to validate the broker URL you swap the in-process Map for.",
      avoid:
        "Avoid on serverless platforms that cap response duration, and avoid the in-process hub across more than one instance: it does not fan out. Avoid entirely if you cannot accept an experimental flag, remote functions are not covered by semver at 2.70.1.",
    };
  }

  if (item.name === "sveltekit-explicit-env-vars") {
    return {
      style:
        "Declarative configuration manifest. Reads as one table of variables, each with visibility, staticness, a description and a validator.",
      use: `Use SvelteKit Explicit Env Vars for making configuration a typed, validated, boot-time contract instead of a scatter of prefixed strings read at the point of use.`,
      pair: "Pair with either SvelteKit remote function entry, both of which read secrets that belong in this manifest rather than in process.env.",
      avoid:
        "Avoid mixing it with $env/static and $env/dynamic imports in the same app, pick one system. Avoid static: true for anything that differs between build and run, the value is inlined into the bundle.",
    };
  }

  if (item.name === "sveltekit-batched-query-refresh") {
    return {
      style:
        "Data-access module. Three exports (batched query, remote form, command) that together show the full read, mutate, refresh cycle.",
      use: `Use SvelteKit Batched Query Refresh for killing N+1 query storms on list and grid pages, and for making mutations return their own refreshed data in one round trip.`,
      pair: "Pair with SvelteKit Live Query Stream when part of the same data is server-pushed, and with SvelteKit Explicit Env Vars for the database URL.",
      avoid:
        "Avoid the in-memory Map stand-in in production, it is there so the file runs; replace both helpers with real queries. Avoid raising the requested() limit to cover a page that renders hundreds of instances, cap the page instead.",
    };
  }

  if (item.name === "d1-session-read-replica") {
    return {
      style:
        "One string threaded through a redirect. The consistency decision lives in a single session module with a commit step, so no handler is left choosing a constraint on its own.",
      use: `Use ${item.title} on a Cloudflare Worker with D1 read replication enabled, where a user writes and is then shown a page that must include what they just wrote.`,
      pair: "Pair it with the Cloudflare Worker Test Harness entry, whose D1 access can assert the bookmark actually round-trips, and keep it clear of the Cache Tags entry, since a bookmarked response carries Set-Cookie and is not shareable.",
      avoid:
        "Avoid it on databases without read replication turned on, where every query already runs on the primary and this only adds a cookie, and avoid anchoring a public or cacheable route to a visitor's bookmark, which pins a shared page to one user's write.",
    };
  }

  if (item.name === "durable-object-websocket-hibernation") {
    return {
      style:
        "The socket is the storage. Nothing per-connection lives on the instance, so the code reads the same on a warm object and on one that was reconstructed a millisecond ago.",
      use: `Use ${item.title} for chat, presence, collaborative cursors, or live dashboards on Durable Objects, where connections are long-lived and mostly idle and duration billing, not message volume, is the cost.`,
      pair: "Pair it with the Cloudflare Worker Test Harness entry, whose evictDurableObject() is the only cheap way to prove the broadcast path survives a wake, since the bug it prevents is invisible until an eviction happens.",
      avoid:
        "Avoid it when every connection is short and busy, where hibernation never triggers and ws.accept() is simpler. Avoid attaching anything large or growing: attachments cap at 16,384 bytes and are lost when the connection closes, so message history belongs in storage. Avoid planning to retag a connection, since tags are fixed at acceptWebSocket() and only readable afterwards.",
    };
  }

  if (item.name === "durable-object-sql-tenant-db") {
    return {
      style:
        "A database and the code that owns it in the same object, where the schema, the migration state, and the recovery procedure are all things this one file can see.",
      use: `Use ${item.title} for per-tenant, per-room, or per-document data on Durable Objects, where the working set is bounded, reads are frequent, and isolation should be structural rather than a WHERE clause everyone has to remember.`,
      pair: "Pair it with Durable Object WebSocket Hibernation when the same object also serves live connections, and with Cloudflare Worker Test Harness, whose eviction helper is how you prove the migration path is correct on a cold start.",
      avoid:
        "Avoid it for data that must be queried across tenants, since there is no join that reaches another object and a fan out is not a reporting engine. Avoid holding a cursor across another sql.exec, which invalidates it. Avoid expecting to test point-in-time recovery locally, where there is no durable change log to restore from.",
    };
  }

  if (item.name === "worker-rpc-promise-pipelining") {
    return {
      style:
        "An object-shaped service boundary, where a call returns something you keep talking to rather than a payload you reassemble.",
      use: `Use ${item.title} for Worker-to-Worker calls behind a service binding, especially where an aggregate endpoint exists only because three round trips were too expensive to make.`,
      pair: "Pair it with Durable Object SQL Tenant Database, whose objects are reached through the same RPC surface, and with authentication at the outermost Worker, since a service binding is trusted by construction.",
      avoid:
        "Avoid defining an exposed method as a class property arrow function, which is not on the prototype and is therefore not callable over RPC. Avoid awaiting each intermediate stub, which spends a round trip per hop and gives back exactly what pipelining removed. Avoid stashing a stub in module scope, since it dies with the request that created it.",
    };
  }

  if (item.name === "durable-object-alarm-scheduler") {
    return {
      style:
        "A queue and its timer in the same object, where the single-alarm constraint is designed around rather than worked around.",
      use: `Use ${item.title} for per-user or per-entity scheduled work such as trial reminders, dunning retries, digests, and session expiry, where the schedule is naturally addressed by an id.`,
      pair: "Pair it with Durable Object SQL Tenant Database when the entity already has an object holding its state, and with an idempotency key the receiving endpoint honours, since alarm handlers retry.",
      avoid:
        "Avoid calling setAlarm for a second task and expecting both to fire, because it overwrites. Avoid a non-idempotent side effect in the handler. Avoid one object for a whole tenant's schedule when that tenant is hot, since a single object is a single writer and the sharding decision has to be made at naming time.",
    };
  }

  if (item.name === "fluid-stream-lifecycle") {
    return {
      style:
        "A streaming handler that is mostly lifecycle, because on a shared instance the disconnect path and the backpressure path are the parts that fail.",
      use: `Use ${item.title} for long-running server-sent events on Vercel Fluid, such as model output, build logs, or progress for a job that takes minutes.`,
      pair: "Pair it with Fluid Compute Instance Safety, whose request-scoping rules apply to every concurrent stream on the instance, and with Vercel Queue Consumer Groups for any post-stream work that must not be lost, which waitUntil cannot promise.",
      avoid:
        "Avoid running CPU-bound work inside the handler, which now stalls every other request sharing the event loop rather than only this one. Avoid enqueueing without checking desiredSize, which buffers unboundedly for a client that stopped reading. Avoid counting client aborts as errors, and avoid setting maxDuration higher than the longest legitimate stream.",
    };
  }

  if (item.name === "vercel-queue-consumer-groups") {
    return {
      style:
        "Two files that argue with the obvious way to write them. The publish ordering and the consumer group count are both load-bearing, so both are documented where they break rather than in a README nobody opens.",
      use: `Use ${item.title} for push mode Vercel Queues consumers where a message references a row your handler has to read back, or where a failing message must stop rather than retry for its full retention window.`,
      pair: "Pair it with a reconciliation sweep over rows whose publish failed after commit, and with Fluid Compute Instance Safety, which routes here everything that waitUntil cannot be trusted to finish.",
      avoid:
        "Avoid it where you need strict ordering, since there is no FIFO guarantee even at max concurrency 1 and retried messages are deprioritized below new ones. Avoid adding a second trigger on the same topic to increase throughput, which fans out instead of load balancing. Avoid treating queue/v2beta as stable: Queues is public beta, not GA.",
    };
  }

  if (item.name === "fluid-compute-instance-safety") {
    return {
      style:
        "Two small files carrying a large amount of verified execution-model detail, where the broken pattern is written out in full next to the fix because the bug is invisible in code review otherwise.",
      use: `Use ${item.title} for any Node.js Vercel Function on Fluid compute, especially a codebase written before April 2025 that was never audited for module-scope request state after Fluid became the default.`,
      pair: "Pair it with Vercel Queue Consumer Groups, which is where every piece of background work that must not be lost belongs once waitUntil is off the table.",
      avoid:
        "Avoid reaching for AsyncLocalStorage where an explicit parameter would do, since the type checker enforces a parameter and enforces nothing here, and avoid keeping a process.exit() in an uncaughtException handler, which now kills other users' in-flight requests instead of just its own.",
    };
  }

  if (item.name === "prisma-driver-adapter-runtime") {
    return {
      style:
        "Two clients and one config, where every pool setting is written down rather than inherited, because the defaults changed underneath you and nothing announces it at runtime.",
      use: `Use ${item.title} for any Prisma 7 upgrade, and for services that run a long-lived Node process and an edge handler against the same schema.`,
      pair: "Pair it with Prisma Client Extension Audit Trail, which extends the client this file constructs, and with Postgres Advisory Lock and Keyset Scan when a job needs the raw pg connection underneath.",
      avoid:
        "Avoid leaving connectionTimeoutMillis unset on the pg adapter: the driver default of 0 turns pool exhaustion into a hang rather than an error. Avoid the pooled Node client in a serverless handler, where each invocation would build a pool it never drains.",
    };
  }

  if (item.name === "prisma-client-extension-audit") {
    return {
      style:
        "Two extension components with a documented blind spot, where the limits of the interception point are stated as plainly as the behavior.",
      use: `Use ${item.title} for soft deletes and write attribution on Prisma 7, where the $use middleware you would have reached for no longer exists.`,
      pair: "Pair it with Prisma Driver Adapter Runtime, whose base client this extends, and with a database trigger for the nested writes the query component cannot see.",
      avoid:
        "Avoid extending at module scope and binding the actor globally: $extends returns a new client, so a shared one attributes every write to whoever imported it. Avoid trusting it to filter an include of a soft-delete model, which is exactly the nested case that does not fire.",
    };
  }

  if (item.name === "drizzle-cache-tag-invalidation") {
    return {
      style:
        "An explicit cache seam where the eligibility list drives the design, so the queries that cannot be cached are rewritten rather than quietly left stale.",
      use: `Use ${item.title} for read-heavy Drizzle endpoints whose invalidation moments are known, such as a catalog, a leaderboard, or a settings read.`,
      pair: "Pair it with Drizzle Postgres JIT Query Layer for the uncached hot paths, and with Drizzle Kit Migration Gate so a schema change and its cache tags land together.",
      avoid:
        "Avoid caching a view read: it is indexed under zero tables, so no write will ever invalidate it and only the TTL will save you. Avoid assuming a raw db.execute write invalidates anything, since it is neither cached nor treated as a mutation.",
    };
  }

  if (item.name === "neon-http-composable-sql") {
    return {
      style:
        "Conditional filters as lazy sql fragments folded pairwise into one predicate, so every filter combination is one query function and no branch ever touches a SQL string.",
      use: `Use ${item.title} for edge and serverless handlers reading Postgres over the Neon HTTP driver, where list endpoints take optional filters and there is no connection to pool.`,
      pair: "Pair it with the WebSocket Pool export from the same package for anything needing an interactive transaction, and with Postgres Advisory Lock and Keyset Scan for the cursor pagination these list endpoints want.",
      avoid:
        "Avoid interpolating an array of fragments: it binds as a single parameter and fails at the database rather than the call site. Avoid nesting a parameterized sql.query() result, which throws, since it is a whole-query escape hatch and not a fragment.",
    };
  }

  if (item.name === "pg-advisory-lock-keyset-scan") {
    return {
      style:
        "Two plain-SQL primitives with their footguns documented in place, on the driver rather than on an ORM, so nothing here expires with a framework.",
      use: `Use ${item.title} for cron workers that must not run twice concurrently, and for list endpoints whose pagination has to stay correct while rows are being inserted.`,
      pair: "Pair it with Prisma Driver Adapter Runtime or Drizzle Postgres JIT Query Layer, both of which sit on a pg pool this can borrow a client from.",
      avoid:
        "Avoid session-level pg_advisory_lock on a pooled connection, where a dropped worker strands the lock until the session ends. Avoid putting a locking function in the target list of a query with LIMIT, which takes locks on rows the LIMIT never returns.",
    };
  }

  if (item.name === "indexeddb-sync-outbox") {
    return {
      style:
        "A drain loop built around the transaction lifetime rather than against it, splitting read, network, and write into separate transactions because the runtime gives no choice.",
      use: `Use ${item.title} for offline-capable clients whose writes must survive a reload and reconcile with a server later.`,
      pair: "Pair it with an idempotency key the server dedupes on, since delivery here is at-least-once, and with a Web Lock if more than one tab may drain concurrently.",
      avoid:
        "Avoid awaiting a fetch inside an IndexedDB transaction: it auto-commits the moment it yields, and the transaction is dead when the request resolves. Avoid stepping a cursor per record where getAll over a key range does the same work in roughly half the time.",
    };
  }

  const style =
    item.category === "Text"
      ? "An editorial, typography-led treatment in which motion controls reading order and emphasis."
      : item.category === "Overlays"
        ? "A viewport-owning, transition-led layer designed to temporarily take focus from the underlying page."
        : item.category === "Layout" || item.section === "pages"
          ? "An image-led composition with strong spatial rhythm and a controlled interactive state change."
          : "A motion-led, interaction-first effect designed to act as the focal behavior of its section.";
  const component = (use: string, pair: string, avoid: string) => ({
    style,
    use: `Use ${item.title} ${use}`,
    pair: `Pair it with ${pair}`,
    avoid: `Avoid it ${avoid}`,
  });
  const name = item.name;

  if (/preloader|loader/.test(name)) {
    return component(
      "for a deliberate first-load or route-entry handoff into a high-impact hero.",
      "the real loading state, the first hero composition, and a direct transition into usable content.",
      "when the page is already fast enough to appear immediately, and never add a fake delay just to show it.",
    );
  }
  if (/transition/.test(name)) {
    return component(
      "between meaningful route or view changes where continuity matters more than instant replacement.",
      "the router lifecycle, stable page backgrounds, and short labels that identify the incoming view.",
      "for small state changes, repeated filters, or navigation where the transition would slow the user's task.",
    );
  }
  if (/footer|contact/.test(name)) {
    return component(
      "as the final brand or conversion moment on a portfolio, studio, campaign, or product page.",
      "a concise CTA, essential contact details, and quieter sections above it so the ending feels earned.",
      "as a generic utility footer or when legal, sitemap, and support links need dense conventional navigation.",
    );
  }
  if (/menu|navbar/.test(name) || item.category === "Overlays") {
    return component(
      "for navigation or focused selection that benefits from temporarily owning the screen.",
      "one clear trigger, an obvious close action, a stable page underneath, and a short navigation set.",
      "for permanent navigation, dense workflows, nested overlays, or flows that must keep the underlying context visible.",
    );
  }
  if (/hero|landing|montage|curtain|slit|aperture/.test(name)) {
    return component(
      "at the top of a campaign, portfolio, launch, or editorial page where the opening reveal sets the visual language.",
      "one strong headline, intentional media, and a simple next action immediately after the reveal.",
      "below the fold, inside dense application screens, or beside another dominant hero animation.",
    );
  }
  if (
    /gallery|slider|carousel|frames|stack|catalog|portfolio|award|mosaic/.test(
      name,
    )
  ) {
    return component(
      "for portfolios, project collections, case studies, or campaign media where browsing the set is part of the experience.",
      "consistent image art direction, concise labels, and simple navigation outside the interactive media area.",
      "for dense data, long copy, or inside another carousel, stack, or interaction-heavy layout.",
    );
  }
  if (
    /scroll|scrub|minimap|timeline|parallax|wave|tunnel|sticky|rotating/.test(
      name,
    )
  ) {
    return component(
      "as a narrative section in a campaign, case study, or editorial page where scroll progress should reveal meaning.",
      "a clear before-and-after section, concise copy, and enough page height for the interaction to breathe.",
      "inside nested scrollers, short utility pages, or flows where users need to jump directly to information.",
    );
  }
  if (/cursor|hover|spotlight|trail|lens|magnetic|material/.test(name)) {
    return component(
      "as a desktop enhancement for project links, media, products, or brand marks that benefit from pointer-led discovery.",
      "a useful default state, a generous pointer target, and equivalent information that remains visible on touch devices.",
      "as the only way to reveal essential content or on touch-first screens where hover has no reliable equivalent.",
    );
  }
  if (/background|fluid|grain|crt|ascii-tv|corridor|shader/.test(name)) {
    return component(
      "as atmosphere behind a focused hero, installation, music, gaming, or experimental editorial section.",
      "minimal foreground copy, strong contrast, and a static fallback that preserves legibility and performance.",
      "behind dense interfaces, long reading surfaces, or when the visual effect competes with the primary task.",
    );
  }
  if (/logo|wordmark|icon/.test(name)) {
    return component(
      "for a brand reveal, campaign signature, or section marker where the identity deserves a brief focal moment.",
      "clear surrounding space, a restrained palette, and static brand usage elsewhere on the page.",
      "for repeated decoration or when the animation makes the mark harder to recognize.",
    );
  }
  if (name === "line-rise-text") {
    return component(
      "for a long-form editorial story whose paragraph rhythm and portrait reveal should unfold with the reader.",
      "generous line spacing, narrow readable measures, one restrained portrait, and static navigation.",
      "for dense documentation or copy that must remain fully scannable without scrolling through the reveal.",
    );
  }
  if (name === "terminal-text-reveal") {
    return component(
      "for technical, archival, or terminal-inspired copy that should resolve progressively as the reader scrolls.",
      "monospaced typography, short lines, high contrast, and a plain-text state that remains readable.",
      "for long prose or when the terminal treatment would weaken the product's visual language.",
    );
  }
  if (item.category === "Text") {
    return component(
      "for a short headline, campaign statement, section introduction, or narrative beat that deserves focused reading.",
      "calm spacing, a restrained image or CTA, and supporting body copy that stays static and easy to scan.",
      "for dense documentation or any context where the message becomes unclear without animation.",
    );
  }
  if (name === "falling-tag-list") {
    return component(
      "for a playful skills, services, topics, or filter list where physical movement adds character without hiding meaning.",
      "short labels, a bounded container, and a static heading that explains what the tags represent.",
      "for primary navigation, required filters, or large taxonomies that need predictable scanning.",
    );
  }

  return component(
    "for a focused campaign or editorial moment where its interaction can own the user's attention.",
    "restrained typography, simple controls, and static sections before and after it so the behavior has room to read.",
    "beside another dominant animation or where essential information would become inaccessible without motion.",
  );
}

export function getRegistryItem(name: string): RegistryItem | undefined {
  return registryItems.find((item) => item.name === name);
}

export function getRegistryItemsBySection(section: LibrarySectionId) {
  return registryItems
    .filter((item) => item.section === section)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getLibrarySection(section: LibrarySectionId) {
  return librarySections.find((item) => item.id === section);
}

/** Renders an llms.txt for one or more sections: title, page URL, install URL, description. */
export function registrySectionsToMarkdown(
  heading: string,
  sections: LibrarySectionId[],
  intro: string,
): string {
  const lines: string[] = [`# ${heading}`, "", intro, ""];

  for (const section of sections) {
    const meta = getLibrarySection(section);
    const items = getRegistryItemsBySection(section);
    if (items.length === 0) continue;
    lines.push("---", "", `## ${meta?.label ?? section}`, "");
    if (meta?.description) lines.push(`_${meta.description}_`, "");
    for (const item of items) {
      lines.push(
        `### ${item.title}`,
        `- Page: ${REGISTRY_BASE_URL}/${item.section}/${item.name}`,
        `- Install: \`npx shadcn@latest add ${registryItemUrl(item.name)}\``,
        `- ${item.description}`,
        "",
      );
    }
  }

  lines.push(
    "---",
    "",
    "Source of truth: `src/lib/registry.ts` in the compronents registry.",
    "",
  );
  return lines.join("\n");
}

export const categoryOrder: ComponentCategory[] = [
  "Buttons",
  "Inputs",
  "Overlays",
  "Feedback",
  "Layout",
  "Animations",
  "Icons",
  "Text",
  "Backend",
];
