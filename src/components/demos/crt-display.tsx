"use client";

import CrtDisplay from "@/registry/crt-display";

const PROJECTS = [
  { label: "District", image: "/assets/crt-display/project-img-1.jpg" },
  { label: "Waypoint", image: "/assets/crt-display/project-img-2.jpg" },
  { label: "Corridor", image: "/assets/crt-display/project-img-3.jpg" },
  { label: "Archive", image: "/assets/crt-display/project-img-4.jpg" },
  { label: "Terminal", image: "/assets/crt-display/project-img-5.jpg" },
];

export default function CrtDisplayDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-[#b0b0b0]">
      <CrtDisplay
        src="/assets/crt-display/monitor.glb"
        defaultImage="/assets/crt-display/default.jpg"
        projects={PROJECTS}
      />
    </div>
  );
}
