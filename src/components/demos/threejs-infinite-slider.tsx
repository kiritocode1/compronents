"use client";

import ThreejsInfiniteSlider from "@/registry/threejs-infinite-slider";

const SLIDES = [
  "Contour",
  "Velum Drift",
  "Quiet Exchange",
  "Earth Routine",
  "Metal Echo",
  "Tanned Edge",
  "Humidity",
  "Limestone Air",
  "Warm Surface",
  "Dust And Craft",
].map((name, index) => ({
  name,
  image: `/assets/threejs-infinite-slider/img${index + 1}.jpg`,
}));

export default function ThreejsInfiniteSliderDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-[#141414]">
      <ThreejsInfiniteSlider slides={SLIDES} />
    </div>
  );
}
