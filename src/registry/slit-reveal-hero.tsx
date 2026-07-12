"use client";

/**
 * Slit Reveal Hero - a pinned hero that peels itself apart in stages. The lead
 * image first narrows to a vertical slit as a dark veil closes over it, then the
 * whole panel rotates and shrinks to nothing while two columns of copy slide off
 * behind it under a red wash, and finally two outro images clip in from top and
 * bottom as the closing headline rises line by line. GSAP ScrollTrigger with
 * SplitText and Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/slit-reveal-hero";

export interface SlitColumn {
  title: string;
  body: string;
}

export interface SlitRevealHeroProps {
  heroImage?: string;
  heroHeading?: string;
  columns?: [SlitColumn, SlitColumn];
  outroImages?: [string, string];
  outroHeading?: string;
  aboutHeading?: string;
  embedded?: boolean;
}

export default function SlitRevealHero({
  heroImage = `${ASSET_BASE}/hero.jpg`,
  heroHeading = "Silhouettes against the burning dark",
  columns = [
    {
      title: "Motion",
      body: "Bodies drawn through engineered light and open dark. Every frame caught between the signal and the shadow that it quietly leaves behind.",
    },
    {
      title: "Silence",
      body: "Stillness measured in reflected color and slow heat. Where the moving crowd dissolves and only the burning outline holds against the night.",
    },
  ],
  outroImages = [
    `${ASSET_BASE}/hero-outro-img-1.jpg`,
    `${ASSET_BASE}/hero-outro-img-2.jpg`,
  ],
  outroHeading = "You become the shape that the light finally learns to find.",
  aboutHeading = "A studio built for image, motion, and the quiet glow that keeps burning after.",
  embedded = true,
}: SlitRevealHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".srh-content");
    const hero = root.querySelector<HTMLElement>(".srh-hero");
    const fgContent = root.querySelector<HTMLElement>(".srh-fg-content");
    const fgOverlayDark = root.querySelector<HTMLElement>(
      ".srh-fg-overlay-dark",
    );
    const fgOverlayAccent = root.querySelector<HTMLElement>(".srh-fg-overlay");
    const copies = root.querySelectorAll<HTMLElement>(".srh-bg-copy");
    const outroImgs = root.querySelectorAll<HTMLElement>(".srh-outro-img");
    const outroHeaderEl = root.querySelector<HTMLElement>(
      ".srh-outro-header h3",
    );
    if (
      !content ||
      !hero ||
      !fgContent ||
      !fgOverlayDark ||
      !fgOverlayAccent ||
      copies.length < 2 ||
      outroImgs.length < 2 ||
      !outroHeaderEl
    )
      return;

    const bgCopyLeft = copies[0];
    const bgCopyRight = copies[1];
    const outroImgTop = outroImgs[0];
    const outroImgBottom = outroImgs[1];

    const split = SplitText.create(outroHeaderEl, {
      type: "lines",
      mask: "lines",
      linesClass: "srh-line",
    });
    gsap.set(split.lines, { y: "100%" });
    let outroRevealed = false;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const clamp = gsap.utils.clamp;
    const lerp = gsap.utils.interpolate;

    const trigger = ScrollTrigger.create({
      trigger: hero,
      scroller,
      start: "top top",
      end: `+=${viewportHeight * 5}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        const phase1 = clamp(0, 1, p / 0.25);
        const left = lerp(0, 48, phase1);
        const right = lerp(100, 52, phase1);
        gsap.set(fgContent, {
          clipPath: `polygon(${left}% 0%, ${right}% 0%, ${right}% 100%, ${left}% 100%)`,
        });
        gsap.set(fgOverlayDark, { opacity: lerp(0, 1, phase1) });

        const phase2 = clamp(0, 1, (p - 0.25) / 0.2);
        gsap.set(fgContent, { rotate: lerp(0, 65, phase2) });

        const phase3 = clamp(0, 1, (p - 0.45) / 0.2);
        gsap.set(fgContent, { scale: lerp(1, 0, phase3) });
        gsap.set(bgCopyLeft, { x: `${lerp(0, 100, phase3)}%` });
        gsap.set(bgCopyRight, { x: `${lerp(0, -100, phase3)}%` });

        const phase3Overlay = clamp(0, 1, (p - 0.45) / 0.05);
        gsap.set(fgOverlayAccent, { opacity: lerp(0, 1, phase3Overlay) });

        const phase4 = clamp(0, 1, (p - 0.65) / 0.2);
        const topEdge = lerp(0, 100, phase4);
        gsap.set(outroImgTop, {
          clipPath: `polygon(0% 0%, 100% 0%, 100% ${topEdge}%, 0% ${topEdge}%)`,
        });
        const bottomEdge = lerp(100, 0, phase4);
        gsap.set(outroImgBottom, {
          clipPath: `polygon(0% ${bottomEdge}%, 100% ${bottomEdge}%, 100% 100%, 0% 100%)`,
        });

        if (p >= 0.9 && !outroRevealed) {
          outroRevealed = true;
          gsap.to(split.lines, {
            y: "0%",
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
          });
        } else if (p < 0.9 && outroRevealed) {
          outroRevealed = false;
          gsap.to(split.lines, {
            y: "100%",
            duration: 0.25,
            stagger: -0.05,
            ease: "power3.out",
          });
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      split.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "srh-root srh-embedded" : "srh-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="srh-content">
        <section className="srh-hero">
          <div className="srh-fg-content">
            <div className="srh-fg-img">
              <img alt="" draggable={false} src={heroImage} />
            </div>
            <div className="srh-fg-header">
              <h1>{heroHeading}</h1>
            </div>
            <div className="srh-fg-overlay-dark" />
            <div className="srh-fg-overlay" />
          </div>

          <div className="srh-bg-content">
            <div className="srh-bg-col">
              <div className="srh-bg-copy">
                <h3>{columns[0].title}</h3>
                <p>{columns[0].body}</p>
              </div>
            </div>
            <div className="srh-bg-col">
              <div className="srh-bg-copy">
                <h3>{columns[1].title}</h3>
                <p>{columns[1].body}</p>
              </div>
            </div>
          </div>

          <div className="srh-outro-content">
            <div className="srh-outro-img">
              <img alt="" draggable={false} src={outroImages[0]} />
            </div>
            <div className="srh-outro-img">
              <img alt="" draggable={false} src={outroImages[1]} />
            </div>
            <div className="srh-outro-header">
              <h3>{outroHeading}</h3>
            </div>
          </div>
        </section>

        <section className="srh-about">
          <h3>{aboutHeading}</h3>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,100..900&display=swap");

.srh-root {
  --base-100: #dcdbd5;
  --base-200: #e12c1a;
  --base-300: #1a0401;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--base-300);
  font-family: "DM Sans", sans-serif;
}

.srh-root.srh-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.srh-root.srh-embedded::-webkit-scrollbar {
  display: none;
}

.srh-content {
  position: relative;
  width: 100%;
}

.srh-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.srh-root h1,
.srh-root h3 {
  margin: 0;
  text-transform: uppercase;
  font-family: "Anton", sans-serif;
  font-weight: 400;
  line-height: 0.85;
  letter-spacing: -0.02em;
}

.srh-root h1 {
  font-size: clamp(2rem, 8vw, 14rem);
}
.srh-root h3 {
  font-size: clamp(1.75rem, 5vw, 8rem);
}

.srh-root p {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.1;
}

.srh-hero,
.srh-about {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.srh-about {
  background-color: var(--base-300);
  display: flex;
  justify-content: center;
  align-items: center;
}
.srh-about h3 {
  text-align: center;
  color: var(--base-100);
  width: 60%;
}

.srh-fg-content,
.srh-bg-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

.srh-fg-content {
  background-color: var(--base-300);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path, transform;
  z-index: 2;
}

.srh-fg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.srh-fg-header {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  padding: 2rem;
  color: var(--base-100);
  text-align: center;
}

.srh-fg-overlay-dark,
.srh-fg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  will-change: opacity;
}
.srh-fg-overlay-dark {
  background-color: var(--base-300);
}
.srh-fg-overlay {
  background-color: var(--base-200);
}

.srh-bg-content {
  display: flex;
  background-color: var(--base-100);
  z-index: 0;
}

.srh-bg-col {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 2rem;
}
.srh-bg-col:nth-child(2) {
  justify-content: flex-end;
}

.srh-bg-copy {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 50%;
  will-change: transform;
}
.srh-bg-copy h3 {
  color: var(--base-200);
}
.srh-bg-copy p {
  color: var(--base-300);
}

.srh-outro-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 1;
}

.srh-outro-img {
  flex: 1;
  height: 100%;
  will-change: clip-path;
}
.srh-outro-img:nth-child(1) {
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
}
.srh-outro-img:nth-child(2) {
  clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
}

.srh-outro-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--base-100);
  text-align: center;
  width: 60%;
}

@media (max-width: 1000px) {
  .srh-bg-copy {
    width: 100%;
  }
  .srh-bg-col:nth-child(1) .srh-bg-copy {
    margin-top: -50svh;
  }
  .srh-bg-col:nth-child(2) .srh-bg-copy {
    margin-top: 50svh;
  }
  .srh-about h3,
  .srh-outro-header {
    width: 100%;
    padding: 2rem;
  }
}
`;
