"use client";

/**
 * Infinite Drag Canvas - a grid you can throw in any direction that never runs
 * out. Tiles are keyed by their column and row, built as the viewport
 * approaches them and destroyed once it passes, with the buffer biased toward
 * the direction of travel so a fast fling still arrives on populated space.
 * Release keeps the last measured velocity and coasts. Clicking a tile hides
 * the original, spawns a free copy at its exact screen box, and grows it to a
 * centered plate over a cover layer, so the expand starts from where you
 * clicked rather than the middle.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/infinite-drag-canvas";

export interface InfiniteDragCanvasProps {
  brand?: string;
  navLinks?: string[];
  socials?: string[];
  footerLeft?: string;
  footerRight?: string;
  titles?: string[];
  images?: string[];
  itemWidth?: number;
  itemHeight?: number;
  itemGap?: number;
  columns?: number;
}

const DEFAULT_TITLES = [
  "Chromatic Loopscape",
  "Solar Bloom",
  "Neon Handscape",
  "Echo Discs",
  "Void Gaze",
  "Gravity Sync",
  "Heat Core",
  "Fractal Mirage",
  "Nova Pulse",
  "Sonic Horizon",
  "Dream Circuit",
  "Lunar Mesh",
  "Radiant Dusk",
  "Pixel Drift",
  "Vortex Bloom",
  "Shadow Static",
  "Crimson Phase",
  "Retro Cascade",
  "Photon Fold",
  "Zenith Flow",
];

const DEFAULT_IMAGES = Array.from(
  { length: 20 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function InfiniteDragCanvas({
  brand = "BLANK",
  navLinks = ["About", "Contact"],
  socials = ["FB", "IG", "YT"],
  footerLeft = "Experiment 445",
  footerRight = "Drag to explore",
  titles = DEFAULT_TITLES,
  images = DEFAULT_IMAGES,
  itemWidth = 120,
  itemHeight = 160,
  itemGap = 150,
  columns = 4,
}: InfiniteDragCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!images.length) return;
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("idc-hop", "0.9, 0, 0.1, 1");

    const container = root.querySelector<HTMLElement>(".idc-container");
    const canvas = root.querySelector<HTMLElement>(".idc-canvas");
    const overlay = root.querySelector<HTMLElement>(".idc-overlay");
    const projectTitleElement = root.querySelector<HTMLElement>(
      ".idc-project-title p",
    );
    if (!container || !canvas || !overlay || !projectTitleElement) return;

    const rootEl = root;
    const containerEl = container;
    const canvasEl = canvas;
    const overlayEl = overlay;
    const titleEl = projectTitleElement;

    const itemCount = images.length;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let lastDragTime = 0;
    let mouseHasMoved = false;
    const visibleItems = new Set<string>();
    let lastUpdateTime = 0;
    let lastX = 0;
    let lastY = 0;
    let isExpanded = false;
    let activeItem: HTMLElement | null = null;
    let canDrag = true;
    let originalPosition: { id: string; rect: DOMRect } | null = null;
    let expandedItem: HTMLElement | null = null;
    let activeItemId: string | null = null;
    let titleSplit: SplitText | null = null;
    let frame = 0;

    const frameWidth = () => rootEl.clientWidth;
    const frameHeight = () => rootEl.clientHeight;

    const setAndAnimateTitle = (title: string) => {
      titleSplit?.revert();
      titleEl.textContent = title;
      titleSplit = new SplitText(titleEl, {
        type: "words",
        wordsClass: "idc-word",
      });
      gsap.set(titleSplit.words, { y: "100%" });
    };

    const animateTitleIn = () => {
      if (!titleSplit) return;
      gsap.to(titleSplit.words, {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });
    };

    const animateTitleOut = () => {
      if (!titleSplit) return;
      gsap.to(titleSplit.words, {
        y: "-100%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });
    };

    const updateVisibleItems = () => {
      const buffer = 2.5;
      const viewWidth = frameWidth() * (1 + buffer);
      const viewHeight = frameHeight() * (1 + buffer);
      const movingRight = targetX > currentX;
      const movingDown = targetY > currentY;
      const directionBufferX = movingRight ? -300 : 300;
      const directionBufferY = movingDown ? -300 : 300;

      const startCol = Math.floor(
        (-currentX - viewWidth / 2 + (movingRight ? directionBufferX : 0)) /
          (itemWidth + itemGap),
      );
      const endCol = Math.ceil(
        (-currentX + viewWidth * 1.5 + (!movingRight ? directionBufferX : 0)) /
          (itemWidth + itemGap),
      );
      const startRow = Math.floor(
        (-currentY - viewHeight / 2 + (movingDown ? directionBufferY : 0)) /
          (itemHeight + itemGap),
      );
      const endRow = Math.ceil(
        (-currentY + viewHeight * 1.5 + (!movingDown ? directionBufferY : 0)) /
          (itemHeight + itemGap),
      );

      const currentItems = new Set<string>();

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const itemId = `${col},${row}`;
          currentItems.add(itemId);

          if (visibleItems.has(itemId)) continue;
          if (activeItemId === itemId && isExpanded) continue;

          const item = document.createElement("div");
          item.className = "idc-item";
          item.dataset.itemId = itemId;
          item.style.left = `${col * (itemWidth + itemGap)}px`;
          item.style.top = `${row * (itemHeight + itemGap)}px`;

          const itemNum = Math.abs(row * columns + col) % itemCount;
          item.dataset.itemNum = `${itemNum}`;

          const img = document.createElement("img");
          img.src = images[itemNum];
          img.alt = titles[itemNum % titles.length] ?? "";
          item.appendChild(img);

          item.addEventListener("click", () => {
            if (mouseHasMoved || isDragging) return;
            if (isExpanded) {
              if (expandedItem) closeExpandedItem();
            } else {
              expandItem(item);
            }
          });

          canvasEl.appendChild(item);
          visibleItems.add(itemId);
        }
      }

      for (const itemId of visibleItems) {
        if (
          !currentItems.has(itemId) ||
          (activeItemId === itemId && isExpanded)
        ) {
          const item = canvasEl.querySelector<HTMLElement>(
            `[data-item-id="${itemId}"]`,
          );
          item?.remove();
          visibleItems.delete(itemId);
        }
      }
    };

    function expandItem(item: HTMLElement) {
      isExpanded = true;
      activeItem = item;
      activeItemId = item.dataset.itemId ?? null;
      canDrag = false;
      containerEl.style.cursor = "auto";

      const itemNum = Number.parseInt(item.dataset.itemNum ?? "0", 10);
      setAndAnimateTitle(titles[itemNum % titles.length] ?? "");
      item.style.visibility = "hidden";

      const rect = item.getBoundingClientRect();
      const rootRect = rootEl.getBoundingClientRect();
      const targetImg = item.querySelector("img")?.src ?? "";

      originalPosition = { id: activeItemId ?? "", rect };

      overlayEl.classList.add("idc-active");

      expandedItem = document.createElement("div");
      expandedItem.className = "idc-expanded-item";
      expandedItem.style.width = `${itemWidth}px`;
      expandedItem.style.height = `${itemHeight}px`;

      const img = document.createElement("img");
      img.src = targetImg;
      img.alt = "";
      expandedItem.appendChild(img);
      expandedItem.addEventListener("click", closeExpandedItem);
      rootEl.appendChild(expandedItem);

      for (const el of Array.from(
        canvasEl.querySelectorAll<HTMLElement>(".idc-item"),
      )) {
        if (el !== activeItem) {
          gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.out" });
        }
      }

      const targetWidth = frameWidth() * 0.4;
      const targetHeight = targetWidth * 1.2;

      gsap.delayedCall(0.5, animateTitleIn);

      gsap.fromTo(
        expandedItem,
        {
          width: itemWidth,
          height: itemHeight,
          x: rect.left - rootRect.left + itemWidth / 2 - frameWidth() / 2,
          y: rect.top - rootRect.top + itemHeight / 2 - frameHeight() / 2,
        },
        {
          width: targetWidth,
          height: targetHeight,
          x: 0,
          y: 0,
          duration: 1,
          ease: "idc-hop",
        },
      );
    }

    function closeExpandedItem() {
      if (!expandedItem || !originalPosition) return;

      animateTitleOut();
      overlayEl.classList.remove("idc-active");
      const originalRect = originalPosition.rect;
      const rootRect = rootEl.getBoundingClientRect();

      for (const el of Array.from(
        canvasEl.querySelectorAll<HTMLElement>(".idc-item"),
      )) {
        if (el.dataset.itemId !== activeItemId) {
          gsap.to(el, {
            opacity: 1,
            duration: 0.5,
            delay: 0.5,
            ease: "power2.out",
          });
        }
      }

      const originalItem = canvasEl.querySelector<HTMLElement>(
        `[data-item-id="${activeItemId}"]`,
      );
      const closing = expandedItem;

      gsap.to(closing, {
        width: itemWidth,
        height: itemHeight,
        x: originalRect.left - rootRect.left + itemWidth / 2 - frameWidth() / 2,
        y: originalRect.top - rootRect.top + itemHeight / 2 - frameHeight() / 2,
        duration: 1,
        ease: "idc-hop",
        onComplete: () => {
          closing.remove();

          if (originalItem) originalItem.style.visibility = "visible";

          expandedItem = null;
          isExpanded = false;
          activeItem = null;
          originalPosition = null;
          activeItemId = null;
          canDrag = true;
          containerEl.style.cursor = "grab";
          dragVelocityX = 0;
          dragVelocityY = 0;
        },
      });
    }

    const animate = () => {
      if (canDrag) {
        const ease = 0.075;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;

        canvasEl.style.transform = `translate(${currentX}px, ${currentY}px)`;

        const now = performance.now();
        const distMoved = Math.sqrt(
          (currentX - lastX) ** 2 + (currentY - lastY) ** 2,
        );

        if (distMoved > 100 || now - lastUpdateTime > 120) {
          updateVisibleItems();
          lastX = currentX;
          lastY = currentY;
          lastUpdateTime = now;
        }
      }

      frame = requestAnimationFrame(animate);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!canDrag) return;
      isDragging = true;
      mouseHasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      containerEl.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !canDrag) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;

      const now = performance.now();
      const dt = Math.max(10, now - lastDragTime);
      lastDragTime = now;

      dragVelocityX = dx / dt;
      dragVelocityY = dy / dt;

      targetX += dx;
      targetY += dy;

      startX = e.clientX;
      startY = e.clientY;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;

      if (canDrag) {
        containerEl.style.cursor = "grab";

        if (Math.abs(dragVelocityX) > 0.1 || Math.abs(dragVelocityY) > 0.1) {
          const momentumFactor = 200;
          targetX += dragVelocityX * momentumFactor;
          targetY += dragVelocityY * momentumFactor;
        }
      }
    };

    const onOverlayClick = () => {
      if (isExpanded) closeExpandedItem();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!canDrag) return;
      isDragging = true;
      mouseHasMoved = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !canDrag) return;

      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) mouseHasMoved = true;

      targetX += dx;
      targetY += dy;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onResize = () => {
      if (isExpanded && expandedItem) {
        const targetWidth = frameWidth() * 0.4;
        gsap.to(expandedItem, {
          width: targetWidth,
          height: targetWidth * 1.2,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        updateVisibleItems();
      }
    };

    containerEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    overlayEl.addEventListener("click", onOverlayClick);
    containerEl.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    updateVisibleItems();
    animate();

    return () => {
      cancelAnimationFrame(frame);
      containerEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      overlayEl.removeEventListener("click", onOverlayClick);
      containerEl.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      titleSplit?.revert();
      expandedItem?.remove();
      canvasEl.replaceChildren();
      visibleItems.clear();
    };
  }, [images, titles, itemWidth, itemHeight, itemGap, columns]);

  return (
    <div className="idc-root" ref={rootRef}>
      <style>{styles}</style>
      <nav className="idc-nav">
        <div className="idc-logo">
          <a href="#top">{brand}</a>
        </div>
        <div className="idc-links">
          {navLinks.map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
          <div className="idc-socials">
            {socials.map((social) => (
              <a href="#top" key={social}>
                {social}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <footer className="idc-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>

      <div className="idc-container">
        <div className="idc-canvas" />
        <div className="idc-overlay" />
      </div>

      <div className="idc-project-title">
        <p />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.idc-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Inter", sans-serif;
  background-color: #e3e3db;
}
.idc-root * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}
.idc-root a,
.idc-root p {
  display: block;
  text-decoration: none;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01rem;
  -webkit-font-smoothing: antialiased;
}
.idc-nav,
.idc-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 1em;
  display: flex;
  justify-content: space-between;
  gap: 2em;
  mix-blend-mode: difference;
  z-index: 10000;
}
.idc-nav { top: 0; }
.idc-footer { bottom: 0; }
.idc-links,
.idc-socials { display: flex; gap: 2em; }
.idc-nav > *,
.idc-links a { flex: 1; }
.idc-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}
.idc-canvas { position: absolute; will-change: transform; }
.idc-item {
  position: absolute;
  width: 120px;
  height: 160px;
  overflow: hidden;
  background-color: #000;
  cursor: pointer;
}
.idc-expanded-item {
  position: absolute;
  z-index: 100;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #e3e3db;
  overflow: hidden;
  cursor: pointer;
}
.idc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.idc-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e3e3db;
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 0;
  z-index: 2;
}
.idc-overlay.idc-active { pointer-events: auto; opacity: 1; }
.idc-project-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  pointer-events: none;
  z-index: 10000;
}
.idc-project-title p {
  position: relative;
  height: 42px;
  color: #fff;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.idc-project-title p .idc-word {
  position: relative;
  display: inline-block;
  font-family: "Inter", sans-serif;
  font-size: 36px;
  letter-spacing: -0.02rem;
  margin-right: 0.1em;
  transform: translateY(0%);
  will-change: transform;
}
`;
