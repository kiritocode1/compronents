"use client";

import CurveGallery from "@/registry/curve-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, index) => `/assets/scroll-tunnel-3d/img-${index + 1}.jpg`,
);

export default function CurveGalleryPreview() {
  return (
    <main className="h-screen overflow-hidden bg-[#f2f0eb]">
      <CurveGallery images={IMAGES} />
    </main>
  );
}
