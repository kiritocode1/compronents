"use client";

import { useSound } from "@web-kits/audio/react";
import { Check, Copy, LoaderCircle, TriangleAlert } from "lucide-react";
import { type SVGProps, useEffect, useRef, useState } from "react";
import { uiCopy } from "@/lib/sounds";

type CopyState = "idle" | "loading" | "copied" | "error";

export function VscodeIconsFileTypeLightMdx(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path d="m20.3 16.5l-3.9 3.9l-4-3.9l1.1-1.1l2.1 2.1v-5.7h1.5v5.8l2.1-2.1Zm-16.8-.8l2.7 2.7L9 15.7v4.4h1.5V12l-4.3 4.3L2 12v8.1h1.5Z" />
      <path
        fill="#f9ac00"
        d="m28.8 20l-3.1-3.1l-3.1 3.1l-1-1.1l3.1-3.1l-3.2-3.2l1.1-1l3.1 3.2l3.2-3.2l1.1 1l-3.2 3.2l3.1 3.1Z"
      />
    </svg>
  );
}

async function writeToClipboard(value: string) {
  let copied = false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
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
  const selectionCopied = document.execCommand("copy");
  textarea.remove();

  if (!copied && !selectionCopied) {
    throw new Error("Clipboard is unavailable.");
  }
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
    loading: "Preparing Markdown",
    copied: "Copied",
    error: "Try again",
  }[state];

  const StatusIcon = {
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
      aria-label={label}
      title="Copy the complete code, API, setup, assets, typography, and implementation notes"
      className="group inline-flex h-9 shrink-0 items-center overflow-hidden rounded-md border border-border bg-background text-muted-foreground transition-[border-color,background-color,color] duration-150 hover:border-border-strong hover:bg-muted/40 hover:text-foreground focus-visible:ring-1 focus-visible:ring-foreground/40 focus-visible:outline-none active:bg-muted/70 disabled:cursor-wait"
    >
      <span className="flex size-9 shrink-0 items-center justify-center border-r border-border bg-black text-white">
        <VscodeIconsFileTypeLightMdx
          className="size-[18px] opacity-60 grayscale transition-[filter,opacity] duration-150 group-hover:opacity-100 group-hover:grayscale-0"
          fill="currentColor"
        />
      </span>
      <span
        className="px-3 text-[10px] leading-none font-medium tracking-[0.1em] uppercase"
        aria-live="polite"
      >
        {label}
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center border-l border-border">
        <StatusIcon
          className={`size-3.5 ${state === "loading" ? "animate-spin" : ""} ${state === "copied" ? "text-foreground" : ""}`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
