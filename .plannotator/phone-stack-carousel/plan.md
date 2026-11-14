# Phone Stack Carousel: phonestackcarousel.framer.website, 1:1

**Problem.** The Framer page has a phone mockup that rides a spring through a fanned stack of slides. You want it as a registry component.
**Result.** `phone-stack-carousel`: a typed React port of the page's Framer code component. It is plain DOM and CSS with no dependencies and no iframe.
**Proof.** Both pages ran on the same frozen clock and got the same keypress. RMSE against the live site is 0.0011 to 0.0023 (under 0.6/255) across the settled state and 7 frames of a transition.

## How the source works (pinned in `reference/phone-stack-carousel/carousel.pretty.js`)

```
goal (autoplay 3.2s, drag/flick, wheel, arrows, card click)
  └─► spring: k 110, ζ 1, 3 substeps/frame ──► pos
        ├─► cards: x = first + (|d|-1)·step, scale 1-0.08|d|, dim 0.45·|d|/3, rotateY = -vel·2.4 (±6°)
        └─► screen: frac(pos) → sine ease → 60-point circle from the right edge,
                     radius wobble 0.11·sin(πt) (two harmonics), outgoing slide scales to 0.93 and dims
```

- Every length is `calc(var(--u) * n)` with `--u = min(1cqh, 1.95cqw)` on a size container, so the scene scales with the component box.
- The phone is about 15 stacked divs (band gradient, seam, glass, screen, island, keys, notches, rim), with no images.
- It runs only while on screen and with the tab visible. Under reduced motion it snaps and stops autoplay.

## Evidence: source (top) vs port (bottom), 1200×800

Settled, frame 12 after ArrowRight, frame 90.

![strip](evidence/strip.png)

| state | RMSE |
| --- | --- |
| settled | 0.0023 |
| f004 | 0.0017 |
| f008 | 0.0014 |
| f012 | 0.0011 |
| f018 | 0.0012 |
| f026 | 0.0013 |
| f040 | 0.0014 |
| f090 | 0.0014 |

Method: `verify/clock.js` replaces `performance.now` and `requestAnimationFrame` with a manual clock after `__freeze()`, drops the 3.2s autoplay timer and holds every video at 1.0s. `verify/capture.sh` drives both pages through agent-browser and runs `magick compare`. The Framer badge is hidden on the source. As a control, source settled vs source f012 is 0.244, so the frames do move.

## Files (after approval)

| file | change |
| --- | --- |
| `src/registry/phone-stack-carousel.tsx` | the port from this folder |
| `src/components/demos/…`, `previews/…` + both `index.tsx` | demo (680px tall) and fullscreen preview |
| `src/lib/registry.ts`, `registry-groups.ts`, `component-meta.ts`, `assets.ts` | entry, group, props docs, 8 Blob assets |
| Blob `phone-stack-carousel/*` | the page's 5 images and 3 videos (2.4 MB, 0.3 MB, 5.8 MB), renamed by slide title |

## Decisions

1. **Defaults are the live page's settings, not the code component's.** The page sets ink finish, no status bar, no dots and a white backdrop. The code's own defaults are obsidian, status bar on, dots on and `#08080A`. The demo should look like the page you linked, so the port uses the page values. Every other look is still available as a prop.
2. **Slide media.** The plan is to upload the page's own 8 media files to Blob so the default matches. That is about 10 MB, mostly the two longer videos.

## Omissions and limits

- Framer's static canvas renderer (`ro` in the source) is left out. It only draws a still in the Framer editor.
- The props are grouped the same way as Framer's property controls (`device`, `cards`, `motion`, `surface`, `indicator`), and those groups are typed objects.
- Input was diffed under the same frozen clock (`verify/input.sh`, `evidence/input-strip.png`). A 10-frame 340px drag left scored 0.0008, a 700px wheel 0.0004 and a click on the second card left 0.0005. All three land on the same slide as the source. A real-time run could not decide this, because flick velocity depends on event timing and the two pages run at different speeds headless.
