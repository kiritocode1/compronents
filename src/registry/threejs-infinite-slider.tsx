"use client";

/**
 * Three.js Infinite Slider - vertical image cards with velocity distortion.
 *
 * Planes loop through a vertical stack. Wheel, drag, and touch input push the
 * scroll target while mesh vertices bend forward during fast movement.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface ThreeSliderItem {
  name: string;
  image: string;
}

export interface ThreejsInfiniteSliderProps {
  slides?: ThreeSliderItem[];
  background?: string;
  textColor?: string;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  distortionStrength?: number;
}

const ASSET_BASE = "https://compronents.dev/assets/threejs-infinite-slider";
const DEFAULT_SLIDES: ThreeSliderItem[] = [
  "Contour",
  "Velum Drift",
  "Quiet Exchange",
  "Earth Routine",
  "Metal Echo",
  "Tanned Edge",
  "Humidity",
  "Limestone Air",
  "Warm Surface",
  "Dust And Craft",
].map((name, index) => ({
  name,
  image: `${ASSET_BASE}/img${index + 1}.jpg`,
}));

const wrap = (value: number, range: number) =>
  ((value % range) + range) % range;
const zeroPad = (value: number) => String(value).padStart(2, "0");

export default function ThreejsInfiniteSlider({
  slides = DEFAULT_SLIDES,
  background = "#141414",
  textColor = "#f4f0e8",
  minHeight = 1,
  maxHeight = 1.5,
  aspectRatio = 1.5,
  distortionStrength = 2.5,
}: ThreejsInfiniteSliderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState({
    title: slides[0]?.name ?? "",
    index: 0,
  });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || slides.length === 0) return;

    let width = root.clientWidth;
    let height = root.clientHeight;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const total = slides.length;
    const slideHeights = Array.from(
      { length: total },
      (_, index) =>
        minHeight +
        (((index * 37) % 100) / 100) * Math.max(maxHeight - minHeight, 0.01),
    );
    const offsets: number[] = [];
    let stackPosition = 0;
    for (let i = 0; i < total; i++) {
      if (i === 0) {
        offsets.push(0);
        stackPosition = slideHeights[0] / 2;
      } else {
        stackPosition += 0.05 + slideHeights[i] / 2;
        offsets.push(stackPosition);
        stackPosition += slideHeights[i] / 2;
      }
    }
    const loopLength = stackPosition + 0.05 + slideHeights[0] / 2;
    const halfLoop = loopLength / 2;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] =
      [];
    const textures: THREE.Texture[] = [];

    for (let i = 0; i < total; i++) {
      const planeHeight = slideHeights[i];
      const planeWidth = planeHeight * aspectRatio;
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 16);
      const original = new Float32Array(geometry.attributes.position.array);
      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: 0x999999,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        original,
        offset: offsets[i],
        name: slides[i].name,
        index: i,
      };
      loader.load(slides[i].image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
        const imageAspect = texture.image.width / texture.image.height;
        const planeAspect = planeWidth / planeHeight;
        const ratio = imageAspect / planeAspect;
        if (ratio > 1) mesh.scale.y = 1 / ratio;
        else mesh.scale.x = ratio;
      });
      scene.add(mesh);
      meshes.push(mesh);
    }

    let scrollPosition = 0;
    let scrollTarget = 0;
    let scrollMomentum = 0;
    let distortionAmount = 0;
    let distortionTarget = 0;
    let direction = 0;
    let directionTarget = 0;
    let isDragging = false;
    let dragStartY = 0;
    let dragDelta = 0;
    let touchStartY = 0;
    let touchLastY = 0;
    let activeIndex = -1;
    let frame = 0;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const addBurst = (amount: number) => {
      distortionTarget = Math.min(1, distortionTarget + amount);
    };

    const applyDistortion = (
      mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>,
      positionY: number,
      strength: number,
    ) => {
      const positions = mesh.geometry.attributes.position;
      const original = mesh.userData.original as Float32Array;
      for (let i = 0; i < positions.count; i++) {
        const x = original[i * 3];
        const y = original[i * 3 + 1];
        const distance = Math.sqrt(x * x + (positionY + y) ** 2);
        const falloff = Math.max(0, 1 - distance / 2);
        const bend = Math.sin((falloff * Math.PI) / 2) ** 1.5;
        positions.setZ(i, bend * strength);
      }
      positions.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    };

    const render = () => {
      scrollPosition += (scrollTarget - scrollPosition) * 0.05;
      scrollTarget += scrollMomentum;
      scrollMomentum *= 0.95;
      if (Math.abs(scrollMomentum) < 0.001) scrollMomentum = 0;

      distortionAmount += (distortionTarget - distortionAmount) * 0.1;
      distortionTarget *= 0.94;
      direction += (directionTarget - direction) * 0.1;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const mesh of meshes) {
        const offset = mesh.userData.offset as number;
        let y = wrap(offset - scrollPosition, loopLength);
        if (y > halfLoop) y -= loopLength;
        mesh.position.y = y;
        const scale = 1 - Math.min(Math.abs(y) / halfLoop, 1) * 0.22;
        mesh.scale.z = scale;
        applyDistortion(
          mesh,
          y,
          distortionAmount * distortionStrength * direction,
        );
        const distance = Math.abs(y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = mesh.userData.index as number;
        }
      }

      if (closestIndex !== activeIndex) {
        activeIndex = closestIndex;
        setActive({ title: slides[closestIndex].name, index: closestIndex });
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const clamped =
        Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 150);
      addBurst(Math.abs(clamped) * 0.001);
      directionTarget = Math.sign(clamped) || directionTarget;
      scrollTarget += clamped * 0.01;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        directionTarget = 0;
      }, 150);
    };
    const onPointerDown = (event: PointerEvent) => {
      isDragging = true;
      dragStartY = event.clientY;
      dragDelta = 0;
      scrollMomentum = 0;
      root.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const delta = event.clientY - dragStartY;
      dragStartY = event.clientY;
      dragDelta = delta;
      addBurst(Math.abs(delta) * 0.02);
      directionTarget = Math.sign(-delta) || directionTarget;
      scrollTarget -= delta * 0.01;
    };
    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(dragDelta) > 2) {
        scrollMomentum = -dragDelta * 0.01;
        addBurst(Math.abs(dragDelta) * 0.005);
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = touchLastY = event.touches[0]?.clientY ?? 0;
      scrollMomentum = 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const y = event.touches[0]?.clientY ?? touchLastY;
      const delta = y - touchLastY;
      touchLastY = y;
      addBurst(Math.abs(delta) * 0.02);
      directionTarget = Math.sign(-delta) || directionTarget;
      scrollTarget -= delta * 0.01;
    };
    const onTouchEnd = () => {
      const velocity = (touchLastY - touchStartY) * 0.005;
      if (Math.abs(velocity) > 0.5) {
        scrollMomentum = -velocity * 0.1;
        addBurst(Math.abs(velocity) * 0.45);
      }
    };
    const onResize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      if (scrollTimer) clearTimeout(scrollTimer);
      observer.disconnect();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      for (const mesh of meshes) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      for (const texture of textures) texture.dispose();
      renderer.dispose();
    };
  }, [
    slides,
    background,
    minHeight,
    maxHeight,
    aspectRatio,
    distortionStrength,
  ]);

  return (
    <section
      className="tis-root"
      ref={rootRef}
      style={
        {
          "--tis-bg": background,
          "--tis-text": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="tis-info">
        <p>{active.title}</p>
        <p>
          {zeroPad(active.index + 1)} / {zeroPad(slides.length)}
        </p>
      </div>
      <canvas ref={canvasRef} />
    </section>
  );
}

const styles = `
.tis-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 620px;
  overflow: hidden;
  background: var(--tis-bg);
  color: var(--tis-text);
  touch-action: none;
  cursor: grab;
}

.tis-root:active {
  cursor: grabbing;
}

.tis-root canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.tis-info {
  position: absolute;
  left: 1.5rem;
  bottom: 1.5rem;
  z-index: 2;
  display: flex;
  width: calc(100% - 3rem);
  justify-content: space-between;
  gap: 1rem;
  font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.tis-info p {
  margin: 0;
}
`;
