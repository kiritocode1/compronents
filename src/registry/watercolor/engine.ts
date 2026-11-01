/// <reference types="@webgpu/types" />

/**
 * Watercolor engine: a port of the watercolor.bizar.ro simulation.
 *
 * Every frame runs one compute pass and one render pass:
 *   curl → advect velocity → divergence → pressure (odd count) → project
 *   → advect paint → spread × N → settle → render
 *
 * Water and floating pigment live in `carried` (rgb = pigment K/S, a = water).
 * Pigment that has landed lives in `deposit` (rgb = pigment, a = paper damp).
 * The velocity grid runs at half the paint resolution.
 *
 * Differences from the source are scoping only: the sheet, brush and wash are
 * sized from the canvas box instead of the window, input is read relative to
 * the canvas, and the debug timing and capture modes are gone.
 */

import {
  approach,
  clamp,
  DEFAULT_HUE,
  hexToLinear,
  hueAbsorption,
  resolveTier,
  type Sheet,
  sheetFor,
  smoothstep,
  type WatercolorQuality,
  type WatercolorSettings,
} from "./settings";
import {
  ADVECT_PAINT,
  ADVECT_VELOCITY,
  CURL,
  DIVERGENCE,
  PAPER,
  PRESSURE,
  PROJECT,
  RENDER,
  SETTLE,
  SPREAD,
} from "./shaders";

const WORKGROUP = 8;
const REDUCED_MOTION_FORCE = 0.35;
const MAX_STEP = 1 / 30;
const MAX_PIXEL_RATIO = 2;
const RESIZE_DELAY = 250;
const SCALE_STEP = 1.35;
const HUE_STEP = 12;

const UNIFORMS = [
  "paint",
  "flow",
  "time",
  "brushStart",
  "brushEnd",
  "brushColor",
  "brushVelocity",
  "spread",
  "settle",
  "dry",
  "motion",
  "paper",
  "light",
  "look",
  "grade",
  "wipe",
] as const;
type Uniform = (typeof UNIFORMS)[number];
type Vec4 = [number, number, number, number];

/** Mirrors the WGSL `Frame` struct: sixteen vec4f in declaration order. */
class FrameData {
  readonly data = new Float32Array(UNIFORMS.length * 4);
  set(name: Uniform, value: Vec4) {
    this.data.set(value, UNIFORMS.indexOf(name) * 4);
  }
}

type Binding = "image" | "raw" | GPUTextureFormat;

const PASSES = {
  advectPaint: {
    bindings: ["image", "image", "image", "rgba16float"],
    source: ADVECT_PAINT,
  },
  advectVelocity: {
    bindings: ["image", "raw", "image", "rgba16float"],
    source: ADVECT_VELOCITY,
  },
  curl: { bindings: ["image", "r32float"], source: CURL },
  divergence: {
    bindings: ["image", "raw", "r32float", "r32float"],
    source: DIVERGENCE,
  },
  paper: { bindings: ["rgba8unorm"], source: PAPER },
  pressure: { bindings: ["raw", "raw", "r32float"], source: PRESSURE },
  project: { bindings: ["image", "raw", "rgba16float"], source: PROJECT },
  settle: {
    bindings: ["image", "image", "image", "rgba16float", "rgba16float"],
    source: SETTLE,
  },
  spread: {
    bindings: ["image", "image", "image", "rgba16float"],
    source: SPREAD,
  },
} satisfies Record<string, { bindings: Binding[]; source: string }>;
type PassName = keyof typeof PASSES;

function layoutEntry(
  kind: Binding,
  binding: number,
  visibility: number,
): GPUBindGroupLayoutEntry {
  if (kind === "image") {
    return {
      binding,
      texture: { sampleType: "float", viewDimension: "2d" },
      visibility,
    };
  }
  if (kind === "raw") {
    return {
      binding,
      texture: { sampleType: "unfilterable-float", viewDimension: "2d" },
      visibility,
    };
  }
  return {
    binding,
    storageTexture: { access: "write-only", format: kind, viewDimension: "2d" },
    visibility,
  };
}

function createLayout(
  device: GPUDevice,
  label: string,
  kinds: Binding[],
  visibility: number,
) {
  return device.createBindGroupLayout({
    entries: kinds.map((kind, i) => layoutEntry(kind, i, visibility)),
    label,
  });
}

function createGroup(
  device: GPUDevice,
  label: string,
  layout: GPUBindGroupLayout,
  views: GPUTextureView[],
) {
  return device.createBindGroup({
    entries: views.map((resource, binding) => ({ binding, resource })),
    label,
    layout,
  });
}

type Pair = [GPUTextureView, GPUTextureView];

/** The ping-ponged simulation textures and the compute pass that steps them. */
class PaintSim {
  carried = 0;
  deposit = 0;
  isPaperPending = true;
  layouts = {} as Record<PassName, GPUBindGroupLayout>;
  pipelines = {} as Record<PassName, GPUComputePipeline>;
  textures: GPUTexture[] = [];
  sheet!: Sheet;
  views!: {
    carried: Pair;
    curl: GPUTextureView;
    deposit: Pair;
    divergence: GPUTextureView;
    paper: GPUTextureView;
    pressure: Pair;
    velocity: Pair;
  };
  groups: Record<string, GPUBindGroup> = {};

  constructor(
    private device: GPUDevice,
    private frameLayout: GPUBindGroupLayout,
  ) {}

  async create() {
    await Promise.all(
      (Object.entries(PASSES) as [PassName, (typeof PASSES)[PassName]][]).map(
        async ([name, { bindings, source }]) => {
          this.layouts[name] = createLayout(
            this.device,
            name,
            bindings,
            GPUShaderStage.COMPUTE,
          );
          this.pipelines[name] = await this.device.createComputePipelineAsync({
            compute: {
              entryPoint: "main",
              module: this.device.createShaderModule({
                code: source,
                label: name,
              }),
            },
            label: name,
            layout: this.device.createPipelineLayout({
              bindGroupLayouts: [this.frameLayout, this.layouts[name]],
            }),
          });
        },
      ),
    );
  }

  private texture(
    label: string,
    format: GPUTextureFormat,
    size: [number, number],
  ) {
    const texture = this.device.createTexture({
      format,
      label,
      size,
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.textures.push(texture);
    return texture.createView();
  }

  resize(sheet: Sheet) {
    this.destroyTextures();
    this.sheet = sheet;
    this.carried = 0;
    this.deposit = 0;
    this.isPaperPending = true;

    const { flow, paint } = sheet;
    const pair = (
      label: string,
      format: GPUTextureFormat,
      size: [number, number],
    ): Pair => [
      this.texture(`${label} a`, format, size),
      this.texture(`${label} b`, format, size),
    ];
    const views = {
      carried: pair("carried", "rgba16float", paint),
      curl: this.texture("curl", "r32float", flow),
      deposit: pair("deposit", "rgba16float", paint),
      divergence: this.texture("divergence", "r32float", flow),
      paper: this.texture("paper", "rgba8unorm", paint),
      pressure: pair("pressure", "r32float", flow),
      velocity: pair("velocity", "rgba16float", flow),
    };
    const {
      carried: c,
      curl,
      deposit: s,
      divergence,
      paper,
      pressure: p,
      velocity: v,
    } = views;
    const group = (name: PassName, list: GPUTextureView[]) =>
      createGroup(this.device, name, this.layouts[name], list);

    const groups: Record<string, GPUBindGroup> = {
      curl: group("curl", [v[1], curl]),
      divergence: group("divergence", [v[0], p[0], divergence, p[1]]),
      paper: group("paper", [paper]),
      pressure0: group("pressure", [p[1], divergence, p[0]]),
      pressure1: group("pressure", [p[0], divergence, p[1]]),
      project: group("project", [v[0], p[0], v[1]]),
    };
    for (const e of [0, 1] as const) {
      const other = 1 - e;
      groups[`advectVelocity${e}`] = group("advectVelocity", [
        v[1],
        curl,
        c[e],
        v[0],
      ]);
      groups[`advectPaint${e}`] = group("advectPaint", [
        v[1],
        c[e],
        paper,
        c[other],
      ]);
      for (const n of [0, 1] as const) {
        groups[`spread${e}${n}`] = group("spread", [
          c[e],
          s[n],
          paper,
          c[other],
        ]);
        groups[`settle${e}${n}`] = group("settle", [
          c[e],
          s[n],
          paper,
          c[other],
          s[1 - n],
        ]);
      }
    }
    this.views = views;
    this.groups = groups;
  }

  update(
    encoder: GPUCommandEncoder,
    frameGroup: GPUBindGroup,
    { iterations, spreads }: { iterations: number; spreads: number },
  ) {
    const workgroups = (size: [number, number]): [number, number] => [
      Math.ceil(size[0] / WORKGROUP),
      Math.ceil(size[1] / WORKGROUP),
    ];
    const flow = workgroups(this.sheet.flow);
    const paint = workgroups(this.sheet.paint);
    const pass = encoder.beginComputePass({ label: "paint" });
    const run = (name: PassName, group: string, [x, y]: [number, number]) => {
      pass.setPipeline(this.pipelines[name]);
      pass.setBindGroup(1, this.groups[group]);
      pass.dispatchWorkgroups(x, y);
    };
    const flip = () => {
      this.carried = 1 - this.carried;
    };

    pass.setBindGroup(0, frameGroup);
    if (this.isPaperPending) {
      run("paper", "paper", paint);
      this.isPaperPending = false;
    }
    run("curl", "curl", flow);
    run("advectVelocity", `advectVelocity${this.carried}`, flow);
    run("divergence", "divergence", flow);
    // Always odd, so the last write lands in pressure[0] where project reads.
    const pressureSteps = Math.floor(Math.max(1, iterations) / 2) * 2 + 1;
    for (let i = 0; i < pressureSteps; i++)
      run("pressure", `pressure${i % 2}`, flow);
    run("project", "project", flow);
    run("advectPaint", `advectPaint${this.carried}`, paint);
    flip();
    for (let i = 0; i < spreads; i++) {
      run("spread", `spread${this.carried}${this.deposit}`, paint);
      flip();
    }
    run("settle", `settle${this.carried}${this.deposit}`, paint);
    flip();
    this.deposit = 1 - this.deposit;
    pass.end();
  }

  destroyTextures() {
    for (const texture of this.textures) texture.destroy();
    this.textures = [];
  }
}

/** Bristle load wobble along a stroke. */
function bristlePulse(t: number) {
  return 0.5 + 0.3 * Math.sin(t * 2.1) + 0.2 * Math.sin(t * 5.3 + 1.7);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export interface WatercolorEngineOptions {
  canvas: HTMLCanvasElement;
  settings: WatercolorSettings;
  quality: WatercolorQuality;
  wheelControls: boolean;
  keyboardShortcuts: boolean;
  onReady: () => void;
  onFailure: () => void;
}

type PointerMode = "paint" | "smudge" | null;

export class WatercolorEngine {
  settings: WatercolorSettings;
  hue = DEFAULT_HUE;
  isRainbow = true;
  scale = 1;

  private canvas: HTMLCanvasElement;
  private quality: WatercolorQuality;
  private wheelControls: boolean;
  private keyboardShortcuts: boolean;
  private onReady: () => void;
  private onFailure: () => void;

  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private frameBuffer!: GPUBuffer;
  private frameGroup!: GPUBindGroup;
  private renderLayout!: GPUBindGroupLayout;
  private render!: GPURenderPipeline;
  private renderGroups: Record<string, GPUBindGroup> = {};
  private paint!: PaintSim;
  private sheet: Sheet | null = null;

  private frame = new FrameData();
  private frameIndex = 0;
  private time = 0;
  private last = 0;
  private raf = 0;
  private isDestroyed = false;
  private isRevealed = false;
  private isVisible = true;
  private motion = 1;
  private strokes = 0;
  private load = 1;
  private travelled = 0;
  private box = { width: 0, height: 0 };
  private size = { width: 0, height: 0 };
  private resizeTimeout = 0;
  private pointer = {
    isInside: false,
    mode: null as PointerMode,
    position: [0, 0] as [number, number],
    previous: [0, 0] as [number, number],
    target: [0, 0] as [number, number],
  };
  private wipe = { center: [0, 0] as [number, number], progress: 1 };
  private reducedMotion: MediaQueryList;
  private pixelRatioQuery: MediaQueryList | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private visibilityObserver: IntersectionObserver | null = null;

  constructor(options: WatercolorEngineOptions) {
    this.canvas = options.canvas;
    this.settings = options.settings;
    this.quality = options.quality;
    this.wheelControls = options.wheelControls;
    this.keyboardShortcuts = options.keyboardShortcuts;
    this.onReady = options.onReady;
    this.onFailure = options.onFailure;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.onReducedMotionChange();
    this.reducedMotion.addEventListener("change", this.onReducedMotionChange);
    this.create().catch((error) => {
      if (this.isDestroyed) return;
      console.error(error);
      this.fail();
    });
  }

  // ------------------------------------------------------------ setup

  private async create() {
    if (!navigator.gpu) throw Error("WebGPU is not available.");
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });
    if (!adapter) throw Error("No WebGPU adapter.");
    const device = await adapter.requestDevice({ label: "watercolor" });
    if (this.isDestroyed) {
      device.destroy();
      return;
    }
    this.device = device;
    device.lost.then(() => {
      if (!this.isDestroyed) this.fail();
    });
    device.addEventListener("uncapturederror", (event) => {
      console.error((event as GPUUncapturedErrorEvent).error.message);
    });

    const format = navigator.gpu.getPreferredCanvasFormat();
    const context = this.canvas.getContext("webgpu");
    if (!context) throw Error("No WebGPU canvas context.");
    this.context = context;
    context.configure({ alphaMode: "opaque", device, format });

    const all =
      GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX;
    const frameLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, buffer: { type: "uniform" }, visibility: all },
        { binding: 1, sampler: { type: "filtering" }, visibility: all },
        { binding: 2, sampler: { type: "filtering" }, visibility: all },
      ],
      label: "frame",
    });
    this.frameBuffer = device.createBuffer({
      label: "frame",
      size: this.frame.data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.frameGroup = device.createBindGroup({
      entries: [
        { binding: 0, resource: { buffer: this.frameBuffer } },
        {
          binding: 1,
          resource: device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
          }),
        },
        {
          binding: 2,
          resource: device.createSampler({
            magFilter: "nearest",
            minFilter: "nearest",
          }),
        },
      ],
      label: "frame",
      layout: frameLayout,
    });
    this.paint = new PaintSim(device, frameLayout);
    this.renderLayout = createLayout(
      device,
      "render",
      ["image", "image", "image"],
      GPUShaderStage.FRAGMENT,
    );
    const module = device.createShaderModule({ code: RENDER, label: "render" });
    const [render] = await Promise.all([
      device.createRenderPipelineAsync({
        fragment: { entryPoint: "fs", module, targets: [{ format }] },
        label: "render",
        layout: device.createPipelineLayout({
          bindGroupLayouts: [frameLayout, this.renderLayout],
        }),
        primitive: { topology: "triangle-list" },
        vertex: { entryPoint: "vs", module },
      }),
      this.paint.create(),
    ]);
    this.render = render;
    if (this.isDestroyed) return;

    this.measure();
    this.createSheet(true);
    this.onResize();
    this.addEventListeners();
    this.onLoopFrame(0);
    await device.queue.onSubmittedWorkDone();
    if (this.isDestroyed) return;
    this.raf = requestAnimationFrame((now) => {
      this.last = now;
      this.isRevealed = true;
      this.onReady();
      this.raf = requestAnimationFrame(this.onLoop);
    });
  }

  private fail() {
    this.destroy();
    this.onFailure();
  }

  destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeTimeout);
    this.removeEventListeners();
    this.reducedMotion.removeEventListener(
      "change",
      this.onReducedMotionChange,
    );
    this.pixelRatioQuery?.removeEventListener("change", this.onResize);
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    this.paint?.destroyTextures();
    this.frameBuffer?.destroy();
    this.device?.destroy();
  }

  // ------------------------------------------------------------ public

  /** Rebuilds the sheet, discarding the painting and the paper grain. */
  clear() {
    if (this.sheet && !this.isDestroyed) this.createSheet(true);
  }

  /** Washes the sheet clean from the centre out with a ragged wet front. */
  wash() {
    this.wipe = {
      center: [this.box.width / 2, this.box.height / 2],
      progress: 0,
    };
  }

  setHue(hue: number) {
    this.hue = ((hue % 360) + 360) % 360;
  }

  setScale(scale: number) {
    this.scale = clamp(
      scale,
      this.settings.brush.smallest,
      this.settings.brush.largest,
    );
  }

  setQuality(quality: WatercolorQuality) {
    if (quality === this.quality) return;
    this.quality = quality;
    if (this.sheet && !this.isDestroyed) this.createSheet();
  }

  setInput({
    wheelControls,
    keyboardShortcuts,
  }: {
    wheelControls: boolean;
    keyboardShortcuts: boolean;
  }) {
    this.wheelControls = wheelControls;
    this.keyboardShortcuts = keyboardShortcuts;
  }

  // ------------------------------------------------------------ sizing

  private measure() {
    this.box = {
      width: Math.max(1, this.canvas.clientWidth),
      height: Math.max(1, this.canvas.clientHeight),
    };
  }

  private createSheet(force = false) {
    const sheet = sheetFor(
      this.box.width,
      this.box.height,
      resolveTier(this.quality),
    );
    if (
      !force &&
      this.sheet &&
      this.sheet.paint[0] === sheet.paint[0] &&
      this.sheet.paint[1] === sheet.paint[1]
    ) {
      return;
    }
    this.sheet = sheet;
    this.paint.resize(sheet);
    const { carried, deposit, paper } = this.paint.views;
    this.renderGroups = {};
    for (const c of [0, 1])
      for (const d of [0, 1])
        this.renderGroups[`${c}${d}`] = createGroup(
          this.device,
          "render",
          this.renderLayout,
          [carried[c], deposit[d], paper],
        );
  }

  private onResize = () => {
    this.watchPixelRatio();
    this.measure();
    const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(this.box.width * ratio));
    const height = Math.max(1, Math.round(this.box.height * ratio));
    if (width !== this.size.width || height !== this.size.height) {
      this.size = { height, width };
      this.canvas.width = width;
      this.canvas.height = height;
    }
    window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      if (!this.isDestroyed) this.createSheet();
    }, RESIZE_DELAY);
  };

  private watchPixelRatio() {
    this.pixelRatioQuery?.removeEventListener("change", this.onResize);
    this.pixelRatioQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );
    this.pixelRatioQuery.addEventListener("change", this.onResize);
  }

  // ------------------------------------------------------------ input

  private addEventListeners() {
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.canvas);
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    });
    this.visibilityObserver.observe(this.canvas);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
    this.canvas.addEventListener("contextmenu", this.onContextMenu);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.canvas.addEventListener("keydown", this.onKeyDown);
  }

  private removeEventListeners() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("keydown", this.onKeyDown);
  }

  private updateTarget(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.target = [event.clientX - rect.left, event.clientY - rect.top];
  }

  private onPointerMove = (event: PointerEvent) => {
    this.updateTarget(event);
    this.pointer.isInside = event.target === this.canvas;
  };

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.button !== 2) return;
    this.canvas.focus({ preventScroll: true });
    this.updateTarget(event);
    this.pointer.position = [...this.pointer.target];
    this.pointer.previous = this.pointer.position;
    this.pointer.isInside = true;
    this.pointer.mode = event.button === 2 ? "smudge" : "paint";
    this.travelled = 0;
    this.strokes++;
  };

  private onPointerUp = () => {
    this.pointer.mode = null;
  };

  private onPointerLeave = () => {
    this.pointer.isInside = false;
  };

  private onContextMenu = (event: Event) => {
    event.preventDefault();
  };

  private onWheel = (event: WheelEvent) => {
    if (!this.wheelControls) return;
    event.preventDefault();
    const delta =
      Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;
    const amount = event.deltaMode === 1 ? delta * 16 : delta;
    if (event.ctrlKey) this.setScale(this.scale * Math.exp(-amount * 0.01));
    else if (event.shiftKey)
      this.setScale(this.scale * Math.exp(-amount * 0.0025));
    else this.setHue(this.hue + amount * this.settings.color.wheel);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (
      !this.keyboardShortcuts ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    const key = event.key.toLowerCase();
    if (key === "[" || key === "]")
      this.setScale(this.scale * SCALE_STEP ** (key === "]" ? 1 : -1));
    else if (key === "arrowleft" || key === "arrowright")
      this.setHue(this.hue + (key === "arrowright" ? HUE_STEP : -HUE_STEP));
    else if (key === "r") this.isRainbow = !this.isRainbow;
    else if (key === "d" || key === "backspace" || key === "delete")
      this.wash();
    else return;
    event.preventDefault();
  };

  private onReducedMotionChange = () => {
    this.motion = this.reducedMotion.matches ? REDUCED_MOTION_FORCE : 1;
  };

  // ------------------------------------------------------------ frame

  private get isPointerActive() {
    const { isInside, mode } = this.pointer;
    return this.isRevealed && isInside && mode !== null;
  }

  private onLoop = (now: number) => {
    if (this.isDestroyed) return;
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    // Offscreen boxes skip the GPU work; the clamped dt absorbs the gap.
    if (this.isVisible) this.onLoopFrame(dt);
    this.raf = requestAnimationFrame(this.onLoop);
  };

  private updateBrush(dt: number) {
    const { frame, pointer } = this;
    const sheet = this.sheet as Sheet;
    const { brush, rainbow } = this.settings;
    const active = this.isPointerActive;
    const smudge = active && pointer.mode === "smudge";
    const on = active ? 1 : 0;
    const [x, y] = pointer.position;
    const [px, py] = pointer.previous;
    const span = Math.min(this.box.width, this.box.height);
    const vx = dt > 0 ? (x - px) / dt : 0;
    const vy = dt > 0 ? (y - py) / dt : 0;
    const speed = Math.min(Math.hypot(vx, vy) / span, brush.maximum);
    const resting = speed < brush.rest || !active;

    this.load = clamp(
      this.load -
        (speed * dt) / brush.reservoir +
        (brush.trickle + (resting ? brush.refill : 0)) * dt,
      brush.empty,
      1,
    );
    const { load } = this;
    const water =
      (brush.water + brush.speedWater * speed) *
      dt *
      on *
      (smudge ? brush.wash : 0.35 + 0.65 * load);
    const pigment = smudge
      ? 0
      : (brush.pigment + brush.speedPigment * speed) * dt * on * load ** 0.8;
    const push =
      sheet.pixel *
      (sheet.flow[0] / sheet.paint[0]) *
      this.motion *
      (smudge ? brush.washForce : brush.force);
    const follow =
      on > 0 ? approach(brush.follow, dt) * clamp(speed / 0.17, 0, 1) : 0;
    const limit = Math.min(
      1,
      (brush.maximum * span) / Math.max(Math.hypot(vx, vy), 1e-6),
    );

    this.travelled += speed * dt;
    if (active && this.isRainbow && !smudge) {
      this.hue =
        (this.hue + (rainbow.distance * speed + rainbow.time) * dt) % 360;
    }
    const thinness = 1.25 - 0.6 * smoothstep(0, brush.thin, speed);
    const pulse =
      (0.75 + 0.5 * bristlePulse(this.travelled * 3.6 + this.strokes * 13.1)) *
      thinness;

    frame.set("brushStart", [
      px * sheet.pixel,
      py * sheet.pixel,
      brush.radius * (active ? this.scale : 1) * span * pulse * sheet.pixel,
      water,
    ]);
    frame.set("brushEnd", [
      x * sheet.pixel,
      y * sheet.pixel,
      pigment,
      Math.max(0, 0.6 - load) * brush.dryBrush,
    ]);
    frame.set("brushColor", [
      ...hueAbsorption(this.hue, this.settings.color),
      smudge ? approach(brush.lift, dt) : 0,
    ]);
    frame.set("brushVelocity", [
      vx * push * limit,
      vy * push * limit,
      follow,
      2.2,
    ]);
  }

  private wipeFrame(dt: number): Vec4 {
    const { edge, duration } = this.settings.wipe;
    const { center, progress } = this.wipe;
    if (progress >= 1) return [0, 0, 0, edge];
    const next = Math.min(1, progress + dt / duration);
    const { pixel } = this.sheet as Sheet;
    const reach = Math.hypot(this.box.width, this.box.height) * 0.5 * 1.45;
    const radius = Math.max(1, easeInOutCubic(next) * reach);
    this.wipe.progress = next;
    return [center[0] * pixel, center[1] * pixel, radius * pixel, edge];
  }

  private updateFrame(dt: number) {
    const { dry, flow, grade, light, look, settle, spread } = this.settings;
    const { frame } = this;
    const sheet = this.sheet as Sheet;
    const [pw, ph] = sheet.paint;
    const [fw, fh] = sheet.flow;
    frame.set("paint", [pw, ph, 1 / pw, 1 / ph]);
    frame.set("flow", [fw, fh, 1 / fw, 1 / fh]);
    frame.set("time", [this.time, dt, this.frameIndex, sheet.pixel]);
    frame.set("spread", [
      spread.rate,
      spread.pinning,
      spread.dry,
      spread.diffusion,
    ]);
    frame.set("settle", [
      settle.evaporation * dt,
      settle.adsorb * dt,
      settle.lift * dt,
      settle.granulation,
    ]);
    frame.set("dry", [
      Math.exp(-dry.damp * dt),
      Math.exp(-dry.fade * dt),
      settle.edge,
      spread.depth,
    ]);
    frame.set("motion", [
      Math.exp(-flow.friction * dt),
      flow.vorticity,
      flow.threshold,
      flow.pressure,
    ]);
    frame.set("paper", [...hexToLinear(this.settings.paper), 0]);
    frame.set("light", [
      Math.cos(light.elevation) * Math.cos(light.azimuth),
      Math.cos(light.elevation) * Math.sin(light.azimuth),
      Math.sin(light.elevation),
      0,
    ]);
    frame.set("look", [look.granulation, look.paper, look.sheen, look.wet]);
    frame.set("grade", [
      grade.saturation,
      grade.vignette,
      grade.grain,
      look.mottle,
    ]);
    frame.set("wipe", this.wipeFrame(dt));
    this.device.queue.writeBuffer(this.frameBuffer, 0, this.frame.data);
  }

  private onLoopFrame(elapsed: number) {
    const dt = this.isRevealed ? Math.min(elapsed, MAX_STEP) : 0;
    this.time += dt;
    this.frameIndex++;
    this.pointer.previous = this.pointer.position;
    this.pointer.position = [...this.pointer.target];
    this.updateBrush(dt);
    this.updateFrame(dt);

    const encoder = this.device.createCommandEncoder({ label: "frame" });
    this.paint.update(encoder, this.frameGroup, {
      iterations: this.settings.flow.iterations,
      spreads: dt > 0 ? this.settings.spread.iterations : 0,
    });
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          clearValue: [1, 1, 1, 1],
          loadOp: "clear",
          storeOp: "store",
          view: this.context.getCurrentTexture().createView(),
        },
      ],
      label: "render",
    });
    pass.setPipeline(this.render);
    pass.setBindGroup(0, this.frameGroup);
    pass.setBindGroup(
      1,
      this.renderGroups[`${this.paint.carried}${this.paint.deposit}`],
    );
    pass.draw(3);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
}
