"use client";

import IrisOutroFooter from "@/registry/iris-outro-footer";

/**
 * Full-viewport preview of the Iris Outro Footer. A tall intro section sits
 * above it so the closing screen scrubs in the way it does on a real page: the
 * discs bloom outward as the footer climbs the viewport, the stage fades up,
 * and the sign-off resolves last.
 *
 * Runs in the default page mode: the preview's scroll container is exactly one
 * viewport tall, so the footer's viewport rect gives the same progress the
 * component reads on a real page.
 */
export default function Preview() {
  return (
    <div
      style={{
        position: "relative",
        height: "100svh",
        overflowY: "auto",
        background: "#000",
      }}
    >
      <section
        style={{
          position: "relative",
          height: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#000",
          color: "#fff",
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
            BLANK, aryank.space
          </p>
          <p
            style={{ marginTop: "1.25rem", opacity: 0.45, fontSize: "0.8rem" }}
          >
            scroll ↓
          </p>
        </div>
      </section>

      <div style={{ position: "relative", height: "100svh" }}>
        <IrisOutroFooter />
      </div>
    </div>
  );
}
