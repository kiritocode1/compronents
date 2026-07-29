"use client";

/**
 * Kit Langton's Visual Types sound cues, recreated on @web-kits/audio instead
 * of Tone.js so no new dependency is added. Same approach as
 * src/lib/effect-viz-sounds.ts, which does this for visual-effect.
 *
 * These are a different palette from the effect cues: no failure or death
 * stabs, because a type lesson has no failure state. What it has instead is a
 * step advance that wanders a C-D-E-G-A pentatonic scale by a random walk (so
 * clicking through a lesson never repeats the same tune), a two-note toggle
 * whose order inverts on and off, tiny hover blips, and a completion chord that
 * voices notes arriving within 140ms of each other as consecutive degrees of
 * C-E-G-B-D, so finishing several steps at once sounds like one chord.
 *
 * Every value below is from the shipped bundle: oscillator types, ADSR
 * envelopes, note names, velocities, the -12dB master and the 2.5s/0.3 wet
 * reverb.
 *
 * Gated by setTypeSoundsEnabled, which src/components/site/types-viz.tsx syncs
 * from the site's sound toggle and prefers-reduced-motion.
 */

import type { SoundDefinition } from "@web-kits/audio";
import { defineSound } from "@web-kits/audio";

// ---------------------------------------------------------------------------
// gate
// ---------------------------------------------------------------------------
let enabled = false;

export function setTypeSoundsEnabled(next: boolean) {
  enabled = next;
}

// ---------------------------------------------------------------------------
// pitch
// ---------------------------------------------------------------------------

/** All synth defs are pitched at C4; play-time detune (cents) picks the note. */
const C4 = 261.63;
const cents = (semitones: number) => semitones * 100;

/** semitone offset from C4 for a note name in kit's `C5` / `G6` form */
const NOTE_SEMIS: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
function semitonesOf(note: string): number {
  const letter = note.slice(0, -1);
  const octave = Number(note.slice(-1));
  return (NOTE_SEMIS[letter] ?? 0) + (octave - 4) * 12;
}

/** kit's PENTATONIC (step advance) and CHORD (completion) scales */
const PENTATONIC = ["C", "D", "E", "G", "A"];
const CHORD = ["C", "E", "G", "B", "D"];
const MIN_OCTAVE = 4;
const MAX_OCTAVE = 6;
const COMPLETION_OCTAVE = 5;
const CHORD_WINDOW_MS = 140;

let lastNoteIndex: number | null = null;
let lastOctave: number | null = null;

/**
 * kit's getNextPentatonicNote: a random walk rather than a rotation. The first
 * note is anywhere in the scale; each one after moves up to two degrees and one
 * octave from the last, clamped to octaves 4-6. Stepping through a lesson
 * therefore meanders instead of cycling.
 */
function nextPentatonicSemis(): number {
  let index: number;
  let octave: number;
  if (lastNoteIndex === null || lastOctave === null) {
    index = Math.floor(Math.random() * PENTATONIC.length);
    octave = Math.floor(Math.random() * 3) + MIN_OCTAVE;
  } else {
    const stepBy = Math.floor(Math.random() * 5 - 2);
    index = (lastNoteIndex + stepBy + PENTATONIC.length) % PENTATONIC.length;
    const octaveBy = Math.floor(Math.random() * 3 - 1);
    octave = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, lastOctave + octaveBy));
  }
  lastNoteIndex = index;
  lastOctave = octave;
  return semitonesOf(`${PENTATONIC[index]}${octave}`);
}

let chordWindowStart: number | null = null;
let chordStep = 0;
let chordBaseIndex = 0;
let chordPointer = 0;

/**
 * kit's getCompletionNote. Notes landing inside the same 140ms window walk up
 * consecutive degrees of C-E-G-B-D and jump an octave from the third onward, so
 * a burst of completions voices a chord instead of a cluster.
 */
function nextCompletionSemis(): number {
  const now = Date.now();
  const inWindow =
    chordWindowStart !== null && now - chordWindowStart <= CHORD_WINDOW_MS;
  if (!inWindow) {
    chordWindowStart = now;
    chordStep = 0;
    chordBaseIndex = chordPointer % CHORD.length;
  }
  const degree = CHORD[(chordBaseIndex + chordStep) % CHORD.length];
  const octave = COMPLETION_OCTAVE + (chordStep >= 2 ? 1 : 0);
  chordStep++;
  chordPointer = (chordPointer + 1) % (CHORD.length * 4);
  return semitonesOf(`${degree}${octave}`);
}

// ---------------------------------------------------------------------------
// synths (oscillator + envelope values straight from the bundle)
// ---------------------------------------------------------------------------

/** kit: new Reverb({ decay: 2.5, wet: 0.3 }) on the master bus */
const REVERB = { type: "reverb", decay: 2.5, mix: 0.3 } as const;

const def = (d: SoundDefinition) => defineSound(d);

/** linkHoverSynth: the shortest voice, used for hovers and shift taps */
const synthHover = def({
  layers: [
    {
      source: { type: "sine", frequency: C4 },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 },
      gain: 0.25,
    },
  ],
  effects: [REVERB],
});

/** exampleAdvanceSynth: the step-change voice */
const synthAdvance = def({
  layers: [
    {
      source: { type: "sine", frequency: C4 },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.3 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

/** toggleSynth: the only triangle voice, so play/pause reads as a different timbre */
const synthToggle = def({
  layers: [
    {
      source: { type: "triangle", frequency: C4 },
      envelope: { attack: 0.002, decay: 0.1, sustain: 0.05, release: 0.2 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

/** completionSynth: the longest tail, for finishing a lesson */
const synthCompletion = def({
  layers: [
    {
      source: { type: "sine", frequency: C4 },
      envelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.8 },
      gain: 0.3,
    },
  ],
  effects: [REVERB],
});

// kit's master is -12dB; @web-kits/audio takes a linear volume, so the per-cue
// velocities below are his triggerAttackRelease velocities scaled by that.
const MASTER = 0.25;
const at = (velocity: number) => velocity * MASTER;

// ---------------------------------------------------------------------------
// public cues (names match kit's)
// ---------------------------------------------------------------------------
export const typeSounds = {
  /** G6 tick when the pointer enters a link */
  playLinkHover() {
    if (!enabled) return;
    synthHover({ detune: cents(semitonesOf("G6")), volume: at(0.2) });
  },

  /** the step-change note: a wandering pentatonic degree */
  playExampleAdvance() {
    if (!enabled) return;
    synthAdvance({ detune: cents(nextPentatonicSemis()), volume: at(0.3) });
  },

  /**
   * Two notes 150ms apart, rising to start and falling to stop, so the toggle
   * tells you which way it went without looking.
   */
  playToggle(on: boolean) {
    if (!enabled) return;
    const [first, second] = on ? ["E5", "C5"] : ["C5", "E5"];
    synthToggle({
      detune: cents(semitonesOf(first as string)),
      volume: at(0.5),
    });
    setTimeout(
      () =>
        synthToggle({
          detune: cents(semitonesOf(second as string)),
          volume: at(0.5),
        }),
      150,
    );
  },

  /** A6 on shift down, F6 on shift up */
  playShiftKeyPress() {
    if (!enabled) return;
    synthHover({ detune: cents(semitonesOf("A6")), volume: at(0.15) });
  },

  playShiftKeyRelease() {
    if (!enabled) return;
    synthHover({ detune: cents(semitonesOf("F6")), volume: at(0.15) });
  },

  /** the chord-window note played when a lesson reaches its last step */
  playCompletion() {
    if (!enabled) return;
    synthCompletion({ detune: cents(nextCompletionSemis()), volume: at(0.4) });
  },
};
