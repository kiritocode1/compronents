"use client";

/**
 * Image Reveal — a scroll-powered stack of images that dissolve into each other.
 *
 * Images are stacked; scrolling drives a clip-path that wipes each one away to
 * expose the next, and a band of randomized ASCII characters scatters across the
 * seam as it travels — a glitchy "decode" between frames. Driven by a pinned
 * GSAP ScrollTrigger with Lenis smooth scroll.
 *
 * By default it owns a scroll container sized to its box (`embedded`), so it
 * drops straight into a bounded demo or a full-height section. Set
 * `embedded={false}` to drive it from the window scroll instead.
 *
 * BLANK — aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

export interface ImageRevealProps {
  /** Stacked images, revealed top to bottom as you scroll. */
  images?: string[];
  /** Copy shown in the intro / outro panels. */
  introText?: string;
  outroText?: string;
  /** Color of the dissolve characters. */
  dissolveColor?: string;
  /** Size of each dissolve cell, in px. */
  dissolveCellSize?: number;
  /** Own an internal scroll container (true) or use the window scroll (false). */
  embedded?: boolean;
}

const COMPRONENTS_ASSET_BASE = "https://compronents.dev/assets/image-reveal";
const DEFAULT_IMAGES = [1, 2, 3, 4, 5].map(
  (n) => `${COMPRONENTS_ASSET_BASE}/img-${n}.jpg`,
);

const DISSOLVE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*+=?!<>{}[]";
const SPREAD_ABOVE = 0.25;
const SPREAD_BELOW = 0.25;
const SCATTER_INTENSITY = 0.15;
const SOLID_CORE_RADIUS = 0.025;
const MIN_SCATTER_AT_CENTER = 0.3;
const VISIBILITY_THRESHOLD = 0.65;

export default function ImageReveal({
  images = DEFAULT_IMAGES,
  introText = "Scroll down to decode the craft",
  outroText = "The rest is under NDA",
  dissolveColor = "#ff6426",
  dissolveCellSize = 16,
  embedded = true,
}: ImageRevealProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: text props seed static DOM; the scroll machinery rebuilds only on layout / image / mode changes.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    const spotlight = spotlightRef.current;
    const grid = gridRef.current;
    if (!scroller || !content || !spotlight || !grid) return;

    const viewportW = embedded ? scroller.clientWidth : window.innerWidth;
    const viewportH = embedded ? scroller.clientHeight : window.innerHeight;

    // In embedded mode the scroller has a fixed height but no viewport units to
    // reference, so pin each section to the measured height explicitly.
    if (embedded) scroller.style.setProperty("--ir-vh", `${viewportH}px`);

    /* ---- Smooth scroll ---- */
    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content })
      : new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    /* ---- Dissolve grid ---- */
    const columns = Math.ceil(viewportW / dissolveCellSize);
    const rows = Math.ceil(viewportH / dissolveCellSize);
    const fontSize = Math.round(dissolveCellSize * 0.7);
    grid.style.setProperty("--ir-dissolve-color", dissolveColor);

    const cellEls: HTMLDivElement[] = [];
    const cells: { row: number; col: number; normalizedY: number }[] = [];
    const randomChar = () =>
      DISSOLVE_CHARS[Math.floor(Math.random() * DISSOLVE_CHARS.length)];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = document.createElement("div");
        cell.className = "ir-cell";
        cell.style.left = `${col * dissolveCellSize}px`;
        cell.style.top = `${row * dissolveCellSize}px`;
        cell.style.width = `${dissolveCellSize}px`;
        cell.style.height = `${dissolveCellSize}px`;
        cell.style.fontSize = `${fontSize}px`;
        cell.textContent = randomChar();
        grid.appendChild(cell);
        cellEls.push(cell);
        cells.push({ row, col, normalizedY: (row + 0.5) / rows });
      }
    }

    const hash = (row: number, col: number, seed: number) => {
      const raw = Math.sin(row * seed + col * (seed * 2.45)) * 43758.5453;
      return raw - Math.floor(raw);
    };
    const cellVisibility = cells.map((c) => hash(c.row, c.col, 127.1));
    const cellScatter = cells.map(
      (c) => (hash(c.row, c.col, 269.3) - 0.5) * SCATTER_INTENSITY,
    );

    /* ---- Image stack ---- */
    const stacked = [...spotlight.querySelectorAll<HTMLElement>(".ir-img")];
    const total = stacked.length;
    const transitions = total - 1;
    stacked.forEach((img, i) => {
      img.style.zIndex = `${total - i}`;
    });

    const travelRange = 1 + SPREAD_ABOVE + SPREAD_BELOW;

    const updateClipPaths = (scrollProgress: number) => {
      for (let i = 0; i < transitions; i++) {
        const segmentStart = i / transitions;
        const segmentEnd = (i + 1) / transitions;
        let segmentProgress =
          (scrollProgress - segmentStart) / (segmentEnd - segmentStart);
        segmentProgress = gsap.utils.clamp(0, 1, segmentProgress);
        const remapped = -SPREAD_ABOVE + segmentProgress * travelRange;
        const clip = gsap.utils.clamp(0, 100, remapped * 100);
        stacked[i].style.clipPath =
          `polygon(0% ${clip}%, 100% ${clip}%, 100% 100%, 0% 100%)`;
      }
    };

    const updateDissolveBand = (bandCenterY: number) => {
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const rawDistance = Math.abs(cell.normalizedY - bandCenterY);
        const scatterStrength = gsap.utils.clamp(
          MIN_SCATTER_AT_CENTER,
          1,
          rawDistance / SOLID_CORE_RADIUS,
        );
        const scattered =
          cell.normalizedY - bandCenterY + cellScatter[i] * scatterStrength;
        const normalizedDistance =
          scattered >= 0
            ? scattered / SPREAD_BELOW
            : Math.abs(scattered) / SPREAD_ABOVE;
        if (normalizedDistance >= 1) {
          cellEls[i].style.visibility = "hidden";
          continue;
        }
        const density = (1 - normalizedDistance) ** 2;
        const visible = density > cellVisibility[i] * VISIBILITY_THRESHOLD;
        cellEls[i].style.visibility = visible ? "visible" : "hidden";
      }
    };

    const hideAllCells = () => {
      for (const el of cellEls) el.style.visibility = "hidden";
    };

    let activeTransition = -1;
    const trigger = ScrollTrigger.create({
      trigger: spotlight,
      scroller: embedded ? scroller : undefined,
      start: "top top",
      end: `+=${transitions * viewportH}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const scrollProgress = self.progress;
        const rawPosition = scrollProgress * transitions;
        const currentTransition = Math.min(
          Math.floor(rawPosition),
          transitions - 1,
        );
        const transitionProgress = gsap.utils.clamp(
          0,
          1,
          rawPosition - currentTransition,
        );
        if (currentTransition !== activeTransition) {
          activeTransition = currentTransition;
        }
        const bandCenterY = -SPREAD_ABOVE + transitionProgress * travelRange;

        if (transitionProgress <= 0 || transitionProgress >= 1) {
          hideAllCells();
          updateClipPaths(scrollProgress);
          return;
        }
        updateClipPaths(scrollProgress);
        updateDissolveBand(bandCenterY);
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      lenis.off("scroll", onScroll);
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      grid.replaceChildren();
    };
  }, [images, dissolveColor, dissolveCellSize, embedded]);

  return (
    <div className={embedded ? "ir-root ir-embedded" : "ir-root"}>
      <style>{styles}</style>
      <div className="ir-scroller" ref={scrollerRef}>
        <div className="ir-content" ref={contentRef}>
          <section className="ir-intro">
            <p>{introText}</p>
          </section>

          <section className="ir-spotlight" ref={spotlightRef}>
            {images.map((src) => (
              <div className="ir-img" key={src}>
                {/* biome-ignore lint/performance/noImgElement: raw cover image stacked for clip-path reveal. */}
                <img src={src} alt="" />
              </div>
            ))}
            <div className="ir-dissolve" ref={gridRef} />
          </section>

          <section className="ir-outro">
            <p>{outroText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap");

.ir-root {
  width: 100%;
  height: 100%;
}

.ir-root.ir-embedded .ir-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.ir-root.ir-embedded .ir-scroller::-webkit-scrollbar {
  display: none;
}

.ir-root .ir-content {
  width: 100%;
}

.ir-root .ir-intro,
.ir-root .ir-spotlight,
.ir-root .ir-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  min-height: 100svh;
  overflow: hidden;
}
.ir-root.ir-embedded .ir-intro,
.ir-root.ir-embedded .ir-spotlight,
.ir-root.ir-embedded .ir-outro {
  height: var(--ir-vh, 100%);
  min-height: var(--ir-vh, 100%);
}

.ir-root .ir-img,
.ir-root .ir-img img {
  width: 100%;
  height: 100%;
}

.ir-root .ir-img img {
  object-fit: cover;
  display: block;
}

.ir-root .ir-intro,
.ir-root .ir-outro {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #141414;
  color: #fff;
}

.ir-root .ir-intro p,
.ir-root .ir-outro p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-weight: 500;
  line-height: 1;
}

.ir-root .ir-img {
  position: absolute;
  top: 0;
  left: 0;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
}

.ir-root .ir-dissolve {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}

.ir-root .ir-cell {
  position: absolute;
  background: var(--ir-dissolve-color, #ff6426);
  visibility: hidden;
  font-family: "DM Mono", monospace;
  font-weight: 500;
  line-height: 1;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
`;
