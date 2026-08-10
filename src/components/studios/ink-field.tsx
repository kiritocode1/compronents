"use client";

import { Eraser, Maximize2, RefreshCw, Sparkles, Waves } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import {
  TabsSubtle,
  TabsSubtleItem,
  TabsSubtlePanel,
} from "@/components/ui/tabs-subtle";
import InkField, {
  BLEND_MODES,
  BRUSH_SIZES,
  type BrushModeId,
  FLOW_TYPES,
  type FlowTypeId,
  INK_MODES,
  INK_PALETTE,
  type InkFieldHandle,
  METAL_TINTS,
} from "@/registry/ink-field";

const BRUSH_MODE_LABELS: { id: BrushModeId; name: string }[] = [
  { id: 1, name: "Ink" },
  { id: 2, name: "Marker" },
  { id: 3, name: "Spray" },
  { id: 4, name: "Dry" },
  { id: 5, name: "Dots" },
  { id: 6, name: "Flat" },
  { id: 7, name: "Deckle" },
];

const DEFAULTS = {
  brushMode: 1 as BrushModeId,
  brushSize: 2,
  inkMode: 4,
  colorIndex: 0,
  customColor: "#FF6A3D",
  diffusionStrength: 0.45,
  substeps: 15,
  blendMode: 0,
  spectralMix: false,
  hueShift: -0.01,
  satShift: 0.02,
  briShift: 0.02,
  whiteMaxOpacity: 0.78,
  background: "#F4F1EA",
  paperTexture: true,
  paperGrain: 0.03,
  distortEnabled: false,
  displacementB: 20,
  displacementC: 50,
  resonanceEnabled: false,
  rsFrequency: 300,
  rsStrength: 0.5,
  rsGradientMix: 0.1,
  rsScale: 100,
  cellularEnabled: false,
  cellularScale: 15,
  whiteDotEnabled: false,
  whiteDotDensity: 0.1,
  grainEnabled: false,
  grainAmount: 0.18,
  flowType: 0 as FlowTypeId,
  flowStrength: 100,
  flowStyle: 0,
  flowMultiDirection: false,
  metallicStrength: 85,
  metallicFlowSpeed: 200,
  metalTint: "gold" as (typeof METAL_TINTS)[number]["id"],
  biteSize: 7,
};

function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-border-strong bg-muted text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs transition-colors hover:border-border-strong"
    >
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={`h-3.5 w-6 shrink-0 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-muted"
        }`}
      >
        <span
          className={`block size-3 translate-y-[1px] rounded-full bg-background transition-transform ${
            checked ? "translate-x-[11px]" : "translate-x-[1px]"
          }`}
        />
      </span>
    </button>
  );
}

export default function InkFieldStudio() {
  const [s, setS] = useState(DEFAULTS);
  const [tab, setTab] = useState(0);
  const fieldRef = useRef<InkFieldHandle>(null);
  const idPrefix = useId();

  const set = <K extends keyof typeof DEFAULTS>(
    key: K,
    value: (typeof DEFAULTS)[K],
  ) => setS((current) => ({ ...current, [key]: value }));

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[620px] w-full overflow-hidden rounded-t-lg xl:h-[720px]">
        <Link
          href="/components/ink-field/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/75 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>

        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <button
            type="button"
            onClick={() => fieldRef.current?.playDemo()}
            title="Replay the demo composition"
            className="flex h-9 items-center gap-1.5 rounded-md border border-black/15 bg-white/75 px-3 text-xs text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
          >
            <RefreshCw className="size-3.5" /> Demo
          </button>
          <button
            type="button"
            onClick={() => fieldRef.current?.clear()}
            title="Clear the sheet"
            className="flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/75 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
          >
            <Eraser className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => fieldRef.current?.applyFlow()}
            title="Displace the artwork (also: hold the pointer still on the canvas)"
            className="flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/75 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
          >
            <Waves className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => fieldRef.current?.applyEtching()}
            title="Etch metallic bug-bites into the darkest areas"
            className="flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/75 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
          >
            <Sparkles className="size-4" />
          </button>
        </div>

        <InkField ref={fieldRef} {...s} />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="label">Studio</p>
            <h2 className="mt-1 text-sm text-foreground uppercase">
              Ink Field
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setS(DEFAULTS)}
            aria-label="Reset studio"
            title="Reset studio"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        <div className="border-t px-4 pt-2 sm:px-5">
          <TabsSubtle selectedIndex={tab} onSelect={setTab} idPrefix={idPrefix}>
            {["Brush", "Colour", "Surface", "Effects", "Flow & Metal"].map(
              (label, i) => (
                <TabsSubtleItem key={label} index={i} label={label} />
              ),
            )}
          </TabsSubtle>
        </div>

        <div className="p-4 sm:p-5">
          {/* ---------------- Brush ---------------- */}
          <TabsSubtlePanel selectedIndex={tab} index={0} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-3">
              <section className="grid content-start gap-3">
                <span className="label">Brush mode</span>
                <div className="flex flex-wrap gap-1">
                  {BRUSH_MODE_LABELS.map((mode) => (
                    <Chip
                      key={mode.id}
                      active={s.brushMode === mode.id}
                      onClick={() => set("brushMode", mode.id)}
                    >
                      {mode.name}
                    </Chip>
                  ))}
                </div>
                <span className="label mt-2">Brush size</span>
                <div className="flex flex-wrap gap-1">
                  {BRUSH_SIZES.map((size) => (
                    <Chip
                      key={size}
                      active={s.brushSize === size}
                      onClick={() => set("brushSize", size)}
                    >
                      {size === 5 ? "10x" : `${size}x`}
                    </Chip>
                  ))}
                </div>
              </section>

              <section className="grid content-start gap-3">
                <span className="label">Ink diffusion</span>
                <div className="flex flex-wrap gap-1">
                  {INK_MODES.map((mode) => (
                    <Chip
                      key={mode.id}
                      active={s.inkMode === mode.id}
                      onClick={() => set("inkMode", mode.id)}
                      title={mode.note}
                    >
                      <span className="mr-1 opacity-60">{mode.glyph}</span>
                      {mode.name}
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {INK_MODES.find((m) => m.id === s.inkMode)?.note}
                </p>
              </section>

              <section className="grid content-start gap-4">
                <SliderComfortable
                  variant="scrubber"
                  label="Diffusion strength"
                  value={s.diffusionStrength}
                  onChange={(v) => set("diffusionStrength", v)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Substeps per frame"
                  value={s.substeps}
                  onChange={(v) => set("substeps", Math.round(v))}
                  min={4}
                  max={30}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
              </section>
            </div>
          </TabsSubtlePanel>

          {/* ---------------- Colour ---------------- */}
          <TabsSubtlePanel selectedIndex={tab} index={1} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-3">
              <section className="grid content-start gap-3">
                <span className="label">Pigment</span>
                <div className="grid grid-cols-9 gap-1">
                  {INK_PALETTE.map((swatch) => {
                    const hex =
                      swatch.dynamic === "custom"
                        ? s.customColor
                        : swatch.dynamic === "background"
                          ? s.background
                          : swatch.hex;
                    return (
                      <button
                        key={swatch.index}
                        type="button"
                        title={`${swatch.index} · ${swatch.name}`}
                        onClick={() => set("colorIndex", swatch.index)}
                        style={{ background: hex }}
                        className={`aspect-square rounded transition-all ${
                          s.colorIndex === swatch.index
                            ? "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                            : "ring-1 ring-black/15 hover:ring-black/40"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {INK_PALETTE.find((p) => p.index === s.colorIndex)?.name}
                </p>
                <StudioColor
                  label="Custom pigment (slot 33)"
                  value={s.customColor}
                  onChange={(hex) => set("customColor", hex)}
                />
              </section>

              <section className="grid content-start gap-3">
                <span className="label">Blend</span>
                <div className="flex flex-wrap gap-1">
                  {BLEND_MODES.map((mode) => (
                    <Chip
                      key={mode.id}
                      active={s.blendMode === mode.id}
                      onClick={() => set("blendMode", mode.id)}
                    >
                      {mode.name}
                    </Chip>
                  ))}
                </div>
                <Toggle
                  label="Spectral mixing"
                  checked={s.spectralMix}
                  onChange={(v) => set("spectralMix", v)}
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Mixes in reflectance space, so red over yellow makes orange
                  instead of drifting toward black.
                </p>
              </section>

              <section className="grid content-start gap-4">
                <SliderComfortable
                  variant="scrubber"
                  label="Hue shift"
                  value={s.hueShift}
                  onChange={(v) => set("hueShift", v)}
                  min={-0.5}
                  max={0.5}
                  step={0.005}
                  formatValue={(v) => v.toFixed(3)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Saturation shift"
                  value={s.satShift}
                  onChange={(v) => set("satShift", v)}
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Brightness shift"
                  value={s.briShift}
                  onChange={(v) => set("briShift", v)}
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="White brush opacity"
                  value={s.whiteMaxOpacity}
                  onChange={(v) => set("whiteMaxOpacity", v)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
              </section>
            </div>
          </TabsSubtlePanel>

          {/* ---------------- Surface ---------------- */}
          <TabsSubtlePanel selectedIndex={tab} index={2} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-3">
              <section className="grid content-start gap-3">
                <StudioColor
                  label="Paper"
                  value={s.background}
                  onChange={(hex) => set("background", hex)}
                />
                <Toggle
                  label="Paper texture"
                  checked={s.paperTexture}
                  onChange={(v) => set("paperTexture", v)}
                />
              </section>
              <section className="grid content-start gap-4">
                <SliderComfortable
                  variant="scrubber"
                  label="Grain"
                  value={s.paperGrain}
                  onChange={(v) => set("paperGrain", v)}
                  min={0}
                  max={0.3}
                  step={0.005}
                  formatValue={(v) => v.toFixed(3)}
                />
              </section>
              <section className="grid content-start gap-2">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Paper is the flat colour multiplied by a fibre grain. On a
                  neutral sheet ink multiplies like pigment absorbing light; on
                  a saturated one it mixes directly, which is why warm hues
                  survive on warm paper instead of collapsing to brown.
                </p>
              </section>
            </div>
          </TabsSubtlePanel>

          {/* ---------------- Effects ---------------- */}
          <TabsSubtlePanel selectedIndex={tab} index={3} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-3">
              <section className="grid content-start gap-3">
                <Toggle
                  label="FBM distort"
                  checked={s.distortEnabled}
                  onChange={(v) => set("distortEnabled", v)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Displacement B"
                  value={s.displacementB}
                  onChange={(v) => set("displacementB", Math.round(v))}
                  min={0}
                  max={300}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Displacement C"
                  value={s.displacementC}
                  onChange={(v) => set("displacementC", Math.round(v))}
                  min={0}
                  max={300}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
              </section>

              <section className="grid content-start gap-3">
                <Toggle
                  label="Resonance scatter"
                  checked={s.resonanceEnabled}
                  onChange={(v) => set("resonanceEnabled", v)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Frequency"
                  value={s.rsFrequency}
                  onChange={(v) => set("rsFrequency", Math.round(v))}
                  min={20}
                  max={400}
                  step={10}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Strength"
                  value={s.rsStrength}
                  onChange={(v) => set("rsStrength", v)}
                  min={0}
                  max={4}
                  step={0.05}
                  formatValue={(v) => v.toFixed(2)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Gradient mix"
                  value={s.rsGradientMix}
                  onChange={(v) => set("rsGradientMix", v)}
                  min={0}
                  max={1}
                  step={0.05}
                  formatValue={(v) => v.toFixed(2)}
                />
              </section>

              <section className="grid content-start gap-3">
                <Toggle
                  label="Cellular"
                  checked={s.cellularEnabled}
                  onChange={(v) => set("cellularEnabled", v)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Cell scale"
                  value={s.cellularScale}
                  onChange={(v) => set("cellularScale", v)}
                  min={5}
                  max={30}
                  step={0.5}
                  formatValue={(v) => v.toFixed(1)}
                />
                <Toggle
                  label="White dots"
                  checked={s.whiteDotEnabled}
                  onChange={(v) => set("whiteDotEnabled", v)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Dot density"
                  value={s.whiteDotDensity}
                  onChange={(v) => set("whiteDotDensity", v)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
                <Toggle
                  label="Film grain"
                  checked={s.grainEnabled}
                  onChange={(v) => set("grainEnabled", v)}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Grain amount"
                  value={s.grainAmount}
                  onChange={(v) => set("grainAmount", v)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
              </section>
            </div>
          </TabsSubtlePanel>

          {/* ---------------- Flow & Metal ---------------- */}
          <TabsSubtlePanel selectedIndex={tab} index={4} idPrefix={idPrefix}>
            <div className="grid gap-x-5 gap-y-6 lg:grid-cols-3">
              <section className="grid content-start gap-3">
                <span className="label">Displacement style</span>
                <div className="flex flex-wrap gap-1">
                  {FLOW_TYPES.map((type) => (
                    <Chip
                      key={type.id}
                      active={s.flowType === type.id}
                      onClick={() => set("flowType", type.id)}
                      title={type.note}
                    >
                      {type.name}
                    </Chip>
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {FLOW_TYPES.find((t) => t.id === s.flowType)?.note} Hold the
                  pointer still on the canvas, or use the wave button.
                </p>
              </section>

              <section className="grid content-start gap-4">
                <SliderComfortable
                  variant="scrubber"
                  label="Flow strength"
                  value={s.flowStrength}
                  onChange={(v) => set("flowStrength", Math.round(v))}
                  min={10}
                  max={300}
                  step={10}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <div className="flex gap-1">
                  <Chip
                    active={s.flowStyle === 0}
                    onClick={() => set("flowStyle", 0)}
                    title="Three discrete amplitude bands"
                  >
                    Tiered
                  </Chip>
                  <Chip
                    active={s.flowStyle === 1}
                    onClick={() => set("flowStyle", 1)}
                    title="Mostly calm with violent random outbursts"
                  >
                    Outburst
                  </Chip>
                </div>
                <Toggle
                  label="Multi-directional field"
                  checked={s.flowMultiDirection}
                  onChange={(v) => set("flowMultiDirection", v)}
                />
              </section>

              <section className="grid content-start gap-3">
                <span className="label">Etching material</span>
                <div className="flex flex-wrap gap-1">
                  {METAL_TINTS.map((tint) => (
                    <Chip
                      key={tint.id}
                      active={s.metalTint === tint.id}
                      onClick={() => set("metalTint", tint.id)}
                    >
                      {tint.name}
                    </Chip>
                  ))}
                </div>
                <SliderComfortable
                  variant="scrubber"
                  label="Etch strength"
                  value={s.metallicStrength}
                  onChange={(v) => set("metallicStrength", Math.round(v))}
                  min={0}
                  max={300}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}`}
                />
                <SliderComfortable
                  variant="scrubber"
                  label="Bite size"
                  value={s.biteSize}
                  onChange={(v) => set("biteSize", Math.round(v))}
                  min={4}
                  max={30}
                  step={1}
                  formatValue={(v) => `${Math.round(v)}px`}
                />
              </section>
            </div>
          </TabsSubtlePanel>
        </div>
      </aside>
    </div>
  );
}
