"use client";

/**
 * Blur Trail Video - a full-bleed video that blurs and splits its colour
 * channels wherever the pointer has just moved, then clears as the trail fades.
 *
 * WebGL2 port of the seitaroyamazaki.com hero, which runs the same pipeline in
 * three.js WebGPU: an eased pointer paints a float mask (each frame keeps
 * `decay` of the last), and the mask mixes the plain video with an RGB-shifted,
 * 35-tap Gaussian-blurred copy of it.
 *
 * BLANK - aryank.space
 */

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export interface BlurTrailVideoProps {
  /** Video URL. Must be same-origin or served with CORS headers. */
  src?: string;
  /** Share of the trail kept each frame. */
  decay?: number;
  /** Brush radius as a fraction of the container's short side. */
  radius?: number;
  /** How far the brush moves toward the pointer each frame, 0 to 1. */
  smoothing?: number;
  /** Colour split distance in UV units. */
  shiftAmount?: number;
  /** Colour split direction in degrees; 45 points down and to the right. */
  shiftAngle?: number;
  /** Gaussian sigma. Sets the tap count (3 + 2 * sigma per pass). */
  blurSigma?: number;
  /** Distance between blur taps, in drawing-buffer pixels. */
  blurStep?: number;
  className?: string;
  style?: CSSProperties;
  /** Content layered above the video. */
  children?: ReactNode;
}

const DEFAULT_SRC = "https://ui.aryank.space/assets/blur-trail-video/bg.mp4";

// The source samples the video as a WebGPU external texture, and Chrome's colour
// conversion there lifts mid-tones. Decoding the raw upload with this exponent
// matched the live site within 2/255 across the tonal range.
const VIDEO_DECODE_EXPONENT = 1.95;

const VERTEX = `#version 300 es
in vec2 p;
out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

// m = (moving ? smoothstep(radius, 0, distance) : 0) + previous * decay
const MASK = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uMoving;
uniform float uDecay;
uniform float uRadius;
out vec4 o;
vec2 aspectUv(vec2 uv) {
  vec2 c = uv - 0.5;
  return uSize.x > uSize.y ? vec2(c.x * (uSize.x / uSize.y), c.y) : vec2(c.x, c.y * (uSize.y / uSize.x));
}
void main() {
  ivec2 t = ivec2(gl_FragCoord.xy);
  int rows = textureSize(uPrev, 0).y;
  vec2 px = vec2(float(t.x), float(rows - 1 - t.y));
  vec2 uv = vec2(px.x / uSize.x, 1.0 - px.y / uSize.y);
  float d = length(aspectUv(uv) - aspectUv(uMouse));
  float k = clamp((d - uRadius) / -uRadius, 0.0, 1.0);
  float v = uMoving * k * k * (3.0 - 2.0 * k) + texelFetch(uPrev, t, 0).r * uDecay;
  o = vec4(v, v, v, 1.0);
}`;

const SCENE = `#version 300 es
precision highp float;
uniform sampler2D uVideo;
uniform vec2 uCover;
uniform float uExponent;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 c = texture(uVideo, (vUv - 0.5) * uCover + 0.5);
  o = vec4(pow(c.rgb, vec3(uExponent)), c.a);
}`;

const SHIFT = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uOffset;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 g = texture(uTex, vUv);
  o = vec4(texture(uTex, vUv + uOffset).r, g.g, texture(uTex, vUv - uOffset).b, g.a);
}`;

const blurShader = (taps: number) => `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uStep;
uniform float uW[${taps}];
in vec2 vUv;
out vec4 o;
void main() {
  vec4 acc = texture(uTex, vUv) * uW[0];
  for (int i = 1; i < ${taps}; i++) {
    vec2 d = uStep * float(i);
    acc += (texture(uTex, vUv + d) + texture(uTex, vUv - d)) * uW[i];
  }
  o = acc;
}`;

// The mask is single channel: rgb mix by the trail, alpha from the blur, as the
// source's vec4(e, e, e, 1) mask does. Linear in, sRGB out.
const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBlur;
uniform sampler2D uMask;
in vec2 vUv;
out vec4 o;
vec3 oetf(vec3 c) {
  return mix(pow(c, vec3(0.41666)) * 1.055 - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308))));
}
void main() {
  float m = clamp(texture(uMask, vUv).r, 0.0, 1.0);
  vec4 b = texture(uBlur, vUv);
  o = vec4(oetf(mix(texture(uScene, vUv).rgb, b.rgb, m)), b.a);
}`;

/** three's GaussianBlurNode coefficients: 3 + 2 * sigma taps, unnormalised. */
const blurWeights = (sigma: number) => {
  const taps = 3 + 2 * sigma;
  const s = taps / 3;
  return Float32Array.from(
    { length: taps },
    (_, i) => (0.39894 * Math.exp((-0.5 * i * i) / (s * s))) / s,
  );
};

type Program<U extends string> = {
  program: WebGLProgram;
  u: Record<U, WebGLUniformLocation | null>;
};

type Target = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
};

type Tunables = Required<
  Pick<
    BlurTrailVideoProps,
    "decay" | "radius" | "smoothing" | "shiftAmount" | "shiftAngle" | "blurStep"
  >
>;

export default function BlurTrailVideo({
  src = DEFAULT_SRC,
  decay = 0.92,
  radius = 0.2,
  smoothing = 0.1,
  shiftAmount = 0.03,
  shiftAngle = 45,
  blurSigma = 16,
  blurStep = 4,
  className,
  style,
  children,
}: BlurTrailVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unsupported, setUnsupported] = useState(false);

  const tunables = useRef<Tunables>({
    decay,
    radius,
    smoothing,
    shiftAmount,
    shiftAngle,
    blurStep,
  });
  tunables.current = {
    decay,
    radius,
    smoothing,
    shiftAmount,
    shiftAngle,
    blurStep,
  };

  useEffect(() => {
    const host = rootRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!host || !canvas || !video) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) {
      setUnsupported(true);
      return;
    }
    const floatTargets = gl.getExtension("EXT_color_buffer_float") !== null;
    const sigma = Math.max(1, Math.round(blurSigma));
    const weights = blurWeights(sigma);

    const shaders: WebGLShader[] = [];
    const compile = (type: GLenum, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Blur trail: createShader failed");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`Blur trail: ${gl.getShaderInfoLog(shader)}`);
      }
      shaders.push(shader);
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const link = <U extends string>(
      source: string,
      names: readonly U[],
    ): Program<U> => {
      const program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, source));
      gl.bindAttribLocation(program, 0, "p");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Blur trail: ${gl.getProgramInfoLog(program)}`);
      }
      const u = {} as Record<U, WebGLUniformLocation | null>;
      for (const name of names) u[name] = gl.getUniformLocation(program, name);
      return { program, u };
    };

    let maskProgram: Program<
      "uPrev" | "uSize" | "uMouse" | "uMoving" | "uDecay" | "uRadius"
    >;
    let sceneProgram: Program<"uVideo" | "uCover" | "uExponent">;
    let shiftProgram: Program<"uTex" | "uOffset">;
    let blurProgram: Program<"uTex" | "uStep" | "uW">;
    let compositeProgram: Program<"uScene" | "uBlur" | "uMask">;
    try {
      maskProgram = link(MASK, [
        "uPrev",
        "uSize",
        "uMouse",
        "uMoving",
        "uDecay",
        "uRadius",
      ]);
      sceneProgram = link(SCENE, ["uVideo", "uCover", "uExponent"]);
      shiftProgram = link(SHIFT, ["uTex", "uOffset"]);
      blurProgram = link(blurShader(weights.length), ["uTex", "uStep", "uW"]);
      compositeProgram = link(COMPOSITE, ["uScene", "uBlur", "uMask"]);
    } catch (error) {
      console.error(error);
      for (const shader of shaders) gl.deleteShader(shader);
      setUnsupported(true);
      return;
    }
    const programs = [
      maskProgram,
      sceneProgram,
      shiftProgram,
      blurProgram,
      compositeProgram,
    ];

    // Bound once so the linter does not read gl.useProgram as a React hook.
    const activateProgram = gl.useProgram.bind(gl);
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const setSampling = (filter: GLenum) => {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    const videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(4),
    );
    setSampling(gl.LINEAR);

    const createTarget = (
      width: number,
      height: number,
      mask: boolean,
    ): Target => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (mask) {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          floatTargets ? gl.R32F : gl.R8,
          width,
          height,
          0,
          gl.RED,
          floatTargets ? gl.FLOAT : gl.UNSIGNED_BYTE,
          null,
        );
      } else {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          floatTargets ? gl.RGBA16F : gl.RGBA8,
          width,
          height,
          0,
          gl.RGBA,
          floatTargets ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
          null,
        );
      }
      setSampling(mask ? gl.NEAREST : gl.LINEAR);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, framebuffer, width, height };
    };
    const dropTarget = (target: Target) => {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    };

    // Sizes follow the source: the mask at CSS pixels, everything else at the
    // drawing buffer (device pixel ratio capped at 2).
    let cssWidth = 1;
    let cssHeight = 1;
    let bufferWidth = 1;
    let bufferHeight = 1;
    let targets: Target[] = [];
    let maskRead: Target;
    let maskWrite: Target;
    let scene: Target;
    let shifted: Target;
    let blurH: Target;
    let blurV: Target;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      bufferWidth = Math.max(1, Math.floor(cssWidth * ratio));
      bufferHeight = Math.max(1, Math.floor(cssHeight * ratio));
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      for (const target of targets) dropTarget(target);
      const maskWidth = Math.max(1, Math.floor(cssWidth));
      const maskHeight = Math.max(1, Math.floor(cssHeight));
      maskRead = createTarget(maskWidth, maskHeight, true);
      maskWrite = createTarget(maskWidth, maskHeight, true);
      scene = createTarget(bufferWidth, bufferHeight, false);
      shifted = createTarget(bufferWidth, bufferHeight, false);
      blurH = createTarget(bufferWidth, bufferHeight, false);
      blurV = createTarget(bufferWidth, bufferHeight, false);
      targets = [maskRead, maskWrite, scene, shifted, blurH, blurV];
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // Eased follower, as in the site's pointer module. The first event snaps it
    // into place; "moving" means it trails the pointer by more than 3px.
    let pointerX = 0;
    let pointerY = 0;
    let followX = 0;
    let followY = 0;
    let seen = false;
    let mouseUv: [number, number] = [0, 0];
    let moving = 0;
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!seen) {
        followX = pointerX;
        followY = pointerY;
        seen = true;
      }
    };
    host.addEventListener("pointermove", onPointerMove);

    let videoDirty = true;
    let frameCallback = 0;
    const hasFrameCallback = "requestVideoFrameCallback" in video;
    const onVideoFrame = () => {
      videoDirty = true;
      frameCallback = video.requestVideoFrameCallback(onVideoFrame);
    };
    if (hasFrameCallback)
      frameCallback = video.requestVideoFrameCallback(onVideoFrame);
    video.play().catch(() => {});

    const bind = (
      unit: number,
      texture: WebGLTexture,
      location: WebGLUniformLocation | null,
    ) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(location, unit);
    };
    const draw = (target: Target | null, width: number, height: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let animationFrame = 0;
    const frame = () => {
      const t = tunables.current;
      const dx = pointerX - followX;
      const dy = pointerY - followY;
      followX += dx * t.smoothing;
      followY += dy * t.smoothing;
      const followerMoving = Math.abs(dx) > 3 || Math.abs(dy) > 3;

      if (video.readyState >= 2 && (videoDirty || !hasFrameCallback)) {
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        videoDirty = false;
      }
      gl.bindVertexArray(vao);

      // 1. trail mask
      activateProgram(maskProgram.program);
      bind(0, maskRead.texture, maskProgram.u.uPrev);
      gl.uniform2f(maskProgram.u.uSize, cssWidth, cssHeight);
      gl.uniform2f(maskProgram.u.uMouse, mouseUv[0], mouseUv[1]);
      gl.uniform1f(maskProgram.u.uMoving, moving);
      gl.uniform1f(maskProgram.u.uDecay, t.decay);
      gl.uniform1f(maskProgram.u.uRadius, t.radius);
      draw(maskWrite, maskWrite.width, maskWrite.height);

      // 2. video, cover-fit
      const aspect =
        video.videoWidth && video.videoHeight
          ? video.videoWidth / video.videoHeight
          : 16 / 9;
      const wide = cssWidth / cssHeight > aspect;
      const planeWidth = wide ? cssWidth : cssHeight * aspect;
      const planeHeight = wide ? cssWidth / aspect : cssHeight;
      activateProgram(sceneProgram.program);
      bind(0, videoTexture, sceneProgram.u.uVideo);
      gl.uniform2f(
        sceneProgram.u.uCover,
        cssWidth / planeWidth,
        cssHeight / planeHeight,
      );
      gl.uniform1f(sceneProgram.u.uExponent, VIDEO_DECODE_EXPONENT);
      draw(scene, bufferWidth, bufferHeight);

      // 3. RGB shift. GL uv runs y-up, so a positive angle points down-right on
      // screen, matching the source's y-down WebGPU uv.
      const angle = (t.shiftAngle * Math.PI) / 180;
      activateProgram(shiftProgram.program);
      bind(0, scene.texture, shiftProgram.u.uTex);
      gl.uniform2f(
        shiftProgram.u.uOffset,
        Math.cos(angle) * t.shiftAmount,
        -Math.sin(angle) * t.shiftAmount,
      );
      draw(shifted, bufferWidth, bufferHeight);

      // 4. separable Gaussian blur
      activateProgram(blurProgram.program);
      gl.uniform1fv(blurProgram.u.uW, weights);
      bind(0, shifted.texture, blurProgram.u.uTex);
      gl.uniform2f(blurProgram.u.uStep, t.blurStep / bufferWidth, 0);
      draw(blurH, bufferWidth, bufferHeight);
      bind(0, blurH.texture, blurProgram.u.uTex);
      gl.uniform2f(blurProgram.u.uStep, 0, t.blurStep / bufferHeight);
      draw(blurV, bufferWidth, bufferHeight);

      // 5. mix and encode
      activateProgram(compositeProgram.program);
      bind(0, scene.texture, compositeProgram.u.uScene);
      bind(1, blurV.texture, compositeProgram.u.uBlur);
      bind(2, maskWrite.texture, compositeProgram.u.uMask);
      draw(null, bufferWidth, bufferHeight);

      // The source reads the pointer after rendering, so the brush lags a frame.
      const rect = host.getBoundingClientRect();
      const x = Math.min(Math.max(followX - rect.left, 0), cssWidth);
      const y = Math.min(Math.max(followY - rect.top, 0), cssHeight);
      mouseUv = [x / cssWidth, 1 - y / cssHeight];
      moving = followerMoving ? 1 : 0;
      [maskRead, maskWrite] = [maskWrite, maskRead];
      animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (frameCallback) video.cancelVideoFrameCallback(frameCallback);
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      for (const target of targets) dropTarget(target);
      gl.deleteTexture(videoTexture);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      for (const { program } of programs) gl.deleteProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
    };
  }, [blurSigma]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#222",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: unsupported ? "none" : "block",
        }}
      />
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        style={
          unsupported
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }
            : { display: "none" }
        }
      />
      {children ? (
        <div style={{ position: "relative", height: "100%" }}>{children}</div>
      ) : null}
    </div>
  );
}
