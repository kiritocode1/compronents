"use client";

/**
 * Liquid Stat Grid - a three-column statistic band that stays flat and quiet until
 * a cell is hovered, at which point a liquid gradient backdrop fades up behind it
 * and the copy inverts to white.
 *
 * The backdrop is a six-stage WebGL2 shader chain (see ./liquid-canvas), ported
 * from the source scene rather than embedded from a hosted runtime, so the whole
 * component is self-contained.
 *
 * BLANK - aryank.space
 */

import { type CSSProperties, useState } from "react";

import LiquidCanvas from "./liquid-canvas";
import type { LiquidVariant } from "./shaders";

export interface LiquidStat {
  /** Large display figure, e.g. "96" or "1 in 6". */
  value: string;
  /** Optional superscript rendered beside the figure, e.g. "%". */
  suffix?: string;
  /** Supporting sentence anchored to the bottom of the cell. */
  description: string;
  variant: LiquidVariant;
}

export const DEFAULT_STATS: LiquidStat[] = [
  {
    value: "96",
    suffix: "%",
    description:
      "Returning teams report measurable progress against the goals they set in their first planning cycle.",
    variant: "blue",
  },
  {
    value: "1 in 6",
    description:
      "Projects surface a blocking dependency during review that no one had tracked on the original plan.",
    variant: "pink",
  },
  {
    value: "2 of 3",
    description:
      "Audited services showed configuration drift that never appeared in their own dashboards.",
    variant: "green",
  },
];

export interface LiquidStatGridProps {
  stats?: LiquidStat[];
  /** Reveal the gradient on hover, or leave it running on every cell. */
  reveal?: "hover" | "always";
  className?: string;
  style?: CSSProperties;
}

export default function LiquidStatGrid({
  stats = DEFAULT_STATS,
  reveal = "hover",
  className,
  style,
}: LiquidStatGridProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className={`liquid-stat-grid${className ? ` ${className}` : ""}`}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped component stylesheet
        dangerouslySetInnerHTML={{ __html: STYLES }}
      />
      <div className="lsg-row">
        {stats.map((stat, index) => {
          const active = reveal === "always" || hovered === index;
          return (
            <div
              key={stat.value + stat.description}
              className={`lsg-cell${active ? " is-active" : ""}`}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered((c) => (c === index ? null : c))}
            >
              <div className="lsg-backdrop" aria-hidden="true">
                <LiquidCanvas variant={stat.variant} className="lsg-canvas" />
              </div>
              <div className="lsg-content">
                <p className="lsg-value">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="lsg-suffix">{stat.suffix}</span>
                  ) : null}
                </p>
                <p className="lsg-description">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STYLES = `
.liquid-stat-grid {
  --lsg-radius: 16px;
  --lsg-ink: #27272c;
  --lsg-rule: rgba(39, 39, 44, 0.16);
  --lsg-border: rgba(39, 39, 44, 0.1);
  width: 100%;
  container-type: inline-size;
}
.liquid-stat-grid .lsg-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--lsg-border);
  border-radius: var(--lsg-radius);
  overflow: hidden;
  isolation: isolate;
}
.liquid-stat-grid .lsg-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4rem;
  min-height: 380px;
  padding: 3rem 3.25rem;
  border-left: 1px dashed var(--lsg-rule);
  transition: color 0.45s ease;
  color: var(--lsg-ink);
}
.liquid-stat-grid .lsg-cell:first-child {
  border-left: 0;
}
.liquid-stat-grid .lsg-cell.is-active {
  color: #fff;
}
.liquid-stat-grid .lsg-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}
.liquid-stat-grid .lsg-cell.is-active .lsg-backdrop {
  opacity: 1;
}
.liquid-stat-grid .lsg-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
/* contents so the value and description become flex children of the cell and
   space-between can push them to opposite edges */
.liquid-stat-grid .lsg-content {
  display: contents;
}
.liquid-stat-grid .lsg-value {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(3.5rem, 6cqi, 5.5rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.03em;
  white-space: nowrap;
}
.liquid-stat-grid .lsg-suffix {
  font-size: 0.42em;
  vertical-align: super;
  margin-left: 0.12em;
  letter-spacing: 0;
}
.liquid-stat-grid .lsg-description {
  position: relative;
  z-index: 1;
  margin: 0;
  max-width: 34ch;
  font-size: 1rem;
  line-height: 1.5;
  letter-spacing: -0.01em;
}
@media (max-width: 900px) {
  .liquid-stat-grid .lsg-row {
    grid-template-columns: 1fr;
  }
  .liquid-stat-grid .lsg-cell {
    min-height: 280px;
    border-left: 0;
    border-top: 1px dashed var(--lsg-rule);
  }
  .liquid-stat-grid .lsg-cell:first-child {
    border-top: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .liquid-stat-grid .lsg-backdrop,
  .liquid-stat-grid .lsg-cell {
    transition: none;
  }
}
`;
