"use client";

/**
 * Deal Stack Cards Scroll - a pinned deck where each card rises from below,
 * lands on the pile at its own fixed tilt, then gets pushed off toward the top
 * left as the cards behind it arrive. Departure speed is scaled per card, so
 * the earliest card travels furthest and the stack fans out diagonally instead
 * of leaving as one block. Each card only starts moving once the previous one
 * has fully landed.
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

const ASSET_BASE = "https://ui.aryank.space/assets/deal-stack-cards-scroll";

export interface DealStackCard {
  image: string;
  label: string;
}

export interface DealStackCardsScrollProps {
  heroHeading?: string;
  outroHeading?: string;
  cards?: DealStackCard[];
  rotations?: number[];
  embedded?: boolean;
}

const DEFAULT_CARDS: DealStackCard[] = [
  { image: `${ASSET_BASE}/card-1.jpeg`, label: "X01-842" },
  { image: `${ASSET_BASE}/card-2.jpeg`, label: "V9-372K" },
  { image: `${ASSET_BASE}/card-3.jpeg`, label: "Z84-Q17" },
  { image: `${ASSET_BASE}/card-4.jpeg`, label: "L56-904" },
  { image: `${ASSET_BASE}/card-5.jpeg`, label: "A23-7P1" },
  { image: `${ASSET_BASE}/card-6.jpeg`, label: "T98-462" },
];

const DEFAULT_ROTATIONS = [-12, 10, -5, 5, -5, -2];

export default function DealStackCardsScroll({
  heroHeading = "Future threads for a fractured world.",
  outroHeading = "Tomorrow, tailored.",
  cards = DEFAULT_CARDS,
  rotations = DEFAULT_ROTATIONS,
  embedded = true,
}: DealStackCardsScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".ftl-content");
    const stickyCards = root.querySelector<HTMLElement>(".ftl-sticky-cards");
    if (!content || !stickyCards) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const cardEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".ftl-card"),
    );

    const frameHeight = () =>
      embedded ? root.clientHeight : window.innerHeight;
    const frameWidth = () => (embedded ? root.clientWidth : window.innerWidth);

    cardEls.forEach((card, index) => {
      gsap.set(card, {
        y: frameHeight(),
        rotate: rotations[index] ?? 0,
      });
    });

    const trigger = ScrollTrigger.create({
      trigger: stickyCards,
      scroller,
      start: "top top",
      end: `+=${frameHeight() * 8}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalCards = cardEls.length;
        const progressPerCard = 1 / totalCards;

        cardEls.forEach((card, index) => {
          const cardStart = index * progressPerCard;
          let cardProgress = (progress - cardStart) / progressPerCard;
          cardProgress = Math.min(Math.max(cardProgress, 0), 1);

          let yPos = frameHeight() * (1 - cardProgress);
          let xPos = 0;

          if (cardProgress === 1 && index < totalCards - 1) {
            const remainingProgress =
              (progress - (cardStart + progressPerCard)) /
              (1 - (cardStart + progressPerCard));
            if (remainingProgress > 0) {
              const distanceMultiplier = 1 - index * 0.15;
              xPos =
                -frameWidth() * 0.3 * distanceMultiplier * remainingProgress;
              yPos =
                -frameHeight() * 0.3 * distanceMultiplier * remainingProgress;
            }
          }

          gsap.to(card, { y: yPos, x: xPos, duration: 0, ease: "none" });
        });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, cards, rotations]);

  return (
    <div
      className={embedded ? "ftl-root ftl-embedded" : "ftl-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="ftl-content">
        <section className="ftl-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="ftl-sticky-cards">
          {cards.map((card) => (
            <div className="ftl-card" key={card.label}>
              <div className="ftl-card-img">
                <img src={card.image} alt="" />
              </div>
              <div className="ftl-card-content">
                <p>{card.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="ftl-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=DM+Mono:wght@400;500&display=swap");

.ftl-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #202020;
}
.ftl-root.ftl-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.ftl-root.ftl-embedded::-webkit-scrollbar { display: none; }
.ftl-root * { margin: 0; padding: 0; box-sizing: border-box; }
.ftl-content { position: relative; width: 100%; }
.ftl-root img { width: 100%; height: 100%; object-fit: cover; }
.ftl-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.ftl-hero,
.ftl-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1em;
  background-color: #202020;
  color: #fff;
}
.ftl-hero h1,
.ftl-outro h1 {
  font-size: 3rem;
  font-weight: 400;
  line-height: 1;
}
.ftl-sticky-cards { background-color: #e3e3e3; }
.ftl-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  will-change: transform;
  width: 25%;
  height: 50%;
  padding: 0.5em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  background-color: #202020;
  color: #fff;
}
.ftl-card-img { flex: 1 1 0; min-height: 0; width: 100%; }
.ftl-card-content { flex: 0 0 12px; display: flex; align-items: center; }
.ftl-card-content p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 12px;
}

@media (max-width: 900px) {
  .ftl-card { width: 75%; }
}
`;
