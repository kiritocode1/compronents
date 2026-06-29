"use client";

import AnimatedFooter from "@/registry/animated-footer";

/**
 * Embedded preview of the Animated Footer. The full component takes over the
 * viewport and reveals on page scroll; `embedded` contains it to this box and
 * reveals it on enter so it can live inside the bounded demo stage.
 *
 * Move your cursor across the hands to light up the ASCII clusters.
 */
export default function Demo() {
  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-md">
      <AnimatedFooter embedded />
    </div>
  );
}
