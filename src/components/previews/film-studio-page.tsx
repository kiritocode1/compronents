"use client";

import FilmStudioPage from "@/registry/film-studio-page";

const BASE = "/assets/film-studio-page";

export default function FilmStudioPagePreview() {
  return (
    <FilmStudioPage
      videoSrc={`${BASE}/hero.mp4`}
      bannerImage={`${BASE}/banner.jpg`}
      spotlightImages={Array.from(
        { length: 8 },
        (_, i) => `${BASE}/spotlight-${i + 1}.jpg`,
      )}
    />
  );
}
