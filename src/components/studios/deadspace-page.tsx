"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DeadspacePage from "@/registry/deadspace-page";

const BASE = "/assets/deadspace-page";

const PRESETS = [
  { id: "/", label: "Index" },
  { id: "/lab", label: "Lab" },
  { id: "/work", label: "Archive" },
  { id: "/project", label: "Record 01" },
  { id: "/contact", label: "Connect" },
] as const;

type InitialPath = (typeof PRESETS)[number]["id"];

export default function DeadspacePageStudio() {
  const [initialPath, setInitialPath] = useState<InitialPath>("/");
  const [assetBase, setAssetBase] = useState(BASE);

  function applyPreset(id: string) {
    setInitialPath((PRESETS.find((item) => item.id === id) ?? PRESETS[0]).id);
  }

  return (
    <FullPageStudioShell
      name="deadspace-page"
      title="Deadspace Page"
      presets={PRESETS}
      activePreset={initialPath}
      onPreset={applyPreset}
      onReset={() => {
        setInitialPath("/");
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
          This is the source-backed Deadspace port with index, lab, archive,
          record, and connect routes in one installable component. Source media
          is served from Blob.
        </p>
      }
    >
      <DeadspacePage assetBase={assetBase} initialPath={initialPath} />
    </FullPageStudioShell>
  );
}
