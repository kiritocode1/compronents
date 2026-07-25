"use client";

/**
 * Drawn Path Features - a feature section threaded together by one fat
 * orange stroke. The path sits behind the content and draws itself in exact
 * step with the scroll, so the line arrives at each illustration and card just
 * as that block reaches reading position, and finishes with the last row.
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

const ASSET_BASE = "https://ui.aryank.space/assets/drawn-path-features";

export interface StrokePathCard {
  heading: string;
  body: string;
}

export interface DrawnPathFeaturesProps {
  heroHeading?: string;
  outroHeading?: string;
  images?: [string, string, string, string];
  cards?: [StrokePathCard, StrokePathCard];
  strokeColor?: string;
  strokeWidth?: number;
  embedded?: boolean;
}

const DEFAULT_CARDS: [StrokePathCard, StrokePathCard] = [
  {
    heading: "A cleaner way to handle incoming updates",
    body: "Instead of showing every message or notification instantly, the app groups related items and presents them in an organized panel. It keeps your workspace calm, even when activity spikes.",
  },
  {
    heading: "Built for increasing information demands",
    body: "Whether it is files, notes, or incoming messages, the app sorts and prioritizes items automatically. It prevents clutter and helps maintain clarity during busy periods.",
  },
];

const STROKE_D =
  "M639.668 100C639.668 100 105.669 100 199.669 601.503C293.669 1103.01 1277.17 691.502 1277.17 1399.5C1277.17 2107.5 -155.332 1968 140.168 1438.5C435.669 909.002 1442.66 2093.5 713.168 2659.5";

export default function DrawnPathFeatures({
  heroHeading = "Designed to keep information clear and connected",
  outroHeading = "Clearer organization ready for whatever comes next",
  images = [
    `${ASSET_BASE}/img_1.svg`,
    `${ASSET_BASE}/img_2.svg`,
    `${ASSET_BASE}/img_3.svg`,
    `${ASSET_BASE}/img_4.svg`,
  ],
  cards = DEFAULT_CARDS,
  strokeColor = "#FF5F0A",
  strokeWidth = 200,
  embedded = true,
}: DrawnPathFeaturesProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sps-content");
    const spotlight = root.querySelector<HTMLElement>(".sps-spotlight");
    const path = root.querySelector<SVGPathElement>(".sps-stroke-path");
    if (!content || !spotlight || !path) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: spotlight,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    ScrollTrigger.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "sps-root sps-embedded" : "sps-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sps-content">
        <section className="sps-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="sps-spotlight">
          <div className="sps-row">
            <div className="sps-img">
              <img src={images[0]} alt="" />
            </div>
          </div>

          <div className="sps-row">
            <div className="sps-col">
              <div className="sps-card">
                <h2>{cards[0].heading}</h2>
                <p>{cards[0].body}</p>
              </div>
            </div>
            <div className="sps-col">
              <div className="sps-img">
                <img src={images[1]} alt="" />
              </div>
            </div>
          </div>

          <div className="sps-row">
            <div className="sps-col">
              <div className="sps-img">
                <img src={images[2]} alt="" />
              </div>
            </div>
            <div className="sps-col">
              <div className="sps-card">
                <h2>{cards[1].heading}</h2>
                <p>{cards[1].body}</p>
              </div>
            </div>
          </div>

          <div className="sps-row">
            <div className="sps-img">
              <img src={images[3]} alt="" />
            </div>
          </div>

          <div className="sps-svg-path">
            <svg
              viewBox="0 0 1378 2760"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMin meet"
              aria-hidden="true"
            >
              <path
                className="sps-stroke-path"
                d={STROKE_D}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </section>

        <section className="sps-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.sps-root {
  --base-100: #fafaf0;
  --base-200: #deded5;
  --base-300: #0f0f0f;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Manrope", sans-serif;
  background-color: var(--base-100);
  color: var(--base-300);
  container-type: inline-size;
}
.sps-root.sps-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.sps-root.sps-embedded::-webkit-scrollbar { display: none; }
.sps-root * { margin: 0; padding: 0; box-sizing: border-box; }
.sps-content { position: relative; width: 100%; }
.sps-root h1,
.sps-root h2 { font-weight: 500; line-height: 1.1; }
.sps-root h1 { font-size: 4rem; letter-spacing: -0.1rem; }
.sps-root h2 { font-size: 2.5rem; letter-spacing: -0.075rem; }
.sps-root p { font-size: 1.125rem; font-weight: 500; }
.sps-root img { width: 100%; height: 100%; object-fit: cover; }
.sps-hero,
.sps-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  background-color: var(--base-200);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.sps-hero h1,
.sps-outro h1 { width: 60%; text-align: center; }
.sps-spotlight {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 10rem;
  overflow: hidden;
}
.sps-spotlight .sps-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
}
.sps-spotlight .sps-row .sps-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sps-spotlight .sps-row:nth-child(1) .sps-img,
.sps-spotlight .sps-row:nth-child(4) .sps-img { width: 50%; }
.sps-spotlight .sps-card {
  width: 75%;
  margin: 0 auto;
  padding: 3rem;
  background-color: var(--base-200);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sps-spotlight .sps-svg-path {
  position: absolute;
  top: 25svh;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 100%;
  z-index: -1;
}
.sps-spotlight .sps-svg-path svg { width: 100%; height: auto; }

@container (max-width: 1000px) {
  .sps-root h1,
  .sps-root h2 { letter-spacing: 0; }
  .sps-root h1 { font-size: 2rem; }
  .sps-root h2 { font-size: 1.5rem; }
  .sps-root p { font-size: 1rem; }
  .sps-hero h1,
  .sps-outro h1 { width: 100%; }
  .sps-spotlight { gap: 5rem; }
  .sps-spotlight .sps-row { flex-direction: column; }
  .sps-spotlight .sps-row:nth-child(1) .sps-img,
  .sps-spotlight .sps-row:nth-child(4) .sps-img { width: 100%; }
  .sps-spotlight .sps-card { width: 100%; }
  .sps-spotlight .sps-svg-path { top: 15svh; width: 275%; }
}
`;
