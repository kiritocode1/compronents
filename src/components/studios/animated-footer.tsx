"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import AnimatedFooter, { type FooterLink } from "@/registry/animated-footer";

const LEFT_HAND = "/assets/animated-footer/blank-hand-right.png";
const RIGHT_HAND = "/assets/animated-footer/blank-hand-left.png";

const PRESETS = [
  {
    id: "blank-space",
    label: "Blank Space",
    heading: ["Blank", "Space"] as [string, string],
    description:
      "Blank — a software developer building considered digital experiences. Interfaces, motion, and the small details that make a product feel alive.",
    charColor: "#803500",
    hoverColor: "#ff6a00",
    links:
      "Work | https://aryank.space\nAbout | https://aryank.space\nWriting | https://aryank.space\nContact | https://aryank.space",
  },
  {
    id: "afterimage",
    label: "Afterimage",
    heading: ["After", "Image"] as [string, string],
    description:
      "A footer for studios that want the final screen to feel like heat left behind by the page.",
    charColor: "#5f654a",
    hoverColor: "#d6f36d",
    links: "Archive | #\nProcess | #\nSignals | #\nContact | #",
  },
  {
    id: "nocturne",
    label: "Nocturne",
    heading: ["Night", "Index"] as [string, string],
    description:
      "Quiet glyphs, cold light, and a wordmark that lands like the last title card in a film.",
    charColor: "#355a76",
    hoverColor: "#6ee7ff",
    links: "Rooms | #\nNotes | #\nObjects | #\nInvite | #",
  },
];

type Preset = (typeof PRESETS)[number];

function parseLinks(value: string): FooterLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return {
        label: label || "Link",
        href: href || "#",
      };
    })
    .slice(0, 6);
}

export default function AnimatedFooterStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [headingLeft, setHeadingLeft] = useState(preset.heading[0]);
  const [headingRight, setHeadingRight] = useState(preset.heading[1]);
  const [description, setDescription] = useState(preset.description);
  const [charColor, setCharColor] = useState(preset.charColor);
  const [hoverColor, setHoverColor] = useState(preset.hoverColor);
  const [linksValue, setLinksValue] = useState(preset.links);

  const links = useMemo(() => parseLinks(linksValue), [linksValue]);
  const studioKey = [
    headingLeft,
    headingRight,
    description,
    charColor,
    hoverColor,
    linksValue,
  ].join("|");

  function applyPreset(nextPreset: Preset) {
    setPreset(nextPreset);
    setHeadingLeft(nextPreset.heading[0]);
    setHeadingRight(nextPreset.heading[1]);
    setDescription(nextPreset.description);
    setCharColor(nextPreset.charColor);
    setHoverColor(nextPreset.hoverColor);
    setLinksValue(nextPreset.links);
  }

  return (
    <div className="grid overflow-hidden rounded-lg border bg-surface lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative min-h-[620px] overflow-hidden bg-black">
        <AnimatedFooter
          key={studioKey}
          embedded
          heading={[headingLeft, headingRight]}
          links={links}
          description={description}
          charColor={charColor}
          hoverColor={hoverColor}
          leftImage={LEFT_HAND}
          rightImage={RIGHT_HAND}
        />
      </div>

      <aside className="flex flex-col gap-5 border-t bg-background p-4 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="label">Studio</p>
            <h2 className="mt-1 text-sm text-foreground uppercase">
              Animated Footer
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

        <div className="grid grid-cols-3 gap-1 rounded-md border bg-card p-1">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyPreset(item)}
              className={`flex min-h-9 items-center justify-center rounded px-2 text-center text-[0.66rem] uppercase leading-tight transition-colors ${
                preset.id === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className="label">Left word</span>
            <input
              value={headingLeft}
              onChange={(event) => setHeadingLeft(event.target.value)}
              className="h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label">Right word</span>
            <input
              value={headingRight}
              onChange={(event) => setHeadingRight(event.target.value)}
              className="h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="label">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="resize-none rounded-md border bg-card px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-border-strong"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="label">Links</span>
          <textarea
            value={linksValue}
            onChange={(event) => setLinksValue(event.target.value)}
            rows={5}
            className="resize-none rounded-md border bg-card px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-border-strong"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className="label">Glyph</span>
            <span className="flex h-9 items-center gap-2 rounded-md border bg-card px-2">
              <input
                type="color"
                value={charColor}
                onChange={(event) => setCharColor(event.target.value)}
                className="size-5 border-0 bg-transparent p-0"
                aria-label="Glyph color"
              />
              <span className="text-xs text-muted-foreground">{charColor}</span>
            </span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label">Hover</span>
            <span className="flex h-9 items-center gap-2 rounded-md border bg-card px-2">
              <input
                type="color"
                value={hoverColor}
                onChange={(event) => setHoverColor(event.target.value)}
                className="size-5 border-0 bg-transparent p-0"
                aria-label="Hover color"
              />
              <span className="text-xs text-muted-foreground">
                {hoverColor}
              </span>
            </span>
          </label>
        </div>

        <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
          <p>
            Pixel contrast, word length, and hover heat decide whether the
            footer feels like a quiet signature or a final title card.
          </p>
        </div>
      </aside>
    </div>
  );
}
