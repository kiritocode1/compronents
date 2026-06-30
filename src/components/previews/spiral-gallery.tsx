"use client";

import SpiralGallery from "@/registry/spiral-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/spiral-gallery/img-${i + 1}.jpg`,
);

/** Full-viewport preview of Spiral Gallery (scrolls within its own container). */
export default function SpiralGalleryPreview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <SpiralGallery images={IMAGES} />
    </div>
  );
}
