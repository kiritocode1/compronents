# Cursor synth for the agency site: patch.nrly.fun's music with nothing drawn

**Problem.** For the portfolio (agency repo, `brand-revamp`) you want the patch synth without the visuals: the Mist sound, and moving the mouse faster plays more.
**Result.** `createCursorSynth()`: one framework-free TS module (about 450 lines) that keeps the source's invisible lattice, cursor smoothing, speed-widened reach, click ripples and synth graph, mounted site-wide by a small client component next to `<Realtime />`.
**Proof.** Same seeded clock and the same 4-second mouse path (click, slow sweep, medium sweep, frantic zigzag) on the pinned source and the headless synth: **identical Web Audio logs for all four voices**: every note, node, ramp and start time.

## What is kept and what is cut

```
pointermove ─► smoothed cursor ─► reach = 2.2 cells × (1 + min(0.6, speed·0.02))
pointerdown ─► ripple ring at 8 cells/s          │
                                                 ▼
               per-cell spring E, join hysteresis 0.42 / 0.2
                                                 │ E > 0.52 (re-arm < 0.38)
                                                 ▼
  playVoice(i, j): one note per frame, ≥ 140 ms apart (Mist)
      └► pan by x ► bus 0.16 ► lowpass 2200 ► out (+ delay 0.27 s ⟲ 0.34, + 3.6 s reverb send)
```

Kept, unchanged: the 40px lattice over the viewport, every spring and smoothing constant, the pentatonic pitch map, all four voices (Mist by default), the bus, the delay, the generated reverb, the frame loop and its idle stepping.
Cut, because they only exist to be seen: the shader, fluid, ink, sockets, dot offsets, patching by drag, signal pulses, generators, hint pill and readout.

## Evidence

| voice | notes | log lines | headless vs source |
| --- | --- | --- | --- |
| Mist | 23 | 1197 | identical |
| Pluck | 48 | 1565 | identical |
| Bloop | 48 | 769 | identical |
| Acid | 48 | 1201 | identical |

How busy it gets (Mist, same path):

| movement | notes | rate |
| --- | --- | --- |
| slow sweep, 8 px a frame | 5 in 1.05 s | 4.8 / s |
| medium sweep, 30 px a frame | 4 in 0.57 s | 7.0 / s |
| frantic zigzag, ~90 px a frame | 2 in 0.40 s | 5.0 / s |

So faster movement does play more, up to the source's cap: Mist allows one note every 140 ms, about 7 a second, and a medium sweep already reaches it. You chose to keep that. `noteGap` lowers it if you later want frantic to keep climbing (0.07 doubles the ceiling).

Harness notes, so the result can be trusted: the source starts with its tiles pattern, so its run presses Clear before the viewport resize; the click sits off every diagonal so the source does not patch a cable; logs are compared from a marker after audio starts, with node ids renumbered. Scripts: `verify/synth.sh`, `verify/norm.py`, `verify/clock.js`, `verify/audio.js`. Logs: `evidence/synth/`.

Try it: https://fx-lab.compronents.localhost:1355/patch-cables/cursor-synth/ (click once, then move; `?voice=pluck|bloop|acid`).
How the music works, playable: https://fx-lab.compronents.localhost:1355/patch-cables/explainer/

## Files in blank-agency (brand-revamp)

| file | change |
| --- | --- |
| `lib/sound/cursor-synth.ts` | new: the module, copied from `.plannotator/patch-cables/cursor-synth/cursor-synth.ts` |
| `components/sound/cursor-synth.tsx` | new: `"use client"`, `useEffect(() => createCursorSynth().dispose, [])`, renders nothing |
| `app/layout.tsx` | add `<CursorSynth />` after `<Realtime />` |

No dependencies. I will not touch the branch's uncommitted files (`content/services.ts`, `next.config.ts`, `public/services/room/loop.js`, the new service videos). Checks: `npx tsc --noEmit`, `pnpm lint`, `pnpm build`, then the site in a browser with sound, and the same audio log on the real page. No commit unless you ask.

API:

```ts
const synth = createCursorSynth({ voice: "mist" }); // spacing 40, reach 2.2, smoothing 0.55,
synth.setEnabled(false);                            // trailDecay 1, ripples true, volume 0.16,
synth.setOptions({ noteGap: 0.1 });                 // noteGap 0.14 (Mist) / 0.05
synth.dispose();
```

## Decisions

1. **Whole viewport, not one element.** It listens on `window`, so the lattice covers the screen as the source's canvas did, and pitch follows screen position, not page position. Scrolling does not play notes.
2. **Sound starts on the first click or key press**, as in the source; browsers block audio before a gesture. Visitors who only hover hear nothing until they click once. `setEnabled` is there for a sound toggle; I am not adding toggle UI now.
3. **No visual patching.** A click still sends the ripple ring of notes; a drag no longer patches cables, since nobody can see them.
4. **The `patch-cables` registry component** (visual port, 0-pixel diff, in `.plannotator/patch-cables/`) stays parked. Say if you still want it in the registry.

## Limits

- Verified in headless Chrome at 1440×900 with a scripted mouse. I have not listened on a real device, tested Safari or touch, or tested `prefers-reduced-motion` (which the source handles with a different spring and so slightly different timing).
- Once the cursor leaves the window, the source keeps stepping because its fluid and dot animations are still settling; the headless loop has no visuals, so it drops to every fourth frame sooner. That only shifts the release of cells after the cursor is gone, when no notes play.
