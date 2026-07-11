"use client";

import { useSound } from "@web-kits/audio/react";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { demos } from "@/components/demos";
import { ExpandIcon } from "@/components/ui/expand-icon";
import { getRegistryItem } from "@/lib/registry";
import { uiTap } from "@/lib/sounds";

export function DemoStage({ name }: { name: string }) {
  const Demo = demos[name];
  const section = getRegistryItem(name)?.section ?? "components";
  const [resetKey, setResetKey] = useState(0);
  const playTap = useSound(uiTap);

  return (
    <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-lg border bg-surface p-10">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <Link
          href={`/${section}/${name}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="hit-area-1 flex size-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExpandIcon
            size={14}
            className="flex size-full items-center justify-center"
          />
        </Link>
        <button
          type="button"
          onClick={() => {
            playTap();
            setResetKey((k) => k + 1);
          }}
          aria-label="Reset demo"
          title="Reset"
          className="hit-area-1 flex size-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-muted hover:text-foreground"
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
