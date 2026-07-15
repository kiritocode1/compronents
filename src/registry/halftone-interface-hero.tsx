"use client";

/**
 * Halftone Interface Hero
 *
 * A full-screen navigation shell built around a canvas-rendered wordmark. The
 * lettering is sampled into a tight field of rounded pixels, then relit and
 * split into RGB channels around the pointer. A second, short-lived square
 * trail makes fast movement feel like the image is shedding digital ink.
 *
 * The component owns no assets or animation dependencies. It renders its text
 * into an offscreen canvas, so labels can be changed without rebuilding an
 * image or uploading a font file.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef, useState } from "react";

export interface HalftoneHeroLink {
  label: string;
  href: string;
}

export interface HalftoneInterfaceHeroProps {
  /** Two lines sampled into the halftone field. */
  headline?: [string, string];
  /** Centered primary navigation. */
  navigation?: HalftoneHeroLink[];
  /** Right-aligned utility links. */
  utilityLinks?: HalftoneHeroLink[];
  /** Small stacked wordmark shown at the top left. */
  brand?: [string, string];
  /** Footer copyright or studio label. */
  footerLabel?: string;
  /** Short label printed before the clock. */
  locationLabel?: string;
  /** IANA time zone used by the live footer clock. */
  timeZone?: string;
  background?: string;
  foreground?: string;
  /** Three cursor-fringe colors: warm, green, and blue. */
  accentColors?: [string, string, string];
  className?: string;
}

type Dot = {
  x: number;
  y: number;
  coverage: number;
  tone: number;
};

type TrailParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: number;
};

const DEFAULT_NAVIGATION: HalftoneHeroLink[] = [
  { label: "events", href: "#events" },
  { label: "interfaces", href: "#interfaces" },
  { label: "people", href: "#people" },
  { label: "about", href: "#about" },
];

const DEFAULT_UTILITY_LINKS: HalftoneHeroLink[] = [
  { label: "follow", href: "#follow" },
  { label: "subscribe", href: "#subscribe" },
];

const DEFAULT_HEADLINE: [string, string] = ["BLANK", "interfaces"];
const DEFAULT_BRAND: [string, string] = ["BLANK", "interfaces"];
const DEFAULT_ACCENTS: [string, string, string] = [
  "#ff266c",
  "#1cffaf",
  "#5848ff",
];

function roundedPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const half = size / 2;
  const radius = Math.min(2.4, size * 0.28);
  ctx.beginPath();
  ctx.roundRect(x - half, y - half, size, size, radius);
  ctx.fill();
}

function buildMask(
  width: number,
  height: number,
  pitch: number,
  headline: [string, string],
) {
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  const logoAspect = 2.52;
  const logoWidth = Math.min(width * 0.82, height * 0.66 * logoAspect);
  const logoHeight = logoWidth / logoAspect;
  const left = (width - logoWidth) / 2;
  const top = height * 0.47 - logoHeight / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.fontKerning = "normal";

  const drawFittedLine = (
    text: string,
    x: number,
    baseline: number,
    targetWidth: number,
    fontSize: number,
    weight: number,
  ) => {
    ctx.save();
    ctx.font = `${weight} ${fontSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    const measured = Math.max(1, ctx.measureText(text).width);
    ctx.translate(x, 0);
    ctx.scale(targetWidth / measured, 1);
    ctx.fillText(text, 0, baseline);
    ctx.restore();
  };

  drawFittedLine(
    headline[0],
    left + logoWidth * 0.035,
    top + logoHeight * 0.42,
    logoWidth * 0.48,
    logoHeight * 0.43,
    500,
  );
  drawFittedLine(
    headline[1],
    left + logoWidth * 0.02,
    top + logoHeight * 0.94,
    logoWidth * 0.96,
    logoHeight * 0.49,
    400,
  );

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const dots: Dot[] = [];
  const offset = pitch / 2;

  for (let y = offset; y < height; y += pitch) {
    for (let x = offset; x < width; x += pitch) {
      const px = Math.min(width - 1, Math.round(x));
      const py = Math.min(height - 1, Math.round(y));
      const alpha = pixels[(py * width + px) * 4 + 3] / 255;
      if (alpha < 0.08) continue;
      const hash = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453;
      dots.push({
        x,
        y,
        coverage: alpha,
        tone: hash - Math.floor(hash),
      });
    }
  }

  return dots;
}

function formatTime(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date())
      .toLowerCase();
  } catch {
    return "time unavailable";
  }
}

export default function HalftoneInterfaceHero({
  headline = DEFAULT_HEADLINE,
  navigation = DEFAULT_NAVIGATION,
  utilityLinks = DEFAULT_UTILITY_LINKS,
  brand = DEFAULT_BRAND,
  footerLabel = "© 2026 BLANK interfaces",
  locationLabel = "nyc",
  timeZone = "America/New_York",
  background = "#121212",
  foreground = "#f3f3f1",
  accentColors = DEFAULT_ACCENTS,
  className = "",
}: HalftoneInterfaceHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clock, setClock] = useState(() => formatTime(timeZone));

  useEffect(() => {
    setClock(formatTime(timeZone));
    const timer = window.setInterval(
      () => setClock(formatTime(timeZone)),
      30_000,
    );
    return () => window.clearInterval(timer);
  }, [timeZone]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer = {
      x: 0,
      y: 0,
      easedX: 0,
      easedY: 0,
      lastX: 0,
      lastY: 0,
      hover: 0,
      targetHover: 0,
    };
    let width = 0;
    let height = 0;
    let pitch = 10;
    let dots: Dot[] = [];
    let particles: TrailParticle[] = [];
    let frame = 0;
    let visible = true;
    let dirty = true;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      pitch = width < 768 ? 7 : 10;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = buildMask(width, height, pitch, headline);
      pointer.x ||= width / 2;
      pointer.y ||= height * 0.47;
      pointer.easedX ||= pointer.x;
      pointer.easedY ||= pointer.y;
      pointer.lastX = pointer.x;
      pointer.lastY = pointer.y;
      dirty = true;
      requestDraw();
    };

    const addTrail = (x: number, y: number, dx: number, dy: number) => {
      if (reducedMotion) return;
      const speed = Math.hypot(dx, dy);
      const amount = Math.max(1, Math.min(7, Math.round(speed / 7)));
      for (let index = 0; index < amount; index += 1) {
        const spread = Math.random() - 0.5;
        particles.push({
          x: x - dx * (index / amount) + spread * 5,
          y: y - dy * (index / amount) + (Math.random() - 0.5) * 5,
          vx: -dx * 0.018 + spread * 1.25,
          vy: -dy * 0.018 + (Math.random() - 0.5) * 1.25,
          life: 1,
          size: 3 + Math.random() * 4,
          color: index % accentColors.length,
        });
      }
      if (particles.length > 180) particles = particles.slice(-180);
    };

    const drawDots = () => {
      const influenceRadius = Math.max(width, height) * 0.34;
      const fringeRadius = Math.min(width, height) * 0.17;
      const lightX = pointer.easedX;
      const lightY = pointer.easedY;

      for (const dot of dots) {
        const dx = dot.x - lightX;
        const dy = dot.y - lightY;
        const distance = Math.hypot(dx, dy);
        const proximity = Math.max(0, 1 - distance / influenceRadius);
        const fringe =
          pointer.hover * Math.max(0, 1 - distance / fringeRadius) ** 2;
        const directional = (dx - dy) / Math.max(1, influenceRadius);
        const shade = Math.max(
          0.28,
          Math.min(
            1,
            0.52 + dot.coverage * 0.28 + dot.tone * 0.22 + directional * 0.24,
          ),
        );
        const size =
          pitch *
          (0.62 +
            dot.coverage * 0.2 +
            proximity * (0.06 + pointer.hover * 0.1));

        if (fringe > 0.01) {
          const angle = Math.atan2(dy, dx);
          const split = fringe * pitch * 0.72;
          for (let channel = 0; channel < accentColors.length; channel += 1) {
            const channelOffset = (channel - 1) * split;
            ctx.fillStyle = accentColors[channel];
            ctx.globalAlpha = fringe * (0.46 + dot.coverage * 0.28);
            roundedPixel(
              ctx,
              dot.x + Math.cos(angle) * channelOffset,
              dot.y + Math.sin(angle) * channelOffset,
              size,
            );
          }
        }

        ctx.fillStyle = foreground;
        ctx.globalAlpha = shade * (0.7 + dot.coverage * 0.3);
        roundedPixel(ctx, dot.x, dot.y, size);
      }
    };

    const drawTrail = () => {
      ctx.globalCompositeOperation = "lighter";
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.92;
        particle.vy *= 0.92;
        particle.life -= 0.026;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }
        const x = Math.round(particle.x / 3) * 3;
        const y = Math.round(particle.y / 3) * 3;
        const size = particle.size * particle.life;
        ctx.globalAlpha = particle.life * 0.74;
        ctx.fillStyle = accentColors[particle.color];
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const draw = () => {
      frame = 0;
      if (!visible) return;
      ctx.clearRect(0, 0, width, height);
      pointer.easedX += (pointer.x - pointer.easedX) * 0.16;
      pointer.easedY += (pointer.y - pointer.easedY) * 0.16;
      pointer.hover += (pointer.targetHover - pointer.hover) * 0.09;
      drawDots();
      drawTrail();
      ctx.globalAlpha = 1;

      const moving =
        Math.abs(pointer.x - pointer.easedX) > 0.2 ||
        Math.abs(pointer.y - pointer.easedY) > 0.2 ||
        Math.abs(pointer.targetHover - pointer.hover) > 0.002 ||
        particles.length > 0;
      dirty = moving;
      if (moving) frame = window.requestAnimationFrame(draw);
    };

    function requestDraw() {
      dirty = true;
      if (!frame && visible) frame = window.requestAnimationFrame(draw);
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      const dx = nextX - pointer.lastX;
      const dy = nextY - pointer.lastY;
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.targetHover = 1;
      addTrail(nextX, nextY, dx, dy);
      pointer.lastX = nextX;
      pointer.lastY = nextY;
      requestDraw();
    };

    const onPointerLeave = () => {
      pointer.targetHover = 0;
      requestDraw();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && dirty) requestDraw();
      if (!visible && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);
    resize();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [accentColors, foreground, headline]);

  return (
    <section
      ref={rootRef}
      className={`hih-root ${className}`}
      style={{ background, color: foreground }}
    >
      <style>{styles}</style>
      <canvas ref={canvasRef} className="hih-canvas" />

      <header className="hih-header">
        <a className="hih-brand" href="#top" aria-label={brand.join(" ")}>
          <span>{brand[0]}</span>
          <span>{brand[1]}</span>
        </a>

        <nav className="hih-navigation" aria-label="Primary navigation">
          {navigation.map((link) => (
            <a href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="hih-utilities" aria-label="Utility navigation">
          {utilityLinks.map((link) => (
            <a href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <h1 className="hih-visually-hidden">{headline.join(" ")}</h1>

      <footer className="hih-footer">
        <p>{footerLabel}</p>
        <p className="hih-clock">
          {locationLabel} {clock}
        </p>
      </footer>
    </section>
  );
}

const styles = `
.hih-root {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 38rem;
  height: 100%;
  overflow: hidden;
  cursor: none;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 18px;
  line-height: 1;
  letter-spacing: -0.035em;
}

.hih-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}

.hih-header,
.hih-footer {
  position: absolute;
  inset-inline: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 2rem;
}

.hih-header {
  top: 0;
  min-height: 5.25rem;
  padding-block: 1.5rem;
}

.hih-header a {
  color: inherit;
  text-decoration: none;
  transition: opacity 180ms ease;
}

.hih-header a:hover,
.hih-header a:focus-visible {
  opacity: 0.58;
}

.hih-header a:focus-visible {
  outline: 1px solid currentColor;
  outline-offset: 5px;
}

.hih-brand {
  display: flex;
  flex-direction: column;
  width: 6.2rem;
  font-size: 1.45rem;
  line-height: 0.78;
  letter-spacing: -0.075em;
  text-transform: lowercase;
}

.hih-brand span:first-child::before {
  content: "✣";
  display: inline-block;
  margin-right: 0.1em;
  font-size: 0.62em;
  transform: translateY(-0.18em);
}

.hih-navigation {
  position: absolute;
  left: 50%;
  display: flex;
  gap: 2.9rem;
  transform: translateX(-50%);
}

.hih-utilities {
  display: flex;
  gap: 1.9rem;
  margin-left: auto;
}

.hih-footer {
  bottom: 0;
  align-items: flex-end;
  padding-block: 1.45rem;
}

.hih-footer p {
  margin: 0;
}

.hih-clock {
  font-variant-numeric: tabular-nums;
}

.hih-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .hih-root {
    min-height: 32rem;
    cursor: auto;
    font-size: 15px;
  }

  .hih-header,
  .hih-footer {
    padding-inline: 1rem;
  }

  .hih-header {
    min-height: 4.5rem;
    padding-block: 1rem;
  }

  .hih-brand {
    width: 4.9rem;
    font-size: 1.15rem;
  }

  .hih-navigation {
    display: none;
  }

  .hih-utilities {
    gap: 1rem;
  }

  .hih-utilities a:first-child {
    display: none;
  }

  .hih-footer {
    padding-block: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hih-header a {
    transition: none;
  }
}
`;
