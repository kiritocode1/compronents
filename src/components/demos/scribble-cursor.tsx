"use client";

import { useRef } from "react";
import ScribbleCursor from "@/registry/scribble-cursor";

export default function ScribbleCursorDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#ededed]"
    >
      <ScribbleCursor container={stageRef} />
    </div>
  );
}
