"use client";

/**
 * Sandy Grain Background
 *
 * A near-black sandy backdrop where the pointer paints a warm amber glow that
 * smears and drifts like smoke before burning off, under live film grain. The
 * trail is a ping-pong fluid simulation: each frame the previous buffer is
 * advected along its own velocity, diffused, and decayed, then the pointer
 * splats new velocity and heat along its path. A composite pass adds the amber
 * heat over the base color, shades it with slow value noise, and overlays
 * animated grain.
 *
 * The native cursor is replaced by a small square dot that eases after the
 * pointer and swells over links, buttons, and anything marked [data-cursor].
 *
 * Everything runs on one WebGL2 canvas, no image, library, or asset required.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef } from "react";

export interface SandyGrainBackgroundProps {
  /** Backdrop color under the glow and grain. */
  baseColor?: string;
  /** Glow painted along the pointer trail, as an [r, g, b] triple. */
  glowColor?: [number, number, number];
  /** Square cursor dot color. */
  cursorColor?: string;
  /** Strength of the film-grain overlay, 0 to 1. */
  grainOpacity?: number;
  /** Content rendered above the backdrop. */
  children?: React.ReactNode;
  className?: string;
}

const DEFAULT_GLOW: [number, number, number] = [152, 99, 0];

/** The fluid buffers run at a quarter of CSS pixels; the glow is soft anyway. */
const SIM_DOWNSAMPLE = 0.25;

const VERTEX_SHADER = `#version 300 es
in vec2 position;
out vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/**
 * Ping-pong update pass. RG stores velocity (biased around 0.5), B stores
 * heat. Advect along stored velocity, diffuse with a 4-tap blur, decay, then
 * splat the pointer segment.
 */
const SIM_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform vec2 uMouseVel;
uniform float uPointerIn;

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - (a + ab * t));
}

vec4 sampleField(vec2 uv) {
  vec4 center = texture(uPrev, uv);
  vec4 blur = texture(uPrev, uv + vec2(uTexel.x, 0.0))
    + texture(uPrev, uv - vec2(uTexel.x, 0.0))
    + texture(uPrev, uv + vec2(0.0, uTexel.y))
    + texture(uPrev, uv - vec2(0.0, uTexel.y));
  return mix(center, blur * 0.25, 0.45);
}

void main() {
  vec2 vel = (texture(uPrev, vUv).rg - 0.5) * 2.0;
  vec4 prev = sampleField(vUv - vel * uTexel * 5.0);

  vec2 carried = (prev.rg - 0.5) * 2.0 * 0.985;
  float heat = prev.b * 0.965;

  if (uPointerIn > 0.5) {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec2 a = vec2(uPrevMouse.x * uAspect, uPrevMouse.y);
    vec2 b = vec2(uMouse.x * uAspect, uMouse.y);
    float d = distToSegment(p, a, b);
    float splat = exp(-d * d / 0.0035);
    float speed = length(uMouseVel);
    carried += uMouseVel * splat * 14.0;
    heat += splat * min(speed * 30.0, 1.1);
  }

  carried = clamp(carried, -1.0, 1.0);
  heat = clamp(heat, 0.0, 1.6);
  fragColor = vec4(carried * 0.5 + 0.5, heat, 1.0);
}
`;

/**
 * Composite pass: base color, slow value-noise shading, additive amber heat,
 * then animated grain blended with overlay at uGrainOpacity.
 */
const DRAW_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uField;
uniform vec2 uResolution;
uniform float uTime;
uniform float uGrainSeed;
uniform float uGrainOpacity;
uniform vec3 uBase;
uniform vec3 uGlow;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    total += valueNoise(p) * amplitude;
    p = p * 2.1 + 17.0;
    amplitude *= 0.5;
  }
  return total;
}

vec3 overlay(vec3 src, vec3 dst) {
  return vec3(
    dst.x <= 0.5 ? 2.0 * src.x * dst.x : 1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x),
    dst.y <= 0.5 ? 2.0 * src.y * dst.y : 1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y),
    dst.z <= 0.5 ? 2.0 * src.z * dst.z : 1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)
  );
}

void main() {
  float heat = texture(uField, vUv).b;

  // Slow smoky shading so the field never reads as flat.
  vec2 aspectUv = vUv * vec2(uResolution.x / uResolution.y, 1.0);
  float smoke = fbm(aspectUv * 1.4 + uTime * 0.012);
  vec3 color = uBase * (0.72 + smoke * 0.62);

  color += uGlow * heat * 1.4;

  vec2 st = vUv * uResolution;
  vec3 grain = vec3(
    hash(st + uGrainSeed + 1.0),
    hash(st + uGrainSeed + 2.0),
    hash(st + uGrainSeed + 3.0)
  );
  color = mix(color, overlay(grain, color), uGrainOpacity);

  fragColor = vec4(color, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const parsed = Number.parseInt(full, 16);
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

function compileProgram(
  gl: WebGL2RenderingContext,
  fragmentSource: string,
): WebGLProgram | null {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
}

export default function SandyGrainBackground({
  baseColor = "#090703",
  glowColor = DEFAULT_GLOW,
  cursorColor = "#c8b89a",
  grainOpacity = 0.32,
  children,
  className,
}: SandyGrainBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef({ baseColor, glowColor, grainOpacity });
  paramsRef.current = { baseColor, glowColor, grainOpacity };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!root || !canvas || !cursor) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      depth: false,
      alpha: false,
    });
    if (!gl) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(hover: none)").matches;

    // Half-float buffers keep slow decay smooth; RGBA8 is the quiet fallback.
    const floatColor = gl.getExtension("EXT_color_buffer_float");
    if (floatColor) gl.getExtension("OES_texture_float_linear");

    const simProgram = compileProgram(gl, SIM_SHADER);
    const drawProgram = compileProgram(gl, DRAW_SHADER);
    if (!simProgram || !drawProgram) return;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const bindQuad = (program: WebGLProgram) => {
      const location = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    };

    const simUniforms = {
      prev: gl.getUniformLocation(simProgram, "uPrev"),
      texel: gl.getUniformLocation(simProgram, "uTexel"),
      aspect: gl.getUniformLocation(simProgram, "uAspect"),
      mouse: gl.getUniformLocation(simProgram, "uMouse"),
      prevMouse: gl.getUniformLocation(simProgram, "uPrevMouse"),
      mouseVel: gl.getUniformLocation(simProgram, "uMouseVel"),
      pointerIn: gl.getUniformLocation(simProgram, "uPointerIn"),
    };
    const drawUniforms = {
      field: gl.getUniformLocation(drawProgram, "uField"),
      resolution: gl.getUniformLocation(drawProgram, "uResolution"),
      time: gl.getUniformLocation(drawProgram, "uTime"),
      grainSeed: gl.getUniformLocation(drawProgram, "uGrainSeed"),
      grainOpacity: gl.getUniformLocation(drawProgram, "uGrainOpacity"),
      base: gl.getUniformLocation(drawProgram, "uBase"),
      glow: gl.getUniformLocation(drawProgram, "uGlow"),
    };

    let width = 1;
    let height = 1;
    let simWidth = 1;
    let simHeight = 1;
    let fbos: { framebuffer: WebGLFramebuffer; texture: WebGLTexture }[] = [];

    const createTarget = () => {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        floatColor ? gl.RGBA16F : gl.RGBA8,
        simWidth,
        simHeight,
        0,
        gl.RGBA,
        floatColor ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        null,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      gl.clearColor(0.5, 0.5, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { framebuffer, texture };
    };

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      simWidth = Math.max(8, Math.round(width * SIM_DOWNSAMPLE));
      simHeight = Math.max(8, Math.round(height * SIM_DOWNSAMPLE));
      for (const target of fbos) {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      }
      fbos = [createTarget(), createTarget()];
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);

    // Pointer state in UV space (origin bottom-left, matching GL).
    let mouseX = 0.5;
    let mouseY = 0.5;
    let prevMouseX = 0.5;
    let prevMouseY = 0.5;
    let cursorX = width / 2;
    let cursorY = height / 2;
    let targetX = cursorX;
    let targetY = cursorY;
    let pointerIn = false;

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!pointerIn) {
        mouseX = targetX / width;
        mouseY = 1 - targetY / height;
        prevMouseX = mouseX;
        prevMouseY = mouseY;
      }
      pointerIn = true;
    };
    const onPointerLeave = () => {
      pointerIn = false;
    };
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);

    const onEnterTarget = () => cursor.classList.add("sgb-hovered");
    const onLeaveTarget = () => cursor.classList.remove("sgb-hovered");
    const hoverBound = new WeakSet<Element>();
    const bindHoverTargets = () => {
      root.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        if (hoverBound.has(el)) return;
        hoverBound.add(el);
        el.addEventListener("mouseenter", onEnterTarget);
        el.addEventListener("mouseleave", onLeaveTarget);
      });
    };
    bindHoverTargets();
    const mutations = new MutationObserver(bindHoverTargets);
    mutations.observe(root, { childList: true, subtree: true });

    let frame = 0;
    let tick = 0;
    let readIndex = 0;
    const startTime = performance.now();

    const loop = () => {
      frame = requestAnimationFrame(loop);
      tick += 1;

      // Cursor dot eases hard after the pointer.
      cursorX += (targetX - cursorX) * 0.85;
      cursorY += (targetY - cursorY) * 0.85;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      cursor.style.opacity = pointerIn && !coarsePointer ? "1" : "0";

      // Smoothed pointer in UV space; its per-frame delta is the splat velocity.
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      const pointerUvX = targetX / width;
      const pointerUvY = 1 - targetY / height;
      mouseX += (pointerUvX - mouseX) * 0.35;
      mouseY += (pointerUvY - mouseY) * 0.35;

      if (!reducedMotion) {
        const read = fbos[readIndex];
        const write = fbos[1 - readIndex];

        // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
        gl.useProgram(simProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        bindQuad(simProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
        gl.viewport(0, 0, simWidth, simHeight);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, read.texture);
        gl.uniform1i(simUniforms.prev, 0);
        gl.uniform2f(simUniforms.texel, 1 / simWidth, 1 / simHeight);
        gl.uniform1f(simUniforms.aspect, width / height);
        gl.uniform2f(simUniforms.mouse, mouseX, mouseY);
        gl.uniform2f(simUniforms.prevMouse, prevMouseX, prevMouseY);
        gl.uniform2f(
          simUniforms.mouseVel,
          (mouseX - prevMouseX) * (width / height),
          mouseY - prevMouseY,
        );
        gl.uniform1f(simUniforms.pointerIn, pointerIn ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        readIndex = 1 - readIndex;
      }

      const params = paramsRef.current;
      const base = hexToRgb(params.baseColor);
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
      gl.useProgram(drawProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      bindQuad(drawProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos[readIndex].texture);
      gl.uniform1i(drawUniforms.field, 0);
      gl.uniform2f(drawUniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(
        drawUniforms.time,
        reducedMotion ? 0 : (performance.now() - startTime) / 1000,
      );
      // New grain every other frame reads as film; every frame reads as static.
      gl.uniform1f(
        drawUniforms.grainSeed,
        reducedMotion ? 0 : Math.floor(tick / 2) % 512,
      );
      gl.uniform1f(drawUniforms.grainOpacity, params.grainOpacity);
      gl.uniform3f(
        drawUniforms.base,
        base[0] / 255,
        base[1] / 255,
        base[2] / 255,
      );
      gl.uniform3f(
        drawUniforms.glow,
        params.glowColor[0] / 255,
        params.glowColor[1] / 255,
        params.glowColor[2] / 255,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnterTarget);
        el.removeEventListener("mouseleave", onLeaveTarget);
      });
      for (const target of fbos) {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`sgb-root${className ? ` ${className}` : ""}`}
      style={{ backgroundColor: baseColor }}
    >
      <style>{`
        .sgb-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          isolation: isolate;
        }
        .sgb-root, .sgb-root * { cursor: none !important; }
        .sgb-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .sgb-content { position: relative; z-index: 1; height: 100%; }
        .sgb-cursor {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 2;
          transform: translate(-50%, -50%) translateZ(0);
          will-change: transform;
          opacity: 0;
        }
        .sgb-cursor .sgb-dot {
          width: 10px;
          height: 10px;
          transition: width .25s ease, height .25s ease, opacity .25s ease;
        }
        .sgb-cursor.sgb-hovered .sgb-dot {
          width: 20px;
          height: 20px;
          opacity: 0.45;
        }
        @media (hover: none) {
          .sgb-root, .sgb-root * { cursor: auto !important; }
          .sgb-cursor { display: none !important; }
        }
      `}</style>
      <canvas ref={canvasRef} className="sgb-canvas" aria-hidden />
      <div className="sgb-content">{children}</div>
      <div ref={cursorRef} className="sgb-cursor" aria-hidden>
        <div className="sgb-dot" style={{ background: cursorColor }} />
      </div>
    </div>
  );
}
