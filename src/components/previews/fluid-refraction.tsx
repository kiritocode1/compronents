"use client";

import {
  fluidSourceImage,
  fluidSourceSettings,
} from "@/components/demos/fluid-refraction";
import { FluidRefraction } from "@/registry/fluid-refraction";

export default function FluidRefractionPreview() {
  return (
    <main style={{ height: "100dvh", overflow: "hidden" }}>
      <FluidRefraction image={fluidSourceImage} {...fluidSourceSettings} />
    </main>
  );
}
