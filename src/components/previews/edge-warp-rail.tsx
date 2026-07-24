"use client";

import EdgeWarpRail from "@/registry/edge-warp-rail";

/** Full-viewport preview of Edge Warp Rail (owns its own scroll container). */
export default function EdgeWarpRailPreview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <EdgeWarpRail />
    </div>
  );
}
