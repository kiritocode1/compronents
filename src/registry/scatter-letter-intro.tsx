"use client";

/**
 * Scatter Letter Intro - a landing sequence where a wordmark assembles, counts
 * itself in, then scatters. The letters rise into place on a stagger, a three
 * two one counter steps a single strip by exactly one line height per beat,
 * and when it lands the type blows up to fifteen percent of the frame while six
 * black panels wipe away in a random order to expose the video behind. In the
 * same instant each letter is thrown to its own hand-authored vertical offset,
 * so the wordmark comes apart into a composition rather than dispersing evenly.
 * The letters use mix-blend-mode difference, so they invert against whatever
 * the footage puts behind them.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/scatter-letter-intro";

export interface ScatterLetterIntroProps {
  videoSrc?: string;
  wordmark?: string;
  /** Final vertical offset per letter, in px. One entry per character. */
  movements?: number[];
  brand?: string;
  links?: string[];
  copyright?: string;
  scrollHint?: string;
  tagline?: string;
  /** Panels that wipe away to expose the video. */
  blockCount?: number;
  letterColor?: string;
}

const DEFAULT_MOVEMENTS = [-100, 300, 150, -300, -90, 100, -200];

export default function ScatterLetterIntro({
  videoSrc = `${ASSET_BASE}/hero-video.mp4`,
  wordmark = "FPKPXTF",
  movements = DEFAULT_MOVEMENTS,
  brand = "FPKPXTF",
  links = ["Contact Us", "Menu"],
  copyright = "©2026",
  scrollHint = "Scroll to explore",
  tagline = "For 20 years we have been providing technical support services for large scale events",
  blockCount = 6,
  letterColor = "yellow",
}: ScatterLetterIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(".sli-header-item h1", { y: 100 });
      gsap.set(".sli-counter p", { y: 35 });

      const tl = gsap.timeline({ delay: 1.75 });

      tl.to(".sli-header-item h1", {
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
      });

      tl.to(
        ".sli-counter p",
        { y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.5",
      );

      // One strip stepped by exactly one line height per beat, so 3, 2, 1 and
      // then off the top.
      tl.to(".sli-counter p", {
        y: -35,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.5,
      });

      tl.to(".sli-counter p", {
        y: -70,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.5,
      });

      tl.to(".sli-counter p", {
        y: -105,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.75,
      });

      tl.from(".sli-tagline", { y: 40, opacity: 0, stagger: 0.2 }, "-=4");

      tl.to(".sli-header-item h1", {
        fontSize: "15cqw",
        duration: 1,
        ease: "power3.out",
      });

      tl.to(".sli-header-item", { clipPath: "none", duration: 0.1 }, "<");

      tl.to(
        ".sli-block",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 0.5,
          stagger: { amount: 0.5, from: "random", ease: "power3.out" },
        },
        "<",
      );

      movements.forEach((move, index) => {
        tl.to(
          `.sli-h-${index + 1}`,
          { y: move, duration: 1, ease: "power3.out" },
          "<",
        );
      });

      tl.from(".sli-logo, .sli-link, .sli-footer p", {
        y: 40,
        opacity: 0,
        stagger: 0.2,
      });
    }, root);

    return () => ctx.revert();
  }, [movements]);

  return (
    <div className="sli-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="sli-container">
        <nav className="sli-nav">
          <div className="sli-logo">
            <a href="#brand">{brand}</a>
          </div>
          <div className="sli-links">
            {links.map((link) => (
              <div className="sli-link" key={link}>
                <a href="#nav">{link}</a>
              </div>
            ))}
          </div>
        </nav>

        <footer className="sli-footer">
          <p>{copyright}</p>
          <p>{scrollHint}</p>
        </footer>

        <div className="sli-hero-video">
          <video autoPlay loop muted playsInline>
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        <div className="sli-blocks">
          {Array.from({ length: blockCount }, (_, i) => (
            <div className="sli-block" key={`block-${String(i)}`} />
          ))}
        </div>

        <div className="sli-header">
          {wordmark.split("").map((char, i) => (
            <div className="sli-header-item" key={`${char}-${String(i)}`}>
              <div className={`sli-header-item-wrapper sli-h-${i + 1}`}>
                <h1 style={{ color: letterColor }}>{char}</h1>
              </div>
            </div>
          ))}
        </div>

        <div className="sli-counter">
          <p style={{ color: letterColor }}>
            3 <br />2 <br />1
          </p>
        </div>

        <div className="sli-tagline">
          <p>{tagline}</p>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Inter:opsz,wght@14..32,100..900&display=swap");

.sli-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background: #000;
}

.sli-root * {
  box-sizing: border-box;
}

.sli-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sli-nav,
.sli-footer {
  position: absolute;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.sli-footer {
  bottom: 0;
}

.sli-links {
  display: flex;
  gap: 2em;
}

.sli-logo,
.sli-link,
.sli-footer p {
  position: relative;
}

.sli-root a,
.sli-root p {
  margin: 0;
  text-decoration: none;
  color: #fff;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
}

.sli-tagline {
  width: 30%;
  position: absolute;
  left: 50%;
  bottom: 2em;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}

.sli-hero-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sli-hero-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sli-blocks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
}

.sli-block {
  flex: 1;
  height: 100%;
  background: #000;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.sli-header-item h1 {
  margin: 0;
  font-family: "Archivo", sans-serif;
  font-stretch: expanded;
  font-size: 6cqw;
  font-weight: 800;
  line-height: 100%;
}

.sli-header {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.sli-header-item {
  position: relative;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  mix-blend-mode: difference;
}

.sli-header-item h1 {
  position: relative;
}

.sli-counter {
  width: 40px;
  height: 40px;
  position: absolute;
  bottom: 6em;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  z-index: 2;
}

.sli-counter p {
  position: relative;
  font-size: 30px;
  line-height: 120%;
}

@media (max-width: 900px) {
  .sli-tagline {
    width: 80%;
    bottom: 10em;
  }

  .sli-counter {
    bottom: 15em;
  }

  .sli-block {
    margin-left: -1px;
  }
}
`;
