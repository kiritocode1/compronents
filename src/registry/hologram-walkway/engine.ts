// Hologram walkway: a giant pink hologram crouches over a rainy elevated walkway and points at the man
// below her. Software-rendered isometric pixel scene: fixed 30 degree orthographic camera, depth buffer,
// ordered dither, a ray-marched distance model for the hologram, and a live walker, rain and glitch.
//
// The projection, depth buffer, sphere/capsule rasteriser, shadow mask and figure rig are adapted from
// the Pixel Plays engine (github.com/amirmushichge/pixel-plays), under this licence:
//
// MIT License
//
// Copyright (c) 2026 Amir Mushich
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { FRAMES, GIANT, type HoloFrame } from "./hologram";
import {
  bayerAt,
  COS,
  type Color,
  clamp,
  hash,
  lerp,
  lerp3,
  noise,
  R2,
  rgb,
  SIN,
  type Vec3,
} from "./pixel";

export const WALKWAY_WIDTH = 960;
export const WALKWAY_HEIGHT = 540;

export interface WalkwayCallbacks {
  /** Her current line, or null when she is silent. */
  onSubtitle: (text: string | null) => void;
  /** The walkway is baked and the scene is running. Her frames keep baking in workers. */
  onReady: () => void;
}

export interface WalkwayController {
  destroy: () => void;
}

/** Mounts the scene on `canvas` and starts it. Call `destroy()` to stop the loop and remove listeners. */
export function mountHologramWalkway(
  canvas: HTMLCanvasElement,
  callbacks: WalkwayCallbacks,
): WalkwayController {
  /* ---------- renderer (adapted from Pixel Plays) ---------- */
  const W = WALKWAY_WIDTH,
    H = WALKWAY_HEIGHT,
    S = 26;
  const SHADOW_X = 0.9,
    SHADOW_Y = 0.35;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Hologram walkway needs a 2D canvas context.");
  const image = ctx.createImageData(W, H);

  // A render target: colour, depth, which pixels are ground, the ground's depth, and the shadow mask.
  // The walkway bakes once into a wide target; every frame draws into the canvas-sized one.
  interface Target {
    w: number;
    h: number;
    ox: number;
    oy: number;
    pix: Uint32Array;
    zb: Float32Array;
    ground: Uint8Array;
    groundZ: Float32Array;
    shadow: Uint8Array;
  }
  const makeTarget = (
    w: number,
    h: number,
    ox: number,
    oy: number,
    pixels = new Uint32Array(w * h),
  ): Target => ({
    w,
    h,
    ox,
    oy,
    pix: pixels,
    zb: new Float32Array(w * h),
    ground: new Uint8Array(w * h),
    groundZ: new Float32Array(w * h),
    shadow: new Uint8Array(w * h),
  });
  const screen = makeTarget(
    W,
    H,
    W / 2 - 30,
    H / 2 + 55,
    new Uint32Array(image.data.buffer),
  );
  let TW = W,
    TH = H,
    OX = screen.ox,
    OY = screen.oy;
  let pix = screen.pix,
    zb = screen.zb,
    ground = screen.ground,
    groundZ = screen.groundZ,
    shadowMask = screen.shadow;
  const renderInto = (t: Target) => {
    TW = t.w;
    TH = t.h;
    OX = t.ox;
    OY = t.oy;
    pix = t.pix;
    zb = t.zb;
    ground = t.ground;
    groundZ = t.groundZ;
    shadowMask = t.shadow;
  };

  const COOL: Color = [46, 38, 84],
    WARM: Color = [255, 232, 180];
  const SHOE: Color = [40, 36, 44];
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tint = (i: number, r: number, g: number, b: number) => {
    const c = pix[i];
    pix[i] = rgb((c & 255) * r, ((c >> 8) & 255) * g, ((c >> 16) & 255) * b);
  };
  // hue-shifted ramp: shadows drift to violet, lights drift to warm yellow
  const ramps = new Map<Color, number[]>();
  const rampOf = (c: Color) => {
    const cached = ramps.get(c);
    if (cached) return cached;
    const mix = (m: number, t: Color, k: number) =>
      rgb(
        lerp(c[0] * m, t[0], k),
        lerp(c[1] * m, t[1], k),
        lerp(c[2] * m, t[2], k),
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
  };
  const project = (x: number, y: number, z: number) => {
    const u = (x - y) / R2,
      v = (x + y) / R2;
    return {
      sx: OX + u * S,
      sy: OY + (v * SIN - z * COS) * S,
      d: v * COS + z * SIN,
    };
  };
  const unproject = (sx: number, sy: number) => {
    const u = (sx - OX) / S,
      v = (sy - OY) / (S * SIN);
    return { x: (u + v) / R2, y: (v - u) / R2 };
  };
  // figures get flat bands with no dither, so they read as sharp shapes against the textured ground
  const sphere = (x: number, y: number, z: number, r: number, c: Color) => {
    const ramp = rampOf(c);
    const p = project(x, y, z),
      rp = Math.max(r * S, 0.75);
    const y0 = Math.max(0, Math.floor(p.sy - rp)),
      y1 = Math.min(TH - 1, Math.ceil(p.sy + rp));
    const x0 = Math.max(0, Math.floor(p.sx - rp)),
      x1 = Math.min(TW - 1, Math.ceil(p.sx + rp));
    for (let iy = y0; iy <= y1; iy++)
      for (let ix = x0; ix <= x1; ix++) {
        const dx = (ix + 0.5 - p.sx) / rp,
          dy = (iy + 0.5 - p.sy) / rp,
          nn = dx * dx + dy * dy;
        if (nn > 1) continue;
        const nz = Math.sqrt(1 - nn),
          d = p.d + r * nz,
          i = iy * TW + ix;
        if (d <= zb[i]) continue;
        let l = clamp(-0.55 * dx - 0.6 * dy + 0.58 * nz, 0, 1);
        if (dy > 0.35) l = Math.max(l, 0.12 + dy * 0.24); // warm light bouncing off the ground
        zb[i] = d;
        pix[i] = ramp[clamp(Math.floor(l * 4.4 + 0.2), 1, 4)];
      }
  };
  const capsule = (a: Vec3, b: Vec3, r0: number, r1: number, color: Color) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(1, Math.ceil(len / (Math.min(r0, r1) * 0.45)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      sphere(
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t),
        lerp(r0, r1, t),
        color,
      );
    }
  };
  const castShadow = (
    x: number,
    y: number,
    z: number,
    r: number,
    strength = 1,
    dither = 0.4,
  ) => {
    const p = project(x + SHADOW_X * z, y + SHADOW_Y * z, 0);
    const rx = r * S * 1.05,
      ry = rx * SIN + 1;
    const y0 = Math.max(0, Math.floor(p.sy - ry)),
      y1 = Math.min(TH - 1, Math.ceil(p.sy + ry));
    const x0 = Math.max(0, Math.floor(p.sx - rx)),
      x1 = Math.min(TW - 1, Math.ceil(p.sx + rx));
    for (let iy = y0; iy <= y1; iy++)
      for (let ix = x0; ix <= x1; ix++) {
        const dx = (ix + 0.5 - p.sx) / rx,
          dy = (iy + 0.5 - p.sy) / ry;
        if (dx * dx + dy * dy + (bayerAt(ix, iy) - 0.5) * dither > 1) continue;
        const i = iy * TW + ix;
        if (shadowMask[i] < strength) shadowMask[i] = strength;
      }
  };
  const applyShadows = (refZ: Float32Array) => {
    for (let i = 0; i < pix.length; i++) {
      const s = shadowMask[i];
      if (!s) continue;
      shadowMask[i] = 0;
      if (!ground[i] || zb[i] !== refZ[i]) continue;
      if (s === 1) tint(i, 0.54, 0.52, 0.72);
      else tint(i, 0.36, 0.34, 0.56);
    }
  };
  const bakeOcclusion = () => {
    const offsets: [number, number][] = [];
    for (const r of [2, 4])
      for (let k = 0; k < 8; k++) {
        offsets.push([
          Math.round(Math.cos((k * Math.PI) / 4) * r),
          Math.round(Math.sin((k * Math.PI) / 4) * r * 0.7),
        ]);
      }
    for (let iy = 4; iy < TH - 4; iy++)
      for (let ix = 4; ix < TW - 4; ix++) {
        const i = iy * TW + ix;
        if (!ground[i] || zb[i] !== groundZ[i]) continue;
        let hits = 0;
        for (const [ox, oy] of offsets) {
          const j = (iy + oy) * TW + ix + ox;
          if (zb[j] !== groundZ[j]) hits++;
        }
        if (!hits) continue;
        if (hits >= 8) tint(i, 0.56, 0.54, 0.72);
        else if (hits / 8 > bayerAt(ix, iy)) tint(i, 0.74, 0.72, 0.84);
      }
  };
  const plot = (x: number, y: number, z: number, color: number) => {
    const p = project(x, y, z),
      ix = p.sx | 0,
      iy = p.sy | 0;
    if (ix < 0 || iy < 0 || ix >= TW || iy >= TH) return;
    const i = iy * TW + ix;
    if (p.d <= zb[i]) return;
    zb[i] = p.d;
    pix[i] = color;
  };
  // Bones drawn this frame; their shadows are cast after every actor is down.
  const bones: { a: Vec3; b: Vec3; r: number }[] = [];
  const bone = (a: Vec3, b: Vec3, r0: number, r1: number, color: Color) => {
    capsule(a, b, r0, r1, color);
    bones.push({ a, b, r: r0 });
  };
  const flushShadows = () => {
    for (const { a, b, r } of bones) {
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.25),
      );
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        castShadow(
          lerp(a[0], b[0], t),
          lerp(a[1], b[1], t),
          lerp(a[2], b[2], t),
          r * 0.9,
          1,
          0,
        );
      }
      if (a[2] < 0.25) castShadow(a[0], a[1], 0, 0.2, 2, 0); // contact under the feet
    }
    bones.length = 0;
  };
  interface Palette {
    shirt: Color;
    legs: Color;
    hair: Color;
    skin: Color;
  }

  /* ---------- palette ---------- */
  const VOID = rgb(7, 6, 11);
  const CONCRETE: Color[] = [
    [22, 22, 34],
    [30, 29, 44],
    [38, 36, 54],
    [48, 44, 64],
    [60, 54, 76],
  ];
  const STEEL: Color = [64, 68, 84]; // gunmetal
  const RAIL: Color = [58, 52, 70];
  const GLOW: Color = [255, 70, 186]; // her pink light
  /* ---------- the place ---------- */
  // The walkway runs endlessly from the lower left to the upper right. Its pattern repeats every P world
  // units (two gantries), which is KP screen pixels sideways and KP / 2 down, so a scrolled view is a
  // shifted window into one baked buffer.
  const KP = 184;
  const P = (KP * R2) / S;
  const DECK = { x0: 1.4, x1: 6.2 };
  const SPOT = { x: 3.4, y: 0.1 }; // under her finger
  const wrap = (y: number) => ((y % P) + P) % P;
  // a value that repeats every P along the walkway: blend f across one period so the seam is invisible
  const tileY = (f: (y: number) => number, y: number) => {
    const m = wrap(y),
      t = m / P;
    return f(m) * (1 - t) + f(m - P) * t;
  };
  const deckColor = (x: number, y: number, ix: number, iy: number) => {
    const slabLen = P / 6,
      slab = Math.floor(wrap(y) / slabLen),
      joint = wrap(y) % slabLen < slabLen * 0.025;
    let t =
      1.4 +
      (tileY((v) => noise(x * 0.9, v * 0.5), y) - 0.5) * 1.1 +
      (hash(slab, 3) - 0.5) * 0.5 +
      (bayerAt(ix, iy) - 0.5) * 0.55;
    if (joint) t -= 1;
    const c = CONCRETE[clamp(Math.round(t), 0, 4)];
    let r = c[0],
      g = c[1],
      b = c[2];
    // standing water catches the cyan lamps; her pink light is added live, so it follows her
    if (tileY((v) => noise(x * 0.55 + 9, v * 0.42), y) > 0.6) {
      if (hash(ix, Math.floor(iy / 6)) > 0.8) {
        r += 12;
        g += 30;
        b += 36;
      } else if (hash(ix, Math.floor(iy / 4) + 9) > 0.93) {
        r += 24;
        g += 26;
        b += 40;
      }
    }
    if (
      Math.abs(x - (DECK.x0 + 0.35)) < 0.04 ||
      Math.abs(x - (DECK.x1 - 0.35)) < 0.04
    ) {
      r += 26;
      g += 24;
      b += 28;
    }
    return rgb(r, g, b);
  };
  const REACH = 46; // world units baked either side of the origin, enough to cover the wide target
  const deckSides = () => {
    const step = 0.035;
    for (let y = -REACH; y <= REACH; y += step)
      for (let z = -0.9; z <= 0; z += step) {
        const p = project(DECK.x1, y, z),
          ix = p.sx | 0,
          iy = p.sy | 0;
        if (ix < 0 || iy < 0 || ix >= TW || iy >= TH) continue;
        const i = iy * TW + ix;
        if (p.d <= zb[i]) continue;
        zb[i] = p.d;
        const band =
          z > -0.1 ? 3 : z > -0.16 ? 0 : 1 + (bayerAt(ix, iy) > 0.7 ? 1 : 0);
        pix[i] = rgb(...CONCRETE[band]);
      }
  };
  // a box lit from behind: dark faces toward the viewer, a cool rim of city light along the top edge
  const SHEEN: Color = [140, 190, 225];
  const litBox = (
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    base: Color,
    rim = 0.6,
    glow = false,
  ) => {
    const step = 0.03;
    const put = (
      x: number,
      y: number,
      z: number,
      level: number,
      extra: number,
    ) => {
      const p = project(x, y, z),
        ix = p.sx | 0,
        iy = p.sy | 0;
      if (ix < 0 || iy < 0 || ix >= TW || iy >= TH) return;
      const i = iy * TW + ix;
      if (p.d <= zb[i]) return;
      zb[i] = p.d;
      // emissive parts (neon, beacons) keep their colour on every face
      const k = glow ? 1 : level + (bayerAt(ix, iy) - 0.5) * 0.25;
      pix[i] = rgb(
        base[0] * k + SHEEN[0] * extra,
        base[1] * k + SHEEN[1] * extra,
        base[2] * k + SHEEN[2] * extra,
      );
    };
    for (let a = x0; a <= x1; a += step)
      for (let b = y0; b <= y1; b += step)
        put(a, b, z1, 0.95, (a - x0 < 0.06 ? rim : 0.1) * 0.45);
    for (let a = x0; a <= x1; a += step)
      for (let b = z0; b <= z1; b += step)
        put(a, y1, b, 0.62, a - x0 < 0.04 ? rim * 0.4 : 0);
    for (let a = y0; a <= y1; a += step)
      for (let b = z0; b <= z1; b += step) put(x1, a, b, 0.42, 0);
  };
  // posts every P / 9, so the railing repeats with the walkway; the rail on her side catches her pink light
  const railing = (x: number, side: number) => {
    const post = rgb(
      ...(RAIL.map((v, j) => v + (side < 0 ? GLOW[j] * 0.14 : 0)) as Color),
    );
    const steps = Math.ceil((REACH * 9) / P);
    for (let k = -steps; k <= steps; k++) {
      const y = (k * P) / 9;
      for (let z = 0; z <= 1.12; z += 0.025) plot(x, y, z, post);
      castShadow(x, y, 0.6, 0.08);
    }
    for (const z of [1.12, 0.62])
      for (let y = -REACH; y <= REACH; y += 0.025) {
        plot(
          x,
          y,
          z,
          side < 0 && z > 1
            ? rgb(214, 96, 176)
            : rgb(RAIL[0] + 10, RAIL[1] + 8, RAIL[2] + 14),
        );
      }
  };
  const strut = (a: Vec3, b: Vec3, t: number, base: Color, rim: number) => {
    const n = Math.ceil(
      Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.025,
    );
    for (let k = 0; k <= n; k++) {
      const [x, y, z] = lerp3(a, b, k / n);
      for (let u = -t; u <= t; u += 0.025)
        for (let v = -t; v <= t; v += 0.025) {
          const p = project(x + u, y + v, z),
            ix = p.sx | 0,
            iy = p.sy | 0;
          if (ix < 0 || iy < 0 || ix >= TW || iy >= TH) continue;
          const i = iy * TW + ix;
          if (p.d <= zb[i]) continue;
          zb[i] = p.d;
          const lit = u < -t + 0.03 ? rim : 0,
            k2 = v > t - 0.03 ? 0.6 : 0.42;
          pix[i] = rgb(
            base[0] * k2 + SHEEN[0] * lit,
            base[1] * k2 + SHEEN[1] * lit,
            base[2] * k2 + SHEEN[2] * lit,
          );
        }
    }
  };
  // A steel portal over the walkway: panelled columns with base plates, an I-section beam with a cyan light
  // strip under it, knee braces, a hanging lamp and red beacons. `open` drops the column and beam on her
  // side, leaving the far post with an arm out to the lamp, so nothing crosses in front of her.
  const SEAM: Color = [30, 32, 42],
    NEON: Color = [90, 235, 255],
    BEACON: Color = [235, 50, 70];
  const LAMPS: Vec3[] = [];
  const gantry = (y: number, lamp: boolean, open = false) => {
    const t = 0.17,
      h = 7.2,
      xb = DECK.x1 + 0.1,
      mx = (DECK.x0 + DECK.x1) / 2;
    const xa = open ? mx - 0.45 : DECK.x0 - 0.1;
    const posts: [number, number][] = open
      ? [[xb, 0.25]]
      : [
          [xa, 0.55],
          [xb, 0.2],
        ];
    for (const [x, rim] of posts) {
      litBox(x - t, y - t, 0, x + t, y + t, h + 0.45, STEEL, rim);
      for (let z = 0.9; z < h - 0.3; z += 0.9)
        litBox(
          x - t - 0.005,
          y - t - 0.005,
          z,
          x + t + 0.005,
          y + t + 0.005,
          z + 0.03,
          SEAM,
          0,
        ); // panel seams
      litBox(
        x - t - 0.1,
        y - t - 0.1,
        0,
        x + t + 0.1,
        y + t + 0.1,
        0.1,
        STEEL,
        rim * 0.5,
      ); // base plate
      litBox(
        x - 0.06,
        y - 0.06,
        h + 0.45,
        x + 0.06,
        y + 0.06,
        h + 0.6,
        BEACON,
        0,
        true,
      );
    }
    litBox(
      xa - (open ? 0 : t),
      y - t,
      h + 0.25,
      xb,
      y + t,
      h + 0.4,
      STEEL,
      0.6,
    ); // top flange
    litBox(
      xa - (open ? 0 : t),
      y - 0.05,
      h + 0.05,
      xb,
      y + 0.05,
      h + 0.25,
      STEEL,
      0.3,
    ); // web
    litBox(
      xa - (open ? 0 : t),
      y - t,
      h - 0.05,
      xb,
      y + t,
      h + 0.05,
      STEEL,
      0.4,
    ); // bottom flange
    litBox(
      xa + (open ? 0.05 : t),
      y - 0.03,
      h - 0.09,
      xb - t,
      y + 0.03,
      h - 0.05,
      NEON,
      0,
      true,
    ); // light strip
    if (!open)
      strut([xa + t, y, h - 1.3], [xa + 1.3, y, h - 0.05], 0.06, STEEL, 0.3);
    strut([xb - t, y, h - 1.3], [xb - 1.3, y, h - 0.05], 0.06, STEEL, 0.1);
    if (lamp) {
      strut([mx, y, h - 0.05], [mx, y, h - 0.9], 0.02, RAIL, 0);
      litBox(
        mx - 0.35,
        y - 0.18,
        h - 1.15,
        mx + 0.35,
        y + 0.18,
        h - 0.9,
        [40, 44, 56],
        0.3,
      );
      LAMPS.push([mx, y, h - 1.18]);
    }
    if (!open) castShadow(xa, y, 3, 0.3);
    castShadow(xb, y, 3, 0.3);
  };
  // Distant neon-lit drops falling behind the walkway: cyan, amber and violet points that stream down.
  const CITY = Array.from({ length: 90 }, (_, k) => {
    const t = hash(k, 504);
    return {
      x: hash(k, 501) * W,
      y: hash(k, 502) * H,
      v: 40 + hash(k, 505) * 70, // px per second
      c:
        t > 0.8
          ? rgb(45, 110, 125)
          : t > 0.5
            ? rgb(100, 60, 42)
            : rgb(55, 42, 78),
    };
  });

  /* ---------- the city below and behind her ---------- */
  // Isometric towers in the same projection as the walkway, rising out of a deep canyon: the further back a
  // tower stands, the higher it shows. The city repeats every PC world units along the walkway (KC pixels),
  // so like the walkway it bakes once into a wide buffer and the view takes a shifted window of it.
  const KC = KP * 6,
    PC = P * 6;
  const city = { w: W + KC, h: H + KC / 2, ox: screen.ox + KC, oy: screen.oy };
  const CITY_PIX = new Uint32Array(city.w * city.h);
  const bakeCity = () => {
    for (let y = 0; y < city.h; y++) {
      const t = clamp(y / H, 0, 1) ** 2; // a violet haze toward the bottom of the canyon
      CITY_PIX.fill(
        rgb(7 + 12 * t, 6 + 4 * t, 11 + 20 * t),
        y * city.w,
        (y + 1) * city.w,
      );
    }
    interface Tower {
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      z0: number;
      z1: number;
      id: number;
    }
    const towers: Tower[] = [];
    let id = 0;
    for (let gx = -78; gx < -9; gx += 6.5)
      for (let gy = 0; gy < PC; gy += 6) {
        id++;
        if (hash(id, 1) < 0.22) continue;
        const w = 2.2 + hash(id, 2) * 2.8,
          d = 2.2 + hash(id, 3) * 2.8;
        const x0 = gx + hash(id, 4) * 2,
          y0 = gy + hash(id, 5) * 2;
        // the roof's height is chosen by where it lands on screen, so the skyline fills the frame
        const near = (x0 + w + y0 + d) / R2;
        const topSy = 20 + hash(id, 6) * 310;
        const z1 = (near * SIN - (topSy - city.oy) / S) / COS;
        for (let n = -4; n <= 4; n++)
          towers.push({
            x0,
            x1: x0 + w,
            y0: y0 + n * PC,
            y1: y0 + d + n * PC,
            z0: z1 - 90,
            z1,
            id,
          });
      }
    towers.sort((a, b) => a.x1 + a.y1 - (b.x1 + b.y1)); // far first; nearer towers paint over them
    const WIN: Color[] = [
      [220, 165, 95],
      [95, 215, 235],
      [205, 205, 220],
      [240, 95, 160],
    ];
    const bx = COS / R2,
      bz = SIN;
    for (const T of towers) {
      // screen box of the tower's corners in the city buffer
      let sx0 = 1e9,
        sx1 = -1e9,
        sy0 = 1e9,
        sy1 = -1e9;
      for (const x of [T.x0, T.x1])
        for (const y of [T.y0, T.y1])
          for (const z of [T.z0, T.z1]) {
            const u = (x - y) / R2,
              v = (x + y) / R2;
            const px = city.ox + u * S,
              py = city.oy + (v * SIN - z * COS) * S;
            sx0 = Math.min(sx0, px);
            sx1 = Math.max(sx1, px);
            sy0 = Math.min(sy0, py);
            sy1 = Math.max(sy1, py);
          }
      const X0 = Math.max(0, sx0 | 0),
        X1 = Math.min(city.w - 1, Math.ceil(sx1)),
        Y0 = Math.max(0, sy0 | 0),
        Y1 = Math.min(city.h - 1, Math.ceil(sy1));
      if (X0 > X1 || Y0 > Y1) continue;
      const depth = clamp((-(T.x1 + T.y1) - 10) / 70, 0, 1); // haze with distance
      // few lights: most towers are dark shapes in the haze
      const style = hash(T.id, 7) < 0.5 ? 0 : 1,
        lit = 0.03 + hash(T.id, 8) * 0.05;
      for (let Y = Y0; Y <= Y1; Y++)
        for (let X = X0; X <= X1; X++) {
          // the orthographic ray through this pixel, parametrised by depth toward the viewer
          const u = (X + 0.5 - city.ox) / S,
            q = (Y + 0.5 - city.oy) / S;
          const ax = (q * SIN + u) / R2,
            ay = (q * SIN - u) / R2,
            az = -q * COS;
          const exX = (T.x1 - ax) / bx,
            exY = (T.y1 - ay) / bx,
            exZ = (T.z1 - az) / bz;
          const enter = Math.max(
            (T.x0 - ax) / bx,
            (T.y0 - ay) / bx,
            (T.z0 - az) / bz,
          );
          const exit = Math.min(exX, exY, exZ);
          if (enter > exit) continue;
          const hx = ax + bx * exit,
            hy = ay + bx * exit,
            hz = az + bz * exit;
          let c: Color;
          if (exit === exZ)
            c = [16, 16, 26]; // roof
          else {
            const onX = exit === exX,
              h = onX ? hy - T.y0 : hx - T.x0;
            const tone = onX ? 1 : 0.7;
            c = [22 * tone, 24 * tone, 36 * tone];
            const ci = Math.floor(h / 0.2),
              cj = Math.floor((T.z1 - hz) / 0.22),
              fi = (h / 0.2) % 1,
              fj = ((T.z1 - hz) / 0.22) % 1;
            const pane =
              style === 1
                ? fj > 0.3 && fj < 0.7
                : fi > 0.2 && fi < 0.75 && fj > 0.25 && fj < 0.75;
            const on =
              hash(T.id * 131 + (style === 1 ? 0 : ci), cj + T.id) <
              (style === 1 ? lit * 0.6 : lit);
            if (pane && on) {
              const wc = WIN[(hash(ci + T.id, cj) * WIN.length) | 0];
              c = [wc[0] * 0.42, wc[1] * 0.42, wc[2] * 0.42];
            } else if (pane) c = [c[0] + 3, c[1] + 3, c[2] + 5];
          }
          const haze = 0.35 + depth * 0.5;
          CITY_PIX[Y * city.w + X] = rgb(
            lerp(c[0], 34, haze),
            lerp(c[1], 26, haze),
            lerp(c[2], 58, haze),
          );
        }
    }
  };
  // The city shows only through a soft pool of haze around the middle of the frame, where she is, and breaks
  // into the dark toward the edges and the top in the same ragged dither as the walkway's ends.
  const CITY_VIS = (() => {
    const v = new Float32Array(W * H);
    for (let iy = 0; iy < H; iy++)
      for (let ix = 0; ix < W; ix++) {
        const d =
          Math.hypot((ix - 470) / 470, (iy - 300) / 330) +
          (noise(ix * 0.03, iy * 0.03) - 0.5) * 0.25;
        v[iy * W + ix] = clamp((1 - d) / 0.45, 0, 1);
      }
    return v;
  })();
  const cityShown = (i: number, c: number) => {
    const v = CITY_VIS[i];
    if (v <= 0 || hash(i % W, (i / W) | 0) > v) return VOID;
    const k = 0.45 + 0.55 * v;
    return rgb((c & 255) * k, ((c >> 8) & 255) * k, ((c >> 16) & 255) * k);
  };
  // the city colour behind screen pixel (ix, iy) for pixel shift k
  const cityAt = (ix: number, iy: number, k: number) => {
    const kc = ((k % KC) + KC) % KC;
    return CITY_PIX[(iy + kc / 2) * city.w + ix - kc + KC];
  };

  /* ---------- hologram signs ---------- */
  // Text rasterised from the system Japanese font into a 1-bit mask, then stood up in the world on a plane
  // along x or y, so it slants with the isometric grid. Drawn every frame as translucent light with
  // scanlines and flicker, like the advertising holograms over the city.
  const JP_FONT =
    '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif';
  const LOGO_FONT = '"Helvetica Neue", "Arial Black", Arial, sans-serif';
  const glyphMask = (
    text: string,
    px: number,
    vertical: boolean,
    family = JP_FONT,
    weight = 700,
  ) => {
    const chars = [...text],
      cell = px + 2;
    const c = document.createElement("canvas");
    c.width = vertical ? cell + 2 : cell * chars.length + 2;
    c.height = vertical ? cell * chars.length + 2 : cell + 2;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#fff";
    g.font = `${weight} ${px}px ${family}`;
    g.textBaseline = "top";
    chars.forEach((ch, n) =>
      g.fillText(ch, vertical ? 1 : 1 + n * cell, vertical ? 1 + n * cell : 1),
    );
    const data = g.getImageData(0, 0, c.width, c.height).data;
    const mask = new Uint8Array(c.width * c.height);
    for (let i = 0; i < mask.length; i++)
      mask[i] = data[i * 4 + 3] > 110 ? 1 : 0;
    return { w: c.width, h: c.height, mask };
  };
  // the world point that shows at screen (sx, sy) when he stands under her, at depth D = x + y
  const worldAt = (sx: number, sy: number, D: number): Vec3 => {
    const u = (sx - screen.ox) / S,
      v = D / R2,
      z = (v * SIN - (sy - screen.oy) / S) / COS;
    return [(v + u) / R2, (v - u) / R2, z];
  };
  interface Sign {
    pts: Float32Array;
    col: Color;
    seed: number;
    bright: number; // 1 for the names; the rest are faint and fade with the city's fog
    led: boolean; // a giant LED logo: a dot grid of light seen through the fog, with a wider halo
  }
  const signs: Sign[] = [];
  const addSign = (
    text: string,
    sx: number,
    sy: number,
    D: number,
    axis: "x" | "y",
    px: number,
    scale: number,
    col: Color,
    vertical = false,
    bright = 0.3,
    led = false,
  ) => {
    const m = led
      ? glyphMask(text, px, false, LOGO_FONT, 900)
      : glyphMask(text, px, vertical);
    if (!m) return;
    const o = worldAt(sx, sy, D),
      along = R2 / S,
      down = 1 / (COS * S),
      pts: number[] = [];
    for (let j = 0; j < m.h; j++)
      for (let i = 0; i < m.w; i++) {
        if (!m.mask[j * m.w + i] || (led && (i + j) % 2)) continue; // LED logos light every other pixel
        for (let b = 0; b < scale; b++)
          for (let a = 0; a < scale; a++) {
            const s = (i * scale + a) * along * 0.5; // half steps: each mask pixel is `scale` screen pixels wide
            pts.push(
              o[0] + (axis === "x" ? s : 0),
              o[1] + (axis === "y" ? -s : 0),
              o[2] - (j * scale + b) * down,
            );
          }
      }
    signs.push({
      pts: new Float32Array(pts),
      col,
      seed: signs.length * 7.3,
      bright,
      led,
    });
  };
  const bakeSigns = () => {
    addSign("アーリアン", 150, 118, -14, "x", 14, 2, [255, 90, 185], false, 1);
    addSign("ジャンヴィ", 640, 54, -12, "x", 14, 2, [90, 230, 255], false, 1);
    addSign("東京", 70, 210, -26, "y", 12, 2, [255, 120, 80], true);
    addSign("ホテル", 860, 40, -30, "y", 10, 2, [255, 80, 170], true);
    addSign("電脳", 380, 40, -34, "x", 11, 2, [120, 220, 255], true);
    addSign("夜", 30, 70, -40, "x", 16, 2, [255, 170, 70]);
    addSign("愛", 920, 230, -22, "y", 14, 2, [255, 90, 170]);
    // giant LED logos for the world he walks through, like the advertising over the city
    addSign(
      "BLANK",
      250,
      6,
      -38,
      "x",
      46,
      1,
      [150, 240, 228],
      false,
      0.6,
      true,
    );
    addSign(
      "COMPRONENTS",
      40,
      330,
      -24,
      "y",
      22,
      1,
      [150, 240, 228],
      false,
      0.45,
      true,
    );
  };
  const drawSigns = (t: number) => {
    const cy = camY();
    for (const s of signs) {
      // a slow breathing glow, an occasional dropout, and a row tear now and then
      const drop = !STILL && hash(Math.floor(t * 9), s.seed) > 0.985;
      if (drop) continue;
      const flick = STILL
        ? 0.85
        : 0.72 +
          0.13 * Math.sin(t * 2.3 + s.seed) +
          0.08 * Math.sin(t * 17 + s.seed * 3);
      const tear =
        !STILL && hash(Math.floor(t * 4), s.seed + 1) > 0.93
          ? (hash(Math.floor(t * 4), s.seed + 2) * H) | 0
          : -99;
      const [r, g, b] = s.col;
      for (let n = 0; n < s.pts.length; n += 3) {
        const p = project(s.pts[n], s.pts[n + 1] - cy, s.pts[n + 2]);
        let ix = p.sx | 0;
        const iy = p.sy | 0;
        if (Math.abs(iy - tear) < 3) ix += 4;
        if (ix < 1 || iy < 1 || ix >= W - 1 || iy >= H - 1) continue;
        const i = iy * W + ix;
        if (p.d <= zb[i]) continue;
        const a =
          flick *
          (iy % 3 === 0 ? 0.55 : 1) *
          s.bright *
          (s.led ? 0.35 + 0.65 * CITY_VIS[i] : s.bright < 1 ? CITY_VIS[i] : 1);
        if (a <= 0.01) continue;
        const c = pix[i];
        pix[i] = rgb(
          (c & 255) + r * a * 0.8,
          ((c >> 8) & 255) + g * a * 0.8,
          ((c >> 16) & 255) + b * a * 0.8,
        );
        // a soft halo around each lit pixel; LED logos glow wider, as if through fog
        for (const j of s.led
          ? [i - 2, i - 1, i + 1, i + 2, i - W, i + W, i - 2 * W, i + 2 * W]
          : [i - 1, i + 1, i - W, i + W]) {
          if (j < 0 || j >= W * H) continue;
          if (p.d <= zb[j]) continue;
          const q = pix[j];
          pix[j] = rgb(
            (q & 255) + r * a * 0.12,
            ((q >> 8) & 255) + g * a * 0.12,
            ((q >> 16) & 255) + b * a * 0.12,
          );
        }
      }
    }
  };

  /* ---------- the man: long coat, raised collar, drawn every frame ---------- */
  interface Walker {
    x: number;
    y: number;
    tx: number;
    ty: number;
    yaw: number;
    phase: number;
    walking: boolean;
    still: number;
    look: number; // 0 to 1: how far he tips his head back to look up at her
    stride: number; // 0 standing to 1 full stride, eased so starts and stops blend
  }
  const COAT: Palette = {
    shirt: [40, 37, 52],
    legs: [23, 22, 32],
    hair: [25, 21, 29],
    skin: [177, 117, 146],
  };
  // His gait. Each thigh swings on a sine; the knee folds through the swing and straightens to plant the
  // foot. The hips sit wherever puts the lower foot on the deck, so they bob twice a stride. The arms swing
  // against the legs with soft elbows, the shoulders turn against the hips, and the coat hem follows the
  // front leg. `stride` eases in and out, so starting and stopping blend instead of snapping.
  const drawMan = (M: Walker) => {
    const s = M.stride,
      ph = M.phase;
    const fx = Math.cos(M.yaw),
      fy = Math.sin(M.yaw),
      sx = -fy,
      sy = fx;
    const P = (a: number, b: number, z: number): Vec3 => [
      M.x + fx * a + sx * b,
      M.y + fy * a + sy * b,
      z,
    ];
    const L1 = 0.62,
      L2 = 0.6,
      ANKLE = 0.11;
    const leg = (side: number) => {
      const p = ph + (side > 0 ? 0 : Math.PI);
      const thigh = 0.44 * s * Math.sin(p) + (1 - s) * 0.05 * side;
      const fold = s * 0.85 * Math.max(0, Math.cos(p)) ** 1.6 + 0.05;
      const ka = L1 * Math.sin(thigh),
        kz = -L1 * Math.cos(thigh);
      return {
        ka,
        kz,
        fa: ka + L2 * Math.sin(thigh - fold),
        fz: kz - L2 * Math.cos(thigh - fold),
        flat: Math.cos(p) < 0,
      };
    };
    const R = leg(1),
      Lg = leg(-1);
    const hipZ = Math.max(-R.fz, -Lg.fz) + ANKLE; // the planted foot rests on the deck
    const lean = 0.08 * s - 0.1 * (1 - s) - 0.22 * M.look;
    const tw = 0.14 * s * Math.sin(ph); // shoulders counter-rotate against the hips
    for (const [side, l] of [
      [1, R],
      [-1, Lg],
    ] as const) {
      const hip = P(0, side * 0.15, hipZ),
        knee = P(l.ka, side * 0.16, hipZ + l.kz),
        foot = P(l.fa, side * 0.16, hipZ + l.fz);
      bone(hip, knee, 0.17, 0.13, COAT.legs);
      bone(knee, foot, 0.13, 0.1, COAT.legs);
      // the toe points forward when planted and tips down when the foot lifts
      bone(
        foot,
        P(l.fa + 0.17, side * 0.16, hipZ + l.fz - (l.flat ? 0.02 : 0.06 * s)),
        0.1,
        0.09,
        SHOE,
      );
    }
    const shA = Math.sin(lean) * 0.95,
      shZ = hipZ + Math.cos(lean) * 0.95;
    const neck = P(shA, 0, shZ + 0.08),
      head = P(shA + Math.sin(lean) * 0.32, 0, shZ + 0.36);
    bone(P(0, 0, hipZ), neck, 0.3, 0.32, COAT.shirt);
    bone(neck, head, 0.11, 0.12, COAT.skin);
    bone(head, head, 0.24, 0.24, COAT.skin);
    for (const side of [1, -1]) {
      const sh = P(shA - side * 0.36 * Math.sin(tw), side * 0.37, shZ - 0.03);
      const swing = s * 0.5 * Math.sin(ph) * -side + (1 - s) * 0.04; // each arm against its leg
      const elbow = P(
        shA - side * 0.36 * Math.sin(tw) + Math.sin(swing) * 0.46,
        side * 0.4,
        shZ - 0.03 - Math.cos(swing) * 0.46,
      );
      const bend = swing + 0.25 + 0.2 * s;
      const hand = P(
        shA -
          side * 0.36 * Math.sin(tw) +
          Math.sin(swing) * 0.46 +
          Math.sin(bend) * 0.44,
        side * 0.41,
        shZ - 0.03 - Math.cos(swing) * 0.46 - Math.cos(bend) * 0.44,
      );
      bone(sh, elbow, 0.12, 0.1, COAT.shirt);
      bone(elbow, hand, 0.09, 0.08, COAT.skin);
    }
    // medium hair: volume on top, a fringe swept to one side, over the ears and down to his collar
    const hx = shA + Math.sin(lean) * 0.32,
      hz = shZ + 0.36;
    const HAIR: Color = [36, 28, 34];
    capsule(
      P(hx - 0.05, 0, hz + 0.1),
      P(hx - 0.1, 0, hz + 0.05),
      0.22,
      0.21,
      HAIR,
    );
    capsule(
      P(hx + 0.11, -0.1, hz + 0.15),
      P(hx + 0.16, 0.1, hz + 0.07),
      0.1,
      0.08,
      HAIR,
    );
    for (const side of [-1, 1])
      capsule(
        P(hx - 0.03, side * 0.17, hz + 0.04),
        P(hx - 0.05, side * 0.19, hz - 0.13),
        0.1,
        0.07,
        HAIR,
      );
    capsule(
      P(hx - 0.14, 0, hz + 0.02),
      P(hx - 0.17, 0, hz - 0.22),
      0.16,
      0.1,
      HAIR,
    );
    // the long coat, from below the hips to the shoulders; its hem follows the forward leg
    const front = (R.ka + Lg.ka) * 0.5;
    for (let z = hipZ - 0.6; z <= hipZ + 0.9; z += 0.025) {
      const v = (z - hipZ + 0.6) / 1.5,
        width = lerp(0.38, 0.29, v),
        depth = lerp(0.23, 0.24, v);
      for (let a = 0; a < Math.PI * 2; a += 0.035) {
        if (v < 0.25 && Math.abs(Math.sin(a)) < 0.09 && Math.cos(a) > 0)
          continue; // the coat's open front
        const seam = Math.abs(Math.sin(a)) < 0.06,
          lit = Math.max(0, Math.cos(a));
        const flare =
          (1 - v) ** 2 * (front * 0.5 + 0.05 * s * Math.sin(ph * 2 + a)); // hem sways with his stride
        plot(
          ...P(
            Math.cos(a) * depth + Math.sin(lean) * v * 0.9 - 0.07 * v + flare,
            Math.sin(a) * width,
            z,
          ),
          seam
            ? rgb(22, 19, 29)
            : rgb(27 + lit * 39, 26 + lit * 13, 39 + lit * 30),
        );
      }
    }
    for (const side of [-1, 1]) {
      capsule(
        P(shA + 0.12, side * 0.17, shZ - 0.11),
        P(shA - 0.06, side * 0.16, shZ + 0.16),
        0.065,
        0.05,
        [87, 65, 84],
      );
      for (let t = 0; t < 1; t += 0.04)
        plot(
          ...P(shA + 0.245, side * (0.2 - 0.15 * t), shZ - 0.13 - 0.34 * t),
          rgb(87, 62, 83),
        );
    }
    castShadow(M.x, M.y, 0, 0.38, 2);
  };

  /* ---------- bake: the walkway once into a wide target ---------- */
  // wide enough that any scroll offset in [0, KP) still fills the canvas: screen (x, y) reads wide (x - k + KP, y + k / 2)
  const wide = makeTarget(W + KP, H + KP / 2, screen.ox + KP, screen.oy);
  // Her light on the deck near her: pink spill and lit puddles, as additions pinned to her place.
  // Stored at camera zero and shifted with her; it fades in and out with her.
  const deckLight: { j: number; r: number; g: number; b: number }[] = [];
  // standing water on the deck, baked with the walkway and windowed with it, for reflections
  const widePuddle = new Uint8Array(wide.w * wide.h),
    puddle = new Uint8Array(W * H);
  const giantLight = (x: number, y: number) =>
    clamp(
      1.3 -
        Math.hypot(x - GIANT.x - GIANT.f[0] * 3, y - GIANT.y - GIANT.f[1] * 3) /
          10,
      0,
      1,
    );
  // Bakes the walkway into a wide target: deck, sides, gantries, railings, contact shadows. `open` says which
  // gantries lose their column and beam on her side.
  const bakeWalkway = (
    t: Target,
    puddles: Uint8Array,
    open: (y: number) => boolean,
  ) => {
    renderInto(t);
    zb.fill(-1e9);
    pix.fill(VOID);
    for (let iy = 0; iy < TH; iy++)
      for (let ix = 0; ix < TW; ix++) {
        const g = unproject(ix + 0.5, iy + 0.5),
          i = iy * TW + ix;
        if (g.x < DECK.x0 || g.x > DECK.x1) continue;
        pix[i] = deckColor(g.x, g.y, ix, iy);
        ground[i] = 1;
        puddles[i] =
          tileY((v) => noise(g.x * 0.55 + 9, v * 0.42), g.y) > 0.6 ? 1 : 0;
        zb[i] = ((g.x + g.y) / R2) * COS;
      }
    groundZ.set(zb);
    deckSides();
    const n0 = Math.ceil((REACH * 2) / P);
    for (let n = -n0; n <= n0; n++) {
      const y = (n * P) / 2 + 0.3;
      gantry(y, n % 2 === 0, open(y));
    }
    railing(DECK.x0 + 0.08, -1);
    railing(DECK.x1 - 0.08, 1);
    bakeOcclusion();
    applyShadows(groundZ);
    renderInto(screen);
  };
  // Near her the walkway is baked a second time with open gantries; the pixels that differ are kept as a
  // patch pinned to her place, so the columns and beams on her side are gone only there.
  const patch: {
    j: number;
    c: number;
    z: number;
    gz: number;
    g: number;
    pd: number;
  }[] = [];
  const bakePatch = () => {
    const t = makeTarget(wide.w, wide.h, wide.ox, wide.oy),
      puddles = new Uint8Array(wide.w * wide.h),
      lamps = LAMPS.length;
    bakeWalkway(t, puddles, (y) => Math.abs(y - SPOT.y) < 8);
    LAMPS.length = lamps;
    for (let i = 0; i < t.pix.length; i++)
      if (t.pix[i] !== wide.pix[i] || t.zb[i] !== wide.zb[i])
        patch.push({
          j: i,
          c: t.pix[i],
          z: t.zb[i],
          gz: t.groundZ[i],
          g: t.ground[i],
          pd: puddles[i],
        });
  };
  const bakeScene = () => {
    bakeWalkway(wide, widePuddle, () => false);
    bakePatch();
    bakeCity();
    bakeSigns();
    for (let iy = 0; iy < H; iy++)
      for (let ix = 0; ix < W; ix++) {
        const w = iy * wide.w + ix + KP;
        if (!wide.ground[w] || wide.zb[w] !== wide.groundZ[w]) continue;
        const g = unproject(ix + 0.5, iy + 0.5),
          L = giantLight(g.x, g.y);
        if (L <= 0) continue;
        const puddle = tileY((v) => noise(g.x * 0.55 + 9, v * 0.42), g.y) > 0.6,
          spill = L * (puddle ? 0.7 : 0.3);
        let r = GLOW[0] * spill * 0.2,
          gg = GLOW[1] * spill * 0.16,
          b = GLOW[2] * spill * 0.14;
        if (puddle && hash(ix, Math.floor(iy / 6)) > 0.8 - L * 0.25) {
          if (hash(ix >> 1, 77) > 0.7) {
            r += 30 * L;
            gg += 80 * L;
            b += 96 * L;
          } else {
            r += 96 * L;
            gg += 24 * L;
            b += 72 * L;
          }
        }
        if (r + gg + b >= 3) deckLight.push({ j: iy * W + ix, r, g: gg, b });
      }
  };

  /* ---------- her frames, baked in workers ---------- */
  const frames = new Map<string, HoloFrame>();
  const queue = [...FRAMES];
  const workers: Worker[] = [];
  const startWorkers = () => {
    const count = clamp((navigator.hardwareConcurrency || 4) - 1, 1, 4);
    for (let n = 0; n < count; n++) {
      const worker = new Worker(
        new URL("./hologram.worker.ts", import.meta.url),
        { type: "module" },
      );
      const next = () => {
        const job = queue.shift();
        if (job) worker.postMessage({ name: job[0], pose: job[1] });
      };
      worker.onmessage = (
        e: MessageEvent<{ name: string; frame: HoloFrame }>,
      ) => {
        frames.set(e.data.name, e.data.frame);
        next();
      };
      workers.push(worker);
      next();
    }
  };

  /* ---------- her performance ---------- */
  // Each act plays a strip of frames. Once-through acts hold their last frame; loops cycle (ping-pong strips
  // list the way back explicitly).
  type Act =
    | "hidden"
    | "stand"
    | "turn"
    | "cheek"
    | "reach"
    | "point"
    | "lower";
  const ACTS: Record<Act, { strip: string[]; fps: number; loop: boolean }> = {
    hidden: { strip: ["stand0"], fps: 1, loop: true },
    stand: { strip: ["stand0", "stand1"], fps: 1.1, loop: true },
    turn: {
      strip: ["stand0", "turn1", "turn2", "turn3", "turn4", "turn5", "cheek0"],
      fps: 4,
      loop: false,
    },
    cheek: {
      strip: ["cheek0", "cheek1", "cheek2", "cheek1"],
      fps: 2.2,
      loop: true,
    },
    reach: {
      strip: ["cheek0", "reach1", "reach2", "reach3", "point0"],
      fps: 5,
      loop: false,
    },
    point: { strip: ["point0", "point1"], fps: 1.1, loop: true },
    lower: {
      strip: ["point0", "reach3", "reach2", "reach1", "cheek0"],
      fps: 5,
      loop: false,
    },
  };
  const actDone = (act: Act, t: number) =>
    !ACTS[act].loop && t >= ACTS[act].strip.length / ACTS[act].fps;
  const ready = (act: Act) => ACTS[act].strip.every((n) => frames.has(n));
  let shown: HoloFrame | null = null;
  // the frame for this moment; a frame still baking falls back to the nearest earlier one in the strip
  const currentFrame = () => {
    const { strip, fps, loop } = ACTS[G.act];
    const n = Math.floor(G.actT * fps);
    let i = loop ? n % strip.length : Math.min(n, strip.length - 1);
    for (; i >= 0; i--) {
      const f = frames.get(strip[i]);
      if (f) {
        shown = f;
        return f;
      }
    }
    return shown;
  };

  /* ---------- her lines ---------- */
  type Line = { at: number; text: string };
  const HELLO: Line[] = [
    { at: 0.3, text: "Hello, handsome." },
    { at: 2.2, text: "What a day." },
  ];
  const LONELY: Line[] = [
    { at: 0.3, text: "You look lonely." },
    { at: 2.6, text: "I could fix that." },
  ];
  const PARTING: Line[] = [{ at: 0.2, text: "You look like a good Joe." }];
  const LINE_SECONDS = 2.1;
  let script: Line[] = [];
  let scriptStart = 0;
  let shownLine: string | null = null;

  /* ---------- state and update ---------- */
  interface State {
    time: number;
    keys: number; // -1 walks up the walkway (right), +1 back down (left)
    act: Act;
    actT: number; // seconds into the current act
    vis: number; // 0 to 1: how much of her is projected
    cam: number; // camera position along the walkway, in world units, eased toward him
    k: number; // the camera as a whole, even pixel shift
    locked: boolean; // he has reached her and stands still until she has spoken
    met: boolean; // her lines are done for this visit
    man: Walker;
  }
  const START_Y = 14; // he starts down the walkway to the left; she is ahead, not yet projected
  const G: State = {
    time: 0,
    keys: 0,
    act: "hidden",
    actT: 0,
    vis: 0,
    cam: START_Y - SPOT.y,
    k: 0,
    locked: false,
    met: false,
    man: {
      x: SPOT.x,
      y: START_Y,
      tx: SPOT.x,
      ty: START_Y,
      yaw: -Math.PI / 2,
      phase: 0,
      walking: false,
      still: 0,
      look: 0,
      stride: 0,
    },
  };
  const camY = () => (G.k * R2) / S; // the camera offset the current pixel shift stands for
  const say = (lines: Line[]) => {
    script = lines;
    scriptStart = G.time;
  };
  const enter = (act: Act) => {
    G.act = act;
    G.actT = 0;
  };
  const turn = (from: number, to: number) => {
    let d = to - from;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  };
  interface Drop {
    x: number;
    y: number;
    z: number;
    v: number;
  }
  // rain and splashes live in view space: the shower moves with the camera
  const DROPS: Drop[] = Array.from({ length: 700 }, (_, n) => ({
    x: -10 + hash(n, 1) * 18,
    y: -16 + hash(n, 2) * 30,
    z: hash(n, 3) * 17,
    v: 15 + hash(n, 4) * 6,
  }));
  const SPLASH: { x: number; y: number; life: number }[] = [];
  const WALK_SPEED = 1.8;
  const GONE_AT = 6; // how far he walks from her place before she fades, in world units

  const update = (dt: number) => {
    G.time += dt;
    G.actT += dt;
    const M = G.man;
    if (G.keys && !G.locked) {
      M.tx = M.x;
      M.ty = M.y + G.keys * 1.2;
    }
    const dx = M.tx - M.x,
      dy = M.ty - M.y,
      dist = Math.hypot(dx, dy);
    if (dist > 0.03) {
      const step = Math.min(dist, WALK_SPEED * dt),
        before = M.phase;
      M.x += (dx / dist) * step;
      M.y += (dy / dist) * step;
      M.yaw += turn(M.yaw, Math.atan2(dy, dx)) * Math.min(1, dt * 10);
      M.phase += step * 5.2;
      M.walking = true;
      M.still = 0;
      if (
        Math.floor(before / Math.PI) !== Math.floor(M.phase / Math.PI) &&
        SPLASH.length < 90
      ) {
        SPLASH.push({
          x: M.x + Math.cos(M.yaw) * 0.2,
          y: M.y + Math.sin(M.yaw) * 0.2 - camY(),
          life: 0.22,
        });
      }
    } else {
      M.walking = false;
      M.still += dt;
      if (G.act !== "hidden")
        M.yaw +=
          turn(M.yaw, Math.atan2(GIANT.y - M.y, GIANT.x - M.x)) *
          Math.min(1, dt * 3);
    }
    // the camera follows him along the walkway, a little behind
    G.cam += (M.y - SPOT.y - G.cam) * Math.min(1, dt * 4);
    G.k = 2 * Math.round((G.cam * S) / R2 / 2);

    // Her performance. When he reaches her place he walks the last step onto it, stops and looks up, and
    // cannot move again until she has said everything: she projects with her back to him, turns and
    // crouches with her cheek on her hand to greet him, then reaches down and points at him.
    const far = Math.hypot(M.x - SPOT.x, M.y - SPOT.y);
    switch (G.act) {
      case "hidden":
        if (!G.met && Math.abs(M.y - SPOT.y) < 1.6 && frames.has("stand0")) {
          G.locked = true;
          G.keys = 0;
          M.tx = SPOT.x;
          M.ty = SPOT.y;
          enter("stand");
        }
        break;
      case "stand":
        if (G.actT > 1.6 && ready("turn")) enter("turn");
        break;
      case "turn":
        if (actDone("turn", G.actT)) {
          enter("cheek");
          say(HELLO);
        }
        break;
      case "cheek":
        if (
          G.locked &&
          M.still > 0.3 &&
          G.time - scriptStart > 4.3 &&
          ready("reach")
        )
          enter("reach");
        break;
      case "reach":
        if (actDone("reach", G.actT)) {
          enter("point");
          say(LONELY);
        }
        break;
      case "point":
        if (G.locked && G.time - scriptStart > 4.8) {
          G.locked = false;
          G.met = true;
        }
        if (!G.locked && M.walking) {
          enter("lower");
          say(PARTING);
        }
        break;
      case "lower":
        if (actDone("lower", G.actT)) enter("cheek");
        break;
    }
    const wantVis = G.act !== "hidden" && far < GONE_AT ? 1 : 0;
    G.vis = clamp(G.vis + (wantVis ? dt / 1.1 : -dt / 0.8), 0, 1);
    if (!wantVis && G.vis === 0 && G.act !== "hidden") {
      enter("hidden");
      script = [];
      G.met = false;
    }
    M.stride = clamp(M.stride + (M.walking ? dt * 5 : -dt * 4), 0, 1);
    M.look = clamp(
      M.look + (G.locked && G.act !== "hidden" ? dt : -dt) * 1.5,
      0,
      1,
    );
    if (!STILL)
      for (const c of CITY) {
        c.y += c.v * dt;
        if (c.y >= H) {
          c.y -= H;
          c.x = Math.random() * W;
        }
      }

    if (!STILL)
      for (const d of DROPS) {
        d.z -= d.v * dt;
        const onIt = d.x > DECK.x0 && d.x < DECK.x1;
        if ((onIt && d.z <= 0) || d.z < -6) {
          if (onIt && SPLASH.length < 80)
            SPLASH.push({ x: d.x, y: d.y, life: 0.14 });
          d.z = 15 + Math.random() * 3;
        }
      }
    for (const s of SPLASH) s.life -= dt;
    for (let k = SPLASH.length - 1; k >= 0; k--)
      if (SPLASH[k].life <= 0) SPLASH.splice(k, 1);
    const t = G.time - scriptStart;
    const line = script.find((l) => t >= l.at && t < l.at + LINE_SECONDS);
    const text = line ? line.text : null;
    if (text !== shownLine) {
      shownLine = text;
      callbacks.onSubtitle(text);
    }
  };

  /* ---------- draw ---------- */
  // The view dissolves into the dark a short way behind and ahead of him, in the same ragged dither the
  // old walkway ends used. The mask is fixed on screen; the walkway scrolls through it.
  const FOG = (() => {
    const mask = new Uint8Array(W * H),
      a = project(SPOT.x, SPOT.y, 1);
    for (let iy = 0; iy < H; iy++)
      for (let ix = 0; ix < W; ix++) {
        const along = Math.abs((ix - a.sx) * -0.894 + (iy - a.sy) * 0.447); // distance along the walkway, px
        const t =
          (along - 200) / 150 + (noise(ix * 0.05, iy * 0.05) - 0.5) * 0.3;
        if (t > 1 || (t > 0 && hash(ix, iy) < t)) mask[iy * W + ix] = 1;
      }
    return mask;
  })();
  // the slice of the baked walkway for pixel shift k, written into the canvas target with depth corrected
  // the slice of the baked walkway for pixel shift k with depth corrected, her patch over it, and the city
  // wherever nothing of the walkway stands
  const drawWalkway = (k: number) => {
    const kk = ((k % KP) + KP) % KP,
      off = (kk * COS) / S;
    for (let iy = 0; iy < H; iy++) {
      const src = (iy + kk / 2) * wide.w + KP - kk,
        dst = iy * W;
      pix.set(wide.pix.subarray(src, src + W), dst);
      ground.set(wide.ground.subarray(src, src + W), dst);
      puddle.set(widePuddle.subarray(src, src + W), dst);
      for (let ix = 0; ix < W; ix++) {
        zb[dst + ix] = wide.zb[src + ix] - off;
        groundZ[dst + ix] = wide.groundZ[src + ix] - off;
      }
    }
    const offK = (k * COS) / S;
    for (const p of patch) {
      const ix = (p.j % wide.w) - KP + k,
        iy = ((p.j / wide.w) | 0) - k / 2;
      if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
      const i = iy * W + ix;
      pix[i] = p.c;
      zb[i] = p.z - offK;
      groundZ[i] = p.gz - offK;
      ground[i] = p.g;
      puddle[i] = p.pd;
    }
    const kc = ((k % KC) + KC) % KC;
    for (let iy = 0; iy < H; iy++) {
      const src = (iy + kc / 2) * city.w + KC - kc,
        dst = iy * W;
      for (let ix = 0; ix < W; ix++)
        if (zb[dst + ix] < -1e8)
          pix[dst + ix] = cityShown(dst + ix, CITY_PIX[src + ix]);
    }
  };
  const drawDeckLight = (k: number) => {
    if (G.vis <= 0) return;
    for (const { j, r, g, b } of deckLight) {
      const ix = (j % W) + k,
        iy = ((j / W) | 0) - k / 2;
      if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
      const i = iy * W + ix;
      if (!ground[i] || zb[i] !== groundZ[i]) continue;
      const c = pix[i],
        v = G.vis;
      pix[i] = rgb(
        (c & 255) + r * v,
        ((c >> 8) & 255) + g * v,
        ((c >> 16) & 255) + b * v,
      );
    }
  };
  // her glow at screen pixel (ix, iy), from the frame's glow box, shifted with her
  const glowAt = (f: HoloFrame, ix: number, iy: number, k: number) => {
    const gx = ix - k - f.gx0,
      gy = iy + k / 2 - f.gy0;
    if (gx < 0 || gy < 0 || gx >= f.gw || gy >= f.gh) return [0, 0];
    const j = gy * f.gw + gx;
    return [f.warm[j] * G.vis, f.cool[j] * G.vis];
  };
  const drawGlow = (f: HoloFrame, k: number) => {
    if (G.vis <= 0) return;
    const x0 = Math.max(0, f.gx0 + k),
      x1 = Math.min(W, f.gx0 + f.gw + k);
    const y0 = Math.max(0, f.gy0 - k / 2),
      y1 = Math.min(H, f.gy0 + f.gh - k / 2);
    for (let iy = y0; iy < y1; iy++)
      for (let ix = x0; ix < x1; ix++) {
        const [w, c0] = glowAt(f, ix, iy, k),
          gw = w * 1.6,
          gc = c0 * 1.6;
        if (gw + gc < 0.015) continue;
        const qw = Math.floor(gw * 8 + bayerAt(ix, iy) * 0.9) / 8,
          qc = Math.floor(gc * 8 + bayerAt(ix, iy) * 0.9) / 8;
        const i = iy * W + ix,
          c = pix[i];
        pix[i] = rgb(
          (c & 255) + 170 * qw + 40 * qc,
          ((c >> 8) & 255) + 34 * qw + 130 * qc,
          ((c >> 16) & 255) + 128 * qw + 160 * qc,
        );
      }
  };
  // fogged walkway gives way to the city behind it
  const drawFog = (k: number) => {
    for (let i = 0; i < W * H; i++)
      if (FOG[i] && zb[i] > -1e8) {
        pix[i] = cityShown(i, cityAt(i % W, (i / W) | 0, k));
        zb[i] = -1e9;
      }
    // the falling points draw as short streaks wherever only the dark shows
    for (const { x, y, c } of CITY)
      for (let n = 0; n < 3; n++) {
        const iy = (y | 0) - n;
        if (iy < 0) continue;
        const i = iy * W + (x | 0);
        if (zb[i] < -1e8) pix[i] = c;
      }
  };
  // f: her frame, so the rain picks up her light
  const drawRain = (f: HoloFrame | null, k: number) => {
    for (const d of DROPS) {
      const p = project(d.x, d.y, d.z);
      for (let n = 0; n < 4; n++) {
        const ix = (p.sx - n * 0.35) | 0,
          iy = (p.sy - n) | 0;
        if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
        const i = iy * W + ix;
        if (p.d <= zb[i]) continue;
        const [w, c0] = f && G.vis > 0 ? glowAt(f, ix, iy, k) : [0, 0];
        const g = Math.min(w + c0, 0.25),
          c = pix[i],
          lit = 0.45 + g * 2.1;
        if (lit < 0.5 && hash(ix, iy) > 0.65) continue;
        pix[i] = rgb(
          (c & 255) * 0.8 + (42 + 280 * g) * lit,
          ((c >> 8) & 255) * 0.8 + (38 + 110 * g) * lit,
          ((c >> 16) & 255) * 0.8 + (66 + 240 * g) * lit,
        );
      }
    }
    for (const s of SPLASH) {
      const p = project(s.x, s.y, 0);
      for (const dx of [-1, 1]) {
        const ix = (p.sx + dx) | 0,
          iy = (p.sy - 1) | 0;
        if (ix >= 0 && iy >= 0 && ix < W && iy < H && !FOG[iy * W + ix])
          pix[iy * W + ix] = rgb(170, 140, 130);
      }
    }
  };
  let glitchUntil = 0,
    nextGlitch = 3;
  let glitchRows: [number, number, number][] = [];
  // Her layer, shifted with her place on the walkway. While she is projecting in or out, rows tear sideways
  // and drop out; once she is solid, a short glitch every few seconds.
  const drawGiant = (f: HoloFrame, t: number, k: number) => {
    if (G.vis <= 0) return;
    const band = STILL ? -99 : ((t * 52) % (H + 120)) - 60;
    if (!STILL && t > nextGlitch) {
      glitchUntil = t + 0.12;
      nextGlitch = t + 4 + Math.random() * 5;
      glitchRows = Array.from({ length: 3 }, () => [
        (Math.random() * H) | 0,
        3 + ((Math.random() * 8) | 0),
        (Math.random() < 0.5 ? -1 : 1) * (3 + ((Math.random() * 4) | 0)),
      ]);
    }
    const glitch = t < glitchUntil,
      v = G.vis,
      tick = Math.floor(t * 18);
    const flick = STILL
      ? 1
      : 0.94 + 0.06 * Math.sin(t * 23) * Math.sin(t * 3.1);
    const bob = STILL ? 0 : Math.round(Math.sin(t * 0.9)); // she floats a pixel up and down
    const off = (k * COS) / S;
    for (let iy = 0; iy < H; iy++) {
      const fy = iy - bob + k / 2 - f.y0;
      if (fy < 0 || fy >= f.h) continue;
      let shift = 0;
      if (v < 1 && !STILL) {
        const r = hash(iy >> 1, tick);
        if (r > v + 0.15) continue; // this row has not arrived yet
        if (r > v - 0.25)
          shift =
            (hash(iy, tick + 1) < 0.5 ? -1 : 1) *
            (2 + ((hash(iy, tick) * 10) | 0));
      }
      if (glitch)
        for (const [r, n, s] of glitchRows)
          if (iy >= r && iy < r + n) shift = s;
      const scanRow = iy % 3 === 0;
      const lift = Math.abs(iy - band) < 4 || (v < 1 && shift) ? 1.2 : 1;
      const x0 = Math.max(0, f.x0 + shift + k),
        x1 = Math.min(W, f.x0 + f.w + shift + k);
      for (let ix = x0; ix < x1; ix++) {
        const j = fy * f.w + ix - shift - k - f.x0,
          i = iy * W + ix;
        if (f.z[j] < -1e8 || f.z[j] - off <= zb[i]) continue;
        const kind = f.kind[j],
          scan = scanRow
            ? kind === 3 || kind === 4 || kind >= 6
              ? 0.94
              : 0.82
            : 1;
        let a = f.a[j] * 0.92 * scan * flick * lift * (0.35 + 0.65 * v);
        if (a < bayerAt(ix, iy) * 0.35) continue;
        a = Math.min(1, a);
        const h = f.c[j],
          c = pix[i];
        pix[i] = rgb(
          (c & 255) * (1 - a) + (h & 255) * a * lift,
          ((c >> 8) & 255) * (1 - a) + ((h >> 8) & 255) * a * lift,
          ((c >> 16) & 255) * (1 - a) + ((h >> 16) & 255) * a * lift,
        );
      }
    }
  };
  // Reflections in standing water. Each pixel above the deck has a depth, so its height z above the ground
  // is known; mirrored through the ground it lands 2 z COS S pixels lower on screen. The nearest mirrored
  // point wins each puddle pixel, with a small ripple that moves.
  const refC = new Uint32Array(W * H),
    refZ = new Float32Array(W * H),
    refW = new Float32Array(W * H);
  const drawReflections = (f: HoloFrame | null, k: number, t: number) => {
    refZ.fill(-1e9);
    const mirror = (
      ix: number,
      iy: number,
      d: number,
      c: number,
      w: number,
    ) => {
      const z = d * SIN - ((iy + 0.5 - OY) / S) * COS;
      if (z <= 0.03) return;
      const ty = Math.round(iy + 2 * z * COS * S);
      if (ty < 0 || ty >= H) return;
      const tx = ix + Math.round(Math.sin(ty * 0.7 + t * 5) * 0.8);
      if (tx < 0 || tx >= W) return;
      const j = ty * W + tx;
      if (!puddle[j] || !ground[j] || zb[j] !== groundZ[j] || d <= refZ[j])
        return;
      refZ[j] = d;
      refC[j] = c;
      refW[j] = w;
    };
    // the walkway's own structure and the man
    for (let iy = 0; iy < H; iy++)
      for (let ix = 0; ix < W; ix++) {
        const i = iy * W + ix,
          d = zb[i];
        if (d < -1e8 || (ground[i] && d === groundZ[i])) continue;
        mirror(ix, iy, d, pix[i], 1);
      }
    // her, from her own frame and depth
    if (f && G.vis > 0) {
      const off = (k * COS) / S;
      for (let y = 0; y < f.h; y++)
        for (let x = 0; x < f.w; x++) {
          const j = y * f.w + x;
          if (f.z[j] > -1e8)
            mirror(
              f.x0 + x + k,
              f.y0 + y - k / 2,
              f.z[j] - off,
              f.c[j],
              f.a[j] * G.vis,
            );
        }
    }
    for (let i = 0; i < W * H; i++) {
      if (refZ[i] < -1e8) continue;
      const c = pix[i],
        r = refC[i],
        w = refW[i] * 0.42;
      pix[i] = rgb(
        (c & 255) * (1 - w * 0.6) + (r & 255) * w,
        ((c >> 8) & 255) * (1 - w * 0.6) + ((r >> 8) & 255) * w,
        ((c >> 16) & 255) * (1 - w * 0.6) + ((r >> 16) & 255) * w,
      );
    }
  };
  // lamps repeat with the walkway, so they scroll by the wrapped offset
  const drawLamps = (t: number, k: number) => {
    const cw = ((((k % KP) + KP) % KP) * R2) / S;
    LAMPS.forEach((L, n) => {
      const p = project(L[0], L[1] - cw, L[2]);
      if (
        p.sx < 1 ||
        p.sy < 1 ||
        p.sx > W - 3 ||
        p.sy > H - 3 ||
        FOG[(p.sy | 0) * W + (p.sx | 0)]
      )
        return;
      const c =
        STILL || n % 3 || Math.sin(t * 1.3) > -0.95
          ? rgb(120, 255, 236)
          : rgb(60, 120, 120);
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ])
        pix[((p.sy + dy) | 0) * W + ((p.sx + dx) | 0)] = c;
      for (const [dx, dy] of [
        [-1, 0],
        [2, 0],
        [0, -1],
        [1, -1],
        [0, 2],
        [1, 2],
      ]) {
        const ix = (p.sx + dx) | 0,
          iy = (p.sy + dy) | 0;
        if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
        const q = pix[iy * W + ix];
        pix[iy * W + ix] = rgb(
          (q & 255) + 20,
          ((q >> 8) & 255) + 90,
          ((q >> 16) & 255) + 90,
        );
      }
    });
  };
  const draw = () => {
    const k = G.k,
      f = currentFrame();
    drawWalkway(k);
    drawFog(k);
    drawDeckLight(k);
    if (f) drawGlow(f, k);
    drawMan({ ...G.man, y: G.man.y - camY() }); // drawn in view space
    flushShadows();
    applyShadows(groundZ);
    drawSigns(G.time);
    if (f) drawGiant(f, G.time, k);
    drawLamps(G.time, k);
    drawReflections(f, k, G.time);
    drawRain(f, k);
    ctx.putImageData(image, 0, 0);
  };

  /* ---------- input and sizing ---------- */
  // integer pixel scale when the box allows it, so every scene pixel is the same size
  const fit = () => {
    const box = canvas.parentElement;
    if (!box) return;
    const dpr = window.devicePixelRatio || 1;
    const fitScale = Math.min(box.clientWidth / W, box.clientHeight / H);
    const scale =
      fitScale * dpr < 1 ? fitScale : Math.floor(fitScale * dpr) / dpr;
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
  };
  const resize = new ResizeObserver(fit);
  if (canvas.parentElement) resize.observe(canvas.parentElement);
  fit();

  const onPointerDown = (e: PointerEvent) => {
    canvas.focus({ preventScroll: true });
    if (G.locked) return;
    const r = canvas.getBoundingClientRect();
    const g = unproject(
      ((e.clientX - r.left) / r.width) * W,
      ((e.clientY - r.top) / r.height) * H,
    );
    G.man.tx = clamp(g.x, DECK.x0 + 0.7, DECK.x1 - 0.7);
    G.man.ty = g.y + camY();
  };
  // ↑ walks him up the walkway to the right, ↓ walks him back to the left. Keys are read on the window so
  // they work without clicking the scene first; typing in a form field is left alone.
  const KEYS: Record<string, number> = {
    ArrowUp: -1,
    w: -1,
    W: -1,
    ArrowDown: 1,
    s: 1,
    S: 1,
  };
  const typing = (e: KeyboardEvent) =>
    e.target instanceof HTMLElement &&
    (e.target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  // letting go stops him where he stands; the held-key target runs 1.2 units ahead of him
  const stop = () => {
    G.keys = 0;
    G.man.tx = G.man.x;
    G.man.ty = G.man.y;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const k = KEYS[e.key];
    if (!k || typing(e)) return;
    e.preventDefault();
    if (!G.locked) G.keys = k;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (KEYS[e.key] === G.keys) stop();
  };
  const onBlur = () => {
    if (G.keys) stop();
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  /* ---------- run ---------- */
  let frameId = 0,
    last = 0,
    destroyed = false;
  const frame = (now: number) => {
    update(clamp((now - last) / 1000, 0, 0.04)); // rAF can stamp a frame before `last`
    last = now;
    draw();
    frameId = requestAnimationFrame(frame);
  };
  // Her frames start baking at once; the walkway bakes after the page paints, then the scene runs.
  startWorkers();
  const timer = window.setTimeout(() => {
    if (destroyed) return;
    bakeScene();
    G.k = 2 * Math.round((G.cam * S) / R2 / 2);
    last = performance.now();
    frameId = requestAnimationFrame(frame);
    callbacks.onReady();
  }, 0);

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
      for (const w of workers) w.terminate();
      resize.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    },
  };
}
