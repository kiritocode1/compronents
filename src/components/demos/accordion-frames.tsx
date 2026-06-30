"use client";

import AccordionFrames from "@/registry/accordion-frames";

const IMAGES = Array.from(
  { length: 20 },
  (_, i) => `/assets/accordion-frames/spotlight-${i + 1}.jpg`,
);

/**
 * Bounded preview of Accordion Frames. Hover across the slats (or tap, on a
 * touch screen) to spring each panel open; the bordered indicator and its beams
 * follow the focus.
 */
export default function Demo() {
  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-md">
      <AccordionFrames images={IMAGES} panelHeight={320} />
    </div>
  );
}
