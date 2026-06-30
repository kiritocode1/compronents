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

export default function CreativeClutterPreview() {
  return (
    <main className="h-screen w-full overflow-hidden bg-[#f5f2ed]">
      <CreativeClutter images={IMAGES} />
    </main>
  );
}
