"use client";

/**
 * Rotating Hand Scroll - a long pinned section built around a single clock-hand
 * pill. Scrolling sweeps it through five full turns; each turn swaps the
 * headline, and on the fourth a portrait fades into the hand as the body copy
 * slides in. Near the end the hand grows to full height, scales up more than
 * twentyfold to fill the frame with the portrait, then dissolves to reveal the
 * closing wordmark. GSAP ScrollTrigger + Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/rotating-hand-scroll";

export interface RotatingHeadline {
  lead: string;
  tail: string;
}

export interface RotatingHandScrollProps {
  portrait?: string;
  headlines?: RotatingHeadline[];
  copy?: [string, string];
  brand?: string;
  aboutText?: string;
  embedded?: boolean;
}

const DEFAULT_HEADLINES: RotatingHeadline[] = [
  { lead: "time to", tail: "be brave" },
  { lead: "time to", tail: "be playful" },
  { lead: "time to", tail: "design the future" },
  { lead: "time to", tail: "meet the studio" },
  { lead: "time to", tail: "see project one" },
];

export default function RotatingHandScroll({
  portrait = `${ASSET_BASE}/portrait.jpg`,
  headlines = DEFAULT_HEADLINES,
  copy = [
    "We build brand systems and moving identities for founders who would rather set the pace than follow it.",
    "Small, senior team. Direct conversation, sharp craft, and a finish that holds up long after the launch.",
  ],
  brand = "BLANK",
  aboutText = "Your next section goes here",
  embedded = true,
}: RotatingHandScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".rhs-content");
    const sticky = root.querySelector<HTMLElement>(".rhs-sticky");
    const handContainer = root.querySelector<HTMLElement>(
      ".rhs-hand-container",
    );
    const hand = root.querySelector<HTMLElement>(".rhs-hand");
    const handImage = hand?.querySelector<HTMLElement>("img") ?? null;
    const intro = root.querySelector<HTMLElement>(".rhs-intro");
    const h1El = root.querySelector<HTMLElement>(".rhs-intro h1");
    const leadEl = root.querySelector<HTMLElement>(".rhs-lead");
    const tailEl = root.querySelector<HTMLElement>(".rhs-tail");
    const introCopy = intro?.querySelectorAll<HTMLElement>("p");
    const websiteContent = root.querySelector<HTMLElement>(
      ".rhs-website-content",
    );
    if (
      !content ||
      !sticky ||
      !handContainer ||
      !hand ||
      !handImage ||
      !intro ||
      !h1El ||
      !leadEl ||
      !tailEl ||
      !introCopy ||
      !websiteContent
    )
      return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const pinnedHeight = viewportHeight * 8;

    let currentCycle = -1;
    let imageRevealed = false;

    const updateHeaderText = () => {
      const h = headlines[Math.min(currentCycle, headlines.length - 1)];
      if (!h) return;
      leadEl.textContent = h.lead;
      tailEl.textContent = ` ${h.tail}`;
    };

    const trigger = ScrollTrigger.create({
      trigger: sticky,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: `+=${pinnedHeight}`,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const progress = self.progress;

        const rotationProgress = Math.min((progress * 8) / 5, 1);
        const totalRotation = rotationProgress * 1800 - 90;
        const rotationInCycle = ((totalRotation + 90) % 360) - 90;
        gsap.set(handContainer, { rotationZ: rotationInCycle });

        const newCycle = Math.floor((totalRotation + 90) / 360);
        if (
          newCycle !== currentCycle &&
          newCycle >= 0 &&
          newCycle < headlines.length
        ) {
          currentCycle = newCycle;
          updateHeaderText();

          if (newCycle === 3 && !imageRevealed) {
            gsap.to(handImage, { opacity: 1, duration: 0.3 });
            gsap.to(introCopy, {
              x: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
            });
            imageRevealed = true;
          } else if (newCycle !== 3 && imageRevealed) {
            gsap.to(handImage, { opacity: 0, duration: 0.3 });
            gsap.to(introCopy, {
              x: 20,
              opacity: 0,
              duration: 0.5,
              stagger: 0.1,
            });
            imageRevealed = false;
          }
        }

        if (progress <= 6 / 8) {
          const animationProgress = Math.max(0, (progress - 5 / 8) / (1 / 8));
          const newHeight = gsap.utils.interpolate(
            52.75,
            100,
            animationProgress,
          );
          const newOpacity = gsap.utils.interpolate(1, 0, animationProgress);
          gsap.set(hand, { height: `${newHeight}%` });
          gsap.set(intro, { opacity: 1 });
          gsap.set(h1El, { opacity: newOpacity });
        } else {
          gsap.set(intro, { opacity: 0 });
        }

        if (progress <= 7 / 8) {
          const scaleProgress = Math.max(0, (progress - 6 / 8) / (1 / 8));
          const newScale = gsap.utils.interpolate(1, 20, scaleProgress);
          gsap.set(hand, { scale: newScale });
        }

        if (progress <= 7.5 / 8) {
          const opacityProgress = Math.max(0, (progress - 7 / 8) / (0.5 / 8));
          const newOpacity = gsap.utils.interpolate(1, 0, opacityProgress);
          gsap.set(hand, { opacity: newOpacity });
        }

        if (progress > 7.5 / 8) {
          const revealProgress = (progress - 7.5 / 8) / (0.5 / 8);
          gsap.set(websiteContent, {
            opacity: gsap.utils.interpolate(0, 1, revealProgress),
          });
        } else {
          gsap.set(websiteContent, { opacity: 0 });
        }
      },
    });

    updateHeaderText();
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, headlines]);

  return (
    <div
      className={embedded ? "rhs-root rhs-embedded" : "rhs-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="rhs-content">
        <section className="rhs-sticky">
          <div className="rhs-hand-container">
            <div className="rhs-hand">
              <img alt="" draggable={false} src={portrait} />
            </div>
          </div>

          <div className="rhs-intro">
            <h1>
              <span className="rhs-lead">{headlines[0]?.lead}</span>
              <span className="rhs-tail"> {headlines[0]?.tail}</span>
            </h1>
            <p>{copy[0]}</p>
            <p>{copy[1]}</p>
          </div>

          <div className="rhs-website-content">
            <h1>{brand}</h1>
          </div>
        </section>

        <section className="rhs-about">
          <p>{aboutText}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..900&display=swap");

.rhs-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #161616;
  color: #fff;
  font-family: "DM Sans", sans-serif;
}

.rhs-root.rhs-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.rhs-root.rhs-embedded::-webkit-scrollbar {
  display: none;
}

.rhs-content {
  position: relative;
  width: 100%;
}

.rhs-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.rhs-root h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.rhs-lead {
  color: #6e6e6e;
}

.rhs-root p {
  font-size: 16px;
  font-weight: 500;
  color: #555555;
  text-align: justify;
  line-height: 130%;
}

.rhs-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
}

.rhs-sticky {
  background-color: #161616;
}

.rhs-about {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}
.rhs-about p {
  color: #000;
}

.rhs-hand-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(800px, 90vmin);
  height: min(800px, 90vmin);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transform-origin: center center;
  transform-style: preserve-3d;
  will-change: transform;
  z-index: 2;
}

.rhs-hand {
  position: absolute;
  width: 5.5%;
  height: 52.75%;
  background-color: rgb(238, 238, 238);
  border-radius: 1000px;
  will-change: transform;
  overflow: hidden;
  opacity: 1;
}

.rhs-intro {
  position: absolute;
  top: calc(50% - 20px);
  left: 25%;
  width: 22.5%;
  z-index: 3;
}

.rhs-intro p {
  position: relative;
  margin-top: 0.75em;
  transform: translateX(20px);
  opacity: 0;
}

.rhs-website-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  opacity: 0;
  z-index: 4;
}

.rhs-website-content h1 {
  font-size: 10vw;
  letter-spacing: -0.03em;
}

@media (max-width: 900px) {
  .rhs-intro {
    width: 35%;
    left: 2em;
  }
  .rhs-root h1 {
    font-size: 18px;
  }
  .rhs-root p {
    font-size: 13px;
  }
}
`;
