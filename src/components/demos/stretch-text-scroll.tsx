"use client";

import StretchTextScroll from "@/registry/stretch-text-scroll";

export default function StretchTextScrollDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-[rgba(17,39,11,1)]">
      <StretchTextScroll />
    </div>
  );
}
