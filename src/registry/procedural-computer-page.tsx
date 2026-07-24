"use client";

/**
 * Procedural Computer Page - a full-bleed WebGL2 raymarched homepage.
 *
 * The background renders three 3D signed-distance rings (analytic ellipse SDF,
 * Newton-refined) smooth-unioned with a mouse-tracked crosshair, drawn twice per
 * frame: a flat line pass and an embossed normal-shaded pass cross-faded by a
 * toggle. The rings tumble on a fixed 15 second loop; the pointer steers the
 * crosshair, the wheel adds decaying rotational velocity, dark mode inverts the
 * palette, and pressing B flips the flat lines into the lit emboss.
 *
 * Fills its container. Pure WebGL2, no dependencies.
 *
 * Shader and animation driver are a 1:1 port; copy is BLANK.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Shaders (verbatim WebGL2 GLSL 300 es)                               */
/* ------------------------------------------------------------------ */

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;
uniform float uInvert;
uniform float uMobile;
uniform float uScroll;
uniform float uEmboss;

out vec4 fragColor;

const bool SHOW_NORMALS = false;

float sdRect(vec2 p, vec2 size) {
    vec2 d = abs(p) - size;
    return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);
}

mat4 rotationMatrix(vec3 axis, float angle) {
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(
        oc*a.x*a.x + c,        oc*a.x*a.y - a.z*s,    oc*a.z*a.x + a.y*s,    0.0,
        oc*a.x*a.y + a.z*s,    oc*a.y*a.y + c,         oc*a.y*a.z - a.x*s,    0.0,
        oc*a.z*a.x - a.y*s,    oc*a.y*a.z + a.x*s,    oc*a.z*a.z + c,         0.0,
        0.0,                    0.0,                    0.0,                    1.0
    );
}

float sminVal(float a, float b, float k) {
    float kk = k * 6.0;
    float h = max(kk - abs(a - b), 0.0) / kk;
    float m = h * h * h * 0.5;
    float s = m * kk * (1.0 / 3.0);
    return (a < b) ? a - s : b - s;
}

float opOnion(float d, float h) { return abs(d) - h; }

float msign(float x) { return x < 0.0 ? -1.0 : 1.0; }

float sdEllipse2(vec2 p, vec2 e, inout int iterations) {
    float x  = p.x;
    float y  = p.y;
    float ax = abs(p.x);
    float ay = abs(p.y);
    float a  = e.x;
    float b  = e.y;
    float aa = e.x * e.x;
    float bb = e.y * e.y;

    vec2 closest = vec2(0.0);
    iterations = 0;

    if (a * b <= 1e-15) { closest = clamp(p, -e, e); return length(closest - p); }
    if (e.x <= 0.0 || e.y <= 0.0) { return length(p); }
    if (abs(a - b) < 0.0001) { iterations = 0; return length(p) - a; }

    float epsilon = 1e-3;
    float diff = bb - aa;

    if (a < b) {
        if (ax <= epsilon * a) {
            if (ay * b < diff) {
                float yc = bb * y / diff;
                float xc = a * sqrt(1.0 - yc * yc / bb);
                closest = vec2(xc, yc);
                return -length(closest - p);
            }
            closest = vec2(x, b * msign(y));
            return ay - b;
        } else if (ay <= epsilon * b) {
            closest = vec2(a * msign(x), y);
            return ax - a;
        }
    } else {
        if (ay <= epsilon * b) {
            if (ax * a < -diff) {
                float xc = aa * x / -diff;
                float yc = b * sqrt(1.0 - xc * xc / aa);
                closest = vec2(xc, yc);
                return -length(closest - p);
            }
            closest = vec2(a * msign(x), y);
            return ax - a;
        } else if (ax <= epsilon * a) {
            closest = vec2(x, b * msign(y));
            return ay - b;
        }
    }

    float rx = x / a;
    float ry = y / b;
    float inside = rx * rx + ry * ry - 1.0;
    float s2   = sqrt(2.0);
    float tmin = max(a * ax - aa, b * ay - bb);
    float tmax = max(s2 * a * ax - aa, s2 * b * ay - bb);
    float xx   = x * x * aa;
    float yy   = y * y * bb;
    float rxx  = rx * rx;
    float ryy  = ry * ry;
    float t;

    if (inside < 0.0) {
        tmax = min(tmax, 0.0);
        if (ryy < 1.0) tmin = max(tmin, sqrt(xx / (1.0 - ryy)) - aa);
        if (rxx < 1.0) tmin = max(tmin, sqrt(yy / (1.0 - rxx)) - bb);
        t = tmin * 0.95;
    } else {
        tmin = max(tmin, 0.0);
        if (ryy < 1.0) tmax = min(tmax, sqrt(xx / (1.0 - ryy)) - aa);
        if (rxx < 1.0) tmax = min(tmax, sqrt(yy / (1.0 - rxx)) - bb);
        t = tmin;
    }
    t = clamp(t, tmin, tmax);

    int newton_steps = 12;
    if (tmin >= tmax) { t = tmin; newton_steps = 0; }

    int i = 0;
    for (i = 0; i < newton_steps; i++) {
        float at   = aa + t;
        float bt   = bb + t;
        float abt  = at * bt;
        float xxbt = xx * bt;
        float yyat = yy * at;
        float f0   = xxbt * bt + yyat * at - abt * abt;
        float f1   = 2.0 * (xxbt + yyat - abt * (bt + at));
        if      (f0 < 0.0) tmax = t;
        else if (f0 > 0.0) tmin = t;
        float newton = f0 / abs(f1);
        newton = clamp(newton, tmin - t, tmax - t);
        newton = min(newton, a * b * 2.0);
        t += newton;
        if (abs(newton) < 1e-6 * (abs(t) + 0.1) || tmin >= tmax) break;
    }
    iterations = i;

    closest  = vec2(x * a / (aa + t), y * b / (bb + t));
    closest  = normalize(closest);
    closest *= e;
    return length(closest - p) * msign(inside);
}

float sdRing3D(vec2 p, mat4 Rmat, float ringR, float thickness) {
    vec2  u  = (Rmat * vec4(ringR, 0.0, 0.0, 0.0)).xy;
    vec2  v  = (Rmat * vec4(0.0, ringR, 0.0, 0.0)).xy;
    float uu = dot(u, u);
    float vv = dot(v, v);
    float uv = dot(u, v);
    float theta = 0.5 * atan(2.0 * uv, uu - vv + 1e-6);
    float ct  = cos(theta);
    float st  = sin(theta);
    vec2  ax1 = u * ct + v * st;
    vec2  ax2 = -u * st + v * ct;
    float s1  = length(ax1);
    float s2  = length(ax2);
    vec2  dir  = ax1 / max(s1, 1e-6);
    vec2  perp = vec2(-dir.y, dir.x);
    vec2  pLocal = vec2(dot(p, dir), dot(p, perp));
    int iter = 0;
    return opOnion(sdEllipse2(pLocal, vec2(max(s1, 1e-4), max(s2, 1e-4)), iter), thickness);
}

float sceneSD(vec2 p, vec2 m, mat4 R, mat4 Rb, mat4 Rc, float b, float mobile, float ringT, float hairW) {
    float sd = sdRing3D(p, R, 0.75, ringT);
    sd = sminVal(sd, sdRing3D(p, Rb, 0.75, ringT), b);
    sd = sminVal(sd, sdRing3D(p, Rc, 0.75, ringT), b);
    if (mobile < 0.5) {
        sd = sminVal(sd, sdRect(p - vec2(0.0, m.y), vec2(2.0, hairW)), b);
        sd = sminVal(sd, sdRect(p - vec2(m.x, 0.0), vec2(hairW, 1.0)), b);
    }
    return sd;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 res = iResolution;
    vec2 p   = (2.0 * fragCoord - res) / res.y;
    vec2 m   = (2.0 * iMouse    - res) / res.y;

    float b = 0.020;

    const float DURATION = 15.0;
    const float TAU      = 6.2831853;
    float playhead = fract(iTime / DURATION);
    float loopAng  = playhead * TAU;

    mat4 R  = rotationMatrix(normalize(vec3( 1.0,  0.7,  0.3)), loopAng * 1.0 + uScroll);
    mat4 Rb = rotationMatrix(normalize(vec3( 0.3,  1.0, -0.5)), loopAng * 2.0 + uScroll * 0.6);
    mat4 Rc = rotationMatrix(normalize(vec3(-0.5,  0.4,  1.0)), loopAng * 3.0 + uScroll * 1.5);

    float eps = 0.0025;

    // Emboss path: thin ring + wider crosshair, sampled at centre + 4 neighbours for normals
    float v0  = sceneSD(p,                  m, R, Rb, Rc, b, uMobile, 0.0015, 0.005);
    float v1  = sceneSD(p - vec2(eps, 0.0), m, R, Rb, Rc, b, uMobile, 0.0015, 0.005);
    float v2  = sceneSD(p + vec2(eps, 0.0), m, R, Rb, Rc, b, uMobile, 0.0015, 0.005);
    float v3  = sceneSD(p - vec2(0.0, eps), m, R, Rb, Rc, b, uMobile, 0.0015, 0.005);
    float v4  = sceneSD(p + vec2(0.0, eps), m, R, Rb, Rc, b, uMobile, 0.0015, 0.005);
    // Flat path: original ring + crosshair dimensions
    float v0f = sceneSD(p,                  m, R, Rb, Rc, b, uMobile, 0.005,  0.0025);

    float str  = 0.015;
    float hXp  = 1.0 - smoothstep(0.0, str, v1);
    float hXm  = 1.0 - smoothstep(0.0, str, v2);
    float hYp  = 1.0 - smoothstep(0.0, str, v3);
    float hYm  = 1.0 - smoothstep(0.0, str, v4);
    float pp   = smoothstep(0.0, str, v0);

    vec3  n        = normalize(vec3((hXp - hXm) * uEmboss, (hYp - hYm) * uEmboss, 1.0 - 0.99));
    vec3  lightDir = normalize(vec3(-0.5, -0.8, 0.6));
    float nDotL    = dot(n, lightDir);

    if (SHOW_NORMALS) { fragColor = vec4(0.5 + 0.5 * n, 1.0); return; }

    vec3 bgCol   = mix(vec3(0.768), vec3(0.1),   uInvert);
    vec3 lineCol = mix(vec3(0.1),   vec3(0.768), uInvert);

    vec3  lineColOverlay = mix(lineCol, mix(lineCol, vec3(0.3), uInvert), uEmboss);
    float aa       = max(fwidth(v0f), 1e-4);
    float lineFlat = 1.0 - smoothstep(-aa, aa, v0f);
    vec3  colFlat  = mix(bgCol, lineColOverlay, lineFlat);

    float shade    = clamp(0.5 + nDotL * 0.5, 0.0, 1.0);
    vec3  colEmboss = mix(bgCol, bgCol * (shade + 0.3), pp);

    vec3 col = mix(colFlat, colEmboss, uEmboss * 0.9);
    fragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* WebGL2 helpers (verbatim)                                           */
/* ------------------------------------------------------------------ */

const isMobileDevice = () =>
  typeof navigator !== "undefined" &&
  /mobile|tablet|ip(ad|hone|od)|android|silk|crios/i.test(navigator.userAgent);

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${log}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

/* ------------------------------------------------------------------ */
/* Shader background - WebGL2 driver (1:1 with the source RAF loop)    */
/* ------------------------------------------------------------------ */

function ShaderBackground({
  invertRef,
}: {
  invertRef: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) {
      console.warn("ShaderBackground: WebGL2 not available");
      return;
    }

    const program = linkProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is a WebGL2 call, not a React hook
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uMouse = gl.getUniformLocation(program, "iMouse");
    const uInvert = gl.getUniformLocation(program, "uInvert");
    const uMobile = gl.getUniformLocation(program, "uMobile");
    const uScroll = gl.getUniformLocation(program, "uScroll");
    const uEmboss = gl.getUniformLocation(program, "uEmboss");

    const mobile = isMobileDevice();
    gl.uniform1f(uMobile, mobile ? 1 : 0);

    const mouse = {
      targetX: -1e6,
      targetY: -1e6,
      x: -1e6,
      y: -1e6,
      initialized: false,
    };
    const press = { target: 0, current: 0 };
    const invert = {
      target: invertRef.current ?? 0,
      current: invertRef.current ?? 0,
    };
    const emboss = { target: 0, current: 0 };

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = Math.floor(canvas.clientWidth * dpr());
      const h = Math.floor(canvas.clientHeight * dpr());
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // Mouse in container-relative pixels, y flipped to match gl_FragCoord.
    const setPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      mouse.targetX = x * dpr();
      mouse.targetY = (rect.height - y) * dpr();
      if (!mouse.initialized) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
        mouse.initialized = true;
      }
    };

    const onMouseMove = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (t) setPointer(t.clientX, t.clientY);
    };
    const onDown = () => {
      press.target = 1;
    };
    const onUp = () => {
      press.target = 0;
    };
    const onTouchStart = (e: TouchEvent) => {
      onTouch(e);
      onDown();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "b" || e.key === "B") {
        emboss.target = emboss.target > 0.5 ? 0 : 1;
      }
    };

    const scroll = { vel: 0, offset: 0 };
    const onWheel = (e: WheelEvent) => {
      scroll.vel += 0.002 * e.deltaY;
      if (scroll.vel > 8) scroll.vel = 8;
      if (scroll.vel < -8) scroll.vel = -8;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    if (mobile) {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onUp, { passive: true });
      window.addEventListener("touchcancel", onUp, { passive: true });
    }

    const start = performance.now();
    let last = start;
    let raf = 0;
    let stopped = false;

    const frame = () => {
      if (stopped) return;
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;

      invert.target = invertRef.current ?? 0;
      const invertK = 1 - Math.exp(-dt / 0.1);
      invert.current += (invert.target - invert.current) * invertK;

      const mouseK = 1 - Math.exp(-dt / 0.12);
      mouse.x += (mouse.targetX - mouse.x) * mouseK;
      mouse.y += (mouse.targetY - mouse.y) * mouseK;

      const scrollK = 1 - Math.exp(-dt / 0.6);
      scroll.vel *= 1 - scrollK;
      scroll.offset += scroll.vel * dt;

      const embossK = 1 - Math.exp(-dt / 0.35);
      emboss.current += (emboss.target - emboss.current) * embossK;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uInvert, invert.current);
      gl.uniform1f(uScroll, scroll.offset);
      gl.uniform1f(uEmboss, emboss.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (mobile) {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchend", onUp);
        window.removeEventListener("touchcancel", onUp);
      }
      gl.deleteBuffer(buffer);
      if (vao) gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [invertRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Content (BLANK)                                                     */
/* ------------------------------------------------------------------ */

export interface ProceduralComputerPageLink {
  label: string;
  href: string;
}

export interface ProceduralComputerPageProps {
  /** Fixed top-left wordmark. */
  wordmark?: string;
  /** Intro paragraph rendered in the blurred card. */
  intro?: string;
  /** Email opened by the Contact button and the C shortcut. */
  contactEmail?: string;
  /** Bottom-right social links. */
  links?: ProceduralComputerPageLink[];
  /** Start in dark (inverted) mode. */
  defaultDark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_LINKS: ProceduralComputerPageLink[] = [
  { label: "Linkedin", href: "https://ui.aryank.space" },
  { label: "Instagram", href: "https://ui.aryank.space" },
  { label: "GitHub", href: "https://ui.aryank.space" },
];

// Palette copied 1:1 from the source (light default, dark = inverted greys).
const LIGHT_VARS = {
  "--fg": "#000",
  "--bg": "#c1c1c1",
  "--fg-40": "#0006",
  "--button-bg": "#fff6",
} as React.CSSProperties;

const DARK_VARS = {
  "--fg": "#e5e5e5",
  "--bg": "#171717",
  "--fg-40": "#e5e5e566",
  "--button-bg": "#23232366",
} as React.CSSProperties;

const KBD_CLASS =
  "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-[3px] bg-[var(--fg-40)] text-[10px] font-light uppercase leading-none tracking-wider text-[var(--fg)] transition-colors duration-300 ease-out";

export default function ProceduralComputerPage({
  wordmark = "BLANK",
  intro = "Art and technology studio focused on prototyping and emerging design. We create digital experiences, tools, and artworks. We turn ideas into systems.",
  contactEmail = "hello@aryank.space",
  links = DEFAULT_LINKS,
  defaultDark = false,
  className,
  style,
}: ProceduralComputerPageProps) {
  const [dark, setDark] = useState(defaultDark);
  const invertRef = useRef(defaultDark ? 1 : 0);
  invertRef.current = dark ? 1 : 0;

  const contact = () => {
    window.location.href = `mailto:${contactEmail}`;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "t") setDark((d) => !d);
      else if (k === "c") contact();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactEmail]);

  return (
    <div
      className={`relative isolate h-full w-full overflow-hidden bg-[var(--bg)] antialiased${
        className ? ` ${className}` : ""
      }`}
      style={{ ...(dark ? DARK_VARS : LIGHT_VARS), ...style }}
    >
      <ShaderBackground invertRef={invertRef} />

      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle dark mode"
        aria-keyshortcuts="T"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-[var(--button-bg)] p-2 backdrop-blur-md transition-[transform,color,background-color] duration-300 ease-out active:scale-[0.96]"
      >
        <span className="block h-3 w-3 rounded-full bg-[var(--fg)] transition-colors duration-300 ease-out" />
        <kbd className={KBD_CLASS}>T</kbd>
      </button>

      <div className="relative min-h-full">
        <div className="fixed top-6 left-6 right-6 flex flex-col text-2xl font-light leading-none text-[var(--fg)] transition-colors duration-300 ease-out sm:right-auto">
          <h1>{wordmark}</h1>
        </div>

        <div className="fixed top-32 left-6 right-6 flex flex-col items-start gap-6 sm:right-auto">
          <p className="max-w-full rounded-md bg-[var(--button-bg)] p-4 text-sm font-light leading-snug text-[var(--fg)] backdrop-blur-md transition-colors duration-300 ease-out sm:max-w-xs">
            {intro}
          </p>
          <div className="flex w-full items-start gap-2">
            <button
              type="button"
              onClick={contact}
              aria-label={`Contact us at ${contactEmail}`}
              aria-keyshortcuts="C"
              className="flex items-center gap-2 rounded-md bg-[var(--button-bg)] p-2 text-sm font-light leading-snug text-[var(--fg)] backdrop-blur-md transition-colors duration-300 ease-out"
            >
              <span>Contact</span>
              <kbd className={KBD_CLASS}>C</kbd>
            </button>
          </div>
        </div>

        <nav className="fixed bottom-4 right-4 flex flex-col items-end text-sm font-light leading-none text-[var(--fg)] transition-colors duration-300 ease-out">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="py-0.5 transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
