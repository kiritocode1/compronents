"use client";

import { useRef, useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import GlyphRain, { type GlyphRainHandle } from "@/registry/glyph-rain";
import { SceneStudioShell, StudioToggle } from "./scene-studio-shell";

/** The source's control panel values, and its hard-coded gravity. */
const DEFAULTS = {
  vignetteOffset: 0.4,
  vignetteDarkness: 0.6,
  vignetteOpacity: 1,
  ditherSize: 200,
  color: "#ff4300",
  gravity: 4,
  paused: false,
};

type Settings = typeof DEFAULTS;
type NumberKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never;
}[keyof Settings];

export default function GlyphRainStudio() {
  const rain = useRef<GlyphRainHandle>(null);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const slider = (
    key: NumberKey,
    label: string,
    min: number,
    max: number,
    step: number,
  ) => (
    <SliderComfortable
      key={key}
      variant="scrubber"
      label={label}
      value={s[key]}
      onChange={(value) => set(key, value)}
      min={min}
      max={max}
      step={step}
    />
  );

  return (
    <SceneStudioShell
      name="glyph-rain"
      onReplay={() => rain.current?.replay()}
      replayLabel="Drop again"
      onReset={() => setS(DEFAULTS)}
      stage={
        <GlyphRain
          ref={rain}
          className="w-full"
          color={s.color}
          ditherSize={s.ditherSize}
          gravity={s.gravity}
          vignetteOffset={s.vignetteOffset}
          vignetteDarkness={s.vignetteDarkness}
          vignetteOpacity={s.vignetteOpacity}
          paused={s.paused}
        />
      }
      groups={[
        {
          label: "Material",
          content: (
            <>
              <StudioColor
                label="Color"
                value={s.color}
                onChange={(value) => set("color", value)}
              />
              {slider("ditherSize", "Dithering", 0, 1024, 1)}
            </>
          ),
        },
        {
          label: "Vignette",
          content: (
            <>
              {slider("vignetteOffset", "Offset", 0, 1, 0.01)}
              {slider("vignetteDarkness", "Darkness", 0, 1, 0.01)}
              {slider("vignetteOpacity", "Opacity", 0, 1, 0.01)}
            </>
          ),
        },
        {
          label: "World",
          content: (
            <>
              <StudioToggle
                label="Play"
                checked={!s.paused}
                onChange={(value) => set("paused", !value)}
              />
              {slider("gravity", "Gravity", 0, 20, 0.1)}
            </>
          ),
        },
      ]}
    />
  );
}
