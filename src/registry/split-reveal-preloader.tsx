"use client";

/**
 * Split Reveal Preloader - a one-shot intro where a studio name and a numeral
 * settle, the first letter drifts up to become a compact logo mark, floating
 * tags fade through, then the whole screen splits along its middle: the top half
 * lifts, the bottom drops, and a thin seam widens into the hero with a centered
 * card whose title rolls up. GSAP timeline with SplitText and CustomEase.
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

const ASSET_BASE = "https://ui.aryank.space/assets/split-reveal-preloader";

export interface SplitRevealPreloaderProps {
  studio?: string;
  numeral?: string;
  logo?: string;
  cardWord?: string;
  tags?: [string, string, string];
  heroImage?: string;
  menuLabel?: string;
  footerLeft?: string;
  footerRight?: string;
  className?: string;
}

export default function SplitRevealPreloader({
  studio = "Nullspace Studio",
  numeral = "10",
  logo = "N10",
  cardWord = "Nullspace",
  tags = ["Negative Space", "Form & Void", "Light Studies"],
  heroImage = `${ASSET_BASE}/hero-img.jpg`,
  menuLabel = "Menu",
  footerLeft = "Scroll Down",
  footerRight = "Made by BLANK",
  className,
}: SplitRevealPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("srp-hop", "0.8, 0, 0.3, 1");

    const ctx = gsap.context(() => {
      const splitTextElements = (
        selector: string,
        type = "words,chars",
        addFirstChar = false,
      ) => {
        for (const element of root.querySelectorAll<HTMLElement>(selector)) {
          const split = new SplitText(element, {
            type,
            wordsClass: "srp-word",
            charsClass: "srp-char",
          });
          if (type.includes("chars")) {
            split.chars.forEach((char, index) => {
              char.innerHTML = `<span>${char.textContent}</span>`;
              if (addFirstChar && index === 0)
                char.classList.add("srp-first-char");
            });
          }
        }
      };

      splitTextElements(".srp-intro-title h1", "words, chars", true);
      splitTextElements(".srp-outro-title h1");
      splitTextElements(".srp-tag p", "words");
      splitTextElements(".srp-card h1", "words, chars", true);

      const isMobile = root.clientWidth <= 1000;

      gsap.set(
        [
          ".srp-split-overlay .srp-intro-title .srp-first-char span",
          ".srp-split-overlay .srp-outro-title .srp-char span",
        ],
        { y: "0%" },
      );
      gsap.set(".srp-split-overlay .srp-intro-title .srp-first-char", {
        x: isMobile ? "7.5rem" : "18rem",
        y: isMobile ? "-1rem" : "-2.75rem",
        fontWeight: "900",
        scale: 0.75,
      });
      gsap.set(".srp-split-overlay .srp-outro-title .srp-char", {
        x: isMobile ? "-3rem" : "-8rem",
        fontSize: isMobile ? "6rem" : "14rem",
        fontWeight: "500",
      });

      const tl = gsap.timeline({ defaults: { ease: "srp-hop" } });
      const tagEls = gsap.utils.toArray<HTMLElement>(".srp-tag");

      tagEls.forEach((tag, index) => {
        tl.to(
          tag.querySelectorAll(".srp-word"),
          { y: "0%", duration: 0.75 },
          0.5 + index * 0.1,
        );
      });

      tl.to(
        ".srp-preloader .srp-intro-title .srp-char span",
        { y: "0%", duration: 0.75, stagger: 0.05 },
        0.5,
      )
        .to(
          ".srp-preloader .srp-intro-title .srp-char:not(.srp-first-char) span",
          { y: "100%", duration: 0.75, stagger: 0.05 },
          2,
        )
        .to(
          ".srp-preloader .srp-outro-title .srp-char span",
          { y: "0%", duration: 0.75, stagger: 0.075 },
          2.5,
        )
        .to(
          ".srp-preloader .srp-intro-title .srp-first-char",
          { x: isMobile ? "9rem" : "21.25rem", duration: 1 },
          3.5,
        )
        .to(
          ".srp-preloader .srp-outro-title .srp-char",
          { x: isMobile ? "-3rem" : "-8rem", duration: 1 },
          3.5,
        )
        .to(
          ".srp-preloader .srp-intro-title .srp-first-char",
          {
            x: isMobile ? "7.5rem" : "18rem",
            y: isMobile ? "-1rem" : "-2.75rem",
            fontWeight: "900",
            scale: 0.75,
            duration: 0.75,
          },
          4.5,
        )
        .to(
          ".srp-preloader .srp-outro-title .srp-char",
          {
            x: isMobile ? "-3rem" : "-8rem",
            fontSize: isMobile ? "6rem" : "14rem",
            fontWeight: "500",
            duration: 0.75,
            onComplete: () => {
              gsap.set(".srp-preloader", {
                clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
              });
              gsap.set(".srp-split-overlay", {
                clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
              });
            },
          },
          4.5,
        )
        .to(
          ".srp-container",
          {
            clipPath: "polygon(0% 48%, 100% 48%, 100% 52%, 0% 52%)",
            duration: 1,
          },
          5,
        );

      tagEls.forEach((tag, index) => {
        tl.to(
          tag.querySelectorAll(".srp-word"),
          { y: "100%", duration: 0.75 },
          5.5 + index * 0.1,
        );
      });

      tl.to(
        [".srp-preloader", ".srp-split-overlay"],
        { y: (i: number) => (i === 0 ? "-50%" : "50%"), duration: 1 },
        6,
      )
        .to(
          ".srp-container",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1,
          },
          6,
        )
        .to(
          ".srp-card",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.75,
          },
          6.25,
        )
        .to(
          ".srp-card h1 .srp-char span",
          { y: "0%", duration: 0.75, stagger: 0.05 },
          6.5,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      className={className ? `srp-root ${className}` : "srp-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <div className="srp-preloader">
        <div className="srp-intro-title">
          <h1>{studio}</h1>
        </div>
        <div className="srp-outro-title">
          <h1>{numeral}</h1>
        </div>
      </div>

      <div className="srp-split-overlay">
        <div className="srp-intro-title">
          <h1>{studio}</h1>
        </div>
        <div className="srp-outro-title">
          <h1>{numeral}</h1>
        </div>
      </div>

      <div className="srp-tags-overlay">
        {tags.map((tag, i) => (
          <div className={`srp-tag srp-tag-${i + 1}`} key={tag}>
            <p>{tag}</p>
          </div>
        ))}
      </div>

      <div className="srp-container">
        <nav>
          <p className="srp-logo">{logo}</p>
          <p>{menuLabel}</p>
        </nav>

        <div className="srp-hero-img">
          <img alt="" draggable={false} src={heroImage} />
        </div>

        <div className="srp-card">
          <h1>{cardWord}</h1>
        </div>

        <footer>
          <p>{footerLeft}</p>
          <p>{footerRight}</p>
        </footer>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.srp-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0a0a0a;
  font-family: "DM Sans", sans-serif;
}

.srp-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.srp-root h1 {
  margin: 0;
  text-transform: uppercase;
  font-size: 6rem;
  font-weight: 600;
  line-height: 1;
}

.srp-root p {
  margin: 0;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 500;
}

.srp-preloader,
.srp-split-overlay,
.srp-tags-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.srp-preloader,
.srp-split-overlay {
  background-color: #0a0a0a;
  color: #fff;
}

.srp-preloader,
.srp-tags-overlay {
  z-index: 2;
}

.srp-split-overlay {
  z-index: 1;
}

.srp-tags-overlay {
  pointer-events: none;
}

.srp-intro-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
}

.srp-outro-title {
  position: absolute;
  top: 50%;
  left: calc(50% + 10rem);
  transform: translate(-50%, -50%);
}

.srp-tag {
  position: absolute;
  width: max-content;
  color: #5a5a5a;
  overflow: hidden;
}

.srp-tag-1 {
  top: 15%;
  left: 15%;
}
.srp-tag-2 {
  bottom: 15%;
  left: 25%;
}
.srp-tag-3 {
  bottom: 30%;
  right: 15%;
}

.srp-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  clip-path: polygon(0 48%, 0 48%, 0 52%, 0 52%);
  z-index: 2;
}

.srp-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.srp-container nav,
.srp-container footer {
  position: relative;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  z-index: 2;
}

.srp-container nav .srp-logo {
  font-weight: 600;
  font-size: 20px;
}

.srp-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  clip-path: polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%);
}

.srp-card h1 {
  text-align: center;
  width: 100%;
  font-size: 3rem;
  color: #0a0a0a;
}

.srp-card .srp-char span {
  position: relative;
  display: inline-block;
  transform: translateY(100%);
  will-change: transform;
}

.srp-intro-title .srp-char,
.srp-outro-title .srp-char,
.srp-card .srp-char {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.srp-intro-title .srp-char,
.srp-outro-title .srp-char {
  margin-top: 0.75rem;
}

.srp-intro-title .srp-char span,
.srp-outro-title .srp-char span,
.srp-tag .srp-word {
  position: relative;
  display: inline-block;
  transform: translateY(-100%);
  will-change: transform;
}

.srp-intro-title .srp-first-char {
  transform-origin: top left;
}

@media (max-width: 1000px) {
  .srp-root h1 {
    font-size: 2.5rem;
  }
  .srp-outro-title {
    left: calc(50% + 4rem);
  }
  .srp-card {
    width: 75%;
  }
  .srp-card h1 {
    font-size: 2.5rem;
  }
  .srp-intro-title .srp-char,
  .srp-outro-title .srp-char {
    margin-top: 0.5rem;
  }
}
`;
