"use client";

/**
 * Floating Model Scroll - a product page with a GLTF model held in the centre
 * of the frame while the copy scrolls past it. The model bobs on a sine of wall
 * clock time, independent of scroll, and separately takes two full turns on its
 * X axis mapped to overall scroll progress, so idling and scrubbing read as two
 * different motions on the same object. It renders with a cheap loop until the
 * file lands, then swaps to the animated loop and scales up from zero.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ASSET_BASE = "https://ui.aryank.space/assets/floating-model-scroll";

export interface FloatingModelArchiveItem {
  title: string;
  info: [string, string, string, string];
}

export interface FloatingModelScrollProps {
  modelSrc?: string;
  brand?: string;
  brandAccent?: string;
  navCta?: string;
  headingRows?: [string, string, string];
  introCopy?: string;
  archiveLabel?: string;
  archiveItems?: FloatingModelArchiveItem[];
  outroCopy?: string;
  contactRows?: [string, string][];
  footerCopy?: string;
  footerCredit?: string;
  embedded?: boolean;
}

const DEFAULT_ARCHIVE: FloatingModelArchiveItem[] = [
  {
    title: "Ripple Bench",
    info: ["US / EU", "Design Concept", "Bench", "Outdoor"],
  },
  {
    title: "Arc Table",
    info: ["US / EU", "Design Concept", "Table", "Modern"],
  },
  {
    title: "Orb Vase",
    info: ["US / EU", "Limited Edition", "Decor", "Contemporary"],
  },
  {
    title: "Grid Shelving",
    info: ["US / EU", "Project Details", "Shelving", "Industrial"],
  },
  {
    title: "Halo Pendant",
    info: ["US / EU", "Project Details", "Lighting", "Modern"],
  },
  {
    title: "Flow Chair",
    info: ["US / EU", "Design Concept", "Armchair", "Minimalist"],
  },
];

export default function FloatingModelScroll({
  modelSrc = `${ASSET_BASE}/chair.glb`,
  brand = "oak",
  brandAccent = "atelier",
  navCta = "Contact Us",
  headingRows = ["Spaces for", "Future", "Living Here"],
  introCopy = "Innovative furniture design studio. Crafting sustainable, bespoke, and functional solutions for homes and businesses.",
  archiveLabel = "Collection",
  archiveItems = DEFAULT_ARCHIVE,
  outroCopy = "We are a French, Dutch, and German multidisciplinary design atelier specializing in bespoke furniture, spatial installations, and immersive visual experiences.",
  contactRows = [
    ["Promos", "info.oakatelier.com"],
    ["Contact", "hello.oakatelier.com"],
  ],
  footerCopy = "We are a French, Dutch, and German multidisciplinary design atelier specializing in bespoke furniture, spatial installations, and immersive visual experiences.",
  footerCredit = "Built by BLANK",
  embedded = true,
}: FloatingModelScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const stage = root.querySelector<HTMLElement>(".fms-model");
    const scroller = root.querySelector<HTMLElement>(".fms-scroller");
    const content = root.querySelector<HTMLElement>(".fms-content");
    if (!stage || !scroller || !content) return;

    const lenisScroller = embedded ? scroller : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      stage.clientWidth / stage.clientHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.5;
    // The source runs three r128, which wrote the tone-mapped linear values
    // straight to the framebuffer. Modern three encodes to sRGB on the way out,
    // which lifts the blacks hard and turns this near-black leather chair into
    // light grey. Keep the source's output so the model reads as it should.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
    mainLight.position.set(0.5, 7.5, 2.5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
    fillLight.position.set(-15, 0, -5);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
    hemiLight.position.set(0, 0, 0);
    scene.add(hemiLight);

    let model: THREE.Object3D | null = null;
    let currentScroll = 0;
    const floatAmplitude = 0.2;
    const floatSpeed = 1.5;
    let disposed = false;

    const totalScrollHeight = () =>
      embedded
        ? Math.max(1, scroller.scrollHeight - scroller.clientHeight)
        : Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          );

    lenis.on("scroll", (e: { scroll: number }) => {
      currentScroll = e.scroll;
    });

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (model) {
        model.position.y =
          Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
        const scrollProgress = Math.min(currentScroll / totalScrollHeight(), 1);
        model.rotation.x = scrollProgress * Math.PI * 4 + 0.5;
      }
      renderer.render(scene, camera);
    };
    animate();

    const loader = new GLTFLoader();
    loader.load(modelSrc, (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const material = node.material as THREE.MeshStandardMaterial;
          if (material) {
            material.metalness = 2;
            material.roughness = 3;
            material.envMapIntensity = 5;
          }
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      scene.add(model);

      const size = box.getSize(new THREE.Vector3());
      camera.position.z = Math.max(size.x, size.y, size.z) * 1.75;

      model.scale.set(0, 0, 0);
      model.rotation.set(0, 0.5, 0);
      gsap.to(model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: "power2.out",
      });
    });

    const ctx = gsap.context(() => {
      const split = SplitText.create(".fms-outro-copy h2", {
        type: "lines",
        linesClass: "fms-line",
      });
      const inner = split.lines.map((line) => {
        const span = document.createElement("span");
        span.innerHTML = line.innerHTML;
        line.innerHTML = "";
        line.appendChild(span);
        return span;
      });
      gsap.set(inner, { y: 70 });

      ScrollTrigger.create({
        trigger: ".fms-outro",
        scroller: lenisScroller,
        start: "top center",
        onEnter: () => {
          gsap.to(inner, {
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
          });
        },
        onLeaveBack: () => {
          gsap.to(inner, {
            y: 70,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
          });
        },
      });

      return () => {
        split.revert();
      };
    }, root);

    const resize = new ResizeObserver(() => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      ScrollTrigger.refresh();
    });
    resize.observe(stage);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      ctx.revert();
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
      className={embedded ? "fms-root fms-embedded" : "fms-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <div className="fms-model" />

      <nav className="fms-nav">
        <p>
          {brand} <span>{brandAccent}</span>
        </p>
        <a href="#contact">{navCta}</a>
      </nav>

      <div className="fms-scroller">
        <div className="fms-content">
          <section className="fms-intro">
            <div className="fms-header-row">
              <h1>{headingRows[0]}</h1>
            </div>
            <div className="fms-header-row">
              <h1>{headingRows[1]}</h1>
              <p>{introCopy}</p>
            </div>
            <div className="fms-header-row">
              <h1>{headingRows[2]}</h1>
            </div>
          </section>

          <section className="fms-archive">
            <div className="fms-archive-header">
              <p>{archiveLabel}</p>
            </div>

            {archiveItems.map((item) => (
              <div className="fms-archive-item" key={item.title}>
                <h2>{item.title}</h2>
                <div className="fms-archive-info">
                  {item.info.map((line, i) => (
                    <p key={`${item.title}-${String(i)}`}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="fms-outro">
            <div className="fms-outro-copy">
              <h2>{outroCopy}</h2>
              {contactRows.map(([label, value]) => (
                <p key={label}>
                  {label} <span>{value}</span>
                </p>
              ))}
            </div>

            <div className="fms-footer">
              <p>{footerCopy}</p>
              <p>{footerCredit}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Instrument+Serif:ital@0;1&display=swap");

.fms-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background-color: #111111;
  color: #fff;
  font-family: "Inter", sans-serif;
}

.fms-root * {
  box-sizing: border-box;
}

.fms-scroller {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.fms-root.fms-embedded .fms-scroller {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.fms-root.fms-embedded .fms-scroller::-webkit-scrollbar {
  display: none;
}

.fms-content {
  width: 100%;
}

.fms-root h1,
.fms-root h2 {
  margin: 0;
}

.fms-root h1 {
  text-transform: uppercase;
  font-size: 14cqw;
  font-weight: 400;
  line-height: 0.85;
}

.fms-root a,
.fms-root p {
  margin: 0;
  text-decoration: none;
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  line-height: 0.9;
}

.fms-root p span {
  font-family: "Instrument Serif", serif;
}

.fms-model {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.fms-model canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.fms-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.fms-nav a {
  text-transform: uppercase;
}

.fms-content section {
  width: 100%;
  height: 100svh;
}

.fms-intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1em;
}

.fms-header-row {
  display: flex;
  gap: 12em;
  align-items: center;
}

.fms-header-row p {
  text-transform: uppercase;
  width: 20%;
}

/* Scoped through the root so it outranks the .fms-content section rule above.
   The source's plain \`section\` selector lost to \`.archive\` on specificity; once
   scoped that flipped, the archive collapsed to one viewport, and its six items
   overflowed a box half their height straight into the outro copy. */
.fms-root .fms-archive {
  height: 200svh;
  display: flex;
  flex-direction: column;
  gap: 3em;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.fms-archive-header p {
  font-family: "Instrument Serif", serif;
  font-style: italic;
}

.fms-archive h2 {
  font-family: "Instrument Serif", serif;
  font-size: 7.5cqw;
  font-weight: 300;
  color: #4f4f4f;
}

.fms-archive-info {
  width: 100%;
  padding: 1em;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.fms-archive-info p {
  text-transform: uppercase;
  color: #4f4f4f;
}

.fms-outro {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6em 2em 2em 2em;
}

.fms-outro-copy h2 {
  width: 75%;
  text-transform: uppercase;
  font-size: 3.75cqw;
  font-weight: 400;
  line-height: 1;
  margin-bottom: 0.5em;
}

.fms-outro-copy h2 .fms-line {
  position: relative;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  overflow: hidden;
  display: block;
}

.fms-outro-copy h2 .fms-line span {
  position: relative;
  will-change: transform;
  display: block;
}

.fms-outro-copy p {
  display: flex;
  margin: 1em 0;
  gap: 2em;
  text-transform: uppercase;
}

.fms-outro-copy p span {
  font-family: "Inter", sans-serif;
}

.fms-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  text-transform: uppercase;
}

.fms-footer p:nth-child(1) {
  width: 25%;
}
`;
