"use client";

import HalftoneWaveHero from "@/registry/halftone-wave-hero";

export default function HalftoneWaveHeroDemo() {
  return (
    <div className="h-[100svh] w-full overflow-hidden">
      <HalftoneWaveHero
        headline="Interfaces tuned to the shape of the work"
        standfirst="BLANK builds the components that carry a product's most exacting moments, from the first frame to the last state."
        actions={[
          { label: "Read the notes", href: "#notes", variant: "muted" },
          { label: "Open the registry", href: "#registry", variant: "solid" },
        ]}
      />
    </div>
  );
}
