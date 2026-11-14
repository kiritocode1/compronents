"use client";

import { useState } from "react";
import { SliderComfortable } from "@/components/site/studio-controls";
import NeonSignScene from "@/registry/neon-sign-scene";
import { SceneStudioShell, StudioToggle } from "./scene-studio-shell";

/** The source's values, from its control panel and hard-coded settings. */
const DEFAULTS = {
  blank: true,
  neonTarget: 0.54,
  flickerDelay: 2,
  noiseOpacity: 0.2,
  bloomRadius: 0.64,
  bloomLuminanceThreshold: 0.87,
  bloomLuminanceSmoothing: 0.4,
  vignetteOffset: 0.46,
  vignetteDarkness: 0.64,
  vignetteOpacity: 0.73,
  particleSize: 10,
  particleVelocity: 0.1,
  spotSpeed: 35,
  spotIntensity: 5,
  swingX: 1 / 30,
  swingY: 1 / 40,
};

type Settings = typeof DEFAULTS;
type NumberKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never;
}[keyof Settings];

export default function NeonSignSceneStudio() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [run, setRun] = useState(0);
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
      name="neon-sign-scene"
      onReplay={() => setRun((n) => n + 1)}
      replayLabel="Replay the flicker"
      onReset={() => setS(DEFAULTS)}
      stage={
        <NeonSignScene
          key={run}
          className="h-full w-full"
          sign={s.blank ? "blank" : "model"}
          neonTarget={s.neonTarget}
          flickerDelay={s.flickerDelay}
          noiseOpacity={s.noiseOpacity}
          bloomRadius={s.bloomRadius}
          bloomLuminanceThreshold={s.bloomLuminanceThreshold}
          bloomLuminanceSmoothing={s.bloomLuminanceSmoothing}
          vignetteOffset={s.vignetteOffset}
          vignetteDarkness={s.vignetteDarkness}
          vignetteOpacity={s.vignetteOpacity}
          particleSize={s.particleSize}
          particleVelocity={s.particleVelocity}
          spotSpeed={s.spotSpeed}
          spotIntensity={s.spotIntensity}
          rotationMultipliers={{ x: s.swingX, y: s.swingY }}
        />
      }
      groups={[
        {
          label: "Sign",
          content: (
            <>
              <StudioToggle
                label="BLANK wordmark"
                checked={s.blank}
                onChange={(value) => set("blank", value)}
              />
              {slider("neonTarget", "Emission", 0, 1.5, 0.01)}
              {slider("flickerDelay", "Flicker delay", 0, 8, 0.1)}
            </>
          ),
        },
        {
          label: "Post processing",
          content: (
            <>
              {slider("noiseOpacity", "Noise", 0, 1, 0.01)}
              {slider("bloomRadius", "Bloom radius", 0, 1, 0.01)}
              {slider("bloomLuminanceThreshold", "Bloom threshold", 0, 2, 0.01)}
              {slider("bloomLuminanceSmoothing", "Bloom smoothing", 0, 1, 0.01)}
              {slider("vignetteOffset", "Vignette offset", 0, 1, 0.01)}
              {slider("vignetteDarkness", "Vignette darkness", 0, 1, 0.01)}
              {slider("vignetteOpacity", "Vignette opacity", 0, 1, 0.01)}
            </>
          ),
        },
        {
          label: "Particles",
          content: (
            <>
              {slider("particleSize", "Size", 0, 60, 1)}
              {slider("particleVelocity", "Velocity", 0, 0.5, 0.01)}
            </>
          ),
        },
        {
          label: "Room and camera",
          content: (
            <>
              {slider("spotSpeed", "Light speed", 0, 100, 1)}
              {slider("spotIntensity", "Light intensity", 0, 20, 0.5)}
              {slider("swingX", "Swing x", 0, 0.2, 0.005)}
              {slider("swingY", "Swing y", 0, 0.2, 0.005)}
            </>
          ),
        },
      ]}
    />
  );
}
