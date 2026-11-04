import {
  DRIFT_PERIOD_MAX,
  DRIFT_PERIOD_MIN,
  LIGHT_ATTACK,
  LIGHT_DECAY,
} from "./tokens";

/**
 * The field's motion model, once in TypeScript for the overlay and the
 * snapshots, and once in GLSL (shaders.ts) for the points. Every constant here
 * has a twin there; change both or the trackers drift off their points.
 */

export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

const frac = (v: number) => v - Math.floor(v);
const TAU = Math.PI * 2;

/** Three unrelated 0..1 values from one point's seed. */
export function seeds(seed: number): [number, number, number] {
  return [
    frac(seed * 91.7 + 0.13),
    frac(seed * 47.3 + 0.71),
    frac(seed * 23.9 + 0.37),
  ];
}

/** Scale applied to the plate so it fits the frame. */
export const FIT = 0.655;

// ---------------------------------------------------------------- flight

/** Whole flight, from the Gather slider (0 slow, 100 fast). */
export function flightSeconds(gather: number) {
  return 0.7 + (1 - gather / 100) * 3.6;
}

/** Share of the flight the points hang before they start home. */
export function hangFor(gather: number) {
  return (1 - gather / 100) * 0.2;
}

/** How sharply the throw opens, from the Splash slider. */
export function sharpFor(splash: number) {
  return 1.5 + (splash / 100) * 10;
}

function cubicInOut(u: number) {
  return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
}

/**
 * How far one point has travelled from its old home (0) to its new one (1)
 * at flight progress p. Swarm starts points in seed order, melt starts the
 * near layers first.
 */
export function flightEase(
  p: number,
  s0: number,
  z: number,
  swarm: boolean,
  hang: number,
) {
  if (p >= 1) return 1;
  const order = swarm ? s0 : smoothstep(-0.45, 0.45, -z) * 0.75 + s0 * 0.25;
  const width = swarm ? 0.45 : 0.55;
  const start = hang + order * (1 - width - hang);
  return cubicInOut(clamp((p - start) / width, 0, 1));
}

/** Outward throw for one point. Opens on a cubic, gone once it lands. */
export function throwAmount(p: number, e: number, sharp: number, s1: number) {
  if (p >= 1) return 0;
  const open = 1 - (1 - Math.min(1, (p * sharp) / 4)) ** 3;
  return open * (1 - e) * (0.08 + 0.52 * s1);
}

/**
 * Direction a point is thrown: away from the plate's centre, tipped toward
 * the viewer, turned a little by its seed.
 */
export function throwDir(x: number, y: number, s0: number) {
  const a = Math.atan2(y, x) + (s0 - 0.5) * 1.2;
  const len = Math.hypot(Math.cos(a), Math.sin(a), 0.6);
  return [Math.cos(a) / len, Math.sin(a) / len, 0.6 / len] as const;
}

// ---------------------------------------------------------------- drift

export type DriftOpts = {
  drift: number; // 0..1
  angle: number; // radians, the direction the line runs
  offset: number;
  side: number; // 1 or -1, which side lifts
};

/**
 * One point's drift. Past the line a point spends part of each cycle on the
 * wind; the deeper in, the larger that part. It speeds up as it leaves, thins
 * out, and forms again at home.
 */
export function driftAt(
  px: number,
  py: number,
  time: number,
  s: readonly [number, number, number],
  o: DriftOpts,
) {
  const nx = -Math.sin(o.angle);
  const ny = Math.cos(o.angle);
  const wx = nx * o.side;
  const wy = ny * o.side;
  if (o.drift <= 0.003)
    return { dx: 0, dy: 0, dz: 0, alpha: 1, away: 0, wx, wy };
  const along = -px * ny + py * nx;
  const edge =
    0.12 * Math.sin(along * 2.2 + 0.7 * Math.sin(along * 5 + 1) + time * 0.2) +
    (s[2] - 0.5) * 0.2;
  const past = (px * nx + py * ny - o.offset) * o.side + edge;
  const depthIn = clamp(past / 0.8, 0, 1);
  const exposure = depthIn * depthIn * (3 - 2 * depthIn);
  const period =
    DRIFT_PERIOD_MIN + (DRIFT_PERIOD_MAX - DRIFT_PERIOD_MIN) * s[1];
  const cyc = frac(time / period + s[2]);
  const windowShare = 0.15 + 0.72 * exposure;
  const u = clamp((cyc - (1 - windowShare)) / windowShare, 0, 1);
  const dist = o.drift * exposure * (0.5 + s[0]) * 1.5 * u * Math.sqrt(u);
  const dx =
    wx * dist + Math.sin(py * 2.9 + time * 0.5 + s[1] * TAU) * dist * 0.22;
  const dy =
    wy * dist + Math.cos(px * 3.1 - time * 0.4 + s[2] * TAU) * dist * 0.22;
  const dz = (s[0] - 0.5) * dist * 0.5;
  const thin = 1 - smoothstep(0.25, 1, u);
  const form = exposure > 0.05 ? smoothstep(0, 0.04, cyc) : 1;
  return { dx, dy, dz, alpha: thin * form, away: u * exposure, wx, wy };
}

// ---------------------------------------------------------------- breath and sway

/** One slow breath, -1..1. */
export function breathAt(time: number) {
  return Math.sin((time * TAU) / 7);
}

/** The camera's idle sway, added to the user's yaw and pitch. */
export function swayAt(time: number) {
  return {
    yaw: 0.1 * Math.sin(time * 0.17),
    pitch: 0.035 * Math.sin(time * 0.13 + 0.6),
  };
}

// ---------------------------------------------------------------- lamps

/**
 * Lamp flash. Full brightness by LIGHT_ATTACK, then nearly gone at LIGHT_DECAY.
 */
export function lightEnvelope(age: number) {
  if (age < 0) return 0;
  const attack = Math.min(1, age / LIGHT_ATTACK);
  const fall = Math.exp(-3 * (age / LIGHT_DECAY));
  return attack * fall;
}

// ---------------------------------------------------------------- placement

export type View = {
  yaw: number;
  pitch: number;
  zoom: number;
  pushX: number;
  pushY: number;
  aspect: number;
};

export type Flight = {
  p: number; // 0..1, 1 when settled
  swarm: boolean;
  hang: number;
  sharp: number;
};

/**
 * One point in world space after the flight, the breath and the drift.
 * POINT_VERT repeats this so the overlay lands on the drawn points.
 */
export function placePoint(
  home: readonly [number, number, number],
  dest: readonly [number, number, number],
  seed: number,
  flight: Flight,
  time: number,
  drift: DriftOpts,
  depth: number,
) {
  const s = seeds(seed);
  const lead = (home[2] + dest[2]) * 0.5;
  const e = flightEase(flight.p, s[0], lead, flight.swarm, flight.hang);
  let x = home[0] + (dest[0] - home[0]) * e;
  let y = home[1] + (dest[1] - home[1]) * e;
  let z = home[2] + (dest[2] - home[2]) * e;

  const thrown = throwAmount(flight.p, e, flight.sharp, s[1]);
  if (thrown > 0) {
    const [tx, ty, tz] = throwDir(x, y, s[0]);
    x += tx * thrown;
    y += ty * thrown;
    z += tz * thrown;
  }

  const b = breathAt(time);
  x *= 1 + 0.008 * b;
  y *= 1 + 0.008 * b;
  z = z * (0.1 + depth * 1.3) * (1 + 0.05 * b);

  const d = driftAt(x, y, time, s, drift);
  return {
    x: (x + d.dx) * FIT,
    y: (y + d.dy) * FIT,
    z: (z + d.dz) * FIT,
    alpha: d.alpha,
    away: d.away,
  };
}

/** NDC from a world point. Positive z is toward the viewer. */
export function project(x: number, y: number, z: number, view: View) {
  const cy = Math.cos(view.yaw);
  const sy = Math.sin(view.yaw);
  const cx = Math.cos(view.pitch);
  const sx = Math.sin(view.pitch);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  const persp = 1 / (2.35 - z2);
  const aspect = view.aspect > 0 ? view.aspect : 1;
  return {
    ndcX: (x1 / aspect) * view.zoom * persp * 1.65 + view.pushX,
    ndcY: y2 * view.zoom * persp * 1.65 + view.pushY,
    persp,
  };
}

export function ndcToCss(
  ndcX: number,
  ndcY: number,
  width: number,
  height: number,
) {
  return {
    sx: (ndcX * 0.5 + 0.5) * width,
    sy: (0.5 - ndcY * 0.5) * height,
  };
}

export function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 0.91, 0.77];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
