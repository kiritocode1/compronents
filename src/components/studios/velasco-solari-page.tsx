"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import VelascoSolariPage, {
  type VelascoSolariPageProps,
} from "@/registry/velasco-solari-page";

const BASE = "/assets/velasco-solari-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/work", label: "Work" },
  { id: "/overview", label: "Overview" },
  { id: "/mustang", label: "Mustang" },
  { id: "/info", label: "Info" },
  { id: "/sample-project", label: "Sample Project" },
] as const satisfies readonly {
  id: NonNullable<VelascoSolariPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function VelascoSolariPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="velasco-solari-page"
      title="Velasco Solari Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
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
          Source-backed Velasco Solari director portfolio port with the original
          route set: reel home, hover-reactive work grid, blurred overview
          table, Mustang film page, info, and the sample project layout, all
          behind a local router with Blob-hosted fonts, images, and Vimeo reels.
        </p>
      }
    >
      <VelascoSolariPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
