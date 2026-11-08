/**
 * Phatake: Diwali crackers on the BLANK Interfaces logo.
 *
 * The logo is extruded into a black slab and kept as a heightmap with soot and
 * litter grids, so every cracker leaves a mark: sutli bombs break chunks out of
 * it, rockets climb off it (one in four skids across instead), anaar fountains
 * and chakris scorch it, ladis scatter red paper. Three children in a lehenga,
 * a kurta and a Nehru jacket do the lighting. Tap a spot on the logo and the
 * nearest free child runs there, crouches to light it with an agarbatti, runs
 * off and covers their ears. Twelve crackers a round; once they are spent, a
 * tap sweeps the logo clean.
 *
 * `mountPhatake` takes a canvas, renders at 360 by 280 through the engine and
 * returns controls to pause, resume and destroy the loop.
 */

import {
  bayerAt,
  COS,
  clamp,
  createEngine,
  GRASS,
  H,
  hash,
  KIND_GRASS,
  lerp,
  noise,
  pack,
  type RGB,
  rampOf,
  rgb,
  S,
  SIN,
  type Vec3,
  W,
  WIND_FPS,
} from "./engine";
import { LOGO_MARK, LOGO_PATHS, LOGO_VIEWBOX } from "./logo";

export interface PhatakeOptions {
  /** Play synthesized cracker sounds after the first tap. */
  sound?: boolean;
}

export interface PhatakeControls {
  pause(): void;
  resume(): void;
  destroy(): void;
}

type CrackerType = "bomb" | "rocket" | "anaar" | "chakri" | "ladi";
type KidState = "idle" | "go" | "light" | "flee" | "ears" | "cheer";
type PartKind = "spark" | "ember" | "star" | "chunk";
type SoundKind =
  | "boom"
  | "pop"
  | "fuse"
  | "whistle"
  | "crackle"
  | "hiss"
  | "whirr";

interface Spot {
  x: number;
  y: number;
  z: number;
}
interface Flight {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  skid: boolean;
}
interface Cracker extends Spot {
  type: CrackerType;
  state: "carried" | "placed" | "fuse" | "live" | "done";
  t: number;
  fly: Flight | null;
  vx: number;
  vy: number;
  sootT: number;
  /** Ladi only: direction of the string and how many have popped. */
  dx: number;
  dy: number;
  n: number;
  popped: number;
}
interface Part {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  col: number;
  kind: PartKind;
}
interface Puff {
  x: number;
  y: number;
  z: number;
  r: number;
  life: number;
  max: number;
  drift: number;
}
interface Flash {
  x: number;
  y: number;
  z: number;
  r: number;
  t: number;
}
interface Debris {
  type: "bottle" | "cone" | "coil";
  x: number;
  y: number;
  z: number;
}
type Outfit =
  | {
      kind: "lehenga";
      skirt: RGB;
      border: RGB;
      top: RGB;
      dupatta: RGB;
      skin: RGB;
      hair: RGB;
    }
  | {
      kind: "kurta" | "jacket";
      kurta: RGB;
      jacket: RGB;
      trim: RGB;
      pajama: RGB;
      skin: RGB;
      hair: RGB;
    };
interface Kid {
  outfit: Outfit;
  sparkler: boolean;
  home: { x: number; y: number };
  look: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  state: KidState;
  t: number;
  phase: number;
  job: Cracker | null;
  goal: { x: number; y: number };
  sparkTip: Vec3 | null;
  incense: Vec3 | null;
}

/* the slab: the logo as a destructible heightmap */
const SL = 22;
const SD = (22 * LOGO_VIEWBOX.h) / LOGO_VIEWBOX.w;
const H0 = 1.3;
const X0 = -SL / 2;
const Y0 = -SD / 2;
const CELL = 0.1;
const GX = Math.ceil(SL / CELL);
const GY = Math.ceil(SD / CELL);
const MASK_RES = 0.025;
const MW = Math.ceil(SL / MASK_RES);
const MH = Math.ceil(SD / MASK_RES);
const ST = 0.045;
const KIND_STONE = 1;
const KIND_RANGOLI = 2;
const KIND_SLAB = 5;
const CRACKERS = 12;

/* palette */
const packAll = (list: readonly RGB[]) => list.map(pack);
const BLACK_T = packAll([
  [19, 19, 18],
  [24, 24, 22],
  [29, 28, 26],
  [34, 33, 30],
]);
const CREAM_T = packAll([
  [212, 210, 200],
  [219, 217, 208],
  [226, 224, 216],
  [232, 230, 223],
]);
const CORE_T = packAll([
  [170, 158, 140],
  [182, 170, 152],
  [193, 182, 164],
  [203, 193, 176],
]); // sandy concrete under the black coat
const SOOT_T = packAll([
  [30, 27, 27],
  [40, 36, 34],
  [52, 46, 42],
]);
const ASH_T = packAll([
  [74, 69, 65],
  [88, 82, 76],
  [104, 97, 89],
]);
const PAPER_C = [0, rgb(206, 62, 52), rgb(232, 186, 70), rgb(104, 98, 92)]; // red paper, gold foil, ash
const STONE_T = packAll([
  [214, 197, 162],
  [220, 204, 170],
  [226, 211, 178],
  [231, 217, 185],
]);
const GROUT = rgb(196, 178, 142);
const SLAB_SIDE: RGB = [24, 23, 22];
const CORE_SIDE: RGB = [198, 186, 166];
const CLAY: RGB = [168, 94, 58];
const BOTTLE: RGB = [70, 128, 96];
const BURNT: RGB = [64, 48, 42];
const TWINE: RGB = [184, 150, 100];
const FUSE_CORD: RGB = [90, 80, 64];
const ROCKET_RED: RGB = [196, 60, 50];
const STICK: RGB = [150, 118, 76];
const CHAKRI_A: RGB = [52, 140, 84];
const CHAKRI_B: RGB = [222, 70, 60];
const LADI: RGB = [206, 58, 50];
const MOJARI: RGB = [150, 92, 44];
const JASMINE: RGB = [250, 248, 236];
const GOLD: RGB = [236, 196, 82];
const SPARKLER_WIRE: RGB = [120, 116, 112];
const INCENSE: RGB = [96, 64, 44];
const SMOKE: RGB = [168, 164, 158];
const SPARK_COLS = [rgb(255, 246, 214), rgb(255, 214, 96), rgb(255, 170, 60)];
const STAR_COLS = [
  [rgb(255, 214, 10), rgb(255, 246, 200)],
  [rgb(236, 80, 160), rgb(255, 190, 230)],
  [rgb(80, 210, 160), rgb(200, 255, 230)],
  [rgb(110, 150, 255), rgb(220, 230, 255)],
];

/* ground: a sandstone aangan with a rangoli */
const HALF_X = 16.5;
const HALF_Y = 11;
const RC = { x: 0.4, y: 7.1, r: 1.9 };
const RANGOLI = {
  white: rgb(244, 240, 228),
  yellow: rgb(240, 192, 48),
  orange: rgb(232, 124, 40),
  magenta: rgb(196, 46, 118),
  indigo: rgb(72, 62, 148),
  green: rgb(62, 138, 86),
};
const DIYAS = [
  ...Array.from({ length: 7 }, (_, k) => {
    const a = (k / 7) * 6.283 + 0.3;
    return {
      x: RC.x + Math.cos(a) * 2.45,
      y: RC.y + Math.sin(a) * 2.45 * 0.82,
    };
  }),
  { x: -11.8, y: 4.4 },
  { x: 11.9, y: -2.6 },
  { x: 12.2, y: 3.2 },
];

const FUSE: Record<CrackerType, number> = {
  bomb: 1.5,
  rocket: 1,
  anaar: 0.9,
  chakri: 0.8,
  ladi: 0.7,
};
const BAG: readonly CrackerType[] = [
  "bomb",
  "bomb",
  "bomb",
  "rocket",
  "rocket",
  "rocket",
  "anaar",
  "anaar",
  "chakri",
  "chakri",
  "ladi",
  "ladi",
];
const KID_SCALE = 1.25;
const WALK = 2.6;
const RUN = 3.6;
const OUTFITS: Outfit[] = [
  {
    kind: "lehenga",
    skirt: [192, 44, 112],
    border: [232, 182, 62],
    top: [236, 168, 52],
    dupatta: [242, 132, 64],
    skin: [178, 122, 88],
    hair: [30, 22, 20],
  },
  {
    kind: "kurta",
    kurta: [236, 146, 46],
    jacket: [236, 146, 46],
    trim: [250, 214, 110],
    pajama: [238, 232, 216],
    skin: [158, 106, 76],
    hair: [26, 20, 18],
  },
  {
    kind: "jacket",
    kurta: [236, 226, 204],
    jacket: [36, 112, 112],
    trim: [226, 180, 72],
    pajama: [236, 226, 204],
    skin: [170, 116, 84],
    hair: [34, 24, 20],
  },
];
const HOMES = [
  { x: -8.2, y: 1.1, yaw: 0.9 },
  { x: -5.4, y: 2.4, yaw: 0.6 },
  { x: 2.6, y: -0.4, yaw: 1.3 },
];

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mountPhatake(
  canvas: HTMLCanvasElement,
  { sound: soundOn = true }: PhatakeOptions = {},
): PhatakeControls {
  const E = createEngine(canvas, {
    originY: 30,
    shadowX: 1.05,
    shadowY: -0.14,
  });
  const {
    pix,
    zb,
    ground,
    groundZ,
    kinds,
    shadowMask,
    project,
    unproject,
    sphere,
    capsule,
    castShadow,
    tint,
  } = E;

  const height = new Float32Array(GX * GY);
  const intact = new Uint8Array(GX * GY);
  const soot = new Float32Array(GX * GY);
  const dirt = new Uint8Array(GX * GY);
  const maskSlab = new Uint8Array(MW * MH);
  const maskLetter = new Uint8Array(MW * MH);
  const isTop = new Uint8Array(W * H);
  const topShadow = new Uint8Array(W * H);
  const cache = {
    pix: new Uint32Array(W * H),
    zb: new Float32Array(W * H),
    kinds: new Uint8Array(W * H),
    gz: new Float32Array(W * H),
    ground: new Uint8Array(W * H),
  };
  const staticCasts: [number, number, number, number][] = [];

  const G = {
    phase: "play" as "play" | "over",
    time: 0,
    timer: 0,
    queue: [] as CrackerType[],
    left: CRACKERS,
    crackers: [] as Cracker[],
    debris: [] as Debris[],
    parts: [] as Part[],
    smoke: [] as Puff[],
    flashes: [] as Flash[],
    bones: [] as [Vec3, number, Vec3, number][],
    dirty: true,
    bakedAt: 0,
  };

  const kids: Kid[] = HOMES.map((h, n) => ({
    outfit: OUTFITS[n],
    sparkler: n === 0,
    home: { x: h.x, y: h.y },
    look: h.yaw,
    x: h.x,
    y: h.y,
    z: H0,
    yaw: h.yaw,
    state: "idle",
    t: 0,
    phase: 0,
    job: null,
    goal: { x: h.x, y: h.y },
    sparkTip: null,
    incense: null,
  }));

  /* ---------- logo mask and heightmap ---------- */
  function buildMask() {
    const c = document.createElement("canvas");
    c.width = MW;
    c.height = MH;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return;
    const sx = MW / LOGO_VIEWBOX.w;
    const sy = MH / LOGO_VIEWBOX.h;
    g.setTransform(sx, 0, 0, sy, -LOGO_VIEWBOX.x * sx, -LOGO_VIEWBOX.y * sy);
    g.save();
    g.transform(1, 0, 0, LOGO_VIEWBOX.groupScaleY, 0, 0);
    for (const [d, light] of LOGO_PATHS) {
      g.fillStyle = light ? "#fff" : "#000";
      g.fill(new Path2D(d));
    }
    g.restore();
    g.fillStyle = "#fff";
    g.font = `800 ${LOGO_MARK.size}px Inter, Helvetica, Arial, sans-serif`;
    g.fillText(LOGO_MARK.text, LOGO_MARK.x, LOGO_MARK.y);
    const data = g.getImageData(0, 0, MW, MH).data;
    for (let i = 0; i < MW * MH; i++) {
      if (data[i * 4 + 3] < 128) continue;
      maskSlab[i] = 1;
      if (data[i * 4] > 127) maskLetter[i] = 1;
    }
  }
  function maskAt(x: number, y: number, m: Uint8Array) {
    if (x < X0 || y < Y0) return 0;
    const mx = ((x - X0) / MASK_RES) | 0;
    const my = ((y - Y0) / MASK_RES) | 0;
    return mx < MW && my < MH ? m[my * MW + mx] : 0;
  }
  function cellOf(x: number, y: number) {
    if (x < X0 || y < Y0) return -1;
    const gx = ((x - X0) / CELL) | 0;
    const gy = ((y - Y0) / CELL) | 0;
    return gx < GX && gy < GY ? gy * GX + gx : -1;
  }
  const heightAt = (x: number, y: number) => {
    const c = cellOf(x, y);
    return c < 0 ? 0 : height[c];
  };
  const wasSlab = (x: number, y: number) => {
    const c = cellOf(x, y);
    return c >= 0 && intact[c] === 1;
  };
  const onSlab = (x: number, y: number) =>
    heightAt(x, y) > 0.6 ? { x, y } : null;
  function resetSlab() {
    soot.fill(0);
    dirt.fill(0);
    for (let gy = 0; gy < GY; gy++)
      for (let gx = 0; gx < GX; gx++) {
        const inside = maskAt(
          X0 + (gx + 0.5) * CELL,
          Y0 + (gy + 0.5) * CELL,
          maskSlab,
        );
        height[gy * GX + gx] = inside ? H0 : 0;
        intact[gy * GX + gx] = inside;
      }
    G.debris.length = 0;
    G.dirty = true;
  }
  // visit every cell whose centre is within r of (x, y), with a ragged edge so breaks never read as circles
  function eachCell(
    x: number,
    y: number,
    r: number,
    fn: (c: number, d: number, cx: number, cy: number) => void,
  ) {
    const g0x = Math.max(0, ((x - r - X0) / CELL) | 0);
    const g1x = Math.min(GX - 1, ((x + r - X0) / CELL) | 0);
    const g0y = Math.max(0, ((y - r - Y0) / CELL) | 0);
    const g1y = Math.min(GY - 1, ((y + r - Y0) / CELL) | 0);
    for (let gy = g0y; gy <= g1y; gy++)
      for (let gx = g0x; gx <= g1x; gx++) {
        const cx = X0 + (gx + 0.5) * CELL;
        const cy = Y0 + (gy + 0.5) * CELL;
        const d =
          Math.hypot(cx - x, cy - y) /
          (r * (0.82 + noise(cx * 2.3 + x, cy * 2.3) * 0.36));
        if (d < 1) fn(gy * GX + gx, d, cx, cy);
      }
  }
  function addSoot(x: number, y: number, r: number, amount: number) {
    eachCell(x, y, r, (c, d) => {
      if (height[c] > 0) soot[c] = Math.min(1, soot[c] + amount * (1 - d * d));
    });
    G.dirty = true;
  }
  function addCrater(x: number, y: number, r: number, depth: number) {
    eachCell(x, y, r, (c, d) => {
      if (height[c] <= 0) return;
      const h = Math.min(height[c], H0 - depth * (1 - d * d));
      height[c] = h < 0.3 ? 0 : h; // thin shards fall away: the slab chips
    });
    G.dirty = true;
  }
  function addDirt(
    x: number,
    y: number,
    r: number,
    kind: number,
    density: number,
  ) {
    eachCell(x, y, r, (c, d, cx, cy) => {
      if (
        height[c] > 0 &&
        hash(cx * 7.1, cy * 3.3 + G.time) < density * (1 - d)
      )
        dirt[c] = kind;
    });
    G.dirty = true;
  }

  /* ---------- ground ---------- */
  function rangoli(x: number, y: number, ix: number, iy: number) {
    const dx = x - RC.x;
    const dy = y - RC.y;
    const r = Math.hypot(dx, dy) / RC.r;
    if (r > 1) return 0;
    const a = Math.atan2(dy, dx);
    const R = RANGOLI;
    let c: number;
    if (r > 0.9)
      c = Math.floor((a + Math.PI) / (Math.PI / 14)) % 2 ? R.white : R.green;
    else if (r > 0.8) c = R.orange;
    else if (r < 0.12) c = R.white;
    else if (r < 0.26) c = R.yellow;
    else {
      const petal = 0.42 + 0.36 * Math.abs(Math.cos(a * 4)) ** 0.7;
      c = r < petal ? (r < 0.5 ? R.yellow : R.magenta) : R.indigo;
    }
    if (hash(ix * 5, iy * 3) > 0.9) c = R.white; // loose powder
    return c;
  }
  function groundColor(
    x: number,
    y: number,
    ix: number,
    iy: number,
    i: number,
  ) {
    const edge =
      ((Math.abs(x) / HALF_X) ** 4 + (Math.abs(y) / HALF_Y) ** 4) ** 0.25 +
      (noise(x * 1.3, y * 1.3) - 0.5) * 0.1;
    if (edge > 1.04) return 0;
    if (edge > 0.94 && hash(ix, iy) < (edge - 0.94) / 0.1) return 0;
    if (edge > 0.87 + (noise(x * 0.7 + 3, y * 0.7) - 0.5) * 0.1) {
      kinds[i] = KIND_GRASS;
      const t =
        noise(x * 0.9, y * 0.9) * 1.15 + (hash(ix, iy) - 0.5) * 0.55 - 0.08;
      return pack(GRASS[clamp(Math.floor(t * 4.2), 0, 3)]);
    }
    const rg = rangoli(x, y, ix, iy);
    if (rg) {
      kinds[i] = KIND_RANGOLI;
      return rg;
    }
    kinds[i] = KIND_STONE;
    const T = 2.4;
    const tx = Math.floor(x / T);
    const ty = Math.floor(y / T);
    if (x / T - tx < 0.045 || y / T - ty < 0.045) return GROUT;
    const v =
      0.5 + (hash(tx, ty) - 0.5) * 0.5 + (noise(x * 1.1, y * 1.1) - 0.5) * 0.35;
    return STONE_T[
      clamp(Math.floor(v * 4 + (bayerAt(ix, iy) - 0.5) * 0.6), 0, 3)
    ];
  }

  /* ---------- baking ---------- */
  function bakeGround() {
    zb.fill(-1e9);
    pix.fill(rgb(255, 255, 255));
    for (let iy = 0; iy < H; iy++)
      for (let ix = 0; ix < W; ix++) {
        const g = unproject(ix + 0.5, iy + 0.5);
        const i = iy * W + ix;
        const c = groundColor(g.x, g.y, ix, iy, i);
        if (!c) continue;
        pix[i] = c;
        ground[i] = 1;
        zb[i] = ((g.x + g.y) / Math.SQRT2) * COS;
      }
    E.growGrass();
    cache.gz.set(zb);
    cache.ground.set(ground);
    // props that never break: diyas, a neem by the back corner
    for (const d of DIYAS) {
      sphere(d.x, d.y, 0.02, 0.17, CLAY, "solid");
      staticCasts.push([d.x, d.y, 0.1, 0.16]);
    }
    E.growTree(-13.2, -6.4, 0.62, 260, 5);
    for (let k = 0; k <= 6; k++)
      staticCasts.push([-13.2 + 0.03 * k, -6.4, k * 0.22, 0.2]);
    cache.pix.set(pix);
    cache.zb.set(zb);
    cache.kinds.set(kinds);
  }
  function wall(
    a: number,
    b: number,
    z0: number,
    z1: number,
    level: number,
    broken: boolean,
  ) {
    const ramp = rampOf(broken ? CORE_SIDE : SLAB_SIDE);
    for (let z = z0; z <= z1; z += ST) {
      const p = project(a, b, z);
      const ix = p.sx | 0;
      const iy = p.sy | 0;
      if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
      const i = iy * W + ix;
      if (p.d <= zb[i]) continue;
      zb[i] = p.d;
      isTop[i] = 0;
      kinds[i] = KIND_SLAB;
      pix[i] =
        ramp[
          clamp(
            Math.floor(
              level +
                (noise(a * 2 + b, z * 9) - 0.5) * 0.9 +
                (bayerAt(ix, iy) - 0.5) * 0.5,
            ),
            0,
            4,
          )
        ];
    }
  }
  function topColor(
    x: number,
    y: number,
    h: number,
    c: number,
    ix: number,
    iy: number,
  ) {
    const bay = bayerAt(ix, iy);
    let tones: number[];
    let v: number;
    let kind: 0 | 1 | 2;
    if (h < H0 - 0.04) {
      kind = 2;
      tones = CORE_T;
      v = 0.2 + (h / H0) * 0.6 + (noise(x * 3, y * 3) - 0.5) * 0.4;
    } else if (maskAt(x, y, maskLetter)) {
      kind = 1;
      tones = CREAM_T;
      v = 0.5 + (noise(x * 1.5, y * 1.5) - 0.5) * 0.5;
    } else {
      kind = 0;
      tones = BLACK_T;
      v = 0.5 + (noise(x * 1.2, y * 1.2) - 0.5) * 0.6;
    }
    let col = tones[clamp(Math.floor(v * 4 + (bay - 0.5) * 0.6), 0, 3)];
    const s = soot[c];
    if (s > 0) {
      // grain, not the Bayer matrix: soot is a smudge, and an ordered pattern reads as a checkerboard on black
      const sv = s * 1.15 + (noise(x * 4.5, y * 4.5) - 0.5) * 0.55;
      const grain = hash(ix * 1.7, iy * 2.3);
      if (kind === 0) {
        if (sv * 0.55 > grain)
          col =
            ASH_T[clamp(Math.floor(sv * 3 + hash(ix, iy) * 0.6 - 0.4), 0, 2)];
      } else if (sv * (kind === 2 ? 0.2 : 1) > grain) {
        col =
          SOOT_T[clamp(Math.floor((1 - sv) * 3 + hash(ix, iy) * 0.7), 0, 2)];
      }
    }
    // litter settles on the surface, not in the fresh break, so a crater keeps its clean cut-stone form
    const dk = kind === 2 ? 0 : dirt[c];
    if (dk && hash(ix * 3, iy * 7) < 0.5) col = PAPER_C[dk];
    return col;
  }
  function paintSlab() {
    isTop.fill(0);
    for (let a = X0; a < X0 + SL; a += ST)
      for (let b = Y0; b < Y0 + SD; b += ST) {
        const c = cellOf(a, b);
        if (c < 0) continue;
        const h = height[c];
        if (h <= 0) continue;
        // exposed walls facing the camera: +x (lower right) and +y (lower left)
        const nx = heightAt(a + ST, b);
        const ny = heightAt(a, b + ST);
        if (nx < h)
          wall(a, b, nx, h, 1.2, h < H0 - 0.04 || nx > 0 || wasSlab(a + ST, b));
        if (ny < h)
          wall(a, b, ny, h, 2.3, h < H0 - 0.04 || ny > 0 || wasSlab(a, b + ST));
        const p = project(a, b, h);
        const ix = p.sx | 0;
        const iy = p.sy | 0;
        if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
        const i = iy * W + ix;
        if (p.d <= zb[i]) continue;
        zb[i] = p.d;
        isTop[i] = 1;
        kinds[i] = KIND_SLAB;
        pix[i] = topColor(a, b, h, c, ix, iy);
      }
  }
  function drawDebris() {
    for (const d of G.debris) {
      if (d.type === "bottle") {
        capsule(
          [d.x, d.y, d.z],
          [d.x, d.y, d.z + 0.32],
          0.13,
          0.09,
          () => BOTTLE,
          "solid",
        );
        capsule(
          [d.x, d.y, d.z + 0.32],
          [d.x, d.y, d.z + 0.5],
          0.05,
          0.05,
          () => BOTTLE,
          "solid",
        );
      } else if (d.type === "cone")
        capsule(
          [d.x, d.y, d.z],
          [d.x, d.y, d.z + 0.3],
          0.18,
          0.07,
          () => BURNT,
          "solid",
        );
      else sphere(d.x, d.y, d.z + 0.02, 0.12, BURNT, "rough");
    }
  }
  /* shadows that land on the slab top instead of the ground plane */
  function castAt(x: number, y: number, z: number, r: number, strength = 1) {
    const hp = heightAt(x, y);
    if (hp <= 0) {
      castShadow(x, y, z, r, strength, 0);
      return;
    }
    const lift = Math.max(0, z - hp);
    const p = project(x + E.shadowX * lift, y + E.shadowY * lift, hp);
    const rx = r * S * 1.05;
    const ry = rx * SIN + 1;
    for (
      let iy = Math.max(0, (p.sy - ry) | 0);
      iy <= Math.min(H - 1, Math.ceil(p.sy + ry));
      iy++
    )
      for (
        let ix = Math.max(0, (p.sx - rx) | 0);
        ix <= Math.min(W - 1, Math.ceil(p.sx + rx));
        ix++
      ) {
        const dx = (ix + 0.5 - p.sx) / rx;
        const dy = (iy + 0.5 - p.sy) / ry;
        if (dx * dx + dy * dy > 1) continue;
        const i = iy * W + ix;
        if (topShadow[i] < strength) topShadow[i] = strength;
      }
  }
  function applyTopShadows(refZ: Float32Array) {
    for (let i = 0; i < W * H; i++) {
      const s = topShadow[i];
      if (!s) continue;
      topShadow[i] = 0;
      if (!isTop[i] || zb[i] !== refZ[i]) continue;
      if (s === 1) tint(i, 0.6, 0.58, 0.76);
      else tint(i, 0.42, 0.4, 0.6);
    }
  }
  function bakeSlab() {
    pix.set(cache.pix);
    zb.set(cache.zb);
    kinds.set(cache.kinds);
    groundZ.set(cache.gz);
    ground.set(cache.ground);
    shadowMask.fill(0);
    paintSlab();
    // the slab top is a floor for edges and kid shadows, but not ground: ground-plane shadows must not land on it
    for (let i = 0; i < W * H; i++)
      if (isTop[i]) {
        groundZ[i] = zb[i];
        ground[i] = 0;
      }
    drawDebris();
    for (const [x, y, z, r] of staticCasts) castShadow(x, y, z, r);
    for (let gy = 0; gy < GY; gy += 2)
      for (let gx = 0; gx < GX; gx += 2) {
        const h = height[gy * GX + gx];
        if (h > 0)
          castShadow(
            X0 + (gx + 0.5) * CELL,
            Y0 + (gy + 0.5) * CELL,
            h,
            0.15,
            1,
            0,
          );
      }
    for (const d of G.debris) castAt(d.x, d.y, d.z + 0.2, 0.14);
    E.bakeOcclusion();
    E.staticShadow.set(shadowMask);
    E.applyShadows(groundZ);
    applyTopShadows(groundZ);
    E.bakedPix.set(pix);
    E.bakedZ.set(zb);
    G.dirty = false;
    G.bakedAt = G.time;
  }

  /* ---------- the children ---------- */
  function kidPose(k: Kid) {
    const breathe = E.still ? 0 : Math.sin(G.time * 2 + k.x) * 0.015;
    const walking = k.state === "go" || k.state === "flee";
    const sw = walking ? Math.sin(k.phase) : 0;
    const p = {
      crouch: 0,
      lean: breathe,
      step: sw * (k.state === "flee" ? 0.34 : 0.26),
      lift: walking ? Math.max(0, Math.cos(k.phase)) * 0.1 : 0,
      armR: -sw * 0.5,
      armL: sw * 0.5,
      bendR: 0.25,
      bendL: 0.25,
      ears: false,
      up: 0,
    };
    if (k.state === "light") {
      p.crouch = Math.min(1, k.t / 0.25);
      p.lean = 0.35 * p.crouch;
      p.armR = 1.25;
      p.bendR = 0.1;
    }
    if (k.state === "ears") {
      p.ears = true;
      p.crouch = 0.25;
      p.lean = -0.06;
    }
    if (k.state === "cheer") {
      const b = Math.abs(Math.sin(k.t * 9));
      p.up = 1;
      p.armR = p.armL = 2.7 + b * 0.2;
      p.bendR = p.bendL = 0.1;
      p.lift = b * 0.12;
    }
    if (k.state === "idle" && k.sparkler) {
      const a = G.time * 4.2;
      p.armR = 1.4 + Math.sin(a) * 0.5;
      p.bendR = 0.35 + Math.cos(a) * 0.25;
    }
    return p;
  }
  // a child about five heads tall, built from flat-banded capsules so it reads crisp against the dithered ground
  function drawKid(k: Kid) {
    const o = k.outfit;
    const p = kidPose(k);
    const K = KID_SCALE;
    const fx = Math.cos(k.yaw);
    const fy = Math.sin(k.yaw);
    const sx = -fy;
    const sy = fx;
    const base = k.z + p.lift * K;
    const P = (a: number, b: number, c: number): Vec3 => [
      k.x + (fx * a + sx * b) * K,
      k.y + (fy * a + sy * b) * K,
      c * K + base,
    ];
    const rel = (z: number) => (z - base) / K;
    const add = (
      a: Vec3,
      b: Vec3,
      r0: number,
      r1: number,
      col: RGB | ((z: number) => RGB),
    ) => {
      capsule(
        a,
        b,
        r0 * K,
        r1 * K,
        typeof col === "function" ? col : () => col,
        "solid",
      );
      G.bones.push([a, r0 * K, b, r1 * K]);
    };
    const hipZ = 0.9 - p.crouch * 0.34;
    const hipA = -p.crouch * 0.16;
    const shZ = hipZ + Math.cos(p.lean) * 0.6;
    const shA = hipA + Math.sin(p.lean) * 0.6;
    const headZ = shZ + 0.3;
    const headA = shA + Math.sin(p.lean) * 0.12;
    const headR = 0.21;
    // legs: a hip, a knee and an ankle each, with the knee pushed forward by the crouch
    const leg = (side: number, step: number) => ({
      hip: P(hipA, side * 0.11, hipZ),
      knee: P(
        (hipA + step * 0.9) / 2 + 0.06 + p.crouch * 0.32,
        side * 0.12,
        (hipZ + 0.07) / 2 + 0.04 - p.crouch * 0.05,
      ),
      foot: P(
        step * 0.9 + p.crouch * 0.12,
        side * 0.13,
        0.07 + Math.max(0, step) * 0.1,
      ),
    });
    const L = leg(1, -p.step);
    const R = leg(-1, p.step);
    const shoe = (f: Vec3) =>
      add(
        f,
        [f[0] + fx * 0.14 * K, f[1] + fy * 0.14 * K, f[2]],
        0.07,
        0.06,
        MOJARI,
      );
    if (o.kind === "lehenga") {
      // the skirt hides the legs: a flared cone from the waist to the floor with a gold hem
      const hem = 0.08 + p.crouch * 0.02;
      const flare = 0.4 + p.crouch * 0.14;
      const bands = (z: number) => {
        const r = rel(z);
        return r < hem + 0.13
          ? o.border
          : r < hem + 0.2
            ? o.skirt
            : r > hipZ - 0.14
              ? o.border
              : o.skirt;
      };
      add(
        P(hipA, 0, hipZ),
        P(hipA + p.step * 0.1 + p.crouch * 0.1, 0, hem + 0.05),
        0.17,
        flare,
        bands,
      );
      shoe(L.foot);
      shoe(R.foot);
    } else {
      for (const g of [L, R]) {
        add(g.hip, g.knee, 0.1, 0.085, o.pajama);
        add(g.knee, g.foot, 0.085, 0.07, o.pajama);
        shoe(g.foot);
      }
      // kurta skirt to the knee, over the pajama
      add(
        P(hipA, 0, hipZ + 0.04),
        P(hipA + 0.03 + p.crouch * 0.16, 0, 0.46 + p.crouch * 0.02),
        0.19,
        0.245,
        o.kurta,
      );
    }
    // torso and head
    const head = P(headA, 0, headZ);
    if (o.kind === "lehenga") {
      add(P(hipA, 0, hipZ), P(shA, 0, shZ - 0.02), 0.17, 0.2, (z) =>
        rel(z) < hipZ + 0.12 ? o.skin : o.top,
      );
    } else {
      add(P(hipA, 0, hipZ), P(shA, 0, shZ - 0.02), 0.17, 0.2, o.jacket);
      add(
        P(hipA + 0.17, 0, hipZ + 0.08),
        P(shA + 0.19, 0, shZ - 0.04),
        0.035,
        0.035,
        o.trim,
      ); // placket
    }
    add(P(shA, 0, shZ + 0.04), head, 0.07, 0.07, o.skin);
    add(head, head, headR, headR, o.skin);
    const crown: Vec3 = [
      head[0] - fx * 0.05 * K,
      head[1] - fy * 0.05 * K,
      head[2] + 0.06 * K,
    ];
    add(crown, crown, headR * 0.9, headR * 0.9, o.hair);
    if (o.kind === "lehenga") {
      add(
        P(headA - 0.17, 0, headZ - 0.06),
        P(shA - 0.24, 0, shZ - 0.42),
        0.06,
        0.045,
        o.hair,
      ); // braid
      const gajra = P(headA - 0.18, 0.08, headZ + 0.02);
      add(gajra, gajra, 0.05, 0.05, JASMINE);
      add(
        P(shA + 0.05, -0.2, shZ - 0.02),
        P(hipA + 0.14, 0.18, hipZ + 0.02),
        0.055,
        0.05,
        o.dupatta,
      ); // dupatta across the chest
      add(
        P(shA - 0.1, -0.21, shZ - 0.02),
        P(hipA - 0.14, -0.22, hipZ - 0.28),
        0.05,
        0.06,
        o.dupatta,
      ); // and its tail behind
    }
    // arms: angle 0 hangs down, 1.57 points forward, 3.14 points up
    const arm = (side: number, ang: number, bend: number) => ({
      sh: P(shA, side * 0.23, shZ - 0.03),
      el: P(
        shA + Math.sin(ang) * 0.28,
        side * (0.26 + p.up * 0.02),
        shZ - 0.03 - Math.cos(ang) * 0.28,
      ),
      hd: P(
        shA + Math.sin(ang + bend) * 0.54,
        side * 0.27,
        shZ - 0.03 - Math.cos(ang + bend) * 0.54,
      ),
    });
    let A = arm(-1, p.armR, p.bendR);
    let B = arm(1, p.armL, p.bendL);
    if (p.ears) {
      A = {
        sh: P(shA, -0.23, shZ - 0.03),
        el: P(shA + 0.08, -0.42, shZ + 0.02),
        hd: P(headA, -0.2, headZ),
      };
      B = {
        sh: P(shA, 0.23, shZ - 0.03),
        el: P(shA + 0.08, 0.42, shZ + 0.02),
        hd: P(headA, 0.2, headZ),
      };
    }
    for (const g of [A, B]) {
      if (o.kind === "lehenga") {
        add(g.sh, g.el, 0.075, 0.065, (z) =>
          rel(z) > shZ - 0.14 ? o.top : o.skin,
        );
        add(g.el, g.hd, 0.06, 0.055, o.skin);
        const w: Vec3 = [
          lerp(g.el[0], g.hd[0], 0.8),
          lerp(g.el[1], g.hd[1], 0.8),
          lerp(g.el[2], g.hd[2], 0.8),
        ];
        capsule(w, w, 0.06 * K, 0.06 * K, () => GOLD, "solid"); // bangles
      } else {
        add(g.sh, g.el, 0.075, 0.065, o.kurta);
        add(g.el, g.hd, 0.06, 0.055, o.kurta);
      }
      add(g.hd, g.hd, 0.065, 0.065, o.skin);
    }
    // the thing in the hand: a sparkler while idle, an agarbatti while lighting
    const reach = (len: number) =>
      P(
        shA + Math.sin(p.armR + p.bendR) * len,
        -0.27,
        shZ - 0.03 - Math.cos(p.armR + p.bendR) * len,
      );
    k.sparkTip = null;
    k.incense = null;
    if (k.state === "idle" && k.sparkler) {
      k.sparkTip = reach(1.05);
      capsule(A.hd, k.sparkTip, 0.025, 0.02, () => SPARKLER_WIRE, "solid");
    }
    if (k.state === "go" || k.state === "light") {
      k.incense = reach(0.82);
      capsule(A.hd, k.incense, 0.02, 0.02, () => INCENSE, "solid");
    }
  }

  /* ---------- crackers ---------- */
  // where the lit fuse sits on each cracker, so the fuse sparks come from the right place
  function fuseTip(c: Cracker): Vec3 {
    if (c.type === "bomb") return [c.x + 0.08, c.y - 0.04, c.z + 0.52];
    if (c.type === "rocket") return [c.x, c.y, c.z + 0.8];
    if (c.type === "anaar") return [c.x, c.y, c.z + 0.46];
    if (c.type === "chakri") return [c.x + 0.2, c.y, c.z + 0.08];
    return [c.x, c.y, c.z + 0.08];
  }
  function drawCracker(c: Cracker) {
    const { x, y, z } = c;
    if (c.type === "bomb") {
      if (c.state === "live") return;
      sphere(x, y, z + 0.2, 0.21, TWINE, "rough");
      capsule(
        [x, y, z + 0.38],
        [x + 0.08, y - 0.04, z + 0.52],
        0.025,
        0.02,
        () => FUSE_CORD,
        "solid",
      );
    } else if (c.type === "rocket") {
      if (c.state !== "live") {
        capsule([x, y, z], [x, y, z + 0.32], 0.13, 0.09, () => BOTTLE, "solid");
        capsule(
          [x, y, z + 0.32],
          [x, y, z + 0.5],
          0.05,
          0.05,
          () => BOTTLE,
          "solid",
        );
        capsule(
          [x, y, z + 0.2],
          [x, y, z + 1.15],
          0.02,
          0.02,
          () => STICK,
          "solid",
        );
        capsule(
          [x, y, z + 0.82],
          [x, y, z + 1.12],
          0.07,
          0.06,
          () => ROCKET_RED,
          "solid",
        );
      } else if (c.fly) {
        const f = c.fly;
        const d = Math.hypot(f.vx, f.vy, f.vz) || 1;
        capsule(
          [
            f.x - (f.vx / d) * 0.9,
            f.y - (f.vy / d) * 0.9,
            f.z - (f.vz / d) * 0.9,
          ],
          [f.x, f.y, f.z],
          0.02,
          0.02,
          () => STICK,
          "solid",
        );
        capsule(
          [
            f.x - (f.vx / d) * 0.25,
            f.y - (f.vy / d) * 0.25,
            f.z - (f.vz / d) * 0.25,
          ],
          [f.x, f.y, f.z],
          0.07,
          0.06,
          () => ROCKET_RED,
          "solid",
        );
      }
    } else if (c.type === "anaar") {
      capsule(
        [x, y, z],
        [x, y, z + 0.42],
        0.2,
        0.07,
        () => (c.state === "live" ? BURNT : CLAY),
        "solid",
      );
    } else if (c.type === "chakri") {
      const spin = c.state === "live" ? c.t * 40 : 0;
      for (let n = 0; n < 8; n++) {
        const a = spin + (n / 8) * 6.283;
        sphere(
          x + Math.cos(a) * 0.17,
          y + Math.sin(a) * 0.17,
          z + 0.06,
          0.06,
          n % 2 ? CHAKRI_A : CHAKRI_B,
          "solid",
        );
      }
    } else {
      for (let n = c.popped; n < c.n; n++) {
        const px = x + c.dx * n * 0.32;
        const py = y + c.dy * n * 0.32;
        const pz = heightAt(px, py);
        if (pz <= 0 && n > 0) continue;
        capsule(
          [px - c.dy * 0.1, py + c.dx * 0.1, pz + 0.05],
          [px + c.dy * 0.1, py - c.dx * 0.1, pz + 0.05],
          0.045,
          0.045,
          () => LADI,
          "solid",
        );
      }
    }
  }

  /* ---------- round ---------- */
  function newRound() {
    G.queue = shuffle([...BAG]);
    G.left = CRACKERS;
    G.phase = "play";
    G.crackers.length = 0;
    G.parts.length = 0;
    G.smoke.length = 0;
    G.flashes.length = 0;
    for (const k of kids) {
      k.x = k.home.x;
      k.y = k.home.y;
      k.state = "idle";
      k.job = null;
      k.yaw = k.look;
    }
    resetSlab();
    bakeSlab();
  }

  /* ---------- input ---------- */
  // the nearest surface under a canvas pixel: walk down from the slab top until a cell is that tall
  function pickSlab(sx: number, sy: number): Spot | null {
    for (let z = H0; z >= 0.3; z -= 0.05) {
      const g = unproject(sx, sy + z * COS * S);
      const h = heightAt(g.x, g.y);
      if (h > 0 && h >= z - 0.06) return { x: g.x, y: g.y, z: h };
    }
    return null;
  }
  function randomSpot(): Spot | null {
    for (let n = 0; n < 200; n++) {
      const x = X0 + 1 + Math.random() * (SL - 2);
      const y = Y0 + 0.6 + Math.random() * (SD - 1.2);
      const h = heightAt(x, y);
      if (h > 0.6 && kids.every((k) => Math.hypot(k.x - x, k.y - y) > 1))
        return { x, y, z: h };
    }
    return null;
  }
  function press(spot: Spot | null) {
    ensureAudio();
    if (G.phase === "over") {
      if (G.timer > 0.8) newRound();
      return;
    }
    if (!G.left || !spot) return;
    const free = kids.filter((k) => k.state === "idle");
    if (!free.length) return;
    const dist = (k: Kid) => Math.hypot(k.x - spot.x, k.y - spot.y);
    const kid = free.reduce((a, b) => (dist(a) <= dist(b) ? a : b));
    const type = G.queue.shift() ?? "bomb";
    G.left--;
    const a = Math.random() * 6.283;
    const c: Cracker = {
      type,
      ...spot,
      state: "carried",
      t: 0,
      fly: null,
      vx: 0,
      vy: 0,
      sootT: 0,
      dx: Math.cos(a),
      dy: Math.sin(a),
      n: type === "ladi" ? 9 : 0,
      popped: 0,
    };
    G.crackers.push(c);
    // stand a little short of the spot, on the side the child is coming from
    const d = dist(kid) || 1;
    kid.job = c;
    kid.state = "go";
    kid.t = 0;
    kid.goal = onSlab(
      spot.x + ((kid.x - spot.x) / d) * 0.55,
      spot.y + ((kid.y - spot.y) / d) * 0.55,
    ) ?? { x: spot.x, y: spot.y };
  }
  function onPointerDown(e: PointerEvent) {
    canvas.focus({ preventScroll: true });
    const r = canvas.getBoundingClientRect();
    press(
      pickSlab(
        ((e.clientX - r.left) / r.width) * W,
        ((e.clientY - r.top) / r.height) * H,
      ),
    );
  }
  function onKeyDown(e: KeyboardEvent) {
    if ((e.key !== " " && e.key !== "Enter") || e.repeat) return;
    e.preventDefault();
    press(G.phase === "over" ? null : randomSpot());
  }

  /* ---------- simulation ---------- */
  function moveKid(
    k: Kid,
    goal: { x: number; y: number },
    speed: number,
    dt: number,
  ) {
    const dx = goal.x - k.x;
    const dy = goal.y - k.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.06) return true;
    const step = Math.min(d, speed * dt);
    const nx = k.x + (dx / d) * step;
    const ny = k.y + (dy / d) * step;
    k.yaw = Math.atan2(dy, dx);
    // stay on the slab: slide along an edge rather than step off it
    if (heightAt(nx, ny) > 0.3) {
      k.x = nx;
      k.y = ny;
    } else if (heightAt(nx, k.y) > 0.3) k.x = nx;
    else if (heightAt(k.x, ny) > 0.3) k.y = ny;
    else return true;
    k.phase += step * 7.5;
    return false;
  }
  function fleeSpot(k: Kid, c: Cracker) {
    for (let n = 0; n < 16; n++) {
      const a =
        Math.atan2(k.y - c.y, k.x - c.x) +
        (n % 2 ? 1 : -1) * Math.floor((n + 1) / 2) * 0.4;
      for (const r of [2.8, 2.2, 1.7]) {
        const p = onSlab(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r);
        if (
          p &&
          kids.every((o) => o === k || Math.hypot(o.x - p.x, o.y - p.y) > 0.7)
        )
          return p;
      }
    }
    return { x: k.x, y: k.y };
  }
  function updateKids(dt: number) {
    for (const k of kids) {
      k.t += dt;
      const c = k.job;
      if (k.state === "go" && c) {
        if (moveKid(k, k.goal, WALK, dt)) {
          k.state = "light";
          k.t = 0;
          k.yaw = Math.atan2(c.y - k.y, c.x - k.x);
          c.state = "placed";
          c.z = heightAt(c.x, c.y) || c.z;
        }
      } else if (k.state === "light" && c) {
        if (k.t > 0.75) {
          c.state = "fuse";
          c.t = 0;
          sound("fuse");
          k.state = "flee";
          k.t = 0;
          k.goal = fleeSpot(k, c);
        }
      } else if (k.state === "flee" && c) {
        if (moveKid(k, k.goal, RUN, dt)) {
          k.state = "ears";
          k.t = 0;
          k.yaw = Math.atan2(c.y - k.y, c.x - k.x);
        }
      } else if (k.state === "ears" && c) {
        if (c.state === "done") {
          k.state = "cheer";
          k.t = 0;
        }
      } else if (k.state === "cheer" && k.t > 0.9) {
        k.state = "idle";
        k.job = null;
      }
      k.z = Math.max(0, heightAt(k.x, k.y));
    }
  }
  function spark(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    life: number,
    col: number,
    kind: PartKind = "spark",
  ) {
    G.parts.push({ x, y, z, vx, vy, vz, life, col, kind });
  }
  const sparkCol = () => SPARK_COLS[(Math.random() * 3) | 0];
  function puff(x: number, y: number, z: number, r: number, life = 1.6) {
    G.smoke.push({
      x,
      y,
      z,
      r,
      life,
      max: life,
      drift: (Math.random() - 0.5) * 0.4,
    });
  }
  function flash(x: number, y: number, z: number, r: number) {
    G.flashes.push({ x, y, z, r, t: 0 });
  }
  function explodeBomb(c: Cracker) {
    flash(c.x, c.y, c.z + 0.3, 1.5);
    addCrater(c.x, c.y, 1.4, 1.2);
    addSoot(c.x, c.y, 2.6, 1);
    addDirt(c.x, c.y, 2.4, 3, 0.3);
    addDirt(c.x, c.y, 1.4, 1, 0.25);
    for (let n = 0; n < 34; n++) {
      const a = Math.random() * 6.283;
      const v = 2 + Math.random() * 4;
      const col =
        n % 3 === 0 ? CREAM_T[2] : n % 3 === 1 ? BLACK_T[3] : CORE_T[2];
      spark(
        c.x,
        c.y,
        c.z + 0.2,
        Math.cos(a) * v,
        Math.sin(a) * v,
        3 + Math.random() * 4,
        2.2,
        col,
        "chunk",
      );
    }
    for (let n = 0; n < 7; n++)
      puff(
        c.x + (Math.random() - 0.5) * 1.2,
        c.y + (Math.random() - 0.5) * 1.2,
        c.z + 0.3 + Math.random() * 0.8,
        0.5 + Math.random() * 0.4,
        1.8 + Math.random(),
      );
    sound("boom");
  }
  function ignite(c: Cracker) {
    if (c.type === "bomb") explodeBomb(c);
    else if (c.type === "rocket") {
      // one in four tips over and skids across the logo instead of climbing
      const a = Math.random() * 6.283;
      const skid = Math.random() < 0.25;
      const v = skid ? 6 : 0.7;
      c.fly = {
        x: c.x,
        y: c.y,
        z: c.z + 1,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        vz: skid ? 0.6 : 7,
        skid,
      };
      addSoot(c.x, c.y, 0.5, 0.8);
      G.debris.push({ type: "bottle", x: c.x, y: c.y, z: c.z });
      sound("whistle");
    } else if (c.type === "anaar") sound("hiss");
    else if (c.type === "chakri") sound("whirr");
  }
  function updateRocket(c: Cracker, dt: number) {
    const f = c.fly;
    if (!f) {
      if (c.t > 1.6) c.state = "done";
      return;
    }
    if (f.skid) {
      f.vz -= 2 * dt;
      f.z = Math.max(heightAt(f.x, f.y) + 0.25, f.z + f.vz * dt);
    } else {
      f.vz += 4 * dt;
      f.z += f.vz * dt;
    }
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    for (let n = 0; n < 3; n++)
      spark(
        f.x,
        f.y,
        f.z - 0.2,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        -1 - Math.random(),
        0.35,
        SPARK_COLS[1 + ((Math.random() * 2) | 0)],
      );
    if (Math.random() < dt * 14) puff(f.x, f.y, f.z - 0.3, 0.16, 0.8);
    if (f.skid && heightAt(f.x, f.y) > 0) addSoot(f.x, f.y, 0.32, 0.4);
    if (c.t > (f.skid ? 0.9 : 1.15)) {
      const cols = STAR_COLS[(Math.random() * STAR_COLS.length) | 0];
      for (let n = 0; n < 70; n++) {
        const u = Math.random() * 2 - 1;
        const a = Math.random() * 6.283;
        const s = (f.skid ? 2.4 : 3.6) * (0.7 + Math.random() * 0.3);
        const q = Math.sqrt(1 - u * u);
        spark(
          f.x,
          f.y,
          f.z,
          Math.cos(a) * q * s,
          Math.sin(a) * q * s,
          u * s + 1,
          1.3 + Math.random() * 0.5,
          cols[n % 2],
          "star",
        );
      }
      flash(f.x, f.y, f.z, 0.7);
      sound("crackle");
      c.fly = null;
      c.t = 0;
    }
  }
  function updateCracker(c: Cracker, dt: number) {
    c.t += dt;
    if (c.state === "fuse") {
      const tip = fuseTip(c);
      spark(
        tip[0],
        tip[1],
        tip[2],
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        1 + Math.random() * 1.5,
        0.25,
        sparkCol(),
      );
      if (c.t >= FUSE[c.type]) {
        c.state = "live";
        c.t = 0;
        ignite(c);
      }
      return;
    }
    if (c.state !== "live") return;
    if (c.type === "bomb") {
      if (c.t > 1.4) c.state = "done";
    } else if (c.type === "rocket") updateRocket(c, dt);
    else if (c.type === "anaar") {
      for (let n = 0; n < 5; n++) {
        const a = Math.random() * 6.283;
        const s = Math.random() * 1.5;
        spark(
          c.x,
          c.y,
          c.z + 0.46,
          Math.cos(a) * s,
          Math.sin(a) * s,
          5 + Math.random() * 3.5,
          0.9 + Math.random() * 0.5,
          sparkCol(),
          "ember",
        );
      }
      if (Math.random() < dt * 4)
        puff(c.x, c.y, c.z + 1.6 + Math.random(), 0.45, 1.6);
      if (c.t > 2.8) {
        addSoot(c.x, c.y, 0.7, 0.9);
        G.debris.push({ type: "cone", x: c.x, y: c.y, z: c.z });
        c.state = "done";
      }
    } else if (c.type === "chakri") {
      // it spins and skids, scorching a trail
      c.vx += (Math.random() - 0.5) * 6 * dt;
      c.vy += (Math.random() - 0.5) * 6 * dt;
      const sp = Math.hypot(c.vx, c.vy);
      if (sp > 1.2) {
        c.vx *= 1.2 / sp;
        c.vy *= 1.2 / sp;
      }
      const nx = c.x + c.vx * dt;
      const ny = c.y + c.vy * dt;
      if (heightAt(nx, ny) > 0.3) {
        c.x = nx;
        c.y = ny;
        c.z = heightAt(nx, ny);
      } else {
        c.vx *= -1;
        c.vy *= -1;
      }
      c.sootT += dt;
      if (c.sootT > 0.08) {
        addSoot(c.x, c.y, 0.42, 0.35);
        c.sootT = 0;
      }
      for (let n = 0; n < 4; n++) {
        const a = c.t * 40 + n * 1.57;
        spark(
          c.x + Math.cos(a) * 0.2,
          c.y + Math.sin(a) * 0.2,
          c.z + 0.08,
          -Math.sin(a) * 3.2,
          Math.cos(a) * 3.2,
          0.6 + Math.random() * 0.8,
          0.35,
          SPARK_COLS[n % 3],
        );
      }
      if (c.t > 2.6) {
        G.debris.push({ type: "coil", x: c.x, y: c.y, z: c.z });
        c.state = "done";
      }
    } else {
      while (c.popped < c.n && c.t > c.popped * 0.11) {
        const px = c.x + c.dx * c.popped * 0.32;
        const py = c.y + c.dy * c.popped * 0.32;
        const pz = heightAt(px, py);
        c.popped++;
        if (pz <= 0) continue;
        flash(px, py, pz + 0.1, 0.35);
        addSoot(px, py, 0.45, 0.6);
        addCrater(px, py, 0.28, 0.16);
        addDirt(px, py, 0.9, 1, 0.5);
        addDirt(px, py, 0.6, 2, 0.2);
        for (let n = 0; n < 5; n++) {
          const a = Math.random() * 6.283;
          spark(
            px,
            py,
            pz + 0.1,
            Math.cos(a) * 1.6,
            Math.sin(a) * 1.6,
            2 + Math.random() * 2,
            0.8,
            PAPER_C[1],
            "chunk",
          );
        }
        puff(px, py, pz + 0.4, 0.3, 1.1);
        sound("pop");
      }
      if (c.popped >= c.n && c.t > c.n * 0.11 + 0.6) c.state = "done";
    }
  }
  function landed(p: Part) {
    const h = heightAt(p.x, p.y);
    if (h <= 0) return;
    if (p.kind === "star") addSoot(p.x, p.y, 0.18, 0.25);
    else if (p.kind === "ember") {
      if (Math.random() < 0.3) addSoot(p.x, p.y, 0.3, 0.12);
    } else if (p.kind === "chunk" && Math.random() < 0.5)
      addDirt(p.x, p.y, 0.15, p.col === PAPER_C[1] ? 1 : 3, 1);
  }
  function update(dt: number) {
    G.time += dt;
    updateKids(dt);
    for (const c of G.crackers) updateCracker(c, dt);
    G.crackers = G.crackers.filter(
      (c) =>
        c.state !== "done" ||
        kids.some((k) => k.job === c && k.state === "ears"),
    );
    for (const p of G.parts) {
      const drag = p.kind === "star" ? 0.985 : 1;
      p.vx *= drag;
      p.vy *= drag;
      p.vz -= (p.kind === "star" ? 3.2 : 9) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt;
      const floor = heightAt(p.x, p.y);
      if (p.z <= floor && p.vz < 0) {
        if (p.kind === "chunk" && p.vz < -2) {
          p.z = floor;
          p.vz *= -0.3;
          p.vx *= 0.5;
          p.vy *= 0.5;
        } else {
          landed(p);
          p.life = 0;
        }
      }
    }
    G.parts = G.parts.filter((p) => p.life > 0);
    for (const s of G.smoke) {
      s.life -= dt;
      s.z += dt * 0.7;
      s.x += s.drift * dt;
      s.r += dt * 0.25;
    }
    G.smoke = G.smoke.filter((s) => s.life > 0);
    for (const f of G.flashes) f.t += dt;
    G.flashes = G.flashes.filter((f) => f.t < 0.22);
    if (G.dirty && G.time - G.bakedAt > 0.1) bakeSlab();
    if (
      G.phase === "play" &&
      !G.left &&
      !G.crackers.length &&
      kids.every((k) => k.state === "idle")
    ) {
      G.phase = "over";
      G.timer = 0;
    }
    if (G.phase === "over") G.timer += dt;
  }

  /* ---------- drawing ---------- */
  function plotLight(x: number, y: number, z: number, col: number, size = 1) {
    const p = project(x, y, z);
    const ix = p.sx | 0;
    const iy = p.sy | 0;
    for (let oy = 0; oy < size; oy++)
      for (let ox = 0; ox < size; ox++) {
        const jx = ix + ox;
        const jy = iy + oy;
        if (jx < 0 || jy < 0 || jx >= W || jy >= H) continue;
        const i = jy * W + jx;
        if (p.d + 0.3 < zb[i]) continue;
        pix[i] = col;
      }
  }
  const smokeRamp = rampOf(SMOKE);
  function drawSmoke() {
    for (const s of G.smoke) {
      const p = project(s.x, s.y, s.z);
      const rp = s.r * S;
      const k = s.life / s.max;
      for (
        let iy = Math.max(0, (p.sy - rp) | 0);
        iy <= Math.min(H - 1, p.sy + rp);
        iy++
      )
        for (
          let ix = Math.max(0, (p.sx - rp) | 0);
          ix <= Math.min(W - 1, p.sx + rp);
          ix++
        ) {
          const dx = (ix + 0.5 - p.sx) / rp;
          const dy = (iy + 0.5 - p.sy) / rp;
          const nn = dx * dx + dy * dy;
          if (nn > 1) continue;
          const i = iy * W + ix;
          if (p.d + s.r < zb[i]) continue;
          if (bayerAt(ix, iy) > k * 0.85 * (1 - nn * 0.5)) continue;
          pix[i] =
            smokeRamp[
              clamp(Math.floor((-0.5 * dx - 0.6 * dy + 0.6) * 2.2 + 1.6), 1, 4)
            ];
        }
    }
  }
  function drawFlashes() {
    for (const f of G.flashes) {
      const p = project(f.x, f.y, f.z);
      const rp = f.r * S * (1 + f.t * 3);
      const hot = f.t < 0.08;
      const inner = hot ? rgb(255, 255, 240) : rgb(255, 214, 10);
      const outer = hot ? rgb(255, 214, 10) : rgb(255, 150, 40);
      for (
        let iy = Math.max(0, (p.sy - rp) | 0);
        iy <= Math.min(H - 1, p.sy + rp);
        iy++
      )
        for (
          let ix = Math.max(0, (p.sx - rp) | 0);
          ix <= Math.min(W - 1, p.sx + rp);
          ix++
        ) {
          const dx = (ix + 0.5 - p.sx) / rp;
          const dy = (iy + 0.5 - p.sy) / rp;
          const nn = dx * dx + dy * dy;
          if (nn > 1 || bayerAt(ix, iy) < nn * 0.9) continue;
          pix[iy * W + ix] = nn < 0.35 ? inner : outer;
        }
    }
  }
  function drawParts() {
    for (const p of G.parts) {
      if (
        p.kind === "star" &&
        p.life < 0.4 &&
        Math.floor(G.time * 20 + p.x * 9) & 1
      )
        continue; // twinkle out
      plotLight(p.x, p.y, p.z, p.col, p.kind === "chunk" ? 2 : 1);
      if (p.kind === "spark" || p.kind === "star")
        plotLight(
          p.x - p.vx * 0.025,
          p.y - p.vy * 0.025,
          p.z - p.vz * 0.025,
          p.col,
        );
    }
  }
  function drawFlames(t: number) {
    const flick = Math.floor(t * 8);
    for (const d of DIYAS) {
      plotLight(d.x, d.y, 0.24, rgb(255, 170, 40));
      plotLight(
        d.x,
        d.y,
        0.34,
        hash(flick, d.x) > 0.4 ? rgb(255, 230, 120) : rgb(255, 200, 60),
      );
      if (hash(flick + 3, d.y) > 0.5)
        plotLight(d.x, d.y, 0.44, rgb(255, 250, 220));
    }
  }
  function flushKidShadows() {
    for (const [a, ra, c] of G.bones) {
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]) / 0.25),
      );
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        castAt(
          lerp(a[0], c[0], t),
          lerp(a[1], c[1], t),
          lerp(a[2], c[2], t),
          ra * 0.9,
        );
      }
      const floor = heightAt(a[0], a[1]);
      if (a[2] - floor < 0.2) castAt(a[0], a[1], floor, 0.18, 2);
    }
  }
  function draw() {
    pix.set(E.bakedPix);
    zb.set(E.bakedZ);
    G.bones.length = 0;
    for (const c of G.crackers) if (c.state !== "carried") drawCracker(c);
    for (const k of kids) drawKid(k);
    const windT = E.still ? 0 : Math.floor(G.time * WIND_FPS) / WIND_FPS;
    E.drawLeaves(windT);
    E.drawTufts(windT);
    flushKidShadows();
    E.applyShadows(E.bakedZ);
    applyTopShadows(E.bakedZ);
    E.shadeEdges();
    drawFlames(windT);
    drawSmoke();
    for (const k of kids) {
      const tip = k.sparkTip;
      if (tip && !E.still)
        for (let n = 0; n < 3; n++) {
          const a = Math.random() * 6.283;
          const r = Math.random() * 0.35;
          plotLight(
            tip[0] + Math.cos(a) * r,
            tip[1] + Math.sin(a) * r,
            tip[2] + (Math.random() - 0.5) * 0.3,
            SPARK_COLS[n],
          );
        }
      if (tip) plotLight(tip[0], tip[1], tip[2], rgb(255, 255, 240));
      if (k.incense)
        plotLight(
          k.incense[0],
          k.incense[1],
          k.incense[2],
          Math.floor(G.time * 6) % 2 ? rgb(255, 120, 40) : rgb(255, 200, 80),
        );
    }
    drawParts();
    drawFlashes();
    for (const k of kids)
      if (k.state === "go" && k.job) {
        const t = project(k.job.x, k.job.y, k.job.z + 1.6);
        E.drawArrow(t.sx, t.sy, G.time);
      }
    E.present();
  }

  /* ---------- sound ---------- */
  let audio: AudioContext | null = null;
  let noiseBuf: AudioBuffer | null = null;
  function ensureAudio() {
    if (!soundOn) return;
    if (audio) {
      if (audio.state === "suspended") void audio.resume();
      return;
    }
    if (typeof AudioContext === "undefined") return;
    audio = new AudioContext();
    noiseBuf = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  }
  function hissAt(
    ac: AudioContext,
    buf: AudioBuffer,
    at: number,
    dur: number,
    type: BiquadFilterType,
    f0: number,
    f1: number,
    q: number,
    gain: number,
  ) {
    const src = ac.createBufferSource();
    const filt = ac.createBiquadFilter();
    const g = ac.createGain();
    src.buffer = buf;
    filt.type = type;
    filt.Q.value = q;
    filt.frequency.setValueAtTime(f0, at);
    filt.frequency.exponentialRampToValueAtTime(f1, at + dur);
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0005, at + dur);
    src.connect(filt).connect(g).connect(ac.destination);
    src.start(at, Math.random());
    src.stop(at + dur + 0.02);
  }
  function tone(
    ac: AudioContext,
    at: number,
    dur: number,
    type: OscillatorType,
    f0: number,
    f1: number,
    gain: number,
  ) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(f1, at + dur);
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0005, at + dur);
    o.connect(g).connect(ac.destination);
    o.start(at);
    o.stop(at + dur + 0.02);
  }
  function sound(kind: SoundKind) {
    const ac = audio;
    const buf = noiseBuf;
    if (!ac || !buf) return;
    const t = ac.currentTime;
    if (kind === "boom") {
      hissAt(ac, buf, t, 0.7, "lowpass", 1400, 60, 0.7, 0.55);
      tone(ac, t, 0.35, "sine", 90, 38, 0.5);
    } else if (kind === "pop")
      hissAt(ac, buf, t, 0.07, "bandpass", 2400, 900, 1.2, 0.25);
    else if (kind === "fuse")
      hissAt(ac, buf, t, 0.5, "highpass", 5000, 7000, 0.5, 0.04);
    else if (kind === "whistle") {
      tone(ac, t, 1.1, "triangle", 700, 2600, 0.05);
      hissAt(ac, buf, t, 1.1, "bandpass", 3000, 3000, 2, 0.06);
    } else if (kind === "crackle") {
      for (let n = 0; n < 12; n++)
        hissAt(
          ac,
          buf,
          t + n * 0.05 + Math.random() * 0.04,
          0.05,
          "bandpass",
          3000,
          1500,
          1,
          0.12,
        );
    } else if (kind === "hiss")
      hissAt(ac, buf, t, 2.8, "bandpass", 3500, 2200, 0.8, 0.07);
    else {
      hissAt(ac, buf, t, 2.6, "bandpass", 4200, 2600, 3, 0.06);
      tone(ac, t, 2.6, "sawtooth", 220, 140, 0.012);
    }
  }

  /* ---------- loop ---------- */
  buildMask();
  bakeGround();
  newRound();
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("keydown", onKeyDown);
  let raf = 0;
  let last = 0;
  function frame(now: number) {
    update(Math.min(0.04, (now - last) / 1000));
    last = now;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function resume() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  draw();
  resume();

  return {
    pause,
    resume,
    destroy() {
      pause();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("keydown", onKeyDown);
      void audio?.close();
      audio = null;
    },
  };
}
