"use client";

/**
 * Scroll Text Blocks - three copy blocks whose words roll out and in as you
 * scroll, with a scroll-velocity-reactive image marquee and a progress bar.
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
import type * as React from "react";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/scroll-text-blocks";

export interface ScrollTextBlocksProps {
  blocks?: [string, string, string];
  images?: string[];
  navLeft?: string;
  navRight?: string;
  background?: string;
  textColor?: string;
  embedded?: boolean;
}

const DEFAULT_BLOCKS: [string, string, string] = [
  "I work in portrait photography with a focus on light, tone, and quiet expression. My approach is patient and intentional.",
  "I try to build images that feel honest, with enough breathing room for personality to settle into the frame.",
  "The final images aim to capture the shift between who they are and become the moment the shutter falls still.",
];

const DEFAULT_IMAGES = Array.from(
  { length: 10 },
  (_, index) => `${ASSET_BASE}/img_${index + 1}.jpg`,
);

export default function ScrollTextBlocks({
  blocks = DEFAULT_BLOCKS,
  images = DEFAULT_IMAGES,
  navLeft = "/ BLANK191125",
  navRight = "Experiment_507",
  background = "#0f0f0f",
  textColor = "#ffffff",
  embedded = true,
}: ScrollTextBlocksProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const container = root.querySelector<HTMLElement>(".stb-container");
    const marqueeTrack = root.querySelector<HTMLElement>(".stb-marquee-track");
    const indicator = root.querySelector<HTMLElement>(".stb-scroll-indicator");
    if (!container || !marqueeTrack || !indicator) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content: container })
      : new Lenis();
    let targetVelocity = 0;

    lenis.on("scroll", (e: { velocity: number }) => {
      targetVelocity = Math.abs(e.velocity) * 0.02;
      ScrollTrigger.update();
    });

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const textBlocks = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".stb-copy-block p"),
    );
    const splitInstances = textBlocks.map((block) =>
      SplitText.create(block, { type: "words", mask: "words" }),
    );

    gsap.set(splitInstances[1].words, { yPercent: 100 });
    gsap.set(splitInstances[2].words, { yPercent: 100 });

    const overlapCount = 3;

    const getWordProgress = (
      phaseProgress: number,
      wordIndex: number,
      totalWords: number,
    ) => {
      const totalLength = 1 + overlapCount / totalWords;
      const scale =
        1 /
        Math.min(
          totalLength,
          1 + (totalWords - 1) / totalWords + overlapCount / totalWords,
        );

      const startTime = (wordIndex / totalWords) * scale;
      const endTime = startTime + (overlapCount / totalWords) * scale;
      const duration = endTime - startTime;

      if (phaseProgress <= startTime) return 0;
      if (phaseProgress >= endTime) return 1;
      return (phaseProgress - startTime) / duration;
    };

    const animateBlock = (
      outBlock: SplitText,
      inBlock: SplitText,
      phaseProgress: number,
    ) => {
      outBlock.words.forEach((word, i) => {
        const progress = getWordProgress(
          phaseProgress,
          i,
          outBlock.words.length,
        );
        gsap.set(word, { yPercent: progress * 100 });
      });

      inBlock.words.forEach((word, i) => {
        const progress = getWordProgress(
          phaseProgress,
          i,
          inBlock.words.length,
        );
        gsap.set(word, { yPercent: 100 - progress * 100 });
      });
    };

    const items = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".stb-marquee-item"),
    );
    for (const item of items) {
      marqueeTrack.appendChild(item.cloneNode(true));
    }

    let marqueePosition = 0;
    let smoothVelocity = 0;

    const marqueeTicker = () => {
      smoothVelocity += (targetVelocity - smoothVelocity) * 0.5;

      const baseSpeed = 0.45;
      const speed = baseSpeed + smoothVelocity * 9;

      marqueePosition -= speed;

      const trackWidth = marqueeTrack.scrollWidth / 2;
      if (marqueePosition <= -trackWidth) {
        marqueePosition = 0;
      }

      gsap.set(marqueeTrack, { x: marqueePosition });

      targetVelocity *= 0.9;
    };
    gsap.ticker.add(marqueeTicker);

    const trigger = ScrollTrigger.create({
      trigger: container,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const scrollProgress = self.progress;

        gsap.set(indicator, { "--progress": scrollProgress });

        if (scrollProgress <= 0.5) {
          const phase1 = scrollProgress / 0.5;
          animateBlock(splitInstances[0], splitInstances[1], phase1);
        } else {
          const phase2 = (scrollProgress - 0.5) / 0.5;
          gsap.set(splitInstances[0].words, { yPercent: 100 });
          animateBlock(splitInstances[1], splitInstances[2], phase2);
        }
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(marqueeTicker);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      for (const split of splitInstances) split.revert();
      const clones = Array.from(marqueeTrack.children).slice(items.length);
      for (const clone of clones) clone.remove();
    };
  }, [embedded]);

  return (
    <div
      className="stb-root"
      ref={rootRef}
      style={
        {
          "--stb-bg": background,
          "--stb-text": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="stb-container">
        <section className="stb-hero">
          <nav className="stb-nav">
            <p>{navLeft}</p>
            <p>{navRight}</p>
          </nav>

          <div className="stb-about-copy">
            {blocks.map((copy) => (
              <div className="stb-copy-block" key={copy}>
                <p>{copy}</p>
              </div>
            ))}
          </div>

          <div className="stb-marquee">
            <div className="stb-marquee-track">
              {images.map((image) => (
                <div className="stb-marquee-item" key={image}>
                  <img alt="" draggable={false} src={image} />
                </div>
              ))}
            </div>
          </div>

          <div className="stb-scroll-indicator" />
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Manrope:wght@200..800&display=swap");

.stb-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  font-family: "Manrope", sans-serif;
  background-color: var(--stb-bg);
  color: var(--stb-text);
}

.stb-root::-webkit-scrollbar {
  display: none;
}

.stb-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stb-container {
  position: relative;
  width: 100%;
  height: 600vh;
}

.stb-hero {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.stb-nav {
  position: absolute;
  top: 1rem;
  left: 0;
  padding: 2rem;
  width: 45%;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.stb-nav p {
  text-transform: uppercase;
  font-family: "Geist Mono", monospace;
  font-size: 0.8rem;
  line-height: 1;
}

.stb-about-copy {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  padding: 2rem;
  display: flex;
  gap: 4rem;
}

.stb-copy-block {
  flex: 1;
}

.stb-copy-block p {
  font-size: 1.75rem;
  font-weight: 450;
  letter-spacing: -0.025rem;
  line-height: 1.25;
}

.stb-copy-block p .word {
  will-change: transform;
}

.stb-scroll-indicator {
  position: absolute;
  width: 10rem;
  height: 0.1rem;
  top: 3rem;
  right: 2rem;
  background-color: #2f2f2f;
}

.stb-scroll-indicator::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--stb-text);
  transform-origin: left;
  transform: scaleX(var(--progress, 0));
  will-change: transform;
}

.stb-marquee {
  position: absolute;
  left: 0;
  bottom: 2rem;
  width: 100%;
  height: 7.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.stb-marquee-track {
  display: flex;
  gap: 0.75rem;
  will-change: transform;
}

.stb-marquee-item {
  width: 10rem;
  height: 6rem;
  border-radius: 0.25rem;
  overflow: hidden;
  flex-shrink: 0;
}

@media (max-width: 1000px) {
  .stb-nav {
    flex-direction: column-reverse;
  }

  .stb-about-copy {
    top: 20rem;
    flex-direction: column;
  }

  .stb-copy-block p {
    font-size: 1.25rem;
  }
}
`;
