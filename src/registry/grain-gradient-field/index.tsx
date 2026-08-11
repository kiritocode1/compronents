"use client";

/**
 * Grain Gradient Field - a soft lit shape under heavy grain, on a canvas.
 *
 * The look is not a CSS gradient with a noise PNG on top. A raymarched shape
 * is flat-shaded by a single key light, smeared twice by noise-steered blur at
 * quarter and half resolution, warped by a slow standing wave, displaced by a
 * decaying pointer trail, and finally scattered by 24 random taps per pixel.
 * That last pass is what reads as film grain, and because it samples the frame
 * rather than overlaying a texture, the grain sits INSIDE the gradient - it
 * gets denser where the image has contrast and vanishes where it is flat, which
 * is the part a noise overlay can never fake.
 *
 * Everything is art-directable through `config`, but the defaults are the
 * scene's own values, and all eight shaders are reproduced byte-for-byte at
 * those defaults (tests/grain-gradient-shaders.test.mjs proves it).
 *
 * For a small dark version sized for a pill or a bar, install its sibling
 * Grain Gradient Nav instead of shrinking this one.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  coverBox,
  GrainFieldEngine,
  hexToRgb,
  loadShapeTexture,
} from "./engine";
import { DEFAULT_CONFIG, type GrainFieldConfig } from "./shaders";

export { coverBox, GrainFieldEngine, hexToRgb } from "./engine";
export type { GrainFieldConfig, Vec3 } from "./shaders";
export { DEFAULT_CONFIG } from "./shaders";

const SHAPE_URL =
  "https://ui.aryank.space/assets/grain-gradient/shape-wave.png";

export interface GrainGradientFieldProps {
  /** Flat ground the whole stack composites over. */
  baseColor?: string;
  /** Flat-shaded colour of the lit shape. */
  shapeColor?: string;
  /**
   * Scene aspect. The field is drawn at this ratio and anchored to the
   * container's top-left, so the shape keeps its proportions as the section
   * reflows instead of stretching with it.
   */
  aspectWidth?: number;
  aspectHeight?: number;
  /** Fill the container (true) or fit inside it (false). */
  cover?: boolean;
  /** MSDF atlas the shape pass raymarches. Swap it to change the silhouette. */
  shapeSrc?: string;
  /** Backing-store multiplier. 1.5 is the source's value and a good default. */
  dpi?: number;
  /** Render gate. The source ran 30; the motion is tuned for it. */
  fps?: number;
  /** Let pointer movement drive the trail and the warp. */
  interactive?: boolean;
  /** Stop rendering entirely and hold the first painted frame. */
  paused?: boolean;
  /** Per-knob overrides on top of the scene's own values. */
  config?: Partial<GrainFieldConfig>;
  /** Fade the top edge into this colour, over `fadeTop` of the height. */
  fadeTopColor?: string;
  fadeTop?: number;
  /** Fade the bottom edge into this colour, over `fadeBottom` of the height. */
  fadeBottomColor?: string;
  fadeBottom?: number;
  /** Content laid over the field. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function GrainGradientField({
  baseColor = "#f7f8ec",
  shapeColor = "#cdcec4",
  aspectWidth = 1440,
  aspectHeight = 1800,
  cover = true,
  shapeSrc = SHAPE_URL,
  dpi = 1.5,
  fps = 30,
  interactive = true,
  paused = false,
  config,
  fadeTopColor = "#b8b9af",
  fadeTop = 0.2,
  fadeBottomColor = "#f7f8ec",
  fadeBottom = 0.2,
  children,
  className,
  style,
}: GrainGradientFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GrainFieldEngine | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const resolved = useMemo<GrainFieldConfig>(
    () => ({
      ...DEFAULT_CONFIG,
      baseColor: hexToRgb(baseColor),
      shapeColor: hexToRgb(shapeColor),
      ...config,
    }),
    [baseColor, shapeColor, config],
  );

  // Size the drawing box so the fixed-aspect scene covers the container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const next = coverBox(
        container.clientWidth,
        container.clientHeight,
        aspectWidth,
        aspectHeight,
        cover,
      );
      setBox((current) =>
        current.width === next.width && current.height === next.height
          ? current
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [aspectWidth, aspectHeight, cover]);

  // One engine per canvas. Config changes relink programs in place rather than
  // tearing the context down, so a slider drag does not restart the trail.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || box.width === 0 || box.height === 0) return;

    let engine: GrainFieldEngine | null = null;
    let cancelled = false;

    loadShapeTexture(shapeSrc)
      .then((image) => {
        if (cancelled) return;
        engine = new GrainFieldEngine({
          canvas,
          shapeTexture: image,
          config: resolved,
          dpi,
          fps,
          interactive,
          hitTarget: container,
        });
        engineRef.current = engine;
        engine.render();
        setReady(true);
        if (!paused) engine.start();
      })
      .catch(() => {
        // A missing atlas leaves the base colour showing, which is the right
        // degraded state for a background: quiet, not broken.
      });

    return () => {
      cancelled = true;
      engineRef.current = null;
      engine?.dispose();
      setReady(false);
    };
    // Recreating on box change is deliberate: every render target is sized off
    // the canvas, so a resize is a full rebuild either way.
  }, [shapeSrc, dpi, fps, box.width, box.height]);

  useEffect(() => {
    engineRef.current?.setConfig(resolved);
    engineRef.current?.render();
  }, [resolved]);

  useEffect(() => {
    engineRef.current?.setInteractive(interactive);
  }, [interactive]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (paused) engine.stop();
    else engine.start();
  }, [paused, ready]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: baseColor,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: box.width ? `${box.width}px` : "100%",
          height: box.height ? `${box.height}px` : "100%",
          display: "block",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />
      {fadeTop > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(180deg, ${fadeTopColor}, transparent ${fadeTop * 100}%)`,
          }}
        />
      )}
      {fadeBottom > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(0deg, ${fadeBottomColor}, transparent ${fadeBottom * 100}%)`,
          }}
        />
      )}
      {children ? (
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
