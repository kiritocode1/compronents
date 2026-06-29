"use client";

/**
 * Animated Footer — a breathing, full-screen footer.
 *
 * Two photographed hands are sampled into live ASCII art on a <canvas>; the
 * glyphs light up in little clusters as the cursor passes over them, the whole
 * thing drifts with a soft parallax, and the wordmark + copy reveal as the
 * footer scrolls into view (GSAP SplitText + ScrollTrigger, Lenis smooth scroll).
 *
 * Use it full-page as the last thing on a tall page (default), or drop it into a
 * bounded, relatively-positioned box with `embedded` (the footer becomes
 * absolute and reveals on enter via IntersectionObserver instead of driving the
 * page scroll).
 *
 * Note: the defaults are served from the Compronents asset route, backed by
 * Vercel Blob in production. Pass your own `leftImage` / `rightImage` when you
 * want full control (same-origin or CORS-enabled — the pixels are read back off
 * a canvas).
 *
 * BLANK — aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

/* ---- ASCII / render config ---- */
const ASCII_CHARS = "........:::=+xX#0369";
const FONT_SIZE = 18;
const CELL_SIZE = 20;
const ASCII_COLUMNS = 80;
const DPR = 2;

const CHAR_COLOR = "#803500";
const HOVER_COLOR = "#ff6a00";
const HOVER_CHAR_COLOR = "#0f0f0f";

const HOVER_RADIUS = 8;
const CLUSTER_SIZE = 10;
const HIGHLIGHT_LIFETIME = 300;

const PARALLAX_STRENGTH = 20;
const PARALLAX_EASE = 0.05;

const backgroundCharIndex = ASCII_CHARS.lastIndexOf(".");

type Cell = {
  col: number;
  row: number;
  char: string;
  highlightEndTime: number;
};

type Hand = {
  canvas: HTMLCanvasElement;
  cells: Map<string, Cell>;
  cellList: Cell[];
  rows: number;
};

export interface FooterLink {
  label: string;
  href: string;
}

export interface AnimatedFooterProps {
  /** The big two-part wordmark, shown bottom-left / bottom-right. */
  heading?: [string, string];
  /** Nav links rendered top-left. */
  links?: FooterLink[];
  /** Short studio paragraph rendered top-right. */
  description?: string;
  /**
   * Left / right hand image URLs. Sampled pixel-by-pixel into ASCII, so they
   * must be same-origin or served with CORS headers. Provide your own — the
   * defaults only resolve on the Compronents site.
   */
  leftImage?: string;
  rightImage?: string;
  /** Base + hover colors for the ASCII glyphs. */
  charColor?: string;
  hoverColor?: string;
  /**
   * Render inside a bounded, relatively-positioned parent instead of taking
   * over the viewport. The footer becomes `absolute` and reveals when scrolled
   * into view, with no Lenis / page-scroll hijacking.
   */
  embedded?: boolean;
}

const DEFAULT_HEADING: [string, string] = ["Blank", "Space"];
const DEFAULT_LINKS: FooterLink[] = [
  { label: "Work", href: "https://aryank.space" },
  { label: "About", href: "https://aryank.space" },
  { label: "Writing", href: "https://aryank.space" },
  { label: "Contact", href: "https://aryank.space" },
];
const DEFAULT_DESCRIPTION =
  "Blank — a software developer building considered digital experiences. Interfaces, motion, and the small details that make a product feel alive. From aryank.space.";
const COMPRONENTS_ASSET_BASE = "https://compronents.dev/assets/animated-footer";

export default function AnimatedFooter({
  heading = DEFAULT_HEADING,
  links = DEFAULT_LINKS,
  description = DEFAULT_DESCRIPTION,
  leftImage = `${COMPRONENTS_ASSET_BASE}/blank-hand-right.png`,
  rightImage = `${COMPRONENTS_ASSET_BASE}/blank-hand-left.png`,
  charColor = CHAR_COLOR,
  hoverColor = HOVER_COLOR,
  embedded = false,
}: AnimatedFooterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const revealerRef = useRef<HTMLDivElement>(null);
  const leftImgRef = useRef<HTMLImageElement>(null);
  const rightImgRef = useRef<HTMLImageElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: text/link props are read once at setup; re-splitting on every keystroke is undesirable.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const root = rootRef.current;
    const footer = footerRef.current;
    if (!root || !footer) return;

    /* ---- Smooth scroll (full-page mode only) ---- */
    const onScroll = () => ScrollTrigger.update();
    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    if (!embedded) {
      lenis = new Lenis();
      lenis.on("scroll", onScroll);
      tickerFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    /* ---- Split text ---- */
    const headingSplits: SplitText[] = [];
    const headingChars: Element[] = [];
    root.querySelectorAll(".footer-header h1").forEach((node) => {
      const split = SplitText.create(node, {
        type: "chars",
        charsClass: "char",
      });
      headingSplits.push(split);
      headingChars.push(...split.chars);
    });
    gsap.set(headingChars, { position: "relative", yPercent: 125 });

    const lineSplits: SplitText[] = [];
    const contentLines: Element[] = [];
    root.querySelectorAll(".footer-links a, .footer-text p").forEach((el) => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
      });
      lineSplits.push(split);
      contentLines.push(...split.lines);
    });
    gsap.set(contentLines, { yPercent: 100 });

    /* ---- ASCII hands ---- */
    const sampleImagePixels = (image: HTMLImageElement, gridRows: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = ASCII_COLUMNS;
      canvas.height = gridRows;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new Uint8ClampedArray();
      ctx.drawImage(image, 0, 0, ASCII_COLUMNS, gridRows);
      return ctx.getImageData(0, 0, ASCII_COLUMNS, gridRows).data;
    };

    const pixelToCharIndex = (
      pixels: Uint8ClampedArray,
      pixelOffset: number,
    ) => {
      const brightness =
        (pixels[pixelOffset] * 0.299 +
          pixels[pixelOffset + 1] * 0.587 +
          pixels[pixelOffset + 2] * 0.114) /
        255;
      return Math.min(
        ASCII_CHARS.length - 1,
        Math.floor((1 - brightness) * ASCII_CHARS.length),
      );
    };

    const buildCells = (image: HTMLImageElement) => {
      const rows = Math.round(
        ASCII_COLUMNS / (image.naturalWidth / image.naturalHeight),
      );
      const pixels = sampleImagePixels(image, rows);
      const cells = new Map<string, Cell>();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < ASCII_COLUMNS; col++) {
          const charIndex = pixelToCharIndex(
            pixels,
            (row * ASCII_COLUMNS + col) * 4,
          );
          if (charIndex <= backgroundCharIndex) continue;
          cells.set(`${col},${row}`, {
            col,
            row,
            char: ASCII_CHARS[charIndex],
            highlightEndTime: 0,
          });
        }
      }
      return { rows, cells };
    };

    const hands: Hand[] = [];
    // Each hand drives its own rAF loop and load listener; track them so every
    // one is torn down on unmount (the demo remounts on reset).
    const stopRenderLoops: Array<() => void> = [];
    const pendingLoads: Array<() => void> = [];
    let disposed = false;

    const setupHand = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
    ): Hand | null => {
      const { rows, cells } = buildCells(image);
      const cellList = [...cells.values()];

      canvas.width = ASCII_COLUMNS * CELL_SIZE * DPR;
      canvas.height = rows * CELL_SIZE * DPR;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const baselineOffset =
        CELL_SIZE / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

      const canvasWidth = ASCII_COLUMNS * CELL_SIZE;
      const canvasHeight = rows * CELL_SIZE;

      let frame = 0;
      const render = () => {
        const now = Date.now();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for (const cell of cellList) {
          const x = cell.col * CELL_SIZE;
          const y = cell.row * CELL_SIZE;
          const isHighlighted = cell.highlightEndTime > now;
          if (isHighlighted) {
            ctx.fillStyle = hoverColor;
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          }
          ctx.fillStyle = isHighlighted ? HOVER_CHAR_COLOR : charColor;
          ctx.fillText(cell.char, x + CELL_SIZE / 2, y + baselineOffset);
        }
        frame = requestAnimationFrame(render);
      };
      render();
      stopRenderLoops.push(() => cancelAnimationFrame(frame));

      return { canvas, cells, cellList, rows };
    };

    const registerHand = (image: HTMLImageElement | null) => {
      if (!image) return;
      const canvas = image
        .closest(".footer-hand-img")
        ?.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) return;
      const start = () => {
        if (disposed) return;
        const hand = setupHand(image, canvas);
        if (hand) hands.push(hand);
      };
      if (image.complete && image.naturalWidth) {
        start();
      } else {
        image.addEventListener("load", start);
        pendingLoads.push(() => image.removeEventListener("load", start));
      }
    };
    registerHand(leftImgRef.current);
    registerHand(rightImgRef.current);

    /* ---- Hover highlight clusters ---- */
    const highlightCluster = (cells: Map<string, Cell>, startCell: Cell) => {
      const now = Date.now();
      startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;
      const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
      const litCells: Cell[] = [startCell];
      let current = startCell;
      for (let step = 0; step < steps; step++) {
        const neighbours: Cell[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const neighbour = cells.get(
              `${current.col + dx},${current.row + dy}`,
            );
            if (neighbour && !litCells.includes(neighbour))
              neighbours.push(neighbour);
          }
        }
        if (neighbours.length === 0) break;
        const next = neighbours[Math.floor(Math.random() * neighbours.length)];
        next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 10;
        litCells.push(next);
        current = next;
      }
    };

    const hoverHand = (hand: Hand, clientX: number, clientY: number) => {
      const rect = hand.canvas.getBoundingClientRect();
      const mouseCol = ((clientX - rect.left) / rect.width) * ASCII_COLUMNS;
      const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;
      let closest: Cell | null = null;
      let closestDist = Infinity;
      for (const cell of hand.cellList) {
        const dx = mouseCol - cell.col;
        const dy = mouseRow - cell.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = cell;
        }
      }
      if (closest && closestDist <= HOVER_RADIUS)
        highlightCluster(hand.cells, closest);
    };

    /* ---- Parallax ---- */
    const handWrappers = [
      ...root.querySelectorAll<HTMLElement>(".footer-hand-img"),
    ];
    const parallaxScale = 1 + (PARALLAX_STRENGTH * 2) / 200;
    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const reveal = { left: -125, right: 125 };

    const setPointerTarget = (clientX: number, clientY: number) => {
      const rect = footer.getBoundingClientRect();
      pointer.x =
        ((clientX - rect.left) / rect.width - 0.5) * PARALLAX_STRENGTH * 2;
      pointer.y =
        ((clientY - rect.top) / rect.height - 0.5) * PARALLAX_STRENGTH * 2;
    };

    let parallaxRaf = 0;
    const renderParallax = () => {
      drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
      handWrappers.forEach((wrapper, i) => {
        const direction = i === 0 ? 1 : -1;
        const revealX = i === 0 ? reveal.left : reveal.right;
        const x = drift.x * direction;
        const y = -drift.y;
        wrapper.style.transform = `translate(calc(${x}px + ${revealX}%), ${y}px) scale(${parallaxScale})`;
      });
      parallaxRaf = requestAnimationFrame(renderParallax);
    };
    renderParallax();

    const onMouseMove = (event: MouseEvent) => {
      hands.forEach((hand) => {
        hoverHand(hand, event.clientX, event.clientY);
      });
      setPointerTarget(event.clientX, event.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ---- Reveal animations ---- */
    const charStagger = { each: 0.04, from: "center" as const };

    const animateIn = () => {
      gsap.to(reveal, {
        left: 0,
        right: 0,
        duration: 1,
        ease: "power3.out",
        overwrite: true,
      });
      gsap.to(headingChars, {
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        stagger: charStagger,
        overwrite: true,
      });
      gsap.to(contentLines, {
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        overwrite: true,
      });
    };

    const animateOut = () => {
      gsap.to(reveal, {
        left: -125,
        right: 125,
        duration: 0.4,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(headingChars, {
        yPercent: 125,
        duration: 0.4,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
        overwrite: true,
      });
      gsap.to(contentLines, {
        yPercent: 100,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.02,
        overwrite: true,
      });
    };

    /* ---- Reveal trigger ---- */
    let stEnter: ScrollTrigger | null = null;
    let stLeaveBack: ScrollTrigger | null = null;
    let observer: IntersectionObserver | null = null;

    if (embedded) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) animateIn();
            else animateOut();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(root);
    } else if (revealerRef.current) {
      stEnter = ScrollTrigger.create({
        trigger: revealerRef.current,
        start: "top 50%",
        onEnter: animateIn,
      });
      stLeaveBack = ScrollTrigger.create({
        trigger: revealerRef.current,
        start: "top 85%",
        onLeaveBack: animateOut,
      });
    }

    /* ---- Cleanup ---- */
    return () => {
      disposed = true;
      window.removeEventListener("mousemove", onMouseMove);
      for (const stop of stopRenderLoops) stop();
      for (const remove of pendingLoads) remove();
      cancelAnimationFrame(parallaxRaf);
      stEnter?.kill();
      stLeaveBack?.kill();
      observer?.disconnect();
      headingSplits.forEach((s) => {
        s.revert();
      });
      lineSplits.forEach((s) => {
        s.revert();
      });
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (lenis) {
        lenis.off("scroll", onScroll);
        lenis.destroy();
      }
    };
  }, [embedded, charColor, hoverColor, leftImage, rightImage]);

  return (
    <div ref={rootRef} className={embedded ? "bf-root bf-embedded" : "bf-root"}>
      <style>{styles}</style>

      {!embedded && <div className="footer-revealer" ref={revealerRef} />}

      <footer ref={footerRef}>
        <div className="footer-images">
          <div className="footer-hand-img">
            {/* biome-ignore lint/performance/noImgElement: the raw element is needed to read pixels back off a canvas for the ASCII sampling. */}
            <img
              className="ascii-hand"
              src={leftImage}
              alt=""
              ref={leftImgRef}
              crossOrigin="anonymous"
            />
            <canvas />
          </div>
          <div className="footer-hand-img">
            {/* biome-ignore lint/performance/noImgElement: the raw element is needed to read pixels back off a canvas for the ASCII sampling. */}
            <img
              className="ascii-hand"
              src={rightImage}
              alt=""
              ref={rightImgRef}
              crossOrigin="anonymous"
            />
            <canvas />
          </div>
        </div>

        <div className="footer-content">
          <nav className="footer-links">
            {links.map((link) => (
              <a key={`${link.label}-${link.href}`} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-text">
            <p>{description}</p>
          </div>
        </div>

        <div className="footer-header">
          <h1>{heading[0]}</h1>
          <h1>{heading[1]}</h1>
        </div>
      </footer>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap");

.bf-root.bf-embedded {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
}

/* In a bounded box the wordmark scales to the container, not the viewport. */
.bf-root.bf-embedded .footer-header h1 {
  font-size: clamp(2.5rem, 13cqw, 8rem);
  white-space: nowrap;
}

.bf-root .footer-revealer {
  position: relative;
  width: 100%;
  height: 100svh;
}

.bf-root footer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  background-color: #0f0f0f;
  overflow: hidden;
  z-index: 0;
  font-family: "Instrument Sans", sans-serif;
}

.bf-root.bf-embedded footer {
  position: absolute;
  height: 100%;
}

.bf-root .footer-images {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bf-root .footer-hand-img {
  position: relative;
  width: 40%;
  min-width: 200px;
  will-change: transform;
}

.bf-root .footer-hand-img img {
  display: block;
  width: 100%;
  opacity: 0;
}

.bf-root .footer-hand-img canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bf-root .footer-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  color: #fff;
}

.bf-root .footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bf-root .footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
}

.bf-root .footer-text {
  max-width: 28rem;
}

.bf-root .footer-text p {
  font-size: 1.1rem;
  line-height: 1.4;
}

.bf-root .footer-header {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: #fff;
}

.bf-root .footer-header h1 {
  font-size: clamp(5rem, 15vw, 15rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -2%;
  overflow: hidden;
}

@media (max-width: 1000px) {
  .bf-root .footer-content {
    flex-direction: column;
  }
  .bf-root .footer-text {
    max-width: 100%;
  }
  .bf-root .footer-header h1 {
    font-size: 3rem;
  }
}
`;
