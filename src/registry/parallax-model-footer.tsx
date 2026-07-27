"use client";

/**
 * Parallax Model Footer - a footer that is taller than the space it occupies
 * and slides the difference back as you reach it. The content block sits at
 * minus thirty five percent and is driven to zero across the footer's entry, so
 * the text arrives already in motion rather than scrolling in flat. Behind it a
 * GLTF model sits on a transparent canvas, pushed a unit into the depth and
 * tilted, and both of those settle to rest on the same scroll progress while
 * the pointer keeps nudging its rotation with an eased follow.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ASSET_BASE = "https://ui.aryank.space/assets/parallax-model-footer";

export interface ParallaxModelFooterSection {
  label: string;
  background: string;
  color: string;
}

export interface ParallaxModelFooterProps {
  modelSrc?: string;
  sections?: ParallaxModelFooterSection[];
  statement?: string;
  statusLabel?: string;
  statusValue?: string;
  links?: string[];
  metaLeft?: string;
  metaRight?: string;
  embedded?: boolean;
}

const DEFAULT_SECTIONS: ParallaxModelFooterSection[] = [
  { label: "Section 1", background: "#e6eed6", color: "#000" },
  { label: "Section 2", background: "#6200b3", color: "#fff" },
  { label: "Section 3", background: "#ffa630", color: "#000" },
];

export default function ParallaxModelFooter({
  modelSrc = `${ASSET_BASE}/model.glb`,
  sections = DEFAULT_SECTIONS,
  statement = "Restoring meaning to the things we build",
  statusLabel = "Work resumes",
  statusValue = "2026",
  links = ["Write to me", "Professional orbit", "Loose thoughts", "Long form"],
  metaLeft = "Experiment 518",
  metaRight = "Built by BLANK",
  embedded = true,
}: ParallaxModelFooterProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".pmf-content");
    const footer = root.querySelector<HTMLElement>(".pmf-footer");
    const footerContainer = root.querySelector<HTMLElement>(".pmf-container");
    const container = root.querySelector<HTMLElement>(".pmf-canvas");
    if (!content || !footer || !footerContainer || !container) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // The source reads the window; here the pointer is measured against the
    // component's own box so the tilt still reaches full range inside a bounded
    // preview.
    const mouse = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    root.addEventListener("pointermove", onPointerMove);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 0.75);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(1, 1, 0);
    scene.add(directionalLight);

    let model: THREE.Object3D | null = null;
    let modelBaseRotationX = 0.5;
    let modelBaseZ = -1;

    const loader = new GLTFLoader();
    loader.load(modelSrc, (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      model.position.sub(center);
      model.position.y = 0;
      model.position.z = -1;
      model.rotation.x = 0.5;

      const maxDim = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(1 / maxDim);

      scene.add(model);
    });

    const trigger = ScrollTrigger.create({
      trigger: footer,
      scroller,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(footerContainer, { y: `${-35 * (1 - progress)}%` });
        modelBaseZ = -1 * (1 - progress);
        modelBaseRotationX = 0.5 * (1 - progress);
      },
    });

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (model) {
        const targetRotationY = mouse.x * 0.3;
        const targetRotationX = -mouse.y * 0.2 + modelBaseRotationX;
        model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
        model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;
        model.position.z += (modelBaseZ - model.position.z) * 0.05;
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = new ResizeObserver(() => {
      if (!container.offsetWidth || !container.offsetHeight) return;
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      ScrollTrigger.refresh();
    });
    resize.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          const material = object.material;
          if (Array.isArray(material)) {
            for (const m of material) m.dispose();
          } else {
            material?.dispose();
          }
        }
      });
    };
  }, [embedded, modelSrc]);

  return (
    <div
      className={embedded ? "pmf-root pmf-embedded" : "pmf-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="pmf-content">
        {sections.map((section) => (
          <section
            className="pmf-section"
            key={section.label}
            style={{
              backgroundColor: section.background,
              color: section.color,
            }}
          >
            <h1>{section.label}</h1>
          </section>
        ))}

        <footer className="pmf-footer">
          <div className="pmf-container">
            <div className="pmf-canvas" />

            <div className="pmf-footer-content">
              <div className="pmf-footer-row">
                <div className="pmf-footer-col">
                  <h2>{statement}</h2>
                </div>

                <div className="pmf-footer-col">
                  <div className="pmf-footer-sub-col">
                    <h3>{statusLabel}</h3>
                    <h3>{statusValue}</h3>
                  </div>

                  <div className="pmf-footer-sub-col">
                    {links.map((link) => (
                      <a href="#footer" key={link}>
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pmf-footer-row">
                <p>{metaLeft}</p>
                <p>{metaRight}</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Stack+Sans+Notch:wght@200..700&display=swap");

.pmf-root {
  --pmf-base-400: #171717;
  position: relative;
  width: 100%;
  height: 100%;
  color: #000;
  font-family: "Stack Sans Notch", sans-serif;
}

.pmf-root * {
  box-sizing: border-box;
}

.pmf-root.pmf-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.pmf-root.pmf-embedded::-webkit-scrollbar {
  display: none;
}

.pmf-content {
  position: relative;
  width: 100%;
}

.pmf-root h1,
.pmf-root h2,
.pmf-root h3 {
  margin: 0;
  font-weight: lighter;
  line-height: 1.25;
}

.pmf-root h1 {
  font-size: clamp(4rem, 5vw, 6rem);
}

.pmf-root h2 {
  font-size: clamp(3rem, 4vw, 5rem);
}

.pmf-root h3 {
  font-size: clamp(1.25rem, 1.75vw, 2.5rem);
}

.pmf-root a {
  text-decoration: none;
  color: #fff;
  font-size: clamp(1.25rem, 1.75vw, 2.5rem);
  font-weight: lighter;
  line-height: 1.25;
}

.pmf-root p {
  margin: 0;
  font-family: "DM Sans", sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
}

.pmf-section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.pmf-footer {
  position: relative;
  width: 100%;
  height: 75svh;
  background-color: var(--pmf-base-400);
  color: #fff;
  overflow: hidden;
}

.pmf-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: translateY(-35%);
  will-change: transform;
}

.pmf-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.5;
  z-index: -1;
}

.pmf-canvas canvas {
  display: block;
}

.pmf-footer-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
}

.pmf-footer-row {
  display: flex;
  justify-content: space-between;
}

.pmf-footer-row:nth-child(1) .pmf-footer-col:nth-child(1) {
  flex: 3;
}

.pmf-footer-row:nth-child(1) .pmf-footer-col:nth-child(2) {
  flex: 2;
  display: flex;
  gap: 2rem;
}

.pmf-footer-sub-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pmf-footer-row h2 {
  width: 75%;
}

@media (max-width: 1000px) {
  .pmf-footer-row:nth-child(1) {
    flex-direction: column;
    gap: 4rem;
  }

  .pmf-footer-row h2 {
    width: 100%;
  }
}
`;
