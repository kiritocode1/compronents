"use client";

import ArchiveCommercePage from "@/registry/archive-commerce-page";

const BASE = "/assets/archive-commerce-page";

export default function ArchiveCommercePagePreview() {
  return (
    <ArchiveCommercePage
      heroImage={`${BASE}/hero.gif`}
      productImages={Array.from(
        { length: 6 },
        (_, i) => `${BASE}/product-${i + 1}.jpeg`,
      )}
      articleImages={Array.from(
        { length: 3 },
        (_, i) => `${BASE}/article-${i + 1}.jpeg`,
      )}
    />
  );
}
