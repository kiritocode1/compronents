// @ts-nocheck
// biome-ignore-all lint: source-authored WebGL fluid-ink background port.
//
// Full-screen 2D fluid ("ink") simulation that trails the pointer. Ported from
// the source `simulation.js` into a factory that mounts its own canvas into the
// given element and returns a cleanup function. All shaders are inline, so this
// needs no external assets.

export function initSimulation(mount: HTMLElement): () => void {
  const canvas = document.createElement("canvas");

  const gl = canvas.getContext("webgl", {
    alpha: true,
    depth: false,
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) return () => {};

  const hf = gl.getExtension("OES_texture_half_float");
  gl.getExtension("OES_texture_half_float_linear");

  const C = {
    TEXTURE_DOWNSAMPLE: 2,
    VELOCITY_DISSIPATION: 0.925,
    DENSITY_DISSIPATION: 0.95,
    CURL: 50,
    PRESSURE_DISSIPATION: 0.75,
    PRESSURE_ITERATIONS: 50,
    SPLAT_RADIUS: 0.0075,
    DISPLAY_SHADER: 0.75,
    SMOOTHING: 1,
    SPLAT_DYE_SCALE: 0.85,
    STROKE_SCALE: 25,
    splatDyeR: 1,
    splatDyeG: 214 / 255,
    splatDyeB: 1 / 255,
    invertVelocityX: false,
    invertVelocityY: false,
    invertPointerY: false,
    inkR: 1,
    inkG: 214 / 255,
    inkB: 1 / 255,
    clearR: 0.05,
    clearG: 0.05,
    clearB: 0.05,
    clearA: 0,
    mixBlendMode: "difference",
    canvasOpacity: 1,
    zIndex: 20000,
    pointerEvents: "none",
    flipCanvasY: false,
    blendPreset: "one_oneMinusSrcAlpha",
    paused: false,
    maxDt: 0.016,
    dprCap: 2,
  };

  let SIM = 0;
  let simH = 0;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW,
  );

  const vertexSrc = `precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  function prog(fsSrc) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexSrc);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSrc);
    gl.compileShader(fs);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const { name } = gl.getActiveUniform(p, i);
      u[name] = gl.getUniformLocation(p, name);
    }
    return { p, u };
  }

  function fbo(w, h, filter) {
    const type = hf ? hf.HALF_FLOAT_OES : gl.FLOAT;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      tex,
      fb,
      w,
      h,
      bind(i) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return i;
      },
    };
  }

  function dfbo(w, h, filter) {
    let a = fbo(w, h, filter),
      b = fbo(w, h, filter);
    return {
      w,
      h,
      get read() {
        return a;
      },
      get write() {
        return b;
      },
      swap() {
        [a, b] = [b, a];
      },
    };
  }

  function disposeTexFb(tex, fb) {
    if (tex) gl.deleteTexture(tex);
    if (fb) gl.deleteFramebuffer(fb);
  }

  function disposeFbo(target) {
    if (!target) return;
    disposeTexFb(target.tex, target.fb);
  }

  function disposeDfbo(d) {
    if (!d) return;
    disposeFbo(d.read);
    disposeFbo(d.write);
  }

  let F = null;

  function blit(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, target ? target.w : W, target ? target.h : H);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  function use({ p, u }) {
    gl.useProgram(p);
    const loc = gl.getAttribLocation(p, "aPosition");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return u;
  }

  const P = {
    clear: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () {
  vec4 tex = texture2D(uTexture, vUv);
  gl_FragColor = vec4(mix(vec3(0.0), tex.rgb, value), 0.0);
}`),

    display: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uDisplayCutoff;
uniform float uSmoothing;
uniform vec3 uInk;
uniform vec3 uBg;
void main () {
  vec4 tex = texture2D(uTexture, vUv);
  float lo = uDisplayCutoff * uSmoothing;
  float hi = uDisplayCutoff;
  float a = smoothstep(lo, hi, clamp(length(tex.rgb), 0.0, 1.0));
  gl_FragColor = vec4(mix(uBg, uInk, a), 1.0);
}`),

    splat: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`),

    advection: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
}`),

    divergence: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
vec2 sampleVelocity (in vec2 uv) {
  vec2 multiplier = vec2(1.0, 1.0);
  if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
  if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
  if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
  if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
  return multiplier * texture2D(uVelocity, uv).xy;
}
void main () {
  float L = sampleVelocity(vL).x;
  float R = sampleVelocity(vR).x;
  float T = sampleVelocity(vT).y;
  float B = sampleVelocity(vB).y;
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`),

    curl: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}`),

    vorticity: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
  force *= 1.0 / length(force + 0.00001) * curl * C;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}`),

    pressure: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
vec2 boundary (in vec2 uv) {
  return min(max(uv, 0.0), 1.0);
}
void main () {
  float L = texture2D(uPressure, boundary(vL)).x;
  float R = texture2D(uPressure, boundary(vR)).x;
  float T = texture2D(uPressure, boundary(vT)).x;
  float B = texture2D(uPressure, boundary(vB)).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`),

    gradSub: prog(`precision highp float;
precision mediump sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
vec2 boundary (in vec2 uv) {
  return min(max(uv, 0.0), 1.0);
}
void main () {
  float L = texture2D(uPressure, boundary(vL)).x;
  float R = texture2D(uPressure, boundary(vR)).x;
  float T = texture2D(uPressure, boundary(vT)).x;
  float B = texture2D(uPressure, boundary(vB)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`),
  };

  let DPR = Math.min(window.devicePixelRatio || 1, C.dprCap);
  let W = (canvas.width = window.innerWidth * DPR);
  let H = (canvas.height = window.innerHeight * DPR);

  function syncCanvasCssSize() {
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function applyCanvasStyle() {
    const flip = C.flipCanvasY ? "scaleY(-1)" : "none";
    canvas.style.cssText = `
      mix-blend-mode: ${C.mixBlendMode};
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: ${C.pointerEvents};
      z-index: ${C.zIndex};
      opacity: ${C.canvasOpacity};
      transform: ${flip};
      transform-origin: center center;
    `;
  }

  function applyBlendPreset() {
    gl.enable(gl.BLEND);
    switch (C.blendPreset) {
      case "additive":
        gl.blendFunc(gl.ONE, gl.ONE);
        break;
      case "srcAlpha_oneMinusSrcAlpha":
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        break;
      default:
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
  }

  function computeSimSizes() {
    const d = C.TEXTURE_DOWNSAMPLE | 0;
    SIM = Math.max(1, W >> d);
    simH = Math.max(1, H >> d);
  }

  function rebuildFramebuffers() {
    computeSimSizes();
    if (F) {
      disposeDfbo(F.vel);
      disposeDfbo(F.dye);
      disposeFbo(F.div);
      disposeFbo(F.curl);
      disposeDfbo(F.pres);
    }
    F = {
      vel: dfbo(SIM, simH, gl.LINEAR),
      dye: dfbo(SIM, simH, gl.LINEAR),
      div: fbo(SIM, simH, gl.NEAREST),
      curl: fbo(SIM, simH, gl.NEAREST),
      pres: dfbo(SIM, simH, gl.NEAREST),
    };
  }

  function resizeCanvasDimensions() {
    DPR = Math.min(window.devicePixelRatio || 1, C.dprCap);
    W = canvas.width = Math.max(1, Math.floor(window.innerWidth * DPR));
    H = canvas.height = Math.max(1, Math.floor(window.innerHeight * DPR));
    syncCanvasCssSize();
    const prevW = SIM;
    const prevH = simH;
    computeSimSizes();
    if (SIM !== prevW || simH !== prevH) rebuildFramebuffers();
  }

  function splat(clientX, clientY, dx, dy) {
    const r = canvas.getBoundingClientRect();
    let nx = (clientX - r.left) / r.width;
    let ny = 1 - (clientY - r.top) / r.height;
    if (C.invertPointerY) ny = 1 - ny;

    let vx = dx;
    let vy = dy;
    if (C.invertVelocityX) vx = -vx;
    if (C.invertVelocityY) vy = -vy;

    gl.disable(gl.BLEND);
    let u = use(P.splat);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1f(u.aspectRatio, W / H);
    gl.uniform2f(u.point, nx, ny);
    gl.uniform1f(u.radius, C.SPLAT_RADIUS);

    gl.uniform1i(u.uTarget, F.vel.read.bind(0));
    gl.uniform3f(u.color, vx, -vy, 1.0);
    blit(F.vel.write);
    F.vel.swap();

    gl.uniform1i(u.uTarget, F.dye.read.bind(0));
    gl.uniform3f(
      u.color,
      C.SPLAT_DYE_SCALE * C.splatDyeR,
      C.SPLAT_DYE_SCALE * C.splatDyeG,
      C.SPLAT_DYE_SCALE * C.splatDyeB,
    );
    blit(F.dye.write);
    F.dye.swap();
  }

  function advectOnly(dt) {
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, SIM, simH);

    let u = use(P.advection);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uVelocity, F.vel.read.bind(0));
    gl.uniform1i(u.uSource, F.vel.read.bind(0));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.dissipation, C.VELOCITY_DISSIPATION);
    blit(F.vel.write);
    F.vel.swap();

    gl.uniform1i(u.uVelocity, F.vel.read.bind(0));
    gl.uniform1i(u.uSource, F.dye.read.bind(1));
    gl.uniform1f(u.dissipation, C.DENSITY_DISSIPATION);
    blit(F.dye.write);
    F.dye.swap();
  }

  function projectPressure(dt) {
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, SIM, simH);

    let u = use(P.curl);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uVelocity, F.vel.read.bind(0));
    blit(F.curl);

    u = use(P.vorticity);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uVelocity, F.vel.read.bind(0));
    gl.uniform1i(u.uCurl, F.curl.bind(1));
    gl.uniform1f(u.curl, C.CURL);
    gl.uniform1f(u.dt, dt);
    blit(F.vel.write);
    F.vel.swap();

    u = use(P.divergence);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uVelocity, F.vel.read.bind(0));
    blit(F.div);

    u = use(P.clear);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uTexture, F.pres.read.bind(0));
    gl.uniform1f(u.value, C.PRESSURE_DISSIPATION);
    blit(F.pres.write);
    F.pres.swap();

    u = use(P.pressure);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uDivergence, F.div.bind(0));
    for (let i = 0; i < C.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(u.uPressure, F.pres.read.bind(1));
      blit(F.pres.write);
      F.pres.swap();
    }

    u = use(P.gradSub);
    gl.uniform2f(u.texelSize, 1 / SIM, 1 / simH);
    gl.uniform1i(u.uPressure, F.pres.read.bind(0));
    gl.uniform1i(u.uVelocity, F.vel.read.bind(1));
    blit(F.vel.write);
    F.vel.swap();
  }

  function render() {
    applyBlendPreset();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.clearColor(C.clearR, C.clearG, C.clearB, C.clearA);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const u = use(P.display);
    gl.uniform2f(u.texelSize, 1 / W, 1 / H);
    gl.uniform1i(u.uTexture, F.dye.read.bind(0));
    gl.uniform1f(u.uDisplayCutoff, C.DISPLAY_SHADER);
    gl.uniform1f(u.uSmoothing, C.SMOOTHING);
    gl.uniform3f(u.uInk, C.inkR, C.inkG, C.inkB);
    gl.uniform3f(u.uBg, 0, 0, 0);
    blit(null);
  }

  const ptr = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    moved: false,
    down: false,
    initialized: false,
  };

  function onMove(clientX, clientY) {
    if (ptr.initialized) {
      ptr.dx = C.STROKE_SCALE * (clientX - ptr.x);
      ptr.dy = C.STROKE_SCALE * (clientY - ptr.y);
      ptr.moved = true;
    } else {
      ptr.initialized = true;
    }
    ptr.x = clientX;
    ptr.y = clientY;
  }

  const onMouseMove = (e) => onMove(e.clientX, e.clientY);
  const onTouchMove = (e) => {
    e.preventDefault();
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  };

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvasDimensions, 50);
  };

  let last = Date.now();
  let raf = 0;

  function loop() {
    const now = Date.now();
    const dt = Math.min((now - last) / 1000, C.maxDt);
    last = now;

    if (!C.paused) {
      advectOnly(dt);
      if (ptr.moved) {
        splat(ptr.x, ptr.y, ptr.dx, ptr.dy);
        ptr.moved = false;
      }
      projectPressure(dt);
    }

    render();
    raf = requestAnimationFrame(loop);
  }

  // Mount + start.
  mount.appendChild(canvas);
  canvas.style.opacity = "0";
  canvas.style.mixBlendMode = "normal";
  computeSimSizes();
  rebuildFramebuffers();
  applyCanvasStyle();
  syncCanvasCssSize();
  requestAnimationFrame(() => {
    canvas.style.opacity = String(C.canvasOpacity);
  });

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(loop);

  return () => {
    C.paused = true;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("resize", onResize);
    clearTimeout(resizeTimer);
    disposeDfbo(F?.vel);
    disposeDfbo(F?.dye);
    disposeFbo(F?.div);
    disposeFbo(F?.curl);
    disposeDfbo(F?.pres);
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    canvas.remove();
  };
}
