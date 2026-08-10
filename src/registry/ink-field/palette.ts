/**
 * InkField palette, mode tables and defaults.
 *
 * The 36 brush colours are the exact constants compiled into `encode.frag`.
 * Two of the 36 are not constants at all: index 29 resolves to the canvas
 * background (the erase brush) and index 33 to a caller-supplied colour.
 *
 * BLANK - aryank.space
 */

export interface InkSwatch {
  index: number;
  hex: string;
  name: string;
  /** Resolved from a uniform at draw time rather than baked into the shader. */
  dynamic?: "background" | "custom";
}

/** Indices are the shader's `brushColorMode`; order here is the shader's order. */
export const INK_PALETTE: InkSwatch[] = [
  { index: 0, hex: "#1A1A1A", name: "Sumi Black" },
  { index: 1, hex: "#F2F2F2", name: "Chalk White" },
  { index: 2, hex: "#2F2F2F", name: "Iron" },
  { index: 3, hex: "#555555", name: "Graphite" },
  { index: 4, hex: "#969696", name: "Ash" },
  { index: 5, hex: "#3F4D18", name: "Moss" },
  { index: 6, hex: "#FFA03E", name: "Persimmon" },
  { index: 7, hex: "#AF8C59", name: "Straw" },
  { index: 8, hex: "#048282", name: "Teal Lacquer" },
  { index: 9, hex: "#3950C0", name: "Indigo" },
  { index: 10, hex: "#8C6AAC", name: "Wisteria" },
  { index: 11, hex: "#8A9549", name: "Reed" },
  { index: 12, hex: "#887A7D", name: "Mauve Stone" },
  { index: 13, hex: "#8A391A", name: "Burnt Sienna" },
  { index: 14, hex: "#704F39", name: "Walnut" },
  { index: 15, hex: "#A8C848", name: "Young Leaf" },
  { index: 16, hex: "#F0AACF", name: "Peony" },
  { index: 17, hex: "#803134", name: "Oxblood" },
  { index: 18, hex: "#E9AF34", name: "Gamboge" },
  { index: 19, hex: "#807D72", name: "Olive Grey" },
  { index: 20, hex: "#798481", name: "Slate Green" },
  { index: 21, hex: "#9F7255", name: "Clay" },
  { index: 22, hex: "#B5B4B9", name: "Pewter" },
  { index: 23, hex: "#EBDCC9", name: "Rice Paper" },
  { index: 24, hex: "#94A29E", name: "Celadon" },
  { index: 25, hex: "#D2A997", name: "Blush Clay" },
  { index: 26, hex: "#A5A293", name: "Hemp" },
  { index: 27, hex: "#CBF3FB", name: "Frost" },
  { index: 28, hex: "#AEA1A4", name: "Dove" },
  { index: 29, hex: "#FFFFFF", name: "Erase", dynamic: "background" },
  { index: 30, hex: "#D0223F", name: "Cinnabar" },
  { index: 31, hex: "#FFF938", name: "Sulphur" },
  { index: 32, hex: "#02426D", name: "Prussian" },
  { index: 33, hex: "#FF6A3D", name: "Custom", dynamic: "custom" },
  { index: 34, hex: "#FF7F50", name: "Coral" },
  { index: 35, hex: "#98FB98", name: "Mint" },
];

export const inkSwatch = (index: number): InkSwatch =>
  INK_PALETTE[index] ?? INK_PALETTE[0];

/**
 * The six diffusion behaviours in `feedback.frag`, selected by `useSharpen`.
 * The original ships two conflicting name sets for these; the code's branch
 * order is authoritative, so these follow the code.
 */
export const INK_MODES = [
  {
    id: 0,
    name: "Fly White",
    glyph: "飛",
    note: "Directional four-tap diffusion weighted toward density gradients.",
  },
  {
    id: 1,
    name: "Squeeze",
    glyph: "壓",
    note: "Four hash-grain layers with soft and sharp regions in one stroke.",
  },
  {
    id: 2,
    name: "Marker",
    glyph: "麥",
    note: "Edge detection with a light centre and a dark rim.",
  },
  {
    id: 3,
    name: "Salt",
    glyph: "鹽",
    note: "Column distance field sheared along the wind, plus salt speckle.",
  },
  {
    id: 4,
    name: "Bleed",
    glyph: "染",
    note: "Three rotated samples, white spots and a full texture stack.",
  },
  {
    id: 5,
    name: "Fiber",
    glyph: "毛",
    note: "Bleed at a third the speed on a clock that never wraps.",
  },
] as const;

export type InkModeId = (typeof INK_MODES)[number]["id"];

/** Brush size presets. The UI shows the largest as 10x. */
export const BRUSH_SIZES = [0.1, 0.25, 0.5, 1, 2, 3, 5] as const;

export const BLEND_MODES = [
  { id: 0, name: "Mix" },
  { id: 1, name: "Multiply" },
  { id: 2, name: "Darken" },
] as const;

/** Per-stroke path perturbation strength. */
export const PATH_ROTATIONS = [
  { id: 0, name: "None", range: [0, 0] as const },
  { id: 1, name: "Gentle", range: [5, 10] as const },
  { id: 2, name: "Wild", range: [10, 25] as const },
] as const;

/** `metallic.frag` material presets, as linear RGB triples. */
export const METAL_TINTS = [
  { id: "gold", name: "Gold", tint: [0.88, 0.72, 0.52] as const },
  { id: "silver", name: "Silver", tint: [0.75, 0.75, 0.75] as const },
  { id: "copper", name: "Copper", tint: [0.72, 0.5, 0.35] as const },
  { id: "rose", name: "Rose Gold", tint: [0.88, 0.65, 0.7] as const },
  { id: "iron", name: "Black Iron", tint: [0.15, 0.12, 0.08] as const },
  { id: "diamond", name: "Diamond", tint: [0.95, 0.95, 1.0] as const },
] as const;

export type MetalTintId = (typeof METAL_TINTS)[number]["id"];

/** `flow.frag` displacement styles. Type 1 does not exist in the shader. */
export const FLOW_TYPES = [
  { id: 0, name: "Basic", note: "Simplex displacement with amplitude tiers." },
  { id: 2, name: "Concentric", note: "Two hash-placed centres emit ripples." },
  { id: 3, name: "Vertical", note: "Five iterations of vertical wave sums." },
  { id: 4, name: "Horizontal", note: "Vertical, transposed." },
  { id: 5, name: "Crack", note: "Dual-layer Voronoi isolating cell borders." },
  {
    id: 6,
    name: "Mosaic",
    note: "Hard tile boundaries with per-cell offsets.",
  },
  {
    id: 7,
    name: "Vortex",
    note: "Two centres twist by radius in polar space.",
  },
  { id: 8, name: "Cellular", note: "Voronoi gate driving a curl-noise kick." },
] as const;

export type FlowTypeId = (typeof FLOW_TYPES)[number]["id"];

/** Parsed `#rrggbb` to a 0-1 RGB triple. */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Defaults mirroring the original's shipped control values. */
export const DEFAULT_EFFECTS = {
  distortEnabled: false,
  displacementB: 20,
  displacementC: 50,
  showFbmMask: false,

  resonanceEnabled: false,
  rsFrequency: 300,
  rsWaveSpeed: 1,
  rsStrength: 0.5,
  rsGradientMix: 0.1,
  rsScale: 100,

  cellularEnabled: false,
  cellularScale: 15,
  cellularSeed: 0.5,

  whiteDotEnabled: false,
  whiteDotDensity: 0.1,

  grainEnabled: false,
  grainAmount: 0.18,
};

export const DEFAULT_FLOW = {
  blendType: 0 as FlowTypeId,
  blendVol: 100,
  blendA: 0.01,
  blendB: 25,
  directVol: 10,
  snoiseVol: 3,
  globalStyle: 0,
  pixD: 1,
  colorDeep: 0.015,
  whiteDot: 0.01,
  doBigShape: 0,
  doMask: 0.5,
  multiDir: 0,
  lastStrokeOnly: false,
};

export const DEFAULT_METALLIC = {
  strength: 85,
  flowSpeed: 200,
  fresnelStrength: 1,
  biteSize: 7,
  tint: "gold" as MetalTintId,
  lightPos: [0.5, 0.5] as [number, number],
};
