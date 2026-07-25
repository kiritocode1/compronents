"use client";

/**
 * Pushup Card Stack - a pinned frame where each card is pushed out of view by
 * the one behind it. The outgoing card shrinks to half and tilts ten degrees
 * while its own photograph counter-zooms to 1.5, so the picture appears to
 * hold still as its frame retreats. All three moves run at the same timeline
 * position, so a card leaves at exactly the rate the next one arrives and
 * there is never a gap between them.
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

const ASSET_BASE = "https://ui.aryank.space/assets/pushup-card-stack";

export interface PushupCard {
  tag: string;
  image: string;
}

export interface PushupCardStackProps {
  introHeading?: string;
  outroHeading?: string;
  cards?: PushupCard[];
  embedded?: boolean;
}

const DEFAULT_CARDS: PushupCard[] = [
  { tag: "Raw Emotion", image: `${ASSET_BASE}/img1.jpg` },
  { tag: "Inner Conflict", image: `${ASSET_BASE}/img2.jpg` },
  { tag: "Fury and Flow", image: `${ASSET_BASE}/img3.jpg` },
  { tag: "Rebellion", image: `${ASSET_BASE}/img4.jpg` },
  { tag: "Liberation", image: `${ASSET_BASE}/img5.jpg` },
];

export default function PushupCardStack({
  introHeading = "Art is not what you see. It is what you feel in the blur, the chaos, the motion, every pulse captured in color and form.",
  outroHeading = "This is not just motion. It is meaning in movement. In every blurred edge and amplified hue, we trace the shape of something deeper, truth in abstraction.",
  cards = DEFAULT_CARDS,
  embedded = true,
}: PushupCardStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".pcs-container");
    const stickyCards = root.querySelector<HTMLElement>(".pcs-sticky-cards");
    if (!content || !stickyCards) return;

    const cardEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".pcs-card"),
    );
    const imageEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".pcs-card img"),
    );
    const totalCards = cardEls.length;
    if (!totalCards) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    gsap.set(cardEls[0], { y: "0%", scale: 1, rotation: 0 });
    gsap.set(imageEls[0], { scale: 1 });

    for (let i = 1; i < totalCards; i++) {
      gsap.set(cardEls[i], { y: "100%", scale: 1, rotation: 0 });
      gsap.set(imageEls[i], { scale: 1 });
    }

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    const scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: stickyCards,
        scroller,
        start: "top top",
        end: `+=${viewportHeight * (totalCards - 1)}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    for (let i = 0; i < totalCards - 1; i++) {
      const position = i;

      scrollTimeline.to(
        cardEls[i],
        { scale: 0.5, rotation: 10, duration: 1, ease: "none" },
        position,
      );

      scrollTimeline.to(
        imageEls[i],
        { scale: 1.5, duration: 1, ease: "none" },
        position,
      );

      scrollTimeline.to(
        cardEls[i + 1],
        { y: "0%", duration: 1, ease: "none" },
        position,
      );
    }

    ScrollTrigger.refresh();

    return () => {
      scrollTimeline.scrollTrigger?.kill();
      scrollTimeline.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, cards]);

  return (
    <div
      className={embedded ? "pcs-root pcs-embedded" : "pcs-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="pcs-container">
        <section className="pcs-intro">
          <h1>{introHeading}</h1>
        </section>
        <section className="pcs-sticky-cards">
          <div className="pcs-cards-container">
            {cards.map((card) => (
              <div className="pcs-card" key={card.tag}>
                <div className="pcs-tag">
                  <p>{card.tag}</p>
                </div>
                <img src={card.image} alt="" />
              </div>
            ))}
          </div>
        </section>
        <section className="pcs-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");

.pcs-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
  background-color: #0f0f0f;
  container-type: inline-size;
}
.pcs-root.pcs-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.pcs-root.pcs-embedded::-webkit-scrollbar { display: none; }
.pcs-root * { margin: 0; padding: 0; box-sizing: border-box; }
.pcs-container { position: relative; width: 100%; }
.pcs-root img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pcs-root h1 {
  font-size: 5cqw;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  text-indent: 5em;
  color: #e3e3db;
  -webkit-font-smoothing: antialiased;
}
.pcs-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2em;
  background-color: #1f1f1f;
  overflow: hidden;
}
.pcs-intro,
.pcs-outro {
  display: flex;
  justify-content: center;
  align-items: center;
}
.pcs-sticky-cards {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f0f0f;
  color: #fff;
}
.pcs-cards-container {
  position: relative;
  width: 50%;
  height: 50%;
  border-radius: 0.5em;
  overflow: hidden;
}
.pcs-card {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 0.5em;
  overflow: hidden;
}
.pcs-tag {
  position: absolute;
  top: 1em;
  left: 1em;
  padding: 0.5em;
  border-radius: 0.25em;
  background: #000;
  z-index: 1;
}
.pcs-tag p {
  text-transform: uppercase;
  font-family: "IBM Plex Mono", monospace;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 1000px) {
  .pcs-root h1 { font-size: 7cqw; text-indent: 2em; }
  .pcs-cards-container { width: 95%; }
}
`;
