"use client";

import FilmStudioPage from "@/registry/film-studio-page";

const BASE = "/assets/film-studio-page";

export default function FilmStudioPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-black">
      <FilmStudioPage
        videoSrc={`${BASE}/hero.mp4`}
        bannerImage={`${BASE}/banner.jpg`}
        spotlightImages={Array.from(
          { length: 8 },
          (_, i) => `${BASE}/spotlight-${i + 1}.jpg`,
        )}
      />
    </div>
  );
}
