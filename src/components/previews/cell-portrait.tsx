"use client";

import CellPortrait from "@/registry/cell-portrait";

export default function CellPortraitPreview() {
  return (
    <main className="h-svh w-full">
      <CellPortrait
        src="/assets/cell-portrait/miku.webp"
        alt="Illustration of Hatsune Miku drawn as joined circles"
      />
    </main>
  );
}
