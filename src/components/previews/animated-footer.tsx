"use client";

import AnimatedFooter from "@/registry/animated-footer";

/**
 * Full-viewport preview of the Animated Footer. A tall intro section sits above
 * it so you scroll down and watch the footer reveal — hands fully visible at the
 * left/right edges, wordmark at full scale. Uses `embedded` so the reveal is
 * driven by the fullscreen scroll container (IntersectionObserver) rather than
 * the window.
 */
export default function Preview() {
  return (
    <>
      <section
        style={{
          position: "relative",
          zIndex: 1,
          height: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#0b0b0b",
          color: "#ff6a00",
          fontFamily: "monospace",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            Blank — aryank.space
          </p>
          <p
            style={{ marginTop: "1.25rem", opacity: 0.45, fontSize: "0.8rem" }}
          >
            scroll ↓
          </p>
        </div>
      </section>

      <div style={{ position: "relative", height: "100svh" }}>
        <AnimatedFooter embedded />
      </div>
    </>
  );
}
