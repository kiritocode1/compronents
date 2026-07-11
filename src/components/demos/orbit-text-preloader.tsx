"use client";

import OrbitTextPreloader from "@/registry/orbit-text-preloader";

export default function OrbitTextPreloaderDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-[#d1d9b8]">
      <OrbitTextPreloader heroImage="/assets/orbit-text-preloader/hero.jpg" />
    </div>
  );
}
