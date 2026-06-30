"use client";

import ScrollWaveGallery from "@/registry/scroll-wave-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/scroll-wave-gallery/img-${i + 1}.jpg`,
);

/** Full-viewport preview of Scroll Wave Gallery (scrolls within its own container). */
export default function ScrollWaveGalleryPreview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <ScrollWaveGallery images={IMAGES} />
    </div>
  );
}
