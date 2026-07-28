"use client";

import PixelCubeField from "@/registry/pixel-cube-field";

/**
 * Bounded preview of the Pixel Cube Field. Move the cursor across the grid to
 * aim the cubes, and click to send a ring of revolutions outward. Leave it
 * alone for three seconds and the focus starts drifting on its own.
 */
export default function Demo() {
  return (
    <div className="flex h-[560px] w-full items-center justify-center overflow-hidden rounded-md bg-[#0a0a0a]">
      <PixelCubeField size={520} gridSize={6} background="#0a0a0a" />
    </div>
  );
}
