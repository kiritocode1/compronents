"use client";

/**
 * ASCII Image Reveal - a gallery of photos that decode from canvas glyphs.
 *
 * Each image is sampled into a small luminance grid, redrawn as ASCII, then
 * revealed after its darker cells finish scrambling. The original code
 * reference used document-level DOM mutation; this React version keeps each
 * tile scoped, cancellable, and safe to mount inside a registry demo.
 *
 * BLANK - aryank.space
 */

import { useEffect, useMemo, useRef, useState } from "react";

export interface AsciiImageRevealProps {
  images?: string[];
  altPrefix?: string;
  chars?: string;
  columns?: number;
  fontSize?: number;
  aspectWidth?: number;
  aspectHeight?: number;
  imageStaggerMs?: number;
  cellAppearMs?: number;
  scrambleCount?: number;
  scrambleSpeedMs?: number;
  revealDelayMs?: number;
  glyphColor?: string;
  canvasBackground?: string;
  background?: string;
  gap?: string;
  embedded?: boolean;
}

const COMPRONENTS_ASSET_BASE =
  "https://ui.aryank.space/assets/ascii-image-reveal";

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/img${i + 1}.jpg`,
);

const DEFAULT_POSITIONS = [
  [1, 1],
  [2, 1],
  [5, 1],
  [1, 2],
  [3, 2],
  [6, 2],
  [8, 2],
  [1, 3],
  [2, 3],
  [4, 3],
  [7, 3],
  [10, 3],
  [2, 4],
  [6, 4],
  [9, 4],
];

function shuffleArray<T>(source: T[]) {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function AsciiRevealTile({
  src,
  alt,
  index,
  chars,
  columns,
  fontSize,
  aspectWidth,
  aspectHeight,
  imageStaggerMs,
  cellAppearMs,
  scrambleCount,
  scrambleSpeedMs,
  revealDelayMs,
  glyphColor,
  canvasBackground,
}: {
  src: string;
  alt: string;
  index: number;
} & Required<
  Pick<
    AsciiImageRevealProps,
    | "chars"
    | "columns"
    | "fontSize"
    | "aspectWidth"
    | "aspectHeight"
    | "imageStaggerMs"
    | "cellAppearMs"
    | "scrambleCount"
    | "scrambleSpeedMs"
    | "revealDelayMs"
    | "glyphColor"
    | "canvasBackground"
  >
>) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    let cancelled = false;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    let scrambleTicker: ReturnType<typeof setInterval> | null = null;

    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    if (!measureCtx) return;
    measureCtx.font = `${fontSize}px monospace`;
    const charWidth = Math.ceil(measureCtx.measureText("M").width);
    const charHeight = fontSize;
    const rows = Math.round(
      columns * (aspectHeight / aspectWidth) * (charWidth / charHeight),
    );

    const denseCharIndex = chars.lastIndexOf(".");
    const denseChars =
      denseCharIndex >= 0
        ? chars.slice(denseCharIndex + 1).split("")
        : chars.split("");
    const scrambleChars = denseChars.length ? denseChars : chars.split("");

    const setSafeTimeout = (fn: () => void, delay: number) => {
      const timeout = setTimeout(() => {
        timeouts.delete(timeout);
        if (!cancelled) fn();
      }, delay);
      timeouts.add(timeout);
      return timeout;
    };

    const drawCharacter = (
      ctx: CanvasRenderingContext2D,
      col: number,
      row: number,
      char: string,
    ) => {
      ctx.fillStyle = canvasBackground;
      ctx.fillRect(col * charWidth, row * charHeight, charWidth, charHeight);
      ctx.fillStyle = glyphColor;
      ctx.fillText(char, col * charWidth, row * charHeight);
    };

    const imageToAsciiGrid = () => {
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const itemAspect = aspectWidth / aspectHeight;

      let cropX = 0;
      let cropY = 0;
      let cropW = img.naturalWidth;
      let cropH = img.naturalHeight;

      if (imageAspect > itemAspect) {
        cropW = img.naturalHeight * itemAspect;
        cropX = (img.naturalWidth - cropW) / 2;
      } else {
        cropH = img.naturalWidth / itemAspect;
        cropY = (img.naturalHeight - cropH) / 2;
      }

      const samplingCanvas = document.createElement("canvas");
      samplingCanvas.width = columns;
      samplingCanvas.height = rows;
      const sampleCtx = samplingCanvas.getContext("2d");
      if (!sampleCtx) return null;

      sampleCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, columns, rows);

      const { data } = sampleCtx.getImageData(0, 0, columns, rows);
      const asciiGrid: string[][] = [];
      const brightnessGrid: number[][] = [];

      for (let row = 0; row < rows; row++) {
        const asciiRow: string[] = [];
        const brightnessRow: number[] = [];

        for (let col = 0; col < columns; col++) {
          const pixelIndex = (row * columns + col) * 4;
          const brightness =
            (data[pixelIndex] * 0.299 +
              data[pixelIndex + 1] * 0.587 +
              data[pixelIndex + 2] * 0.114) /
            255;
          const charIndex = Math.min(
            chars.length - 1,
            Math.floor((1 - brightness) * chars.length),
          );

          asciiRow.push(chars[charIndex]);
          brightnessRow.push(charIndex);
        }

        asciiGrid.push(asciiRow);
        brightnessGrid.push(brightnessRow);
      }

      return { asciiGrid, brightnessGrid };
    };

    const prepareCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = columns * charWidth * dpr;
      canvas.height = rows * charHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = canvasBackground;
      ctx.fillRect(0, 0, columns * charWidth, rows * charHeight);
      ctx.font = `${charHeight}px monospace`;
      ctx.textBaseline = "top";
      return ctx;
    };

    const startEffect = () => {
      setRevealed(false);
      const result = imageToAsciiGrid();
      const ctx = prepareCanvas();
      if (!result || !ctx) return;

      const { asciiGrid, brightnessGrid } = result;
      const totalCells = columns * rows;
      const scrambleState = new Array<number | null>(totalCells).fill(null);
      let settledCount = 0;
      let revealQueued = false;

      const scheduleReveal = () => {
        if (revealQueued) return;
        revealQueued = true;
        setSafeTimeout(() => setRevealed(true), revealDelayMs);
      };

      const cellOrder = shuffleArray(
        Array.from({ length: totalCells }, (_, i) => i),
      );
      const staggerDelay = index * imageStaggerMs;

      cellOrder.forEach((cellIndex, i) => {
        setSafeTimeout(
          () => {
            const row = Math.floor(cellIndex / columns);
            const col = cellIndex % columns;
            const isDark = brightnessGrid[row][col] > denseCharIndex;

            if (!isDark) {
              drawCharacter(ctx, col, row, asciiGrid[row][col]);
              scrambleState[cellIndex] = 0;
              settledCount++;
              if (settledCount === totalCells) scheduleReveal();
            } else {
              drawCharacter(
                ctx,
                col,
                row,
                scrambleChars[Math.floor(Math.random() * scrambleChars.length)],
              );
              scrambleState[cellIndex] = scrambleCount;
            }
          },
          staggerDelay + i * cellAppearMs,
        );
      });

      scrambleTicker = setInterval(() => {
        let stillScrambling = false;

        for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
          const remaining = scrambleState[cellIndex];
          if (remaining === null || remaining === 0) continue;

          stillScrambling = true;
          const row = Math.floor(cellIndex / columns);
          const col = cellIndex % columns;

          if (remaining === 1) {
            drawCharacter(ctx, col, row, asciiGrid[row][col]);
            scrambleState[cellIndex] = 0;
            settledCount++;
            if (settledCount === totalCells) scheduleReveal();
          } else {
            drawCharacter(
              ctx,
              col,
              row,
              scrambleChars[Math.floor(Math.random() * scrambleChars.length)],
            );
            scrambleState[cellIndex] = remaining - 1;
          }
        }

        if (!stillScrambling && settledCount === totalCells && scrambleTicker) {
          clearInterval(scrambleTicker);
          scrambleTicker = null;
        }
      }, scrambleSpeedMs);
    };

    if (img.complete && img.naturalWidth) {
      startEffect();
    } else {
      img.addEventListener("load", startEffect, { once: true });
    }

    return () => {
      cancelled = true;
      for (const timeout of timeouts) clearTimeout(timeout);
      if (scrambleTicker) clearInterval(scrambleTicker);
      img.removeEventListener("load", startEffect);
    };
  }, [
    src,
    index,
    chars,
    columns,
    fontSize,
    aspectWidth,
    aspectHeight,
    imageStaggerMs,
    cellAppearMs,
    scrambleCount,
    scrambleSpeedMs,
    revealDelayMs,
    glyphColor,
    canvasBackground,
  ]);

  return (
    <div className={revealed ? "air-tile air-revealed" : "air-tile"}>
      <img ref={imageRef} src={src} alt={alt} crossOrigin="anonymous" />
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function AsciiImageReveal({
  images = DEFAULT_IMAGES,
  altPrefix = "ASCII reveal image",
  chars = "........:::=+xX#0369",
  columns = 25,
  fontSize = 14,
  aspectWidth = 4,
  aspectHeight = 5,
  imageStaggerMs = 100,
  cellAppearMs = 2,
  scrambleCount = 10,
  scrambleSpeedMs = 100,
  revealDelayMs = 0,
  glyphColor = "#c8c8c8",
  canvasBackground = "#111111",
  background = "#111111",
  gap = "2rem",
  embedded = true,
}: AsciiImageRevealProps) {
  const visibleImages = useMemo(() => images.slice(0, 15), [images]);

  return (
    <section
      className={embedded ? "air-root air-embedded" : "air-root"}
      style={
        {
          "--air-bg": background,
          "--air-gap": gap,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="air-gallery">
        {visibleImages.map((src, index) => {
          const [column, row] = DEFAULT_POSITIONS[index] ?? [
            (index % 8) + 1,
            Math.floor(index / 8) + 1,
          ];
          return (
            <div
              className="air-slot"
              key={src}
              style={
                {
                  "--air-column": column,
                  "--air-row": row,
                } as React.CSSProperties
              }
            >
              <AsciiRevealTile
                src={src}
                alt={`${altPrefix} ${index + 1}`}
                index={index}
                chars={chars}
                columns={columns}
                fontSize={fontSize}
                aspectWidth={aspectWidth}
                aspectHeight={aspectHeight}
                imageStaggerMs={imageStaggerMs}
                cellAppearMs={cellAppearMs}
                scrambleCount={scrambleCount}
                scrambleSpeedMs={scrambleSpeedMs}
                revealDelayMs={revealDelayMs}
                glyphColor={glyphColor}
                canvasBackground={canvasBackground}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = `
.air-root {
  position: relative;
  width: 100%;
  min-height: 100svh;
  background: var(--air-bg);
  overflow: hidden;
}

.air-root.air-embedded {
  height: 100%;
  min-height: 100%;
}

.air-gallery {
  position: relative;
  width: 100%;
  min-height: inherit;
  height: 100%;
  padding: clamp(1rem, 3vw, 2rem);
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: var(--air-gap);
}

.air-slot {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  align-self: center;
  grid-column: var(--air-column);
  grid-row: var(--air-row);
  min-width: 0;
}

.air-tile {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #111;
}

.air-tile img,
.air-tile canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.air-tile img {
  object-fit: cover;
  opacity: 0;
  transition: opacity 220ms ease;
}

.air-tile canvas {
  display: block;
  opacity: 1;
  transition: opacity 220ms ease;
}

.air-tile.air-revealed img {
  opacity: 1;
}

.air-tile.air-revealed canvas {
  opacity: 0;
}

@media (max-width: 1000px) {
  .air-root {
    min-height: auto;
  }

  .air-root.air-embedded {
    height: auto;
  }

  .air-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    min-height: auto;
    gap: clamp(0.75rem, 4vw, 1.25rem);
  }

  .air-slot {
    grid-column: auto;
    grid-row: auto;
  }
}
`;
