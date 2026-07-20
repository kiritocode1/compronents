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
    name: "juan-mora-page",
    title: "Juan Mora Page",
    description:
      "A source-backed design-director portfolio home page ported from a Webflow build. The full Webflow stylesheet ships verbatim (scoped to the component root), while everything Webflow's own IX2/IX3 runtime used to drive is rebuilt on gsap: the intro loader, the hero parallax, the scrubbed shape drift behind the headline, per-word colour scrubs on the service copy, the two-step benefits sequence, the folder and email hover timelines, and Lottie playback. No jQuery or webflow.js ships with the page, and imagery, Lottie JSON, Goga fonts, and the work reels are Blob-hosted.",
    section: "pages",
    category: "Animations",
    pro: true,
    date: "2026-07-21",
    type: "registry:ui",
    dependencies: ["gsap", "@gsap/react", "lottie-web"],
    registryDependencies: [],
    files: [
      {
        path: "src/registry/juan-mora-page/index.tsx",
        target: "components/ui/juan-mora-page/index.tsx",
        type: "registry:ui",
      },
      {
        path: "src/registry/juan-mora-page/styles.ts",
        target: "components/ui/juan-mora-page/styles.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "dither-studio-page",
    title: "Dither Studio Page",
    description:
      "A full-bleed agency homepage: a video hero plate with the headline set bottom-left at a 0.8 line-height, a floating pill nav carrying a rotating greeting, a contact pill and collapsible showreel panel on the right rail, and a status rail pinned to the bottom with a live clock and language toggle. On load a dissolving pixel-dither plate covers the page and is eaten away from its thinnest areas outward while the eyebrow scrambles into place, driven by a single WebGL2 pass over an fbm blob field with a 4x4 Bayer threshold and cursor warping. No media is bundled and there are no runtime dependencies; pass your own footage through props.",
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
        path: "src/registry/dither-studio-page/transition-overlay.tsx",
        target: "components/ui/dither-studio-page/transition-overlay.tsx",
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
