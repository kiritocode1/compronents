"use client";

/**
 * Odometer Load Hero - a percentage counter built as three independent reels
 * rather than a number that increments. Each digit column is a strip of numerals
 * translated by its own total height over its own duration, so the units reel
 * takes five seconds, the tens six, and the hundreds column only two starting at
 * second five: they finish together at 100 without any shared clock, and the
 * mismatched speeds are what make it read mechanically. The units column is
 * seeded with twenty one numerals so it can spin twice before landing. When it
 * ends, a bar fills to thirty percent, jumps to full while fading, then seven
 * photographs wipe open in sequence as the whole hero scales up.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/odometer-load-hero";

export interface OdometerLoadHeroProps {
  images?: string[];
  loadingLabel?: string;
  logo?: string;
  siteInfo?: string;
  menuLabel?: string;
  heading?: string;
  background?: string;
  foreground?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 7 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function OdometerLoadHero({
  images = DEFAULT_IMAGES,
  loadingLabel = "Loading",
  logo = "BLANK",
  siteInfo = "(Photographer, creative director, filmmaker)",
  menuLabel = "Menu",
  heading = "Howard",
  background = "#ebdc0b",
  foreground = "#000",
}: OdometerLoadHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const digit3 = root.querySelector<HTMLElement>(".olh-digit-3");
    if (!digit3) return;

    const ctx = gsap.context(() => {
      gsap.set(".olh-nav", { y: -150 });

      const digit1 = root.querySelector<HTMLElement>(".olh-digit-1");
      const digit2 = root.querySelector<HTMLElement>(".olh-digit-2");

      // The units reel needs two more full passes than it ships with, so it can
      // spin twice before landing on the final zero.
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 10; j++) {
          const div = document.createElement("div");
          div.className = "olh-num";
          div.textContent = String(j);
          digit3.appendChild(div);
        }
      }
      const finalDigit = document.createElement("div");
      finalDigit.className = "olh-num";
      finalDigit.textContent = "0";
      digit3.appendChild(finalDigit);

      function animate(digit: HTMLElement | null, duration: number, delay = 1) {
        if (!digit) return;
        const numHeight =
          digit.querySelector<HTMLElement>(".olh-num")?.clientHeight ?? 0;
        const totalDistance =
          (digit.querySelectorAll(".olh-num").length - 1) * numHeight;
        gsap.to(digit, {
          y: -totalDistance,
          duration,
          delay,
          ease: "power2.inOut",
        });
      }

      animate(digit3, 5);
      animate(digit2, 6);
      animate(digit1, 2, 5);

      gsap.to(".olh-progress-bar", {
        width: "30%",
        duration: 2,
        ease: "power4.inOut",
        delay: 7,
      });

      gsap.to(".olh-progress-bar", {
        width: "100%",
        opacity: 0,
        duration: 2,
        delay: 8.5,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(".olh-pre-loader", { display: "none" });
        },
      });

      gsap.to(".olh-hero-imgs > img", {
        clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)",
        duration: 1,
        ease: "power4.inOut",
        stagger: 0.25,
        delay: 9,
      });

      gsap.to(".olh-hero", {
        scale: 1.3,
        duration: 3,
        ease: "power3.inOut",
        delay: 9,
      });

      gsap.to(".olh-nav", {
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 11,
      });

      gsap.to(".olh-header h1 span", {
        top: "0px",
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        delay: 11,
      });
    }, root);

    return () => {
      ctx.revert();
      for (const extra of Array.from(digit3.children).slice(10)) {
        extra.remove();
      }
    };
  }, [images]);

  return (
    <div
      className="olh-root"
      ref={rootRef}
      style={{ background, color: foreground }}
    >
      <style>{styles}</style>

      <section className="olh-hero">
        <div className="olh-pre-loader">
          <p>{loadingLabel}</p>

          <div className="olh-counter">
            <div className="olh-digit-1">
              <div className="olh-num">0</div>
              <div className="olh-num olh-offset">1</div>
            </div>
            <div className="olh-digit-2">
              <div className="olh-num">0</div>
              <div className="olh-num olh-offset">1</div>
              {[2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
                <div className="olh-num" key={`d2-${String(i)}`}>
                  {n}
                </div>
              ))}
            </div>
            <div className="olh-digit-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div className="olh-num" key={`d3-${String(n)}`}>
                  {n}
                </div>
              ))}
            </div>
            <div className="olh-digit-4">%</div>
          </div>

          <div
            className="olh-progress-bar"
            style={{ background: foreground }}
          />
        </div>

        <div className="olh-hero-imgs">
          {images.map((src) => (
            <img alt="" draggable={false} key={src} src={src} />
          ))}
        </div>
      </section>

      <div className="olh-website-content">
        <nav className="olh-nav">
          <div className="olh-logo">
            <p>{logo}</p>
          </div>
          <div className="olh-site-info">
            <p>{siteInfo}</p>
          </div>
          <div className="olh-menu">
            <p>{menuLabel}</p>
          </div>
        </nav>

        <div className="olh-header">
          <h1>
            {heading.split("").map((char, i) => (
              <span key={`${char}-${String(i)}`}>{char}</span>
            ))}
          </h1>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&display=swap");

.olh-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  font-family: "Anton", sans-serif;
}

.olh-root * {
  box-sizing: border-box;
}

.olh-root img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%);
}

.olh-hero {
  width: 100%;
  height: 100%;
  padding: 3em;
}

.olh-pre-loader {
  width: 200%;
  height: 100%;
  padding: 2em;
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 0.5em;
  overflow: hidden;
  z-index: 2;
}

.olh-pre-loader p {
  margin: 0;
  width: max-content;
  text-transform: uppercase;
  font-size: 60px;
  line-height: 60px;
}

.olh-counter {
  height: 100px;
  display: flex;
  font-size: 100px;
  font-weight: 400;
  line-height: 150px;
  clip-path: polygon(0 0, 100% 0, 100% 100px, 0 100px);
}

.olh-digit-1,
.olh-digit-2,
.olh-digit-3,
.olh-digit-4 {
  position: relative;
  top: -15px;
}

.olh-offset {
  position: relative;
  right: -7.5px;
}

.olh-progress-bar {
  position: relative;
  top: -15px;
  width: 0%;
  height: 4px;
}

.olh-hero-imgs {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.olh-website-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.olh-nav {
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  padding: 2em;
}

.olh-nav > div {
  flex: 1;
  font-size: 36px;
  font-weight: 400;
  color: #ebdc0b;
  text-transform: uppercase;
}

.olh-nav p {
  margin: 0;
}

.olh-site-info {
  text-align: center;
}

.olh-menu {
  text-align: right;
}

.olh-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.olh-header h1 {
  margin: 0;
  text-transform: uppercase;
  font-size: 20cqw;
  font-weight: 200;
  color: #ebdc0b;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

/* Left inline, as the source has them: an inline-block per character would give
   the browser a break opportunity between every letter, and the heading (an
   absolutely positioned shrink-to-fit box only half the container wide) would
   wrap mid-word instead of running as one line. */
.olh-header h1 span {
  position: relative;
  top: 400px;
}

@media (max-width: 900px) {
  .olh-pre-loader {
    padding: 1em;
    gap: 0.5em;
  }

  .olh-counter {
    font-size: 70px;
  }

  .olh-pre-loader p {
    font-size: 40px;
    line-height: 64px;
  }

  .olh-offset {
    position: relative;
    right: -5px;
  }
}
`;
