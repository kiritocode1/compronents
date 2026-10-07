/**
 * Framework-free controller: owns the canvas, the hidden textarea that takes
 * the typing, the physics world and the frame loop. The React component mounts
 * one of these and forwards props.
 */
import { Body, World } from "./engine";
import { type Item, type Layout, layoutText } from "./layout";
import { type Caret, draw, type Theme } from "./render";
import { circle, skeletonise, weigh } from "./skeleton";
import { graphemes, isBreak, isEmoji, isSpace, reconcile } from "./text";

export interface SoftTypeOptions {
  value: string;
  fontFamily: string;
  fontWeight: number;
  theme: Theme;
  squeeze: number;
  /** Pen weight relative to the font's own; counters stay open regardless. */
  weight: number;
  breakWords: boolean;
  maxLength: number;
  sound: boolean;
  ariaLabel: string;
  onValueChange?: (value: string) => void;
}

interface Entry {
  id: number;
  grapheme: string;
  body: Body | null;
  /** Pixels per em the body was built at. */
  built: number;
}

/** Thinnest pen, in em, before the counter check: lifts thin fallback fonts toward Nunito's weight. */
const MIN_PEN = 0.085;

const HOLD_DELAY = 150;
const HOLD_GROW = 1100;
const HOLD_SHAKE = 600;
const HOLD_SIZE = 2;

export class SoftTypeController {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  readonly input: HTMLTextAreaElement;
  private options: SoftTypeOptions;
  private world: World;
  private entries: Entry[] = [];
  private layout: Layout | null = null;
  private nextId = 1;
  private topZ = 0;
  private width = 0;
  private height = 0;
  private ratio = 1;
  private raf = 0;
  private previous = 0;
  private accumulator = 0;
  private quiet = 0;
  private version = 0;
  private blueprint = false;
  /** The next layout rebuilds letters in place instead of growing them in. */
  private instant = false;
  private pointerId: number | null = null;
  private press: {
    body: Body;
    x: number;
    y: number;
    start: number | null;
    live: boolean;
    dx: number;
    dy: number;
  } | null = null;
  private moved = false;
  private audio: AudioContext | null = null;
  private caret = { x: 0, y: 0, h: 0, vx: 0, vy: 0, placed: false };
  private typedAt = 0;
  private blinkTimer = 0;
  private readonly reduced = matchMedia("(prefers-reduced-motion: reduce)");
  private readonly observer: ResizeObserver;
  private readonly cleanups: (() => void)[] = [];

  constructor(root: HTMLElement, options: SoftTypeOptions) {
    this.root = root;
    this.options = options;
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:text";
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("soft-type: 2D canvas unavailable");
    this.ctx = ctx;
    this.input = document.createElement("textarea");
    // Kept on screen and focusable (not display:none) so mobile keyboards open; 16px avoids iOS zoom.
    this.input.style.cssText =
      "position:absolute;left:0;top:0;width:1px;height:1px;padding:0;border:0;margin:0;opacity:0;resize:none;overflow:hidden;font-size:16px;pointer-events:none";
    this.input.setAttribute("autocapitalize", "off");
    this.input.setAttribute("autocomplete", "off");
    this.input.setAttribute("autocorrect", "off");
    this.input.spellcheck = false;
    this.input.setAttribute("aria-label", options.ariaLabel);
    this.input.value = options.value;
    root.append(this.canvas, this.input);
    this.world = new World(1, 1);
    this.world.reducedMotion = this.reduced.matches;
    this.bind();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(root);
    this.resize();
  }

  private listen<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
  ) {
    target.addEventListener(type, fn);
    this.cleanups.push(() => target.removeEventListener(type, fn));
  }

  private bind() {
    this.listen(this.input, "input", () => this.onInput());
    this.listen(this.input, "focus", () => this.wakeCaret());
    this.listen(this.input, "blur", () => this.render());
    this.listen(this.input, "keyup", () => this.wakeCaret());
    this.listen(this.input, "keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.relayout();
      }
    });
    const selection = () => {
      if (document.activeElement === this.input) this.wakeCaret();
    };
    document.addEventListener("selectionchange", selection);
    this.cleanups.push(() =>
      document.removeEventListener("selectionchange", selection),
    );
    this.listen(this.canvas, "pointerdown", (e) => this.onPointerDown(e));
    this.listen(this.canvas, "pointermove", (e) => this.onPointerMove(e));
    const end = (e: PointerEvent) => this.onPointerUp(e);
    this.listen(this.canvas, "pointerup", end);
    this.listen(this.canvas, "pointercancel", end);
    this.listen(this.canvas, "lostpointercapture", end);
    this.listen(this.canvas, "pointerleave", () =>
      this.canvas.style.setProperty("cursor", "text"),
    );
    const motion = () => {
      this.world.reducedMotion = this.reduced.matches;
      this.wake();
    };
    this.reduced.addEventListener("change", motion);
    this.cleanups.push(() =>
      this.reduced.removeEventListener("change", motion),
    );
    const visibility = () => {
      this.release();
      if (document.hidden) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      } else this.wake();
    };
    document.addEventListener("visibilitychange", visibility);
    this.cleanups.push(() =>
      document.removeEventListener("visibilitychange", visibility),
    );
  }

  /** Updates options; a changed value replaces the text as if typed. */
  update(options: SoftTypeOptions) {
    // A new font or pen weight changes every letter's shape, so letters are rebuilt in place.
    const reshaped =
      options.fontFamily !== this.options.fontFamily ||
      options.fontWeight !== this.options.fontWeight ||
      options.weight !== this.options.weight;
    const resized =
      options.squeeze !== this.options.squeeze ||
      options.breakWords !== this.options.breakWords;
    this.options = options;
    this.input.setAttribute("aria-label", options.ariaLabel);
    if (reshaped) {
      for (const entry of this.entries) {
        if (entry.body) this.world.drop(entry.body);
        entry.body = null;
      }
      this.instant = true;
    }
    if (options.value !== this.input.value) {
      this.input.value = options.value;
      this.sync();
    } else if (reshaped || resized) this.sync();
    else this.render();
  }

  private font() {
    return `${this.options.fontWeight} 160px ${this.options.fontFamily}`;
  }

  private onInput() {
    // Composition (IME) text is shown as it is typed; the limit only applies to committed text.
    const parts = graphemes(this.input.value);
    if (parts.length > this.options.maxLength) {
      const at = this.input.selectionStart;
      this.input.value = parts.slice(0, this.options.maxLength).join("");
      this.input.setSelectionRange(
        Math.min(at, this.input.value.length),
        Math.min(at, this.input.value.length),
      );
    }
    this.typedAt = performance.now();
    this.options.onValueChange?.(this.input.value);
    this.sync();
  }

  /**
   * Matches the new text against the letters on screen: the common prefix and
   * suffix keep their letters (and their physics), only the middle is replaced.
   */
  private sync() {
    const { entries, removed, added } = reconcile(
      this.entries,
      graphemes(this.input.value),
      (grapheme): Entry => ({
        id: this.nextId++,
        grapheme,
        body: null,
        built: 0,
      }),
    );
    for (const entry of removed) entry.body?.remove();
    this.entries = entries;
    const version = ++this.version;
    // A Cyrillic or Vietnamese letter may need a font subset that is not loaded yet.
    const font = this.font();
    const text = added.map((e) => e.grapheme).join("");
    if (text && !document.fonts.check(font, text)) {
      document.fonts.load(font, text).then(
        () => version === this.version && this.relayout(),
        () => version === this.version && this.relayout(),
      );
      return;
    }
    this.relayout();
  }

  /** Lays the text out again and sends every letter to its slot (Escape does this on demand). */
  private relayout() {
    if (!this.width || !this.height) return;
    const items: Item[] = this.entries.map((e) => {
      if (isBreak(e.grapheme)) return { kind: "newline", id: e.id };
      if (isSpace(e.grapheme)) return { kind: "space", id: e.id };
      if (isEmoji(e.grapheme))
        return { kind: "glyph", id: e.id, skeleton: circle(e.grapheme) };
      const skeleton = skeletonise(e.grapheme, {
        family: this.options.fontFamily,
        weight: this.options.fontWeight,
      });
      return {
        kind: "glyph",
        id: e.id,
        skeleton: weigh(skeleton, this.options.weight, MIN_PEN),
      };
    });
    this.layout = layoutText(items, this.width, this.height, {
      squeeze: this.options.squeeze,
      breakWords: this.options.breakWords,
    });
    // If existing letters have to shrink to make room, new ones wait for the room to open.
    let shrink = 1;
    for (const entry of this.entries) {
      const pose = this.layout.poses.get(entry.id);
      if (pose && entry.body && !entry.body.leaving)
        shrink = Math.min(
          shrink,
          pose.size / entry.built / entry.body.layout.target,
        );
    }
    const wait = shrink < 0.92 ? 12 : 0;
    let spawned = 0;
    for (const entry of this.entries) {
      const pose = this.layout.poses.get(entry.id);
      if (!pose) continue;
      if (!entry.body) {
        const item = items.find((i) => i.id === entry.id);
        if (item?.kind !== "glyph" || !item.skeleton.strokes.length) continue;
        entry.body = new Body(entry.id, item.skeleton, pose);
        entry.built = pose.size;
        entry.body.z = ++this.topZ;
        if (!this.instant) entry.body.spawn(wait + spawned * 2);
        this.world.place(entry.body, pose.x, pose.y, 1);
        if (this.reduced.matches && entry.body.puff)
          entry.body.puff.damping = 30;
        this.world.add(entry.body);
        spawned++;
      } else
        this.world.place(entry.body, pose.x, pose.y, pose.size / entry.built);
    }
    if (spawned && this.options.sound && !this.instant) this.tick(spawned);
    this.instant = false;
    this.wake();
  }

  private resize() {
    const rect = this.root.getBoundingClientRect();
    const width = Math.max(40, Math.round(rect.width));
    const height = Math.max(40, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (width === this.width && height === this.height && ratio === this.ratio)
      return;
    this.release();
    this.width = width;
    this.height = height;
    this.ratio = ratio;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.world.resize(width, height);
    if (!this.entries.length && this.input.value) this.sync();
    else this.relayout();
  }

  private point(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || this.pointerId !== null) return;
    const p = this.point(e);
    const body = this.world.hit(p.x, p.y);
    this.moved = false;
    this.pointerId = e.pointerId;
    this.canvas.setPointerCapture(e.pointerId);
    if (!body) return;
    e.preventDefault();
    this.world.grab(body, p.x, p.y);
    body.z = ++this.topZ;
    this.press = {
      body,
      x: p.x,
      y: p.y,
      start: null,
      live: true,
      dx: 0,
      dy: 0,
    };
    this.wakeAudio();
    this.canvas.style.setProperty("cursor", "grabbing");
    this.wake();
  }

  private onPointerMove(e: PointerEvent) {
    if (this.pointerId !== null && e.pointerId !== this.pointerId) return;
    const p = this.point(e);
    // Moving more than a few pixels makes it a drag, not a hold.
    if (
      this.press?.live &&
      Math.hypot(p.x - this.press.x, p.y - this.press.y) > 8
    ) {
      this.endPress();
      this.moved = true;
    }
    const drag = this.world.drag;
    if (drag) {
      drag.x = Math.max(5, Math.min(this.width - 5, p.x));
      drag.y = Math.max(5, Math.min(this.height - 5, p.y));
      this.wake();
    } else if (this.pointerId === null)
      this.canvas.style.setProperty(
        "cursor",
        this.world.hit(p.x, p.y) ? "grab" : "text",
      );
  }

  private onPointerUp(e: PointerEvent) {
    if (e.pointerId !== this.pointerId) return;
    const wasDrag = this.moved;
    this.release();
    // A tap (not a drag) puts the caret in the text and opens the keyboard on phones.
    if (!wasDrag && document.activeElement !== this.input)
      this.input.focus({ preventScroll: true });
    this.wake();
  }

  private release() {
    this.endPress();
    this.world.release();
    const id = this.pointerId;
    this.pointerId = null;
    if (id !== null && this.canvas.hasPointerCapture(id))
      this.canvas.releasePointerCapture(id);
    this.canvas.style.setProperty("cursor", "text");
  }

  private endPress() {
    if (this.press?.live) this.press.body.inflate(1);
    this.press = null;
  }

  /** Press and hold: the letter inflates, trembles, then pops and flips the rendering. */
  private stepPress(time: number) {
    const press = this.press;
    if (!press?.live) return;
    press.start ??= time;
    const t = time - press.start - HOLD_DELAY;
    if (t <= 0) return;
    const u = Math.min(1, t / HOLD_GROW);
    const eased = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2;
    press.body.inflate(1 + (HOLD_SIZE - 1) * eased);
    const shake = t - HOLD_GROW;
    if (shake > 0 && shake < HOLD_SHAKE && !this.reduced.matches) {
      const amount = 2 + (4 * shake) / HOLD_SHAKE;
      const dx = Math.sin(shake * 0.15) * amount;
      const dy = Math.cos(shake * 0.11) * amount * 0.6;
      for (const n of press.body.nodes) {
        n.x += dx - press.dx;
        n.y += dy - press.dy;
      }
      press.dx = dx;
      press.dy = dy;
    } else if (shake >= HOLD_SHAKE) {
      press.body.inflate(1, true);
      this.pop(press.body);
      press.live = false;
      this.blueprint = !this.blueprint;
      this.root.dataset.blueprint = String(this.blueprint);
    }
  }

  private wakeAudio() {
    if (!this.options.sound) return;
    this.audio ??= new AudioContext();
    if (this.audio.state === "suspended") void this.audio.resume();
  }

  /** The pop: a quick pitch drop with a tiny click. Bigger letters pop lower. */
  private pop(body: Body) {
    const audio = this.audio;
    if (!audio || !this.options.sound || this.reduced.matches) return;
    const now = audio.currentTime;
    const bodies = this.world.bodies;
    const average =
      bodies.reduce((s, b) => s + b.radius, 0) / (bodies.length || 1);
    const pitch = 760 * Math.sqrt(average / Math.max(1, body.radius));
    const tone = audio.createOscillator();
    const level = audio.createGain();
    tone.type = "sine";
    tone.frequency.setValueAtTime(pitch, now);
    tone.frequency.exponentialRampToValueAtTime(pitch * 0.22, now + 0.13);
    level.gain.setValueAtTime(0.0001, now);
    level.gain.exponentialRampToValueAtTime(0.22, now + 0.006);
    level.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    tone.connect(level).connect(audio.destination);
    tone.start(now);
    tone.stop(now + 0.22);
    const click = audio.createBuffer(
      1,
      Math.round(audio.sampleRate * 0.012),
      audio.sampleRate,
    );
    const data = click.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    const burst = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const clickLevel = audio.createGain();
    burst.buffer = click;
    filter.type = "highpass";
    filter.frequency.value = 1800;
    clickLevel.gain.value = 0.06;
    burst.connect(filter).connect(clickLevel).connect(audio.destination);
    burst.start(now);
  }

  /** A soft blip when letters appear while typing, much quieter than the pop. */
  private tick(count: number) {
    const audio = this.audio;
    if (!audio || audio.state !== "running" || this.reduced.matches) return;
    const now = audio.currentTime;
    const tone = audio.createOscillator();
    const level = audio.createGain();
    const pitch = 980 + Math.random() * 120;
    tone.type = "sine";
    tone.frequency.setValueAtTime(pitch, now);
    tone.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.07);
    level.gain.setValueAtTime(0.0001, now);
    level.gain.exponentialRampToValueAtTime(
      Math.min(0.08, 0.04 * count),
      now + 0.004,
    );
    level.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    tone.connect(level).connect(audio.destination);
    tone.start(now);
    tone.stop(now + 0.1);
  }

  private caretIndex() {
    const at = this.input.selectionEnd;
    let offset = 0;
    let index = 0;
    for (const entry of this.entries) {
      if (offset >= at) break;
      offset += entry.grapheme.length;
      index++;
    }
    return index;
  }

  /** Where the caret should be: just after the previous letter as it sits right now. */
  private caretTarget(): { x: number; y: number; h: number } | null {
    const layout = this.layout;
    if (!layout) return null;
    const index = this.caretIndex();
    const slot = layout.slots[Math.min(index, layout.slots.length - 1)];
    const gap = layout.size * 0.06;
    const prev = this.entries[index - 1];
    if (prev?.body && !prev.body.leaving)
      return { x: prev.body.bounds.maxX + gap, y: slot.y, h: slot.h };
    const next = this.entries[index];
    if (next?.body && !next.body.leaving && (!prev || isBreak(prev.grapheme)))
      return { x: next.body.bounds.minX - gap, y: slot.y, h: slot.h };
    return slot;
  }

  private caretState(time: number): Caret | null {
    if (document.activeElement !== this.input) return null;
    const target = this.caretTarget();
    if (!target) return null;
    const c = this.caret;
    if (!c.placed || this.reduced.matches) {
      Object.assign(c, {
        x: target.x,
        y: target.y,
        h: target.h,
        vx: 0,
        vy: 0,
        placed: true,
      });
    } else {
      // Critically damped follow, so the caret glides after the letters.
      c.vx += ((target.x - c.x) * 500 - c.vx * 40) / 60;
      c.vy += ((target.y - c.y) * 500 - c.vy * 40) / 60;
      c.x += c.vx / 60;
      c.y += c.vy / 60;
      c.h += (target.h - c.h) * 0.3;
    }
    // Hard blink, held solid for half a second after each keystroke.
    const since = time - this.typedAt;
    const alpha = since < 500 || since % 1100 < 550 ? 1 : 0;
    return { x: c.x, y: c.y, h: c.h, alpha };
  }

  private wakeCaret() {
    this.typedAt = performance.now();
    this.render();
  }

  private render(time = performance.now()) {
    const caret = this.caretState(time);
    draw(this.ctx, this.world, {
      ratio: this.ratio,
      theme: this.options.theme,
      blueprint: this.blueprint,
      caret,
    });
    // While the physics sleeps, a timer keeps the caret blinking.
    clearTimeout(this.blinkTimer);
    if (!this.raf && caret) {
      const since = time - this.typedAt;
      const wait = since < 500 ? 500 - since : 550 - ((since - 500) % 550);
      this.blinkTimer = window.setTimeout(
        () => this.render(),
        Math.max(16, wait),
      );
    }
  }

  private wake() {
    this.quiet = 0;
    if (!this.raf && !document.hidden) {
      this.previous = 0;
      this.raf = requestAnimationFrame((t) => this.frame(t));
    }
  }

  private frame(time: number) {
    this.raf = 0;
    if (document.hidden) {
      this.previous = 0;
      return;
    }
    // One physics tick at most per frame: a slow frame plays slower instead of catching up.
    this.accumulator = Math.min(
      1000 / 60,
      this.accumulator +
        Math.min(time - (this.previous || time - 16.67), 33.34),
    );
    this.previous = time;
    this.stepPress(time);
    let changing = false;
    while (this.accumulator >= 1000 / 60) {
      if (this.world.step()) changing = true;
      this.accumulator -= 1000 / 60;
    }
    const caretMoving = Math.hypot(this.caret.vx, this.caret.vy) > 0.5;
    this.quiet =
      !changing &&
      !caretMoving &&
      !this.world.drag &&
      !this.press?.live &&
      !this.world.busy &&
      this.world.energy < 0.08
        ? this.quiet + 1
        : 0;
    if (this.quiet < 40) this.raf = requestAnimationFrame((t) => this.frame(t));
    else {
      this.world.sleep();
      this.previous = 0;
      this.accumulator = 0;
    }
    this.render(time);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.blinkTimer);
    this.observer.disconnect();
    for (const fn of this.cleanups) fn();
    this.canvas.remove();
    this.input.remove();
    void this.audio?.close();
  }
}
