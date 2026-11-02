"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { mountHologramWalkway } from "./engine";

export interface HologramWalkwayProps {
  /** Show her lines as subtitles. */
  subtitles?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * A giant pink hologram crouches over a rainy walkway. Walk the man up the walkway with ↑ and ↓, or click
 * where he should go. Stop under her hand and she points at him and speaks; walk on and she lets him go.
 * Give the parent a height: the scene scales to fit its box at whole-pixel steps.
 */
export default function HologramWalkway({
  subtitles = true,
  className,
  style,
}: HologramWalkwayProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [line, setLine] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    const scene = mountHologramWalkway(canvas.current, {
      onSubtitle: setLine,
      onReady: () => setReady(true),
    });
    return scene.destroy;
  }, []);

  return (
    <div
      className={className}
      data-hologram-walkway={ready ? "ready" : "loading"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        background: "#07060b",
        ...style,
      }}
    >
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label="A giant pink hologram on a rainy walkway. Hold the up arrow to walk the man up the walkway and the down arrow to walk him back, or click where he should go. Stop under her hand and she points at him."
        style={{
          display: "block",
          imageRendering: "pixelated",
          touchAction: "none",
          outline: "none",
          cursor: "pointer",
        }}
      />
      {subtitles && (
        <p
          aria-live="polite"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "8%",
            margin: 0,
            textAlign: "center",
            font: '500 14px/1.4 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            letterSpacing: "0.01em",
            color: "#f4ecf7",
            textShadow: "0 1px 2px #000, 0 0 6px rgba(0, 0, 0, 0.8)",
            opacity: line ? 1 : 0,
            transition: "opacity 220ms ease",
            pointerEvents: "none",
          }}
        >
          {line}
        </p>
      )}
      <p
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 16,
          bottom: 12,
          margin: 0,
          font: '13px/1.35 ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace',
          color: "#8a7fa6",
          pointerEvents: "none",
        }}
      >
        ↑ ↓ to walk
      </p>
    </div>
  );
}
