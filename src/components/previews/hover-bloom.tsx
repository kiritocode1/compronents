"use client";

import { HoverBloom } from "@/registry/hover-bloom";

export default function HoverBloomPreview() {
  return (
    <main style={{ height: "100dvh", overflow: "hidden" }}>
      <HoverBloom palette="warm" paperTint="#FDF6EE" gridColor="transparent" />
    </main>
  );
}
