"use client";

/**
 * Carousel Disc Scroll - a hundred and fifty thumbnails arranged around a
 * single disc that is tilted fifty five degrees away from you and turned a full
 * revolution as you scroll. Every tile is rotated about a transform origin four
 * hundred pixels below itself, so one CSS property places it on the circle
 * without any trigonometry: the ring is the origin offset, not computed
 * coordinates. Pointer position tilts the whole disc a couple of degrees on
 * both axes, and hovering a tile lifts it ten pixels out of the plane and
 * pushes its image into the fixed preview frame at the centre.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/carousel-disc-scroll";

export interface CarouselDiscScrollProps {
  images?: string[];
  /** Tiles placed around the disc. */
  itemCount?: number;
  navLeft?: string;
  navRight?: string;
  footerLeft?: string;
  footerRight?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function CarouselDiscScroll({
  images = DEFAULT_IMAGES,
  itemCount = 150,
  navLeft = "BLANK / 14 04 2026",
  navRight = "Components  Pages  Backend",
  footerLeft = "Interface studies",
  footerRight = "aryank.space",
  embedded = true,
}: CarouselDiscScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const gallery = root.querySelector<HTMLElement>(".cds-gallery");
    const previewImage = root.querySelector<HTMLImageElement>(
      ".cds-preview-img img",
    );
    const scrollerEl = root.querySelector<HTMLElement>(".cds-scroller");
    const content = root.querySelector<HTMLElement>(".cds-content");
    if (!gallery || !previewImage || !scrollerEl || !content) return;

    const scroller = embedded ? scrollerEl : undefined;

    const onMouseMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const percentX =
        (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const percentY =
        (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      gsap.to(gallery, {
        duration: 1,
        ease: "power2.out",
        rotateX: 55 + percentY * 2,
        rotateY: percentX * 2,
        overwrite: "auto",
      });
    };
    root.addEventListener("mousemove", onMouseMove);

    const cleanups: (() => void)[] = [];
    const items: HTMLElement[] = [];

    for (let i = 0; i < itemCount; i++) {
      const item = document.createElement("div");
      item.className = "cds-item";
      const img = document.createElement("img");
      img.src = images[i % images.length];
      img.alt = "";
      img.draggable = false;
      item.appendChild(img);
      gallery.appendChild(item);
      items.push(item);
    }

    const angleIncrement = 360 / items.length;

    items.forEach((item, index) => {
      gsap.set(item, {
        rotationY: 90,
        rotationZ: index * angleIncrement - 90,
        transformOrigin: "50% 400px",
      });

      const onOver = () => {
        const imgInsideItem = item.querySelector("img");
        if (imgInsideItem) previewImage.src = imgInsideItem.src;
        gsap.to(item, {
          x: 10,
          z: 10,
          y: 10,
          ease: "power2.out",
          duration: 0.5,
        });
      };
      const onOut = () => {
        previewImage.src = images[0];
        gsap.to(item, { x: 0, y: 0, z: 0, ease: "power2.out", duration: 0.5 });
      };

      item.addEventListener("mouseover", onOver);
      item.addEventListener("mouseout", onOut);
      cleanups.push(() => {
        item.removeEventListener("mouseover", onOver);
        item.removeEventListener("mouseout", onOut);
      });
    });

    const trigger = ScrollTrigger.create({
      trigger: content,
      scroller,
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
      onUpdate: (self) => {
        const rotationProgress = self.progress * 360 * 1;
        items.forEach((item, index) => {
          gsap.to(item, {
            rotationZ: index * angleIncrement - 90 + rotationProgress,
            duration: 1,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      root.removeEventListener("mousemove", onMouseMove);
      for (const cleanup of cleanups) cleanup();
      gsap.killTweensOf(items);
      gsap.killTweensOf(gallery);
      gallery.replaceChildren();
    };
  }, [embedded, images, itemCount]);

  return (
    <div
      className={embedded ? "cds-root cds-embedded" : "cds-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <nav className="cds-nav">
        <p>{navLeft}</p>
        <p>{navRight}</p>
      </nav>
      <footer className="cds-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>

      <div className="cds-preview-img">
        <img alt="" draggable={false} src={images[0]} />
      </div>

      <div className="cds-container">
        <div className="cds-gallery" />
      </div>

      <div className="cds-scroller">
        <div className="cds-content" />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

.cds-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Hanken Grotesk", sans-serif;
  background: #ffffff;
  color: #000;
}

.cds-root * {
  box-sizing: border-box;
}

.cds-scroller {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.cds-root.cds-embedded .cds-scroller {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.cds-root.cds-embedded .cds-scroller::-webkit-scrollbar {
  display: none;
}

.cds-content {
  width: 100%;
  height: 1000svh;
}

.cds-nav,
.cds-footer {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 2em;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  z-index: 4;
  pointer-events: none;
}

.cds-nav p,
.cds-footer p {
  margin: 0;
}

.cds-nav {
  top: 0;
}

.cds-footer {
  bottom: 0;
}

.cds-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  perspective: 1500px;
  z-index: 1;
}

.cds-gallery {
  position: absolute;
  top: 19%;
  left: 49%;
  transform-style: preserve-3d;
  transform: translateX(-50%) rotateX(55deg);
}

.cds-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45px;
  height: 60px;
  background: #b0b0b0;
  margin: 10px;
  transform-style: preserve-3d;
}

.cds-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cds-preview-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 200px;
  overflow: hidden;
  z-index: 0;
}
`;
