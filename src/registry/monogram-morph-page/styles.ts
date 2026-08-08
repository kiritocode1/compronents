/**
 * Scoped styles for `monogram-morph-page`.
 *
 * Everything sits under `.mmp` and every length is expressed in `cqw` rather
 * than `vw`, because the root declares `container-type: inline-size`. That way
 * the page scales to whatever box it is dropped into (a demo card, a fullscreen
 * preview, a route) instead of to the viewport. The container also becomes the
 * containing block for the absolutely positioned chrome, so the nav and the
 * wordmark stay inside the component rather than escaping to the document.
 *
 * The reference design is drawn at 1920 wide, so `1cqw` here reads as `19.2px`
 * at full bleed, which is how the source's `vw` figures were derived.
 */
export function getMonogramMorphPageStyles(): string {
  return `@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@200;300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

.mmp {
  --mmp-black: #302c27;
  --mmp-white: #ffffff;
  --mmp-bg-grey: #e8e6e3;
  --mmp-border: #c7c0b8;
  --mmp-yellow: #f0ff42;
  --mmp-green-yellow: #cadb00;
  --mmp-margin: 0.8333cqw;
  --mmp-columns: 12;
  --mmp-gap: 0cqw;
  --mmp-width: calc(100cqw - (2 * var(--mmp-margin)));
  /* The source sets everything, wordmark included, in PangeaAfrikan. That is a
     licensed face, so it leads the stack for anyone who has it and Hanken
     Grotesk backs it up: it is the only free grotesque that shares
     PangeaAfrikan's binocular double-storey g and matching double-storey a,
     which is what the letterforms are actually recognised by. */
  --mmp-sans: "PangeaAfrikan", "Hanken Grotesk", ui-sans-serif, system-ui,
    -apple-system, "Helvetica Neue", Arial, sans-serif;
  --mmp-mono: var(--font-geist-mono), ui-monospace, "SF Mono", Menlo, monospace;
  --mmp-serif: "Instrument Serif", "Times New Roman", Times, serif;

  container-type: inline-size;
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background-color: var(--mmp-white);
  color: var(--mmp-black);
  font-family: var(--mmp-sans);
  font-weight: 400;
  font-size: 0.8333cqw;
  line-height: 112%;
  -webkit-font-smoothing: antialiased;
}

.mmp *,
.mmp *::before,
.mmp *::after {
  box-sizing: border-box;
}

.mmp p,
.mmp h1,
.mmp h2,
.mmp h3,
.mmp ul,
.mmp li {
  margin: 0;
  padding: 0;
  font-size: inherit;
  font-weight: inherit;
  list-style: none;
}

.mmp a {
  color: inherit;
  text-decoration: none;
}

.mmp-grid {
  display: grid;
  grid-template-columns: repeat(var(--mmp-columns), minmax(0, 1fr));
  grid-gap: var(--mmp-gap);
  max-width: var(--mmp-width);
  margin-left: auto;
  margin-right: auto;
}

.mmp-h3 {
  font-size: 1.25cqw;
  line-height: 112%;
  letter-spacing: -0.02em;
}

.mmp-h4 {
  font-size: 1.0416cqw;
  line-height: 100%;
  letter-spacing: -0.02em;
}

.mmp-italic {
  font-family: var(--mmp-serif);
  font-style: italic;
  line-height: 150%;
}

/* Characters are pre-split in the markup so GSAP can stagger them without
   re-splitting on every route change. Words stay unbreakable. */
.mmp-word {
  display: inline-block;
  white-space: pre;
}

.mmp-char {
  display: inline-block;
  will-change: opacity;
}

/* ---------------------------------------------------------------- wordmark */

/* The morph layer sits behind the page content, exactly like the source's
   video overlay, and holds whichever word belongs to the current route. */
.mmp-morph {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.mmp-morph-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.mmp-morph-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  transform-origin: 50% 50%;
}

/* Halo and ink go through two separate goo filters rather than one. They have
   to: the ink is a hairline, and a hairline pushed through the halo's blur
   radius would just tint the yellow instead of surviving as the darker islands
   that show through the blob mid-melt. The ink runs at a fraction of the blur. */
.mmp-morph-layer {
  grid-area: 1 / 1;
  display: grid;
  place-items: center;
  width: 100%;
}

/* position: relative makes each glyph's offsetLeft read against its own word,
   which is what the morph measures its travel from. */
.mmp-morph-word {
  grid-area: 1 / 1;
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: center;
  white-space: pre;
  font-size: 17cqw;
  line-height: 1;
  /* Measured off the source: its stem is about 0.14 of its x-height, and the
     smear reaches roughly another 0.9 of a stem beyond the letter. A regular
     weight comes out half again as heavy, which leaves no room for the smear
     and the mark stops reading as lettering inside a body of colour. */
  font-weight: 200;
  letter-spacing: -0.03em;
  transform-origin: 50% 50%;
}

.mmp-morph-glyph {
  display: inline-block;
  will-change: transform;
}

/* The mark is two passes of the same word, and the order matters.
   Behind: a fat same-colour stroke, which under the goo becomes the bright
   puffy smear that fuses into one body when the letters crowd together. */
.mmp-morph-layer--halo .mmp-morph-word {
  color: var(--mmp-yellow);
  -webkit-text-stroke: 0.2em var(--mmp-yellow);
}

/* In front: the letterforms themselves, SOLID, at the face's own regular
   weight. Not an outline. The source's darker green is the filled glyph sitting
   inside the smear, so painting it as a hairline outline instead reads as a
   completely different mark. */
.mmp-morph-layer--ink .mmp-morph-word {
  color: var(--mmp-green-yellow);
  -webkit-text-stroke: 0;
}

/* -------------------------------------------------------------------- page */

.mmp-page {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.mmp-page > * {
  pointer-events: auto;
}

.mmp-header {
  padding-top: 1.4583cqw;
  align-items: start;
}

.mmp-header-left {
  grid-column: 1 / span 2;
}

.mmp-positions {
  width: 100%;
  display: flex;
  gap: 0.4166cqw;
}

.mmp-positions-list li {
  width: max-content;
}

.mmp-header-middle {
  grid-column: 9 / span 2;
}

.mmp-header-middle-title {
  margin-bottom: 0.8333cqw;
}

.mmp-header-middle-content {
  text-wrap: balance;
  max-width: 11.9791cqw;
}

.mmp-header-right {
  grid-column: 11 / span 2;
}

.mmp-header-right-title {
  margin-bottom: 0.8333cqw;
}

.mmp-header-right-content u {
  text-underline-offset: 0.15em;
}

/* --------------------------------------------------------------- route body */

.mmp-tags {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 18.2291cqw;
  width: calc(66.6666% - var(--mmp-margin) * 2);
  z-index: 2;
}

.mmp-tags-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.mmp-tag {
  position: absolute;
  top: 0;
  left: 0;
  width: fit-content;
  background-color: var(--mmp-bg-grey);
  border: 1px dashed var(--mmp-border);
  border-radius: 8px;
  padding: 0 0.4166cqw;
  height: 2.2916cqw;
  opacity: 0;
  display: flex;
  align-items: center;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.mmp-tag:active {
  cursor: grabbing;
}

.mmp-tag h3 {
  font-weight: 400;
  text-align: center;
  line-height: 1;
}

.mmp-listing {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(66.6666% - var(--mmp-margin) * 2);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.4166cqw;
}

/* Rows stay transparent on purpose. The mark is the page; filling these would
   bury it behind five grey slabs, so they carry a dashed rule only, the same
   hairline the tags use, and let the yellow read straight through. */
.mmp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4166cqw;
  background-color: transparent;
}

/* Each cell sits on the same grey plate with the same dashed rule as a tag.
   That is what keeps a row readable where it crosses the mark, and it means the
   inner routes speak the landing route's vocabulary rather than a second one. */
.mmp-row-cell {
  background-color: var(--mmp-bg-grey);
  border: 1px dashed var(--mmp-border);
  border-radius: 8px;
  padding: 0.15cqw 0.4166cqw 0.2cqw;
}

.mmp-row-index,
.mmp-row-meta {
  font-family: var(--mmp-mono);
  font-size: 0.8333cqw;
  white-space: nowrap;
}

.mmp-row-title {
  margin-right: auto;
}

/* --------------------------------------------------------------------- nav */

/* Exclusion + invert is how the source keeps the bottom bar readable as the
   yellow wordmark passes underneath it. */
.mmp-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  padding-bottom: 1.25cqw;
  mix-blend-mode: exclusion;
  filter: invert(100%);
}

.mmp-nav-inner {
  align-items: flex-end;
}

.mmp-nav-info {
  font-family: var(--mmp-mono);
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.0416cqw;
}

.mmp-nav-coords {
  font-size: 0.8333cqw;
  letter-spacing: 0.02em;
}

.mmp-clock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 50%;
  border: 1px solid var(--mmp-black);
  height: 3.3333cqw;
  min-width: 5.2cqw;
  padding: 0 0.703cqw;
  font-size: 1.25cqw;
  line-height: 112%;
  letter-spacing: -0.02em;
}

.mmp-clock-divider {
  padding: 0 0.1cqw;
}

.mmp-nav-list {
  grid-column: 1 / span 3;
}

.mmp-nav-list-wrap {
  display: flex;
  align-items: center;
  gap: 0.4166cqw;
}

.mmp-nav-item {
  position: relative;
  overflow: hidden;
  padding: 0.5208cqw 1.6666cqw 0.5208cqw 1.6145cqw;
  text-align: center;
  border: 1px solid var(--mmp-black);
  border-radius: 50%;
  background-color: transparent;
  color: var(--mmp-black);
  font-family: inherit;
  cursor: pointer;
}

.mmp-nav-item[aria-current="page"] {
  background-color: var(--mmp-black);
  color: var(--mmp-white);
}

/* The hover fill rolls up from below and flattens its corners on the way in,
   then rolls back down on the way out. */
.mmp-nav-item[aria-current="false"] {
  transition: color 0.5s cubic-bezier(0.4, 0, 0, 1);
}

.mmp-nav-item[aria-current="false"]::before,
.mmp-nav-item[aria-current="false"]::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--mmp-black);
  width: 100%;
  height: 100%;
  transition:
    transform 0.5s cubic-bezier(0.4, 0, 0, 1),
    border-radius 0.5s cubic-bezier(0.4, 0, 0, 1);
  z-index: -1;
}

.mmp-nav-item[aria-current="false"]::after {
  transform: translateY(100%);
  border-radius: 50% 50% 0 0;
}

.mmp-nav-item[aria-current="false"]::before {
  transform: translateY(-100%);
  border-radius: 0 0 50% 50%;
}

.mmp-nav-item[aria-current="false"]:hover {
  color: var(--mmp-white);
}

.mmp-nav-item[aria-current="false"]:hover::before,
.mmp-nav-item[aria-current="false"]:hover::after {
  border-radius: 0;
  transform: translateY(0);
  transition-duration: 0.5s, 0.9s;
}

.mmp-nav-socials {
  text-transform: uppercase;
  grid-column-start: 9;
  width: max-content;
}

.mmp-nav-socials-wrap,
.mmp-nav-works-wrap {
  display: flex;
  align-items: center;
  gap: 1.6666cqw;
}

.mmp-nav-works {
  text-transform: uppercase;
  grid-column-start: 12;
  margin-left: auto;
}

/* ------------------------------------------------------------------ loader */

/* No white curtain is needed: before the loader finishes, every character and
   every piece of nav chrome is simply not painted yet, so the morph plays on
   bare ground. Holding that in CSS (not just in GSAP) means there is no frame
   where the page flashes at full opacity before the boot effect runs. */
.mmp[data-booted="false"] .mmp-char,
.mmp[data-booted="false"] .mmp-nav-item,
.mmp[data-booted="false"] .mmp-clock,
.mmp[data-booted="false"] .mmp-row {
  opacity: 0;
}

/* ------------------------------------------------- narrow container layout */

@container (max-width: 1024px) {
  .mmp {
    --mmp-columns: 8;
    --mmp-gap: 0cqw;
    --mmp-margin: 2.3255cqw;
    font-size: 1.5625cqw;
  }

  .mmp-h3 {
    font-size: 2.34375cqw;
  }

  .mmp-h4 {
    font-size: 1.5625cqw;
  }

  .mmp-header-left {
    grid-column: 1 / span 3;
  }

  .mmp-header-middle {
    grid-column: 7 / span 1;
    margin-left: auto;
  }

  .mmp-header-right {
    grid-column: 8 / span 1;
    margin-left: auto;
  }

  .mmp-header-middle-content,
  .mmp-header-right-content {
    display: none;
  }

  .mmp-nav-socials {
    grid-column-start: 6;
  }

  .mmp-nav-works {
    grid-column-start: 8;
  }

  .mmp-tags,
  .mmp-listing {
    width: calc(87.5% - var(--mmp-margin) * 2);
  }

  .mmp-tags {
    height: 18.5546cqw;
  }

  .mmp-tag {
    padding: 0 0.78125cqw;
    height: 4.296875cqw;
  }

  .mmp-clock {
    height: 4.296875cqw;
  }

  .mmp-nav-item {
    padding: 0.5859cqw 2.734375cqw;
  }

  .mmp-morph-word {
    font-size: 17cqw;
  }
}

@container (max-width: 430px) {
  .mmp {
    --mmp-columns: 6;
    --mmp-gap: 2.7906cqw;
    --mmp-margin: 3.7209cqw;
    font-size: 3.7209cqw;
  }

  .mmp-h3 {
    font-size: 5.5813cqw;
  }

  .mmp-h4 {
    font-size: 3.7209cqw;
  }

  .mmp-header-left,
  .mmp-header-middle,
  .mmp-header-right {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-left: 0;
  }

  .mmp-header-middle {
    display: none;
  }

  .mmp-header-right {
    margin-top: 30px;
  }

  .mmp-nav-info {
    grid-row: 2;
    margin-top: 4.6511cqw;
    margin-bottom: 5.5813cqw;
  }

  .mmp-nav-list {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  .mmp-nav-list-wrap {
    justify-content: space-between;
    gap: 2.7906cqw;
  }

  .mmp-nav-item {
    padding: 1.6279cqw 2cqw 2.093cqw;
    width: 33.3333%;
  }

  .mmp-nav-socials {
    grid-column-start: 1;
  }

  .mmp-nav-works {
    grid-column: 5 / span 3;
  }

  .mmp-tags,
  .mmp-listing {
    width: calc(100% - var(--mmp-margin) * 2);
  }

  .mmp-tags {
    height: 39.5348cqw;
  }

  .mmp-tag {
    padding: 0 1.8604cqw;
    height: 10.2325cqw;
  }

  .mmp-clock {
    height: 10.2325cqw;
    font-size: 5.5813cqw;
  }

  .mmp-morph-word {
    font-size: 22cqw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mmp-char,
  .mmp-tag,
  .mmp-morph-word {
    transition: none !important;
  }
}
`;
}
