"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import OverlayMenu from "@/registry/overlay-menu";

const LOGO = "/assets/overlay-menu/logo.png";
const HERO = "/assets/overlay-menu/hero.jpg";

const PRESETS = [
  {
    id: "evergreen",
    label: "Evergreen",
    panels: ["#57cea5", "#063124", "#0b5c43", "#21ba80"],
    menuColor: "#084331",
  },
  {
    id: "ember",
    label: "Ember",
    panels: ["#ffb27a", "#2a0f06", "#7a2c12", "#d6552a"],
    menuColor: "#1c0a04",
  },
  {
    id: "ultraviolet",
    label: "Ultraviolet",
    panels: ["#b9a7ff", "#140a2e", "#3a2378", "#7a55e6"],
    menuColor: "#160c33",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function OverlayMenuStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [panels, setPanels] = useState<string[]>([...preset.panels]);
  const [menuColor, setMenuColor] = useState<string>(preset.menuColor);

  const studioKey = [...panels, menuColor].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setPanels([...next.panels]);
    setMenuColor(next.menuColor);
  }

  function setPanel(index: number, value: string) {
    setPanels((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[620px] w-full overflow-hidden rounded-t-lg">
        <Link
          href="/components/overlay-menu/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 left-4 z-20 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <OverlayMenu
          key={studioKey}
          logo={LOGO}
          panelColors={panels as [string, string, string, string]}
          menuColor={menuColor}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${HERO})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </OverlayMenu>
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Overlay Menu
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[2fr_1fr]">
          <section className="grid content-start gap-3">
            <span className="label">Curtain panels</span>
            <div className="grid grid-cols-4 gap-3">
              {panels.map((color, i) => (
                <StudioColor
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed four panels keyed by position.
                  key={`panel-${i}`}
                  label={`${i + 1}`}
                  value={color}
                  onChange={(v) => setPanel(i, v)}
                />
              ))}
            </div>
          </section>

          <StudioColor
            label="Menu surface"
            value={menuColor}
            onChange={setMenuColor}
          />
        </div>

        <div className="flex items-start gap-2 border-t p-4 text-xs leading-relaxed text-muted-foreground sm:p-5">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
          <p>
            The four panels sweep in order, so reading them dark-to-light (or
            light-to-dark) controls whether the reveal feels like a sunrise or a
            shutter dropping.
          </p>
        </div>
      </aside>
    </div>
  );
}
