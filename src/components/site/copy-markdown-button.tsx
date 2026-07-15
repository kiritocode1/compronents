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

  const copy = {
    idle: { label: "Copy as Markdown", detail: "Code, API, fonts + setup" },
    loading: { label: "Building handoff", detail: "Packaging source" },
    copied: { label: "Handoff copied", detail: "Ready to paste" },
    error: { label: "Try copy again", detail: "Clipboard was blocked" },
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
      aria-label={copy.label}
      title="Copy the complete code, API, setup, assets, typography, and implementation notes"
      className="group inline-flex h-14 min-w-[224px] shrink-0 items-center gap-2.5 rounded-[14px] border border-black/20 bg-gradient-to-b from-[#f7f4ec] to-[#e9e4d9] p-1.5 pr-2 text-left text-[#151515] shadow-[0_0_0_0.5px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.3),0_4px_10px_rgba(0,0,0,0.22),4px_4px_0_rgba(249,172,0,0.9)] transition-[transform,border-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-black/35 focus-visible:ring-2 focus-visible:ring-[#f9ac00] focus-visible:ring-offset-3 focus-visible:ring-offset-background focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:scale-[0.98] disabled:cursor-wait disabled:active:scale-100"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#141414] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.3)]">
        <VscodeIconsFileTypeLightMdx
          className="size-6 grayscale transition-[filter] duration-150 group-hover:grayscale-0"
          fill="currentColor"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="text-[11px] leading-none font-semibold tracking-[0.08em] text-[#151515] uppercase"
          aria-live="polite"
        >
          {copy.label}
        </span>
        <span
          className="text-[9px] leading-none tracking-[0.025em] text-black/50"
          aria-hidden="true"
        >
          {copy.detail}
        </span>
      </span>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.3)] transition-colors duration-150 ${
          state === "copied"
            ? "bg-emerald-500"
            : state === "error"
              ? "bg-red-500"
              : state === "loading"
                ? "bg-[#f9ac00] text-black"
                : "bg-[#171717] group-hover:bg-black"
        }`}
      >
        <StatusIcon
          className={`size-3.5 ${state === "loading" ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
