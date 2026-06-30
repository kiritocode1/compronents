"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import March2025Template, {
  type March2025TemplateProps,
} from "@/registry/march-2025-template";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/work", label: "Work" },
  { id: "/sample-project", label: "Project" },
  { id: "/about", label: "About" },
  { id: "/faq", label: "FAQ" },
  { id: "/contact", label: "Contact" },
] as const satisfies readonly {
  id: NonNullable<March2025TemplateProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function March2025TemplateStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState("/assets/march-2025-template");

  return (
    <FullPageStudioShell
      name="march-2025-template"
      title="March 2025 Template"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setAssetBase("/assets/march-2025-template");
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
          Source-backed Vite portfolio template ported with the original route
          set, Rader and Messina font files, GSAP text reveals, block page
          transitions, Lenis scroll, parallax project images, carousel work
          view, reviews, FAQ, contact, and Blob-hosted assets.
        </p>
      }
    >
      <March2025Template assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
