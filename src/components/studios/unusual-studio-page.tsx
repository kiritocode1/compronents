"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import UnusualStudioPage, {
  type UnusualStudioPageProps,
} from "@/registry/unusual-studio-page";

const BASE = "/assets/unusual-studio-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/projects", label: "Portfolio" },
  { id: "/about", label: "About Us" },
  { id: "/careers", label: "Careers" },
  { id: "/contact", label: "Contact" },
  { id: "/sample-project-page", label: "Sample Project" },
] as const satisfies readonly {
  id: NonNullable<UnusualStudioPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function UnusualStudioPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="unusual-studio-page"
      title="Unusual Studio Page"
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
          Source-backed Unusual Designs creative-studio port with the original
          route set: home, portfolio, about with sticky panels, careers with a
          Lottie, contact, and a sample project, behind a local router with a
          framer-motion slide transition, a CSS marquee, and Blob-hosted media.
        </p>
      }
    >
      <UnusualStudioPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}
