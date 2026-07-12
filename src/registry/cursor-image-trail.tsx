"use client";

/**
 * Cursor Image Trail - a hero that spawns a trail of images behind a fast
 * pointer. Once the cursor travels far enough inside the frame, an image is
 * dropped at the interpolated position and slides to the live one, revealed by
 * ten horizontal mask layers that clip open from the center out, then collapse
 * and fade as each image ages out. Desktop only, no dependencies.
 *
 * Fills its container, so it fits a bounded stage or a full-viewport slot.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/cursor-image-trail";

export interface CursorImageTrailProps {
  images?: string[];
  heroImage?: string;
  captionTop?: string;
  captionBottom?: string;
  className?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 20 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpeg`,
);

export default function CursorImageTrail({
  images = DEFAULT_IMAGES,
  heroImage = `${ASSET_BASE}/hero.jpg`,
  captionTop = "[ The Future Moves in Frames ]",
  captionBottom = "Experiment 457 by BLANK",
  className,
}: CursorImageTrailProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const trailContainer = root.querySelector<HTMLElement>(
      ".cit-trail-container",
    );
    if (!trailContainer) return;

    const config = {
      imageLifespan: 1000,
      mouseThreshold: 150,
      inDuration: 750,
      outDuration: 1000,
      staggerIn: 100,
      staggerOut: 25,
      slideDuration: 1000,
      slideEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      easing: "cubic-bezier(0.87, 0, 0.13, 1)",
    };

    const imageCount = images.length;
    const trail: Array<{
      element: HTMLElement;
      maskLayers: HTMLElement[];
      imageLayers: HTMLElement[];
      removeTime: number;
    }> = [];

    let currentImageIndex = 0;
    const mousePos = { x: 0, y: 0 };
    const lastMousePos = { x: 0, y: 0 };
    const interp = { x: 0, y: 0 };
    let isDesktop = window.innerWidth > 1000;
    let rafId = 0;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
    const distance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.hypot(x2 - x1, y2 - y1);

    const isInContainer = (x: number, y: number) => {
      const rect = trailContainer.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    };

    const createTrailImage = () => {
      const imgContainer = document.createElement("div");
      imgContainer.classList.add("cit-trail-img");

      const imgSrc = images[currentImageIndex];
      currentImageIndex = (currentImageIndex + 1) % imageCount;

      const rect = trailContainer.getBoundingClientRect();
      const startX = interp.x - rect.left - 87.5;
      const startY = interp.y - rect.top - 87.5;
      const targetX = mousePos.x - rect.left - 87.5;
      const targetY = mousePos.y - rect.top - 87.5;

      imgContainer.style.left = `${startX}px`;
      imgContainer.style.top = `${startY}px`;
      imgContainer.style.transition = `left ${config.slideDuration}ms ${config.slideEasing}, top ${config.slideDuration}ms ${config.slideEasing}`;

      const maskLayers: HTMLElement[] = [];
      const imageLayers: HTMLElement[] = [];
      for (let i = 0; i < 10; i++) {
        const layer = document.createElement("div");
        layer.classList.add("cit-mask-layer");
        const imageLayer = document.createElement("div");
        imageLayer.classList.add("cit-image-layer");
        imageLayer.style.backgroundImage = `url(${imgSrc})`;

        const sY = i * 10;
        const eY = (i + 1) * 10;
        layer.style.clipPath = `polygon(50% ${sY}%, 50% ${sY}%, 50% ${eY}%, 50% ${eY}%)`;
        layer.style.transition = `clip-path ${config.inDuration}ms ${config.easing}`;
        layer.style.transform = "translateZ(0)";
        layer.style.backfaceVisibility = "hidden";

        layer.appendChild(imageLayer);
        imgContainer.appendChild(layer);
        maskLayers.push(layer);
        imageLayers.push(imageLayer);
      }

      trailContainer.appendChild(imgContainer);

      requestAnimationFrame(() => {
        imgContainer.style.left = `${targetX}px`;
        imgContainer.style.top = `${targetY}px`;
        maskLayers.forEach((layer, i) => {
          const sY = i * 10;
          const eY = (i + 1) * 10;
          const delay = Math.abs(i - 4.5) * config.staggerIn;
          setTimeout(() => {
            layer.style.clipPath = `polygon(0% ${sY}%, 100% ${sY}%, 100% ${eY}%, 0% ${eY}%)`;
          }, delay);
        });
      });

      trail.push({
        element: imgContainer,
        maskLayers,
        imageLayers,
        removeTime: Date.now() + config.imageLifespan,
      });
    };

    const removeOldImages = () => {
      const now = Date.now();
      if (trail.length === 0) return;
      if (now < trail[0].removeTime) return;
      const item = trail.shift();
      if (!item) return;

      item.maskLayers.forEach((layer, i) => {
        const sY = i * 10;
        const eY = (i + 1) * 10;
        const delay = (4.5 - Math.abs(i - 4.5)) * config.staggerOut;
        layer.style.transition = `clip-path ${config.outDuration}ms ${config.easing}`;
        setTimeout(() => {
          layer.style.clipPath = `polygon(50% ${sY}%, 50% ${sY}%, 50% ${eY}%, 50% ${eY}%)`;
        }, delay);
      });
      for (const imageLayer of item.imageLayers) {
        imageLayer.style.transition = `opacity ${config.outDuration}ms ${config.easing}`;
        imageLayer.style.opacity = "0.25";
      }
      setTimeout(() => {
        item.element.parentNode?.removeChild(item.element);
      }, config.outDuration + 112);
    };

    const render = () => {
      if (!isDesktop) return;
      const d = distance(
        mousePos.x,
        mousePos.y,
        lastMousePos.x,
        lastMousePos.y,
      );
      interp.x = lerp(interp.x || mousePos.x, mousePos.x, 0.1);
      interp.y = lerp(interp.y || mousePos.y, mousePos.y, 0.1);
      if (d > config.mouseThreshold && isInContainer(mousePos.x, mousePos.y)) {
        createTrailImage();
        lastMousePos.x = mousePos.x;
        lastMousePos.y = mousePos.y;
      }
      removeOldImages();
      rafId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    const startAnimation = () => {
      if (!isDesktop) return;
      document.addEventListener("mousemove", handleMouseMove);
      rafId = requestAnimationFrame(render);
    };

    const stopAnimation = () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", handleMouseMove);
      for (const item of trail)
        item.element.parentNode?.removeChild(item.element);
      trail.length = 0;
    };

    const handleResize = () => {
      const wasDesktop = isDesktop;
      isDesktop = window.innerWidth > 1000;
      if (isDesktop && !wasDesktop) startAnimation();
      else if (!isDesktop && wasDesktop) stopAnimation();
    };
    window.addEventListener("resize", handleResize);

    startAnimation();

    return () => {
      stopAnimation();
      window.removeEventListener("resize", handleResize);
    };
  }, [images]);

  return (
    <div
      className={className ? `cit-hero ${className}` : "cit-hero"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="cit-hero-img">
        <img alt="" draggable={false} src={heroImage} />
      </div>
      <p>{captionTop}</p>
      <p>{captionBottom}</p>
      <div className="cit-trail-container" />
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap");

.cit-hero {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #101010;
  font-family: "IBM Plex Mono", monospace;
}

.cit-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cit-hero p {
  margin: 0;
  color: #4e4e4e;
  text-transform: uppercase;
  font-size: 0.85rem;
  z-index: 1;
}

.cit-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.2;
}

.cit-trail-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.cit-trail-img {
  position: absolute;
  width: 175px;
  height: 175px;
  pointer-events: none;
}

.cit-mask-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  will-change: clip-path;
}

.cit-image-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
`;
