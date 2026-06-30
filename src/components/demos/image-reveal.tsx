"use client";

import ImageReveal from "@/registry/image-reveal";

const IMAGES = [1, 2, 3, 4, 5].map((n) => `/assets/image-reveal/img-${n}.jpg`);

/**
 * Bounded preview of Image Reveal. Scroll inside the frame: each image wipes
 * away to expose the next, with the ASCII dissolve band scattering across the
 * seam.
 */
export default function Demo() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-md">
      <ImageReveal images={IMAGES} />
    </div>
  );
}
