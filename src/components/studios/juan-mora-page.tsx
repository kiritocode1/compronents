"use client";

import { useRef, useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import JuanMoraPage from "@/registry/juan-mora-page";

const BASE = "/assets/juan-mora-page";

const PRESETS = [
  { id: "top", label: "Hero" },
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

export default function JuanMoraPageStudio() {
  const [activeSection, setActiveSection] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);
  const hostRef = useRef<HTMLDivElement>(null);

  const jumpTo = (id: PresetId) => {
    setActiveSection(id);
    hostRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <FullPageStudioShell
      name="juan-mora-page"
      title="Juan Mora Page"
      presets={PRESETS}
      activePreset={activeSection}
      onPreset={(id) => jumpTo(id as PresetId)}
      onReset={() => {
        setAssetBase(BASE);
        jumpTo(PRESETS[0].id);
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
          A design-director portfolio home page ported from a Webflow build. The
          full Webflow stylesheet is carried over and scoped, while every
          interaction Webflow's own runtime used to drive (the intro loader, the
          scrubbed shape drift, the two-step benefits sequence, hover timelines,
          Lottie playback) is rebuilt on gsap ScrollTrigger and SplitText. Use
          the section jumps to inspect each scroll sequence.
        </p>
      }
    >
      <div ref={hostRef}>
        <JuanMoraPage assetBase={assetBase} />
      </div>
    </FullPageStudioShell>
  );
}
