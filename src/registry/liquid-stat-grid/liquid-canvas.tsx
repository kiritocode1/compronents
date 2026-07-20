"use client";

/**
 * Multi-pass WebGL2 renderer for the liquid gradient backdrop.
 *
 * The source scene is a six-stage chain: a flat backdrop, a mouse-tracked colour
 * blob, a domain-warp ("liquify"), two noise-blur passes, then a second, faster
 * warp. Each stage renders into its own framebuffer at its own resolution scale
 * and samples the previous stage as `uTexture`, so this is a straight port of that
 * chain rather than an approximation. All GLSL lives in ./shaders.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

import {
  CIRCLE_FRAG,
  CIRCLE_MOUSE_MOMENTUM,
  GRADIENT_FRAG,
  LIQUIFY_2_FRAG,
  LIQUIFY_FRAG,
  type LiquidVariant,
  NOISE_BLUR_PASS_1,
  NOISE_BLUR_PASS_2,
  VERTEX_SHADER,
} from "./shaders";

/** Device pixel ratio the source scene renders at. */
const SCENE_DPI = 1.5;

interface Stage {
  frag: string;
  /** Resolution scale for this stage's framebuffer. */
  downSample: number;
  /** uTime advances by this much per 60fps frame, matching the source config. */
  speed: number;
}

const stagesFor = (variant: LiquidVariant): Stage[] => [
  { frag: GRADIENT_FRAG, downSample: 0.5, speed: 0.25 },
  { frag: CIRCLE_FRAG[variant], downSample: 1, speed: 0 },
  { frag: LIQUIFY_FRAG, downSample: 1, speed: 0.25 },
  { frag: NOISE_BLUR_PASS_1, downSample: 0.5, speed: 0.16 },
  { frag: NOISE_BLUR_PASS_2, downSample: 0.25, speed: 0.16 },
  { frag: LIQUIFY_2_FRAG, downSample: 1, speed: 0.77 },
];

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, fragSrc: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

interface Target {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
}

function makeTarget(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
): Target | null {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, tex, w, h };
}

export interface LiquidCanvasProps {
  variant: LiquidVariant;
  className?: string;
}

export default function LiquidCanvas({
  variant,
  className,
}: LiquidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const stages = stagesFor(variant);
    const programs = stages.map((s) => link(gl, s.frag));
    if (programs.some((p) => !p)) {
      for (const p of programs) if (p) gl.deleteProgram(p);
      return;
    }

    // Fullscreen quad shared by every stage.
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // x, y, z, u, v
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 0, 3, -1, 0, 2, 0, -1, 3, 0, 0, 2]),
      gl.STATIC_DRAW,
    );
    for (const p of programs) {
      if (!p) continue;
      const posLoc = gl.getAttribLocation(p, "aVertexPosition");
      const uvLoc = gl.getAttribLocation(p, "aTextureCoord");
      if (posLoc >= 0) {
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 20, 0);
      }
      if (uvLoc >= 0) {
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12);
      }
    }

    const uniforms = programs.map((p) =>
      p
        ? {
            uTime: gl.getUniformLocation(p, "uTime"),
            uTexture: gl.getUniformLocation(p, "uTexture"),
            uMousePos: gl.getUniformLocation(p, "uMousePos"),
            uResolution: gl.getUniformLocation(p, "uResolution"),
          }
        : null,
    );

    let targets: (Target | null)[] = [];
    let width = 0;
    let height = 0;

    const releaseTargets = () => {
      for (const t of targets) {
        if (!t) continue;
        gl.deleteFramebuffer(t.fbo);
        gl.deleteTexture(t.tex);
      }
      targets = [];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * SCENE_DPI));
      const h = Math.max(1, Math.round(rect.height * SCENE_DPI));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      releaseTargets();
      // Every stage but the last renders into its own offscreen target.
      targets = stages.map((s, i) =>
        i === stages.length - 1
          ? null
          : makeTarget(
              gl,
              Math.max(1, Math.round(w * s.downSample)),
              Math.max(1, Math.round(h * s.downSample)),
            ),
      );
    };
    resize();

    // Mouse is reported in 0..1 UV space with 0.5 at rest, smoothed by the
    // momentum value from the source config.
    const mouse = { x: 0.5, y: 0.5 };
    const smoothed = { x: 0.5, y: 0.5 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    const onPointerLeave = () => {
      mouse.x = 0.5;
      mouse.y = 0.5;
    };
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);

    // Only burn GPU while the canvas is actually on screen.
    let onScreen = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let frame = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!onScreen || !width || !height) return;
      frame += 1;
      const lerp = 1 - CIRCLE_MOUSE_MOMENTUM;
      smoothed.x += (mouse.x - smoothed.x) * lerp;
      smoothed.y += (mouse.y - smoothed.y) * lerp;

      gl.bindVertexArray(vao);
      for (let i = 0; i < stages.length; i++) {
        const program = programs[i];
        const u = uniforms[i];
        if (!program || !u) continue;
        const target = targets[i];
        const prev = i > 0 ? targets[i - 1] : null;

        gl.useProgram(program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
        const vw = target ? target.w : width;
        const vh = target ? target.h : height;
        gl.viewport(0, 0, vw, vh);

        if (u.uResolution) gl.uniform2f(u.uResolution, vw, vh);
        if (u.uTime) gl.uniform1f(u.uTime, frame * stages[i].speed);
        if (u.uMousePos) gl.uniform2f(u.uMousePos, smoothed.x, smoothed.y);
        if (u.uTexture && prev) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, prev.tex);
          gl.uniform1i(u.uTexture, 0);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      releaseTargets();
      for (const p of programs) if (p) gl.deleteProgram(p);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
