"use client";

import SwitchOnHoverTabs from "@/registry/switch-on-hover-tabs";

const items = [
  {
    title: "Spatial Optimization",
    description:
      "We measure how a room is actually used before we move a single wall, so the plan you approve is the plan you end up living in.",
    image: "/assets/catalog-swap-gallery/img1.jpg",
    alt: "Wide interior with light falling across a bare floor.",
  },
  {
    title: "Renovation Guidance",
    description:
      "Drawings, permits, and trades held on one schedule, with a single point of contact from demolition through the final walkthrough.",
    image: "/assets/catalog-swap-gallery/img4.jpg",
    alt: "Half-finished room with tools and exposed framing.",
  },
  {
    title: "Material Sourcing",
    description:
      "Stone, timber, and hardware chosen against the real light in the room, sampled on site, and priced before anything is ordered.",
    image: "/assets/catalog-swap-gallery/img7.jpg",
    alt: "Close study of surfaces and grain in daylight.",
  },
  {
    title: "Site Supervision",
    description:
      "Weekly checks against the drawing set, photographed and logged, so a problem surfaces while it is still cheap to fix.",
    image: "/assets/catalog-swap-gallery/img11.jpg",
    alt: "Work in progress recorded on site.",
  },
];

export default function SwitchOnHoverTabsDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-white p-6">
      <SwitchOnHoverTabs items={items} />
    </div>
  );
}
