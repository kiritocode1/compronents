"use client";

import FlowFieldText from "@/registry/flow-field-text";

/** Full-viewport preview of Flow Field Text. */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <FlowFieldText />
    </div>
  );
}
