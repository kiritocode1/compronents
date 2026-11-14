"use client";

import ImagePixelation from "@/registry/image-pixelation";

export default function ImagePixelationPreview() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-black px-4">
      <ImagePixelation alt="BLANK beanie" className="w-full max-w-[960px]" />
    </main>
  );
}
