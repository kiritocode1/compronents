"use client";

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

interface GridBlock {
  element: HTMLDivElement;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  highlightEndTime: number;
  isEmpty: boolean;
  shouldScramble: boolean;
  scrambleInterval: ReturnType<typeof setInterval> | null;
}

const ASSET_BASE = "https://compronents.dev/assets/grid-scramble-hover";
const DEFAULT_SYMBOLS = ["O", "X", "*", ">", "$", "W"];

export default function GridScrambleHover({
  image = `${ASSET_BASE}/img.jpg`,
  symbols = DEFAULT_SYMBOLS,
  background = "#101010",
  textColor = "#d3d3d3",
  activeColor = "#ff3831",
  blockSize = 25,
  detectionRadius = 50,
  clusterSize = 7,
  blockLifetime = 900,
}: GridScrambleHoverProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let blocks: GridBlock[] = [];
    let animationFrame = 0;

    const getRandomSymbol = () =>
      symbols[Math.floor(Math.random() * symbols.length)] ?? "*";

    const removeGrid = () => {
      for (const block of blocks) {
        if (block.scrambleInterval) clearInterval(block.scrambleInterval);
      }
      blocks = [];
      stage.querySelector(".gsh-grid-overlay")?.remove();
    };

    const activate = (block: GridBlock, endTime: number) => {
      block.element.classList.add("active");
      block.highlightEndTime = endTime;

      if (block.shouldScramble && !block.scrambleInterval) {
        block.scrambleInterval = setInterval(() => {
          block.element.textContent = getRandomSymbol();
        }, 150);
      }
    };

    const buildGrid = () => {
      removeGrid();

      const width = stage.offsetWidth;
      const height = stage.offsetHeight;
      if (!width || !height) return;

      const gridOverlay = document.createElement("div");
      gridOverlay.className = "gsh-grid-overlay";
      const cols = Math.ceil(width / blockSize);
      const rows = Math.ceil(height / blockSize);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const element = document.createElement("div");
          const isEmpty = Math.random() < 0.3;

          element.className = "gsh-grid-block";
          element.textContent = isEmpty ? "" : getRandomSymbol();
          element.style.width = `${blockSize}px`;
          element.style.height = `${blockSize}px`;
          element.style.left = `${col * blockSize}px`;
          element.style.top = `${row * blockSize}px`;
          gridOverlay.appendChild(element);

          blocks.push({
            element,
            x: col * blockSize + blockSize / 2,
            y: row * blockSize + blockSize / 2,
            gridX: col,
            gridY: row,
            highlightEndTime: 0,
            isEmpty,
            shouldScramble: !isEmpty && Math.random() < 0.25,
            scrambleInterval: null,
          });
        }
      }

      stage.appendChild(gridOverlay);
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      let closestBlock: GridBlock | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const block of blocks) {
        const dx = mouseX - block.x;
        const dy = mouseY - block.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestBlock = block;
        }
      }

      if (!closestBlock || closestDistance > detectionRadius) return;

      const currentTime = Date.now();
      activate(closestBlock, currentTime + blockLifetime);

      const activeBlocks = [closestBlock];
      let currentBlock = closestBlock;
      const clusterCount = Math.floor(Math.random() * clusterSize) + 1;

      for (let index = 0; index < clusterCount; index++) {
        const neighbors = blocks.filter((neighbor) => {
          if (activeBlocks.includes(neighbor)) return false;

          return (
            Math.abs(neighbor.gridX - currentBlock.gridX) <= 1 &&
            Math.abs(neighbor.gridY - currentBlock.gridY) <= 1
          );
        });
        const nextBlock =
          neighbors[Math.floor(Math.random() * neighbors.length)];
        if (!nextBlock) break;

        activate(nextBlock, currentTime + blockLifetime + index * 10);
        activeBlocks.push(nextBlock);
        currentBlock = nextBlock;
      }
    };

    const updateHighlights = () => {
      const currentTime = Date.now();

      for (const block of blocks) {
        if (
          block.highlightEndTime > 0 &&
          currentTime > block.highlightEndTime
        ) {
          block.element.classList.remove("active");
          block.highlightEndTime = 0;

          if (block.scrambleInterval) {
            clearInterval(block.scrambleInterval);
            block.scrambleInterval = null;
            if (!block.isEmpty) block.element.textContent = getRandomSymbol();
          }
        }
      }

      animationFrame = requestAnimationFrame(updateHighlights);
    };

    buildGrid();
    const resizeObserver = new ResizeObserver(buildGrid);
    resizeObserver.observe(stage);
    stage.addEventListener("mousemove", onMouseMove);
    animationFrame = requestAnimationFrame(updateHighlights);

    return () => {
      resizeObserver.disconnect();
      stage.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrame);
      removeGrid();
    };
  }, [blockLifetime, blockSize, clusterSize, detectionRadius, symbols]);

  return (
    <section
      className="gsh-root"
      style={
        {
          "--gsh-background": background,
          "--gsh-text": textColor,
          "--gsh-active": activeColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="gsh-hero">
        <div className="gsh-stage" ref={stageRef}>
          <img src={image} alt="" draggable={false} />
        </div>
      </div>
    </section>
  );
}

const styles = `
.gsh-root {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--gsh-background);
}

.gsh-hero {
  display: flex;
  min-height: 100svh;
  align-items: flex-start;
  padding: 4svh 0 6svh 6vw;
}

.gsh-stage {
  position: relative;
  width: 82.4vw;
  height: 90svh;
  overflow: hidden;
}

.gsh-stage::after {
  position: absolute;
  z-index: 1;
  inset: 0;
  content: "";
  pointer-events: none;
  background: rgb(0 0 0 / 0.52);
}

.gsh-stage img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gsh-grid-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.gsh-grid-block {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gsh-text);
  font-family: "IBM Plex Mono", "Geist Mono", monospace;
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1;
  opacity: 0.22;
}

.gsh-grid-block.active {
  background: rgb(0 0 0 / 0.58);
  color: var(--gsh-active);
  opacity: 1;
}
`;
