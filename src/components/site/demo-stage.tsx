"use client";

import { Maximize2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { demos } from "@/components/demos";
import { getRegistryItem } from "@/lib/registry";

export function DemoStage({ name }: { name: string }) {
  const Demo = demos[name];
  const section = getRegistryItem(name)?.section ?? "components";
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-lg border bg-surface p-10">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <Link
          href={`/${section}/${name}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="flex size-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-muted hover:text-foreground"
        >
          <Maximize2 className="size-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          aria-label="Reset demo"
          title="Reset"
          className="flex size-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
      <div key={resetKey} className="flex w-full items-center justify-center">
        {Demo ? <Demo /> : null}
      </div>
    </div>
  );
}
