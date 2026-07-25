"use client";

/**
 * Counter Word Preloader - a loading screen where four things run off one
 * three second clock: a counter to 100, a word that cycles through five
 * variants, an image that flicks through ten frames, and that image frame
 * sliding from the left edge to its resting slot in the headline. When the
 * curtain wipes up, headline words slide in from alternating sides, and the
 * small image frame is measured, frozen at that exact box, then grown to fill
 * the whole frame, so the preloader's thumbnail becomes the page background in
 * one continuous move.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/counter-word-preloader";

export interface CounterWordPreloaderProps {
  brand?: string;
  menuLabel?: string;
  rotatingWords?: string[];
  headingRows?: [string, string, string];
  footerCopy?: string;
  preloaderCopy?: string;
  images?: string[];
  preloaderBackground?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function CounterWordPreloader({
  brand = "Underlume",
  menuLabel = "Menu",
  rotatingWords = ["Studios", "Season", "Chamber", "Archive", "Vision"],
  headingRows = ["Everything", "Beneath", "The Surface"],
  footerCopy = "Seen and Unseen",
  preloaderCopy = "Currently Developing",
  images = DEFAULT_IMAGES,
  preloaderBackground = "#272d2d",
}: CounterWordPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText, CustomEase);
    CustomEase.create("cwp-hop", "0.8, 0, 0.1, 1");

    const preloader = root.querySelector<HTMLElement>(".cwp-preloader");
    const preloaderCounter = root.querySelector<HTMLElement>(
      ".cwp-preloader-counter h1",
    );
    const preloaderWord = root.querySelector<HTMLElement>(
      ".cwp-preloader-header-row:nth-child(2) h1",
    );
    const nav = root.querySelector<HTMLElement>(".cwp-nav");
    const heroImageFrame = root.querySelector<HTMLElement>(
      ".cwp-hero-header-img",
    );
    if (
      !preloader ||
      !preloaderCounter ||
      !preloaderWord ||
      !nav ||
      !heroImageFrame
    ) {
      return;
    }

    const heroRows = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".cwp-hero-header-row"),
    );
    const heroHeadings = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".cwp-hero-header-row h1"),
    );
    const heroImages = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".cwp-hero-header-img img"),
    );

    const counter = { progress: 0 };
    const wordCycle = { progress: 0 };
    const imageCycle = { progress: 0 };

    let activeWord = 0;
    let activeImage = 0;

    const headingSplits = heroHeadings.map((heading) =>
      SplitText.create(heading, {
        type: "words",
        mask: "words",
        wordsClass: "cwp-word",
      }),
    );

    headingSplits.forEach((split, rowIndex) => {
      gsap.set(split.words, { x: rowIndex === 1 ? "100%" : "-100%" });
    });

    gsap.set(nav, { y: -300 });

    const rootFontSize = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const rootRect = root.getBoundingClientRect();
    const leftEdgeOffset =
      2.5 * rootFontSize -
      (heroImageFrame.getBoundingClientRect().left - rootRect.left);

    gsap.set(heroImageFrame, { x: leftEdgeOffset });

    const renderCounter = () => {
      const value = Math.round(counter.progress);
      preloaderCounter.textContent = String(value).padStart(3, "0");
    };

    const renderWord = () => {
      const index = Math.round(wordCycle.progress);
      if (index === activeWord) return;
      activeWord = index;
      preloaderWord.textContent = rotatingWords[index] ?? "";
    };

    const renderImage = () => {
      const index = Math.round(imageCycle.progress) % heroImages.length;
      if (index === activeImage) return;
      activeImage = index;
      heroImages.forEach((image, imageIndex) => {
        image.style.opacity = imageIndex === index ? "1" : "0";
      });
    };

    const expandImageToFullscreen = () => {
      for (const row of heroRows) {
        gsap.set(row, {
          flex: "none",
          height: row.getBoundingClientRect().height,
        });
      }

      const frame = heroImageFrame.getBoundingClientRect();
      const bounds = root.getBoundingClientRect();

      // The source pins this to the viewport with position: fixed. Inside a
      // bounded root that would escape the box, so it is absolutely placed
      // against the root and its rect measured relative to the root.
      gsap.set(heroImageFrame, {
        position: "absolute",
        top: frame.top - bounds.top,
        left: frame.left - bounds.left,
        width: frame.width,
        height: frame.height,
        x: 0,
        y: 0,
        zIndex: -1,
      });

      gsap.to(heroImageFrame, {
        top: 0,
        left: 0,
        width: bounds.width,
        height: bounds.height,
        duration: 1.25,
        ease: "cwp-hop",
      });
    };

    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(counter, {
      progress: 100,
      duration: 3,
      ease: "none",
      onUpdate: renderCounter,
    });

    tl.to(heroImageFrame, { x: 0, duration: 3, ease: "none" }, 0);

    tl.to(
      wordCycle,
      {
        progress: rotatingWords.length - 1,
        duration: 3,
        ease: "none",
        onUpdate: renderWord,
      },
      0,
    );

    tl.to(
      imageCycle,
      {
        progress: heroImages.length * 3 - 1,
        duration: 3,
        ease: "none",
        onUpdate: renderImage,
      },
      0,
    );

    tl.to(
      [
        root.querySelector(".cwp-preloader-header"),
        root.querySelector(".cwp-preloader-counter"),
        root.querySelector(".cwp-preloader-footer-copy"),
      ],
      { opacity: 0, duration: 0.25 },
      "+=0.35",
    );

    tl.to(preloader, {
      clipPath: "polygon(0% 0%, 100% 0, 100% 0%, 0% 0%)",
      duration: 1,
      ease: "cwp-hop",
      onComplete: () => {
        preloader.style.display = "none";
      },
    });

    tl.to(
      root.querySelectorAll(".cwp-word"),
      {
        x: "0%",
        duration: 1.25,
        ease: "power3.out",
        onComplete: expandImageToFullscreen,
      },
      "-=0.5",
    );

    tl.to(
      root.querySelector(".cwp-hero-footer p"),
      { opacity: 1, duration: 1, ease: "power3.out" },
      "<",
    );

    tl.to(nav, { y: 0, duration: 1, ease: "power3.out" }, "<");

    return () => {
      tl.kill();
      for (const split of headingSplits) split.revert();
    };
  }, [images, rotatingWords, headingRows]);

  return (
    <div
      className="cwp-root"
      ref={rootRef}
      style={
        { "--cwp-preloader-bg": preloaderBackground } as React.CSSProperties
      }
    >
      <style>{styles}</style>

      <div className="cwp-preloader">
        <div className="cwp-preloader-header">
          <div className="cwp-preloader-header-row">
            <h1>{brand}</h1>
          </div>
          <div className="cwp-preloader-header-row">
            <h1>{rotatingWords[0]}</h1>
          </div>
        </div>
        <div className="cwp-preloader-footer">
          <div className="cwp-preloader-counter">
            <h1>000</h1>
          </div>
          <div className="cwp-preloader-footer-copy">
            <p>{preloaderCopy}</p>
          </div>
        </div>
      </div>

      <nav className="cwp-nav">
        <div className="cwp-nav-logo">
          <p>{brand}</p>
        </div>
        <div className="cwp-nav-toggler">
          <p>{menuLabel}</p>
        </div>
      </nav>

      <section className="cwp-hero">
        <div className="cwp-hero-header">
          <div className="cwp-hero-header-row">
            <h1>{headingRows[0]}</h1>
          </div>
          <div className="cwp-hero-header-row">
            <h1>{headingRows[1]}</h1>

            <div className="cwp-hero-header-img">
              {images.map((image) => (
                <img src={image} alt="" key={image} />
              ))}
            </div>
          </div>
          <div className="cwp-hero-header-row">
            <h1>{headingRows[2]}</h1>
          </div>
        </div>

        <div className="cwp-hero-footer">
          <p>{footerCopy}</p>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.cwp-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Inter", sans-serif;
  background-color: #fff;
  container-type: inline-size;
}
.cwp-root * { margin: 0; padding: 0; box-sizing: border-box; }
.cwp-root h1,
.cwp-root p {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: -2%;
  line-height: 0.85;
}
.cwp-root h1 { font-size: clamp(2.5rem, 10cqw, 15rem); }
.cwp-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #fff;
  mix-blend-mode: difference;
  will-change: transform;
  z-index: 3;
}
.cwp-hero {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2.5rem;
  display: flex;
  align-items: flex-end;
}
.cwp-hero-header {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.cwp-hero-header-row {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
}
.cwp-hero-header-row:nth-child(1),
.cwp-hero-header-row:nth-child(3) { justify-content: flex-end; }
.cwp-hero-header-row:nth-child(2) { gap: 2.5rem; }
.cwp-hero-header-row h1 { color: #fff; mix-blend-mode: difference; }
.cwp-hero-header-img {
  position: relative;
  flex-shrink: 0;
  width: 275px;
  height: 150px;
  will-change: transform;
  z-index: 10;
}
.cwp-hero-header-img img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: opacity;
  opacity: 0;
}
.cwp-hero-header-img img:nth-child(1) { opacity: 1; }
.cwp-hero-footer {
  position: absolute;
  left: 2.5rem;
  bottom: 2.5rem;
}
.cwp-hero-footer p {
  color: #fff;
  mix-blend-mode: difference;
  will-change: opacity;
  opacity: 0;
}
.cwp-preloader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--cwp-preloader-bg);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  z-index: 4;
}
.cwp-preloader-header { display: flex; flex-direction: column; }
.cwp-preloader-header-row { display: flex; }
.cwp-preloader-header-row:nth-child(2) { justify-content: flex-end; }
.cwp-preloader-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.cwp-preloader-header,
.cwp-preloader-counter,
.cwp-preloader-footer-copy { will-change: opacity; }
.cwp-word { position: relative; will-change: transform; }

@media (max-width: 1000px) {
  .cwp-hero-header-img { width: 100px; height: 50px; }
  .cwp-hero-footer { bottom: 25svh; }
}
`;
