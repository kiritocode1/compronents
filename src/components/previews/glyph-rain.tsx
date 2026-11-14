"use client";

import GlyphRain from "@/registry/glyph-rain";

export default function GlyphRainPreview() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      <GlyphRain className="w-full" />
    </main>
  );
}
