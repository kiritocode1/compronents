"use client";

/**
 * ASCII TV Hero
 *
 * A hero where a video plays as a wall of ASCII glyphs inside a bulging CRT
 * tube: every cell samples the video, maps its brightness to a character from
 * a density ramp, and the whole grid is fisheyed and masked by a TV-tube
 * silhouette. Moving the pointer smears nearby cells along a decaying trail
 * with chromatic splitting and chunky re-pixelation. Scrolling expands the
 * set from a floating television to a fullscreen wall while the tube
 * flattens away.
 *
 * The component owns its scroll container, so it embeds in a bounded box.
 * The glyph atlas is drawn at runtime; the only external file is the video.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef } from "react";

export interface AsciiTvHeroProps {
  /** Video the glyph wall samples. Must be CORS-readable. */
  videoSrc?: string;
  /** Copy pinned to the bottom left; fades out as the TV expands. */
  headline?: [string, string];
  /** Scroll distance of the expansion, in viewport heights. */
  scrollLength?: number;
  /** Glyph cell size in CSS pixels. */
  cellSize?: number;
  /** Characters from densest ink to empty space. */
  glyphRamp?: string;
  className?: string;
}

const DEFAULT_VIDEO =
  "https://ui.aryank.space/assets/film-studio-page/hero/hero-footage.mp4";
const DEFAULT_HEADLINE: [string, string] = [
  "Interfaces, motion and code.",
  "One integrated practice.",
];
const DEFAULT_RAMP = "@#W$9876543210?!abc;:+=-,._  ";

const TRAIL_MAX = 24;
/** The TV reaches full size and zero tube curvature at 85% of the scroll. */
const EXPAND_END = 0.85;

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uVideo;
uniform sampler2D uGlyphs;
uniform vec2 uResolution;
uniform vec2 uVideoSize;
uniform float uCell;
uniform float uGlyphCount;
uniform float uBrightness;
uniform float uContrast;
uniform float uFisheye;
uniform float uTvness;
uniform float uChroma;
uniform float uBloom;
uniform float uWarp;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uTime;
uniform float uTrailCount;
uniform vec4 uTrail[${TRAIL_MAX}];

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Object-fit cover: map canvas UVs into the video's aspect.
vec2 coverUv(vec2 uv) {
  float videoAspect = uVideoSize.x / uVideoSize.y;
  float screenAspect = uResolution.x / max(uResolution.y, 1.0);
  if (screenAspect > videoAspect) {
    float s = videoAspect / screenAspect;
    uv.y = uv.y * s + (1.0 - s) * 0.5;
  } else {
    float s = screenAspect / videoAspect;
    uv.x = uv.x * s + (1.0 - s) * 0.5;
  }
  return uv;
}

vec2 fisheye(vec2 uv, float strength) {
  vec2 p = uv * 2.0 - 1.0;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  p.x *= aspect;
  p *= 1.0 + strength * dot(p, p);
  p.x /= aspect;
  return p * 0.5 + 0.5;
}

// Signed distance to a rounded TV-tube silhouette: a box whose horizontal
// edges bow outward toward the vertical middle and vice versa.
float tubeDistance(vec2 p, vec2 size, float sideBulge, float topBulge, float bottomBulge) {
  float yNorm = clamp(p.y / size.y, -1.0, 1.0);
  float halfWidth = size.x + sideBulge * (1.0 - yNorm * yNorm);
  float xNorm = clamp(p.x / size.x, -1.0, 1.0);
  float vBulge = p.y < 0.0 ? bottomBulge : topBulge;
  float halfHeight = size.y + vBulge * (1.0 - xNorm * xNorm);
  vec2 d = abs(p) - vec2(halfWidth, halfHeight);
  return max(d.x, d.y);
}

// Video sample with hover degradation: chunkier pixel grid and RGB
// separation along the drag direction where the trail has influence.
vec3 sampleVideo(vec2 uv, vec2 dragDir, float influence) {
  float grid = mix(260.0, 70.0, clamp(influence, 0.0, 1.0));
  vec2 quantized = floor(uv * grid) / grid;
  vec2 shift = dragDir * uChroma * 0.0022 * influence * (0.8 + influence * 2.2);
  return vec3(
    texture2D(uVideo, quantized + shift).r,
    texture2D(uVideo, quantized).g,
    texture2D(uVideo, quantized - shift).b
  );
}

void main() {
  vec2 frag = vUv * uResolution;
  vec2 cellCoord = floor(frag / uCell);
  vec2 cellCenter = (cellCoord + 0.5) * uCell;
  vec2 cellUv = cellCenter / uResolution;

  // Accumulate drag from the pointer trail: a soft disc at the head plus
  // tapered, aging, noise-broken segments along the recent path.
  vec2 drag = vec2(0.0);
  float accum = 0.0;

  if (uTrailCount > 0.5) {
    vec2 head = uTrail[0].xy * uResolution;
    float headMask = 1.0 - smoothstep(uMouseRadius * 0.2, uMouseRadius * 0.95, distance(cellCenter, head));
    drag += normalize(uTrail[0].zw + vec2(0.0001)) * headMask * 0.55;
    accum += headMask * 0.55;
  }

  for (int i = 0; i < ${TRAIL_MAX - 1}; i++) {
    if (float(i + 1) >= uTrailCount) break;
    vec2 a = uTrail[i].xy * uResolution;
    vec2 b = uTrail[i + 1].xy * uResolution;
    vec2 seg = b - a;
    float segLen2 = max(dot(seg, seg), 0.0001);
    float h = clamp(dot(cellCenter - a, seg) / segLen2, 0.0, 1.0);
    float dist = distance(cellCenter, a + seg * h);

    float widthPx = uMouseRadius * 0.4;
    float mask = 1.0 - smoothstep(widthPx, widthPx * 2.35, dist);
    mask *= mix(1.0, 0.65, h);
    mask *= exp(-float(i) / 3.44);
    float speed = length(uTrail[i].zw) + length(uTrail[i + 1].zw);
    mask *= mix(0.24, 1.0, smoothstep(0.00025, 0.010, speed));
    float breakup = hash(cellCoord + (a + seg * h) * 0.012 + vec2(float(i) * 11.7, uTime * 19.0));
    mask *= smoothstep(0.08, 0.96, breakup);

    drag += (seg / sqrt(segLen2)) * mask;
    accum += mask;
  }

  float influence = clamp(accum * uMouseStrength * 1.25, 0.0, 1.0);
  vec2 dragDir = normalize(drag + vec2(0.0001));

  // Warp the sampling point: cell-quantized drag, a scanline tear, and a
  // small travelling wave, all gated by trail influence.
  vec2 cellStep = vec2(uCell) / uResolution;
  vec2 dragOffset = floor((drag * uWarp * 0.9 * influence / uResolution) / cellStep) * cellStep;
  float scan = sin(cellCenter.y * 0.34 + uTime * 70.0) * 0.5;
  vec2 wave = vec2(
    sin((cellCenter.y + uTime * 180.0) * 0.03),
    cos((cellCenter.x - uTime * 140.0) * 0.028)
  ) * (uWarp * 0.12 / uResolution) * influence;

  cellUv += dragOffset + vec2(scan * 0.14 * influence, 0.0) + wave;
  cellUv = fisheye(cellUv, uFisheye * uTvness);
  cellUv = clamp(cellUv, vec2(0.001), vec2(0.999));
  vec2 videoUv = mix(vec2(0.5), coverUv(cellUv), 0.82);

  // Tube silhouette in screen space; curvature relaxes as uTvness drops.
  vec2 tubeP = vUv * 2.0 - 1.0;
  vec2 tubeSize = mix(vec2(1.0), vec2(0.93, 0.80), uTvness);
  float tubeDist = tubeDistance(
    tubeP,
    tubeSize,
    mix(0.0, 0.035, uTvness),
    mix(0.0, 0.14, uTvness),
    mix(0.0, 0.15, uTvness)
  );
  float edge = uCell * 0.8 * (2.0 / min(uResolution.x, uResolution.y));
  float tubeMask = 1.0 - smoothstep(0.0, edge, tubeDist);

  vec3 color = sampleVideo(videoUv, dragDir, influence);

  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  luma = clamp((luma - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  luma = clamp(luma + (hash(cellCoord + floor(uTime * 55.0)) - 0.5) * 0.5 * influence, 0.0, 1.0);

  // Darker cells pick denser glyphs from the atlas strip.
  float glyphIndex = floor((1.0 - luma) * (uGlyphCount - 1.0) + 0.5);
  vec2 local = clamp((mod(frag, uCell) / uCell - 0.5) / 1.6 + 0.5, 0.0, 1.0);
  float glyphMask = texture2D(uGlyphs, vec2((glyphIndex + local.x) / uGlyphCount, local.y)).r;
  vec3 ascii = color * glyphMask;

  // Bloom from four neighbour taps of the raw video.
  vec2 px = 2.0 / uResolution;
  vec3 blurred = (
    sampleVideo(videoUv + vec2(px.x, 0.0), dragDir, influence) +
    sampleVideo(videoUv - vec2(px.x, 0.0), dragDir, influence) +
    sampleVideo(videoUv + vec2(0.0, px.y), dragDir, influence) +
    sampleVideo(videoUv - vec2(0.0, px.y), dragDir, influence)
  ) * 0.25;
  float bright = max(max(blurred.r, blurred.g), blurred.b);
  vec3 outColor = ascii + blurred * smoothstep(0.58, 1.0, bright) * uBloom;

  // Premultiplied alpha so the tube cutout composites cleanly.
  gl_FragColor = vec4(clamp(outColor, 0.0, 1.0) * tubeMask, tubeMask);
}
`;

function buildGlyphAtlas(ramp: string) {
  const glyph = 52;
  const canvas = document.createElement("canvas");
  canvas.width = ramp.length * glyph;
  canvas.height = glyph;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.floor(glyph * 0.78)}px Menlo, Monaco, "Courier New", monospace`;
  for (let i = 0; i < ramp.length; i += 1) {
    ctx.fillText(ramp[i], i * glyph + glyph * 0.5, glyph * 0.54);
  }
  return canvas;
}

function compileProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function AsciiTvHero({
  videoSrc = DEFAULT_VIDEO,
  headline = DEFAULT_HEADLINE,
  scrollLength = 3,
  cellSize = 6,
  glyphRamp = DEFAULT_RAMP,
  className,
}: AsciiTvHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scope = scopeRef.current;
    const frame = frameRef.current;
    const headlineEl = headlineRef.current;
    const canvas = canvasRef.current;
    if (!root || !scope || !frame || !headlineEl || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const video = document.createElement("video");
    video.src = videoSrc;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const program = compileProgram(gl, VERTEX, FRAGMENT);
    if (!program) return;
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      video: uniform("uVideo"),
      glyphs: uniform("uGlyphs"),
      resolution: uniform("uResolution"),
      videoSize: uniform("uVideoSize"),
      cell: uniform("uCell"),
      glyphCount: uniform("uGlyphCount"),
      brightness: uniform("uBrightness"),
      contrast: uniform("uContrast"),
      fisheye: uniform("uFisheye"),
      tvness: uniform("uTvness"),
      chroma: uniform("uChroma"),
      bloom: uniform("uBloom"),
      warp: uniform("uWarp"),
      mouseRadius: uniform("uMouseRadius"),
      mouseStrength: uniform("uMouseStrength"),
      time: uniform("uTime"),
      trail: uniform("uTrail[0]"),
      trailCount: uniform("uTrailCount"),
    };

    const makeTexture = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    };
    const videoTexture = makeTexture();
    const glyphTexture = makeTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buildGlyphAtlas(glyphRamp),
    );

    // Pointer trail: recent positions with decaying velocities.
    const trail: { x: number; y: number; dx: number; dy: number }[] = [];
    const trailData = new Float32Array(TRAIL_MAX * 4);
    let lastPointer = { x: 0.5, y: 0.5, has: false };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }
      const x = clamp01((event.clientX - rect.left) / rect.width);
      const y = 1 - clamp01((event.clientY - rect.top) / rect.height);
      if (lastPointer.has) {
        trail.unshift({ x, y, dx: x - lastPointer.x, dy: y - lastPointer.y });
        if (trail.length > TRAIL_MAX) trail.length = TRAIL_MAX;
      }
      lastPointer = { x, y, has: true };
    };
    root.addEventListener("pointermove", onPointerMove, { passive: true });

    const stepTrail = () => {
      for (let i = trail.length - 1; i >= 0; i -= 1) {
        const point = trail[i];
        point.dx *= 0.839;
        point.dy *= 0.839;
        point.x += point.dx * 0.15;
        point.y += point.dy * 0.15;
        if (Math.abs(point.dx) + Math.abs(point.dy) < 0.00006) {
          trail.splice(i, 1);
        }
      }
      trailData.fill(0);
      for (let i = 0; i < trail.length; i += 1) {
        trailData.set(
          [trail[i].x, trail[i].y, trail[i].dx, trail[i].dy],
          i * 4,
        );
      }
    };

    // Scroll expansion: lerp the frame from its CSS base size to the full
    // scroller viewport, flattening the tube on the way.
    let baseWidth = 0;
    let baseHeight = 0;
    let tvness = 1;

    const captureBase = () => {
      const saved = {
        width: frame.style.width,
        height: frame.style.height,
      };
      frame.style.width = "";
      frame.style.height = "";
      const rect = frame.getBoundingClientRect();
      if (rect.width) baseWidth = rect.width;
      if (rect.height) baseHeight = rect.height;
      frame.style.width = saved.width;
      frame.style.height = saved.height;
    };

    const updateScroll = () => {
      if (!baseWidth || !baseHeight) captureBase();
      const distance = scope.offsetHeight - root.clientHeight;
      const raw = distance > 4 ? clamp01(root.scrollTop / distance) : 0;
      const progress = clamp01(raw / EXPAND_END);
      tvness = 1 - progress;
      frame.style.width = `${lerp(baseWidth, root.clientWidth, progress)}px`;
      frame.style.height = `${lerp(baseHeight, root.clientHeight, progress)}px`;
      headlineEl.style.opacity = `${clamp01(1 - progress * 1.6)}`;
    };
    root.addEventListener("scroll", updateScroll, { passive: true });

    const observer = new ResizeObserver(() => {
      baseWidth = 0;
      baseHeight = 0;
      updateScroll();
    });
    observer.observe(root);
    updateScroll();

    let frameId = 0;
    let dpr = 1;

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      frameId = requestAnimationFrame(render);
      resizeCanvas();
      if (!reducedMotion) stepTrail();

      if (video.readyState < 2) return;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video,
      );
      gl.uniform1i(uniforms.video, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
      gl.uniform1i(uniforms.glyphs, 1);

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(
        uniforms.videoSize,
        video.videoWidth || canvas.width,
        video.videoHeight || canvas.height,
      );
      gl.uniform1f(uniforms.cell, cellSize * dpr);
      gl.uniform1f(uniforms.glyphCount, glyphRamp.length);
      gl.uniform1f(uniforms.brightness, 0.5);
      gl.uniform1f(uniforms.contrast, 0.5);
      gl.uniform1f(uniforms.fisheye, 0.28);
      gl.uniform1f(uniforms.tvness, tvness);
      gl.uniform1f(uniforms.chroma, 2 * tvness);
      gl.uniform1f(uniforms.bloom, 0.75);
      gl.uniform1f(uniforms.warp, 46.5 * dpr);
      gl.uniform1f(uniforms.mouseRadius, 108 * dpr);
      gl.uniform1f(uniforms.mouseStrength, reducedMotion ? 0 : 0.12);
      gl.uniform1f(uniforms.time, performance.now() * 0.001);
      gl.uniform1f(uniforms.trailCount, trail.length);
      gl.uniform4fv(uniforms.trail, trailData);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    video.play().catch(() => {});
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("scroll", updateScroll);
      video.pause();
      video.removeAttribute("src");
      video.load();
      gl.deleteTexture(videoTexture);
      gl.deleteTexture(glyphTexture);
      gl.deleteProgram(program);
    };
  }, [videoSrc, cellSize, glyphRamp]);

  return (
    <div
      ref={rootRef}
      className={`atv-root${className ? ` ${className}` : ""}`}
    >
      <style>{`
        .atv-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          background: #000;
          color: #f4f2ee;
        }
        .atv-scope { position: relative; }
        .atv-sticky {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .atv-frame {
          width: min(72%, 1040px);
          aspect-ratio: 1.6;
          max-width: none;
        }
        .atv-frame canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .atv-headline {
          position: absolute;
          left: clamp(16px, 2.5vw, 40px);
          bottom: clamp(16px, 2.5vw, 40px);
          font-size: clamp(24px, 3.4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          pointer-events: none;
        }
        .atv-tail {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 40svh;
          padding: 8vh 6vw;
          font-size: clamp(14px, 1.2vw, 18px);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8a877f;
        }
      `}</style>
      <div
        ref={scopeRef}
        className="atv-scope"
        style={{ height: `${scrollLength * 100}%` }}
      >
        <div
          className="atv-sticky"
          style={{ height: `${100 / scrollLength}%` }}
        >
          <div ref={frameRef} className="atv-frame">
            <canvas ref={canvasRef} />
          </div>
          <div ref={headlineRef} className="atv-headline">
            {headline[0]}
            <br />
            {headline[1]}
          </div>
        </div>
      </div>
      <div className="atv-tail">Signal locked. Keep scrolling.</div>
    </div>
  );
}
