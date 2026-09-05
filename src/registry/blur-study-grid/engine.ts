import {
  draw,
  effect,
  type Frame,
  frame,
  frameLoop,
  geometry,
  init,
  surface,
  type Target,
  target,
} from "vgpu";
import { exportBlurStudyGridPng } from "./png";
import { BLIT_SHADER, BLUR_STUDY_SHADER } from "./shader";

const COLUMNS = 10;
const ROWS = 10;
const BODY_COUNT = COLUMNS * ROWS;
const INSTANCE_FLOATS = 8;
const SPACING_X = 2.3;
const SPACING_Y = 2;
const SEED = 1_327_115_068;
const BACKGROUND_SRGB = [217 / 255, 221 / 255, 214 / 255, 1] as const;
const BACKGROUND_LINEAR = [0.693871761, 0.723055129, 0.672443157, 1] as const;
const MOBILE_QUERY =
  "(max-width: 680px), (max-height: 520px) and (pointer: coarse)";

export interface StudySettings {
  blur: number;
  blurCurve: number;
  blurDistance: number;
  ditherStrength: number;
  paneZ: number;
  depthSpread: number;
  rodLength: number;
  rodRadius: number;
  volumeDensity: number;
  opacityFalloff: number;
  trackingSpeed: number;
}

export const DEFAULT_SETTINGS: StudySettings = {
  blur: 0.32,
  blurCurve: 3.55,
  blurDistance: 1.6,
  ditherStrength: 1,
  paneZ: 1.1,
  depthSpread: 0.5,
  rodLength: 2,
  rodRadius: 0.42,
  volumeDensity: 4.5,
  opacityFalloff: 1.6,
  trackingSpeed: 0.45,
};

interface SessionSettings {
  paused: boolean;
  exporting: boolean;
  /**
   * Device pixels per CSS pixel for the on-screen study. Every fragment walks
   * 96 volume samples, so cost is linear in this squared: on a 2x display the
   * same frame costs four times as much. The PNG export renders at its own
   * print size and ignores this.
   */
  renderScale: number;
}

/**
 * One grid cell. `home` is fixed by the cell index, `depthSeed` is the single
 * seeded value per cell, and `axis` is the only thing that changes per frame.
 */
interface Cell {
  homeX: number;
  homeY: number;
  depthSeed: number;
  axisX: number;
  axisY: number;
  axisZ: number;
}

interface CameraBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface StartBlurStudyGridOptions {
  canvas: HTMLCanvasElement;
  status: HTMLElement;
  previewCanvas: HTMLCanvasElement;
  previewPanel: HTMLElement;
  /** Full optical model. The component fills in the defaults. */
  settings: StudySettings;
  /** Device pixels per CSS pixel for the on-screen study. */
  renderScale: number;
  paused: boolean;
}

function mulberry32(seed: number) {
  return () => {
    seed += 1_831_565_813;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * The grid is framed by span rather than by field of view: the vertical span
 * only ever grows, and the mobile branch widens it further so the outer cells
 * keep their margin on a narrow screen.
 */
function configureCamera(width: number, height: number, mobile: boolean) {
  const aspect = width / Math.max(height, 1);
  const verticalSpan = Math.max(23.5 + (mobile ? 7 : 4), 29 / aspect);
  const horizontalSpan = verticalSpan * aspect;
  return {
    left: -horizontalSpan / 2,
    right: horizontalSpan / 2,
    top: verticalSpan / 2,
    bottom: -verticalSpan / 2,
  } satisfies CameraBounds;
}

function createCells() {
  const random = mulberry32(SEED);
  const cells: Cell[] = [];
  for (let index = 0; index < BODY_COUNT; index += 1) {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    cells.push({
      homeX: (column - (COLUMNS - 1) / 2) * SPACING_X,
      homeY: ((ROWS - 1) / 2 - row) * SPACING_Y,
      depthSeed: random() - 0.5,
      axisX: 0,
      axisY: 0,
      axisZ: 0,
    });
  }
  return cells;
}

/**
 * Points every capsule at the tracked pointer and sizes its proxy quad. The
 * source recomputes this whole array on every frame and on every settings
 * change, so this stays a full pass rather than a diff.
 */
function aimCells(
  cells: Cell[],
  settings: StudySettings,
  pointerX: number,
  pointerY: number,
) {
  const halfLength = Math.max(
    settings.rodLength * 0.5 - settings.rodRadius,
    0.001,
  );
  for (const cell of cells) {
    const homeZ = cell.depthSeed * settings.depthSpread;
    let x = pointerX - cell.homeX;
    let y = pointerY - cell.homeY;
    let z = settings.paneZ - homeZ;
    if (x * x + y * y + z * z < 1e-6) {
      x = 0;
      y = 0;
      z = 1;
    }
    const scale = halfLength / Math.hypot(x, y, z);
    cell.axisX = x * scale;
    cell.axisY = y * scale;
    cell.axisZ = z * scale;
  }
}

function writeInstances(
  output: Float32Array,
  settings: StudySettings,
  cells: Cell[],
) {
  const blurMargin = settings.rodRadius + 3 * (0.004 + settings.blur);
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const offset = index * INSTANCE_FLOATS;
    output[offset] = cell.homeX;
    output[offset + 1] = cell.homeY;
    output[offset + 2] = cell.depthSeed * settings.depthSpread;
    output[offset + 3] = cell.axisX;
    output[offset + 4] = cell.axisY;
    output[offset + 5] = cell.axisZ;
    output[offset + 6] = Math.abs(cell.axisX) + blurMargin;
    output[offset + 7] = Math.abs(cell.axisY) + blurMargin;
  }
}

function makeStudyParams(
  settings: StudySettings,
  camera: CameraBounds,
  fullSize: readonly [number, number],
  tileOffset: readonly [number, number],
  tileSize: readonly [number, number],
) {
  return {
    halfView: [camera.right, camera.top],
    fullSize,
    tileOffset,
    tileSize,
    blur: settings.blur,
    blurCurve: settings.blurCurve,
    blurDistance: settings.blurDistance,
    ditherStrength: settings.ditherStrength,
    paneZ: settings.paneZ,
    volumeDensity: settings.volumeDensity,
    opacityFalloff: settings.opacityFalloff,
    rodRadius: settings.rodRadius,
  };
}

function pointerToWorld(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  camera: CameraBounds,
) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
  const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
  return {
    x: camera.left + x * (camera.right - camera.left),
    y: camera.top + y * (camera.bottom - camera.top),
  };
}

function encodeLinearRgba(bytes: Uint8Array<ArrayBufferLike>) {
  const encoded = Uint8Array.from(bytes);
  for (let offset = 0; offset < encoded.length; offset += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      const linear = encoded[offset + channel] / 255;
      const srgb =
        linear <= 0.0031308
          ? linear * 12.92
          : 1.055 * linear ** (1 / 2.4) - 0.055;
      encoded[offset + channel] = Math.round(srgb * 255);
    }
  }
  return encoded;
}

function createRenderer(canvas: HTMLCanvasElement, renderScale: number) {
  return init({ powerPreference: "high-performance" }).then((gpu) => {
    // vgpu re-reads `dpr` from this object on every frame advance, so mutating
    // `surfaceOptions.dpr` resizes the canvas without rebuilding the renderer.
    const surfaceOptions = {
      dpr: [1, renderScale] as [number, number],
      clearColor: BACKGROUND_SRGB,
    };
    const canvasSurface = surface(gpu, canvas, surfaceOptions);
    const studyTarget = target(gpu, {
      size: canvasSurface.size,
      format: "rgba8unorm",
      msaa: false,
      clearColor: BACKGROUND_LINEAR,
      label: "blur-study-grid",
    });
    const exportTarget = target(gpu, {
      size: [1, 1],
      format: "rgba8unorm",
      msaa: false,
      clearColor: BACKGROUND_LINEAR,
      label: "blur-study-grid-export",
    });
    const instanceData = new Float32Array(BODY_COUNT * INSTANCE_FLOATS);
    const studyGeometry = geometry(gpu, {
      topology: "triangle-strip",
      vertexCount: 4,
      instanceCount: BODY_COUNT,
      label: "blur-study-grid-proxies",
      buffers: [
        {
          attributes: { corner: "float32x2" },
          data: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        },
        {
          attributes: {
            center: "float32x3",
            axis: "float32x3",
            proxySize: "float32x2",
          },
          data: instanceData,
          stepMode: "instance",
        },
      ],
    });
    const studyDraw = draw(gpu, {
      shader: BLUR_STUDY_SHADER,
      geometry: studyGeometry,
      blend: "alpha",
      depth: false,
      instances: BODY_COUNT,
      label: "blur-study-grid-batched-capsules",
    });
    const blit = effect(gpu, BLIT_SHADER, { label: "blur-study-grid-blit" });
    blit.set({ studyTexture: studyTarget.color });
    const unsubscribeResize = canvasSurface.onResize(({ width, height }) => {
      studyTarget.resize([width, height]);
      blit.set({ studyTexture: studyTarget.color });
    });

    return {
      gpu,
      surfaceOptions,
      canvasSurface,
      studyTarget,
      exportTarget,
      instanceData,
      studyGeometry,
      studyDraw,
      blit,
      unsubscribeResize,
    };
  });
}

type Renderer = Awaited<ReturnType<typeof createRenderer>>;

function encodeStudy(
  currentFrame: Frame,
  renderer: Renderer,
  settings: StudySettings,
  camera: CameraBounds,
  destination: Target,
  fullSize: readonly [number, number],
  tileOffset: readonly [number, number],
  tileSize: readonly [number, number],
) {
  renderer.studyDraw.set({
    params: makeStudyParams(settings, camera, fullSize, tileOffset, tileSize),
  });
  currentFrame.pass(
    { target: destination, clear: BACKGROUND_LINEAR },
    renderer.studyDraw,
  );
}

function drawStudy(
  renderer: Renderer,
  settings: StudySettings,
  camera: CameraBounds,
  destination: Target,
  fullSize: readonly [number, number],
  tileOffset: readonly [number, number],
  tileSize: readonly [number, number],
) {
  frame(renderer.gpu, (currentFrame) => {
    encodeStudy(
      currentFrame,
      renderer,
      settings,
      camera,
      destination,
      fullSize,
      tileOffset,
      tileSize,
    );
  });
}

function encodeVisible(
  currentFrame: Frame,
  renderer: Renderer,
  settings: StudySettings,
  camera: CameraBounds,
) {
  const size = renderer.studyTarget.size;
  encodeStudy(
    currentFrame,
    renderer,
    settings,
    camera,
    renderer.studyTarget,
    size,
    [0, 0],
    size,
  );
  renderer.blit.set({ studyTexture: renderer.studyTarget.color });
  currentFrame.pass(renderer.canvasSurface, renderer.blit);
}

function drawVisible(
  renderer: Renderer,
  settings: StudySettings,
  camera: CameraBounds,
  currentFrame?: Frame,
) {
  if (currentFrame) {
    encodeVisible(currentFrame, renderer, settings, camera);
    return;
  }
  frame(renderer.gpu, (nextFrame) => {
    encodeVisible(nextFrame, renderer, settings, camera);
  });
}

export async function startBlurStudyGrid({
  canvas,
  status,
  previewCanvas,
  previewPanel,
  settings: initialSettings,
  renderScale,
  paused,
}: StartBlurStudyGridOptions) {
  const settings: StudySettings = { ...initialSettings };
  const session: SessionSettings = {
    paused:
      paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    exporting: false,
    renderScale,
  };
  const mobile = window.matchMedia(MOBILE_QUERY);
  const cells = createCells();
  let renderer: Renderer | null = null;
  let camera = configureCamera(
    canvas.clientWidth,
    canvas.clientHeight,
    mobile.matches,
  );
  // The pointer starts at the world origin, which is what makes a paused
  // first frame reproducible: every capsule aims at the centre of the pane.
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let disposed = false;
  let frames = 0;
  let statusStarted = performance.now();

  aimCells(cells, settings, pointerX, pointerY);

  const updateCamera = () => {
    camera = configureCamera(
      canvas.clientWidth,
      canvas.clientHeight,
      mobile.matches,
    );
  };

  const redraw = () => {
    if (!renderer) return;
    aimCells(cells, settings, pointerX, pointerY);
    writeInstances(renderer.instanceData, settings, cells);
    renderer.studyGeometry.buffers[1].write(renderer.instanceData);
    drawVisible(renderer, settings, camera);
  };

  /**
   * Applies a settings change to the running study. The source rebuilds
   * nothing here either: it writes uniforms and re-aims with a zero timestep,
   * which is what keeps a dragged slider from restarting the renderer.
   */
  const setSettings = (next: Partial<StudySettings>) => {
    Object.assign(settings, next);
    redraw();
  };

  const setPaused = (next: boolean) => {
    session.paused =
      next || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  /**
   * Renders the study at print size through tiled GPU readback, so a 24,000
   * pixel export never holds a full image in memory.
   */
  const exportPng = async (
    size: number,
    onProgress?: (step: string) => void,
  ) => {
    if (!renderer || session.exporting) return;
    session.exporting = true;
    try {
      await exportBlurStudyGridPng({
        size,
        previewCanvas,
        previewPanel,
        onProgress: onProgress ?? (() => {}),
        async renderTile(fullSize, x, y, width, height) {
          if (!renderer) throw new Error("The renderer stopped during export.");
          renderer.exportTarget.resize([width, height]);
          const exportCamera = configureCamera(fullSize, fullSize, false);
          drawStudy(
            renderer,
            settings,
            exportCamera,
            renderer.exportTarget,
            [fullSize, fullSize],
            [x, y],
            [width, height],
          );
          await renderer.gpu.settled();
          return encodeLinearRgba(await renderer.exportTarget.read());
        },
      });
    } finally {
      session.exporting = false;
      updateCamera();
      redraw();
    }
  };

  const onResize = () => {
    updateCamera();
    redraw();
  };

  const onPointerMove = (event: PointerEvent) => {
    const point = pointerToWorld(event, canvas, camera);
    targetX = point.x;
    targetY = point.y;
  };

  canvas.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onResize);
  mobile.addEventListener("change", onResize);

  status.textContent = "Initialising renderer";
  const nextRenderer = await createRenderer(canvas, session.renderScale);

  if (disposed) {
    nextRenderer.gpu.dispose();
    return {
      exportPng,
      setSettings,
      setPaused,
      stop: () => {},
    };
  }

  renderer = nextRenderer;
  redraw();
  status.textContent = `WebGPU / WGSL · ${BODY_COUNT} bodies`;

  let previousTime = performance.now();
  const loop = frameLoop(renderer.gpu, (currentFrame) => {
    if (!renderer || session.exporting) return;
    const now = performance.now();
    const delta = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;

    if (!session.paused) {
      // Exponential smoothing, so the tracking lag is frame-rate independent.
      const rate = 2 + settings.trackingSpeed * 14;
      const blend = 1 - Math.exp(-delta * rate);
      pointerX += (targetX - pointerX) * blend;
      pointerY += (targetY - pointerY) * blend;
    }

    aimCells(cells, settings, pointerX, pointerY);
    writeInstances(renderer.instanceData, settings, cells);
    renderer.studyGeometry.buffers[1].write(renderer.instanceData);
    drawVisible(renderer, settings, camera, currentFrame);

    frames += 1;
    const elapsed = now - statusStarted;
    if (elapsed >= 600) {
      const fps = Math.round((frames * 1000) / elapsed);
      status.textContent = `WebGPU / WGSL · ${BODY_COUNT} bodies · ${fps} FPS`;
      frames = 0;
      statusStarted = now;
    }
  });

  return {
    exportPng,
    setSettings,
    setPaused,
    stop: () => {
      if (disposed) return;
      disposed = true;
      loop.stop();
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      mobile.removeEventListener("change", onResize);
      renderer.unsubscribeResize();
      renderer.gpu.dispose();
    },
  };
}

export type BlurStudyGridHandle = Awaited<
  ReturnType<typeof startBlurStudyGrid>
>;
