"use client";

/**
 * Starry Night Flow: a painting rendered as a living particle field.
 *
 * The source image is Floyd-Steinberg dithered in linear light; every "on"
 * pixel becomes a GPU point colored from the original canvas. A structure
 * tensor over the luminance field recovers brushstroke direction and
 * coherence, and coherent particles drift along their stroke in staggered
 * fade-in / fade-out lifecycles, modulated by traveling wind gusts. Moving
 * the pointer steers nearby strokes toward the cursor's direction of travel.
 *
 * Inspired by Joshua Garcia's Still Night. The flow field here is computed
 * from the image itself, so any sufficiently painterly source works.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/starry-night-flow";

export interface StarryNightFlowProps {
  /** Image URL. Must be CORS-readable (drawn into a canvas for sampling). */
  src?: string;
  /** Canvas clear color behind the particles. */
  background?: string;
  /** Working resolution: the image is sampled at this width in pixels. */
  resolution?: number;
  /** Fraction of dithered points kept (0.2 to 1). */
  density?: number;
  /** Multiplier on the auto-computed particle size. */
  pointScale?: number;
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
  /** Cursor influence radius in image UV units. */
  cursorRadius?: number;
  /** Enable pointer steering of the flow. */
  interactive?: boolean;
  className?: string;
}

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_homePos;    // image UV, y down
layout(location = 1) in vec3 a_color;
layout(location = 2) in float a_coherence; // 0 = isotropic, 1 = strong stroke
layout(location = 3) in float a_angle;     // stroke orientation, radians

uniform vec4  u_fit;        // uv -> clip: clip = uv * fit.xy + fit.zw
uniform float u_time;
uniform float u_pointSize;
uniform float u_cyclePeriod;
uniform float u_driftFrac;
uniform float u_maxDrift;
uniform float u_flowThreshold;
uniform float u_gustAmplitude;
uniform float u_gustPeriod;
uniform float u_aspect;     // image width / height
uniform vec2  u_cursorUV;
uniform vec2  u_cursorDir;
uniform float u_cursorInfluence;
uniform float u_cursorRadius;

out vec3  v_color;
out float v_alpha;
out float v_size;

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
  float alpha = 1.0;

  // Border particles hold still so the painting's edge never frays.
  float edgeDist = min(min(pos.x, 1.0 - pos.x), min(pos.y, 1.0 - pos.y));
  float edgeLock = smoothstep(0.0, 0.01, edgeDist);

  float flowStrength = smoothstep(u_flowThreshold * 0.5, u_flowThreshold, a_coherence);
  float coherenceEdge = smoothstep(u_flowThreshold, u_flowThreshold + 0.19, a_coherence);

  if (flowStrength > 0.001) {
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
    float driftFrac = u_driftFrac;

    // Cursor steering: near the pointer, painted flow bends toward the
    // cursor's travel direction and trips get shorter (denser churn).
    if (u_cursorInfluence > 0.001) {
      vec2 d = pos - u_cursorUV;
      d.x *= u_aspect;
      float cursorMix = smoothstep(u_cursorRadius, 0.0, length(d)) * u_cursorInfluence;
      if (cursorMix > 0.001) {
        driftFrac = mix(driftFrac, driftFrac * 0.25, cursorMix);
        vec2 blended = mix(flowDir, u_cursorDir, cursorMix);
        float bLen = length(blended);
        flowDir = bLen > 0.001 ? blended / bLen : flowDir;
      }
    }

    float lifecycleAlpha = 0.0;
    if (t < driftFrac) {
      float driftT = t / driftFrac;
      lifecycleAlpha = smoothstep(0.0, 0.08, driftT) * (1.0 - smoothstep(0.80, 1.0, driftT));
      // Compound S-curve: linger at home, sweep through the middle, settle.
      float progress = smoothstep(0.0, 1.0, smoothstep(0.0, 1.0, driftT));
      // Endpoint scatter blurs convergence seams between neighbors.
      float scatter = 0.6 + 0.8 * hash(pos, vec2(53.14, 91.73));
      pos += flowDir * (u_maxDrift * progress * flowStrength * driftScale * gust * particleSpeed * scatter * edgeLock);
    }

    // Low-coherence particles stay put and fully visible; strong strokes
    // cycle through drift lifecycles with a translucent fringe.
    float flowAlphaMix = flowStrength * driftScale;
    alpha = mix(1.0, lifecycleAlpha * mix(0.3, 1.0, coherenceEdge), flowAlphaMix);
  }

  gl_Position = vec4(pos * u_fit.xy + u_fit.zw, 0.0, 1.0);
  float size = u_pointSize * (0.8 + 0.4 * hash(a_homePos, vec2(12.9898, 4.1414)));
  gl_PointSize = size;
  v_size = size;
  v_color = a_color;
  v_alpha = alpha;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3  v_color;
in float v_alpha;
in float v_size;
uniform float u_colorBoost;
out vec4 fragColor;
void main() {
  float edge = 1.0;
  if (v_size > 1.5) {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    edge = smoothstep(0.5, 0.35, dist);
  }
  float a = v_alpha * edge;
  if (a < 0.004) discard;
  float peak = max(v_color.r, max(v_color.g, v_color.b));
  vec3 boosted = v_color / max(peak, 0.001);
  vec3 col = mix(v_color, boosted, u_colorBoost);
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

export default function StarryNightFlow({
  src = `${ASSET_BASE}/starry-night.webp`,
  background = "#0b0b0d",
  resolution = 640,
  density = 1,
  pointScale = 1,
  cyclePeriod = 6,
  driftFrac = 0.9,
  maxDrift = 0.02,
  flowThreshold = 0.25,
  gustAmplitude = 0.75,
  gustPeriod = 10,
  colorBoost = 0.35,
  cursorRadius = 0.14,
  interactive = true,
  className,
}: StarryNightFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef({
    cyclePeriod,
    driftFrac,
    maxDrift,
    flowThreshold,
    gustAmplitude,
    gustPeriod,
    colorBoost,
    cursorRadius,
    pointScale,
    interactive,
  });
  paramsRef.current = {
    cyclePeriod,
    driftFrac,
    maxDrift,
    flowThreshold,
    gustAmplitude,
    gustPeriod,
    colorBoost,
    cursorRadius,
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

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    let cleanupScene: (() => void) | null = null;

    img
      .decode()
      .then(() => {
        if (disposed) return;

        // ── CPU prep: sample, dither, flow field, point extraction ──
        const imgW = Math.min(resolution, img.naturalWidth);
        const imgH = Math.round((imgW / img.naturalWidth) * img.naturalHeight);
        const work = document.createElement("canvas");
        work.width = imgW;
        work.height = imgH;
        const ctx = work.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, imgW, imgH);
        const data = ctx.getImageData(0, 0, imgW, imgH).data;

        const mask = ditherMask(data, imgW, imgH);
        const { coherence, angle } = computeFlowField(data, imgW, imgH);

        const rand = mulberry32(42);
        const keepProb = Math.min(1, Math.max(0.2, density));
        let count = 0;
        const keep = new Uint8Array(imgW * imgH);
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
            idx++;
          }
        }

        // ── GPU setup ──
        const program = gl.createProgram()!;
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(
            gl.getProgramInfoLog(program) ?? "program link failed",
          );
        }
        // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
        gl.useProgram(program);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const buffers: WebGLBuffer[] = [];
        const attrib = (
          loc: number,
          arr: ArrayBufferView,
          size: number,
          type: number,
          normalized = false,
        ) => {
          const buf = gl.createBuffer()!;
          buffers.push(buf);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, type, normalized, 0, 0);
        };
        attrib(0, homePos, 2, gl.FLOAT);
        attrib(1, colors, 3, gl.UNSIGNED_BYTE, true);
        attrib(2, cohArr, 1, gl.FLOAT);
        attrib(3, angArr, 1, gl.FLOAT);

        const u = (name: string) => gl.getUniformLocation(program, name);
        const uFit = u("u_fit");
        const uTime = u("u_time");
        const uPointSize = u("u_pointSize");
        const uCyclePeriod = u("u_cyclePeriod");
        const uDriftFrac = u("u_driftFrac");
        const uMaxDrift = u("u_maxDrift");
        const uFlowThreshold = u("u_flowThreshold");
        const uGustAmplitude = u("u_gustAmplitude");
        const uGustPeriod = u("u_gustPeriod");
        const uAspect = u("u_aspect");
        const uCursorUV = u("u_cursorUV");
        const uCursorDir = u("u_cursorDir");
        const uCursorInfluence = u("u_cursorInfluence");
        const uCursorRadius = u("u_cursorRadius");
        const uColorBoost = u("u_colorBoost");

        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const bg = background.match(/^#?([0-9a-f]{6})$/i)?.[1] ?? "0b0b0d";
        gl.clearColor(
          parseInt(bg.slice(0, 2), 16) / 255,
          parseInt(bg.slice(2, 4), 16) / 255,
          parseInt(bg.slice(4, 6), 16) / 255,
          1,
        );

        // ── Fit: contain the image, centered, aspect preserved ──
        const fit = { sx: 1, sy: 1 };
        const imageAspect = imgW / imgH;
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
          gl.uniform4f(uFit, 2 * fit.sx, -2 * fit.sy, -fit.sx, fit.sy);
        };
        applySize();
        const ro = new ResizeObserver(applySize);
        ro.observe(container);

        // ── Pointer state ──
        const cursor = {
          uv: [0.5, 0.5] as [number, number],
          dir: [1, 0] as [number, number],
          influence: 0,
          lastMove: -1e9,
          inside: false,
        };
        const toUV = (e: PointerEvent): [number, number] => {
          const rect = canvas.getBoundingClientRect();
          const clipX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const clipY = 1 - ((e.clientY - rect.top) / rect.height) * 2;
          return [(clipX / fit.sx + 1) / 2, (1 - clipY / fit.sy) / 2];
        };
        const onMove = (e: PointerEvent) => {
          if (!paramsRef.current.interactive) return;
          const uv = toUV(e);
          const dx = uv[0] - cursor.uv[0];
          const dy = uv[1] - cursor.uv[1];
          const len = Math.hypot(dx, dy);
          if (len > 0.0005) {
            const nx = cursor.dir[0] + (dx / len - cursor.dir[0]) * 0.25;
            const ny = cursor.dir[1] + (dy / len - cursor.dir[1]) * 0.25;
            const nl = Math.hypot(nx, ny) || 1;
            cursor.dir = [nx / nl, ny / nl];
            cursor.lastMove = performance.now();
          }
          cursor.uv = uv;
          cursor.inside = uv[0] >= 0 && uv[0] <= 1 && uv[1] >= 0 && uv[1] <= 1;
        };
        const onLeave = () => {
          cursor.inside = false;
        };
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);

        // ── Render loop ──
        const start = performance.now();
        const frame = () => {
          if (disposed) return;
          raf = requestAnimationFrame(frame);
          const p = paramsRef.current;
          const now = performance.now();
          const t = (now - start) / 1000;

          const active =
            p.interactive && cursor.inside && now - cursor.lastMove < 150;
          const target = active ? 1 : 0;
          cursor.influence +=
            (target - cursor.influence) *
            (target > cursor.influence ? 0.08 : 0.03);

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
          gl.uniform1f(uAspect, imageAspect);
          gl.uniform2f(uCursorUV, cursor.uv[0], cursor.uv[1]);
          gl.uniform2f(uCursorDir, cursor.dir[0], cursor.dir[1]);
          gl.uniform1f(uCursorInfluence, cursor.influence);
          gl.uniform1f(uCursorRadius, p.cursorRadius);
          gl.uniform1f(uColorBoost, p.colorBoost);

          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.POINTS, 0, count);
        };
        raf = requestAnimationFrame(frame);

        cleanupScene = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("pointerleave", onLeave);
          for (const buf of buffers) gl.deleteBuffer(buf);
          gl.deleteVertexArray(vao);
          gl.deleteProgram(program);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
      })
      .catch(() => {
        // Image failed to load or decode: leave the dark canvas in place.
      });

    return () => {
      disposed = true;
      cleanupScene?.();
    };
  }, [src, resolution, density, background]);

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
        }}
        role="img"
        aria-label="An oil painting rendered as drifting particles that flow along its brushstrokes."
      />
    </div>
  );
}
