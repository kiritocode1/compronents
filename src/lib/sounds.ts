import type { SoundDefinition } from "@web-kits/audio";
import {
  click,
  copy,
  hover,
  keyPress,
  tap,
  toggleOn,
} from "../../.web-kits/minimal";

// The Minimal patch ships very quiet (gains 0.04-0.12). Scale definitions up
// for audible feedback, capped at 0.4 per layer (the patch gain budget).
function louder(definition: SoundDefinition, factor = 3): SoundDefinition {
  if ("layers" in definition) {
    return {
      ...definition,
      layers: definition.layers.map((layer) => ({
        ...layer,
        gain: Math.min((layer.gain ?? 0.1) * factor, 0.4),
      })),
    };
  }
  return {
    ...definition,
    gain: Math.min((definition.gain ?? 0.1) * factor, 0.4),
  };
}

export const uiHover = louder(hover);
export const uiClick = louder(click);
export const uiTap = louder(tap);
export const uiCopy = louder(copy);
export const uiToggleOn = louder(toggleOn);
// Slider tick: ultra-short transient; pitch is bent at play time via
// PlayOptions.detune so position on the range is audible.
export const uiSliderTick = louder(keyPress);
