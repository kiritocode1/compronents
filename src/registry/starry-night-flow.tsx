"use client";

/**
 * Starry Night Flow: a painting that sleeps until you wake it.
 *
 * Two layers sit on top of each other. Underneath is the painting itself, held
 * down to a fraction of its brightness so it reads as one dark, still canvas.
 * Over it sits a Floyd-Steinberg dithered point cloud, one GPU point per "on"
 * pixel, colored from the original. Asleep the points are faint and pinned to
 * their home pixel, so all you see is the painting.
 *
 * A region map splits the canvas into five parts (cypress, village, night sky,
 * swirls, stars). Clicking one wakes it: a front expands outward from the exact
 * pixel you hit, and as it passes, the painting there lifts and its points take
 * off, drifting along the brushstroke direction recovered from a structure
 * tensor over the luminance field. Click a woken region again to put it back to
 * sleep. Only the part you touched moves, so the painting comes alive in pieces.
 *
 * Inspired by Joshua Garcia's Still Night. The brushstroke flow is computed from
 * the image itself; only the region split is authored per painting.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/starry-night-flow";

/** Region ids 1..5 keyed to the flat colors in the region map. */
const REGION_COLORS: readonly (readonly [number, number, number])[] = [
  [40, 200, 90], // 1 cypress
  [200, 140, 60], // 2 village and hills
  [40, 60, 200], // 3 night sky
  [110, 180, 240], // 4 swirls
  [250, 220, 50], // 5 stars and moon
];

const REGION_COUNT = REGION_COLORS.length;

export interface StarryNightFlowProps {
  /** Painting URL. Must be CORS-readable (drawn into a canvas for sampling). */
  src?: string;
  /**
   * Region map URL: flat colors matching REGION_COLORS, one per clickable part.
   * Must be lossless (PNG). Pass null to make the whole painting one region.
   */
  regionMap?: string | null;
  /** Canvas clear color in the letterbox around the painting. */
  background?: string;
  /** Working resolution: the painting is sampled at this width in pixels. */
  resolution?: number;
  /** Fraction of dithered points kept (0.2 to 1). */
  density?: number;
  /** Multiplier on the auto-computed particle size. */
  pointScale?: number;
  /** Brightness of the painting under a sleeping region. */
  dormantDim?: number;
  /** Brightness of the painting under a woken region. */
  wakeDim?: number;
  /** How much color a sleeping region keeps (0 = grey, 1 = fully painted). */
  dormantSaturation?: number;
  /** Opacity of the dither points over a sleeping region. */
  dormantPoints?: number;
  /** Brightness of the points over a woken region. */
  wakeGain?: number;
  /** Seconds for the bloom to travel from the click to the edge of its region. */
  revealDuration?: number;
  /** Seconds per drift lifecycle. */
  cyclePeriod?: number;
  /** Fraction of the cycle spent drifting (the rest is rest). */
  driftFrac?: number;
  /** Max drift distance in image UV units. */
  maxDrift?: number;
  /** Minimum stroke coherence required to join the flow (0.01 to 0.5). */
  flowThreshold?: number;
  /** Wind gust intensity (0 = steady drift, 1 = strong surges). */
  gustAmplitude?: number;
  /** Seconds per gust cycle. */
  gustPeriod?: number;
  /** Blend from original color (0) toward peak-boosted luminous color (1). */
  colorBoost?: number;
  /** Lift applied to the region under the cursor, so parts read as clickable. */
  hoverLift?: number;
  /** Enable clicking and hovering. */
  interactive?: boolean;
  /** Caption shown until the first region is woken. Pass null to hide it. */
  hint?: string | null;
  className?: string;
}

/**
 * Wake state, shared verbatim by both passes. The painting layer and the point
 * layer have to agree on where the bloom front is, or the region would light up
 * twice at slightly different edges.
 */
const WAKE_GLSL = `
uniform float u_regionActive[5];   // eased 0..1 intensity
uniform vec2  u_regionOrigin[5];   // click position in image UV
uniform float u_regionRadius[5];   // eased bloom front, 0..1 of u_regionMaxDist
uniform float u_regionMaxDist[5];  // click to farthest pixel of that region
uniform float u_hoverRegion;       // 0 = none, else region id
uniform float u_hoverAmount;
uniform float u_aspect;            // image width / height

float wakeAt(vec2 uv, int rIdx) {
  if (rIdx < 0 || rIdx >= 5) return 0.0;
  float intensity = u_regionActive[rIdx];
  if (intensity <= 0.001) return 0.0;
  vec2 d = uv - u_regionOrigin[rIdx];
  d.x *= u_aspect;
  // Normalizing by this region's own extent means every region takes the same
  // time to fill, whether it is the moon or the whole sky.
  float norm = length(d) / max(u_regionMaxDist[rIdx], 0.001);
  float front = u_regionRadius[rIdx];
  return smoothstep(front, front - 0.14, norm) * intensity;
}

float hoverAt(float rid, float wake) {
  return (u_hoverRegion > 0.5 && abs(u_hoverRegion - rid) < 0.5)
    ? u_hoverAmount * (1.0 - wake)
    : 0.0;
}
`;

const QUAD_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_uv;
uniform vec4 u_fit;
out vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_uv * u_fit.xy + u_fit.zw, 0.0, 1.0);
}`;

const QUAD_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_painting;
uniform sampler2D u_regions;
uniform float u_dormantDim;
uniform float u_wakeDim;
uniform float u_dormantSat;
${WAKE_GLSL}
out vec4 fragColor;
void main() {
  vec3 col = texture(u_painting, v_uv).rgb;
  float rid = floor(texture(u_regions, v_uv).r * 255.0 + 0.5);
  float wake = wakeAt(v_uv, int(rid) - 1);
  // Waking is mostly a return of color, not a jump in brightness: asleep the
  // paint is pulled toward its own grey, and the bloom front hands it back.
  vec3 grey = vec3(dot(col, vec3(0.2126, 0.7152, 0.0722)));
  vec3 shown = mix(mix(grey, col, u_dormantSat), col, wake);
  float gain = mix(u_dormantDim, u_wakeDim, wake) + hoverAt(rid, wake);
  fragColor = vec4(shown * gain, 1.0);
}`;

const POINT_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_homePos;    // image UV, y down
layout(location = 1) in vec3 a_color;
layout(location = 2) in float a_coherence; // 0 = isotropic, 1 = strong stroke
layout(location = 3) in float a_angle;     // stroke orientation, radians
layout(location = 4) in float a_region;    // 0 = unassigned, 1..5 = region id

uniform vec4  u_fit;        // uv -> clip: clip = uv * fit.xy + fit.zw
uniform float u_time;
uniform float u_pointSize;
uniform float u_cyclePeriod;
uniform float u_driftFrac;
uniform float u_maxDrift;
uniform float u_flowThreshold;
uniform float u_gustAmplitude;
uniform float u_gustPeriod;
${WAKE_GLSL}

out vec3  v_color;
out float v_alpha;
out float v_size;
out float v_wake;

float hash(vec2 p, vec2 k) { return fract(sin(dot(p, k)) * 43758.5453); }

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 pos = a_homePos;
  float wake = wakeAt(pos, int(a_region + 0.5) - 1);

  // Border particles hold still so the painting's edge never frays.
  float edgeDist = min(min(pos.x, 1.0 - pos.x), min(pos.y, 1.0 - pos.y));
  float edgeLock = smoothstep(0.0, 0.01, edgeDist);

  float flowStrength = smoothstep(u_flowThreshold * 0.5, u_flowThreshold, a_coherence);
  float coherenceEdge = smoothstep(u_flowThreshold, u_flowThreshold + 0.19, a_coherence);

  float alpha = 1.0;

  if (wake > 0.001 && flowStrength > 0.001) {
    vec2 flowDir = vec2(cos(a_angle), sin(a_angle));

    // Traveling gusts: three noise layers advected along the local stroke,
    // so speed surges travel in the direction the particles are moving.
    float gust = 1.0;
    if (u_gustAmplitude > 0.001) {
      float proj = dot(pos, flowDir);
      float perp = dot(pos, vec2(-flowDir.y, flowDir.x));
      float g1 = snoise(vec2(proj * 1.2 - u_time / u_gustPeriod, perp * 1.2));
      float g2 = snoise(vec2(proj * 2.0 - u_time / u_gustPeriod * 1.4, perp * 2.0 + 3.7));
      float g3 = snoise(vec2(proj * 2.8 - u_time / u_gustPeriod * 1.8, perp * 2.8 + 7.3));
      gust = 1.0 + (g1 * 0.5 + g2 * 0.3 + g3 * 0.2) * u_gustAmplitude;
    }

    // Per-particle personality: permanent speed offset, like flock momentum.
    float particleSpeed = 0.75 + 0.5 * hash(pos, vec2(94.17, 23.63));
    // Stroke fringe slows and thins: soft watercolor edge where coherence dies.
    float driftScale = mix(0.3, 1.0, coherenceEdge);

    float phase = hash(pos, vec2(78.233, 12.9898));
    float t = fract((u_time + phase * u_cyclePeriod) / u_cyclePeriod);

    float lifecycleAlpha = 0.0;
    if (t < u_driftFrac) {
      float driftT = t / u_driftFrac;
      lifecycleAlpha = smoothstep(0.0, 0.08, driftT) * (1.0 - smoothstep(0.80, 1.0, driftT));
      // Compound S-curve: linger at home, sweep through the middle, settle.
      float progress = smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, driftT));
      // Endpoint scatter blurs convergence seams between neighbors.
      float scatter = 0.6 + 0.8 * hash(pos, vec2(53.14, 91.73));
      pos += flowDir * (u_maxDrift * progress * flowStrength * driftScale
                        * gust * particleSpeed * scatter * edgeLock * wake);
    }

    // The lifecycle only takes hold as the bloom front passes, so the painting
    // dissolves into moving points rather than snapping into them.
    float cycling = flowStrength * driftScale * wake;
    alpha = mix(1.0, lifecycleAlpha * mix(0.3, 1.0, coherenceEdge), cycling);
  }

  gl_Position = vec4(pos * u_fit.xy + u_fit.zw, 0.0, 1.0);
  float size = u_pointSize * (0.8 + 0.4 * hash(a_homePos, vec2(12.9898, 4.1414)));
  gl_PointSize = size;
  v_size = size;
  v_color = a_color;
  v_alpha = alpha;
  v_wake = wake;
}`;

const POINT_FRAG = `#version 300 es
precision highp float;
in vec3  v_color;
in float v_alpha;
in float v_size;
in float v_wake;
uniform float u_colorBoost;
uniform float u_dormantPoints;
uniform float u_wakeGain;
uniform float u_dormantSat;
out vec4 fragColor;
void main() {
  float edge = 1.0;
  if (v_size > 1.5) {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    edge = smoothstep(0.5, 0.35, dist);
  }
  // Asleep the points are a faint grain over the painting; awake they carry it.
  float a = v_alpha * edge * mix(u_dormantPoints, 1.0, v_wake);
  if (a < 0.004) discard;

  float peak = max(v_color.r, max(v_color.g, v_color.b));
  vec3 boosted = v_color / max(peak, 0.001);
  vec3 lit = mix(v_color, boosted, u_colorBoost);
  vec3 grey = vec3(dot(v_color, vec3(0.2126, 0.7152, 0.0722)));
  vec3 col = mix(mix(grey, v_color, u_dormantSat), lit * u_wakeGain, v_wake);

  fragColor = vec4(col * a, a);
}`;

// sRGB byte -> linear [0, 1]
const LINEAR_LUT = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const s = i / 255;
  LINEAR_LUT[i] = s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Serpentine Floyd-Steinberg on linear luminance. Returns 1 for "on" pixels. */
function ditherMask(data: Uint8ClampedArray, w: number, h: number): Uint8Array {
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    lum[i] =
      0.2126 * LINEAR_LUT[data[j]] +
      0.7152 * LINEAR_LUT[data[j + 1]] +
      0.0722 * LINEAR_LUT[data[j + 2]];
  }
  const mask = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    const reversed = (y & 1) === 0;
    const dir = reversed ? -1 : 1;
    const startX = reversed ? w - 1 : 0;
    for (let i = 0; i < w; i++) {
      const x = startX + i * dir;
      const idx = y * w + x;
      const old = Math.min(1, Math.max(0, lum[idx]));
      const on = old >= 0.5;
      if (on) mask[idx] = 1;
      const err = old - (on ? 1 : 0);
      const nx = x + dir;
      const hasRight = nx >= 0 && nx < w;
      const below = idx + w;
      if (hasRight) lum[idx + dir] += err * (7 / 16);
      if (y + 1 < h) {
        if (x - dir >= 0 && x - dir < w) lum[below - dir] += err * (3 / 16);
        lum[below] += err * (5 / 16);
        if (hasRight) lum[below + dir] += err * (1 / 16);
      }
    }
  }
  return mask;
}

/**
 * Structure tensor flow field: per-pixel brushstroke orientation + coherence.
 * Sobel gradients, box-blurred tensor, eigen analysis. The stroke direction
 * is perpendicular to the dominant gradient.
 */
function computeFlowField(data: Uint8ClampedArray, w: number, h: number) {
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    lum[i] =
      (data[j] * 0.2126 + data[j + 1] * 0.7152 + data[j + 2] * 0.0722) / 255;
  }
  const jxx = new Float32Array(n);
  const jyy = new Float32Array(n);
  const jxy = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        lum[i - w + 1] +
        2 * lum[i + 1] +
        lum[i + w + 1] -
        lum[i - w - 1] -
        2 * lum[i - 1] -
        lum[i + w - 1];
      const gy =
        lum[i + w - 1] +
        2 * lum[i + w] +
        lum[i + w + 1] -
        lum[i - w - 1] -
        2 * lum[i - w] -
        lum[i - w + 1];
      jxx[i] = gx * gx;
      jyy[i] = gy * gy;
      jxy[i] = gx * gy;
    }
  }
  // Two separable box-blur passes approximate a Gaussian over the tensor.
  const radius = Math.max(2, Math.round(w / 200));
  for (const field of [jxx, jyy, jxy]) boxBlur(field, w, h, radius, 2);

  const coherence = new Float32Array(n);
  const angle = new Float32Array(n);
  let energySum = 0;
  for (let i = 0; i < n; i++) energySum += jxx[i] + jyy[i];
  const energyGate = (energySum / n) * 0.5 + 1e-9;
  for (let i = 0; i < n; i++) {
    const trace = jxx[i] + jyy[i];
    const diff = jxx[i] - jyy[i];
    const disc = Math.sqrt(diff * diff + 4 * jxy[i] * jxy[i]);
    const anisotropy = disc / (trace + 1e-9);
    // Gate by gradient energy so flat, noisy areas read as incoherent.
    const gate = Math.min(1, trace / (energyGate * 4));
    coherence[i] = anisotropy * gate;
    // Dominant gradient orientation, rotated 90 degrees onto the stroke.
    angle[i] = 0.5 * Math.atan2(2 * jxy[i], diff) + Math.PI / 2;
  }
  return { coherence, angle };
}

function boxBlur(
  field: Float32Array,
  w: number,
  h: number,
  r: number,
  passes: number,
) {
  const tmp = new Float32Array(field.length);
  for (let p = 0; p < passes; p++) {
    // horizontal
    for (let y = 0; y < h; y++) {
      let sum = 0;
      const row = y * w;
      for (let x = -r; x <= r; x++)
        sum += field[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = sum / (2 * r + 1);
        sum +=
          field[row + Math.min(w - 1, x + r + 1)] -
          field[row + Math.max(0, x - r)];
      }
    }
    // vertical
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let y = -r; y <= r; y++)
        sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        field[y * w + x] = sum / (2 * r + 1);
        sum +=
          tmp[Math.min(h - 1, y + r + 1) * w + x] -
          tmp[Math.max(0, y - r) * w + x];
      }
    }
  }
}

/**
 * Classify each pixel of the region map to a region id by nearest flat color.
 * Nearest match rather than exact: the map is drawn at the painting's working
 * size, and any resampling blends neighboring region colors at the seams.
 */
function classifyRegions(data: Uint8ClampedArray, n: number): Uint8Array {
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let k = 0; k < REGION_COUNT; k++) {
      const c = REGION_COLORS[k];
      const dr = r - c[0];
      const dg = g - c[1];
      const db = b - c[2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) {
        bestDist = d;
        best = k + 1;
      }
    }
    out[i] = best;
  }
  return out;
}

// Deterministic PRNG so the same density always keeps the same points.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
  }
  return program;
}

/** Locations of the shared wake uniforms within one program. */
function wakeLocations(gl: WebGL2RenderingContext, program: WebGLProgram) {
  return {
    active: gl.getUniformLocation(program, "u_regionActive"),
    origin: gl.getUniformLocation(program, "u_regionOrigin"),
    radius: gl.getUniformLocation(program, "u_regionRadius"),
    maxDist: gl.getUniformLocation(program, "u_regionMaxDist"),
    hoverRegion: gl.getUniformLocation(program, "u_hoverRegion"),
    hoverAmount: gl.getUniformLocation(program, "u_hoverAmount"),
    aspect: gl.getUniformLocation(program, "u_aspect"),
    fit: gl.getUniformLocation(program, "u_fit"),
  };
}

export default function StarryNightFlow({
  src = `${ASSET_BASE}/starry-night.webp`,
  regionMap = `${ASSET_BASE}/starry-night-regions.png`,
  background = "#0b0b0d",
  resolution = 640,
  density = 1,
  pointScale = 1,
  dormantDim = 0.4,
  wakeDim = 0.28,
  dormantSaturation = 0.33,
  dormantPoints = 0.22,
  wakeGain = 1.05,
  revealDuration = 1.1,
  cyclePeriod = 6,
  driftFrac = 0.9,
  maxDrift = 0.02,
  flowThreshold = 0.25,
  gustAmplitude = 0.75,
  gustPeriod = 10,
  colorBoost = 0.35,
  hoverLift = 0.08,
  interactive = true,
  hint = "Click a part of the painting to wake it",
  className,
}: StarryNightFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [woken, setWoken] = useState(false);

  const paramsRef = useRef({
    dormantDim,
    wakeDim,
    dormantSaturation,
    dormantPoints,
    wakeGain,
    revealDuration,
    cyclePeriod,
    driftFrac,
    maxDrift,
    flowThreshold,
    gustAmplitude,
    gustPeriod,
    colorBoost,
    hoverLift,
    pointScale,
    interactive,
  });
  paramsRef.current = {
    dormantDim,
    wakeDim,
    dormantSaturation,
    dormantPoints,
    wakeGain,
    revealDuration,
    cyclePeriod,
    driftFrac,
    maxDrift,
    flowThreshold,
    gustAmplitude,
    gustPeriod,
    colorBoost,
    hoverLift,
    pointScale,
    interactive,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let raf = 0;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    const loadImage = (url: string) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = url;
      return image.decode().then(() => image);
    };

    let cleanupScene: (() => void) | null = null;

    Promise.all([loadImage(src), regionMap ? loadImage(regionMap) : null])
      .then(([img, regionImg]) => {
        if (disposed) return;

        // ── CPU prep: sample, dither, flow field, regions, point extraction ──
        const imgW = Math.min(resolution, img.naturalWidth);
        const imgH = Math.round((imgW / img.naturalWidth) * img.naturalHeight);
        const work = document.createElement("canvas");
        work.width = imgW;
        work.height = imgH;
        const ctx = work.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, imgW, imgH);
        const data = ctx.getImageData(0, 0, imgW, imgH).data;

        const pixelCount = imgW * imgH;
        let regionAt: Uint8Array;
        if (regionImg) {
          ctx.clearRect(0, 0, imgW, imgH);
          // Nearest-neighbour keeps the flat region colors intact; smoothing
          // would invent blends along every boundary.
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(regionImg, 0, 0, imgW, imgH);
          regionAt = classifyRegions(
            ctx.getImageData(0, 0, imgW, imgH).data,
            pixelCount,
          );
        } else {
          regionAt = new Uint8Array(pixelCount).fill(1);
        }

        const mask = ditherMask(data, imgW, imgH);
        const { coherence, angle } = computeFlowField(data, imgW, imgH);

        const rand = mulberry32(42);
        const keepProb = Math.min(1, Math.max(0.2, density));
        let count = 0;
        const keep = new Uint8Array(pixelCount);
        for (let i = 0; i < mask.length; i++) {
          if (mask[i] && (keepProb >= 1 || rand() < keepProb)) {
            keep[i] = 1;
            count++;
          }
        }

        const homePos = new Float32Array(count * 2);
        const colors = new Uint8Array(count * 3);
        const cohArr = new Float32Array(count);
        const angArr = new Float32Array(count);
        const regArr = new Uint8Array(count);
        let idx = 0;
        for (let y = 0; y < imgH; y++) {
          for (let x = 0; x < imgW; x++) {
            const i = y * imgW + x;
            if (!keep[i]) continue;
            homePos[idx * 2] = x / imgW;
            homePos[idx * 2 + 1] = y / imgH;
            colors[idx * 3] = data[i * 4];
            colors[idx * 3 + 1] = data[i * 4 + 1];
            colors[idx * 3 + 2] = data[i * 4 + 2];
            cohArr[idx] = coherence[i];
            angArr[idx] = angle[i];
            regArr[idx] = regionAt[i];
            idx++;
          }
        }

        const imageAspect = imgW / imgH;

        // ── GPU setup: painting quad under a point cloud ──
        const quadProg = link(gl, QUAD_VERT, QUAD_FRAG);
        const pointProg = link(gl, POINT_VERT, POINT_FRAG);
        const quadWake = wakeLocations(gl, quadProg);
        const pointWake = wakeLocations(gl, pointProg);

        const buffers: WebGLBuffer[] = [];
        const makeBuffer = (arr: ArrayBufferView) => {
          const buf = gl.createBuffer()!;
          buffers.push(buf);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
          return buf;
        };

        const quadVao = gl.createVertexArray();
        gl.bindVertexArray(quadVao);
        makeBuffer(new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const pointVao = gl.createVertexArray();
        gl.bindVertexArray(pointVao);
        const attrib = (
          loc: number,
          arr: ArrayBufferView,
          size: number,
          type: number,
          normalized = false,
        ) => {
          makeBuffer(arr);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, type, normalized, 0, 0);
        };
        attrib(0, homePos, 2, gl.FLOAT);
        attrib(1, colors, 3, gl.UNSIGNED_BYTE, true);
        attrib(2, cohArr, 1, gl.FLOAT);
        attrib(3, angArr, 1, gl.FLOAT);
        attrib(4, regArr, 1, gl.UNSIGNED_BYTE);
        gl.bindVertexArray(null);

        // Painting texture for the base layer, at full source resolution.
        const paintingTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, paintingTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Region ids as a single-channel texture, sampled without interpolation
        // so a pixel never lands between two region ids.
        const regionTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, regionTex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.R8,
          imgW,
          imgH,
          0,
          gl.RED,
          gl.UNSIGNED_BYTE,
          regionAt,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
        gl.useProgram(quadProg);
        gl.uniform1i(gl.getUniformLocation(quadProg, "u_painting"), 0);
        gl.uniform1i(gl.getUniformLocation(quadProg, "u_regions"), 1);
        const uDormantDim = gl.getUniformLocation(quadProg, "u_dormantDim");
        const uWakeDim = gl.getUniformLocation(quadProg, "u_wakeDim");
        const uQuadSat = gl.getUniformLocation(quadProg, "u_dormantSat");

        // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
        gl.useProgram(pointProg);
        const u = (name: string) => gl.getUniformLocation(pointProg, name);
        const uTime = u("u_time");
        const uPointSize = u("u_pointSize");
        const uCyclePeriod = u("u_cyclePeriod");
        const uDriftFrac = u("u_driftFrac");
        const uMaxDrift = u("u_maxDrift");
        const uFlowThreshold = u("u_flowThreshold");
        const uGustAmplitude = u("u_gustAmplitude");
        const uGustPeriod = u("u_gustPeriod");
        const uColorBoost = u("u_colorBoost");
        const uDormantPoints = u("u_dormantPoints");
        const uWakeGain = u("u_wakeGain");
        const uPointSat = u("u_dormantSat");

        gl.disable(gl.DEPTH_TEST);
        const bg = background.match(/^#?([0-9a-f]{6})$/i)?.[1] ?? "0b0b0d";
        gl.clearColor(
          parseInt(bg.slice(0, 2), 16) / 255,
          parseInt(bg.slice(2, 4), 16) / 255,
          parseInt(bg.slice(4, 6), 16) / 255,
          1,
        );

        // ── Wake state, one slot per region ──
        const active = new Float32Array(REGION_COUNT); // eased intensity
        const target = new Float32Array(REGION_COUNT); // 0 asleep, 1 awake
        const origin = new Float32Array(REGION_COUNT * 2);
        const radius = new Float32Array(REGION_COUNT);
        const maxDist = new Float32Array(REGION_COUNT).fill(1);
        const wokenAt = new Float32Array(REGION_COUNT).fill(-1e9);
        let hoverRegion = 0;
        let hoverAmount = 0;

        /** Farthest pixel of this region from the click, so the bloom fills it. */
        const regionExtent = (rid: number, ux: number, uy: number) => {
          let far = 0;
          for (let y = 0; y < imgH; y++) {
            for (let x = 0; x < imgW; x++) {
              if (regionAt[y * imgW + x] !== rid) continue;
              const dx = (x / imgW - ux) * imageAspect;
              const dy = y / imgH - uy;
              const d = dx * dx + dy * dy;
              if (d > far) far = d;
            }
          }
          return Math.max(Math.sqrt(far), 0.05);
        };

        // ── Fit: contain the image, centered, aspect preserved ──
        const fit = { sx: 1, sy: 1 };
        const applySize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const cw = Math.max(1, Math.round(container.clientWidth * dpr));
          const ch = Math.max(1, Math.round(container.clientHeight * dpr));
          if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
          }
          gl.viewport(0, 0, cw, ch);
          const canvasAspect = cw / ch;
          if (canvasAspect > imageAspect) {
            fit.sx = imageAspect / canvasAspect;
            fit.sy = 1;
          } else {
            fit.sx = 1;
            fit.sy = canvasAspect / imageAspect;
          }
        };
        applySize();
        const ro = new ResizeObserver(applySize);
        ro.observe(container);

        // ── Pointer ──
        const toUV = (e: PointerEvent): [number, number] => {
          const rect = canvas.getBoundingClientRect();
          const clipX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const clipY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
          return [(clipX / fit.sx + 1) / 2, (1 - clipY / fit.sy) / 2];
        };
        const regionAtUV = (uv: [number, number]) => {
          if (uv[0] < 0 || uv[0] > 1 || uv[1] < 0 || uv[1] > 1) return 0;
          const x = Math.min(imgW - 1, Math.floor(uv[0] * imgW));
          const y = Math.min(imgH - 1, Math.floor(uv[1] * imgH));
          return regionAt[y * imgW + x];
        };

        const onDown = (e: PointerEvent) => {
          if (!paramsRef.current.interactive) return;
          const uv = toUV(e);
          const rid = regionAtUV(uv);
          if (rid < 1 || rid > REGION_COUNT) return;
          const k = rid - 1;
          if (target[k] > 0.5) {
            // Already awake: put it back to sleep, leaving the bloom in place.
            target[k] = 0;
            return;
          }
          target[k] = 1;
          origin[k * 2] = uv[0];
          origin[k * 2 + 1] = uv[1];
          maxDist[k] = regionExtent(rid, uv[0], uv[1]);
          radius[k] = 0;
          wokenAt[k] = performance.now();
          setWoken(true);
        };
        const onMove = (e: PointerEvent) => {
          if (!paramsRef.current.interactive) {
            hoverRegion = 0;
            return;
          }
          hoverRegion = regionAtUV(toUV(e));
        };
        const onLeave = () => {
          hoverRegion = 0;
        };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);

        const setWakeUniforms = (loc: ReturnType<typeof wakeLocations>) => {
          gl.uniform4f(loc.fit, 2 * fit.sx, -2 * fit.sy, -fit.sx, fit.sy);
          gl.uniform1fv(loc.active, active);
          gl.uniform2fv(loc.origin, origin);
          gl.uniform1fv(loc.radius, radius);
          gl.uniform1fv(loc.maxDist, maxDist);
          gl.uniform1f(loc.hoverRegion, hoverRegion);
          gl.uniform1f(loc.hoverAmount, hoverAmount);
          gl.uniform1f(loc.aspect, imageAspect);
        };

        // ── Render loop ──
        const start = performance.now();
        const frame = () => {
          if (disposed) return;
          raf = requestAnimationFrame(frame);
          const p = paramsRef.current;
          const now = performance.now();
          const t = (now - start) / 1000;

          for (let k = 0; k < REGION_COUNT; k++) {
            // Wake fast so a click feels answered, sleep slower so it settles.
            const rate = target[k] > active[k] ? 0.12 : 0.045;
            active[k] += (target[k] - active[k]) * rate;
            if (target[k] > 0.5) {
              const age = (now - wokenAt[k]) / 1000;
              const x = Math.min(1, age / Math.max(p.revealDuration, 0.05));
              radius[k] = x * x * (3 - 2 * x); // smoothstep front
            }
          }
          const hoverTarget = hoverRegion > 0 ? p.hoverLift : 0;
          hoverAmount += (hoverTarget - hoverAmount) * 0.1;

          gl.clear(gl.COLOR_BUFFER_BIT);

          // Base: the painting, held down where asleep and lifted where woken.
          gl.disable(gl.BLEND);
          // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
          gl.useProgram(quadProg);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, paintingTex);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, regionTex);
          setWakeUniforms(quadWake);
          gl.uniform1f(uDormantDim, p.dormantDim);
          gl.uniform1f(uWakeDim, p.wakeDim);
          gl.uniform1f(uQuadSat, p.dormantSaturation);
          gl.bindVertexArray(quadVao);
          gl.drawArrays(gl.TRIANGLES, 0, 6);

          // Points: faint grain asleep, the whole show awake.
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
          gl.useProgram(pointProg);
          setWakeUniforms(pointWake);

          // One source pixel spans this many canvas pixels; size points to cover.
          const basePointPx = Math.max(
            1,
            ((canvas.width * fit.sx) / imgW) * 1.25,
          );
          gl.uniform1f(uTime, t);
          gl.uniform1f(uPointSize, basePointPx * p.pointScale);
          gl.uniform1f(uCyclePeriod, p.cyclePeriod);
          gl.uniform1f(uDriftFrac, p.driftFrac);
          gl.uniform1f(uMaxDrift, p.maxDrift);
          gl.uniform1f(uFlowThreshold, p.flowThreshold);
          gl.uniform1f(uGustAmplitude, p.gustAmplitude);
          gl.uniform1f(uGustPeriod, p.gustPeriod);
          gl.uniform1f(uColorBoost, p.colorBoost);
          gl.uniform1f(uDormantPoints, p.dormantPoints);
          gl.uniform1f(uWakeGain, p.wakeGain);
          gl.uniform1f(uPointSat, p.dormantSaturation);
          gl.bindVertexArray(pointVao);
          gl.drawArrays(gl.POINTS, 0, count);
        };
        raf = requestAnimationFrame(frame);

        cleanupScene = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          canvas.removeEventListener("pointerdown", onDown);
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("pointerleave", onLeave);
          for (const buf of buffers) gl.deleteBuffer(buf);
          gl.deleteVertexArray(quadVao);
          gl.deleteVertexArray(pointVao);
          gl.deleteTexture(paintingTex);
          gl.deleteTexture(regionTex);
          gl.deleteProgram(quadProg);
          gl.deleteProgram(pointProg);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
      })
      .catch(() => {
        // Painting or region map failed to load: leave the dark canvas in place.
      });

    return () => {
      disposed = true;
      cleanupScene?.();
    };
  }, [src, regionMap, resolution, density, background]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          cursor: interactive ? "pointer" : "default",
          touchAction: "manipulation",
        }}
        role="img"
        aria-label="Van Gogh's The Starry Night as a field of particles. Click a part of the painting to wake it: light spreads from where you clicked and the brushstrokes there begin to flow."
      />
      {hint ? (
        <p
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: "1.25rem",
            margin: 0,
            textAlign: "center",
            fontSize: "0.8125rem",
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
            opacity: woken ? 0 : 1,
            transition: "opacity 700ms ease",
          }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
