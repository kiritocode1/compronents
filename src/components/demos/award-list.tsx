"use client";

import AwardList, { type Award } from "@/registry/award-list";

const BASE = "/assets/award-list";
const RAW = [
  {
    name: "Independent of the year",
    type: "Nominee",
    project: "INNOVATE 2024",
    label: "Awwwards",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "LVXH — AMOT",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Open Field Audio",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "ArtisanCraft",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Disguised Edge",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Silvia Santiago",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "2023 Showcase",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Harmonic Pitch",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Shadowline",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Verse 21",
    label: "See Live",
  },
];
const AWARDS: Award[] = RAW.map((a, i) => ({
  ...a,
  image: `${BASE}/img${i + 1}.jpg`,
}));

/**
 * Bounded preview of the Award List. Hover the rows to slide each one to its
 * project credit; the hovered row's image lands on the preview pile, bottom-right.
 */
export default function Demo() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-md">
      <AwardList awards={AWARDS} />
    </div>
  );
}
