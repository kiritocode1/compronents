"use client";

import InversaScroll from "@/registry/inversa-scroll";

const BASE = "/assets/inversa-scroll";

/**
 * Bounded preview of Inversa Scroll. Scroll inside the frame: the masked window
 * closes to greyscale with markers and a wireframe grid, then re-opens to color.
 */
export default function Demo() {
  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-md">
      <InversaScroll
        heroImage={`${BASE}/hero-img.jpg`}
        maskImage={`${BASE}/mask.svg`}
        gridImage={`${BASE}/grid-overlay.svg`}
      />
    </div>
  );
}
