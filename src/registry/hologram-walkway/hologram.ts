// The giant hologram as a smooth distance model, ray-marched into a cropped frame. Pure: it runs in
// workers, and every frame of her motion is one call to `bakeHologram` with a different `HoloPose`.

import {
  add3,
  bayerAt,
  COS,
  type Color,
  clamp,
  cross3,
  dot3,
  ease,
  hash,
  lerp,
  lerp3,
  noise,
  norm3,
  R2,
  rgb,
  SIN,
  sub3,
  type Vec3,
  VIEW,
} from "./pixel";

export interface HoloPose {
  /** 1: standing with her back to us, arms down. 0: crouched on her heels, facing him. */
  stand: number;
  /** 0: her right hand at her cheek. 1: pointing down at him. Only meaningful while crouched. */
  point: number;
  /** Idle motion phase in radians: sway at the hips, breath, head roll, her free hand on her thigh. */
  sway: number;
  /** How much idle motion, 0 to 1. */
  amp: number;
}

/** One baked frame: her colour, depth, opacity and surface kind inside a box, plus her glow inside a wider box. */
export interface HoloFrame {
  x0: number;
  y0: number;
  w: number;
  h: number;
  c: Uint32Array;
  z: Float32Array;
  a: Float32Array;
  kind: Uint8Array;
  gx0: number;
  gy0: number;
  gw: number;
  gh: number;
  warm: Float32Array;
  cool: Float32Array;
}

const { W, H, S, OX, OY } = VIEW;
const project = (x: number, y: number, z: number) => {
  const u = (x - y) / R2,
    v = (x + y) / R2;
  return {
    sx: OX + u * S,
    sy: OY + (v * SIN - z * COS) * S,
    d: v * COS + z * SIN,
  };
};

const SKIN7: Color[] = [
  [70, 14, 74],
  [124, 30, 114],
  [178, 58, 158],
  [222, 98, 192],
  [244, 146, 216],
  [255, 196, 236],
  [255, 232, 249],
];
const HAIR7: Color[] = [
  [9, 13, 48],
  [15, 24, 86],
  [22, 43, 140],
  [28, 68, 197],
  [48, 104, 235],
  [92, 145, 250],
  [156, 191, 255],
];
const LIPS7: Color[] = [
  [86, 6, 46],
  [136, 14, 70],
  [186, 30, 96],
  [222, 60, 124],
  [244, 110, 160],
  [252, 168, 200],
  [255, 214, 230],
];
const RIM_CYAN: Color = [150, 236, 255];

/* ---------- placement ---------- */
const U = 3.4; // world units per model unit
const PALM_AT: Vec3 = [2.6, 0.95, 4.65]; // her pointing hand, above the spot he stops on
const PALM_LOCAL: Vec3 = [3.23, -1.64, 2.51];
const TO_VIEW = [Math.SQRT1_2, Math.SQRT1_2],
  TO_RIGHT = [Math.SQRT1_2, -Math.SQRT1_2];
/** Her frame on the walkway: forward f, side s, origin x, y, z, and R, the side of her that faces him. */
export const GIANT = (() => {
  const fx0 = TO_VIEW[0] * 0.7 + TO_RIGHT[0] * 0.71,
    fy0 = TO_VIEW[1] * 0.7 + TO_RIGHT[1] * 0.71,
    d = Math.hypot(fx0, fy0);
  const f = [fx0 / d, fy0 / d],
    s = [-f[1], f[0]];
  const R = Math.sign(s[0] * TO_RIGHT[0] + s[1] * TO_RIGHT[1]);
  const [pa, pb, pc] = PALM_LOCAL;
  return {
    f,
    s,
    R,
    x: PALM_AT[0] - (f[0] * pa + s[0] * pb) * U,
    y: PALM_AT[1] - (f[1] * pa + s[1] * pb) * U,
    z: PALM_AT[2] - pc * U,
  };
})();
// the turn that puts her back to the viewer
const YAW_BACK = Math.atan2(
  -(TO_VIEW[0] * GIANT.s[0] + TO_VIEW[1] * GIANT.s[1]),
  -(TO_VIEW[0] * GIANT.f[0] + TO_VIEW[1] * GIANT.f[1]),
);

/* ---------- distance primitives ---------- */
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
const ADD = 0,
  SUB = 1;
interface Ellipsoid {
  t: 0;
  cx: number;
  cy: number;
  cz: number;
  ax: Vec3;
  ay: Vec3;
  az: Vec3;
  rx: number;
  ry: number;
  rz: number;
  k: number;
  op: number;
  tag: number;
}
interface Capsule {
  t: 1;
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  bb: number;
  ra: number;
  rb: number;
  k: number;
  op: number;
  tag: number;
}
type Prim = Ellipsoid | Capsule;
interface Group {
  cx: number;
  cy: number;
  cz: number;
  r: number;
  prims: Prim[];
}
type Axes = [Vec3, Vec3, Vec3];
const IDENTITY: Axes = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const E = (
  c: Vec3,
  r: Vec3,
  k = 0.1,
  axes = IDENTITY,
  op = ADD,
  tag = 0,
): Ellipsoid => ({
  t: 0,
  cx: c[0],
  cy: c[1],
  cz: c[2],
  ax: axes[0],
  ay: axes[1],
  az: axes[2],
  rx: r[0],
  ry: r[1],
  rz: r[2],
  k,
  op,
  tag,
});
const C = (a: Vec3, b: Vec3, ra: number, rb: number, k = 0.1): Capsule => {
  const bx = b[0] - a[0],
    by = b[1] - a[1],
    bz = b[2] - a[2];
  return {
    t: 1,
    ax: a[0],
    ay: a[1],
    az: a[2],
    bx,
    by,
    bz,
    bb: bx * bx + by * by + bz * bz,
    ra,
    rb,
    k,
    op: ADD,
    tag: 0,
  };
};
const prim = (p: Prim, x: number, y: number, z: number) => {
  if (p.t === 0) {
    const dx = x - p.cx,
      dy = y - p.cy,
      dz = z - p.cz;
    const qx = dx * p.ax[0] + dy * p.ax[1] + dz * p.ax[2],
      qy = dx * p.ay[0] + dy * p.ay[1] + dz * p.ay[2],
      qz = dx * p.az[0] + dy * p.az[1] + dz * p.az[2];
    const k0 = Math.sqrt(
      (qx / p.rx) ** 2 + (qy / p.ry) ** 2 + (qz / p.rz) ** 2,
    );
    const k1 = Math.sqrt(
      (qx / (p.rx * p.rx)) ** 2 +
        (qy / (p.ry * p.ry)) ** 2 +
        (qz / (p.rz * p.rz)) ** 2,
    );
    return k1 < 1e-9 ? -Math.min(p.rx, p.ry, p.rz) : (k0 * (k0 - 1)) / k1;
  }
  const px = x - p.ax,
    py = y - p.ay,
    pz = z - p.az;
  const t = clamp((px * p.bx + py * p.by + pz * p.bz) / p.bb, 0, 1);
  return (
    Math.hypot(px - p.bx * t, py - p.by * t, pz - p.bz * t) -
    (p.ra + (p.rb - p.ra) * t)
  );
};
// bounding sphere from the primitives' extents, so far groups are skipped
const group = (prims: Prim[]): Group => {
  const lo = [1e9, 1e9, 1e9],
    hi = [-1e9, -1e9, -1e9];
  for (const p of prims) {
    const pts: Vec3[] =
      p.t === 0
        ? [[p.cx, p.cy, p.cz]]
        : [
            [p.ax, p.ay, p.az],
            [p.ax + p.bx, p.ay + p.by, p.az + p.bz],
          ];
    const r = p.t === 0 ? Math.max(p.rx, p.ry, p.rz) : Math.max(p.ra, p.rb);
    for (const q of pts)
      for (let j = 0; j < 3; j++) {
        lo[j] = Math.min(lo[j], q[j] - r);
        hi[j] = Math.max(hi[j], q[j] + r);
      }
  }
  const c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  return {
    cx: c[0],
    cy: c[1],
    cz: c[2],
    r: Math.hypot(hi[0] - c[0], hi[1] - c[1], hi[2] - c[2]),
    prims,
  };
};
const evalGroups = (groups: Group[], x: number, y: number, z: number) => {
  let d = 1e9,
    bound = 1e9;
  for (const g of groups) {
    const lb = Math.hypot(x - g.cx, y - g.cy, z - g.cz) - g.r;
    if (lb > d + 0.3) {
      if (lb < bound) bound = lb;
      continue;
    }
    for (const p of g.prims) {
      const v = prim(p, x, y, z);
      if (p.op === SUB) d = smax(d, -v, p.k);
      else d = p.k ? smin(d, v, p.k) : Math.min(d, v);
    }
  }
  return Math.min(d, bound);
};

/* ---------- the body ---------- */
// Torso cross-sections in the upright frame: height, front-back radius, half-width, forward offset.
// One unit is about 26.5 cm at her head size: shoulders 39 cm, bust 30, waist 24, hips 34.
const TORSO_PROFILE = [
  [1.8, 0.31, 0.54, -0.03],
  [2.02, 0.39, 0.67, -0.04],
  [2.26, 0.43, 0.73, -0.03],
  [2.52, 0.41, 0.68, 0.0],
  [2.8, 0.36, 0.57, 0.05],
  [3.08, 0.32, 0.49, 0.08],
  [3.34, 0.34, 0.54, 0.11],
  [3.58, 0.37, 0.6, 0.14],
  [3.84, 0.36, 0.62, 0.16],
  [4.02, 0.29, 0.54, 0.17],
  [4.16, 0.19, 0.3, 0.18],
  [4.27, 0.15, 0.16, 0.19],
];
const TORSO_STEPS = 256,
  TZ0 = TORSO_PROFILE[0][0],
  TZ1 = TORSO_PROFILE[TORSO_PROFILE.length - 1][0];
const torsoSlope = (i: number, field: number) => {
  const p = TORSO_PROFILE;
  if (i === 0) return (p[1][field] - p[0][field]) / (p[1][0] - p[0][0]);
  if (i === p.length - 1)
    return (p[i][field] - p[i - 1][field]) / (p[i][0] - p[i - 1][0]);
  const a = (p[i][field] - p[i - 1][field]) / (p[i][0] - p[i - 1][0]);
  const b = (p[i + 1][field] - p[i][field]) / (p[i + 1][0] - p[i][0]);
  return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
};
// monotone cubic samples, so the silhouette has no kinks between rows
const torsoSamples = Array.from({ length: TORSO_STEPS + 1 }, (_, n) => {
  const z = lerp(TZ0, TZ1, n / TORSO_STEPS);
  let k = 0;
  while (k < TORSO_PROFILE.length - 2 && z > TORSO_PROFILE[k + 1][0]) k++;
  const a = TORSO_PROFILE[k],
    b = TORSO_PROFILE[k + 1],
    t = (z - a[0]) / (b[0] - a[0]),
    h = b[0] - a[0];
  return [1, 2, 3].map(
    (f) =>
      (2 * t ** 3 - 3 * t ** 2 + 1) * a[f] +
      (t ** 3 - 2 * t ** 2 + t) * h * torsoSlope(k, f) +
      (-2 * t ** 3 + 3 * t ** 2) * b[f] +
      (t ** 3 - t ** 2) * h * torsoSlope(k + 1, f),
  );
});

const PIV: Vec3 = [0.02, 0, 2.02]; // hip joints: the upper body folds here
const LEAN_CROUCH = 0.85;
const TAG_LIPS = 1,
  TAG_EYE = 2,
  TAG_LID = 3;
const HEAD_SCALE = 0.88;
const UPPER = 1.13,
  FORE = 0.9; // 30 cm and 24 cm
const THIGH = 1.72,
  SHIN = 1.46;

interface Model {
  skin: Group[];
  hairCap: Ellipsoid;
  head: { c: Vec3; f: Vec3; s: Vec3; u: Vec3; yf: Vec3; ys: Vec3; hem: number };
  // the upper body's transform, inverted to evaluate the torso profile
  toUpright: (x: number, y: number, z: number) => Vec3;
  breath: number;
}

// Builds her for one pose. Everything is in her local frame: x forward toward him, y to her left, z up.
const buildModel = (pose: HoloPose): Model => {
  const R = GIANT.R;
  const st = ease(clamp(pose.stand, 0, 1)),
    pt = ease(clamp(pose.point, 0, 1));
  const sw = pose.sway,
    amp = pose.amp * (1 - st * 0.6);
  const lean = lerp(
    LEAN_CROUCH + amp * 0.035 * Math.sin(sw) + 0.07 * pt,
    0.06,
    st,
  );
  const twist = amp * 0.07 * Math.sin(sw + 0.6) - 0.05 * pt;
  const yaw = YAW_BACK * st;
  const breath = amp * Math.sin(sw * 2);
  // keep her head at the same height whether she stands or crouches: standing, she rises out of the dark below
  const neckZ = (l: number) => PIV[2] - 0.18 * Math.sin(l) + 2.1 * Math.cos(l);
  const dz = neckZ(LEAN_CROUCH) - neckZ(lean);

  const LC = Math.cos(lean),
    LS = Math.sin(lean),
    TC = Math.cos(twist),
    TS = Math.sin(twist),
    YC = Math.cos(yaw),
    YS = Math.sin(yaw);
  const rotZ = (v: Vec3, c: number, s: number): Vec3 => [
    v[0] * c - v[1] * s,
    v[0] * s + v[1] * c,
    v[2],
  ];
  const bendV = (v: Vec3): Vec3 =>
    rotZ([v[0] * LC + v[2] * LS, v[1], -v[0] * LS + v[2] * LC], TC, TS);
  const worldV = (v: Vec3): Vec3 => rotZ(v, YC, YS);
  const worldP = (p: Vec3): Vec3 =>
    add3(add3(PIV, worldV(sub3(p, PIV))), [0, 0, dz]);
  const Bp = (p: Vec3) => worldP(add3(PIV, bendV(sub3(p, PIV)))); // upper body point
  const Lp = worldP; // leg point
  const BA: Axes = [
    worldV(bendV([1, 0, 0])),
    worldV(bendV([0, 1, 0])),
    worldV(bendV([0, 0, 1])),
  ];
  const toUpright = (x: number, y: number, z: number): Vec3 => {
    const q: Vec3 = [x - PIV[0], y - PIV[1], z - PIV[2] - dz];
    const a = rotZ(q, YC, -YS),
      b = rotZ(a, TC, -TS); // undo the turn, then the twist
    return [
      PIV[0] + b[0] * LC - b[2] * LS,
      PIV[1] + b[1],
      PIV[2] + b[0] * LS + b[2] * LC,
    ]; // then the fold
  };

  const ik = (root: Vec3, target: Vec3, l1: number, l2: number, pole: Vec3) => {
    const d = sub3(target, root),
      dist = Math.min(Math.hypot(...d), l1 + l2 - 0.001),
      n = norm3(d);
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist),
      h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const pp = norm3(sub3(pole, add3([0, 0, 0], n, dot3(pole, n))));
    return add3(add3(root, n, a), pp, h);
  };
  // a limb segment with a muscle belly: thick near `bellyAt`, tapering to both joints
  const limb = (
    a: Vec3,
    b: Vec3,
    ra: number,
    rBelly: number,
    rb: number,
    bellyAt: number,
    k: number,
  ) => {
    const m = lerp3(a, b, bellyAt);
    return [C(a, m, ra, rBelly, k), C(m, b, rBelly, rb, k)];
  };
  const Eb = (c: Vec3, r: Vec3, k: number, op = ADD) => E(Bp(c), r, k, BA, op);
  const Cb = (a: Vec3, b: Vec3, ra: number, rb: number, k: number) =>
    C(Bp(a), Bp(b), ra, rb, k);

  // upper body, built upright then folded
  const shR = Bp([0.16, -0.64, 3.98]),
    shL = Bp([0.15, 0.64, 3.98]);
  const neckBase = Bp([0.2, 0, 4.12]);
  // the neck lifts back toward upright so she looks out, not at the floor
  const neckTop = add3(
    neckBase,
    norm3(worldV(rotZ([lerp(0.55, 0.1, st), 0, 1], TC, TS))),
    0.5,
  );
  const bust = 1 + 0.03 * breath;
  const torso: Prim[] = [
    C(neckBase, neckTop, 0.145, 0.13, 0.1),
    Cb([0.12, -0.1, 4.26], [0.14, -0.52, 4.04], 0.085, 0.07, 0.1),
    Cb([0.12, 0.1, 4.26], [0.13, 0.52, 4.04], 0.085, 0.07, 0.1), // trapezius
    Cb([0.3, -0.05, 4.1], [0.24, -0.52, 4.04], 0.026, 0.022, 0.04),
    Cb([0.3, 0.05, 4.1], [0.23, 0.52, 4.04], 0.026, 0.022, 0.04), // collarbones
    E(shR, [0.15, 0.15, 0.16], 0.16, BA),
    E(shL, [0.15, 0.15, 0.16], 0.16, BA), // deltoids
    Eb(
      [0.4 + 0.01 * breath, -0.25, 3.55],
      [0.18 * bust, 0.17 * bust, 0.19 * bust],
      0.24,
    ),
    Eb(
      [0.4 + 0.01 * breath, 0.25, 3.55],
      [0.18 * bust, 0.17 * bust, 0.19 * bust],
      0.24,
    ),
    Eb([-0.25, -0.25, 2.2], [0.28, 0.29, 0.34], 0.16),
    Eb([-0.25, 0.25, 2.2], [0.28, 0.29, 0.34], 0.16), // seat
    Eb([0.4, 0, 2.98], [0.022, 0.02, 0.03], 0.02, SUB), // navel
  ];
  // legs swing by angle from straight down: standing, then folded back under her
  const legs = (sgn: number): Prim[] => {
    const hip: Vec3 = [0.02, 0.3 * sgn, 2.02];
    const a1 = lerp(1.1, 0.03, st),
      a2 = lerp(-1.46, -0.02, st),
      a3 = lerp(-1.38, 1.3, st);
    const knee: Vec3 = [
      hip[0] + THIGH * Math.sin(a1),
      lerp(0.36, 0.3, st) * sgn,
      hip[2] - THIGH * Math.cos(a1),
    ];
    const ankle: Vec3 = [
      knee[0] + SHIN * Math.sin(a2),
      0.3 * sgn,
      knee[2] - SHIN * Math.cos(a2),
    ];
    const toe: Vec3 = [
      ankle[0] + 0.33 * Math.sin(a3),
      0.28 * sgn,
      ankle[2] - 0.33 * Math.cos(a3),
    ];
    return [
      ...limb(Lp(hip), Lp(knee), 0.36, 0.32, 0.19, 0.25, 0.16),
      E(Lp(knee), [0.16, 0.15, 0.15], 0.08),
      ...limb(Lp(knee), Lp(ankle), 0.16, 0.15, 0.085, 0.3, 0.1),
      C(Lp(ankle), Lp(toe), 0.08, 0.06, 0.06),
    ];
  };

  // The head: faces him (and turns toward us a little) when crouched, faces away standing.
  const toV = [
    TO_VIEW[0] * GIANT.f[0] + TO_VIEW[1] * GIANT.f[1],
    TO_VIEW[0] * GIANT.s[0] + TO_VIEW[1] * GIANT.s[1],
  ];
  const psi = Math.atan2(toV[1], toV[0]) * 0.22 * (1 - st) + yaw + twist;
  const tau = lerp(0.3 + amp * 0.05 * Math.sin(sw + 2.2) + 0.06 * pt, 0.12, st);
  const rho =
    (0.1 + amp * 0.09 * Math.sin(sw + 1.2) - 0.04 * pt) * R * (1 - st);
  const yf: Vec3 = [Math.cos(psi), Math.sin(psi), 0],
    ys: Vec3 = [-Math.sin(psi), Math.cos(psi), 0];
  const rot = (a: Vec3, b: Vec3, ang: number): [Vec3, Vec3] => [
    add3(add3([0, 0, 0], a, Math.cos(ang)), b, -Math.sin(ang)),
    add3(add3([0, 0, 0], a, Math.sin(ang)), b, Math.cos(ang)),
  ];
  const [hf, hu0] = rot(yf, [0, 0, 1], tau);
  const [hs, hu] = rot(ys, hu0, -rho);
  const hc = add3(add3(neckTop, hu, 0.32), hf, 0.02);
  const Hp = (a: number, b: number, u: number) =>
    add3(
      add3(add3(hc, hf, HEAD_SCALE * a), hs, HEAD_SCALE * b),
      hu,
      HEAD_SCALE * u,
    );

  // A hand from its palm centre, long axis fd, thumb-side axis wd and back-of-hand normal. side +1 is her
  // right hand, -1 her left, so the thumb sits toward her midline. idx bends the index finger, curl the rest.
  const hand = (
    palm: Vec3,
    fd: Vec3,
    wd: Vec3,
    normal: Vec3,
    side: number,
    idx: number,
    curl: number,
  ) => {
    const P = (a: number, b: number, c: number) =>
      add3(add3(add3(palm, fd, a), wd, b * side), normal, c);
    const wr = add3(palm, fd, -0.19);
    const axes: Axes = [fd, wd, normal];
    const out: Prim[] = [
      E(wr, [0.07, 0.095, 0.055], 0.05, axes),
      E(palm, [0.2, 0.15, 0.058], 0.05, axes),
    ];
    const k0 = P(0.18, 0.08, 0),
      k1 = P(0.33, 0.09, -0.02 - 0.02 * idx);
    const k2 = lerp3(P(0.45, 0.093, -0.05), P(0.42, 0.093, -0.1), idx),
      k3 = lerp3(P(0.54, 0.093, -0.08), P(0.45, 0.093, -0.18), idx);
    out.push(
      C(k0, k1, 0.042, 0.036, 0.02),
      C(k1, k2, 0.036, 0.031, 0.012),
      C(k2, k3, 0.031, 0.024, 0.01),
    );
    for (const [o, len] of [
      [0.01, 0.27],
      [-0.05, 0.25],
      [-0.1, 0.22],
    ]) {
      const r0 = o < -0.07 ? 0.032 : 0.038;
      const a = P(0.16, o, 0),
        b = lerp3(P(0.16 + len * 0.55, o, -0.015), P(len, o, -0.06), curl);
      const c = lerp3(P(0.16 + len, o, -0.05), P(0.17, o, -0.13), curl);
      out.push(
        C(a, b, r0, r0 * 0.9, 0.015),
        C(b, c, r0 * 0.9, r0 * 0.75, 0.012),
      );
    }
    out.push(
      C(P(-0.1, 0.12, -0.03), P(0.02, 0.16, -0.08), 0.045, 0.036, 0.025),
    );
    out.push(
      C(P(0.02, 0.16, -0.08), P(0.13, 0.06, -0.11), 0.034, 0.026, 0.012),
    );
    return { wr, prims: out };
  };
  // an arm from shoulder to a hand target; a target out of reach is pulled in so the hand stays on the wrist
  const arm = (
    sh: Vec3,
    palm: Vec3,
    fd: Vec3,
    wd: Vec3,
    normal: Vec3,
    side: number,
    idx: number,
    curl: number,
    pole: Vec3,
  ) => {
    let p = palm;
    const wr0 = add3(p, fd, -0.19),
      reach = UPPER + FORE - 0.02,
      d = sub3(wr0, sh),
      dist = Math.hypot(...d);
    if (dist > reach) p = add3(add3(sh, norm3(d), reach), fd, 0.19);
    const h = hand(p, fd, wd, normal, side, idx, curl);
    const el = ik(sh, h.wr, UPPER, FORE, pole);
    return [
      ...limb(sh, el, 0.16, 0.155, 0.115, 0.3, 0.14),
      ...limb(el, h.wr, 0.125, 0.14, 0.085, 0.25, 0.08),
      ...h.prims,
    ];
  };
  const frame = (fd: Vec3, wd: Vec3, normal?: Vec3) => {
    const f = norm3(fd),
      w = norm3(sub3(wd, add3([0, 0, 0], f, dot3(wd, f))));
    const n0 = normal ?? cross3(f, w);
    return {
      f,
      w,
      n: norm3(
        sub3(
          sub3(n0, add3([0, 0, 0], f, dot3(n0, f))),
          add3([0, 0, 0], w, dot3(n0, w)),
        ),
      ),
    };
  };
  const blendFrame = (
    a: { f: Vec3; w: Vec3; n: Vec3 },
    b: { f: Vec3; w: Vec3; n: Vec3 },
    t: number,
  ) => frame(lerp3(a.f, b.f, t), lerp3(a.w, b.w, t), lerp3(a.n, b.n, t));

  // Right hand: hanging at her side (standing), at her cheek (crouched), pointing at him.
  const hangR = {
    p: Bp([0.06, -0.8, 2.12]),
    fr: frame(worldV([0, 0, -1]), worldV([1, 0, 0])),
  };
  // cheek: palm against her cheek on the near side, fingers up along her face and curled in toward it,
  // thumb under her jaw; the back of the hand faces out
  const cheekR = {
    p: Hp(0.22, -0.4, -0.3),
    fr: frame(add3(hu, hf, -0.1), hf, add3([0, 0, 0], hs, -1)),
  };
  const pointR = {
    fr: frame([0.7, -0.55, -0.3], cross3([0, 0, 1], norm3([0.7, -0.55, -0.3]))),
  };
  let rPalm: Vec3,
    rFr: { f: Vec3; w: Vec3; n: Vec3 },
    rIdx: number,
    rCurl: number,
    rPole: Vec3;
  if (st > 0) {
    rPalm = lerp3(cheekR.p, hangR.p, st);
    rFr = blendFrame(cheekR.fr, hangR.fr, st);
    rIdx = lerp(0.35, 0.6, st);
    rCurl = lerp(0.45, 0.5, st);
    rPole = lerp3([-0.2, -0.6, -1], worldV([-0.6, -0.3, -0.2]), st);
  } else {
    // the hand leaves her cheek in an arc, out and down to him
    rPalm = add3(lerp3(cheekR.p, PALM_LOCAL, pt), [
      0,
      0,
      0.35 * Math.sin(Math.PI * pt),
    ]);
    rFr = blendFrame(cheekR.fr, pointR.fr, pt);
    rIdx = lerp(0.35, 0, pt);
    rCurl = lerp(0.45, 1, pt);
    rPole = lerp3([-0.2, -0.6, -1], [0, -0.3, -1], pt);
  }
  const right = arm(shR, rPalm, rFr.f, rFr.w, rFr.n, 1, rIdx, rCurl, rPole);

  // Left hand: hanging at her side standing; crouched, it rests on her thigh and slides with the sway.
  const kneeL = Lp([
    0.02 + THIGH * Math.sin(1.1) * 0.82,
    0.38,
    2.02 - THIGH * Math.cos(1.1) * 0.82 + 0.16,
  ]);
  const glide = amp * 0.12 * Math.sin(sw);
  const thighL = add3(kneeL, worldV([-0.9, 0, 0.45]), 0.3 + glide);
  const hangL = {
    p: Bp([0.06, 0.8, 2.12]),
    fr: frame(worldV([0, 0, -1]), worldV([-1, 0, 0])),
  };
  const restL = {
    fr: frame(
      worldV([0.9, 0.05, -0.4]),
      cross3([0, 0, 1], norm3(worldV([0.9, 0.05, -0.4]))),
    ),
  };
  const lFr = blendFrame(restL.fr, hangL.fr, st);
  const left = arm(
    shL,
    lerp3(thighL, hangL.p, st),
    lFr.f,
    lFr.w,
    lFr.n,
    -1,
    lerp(0.8, 0.6, st),
    0.5,
    lerp3(worldV([-0.3, 0.6, -0.2]), worldV([-0.6, 0.3, -0.2]), st),
  );

  const HA: Axes = [hf, hs, hu];
  const He = (c: Vec3, r: Vec3, k: number, op = ADD, tag = 0) =>
    E(
      c,
      [r[0] * HEAD_SCALE, r[1] * HEAD_SCALE, r[2] * HEAD_SCALE],
      k * HEAD_SCALE,
      HA,
      op,
      tag,
    );
  const Hc = (a: Vec3, b: Vec3, ra: number, rb: number, k: number) =>
    C(a, b, ra * HEAD_SCALE, rb * HEAD_SCALE, k * HEAD_SCALE);
  const face: Prim[] = [
    He(Hp(-0.06, 0, 0.1), [0.5, 0.41, 0.46], 0.08), // cranium
    He(Hp(0.16, 0, -0.15), [0.37, 0.33, 0.35], 0.1), // face
    He(Hp(0.28, 0.22, -0.05), [0.1, 0.08, 0.07], 0.06),
    He(Hp(0.28, -0.22, -0.05), [0.1, 0.08, 0.07], 0.06), // cheekbones
    Hc(Hp(-0.1, 0.3, -0.12), Hp(0.3, 0.1, -0.42), 0.085, 0.07, 0.08),
    Hc(Hp(-0.1, -0.3, -0.12), Hp(0.3, -0.1, -0.42), 0.085, 0.07, 0.08), // jaw
    He(Hp(0.34, 0, -0.43), [0.11, 0.12, 0.1], 0.06), // chin
    He(Hp(0.38, 0.15, 0.1), [0.07, 0.13, 0.05], 0.05),
    He(Hp(0.38, -0.15, 0.1), [0.07, 0.13, 0.05], 0.05), // brow
    He(Hp(0.4, 0.15, 0.02), [0.08, 0.1, 0.066], 0.04, SUB),
    He(Hp(0.4, -0.15, 0.02), [0.08, 0.1, 0.066], 0.04, SUB), // sockets
    He(Hp(0.37, 0.15, 0.012), [0.055, 0.074, 0.045], 0, ADD, TAG_EYE),
    He(Hp(0.37, -0.15, 0.012), [0.055, 0.074, 0.045], 0, ADD, TAG_EYE),
    He(Hp(0.38, 0.15, 0.054), [0.052, 0.086, 0.026], 0.015, ADD, TAG_LID),
    He(Hp(0.38, -0.15, 0.054), [0.052, 0.086, 0.026], 0.015, ADD, TAG_LID),
    Hc(Hp(0.43, 0, 0.02), Hp(0.535, 0, -0.16), 0.04, 0.055, 0.04), // nose
    He(Hp(0.5, 0.045, -0.17), [0.045, 0.04, 0.035], 0.03),
    He(Hp(0.5, -0.045, -0.17), [0.045, 0.04, 0.035], 0.03),
    He(Hp(0.47, 0, -0.255), [0.045, 0.12, 0.036], 0.03, ADD, TAG_LIPS), // upper lip
    He(Hp(0.455, 0, -0.318), [0.052, 0.108, 0.043], 0.025, ADD, TAG_LIPS), // lower lip
    He(Hp(-0.02, 0.42, -0.04), [0.1, 0.035, 0.14], 0.03),
    He(Hp(-0.02, -0.42, -0.04), [0.1, 0.035, 0.14], 0.03), // ears
  ];
  return {
    skin: [
      group(torso),
      group(legs(1)),
      group(legs(-1)),
      group(right),
      group(left),
      group(face),
    ],
    hairCap: He(Hp(-0.06, 0, 0.1), [0.57, 0.49, 0.51], 0),
    head: { c: hc, f: hf, s: hs, u: hu, yf, ys, hem: hc[2] - 1.12 }, // blunt cut at the collarbones
    toUpright,
    breath,
  };
};

/** Renders her for one pose. Takes about a second; call it from a worker. */
export function bakeHologram(pose: HoloPose): HoloFrame {
  const M = buildModel(pose);
  const { head } = M;
  const torsoSDF = (px: number, py: number, pz: number) => {
    const [x, y, z] = M.toUpright(px, py, pz);
    const q = clamp(((z - TZ0) / (TZ1 - TZ0)) * TORSO_STEPS, 0, TORSO_STEPS);
    const i = Math.min(TORSO_STEPS - 1, Math.floor(q)),
      t = q - i;
    const a = torsoSamples[i],
      b = torsoSamples[i + 1];
    const chest =
      1 + 0.035 * M.breath * Math.max(0, 1 - Math.abs(z - 3.55) / 0.4);
    const rx = lerp(a[0], b[0], t) * chest,
      ry = lerp(a[1], b[1], t),
      cx = lerp(a[2], b[2], t);
    const dy = y - 0.035 * Math.cos((z - TZ0) * 1.2),
      dx = x - cx;
    const k0 = Math.hypot(dx / rx, dy / ry),
      k1 = Math.hypot(dx / (rx * rx), dy / (ry * ry));
    const radial = k1 < 1e-8 ? -Math.min(rx, ry) : (k0 * (k0 - 1)) / k1;
    const cap = Math.max(TZ0 - z, z - TZ1);
    return (
      Math.hypot(Math.max(radial, 0), Math.max(cap, 0)) +
      Math.min(Math.max(radial, cap), 0)
    );
  };
  // Straight blunt-cut hair. The cap carries the bangs, cut level just above the brow; below that the hair
  // hangs straight down as an elliptic curtain around the head, open at the front for the face.
  const hairSDF = (x: number, y: number, z: number) => {
    const { c, f, s, u, yf, ys, hem } = head,
      HS = HEAD_SCALE;
    const lb = Math.max(
      Math.hypot(x - c[0], y - c[1]) - 0.7 * HS,
      hem - z - 0.3,
      z - c[2] - 0.8,
    );
    if (lb > 0.3) return lb;
    const dx = x - c[0],
      dy = y - c[1],
      dz = z - c[2];
    const qa = (dx * f[0] + dy * f[1] + dz * f[2]) / HS,
      qs = (dx * s[0] + dy * s[1] + dz * s[2]) / HS,
      qu = (dx * u[0] + dy * u[1] + dz * u[2]) / HS;
    let cap = prim(M.hairCap, x, y, z);
    const fringe = 0.17 + 0.012 * Math.max(0, Math.cos(qs * 60)) ** 6;
    const bx = Math.abs(qa - 0.58) - 0.44,
      by = Math.abs(qs) - 0.31,
      bz = Math.abs(qu - fringe + 0.6) - 0.6;
    cap = Math.max(
      cap,
      -(
        Math.hypot(Math.max(bx, 0), Math.max(by, 0), Math.max(bz, 0)) +
        Math.min(Math.max(bx, by, bz), 0) -
        0.03
      ) * HS,
    );
    const ha = dx * yf[0] + dy * yf[1],
      hs2 = dx * ys[0] + dy * ys[1];
    const ra = 0.5 * HS,
      rs = 0.51 * HS,
      k0 = Math.hypot(ha / ra, hs2 / rs);
    const ang = Math.atan2(hs2, ha);
    let cur = smax(
      (k0 - 1) * Math.min(ra, rs),
      hem + 0.012 * Math.sin(ang * 40) - z,
      0.06,
    ); // ends curve under slightly
    cur = smax(cur, dz + 0.06, 0.22); // fades into the cap instead of ending at a level edge
    cur = smax(cur, -Math.max(0.02 * HS - ha, Math.abs(hs2) - 0.33 * HS), 0.05); // open in front of the face
    return smin(cap, cur, 0.1);
  };
  const skinSDF = (x: number, y: number, z: number) =>
    smin(torsoSDF(x, y, z), evalGroups(M.skin, x, y, z), 0.13);
  const partAt = (x: number, y: number, z: number) => {
    let best = torsoSDF(x, y, z),
      k = 0;
    M.skin.forEach((g, n) => {
      const v = evalGroups([g], x, y, z);
      if (v < best) {
        best = v;
        k = n;
      }
    });
    return k;
  };
  const sdf = (x: number, y: number, z: number) =>
    Math.min(skinSDF(x, y, z), hairSDF(x, y, z));
  const tagAt = (x: number, y: number, z: number) => {
    let best = 1e9,
      tag = 0;
    for (const p of M.skin[5].prims)
      if (p.tag) {
        const v = prim(p, x, y, z);
        if (v < best) {
          best = v;
          tag = p.tag;
        }
      }
    return best < 0.012 ? tag : 0;
  };

  const holoC = new Uint32Array(W * H),
    holoZ = new Float32Array(W * H).fill(-1e9),
    holoA = new Float32Array(W * H);
  const holoKind = new Uint8Array(W * H); // 1 skin, 2 hair, 3 lips, 4 face, 6 eye, 7 lid
  const warm = new Float32Array(W * H),
    cool = new Float32Array(W * H);
  const fadeAt = (z: number) => clamp((z - 0.6) / 3.4, 0, 1); // she dissolves toward the ground
  const f = GIANT.f,
    s = GIANT.s;
  const toLocal = (x: number, y: number, z: number): Vec3 => {
    const dx = x - GIANT.x,
      dy = y - GIANT.y;
    return [
      (dx * f[0] + dy * f[1]) / U,
      (dx * s[0] + dy * s[1]) / U,
      (z - GIANT.z) / U,
    ];
  };
  const loc = (v: Vec3): Vec3 => [
    v[0] * f[0] + v[1] * f[1],
    v[0] * s[0] + v[1] * s[1],
    v[2],
  ];
  const V: Vec3 = [COS / R2, COS / R2, SIN];
  const Dl = loc(V);
  const UP: Vec3 = [-SIN / R2, -SIN / R2, COS],
    LEFT: Vec3 = [-Math.SQRT1_2, Math.SQRT1_2, 0];
  const L1 = norm3(
    loc(
      add3(add3([V[0] * 0.55, V[1] * 0.55, V[2] * 0.55], LEFT, 0.5), UP, 0.6),
    ),
  );
  const L2 = norm3(
    loc(
      add3(add3([-V[0] * 0.3, -V[1] * 0.3, -V[2] * 0.3], LEFT, -0.9), UP, 0.2),
    ),
  );
  // screen bounds and depth range from a box around every pose she takes
  let x0 = W,
    x1 = 0,
    y0 = H,
    y1 = 0,
    dmin = 1e9,
    dmax = -1e9;
  for (const a of [-3.2, 4.6])
    for (const b of [-3.2, 3.2])
      for (const c of [-2.6, 5.8]) {
        const p = project(
          GIANT.x + (f[0] * a + s[0] * b) * U,
          GIANT.y + (f[1] * a + s[1] * b) * U,
          c * U + GIANT.z,
        );
        x0 = Math.min(x0, p.sx);
        x1 = Math.max(x1, p.sx);
        y0 = Math.min(y0, p.sy);
        y1 = Math.max(y1, p.sy);
        dmin = Math.min(dmin, p.d);
        dmax = Math.max(dmax, p.d);
      }
  x0 = Math.max(0, x0 | 0);
  x1 = Math.min(W - 1, Math.ceil(x1));
  y0 = Math.max(0, y0 | 0);
  y1 = Math.min(H - 1, Math.ceil(y1));
  const d0 = dmax + 1,
    tMax = (dmax - dmin + 2) / U;
  const rayOrigin = (sx: number, sy: number) => {
    const a = (sx - OX) / S,
      v = (sy - OY) / S;
    const b = v * SIN + d0 * COS,
      wz = -v * COS + d0 * SIN;
    return toLocal((a + b) / R2, (b - a) / R2, wz);
  };
  // 4 px blocks: march each block's centre ray, keep the block and its neighbours if it passes near her
  const B = 4,
    bw = Math.ceil((x1 - x0 + 1) / B),
    bh = Math.ceil((y1 - y0 + 1) / B),
    near = new Uint8Array(bw * bh);
  for (let by = 0; by < bh; by++)
    for (let bx = 0; bx < bw; bx++) {
      const O = rayOrigin(x0 + bx * B + B / 2, y0 + by * B + B / 2);
      let t = 0,
        lo = 1e9;
      for (let n = 0; n < 140 && t < tMax; n++) {
        const d = sdf(O[0] - Dl[0] * t, O[1] - Dl[1] * t, O[2] - Dl[2] * t);
        lo = Math.min(lo, d);
        if (d < 0.09) break;
        t += Math.max(d * 0.85, 0.002);
      }
      if (lo < 0.09)
        for (let j = -1; j <= 1; j++)
          for (let k = -1; k <= 1; k++) {
            const u = bx + k,
              v = by + j;
            if (u >= 0 && v >= 0 && u < bw && v < bh) near[v * bw + u] = 1;
          }
    }
  let hx0 = W,
    hx1 = -1,
    hy0 = H,
    hy1 = -1;
  const e = 0.004,
    K4: Vec3[] = [
      [1, -1, -1],
      [-1, -1, 1],
      [-1, 1, -1],
      [1, 1, 1],
    ];
  for (let iy = y0; iy <= y1; iy++)
    for (let ix = x0; ix <= x1; ix++) {
      if (!near[(((iy - y0) / B) | 0) * bw + (((ix - x0) / B) | 0)]) continue;
      const O = rayOrigin(ix + 0.5, iy + 0.5);
      let t = 0,
        hit = false,
        px = 0,
        py = 0,
        pz = 0;
      for (let n = 0; n < 140 && t < tMax; n++) {
        px = O[0] - Dl[0] * t;
        py = O[1] - Dl[1] * t;
        pz = O[2] - Dl[2] * t;
        const d = sdf(px, py, pz);
        if (d < 0.0025) {
          hit = true;
          break;
        }
        t += Math.max(d * 0.85, 0.002);
      }
      if (!hit) continue;
      const alpha = fadeAt(pz * U + GIANT.z);
      if (alpha <= 0) continue;
      const i = iy * W + ix;
      let nx = 0,
        ny = 0,
        nz = 0;
      for (const k of K4) {
        const v = sdf(px + k[0] * e, py + k[1] * e, pz + k[2] * e);
        nx += k[0] * v;
        ny += k[1] * v;
        nz += k[2] * v;
      }
      const n = norm3([nx, ny, nz]);
      let occ = 0,
        sca = 1;
      for (let j = 1; j <= 3; j++) {
        const h = 0.04 * j;
        occ += (h - sdf(px + n[0] * h, py + n[1] * h, pz + n[2] * h)) * sca;
        sca *= 0.65;
      }
      const ao = clamp(1 - 2.6 * occ, 0.25, 1);
      const wrap = clamp((dot3(n, L1) + 0.35) / 1.35, 0, 1);
      const fres = (1 - clamp(dot3(n, Dl), 0, 1)) ** 2.2;
      const rim2 = clamp(dot3(n, L2), 0, 1) ** 2;
      const isHair = hairSDF(px, py, pz) <= skinSDF(px, py, pz) + 1e-4;
      const tag = isHair ? 0 : tagAt(px, py, pz);
      const nearHead =
        Math.hypot(px - head.c[0], py - head.c[1], pz - head.c[2]) <
        0.62 * HEAD_SCALE;
      const part = isHair ? -1 : partAt(px, py, pz);
      const kind = isHair
        ? 2
        : tag === TAG_LIPS
          ? 3
          : tag === TAG_EYE
            ? 6
            : tag === TAG_LID
              ? 7
              : part === 5 || nearHead
                ? 4
                : 1;
      const faceLit = kind === 4 || kind === 3 || kind === 7;
      let l = 0.12 + 0.66 * wrap * ao + 0.4 * fres;
      if (faceLit) l = l * 0.8 + 0.16; // her face carries its own light
      const ramp = kind === 2 ? HAIR7 : kind === 3 ? LIPS7 : SKIN7;
      let lv = clamp(
        Math.floor(l * 6.4 + (bayerAt(ix, iy) - 0.5) * (faceLit ? 0.25 : 0.8)),
        0,
        6,
      );
      if (kind === 2) {
        // straight strands around the head
        const dx = px - head.c[0],
          dy = py - head.c[1];
        const strand = noise(
          Math.atan2(
            dx * head.ys[0] + dy * head.ys[1],
            dx * head.yf[0] + dy * head.yf[1],
          ) *
            26 +
            pz * 0.6,
          3.3,
        );
        if (strand > 0.68) lv = Math.min(6, lv + 1);
        else if (strand < 0.25) lv = Math.max(0, lv - 1);
      }
      let col: Color = kind === 6 ? [12, 8, 24] : ramp[lv];
      if (kind !== 6 && kind !== 3) {
        const rim = clamp((rim2 - 0.15) / 0.85, 0, 1) * 0.28;
        col = [
          lerp(col[0], RIM_CYAN[0], rim),
          lerp(col[1], RIM_CYAN[1], rim),
          lerp(col[2], RIM_CYAN[2], rim),
        ];
      }
      holoC[i] = rgb(...col);
      holoZ[i] = d0 - t * U;
      holoA[i] = alpha;
      holoKind[i] = kind;
      const lum = ((col[0] + col[1] + col[2]) / 765) * alpha;
      if (kind === 2) cool[i] = lum;
      else warm[i] = lum;
      hx0 = Math.min(hx0, ix);
      hx1 = Math.max(hx1, ix);
      hy0 = Math.min(hy0, iy);
      hy1 = Math.max(hy1, iy);
    }

  // fine detail on the face: lash line with a wing, brows, shadow on the lids, gloss on the lips
  {
    const { c, f: hf, s: hs, u: hu } = head;
    const toScreen = (a: number, b: number, q: number) => {
      const l = add3(
        add3(add3(c, hf, HEAD_SCALE * a), hs, HEAD_SCALE * b),
        hu,
        HEAD_SCALE * q,
      );
      return project(
        GIANT.x + (f[0] * l[0] + s[0] * l[1]) * U,
        GIANT.y + (f[1] * l[0] + s[1] * l[1]) * U,
        l[2] * U + GIANT.z,
      );
    };
    const paint = (
      p: { sx: number; sy: number; d: number },
      kinds: number[],
      color: number,
    ) => {
      const ix = Math.round(p.sx),
        iy = Math.round(p.sy);
      if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
      const i = iy * W + ix;
      if (kinds.includes(holoKind[i]) && holoZ[i] - p.d < 0.5) holoC[i] = color;
    };
    const LASH = rgb(17, 7, 27),
      BROW = rgb(43, 18, 65),
      SHADOW = rgb(137, 45, 119);
    for (let i = W; i < W * H - W; i++)
      if (holoKind[i] === 6 && holoKind[i - W] === 7) {
        holoC[i - W] = LASH;
        holoC[i] = LASH;
      }
    for (const sb of [1, -1]) {
      for (let k = 0; k <= 6; k++)
        paint(
          toScreen(0.36 - k * 0.006, (0.21 + k * 0.012) * sb, 0.03 + k * 0.009),
          [4, 7, 6],
          LASH,
        );
      for (let k = 0; k < 10; k++)
        paint(
          toScreen(
            0.39,
            (0.08 + k * 0.014) * sb,
            0.06 + Math.sin((k / 9) * Math.PI) * 0.012,
          ),
          [7, 4],
          SHADOW,
        );
      for (let k = 0; k <= 14; k++) {
        const arch =
          Math.sin(Math.min(1, k / 10) * Math.PI * 0.55) * 0.03 -
          Math.max(0, k - 10) * 0.006;
        paint(
          toScreen(0.43 - k * 0.004, (0.05 + k * 0.017) * sb, 0.135 + arch),
          [4, 7],
          BROW,
        );
      }
    }
    for (let k = 2; k <= 4; k++)
      paint(
        toScreen(0.45 + k * 0.014, 0.03, 0.02 - k * 0.026),
        [4],
        rgb(...SKIN7[5]),
      );
    for (const sb of [1, -1])
      paint(toScreen(0.5, 0.055 * sb, -0.19), [4], rgb(...SKIN7[1]));
    paint(toScreen(0.49, 0, -0.215), [4, 3], rgb(...SKIN7[2]));
    for (let k = -6; k <= 6; k++)
      paint(
        toScreen(0.48, k * 0.014, -0.288 - Math.abs(k) * 0.002),
        [3, 4],
        rgb(...LIPS7[0]),
      );
    for (let i = W; i < W * H - W; i++)
      if (
        holoKind[i] === 3 &&
        holoKind[i - W] === 3 &&
        holoKind[i + W] !== 3 &&
        hash(i, 5) > 0.55
      )
        holoC[i] = rgb(...LIPS7[6]);
    paint(toScreen(0.4, -0.2 * GIANT.R, -0.12), [4], rgb(90, 36, 30)); // a small beauty mark
  }

  // glow: two box blurs of her light, kept in a box 48 px wider than her
  const blur = (src: Float32Array, R: number) => {
    const tmp = new Float32Array(W * H),
      out = new Float32Array(W * H);
    for (let pass = 0; pass < 2; pass++) {
      const from = pass ? out : src;
      for (let iy = 0; iy < H; iy++) {
        let acc = 0;
        for (let ix = -R; ix < W + R; ix++) {
          if (ix + R < W) acc += from[iy * W + ix + R];
          if (ix - R - 1 >= 0) acc -= from[iy * W + ix - R - 1];
          if (ix >= 0 && ix < W) tmp[iy * W + ix] = acc / (2 * R + 1);
        }
      }
      for (let ix = 0; ix < W; ix++) {
        let acc = 0;
        for (let iy = -R; iy < H + R; iy++) {
          if (iy + R < H) acc += tmp[(iy + R) * W + ix];
          if (iy - R - 1 >= 0) acc -= tmp[(iy - R - 1) * W + ix];
          if (iy >= 0 && iy < H) out[iy * W + ix] = acc / (2 * R + 1);
        }
      }
    }
    return out;
  };
  const gWarm = blur(warm, 22),
    gCool = blur(cool, 16);
  if (hx1 < hx0) {
    hx0 = 0;
    hx1 = 0;
    hy0 = 0;
    hy1 = 0;
  }
  const crop = <T extends Uint32Array | Float32Array | Uint8Array>(
    src: T,
    make: (n: number) => T,
    cx0: number,
    cy0: number,
    cw: number,
    ch: number,
  ) => {
    const out = make(cw * ch);
    for (let y = 0; y < ch; y++)
      out.set(
        src.subarray((cy0 + y) * W + cx0, (cy0 + y) * W + cx0 + cw),
        y * cw,
      );
    return out;
  };
  const w = hx1 - hx0 + 1,
    h = hy1 - hy0 + 1;
  const gx0 = Math.max(0, hx0 - 48),
    gy0 = Math.max(0, hy0 - 48),
    gw = Math.min(W, hx1 + 49) - gx0,
    gh = Math.min(H, hy1 + 49) - gy0;
  return {
    x0: hx0,
    y0: hy0,
    w,
    h,
    c: crop(holoC, (n) => new Uint32Array(n), hx0, hy0, w, h),
    z: crop(holoZ, (n) => new Float32Array(n), hx0, hy0, w, h),
    a: crop(holoA, (n) => new Float32Array(n), hx0, hy0, w, h),
    kind: crop(holoKind, (n) => new Uint8Array(n), hx0, hy0, w, h),
    gx0,
    gy0,
    gw,
    gh,
    warm: crop(gWarm, (n) => new Float32Array(n), gx0, gy0, gw, gh),
    cool: crop(gCool, (n) => new Float32Array(n), gx0, gy0, gw, gh),
  };
}

/* ---------- her motion: the frames the scene plays ---------- */
const TAU = Math.PI * 2;
/** Every frame, keyed by name, in the order the scene first needs them. */
export const FRAMES: [string, HoloPose][] = [
  ["stand0", { stand: 1, point: 0, sway: 0, amp: 0.6 }],
  ...[1, 2, 3, 4, 5].map((n): [string, HoloPose] => [
    `turn${n}`,
    { stand: 1 - n / 6, point: 0, sway: 0, amp: 0.6 },
  ]),
  ["cheek0", { stand: 0, point: 0, sway: 0, amp: 1 }],
  ["stand1", { stand: 1, point: 0, sway: Math.PI, amp: 0.6 }],
  ["cheek1", { stand: 0, point: 0, sway: TAU / 3, amp: 1 }],
  ...[1, 2, 3].map((n): [string, HoloPose] => [
    `reach${n}`,
    { stand: 0, point: n / 4, sway: 0, amp: 0.4 },
  ]),
  ["point0", { stand: 0, point: 1, sway: 0, amp: 0.4 }],
  ["cheek2", { stand: 0, point: 0, sway: (2 * TAU) / 3, amp: 1 }],
  ["point1", { stand: 0, point: 1, sway: Math.PI, amp: 0.4 }],
];
