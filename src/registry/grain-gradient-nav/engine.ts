/**
 * The seven-pass WebGL2 renderer behind Grain Gradient Field.
 *
 * The stack is a chain of full-screen passes, each sampling the one before it
 * through `uTexture`:
 *
 *   0 gradient    full res     flat base fill
 *   1 sdf shape   full res     raymarched MSDF blob, flat-shaded by N-dot-L
 *   2 noise blur  quarter res  32-tap directional smear
 *   3 noise blur  half res     the same smear again, at a coarser scale
 *   4 sine        full res     slow standing-wave warp
 *   5 mouse       full res     displaces the frame along the pointer trail
 *   6 diffuse     to screen    24 random taps per pixel; this is the grain
 *
 * Plus a ping-pong pair that accumulates pointer motion as hue=angle,
 * value=speed, which pass 5 reads back. The mixed resolutions are load-bearing:
 * running the two smear passes at 1/4 and 1/2 is what makes the falloff this
 * wide and this cheap, and matching them is most of the reason the port looks
 * like the original rather than merely similar.
 *
 * Timing is deliberately quantised. The source ran a 30fps gate and advanced
 * each animating layer's clock by a fixed `speed * 60 / fps` per RENDERED
 * frame, never by wall-clock delta, so the motion is frame-counted rather than
 * time-based. Reproducing the gate exactly is what keeps the drift speed right
 * on a 120Hz display.
 *
 * BLANK - aryank.space
 */

import {
  diffuseFrag,
  type GrainFieldConfig,
  gradientFrag,
  mouseReadFrag,
  mouseWriteFrag,
  noiseBlurFrag,
  sdfShapeFrag,
  sineFrag,
  VERT_PLAIN,
  VERT_TEXTURE_MATRIX,
} from "./shaders";

export interface GrainFieldEngineOptions {
  canvas: HTMLCanvasElement;
  /** The MSDF atlas the shape pass raymarches. */
  shapeTexture: TexImageSource;
  config: GrainFieldConfig;
  /** Backing-store multiplier. The source shipped 1.5. */
  dpi?: number;
  /** Render gate. The source shipped 30. */
  fps?: number;
  /** Whether pointer movement drives the trail and the warp. */
  interactive?: boolean;
  /** Pointer coordinates are read against this element's box. */
  hitTarget?: HTMLElement;
}

/** Per-layer speed, and whether its clock advances at all. Both come straight
 *  from the source scene: a layer with `animating: false` holds uTime at 0
 *  forever, which is why the shape never rotates and the grain never crawls. */
const LAYERS = [
  { speed: 0.25, animating: false, momentum: 0 }, // gradient
  { speed: 0.5, animating: false, momentum: 0 }, // sdf shape
  { speed: 0.16, animating: true, momentum: 0 }, // noise blur
  { speed: 0.08, animating: true, momentum: 0.2 }, // sine
  { speed: 0, animating: false, momentum: 0.14 }, // mouse
  { speed: 0, animating: true, momentum: 0 }, // diffuse
] as const;

/** Which layer each pass belongs to, and what fraction of the canvas its own
 *  render target is. The last pass draws to the screen and has no target. */
const PASSES = [
  { layer: 0, scale: 1 },
  { layer: 1, scale: 1 },
  { layer: 2, scale: 0.25 },
  { layer: 2, scale: 0.5 },
  { layer: 3, scale: 1 },
  { layer: 4, scale: 1 },
  { layer: 5, scale: 0 },
] as const;

const IDENTITY = new Float32Array([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
]);

/**
 * The source's smoothing step, ported literally including its rounding.
 *
 * `steps` arrives as `momentum * 2`, so for every momentum this scene uses it
 * is a fraction below 1 and the loop body runs exactly once - the result is a
 * fixed 25/75 blend toward the previous position, not a variable-rate lerp.
 * Rewriting it as a "cleaner" lerp changes the trail's lag.
 */
function smoothTo(next: number, previous: number, steps: number) {
  let value = next;
  for (let i = 0; i < steps; i++) value = (value + previous) / 2;
  return +((value + previous) / 2).toFixed(4);
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader compile failed: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("could not create program");
  const v = compile(gl, gl.VERTEX_SHADER, vert);
  const f = compile(gl, gl.FRAGMENT_SHADER, frag);
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.bindAttribLocation(program, 0, "aVertexPosition");
  gl.bindAttribLocation(program, 1, "aTextureCoord");
  gl.linkProgram(program);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`program link failed: ${log}`);
  }
  return program;
}

interface Target {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

export class GrainFieldEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly dpi: number;
  private readonly fps: number;
  private readonly frameDuration: number;
  private readonly hitTarget: HTMLElement;

  private config: GrainFieldConfig;
  private interactive: boolean;

  private programs: WebGLProgram[] = [];
  private writeProgram!: WebGLProgram;
  private quad!: WebGLVertexArrayObject;
  private buffer!: WebGLBuffer;
  private shape!: WebGLTexture;
  private targets: (Target | null)[] = [];
  private pingPong: Target[] = [];
  private pingPongRead = 0;

  /** One clock per layer, advanced per rendered frame, never by wall time. */
  private time = LAYERS.map(() => 0);
  /** One smoothed pointer position per layer, in the source's half-pixel space. */
  private lastMouse: ({ x: number; y: number } | null)[] = LAYERS.map(
    () => null,
  );
  private mousePixels = { x: 0, y: 0 };
  private movedInView = false;
  private ticks = 0;
  /** Per-frame caches, cleared at the top of every render. */
  private frameMouse: ({ x: number; y: number } | null)[] = LAYERS.map(
    () => null,
  );
  private frameRect: DOMRect | null = null;
  /** Mirrors the ping-pong plane's own uniform so the write pass can read the
   *  value from the previous frame, which is what makes a trail a trail. */
  private previousMouse = { x: 0.5, y: 0.5 };
  private currentMouse = { x: 0.5, y: 0.5 };

  private raf = 0;
  private lastTime = 0;
  private disposed = false;

  constructor(options: GrainFieldEngineOptions) {
    const {
      canvas,
      shapeTexture,
      config,
      dpi = 1.5,
      fps = 30,
      interactive = true,
      hitTarget,
    } = options;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 is not available");

    this.canvas = canvas;
    this.gl = gl;
    this.config = config;
    this.dpi = dpi;
    this.fps = fps;
    this.frameDuration = Math.floor(1000 / fps);
    this.interactive = interactive;
    this.hitTarget = hitTarget ?? canvas;

    // Half-float targets. Eight bits cannot hold the ping-pong trail: mixing a
    // few percent per frame stalls once the difference is under 1/255, so the
    // trail would never actually fade out.
    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");

    this.buildQuad();
    this.buildPrograms();
    this.uploadShape(shapeTexture);
    this.resize();

    if (interactive)
      window.addEventListener("mousemove", this.onMove, { passive: true });
    if (interactive)
      window.addEventListener("touchmove", this.onMove, { passive: true });
  }

  // --- setup ---------------------------------------------------------------

  private buildQuad() {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    if (!vao || !buffer) throw new Error("could not create quad");
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // x, y, u, v - a screen-filling triangle strip.
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);
    this.quad = vao;
    this.buffer = buffer;
  }

  private buildPrograms() {
    const c = this.config;
    const sources = [
      gradientFrag(c),
      sdfShapeFrag(c),
      noiseBlurFrag(c),
      noiseBlurFrag(c),
      sineFrag(c),
      mouseReadFrag(c),
      diffuseFrag(c),
    ];
    for (const program of this.programs) this.gl.deleteProgram(program);
    this.programs = sources.map((frag) =>
      link(this.gl, VERT_TEXTURE_MATRIX, frag),
    );
    this.writeProgram = link(this.gl, VERT_PLAIN, mouseWriteFrag(c));
  }

  private uploadShape(source: TexImageSource) {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) throw new Error("could not create shape texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // The source uploads image textures flipped and unpremultiplied.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.shape = texture;
  }

  private createTarget(width: number, height: number): Target {
    const gl = this.gl;
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) throw new Error("could not create target");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      width,
      height,
      0,
      gl.RGBA,
      gl.HALF_FLOAT,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { framebuffer, texture, width, height };
  }

  private destroyTargets() {
    const gl = this.gl;
    for (const target of [...this.targets, ...this.pingPong]) {
      if (!target) continue;
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    }
    this.targets = [];
    this.pingPong = [];
  }

  // --- sizing --------------------------------------------------------------

  /** Match the backing store to the element box, then rebuild every target. */
  resize() {
    if (this.disposed) return;
    const width = Math.max(1, Math.round(this.canvas.clientWidth * this.dpi));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * this.dpi));
    if (this.canvas.width === width && this.canvas.height === height) {
      if (this.targets.length) return;
    }
    this.canvas.width = width;
    this.canvas.height = height;

    this.destroyTargets();
    this.targets = PASSES.map((pass) =>
      pass.scale === 0
        ? null
        : this.createTarget(
            Math.max(1, Math.round(width * pass.scale)),
            Math.max(1, Math.round(height * pass.scale)),
          ),
    );
    this.pingPong = [
      this.createTarget(width, height),
      this.createTarget(width, height),
    ];
  }

  setConfig(config: GrainFieldConfig) {
    this.config = config;
    this.buildPrograms();
  }

  setInteractive(interactive: boolean) {
    if (interactive === this.interactive) return;
    this.interactive = interactive;
    if (interactive) {
      window.addEventListener("mousemove", this.onMove, { passive: true });
      window.addEventListener("touchmove", this.onMove, { passive: true });
    } else {
      window.removeEventListener("mousemove", this.onMove);
      window.removeEventListener("touchmove", this.onMove);
    }
  }

  // --- pointer -------------------------------------------------------------

  private onMove = (event: MouseEvent | TouchEvent) => {
    const rect = this.hitTarget.getBoundingClientRect();
    const touch = "touches" in event ? event.touches[0] : null;
    const clientX = touch ? touch.clientX : (event as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (event as MouseEvent).clientY;
    // The source tracks the pointer in half-pixels and normalises against half
    // the box, so this is (offset / size) with the y axis flipped.
    this.mousePixels.x = (clientX - rect.left) * 0.5;
    this.mousePixels.y = (clientY - rect.top) * 0.5;
    this.movedInView = true;
  };

  /**
   * Smoothed, normalised pointer position for one layer, computed at most once
   * per frame.
   *
   * The cache is not an optimisation, it is correctness: the smoothing step
   * advances a stored position, and layer 4 is read by two passes (the trail
   * write and the displacement read). Recomputing per pass would smooth twice
   * per frame and the trail would drag noticeably further behind the cursor
   * than the original's.
   */
  private mouseFor(layer: number) {
    const cached = this.frameMouse[layer];
    if (cached) return cached;
    const value = this.computeMouse(layer);
    this.frameMouse[layer] = value;
    return value;
  }

  private computeMouse(layer: number) {
    const rect = this.frameRect ?? this.hitTarget.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    if (!halfWidth || !halfHeight) return { x: 0.5, y: 0.5 };

    const momentum = LAYERS[layer].momentum;
    let x = this.mousePixels.x;
    let y = this.mousePixels.y;
    if (!momentum) return { x: x / halfWidth, y: 1 - y / halfHeight };

    const last = this.lastMouse[layer];
    if (!last) {
      const seeded = { x: x / halfWidth, y: 1 - y / halfHeight };
      this.lastMouse[layer] = seeded;
      return seeded;
    }
    const lastX = last.x * halfWidth;
    const lastY = (1 - last.y) * halfHeight;
    if (Math.abs(x - lastX) >= 0.001 || Math.abs(y - lastY) >= 0.001) {
      x = smoothTo(x, lastX, momentum * 2);
      y = smoothTo(y, lastY, momentum * 2);
      last.x = x / halfWidth;
      last.y = 1 - y / halfHeight;
    }
    return last;
  }

  // --- render --------------------------------------------------------------

  start() {
    if (this.raf || this.disposed) return;
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      // The source's gate, verbatim: a strict threshold with lastTime snapped
      // to now, which on a 60Hz display lands on every other frame.
      if (now - this.lastTime < this.frameDuration) return;
      this.lastTime = now;
      this.render();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Draw one frame, ignoring the gate. Used to paint before the loop starts. */
  render() {
    if (this.disposed || !this.targets.length) return;
    const gl = this.gl;
    const { width, height } = this.canvas;

    // One layout read per frame instead of one per pass; every pass wants the
    // same box, and reading it eight times forces eight synchronous layouts.
    this.frameRect = this.hitTarget.getBoundingClientRect();
    for (let i = 0; i < this.frameMouse.length; i++) this.frameMouse[i] = null;

    for (let i = 0; i < LAYERS.length; i++) {
      const layer = LAYERS[i];
      if (layer.animating) this.time[i] += (layer.speed * 60) / this.fps;
    }

    gl.bindVertexArray(this.quad);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    this.renderTrail(width, height);

    for (let i = 0; i < PASSES.length; i++) {
      const pass = PASSES[i];
      const program = this.programs[i];
      const target = this.targets[i];
      // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL binding call, not a React hook - the name just collides.
      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(
        0,
        0,
        target ? target.width : width,
        target ? target.height : height,
      );

      this.setMatrices(program, true);
      this.setUniform2f(program, "uResolution", width, height);
      this.setUniform1f(program, "uTime", this.time[pass.layer]);
      const mouse = this.mouseFor(pass.layer);
      this.setUniform2f(program, "uMousePos", mouse.x, mouse.y);

      let unit = 0;
      const previous = i > 0 ? this.targets[i - 1] : null;
      if (previous)
        unit = this.bind(program, "uTexture", previous.texture, unit);
      if (pass.layer === 1) {
        unit = this.bind(program, "uCustomTexture", this.shape, unit);
      }
      if (pass.layer === 4) {
        unit = this.bind(
          program,
          "uPingPongTexture",
          this.pingPong[this.pingPongRead].texture,
          unit,
        );
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (this.movedInView) this.ticks++;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);
  }

  /** The ping-pong write pass: stamp this frame's pointer segment into the
   *  trail buffer, fade what was already there, and swap. */
  private renderTrail(width: number, height: number) {
    const gl = this.gl;
    const write = this.pingPong[1 - this.pingPongRead];
    const read = this.pingPong[this.pingPongRead];

    const mouse = this.mouseFor(4);
    if (this.movedInView) {
      // After the first frames the write pass compares against the previous
      // frame's position; before that it compares against itself, so a page
      // load with the pointer already inside does not fire one huge streak.
      if (this.ticks > 16) {
        this.previousMouse.x = this.currentMouse.x;
        this.previousMouse.y = this.currentMouse.y;
      } else {
        this.previousMouse.x = mouse.x;
        this.previousMouse.y = mouse.y;
      }
      this.currentMouse.x = mouse.x;
      this.currentMouse.y = mouse.y;
      this.ticks++;
    }

    gl.useProgram(this.writeProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
    gl.viewport(0, 0, write.width, write.height);
    this.setMatrices(this.writeProgram, false);
    this.setUniform2f(this.writeProgram, "uResolution", width, height);
    this.setUniform1f(this.writeProgram, "uTime", this.time[4]);
    this.setUniform2f(
      this.writeProgram,
      "uMousePos",
      this.currentMouse.x,
      this.currentMouse.y,
    );
    this.setUniform2f(
      this.writeProgram,
      "uPreviousMousePos",
      this.previousMouse.x,
      this.previousMouse.y,
    );
    this.bind(this.writeProgram, "uPingPongTexture", read.texture, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.pingPongRead = 1 - this.pingPongRead;
  }

  // --- uniform helpers -----------------------------------------------------

  private setMatrices(program: WebGLProgram, textureMatrix: boolean) {
    const gl = this.gl;
    for (const name of ["uMVMatrix", "uPMatrix"]) {
      const location = gl.getUniformLocation(program, name);
      if (location) gl.uniformMatrix4fv(location, false, IDENTITY);
    }
    if (!textureMatrix) return;
    const location = gl.getUniformLocation(program, "uTextureMatrix");
    if (location) gl.uniformMatrix4fv(location, false, IDENTITY);
  }

  private setUniform1f(program: WebGLProgram, name: string, value: number) {
    const location = this.gl.getUniformLocation(program, name);
    if (location) this.gl.uniform1f(location, value);
  }

  private setUniform2f(
    program: WebGLProgram,
    name: string,
    x: number,
    y: number,
  ) {
    const location = this.gl.getUniformLocation(program, name);
    if (location) this.gl.uniform2f(location, x, y);
  }

  private bind(
    program: WebGLProgram,
    name: string,
    texture: WebGLTexture,
    unit: number,
  ) {
    const gl = this.gl;
    const location = gl.getUniformLocation(program, name);
    if (!location) return unit;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, unit);
    return unit + 1;
  }

  // --- teardown ------------------------------------------------------------

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("touchmove", this.onMove);
    const gl = this.gl;
    this.destroyTargets();
    for (const program of this.programs) gl.deleteProgram(program);
    gl.deleteProgram(this.writeProgram);
    gl.deleteTexture(this.shape);
    gl.deleteBuffer(this.buffer);
    gl.deleteVertexArray(this.quad);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/**
 * Size a canvas so a fixed-aspect scene covers (or fits inside) its container,
 * and report the offset that centres the overflow.
 *
 * The scene has a fixed aspect and the box it lands in does not, so something
 * has to give. The source drew the achievements background at a 1440x1800 box
 * and pinned it to the section's top-left with CSS; the same wrapper centres
 * the overflow anywhere it is not overridden. Both are useful: a tall section
 * wants the top of the scene, and a short bar wants the middle of it, which is
 * why the offset is returned rather than assumed.
 */
export function coverBox(
  containerWidth: number,
  containerHeight: number,
  targetWidth: number,
  targetHeight: number,
  cover: boolean,
) {
  const targetRatio = targetWidth / targetHeight;
  if (containerHeight === 0) {
    return {
      width: containerWidth,
      height: Math.ceil(containerWidth / targetRatio),
      offsetX: 0,
      offsetY: 0,
    };
  }
  const containerRatio = containerWidth / containerHeight;
  const widthLed = cover
    ? targetRatio < containerRatio
    : targetRatio > containerRatio;
  if (widthLed) {
    const height = Math.ceil(containerWidth / targetRatio);
    return {
      width: containerWidth,
      height,
      offsetX: 0,
      offsetY: Math.round((containerHeight - height) * 0.5),
    };
  }
  const width = Math.ceil(containerHeight * targetRatio);
  return {
    width,
    height: containerHeight,
    offsetX: Math.round((containerWidth - width) * 0.5),
    offsetY: 0,
  };
}

/** Load the MSDF atlas. Cross-origin is explicit because the shape is served
 *  from the asset host and WebGL refuses to sample a tainted image. */
export function loadShapeTexture(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`could not load ${src}`));
    image.src = src;
  });
}

/** Convert `#rrggbb` to the linear 0-1 triple the shaders expect. */
export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "").trim();
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int)) return [0, 0, 0];
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
}
