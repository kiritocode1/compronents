// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

const DEFAULT_CONFIG = {
  cubeSize: 0.75,
  bgColor: "#0b0b0b",
  smokeColor: [1.0, 1.0, 1.0],
  dpr: 1,
};

// extend intersection observer so smoke is ready before footer enters
const APPROACH_ROOT_MARGIN = "0px 0px 100% 0px";

// parallax smoothing - higher is snappier, lower is smoother
const PARALLAX_SMOOTH = 0.065;
const PARALLAX_STRENGTH = { theta: 0.58, phi: 0.42 };

// frame-rate independent parallax lerp via gsap ticker
function lerpParallax(current, target) {
  const t = 1 - Math.exp(-PARALLAX_SMOOTH * gsap.ticker.deltaRatio());
  return current + (target - current) * t;
}

// convert hex color string to normalized rgb array
function hexToGL(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

// webgl vertex shader - fullscreen quad
const VERT = `
attribute vec2 a_position;
void main(){
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// webgl fragment shader - volumetric smoke raymarch
const FRAG = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_camOffset;
uniform sampler2D u_noise;
uniform float u_cubeSize;
uniform vec3 u_bgColor;
uniform vec3 u_smokeColor;

#define PI 3.141592653589793
#define TWOPI 6.283185307179586
#define HALFPI 1.570796326794896

#define POLAR(theta) vec3(cos(theta), 0.0, sin(theta))
#define SPHERICAL(theta, phi) (sin(phi)*POLAR(theta) + vec3(0.0, cos(phi), 0.0))

#define MAX_ALPHA_PER_UNIT_DIST 10.0
#define QUIT_ALPHA 0.99
#define RAY_STEP 0.025

#define TAN_HALF_FOVY 0.5773502691896257

float len2Inf(vec2 v){
  vec2 d = abs(v);
  return max(d.x, d.y);
}

void boxClip(
  in vec3 boxMin, in vec3 boxMax,
  in vec3 p, in vec3 v,
  out vec2 tRange, out float didHit
){
  vec3 tb0 = (boxMin - p) / v;
  vec3 tb1 = (boxMax - p) / v;
  vec3 tmin = min(tb0, tb1);
  vec3 tmax = max(tb0, tb1);
  tRange = vec2(
    max(max(tmin.x, tmin.y), tmin.z),
    min(min(tmax.x, tmax.y), tmax.z)
  );
  didHit = step(tRange.x, tRange.y);
}

float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 colormap(float t){
  return 0.5 + 0.5 * cos(TWOPI * (t + vec3(0.0, 0.1, 0.2)));
}

vec4 blendOnto(vec4 cFront, vec4 cBehind){
  return cFront + (1.0 - cFront.a) * cBehind;
}

float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 uv = (i.xy + vec2(37.0, 17.0) * i.z) + f.xy;
  vec2 rg = texture2D(u_noise, (uv + 0.5) / 256.0).yx;
  return mix(rg.x, rg.y, f.z);
}

float fbm(vec3 p){
  p *= 0.6;
  float v = noise(p);
  p *= 0.3;
  v = mix(v, noise(p), 0.7);
  p *= 0.3;
  v = mix(v, noise(p), 0.7);
  return v;
}

float fDensity(vec3 lmn, float t){
  t += 32.0;
  vec3 uvw = (lmn - vec3(63.5)) / 63.5;
  float d2 = fbm(
    vec3(0.6, 0.3, 0.6) * lmn +
    vec3(0.0, 8.0 * t, 0.0)
  );
  float d1 = fbm(
    0.3 * lmn +
    vec3(0.0, 4.0 * t, 0.0) +
    5.0 * vec3(cos(d2 * TWOPI), 2.0 * d2, sin(d2 * TWOPI))
  );
  d1 = pow(d1, mix(4.0, 12.0, smoothstep(0.6, 1.0, len2Inf(uvw.xz))));
  float a = 0.02;
  float b = 0.08;
  float raw = 0.02 + 0.2 * smoothstep(0.0, a, d1) + 0.5 * smoothstep(a, b, d1) + 0.18 * smoothstep(b, 1.0, d1);
  float edgeDist = 1.0 - len2Inf(uvw.xz);
  float edgeFade = smoothstep(0.0, 0.08, edgeDist) * smoothstep(0.0, 0.08, 1.0 - abs(uvw.y));
  return raw * edgeFade;
}

float BOX_N = 128.0;

vec3 lmnFromWorldPos(vec3 p, float cubeSize){
  vec3 bmin = vec3(-cubeSize);
  vec3 bmax = vec3(cubeSize);
  vec3 uvw = (p - bmin) / (bmax - bmin);
  return uvw * (BOX_N - 1.0);
}

float estimateLight(vec3 lmn, vec3 nvToLight, float cubeSize, float time){
  float s1 = fDensity(lmn + nvToLight * 3.0, time);
  float s2 = fDensity(lmn + nvToLight * 8.0, time);
  float occlusion = s1 * 0.5 + s2 * 0.5;
  return exp(-occlusion * 12.0);
}

vec4 marchVolume(vec3 p, vec3 nv, vec2 fragCoord, float cubeSize, float time){
  vec3 bmin = vec3(-cubeSize);
  vec3 bmax = vec3(cubeSize);
  vec2 tRange;
  float didHit;
  boxClip(bmin, bmax, p, nv, tRange, didHit);
  tRange.x = max(0.0, tRange.x);
  vec4 color = vec4(0.0);
  if(didHit < 0.5) return color;

  float camTheta = 0.2 * time + u_camOffset.x;
  vec3 lightPos = 0.9 * POLAR(camTheta + PI * 0.15) + vec3(0.0, 2.0, 0.0);

  float t = tRange.x + min(tRange.y - tRange.x, RAY_STEP) * 0.5 * hash12(fragCoord);
  for(int i = 0; i < 90; i++){
    if(t > tRange.y || color.a > QUIT_ALPHA) break;
    vec3 rayPos = p + t * nv;
    vec3 lmn = lmnFromWorldPos(rayPos, cubeSize);
    float density = fDensity(lmn, time);
    vec3 nvToLight = normalize(lmnFromWorldPos(lightPos, cubeSize) - lmn);
    float lightAmount = estimateLight(lmn, nvToLight, cubeSize, time);
    lightAmount = mix(lightAmount, 1.0, 0.05);

    vec3 cfrag = u_smokeColor * colormap(0.7 * density + 0.8);
    float calpha = density * MAX_ALPHA_PER_UNIT_DIST * RAY_STEP;
    vec4 ci = clamp(vec4(cfrag * lightAmount, 1.0) * calpha, 0.0, 1.0);
    color = blendOnto(color, ci);
    t += RAY_STEP;
  }
  float finalA = clamp(color.a / QUIT_ALPHA, 0.0, 1.0);
  color *= (finalA / (color.a + 1e-5));
  return color;
}

vec3 nvCamDirFromClip(vec3 nvFw, vec2 clip, vec2 res){
  vec3 nvRt = normalize(cross(nvFw, vec3(0.0, 1.0, 0.0)));
  vec3 nvUp = cross(nvRt, nvFw);
  return normalize(TAN_HALF_FOVY * (clip.x * (res.x / res.y) * nvRt + clip.y * nvUp) + nvFw);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float camTheta = 0.2 * u_time + u_camOffset.x;
  float camPhi = HALFPI - 0.2 + u_camOffset.y;

  vec3 camPos = 2.5 * SPHERICAL(camTheta, camPhi);
  vec3 lookTarget = vec3(0.0);
  vec3 nvCamFw = normalize(lookTarget - camPos);
  vec3 nvCamDir = nvCamDirFromClip(nvCamFw, uv * 2.0 - 1.0, u_resolution);

  vec4 fgColor = marchVolume(camPos, nvCamDir, gl_FragCoord.xy, u_cubeSize, u_time);
  vec3 finalColor = blendOnto(fgColor, vec4(u_bgColor, 1.0)).rgb;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function Footer({
  cubeSize = DEFAULT_CONFIG.cubeSize,
  bgColor = DEFAULT_CONFIG.bgColor,
  smokeColor = DEFAULT_CONFIG.smokeColor,
  dpr = DEFAULT_CONFIG.dpr,
  className = "",
  children,
}) {
  const footerRef = useRef(null);
  const canvasRef = useRef(null);
  const visibleRef = useRef(false);
  const loopControlRef = useRef({ start: () => {}, stop: () => {} });

  // lazy-init webgl smoke, parallax, and intersection-based render loop
  useEffect(() => {
    const footer = footerRef.current;
    const canvas = canvasRef.current;
    if (!footer || !canvas) return;

    let gl = null;
    let prog = null;
    let vs = null;
    let fs = null;
    let buf = null;
    let noiseTex = null;
    let uTime = null;
    let uRes = null;
    let uCamOffset = null;
    let uCubeSize = null;
    let uBgColor = null;
    let uSmokeColor = null;

    const parallaxTarget = { x: 0, y: 0 };
    const parallaxCurrent = { x: 0, y: 0 };
    let pointerInsideFooter = false;

    let initialized = false;
    let initScheduled = false;
    let tickerFn = null;
    let pauseOffset = 0;
    let pauseStartedAt = 0;
    const startTime = performance.now();
    const bg = hexToGL(bgColor);

    let lastW = 0;
    let lastH = 0;

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    function initWebGL() {
      if (initialized) return true;
      initialized = true;

      gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
        desynchronized: true,
      });

      if (!gl) {
        console.warn("WebGL not supported");
        return false;
      }

      vs = compileShader(gl.VERTEX_SHADER, VERT);
      fs = compileShader(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;

      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);

      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const aPos = gl.getAttribLocation(prog, "a_position");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      noiseTex = gl.createTexture();
      const noiseData = new Uint8Array(256 * 256 * 4);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 256) | 0;
      }
      gl.bindTexture(gl.TEXTURE_2D, noiseTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        256,
        256,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        noiseData,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      uTime = gl.getUniformLocation(prog, "u_time");
      uRes = gl.getUniformLocation(prog, "u_resolution");
      uCamOffset = gl.getUniformLocation(prog, "u_camOffset");
      const uNoise = gl.getUniformLocation(prog, "u_noise");
      uCubeSize = gl.getUniformLocation(prog, "u_cubeSize");
      uBgColor = gl.getUniformLocation(prog, "u_bgColor");
      uSmokeColor = gl.getUniformLocation(prog, "u_smokeColor");

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, noiseTex);
      gl.uniform1i(uNoise, 0);

      resize();
      return true;
    }

    function scheduleInit() {
      if (initialized || initScheduled) return;
      initScheduled = true;

      requestAnimationFrame(() => {
        initScheduled = false;
        if (initWebGL() && visibleRef.current) {
          startLoop();
        }
      });
    }

    function resize() {
      if (!gl) return;

      const scale = Math.min(dpr, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * scale);
      const h = Math.round(rect.height * scale);

      if (w !== lastW || h !== lastH) {
        canvas.width = w;
        canvas.height = h;
        lastW = w;
        lastH = h;
      }
    }

    function render() {
      if (!initialized || !gl || !visibleRef.current) {
        stopLoop();
        return;
      }

      const t = (performance.now() - startTime - pauseOffset) / 1000;

      parallaxCurrent.x = lerpParallax(parallaxCurrent.x, parallaxTarget.x);
      parallaxCurrent.y = lerpParallax(parallaxCurrent.y, parallaxTarget.y);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(bg[0], bg[1], bg[2], 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uCamOffset, parallaxCurrent.x, parallaxCurrent.y);
      gl.uniform1f(uCubeSize, cubeSize);
      gl.uniform3f(uBgColor, bg[0], bg[1], bg[2]);
      gl.uniform3f(uSmokeColor, smokeColor[0], smokeColor[1], smokeColor[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function startLoop() {
      if (tickerFn || !initialized) return;

      if (pauseStartedAt) {
        pauseOffset += performance.now() - pauseStartedAt;
        pauseStartedAt = 0;
      }

      tickerFn = render;
      gsap.ticker.add(tickerFn);
    }

    function stopLoop() {
      if (!tickerFn) return;

      gsap.ticker.remove(tickerFn);
      tickerFn = null;
      pauseStartedAt = performance.now();
    }

    loopControlRef.current = { start: startLoop, stop: stopLoop };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    const approachObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          if (!initialized) {
            scheduleInit();
          } else {
            startLoop();
          }
        } else {
          stopLoop();
        }
      },
      { rootMargin: APPROACH_ROOT_MARGIN, threshold: 0 },
    );

    approachObserver.observe(canvas);

    function resetParallaxTarget() {
      parallaxTarget.x = 0;
      parallaxTarget.y = 0;
    }

    function setParallaxTarget(clientX, clientY) {
      const rect = footer.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((clientY - rect.top) / rect.height) * 2 - 1;

      parallaxTarget.x = nx * PARALLAX_STRENGTH.theta;
      parallaxTarget.y = -ny * PARALLAX_STRENGTH.phi;
    }

    function isPointerInsideFooter(clientX, clientY) {
      const rect = footer.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    }

    function onPointerMove(e) {
      const inside = isPointerInsideFooter(e.clientX, e.clientY);

      if (!inside) {
        if (pointerInsideFooter) {
          pointerInsideFooter = false;
          resetParallaxTarget();
        }
        return;
      }

      pointerInsideFooter = true;
      setParallaxTarget(e.clientX, e.clientY);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      stopLoop();
      document.removeEventListener("pointermove", onPointerMove);
      approachObserver.disconnect();
      resizeObserver.disconnect();
      loopControlRef.current = { start: () => {}, stop: () => {} };

      if (gl) {
        if (prog) gl.deleteProgram(prog);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (buf) gl.deleteBuffer(buf);
        if (noiseTex) gl.deleteTexture(noiseTex);
      }
    };
  }, [cubeSize, bgColor, smokeColor, dpr]);

  return (
    <footer ref={footerRef} className={`smoke-footer ${className}`}>
      <canvas ref={canvasRef} />
      {children}

      <div className="footer-content">
        <div className="container">
          <div className="footer-heading">
            <p className="mono">Establish Contact</p>
            <h2 className="type-2">
              Let's Make Something They Can't Walk Away From
            </h2>
          </div>
        </div>
      </div>

      <div className="footer-bar">
        <div className="container">
          <div className="footer-bar-left">
            <p className="mono">&copy; 2025 Deadlock Inc.</p>
          </div>
          <div className="footer-bar-right">
            <p className="mono">Developed By BLANK</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
