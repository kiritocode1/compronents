"use client";

/**
 * Halftone Wave Hero
 *
 * A hero whose centerpiece is a waveform drawn as columns of halftone dots.
 * Every column holds the same dots in the same palette order; only the height
 * the column is allowed to occupy changes, driven by a sine envelope across the
 * frame. Where the envelope is open the dots spread and the palette reads as
 * color bands. Where it closes they land on each other, and because the dots
 * are composited with multiply, the whole stack collapses to black.
 *
 * The black knots are therefore not painted. They are what this palette
 * multiplies down to once the wave goes quiet, which is why the approach into
 * them reads as a run of muddy darks rather than a color swap.
 *
 * The packing is what keeps the color legible. Columns sit slightly further
 * apart than a dot is wide, so a hairline of paper shows between them and the
 * dots stay countable. Rows sit a little closer than a dot is wide, overlapping
 * by roughly a sixth: enough of each dot is left uncovered to read at full
 * strength, while the joins darken into seams. Pack the rows much tighter than
 * that and every dot is multiplied by three neighbours at once, which turns the
 * swell to mud long before the envelope has closed.
 *
 * Canvas 2D, no image or animation-library dependency. The opening sweep runs
 * once, the pointer parts the wave and swells the dots under it, the loop
 * pauses off screen, and reduced motion renders a single settled frame with no
 * pointer response.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef } from "react";

export interface HalftoneWaveAction {
  label: string;
  href: string;
  /** "solid" is the filled ink button, "muted" the low-contrast one. */
  variant?: "solid" | "muted";
}

export interface HalftoneWaveFieldProps {
  /** Color cycle applied down each column, one entry per row. */
  palette?: string[];
  /** Paper the dots multiply against. */
  background?: string;
  /** Distance between column centers, in px at a 1440px viewport. */
  columnGap?: number;
  /** Dot radius in px at a 1440px viewport. Keep under half the gap. */
  dotRadius?: number;
  /** Dots per column. Just under two palette cycles reads richest. */
  rows?: number;
  /** Ceiling on column height as a share of half the canvas, 0 to 1. */
  amplitude?: number;
  /** Column height at a node, as a share of the widest column. 0 gives a dot. */
  floor?: number;
  /** How much wider the right side runs than the left, 0 to 1. */
  swell?: number;
  /** Envelope travel speed. 0 freezes the wave. */
  speed?: number;
  /** Seconds for the opening sweep. 0 starts at the resting wave. */
  introDuration?: number;
  /** How far the pointer parts the wave, 0 to 1. 0 disables hover. */
  hoverStrength?: number;
  /** How much the dots swell under the pointer, as a share of their radius. */
  hoverGrowth?: number;
  /** Reach of the pointer's influence in px, at a 1440px viewport. */
  hoverRadius?: number;
  className?: string;
}

export interface HalftoneWaveHeroProps extends HalftoneWaveFieldProps {
  headline?: string;
  standfirst?: string;
  actions?: HalftoneWaveAction[];
  foreground?: string;
  className?: string;
}

const TAU = Math.PI * 2;

/**
 * Cyan, blue, pink, red, amber, green, in the order they run down a column.
 * Multiplied together these land on black, which is what the nodes rely on.
 */
const DEFAULT_PALETTE = [
  "#1daec7",
  "#1e4ec7",
  "#f08add",
  "#f0604d",
  "#f0be4d",
  "#1d8237",
];

const DEFAULT_BACKGROUND = "#f0e9dd";
const DEFAULT_FOREGROUND = "#1c1a17";

const DEFAULT_ACTIONS: HalftoneWaveAction[] = [
  { label: "Read the notes", href: "#notes", variant: "muted" },
  { label: "Open the registry", href: "#registry", variant: "solid" },
];

/**
 * Half a cycle across the frame, so exactly one node sits on screen with its
 * antinode landing in the right third and the previous peak falling off the
 * left edge. That asymmetry is the whole composition: a moderate left shoulder,
 * a knot at about a third across, and the broad swell to the right of it.
 */
const WAVE_FREQ = 0.5;
/** Puts the resting node just under a third of the way across. */
const PHASE = 2.158;
/** Slow enough that a node takes about half a minute to cross the frame. */
const DRIFT = 0.016;

/**
 * Row pitch as a multiple of dot radius, at full spread. A little under 2, so
 * neighbouring rows overlap by roughly a sixth. That margin is the whole point:
 * enough of each dot is left uncovered for its color to read at full strength,
 * while the overlaps darken into seams. Push this much below 1 and every dot is
 * multiplied by three neighbours at once, which turns the swell to mud.
 */
const STEP_RATIO = 1.68;

/** Share of the opening ramp spent handing off from one edge to the other. */
const INTRO_STAGGER = 0.55;
const INTRO_SPAN = 1 - INTRO_STAGGER;

/** Viewport the px-valued props are authored against. */
const REFERENCE_WIDTH = 1440;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HalftoneWaveField({
  palette = DEFAULT_PALETTE,
  background = DEFAULT_BACKGROUND,
  columnGap = 34.8,
  // Just under half the gap, leaving a hairline of paper between columns.
  dotRadius = 16.3,
  rows = 11,
  amplitude = 0.9,
  floor = 0.006,
  swell = 0,
  speed = 1,
  introDuration = 1.7,
  hoverStrength = 0.75,
  hoverGrowth = 0.34,
  hoverRadius = 190,
  className,
}: HalftoneWaveFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Props are read inside the animation loop, so mirror them into a ref to keep
  // the loop from being torn down and restarted on every prop change.
  const settings = useRef({
    palette,
    background,
    columnGap,
    dotRadius,
    rows,
    amplitude,
    floor,
    swell,
    speed,
    introDuration,
    hoverStrength,
    hoverGrowth,
    hoverRadius,
  });
  settings.current = {
    palette,
    background,
    columnGap,
    dotRadius,
    rows,
    amplitude,
    floor,
    swell,
    speed,
    introDuration,
    hoverStrength,
    hoverGrowth,
    hoverRadius,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let start = performance.now();
    let hiddenAt = 0;

    // Pointer position is tracked in canvas space and chased rather than used
    // raw, so the parted region trails the cursor instead of snapping to it.
    let pointerTargetX = 0;
    let pointerX = 0;
    let pointerTargetWeight = 0;
    let pointerWeight = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (time: number) => {
      const s = settings.current;
      const age = reduceMotion
        ? Number.POSITIVE_INFINITY
        : (time - start) / 1000;
      const elapsed = reduceMotion ? 0 : age * s.speed;

      // Opening sweep. Each column runs the same ramp, offset by how far along
      // the frame it sits, so the wave unpacks left to right out of its
      // collapsed state rather than fading in as a whole.
      const intro =
        s.introDuration > 0 ? clamp(age / s.introDuration, 0, 1) : 1;

      pointerX += (pointerTargetX - pointerX) * 0.14;
      pointerWeight += (pointerTargetWeight - pointerWeight) * 0.08;

      // Paint the paper first: multiply needs an opaque destination to darken.
      context.globalCompositeOperation = "source-over";
      context.fillStyle = s.background;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "multiply";

      // Scale the authored px geometry so the dot grid keeps its proportions
      // instead of thinning out on wide screens or crowding on narrow ones.
      const scale = clamp(width / REFERENCE_WIDTH, 0.42, 1.35);
      const gap = Math.max(4, s.columnGap * scale);
      const radius = Math.max(1, s.dotRadius * scale);
      const rowCount = Math.max(1, Math.round(s.rows));

      // Pitch the rows off the dot size so the ribbon keeps its density at any
      // canvas height, then clamp to the frame so a short canvas cannot clip.
      const naturalHalf = ((rowCount - 1) * radius * STEP_RATIO) / 2;
      const frameHalf = Math.max(
        radius,
        (height / 2) * clamp(s.amplitude, 0, 1) - radius,
      );
      const maxHalf = Math.min(naturalHalf, frameHalf);
      const centerY = height / 2;
      const paletteLength = s.palette.length || 1;
      const reach = Math.max(1, s.hoverRadius * scale);

      // One extra column past each edge so the field bleeds rather than stopping.
      const columns = Math.ceil(width / gap) + 2;

      for (let i = -1; i < columns; i += 1) {
        const x = i * gap + gap / 2;
        const u = x / width;

        // A single sine, so there is one node on screen and one broad swell.
        let envelope = Math.abs(
          Math.sin(u * TAU * WAVE_FREQ + PHASE + elapsed * DRIFT * TAU),
        );

        // Optional lean, off by default: the asymmetry already comes from where
        // the node happens to sit rather than from biasing the envelope.
        if (s.swell > 0) envelope *= 1 - s.swell * (1 - u);

        // Stagger the opening ramp across the frame, then ease it so the sweep
        // decelerates into the resting wave.
        const columnIntro = clamp(
          (intro - u * INTRO_STAGGER) / INTRO_SPAN,
          0,
          1,
        );
        envelope *= 1 - (1 - columnIntro) ** 3;

        // One gaussian of pointer influence per column, driving both responses
        // so the column that opens widest is also the one whose dots swell most.
        const influence =
          pointerWeight > 0.001
            ? Math.exp(-(((x - pointerX) / reach) ** 2) * 2.2) * pointerWeight
            : 0;

        // The pointer prises the column open toward full spread. Blending
        // toward 1 rather than adding means it always parts the wave, and it
        // bites hardest inside a node, where there is most black to open.
        if (influence > 0 && s.hoverStrength > 0) {
          envelope += (1 - envelope) * clamp(s.hoverStrength * influence, 0, 1);
        }

        // Dots swell under the cursor. Growing the radius after the spread is
        // set means they push into each other as they grow, so the swollen
        // patch also darkens where they meet.
        const dotRadius = radius * (1 + s.hoverGrowth * influence);

        const half = maxHalf * (s.floor + (1 - s.floor) * envelope);
        const step = rowCount > 1 ? (half * 2) / (rowCount - 1) : 0;
        const top = centerY - half;

        for (let j = 0; j < rowCount; j += 1) {
          context.fillStyle = s.palette[j % paletteLength];
          context.beginPath();
          context.arc(x, top + j * step, dotRadius, 0, TAU);
          context.fill();
        }
      }
    };

    const loop = (time: number) => {
      render(time);
      frame = requestAnimationFrame(loop);
    };

    resize();

    if (reduceMotion) {
      render(start);
    } else {
      frame = requestAnimationFrame(loop);
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      // First contact should not sweep in from wherever the cursor last was.
      if (pointerTargetWeight === 0) pointerX = nextX;
      pointerTargetX = nextX;
      pointerTargetWeight = 1;
    };

    const handlePointerLeave = () => {
      pointerTargetWeight = 0;
    };

    if (!reduceMotion) {
      canvas.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      canvas.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
      canvas.addEventListener("pointercancel", handlePointerLeave, {
        passive: true,
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) render(start);
    });
    resizeObserver.observe(canvas);

    // Stop burning frames while the hero is scrolled away.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? true;
        if (next === visible) return;
        visible = next;
        if (reduceMotion) return;
        if (visible) {
          // Roll the clock forward past the gap so the wave resumes where it
          // stopped instead of jumping.
          start += performance.now() - hiddenAt;
          frame = requestAnimationFrame(loop);
        } else {
          hiddenAt = performance.now();
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "128px" },
    );
    intersectionObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointercancel", handlePointerLeave);
    };
  }, []);

  return (
    // Left bare on purpose. An empty canvas exposes no accessible content, so
    // there is nothing to hide, and both aria-hidden and a presentation role on
    // a focusable element read worse to a screen reader than leaving it alone.
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

export default function HalftoneWaveHero({
  headline = "Interfaces tuned to the shape of the work",
  standfirst = "BLANK builds the components that carry a product's most exacting moments.",
  actions = DEFAULT_ACTIONS,
  background = DEFAULT_BACKGROUND,
  foreground = DEFAULT_FOREGROUND,
  className,
  ...field
}: HalftoneWaveHeroProps) {
  return (
    <section
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100svh",
        width: "100%",
        overflow: "hidden",
        background,
        color: foreground,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: "1 1 auto",
          minHeight: "42svh",
          width: "100%",
        }}
      >
        <HalftoneWaveField background={background} {...field} />
      </div>

      <div
        style={{
          display: "grid",
          gap: "2.5rem clamp(2rem, 6vw, 6rem)",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))",
          alignItems: "end",
          padding: "clamp(1.75rem, 4vw, 3.5rem)",
        }}
      >
        <h1
          style={{
            margin: 0,
            maxWidth: "18ch",
            fontSize: "clamp(2.75rem, 7.2vw, 6rem)",
            fontWeight: 800,
            lineHeight: 0.94,
            letterSpacing: "-0.035em",
            textWrap: "balance",
          }}
        >
          {headline}
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "clamp(1.5rem, 3vw, 2.25rem)",
            maxWidth: "34rem",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "clamp(1rem, 1.4vw, 1.3rem)",
              lineHeight: 1.35,
              letterSpacing: "-0.011em",
              textWrap: "pretty",
            }}
          >
            {standfirst}
          </p>

          {actions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {actions.map((action) => {
                const solid = action.variant === "solid";
                return (
                  <a
                    key={action.href + action.label}
                    href={action.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: "999px",
                      padding: "0.95em 1.7em",
                      fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.008em",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      background: solid ? foreground : "rgba(28, 26, 23, 0.08)",
                      color: solid ? background : foreground,
                      transition: "opacity 160ms ease",
                    }}
                  >
                    {action.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
