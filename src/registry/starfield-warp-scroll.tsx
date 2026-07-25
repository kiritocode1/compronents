"use client";

/**
 * Starfield Warp Scroll - a pinned canvas starfield where scroll drives the
 * warp. Streaks fire out of a center hole, stretching and brightening as they
 * travel, while three headlines hand off word by word: the first fades out as
 * it swells, the next fades in as it settles back to full scale.
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

export interface StarfieldWarpScrollProps {
  introHeading?: string;
  headings?: [string, string, string];
  outroHeading?: string;
  starCount?: number;
  palette?: string[];
  paletteWeights?: number[];
  embedded?: boolean;
}

const DEFAULT_PALETTE = [
  "#7CF5FF",
  "#8CE0FF",
  "#9D7CFF",
  "#C77CFF",
  "#FF7CE8",
  "#FF6FB5",
];

const DEFAULT_WEIGHTS = [0.45, 0.2, 0.15, 0.125, 0.1, 0.078];

const SETTINGS = {
  holeRadius: 50,
  reachScale: 1.25,
  minStreakLength: 25,
  maxStreakLength: 350,
  minStreakWidth: 2.5,
  maxStreakWidth: 3.5,
  layers: 4,
  glowRadius: 300,
  glowSoftness: 3,
  acceleration: 1.5,
  tailFade: 0.25,
  restingFill: 0.25,
};

interface Star {
  dirX: number;
  dirY: number;
  offset: number;
  length: number;
  width: number;
  color: [number, number, number];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function StarfieldWarpScroll({
  introHeading = "Buckle Up",
  headings = [
    "The whole galaxy opens up",
    "Leaving the known world behind",
    "And then everything goes still",
  ],
  outroHeading = "We're Home",
  starCount = 1000,
  palette = DEFAULT_PALETTE,
  paletteWeights = DEFAULT_WEIGHTS,
  embedded = true,
}: StarfieldWarpScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".sfd-content");
    const section = root.querySelector<HTMLElement>(".sfd-starfield");
    const canvas = root.querySelector<HTMLCanvasElement>(".sfd-canvas");
    const ctx = canvas?.getContext("2d");
    if (!content || !section || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let maxDistance = 0;
    let scrollProgress = 0;
    let stars: Star[] = [];

    const pickWeightedColor = (): [number, number, number] => {
      let roll = Math.random();
      for (let i = 0; i < palette.length; i++) {
        roll -= paletteWeights[i] ?? 0;
        if (roll <= 0) return hexToRgb(palette[i]);
      }
      return hexToRgb(palette[0]);
    };

    const createStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        stars.push({
          dirX: Math.cos(angle),
          dirY: Math.sin(angle),
          offset: Math.random(),
          length: random(SETTINGS.minStreakLength, SETTINGS.maxStreakLength),
          width: random(SETTINGS.minStreakWidth, SETTINGS.maxStreakWidth),
          color: pickWeightedColor(),
        });
      }
    };

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      centerX = width / 2;
      centerY = height / 2;
      maxDistance = Math.hypot(width / 2, height / 2) * SETTINGS.reachScale;
    };

    const drawStarfield = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      const filled =
        SETTINGS.restingFill + scrollProgress * (1 - SETTINGS.restingFill);
      const speed = filled ** (1 / SETTINGS.acceleration);

      for (const star of stars) {
        const travel = Math.max(0, speed * SETTINGS.layers - star.offset) % 1;

        const headDistance =
          SETTINGS.holeRadius + travel * (maxDistance - SETTINGS.holeRadius);

        const streakLength = star.length * (0.2 + travel * 0.8);
        const tailDistance = Math.max(
          SETTINGS.holeRadius,
          headDistance - streakLength,
        );

        const tailX = centerX + star.dirX * tailDistance;
        const tailY = centerY + star.dirY * tailDistance;
        const headX = centerX + star.dirX * headDistance;
        const headY = centerY + star.dirY * headDistance;

        let opacity = 1;
        if (headDistance < SETTINGS.glowRadius) {
          const t =
            (headDistance - SETTINGS.holeRadius) /
            (SETTINGS.glowRadius - SETTINGS.holeRadius);
          opacity = Math.max(0, t) ** SETTINGS.glowSoftness;
        }
        if (opacity <= 0.01) continue;

        const [r, g, b] = star.color;
        const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(
          SETTINGS.tailFade,
          `rgba(${r},${g},${b},${opacity})`,
        );
        gradient.addColorStop(1, `rgba(${r},${g},${b},${opacity})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.width * (0.5 + travel * 0.9);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();
      }
    };

    createStars();
    resizeCanvas();
    drawStarfield();

    const onResize = () => {
      resizeCanvas();
      drawStarfield();
    };
    window.addEventListener("resize", onResize);

    const headers = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".sfd-headers h1"),
    );

    const splits = headers.map((header) =>
      SplitText.create(header, { type: "words", wordsClass: "sfd-word" }),
    );
    const headerWords = splits.map((split) => split.words as HTMLElement[]);

    headerWords.forEach((words, index) => {
      gsap.set(words, { opacity: index === 0 ? 1 : 0 });
    });
    gsap.set([headers[1], headers[2]], { scale: 0.85 });

    const wordCount = headerWords.map((words) => words.length);
    const totalWordSteps = wordCount[0] + wordCount[1] * 2 + wordCount[2];
    const perWord = 1 / totalWordSteps;

    const readingPause = perWord * 4;
    const edgeHold = totalWordSteps * perWord * 0.075;

    const timeline = gsap.timeline({ defaults: { ease: "none" } });

    const fadeHeaderIn = (header: HTMLElement, words: HTMLElement[]) => {
      const span = words.length * perWord;
      timeline.to(
        words,
        { opacity: 1, stagger: { each: perWord }, duration: perWord },
        ">",
      );
      timeline.to(header, { scale: 1, duration: span }, "<");
    };

    const fadeHeaderOut = (header: HTMLElement, words: HTMLElement[]) => {
      const span = words.length * perWord;
      timeline.to(header, { scale: 1.12, duration: readingPause + span }, ">");
      timeline.to(
        words,
        { opacity: 0, stagger: { each: perWord }, duration: perWord },
        `<+${readingPause}`,
      );
    };

    timeline.to({}, { duration: edgeHold });
    fadeHeaderOut(headers[0], headerWords[0]);
    fadeHeaderIn(headers[1], headerWords[1]);
    fadeHeaderOut(headers[1], headerWords[1]);
    fadeHeaderIn(headers[2], headerWords[2]);
    timeline.to({}, { duration: edgeHold });

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    const st = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: "top top",
      end: `+=${viewportHeight * 5}px`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      animation: timeline,
      onUpdate: (self) => {
        scrollProgress = self.progress;
        drawStarfield();
      },
    });

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
      timeline.kill();
      for (const split of splits) split.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, starCount, palette, paletteWeights, headings]);

  return (
    <div
      className={embedded ? "sfd-root sfd-embedded" : "sfd-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sfd-content">
        <section className="sfd-intro">
          <h1>{introHeading}</h1>
        </section>

        <section className="sfd-starfield">
          <canvas className="sfd-canvas" />

          <div className="sfd-headers">
            {headings.map((heading) => (
              <h1 key={heading}>{heading}</h1>
            ))}
          </div>
        </section>

        <section className="sfd-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.sfd-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
  color: #fff;
  background-color: #0f0f0f;
}
.sfd-root.sfd-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.sfd-root.sfd-embedded::-webkit-scrollbar { display: none; }
.sfd-root * { margin: 0; padding: 0; box-sizing: border-box; }
.sfd-content { position: relative; width: 100%; }
.sfd-root h1 {
  text-transform: uppercase;
  font-size: clamp(2.5rem, 5vw, 10rem);
  font-weight: 500;
  line-height: 1;
}
.sfd-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f0f0f;
  overflow: hidden;
}
.sfd-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 2rem);
  height: calc(100% - 2rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
}
.sfd-headers {
  position: absolute;
  width: 100%;
  height: 100%;
}
.sfd-headers h1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  text-align: center;
}

@media (max-width: 1000px) {
  .sfd-headers h1 {
    width: 80%;
  }
}
`;
