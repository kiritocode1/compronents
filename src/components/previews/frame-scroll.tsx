"use client";

import FrameScroll from "@/registry/frame-scroll";

const HERO = "/assets/frame-scroll/hero.jpg";
const IMAGES = Array.from(
  { length: 16 },
  (_, i) => `/assets/frame-scroll/img-${i + 1}.jpg`,
);

/** Full-viewport preview of Frame Scroll (scrolls within its own container). */
export default function FrameScrollPreview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <FrameScroll heroImage={HERO} images={IMAGES} />
    </div>
  );
}
