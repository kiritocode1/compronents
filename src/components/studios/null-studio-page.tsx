"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import NullStudioPage, {
  type NullStudioPageProps,
} from "@/registry/null-studio-page";

const BASE = "/assets/null-studio-page";

const PRESETS = [
  { id: "/", label: "Index" },
  { id: "/work", label: "Projects" },
  { id: "/about", label: "About" },
  { id: "/contact", label: "Contact" },
  { id: "/careers", label: "Careers" },
  { id: "/work-sample", label: "Sample Project" },
] as const satisfies readonly {
  id: NonNullable<NullStudioPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function NullStudioPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="null-studio-page"
      title="Null Studio Page"
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
          Source-backed Null Studio agency port with the original route set:
          home, projects, about with a draggable auto-playing team carousel,
          sample project with a custom video player and collapsible copy,
          careers, and contact, behind a local router with an overlay menu and
          Blob-hosted PP fonts and imagery.
        </p>
      }
    >
      <NullStudioPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
