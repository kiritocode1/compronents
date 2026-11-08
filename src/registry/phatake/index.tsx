"use client";

/**
 * Phatake - Diwali crackers on the BLANK Interfaces logo, as an isometric
 * pixel diorama.
 *
 * The logo is extruded into a black slab on a sandstone courtyard with a
 * rangoli and diyas. Tap a spot on the logo and the nearest of three children
 * (a lehenga, a kurta, a Nehru jacket) runs over, lights the next cracker and
 * runs off covering their ears. Sutli bombs break chunks out of the slab,
 * rockets climb off it, anaar fountains and chakris scorch it, ladis litter it
 * with red paper. Twelve crackers a round; after the last one a tap sweeps the
 * logo clean. Space lights one at a random spot.
 *
 * The scene is a 360 by 280 software rasteriser (depth buffer, Bayer dither,
 * hue-shifted ramps, long screen-right shadows) scaled to the container by a
 * whole number of device pixels, never interpolated. It renders only the
 * canvas, with no text, and pauses while off screen. No dependencies.
 *
 * Renderer ported from Pixel Plays (MIT, github.com/amirmushichge/pixel-plays).
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import { H, W } from "./engine";
import { mountPhatake } from "./game";

export interface PhatakeProps {
  /** Play synthesized cracker sounds once the player taps. */
  sound?: boolean;
  /** Accessible label for the canvas. */
  label?: string;
  className?: string;
}

export default function Phatake({
  sound = true,
  label = "The BLANK Interfaces logo as a courtyard slab with three children. Tap the logo to have a child light the next cracker there. Space lights one at a random spot.",
  className,
}: PhatakeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const game = mountPhatake(canvas, { sound });

    // whole device pixels per canvas pixel, so the pixel grid never blurs
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const fitScale = Math.min(wrap.clientWidth / W, wrap.clientHeight / H);
      const scale = Math.max(1, Math.floor(fitScale * dpr)) / dpr;
      canvas.style.width = `${W * scale}px`;
      canvas.style.height = `${H * scale}px`;
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(wrap);

    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) game.resume();
      else game.pause();
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      resize.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      game.destroy();
    };
  }, [sound]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
        background: "#fff",
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label={label}
        style={{
          display: "block",
          imageRendering: "pixelated",
          touchAction: "none",
          cursor: "pointer",
          outline: "none",
        }}
      />
    </div>
  );
}
