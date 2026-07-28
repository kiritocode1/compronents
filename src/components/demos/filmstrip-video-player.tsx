"use client";

import FilmstripVideoPlayer from "@/registry/filmstrip-video-player";

export default function FilmstripVideoPlayerDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <FilmstripVideoPlayer />
    </div>
  );
}
