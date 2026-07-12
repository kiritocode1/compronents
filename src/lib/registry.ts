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
  | "Text";

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
  type: "registry:ui" | "registry:component";
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

export const registryItems: RegistryItem[] = [
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
    title: "Expanding Rows Gallery",
    description:
      "Rows of project cards wider than the viewport stretch from a tight 125% strip to 500% width as they scroll through view, so the whole grid feels like it zooms past the camera.",
    section: "components",
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
];

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
];
