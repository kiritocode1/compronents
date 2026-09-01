"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { hasToggled, useStreamerMode } from "@/lib/streamer-mode";

/**
 * Matches any aryank.space host with or without a scheme, so a command like
 * `https://ui.aryank.space/r/x.json`, a bare `ui.aryank.space` in prose, and
 * the `mint-me.aryank.space` token issuer are all covered by one pattern. Any
 * future subdomain is covered without touching this file. Kept local instead
 * of imported from `@/lib/registry` so this client component doesn't pull the
 * whole catalog into the bundle.
 */
const SECRET = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)*aryank\.space[^\s"'`,)<>]*/g;

const SPREAD = 1.4; // scatter distance, in text line-heights
const GRAVITY = 0.3; // downward bias of the settled cloud
const FADE = 0.65; // alpha of fully scattered grains
const SETTLE = 0.5; // seconds to dissolve, or to fly back home
const DRIFT = 0.8; // idle float speed of the scattered cloud

interface Grain {
  /** Home position: the glyph pixel this grain came from, device px. */
  hx: number;
  hy: number;
  /** Offset from home once fully scattered, device px. */
  ox: number;
  oy: number;
  r: number;
  g: number;
  b: number;
  a: number;
  s1: number;
  s2: number;
}

interface Cover {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Dust {
  grains: Grain[];
  /** Boxes painted in the page background so the real text can't be read. */
  covers: Cover[];
  bg: [number, number, number];
  /** One line-height in device px: the unit scatter distance is scaled by. */
  unit: number;
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Nearest ancestor background colour, matching how the block actually paints. */
function backgroundOf(el: Element): [number, number, number] {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  let node: Element | null = el;
  while (ctx && node) {
    const css = getComputedStyle(node).backgroundColor;
    if (css && css !== "transparent") {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      if (a > 0) return [r, g, b];
    }
    node = node.parentElement;
  }
  return [0, 0, 0];
}

/**
 * Turns every secret run of text inside `host` into a cloud of dust: the glyphs
 * are re-drawn offscreen in their own font and colour, then each lit pixel
 * becomes one grain that knows where it came from and where it flies to.
 */
function build(host: HTMLElement, canvas: HTMLCanvasElement): Dust | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(host.scrollWidth, host.clientWidth, 1);
  const height = Math.max(host.scrollHeight, host.clientHeight, 1);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  const starts: number[] = [];
  let text = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    if (!node.data) continue;
    starts.push(text.length);
    nodes.push(node);
    text += node.data;
  }

  const matches = [...text.matchAll(SECRET)];
  if (matches.length === 0) return null;

  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.textBaseline = "alphabetic";

  const origin = canvas.getBoundingClientRect();
  const covers: Cover[] = [];
  const styles = new Map<Element, { font: string; color: string }>();
  const range = document.createRange();

  /** Global text offset -> the text node and local offset it lands in. */
  function locate(offset: number): [Text, number] {
    let i = starts.length - 1;
    while (i > 0 && starts[i] > offset) i--;
    return [nodes[i], offset - starts[i]];
  }

  let unit = 0;
  for (const match of matches) {
    const from = match.index ?? 0;
    const to = from + match[0].length;
    range.setStart(...locate(from));
    range.setEnd(...locate(to));
    for (const r of range.getClientRects()) {
      if (r.width < 0.5 || r.height < 0.5) continue;
      covers.push({
        x: (r.left - origin.left) * dpr - 1,
        y: (r.top - origin.top) * dpr - 1,
        w: r.width * dpr + 2,
        h: r.height * dpr + 2,
      });
      unit = Math.max(unit, r.height * dpr);
    }

    for (let i = from; i < to; i++) {
      const char = text[i];
      if (!char.trim()) continue;
      const [node, at] = locate(i);
      const parent = node.parentElement;
      if (!parent) continue;
      range.setStart(node, at);
      range.setEnd(node, at + 1);
      const r = range.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) continue;
      let style = styles.get(parent);
      if (!style) {
        const cs = getComputedStyle(parent);
        style = {
          font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`,
          color: cs.color,
        };
        styles.set(parent, style);
      }
      ctx.font = style.font;
      ctx.fillStyle = style.color;
      // Baseline from font metrics, not per-glyph ink, so descenders line up.
      const m = ctx.measureText("x");
      const asc = m.fontBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent;
      const baseline = r.top - origin.top + (r.height - (asc + desc)) / 2 + asc;
      ctx.fillText(char, r.left - origin.left, baseline);
    }
  }
  if (covers.length === 0) return null;

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  for (const c of covers) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.w);
    maxY = Math.max(maxY, c.y + c.h);
  }
  const sx = Math.max(0, Math.floor(minX) - 2);
  const sy = Math.max(0, Math.floor(minY) - 2);
  const sw = Math.min(canvas.width - sx, Math.ceil(maxX - sx) + 4);
  const sh = Math.min(canvas.height - sy, Math.ceil(maxY - sy) + 4);
  if (sw < 1 || sh < 1) return null;

  const pixels = ctx.getImageData(sx, sy, sw, sh).data;
  const spread = Math.max(unit, 8) * SPREAD;
  const grains: Grain[] = [];
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const a = pixels[i + 3];
      if (a < 24) continue;
      const angle = Math.random() * Math.PI * 2;
      const reach = (0.15 + 0.85 * Math.random() ** 2.2) * spread;
      grains.push({
        hx: sx + x,
        hy: sy + y,
        ox: Math.cos(angle) * reach,
        oy: Math.sin(angle) * reach + GRAVITY * reach,
        r: pixels[i],
        g: pixels[i + 1],
        b: pixels[i + 2],
        a,
        s1: Math.random(),
        s2: Math.random(),
      });
    }
  }
  return { grains, covers, bg: backgroundOf(host), unit: Math.max(unit, 8) };
}

/**
 * Wraps content that may contain the registry URL. With streamer mode on the
 * URL dissolves into drifting dust on a canvas laid over it; the real text is
 * covered but untouched, so it still copies, selects, and reads to a screen
 * reader. Pass pre-highlighted Shiki `html`, or `children` for plain markup.
 */
export function StreamerVeil({
  html,
  children,
  className,
}: {
  html?: string;
  children?: ReactNode;
  className?: string;
}) {
  const on = useStreamerMode();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  // Survives the toggle so flying home reuses the cloud it flew out as.
  const dustRef = useRef<Dust | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let image: ImageData | null = null;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;

    function clear() {
      ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
    }

    function paint() {
      const dust = dustRef.current;
      if (!dust || !ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      if (!image || image.width !== w || image.height !== h) {
        image = ctx.createImageData(w, h);
      }
      const data = image.data;
      data.fill(0);

      const p = progress.current;
      const e = 1 - (1 - p) ** 3;
      const [br, bg, bb] = dust.bg;
      const cover = Math.round(255 * smoothstep(0.08, 0.5, p));
      for (const c of dust.covers) {
        const x0 = Math.max(0, Math.floor(c.x));
        const y0 = Math.max(0, Math.floor(c.y));
        const x1 = Math.min(w, Math.ceil(c.x + c.w));
        const y1 = Math.min(h, Math.ceil(c.y + c.h));
        for (let y = y0; y < y1; y++) {
          let i = (y * w + x0) * 4;
          for (let x = x0; x < x1; x++) {
            data[i] = br;
            data[i + 1] = bg;
            data[i + 2] = bb;
            data[i + 3] = cover;
            i += 4;
          }
        }
      }

      const amp = e * (dust.unit * 0.12 + 2);
      const alpha = 1 - (1 - FADE) * e;
      for (const grain of dust.grains) {
        const x =
          (grain.hx +
            grain.ox * e +
            Math.sin(time * (4 + 5 * grain.s1) + grain.s2 * 40) * amp) |
          0;
        const y =
          (grain.hy +
            grain.oy * e +
            Math.cos(time * (3.5 + 5.5 * grain.s2) + grain.s1 * 40) * amp) |
          0;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const i = (y * w + x) * 4;
        data[i] = grain.r;
        data[i + 1] = grain.g;
        data[i + 2] = grain.b;
        data[i + 3] = grain.a * alpha;
      }
      ctx.putImageData(image, 0, 0);
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      time += dt * DRIFT;
      const target = on ? 1 : 0;
      const step = dt / SETTLE;
      progress.current =
        progress.current < target
          ? Math.min(progress.current + step, target)
          : Math.max(progress.current - step, target);
      paint();
      if (progress.current === target && target === 0) {
        raf = 0;
        clear();
        // Rebuilt on the next toggle, against whatever the layout is by then.
        dustRef.current = null;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || !visible || !dustRef.current) return;
      last = performance.now();
      if (reduced.matches) {
        progress.current = on ? 1 : 0;
        if (on) paint();
        else clear();
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function rebuild() {
      if (!host || !canvas) return;
      dustRef.current = on || progress.current > 0 ? build(host, canvas) : null;
      image = null;
      if (!dustRef.current) clear();
    }

    if (!dustRef.current) rebuild();
    if (!dustRef.current) return;
    // Only a deliberate flip of the setting dissolves. Restoring it on load, or
    // mounting a tab panel with it already on, starts dusted: the URL is never
    // legible while an animation plays.
    if (first || !hasToggled()) progress.current = on ? 1 : 0;
    start();

    const resize = new ResizeObserver(() => {
      stop();
      rebuild();
      start();
    });
    resize.observe(host);

    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    });
    io.observe(host);
    reduced.addEventListener("change", start);

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
      reduced.removeEventListener("change", start);
    };
  }, [on]);

  return (
    <div ref={hostRef} className={className} style={{ position: "relative" }}>
      {html === undefined ? (
        children
      ) : (
        <div
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki output from local source / static commands
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
