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
