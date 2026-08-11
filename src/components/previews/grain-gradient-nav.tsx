"use client";

import GrainGradientNav from "@/registry/grain-gradient-nav";

export default function GrainGradientNavPreview() {
  return (
    <main
      className="h-screen overflow-y-auto"
      style={{ backgroundColor: "#cdcec4" }}
    >
      <GrainGradientNav />
      <div
        style={{
          minHeight: "220vh",
          padding: "9rem 2rem 6rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          color: "#4e4e4a",
        }}
      >
        <p
          style={{
            maxWidth: "34em",
            margin: "0 auto",
            fontSize: "1.05rem",
            lineHeight: 1.5,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Hover the wordmark or a link to open the panel, then run along the
          menu: the strip slides sideways while its height retargets, so it
          reads as one surface reshaping. Drag the dot handle to move the bar.
          Scroll down and the links collapse into the pill until you hover it
          again.
        </p>
      </div>
    </main>
  );
}
