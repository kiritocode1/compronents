import { writePalette, writeStem } from "./geometry";
import {
  type BalloonZinniaSettings,
  COMPOSITION_ASPECT,
  COMPOSITION_HALF,
  clamp,
  DEG,
  HEAD_LIFT,
  MAX_ELLIPSOIDS,
  MAX_PETALS,
  NEAR,
  num,
  PALETTE_WIDTH,
  PETAL_LODS,
  STEM_ROUNDS,
  STEM_SAMPLES,
  TAU,
} from "./model";
import { PETAL_FRAG, PETAL_VERT, STEM_FRAG, STEM_VERT } from "./shaders";

const GRAIN_SCALE = 0.012;
const EGG = 0.35;
const BREATHS = 8;
const FLOWS = 8;
const PULSES = 6;
const BAND_BASE = 0.71;
const PETAL_HINGE = 0.5;
const PETAL_ROOT = 0.16;
const LENGTH_SCALE = 0.42;
const WIDTH_SCALE = 0.2;
const PUFF_SCALE = 0.22;
const WIDTH_AT = 15;
const SWELL_GAIN = 0.22;
const BREATH_LIFT = 0.14;
const BREATH_PHASE = 0.25 / 14;
const OPEN_PHASE = 1.56 / 14;
const BAND_PHASE = 0.3 / 14;
const PULSE_PHASE = 1.38 / 14;
const BREATH_SHIFT = 0.18;
const FOLLOW_YAW = 20 * DEG;
const FOLLOW_PITCH = 14 * DEG;
const BOUNCE_RATE = 1.6;
const BOUNCE_DAMP = 0.16;
const BOUNCE_KICK = 2.2;
const RIB_ANGLE = 47;
const RIB_SWING = 38;
const RIB_RADIUS = 0.17;
const RIB_LENGTH = 0.09;
const RIB_GIRTH = 0.072;
const THROAT_Z = -0.24;
const THROAT_R = 0.19;
const THROAT_DEPTH = 0.17;
const CORE_Z = -0.04;
const CORE_R = 0.25;
const CORE_DEPTH = 0.155;
const NECK = -0.24;
const STEM_RADIUS = 0.13;
const HEAD_DEPTH = 0.45;
const LOD_SOLID = 0.3;
const LOD_SOFT = 1;
const QUALITY = [1, 0.85, 0.72, 0.6] as const;

interface Compiled {
  program: WebGLProgram;
  loc: Map<string, WebGLUniformLocation | null>;
  cache: Map<string, Float64Array>;
  shaders: WebGLShader[];
  linked: boolean | null;
}

interface PointerState {
  cx: number;
  cy: number;
  inside: boolean;
  moved: boolean;
  down: boolean;
  id: number;
  sx: number;
  sy: number;
  type: string;
  tap: boolean;
}

function compile(
  gl: WebGL2RenderingContext,
  vertex: string,
  fragment: string,
): Compiled | null {
  const program = gl.createProgram();
  if (!program) return null;
  const shaders: WebGLShader[] = [];
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    shaders.push(shader);
  }
  gl.linkProgram(program);
  return { program, loc: new Map(), cache: new Map(), shaders, linked: null };
}

function programReady(
  gl: WebGL2RenderingContext,
  compiled: Compiled,
  parallel: boolean,
) {
  if (compiled.linked !== null) return true;
  if (parallel && !gl.getProgramParameter(compiled.program, 0x91b1))
    return false;
  compiled.linked = !!gl.getProgramParameter(compiled.program, gl.LINK_STATUS);
  if (!compiled.linked && !gl.isContextLost()) {
    for (const shader of compiled.shaders) {
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Balloon zinnia shader:", gl.getShaderInfoLog(shader));
      }
    }
    console.warn(
      "Balloon zinnia link:",
      gl.getProgramInfoLog(compiled.program),
    );
  }
  for (const shader of compiled.shaders) gl.deleteShader(shader);
  compiled.shaders.length = 0;
  return true;
}

function median(values: Float64Array, count: number) {
  const sorted = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const value = values[i] ?? 0;
    let slot = i - 1;
    while (slot >= 0 && (sorted[slot] ?? 0) > value) {
      sorted[slot + 1] = sorted[slot] ?? 0;
      slot--;
    }
    sorted[slot + 1] = value;
  }
  return count ? (sorted[count >> 1] ?? 0) : 0;
}

function spring(
  position: number,
  velocity: number,
  target: number,
  seconds: number,
  dt: number,
) {
  const omega = 5.8 / Math.max(seconds, 0.02);
  let time = dt;
  let next = position;
  let speed = velocity;
  while (time > 1e-6) {
    const step = Math.min(0.004, time);
    time -= step;
    speed += (omega * omega * (target - next) - 2 * omega * speed) * step;
    next += speed * step;
  }
  if (Math.abs(next - target) < 1e-5 && Math.abs(speed) < 1e-4) {
    next = target;
    speed = 0;
  }
  return [next, speed] as const;
}

function rotX(angle: number, out: Float64Array) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  out.set([1, 0, 0, 0, c, -s, 0, s, c]);
}

function rotY(angle: number, out: Float64Array) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  out.set([c, 0, s, 0, 1, 0, -s, 0, c]);
}

function mulMat(a: Float64Array, b: Float64Array, out: Float64Array) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      out[row * 3 + col] =
        (a[row * 3] ?? 0) * (b[col] ?? 0) +
        (a[row * 3 + 1] ?? 0) * (b[3 + col] ?? 0) +
        (a[row * 3 + 2] ?? 0) * (b[6 + col] ?? 0);
    }
  }
}

/**
 * WebGL2 zinnia. Petals and the two throat capsules are instanced ellipsoids.
 * The stem is a tube. Both are painted by the same palette ramp.
 */
export class BalloonZinniaEngine {
  private gl: WebGL2RenderingContext | null = null;
  private lost = false;
  private petalProgram: Compiled | null = null;
  private stemProgram: Compiled | null = null;
  private parallel = false;
  private linked = false;
  private vao: WebGLVertexArrayObject | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private petalRanges: [number, number][] = [];
  private stemRanges: [number, number][] = [];
  private dataTexture: WebGLTexture | null = null;
  private stemTexture: WebGLTexture | null = null;
  private paletteTexture: WebGLTexture | null = null;
  private software = false;

  private cssWidth = 0;
  private cssHeight = 0;
  private zoom = 1;
  private bufferWidth = 0;
  private bufferHeight = 0;

  private paletteKey = "";
  private paletteBytes = new Uint8Array(PALETTE_WIDTH * 4);
  private curveKey = Number.NaN;
  private stemPos = new Float64Array(STEM_SAMPLES * 3);
  private stemNormal = new Float64Array(STEM_SAMPLES * 3);
  private stemBinormal = new Float64Array(STEM_SAMPLES * 3);
  private stemUpload = new Float32Array(STEM_SAMPLES * 12);

  private centers = new Float64Array(MAX_ELLIPSOIDS * 12);
  private eggs = new Float64Array(MAX_ELLIPSOIDS);
  private lodOf = new Int32Array(MAX_ELLIPSOIDS);
  private upload = new Float32Array(MAX_ELLIPSOIDS * 16);
  private lodCounts = new Int32Array(PETAL_LODS.length);
  private lodStarts = new Int32Array(PETAL_LODS.length);
  private lodCursor = new Int32Array(PETAL_LODS.length);
  private tips = new Float64Array(MAX_PETALS * 3);
  private swell = new Float64Array(MAX_PETALS);
  private swellSpeed = new Float64Array(MAX_PETALS);
  private swellTarget = new Float64Array(MAX_PETALS);

  private loopTime = 0;
  private flowPhase = 0;
  private grainSeed = 0;
  private birth = 0;
  private entranceOn = false;
  private entranceDone = true;
  private look = { x: 0, y: 0, vx: 0, vy: 0 };
  private lookTarget = { x: 0, y: 0 };
  private bob = { x: 0, y: 0, vx: 0, vy: 0, squash: 0, at: -1 };
  private pointer: PointerState = {
    cx: 0,
    cy: 0,
    inside: false,
    moved: false,
    down: false,
    id: -1,
    sx: 0,
    sy: 0,
    type: "mouse",
    tap: false,
  };
  private box = { x: 0, y: 0, has: false };
  private rectWidth = 0;
  private rectLeft = 0;
  private rectTop = 0;

  private world = new Float64Array(9);
  private camera = new Float64Array(9);
  private scratchA = new Float64Array(9);
  private scratchB = new Float64Array(9);
  private scratchC = new Float64Array(9);
  private lens = { cx: 0, cy: 0, f: 1, c: 1, s: 0, sx: 0, sy: 0, d: 20 };

  private raf = 0;
  private dirty = true;
  private visible = true;
  private lastTick = -1;
  private lastDraw = -1;
  private frameSamples = new Float64Array(15);
  private frameCursor = 0;
  private frameCount = 0;
  private frameMs = 16.67;
  private stride = 1;
  private drawSamples = new Float64Array(9);
  private drawCursor = 0;
  private drawCount = 0;
  private qualityIndex = 0;
  private quality = 1;
  private framesDrawn = 0;
  private slowSince = -1;
  private fastSince = -1;
  private qualityHold = { dir: 0, at: 0, before: 0 };
  private slowBlockedUntil = 0;
  private fastBlockedUntil = 0;
  private slowBackoff = 30_000;
  private fastBackoff = 30_000;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private removed = false;

  constructor(
    private host: HTMLElement,
    private canvas: HTMLCanvasElement,
    private readSettings: () => BalloonZinniaSettings,
  ) {}

  start() {
    if (!this.bind()) {
      this.canvas.style.display = "none";
      return;
    }
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      this.cssWidth = entry.contentRect.width;
      this.cssHeight = entry.contentRect.height;
      const box = this.host.getBoundingClientRect();
      if (this.cssWidth > 0) {
        const next = box.width / this.cssWidth;
        if (Math.abs(next - this.zoom) / this.zoom > 0.05) this.zoom = next;
      }
      this.request();
    });
    this.resizeObserver.observe(this.host);
    if (typeof IntersectionObserver === "function") {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) this.visible = entry.isIntersecting;
        if (this.visible) this.request();
      });
      this.intersectionObserver.observe(this.host);
    }
    this.host.addEventListener("pointermove", this.onMove);
    this.host.addEventListener("pointerenter", this.onMove);
    this.host.addEventListener("pointerleave", this.onLeave);
    this.host.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onUp);
    window.addEventListener("scroll", this.onScroll, {
      passive: true,
      capture: true,
    });
    document.addEventListener("visibilitychange", this.onVisible);
    this.canvas.addEventListener("webglcontextlost", this.onLost);
    this.canvas.addEventListener("webglcontextrestored", this.onRestored);
    this.request();
  }

  /** Draw again. Prop changes and pointer movement both come through here. */
  request() {
    this.dirty = true;
    if (
      this.raf ||
      this.lost ||
      !this.visible ||
      document.hidden ||
      this.removed
    )
      return;
    this.raf = requestAnimationFrame(this.tick);
  }

  destroy() {
    this.removed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.host.removeEventListener("pointermove", this.onMove);
    this.host.removeEventListener("pointerenter", this.onMove);
    this.host.removeEventListener("pointerleave", this.onLeave);
    this.host.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onUp);
    window.removeEventListener("scroll", this.onScroll, { capture: true });
    document.removeEventListener("visibilitychange", this.onVisible);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.release();
  }

  private bind() {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) return false;
    this.gl = gl;
    this.parallel = !!gl.getExtension("KHR_parallel_shader_compile");
    const petal = compile(gl, PETAL_VERT, PETAL_FRAG);
    const stem = compile(gl, STEM_VERT, STEM_FRAG);
    if (!petal || !stem) return false;
    this.petalProgram = petal;
    this.stemProgram = stem;
    this.linked = false;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    let indexCount = 0;
    for (const [lon, lat] of PETAL_LODS) indexCount += lon * lat * 6;
    for (const round of STEM_ROUNDS)
      indexCount += (STEM_SAMPLES - 1) * round * 6;
    const indices = new Uint32Array(indexCount);
    let cursor = 0;
    this.petalRanges = [];
    for (const [lon, lat] of PETAL_LODS) {
      const start = cursor;
      for (let y = 0; y < lat; y++) {
        for (let x = 0; x < lon; x++) {
          const a = y * lon + x;
          const b = y * lon + ((x + 1) % lon);
          const c = (y + 1) * lon + x;
          const d = (y + 1) * lon + ((x + 1) % lon);
          indices[cursor++] = a;
          indices[cursor++] = b;
          indices[cursor++] = c;
          indices[cursor++] = b;
          indices[cursor++] = d;
          indices[cursor++] = c;
        }
      }
      this.petalRanges.push([start * 4, cursor - start]);
    }
    this.stemRanges = [];
    for (const round of STEM_ROUNDS) {
      const start = cursor;
      for (let y = 0; y < STEM_SAMPLES - 1; y++) {
        for (let x = 0; x < round; x++) {
          const a = y * round + x;
          const b = y * round + ((x + 1) % round);
          const c = (y + 1) * round + x;
          const d = (y + 1) * round + ((x + 1) % round);
          indices[cursor++] = a;
          indices[cursor++] = c;
          indices[cursor++] = b;
          indices[cursor++] = b;
          indices[cursor++] = c;
          indices[cursor++] = d;
        }
      }
      this.stemRanges.push([start * 4, cursor - start]);
    }
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debug
      ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
      : "";
    this.software = /swiftshader|llvmpipe|software|basic render/i.test(
      renderer,
    );
    this.dataTexture = this.floatTexture(4, MAX_ELLIPSOIDS);
    this.stemTexture = this.floatTexture(3, STEM_SAMPLES);
    this.paletteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    gl.texStorage2D(
      gl.TEXTURE_2D,
      Math.log2(PALETTE_WIDTH) + 1,
      gl.RGBA8,
      PALETTE_WIDTH,
      1,
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.paletteKey = "";
    this.curveKey = Number.NaN;
    this.loopTime = 0;
    this.flowPhase = 0;
    return true;
  }

  private floatTexture(width: number, height: number) {
    const gl = this.gl;
    if (!gl) return null;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, width, height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  private release() {
    const gl = this.gl;
    if (!gl || gl.isContextLost()) {
      this.gl = null;
      return;
    }
    if (this.petalProgram) gl.deleteProgram(this.petalProgram.program);
    if (this.stemProgram) gl.deleteProgram(this.stemProgram.program);
    for (const texture of [
      this.dataTexture,
      this.stemTexture,
      this.paletteTexture,
    ]) {
      if (texture) gl.deleteTexture(texture);
    }
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    if (this.vao) gl.deleteVertexArray(this.vao);
    this.petalProgram = null;
    this.stemProgram = null;
    this.gl = null;
  }

  private reduced() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  private motionOn(settings: BalloonZinniaSettings) {
    if (this.reduced()) return false;
    const speed = num(settings.motion.speed, 5);
    if (speed <= 0) return false;
    return (
      num(settings.motion.sway, 5) > 0 ||
      num(settings.motion.breathe, 5) > 0 ||
      num(settings.motion.flow, 5) !== 0 ||
      num(settings.motion.pulse, 5) > 0
    );
  }

  private settling() {
    if (!this.linked || !this.entranceDone) return true;
    if (
      Math.abs(this.look.vx) + Math.abs(this.look.vy) > 1e-5 ||
      Math.abs(this.look.x - this.lookTarget.x) +
        Math.abs(this.look.y - this.lookTarget.y) >
        1e-5
    ) {
      return true;
    }
    if (
      Math.abs(this.bob.x) +
        Math.abs(this.bob.y) +
        Math.abs(this.bob.vx) +
        Math.abs(this.bob.vy) >
        1e-5 ||
      this.bob.at >= 0
    ) {
      return true;
    }
    for (let i = 0; i < MAX_PETALS; i++) {
      if (
        Math.abs(this.swellSpeed[i] ?? 0) > 1e-4 ||
        Math.abs((this.swell[i] ?? 0) - (this.swellTarget[i] ?? 0)) > 1e-4
      ) {
        return true;
      }
    }
    return false;
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (this.removed || this.lost || !this.visible || document.hidden) {
      this.lastTick = -1;
      this.lastDraw = -1;
      return;
    }
    if (this.lastTick >= 0) {
      const gap = now - this.lastTick;
      if (gap > 2 && gap < 120) {
        this.frameSamples[this.frameCursor] = gap;
        this.frameCursor = (this.frameCursor + 1) % 15;
        this.frameCount = Math.min(15, this.frameCount + 1);
      }
    }
    this.lastTick = now;
    if (this.frameCount >= 3)
      this.frameMs = median(this.frameSamples, this.frameCount);
    const ratio = 16.667 / this.frameMs;
    if (ratio < this.stride - 0.1 || ratio >= this.stride + 1.1) {
      this.stride = Math.max(1, Math.floor(ratio + 0.1));
    }
    const due =
      this.lastDraw < 0 ||
      now - this.lastDraw >= (this.stride - 0.5) * this.frameMs;
    const settings = this.readSettings();
    const alive = this.motionOn(settings) || this.settling();
    if (due && (alive || this.dirty)) {
      const gap = this.lastDraw < 0 ? 0 : now - this.lastDraw;
      if (this.lastDraw >= 0 && alive) this.adapt(now, gap);
      this.lastDraw = now;
      this.dirty = false;
      this.draw(Math.min(0.1, gap / 1000), settings);
    }
    if (this.motionOn(settings) || this.settling() || this.dirty) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.lastTick = -1;
      this.lastDraw = -1;
    }
  };

  private adapt(now: number, gap: number) {
    this.framesDrawn++;
    if (this.framesDrawn < 30) return;
    this.drawSamples[this.drawCursor] = gap;
    this.drawCursor = (this.drawCursor + 1) % 9;
    this.drawCount = Math.min(9, this.drawCount + 1);
    const typical = median(this.drawSamples, this.drawCount);
    const budget = Math.min(this.stride * this.frameMs, 33.4);
    if (this.qualityHold.dir !== 0) {
      if (now - this.qualityHold.at < 1500 || this.drawCount < 9) return;
      if (
        this.qualityHold.dir < 0 &&
        typical > this.qualityHold.before * 0.87
      ) {
        this.qualityIndex--;
        this.slowBlockedUntil = now + this.slowBackoff;
        this.slowBackoff *= 2;
      } else if (
        this.qualityHold.dir > 0 &&
        typical > this.qualityHold.before * 1.13
      ) {
        this.qualityIndex++;
        this.fastBlockedUntil = now + this.fastBackoff;
        this.fastBackoff *= 2;
      }
      this.qualityHold.dir = 0;
      this.quality = QUALITY[this.qualityIndex] ?? 1;
      return;
    }
    const slow = typical > 1.3 * budget || this.frameMs > 21;
    if (
      slow &&
      this.qualityIndex < QUALITY.length - 1 &&
      now > this.slowBlockedUntil
    ) {
      if (this.slowSince < 0) this.slowSince = now;
      if (now - this.slowSince > 600) {
        this.qualityIndex++;
        this.qualityHold = { dir: -1, at: now, before: typical };
        this.drawCount = 0;
        this.slowSince = -1;
      }
    } else {
      this.slowSince = -1;
    }
    if (
      !slow &&
      typical < 1.1 * budget &&
      this.qualityIndex > 0 &&
      now > this.fastBlockedUntil
    ) {
      if (this.fastSince < 0) this.fastSince = now;
      if (now - this.fastSince > 4000) {
        this.qualityIndex--;
        this.qualityHold = { dir: 1, at: now, before: typical };
        this.drawCount = 0;
        this.fastSince = -1;
      }
    } else {
      this.fastSince = -1;
    }
    this.quality = QUALITY[this.qualityIndex] ?? 1;
  }

  private uniform(compiled: Compiled, name: string) {
    const gl = this.gl;
    if (!gl) return null;
    let location = compiled.loc.get(name);
    if (location === undefined) {
      location = gl.getUniformLocation(compiled.program, name);
      compiled.loc.set(name, location);
    }
    return location;
  }

  private changed(compiled: Compiled, name: string, a: number, b = 0, c = 0) {
    let slot = compiled.cache.get(name);
    if (!slot) {
      slot = new Float64Array([Number.NaN, Number.NaN, Number.NaN]);
      compiled.cache.set(name, slot);
    }
    if (slot[0] === a && slot[1] === b && slot[2] === c) return false;
    slot[0] = a;
    slot[1] = b;
    slot[2] = c;
    return true;
  }

  private f1(compiled: Compiled, name: string, value: number) {
    const gl = this.gl;
    if (!gl || !this.changed(compiled, name, value)) return;
    gl.uniform1f(this.uniform(compiled, name), value);
  }

  private f2(compiled: Compiled, name: string, x: number, y: number) {
    const gl = this.gl;
    if (!gl || !this.changed(compiled, name, x, y)) return;
    gl.uniform2f(this.uniform(compiled, name), x, y);
  }

  private f3(
    compiled: Compiled,
    name: string,
    x: number,
    y: number,
    z: number,
  ) {
    const gl = this.gl;
    if (!gl || !this.changed(compiled, name, x, y, z)) return;
    gl.uniform3f(this.uniform(compiled, name), x, y, z);
  }

  private i1(compiled: Compiled, name: string, value: number) {
    const gl = this.gl;
    if (!gl || !this.changed(compiled, name, value)) return;
    gl.uniform1i(this.uniform(compiled, name), value);
  }

  private pushEllipsoid(
    count: number,
    cx: number,
    cy: number,
    cz: number,
    ux: number,
    uy: number,
    uz: number,
    vx: number,
    vy: number,
    vz: number,
    length: number,
    width: number,
    depth: number,
    egg = 0,
  ) {
    if (count >= MAX_ELLIPSOIDS) return count;
    this.eggs[count] = egg;
    const wx = uy * vz - uz * vy;
    const wy = uz * vx - ux * vz;
    const wz = ux * vy - uy * vx;
    const o = count * 12;
    this.centers[o] = cx;
    this.centers[o + 1] = cy;
    this.centers[o + 2] = cz;
    this.centers[o + 3] = ux * length;
    this.centers[o + 4] = uy * length;
    this.centers[o + 5] = uz * length;
    this.centers[o + 6] = vx * width;
    this.centers[o + 7] = vy * width;
    this.centers[o + 8] = vz * width;
    this.centers[o + 9] = wx * depth;
    this.centers[o + 10] = wy * depth;
    this.centers[o + 11] = wz * depth;
    return count + 1;
  }

  private draw(dt: number, settings: BalloonZinniaSettings) {
    const gl = this.gl;
    const petal = this.petalProgram;
    const stem = this.stemProgram;
    if (!gl || !petal || !stem || this.cssWidth < 2 || this.cssHeight < 2)
      return;
    if (!this.linked) {
      const petalReady = programReady(gl, petal, this.parallel);
      const stemReady = programReady(gl, stem, this.parallel);
      if (!petalReady || !stemReady) {
        this.dirty = true;
        return;
      }
      if (!petal.linked || !stem.linked) {
        this.canvas.style.display = "none";
        this.petalProgram = null;
        this.stemProgram = null;
        return;
      }
      this.linked = true;
      this.entranceOn = settings.entrance.animate && !this.reduced();
      this.entranceDone = !this.entranceOn;
      this.birth = 0;
    }

    const reduced = this.reduced();
    const dpr =
      typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 1;
    let pixelScale = Math.min(dpr, 2) * clamp(this.zoom, 1, 2);
    const budget = Math.sqrt(320_000 / (this.cssWidth * this.cssHeight));
    pixelScale = Math.min(pixelScale, Math.max(budget, 1));
    pixelScale = Math.max(Math.min(1, pixelScale), pixelScale * this.quality);
    const nextWidth = Math.max(1, Math.round(this.cssWidth * pixelScale));
    const nextHeight = Math.max(1, Math.round(this.cssHeight * pixelScale));
    if (nextWidth !== this.bufferWidth || nextHeight !== this.bufferHeight) {
      this.canvas.width = nextWidth;
      this.canvas.height = nextHeight;
      this.bufferWidth = nextWidth;
      this.bufferHeight = nextHeight;
    }
    const pixel = this.bufferWidth / this.cssWidth;
    const advanced = settings.advanced;
    const sway = reduced ? 0 : clamp(num(settings.motion.sway, 5), 0, 10) / 5;
    const breathe = reduced
      ? 0
      : clamp(num(settings.motion.breathe, 5), 0, 10) / 5;
    const pulse = reduced ? 0 : clamp(num(settings.motion.pulse, 5), 0, 10) / 5;
    const speed = clamp(num(settings.motion.speed, 5), 0, 10);
    const rate = speed > 0 ? 2 ** ((speed - 5) / 2.5) : 0;
    const period = clamp(num(advanced.swayPeriod, 14), 1, 120);
    if (!reduced && rate > 0) {
      this.loopTime += dt * rate;
      this.loopTime -= Math.floor(this.loopTime / period) * period;
      const flow = clamp(num(settings.motion.flow, 5), -10, 10) / 5;
      this.flowPhase += (dt * rate * flow * FLOWS) / period;
      this.flowPhase -= Math.floor(this.flowPhase);
      this.grainSeed = (this.grainSeed + 1) & 65535;
    }
    if (this.entranceOn && !this.entranceDone) this.birth += dt;
    const phase = this.loopTime / period;
    const composition = Math.min(
      this.cssHeight,
      this.cssWidth / COMPOSITION_ASPECT,
    );
    const scale = clamp(num(settings.scale, 100), 30, 100) / 100;
    const lens = clamp(num(advanced.lens, 12), 2, 60);
    this.lens.d = 1 / (2 * COMPOSITION_HALF * Math.tan((lens * DEG) / 2));
    this.lens.f = COMPOSITION_HALF * composition * scale * this.lens.d;
    const roll = clamp(num(settings.placement.angle, 0), -180, 180) * DEG;
    this.lens.c = Math.cos(roll);
    this.lens.s = Math.sin(roll);
    this.lens.sx = 0;
    this.lens.sy = HEAD_LIFT * composition * scale;
    this.lens.cx =
      this.cssWidth / 2 +
      (clamp(num(settings.placement.x, 0), -50, 50) / 100) * this.cssWidth;
    this.lens.cy =
      this.cssHeight / 2 +
      (clamp(num(settings.placement.y, 0), -50, 50) / 100) * this.cssHeight;

    if (this.pointer.moved) {
      this.pointer.moved = false;
      this.readRect();
      if (this.rectWidth > 0) {
        const toCss = this.cssWidth / this.rectWidth;
        this.box.x = (this.pointer.cx - this.rectLeft) * toCss;
        this.box.y = (this.pointer.cy - this.rectTop) * toCss;
        this.box.has = true;
      }
    }

    const tracking =
      this.box.has &&
      this.pointer.inside &&
      !reduced &&
      (this.pointer.type === "mouse" ||
        this.pointer.type === "pen" ||
        this.pointer.down);
    const headX =
      this.lens.cx + this.lens.c * this.lens.sx + this.lens.s * this.lens.sy;
    const headY =
      this.lens.cy - (-this.lens.s * this.lens.sx + this.lens.c * this.lens.sy);
    const follow = clamp(num(settings.response.follow, 5), 0, 10) / 10;
    this.lookTarget.x = 0;
    this.lookTarget.y = 0;
    if (tracking && follow > 0 && this.pointer.type !== "touch") {
      const dx = this.box.x - headX;
      const dy = this.box.y - headY;
      const nx = clamp(
        (this.lens.c * dx - this.lens.s * dy) / (0.5 * composition * scale),
        -1,
        1,
      );
      const ny = clamp(
        (this.lens.s * dx + this.lens.c * dy) / (0.5 * composition * scale),
        -1,
        1,
      );
      this.lookTarget.x = nx * FOLLOW_YAW * follow;
      this.lookTarget.y = ny * FOLLOW_PITCH * follow;
    }
    const followEase = clamp(num(advanced.followEase, 0.3), 0.02, 3);
    if (reduced) {
      this.look.x = this.lookTarget.x;
      this.look.y = this.lookTarget.y;
      this.look.vx = 0;
      this.look.vy = 0;
    } else {
      const nextX = spring(
        this.look.x,
        this.look.vx,
        this.lookTarget.x,
        followEase,
        dt,
      );
      this.look.x = nextX[0];
      this.look.vx = nextX[1];
      const nextY = spring(
        this.look.y,
        this.look.vy,
        this.lookTarget.y,
        followEase,
        dt,
      );
      this.look.y = nextY[0];
      this.look.vy = nextY[1];
    }

    const bounceOmega = TAU * BOUNCE_RATE;
    let bounceTime = dt;
    while (bounceTime > 1e-6) {
      const step = Math.min(0.004, bounceTime);
      bounceTime -= step;
      this.bob.vx +=
        (-bounceOmega * bounceOmega * this.bob.x -
          2 * BOUNCE_DAMP * bounceOmega * this.bob.vx) *
        step;
      this.bob.vy +=
        (-bounceOmega * bounceOmega * this.bob.y -
          2 * BOUNCE_DAMP * bounceOmega * this.bob.vy) *
        step;
      this.bob.x += this.bob.vx * step;
      this.bob.y += this.bob.vy * step;
    }
    if (
      Math.abs(this.bob.x) + Math.abs(this.bob.y) < 2e-5 &&
      Math.abs(this.bob.vx) + Math.abs(this.bob.vy) < 2e-4
    ) {
      this.bob.x = 0;
      this.bob.y = 0;
      this.bob.vx = 0;
      this.bob.vy = 0;
    }
    if (this.bob.at >= 0) {
      this.bob.at += dt;
      if (this.bob.at > 2.5) this.bob.at = -1;
    }
    this.bob.squash =
      this.bob.at >= 0
        ? Math.exp(-this.bob.at / 0.35) * Math.sin(TAU * 3.2 * this.bob.at)
        : 0;

    const tilt = clamp(num(settings.placement.tilt, 0), -90, 90) * DEG;
    const lean = clamp(num(advanced.lean, 48), -90, 90) * DEG;
    const swayAngle =
      -sway *
      clamp(num(advanced.swayYaw, 29), 0, 90) *
      DEG *
      Math.cos(TAU * phase);
    const yaw = swayAngle + this.look.x + this.bob.x;
    const pitch = this.look.y + this.bob.y;
    rotX(-(lean + tilt), this.scratchA);
    rotX(pitch, this.scratchB);
    mulMat(this.scratchB, this.scratchA, this.scratchC);
    rotY(yaw, this.scratchA);
    mulMat(this.scratchA, this.scratchC, this.world);
    this.camera.set(this.world);

    const pulseDepth = Math.min(
      0.9,
      (clamp(num(advanced.pulseDepth, 36), 0, 90) / 100) * pulse,
    );
    const bands =
      BAND_BASE *
      2 ** ((clamp(num(settings.bands, 5), 0, 10) - 5) / 2.5) *
      (1 + pulseDepth * Math.cos(TAU * PULSES * (phase - PULSE_PHASE)));
    const bandAngle = clamp(num(advanced.bandAxis, 48), -90, 90) * DEG + tilt;
    const bandSin = Math.sin(bandAngle);
    const bandCos = Math.cos(bandAngle);
    const swaySin = Math.sin(swayAngle);
    const swayCos = Math.cos(swayAngle);
    const bandX = bandCos * swaySin * bands;
    const bandY = bandSin * bands;
    const bandZ = bandCos * swayCos * bands;
    const headWorldX = -HEAD_DEPTH * bandCos * swaySin;
    const headWorldY = -HEAD_DEPTH * bandSin;
    const headWorldZ = -this.lens.d - HEAD_DEPTH * bandCos * swayCos;
    const bandPhase = num(advanced.phase, 60) / 100 - this.flowPhase;
    const breathWave = Math.cos(TAU * BREATHS * (phase - OPEN_PHASE));
    const petalPhase =
      breathe * BREATH_SHIFT * Math.cos(TAU * BREATHS * (phase - BAND_PHASE));

    const petalCount = Math.round(clamp(num(settings.petals, 22), 6, 24));
    const reach = clamp(num(settings.petalLength, 200), 40, 200) / 100;
    const width = clamp(num(settings.petalWidth, 100), 30, 250) / 100;
    const puff = clamp(num(settings.puff, 134), 20, 250) / 100;
    const length = LENGTH_SCALE * reach;
    const across = Math.min(WIDTH_SCALE * width * (WIDTH_AT / petalCount), 0.7);
    const thick = PUFF_SCALE * puff;
    const cup = clamp(num(advanced.cup, 25), -60, 60) * DEG;
    const open =
      cup +
      breathWave * breathe * clamp(num(advanced.breatheAngle, 35), 0, 80) * DEG;
    const lift =
      -length * (1 - 2 * PETAL_HINGE) * (Math.sin(open) - Math.sin(cup)) +
      -breathe * BREATH_LIFT * Math.cos(TAU * BREATHS * (phase - BREATH_PHASE));
    const twist = clamp(num(advanced.twist, 0), -60, 60) * DEG;
    const stagger = clamp(num(settings.entrance.stagger, 5), 0, 10) * 0.012;
    const bloomTime = clamp(num(advanced.bloomTime, 0.9), 0.1, 5);
    const delay = Math.max(0, num(settings.entrance.delay, 0));
    const bloom = (order: number) => {
      if (!this.entranceOn || this.entranceDone) return 1;
      const t = clamp((this.birth - delay - stagger * order) / bloomTime, 0, 1);
      if (t <= 0) return 0;
      const e = t - 1;
      return 1 + 2.4 * e * e * e + 1.4 * e * e;
    };
    const squash = this.bob.squash * 0.07;
    let count = 0;
    for (let i = 0; i < petalCount; i++) {
      const around = Math.PI / 2 + (TAU * i) / petalCount;
      const px = Math.cos(around);
      const py = Math.sin(around);
      const grown = bloom(Math.min(i, petalCount - i));
      if (grown <= 0.001) continue;
      const scalePetal = grown * (1 + SWELL_GAIN * (this.swell[i] ?? 0));
      const openCos = Math.cos(open);
      const openSin = Math.sin(open);
      const axisX = px * openCos;
      const axisY = py * openCos;
      const axisZ = openSin;
      const twistCos = Math.cos(twist);
      const twistSin = Math.sin(twist);
      const sideX = -py * twistCos - px * openSin * twistSin;
      const sideY = px * twistCos - py * openSin * twistSin;
      const sideZ = openCos * twistSin;
      const petalLength = length * scalePetal * (1 - squash);
      const root = PETAL_ROOT + 2 * length * PETAL_HINGE;
      const along = petalLength * (1 - 2 * PETAL_HINGE);
      const centerX = px * root + axisX * along;
      const centerY = py * root + axisY * along;
      const centerZ = axisZ * along + lift;
      count = this.pushEllipsoid(
        count,
        centerX,
        centerY,
        centerZ,
        axisX,
        axisY,
        axisZ,
        sideX,
        sideY,
        sideZ,
        petalLength,
        across * scalePetal * (1 + squash),
        thick * scalePetal * (1 + squash),
        EGG,
      );
      const tipX = axisY * sideZ - axisZ * sideY;
      const tipY = axisZ * sideX - axisX * sideZ;
      const tipZ = axisX * sideY - axisY * sideX;
      this.tips[i * 3] = centerX + tipX * thick;
      this.tips[i * 3 + 1] = centerY + tipY * thick;
      this.tips[i * 3 + 2] = centerZ + tipZ * thick;
    }

    const ribs = Math.round(clamp(num(advanced.ribs, 10), 0, 24));
    const ribTilt = clamp(RIB_ANGLE + RIB_SWING * breathWave, 0, 89) * DEG;
    for (let i = 0; i < ribs; i++) {
      const around = Math.PI / 2 + (TAU * (i + 0.5)) / ribs;
      const px = Math.cos(around);
      const py = Math.sin(around);
      const grown = bloom(
        petalCount / 2 +
          Math.min(i, ribs - i) * (petalCount / Math.max(ribs, 1)),
      );
      if (grown <= 0.001) continue;
      const axisX = -px * Math.cos(ribTilt);
      const axisY = -py * Math.cos(ribTilt);
      const axisZ = Math.sin(ribTilt);
      const ribLength = RIB_LENGTH * grown;
      count = this.pushEllipsoid(
        count,
        px * RIB_RADIUS + axisX * ribLength,
        py * RIB_RADIUS + axisY * ribLength,
        axisZ * ribLength + lift,
        axisX,
        axisY,
        axisZ,
        -py,
        px,
        0,
        ribLength,
        RIB_GIRTH * grown,
        RIB_GIRTH * grown,
      );
    }
    count = this.pushEllipsoid(
      count,
      0,
      0,
      THROAT_Z,
      1,
      0,
      0,
      0,
      1,
      0,
      THROAT_R,
      THROAT_R,
      THROAT_DEPTH,
    );
    count = this.pushEllipsoid(
      count,
      0,
      0,
      CORE_Z + lift,
      1,
      0,
      0,
      0,
      1,
      0,
      CORE_R,
      CORE_R,
      CORE_DEPTH,
    );

    const nod =
      -breathWave * breathe * clamp(num(advanced.nodAngle, 0), 0, 60) * DEG;
    if (nod !== 0) {
      const nodCos = Math.cos(nod);
      const nodSin = Math.sin(nod);
      for (let i = 0; i < count; i++) {
        const o = i * 12;
        for (let axis = 0; axis < 4; axis++) {
          const y = this.centers[o + axis * 3 + 1] ?? 0;
          const z =
            (this.centers[o + axis * 3 + 2] ?? 0) - (axis === 0 ? NECK : 0);
          this.centers[o + axis * 3 + 1] = nodCos * y - nodSin * z;
          this.centers[o + axis * 3 + 2] =
            nodSin * y + nodCos * z + (axis === 0 ? NECK : 0);
        }
      }
      for (let i = 0; i < petalCount; i++) {
        const y = this.tips[i * 3 + 1] ?? 0;
        const z = (this.tips[i * 3 + 2] ?? 0) - NECK;
        this.tips[i * 3 + 1] = nodCos * y - nodSin * z;
        this.tips[i * 3 + 2] = nodSin * y + nodCos * z + NECK;
      }
    }

    const swellAmount = clamp(num(settings.response.swell, 5), 0, 10) / 10;
    const reachPx =
      composition *
      scale *
      (0.03 + 0.014 * clamp(num(settings.response.reach, 5), 0, 10));
    this.swellTarget.fill(0);
    if (tracking && swellAmount > 0 && this.box.has) {
      for (let i = 0; i < petalCount; i++) {
        if (
          !this.project(
            this.tips[i * 3] ?? 0,
            this.tips[i * 3 + 1] ?? 0,
            this.tips[i * 3 + 2] ?? 0,
          )
        ) {
          continue;
        }
        const dist = Math.hypot(
          this.box.x - this.projected.x,
          this.box.y - this.projected.y,
        );
        this.swellTarget[i] = Math.exp(-((dist / reachPx) ** 2)) * swellAmount;
      }
    }
    for (let i = 0; i < MAX_PETALS; i++) {
      if (reduced) {
        this.swell[i] = this.swellTarget[i] ?? 0;
        this.swellSpeed[i] = 0;
      } else {
        const next = spring(
          this.swell[i] ?? 0,
          this.swellSpeed[i] ?? 0,
          this.swellTarget[i] ?? 0,
          0.14,
          dt,
        );
        this.swell[i] = next[0];
        this.swellSpeed[i] = next[1];
      }
    }

    if (this.pointer.tap) {
      this.pointer.tap = false;
      const bounce = reduced
        ? 0
        : clamp(num(settings.response.bounce, 5), 0, 10) / 10;
      if (bounce > 0 && this.box.has) {
        const dx = this.box.x - headX;
        const dy = this.box.y - headY;
        const nx =
          (this.lens.c * dx - this.lens.s * dy) / (0.5 * composition * scale);
        const ny =
          (this.lens.s * dx + this.lens.c * dy) / (0.5 * composition * scale);
        const mag = Math.hypot(nx, ny);
        if (mag < 1.4) {
          const kx = mag > 0.001 ? nx / mag : 0;
          const ky = mag > 0.001 ? ny / mag : 0;
          this.bob.vx += kx * BOUNCE_KICK * bounce;
          this.bob.vy -= ky * BOUNCE_KICK * bounce;
          this.bob.at = 0;
        }
      }
    }

    const lodScale = (this.software ? LOD_SOFT : LOD_SOLID) / this.quality;
    this.lodCounts.fill(0);
    for (let i = 0; i < count; i++) {
      const o = i * 12;
      const depth =
        (this.camera[6] ?? 0) * (this.centers[o] ?? 0) +
        (this.camera[7] ?? 0) * (this.centers[o + 1] ?? 0) +
        (this.camera[8] ?? 0) * (this.centers[o + 2] ?? 0) -
        this.lens.d;
      const radius = Math.max(
        Math.hypot(
          this.centers[o + 3] ?? 0,
          this.centers[o + 4] ?? 0,
          this.centers[o + 5] ?? 0,
        ),
        Math.hypot(
          this.centers[o + 6] ?? 0,
          this.centers[o + 7] ?? 0,
          this.centers[o + 8] ?? 0,
        ),
        Math.hypot(
          this.centers[o + 9] ?? 0,
          this.centers[o + 10] ?? 0,
          this.centers[o + 11] ?? 0,
        ),
      );
      const pixels =
        (this.lens.f * pixel * radius) / Math.max(NEAR, -depth - radius);
      const needed = Math.PI * Math.sqrt(pixels / (2 * lodScale));
      let lod = 0;
      while (
        lod < PETAL_LODS.length - 1 &&
        (PETAL_LODS[lod]?.[0] ?? 0) < needed
      )
        lod++;
      this.lodOf[i] = lod;
      this.lodCounts[lod] = (this.lodCounts[lod] ?? 0) + 1;
    }
    let packed = 0;
    for (let lod = 0; lod < PETAL_LODS.length; lod++) {
      this.lodStarts[lod] = packed;
      packed += this.lodCounts[lod] ?? 0;
    }
    this.lodCursor.set(this.lodStarts);
    for (let i = 0; i < count; i++) {
      const o = i * 12;
      const slot = (this.lodCursor[this.lodOf[i] ?? 0] ?? 0) * 16;
      this.lodCursor[this.lodOf[i] ?? 0] =
        (this.lodCursor[this.lodOf[i] ?? 0] ?? 0) + 1;
      for (let axis = 0; axis < 4; axis++) {
        const x = this.centers[o + axis * 3] ?? 0;
        const y = this.centers[o + axis * 3 + 1] ?? 0;
        const z = this.centers[o + axis * 3 + 2] ?? 0;
        this.upload[slot + axis * 4] =
          (this.camera[0] ?? 0) * x +
          (this.camera[1] ?? 0) * y +
          (this.camera[2] ?? 0) * z;
        this.upload[slot + axis * 4 + 1] =
          (this.camera[3] ?? 0) * x +
          (this.camera[4] ?? 0) * y +
          (this.camera[5] ?? 0) * z;
        this.upload[slot + axis * 4 + 2] =
          (this.camera[6] ?? 0) * x +
          (this.camera[7] ?? 0) * y +
          (this.camera[8] ?? 0) * z -
          (axis === 0 ? this.lens.d : 0);
        this.upload[slot + axis * 4 + 3] = axis === 0 ? (this.eggs[i] ?? 0) : 0;
      }
    }

    const showStem = settings.stem.show !== false;
    const curve = clamp(num(settings.stem.curve, 100), 0, 300) / 100;
    if (showStem && curve !== this.curveKey) {
      this.curveKey = curve;
      writeStem(curve, this.stemPos, this.stemNormal, this.stemBinormal);
    }
    const thickness =
      (STEM_RADIUS * clamp(num(settings.stem.thickness, 100), 20, 300)) / 100;
    let stemLod = 0;
    if (showStem) {
      for (let i = 0; i < STEM_SAMPLES; i++) {
        const p = i * 3;
        const o = i * 12;
        const x = this.stemPos[p] ?? 0;
        const y = this.stemPos[p + 1] ?? 0;
        const z = this.stemPos[p + 2] ?? 0;
        this.stemUpload[o] =
          (this.world[0] ?? 0) * x +
          (this.world[1] ?? 0) * y +
          (this.world[2] ?? 0) * z;
        this.stemUpload[o + 1] =
          (this.world[3] ?? 0) * x +
          (this.world[4] ?? 0) * y +
          (this.world[5] ?? 0) * z;
        this.stemUpload[o + 2] =
          (this.world[6] ?? 0) * x +
          (this.world[7] ?? 0) * y +
          (this.world[8] ?? 0) * z -
          this.lens.d;
        this.stemUpload[o + 3] = thickness;
        for (let axis = 0; axis < 2; axis++) {
          const source = axis === 0 ? this.stemNormal : this.stemBinormal;
          const sx = source[p] ?? 0;
          const sy = source[p + 1] ?? 0;
          const sz = source[p + 2] ?? 0;
          this.stemUpload[o + 4 + axis * 4] =
            (this.world[0] ?? 0) * sx +
            (this.world[1] ?? 0) * sy +
            (this.world[2] ?? 0) * sz;
          this.stemUpload[o + 5 + axis * 4] =
            (this.world[3] ?? 0) * sx +
            (this.world[4] ?? 0) * sy +
            (this.world[5] ?? 0) * sz;
          this.stemUpload[o + 6 + axis * 4] =
            (this.world[6] ?? 0) * sx +
            (this.world[7] ?? 0) * sy +
            (this.world[8] ?? 0) * sz;
          this.stemUpload[o + 7 + axis * 4] = 0;
        }
      }
      const stemPixels = (this.lens.f * pixel * thickness) / (this.lens.d - 3);
      const needed = Math.PI * Math.sqrt(stemPixels / (2 * lodScale));
      while (
        stemLod < STEM_ROUNDS.length - 1 &&
        (STEM_ROUNDS[stemLod] ?? 0) < needed
      )
        stemLod++;
    }

    const colorKey = JSON.stringify(settings.colors);
    if (colorKey !== this.paletteKey && this.paletteTexture) {
      this.paletteKey = colorKey;
      writePalette(settings.colors, this.paletteBytes);
      gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        PALETTE_WIDTH,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.paletteBytes,
      );
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.bufferWidth, this.bufferHeight);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
    if (count > 0 && this.dataTexture) {
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        4,
        count,
        gl.RGBA,
        gl.FLOAT,
        this.upload,
      );
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.stemTexture);
    if (showStem && this.stemTexture) {
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        3,
        STEM_SAMPLES,
        gl.RGBA,
        gl.FLOAT,
        this.stemUpload,
      );
    }
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
    const grain = clamp(num(settings.grain, 0), 0, 10) * GRAIN_SCALE;
    for (const compiled of [petal, stem]) {
      // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL binding call, not a React hook.
      gl.useProgram(compiled.program);
      this.i1(
        compiled,
        compiled === petal ? "uData" : "uStem",
        compiled === petal ? 0 : 1,
      );
      this.i1(compiled, "uPal", 2);
      this.f2(
        compiled,
        "uCenter",
        this.lens.cx * pixel,
        (this.cssHeight - this.lens.cy) * pixel,
      );
      this.f2(compiled, "uRes", this.bufferWidth, this.bufferHeight);
      this.f1(compiled, "uFocal", this.lens.f * pixel);
      this.f2(compiled, "uRoll", this.lens.c, this.lens.s);
      this.f2(compiled, "uShift", this.lens.sx * pixel, this.lens.sy * pixel);
      this.f3(compiled, "uG", bandX, bandY, bandZ);
      this.f1(
        compiled,
        "uPhase",
        compiled === petal ? bandPhase + petalPhase : bandPhase,
      );
      this.f3(compiled, "uHead", headWorldX, headWorldY, headWorldZ);
      this.f1(compiled, "uGrain", grain);
      this.f1(compiled, "uGrainPx", pixel);
      this.i1(compiled, "uSeed", this.grainSeed);
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL binding call, not a React hook.
    gl.useProgram(petal.program);
    for (let lod = 0; lod < PETAL_LODS.length; lod++) {
      const instances = this.lodCounts[lod] ?? 0;
      const range = this.petalRanges[lod];
      const mesh = PETAL_LODS[lod];
      if (!instances || !range || !mesh) continue;
      this.i1(petal, "uBase", this.lodStarts[lod] ?? 0);
      this.i1(petal, "uLon", mesh[0]);
      this.i1(petal, "uLat", mesh[1]);
      gl.drawElementsInstanced(
        gl.TRIANGLES,
        range[1],
        gl.UNSIGNED_INT,
        range[0],
        instances,
      );
    }
    if (showStem) {
      const range = this.stemRanges[stemLod];
      const round = STEM_ROUNDS[stemLod];
      if (range && round) {
        // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL binding call, not a React hook.
        gl.useProgram(stem.program);
        this.i1(stem, "uRound", round);
        gl.drawElements(gl.TRIANGLES, range[1], gl.UNSIGNED_INT, range[0]);
      }
    }
    gl.bindVertexArray(null);

    const hover =
      tracking &&
      num(settings.response.bounce, 5) > 0 &&
      Math.hypot(this.box.x - headX, this.box.y - headY) <
        0.3 * composition * scale
        ? "pointer"
        : "";
    if (this.host.style.cursor !== hover) this.host.style.cursor = hover;
    if (
      this.entranceOn &&
      !this.entranceDone &&
      this.birth > delay + stagger * (petalCount + 2) + bloomTime
    ) {
      this.entranceDone = true;
    }
  }

  private projected = { x: 0, y: 0 };

  private project(x: number, y: number, z: number) {
    const camX =
      (this.camera[0] ?? 0) * x +
      (this.camera[1] ?? 0) * y +
      (this.camera[2] ?? 0) * z;
    const camY =
      (this.camera[3] ?? 0) * x +
      (this.camera[4] ?? 0) * y +
      (this.camera[5] ?? 0) * z;
    const depth = -(
      (this.camera[6] ?? 0) * x +
      (this.camera[7] ?? 0) * y +
      (this.camera[8] ?? 0) * z -
      this.lens.d
    );
    if (depth < NEAR) return false;
    const sx = (this.lens.f * camX) / depth + this.lens.sx;
    const sy = (this.lens.f * camY) / depth + this.lens.sy;
    this.projected.x = this.lens.cx + this.lens.c * sx + this.lens.s * sy;
    this.projected.y = this.lens.cy - (-this.lens.s * sx + this.lens.c * sy);
    return true;
  }

  private readRect() {
    const box = this.host.getBoundingClientRect();
    this.rectWidth = box.width;
    this.rectLeft = box.left;
    this.rectTop = box.top;
    if (this.cssWidth > 0 && box.width > 0) {
      const next = box.width / this.cssWidth;
      if (Math.abs(next - this.zoom) / this.zoom > 0.05) this.zoom = next;
    }
  }

  private onMove = (event: PointerEvent) => {
    if (
      event.clientX === this.pointer.cx &&
      event.clientY === this.pointer.cy &&
      this.pointer.inside
    ) {
      return;
    }
    this.pointer.cx = event.clientX;
    this.pointer.cy = event.clientY;
    this.pointer.inside = true;
    this.pointer.moved = true;
    this.pointer.type = event.pointerType;
    this.request();
  };

  private onLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !this.pointer.down)
      this.pointer.inside = false;
    this.request();
  };

  private onDown = (event: PointerEvent) => {
    this.onMove(event);
    if (event.button !== 0 && event.pointerType === "mouse") return;
    this.pointer.down = true;
    this.pointer.id = event.pointerId;
    this.pointer.sx = event.clientX;
    this.pointer.sy = event.clientY;
  };

  private onUp = (event: PointerEvent) => {
    const was = this.pointer.down && this.pointer.id === event.pointerId;
    this.pointer.down = false;
    this.pointer.id = -1;
    if (
      was &&
      event.type === "pointerup" &&
      Math.abs(event.clientX - this.pointer.sx) +
        Math.abs(event.clientY - this.pointer.sy) <
        8
    ) {
      this.pointer.cx = event.clientX;
      this.pointer.cy = event.clientY;
      this.pointer.moved = true;
      this.pointer.tap = true;
    }
    if (event.pointerType === "touch") this.pointer.inside = false;
    this.request();
  };

  private onScroll = () => {
    if (!this.pointer.inside) return;
    this.pointer.moved = true;
    this.request();
  };

  private onVisible = () => {
    if (!document.hidden) this.request();
  };

  private onLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  };

  private onRestored = () => {
    this.lost = false;
    this.release();
    if (this.bind()) this.request();
  };
}
