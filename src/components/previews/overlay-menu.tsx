"use client";

import OverlayMenu from "@/registry/overlay-menu";

const LOGO = "/assets/overlay-menu/logo.png";
const HERO = "/assets/overlay-menu/hero.jpg";

/** Full-viewport preview of the Overlay Menu over a hero image. */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <OverlayMenu logo={LOGO}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HERO})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </OverlayMenu>
    </div>
  );
}
