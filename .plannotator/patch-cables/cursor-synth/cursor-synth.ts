/**
 * Cursor synth: the sound of patch.nrly.fun with nothing drawn.
 *
 * An invisible lattice of 40px cells covers the viewport. Each cell owns one
 * diagonal and a spring value E. The smoothed cursor pulls cells within its
 * reach towards "joined"; reach widens up to 60% with cursor speed, so a
 * frantic sweep closes more cells at once. A cell plays one note when E
 * crosses 0.52 and can only play again after E falls below 0.38. Pitch comes
 * from the cell's position on a pentatonic ladder, so every gesture is in key.
 * A click sends a ring outwards that closes cells as it passes.
 *
 * Density limits are the source's: one note per frame, and a gap of at least
 * 140ms between Mist notes (50ms for the other voices).
 *
 * Audio starts on the first pointerdown or keydown, as browsers require a
 * gesture. Every constant below is copied from the source.
 */

export type CursorSynthVoice = "mist" | "pluck" | "bloop" | "acid";

export interface CursorSynthOptions {
  /** Synth voice. Default "mist". */
  voice?: CursorSynthVoice;
  /** Lattice pitch in CSS px. Default 40. */
  spacing?: number;
  /** Cursor reach in cells. Default 2.2. */
  reach?: number;
  /** Cursor smoothing, 0 to 1. Default 0.55. */
  smoothing?: number;
  /** Seconds a passed cell keeps its pull. 0 turns the trail off. Default 1. */
  trailDecay?: number;
  /** A click sends a ring of notes outwards. Default true. */
  ripples?: boolean;
  /** Master volume, the source's bus gain. Default 0.16. */
  volume?: number;
  /**
   * Shortest gap between two notes, in seconds. This caps how busy a frantic
   * sweep can get. Default 0.14 for Mist (about 7 notes a second) and 0.05 for the others.
   */
  noteGap?: number;
}

export interface CursorSynth {
  /** Mute or unmute without tearing down the graph. */
  setEnabled: (on: boolean) => void;
  setOptions: (next: CursorSynthOptions) => void;
  dispose: () => void;
}

const SCALE = [0, 3, 5, 7, 10];
const MAJ = [0, 2, 4, 7, 9];
const PLUCKS = ["string", "mallet", "harp", "fm", "soft"] as const;
type PluckKind = (typeof PLUCKS)[number];

const sstep = (h: number) => (h <= 0 ? 0 : h >= 1 ? 1 : h * h * (3 - 2 * h));
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const l = dx * dx + dy * dy;
  let t = l > 1e-6 ? ((px - ax) * dx + (py - ay) * dy) / l : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}

/** Attaches the synth to the window. Call dispose() to remove every listener and close the audio. */
export function createCursorSynth(options: CursorSynthOptions = {}): CursorSynth {
  const S = {
    voice: "mist" as CursorSynthVoice,
    spacing: 40,
    reach: 2.2,
    smooth: 0.55,
    trail: 1,
    ripples: true,
    volume: 0.16,
    gap: undefined as number | undefined,
  };
  const apply = (o: CursorSynthOptions) => {
    if (o.voice) S.voice = o.voice;
    if (o.spacing !== undefined) S.spacing = o.spacing;
    if (o.reach !== undefined) S.reach = o.reach;
    if (o.smoothing !== undefined) S.smooth = o.smoothing;
    if (o.trailDecay !== undefined) S.trail = o.trailDecay;
    if (o.ripples !== undefined) S.ripples = o.ripples;
    if (o.volume !== undefined) S.volume = o.volume;
    if (o.noteGap !== undefined) S.gap = o.noteGap;
  };
  apply(options);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let enabled = true;

  // Lattice, sized like the source's canvas so pitch maps to the same cells.
  let dpr = 1;
  let sc = 1;
  let N: [number, number] = [0, 0];
  let O: [number, number] = [0, 0];
  let E = new Float32Array(0);
  let V = new Float32Array(0);
  let H = new Float32Array(0);
  let JN = new Uint8Array(0);
  let onState = new Uint8Array(0);
  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cw = Math.max(1, Math.round(innerWidth * dpr));
    const ch = Math.max(1, Math.round(innerHeight * dpr));
    sc = S.spacing * dpr;
    N = [Math.ceil(cw / sc) + 4, Math.ceil(ch / sc) + 4];
    O = [(cw - (N[0] - 1) * sc) / 2, (ch - (N[1] - 1) * sc) / 2];
    const n = N[0] * N[1];
    E = new Float32Array(n);
    V = new Float32Array(n);
    H = new Float32Array(n);
    JN = new Uint8Array(n);
    onState = new Uint8Array(n);
  }

  // Pointer
  const ptr = { sx: -99, sy: -99, sIn: false, amt: 0, x: -99, y: -99, in: false };
  const ripples: { x: number; y: number; t: number }[] = [];
  const toLattice = (e: PointerEvent): [number, number] => [
    (e.clientX * dpr - O[0]) / sc,
    (e.clientY * dpr - O[1]) / sc,
  ];
  const onMove = (e: PointerEvent) => {
    const [x, y] = toLattice(e);
    ptr.x = x;
    ptr.y = y;
    ptr.in = true;
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const [x, y] = toLattice(e);
    ptr.x = x;
    ptr.y = y;
    ptr.in = true;
    if (S.ripples) ripples.push({ x, y, t: performance.now() });
    ensureAudio();
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") ptr.in = false;
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) ptr.in = false;
  };

  // Audio: the source's bus, lowpass, feedback delay and generated reverb.
  let ac: AudioContext | null = null;
  let bus: GainNode | null = null;
  let mistIn: GainNode | null = null;
  let lastNote = 0;
  let notesThisFrame = 0;
  function ensureAudio() {
    if (!enabled) return;
    try {
      if (!ac) {
        ac = new AudioContext();
        bus = ac.createGain();
        bus.gain.value = S.volume;
        const lp = ac.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2200;
        lp.Q.value = 0.7;
        const dl = ac.createDelay(1);
        dl.delayTime.value = 0.27;
        const fb = ac.createGain();
        fb.gain.value = 0.34;
        const wet = ac.createGain();
        wet.gain.value = 0.3;
        bus.connect(lp);
        lp.connect(ac.destination);
        // A long, dark generated reverb for the Mist voice.
        const sr = ac.sampleRate;
        const len = Math.floor(sr * 3.6);
        const ir = ac.createBuffer(2, len, sr);
        for (let c = 0; c < 2; c++) {
          const d = ir.getChannelData(c);
          let v = 0;
          for (let n = 0; n < len; n++) {
            v += (Math.random() * 2 - 1 - v) * 0.18;
            d[n] = v * (1 - n / len) ** 2.6;
          }
        }
        const cv = ac.createConvolver();
        cv.buffer = ir;
        const rv = ac.createGain();
        rv.gain.value = 0.9;
        mistIn = ac.createGain();
        mistIn.gain.value = 0.55;
        mistIn.connect(cv);
        cv.connect(rv);
        rv.connect(ac.destination);
        lp.connect(dl);
        dl.connect(fb);
        fb.connect(dl);
        dl.connect(wet);
        wet.connect(ac.destination);
      }
      if (ac.state === "suspended") ac.resume();
    } catch (_) {}
  }
  const ksCache = new Map<string, AudioBuffer>();
  // Karplus-Strong plucked string, rendered once per pitch and cached.
  function ks(ctx: AudioContext, fr: number, damp: number, bright: number) {
    const key = `${Math.round(fr * 4)}|${damp}|${bright}`;
    const hit = ksCache.get(key);
    if (hit) return hit;
    if (ksCache.size > 90) ksCache.clear();
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 1.6);
    const P = Math.max(2, Math.round(sr / fr));
    const b = ctx.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    const ring = new Float32Array(P);
    let prev = 0;
    for (let n = 0; n < P; n++) {
      const w = Math.random() * 2 - 1;
      prev = prev * (1 - bright) + w * bright + w * (1 - bright) * 0.35;
      ring[n] = prev;
    }
    let p = 0;
    for (let n = 0; n < len; n++) {
      const a = ring[p];
      const nx = ring[(p + 1) % P];
      d[n] = a;
      ring[p] = damp * (bright * 0.35 * a + (1 - bright * 0.35) * 0.5 * (a + nx));
      p = (p + 1) % P;
    }
    ksCache.set(key, b);
    return b;
  }
  function pluckVariant(ctx: AudioContext, kind: PluckKind, fr: number, vel: number, t0: number, dest: AudioNode) {
    const env = (peak: number, dec: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + dec);
      g.connect(dest);
      return g;
    };
    const sine = (fq: number, type?: OscillatorType) => {
      const o = ctx.createOscillator();
      o.type = type || "sine";
      o.frequency.value = fq;
      return o;
    };
    const run = (o: OscillatorNode, dur: number) => {
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    };
    if (kind === "string" || kind === "harp") {
      const src = ctx.createBufferSource();
      src.buffer = kind === "string" ? ks(ctx, fr, 0.995, 0.25) : ks(ctx, fr, 0.9985, 0.8);
      const g = env(vel * (kind === "string" ? 0.9 : 0.7), kind === "string" ? 0.9 : 1.5);
      src.connect(g);
      src.start(t0);
      src.stop(t0 + 1.6);
    } else if (kind === "mallet") {
      const parts: [number, number, number][] = [
        [1, 0.7, 0.55],
        [3.98, 0.28, 0.12],
        [9.2, 0.1, 0.04],
      ];
      for (const [m, a, dec] of parts) {
        const o = sine(fr * m);
        o.connect(env(vel * a, dec));
        run(o, dec);
      }
    } else if (kind === "fm") {
      const c = sine(fr);
      const mo = sine(fr * 3.5);
      const mg = ctx.createGain();
      mg.gain.setValueAtTime(fr * 2.6 * vel, t0);
      mg.gain.exponentialRampToValueAtTime(1, t0 + 0.32);
      mo.connect(mg);
      mg.connect(c.frequency);
      c.connect(env(vel * 0.45, 0.75));
      run(c, 0.75);
      run(mo, 0.75);
    } else {
      const g = env(vel * 0.5, 0.55);
      const o1 = sine(fr, "triangle");
      const o2 = sine(fr * 2.003);
      const g2 = ctx.createGain();
      g2.gain.value = 0.35;
      o1.connect(g);
      o2.connect(g2);
      g2.connect(g);
      run(o1, 0.55);
      run(o2, 0.55);
    }
  }
  function playVoice(i: number, j: number) {
    if (!enabled || !ac || !bus || ac.state !== "running") return;
    const ctx = ac;
    const now = ctx.currentTime;
    const gap = S.gap ?? (S.voice === "mist" ? 0.14 : 0.05);
    if (now - lastNote < gap || notesThisFrame > 0) return;
    lastNote = now;
    notesThisFrame++;
    const deg = (((i + (N[1] - j) * 2) % 15) + 15) % 15;
    const f = 98 * 2 ** ((SCALE[deg % 5] + 12 * Math.floor(deg / 5)) / 12);
    let out: AudioNode = bus;
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.max(-1, Math.min(1, (i / N[0]) * 2 - 1));
      pan.connect(bus);
      out = pan;
    }
    const g = ctx.createGain();
    g.connect(out);
    const osc = (type: OscillatorType, fr: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      return o;
    };
    if (S.voice === "pluck") {
      // Timbre changes in bands across the screen; brightness follows height; small human variation per note.
      const vel = 0.55 + Math.random() * 0.45;
      const fr = f * (Math.random() < 0.14 ? 2 : 1) * 2 ** ((Math.random() - 0.5) * 0.012);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900 + (1 - j / N[1]) * 4200;
      lp.Q.value = 0.8;
      lp.connect(g);
      const kind = PLUCKS[((Math.floor(i / 5) % PLUCKS.length) + PLUCKS.length) % PLUCKS.length];
      pluckVariant(ctx, kind, fr, vel, now, lp);
      if (Math.random() < 0.18) pluckVariant(ctx, kind, fr * 1.5, vel * 0.45, now + 0.055, lp); // occasional strummed fifth
    } else if (S.voice === "mist") {
      // Soft and slow: detuned sines on a major pentatonic, gentle attack, long fade into reverb.
      const dg = deg % 10;
      const fm = 146.83 * 2 ** ((MAJ[dg % 5] + 12 * Math.floor(dg / 5)) / 12);
      const vel = 0.6 + Math.random() * 0.4;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1500;
      lp.Q.value = 0.3;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.2 * vel, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 2.8);
      lp.connect(g);
      if (mistIn) {
        const send = ctx.createGain();
        send.gain.value = 0.8;
        g.connect(send);
        send.connect(mistIn);
      }
      const parts: [number, number, number][] = [
        [fm, -4, 1],
        [fm, 4, 1],
        [fm * 2, 0, 0.18],
        [fm / 2, 0, 0.25],
      ];
      for (const [fq, cents, a] of parts) {
        const o = osc("sine", fq * 2 ** (cents / 1200));
        const ga = ctx.createGain();
        ga.gain.value = a * 0.5;
        o.connect(ga);
        ga.connect(lp);
        o.start(now);
        o.stop(now + 2.9);
      }
    } else if (S.voice === "bloop") {
      // Droplet: a sine that glides up as it fades.
      const o = osc("sine", f * 0.6);
      o.frequency.setValueAtTime(f * 0.6, now);
      o.frequency.exponentialRampToValueAtTime(f * 1.45, now + 0.13);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.75, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.connect(g);
      o.start(now);
      o.stop(now + 0.34);
    } else {
      // Acid: saw bass through a resonant lowpass with a snappy filter envelope.
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.Q.value = 13;
      lp.frequency.setValueAtTime(f * 9, now);
      lp.frequency.exponentialRampToValueAtTime(f * 0.9, now + 0.24);
      const o1 = osc("sawtooth", f / 2);
      const o2 = osc("sawtooth", (f / 2) * 1.006);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.32, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      o1.connect(lp);
      o2.connect(lp);
      lp.connect(g);
      o1.start(now);
      o2.start(now);
      o1.stop(now + 0.4);
      o2.stop(now + 0.4);
    }
  }

  // One frame of the source's cable sim, minus everything only the picture needed.
  let last = performance.now();
  let mv = 1;
  function step(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const f = dt * 60;
    const decay = S.trail > 0 ? Math.exp(-dt / (S.trail * 0.45)) : 0;
    const damp = (0.74 + 0.08 * S.smooth) ** f;
    const follow = 1 - Math.exp(-dt * (42 - 37 * S.smooth));
    if (ptr.in && !ptr.sIn) {
      ptr.sx = ptr.x;
      ptr.sy = ptr.y;
    }
    ptr.sIn = ptr.in;
    const ax = ptr.sx;
    const ay = ptr.sy;
    if (ptr.in) {
      ptr.sx += (ptr.x - ptr.sx) * follow;
      ptr.sy += (ptr.y - ptr.sy) * follow;
    }
    const bx = ptr.sx;
    const by = ptr.sy;
    ptr.amt += ((ptr.in ? 1 : 0) - ptr.amt) * (1 - Math.exp(-dt * (14 - 10 * S.smooth)));
    const amt = sstep(ptr.amt);
    const hov = amt > 0.002;
    const stiff = 0.22 - 0.14 * S.smooth;
    const speed = Math.hypot(bx - ax, by - ay) / Math.max(dt, 0.001);
    const rv = S.reach * (1 + Math.min(0.6, speed * 0.02)); // fast strokes reach a little wider
    for (let r = ripples.length - 1; r >= 0; r--) if (now - ripples[r].t > 2400) ripples.splice(r, 1);
    if (hov || ripples.length) mv = 1;
    notesThisFrame = 0;
    const nx = N[0];
    const ny = N[1];
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        let tg = 0;
        const h = hov ? sstep(1 - Math.max(0, segDist(i + 0.5, j + 0.5, ax, ay, bx, by) - 0.25) / rv) * amt : 0;
        H[k] = Math.max(h, H[k] * decay);
        if (H[k] > tg) tg = H[k];
        let rip = 0;
        for (let r = 0; r < ripples.length; r++) {
          const R = ripples[r];
          const age = (now - R.t) / 1000;
          const d = Math.hypot(i + 0.5 - R.x, j + 0.5 - R.y);
          const w = sstep(1 - Math.abs(d - age * 8) / 1.1) * (1 - age / 2.4);
          if (w > rip) rip = w;
        }
        if (rip > tg) tg = rip;
        // Joins snap: below 0.42 a cell only swells; past it, it closes and holds until the pull drops under 0.2.
        if (!JN[k] && tg > 0.42) JN[k] = 1;
        else if (JN[k] && tg < 0.2) JN[k] = 0;
        tg = JN[k] ? 0.62 + 0.38 * sstep((tg - 0.2) / 0.8) : 0.16 * sstep(tg / 0.42);
        if (reduce) {
          const de = (tg - E[k]) * Math.min(1, 0.25 * f);
          E[k] += de;
          if (de > 1e-4 || de < -1e-4) mv = 1;
        } else if (tg >= E[k]) {
          V[k] += (tg - E[k]) * stiff * f;
          V[k] *= damp;
          E[k] += V[k] * f;
          if (V[k] > 1e-4 || V[k] < -1e-4) mv = 1;
        } else {
          V[k] *= 0.55 ** f;
          const rate = (E[k] > 0.5 ? 6.5 : 2.6) * (1.35 - 0.7 * S.smooth);
          const de = (tg - E[k]) * (1 - Math.exp(-dt * rate));
          E[k] += de + V[k] * f;
          if (E[k] < tg) E[k] = tg;
          if (de < -1e-4 || V[k] > 1e-4 || V[k] < -1e-4) mv = 1;
        }
        // Note on when the stubs meet, reset once they have pulled well apart.
        if (!onState[k] && E[k] > 0.52) {
          onState[k] = 1;
          playVoice(i, j);
        } else if (onState[k] && E[k] < 0.38) onState[k] = 0;
      }
  }

  // The source's frame loop: once nothing has moved for 30 frames and the cursor is away, step every 4th frame.
  let raf = 0;
  let frame = 0;
  let idleFrames = 0;
  function loop(now: number) {
    const sleepy = idleFrames > 30 && !ptr.in;
    if (!sleepy || frame % 4 === 0) {
      mv = 0;
      step(now);
      if (mv) idleFrames = 0;
      else idleFrames++;
    }
    frame++;
    raf = requestAnimationFrame(loop);
  }

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = window.setTimeout(build, 80);
  };
  build();
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onDown, { passive: true });
  addEventListener("pointerup", onUp, { passive: true });
  addEventListener("pointercancel", onUp, { passive: true });
  document.addEventListener("pointerout", onOut);
  addEventListener("keydown", ensureAudio);
  addEventListener("resize", onResize);
  raf = requestAnimationFrame(loop);

  return {
    setEnabled(on) {
      enabled = on;
      if (!ac) return;
      if (on) ac.resume();
      else ac.suspend();
    },
    setOptions(next) {
      const spacing = S.spacing;
      apply(next);
      if (bus) bus.gain.value = S.volume;
      if (S.spacing !== spacing) build();
    },
    dispose() {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerout", onOut);
      removeEventListener("keydown", ensureAudio);
      removeEventListener("resize", onResize);
      ac?.close().catch(() => {});
    },
  };
}
