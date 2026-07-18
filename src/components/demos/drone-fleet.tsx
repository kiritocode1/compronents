"use client";

import DroneFleet from "@/registry/drone-fleet";

export default function DroneFleetDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <DroneFleet />
    </div>
  );
}
