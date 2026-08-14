"use client";

import FluidImage from "@/registry/fluid-image";

export default function FluidImageDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-[#0b0b0c] p-24">
      <div className="h-[420px] w-full max-w-[680px]">
        <FluidImage
          image="/assets/tilt-card-stack/img3.jpg"
          alt="Saturated still that smears under the cursor."
          preset="tropical"
        />
      </div>
    </div>
  );
}
