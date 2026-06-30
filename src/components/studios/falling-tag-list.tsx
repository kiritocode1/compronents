"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import FallingTagList from "@/registry/falling-tag-list";

const SERVICES = [
  {
    name: "Silhouette",
    tags: [
      "Editorial",
      "Fashion Identity",
      "Monochrome",
      "Shadow Play",
      "Minimalism",
      "Studio Portraits",
    ],
    images: [1, 2, 3].map(
      (n) => `/assets/falling-tag-list/service_1_img_${n}.jpg`,
    ),
  },
  {
    name: "Chroma",
    tags: [
      "Color Theory",
      "Graphics",
      "Poster Design",
      "Saturation",
      "Pop Art",
      "Visual Energy",
    ],
    images: [1, 2, 3].map(
      (n) => `/assets/falling-tag-list/service_2_img_${n}.jpg`,
    ),
  },
  {
    name: "Persona",
    tags: [
      "Character Design",
      "Portraits",
      "Visual Storytelling",
      "Emotion",
      "Identity",
      "Artistic Direction",
    ],
    images: [1, 2, 3].map(
      (n) => `/assets/falling-tag-list/service_3_img_${n}.jpg`,
    ),
  },
];

const PRESETS = [
  {
    id: "ember",
    label: "Ember",
    background: "#171717",
    nameColor: "#ff3831",
    hoverColor: "#ffffd9",
    tagColor: "#ffffd9",
  },
  {
    id: "lime",
    label: "Lime",
    background: "#0f140d",
    nameColor: "#b6ff3b",
    hoverColor: "#f2ffe0",
    tagColor: "#b6ff3b",
  },
  {
    id: "bone",
    label: "Bone",
    background: "#ece7dd",
    nameColor: "#1c1c1c",
    hoverColor: "#c8552b",
    tagColor: "#1c1c1c",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function FallingTagListStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [nameColor, setNameColor] = useState<string>(preset.nameColor);
  const [hoverColor, setHoverColor] = useState<string>(preset.hoverColor);
  const [tagColor, setTagColor] = useState<string>(preset.tagColor);

  function applyPreset(next: Preset) {
    setPreset(next);
    setBackground(next.background);
    setNameColor(next.nameColor);
    setHoverColor(next.hoverColor);
    setTagColor(next.tagColor);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#171717] xl:h-[760px]">
        <Link
          href="/components/falling-tag-list/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white/70 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <FallingTagList
          services={SERVICES}
          background={background}
          nameColor={nameColor}
          hoverColor={hoverColor}
          tagColor={tagColor}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Falling Tag List
              </h2>
            </div>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS[0])}
              aria-label="Reset studio"
              title="Reset studio"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-md border bg-card p-1 xl:max-w-xl">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item)}
                className={`flex min-h-10 items-center justify-center rounded px-3 text-center text-[0.68rem] uppercase leading-tight transition-colors ${
                  preset.id === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(220px,1fr)]">
          <section className="grid grid-cols-2 content-start gap-3 sm:grid-cols-4">
            <StudioColor
              label="Back"
              value={background}
              onChange={setBackground}
            />
            <StudioColor
              label="Name"
              value={nameColor}
              onChange={setNameColor}
            />
            <StudioColor
              label="Hover"
              value={hoverColor}
              onChange={setHoverColor}
            />
            <StudioColor label="Tag" value={tagColor} onChange={setTagColor} />
          </section>

          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Hover a name to spring the row open: the thumbnails fan up and the
              descriptor tags drop in as physics pills that settle on the floor.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
