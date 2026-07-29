"use client";

/**
 * Visual Types vocabulary.
 *
 * A port of Kit Langton's types.kitlangton.com stacks, with no chrome of its
 * own. It exports one renderer, TypeStacks, which draws a single step's column
 * of stacks; effect-viz.tsx owns the card, the run button and the clock that
 * advances it. That is what lets a type contract play underneath a flow of task
 * nodes, or stand alone as the `types` archetype, without a second set of
 * controls appearing on the page.
 *
 * The whole illusion rests on one mechanic. A stack renders its type as
 * segments carrying stable ids (src/lib/type-tokens.ts); between steps the
 * segments are diffed by id inside an AnimatePresence, so a token that survives
 * slides while a token that does not blurs out and collapses its width to zero.
 * Nothing is keyed by index, so inserting a union member does not make the rest
 * of the line flicker.
 *
 * Stack kinds: expr (a bare type expression), call (`Name<Arg, Arg>`, optionally
 * with per-member intermediate steps), result (the evaluated type, with a
 * success/error status colour), set (a type's inhabitants as a value set), and
 * subset (the Venn diagram for `A extends B`).
 *
 * Specs live in src/lib/backend-viz.ts, alongside every other archetype.
 * Mechanics reference: docs/types-visualization-guide.md
 */

import {
  AnimatePresence,
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { Fragment, useEffect, useId, useMemo, useRef } from "react";
import { PiArrowDownBold } from "react-icons/pi";
import {
  nodeToSegments,
  segmentsKey,
  type ThemeName,
  TOKEN_THEMES,
  type TypeNode,
  type TypeSegment,
} from "@/lib/type-tokens";

// ---------------------------------------------------------------------------
// shared tokens (exact values from the source)
// ---------------------------------------------------------------------------

/**
 * kit's four springs; every motion in this file uses one of them.
 *
 * `smooth` is slower than his 0.4. His lessons are keyboard-stepped, so each
 * morph is something you asked for and 0.4s reads as responsive. Ours run on a
 * loop, where the same speed reads as a flicker you have to catch. The exit is
 * kept a little under the enter so tokens clear out before their replacements
 * finish arriving.
 */
const SPRINGS = {
  fast: { type: "spring" as const, visualDuration: 0.2, bounce: 0 },
  default: { type: "spring" as const, visualDuration: 0.3, bounce: 0 },
  smooth: { type: "spring" as const, visualDuration: 0.75, bounce: 0 },
  bouncy: { type: "spring" as const, visualDuration: 0.3, bounce: 0.3 },
};

/** how a segment leaves; slower than kit's 0.2 for the same reason */
const SEGMENT_EXIT = {
  type: "spring" as const,
  visualDuration: 0.45,
  bounce: 0,
};

/** the whole site is two greys: a lit border and an unlit one */
const BORDER = { active: "#333333", inactive: "#222222" };

/** result-box status palette */
const STATUS = {
  neutral: { backgroundColor: "rgb(10,10,10)" },
  success: {
    backgroundColor: "rgb(12,29,18)",
    borderColor: "rgba(34,197,94,0.35)",
  },
  error: {
    backgroundColor: "rgb(34,20,20)",
    borderColor: "rgba(248,113,113,0.35)",
  },
} as const;

export type StackStatus = keyof typeof STATUS;

/**
 * kit's `pattern-dots-fine`: a 12px tile with a 2px square. Inlined as a data
 * URI so the viz needs no asset and no network round trip.
 */
const DOT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='2' height='2' fill='rgba(51,51,51,0.4)'/%3E%3C/svg%3E\")";

// ---------------------------------------------------------------------------
// spec types
// ---------------------------------------------------------------------------

/** one `Name<Arg>` -> `result` pair rendered small, under a parent call */
export interface IntermediateStep {
  call: { name: string; args: TypeNode[] };
  result: TypeNode;
}

/** what a result box shows instead of a type: a compiler message */
export interface ResultDisplay {
  message: string;
  status?: StackStatus;
}

export type StackSpec =
  | { kind: "expr"; expression: TypeNode; label?: string; ghost?: boolean }
  | {
      kind: "call";
      name: string;
      args: TypeNode[];
      intermediateSteps?: IntermediateStep[];
      label?: string;
      ghost?: boolean;
    }
  | {
      kind: "result";
      result?: TypeNode;
      display?: ResultDisplay;
      label?: string;
      ghost?: boolean;
    }
  | { kind: "set"; values: TypeNode; label?: string; ghost?: boolean }
  /** radii come from the type names via SUBSET_RADII, so no size is declared */
  | {
      kind: "subset";
      leftType: string;
      rightType: string;
      result: boolean;
      label?: string;
      ghost?: boolean;
    };

/** one step of a lesson: the stacks to show, and the arrows between them */
export interface TypeStep {
  stacks: StackSpec[];
  /** transitions[i] labels the arrow between stack i and stack i+1 */
  transitions?: { label?: string }[];
  /** a TS snippet shown above the stacks for this step */
  definition?: string;
  /** prose shown under the stacks, explaining this step specifically */
  note?: string;
}

// ---------------------------------------------------------------------------
// primitive: morphing segments (kit's TypeSegments)
// ---------------------------------------------------------------------------

/**
 * The core mechanic. Segments are diffed by id: survivors are untouched (so
 * they slide as their neighbours resize), entrants animate width 0 -> auto
 * while un-blurring, and leavers collapse back to zero width.
 *
 * `mode="sync"` matters: entering and leaving segments must animate at the same
 * time, or the line would jump as it re-flows.
 */
export function MorphingSegments({
  segments,
  className = "",
  decorate,
}: {
  segments: TypeSegment[];
  className?: string;
  /**
   * Per-segment overrides, so a caller can tint a run of segments without
   * wrapping them in an element (a wrapper would break the AnimatePresence
   * keying that the whole morph depends on). Used by the code line to light the
   * tokens belonging to a running node.
   */
  decorate?: (segment: TypeSegment) =>
    | {
        backgroundColor?: string;
        color?: string;
        mark?: string;
      }
    | undefined;
}) {
  return (
    <div className="relative inline-flex flex-wrap items-center">
      <div className={`inline-flex flex-wrap items-center ${className}`}>
        <AnimatePresence mode="sync" initial={false}>
          {segments.map((segment) => {
            const extra = decorate?.(segment);
            return (
              <motion.span
                key={segment.id}
                data-mark={extra?.mark}
                initial={{ filter: "blur(4px)", width: 0 }}
                animate={{
                  filter: "blur(0px)",
                  width: "auto",
                  transition: SPRINGS.smooth,
                }}
                exit={{
                  filter: "blur(4px)",
                  width: 0,
                  transition: SEGMENT_EXIT,
                }}
                className={
                  segment.isEllipsis
                    ? "inline-flex items-center"
                    : "whitespace-pre-wrap sm:whitespace-pre"
                }
                style={{
                  overflow: "hidden",
                  color: extra?.color ?? segment.color,
                  backgroundColor: extra?.backgroundColor,
                  transition: extra
                    ? "background-color 400ms, color 400ms"
                    : undefined,
                  opacity: segment.isEllipsis ? 0.7 : 1,
                  willChange: "opacity, filter",
                  backfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {segment.content}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// primitive: the flash box (kit's FlashOnChange)
// ---------------------------------------------------------------------------

/**
 * Wraps a stack and flicks a near-invisible white wash across it whenever its
 * contents change: up to 5% opacity in 50ms, then 1.5s of linear fade. It reads
 * as the box acknowledging the change rather than as a highlight.
 */
function FlashBox({
  triggerKey,
  className = "",
  style,
  children,
  flashOpacity = 0.05,
}: {
  triggerKey: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  flashOpacity?: number;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastKey = useRef(triggerKey);

  useEffect(() => {
    if (lastKey.current === triggerKey) return;
    lastKey.current = triggerKey;
    const node = overlayRef.current;
    if (!node) return;
    const flashMs = 50;
    const fadeMs = 1500;
    const total = flashMs + fadeMs;
    const controls = animate(
      node,
      { opacity: [0, flashOpacity, 0] },
      {
        duration: total / 1000,
        times: [0, flashMs / total, 1],
        ease: "linear",
      },
    );
    return () => controls.stop();
  }, [triggerKey, flashOpacity]);

  return (
    <motion.div className={`relative ${className}`} style={style}>
      {children}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0,
          backgroundColor: "rgba(255,255,255,1)",
          borderRadius: "inherit",
          willChange: "opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// primitive: stack boxes
// ---------------------------------------------------------------------------

const BOX =
  "flex flex-wrap items-center justify-center gap-1 border px-5 py-4 bg-neutral-950";
const MONO = "font-mono text-sm sm:text-base md:text-lg";

function SegmentBox({
  segments,
  borderColor,
  ghost,
  status = "neutral",
}: {
  segments: TypeSegment[];
  borderColor: string;
  ghost?: boolean;
  status?: StackStatus;
}) {
  const key = useMemo(() => segmentsKey(segments), [segments]);
  const palette = STATUS[status];
  return (
    <FlashBox
      triggerKey={key}
      className={`${BOX} ${ghost ? "border-dashed" : ""}`}
      style={{
        borderColor:
          "borderColor" in palette ? palette.borderColor : borderColor,
        backgroundColor: palette.backgroundColor,
        transition: "background-color 400ms ease, border-color 400ms ease",
      }}
    >
      <MorphingSegments segments={segments} className={MONO} />
    </FlashBox>
  );
}

/** `Name<Arg, Arg>` assembled from the call's name plus its argument segments */
function useCallSegments(
  name: string,
  args: TypeNode[],
  theme: (typeof TOKEN_THEMES)[ThemeName],
  stackId: string,
): TypeSegment[] {
  return useMemo(() => {
    const argSegments = args.map((arg, i) =>
      nodeToSegments(arg, theme, `${stackId}-call-arg-${i}`),
    );
    const out: TypeSegment[] = [];
    // an unnamed call is a bare expression: no angle brackets
    const bracketed = argSegments.length > 0 && name !== "";
    if (name) {
      out.push({ id: "type-call-name", content: name, color: theme.typeName });
    }
    if (bracketed) {
      out.push({
        id: "type-call-angle-open",
        content: "<",
        color: theme.punctuation,
      });
    }
    argSegments.forEach((segments, i) => {
      if (i > 0) {
        out.push({
          id: `type-call-comma-${i}`,
          content: ", ",
          color: theme.punctuation,
        });
      }
      out.push(...segments);
    });
    if (bracketed) {
      out.push({
        id: "type-call-angle-close",
        content: ">",
        color: theme.punctuation,
      });
    }
    return out;
  }, [name, args, theme, stackId]);
}

/** the small `->` between a call and its per-member expansions */
function InlineArrow() {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <PiArrowDownBold
        size={20}
        style={{ opacity: 0.7 }}
        className="text-neutral-600"
      />
    </div>
  );
}

/**
 * Distributive conditionals evaluate member by member. Kit shows that as a
 * column of muted mini call/result rows under the parent call, which is what
 * makes `("cat" | 42) extends string` legible as two independent checks.
 */
function IntermediateSteps({
  steps,
  theme,
  borderColor,
  stackId,
}: {
  steps: IntermediateStep[];
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {steps.map((step, i) => (
        <IntermediateRow
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed per-step expansion list
          key={i}
          step={step}
          theme={theme}
          borderColor={borderColor}
          stackId={`${stackId}-inter-${i}`}
        />
      ))}
    </div>
  );
}

function IntermediateRow({
  step,
  theme,
  borderColor,
  stackId,
}: {
  step: IntermediateStep;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  const call = useCallSegments(step.call.name, step.call.args, theme, stackId);
  const result = useMemo(
    () => nodeToSegments(step.result, theme, `${stackId}-result`),
    [step.result, theme, stackId],
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div
        className="flex items-center border px-3 py-2 opacity-80"
        style={{ borderColor, backgroundColor: "rgb(10,10,10)" }}
      >
        <MorphingSegments
          segments={call}
          className="font-mono text-xs sm:text-sm"
        />
      </div>
      <PiArrowDownBold
        size={14}
        className="-rotate-90 text-neutral-600"
        aria-hidden="true"
      />
      <div
        className="flex items-center border px-3 py-2"
        style={{ borderColor, backgroundColor: "rgb(10,10,10)" }}
      >
        <MorphingSegments
          segments={result}
          className="font-mono text-xs sm:text-sm"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// primitive: the subset diagram (kit's SubsetDiagram)
// ---------------------------------------------------------------------------

/**
 * Radii are a hand-tuned lookup, not a function of set cardinality. Most of
 * these sets are infinite, so there is nothing to compute; the numbers are
 * chosen so the containments read at a glance and `never` is a visible dot.
 * Anything unlisted falls back to 50.
 */
const SUBSET_RADII: Record<string, number> = {
  never: 1,
  true: 35,
  false: 35,
  boolean: 74,
  '"on"': 36,
  '"off"': 36,
  '"on" | "off"': 83,
  '"north" | "south"': 49,
  '"north" | "south" | "east" | "west"': 90,
  '"kit"': 35,
  string: 86,
  any: 130,
  '"red" | "green"': 65,
  '"green" | "blue"': 65,
  'false | "maybe"': 60,
  '"maybe" | true': 60,
};

const radiusFor = (type: string) => SUBSET_RADII[type] ?? 50;

type Relationship =
  | "perfectOverlap"
  | "leftContainsRight"
  | "rightContainsLeft"
  | "disjoint"
  | "partialOverlap";

/** the shape of the diagram is inferred from the radii, not declared per step */
function relationshipOf(
  leftType: string,
  rightType: string,
  leftR: number,
  rightR: number,
): Relationship {
  const diff = Math.abs(leftR - rightR);
  if (diff < 1 && leftType === rightType) return "perfectOverlap";
  if (diff > 10)
    return leftR > rightR ? "leftContainsRight" : "rightContainsLeft";
  // same-size but different types: only true/false are genuinely disjoint
  if (
    (leftType === "true" && rightType === "false") ||
    (leftType === "false" && rightType === "true")
  ) {
    return "disjoint";
  }
  return "partialOverlap";
}

interface Placement {
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
}

/** centres for both shapes plus the point each one's label flies out to */
function placements(
  relationship: Relationship,
  leftR: number,
  rightR: number,
  centerX = 100,
  centerY = 100,
): { left: Placement; right: Placement } {
  if (relationship === "disjoint") {
    const total = leftR + rightR + 10;
    const a = centerX - total / 2;
    const b = centerX + total / 2;
    const reach = leftR + 100;
    return {
      left: { cx: a, cy: centerY, labelX: a - reach, labelY: centerY },
      right: { cx: b, cy: centerY, labelX: b + reach, labelY: centerY },
    };
  }
  if (relationship === "partialOverlap") {
    const offset = Math.max(leftR, rightR) * 0.6;
    const reach = Math.max(leftR, rightR) + 100;
    return {
      left: {
        cx: centerX - offset,
        cy: centerY,
        labelX: centerX - offset - reach,
        labelY: centerY,
      },
      right: {
        cx: centerX + offset,
        cy: centerY,
        labelX: centerX + offset + reach,
        labelY: centerY,
      },
    };
  }
  // containment and perfect overlap are both concentric
  const reach = Math.max(leftR, rightR) + 100;
  return {
    left: {
      cx: centerX,
      cy: centerY,
      labelX: centerX - reach,
      labelY: centerY,
    },
    right: {
      cx: centerX,
      cy: centerY,
      labelX: centerX + reach,
      labelY: centerY,
    },
  };
}

/** the containing shape is painted first so the contained one sits on top */
const drawOrder = (relationship: Relationship): ("left" | "right")[] =>
  relationship === "leftContainsRight" ? ["left", "right"] : ["right", "left"];

/** a leader line that starts on the shape's edge, not at its centre */
function edgeLine(
  cx: number,
  cy: number,
  r: number,
  toX: number,
  toY: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = toX - cx;
  const dy = toY - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 0.01) return { x1: cx, y1: cy, x2: toX, y2: toY };
  return {
    x1: cx + (r * dx) / distance,
    y1: cy + (r * dy) / distance,
    x2: toX,
    y2: toY,
  };
}

/** distance below which two centres count as coincident */
const COINCIDENT = 5;
/** slack when deciding two shapes have stopped touching */
const TOUCH_SLACK = 2;
/** stand-in for an unbounded mask radius */
const UNBOUNDED = 9999;

/**
 * `A extends B` drawn as sets.
 *
 * Both shapes are rounded rects rather than circles, which is what lets `any`
 * animate its corner radius to 0 and become a square: the universal set reads
 * as the box everything else sits inside, not as one more circle. Their overlap
 * is hatched, green when the relation holds and red when it does not, via a
 * circle masked by the other shape.
 *
 * Labels live outside the frame on leader lines drawn from each shape's edge,
 * so a 130-radius `any` does not have to fit its name inside itself.
 */
function SubsetDiagram({
  spec,
  theme,
  borderColor,
}: {
  spec: Extract<StackSpec, { kind: "subset" }>;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
}) {
  const { leftType, rightType, result } = spec;
  const maskId = `${useId()}-intersection`;
  const hatchId = `${useId()}-hatch`;

  const leftR = radiusFor(leftType);
  const rightR = radiusFor(rightType);
  const relationship = relationshipOf(leftType, rightType, leftR, rightR);
  const { left, right } = placements(relationship, leftR, rightR);
  // `any` squares off; every other type keeps a corner radius equal to its own
  const leftCorner = leftType === "any" ? 0 : leftR;
  const rightCorner = rightType === "any" ? 0 : rightR;

  const headline = useMemo(() => {
    const a = nodeToSegments(
      { kind: "raw", value: leftType },
      theme,
      "extends-left",
    );
    const b = nodeToSegments(
      { kind: "raw", value: rightType },
      theme,
      "extends-right",
    );
    return [
      ...a,
      { id: "extends-kw", content: " extends ", color: theme.typeKeyword },
      ...b,
    ];
  }, [leftType, rightType, theme]);
  const leftLabel = useMemo(
    () => nodeToSegments({ kind: "raw", value: leftType }, theme, "left-label"),
    [leftType, theme],
  );
  const rightLabel = useMemo(
    () =>
      nodeToSegments({ kind: "raw", value: rightType }, theme, "right-label"),
    [rightType, theme],
  );

  // every geometric quantity is a spring, so the shapes travel between
  // relationships instead of cutting
  const lr = useMotionValue(leftR);
  const lcx = useMotionValue(left.cx);
  const lcy = useMotionValue(left.cy);
  const lcorner = useMotionValue(leftCorner);
  const llx = useMotionValue(left.labelX);
  const lly = useMotionValue(left.labelY);
  const rr = useMotionValue(rightR);
  const rcx = useMotionValue(right.cx);
  const rcy = useMotionValue(right.cy);
  const rcorner = useMotionValue(rightCorner);
  const rlx = useMotionValue(right.labelX);
  const rly = useMotionValue(right.labelY);
  const truth = useMotionValue(result ? 1 : 0);

  useEffect(() => {
    const pairs: [typeof lr, number][] = [
      [lr, leftR],
      [lcx, left.cx],
      [lcy, left.cy],
      [lcorner, leftCorner],
      [llx, left.labelX],
      [lly, left.labelY],
      [rr, rightR],
      [rcx, right.cx],
      [rcy, right.cy],
      [rcorner, rightCorner],
      [rlx, right.labelX],
      [rly, right.labelY],
      [truth, result ? 1 : 0],
    ];
    const running = pairs.map(([value, to]) =>
      animate(value, to, SPRINGS.bouncy),
    );
    return () => {
      for (const controls of running) controls.stop();
    };
  }, [
    leftR,
    rightR,
    leftCorner,
    rightCorner,
    left,
    right,
    result,
    lr,
    lcx,
    lcy,
    lcorner,
    llx,
    lly,
    rr,
    rcx,
    rcy,
    rcorner,
    rlx,
    rly,
    truth,
  ]);

  // red when the relation fails, green when it holds; the whole diagram tints
  const tint = useTransform(truth, [0, 1], ["#ef4444", "#22c55e"]);

  const leftRect = useRoundedRect(lcx, lcy, lr, lcorner);
  const rightRect = useRoundedRect(rcx, rcy, rr, rcorner);
  const leftLine = useLeaderLine(lcx, lcy, lr, llx, lly);
  const rightLine = useLeaderLine(rcx, rcy, rr, rlx, rly);
  const shapes = { left: leftRect, right: rightRect };
  const lines = { left: leftLine, right: rightLine };

  // the hatched overlap: a circle sized to the intersection, masked by the
  // other shape. Coincident centres mean one fully contains the other, so the
  // hatch becomes the smaller shape entirely; separated centres mean no overlap
  const hatchR = useTransform(
    [lr, rr, lcx, lcy, rcx, rcy],
    ([a, b, ax, ay, bx, by]: number[]) => {
      const gap = Math.hypot((ax ?? 0) - (bx ?? 0), (ay ?? 0) - (by ?? 0));
      if (gap < COINCIDENT) return Math.max(0, Math.min(a ?? 0, b ?? 0));
      if (gap > (a ?? 0) + (b ?? 0) - TOUCH_SLACK) return 0;
      return Math.max(0, a ?? 0);
    },
  );
  const hatchCx = useTransform(
    [lcx, lcy, rcx, rcy],
    ([ax, ay, bx, by]: number[]) =>
      Math.hypot((ax ?? 0) - (bx ?? 0), (ay ?? 0) - (by ?? 0)) < COINCIDENT
        ? ((ax ?? 0) + (bx ?? 0)) / 2
        : (ax ?? 0),
  );
  const hatchCy = useTransform(
    [lcx, lcy, rcx, rcy],
    ([ax, ay, bx, by]: number[]) =>
      Math.hypot((ax ?? 0) - (bx ?? 0), (ay ?? 0) - (by ?? 0)) < COINCIDENT
        ? ((ay ?? 0) + (by ?? 0)) / 2
        : (ay ?? 0),
  );
  const maskR = useTransform(
    [lr, rr, lcx, lcy, rcx, rcy],
    ([a, b, ax, ay, bx, by]: number[]) => {
      const gap = Math.hypot((ax ?? 0) - (bx ?? 0), (ay ?? 0) - (by ?? 0));
      if (gap < COINCIDENT) return UNBOUNDED;
      if (gap > (a ?? 0) + (b ?? 0) - TOUCH_SLACK) return 0;
      return Math.max(0, b ?? 0);
    },
  );

  const labelX = useTransform(llx, (v) => v - 200);
  const labelY = useTransform(lly, (v) => v - 20);
  const rightLabelX = useTransform(rlx, (v) => v - 200);
  const rightLabelY = useTransform(rly, (v) => v - 20);

  return (
    <div className="flex w-full flex-col items-center">
      <SegmentBox segments={headline} borderColor={borderColor} />
      <StackArrow />
      <FlashBox
        triggerKey={`${leftType}-${rightType}-${result}`}
        className="relative border bg-neutral-950 p-8"
        style={{ borderColor }}
        flashOpacity={0.03}
      >
        {/* the universe: everything drawn sits inside this frame */}
        <div
          className="pointer-events-none absolute inset-1 z-0 border border-dashed opacity-50"
          style={{ borderColor: "#666666" }}
        />
        <div
          className="relative z-10 flex flex-col items-center"
          style={{ width: 200, height: 200 }}
        >
          <svg
            width={200}
            height={200}
            viewBox="0 0 200 200"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={`${leftType} extends ${rightType} is ${result}`}
          >
            <title>{`${leftType} extends ${rightType}`}</title>
            <defs>
              <pattern
                id={hatchId}
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="8"
                  stroke={result ? "#22c55e" : "#ef4444"}
                  strokeWidth="1.5"
                  opacity={0.4}
                />
              </pattern>
              <mask id={maskId}>
                <motion.circle fill="white" r={maskR} cx={rcx} cy={rcy} />
              </mask>
            </defs>
            {drawOrder(relationship).map((side) => (
              <Fragment key={side}>
                <motion.rect
                  fill={tint}
                  fillOpacity={0.2}
                  stroke={tint}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  style={shapes[side]}
                />
                <motion.line
                  stroke={tint}
                  strokeWidth={1}
                  strokeOpacity={0.5}
                  x1={lines[side].x1}
                  y1={lines[side].y1}
                  x2={lines[side].x2}
                  y2={lines[side].y2}
                />
              </Fragment>
            ))}
            <motion.circle
              fill={`url(#${hatchId})`}
              mask={`url(#${maskId})`}
              pointerEvents="none"
              r={hatchR}
              cx={hatchCx}
              cy={hatchCy}
            />
          </svg>
          <div className="absolute inset-0 overflow-visible">
            <SubsetLabel segments={leftLabel} x={labelX} y={labelY} />
            <SubsetLabel
              segments={rightLabel}
              x={rightLabelX}
              y={rightLabelY}
            />
          </div>
        </div>
      </FlashBox>
    </div>
  );
}

/** a shape is a 2r square with a corner radius; radius r gives a circle, 0 a box */
function useRoundedRect(
  cx: MotionValue<number>,
  cy: MotionValue<number>,
  r: MotionValue<number>,
  corner: MotionValue<number>,
) {
  return {
    x: useTransform(
      [cx, r],
      ([c, radius]: number[]) => (c ?? 0) - (radius ?? 0),
    ),
    y: useTransform(
      [cy, r],
      ([c, radius]: number[]) => (c ?? 0) - (radius ?? 0),
    ),
    width: useTransform(r, (v) => Math.max(0, v * 2)),
    height: useTransform(r, (v) => Math.max(0, v * 2)),
    rx: useTransform(corner, (v) => Math.max(0, v)),
    ry: useTransform(corner, (v) => Math.max(0, v)),
  };
}

function useLeaderLine(
  cx: MotionValue<number>,
  cy: MotionValue<number>,
  r: MotionValue<number>,
  toX: MotionValue<number>,
  toY: MotionValue<number>,
) {
  const inputs = [cx, cy, r, toX, toY];
  const line = ([a, b, radius, tx, ty]: number[]) =>
    edgeLine(a ?? 0, b ?? 0, radius ?? 0, tx ?? 0, ty ?? 0);
  return {
    x1: useTransform(inputs, (v: number[]) => line(v).x1),
    y1: useTransform(inputs, (v: number[]) => line(v).y1),
    x2: useTransform(inputs, (v: number[]) => line(v).x2),
    y2: useTransform(inputs, (v: number[]) => line(v).y2),
  };
}

/**
 * Labels are 400px-wide centred boxes parked at the end of their leader line,
 * so the text stays centred on the anchor however long the type name is.
 */
function SubsetLabel({
  segments,
  x,
  y,
}: {
  segments: TypeSegment[];
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute flex items-center justify-center"
      style={{ width: 400, height: 40, x, y, left: 0, top: 0, zIndex: 1000 }}
    >
      <div className="pointer-events-none flex h-full items-center justify-center">
        <div className="pointer-events-auto border border-neutral-600 bg-neutral-950 px-2">
          <MorphingSegments
            segments={segments}
            className="whitespace-nowrap font-mono text-sm"
          />
        </div>
      </div>
    </motion.div>
  );
}

function Stack({
  spec,
  theme,
  borderColor,
  stackId,
}: {
  spec: StackSpec;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  const body = <StackBody {...{ spec, theme, borderColor, stackId }} />;
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {spec.label && (
        <div className="text-[11px] uppercase tracking-wide text-neutral-500">
          {spec.label}
        </div>
      )}
      {body}
    </div>
  );
}

function StackBody({
  spec,
  theme,
  borderColor,
  stackId,
}: {
  spec: StackSpec;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  if (spec.kind === "subset") {
    return (
      <SubsetDiagram spec={spec} theme={theme} borderColor={borderColor} />
    );
  }
  if (spec.kind === "call") {
    return (
      <CallStack
        spec={spec}
        theme={theme}
        borderColor={borderColor}
        stackId={stackId}
      />
    );
  }
  if (spec.kind === "result") {
    return (
      <ResultStack
        spec={spec}
        theme={theme}
        borderColor={borderColor}
        stackId={stackId}
      />
    );
  }
  const node = spec.kind === "set" ? spec.values : spec.expression;
  return (
    <PlainStack
      node={node}
      ghost={spec.ghost}
      theme={theme}
      borderColor={borderColor}
      stackId={stackId}
    />
  );
}

function PlainStack({
  node,
  ghost,
  theme,
  borderColor,
  stackId,
}: {
  node: TypeNode;
  ghost?: boolean;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  const segments = useMemo(
    () => nodeToSegments(node, theme, `${stackId}-expr`),
    [node, theme, stackId],
  );
  return (
    <div className="flex w-full justify-center">
      <SegmentBox segments={segments} borderColor={borderColor} ghost={ghost} />
    </div>
  );
}

function CallStack({
  spec,
  theme,
  borderColor,
  stackId,
}: {
  spec: Extract<StackSpec, { kind: "call" }>;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  const segments = useCallSegments(spec.name, spec.args, theme, stackId);
  const hasSteps = Boolean(spec.intermediateSteps?.length);
  return (
    <div className="flex w-full flex-col gap-0">
      <div className="flex w-full justify-center">
        <SegmentBox
          segments={segments}
          borderColor={borderColor}
          ghost={spec.ghost}
        />
      </div>
      {hasSteps && (
        <>
          <div className="flex justify-center">
            <InlineArrow />
          </div>
          <IntermediateSteps
            steps={spec.intermediateSteps ?? []}
            theme={theme}
            borderColor={borderColor}
            stackId={stackId}
          />
        </>
      )}
    </div>
  );
}

function ResultStack({
  spec,
  theme,
  borderColor,
  stackId,
}: {
  spec: Extract<StackSpec, { kind: "result" }>;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
  stackId: string;
}) {
  // a display message replaces the type entirely: the compiler spoke instead
  const segments = useMemo<TypeSegment[]>(() => {
    if (spec.display) {
      return [
        {
          id: `${stackId}-display-${spec.display.status ?? "neutral"}-${spec.display.message}`,
          content: spec.display.message,
          color: "inherit",
        },
      ];
    }
    return spec.result
      ? nodeToSegments(spec.result, theme, `${stackId}-result`)
      : [];
  }, [spec.display, spec.result, theme, stackId]);

  return (
    <div className="flex w-full justify-center">
      <SegmentBox
        segments={segments}
        borderColor={borderColor}
        ghost={spec.ghost}
        status={spec.display?.status ?? "neutral"}
      />
    </div>
  );
}

/** the arrow between two stacks, with an optional transition label */
function StackArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <PiArrowDownBold
        size={24}
        className="text-neutral-500"
        aria-hidden="true"
      />
      {label && (
        <span className="text-[11px] uppercase tracking-wide text-neutral-500">
          {label}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// prose
// ---------------------------------------------------------------------------

/**
 * The explainers are written with `code` spans and **bold**, so they need the
 * two-rule subset of markdown that actually appears in them. A full parser
 * would be a dependency for something a split can do.
 */
export function Prose({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const parts = useMemo(
    () => text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g),
    [text],
  );
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              // biome-ignore lint/suspicious/noArrayIndexKey: static split of a fixed string
              key={i}
              className="rounded bg-neutral-800/70 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static split of a fixed string
            <strong key={i} className="font-semibold text-neutral-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static split of a fixed string
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      })}
    </p>
  );
}

/**
 * The TS snippet above the stacks. Definitions are statements (`const x = 5`,
 * `type Pair<T> = [T, T]`), not type expressions, so they go through the site's
 * shiki highlighter rather than the segmenter, which only knows how to lay out
 * types and would mis-space an assignment. The HTML is produced server-side and
 * handed down; without it we still render the raw snippet.
 */
export function TypeStacks({
  step,
  theme,
  borderColor,
}: {
  step: TypeStep;
  theme: (typeof TOKEN_THEMES)[ThemeName];
  borderColor: string;
}) {
  return (
    <div
      className="px-6 py-8"
      style={{ backgroundImage: DOT_PATTERN, backgroundSize: "12px 12px" }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-0">
        {step.stacks.map((spec, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stacks are positional within a step
          <div key={i} className="flex flex-col items-stretch">
            <Stack
              spec={spec}
              theme={theme}
              borderColor={borderColor}
              stackId={`stack-${i}`}
            />
            {i < step.stacks.length - 1 && (
              <div className="flex justify-center">
                <StackArrow label={step.transitions?.[i]?.label} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A type attached to a single task node, drawn small enough to sit in the
 * node's own column rather than in a diagram of its own.
 *
 * This is what makes the two vocabularies one picture instead of two stacked
 * ones: the box is the runtime value, the badge under it is the type that value
 * is travelling under, and both are driven by the same node's state. The badge
 * borrows the node's state colour, so when the node runs the type lights blue
 * with it and when it completes they go green together.
 */
export function TypeBadge({
  node,
  id,
  theme = DEFAULT_TYPE_THEME,
  accent,
}: {
  node: TypeNode;
  /** stable per-node prefix, so two nodes showing `string` still morph apart */
  id: string;
  theme?: (typeof TOKEN_THEMES)[ThemeName];
  /** the owning node's state colour */
  accent: string;
}) {
  const segments = useMemo(
    () => nodeToSegments(node, theme, `badge-${id}`),
    [node, theme, id],
  );
  const key = useMemo(() => segmentsKey(segments), [segments]);
  return (
    <FlashBox
      triggerKey={key}
      className="mt-2 flex items-center justify-center border px-2.5 py-1"
      style={{
        borderColor: accent,
        backgroundColor: "rgb(10,10,10)",
        transition: "border-color 300ms ease",
      }}
    >
      <MorphingSegments
        segments={segments}
        className="font-mono text-[11px] leading-none"
      />
    </FlashBox>
  );
}

/** the default theme, for callers that do not pick one */
export const DEFAULT_TYPE_THEME = TOKEN_THEMES["github-dark"];
export const TYPE_BORDER = BORDER;
