"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import SorenPage, { type SorenPageProps } from "@/registry/soren-page";

const BASE = "/assets/soren-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/work", label: "Work" },
  { id: "/projects", label: "Projects" },
  { id: "/photos", label: "Photos" },
  { id: "/post", label: "Post" },
] as const satisfies readonly {
  id: NonNullable<SorenPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function SorenPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="soren-page"
      title="Soren Page"
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
          Source-backed Soren portfolio port with the original route set: Spline
          3D home with live clock, magnifying dock, GSAP work masonry, scramble
          projects list, photos grid, and sample post, behind a local router
          with Blob-hosted imagery.
        </p>
      }
    >
      <SorenPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
