"use client";

import SpiralGallery from "@/registry/spiral-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/spiral-gallery/img-${i + 1}.jpg`,
);

export default function SpiralGalleryDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-[#242424]">
      <SpiralGallery images={IMAGES} />
    </div>
  );
}
