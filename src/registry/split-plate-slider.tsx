"use client";

/**
 * Split Plate Slider - a click-through slider whose single image is cut into
 * two offset plates. The top and bottom halves carry different clip-paths that
 * are inset from opposite sides, so at rest the picture reads as two staggered
 * bands; hovering pulls both to a symmetrical inset on a one second CSS
 * transition, which snaps the halves back into alignment. Advancing stacks a
 * new pair of images that wipe in from the right at scale two and settle to
 * one, staggered by 150ms so the halves arrive slightly apart, and anything
 * past five layers is pruned once the tween completes. The title strip is nine
 * cells wide and steps by exactly one ninth, with the incoming title lit a beat
 * after the movement starts.
 *
 * Self-contained: it fills its own box, click anywhere to advance.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/split-plate-slider";

export interface SplitPlateSliderProps {
  titles?: string[];
  images?: string[];
  brand?: string;
  navNote?: string;
  links?: string[];
  footerNote?: string;
}

const DEFAULT_TITLES = [
  "Neo Forge Towers",
  "Arcadian Complex",
  "Shadowline Spire",
  "Echo Nexus Habitat",
  "Cascade Enclave",
  "Prism Sector",
  "Iron Eden Colony",
];

const DEFAULT_IMAGES = Array.from(
  { length: 8 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function SplitPlateSlider({
  titles = DEFAULT_TITLES,
  images = DEFAULT_IMAGES,
  brand = "BLANK",
  navNote = "Interface studies, 2026",
  links = ["Components", "Pages", "Backend"],
  footerNote = "Click to advance",
}: SplitPlateSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const totalSlides = titles.length;
    let currentIndex = 1;

    // The strip repeats the first two titles at the end so the loop can step
    // past the last one without snapping back, which is why it is titles+2 wide.
    const cellCount = totalSlides + 2;
    const stepPercent = 100 / cellCount;

    const updateActiveSlide = () => {
      root.querySelectorAll(".sps-title").forEach((el, index) => {
        el.classList.toggle("sps-active", index === currentIndex);
      });
    };

    function trimExcessImages() {
      for (const selector of [".sps-img-top", ".sps-img-bottom"]) {
        const container = root?.querySelector(selector);
        if (!container) continue;
        const imgs = Array.from(container.querySelectorAll("img"));
        const excessCount = imgs.length - 5;
        if (excessCount > 0) {
          for (const image of imgs.slice(0, excessCount)) {
            container.removeChild(image);
          }
        }
      }
    }

    const updateImages = (imageNumber: number) => {
      const imgSrc = images[(imageNumber - 1) % images.length];
      const imgTop = document.createElement("img");
      const imgBottom = document.createElement("img");

      imgTop.src = imgSrc;
      imgBottom.src = imgSrc;
      imgTop.alt = "";
      imgBottom.alt = "";
      imgTop.draggable = false;
      imgBottom.draggable = false;

      imgTop.style.clipPath = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
      imgBottom.style.clipPath =
        "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
      imgTop.style.transform = "scale(2)";
      imgBottom.style.transform = "scale(2)";

      root.querySelector(".sps-img-top")?.appendChild(imgTop);
      root.querySelector(".sps-img-bottom")?.appendChild(imgBottom);

      gsap.to([imgTop, imgBottom], {
        clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)",
        transform: "scale(1)",
        duration: 2,
        ease: "power4.out",
        stagger: 0.15,
        onComplete: trimExcessImages,
      });
    };

    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const handleSlider = () => {
      currentIndex = currentIndex < totalSlides ? currentIndex + 1 : 1;

      gsap.to(root.querySelector(".sps-slide-titles"), {
        onStart: () => {
          const t = setTimeout(() => {
            updateActiveSlide();
            timeouts.delete(t);
          }, 100);
          timeouts.add(t);
          updateImages(currentIndex + 1);
        },
        x: `-${(currentIndex - 1) * stepPercent}%`,
        duration: 2,
        ease: "power4.out",
      });
    };

    root.addEventListener("click", handleSlider);

    updateImages(2);
    updateActiveSlide();

    return () => {
      root.removeEventListener("click", handleSlider);
      for (const t of timeouts) clearTimeout(t);
      gsap.killTweensOf(root.querySelectorAll("*"));
      root.querySelector(".sps-img-top")?.replaceChildren();
      root.querySelector(".sps-img-bottom")?.replaceChildren();
    };
  }, [titles, images]);

  // Repeat the first two so the strip can step past the last title.
  const stripTitles = [...titles, titles[0], titles[1]];

  return (
    <div className="sps-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="sps-nav">
        <a href="#brand">{brand}</a>
        <p>{navNote}</p>
      </nav>

      <footer className="sps-footer">
        <div className="sps-links">
          {links.map((link) => (
            <a href="#footer" key={link}>
              {link}
            </a>
          ))}
        </div>
        <p>{footerNote}</p>
      </footer>

      <div className="sps-slider">
        <div
          className="sps-slide-titles"
          style={{ width: `${stripTitles.length * 100}%` }}
        >
          {stripTitles.map((title, i) => (
            <div className="sps-title" key={`${title}-${String(i)}`}>
              <h1>{title}</h1>
            </div>
          ))}
        </div>
        <div className="sps-slide-images">
          <div className="sps-img-top" />
          <div className="sps-img-bottom" />
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

.sps-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f0f0f;
  color: #fff;
  font-family: "Hanken Grotesk", sans-serif;
  overflow: hidden;
  cursor: pointer;
}

.sps-root * {
  box-sizing: border-box;
}

.sps-root img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sps-nav,
.sps-footer {
  position: absolute;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  mix-blend-mode: difference;
  pointer-events: none;
}

.sps-root a,
.sps-root p {
  margin: 0;
  text-decoration: none;
  color: #fff;
  font-size: 14px;
}

.sps-links {
  display: flex;
  gap: 2em;
}

.sps-nav {
  top: 0;
}

.sps-footer {
  bottom: 0;
}

.sps-slider {
  width: 100%;
  height: 100%;
}

.sps-slide-titles {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  pointer-events: none;
  z-index: 2;
}

.sps-title {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sps-title h1 {
  margin: 0;
  text-align: center;
  font-size: 28px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.25s ease, opacity 0.25s ease;
}

.sps-title.sps-active h1 {
  color: #fff;
}

.sps-slide-images {
  width: 550px;
  height: 500px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: all;
  opacity: 0.5;
}

.sps-img-top {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(85% 0%, 0% 0%, 0% 50%, 85% 50%);
  transition: clip-path 1s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.sps-img-bottom {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(100% 50%, 15% 50%, 15% 100%, 100% 100%);
  transition: clip-path 1s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.sps-slide-images:hover .sps-img-top {
  clip-path: polygon(90% 0%, 10% 0%, 10% 50%, 90% 50%);
}

.sps-slide-images:hover .sps-img-bottom {
  clip-path: polygon(90% 50%, 10% 50%, 10% 100%, 90% 100%);
}

@media (max-width: 900px) {
  .sps-slide-images {
    width: 100%;
    height: 100%;
  }

  .sps-img-top,
  .sps-img-bottom {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  }

  .sps-slide-images:hover .sps-img-top,
  .sps-slide-images:hover .sps-img-bottom {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  }

  .sps-title h1 {
    opacity: 0;
    font-size: 24px;
  }

  .sps-title.sps-active h1 {
    opacity: 1;
  }
}
`;
