"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import ColouristReelPage, {
  type ColouristReelView,
} from "@/registry/colourist-reel-page";

const BASE = "/assets/colourist-reel-page";

const PRESETS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "List" },
  { id: "grid", label: "Grid" },
  { id: "information", label: "Info" },
] as const satisfies readonly { id: ColouristReelView; label: string }[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function ColouristReelPageStudio() {
  const [view, setView] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="colourist-reel-page"
      title="Colourist Reel Page"
      presets={PRESETS}
      activePreset={view}
      onPreset={(id) => setView(id as PresetId)}
      onReset={() => {
        setView(PRESETS[0].id);
        setAssetBase(BASE);
      }}
      controls={
        <StudioTextField
          label="Asset base"
          value={assetBase}
          onChange={setAssetBase}
        />
      }
      note={
        <p>
          Press P for projects, I for info and Escape to go back. Scroll or
          click the strip at the bottom of home to lift the reel. Hover a grid
          card to play its clip.
        </p>
      }
    >
      <ColouristReelPage assetBase={assetBase} initialView={view} />
    </FullPageStudioShell>
  );
}
