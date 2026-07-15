"use client";

import { useSound } from "@web-kits/audio/react";
import { Check, Copy, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uiCopy } from "@/lib/sounds";

type CopyState = "idle" | "loading" | "copied" | "error";

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Some browsers expose the async API but reject it outside a trusted
      // clipboard context. Fall through to the selection-based copy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) throw new Error("Clipboard is unavailable.");
}

export function CopyMarkdownButton({ href }: { href: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playCopied = useSound(uiCopy);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copyMarkdown() {
    if (state === "loading") return;

    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState("loading");

    try {
      const response = await fetch(href, {
        headers: { Accept: "text/markdown" },
      });
      if (!response.ok) throw new Error("Handoff could not be generated.");

      await writeToClipboard(await response.text());
      playCopied();
      setState("copied");
    } catch {
      setState("error");
    }

    resetTimer.current = setTimeout(() => setState("idle"), 2200);
  }

  const label = {
    idle: "Copy as Markdown",
    loading: "Building handoff",
    copied: "Markdown copied",
    error: "Try again",
  }[state];

  const Icon = {
    idle: Copy,
    loading: LoaderCircle,
    copied: Check,
    error: TriangleAlert,
  }[state];

  return (
    <button
      type="button"
      onClick={copyMarkdown}
      disabled={state === "loading"}
      title="Copy the complete code, API, setup, assets, typography, and implementation notes"
      className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-full border bg-card px-2.5 pr-3 text-[11px] tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:border-foreground/25 hover:bg-muted hover:text-foreground disabled:cursor-wait"
    >
      <span className="flex h-5 min-w-6 items-center justify-center rounded-full border bg-background px-1 font-mono text-[9px] tracking-normal text-accent-soft">
        MD
      </span>
      <span aria-live="polite">{label}</span>
      <Icon
        className={`size-3.5 ${state === "loading" ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}
