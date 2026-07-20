"use client";

import { useState } from "react";
import { FullPageStudioShell } from "@/components/studios/full-page-studio-shell";
import LiquidStatGrid from "@/registry/liquid-stat-grid";

const PRESETS = [
  { id: "hover", label: "Reveal on hover" },
  { id: "always", label: "Always on" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

export default function LiquidStatGridStudio() {
  const [reveal, setReveal] = useState<PresetId>("hover");

  return (
    <FullPageStudioShell
      name="liquid-stat-grid"
      title="Liquid Stat Grid"
      presets={PRESETS}
      activePreset={reveal}
      onPreset={(id) => setReveal(id as PresetId)}
      onReset={() => setReveal("hover")}
      controls={null}
      note={
        <p>
          Three statistic cells divided by dashed rules. Each cell hides a
          six-stage WebGL2 chain behind it: a flat backdrop, a mouse-tracked
          colour blob, a domain warp, two noise-blur passes and a second faster
          warp, every stage rendering into its own framebuffer at its own
          resolution and sampling the previous one. Hovering fades the gradient
          up and inverts the copy to white.
        </p>
      }
    >
      <div className="w-full px-6 py-16">
        <LiquidStatGrid reveal={reveal} />
      </div>
    </FullPageStudioShell>
  );
}
