"use client";

/**
 * Halftone Hands - two hands reaching in from the sides, drawn as a live
 * halftone dot field. Each frame both poses of each hand are painted into a
 * small offscreen field, sampled per cell, and redrawn as dots whose size is
 * the cell's tone quantised to `levels` steps. The hands drift, breathe and
 * roll on a loop, cells swap between two poses, rows glitch sideways, and a
 * lens under the pointer swells, pushes and darkens the dots.
 *
 * The parent sets the size: the component fills it.
 *
 * BLANK - aryank.space
 */

import { type CSSProperties, useEffect, useRef } from "react";

const TAU = Math.PI * 2;
/** Width the source images are resampled to before drawing. */
const TILE_W = 560;
/** Field samples per dot cell, horizontally and vertically. */
const SAMPLES_X = 2;
const SAMPLES_Y = 3;
/** Seconds the build-in takes to sweep every cell. */
const INTRO_S = 1.8;
/** Crops of the 2x2 sheet: left A, right A, left B, right B. */
const SHEET_CROPS = [
  [0, 0.06, 0.47, 0.4],
  [0.53, 0.06, 0.47, 0.4],
  [0, 0.55, 0.47, 0.4],
  [0.53, 0.55, 0.47, 0.4],
] as const;

const HANDS_SHEET =
  "https://ui.aryank.space/assets/halftone-hands/hands-sheet.webp";

export interface HalftoneTheme {
  name: string;
  /** Page colour. */
  bg: string;
  /** Ink on the left edge. */
  inkA: string;
  /** Ink on the right edge. Equal to `inkA` for a flat colour. */
  inkB: string;
  /** Glow radius in px. */
  glow: number;
  /** Vignette strength, 0 to 1. */
  vignette: number;
  /** Scanline strength, 0 to 1. */
  scan: number;
  /** Dark themes screen the ink when the image cannot be sampled. */
  dark: boolean;
}

export const HALFTONE_THEMES = {
  paper: {
    name: "Paper",
    bg: "#f7f7f5",
    inkA: "#0d0d0d",
    inkB: "#0d0d0d",
    glow: 0,
    vignette: 0,
    scan: 0,
    dark: false,
  },
  graphite: {
    name: "Graphite",
    bg: "#0c0c0d",
    inkA: "#f4f1ea",
    inkB: "#f4f1ea",
    glow: 3,
    vignette: 0.4,
    scan: 0,
    dark: true,
  },
  phosphor: {
    name: "Phosphor",
    bg: "#030805",
    inkA: "#2dff7e",
    inkB: "#b9ffd4",
    glow: 9,
    vignette: 0.6,
    scan: 0.4,
    dark: true,
  },
  amber: {
    name: "Amber CRT",
    bg: "#0d0702",
    inkA: "#ff9a24",
    inkB: "#ffd57c",
    glow: 10,
    vignette: 0.6,
    scan: 0.4,
    dark: true,
  },
  blueprint: {
    name: "Blueprint",
    bg: "#0a2b4f",
    inkA: "#e0efff",
    inkB: "#8cc6ff",
    glow: 3,
    vignette: 0.35,
    scan: 0,
    dark: true,
  },
  riso: {
    name: "Risograph",
    bg: "#f3ede1",
    inkA: "#ff4a7d",
    inkB: "#2b57ff",
    glow: 0,
    vignette: 0.08,
    scan: 0,
    dark: false,
  },
  ember: {
    name: "Ember",
    bg: "#130605",
    inkA: "#ff4527",
    inkB: "#ffc85e",
    glow: 8,
    vignette: 0.55,
    scan: 0,
    dark: true,
  },
  neon: {
    name: "Neon Night",
    bg: "#08051a",
    inkA: "#ff3ccf",
    inkB: "#33e9ff",
    glow: 10,
    vignette: 0.5,
    scan: 0.2,
    dark: true,
  },
  sage: {
    name: "Sage",
    bg: "#e6eae0",
    inkA: "#1f3528",
    inkB: "#55735a",
    glow: 0,
    vignette: 0.14,
    scan: 0,
    dark: false,
  },
  gilt: {
    name: "Gilt",
    bg: "#0f0f0f",
    inkA: "#b5853a",
    inkB: "#f4dc9e",
    glow: 5,
    vignette: 0.5,
    scan: 0,
    dark: true,
  },
  glacier: {
    name: "Glacier",
    bg: "#edf3f7",
    inkA: "#0f3557",
    inkB: "#3a86bd",
    glow: 0,
    vignette: 0.1,
    scan: 0,
    dark: false,
  },
} as const satisfies Record<string, HalftoneTheme>;

export type HalftoneThemeId = keyof typeof HALFTONE_THEMES;

export interface HandsOptions {
  /** One 2x2 sheet (left A, right A / left B, right B) or four images. */
  source: "sheet" | "split";
  sheet: string;
  leftA: string;
  rightA: string;
  leftB: string;
  rightB: string;
  /** Hand width, % of the component width. */
  width: number;
  /** Vertical centre, % of the component height. */
  centerY: number;
  /** How far each hand runs past its edge, %. */
  bleed: number;
  /** Faded gap down the middle, %. */
  gap: number;
}

export interface DotsOptions {
  shape: "circle" | "square" | "diamond" | "bar";
  /** Columns across the component. */
  density: number;
  /** Row spacing as a multiple of the column spacing. */
  rowGap: number;
  /** Largest dot, % of the cell. */
  size: number;
  /** Tone steps a dot can take. */
  levels: number;
  /** Smallest drawn dot, % of the largest. */
  minDot: number;
  /** Tone below which no dot is drawn, 0 to 50. */
  threshold: number;
  /** Tone range from no dot to a full dot, 10 to 80. */
  softness: number;
  contrast: number;
  /** Edge sharpening against the four neighbours. */
  detail: number;
}

export interface MotionOptions {
  /** Seconds per loop. */
  loop: number;
  speed: number;
  /** Sideways reach, %. */
  drift: number;
  breathe: number;
  roll: number;
  /** Swap cells between the two poses. */
  morph: boolean;
  /** Shift random rows sideways. */
  glitch: boolean;
  shimmer: number;
  /** Build the dots in on load. */
  intro: boolean;
}

export interface LensOptions {
  enabled: boolean;
  /** Radius in px. */
  radius: number;
  /** Dot growth at the centre, %. */
  swell: number;
  /** Outward push at the centre, px. */
  push: number;
  /** Extra tone at the centre, %. */
  reveal: number;
}

export interface HalftoneHandsProps {
  /** Preset name or a custom theme. */
  theme?: HalftoneThemeId | HalftoneTheme;
  /** Glow, % of the theme's glow. */
  glow?: number;
  vignette?: boolean;
  scanlines?: boolean;
  hands?: Partial<HandsOptions>;
  dots?: Partial<DotsOptions>;
  motion?: Partial<MotionOptions>;
  lens?: Partial<LensOptions>;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_HANDS: HandsOptions = {
  source: "sheet",
  sheet: HANDS_SHEET,
  leftA: "",
  rightA: "",
  leftB: "",
  rightB: "",
  width: 56,
  centerY: 50,
  bleed: 4.5,
  gap: 9,
};
const DEFAULT_DOTS: DotsOptions = {
  shape: "circle",
  density: 190,
  rowGap: 1.9,
  size: 94,
  levels: 6,
  minDot: 30,
  threshold: 14,
  softness: 44,
  contrast: 1.15,
  detail: 0.9,
};
const DEFAULT_MOTION: MotionOptions = {
  loop: 20,
  speed: 1,
  drift: 100,
  breathe: 100,
  roll: 100,
  morph: true,
  glitch: true,
  shimmer: 100,
  intro: true,
};
const DEFAULT_LENS: LensOptions = {
  enabled: true,
  radius: 130,
  swell: 40,
  push: 6,
  reveal: 25,
};

type Options = {
  hands: HandsOptions;
  dots: DotsOptions;
  motion: MotionOptions;
  lens: LensOptions;
};
type RGB = [number, number, number];

const colorCache = new Map<string, RGB>();
function parseColor(input: string): RGB {
  const hit = colorCache.get(input);
  if (hit) return hit;
  let rgb: RGB = [13, 13, 13];
  const s = (input || "").trim();
  if (s[0] === "#") {
    let hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const n = Number.parseInt(hex.slice(0, 6), 16);
    if (!Number.isNaN(n)) rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  } else {
    const parts = s.match(/[\d.]+/g);
    if (parts && parts.length >= 3) rgb = [+parts[0], +parts[1], +parts[2]];
  }
  colorCache.set(input, rgb);
  return rgb;
}

const rgba = (color: string, alpha: number) => {
  const [r, g, b] = parseColor(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
const vignetteBg = (t: HalftoneTheme) =>
  `radial-gradient(120% 95% at 50% 50%, transparent 52%, rgba(0,0,0,${(t.dark ? 0.85 : 0.35) * t.vignette}) 100%)`;
const scanlineBg = (t: HalftoneTheme) =>
  `repeating-linear-gradient(0deg, rgba(0,0,0,${0.32 * t.scan}) 0px, rgba(0,0,0,${0.32 * t.scan}) 1px, transparent 1px, transparent 3px)`;

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
/** 0 before `on`, 1 between `on + ramp` and `off`, 0 after `off + ramp`. */
const window01 = (x: number, on: number, off: number, ramp: number) =>
  smoothstep(on, on + ramp, x) * (1 - smoothstep(off, off + ramp, x));
function hash(a: number, b: number) {
  const n = Math.sin(a * 91.373 + b * 263.917) * 47453.531;
  return n - Math.floor(n);
}

function loadImage(src: string, cors: boolean) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
// Prefer a CORS load so the field can be read back; fall back to a plain one.
const loadAny = async (src: string) =>
  (await loadImage(src, true)) || (await loadImage(src, false));

/** Crop and resample one hand onto white at TILE_W wide. */
function toTile(
  img: HTMLImageElement,
  crop: readonly [number, number, number, number] | null,
) {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null;
  const [cx, cy, cw, ch] = crop || [0, 0, 1, 1];
  const sw = nw * cw;
  const sh = nh * ch;
  const c = document.createElement("canvas");
  c.width = TILE_W;
  c.height = Math.max(1, Math.round((TILE_W * sh) / sw));
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, cx * nw, cy * nh, sw, sh, 0, 0, c.width, c.height);
  return c;
}

function isTainted(c: HTMLCanvasElement | null) {
  if (!c) return false;
  try {
    c.getContext("2d")?.getImageData(0, 0, 1, 1);
    return false;
  } catch {
    return true;
  }
}

/** Draw one hand (side 0 left, 1 right) at loop phase `phase`. */
function drawHand(
  ctx: CanvasRenderingContext2D,
  tile: HTMLCanvasElement | null,
  side: number,
  phase: number,
  o: Options,
  W: number,
  H: number,
  sx: number,
  sy: number,
  ox: number,
) {
  if (!tile) return;
  const left = side === 0;
  const offset = left ? 0 : Math.PI;
  const portrait = H > W * 1.02;
  const w = W * (o.hands.width / 100) * (portrait ? 1.245 : 1);
  const h = (w * tile.height) / tile.width;
  const cy = (H * o.hands.centerY) / 100;
  const m = o.motion;
  const drift =
    (0.035 * Math.sin(phase + offset) +
      0.012 * Math.sin(2 * phase + 1.3 + offset)) *
    W *
    (m.drift / 100);
  const breathe = 1 + 0.07 * (m.breathe / 100) * Math.sin(phase + 0.9 + offset);
  const roll =
    (left ? 1 : -1) * 0.045 * (m.roll / 100) * Math.sin(phase + 2.1 + offset);
  const bleed = (W * o.hands.bleed) / 100;
  const x = left ? drift - bleed : W - w + bleed - drift;
  const pivot = left ? 0 : W;
  ctx.setTransform(sx, 0, 0, sy, ox, 0);
  ctx.translate(pivot, cy);
  ctx.rotate(roll);
  ctx.scale(breathe, breathe);
  ctx.translate(-pivot, -cy);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tile, x, cy - h / 2, w, h);
}

function addDot(
  path: Path2D,
  shape: DotsOptions["shape"],
  x: number,
  y: number,
  r: number,
) {
  if (shape === "square") {
    const s = r * 0.9;
    path.rect(x - s, y - s, s * 2, s * 2);
  } else if (shape === "diamond") {
    const s = r * 1.15;
    path.moveTo(x, y - s);
    path.lineTo(x + s, y);
    path.lineTo(x, y + s);
    path.lineTo(x - s, y);
    path.closePath();
  } else if (shape === "bar") {
    const sw = r * 0.62;
    const sh = r * 1.35;
    path.rect(x - sw, y - sh, sw * 2, sh * 2);
  } else {
    path.moveTo(x + r, y);
    path.arc(x, y, r, 0, TAU);
  }
}

function sources(h: HandsOptions) {
  if (h.source === "split") {
    let la = h.leftA;
    let ra = h.rightA;
    let lb = h.leftB;
    let rb = h.rightB;
    la ||= lb;
    ra ||= rb;
    lb ||= la;
    rb ||= ra;
    return { srcs: [la, ra, lb, rb], crops: [null, null, null, null] };
  }
  const s = h.sheet;
  return { srcs: [s, s, s, s], crops: SHEET_CROPS };
}

type Field = {
  W: number;
  H: number;
  dpr: number;
  step: number;
  rowStep: number;
  cols: number;
  rows: number;
  seeds: Float32Array;
  inkA: Float32Array;
  inkB: Float32Array;
  field: HTMLCanvasElement | null;
  fctx: CanvasRenderingContext2D | null;
  tiles: (HTMLCanvasElement | null)[] | null;
  tainted: boolean;
  pattern: CanvasPattern | null;
  reduce: boolean;
  lastDensity: number;
  lastRowGap: number;
  pointer: { x: number; y: number; inside: boolean };
  lensAmt: number;
  lensX: number;
  lensY: number;
  introT: number;
  colA: number[] | null;
  colB: number[] | null;
  relayout: () => void;
  still: () => void;
};

export default function HalftoneHands({
  theme = "paper",
  glow = 100,
  vignette = true,
  scanlines = true,
  hands,
  dots,
  motion,
  lens,
  className,
  style,
}: HalftoneHandsProps) {
  const t = typeof theme === "string" ? HALFTONE_THEMES[theme] : theme;
  const opts: Options = {
    hands: { ...DEFAULT_HANDS, ...hands },
    dots: { ...DEFAULT_DOTS, ...dots },
    motion: { ...DEFAULT_MOTION, ...motion },
    lens: { ...DEFAULT_LENS, ...lens },
  };
  const themeRef = useRef<HalftoneTheme>(t);
  themeRef.current = t;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kick = useRef(() => {});
  const fieldRef = useRef<Field | null>(null);
  fieldRef.current ||= {
    W: 0,
    H: 0,
    dpr: 1,
    step: 5,
    rowStep: 10,
    cols: 0,
    rows: 0,
    seeds: new Float32Array(),
    inkA: new Float32Array(),
    inkB: new Float32Array(),
    field: null,
    fctx: null,
    tiles: null,
    tainted: false,
    pattern: null,
    reduce: false,
    lastDensity: 0,
    lastRowGap: 0,
    pointer: { x: 0, y: 0, inside: false },
    lensAmt: 0,
    lensX: 0,
    lensY: 0,
    introT: 0,
    colA: null,
    colB: null,
    relayout: () => {},
    still: () => {},
  };
  const S = fieldRef.current;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let alive = true;

    const layout = () => {
      const o = optsRef.current;
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      S.W = w;
      S.H = h;
      S.dpr = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const step = Math.max(3, w / Math.max(40, o.dots.density));
      const rowStep = step * Math.max(1, o.dots.rowGap);
      S.step = step;
      S.rowStep = rowStep;
      S.lastDensity = o.dots.density;
      S.lastRowGap = o.dots.rowGap;
      const cols = Math.ceil(w / step);
      const rows = Math.ceil(h / rowStep);
      if (cols !== S.cols || rows !== S.rows || !S.field) {
        S.cols = cols;
        S.rows = rows;
        S.field ||= document.createElement("canvas");
        S.field.width = cols * 2 * SAMPLES_X;
        S.field.height = rows * SAMPLES_Y;
        S.fctx = S.field.getContext("2d", { willReadFrequently: true });
        const seeds = new Float32Array(cols * rows);
        for (let r = 0; r < rows; r++) {
          const rowSeed = hash(r * 3.7, 5.3);
          for (let c = 0; c < cols; c++)
            seeds[r * cols + c] = 0.55 * hash(c, r) + 0.45 * rowSeed;
        }
        S.seeds = seeds;
        S.inkA = new Float32Array(cols * rows);
        S.inkB = new Float32Array(cols * rows);
      }
      S.pattern = null;
    };

    // Dot mask for the fallback path, one dot per cell.
    const dotPattern = () => {
      if (S.pattern) return S.pattern;
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(S.step * S.dpr));
      c.height = Math.max(1, Math.round(S.rowStep * S.dpr));
      const pc = c.getContext("2d");
      if (!pc) return null;
      pc.fillStyle = "#000";
      pc.beginPath();
      pc.arc(
        c.width / 2,
        c.height / 2,
        Math.min(
          c.width / 2,
          (S.step * S.dpr * optsRef.current.dots.size) / 200,
        ),
        0,
        TAU,
      );
      pc.fill();
      S.pattern = ctx.createPattern(c, "repeat");
      return S.pattern;
    };

    // Images that cannot be read back (no CORS) are drawn directly and cut
    // by a dot mask instead.
    const drawTainted = (phase: number, o: Options) => {
      canvas.style.mixBlendMode = themeRef.current.dark ? "screen" : "multiply";
      const tiles = S.tiles;
      if (!tiles) return;
      for (let side = 0; side < 2; side++)
        drawHand(ctx, tiles[side], side, phase, o, S.W, S.H, S.dpr, S.dpr, 0);
      const pattern = dotPattern();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (pattern) {
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
      }
    };

    // Average the red channel of each cell's samples into ink 0..1, for
    // pose A (left half of the field) and pose B (right half).
    const sampleField = (data: Uint8ClampedArray) => {
      const { cols, rows, inkA, inkB } = S;
      const rowLen = cols * 2 * SAMPLES_X;
      const inv = 1 / (510 * SAMPLES_Y);
      for (let r = 0; r < rows; r++) {
        const y0 = r * SAMPLES_Y;
        for (let c = 0; c < cols; c++) {
          let a = 0;
          let b = 0;
          const xa = c * SAMPLES_X;
          const xb = (cols + c) * SAMPLES_X;
          for (let sy = 0; sy < SAMPLES_Y; sy++) {
            const base = (y0 + sy) * rowLen;
            for (let sx = 0; sx < SAMPLES_X; sx++) {
              a += data[(base + xa + sx) * 4];
              b += data[(base + xb + sx) * 4];
            }
          }
          const i = r * cols + c;
          inkA[i] = 1 - a * inv;
          inkB[i] = 1 - b * inv;
        }
      }
    };

    // Ink colour eases towards the theme; two inks become a left to right
    // gradient.
    const inkFill = (dt: number, still: boolean) => {
      const th = themeRef.current;
      const a = parseColor(th.inkA);
      const b = parseColor(th.inkB);
      if (!S.colA || !S.colB || still) {
        S.colA = a.slice();
        S.colB = b.slice();
      } else {
        const k = 1 - Math.exp(-dt * 5);
        for (let i = 0; i < 3; i++) {
          S.colA[i] += (a[i] - S.colA[i]) * k;
          S.colB[i] += (b[i] - S.colB[i]) * k;
        }
      }
      const ca = `rgb(${S.colA.map(Math.round).join(",")})`;
      const cb = `rgb(${S.colB.map(Math.round).join(",")})`;
      if (ca === cb) return ca;
      const g = ctx.createLinearGradient(S.W * 0.08, 0, S.W * 0.92, 0);
      g.addColorStop(0, ca);
      g.addColorStop(1, cb);
      return g;
    };

    const render = (time: number, still: boolean, dt: number) => {
      const o = optsRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!S.tiles || !S.W || !S.fctx) return;
      const { W, H, cols, rows, step, rowStep, dpr, seeds, inkA, inkB } = S;
      const loop = Math.max(1, o.motion.loop);
      const phase = still ? 0 : (TAU * time) / loop;
      if (S.tainted) return drawTainted(phase, o);

      const f = S.fctx;
      const fw = cols * 2 * SAMPLES_X;
      const fh = rows * SAMPLES_Y;
      f.setTransform(1, 0, 0, 1, 0, 0);
      f.fillStyle = "#ffffff";
      f.fillRect(0, 0, fw, fh);
      for (let pose = 0; pose < 2; pose++) {
        f.save();
        f.beginPath();
        f.rect(pose * cols * SAMPLES_X, 0, cols * SAMPLES_X, fh);
        f.clip();
        for (let side = 0; side < 2; side++)
          drawHand(
            f,
            S.tiles[pose * 2 + side],
            side,
            phase,
            o,
            W,
            H,
            (cols * SAMPLES_X) / W,
            fh / H,
            pose * cols * SAMPLES_X,
          );
        f.restore();
      }
      let data: Uint8ClampedArray;
      try {
        data = f.getImageData(0, 0, fw, fh).data;
      } catch {
        S.tainted = true;
        return drawTainted(phase, o);
      }
      sampleField(data);

      const d = o.dots;
      const morph = !still && o.motion.morph;
      const mixRight = morph
        ? window01(time, 0.12 * loop, 0.52 * loop, 0.08 * loop)
        : 0;
      const mixLeft = morph
        ? window01(time, 0.31 * loop, 0.73 * loop, 0.08 * loop)
        : 0;
      const glitch = !still && o.motion.glitch;
      const shimmer = still ? 0 : (o.motion.shimmer / 100) * 0.12;
      const shimmerRate =
        (Math.max(1, Math.round((3.2 * loop) / TAU)) * TAU) / loop;
      const tick = Math.floor(time * 7);
      const threshold = d.threshold / 100;
      const softness = Math.max(0.05, d.softness / 100);
      const gamma = 1 / Math.max(0.3, d.contrast);
      const detail = Math.max(0, d.detail);
      const levels = Math.max(2, Math.round(d.levels));
      const minDot = Math.min(1, Math.max(0.05, d.minDot / 100));
      const gap = o.hands.gap / 100;
      const gapInner = gap * 0.32;
      const maxR = (step * d.size) / 200;
      const L = o.lens;
      const lensOn = !still && L.enabled;
      const lensTarget = lensOn && S.pointer.inside ? 1 : 0;
      const ease = 1 - Math.exp(-dt * 7);
      S.lensAmt += (lensTarget - S.lensAmt) * ease;
      if (S.pointer.inside) {
        S.lensX += (S.pointer.x - S.lensX) * Math.min(1, ease * 2.2);
        S.lensY += (S.pointer.y - S.lensY) * Math.min(1, ease * 2.2);
      }
      const lensAmt = lensOn ? S.lensAmt : 0;
      const radius = Math.max(20, L.radius);
      const radius2 = radius * radius;
      const swell = L.swell / 100;
      const push = L.push;
      const reveal = L.reveal / 100;
      const lx = S.lensX;
      const ly = S.lensY;
      if (!still && o.motion.intro) S.introT += dt;
      const intro = still || !o.motion.intro ? 2 : S.introT / INTRO_S;

      const path = new Path2D();
      const half = cols / 2;
      const lastC = cols - 1;
      const lastR = rows - 1;
      for (let r = 0; r < rows; r++) {
        let shift = 0;
        if (glitch && hash(r, tick) > 0.965)
          shift = Math.round((hash(tick + 0.5, r) - 0.5) * 8);
        const y = (r + 0.5) * rowStep;
        const up = (r > 0 ? r - 1 : 0) * cols;
        const down = (r < lastR ? r + 1 : lastR) * cols;
        const row = r * cols;
        const dy = y - ly;
        for (let c = 0; c < cols; c++) {
          let sc = c - shift;
          if (sc < 0) sc = 0;
          else if (sc > lastC) sc = lastC;
          const seed = seeds[row + c];
          const mix = c < half ? mixLeft : mixRight;
          const ink = seed < mix ? inkB : inkA;
          const v = ink[row + sc];
          let tone =
            v +
            detail *
              (v -
                (ink[row + (sc > 0 ? sc - 1 : 0)] +
                  ink[row + (sc < lastC ? sc + 1 : lastC)] +
                  ink[up + sc] +
                  ink[down + sc]) *
                  0.25);
          const x = (c + 0.5) * step;
          let k = 0;
          let dx = 0;
          if (lensAmt > 2e-3) {
            dx = x - lx;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < radius2) {
              const u = 1 - Math.sqrt(dist2) / radius;
              k = u * u * (3 - 2 * u) * lensAmt;
              tone += reveal * k * Math.min(1, v * 4);
            }
          }
          let a = (tone - threshold) / softness;
          if (a <= 0) continue;
          if (a > 1) a = 1;
          a **= gamma;
          // Cells near the pose boundary fade, and some drop further, so the
          // swap reads as a dissolve.
          if (mix > 1e-3 && mix < 0.999) {
            const e = Math.abs(seed - mix);
            if (e < 0.12) {
              a *= e / 0.12;
              if (hash(c + tick, r) <= 0.4) a *= 0.3;
            }
          }
          if (shimmer)
            a *=
              1 - shimmer + shimmer * Math.sin(time * shimmerRate + seed * 40);
          if (gap > 0) a *= smoothstep(gapInner, gap, Math.abs(x / W - 0.5));
          if (intro < 1.6)
            a *= smoothstep(seed * 0.75, seed * 0.75 + 0.3, intro);
          const lvl = Math.round(a * levels);
          if (lvl <= 0) continue;
          let rad = maxR * Math.max(minDot, lvl / levels);
          let px = x;
          let py = y;
          if (k > 0) {
            rad *= 1 + swell * k;
            const len = Math.hypot(dx, dy) || 1;
            px += (dx / len) * push * k;
            py += (dy / len) * push * k;
          }
          addDot(path, d.shape, px, py, rad);
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = inkFill(dt, still);
      ctx.fill(path);
    };

    let inView = typeof IntersectionObserver === "undefined";
    let visible = typeof document === "undefined" || !document.hidden;
    const mq = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    S.reduce = !!mq?.matches;
    const canRun = () => alive && inView && visible && !S.reduce;

    let raf = 0;
    let last = 0;
    let clock = 0;
    const frame = (now: number) => {
      raf = 0;
      if (!canRun()) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const o = optsRef.current;
      const loop = Math.max(1, o.motion.loop);
      clock = (clock + dt * Math.max(0, o.motion.speed)) % loop;
      render(clock, false, dt);
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const start = () => {
      if (!raf && canRun()) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const still = () => render(0, true, 0);
    const resume = () => {
      if (S.reduce) still();
      else if (!raf && canRun()) start();
    };
    S.relayout = layout;
    S.still = still;
    kick.current = resume;
    layout();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            layout();
            if (S.reduce) still();
          })
        : null;
    ro?.observe(root);
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              inView = entries.some((e) => e.isIntersecting);
              if (inView) start();
              else stop();
            },
            { rootMargin: "80px" },
          )
        : null;
    io?.observe(root);
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onMotionPref = () => {
      S.reduce = !!mq?.matches;
      if (S.reduce) {
        stop();
        still();
      } else start();
    };
    mq?.addEventListener?.("change", onMotionPref);

    // Pointer in layout px, so the lens matches the dot grid under scaling.
    const toLocal = (e: PointerEvent) => {
      const b = root.getBoundingClientRect();
      const s = b.width ? S.W / b.width : 1;
      return { x: (e.clientX - b.left) * s, y: (e.clientY - b.top) * s };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      if (!S.pointer.inside && S.lensAmt < 0.02) {
        S.lensX = p.x;
        S.lensY = p.y;
      }
      S.pointer.x = p.x;
      S.pointer.y = p.y;
      S.pointer.inside = true;
    };
    const onLeave = () => {
      S.pointer.inside = false;
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    resume();

    return () => {
      alive = false;
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq?.removeEventListener?.("change", onMotionPref);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      kick.current = () => {};
    };
  }, [S]);

  const { srcs, crops } = sources(opts.hands);
  const srcKey = `${srcs.join("|")}#${opts.hands.source}`;
  useEffect(() => {
    let cancelled = false;
    const unique = Array.from(new Set(srcs.filter(Boolean)));
    if (!unique.length) {
      S.tiles = null;
      kick.current();
      return;
    }
    Promise.all(unique.map(loadAny)).then((imgs) => {
      if (cancelled) return;
      const bySrc = new Map<string, HTMLImageElement | null>();
      unique.forEach((src, i) => bySrc.set(src, imgs[i]));
      const tiles = srcs.map((src, i) => {
        const img = src ? bySrc.get(src) : null;
        return img ? toTile(img, crops[i]) : null;
      });
      S.tiles = tiles;
      S.tainted = isTainted(tiles.find(Boolean) || null);
      S.introT = 0;
      if (!S.tainted && canvasRef.current)
        canvasRef.current.style.mixBlendMode = "";
      kick.current();
    });
    return () => {
      cancelled = true;
    };
  }, [srcKey, S]);

  // Density and row spacing rebuild the grid; any other change only drops the
  // cached dot pattern.
  useEffect(() => {
    if (
      opts.dots.density !== S.lastDensity ||
      opts.dots.rowGap !== S.lastRowGap
    )
      S.relayout();
    else S.pattern = null;
    if (S.reduce) S.still();
  });

  const glowPx = t.glow * (glow / 100);
  const showScan = scanlines && t.scan > 0;
  const showVignette = vignette && t.vignette > 0;

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: t.bg,
        transition: "background-color .6s ease",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          filter:
            glowPx > 0
              ? `drop-shadow(0 0 ${glowPx.toFixed(1)}px ${rgba(t.inkA, 0.55)})`
              : "none",
          transition: "filter .6s ease",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: scanlineBg(t),
          opacity: showScan ? 1 : 0,
          transition: "opacity .6s ease",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: vignetteBg(t),
          opacity: showVignette ? 1 : 0,
          transition: "opacity .6s ease",
        }}
      />
    </div>
  );
}
