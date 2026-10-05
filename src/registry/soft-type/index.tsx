"use client";

/**
 * SoftType - type anything and every character becomes a squishy letter.
 *
 * Each grapheme is drawn in a heavy rounded font, reduced to its centreline
 * (the medial axis of the glyph) and rebuilt as a chain of particles held by
 * distance, bending and shape springs. Letters press against each other, can
 * be grabbed and dragged, and pop when pressed and held. Works for any script
 * the device can draw; emoji become soft circles.
 *
 * BLANK - aryank.space
 */

import { type CSSProperties, useEffect, useRef } from "react";
import { SoftTypeController, type SoftTypeOptions } from "./controller";

export interface SoftTypeProps {
  /** Starting text when uncontrolled. */
  defaultValue?: string;
  /** Controlled text. Pair with `onValueChange`. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Longest text, in graphemes (what a reader counts as one character). */
  maxLength?: number;
  /** Letter colour. */
  ink?: string;
  /** Background, and the thin rim that keeps touching letters apart. */
  paper?: string;
  /** Pen weight relative to the font's own. Each letter stops where its counters would close. */
  weight?: number;
  /** How much larger than their slots letters are built, so they sit pressed together. */
  squeeze?: number;
  /** Allow breaking a word between letters when keeping it whole would shrink the letters a lot, as in narrow boxes. */
  breakWords?: boolean;
  /** Pop and typing sounds. */
  sound?: boolean;
  /** Font the letters are traced from. A heavy rounded face gives the cleanest centrelines. */
  fontFamily?: string;
  fontWeight?: number;
  /** Load Nunito from Google Fonts. Turn off when `fontFamily` is already loaded. */
  loadFont?: boolean;
  autoFocus?: boolean;
  /** Accessible name for the text input. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const NUNITO =
  "https://fonts.googleapis.com/css2?family=Nunito:wght@1000&display=swap";

/** Adds the Nunito stylesheet once and resolves when it has loaded (or failed). */
function loadNunito() {
  let link = document.querySelector<HTMLLinkElement>(`link[href="${NUNITO}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = NUNITO;
    document.head.append(link);
  }
  if (link.sheet) return Promise.resolve();
  const sheet = link;
  return new Promise<void>((resolve) => {
    sheet.addEventListener("load", () => resolve(), { once: true });
    sheet.addEventListener("error", () => resolve(), { once: true });
  });
}

const STYLES = `
.soft-type-root { background: var(--soft-type-paper); }
.soft-type-root[data-blueprint="true"] {
  background-color: #e4e5e8;
  background-image: linear-gradient(#d4d6da 1px, transparent 1px), linear-gradient(90deg, #d4d6da 1px, transparent 1px);
  background-size: 120px 120px;
  background-position: -1px -1px;
}
`;

export default function SoftType({
  defaultValue = "BLANK",
  value,
  onValueChange,
  maxLength = 64,
  ink = "#000000",
  paper = "#ffffff",
  weight = 1.2,
  squeeze = 1.05,
  breakWords = true,
  sound = true,
  fontFamily = '"Nunito", ui-rounded, system-ui, sans-serif',
  fontWeight = 1000,
  loadFont = true,
  autoFocus = false,
  label = "Type to change the letters",
  className,
  style,
}: SoftTypeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SoftTypeController | null>(null);
  // The text the controller starts from; later edits arrive through the input itself.
  const initial = useRef(value ?? defaultValue);
  const options: SoftTypeOptions = {
    value: value ?? controllerRef.current?.input.value ?? initial.current,
    fontFamily,
    fontWeight,
    theme: { ink, paper },
    squeeze,
    weight,
    breakWords,
    maxLength,
    sound,
    ariaLabel: label,
    onValueChange,
  };
  const latest = useRef(options);
  latest.current = options;

  // Mount once the font is ready: tracing a fallback face would build the wrong letters.
  // Later font changes rebuild through `update`, so only `loadFont` remounts.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    (async () => {
      if (loadFont) await loadNunito();
      const sample = latest.current.value || "A";
      await document.fonts
        .load(`${fontWeight} 160px ${fontFamily}`, sample)
        .catch(() => undefined);
      if (cancelled) return;
      const controller = new SoftTypeController(root, latest.current);
      controllerRef.current = controller;
      if (autoFocus) controller.input.focus({ preventScroll: true });
    })();
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [loadFont]);

  useEffect(() => {
    controllerRef.current?.update(latest.current);
  });

  return (
    <div
      ref={rootRef}
      className={`soft-type-root${className ? ` ${className}` : ""}`}
      style={
        {
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          "--soft-type-paper": paper,
          ...style,
        } as CSSProperties
      }
    >
      <style>{STYLES}</style>
    </div>
  );
}
