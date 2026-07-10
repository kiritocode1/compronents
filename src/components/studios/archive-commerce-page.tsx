"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import ArchiveCommercePage from "@/registry/archive-commerce-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/catalogue", label: "Catalogue" },
  { id: "/catalogue/mirror-orb-mockup", label: "Product" },
  { id: "/archive", label: "Archive" },
  { id: "/editorial", label: "Editorial" },
  { id: "/editorial/designing-with-restraint", label: "Article" },
  { id: "/info", label: "Info" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

export default function ArchiveCommercePageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState("/assets/archive-commerce-page");

  return (
    <FullPageStudioShell
      name="archive-commerce-page"
      title="Archive Commerce Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setAssetBase("/assets/archive-commerce-page");
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
          Source-backed Format Archive commerce template ported with the
          original route set (home, catalogue, product detail, archive,
          editorial, article detail, info), counter preloader, clip-path menu
          overlay, persistent cart drawer, hover-trail archive previews,
          SplitType reveals, Lenis smooth scroll, and a clip-path page
          transition. Imagery is served from Blob.
        </p>
      }
    >
      <ArchiveCommercePage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
