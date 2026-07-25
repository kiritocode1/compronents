"use client";

/**
 * Triangle Fill Scroll - a pinned scene where a lattice of alternating
 * triangles floods with color in a random order. Every cell is assigned a
 * shuffled position in the sequence at build time, then filled once scroll
 * passes its slot, each easing toward its target scale on its own, so the fill
 * spreads as scattered noise rather than a wipe. Two canvases stack around the
 * cards: hollow outlines behind them and filled triangles in front, so the
 * cards are swallowed as the grid closes over them.
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

const ASSET_BASE = "https://ui.aryank.space/assets/triangle-fill-scroll";

export interface TriangleCard {
  title: string;
  code: string;
  image: string;
}

export interface TriangleFillScrollProps {
  heroHeading?: string;
  heroAccent?: string;
  outroHeading?: string;
  outroAccent?: string;
  backgroundImage?: string;
  cards?: TriangleCard[];
  accent?: string;
  triangleSize?: number;
  embedded?: boolean;
}

const DEFAULT_CARDS: TriangleCard[] = [
  {
    title: "Silent Veil",
    code: "PROD8372",
    image: `${ASSET_BASE}/card-1.jpg`,
  },
  {
    title: "Crimson Echoes",
    code: "PROD4921",
    image: `${ASSET_BASE}/card-2.jpg`,
  },
  {
    title: "Zenith Arc",
    code: "PROD7586",
    image: `${ASSET_BASE}/card-3.jpg`,
  },
];

interface TriangleState {
  order: number;
  scale: number;
  row: number;
  col: number;
}

export default function TriangleFillScroll({
  heroHeading = "Powered by Imagination",
  heroAccent = "Enter a Universe",
  outroHeading = "to embrace the light",
  outroAccent = "shadows",
  backgroundImage = `${ASSET_BASE}/bg.jpg`,
  cards = DEFAULT_CARDS,
  accent = "#ff6b00",
  triangleSize = 150,
  embedded = true,
}: TriangleFillScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".okw-content");
    const stickySection = root.querySelector<HTMLElement>(".okw-sticky");
    const outlineCanvas =
      root.querySelector<HTMLCanvasElement>(".okw-outline-layer");
    const fillCanvas = root.querySelector<HTMLCanvasElement>(".okw-fill-layer");
    const cardsEl = root.querySelector<HTMLElement>(".okw-cards");
    const outlineCtx = outlineCanvas?.getContext("2d");
    const fillCtx = fillCanvas?.getContext("2d");
    if (
      !content ||
      !stickySection ||
      !outlineCanvas ||
      !fillCanvas ||
      !cardsEl ||
      !outlineCtx ||
      !fillCtx
    ) {
      return;
    }

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

    const setCanvasSize = (
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
    ) => {
      const dpr = window.devicePixelRatio || 1;
      const w = frameWidth();
      const h = frameHeight();
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setCanvasSize(outlineCanvas, outlineCtx);
    setCanvasSize(fillCanvas, fillCtx);

    const lineWidth = 1;
    const SCALE_THRESHOLD = 0.01;
    const triangleStates = new Map<string, TriangleState>();
    let animationFrameId: number | null = null;
    let canvasXPosition = 0;

    const drawTriangle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      fillScale = 0,
      flipped = false,
    ) => {
      const halfSize = triangleSize / 2;

      const path = () => {
        ctx.beginPath();
        if (!flipped) {
          ctx.moveTo(x, y - halfSize);
          ctx.lineTo(x + halfSize, y + halfSize);
          ctx.lineTo(x - halfSize, y + halfSize);
        } else {
          ctx.moveTo(x, y + halfSize);
          ctx.lineTo(x + halfSize, y - halfSize);
          ctx.lineTo(x - halfSize, y - halfSize);
        }
        ctx.closePath();
      };

      if (fillScale < SCALE_THRESHOLD) {
        path();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.075)";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      if (fillScale >= SCALE_THRESHOLD) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(fillScale, fillScale);
        ctx.translate(-x, -y);

        path();
        ctx.fillStyle = accent;
        ctx.strokeStyle = accent;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    };

    const drawGrid = (scrollProgress = 0) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);

      const animationProgress =
        scrollProgress <= 0.65 ? 0 : (scrollProgress - 0.65) / 0.35;

      let needsUpdate = false;
      const animationSpeed = 0.15;

      for (const state of triangleStates.values()) {
        if (state.scale < 1) {
          const x =
            state.col * (triangleSize * 0.5) +
            triangleSize / 2 +
            canvasXPosition;
          const y = state.row * triangleSize + triangleSize / 2;
          const flipped = (state.row + state.col) % 2 !== 0;
          drawTriangle(outlineCtx, x, y, 0, flipped);
        }
      }

      for (const state of triangleStates.values()) {
        const shouldBeVisible = state.order <= animationProgress;
        const targetScale = shouldBeVisible ? 1 : 0;
        const newScale =
          state.scale + (targetScale - state.scale) * animationSpeed;

        if (Math.abs(newScale - state.scale) > 0.001) {
          state.scale = newScale;
          needsUpdate = true;
        }

        if (state.scale >= SCALE_THRESHOLD) {
          const x =
            state.col * (triangleSize * 0.5) +
            triangleSize / 2 +
            canvasXPosition;
          const y = state.row * triangleSize + triangleSize / 2;
          const flipped = (state.row + state.col) % 2 !== 0;
          drawTriangle(fillCtx, x, y, state.scale, flipped);
        }
      }

      if (needsUpdate) {
        animationFrameId = requestAnimationFrame(() =>
          drawGrid(scrollProgress),
        );
      }
    };

    const initializeTriangles = () => {
      const cols = Math.ceil(frameWidth() / (triangleSize * 0.5));
      const rows = Math.ceil(frameHeight() / (triangleSize * 0.5));
      const totalTriangles = rows * cols;

      const positions: { row: number; col: number; key: string }[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions.push({ row: r, col: c, key: `${r}-${c}` });
        }
      }

      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }

      positions.forEach((pos, index) => {
        triangleStates.set(pos.key, {
          order: index / totalTriangles,
          scale: 0,
          row: pos.row,
          col: pos.col,
        });
      });
    };

    initializeTriangles();
    drawGrid();

    const onResize = () => {
      setCanvasSize(outlineCanvas, outlineCtx);
      setCanvasSize(fillCanvas, fillCtx);
      triangleStates.clear();
      initializeTriangles();
      drawGrid();
    };
    window.addEventListener("resize", onResize);

    const stickyHeight = frameHeight() * 5;

    const trigger = ScrollTrigger.create({
      trigger: stickySection,
      scroller,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        canvasXPosition = -self.progress * 200;
        drawGrid(self.progress);

        const progress = Math.min(self.progress / 0.654, 1);
        gsap.set(cardsEl, { x: -progress * frameWidth() * 2 });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, cards, accent, triangleSize]);

  return (
    <div
      className={embedded ? "okw-root okw-embedded" : "okw-root"}
      ref={rootRef}
      style={{ "--okw-accent": accent } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="okw-content">
        <section className="okw-hero">
          <h1>
            <span>{heroAccent}</span> {heroHeading}
          </h1>
        </section>

        <section className="okw-sticky">
          <div className="okw-bg-img">
            <img src={backgroundImage} alt="" />
          </div>

          <canvas className="okw-outline-layer" />

          <div className="okw-cards">
            {cards.map((card) => (
              <div className="okw-card" key={card.code}>
                <div className="okw-card-img">
                  <img src={card.image} alt="" />
                </div>
                <div className="okw-card-title">
                  <h1>{card.title}</h1>
                  <p>{card.code}</p>
                </div>
              </div>
            ))}
          </div>

          <canvas className="okw-fill-layer" />
        </section>

        <section className="okw-outro">
          <h1>
            Chase the <span>{outroAccent}</span> {outroHeading}
          </h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:opsz,wght@14..32,100..900&display=swap");

.okw-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #000;
}
.okw-root.okw-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.okw-root.okw-embedded::-webkit-scrollbar { display: none; }
.okw-root * { margin: 0; padding: 0; box-sizing: border-box; }
.okw-content { position: relative; width: 100%; }
.okw-root img { width: 100%; height: 100%; object-fit: cover; }
.okw-root h1 {
  text-transform: uppercase;
  font-family: "Anton", sans-serif;
  font-weight: lighter;
  font-size: 64px;
  line-height: 1;
}
.okw-root h1 span { color: var(--okw-accent); }
.okw-root p { font-size: 14px; font-weight: 500; }
.okw-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.okw-hero,
.okw-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  color: #fff;
}
.okw-hero h1,
.okw-outro h1 { text-align: center; font-size: 80px; }
.okw-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.okw-root canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 150% !important;
  height: 150% !important;
}
.okw-root canvas.okw-outline-layer { z-index: 1; }
.okw-root canvas.okw-fill-layer { z-index: 3; }
.okw-cards {
  position: absolute;
  top: 0;
  left: 0;
  width: 300%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  will-change: transform;
  z-index: 2;
}
.okw-card {
  position: relative;
  width: 10%;
  height: 75%;
  background-color: black;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.5em;
}
.okw-card-img,
.okw-card-title { flex: 1; overflow: hidden; }
.okw-card-title {
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

@media (max-width: 900px) {
  .okw-card { width: 25%; }
}
`;
