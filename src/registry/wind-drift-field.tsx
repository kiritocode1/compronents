"use client";

/**
 * Wind Drift Field - still air you stir with the pointer, running on a real
 * fluid solver rather than a painted force field. Fourteen thousand tracers
 * ride the velocity field and leave trails that fade back into the paper, and
 * every trail is coloured by the speed of the air carrying it, so a slow eddy
 * stays green and a hard sweep burns red.
 *
 * The air is a Stable Fluids grid, and the three steps in its loop are what
 * make it read as wind instead of as blobs:
 *
 *  - Self-advection carries the velocity field along itself, so momentum keeps
 *    travelling after your hand stops. A stroke does not sit where you drew it;
 *    it moves downstream and stretches.
 *  - Pressure projection removes divergence every frame by solving a Poisson
 *    equation and subtracting the gradient. This is the step that makes air
 *    behave like a fluid: without it, velocity is created and destroyed in
 *    place, which is exactly what a stamped gust looks like. With it, air pushed
 *    out of one place has to go somewhere, so a stroke rolls up into vortices
 *    at its ends and the flow curves around itself.
 *  - Vorticity confinement puts back the small swirls the solver's own
 *    interpolation smears away, which is what keeps the wake alive and turbulent
 *    rather than dissolving into a smooth smear.
 *
 * Nothing moves on its own. With the field at rest a tracer draws a zero-length
 * segment and the buffer keeps fading, so the surface sits empty until it is
 * touched, and once the kinetic energy decays away the loop parks itself until
 * the pointer moves again.
 *
 * The trail is a ping-pong pair of framebuffers: each frame the previous one is
 * mixed toward the background colour and the new segments are drawn over it, so
 * a trail is never stored as history, only as what is left of the last frame.
 *
 * One WebGL canvas, no library and no asset required.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef, useState } from "react";

export interface WindDriftFieldProps {
  /** Trail colours from stillest to fastest air, as hex. The ramp is sampled
   *  continuously, so intermediate speeds blend between neighbours. */
  palette?: string[];
  /** Field colour. Trails fade into this rather than to black. */
  background?: string;
  /** Tracers on the field. */
  particleCount?: number;
  /** Even background breeze as [x, y], in field units per second. Zero, the
   *  default, means nothing moves until the pointer moves. */
  drift?: [number, number];
  /** How far a tracer travels per unit of air speed. */
  flowSpeed?: number;
  /** How hard a pointer sweep pushes the air. */
  gustStrength?: number;
  /** Small-swirl recovery, 0 to 1, as a fraction of the energy viscosity is
   *  removing. Higher keeps a wake turbulent for longer; zero lets the solver
   *  smooth it into a smear. It cannot exceed the damping, so the air always
   *  comes to rest. */
  turbulence?: number;
  /** Velocity kept per frame. Lower brings the air to rest sooner. */
  viscosity?: number;
  /** Draw a survey grid over the field. */
  showGrid?: boolean;
  /** Content rendered above the field. */
  children?: React.ReactNode;
  className?: string;
}

/** Green in a slow eddy, red in a hard sweep. Sampled continuously by speed. */
const DEFAULT_PALETTE = [
  "#1f5c3a",
  "#2e7d3f",
  "#4f9c3c",
  "#84b53c",
  "#c2c33f",
  "#d89a3a",
  "#d2632f",
  "#c43330",
];

const DEFAULT_BACKGROUND = "#0a121b";

/** The trail buffer is a full-screen texture and the tracers are 1px lines, so
 *  there is nothing a second device pixel would resolve. */
const MAX_DPR = 1;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;
const DT = 1 / TARGET_FPS;

/** Fraction of the trail buffer replaced by background colour each frame. */
const ERASE = 0.07;
const LINE_ALPHA = 0.54;

const LIFE_MIN = 1.15;
const LIFE_MAX = 3.9;

/** Interior rows of the fluid grid. Columns follow from the aspect so cells stay
 *  square, which is what lets one cell size serve both axes in the solver. */
const FLUID_ROWS = 72;
/** Cap on interior columns, so an ultrawide viewport cannot walk the per-frame
 *  cost up without limit. */
const FLUID_MAX_COLS = 190;

/** Jacobi sweeps in the pressure solve. This is the single biggest cost in the
 *  frame and the single biggest contributor to the flow looking like air: too
 *  few and divergence survives, which shows up as the flow visibly appearing
 *  and vanishing in place. */
const PROJECT_ITERATIONS = 20;

/** Radius of a pointer splat, in field units. */
const SPLAT_RADIUS = 0.055;
/** Pointer travel converted to velocity. */
const SPLAT_FORCE = 16;
/** Ceiling on a single splat's speed, so one enormous pointer jump cannot
 *  inject a velocity the solver has to spend the next second unwinding. */
const SPLAT_MAX_SPEED = 2.6;

/** Kinetic energy below which the air counts as still. */
const STILL_ENERGY = 4e-5;

/** Air speed that saturates the top of the palette. Measured against the live
 *  solver rather than guessed. The ramp is walked on speed, not speed squared,
 *  so the low end is not crushed into a single colour. */
const SPEED_COLOR_MAX = 1.15;

const QUAD_VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** u_mode 1 fades the buffer toward the background, 0 blits it untouched. */
const QUAD_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec3 u_bg;
uniform float u_keep;
uniform float u_mode;
varying vec2 v_uv;
void main() {
    vec3 c = texture2D(u_tex, v_uv).rgb;
    vec3 faded = mix(u_bg, c, u_keep);
    vec3 outColor = mix(c, faded, u_mode);
    gl_FragColor = vec4(outColor, 1.0);
}
`;

/** Field space is x in [0, aspect], y in [0, 1], y down. */
const LINE_VERT = `
attribute vec2 a_pos;
attribute vec4 a_color;
uniform float u_aspect;
varying vec4 v_color;
void main() {
    float x = (a_pos.x / u_aspect) * 2.0 - 1.0;
    float y = 1.0 - a_pos.y * 2.0;
    gl_Position = vec4(x, y, 0.0, 1.0);
    v_color = a_color;
}
`;

const LINE_FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
    gl_FragColor = v_color;
}
`;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function WindDriftField({
  palette = DEFAULT_PALETTE,
  background = DEFAULT_BACKGROUND,
  particleCount = 14000,
  drift = [0, 0],
  flowSpeed = 2.9,
  gustStrength = 1,
  turbulence = 0.6,
  viscosity = 0.96,
  showGrid = false,
  children,
  className,
}: WindDriftFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Bumped on context restore, which re-runs the effect and rebuilds every GL
  // object. A lost context invalidates all of them, and a component may never
  // reload the page it lives on to recover.
  const [generation, setGeneration] = useState(0);

  const liveRef = useRef({
    gustStrength,
    flowSpeed,
    drift,
    turbulence,
    viscosity,
  });
  liveRef.current = { gustStrength, flowSpeed, drift, turbulence, viscosity };

  const paletteKey = palette.join(",");

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const COUNT = Math.max(1, Math.floor(particleCount));
    const COLORS = palette.map(hexToRgb);
    const NBINS = COLORS.length;
    const bgRgb = hexToRgb(background);

    // ---- shader plumbing -------------------------------------------------

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader.");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(
          gl.getShaderInfoLog(shader) || "Shader compile failed.",
        );
      }
      return shader;
    };

    const createProgram = (vs: string, fs: string) => {
      const program = gl.createProgram();
      if (!program) throw new Error("Could not create program.");
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
          gl.getProgramInfoLog(program) || "Program link failed.",
        );
      }
      return program;
    };

    const quadProgram = createProgram(QUAD_VERT, QUAD_FRAG);
    const lineProgram = createProgram(LINE_VERT, LINE_FRAG);

    const quad = {
      buffer: gl.createBuffer(),
      aPos: gl.getAttribLocation(quadProgram, "a_pos"),
      uTex: gl.getUniformLocation(quadProgram, "u_tex"),
      uBg: gl.getUniformLocation(quadProgram, "u_bg"),
      uKeep: gl.getUniformLocation(quadProgram, "u_keep"),
      uMode: gl.getUniformLocation(quadProgram, "u_mode"),
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const linePositions = new Float32Array(COUNT * 4);
    const lineColors = new Float32Array(COUNT * 8);

    const lines = {
      positionBuffer: gl.createBuffer(),
      colorBuffer: gl.createBuffer(),
      aPos: gl.getAttribLocation(lineProgram, "a_pos"),
      aColor: gl.getAttribLocation(lineProgram, "a_color"),
      uAspect: gl.getUniformLocation(lineProgram, "u_aspect"),
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, lines.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, linePositions.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, lines.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineColors.byteLength, gl.DYNAMIC_DRAW);

    // ---- tracers ---------------------------------------------------------

    const xs = new Float32Array(COUNT);
    const ys = new Float32Array(COUNT);
    const ages = new Float32Array(COUNT);
    const lifes = new Float32Array(COUNT);

    // ---- fluid grid ------------------------------------------------------
    //
    // One cell of padding on every side holds the boundary condition, so the
    // interior is 1..W by 1..H and setBnd only ever touches the ring.

    let W = 2;
    let H = 2;
    let stride = 4;
    /** Cell size in field units. Cells are square, so one number serves both. */
    let cell = 0.5;

    let u = new Float32Array(1);
    let v = new Float32Array(1);
    let u0 = new Float32Array(1);
    let v0 = new Float32Array(1);
    let pressure = new Float32Array(1);
    let divergence = new Float32Array(1);
    let curl = new Float32Array(1);

    /** Kinetic energy of the whole field, refreshed by the dissipation pass. */
    let energy = 0;

    const state = {
      w: 1,
      h: 1,
      dpr: 1,
      pw: 1,
      ph: 1,
      aspect: 1,
      sampleU: 0,
      sampleV: 0,
      sampleSpeedSq: 0,
      running: true,
      rafId: 0,
      contextLost: false,
      lastStep: 0,
      pointerX: 0,
      pointerY: 0,
      pointerActive: false,
      texA: null as WebGLTexture | null,
      texB: null as WebGLTexture | null,
      fboA: null as WebGLFramebuffer | null,
      fboB: null as WebGLFramebuffer | null,
      read: {
        tex: null as WebGLTexture | null,
        fbo: null as WebGLFramebuffer | null,
      },
      write: {
        tex: null as WebGLTexture | null,
        fbo: null as WebGLFramebuffer | null,
      },
    };

    const allocateFluid = () => {
      H = FLUID_ROWS;
      W = clamp(Math.round(FLUID_ROWS * state.aspect), 2, FLUID_MAX_COLS);
      stride = W + 2;
      // The grid spans 1 unit of height across H cells. Columns are derived
      // from the aspect, so a cell is square to within one rounding step and
      // the solver can use a single h.
      cell = 1 / H;

      const total = stride * (H + 2);
      u = new Float32Array(total);
      v = new Float32Array(total);
      u0 = new Float32Array(total);
      v0 = new Float32Array(total);
      pressure = new Float32Array(total);
      divergence = new Float32Array(total);
      curl = new Float32Array(total);
      energy = 0;
    };

    /**
     * Boundary ring. kind 1 mirrors the x component against the side walls and
     * kind 2 mirrors the y component against the top and bottom, which is what
     * makes the walls solid: air slides along them instead of through them.
     * kind 0 simply copies, for scalars like pressure.
     */
    const setBnd = (kind: number, field: Float32Array) => {
      for (let j = 1; j <= H; j++) {
        const row = j * stride;
        field[row] = kind === 1 ? -field[row + 1] : field[row + 1];
        field[row + W + 1] = kind === 1 ? -field[row + W] : field[row + W];
      }
      const top = 0;
      const bottom = (H + 1) * stride;
      for (let i = 1; i <= W; i++) {
        field[top + i] = kind === 2 ? -field[stride + i] : field[stride + i];
        field[bottom + i] =
          kind === 2 ? -field[H * stride + i] : field[H * stride + i];
      }
      field[0] = 0.5 * (field[1] + field[stride]);
      field[W + 1] = 0.5 * (field[W] + field[stride + W + 1]);
      field[bottom] = 0.5 * (field[bottom + 1] + field[H * stride]);
      field[bottom + W + 1] =
        0.5 * (field[bottom + W] + field[H * stride + W + 1]);
    };

    /**
     * Semi-Lagrangian advection: for each cell, walk backwards along the
     * velocity there and read what used to be at that spot. Unconditionally
     * stable at any step size, which is the whole reason this solver can run at
     * a fixed 30fps step without exploding.
     */
    const advect = (
      kind: number,
      dst: Float32Array,
      src: Float32Array,
      dt: number,
    ) => {
      // Velocity is in field units per second; dividing by the cell size turns
      // a displacement into a number of cells.
      const scale = dt / cell;

      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          const p = j * stride + i;
          let x = i - scale * u[p];
          let y = j - scale * v[p];

          if (x < 0.5) x = 0.5;
          else if (x > W + 0.5) x = W + 0.5;
          if (y < 0.5) y = 0.5;
          else if (y > H + 0.5) y = H + 0.5;

          const i0 = x | 0;
          const j0 = y | 0;
          const s1 = x - i0;
          const s0 = 1 - s1;
          const t1 = y - j0;
          const t0 = 1 - t1;

          const a = j0 * stride + i0;
          const b = a + stride;

          dst[p] =
            s0 * (t0 * src[a] + t1 * src[b]) +
            s1 * (t0 * src[a + 1] + t1 * src[b + 1]);
        }
      }
      setBnd(kind, dst);
    };

    /**
     * Pressure projection. Divergence is what a stamped force field leaves
     * behind: air appearing out of nothing in one cell and vanishing in
     * another. Solving for the pressure whose gradient cancels that divergence,
     * then subtracting it, is what turns a pushed field into a flowing one.
     */
    const project = () => {
      const half = -0.5 * cell;

      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          const p = j * stride + i;
          divergence[p] =
            half * (u[p + 1] - u[p - 1] + v[p + stride] - v[p - stride]);
          pressure[p] = 0;
        }
      }
      setBnd(0, divergence);
      setBnd(0, pressure);

      for (let k = 0; k < PROJECT_ITERATIONS; k++) {
        for (let j = 1; j <= H; j++) {
          for (let i = 1; i <= W; i++) {
            const p = j * stride + i;
            pressure[p] =
              (divergence[p] +
                pressure[p - 1] +
                pressure[p + 1] +
                pressure[p - stride] +
                pressure[p + stride]) *
              0.25;
          }
        }
        setBnd(0, pressure);
      }

      const grad = 0.5 / cell;
      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          const p = j * stride + i;
          u[p] -= grad * (pressure[p + 1] - pressure[p - 1]);
          v[p] -= grad * (pressure[p + stride] - pressure[p - stride]);
        }
      }
      setBnd(1, u);
      setBnd(2, v);
    };

    /**
     * Vorticity confinement. Advection is diffusive, so the small eddies that
     * make a wake look like air get smeared out within a second. This measures
     * the curl that is left, finds which way it is concentrating, and pushes
     * along that gradient to feed the swirl back rather than letting it flatten.
     */
    const confineVorticity = (gain: number) => {
      if (gain <= 0) return;
      const half = 0.5 / cell;

      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          const p = j * stride + i;
          curl[p] =
            half * (v[p + 1] - v[p - 1] - (u[p + stride] - u[p - stride]));
        }
      }

      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          const p = j * stride + i;
          const dx = 0.5 * (Math.abs(curl[p + 1]) - Math.abs(curl[p - 1]));
          const dy =
            0.5 * (Math.abs(curl[p + stride]) - Math.abs(curl[p - stride]));
          const len = Math.sqrt(dx * dx + dy * dy) + 1e-6;
          const scale = (gain * cell * curl[p]) / len;
          u[p] += dy * scale;
          v[p] -= dx * scale;
        }
      }
      setBnd(1, u);
      setBnd(2, v);
    };

    /** Bleed off velocity so the air comes to rest, and total the kinetic
     *  energy on the way through since the pass is already touching every cell. */
    const dissipate = (keep: number) => {
      let sum = 0;
      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          const p = j * stride + i;
          const nu = u[p] * keep;
          const nv = v[p] * keep;
          u[p] = nu;
          v[p] = nv;
          sum += nu * nu + nv * nv;
        }
      }
      energy = sum / (W * H);
    };

    /** Push a stroke of air in at the pointer. Splatting into the velocity
     *  field is the only input the fluid ever gets; everything else the flow
     *  does afterwards is the solver's. */
    const splat = (x: number, y: number, fx: number, fy: number) => {
      const gx = (x / state.aspect) * W + 0.5;
      const gy = y * H + 0.5;
      const radius = SPLAT_RADIUS / cell;
      const r2 = 2 * radius * radius;
      const reach = Math.ceil(radius * 2.5);

      const i0 = Math.max(1, Math.floor(gx) - reach);
      const i1 = Math.min(W, Math.ceil(gx) + reach);
      const j0 = Math.max(1, Math.floor(gy) - reach);
      const j1 = Math.min(H, Math.ceil(gy) + reach);

      for (let j = j0; j <= j1; j++) {
        const dy = j - gy;
        const row = j * stride;
        for (let i = i0; i <= i1; i++) {
          const dx = i - gx;
          const falloff = Math.exp(-(dx * dx + dy * dy) / r2);
          if (falloff < 0.01) continue;
          u[row + i] += fx * falloff;
          v[row + i] += fy * falloff;
        }
      }
    };

    const stepFluid = (dt: number) => {
      const live = liveRef.current;
      const keep = clamp(live.viscosity, 0, 1);
      // Vorticity confinement adds energy, which is the point: it feeds the
      // small swirls back. Left free it also adds MORE than viscosity removes,
      // and the field then churns forever instead of settling. Capping the gain
      // at half the damping headroom makes coming to rest a property of the
      // solver rather than a lucky pair of constants.
      const gain = clamp(live.turbulence, 0, 1) * (1 - keep) * 0.5;

      confineVorticity(gain);
      project();

      u0.set(u);
      v0.set(v);
      advect(1, u, u0, dt);
      advect(2, v, v0, dt);

      project();
      dissipate(keep);
    };

    // ---- sampling and tracers --------------------------------------------

    const sampleField = (fx: number, fy: number) => {
      const gx = clamp((fx / state.aspect) * W + 0.5, 0.5, W + 0.5);
      const gy = clamp(fy * H + 0.5, 0.5, H + 0.5);
      const i0 = gx | 0;
      const j0 = gy | 0;
      const s1 = gx - i0;
      const s0 = 1 - s1;
      const t1 = gy - j0;
      const t0 = 1 - t1;

      const a = j0 * stride + i0;
      const b = a + stride;

      const su =
        s0 * (t0 * u[a] + t1 * u[b]) + s1 * (t0 * u[a + 1] + t1 * u[b + 1]);
      const sv =
        s0 * (t0 * v[a] + t1 * v[b]) + s1 * (t0 * v[a + 1] + t1 * v[b + 1]);

      const live = liveRef.current;
      state.sampleU = su + live.drift[0];
      state.sampleV = sv + live.drift[1];
      state.sampleSpeedSq =
        state.sampleU * state.sampleU + state.sampleV * state.sampleV;
    };

    const spawn = (i: number) => {
      xs[i] = rand(0, state.aspect);
      ys[i] = rand(0, 1);
      ages[i] = rand(0, LIFE_MAX);
      lifes[i] = rand(LIFE_MIN, LIFE_MAX);
    };

    const writeLineColor = (offset: number, sp2: number) => {
      const scaled =
        clamp(Math.sqrt(sp2) / SPEED_COLOR_MAX, 0, 1) * (NBINS - 1);
      const idx = scaled | 0;
      const next = idx < NBINS - 1 ? idx + 1 : idx;
      const mix = scaled - idx;
      const c0 = COLORS[idx];
      const c1 = COLORS[next];
      const r = c0[0] + (c1[0] - c0[0]) * mix;
      const g = c0[1] + (c1[1] - c0[1]) * mix;
      const b = c0[2] + (c1[2] - c0[2]) * mix;

      let o = offset;
      lineColors[o++] = r;
      lineColors[o++] = g;
      lineColors[o++] = b;
      lineColors[o++] = LINE_ALPHA;
      lineColors[o++] = r;
      lineColors[o++] = g;
      lineColors[o++] = b;
      lineColors[o++] = LINE_ALPHA;
      return o;
    };

    const simulate = (dt: number) => {
      const aspect = state.aspect;
      const speed = liveRef.current.flowSpeed;
      let vp = 0;
      let cp = 0;

      for (let i = 0; i < COUNT; i++) {
        const x = xs[i];
        const y = ys[i];
        sampleField(x, y);
        const nx = x + state.sampleU * dt * speed;
        const ny = y + state.sampleV * dt * speed;

        ages[i] += dt;

        // A tracer that aged out or left the field restarts somewhere new, and
        // draws a zero-length segment this frame so it does not streak across
        // the whole field from where it used to be.
        if (ages[i] > lifes[i] || nx < 0 || nx > aspect || ny < 0 || ny > 1) {
          spawn(i);
          linePositions[vp++] = xs[i];
          linePositions[vp++] = ys[i];
          linePositions[vp++] = xs[i];
          linePositions[vp++] = ys[i];
          cp = writeLineColor(cp, 0);
          continue;
        }

        xs[i] = nx;
        ys[i] = ny;

        linePositions[vp++] = x;
        linePositions[vp++] = y;
        linePositions[vp++] = nx;
        linePositions[vp++] = ny;
        cp = writeLineColor(cp, state.sampleSpeedSq);
      }
    };

    // ---- render targets --------------------------------------------------

    const createTexture = (w: number, h: number) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        w,
        h,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      return tex;
    };

    const clearFramebuffer = (fbo: WebGLFramebuffer | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, state.pw, state.ph);
      gl.disable(gl.BLEND);
      gl.clearColor(bgRgb[0], bgRgb[1], bgRgb[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const rebuildRenderTargets = () => {
      if (state.texA) gl.deleteTexture(state.texA);
      if (state.texB) gl.deleteTexture(state.texB);
      if (state.fboA) gl.deleteFramebuffer(state.fboA);
      if (state.fboB) gl.deleteFramebuffer(state.fboB);

      state.texA = createTexture(state.pw, state.ph);
      state.texB = createTexture(state.pw, state.ph);

      const attach = (tex: WebGLTexture | null) => {
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          tex,
          0,
        );
        return fbo;
      };

      state.fboA = attach(state.texA);
      state.fboB = attach(state.texB);
      state.read = { tex: state.texA, fbo: state.fboA };
      state.write = { tex: state.texB, fbo: state.fboB };

      clearFramebuffer(state.fboA);
      clearFramebuffer(state.fboB);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    // ---- drawing ---------------------------------------------------------

    const drawQuad = (texture: WebGLTexture | null, fadeMode: number) => {
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(quadProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
      gl.enableVertexAttribArray(quad.aPos);
      gl.vertexAttribPointer(quad.aPos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(quad.uTex, 0);
      gl.uniform3f(quad.uBg, bgRgb[0], bgRgb[1], bgRgb[2]);
      gl.uniform1f(quad.uKeep, 1 - ERASE);
      gl.uniform1f(quad.uMode, fadeMode);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const drawLines = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, lines.positionBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, linePositions);
      gl.bindBuffer(gl.ARRAY_BUFFER, lines.colorBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineColors);

      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(lineProgram);
      gl.uniform1f(lines.uAspect, state.aspect);

      gl.bindBuffer(gl.ARRAY_BUFFER, lines.positionBuffer);
      gl.enableVertexAttribArray(lines.aPos);
      gl.vertexAttribPointer(lines.aPos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, lines.colorBuffer);
      gl.enableVertexAttribArray(lines.aColor);
      gl.vertexAttribPointer(lines.aColor, 4, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.LINES, 0, COUNT * 2);
      gl.disable(gl.BLEND);
    };

    const render = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, state.write.fbo);
      gl.viewport(0, 0, state.pw, state.ph);
      gl.disable(gl.BLEND);
      drawQuad(state.read.tex, 1);
      drawLines();

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, state.pw, state.ph);
      drawQuad(state.write.tex, 0);

      const tmp = state.read;
      state.read = state.write;
      state.write = tmp;
    };

    // ---- lifecycle -------------------------------------------------------

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, canvas.clientWidth | 0);
      const h = Math.max(1, canvas.clientHeight | 0);
      if (w === state.w && h === state.h && dpr === state.dpr) return;

      state.w = w;
      state.h = h;
      state.dpr = dpr;
      state.pw = Math.max(1, Math.floor(w * dpr));
      state.ph = Math.max(1, Math.floor(h * dpr));
      state.aspect = w / h;

      canvas.width = state.pw;
      canvas.height = state.ph;

      rebuildRenderTargets();
      allocateFluid();

      for (let i = 0; i < COUNT; i++) {
        if (xs[i] > state.aspect) spawn(i);
      }
    };

    /** Once the air is at rest there is nothing left to compute: the fade has
     *  bottomed out and every segment is zero length. Coast a couple of seconds
     *  past that to let the last trails clear, then idle. */
    const SETTLE_FRAMES = Math.ceil(4 * TARGET_FPS);
    let settleFrames = SETTLE_FRAMES;

    const isStill = () => {
      const d = liveRef.current.drift;
      return energy < STILL_ENERGY && d[0] === 0 && d[1] === 0;
    };

    const frame = (now: number) => {
      state.rafId = 0;
      if (!state.running || state.contextLost || document.hidden) return;
      state.rafId = requestAnimationFrame(frame);

      const since = now - state.lastStep;
      if (since < FRAME_MS) return;
      state.lastStep = now - (since % FRAME_MS);

      // The solver runs on a fixed step. Semi-Lagrangian advection is stable at
      // any dt, but the look of the flow is not: a variable step would change
      // how far a stroke travels per frame on every machine.
      if (isStill()) {
        if (settleFrames <= 0) return;
        settleFrames--;
        if (settleFrames === 0) {
          // The fade is asymptotic and the buffer is 8 bit, so a trail one
          // level above the background mixes to itself forever and never
          // reaches it. By now that residue is 1/255 and invisible, but it is
          // still there, so park on a genuinely clean surface instead.
          clearFramebuffer(state.fboA);
          clearFramebuffer(state.fboB);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, state.pw, state.ph);
          gl.clearColor(bgRgb[0], bgRgb[1], bgRgb[2], 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          return;
        }
      } else {
        settleFrames = SETTLE_FRAMES;
      }

      stepFluid(DT);
      simulate(DT);
      render();
    };

    const startAnimation = () => {
      if (state.rafId || state.contextLost) return;
      state.running = true;
      state.lastStep = 0;
      state.rafId = requestAnimationFrame(frame);
    };

    const stopAnimation = () => {
      state.running = false;
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
    };

    // ---- pointer ---------------------------------------------------------

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.height <= 0) return;
      // Both axes divide by height: field space is x in [0, aspect], y in [0, 1].
      const x = (event.clientX - rect.left) / rect.height;
      const y = (event.clientY - rect.top) / rect.height;

      if (!state.pointerActive) {
        state.pointerActive = true;
        state.pointerX = x;
        state.pointerY = y;
        return;
      }

      const dx = x - state.pointerX;
      const dy = y - state.pointerY;
      state.pointerX = x;
      state.pointerY = y;

      const dist = Math.hypot(dx, dy);
      if (dist < 1e-4) return;

      const gain = liveRef.current.gustStrength * SPLAT_FORCE;
      let fx = dx * gain;
      let fy = dy * gain;
      const speed = Math.hypot(fx, fy);
      if (speed > SPLAT_MAX_SPEED) {
        fx = (fx / speed) * SPLAT_MAX_SPEED;
        fy = (fy / speed) * SPLAT_MAX_SPEED;
      }

      // A fast pointer can skip most of the width of the field between two
      // events. Splatting only at the endpoint would leave a dotted stroke, so
      // the gap is filled in at roughly one splat per cell.
      const steps = Math.min(12, Math.max(1, Math.round(dist / cell)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        splat(x - dx * (1 - t), y - dy * (1 - t), fx, fy);
      }

      settleFrames = SETTLE_FRAMES;
    };

    const onPointerLeave = () => {
      state.pointerActive = false;
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopAnimation();
        return;
      }
      startAnimation();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      state.contextLost = true;
      stopAnimation();
    };

    const onContextRestored = () => setGeneration((g) => g + 1);

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    resize();
    for (let i = 0; i < COUNT; i++) spawn(i);
    startAnimation();

    return () => {
      stopAnimation();
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);

      if (state.texA) gl.deleteTexture(state.texA);
      if (state.texB) gl.deleteTexture(state.texB);
      if (state.fboA) gl.deleteFramebuffer(state.fboA);
      if (state.fboB) gl.deleteFramebuffer(state.fboB);
      gl.deleteProgram(quadProgram);
      gl.deleteProgram(lineProgram);
    };
  }, [particleCount, paletteKey, background, generation]);

  return (
    <div
      ref={rootRef}
      className={`wdf-root${className ? ` ${className}` : ""}`}
      style={{ background }}
    >
      <style>{styles}</style>
      <canvas ref={canvasRef} className="wdf-canvas" aria-hidden />
      {showGrid ? <div className="wdf-grid" aria-hidden /> : null}
      <div className="wdf-content">{children}</div>
    </div>
  );
}

const styles = `
.wdf-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  --wdf-paper: #f0ece3;
}

.wdf-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
}

.wdf-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    repeating-linear-gradient(
      to right,
      color-mix(in oklab, var(--wdf-paper) 18%, transparent) 0 1px,
      transparent 1px 84px
    ),
    repeating-linear-gradient(
      to bottom,
      color-mix(in oklab, var(--wdf-paper) 18%, transparent) 0 1px,
      transparent 1px 84px
    );
}

.wdf-content {
  position: relative;
  z-index: 2;
  height: 100%;
}
`;
