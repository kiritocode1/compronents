"use client";

import PixelCubeAvatar from "@/registry/pixel-cube-avatar";

/**
 * Bounded preview of the Pixel Cube Avatar. Hover to start it spinning, drag to
 * throw it, and click to set off a tumble.
 */
export default function Demo() {
  return (
    <div className="flex h-[460px] w-full items-center justify-center overflow-hidden rounded-md bg-[#161616]">
      <PixelCubeAvatar size={340} background="#161616" label="BLANK" />
    </div>
  );
}
