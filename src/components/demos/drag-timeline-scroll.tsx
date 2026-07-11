"use client";

import DragTimelineScroll from "@/registry/drag-timeline-scroll";

export default function DragTimelineScrollDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <DragTimelineScroll />
    </div>
  );
}
