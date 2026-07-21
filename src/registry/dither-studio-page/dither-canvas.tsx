"use client";

/**
 * The dither engine, rebuilt against the source site's captured pipeline
 * (.lamalama-analysis): a fixed backdrop canvas UNDER the DOM draws the
 * section footage quantised into a pixel-glyph ramp, in muted grey, and a
 * cursor velocity field lights paper glyphs along the pointer trail while
 * smearing the sampling. Text sits on top in plain DOM. During load the same
 * canvas jumps above the page: giant cells fill with the counter, then
 * dissolve and hand the layer back to the backdrop.
 *
 * Glyph: each cell is a 4x4 block grid; block k lights when intensity
 * crosses 1 - k/divider. The cursor ramp uses the 7-block figure, content
 * uses all 16. Velocity: gaussian injection at the pointer (radius 0.04,
 * strength 0.04) decaying by 1 - min(0.5, dt/250) per frame.
 *
 * `DitherMedia` is the in-flow media slot: real imagery drawn plain, with a
 * glyph-mask reveal on first view and the same cursor trail on hover.
 * Seeded procedural plates fill slots that get no media.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

export const GROUND = "#1a1c1c";
export const PAPER = "#f9f4eb";
/** Muted glyph grey the backdrop content renders in. */
export const CONTENT_GREY = "#464646";

/**
 * k-index per 4x4 sub-block position (x + y*4). Blocks light from high k to
 * low as intensity rises; k 0..6 form the compact cursor figure, 7..15 fill
 * in the rest for content.
 */
const KMAP = [
  // y = 0..3 rows, x = 0..3 in each row
  0, 13, 6, 10, 5, 14, 2, 15, 1, 8, 12, 9, 7, 4, 11, 3,
];

const hexToRgb = (hex: string): [number, number, number] => {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

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

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_cell;
uniform float u_time;
uniform float u_fill;
uniform float u_reveal;
uniform vec3 u_content_color;
uniform vec3 u_cursor_color;
uniform vec3 u_ground;
uniform sampler2D u_velocity;
uniform sampler2D u_video;
uniform float u_video_alpha;
uniform float u_kmap[16];
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/* block k for this sub-cell lights when intensity >= 1 - k/divider */
float glyph(vec2 sub, float intensity, float full) {
  float k = u_kmap[int(sub.y) * 4 + int(sub.x)];
  float divider = mix(7.0, 16.0, full);
  float inRamp = mix(step(k, 6.5), 1.0, full);
  return step(1.0 - intensity, k / divider) * inRamp * ceil(clamp(intensity, 0.0, 1.0));
}

float luminance(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 frag = v_uv * u_resolution;

  float plate = 1.0 - step(1.0, u_reveal);

  /* the live layer always runs on the fine grid */
  vec2 cellId = floor(frag / u_cell);
  vec2 sub = mod(floor(frag / (u_cell / 4.0)), 4.0);
  vec2 cellUv = (cellId + 0.5) * u_cell / u_resolution;

  /* cursor velocity: lights the trail and drags the sampling */
  vec2 vel = texture(u_velocity, cellUv).rg * 2.0 - 1.0;
  float speed = length(vel);
  vec2 sampleUv = cellUv - vel * 0.1;

  float cursor_f = glyph(sub, speed, 0.0);

  vec3 videoRgb = texture(u_video, vec2(sampleUv.x, 1.0 - sampleUv.y)).rgb;
  float lum = luminance(videoRgb);
  float f = glyph(sub, lum * u_video_alpha, 1.0);

  float content_op = clamp(f - cursor_f, 0.0, 1.0);
  float cursor_op = clamp(cursor_f, 0.0, 1.0);

  /* lit content blocks carry the footage's own colour, lifted toward paper */
  vec3 contentTint = mix(u_content_color, videoRgb * 1.35, u_video_alpha);
  vec3 liveColor = contentTint * content_op + u_cursor_color * cursor_op;
  float liveAlpha = max(content_op, cursor_op);

  /* load plate, matching the source loader: giant cells shrink to grid size
     (their 160 -> 16 pixel tween, power3.in) while their blocks keep
     lighting toward full, and at the end a hide wave punches glyph-shaped
     holes through to the live layer at the FINE grid. The plate stays lit
     and opaque until each hole opens, so the screen never drops to black
     between the counter and the footage */
  float shrink = u_reveal * u_reveal * u_reveal;
  float plateCellPx = mix(u_cell * 14.0, u_cell, shrink);
  vec2 plateId = floor(frag / plateCellPx);
  vec2 plateSub = mod(floor(frag / (plateCellPx / 4.0)), 4.0);
  vec2 plateUv = (plateId + 0.5) * plateCellPx / u_resolution;

  /* counter phase draws the sparse 7-block figure per cell; the reveal then
     lights the remaining blocks through a back-loaded noise wave, the
     source's full_progress pass (power4.in from 13% of its timeline) */
  float fillNoise = 0.4 + 0.6 * hash(plateId + 7.0);
  float fillGlyph = glyph(plateSub, clamp(u_fill * 1.25 * fillNoise, 0.0, 1.0), 0.0);

  float fullT = clamp((u_reveal - 0.13) / 0.87, 0.0, 1.0);
  fullT = fullT * fullT * fullT * fullT;
  float pn = 0.5 * vnoise(plateUv * 8.0);
  float fullWave = 1.0 - smoothstep(0.0, 1.0, 1.0 - fullT + pn * (1.0 - fullT));

  /* the grey field BECOMES the footage: each plate cell's intensity
     crossfades from the loader wave to the video luminance sampled at that
     same cell, while the cells are still dividing, so the image emerges
     from the giant pixels themselves instead of popping in behind them */
  vec3 plateVideoRgb = texture(u_video, vec2(plateUv.x, 1.0 - plateUv.y)).rgb;
  float toVideo = smoothstep(0.3, 0.75, u_reveal) * u_video_alpha;
  float waveI = mix(fullWave, luminance(plateVideoRgb), toVideo);
  float plateGlyph = max(fillGlyph * (1.0 - toVideo), glyph(plateSub, waveI, 1.0));

  float hideT = clamp((u_reveal - 0.62) / 0.38, 0.0, 1.0);
  hideT = hideT * hideT * hideT * hideT;
  float hn = 0.5 * vnoise(cellUv * 8.0);
  float hideWave = 1.0 - smoothstep(0.0, 1.0, 1.0 - hideT + hn * (1.0 - hideT));
  float hide = glyph(sub, hideWave, 1.0);

  float cover = plate * (1.0 - hide);
  /* the greying IS the handoff: ink runs paper -> page ground with the
     source's power4.inOut color_progress, and the emerging video blocks
     pick up the footage's own colour, so the plate has already become the
     picture by the time the hide wave clears the residue */
  float ct = u_reveal * 0.89;
  float colorT = ct < 0.5
    ? 8.0 * ct * ct * ct * ct
    : 1.0 - 8.0 * pow(1.0 - ct, 4.0);
  vec3 plateInk = mix(u_cursor_color, u_ground, colorT);
  vec3 plateBlock = mix(plateInk, plateVideoRgb * 1.35, toVideo);
  vec3 plateColor = mix(u_ground * 0.4, plateBlock, plateGlyph);

  vec3 color = mix(liveColor * liveAlpha, plateColor, cover);
  float alpha = max(liveAlpha, cover);
  fragColor = vec4(color, alpha);
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

const VEL_W = 96;
const VEL_H = 54;

export interface DitherEngineProps {
  /** Footage dithered into the backdrop while the hero holds the viewport. */
  videoSrc?: string;
  /** Cell size in CSS px. */
  cellSize?: number;
  onProgress?: (p: number) => void;
  /** Fires when the dissolve starts: reveal the page under the plate now. */
  onHandoff?: () => void;
  onDone?: () => void;
  className?: string;
}

export function DitherEngine({
  videoSrc,
  cellSize = 8,
  onProgress,
  onHandoff,
  onDone,
  className,
}: DitherEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(onProgress);
  const handoffRef = useRef(onHandoff);
  const doneRef = useRef(onDone);
  progressRef.current = onProgress;
  handoffRef.current = onHandoff;
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
    gl.uniform1fv(u("u_kmap"), new Float32Array(KMAP));

    const velTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(u("u_velocity"), 0);

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

    /* velocity field on the CPU: gaussian injection at the pointer,
       exponential decay of 1 - min(0.5, dt/250) */
    const vel = new Float32Array(VEL_W * VEL_H * 2);
    const velBytes = new Uint8Array(VEL_W * VEL_H * 2);
    const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, seen: false };
    const onPointerMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      if (pointer.seen) {
        pointer.dx += nx - pointer.x;
        pointer.dy += ny - pointer.y;
      }
      pointer.x = nx;
      pointer.y = ny;
      pointer.seen = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let lastStep = 0;
    const stepFluid = (now: number) => {
      const dt = lastStep ? now - lastStep : 16;
      lastStep = now;
      const decay = 1 - Math.min(0.5, dt / 250);
      const cx = pointer.x * VEL_W;
      const cy = (1 - pointer.y) * VEL_H;
      // source injection radius: 0.04 of viewport height
      const radius = 0.04 * VEL_H;
      const mag = Math.hypot(pointer.dx, pointer.dy);
      const injX = pointer.dx * 34;
      const injY = -pointer.dy * 34;
      for (let y = 0; y < VEL_H; y++) {
        for (let x = 0; x < VEL_W; x++) {
          const i = (y * VEL_W + x) * 2;
          let vx = vel[i] * decay;
          let vy = vel[i + 1] * decay;
          if (mag > 0.0001) {
            const d2 =
              ((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (radius * radius);
            const inf = Math.exp(-d2);
            vx += inf * injX;
            vy += inf * injY;
          }
          vel[i] = Math.max(-1, Math.min(1, vx));
          vel[i + 1] = Math.max(-1, Math.min(1, vy));
          velBytes[i] = (vel[i] * 0.5 + 0.5) * 255;
          velBytes[i + 1] = (vel[i + 1] * 0.5 + 0.5) * 255;
        }
      }
      pointer.dx = 0;
      pointer.dy = 0;
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
      // ponytail: 1.5 dpr cap, the chunky glyphs gain nothing from retina
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

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

    const contentRgb = hexToRgb(CONTENT_GREY).map((v) => v / 255);
    const cursorRgb = hexToRgb(PAPER).map((v) => v / 255);
    const groundRgb = hexToRgb(GROUND).map((v) => v / 255);
    const still = reducedMotion();

    const FILL_MS = still ? 0 : 1150;
    const REVEAL_MS = still ? 0 : 1400;
    let raf = 0;
    let start = 0;
    let revealStart = 0;
    let doneFired = false;
    let lastProgress = -1;

    const render = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;

      const fill = FILL_MS === 0 ? 1 : Math.min(elapsed / FILL_MS, 1);
      // the dissolve waits for the footage so its holes never open onto
      // black; a 4s cap keeps a dead video URL from stalling the page
      const vidReady = !vid || vid.readyState >= 2 || elapsed > FILL_MS + 4000;
      if (fill >= 1 && vidReady && !revealStart) {
        revealStart = now;
        // the page starts revealing under the plate while it dissolves,
        // like the source firing enterApp at the start of its timeline
        handoffRef.current?.();
      }
      const reveal =
        REVEAL_MS === 0
          ? 1
          : !revealStart
            ? 0
            : Math.max(0, Math.min((now - revealStart - 120) / REVEAL_MS, 1));

      // report whole percent steps only, so React is not re-rendered per frame
      const pct = Math.round(fill * 100);
      if (pct !== lastProgress) {
        lastProgress = pct;
        progressRef.current?.(pct / 100);
      }
      if (reveal >= 1 && !doneFired) {
        doneFired = true;
        doneRef.current?.();
      }

      // keep the fluid and video upload warm through the whole load, so the
      // dissolve starts without a first-upload hitch
      stepFluid(now);

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
        ? Math.max(0, 1 - scrollTop / (window.innerHeight * 0.9))
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
      gl.uniform3f(
        u("u_content_color"),
        contentRgb[0],
        contentRgb[1],
        contentRgb[2],
      );
      gl.uniform3f(
        u("u_cursor_color"),
        cursorRgb[0],
        cursorRgb[1],
        cursorRgb[2],
      );
      gl.uniform3f(u("u_ground"), groundRgb[0], groundRgb[1], groundRgb[2]);
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
  }, [videoSrc, cellSize]);

  return <canvas ref={canvasRef} className={className} />;
}

/* ------------------------------------------------------------------ */
/* DitherMedia                                                         */
/* ------------------------------------------------------------------ */

/** Number of sub-blocks lit at this intensity, following the k ramp. */
function litBlocks(intensity: number, full: boolean): boolean[] {
  const divider = full ? 16 : 7;
  const out = new Array(16).fill(false);
  if (intensity <= 0) return out;
  for (let i = 0; i < 16; i++) {
    const k = KMAP[i];
    if (!full && k > 6) continue;
    out[i] = intensity >= 1 - k / divider;
  }
  return out;
}

export interface DitherMediaProps {
  /** Image or video URL. Omit for seeded procedural plate art. */
  src?: string;
  /** Set when `src` points at a video file. */
  video?: boolean;
  seed?: number;
  /** Accent tint of the procedural plate. */
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
  cellSize = 8,
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
    const paper = `rgb(${hexToRgb(PAPER).join(", ")})`;
    const ground = `rgb(${hexToRgb(GROUND).join(", ")})`;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cellPx = cellSize * dpr;
    let subPx = cellPx / 4;
    let cols = 0;
    let rows = 0;
    const cellHash: number[] = [];

    // base = the clean frame the effects sample from
    const base = document.createElement("canvas");
    const baseCtx = base.getContext("2d");
    if (!baseCtx) return;

    /* per-cell velocity field: the same fluid the engine runs (gaussian
       injection at the pointer, exponential decay), so images ripple like
       the hero footage instead of shifting in discrete chunks */
    let velX = new Float32Array(0);
    let velY = new Float32Array(0);
    const pointer = { x: 0, y: 0, dx: 0, dy: 0, seen: false };
    let lastStep = 0;
    let energy = 0;

    const stepField = (now: number) => {
      const dt = lastStep ? now - lastStep : 16;
      lastStep = now;
      const decay = 1 - Math.min(0.5, dt / 250);
      const radius = Math.max(3, rows * 0.06);
      const injX = (pointer.dx / Math.max(1, cols)) * 30;
      const injY = (pointer.dy / Math.max(1, rows)) * 30;
      const inject = Math.hypot(injX, injY) > 0.001;
      energy = 0;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const i = cy * cols + cx;
          let vx = velX[i] * decay;
          let vy = velY[i] * decay;
          if (inject) {
            const dx = cx - pointer.x;
            const dy = cy - pointer.y;
            const g = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
            vx += injX * g;
            vy += injY * g;
          }
          vx = Math.max(-1, Math.min(1, vx));
          vy = Math.max(-1, Math.min(1, vy));
          velX[i] = Math.abs(vx) < 0.004 ? 0 : vx;
          velY[i] = Math.abs(vy) < 0.004 ? 0 : vy;
          energy = Math.max(energy, Math.abs(velX[i]), Math.abs(velY[i]));
        }
      }
      pointer.dx = 0;
      pointer.dy = 0;
    };

    let reveal = still ? 1 : 0;
    let revealStarted = false;

    const paintBase = () => {
      const w = base.width;
      const h = base.height;
      if (img?.complete && img.naturalWidth) {
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        baseCtx.drawImage(
          img,
          (w - img.naturalWidth * scale) / 2,
          (h - img.naturalHeight * scale) / 2,
          img.naturalWidth * scale,
          img.naturalHeight * scale,
        );
      } else if (vid && vid.readyState >= 2) {
        const scale = Math.max(w / vid.videoWidth, h / vid.videoHeight);
        baseCtx.drawImage(
          vid,
          (w - vid.videoWidth * scale) / 2,
          (h - vid.videoHeight * scale) / 2,
          vid.videoWidth * scale,
          vid.videoHeight * scale,
        );
      } else {
        /* seeded plate: banded noise in ground / accent / paper glyph art */
        baseCtx.fillStyle = "#222525";
        baseCtx.fillRect(0, 0, w, h);
        const freq = 0.05;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const n = noise(cx * freq, cy * freq * 1.45);
            const shaped = Math.min(1, Math.max(0, (n - 0.3) * 1.9));
            if (shaped <= 0.1) continue;
            const lit = litBlocks(shaped, true);
            baseCtx.fillStyle =
              shaped > 0.72
                ? paper
                : shaped > 0.4
                  ? `rgb(${accentRgb.join(", ")})`
                  : "#3a3e3e";
            for (let s = 0; s < 16; s++) {
              if (!lit[s]) continue;
              baseCtx.fillRect(
                cx * cellPx + (s % 4) * subPx,
                cy * cellPx + ((s / 4) | 0) * subPx,
                subPx * 0.8,
                subPx * 0.8,
              );
            }
          }
        }
      }
    };

    const draw = () => {
      if (disposed) return;
      const now = performance.now();
      if (vid && vid.readyState >= 2) paintBase();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);

      /* glyph-mask reveal: ground blocks cover the frame and die off */
      if (reveal < 1) {
        reveal = Math.min(1, reveal + 0.028);
        ctx.fillStyle = ground;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const cover =
              1 -
              Math.min(
                1,
                Math.max(0, reveal * 1.25 - cellHash[cy * cols + cx] * 0.3),
              );
            if (cover <= 0) continue;
            const lit = litBlocks(cover, true);
            for (let s = 0; s < 16; s++) {
              if (!lit[s]) continue;
              ctx.fillRect(
                cx * cellPx + (s % 4) * subPx,
                cy * cellPx + ((s / 4) | 0) * subPx,
                subPx,
                subPx,
              );
            }
          }
        }
      }

      /* water-surface distortion: every cell with flow re-samples the base
         against the local velocity (fractional source, so the smear is
         smooth), and the flow speed lights the 7-block figure, exactly
         like the hero shader's advected sampling */
      stepField(now);
      if (energy > 0.01) {
        ctx.imageSmoothingEnabled = false;
        const drag = rows * 0.12;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const i = cy * cols + cx;
            const vx = velX[i];
            const vy = velY[i];
            const speed = Math.hypot(vx, vy);
            if (speed < 0.03) continue;
            const sx = Math.max(0, Math.min(cols - 1, cx - vx * drag)) * cellPx;
            const sy = Math.max(0, Math.min(rows - 1, cy - vy * drag)) * cellPx;
            ctx.drawImage(
              base,
              sx,
              sy,
              cellPx,
              cellPx,
              cx * cellPx,
              cy * cellPx,
              cellPx,
              cellPx,
            );
            const lit = litBlocks(Math.min(1, speed * 1.4), false);
            ctx.fillStyle = paper;
            for (let s = 0; s < 16; s++) {
              if (!lit[s]) continue;
              ctx.fillRect(
                cx * cellPx + (s % 4) * subPx,
                cy * cellPx + ((s / 4) | 0) * subPx,
                subPx * 0.8,
                subPx * 0.8,
              );
            }
          }
        }
      }

      if (vid || energy > 0.01 || reveal < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        lastStep = 0;
      }
    };

    const wake = () => {
      if (!running && !disposed) {
        running = true;
        raf = requestAnimationFrame(draw);
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
      base.width = canvas.width;
      base.height = canvas.height;
      cellHash.length = 0;
      const rand = mulberry(seed * 31 + 5);
      for (let i = 0; i < cols * rows; i++) cellHash.push(rand());
      velX = new Float32Array(cols * rows);
      velY = new Float32Array(cols * rows);
      paintBase();
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (still) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * cols;
      const y = ((e.clientY - rect.top) / rect.height) * rows;
      if (pointer.seen) {
        pointer.dx += x - pointer.x;
        pointer.dy += y - pointer.y;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.seen = true;
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

    /* reveal + video playback only while on screen */
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!revealStarted) {
          revealStarted = true;
          wake();
        }
        if (vid) {
          vid.play().catch(() => {});
          wake();
        }
      } else {
        vid?.pause();
      }
    });
    io.observe(wrap);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
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
