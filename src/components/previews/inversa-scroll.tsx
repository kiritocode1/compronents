"use client";

import InversaScroll from "@/registry/inversa-scroll";

const BASE = "/assets/inversa-scroll";

/** Full-viewport preview of Inversa Scroll (scrolls within its own container). */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <InversaScroll
        heroImage={`${BASE}/hero-img.jpg`}
        maskImage={`${BASE}/mask.svg`}
        gridImage={`${BASE}/grid-overlay.svg`}
      />
    </div>
  );
}
