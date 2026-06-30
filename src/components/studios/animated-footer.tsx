"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
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
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-black max-sm:h-[620px] xl:h-[720px]">
        <Link
          href="/components/animated-footer/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
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

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(220px,0.7fr)_minmax(320px,1.15fr)_minmax(320px,1fr)_minmax(220px,0.65fr)]">
          <section className="grid content-start gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2">
                <span className="label">Left word</span>
                <input
                  value={headingLeft}
                  onChange={(event) => setHeadingLeft(event.target.value)}
                  className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="label">Right word</span>
                <input
                  value={headingRight}
                  onChange={(event) => setHeadingRight(event.target.value)}
                  className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StudioColor
                label="Glyph"
                value={charColor}
                onChange={setCharColor}
              />
              <StudioColor
                label="Hover"
                value={hoverColor}
                onChange={setHoverColor}
              />
            </div>
          </section>

          <label className="flex flex-col gap-2">
            <span className="label">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              className="min-h-36 resize-none rounded-md border bg-card px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-border-strong"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label">Links</span>
            <textarea
              value={linksValue}
              onChange={(event) => setLinksValue(event.target.value)}
              rows={6}
              className="min-h-36 resize-none rounded-md border bg-card px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-border-strong"
            />
          </label>

          <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:pt-7">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Pixel contrast, word length, and hover heat decide whether the
              footer feels like a quiet signature or a final title card.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
