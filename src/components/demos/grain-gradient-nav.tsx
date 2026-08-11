"use client";

import GrainGradientNav from "@/registry/grain-gradient-nav";

export default function GrainGradientNavDemo() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "36rem",
        overflow: "hidden",
        backgroundColor: "#cdcec4",
      }}
    >
      <GrainGradientNav embedded />
    </div>
  );
}
