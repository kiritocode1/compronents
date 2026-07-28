"use client";

import StoryReelViewer from "@/registry/story-reel-viewer";

export default function StoryReelViewerDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <StoryReelViewer />
    </div>
  );
}
