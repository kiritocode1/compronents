"use client";

import FilmStudioPage from "@/registry/film-studio-page";

export default function FilmStudioPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-[#e3e4d8]">
      <FilmStudioPage assetBase="/assets/film-studio-page" />
    </div>
  );
}
