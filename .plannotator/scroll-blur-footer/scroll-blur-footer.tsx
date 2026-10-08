"use client";

import { animate, motionValue } from "motion";
import { type CSSProperties, useEffect, useRef } from "react";

const MAX_BLUR = 12;
const LAYERS = 6;
const IDLE_DELAY = 180;
const FADE_IN = { type: "spring", stiffness: 300, damping: 30 } as const;
const FADE_OUT = { type: "spring", stiffness: 80, damping: 26 } as const;

export interface ScrollBlurFooterProps {
  /** Which viewport edge carries the strongest blur. */
  direction?: "bottom" | "top";
  /** The source footer is 150px tall. */
  height?: CSSProperties["height"];
  /** Use absolute positioning inside a positioned preview shell. */
  position?: "fixed" | "absolute";
  className?: string;
  style?: CSSProperties;
}

/** Six progressive backdrop layers activate during scrolling and clear at rest. */
export default function ScrollBlurFooter({
  direction = "bottom",
  height = 150,
  position = "fixed",
  className,
  style,
}: ScrollBlurFooterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const strength = motionValue(0);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrolling = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const update = (value: number) =>
      element.style.setProperty("--sb", String(Math.max(0, value)));
    update(0);
    const unsubscribe = strength.on("change", update);

    const clearTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
    };
    const reset = () => {
      clearTimer();
      scrolling = false;
      strength.stop();
      strength.set(0);
    };
    const onScroll = () => {
      if (preference.matches) return;
      if (!scrolling) {
        scrolling = true;
        animate(strength, 1, FADE_IN);
      }
      clearTimer();
      idleTimer = setTimeout(() => {
        scrolling = false;
        animate(strength, 0, FADE_OUT);
      }, IDLE_DELAY);
    };

    // Capture sees nested scrolling containers as well as document scrolling.
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    preference.addEventListener("change", reset);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      preference.removeEventListener("change", reset);
      reset();
      unsubscribe();
      strength.destroy();
    };
  }, []);

  const gradientDirection = direction === "top" ? "to bottom" : "to top";
  const step = 100 / LAYERS;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-scroll-blur-footer=""
      className={className}
      style={{
        position,
        height,
        left: 0,
        right: 0,
        ...(direction === "top" ? { top: 0 } : { bottom: 0 }),
        zIndex: 7,
        overflow: "hidden",
        ...style,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: LAYERS }, (_, index) => {
        const blur = (MAX_BLUR * (index + 1)) / LAYERS;
        const end = 100 - index * step;
        const mask = `linear-gradient(${gradientDirection}, rgba(255,255,255,1) 0%, rgba(255,255,255,1) ${Math.max(0, end - step)}%, rgba(255,255,255,0) ${end}%)`;
        const filter = `blur(calc(var(--sb, 0) * ${blur}px))`;
        return (
          <div
            key={blur}
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: filter,
              WebkitBackdropFilter: filter,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}
