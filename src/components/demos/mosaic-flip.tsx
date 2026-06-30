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

/**
 * Bounded preview of Mosaic Flip. Hover a project name (bottom-right) to flip
 * the wall over to that image; move away to return to the idle picture.
 */
export default function Demo() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-md">
      <MosaicFlip images={IMAGES} tileSize={48} />
    </div>
  );
}
