"use client";

/**
 * Letter Grid Carousel - a carousel whose title is a fixed grid of letter
 * cells, not a word. Each slide supplies two rows of seven characters with
 * gaps left deliberately blank, so the type stays on the same skeleton while
 * the letters that occupy it change, and the whole title re-enters from the
 * side you are travelling toward. The progress rail is the other half of it:
 * the active tick claims five times the flex of its neighbours, so selecting
 * one widens its slot and squeezes the rest on the same CSS transition. Every
 * change also picks a random colour, which tints the backdrop and every letter
 * together, so no two visits look the same.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/letter-grid-carousel";

/** Two rows of seven cells per slide; "" leaves a cell empty. */
export type LetterGridTitle = string[][];

export interface LetterGridCarouselProps {
  images?: string[];
  titles?: LetterGridTitle[];
  brand?: string;
  navLink?: string;
  footerLeft?: string;
  footerRight?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 30 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

const DEFAULT_TITLES: LetterGridTitle[] = [
  [
    ["p", "", "r", "", "i", "s", "m"],
    ["", "t", "", "o", "n", "e", ""],
  ],
  [
    ["", "l", "u", "m", "e", "", "n"],
    ["d", "", "r", "e", "a", "m", ""],
  ],
  [
    ["r", "", "u", "s", "", "h", ""],
    ["", "s", "l", "i", "", "c", "e"],
  ],
  [
    ["e", "", "c", "h", "o", "", "e"],
    ["", "c", "o", "", "d", "e", "6"],
  ],
  [
    ["t", "e", "", "c", "h", "y", ""],
    ["", "m", "", "", "a", "p", "l"],
  ],
  [
    ["", "w", "a", "v", "", "e", "s"],
    ["b", "o", "", "x", "", "", ""],
  ],
  [
    ["c", "", "u", "b", "", "", "e"],
    ["", "s", "i", "t", "", "9", "0"],
  ],
  [
    ["r", "u", "", "s", "h", "", "x"],
    ["t", "", "o", "r", "", "k", ""],
  ],
  [
    ["c", "", "o", "d", "", "e", ""],
    ["l", "a", "b", "", "", "0", "8"],
  ],
  [
    ["m", "i", "x", "", "e", "", "d"],
    ["", "", "a", "r", "", "k", ""],
  ],
  [
    ["", "t", "e", "", "s", "t", ""],
    ["b", "", "e", "d", "", "5", "4"],
  ],
  [
    ["f", "o", "c", "u", "", "", "s"],
    ["", "d", "o", "c", "k", "", ""],
  ],
  [
    ["p", "", "a", "", "c", "e", ""],
    ["s", "e", "t", "", "1", "", "7"],
  ],
  [
    ["", "b", "", "l", "a", "s", "t"],
    ["m", "o", "", "d", "", "", "e"],
  ],
  [
    ["z", "o", "", "n", "e", "", ""],
    ["g", "e", "3", "", "", "n", ""],
  ],
  [
    ["d", "", "r", "e", "a", "", "m"],
    ["s", "c", "a", "p", "0", "", ""],
  ],
  [
    ["e", "l", "e", "v", "a", "n", ""],
    ["", "p", "a", "", "t", "", "h"],
  ],
  [
    ["", "s", "", "h", "i", "f", "t"],
    ["", "n", "e", "", "", "u", "e"],
  ],
  [
    ["i", "", "c", "o", "", "", "n"],
    ["", "m", "e", "m", "o", "", ""],
  ],
  [
    ["", "a", "", "", "u", "r", "a"],
    ["w", "", "a", "v", "e", "", "6"],
  ],
  [
    ["s", "t", "e", "l", "", "l", "a"],
    ["", "o", "", "r", "b", "i", "t"],
  ],
  [
    ["v", "", "e", "r", "t", "e", ""],
    ["c", "o", "", "r", "", "e", ""],
  ],
  [
    ["i", "n", "f", "i", "", "9", ""],
    ["", "", "", "e", "t", "h", "o"],
  ],
  [
    ["", "", "q", "u", "a", "n", "t"],
    ["d", "e", "", "c", "", "", "k"],
  ],
  [
    ["", "n", "", "", "o", "v", "a"],
    ["r", "", "a", "y", "", "", ""],
  ],
  [
    ["", "r", "a", "d", "i", "a", "n"],
    ["g", "l", "o", "", "", "w", "0"],
  ],
  [
    ["c", "o", "s", "m", "i", "c", ""],
    ["p", "", "a", "t", "h", "", ""],
  ],
  [
    ["", "s", "o", "l", "a", "r", ""],
    ["d", "r", "i", "f", "", "", "t"],
  ],
  [
    ["z", "e", "n", "", "l", "a", "y"],
    ["", "e", "r", "v", "", "y", ""],
  ],
  [
    ["a", "p", "e", "", "x", "", ""],
    ["f", "o", "r", "g", "e", "0", "0"],
  ],
];

export default function LetterGridCarousel({
  images = DEFAULT_IMAGES,
  titles = DEFAULT_TITLES,
  brand = "BLANK",
  navLink = "Subscribe",
  footerLeft = "Interface studies, 2026",
  footerRight = "aryank.space",
}: LetterGridCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "lgc-hop",
      "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
    );

    const sliderNav = root.querySelector<HTMLElement>(".lgc-slider-nav");
    const slidesContainer = root.querySelector<HTMLElement>(".lgc-slides");
    const bgOverlay = root.querySelector<HTMLElement>(".lgc-bg-overlay");
    const slideTitle = root.querySelector<HTMLElement>(".lgc-slide-title");
    if (!sliderNav || !slidesContainer || !bgOverlay || !slideTitle) return;

    const numberOfItems = images.length;

    function getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function updateTitle(newIndex: number, color: string) {
      const title = titles[newIndex];
      if (!title || !slideTitle) return;

      for (const [rowIndex, row] of Array.from(
        slideTitle.querySelectorAll<HTMLElement>(".lgc-slide-title-row"),
      ).entries()) {
        for (const [letterIndex, letter] of Array.from(
          row.querySelectorAll<HTMLElement>(".lgc-letter"),
        ).entries()) {
          const existingSpan = letter.querySelector("span");
          if (existingSpan) letter.removeChild(existingSpan);

          const newSpan = document.createElement("span");
          const direction = newIndex > currentIndexRef.current ? 150 : -150;
          gsap.set(newSpan, {
            x: direction,
            color,
            filter: "brightness(0.75)",
          });
          newSpan.textContent = title[rowIndex]?.[letterIndex] || "";
          letter.appendChild(newSpan);
          gsap.to(newSpan, {
            x: 0,
            duration: 1,
            ease: "power2.out",
            delay: 0.125,
          });
        }
      }
    }

    const cleanups: (() => void)[] = [];

    for (let i = 0; i < numberOfItems; i++) {
      const navItemWrapper = document.createElement("div");
      navItemWrapper.classList.add("lgc-nav-item-wrapper");
      if (i === 0) navItemWrapper.classList.add("lgc-active");

      const navItem = document.createElement("div");
      navItem.classList.add("lgc-nav-item");
      navItemWrapper.appendChild(navItem);
      sliderNav.appendChild(navItemWrapper);

      const onClick = () => {
        if (i === currentIndexRef.current) return;

        for (const nav of root.querySelectorAll(".lgc-nav-item-wrapper")) {
          nav.classList.remove("lgc-active");
        }
        navItemWrapper.classList.add("lgc-active");

        // The source translates in vw; here it is a percentage of the track,
        // which is exactly one slide width whatever the component measures.
        gsap.to(slidesContainer, {
          xPercent: (-i * 100) / numberOfItems,
          duration: 1.5,
          ease: "lgc-hop",
        });

        const newColor = getRandomColor();
        gsap.to(bgOverlay, {
          backgroundColor: newColor,
          duration: 1.5,
          ease: "lgc-hop",
        });

        updateTitle(i, newColor);
        currentIndexRef.current = i;
      };

      navItemWrapper.addEventListener("click", onClick);
      cleanups.push(() => navItemWrapper.removeEventListener("click", onClick));

      const slide = document.createElement("div");
      slide.classList.add("lgc-slide");

      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("lgc-img");

      const img = document.createElement("img");
      img.src = images[i];
      img.alt = "";
      img.draggable = false;

      imgWrapper.appendChild(img);
      slide.appendChild(imgWrapper);
      slidesContainer.appendChild(slide);
    }

    slidesContainer.style.width = `${numberOfItems * 100}%`;
    updateTitle(0, getComputedStyle(bgOverlay).backgroundColor);

    return () => {
      for (const cleanup of cleanups) cleanup();
      gsap.killTweensOf([slidesContainer, bgOverlay]);
      sliderNav.replaceChildren();
      slidesContainer.replaceChildren();
      currentIndexRef.current = 0;
    };
  }, [images, titles]);

  return (
    <div className="lgc-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="lgc-container">
        <nav className="lgc-nav">
          <a className="lgc-logo" href="#brand">
            {brand}
          </a>
          <a href="#nav">{navLink}</a>
        </nav>
        <footer className="lgc-footer">
          <a href="#footer">{footerLeft}</a>
          <a href="#footer">{footerRight}</a>
        </footer>
        <div className="lgc-bg-overlay" />
        <div className="lgc-slider-nav" />
        <div className="lgc-slides" />
        <div className="lgc-slide-title">
          <div className="lgc-slide-title-row">
            {Array.from({ length: 7 }, (_, i) => (
              <div className="lgc-letter" key={`r0-${String(i)}`} />
            ))}
          </div>
          <div className="lgc-slide-title-row">
            {Array.from({ length: 7 }, (_, i) => (
              <div className="lgc-letter" key={`r1-${String(i)}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:opsz,wght@14..32,100..900&display=swap");

.lgc-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background: #fff;
  color: #000;
  font-family: "Inter", sans-serif;
}

.lgc-root * {
  box-sizing: border-box;
}

.lgc-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.lgc-nav,
.lgc-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 2.75em;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.lgc-nav {
  top: 0;
}

.lgc-footer {
  bottom: 0;
}

.lgc-root a {
  text-decoration: none;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  color: #000;
}

.lgc-nav a.lgc-logo {
  position: relative;
  top: -12px;
  font-family: "Anton", sans-serif;
  font-size: 42px;
}

.lgc-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(213, 183, 71);
  filter: brightness(0.75);
  opacity: 0.5;
}

.lgc-slider-nav {
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 25%;
  height: 15px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.lgc-nav-item-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 750ms cubic-bezier(0, 0.75, 0.5, 1);
  cursor: pointer;
}

.lgc-nav-item {
  width: 1px;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  transition: all 750ms cubic-bezier(0, 0.75, 0.5, 1);
}

.lgc-nav-item-wrapper.lgc-active {
  flex: 5;
}

.lgc-nav-item-wrapper.lgc-active .lgc-nav-item {
  width: 50%;
  border: 1px solid rgba(0, 0, 0, 1);
}

.lgc-slides {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
}

.lgc-slide {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lgc-slide .lgc-img {
  width: 50%;
  height: 50%;
  opacity: 0.75;
}

.lgc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lgc-slide-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 65%;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.lgc-slide-title-row {
  flex: 1;
  width: 100%;
  display: flex;
  gap: 0em;
}

.lgc-slide-title-row:nth-child(2) {
  position: relative;
  left: 4em;
}

.lgc-letter {
  flex: 1;
  height: 100%;
  padding-left: 2em;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.lgc-letter span {
  position: relative;
  display: inline-block;
  font-family: "Anton", sans-serif;
  font-size: 17.5cqw;
  filter: brightness(0.25) saturate(0.75) !important;
}

@media (max-width: 900px) {
  .lgc-slider-nav {
    width: 40%;
  }

  .lgc-slide .lgc-img {
    width: 80%;
    height: 75%;
  }

  .lgc-slide-title {
    left: 47.5%;
    height: 25%;
  }

  .lgc-slide-title-row:nth-child(2) {
    left: 0;
  }

  .lgc-letter span {
    font-size: 100px;
  }
}
`;
