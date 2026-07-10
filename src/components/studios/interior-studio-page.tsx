"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import InteriorStudioPage from "@/registry/interior-studio-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/studio", label: "Studio" },
  { id: "/spaces", label: "Spaces" },
  { id: "/sample-space", label: "Sample" },
  { id: "/blueprints", label: "Blueprints" },
  { id: "/connect", label: "Connect" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

export default function InteriorStudioPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState("/assets/interior-studio-page");

  return (
    <FullPageStudioShell
      name="interior-studio-page"
      title="Interior Studio Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setAssetBase("/assets/interior-studio-page");
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
          Source-backed Terrene interior studio template ported with the
          original route set (home, studio, spaces, sample space, blueprints,
          connect), counter preloader, circular clip-path menu, pinned
          featured-projects deck, arc-path spotlight, draggable blueprint
          gallery, SplitText reveals, Lenis smooth scroll, and a circular
          clip-path page transition. Imagery is served from Blob.
        </p>
      }
    >
      <InteriorStudioPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
