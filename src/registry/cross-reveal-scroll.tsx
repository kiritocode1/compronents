"use client";

/**
 * Cross Reveal Scroll - a pinned scroll sequence that ends on a single moving
 * mark. Past the hero and a black editorial section, a small white cross is
 * pinned mid-frame; as you scroll it rotates a full turn, its two bars widen
 * from thin slits into solid quadrants, it drifts toward center, then scales up
 * more than tenfold to wipe the screen white and reveal the closing statement.
 * GSAP ScrollTrigger + Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/cross-reveal-scroll";

export interface CrossRevealScrollProps {
  brand?: string;
  headerRows?: [string, string];
  intro?: string;
  images?: [string, string, string, string];
  heroImage?: string;
  outro?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES: [string, string, string, string] = [
  `${ASSET_BASE}/img-1.jpg`,
  `${ASSET_BASE}/img-2.jpg`,
  `${ASSET_BASE}/img-3.jpg`,
  `${ASSET_BASE}/img-4.jpg`,
];

export default function CrossRevealScroll({
  brand = "Symphonia",
  headerRows = ["Motion", "Stills"],
  intro = "A studio built on tempo. We shape moving identities and still frames that hold their nerve, letting rhythm decide what the eye lands on first.",
  images = DEFAULT_IMAGES,
  heroImage = `${ASSET_BASE}/hero.jpg`,
  outro = "Every project resolves to a single mark: the moment the motion settles and the frame is finally still.",
  embedded = true,
}: CrossRevealScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".crs-content");
    const pinned = root.querySelector<HTMLElement>(".crs-pinned");
    const headerInfo = root.querySelector<HTMLElement>(".crs-header-info");
    const whitespace = root.querySelector<HTMLElement>(".crs-whitespace");
    const revealer = root.querySelector<HTMLElement>(".crs-revealer");
    const bars = root.querySelectorAll<HTMLElement>(".crs-bar");
    if (!content || !pinned || !headerInfo || !whitespace || !revealer) return;

    const scroller = embedded ? root : undefined;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: pinned,
        scroller,
        start: "top top",
        endTrigger: whitespace,
        end: "bottom top",
        pin: true,
        pinSpacing: false,
      }),
      ScrollTrigger.create({
        trigger: headerInfo,
        scroller,
        start: "top top",
        endTrigger: whitespace,
        end: "bottom top",
        pin: true,
        pinSpacing: false,
      }),
      ScrollTrigger.create({
        trigger: pinned,
        scroller,
        start: "top top",
        endTrigger: headerInfo,
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(revealer, { rotation: self.progress * 360 });
        },
      }),
      ScrollTrigger.create({
        trigger: pinned,
        scroller,
        start: "top top",
        endTrigger: headerInfo,
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          const clipPath = `polygon(${45 - 45 * p}% 0%, ${55 + 45 * p}% 0%, ${55 + 45 * p}% 100%, ${45 - 45 * p}% 100%)`;
          gsap.to(bars, { clipPath, ease: "none", duration: 0 });
        },
      }),
      ScrollTrigger.create({
        trigger: headerInfo,
        scroller,
        start: "top top",
        end: "bottom 50%",
        scrub: 1,
        onUpdate: (self) => {
          const left = 35 + (50 - 35) * self.progress;
          gsap.to(revealer, { left: `${left}%`, ease: "none", duration: 0 });
        },
      }),
      ScrollTrigger.create({
        trigger: whitespace,
        scroller,
        start: "top 50%",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const scale = 1 + 12 * self.progress;
          gsap.to(revealer, { scale, ease: "none", duration: 0 });
        },
      }),
    );

    ScrollTrigger.refresh();

    return () => {
      for (const t of triggers) t.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "crs-root crs-embedded" : "crs-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="crs-content">
        <section
          className="crs-hero"
          style={{ backgroundImage: `url("${heroImage}")` }}
        >
          <h1>{brand}</h1>
        </section>

        <section className="crs-info">
          <div className="crs-header-rows">
            <div className="crs-header-row">
              <h1>{headerRows[0]}</h1>
            </div>
            <div className="crs-header-row">
              <h1>{headerRows[1]}</h1>
            </div>
          </div>
        </section>

        <section className="crs-header-info">
          <p>{intro}</p>
          <div className="crs-header-images">
            {images.map((src, i) => (
              <div className="crs-img" key={src}>
                <img alt={`Frame ${i + 1}`} draggable={false} src={src} />
              </div>
            ))}
          </div>
        </section>

        <section className="crs-whitespace" />

        <section className="crs-pinned">
          <div className="crs-revealer">
            <div className="crs-bar crs-bar-1" />
            <div className="crs-bar crs-bar-2" />
          </div>
        </section>

        <section className="crs-website-content">
          <h1>{outro}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,100..900&display=swap");

.crs-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  font-family: "DM Sans", sans-serif;
}

.crs-root.crs-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.crs-root.crs-embedded::-webkit-scrollbar {
  display: none;
}

.crs-content {
  position: relative;
  width: 100%;
}

.crs-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crs-root h1 {
  margin: 0;
  text-transform: uppercase;
  font-size: clamp(3rem, 12vw, 200px);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
}

.crs-hero {
  width: 100%;
  height: 100svh;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.crs-hero h1 {
  font-family: "Instrument Serif", serif;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: #fff;
}

.crs-info {
  width: 100%;
  height: 150svh;
  background-color: #000;
  color: #fff;
}

.crs-header-row {
  width: 100%;
  height: clamp(100px, 22svh, 250px);
  padding: 0 2rem;
  display: flex;
  align-items: center;
}
.crs-header-row:nth-child(2) {
  justify-content: flex-end;
}

.crs-header-info {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #000;
  color: #fff;
}

.crs-header-info p {
  margin: 0;
  padding: 1rem;
  max-width: 60rem;
  font-family: "Instrument Serif", serif;
  font-size: clamp(1.5rem, 3.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
}

.crs-header-images {
  width: 100%;
  height: clamp(140px, 22svh, 250px);
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

.crs-img {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.crs-pinned {
  position: absolute;
  top: 100svh;
  width: 100%;
  height: 250svh;
  z-index: 2;
}

.crs-whitespace {
  position: relative;
  width: 100%;
  height: 300svh;
  background-color: #000;
  z-index: -1;
}

.crs-revealer {
  position: absolute;
  transform: translate(-50%, 0%);
  left: 35%;
  margin-top: 325px;
  width: 120px;
  height: 120px;
  will-change: transform;
}

.crs-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  clip-path: polygon(45% 0%, 55% 0%, 55% 100%, 45% 100%);
  will-change: clip-path;
}
.crs-bar-2 {
  transform: rotate(90deg);
}

.crs-website-content {
  position: relative;
  width: 100%;
  height: 150svh;
  background-color: #fff;
  color: #000;
  z-index: 10;
}

.crs-website-content h1 {
  padding: 2rem;
  font-size: clamp(2rem, 5vw, 72px);
  letter-spacing: 0;
  text-transform: none;
  line-height: 1.05;
}

@media (max-width: 900px) {
  .crs-revealer {
    left: 50% !important;
    width: 100px;
    height: 100px;
    margin-top: 400px;
  }
}
`;
