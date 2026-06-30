"use client";

import DarkCatalogPage from "@/registry/dark-catalog-page";

const BASE = "/assets/dark-catalog-page";

export default function DarkCatalogPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-black">
      <DarkCatalogPage
        logoImage={`${BASE}/wordmark.png`}
        featuredImages={Array.from(
          { length: 4 },
          (_, i) => `${BASE}/featured-${i + 1}.jpg`,
        )}
        catalogImages={Array.from(
          { length: 4 },
          (_, i) => `${BASE}/catalog-${i + 1}.jpg`,
        )}
        teamImages={Array.from(
          { length: 5 },
          (_, i) => `${BASE}/team-${i + 1}.jpg`,
        )}
      />
    </div>
  );
}
