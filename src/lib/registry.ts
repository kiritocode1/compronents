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
export const REGISTRY_HOMEPAGE = "https://compronents.dev";

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
