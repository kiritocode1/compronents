"use client";

import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import BunkerScene from "@/registry/bunker-scene";
import { SceneStudioShell, StudioToggle } from "./scene-studio-shell";

/** The source's values, from its control panel and hard-coded settings. */
const DEFAULTS = {
  sunColor: "#ff0000",
  sunX: -0.1,
  sunY: -0.15,
  sunZ: -0.45,
  noise: true,
  noiseOpacity: 0.75,
  density: 0.9,
  decay: 0.92,
  weight: 0.4,
  exposure: 0.4,
  clampMax: 1,
  samples: 100,
  blur: true,
  fogColor: "#000000",
  fogNear: 8.8,
  fogFar: 9.6,
  ambientLightIntensity: 0.8,
  particleCount: 1000,
  particleSize: 25,
  particleColor: "#ffffff",
  particleAlpha: 0.25,
  particleSpeed: 0.1,
  particleDisplacement: 0.5,
  rotationStrength: 1,
};

type Settings = typeof DEFAULTS;
type NumberKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never;
}[keyof Settings];

export default function BunkerSceneStudio() {
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
      name="bunker-scene"
      onReplay={() => setRun((n) => n + 1)}
      replayLabel="Replay the flicker"
      onReset={() => setS(DEFAULTS)}
      stage={
        <BunkerScene
          key={run}
          className="w-full"
          sunColor={s.sunColor}
          sunPosition={[s.sunX, s.sunY, s.sunZ]}
          noise={s.noise}
          noiseOpacity={s.noiseOpacity}
          godRays={{
            density: s.density,
            decay: s.decay,
            weight: s.weight,
            exposure: s.exposure,
            clampMax: s.clampMax,
            samples: s.samples,
            blur: s.blur,
          }}
          fogColor={s.fogColor}
          fogNear={s.fogNear}
          fogFar={s.fogFar}
          ambientLightIntensity={s.ambientLightIntensity}
          particleCount={s.particleCount}
          particleSize={s.particleSize}
          particleColor={s.particleColor}
          particleAlpha={s.particleAlpha}
          particleSpeed={s.particleSpeed}
          particleDisplacement={s.particleDisplacement}
          rotationStrength={s.rotationStrength}
        />
      }
      groups={[
        {
          label: "Sun",
          content: (
            <>
              <StudioColor
                label="Color"
                value={s.sunColor}
                onChange={(value) => set("sunColor", value)}
              />
              {slider("sunX", "Position x", -2, 2, 0.01)}
              {slider("sunY", "Position y", -2, 2, 0.01)}
              {slider("sunZ", "Position z", -2, 2, 0.01)}
            </>
          ),
        },
        {
          label: "God rays",
          content: (
            <>
              {slider("density", "Density", 0, 1, 0.01)}
              {slider("decay", "Decay", 0, 1, 0.01)}
              {slider("weight", "Weight", 0, 1, 0.01)}
              {slider("exposure", "Exposure", 0, 1, 0.01)}
              {slider("clampMax", "Clamp max", 0, 1, 0.01)}
              {slider("samples", "Samples", 15, 200, 1)}
              <StudioToggle
                label="Blur"
                checked={s.blur}
                onChange={(value) => set("blur", value)}
              />
            </>
          ),
        },
        {
          label: "Post processing",
          content: (
            <>
              <StudioToggle
                label="Noise"
                checked={s.noise}
                onChange={(value) => set("noise", value)}
              />
              {slider("noiseOpacity", "Noise opacity", 0, 1, 0.01)}
            </>
          ),
        },
        {
          label: "Fog and light",
          content: (
            <>
              <StudioColor
                label="Fog color"
                value={s.fogColor}
                onChange={(value) => set("fogColor", value)}
              />
              {slider("fogNear", "Fog near", 0, 100, 0.1)}
              {slider("fogFar", "Fog far", 0, 100, 0.1)}
              {slider("ambientLightIntensity", "Ambient light", 0, 1, 0.01)}
            </>
          ),
        },
        {
          label: "Particles",
          content: (
            <>
              <StudioColor
                label="Color"
                value={s.particleColor}
                onChange={(value) => set("particleColor", value)}
              />
              {slider("particleCount", "Count", 0, 5000, 100)}
              {slider("particleSize", "Size", 0, 300, 1)}
              {slider("particleAlpha", "Alpha", 0, 1, 0.01)}
              {slider("particleSpeed", "Velocity", 0, 1, 0.01)}
              {slider("particleDisplacement", "Displacement", 0, 1, 0.01)}
            </>
          ),
        },
        {
          label: "Camera",
          content: slider("rotationStrength", "Swing", 0, 2, 0.05),
        },
      ]}
    />
  );
}
