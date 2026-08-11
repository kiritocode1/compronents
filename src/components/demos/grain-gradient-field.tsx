"use client";

import GrainGradientField from "@/registry/grain-gradient-field";

export default function GrainGradientFieldDemo() {
  return (
    <GrainGradientField
      style={{
        width: "100%",
        height: "100%",
        minHeight: "34rem",
        containerType: "inline-size",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "3rem 1.5rem",
          textAlign: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(2.5rem, 15cqw, 11rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.06em",
            fontWeight: 400,
            color: "#4e4e4a",
          }}
        >
          Achievements
        </h2>
        <p
          style={{
            margin: "1.75rem 0 0",
            maxWidth: "38em",
            fontSize: "clamp(0.8rem, 1.6cqw, 1.05rem)",
            lineHeight: 1.45,
            letterSpacing: "-0.02em",
            color: "#787973",
          }}
        >
          The grain here is not an overlay. It is the last pass of the shader,
          scattering the frame it just rendered, which is why it thickens along
          the lit edge and thins out across the flat ground.
        </p>
      </div>
    </GrainGradientField>
  );
}
