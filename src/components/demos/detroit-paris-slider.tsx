"use client";

import DetroitParisSlider from "@/registry/detroit-paris-slider";

const IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/assets/detroit-paris-slider/slide-img-${i + 1}.jpg`,
);

export default function DetroitParisSliderDemo() {
  return (
    <div className="h-[620px] w-full overflow-hidden bg-[#edede7]">
      <DetroitParisSlider images={IMAGES} />
    </div>
  );
}
