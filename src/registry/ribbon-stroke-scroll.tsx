"use client";

/**
 * Ribbon Stroke Scroll - a pinned intro where thick rounded ribbons draw
 * themselves across three oversized rows as you scroll, two curved ribbons
 * sweep through and erase themselves, the palette flips to dark at the
 * halfway point, and finally the rows slide off screen.
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

export interface RibbonStrokeScrollProps {
  /** Ribbon colors for the three rows, three ribbons each. */
  rowColors?: [
    [string, string, string],
    [string, string, string],
    [string, string, string],
  ];
  /** Colors of the two curved sweep ribbons. */
  curveColors?: [string, string];
  borderColor?: string;
  introInText?: string;
  introOutText?: string;
  outroText?: string;
  embedded?: boolean;
}

const DEFAULT_ROW_COLORS: [
  [string, string, string],
  [string, string, string],
  [string, string, string],
] = [
  ["#FF6D38", "#C6FE69", "#7A78FF"],
  ["#7A78FF", "#B9DDFD", "#C6FE69"],
  ["#FFC412", "#FF6D38", "#B9DDFD"],
];

/** Reveal order: row-ribbon pairs, matching the source choreography. */
const REVEAL_ORDER: [number, number][] = [
  [0, 0],
  [2, 0],
  [1, 0],
  [0, 1],
  [2, 1],
  [1, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

const LINE_PATH = "M180 180H3180";
const CURVE_PATH = "M180 180.538C1512.01 180.54 1718.64 133.099 2067.5 931.594";

export default function RibbonStrokeScroll({
  rowColors = DEFAULT_ROW_COLORS,
  curveColors = ["#FFC412", "#FF6D38"],
  borderColor = "#0f0f0f",
  introInText = "Scroll down to watch calm quietly unravel",
  introOutText = "Welcome back, things have shifted again",
  outroText = "Every line you drew is still down here",
  embedded = true,
}: RibbonStrokeScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".rss-content");
    const introSection = root.querySelector<HTMLElement>(".rss-intro");
    if (!content || !introSection) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const allPaths = root.querySelectorAll<SVGPathElement>(".rss-row svg path");
    for (const path of allPaths) {
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = `${pathLength}`;
      path.style.strokeDashoffset = `${pathLength}`;
    }

    const tl = gsap.timeline();
    const viewportHeight = embedded
      ? (root.clientHeight ?? window.innerHeight)
      : window.innerHeight;

    const trigger = ScrollTrigger.create({
      trigger: introSection,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: `+=${viewportHeight * 8}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      animation: tl,
      onUpdate: (self) => {
        introSection.classList.toggle("rss-out", self.progress >= 0.5);
      },
    });

    REVEAL_ORDER.forEach(([row, col], index) => {
      const paths = root.querySelectorAll(`.rss-line-${row}-${col} path`);
      tl.to(
        paths,
        { strokeDashoffset: 0, duration: 1.5, ease: "power2.out" },
        index * 0.3,
      );
    });

    const curveStartTime = 5 * 0.3 + 0.3;
    for (let index = 0; index < 2; index++) {
      const paths = root.querySelectorAll<SVGPathElement>(
        `.rss-curve-${index} path`,
      );
      if (!paths[0]) continue;
      const pathLength = paths[0].getTotalLength();
      const curveStartAt = curveStartTime + index * 1;

      tl.to(
        paths,
        { strokeDashoffset: 0, duration: 1, ease: "power2.out" },
        curveStartAt,
      );
      tl.to(
        paths,
        {
          strokeDashoffset: -pathLength,
          duration: 1.5,
          ease: "power2.inOut",
        },
        curveStartAt + 1,
      );
    }

    const svgRows = root.querySelectorAll(".rss-lines .rss-row");
    tl.to(
      svgRows,
      { xPercent: 100, duration: 2, ease: "power3.inOut", stagger: 0.15 },
      ">-0.5",
    );

    return () => {
      trigger.kill();
      tl.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  const renderLine = (color: string, row: number, col: number) => (
    <svg
      className={`rss-line-${row}-${col}`}
      fill="none"
      key={`${row}-${col}`}
      viewBox="0 0 3360 360"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={LINE_PATH}
        stroke={borderColor}
        strokeLinecap="round"
        strokeMiterlimit={3.8637}
        strokeWidth={370}
      />
      <path
        d={LINE_PATH}
        stroke={color}
        strokeLinecap="round"
        strokeMiterlimit={3.8637}
        strokeWidth={360}
      />
    </svg>
  );

  const renderCurve = (color: string, index: number) => (
    <svg
      className={`rss-curve-${index}`}
      fill="none"
      key={`curve-${index}`}
      viewBox="0 -10 2248 1132"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={CURVE_PATH}
        stroke={borderColor}
        strokeLinecap="round"
        strokeMiterlimit={3.8637}
        strokeWidth={370}
      />
      <path
        d={CURVE_PATH}
        stroke={color}
        strokeLinecap="round"
        strokeMiterlimit={3.8637}
        strokeWidth={360}
      />
    </svg>
  );

  return (
    <div className="rss-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="rss-content">
        <section className="rss-intro">
          <h1 className="rss-header-in">{introInText}</h1>
          <h1 className="rss-header-out">{introOutText}</h1>

          <div className="rss-lines">
            {rowColors.map((colors, rowIndex) => (
              <div
                className="rss-row"
                // ponytail: fixed 3-row layout, index key is fine
                key={`row-${rowIndex}`}
              >
                {colors.map((color, colIndex) =>
                  renderLine(color, rowIndex, colIndex),
                )}
              </div>
            ))}
          </div>

          <div className="rss-curves">
            <div className="rss-row" />
            <div className="rss-row">
              {curveColors.map((color, index) => renderCurve(color, index))}
            </div>
            <div className="rss-row" />
          </div>
        </section>

        <section className="rss-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800&display=swap");

.rss-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Barlow Condensed", sans-serif;
}

.rss-root::-webkit-scrollbar {
  display: none;
}

.rss-root h1 {
  text-transform: uppercase;
  font-size: 4rem;
  font-weight: 800;
  line-height: 0.85;
}

.rss-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background-color: #e3e3db;
}

.rss-root section h1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  text-align: center;
}

.rss-header-out {
  display: none;
}

.rss-intro.rss-out {
  background-color: #141414;
  color: #fff;
}

.rss-intro.rss-out .rss-header-in {
  display: none;
}

.rss-intro.rss-out .rss-header-out {
  display: block;
}

.rss-lines,
.rss-curves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300%;
  height: calc(100svh - 7.5px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.rss-row {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.rss-row svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  overflow: visible;
}

.rss-curves svg {
  position: absolute;
  top: 0%;
  left: 40%;
  height: 310%;
  object-fit: contain;
  transform: translate(-50%, -1%);
}

.rss-row svg path {
  will-change: stroke-dashoffset;
}

@media (max-width: 1000px) {
  .rss-root section h1 {
    width: 90%;
  }

  .rss-lines,
  .rss-curves {
    width: 1000%;
  }
}
`;
