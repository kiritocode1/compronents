"use client";

/**
 * Chrome shared by every visualization archetype.
 *
 * Kit Langton's HeaderView action button and SegmentedControl, plus the step
 * clock they drive. This lives in its own module so both the effect engine
 * (effect-viz.tsx) and the type-stack engine (types-viz.tsx) can use one set of
 * controls without importing each other.
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  PiArrowCounterClockwiseBold,
  PiStarFourFill,
  PiStopFill,
} from "react-icons/pi";
import { vizSounds } from "@/lib/effect-viz-sounds";

export type TaskState =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "death"
  | "interrupted";

export const COLORS: Record<TaskState, string> = {
  idle: "#475569",
  running: "#3b82f6",
  completed: "#15803d",
  failed: "#ef4444",
  death: "#991b1b",
  interrupted: "#f97316",
};

const S_CONTENT = {
  type: "spring" as const,
  bounce: 0.3,
  visualDuration: 0.5,
  stiffness: 260,
  damping: 18,
};

export function useStepClock(len: number, intervalMs = 1400) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % len), intervalMs);
    return () => clearInterval(id);
  }, [playing, len, intervalMs]);
  return {
    step,
    playing,
    toggle: () => setPlaying((p) => !p),
    restart: () => setStep(0),
    goto: (n: number) => {
      setPlaying(false);
      setStep(n);
    },
  };
}

export function Controls({
  step,
  len,
  playing,
  toggle,
  restart,
  goto,
}: {
  step: number;
  len: number;
  playing: boolean;
  toggle: () => void;
  restart: () => void;
  goto: (n: number) => void;
}) {
  // kit's HeaderView action button, one control cycling run -> stop -> reset:
  // idle (sparkle, slate) click runs; running (stop, blue) click interrupts;
  // stopped mid-run (restart arrow, green) click resets back to idle
  const mode: "run" | "stop" | "reset" = playing
    ? "stop"
    : step === 0
      ? "run"
      : "reset";
  const bg =
    mode === "stop"
      ? COLORS.running
      : mode === "reset"
        ? COLORS.completed
        : COLORS.idle;
  const icon =
    mode === "stop" ? (
      <PiStopFill size={16} color="rgba(255,255,255,0.95)" />
    ) : mode === "reset" ? (
      <PiArrowCounterClockwiseBold size={16} color="rgba(255,255,255,0.95)" />
    ) : (
      <PiStarFourFill size={16} color="rgba(255,255,255,0.95)" />
    );
  const label = mode === "stop" ? "Stop" : mode === "reset" ? "Reset" : "Run";
  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={() => {
          if (mode === "reset") {
            vizSounds.playReset();
            restart();
          } else {
            toggle();
          }
        }}
        aria-label={label}
        className="flex size-8 items-center justify-center rounded-lg border border-white/10"
        animate={{ backgroundColor: bg }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ backgroundColor: { duration: 0.15 }, scale: S_CONTENT }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={mode}
            initial={{ scale: 0, rotate: -180, filter: "blur(8px)" }}
            animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ scale: 0, rotate: 180, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex"
          >
            {icon}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: len }, (_, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length step ticks, never reordered
            key={i}
            type="button"
            aria-label={`Step ${i + 1}`}
            onClick={() => goto(i)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === step ? 20 : 8,
              background: i === step ? "#3b82f6" : "rgba(115,115,115,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** kit's SegmentedControl (sliding blue indicator, mono labels) */
export function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const btn = buttonRefs.current.get(value);
    const box = containerRef.current;
    if (btn && box) {
      const a = box.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      setIndicator({ left: b.left - a.left, width: b.width });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center rounded-lg border border-neutral-700/30 bg-neutral-800/50 p-1"
    >
      {options.map((option) => (
        <button
          type="button"
          key={option}
          ref={(el) => {
            if (el) buttonRefs.current.set(option, el);
            else buttonRefs.current.delete(option);
          }}
          onClick={() => onChange(option)}
          className={`relative z-10 flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-center font-mono text-sm transition-colors duration-200 ${
            value === option
              ? "font-medium text-white"
              : "text-neutral-400 hover:text-neutral-300"
          }`}
        >
          {option}
        </button>
      ))}
      <motion.div
        className="absolute top-1 bottom-1 rounded-md bg-blue-600 shadow-md"
        initial={false}
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: "spring", visualDuration: 0.3, bounce: 0 }}
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
