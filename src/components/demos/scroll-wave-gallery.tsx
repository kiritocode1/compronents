"use client";

import ScrollWaveGallery from "@/registry/scroll-wave-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/scroll-wave-gallery/img-${i + 1}.jpg`,
);

export default function ScrollWaveGalleryDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-[#e3e4d8]">
      <ScrollWaveGallery images={IMAGES} />
    </div>
  );
}
