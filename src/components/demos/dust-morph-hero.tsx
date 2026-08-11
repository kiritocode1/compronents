"use client";

import DustMorphHero from "@/registry/dust-morph-hero";

export default function DustMorphHeroDemo() {
  return (
    <div className="h-[100svh] w-full overflow-hidden">
      <DustMorphHero
        eyebrow="BLANK"
        shapes={[
          {
            label: "Curated systems",
            model: "https://dobre.agency/models/shape_a_v4.bin",
            yaw: -15,
          },
          {
            label: "Considered motion",
            model: "https://dobre.agency/models/shape_b_v4.bin",
            yaw: -35,
          },
          {
            label: "Durable interfaces",
            model: "https://dobre.agency/models/shape_c_v4.bin",
            yaw: -15,
          },
          {
            label: "Quiet machinery",
            model: "https://dobre.agency/models/shape_e_v4.bin",
            yaw: 155,
          },
        ]}
      />
    </div>
  );
}
