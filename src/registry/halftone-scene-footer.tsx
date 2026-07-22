"use client";

/**
 * Halftone Scene Footer - a footer whose backdrop is live video redrawn as a
 * vertical-line halftone.
 *
 * Two muted videos (grazing sheep, a mountain ridge) are sampled on a coarse
 * grid by a WebGL fragment shader. Each cell becomes one vertical line whose
 * width maps to the cell's darkness after a levels pass (black point, white
 * point, gamma), so the footage reads as a woven, barcode-like engraving in
 * two inks. The mountain layer inverts its levels and punches transparent
 * slits into an opaque dark field, revealing a warm ground plane behind the
 * canvas; the sheep layer draws light lines on dark.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/halftone-scene-footer";

export interface HalftoneLayer {
  /** Video source URL. Must be CORS-readable. */
  src: string;
  /** Placement inside the canvas, percentages of the canvas box. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Levels: swap black/white points to invert the mapping. */
  blackPoint: number;
  whitePoint: number;
  gamma?: number;
  /** Brightness above threshold/255 renders as flat background. */
  threshold?: number;
  /** Sampling grid density. */
  xSquares?: number;
  ySquares?: number;
  /** Opacity of the background field and of the halftone lines. */
  bgOpacity: number;
  fillOpacity: number;
  /** Sample the video upside down. */
  flipY?: boolean;
}

export interface HalftoneSceneFooterProps {
  /** Override the two default scene layers entirely. */
  layers?: HalftoneLayer[];
  /** Dark ink: canvas background field and page backdrop. */
  backgroundColor?: string;
  /** Light ink: halftone lines and text. */
  inkColor?: string;
  brand?: string;
  locationEyebrow?: string;
  locationLines?: string[];
  officeEyebrow?: string;
  officeLines?: string[];
  phone?: string;
  email?: string;
  copyright?: string;
  privacyLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Fraction of the footer height covered by the warm backdrop block. It is
 * shorter than the mountain band on purpose: slits above this line fall on
 * the dark page and vanish, which is what cuts the fence of halftone stripes
 * at one uniform height.
 */
const GROUND = 0.25;

/** Fraction of the footer height covered by the mountain halftone band. */
const BAND = 0.325;

const DEFAULT_LAYERS: HalftoneLayer[] = [
  {
    // Mountain ridge: inverted levels, opaque dark field with transparent
    // slits that reveal the warm ground plane behind the canvas. Flipped
    // vertically so the bright sky becomes the tan floor and the ridge
    // gradient reads as a fence of stripes above it.
    src: `${ASSET_BASE}/mountain.mp4`,
    x: 0,
    y: (1 - BAND) * 100,
    width: 100,
    height: BAND * 100,
    blackPoint: 240,
    whitePoint: 50,
    bgOpacity: 1,
    fillOpacity: 0,
    flipY: true,
  },
  {
    // Sheep: light lines on dark, denser grid for the finer silhouette.
    src: `${ASSET_BASE}/sheep.mp4`,
    x: 30,
    y: 5,
    width: 40,
    height: 95,
    blackPoint: 0,
    whitePoint: 215,
    xSquares: 150,
    ySquares: 125,
    bgOpacity: 1,
    fillOpacity: 1,
  },
];

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Cells whose sampled texel (or any texel in a 2-texel ring around it) is
// transparent or near-black are discarded, which trims the halftone cleanly
// to the subject instead of leaving a hard rectangular frame.
const EDGE_RADIUS = 2;

function buildFragmentShader() {
  let neighborChecks = "";
  for (let dx = -EDGE_RADIUS; dx <= EDGE_RADIUS; dx++) {
    for (let dy = -EDGE_RADIUS; dy <= EDGE_RADIUS; dy++) {
      if (dx === 0 && dy === 0) continue;
      neighborChecks += `
  neighbor = texture2D(u_texture, cc + vec2(${dx.toFixed(1)}, ${dy.toFixed(1)}) * texelSize);
  if (neighbor.a < 0.01 || (neighbor.r < 0.01 && neighbor.g < 0.01 && neighbor.b < 0.01)) discard;`;
    }
  }
  return `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_texSize;
uniform vec2 u_gridSize;
uniform float u_minWidth;
uniform float u_maxWidth;
uniform float u_threshold;
uniform float u_gamma;
uniform float u_blackPoint;
uniform float u_whitePoint;
uniform vec3 u_bgColor;
uniform vec3 u_fillColor;
uniform float u_bgOpacity;
uniform float u_fillOpacity;
uniform float u_flipY;
uniform vec4 u_bounds;

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 b0 = u_bounds.xy;
  vec2 b1 = u_bounds.zw;
  if (p.x < b0.x || p.x > b1.x || p.y < b0.y || p.y > b1.y) discard;

  vec2 lc = (p - b0) / (b1 - b0);
  vec2 cs = 1.0 / u_gridSize;
  vec2 ci = floor(lc / cs);
  vec2 cc = (ci + 0.5) * cs;
  if (u_flipY > 0.5) cc.y = 1.0 - cc.y;

  vec4 tc = texture2D(u_texture, cc);
  if (tc.a < 0.01 || (tc.r < 0.01 && tc.g < 0.01 && tc.b < 0.01)) discard;

  vec2 texelSize = 1.0 / u_texSize;
  vec4 neighbor;${neighborChecks}

  vec3 rgb = tc.rgb;
  if (u_gamma != 1.0) rgb = pow(rgb, vec3(u_gamma));
  float range = u_whitePoint - u_blackPoint;
  if (range != 0.0) {
    rgb = clamp((rgb * 255.0 - u_blackPoint) / range, 0.0, 1.0);
  }

  float br = dot(rgb, vec3(0.333)) * tc.a;
  if (br > u_threshold / 255.0) {
    gl_FragColor = vec4(u_bgColor, u_bgOpacity);
    return;
  }

  vec2 cl = (lc - ci * cs) / cs;
  float lw = ((1.0 - br) * (u_maxWidth - u_minWidth) + u_minWidth)
    / (b1.x - b0.x) * u_gridSize.x;

  gl_FragColor = abs(cl.x - 0.5) < lw * 0.5
    ? vec4(u_fillColor, u_fillOpacity)
    : vec4(u_bgColor, u_bgOpacity);
}
`;
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2]
      : raw;
  return [
    Number.parseInt(full.slice(0, 2), 16) / 255,
    Number.parseInt(full.slice(2, 4), 16) / 255,
    Number.parseInt(full.slice(4, 6), 16) / 255,
  ];
}

interface LayerRuntime {
  config: HalftoneLayer;
  video: HTMLVideoElement;
  texture: WebGLTexture;
  ready: boolean;
  lastTime: number;
}

function useHalftoneCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  layers: HalftoneLayer[],
  backgroundColor: string,
  inkColor: string,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, buildFragmentShader());
    if (!vs || !fs) return;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
    gl.useProgram(program);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      texSize: u("u_texSize"),
      grid: u("u_gridSize"),
      minW: u("u_minWidth"),
      maxW: u("u_maxWidth"),
      threshold: u("u_threshold"),
      gamma: u("u_gamma"),
      blackPoint: u("u_blackPoint"),
      whitePoint: u("u_whitePoint"),
      bg: u("u_bgColor"),
      fill: u("u_fillColor"),
      bgOpacity: u("u_bgOpacity"),
      fillOpacity: u("u_fillOpacity"),
      flipY: u("u_flipY"),
      bounds: u("u_bounds"),
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform3fv(loc.bg, hexToRgb(backgroundColor));
    gl.uniform3fv(loc.fill, hexToRgb(inkColor));

    const runtimes: LayerRuntime[] = layers.map((config) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.src = config.src;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const runtime: LayerRuntime = {
        config,
        video,
        texture,
        ready: false,
        lastTime: -1,
      };
      const onReady = () => {
        if (runtime.ready || video.readyState < video.HAVE_CURRENT_DATA) return;
        runtime.ready = true;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );
        if (visible) video.play().catch(() => {});
      };
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("canplay", onReady);
      video.load();
      return runtime;
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let visible = false;
    let raf = 0;

    const resize = () => {
      const w = Math.round(canvas.offsetWidth * dpr);
      const h = Math.round(canvas.offsetHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const drawLayer = (rt: LayerRuntime) => {
      const c = rt.config;
      gl.bindTexture(gl.TEXTURE_2D, rt.texture);
      if (rt.video.currentTime !== rt.lastTime) {
        rt.lastTime = rt.video.currentTime;
        try {
          gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            0,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            rt.video,
          );
        } catch {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            rt.video,
          );
        }
      }
      const vw = rt.video.videoWidth || 1920;
      const vh = rt.video.videoHeight || 1080;
      gl.uniform2f(loc.texSize, vw, vh);
      const xSquares = c.xSquares ?? 100;
      const ySquares = c.ySquares ?? 100;
      gl.uniform2f(loc.grid, xSquares, ySquares);
      const W = canvas.width;
      const H = canvas.height;
      const x = (c.x / 100) * W;
      const yTop = (c.y / 100) * H;
      const w = (c.width / 100) * W;
      const h = (c.height / 100) * H;
      const cell = w / xSquares;
      // Line width sweeps slightly past the cell so full darkness fuses solid.
      gl.uniform1f(loc.minW, -0.02 * cell);
      gl.uniform1f(loc.maxW, 1.02 * cell);
      gl.uniform1f(loc.threshold, c.threshold ?? 255);
      gl.uniform1f(loc.gamma, c.gamma ?? 1);
      gl.uniform1f(loc.blackPoint, c.blackPoint);
      gl.uniform1f(loc.whitePoint, c.whitePoint);
      gl.uniform1f(loc.bgOpacity, c.bgOpacity);
      gl.uniform1f(loc.fillOpacity, c.fillOpacity);
      gl.uniform1f(loc.flipY, c.flipY ? 1 : 0);
      // u_bounds is in gl_FragCoord space, origin bottom left.
      const yBottom = H - yTop - h;
      gl.uniform4f(loc.bounds, x, yBottom, x + w, yBottom + h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const render = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const rt of runtimes) {
        if (rt.ready && rt.video.readyState >= rt.video.HAVE_CURRENT_DATA) {
          drawLayer(rt);
        }
      }
      raf = requestAnimationFrame(render);
    };

    const intersection = new IntersectionObserver(
      (entries) => {
        const next = entries[0].isIntersecting;
        if (next === visible) return;
        visible = next;
        for (const rt of runtimes) {
          if (!rt.ready) continue;
          if (visible) rt.video.play().catch(() => {});
          else rt.video.pause();
        }
        if (visible) {
          raf = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.01, rootMargin: "20% 0px 20% 0px" },
    );
    intersection.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      for (const rt of runtimes) {
        gl.deleteTexture(rt.texture);
        rt.video.pause();
        rt.video.removeAttribute("src");
        rt.video.load();
      }
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, [canvasRef, layers, backgroundColor, inkColor]);
}

export default function HalftoneSceneFooter({
  layers = DEFAULT_LAYERS,
  backgroundColor = "#2c2824",
  inkColor = "#a89474",
  brand = "BLANK",
  locationEyebrow = "Location",
  locationLines = ["Somewhere in the Carpathians,", "far above the tree line"],
  officeEyebrow = "Studio",
  officeLines = ["aryank.space", "Components, motion, code"],
  phone = "+91 8421911353",
  email = "hello@aryank.space",
  copyright = "© 2026 BLANK. All rights reserved",
  privacyLabel = "Privacy policy",
  className,
  style,
}: HalftoneSceneFooterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHalftoneCanvas(canvasRef, layers, backgroundColor, inkColor);

  return (
    <footer
      className={`htsf-root${className ? ` ${className}` : ""}`}
      style={
        {
          "--htsf-bg": backgroundColor,
          "--htsf-ink": inkColor,
          "--htsf-ground": `${GROUND * 100}%`,
          ...style,
        } as React.CSSProperties
      }
    >
      <style>{STYLES}</style>
      <div className="htsf-ground" aria-hidden="true" />
      <canvas ref={canvasRef} className="htsf-canvas" />
      <div className="htsf-content">
        <header className="htsf-top">
          <div className="htsf-block">
            <p className="htsf-eyebrow">{locationEyebrow}</p>
            {locationLines.map((line) => (
              <p key={line} className="htsf-line">
                {line}
              </p>
            ))}
          </div>
          <p className="htsf-brand">{brand}</p>
          <div className="htsf-block htsf-block-right">
            <p className="htsf-eyebrow">{officeEyebrow}</p>
            {officeLines.map((line) => (
              <p key={line} className="htsf-line">
                {line}
              </p>
            ))}
          </div>
        </header>
        <div className="htsf-contacts">
          <a className="htsf-contact" href={`tel:${phone.replace(/\s/g, "")}`}>
            {phone}
          </a>
          <a className="htsf-contact" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
        <div className="htsf-bottom">
          <p className="htsf-small">{copyright}</p>
          <p className="htsf-small">{privacyLabel}</p>
        </div>
      </div>
    </footer>
  );
}

const STYLES = `
.htsf-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
  background: var(--htsf-bg);
  color: var(--htsf-ink);
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.htsf-ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--htsf-ground);
  background: var(--htsf-ink);
}
.htsf-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.htsf-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: clamp(16px, 3vw, 40px);
  pointer-events: none;
}
.htsf-content a {
  pointer-events: auto;
}
.htsf-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}
.htsf-brand {
  font-size: clamp(20px, 2.4vw, 34px);
  font-weight: 700;
  letter-spacing: 0.2em;
  margin: 0;
}
.htsf-block {
  max-width: 260px;
}
.htsf-block-right {
  text-align: right;
}
.htsf-eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  opacity: 0.55;
}
.htsf-line {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}
.htsf-contacts {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
}
.htsf-contact {
  color: inherit;
  text-decoration: none;
  font-size: clamp(16px, 2vw, 28px);
  letter-spacing: 0.06em;
  border-bottom: 1px solid currentColor;
  padding-bottom: 4px;
  transition: opacity 0.25s ease;
}
.htsf-contact:hover {
  opacity: 0.7;
}
.htsf-bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  color: var(--htsf-bg);
}
.htsf-small {
  margin: 0;
  font-size: 11px;
}
@media (max-width: 640px) {
  .htsf-brand {
    display: none;
  }
  .htsf-block {
    max-width: 46%;
  }
}
`;
