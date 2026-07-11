"use client";

/**
 * Cursor Trail Scroll - a monochrome editorial page whose pointer draws a
 * persistent, blurred white line across the full document. The trail follows
 * the pointer through smooth scrolling while the navigation remains pinned.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/cursor-trail-scroll";

export interface CursorTrailScrollProps {
  logoImage?: string;
  images?: [string, string, string];
  brand?: string;
  discipline?: string;
  about?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES: [string, string, string] = [
  `${ASSET_BASE}/img-1.jpg`,
  `${ASSET_BASE}/img-2.jpg`,
  `${ASSET_BASE}/img-3.jpg`,
];

const COPY = [
  [
    "Gothic is an independent image practice shaping campaigns, moving identities, and visual systems for artists who work beyond category.",
    "Each commission begins with a tension: ritual and technology, elegance and abrasion, precision and accident. We turn that friction into a visual language that can live across print, film, space, and screen.",
  ],
  [
    "Our process moves between research, direction, and production. The result is never a single image, but a complete atmosphere with its own pace and memory.",
    "We collaborate closely with photographers, type designers, sound artists, and makers. Small teams keep the conversation direct and let every detail carry intent.",
  ],
  [
    "The archive below is not arranged by year or medium. It follows recurring gestures: bodies in motion, surfaces under pressure, symbols repeated until they become strange again.",
  ],
];

export default function CursorTrailScroll({
  logoImage = `${ASSET_BASE}/logo.png`,
  images = DEFAULT_IMAGES,
  brand = "Gothic",
  discipline = "Creative Direction",
  about = "An independent studio creating identities, campaigns, and moving images for culture-led brands.",
  embedded = true,
}: CursorTrailScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!root || !content || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scrollElement = embedded ? root : document.documentElement;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const resizeCanvas = () => {
      canvas.width = embedded ? root.clientWidth : window.innerWidth;
      canvas.height = Math.max(content.scrollHeight, root.clientHeight);
      context.lineWidth = 24;
      context.strokeStyle = "rgba(255, 255, 255, 0.8)";
      context.lineCap = "round";
      context.filter = "blur(12px)";
    };
    resizeCanvas();

    let lastX: number | null = null;
    let lastY: number | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let previousScroll = scrollElement.scrollTop;

    const drawLine = (x: number, y: number) => {
      if (lastX !== null && lastY !== null) {
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.stroke();
      }
      lastX = x;
      lastY = y;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top + scrollElement.scrollTop;
      drawLine(pointerX, pointerY);
    };
    root.addEventListener("pointermove", onPointerMove);

    const onScroll = () => {
      const currentScroll = scrollElement.scrollTop;
      if (lastX !== null && lastY !== null) {
        pointerY += currentScroll - previousScroll;
        drawLine(pointerX, pointerY);
      }
      previousScroll = currentScroll;
    };
    lenis.on("scroll", onScroll);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(content);

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div className="cts-root" ref={rootRef}>
      <style>{styles}</style>
      <canvas className="cts-trail" ref={canvasRef} />
      <div className="cts-content" ref={contentRef}>
        <nav className="cts-nav">
          <div className="cts-logo">
            <a href="#cts-top">{brand}</a>
          </div>
          <div>
            <p>{discipline}</p>
          </div>
          <div>
            <p>{about}</p>
          </div>
        </nav>

        <div className="cts-header" id="cts-top">
          <img alt={`${brand} wordmark`} draggable={false} src={logoImage} />
        </div>

        <div className="cts-image cts-hero-image">
          <img
            alt="Figure in a monochrome editorial setting"
            draggable={false}
            src={images[0]}
          />
        </div>

        <section className="cts-copy">
          {COPY[0].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <div className="cts-image">
          <img alt="Dark fashion study" draggable={false} src={images[1]} />
        </div>

        <section className="cts-copy">
          {COPY[1].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <div className="cts-image">
          <img
            alt="Textural monochrome portrait"
            draggable={false}
            src={images[2]}
          />
        </div>

        <section className="cts-copy cts-copy-final">
          <p>{COPY[2][0]}</p>
        </section>

        <div className="cts-header cts-header-final">
          <img alt="" draggable={false} src={logoImage} />
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&family=Italiana&display=swap");

.cts-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #121212;
  color: #fff;
  font-family: "DM Mono", monospace;
}

.cts-root::-webkit-scrollbar {
  display: none;
}

.cts-trail {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  pointer-events: none;
}

.cts-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 2rem;
  mix-blend-mode: difference;
}

.cts-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cts-root a,
.cts-root p {
  margin: 0;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.3;
}

.cts-nav {
  position: sticky;
  top: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: calc(100% + 4rem);
  margin: -2rem -2rem 0;
  padding: 2rem;
  mix-blend-mode: difference;
}

.cts-logo a {
  font-family: "Italiana", serif;
  font-size: 1rem;
  text-transform: none;
}

.cts-header {
  position: relative;
  top: 8rem;
  height: clamp(7rem, 20vw, 18rem);
  margin-bottom: 12rem;
}

.cts-header img {
  object-fit: contain;
}

.cts-image {
  width: 100%;
  height: min(50rem, 82svh);
  padding-bottom: 1rem;
  overflow: hidden;
  filter: saturate(0);
}

.cts-copy {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 1rem 0;
  padding: 0 0 8rem;
}

.cts-copy p {
  max-width: 48rem;
  opacity: 0.75;
}

.cts-copy-final {
  grid-template-columns: 1fr;
}

.cts-copy-final p {
  max-width: 70rem;
}

.cts-header-final {
  top: 0;
  margin: 2rem 0 4rem;
}

@media (max-width: 760px) {
  .cts-content {
    padding: 1.25rem;
  }

  .cts-nav {
    grid-template-columns: 1fr auto;
    width: calc(100% + 2.5rem);
    margin: -1.25rem -1.25rem 0;
    padding: 1.25rem;
  }

  .cts-nav > div:last-child {
    display: none;
  }

  .cts-header {
    top: 5rem;
    margin-bottom: 8rem;
  }

  .cts-image {
    height: 65svh;
  }

  .cts-copy {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-bottom: 5rem;
  }
}
`;
