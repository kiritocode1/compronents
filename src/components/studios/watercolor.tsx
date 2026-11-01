"use client";

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
import Watercolor, {
  CONTROL_RANGES,
  DEFAULT_HUE,
  DEFAULT_SETTINGS,
  type WatercolorHandle,
  type WatercolorQuality,
} from "@/registry/watercolor";

const buttonClass =
  "rounded-md border px-3 py-2 text-xs transition-colors hover:bg-muted aria-pressed:bg-muted aria-pressed:border-border-strong";

export default function WatercolorStudio() {
  const field = useRef<WatercolorHandle>(null);
  const [settings, setSettings] = useState(() =>
    structuredClone(DEFAULT_SETTINGS),
  );
  const [hue, setHue] = useState(DEFAULT_HUE);
  const [brushSize, setBrushSize] = useState(1);
  const [rainbow, setRainbow] = useState(true);
  const [quality, setQuality] = useState<WatercolorQuality>("auto");
  const [tab, setTab] = useState(0);
  const id = useId();

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-surface">
      <div className="h-[520px] w-full sm:h-[620px] xl:h-[720px]">
        <Watercolor
          ref={field}
          tuning={settings}
          hue={hue}
          brushSize={brushSize}
          rainbow={rainbow}
          quality={quality}
        />
      </div>
      <aside
        aria-label="Watercolor controls"
        className="border-t bg-background"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="label">Studio</p>
            <h2 className="mt-1 text-sm uppercase">Watercolor</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass}
              onClick={() => field.current?.wash()}
            >
              Wash clean
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => field.current?.clear()}
            >
              New sheet
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => {
                setSettings(structuredClone(DEFAULT_SETTINGS));
                setHue(DEFAULT_HUE);
                setBrushSize(1);
                setRainbow(true);
                setQuality("auto");
              }}
            >
              Reset controls
            </button>
            <Link
              className={buttonClass}
              href="/components/watercolor/preview"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fullscreen
            </Link>
          </div>
          <p className="w-full text-xs text-muted-foreground">
            Drag to paint. Right-click and drag to smudge.
          </p>
        </div>
        <div className="border-t px-4 pt-2 sm:px-5">
          <TabsSubtle selectedIndex={tab} onSelect={setTab} idPrefix={id}>
            {["Brush", "Water", "Look", "Sheet"].map((label, index) => (
              <TabsSubtleItem key={label} index={index} label={label} />
            ))}
          </TabsSubtle>
        </div>
        <div className="p-4 sm:p-5">
          {Object.entries(CONTROL_RANGES).map(([name, ranges], index) => (
            <TabsSubtlePanel
              key={name}
              selectedIndex={tab}
              index={index}
              idPrefix={id}
            >
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {index === 0 && (
                  <>
                    <SliderComfortable
                      variant="scrubber"
                      label="Hue"
                      min={0}
                      max={360}
                      step={1}
                      value={hue}
                      onChange={setHue}
                    />
                    <SliderComfortable
                      variant="scrubber"
                      label="Brush size"
                      min={0.3}
                      max={3}
                      step={0.05}
                      value={brushSize}
                      onChange={setBrushSize}
                    />
                    <button
                      type="button"
                      aria-pressed={rainbow}
                      className={buttonClass}
                      onClick={() => setRainbow(!rainbow)}
                    >
                      Rainbow {rainbow ? "on" : "off"}
                    </button>
                  </>
                )}
                {ranges.map(({ group, key, label, min, max, step }) => (
                  <SliderComfortable
                    key={`${group}.${key}`}
                    variant="scrubber"
                    label={label}
                    min={min}
                    max={max}
                    step={step}
                    value={(settings[group] as Record<string, number>)[key]}
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        [group]: { ...current[group], [key]: value },
                      }))
                    }
                    formatValue={(value) => String(Number(value.toFixed(4)))}
                  />
                ))}
              </div>
            </TabsSubtlePanel>
          ))}
          <TabsSubtlePanel selectedIndex={tab} index={3} idPrefix={id}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StudioColor
                label="Paper"
                value={settings.paper}
                onChange={(paper) =>
                  setSettings((current) => ({ ...current, paper }))
                }
              />
              <fieldset>
                <legend className="label mb-3">Quality</legend>
                <div className="flex gap-2">
                  {(["auto", "high", "low"] as const).map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={buttonClass}
                      aria-pressed={quality === value}
                      onClick={() => setQuality(value)}
                    >
                      {value === "auto"
                        ? "Auto"
                        : value === "high"
                          ? "High"
                          : "Low"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Changing resolution starts a new sheet.
                </p>
              </fieldset>
            </div>
          </TabsSubtlePanel>
        </div>
      </aside>
    </div>
  );
}
