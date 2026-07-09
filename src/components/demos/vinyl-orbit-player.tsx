"use client";

import VinylOrbitPlayer from "@/registry/vinyl-orbit-player";

export default function VinylOrbitPlayerDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-black">
      <VinylOrbitPlayer
        coverImage="/assets/vinyl-orbit-player/sample-cover.jpg"
        diskImage="/assets/vinyl-orbit-player/disk.png"
      />
    </div>
  );
}
