"use client";

import { useState } from "react";
import { VerticalDialScene } from "@/components/demos/vertical-dial-nav";
import { StudioColor } from "@/components/site/studio-controls";
import { SliderComfortable } from "@/components/ui/slider";

export default function VerticalDialNavStudio() {
  const [activeColor, setActiveColor] = useState("#1a1a1a");
  const [fadeDistance, setFadeDistance] = useState(2);
  const [itemSpacing, setItemSpacing] = useState(12);
  return (
    <div className="overflow-hidden rounded-lg border bg-surface">
      <VerticalDialScene
        activeColor={activeColor}
        fadeDistance={fadeDistance}
        itemSpacing={itemSpacing}
      />
      <div className="grid gap-6 border-t bg-background p-5 sm:grid-cols-3">
        <StudioColor
          label="Active label"
          value={activeColor}
          onChange={setActiveColor}
        />
        <SliderComfortable
          label="Fade distance"
          value={fadeDistance}
          min={1}
          max={10}
          step={1}
          onChange={setFadeDistance}
        />
        <SliderComfortable
          label="Label spacing"
          value={itemSpacing}
          min={0}
          max={40}
          step={1}
          onChange={setItemSpacing}
        />
      </div>
    </div>
  );
}
