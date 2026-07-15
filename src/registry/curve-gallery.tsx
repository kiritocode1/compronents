"use client";

/**
 * Curve Gallery
 *
 * A self-contained Three.js image field inspired by gaspoorf/curve-gallery.
 * The camera travels around one of five closed curves while nearby image
 * planes swell into focus. Wheel, drag, keyboard, and autoplay all drive the
 * same eased progress value. Curve data is generated in this file and the
 * default photography reuses existing Compronents assets.
 *
 * BLANK, aryank.space
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/scroll-tunnel-3d";

const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, index) => `${DEFAULT_ASSET_BASE}/img-${index + 1}.jpg`,
);

const DEFAULT_PATH_LABELS = ["01", "02", "03", "04", "05"];

export interface CurveGalleryProps {
  images?: string[];
  background?: string;
  foreground?: string;
  planeCount?: number;
  focusDistance?: number;
  maxScale?: number;
  cameraOffset?: number;
  scrollSensitivity?: number;
  autoplay?: boolean;
  autoplayDuration?: number;
  initialPath?: number;
  pathLabels?: string[];
  brand?: string;
  label?: string;
}

interface PlaneRecord {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  t: number;
  lateralOffset: number;
  depthOffset: number;
  baseSize: number;
  currentScale: number;
  targetPosition: THREE.Vector3;
}

const wrap01 = (value: number) => ((value % 1) + 1) % 1;

const circularDistance = (a: number, b: number) => {
  const distance = Math.abs(a - b);
  return Math.min(distance, 1 - distance);
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createCurveSet() {
  const pointCount = 96;
  const formulas = [
    (angle: number) =>
      new THREE.Vector3(
        Math.cos(angle) * 7.7 + Math.sin(angle * 2) * 1.5,
        Math.sin(angle) * 4.8,
        Math.sin(angle * 3) * 0.9,
      ),
    (angle: number) =>
      new THREE.Vector3(
        Math.sin(angle) * 8,
        Math.sin(angle) * Math.cos(angle) * 7.5,
        Math.cos(angle * 2) * 1.15,
      ),
    (angle: number) => {
      const radius = 5.8 + Math.cos(angle * 3) * 2;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.78,
        Math.sin(angle * 3) * 1.3,
      );
    },
    (angle: number) =>
      new THREE.Vector3(
        Math.cos(angle) * 7.6,
        Math.sin(angle) * 4.5 + Math.sin(angle * 2) * 2.1,
        Math.cos(angle * 3) * 1.1,
      ),
    (angle: number) => {
      const radius = 6.4 + Math.sin(angle * 5) * 1.45;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.72,
        Math.cos(angle * 4) * 1.35,
      );
    },
  ];

  return formulas.map((formula) => {
    const points = Array.from({ length: pointCount }, (_, index) =>
      formula((index / pointCount) * Math.PI * 2),
    );
    return new THREE.CatmullRomCurve3(points, true, "centripetal", 0.5);
  });
}

function getCurveFrame(curve: THREE.CatmullRomCurve3, t: number) {
  const position = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  return {
    position,
    normalX: -tangent.y,
    normalY: tangent.x,
  };
}

function createFallbackTexture(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    const hues = ["#d6f23a", "#ff5b35", "#2e5cff", "#f1b8da"];
    context.fillStyle = hues[index % hues.length];
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#111111";
    context.font = "700 28px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("BLANK", 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function cropTextureToSquare(texture: THREE.Texture) {
  const image = texture.image as
    | {
        naturalWidth?: number;
        naturalHeight?: number;
        width?: number;
        height?: number;
      }
    | undefined;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;
  const aspect = width / Math.max(height, 1);

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);

  if (aspect > 1) {
    texture.repeat.x = 1 / aspect;
    texture.offset.x = (1 - texture.repeat.x) / 2;
  } else if (aspect < 1) {
    texture.repeat.y = aspect;
    texture.offset.y = (1 - texture.repeat.y) / 2;
  }

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
}

export default function CurveGallery({
  images = DEFAULT_IMAGES,
  background = "#f2f0eb",
  foreground = "#171715",
  planeCount = 320,
  focusDistance = 4.8,
  maxScale = 11,
  cameraOffset = 9.5,
  scrollSensitivity = 0.00042,
  autoplay = false,
  autoplayDuration = 12,
  initialPath = 0,
  pathLabels = DEFAULT_PATH_LABELS,
  brand = "BLANK",
  label = "Curve archive",
}: CurveGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoRef = useRef(autoplay);
  const [isAuto, setIsAuto] = useState(autoplay);
  const [activePath, setActivePath] = useState(
    Math.min(4, Math.max(0, initialPath)),
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    autoRef.current = autoplay;
    setIsAuto(autoplay);
  }, [autoplay]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || images.length === 0) return;

    setIsReady(false);

    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let targetProgress = 0;
    let currentProgress = 0;
    let pointerY: number | null = null;
    let activeCurveIndex = Math.min(4, Math.max(0, initialPath));

    const curves = createCurveSet();
    let activeCurve = curves[activeCurveIndex];
    const scene = new THREE.Scene();
    const backgroundColor = new THREE.Color(background);
    scene.background = backgroundColor;
    scene.fog = new THREE.Fog(backgroundColor, 8, 31);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 80);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sharedGeometry = new THREE.PlaneGeometry(1, 1);
    const planes: PlaneRecord[] = [];
    const textures: THREE.Texture[] = [];
    const materials: THREE.MeshBasicMaterial[] = [];
    const random = seededRandom(43891);
    const focusProgressGate = 0.025;
    const zGate = 11;
    const safePlaneCount = Math.min(700, Math.max(80, Math.round(planeCount)));

    const positionPlane = (
      record: PlaneRecord,
      curve: THREE.CatmullRomCurve3,
      immediate = false,
    ) => {
      const { position, normalX, normalY } = getCurveFrame(curve, record.t);
      record.targetPosition.set(
        position.x + normalX * record.lateralOffset,
        position.y + normalY * record.lateralOffset,
        position.z + record.depthOffset,
      );
      if (immediate) record.mesh.position.copy(record.targetPosition);
    };

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    Promise.all(
      images.map(async (src, index) => {
        try {
          const texture = await textureLoader.loadAsync(src);
          cropTextureToSquare(texture);
          return texture;
        } catch {
          return createFallbackTexture(index);
        }
      }),
    ).then((loadedTextures) => {
      if (disposed) {
        for (const texture of loadedTextures) texture.dispose();
        return;
      }

      textures.push(...loadedTextures);
      for (const texture of textures) {
        materials.push(
          new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            fog: true,
          }),
        );
      }

      for (let index = 0; index < safePlaneCount; index++) {
        const t = index / safePlaneCount;
        const mesh = new THREE.Mesh(
          sharedGeometry,
          materials[Math.floor(random() * materials.length)],
        );
        const record: PlaneRecord = {
          mesh,
          t,
          lateralOffset: THREE.MathUtils.lerp(-1.25, 1.25, random()),
          depthOffset: THREE.MathUtils.lerp(-0.9, 0.9, random()),
          baseSize: THREE.MathUtils.lerp(0.19, 0.43, random()),
          currentScale: 1,
          targetPosition: new THREE.Vector3(),
        };

        positionPlane(record, activeCurve, true);
        mesh.scale.setScalar(record.baseSize);
        mesh.renderOrder = Math.round(t * safePlaneCount);
        planes.push(record);
        scene.add(mesh);
      }

      setIsReady(true);
    });

    const switchPath = (nextIndex: number) => {
      activeCurveIndex =
        ((Math.round(nextIndex) % curves.length) + curves.length) %
        curves.length;
      activeCurve = curves[activeCurveIndex];
      for (const plane of planes) positionPlane(plane, activeCurve);
      setActivePath(activeCurveIndex);
    };

    const onPathEvent = (event: Event) => {
      switchPath((event as CustomEvent<number>).detail);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (autoRef.current) return;
      targetProgress += event.deltaY * scrollSensitivity;
    };

    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("button")) return;
      pointerY = event.clientY;
      root.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerY === null || autoRef.current) return;
      targetProgress += (pointerY - event.clientY) * scrollSensitivity * 2.4;
      pointerY = event.clientY;
    };

    const releasePointer = () => {
      pointerY = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        targetProgress += 0.035;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        targetProgress -= 0.035;
      }
      if (event.key === " ") {
        event.preventDefault();
        autoRef.current = !autoRef.current;
        setIsAuto(autoRef.current);
      }
      const number = Number(event.key);
      if (number >= 1 && number <= curves.length) switchPath(number - 1);
    };

    const render = (time: number) => {
      const delta = Math.min(0.05, Math.max(0, (time - lastTime) / 1000));
      lastTime = time;

      if (autoRef.current) {
        targetProgress += delta / Math.max(autoplayDuration, 1);
      }

      const progressEase = 1 - Math.exp(-delta * 7);
      currentProgress += (targetProgress - currentProgress) * progressEase;
      const t = wrap01(1 - currentProgress);
      const cameraPathPosition = activeCurve.getPointAt(t);
      const cameraTarget = new THREE.Vector3(
        cameraPathPosition.x,
        cameraPathPosition.y,
        cameraPathPosition.z + cameraOffset,
      );
      camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * 5));

      const planePositionEase = 1 - Math.exp(-delta * 4.4);
      const scaleEase = 1 - Math.exp(-delta * 9);
      for (const plane of planes) {
        plane.mesh.position.lerp(plane.targetPosition, planePositionEase);

        const dx = camera.position.x - plane.mesh.position.x;
        const dy = camera.position.y - plane.mesh.position.y;
        const dz = Math.abs(camera.position.z - plane.mesh.position.z);
        const distanceXY = Math.hypot(dx, dy);
        const inFocus =
          circularDistance(plane.t, t) < focusProgressGate &&
          dz < zGate &&
          distanceXY < focusDistance;
        const focus = Math.max(0, 1 - distanceXY / focusDistance);
        const targetScale = inFocus ? 1 + focus ** 3 * (maxScale - 1) : 1;
        plane.currentScale += (targetScale - plane.currentScale) * scaleEase;
        plane.mesh.scale.setScalar(plane.baseSize * plane.currentScale);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    root.addEventListener("curve-gallery:path", onPathEvent);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", releasePointer);
    root.addEventListener("pointercancel", releasePointer);
    root.addEventListener("keydown", onKeyDown);
    frameId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      root.removeEventListener("curve-gallery:path", onPathEvent);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", releasePointer);
      root.removeEventListener("pointercancel", releasePointer);
      root.removeEventListener("keydown", onKeyDown);
      for (const plane of planes) scene.remove(plane.mesh);
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
      sharedGeometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [
    autoplayDuration,
    background,
    cameraOffset,
    focusDistance,
    images,
    initialPath,
    maxScale,
    planeCount,
    scrollSensitivity,
  ]);

  const selectPath = (index: number) => {
    rootRef.current?.dispatchEvent(
      new CustomEvent("curve-gallery:path", { detail: index }),
    );
  };

  const toggleAuto = () => {
    autoRef.current = !autoRef.current;
    setIsAuto(autoRef.current);
  };

  const onControlPointerDown = (event: ReactPointerEvent) => {
    event.stopPropagation();
  };

  return (
    <section
      ref={rootRef}
      className="cg-root"
      role="application"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: The WebGL viewport owns documented arrow, number, and space-key controls.
      tabIndex={0}
      aria-label="Interactive curve image gallery"
      style={
        {
          "--cg-bg": background,
          "--cg-ink": foreground,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <canvas ref={canvasRef} className="cg-canvas" />

      <header className="cg-header">
        <p className="cg-brand">{brand}</p>
        <p className="cg-label">{label}</p>
      </header>

      <output
        className={`cg-status${isReady ? " cg-status--ready" : ""}`}
        aria-live="polite"
      >
        {isReady ? "Drag or scroll" : "Loading archive"}
      </output>

      <fieldset className="cg-paths">
        <legend className="cg-sr-only">Gallery curve</legend>
        {pathLabels.slice(0, 5).map((pathLabel, index) => (
          <button
            key={`${pathLabel}-${index}`}
            type="button"
            className={`cg-path${activePath === index ? " is-active" : ""}`}
            aria-pressed={activePath === index}
            aria-label={`Use curve ${index + 1}`}
            onClick={() => selectPath(index)}
            onPointerDown={onControlPointerDown}
          >
            {pathLabel}
          </button>
        ))}
      </fieldset>

      <button
        type="button"
        className={`cg-toggle${isAuto ? " is-active" : ""}`}
        aria-pressed={isAuto}
        onClick={toggleAuto}
        onPointerDown={onControlPointerDown}
      >
        <span className="cg-toggle-dot" />
        {isAuto ? "Auto" : "Scroll"}
      </button>
    </section>
  );
}

const styles = `
.cg-root {
  --cg-bg: #f2f0eb;
  --cg-ink: #171715;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  color: var(--cg-ink);
  background: var(--cg-bg);
  cursor: grab;
  isolation: isolate;
  touch-action: none;
  user-select: none;
  outline: none;
}

.cg-root:active { cursor: grabbing; }
.cg-root:focus-visible { box-shadow: inset 0 0 0 2px currentColor; }

.cg-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cg-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.cg-header {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.15rem 1.25rem;
  pointer-events: none;
}

.cg-brand,
.cg-label,
.cg-status,
.cg-path,
.cg-toggle {
  margin: 0;
  font-family: var(--font-geist-mono), "IBM Plex Mono", monospace;
  font-size: 0.68rem;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cg-brand { font-weight: 650; }
.cg-label { opacity: 0.56; }

.cg-status {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  padding: 0.65rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--cg-ink) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--cg-bg) 72%, transparent);
  opacity: 1;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(12px);
  transition: opacity 500ms ease, transform 500ms ease;
  pointer-events: none;
}

.cg-status--ready {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 8px));
}

.cg-paths {
  position: absolute;
  z-index: 3;
  bottom: 1.2rem;
  left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 0;
  padding: 0.35rem;
  border: 1px solid color-mix(in srgb, var(--cg-ink) 10%, transparent);
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--cg-bg) 62%, transparent);
  backdrop-filter: blur(12px);
  cursor: default;
}

.cg-path {
  min-width: 3.6rem;
  padding: 0.52rem 0.68rem;
  border: 0;
  border-radius: 0.28rem;
  color: color-mix(in srgb, var(--cg-ink) 44%, transparent);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease;
}

.cg-path:hover { color: var(--cg-ink); }
.cg-path.is-active {
  color: var(--cg-bg);
  background: var(--cg-ink);
}

.cg-toggle {
  position: absolute;
  z-index: 3;
  bottom: 1.2rem;
  left: 50%;
  display: flex;
  min-width: 6.8rem;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.75rem 1rem;
  border: 1px solid color-mix(in srgb, var(--cg-ink) 14%, transparent);
  border-radius: 999px;
  color: var(--cg-ink);
  background: color-mix(in srgb, var(--cg-bg) 68%, transparent);
  transform: translateX(-50%);
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease;
}

.cg-toggle:hover,
.cg-toggle.is-active {
  color: var(--cg-bg);
  background: var(--cg-ink);
}

.cg-toggle-dot {
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 640px) {
  .cg-header { padding: 0.9rem; }
  .cg-label { display: none; }
  .cg-paths { bottom: 0.85rem; left: 0.85rem; }
  .cg-path { min-width: 3rem; padding: 0.48rem 0.56rem; }
  .cg-toggle { right: 0.85rem; bottom: 0.85rem; left: auto; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .cg-status,
  .cg-path,
  .cg-toggle { transition-duration: 0.01ms; }
}
`;
