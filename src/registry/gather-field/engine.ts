import {
  clamp,
  type DriftOpts,
  FIT,
  type Flight,
  flightEase,
  flightSeconds,
  hangFor,
  hexToRgb,
  lightEnvelope,
  ndcToCss,
  placePoint,
  project,
  seeds,
  sharpFor,
  swayAt,
  type View,
} from "./motion";
import { imageToGrid, isPlateId, PLATE_LABELS, paintPlate } from "./plates";
import {
  type Cloud,
  gridFor,
  type Paper,
  samplePlate,
  shuffleIndices,
  type Tone,
} from "./sample";
import {
  GLOW_FRAG,
  GLOW_VERT,
  POINT_FRAG,
  POINT_VERT,
  TRAIL_VERT,
} from "./shaders";
import {
  GROUND_DARK,
  GROUND_LIGHT,
  INK_ON_DARK,
  INK_ON_LIGHT,
  LIGHT_DECAY,
  SCAN_SEC,
  ZOOM_MAX,
  ZOOM_MIN,
} from "./tokens";

export type GatherOpts = {
  drift: number;
  splash: number;
  gather: number;
  depth: number;
  travel: "swarm" | "melt";
  track: boolean;
  links: boolean;
  scan: boolean;
  trails: boolean;
  marks: boolean;
  trackers: "sparse" | "dense";
  lineAngle: number;
  lineOffset: number;
  fadeSide: number;
  lightColor: string;
  paper: Paper;
  tone: Tone;
  /** 0 picks a count for the device. */
  pointCount: number;
  plates: string[];
  index: number;
  lightNonce: number;
};

type Lamp = { x: number; y: number; z: number; age: number; on: boolean };

type Tracker = {
  id: number;
  slot: number;
  roam: boolean;
  seed: number;
  sx: number;
  sy: number;
  hx: number;
  hy: number;
  nextHop: number;
  lockAt: number;
  since: number;
  locked: boolean;
  cycle: number;
};

type Wake = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  mag: number;
  t: number;
};

const STRIDE = 13 * 4;
/** World half-size of the ruler frame, just outside the picture. */
const FRAME = 0.8;

const POINT_UNIFORMS = [
  "uP",
  "uSwarm",
  "uHang",
  "uSharp",
  "uTime",
  "uDrift",
  "uLineAngle",
  "uLineOffset",
  "uFadeSide",
  "uDepth",
  "uYaw",
  "uPitch",
  "uZoom",
  "uResolution",
  "uPointSize",
  "uLamp",
  "uWake",
  "uTail",
  "uPaper",
  "uTrue",
  "uFade",
  "uGain",
  "uLine",
  "uLightColor",
  "uScan",
  "uScanZ",
] as const;

const GLOW_UNIFORMS = [
  "uCore",
  "uLightColor",
  "uResolution",
  "uPaper",
] as const;

/** Point count for this device when the caller leaves it at 0. */
export function autoPointCount() {
  if (typeof window === "undefined") return 262144;
  if (window.innerWidth < 760) return 131072;
  return (navigator.hardwareConcurrency || 4) >= 8 ? 524288 : 262144;
}

/**
 * Mounts the field on three canvases and reads options every frame.
 * Returns null when WebGL 2 is missing.
 */
export function mountGather(host: {
  gl: HTMLCanvasElement;
  hud: HTMLCanvasElement;
  line: HTMLCanvasElement;
  getOpts: () => GatherOpts;
  onInteract: () => void;
}): { dispose(): void } | null {
  const glMaybe = host.gl.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  const hudMaybe = host.hud.getContext("2d");
  const lineMaybe = host.line.getContext("2d");
  if (!glMaybe || !hudMaybe || !lineMaybe) return null;
  const gl: WebGL2RenderingContext = glMaybe;
  const hud: CanvasRenderingContext2D = hudMaybe;
  const line: CanvasRenderingContext2D = lineMaybe;

  const pointMaybe = link(gl, POINT_VERT, POINT_FRAG);
  const trailMaybe = link(gl, TRAIL_VERT, POINT_FRAG);
  const glowMaybe = link(gl, GLOW_VERT, GLOW_FRAG);
  if (!pointMaybe || !trailMaybe || !glowMaybe) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const pointProg: WebGLProgram = pointMaybe;
  const trailProg: WebGLProgram = trailMaybe;
  const glowProg: WebGLProgram = glowMaybe;
  const pu = locations(gl, pointProg, POINT_UNIFORMS);
  const tu = locations(gl, trailProg, POINT_UNIFORMS);
  const gu = locations(gl, glowProg, GLOW_UNIFORMS);
  const bindProgram = gl.useProgram.bind(gl);

  const buffer = gl.createBuffer();
  const pointVao = gl.createVertexArray();
  const trailVao = gl.createVertexArray();
  const glowVao = gl.createVertexArray();
  if (!buffer || !pointVao || !trailVao || !glowVao) return null;

  // Points read every record. Trails read every third, once per instance.
  for (const [vao, stride, divisor] of [
    [pointVao, STRIDE, 0],
    [trailVao, STRIDE * 3, 1],
  ] as const) {
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    for (let loc = 0; loc < 5; loc++) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(
        loc,
        loc === 4 ? 1 : 3,
        gl.FLOAT,
        false,
        stride,
        loc === 4 ? 48 : loc * 12,
      );
      gl.vertexAttribDivisor(loc, divisor);
    }
  }
  gl.bindVertexArray(null);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);

  let packed = new Float32Array(0);
  let drawn = 0;
  const cache = new Map<string, Cloud>();
  const photos = new Map<string, HTMLImageElement>();
  const loading = new Set<string>();

  let fade = 1;
  let fadeVel = 0;
  let dipping = false;
  let primed = false;
  let sourceId = "";
  let drawPaper: Paper = "dark";
  let drawTone: Tone = "negative";
  let drawCount = 262144;
  let autoCount = 0;
  let current: Cloud | null = null;
  let dest: Cloud | null = null;
  let perm: Uint32Array | null = null;
  let inverse: Uint32Array | null = null;
  const flight: Flight & { dur: number } = {
    p: 1,
    swarm: true,
    hang: 0,
    sharp: 4,
    dur: 1,
  };
  let shuffleSalt = 1;
  let time = 0;
  let last = performance.now();
  let raf = 0;
  let cssW = 1;
  let cssH = 1;
  let dpr = 1;
  let told = false;
  let hint = 1;
  let lineKey = "";
  let lineUntil = 0;
  let trackerKey = "";
  let noncePrimed = false;
  let lastNonce = 0;
  let presampled = false;
  let cursorKey = "";
  let slow = { n: 0, sum: 0, done: false };
  const view: View = {
    yaw: 0,
    pitch: 0,
    zoom: 1,
    pushX: 0,
    pushY: 0,
    aspect: 1,
  };
  let shown: View = { ...view };
  const lamps: Lamp[] = [0, 1, 2].map(() => ({
    x: 0,
    y: 0,
    z: 0,
    age: 0,
    on: false,
  }));
  let lampTurn = 0;
  let trackers: Tracker[] = [];
  const wakes: Wake[] = [];
  let lastMouse: { x: number; y: number; t: number } | null = null;
  const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reducedMedia.matches;
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch = 0;

  function interact() {
    if (told) return;
    told = true;
    host.onInteract();
  }

  // ------------------------------------------------------------ clouds

  function ensureImage(src: string) {
    if (photos.has(src) || loading.has(src)) return;
    loading.add(src);
    const img = new Image();
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => {
      photos.set(src, img);
      loading.delete(src);
    };
    img.onerror = () => loading.delete(src);
    img.src = src;
  }

  function getCloud(src: string, paper: Paper, tone: Tone, count: number) {
    const key = `${src}|${paper}|${tone}|${count}`;
    const hit = cache.get(key);
    if (hit) {
      cache.delete(key);
      cache.set(key, hit);
      return hit;
    }
    const edge = gridFor(count);
    let rgba: Uint8ClampedArray;
    let depth: Float32Array | null = null;
    if (isPlateId(src)) {
      const painted = paintPlate(src, edge);
      rgba = painted.rgba;
      depth = painted.depth;
    } else {
      const photo = photos.get(src);
      if (!photo) {
        ensureImage(src);
        return null;
      }
      rgba = imageToGrid(photo, edge, photo.naturalWidth, photo.naturalHeight);
    }
    const cloud = samplePlate(rgba, depth, edge, count, paper, tone);
    cache.set(key, cloud);
    while (cache.size > 12) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      cache.delete(oldest);
    }
    return cloud;
  }

  function upload() {
    if (!current) return;
    const n = current.seed.length;
    const to = dest && dest.seed.length === n ? dest : current;
    const order = perm && perm.length === n ? perm : null;
    if (packed.length !== n * 13) packed = new Float32Array(n * 13);
    for (let i = 0; i < n; i++) {
      const j = order ? order[i] : i;
      const o = i * 13;
      const hi = i * 3;
      const di = j * 3;
      packed[o] = current.home[hi];
      packed[o + 1] = current.home[hi + 1];
      packed[o + 2] = current.home[hi + 2];
      packed[o + 3] = to.home[di];
      packed[o + 4] = to.home[di + 1];
      packed[o + 5] = to.home[di + 2];
      packed[o + 6] = current.color[hi];
      packed[o + 7] = current.color[hi + 1];
      packed[o + 8] = current.color[hi + 2];
      packed[o + 9] = to.color[di];
      packed[o + 10] = to.color[di + 1];
      packed[o + 11] = to.color[di + 2];
      packed[o + 12] = current.seed[i];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, packed, gl.DYNAMIC_DRAW);
    drawn = n;
  }

  /**
   * Where every slot is at flight progress p, as a cloud in slot order.
   * Seeds stay with their slots so nothing jumps; feature indices are
   * carried over from the destination into slot numbers.
   */
  function snapshot(p: number): Cloud | null {
    if (!current) return null;
    const n = current.seed.length;
    const to = dest && dest.seed.length === n ? dest : current;
    const home = new Float32Array(n * 3);
    const color = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const j = perm ? perm[i] : i;
      const hi = i * 3;
      const di = j * 3;
      const s0 = seeds(current.seed[i])[0];
      const lead = (current.home[hi + 2] + to.home[di + 2]) * 0.5;
      const e = flightEase(p, s0, lead, flight.swarm, flight.hang);
      for (let k = 0; k < 3; k++) {
        home[hi + k] =
          current.home[hi + k] + (to.home[di + k] - current.home[hi + k]) * e;
        color[hi + k] =
          current.color[hi + k] +
          (to.color[di + k] - current.color[hi + k]) * e;
      }
    }
    const feats =
      p >= 1 && to !== current
        ? Uint32Array.from(to.feats, (fi) => (inverse ? inverse[fi] : fi))
        : current.feats;
    return { home, color, seed: current.seed, feats };
  }

  // ------------------------------------------------------------ trackers

  function counts(mode: GatherOpts["trackers"]) {
    return mode === "dense" ? { lock: 24, roam: 6 } : { lock: 7, roam: 3 };
  }

  /** Feature slots of the picture the field is heading to. */
  function targetFeats(): number[] {
    if (!current) return [];
    const to = dest && dest !== current ? dest : null;
    if (to && flight.p < 1) {
      return [...to.feats].map((fi) => (inverse ? inverse[fi] : fi));
    }
    return [...current.feats];
  }

  function rebuildTrackers(seek: boolean, mode: GatherOpts["trackers"]) {
    if (!current) {
      trackers = [];
      return;
    }
    const { lock, roam } = counts(mode);
    const feats = targetFeats();
    const prev = trackers;
    const settle = seek ? flight.dur : 0;
    trackers = [];
    for (let a = 0; a < lock + roam; a++) {
      const old = prev[a];
      const slot =
        a < lock && feats.length > 0
          ? feats[a % feats.length]
          : Math.floor(Math.random() * current.seed.length);
      trackers.push({
        id: a + 1,
        slot,
        roam: a >= lock,
        seed: Math.random(),
        sx: old ? old.sx : Number.NaN,
        sy: old ? old.sy : Number.NaN,
        hx: old ? old.sx : Number.NaN,
        hy: old ? old.sy : Number.NaN,
        nextHop: 0,
        lockAt: time + settle * (0.45 + 0.5 * Math.random()),
        since: 0,
        locked: !seek,
        cycle: -1,
      });
    }
    trackerKey = `${sourceId}|${mode}|${current.seed.length}`;
  }

  /** A roaming tracker rides a point that is out on the wind. */
  function roamSlot(opts: GatherOpts) {
    if (!current) return 0;
    const n = current.seed.length;
    const ang = (opts.lineAngle * Math.PI) / 180;
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    let best = Math.floor(Math.random() * n);
    for (let k = 0; k < 60; k++) {
      const i = Math.floor(Math.random() * n);
      const past =
        (current.home[i * 3] * nx +
          current.home[i * 3 + 1] * ny -
          opts.lineOffset) *
        opts.fadeSide;
      if (past > 0.35) {
        best = i;
        break;
      }
    }
    return best;
  }

  // ------------------------------------------------------------ travel

  function startTravel(next: Cloud, src: string, opts: GatherOpts) {
    if (!current || reduced || next.seed.length !== current.seed.length) {
      current = next;
      dest = next;
      perm = null;
      inverse = null;
      flight.p = 1;
      sourceId = src;
      upload();
      rebuildTrackers(false, opts.trackers);
      return;
    }
    if (flight.p < 1) {
      const snap = snapshot(flight.p);
      if (snap) current = snap;
    }
    dest = next;
    flight.swarm = opts.travel === "swarm";
    flight.hang = hangFor(opts.gather);
    flight.sharp = sharpFor(opts.splash);
    flight.dur = flightSeconds(opts.gather);
    flight.p = 0;
    const n = current.seed.length;
    if (flight.swarm) {
      shuffleSalt = (shuffleSalt + 0x9e3779b1) >>> 0;
      perm = shuffleIndices(n, shuffleSalt);
      inverse = new Uint32Array(n);
      for (let i = 0; i < n; i++) inverse[perm[i]] = i;
    } else {
      perm = null;
      inverse = null;
    }
    sourceId = src;
    upload();
    rebuildTrackers(true, opts.trackers);
  }

  function finishTravel() {
    const snap = snapshot(1);
    if (snap) current = snap;
    dest = current;
    perm = null;
    inverse = null;
    flight.p = 1;
    upload();
  }

  // ------------------------------------------------------------ lamps

  function strike(opts: GatherOpts) {
    if (!current) return;
    // Strike near a bright part of the picture, a little in front of it,
    // and not on top of the lamp before.
    const feats = targetFeats();
    const n = current.seed.length;
    const prev = lamps[(lampTurn + lamps.length - 1) % lamps.length];
    let at: ReturnType<typeof placedAt> = null;
    for (let k = 0; k < 8; k++) {
      const i =
        feats.length > 0
          ? feats[Math.floor(Math.random() * feats.length)]
          : Math.floor(Math.random() * n);
      at = placedAt(i, opts);
      if (!at || !prev.on) break;
      if (Math.hypot(at.x - prev.x, at.y - prev.y) > 0.25) break;
    }
    const lamp = lamps[lampTurn];
    lampTurn = (lampTurn + 1) % lamps.length;
    lamp.x = (at ? at.x : 0) + (Math.random() - 0.5) * 0.12;
    lamp.y = (at ? at.y : 0) + (Math.random() - 0.5) * 0.12;
    lamp.z = (at ? at.z : 0) + 0.04 + Math.random() * 0.12;
    lamp.age = 0;
    lamp.on = true;
  }

  // ------------------------------------------------------------ geometry

  function driftOpts(opts: GatherOpts): DriftOpts {
    return {
      drift: reduced ? 0 : opts.drift / 100,
      angle: (opts.lineAngle * Math.PI) / 180,
      offset: opts.lineOffset,
      side: opts.fadeSide,
    };
  }

  function placedAt(i: number, opts: GatherOpts) {
    if (!current) return null;
    const n = current.seed.length;
    if (i < 0 || i >= n) return null;
    const to = dest && dest.seed.length === n ? dest : current;
    const j = perm ? perm[i] : i;
    const hi = i * 3;
    const di = j * 3;
    return placePoint(
      [current.home[hi], current.home[hi + 1], current.home[hi + 2]],
      [to.home[di], to.home[di + 1], to.home[di + 2]],
      current.seed[i],
      flight,
      time,
      driftOpts(opts),
      opts.depth / 100,
    );
  }

  function cssAt(x: number, y: number, z: number) {
    const p = project(x, y, z, shown);
    if (!Number.isFinite(p.ndcX) || !Number.isFinite(p.ndcY)) return null;
    return { ...ndcToCss(p.ndcX, p.ndcY, cssW, cssH), persp: p.persp };
  }

  function resize() {
    const parent = host.gl.parentElement ?? host.gl;
    const rect = parent.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    for (const canvas of [host.gl, host.hud, host.line]) {
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    gl.viewport(0, 0, host.gl.width, host.gl.height);
    view.aspect = w / h;
  }

  function wakeUniform() {
    const out = new Float32Array(24);
    wakes.forEach((w, k) => {
      const age = time - w.t;
      const env = (1 - Math.exp(-age / 0.04)) * Math.exp(-age / 0.8);
      out[k * 4] = w.x;
      out[k * 4 + 1] = w.y;
      out[k * 4 + 2] = w.dx * w.mag * env;
      out[k * 4 + 3] = w.dy * w.mag * env;
    });
    return out;
  }

  function setCursor(opts: GatherOpts) {
    const key = `${drawPaper}|${opts.lightColor}`;
    if (key === cursorKey) return;
    cursorKey = key;
    const ink = drawPaper === "light" ? INK_ON_LIGHT : INK_ON_DARK;
    const halo = drawPaper === "light" ? GROUND_LIGHT : GROUND_DARK;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><circle cx='13' cy='13' r='7.5' fill='none' stroke='${halo}' stroke-opacity='.55' stroke-width='3'/><circle cx='13' cy='13' r='7.5' fill='none' stroke='${ink}' stroke-width='1.2'/><circle cx='13' cy='13' r='2.2' fill='${opts.lightColor}'/></svg>`;
    host.gl.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 13 13, crosshair`;
  }

  // ------------------------------------------------------------ frame

  function frame() {
    const now = performance.now();
    const rawDt = (now - last) / 1000;
    const dt = Math.min(0.1, Math.max(0, rawDt));
    last = now;
    time += dt;
    const opts = host.getOpts();
    const nowSec = now / 1000;
    if (told) hint = Math.max(0, hint - dt / 0.8);

    // Halve the field once if this machine cannot hold 30 fps.
    if (!slow.done && opts.pointCount === 0 && time > 4 && rawDt < 0.25) {
      slow.n += 1;
      slow.sum += rawDt;
      if (slow.n >= 90) {
        if (slow.sum / slow.n > 1 / 30 && autoCount > 131072) {
          autoCount /= 2;
          slow = { n: 0, sum: 0, done: false };
        } else {
          slow.done = true;
        }
      }
    }
    if (autoCount === 0) autoCount = autoPointCount();
    const wantCount = opts.pointCount > 0 ? opts.pointCount : autoCount;

    if (!primed) {
      drawPaper = opts.paper;
      drawTone = opts.tone;
      drawCount = wantCount;
      primed = true;
    }

    const plates = opts.plates.length > 0 ? opts.plates : ["sphere"];
    const index =
      ((opts.index % plates.length) + plates.length) % plates.length;
    const src = plates[index] ?? "sphere";

    const appearanceChanged =
      opts.paper !== drawPaper ||
      opts.tone !== drawTone ||
      wantCount !== drawCount;
    if (!dipping && appearanceChanged) {
      fadeVel = -1;
      dipping = true;
    }
    if (dipping && fade <= 0 && fadeVel < 0) {
      const cloud = getCloud(src, opts.paper, opts.tone, wantCount);
      if (cloud) {
        drawPaper = opts.paper;
        drawTone = opts.tone;
        drawCount = wantCount;
        current = cloud;
        dest = cloud;
        perm = null;
        inverse = null;
        flight.p = 1;
        sourceId = src;
        upload();
        rebuildTrackers(false, opts.trackers);
        fadeVel = 1;
        dipping = false;
      }
    }
    fade = clamp(fade + (fadeVel * dt) / 0.4, 0, 1);
    if (fade >= 1 && fadeVel > 0) fadeVel = 0;

    if (!dipping && src !== sourceId) {
      const cloud = getCloud(src, drawPaper, drawTone, drawCount);
      if (cloud) startTravel(cloud, src, opts);
    }
    if (flight.p < 1) {
      flight.p = Math.min(1, flight.p + dt / Math.max(0.1, flight.dur));
      if (flight.p >= 1 || reduced) finishTravel();
    }

    if (current && `${sourceId}|${opts.trackers}|${drawCount}` !== trackerKey) {
      rebuildTrackers(false, opts.trackers);
    }

    if (!noncePrimed) {
      lastNonce = opts.lightNonce;
      noncePrimed = true;
    } else if (opts.lightNonce !== lastNonce) {
      lastNonce = opts.lightNonce;
      strike(opts);
      interact();
    }
    for (const lamp of lamps) {
      if (!lamp.on) continue;
      lamp.age += dt;
      if (lamp.age > LIGHT_DECAY * 2) lamp.on = false;
    }
    while (wakes.length > 0 && time - wakes[0].t > 2) wakes.shift();

    const lineNow = `${opts.lineAngle}|${opts.lineOffset}|${opts.fadeSide}|${opts.drift}`;
    if (lineKey === "") lineKey = lineNow;
    else if (lineNow !== lineKey) {
      lineKey = lineNow;
      lineUntil = nowSec + 1.6;
    }

    resize();
    const sway = reduced ? { yaw: 0, pitch: 0 } : swayAt(time);
    shown = {
      ...view,
      yaw: view.yaw + sway.yaw,
      pitch: clamp(view.pitch + sway.pitch, -1.35, 1.35),
    };
    setCursor(opts);

    const onLight = drawPaper === "light";
    const [cr, cg, cb] = hexToRgb(onLight ? GROUND_LIGHT : GROUND_DARK);
    gl.clearColor(cr, cg, cb, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const n = drawn;
    const bufH = host.gl.height || 1;
    // Grain size and per-point light chosen so the picture keeps the same
    // overall brightness at any count or canvas size.
    const pointPx = clamp(
      bufH * 0.0028 * Math.sqrt(262144 / Math.max(1, n)),
      1.2 * dpr,
      3.2 * dpr,
    );
    const cover = (n * pointPx * pointPx) / (bufH * bufH);
    const gain = clamp(0.27 / (cover * 0.9 + 0.25), 0.05, 1);
    const scanT = (time % SCAN_SEC) / SCAN_SEC;
    const scanOn = opts.scan && scanT < 0.75;
    const scanZ =
      (0.55 - (scanT / 0.75) * 1.1) *
      FIT *
      (0.1 + (opts.depth / 100) * 1.3) *
      0.6;
    const [lr, lg, lb] = hexToRgb(opts.lightColor);
    const lampData = new Float32Array(12);
    const coreData = new Float32Array(12);
    let anyLamp = false;
    lamps.forEach((lamp, k) => {
      const env = lamp.on ? lightEnvelope(lamp.age) : 0;
      lampData.set([lamp.x, lamp.y, lamp.z, env], k * 4);
      if (env > 0.004) {
        const p = project(lamp.x, lamp.y, lamp.z, shown);
        coreData.set(
          [p.ndcX, p.ndcY, env * fade, 0.22 * p.persp * 2.35 * shown.zoom],
          k * 4,
        );
        anyLamp = true;
      }
    });
    const wakeData = wakeUniform();

    if (n > 0 && fade > 0) {
      if (anyLamp) {
        bindProgram(glowProg);
        gl.bindVertexArray(glowVao);
        gl.uniform4fv(gu.uCore, coreData);
        gl.uniform3f(gu.uLightColor, lr, lg, lb);
        gl.uniform2f(gu.uResolution, host.gl.width, host.gl.height);
        gl.uniform1f(gu.uPaper, onLight ? 1 : 0);
        if (onLight) gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
        else gl.blendFunc(gl.ONE, gl.ONE);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (onLight) gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
      else gl.blendFunc(gl.ONE, gl.ONE);

      const passes: [
        WebGLProgram,
        Record<string, WebGLUniformLocation | null>,
        boolean,
      ][] = [[pointProg, pu, false]];
      if (opts.trails && opts.drift > 0.3 && !reduced)
        passes.push([trailProg, tu, true]);
      for (const [prog, u, isLine] of passes) {
        bindProgram(prog);
        gl.uniform1f(u.uP, flight.p);
        gl.uniform1f(u.uSwarm, flight.swarm ? 1 : 0);
        gl.uniform1f(u.uHang, flight.hang);
        gl.uniform1f(u.uSharp, flight.sharp);
        gl.uniform1f(u.uTime, time);
        gl.uniform1f(u.uDrift, reduced ? 0 : opts.drift / 100);
        gl.uniform1f(u.uLineAngle, (opts.lineAngle * Math.PI) / 180);
        gl.uniform1f(u.uLineOffset, opts.lineOffset);
        gl.uniform1f(u.uFadeSide, opts.fadeSide);
        gl.uniform1f(u.uDepth, opts.depth / 100);
        gl.uniform1f(u.uYaw, shown.yaw);
        gl.uniform1f(u.uPitch, shown.pitch);
        gl.uniform1f(u.uZoom, shown.zoom);
        gl.uniform2f(u.uResolution, host.gl.width, host.gl.height);
        gl.uniform1f(u.uPointSize, pointPx);
        gl.uniform4fv(u.uLamp, lampData);
        gl.uniform4fv(u.uWake, wakeData);
        gl.uniform1f(u.uTail, 0.24);
        gl.uniform1f(u.uPaper, onLight ? 1 : 0);
        gl.uniform1f(u.uTrue, drawTone === "true" ? 1 : 0);
        gl.uniform1f(u.uFade, fade);
        gl.uniform1f(u.uGain, isLine ? Math.min(1, gain * 3) : gain);
        gl.uniform1f(u.uLine, isLine ? 1 : 0);
        gl.uniform3f(u.uLightColor, lr, lg, lb);
        gl.uniform1f(
          u.uScan,
          scanOn ? Math.sin((Math.PI * scanT) / 0.75) ** 0.6 : 0,
        );
        gl.uniform1f(u.uScanZ, scanZ);
        if (isLine) {
          gl.bindVertexArray(trailVao);
          gl.drawArraysInstanced(gl.LINES, 0, 2, Math.floor(n / 3));
        } else {
          gl.bindVertexArray(pointVao);
          gl.drawArrays(gl.POINTS, 0, n);
        }
      }
      gl.bindVertexArray(null);
    }

    drawHud(opts, scanOn ? scanZ : null, dt);
    drawVeil(opts, clamp((lineUntil - nowSec) / 0.6, 0, 1));

    if (!presampled && current) {
      presampled = true;
      const queue = plates.filter((id) => id !== sourceId);
      const idle =
        window.requestIdleCallback ??
        ((cb: IdleRequestCallback) =>
          window.setTimeout(
            () =>
              cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline),
            400,
          ));
      let cursor = 0;
      const step = () => {
        if (cursor >= queue.length) return;
        getCloud(queue[cursor], drawPaper, drawTone, drawCount);
        cursor += 1;
        if (cursor < queue.length) idle(step);
      };
      idle(step);
    }

    raf = requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------ overlay

  function track(ctx: CanvasRenderingContext2D, value: string) {
    (
      ctx as CanvasRenderingContext2D & { letterSpacing: string }
    ).letterSpacing = value;
  }

  const sign = (v: number) => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(2)}`;

  function drawHud(opts: GatherOpts, scanZ: number | null, dt: number) {
    hud.setTransform(dpr, 0, 0, dpr, 0, 0);
    hud.clearRect(0, 0, cssW, cssH);
    const pad = clamp(cssW * 0.03, 16, 44);
    const onLight = drawPaper === "light";
    const word = onLight ? INK_ON_LIGHT : INK_ON_DARK;
    const faint = onLight ? "rgba(16,16,18,0.44)" : "rgba(236,236,232,0.4)";
    const dim = onLight ? "rgba(16,16,18,0.66)" : "rgba(236,236,232,0.64)";
    const ink = onLight ? "16,16,18" : "255,255,255";
    const label = isPlateId(sourceId) ? PLATE_LABELS[sourceId] : "Picture";
    const halo = onLight ? GROUND_LIGHT : GROUND_DARK;

    hud.textBaseline = "top";
    hud.shadowColor = halo;
    hud.shadowBlur = 6;
    hud.fillStyle = word;
    hud.textAlign = "left";
    hud.font = '500 15px Manrope, "Helvetica Neue", Arial, sans-serif';
    track(hud, "0.6em");
    hud.fillText("GATHER", pad, pad);
    hud.font = '300 9px Manrope, "Helvetica Neue", Arial, sans-serif';
    track(hud, "0.3em");
    hud.fillStyle = faint;
    hud.fillText(label.toUpperCase(), pad, pad + 27);
    hud.fillText(`${drawCount.toLocaleString("en-US")} POINTS`, pad, pad + 44);

    hud.globalAlpha = 0.85;
    hud.fillStyle = word;
    hud.font = '300 24px "Noto Serif TC", "Songti TC", serif';
    track(hud, "0px");
    hud.textAlign = "right";
    hud.fillText("聚", cssW - pad, pad);
    hud.globalAlpha = 1;

    if (hint > 0.02) {
      hud.globalAlpha = hint;
      hud.fillStyle = dim;
      hud.font = '300 10px Manrope, "Helvetica Neue", Arial, sans-serif';
      track(hud, "0.42em");
      hud.textAlign = "center";
      hud.fillText(
        "DROP IN UP TO FOUR PICTURES · SPACE TURNS THE PAGE · S LIGHTS IT",
        cssW / 2,
        pad * 0.5,
      );
      hud.globalAlpha = 1;
    }
    hud.shadowBlur = 0;
    if (!current) return;

    // ---- trackers
    type Row = { tr: Tracker; x: number; y: number; z: number; alpha: number };
    const rows: Row[] = [];
    if (opts.track || opts.links) {
      for (const tr of trackers) {
        if (tr.roam) {
          const period = 4 + 4 * tr.seed;
          const cyc = Math.floor(time / period + tr.seed);
          if (cyc !== tr.cycle) {
            tr.cycle = cyc;
            tr.slot = roamSlot(opts);
          }
        }
        const at = placedAt(tr.slot, opts);
        if (!at) continue;
        const css = cssAt(at.x, at.y, at.z);
        if (!css) continue;
        if (!Number.isFinite(tr.sx)) {
          tr.sx = tr.hx = css.sx;
          tr.sy = tr.hy = css.sy;
        }
        if (!tr.locked && time >= tr.lockAt) {
          tr.locked = true;
          tr.since = 0;
        }
        if (tr.locked) {
          tr.since += dt;
          const k = reduced ? 1 : 1 - Math.exp(-dt * 18);
          tr.sx += (css.sx - tr.sx) * k;
          tr.sy += (css.sy - tr.sy) * k;
        } else {
          // seeking: jump between guesses near the last place it held
          if (time >= tr.nextHop) {
            tr.nextHop = time + 0.08 + 0.14 * Math.random();
            tr.hx = tr.sx + (Math.random() - 0.5) * 120;
            tr.hy = tr.sy + (Math.random() - 0.5) * 120;
          }
          const k = 1 - Math.exp(-dt * 10);
          tr.sx += (tr.hx - tr.sx) * k;
          tr.sy += (tr.hy - tr.sy) * k;
        }
        rows.push({
          tr,
          x: at.x,
          y: at.y,
          z: at.z,
          alpha: tr.roam ? at.alpha : 1,
        });
      }
    }

    hud.lineWidth = 1;
    hud.font = '500 9px Manrope, "Helvetica Neue", Arial, sans-serif';
    track(hud, "1.5px");
    hud.textAlign = "left";
    hud.textBaseline = "alphabetic";

    if (opts.links) {
      const limit = opts.trackers === "dense" ? 0.24 : 0.42;
      for (let a = 0; a < rows.length; a++) {
        const A = rows[a];
        if (!A.tr.locked || A.tr.roam) continue;
        for (let b = a + 1; b < rows.length; b++) {
          const B = rows[b];
          if (!B.tr.locked || B.tr.roam) continue;
          const d = Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z);
          if (d > limit) continue;
          hud.strokeStyle = `rgba(${ink},${(0.55 * (1 - d / limit)).toFixed(3)})`;
          hud.beginPath();
          hud.moveTo(A.tr.sx, A.tr.sy);
          hud.lineTo(B.tr.sx, B.tr.sy);
          hud.stroke();
        }
      }
      // each lit lamp reaches to the three locked trackers nearest it
      for (const lamp of lamps) {
        const env = lamp.on ? lightEnvelope(lamp.age) : 0;
        if (env < 0.05) continue;
        const at = cssAt(lamp.x, lamp.y, lamp.z);
        if (!at) continue;
        const near = rows
          .filter((r) => r.tr.locked && !r.tr.roam)
          .map((r) => ({
            r,
            d: Math.hypot(r.x - lamp.x, r.y - lamp.y, r.z - lamp.z),
          }))
          .sort((p, q) => p.d - q.d)
          .slice(0, 3);
        hud.strokeStyle = `rgba(${ink},${(0.8 * Math.min(1, env)).toFixed(3)})`;
        for (const { r } of near) {
          hud.beginPath();
          hud.moveTo(at.sx, at.sy);
          hud.lineTo(r.tr.sx, r.tr.sy);
          hud.stroke();
        }
      }
    }

    if (opts.track) {
      for (const row of rows) {
        const { tr } = row;
        const near = clamp((row.z / 0.4) * 0.5 + 0.5, 0, 1);
        const pulse =
          tr.locked && tr.since < 0.3 ? 1 + 1.2 * (1 - tr.since / 0.3) : 1;
        const h =
          (6 + 7 * near) * (opts.trackers === "dense" ? 0.75 : 1) * pulse;
        const arm = h * 0.45;
        const alpha = tr.locked
          ? 0.8 * row.alpha
          : 0.35 + 0.2 * Math.sin(time * 31 + tr.id * 1.7);
        if (alpha < 0.02) continue;
        hud.strokeStyle = `rgba(${ink},${alpha.toFixed(3)})`;
        hud.fillStyle = hud.strokeStyle;
        hud.beginPath();
        for (const [cx, cy] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ] as const) {
          const px = Math.round(tr.sx + cx * h) + 0.5;
          const py = Math.round(tr.sy + cy * h) + 0.5;
          hud.moveTo(px - cx * arm, py);
          hud.lineTo(px, py);
          hud.lineTo(px, py - cy * arm);
        }
        hud.moveTo(tr.sx - 2, tr.sy);
        hud.lineTo(tr.sx + 2, tr.sy);
        hud.moveTo(tr.sx, tr.sy - 2);
        hud.lineTo(tr.sx, tr.sy + 2);
        hud.stroke();
        const id = String(tr.id).padStart(2, "0");
        const text = !tr.locked
          ? `${id}  SEEK`
          : opts.trackers === "dense"
            ? `${id}  ${sign(row.z)}`
            : `${id}  ${sign(row.x)} ${sign(row.y)} ${sign(row.z)}`;
        hud.fillText(text, tr.sx + h + 5, tr.sy - h + 8);
      }
    } else if (opts.links) {
      hud.fillStyle = `rgba(${ink},0.7)`;
      for (const row of rows)
        if (row.tr.locked) hud.fillRect(row.tr.sx - 1, row.tr.sy - 1, 2, 2);
    }

    // ---- ruler and readouts
    if (opts.marks) {
      const F = FRAME;
      hud.strokeStyle = `rgba(${ink},${onLight ? 0.09 : 0.11})`;
      hud.beginPath();
      const seg = (x0: number, y0: number, x1: number, y1: number) => {
        const a = cssAt(x0, y0, 0);
        const b = cssAt(x1, y1, 0);
        if (!a || !b) return;
        hud.moveTo(a.sx, a.sy);
        hud.lineTo(b.sx, b.sy);
      };
      for (let i = 0; i <= 32; i++) {
        const o = (i / 32) * 2 * F - F;
        const t = i % 8 === 0 ? 0.04 : i % 4 === 0 ? 0.026 : 0.013;
        seg(o, F, o, F + t);
        seg(o, -F, o, -F - t);
        seg(-F, o, -F - t, o);
        seg(F, o, F + t, o);
      }
      for (const [cx, cy] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ] as const) {
        seg(cx * (F - 0.035), cy * F, cx * (F + 0.035), cy * F);
        seg(cx * F, cy * (F - 0.035), cx * F, cy * (F + 0.035));
      }
      hud.stroke();

      const plates = opts.plates.length > 0 ? opts.plates : ["sphere"];
      const at = ((opts.index % plates.length) + plates.length) % plates.length;
      const read = (
        x: number,
        y: number,
        text: string,
        align: CanvasTextAlign,
      ) => {
        const p = cssAt(x, y, 0);
        if (!p || !text) return;
        hud.textAlign = align;
        hud.fillStyle = `rgba(${ink},0.19)`;
        hud.fillText(text, p.sx, p.sy);
      };
      read(
        -F,
        F + 0.08,
        `${String(at + 1).padStart(2, "0")} / ${String(plates.length).padStart(2, "0")}   ${label.toUpperCase().slice(0, 22)}`,
        "left",
      );
      read(F, F + 0.08, `DRIFT ${Math.round(opts.drift)}`, "right");
      read(-F, -F - 0.1, `${drawCount.toLocaleString("en-US")} PTS`, "left");
      read(F, -F - 0.1, scanZ === null ? "" : `SCAN Z ${sign(scanZ)}`, "right");
      hud.textAlign = "left";
    }
  }

  /** The drift line and its wind, shown for a moment after it changes. */
  function drawVeil(opts: GatherOpts, opacity: number) {
    line.setTransform(dpr, 0, 0, dpr, 0, 0);
    line.clearRect(0, 0, cssW, cssH);
    if (opacity <= 0) return;
    const ang = (opts.lineAngle * Math.PI) / 180;
    const tx = Math.cos(ang);
    const ty = Math.sin(ang);
    const nx = -ty * opts.fadeSide;
    const ny = tx * opts.fadeSide;
    const ox = -ty * opts.lineOffset * FIT;
    const oy = tx * opts.lineOffset * FIT;
    const reach = 0.8;
    const wind = (0.1 + 0.4 * (opts.drift / 100)) * FIT;
    const a = cssAt(ox - tx * reach, oy - ty * reach, 0);
    const b = cssAt(ox + tx * reach, oy + ty * reach, 0);
    const c = cssAt(ox, oy, 0);
    const d = cssAt(ox + nx * wind, oy + ny * wind, 0);
    if (!a || !b || !c || !d) return;
    line.strokeStyle = "#fff";
    line.globalAlpha = 0.5 * opacity;
    line.lineWidth = 1;
    line.beginPath();
    line.moveTo(a.sx, a.sy);
    line.lineTo(b.sx, b.sy);
    line.moveTo(c.sx, c.sy);
    line.lineTo(d.sx, d.sy);
    line.stroke();
    line.beginPath();
    line.arc(d.sx, d.sy, 3.5, 0, Math.PI * 2);
    line.stroke();
    line.globalAlpha = 1;
  }

  // ------------------------------------------------------------ input

  function onDown(e: PointerEvent) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    host.gl.setPointerCapture(e.pointerId);
    host.gl.style.cursor = "grabbing";
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
    interact();
  }

  /** Hover: the mouse leaves a short wake that pushes the sand. */
  function hover(e: PointerEvent) {
    if (e.pointerType !== "mouse" || reduced) return;
    const rect = host.gl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    // Velocity from the event clock, so moves inside one frame still count.
    const at = e.timeStamp / 1000;
    const prev = lastMouse;
    lastMouse = { x, y, t: at };
    if (!prev || at - prev.t > 0.2 || at <= prev.t) return;
    const aspect = rect.width / Math.max(1, rect.height);
    const vx = ((x - prev.x) * aspect) / (at - prev.t);
    const vy = (y - prev.y) / (at - prev.t);
    const speed = Math.hypot(vx, vy);
    if (speed < 0.15) return;
    const tail = wakes[wakes.length - 1];
    if (
      tail &&
      time - tail.t < 0.05 &&
      Math.hypot((x - tail.x) * aspect, y - tail.y) < 0.04
    )
      return;
    wakes.push({
      x,
      y,
      dx: vx / speed / aspect,
      dy: vy / speed,
      mag: clamp(speed * 0.022, 0.01, 0.07),
      t: time,
    });
    if (wakes.length > 6) wakes.shift();
  }

  function onMove(e: PointerEvent) {
    const prev = pointers.get(e.pointerId);
    if (!prev) {
      hover(e);
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    prev.x = e.clientX;
    prev.y = e.clientY;
    if (pointers.size === 1) {
      view.yaw -= dx * 0.006;
      view.pitch = clamp(view.pitch + dy * 0.006, -1.3, 1.3);
    } else if (pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0 && dist > 0) {
        view.zoom = clamp(view.zoom * (pinch / dist), ZOOM_MIN, ZOOM_MAX);
      }
      pinch = dist;
    }
  }

  function onUp(e: PointerEvent) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (pointers.size === 0) cursorKey = "";
  }

  function onLeave() {
    lastMouse = null;
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = clamp(e.deltaY, -60, 60);
    view.zoom = clamp(view.zoom * Math.exp(0.0022 * delta), ZOOM_MIN, ZOOM_MAX);
    interact();
  }

  function onDbl() {
    view.yaw = 0;
    view.pitch = 0;
    view.zoom = 1;
  }

  function onMenu(e: Event) {
    e.preventDefault();
  }

  function onMotion() {
    reduced = reducedMedia.matches;
  }

  host.gl.style.touchAction = "none";
  host.gl.addEventListener("pointerdown", onDown);
  host.gl.addEventListener("pointermove", onMove);
  host.gl.addEventListener("pointerup", onUp);
  host.gl.addEventListener("pointercancel", onUp);
  host.gl.addEventListener("pointerleave", onLeave);
  host.gl.addEventListener("wheel", onWheel, { passive: false });
  host.gl.addEventListener("dblclick", onDbl);
  host.gl.addEventListener("contextmenu", onMenu);
  reducedMedia.addEventListener("change", onMotion);
  const parent = host.gl.parentElement ?? host.gl;
  const ro = new ResizeObserver(() => resize());
  ro.observe(parent);
  resize();
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.gl.removeEventListener("pointerdown", onDown);
      host.gl.removeEventListener("pointermove", onMove);
      host.gl.removeEventListener("pointerup", onUp);
      host.gl.removeEventListener("pointercancel", onUp);
      host.gl.removeEventListener("pointerleave", onLeave);
      host.gl.removeEventListener("wheel", onWheel);
      host.gl.removeEventListener("dblclick", onDbl);
      host.gl.removeEventListener("contextmenu", onMenu);
      reducedMedia.removeEventListener("change", onMotion);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vert);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function locations(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: readonly string[],
) {
  const out: Record<string, WebGLUniformLocation | null> = {};
  for (const name of names) out[name] = gl.getUniformLocation(program, name);
  return out;
}
