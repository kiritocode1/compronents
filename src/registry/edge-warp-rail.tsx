"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Edge Warp Rail
 *
 * A case study read sideways. Vertical scroll drives a horizontal rail of media:
 * wheel down, swipe, or grab the rail and drag, and the whole strip travels
 * left. As a tile reaches the left or right of the frame its pixels bend around
 * the edge like a sheet wrapping a cylinder, then dissolve past the rim, so
 * leaving the viewport reads as motion instead of a hard cut.
 *
 * The bend is real geometry: each image is drawn onto a subdivided plane on a
 * WebGL overlay and displaced in a vertex shader near the viewport edges. The
 * DOM image is hidden while its warped twin is on screen. It owns its own scroll
 * container, so it embeds in a bounded box or fills the viewport; on small
 * screens it becomes a plain vertical stack, and with reduced motion (or no
 * WebGL) a native horizontal scroller with no scroll hijacking.
 */

export type EdgeWarpItem =
  | {
      kind: "media";
      /** Image URL. Sized to the shared band height at its own aspect ratio. */
      src: string;
      alt: string;
      /** Intrinsic width / height. Drives the tile width on the rail. */
      aspect: number;
    }
  | {
      kind: "note";
      eyebrow?: string;
      heading?: string;
      body: string;
    };

export interface EdgeWarpRailProps {
  items?: EdgeWarpItem[];
  /** Corner wordmark shown over the rail. */
  label?: string;
  /** Short intro under the wordmark. */
  intro?: string;
  /** Meta lines (year, discipline) at the corner. */
  tags?: string[];
  background?: string;
  textColor?: string;
  mutedColor?: string;
  className?: string;
  style?: CSSProperties;
}

const IMG = (n: number) => `/assets/minimap-scrubber/img${n}.jpeg`;
// Portrait, square, and wide tiles interleaved so the rail keeps a rhythm.
const ASPECTS = [
  1.5, 1, 0.72, 1.5, 0.8, 1.6, 1, 0.72, 1.5, 1, 0.8, 1.5, 0.72, 1.6, 1,
];

const mediaRun = (nums: number[]): EdgeWarpItem[] =>
  nums.map((n) => ({
    kind: "media",
    src: IMG(n),
    alt: `Selected work frame ${n}`,
    aspect: ASPECTS[n - 1],
  }));

const DEFAULT_ITEMS: EdgeWarpItem[] = [
  {
    kind: "note",
    eyebrow: "BLANK Studio",
    heading: "Read it sideways",
    body: "Scroll down and the work travels across. Wheel, swipe, or grab the rail and pull. Tiles bend around the edge of the frame as they leave it.",
  },
  ...mediaRun([1, 2, 3, 4, 5]),
  {
    kind: "note",
    heading: "Every frame earns its width",
    body: "Portrait, square, and wide sit in one continuous line, each sized by its own proportions, so the rhythm never flattens into a grid.",
  },
  ...mediaRun([6, 7, 8, 9, 10]),
  {
    kind: "note",
    heading: "The edge does the work",
    body: "Near each side the sheet curves around the rim, so leaving the frame feels physical rather than a jump between slides.",
  },
  ...mediaRun([11, 12, 13, 14, 15]),
  {
    kind: "note",
    heading: "One long line, one read",
    body: "No sections to click through. The whole story lands in a single horizontal pass, paced entirely by your hand.",
  },
];

// Edge-warp shape. EDGE_ZONE is the fraction of the band width on each side
// where the sheet starts to bend; EDGE_POW keeps the middle flat and sharpens
// the curl right at the rim.
const EDGE_ZONE = 0.1; // fraction of the band width on each side that flares
const EDGE_POW = 2.6; // flat centre, sharp flare right at the rim
const FAN = 0.6; // vertical expansion away from the centreline at the rim (convex)
const CHROMA = 0.02; // R/B split at the deepest bend
const RADIUS = 5; // tile corner radius, px (matches the DOM tiles)
const SEG_X = 44; // horizontal plane subdivisions (smooth curve)
const SEG_Y = 10;
const HEADER_H = 190; // top space reserved for the header bar, px

type Mode = "warp" | "native" | "stack";

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

const VERT = `#version 300 es
in vec2 aPos;              // [0,1]x[0,1], aPos.y = 0 is the tile top
uniform vec4 uRect;        // x, y, w, h of the tile in band px (y down)
uniform vec2 uBand;        // band width, height in px
uniform float uEdgeZone;   // flare zone, fraction of band width
uniform float uEdgePow;    // falloff exponent
uniform float uFan;        // vertical expansion at the rim
uniform float uCenter;     // shared centreline (rail centre) in band px
uniform float uLeftGate, uRightGate; // 0 at the very start / end so tails stay flat
out vec2 vUv;
out float vBend;
void main(){
  vUv = aPos;
  vec2 screen = uRect.xy + aPos * uRect.zw;
  float sx = screen.x / uBand.x;             // 0..1 across the band
  float dist = min(sx, 1.0 - sx);            // 0 at the edges, 0.5 at the centre
  float edge = pow(smoothstep(uEdgeZone, 0.0, dist), uEdgePow);
  edge *= mix(uLeftGate, uRightGate, step(0.5, sx));
  // x is untouched; y is pushed AWAY from the shared centreline (factor > 1) so
  // the whole rail flares outward as one convex sheet at the rim.
  float y = uCenter + (screen.y - uCenter) * (1.0 + uFan * edge);
  vBend = edge;
  gl_Position = vec4(sx * 2.0 - 1.0, 1.0 - y / uBand.y * 2.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
in float vBend;
uniform sampler2D uTex;
uniform vec2 uUvScale, uUvOffset, uTile;
uniform float uChroma, uRadius, uAlpha;
out vec4 outColor;
void main(){
  vec2 uv = uUvOffset + vUv * uUvScale;
  float ca = uChroma * vBend;
  vec4 base = texture(uTex, uv);
  float r = texture(uTex, uv + vec2(0.0, ca)).r;
  float b = texture(uTex, uv - vec2(0.0, ca)).b;
  vec3 rgb = mix(base.rgb, vec3(r, base.g, b), clamp(vBend * 1.6, 0.0, 1.0));
  // rounded corners in unwarped tile pixels
  vec2 q = abs((vUv - 0.5) * uTile) - (uTile * 0.5 - uRadius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float mask = 1.0 - smoothstep(0.0, 1.5, d);
  outColor = vec4(rgb, uAlpha * mask * base.a);
}`;

function makeProgram(gl: WebGL2RenderingContext) {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export default function EdgeWarpRail({
  items = DEFAULT_ITEMS,
  label = "BLANK",
  intro = "Selected work, told as one continuous line. Drag the rail or scroll to move through it.",
  tags = ["Selected work", "2024 to 2026", "Scroll, drag, warp"],
  background = "#f6f5f1",
  textColor = "#17150f",
  mutedColor = "#8b877c",
  className,
  style,
}: EdgeWarpRailProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("stack");

  // Resolve layout mode from viewport and motion preference.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resolve = () =>
      setMode(!wide.matches ? "stack" : still.matches ? "native" : "warp");
    resolve();
    wide.addEventListener("change", resolve);
    still.addEventListener("change", resolve);
    return () => {
      wide.removeEventListener("change", resolve);
      still.removeEventListener("change", resolve);
    };
  }, []);

  // Shared tile height for the band modes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || mode === "stack") return;
    // Rail height leaves room for the header bar at the top; capped at 70%.
    const setBh = () =>
      root.style.setProperty(
        "--bh",
        `${Math.round(
          Math.min(root.clientHeight * 0.7, root.clientHeight - HEADER_H),
        )}px`,
      );
    setBh();
    const ro = new ResizeObserver(setBh);
    ro.observe(root);
    return () => ro.disconnect();
  }, [mode]);

  // The warp rig: scroll -> horizontal travel, drag-scrub, wheel-remap, and the
  // WebGL edge bend. Runs only when we own the scroll (desktop + motion).
  useEffect(() => {
    if (mode !== "warp") return;
    const root = rootRef.current;
    const outer = outerRef.current;
    const band = bandRef.current;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!root || !outer || !band || !track || !canvas) return;

    const figures = Array.from(
      track.querySelectorAll<HTMLElement>(".ewr-media"),
    );
    let scrollLen = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const measure = () => {
      band.style.height = `${root.clientHeight}px`;
      scrollLen = Math.max(track.scrollWidth - root.clientWidth, 0);
      outer.style.height = `${scrollLen + root.clientHeight}px`;
    };

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    // Scroll -> horizontal travel is shared by both the GL and no-GL paths.
    const translate = () => {
      const r = clamp(root.scrollTop, 0, scrollLen);
      track.style.transform = `translate3d(${-r}px,0,0)`;
      return r;
    };

    let raf = 0;
    let cleanupGl: (() => void) | null = null;

    if (gl) {
      root.classList.add("is-gl");
      const prog = makeProgram(gl);
      // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL call, not a React hook
      gl.useProgram(prog);

      // One shared subdivided unit grid, drawn per tile.
      const verts: number[] = [];
      const idx: number[] = [];
      for (let y = 0; y <= SEG_Y; y++)
        for (let x = 0; x <= SEG_X; x++) verts.push(x / SEG_X, y / SEG_Y);
      for (let y = 0; y < SEG_Y; y++)
        for (let x = 0; x < SEG_X; x++) {
          const a = y * (SEG_X + 1) + x;
          const b = a + 1;
          const c = a + (SEG_X + 1);
          const d = c + 1;
          idx.push(a, b, c, b, d, c);
        }
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(idx),
        gl.STATIC_DRAW,
      );

      const U = (n: string) => gl.getUniformLocation(prog, n);
      const u = {
        rect: U("uRect"),
        band: U("uBand"),
        edgeZone: U("uEdgeZone"),
        pow: U("uEdgePow"),
        fan: U("uFan"),
        center: U("uCenter"),
        leftGate: U("uLeftGate"),
        rightGate: U("uRightGate"),
        uvScale: U("uUvScale"),
        uvOffset: U("uUvOffset"),
        tile: U("uTile"),
        chroma: U("uChroma"),
        radius: U("uRadius"),
        alpha: U("uAlpha"),
      };
      gl.uniform1f(u.edgeZone, EDGE_ZONE);
      gl.uniform1f(u.pow, EDGE_POW);
      gl.uniform1f(u.fan, FAN);
      gl.uniform1f(u.chroma, CHROMA);
      gl.uniform1f(u.radius, RADIUS);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      type Tex = { tex: WebGLTexture; w: number; h: number; born: number };
      // undefined = not tried yet (retry next frame); null = failed, skip for good.
      const cache = new Map<HTMLImageElement, Tex | null>();
      const upload = (img: HTMLImageElement): Tex | null => {
        const cached = cache.get(img);
        if (cached !== undefined) return cached;
        if (!img.complete || !img.naturalWidth) return null;
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        try {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img,
          );
        } catch {
          // Cross-origin / tainted image: fall back to the plain DOM image
          // (it shows through the transparent canvas, just without the bend).
          gl.deleteTexture(tex);
          img.style.setProperty("opacity", "1", "important");
          cache.set(img, null);
          return null;
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const rec: Tex = {
          tex,
          w: img.naturalWidth,
          h: img.naturalHeight,
          born: performance.now(),
        };
        cache.set(img, rec);
        return rec;
      };

      // Caption cards are drawn to a 2D canvas and warped through the same
      // shader, so text bends at the rim too. Canvas keeps orientation and
      // transparency predictable (a DOM/SVG snapshot did not).
      const notes = Array.from(
        track.querySelectorAll<HTMLElement>(".ewr-note"),
      );
      const font =
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
      const noteCache = new Map<HTMLElement, Tex>();
      const renderNote = (el: HTMLElement, w: number, h: number) => {
        const cv = document.createElement("canvas");
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        const ctx = cv.getContext("2d");
        if (!ctx) return cv;
        ctx.scale(dpr, dpr);
        ctx.textBaseline = "top";
        const padX = 30;
        const eyebrow = (
          el.querySelector(".ewr-eyebrow")?.textContent ?? ""
        ).toUpperCase();
        const heading = el.querySelector(".ewr-heading")?.textContent ?? "";
        const body = el.querySelector(".ewr-body")?.textContent ?? "";
        const headFont = `500 24px ${font}`;
        const bodyFont = `13px ${font}`;
        const wrap = (text: string, f: string, mw: number) => {
          ctx.font = f;
          const out: string[] = [];
          let line = "";
          for (const word of text.split(" ")) {
            const test = line ? `${line} ${word}` : word;
            if (line && ctx.measureText(test).width > mw) {
              out.push(line);
              line = word;
            } else line = test;
          }
          if (line) out.push(line);
          return out;
        };
        const headLines = heading ? wrap(heading, headFont, w - padX * 2) : [];
        const bodyLines = body
          ? wrap(body, bodyFont, Math.min(w - padX * 2, 270))
          : [];
        const gap = 10;
        let total = 0;
        if (eyebrow) total += 16 + gap;
        if (headLines.length) total += headLines.length * 27 + gap;
        total += bodyLines.length * 19;
        let y = (h - total) / 2;
        if (eyebrow) {
          ctx.font = `11px ${font}`;
          ctx.fillStyle = mutedColor;
          ctx.fillText(eyebrow, padX, y);
          y += 16 + gap;
        }
        if (headLines.length) {
          ctx.font = headFont;
          ctx.fillStyle = textColor;
          for (const ln of headLines) {
            ctx.fillText(ln, padX, y);
            y += 27;
          }
          y += gap;
        }
        ctx.font = bodyFont;
        ctx.fillStyle = mutedColor;
        for (const ln of bodyLines) {
          ctx.fillText(ln, padX, y);
          y += 19;
        }
        return cv;
      };
      const uploadNote = (
        el: HTMLElement,
        w: number,
        h: number,
      ): Tex | null => {
        const c = noteCache.get(el);
        if (c && c.w === w && c.h === h) return c;
        if (c) gl.deleteTexture(c.tex);
        if (w < 1 || h < 1) return null;
        const tex = gl.createTexture();
        if (!tex) return null;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // A 2D canvas uploads with the opposite Y orientation to an <img> under
        // the global flip, so flip is off for this one upload, then restored.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          renderNote(el, w, h),
        );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const rec: Tex = { tex, w, h, born: performance.now() };
        noteCache.set(el, rec);
        return rec;
      };

      let cw = 0;
      const draw = () => {
        const scrolled = translate();
        const bandRect = band.getBoundingClientRect();
        const bw = bandRect.width;
        const bh = bandRect.height;
        if (canvas.width !== Math.round(bw * dpr) || cw !== bw) {
          cw = bw;
          canvas.width = Math.round(bw * dpr);
          canvas.height = Math.round(bh * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const trackRect = track.getBoundingClientRect();
        gl.uniform2f(u.band, bw, bh);
        // Shared centreline = the rail's vertical centre (it sits at the bottom).
        gl.uniform1f(
          u.center,
          trackRect.top + trackRect.height / 2 - bandRect.top,
        );
        // Gate the flare from scroll progress so the very start and end read
        // flat. (The track box is width-clamped by the column flex, so its rect
        // can't measure the real content extent; scroll position can.)
        const ez = EDGE_ZONE * bw;
        gl.uniform1f(u.leftGate, clamp(scrolled / ez, 0, 1));
        gl.uniform1f(u.rightGate, clamp((scrollLen - scrolled) / ez, 0, 1));
        const now = performance.now();
        gl.uniform1f(u.radius, RADIUS);
        for (const fig of figures) {
          const img = fig.querySelector("img");
          if (!img) continue;
          const rec = upload(img);
          if (!rec) continue;
          const rect = fig.getBoundingClientRect();
          const left = rect.left - bandRect.left;
          const top = rect.top - bandRect.top;
          if (left > bw || rect.right - bandRect.left < 0) continue;
          const tileA = rect.width / rect.height;
          const imgA = rec.w / rec.h;
          let sx = 1;
          let sy = 1;
          if (imgA > tileA) sx = tileA / imgA;
          else sy = imgA / tileA;
          gl.uniform4f(u.rect, left, top, rect.width, rect.height);
          gl.uniform2f(u.uvScale, sx, sy);
          gl.uniform2f(u.uvOffset, (1 - sx) / 2, (1 - sy) / 2);
          gl.uniform2f(u.tile, rect.width, rect.height);
          gl.uniform1f(u.alpha, clamp((now - rec.born) / 420, 0, 1));
          gl.bindTexture(gl.TEXTURE_2D, rec.tex);
          gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        }
        // Caption cards: same warp, square corners, no object-fit crop.
        gl.uniform1f(u.radius, 0);
        gl.uniform2f(u.uvScale, 1, 1);
        gl.uniform2f(u.uvOffset, 0, 0);
        for (const el of notes) {
          const rect = el.getBoundingClientRect();
          const left = rect.left - bandRect.left;
          if (left > bw || rect.right - bandRect.left < 0) continue;
          const rec = uploadNote(
            el,
            Math.round(rect.width),
            Math.round(rect.height),
          );
          if (!rec) continue;
          gl.uniform4f(
            u.rect,
            left,
            rect.top - bandRect.top,
            rect.width,
            rect.height,
          );
          gl.uniform2f(u.tile, rect.width, rect.height);
          gl.uniform1f(u.alpha, clamp((now - rec.born) / 420, 0, 1));
          gl.bindTexture(gl.TEXTURE_2D, rec.tex);
          gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        }
      };
      const loop = () => {
        raf = requestAnimationFrame(loop);
        draw();
      };
      raf = requestAnimationFrame(loop);
      cleanupGl = () => {
        root.classList.remove("is-gl");
        for (const rec of cache.values()) if (rec) gl.deleteTexture(rec.tex);
        for (const rec of noteCache.values()) gl.deleteTexture(rec.tex);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    } else {
      // No WebGL2: keep the sideways scroll, drop the bend.
      const loop = () => {
        raf = requestAnimationFrame(loop);
        translate();
      };
      raf = requestAnimationFrame(loop);
    }

    const onWheel = (ev: WheelEvent) => {
      let dx = ev.deltaX;
      let dy = ev.deltaY;
      if (ev.deltaMode === 1) {
        dx *= 16;
        dy *= 16;
      } else if (ev.deltaMode === 2) {
        dx *= root.clientHeight;
        dy *= root.clientHeight;
      }
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (d) {
        ev.preventDefault();
        root.scrollTop += d;
      }
    };

    let dragging = false;
    let moved = false;
    let startX = 0;
    let lastX = 0;
    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = ev.clientX;
    };
    const onMove = (ev: PointerEvent) => {
      if (!dragging) return;
      if (!moved) {
        if (Math.abs(ev.clientX - startX) < 4) return;
        moved = true;
        track.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
      ev.preventDefault();
      root.scrollTop += lastX - ev.clientX;
      lastX = ev.clientX;
    };
    const onUp = () => {
      dragging = false;
      moved = false;
      track.style.cursor = "";
      document.body.style.userSelect = "";
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(track);
    const imgs = Array.from(track.querySelectorAll("img"));
    for (const img of imgs) img.addEventListener("load", measure);
    root.addEventListener("wheel", onWheel, { passive: false });
    band.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      cleanupGl?.();
      ro.disconnect();
      for (const img of imgs) img.removeEventListener("load", measure);
      root.removeEventListener("wheel", onWheel);
      band.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      track.style.transform = "";
      outer.style.height = "";
      band.style.height = "";
    };
  }, [mode, items, textColor, mutedColor]);

  // Native fallback: vertical wheel scrolls the horizontal overflow.
  useEffect(() => {
    if (mode !== "native") return;
    const band = bandRef.current;
    if (!band) return;
    const onWheel = (ev: WheelEvent) => {
      const d =
        Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY;
      if (d) {
        ev.preventDefault();
        band.scrollLeft += d;
      }
    };
    band.addEventListener("wheel", onWheel, { passive: false });
    return () => band.removeEventListener("wheel", onWheel);
  }, [mode]);

  const onImgLoad = (ev: React.SyntheticEvent<HTMLImageElement>) => {
    ev.currentTarget.style.opacity = "1";
  };

  const tiles = items.map((item, i) => {
    if (item.kind === "media") {
      return (
        <figure
          key={`m-${i}-${item.src}`}
          className="ewr-tile ewr-media"
          style={{ aspectRatio: String(item.aspect) }}
        >
          <img
            className="ewr-img"
            src={item.src}
            alt={item.alt}
            // CORS-clean so the WebGL overlay can upload it as a texture.
            crossOrigin="anonymous"
            draggable={false}
            loading={i < 3 ? "eager" : "lazy"}
            decoding="async"
            onLoad={onImgLoad}
          />
        </figure>
      );
    }
    return (
      <div key={`n-${i}`} className="ewr-tile ewr-note">
        {item.eyebrow ? <p className="ewr-eyebrow">{item.eyebrow}</p> : null}
        {item.heading ? <h3 className="ewr-heading">{item.heading}</h3> : null}
        <p className="ewr-body">{item.body}</p>
      </div>
    );
  });

  const header = (
    <header className="ewr-header">
      <p className="ewr-label">{label}</p>
      <div className="ewr-meta">
        <p className="ewr-intro">{intro}</p>
        <div className="ewr-tags">
          {tags.map((tag) => (
            <p key={tag}>{tag}</p>
          ))}
        </div>
      </div>
    </header>
  );

  const rootStyle = {
    ...style,
    ["--ewr-bg" as string]: background,
    ["--ewr-text" as string]: textColor,
    ["--ewr-muted" as string]: mutedColor,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`ewr-root is-${mode}${className ? ` ${className}` : ""}`}
      style={rootStyle}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: scoped component stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {mode !== "warp" ? header : null}
      {mode === "stack" ? (
        <div className="ewr-column">{tiles}</div>
      ) : mode === "native" ? (
        <div ref={bandRef} className="ewr-band ewr-band-native">
          <div ref={trackRef} className="ewr-track">
            {tiles}
          </div>
        </div>
      ) : (
        <div ref={outerRef} className="ewr-outer">
          {/* Sticky so the header bar and the rail both stay pinned while the
              page scrolls; the header sits above the masked band, unmasked. */}
          <div className="ewr-sticky">
            {header}
            <div ref={bandRef} className="ewr-band">
              <div ref={trackRef} className="ewr-track">
                {tiles}
                <div className="ewr-tail" aria-hidden />
              </div>
              <canvas ref={canvasRef} className="ewr-canvas" aria-hidden />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.ewr-root{position:relative;width:100%;height:100%;background:var(--ewr-bg);color:var(--ewr-text);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;}
.ewr-root.is-warp,.ewr-root.is-stack{overflow-y:auto;overflow-x:hidden;}
.ewr-root.is-native{overflow:hidden;}
.ewr-root::-webkit-scrollbar{display:none;}
.ewr-root{scrollbar-width:none;}
.ewr-header{position:absolute;top:0;left:0;right:0;z-index:6;display:flex;flex-direction:row;justify-content:space-between;gap:24px;padding:20px 22px;pointer-events:none;}
.ewr-label{font-size:13px;font-weight:600;letter-spacing:.04em;}
.ewr-meta{display:flex;flex-direction:column;gap:12px;max-width:320px;}
.ewr-intro{font-size:13px;line-height:1.4;color:var(--ewr-muted);text-wrap:balance;}
.ewr-tags{display:flex;flex-direction:column;font-size:12px;line-height:1.5;color:var(--ewr-muted);}
.ewr-outer{position:relative;}
.ewr-sticky{position:sticky;top:0;}
.ewr-band{position:relative;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:8px;overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent 0,#000 6%,#000 94%,transparent 100%);mask-image:linear-gradient(to right,transparent 0,#000 6%,#000 94%,transparent 100%);}
.ewr-band-native{height:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;}
.ewr-band-native::-webkit-scrollbar{display:none;}
.ewr-track{position:relative;z-index:1;display:flex;flex-direction:row;align-items:center;gap:8px;height:var(--bh);padding:0 8px;will-change:transform;}
.ewr-root.is-warp .ewr-track{cursor:grab;}
.ewr-canvas{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;}
.ewr-tile{position:relative;flex:0 0 auto;height:var(--bh);border-radius:5px;overflow:hidden;}
.ewr-media{background:rgba(0,0,0,.05);}
.ewr-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .55s ease;}
.ewr-root.is-gl .ewr-media{background:transparent;}
.ewr-root.is-gl .ewr-img{opacity:0!important;transition:none;}
.ewr-root.is-gl .ewr-note{visibility:hidden;}
.ewr-note{display:flex;flex-direction:column;justify-content:center;gap:10px;width:340px;padding:0 30px;}
.ewr-eyebrow{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--ewr-muted);}
.ewr-heading{font-size:24px;line-height:1.12;font-weight:500;letter-spacing:-.01em;}
.ewr-body{font-size:13px;line-height:1.45;color:var(--ewr-muted);max-width:270px;text-wrap:balance;}
.ewr-tail{flex:0 0 auto;width:2px;height:var(--bh);}
.ewr-column{display:flex;flex-direction:column;gap:8px;padding:16px 12px 12px;}
.ewr-root.is-stack .ewr-header{position:static;flex-direction:column;gap:12px;}
.ewr-root.is-stack .ewr-meta{max-width:none;}
.ewr-root.is-stack .ewr-tile{height:auto;width:100%;}
.ewr-root.is-stack .ewr-note{width:100%;padding:14px 4px;}
.ewr-root.is-stack .ewr-heading{font-size:22px;}
`;
