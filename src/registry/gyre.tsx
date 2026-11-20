"use client";

/**
 * Gyre: your words in extruded iridescent foil, going round and round their
 * frame ring behind ring and fading into the ground. Resize the box and the
 * rings and letters follow it live.
 *
 * Mechanism. Each letter is extruded once from the font outline into a mesh
 * and drawn instanced. A per-instance `aSig` (arc position, ring index, scale)
 * is all the CPU sends: the vertex shader walks a rounded rectangle to that
 * arc position, bends the letter along the path's tangent, and pushes ring k
 * back to depth d0 * q^k, so every ring is the same rectangle seen further
 * away and the rings shrink geometrically into the fog. One scroll offset
 * advances per frame. The fragment shader colours the faces from a seven stop
 * foil ramp keyed to the angle round the frame, the view angle (thin film),
 * the position across the letter and a slow drift, then adds two glints and a
 * horizon band. Bloom, sRGB output and a film grain pass finish the frame.
 *
 * Layout. The letter size is a fraction of the short side of the box. From
 * it the engine picks how many copies of the phrase fit one lap so they close
 * the loop exactly, and keeps that count until a resize makes another count
 * fit clearly better (with hysteresis), then eases the phrase count over.
 *
 * Every shader, constant and spring is the source's. `onReady` hands back
 * the engine, including `debug` for deterministic frames.
 */

import { type Font, parse } from "opentype.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Unbounded Black (SIL OFL), the face the rings are cut from. */
export const GYRE_FONT_URL =
  "https://ui.aryank.space/assets/gyre/Unbounded-900.woff";

export type GyreAppearance = "auto" | "light" | "dark";

/** Every control. Colours with a `Dark` twin switch with the appearance. */
export const GYRE_DEFAULTS = {
  text: "SAY IT LOUDER",
  sep: "•",
  tracking: 0.04,
  wordGap: 0.42,
  size: 0.115,
  extrude: 0.5,
  bevel: 0.045,
  margin: 18,
  corner: 0.6,
  turnGap: 0.55,
  turns: 8,
  fogStart: 0.7,
  fogEnd: 3.8,
  speed: 0.6,
  push: 1.2,
  fov: 52,
  parallax: 0.5,
  resizeLag: 0,
  c1: "#6f9fc8",
  c1Dark: "#9cc6e0",
  c2: "#4677a8",
  c2Dark: "#689fc5",
  c3: "#6f9e88",
  c3Dark: "#a7c6b6",
  c4: "#a8964f",
  c4Dark: "#c8bf88",
  c5: "#bf8455",
  c5Dark: "#d5ac81",
  c6: "#a76789",
  c6Dark: "#c692ab",
  c7: "#5e5fa3",
  c7Dark: "#8689bd",
  sat: 1.7,
  spread: 0.9,
  letterHue: 0.32,
  film: 0.75,
  drift: 0.03,
  sideShade: 0.66,
  sideShift: 0.3,
  pale: 0.12,
  gloss: 0.7,
  glint: 1.6,
  glintColor: "#ffffff",
  glintColorDark: "#ffffff",
  glow: 0.4,
  grain: 0.055,
  // Dark by default: black ground and full glow. "auto" follows the page.
  appearance: "dark" as GyreAppearance,
  ground: "#ecebe7",
  groundDark: "#020203",
};

export type GyreValues = typeof GYRE_DEFAULTS;

const RAMP_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"] as const;
type TwinKey = (typeof RAMP_KEYS)[number] | "glintColor" | "ground";

/** "auto" follows the page: data-theme, color-scheme, a .dark class, then the OS. */
export function gyrePageIsDark(appearance: GyreAppearance) {
  if (appearance === "dark") return true;
  if (appearance === "light") return false;
  const root = document.documentElement;
  const theme = root.dataset.theme;
  if (theme === "dark" || theme === "light") return theme === "dark";
  const scheme = String(getComputedStyle(root).colorScheme || "").trim();
  if (scheme === "dark" || scheme === "light") return scheme === "dark";
  return (
    root.classList.contains("dark") ||
    matchMedia("(prefers-color-scheme: dark)").matches
  );
}

const fonts = new Map<string, Promise<Font>>();

function loadFont(url: string) {
  const hit = fonts.get(url);
  if (hit) return hit;
  const font = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((b) => parse(b));
  fonts.set(url, font);
  font.catch(() => fonts.delete(url));
  return font;
}

const VERT = `
attribute vec3 aSig;
uniform float uA, uB, uR, uP, uD0, uLnQ;
varying vec3 vN;
varying vec3 vV;
varying float vU;
varying vec2 vQ;
varying float vS;
varying float vLy;

vec2 pathAt(float s, out vec2 T) {
  float a = uA - uR, b = uB - uR;
  float L1 = 2.0 * a, Lc = 1.5707963 * uR, L3 = 2.0 * b;
  float th;
  if (s < L1) { T = vec2(1.0, 0.0); return vec2(-a + s, uB); }
  s -= L1;
  if (s < Lc) { th = 1.5707963 - s / uR; T = vec2(sin(th), -cos(th)); return vec2(a, b) + uR * vec2(cos(th), sin(th)); }
  s -= Lc;
  if (s < L3) { T = vec2(0.0, -1.0); return vec2(uA, b - s); }
  s -= L3;
  if (s < Lc) { th = -s / uR; T = vec2(sin(th), -cos(th)); return vec2(a, -b) + uR * vec2(cos(th), sin(th)); }
  s -= Lc;
  if (s < L1) { T = vec2(-1.0, 0.0); return vec2(a - s, -uB); }
  s -= L1;
  if (s < Lc) { th = -1.5707963 - s / uR; T = vec2(sin(th), -cos(th)); return vec2(-a, -b) + uR * vec2(cos(th), sin(th)); }
  s -= Lc;
  if (s < L3) { T = vec2(0.0, 1.0); return vec2(-uA, -b + s); }
  s -= L3;
  th = 3.14159265 - s / uR; T = vec2(sin(th), -cos(th)); return vec2(-a, b) + uR * vec2(cos(th), sin(th));
}

void main() {
  vec3 p = position * aSig.z;
  float sig = aSig.x + p.x;
  vec2 T;
  vec2 P0 = pathAt(mod(sig + uA - uR, uP), T);
  vec2 N = vec2(-T.y, T.x);
  vec2 Q = P0 + N * p.y;
  float d = uD0 * exp(-uLnQ * aSig.y);
  vec3 wp = vec3(Q, -d + p.z);
  vec3 n = vec3(T * normal.x + N * normal.y, normal.z);
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mv;
  vN = normalize(mat3(viewMatrix) * n);
  vV = -mv.xyz;
  vU = aSig.y;
  vQ = Q / vec2(uA, uB);
  vS = aSig.y;
  vLy = p.y;
}
`;

const FRAG = `
uniform vec3 uRamp[7];
uniform float uSpread, uFilm, uDrift, uTime, uSideShade, uSideShift, uPale;
uniform float uGloss, uGlint, uFogStart, uFogEnd;
uniform vec3 uGlintColor, uGround;
varying vec3 vN;
varying vec3 vV;
varying float vU;
varying vec2 vQ;
varying float vS;
varying float vLy;
uniform float uLetterHue;
uniform float uSat;

vec3 ramp(float x) {
  x = fract(x) * 7.0;
  float i = floor(x);
  float f = x - i;
  f = f * f * (3.0 - 2.0 * f);
  int a = int(i);
  int b = int(mod(i + 1.0, 7.0));
  return mix(uRamp[a], uRamp[b], f);
}

void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vV);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float side = 1.0 - smoothstep(0.35, 0.82, N.z);
  float ang = atan(vQ.y, vQ.x) / 6.2831853;
  float ph = ang * uSpread + (1.0 - ndv) * uFilm + vS * 0.13 + vLy * uLetterHue + uTime * uDrift + dot(N.xy, vec2(0.21, 0.34));
  vec3 face = ramp(ph);
  face = mix(face, vec3(1.0), uPale * ndv * ndv);
  vec3 sideC = ramp(ph + uSideShift) * uSideShade;
  vec3 col = mix(face, sideC, side);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(mix(vec3(luma), col, uSat), 0.0);
  vec3 R = reflect(-V, N);
  float sky = smoothstep(-0.7, 0.9, R.y);
  col *= 0.66 + 0.36 * sky;
  float band = exp(-pow((R.y - 0.38) / 0.11, 2.0)) * smoothstep(-0.2, 0.7, R.z);
  col += uGlintColor * band * uGloss * 0.16;
  vec3 L = normalize(vec3(-0.45, 0.62, 0.64));
  float spec = pow(max(dot(N, normalize(L + V)), 0.0), 80.0);
  vec3 L2 = normalize(vec3(0.55, -0.4, 0.73));
  float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 140.0);
  col += uGlintColor * (spec + 0.45 * spec2) * uGlint;
  float fog = 1.0 - smoothstep(-uFogEnd, -uFogStart, vU);
  col = mix(col, uGround, fog);
  gl_FragColor = vec4(col, 1.0);
}
`;

const GRAIN = {
  uniforms: {
    tDiffuse: { value: null },
    uAmt: { value: 0.05 },
    uSeed: { value: 0 },
  },
  vertexShader:
    "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmt; uniform float uSeed; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423) + uSeed); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float n = hash(gl_FragCoord.xy) - 0.5; c.rgb += n * uAmt; gl_FragColor = c; }`,
};

type Spring = { x: number; v: number };

/** Critically damped spring step towards `to` at rate `k` over `dt` seconds. */
function spring(s: Spring, to: number, k: number, dt: number) {
  const x0 = s.x - to;
  const decay = Math.exp(-k * dt);
  const x = (x0 + (s.v + k * x0) * dt) * decay;
  s.v = (s.v - k * (s.v + k * x0) * dt) * decay;
  s.x = to + x;
}

type Batch = {
  mesh: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>;
  buf: THREE.InstancedBufferAttribute;
  cap: number;
};

type Letter = {
  ch: string;
  glyph: ReturnType<Font["charToGlyph"]>;
  adv: number;
  hi: Batch | null;
  lo: Batch | null;
  list: number[];
  listLo: number[];
};

type Placed = { g: Letter; x: number; word: boolean };

export type GyreStats = {
  letters: number;
  tris: number;
  q: number;
  P: number;
  A: number;
  B: number;
  px: number;
  fit: number;
  top: number;
  perRing: number;
  ne: number;
  grow: number;
  phrase: number;
};

export type GyreHandle = {
  canvas: HTMLCanvasElement;
  readonly values: GyreValues;
  set(values: Partial<GyreValues>): void;
  setZoom(zoom: number): void;
  stats(): GyreStats;
  debug: {
    freeze(): void;
    thaw(): void;
    step(dt?: number): void;
    settle(): void;
    setTime(t: number): void;
    fresh(): void;
    run(seconds?: number): void;
    hand(x: number, y: number): void;
    wheel(deltaY: number): void;
    readonly boost: number;
  };
  dispose(): void;
};

/**
 * Mount the engine into `host`, which it fills. The canvas follows the host's
 * size through a ResizeObserver and pauses while off screen or hidden.
 */
export async function createGyre(
  host: HTMLElement,
  initial: Partial<GyreValues> = {},
  opts: { font?: string } = {},
): Promise<GyreHandle> {
  const b: GyreValues = { ...GYRE_DEFAULTS, ...initial };
  const font = await loadFont(opts.font || GYRE_FONT_URL);
  // Cap height becomes 1 unit.
  const unit =
    1 /
    ((font.tables.os2?.sCapHeight as number | undefined) ||
      font.charToGlyph("H").getBoundingBox().y2);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.cssText =
    "display:block;width:100%;height:100%;touch-action:pan-y";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(b.fov, 1, 0.1, 1e3);
  const target = new THREE.WebGLRenderTarget(4, 4, {
    type: THREE.HalfFloatType,
    samples: 4,
  });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), 0.5, 0.35, 1);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grain = new ShaderPass(GRAIN);
  composer.addPass(grain);

  const uniforms = {
    uA: { value: 4 },
    uB: { value: 3 },
    uR: { value: 0.6 },
    uP: { value: 20 },
    uD0: { value: 10 },
    uLnQ: { value: 0.4 },
    uRamp: { value: Array.from({ length: 7 }, () => new THREE.Color()) },
    uSpread: { value: 1 },
    uLetterHue: { value: 0.3 },
    uSat: { value: 1.6 },
    uFilm: { value: 0.7 },
    uDrift: { value: 0.03 },
    uTime: { value: 0 },
    uSideShade: { value: 0.66 },
    uSideShift: { value: 0.3 },
    uPale: { value: 0.3 },
    uGloss: { value: 0.7 },
    uGlint: { value: 1.6 },
    uFogStart: { value: 1.6 },
    uFogEnd: { value: 6.5 },
    uGlintColor: { value: new THREE.Color() },
    uGround: { value: new THREE.Color() },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
  });

  const letters = new Map<string, Letter>();
  let shapeKey = "";

  // Font outline to extruded mesh. `hi` is the near-ring cut: rounder curves,
  // a three-step bevel and tessellated faces so the path bend stays smooth.
  function extrude(glyph: Letter["glyph"], hi: boolean) {
    const path = new THREE.ShapePath();
    for (const c of glyph.path.commands) {
      if (c.type === "M") path.moveTo(c.x * unit, c.y * unit);
      else if (c.type === "L") path.lineTo(c.x * unit, c.y * unit);
      else if (c.type === "Q")
        path.quadraticCurveTo(c.x1 * unit, c.y1 * unit, c.x * unit, c.y * unit);
      else if (c.type === "C")
        path.bezierCurveTo(
          c.x1 * unit,
          c.y1 * unit,
          c.x2 * unit,
          c.y2 * unit,
          c.x * unit,
          c.y * unit,
        );
    }
    // The largest subpath is an outer contour; its winding says which way
    // solids run in this font.
    let largest = 0;
    let ccw = false;
    for (const sub of path.subPaths) {
      const area = THREE.ShapeUtils.area(sub.getPoints());
      if (Math.abs(area) > largest) {
        largest = Math.abs(area);
        ccw = area > 0;
      }
    }
    // three r184 and older take the winding flag; r185+ detects it and
    // ignores the argument. Passing it keeps both versions identical.
    const toShapes: (this: THREE.ShapePath, isCCW?: boolean) => THREE.Shape[] =
      path.toShapes;
    const shapes = toShapes.call(path, ccw);
    if (!shapes.length) return null;
    const bevel = b.bevel;
    let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shapes, {
      depth: Math.max(0.01, b.extrude - 2 * bevel),
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: 0.85 * bevel,
      bevelOffset: -(0.85 * bevel),
      bevelSegments: hi ? 3 : 1,
      curveSegments: hi ? 7 : 3,
    });
    geo.deleteAttribute("uv");
    geo.computeBoundingBox();
    geo.translate(0, 0, -(geo.boundingBox as THREE.Box3).max.z);
    if (hi) geo = new TessellateModifier(0.14, 8).modify(geo);
    geo = toCreasedNormals(geo, (48 * Math.PI) / 180);
    geo.computeBoundingBox();
    return geo;
  }

  function batch(geo: THREE.BufferGeometry, cap: number): Batch {
    const ig = new THREE.InstancedBufferGeometry();
    ig.index = null;
    ig.setAttribute("position", geo.getAttribute("position"));
    ig.setAttribute("normal", geo.getAttribute("normal"));
    const buf = new THREE.InstancedBufferAttribute(
      new Float32Array(3 * cap),
      3,
    );
    buf.setUsage(THREE.DynamicDrawUsage);
    ig.setAttribute("aSig", buf);
    ig.instanceCount = 0;
    const mesh = new THREE.Mesh(ig, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { mesh, buf, cap };
  }

  function clearLetters() {
    for (const l of letters.values())
      for (const k of ["hi", "lo"] as const) {
        const bt = l[k];
        if (bt) {
          scene.remove(bt.mesh);
          bt.mesh.geometry.dispose();
        }
      }
    letters.clear();
  }

  function letter(ch: string) {
    const hit = letters.get(ch);
    if (hit) return hit;
    const glyph = font.charToGlyph(ch);
    const l: Letter = {
      ch,
      glyph,
      adv: (glyph.advanceWidth ?? 0) * unit,
      hi: null,
      lo: null,
      list: [],
      listLo: [],
    };
    if (ch.trim() && glyph.index !== 0) {
      const hiGeo = extrude(glyph, true);
      const loGeo = extrude(glyph, false);
      if (hiGeo && loGeo) {
        l.hi = batch(hiGeo, 64);
        l.lo = batch(loGeo, 64);
      }
    }
    letters.set(ch, l);
    return l;
  }

  let phrase: { items: Placed[]; len: number; top: number } = {
    items: [],
    len: 1,
    top: 1,
  };

  // Lay the phrase out once along a straight line, in cap-height units.
  function layoutPhrase() {
    const key = `${b.extrude}|${b.bevel}`;
    if (key !== shapeKey) {
      clearLetters();
      shapeKey = key;
    }
    const text = String(b.text || "")
      .toUpperCase()
      .trim()
      .replace(/\s+/g, " ");
    const sep = String(b.sep || "").trim();
    const chars = [...`${text || " "} ${sep ? `${sep} ` : ""}`];
    const items: Placed[] = [];
    let x = 0;
    chars.forEach((ch, i) => {
      if (ch === " ") {
        x += b.wordGap;
        if (items.length) items[items.length - 1].word = true;
        return;
      }
      const g = letter(ch);
      items.push({ g, x, word: false });
      const next = chars[(i + 1) % chars.length];
      let kern = 0;
      if (next && next !== " ")
        kern = font.getKerningValue(g.glyph, font.charToGlyph(next)) * unit;
      x += g.adv + kern + b.tracking;
    });
    let top = 1;
    for (const it of items)
      if (it.g.hi) top = Math.max(top, it.g.glyph.getBoundingBox().y2 * unit);
    phrase = { items, len: Math.max(0.5, x), top };
    ring.n = 0;
  }

  const size = { w: 0, h: 0 };
  const lagW: Spring = { x: 0, v: 0 };
  const lagH: Spring = { x: 0, v: 0 };
  let firstSize = true;
  const ring = {
    A: 4,
    B: 3,
    R: 0.6,
    P: 20,
    d0: 10,
    lnq: 0.4,
    px: 60,
    fit: 1,
    n: 0,
    ne: { x: 1, v: 0 } as Spring,
    grow: 1,
  };
  const still = { t: 1, w: 0, h: 0 };

  function applyLook() {
    const dark = gyrePageIsDark(b.appearance);
    const pick = (k: TwinKey) =>
      dark ? b[`${k}Dark` as `${TwinKey}Dark`] : b[k];
    RAMP_KEYS.forEach((k, i) => {
      uniforms.uRamp.value[i].setStyle(pick(k));
    });
    uniforms.uGlintColor.value.setStyle(pick("glintColor"));
    uniforms.uGround.value.setStyle(pick("ground"));
    scene.background = uniforms.uGround.value;
    uniforms.uSpread.value = b.spread;
    uniforms.uLetterHue.value = b.letterHue;
    uniforms.uSat.value = b.sat;
    uniforms.uFilm.value = b.film;
    uniforms.uDrift.value = b.drift;
    uniforms.uSideShade.value = b.sideShade;
    uniforms.uSideShift.value = b.sideShift;
    uniforms.uPale.value = b.pale * (dark ? 1 : 0.55);
    uniforms.uGloss.value = b.gloss;
    uniforms.uGlint.value = b.glint;
    uniforms.uFogStart.value = b.fogStart;
    uniforms.uFogEnd.value = Math.max(b.fogStart + 0.1, b.fogEnd);
    bloom.strength = b.glow * (dark ? 1 : 0.3);
    grain.uniforms.uAmt.value = b.grain * (dark ? 1 : 0.7);
    if (camera.fov !== b.fov) {
      camera.fov = b.fov;
      camera.updateProjectionMatrix();
    }
  }

  let zoom = 1;
  function resize() {
    const w = Math.max(2, host.clientWidth);
    const h = Math.max(2, host.clientHeight);
    size.w = w;
    size.h = h;
    const dpr = Math.min(2.5, (window.devicePixelRatio || 1) * zoom);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (firstSize && w > 40 && h > 40) {
      lagW.x = w;
      lagH.x = h;
      lagW.v = lagH.v = 0;
      firstSize = false;
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    wake();
  });
  resizeObserver.observe(host);

  const hand = {
    tx: 0,
    ty: 0,
    x: { x: 0, v: 0 } as Spring,
    y: { x: 0, v: 0 } as Spring,
  };
  let boost = 0;
  const onWheel = (e: { deltaY: number }) => {
    if (!b.push) return;
    boost = THREE.MathUtils.clamp(boost + 0.012 * e.deltaY * b.push, -40, 40);
    wake();
  };
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    hand.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    hand.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    wake();
  });
  canvas.addEventListener("pointerleave", () => {
    hand.tx = 0;
    hand.ty = 0;
    wake();
  });
  canvas.addEventListener("wheel", onWheel, { passive: true });

  let time = 0;
  let scroll = 0;
  let frozen = false;
  let raf = 0;
  let last = 0;
  let frame = 0;
  let onScreen = true;
  let alive = true;

  const intersection = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    wake();
  });
  intersection.observe(host);
  const onVisibility = () => wake();
  document.addEventListener("visibilitychange", onVisibility);
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    applyLook();
    wake();
  };
  scheme.addEventListener("change", onScheme);
  const themeObserver = new MutationObserver(onScheme);

  function tick(dt: number) {
    time += dt;
    if (b.resizeLag <= 0.01) {
      lagW.x = size.w;
      lagH.x = size.h;
      lagW.v = lagH.v = 0;
    } else {
      const k = 6 / b.resizeLag;
      spring(lagW, size.w, k, dt);
      spring(lagH, size.h, k, dt);
    }
    if (size.w !== still.w || size.h !== still.h) {
      still.t = 0;
      still.w = size.w;
      still.h = size.h;
    } else still.t += dt;
    // Easing the phrase count: keep the reading position steady on the
    // nearest copy while copies slide in or out.
    const before = ring.ne.x;
    spring(ring.ne, ring.n || ring.ne.x, 16, dt);
    const grew = (ring.ne.x - before) * phrase.len;
    if (grew) {
      const lap = Math.max(0.5, ring.ne.x * phrase.len);
      const at = scroll + Math.floor(ring.ne.x + 1e-4) * phrase.len * 0.5;
      scroll += ((((at % lap) + lap) % lap) / lap) * grew;
    }
    spring(hand.x, hand.tx, 5, dt);
    spring(hand.y, hand.ty, 5, dt);
    boost *= Math.exp(-2.2 * dt);
    scroll += (b.speed + boost) * dt;
  }

  // Fit the rounded rectangle to the box and choose phrase copies per lap.
  function fitRings() {
    const W = lagW.x;
    const H = lagH.x;
    const margin = b.margin;
    const top = phrase.top;
    const len = phrase.len;
    const rect = (scale: number) => {
      const A = Math.max(0.4, (W / 2 - margin) / scale - top);
      const B = Math.max(0.4, (H / 2 - margin) / scale - top);
      const R = Math.min(b.corner, A - 0.01, B - 0.01);
      return { A, B, R, P: 4 * A + 4 * B - 8 * R + 2 * Math.PI * R };
    };
    // Pixels per unit at which one lap measures `perimeter` units.
    const scaleFor = (perimeter: number) => {
      let s =
        (2 * (W + H) - 8 * margin) /
        (perimeter + 8 * top + (8 - 2 * Math.PI) * b.corner);
      for (let i = 0; i < 8; i++) {
        const P = rect(s).P;
        if (Math.abs(P - perimeter) < 1e-5 * perimeter) break;
        s *= P / perimeter;
      }
      return Math.max(2, s);
    };
    const want = Math.max(10, b.size * Math.min(W, H));
    const miss = (n: number) => Math.abs(Math.log(scaleFor(n * len) / want));
    const guess = Math.max(1, Math.round(rect(want).P / len));
    let best = guess;
    for (const n of [guess - 1, guess + 1])
      if (n >= 1 && miss(n) < miss(best)) best = n;
    const settled =
      still.t > 0.12 &&
      Math.abs(lagW.x - size.w) < 1 &&
      Math.abs(lagH.x - size.h) < 1;
    if (ring.n) {
      if (
        best !== ring.n &&
        miss(best) < miss(ring.n) - 0.1 &&
        (settled ? miss(ring.n) > 0.26 : miss(ring.n) > 0.75)
      )
        ring.n = best;
    } else {
      ring.n = best;
      ring.ne.x = best;
      ring.ne.v = 0;
    }
    const scale = scaleFor(ring.ne.x * len);
    ring.grow = scale / want;
    const { A, B, R, P } = rect(scale);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const fit = Math.max(
      0.05,
      Math.min(
        1,
        (size.w / 2 - margin) / ((A + top) * scale),
        (size.h / 2 - margin) / ((B + top) * scale),
      ),
    );
    const d0 = size.h / 2 / (scale * fit * tanHalf);
    const short = Math.min(A, B);
    const q = (short + 1 + b.turnGap) / short;
    Object.assign(ring, {
      A,
      B,
      R,
      P,
      d0,
      lnq: Math.log(q),
      px: scale * fit,
      fit,
    });
    uniforms.uA.value = A;
    uniforms.uB.value = B;
    uniforms.uR.value = Math.max(0.05, R);
    uniforms.uP.value = P;
    uniforms.uD0.value = d0;
    uniforms.uLnQ.value = Math.log(q);
    camera.near = 0.05 * d0;
    camera.far = d0 * Math.exp(Math.log(q) * (b.turns + 1)) * 1.5 + 10;
    camera.updateProjectionMatrix();
  }

  // One instance per letter per phrase copy per ring.
  function fillInstances() {
    for (const l of letters.values()) {
      l.list.length = 0;
      l.listLo.length = 0;
    }
    const lap = ring.P;
    const len = phrase.len;
    const items = phrase.items;
    const copies = Math.max(1, ring.ne.x);
    const whole = Math.floor(copies + 1e-4);
    const part = copies - whole;
    const rings = Math.min(Math.ceil(b.turns), Math.ceil(b.fogEnd + 0.5));
    for (let r = 0; r >= -rings; r--) {
      const start = scroll + r * len * 0.382;
      for (let c = 0; c <= whole; c++) {
        const s = c < whole ? 1 : part;
        if (s < 0.002) continue;
        for (const it of items) {
          if (!it.g.hi) continue;
          const at = (((start + c * len + it.x * s) % lap) + lap) % lap;
          (r > -2.2 ? it.g.list : it.g.listLo).push(at, r, s);
        }
      }
    }
    for (const l of letters.values()) {
      if (!l.hi) continue;
      for (const [k, list] of [
        ["hi", l.list],
        ["lo", l.listLo],
      ] as const) {
        const bt = l[k] as Batch;
        if (list.length / 3 > bt.cap) {
          const geo = bt.mesh.geometry;
          const cap = Math.ceil((list.length / 3) * 1.5);
          const buf = new THREE.InstancedBufferAttribute(
            new Float32Array(3 * cap),
            3,
          );
          buf.setUsage(THREE.DynamicDrawUsage);
          geo.setAttribute("aSig", buf);
          bt.buf = buf;
          bt.cap = cap;
        }
        bt.buf.array.set(list);
        bt.buf.needsUpdate = true;
        bt.mesh.geometry.instanceCount = list.length / 3;
      }
    }
  }

  function draw() {
    if (host.clientWidth !== size.w || host.clientHeight !== size.h) resize();
    if (b.resizeLag <= 0.01) {
      lagW.x = size.w;
      lagH.x = size.h;
      lagW.v = lagH.v = 0;
    }
    fitRings();
    uniforms.uTime.value = time;
    // Parallax: move the eye and shear the frustum so the front ring stays
    // pinned to the box while the deeper rings slide.
    const reach = 1.6 * b.parallax;
    const ex = hand.x.x * reach;
    const ey = hand.y.x * reach * 0.8;
    camera.position.set(ex, ey, 0);
    camera.quaternion.identity();
    camera.updateMatrixWorld();
    const near = camera.near;
    const far = camera.far;
    const d0 = ring.d0;
    const halfH = d0 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const halfW = halfH * (size.w / size.h);
    camera.projectionMatrix.makePerspective(
      ((-halfW - ex) * near) / d0,
      ((halfW - ex) * near) / d0,
      ((halfH - ey) * near) / d0,
      ((-halfH - ey) * near) / d0,
      near,
      far,
    );
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    fillInstances();
    grain.uniforms.uSeed.value = (frame++ % 64) * 0.137;
    composer.render();
  }

  function loop(now: number) {
    raf = 0;
    if (!alive) return;
    const dt = last ? Math.min(1 / 30, (now - last) / 1e3) : 1 / 60;
    last = now;
    if (!frozen) tick(dt);
    draw();
    if (frozen || !onScreen || document.hidden) last = 0;
    else raf = requestAnimationFrame(loop);
  }

  function wake() {
    if (!raf && alive) raf = requestAnimationFrame(loop);
  }

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class", "style"],
  });
  layoutPhrase();
  applyLook();
  resize();
  scroll = 0.37 * phrase.len;
  wake();

  return {
    canvas,
    get values() {
      return { ...b };
    },
    set(next) {
      const prev = { ...b };
      Object.assign(b, next);
      if (
        (
          ["text", "sep", "tracking", "wordGap", "extrude", "bevel"] as const
        ).some((k) => prev[k] !== b[k])
      )
        layoutPhrase();
      applyLook();
      wake();
    },
    setZoom(z) {
      zoom = z;
      resize();
      wake();
    },
    stats() {
      let tris = 0;
      let count = 0;
      for (const l of letters.values())
        for (const k of ["hi", "lo"] as const) {
          const bt = l[k];
          if (!bt) continue;
          const n = bt.mesh.geometry.instanceCount;
          count += n;
          tris += (n * bt.mesh.geometry.getAttribute("position").count) / 3;
        }
      return {
        letters: count,
        tris: Math.round(tris),
        q: Math.exp(ring.lnq),
        P: ring.P,
        A: ring.A,
        B: ring.B,
        px: ring.px,
        fit: ring.fit,
        top: phrase.top,
        perRing: ring.n,
        ne: ring.ne.x,
        grow: ring.grow,
        phrase: phrase.len,
      };
    },
    debug: {
      freeze() {
        frozen = true;
      },
      thaw() {
        frozen = false;
        last = 0;
        wake();
      },
      step(dt = 1 / 60) {
        tick(dt);
        draw();
      },
      settle() {
        lagW.x = size.w;
        lagH.x = size.h;
        lagW.v = lagH.v = 0;
        still.t = 1;
        still.w = size.w;
        still.h = size.h;
        draw();
        ring.ne.x = ring.n;
        ring.ne.v = 0;
        draw();
      },
      setTime(t) {
        time = t;
        scroll = 0.37 * phrase.len + b.speed * t;
        frame = 0;
        draw();
      },
      fresh() {
        ring.n = 0;
        still.t = 1;
        still.w = size.w;
        still.h = size.h;
        lagW.x = size.w;
        lagH.x = size.h;
        lagW.v = lagH.v = 0;
        draw();
        ring.ne.x = ring.n;
        ring.ne.v = 0;
      },
      run(seconds = 1) {
        const n = Math.round(60 * seconds);
        for (let i = 0; i < n; i++) tick(1 / 60);
        frame = 0;
        draw();
      },
      hand(x, y) {
        hand.tx = hand.x.x = x;
        hand.ty = hand.y.x = y;
        hand.x.v = hand.y.v = 0;
      },
      wheel(deltaY) {
        onWheel({ deltaY });
      },
      get boost() {
        return boost;
      },
    },
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", onVisibility);
      clearLetters();
      composer.dispose();
      target.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

export type GyreProps = Partial<GyreValues> & {
  className?: string;
  style?: React.CSSProperties;
  /** Font file for the letters (woff, ttf or otf). */
  fontUrl?: string;
  /** Receives the running engine once the font has loaded. */
  onReady?: (gyre: GyreHandle) => void;
};

/** Fills its parent. Give the parent a size; the rings follow it. */
export default function Gyre({
  className,
  style,
  fontUrl = GYRE_FONT_URL,
  onReady,
  ...values
}: GyreProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GyreHandle | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    createGyre(host, valuesRef.current, { font: fontUrl })
      .then((engine) => {
        if (cancelled) return engine.dispose();
        engineRef.current = engine;
        readyRef.current?.(engine);
      })
      .catch((err) => console.error("[gyre] engine failed:", err));
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [fontUrl]);

  const key = JSON.stringify(values);
  useEffect(() => {
    engineRef.current?.set(valuesRef.current);
  }, [key]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    />
  );
}
