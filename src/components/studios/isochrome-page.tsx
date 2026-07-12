"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import IsochromePage, {
  type IsochromePageProps,
} from "@/registry/isochrome-page";

const BASE = "/assets/isochrome-page";

const PRESETS = [
  { id: "/", label: "Index" },
  { id: "/about", label: "About" },
  { id: "/work", label: "Work" },
  { id: "/project", label: "Project" },
  { id: "/contact", label: "Contact" },
] as const satisfies readonly {
  id: NonNullable<IsochromePageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function IsochromePageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="isochrome-page"
      title="ISOChrome Page"
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
          Source-backed ISOChrome creative-agency port with the original route
          set: home with preloader, about with a pinned expertise panel and
          parallax, work, project, and contact, behind a local router. Line
          reveals use gsap SplitText and parallax runs on the preview's own
          scroller, with Blob-hosted Druk fonts and imagery.
        </p>
      }
    >
      <IsochromePage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
