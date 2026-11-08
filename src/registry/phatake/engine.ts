/**
 * Isometric pixel renderer: fixed 30-degree orthographic camera, a depth
 * buffer, hue-shifted ramps with Bayer dither, long screen-right shadows,
 * depth-buffer edges, swaying grass and one kind of tree.
 *
 * Ported to a typed factory from Pixel Plays engine.js
 * (https://github.com/amirmushichge/pixel-plays).
 * MIT License, Copyright (c) AmirMushich and contributors. Permission is
 * hereby granted, free of charge, to any person obtaining a copy of this
 * software, to deal in it without restriction, provided this notice is kept.
 * The software is provided "as is", without warranty of any kind.
 *
 * `createEngine` owns one 360 by 280 canvas. Everything draws into `pix`
 * (one Uint32 per pixel) and `zb` (depth, larger is nearer), then `present`
 * copies the frame to the canvas.
 */

export type RGB = readonly [number, number, number];
export type Vec3 = readonly [number, number, number];
export type SphereMode = "rough" | "solid" | "gloss";

export interface SceneOptions {
  /** Moves the world origin down the canvas, in pixels. */
  originY?: number;
  /** Shadow travel per unit of height along world x and y. */
  shadowX?: number;
  shadowY?: number;
}

export const W = 360;
export const H = 280;
export const S = 10;
export const SIN = 0.5;
export const COS = Math.sqrt(3) / 2;
export const R2 = Math.SQRT2;

export const KIND_NONE = 0;
export const KIND_GRASS = 3;
export const WIND_FPS = 8;
export const GRASS: readonly RGB[] = [
  [34, 62, 50],
  [52, 88, 52],
  [82, 118, 54],
  [124, 146, 62],
  [168, 172, 76],
];
const COOL: RGB = [46, 38, 84];
const WARM: RGB = [255, 232, 180];
const BARK: RGB = [92, 74, 60];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);
const GRADIENT_Y = COS / (S * SIN);
const EDGE = 0.28;

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

/** Packs a colour into the canvas's little-endian RGBA Uint32. */
export const rgb = (r: number, g: number, b: number) =>
  ((255 << 24) |
    (Math.min(255, b | 0) << 16) |
    (Math.min(255, g | 0) << 8) |
    Math.min(255, r | 0)) >>>
  0;
export const pack = (c: RGB) => rgb(c[0], c[1], c[2]);

export function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = ease(x - ix);
  const fy = ease(y - iy);
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), fx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx),
    fy,
  );
}
export const bayerAt = (ix: number, iy: number) =>
  BAYER[(iy & 3) * 4 + (ix & 3)];

// hue-shifted ramp: shadows drift to violet, lights drift to warm yellow
const ramps = new WeakMap<RGB, number[]>();
export function rampOf(c: RGB) {
  const cached = ramps.get(c);
  if (cached) return cached;
  const mix = (m: number, tone: RGB, k: number) =>
    rgb(
      lerp(c[0] * m, tone[0], k),
      lerp(c[1] * m, tone[1], k),
      lerp(c[2] * m, tone[2], k),
    );
  const ramp = [
    mix(0.4, COOL, 0.34),
    mix(0.62, COOL, 0.18),
    mix(0.84, COOL, 0.05),
    mix(1, WARM, 0),
    mix(1.1, WARM, 0.22),
  ];
  ramps.set(c, ramp);
  return ramp;
}

interface Tuft {
  ix: number;
  iy: number;
  i: number;
  height: number;
  base: number;
  phase: number;
  bloom: number;
}
interface Leaf {
  x: number;
  y: number;
  z: number;
  k: number;
  r: number;
  pixels: number[];
}

const CROWN: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.1, 0, 3.7, 1.6],
  [-1.4, -0.7, 3.3, 1.2],
  [1.6, 0.7, 3.4, 1.25],
  [-0.6, 1.1, 3.9, 1.1],
  [0.9, -1.1, 4, 1.1],
  [0.2, 0.1, 4.9, 1.05],
];
const LEAF_DEEP: RGB = [58, 84, 62];
const LEAF_MID: RGB = [100, 126, 78];
const LEAF_SILVER: RGB = [146, 162, 112];
const ARROW = [
  "....ooooo....",
  "....oXXXo....",
  "....oXXXo....",
  "....oXXXo....",
  "oooooXXXooooo",
  "oXXXXXXXXXXXo",
  ".oXXXXXXXXXo.",
  "..oXXXXXXXo..",
  "...oXXXXXo...",
  "....oXXXo....",
  ".....oXo.....",
  "......o......",
];

export function createEngine(
  canvas: HTMLCanvasElement,
  scene: SceneOptions = {},
) {
  const OX = W / 2;
  const OY = H / 2 + (scene.originY ?? 0);
  const SHADOW_X = scene.shadowX ?? 1.3;
  const SHADOW_Y = scene.shadowY ?? -0.12;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("phatake: 2d canvas context unavailable");
  const image = ctx.createImageData(W, H);
  const pix = new Uint32Array(image.data.buffer);
  const zb = new Float32Array(W * H);
  const bakedPix = new Uint32Array(W * H);
  const bakedZ = new Float32Array(W * H);
  const ground = new Uint8Array(W * H);
  const shadowMask = new Uint8Array(W * H);
  const groundZ = new Float32Array(W * H);
  const kinds = new Uint8Array(W * H);
  const staticShadow = new Uint8Array(W * H);
  const still =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tufts: Tuft[] = [];
  const leaves: Leaf[] = [];
  const tuftLit = GRASS.map(pack);
  const tuftDark = GRASS.map((c) => rgb(c[0] * 0.54, c[1] * 0.52, c[2] * 0.72));
  let capture: number[] | null = null; // when set, sphere() records pixels instead of drawing them

  function tint(i: number, r: number, g: number, b: number) {
    const c = pix[i];
    pix[i] = rgb((c & 255) * r, ((c >> 8) & 255) * g, ((c >> 16) & 255) * b);
  }
  function project(x: number, y: number, z: number) {
    const u = (x - y) / R2;
    const v = (x + y) / R2;
    return {
      sx: OX + u * S,
      sy: OY + (v * SIN - z * COS) * S,
      d: v * COS + z * SIN,
    };
  }
  function unproject(sx: number, sy: number) {
    const u = (sx - OX) / S;
    const v = (sy - OY) / (S * SIN);
    return { x: (u + v) / R2, y: (v - u) / R2 };
  }
  function sphere(
    x: number,
    y: number,
    z: number,
    r: number,
    c: RGB,
    mode?: SphereMode,
  ) {
    const ramp = rampOf(c);
    const p = project(x, y, z);
    const rp = Math.max(r * S, 0.75);
    const y0 = Math.max(0, Math.floor(p.sy - rp));
    const y1 = Math.min(H - 1, Math.ceil(p.sy + rp));
    const x0 = Math.max(0, Math.floor(p.sx - rp));
    const x1 = Math.min(W - 1, Math.ceil(p.sx + rp));
    for (let iy = y0; iy <= y1; iy++)
      for (let ix = x0; ix <= x1; ix++) {
        const dx = (ix + 0.5 - p.sx) / rp;
        const dy = (iy + 0.5 - p.sy) / rp;
        const nn = dx * dx + dy * dy;
        if (nn > 1) continue;
        const nz = Math.sqrt(1 - nn);
        const d = p.d + r * nz;
        const i = iy * W + ix;
        if (d <= zb[i]) continue;
        let l = clamp(-0.55 * dx - 0.6 * dy + 0.58 * nz, 0, 1);
        if (mode === "rough") l += (hash(ix, iy) - 0.5) * 0.55;
        if (dy > 0.35) l = Math.max(l, 0.12 + dy * 0.24); // warm light bouncing off the ground
        if (capture) {
          capture.push(
            ix,
            iy,
            d,
            ramp[
              clamp(
                Math.floor(l * 4.4 + 0.2 + (bayerAt(ix, iy) - 0.5) * 0.7),
                0,
                4,
              )
            ],
          );
          continue;
        }
        zb[i] = d;
        if (mode === "gloss" && l > 0.9) {
          pix[i] = rgb(255, 250, 232);
          continue;
        }
        // figures get flat bands with no dither, so they read as sharp shapes against the textured ground
        if (mode === "solid") {
          pix[i] = ramp[clamp(Math.floor(l * 4.4 + 0.2), 1, 4)];
          continue;
        }
        pix[i] =
          ramp[
            clamp(
              Math.floor(l * 4.4 + 0.2 + (bayerAt(ix, iy) - 0.5) * 0.7),
              0,
              4,
            )
          ];
      }
  }
  function capsule(
    a: Vec3,
    b: Vec3,
    r0: number,
    r1: number,
    colorOf: (z: number) => RGB,
    mode?: SphereMode,
  ) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(1, Math.ceil(len / (Math.min(r0, r1) * 0.45)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const z = lerp(a[2], b[2], t);
      sphere(
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        z,
        lerp(r0, r1, t),
        colorOf(z),
        mode,
      );
    }
  }
  function castShadow(
    x: number,
    y: number,
    z: number,
    r: number,
    strength = 1,
    dither = 0.4,
  ) {
    const p = project(x + SHADOW_X * z, y + SHADOW_Y * z, 0);
    const rx = r * S * 1.05;
    const ry = rx * SIN + 1;
    const y0 = Math.max(0, Math.floor(p.sy - ry));
    const y1 = Math.min(H - 1, Math.ceil(p.sy + ry));
    const x0 = Math.max(0, Math.floor(p.sx - rx));
    const x1 = Math.min(W - 1, Math.ceil(p.sx + rx));
    for (let iy = y0; iy <= y1; iy++)
      for (let ix = x0; ix <= x1; ix++) {
        const dx = (ix + 0.5 - p.sx) / rx;
        const dy = (iy + 0.5 - p.sy) / ry;
        if (dx * dx + dy * dy + (bayerAt(ix, iy) - 0.5) * dither > 1) continue;
        const i = iy * W + ix;
        if (shadowMask[i] < strength) shadowMask[i] = strength;
      }
  }
  function applyShadows(refZ: Float32Array) {
    for (let i = 0; i < pix.length; i++) {
      const s = shadowMask[i];
      if (!s) continue;
      shadowMask[i] = 0;
      if (!ground[i] || zb[i] !== refZ[i]) continue;
      if (s === 1) tint(i, 0.54, 0.52, 0.72);
      else tint(i, 0.36, 0.34, 0.56);
    }
  }
  // pixel-art edges from the depth buffer. The ground is never touched, so nothing halos around a figure:
  // an object darkens its own silhouette against the ground, and gets a warm rim only over another object
  function shadeEdges() {
    for (let iy = 1; iy < H - 1; iy++)
      for (let ix = 1; ix < W - 1; ix++) {
        const i = iy * W + ix;
        const d = zb[i];
        if (d < -1e8 || d === groundZ[i]) continue;
        const a = i - W;
        const b = i + W;
        const c = i - 1;
        const e = i + 1;
        if (
          zb[a] === groundZ[a] ||
          zb[b] === groundZ[b] ||
          zb[c] === groundZ[c] ||
          zb[e] === groundZ[e]
        ) {
          tint(i, 0.68, 0.66, 0.76);
        } else if (d - zb[a] - GRADIENT_Y > EDGE || d - zb[c] > EDGE) {
          const p = pix[i];
          pix[i] = rgb(
            lerp(p & 255, WARM[0], 0.3),
            lerp((p >> 8) & 255, WARM[1], 0.3),
            lerp((p >> 16) & 255, WARM[2], 0.22),
          );
        } else if (zb[e] - d > EDGE || zb[b] - GRADIENT_Y - d > EDGE) {
          tint(i, 0.74, 0.72, 0.82);
        }
      }
  }
  function growGrass() {
    tufts.length = 0;
    for (let iy = 3; iy < H; iy++)
      for (let ix = 0; ix < W; ix++) {
        const i = iy * W + ix;
        if (kinds[i] !== KIND_GRASS || hash(ix * 3, iy * 5) > 0.17) continue;
        tufts.push({
          ix,
          iy,
          i,
          height: 1 + ((hash(ix, iy * 2) * 3) | 0),
          base: Math.round(noise(ix * 0.09, iy * 0.18) * 2.2),
          phase: ix * 0.11 + iy * 0.19 + hash(ix, iy) * 0.9,
          bloom:
            hash(ix * 7, iy) < 0.022
              ? hash(ix, iy) > 0.5
                ? rgb(250, 246, 226)
                : rgb(240, 200, 84)
              : 0,
        });
      }
  }
  function drawTufts(t: number) {
    for (const tuft of tufts) {
      const gust =
        Math.sin(t * 0.8 + tuft.phase) +
        0.5 * Math.sin(t * 2.1 + tuft.phase * 2.3);
      const colors = staticShadow[tuft.i] ? tuftDark : tuftLit;
      for (let k = 1; k <= tuft.height; k++) {
        const jx = tuft.ix + Math.round((gust * 0.95 * k) / 3);
        const jy = tuft.iy - k;
        if (jx < 0 || jx >= W) continue;
        const j = jy * W + jx;
        if (
          (kinds[j] !== KIND_GRASS && kinds[j] !== KIND_NONE) ||
          zb[j] !== groundZ[j]
        )
          continue;
        pix[j] =
          tuft.bloom && k === tuft.height
            ? tuft.bloom
            : colors[clamp(tuft.base + k + (gust > 1 ? 1 : 0), 1, 4)];
      }
    }
  }
  function drawLeaves(t: number) {
    for (const leaf of leaves) {
      const reach = clamp((leaf.z - 2.5) / 3, 0.3, 1);
      const swayX =
        (Math.sin(t * 0.9 + leaf.x * 0.5 + leaf.z * 0.7) +
          0.55 * Math.sin(t * 2.3 + leaf.k * 1.7)) *
        reach;
      const dx = Math.round(swayX * 0.9);
      const dy = Math.round(Math.sin(t * 1.3 + leaf.y + leaf.k) * reach * 0.45);
      const px = leaf.pixels;
      for (let n = 0; n < px.length; n += 4) {
        const ix = px[n] + dx;
        const iy = px[n + 1] + dy;
        if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
        const i = iy * W + ix;
        if (px[n + 2] <= zb[i]) continue;
        zb[i] = px[n + 2];
        pix[i] = px[n + 3];
      }
      if (leaf.k % 2 === 0)
        castShadow(leaf.x + swayX * 0.12, leaf.y, leaf.z, leaf.r);
    }
  }
  function bakeOcclusion() {
    const offsets: [number, number][] = [];
    for (const r of [2, 4])
      for (let k = 0; k < 8; k++) {
        offsets.push([
          Math.round(Math.cos((k * Math.PI) / 4) * r),
          Math.round(Math.sin((k * Math.PI) / 4) * r * 0.7),
        ]);
      }
    for (let iy = 4; iy < H - 4; iy++)
      for (let ix = 4; ix < W - 4; ix++) {
        const i = iy * W + ix;
        if (!ground[i] || zb[i] !== groundZ[i]) continue;
        let hits = 0;
        for (const [ox, oy] of offsets) {
          const j = (iy + oy) * W + ix + ox;
          if (zb[j] !== groundZ[j]) hits++;
        }
        if (!hits) continue;
        if (hits >= 8) tint(i, 0.56, 0.54, 0.72);
        else if (hits / 8 > bayerAt(ix, iy)) tint(i, 0.74, 0.72, 0.84);
      }
  }
  // a gnarled trunk, then a dark core under silver-green leaf clusters that sway in drawLeaves
  function growTree(x: number, y: number, scale = 1, count = 420, seed = 0) {
    const bark = () => BARK;
    const s = scale;
    capsule(
      [x, y, 0],
      [x + 0.3 * s, y + 0.1 * s, 2.2 * s],
      0.36 * s,
      0.22 * s,
      bark,
      "rough",
    );
    capsule(
      [x + 0.3 * s, y + 0.1 * s, 2.2 * s],
      [x - 0.8 * s, y - 0.4 * s, 3.3 * s],
      0.2 * s,
      0.13 * s,
      bark,
      "rough",
    );
    capsule(
      [x + 0.3 * s, y + 0.1 * s, 2.2 * s],
      [x + 1.2 * s, y + 0.4 * s, 3.4 * s],
      0.2 * s,
      0.13 * s,
      bark,
      "rough",
    );
    leaves.length = 0;
    for (let n = 0; n < count; n++) {
      const k = n + seed;
      const [cx, cy, cz, spread] = CROWN[n % CROWN.length];
      const a = hash(k, 7) * 6.283;
      const tilt = hash(k, 8) * 2 - 1;
      const d = Math.cbrt(hash(k, 9)) * spread;
      const flat = Math.sqrt(1 - tilt * tilt);
      const rx = cx + Math.cos(a) * flat * d;
      const ry = cy + Math.sin(a) * flat * d;
      const rz = cz + tilt * d * 0.8;
      const tone = hash(k, 10) + (rz - 4.2) * 0.22 + (d / spread - 0.5) * 0.3;
      const leaf =
        tone > 0.72 ? LEAF_SILVER : tone > 0.3 ? LEAF_MID : LEAF_DEEP;
      const pixels: number[] = [];
      capture = pixels;
      sphere(
        x + rx * s,
        y + ry * s,
        rz * s,
        (0.2 + hash(k, 11) * 0.22) * s,
        leaf,
        "rough",
      );
      capture = null;
      leaves.push({
        x: x + rx * s,
        y: y + ry * s,
        z: rz * s,
        k,
        r: 0.42 * s,
        pixels,
      });
    }
  }
  function drawDots(
    points: ReadonlyArray<readonly [number, number]>,
    color: number,
  ) {
    for (const [sx, sy] of points) {
      const ix = sx | 0;
      const iy = sy | 0;
      if (ix >= 0 && iy >= 0 && ix < W && iy < H) pix[iy * W + ix] = color;
    }
  }
  const INK = rgb(28, 27, 25);
  const SIGNAL = rgb(255, 214, 10);
  const PAPER = rgb(255, 255, 255);
  // a bobbing arrow whose tip points at (sx, sy), haloed so it separates from busy detail behind it
  function drawArrow(sx: number, sy: number, time: number) {
    const bob = still ? 0 : (Math.floor(time * 3) % 2) * 2;
    const left = Math.round(sx) - 6;
    const top = Math.round(sy) - ARROW.length - bob;
    const ink: [number, number][] = [];
    const fill: [number, number][] = [];
    ARROW.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell === "o") ink.push([left + x, top + y]);
        if (cell === "X") fill.push([left + x, top + y]);
      });
    });
    const halo: [number, number][] = [];
    for (const [x, y] of ink)
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ])
        halo.push([x + dx, y + dy]);
    drawDots(halo, PAPER);
    drawDots(ink, INK);
    drawDots(fill, SIGNAL);
  }
  function present() {
    ctx?.putImageData(image, 0, 0);
  }

  return {
    still,
    shadowX: SHADOW_X,
    shadowY: SHADOW_Y,
    pix,
    zb,
    bakedPix,
    bakedZ,
    ground,
    shadowMask,
    groundZ,
    kinds,
    staticShadow,
    tint,
    project,
    unproject,
    sphere,
    capsule,
    castShadow,
    applyShadows,
    shadeEdges,
    growGrass,
    drawTufts,
    drawLeaves,
    bakeOcclusion,
    growTree,
    drawArrow,
    present,
  };
}

export type Engine = ReturnType<typeof createEngine>;
