"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DarkCatalogPage from "@/registry/dark-catalog-page";

const BASE = "/assets/dark-catalog-page";

const PRESETS = [
  { id: "/", label: "Index" },
  { id: "/studio", label: "Studio" },
  { id: "/catalog", label: "Catalog" },
  { id: "/brief", label: "Brief" },
  { id: "/connect", label: "Connect" },
] as const;

type InitialPath = (typeof PRESETS)[number]["id"];

export default function DarkCatalogPageStudio() {
  const [initialPath, setInitialPath] = useState<InitialPath>("/");
  const [assetBase, setAssetBase] = useState(BASE);

  function applyPreset(id: string) {
    setInitialPath((PRESETS.find((item) => item.id === id) ?? PRESETS[0]).id);
  }

  return (
    <FullPageStudioShell
      name="dark-catalog-page"
      title="Dark Catalog Page"
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
          This is the source-backed Deadlock Studios port. It keeps the routed
          index, studio, catalog, brief, and connect pages in one installable
          component while serving all source media from Blob.
        </p>
      }
    >
      <DarkCatalogPage assetBase={assetBase} initialPath={initialPath} />
    </FullPageStudioShell>
  );
}
