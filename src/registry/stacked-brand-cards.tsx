"use client";

/**
 * Stacked Brand Cards - a services section where every card but the last pins
 * at the same line and stays there until the outro reaches it, so the deck
 * builds up in place instead of scrolling past. While a card is pinned its
 * inner panel is pulled upward by an amount that grows with how many cards are
 * still to come, which is what makes the pile compress from the bottom rather
 * than simply overlapping. The intro heading is pinned across the whole run on
 * a separate trigger, so it holds until the final card takes the line.
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

const ASSET_BASE = "https://ui.aryank.space/assets/stacked-brand-cards";

export interface StackedBrandCard {
  title: string;
  copy: string;
  image: string;
  background: string;
  color?: string;
}

export interface StackedBrandCardsProps {
  heroImage?: string;
  introHeading?: string;
  outroHeading?: string;
  cards?: StackedBrandCard[];
  embedded?: boolean;
}

const DEFAULT_CARDS: StackedBrandCard[] = [
  {
    title: "Brand Foundation",
    copy: "The heart of your company's story. It shapes your vision, values, and voice, ensuring a clear and powerful impact in every interaction.",
    image: `${ASSET_BASE}/card-1.jpeg`,
    background: "#c3abff",
  },
  {
    title: "Design Identity",
    copy: "Your brand's visual fingerprint. It crafts a distinctive look that sparks recognition and builds emotional connections with your audience.",
    image: `${ASSET_BASE}/card-2.jpeg`,
    background: "#ffffff",
  },
  {
    title: "Digital Presence",
    copy: "Our web solutions combine cutting-edge design and seamless functionality to create experiences that captivate and inspire your audience.",
    image: `${ASSET_BASE}/card-3.jpeg`,
    background: "#fed35b",
  },
  {
    title: "Product Design",
    copy: "We craft user-first products that are both functional and visually appealing, delivering solutions that leave a lasting impression.",
    image: `${ASSET_BASE}/card-4.jpeg`,
    background: "#1e1e1e",
    color: "#fff",
  },
];

export default function StackedBrandCards({
  heroImage = `${ASSET_BASE}/hero.jpeg`,
  introHeading = "Creating standout brands for startups that bring joy and leave lasting impressions.",
  outroHeading = "Let's build a brand that leaves a mark.",
  cards = DEFAULT_CARDS,
  embedded = true,
}: StackedBrandCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sbc-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".sbc-card"),
      );
      if (cardEls.length === 0) return;

      triggers.push(
        ScrollTrigger.create({
          trigger: cardEls[0],
          scroller,
          start: "top 35%",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top 30%",
          pin: ".sbc-intro",
          pinSpacing: false,
        }),
      );

      cardEls.forEach((card, index) => {
        const isLastCard = index === cardEls.length - 1;
        const cardInner = card.querySelector<HTMLElement>(".sbc-card-inner");
        if (isLastCard || !cardInner) return;

        triggers.push(
          ScrollTrigger.create({
            trigger: card,
            scroller,
            start: "top 35%",
            endTrigger: ".sbc-outro",
            end: "top 65%",
            pin: true,
            pinSpacing: false,
          }),
        );

        tweens.push(
          gsap.to(cardInner, {
            // The lift is measured against the scroller, not the window, so a
            // bounded preview compresses the deck by the same proportion.
            y: () =>
              -((cardEls.length - index) * 0.14) *
              (embedded ? root.clientHeight : window.innerHeight),
            ease: "none",
            scrollTrigger: {
              trigger: card,
              scroller,
              start: "top 35%",
              endTrigger: ".sbc-outro",
              end: "top 65%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }),
        );
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
      for (const trigger of triggers) trigger.kill();
      ctx.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, cards]);

  return (
    <div
      className={embedded ? "sbc-root sbc-embedded" : "sbc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sbc-content">
        <section className="sbc-hero">
          <img alt="" draggable={false} src={heroImage} />
        </section>

        <section className="sbc-intro">
          <h1>{introHeading}</h1>
        </section>

        <section className="sbc-cards">
          {cards.map((card) => (
            <div className="sbc-card" key={card.title}>
              <div
                className="sbc-card-inner"
                style={{
                  backgroundColor: card.background,
                  color: card.color ?? "#000",
                }}
              >
                <div className="sbc-card-content">
                  <h1>{card.title}</h1>
                  <p>{card.copy}</p>
                </div>
                <div className="sbc-card-img">
                  <img alt={card.title} draggable={false} src={card.image} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="sbc-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

.sbc-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  color: #000;
  font-family: "Hanken Grotesk", sans-serif;
}

.sbc-root * {
  box-sizing: border-box;
}

.sbc-root.sbc-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.sbc-root.sbc-embedded::-webkit-scrollbar {
  display: none;
}

.sbc-content {
  position: relative;
  width: 100%;
}

.sbc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sbc-root h1 {
  margin: 0 0 2.5em 0;
  font-size: 4rem;
  font-weight: 600;
  line-height: 1;
}

.sbc-root p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.sbc-hero,
.sbc-intro,
.sbc-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2em;
}

.sbc-hero {
  padding: 0;
}

.sbc-intro,
.sbc-outro {
  background-color: #fff;
  display: flex;
  align-items: center;
}

.sbc-intro h1,
.sbc-outro h1 {
  margin-bottom: 0;
}

.sbc-card {
  position: relative;
}

.sbc-card-inner {
  position: relative;
  will-change: transform;
  width: 100%;
  height: 100%;
  padding: 2em;
  display: flex;
  gap: 4em;
}

.sbc-card-content {
  flex: 3;
}

.sbc-card-img {
  flex: 1;
  aspect-ratio: 16 / 9;
  border-radius: 0.75em;
  overflow: hidden;
}

@media (max-width: 900px) {
  .sbc-root h1 {
    margin-bottom: 4rem;
  }

  .sbc-root p {
    font-size: 1rem;
  }

  .sbc-card-inner {
    flex-direction: column;
  }

  .sbc-card-img {
    display: none;
  }
}
`;
