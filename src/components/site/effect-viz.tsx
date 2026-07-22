"use client";

/**
 * Effect-style visualization engine.
 *
 * Built ONLY from Kit Langton's visual-effect vocabulary (effect.kitlangton.com),
 * ported to motion/react: the stateful task node, arrow connectors, the odometer
 * ref cell (his RefDisplay), the sliding finalizer ScopeStack, and the schedule
 * timeline. No invented infographics. Every concept is expressed through those
 * primitives. Each card gets a play/pause + scrub control bar.
 *
 * Archetypes: flow (nodes -> result), ref (odometer + request/challenger),
 * scope (acquire/release + saga), schedule (retry/repeat over a time axis).
 * Specs for every backend item live in src/lib/backend-viz.ts.
 */

import { Pause, Play, RotateCcw } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  PiArrowRightFill,
  PiSkullFill,
  PiStarFourFill,
  PiWarningOctagonFill,
} from "react-icons/pi";

// ---------------------------------------------------------------------------
// shared tokens (exact values from the source)
// ---------------------------------------------------------------------------
export type TaskState =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "death"
  | "interrupted";

const COLORS: Record<TaskState, string> = {
  idle: "#475569",
  running: "#3b82f6",
  completed: "#15803d",
  failed: "#ef4444",
  death: "#991b1b",
  interrupted: "#f97316",
};

const S_DEFAULT = { type: "spring" as const, stiffness: 180, damping: 25, mass: 0.8 };
const S_WIDTH = { type: "spring" as const, stiffness: 180, damping: 25, mass: 0.8, bounce: 0.3, visualDuration: 0.6 };
const S_CONTENT = { type: "spring" as const, bounce: 0.3, visualDuration: 0.5, stiffness: 260, damping: 18 };
const S_BUBBLE = { type: "spring" as const, visualDuration: 0.2, delay: 0.05, bounce: 0.3 };
const S_SLIDE = { type: "spring" as const, visualDuration: 0.5, bounce: 0 };

// ---------------------------------------------------------------------------
// spec types
// ---------------------------------------------------------------------------
export interface VizNodeSpec {
  label: string;
  result?: string;
  error?: string;
  states: TaskState[];
}

interface Base {
  caption?: string;
  intervalMs?: number;
}

interface RefSpec {
  label: string;
  values: (number | string)[];
  unit?: string;
  request?: { label: string; states: TaskState[]; result?: string; error?: string };
  challenger?: { label: string; states: TaskState[]; error?: string };
}

type ScopeState = "hidden" | "pending" | "running" | "completed";
interface ScopeSpec {
  mode: "scope" | "saga";
  finalizers: { label: string; states: ScopeState[]; compensate?: string }[];
}

interface ScheduleSpec {
  label: string;
  /** total steps the cursor sweeps before looping */
  steps: number;
  /** attempts placed along the axis (leftPct 0..100), lit as the cursor passes */
  attempts: { atPct: number; outcome: "success" | "fail" | "wait"; label?: string }[];
}

export type VizSpec =
  | ({ archetype: "flow"; nodes: VizNodeSpec[]; arrowBefore?: number } & Base)
  | ({ archetype: "ref"; ref: RefSpec } & Base)
  | ({ archetype: "scope"; scope: ScopeSpec } & Base)
  | ({ archetype: "schedule"; schedule: ScheduleSpec } & Base);

// ---------------------------------------------------------------------------
// step clock + controls
// ---------------------------------------------------------------------------
function useStepClock(len: number, intervalMs = 1400) {
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

function Controls({
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
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-card/60 text-foreground/80 transition-colors hover:text-foreground"
      >
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
      </button>
      <button
        type="button"
        onClick={restart}
        aria-label="Restart"
        className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-card/60 text-foreground/60 transition-colors hover:text-foreground"
      >
        <RotateCcw size={13} />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: len }, (_, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length step ticks, never reordered
            key={i}
            type="button"
            aria-label={`Step ${i + 1}`}
            onClick={() => goto(i)}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === step ? 20 : 8, background: i === step ? "#3b82f6" : "rgba(115,115,115,0.4)" }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// primitive: the task node
// ---------------------------------------------------------------------------
function Glyph({ state }: { state: TaskState }) {
  const p = { size: 30, color: "rgba(255,255,255,0.9)" };
  if (state === "failed") return <PiSkullFill {...p} />;
  if (state === "death") return <PiSkullFill size={30} color="#dc2626" />;
  if (state === "interrupted") return <PiWarningOctagonFill {...p} />;
  return <PiStarFourFill {...p} />;
}

function usePrev<T>(v: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = v;
  }, [v]);
  return ref.current;
}

function TaskNode({ state, result, error, size = 64 }: { state: TaskState; result?: string; error?: string; size?: number }) {
  const prev = usePrev(state);
  const isRunning = state === "running";
  const isDeath = state === "death";
  const isFail = state === "failed" || state === "death";

  const width = useSpring(size, S_WIDTH);
  const height = useMotionValue(size);
  const radius = useSpring(8, S_DEFAULT);
  const rotation = useMotionValue(0);
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const contentScale = useSpring(1, S_DEFAULT);
  const contentOpacity = useSpring(1, S_DEFAULT);
  const flash = useMotionValue(0);
  const borderOpacity = useSpring(1, S_DEFAULT);
  const glow = useSpring(0, S_DEFAULT);
  const rotVel = useVelocity(rotation);
  const blur = useTransform(rotVel, [-100, 0, 100], [1, 0, 1], { clamp: true });
  const contentRef = useRef<HTMLDivElement>(null);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    animate(height, isRunning ? size * 0.4 : size, { type: "spring", bounce: isRunning ? 0.3 : 0.5, duration: 0.4 });
    radius.set(isRunning ? 15 : 8);
    contentOpacity.set(isRunning ? 0 : 1);
    if (!isRunning) {
      borderOpacity.set(1);
      glow.set(0);
      return;
    }
    const border = animate(borderOpacity, [1, 0.3, 1], { duration: 1.5, ease: "easeInOut", repeat: Infinity });
    const g = animate(glow, [1, 5, 1], { duration: 0.5, ease: "easeInOut", repeat: Infinity });
    let raf = 0;
    let cancelled = false;
    const jitter = () => {
      if (cancelled) return;
      const dur = 0.1 + Math.random() * 0.1;
      Promise.all([
        animate(rotation, (Math.random() * 4 + 0.5) * (Math.random() < 0.5 ? 1 : -1), { duration: dur, ease: "circInOut" }).finished,
        animate(shakeX, (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? -1 : 1), { duration: dur }).finished,
        animate(shakeY, (Math.random() * 0.6 + 0.1) * (Math.random() < 0.5 ? -1 : 1), { duration: dur }).finished,
      ]).then(() => {
        if (!cancelled) raf = requestAnimationFrame(jitter);
      });
    };
    raf = requestAnimationFrame(jitter);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      border.stop();
      g.stop();
      animate(rotation, 0, { duration: 0.3 });
      animate(shakeX, 0, { duration: 0.3 });
      animate(shakeY, 0, { duration: 0.3 });
    };
  }, [isRunning, size, height, radius, contentOpacity, borderOpacity, glow, rotation, shakeX, shakeY]);

  useEffect(() => {
    if (!prev) return;
    if (prev !== state && (state === "completed" || state === "running")) {
      animate(flash, 0.6, { duration: 0.02, ease: "circOut" }).finished.then(() => animate(flash, 0, { duration: 1, ease: "linear" }));
    }
  }, [state, prev, flash]);

  useLayoutEffect(() => {
    if (state === "completed") {
      contentScale.set(0);
      animate(contentScale, [1.3, 1], S_CONTENT);
      const w = contentRef.current?.scrollWidth ?? 0;
      width.set(w > size - 16 ? w + 24 : size);
    } else {
      width.set(size);
    }
  }, [state, size, contentScale, width]);

  useEffect(() => {
    if (!isFail) {
      setShowBubble(false);
      return;
    }
    setShowBubble(true);
    let cancelled = false;
    (async () => {
      for (let i = 0; i < 6 && !cancelled; i++) {
        await Promise.all([
          animate(shakeX, (Math.random() - 0.5) * 8, { duration: 0.08 }).finished,
          animate(shakeY, (Math.random() - 0.5) * 8, { duration: 0.08 }).finished,
          animate(rotation, (Math.random() - 0.5) * 8, { duration: 0.08 }).finished,
        ]);
      }
      if (!cancelled)
        await Promise.all([
          animate(shakeX, 0, { duration: 0.3 }).finished,
          animate(shakeY, 0, { duration: 0.3 }).finished,
          animate(rotation, 0, { duration: 0.3 }).finished,
        ]);
    })();
    const hide = setTimeout(() => setShowBubble(false), 1600);
    return () => {
      cancelled = true;
      clearTimeout(hide);
    };
  }, [isFail, shakeX, shakeY, rotation]);

  useEffect(() => {
    if (!isDeath) return;
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (cancelled) return;
      glow.set(3 + Math.random() * 4);
      contentScale.set(1 + Math.random() * 0.15);
      t = setTimeout(() => {
        contentScale.set(1);
        loop();
      }, 120 + Math.random() * 400);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(t);
      glow.set(0);
    };
  }, [isDeath, glow, contentScale]);

  const filter = useTransform([blur], ([b = 0]: number[]) => {
    const cb = Math.min(b, 2);
    return isDeath ? `blur(${cb}px) contrast(1.2) brightness(0.8)` : `blur(${cb}px)`;
  });
  const boxShadow = useTransform([glow], ([g = 0]: number[]) => {
    const cg = Math.min(g, 8);
    if (isDeath) return cg > 0 ? `0 0 ${cg * 2}px rgba(220,38,38,0.8)` : "none";
    return cg > 0 ? `0 0 ${cg}px rgba(100,200,255,0.2)` : "none";
  });

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, y: -5, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(5px)" }}
            transition={S_BUBBLE}
            style={{ position: "absolute", bottom: "100%", left: "50%", x: "-50%", marginBottom: 8, zIndex: 10, whiteSpace: "nowrap" }}
          >
            <div
              className="px-2 py-1 text-xs font-bold text-red-50"
              style={{ background: isDeath ? "rgba(153,27,27,0.97)" : "rgba(239,68,68,0.95)", borderRadius: 8, boxShadow: "0 0 16px rgba(0,0,0,0.5)", maxWidth: 220 }}
            >
              {error ?? (isDeath ? "Defect" : "Error")}
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${isDeath ? "rgba(153,27,27,0.97)" : "rgba(239,68,68,0.95)"}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ width, height: size, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <motion.div
          variants={{
            idle: { scale: 1, opacity: 0.6, backgroundColor: COLORS.idle },
            running: { scale: 0.95, opacity: 1, backgroundColor: COLORS.running },
            completed: { scale: 1, opacity: 1, backgroundColor: COLORS.completed },
            failed: { scale: 1, opacity: 1, backgroundColor: COLORS.failed },
            death: { scale: 1, opacity: 1, backgroundColor: COLORS.death },
            interrupted: { scale: 1, opacity: 1, backgroundColor: COLORS.interrupted },
          }}
          animate={state}
          initial={false}
          transition={{ backgroundColor: { duration: 0.1 }, scale: S_CONTENT, opacity: S_CONTENT }}
          style={{
            width,
            height,
            borderRadius: radius,
            position: "absolute",
            overflow: "hidden",
            rotate: rotation,
            x: shakeX,
            y: shakeY,
            border: isDeath ? "2px solid rgba(220,38,38,0.4)" : "1px solid rgba(255,255,255,0.1)",
            willChange: "transform, filter",
            filter,
            boxShadow,
          }}
        >
          <motion.div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", opacity: flash, pointerEvents: "none", zIndex: 5 }} />
        </motion.div>
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 13,
            color: "#fff",
            opacity: contentOpacity,
            scale: contentScale,
            padding: "0 8px",
          }}
        >
          <div ref={contentRef} style={{ whiteSpace: "nowrap" }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={state === "completed" ? "result" : state}
                initial={{ scale: 0, filter: "blur(10px)" }}
                animate={{ scale: 1, filter: "blur(0px)" }}
                exit={{ scale: 0, filter: "blur(10px)" }}
                transition={{ type: "spring", bounce: 0.3, visualDuration: 0.3 }}
              >
                {state === "completed" ? (result ?? "OK") : state === "running" ? null : <Glyph state={state} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function NodeWithLabel({ n, step }: { n: VizNodeSpec; step: number }) {
  const state = n.states[step % n.states.length] ?? "idle";
  return (
    <div className="flex flex-col items-center">
      <TaskNode state={state} result={n.result} error={n.error} />
      <div className="mt-2 text-center text-xs font-medium" style={{ color: state === "idle" ? "#525252" : "#a3a3a3" }}>
        {n.label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// primitive: odometer ref cell (kit's RefDisplay)
// ---------------------------------------------------------------------------
function RefCell({ label, value }: { label: string; value: string }) {
  const prev = usePrev(value);
  const changed = prev !== undefined && prev !== value;
  return (
    <motion.div
      className="flex items-center overflow-hidden rounded-lg border"
      initial={false}
      animate={{
        backgroundColor: changed ? "rgba(59,130,246,0.3)" : "rgba(38,38,38,0.8)",
        borderColor: changed ? "rgba(59,130,246,1)" : "rgba(64,64,64,0.5)",
      }}
      transition={{ type: "spring", visualDuration: changed ? 0.1 : 0.3, bounce: 0 }}
    >
      <span className="whitespace-nowrap p-2 px-4 text-sm font-medium text-neutral-400">{label}</span>
      <span className="h-9 w-px bg-neutral-700/60" />
      <div className="overflow-hidden p-2 px-4 font-mono text-lg font-semibold text-neutral-100">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -10, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 10, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// primitive: finalizer card (kit's FinalizerCard)
// ---------------------------------------------------------------------------
function FinalizerCard({ label, state, saga, compensate }: { label: string; state: ScopeState; saga?: boolean; compensate?: string }) {
  const running = state === "running";
  const completed = state === "completed";
  // saga: a "running" release is a compensation (orange), completed = rolled back
  const runBg = saga ? "border-orange-500 bg-orange-950/70" : "border-blue-500 bg-blue-950/70";
  const doneBg = saga ? "border-orange-500/60 bg-orange-950/40" : "border-green-500 bg-green-950/60";
  const box = state === "pending" ? "border-neutral-700 bg-neutral-800" : running ? runBg : doneBg;
  const check = completed ? (saga ? "border-orange-500 bg-orange-600" : "border-green-500 bg-green-500") : running ? "border-blue-500 bg-blue-800" : "border-neutral-500 bg-neutral-700";
  const text = state === "pending" ? "text-white" : running ? (saga ? "text-orange-200" : "text-blue-300") : saga ? "text-orange-200/90" : "text-green-300/90";
  return (
    <div className={`relative flex h-[52px] min-w-[188px] items-center gap-3 rounded-lg border px-4 shadow-lg shadow-neutral-900 ${box}`} style={{ willChange: "transform, opacity" }}>
      <div className={`flex size-6 items-center justify-center rounded border ${check}`}>
        <AnimatePresence>
          {completed && (
            <motion.svg
              key="check"
              initial={{ scale: 0, rotate: -180, filter: "blur(10px)" }}
              animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <path d={saga ? "M1 5 H13" : "M1.5 5L5 8.5L12.5 1"} stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <span className={`font-mono text-sm font-medium ${text}`}>
        {saga && completed && compensate ? compensate : label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// archetype: ref (odometer + request/challenger nodes) — rate limits, budgets,
// fencing tokens, ledger balances, cursors
// ---------------------------------------------------------------------------
function RefViz({ spec, step }: { spec: RefSpec; step: number }) {
  const value = String(spec.values[step % spec.values.length] ?? "");
  const reqState = spec.request?.states[step % spec.request.states.length] ?? "idle";
  const chalState = spec.challenger?.states[step % spec.challenger.states.length] ?? "idle";
  return (
    <div className="flex flex-wrap items-center gap-6">
      {spec.request && (
        <>
          <div className="flex flex-col items-center">
            <TaskNode state={reqState} result={spec.request.result} error={spec.request.error} size={52} />
            <div className="mt-2 text-xs font-medium text-neutral-500">{spec.request.label}</div>
          </div>
          <PiArrowRightFill size={20} className="mb-6 text-neutral-600" />
        </>
      )}
      <RefCell label={spec.label} value={spec.unit ? `${value}${spec.unit}` : value} />
      {spec.challenger && (
        <div className="flex flex-col items-center">
          <TaskNode state={chalState} error={spec.challenger.error} size={52} />
          <div className="mt-2 text-xs font-medium text-neutral-500">{spec.challenger.label}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// archetype: scope (kit's sliding ScopeStack) — lifecycle, scope, saga, locks
// ---------------------------------------------------------------------------
function ScopeViz({ spec, step }: { spec: ScopeSpec; step: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cardW = 188;
  const cur = spec.finalizers.map((f) => f.states[step % f.states.length] ?? "hidden");
  const pending = spec.finalizers.filter((_, i) => cur[i] === "pending");
  const completed = spec.finalizers.filter((_, i) => cur[i] === "completed");

  return (
    <div ref={ref} className="relative flex h-[104px] items-center">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-neutral-700">
        {[0, 1, 2].map((i) => (
          <motion.span key={`l${i}`} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}>
            <PiArrowRightFill size={12} />
          </motion.span>
        ))}
        <span className="tracking-[0.2em] text-xs">{spec.mode === "saga" ? "COMPENSATE" : "FINALIZERS"}</span>
        {[0, 1, 2].map((i) => (
          <motion.span key={`r${i}`} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 + 0.3, ease: "easeInOut" }}>
            <PiArrowRightFill size={12} />
          </motion.span>
        ))}
      </div>
      <AnimatePresence>
        {spec.finalizers.map((f, i) => {
          const st = cur[i];
          if (st === "hidden") return null;
          let x = 0;
          let z = 10;
          if (st === "running") {
            x = w > 0 ? (w - cardW) / 2 : 0;
            z = 20;
          } else if (st === "pending") {
            const pi = pending.indexOf(f);
            x = pi * 34 + 8;
            z = 10 + pi;
          } else {
            const ci = completed.indexOf(f);
            x = w - (completed.length - 1 - ci) * 34 - cardW - 8;
            z = 10 - ci;
          }
          return (
            <motion.div
              key={f.label}
              className="absolute"
              style={{ zIndex: z }}
              initial={{ opacity: 0, scale: 1.15, filter: "blur(4px)" }}
              animate={{ opacity: 1, x, scale: st === "running" ? 1.05 : 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
              transition={S_SLIDE}
            >
              <FinalizerCard label={f.label} state={st} saga={spec.mode === "saga"} compensate={f.compensate} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// archetype: schedule (kit's ScheduleTimeline) — retry, repeat, dunning, alarms
// ---------------------------------------------------------------------------
function ScheduleViz({ spec, step }: { spec: ScheduleSpec; step: number }) {
  const cursorPct = (step / Math.max(1, spec.steps - 1)) * 100;
  return (
    <div className="flex flex-col gap-6">
      <div className="text-xs font-medium text-neutral-500">{spec.label}</div>
      <div className="relative mx-2 h-[40px]">
        {/* background line */}
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded bg-neutral-800" />
        {/* tick marks */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {Array.from({ length: 13 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative ticks
            <span key={i} className="h-2 w-px bg-neutral-700" />
          ))}
        </div>
        {/* progressed segment */}
        <motion.div
          className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded bg-blue-500/70"
          animate={{ width: `${cursorPct}%` }}
          transition={{ duration: 0.2, ease: "linear" }}
        />
        {/* attempt dots */}
        {spec.attempts.map((a, i) => {
          const passed = cursorPct >= a.atPct - 0.5;
          const color = !passed ? "#475569" : a.outcome === "success" ? COLORS.completed : a.outcome === "fail" ? COLORS.failed : COLORS.running;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: positional attempts, never reordered
              key={i}
              className="absolute top-1/2"
              style={{ left: `${a.atPct}%`, transform: "translate(-50%,-50%)" }}
            >
              <motion.div
                className="rounded-full"
                animate={{ backgroundColor: color, scale: passed ? 1 : 0.7 }}
                transition={S_DEFAULT}
                style={{ width: 16, height: 16, boxShadow: passed ? `0 0 8px ${color}` : "none" }}
              />
              {a.label && <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-neutral-500">{a.label}</div>}
            </div>
          );
        })}
        {/* cursor */}
        <motion.div
          className="absolute top-1/2 h-[26px] w-[3px] -translate-y-1/2 rounded-full bg-white"
          animate={{ left: `${cursorPct}%` }}
          transition={{ duration: 0.2, ease: "linear" }}
          style={{ boxShadow: "0 0 8px rgba(255,255,255,0.5)" }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// dispatcher
// ---------------------------------------------------------------------------
function specLength(spec: VizSpec): number {
  switch (spec.archetype) {
    case "flow":
      return Math.max(...spec.nodes.map((n) => n.states.length));
    case "ref":
      return spec.ref.values.length;
    case "scope":
      return Math.max(...spec.scope.finalizers.map((f) => f.states.length));
    case "schedule":
      return spec.schedule.steps;
  }
}

export function EffectViz({ spec }: { spec: VizSpec }) {
  const len = Math.max(2, specLength(spec));
  const clock = useStepClock(len, spec.intervalMs);

  let body: React.ReactNode;
  switch (spec.archetype) {
    case "flow":
      body = (
        <div className="flex flex-row flex-wrap items-start gap-6">
          {spec.nodes.map((n, i) => (
            <div key={`${n.label}#${i}`} className="flex flex-row items-start gap-6">
              {spec.arrowBefore === i && (
                <div className="relative top-[13px] text-neutral-500">
                  <PiArrowRightFill size={24} />
                </div>
              )}
              <NodeWithLabel n={n} step={clock.step} />
            </div>
          ))}
        </div>
      );
      break;
    case "ref":
      body = <RefViz spec={spec.ref} step={clock.step} />;
      break;
    case "scope":
      body = <ScopeViz spec={spec.scope} step={clock.step} />;
      break;
    case "schedule":
      body = <ScheduleViz spec={spec.schedule} step={clock.step} />;
      break;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-6">
      <Controls step={clock.step} len={len} playing={clock.playing} toggle={clock.toggle} restart={clock.restart} goto={clock.goto} />
      <div className="min-h-[120px] py-2">{body}</div>
      {spec.caption && <p className="text-xs leading-relaxed text-muted-foreground">{spec.caption}</p>}
    </div>
  );
}
