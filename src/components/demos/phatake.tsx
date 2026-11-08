"use client";

import Phatake from "@/registry/phatake";

/**
 * Bounded preview of Phatake. Tap the logo to have a child light the next
 * cracker there; space lights one at a random spot.
 */
export default function Demo() {
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-md bg-white">
      <Phatake />
    </div>
  );
}
