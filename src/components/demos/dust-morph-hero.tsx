"use client";

import DustMorphHero from "@/registry/dust-morph-hero";

/**
 * The clouds are served from our own Blob store rather than hotlinked, so the
 * demo does not depend on a third party staying up. `_m` variants of each shape
 * sit beside these at 65000 points if a lighter set is ever wanted.
 */
const MODEL_BASE = "/assets/dust-morph-hero";

export default function DustMorphHeroDemo() {
  return (
    <div className="h-[100svh] w-full overflow-hidden">
      <DustMorphHero
        eyebrow="BLANK"
        shapes={[
          {
            label: "Curated systems",
            model: `${MODEL_BASE}/shape_a_v4.bin`,
            yaw: -15,
          },
          {
            label: "Considered motion",
            model: `${MODEL_BASE}/shape_b_v4.bin`,
            yaw: -35,
          },
          {
            label: "Durable interfaces",
            model: `${MODEL_BASE}/shape_c_v4.bin`,
            yaw: -15,
          },
          {
            label: "Quiet machinery",
            model: `${MODEL_BASE}/shape_e_v4.bin`,
            yaw: 155,
          },
        ]}
      />
    </div>
  );
}
