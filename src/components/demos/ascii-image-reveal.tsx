"use client";

import AsciiImageReveal from "@/registry/ascii-image-reveal";

const IMAGES = Array.from(
  { length: 15 },
  (_, i) => `/assets/ascii-image-reveal/img${i + 1}.jpg`,
);

export default function AsciiImageRevealDemo() {
  return (
    <div className="h-[620px] w-full overflow-hidden bg-black">
      <AsciiImageReveal images={IMAGES} embedded gap="1.35rem" />
    </div>
  );
}
