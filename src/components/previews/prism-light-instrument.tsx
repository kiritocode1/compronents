"use client";

import PrismLightInstrument from "@/registry/prism-light-instrument";

export default function PrismLightInstrumentPreview() {
  return (
    <main className="h-screen overflow-hidden bg-black">
      <PrismLightInstrument autoFocus />
    </main>
  );
}
