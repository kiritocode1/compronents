"use client";

/**
 * Iris Outro Footer — the closing-title iris, scrubbed by scroll.
 *
 * Five concentric discs sit locked to the centre of a sticky, clipped stage.
 * Each one starts part-grown and scales to full size on a single scroll
 * progress, but they start at staggered sizes (0.8, 0.6, 0.4, 0.2, 0), so the
 * gap between neighbours widens as the footer arrives and the whole target
 * appears to bloom outward from the middle. Ring opacity rides the same
 * progress, the stage fades up over the last 70 percent of the range, and the
 * sign-off unblurs into the dark centre at the end.
 *
 * Geometry, gradients, ring opacities and the scale stagger are measured
 * values, not eyeballed: disc widths 110/80/60/43/29 percent of the stage, the
 * lower four nudged 1 percent below centre, opacities 1/0.7/0.6/0.65/0.65.
 *
 * Drop it in as the last thing on a tall page (default), or pass `embedded` to
 * run it inside a bounded box, where the component becomes its own scroller and
 * scrubs against a one-screen lead-in.
 *
 * BLANK — aryank.space
 */

import { useEffect, useRef } from "react";

/* ---- measured ring geometry ---------------------------------------------- */

/** Disc width as a percentage of the stage, outermost first. */
const RING_SIZES = [110, 80, 60, 43, 29] as const;
/** Vertical centre. The outer disc sits on centre, the rest a touch below. */
const RING_TOPS = [50, 51, 51, 51, 51] as const;
/** Resting opacity of each disc, multiplied by scroll progress. */
const RING_OPACITIES = [1, 0.7, 0.6, 0.65, 0.65] as const;
/** Scale each disc holds at progress 0. All of them reach 1 together. */
const RING_FROM = [0.8, 0.6, 0.4, 0.2, 0] as const;

/** Colour stops of the disc gradient, centre outward. */
const DEFAULT_STOPS = [
  "#8c0e0a",
  "#85110f",
  "#731414",
  "#4a0b0b",
  "#1c0303",
] as const;

/** Stop positions for the four inner discs, which stay opaque to their edge. */
const CORE_OFFSETS = [40.8889, 55.1362, 66.3887, 83.0676, 100] as const;
/** The outer disc uses wider stops and dissolves into the page instead. */
const EDGE_OFFSETS = [40.8889, 52.8558, 64.5235, 78.0845, 100] as const;
const EDGE_ALPHA = [1, 0.96, 0.93, 0.88, 0] as const;

/**
 * Progress at which the stage starts fading up. Solved from the source's own
 * opacity at two scrub points, which agree on 0.282 to within 0.0015.
 */
const STAGE_FADE_START = 0.282;
/** Progress at which the sign-off starts resolving. */
const SIGNOFF_START = 0.55;
/** Blur the sign-off carries before it resolves. */
const SIGNOFF_BLUR = 20;

function toRgba(hex: string, alpha: number) {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return alpha >= 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function coreGradient(stops: readonly string[]) {
  const list = CORE_OFFSETS.map(
    (offset, i) => `${stops[i] ?? DEFAULT_STOPS[i]} ${offset}%`,
  ).join(", ");
  return `radial-gradient(50% 50%, ${list})`;
}

function edgeGradient(stops: readonly string[]) {
  const list = EDGE_OFFSETS.map(
    (offset, i) =>
      `${toRgba(stops[i] ?? DEFAULT_STOPS[i], EDGE_ALPHA[i])} ${offset}%`,
  ).join(", ");
  return `radial-gradient(50% 50%, ${list})`;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/* ---- public API ---------------------------------------------------------- */

export interface IrisOutroLink {
  label: string;
  href: string;
}

export interface IrisOutroFooterProps {
  /** The closing line that resolves in the dark centre of the iris. */
  signOff?: string;
  /** Small wordmark pinned to the top left of the stage. */
  wordmark?: string;
  /** Links pinned to the top right. */
  social?: IrisOutroLink[];
  /** Copyright line pinned to the bottom left. */
  copyright?: string;
  /** Links pinned to the bottom right. */
  links?: IrisOutroLink[];
  /**
   * Five colour stops for the discs, centre outward. Only the hue changes; the
   * stop positions that give the iris its banding are fixed.
   */
  stops?: readonly string[];
  /** Baseline tilt of the sign-off, in degrees. */
  tilt?: number;
  /**
   * Run inside a bounded, relatively positioned parent instead of taking over
   * the page. The component becomes its own scroller with a one-screen lead-in,
   * so the iris still scrubs rather than simply appearing.
   */
  embedded?: boolean;
  className?: string;
}

export default function IrisOutroFooter({
  signOff = "“That’s all Folks!”",
  wordmark = "BLANK",
  social = [
    { label: "Instagram", href: "#" },
    { label: "X.com", href: "#" },
  ],
  copyright = "© BLANK 2026",
  links = [
    { label: "hello@aryank.space", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Are.na", href: "#" },
  ],
  stops = DEFAULT_STOPS,
  tilt = -5,
  embedded = false,
  className,
}: IrisOutroFooterProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    const write = (p: number) => {
      root.style.setProperty("--iof-p", p.toFixed(4));
      root.style.setProperty(
        "--iof-stage",
        clamp01((p - STAGE_FADE_START) / (1 - STAGE_FADE_START)).toFixed(4),
      );
      root.style.setProperty(
        "--iof-signoff",
        clamp01((p - SIGNOFF_START) / (1 - SIGNOFF_START)).toFixed(4),
      );
    };

    if (reduced) {
      write(1);
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      // Progress runs from the moment the closing screen's top edge reaches the
      // bottom of the viewport to the moment it reaches the top: exactly one
      // screen of scroll, which is what the original scrubs against.
      const p = embedded
        ? clamp01(root.scrollTop / (root.clientHeight || 1))
        : clamp01(
            1 - root.getBoundingClientRect().top / (window.innerHeight || 1),
          );
      write(p);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();

    // In page mode the footer may sit inside any scroll container, not only the
    // window: an overflow-y app shell, a modal, a smooth-scroll wrapper. Scroll
    // events do not bubble, but a capturing listener on the document still sees
    // every one of them, so a single listener covers all of those cases.
    if (embedded) {
      root.addEventListener("scroll", schedule, { passive: true });
    } else {
      document.addEventListener("scroll", schedule, {
        passive: true,
        capture: true,
      });
    }
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (embedded) {
        root.removeEventListener("scroll", schedule);
      } else {
        document.removeEventListener("scroll", schedule, { capture: true });
      }
      window.removeEventListener("resize", schedule);
    };
  }, [embedded]);

  const core = coreGradient(stops);
  const edge = edgeGradient(stops);

  return (
    <div
      ref={rootRef}
      className={`iof-root${embedded ? " iof-embedded" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      <style>{styles}</style>

      {embedded ? <div className="iof-lead" aria-hidden="true" /> : null}

      <section className="iof-section">
        <div className="iof-stage">
          <div className="iof-rings" aria-hidden="true">
            {RING_SIZES.map((size, i) => (
              <div
                className="iof-ring"
                key={size}
                style={
                  {
                    "--iof-size": `${size}%`,
                    "--iof-top": `${RING_TOPS[i]}%`,
                    "--iof-base": RING_OPACITIES[i],
                    "--iof-from": RING_FROM[i],
                    background: i === 0 ? edge : i === 4 ? "#000" : core,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <p
            className="iof-signoff"
            style={{ "--iof-tilt": `${tilt}deg` } as React.CSSProperties}
          >
            {signOff}
          </p>

          <div className="iof-chrome">
            <span className="iof-wordmark">{wordmark}</span>
            <nav className="iof-social">
              {social.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </nav>
            <span className="iof-copyright">{copyright}</span>
            <nav className="iof-links">
              {links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Yellowtail&display=swap");

.iof-root {
  --iof-p: 0;
  --iof-stage: 0;
  --iof-signoff: 0;
  position: relative;
  width: 100%;
  background-color: #000;
  color: #fff;
}

.iof-root.iof-embedded {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.iof-root.iof-embedded::-webkit-scrollbar {
  display: none;
}

.iof-lead {
  height: 100%;
  width: 100%;
}

.iof-section {
  position: relative;
  width: 100%;
  height: 100svh;
}

.iof-root.iof-embedded .iof-section {
  height: 100%;
}

.iof-stage {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100svh;
  overflow: clip;
  container-type: inline-size;
}

.iof-root.iof-embedded .iof-stage {
  height: 100%;
}

/* The discs are oversized on purpose and clipped by the stage. */
.iof-rings {
  position: absolute;
  inset: 0;
  opacity: var(--iof-stage);
}

.iof-ring {
  position: absolute;
  left: 50%;
  top: var(--iof-top);
  width: var(--iof-size);
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  opacity: calc(var(--iof-base) * var(--iof-p));
  transform: translate(-50%, -50%)
    scale(calc(var(--iof-from) + var(--iof-p) * (1 - var(--iof-from))));
  will-change: transform, opacity;
}

.iof-signoff {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  margin: 0;
  width: 90%;
  text-align: center;
  white-space: nowrap;
  font-family: "Yellowtail", cursive;
  font-size: 11cqw;
  font-weight: 400;
  line-height: 1;
  color: #fff;
  opacity: var(--iof-signoff);
  filter: blur(calc(${SIGNOFF_BLUR}px * (1 - var(--iof-signoff))));
  transform: translate(-50%, -50%) rotate(var(--iof-tilt));
  will-change: opacity, filter;
}

.iof-chrome {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-content: space-between;
  padding: clamp(1.25rem, 2.5cqw, 2.5rem);
  font-family: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, monospace;
  font-size: clamp(0.625rem, 0.9cqw, 0.75rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}

.iof-chrome > * {
  pointer-events: auto;
}

.iof-wordmark {
  justify-self: start;
  letter-spacing: 0.22em;
}

.iof-social {
  justify-self: end;
}

.iof-copyright {
  justify-self: start;
  color: rgba(255, 255, 255, 0.55);
}

.iof-links {
  justify-self: end;
}

.iof-social,
.iof-links {
  display: flex;
  gap: clamp(0.75rem, 1.6cqw, 1.75rem);
}

.iof-chrome a {
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  transition: color 0.25s ease;
}

.iof-chrome a:hover {
  color: #fff;
}

@media (max-width: 640px) {
  .iof-signoff {
    font-size: 15cqw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .iof-ring {
    transition: none;
  }
}
`;
