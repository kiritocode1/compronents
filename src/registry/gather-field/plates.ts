import { clamp, smoothstep } from "./motion";

export const PLATE_IDS = ["sphere", "ripple", "taiji", "ring"] as const;
export type PlateId = (typeof PLATE_IDS)[number];

export const PLATE_LABELS: Record<PlateId, string> = {
  sphere: "Orb",
  ripple: "Ripple",
  taiji: "Taiji",
  ring: "Ring",
};

export function isPlateId(value: string): value is PlateId {
  return (PLATE_IDS as readonly string[]).includes(value);
}

export type PaintedPlate = {
  rgba: Uint8ClampedArray;
  depth: Float32Array;
};

/** Integer hash to 0..1. */
function hash(x: number, y: number) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth value noise, 0..1. */
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(x: number, y: number, octaves: number) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum;
}

// Warm bone for the orb, plain white for the rest.
const TINT: Record<PlateId, readonly [number, number, number]> = {
  sphere: [1, 0.97, 0.925],
  ripple: [0.92, 0.97, 1],
  taiji: [1, 0.985, 0.95],
  ring: [1, 1, 1],
};

function shadeAt(id: PlateId, u: number, v: number) {
  if (id === "sphere") {
    const R = 0.86;
    const pu = u / R;
    const pv = v / R;
    const r2 = pu * pu + pv * pv;
    if (r2 > 1) {
      // a faint scatter of dust round the orb
      const speck = hash(Math.floor(u * 900), Math.floor(v * 900)) > 0.9994;
      return { shade: speck ? 0.5 : 0, depth: 0.5 };
    }
    const nz = Math.sqrt(1 - r2);
    // light from the upper left, a little in front
    const lit = -0.58 * pu + 0.46 * pv + 0.67 * nz;
    const body = smoothstep(-0.7, 0.95, lit);
    // broad maria, then fine grit
    const maria = fbm(pu * 2.4 + 3.1, pv * 2.4 - 1.7, 4);
    const grit = fbm(pu * 14 + 9.0, pv * 14 + 4.0, 3);
    const surface = 0.66 + 0.5 * maria + 0.1 * (grit - 0.5);
    const shade = clamp(body ** 0.85 * surface + 0.09 * nz, 0, 1);
    return { shade, depth: 0.2 + 0.8 * nz };
  }

  if (id === "ripple") {
    const d = Math.hypot(u, v);
    if (d > 1.08) return { shade: 0, depth: 0 };
    const crest = Math.max(0, Math.sin(d * 27 - 0.4)) ** 2.5;
    const shade = crest * Math.exp(-d * 0.65);
    return { shade, depth: shade };
  }

  if (id === "taiji") {
    const r2 = u * u + v * v;
    if (r2 > 0.9) return { shade: 0, depth: 0 };
    const top = u * u + (v + 0.42) ** 2 < 0.42 ** 2;
    const bot = u * u + (v - 0.42) ** 2 < 0.42 ** 2;
    let white = u < 0;
    if (top) white = false;
    if (bot) white = true;
    if (u * u + (v + 0.42) ** 2 < 0.012) white = true;
    if (u * u + (v - 0.42) ** 2 < 0.012) white = false;
    const rim = smoothstep(0.9, 0.84, r2);
    const shade = (white ? 1 : 0) * rim;
    return { shade, depth: shade * 0.35 + 0.45 };
  }

  const d = Math.hypot(u, v);
  const ring = Math.exp(-((d - 0.62) ** 2) * 80);
  const ang = Math.atan2(v, u);
  const gap = Math.abs(ang - 0.55) < 0.42 ? 0.04 : 1;
  const spokes =
    Math.max(0, Math.cos(ang * 3)) ** 20 * Math.exp(-((d - 0.62) ** 2) * 30);
  const shade = clamp(ring * gap + spokes * 0.65, 0, 1);
  return { shade, depth: shade };
}

/** High-contrast plate. Bright pixels become the sand. */
export function paintPlate(id: PlateId, size: number): PaintedPlate {
  const rgba = new Uint8ClampedArray(size * size * 4);
  const depth = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = ((x + 0.5) / size) * 2 - 1;
      const v = 1 - ((y + 0.5) / size) * 2;
      const { shade, depth: z } = shadeAt(id, u, v);
      const i = y * size + x;
      const [tr, tg, tb] = TINT[id];
      const o = i * 4;
      rgba[o] = Math.round(shade * tr * 255);
      rgba[o + 1] = Math.round(shade * tg * 255);
      rgba[o + 2] = Math.round(shade * tb * 255);
      rgba[o + 3] = 255;
      depth[i] = z;
    }
  }
  return { rgba, depth };
}

export function imageToGrid(
  image: CanvasImageSource,
  size: number,
  sourceWidth: number,
  sourceHeight: number,
): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("gather-field: could not read the picture");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  const scale = Math.min(size / sourceWidth, size / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
  return ctx.getImageData(0, 0, size, size).data;
}
