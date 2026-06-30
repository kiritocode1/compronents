"use client";

import MaterialSpotlight from "@/registry/material-spotlight";

const MODEL = "/assets/material-spotlight/model.glb";

/**
 * Bounded preview of Material Spotlight. Move the cursor across the model — a
 * soft sphere of polished, darker material follows the pointer and eases away
 * when it leaves.
 */
export default function Demo() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-md">
      <MaterialSpotlight src={MODEL} />
    </div>
  );
}
