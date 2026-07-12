"use client";

/**
 * Filter Scrub Gallery - a horizontal wall of tall image cards you pan by moving
 * the pointer: cursor position maps to a lerped horizontal offset, so the strip
 * glides left as you move right. A column of category filters expands the
 * matching cards from a thin sliver to full width with a custom "hop" ease and
 * collapses the rest, re-measuring the track so the scrub range stays correct.
 * GSAP + CustomEase, no other dependencies.
 *
 * Sizes to its container, so it fits a bounded stage or a full-viewport slot.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/filter-scrub-gallery";

export interface GalleryFilter {
  label: string;
  items: number[];
}

export interface FilterScrubGalleryProps {
  brand?: string;
  navLinks?: string[];
  filters?: GalleryFilter[];
  images?: string[];
  className?: string;
}

const DEFAULT_FILTERS: GalleryFilter[] = [
  { label: "featured", items: [1, 3, 7, 16, 19, 25, 33, 39, 42, 45, 50] },
  { label: "branding", items: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46] },
  { label: "marketing", items: [2, 3, 7, 12, 17, 22, 27, 32, 37, 42, 47] },
  { label: "website", items: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48] },
  { label: "content", items: [1, 2, 4, 9, 14, 19, 24, 29, 34, 39, 44, 49] },
  { label: "ecommerce", items: [3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] },
];

const DEFAULT_IMAGES = Array.from(
  { length: 50 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

// Deterministic card height (150-225px) so server and client render alike.
const cardHeight = (i: number) => 150 + ((i * 37) % 76);

export default function FilterScrubGallery({
  brand = "BLANK",
  navLinks = ["Services", "Work", "Contact"],
  filters = DEFAULT_FILTERS,
  images = DEFAULT_IMAGES,
  className,
}: FilterScrubGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "fsg-hop",
      "M0,0 C0.053,0.604 0.157,0.72 0.293,0.837 0.435,0.959 0.633,1 1,1",
    );

    const track = root.querySelector<HTMLElement>(".fsg-items");
    const buttons = root.querySelectorAll<HTMLButtonElement>(
      ".fsg-filters button",
    );
    if (!track) return;

    let itemsWidth = track.scrollWidth;
    let currentX = 0;
    let targetX = 0;
    const lerpFactor = 0.025;
    let rafId = 0;

    const containerWidth = () => root.clientWidth;

    const updateItemsWidth = () => {
      itemsWidth = track.scrollWidth;
    };

    const resetPosition = () => {
      gsap.to(track, { x: 0, ease: "power2.out", duration: 0.5 });
      currentX = 0;
      targetX = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const maxScroll = itemsWidth - containerWidth();
      const percentage = mouseX / containerWidth();
      targetX = -maxScroll * percentage;
    };

    const applyMouseMoveEffect = () => {
      track.removeEventListener("mousemove", handleMouseMove);
      if (itemsWidth > containerWidth()) {
        track.addEventListener("mousemove", handleMouseMove);
      }
    };

    const filterItems = (filter: string) => {
      for (const item of root.querySelectorAll<HTMLElement>(".fsg-item")) {
        const cats = (item.dataset.cats ?? "").split(" ");
        const isHidden = getComputedStyle(item).display === "none";
        if (cats.includes(filter)) {
          if (isHidden) {
            gsap.set(item, { display: "flex", width: "25px" });
            gsap.to(item, {
              width: "250px",
              ease: "fsg-hop",
              duration: 1,
              onComplete: updateItemsWidth,
            });
          }
        } else {
          gsap.set(item, { display: "none", width: "0px" });
        }
      }
      resetPosition();
      window.setTimeout(() => {
        updateItemsWidth();
        applyMouseMoveEffect();
      }, 1000);
    };

    const onClicks: Array<() => void> = [];
    for (const button of buttons) {
      const handler = () => {
        for (const btn of buttons) btn.classList.remove("active");
        button.classList.add("active");
        filterItems(button.dataset.filter ?? "");
      };
      button.addEventListener("click", handler);
      onClicks.push(() => button.removeEventListener("click", handler));
    }

    const animate = () => {
      currentX += (targetX - currentX) * lerpFactor;
      gsap.set(track, { x: currentX });
      rafId = requestAnimationFrame(animate);
    };
    animate();

    updateItemsWidth();
    applyMouseMoveEffect();
    filterItems(filters[0]?.label ?? "");

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("mousemove", handleMouseMove);
      for (const off of onClicks) off();
    };
  }, [filters]);

  const catsFor = (index: number) =>
    filters
      .filter((f) => f.items.includes(index))
      .map((f) => f.label)
      .join(" ");

  return (
    <div
      className={className ? `fsg-root ${className}` : "fsg-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <nav className="fsg-nav">
        <div className="fsg-nav-items">
          <a href="#top">{brand}</a>
        </div>
        <div className="fsg-nav-items">
          {navLinks.map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
        </div>
        <div className="fsg-nav-items">
          <a href="#top">Press for ?</a>
        </div>
      </nav>

      <div className="fsg-filters">
        {filters.map((filter, i) => (
          <button
            className={i === 0 ? "active" : undefined}
            data-filter={filter.label}
            key={filter.label}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="fsg-items">
        {images.map((src, i) => (
          <div
            className="fsg-item"
            data-cats={catsFor(i + 1)}
            key={src}
            style={{ height: `${cardHeight(i + 1)}px` }}
          >
            <img alt={`Project ${i + 1}`} draggable={false} src={src} />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap");

.fsg-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: "DM Mono", monospace;
}

.fsg-nav {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  padding: 2em;
  display: flex;
}

.fsg-root a {
  text-decoration: none;
  text-transform: uppercase;
  color: #000;
  font-size: 12px;
}

.fsg-nav-items {
  flex: 1;
}
.fsg-nav-items:nth-child(2) {
  display: flex;
  justify-content: center;
  gap: 2em;
}
.fsg-nav-items:nth-child(3) {
  display: flex;
  justify-content: flex-end;
}

.fsg-filters {
  position: absolute;
  top: 10%;
  right: 0;
  z-index: 3;
  margin: 1em;
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5em;
}

.fsg-filters button {
  width: max-content;
  border: none;
  outline: none;
  padding: 0.5em 1em;
  background-color: #e3e3e3;
  font-family: "DM Mono", monospace;
  font-size: 12px;
  text-transform: uppercase;
  cursor: pointer;
}

.fsg-filters button.active {
  background-color: #000;
  color: #fff;
}

.fsg-items {
  position: absolute;
  top: 65%;
  left: 0;
  transform: translateY(-50%);
  padding: 0.5em;
  display: flex;
  gap: 0.5em;
  will-change: transform;
}

.fsg-item {
  width: 250px;
  padding-top: 25px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #000;
  overflow: hidden;
  will-change: width;
}

.fsg-item img {
  width: 75px;
  height: auto;
  object-fit: cover;
}
`;
