/**
 * ASCII curtain page transition.
 *
 * Ported from the production view-transition module captured from
 * contentarchitecture.dev: a fixed full-viewport canvas that dissolves the
 * page behind a grid of flickering monospace glyphs, covers, hands control
 * back so the next view can mount, then reveals in the same grammar.
 *
 * Mechanics that matter, kept at the captured values:
 * - 12px x 17px nominal cell grid, recomputed on resize
 * - per-cell offset field: smoothstep-interpolated value noise on a 7x?
 *   lattice plus a small jitter, normalised into 0..0.88 so the wipe is
 *   organic rather than a straight edge
 * - a 12-step alpha atlas per glyph, so brightness is a texture lookup and
 *   never a per-cell fillText
 * - 720ms cover and reveal, collapsing to a 180ms opacity fade when the
 *   visitor prefers reduced motion
 */

const CURTAIN_CHARS = "01<>[]{}()/\\|=+*#%&$@!?;:.~01ABCDEF0123456789";
const ALPHA_STEPS = 12;
/** Per-cell edge softness: a cell fades in over 12% of the total progress. */
const EDGE_RAMP = 1 / 0.12;
const FILL_THRESHOLD = 0.35;
const GLYPH_CUTOFF = 0.02;
const CELL_WIDTH_HINT = 12;
const CELL_HEIGHT_HINT = 17;
const NOISE_LATTICE = 35;
const NOISE_STRIDE = 7;
const NOISE_COLUMNS = 6;
const NOISE_ROWS = 4;
const NOISE_JITTER = 0.08;
const OFFSET_CEILING = 0.88;
const DURATION_MS = 720;
const REDUCED_DURATION_MS = 180;

export type CurtainPhase = "idle" | "cover" | "reveal";

export interface CurtainOptions {
  onCoverComplete: () => void;
  onRevealComplete: () => void;
  isReducedMotion: () => boolean;
}

export interface CurtainHandle {
  setPhase: (phase: CurtainPhase) => void;
  destroy: () => void;
}

interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  cellWidth: number;
  cellHeight: number;
}

interface CurtainState {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  width: number;
  height: number;
  background: string;
  coverOffsets: Float32Array;
  revealOffsets: Float32Array;
  seeds: Uint16Array;
  flicker: Float32Array;
  atlas: GlyphAtlas | null;
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Value-noise field that decides when each cell flips. Normalised to
 * 0..OFFSET_CEILING so every cell still has ramp room left inside a 0..1
 * progress sweep.
 */
function createOffsetField(cols: number, rows: number) {
  const lattice = new Float32Array(NOISE_LATTICE);
  for (let i = 0; i < lattice.length; i++) lattice[i] = Math.random();

  const raw = new Float32Array(cols * rows);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const fx = (col / cols) * NOISE_COLUMNS;
      const fy = (row / rows) * NOISE_ROWS;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = smoothstep(fx - ix);
      const ty = smoothstep(fy - iy);
      const corner = NOISE_STRIDE * iy + ix;
      const top = lerp(lattice[corner] ?? 0, lattice[corner + 1] ?? 0, tx);
      const bottom = lerp(
        lattice[corner + NOISE_STRIDE] ?? 0,
        lattice[corner + NOISE_STRIDE + 1] ?? 0,
        tx,
      );
      const value =
        lerp(top, bottom, ty) + (Math.random() - 0.5) * NOISE_JITTER;
      raw[row * cols + col] = value;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  const span = max - min || 1;
  const offsets = new Float32Array(cols * rows);
  for (let i = 0; i < raw.length; i++) {
    offsets[i] = (((raw[i] ?? 0) - min) / span) * OFFSET_CEILING;
  }
  return offsets;
}

/**
 * One canvas holding every glyph at every alpha step. Drawing a cell is then
 * a single drawImage rather than a font fill, which is what keeps the wipe
 * cheap at a few thousand live cells.
 */
function createGlyphAtlas(
  color: string,
  cellWidth: number,
  cellHeight: number,
  fontSize: number,
  dpr: number,
): GlyphAtlas | null {
  const atlasCellWidth = Math.ceil(cellWidth * dpr);
  const atlasCellHeight = Math.ceil(cellHeight * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = atlasCellWidth * CURTAIN_CHARS.length;
  canvas.height = ALPHA_STEPS * atlasCellHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = `${Math.round(fontSize * dpr)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  for (let step = 0; step < ALPHA_STEPS; step++) {
    ctx.globalAlpha = (step + 1) / ALPHA_STEPS;
    const y = step * atlasCellHeight + atlasCellHeight / 2;
    for (let index = 0; index < CURTAIN_CHARS.length; index++) {
      ctx.fillText(
        CURTAIN_CHARS[index] ?? "0",
        index * atlasCellWidth + atlasCellWidth / 2,
        y,
      );
    }
  }
  ctx.globalAlpha = 1;
  return { canvas, cellWidth: atlasCellWidth, cellHeight: atlasCellHeight };
}

function createState(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): CurtainState {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cols = Math.max(1, Math.round(width / CELL_WIDTH_HINT));
  const rows = Math.max(1, Math.round(height / CELL_HEIGHT_HINT));
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const computed = getComputedStyle(canvas);
  const background =
    computed.getPropertyValue("--ascii-transition-bg").trim() || "#000000";
  const color =
    computed.getPropertyValue("--ascii-transition-color").trim() || "#ffffff";

  const cellCount = cols * rows;
  const seeds = new Uint16Array(cellCount);
  const flicker = new Float32Array(cellCount);
  for (let i = 0; i < cellCount; i++) {
    seeds[i] = Math.floor(Math.random() * 65536);
    flicker[i] = 70 + 120 * Math.random();
  }

  return {
    cols,
    rows,
    cellWidth,
    cellHeight,
    width,
    height,
    background,
    coverOffsets: createOffsetField(cols, rows),
    revealOffsets: createOffsetField(cols, rows),
    seeds,
    flicker,
    atlas: createGlyphAtlas(
      color,
      cellWidth,
      cellHeight,
      Math.round(0.86 * cellHeight),
      dpr,
    ),
  };
}

export function mountContentArchitectureCurtain(
  canvas: HTMLCanvasElement,
  options: CurtainOptions,
): CurtainHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { setPhase: () => {}, destroy: () => {} };
  }

  let state = createState(canvas, ctx);
  let phase: CurtainPhase = "idle";
  let frame: number | null = null;
  let needsResize = false;
  let coverStart = 0;
  let revealStart = 0;
  let coverFired = false;
  let revealFired = false;

  const onResize = () => {
    needsResize = true;
  };
  window.addEventListener("resize", onResize);

  /** Reduced-motion path: no glyphs, just the background fading in or out. */
  const drawFade = (current: CurtainPhase, progress: number) => {
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.globalAlpha = current === "cover" ? progress : 1 - progress;
    ctx.fillStyle = state.background;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.globalAlpha = 1;
  };

  const drawCurtain = (
    current: CurtainPhase,
    progress: number,
    time: number,
  ) => {
    const {
      cols,
      rows,
      cellWidth,
      cellHeight,
      width,
      height,
      background,
      seeds,
      flicker,
      atlas,
    } = state;
    const covering = current === "cover";
    const offsets = covering ? state.coverOffsets : state.revealOffsets;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = background;

    if (covering && progress >= 1) {
      ctx.fillRect(0, 0, width, height);
    } else {
      // Solid cells first, as one path, so the fill is a single rasterise.
      ctx.beginPath();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ramp = clamp01(
            (progress - (offsets[row * cols + col] ?? 0)) * EDGE_RAMP,
          );
          const opacity = covering ? ramp : 1 - ramp;
          if (opacity >= FILL_THRESHOLD) {
            ctx.rect(
              Math.floor(col * cellWidth),
              Math.floor(row * cellHeight),
              Math.ceil(cellWidth) + 1,
              Math.ceil(cellHeight) + 1,
            );
          }
        }
      }
      ctx.fill();
    }

    if (!atlas) return;

    const atlasWidth = atlas.cellWidth;
    const atlasHeight = atlas.cellHeight;
    const charCount = CURTAIN_CHARS.length;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const ramp = clamp01((progress - (offsets[index] ?? 0)) * EDGE_RAMP);
        const opacity = covering ? ramp : 1 - ramp;
        if (opacity <= GLYPH_CUTOFF) continue;

        const seed = seeds[index] ?? 0;
        // Each cell cycles its glyph on its own clock, so the field never
        // looks like one synchronised strobe.
        const tick = Math.floor((time + seed) / (flicker[index] || 100));
        const sparkle = (seed + tick) % 19 === 0;
        const shimmer =
          0.35 + 0.5 * (0.5 + 0.5 * Math.sin(0.004 * time + seed));
        const inTransit = ramp > 0 && ramp < 1;
        let step = Math.floor(
          clamp01(inTransit || sparkle ? 1 : shimmer) *
            clamp01(1.3 * opacity) *
            ALPHA_STEPS,
        );
        if (step <= 0) continue;
        if (step >= ALPHA_STEPS) step = ALPHA_STEPS - 1;

        const char = (seed + tick) % charCount;
        ctx.drawImage(
          atlas.canvas,
          char * atlasWidth,
          step * atlasHeight,
          atlasWidth,
          atlasHeight,
          col * cellWidth,
          row * cellHeight,
          cellWidth,
          cellHeight,
        );
      }
    }
  };

  const tick = (time: number) => {
    if (needsResize) {
      state = createState(canvas, ctx);
      needsResize = false;
    }
    const reduced = options.isReducedMotion();
    const duration = reduced ? REDUCED_DURATION_MS : DURATION_MS;

    if (phase === "cover") {
      const progress = clamp01((time - coverStart) / duration);
      if (reduced) drawFade("cover", progress);
      else drawCurtain("cover", progress, time);
      if (progress >= 1 && !coverFired) {
        coverFired = true;
        options.onCoverComplete();
      }
    } else if (phase === "reveal") {
      const progress = clamp01((time - revealStart) / duration);
      if (reduced) drawFade("reveal", progress);
      else drawCurtain("reveal", progress, time);
      if (progress >= 1 && !revealFired) {
        revealFired = true;
        options.onRevealComplete();
      }
    }

    if (phase === "idle") {
      frame = null;
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  return {
    setPhase(next) {
      phase = next;
      if (next === "idle") {
        if (frame !== null) {
          cancelAnimationFrame(frame);
          frame = null;
        }
        ctx.clearRect(0, 0, state.width, state.height);
        return;
      }
      if (next === "cover") {
        coverStart = performance.now();
        coverFired = false;
      }
      if (next === "reveal") {
        revealStart = performance.now();
        revealFired = false;
      }
      // Cancel-then-schedule rather than "schedule only if idle": a stale
      // frame id would otherwise leave the phase set with no loop driving it,
      // and the curtain would sit on screen forever.
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    },
    destroy() {
      window.removeEventListener("resize", onResize);
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    },
  };
}
