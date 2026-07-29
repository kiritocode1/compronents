"use client";

/**
 * Effect-style visualization engine.
 *
 * Built ONLY from Kit Langton's visual-effect vocabulary (effect.kitlangton.com),
 * ported to motion/react: the stateful task node, arrow connectors, the odometer
 * ref cell (RefDisplay), the sliding finalizer ScopeStack, the ScheduleTimeline
 * (grid ticks, blue run segments with dots, gap-duration pills, sweeping cursor),
 * and the SegmentedControl variant toggle. No invented infographics.
 *
 * Archetypes: flow (nodes -> result), ref (odometer + request/challenger),
 * scope (acquire/release), schedule (nodes + kit's timeline). A registry entry
 * can also be a variant set: kit-style segmented control switches the spec.
 * Specs live in src/lib/backend-viz.ts.
 */

import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PiArrowRightFill,
  PiSkullFill,
  PiStarFourFill,
  PiWarningOctagonFill,
} from "react-icons/pi";
import { useSoundSetting } from "@/components/site/sound-provider";
import {
  DEFAULT_TYPE_THEME,
  MorphingSegments,
  Prose,
  TYPE_BORDER,
  TypeBadge,
  TypeStacks,
  type TypeStep,
} from "@/components/site/types-viz";
import {
  COLORS,
  type TaskState,
  useStepClock,
  Controls as VizControls,
  SegmentedControl as VizSegmentedControl,
} from "@/components/site/viz-chrome";
import { setVizSoundsEnabled, vizSounds } from "@/lib/effect-viz-sounds";
import { segmentType, type TypeNode } from "@/lib/type-tokens";
import { setTypeSoundsEnabled, typeSounds } from "@/lib/types-viz-sounds";

// ---------------------------------------------------------------------------
// shared tokens (exact values from the source)
// ---------------------------------------------------------------------------
export type { TaskState };
export {
  VizControls as Controls,
  VizSegmentedControl as SegmentedControl,
  useStepClock,
};

const S_DEFAULT = {
  type: "spring" as const,
  stiffness: 180,
  damping: 25,
  mass: 0.8,
};
const S_WIDTH = {
  type: "spring" as const,
  stiffness: 180,
  damping: 25,
  mass: 0.8,
  bounce: 0.3,
  visualDuration: 0.6,
};
const S_CONTENT = {
  type: "spring" as const,
  bounce: 0.3,
  visualDuration: 0.5,
  stiffness: 260,
  damping: 18,
};
const S_BUBBLE = {
  type: "spring" as const,
  visualDuration: 0.2,
  delay: 0.05,
  bounce: 0.3,
};
const S_SLIDE = { type: "spring" as const, visualDuration: 0.5, bounce: 0 };
const S_DOT = { type: "spring" as const, visualDuration: 0.5, bounce: 0.4 };

// kit's ScheduleTimeline config
const TL = {
  height: 50,
  line: 3,
  dot: 12,
  cursorW: 3,
  tickSpacing: 50,
  runActive: "#60a5fa", // blue-400
  runDone: "#3b82f6", // blue-500
  gapActive: "#a3a3a3", // neutral-400
  gapDone: "#525252", // neutral-600
  grid: "#262626", // neutral-800
  cursorOn: "#ffffff",
  cursorOff: "#737373",
};

// ---------------------------------------------------------------------------
// spec types
// ---------------------------------------------------------------------------
export interface VizNodeSpec {
  label: string;
  result?: string;
  error?: string;
  states: TaskState[];
  /**
   * The type this node carries, one entry per step (a shorter array holds its
   * last entry). Rendered as a badge inside the node's own column, tinted with
   * the node's state, so the runtime value and the type it travels under are
   * one unit rather than two diagrams.
   */
  types?: TypeNode[];
  /** kit's NotificationBubble: shown (with a chime) while at this step */
  notify?: { atStep: number; message: string; icon?: string };
  /** substring of the spec's code line that lights up with this node's state */
  token?: string;
}

interface Base {
  caption?: string;
  intervalMs?: number;
  /** kit's CodeBlock + FloatingHighlight: a mono code line rendered under the
   * viz; node tokens inside it light up with the owning node's state */
  code?: string;
  /**
   * Type stacks rendered under this archetype's body, advanced by the SAME step
   * clock, so the runtime picture and the type-level contract that guards it
   * play together in one view instead of behind a variant toggle.
   *
   * One entry per step. A shorter array holds its last entry for the remaining
   * steps, so a contract that only changes once does not have to be repeated.
   */
  typeStacks?: TypeStep[];
}

/** a ref value; `bad` marks a write that should never have landed (red flash) */
type RefValue = number | string | { v: number | string; bad?: boolean };

interface RefSpec {
  label: string;
  values: RefValue[];
  unit?: string;
  request?: {
    label: string;
    states: TaskState[];
    result?: string;
    error?: string;
    token?: string;
  };
  challenger?: {
    label: string;
    states: TaskState[];
    error?: string;
    token?: string;
  };
}

type ScopeState = "hidden" | "pending" | "running" | "completed";
interface ScopeSpec {
  mode: "scope" | "saga";
  /** kit's addFinalizer layout: the effect node shown above the strip, so an
   * outcome (succeed/fail/die/interrupt) plays out while finalizers still run */
  node?: VizNodeSpec;
  finalizers: {
    label: string;
    states: ScopeState[];
    compensate?: string;
    token?: string;
  }[];
}

/** kit's ScheduleTimeline: alternating run (blue, dotted ends) and gap
 * (neutral, labeled pill) segments swept by a cursor. Node states arrays have
 * segments.length + 1 entries; the last entry is the state after the sweep. */
interface ScheduleSpec {
  nodes: VizNodeSpec[];
  segments: { kind: "run" | "gap"; w?: number; label?: string }[];
  durationMs?: number;
}

export type VizSpec =
  | ({ archetype: "flow"; nodes: VizNodeSpec[]; arrowBefore?: number } & Base)
  | ({ archetype: "ref"; ref: RefSpec } & Base)
  | ({ archetype: "scope"; scope: ScopeSpec } & Base)
  | ({ archetype: "schedule"; schedule: ScheduleSpec } & Base)
  /**
   * kit's Visual Types vocabulary (types.kitlangton.com) as a fifth archetype:
   * a column of type stacks that morph step to step. Use it when the thing a
   * component prevents is a *type-level* mistake rather than a runtime one, so
   * the failure shows up in the contract instead of in a task node. Stacks and
   * steps are documented in src/components/site/types-viz.tsx.
   */
  | ({ archetype: "types"; steps: TypeStep[] } & Base);

/** a registry entry: one spec, or a kit-style segmented-control variant set */
export type VizEntry =
  | VizSpec
  | { control: string; variants: { name: string; spec: VizSpec }[] };

// ---------------------------------------------------------------------------
// step clock + controls
// ---------------------------------------------------------------------------
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

function TaskNode({
  state,
  result,
  error,
  size = 64,
}: {
  state: TaskState;
  result?: string;
  error?: string;
  size?: number;
}) {
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
    animate(height, isRunning ? size * 0.4 : size, {
      type: "spring",
      bounce: isRunning ? 0.3 : 0.5,
      duration: 0.4,
    });
    radius.set(isRunning ? 15 : 8);
    contentOpacity.set(isRunning ? 0 : 1);
    if (!isRunning) {
      borderOpacity.set(1);
      glow.set(0);
      return;
    }
    const border = animate(borderOpacity, [1, 0.3, 1], {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    });
    const g = animate(glow, [1, 5, 1], {
      duration: 0.5,
      ease: "easeInOut",
      repeat: Infinity,
    });
    let raf = 0;
    let cancelled = false;
    const jitter = () => {
      if (cancelled) return;
      const dur = 0.1 + Math.random() * 0.1;
      Promise.all([
        animate(
          rotation,
          (Math.random() * 4 + 0.5) * (Math.random() < 0.5 ? 1 : -1),
          { duration: dur, ease: "circInOut" },
        ).finished,
        animate(
          shakeX,
          (Math.random() * 1.5 + 0.5) * (Math.random() < 0.5 ? -1 : 1),
          { duration: dur },
        ).finished,
        animate(
          shakeY,
          (Math.random() * 0.6 + 0.1) * (Math.random() < 0.5 ? -1 : 1),
          { duration: dur },
        ).finished,
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
  }, [
    isRunning,
    size,
    height,
    radius,
    contentOpacity,
    borderOpacity,
    glow,
    rotation,
    shakeX,
    shakeY,
  ]);

  useEffect(() => {
    if (!prev) return;
    if (prev !== state && (state === "completed" || state === "running")) {
      animate(flash, 0.6, { duration: 0.02, ease: "circOut" }).finished.then(
        () => animate(flash, 0, { duration: 1, ease: "linear" }),
      );
    }
  }, [state, prev, flash]);

  // kit's synchronized sound cues, one per state transition
  useEffect(() => {
    if (!prev || prev === state) return;
    if (state === "running") vizSounds.playRunning();
    else if (state === "completed") vizSounds.playSuccess();
    else if (state === "failed") vizSounds.playFailure();
    else if (state === "death") vizSounds.playDeath();
    else if (state === "interrupted") vizSounds.playInterrupted();
  }, [state, prev]);

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
          animate(shakeX, (Math.random() - 0.5) * 8, { duration: 0.08 })
            .finished,
          animate(shakeY, (Math.random() - 0.5) * 8, { duration: 0.08 })
            .finished,
          animate(rotation, (Math.random() - 0.5) * 8, { duration: 0.08 })
            .finished,
        ]);
      }
      if (!cancelled)
        await Promise.all([
          animate(shakeX, 0, { duration: 0.3 }).finished,
          animate(shakeY, 0, { duration: 0.3 }).finished,
          animate(rotation, 0, { duration: 0.3 }).finished,
        ]);
    })();
    // hide inside the step (default 1400ms) so the exit finishes before the
    // next step can raise another bubble on this node
    const hide = setTimeout(() => setShowBubble(false), 1100);
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
      t = setTimeout(
        () => {
          contentScale.set(1);
          loop();
        },
        120 + Math.random() * 400,
      );
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
    return isDeath
      ? `blur(${cb}px) contrast(1.2) brightness(0.8)`
      : `blur(${cb}px)`;
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
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              x: "-50%",
              marginBottom: 8,
              zIndex: 10,
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="px-2 py-1 text-xs font-bold text-red-50"
              style={{
                background: isDeath
                  ? "rgba(153,27,27,0.97)"
                  : "rgba(239,68,68,0.95)",
                borderRadius: 8,
                boxShadow: "0 0 16px rgba(0,0,0,0.5)",
                maxWidth: 220,
              }}
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

      <motion.div
        style={{
          width,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <motion.div
          variants={{
            idle: { scale: 1, opacity: 0.6, backgroundColor: COLORS.idle },
            running: {
              scale: 0.95,
              opacity: 1,
              backgroundColor: COLORS.running,
            },
            completed: {
              scale: 1,
              opacity: 1,
              backgroundColor: COLORS.completed,
            },
            failed: { scale: 1, opacity: 1, backgroundColor: COLORS.failed },
            death: { scale: 1, opacity: 1, backgroundColor: COLORS.death },
            interrupted: {
              scale: 1,
              opacity: 1,
              backgroundColor: COLORS.interrupted,
            },
          }}
          animate={state}
          initial={false}
          transition={{
            backgroundColor: { duration: 0.1 },
            scale: S_CONTENT,
            opacity: S_CONTENT,
          }}
          style={{
            width,
            height,
            borderRadius: radius,
            position: "absolute",
            overflow: "hidden",
            rotate: rotation,
            x: shakeX,
            y: shakeY,
            border: isDeath
              ? "2px solid rgba(220,38,38,0.4)"
              : "1px solid rgba(255,255,255,0.1)",
            willChange: "transform, filter",
            filter,
            boxShadow,
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.85)",
              opacity: flash,
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
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
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  visualDuration: 0.3,
                }}
              >
                {state === "completed" ? (
                  (result ?? "OK")
                ) : state === "running" ? null : (
                  <Glyph state={state} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** kit's NotificationBubble: blue bobbing bubble with icon + message */
function NotificationBubble({
  message,
  icon,
}: {
  message: string;
  icon?: string;
}) {
  const floatY = useMotionValue(0);
  useEffect(() => {
    vizSounds.playNotificationChime();
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        await animate(floatY, -12, { duration: 0.8, ease: "easeInOut" })
          .finished;
        if (cancelled) break;
        await animate(floatY, 0, { duration: 0.8, ease: "easeInOut" }).finished;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [floatY]);

  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        x: "-50%",
        zIndex: 30,
        pointerEvents: "none",
      }}
      initial={{ opacity: 0, scale: 0, y: 50, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0, y: 50, filter: "blur(10px)" }}
      transition={{ type: "spring", visualDuration: 0.3, bounce: 0.1 }}
    >
      <motion.div style={{ y: floatY }}>
        <div
          style={{
            position: "absolute",
            bottom: -7,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid #3b82f6",
          }}
        />
        <div
          className="flex items-center gap-2 whitespace-nowrap rounded-lg p-2 px-3 text-sm font-medium text-white"
          style={{
            background: "#3b82f6",
            maxWidth: 220,
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 4px 12px rgba(59,130,246,0.3)",
          }}
        >
          {icon && <span>{icon}</span>}
          <span>{message}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** kit's Timer: live mono elapsed while running, frozen at the final time */
function useNodeTimer(state: TaskState) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (state === "running") {
      startRef.current = Date.now();
      const id = window.setInterval(() => {
        if (startRef.current !== null)
          setElapsed(Date.now() - startRef.current);
      }, 10);
      return () => clearInterval(id);
    }
    if (state === "idle") {
      startRef.current = null;
      setElapsed(0);
    }
  }, [state]);
  return elapsed;
}

function formatMs(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function NodeWithLabel({
  n,
  state,
  step,
  onHover,
}: {
  n: VizNodeSpec;
  state: TaskState;
  step?: number;
  /** kit links node to code: hovering a node lights its token in the code line */
  onHover?: (token: string | undefined) => void;
}) {
  const elapsed = useNodeTimer(state);
  // a stable id per mounted node, so two nodes carrying the same type still
  // morph independently instead of sharing segment identity
  const typeId = useId();
  // kit's rule: the error bubble owns a failed/death node, so the notification
  // bubble is suppressed while one is showing (never two dialogues at once).
  // It also auto-hides after 1s so its exit is fully done BEFORE the next step
  // can raise an error bubble on the same node: a real time gap, not a crossfade.
  const notifyActive =
    n.notify !== undefined &&
    step !== undefined &&
    step === n.notify.atStep &&
    state !== "failed" &&
    state !== "death";
  const [showNotify, setShowNotify] = useState(false);
  useEffect(() => {
    if (!notifyActive) {
      setShowNotify(false);
      return;
    }
    setShowNotify(true);
    const t = setTimeout(() => setShowNotify(false), 1000);
    return () => clearTimeout(t);
  }, [notifyActive]);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only moves a decorative highlight over the code line; the same node/token pairing is already conveyed by the token's background colour, so there is nothing here for a keyboard or screen reader to reach
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHover?.(n.token)}
      onMouseLeave={() => onHover?.(undefined)}
    >
      <AnimatePresence>
        {showNotify && n.notify && (
          <NotificationBubble message={n.notify.message} icon={n.notify.icon} />
        )}
      </AnimatePresence>
      <TaskNode state={state} result={n.result} error={n.error} />
      <div
        className="mt-2 text-center text-xs font-medium"
        style={{ color: state === "idle" ? "#525252" : "#a3a3a3" }}
      >
        {elapsed > 0 && state !== "idle" ? (
          <span className="font-mono">{formatMs(elapsed)}</span>
        ) : (
          n.label
        )}
      </div>
      {n.types?.length ? (
        <TypeBadge
          node={n.types[Math.min(step ?? 0, n.types.length - 1)] as TypeNode}
          id={`${n.label}-${typeId}`}
          accent={COLORS[state]}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// primitive: odometer ref cell (kit's RefDisplay)
// ---------------------------------------------------------------------------
function RefCell({
  label,
  value,
  bad = false,
}: {
  label: string;
  value: string;
  bad?: boolean;
}) {
  const prev = usePrev(value);
  const changed = prev !== undefined && prev !== value;
  useEffect(() => {
    if (!changed) return;
    if (bad) vizSounds.playFailure();
    else vizSounds.playRefUpdate();
  }, [changed, bad]);
  return (
    <motion.div
      className="flex items-center overflow-hidden rounded-lg border"
      initial={false}
      animate={{
        backgroundColor: changed
          ? bad
            ? "rgba(239,68,68,0.3)"
            : "rgba(59,130,246,0.3)"
          : bad
            ? "rgba(60,20,20,0.85)"
            : "rgba(38,38,38,0.8)",
        borderColor: changed
          ? bad
            ? "rgba(239,68,68,1)"
            : "rgba(59,130,246,1)"
          : bad
            ? "rgba(239,68,68,0.6)"
            : "rgba(64,64,64,0.5)",
      }}
      transition={{
        type: "spring",
        visualDuration: changed ? 0.1 : 0.3,
        bounce: 0,
      }}
    >
      <span className="whitespace-nowrap p-2 px-4 text-sm font-medium text-neutral-400">
        {label}
      </span>
      <span className="h-9 w-px bg-neutral-700/60" />
      <div
        className={`overflow-hidden p-2 px-4 font-mono text-lg font-semibold ${bad ? "text-red-300" : "text-neutral-100"}`}
      >
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
// primitive: code line with state-synced token highlights (kit's CodeBlock +
// FloatingHighlight, driven by node state instead of hover)
// ---------------------------------------------------------------------------
interface CodeMark {
  token: string;
  state: TaskState;
}

const MARK_BG: Record<TaskState, string> = {
  idle: "transparent",
  running: "rgba(59,130,246,0.35)",
  completed: "rgba(21,128,61,0.4)",
  failed: "rgba(239,68,68,0.35)",
  death: "rgba(153,27,27,0.5)",
  interrupted: "rgba(249,115,22,0.35)",
};

/**
 * kit's FloatingHighlight: one rounded rect that springs between code tokens
 * rather than a per-token background that pops on and off. It measures the
 * target span against the `<pre>` and animates x/y/width/height, fading out
 * (and shrinking slightly) when nothing is targeted.
 */
function FloatingHighlight({
  containerRef,
  token,
}: {
  containerRef: React.RefObject<HTMLPreElement | null>;
  token: string | undefined;
}) {
  const spring = { bounce: 0, visualDuration: 0.2 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const width = useSpring(0, spring);
  const height = useSpring(0, spring);
  const opacity = useMotionValue(0);
  const scale = useSpring(1, { stiffness: 300, damping: 20 });
  // the rect blurs as it fades, so it never reads as a hard edge mid-flight
  const blur = useTransform(opacity, [0, 1], [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  useEffect(() => {
    const pre = containerRef.current;
    if (!pre || !token) {
      animate(opacity, 0, { ease: "linear", duration: 0.2 });
      scale.set(0.9);
      return;
    }
    // a token now spans several segments, so the rect is their union
    const parts = pre.querySelectorAll<HTMLElement>(
      `[data-mark="${CSS.escape(token)}"]`,
    );
    if (parts.length === 0) {
      animate(opacity, 0, { ease: "linear", duration: 0.2 });
      scale.set(0.95);
      return;
    }
    const outer = pre.getBoundingClientRect();
    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;
    for (const part of parts) {
      const box = part.getBoundingClientRect();
      left = Math.min(left, box.left);
      top = Math.min(top, box.top);
      right = Math.max(right, box.right);
      bottom = Math.max(bottom, box.bottom);
    }
    const inner = {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
    // first placement should not slide in from the origin
    if (opacity.get() === 0) {
      x.jump(inner.left - outer.left + pre.scrollLeft);
      y.jump(inner.top - outer.top);
      width.jump(inner.width);
      height.jump(inner.height);
    } else {
      x.set(inner.left - outer.left + pre.scrollLeft);
      y.set(inner.top - outer.top);
      width.set(inner.width);
      height.set(inner.height);
    }
    scale.set(1);
    animate(opacity, 1, { ease: "linear", duration: 0.15 });
  }, [token, containerRef, opacity, scale, x, y, width, height]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 rounded"
      style={{
        x,
        y,
        width,
        height,
        opacity,
        scale,
        filter,
        background: "rgba(255,255,255,0.16)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.18)",
      }}
    />
  );
}

/**
 * The code line under the boxes, drawn with the same segment engine as the type
 * badges and stacks.
 *
 * That unification is the point: one tokenizer, one palette. The line itself is
 * fixed per spec (it reads as the code, not as an animation), so it only morphs
 * when a variant switch replaces it. What moves within a step is the tinting:
 * the tokens owned by a node light with that node's state.
 */
function CodeLine({
  code,
  marks,
  hovered,
}: {
  code: string;
  marks: CodeMark[];
  hovered?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);

  const segments = useMemo(
    () => segmentType(code, DEFAULT_TYPE_THEME, "code"),
    [code],
  );

  /**
   * Which segments belong to which mark. The tokenizer re-spaces its input, so
   * matching happens against the *rendered* text rather than the source string;
   * a mark that no longer appears simply goes untinted rather than mis-tinting.
   */
  const decoration = useMemo(() => {
    const byId = new Map<string, { state: TaskState; token: string }>();
    const rendered = segments.map((s) => s.content).join("");
    // segment start offsets in the rendered string
    const offsets: number[] = [];
    let at = 0;
    for (const segment of segments) {
      offsets.push(at);
      at += segment.content.length;
    }
    for (const mark of marks) {
      const start = rendered.indexOf(mark.token);
      if (start < 0) continue;
      const end = start + mark.token.length;
      segments.forEach((segment, i) => {
        const from = offsets[i] ?? 0;
        const to = from + segment.content.length;
        if (from < end && to > start) {
          byId.set(segment.id, { state: mark.state, token: mark.token });
        }
      });
    }
    return byId;
  }, [segments, marks]);

  return (
    <pre
      ref={preRef}
      className="relative overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/70 p-3 font-mono text-[13px] leading-relaxed"
    >
      <FloatingHighlight containerRef={preRef} token={hovered} />
      <MorphingSegments
        segments={segments}
        className="font-mono text-[13px] leading-relaxed"
        decorate={(segment) => {
          const hit = decoration.get(segment.id);
          if (!hit) return undefined;
          return {
            backgroundColor: MARK_BG[hit.state],
            color: hit.state === "idle" ? undefined : "#fff",
            mark: hit.token,
          };
        }}
      />
    </pre>
  );
}

// ---------------------------------------------------------------------------
// primitive: finalizer card (kit's FinalizerCard)
// ---------------------------------------------------------------------------
function FinalizerCard({
  label,
  state,
  saga,
  compensate,
}: {
  label: string;
  state: ScopeState;
  saga?: boolean;
  compensate?: string;
}) {
  const running = state === "running";
  const completed = state === "completed";
  const runBg = saga
    ? "border-orange-500 bg-orange-950/70"
    : "border-blue-500 bg-blue-950/70";
  const doneBg = saga
    ? "border-orange-500/60 bg-orange-950/40"
    : "border-green-500 bg-green-950/60";
  const box =
    state === "pending"
      ? "border-neutral-700 bg-neutral-800"
      : running
        ? runBg
        : doneBg;
  const check = completed
    ? saga
      ? "border-orange-500 bg-orange-600"
      : "border-green-500 bg-green-500"
    : running
      ? "border-blue-500 bg-blue-800"
      : "border-neutral-500 bg-neutral-700";
  const text =
    state === "pending"
      ? "text-white"
      : running
        ? saga
          ? "text-orange-200"
          : "text-blue-300"
        : saga
          ? "text-orange-200/90"
          : "text-green-300/90";
  return (
    <div
      className={`relative flex h-[52px] min-w-[188px] items-center gap-3 rounded-lg border px-4 shadow-lg shadow-neutral-900 ${box}`}
      style={{ willChange: "transform, opacity" }}
    >
      <div
        className={`flex size-6 items-center justify-center rounded border ${check}`}
      >
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
              role="img"
              aria-label={saga ? "compensated" : "released"}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <title>{saga ? "compensated" : "released"}</title>
              <path
                d={saga ? "M1 5 H13" : "M1.5 5L5 8.5L12.5 1"}
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
// archetype: ref
// ---------------------------------------------------------------------------
function RefViz({ spec, step }: { spec: RefSpec; step: number }) {
  const raw = spec.values[step % spec.values.length];
  const bad = typeof raw === "object" && raw !== null && raw.bad === true;
  const value = String(
    typeof raw === "object" && raw !== null ? raw.v : (raw ?? ""),
  );
  const reqState =
    spec.request?.states[step % spec.request.states.length] ?? "idle";
  const chalState =
    spec.challenger?.states[step % spec.challenger.states.length] ?? "idle";
  return (
    <div className="flex flex-wrap items-center gap-6 pt-8">
      {spec.request && (
        <>
          <div className="flex flex-col items-center">
            <TaskNode
              state={reqState}
              result={spec.request.result}
              error={spec.request.error}
              size={52}
            />
            <div className="mt-2 text-xs font-medium text-neutral-500">
              {spec.request.label}
            </div>
          </div>
          <PiArrowRightFill size={20} className="mb-6 text-neutral-600" />
        </>
      )}
      <RefCell
        label={spec.label}
        value={spec.unit ? `${value}${spec.unit}` : value}
        bad={bad}
      />
      {spec.challenger && (
        <div className="flex flex-col items-center">
          <TaskNode state={chalState} error={spec.challenger.error} size={52} />
          <div className="mt-2 text-xs font-medium text-neutral-500">
            {spec.challenger.label}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// archetype: scope (kit's sliding ScopeStack)
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
  const cur = spec.finalizers.map(
    (f) => f.states[step % f.states.length] ?? "hidden",
  );
  const pending = spec.finalizers.filter((_, i) => cur[i] === "pending");
  const completed = spec.finalizers.filter((_, i) => cur[i] === "completed");

  // kit's finalizer cues on card transitions
  const prevCur = usePrev(cur);
  useEffect(() => {
    if (!prevCur) return;
    cur.forEach((st, i) => {
      const was = prevCur[i];
      if (was === st) return;
      if (st === "pending") vizSounds.playFinalizerCreated();
      else if (st === "running") vizSounds.playFinalizerRunning();
      else if (st === "completed") vizSounds.playFinalizerCompleted();
    });
  }, [cur, prevCur]);

  return (
    <div className="flex flex-col gap-5">
      {spec.node && (
        <div className="flex pt-8">
          <NodeWithLabel
            n={spec.node}
            state={spec.node.states[step % spec.node.states.length] ?? "idle"}
            step={step}
          />
        </div>
      )}
      <div ref={ref} className="relative flex h-[104px] items-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-neutral-700">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={`l${i}`}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            >
              <PiArrowRightFill size={12} />
            </motion.span>
          ))}
          <span className="text-xs tracking-[0.2em]">
            {spec.mode === "saga" ? "COMPENSATE" : "FINALIZERS"}
          </span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={`r${i}`}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15 + 0.3,
                ease: "easeInOut",
              }}
            >
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
                animate={{
                  opacity: 1,
                  x,
                  scale: st === "running" ? 1.05 : 1,
                  filter: "blur(0px)",
                }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                transition={S_SLIDE}
              >
                <FinalizerCard
                  label={f.label}
                  state={st}
                  saga={spec.mode === "saga"}
                  compensate={f.compensate}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// archetype: schedule (faithful port of kit's ScheduleTimeline)
// ---------------------------------------------------------------------------
function ScheduleViz({ spec, code }: { spec: ScheduleSpec; code?: string }) {
  const durationMs = spec.durationMs ?? 6000;
  const HOLD_MS = 1400;

  const totalW = spec.segments.reduce((a, seg) => a + (seg.w ?? 1), 0);
  const bounds = useMemo(() => {
    let acc = 0;
    return spec.segments.map((seg) => {
      const start = (acc / totalW) * 100;
      acc += seg.w ?? 1;
      return { start, end: (acc / totalW) * 100 };
    });
  }, [spec.segments, totalW]);

  const progress = useMotionValue(0);
  const [p, setP] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setP(v));
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    let ctrl: AnimationPlaybackControls | undefined;
    let t: ReturnType<typeof setTimeout>;
    const run = () => {
      if (cancelled) return;
      const remaining = ((100 - progress.get()) / 100) * durationMs;
      ctrl = animate(progress, 100, {
        duration: Math.max(remaining, 16) / 1000,
        ease: "linear",
      });
      ctrl.finished.then(() => {
        if (cancelled) return;
        t = setTimeout(() => {
          if (cancelled) return;
          progress.set(0);
          run();
        }, HOLD_MS);
      });
    };
    run();
    return () => {
      cancelled = true;
      ctrl?.stop();
      clearTimeout(t);
    };
  }, [playing, durationMs, progress]);

  const finished = p >= 100;
  const segIdxRaw = bounds.findIndex((b) => p < b.end);
  const segIdx =
    finished || segIdxRaw === -1 ? spec.segments.length : segIdxRaw;
  const len = spec.segments.length + 1;

  return (
    <div className="flex flex-col gap-5">
      <VizControls
        step={segIdx}
        len={len}
        playing={playing}
        toggle={() => setPlaying((v) => !v)}
        restart={() => progress.set(0)}
        goto={(i) => {
          setPlaying(false);
          progress.set(
            i >= spec.segments.length ? 100 : (bounds[i]?.start ?? 0) + 0.01,
          );
        }}
      />

      {/* nodes above the timeline, driven by the current segment; pt-10 keeps
          bubbles clear of the controls row */}
      <div className="flex flex-row flex-wrap items-start gap-6 pt-10">
        {spec.nodes.map((n, i) => (
          <div key={n.label} className="flex flex-row items-start gap-6">
            {i > 0 && (
              <div className="relative top-[13px] text-neutral-500">
                <PiArrowRightFill size={24} />
              </div>
            )}
            <NodeWithLabel
              n={n}
              state={n.states[Math.min(segIdx, n.states.length - 1)] ?? "idle"}
              step={segIdx}
            />
          </div>
        ))}
      </div>

      {/* kit's timeline: grid ticks, run segments with dots, gap pills, cursor */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: TL.height }}
      >
        {/* background line */}
        <div
          className="absolute w-full"
          style={{
            height: TL.line,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: TL.grid,
          }}
        />
        {/* vertical tick grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(to right, ${TL.grid} 0, ${TL.grid} 1px, transparent 1px, transparent ${TL.tickSpacing}px)`,
          }}
        />

        {spec.segments.map((seg, i) => {
          const b = bounds[i];
          if (!b) return null;
          const started = p > b.start;
          const complete = p >= b.end;
          const widthPct = Math.max(0, Math.min(p, b.end) - b.start);
          const active = started && !complete;
          if (!started) return null;

          if (seg.kind === "run") {
            return (
              <div key={`${seg.kind}${i.toString()}`}>
                <motion.div
                  className="absolute"
                  style={{
                    left: `${b.start}%`,
                    width: `${widthPct}%`,
                    height: TL.line,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  animate={{
                    backgroundColor: active ? TL.runActive : TL.runDone,
                  }}
                  transition={{ backgroundColor: S_DOT }}
                />
                {/* start dot */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: `${b.start}%`,
                    width: TL.dot,
                    height: TL.dot,
                    top: "39%",
                    transform: "translate(-50%,-50%)",
                    zIndex: 12,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    backgroundColor: active ? TL.runActive : TL.runDone,
                  }}
                  transition={{
                    scale: S_DOT,
                    opacity: S_DOT,
                    backgroundColor: S_DOT,
                  }}
                />
                {/* end dot once complete */}
                {complete && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      left: `${b.end}%`,
                      width: TL.dot,
                      height: TL.dot,
                      top: "39%",
                      transform: "translate(-50%,-50%)",
                      zIndex: 12,
                    }}
                    initial={{
                      scale: 0,
                      opacity: 0,
                      backgroundColor: TL.runActive,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      backgroundColor: TL.runDone,
                    }}
                    transition={{
                      scale: S_DOT,
                      opacity: S_DOT,
                      backgroundColor: S_DOT,
                    }}
                  />
                )}
              </div>
            );
          }

          return (
            <div key={`${seg.kind}${i.toString()}`}>
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: `${b.start}%`,
                  width: `${widthPct}%`,
                  height: TL.line,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                animate={{
                  backgroundColor: active ? TL.gapActive : TL.gapDone,
                }}
                transition={{ backgroundColor: S_DOT }}
              />
              {seg.label && complete && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: `${(b.start + b.end) / 2}%`,
                    top: "50%",
                    transform: "translate(-50%,-50%)",
                    zIndex: 15,
                  }}
                >
                  <motion.div
                    className="whitespace-nowrap rounded border border-neutral-700 bg-neutral-900/90 px-2 py-0.5 font-mono text-xs text-neutral-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {seg.label}
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}

        {/* cursor */}
        <motion.div
          className="absolute"
          style={{
            left: `${p}%`,
            width: TL.cursorW,
            height: TL.height,
            top: 0,
            zIndex: 20,
          }}
          animate={{
            backgroundColor: playing && !finished ? TL.cursorOn : TL.cursorOff,
          }}
          transition={{ backgroundColor: { duration: 0.3, ease: "easeInOut" } }}
        />
      </div>

      {code && (
        <CodeLine
          code={code}
          marks={spec.nodes
            .filter((n) => n.token)
            .map((n) => ({
              token: n.token as string,
              state: n.states[Math.min(segIdx, n.states.length - 1)] ?? "idle",
            }))}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// bodies + dispatcher
// ---------------------------------------------------------------------------
function StepBody({
  spec,
  onDeath,
}: {
  spec: Exclude<VizSpec, { archetype: "schedule" | "types" }>;
  /** reports whether any node is dead this step, so the card can go into death mode */
  onDeath?: (dead: boolean) => void;
}) {
  // kit's node/code linkage: the highlight lingers 500ms after mouse-out, so
  // sweeping across nodes reads as one continuous slide rather than a flicker
  const [hovered, setHovered] = useState<string | undefined>();
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hover = (token: string | undefined) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    if (token) {
      setHovered(token);
      return;
    }
    clearTimer.current = setTimeout(() => setHovered(undefined), 500);
  };
  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const len = Math.max(
    2,
    spec.typeStacks?.length ?? 0,
    spec.archetype === "flow"
      ? Math.max(...spec.nodes.map((n) => n.states.length))
      : spec.archetype === "ref"
        ? spec.ref.values.length
        : Math.max(...spec.scope.finalizers.map((f) => f.states.length)),
  );
  const clock = useStepClock(len, spec.intervalMs);

  let body: React.ReactNode;
  switch (spec.archetype) {
    case "flow":
      body = (
        // pt-10 keeps bubbles (error/notification) clear of the controls row
        <div className="flex flex-row flex-wrap items-start gap-6 pt-10">
          {spec.nodes.map((n, i) => (
            <div
              key={`${n.label}#${i.toString()}`}
              className="flex flex-row items-start gap-6"
            >
              {spec.arrowBefore === i && (
                <div className="relative top-[13px] text-neutral-500">
                  <PiArrowRightFill size={24} />
                </div>
              )}
              <NodeWithLabel
                n={n}
                state={n.states[clock.step % n.states.length] ?? "idle"}
                step={clock.step}
                onHover={hover}
              />
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
  }

  // marks for the code line: each token lights up with its owner's state
  const marks: CodeMark[] = [];
  if (spec.code) {
    const at = (states: TaskState[]) =>
      states[clock.step % states.length] ?? "idle";
    if (spec.archetype === "flow") {
      for (const n of spec.nodes)
        if (n.token) marks.push({ token: n.token, state: at(n.states) });
    } else if (spec.archetype === "ref") {
      const r = spec.ref.request;
      if (r?.token) marks.push({ token: r.token, state: at(r.states) });
      const c = spec.ref.challenger;
      if (c?.token) marks.push({ token: c.token, state: at(c.states) });
    } else {
      const n = spec.scope.node;
      if (n?.token) marks.push({ token: n.token, state: at(n.states) });
      for (const f of spec.scope.finalizers) {
        if (!f.token) continue;
        const st = f.states[clock.step % f.states.length] ?? "hidden";
        marks.push({
          token: f.token,
          state:
            st === "running"
              ? "running"
              : st === "completed"
                ? "completed"
                : "idle",
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DeathReporter
        dead={
          spec.archetype === "flow" &&
          spec.nodes.some(
            (n) => n.states[clock.step % n.states.length] === "death",
          )
        }
        onDeath={onDeath}
      />
      <VizControls
        step={clock.step}
        len={len}
        playing={clock.playing}
        toggle={clock.toggle}
        restart={clock.restart}
        goto={clock.goto}
      />
      <div className="min-h-[120px] py-2">{body}</div>
      <InlineTypeStacks
        steps={spec.typeStacks}
        step={clock.step}
        playing={clock.playing}
      />
      {spec.code && (
        <CodeLine code={spec.code} marks={marks} hovered={hovered} />
      )}
    </div>
  );
}

/**
 * The type contract shown underneath a runtime archetype, on the same clock.
 *
 * This is the composition the `types` archetype cannot do on its own: nodes
 * running above, the type that guards them morphing below, one play button, no
 * click required to see both. A steps array shorter than the run holds its last
 * entry, so a contract that changes once does not need padding out.
 */
function InlineTypeStacks({
  steps,
  step,
  playing,
}: {
  steps: TypeStep[] | undefined;
  step: number;
  playing: boolean;
}) {
  if (!steps?.length) return null;
  const active = steps[Math.min(step, steps.length - 1)];
  if (!active) return null;
  return (
    <div className="-mx-6 overflow-hidden border-t border-border/60">
      <TypeStacks
        step={active}
        theme={DEFAULT_TYPE_THEME}
        borderColor={playing ? TYPE_BORDER.active : TYPE_BORDER.inactive}
      />
      {active.note && (
        <Prose
          text={active.note}
          className="px-6 pb-5 text-xs leading-relaxed text-muted-foreground"
        />
      )}
    </div>
  );
}

/**
 * The `types` archetype: kit's type stacks driven by the same clock and the
 * same run button as every other archetype, so a backend item can explain a
 * type-level contract without the page growing a second set of controls.
 *
 * A step's `note` renders under the stacks and its `definition` above them, in
 * place of the flow archetype's code line.
 */
function TypesBody({
  steps,
  spec,
}: {
  steps: TypeStep[];
  spec: Extract<VizSpec, { archetype: "types" }>;
}) {
  const clock = useStepClock(
    Math.max(steps.length, 1),
    spec.intervalMs ?? 2600,
  );
  const active = steps[clock.step % steps.length];
  const borderColor = clock.playing ? TYPE_BORDER.active : TYPE_BORDER.inactive;

  // a step change is the moment worth hearing in a type lesson: it is the only
  // thing that happens. kit plays one wandering pentatonic note per advance.
  useEffect(() => {
    typeSounds.playExampleAdvance();
  }, []);
  const lastStep = useRef(clock.step);
  useEffect(() => {
    if (lastStep.current === clock.step) return;
    lastStep.current = clock.step;
    typeSounds.playExampleAdvance();
    if (clock.step === steps.length - 1) typeSounds.playCompletion();
  }, [clock.step, steps.length]);

  if (!active) return null;

  return (
    <div className="flex flex-col gap-4">
      <VizControls
        step={clock.step}
        len={steps.length}
        playing={clock.playing}
        toggle={clock.toggle}
        restart={clock.restart}
        goto={clock.goto}
      />
      {active.definition && (
        <pre className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/70 p-3 font-mono text-[13px] leading-relaxed text-neutral-300">
          {active.definition}
        </pre>
      )}
      <div className="-mx-6 overflow-hidden">
        <TypeStacks
          step={active}
          theme={DEFAULT_TYPE_THEME}
          borderColor={borderColor}
        />
      </div>
      {active.note && (
        <Prose
          text={active.note}
          className="text-xs leading-relaxed text-muted-foreground"
        />
      )}
    </div>
  );
}

/** lifts the current step's death flag to the card without re-rendering it */
function DeathReporter({
  dead,
  onDeath,
}: {
  dead: boolean;
  onDeath?: (dead: boolean) => void;
}) {
  useEffect(() => {
    onDeath?.(dead);
  }, [dead, onDeath]);
  return null;
}

export function EffectViz({ spec: entry }: { spec: VizEntry }) {
  const hasVariants = "variants" in entry;
  const names = hasVariants ? entry.variants.map((v) => v.name) : [];
  const [selected, setSelected] = useState(names[0] ?? "");
  const active: VizSpec = hasVariants
    ? ((entry.variants.find((v) => v.name === selected) ?? entry.variants[0])
        ?.spec ??
      entry.variants[0]?.spec ??
      ({ archetype: "flow", nodes: [] } as VizSpec))
    : entry;

  const [dead, setDead] = useState(false);
  // A variant switch can move away from the dying spec, and the archetype it
  // moves to may never report at all (only flow has a death state), so the card
  // has to clear itself rather than wait to be told.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the variant switch, not on `dead`
  useEffect(() => setDead(false), [selected]);

  // gate kit's cues on the site sound toggle + prefers-reduced-motion
  const { enabled: soundEnabled } = useSoundSetting();
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setVizSoundsEnabled(soundEnabled && !mql.matches);
      setTypeSoundsEnabled(soundEnabled && !mql.matches);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [soundEnabled]);

  return (
    // kit's death mode: an unrecoverable defect takes the whole card, not just
    // the node. Background goes black-to-blood, the border reddens and a wide
    // red glow spills out, so a defect is unmissable at a glance.
    <motion.div
      className="flex flex-col rounded-2xl border"
      animate={{
        backgroundImage: dead
          ? "linear-gradient(to bottom right, rgb(0,0,0), rgba(127,29,29,0.2))"
          : "linear-gradient(to bottom right, rgba(23,23,23,0.5), rgba(23,23,23,0.2))",
        borderColor: dead ? "rgba(127,29,29,0.5)" : "rgba(64,64,64,0.5)",
        boxShadow: dead
          ? "0 0 40px rgba(220,38,38,0.3)"
          : "0 0 0px rgba(220,38,38,0)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {hasVariants && (
        <div className="flex flex-wrap items-center gap-4 border-b border-border/60 px-6 py-4">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">
            {entry.control}
          </span>
          <VizSegmentedControl
            value={selected}
            options={names}
            onChange={(v) => {
              vizSounds.playConfigurationChange();
              setSelected(v);
            }}
          />
        </div>
      )}
      <div className="flex flex-col gap-4 p-6">
        {active.archetype === "schedule" ? (
          <ScheduleViz
            key={selected}
            spec={active.schedule}
            code={active.code}
          />
        ) : active.archetype === "types" ? (
          <TypesBody key={selected} steps={active.steps} spec={active} />
        ) : (
          <StepBody key={selected} spec={active} onDeath={setDead} />
        )}
        {active.caption && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {active.caption}
          </p>
        )}
      </div>
    </motion.div>
  );
}
