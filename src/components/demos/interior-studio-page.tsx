"use client";

import InteriorStudioPage from "@/registry/interior-studio-page";

export default function InteriorStudioPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-hidden rounded-md bg-black">
      <InteriorStudioPage assetBase="/interior-studio-page" height="100%" />
    </div>
  );
}
