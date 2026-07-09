"use client";

import VokuImageSlider from "@/registry/voku-image-slider";

const IMAGES = Array.from(
  { length: 9 },
  (_, index) => `/assets/voku-image-slider/img${index + 1}.jpg`,
);

export default function VokuImageSliderDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-[#e7e4dc]">
      <VokuImageSlider images={IMAGES} />
    </div>
  );
}
