"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import SoftType from "@/registry/soft-type";

const DEFAULTS = {
  ink: "#000000",
  paper: "#ffffff",
  weight: 1.2,
  squeeze: 1.05,
  sound: true,
};

export default function SoftTypeStudio() {
  const [ink, setInk] = useState(DEFAULTS.ink);
  const [paper, setPaper] = useState(DEFAULTS.paper);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [squeeze, setSqueeze] = useState(DEFAULTS.squeeze);
  const [sound, setSound] = useState(DEFAULTS.sound);

  function reset() {
    setInk(DEFAULTS.ink);
    setPaper(DEFAULTS.paper);
    setWeight(DEFAULTS.weight);
    setSqueeze(DEFAULTS.squeeze);
    setSound(DEFAULTS.sound);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg xl:h-[760px]">
        <Link
          href="/components/soft-type/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/50 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <SoftType
          ink={ink}
          paper={paper}
          weight={weight}
          squeeze={squeeze}
          sound={sound}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Soft Type
              </h2>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset studio"
              title="Reset studio"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-2 gap-1 rounded-md border bg-card p-1 xl:max-w-xs">
            {[true, false].map((on) => (
              <button
                key={String(on)}
                type="button"
                onClick={() => setSound(on)}
                className={`flex min-h-10 items-center justify-center rounded px-3 text-center text-[0.68rem] uppercase leading-tight transition-colors ${
                  sound === on
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {on ? "Sound on" : "Sound off"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(240px,1fr)_minmax(260px,1fr)]">
          <section className="grid content-start gap-3 sm:grid-cols-2">
            <StudioColor label="Ink" value={ink} onChange={setInk} />
            <StudioColor label="Paper" value={paper} onChange={setPaper} />
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Weight"
              value={weight}
              onChange={setWeight}
              min={1}
              max={1.6}
              step={0.05}
              formatValue={(v) => `${v.toFixed(2)}x`}
            />
            <SliderComfortable
              variant="scrubber"
              label="Squeeze"
              value={squeeze}
              onChange={setSqueeze}
              min={1}
              max={1.25}
              step={0.01}
              formatValue={(v) => `${v.toFixed(2)}x`}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Click the letters and type. Drag one to squash it, or hold one
                still for two seconds to pop it into outlines. Escape lines
                everything back up.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
