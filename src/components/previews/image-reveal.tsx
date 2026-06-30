"use client";

import ImageReveal from "@/registry/image-reveal";

const IMAGES = [1, 2, 3, 4, 5].map((n) => `/assets/image-reveal/img-${n}.jpg`);

/** Full-viewport preview of Image Reveal (scrolls within its own container). */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <ImageReveal images={IMAGES} />
    </div>
  );
}
