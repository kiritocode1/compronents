import type {
  Box3DBody,
  Box3DModule,
  Box3DQuaternion,
  Box3DVector3,
  Box3DWorld,
} from "box3d-wasm/standard";
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
import { exportBlurStudyPng } from "./png";
import { BLIT_SHADER, BLUR_STUDY_SHADER } from "./shader";

const BODY_COUNT = 64;
const INSTANCE_COUNT = BODY_COUNT + 1;
const INSTANCE_FLOATS = 9;
const FIXED_STEP = 1 / 60;
const SUBSTEPS = 4;
const FLOOR_Y = -9;
const CEILING_Y = 9;
const HALF_WIDTH = 12;
const PANE_Z = 1.2;
const WALL_THICKNESS = 0.5;
const USER_DATA_START = 10_000;
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
  boxDepth: number;
  rodLength: number;
  rodRadius: number;
  volumeDensity: number;
  opacityFalloff: number;
  popStrength: number;
  popTempo: number;
  showFloor: boolean;
}

export const DEFAULT_SETTINGS: StudySettings = {
  blur: 0.45,
  blurCurve: 3.15,
  blurDistance: 1.6,
  ditherStrength: 1,
  paneZ: 1.2,
  boxDepth: 5.2,
  rodLength: 4,
  rodRadius: 0.5,
  volumeDensity: 4.5,
  opacityFalloff: 3.5,
  popStrength: 15,
  popTempo: 0.1,
  showFloor: true,
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

interface BodyRecord {
  body: Box3DBody;
}

interface CameraBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface DragState {
  pointerId: number;
  body: Box3DBody;
  localPoint: Box3DVector3;
  target: Box3DVector3;
}

export interface StartBlurStudyBoxOptions {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  status: HTMLElement;
  previewCanvas: HTMLCanvasElement;
  previewPanel: HTMLElement;
  /** Full optical and physical model. The component fills in the defaults. */
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

function quaternionFromUp(axis: Box3DVector3): Box3DQuaternion {
  const dot = axis.y;
  if (dot < -0.999999) return { x: 0, y: 0, z: 1, w: 0 };
  const x = axis.z;
  const z = -axis.x;
  const w = 1 + dot;
  const inverseLength = 1 / Math.hypot(x, z, w);
  return {
    x: x * inverseLength,
    y: 0,
    z: z * inverseLength,
    w: w * inverseLength,
  };
}

function configureCamera(width: number, height: number, mobile: boolean) {
  const aspect = width / Math.max(height, 1);
  const verticalSpan = Math.max(22 + (mobile ? 7 : 4), 31 / aspect);
  const horizontalSpan = verticalSpan * aspect;
  return {
    left: -horizontalSpan / 2,
    right: horizontalSpan / 2,
    top: verticalSpan / 2,
    bottom: -verticalSpan / 2,
  } satisfies CameraBounds;
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

function createWorld(
  Box3D: Box3DModule,
  settings: StudySettings,
  random: () => number,
) {
  const world = new Box3D.World({
    gravity: { x: 0, y: -11, z: 0 },
    enableSleep: true,
    enableContinuous: true,
  });

  const createWall = (
    position: Box3DVector3,
    halfExtents: Box3DVector3,
    friction = 0.6,
    restitution = 0.2,
  ) => {
    const body = world.createBody({ type: "static", position });
    body.createBox({ halfExtents, friction, restitution }).delete();
    body.delete();
  };

  const backZ = PANE_Z - settings.boxDepth;
  const centerZ = (PANE_Z + backZ) * 0.5;
  const halfDepth = settings.boxDepth * 0.5;
  const halfWall = WALL_THICKNESS * 0.5;
  createWall(
    { x: 0, y: -9.25, z: centerZ },
    { x: 12.5, y: halfWall, z: halfDepth },
    0.72,
    0.12,
  );
  createWall(
    { x: 0, y: 9.25, z: centerZ },
    { x: 12.5, y: halfWall, z: halfDepth },
  );
  createWall(
    { x: -12.25, y: 0, z: centerZ },
    { x: halfWall, y: 9, z: halfDepth },
  );
  createWall(
    { x: 12.25, y: 0, z: centerZ },
    { x: halfWall, y: 9, z: halfDepth },
  );
  createWall(
    { x: 0, y: 0, z: 1.45 },
    { x: HALF_WIDTH, y: 9, z: halfWall },
    0.35,
    0.28,
  );
  createWall(
    { x: 0, y: 0, z: backZ - halfWall },
    { x: HALF_WIDTH, y: 9, z: halfWall },
  );

  const radius = settings.rodRadius;
  const halfSegment = Math.max(settings.rodLength * 0.5 - radius, 0.005);
  const maxAxisZ = Math.min(
    Math.max((settings.boxDepth * 0.5 - radius - 0.06) / halfSegment, 0),
    1,
  );
  const bodies: BodyRecord[] = [];
  const byUserData = new Map<number, Box3DBody>();

  for (let index = 0; index < BODY_COUNT; index += 1) {
    const axisZ = (random() * 2 - 1) * maxAxisZ;
    const angle = random() * Math.PI * 2;
    const radial = Math.sqrt(Math.max(1 - axisZ * axisZ, 0));
    const axis = {
      x: Math.cos(angle) * radial,
      y: Math.sin(angle) * radial,
      z: axisZ,
    };
    const extentX = radius + Math.abs(axis.x) * halfSegment;
    const extentY = radius + Math.abs(axis.y) * halfSegment;
    const extentZ = radius + Math.abs(axis.z) * halfSegment;
    const minY = FLOOR_Y + extentY + 0.06;
    const maxY = CEILING_Y - extentY - 0.06;
    const minZ = backZ + extentZ + 0.06;
    const maxZ = PANE_Z - extentZ - 0.06;
    const userData = USER_DATA_START + index;
    // Keep the source's x, z, y random-consumption order. Changing object
    // evaluation order changes every later body in this deterministic scene.
    const positionX =
      (random() * 2 - 1) * Math.max(HALF_WIDTH - extentX - 0.06, 0);
    const positionZ = minZ + random() * Math.max(maxZ - minZ, 0);
    const positionY = minY + random() * Math.max(maxY - minY, 0);
    const body = world.createBody({
      type: "dynamic",
      userData,
      position: { x: positionX, y: positionY, z: positionZ },
      rotation: quaternionFromUp(axis),
      linearVelocity: {
        x: (random() - 0.5) * 1.4,
        y: (random() - 0.35) * 1.4,
        z: (random() - 0.5) * 1.4,
      },
      angularVelocity: {
        x: (random() - 0.5) * 2.4,
        y: (random() - 0.5) * 2.4,
        z: (random() - 0.5) * 2.4,
      },
      linearDamping: 0.32,
      angularDamping: 0.46,
      sleepThreshold: 0.35,
      enableSleep: true,
      isAwake: true,
      isBullet: true,
    });
    body
      .createCapsule({
        height: Math.max(settings.rodLength - radius * 2, 0.01),
        radius,
        density: 0.72,
        friction: 0.46,
        restitution: 0.22,
      })
      .delete();
    bodies.push({ body });
    byUserData.set(userData, body);
  }

  return { world, bodies, byUserData };
}

function destroyWorld(world: Box3DWorld | null, bodies: BodyRecord[]) {
  for (const record of bodies) record.body.delete();
  if (!world) return;
  world.destroy();
  world.delete();
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
    showFloor: settings.showFloor ? 1 : 0,
  };
}

/**
 * Fills the instance buffer for one frame. This runs 64 times per frame, so it
 * writes by index and rotates the body's up vector inline rather than
 * building an array and three vectors per body.
 */
function writeInstances(
  output: Float32Array,
  settings: StudySettings,
  bodies: BodyRecord[],
) {
  // Instance 0 is the floor hairline, and every value in it is a constant.
  output[0] = 0;
  output[1] = FLOOR_Y;
  output[2] = PANE_Z;
  output[3] = 0;
  output[4] = 0;
  output[5] = 0;
  output[6] = 12;
  output[7] = 0.04;
  output[8] = 1;

  const halfLength = Math.max(
    settings.rodLength * 0.5 - settings.rodRadius,
    0.005,
  );
  const blurMargin = settings.rodRadius + 3 * (0.004 + settings.blur);

  for (let index = 0; index < bodies.length; index += 1) {
    const body = bodies[index].body;
    const position = body.getPosition();
    const { x, y, z, w } = body.getRotation();
    const axisX = 2 * (x * y - w * z) * halfLength;
    const axisY = (1 - 2 * (x * x + z * z)) * halfLength;
    const axisZ = 2 * (y * z + w * x) * halfLength;
    const offset = (index + 1) * INSTANCE_FLOATS;
    output[offset] = position.x;
    output[offset + 1] = position.y;
    output[offset + 2] = position.z;
    output[offset + 3] = axisX;
    output[offset + 4] = axisY;
    output[offset + 5] = axisZ;
    output[offset + 6] = Math.abs(axisX) + blurMargin;
    output[offset + 7] = Math.abs(axisY) + blurMargin;
    output[offset + 8] = 0;
  }
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
      label: "blur-study",
    });
    const exportTarget = target(gpu, {
      size: [1, 1],
      format: "rgba8unorm",
      msaa: false,
      clearColor: BACKGROUND_LINEAR,
      label: "blur-study-export",
    });
    const instanceData = new Float32Array(INSTANCE_COUNT * INSTANCE_FLOATS);
    const studyGeometry = geometry(gpu, {
      topology: "triangle-strip",
      vertexCount: 4,
      instanceCount: INSTANCE_COUNT,
      label: "blur-study-proxies",
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
            kind: "float32",
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
      instances: INSTANCE_COUNT,
      label: "blur-study-batched-capsules",
    });
    const blit = effect(gpu, BLIT_SHADER, { label: "blur-study-blit" });
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

export async function startBlurStudyBox({
  root,
  canvas,
  status,
  previewCanvas,
  previewPanel,
  settings,
  renderScale,
  paused,
}: StartBlurStudyBoxOptions) {
  const session: SessionSettings = {
    paused:
      paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    exporting: false,
    renderScale,
  };
  const mobile = window.matchMedia(MOBILE_QUERY);
  const random = mulberry32(1_327_115_068);
  let Box3D: Box3DModule | null = null;
  let world: Box3DWorld | null = null;
  let bodies: BodyRecord[] = [];
  let byUserData = new Map<number, Box3DBody>();
  let renderer: Renderer | null = null;
  let camera = configureCamera(
    canvas.clientWidth,
    canvas.clientHeight,
    mobile.matches,
  );
  let accumulator = 0;
  let popCountdown = Math.min(settings.popTempo, 0.5);
  let drag: DragState | null = null;
  let disposed = false;
  let frames = 0;
  let statusStarted = performance.now();

  const rebuildWorld = () => {
    if (!Box3D) return;
    destroyWorld(world, bodies);
    const created = createWorld(Box3D, settings, random);
    world = created.world;
    bodies = created.bodies;
    byUserData = created.byUserData;
    accumulator = 0;
    popCountdown = Math.min(settings.popTempo, 0.5);
    drag = null;
    root.classList.remove("is-grabbing-body");
    if (renderer) {
      writeInstances(renderer.instanceData, settings, bodies);
      renderer.studyGeometry.buffers[1].write(renderer.instanceData);
      drawVisible(renderer, settings, camera);
    }
  };

  const updateCamera = () => {
    camera = configureCamera(
      canvas.clientWidth,
      canvas.clientHeight,
      mobile.matches,
    );
  };

  const redraw = () => {
    if (renderer) drawVisible(renderer, settings, camera);
  };

  /**
   * Renders the study at print size through tiled GPU readback. The panel used
   * to call this from a button; it is now reachable through the component's
   * ref so the host owns the export affordance.
   */
  const exportPng = async (
    size: number,
    onProgress?: (step: string) => void,
  ) => {
    if (!renderer || session.exporting) return;
    session.exporting = true;
    try {
      await exportBlurStudyPng({
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

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || !world || event.target !== canvas) return;
    const point = pointerToWorld(event, canvas, camera);
    const origin = { x: point.x, y: point.y, z: 1.19 };
    const hit = world.castRayClosest(origin, {
      x: 0,
      y: 0,
      z: -(settings.boxDepth + 0.02),
    });
    const body = hit.hit ? byUserData.get(hit.bodyUserData) : undefined;
    hit.shape?.delete();
    if (!body) return;
    drag = {
      pointerId: event.pointerId,
      body,
      localPoint: body.getLocalPoint(hit.point),
      target: { ...hit.point },
    };
    body.setAwake(true);
    canvas.setPointerCapture?.(event.pointerId);
    root.classList.add("is-grabbing-body");
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = pointerToWorld(event, canvas, camera);
    drag.target.x = point.x;
    drag.target.y = point.y;
    event.preventDefault();
  };

  const endDrag = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag = null;
    root.classList.remove("is-grabbing-body");
  };

  const applyDragForce = () => {
    if (!drag) return;
    const point = drag.body.getWorldPoint(drag.localPoint);
    const center = drag.body.getWorldCenterOfMass();
    const linear = drag.body.getLinearVelocity();
    const angular = drag.body.getAngularVelocity();
    const mass = drag.body.getMass();
    const rx = point.x - center.x;
    const ry = point.y - center.y;
    const rz = point.z - center.z;
    const velocityAtPoint = {
      x: linear.x + angular.y * rz - angular.z * ry,
      y: linear.y + angular.z * rx - angular.x * rz,
      z: linear.z + angular.x * ry - angular.y * rx,
    };
    const omega = Math.PI * 2 * 5.5;
    const stiffness = mass * omega * omega;
    const damping = 2 * 0.88 * mass * omega;
    let force = {
      x: (drag.target.x - point.x) * stiffness - velocityAtPoint.x * damping,
      y: (drag.target.y - point.y) * stiffness - velocityAtPoint.y * damping,
      z: (drag.target.z - point.z) * stiffness - velocityAtPoint.z * damping,
    };
    const limit = mass * 420;
    const length = Math.hypot(force.x, force.y, force.z);
    if (length > limit) {
      const scale = limit / length;
      force = { x: force.x * scale, y: force.y * scale, z: force.z * scale };
    }
    drag.body.applyForce(force, point, true);
  };

  const popBody = () => {
    if (!bodies.length) return;
    const record = bodies[Math.floor(random() * bodies.length)];
    const mass = record.body.getMass();
    const strength = settings.popStrength;
    const spin = 3 + strength * 0.16;
    record.body.applyLinearImpulseToCenter(
      {
        x: mass * (random() - 0.5) * strength * 0.45,
        y: mass * strength * (0.82 + random() * 0.34),
        z: mass * strength * (0.38 + random() * 0.28),
      },
      true,
    );
    record.body.applyAngularImpulse(
      {
        x: mass * (random() - 0.5) * spin,
        y: mass * (random() - 0.5) * spin,
        z: mass * (random() - 0.5) * spin,
      },
      true,
    );
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  window.addEventListener("resize", onResize);
  mobile.addEventListener("change", onResize);

  status.textContent = "Initialising renderer";
  const [boxModule, nextRenderer] = await Promise.all([
    import("box3d-wasm/standard").then(({ default: createBox3D }) =>
      createBox3D(),
    ),
    createRenderer(canvas, session.renderScale),
  ]);

  if (disposed) {
    nextRenderer.gpu.dispose();
    return { exportPng, stop: () => {} };
  }

  Box3D = boxModule;
  renderer = nextRenderer;
  rebuildWorld();
  status.textContent = `WebGPU / WGSL · ${BODY_COUNT}/${BODY_COUNT} active`;

  let previousTime = performance.now();
  const loop = frameLoop(renderer.gpu, (currentFrame) => {
    if (!renderer || !world || session.exporting) return;
    const now = performance.now();
    const delta = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;

    if (!session.paused) {
      accumulator = Math.min(accumulator + delta, FIXED_STEP * 6);
      while (accumulator >= FIXED_STEP) {
        applyDragForce();
        world.step(FIXED_STEP, SUBSTEPS);
        accumulator -= FIXED_STEP;
        popCountdown -= FIXED_STEP;
        let pops = 0;
        while (popCountdown <= 0 && pops < 8) {
          popBody();
          popCountdown += Math.max(
            settings.popTempo * (0.7 + random() * 0.75),
            0.001,
          );
          pops += 1;
        }
      }
    }

    writeInstances(renderer.instanceData, settings, bodies);
    renderer.studyGeometry.buffers[1].write(renderer.instanceData);
    drawVisible(renderer, settings, camera, currentFrame);
    frames += 1;
    const elapsed = now - statusStarted;
    if (elapsed >= 600) {
      const fps = Math.round((frames * 1000) / elapsed);
      status.textContent = `WebGPU / WGSL · ${world.getAwakeBodyCount()}/${BODY_COUNT} active · ${fps} FPS`;
      frames = 0;
      statusStarted = now;
    }
  });

  return {
    exportPng,
    stop: () => {
      if (disposed) return;
      disposed = true;
      loop.stop();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("resize", onResize);
      mobile.removeEventListener("change", onResize);
      root.classList.remove("is-grabbing-body");
      destroyWorld(world, bodies);
      renderer.unsubscribeResize();
      renderer.gpu.dispose();
    },
  };
}

export type BlurStudyBoxHandle = Awaited<ReturnType<typeof startBlurStudyBox>>;
