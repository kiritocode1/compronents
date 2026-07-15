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
      "expanding-rows-gallery",
      "scroll-wave-gallery",
      "shader-grid-gallery",
      "catalog-swap-gallery",
      "filter-scrub-gallery",
      "spotlight-gallery-scroll",
      "spotlight-index-scroll",
      "mosaic-flip",
      "ascii-image-reveal",
      "image-reveal",
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
    names: ["interior-studio-page", "isochrome-page", "damien-tsarantos-page"],
  },
  {
    title: "Editorial and typographic",
    names: ["march-2025-template", "archive-commerce-page", "dining-room-page"],
  },
  {
    title: "Creative studio and experimental",
    names: [
      "wu-wei-page",
      "lemon-bureau-page",
      "null-studio-page",
      "neoteric-page",
      "unusual-studio-page",
      "otis-valen-page",
    ],
  },
  {
    title: "Dark and cinematic",
    names: [
      "film-studio-page",
      "dark-catalog-page",
      "deadspace-page",
      "velasco-solari-page",
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

export const registryGroupsBySection: Record<string, RegistryGroup[]> = {
  components: componentGroups,
  pages: pageGroups,
};
