"use client";

import AccordionFrames from "@/registry/accordion-frames";

const IMAGES = Array.from(
  { length: 20 },
  (_, i) => `/assets/accordion-frames/spotlight-${i + 1}.jpg`,
);

/**
 * Full-viewport preview of Accordion Frames — the focus beams run all the way to
 * the top and bottom of the screen, as intended.
 */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <AccordionFrames images={IMAGES} />
    </div>
  );
}
