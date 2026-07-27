"use client";

/**
 * Strip Merge Reveal - a landing intro that opens on a dark card. A counter
 * runs to a hundred in the corner while a three line status list steps up
 * through a one line window. Behind it five narrow portrait strips rise into
 * place, then the row closes its gap and the strips scale to full size. The
 * four outer strips wipe upward one after another, the centre strip doubles,
 * and the dark card lifts away to leave that image filling the frame with the
 * name rising in beneath it.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/strip-merge-reveal";

export interface StripMergeRevealProps {
  brand?: string;
  navItems?: string[];
  statusLines?: string[];
  images?: string[];
  /** Zero based index of the strip that stays and grows into the hero image. */
  heroIndex?: number;
  overlayColor?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 5 },
  (_, i) => `${ASSET_BASE}/img_${i + 1}.jpg`,
);

export default function StripMergeReveal({
  brand = "Elara Vandenberg",
  navItems = ["Runway", "Lookbook", "Campaigns", "Biography"],
  statusLines = ["Structure", "Designed Identity", "Welcome"],
  images = DEFAULT_IMAGES,
  heroIndex = 2,
  overlayColor = "#0f0f0f",
}: StripMergeRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("stm-hop", "0.85, 0, 0.15, 1");

    const counterProgress = root.querySelector<HTMLElement>(".stm-counter h1");
    const overlayText = root.querySelector<HTMLElement>(".stm-overlay-text");
    const heroImages = root.querySelector<HTMLElement>(".stm-hero-images");
    if (!counterProgress || !overlayText || !heroImages) return;

    const ctx = gsap.context(() => {
      const split = SplitText.create(".stm-hero-header h1", {
        type: "words",
        mask: "words",
        wordsClass: "stm-word",
      });

      const counter = { value: 0 };
      const counterTl = gsap.timeline({ delay: 0.5 });
      const overlayTextTl = gsap.timeline({ delay: 0.75 });
      const revealTl = gsap.timeline({ delay: 0.5 });

      counterTl.to(counter, {
        value: 100,
        duration: 5,
        ease: "power2.out",
        onUpdate: () => {
          counterProgress.textContent = String(Math.floor(counter.value));
        },
      });

      overlayTextTl
        .to(overlayText, { y: "0", duration: 0.75, ease: "stm-hop" })
        .to(overlayText, {
          y: "-2rem",
          duration: 0.75,
          ease: "stm-hop",
          delay: 0.75,
        })
        .to(overlayText, {
          y: "-4rem",
          duration: 0.75,
          ease: "stm-hop",
          delay: 0.75,
        })
        .to(overlayText, {
          y: "-6rem",
          duration: 0.75,
          ease: "stm-hop",
          delay: 1,
        });

      // The source animates `gap` in vw against the viewport. Here the row is
      // sized in container units, so the closed gap is resolved to px off the
      // component's own width before it reaches GSAP, which cannot interpolate
      // a cqw value.
      const closedGap = root.clientWidth * 0.0075;

      revealTl
        .to(".stm-img", {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 1,
          ease: "stm-hop",
        })
        .to(heroImages, {
          gap: closedGap,
          duration: 1,
          delay: 0.5,
          ease: "stm-hop",
        })
        .to(".stm-img", { scale: 1, duration: 1, ease: "stm-hop" }, "<")
        .to(".stm-img:not(.stm-hero-img)", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          stagger: 0.1,
          ease: "stm-hop",
        })
        .to(".stm-hero-img", { scale: 2, duration: 1, ease: "stm-hop" })
        .to(".stm-hero-overlay", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "stm-hop",
        })
        .to(
          ".stm-hero-header h1 .stm-word",
          { y: "0", duration: 0.75, stagger: 0.1, ease: "power3.out" },
          "-=0.5",
        );

      return () => {
        split.revert();
      };
    }, root);

    return () => ctx.revert();
  }, [images, heroIndex]);

  return (
    <div className="stm-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="stm-nav">
        <div className="stm-nav-logo">
          <a href="#brand">{brand}</a>
        </div>
        <div className="stm-nav-items">
          {navItems.map((item) => (
            <a href="#nav" key={item}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <section className="stm-hero">
        <div
          className="stm-hero-overlay"
          style={{ backgroundColor: overlayColor }}
        >
          <div className="stm-counter">
            <h1>0</h1>
          </div>

          <div className="stm-overlay-text-container">
            <div className="stm-overlay-text">
              {statusLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="stm-hero-images">
          {images.map((src, i) => (
            <div
              className={i === heroIndex ? "stm-img stm-hero-img" : "stm-img"}
              key={src}
            >
              <img alt="" draggable={false} src={src} />
            </div>
          ))}
        </div>

        <div className="stm-hero-header">
          <h1>{brand}</h1>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.stm-root {
  --stm-light: #fff;
  --stm-dark: #0f0f0f;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background-color: var(--stm-light);
  color: #000;
  font-family: "DM Sans", sans-serif;
}

.stm-root * {
  box-sizing: border-box;
}

.stm-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stm-root a,
.stm-root p {
  margin: 0;
  text-decoration: none;
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.25;
  color: #000;
}

.stm-root h1 {
  margin: 0;
}

.stm-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}

.stm-nav-items {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stm-hero {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stm-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  z-index: 3;
}

.stm-hero-overlay .stm-counter {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  color: var(--stm-light);
}

.stm-hero-overlay .stm-counter h1 {
  font-size: 4rem;
  font-weight: 500;
}

.stm-overlay-text-container {
  position: absolute;
  top: 2rem;
  left: 2rem;
  height: 2rem;
  overflow: hidden;
}

.stm-overlay-text-container .stm-overlay-text {
  display: flex;
  flex-direction: column;
  transform: translateY(2rem);
  will-change: transform;
}

.stm-overlay-text-container .stm-overlay-text p {
  color: var(--stm-light);
  height: 2rem;
  display: flex;
  align-items: center;
}

.stm-hero-images {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  gap: 10cqw;
  will-change: gap;
  z-index: 4;
}

.stm-hero-images .stm-img {
  width: 10cqw;
  aspect-ratio: 5/7;
  transform: translateY(50%) scale(0.5);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  opacity: 0;
  will-change: opacity, transform, clip-path;
}

/* The source parks the headline at z-index -1, behind the overlay. The root is
   a container query context, which is also a stacking context, so a negative
   index here would fall behind the root's own background. Same order, no
   negative value. */
.stm-hero-header {
  position: absolute;
  bottom: 2rem;
  width: 100%;
  z-index: 1;
}

.stm-hero-header h1 {
  text-transform: uppercase;
  text-align: center;
  font-size: 15cqw;
  font-weight: 500;
  line-height: 0.85;
}

.stm-hero-header h1 .stm-word {
  transform: translateY(100%);
  will-change: transform;
}

@media (max-width: 1000px) {
  .stm-nav {
    padding: 1rem;
  }

  .stm-hero-overlay .stm-counter {
    right: 1rem;
    bottom: 1rem;
  }

  .stm-hero-images {
    padding: 0 0.5rem;
    gap: 2.5cqw;
  }

  .stm-hero-images .stm-img {
    width: 20cqw;
  }
}
`;
