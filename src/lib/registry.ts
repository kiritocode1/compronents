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

const SEARCH_MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const SEARCH_WEEKDAYS: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

const DATE_WORDS = [
  ...Object.keys(SEARCH_MONTHS),
  ...Object.keys(SEARCH_WEEKDAYS),
  "this",
  "last",
  "today",
  "yesterday",
  "day",
  "days",
  "week",
  "weeks",
  "month",
  "months",
  "ago",
];

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = previous;
    }
  }
  return row[right.length];
}

function fuzzyThreshold(word: string) {
  return word.length >= 8 ? 2 : word.length >= 4 ? 1 : 0;
}

function closestWord(word: string, candidates: string[]) {
  let closest = word;
  let distance = fuzzyThreshold(word) + 1;
  for (const candidate of candidates) {
    const next = editDistance(word, candidate);
    if (next < distance) {
      closest = candidate;
      distance = next;
    }
  }
  return closest;
}

function fuzzyDateQuery(query: string) {
  return query.replace(/[a-z]+/g, (word) => closestWord(word, DATE_WORDS));
}

function isoDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoFromDate(date: Date) {
  return isoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function exactDate(date: string | null, phrase: string) {
  return { start: date, end: date, phrase };
}

function searchDate(query: string, now: Date) {
  const ago = query.match(/\b(\d+)\s+(days?|weeks?)\s+ago\b/);
  if (ago) {
    const amount = Number(ago[1]);
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (ago[2].startsWith("day")) {
      date.setDate(date.getDate() - amount);
      return exactDate(isoFromDate(date), ago[0]);
    }

    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) - amount * 7);
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return { start: isoFromDate(date), end: isoFromDate(end), phrase: ago[0] };
  }

  const period = query.match(/\b(this|last)\s+(week|month)\b/);
  if (period) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period[2] === "week") {
      start.setDate(
        start.getDate() -
          ((start.getDay() + 6) % 7) -
          (period[1] === "last" ? 7 : 0),
      );
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        start: isoFromDate(start),
        end: isoFromDate(end),
        phrase: period[0],
      };
    }

    const month = now.getMonth() - (period[1] === "last" ? 1 : 0);
    const monthStart = new Date(now.getFullYear(), month, 1);
    const monthEnd = new Date(now.getFullYear(), month + 1, 0);
    return {
      start: isoFromDate(monthStart),
      end: isoFromDate(monthEnd),
      phrase: period[0],
    };
  }

  const weekday = query.match(
    /\b(this|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
  );
  if (weekday) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(
      date.getDate() -
        ((date.getDay() + 6) % 7) +
        SEARCH_WEEKDAYS[weekday[2]] -
        (weekday[1] === "last" ? 7 : 0),
    );
    return exactDate(isoFromDate(date), weekday[0]);
  }

  const relative = query.match(/\b(today|yesterday|(?:a )?day before)\b/);
  if (relative) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (relative[1] === "today" ? 0 : -1),
    );
    return exactDate(isoFromDate(date), relative[0]);
  }

  const iso = query.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso)
    return exactDate(
      isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3])),
      iso[0],
    );

  const numeric = query.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const rawYear = numeric[3];
    const year = rawYear
      ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear)
      : now.getFullYear();
    return exactDate(
      isoDate(year, Number(numeric[1]), Number(numeric[2])),
      numeric[0],
    );
  }

  const monthFirst = query.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/,
  );
  if (monthFirst)
    return exactDate(
      isoDate(
        Number(monthFirst[3] ?? now.getFullYear()),
        SEARCH_MONTHS[monthFirst[1]],
        Number(monthFirst[2]),
      ),
      monthFirst[0],
    );

  const dayFirst = query.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)(?:,?\s+(\d{4}))?\b/,
  );
  if (dayFirst)
    return exactDate(
      isoDate(
        Number(dayFirst[3] ?? now.getFullYear()),
        SEARCH_MONTHS[dayFirst[2]],
        Number(dayFirst[1]),
      ),
      dayFirst[0],
    );

  return null;
}

export function matchesRegistrySearch(
  item: RegistryItem,
  rawQuery: string,
  now = new Date(),
) {
  const query = rawQuery.trim().toLowerCase().replace(/\s+/g, " ");
  if (!query) return true;

  const fuzzyDate = fuzzyDateQuery(query);
  const parsedDate = searchDate(query, now) ?? searchDate(fuzzyDate, now);
  if (
    parsedDate &&
    (!parsedDate.start ||
      !parsedDate.end ||
      item.date < parsedDate.start ||
      item.date > parsedDate.end)
  )
    return false;

  const words = (parsedDate ? fuzzyDate.replace(parsedDate.phrase, " ") : query)
    .split(/\s+/)
    .filter(Boolean)
    .filter(
      (word) =>
        !parsedDate ||
        ![
          "added",
          "add",
          "on",
          "from",
          "in",
          "show",
          "me",
          "things",
          "stuff",
        ].includes(word),
    );
  if (words.length === 0) return Boolean(parsedDate?.start && parsedDate.end);

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
      "A source-backed horizontal editorial layout: segmented monochrome tiles, display controls, a cursor-drawn black ink field, and a pale ink loader.",
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
