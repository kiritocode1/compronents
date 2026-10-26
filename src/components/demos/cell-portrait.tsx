"use client";

import CellPortrait from "@/registry/cell-portrait";

export default function CellPortraitDemo() {
  return (
    <div className="h-[680px] w-full">
      <CellPortrait
        src="/assets/cell-portrait/miku.webp"
        alt="Illustration of Hatsune Miku drawn as joined circles"
      />
    </div>
  );
}
