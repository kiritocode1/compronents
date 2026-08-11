"use client";

import DustMorphHero from "@/registry/dust-morph-hero";

export default function DustMorphHeroDemo() {
  return (
    <div className="h-[100svh] w-full overflow-hidden">
      <DustMorphHero
        eyebrow="BLANK"
        shapes={[
          { label: "Curated systems" },
          { label: "Considered motion" },
          { label: "Durable interfaces" },
          { label: "Quiet machinery" },
        ]}
      />
    </div>
  );
}
