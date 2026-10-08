"use client";

import FluidRefraction from "@/registry/fluid-refraction";

export const fluidSourceSettings = {
  refractionAmount: 100,
  chromaticAberration: 100,
  highlight: 200,
  disappearSpeed: 5.9,
  velocityDissipation: 99,
  pressureDissipation: 0,
  pressureIterations: 50,
  curl: 18,
  splatRadius: 3,
};
export const fluidSourceImage =
  "https://ui.aryank.space/assets/fluid-refraction/music-cover.png";

export default function FluidRefractionDemo() {
  return (
    <FluidRefraction
      image={fluidSourceImage}
      {...fluidSourceSettings}
      style={{ height: 577 }}
    />
  );
}
