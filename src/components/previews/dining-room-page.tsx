"use client";

import DiningRoomPage from "@/registry/dining-room-page";

const BASE = "/assets/dining-room-page";

export default function DiningRoomPagePreview() {
  return (
    <DiningRoomPage
      heroImage={`${BASE}/hero.jpg`}
      aboutImages={Array.from(
        { length: 6 },
        (_, i) => `${BASE}/about-${i + 1}.jpg`,
      )}
      menuImages={Array.from(
        { length: 5 },
        (_, i) => `${BASE}/menu-${i + 1}.jpg`,
      )}
      ctaImage={`${BASE}/cta.jpg`}
    />
  );
}
