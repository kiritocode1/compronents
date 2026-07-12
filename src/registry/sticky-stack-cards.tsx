"use client";

/**
 * Sticky Stack Cards - full-height cards that pin in place and stack. As the
 * next card scrolls up over the current one, the underlying card scales down,
 * tilts a few degrees (alternating direction), and darkens under a shadow
 * overlay, so the deck compresses into a layered pile. GSAP ScrollTrigger.
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

const ASSET_BASE = "https://ui.aryank.space/assets/sticky-stack-cards";

export interface StickyStackCard {
  index: string;
  title: string;
  image: string;
  description: string;
}

export interface StickyStackCardsProps {
  intro?: string;
  outro?: string;
  cards?: StickyStackCard[];
  captionLabel?: string;
  embedded?: boolean;
}

const DEFAULT_CARDS: StickyStackCard[] = [
  {
    index: "01",
    title: "Modularity",
    image: `${ASSET_BASE}/card1.jpg`,
    description:
      "Every element is built to snap into place. We design modular systems where clarity, structure, and reuse come first, with no clutter and no excess.",
  },
  {
    index: "02",
    title: "Materials",
    image: `${ASSET_BASE}/card2.jpg`,
    description:
      "From soft gradients to hard edges, our design language draws from real world materials, elevating interfaces that feel both digital and tangible.",
  },
  {
    index: "03",
    title: "Precision",
    image: `${ASSET_BASE}/card3.jpg`,
    description:
      "Details matter. We work with intention, aligning pixels, calibrating contrast, and obsessing over every edge until it just feels right.",
  },
  {
    index: "04",
    title: "Character",
    image: `${ASSET_BASE}/card4.jpg`,
    description:
      "Interfaces should have personality. We embed small moments of play and irregularity to bring warmth, charm, and a human feel to the digital.",
  },
];

export default function StickyStackCards({
  intro = "The Foundations",
  outro = "Ends in Form",
  cards = DEFAULT_CARDS,
  captionLabel = "(About the state)",
  embedded = true,
}: StickyStackCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".ssc-content");

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    if (embedded && content) {
      lenis = new Lenis({ wrapper: root, content });
      lenis.on("scroll", ScrollTrigger.update);
      tickerFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    const scroller = embedded ? root : undefined;
    const ctx = gsap.context(() => {
      const stickyCards = gsap.utils.toArray<HTMLElement>(".ssc-card");

      stickyCards.forEach((card, index) => {
        if (index < stickyCards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            scroller,
            start: "top top",
            endTrigger: stickyCards[stickyCards.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: stickyCards[index + 1],
            scroller,
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.25;
              const rotation = (index % 2 === 0 ? 5 : -5) * progress;
              gsap.set(card, {
                scale,
                rotation,
                "--after-opacity": progress,
              });
            },
          });
        }
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "ssc-root ssc-embedded" : "ssc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="ssc-content">
        <section className="ssc-intro">
          <h1>{intro}</h1>
        </section>

        <div className="ssc-cards">
          {cards.map((card) => (
            <div className="ssc-card" key={card.index}>
              <div className="ssc-card-index">
                <h1>{card.index}</h1>
              </div>
              <div className="ssc-card-content">
                <div className="ssc-card-content-wrapper">
                  <h1 className="ssc-card-header">{card.title}</h1>
                  <div className="ssc-card-img">
                    <img alt="" src={card.image} />
                  </div>
                  <div className="ssc-card-copy">
                    <div className="ssc-card-copy-title">
                      <p>{captionLabel}</p>
                    </div>
                    <div className="ssc-card-copy-description">
                      <p>{card.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="ssc-outro">
          <h1>{outro}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.ssc-root {
  --ssc-bg: #1a1a1a;
  --ssc-fg: #edf1e8;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  font-family: "Manrope", sans-serif;
}

.ssc-root.ssc-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.ssc-root.ssc-embedded::-webkit-scrollbar {
  display: none;
}

.ssc-content {
  position: relative;
  width: 100%;
}

.ssc-intro,
.ssc-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  background-color: var(--ssc-bg);
  color: var(--ssc-fg);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.ssc-intro h1,
.ssc-outro h1 {
  font-size: 7rem;
  font-weight: 800;
  letter-spacing: -0.35rem;
  line-height: 1.1;
}

.ssc-cards {
  position: relative;
  width: 100%;
}

.ssc-card {
  position: relative;
  width: 100%;
  height: 100svh;
  background-color: var(--ssc-fg);
  color: var(--ssc-bg);
  padding: 1.5rem;
  display: flex;
  gap: 3rem;
  will-change: transform;
}

.ssc-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: var(--after-opacity, 0);
  transition: opacity 0.1s ease;
  pointer-events: none;
  z-index: 2;
}

.ssc-card-index {
  flex: 2;
}

.ssc-card-index h1 {
  font-size: 7rem;
  font-weight: 800;
  letter-spacing: -0.35rem;
  line-height: 1.1;
}

.ssc-card-content {
  flex: 4;
  padding-top: 1.5rem;
}

.ssc-card-content-wrapper {
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ssc-card-header {
  width: 75%;
  font-size: 7rem;
  font-weight: 800;
  letter-spacing: -0.35rem;
  line-height: 1.1;
}

.ssc-card-img {
  width: 100%;
}

.ssc-card-img img {
  aspect-ratio: 5/3;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ssc-card-copy {
  display: flex;
  gap: 1.5rem;
}

.ssc-card-copy-title {
  flex: 2;
}

.ssc-card-copy-description {
  flex: 4;
}

.ssc-card-copy-title p,
.ssc-card-copy-description p {
  font-size: 1.125rem;
  font-weight: 500;
}

.ssc-card-copy-title p {
  text-transform: uppercase;
  font-weight: 650;
}

@media (max-width: 1000px) {
  .ssc-intro h1,
  .ssc-outro h1 {
    font-size: 3rem;
    letter-spacing: -0.1rem;
  }
  .ssc-card {
    flex-direction: column;
    gap: 0;
  }
  .ssc-card-header {
    font-size: 3rem;
    letter-spacing: -0.1rem;
    width: 100%;
  }
  .ssc-card-index h1 {
    font-size: 3rem;
    letter-spacing: -0.1rem;
  }
  .ssc-card-content-wrapper {
    width: 100%;
  }
  .ssc-card-copy {
    flex-direction: column;
    gap: 0.5rem;
  }
  .ssc-card-index {
    flex: 1;
  }
}
`;
