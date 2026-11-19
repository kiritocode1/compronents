"use client";

import { useRef, useState } from "react";
import { SliderComfortable } from "@/components/site/studio-controls";
import PatchCables, {
  PATCH_CABLES_EFFECTS,
  PATCH_CABLES_GENERATORS,
  PATCH_CABLES_PALETTES,
  type PatchCablesEffects,
  type PatchCablesGenerators,
  type PatchCablesHandle,
  type PatchCablesTool,
  type PatchCablesVoice,
} from "@/registry/patch-cables";
import { SceneStudioShell, StudioToggle } from "./scene-studio-shell";

/** The source's values, from its control panel. Tabs follow the panel's groups. */
const DEFAULTS = {
  palette: 0,
  voice: "mist" as PatchCablesVoice,
  bpm: 108,
  effects: PATCH_CABLES_EFFECTS,
  generators: PATCH_CABLES_GENERATORS,
  reach: 2.2,
  smoothing: 0.55,
  trailDecay: 1,
  tool: "patch" as PatchCablesTool,
  fadePatches: true,
  spacing: 40,
  dotSize: 0.47,
  goo: 0.79,
  minNeck: 0.62,
};

type Settings = typeof DEFAULTS;
type NumberKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never;
}[keyof Settings];

const VOICES: { id: PatchCablesVoice; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "mist", label: "Mist" },
  { id: "pluck", label: "Pluck" },
  { id: "bloop", label: "Bloop" },
  { id: "acid", label: "Acid" },
];
const GENERATORS: { id: keyof PatchCablesGenerators; label: string }[] = [
  { id: "wander", label: "Wander: a ghost cursor drifts" },
  { id: "rain", label: "Rain: ripples on the beat" },
  { id: "selfpatch", label: "Patcher: draws its own cables" },
  { id: "lfo", label: "LFO: sweeping waves" },
  { id: "seq", label: "Sequencer: plays your patches" },
];
const EFFECTS: { id: keyof PatchCablesEffects; label: string }[] = [
  { id: "magnet", label: "Magnet" },
  { id: "ripples", label: "Ripples" },
  { id: "breathe", label: "Breathe" },
  { id: "sockets", label: "Sockets" },
  { id: "signal", label: "Signal" },
  { id: "fluid", label: "Fluid" },
  { id: "grain", label: "Grain" },
  { id: "scope", label: "Scope" },
];

/** A labelled choice among a few options, styled like StudioToggle. */
function Choice<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:col-span-2 lg:col-span-3">
      {options.map((o) => (
        <button
          key={String(o.id)}
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

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-md bg-muted/50 px-3 text-left text-xs transition-colors hover:bg-muted"
    >
      {label}
    </button>
  );
}

export default function PatchCablesStudio() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const ref = useRef<PatchCablesHandle>(null);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const slider = (
    key: NumberKey,
    label: string,
    min: number,
    max: number,
    step: number,
  ) => (
    <SliderComfortable
      key={key}
      variant="scrubber"
      label={label}
      value={s[key]}
      onChange={(value) => set(key, value)}
      min={min}
      max={max}
      step={step}
    />
  );

  return (
    <SceneStudioShell
      name="patch-cables"
      onReplay={() => ref.current?.clear()}
      replayLabel="Clear patches"
      onReset={() => setS(DEFAULTS)}
      stage={
        <PatchCables
          ref={ref}
          palette={PATCH_CABLES_PALETTES[s.palette]}
          voice={s.voice}
          bpm={s.bpm}
          effects={s.effects}
          generators={s.generators}
          reach={s.reach}
          smoothing={s.smoothing}
          trailDecay={s.trailDecay}
          tool={s.tool}
          fadePatches={s.fadePatches}
          spacing={s.spacing}
          dotSize={s.dotSize}
          goo={s.goo}
          minNeck={s.minNeck}
        />
      }
      groups={[
        {
          label: "Sound",
          content: (
            <>
              <Choice
                options={VOICES}
                value={s.voice}
                onChange={(v) => set("voice", v)}
              />
              {slider("bpm", "Tempo", 60, 180, 1)}
            </>
          ),
        },
        {
          label: "Generators",
          content: GENERATORS.map((g) => (
            <StudioToggle
              key={g.id}
              label={g.label}
              checked={s.generators[g.id]}
              onChange={(v) =>
                set("generators", { ...s.generators, [g.id]: v })
              }
            />
          )),
        },
        {
          label: "Palette",
          content: (
            <Choice
              options={PATCH_CABLES_PALETTES.map((p, i) => ({
                id: i,
                label: p.name,
              }))}
              value={s.palette}
              onChange={(v) => set("palette", v)}
            />
          ),
        },
        {
          label: "Effects",
          content: EFFECTS.map((e) => (
            <StudioToggle
              key={e.id}
              label={e.label}
              checked={s.effects[e.id]}
              onChange={(v) => set("effects", { ...s.effects, [e.id]: v })}
            />
          )),
        },
        {
          label: "Cursor",
          content: (
            <>
              {slider("reach", "Reach", 0.6, 6, 0.1)}
              {slider("smoothing", "Smoothing", 0, 1, 0.01)}
              {slider("trailDecay", "Trail decay", 0, 3, 0.05)}
            </>
          ),
        },
        {
          label: "Patching",
          content: (
            <>
              <Choice
                options={[
                  { id: "patch" as PatchCablesTool, label: "Patch" },
                  { id: "erase" as PatchCablesTool, label: "Unpatch" },
                ]}
                value={s.tool}
                onChange={(v) => set("tool", v)}
              />
              <StudioToggle
                label="Fade patches after 5s"
                checked={s.fadePatches}
                onChange={(v) => set("fadePatches", v)}
              />
              <Action label="Tiles" onClick={() => ref.current?.tiles()} />
              <Action
                label="Patchbay"
                onClick={() => ref.current?.patchbay()}
              />
            </>
          ),
        },
        {
          label: "Shape",
          content: (
            <>
              {slider("spacing", "Spacing", 16, 90, 1)}
              {slider("dotSize", "Dot size", 0.28, 0.62, 0.01)}
              {slider("goo", "Goo", 0, 1, 0.01)}
              {slider("minNeck", "Min neck", 0.2, 1, 0.01)}
            </>
          ),
        },
      ]}
    />
  );
}
