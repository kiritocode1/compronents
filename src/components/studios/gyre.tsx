"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import Gyre, {
  GYRE_DEFAULTS,
  type GyreAppearance,
  type GyreValues,
} from "@/registry/gyre";
import { SceneStudioShell } from "./scene-studio-shell";

type NumberKey = {
  [K in keyof GyreValues]: GyreValues[K] extends number ? K : never;
}[keyof GyreValues];
type ColorKey =
  | "c1"
  | "c2"
  | "c3"
  | "c4"
  | "c5"
  | "c6"
  | "c7"
  | "glintColor"
  | "ground";

type Knob =
  | {
      type: "float";
      key: NumberKey;
      label: string;
      min: number;
      max: number;
      step: number;
    }
  | { type: "text"; key: "text" | "sep"; label: string; max: number }
  | { type: "color"; key: ColorKey; label: string }
  | { type: "appearance" };

const float = (
  key: NumberKey,
  label: string,
  min: number,
  max: number,
  step: number,
): Knob => ({ type: "float", key, label, min, max, step });
const color = (key: ColorKey, label: string): Knob => ({
  type: "color",
  key,
  label,
});

/** The source's knob table: same groups, labels, ranges and steps. */
const GROUPS: { label: string; knobs: Knob[] }[] = [
  {
    label: "Words",
    knobs: [
      { type: "text", key: "text", label: "Words", max: 60 },
      { type: "text", key: "sep", label: "Between", max: 4 },
      float("tracking", "Letter spacing", -0.1, 0.4, 0.01),
      float("wordGap", "Word spacing", 0.1, 1.5, 0.05),
    ],
  },
  {
    label: "Type",
    knobs: [
      float("size", "Letter size", 0.05, 0.22, 0.005),
      float("extrude", "Depth", 0.05, 1.2, 0.05),
      float("bevel", "Bevel", 0, 0.12, 0.005),
    ],
  },
  {
    label: "Rings",
    knobs: [
      float("margin", "Edge room (px)", 0, 80, 1),
      float("corner", "Corner", 0.1, 3, 0.05),
      float("turnGap", "Gap between rings", 0.05, 1.5, 0.05),
      float("turns", "Rings", 2, 12, 0.5),
      float("fogStart", "Fade from", 0, 8, 0.1),
      float("fogEnd", "Gone at", 1, 12, 0.1),
    ],
  },
  {
    label: "Motion",
    knobs: [
      float("speed", "Speed (letters/s)", -3, 3, 0.05),
      float("push", "Wheel push", 0, 4, 0.1),
    ],
  },
  {
    label: "Camera",
    knobs: [
      float("fov", "Lens", 20, 90, 1),
      float("parallax", "Follow the hand", 0, 1.5, 0.05),
      float("resizeLag", "Resize delay (s)", 0, 1, 0.05),
    ],
  },
  {
    label: "Foil",
    knobs: [
      color("c1", "Foil 1"),
      color("c2", "Foil 2"),
      color("c3", "Foil 3"),
      color("c4", "Foil 4"),
      color("c5", "Foil 5"),
      color("c6", "Foil 6"),
      color("c7", "Foil 7"),
      float("sat", "Colour strength", 0, 3, 0.05),
      float("spread", "Colour spread", 0, 3, 0.05),
      float("letterHue", "Across a letter", 0, 1.5, 0.05),
      float("film", "Shift with angle", 0, 2, 0.05),
      float("drift", "Colour drift", 0, 0.3, 0.005),
      float("sideShade", "Sides", 0.2, 1.2, 0.02),
      float("sideShift", "Side colour", 0, 1, 0.02),
      float("pale", "Pale face", 0, 1, 0.02),
    ],
  },
  {
    label: "Light",
    knobs: [
      float("gloss", "Gloss", 0, 2, 0.05),
      float("glint", "Glints", 0, 4, 0.05),
      color("glintColor", "Glint"),
      float("glow", "Glow", 0, 2, 0.05),
      float("grain", "Grain", 0, 0.25, 0.005),
    ],
  },
  {
    label: "Ground",
    knobs: [{ type: "appearance" }, color("ground", "Ground")],
  },
];

const APPEARANCES: { id: GyreAppearance; label: string }[] = [
  { id: "auto", label: "Follow the page" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

/** The source studio's frame sizes. A size larger than the stage shrinks to fit. */
const FRAMES = [
  { label: "Phone", w: 390, h: 760 },
  { label: "Square", w: 560, h: 560 },
  { label: "Tablet", w: 820, h: 560 },
  { label: "Wide", w: 1200, h: 680 },
  { label: "Fill", w: 0, h: 0 },
] as const;
type FrameLabel = (typeof FRAMES)[number]["label"];
type Size = { w: number; h: number };

/** Sides and corners of the frame, as in the source studio. */
const HANDLES = ["l", "r", "t", "b", "tl", "tr", "bl", "br"] as const;
type Handle = (typeof HANDLES)[number];
/** Room kept around the frame for the handles, and the smallest frame. */
const ROOM = 56;
const MIN = 160;

function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T | null;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:col-span-2 lg:col-span-3">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
          className={`h-10 rounded-md px-3 text-xs transition-colors ${
            o.id === value
              ? "bg-foreground text-background"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Hit area for one handle, straddling the frame edge. */
function hitStyle(h: Handle): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    zIndex: 3,
    touchAction: "none",
  };
  if (h === "l" || h === "r")
    return {
      ...base,
      top: 26,
      bottom: 26,
      width: 18,
      [h === "l" ? "left" : "right"]: -16,
      cursor: "ew-resize",
    };
  if (h === "t" || h === "b")
    return {
      ...base,
      left: 26,
      right: 26,
      height: 18,
      [h === "t" ? "top" : "bottom"]: -16,
      cursor: "ns-resize",
    };
  return {
    ...base,
    width: 28,
    height: 28,
    [h.includes("t") ? "top" : "bottom"]: -16,
    [h.includes("l") ? "left" : "right"]: -16,
    cursor: h === "tl" || h === "br" ? "nwse-resize" : "nesw-resize",
  };
}

/** The visible grip: a bar on a side, a rounded bracket on a corner. */
function gripStyle(h: Handle, active: boolean): React.CSSProperties {
  const colour = active ? "#ffffff" : "#8a8a8f";
  const base: React.CSSProperties = {
    position: "absolute",
    opacity: active ? 1 : 0.6,
    transition: "opacity .15s",
  };
  if (h === "l" || h === "r")
    return {
      ...base,
      top: "50%",
      width: 4,
      height: 44,
      marginTop: -22,
      borderRadius: 3,
      background: colour,
      [h === "l" ? "left" : "right"]: 5,
    };
  if (h === "t" || h === "b")
    return {
      ...base,
      left: "50%",
      height: 4,
      width: 44,
      marginLeft: -22,
      borderRadius: 3,
      background: colour,
      [h === "t" ? "top" : "bottom"]: 5,
    };
  const v = h.includes("t") ? "Top" : "Bottom";
  const x = h.includes("l") ? "Left" : "Right";
  return {
    ...base,
    width: 12,
    height: 12,
    [v.toLowerCase()]: 5,
    [x.toLowerCase()]: 5,
    [`border${v}`]: `3.5px solid ${colour}`,
    [`border${x}`]: `3.5px solid ${colour}`,
    [`border${v}${x}Radius`]: 8,
  };
}

/**
 * The engine in a frame centred in the stage. Pull a side or corner to
 * resize it: the frame grows on both sides, so it stays centred, and Shift
 * on a corner keeps the aspect ratio. Presets arrive as `preset`; `n` makes
 * the same preset apply again.
 */
function FramedGyre({
  preset,
  values,
  onSize,
}: {
  preset: { label: FrameLabel; n: number };
  values: GyreValues;
  onSize: (size: Size, dragged: boolean) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<Size | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [active, setActive] = useState<Handle | null>(null);
  const onSizeRef = useRef(onSize);
  onSizeRef.current = onSize;
  const presetRef = useRef(preset);
  presetRef.current = preset;

  const room = useCallback(() => {
    const el = stageRef.current;
    return {
      w: (el?.clientWidth ?? 800) - ROOM,
      h: (el?.clientHeight ?? 600) - ROOM,
    };
  }, []);

  const apply = useCallback(
    (w: number, h: number, dragged = false) => {
      const r = room();
      const next = {
        w: Math.round(Math.max(MIN, Math.min(w, r.w))),
        h: Math.round(Math.max(MIN, Math.min(h, r.h))),
      };
      sizeRef.current = next;
      setSize(next);
      onSizeRef.current(next, dragged);
    },
    [room],
  );

  const applyPreset = useCallback(
    (label: FrameLabel) => {
      const r = room();
      const f = FRAMES.find((x) => x.label === label) ?? FRAMES[2];
      if (!f.w) return apply(r.w, r.h);
      const fit = Math.min(1, r.w / f.w, r.h / f.h);
      apply(f.w * fit, f.h * fit);
    },
    [apply, room],
  );

  // First layout applies the preset; later stage resizes re-clamp the frame.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      if (el.clientWidth < 200) return;
      const cur = sizeRef.current;
      if (cur) apply(cur.w, cur.h);
      else applyPreset(presetRef.current.label);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, [apply, applyPreset]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `n` re-applies a repeated pick
  useEffect(() => {
    if (sizeRef.current) applyPreset(preset.label);
  }, [preset.label, preset.n, applyPreset]);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, h: Handle) => {
    const start = sizeRef.current;
    if (e.button > 0 || !start) return;
    e.preventDefault();
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}
    const dx = h.includes("r") ? 1 : h.includes("l") ? -1 : 0;
    const dy = h.includes("b") ? 1 : h.includes("t") ? -1 : 0;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const aspect = start.w / start.h;
    setActive(h);
    document.body.style.cursor = getComputedStyle(target).cursor;
    document.body.style.userSelect = "none";
    const move = (ev: PointerEvent) => {
      let w = start.w + (ev.clientX - x0) * 2 * dx;
      let hh = start.h + (ev.clientY - y0) * 2 * dy;
      if (ev.shiftKey && dx && dy) {
        if (Math.abs(w - start.w) / start.w > Math.abs(hh - start.h) / start.h)
          hh = w / aspect;
        else w = hh * aspect;
      }
      apply(w, hh, true);
    };
    const end = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", end);
      target.removeEventListener("pointercancel", end);
      setActive(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", end);
    target.addEventListener("pointercancel", end);
  };

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 flex items-center justify-center"
    >
      {size && (
        <div
          className="relative"
          style={{ width: size.w, height: size.h }}
          data-gyre-frame
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: 16, background: "#000" }}
          >
            <Gyre {...values} />
          </div>
          {HANDLES.map((h) => (
            <div
              key={h}
              role="presentation"
              style={hitStyle(h)}
              onPointerDown={(e) => startDrag(e, h)}
              data-gyre-handle={h}
            >
              <div style={gripStyle(h, active === h)} />
            </div>
          ))}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[14px] px-3 py-1.5 text-xs tabular-nums text-white transition-opacity"
            style={{ background: "rgba(0,0,0,.62)", opacity: active ? 1 : 0 }}
          >
            {size.w} × {size.h}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GyreStudio() {
  const [v, setV] = useState<GyreValues>(GYRE_DEFAULTS);
  const [preset, setPreset] = useState({ label: "Tablet" as FrameLabel, n: 0 });
  const [chosen, setChosen] = useState<FrameLabel | null>("Tablet");
  const [frameSize, setFrameSize] = useState<Size | null>(null);
  const pick = (label: FrameLabel) => {
    setChosen(label);
    setPreset((p) => ({ label, n: p.n + 1 }));
  };
  const set = <K extends keyof GyreValues>(key: K, value: GyreValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const render = (k: Knob) => {
    if (k.type === "float")
      return (
        <SliderComfortable
          key={k.key}
          variant="scrubber"
          label={k.label}
          value={v[k.key]}
          onChange={(value) => set(k.key, value)}
          min={k.min}
          max={k.max}
          step={k.step}
        />
      );
    if (k.type === "text")
      return (
        <label key={k.key} className="flex flex-col gap-2">
          <span className="label">{k.label}</span>
          <input
            value={v[k.key]}
            maxLength={k.max}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => set(k.key, e.target.value)}
            className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
          />
        </label>
      );
    if (k.type === "color") {
      const dark = `${k.key}Dark` as `${ColorKey}Dark`;
      return [
        <StudioColor
          key={k.key}
          label={k.label}
          value={v[k.key]}
          onChange={(hex) => set(k.key, hex)}
        />,
        <StudioColor
          key={dark}
          label={`${k.label}, dark`}
          value={v[dark]}
          onChange={(hex) => set(dark, hex)}
        />,
      ];
    }
    return (
      <Choice
        key="appearance"
        options={APPEARANCES}
        value={v.appearance}
        onChange={(a) => set("appearance", a)}
      />
    );
  };

  return (
    <SceneStudioShell
      name="gyre"
      onReset={() => {
        setV(GYRE_DEFAULTS);
        pick("Tablet");
      }}
      stage={
        <FramedGyre
          preset={preset}
          values={v}
          onSize={(next, dragged) => {
            setFrameSize(next);
            if (dragged) setChosen(null);
          }}
        />
      }
      groups={[
        ...GROUPS.map((g) => ({
          label: g.label,
          content: g.knobs.map(render),
        })),
        {
          label: "Frame",
          content: (
            <>
              <Choice
                options={FRAMES.map((f) => ({
                  id: f.label,
                  label: f.w ? `${f.label} ${f.w} × ${f.h}` : f.label,
                }))}
                value={chosen}
                onChange={pick}
              />
              {frameSize && (
                <p className="text-xs tabular-nums text-muted-foreground sm:col-span-2 lg:col-span-3">
                  Frame {frameSize.w} × {frameSize.h}. Hold Shift on a corner to
                  keep its shape.
                </p>
              )}
            </>
          ),
        },
      ]}
    />
  );
}
