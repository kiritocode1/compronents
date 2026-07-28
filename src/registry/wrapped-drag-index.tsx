"use client";

/**
 * Wrapped Drag Index - an endless list built from exactly as many rows as it
 * shows. Nothing is cloned or appended: every row is placed at its index times
 * the row height plus the scroll offset, and a GSAP modifier wraps that value
 * back into a single row-height window, so a row leaving the bottom reappears
 * at the top in the same frame. Scroll velocity is derived by differencing the
 * smoothed offset, then fed straight into scale and rotation, so the rows
 * squash and tilt in proportion to how hard you throw them and settle flat on
 * their own as the interpolation catches up. Wheel and drag both write to one
 * target that is eased at 0.1 a frame.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/wrapped-drag-index";

export interface WrappedDragEntry {
  category: string;
  name: string;
}

export interface WrappedDragIndexProps {
  entries?: WrappedDragEntry[];
  backgroundImage?: string;
  /** Multiplier applied to drag distance. */
  dragSpeed?: number;
  /** Easing factor per frame toward the scroll target. */
  ease?: number;
}

const DEFAULT_ENTRIES: WrappedDragEntry[] = [
  { category: "Cinema", name: "La Strada Nascosta" },
  { category: "Advertising", name: "Echoes in Motion" },
  { category: "Videoclip", name: "Hyperspace" },
  { category: "Cinema", name: "Onda Silenziosa" },
  { category: "Media", name: "Nexus" },
  { category: "Workshop", name: "Between Lines" },
  { category: "Media Kit", name: "The Enigma" },
  { category: "Cinema", name: "Le Stelle Cadenti" },
  { category: "Videoclip", name: "Quantum Pulse" },
  { category: "Advertising", name: "Neon Flow" },
];

export default function WrappedDragIndex({
  entries = DEFAULT_ENTRIES,
  backgroundImage = `${ASSET_BASE}/bg.jpg`,
  dragSpeed = 3,
  ease = 0.1,
}: WrappedDragIndexProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const menuElement = root.querySelector<HTMLElement>(".wdi-menu");
    const menuItemElements =
      root.querySelectorAll<HTMLElement>(".wdi-menu-item");
    if (!menuElement || menuItemElements.length === 0) return;

    let menuItemHeight = menuItemElements[0].clientHeight;
    let totalMenuHeight = menuItemElements.length * menuItemHeight;

    let currentScrollPosition = 0;
    let lastScrollY = 0;
    let smoothScrollY = 0;

    const interpolate = (start: number, end: number, factor: number) =>
      start * (1 - factor) + end * factor;

    const adjustMenuItemsPosition = (scroll: number) => {
      gsap.set(menuItemElements, {
        y: (index: number) => index * menuItemHeight + scroll,
        modifiers: {
          y: (y: string) => {
            const wrappedY = gsap.utils.wrap(
              -menuItemHeight,
              totalMenuHeight - menuItemHeight,
              Number.parseInt(y, 10),
            );
            return `${wrappedY}px`;
          },
        },
      });
    };
    adjustMenuItemsPosition(0);

    const onWheelScroll = (event: WheelEvent) => {
      event.preventDefault();
      currentScrollPosition -= event.deltaY;
    };

    let startY = 0;
    let isDragging = false;

    const pointY = (event: MouseEvent | TouchEvent) =>
      "clientY" in event
        ? (event as MouseEvent).clientY
        : (event as TouchEvent).touches[0].clientY;

    const onDragStart = (event: MouseEvent | TouchEvent) => {
      startY = pointY(event);
      isDragging = true;
      menuElement.classList.add("wdi-is-dragging");
    };

    const onDragMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const currentY = pointY(event);
      currentScrollPosition += (currentY - startY) * dragSpeed;
      startY = currentY;
    };

    const onDragEnd = () => {
      isDragging = false;
      menuElement.classList.remove("wdi-is-dragging");
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      smoothScrollY = interpolate(smoothScrollY, currentScrollPosition, ease);
      adjustMenuItemsPosition(smoothScrollY);

      const scrollSpeed = smoothScrollY - lastScrollY;
      lastScrollY = smoothScrollY;

      gsap.to(menuItemElements, {
        scale: 1 - Math.min(100, Math.abs(scrollSpeed)) * 0.0075,
        rotate: scrollSpeed * 0.2,
      });
    };
    animate();

    // The source listens for the non-standard "mousewheel"; "wheel" is the
    // standard event and is what fires in current browsers.
    menuElement.addEventListener("wheel", onWheelScroll, { passive: false });
    menuElement.addEventListener("touchstart", onDragStart);
    menuElement.addEventListener("touchmove", onDragMove);
    menuElement.addEventListener("touchend", onDragEnd);
    menuElement.addEventListener("mousedown", onDragStart);
    menuElement.addEventListener("mousemove", onDragMove);
    menuElement.addEventListener("mouseleave", onDragEnd);
    menuElement.addEventListener("mouseup", onDragEnd);

    const resize = new ResizeObserver(() => {
      menuItemHeight = menuItemElements[0].clientHeight;
      totalMenuHeight = menuItemElements.length * menuItemHeight;
    });
    resize.observe(menuElement);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      menuElement.removeEventListener("wheel", onWheelScroll);
      menuElement.removeEventListener("touchstart", onDragStart);
      menuElement.removeEventListener("touchmove", onDragMove);
      menuElement.removeEventListener("touchend", onDragEnd);
      menuElement.removeEventListener("mousedown", onDragStart);
      menuElement.removeEventListener("mousemove", onDragMove);
      menuElement.removeEventListener("mouseleave", onDragEnd);
      menuElement.removeEventListener("mouseup", onDragEnd);
      gsap.killTweensOf(menuItemElements);
    };
  }, [entries, dragSpeed, ease]);

  return (
    <div className="wdi-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="wdi-menu">
        <div className="wdi-menu-img">
          <img alt="" draggable={false} src={backgroundImage} />
        </div>
        <ul className="wdi-menu-wrapper">
          {entries.map((entry) => (
            <li className="wdi-menu-item" key={entry.name}>
              <div className="wdi-item-category">
                <p>{entry.category}</p>
              </div>
              <div className="wdi-item-name">
                <p>{entry.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&display=swap");

.wdi-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000000;
  color: #fff;
  overflow: hidden;
  container-type: inline-size;
}

.wdi-root * {
  box-sizing: border-box;
  user-select: none;
}

.wdi-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wdi-menu-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wdi-menu-img::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(0, 0, 0);
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.75) 50%,
    rgba(0, 0, 0, 1) 100%
  );
  z-index: 1;
}

.wdi-menu {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}

.wdi-menu.wdi-is-dragging {
  cursor: grabbing;
}

.wdi-menu-wrapper {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 2;
}

.wdi-menu-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 4em 0;
  display: flex;
  gap: 2em;
}

.wdi-item-category {
  flex: 2;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.wdi-item-name {
  flex: 4;
  display: flex;
  align-items: flex-end;
}

.wdi-root p {
  margin: 0;
}

.wdi-item-category p {
  font-family: "Bebas Neue", sans-serif;
  font-size: 40px;
  text-transform: uppercase;
}

.wdi-item-name p {
  font-family: "Instrument Serif", serif;
  font-size: 7.5cqw;
  line-height: 90%;
}
`;
