"use client";

/**
 * Flip Tile Board - one photograph cut across a six by six grid of tiles, with
 * a second photograph on their backs. Each tile carries the same background
 * sized six hundred percent and offset by its own column and row, so the grid
 * reassembles a single image rather than showing thirty six copies. Hovering a
 * tile spins it three quarters of a turn and back while yawing it sideways, and
 * the yaw is picked from the tile's column so the row splays outward from the
 * centre. A one second per-tile cooldown stops a fast sweep retriggering. Over
 * the top, a grid of fifty pixel cells lights its border under the cursor.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/flip-tile-board";

export interface FlipTileBoardProps {
  frontImage?: string;
  backImage?: string;
  brand?: string;
  flipLabel?: string;
  rows?: number;
  cols?: number;
  /** Cell size of the cursor highlight grid, in px. */
  blockSize?: number;
  /** Milliseconds a tile ignores re-entry after being flipped. */
  cooldown?: number;
}

export default function FlipTileBoard({
  frontImage = `${ASSET_BASE}/front.jpg`,
  backImage = `${ASSET_BASE}/back.jpg`,
  brand = "BLANK",
  flipLabel = "Flip Tiles",
  rows = 6,
  cols = 6,
  blockSize = 50,
  cooldown = 1000,
}: FlipTileBoardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const flippedRef = useRef(false);
  const [blockCount, setBlockCount] = useState(0);
  const numColsRef = useRef(1);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const board = root.querySelector<HTMLElement>(".ftb-board");
    const blockContainer = root.querySelector<HTMLElement>(".ftb-blocks");
    if (!board || !blockContainer) return;

    const tiles = Array.from(root.querySelectorAll<HTMLElement>(".ftb-tile"));
    const cleanups: (() => void)[] = [];

    tiles.forEach((tile, index) => {
      let lastEnterTime = 0;
      const onEnter = () => {
        const currentTime = Date.now();
        if (currentTime - lastEnterTime <= cooldown) return;
        lastEnterTime = currentTime;

        let tiltY: number;
        if (index % 6 === 0) tiltY = -40;
        else if (index % 6 === 5) tiltY = 40;
        else if (index % 6 === 1) tiltY = -20;
        else if (index % 6 === 4) tiltY = 20;
        else if (index % 6 === 2) tiltY = -10;
        else tiltY = 10;

        const isFlipped = flippedRef.current;
        gsap
          .timeline()
          .set(tile, { rotateX: isFlipped ? 180 : 0, rotateY: 0 })
          .to(tile, {
            rotateX: isFlipped ? 450 : 270,
            rotateY: tiltY,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(
            tile,
            {
              rotateX: isFlipped ? 540 : 360,
              rotateY: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.25",
          );
      };
      tile.addEventListener("mouseenter", onEnter);
      cleanups.push(() => tile.removeEventListener("mouseenter", onEnter));
    });

    // The source sizes the highlight grid off the window; here it is sized off
    // the component's own box so the cells still line up in a bounded preview.
    const numCols = Math.ceil(root.clientWidth / blockSize);
    const numRows = Math.ceil(root.clientHeight / blockSize);
    numColsRef.current = numCols;
    setBlockCount(numCols * numRows);

    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const onMouseMove = (event: MouseEvent) => {
      const rect = blockContainer.getBoundingClientRect();
      const col = Math.floor((event.clientX - rect.left) / blockSize);
      const row = Math.floor((event.clientY - rect.top) / blockSize);
      const block = blockContainer.children[row * numColsRef.current + col];
      if (!block) return;
      block.classList.add("ftb-highlight");
      const timeout = setTimeout(() => {
        block.classList.remove("ftb-highlight");
        timeouts.delete(timeout);
      }, 250);
      timeouts.add(timeout);
    };
    root.addEventListener("mousemove", onMouseMove);

    return () => {
      for (const cleanup of cleanups) cleanup();
      root.removeEventListener("mousemove", onMouseMove);
      for (const timeout of timeouts) clearTimeout(timeout);
      gsap.killTweensOf(tiles);
    };
  }, [blockSize, cooldown, rows, cols]);

  const flipAll = () => {
    const root = rootRef.current;
    if (!root) return;
    flippedRef.current = !flippedRef.current;
    gsap.to(root.querySelectorAll(".ftb-tile"), {
      rotateX: flippedRef.current ? 180 : 0,
      duration: 1,
      stagger: { amount: 0.5, from: "random" },
      ease: "power2.inOut",
    });
  };

  return (
    <div className="ftb-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="ftb-nav">
        <a href="#brand">{brand}</a>
        <button onClick={flipAll} type="button">
          {flipLabel}
        </button>
      </nav>

      <section className="ftb-board">
        {Array.from({ length: rows }, (_, row) => (
          <div className="ftb-row" key={`row-${String(row)}`}>
            {Array.from({ length: cols }, (_, col) => (
              <div
                className="ftb-tile"
                key={`tile-${String(row)}-${String(col)}`}
              >
                <div
                  className="ftb-tile-face ftb-tile-front"
                  style={{
                    backgroundPosition: `${col * 20}% ${row * 20}%`,
                    ["--ftb-face" as string]: `url(${frontImage})`,
                  }}
                />
                <div
                  className="ftb-tile-face ftb-tile-back"
                  style={{
                    backgroundPosition: `${col * 20}% ${row * 20}%`,
                    ["--ftb-face" as string]: `url(${backImage})`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </section>

      <div className="ftb-blocks-container">
        <div className="ftb-blocks">
          {Array.from({ length: blockCount }, (_, i) => (
            <div
              className="ftb-block"
              key={`block-${String(i)}`}
              style={{ width: blockSize, height: blockSize }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap");

.ftb-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ftb-root * {
  box-sizing: border-box;
}

.ftb-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2em;
  z-index: 10;
  pointer-events: none;
}

.ftb-nav a {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-family: "Archivo", sans-serif;
  font-stretch: expanded;
  font-size: 28px;
  pointer-events: all;
}

.ftb-nav button {
  border: none;
  outline: none;
  color: #fff;
  background-color: #000;
  border-radius: 0.25em;
  padding: 0.65em 1em 0.25em 1em;
  text-transform: uppercase;
  font-family: "Archivo", sans-serif;
  font-stretch: expanded;
  font-size: 24px;
  pointer-events: all;
  cursor: pointer;
}

.ftb-board {
  width: 100%;
  height: 100%;
  padding: 0.25em;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  perspective: 1000px;
  background-color: #000;
  position: relative;
  z-index: 1;
}

.ftb-row {
  flex: 1;
  display: flex;
  gap: 0.25em;
}

.ftb-tile {
  flex: 1;
  position: relative;
  transform-style: preserve-3d;
}

.ftb-tile-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 0.5em;
  overflow: hidden;
}

.ftb-tile-front {
  background-color: darkslategrey;
}

.ftb-tile-back {
  background-color: darkslategrey;
  transform: rotateX(180deg);
}

.ftb-tile-front::before,
.ftb-tile-back::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--ftb-face);
  background-size: 600% 600%;
  background-position: inherit;
  clip-path: inset(0 round 0.25em);
}

.ftb-blocks-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.ftb-blocks {
  width: 105%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  overflow: hidden;
}

.ftb-block {
  border: 0.5px solid transparent;
  transition: border-color 0.3s ease;
}

.ftb-block.ftb-highlight {
  border-color: #fff;
}
`;
