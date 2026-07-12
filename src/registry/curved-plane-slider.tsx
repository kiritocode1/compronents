"use client";

/**
 * Curved Plane Slider - a WebGL slider that wraps its images around a curved
 * plane. Seven stills and titles are painted into a tall repeating canvas
 * texture mapped onto a parabolic plane tilted in 3D; scrolling shifts the
 * texture so the slides glide up the curve and loop seamlessly, framed by a
 * fixed nav, footer, and vignette. Three.js + Lenis.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/curved-plane-slider";

export interface CurvedPlaneSliderProps {
  images?: string[];
  titles?: string[];
  brand?: string;
  tagline?: string;
  navLinks?: [string, string];
  experiment?: string;
  copyright?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 7 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

const DEFAULT_TITLES = [
  "Field Unit",
  "Astral Convergence",
  "Eclipse Core",
  "Luminous",
  "Serenity",
  "Nebula Point",
  "Horizon",
];

export default function CurvedPlaneSlider({
  images = DEFAULT_IMAGES,
  titles = DEFAULT_TITLES,
  brand = "BLANK",
  tagline = "Studio Reel",
  navLinks = ["Index", "About"],
  experiment = "Experiment 0410",
  copyright = "© 2026",
  embedded = true,
}: CurvedPlaneSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!root || !canvas || !stage) return;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    const lenis = embedded
      ? new Lenis({
          wrapper: root,
          content: root.querySelector<HTMLElement>(".cps-content") ?? undefined,
        })
      : new Lenis();
    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    const loaded: HTMLImageElement[] = new Array(images.length);
    let count = 0;
    const done = () => {
      count++;
      if (count === images.length && !disposed) initScene();
    };
    images.forEach((src, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loaded[i] = img;
        done();
      };
      img.onerror = done;
      img.src = src;
    });

    function initScene() {
      const scene = new THREE.Scene();
      const stageEl = stage as HTMLDivElement;
      const canvasEl = canvas as HTMLCanvasElement;
      const width = () => stageEl.clientWidth || window.innerWidth;
      const height = () => stageEl.clientHeight || window.innerHeight;

      const camera = new THREE.PerspectiveCamera(
        45,
        width() / height(),
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width(), height());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000);

      const parentWidth = 20;
      const parentHeight = 75;
      const curvature = 35;
      const geometry = new THREE.PlaneGeometry(
        parentWidth,
        parentHeight,
        200,
        200,
      );
      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const y = positions[i + 1];
        const d = Math.abs(y / (parentHeight / 2));
        positions[i + 2] = d ** 2 * curvature;
      }
      geometry.computeVertexNormals();

      const totalSlides = images.length;
      const slideHeight = 15;
      const gap = 0.5;
      const cycleHeight = totalSlides * (slideHeight + gap);

      const textureCanvas = document.createElement("canvas");
      const ctx = textureCanvas.getContext("2d", { alpha: false });
      textureCanvas.width = 2048;
      textureCanvas.height = 8192;
      if (!ctx) return;

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy(),
      );

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = THREE.MathUtils.degToRad(-20);
      mesh.rotation.y = THREE.MathUtils.degToRad(20);
      scene.add(mesh);

      const distance = 17.5;
      const heightOffset = 5;
      const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
      const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));
      camera.position.set(offsetX, heightOffset, offsetZ);
      camera.lookAt(0, -2, 0);
      camera.rotation.z = THREE.MathUtils.degToRad(-5);

      const updateTexture = (offset = 0) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
        ctx.font = `500 180px "Anton", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const extra = 2;
        for (let i = -extra; i < totalSlides + extra; i++) {
          let slideY = -i * (slideHeight + gap);
          slideY += offset * cycleHeight;
          const textureY = (slideY / cycleHeight) * textureCanvas.height;
          let wrappedY = textureY % textureCanvas.height;
          if (wrappedY < 0) wrappedY += textureCanvas.height;

          const slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
          const rect = {
            x: textureCanvas.width * 0.05,
            y: wrappedY,
            width: textureCanvas.width * 0.9,
            height: (slideHeight / cycleHeight) * textureCanvas.height,
          };

          const img = loaded[slideIndex];
          if (!img) continue;

          const imgAspect = img.width / img.height;
          const rectAspect = rect.width / rect.height;
          let drawWidth: number;
          let drawHeight: number;
          let drawX: number;
          let drawY: number;
          if (imgAspect > rectAspect) {
            drawHeight = rect.height;
            drawWidth = drawHeight * imgAspect;
            drawX = rect.x + (rect.width - drawWidth) / 2;
            drawY = rect.y;
          } else {
            drawWidth = rect.width;
            drawHeight = drawWidth / imgAspect;
            drawX = rect.x;
            drawY = rect.y + (rect.height - drawHeight) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 8);
          ctx.clip();
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          ctx.fillStyle = "white";
          ctx.fillText(
            titles[slideIndex] ?? "",
            textureCanvas.width / 2,
            wrappedY + rect.height / 2,
          );
        }
        texture.needsUpdate = true;
      };

      const onScroll = ({
        scroll,
        limit,
      }: {
        scroll: number;
        limit: number;
      }) => {
        const progress = limit > 0 ? scroll / limit : 0;
        updateTexture(-progress);
        renderer.render(scene, camera);
      };
      lenis.on("scroll", onScroll);

      let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = width() / height();
          camera.updateProjectionMatrix();
          renderer.setSize(width(), height());
          renderer.render(scene, camera);
        }, 250);
      };
      window.addEventListener("resize", onResize);

      const firstDraw = () => {
        updateTexture(0);
        renderer.render(scene, camera);
      };
      if (document.fonts?.load) {
        document.fonts
          .load('500 180px "Anton"')
          .then(firstDraw)
          .catch(firstDraw);
      } else {
        firstDraw();
      }

      cleanups.push(() => {
        lenis.off("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        if (resizeTimeout) clearTimeout(resizeTimeout);
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
      });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      for (const c of cleanups) c();
      lenis.destroy();
    };
  }, [embedded, images, titles]);

  return (
    <div
      className={embedded ? "cps-root cps-embedded" : "cps-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="cps-content">
        <div className="cps-stage" ref={stageRef}>
          <nav className="cps-nav">
            <div className="cps-site-info">
              <p className="cps-logo">{brand}</p>
              <p>{tagline}</p>
            </div>
            <div className="cps-nav-links">
              <p>{navLinks[0]}</p>
              <p>{navLinks[1]}</p>
            </div>
          </nav>

          <footer className="cps-footer">
            <p>{experiment}</p>
            <p>{copyright}</p>
          </footer>

          <div className="cps-slider-wrapper">
            <canvas ref={canvasRef} />
          </div>

          <div className="cps-overlay" />
        </div>
        <div className="cps-spacer" />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500&display=swap");

.cps-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  color: #fff;
  font-family: "Inter", sans-serif;
}

.cps-root.cps-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.cps-root.cps-embedded::-webkit-scrollbar {
  display: none;
}

.cps-content {
  position: relative;
  width: 100%;
}

.cps-stage {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.cps-spacer {
  width: 100%;
  height: 900svh;
}

.cps-root p {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.5;
}

.cps-logo {
  opacity: 1 !important;
}

.cps-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.cps-nav-links {
  display: flex;
  gap: 2em;
}

.cps-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.cps-slider-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cps-slider-wrapper canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.cps-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 0.5) 100%
  );
  z-index: 1;
  pointer-events: none;
}
`;
