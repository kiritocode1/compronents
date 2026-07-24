"use client";

import { useSyncExternalStore } from "react";

/**
 * Streamer mode: when on, every `ui.aryank.space` URL on the page is covered by
 * a cloud of drifting dust so it can't be read off a stream or a screenshot.
 * A module store rather than a context — nothing needs to wrap the tree, and
 * `useSyncExternalStore` handles the localStorage read without a hydration gap.
 */
const KEY = "blank-streamer";

const listeners = new Set<() => void>();
let enabled: boolean | null = null;
let toggled = false;

/**
 * Whether the setting was flipped in this session, as opposed to restored on
 * load. Veils dissolve on a flip, but are already dust on load, so a reload
 * never shows the URL longer than it takes to paint.
 */
export function hasToggled() {
  return toggled;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  if (enabled === null) enabled = localStorage.getItem(KEY) === "on";
  return enabled;
}

export function setStreamerMode(next: boolean) {
  enabled = next;
  toggled = true;
  localStorage.setItem(KEY, next ? "on" : "off");
  for (const fn of listeners) fn();
}

export function useStreamerMode() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
