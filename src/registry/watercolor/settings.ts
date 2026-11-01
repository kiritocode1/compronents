/**
 * Watercolor tuning: every default is copied verbatim from the original
 * `Settings` chunk, and every range from its lil-gui debug panel. The engine
 * reads one mutable copy of this object each frame, so changing a value never
 * rebuilds the GPU state.
 */

export interface WatercolorSettings {
  brush: {
    dryBrush: number;
    empty: number;
    follow: number;
    force: number;
    largest: number;
    lift: number;
    maximum: number;
    pigment: number;
    radius: number;
    refill: number;
    reservoir: number;
    rest: number;
    smallest: number;
    speedPigment: number;
    speedWater: number;
    thin: number;
    trickle: number;
    wash: number;
    washForce: number;
    water: number;
  };
  color: { chroma: number; lightness: number; swing: number; wheel: number };
  dry: { damp: number; fade: number };
  flow: {
    friction: number;
    iterations: number;
    pressure: number;
    threshold: number;
    vorticity: number;
  };
  paper: string;
  rainbow: { distance: number; time: number };
  grade: { grain: number; saturation: number; vignette: number };
  light: { azimuth: number; elevation: number };
  look: {
    granulation: number;
    mottle: number;
    paper: number;
    sheen: number;
    wet: number;
  };
  settle: {
    adsorb: number;
    edge: number;
    evaporation: number;
    granulation: number;
    lift: number;
  };
  wipe: { duration: number; edge: number };
  spread: {
    depth: number;
    diffusion: number;
    dry: number;
    iterations: number;
    pinning: number;
    rate: number;
  };
}

/** Partial override accepted by the component: any subset of any group. */
export type WatercolorTuning = {
  [K in keyof WatercolorSettings]?: WatercolorSettings[K] extends object
    ? Partial<WatercolorSettings[K]>
    : WatercolorSettings[K];
};

export const DEFAULT_SETTINGS: WatercolorSettings = {
  brush: {
    dryBrush: 1.6,
    empty: 0.2,
    follow: 12,
    force: 0.3,
    largest: 3,
    lift: 6,
    maximum: 2.9,
    pigment: 2.6,
    radius: 0.042,
    refill: 0.8,
    reservoir: 7,
    rest: 0.067,
    smallest: 0.3,
    speedPigment: 3,
    speedWater: 4.5,
    thin: 2,
    trickle: 0.3,
    wash: 3,
    washForce: 3.2,
    water: 2,
  },
  color: { chroma: 0.17, lightness: 0.6, swing: 0.16, wheel: 0.12 },
  dry: { damp: 0.35, fade: 0.004 },
  flow: {
    friction: 1.6,
    iterations: 21,
    pressure: 0.8,
    threshold: 0.02,
    vorticity: 1.2,
  },
  paper: "#f7f3ec",
  rainbow: { distance: 140, time: 12 },
  grade: { grain: 0.022, saturation: 0.94, vignette: 0.12 },
  light: { azimuth: -0.8, elevation: 0.9 },
  look: { granulation: 0.8, mottle: 0.35, paper: 0.15, sheen: 0.12, wet: 0.16 },
  settle: {
    adsorb: 0.015,
    edge: 1.5,
    evaporation: 0.09,
    granulation: 1.2,
    lift: 0.15,
  },
  wipe: { duration: 1.4, edge: 0.18 },
  spread: {
    depth: 1.5,
    diffusion: 0.07,
    dry: 0.12,
    iterations: 52,
    pinning: 0.26,
    rate: 0.3,
  },
};

export const DEFAULT_HUE = 330;

/** Deep-merges a tuning override over the defaults into a fresh object. */
export function resolveSettings(tuning?: WatercolorTuning): WatercolorSettings {
  const out = structuredClone(DEFAULT_SETTINGS);
  if (!tuning) return out;
  for (const key of Object.keys(tuning) as (keyof WatercolorSettings)[]) {
    const value = tuning[key];
    if (value === undefined) continue;
    if (key === "paper") out.paper = value as string;
    else Object.assign(out[key], value);
  }
  return out;
}

export interface ControlRange {
  group: Exclude<keyof WatercolorSettings, "paper">;
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

/**
 * The original debug panel, folder by folder: label, min, max and step as
 * lil-gui had them. Two maxima are widened so the shipped default fits:
 * dry brush (1.5 to 1.6) and spread (0.25 to 0.3).
 */
export const CONTROL_RANGES = {
  brush: [
    {
      group: "brush",
      key: "radius",
      label: "Radius",
      min: 0.005,
      max: 0.2,
      step: 0.001,
    },
    {
      group: "brush",
      key: "water",
      label: "Water at rest",
      min: 0,
      max: 6,
      step: 0.01,
    },
    {
      group: "brush",
      key: "wash",
      label: "Smudge water",
      min: 0,
      max: 8,
      step: 0.01,
    },
    {
      group: "brush",
      key: "speedWater",
      label: "Water by speed",
      min: 0,
      max: 12,
      step: 0.01,
    },
    {
      group: "brush",
      key: "pigment",
      label: "Pigment at rest",
      min: 0,
      max: 6,
      step: 0.01,
    },
    {
      group: "brush",
      key: "speedPigment",
      label: "Pigment by speed",
      min: 0,
      max: 4,
      step: 0.01,
    },
    {
      group: "brush",
      key: "reservoir",
      label: "Reservoir",
      min: 0.2,
      max: 12,
      step: 0.01,
    },
    {
      group: "brush",
      key: "refill",
      label: "Refill per second",
      min: 0,
      max: 5,
      step: 0.01,
    },
    {
      group: "brush",
      key: "trickle",
      label: "Refill while moving",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "brush",
      key: "rest",
      label: "Refill below speed",
      min: 0,
      max: 0.5,
      step: 0.001,
    },
    {
      group: "brush",
      key: "empty",
      label: "Emptiest load",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      group: "brush",
      key: "dryBrush",
      label: "Dry brush",
      min: 0,
      max: 1.6,
      step: 0.01,
    },
    {
      group: "brush",
      key: "thin",
      label: "Thinnest at speed",
      min: 0.1,
      max: 6,
      step: 0.01,
    },
    {
      group: "brush",
      key: "follow",
      label: "Follow",
      min: 0,
      max: 60,
      step: 0.1,
    },
    { group: "brush", key: "force", label: "Push", min: 0, max: 4, step: 0.01 },
    {
      group: "brush",
      key: "washForce",
      label: "Smudge push",
      min: 0,
      max: 6,
      step: 0.01,
    },
    {
      group: "brush",
      key: "lift",
      label: "Smudge lift",
      min: 0,
      max: 30,
      step: 0.1,
    },
    {
      group: "rainbow",
      key: "distance",
      label: "Rainbow per distance",
      min: 0,
      max: 600,
      step: 1,
    },
    {
      group: "rainbow",
      key: "time",
      label: "Rainbow per second",
      min: 0,
      max: 120,
      step: 0.1,
    },
    {
      group: "wipe",
      key: "duration",
      label: "Wash seconds",
      min: 0.3,
      max: 4,
      step: 0.01,
    },
    {
      group: "wipe",
      key: "edge",
      label: "Wash edge",
      min: 0.02,
      max: 0.6,
      step: 0.01,
    },
  ],
  water: [
    {
      group: "spread",
      key: "rate",
      label: "Spread",
      min: 0,
      max: 0.3,
      step: 0.001,
    },
    {
      group: "spread",
      key: "iterations",
      label: "Spread passes",
      min: 0,
      max: 64,
      step: 1,
    },
    {
      group: "spread",
      key: "pinning",
      label: "Pinning",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "spread",
      key: "depth",
      label: "Depth exponent",
      min: 0,
      max: 4,
      step: 0.01,
    },
    {
      group: "spread",
      key: "dry",
      label: "Into dry paper",
      min: 0,
      max: 1,
      step: 0.001,
    },
    {
      group: "spread",
      key: "diffusion",
      label: "Pigment diffusion",
      min: 0,
      max: 0.25,
      step: 0.001,
    },
    {
      group: "settle",
      key: "evaporation",
      label: "Evaporation",
      min: 0,
      max: 1,
      step: 0.001,
    },
    {
      group: "settle",
      key: "adsorb",
      label: "Settling",
      min: 0,
      max: 3,
      step: 0.001,
    },
    {
      group: "settle",
      key: "lift",
      label: "Lifting",
      min: 0,
      max: 2,
      step: 0.001,
    },
    {
      group: "settle",
      key: "granulation",
      label: "Settling in valleys",
      min: 0,
      max: 3,
      step: 0.01,
    },
    {
      group: "settle",
      key: "edge",
      label: "Edge evaporation",
      min: 0,
      max: 10,
      step: 0.01,
    },
    {
      group: "dry",
      key: "damp",
      label: "Paper drying",
      min: 0,
      max: 4,
      step: 0.01,
    },
    {
      group: "dry",
      key: "fade",
      label: "Paint fade",
      min: 0,
      max: 0.2,
      step: 0.0001,
    },
    {
      group: "flow",
      key: "friction",
      label: "Friction",
      min: 0,
      max: 10,
      step: 0.01,
    },
    {
      group: "flow",
      key: "vorticity",
      label: "Vorticity",
      min: 0,
      max: 6,
      step: 0.01,
    },
    {
      group: "flow",
      key: "iterations",
      label: "Pressure iterations",
      min: 1,
      max: 61,
      step: 2,
    },
    {
      group: "flow",
      key: "threshold",
      label: "Wet threshold",
      min: 0,
      max: 0.2,
      step: 0.001,
    },
  ],
  look: [
    {
      group: "look",
      key: "granulation",
      label: "Granulation",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "look",
      key: "mottle",
      label: "Mottle",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      group: "look",
      key: "paper",
      label: "Paper relief",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      group: "look",
      key: "sheen",
      label: "Wet sheen",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "look",
      key: "wet",
      label: "Wet darkening",
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    {
      group: "light",
      key: "azimuth",
      label: "Light azimuth",
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    {
      group: "light",
      key: "elevation",
      label: "Light elevation",
      min: 0.1,
      max: 1.5,
      step: 0.01,
    },
    {
      group: "color",
      key: "lightness",
      label: "Paint lightness",
      min: 0.3,
      max: 0.9,
      step: 0.001,
    },
    {
      group: "color",
      key: "swing",
      label: "Lightness by hue",
      min: 0,
      max: 0.3,
      step: 0.001,
    },
    {
      group: "color",
      key: "chroma",
      label: "Paint chroma",
      min: 0,
      max: 0.3,
      step: 0.001,
    },
    {
      group: "grade",
      key: "saturation",
      label: "Saturation",
      min: 0,
      max: 2,
      step: 0.01,
    },
    {
      group: "grade",
      key: "vignette",
      label: "Vignette",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      group: "grade",
      key: "grain",
      label: "Grain",
      min: 0,
      max: 0.1,
      step: 0.001,
    },
  ],
} satisfies Record<string, ControlRange[]>;

// ---------------------------------------------------------------- maths

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent approach factor: 1 - e^(-rate * dt). */
export function approach(rate: number, dt: number) {
  return 1 - Math.exp(-rate * dt);
}

/** `#rrggbb` to linear RGB. */
export function hexToLinear(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return [r, g, b];
}

function oklchToLinear(l: number, c: number, hueDeg: number) {
  const h = (hueDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((c) => c >= -5e-4 && c <= 1.0005);

/** OKLCH paint colour for a hue, chroma reduced until it fits sRGB. */
export function hueColor(
  hue: number,
  { chroma, lightness, swing }: WatercolorSettings["color"],
) {
  const h = ((hue % 360) + 360) % 360;
  const l = lightness + swing * Math.cos(((h - 100) * Math.PI) / 180);
  let c = chroma;
  while (c > 0.005 && !inGamut(oklchToLinear(l, c, h))) c *= 0.94;
  return oklchToLinear(l, c, h).map((v) => clamp(v, 0, 1));
}

/**
 * Kubelka-Munk absorption over scattering for a reflectance, which is what
 * the sim actually carries. Mixing K/S instead of RGB is why blue through wet
 * yellow turns green.
 */
export function hueAbsorption(hue: number, color: WatercolorSettings["color"]) {
  return hueColor(hue, color).map((r) => {
    const t = clamp(r, 0.02, 0.985);
    return (1 - t) ** 2 / (2 * t);
  }) as [number, number, number];
}

// ---------------------------------------------------------------- sheet

export type WatercolorQuality = "auto" | "high" | "low";

const TIERS = {
  high: {
    flowScale: 0.5,
    maximumCells: 4096e3,
    paintScale: 1,
    unitCells: 1100,
  },
  low: { flowScale: 0.5, maximumCells: 81e4, paintScale: 0.6, unitCells: 600 },
} as const;

/** The source's tier pick: low on coarse pointers with under 8 cores or 8GB. */
export function resolveTier(quality: WatercolorQuality) {
  if (quality !== "auto") return TIERS[quality];
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency;
  const memory = nav.deviceMemory;
  const isFine = window.matchMedia("(pointer: fine)").matches;
  const high =
    !isFine ||
    ((cores === undefined || cores >= 8) &&
      (memory === undefined || memory >= 8));
  return TIERS[high ? "high" : "low"];
}

export interface Sheet {
  /** Paint grid in cells. */
  paint: [number, number];
  /** Velocity grid in cells, half the paint grid. */
  flow: [number, number];
  /** Paint cells per CSS pixel. */
  pixel: number;
}

/** Grid sizes for a box of `width` x `height` CSS pixels. */
export function sheetFor(
  width: number,
  height: number,
  tier: (typeof TIERS)[keyof typeof TIERS],
): Sheet {
  const base = Math.min(
    tier.paintScale,
    tier.unitCells / Math.max(1, Math.min(width, height)),
  );
  const cells = width * height * base * base;
  const scale =
    cells > tier.maximumCells
      ? base * Math.sqrt(tier.maximumCells / cells)
      : base;
  const paint: [number, number] = [
    Math.max(16, Math.round(width * scale)),
    Math.max(16, Math.round(height * scale)),
  ];
  return {
    flow: [
      Math.max(8, Math.round(paint[0] * tier.flowScale)),
      Math.max(8, Math.round(paint[1] * tier.flowScale)),
    ],
    paint,
    pixel: paint[0] / width,
  };
}
