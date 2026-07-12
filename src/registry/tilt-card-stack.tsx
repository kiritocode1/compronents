"use client";

/**
 * Tilt Card Stack - full-screen colored cards that pin and fall back as the next
 * one climbs over them. Each card holds until the following card reaches the top
 * of the frame, then tilts away on its X axis, sinks in Z, and darkens under a
 * black veil, so the deck reads as pages laid down one behind another. GSAP
 * ScrollTrigger + Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/tilt-card-stack";

export interface TiltCard {
  info: string;
  title: string;
  description: string;
  image: string;
  accent: string;
}

export interface TiltCardStackProps {
  heroHeading?: string;
  outroHeading?: string;
  cards?: TiltCard[];
  embedded?: boolean;
}

const DEFAULT_CARDS: TiltCard[] = [
  {
    info: "A surreal dive into neon hues and playful decay",
    title: "Reverie",
    description:
      "A psychedelic skull study exploring the tension between playfulness and decay. Bold candy tones, liquid forms, and crisp vectors bring a surreal, pop-art mood meant for covers and prints.",
    image: `${ASSET_BASE}/img1.jpg`,
    accent: "#b1c0ef",
  },
  {
    info: "A retro-futurist scene where nostalgia meets glitch",
    title: "Vaporwave",
    description:
      "An 80s-UI dreamscape: stacked windows, checkerboard floors, and a sunset gradient. Built to feel like a loading screen to another world, nostalgic, glossy, and a bit uncanny.",
    image: `${ASSET_BASE}/img2.jpg`,
    accent: "#f2acac",
  },
  {
    info: "A kaleidoscope of folk motifs reimagined in digital form",
    title: "Kaleido",
    description:
      "Ornamental symmetry inspired by folk motifs and stained-glass glow. Designed as a seamless, tileable pattern for textiles, wallpapers, and rich UI backgrounds.",
    image: `${ASSET_BASE}/img3.jpg`,
    accent: "#fedd93",
  },
  {
    info: "A portrait framed by oddball creatures and doodles",
    title: "Menagerie",
    description:
      "A playful portrait surrounded by oddball companions: mascots, monsters, and midnight snacks. Loose linework meets pastel whimsy, perfect for merch, stickers, and editorial spots.",
    image: `${ASSET_BASE}/img4.jpg`,
    accent: "#81b7bf",
  },
];

export default function TiltCardStack({
  heroHeading = "Art That Lives Online",
  outroHeading = "Next Canvas Awaits",
  cards = DEFAULT_CARDS,
  embedded = true,
}: TiltCardStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".tcs-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const cardEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".tcs-card"),
    );
    const tweens: gsap.core.Tween[] = [];

    cardEls.forEach((card, index) => {
      if (index >= cardEls.length - 1) return;
      const cardInner = card.querySelector<HTMLElement>(".tcs-card-inner");
      if (!cardInner) return;

      tweens.push(
        gsap.fromTo(
          cardInner,
          { y: "0%", z: 0, rotationX: 0 },
          {
            y: "-50%",
            z: -250,
            rotationX: 45,
            scrollTrigger: {
              trigger: cardEls[index + 1],
              scroller,
              start: "top 85%",
              end: "top -75%",
              scrub: true,
              pin: card,
              pinSpacing: false,
            },
          },
        ),
        gsap.to(cardInner, {
          "--tcs-after-opacity": 1,
          scrollTrigger: {
            trigger: cardEls[index + 1],
            scroller,
            start: "top 75%",
            end: "top -25%",
            scrub: true,
          },
        }),
      );
    });

    ScrollTrigger.refresh();

    return () => {
      for (const t of tweens) t.scrollTrigger?.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, cards]);

  return (
    <div
      className={embedded ? "tcs-root tcs-embedded" : "tcs-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="tcs-content">
        <section className="tcs-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="tcs-sticky-cards">
          {cards.map((card, i) => (
            <div className="tcs-card" id={`tcs-card-${i + 1}`} key={card.title}>
              <div
                className="tcs-card-inner"
                style={{ backgroundColor: card.accent }}
              >
                <div className="tcs-card-info">
                  <p>{card.info}</p>
                </div>
                <div className="tcs-card-title">
                  <h1>{card.title}</h1>
                </div>
                <div className="tcs-card-description">
                  <p>{card.description}</p>
                </div>
                <div className="tcs-card-img">
                  <img alt={card.title} draggable={false} src={card.image} />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="tcs-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;900&family=Host+Grotesk:wght@300..800&display=swap");

.tcs-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Host Grotesk", sans-serif;
}

.tcs-root.tcs-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.tcs-root.tcs-embedded::-webkit-scrollbar {
  display: none;
}

.tcs-content {
  position: relative;
  width: 100%;
}

.tcs-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tcs-root h1 {
  margin: 0;
  text-transform: uppercase;
  font-family: "Barlow Condensed", sans-serif;
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  line-height: 1;
}

.tcs-root p {
  margin: 0;
  text-transform: uppercase;
  font-weight: 500;
}

.tcs-hero,
.tcs-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #f9f4eb;
  color: #141414;
}

.tcs-sticky-cards {
  position: relative;
  width: 100%;
  background-color: #0f0f0f;
}

.tcs-card {
  position: sticky;
  top: 0;
  width: 100%;
  height: 125svh;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.tcs-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transform-origin: 50% 100%;
  will-change: transform;
  text-align: center;
}

.tcs-card-info {
  width: 25%;
  padding: 4em;
  text-align: left;
}
.tcs-card-info p {
  font-size: 0.9rem;
}

.tcs-card-title h1 {
  font-size: clamp(4rem, 12vw, 10rem);
  padding: 2rem 0;
}

.tcs-card-description {
  width: 60%;
  margin: 0 auto 2em auto;
}
.tcs-card-description p {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
}

.tcs-card-img {
  width: 100%;
  height: 100%;
  margin-top: 4em;
  overflow: hidden;
}

.tcs-card-inner::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: var(--tcs-after-opacity, 0);
  will-change: opacity;
  pointer-events: none;
  z-index: 2;
}

@media (max-width: 1000px) {
  .tcs-card-info {
    width: 75%;
    margin: 0 auto;
    padding: 4em 2em;
    text-align: center;
  }
  .tcs-card-description {
    width: calc(100% - 4rem);
    margin: 0 auto;
  }
}
`;
