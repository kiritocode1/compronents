"use client";

/**
 * Fluid Reveal Carousel - an orbiting card ring hidden under a wipeable cover.
 *
 * Two mechanics stacked into one block. Underneath, cards sit in a single grid
 * cell and are placed around a ring: each card owns a `progress` value, and one
 * cycle advances every card by exactly one slot, staggered so the ring travels
 * as a wave rather than a rigid turn. Distance from the front drives scale,
 * blur, brightness, and paint order together, so the back of the ring collapses
 * to a small dark smudge behind the front card. The whole ring also precesses
 * once per spin period while each card counter-rotates, keeping the artwork
 * upright as its orbit plane turns.
 *
 * On top sits a WebGL2 canvas painted a flat cover color. It holds a single
 * half-float field: red carries density, green and blue carry velocity. The
 * pointer splats density and its own velocity into that field; each frame the
 * field self-advects, diffuses, and decays through an fbm-warped sample. The
 * display pass maps density to alpha through a narrow smoothstep, so the cover
 * is opaque wherever the field is cold and punches to fully transparent where
 * the pointer has stirred it. Moving the cursor erases the cover in a fluid
 * trail and the carousel shows through the hole.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";

export interface FluidRevealCarouselItem {
  /** Image URL painted onto the card. */
  src: string;
  /** Accessible description. Cards are decorative when omitted. */
  alt?: string;
}

export interface FluidRevealCarouselProps {
  /** Cards placed around the ring. Two or more, otherwise the ring is static. */
  items?: FluidRevealCarouselItem[];
  /** Width of a single card. Any CSS length; container units scale with the block. */
  cardWidth?: string;
  /** Card aspect ratio, width over height. */
  cardAspect?: number;
  /** Corner radius applied to each card. */
  cardRadius?: string;

  /** Horizontal orbit radius, as a multiple of card width. */
  radius?: number;
  /** Vertical orbit radius, as a multiple of card width. Zero reads as edge-on. */
  radiusY?: number;
  /** Scale of the card furthest from the front. */
  minScale?: number;
  /** Blur of the furthest card, as a multiple of card width. */
  maxBlur?: number;
  /** Brightness of the furthest card. */
  minBrightness?: number;
  /** Seconds for one card to travel one slot. */
  cycleDuration?: number;
  /** Delay between neighbouring cards starting, as a fraction of cycleDuration. */
  stagger?: number;
  /** Seconds for the ring to precess once. Zero holds the orbit plane still. */
  spinDuration?: number;

  /** Cover color. Match the surrounding page so the block reads as solid. */
  coverColor?: string;
  /** Color behind the cards, seen inside the erased trail. */
  revealBackground?: string;
  /** Splat falloff. Smaller is a tighter, more ink-like trail. */
  splatRadius?: number;
  /** Density added per splat. Higher opens the cover sooner. */
  splatForce?: number;
  /** Velocity damping. Higher settles the trail faster. */
  friction?: number;
  /** Neighbour mixing per frame, 0 to 1. Higher spreads and softens. */
  spread?: number;
  /** Density falloff. Higher closes the cover back over sooner. */
  decay?: number;
  /** Amplitude of the fbm warp applied while advecting, in texels. */
  wobble?: number;
  /** How much noise modulates decay, giving the edge its ragged bite. */
  grain?: number;
  /** Density where the cover starts opening. */
  edgeStart?: number;
  /** Density where the cover is fully open. Keep near edgeStart for a hard rim. */
  edgeEnd?: number;
  /** Height of the fade that keeps the trail from sticking to the bottom edge. */
  bottomFade?: number;
  /** Pointer velocity injected into the field. */
  velocityScale?: number;
  /** Clamp on injected velocity, before scaling. */
  maxVelocity?: number;
  /** Shorter side of the simulation grid, in texels. */
  simResolution?: number;
  /** Cap on the longer side of the simulation grid, in texels. */
  maxSimResolution?: number;

  /** Drift a phantom pointer while the real one is absent, so the block is never blank. */
  idle?: boolean;
  /** Seconds of stillness before the phantom pointer takes over. */
  idleDelay?: number;
  /** Drop the cover below this viewport width, leaving the carousel visible. */
  coverMinWidth?: number;

  className?: string;
  style?: CSSProperties;
}

/* Shared BLANK demo covers. Dark, high-contrast frames suit the mechanic:
   the hole reads as a torn edge against the cover when what it exposes is not
   another pale rectangle. */
const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/film-studio-page/spotlight";

const DEFAULT_ITEMS: FluidRevealCarouselItem[] = [
  { src: `${DEFAULT_ASSET_BASE}/spotlight-1.jpg`, alt: "Stage light study" },
  { src: `${DEFAULT_ASSET_BASE}/spotlight-2.jpg`, alt: "Portrait in red" },
  { src: `${DEFAULT_ASSET_BASE}/spotlight-3.jpg`, alt: "Backlit silhouette" },
  { src: `${DEFAULT_ASSET_BASE}/spotlight-4.jpg`, alt: "Motion in monochrome" },
];

/* ------------------------------------------------------------------ shaders */

const VERT = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** Adds a gaussian blob of density, and writes the pointer velocity under it. */
const SPLAT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uField;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float g = exp(-dot(p, p) / radius);
  vec4 f = texture(uField, vUv);
  float w = clamp(g * color.x, 0.0, 1.0);
  fragColor = vec4(
    f.r + g * color.x,
    mix(f.g, color.y, w),
    mix(f.b, color.z, w),
    1.0
  );
}`;

/** Self-advection, fbm-warped diffusion, and decay, all in one pass. */
const FIELD_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uField;
uniform vec2 texelSize;
uniform float dt;
uniform float friction;
uniform float spread;
uniform float decay;
uniform float wobble;
uniform float grain;
uniform float time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1, 0)), f.x),
    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;
}

void main () {
  vec2 vel = texture(uField, vUv).gb;
  vec2 coord = vUv - vel * dt;
  vec4 s = texture(uField, coord);

  float t = time * 0.3;
  vec2 warp = (vec2(
    fbm(vUv * 11.0 + t),
    fbm(vUv * 11.0 + 37.2 - t)
  ) - 0.5) * 2.0 * wobble * texelSize;

  vec4 nL = texture(uField, coord + vec2(-texelSize.x, 0.0) + warp);
  vec4 nR = texture(uField, coord + vec2( texelSize.x, 0.0) + warp);
  vec4 nT = texture(uField, coord + vec2(0.0,  texelSize.y) + warp);
  vec4 nB = texture(uField, coord + vec2(0.0, -texelSize.y) + warp);
  float avgD = (nL.r + nR.r + nT.r + nB.r) * 0.25;
  vec2 avgV = (nL.gb + nR.gb + nT.gb + nB.gb) * 0.25;

  float d = mix(s.r, avgD, spread);
  vec2 v = mix(s.gb, avgV, spread * 0.5);

  float g = fbm(vUv * 15.0 + 5.1 + t * 0.6);
  d *= 1.0 / (1.0 + (decay + grain * decay * (g - 0.5) * 2.0) * dt);
  v *= 1.0 / (1.0 + friction * dt);

  fragColor = vec4(max(d, 0.0), v, 1.0);
}`;

/** Density becomes cover alpha: opaque where cold, punched out where stirred. */
const COVER_FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uField;
uniform vec3 maskColor;
uniform vec2 edge;
uniform float bottomFade;
uniform float time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1, 0)), f.x),
    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;
}

void main () {
  float d = texture(uField, vUv).r;

  float n = fbm(vec2(vUv.x * 9.0, time * 0.25));
  float localFade = bottomFade * (0.35 + n * 1.3);
  d *= smoothstep(0.0, localFade, vUv.y);

  float alpha = 1.0 - smoothstep(edge.x, edge.y, d);
  fragColor = vec4(maskColor, alpha);
}`;

/* -------------------------------------------------------------------- easing */

/**
 * cubic-bezier(0.625, 0.05, 0, 1) solved by Newton-Raphson.
 * A long hold at the start and a hard settle: the ring lingers, then lands.
 */
function orbitEase(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const x1 = 0.625;
  const y1 = 0.05;
  const x2 = 0;
  const y2 = 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  let t = x;
  for (let i = 0; i < 8; i++) {
    const err = sampleX(t) - x;
    if (Math.abs(err) < 1e-6) break;
    const slope = slopeX(t);
    if (Math.abs(slope) < 1e-6) break;
    t -= err / slope;
  }
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return ((ay * t + by) * t + cy) * t;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/* ----------------------------------------------------------------- component */

export function FluidRevealCarousel({
  items = DEFAULT_ITEMS,
  cardWidth = "clamp(15rem, 30cqw, 32rem)",
  cardAspect = 4 / 3,
  cardRadius = "0px",

  radius = 1,
  radiusY = 0,
  minScale = 0.2,
  maxBlur = 0.04,
  minBrightness = 0.3,
  cycleDuration = 2.5,
  stagger = 0.03,
  spinDuration = 24,

  coverColor = "#ffffff",
  revealBackground = "#f2f2f2",
  splatRadius = 0.004,
  splatForce = 3.5,
  friction = 3,
  spread = 0.79,
  decay = 1.5,
  wobble = 2.6,
  grain = 0.7,
  edgeStart = 0.39,
  edgeEnd = 0.4,
  bottomFade = 0.18,
  velocityScale = 1.6,
  maxVelocity = 4,
  simResolution = 512,
  maxSimResolution = 1440,

  idle = true,
  idleDelay = 1.1,
  coverMinWidth = 992,

  className,
  style,
}: FluidRevealCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Live prop mirror. The loops read this instead of re-binding on every edit,
     so dragging a studio slider retunes the running field mid-flight. */
  const tuning = useRef({
    radius,
    radiusY,
    minScale,
    maxBlur,
    minBrightness,
    cycleDuration,
    stagger,
    spinDuration,
    splatRadius,
    splatForce,
    friction,
    spread,
    decay,
    wobble,
    grain,
    edgeStart,
    edgeEnd,
    bottomFade,
    velocityScale,
    maxVelocity,
    idle,
    idleDelay,
  });
  tuning.current = {
    radius,
    radiusY,
    minScale,
    maxBlur,
    minBrightness,
    cycleDuration,
    stagger,
    spinDuration,
    splatRadius,
    splatForce,
    friction,
    spread,
    decay,
    wobble,
    grain,
    edgeStart,
    edgeEnd,
    bottomFade,
    velocityScale,
    maxVelocity,
    idle,
    idleDelay,
  };

  const count = items.length;

  /* ------------------------------------------------------------ the ring */

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || count < 1) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const progress = new Array<number>(count).fill(0);
    /* Per-cycle plan: when each card starts moving, and from where. */
    const plan = Array.from({ length: count }, () => ({ start: 0, from: 0 }));
    let cycleStart = 0;
    let cycleEnd = 0;
    let activeIndex = -1;
    let frame: number | null = null;
    let running = true;

    /* Circular distance from the front slot, in slots. */
    const offsetFromFront = (i: number) => {
      const raw = (((i - progress[i]) % count) + count) % count;
      return Math.min(raw, count - raw);
    };

    const frontIndex = () => {
      let best = 0;
      for (let i = 1; i < count; i++) {
        if (offsetFromFront(i) < offsetFromFront(best)) best = i;
      }
      return best;
    };

    /* One cycle moves every card forward exactly one slot. Cards are released
       in ring order starting from the front, which is what makes the ring
       travel as a wave instead of rotating rigidly. */
    const planCycle = (now: number) => {
      const front = frontIndex();
      const order = Array.from({ length: count }, (_, i) => i).sort(
        (a, b) => ((a - front + count) % count) - ((b - front + count) % count),
      );
      const step = tuning.current.cycleDuration * tuning.current.stagger * 1000;
      order.forEach((index, place) => {
        plan[index] = { start: place * step, from: progress[index] };
      });
      cycleStart = now;
      cycleEnd = (count - 1) * step + tuning.current.cycleDuration * 1000;
    };

    const layout = (now: number) => {
      const card = cardRefs.current[0];
      const width = card?.offsetWidth ?? 0;
      const t = tuning.current;
      const radiusX = width * t.radius;
      const radiusYPx = width * t.radiusY;
      const blurPx = width * t.maxBlur;

      const spinDeg =
        t.spinDuration > 0 && !reduced.matches
          ? ((now / (t.spinDuration * 1000)) % 1) * 360
          : 0;
      ring.style.transform = `rotate(${spinDeg}deg)`;

      const front = frontIndex();
      if (front !== activeIndex) {
        activeIndex = front;
        for (let i = 0; i < count; i++) {
          cardRefs.current[i]?.setAttribute(
            "data-orbit-status",
            i === front ? "active" : "not-active",
          );
        }
      }

      for (let i = 0; i < count; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const angle = ((i - progress[i]) / count) * Math.PI * 2;
        /* 1 at the front, 0 at the back. The 1.3 exponent keeps the front card
           dominant for longer than a plain cosine would. */
        const front01 = ((Math.cos(angle) + 1) / 2) ** 1.3;
        const x = Math.sin(angle) * radiusX;
        const y = Math.cos(angle) * radiusYPx;
        /* The ring is rotated as a whole; each card unrotates by the same
           amount so its artwork stays upright while its orbit plane turns. */
        el.style.transform = `translate(${x}px, ${y}px) rotate(${-spinDeg}deg) scale(${lerp(
          t.minScale,
          1,
          front01,
        )})`;
        el.style.filter = `blur(${lerp(blurPx, 0, front01)}px) brightness(${lerp(
          t.minBrightness,
          1,
          front01,
        )})`;
        el.style.zIndex = String(Math.round(1000 * front01));
      }
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!running) return;
      const now = performance.now();

      if (count > 1 && !reduced.matches) {
        if (now - cycleStart >= cycleEnd) planCycle(now);
        const dur = tuning.current.cycleDuration * 1000;
        for (let i = 0; i < count; i++) {
          const u = clamp((now - cycleStart - plan[i].start) / dur, 0, 1);
          progress[i] = plan[i].from + orbitEase(u);
        }
      }
      layout(now);
    };

    planCycle(performance.now());
    layout(performance.now());
    frame = requestAnimationFrame(tick);

    /* Cards that scrolled away should not burn frames. */
    const visibility = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        /* Skip the gap so the ring resumes rather than jumping a full cycle. */
        if (running) planCycle(performance.now());
      },
      { threshold: 0 },
    );
    visibility.observe(ring);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      visibility.disconnect();
    };
  }, [count]);

  /* ----------------------------------------------------------- the cover */

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (window.innerWidth < coverMinWidth) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    gl.getExtension("EXT_color_buffer_float");
    const filter = gl.getExtension("OES_texture_float_linear")
      ? gl.LINEAR
      : gl.NEAREST;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("shader alloc failed");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERT);

    const program = (fragment: string) => {
      const p = gl.createProgram();
      if (!p) throw new Error("program alloc failed");
      gl.attachShader(p, vertexShader);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(p);
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const total = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < total; i++) {
        const name = gl.getActiveUniform(p, i)?.name;
        if (name) uniforms[name] = gl.getUniformLocation(p, name);
      }
      return { p, uniforms };
    };

    const splatPass = program(SPLAT_FRAG);
    const fieldPass = program(FIELD_FRAG);
    const coverPass = program(COVER_FRAG);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    type Target = {
      tex: WebGLTexture;
      fbo: WebGLFramebuffer;
      w: number;
      h: number;
      attach: (unit: number) => number;
    };

    const makeTarget = (w: number, h: number): Target => {
      const tex = gl.createTexture() as WebGLTexture;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        w,
        h,
        0,
        gl.RGBA,
        gl.HALF_FLOAT,
        null,
      );
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex,
        0,
      );
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        tex,
        fbo,
        w,
        h,
        attach(unit: number) {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, this.tex);
          return unit;
        },
      };
    };

    let read: Target | null = null;
    let write: Target | null = null;
    let texelX = 1 / simResolution;
    let texelY = 1 / simResolution;

    /* The short side is fixed; the long side follows aspect up to the cap, so
       a wide block does not stretch the noise. */
    const resize = () => {
      const aspect = canvas.width / Math.max(canvas.height, 1);
      let w: number;
      let h: number;
      if (aspect >= 1) {
        h = simResolution;
        w = Math.min(Math.round(simResolution * aspect), maxSimResolution);
      } else {
        w = simResolution;
        h = Math.min(Math.round(simResolution / aspect), maxSimResolution);
      }
      if (read && read.w === w && read.h === h) return;
      if (read && write) {
        gl.deleteTexture(read.tex);
        gl.deleteFramebuffer(read.fbo);
        gl.deleteTexture(write.tex);
        gl.deleteFramebuffer(write.fbo);
      }
      read = makeTarget(w, h);
      write = makeTarget(w, h);
      texelX = 1 / w;
      texelY = 1 / h;
    };

    const swap = () => {
      const prev = read;
      read = write;
      write = prev;
    };

    const draw = (target: Target | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.w, target.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    /* Cover color is read back off the canvas so a CSS variable or a theme
       swap keeps working without re-mounting the simulation. */
    const cover: [number, number, number] = [1, 1, 1];
    const readCoverColor = () => {
      const parts = getComputedStyle(canvas).color.match(/[\d.]+/g);
      if (parts && parts.length >= 3) {
        cover[0] = Number(parts[0]) / 255;
        cover[1] = Number(parts[1]) / 255;
        cover[2] = Number(parts[2]) / 255;
      }
    };
    readCoverColor();

    /* Theme switches land on a class change, and the variable resolves a beat
       later. Re-read for a short window rather than once. */
    let recolorUntil = performance.now() + 1200;
    const themeWatch = new MutationObserver(() => {
      recolorUntil = performance.now() + 1200;
    });
    themeWatch.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let rect = root.getBoundingClientRect();
    let lastPointerTime = performance.now();
    let lastInput = 0;
    const pointer = {
      x: 0.5,
      y: 0.5,
      px: 0.5,
      py: 0.5,
      vx: 0,
      vy: 0,
      moved: false,
      init: false,
    };

    /* Normalized, y-up. Velocity is measured against wall clock so a dropped
       frame does not read as a huge flick. */
    const trackNormalized = (nx: number, ny: number) => {
      const now = performance.now();
      const dt = Math.max((now - lastPointerTime) / 1000, 0.004);
      lastPointerTime = now;
      if (pointer.init) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      } else {
        pointer.px = nx;
        pointer.py = ny;
        pointer.init = true;
      }
      pointer.vx = (nx - pointer.px) / dt;
      pointer.vy = (ny - pointer.py) / dt;
      pointer.x = nx;
      pointer.y = ny;
      pointer.moved = true;
    };

    const track = (clientX: number, clientY: number) => {
      trackNormalized(
        (clientX - rect.left) / rect.width,
        1 - (clientY - rect.top) / rect.height,
      );
      lastInput = performance.now();
    };

    const splat = (x: number, y: number, vx: number, vy: number) => {
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(splatPass.p);
      gl.uniform1i(splatPass.uniforms.uField, read?.attach(0) ?? 0);
      gl.uniform1f(
        splatPass.uniforms.aspectRatio,
        canvas.width / Math.max(canvas.height, 1),
      );
      gl.uniform2f(splatPass.uniforms.point, x, y);
      gl.uniform3f(splatPass.uniforms.color, tuning.current.splatForce, vx, vy);
      gl.uniform1f(splatPass.uniforms.radius, tuning.current.splatRadius);
      draw(write);
      swap();
    };

    /* A fast pointer would otherwise leave a dotted trail, so the gap between
       the last two samples is filled with evenly spaced splats. */
    const splatSegment = () => {
      const t = tuning.current;
      const aspect = canvas.width / Math.max(canvas.height, 1);
      const vx =
        clamp(pointer.vx, -t.maxVelocity, t.maxVelocity) * t.velocityScale;
      const vy =
        clamp(pointer.vy, -t.maxVelocity, t.maxVelocity) * t.velocityScale;
      const travel = Math.hypot(
        (pointer.x - pointer.px) * aspect,
        pointer.y - pointer.py,
      );
      const steps = Math.max(
        1,
        Math.ceil(travel / (0.4 * Math.sqrt(t.splatRadius))),
      );
      for (let i = 0; i < steps; i++) {
        const u = steps === 1 ? 1 : i / (steps - 1);
        splat(
          pointer.px + (pointer.x - pointer.px) * u,
          pointer.py + (pointer.y - pointer.py) * u,
          vx,
          vy,
        );
      }
    };

    let last = performance.now();
    let frame: number | null = null;

    const render = () => {
      frame = requestAnimationFrame(render);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      const t = tuning.current;

      if (t.idle && now - lastInput > t.idleDelay * 1000) {
        /* Two incommensurate frequencies per axis, so the phantom path never
           repeats tightly enough to read as a loop. Rates are tuned to roughly
           the speed of a hand sweeping the block: any slower and the splats
           pile into a round blob instead of drawing a trail. */
        const s = now / 1000;
        /* Amplitudes stay inside the band the ring occupies, so an unattended
           block keeps wiping over the cards rather than over empty corners. */
        trackNormalized(
          0.5 + Math.sin(s * 1.15) * 0.22 + Math.sin(s * 0.47) * 0.07,
          0.5 + Math.cos(s * 0.83) * 0.13 + Math.sin(s * 1.7) * 0.04,
        );
      }

      gl.disable(gl.BLEND);

      if (pointer.moved) {
        splatSegment();
        pointer.moved = false;
      }

      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(fieldPass.p);
      gl.uniform2f(fieldPass.uniforms.texelSize, texelX, texelY);
      gl.uniform1f(fieldPass.uniforms.dt, dt);
      gl.uniform1f(fieldPass.uniforms.friction, t.friction);
      gl.uniform1f(fieldPass.uniforms.spread, t.spread);
      gl.uniform1f(fieldPass.uniforms.decay, t.decay);
      gl.uniform1f(fieldPass.uniforms.wobble, t.wobble);
      gl.uniform1f(fieldPass.uniforms.grain, t.grain);
      gl.uniform1f(fieldPass.uniforms.time, now * 0.001);
      gl.uniform1i(fieldPass.uniforms.uField, read?.attach(0) ?? 0);
      draw(write);
      swap();

      if (now < recolorUntil) readCoverColor();

      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(coverPass.p);
      gl.uniform1i(coverPass.uniforms.uField, read?.attach(0) ?? 0);
      gl.uniform3f(coverPass.uniforms.maskColor, cover[0], cover[1], cover[2]);
      gl.uniform2f(coverPass.uniforms.edge, t.edgeStart, t.edgeEnd);
      gl.uniform1f(coverPass.uniforms.bottomFade, t.bottomFade);
      gl.uniform1f(coverPass.uniforms.time, now * 0.001);
      draw(null);
    };

    const start = () => {
      if (frame !== null) return;
      last = performance.now();
      readCoverColor();
      rect = root.getBoundingClientRect();
      render();
    };

    const stop = () => {
      if (frame === null) return;
      cancelAnimationFrame(frame);
      frame = null;
    };

    /* Leaving the block paused mid-trail would freeze a hole in the cover, so
       the field is wiped and one solid frame is painted before it sleeps. */
    const clearField = () => {
      if (!read || !write) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, read.fbo);
      gl.viewport(0, 0, read.w, read.h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.fbo);
      gl.viewport(0, 0, write.w, write.h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(coverPass.p);
      gl.uniform1i(coverPass.uniforms.uField, read.attach(0));
      gl.uniform3f(coverPass.uniforms.maskColor, cover[0], cover[1], cover[2]);
      gl.uniform2f(
        coverPass.uniforms.edge,
        tuning.current.edgeStart,
        tuning.current.edgeEnd,
      );
      gl.uniform1f(coverPass.uniforms.bottomFade, tuning.current.bottomFade);
      gl.uniform1f(coverPass.uniforms.time, performance.now() * 0.001);
      draw(null);
    };

    const measure = () => {
      rect = root.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
      resize();
    };

    const onMouse = (event: MouseEvent) => track(event.clientX, event.clientY);
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) track(touch.clientX, touch.clientY);
    };
    /* Reset rather than carry a stale sample, otherwise re-entry splats a
       straight line across the block. */
    const onLeave = () => {
      pointer.init = false;
    };
    const onScroll = () => {
      rect = root.getBoundingClientRect();
    };

    root.addEventListener("mousemove", onMouse);
    root.addEventListener("touchmove", onTouch, { passive: true });
    root.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    const sizeWatch = new ResizeObserver(measure);
    sizeWatch.observe(root);
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pointer.init = false;
          start();
        } else {
          stop();
          clearField();
        }
      },
      { threshold: 0 },
    );
    visibility.observe(root);

    measure();
    start();

    return () => {
      stop();
      root.removeEventListener("mousemove", onMouse);
      root.removeEventListener("touchmove", onTouch);
      root.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      sizeWatch.disconnect();
      visibility.disconnect();
      themeWatch.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [coverMinWidth, simResolution, maxSimResolution]);

  const cardStyle = useMemo<CSSProperties>(
    () => ({
      position: "relative",
      width: cardWidth,
      aspectRatio: String(cardAspect),
      borderRadius: cardRadius,
      overflow: "hidden",
    }),
    [cardWidth, cardAspect, cardRadius],
  );

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: revealBackground,
        containerType: "inline-size",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "clip",
        }}
      >
        <div
          ref={ringRef}
          style={{
            display: "grid",
            placeItems: "center",
            position: "relative",
          }}
        >
          {items.map((item, index) => (
            <div
              // Cards are positional slots on a ring; the URL is the only
              // stable identity they have.
              key={`${item.src}-${index}`}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-orbit-status="not-active"
              style={{
                gridArea: "1 / 1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "max-content",
                height: "max-content",
                willChange: "transform, filter",
              }}
            >
              <div style={cardStyle}>
                <img
                  src={item.src}
                  alt={item.alt ?? ""}
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    maxWidth: "none",
                    maxHeight: "none",
                    objectFit: "cover",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          width: "100%",
          height: "100%",
          color: coverColor,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default FluidRevealCarousel;
