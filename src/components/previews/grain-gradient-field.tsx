"use client";

import GrainGradientField from "@/registry/grain-gradient-field";

export default function GrainGradientFieldPreview() {
  return (
    <main className="h-screen overflow-hidden">
      <GrainGradientField
        style={{
          width: "100%",
          height: "100%",
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
            padding: "0 1.5rem",
            textAlign: "center",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(3rem, 15cqw, 14rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.07em",
              fontWeight: 400,
              color: "#4e4e4a",
            }}
          >
            Achievements
          </h1>
          <p
            style={{
              margin: "2.5rem 0 0",
              maxWidth: "40em",
              fontSize: "clamp(0.85rem, 1.4cqw, 1.4rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.03em",
              color: "#787973",
            }}
          >
            Move the pointer across the field. The trail is a ping-pong buffer
            holding direction as hue and speed as value, which the pass above it
            reads back as a displacement, so the gradient bends where you have
            been and settles again once you stop.
          </p>
        </div>
      </GrainGradientField>
    </main>
  );
}
