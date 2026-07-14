"use client";

import { useRef, useState } from "react";
import { FullPageStudioShell } from "@/components/studios/full-page-studio-shell";
import PixelgridStudioPage from "@/registry/pixelgrid-studio-page";

const PRESETS = [
  { id: "hero", label: "Hero" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
] as const satisfies readonly { id: string; label: string }[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function PixelgridStudioPageStudio() {
  const [activeSection, setActiveSection] = useState<PresetId>(PRESETS[0].id);
  const wrapRef = useRef<HTMLDivElement>(null);

  const jumpTo = (id: string) => {
    setActiveSection(id as PresetId);
    wrapRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <FullPageStudioShell
      name="pixelgrid-studio-page"
      title="Pixelgrid Studio Page"
      presets={PRESETS}
      activePreset={activeSection}
      onPreset={jumpTo}
      onReset={() => setActiveSection(PRESETS[0].id)}
      controls={
        <p className="text-xs leading-relaxed text-muted-foreground">
          Click the footer to take over the ambient skyline and play a
          full-width game of Tetris. Try typing &quot;blank&quot; or the Konami
          code (↑↑↓↓←→←→BA) anywhere on the page.
        </p>
      }
      note={
        <p>
          Source-backed pixel-grid studio page: a generative cursor-reactive
          hero field, springy drag carousels with generative case-study art,
          cursor-tracking smiley faces, a diamond-tessellation protocol
          visualization, and a fully playable Tetris game hidden in the footer.
        </p>
      }
    >
      <div ref={wrapRef}>
        <PixelgridStudioPage />
      </div>
    </FullPageStudioShell>
  );
}
