"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import NeotericPage, { type NeotericPageProps } from "@/registry/neoteric-page";

const BASE = "/assets/neoteric-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/work", label: "Work" },
  { id: "/studio", label: "Studio" },
  { id: "/thinking", label: "Thinking" },
  { id: "/feed", label: "Feed" },
  { id: "/contact", label: "Contact" },
  { id: "/work/sample-project", label: "Sample Project" },
] as const satisfies readonly {
  id: NonNullable<NeotericPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function NeotericPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="neoteric-page"
      title="Neoteric Page"
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
          Source-backed Neoteric Studio agency port with the original route set:
          home, work, studio, dark thinking page, feed, contact, and sample
          project, behind a local router with a framer-motion slide transition
          and Blob-hosted imagery.
        </p>
      }
    >
      <NeotericPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
