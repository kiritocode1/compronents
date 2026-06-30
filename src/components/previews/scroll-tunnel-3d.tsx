"use client";

import ScrollTunnel3D from "@/registry/scroll-tunnel-3d";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/scroll-tunnel-3d/img-${i + 1}.jpg`,
);

export default function ScrollTunnel3DPreview() {
  return (
    <main className="h-screen overflow-hidden bg-black">
      <ScrollTunnel3D
        images={IMAGES}
        title="Through the archive"
        caption="Scroll or drag to fall deeper into the stack."
      />
    </main>
  );
}
