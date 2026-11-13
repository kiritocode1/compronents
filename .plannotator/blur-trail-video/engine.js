// WebGL2 port of the seitaroyamazaki.com KV hover effect (three r181 WebGPU + TSL).
// Pipeline per frame, matching reference/blur-trail-video/kv-effect.pretty.js:
//   1. mask ping-pong at CSS-pixel size: m = (moving ? smoothstep(0.2, 0, dist) : 0) + prev * 0.92
//   2. scene pass: video cover-fit to 1920x1080 aspect, linear (sRGB decoded)
//   3. rgbShift(amount 0.03, angle 45deg) -> half-float RT
//   4. gaussianBlur(direction vec2(1,1)*4, sigma 16): 35 taps, H then V
//   5. out = sRGB(mix(scene, blur, clamp(mask, 0, 1)))
export const DEFAULTS = {
  decay: 0.92,
  radius: 0.2,
  smoothing: 0.1,
  shiftAmount: 0.03,
  shiftAngle: 45,
  blurSigma: 16,
  blurStep: 4,
};

const VERT = `#version 300 es
in vec2 p;
out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

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
  float k = clamp((d - uRadius) / (0.0 - uRadius), 0.0, 1.0);
  float brush = k * k * (3.0 - 2.0 * k);
  float v = uMoving * brush + texelFetch(uPrev, t, 0).r * uDecay;
  o = vec4(v, v, v, 1.0);
}`;

const SCENE = `#version 300 es
precision highp float;
uniform sampler2D uVideo;
uniform vec2 uCover;
in vec2 vUv;
out vec4 o;
uniform float uGamma;
void main() {
  vec4 c = texture(uVideo, (vUv - 0.5) * uCover + 0.5);
  o = vec4(pow(c.rgb, vec3(uGamma)), c.a);
}`;

const SHIFT = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uOffset;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 r = texture(uTex, vUv + uOffset);
  vec4 g = texture(uTex, vUv);
  vec4 b = texture(uTex, vUv - uOffset);
  o = vec4(r.r, g.g, b.b, g.a);
}`;

const blurSource = (taps) => `#version 300 es
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
  // source mask is vec4(e, e, e, 1): rgb mixed by the trail, alpha taken from the blur
  float m = clamp(texture(uMask, vUv).r, 0.0, 1.0);
  vec4 b = texture(uBlur, vUv);
  vec4 c = vec4(mix(texture(uScene, vUv).rgb, b.rgb, m), b.a);
  o = vec4(oetf(c.rgb), c.a);
}`;

// three's GaussianBlurNode._getCoefficients
const coefficients = (sigma) => {
  const n = 3 + 2 * sigma;
  const s = n / 3;
  return Array.from({ length: n }, (_, i) => (0.39894 * Math.exp((-0.5 * i * i) / (s * s))) / s);
};

/**
 * Mounts the effect on `canvas`, sized to `host`. Pointer input is read from
 * `host`. Returns a cleanup function.
 */
export function createBlurTrail({ canvas, host, video, options = {} }) {
  const opt = { ...DEFAULTS, ...options };
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true });
  if (!gl) return () => {};
  const floatOk = !!gl.getExtension("EXT_color_buffer_float");
  const taps = 3 + 2 * opt.blurSigma;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const program = (src, names) => {
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, "p");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
    const u = {};
    for (const n of names) u[n] = gl.getUniformLocation(p, n);
    return { p, u };
  };
  const maskP = program(MASK, ["uPrev", "uSize", "uMouse", "uMoving", "uDecay", "uRadius"]);
  const sceneP = program(SCENE, ["uVideo", "uCover", "uGamma"]);
  const shiftP = program(SHIFT, ["uTex", "uOffset"]);
  const blurP = program(blurSource(taps), ["uTex", "uStep", "uW"]);
  const compP = program(COMPOSITE, ["uScene", "uBlur", "uMask"]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const videoTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);

  const target = (w, h, kind) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const filter = kind === "mask" ? gl.NEAREST : gl.LINEAR;
    if (kind === "mask") gl.texImage2D(gl.TEXTURE_2D, 0, floatOk ? gl.R32F : gl.R16F, w, h, 0, gl.RED, floatOk ? gl.FLOAT : gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, floatOk ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, floatOk ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, filter], [gl.TEXTURE_MAG_FILTER, filter], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fb, w, h };
  };
  const drop = (t) => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); } };

  let cssW = 1, cssH = 1, bufW = 1, bufH = 1;
  let maskA, maskB, sceneRT, shiftRT, blurH, blurV;
  const resize = () => {
    const r = host.getBoundingClientRect();
    cssW = Math.max(1, r.width);
    cssH = Math.max(1, r.height);
    const pr = Math.min(2, window.devicePixelRatio || 1);
    bufW = Math.max(1, Math.floor(cssW * pr));
    bufH = Math.max(1, Math.floor(cssH * pr));
    canvas.width = bufW;
    canvas.height = bufH;
    for (const t of [maskA, maskB, sceneRT, shiftRT, blurH, blurV]) drop(t);
    const mw = Math.max(1, Math.floor(cssW)), mh = Math.max(1, Math.floor(cssH));
    maskA = target(mw, mh, "mask");
    maskB = target(mw, mh, "mask");
    sceneRT = target(bufW, bufH);
    shiftRT = target(bufW, bufH);
    blurH = target(bufW, bufH);
    blurV = target(bufW, bufH);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // Pointer: eased follower, as in the site's pointer module (smoothing 0.1 per frame,
  // "moving" while the follower is more than 3px from the pointer on either axis).
  let tx = 0, ty = 0, fx = 0, fy = 0, seen = false, moving = false;
  let uMouse = [0, 0], uMoving = 0;
  const onMove = (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!seen) { fx = tx; fy = ty; seen = true; }
  };
  host.addEventListener("pointermove", onMove);

  let videoDirty = true;
  let vfc = 0;
  const onFrame = () => { videoDirty = true; vfc = video.requestVideoFrameCallback(onFrame); };
  if ("requestVideoFrameCallback" in video) vfc = video.requestVideoFrameCallback(onFrame);

  const draw = (prog, out, w, h) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, out ? out.fb : null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog.p);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const bind = (unit, tex, loc) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, unit);
  };
  const weights = new Float32Array(coefficients(opt.blurSigma));
  const angle = (opt.shiftAngle * Math.PI) / 180;

  let raf = 0;
  const frame = () => {
    // pointer follower runs first in the frame, as the site's own rAF does
    const dx = tx - fx, dy = ty - fy;
    fx += dx * opt.smoothing;
    fy += dy * opt.smoothing;
    moving = Math.abs(dx) > 3 || Math.abs(dy) > 3;

    if (video.readyState >= 2 && (videoDirty || !("requestVideoFrameCallback" in video))) {
      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      videoDirty = false;
    }
    gl.bindVertexArray(vao);

    // 1. mask
    gl.useProgram(maskP.p);
    bind(0, maskA.tex, maskP.u.uPrev);
    gl.uniform2f(maskP.u.uSize, cssW, cssH);
    gl.uniform2f(maskP.u.uMouse, uMouse[0], uMouse[1]);
    gl.uniform1f(maskP.u.uMoving, uMoving);
    gl.uniform1f(maskP.u.uDecay, opt.decay);
    gl.uniform1f(maskP.u.uRadius, opt.radius);
    draw(maskP, maskB, maskB.w, maskB.h);

    // 2. scene, cover-fit to a 1920x1080 plane
    const planeAspect = 1920 / 1080;
    const pw = cssW / cssH > planeAspect ? cssW : cssH * planeAspect;
    const ph = cssW / cssH > planeAspect ? cssW / planeAspect : cssH;
    gl.useProgram(sceneP.p);
    bind(0, videoTex, sceneP.u.uVideo);
    gl.uniform2f(sceneP.u.uCover, cssW / pw, cssH / ph);
    gl.uniform1f(sceneP.u.uGamma, opt.videoGamma ?? 2.0);
    draw(sceneP, sceneRT, bufW, bufH);

    // 3. rgb shift
    gl.useProgram(shiftP.p);
    bind(0, sceneRT.tex, shiftP.u.uTex);
    gl.uniform2f(shiftP.u.uOffset, Math.cos(angle) * opt.shiftAmount, Math.sin(angle) * opt.shiftAmount);
    draw(shiftP, shiftRT, bufW, bufH);

    // 4. gaussian blur, horizontal then vertical
    gl.useProgram(blurP.p);
    gl.uniform1fv(blurP.u.uW, weights);
    bind(0, shiftRT.tex, blurP.u.uTex);
    gl.uniform2f(blurP.u.uStep, opt.blurStep / bufW, 0);
    draw(blurP, blurH, bufW, bufH);
    bind(0, blurH.tex, blurP.u.uTex);
    gl.uniform2f(blurP.u.uStep, 0, opt.blurStep / bufH);
    draw(blurP, blurV, bufW, bufH);

    // 5. composite
    gl.useProgram(compP.p);
    bind(0, sceneRT.tex, compP.u.uScene);
    bind(1, blurV.tex, compP.u.uBlur);
    bind(2, (opt.debugView === "blur" ? sceneRT : maskB).tex, compP.u.uMask);
    if (opt.debugView === "blur") { bind(0, blurV.tex, compP.u.uScene); }
    draw(compP, null, bufW, bufH);

    // uniforms for the next frame, read after render as the site does
    const r = host.getBoundingClientRect();
    const x = Math.min(Math.max(fx - r.left, 0), cssW);
    const y = Math.min(Math.max(fy - r.top, 0), cssH);
    uMouse = [x / cssW, 1 - y / cssH];
    uMoving = moving ? 1 : 0;
    [maskA, maskB] = [maskB, maskA];
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    if (vfc) video.cancelVideoFrameCallback(vfc);
    ro.disconnect();
    host.removeEventListener("pointermove", onMove);
    for (const t of [maskA, maskB, sceneRT, shiftRT, blurH, blurV]) drop(t);
    gl.deleteTexture(videoTex);
    gl.deleteBuffer(buf);
    gl.deleteVertexArray(vao);
    for (const p of [maskP, sceneP, shiftP, blurP, compP]) gl.deleteProgram(p.p);
    gl.deleteShader(vs);
  };
}
