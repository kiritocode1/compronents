/** Visual constants for the field. Grounds and inks match the page palette. */

export const GROUND_DARK = "#050506";
export const GROUND_LIGHT = "#f4f4f1";
export const INK_ON_DARK = "#ecece8";
export const INK_ON_LIGHT = "#101012";

export const LIGHTS = [
  { name: "Warm", hex: "#fbe7c6" },
  { name: "Cool", hex: "#dbe7fb" },
  { name: "Gold", hex: "#f5a742" },
  { name: "Red", hex: "#f2553f" },
  { name: "Teal", hex: "#49d9b8" },
  { name: "Iris", hex: "#937ef7" },
] as const;

/** A drifting point's cycle, in seconds, spread across this range. */
export const DRIFT_PERIOD_MIN = 4;
export const DRIFT_PERIOD_MAX = 8;
/** Lamp rise and fall, in seconds. */
export const LIGHT_ATTACK = 0.02;
export const LIGHT_DECAY = 0.5;
export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 3;
export const AUTOPLAY_SEC = 6.5;
export const SCAN_SEC = 8;
export const GRID = 512;
export const POINT_COUNT = 262144;

export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@300;500&family=Noto+Serif+TC:wght@300&display=swap";
