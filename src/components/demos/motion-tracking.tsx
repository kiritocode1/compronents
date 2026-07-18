"use client";

import MotionTracking from "@/registry/motion-tracking";

export default function MotionTrackingDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <MotionTracking />
    </div>
  );
}
