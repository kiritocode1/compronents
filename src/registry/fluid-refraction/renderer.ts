// biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is a GPU method, not a React hook.
import {
  advectionShader,
  clearShader,
  curlShader,
  displayShader,
  divergenceShader,
  fluidVertexShader,
  gradientSubtractShader,
  manualAdvectionShader,
  pressureShader,
  splatShader,
  vorticityShader,
} from "./shaders";

export interface FluidSettings {
  refractionAmount: number;
  chromaticAberration: number;
  highlight: number;
  disappearSpeed: number;
  velocityDissipation: number;
  pressureDissipation: number;
  pressureIterations: number;
  curl: number;
  splatRadius: number;
  interactOnHover: boolean;
}
export type FluidMedia =
  | { image: string; video?: never }
  | { video: string; image?: never };
type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Format = { internal: number; format: number };
type Target = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  unit: number;
};
type Pair = { read: Target; write: Target; swap: () => void };
type Pointer = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  down: boolean;
  moved: boolean;
};
export const fluidMechanics = {
  resolutionDivisor: 2,
  maxDelta: 0.016,
  pointerForce: 10,
  initialSplatMin: 5,
  initialSplatRange: 10,
  splatDensity: 0.9,
  refractionDivisor: 100,
  chromaticDivisor: 1000,
  radiusDivisor: 1000,
} as const;

/** Creates one GPU fluid simulation. Returns null when half-float rendering is unsupported. */
export function createFluidRenderer(
  root: HTMLDivElement,
  canvas: HTMLCanvasElement,
  media: FluidMedia,
  initial: FluidSettings,
) {
  const attributes = {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
  };
  const candidate2 = canvas.getContext("webgl2", attributes);
  const gl2 = candidate2 instanceof WebGL2RenderingContext ? candidate2 : null;
  const candidate1 = gl2 ? null : canvas.getContext("webgl", attributes);
  const gl1 = candidate1 instanceof WebGLRenderingContext ? candidate1 : null;
  const context = gl2 ?? gl1;
  if (!context) return null;
  const gl: GL = context;
  const halfExtension = gl2 ? null : gl.getExtension("OES_texture_half_float");
  const halfType = gl2 ? gl2.HALF_FLOAT : halfExtension?.HALF_FLOAT_OES;
  if (halfType === undefined) return null;
  const textureType = halfType;
  if (gl2) gl.getExtension("EXT_color_buffer_float");
  const linear = Boolean(
    gl.getExtension(
      gl2 ? "OES_texture_float_linear" : "OES_texture_half_float_linear",
    ),
  );
  gl.clearColor(0, 0, 0, 1);
  function supported(formats: Format[]) {
    for (const format of formats) {
      const texture = gl.createTexture(),
        framebuffer = gl.createFramebuffer();
      if (!texture || !framebuffer) {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(framebuffer);
        continue;
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format.internal,
        4,
        4,
        0,
        format.format,
        textureType,
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
      const complete =
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
      if (complete) return format;
    }
    return null;
  }
  const rgba = supported([
    { internal: gl2?.RGBA16F ?? gl.RGBA, format: gl.RGBA },
  ]);
  const rg = gl2
    ? supported([
        { internal: gl2.RG16F, format: gl2.RG },
        { internal: gl2.RGBA16F, format: gl2.RGBA },
      ])
    : rgba;
  const red = gl2
    ? supported([
        { internal: gl2.R16F, format: gl2.RED },
        { internal: gl2.RG16F, format: gl2.RG },
        { internal: gl2.RGBA16F, format: gl2.RGBA },
      ])
    : rgba;
  if (!rgba || !rg || !red) return null;
  const rgbaFormat = rgba,
    rgFormat = rg,
    redFormat = red;
  const programs: WebGLProgram[] = [],
    shaders: WebGLShader[] = [],
    buffers: WebGLBuffer[] = [];
  let targets: Target[] = [];
  let disposed = false,
    frame = 0,
    visible = true,
    lastTime = Date.now();
  let settings = initial,
    width = 1,
    height = 1;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  function compile(type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader)
      throw new Error("FluidRefraction could not allocate a shader.");
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(
        gl.getShaderInfoLog(shader) ??
          "FluidRefraction shader compilation failed.",
      );
    return shader;
  }
  const vertex = compile(gl.VERTEX_SHADER, fluidVertexShader);
  function makeProgram(fragment: string) {
    const program = gl.createProgram();
    if (!program)
      throw new Error("FluidRefraction could not allocate a program.");
    programs.push(program);
    gl.attachShader(program, vertex);
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(
        gl.getProgramInfoLog(program) ??
          "FluidRefraction program linking failed.",
      );
    return program;
  }
  const clear = makeProgram(clearShader),
    display = makeProgram(displayShader),
    splatProgram = makeProgram(splatShader);
  const advection = makeProgram(
    linear ? advectionShader : manualAdvectionShader,
  );
  const divergenceProgram = makeProgram(divergenceShader),
    curlProgram = makeProgram(curlShader),
    vorticity = makeProgram(vorticityShader);
  const pressureProgram = makeProgram(pressureShader),
    gradient = makeProgram(gradientSubtractShader);
  function buffer(target: number, data: Float32Array | Uint16Array) {
    const value = gl.createBuffer();
    if (!value) throw new Error("FluidRefraction could not allocate a buffer.");
    buffers.push(value);
    gl.bindBuffer(target, value);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return value;
  }
  const vertexBuffer = buffer(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
  );
  const indexBuffer = buffer(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 0, 2, 3]),
  );
  function blit(target: Target | null) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }
  function target(unit: number, format: Format, filter: number): Target {
    const texture = gl.createTexture(),
      framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer)
      throw new Error("FluidRefraction could not allocate a framebuffer.");
    const result = { texture, framebuffer, unit };
    targets.push(result);
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      format.internal,
      width,
      height,
      0,
      format.format,
      textureType,
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
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return result;
  }
  function pair(unit: number, format: Format, filter: number): Pair {
    return {
      read: target(unit, format, filter),
      write: target(unit + 1, format, filter),
      swap() {
        const old = this.read;
        this.read = this.write;
        this.write = old;
      },
    };
  }
  function disposeTargets() {
    for (const t of targets) {
      gl.deleteTexture(t.texture);
      gl.deleteFramebuffer(t.framebuffer);
    }
    targets = [];
  }
  function allocate() {
    disposeTargets();
    width = Math.max(1, gl.drawingBufferWidth >> 1);
    height = Math.max(1, gl.drawingBufferHeight >> 1);
    const filter = linear ? gl.LINEAR : gl.NEAREST;
    return {
      density: pair(2, rgbaFormat, filter),
      velocity: pair(0, rgFormat, filter),
      divergence: target(4, redFormat, gl.NEAREST),
      curl: target(5, redFormat, gl.NEAREST),
      pressure: pair(6, redFormat, gl.NEAREST),
    };
  }
  canvas.width = Math.max(1, root.clientWidth);
  canvas.height = Math.max(1, root.clientHeight);
  let fields = allocate();
  const location = (p: WebGLProgram, name: string) =>
    gl.getUniformLocation(p, name);
  const one = (p: WebGLProgram, name: string, value: number) =>
    gl.uniform1f(location(p, name), value);
  const two = (p: WebGLProgram, name: string, x: number, y: number) =>
    gl.uniform2f(location(p, name), x, y);
  function sample(p: WebGLProgram, name: string, t: Target) {
    gl.activeTexture(gl.TEXTURE0 + t.unit);
    gl.bindTexture(gl.TEXTURE_2D, t.texture);
    gl.uniform1i(location(p, name), t.unit);
  }
  function texel(p: WebGLProgram) {
    two(p, "texelSize", 1 / width, 1 / height);
  }
  function splat(x: number, y: number, dx: number, dy: number) {
    const { velocity, density } = fields;
    gl.useProgram(splatProgram);
    sample(splatProgram, "uTarget", velocity.read);
    one(splatProgram, "aspectRatio", canvas.width / canvas.height);
    two(splatProgram, "point", x / canvas.width, 1 - y / canvas.height);
    gl.uniform3f(location(splatProgram, "color"), dx, -dy, 1);
    one(
      splatProgram,
      "radius",
      settings.splatRadius / fluidMechanics.radiusDivisor,
    );
    blit(velocity.write);
    velocity.swap();
    sample(splatProgram, "uTarget", density.read);
    gl.uniform3f(location(splatProgram, "color"), 0.9, 0.9, 0.9);
    blit(density.write);
    density.swap();
  }
  const imageTexture = gl.createTexture();
  if (!imageTexture)
    throw new Error("FluidRefraction could not allocate the media texture.");
  gl.activeTexture(gl.TEXTURE0 + 8);
  gl.bindTexture(gl.TEXTURE_2D, imageTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  let source: HTMLImageElement | HTMLVideoElement,
    loaded = false,
    uploaded = false;
  let imageWidth = 1,
    imageHeight = 1;
  function wake() {
    if (!disposed && !frame && visible && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  if (media.video !== undefined) {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => {
      loaded = true;
      wake();
    };
    video.src = media.video;
    source = video;
    if (!reduced.matches) void video.play().catch(() => {});
  } else {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      loaded = true;
      wake();
    };
    image.src = media.image;
    source = image;
  }
  const pointers: Pointer[] = [
    { id: -1, x: 0, y: 0, dx: 0, dy: 0, down: false, moved: false },
  ];
  function upload() {
    if (!loaded || (uploaded && source instanceof HTMLImageElement)) return;
    const w =
      source instanceof HTMLVideoElement
        ? source.videoWidth
        : source.naturalWidth;
    const h =
      source instanceof HTMLVideoElement
        ? source.videoHeight
        : source.naturalHeight;
    if (
      w <= 0 ||
      h <= 0 ||
      (source instanceof HTMLVideoElement && source.readyState < 2)
    )
      return;
    gl.activeTexture(gl.TEXTURE0 + 8);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    imageWidth = w;
    imageHeight = h;
    uploaded = true;
  }
  function draw() {
    frame = 0;
    if (disposed) return;
    upload();
    const now = Date.now(),
      dt = Math.min((now - lastTime) / 1000, fluidMechanics.maxDelta);
    lastTime = now;
    const { velocity, density, divergence, curl: curlField, pressure } = fields;
    if (!reduced.matches) {
      gl.viewport(0, 0, width, height);
      gl.useProgram(advection);
      texel(advection);
      sample(advection, "uVelocity", velocity.read);
      sample(advection, "uSource", velocity.read);
      one(advection, "dt", dt);
      one(advection, "dissipation", settings.velocityDissipation / 100);
      blit(velocity.write);
      velocity.swap();
      sample(advection, "uVelocity", velocity.read);
      sample(advection, "uSource", density.read);
      one(
        advection,
        "dissipation",
        Math.max(0, 1 - settings.disappearSpeed / 100),
      );
      blit(density.write);
      density.swap();
      for (const pointer of pointers)
        if (pointer.moved) {
          splat(pointer.x, pointer.y, pointer.dx, pointer.dy);
          pointer.moved = false;
        }
      gl.useProgram(curlProgram);
      texel(curlProgram);
      sample(curlProgram, "uVelocity", velocity.read);
      blit(curlField);
      gl.useProgram(vorticity);
      texel(vorticity);
      sample(vorticity, "uVelocity", velocity.read);
      sample(vorticity, "uCurl", curlField);
      one(vorticity, "curl", settings.curl);
      one(vorticity, "dt", dt);
      blit(velocity.write);
      velocity.swap();
      gl.useProgram(divergenceProgram);
      texel(divergenceProgram);
      sample(divergenceProgram, "uVelocity", velocity.read);
      blit(divergence);
      gl.useProgram(clear);
      sample(clear, "uTexture", pressure.read);
      one(clear, "value", settings.pressureDissipation / 100);
      blit(pressure.write);
      pressure.swap();
      gl.useProgram(pressureProgram);
      texel(pressureProgram);
      sample(pressureProgram, "uDivergence", divergence);
      for (let i = 0; i < Math.max(1, settings.pressureIterations); i++) {
        sample(pressureProgram, "uPressure", pressure.read);
        blit(pressure.write);
        pressure.swap();
      }
      gl.useProgram(gradient);
      texel(gradient);
      sample(gradient, "uPressure", pressure.read);
      sample(gradient, "uVelocity", velocity.read);
      blit(velocity.write);
      velocity.swap();
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(display);
    two(display, "uResolution", gl.drawingBufferWidth, gl.drawingBufferHeight);
    two(display, "uImageRes", imageWidth, imageHeight);
    texel(display);
    one(
      display,
      "uRefractionAmount",
      settings.refractionAmount / fluidMechanics.refractionDivisor,
    );
    one(
      display,
      "uChromaticAberration",
      settings.chromaticAberration / fluidMechanics.chromaticDivisor,
    );
    one(display, "uHighlight", settings.highlight / 100);
    sample(display, "uTexture", density.read);
    gl.activeTexture(gl.TEXTURE0 + 8);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.uniform1i(location(display, "uImage"), 8);
    blit(null);
    if (!reduced.matches && visible && !document.hidden) wake();
  }
  if (!reduced.matches) {
    const count =
      Math.floor(Math.random() * fluidMechanics.initialSplatRange) +
      fluidMechanics.initialSplatMin;
    for (let i = 0; i < count; i++)
      splat(
        canvas.width * Math.random(),
        canvas.height * Math.random(),
        1000 * (Math.random() - 0.5),
        1000 * (Math.random() - 0.5),
      );
  }
  function move(e: MouseEvent) {
    const p = pointers[0],
      rect = canvas.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    p.moved = settings.interactOnHover || p.down;
    p.dx = (x - p.x) * fluidMechanics.pointerForce;
    p.dy = (y - p.y) * fluidMechanics.pointerForce;
    p.x = x;
    p.y = y;
    wake();
  }
  function down() {
    pointers[0].down = true;
    wake();
  }
  function up() {
    pointers[0].down = false;
  }
  function touchStart(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < e.targetTouches.length; i++) {
      const t = e.targetTouches[i];
      pointers[i] ??= {
        id: -1,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        down: false,
        moved: false,
      };
      Object.assign(pointers[i], {
        id: t.identifier,
        down: true,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      });
    }
    wake();
  }
  function touchMove(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    for (const t of Array.from(e.targetTouches)) {
      const p = pointers.find((p) => p.id === t.identifier);
      if (!p) continue;
      const x = t.clientX - rect.left,
        y = t.clientY - rect.top;
      p.moved = settings.interactOnHover || p.down;
      p.dx = (x - p.x) * fluidMechanics.pointerForce;
      p.dy = (y - p.y) * fluidMechanics.pointerForce;
      p.x = x;
      p.y = y;
    }
    wake();
  }
  function touchEnd(e: TouchEvent) {
    for (const t of Array.from(e.changedTouches)) {
      const p = pointers.find((p) => p.id === t.identifier);
      if (p) p.down = false;
    }
  }
  function resize() {
    const w = Math.max(1, root.clientWidth),
      h = Math.max(1, root.clientHeight);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      fields = allocate();
      wake();
    }
  }
  function visibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      if (source instanceof HTMLVideoElement) source.pause();
    } else {
      if (source instanceof HTMLVideoElement && !reduced.matches)
        void source.play().catch(() => {});
      lastTime = Date.now();
      wake();
    }
  }
  function motionChange() {
    fields = allocate();
    if (source instanceof HTMLVideoElement) {
      if (reduced.matches) source.pause();
      else void source.play().catch(() => {});
    }
    wake();
  }
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
    if (visible) {
      lastTime = Date.now();
      if (
        source instanceof HTMLVideoElement &&
        !reduced.matches &&
        !document.hidden
      )
        void source.play().catch(() => {});
      wake();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      if (source instanceof HTMLVideoElement) source.pause();
    }
  });
  intersection.observe(root);
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  canvas.addEventListener("mousemove", move);
  canvas.addEventListener("mousedown", down);
  canvas.addEventListener("touchmove", touchMove, { passive: false });
  canvas.addEventListener("touchstart", touchStart, { passive: false });
  window.addEventListener("mouseup", up);
  window.addEventListener("touchend", touchEnd);
  window.addEventListener("touchcancel", touchEnd);
  document.addEventListener("visibilitychange", visibilityChange);
  reduced.addEventListener("change", motionChange);
  wake();
  return {
    update(next: FluidSettings) {
      settings = next;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      observer.disconnect();
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchstart", touchStart);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      document.removeEventListener("visibilitychange", visibilityChange);
      reduced.removeEventListener("change", motionChange);
      if (source instanceof HTMLVideoElement) {
        source.onloadeddata = null;
        source.pause();
        source.removeAttribute("src");
        source.load();
      } else source.onload = null;
      disposeTargets();
      gl.deleteTexture(imageTexture);
      programs.forEach((p) => gl.deleteProgram(p));
      shaders.forEach((s) => gl.deleteShader(s));
      buffers.forEach((b) => gl.deleteBuffer(b));
    },
  };
}
