"use client";

import { Maximize2, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PresetOption {
  id: string;
  label: string;
}

export function FullPageStudioShell({
  name,
  title,
  activePreset,
  presets,
  onPreset,
  onReset,
  children,
  controls,
  note,
}: {
  name: string;
  title: string;
  activePreset: string;
  presets: readonly PresetOption[];
  onPreset: (presetId: string) => void;
  onReset: () => void;
  children: ReactNode;
  controls: ReactNode;
  note: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[720px] w-full overflow-hidden rounded-t-lg bg-black xl:h-[820px]">
        <Link
          href={`/pages/${name}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <div className="h-full w-full overflow-y-auto">{children}</div>
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset studio"
              title="Reset studio"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-md border bg-card p-1 xl:max-w-xl">
            {presets.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPreset(item.id)}
                className={`flex min-h-10 items-center justify-center rounded px-3 text-center text-[0.68rem] leading-tight uppercase transition-colors ${
                  activePreset === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(280px,1fr)_minmax(240px,0.75fr)]">
          <div className="grid gap-4">{controls}</div>
          <div className="rounded-md border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
            {note}
          </div>
        </div>
      </aside>
    </div>
  );
}

export function StudioTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
      />
    </label>
  );
}

export function StudioTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-md border bg-card px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-border-strong"
      />
    </label>
  );
}
