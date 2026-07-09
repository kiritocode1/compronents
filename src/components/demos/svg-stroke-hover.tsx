"use client";

import SvgStrokeHover from "@/registry/svg-stroke-hover";

export default function SvgStrokeHoverDemo() {
  return (
    <div className="relative max-h-[760px] w-full overflow-auto rounded-md bg-[#f2f0eb]">
      <SvgStrokeHover
        cards={Array.from({ length: 6 }, (_, index) => ({
          title:
            [
              "Synthetic Silhouette",
              "Red Form Study",
              "Material Pause",
              "Obscured Profile",
              "Muted Presence",
              "Spatial Balance",
            ][index] ?? "Hover Study",
          image: `/assets/svg-stroke-hover/img${index + 1}.jpg`,
          accent:
            ["#e67339", "#a66363", "#eb3828", "#a6a09d", "#99938a", "#5f7c98"][
              index
            ] ?? "#e67339",
        }))}
      />
    </div>
  );
}
