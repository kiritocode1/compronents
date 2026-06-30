"use client";

import type { CSSProperties } from "react";
import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
} from "@/components/ui/color-picker";

export { SliderComfortable } from "@/components/ui/slider";

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
