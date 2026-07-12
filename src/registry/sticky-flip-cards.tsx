"use client";

/**
 * Sticky Flip Cards - a pinned hero where a single front card flips a half turn
 * to reveal a fanned stack of color-coded back cards, which then peel off and
 * dismiss one by one with a tilt as you keep scrolling. The headline lifts away
 * on entry and an outro statement closes it out. GSAP ScrollTrigger + Lenis.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface FlipCardItem {
  title: string;
  body: string;
  icon: "lock-open" | "layers" | "prism" | "infinite";
}

export interface StickyFlipCardsProps {
  heroHeading?: string;
  frontTitle?: string;
  frontLabel?: string;
  frontBody?: string;
  cards?: FlipCardItem[];
  outroHeading?: string;
  embedded?: boolean;
}

const DEFAULT_CARDS: FlipCardItem[] = [
  {
    title: "Final Hold",
    icon: "lock-open",
    body: "Everything settles into place, leaving a lasting frame that feels complete.",
  },
  {
    title: "Layered Time",
    icon: "layers",
    body: "Moments stack, overlap, and reveal themselves slowly as the scroll continues.",
  },
  {
    title: "Weight and Flow",
    icon: "prism",
    body: "Elements carry presence, easing in and out with balance, never rushed, never still.",
  },
  {
    title: "Soft Motion",
    icon: "infinite",
    body: "Subtle shifts and gentle transitions that build a quiet sense of rhythm as you move forward.",
  },
];

const ICONS: Record<string, ReactNode> = {
  "caret-down": (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M98 190.06l139.78 163.12a24 24 0 0036.44 0L414 190.06c13.34-15.57 2.28-39.62-18.22-39.62H116.18c-20.5 0-31.56 24.05-18.18 39.62z" />
    </svg>
  ),
  "lock-open": (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      aria-hidden="true"
    >
      <path
        d="M336 208V128a80 80 0 00-160 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="96" y="208" width="320" height="272" rx="48" ry="48" />
    </svg>
  ),
  layers: (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M448 341L256 240 64 341M448 168L256 269 64 168l192-101 192 101zM448 424L256 323 64 424" />
    </svg>
  ),
  prism: (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M448 384L256 32 64 384zM64 384l192 96 192-96" />
    </svg>
  ),
  infinite: (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="40"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M256 256s-48-96-126-96a94 94 0 000 188c78 0 126-92 252-92a94 94 0 010 188c-78 0-126-96-126-96" />
    </svg>
  ),
};

export default function StickyFlipCards({
  heroHeading = "Scroll down and watch everything fall into place",
  frontTitle = "First Frame",
  frontLabel = "Start here",
  frontBody = "A single moment, held in place before everything begins to move.",
  cards = DEFAULT_CARDS,
  outroHeading = "A quiet progression of motion and stillness, where each layer reveals itself with intention and nothing feels out of place.",
  embedded = true,
}: StickyFlipCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sfk-content");
    const hero = root.querySelector<HTMLElement>(".sfk-hero");
    const heroContent = root.querySelector<HTMLElement>(".sfk-hero-content");
    if (!content || !hero || !heroContent) return;

    const allCards = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".sfk-card"),
    );
    const frontCard = root.querySelector<HTMLElement>(".sfk-card-front");
    const backCards = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".sfk-card-back"),
    );
    if (!frontCard || !backCards.length) return;

    const count = backCards.length;
    const CARDS_ENTER_END = 100;
    const CARD_FLIP_TRIGGER = 200;
    const CARD_DISMISS_START = 300;
    const CARD_DISMISS_DURATION = 100;
    const TOTAL_SCROLL_SVH = CARD_DISMISS_START + count * CARD_DISMISS_DURATION;
    const svhToProgress = (svh: number) => svh / TOTAL_SCROLL_SVH;
    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const totalScroll = viewportHeight * (TOTAL_SCROLL_SVH / 100);

    const flipTilt = [-10, -20, -5, 10];
    const dismissTilt = [-50, -60, -45, 50];
    const dismissRanges = Array.from({ length: count }, (_, i) => {
      const order = count - 1 - i;
      return [
        svhToProgress(CARD_DISMISS_START + order * CARD_DISMISS_DURATION),
        svhToProgress(CARD_DISMISS_START + (order + 1) * CARD_DISMISS_DURATION),
      ];
    });

    gsap.set(frontCard, { rotationY: 0 });
    gsap.set(backCards, { rotationY: -180 });
    let isFlipped = false;

    const reveal = () => {
      gsap.to(frontCard, {
        rotationY: 180,
        duration: 1,
        ease: "elastic.out(1,0.5)",
      });
      backCards.forEach((card, i) => {
        gsap.to(card, {
          rotationY: 0,
          rotationZ: flipTilt[i],
          duration: 1,
          ease: "elastic.out(1,0.5)",
        });
      });
    };
    const conceal = () => {
      gsap.to(frontCard, {
        rotationY: 0,
        duration: 1,
        ease: "elastic.out(1,0.5)",
      });
      backCards.forEach((card) => {
        gsap.to(card, {
          rotationY: -180,
          rotationZ: 0,
          duration: 1,
          ease: "elastic.out(1,0.5)",
        });
      });
    };

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const st = ScrollTrigger.create({
      trigger: hero,
      scroller,
      start: "top top",
      end: `+=${totalScroll}px`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        const enter = gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(
            0,
            svhToProgress(CARDS_ENTER_END),
            0,
            1,
            progress,
          ),
        );
        gsap.set(allCards, {
          y: `${gsap.utils.mapRange(0, 1, 50, -50, enter)}%`,
        });
        gsap.set(heroContent, {
          y: `${gsap.utils.mapRange(0, 1, 0, -100, enter)}%`,
        });

        if (progress > svhToProgress(CARD_FLIP_TRIGGER) && !isFlipped) {
          reveal();
          isFlipped = true;
        } else if (progress <= svhToProgress(CARD_FLIP_TRIGGER) && isFlipped) {
          conceal();
          isFlipped = false;
        }

        backCards.forEach((card, i) => {
          const [start, end] = dismissRanges[i];
          const dp = gsap.utils.clamp(
            0,
            1,
            gsap.utils.mapRange(start, end, 0, 1, progress),
          );
          gsap.set(card, {
            y: `${gsap.utils.mapRange(0, 1, -50, -250, dp)}%`,
            rotation: gsap.utils.mapRange(
              0,
              1,
              flipTilt[i],
              dismissTilt[i],
              dp,
            ),
          });
        });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      st.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, cards]);

  return (
    <div
      className={embedded ? "sfk-root sfk-embedded" : "sfk-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sfk-content">
        <section className="sfk-hero">
          <div className="sfk-hero-content">
            <h1>{heroHeading}</h1>
          </div>
          <div className="sfk-cards">
            <div className="sfk-card sfk-card-front">
              <h3>{frontTitle}</h3>
              <span>{frontLabel}</span>
              <p>{frontBody}</p>
              <div className="sfk-icon">{ICONS["caret-down"]}</div>
            </div>
            {cards.map((card, i) => (
              <div
                className="sfk-card sfk-card-back"
                id={`sfk-card-${i + 1}`}
                key={card.title}
              >
                <h3>{card.title}</h3>
                <div className="sfk-icon">{ICONS[card.icon]}</div>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="sfk-about">
          <h3>{outroHeading}</h3>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;900&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.sfk-root {
  --base-100: #fff;
  --base-200: #fbfff2;
  --base-300: #e7ebdf;
  --base-400: #fd4400;
  --base-500: #e7ebdf;
  --base-600: #2668fd;
  --base-700: #fdcb40;
  --base-800: #0f0f0f;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
}
.sfk-root.sfk-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.sfk-root.sfk-embedded::-webkit-scrollbar { display: none; }
.sfk-content { position: relative; width: 100%; }
.sfk-root * { margin: 0; padding: 0; box-sizing: border-box; }
.sfk-root h1,
.sfk-root h3 {
  text-transform: uppercase;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  line-height: 0.85;
}
.sfk-root h1 { font-size: clamp(3rem, 5vw, 7rem); }
.sfk-root h3 { font-size: clamp(2rem, 3vw, 5rem); }
.sfk-root p { font-size: 1.125rem; font-weight: 450; line-height: 1.1; }
.sfk-root span {
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--base-100);
  color: var(--base-800);
}
.sfk-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.sfk-hero { background-color: var(--base-200); color: var(--base-800); }
.sfk-hero-content {
  position: absolute;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform;
}
.sfk-hero-content h1 { width: 60%; text-align: center; }
.sfk-cards {
  position: absolute;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
}
.sfk-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
  min-width: 300px;
  padding: 4rem 2rem;
  aspect-ratio: 4/5;
  background-color: var(--base-400);
  color: var(--base-100);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  will-change: transform;
}
.sfk-icon svg { width: 100%; height: 100%; }
.sfk-card-front .sfk-icon {
  width: 4rem;
  height: 4rem;
  padding: 0.9rem;
  border: 0.125rem solid var(--base-100);
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.sfk-card-front {
  transform: translate(-50%, 50%) rotateY(0deg);
  backface-visibility: hidden;
}
.sfk-card-back .sfk-icon {
  width: 5rem;
  height: 5rem;
  padding: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: var(--base-100);
  color: var(--base-400);
}
.sfk-card#sfk-card-1 { background-color: var(--base-400); color: var(--base-100); }
.sfk-card#sfk-card-2 { background-color: var(--base-500); color: var(--base-800); }
.sfk-card#sfk-card-3 { background-color: var(--base-600); color: var(--base-100); }
.sfk-card#sfk-card-4 { background-color: var(--base-700); color: var(--base-800); }
.sfk-card-back {
  transform: translate(-50%, 50%) rotateY(180deg);
  backface-visibility: hidden;
}
.sfk-about {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--base-300);
  color: var(--base-800);
}
.sfk-about h3 { width: 60%; text-align: center; }

@media (max-width: 1000px) {
  .sfk-hero-content h1,
  .sfk-about h3 { width: 85%; }
}
`;
