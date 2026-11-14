"use client";

import { Maximize2, RefreshCw, RotateCcw } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useId, useState } from "react";
import {
  TabsSubtle,
  TabsSubtleItem,
  TabsSubtlePanel,
} from "@/components/ui/tabs-subtle";

export type StudioGroup = { label: string; content: ReactNode };

/**
 * Stage plus tabbed controls for the scene studios. Each group is one folder
 * of the source's control panel, so the tabs read like the original.
 */
export function SceneStudioShell({
  name,
  stage,
  groups,
  onReplay,
  replayLabel = "Replay",
  onReset,
}: {
  /** Registry name, for the fullscreen preview link. */
  name: string;
  stage: ReactNode;
  groups: StudioGroup[];
  onReplay?: () => void;
  replayLabel?: string;
  onReset: () => void;
}) {
  const [tab, setTab] = useState(0);
  const idPrefix = useId();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative flex h-[560px] w-full items-center justify-center overflow-hidden rounded-lg bg-black xl:h-[680px]">
        {stage}
        <div className="absolute top-3 right-3 z-20 flex gap-1">
          {onReplay ? (
            <StageButton label={replayLabel} onClick={onReplay}>
              <RotateCcw className="size-3.5" />
            </StageButton>
          ) : null}
          <Link
            href={`/components/${name}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open fullscreen"
            title="Open fullscreen"
            className="flex size-8 items-center justify-center rounded-md bg-black/50 text-white/70 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
          >
            <Maximize2 className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <TabsSubtle selectedIndex={tab} onSelect={setTab} idPrefix={idPrefix}>
          {groups.map((group, i) => (
            <TabsSubtleItem key={group.label} index={i} label={group.label} />
          ))}
        </TabsSubtle>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset to the source values"
          title="Reset to the source values"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {groups.map((group, i) => (
        <TabsSubtlePanel
          key={group.label}
          selectedIndex={tab}
          index={i}
          idPrefix={idPrefix}
        >
          <div className="grid gap-x-6 gap-y-5 pb-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.content}
          </div>
        </TabsSubtlePanel>
      ))}
    </div>
  );
}

function StageButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md bg-black/50 text-white/70 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
    >
      {children}
    </button>
  );
}

/** Two-state control for a boolean source option. */
export function StudioToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex h-10 items-center justify-between gap-3 rounded-md bg-muted/50 px-3 text-left text-xs transition-colors hover:bg-muted"
    >
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={`h-3.5 w-6 shrink-0 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`block size-3 translate-y-[1px] rounded-full bg-background transition-transform ${
            checked ? "translate-x-[11px]" : "translate-x-[1px]"
          }`}
        />
      </span>
    </button>
  );
}
