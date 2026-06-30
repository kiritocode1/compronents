"use client";

import ArchiveCommercePage from "@/registry/archive-commerce-page";

export default function ArchiveCommercePageDemo() {
  return (
    <div className="h-[760px] w-full overflow-hidden rounded-md bg-black">
      <ArchiveCommercePage assetBase="/archive-commerce-page" height="100%" />
    </div>
  );
}
