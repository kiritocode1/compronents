"use client";

import FisheyeScroll from "@/registry/fisheye-scroll";

const PORTRAIT = "/assets/fisheye-scroll/portrait.png";

/**
 * Bounded preview of Fisheye Scroll. Scroll slides the fisheye marquee from
 * left to right, behind the person. Pass effect="forward" to put the type
 * over them.
 */
export default function Demo() {
  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-md">
      <FisheyeScroll portraitSrc={PORTRAIT} />
    </div>
  );
}
