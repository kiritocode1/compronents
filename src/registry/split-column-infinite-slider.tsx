"use client";

/**
 * Split Column Infinite Slider - two columns that scroll in opposite
 * directions off one wheel. Each slide is revealed by a clip path growing from
 * the bottom on the left and the top on the right, with a half percent overlap
 * so no seam ever shows between consecutive slides. Images drift against the
 * reveal and are held at 1.25 zoom so the drift never exposes an edge, and the
 * copy holds dead center through a short window before easing away on a
 * smoothstep curve. Slides are created and destroyed around a three slide
 * buffer, so the loop is endless in both directions without cloning the set.
 *
 * Self-contained: it fills its own box and reads the wheel over itself.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE =
  "https://ui.aryank.space/assets/split-column-infinite-slider";

export interface SplitSlide {
  title: string;
  tags: string[];
  accent: string;
  link: string;
  leftImage: string;
  rightImage: string;
}

export interface SplitColumnInfiniteSliderProps {
  slides?: SplitSlide[];
  linkLabel?: string;
  scrollSensitivity?: number;
  smoothness?: number;
  imageZoom?: number;
}

const DEFAULT_SLIDES: SplitSlide[] = [
  {
    title: "Studioform",
    tags: ["Studio & Movement", "Fitness & Method", "Space & Design"],
    accent: "#a9d0f5",
    link: "/studioform/",
    leftImage: `${ASSET_BASE}/slide_img_left_1.jpg`,
    rightImage: `${ASSET_BASE}/slide_img_right_1.jpg`,
  },
  {
    title: "Nightbloom",
    tags: ["Editorial & Portrait", "Concept & Series", "Art & Direction"],
    accent: "#f5a97a",
    link: "/nightbloom/",
    leftImage: `${ASSET_BASE}/slide_img_left_2.jpg`,
    rightImage: `${ASSET_BASE}/slide_img_right_2.jpg`,
  },
  {
    title: "Stillpose",
    tags: ["Movement & Wellness", "Body & Practice", "Brand & Identity"],
    accent: "#b7e0a0",
    link: "/stillpose/",
    leftImage: `${ASSET_BASE}/slide_img_left_3.jpg`,
    rightImage: `${ASSET_BASE}/slide_img_right_3.jpg`,
  },
  {
    title: "Matchawork",
    tags: ["Beverage & Craft", "Content & Styling", "Product & Story"],
    accent: "#c9a97a",
    link: "/matchawork/",
    leftImage: `${ASSET_BASE}/slide_img_left_4.jpg`,
    rightImage: `${ASSET_BASE}/slide_img_right_4.jpg`,
  },
  {
    title: "Blurface",
    tags: ["Fashion & Portrait", "Motion & Study", "Brand & Identity"],
    accent: "#e8e8e8",
    link: "/blurface/",
    leftImage: `${ASSET_BASE}/slide_img_left_5.jpg`,
    rightImage: `${ASSET_BASE}/slide_img_right_5.jpg`,
  },
];

const BUFFER_SLIDES = 3;
const IMAGE_SHIFT = 25;
const COPY_SHIFT = 15;
const TITLE_HOLD = 0.1;
const REVEAL_OVERLAP = 0.5;

type Side = "left" | "right";

export default function SplitColumnInfiniteSlider({
  slides = DEFAULT_SLIDES,
  linkLabel = "View Full Project",
  scrollSensitivity = 1200,
  smoothness = 0.05,
  imageZoom = 1.25,
}: SplitColumnInfiniteSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!slides.length) return;

    const columns: Record<
      Side,
      { el: HTMLElement | null; visibleSlides: Map<number, HTMLElement> }
    > = {
      left: {
        el: root.querySelector<HTMLElement>(".gag-left"),
        visibleSlides: new Map(),
      },
      right: {
        el: root.querySelector<HTMLElement>(".gag-right"),
        visibleSlides: new Map(),
      },
    };
    if (!columns.left.el || !columns.right.el) return;

    let scrollPosition = 1;
    let scrollTarget = 1;
    let lastTouchY = 0;
    let frame = 0;

    const createSlide = (side: Side, index: number) => {
      const column = columns[side];
      if (!column.el) return;

      const slideIndex =
        ((index % slides.length) + slides.length) % slides.length;
      const data = slides[slideIndex];

      const el = document.createElement("div");
      el.className = "gag-slide";
      el.style.zIndex = `${index}`;

      const img = document.createElement("img");
      img.src = side === "left" ? data.leftImage : data.rightImage;
      img.alt = "";

      const overlay = document.createElement("div");
      overlay.className = "gag-overlay";

      const copy = document.createElement("div");
      copy.className = "gag-copy";
      copy.style.color = data.accent;

      const tags = document.createElement("div");
      tags.className = "gag-slide-tags";
      data.tags.forEach((tag, i) => {
        if (i > 0) tags.appendChild(document.createElement("br"));
        tags.appendChild(document.createTextNode(tag));
      });

      const title = document.createElement("div");
      title.className = "gag-slide-title";
      title.textContent = data.title;

      const link = document.createElement("a");
      link.className = "gag-slide-link";
      link.href = data.link;
      link.textContent = linkLabel;

      copy.append(tags, title, link);
      el.append(img, overlay, copy);

      column.el.appendChild(el);
      column.visibleSlides.set(index, el);
    };

    const getRevealShape = (side: Side, revealAmount: number) => {
      const d = Math.max(0, Math.min(1, revealAmount)) * (100 + REVEAL_OVERLAP);
      return side === "left"
        ? `polygon(0% ${100 - d}%, 100% ${100 - d}%, 100% 100%, 0% 100%)`
        : `polygon(0% 0%, 100% 0%, 100% ${d}%, 0% ${d}%)`;
    };

    const getTitlePosition = (slideProgress: number) => {
      const fromCenter = slideProgress - 1;
      const past = Math.abs(fromCenter) - TITLE_HOLD;
      if (past <= 0) return 1;
      const t = past / (1 - TITLE_HOLD);
      return 1 + Math.sign(fromCenter) * t * t * (3 - 2 * t);
    };

    const updateSlider = () => {
      const first = Math.floor(scrollPosition) - BUFFER_SLIDES;
      const last = Math.floor(scrollPosition) + BUFFER_SLIDES + 1;

      for (const side of ["left", "right"] as Side[]) {
        const visibleSlides = columns[side].visibleSlides;
        const driftDirection = side === "left" ? 1 : -1;

        for (let i = first; i <= last; i++) {
          if (!visibleSlides.has(i)) createSlide(side, i);
        }

        for (const [index, el] of visibleSlides) {
          if (index < first || index > last) {
            el.remove();
            visibleSlides.delete(index);
            continue;
          }

          const revealAmount = scrollPosition - index;
          const slideProgress = Math.max(0, Math.min(2, revealAmount));

          el.style.clipPath = getRevealShape(side, revealAmount);

          const imageDrift = (1 - slideProgress) * IMAGE_SHIFT * driftDirection;
          const img = el.querySelector("img");
          if (img) {
            img.style.transform = `translateY(${imageDrift}%) scale(${imageZoom})`;
          }

          const titleDrift =
            (1 - getTitlePosition(slideProgress)) * COPY_SHIFT * driftDirection;
          const copy = el.querySelector<HTMLElement>(".gag-copy");
          if (copy) copy.style.transform = `translateY(${titleDrift}%)`;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollTarget += e.deltaY / scrollSensitivity;
    };
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      scrollTarget +=
        ((lastTouchY - e.touches[0].clientY) * 8) / scrollSensitivity;
      lastTouchY = e.touches[0].clientY;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart);
    root.addEventListener("touchmove", onTouchMove);

    const animateSlider = () => {
      scrollPosition += (scrollTarget - scrollPosition) * smoothness;
      updateSlider();
      frame = requestAnimationFrame(animateSlider);
    };
    animateSlider();

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      for (const side of ["left", "right"] as Side[]) {
        for (const [, el] of columns[side].visibleSlides) el.remove();
        columns[side].visibleSlides.clear();
      }
    };
  }, [slides, linkLabel, scrollSensitivity, smoothness, imageZoom]);

  return (
    <div className="gag-root" ref={rootRef}>
      <style>{styles}</style>
      <section className="gag-slider">
        <div className="gag-column gag-left" />
        <div className="gag-column gag-right" />
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.gag-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Inter", sans-serif;
  background: #000;
  container-type: inline-size;
}
.gag-root * { margin: 0; padding: 0; box-sizing: border-box; }
.gag-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.gag-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}
.gag-column {
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
}
.gag-slide {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.gag-slide img { will-change: transform; }
.gag-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
.gag-copy {
  position: absolute;
  top: 0;
  width: 100cqw;
  height: 100%;
  color: #fff;
  pointer-events: none;
  will-change: transform;
}
.gag-left .gag-copy { left: 0; }
.gag-right .gag-copy { right: 0; }
.gag-slide-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  font-size: clamp(2.5rem, 10cqw, 15rem);
  font-weight: 800;
  letter-spacing: -2%;
  line-height: 1;
}
.gag-slide-tags {
  position: absolute;
  top: 32.5%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  text-transform: uppercase;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -1%;
  line-height: 1;
}
.gag-slide-link {
  position: absolute;
  top: 62.5%;
  left: 50%;
  transform: translateX(-50%);
  text-decoration: none;
  text-transform: uppercase;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -1%;
  line-height: 1;
  color: inherit;
  pointer-events: auto;
  cursor: pointer;
}
`;
