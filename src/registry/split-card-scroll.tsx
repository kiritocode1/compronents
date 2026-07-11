"use client";

/**
 * Split Card Scroll - three joined cards pinned on scroll: the strip narrows,
 * splits apart into rounded cards, then each card flips to its colored back.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type * as React from "react";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/split-card-scroll";

export interface SplitCard {
  image: string;
  label: string;
  text: string;
  backColor: string;
  backTextColor?: string;
}

export interface SplitCardScrollProps {
  cards?: [SplitCard, SplitCard, SplitCard];
  introText?: string;
  headerText?: string;
  outroText?: string;
  background?: string;
  textColor?: string;
  embedded?: boolean;
}

const DEFAULT_CARDS: [SplitCard, SplitCard, SplitCard] = [
  {
    image: `${ASSET_BASE}/card_cover_1.jpg`,
    label: "( 01 )",
    text: "Interactive Web Experiences",
    backColor: "#b2b2b2",
    backTextColor: "#0f0f0f",
  },
  {
    image: `${ASSET_BASE}/card_cover_2.jpg`,
    label: "( 02 )",
    text: "Thoughtful Design Language",
    backColor: "#ce2017",
  },
  {
    image: `${ASSET_BASE}/card_cover_3.jpg`,
    label: "( 03 )",
    text: "Visual Design Systems",
    backColor: "#2f2f2f",
  },
];

export default function SplitCardScroll({
  cards = DEFAULT_CARDS,
  introText = "Every idea begins as a single image",
  headerText = "Three pillars with one purpose",
  outroText = "Every transition leaves a trace",
  background = "#0f0f0f",
  textColor = "#ffffff",
  embedded = true,
}: SplitCardScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".scs-content");
    const sticky = root.querySelector<HTMLElement>(".scs-sticky");
    const cardContainer = root.querySelector<HTMLElement>(
      ".scs-card-container",
    );
    const stickyHeader = root.querySelector<HTMLElement>(
      ".scs-sticky-header h1",
    );
    if (!content || !sticky || !cardContainer || !stickyHeader) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const cardEls = Array.from(root.querySelectorAll<HTMLElement>(".scs-card"));
    const card1 = cardEls[0];
    const card2 = cardEls[1];
    const card3 = cardEls[2];

    let isGapAnimationCompleted = false;
    let isFlipAnimationCompleted = false;
    let mm: gsap.MatchMedia | null = null;

    function initAnimations() {
      mm?.revert();

      const mediaMatcher = gsap.matchMedia();
      mm = mediaMatcher;

      mediaMatcher.add("(max-width: 999px)", () => {
        for (const el of [...cardEls, cardContainer, stickyHeader]) {
          el?.removeAttribute("style");
        }
        return {};
      });

      mediaMatcher.add("(min-width: 1000px)", () => {
        const viewportHeight = embedded
          ? (root?.clientHeight ?? window.innerHeight)
          : window.innerHeight;

        ScrollTrigger.create({
          trigger: sticky,
          scroller: embedded ? root : undefined,
          start: "top top",
          end: `+=${viewportHeight * 4}px`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;

            if (progress >= 0.1 && progress <= 0.25) {
              const headerProgress = gsap.utils.mapRange(
                0.1,
                0.25,
                0,
                1,
                progress,
              );
              const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
              const opacityValue = gsap.utils.mapRange(
                0,
                1,
                0,
                1,
                headerProgress,
              );

              gsap.set(stickyHeader, {
                y: yValue,
                opacity: opacityValue,
              });
            } else if (progress < 0.1) {
              gsap.set(stickyHeader, {
                y: 40,
                opacity: 0,
              });
            } else if (progress > 0.25) {
              gsap.set(stickyHeader, {
                y: 0,
                opacity: 1,
              });
            }

            if (progress <= 0.25) {
              const widthPercentage = gsap.utils.mapRange(
                0,
                0.25,
                75,
                60,
                progress,
              );
              gsap.set(cardContainer, { width: `${widthPercentage}%` });
            } else {
              gsap.set(cardContainer, { width: "60%" });
            }

            if (progress >= 0.35 && !isGapAnimationCompleted) {
              gsap.to(cardContainer, {
                gap: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(cardEls, {
                borderRadius: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              isGapAnimationCompleted = true;
            } else if (progress < 0.35 && isGapAnimationCompleted) {
              gsap.to(cardContainer, {
                gap: "0px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(card1, {
                borderRadius: "20px 0 0 20px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(card2, {
                borderRadius: "0px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(card3, {
                borderRadius: "0 20px 20px 0",
                duration: 0.5,
                ease: "power3.out",
              });

              isGapAnimationCompleted = false;
            }

            if (progress >= 0.7 && !isFlipAnimationCompleted) {
              gsap.to(cardEls, {
                rotationY: 180,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: 0.1,
              });

              gsap.to([card1, card3], {
                y: 30,
                rotationZ: (i: number) => [-15, 15][i],
                duration: 0.75,
                ease: "power3.inOut",
              });

              isFlipAnimationCompleted = true;
            } else if (progress < 0.7 && isFlipAnimationCompleted) {
              gsap.to(cardEls, {
                rotationY: 0,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: -0.1,
              });

              gsap.to([card1, card3], {
                y: 0,
                rotationZ: 0,
                duration: 0.75,
                ease: "power3.inOut",
              });

              isFlipAnimationCompleted = false;
            }
          },
        });
        return () => {};
      });
    }

    initAnimations();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initAnimations();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      mm?.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className="scs-root"
      ref={rootRef}
      style={
        {
          "--scs-bg": background,
          "--scs-fg": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="scs-content">
        <section className="scs-intro">
          <h1>{introText}</h1>
        </section>

        <section className="scs-sticky">
          <div className="scs-sticky-header">
            <h1>{headerText}</h1>
          </div>

          <div className="scs-card-container">
            {cards.map((card, index) => (
              <div
                className="scs-card"
                id={`scs-card-${index + 1}`}
                key={card.text}
              >
                <div className="scs-card-front">
                  <img alt="" draggable={false} src={card.image} />
                </div>
                <div
                  className="scs-card-back"
                  style={{
                    backgroundColor: card.backColor,
                    color: card.backTextColor,
                  }}
                >
                  <span>{card.label}</span>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="scs-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap");

.scs-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  font-family: "Instrument Serif", sans-serif;
}

.scs-root::-webkit-scrollbar {
  display: none;
}

.scs-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scs-root h1 {
  font-size: 4rem;
  font-weight: 500;
  line-height: 1;
}

.scs-root p {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1;
}

.scs-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  background-color: var(--scs-bg);
  color: var(--scs-fg);
}

.scs-intro,
.scs-outro {
  text-align: center;
  align-content: center;
}

.scs-intro h1,
.scs-outro h1 {
  width: 30%;
  margin: 0 auto;
}

.scs-sticky {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scs-sticky-header {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.scs-sticky-header h1 {
  position: relative;
  text-align: center;
  will-change: transform, opacity;
  transform: translateY(40px);
  opacity: 0;
}

.scs-card-container {
  position: relative;
  width: 75%;
  display: flex;
  perspective: 1000px;
  transform: translateY(40px);
  will-change: width;
}

.scs-card {
  position: relative;
  flex: 1;
  aspect-ratio: 5/7;
  transform-style: preserve-3d;
  transform-origin: top;
}

#scs-card-1 {
  border-radius: 20px 0 0 20px;
}

#scs-card-3 {
  border-radius: 0 20px 20px 0;
}

.scs-card-front,
.scs-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: inherit;
  overflow: hidden;
}

.scs-card-back {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transform: rotateY(180deg);
  padding: 2rem;
}

.scs-card-back span {
  position: absolute;
  top: 2rem;
  left: 2rem;
  opacity: 0.4;
}

@media (max-width: 1000px) {
  .scs-root h1 {
    font-size: 3rem;
  }

  .scs-intro h1,
  .scs-outro h1 {
    width: 100%;
  }

  .scs-sticky {
    height: max-content;
    padding: 4rem 2rem;
    flex-direction: column;
  }

  .scs-sticky-header {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    margin-bottom: 4rem;
  }

  .scs-sticky-header h1 {
    opacity: 1;
  }

  .scs-card-container {
    width: 100%;
    flex-direction: column;
    gap: 2rem;
  }

  .scs-card {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    border-radius: 20px !important;
  }

  #scs-card-1,
  #scs-card-2,
  #scs-card-3,
  .scs-card-back {
    transform: none;
  }
}
`;
