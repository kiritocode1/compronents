"use client";

/**
 * Balloon Zinnia. Inflated petals on a short S-curved stem, striped by one
 * looping ramp.
 *
 * Each petal is an egg-shaped ellipsoid hinged at the throat, instanced from
 * a float texture. The stem is a tube from a second texture. Both are
 * projected by the same perspective function, and both fragment shaders sample
 * one 512-wide palette. A single 14 second clock runs the sway, the breath,
 * the colour flow and the band pulse. The pointer turns the head and swells
 * the petals under it. A tap bobs the flower and squashes it.
 *
 * The component fills its parent. With no height set, the box keeps the
 * 720 / 1280 composition. Reduced motion freezes the clock and skips the
 * entrance. A hidden tab or an offscreen host stops the frame loop. If WebGL2
 * is missing, the canvas hides and the background colour stays.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { BalloonZinniaEngine } from "./engine";
import { type BalloonZinniaInput, resolveSettings } from "./model";

export { BalloonZinniaEngine } from "./engine";
export type {
  AdvancedSettings,
  BalloonZinniaInput,
  BalloonZinniaSettings,
  ColorStop,
  EntranceSettings,
  MotionSettings,
  PlacementSettings,
  ResponseSettings,
  StemSettings,
} from "./model";
export {
  DEFAULT_SETTINGS,
  PALETTE,
  resolveSettings,
} from "./model";

export interface BalloonZinniaProps extends BalloonZinniaInput {
  className?: string;
  style?: CSSProperties;
}

export default function BalloonZinnia({
  className,
  style,
  ...settings
}: BalloonZinniaProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BalloonZinniaEngine | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const engine = new BalloonZinniaEngine(host, canvas, () =>
      resolveSettings(settingsRef.current),
    );
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    // The loop parks itself once a still flower has settled. A prop change
    // has to poke it, or the new picture never draws.
    engineRef.current?.request();
  });

  const background = resolveSettings(settings).background;

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        aspectRatio: "720 / 1280",
        overflow: "hidden",
        background,
        touchAction: "pan-y",
        userSelect: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Balloon zinnia"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
