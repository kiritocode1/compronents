# Visual Types Guide

How to reproduce the type-set visualizations from
[types.kitlangton.com](https://types.kitlangton.com) ("Visual Types").

Unlike `visual-effect`, this one is **not open source**. Everything below was
reverse-engineered from the shipped bundle (`/assets/routes-*.js`, ~1MB
minified, no sourcemap) plus the stylesheet, so the values are the real ones
lifted out of the build, not guesses. The extraction lives in
`.types-analysis/` (raw bundle, beautified copy, and the lesson data pulled out
of it).

Companion to `docs/effect-visualization-guide.md`. Read that one first: this
vocabulary is **additive** to it. The card shell, the run/stop button, the step
ticks and the segmented control all come from the effect engine; what Visual
Types contributes is the type-stack vocabulary that goes inside.

## 1. The idea

Effect cards animate a **task through states**. Type cards animate a **type
morphing into another type**.

Each lesson is a list of steps. A step is a vertical column of *stacks* with
arrows between them, most often two:

```
┌───────────────────┐
│     boolean       │   the type
└───────────────────┘
          ↓
┌───────────────────┐
│  { true, false }  │   the set of values that inhabit it
└───────────────────┘
```

Step to step, the stacks morph. `boolean` becomes `Direction`, and
`{ true, false }` becomes `{ "north", "east", "south", "west" }`.

## 2. The one mechanic that matters

**Stable segment ids.** Everything else is chrome.

A type expression is tokenised into segments, each carrying an `id` derived from
its *structural role* plus an occurrence counter, never from its array index:

```
"red" | "blue"        ->  string-"red"-0 , union-0 , string-"blue"-0
"red" | "blue" | "green"  ->  string-"red"-0 , union-0 , string-"blue"-0 , union-1 , string-"green"-0
```

Those segments are rendered inside `<AnimatePresence mode="sync">` keyed by id.
So on a step change:

- a segment that **survives** keeps its key, is never unmounted, and simply
  slides as its neighbours resize;
- a segment that **enters** animates `width: 0 -> auto` while
  `blur(4px) -> blur(0)`;
- a segment that **leaves** collapses `width -> 0` and blurs back out.

Role-based ids are what make this work. If ids were positional, inserting
`| "green"` in the middle would renumber every token after it, and the whole
line would flicker instead of the one new member growing in.

`mode="sync"` is required: entering and leaving segments must animate together,
or the line jumps as it re-flows.

`src/lib/type-tokens.ts` holds the segmenter; `tests/type-tokens.test.mjs`
asserts the id stability, because that is the property that breaks silently.

## 3. Stack kinds

| kind | renders | used by |
|------|---------|---------|
| `expr` | a bare type expression in a box | set lessons (the type half) |
| `set` | the inhabitants as `{ a, b, c }` | set lessons (the values half) |
| `call` | `Name<Arg, Arg>`, optionally with per-member expansions | generics, conditionals, utility types |
| `result` | the evaluated type, or a compiler message | almost every lesson |
| `subset` | the Venn diagram for `A extends B` | Subtypes as Subsets |

An unnamed `call` (`name: ""`) renders its single argument bare, with no angle
brackets. That is how `keyof { a: number }` and `typeof point` are expressed:
they are calls whose name happens to be empty.

## 4. The tokenizer

A real (small) TypeScript type lexer, because the layout rules are what make a
type read correctly.

- **Lex** into whitespace / string / number / identifier / punctuation /
  operator. Multi-char operators (`=>`, `...`, `===`, `?.`, …) match
  longest-first.
- **Classify** identifiers: `PRIMITIVES` (`string`, `never`, `true`, …) →
  `typeLiteral`; `KEYWORDS` (`extends`, `infer`, `keyof`, `as`, …) →
  `typeKeyword`; a name in a key position → `parameterName`; anything else →
  `typeName`.
- **Parameter position** is the subtle one. An identifier is a parameter name
  when it is directly followed by `:` (or `?:`) inside a `{}` or `()`, when it
  follows `...` inside `()`, or when it is followed by `in` inside `[]`. That is
  what colours `name` in `{ name: string }` orange but `Person` purple.
- **Layout** collapses source whitespace and re-emits canonical spacing:
  `{a:number}` becomes `{ a: number }`, `string|number` becomes
  `string | number`.
- **Conditional vs property colon.** A `?` that is not an optional marker pushes
  its bracket depth onto a stack; the next `:` at that same depth pops it and is
  emitted as a spaced operator. This is what tells `T extends U ? X : Y` apart
  from `{ a: string }`.

### Theme (`github-dark`, the one the site actually ships)

```
typeKeyword   #F97583      valueString      #A5D6FF
typeName      #B392F0      valueNumber      #79B8FF
typeLiteral   #79B8FF      valueBoolean     #79B8FF
parameterName #FFAB70      valueKeyword     #FF7B72
operator      #F97583      valueConstructor #79C0FF
punctuation   #E1E4E8      valuePunctuation #E1E4E8
```

Five more themes ship in the bundle (`github-light`, `monokai`, `nord`,
`one-dark-pro`, `dracula`); only the two github ones are ported.

### One deliberate divergence

Kit's `NO_SPACE_BEFORE` set lists every operator that emits its own surrounding
spaces (`|`, `&`, `=>`) so the source whitespace does not double up, but omits
`=`. The result is that `K = "x"` renders as `K  = "x"`. Our port adds `=` to
the set. The conditional `?` escapes the same bug only by accident: its leading
space is a duplicate blank that the emitter already drops.

Kit's empty-object behaviour (`{}` renders `{ }`) is **kept** as-is; the lessons
only ever use `{}` as a value inside a set, never as a type, so it never shows.

## 5. Springs and chrome

```ts
fast   = { type:"spring", visualDuration:0.2, bounce:0 }
default= { type:"spring", visualDuration:0.3, bounce:0 }
smooth = { type:"spring", visualDuration:0.4, bounce:0 }   // segment morph
bouncy = { type:"spring", visualDuration:0.3, bounce:0.3 } // Venn circles
```

Segment exit uses `smooth` with `visualDuration` overridden to `0.2`, so tokens
leave faster than they arrive.

- **Borders** are two greys and nothing else: `#333333` while running,
  `#222222` at rest.
- **Result status** tints the box: neutral `rgb(10,10,10)`; success
  `rgb(12,29,18)` with border `rgba(34,197,94,0.35)`; error `rgb(34,20,20)` with
  border `rgba(248,113,113,0.35)`. Background and border cross-fade over 400ms.
- **Flash on change.** When a stack's contents change, a white overlay pulses
  `0 -> 0.05 -> 0` with `times [0, 50/1550, 1]` over 1.55s, linear. It reads as
  the box acknowledging the change rather than as a highlight.
- **Ghost stacks** (`border-dashed`) mark a branch that did not execute, e.g.
  the runtime stage of a step the type checker rejected.
- **Dot grid** behind the stacks is `pattern-dots-fine`: a 12px tile holding one
  `2px` square of `rgba(51,51,51,0.4)`. Five other patterns ship in the CSS
  (medium, large, grid, diagonal, line-grid, diagonal-lines) and are switchable
  from the site's nav; only the fine one is ported.

## 6. Definitions use shiki, not the segmenter

The snippet above the stacks (`const x: any = 5`, `type Pair<T> = [T, T]`) is a
**statement**, not a type expression. Kit renders those with a normal syntax
highlighter, and so do we: `highlight()` from `@/lib/shiki`, done server-side in
the page and passed down as HTML keyed by snippet.

Running statements through the type segmenter is the tempting shortcut and it is
wrong: the segmenter's layout rules only know about types, so assignments come
out mis-spaced.

## 7. Where it is used

There is no lessons section. The vocabulary exists so a **backend registry item**
can explain a type-level idea with the same engine that draws its runtime
behaviour, which is the only reason it was ported.

Two composition points:

- **As a variant** of a `VizEntry`, so a segmented control switches between a
  `flow` view and a `types` view of the same item.
  `effect-httpapi-derived-client` does this: two flow variants show the drift
  paging someone at 3am, and a third shows the compile error that prevents it.
- **Inline via `typeStacks` on a spec's `Base`**, rendered under the body and
  advanced by the same step clock, so no click is needed to see both.
  `effect-rpc-contract-transport` does this: nodes carry the call while the
  contract resolves underneath them.

Three stack shapes carry most of the weight:

- **subset** is the Venn diagram. Radii are a hand-tuned per-type lookup, not a
  function of cardinality; most of these sets are infinite so there is nothing
  to compute. Shapes are rounded rects rather than circles, which is what lets
  `any` animate its corner radius to 0 and become a square: the universal set
  reads as the box everything sits inside. The relationship (perfect overlap,
  containment either way, disjoint, partial) is inferred from the radii, and the
  overlap is hatched green or red through a masked circle. Labels sit outside
  the frame on leader lines drawn from each shape's edge.
- **result** with a `display` shows a compiler message instead of a type, tinted
  by status. That is how a `Property 'title' does not exist` step is drawn.
- **call** with `intermediateSteps` shows per-member evaluation as a column of
  muted mini rows, for anything that distributes.

## 8. Minimal reproduction checklist

1. Tokenise the type into segments with role-derived, occurrence-counted ids.
2. Render them in `<AnimatePresence mode="sync">` keyed by id, with
   `width: 0 <-> auto` and `blur(4px) <-> blur(0)` on enter/exit.
3. Box each stack; stack them vertically with a `PiArrowDownBold` between.
4. Flash the box white at 5% when its segment key changes.
5. Drive the step index off the effect engine's `useStepClock` + `Controls`.
6. Dot-grid the viz area; borders `#333` running, `#222` at rest.
7. Colour result boxes by status; dash the border for branches that did not run.

Get 1 and 2 right and it already reads as a Visual Types card. The rest is
chrome, and the chrome is already in `effect-viz.tsx`.
