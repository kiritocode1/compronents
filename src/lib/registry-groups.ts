// Grouping of registry items for the section index pages. Components are
// grouped by interaction type; pages by aesthetic theme. Names must match
// `RegistryItem.name`. Ordering here is the display order; any item not listed
// falls into a trailing "More" group in the UI.

export interface RegistryGroup {
  title: string;
  names: string[];
}

export const componentGroups: RegistryGroup[] = [
  {
    title: "Layout, lists and widgets",
    names: [
      "falling-tag-list",
      "award-list",
      "portfolio-page",
      "creative-clutter",
      "animated-footer",
      "halftone-scene-footer",
      "vinyl-orbit-player",
    ],
  },
  {
    title: "Preloaders and loaders",
    names: [
      "orbit-text-preloader",
      "counter-star-loader",
      "mask-reveal-preloader",
      "name-preloader-reveal",
      "preloader-panel-reveal",
      "landing-counter-reveal",
      "preloader-reveal",
      "split-reveal-preloader",
      "montage-reveal-hero",
      "landing-image-reveal",
    ],
  },
  {
    title: "Hero sections",
    names: [
      "halftone-interface-hero",
      "ascii-tv-hero",
      "aperture-zoom-hero",
      "curtain-reveal-hero",
      "slit-reveal-hero",
      "frame-scroll",
      "inversa-scroll",
    ],
  },
  {
    title: "Galleries and grids",
    names: [
      "spiral-gallery",
      "scroll-wave-gallery",
      "shader-grid-gallery",
      "catalog-swap-gallery",
      "filter-scrub-gallery",
      "spotlight-gallery-scroll",
      "spotlight-index-scroll",
      "mosaic-flip",
      "ascii-image-reveal",
      "image-reveal",
      "liquid-stat-grid",
    ],
  },
  {
    title: "Sliders and carousels",
    names: [
      "voku-image-slider",
      "threejs-infinite-slider",
      "scroll-scrub-slider",
      "hour-timeline-slider",
      "depoluxe-sideways-carousel",
      "detroit-paris-slider",
      "curved-plane-slider",
      "minimap-scrubber",
      "minimap-parallax-scroll",
      "drag-timeline-scroll",
    ],
  },
  {
    title: "Cards and stacks",
    names: [
      "video-card-stack",
      "split-card-scroll",
      "scroll-flip-cards",
      "sticky-flip-cards",
      "tilt-card-stack",
      "sticky-stack-cards",
    ],
  },
  {
    title: "Text effects",
    names: [
      "text-displacement-field",
      "scroll-text-blocks",
      "line-rise-text",
      "block-reveal-text",
      "terminal-text-reveal",
      "word-highlight-scroll",
      "stretch-text-scroll",
      "converging-icons-text",
      "converging-search-scroll",
    ],
  },
  {
    title: "Cursor and hover effects",
    names: [
      "grid-scramble-hover",
      "client-hover-preview",
      "folder-preview-hover",
      "inversion-lens-hover",
      "fractal-glass-hover",
      "svg-stroke-hover",
      "cursor-trail-scroll",
      "cursor-image-trail",
      "smudge-cursor-reveal",
      "sandy-grain-background",
      "accordion-frames",
    ],
  },
  {
    title: "Menus and navigation",
    names: [
      "model-menu-3d",
      "overlay-menu",
      "expanding-navbar-reveal",
      "folding-panel-menu",
    ],
  },
  {
    title: "Scroll sequences",
    names: [
      "ribbon-stroke-scroll",
      "cross-reveal-scroll",
      "arc-spotlight-scroll",
      "rotating-hand-scroll",
      "infinite-contact-scroll",
      "webgl-dissolve-scroll",
    ],
  },
  {
    title: "3D and WebGL scenes",
    names: [
      "scroll-tunnel-3d",
      "corridor-scene-3d",
      "cappen-fluid-simulation",
      "crt-display",
      "ascii-logo",
      "material-spotlight",
    ],
  },
];

export const pageGroups: RegistryGroup[] = [
  {
    title: "Minimal and refined",
    names: [
      "interior-studio-page",
      "isochrome-page",
      "damien-tsarantos-page",
      "juan-mora-page",
      "dither-studio-page",
    ],
  },
  {
    title: "Editorial and typographic",
    names: [
      "march-2025-template",
      "archive-commerce-page",
      "house-of-epochs-page",
      "dining-room-page",
      "expanding-rows-gallery",
    ],
  },
  {
    title: "Creative studio and experimental",
    names: [
      "blnk-agency-page",
      "wu-wei-page",
      "lemon-bureau-page",
      "null-studio-page",
      "ink-core-layout",
      "neoteric-page",
      "unusual-studio-page",
      "otis-valen-page",
      "polite-chaos-page",
    ],
  },
  {
    title: "Dark and cinematic",
    names: [
      "chrome-folio-page",
      "film-studio-page",
      "dark-catalog-page",
      "deadspace-page",
      "velasco-solari-page",
      "orbit-matter-page",
    ],
  },
  {
    title: "Brutalist and raw",
    names: ["brutalist-portfolio-page"],
  },
  {
    title: "Playful and dimensional",
    names: ["soren-page"],
  },
];

export const backendGroups: RegistryGroup[] = [
  {
    title: "Runtime-native building blocks",
    names: [
      "bun-secrets-vault",
      "bun-sqlite-job-queue",
      "bun-auth-gateway",
      "deno-kv-leader-election",
      "deno-kv-rate-limit",
      "deno-kv-realtime-sync",
      "node-permission-sandbox",
      "node-diagnostics-telemetry",
      "node-sqlite-worker-pool",
      "durable-object-rpc-rate-limit",
    ],
  },
  {
    title: "Auth and access control",
    names: [
      "better-auth-jwks-cookie-cache",
      "better-auth-provisioning-gate",
      "better-auth-atomic-rate-limit",
    ],
  },
  {
    title: "Databases and queries",
    names: [
      "effect-sql-transactional-repository",
      "prisma-driver-adapter-runtime",
      "prisma-client-extension-audit",
      "drizzle-pg-jit-query-layer",
      "drizzle-cache-tag-invalidation",
      "drizzle-kit-migration-gate",
      "drizzle-effect-pg-repository",
      "neon-http-composable-sql",
      "d1-session-read-replica",
      "durable-object-sql-tenant-db",
      "pg-advisory-lock-keyset-scan",
      "indexeddb-sync-outbox",
    ],
  },
  {
    title: "Failure-mode resilience",
    names: [
      "effect-cache-stampede-guard",
      "effect-circuit-breaker-budget",
      "effect-shard-router-backpressure",
      "effect-fencing-token-hlc",
      "effect-outbox-replicator",
    ],
  },
  {
    title: "Durable workflows and jobs",
    names: [
      "effect-durable-activity-workflow",
      "effect-durable-workflow-queue",
      "effect-workflow-v4-migration",
      "cloudflare-workflow-saga-rollback",
      "durable-object-alarm-scheduler",
      "rivet-durable-workflow-actor",
      "rivet-dynamic-actor-registry",
      "vercel-queue-consumer-groups",
      "artifacts-fork-run-workflow",
      "effect-cluster-entity-sharding",
    ],
  },
  {
    title: "Edge runtimes and caching",
    names: [
      "effect-cloudflare-event-api",
      "cloudflare-worker-cache-tags",
      "cloudflare-worker-test-harness",
      "durable-object-websocket-hibernation",
      "worker-rpc-promise-pipelining",
      "effect-rpc-contract-transport",
      "effect-service-lifecycle-runtime",
      "fluid-compute-instance-safety",
      "fluid-stream-lifecycle",
      "artifacts-repo-provisioner",
      "artifacts-agent-commit-notes",
    ],
  },
  {
    title: "API servers and routing",
    names: [
      "effect-httpapi-derived-client",
      "elysia-plugin-scope-model",
      "elysia-aot-build-manifest",
      "elysia-standard-schema-guard",
      "websocket-route-handler",
    ],
  },
  {
    title: "Framework data loading",
    names: [
      "sveltekit-live-query-stream",
      "sveltekit-batched-query-refresh",
      "sveltekit-explicit-env-vars",
    ],
  },
];

export const registryGroupsBySection: Record<string, RegistryGroup[]> = {
  components: componentGroups,
  pages: pageGroups,
  backend: backendGroups,
};
