"use client";

import { warpedGalleryProjects } from "@/components/demos/warped-gallery";
import { WarpedGallery } from "@/registry/warped-gallery";

export default function WarpedGalleryPreview() {
  return (
    <main style={{ height: "100dvh", overflow: "hidden" }}>
      <WarpedGallery projects={warpedGalleryProjects} showGrid={false} />
    </main>
  );
}
