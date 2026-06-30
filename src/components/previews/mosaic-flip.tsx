"use client";

import MosaicFlip from "@/registry/mosaic-flip";

const IMAGES = [
  "default.jpg",
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.jpg",
  "img6.jpg",
].map((f) => `/assets/mosaic-flip/${f}`);

/** Full-viewport preview of Mosaic Flip. */
export default function Preview() {
  return (
    <div
      style={{
        position: "relative",
        height: "100svh",
        width: "100%",
        background: "#171717",
      }}
    >
      <MosaicFlip images={IMAGES} />
    </div>
  );
}
