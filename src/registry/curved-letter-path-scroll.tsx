"use client";

/**
 * Curved Letter Path Scroll - four rows of letters travelling along invisible
 * 3D curves, over a card strip bent into a cylinder. The letters are real DOM
 * elements: each frame their position is sampled from a CatmullRom curve,
 * projected through the Three camera, and eased toward that screen coordinate,
 * so they get true perspective while staying crisp text. Each row runs at its
 * own speed multiplier, and a letter that wraps past the edge is snapped rather
 * than eased so it never streaks back across the frame. The cards are painted
 * into one offscreen canvas used as a texture on a plane whose vertices are
 * displaced on a parabola, so the strip curves away at both ends.
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

const ASSET_BASE = "https://ui.aryank.space/assets/curved-letter-path-scroll";

export interface CurvedLetterPathScrollProps {
  introHeading?: string;
  outroHeading?: string;
  letters?: string[];
  images?: string[];
  accent?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 7 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

const LINE_SPEED_MULTIPLIERS = [0.8, 1, 0.7, 0.9];

const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

export default function CurvedLetterPathScroll({
  introHeading = "( Intro )",
  outroHeading = "( Outro )",
  letters = ["W", "O", "R", "K"],
  images = DEFAULT_IMAGES,
  accent = "#f40c3f",
  embedded = true,
}: CurvedLetterPathScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".wdk-content");
    const workSection = root.querySelector<HTMLElement>(".wdk-work");
    const textContainer = root.querySelector<HTMLElement>(
      ".wdk-text-container",
    );
    if (!content || !workSection || !textContainer) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const frameWidth = () => (embedded ? root.clientWidth : window.innerWidth);
    const frameHeight = () =>
      embedded ? root.clientHeight : window.innerHeight;

    let disposed = false;
    let frame = 0;
    let trigger: ScrollTrigger | null = null;

    const gridCanvas = document.createElement("canvas");
    gridCanvas.className = "wdk-grid-canvas";
    workSection.appendChild(gridCanvas);
    const gridCtx = gridCanvas.getContext("2d");
    if (!gridCtx) return;

    const resizeGridCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = frameWidth();
      const h = frameHeight();
      gridCanvas.width = w * dpr;
      gridCanvas.height = h * dpr;
      gridCanvas.style.width = `${w}px`;
      gridCanvas.style.height = `${h}px`;
      gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeGridCanvas();

    const drawGrid = (scrollProgress = 0) => {
      gridCtx.fillStyle = "black";
      gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
      gridCtx.fillStyle = accent;
      const dotSize = 0.75;
      const spacing = 20;
      const rows = Math.ceil(gridCanvas.height / spacing);
      const cols = Math.ceil(gridCanvas.width / spacing) + 15;
      const offset = (scrollProgress * spacing * 10) % spacing;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          gridCtx.beginPath();
          gridCtx.arc(
            x * spacing - offset,
            y * spacing,
            dotSize,
            0,
            Math.PI * 2,
          );
          gridCtx.fill();
        }
      }
    };

    const lettersScene = new THREE.Scene();
    const cardsScene = new THREE.Scene();

    const createCamera = () =>
      new THREE.PerspectiveCamera(50, frameWidth() / frameHeight(), 0.1, 1000);

    const lettersCamera = createCamera();
    const cardsCamera = createCamera();

    const lettersRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    lettersRenderer.setSize(frameWidth(), frameHeight());
    lettersRenderer.setClearColor(0x000000, 0);
    lettersRenderer.setPixelRatio(window.devicePixelRatio);
    lettersRenderer.domElement.className = "wdk-letters-canvas";

    const cardsRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cardsRenderer.setSize(frameWidth(), frameHeight());
    cardsRenderer.setClearColor(0x000000, 0);
    cardsRenderer.domElement.className = "wdk-cards-canvas";

    workSection.appendChild(lettersRenderer.domElement);
    workSection.appendChild(cardsRenderer.domElement);

    interface PathLine extends THREE.Line {
      curve: THREE.CatmullRomCurve3;
      letterElements: HTMLElement[];
    }

    const createTextAnimationPath = (yPos: number, amplitude: number) => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        points.push(
          new THREE.Vector3(
            -25 + 50 * t,
            yPos + Math.sin(t * Math.PI) * -amplitude,
            (1 - (Math.abs(t - 0.5) * 2) ** 2) * -5,
          ),
        );
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)),
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 }),
      ) as unknown as PathLine;
      line.curve = curve;
      return line;
    };

    const paths = [
      createTextAnimationPath(10, 2),
      createTextAnimationPath(3.5, 1),
      createTextAnimationPath(-3.5, -1),
      createTextAnimationPath(-10, -2),
    ];
    for (const line of paths) lettersScene.add(line);

    const letterPositions = new Map<
      HTMLElement,
      { current: { x: number; y: number }; target: { x: number; y: number } }
    >();
    paths.forEach((line, i) => {
      line.letterElements = Array.from({ length: 15 }, () => {
        const el = document.createElement("div");
        el.className = "wdk-letter";
        el.textContent = letters[i] ?? "";
        textContainer.appendChild(el);
        letterPositions.set(el, {
          current: { x: 0, y: 0 },
          target: { x: 0, y: 0 },
        });
        return el;
      });
    });

    const loadImage = (src: string) =>
      new Promise<THREE.Texture>((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(src, (loadedTexture) => {
          Object.assign(loadedTexture, {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
            anisotropy: cardsRenderer.capabilities.getMaxAnisotropy(),
          });
          resolve(loadedTexture);
        });
      });

    const textureCanvas = document.createElement("canvas");
    const ctx = textureCanvas.getContext("2d");
    textureCanvas.width = 4096;
    textureCanvas.height = 2048;

    const cardsTexture = new THREE.CanvasTexture(textureCanvas);
    Object.assign(cardsTexture, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      anisotropy: cardsRenderer.capabilities.getMaxAnisotropy(),
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
    });

    const cardsGeometry = new THREE.PlaneGeometry(30, 15, 50, 1);
    const cardsMaterial = new THREE.MeshBasicMaterial({
      map: cardsTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
    });
    const cardsPlane = new THREE.Mesh(cardsGeometry, cardsMaterial);
    cardsScene.add(cardsPlane);

    const positions = cardsPlane.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, (positions.getX(i) / 15) ** 2 * 5);
    }
    positions.needsUpdate = true;

    lettersCamera.position.setZ(20);
    cardsCamera.position.setZ(20);

    let loadedImages: THREE.Texture[] = [];

    const drawCardsOnCanvas = (offset = 0) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
      const cardWidth = textureCanvas.width / 3;
      const cardHeight = textureCanvas.height / 2;
      const spacing = textureCanvas.width / 2.5;
      loadedImages.forEach((img, i) => {
        const source = img?.image as CanvasImageSource | undefined;
        if (source) {
          ctx.drawImage(
            source,
            i * spacing + (0.35 - offset) * textureCanvas.width * 5 - cardWidth,
            (textureCanvas.height - cardHeight) / 2,
            cardWidth,
            cardHeight,
          );
        }
      });
    };

    const updateTargetPositions = (scrollProgress = 0) => {
      paths.forEach((line, lineIndex) => {
        line.letterElements.forEach((element, i) => {
          const point = line.curve.getPoint(
            (i / 14 + scrollProgress * LINE_SPEED_MULTIPLIERS[lineIndex]) % 1,
          );
          const vector = point.clone().project(lettersCamera);
          const entry = letterPositions.get(element);
          if (!entry) return;
          entry.target = {
            x: (-vector.x * 0.5 + 0.5) * frameWidth(),
            y: (-vector.y * 0.5 + 0.5) * frameHeight(),
          };
        });
      });
    };

    const updateLetterPositions = () => {
      for (const [element, entry] of letterPositions) {
        const distX = entry.target.x - entry.current.x;
        if (Math.abs(distX) > frameWidth() * 0.7) {
          entry.current.x = entry.target.x;
          entry.current.y = entry.target.y;
        } else {
          entry.current.x = lerp(entry.current.x, entry.target.x, 0.07);
          entry.current.y = lerp(entry.current.y, entry.target.y, 0.07);
        }
        element.style.transform = `translate(-50%, -50%) translate3d(${entry.current.x}px, ${entry.current.y}px, 0px)`;
      }
    };

    const animate = () => {
      updateLetterPositions();
      lettersRenderer.render(lettersScene, lettersCamera);
      cardsRenderer.render(cardsScene, cardsCamera);
      frame = requestAnimationFrame(animate);
    };

    const onResize = () => {
      resizeGridCanvas();
      const progress = trigger?.progress ?? 0;
      drawGrid(progress);
      for (const camera of [lettersCamera, cardsCamera]) {
        camera.aspect = frameWidth() / frameHeight();
        camera.updateProjectionMatrix();
      }
      for (const renderer of [lettersRenderer, cardsRenderer]) {
        renderer.setSize(frameWidth(), frameHeight());
      }
      cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      updateTargetPositions(progress);
    };
    window.addEventListener("resize", onResize);

    drawGrid(0);
    animate();
    updateTargetPositions(0);

    Promise.all(images.map(loadImage)).then((textures) => {
      if (disposed) return;
      loadedImages = textures;
      drawCardsOnCanvas(0);
      cardsTexture.needsUpdate = true;

      trigger = ScrollTrigger.create({
        trigger: workSection,
        scroller,
        start: "top top",
        end: "+=700%",
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateTargetPositions(self.progress);
          drawCardsOnCanvas(self.progress);
          drawGrid(self.progress);
          cardsTexture.needsUpdate = true;
        },
      });

      ScrollTrigger.refresh();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      trigger?.kill();
      for (const texture of loadedImages) texture.dispose();
      cardsTexture.dispose();
      cardsGeometry.dispose();
      cardsMaterial.dispose();
      for (const line of paths) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
      lettersRenderer.dispose();
      cardsRenderer.dispose();
      lettersRenderer.domElement.remove();
      cardsRenderer.domElement.remove();
      gridCanvas.remove();
      textContainer.replaceChildren();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, images, letters, accent]);

  return (
    <div
      className={embedded ? "wdk-root wdk-embedded" : "wdk-root"}
      ref={rootRef}
      style={{ "--wdk-accent": accent } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="wdk-content">
        <section className="wdk-intro">
          <h1>{introHeading}</h1>
        </section>
        <section className="wdk-work">
          <div className="wdk-text-container" />
        </section>
        <section className="wdk-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&display=swap");

.wdk-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--wdk-accent);
  container-type: inline-size;
}
.wdk-root.wdk-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.wdk-root.wdk-embedded::-webkit-scrollbar { display: none; }
.wdk-root * { box-sizing: border-box; margin: 0; padding: 0; }
.wdk-content { position: relative; width: 100%; }
.wdk-root section {
  width: 100%;
  height: 100svh;
  position: relative;
}
.wdk-intro,
.wdk-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--wdk-accent);
  color: #000;
}
.wdk-intro h1,
.wdk-outro h1 {
  font-family: "Anton", sans-serif;
  font-size: 5cqw;
  font-weight: lighter;
  text-transform: uppercase;
}
.wdk-work {
  position: relative;
  background-color: #000;
  overflow: hidden;
}
.wdk-root canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.wdk-root canvas.wdk-letters-canvas { z-index: 1; }
.wdk-root canvas.wdk-cards-canvas { z-index: 10; }
.wdk-root canvas.wdk-grid-canvas { z-index: 0; }
.wdk-text-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
  perspective: 2500px;
  perspective-origin: center;
}
.wdk-letter {
  position: absolute;
  font-family: "Anton", sans-serif;
  font-size: 14rem;
  font-weight: bold;
  color: var(--wdk-accent);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 1;
  z-index: 2;
  transform-origin: center;
  transform-style: preserve-3d;
  will-change: transform;
}
`;
