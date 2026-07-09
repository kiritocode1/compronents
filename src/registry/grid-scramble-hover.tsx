"use client";

/**
 * Grid Scramble Hover - a symbol field that wakes around the pointer.
 *
 * The image is covered by a grid of text cells. Moving near a cell lights it
 * up, spills activation to nearby cells, and scrambles selected glyphs.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useRef } from "react";

export interface GridScrambleHoverProps {
  image?: string;
  symbols?: string[];
  background?: string;
  textColor?: string;
  activeColor?: string;
  blockSize?: number;
  detectionRadius?: number;
  clusterSize?: number;
  blockLifetime?: number;
}

interface Block {
  element: HTMLDivElement;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  highlightEnd: number;
  shouldScramble: boolean;
  scrambleInterval: ReturnType<typeof setInterval> | null;
}

const ASSET_BASE = "https://compronents.dev/assets/grid-scramble-hover";

export default function GridScrambleHover({
  image = `${ASSET_BASE}/img.jpg`,
  symbols = ["O", "X", "*", ">", "$", "W"],
  background = "#101010",
  textColor = "#f4f0e8",
  activeColor = "#ff3831",
  blockSize = 25,
  detectionRadius = 50,
  clusterSize = 7,
  blockLifetime = 300,
}: GridScrambleHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let blocks: Block[] = [];
    let frame = 0;

    const randomSymbol = () =>
      symbols[Math.floor(Math.random() * symbols.length)] ?? "*";

    const clear = () => {
      cancelAnimationFrame(frame);
      for (const block of blocks) {
        if (block.scrambleInterval) clearInterval(block.scrambleInterval);
      }
      blocks = [];
      stage.querySelector(".gsh-grid")?.remove();
    };

    const activateBlock = (block: Block, now: number) => {
      block.element.classList.add("active");
      block.highlightEnd = now + blockLifetime;
      if (block.shouldScramble && !block.scrambleInterval) {
        block.scrambleInterval = setInterval(() => {
          block.element.textContent = randomSymbol();
        }, 150);
      }
    };

    const build = () => {
      clear();
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;

      const grid = document.createElement("div");
      grid.className = "gsh-grid";
      stage.appendChild(grid);

      const cols = Math.ceil(width / blockSize);
      const rows = Math.ceil(height / blockSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const block = document.createElement("div");
          block.className = "gsh-block";
          const isEmpty = Math.random() < 0.3;
          block.textContent = isEmpty ? "" : randomSymbol();
          block.style.width = `${blockSize}px`;
          block.style.height = `${blockSize}px`;
          block.style.left = `${col * blockSize}px`;
          block.style.top = `${row * blockSize}px`;
          grid.appendChild(block);
          blocks.push({
            element: block,
            x: col * blockSize + blockSize / 2,
            y: row * blockSize + blockSize / 2,
            gridX: col,
            gridY: row,
            highlightEnd: 0,
            shouldScramble: !isEmpty && Math.random() < 0.25,
            scrambleInterval: null,
          });
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      let closest: Block | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const block of blocks) {
        const distance = Math.hypot(mouseX - block.x, mouseY - block.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = block;
        }
      }

      if (!closest || closestDistance > detectionRadius) return;

      const now = Date.now();
      activateBlock(closest, now);
      const activeBlocks = [closest];
      let current = closest;
      const count = Math.floor(Math.random() * clusterSize) + 1;

      for (let i = 0; i < count; i++) {
        const neighbors = blocks.filter((candidate) => {
          if (activeBlocks.includes(candidate)) return false;
          return (
            Math.abs(candidate.gridX - current.gridX) <= 1 &&
            Math.abs(candidate.gridY - current.gridY) <= 1
          );
        });
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (!next) break;
        activateBlock(next, now);
        activeBlocks.push(next);
        current = next;
      }
    };

    const tick = () => {
      const now = Date.now();
      for (const block of blocks) {
        if (block.highlightEnd && now > block.highlightEnd) {
          block.highlightEnd = 0;
          block.element.classList.remove("active");
          if (block.scrambleInterval) {
            clearInterval(block.scrambleInterval);
            block.scrambleInterval = null;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };

    build();
    const observer = new ResizeObserver(build);
    observer.observe(stage);
    stage.addEventListener("mousemove", onMouseMove);
    frame = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      stage.removeEventListener("mousemove", onMouseMove);
      clear();
    };
  }, [symbols, blockSize, detectionRadius, clusterSize, blockLifetime]);

  return (
    <section
      className="gsh-root"
      ref={rootRef}
      style={
        {
          "--gsh-bg": background,
          "--gsh-text": textColor,
          "--gsh-active": activeColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <header className="gsh-nav">
        <p>Scramble Hover Effect</p>
        <p>Experiment 515</p>
      </header>
      <div className="gsh-stage" ref={stageRef}>
        <img src={image} alt="" draggable={false} />
      </div>
      <footer className="gsh-footer">
        <p>Pointer field</p>
        <p>BLANK</p>
      </footer>
    </section>
  );
}

const styles = `
.gsh-root {
  position: relative;
  width: 100%;
  min-height: 620px;
  overflow: hidden;
  background: var(--gsh-bg);
  color: var(--gsh-text);
  font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
}

.gsh-nav,
.gsh-footer {
  position: absolute;
  left: 0;
  z-index: 5;
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 1.5rem;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.gsh-nav {
  top: 0;
}

.gsh-footer {
  bottom: 0;
}

.gsh-nav p,
.gsh-footer p {
  margin: 0;
}

.gsh-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(52vw, 520px);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  transform: translate(-50%, -50%);
  border: 1px solid rgb(255 255 255 / 0.14);
}

.gsh-stage::after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: rgb(0 0 0 / 0.62);
  opacity: 0;
  transition: opacity 160ms ease;
}

.gsh-stage:hover::after {
  opacity: 1;
}

.gsh-stage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.8) contrast(1.05);
}

.gsh-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.gsh-block {
  position: absolute;
  display: grid;
  place-items: center;
  color: var(--gsh-text);
  font-size: 0.8rem;
  line-height: 1;
  opacity: 0.2;
  transition: color 120ms ease, opacity 120ms ease, background 120ms ease;
}

.gsh-block.active {
  color: var(--gsh-active);
  opacity: 1;
  background: rgb(255 255 255 / 0.08);
}

@media (max-width: 760px) {
  .gsh-stage {
    width: min(76vw, 420px);
  }
}
`;
