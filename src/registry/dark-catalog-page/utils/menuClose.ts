// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

// custom event name for closing the menu from anywhere in the app
export const MENU_CLOSE_EVENT = "menu-close";

// dispatch menu close event on the window
export function dispatchMenuClose() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MENU_CLOSE_EVENT));
  }
}
