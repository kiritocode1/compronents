"use client";

import DarkCatalogPage from "@/registry/dark-catalog-page";

const BASE = "/assets/dark-catalog-page";

export default function DarkCatalogPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-black">
      <DarkCatalogPage assetBase={BASE} />
    </div>
  );
}
