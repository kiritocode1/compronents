"use client";

/**
 * Kit Langton's visual-effect sound cues (TaskSounds.ts), recreated on
 * @web-kits/audio instead of Tone.js so no new dependency is added.
 *
 * Faithful to the source: a rotating C-D-E-G-A pentatonic scale, a 100ms chord
 * window that voices overlapping notes as adjacent scale degrees (so many
 * nodes resolving at once sound consonant, not chaotic), success as a rotating
 * major-triad tone, failure as a low sawtooth, death as a distorted fat-saw
 * stab plus a sub rumble, interrupt as two rapid ascending beeps, reset as a
 * descending G-to-C cue, plus finalizer, ref-update, notification, and
 * configuration chimes.
 *
 * Gated by setVizSoundsEnabled, which src/components/site/effect-viz.tsx syncs
 * from the site's sound toggle (SiteSoundProvider) and prefers-reduced-motion.
 */

import type { SoundDefinition } from "@web-kits/audio";
import { defineSound } from "@web-kits/audio";

// ---------------------------------------------------------------------------
// gate
// ---------------------------------------------------------------------------
let enabled = false;

export function setVizSoundsEnabled(next: boolean) {
  enabled = next;
}

// ---------------------------------------------------------------------------
// pitch helpers (kit: PENTATONIC_SCALE over BASE_OCTAVE, CHORD_WINDOW_MS 100)
// ---------------------------------------------------------------------------
const PENT_SEMITONES = [0, 2, 4, 7, 9]; // C D E G A
const CHORD_WINDOW_MS = 100;
// All synth defs are pitched at C4; play-time detune (cents) selects the note.
const C4 = 261.63;
// kit's BASE_OCTAVE is 3, one octave below the C4 baseline.
const BASE_OFFSET = -12;

let noteIndex = 0;
let windowStart: number | null = null;
let chordStep = 0;
let chordBaseIndex = 0;
let chordBaseSemis = BASE_OFFSET;

/** kit's getNextNote: rotate the scale, voicing chord-window notes adjacently. */
function nextNoteSemis(octaveOffset = 0): number {
  const now = Date.now();
  const inWindow = windowStart !== null && now - windowStart <= CHORD_WINDOW_MS;
  if (!inWindow) {
    windowStart = now;
    chordStep = 0;
    chordBaseIndex = noteIndex % PENT_SEMITONES.length;
    chordBaseSemis = BASE_OFFSET + Math.round(octaveOffset * 12);
  }
  const scaleIndex = (chordBaseIndex + chordStep) % PENT_SEMITONES.length;
  chordStep++;
  noteIndex = (noteIndex + 1) % (PENT_SEMITONES.length * 2);
  return chordBaseSemis + (PENT_SEMITONES[scaleIndex] ?? 0);
}

// ---------------------------------------------------------------------------
// synths (envelope + timbre values from TaskSounds.ts)
// ---------------------------------------------------------------------------
const REVERB = { type: "reverb", decay: 2.5, mix: 0.3 } as const;

const def = (d: SoundDefinition) => defineSound(d);

const synthSuccess = def({
  layers: [
    {
      source: { type: "triangle", frequency: C4 },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 1.2 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

const synthRunning = def({
  layers: [
    {
      source: { type: "sine", frequency: C4 },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.1 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

const synthBass = def({
  layers: [
    {
      source: { type: "sawtooth", frequency: C4 },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.1, release: 0.8 },
      gain: 0.28,
    },
  ],
  effects: [REVERB],
});

const synthInterrupt = def({
  layers: [
    {
      source: { type: "triangle", frequency: C4 },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

const synthReset = def({
  layers: [
    {
      source: { type: "sine", frequency: C4 },
      envelope: { attack: 0.004, decay: 0.18, sustain: 0, release: 0.12 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

// kit: fatsawtooth10 through a Distortion — two detuned saws, softened so a
// looping death card reads grim rather than alarming.
const synthDeath = def({
  layers: [
    {
      source: { type: "sawtooth", frequency: C4, detune: -10 },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.15, release: 0.9 },
      gain: 0.09,
    },
    {
      source: { type: "sawtooth", frequency: C4, detune: 10 },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.15, release: 0.9 },
      gain: 0.09,
    },
  ],
  effects: [{ type: "distortion", amount: 40, mix: 0.5 }],
});

const synthConfig = def({
  layers: [
    {
      source: { type: "triangle", frequency: C4 },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

const synthRefUpdate = def({
  layers: [
    {
      source: { type: "sine", frequency: C4 },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
      gain: 0.25,
    },
  ],
  effects: [REVERB],
});

const synthFinalizer = def({
  layers: [
    {
      // kit: square4 — a square with a lowpass to soften the upper partials
      source: { type: "square", frequency: C4 },
      filter: { type: "lowpass", frequency: 2200 },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0.05, release: 0.25 },
      gain: 0.22,
    },
  ],
  effects: [REVERB],
});

const synthNotification = def({
  layers: [
    {
      source: { type: "triangle", frequency: C4 },
      envelope: { attack: 0.005, decay: 0.25, sustain: 0.1, release: 0.4 },
      gain: 0.28,
    },
  ],
  effects: [REVERB],
});

// semitone offsets from C4 for the fixed cues
const SEMIS = {
  C5: 12,
  E5: 16,
  G5: 19,
  E6: 28,
  G3: -5,
  C3: -12,
  DS3: -9,
  C1: -36,
};
const cents = (semis: number) => semis * 100;

// failure/interrupt/death debounce so stacked transitions do not pile up
let failureUntil = 0;
let interruptUntil = 0;
let deathUntil = 0;

// ---------------------------------------------------------------------------
// public cues (names match TaskSounds)
// ---------------------------------------------------------------------------
export const vizSounds = {
  /** rotating pentatonic major-triad tone, bright octave */
  playSuccess() {
    if (!enabled) return;
    const now = Date.now();
    const inWindow =
      windowStart !== null && now - windowStart <= CHORD_WINDOW_MS;
    if (!inWindow) {
      windowStart = now;
      chordStep = 0;
      chordBaseIndex = noteIndex % PENT_SEMITONES.length;
      chordBaseSemis = BASE_OFFSET + 12; // brightness
    }
    const TRIAD = [0, 4, 7];
    const root = chordBaseSemis + (PENT_SEMITONES[chordBaseIndex] ?? 0);
    const semis = root + (TRIAD[chordStep % TRIAD.length] ?? 0);
    chordStep++;
    noteIndex = (noteIndex + 1) % (PENT_SEMITONES.length * 2);
    synthSuccess({ detune: cents(semis), volume: 0.5 });
  },

  /** short sine blip, half an octave up the rotating scale */
  playRunning() {
    if (!enabled) return;
    synthRunning({ detune: cents(nextNoteSemis(0.5)), volume: 0.18 });
  },

  /** deep sawtooth bass note */
  playFailure() {
    if (!enabled || Date.now() < failureUntil) return;
    failureUntil = Date.now() + 200;
    const semis =
      BASE_OFFSET -
      12 +
      (PENT_SEMITONES[noteIndex % PENT_SEMITONES.length] ?? 0);
    noteIndex = (noteIndex + 1) % PENT_SEMITONES.length;
    synthBass({ detune: cents(semis), volume: 0.45 });
  },

  /** two rapid ascending beeps (C5 then E5) */
  playInterrupted() {
    if (!enabled || Date.now() < interruptUntil) return;
    interruptUntil = Date.now() + 200;
    synthInterrupt({ detune: cents(SEMIS.C5), volume: 0.6 });
    setTimeout(
      () => synthInterrupt({ detune: cents(SEMIS.E5), volume: 0.6 }),
      70,
    );
  },

  /** muted distorted stab (D#3) plus a soft low rumble (C1) 100ms later */
  playDeath() {
    if (!enabled || Date.now() < deathUntil) return;
    deathUntil = Date.now() + 600;
    synthDeath({ detune: cents(SEMIS.DS3), volume: 0.22 });
    setTimeout(
      () => synthDeath({ detune: cents(SEMIS.C1), volume: 0.26 }),
      100,
    );
  },

  /** descending G3 to C3 reset cue */
  playReset() {
    if (!enabled) return;
    synthReset({ detune: cents(SEMIS.G3), volume: 0.6 });
    setTimeout(() => synthReset({ detune: cents(SEMIS.C3), volume: 0.6 }), 100);
  },

  /** single G5 blip on a configuration change */
  playConfigurationChange() {
    if (!enabled) return;
    synthConfig({ detune: cents(SEMIS.G5), volume: 0.6 });
  },

  /** ultra-short E6 blip when a ref value updates */
  playRefUpdate() {
    if (!enabled) return;
    synthRefUpdate({ detune: cents(SEMIS.E6), volume: 0.35 });
  },

  playFinalizerCreated() {
    if (!enabled) return;
    synthFinalizer({ detune: cents(nextNoteSemis(0)), volume: 0.25 });
  },

  playFinalizerRunning() {
    if (!enabled) return;
    synthFinalizer({ detune: cents(nextNoteSemis(0.5)), volume: 0.3 });
  },

  playFinalizerCompleted() {
    if (!enabled) return;
    synthFinalizer({ detune: cents(nextNoteSemis(1)), volume: 0.35 });
  },

  /** gentle two-note chime (C5 then E5) for notification bubbles */
  playNotificationChime() {
    if (!enabled) return;
    synthNotification({ detune: cents(SEMIS.C5), volume: 0.4 });
    setTimeout(
      () => synthNotification({ detune: cents(SEMIS.E5), volume: 0.4 }),
      120,
    );
  },
};
