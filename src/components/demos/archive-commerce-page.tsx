"use client";

import ArchiveCommercePage from "@/registry/archive-commerce-page";

export default function ArchiveCommercePageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-black">
      <ArchiveCommercePage assetBase="/assets/archive-commerce-page" />
    </div>
  );
}
