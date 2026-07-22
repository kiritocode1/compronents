# Effect Visualization Guide

How to reproduce the animated effect cards from
[effect.kitlangton.com](https://effect.kitlangton.com) (Kit Langton's
`visual-effect`). Reverse-engineered from the open source
(`github.com/kitlangton/visual-effect`), not guessed. Every number below is the
real value.

## 1. The idea

Each card visualizes one Effect combinator as a small **state machine playing on
a loop**. A rounded square "node" represents a running task. It cycles through
states, and each state has its own motion:

```
idle ──▶ running ──▶ completed        (happy path)
                 └──▶ failed           (recoverable error)
                 └──▶ death            (unrecoverable defect)
                 └──▶ interrupted      (cancelled)
```

Multi-input combinators (`Effect.all`, `race`, `orElse`) show several input
nodes, an arrow, and a result node, and the states propagate between them.

## 2. Stack

- **Next.js** (app router) + React.
- **`motion/react`** (Framer Motion's successor) for all animation. Two APIs are
  used together: declarative `variants` for static per-state props, and
  imperative `MotionValue` + `animate()` for the twitchy stuff (jitter, glitch,
  flash, dynamic width).
- **`@phosphor-icons/react`** for the glyphs: `StarFourIcon` (the sparkle),
  `SkullIcon` (failure/death), `WarningOctagonIcon` (interrupt).
- Tailwind for card chrome only. The node itself is inline styles driven by
  motion values.

## 3. Card anatomy (`EffectExample`)

Outer card:

- `w-full flex flex-col border rounded-2xl shadow-2xl`
- Background gradient (normal mode):
  `linear-gradient(to bottom right, rgba(23,23,23,0.8), rgba(23,23,23,0.4))`
- Border: `rgba(64,64,64,0.5)`
- **Death mode** (whole card, when the effect dies): background
  `linear-gradient(to bottom right, black, rgba(127,29,29,0.2))`, border
  `rgba(127,29,29,0.5)`, and `box-shadow: 0 0 40px rgba(220,38,38,0.3)`.

Sections top to bottom, each separated by a `border-b`:

1. **Header** (`p-4`, bg `rgba(38,38,38,0.5)`): title (e.g. `Effect.succeed`) in
   bold monospace, optional `variant` chip (e.g. "short circuit"), and a muted
   description line.
2. **Visualization** (`px-4 py-5`): either a single node, or
   `inputs → ArrowRightIcon → result`, laid out with `flex gap-6`.
3. **Code block** (`p-4`): syntax-highlighted single line, e.g.
   `const value = Effect.succeed(42)`, with a **floating highlight** rectangle
   that slides to underline the token matching the currently-hovered node.

Hovering a node highlights its code token; the highlight lingers 500ms after
mouse-out before fading (feels intentional, not jumpy).

## 4. The node

A `64×64` rounded square. It is **two nested motion divs**:

- Outer: sets `width` (a spring motion value that auto-expands) and fixed height.
- Inner (`EffectContainer`): the visible box. `position: absolute`,
  `overflow: hidden`, `contain: layout style paint`, `willChange: transform,
  filter`, `translateZ(0)` (force a GPU layer). Border `1px solid
  rgba(255,255,255,0.1)` (death: `2px solid rgba(220,38,38,0.4)`).

### 4.1 State colors (`TASK_COLORS`)

| state | background | icon |
|-------|-----------|------|
| idle | `var(--color-slate-600)` @ opacity 0.6 | StarFour (sparkle) |
| running | `var(--color-blue-500)`, scale 0.95 | none (hidden) |
| completed | `var(--color-green-700)` | the result value |
| failed | `#ef4444` | Skull |
| death | `#991b1b` | red Skull (`#dc2626`) |
| interrupted | `var(--color-orange-500)` | WarningOctagon |

### 4.2 Spring presets (`animations.ts`) — exact values

```ts
// critically damped, snappy default used for most transitions
defaultSpring   = { type:"spring", mass:1, stiffness:200, damping:2*Math.sqrt(200) /*≈28.28*/, bounce:0 }

springs.default      = { type:"spring", stiffness:180, damping:25, mass:0.8 }
springs.bouncy       = { type:"spring", bounce:0.3, visualDuration:0.5 }
springs.nodeWidth    = { type:"spring", stiffness:180, damping:25, mass:0.8, visualDuration:0.6, bounce:0.3 }
springs.contentScale = { type:"spring", bounce:0.3, visualDuration:0.5, stiffness:260, damping:18 }
springs.failureBubble= { type:"spring", visualDuration:0.2, delay:0.05, bounce:0.3 }
```

Wrap the tree in `<MotionConfig transition={defaultSpring}>` so anything without
an explicit transition inherits the critically-damped feel.

### 4.3 Static per-state props via `variants`

Only `scale`, `opacity`, `backgroundColor` live in variants. Background color
transitions fast (`duration 0.1 easeInOut`); scale/opacity use `springs.default`
(or `springs.contentScale` for completed/failed/death so they pop):

```ts
idle:      { scale:1,    opacity:0.6, backgroundColor: slate600 }
running:   { scale:0.95, opacity:1,   backgroundColor: blue500 }
completed: { scale:1,    opacity:1,   backgroundColor: green700 }  // pop spring
failed:    { scale:1,    opacity:1,   backgroundColor: #ef4444 }   // pop spring
death:     { scale:1,    opacity:1,   backgroundColor: #991b1b }
interrupted:{ scale:1,   opacity:1,   backgroundColor: orange500 }
```

### 4.4 Everything twitchy is imperative (`MotionValue` + `animate`)

The hook `useEffectMotion()` creates these motion values:
`nodeWidth`(spring), `nodeHeight`, `contentOpacity`(spring), `flashOpacity`,
`flashColor`, `borderRadius`(spring), `rotation`, `shakeX`, `shakeY`,
`contentScale`(spring), `blurAmount`, `borderColor`, `borderOpacity`(spring),
`glowIntensity`(spring).

**The velocity → blur trick** (this is what makes the shake feel physical):

```ts
const rotationVelocity = useVelocity(rotation)
const blurAmount = useTransform(rotationVelocity, [-100, 0, 100], [1, 0, 1], { clamp:true })
// container filter: blur(min(blurAmount, 2)px) — box blurs only while spinning fast
```

Glow uses `box-shadow` (cheap), never `drop-shadow`:
`0 0 ${min(glow,8)}px rgba(100,200,255,0.2)`.

## 5. Per-state animation recipes

### Running (`useRunningAnimation`)

Four things at once, looping while running:

1. **Height shrink**: `nodeHeight` animates `64 → 25.6` (64×0.4), spring, bounce
   0.3. Node becomes a horizontal pill.
2. **Border radius**: snaps to `15` (a fat pill) instead of `8`.
3. **Border pulse**: `borderOpacity` `[1, 0.3, 1]` over 1.5s, `easeInOut`,
   `repeat: Infinity`.
4. **Glow pulse**: `glowIntensity` `[1, 5, 1]` over 0.5s, `repeat: Infinity`.
5. **Jitter** (RAF loop, each frame picks new targets):
   - `rotation` ← `±(rand*4 + 0.5)°`
   - `shakeX` ← `±(rand*1.5 + 0.5)px`
   - `shakeY` ← `±(rand*0.6 + 0.1)px`
   - each animated over a random `0.1–0.2s`, then the next frame is scheduled on
     `.finished`. Content opacity is 0 (nothing shown while running).

On stop: everything eases back to 0 over `0.3s` with `ease [0.4,0,0.6,1]`.

### Completion (`useEffectAnimations`)

1. **Flash**: `flashOpacity` `0 → 0.6` in `0.02s` (`circOut`), then `→ 0` over
   `1.0s` linear. A white overlay (`rgba(255,255,255,0.8)`) briefly whites out
   the box.
2. **Content pop**: `contentScale` set to 0, then animate `[1.3, 1]` with
   `springs.contentScale` — the result value overshoots then settles.
3. The result element itself enters with
   `{opacity:0, scale:0.5, filter:blur(10px)} → {1,1,blur(0)}`, bouncy spring
   (stiffness 260, damping 18).
4. **Auto-width**: after paint, measure `contentRef.scrollWidth`; if wider than
   `48px`, set `nodeWidth = actualWidth + 24`. The pill grows to fit "42",
   "Kaboom!", etc., via `springs.nodeWidth` (visible bounce).

### Failure (`useEffectAnimations` + `FailureBubble`)

1. **Shake sequence**: 6 iterations, each `0.08s`: `shakeX`, `shakeY` ←
   `±4px` (intensity 8, centered), `rotation` ← `±4°` (range 8). Then return to
   0 over `0.3s` easeOut.
2. Skull icon enters (`scale 0 blur(10) → 1 blur(0)`, spring bounce 0.3).
3. **FailureBubble** appears above the node: red `rgba(239,68,68,0.95)` pill with
   the error text (e.g. "Kaboom!") and a downward arrow. Enters
   `{opacity:0, scale:0.8, y:20, blur(5)} → {1,1,-5,blur(0)}` with
   `springs.failureBubble`, then does its own gentle 4× shake (`±4px`, offset up
   5px). Auto-hides after 1.5s unless hovered.

### Death (`useEffectAnimations`)

Unrecoverable defect. The whole card goes into death mode (see §3), plus:

1. **Same shake** as failure (count 6).
2. **Red skull** (`#dc2626`).
3. **Glitch loop**: 3 initial pulses — `contentScale` ← `1 + rand*0.2`,
   `glowIntensity` ← `rand*10`, held `20–70ms`, reset, paused `50–150ms` — then a
   subtle forever loop setting `glowIntensity` to `3 + rand*4` every
   `300–800ms`. Scheduled via `requestIdleCallback` to stay cheap.
4. Container filter adds `contrast(1.2) brightness(0.8)` and a red glow
   `0 0 ${glow*2}px rgba(220,38,38,0.8)`.
5. **DeathBubble** instead of FailureBubble.

### Interrupted

Orange background, WarningOctagon icon enters with a bouncier spring (bounce
0.5). No bubble, no glitch. Used for raced/timed-out/cancelled branches.

## 6. The sparkle & the logo

- **Node sparkle**: just `<StarFourIcon weight="fill" size={32} color="rgba(255,255,255,0.9)" />`
  (icon size = node size × 0.5). It enters `{scale:0, blur(10)} → {1, blur(0)}`,
  spring bounce 0.3.
- **Header logo** (`EffectLogo`): a custom layered SVG of the stacked-diamond
  Effect mark. Three `motion.path`/`motion.g` layers pulse on a 2s
  `easeInOut` infinite loop with staggered `delay: 0, 0.1, 0.2`, each with
  `drop-shadow(0 0 4px rgba(59,130,246,0.4))` (blue glow).

## 7. Multi-node layout

`inputs → arrow → result`:

```
flex flex-row items-center gap-6
  ├─ inputs:  flex flex-wrap gap-6  (one EffectNode each)
  ├─ arrow:   <ArrowRightIcon size={24} weight="fill" /> in text-neutral-500
  └─ result:  <EffectNode> (its own state machine)
```

Each node carries a small **label/timer** underneath (`0.75rem`, muted → secondary
color once it leaves idle), often an elapsed-ms `Timer`.

## 8. The full catalogue (every card + variant)

From `examples-manifest.ts`, grouped by section — this is the complete set on the
site, in order:

**Constructors** — `Effect.succeed` (always succeeds), `Effect.fail`
(recoverable error), `Effect.die` (unrecoverable defect), `Effect.sync`
(sync side-effect), `Effect.promise` (async, always succeeds), `Effect.sleep`
(suspend for a duration).

**Concurrency** — `Effect.all` (combine, structure-preserving), `Effect.race`
(first success wins), `Effect.raceAll` (first success of many), `Effect.forEach`
(run per element).

**Error handling** — `Effect.all` *variant: short circuit* (stop on first
error), `Effect.orElse` (fallback effect), `Effect.firstSuccessOf` (first success
sequentially), `Effect.timeout` (fail if too slow), `Effect.eventually` (retry
until success), `Effect.partition` (split successes/failures),
`Effect.validate` (accumulate errors).

**Schedule** — `Effect.repeat` *variant: spaced* (fixed delay),
`Effect.repeat` *variant: whileOutput* (repeat while condition),
`Effect.retry` *variant: recurs* (N times), `Effect.retry` *variant:
exponential* (backoff). These add a **schedule timeline** strip under the nodes.

**Ref** — `Ref.make` (concurrency-safe cell), `Ref.updateAndGet` (mutate + read).
These render a small ref box the effects read/write.

**Scope** — `Effect.addFinalizer` (register cleanup), `Effect.acquireRelease`
(acquire with guaranteed release). These render a **scope stack** showing
finalizers pushed/popped.

## 9. Minimal reproduction checklist

To clone the feel for one card:

1. A `state` you drive on a loop (`idle → running → …` on a timer).
2. `variants` for `{scale, opacity, backgroundColor}` per state.
3. `useSpring` for `width` + a `nodeHeight`/`borderRadius` you snap on run.
4. A RAF jitter loop for `rotation/shakeX/shakeY` while running.
5. `useVelocity(rotation) → blur` on the container filter.
6. Flash overlay on state change; content pop with `springs.contentScale`.
7. Phosphor `StarFour`/`Skull`/`WarningOctagon` for the glyph.
8. Auto-measure content width and grow the pill.
9. A shake sequence + tooltip bubble for failures.

Get 1–6 right and it already reads as "an Effect card." 7–9 are polish.
