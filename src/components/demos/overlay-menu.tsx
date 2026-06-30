"use client";

import OverlayMenu from "@/registry/overlay-menu";

const LOGO = "/assets/overlay-menu/logo.png";
const HERO = "/assets/overlay-menu/hero.jpg";

/**
 * Bounded preview of the Overlay Menu. Click the hamburger (top-right) to sweep
 * the curtain panels down and reveal the menu; click again to reverse it.
 */
export default function Demo() {
  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-md">
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
