"use client";

import PreloaderReveal from "@/registry/preloader-reveal";

const LOGO = "/assets/preloader-reveal/logo.png";
const BUTTON_LOGO = "/assets/preloader-reveal/logo-light.png";

/** Full-viewport preview of Preloader Reveal (runs the boot sequence on a loop). */
export default function PreloaderRevealPreview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <PreloaderReveal logo={LOGO} buttonLogo={BUTTON_LOGO} />
    </div>
  );
}
