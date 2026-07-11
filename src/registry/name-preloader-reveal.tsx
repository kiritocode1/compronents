"use client";

/**
 * Name Preloader Reveal - a one-shot editorial intro: a progress bar fills and
 * empties while four portraits stack and clip open in the center, a caption
 * rises line by line, and a large name splits into alternating characters. As
 * the panel clears, the first and last letters slide to center and the whole
 * name shrinks into a mix-blend corner mark, then the hero headline rises with
 * its dividers.
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

const ASSET_BASE = "https://ui.aryank.space/assets/name-preloader-reveal";

export interface NamePreloaderRevealProps {
  images?: string[];
  name?: string;
  caption?: string;
  headingLines?: string[];
}

const DEFAULT_IMAGES = [
  `${ASSET_BASE}/img1.jpg`,
  `${ASSET_BASE}/img2.jpg`,
  `${ASSET_BASE}/img3.jpg`,
  `${ASSET_BASE}/img4.jpg`,
];

export default function NamePreloaderReveal({
  images = DEFAULT_IMAGES,
  name = "Dorian Valez",
  caption = "A visual storyteller focused on shaping timeless fashion narratives through bold composition and refined tone.",
  headingLines = ["A Vision", "Captured Through", "Dorian Valez"],
}: NamePreloaderRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("npr-hop", "0.9, 0, 0.1, 1");

    const createSplit = (
      selector: string,
      type: "chars" | "lines",
      className: string,
    ) =>
      SplitText.create(root.querySelectorAll(selector), {
        type,
        [`${type}Class`]: className,
        mask: type,
      });

    const splitHeader = createSplit(".npr-header a", "chars", "npr-char");
    const splitCopy = createSplit(".npr-copy p", "lines", "npr-line");
    const splitHeadings = createSplit(".npr-row h1", "lines", "npr-hline");
    const splits = [splitHeader, splitCopy, splitHeadings];

    const chars = splitHeader.chars as HTMLElement[];
    const lines = splitCopy.lines as HTMLElement[];
    const initialChar = chars[0];
    const lastChar = chars[chars.length - 1];

    chars.forEach((char, index) => {
      gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 100 });
    });
    gsap.set(lines, { yPercent: 100 });
    gsap.set(splitHeadings.lines, { yPercent: 100 });

    const imgs = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".npr-images .npr-img"),
    );
    const imgInners = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".npr-images .npr-img img"),
    );

    const tl = gsap.timeline({ delay: 0.25 });

    tl.to(".npr-progress", { scaleX: 1, duration: 4, ease: "power3.inOut" })
      .set(".npr-progress", { transformOrigin: "right" })
      .to(".npr-progress", { scaleX: 0, duration: 1, ease: "power3.in" });

    imgs.forEach((img, index) => {
      tl.to(
        img,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1,
          ease: "npr-hop",
          delay: index * 0.75,
        },
        "-=5",
      );
    });

    imgInners.forEach((inner, index) => {
      tl.to(
        inner,
        { scale: 1, duration: 1.5, ease: "npr-hop", delay: index * 0.75 },
        "-=5.25",
      );
    });

    tl.to(
      lines,
      { yPercent: 0, duration: 2, ease: "npr-hop", stagger: 0.1 },
      "-=5.5",
    );
    tl.to(
      chars,
      { yPercent: 0, duration: 1, ease: "npr-hop", stagger: 0.025 },
      "-=5",
    );

    tl.to(
      ".npr-images",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "npr-hop",
      },
      "-=1.5",
    );

    tl.to(
      lines,
      { y: "-125%", duration: 2, ease: "npr-hop", stagger: 0.1 },
      "-=2",
    );

    tl.to(
      chars,
      {
        yPercent: (index: number) => {
          if (index === 0 || index === chars.length - 1) return 0;
          return index % 2 === 0 ? 100 : -100;
        },
        duration: 1,
        ease: "npr-hop",
        stagger: 0.025,
        delay: 0.5,
        onStart: () => {
          if (initialChar.parentElement) {
            initialChar.parentElement.style.overflow = "visible";
          }
          if (lastChar.parentElement) {
            lastChar.parentElement.style.overflow = "visible";
          }

          const rootRect = root.getBoundingClientRect();
          const centerX = rootRect.left + rootRect.width / 2;
          const initialRect = initialChar.getBoundingClientRect();
          const lastRect = lastChar.getBoundingClientRect();

          gsap.to([initialChar, lastChar], {
            duration: 1,
            ease: "npr-hop",
            delay: 0.5,
            x: (i: number) =>
              i === 0
                ? centerX - initialRect.left - initialRect.width
                : centerX - lastRect.left,
            onComplete: () => {
              gsap.set(".npr-header", { mixBlendMode: "difference" });
              gsap.to(".npr-header", {
                y: "2rem",
                scale: 0.35,
                duration: 1.75,
                ease: "npr-hop",
              });
            },
          });
        },
      },
      "-=2.5",
    );

    tl.to(
      ".npr-preloader",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.75,
        ease: "npr-hop",
      },
      "-=0.5",
    );

    tl.to(
      ".npr-row .npr-hline",
      { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.1 },
      "-=0.75",
    );
    tl.to(
      ".npr-divider",
      { scaleX: 1, duration: 1, ease: "power4.out", stagger: 0.1 },
      "<",
    );

    return () => {
      tl.kill();
      for (const s of splits) s.revert();
    };
  }, []);

  return (
    <div className="npr-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="npr-preloader">
        <div className="npr-progress" />

        <div className="npr-images">
          {images.map((src) => (
            <div className="npr-img" key={src}>
              <img alt="" draggable={false} src={src} />
            </div>
          ))}
        </div>

        <div className="npr-copy">
          <p>{caption}</p>
        </div>
      </div>

      <div className="npr-header">
        <a href="#">{name}</a>
      </div>

      <section className="npr-hero">
        {headingLines.map((line) => (
          <div className="npr-row" key={line}>
            <div className="npr-divider" />
            <h1>{line}</h1>
          </div>
        ))}
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Agdasima:wght@400;700&family=Manrope:wght@200..800&display=swap");

.npr-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #fff;
  font-family: "Manrope", sans-serif;
}

.npr-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.npr-root h1 {
  text-transform: uppercase;
  font-size: 8rem;
  line-height: 1;
  letter-spacing: -0.5rem;
}

.npr-root p {
  text-transform: uppercase;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 550;
}

.npr-root a {
  text-decoration: none;
  text-transform: uppercase;
  color: #fff;
  font-family: "Agdasima", sans-serif;
  font-size: 7.5rem;
  font-weight: 600;
  line-height: 0.9;
  display: block;
}

.npr-preloader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  background-color: #000;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  overflow: hidden;
  z-index: 2;
}

.npr-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 7px;
  background-color: #fff;
  transform: scaleX(0);
  transform-origin: left;
  will-change: transform;
}

.npr-images {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25rem;
  height: 25rem;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  overflow: hidden;
}

.npr-img {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  will-change: clip-path;
  overflow: hidden;
}

.npr-img img {
  position: relative;
  width: 100%;
  height: 100%;
  transform: scale(2);
  will-change: transform;
}

.npr-copy {
  position: absolute;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  color: #fff;
}

.npr-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(60svh);
  transform-origin: top;
  will-change: transform;
  z-index: 2;
}

.npr-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-align: center;
  overflow: hidden;
}

.npr-divider {
  position: relative;
  width: 100%;
  height: 1.5px;
  transform: scaleX(0);
  background-color: rgba(0, 0, 0, 0.2);
  will-change: transform;
}

.npr-header a .npr-char,
.npr-copy p .npr-line,
.npr-row h1 .npr-hline {
  position: relative;
  display: inline-block;
  transform: translateY(0);
  will-change: transform;
}

@media (max-width: 1000px) {
  .npr-root h1 {
    font-size: 2rem;
    letter-spacing: 0;
  }

  .npr-images {
    top: 35%;
    width: 10rem;
    height: 10rem;
  }

  .npr-copy {
    width: 80%;
  }

  .npr-header {
    transform: translateY(50svh);
  }

  .npr-header a {
    font-size: 4rem;
  }
}
`;
