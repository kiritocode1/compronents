"use client";

import ImagePixelation from "@/registry/image-pixelation";

export default function ImagePixelationDemo() {
  return (
    <div className="flex h-[680px] w-full items-center justify-center overflow-hidden bg-black px-4">
      <ImagePixelation alt="BLANK beanie" className="w-full max-w-[960px]" />
    </div>
  );
}
