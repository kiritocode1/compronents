"use client";

import AsciiLogo from "@/registry/ascii-logo";

const LOGO = "/assets/ascii-logo/logo.png";

/** Full-viewport preview of the Interactive ASCII Logo. */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <AsciiLogo src={LOGO} />
    </div>
  );
}
