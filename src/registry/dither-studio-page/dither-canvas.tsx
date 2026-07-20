"use client";

/**
 * The dither engine for the studio page.
 *
 * `DitherEngine` is one fixed full-viewport WebGL2 pass layered over the page
 * (pointer-events: none), the way the whole aesthetic works: every grid cell is
 * a 4x4 mini glyph whose sub-blocks light up in a fixed order as the input
 * intensity rises. The input is a drifting noise field, plus the hero footage
 * sampled from a hidden <video> (faded out as the hero scrolls away), plus a
 * decaying cursor velocity field that both smears the sampling and lights
 * glyphs along the pointer trail. The load choreography lives in the same
 * shader: a plate of giant cells fills up with the counter, then the cells
 * shrink to grid size while the plate dissolves.
 *
 * `DitherMedia` renders the in-flow media slots (case thumbnails, culture
 * plates, rail panels) with the same glyph look on a 2D canvas: real images
 * and videos are requantised per cell, seeded procedural plates fill the slots
 * when nothing is passed, and moving the pointer across one injects local
 * velocity that smears the cells and lights the trail.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

export const GROUND = "#1a1c1c";
export const PAPER = "#f9f4eb";

/** Order in which a cell's 16 sub-blocks light up as intensity rises. */
const GLYPH_ORDER = [9, 3, 12, 6, 0, 14, 5, 11, 13, 1, 8, 4, 7, 10, 2, 15];

const hexToRgb = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Deterministic PRNG so every placeholder plate is stable per seed. */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded 2D value noise with two octaves, enough for plate art. */
function makeNoise(seed: number) {
  const rand = mulberry(seed);
  const grid: number[] = [];
  for (let i = 0; i < 64 * 64; i++) grid.push(rand());
  const at = (x: number, y: number) =>
    grid[((y & 63) * 64 + (x & 63)) % grid.length];
  const smooth = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    return (
      at(ix, iy) * (1 - ux) * (1 - uy) +
      at(ix + 1, iy) * ux * (1 - uy) +
      at(ix, iy + 1) * (1 - ux) * uy +
      at(ix + 1, iy + 1) * ux * uy
    );
  };
  return (x: number, y: number) =>
    smooth(x, y) * 0.65 + smooth(x * 2.13, y * 2.13) * 0.35;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Nearest scrollable ancestor, because the registry preview scrolls a div. */
function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return window;
}

/* ------------------------------------------------------------------ */
/* DitherEngine                                                        */
/* ------------------------------------------------------------------ */

const VERT = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * One pass draws everything. Cells light their sub-blocks by intensity;
 * the intro plate reuses the same glyphs at a much larger cell size.
 */
const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_cell;
uniform float u_time;
uniform float u_fill;
uniform float u_reveal;
uniform vec3 u_speck;
uniform vec3 u_bright;
uniform sampler2D u_velocity;
uniform sampler2D u_video;
uniform float u_video_alpha;
uniform float u_order[16];
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += noise(p) * amp;
    p *= 2.07;
    amp *= 0.5;
  }
  return sum;
}

/* how many of the cell's 16 sub-blocks are lit at this intensity */
float glyph(vec2 sub, float intensity) {
  float idx = u_order[int(sub.y) * 4 + int(sub.x)];
  return step(idx + 0.5, intensity * 16.0);
}

float luminance(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 frag = v_uv * u_resolution;

  /* the intro plate runs on giant cells that shrink as it reveals */
  float introEase = u_reveal * u_reveal * (3.0 - 2.0 * u_reveal);
  float cellPx = mix(u_cell * 14.0, u_cell, introEase);
  float plate = 1.0 - step(1.0, u_reveal);

  vec2 cellId = floor(frag / cellPx);
  vec2 sub = mod(floor(frag / (cellPx / 4.0)), 4.0);
  vec2 cellUv = (cellId + 0.5) * cellPx / u_resolution;

  /* cursor velocity: smears the sampling and lights the trail */
  vec2 vel = texture(u_velocity, cellUv).rg * 2.0 - 1.0;
  float speed = length(vel);
  vec2 sampleUv = cellUv - vel * 0.10;

  /* content: drifting field, replaced by footage while the hero holds */
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(sampleUv.x * aspect, sampleUv.y);
  float field = fbm(p * 2.3 + vec2(u_time * 0.016, u_time * -0.011));
  float base = smoothstep(0.38, 0.95, field) * 0.34;

  float videoLum = luminance(texture(u_video, vec2(sampleUv.x, 1.0 - sampleUv.y)).rgb);
  float intensity = mix(base, videoLum * 0.9, u_video_alpha);

  /* the trail lights glyphs everywhere it passes */
  intensity += speed * 1.4;

  /* intro plate: cells fill with the counter, then dissolve outward */
  float fillNoise = 0.4 + 0.6 * hash(cellId + 7.0);
  float plateIntensity = clamp(u_fill * 1.25 * fillNoise, 0.0, 1.0);
  float alive = step(u_reveal * 1.1, fbm(cellUv * 3.1) + hash(cellId) * 0.12);

  intensity = mix(intensity, plateIntensity, plate * alive);
  float ground = plate * alive;

  float lit = glyph(sub, clamp(intensity, 0.0, 1.0));

  /* small gap between sub-blocks keeps the grid readable */
  vec2 inSub = fract(frag / (cellPx / 4.0));
  float dot = lit * step(inSub.x, 0.72) * step(inSub.y, 0.72);

  vec3 color = mix(u_speck, u_bright, clamp(speed * 1.8 + u_video_alpha * videoLum, 0.0, 1.0));
  float alpha = max(dot, ground);
  vec3 outColor = mix(vec3(0.0), color, dot);
  fragColor = vec4(outColor * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/** CPU velocity field: gaussian injection at the pointer, exponential decay. */
const VEL_W = 64;
const VEL_H = 36;

export interface DitherEngineProps {
  /** Footage behind the hero, requantised to glyphs. */
  videoSrc?: string;
  /** Dither cell size in CSS px. */
  cellSize?: number;
  /** Speck colour of the idle field. */
  speck?: string;
  /** Colour the glyphs shift toward under the cursor and footage. */
  bright?: string;
  /** Reports load progress 0..1 while the intro plate fills. */
  onProgress?: (p: number) => void;
  /** Fires once the plate has dissolved. */
  onDone?: () => void;
  className?: string;
}

export function DitherEngine({
  videoSrc,
  cellSize = 8,
  speck = "#3a3e3e",
  bright = "#f9f4eb",
  onProgress,
  onDone,
  className,
}: DitherEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(onProgress);
  const doneRef = useRef(onDone);
  progressRef.current = onProgress;
  doneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) {
      doneRef.current?.();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !program) {
      doneRef.current?.();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      doneRef.current?.();
      return;
    }

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
    gl.useProgram(program);
    const u = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform1fv(u("u_order"), new Float32Array(GLYPH_ORDER));

    /* velocity texture */
    const velTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(u("u_velocity"), 0);

    /* video texture */
    const videoTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, videoTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    gl.uniform1i(u("u_video"), 1);

    let vid: HTMLVideoElement | null = null;
    if (videoSrc) {
      vid = document.createElement("video");
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.crossOrigin = "anonymous";
      vid.src = videoSrc;
      vid.play().catch(() => {});
    }

    /* CPU fluid: velocity per coarse cell, decayed and re-injected */
    const vel = new Float32Array(VEL_W * VEL_H * 2);
    const velBytes = new Uint8Array(VEL_W * VEL_H * 2);
    const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, seen: false };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
      if (!pointer.seen) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.seen = true;
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const stepFluid = () => {
      const dx = (pointer.x - pointer.px) * 18;
      const dy = (pointer.y - pointer.py) * 18;
      pointer.px += (pointer.x - pointer.px) * 0.55;
      pointer.py += (pointer.y - pointer.py) * 0.55;
      const cx = pointer.x * VEL_W;
      const cy = (1 - pointer.y) * VEL_H;
      const radius = 3.4;
      const mag = Math.hypot(dx, dy);
      for (let y = 0; y < VEL_H; y++) {
        for (let x = 0; x < VEL_W; x++) {
          const i = (y * VEL_W + x) * 2;
          let vx = vel[i] * 0.93;
          let vy = vel[i + 1] * 0.93;
          if (mag > 0.001) {
            const d2 =
              ((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (radius * radius);
            const inf = Math.exp(-d2);
            vx += inf * dx * 0.6;
            vy -= inf * dy * 0.6;
          }
          vel[i] = Math.max(-1, Math.min(1, vx));
          vel[i + 1] = Math.max(-1, Math.min(1, vy));
          velBytes[i] = (vel[i] * 0.5 + 0.5) * 255;
          velBytes[i + 1] = (vel[i + 1] * 0.5 + 0.5) * 255;
        }
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velTex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RG8,
        VEL_W,
        VEL_H,
        0,
        gl.RG,
        gl.UNSIGNED_BYTE,
        velBytes,
      );
    };

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    /* hero footage fades out as the page scrolls past the first viewport */
    const scroller = getScrollParent(canvas);
    let scrollTop = 0;
    const readScroll = () => {
      scrollTop =
        scroller === window
          ? window.scrollY
          : (scroller as HTMLElement).scrollTop;
    };
    readScroll();
    scroller.addEventListener("scroll", readScroll, { passive: true });

    const speckRgb = hexToRgb(speck).map((v) => v / 255);
    const brightRgb = hexToRgb(bright).map((v) => v / 255);
    const still = reducedMotion();

    const FILL_MS = still ? 0 : 1150;
    const REVEAL_MS = still ? 0 : 900;
    let raf = 0;
    let start = 0;
    let doneFired = false;
    let lastProgress = -1;

    const render = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;

      const fill = FILL_MS === 0 ? 1 : Math.min(elapsed / FILL_MS, 1);
      const reveal =
        REVEAL_MS === 0
          ? 1
          : Math.max(0, Math.min((elapsed - FILL_MS - 120) / REVEAL_MS, 1));

      if (fill !== lastProgress) {
        lastProgress = fill;
        progressRef.current?.(fill);
      }
      if (reveal >= 1 && !doneFired) {
        doneFired = true;
        doneRef.current?.();
      }

      stepFluid();

      if (vid && vid.readyState >= 2) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, videoTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          vid,
        );
      }
      const videoAlpha = vid
        ? Math.max(0, 1 - scrollTop / (window.innerHeight * 0.85))
        : 0;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vao);
      gl.uniform2f(u("u_resolution"), canvas.width, canvas.height);
      gl.uniform1f(u("u_cell"), cellSize * dpr);
      gl.uniform1f(u("u_time"), still ? 0 : elapsed / 1000);
      gl.uniform1f(u("u_fill"), fill);
      gl.uniform1f(u("u_reveal"), reveal);
      gl.uniform3f(u("u_speck"), speckRgb[0], speckRgb[1], speckRgb[2]);
      gl.uniform3f(u("u_bright"), brightRgb[0], brightRgb[1], brightRgb[2]);
      gl.uniform1f(u("u_video_alpha"), videoAlpha);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("scroll", readScroll);
      if (vid) {
        vid.pause();
        vid.removeAttribute("src");
        vid.load();
      }
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(velTex);
      gl.deleteTexture(videoTex);
    };
  }, [videoSrc, cellSize, speck, bright]);

  return <canvas ref={canvasRef} className={className} />;
}

/* ------------------------------------------------------------------ */
/* DitherMedia: in-flow media slots                                    */
/* ------------------------------------------------------------------ */

interface Impulse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

export interface DitherMediaProps {
  /** Image or video URL. Omit for seeded procedural plate art. */
  src?: string;
  /** Set when `src` points at a video file. */
  video?: boolean;
  /** Seed for the procedural plate when no src is given. */
  seed?: number;
  /** Accent tint of the plate's mid tones. */
  accent?: string;
  /** Cell size in CSS px. */
  cellSize?: number;
  className?: string;
}

export function DitherMedia({
  src,
  video = false,
  seed = 1,
  accent = "#e75d60",
  cellSize = 7,
  className,
}: DitherMediaProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = reducedMotion();
    let disposed = false;
    let raf = 0;
    let running = false;

    let img: HTMLImageElement | null = null;
    let vid: HTMLVideoElement | null = null;
    const noise = makeNoise(seed * 7919 + 13);
    const accentRgb = hexToRgb(accent);
    const paperRgb = hexToRgb(PAPER);
    const speckRgb: [number, number, number] = [58, 62, 62];

    /* luminance per cell, rebuilt on resize / per video frame */
    let cols = 0;
    let rows = 0;
    let lum: Float32Array = new Float32Array(0);
    let colorMode: Uint8Array = new Uint8Array(0); // 0 speck 1 accent 2 paper
    const sampler = document.createElement("canvas");
    const samplerCtx = sampler.getContext("2d", { willReadFrequently: true });
    if (!samplerCtx) return;

    const impulses: Impulse[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cellPx = cellSize * dpr;
    let subPx = cellPx / 4;

    const sampleSource = () => {
      if (img?.complete && img.naturalWidth) {
        const scale = Math.max(
          cols / img.naturalWidth,
          rows / img.naturalHeight,
        );
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        samplerCtx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      } else if (vid && vid.readyState >= 2) {
        const scale = Math.max(cols / vid.videoWidth, rows / vid.videoHeight);
        const dw = vid.videoWidth * scale;
        const dh = vid.videoHeight * scale;
        samplerCtx.drawImage(vid, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      } else {
        return false;
      }
      const data = samplerCtx.getImageData(0, 0, cols, rows).data;
      for (let i = 0; i < cols * rows; i++) {
        const j = i * 4;
        lum[i] =
          (data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114) / 255;
        colorMode[i] = 2;
      }
      return true;
    };

    /** Seeded plate: layered noise banded into speck / accent / paper tones. */
    const samplePlate = () => {
      const rand = mulberry(seed * 104729 + 7);
      const ox = rand() * 40;
      const oy = rand() * 40;
      const freq = 0.055 + rand() * 0.05;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const n = noise(x * freq + ox, y * freq * 1.4 + oy);
          const shaped = Math.min(1, Math.max(0, (n - 0.28) * 1.9));
          lum[i] = 0.15 + shaped * 0.85;
          colorMode[i] = shaped > 0.72 ? 2 : shaped > 0.38 ? 1 : 0;
        }
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      cellPx = cellSize * dpr;
      subPx = cellPx / 4;
      cols = Math.max(1, Math.ceil(canvas.width / cellPx));
      rows = Math.max(1, Math.ceil(canvas.height / cellPx));
      sampler.width = cols;
      sampler.height = rows;
      lum = new Float32Array(cols * rows);
      colorMode = new Uint8Array(cols * rows);
      if (!sampleSource()) samplePlate();
      draw();
    };

    const draw = () => {
      if (disposed) return;
      const now = performance.now();
      if (vid && vid.readyState >= 2) sampleSource();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gap = 0.74;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          let intensity = lum[cy * cols + cx];
          let shiftX = 0;
          let shiftY = 0;
          /* local cursor fluid */
          for (const p of impulses) {
            const age = (now - p.t) / 700;
            if (age >= 1) continue;
            const dx = cx - p.x;
            const dy = cy - p.y;
            const inf = Math.exp(-(dx * dx + dy * dy) / 22) * (1 - age);
            shiftX += p.vx * inf;
            shiftY += p.vy * inf;
            intensity += inf * Math.hypot(p.vx, p.vy) * 0.35;
          }
          let sx = cx;
          let sy = cy;
          if (shiftX !== 0 || shiftY !== 0) {
            sx = Math.max(0, Math.min(cols - 1, Math.round(cx - shiftX)));
            sy = Math.max(0, Math.min(rows - 1, Math.round(cy - shiftY)));
            intensity = Math.min(
              1.3,
              lum[sy * cols + sx] + intensity - lum[cy * cols + cx],
            );
          }
          const mode = colorMode[sy * cols + sx];
          const lit = Math.round(Math.min(1, intensity) * 16);
          if (lit <= 0) continue;
          const rgb = mode === 2 ? paperRgb : mode === 1 ? accentRgb : speckRgb;
          ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
          const baseX = cx * cellPx;
          const baseY = cy * cellPx;
          for (let s = 0; s < 16; s++) {
            if (GLYPH_ORDER[s] >= lit) continue;
            const bx = s % 4;
            const by = (s / 4) | 0;
            ctx.fillRect(
              baseX + bx * subPx,
              baseY + by * subPx,
              subPx * gap,
              subPx * gap,
            );
          }
        }
      }

      /* retire dead impulses */
      for (let i = impulses.length - 1; i >= 0; i--) {
        if (now - impulses[i].t > 700) impulses.splice(i, 1);
      }
      if (vid || impulses.length > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (!running && !disposed) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    let lastPX = 0;
    let lastPY = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (still) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * cols;
      const y = ((e.clientY - rect.top) / rect.height) * rows;
      const vx = x - lastPX;
      const vy = y - lastPY;
      lastPX = x;
      lastPY = y;
      const mag = Math.hypot(vx, vy);
      if (mag > 0.4 && mag < 40) {
        impulses.push({
          x,
          y,
          vx: Math.max(-4, Math.min(4, vx)),
          vy: Math.max(-4, Math.min(4, vy)),
          t: performance.now(),
        });
        if (impulses.length > 24) impulses.shift();
      }
      wake();
    };
    wrap.addEventListener("pointermove", onPointerMove, { passive: true });

    if (src && !video) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resize();
      img.src = src;
    } else if (src && video) {
      vid = document.createElement("video");
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.crossOrigin = "anonymous";
      vid.src = src;
      vid.play().catch(() => {});
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let io: IntersectionObserver | null = null;
    if (src && video) {
      io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          vid?.play().catch(() => {});
          wake();
        } else {
          vid?.pause();
        }
      });
      io.observe(wrap);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
      if (vid) {
        vid.pause();
        vid.removeAttribute("src");
        vid.load();
      }
    };
  }, [src, video, seed, accent, cellSize]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
