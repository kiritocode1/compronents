"use client";

import PanVideoCanvas from "@/registry/pan-video-canvas";

export default function PanVideoCanvasDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <PanVideoCanvas />
    </div>
  );
}
