"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const STROKE_STAGGER = 0.045;
const STROKE_DRAW_TIME = 1.25;
const OUTLINE_WIDTH = 7;
const SPOTLIGHT_PIN_HEIGHT = 4;
const STROKE_DRAW_ORDER = [0, 12, 2, 10, 4, 8, 6, 1, 3, 5, 7, 9, 11];

const STROKES = [
  "M -251 -42 C 156 -405 595 -695 1176 -648",
  "M -195 90 C 212 -273 651 -562 1232 -516",
  "M -138 223 C 269 -140 707 -430 1288 -383",
  "M -82 355 C 325 -8 764 -297 1345 -250",
  "M -26 488 C 381 125 820 -165 1401 -118",
  "M 30 620 C 438 257 876 -32 1457 15",
  "M 87 753 C 494 390 932 101 1513 147",
  "M 143 885 C 550 522 989 233 1570 280",
  "M 199 1018 C 606 655 1045 366 1626 412",
  "M 255 1150 C 663 788 1101 498 1682 545",
  "M 312 1283 C 719 920 1157 631 1738 677",
  "M 368 1416 C 775 1053 1214 763 1795 810",
  "M 424 1548 C 831 1185 1270 896 1851 942",
];

const SPARKLES = [
  "translate(360 230) scale(1.5)",
  "translate(1180 520) scale(1)",
  "translate(640 730) scale(0.65)",
];

export interface StrokeWipeSpotlightProps {
  intro?: string;
  beforeTitle?: string;
  beforeCopy?: string;
  afterTitle?: string;
  afterCopy?: string;
  outro?: string;
  embedded?: boolean;
}

export default function StrokeWipeSpotlight({
  intro = "Blink and you'll miss it",
  beforeTitle = "Wait for it",
  beforeCopy = "The good part is closer, just one scroll away. Don't blink, or you'll miss the moment it turns.",
  afterTitle = "There it is",
  afterCopy = "That's the kind of payoff worth holding out for. Clean, sharp, and right when you needed it.",
  outro = "Told you it was worth it",
  embedded = true,
}: StrokeWipeSpotlightProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const content = root.querySelector<HTMLElement>(".sws-content");
    const spotlight = root.querySelector<HTMLElement>(".sws-spotlight");
    const messageBefore = root.querySelector<HTMLElement>(
      ".sws-spotlight-content-in",
    );
    const messageAfter = root.querySelector<HTMLElement>(
      ".sws-spotlight-content-out",
    );
    if (!content || !spotlight || !messageBefore || !messageAfter) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const fills = Array.from(
      root.querySelectorAll<SVGPathElement>(".sws-stroke"),
    );
    const outlines: SVGPathElement[] = [];
    const strokes = fills.map((fill) => {
      const fillWidth = Number.parseFloat(fill.getAttribute("stroke-width")!);
      const outline = fill.cloneNode(true) as SVGPathElement;
      outline.classList.remove("sws-stroke");
      outline.setAttribute("stroke", "#141414");
      fill.setAttribute("stroke-width", `${fillWidth - OUTLINE_WIDTH}`);
      fill.before(outline);
      outlines.push(outline);

      const length = fill.getTotalLength();
      const layers = [outline, fill];
      layers.forEach((layer) => {
        layer.style.strokeDasharray = `${length}`;
        layer.style.strokeDashoffset = `${length}`;
      });
      return { layers, length };
    });

    const sparkles = Array.from(
      root.querySelectorAll<SVGPathElement>(".sws-sparkle"),
    );
    const startTime = (order: number) => order * STROKE_STAGGER;
    const timingWobble = (order: number) =>
      order % 2 === 0 ? 0 : STROKE_STAGGER * 0.6;
    const drawDuration = (order: number) =>
      STROKE_DRAW_TIME + (order % 3) * 0.12;

    const timeline = gsap.timeline();
    const trigger = ScrollTrigger.create({
      trigger: spotlight,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: () =>
        `+=${(embedded ? root.clientHeight : window.innerHeight) * SPOTLIGHT_PIN_HEIGHT}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      animation: timeline,
      invalidateOnRefresh: true,
    });

    const drawSteps = STROKE_DRAW_ORDER.map((strokeIndex, order) => ({
      strokeIndex,
      at: startTime(order) + timingWobble(order),
      duration: drawDuration(order),
    }));
    const coveredAt = Math.max(
      ...drawSteps.map((step) => step.at + step.duration),
    );

    drawSteps.forEach(({ strokeIndex, at, duration }) => {
      timeline.to(
        strokes[strokeIndex].layers,
        { strokeDashoffset: 0, duration, ease: "power2.out" },
        at,
      );
    });

    timeline.set(messageBefore, { opacity: 0 }, coveredAt);
    timeline.set(messageAfter, { opacity: 1 }, coveredAt);

    [...STROKE_DRAW_ORDER].reverse().forEach((strokeIndex, order) => {
      const { layers, length } = strokes[strokeIndex];
      timeline.to(
        layers,
        {
          strokeDashoffset: -length,
          duration: drawDuration(order),
          ease: "power2.in",
        },
        coveredAt + startTime(order) + timingWobble(order),
      );
    });

    sparkles.forEach((sparkle, index) => {
      const popAt = coveredAt - 0.4 + index * 0.25;
      timeline
        .fromTo(
          sparkle,
          { scale: 0, rotate: -60, transformOrigin: "center" },
          { scale: 1, rotate: 60, duration: 0.5, ease: "back.out(2)" },
          popAt,
        )
        .to(
          sparkle,
          { scale: 0, rotate: 140, duration: 0.5, ease: "back.in(2)" },
          popAt + 0.6,
        );
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      timeline.kill();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      outlines.forEach((outline) => outline.remove());
      fills.forEach((fill) => {
        fill.setAttribute("stroke-width", "150");
        fill.style.strokeDasharray = "";
        fill.style.strokeDashoffset = "";
      });
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "sws-root sws-embedded" : "sws-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sws-content">
        <section className="sws-section sws-intro">
          <h1>{intro}</h1>
        </section>

        <section className="sws-section sws-spotlight">
          <div className="sws-spotlight-content sws-spotlight-content-in">
            <h2>{beforeTitle}</h2>
            <p>{beforeCopy}</p>
          </div>

          <div className="sws-spotlight-content sws-spotlight-content-out">
            <h2>{afterTitle}</h2>
            <p>{afterCopy}</p>
          </div>

          <div className="sws-strokes">
            <svg
              aria-hidden="true"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 1600 900"
            >
              <g fill="none" stroke="#fff280" strokeLinecap="round">
                {STROKES.map((path) => (
                  <path
                    className="sws-stroke"
                    d={path}
                    key={path}
                    strokeWidth="150"
                  />
                ))}
              </g>
            </svg>
          </div>

          <svg
            aria-hidden="true"
            className="sws-sparkles"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1600 900"
          >
            <g
              fill="#fff"
              stroke="#141414"
              strokeLinejoin="round"
              strokeWidth="4"
            >
              {SPARKLES.map((transform) => (
                <g key={transform} transform={transform}>
                  <path
                    className="sws-sparkle"
                    d="M 0 -55 C 8 -16 16 -8 55 0 C 16 8 8 16 0 55 C -8 16 -16 8 -55 0 C -16 -8 -8 -16 0 -55 Z"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
            </g>
          </svg>
        </section>

        <section className="sws-section sws-outro">
          <h1>{outro}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.sws-root, .sws-root * { box-sizing: border-box; }
.sws-root h1, .sws-root h2, .sws-root p { margin: 0; padding: 0; }
.sws-root {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: hidden;
  background: #ff668c;
  color: #141414;
  font-family: "Barlow Condensed", sans-serif;
}
.sws-root.sws-embedded { height: 100%; overflow-y: auto; }
.sws-root::-webkit-scrollbar { display: none; }
.sws-section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background: linear-gradient(90deg, #ff668c 0%, #fff280 100%);
  color: #141414;
}
.sws-intro, .sws-outro {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}
.sws-intro h1, .sws-outro h1 {
  max-width: 15ch;
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.8;
  text-transform: uppercase;
}
.sws-spotlight-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8vw;
  text-align: center;
}
.sws-spotlight-content h2 {
  max-width: 14ch;
  font-size: clamp(2.2rem, 5.5vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.9;
  text-transform: uppercase;
}
.sws-spotlight-content p {
  max-width: 25ch;
  margin-top: 1.5rem;
  font-family: "DM Sans", sans-serif;
  font-size: clamp(1.1rem, 1.8vw, 1.6rem);
  font-weight: 400;
  line-height: 1.25;
}
.sws-spotlight-content-out { opacity: 0; }
.sws-strokes {
  position: absolute;
  inset: -10%;
  width: 120%;
  height: 120%;
  pointer-events: none;
}
.sws-strokes svg, .sws-sparkles {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.sws-stroke { will-change: stroke-dashoffset; }
.sws-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.sws-sparkle { transform: scale(0); will-change: transform; }
@media (max-width: 1000px) {
  .sws-spotlight-content { padding: 0 6vw; }
}
`;
