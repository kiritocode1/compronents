"use client";

import CreativeClutter from "@/registry/creative-clutter";

const ITEM_IDS = [
  "music",
  "cd",
  "dialog",
  "folder",
  "macmini",
  "paper",
  "passport",
  "portrait",
  "appicon",
  "lighter",
  "cursor",
];
const IMAGES = ITEM_IDS.map((id) => `/assets/creative-clutter/${id}.png`);

export default function CreativeClutterDemo() {
  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-md bg-[#f5f2ed]">
      <CreativeClutter images={IMAGES} />
    </div>
  );
}
