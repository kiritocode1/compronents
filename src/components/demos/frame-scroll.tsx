"use client";

import FrameScroll from "@/registry/frame-scroll";

const HERO = "/assets/frame-scroll/hero.jpg";
const IMAGES = Array.from(
  { length: 16 },
  (_, i) => `/assets/frame-scroll/img-${i + 1}.jpg`,
);

export default function FrameScrollDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-[#e3e3db]">
      <FrameScroll heroImage={HERO} images={IMAGES} />
    </div>
  );
}
