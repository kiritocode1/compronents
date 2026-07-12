"use client";

/**
 * Minimap Scrubber - a filmstrip navigator with a fixed selector window. A
 * column of thumbnails glides under a bordered indicator as you wheel or drag;
 * whichever thumbnail overlaps the indicator most dims to mark itself active and
 * swaps the large centered preview. Clicking a thumbnail eases it into the
 * indicator. Turns horizontal on narrow screens. Lerped, no dependencies.
 *
 * Fills its container, so it fits a bounded stage or a full-viewport slot.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/minimap-scrubber";

export interface MinimapScrubberProps {
  images?: string[];
  brand?: string;
  code?: string;
  label?: string;
  className?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpeg`,
);

export default function MinimapScrubber({
  images = DEFAULT_IMAGES,
  brand = "BLANK",
  code = "E427",
  label = "Responsive Minimap",
  className,
}: MinimapScrubberProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = root.querySelector<HTMLElement>(".msc-items");
    const indicator = root.querySelector<HTMLElement>(".msc-indicator");
    const previewImage =
      root.querySelector<HTMLImageElement>(".msc-preview img");
    const itemElements = Array.from(
      root.querySelectorAll<HTMLElement>(".msc-item"),
    );
    const itemImages = Array.from(
      root.querySelectorAll<HTMLImageElement>(".msc-item img"),
    );
    if (!items || !indicator || !previewImage || itemElements.length === 0)
      return;

    const activeItemOpacity = "0.3";
    let isHorizontal = root.clientWidth <= 900;
    let dims = { itemSize: 0, containerSize: 0, indicatorSize: 0 };
    let maxTranslate = 0;
    let currentTranslate = 0;
    let targetTranslate = 0;
    let isClickMove = false;
    let currentImageIndex = 0;
    let rafId = 0;

    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const updateDimensions = () => {
      isHorizontal = root.clientWidth <= 900;
      if (isHorizontal) {
        dims = {
          itemSize: itemElements[0].getBoundingClientRect().width,
          containerSize: items.scrollWidth,
          indicatorSize: indicator.getBoundingClientRect().width,
        };
      } else {
        dims = {
          itemSize: itemElements[0].getBoundingClientRect().height,
          containerSize: items.getBoundingClientRect().height,
          indicatorSize: indicator.getBoundingClientRect().height,
        };
      }
    };

    updateDimensions();
    maxTranslate = dims.containerSize - dims.indicatorSize;

    const getItemInIndicator = () => {
      for (const img of itemImages) img.style.opacity = "1";
      const indicatorStart = -currentTranslate;
      const indicatorEnd = indicatorStart + dims.indicatorSize;
      let maxOverlap = 0;
      let selectedIndex = 0;
      itemElements.forEach((_, index) => {
        const itemStart = index * dims.itemSize;
        const itemEnd = itemStart + dims.itemSize;
        const overlap = Math.max(
          0,
          Math.min(indicatorEnd, itemEnd) - Math.max(indicatorStart, itemStart),
        );
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          selectedIndex = index;
        }
      });
      itemImages[selectedIndex].style.opacity = activeItemOpacity;
      return selectedIndex;
    };

    const updatePreviewImage = (index: number) => {
      if (currentImageIndex !== index) {
        currentImageIndex = index;
        const src = itemElements[index]
          .querySelector("img")
          ?.getAttribute("src");
        if (src) previewImage.setAttribute("src", src);
      }
    };

    const animate = () => {
      const lerpFactor = isClickMove ? 0.05 : 0.075;
      currentTranslate = lerp(currentTranslate, targetTranslate, lerpFactor);
      if (Math.abs(currentTranslate - targetTranslate) > 0.01) {
        items.style.transform = isHorizontal
          ? `translateX(${currentTranslate}px)`
          : `translateY(${currentTranslate}px)`;
        updatePreviewImage(getItemInIndicator());
      } else {
        isClickMove = false;
      }
      rafId = requestAnimationFrame(animate);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      isClickMove = false;
      const scrollVelocity = Math.min(Math.max(e.deltaY * 0.5, -20), 20);
      targetTranslate = Math.min(
        Math.max(targetTranslate - scrollVelocity, -maxTranslate),
        0,
      );
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (isHorizontal) touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isHorizontal) return;
      const touchY = e.touches[0].clientY;
      const scrollVelocity = Math.min(
        Math.max((touchStartY - touchY) * 0.5, -20),
        20,
      );
      targetTranslate = Math.min(
        Math.max(targetTranslate - scrollVelocity, -maxTranslate),
        0,
      );
      touchStartY = touchY;
      e.preventDefault();
    };
    root.addEventListener("touchstart", onTouchStart);
    root.addEventListener("touchmove", onTouchMove, { passive: false });

    const clickOffs = itemElements.map((item, index) => {
      const handler = () => {
        isClickMove = true;
        targetTranslate =
          -index * dims.itemSize + (dims.indicatorSize - dims.itemSize) / 2;
        targetTranslate = Math.max(Math.min(targetTranslate, 0), -maxTranslate);
      };
      item.addEventListener("click", handler);
      return () => item.removeEventListener("click", handler);
    });

    const onResize = () => {
      updateDimensions();
      maxTranslate = dims.containerSize - dims.indicatorSize;
      targetTranslate = Math.min(Math.max(targetTranslate, -maxTranslate), 0);
      currentTranslate = targetTranslate;
      items.style.transform = isHorizontal
        ? `translateX(${currentTranslate}px)`
        : `translateY(${currentTranslate}px)`;
    };
    window.addEventListener("resize", onResize);

    itemImages[0].style.opacity = activeItemOpacity;
    updatePreviewImage(0);
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      for (const off of clickOffs) off();
    };
  }, [images]);

  return (
    <div
      className={className ? `msc-root ${className}` : "msc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <nav className="msc-nav">
        <p>{brand}</p>
        <p>Menu</p>
      </nav>

      <div className="msc-site-info">
        <p>{code}</p>
        <p>
          <span>{label}</span>
        </p>
      </div>

      <div className="msc-preview">
        <img alt="Selected frame" draggable={false} src={images[0]} />
      </div>

      <div className="msc-minimap">
        <div className="msc-indicator" />
        <div className="msc-items">
          {images.map((src, i) => (
            <div className="msc-item" key={src}>
              <img alt={`Frame ${i + 1}`} draggable={false} src={src} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..900&display=swap");

.msc-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f1efe7;
  color: #000;
  font-family: "DM Sans", sans-serif;
}

.msc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s;
  user-select: none;
}

.msc-root p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}

.msc-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
}

.msc-site-info {
  position: absolute;
  top: 50%;
  left: 1.5em;
  display: flex;
  gap: 4px;
  z-index: 3;
}

.msc-site-info p span {
  color: #9a9994;
}

.msc-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 75%;
  overflow: hidden;
}

.msc-preview img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.msc-minimap {
  position: absolute;
  top: 50%;
  right: 8em;
  width: 80px;
  z-index: 2;
}

.msc-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  border: 1px solid #000;
  z-index: 2;
}

.msc-items {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.msc-item {
  width: 100%;
  height: 60px;
  padding: 5px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .msc-root {
    touch-action: none;
  }

  .msc-site-info {
    top: 1.5em;
    left: 50%;
    transform: translateX(-50%);
  }

  .msc-minimap {
    top: auto;
    right: auto;
    bottom: 5em;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    height: 80px;
    touch-action: none;
  }

  .msc-indicator {
    top: 0;
    left: 0;
    width: 60px;
    height: 100%;
  }

  .msc-items {
    flex-direction: row;
    width: max-content;
    height: 100%;
    touch-action: none;
  }

  .msc-item {
    width: 60px;
    height: 100%;
    padding: 5px;
  }

  .msc-preview {
    top: 45%;
    width: 75%;
    height: 50%;
  }
}
`;
