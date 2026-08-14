"use client";

import FisheyeScroll from "@/registry/fisheye-scroll";

const PORTRAIT = "/assets/fisheye-scroll/portrait.png";

/** Full-viewport preview of Fisheye Scroll (scrolls within its own container). */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <FisheyeScroll portraitSrc={PORTRAIT} />
    </div>
  );
}
