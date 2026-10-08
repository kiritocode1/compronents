"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  createFluidRenderer,
  type FluidMedia,
  type FluidSettings,
} from "./renderer";

export type FluidRefractionProps = FluidMedia &
  Partial<FluidSettings> & {
    className?: string;
    style?: CSSProperties;
    "aria-label"?: string;
  };

/** Fluid refraction over cover-cropped media. Supply image OR video and a height. */
export function FluidRefraction({
  image,
  video,
  className,
  style,
  "aria-label": label = "Interactive fluid refraction",
  refractionAmount = 15,
  chromaticAberration = 10,
  highlight = 50,
  disappearSpeed = 2,
  velocityDissipation = 99,
  pressureDissipation = 80,
  pressureIterations = 25,
  curl = 30,
  splatRadius = 5,
  interactOnHover = true,
}: FluidRefractionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<ReturnType<typeof createFluidRenderer>>(null);
  const settingsRef = useRef<FluidSettings>({
    refractionAmount,
    chromaticAberration,
    highlight,
    disappearSpeed,
    velocityDissipation,
    pressureDissipation,
    pressureIterations,
    curl,
    splatRadius,
    interactOnHover,
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const settings = {
      refractionAmount,
      chromaticAberration,
      highlight,
      disappearSpeed,
      velocityDissipation,
      pressureDissipation,
      pressureIterations,
      curl,
      splatRadius,
      interactOnHover,
    };
    settingsRef.current = settings;
    controllerRef.current?.update(settings);
  }, [
    refractionAmount,
    chromaticAberration,
    highlight,
    disappearSpeed,
    velocityDissipation,
    pressureDissipation,
    pressureIterations,
    curl,
    splatRadius,
    interactOnHover,
  ]);
  useEffect(() => {
    const root = rootRef.current,
      canvas = canvasRef.current;
    if (!root || !canvas) return;
    let renderer: ReturnType<typeof createFluidRenderer> = null;
    try {
      const media: FluidMedia =
        video !== undefined ? { video } : { image: image ?? "" };
      renderer = createFluidRenderer(root, canvas, media, settingsRef.current);
      controllerRef.current = renderer;
    } catch (error) {
      console.error("FluidRefraction initialization failed.", error);
    }
    setReady(renderer !== null);
    return () => {
      controllerRef.current = null;
      renderer?.dispose();
    };
  }, [image, video]);
  return (
    <div
      ref={rootRef}
      className={className}
      role="img"
      aria-label={label}
      data-fluid-refraction=""
      data-ready={ready}
      style={{
        width: "100%",
        height: "100%",
        minWidth: 100,
        minHeight: 100,
        overflow: "hidden",
        position: "relative",
        background: "#000",
        touchAction: "none",
        ...style,
      }}
    >
      {!ready &&
        (image !== undefined ? (
          <img
            src={image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <video
            src={video}
            muted
            playsInline
            controls
            aria-label={label}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ))}
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          visibility: ready ? "visible" : "hidden",
        }}
      />
    </div>
  );
}
export default FluidRefraction;
