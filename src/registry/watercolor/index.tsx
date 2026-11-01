"use client";

import {
  type CSSProperties,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { WatercolorEngine } from "./engine";
import {
  DEFAULT_HUE,
  resolveSettings,
  type WatercolorQuality,
  type WatercolorTuning,
} from "./settings";

export type {
  WatercolorQuality,
  WatercolorSettings,
  WatercolorTuning,
} from "./settings";
export { CONTROL_RANGES, DEFAULT_HUE, DEFAULT_SETTINGS } from "./settings";

export interface WatercolorHandle {
  wash: () => void;
  clear: () => void;
}

export interface WatercolorProps {
  ref?: Ref<WatercolorHandle>;
  tuning?: WatercolorTuning;
  hue?: number;
  brushSize?: number;
  rainbow?: boolean;
  quality?: WatercolorQuality;
  wheelControls?: boolean;
  keyboardShortcuts?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function Watercolor({
  ref,
  tuning,
  hue = DEFAULT_HUE,
  brushSize = 1,
  rainbow = true,
  quality = "auto",
  wheelControls = false,
  keyboardShortcuts = false,
  className,
  style,
}: WatercolorProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<WatercolorEngine | null>(null);
  const [status, setStatus] = useState("loading");

  useImperativeHandle(
    ref,
    () => ({
      wash: () => engine.current?.wash(),
      clear: () => engine.current?.clear(),
    }),
    [],
  );

  useEffect(() => {
    if (!canvas.current) return;
    const instance = new WatercolorEngine({
      canvas: canvas.current,
      settings: resolveSettings(),
      quality: "auto",
      wheelControls: false,
      keyboardShortcuts: false,
      onReady: () => setStatus("ready"),
      onFailure: () => setStatus("unavailable"),
    });
    engine.current = instance;
    return () => {
      instance.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (engine.current) engine.current.settings = resolveSettings(tuning);
  }, [tuning]);
  useEffect(() => {
    engine.current?.setHue(hue);
  }, [hue]);
  useEffect(() => {
    engine.current?.setScale(brushSize);
  }, [brushSize]);
  useEffect(() => {
    if (engine.current) engine.current.isRainbow = rainbow;
  }, [rainbow]);
  useEffect(() => {
    engine.current?.setQuality(quality);
  }, [quality]);
  useEffect(() => {
    engine.current?.setInput({ wheelControls, keyboardShortcuts });
  }, [wheelControls, keyboardShortcuts]);

  return (
    <div
      className={className}
      data-watercolor-status={status}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: tuning?.paper ?? "#f7f3ec",
        ...style,
      }}
    >
      <canvas
        ref={canvas}
        tabIndex={keyboardShortcuts ? 0 : undefined}
        aria-label="Watercolor canvas. Drag to paint, right-click and drag to smudge."
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
          opacity: status === "ready" ? 1 : 0,
        }}
      />
      {status === "unavailable" && (
        <output
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 24,
            color: "#34312e",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Watercolor needs a browser with WebGPU support.
        </output>
      )}
    </div>
  );
}
