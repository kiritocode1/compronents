"use client";

import AsciiLogo from "@/registry/ascii-logo";

const LOGO = "/assets/ascii-logo/logo.png";

/**
 * Bounded preview of the Interactive ASCII Logo. Move the cursor through the
 * wordmark to shove the glyphs around — they spring back when you leave.
 */
export default function Demo() {
  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-md">
      <AsciiLogo src={LOGO} />
    </div>
  );
}
