"use client";

import { useSound } from "@web-kits/audio/react";
import { type CSSProperties, useRef } from "react";
import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
} from "@/components/ui/color-picker";
import {
  SliderComfortable as SliderComfortableBase,
  type SliderComfortableProps,
} from "@/components/ui/slider";
import { uiSliderTick } from "@/lib/sounds";

/**
 * SliderComfortable with audible scrubbing: a very short tick per snapped step
 * change, rate-limited to ~35ms, whose pitch rises with the slider position
 * (roughly one octave across the range) so dragging is audible without being
 * a machine gun.
 */
export function SliderComfortable({
  value,
  onChange,
  min = 0,
  max = 100,
  ...props
}: SliderComfortableProps) {
  // Pitch follows the current value: useSound reads opts from a ref, so the
  // detune passed here is picked up on the next tick during a drag.
  const fraction = max === min ? 0 : (value - min) / (max - min);
  const playTick = useSound(uiSliderTick, { detune: -400 + fraction * 1200 });
  const lastValue = useRef(value);
  const lastTickAt = useRef(0);

  function handleChange(next: number) {
    if (next !== lastValue.current) {
      lastValue.current = next;
      const now = performance.now();
      if (now - lastTickAt.current > 35) {
        lastTickAt.current = now;
        playTick();
      }
    }
    onChange(next);
  }

  return (
    <SliderComfortableBase
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      {...props}
    />
  );
}

// The color picker reads `--popover` (which this site doesn't define) for its
// dropdown surface; pin it to the elevated tone so the popover is dark. The
// other tokens it touches (--foreground/--border) are intentionally left alone:
// this site defines them as hex/rgba, so overriding them as HSL triplets here
// would break the Tailwind color utilities used elsewhere in the studio.
const PICKER_THEME = { "--popover": "0 0% 5%" } as CSSProperties;

/**
 * Labelled colour control for studio panels: a swatch + hex trigger that opens
 * the full ColorPicker popover. Stores and emits plain hex strings so it drops
 * straight into existing `useState<string>` colour state.
 */
export function StudioColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2" style={PICKER_THEME}>
      <span className="label">{label}</span>
      <ColorPicker
        value={value}
        onChange={(color) => onChange(color.toString("hex"))}
      >
        <ColorPicker.Trigger className="flex h-10 w-full min-w-0 items-center gap-2 rounded-md border bg-card px-2 transition-colors hover:border-border-strong">
          <ColorSwatch size="sm" />
          <span className="min-w-0 truncate text-xs tracking-wide text-muted-foreground tabular-nums">
            {value.toUpperCase()}
          </span>
        </ColorPicker.Trigger>
        <ColorPicker.Popover>
          <ColorArea>
            <ColorArea.Thumb />
          </ColorArea>
          <ColorSlider channel="hue">
            <ColorSlider.Track>
              <ColorSlider.Thumb />
            </ColorSlider.Track>
          </ColorSlider>
          <ColorField>
            <ColorField.Group>
              <ColorField.Input />
            </ColorField.Group>
          </ColorField>
        </ColorPicker.Popover>
      </ColorPicker>
    </div>
  );
}
