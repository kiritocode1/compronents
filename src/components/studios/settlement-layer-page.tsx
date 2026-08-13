"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import SettlementLayerPage from "@/registry/settlement-layer-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/products", label: "Products" },
  { id: "/products/vault", label: "Product detail" },
  { id: "/company", label: "Company" },
  { id: "/partners", label: "Partners" },
  { id: "/career", label: "Careers" },
  { id: "/contact", label: "Contact" },
  { id: "/newsroom", label: "Newsroom" },
  { id: "/blog", label: "Blog" },
  { id: "/blog/settlement-windows-are-a-design-choice", label: "Article" },
  { id: "/legal/privacy", label: "Legal" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

export default function SettlementLayerPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [route, setRoute] = useState<string>(PRESETS[0].id);

  return (
    <FullPageStudioShell
      name="settlement-layer-page"
      title="Settlement Layer Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => {
        setActivePath(id as PresetId);
        setRoute(id);
      }}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setRoute(PRESETS[0].id);
      }}
      controls={
        <StudioTextField label="Route" value={route} onChange={setRoute} />
      }
      note={
        <p>
          A multi-route enterprise infrastructure template: eleven routes
          sharing one Lenis and ScrollTrigger clock, a seeded 25 by 6 pixel
          dissolve between section colours, travelling pulses along staircase
          connector paths, a momentum drag carousel for the product suite, and a
          header that flips to its light variant over light sections.
        </p>
      }
    >
      <SettlementLayerPage initialPath={route} />
    </FullPageStudioShell>
  );
}
