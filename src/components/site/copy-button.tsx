"use client";

import { useSound } from "@web-kits/audio/react";
import { Check } from "lucide-react";
import * as React from "react";
import { CopyIcon } from "@/components/ui/copy-icon";
import { uiCopy } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label = "Copy",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const playCopied = useSound(uiCopy);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      playCopied();
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "hit-area-1 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-400" />
      ) : (
        <CopyIcon
          size={14}
          className="flex size-full items-center justify-center"
        />
      )}
    </button>
  );
}
