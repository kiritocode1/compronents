"use client";

import AsciiImageReveal from "@/registry/ascii-image-reveal";

const IMAGES = Array.from(
  { length: 15 },
  (_, i) => `/assets/ascii-image-reveal/img${i + 1}.jpg`,
);

export default function AsciiImageRevealPreview() {
  return (
    <main className="min-h-screen bg-black">
      <AsciiImageReveal images={IMAGES} embedded={false} />
    </main>
  );
}
