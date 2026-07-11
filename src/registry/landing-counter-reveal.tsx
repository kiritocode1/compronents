"use client";

/**
 * Landing Counter Reveal - a one-shot intro: a giant 0 to 100 counter scales
 * up from the corner while a progress bar fills, then the counter digits slide
 * out and a clip-path opens the hero image from a center diamond to full
 * frame; finally the headline characters slide in and the nav and footer words
 * rise into place.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Plays once on mount; no scroll needed.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/landing-counter-reveal";

export interface LandingCounterRevealProps {
  heroImage?: string;
  logo?: string;
  navLinks?: string[];
  headline?: string;
  footerTags?: string[];
}

const DEFAULT_NAV = ["Index", "Collection", "Material", "Process", "Info"];
const DEFAULT_TAGS = ["Permanence", "Craftsmanship", "Expression"];

export default function LandingCounterReveal({
  heroImage = `${ASSET_BASE}/hero.jpg`,
  logo = "Canon",
  navLinks = DEFAULT_NAV,
  headline = "Canon",
  footerTags = DEFAULT_TAGS,
}: LandingCounterRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("lcr-hop", "0.9, 0, 0.1, 1");

    const q = <T extends Element = HTMLElement>(sel: string) =>
      root.querySelector<T>(sel);

    const counterProgress = q(".lcr-counter h1");
    const counterContainer = q(".lcr-counter");
    if (!counterProgress || !counterContainer) return;

    const splits: SplitText[] = [];
    const splitText = (
      selector: string,
      type: "chars" | "words",
      cls: string,
    ) => {
      const s = SplitText.create(root.querySelectorAll(selector), {
        type,
        [`${type}Class`]: cls,
        mask: type,
      });
      splits.push(s);
      return s;
    };

    splitText(".lcr-header h1", "chars", "lcr-char");
    splitText(".lcr-nav a", "words", "lcr-word");
    splitText(".lcr-footer p", "words", "lcr-word");

    const counter = { value: 0 };
    const tl = gsap.timeline();

    tl.to(counter, {
      value: 100,
      duration: 3,
      ease: "power3.out",
      onUpdate: () => {
        counterProgress.textContent = `${Math.floor(counter.value)}`;
      },
      onComplete: () => {
        const counterSplit = SplitText.create(counterProgress, {
          type: "chars",
          charsClass: "lcr-digit",
          mask: "chars",
        });
        splits.push(counterSplit);
        gsap.to(counterSplit.chars, {
          x: "-100%",
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.1,
          delay: 1,
          onComplete: () => {
            gsap.set(counterContainer, { display: "none" });
          },
        });
      },
    });

    tl.to(counterContainer, { scale: 1, duration: 3, ease: "power3.out" }, "<");
    tl.to(
      ".lcr-progress-bar",
      { scaleX: 1, duration: 3, ease: "power3.out" },
      "<",
    );

    tl.to(
      ".lcr-hero-bg",
      {
        clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
        duration: 1.5,
        ease: "lcr-hop",
      },
      4.5,
    );
    tl.to(
      ".lcr-hero-bg img",
      { scale: 1.5, duration: 1.5, ease: "lcr-hop" },
      "<",
    );

    tl.to(
      ".lcr-hero-bg",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 2,
        ease: "lcr-hop",
      },
      6,
    );
    tl.to(".lcr-hero-bg img", { scale: 1, duration: 2, ease: "lcr-hop" }, 6);
    tl.to(".lcr-progress", { scaleX: 1, duration: 2, ease: "lcr-hop" }, 6);

    tl.to(
      ".lcr-header h1 .lcr-char",
      { x: "0%", duration: 1, ease: "power4.out", stagger: 0.075 },
      7,
    );
    tl.to(
      ".lcr-nav a .lcr-word",
      { y: "0%", duration: 1, ease: "power4.out", stagger: 0.075 },
      7.5,
    );
    tl.to(
      ".lcr-footer p .lcr-word",
      { y: "0%", duration: 1, ease: "power4.out", stagger: 0.075 },
      7.5,
    );

    return () => {
      tl.kill();
      for (const s of splits) s.revert();
    };
  }, []);

  return (
    <div className="lcr-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="lcr-counter">
        <h1>0</h1>
      </div>

      <nav className="lcr-nav">
        <div className="lcr-nav-logo">
          <a href="#">{logo}</a>
        </div>
        <div className="lcr-nav-links">
          {navLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      <section className="lcr-hero">
        <div className="lcr-hero-bg">
          <img alt="" draggable={false} src={heroImage} />
        </div>

        <div className="lcr-header">
          <h1>{headline}</h1>
        </div>

        <div className="lcr-footer">
          {footerTags.map((tag) => (
            <p key={tag}>{tag}</p>
          ))}
        </div>

        <div className="lcr-progress-bar">
          <div className="lcr-progress" />
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.lcr-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #0f0f0f;
  color: #fff;
}

.lcr-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lcr-root h1 {
  font-family: "DM Sans", sans-serif;
  line-height: 1;
}

.lcr-root a,
.lcr-root p {
  text-decoration: none;
  color: #fff;
  font-family: "DM Sans", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1;
}

.lcr-counter {
  position: absolute;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%) scale(0.25);
  transform-origin: left bottom;
  will-change: transform;
  z-index: 2;
}

.lcr-counter h1 {
  font-size: clamp(2.5rem, 25vw, 25rem);
}

.lcr-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 1;
}

.lcr-nav-links {
  display: flex;
  gap: 2rem;
}

.lcr-hero {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
}

.lcr-hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  will-change: clip-path;
  z-index: 0;
}

.lcr-hero-bg img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(2);
  will-change: transform;
}

.lcr-header {
  position: absolute;
  bottom: 4rem;
  width: 100%;
  padding: 2rem;
}

.lcr-header h1 {
  font-size: clamp(5rem, 18.5vw, 20rem);
}

.lcr-footer {
  position: absolute;
  bottom: 2rem;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.lcr-progress-bar {
  position: absolute;
  left: 2rem;
  bottom: 6rem;
  width: calc(100% - 4rem);
  height: 1.5px;
  background-color: #3a3a3a;
  transform-origin: left;
  transform: scaleX(0);
  will-change: transform;
  overflow: hidden;
}

.lcr-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #fff;
  transform-origin: left;
  transform: scaleX(0);
  will-change: transform;
}

.lcr-word,
.lcr-char,
.lcr-digit {
  position: relative;
  will-change: transform;
}

.lcr-header h1 .lcr-char {
  transform: translateX(100%);
}

.lcr-nav a .lcr-word,
.lcr-footer p .lcr-word {
  transform: translateY(100%);
}

@media (max-width: 1000px) {
  .lcr-nav-links {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .lcr-header {
    bottom: unset;
    top: 50%;
    display: flex;
    justify-content: center;
    transform: translateY(-50%);
  }

  .lcr-header h1 {
    font-size: 4rem;
  }
}
`;
