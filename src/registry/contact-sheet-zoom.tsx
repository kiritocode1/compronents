"use client";

/**
 * Contact Sheet Zoom - twelve hundred thumbnails laid out as one contact sheet
 * that explodes into a draggable wall. Zooming in does not scale the container:
 * every tile measures its own offset from the centre of the frame, divides it
 * by a hundred, and is pushed out along that vector by 1200 across and 600 down
 * while scaling five times. Because the multipliers differ the sheet fans wider
 * than it does tall, which a plain container scale cannot produce. Dragging
 * lerps the whole sheet toward a target at 0.075 per frame, so it keeps gliding
 * after the pointer stops, and a transparent layer above the tiles owns the
 * pointer so no individual image can start a native drag.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/contact-sheet-zoom";

export interface ContactSheetZoomProps {
  images?: string[];
  brand?: string;
  totalRows?: number;
  imagesPerRow?: number;
  /** Random tile height range, in px. */
  heightRange?: [number, number];
  /** Zoom-in scale applied to every tile. */
  zoomScale?: number;
  /** Horizontal and vertical spread multipliers at full zoom. */
  spread?: [number, number];
}

const DEFAULT_IMAGES = Array.from(
  { length: 50 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function ContactSheetZoom({
  images = DEFAULT_IMAGES,
  brand = "BLANK",
  totalRows = 20,
  imagesPerRow = 60,
  heightRange = [30, 40],
  zoomScale = 5,
  spread = [1200, 600],
}: ContactSheetZoomProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomRef = useRef({ in: () => {}, out: () => {} });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const gallery = root.querySelector<HTMLElement>(".ctz-gallery");
    const dragLayer = root.querySelector<HTMLElement>(".ctz-drag-layer");
    if (!gallery || !dragLayer) return;

    const totalImages = totalRows * imagesPerRow;
    let zoomed = false;
    const tiles: HTMLElement[] = [];

    const getRandomHeight = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < totalImages; i++) {
      const img = document.createElement("div");
      img.className = "ctz-img";
      img.style.height = `${getRandomHeight(heightRange[0], heightRange[1])}px`;

      const imgElement = document.createElement("img");
      imgElement.src = images[Math.floor(Math.random() * images.length)];
      imgElement.alt = "";
      imgElement.draggable = false;
      img.appendChild(imgElement);

      gallery.appendChild(img);
      tiles.push(img);
    }

    gsap.to(tiles, {
      scale: 1,
      delay: 1,
      opacity: 1,
      duration: 0.5,
      stagger: {
        amount: 1.5,
        grid: [totalRows, imagesPerRow],
        from: "random",
      },
      ease: "power1.out",
    });

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    let frame = 0;
    const animate = () => {
      if (
        isDragging ||
        Math.abs(targetX - currentX) > 0.01 ||
        Math.abs(targetY - currentY) > 0.01
      ) {
        currentX = lerp(currentX, targetX, 0.075);
        currentY = lerp(currentY, targetY, 0.075);
        gallery.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    zoomRef.current.in = () => {
      if (zoomed) return;
      zoomed = true;
      dragLayer.style.display = "block";

      // Each tile is pushed along its own vector from the centre of the
      // component's box, not the window, so the fan is centred on the preview.
      const rootRect = root.getBoundingClientRect();
      const centerX = rootRect.left + rootRect.width / 2;
      const centerY = rootRect.top + rootRect.height / 2;

      for (const img of tiles) {
        const rect = img.getBoundingClientRect();
        const distX = (rect.left + rect.width / 2 - centerX) / 100;
        const distY = (rect.top + rect.height / 2 - centerY) / 100;

        gsap.to(img, {
          x: distX * spread[0],
          y: distY * spread[1],
          scale: zoomScale,
          duration: 2.5,
          ease: "power4.inOut",
        });
      }
    };

    zoomRef.current.out = () => {
      if (!zoomed) return;
      zoomed = false;
      dragLayer.style.display = "none";

      const currentTransform = window.getComputedStyle(gallery).transform;
      gsap.set(gallery, { clearProps: "transform" });

      const tl = gsap.timeline({
        defaults: { duration: 2.5, ease: "power4.inOut" },
      });
      tl.fromTo(gallery, { transform: currentTransform }, { x: 0, y: 0 }).to(
        tiles,
        { scale: 1, x: 0, y: 0 },
        0,
      );

      currentX = 0;
      currentY = 0;
      targetX = 0;
      targetY = 0;
      isDragging = false;
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const point =
        e.type === "mousemove"
          ? (e as MouseEvent)
          : (e as TouchEvent).touches[0];
      targetX = initialX + (point.pageX - startX);
      targetY = initialY + (point.pageY - startY);
    };

    const handleDragEnd = () => {
      isDragging = false;
      dragLayer.classList.remove("ctz-active");
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      if (!zoomed) return;
      isDragging = true;
      dragLayer.classList.add("ctz-active");

      const point =
        e.type === "mousedown"
          ? (e as MouseEvent)
          : (e as TouchEvent).touches[0];
      startX = point.pageX;
      startY = point.pageY;

      const matrix = new DOMMatrix(window.getComputedStyle(gallery).transform);
      initialX = matrix.m41;
      initialY = matrix.m42;
      currentX = initialX;
      currentY = initialY;
      targetX = initialX;
      targetY = initialY;

      if (e.type === "mousedown") {
        document.addEventListener("mousemove", handleDragMove, {
          passive: false,
        });
        document.addEventListener("mouseup", handleDragEnd);
      } else {
        document.addEventListener("touchmove", handleDragMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleDragEnd);
      }
    };

    dragLayer.addEventListener("mousedown", handleDragStart);
    dragLayer.addEventListener("touchstart", handleDragStart);

    return () => {
      cancelAnimationFrame(frame);
      dragLayer.removeEventListener("mousedown", handleDragStart);
      dragLayer.removeEventListener("touchstart", handleDragStart);
      handleDragEnd();
      gsap.killTweensOf(tiles);
      gsap.killTweensOf(gallery);
      gallery.replaceChildren();
    };
  }, [images, totalRows, imagesPerRow, heightRange, zoomScale, spread]);

  return (
    <div className="ctz-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="ctz-logo">
        <p>{brand}</p>
      </div>

      <div className="ctz-pads">
        <button
          className={isZoomed ? "" : "ctz-active-btn"}
          onClick={() => {
            zoomRef.current.out();
            setIsZoomed(false);
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            viewBox="0 0 18 18"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 14c3.5899 0 6.5-2.9101 6.5-6.5C14 3.91015 11.0899 1 7.5 1 3.91015 1 1 3.91015 1 7.5 1 11.0899 3.91015 14 7.5 14Z"
              stroke="#fff"
            />
            <path d="M10 7.5H5" stroke="#fff" strokeMiterlimit="10" />
            <path d="M16.9 17 12 12.2" stroke="#fff" />
          </svg>
        </button>
        <button
          className={isZoomed ? "ctz-active-btn" : ""}
          onClick={() => {
            zoomRef.current.in();
            setIsZoomed(true);
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            viewBox="0 0 18 18"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 14c3.5899 0 6.5-2.9101 6.5-6.5C14 3.91015 11.0899 1 7.5 1 3.91015 1 1 3.91015 1 7.5 1 11.0899 3.91015 14 7.5 14Z"
              stroke="#fff"
            />
            <path d="M10 7.5H5M7.5 10V5" stroke="#fff" strokeMiterlimit="10" />
            <path d="M16.9 17 12 12.2" stroke="#fff" />
          </svg>
        </button>
      </div>

      <div className="ctz-drag-layer" />

      <div className="ctz-container">
        <div className="ctz-gallery" />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.ctz-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  color: #000;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.ctz-root * {
  box-sizing: border-box;
}

.ctz-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.ctz-logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20%;
  margin: 2em auto;
  padding: 8px 0;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  z-index: 2;
}

.ctz-logo p {
  margin: 0;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
}

.ctz-pads {
  position: absolute;
  left: 50%;
  bottom: 2em;
  transform: translateX(-50%);
  padding: 0 4px;
  display: flex;
  gap: 0.2em;
  background-color: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.125);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  z-index: 2;
}

.ctz-pads button {
  opacity: 1;
  outline: none;
  border: none;
  background: none;
  padding: 8px;
  transition: 0.5s opacity;
  pointer-events: all;
  cursor: pointer;
}

.ctz-pads button.ctz-active-btn {
  opacity: 0.5;
  pointer-events: none;
}

.ctz-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  overflow: visible;
}

.ctz-gallery {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 4px;
  padding: 4px;
  transform-origin: center center;
  will-change: transform;
}

.ctz-img {
  width: calc((100% - 236px) / 60);
  transform: scale(0);
  transform-origin: center center;
  will-change: transform;
  pointer-events: none;
  opacity: 0;
}

.ctz-drag-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  touch-action: none;
  z-index: 1;
}
`;
