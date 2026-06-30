"use client";

import DetroitParisSlider from "@/registry/detroit-paris-slider";

const IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/assets/detroit-paris-slider/slide-img-${i + 1}.jpg`,
);

export default function DetroitParisSliderPreview() {
  return (
    <main className="h-screen overflow-hidden bg-[#edede7]">
      <DetroitParisSlider images={IMAGES} />
    </main>
  );
}
