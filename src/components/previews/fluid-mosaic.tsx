"use client";

import FluidMosaic from "@/registry/fluid-mosaic";

/** Full-viewport preview of Fluid Mosaic. */
export default function Preview() {
  return (
    <div
      style={{
        position: "relative",
        height: "100svh",
        width: "100%",
        background: "#0D0D0D",
      }}
    >
      <FluidMosaic />
    </div>
  );
}
