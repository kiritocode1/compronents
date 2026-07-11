"use client";

/**
 * Aperture Zoom Hero - a pinned hero that pushes a window frame toward the
 * camera on scroll: the frame and header scale up and translate in Z while a
 * tall sky image pans behind them, then a closing headline rises into place
 * as the zoom settles.
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

const ASSET_BASE = "https://ui.aryank.space/assets/aperture-zoom-hero";

export interface ApertureZoomHeroProps {
  skyImage?: string;
  windowImage?: string;
  copyText?: string;
  leftHeading?: string;
  leftText?: string;
  rightEyebrow?: string;
  rightHeading?: string;
  outroText?: string;
  embedded?: boolean;
}

export default function ApertureZoomHero({
  skyImage = `${ASSET_BASE}/sky.jpg`,
  windowImage = `${ASSET_BASE}/window.png`,
  copyText = "What unfolds here is not a scene, but a duration. A sustained moment where scale dissolves, edges soften, and perception lingers longer than expected. The frame holds steady while the world behind it shifts.",
  leftHeading = "An aperture into stillness",
  leftText = "A constructed moment, suspended between form and vastness. Light, surface, and scale are carefully arranged to suggest movement without urgency, presence without intrusion.",
  rightEyebrow = "Observation Mode",
  rightHeading = "Where distance becomes a presence",
  outroText = "End of view.",
  embedded = true,
}: ApertureZoomHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".azh-content");
    const hero = root.querySelector<HTMLElement>(".azh-hero");
    const windowContainer = root.querySelector<HTMLElement>(".azh-window");
    const skyContainer = root.querySelector<HTMLElement>(".azh-sky");
    const heroCopy = root.querySelector<HTMLElement>(".azh-copy");
    const heroHeader = root.querySelector<HTMLElement>(".azh-header");
    if (
      !content ||
      !hero ||
      !windowContainer ||
      !skyContainer ||
      !heroCopy ||
      !heroHeader
    )
      return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded
      ? (root.clientHeight ?? window.innerHeight)
      : window.innerHeight;
    const skyMoveDistance = skyContainer.offsetHeight - viewportHeight;

    gsap.set(heroCopy, { yPercent: 100 });

    const trigger = ScrollTrigger.create({
      trigger: hero,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: `+=${viewportHeight * 3}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        const windowScale = progress <= 0.5 ? 1 + (progress / 0.5) * 3 : 4;
        gsap.set(windowContainer, { scale: windowScale });
        gsap.set(heroHeader, { scale: windowScale, z: progress * 500 });

        gsap.set(skyContainer, { y: -progress * skyMoveDistance });

        let heroCopyY: number;
        if (progress <= 0.66) {
          heroCopyY = 100;
        } else if (progress >= 1) {
          heroCopyY = 0;
        } else {
          heroCopyY = 100 * (1 - (progress - 0.66) / 0.34);
        }
        gsap.set(heroCopy, { yPercent: heroCopyY });
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div className="azh-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="azh-content">
        <section className="azh-hero">
          <div className="azh-sky">
            <img alt="" draggable={false} src={skyImage} />
          </div>
          <div className="azh-copy">
            <h1>{copyText}</h1>
          </div>
          <div className="azh-window">
            <img alt="" draggable={false} src={windowImage} />
          </div>
          <div className="azh-header">
            <div className="azh-col">
              <h1>{leftHeading}</h1>
              <p>{leftText}</p>
            </div>
            <div className="azh-col">
              <p>{rightEyebrow}</p>
              <h1>{rightHeading}</h1>
            </div>
          </div>
        </section>

        <section className="azh-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap");

.azh-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #fff;
  color: #0f0f0f;
  font-family: "Instrument Serif", sans-serif;
}

.azh-root::-webkit-scrollbar {
  display: none;
}

.azh-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.azh-root h1 {
  font-size: clamp(5rem, 6vw, 7rem);
  font-weight: 500;
  line-height: 0.8;
}

.azh-root p {
  font-size: 1.35rem;
  line-height: 1;
}

.azh-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.azh-hero {
  perspective: 1000px;
  color: #fff;
}

.azh-outro {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.azh-sky,
.azh-copy,
.azh-window,
.azh-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
}

.azh-sky {
  height: 350svh;
}

.azh-copy {
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.azh-copy h1 {
  width: 85%;
}

.azh-window {
  height: 100svh;
}

.azh-header {
  height: 100svh;
  padding: 2rem;
  display: flex;
  transform-style: preserve-3d;
}

.azh-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.azh-col p {
  width: 50%;
}

.azh-col:nth-child(2) {
  align-items: flex-end;
  text-align: right;
}

@media (max-width: 1000px) {
  .azh-root h1 {
    font-size: 3rem;
  }

  .azh-root p {
    font-size: 1.125rem;
  }
}
`;
