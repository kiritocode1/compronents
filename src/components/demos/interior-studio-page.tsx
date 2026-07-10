"use client";

import InteriorStudioPage from "@/registry/interior-studio-page";

export default function InteriorStudioPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-black">
      <InteriorStudioPage assetBase="/assets/interior-studio-page" />
    </div>
  );
}
