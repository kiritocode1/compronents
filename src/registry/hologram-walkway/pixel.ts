// Pure helpers shared by the scene renderer and the hologram baker (which also runs in workers).

export type Vec3 = [number, number, number];
export type Color = [number, number, number];

/** The fixed view: canvas size, pixels per world unit, and where the world origin sits on the canvas. */
export const VIEW: { W: number; H: number; S: number; OX: number; OY: number } =
  { W: 960, H: 540, S: 26, OX: 450, OY: 325 };
export const SIN = 0.5;
export const COS = Math.sqrt(3) / 2;
export const R2 = Math.SQRT2;

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t * t * (3 - 2 * t);
/** Packs a colour as little-endian RGBA for a Uint32Array view of ImageData. */
export const rgb = (r: number, g: number, b: number) =>
  ((255 << 24) |
    (Math.min(255, b | 0) << 16) |
    (Math.min(255, g | 0) << 8) |
    Math.min(255, r | 0)) >>>
  0;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);
export const bayerAt = (ix: number, iy: number) =>
  BAYER[(iy & 3) * 4 + (ix & 3)];
export const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const noise = (x: number, y: number) => {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = ease(x - ix),
    fy = ease(y - iy);
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), fx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx),
    fy,
  );
};

export const add3 = (a: Vec3, b: Vec3, k = 1): Vec3 => [
  a[0] + b[0] * k,
  a[1] + b[1] * k,
  a[2] + b[2] * k,
];
export const sub3 = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
export const norm3 = (v: Vec3): Vec3 => {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
};
export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const dot3 = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
