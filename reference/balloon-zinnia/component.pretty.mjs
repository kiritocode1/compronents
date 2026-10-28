"use client";
var t = globalThis.__compifyGlobals && globalThis.__compifyGlobals.react;
if (!t) throw new Error("compify: host global not set for react");
var Ma = t.default !== void 0 ? t.default : t,
  La = t.Children !== void 0 ? t.Children : t.default && t.default.Children,
  Sa = t.Component !== void 0 ? t.Component : t.default && t.default.Component,
  Da = t.Fragment !== void 0 ? t.Fragment : t.default && t.default.Fragment,
  Ba = t.Profiler !== void 0 ? t.Profiler : t.default && t.default.Profiler,
  Fa =
    t.PureComponent !== void 0
      ? t.PureComponent
      : t.default && t.default.PureComponent,
  Ca =
    t.StrictMode !== void 0 ? t.StrictMode : t.default && t.default.StrictMode,
  Pa = t.Suspense !== void 0 ? t.Suspense : t.default && t.default.Suspense,
  Na =
    t.cloneElement !== void 0
      ? t.cloneElement
      : t.default && t.default.cloneElement,
  Ia =
    t.createContext !== void 0
      ? t.createContext
      : t.default && t.default.createContext,
  Ua =
    t.createElement !== void 0
      ? t.createElement
      : t.default && t.default.createElement,
  Oa =
    t.createFactory !== void 0
      ? t.createFactory
      : t.default && t.default.createFactory,
  Va = t.createRef !== void 0 ? t.createRef : t.default && t.default.createRef,
  Ga =
    t.forwardRef !== void 0 ? t.forwardRef : t.default && t.default.forwardRef,
  ka =
    t.isValidElement !== void 0
      ? t.isValidElement
      : t.default && t.default.isValidElement,
  Wa = t.lazy !== void 0 ? t.lazy : t.default && t.default.lazy,
  Ha = t.memo !== void 0 ? t.memo : t.default && t.default.memo,
  Xa =
    t.startTransition !== void 0
      ? t.startTransition
      : t.default && t.default.startTransition,
  za =
    t.useCallback !== void 0
      ? t.useCallback
      : t.default && t.default.useCallback,
  ja =
    t.useContext !== void 0 ? t.useContext : t.default && t.default.useContext,
  Za =
    t.useDebugValue !== void 0
      ? t.useDebugValue
      : t.default && t.default.useDebugValue,
  Ya =
    t.useDeferredValue !== void 0
      ? t.useDeferredValue
      : t.default && t.default.useDeferredValue,
  yn = t.useEffect !== void 0 ? t.useEffect : t.default && t.default.useEffect,
  qa = t.useId !== void 0 ? t.useId : t.default && t.default.useId,
  Ka =
    t.useImperativeHandle !== void 0
      ? t.useImperativeHandle
      : t.default && t.default.useImperativeHandle,
  $a =
    t.useInsertionEffect !== void 0
      ? t.useInsertionEffect
      : t.default && t.default.useInsertionEffect,
  Ja =
    t.useLayoutEffect !== void 0
      ? t.useLayoutEffect
      : t.default && t.default.useLayoutEffect,
  Qa = t.useMemo !== void 0 ? t.useMemo : t.default && t.default.useMemo,
  es =
    t.useReducer !== void 0 ? t.useReducer : t.default && t.default.useReducer,
  bt = t.useRef !== void 0 ? t.useRef : t.default && t.default.useRef,
  ts = t.useState !== void 0 ? t.useState : t.default && t.default.useState,
  ns =
    t.useSyncExternalStore !== void 0
      ? t.useSyncExternalStore
      : t.default && t.default.useSyncExternalStore,
  os =
    t.useTransition !== void 0
      ? t.useTransition
      : t.default && t.default.useTransition,
  rs = t.version !== void 0 ? t.version : t.default && t.default.version,
  as =
    t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED !== void 0
      ? t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      : t.default &&
        t.default.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  ss =
    t.__SECRET_SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED !== void 0
      ? t.__SECRET_SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      : t.default &&
        t.default.__SECRET_SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  ls = t.cache !== void 0 ? t.cache : t.default && t.default.cache,
  is = t.use !== void 0 ? t.use : t.default && t.default.use;
var f = new Proxy({}, { get: (n, s) => String(s).toLowerCase() });
function Oo(n, s) {
  if (typeof n == "function")
    try {
      n.propertyControls = s;
    } catch {}
}
var qe = {
  current: () => "preview",
  hasRestrictions: () => !1,
  canvas: "canvas",
  export: "export",
  preview: "preview",
  thumbnail: "thumbnail",
};
function Vo(n) {
  let s = gn(n);
  return {
    __rgba: s,
    toValue() {
      return s ? Br(s) : String(n);
    },
    toString() {
      return this.toValue();
    },
    toHexString() {
      return s ? Fr(s) : String(n);
    },
    toRgbString() {
      return this.toValue();
    },
  };
}
Vo.toHsl = (n) => {
  let s = gn(n && n.__rgba ? n.__rgba : n) || { r: 0, g: 0, b: 0, a: 1 };
  return Cr(s);
};
Vo.toRgb = (n) => {
  let s = gn(n && n.__rgba ? n.__rgba : n) || { r: 0, g: 0, b: 0, a: 1 };
  return { r: s.r, g: s.g, b: s.b, a: s.a };
};
function gn(n) {
  if (n == null) return null;
  if (typeof n == "object")
    return "__rgba" in n
      ? n.__rgba
      : "r" in n
        ? { r: +n.r, g: +n.g, b: +n.b, a: n.a == null ? 1 : +n.a }
        : "h" in n
          ? Uo(n)
          : null;
  let s = String(n).trim(),
    i;
  if ((i = s.match(/^#([0-9a-fA-F]{3,8})$/))) {
    let a = i[1];
    return (
      (a.length === 3 || a.length === 4) &&
        (a = a
          .split("")
          .map((l) => l + l)
          .join("")),
      {
        r: parseInt(a.slice(0, 2), 16),
        g: parseInt(a.slice(2, 4), 16),
        b: parseInt(a.slice(4, 6), 16),
        a: a.length === 8 ? parseInt(a.slice(6, 8), 16) / 255 : 1,
      }
    );
  }
  if ((i = s.match(/^rgba?\(([^)]+)\)$/i))) {
    let a = i[1]
      .split(/[,\/\s]+/)
      .filter(Boolean)
      .map(parseFloat);
    return { r: a[0], g: a[1], b: a[2], a: a[3] == null ? 1 : a[3] };
  }
  if ((i = s.match(/^hsla?\(([^)]+)\)$/i))) {
    let a = i[1]
      .split(/[,\/\s]+/)
      .filter(Boolean)
      .map(parseFloat);
    return Uo({ h: a[0], s: a[1], l: a[2], a: a[3] == null ? 1 : a[3] });
  }
  return null;
}
function Se(n, s) {
  return Math.max(0, Math.min(s, n));
}
function Br(n) {
  let s = n.a == null ? 1 : n.a,
    i = Math.round(Se(n.r, 255)),
    a = Math.round(Se(n.g, 255)),
    l = Math.round(Se(n.b, 255));
  return s >= 1
    ? "rgb(" + i + ", " + a + ", " + l + ")"
    : "rgba(" + i + ", " + a + ", " + l + ", " + s + ")";
}
function Fr(n) {
  let s = (i) => Se(Math.round(i), 255).toString(16).padStart(2, "0");
  return (
    "#" +
    s(n.r) +
    s(n.g) +
    s(n.b) +
    (n.a == null || n.a >= 1 ? "" : s(n.a * 255))
  );
}
function Cr(n) {
  let s = Se(n.r, 255) / 255,
    i = Se(n.g, 255) / 255,
    a = Se(n.b, 255) / 255,
    l = Math.max(s, i, a),
    c = Math.min(s, i, a),
    m = 0,
    g = 0,
    M = (l + c) / 2,
    L = l - c;
  return (
    L !== 0 &&
      ((g = M > 0.5 ? L / (2 - l - c) : L / (l + c)),
      l === s
        ? (m = (i - a) / L + (i < a ? 6 : 0))
        : l === i
          ? (m = (a - s) / L + 2)
          : (m = (s - i) / L + 4),
      (m *= 60)),
    { h: m, s: g * 100, l: M * 100, a: n.a == null ? 1 : n.a }
  );
}
function Uo(n) {
  let s = (((n.h % 360) + 360) % 360) / 360,
    i = Se(n.s, 100) / 100,
    a = Se(n.l, 100) / 100,
    l = (M, L, j) => (
      j < 0 && (j += 1),
      j > 1 && (j -= 1),
      j < 1 / 6
        ? M + (L - M) * 6 * j
        : j < 1 / 2
          ? L
          : j < 2 / 3
            ? M + (L - M) * (2 / 3 - j) * 6
            : M
    ),
    c,
    m,
    g;
  if (i === 0) c = m = g = a;
  else {
    let M = a < 0.5 ? a * (1 + i) : a + i - a * i,
      L = 2 * a - M;
    ((c = l(L, M, s + 1 / 3)), (m = l(L, M, s)), (g = l(L, M, s - 1 / 3)));
  }
  return { r: c * 255, g: m * 255, b: g * 255, a: n.a == null ? 1 : n.a };
}
var H =
  globalThis.__compifyGlobals &&
  globalThis.__compifyGlobals["react/jsx-runtime"];
if (!H) throw new Error("compify: host global not set for react/jsx-runtime");
var fs = H.default !== void 0 ? H.default : H,
  ds = H.Fragment !== void 0 ? H.Fragment : H.default && H.default.Fragment,
  vn = H.jsx !== void 0 ? H.jsx : H.default && H.default.jsx,
  hs = H.jsxs !== void 0 ? H.jsxs : H.default && H.default.jsxs,
  ps = H.jsxDEV !== void 0 ? H.jsxDEV : H.default && H.default.jsxDEV;
var Sn = [
  { color: "#479413", width: 9.4 },
  { color: "#6A9644", width: 6.2 },
  { color: "#CEACB7", width: 3.1 },
  { color: "#F3ABCE", width: 14.8 },
  { color: "#FB3B66", width: 2.3 },
  { color: "#EA0444", width: 4.7 },
  { color: "#842643", width: 2.3 },
  { color: "#1A1B2C", width: 6.3 },
  { color: "#243A86", width: 10.2 },
  { color: "#3955DA", width: 12.5 },
  { color: "#698AFD", width: 4.7 },
  { color: "#B2BCE4", width: 0.8 },
  { color: "#E7D4CA", width: 22.7 },
];
var Pr = 15,
  _n = { show: !0, curve: 100, thickness: 100 },
  Nr = 100,
  Ir = 100,
  Ur = 100,
  Or = 5,
  Vr = 3,
  Gr = 100,
  kr = { x: 0, y: 0, angle: 0, tilt: 0 },
  Tn = { animate: !0, delay: 0, stagger: 5 },
  Ke = { reach: 5, swell: 5, follow: 5, bounce: 5 },
  ce = { sway: 5, breathe: 5, speed: 5, flow: 5, pulse: 5 },
  q = {
    lean: 50,
    bandAxis: 42,
    lens: 12,
    cup: 50,
    twist: 0,
    ribs: 10,
    swayYaw: 29,
    breatheAngle: 45,
    nodAngle: 0,
    swayPeriod: 14,
    pulseDepth: 51,
    phase: 72,
    bloomTime: 0.9,
    followEase: 0.3,
  },
  xe = Math.PI * 2,
  K = Math.PI / 180,
  Wr = 720 / 1280,
  Go = 0.226,
  Hr = 0.098,
  Xr = 0.71,
  zr = 0.16,
  Rn = 0.5,
  jr = 0.42,
  Zr = 0.2,
  Yr = 0.22,
  qr = 0.35,
  ko = 0.17,
  Kr = 0.09,
  Wo = 0.072,
  $r = 47,
  Jr = 38,
  Et = -0.24,
  Ho = 0.19,
  Qr = 0.17,
  ea = -0.04,
  Xo = 0.25,
  ta = 0.155,
  An = 8,
  na = 1.56 / 14,
  oa = 0.14,
  ra = 0.25 / 14,
  aa = 0.18,
  sa = 0.3 / 14,
  la = 8,
  ia = 6,
  ca = 1.38 / 14,
  Mn = 0.45,
  ua = 0.13,
  Ln = 0.12,
  zo = 0.71,
  fa = 3,
  jo = 1.2,
  Zo = 48,
  Yo = 17,
  oe = 220,
  wt = [24, 40, 64],
  ue = [
    [24, 12],
    [48, 24],
    [96, 48],
    [160, 80],
  ],
  da = 0.3,
  ha = 1,
  $e = 64,
  Xe = 512,
  pa = 0.012,
  ma = 0.22,
  ba = 20 * K,
  Ea = 14 * K,
  wa = 1.6,
  qo = 0.16,
  Ko = 2.2;
function p(n, s, i) {
  return n < s ? s : n > i ? i : n;
}
function w(n, s) {
  return typeof n == "number" && isFinite(n) ? n : s;
}
function $o(n, s) {
  if (typeof n != "string") return s;
  let i = n.trim(),
    a = i.match(/#([0-9a-f]{3,8})\b/i);
  if (a) {
    let c = a[1];
    if (
      ((c.length === 3 || c.length === 4) &&
        (c = c
          .split("")
          .map((m) => m + m)
          .join("")),
      c.length === 6 || c.length === 8)
    ) {
      let m = parseInt(c.slice(0, 6), 16);
      return [((m >> 16) & 255) / 255, ((m >> 8) & 255) / 255, (m & 255) / 255];
    }
  }
  let l = i.match(/rgba?\(([^)]+)\)/i);
  if (l) {
    let c = l[1]
      .split(/[\s,\/]+/)
      .filter(Boolean)
      .map((m) =>
        m.endsWith("%") ? (parseFloat(m) / 100) * 255 : parseFloat(m),
      );
    return [
      p((c[0] || 0) / 255, 0, 1),
      p((c[1] || 0) / 255, 0, 1),
      p((c[2] || 0) / 255, 0, 1),
    ];
  }
  return s;
}
function xa(n, s) {
  let i = n.length,
    a = [],
    l = [],
    c = 0;
  for (let g = 0; g < i; g++) {
    let M = n[g] || {},
      L = Sn[g % Sn.length];
    (a.push($o(M.color, $o(L.color, [0, 0, 0]))),
      l.push(c),
      (c += p(w(M.width, L.width), 0.1, 100)));
  }
  let m = 0;
  for (let g = 0; g < Xe; g++) {
    let M = ((g + 0.5) / Xe) * c;
    for (; m < i - 1 && l[m + 1] <= M;) m++;
    let L = (m < i - 1 ? l[m + 1] : c) - l[m],
      j = L > 0 ? p((M - l[m]) / L, 0, 1) : 0,
      ye = a[m],
      ae = a[(m + 1) % i];
    for (let fe = 0; fe < 3; fe++)
      s[g * 4 + fe] = Math.round((ye[fe] + (ae[fe] - ye[fe]) * j) * 255);
    s[g * 4 + 3] = 255;
  }
}
function Jo(n, s) {
  let i = Math.cos(n),
    a = Math.sin(n);
  s.set([1, 0, 0, 0, i, -a, 0, a, i]);
}
function ya(n, s) {
  let i = Math.cos(n),
    a = Math.sin(n);
  s.set([i, 0, a, 0, 1, 0, -a, 0, i]);
}
function Qo(n, s, i) {
  for (let a = 0; a < 3; a++)
    for (let l = 0; l < 3; l++)
      i[a * 3 + l] =
        n[a * 3] * s[l] + n[a * 3 + 1] * s[3 + l] + n[a * 3 + 2] * s[6 + l];
}
function ga(n, s, i, a) {
  let l = [
    0,
    -0.21,
    -0.22,
    Ln,
    -0.62,
    -0.52 * n - 0.1 * (1 - n),
    Ln,
    -1,
    -zo * n * 0.99,
  ];
  for (let d = jo; d <= Yo + 2; d += 0.3)
    l.push(Ln, -d, -zo * n * Math.cos((xe * (d - jo)) / fa));
  let c = Math.cos(Zo * K),
    m = Math.sin(Zo * K),
    g = [];
  for (let d = 0; d < l.length; d += 3)
    g.push(l[d], c * l[d + 1] - m * l[d + 2], m * l[d + 1] + c * l[d + 2]);
  let M = g.length / 3,
    L = [],
    j = 16;
  for (let d = 0; d < M - 1; d++) {
    let Q = Math.max(0, d - 1),
      le = d + 1,
      S = Math.min(M - 1, d + 2);
    for (let k = 0; k < j; k++) {
      let N = k / j,
        ie = N * N,
        F = ie * N;
      for (let B = 0; B < 3; B++) {
        let ve = g[Q * 3 + B],
          De = g[d * 3 + B],
          Be = g[le * 3 + B],
          Ve = g[S * 3 + B];
        L.push(
          0.5 *
            (2 * De +
              (-ve + Be) * N +
              (2 * ve - 5 * De + 4 * Be - Ve) * ie +
              (-ve + 3 * De - 3 * Be + Ve) * F),
        );
      }
    }
  }
  let ye = L.length / 3,
    ae = new Float64Array(ye);
  for (let d = 1; d < ye; d++)
    ae[d] =
      ae[d - 1] +
      Math.hypot(
        L[d * 3] - L[d * 3 - 3],
        L[d * 3 + 1] - L[d * 3 - 2],
        L[d * 3 + 2] - L[d * 3 - 1],
      );
  let fe = Math.min(ae[ye - 1], Yo),
    se = 0;
  for (let d = 0; d < oe; d++) {
    let Q = (d / (oe - 1)) * fe;
    for (; se < ye - 2 && ae[se + 1] < Q;) se++;
    let le = p((Q - ae[se]) / Math.max(1e-9, ae[se + 1] - ae[se]), 0, 1);
    for (let S = 0; S < 3; S++)
      s[d * 3 + S] = L[se * 3 + S] + (L[se * 3 + 3 + S] - L[se * 3 + S]) * le;
  }
  let ge = 1,
    de = 0,
    he = 0;
  for (let d = 0; d < oe; d++) {
    let Q = Math.max(0, d - 1),
      le = Math.min(oe - 1, d + 1),
      S = s[le * 3] - s[Q * 3],
      k = s[le * 3 + 1] - s[Q * 3 + 1],
      N = s[le * 3 + 2] - s[Q * 3 + 2],
      ie = Math.hypot(S, k, N) || 1;
    ((S /= ie), (k /= ie), (N /= ie));
    let F = ge * S + de * k + he * N;
    ((ge -= F * S), (de -= F * k), (he -= F * N));
    let B = Math.hypot(ge, de, he) || 1;
    ((ge /= B),
      (de /= B),
      (he /= B),
      (i[d * 3] = ge),
      (i[d * 3 + 1] = de),
      (i[d * 3 + 2] = he),
      (a[d * 3] = k * he - N * de),
      (a[d * 3 + 1] = N * ge - S * he),
      (a[d * 3 + 2] = S * de - k * ge));
  }
}
var Je = 0.5,
  kt = 120,
  va = (kt + Je) / (kt - Je),
  _a = (-2 * kt * Je) / (kt - Je),
  or = `
uniform vec2 uCenter;   // principal point, buffer px (y up)
uniform vec2 uRes;
uniform float uFocal;   // buffer px
uniform vec2 uRoll;     // cos, sin of Angle
uniform vec2 uShift;    // the head's place in the composition, buffer px, before Angle turns it
vec4 project(vec3 P) {
    float dep = -P.z;
    vec2 uv = uFocal * P.xy / dep + uShift;
    vec2 px = uCenter + vec2(uRoll.x * uv.x + uRoll.y * uv.y, -uRoll.y * uv.x + uRoll.x * uv.y);
    return vec4((px / uRes * 2.0 - 1.0) * dep, dep * ${va.toFixed(6)} + ${_a.toFixed(6)}, dep);
}`,
  Ta = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D uData;   // per ellipsoid: centre + egg taper, then its three scaled axes (camera space)
uniform int uBase;
uniform int uLon;
uniform int uLat;
${or}
out vec3 vN;
flat out vec3 vC;
flat out vec3 vU;
flat out vec3 vV;
flat out vec3 vW;
flat out float vE;
void main() {
    int row = uBase + gl_InstanceID;
    vec4 ce = texelFetch(uData, ivec2(0, row), 0);
    vec3 c = ce.xyz;
    vec3 u = texelFetch(uData, ivec2(1, row), 0).xyz;
    vec3 v = texelFetch(uData, ivec2(2, row), 0).xyz;
    vec3 w = texelFetch(uData, ivec2(3, row), 0).xyz;
    int i = gl_VertexID % uLon;
    int j = gl_VertexID / uLon;
    float th = float(i) * 6.2831853 / float(uLon);
    float ph = float(j) * 3.14159265 / float(uLat);
    vec3 n = vec3(sin(ph) * cos(th), sin(ph) * sin(th), cos(ph));
    vN = n;
    vC = c;
    vU = u;
    vV = v;
    vW = w;
    vE = ce.w;
    // an egg: the cross-section swells toward +u (a petal's tip) and slims toward \u2212u (its hinge)
    gl_Position = project(c + n.x * u + (1.0 + ce.w * n.x) * (n.y * v + n.z * w));
}`,
  Ra = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D uStem;   // per sample: (centre, radius), normal, binormal (camera space)
uniform int uRound;
${or}
out vec3 vC;
out vec3 vD;
out float vR;
void main() {
    int i = gl_VertexID / uRound;
    int j = gl_VertexID % uRound;
    vec4 cr = texelFetch(uStem, ivec2(0, i), 0);
    vec3 nn = texelFetch(uStem, ivec2(1, i), 0).xyz;
    vec3 bn = texelFetch(uStem, ivec2(2, i), 0).xyz;
    float a = float(j) * 6.2831853 / float(uRound);
    vec3 d = cos(a) * nn + sin(a) * bn;
    vC = cr.xyz;
    vD = d;
    vR = cr.w;
    gl_Position = project(cr.xyz + cr.w * d);
}`,
  er = (n) => `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D uPal;
uniform vec3 uG;        // band axis \xD7 bands per unit (camera space)
uniform float uPhase;   // loop position at the bands' origin
uniform vec3 uHead;     // the bands' origin (they breathe about it)
uniform float uGrain;   // grain amplitude
uniform float uGrainPx; // buffer px per grain (one CSS px)
uniform int uSeed;      // new grain each drawn frame
uvec3 pcg3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return v;
}
${
  n
    ? `in vec3 vC;
in vec3 vD;
in float vR;`
    : `in vec3 vN;
flat in vec3 vC;
flat in vec3 vU;
flat in vec3 vV;
flat in vec3 vW;
flat in float vE;`
}
out vec4 outColor;
void main() {
${
  n
    ? "    vec3 P = vC + vR * normalize(vD);"
    : `    vec3 n = normalize(vN);
    vec3 P = vC + n.x * vU + (1.0 + vE * n.x) * (n.y * vV + n.z * vW);`
}
    float t = dot(P - uHead, uG) + uPhase;
    float fw = fwidth(t) * ${Xe.toFixed(1)};
    vec3 c = textureLod(uPal, vec2(t, 0.5), log2(max(fw, 1.0))).rgb;
    // film grain, one grain per CSS pixel (triangular, so it never clumps), plus a whisper of
    // dither so the long blends never band
    uvec3 hv = pcg3(uvec3(uvec2(gl_FragCoord.xy / uGrainPx), uint(uSeed)));
    vec3 u = vec3(hv & 0xffffu) / 65535.0;
    float grain = (u.x + u.y - 1.0) * uGrain;
    float h = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    outColor = vec4(clamp(c + grain + (h - 0.5) / 255.0, 0.0, 1.0), 1.0);
}`;
function tr(n, s, i) {
  let a = n.createProgram();
  if (!a) return null;
  let l = [];
  for (let [c, m] of [
    [n.VERTEX_SHADER, s],
    [n.FRAGMENT_SHADER, i],
  ]) {
    let g = n.createShader(c);
    if (!g) return null;
    (n.shaderSource(g, m), n.compileShader(g), n.attachShader(a, g), l.push(g));
  }
  return (
    n.linkProgram(a),
    { p: a, loc: new Map(), cache: new Map(), sh: l, ok: null }
  );
}
function nr(n, s, i) {
  if (s.ok !== null) return !0;
  if (i && !n.getProgramParameter(s.p, 37297)) return !1;
  if (
    ((s.ok = !!n.getProgramParameter(s.p, n.LINK_STATUS)),
    !s.ok && !n.isContextLost())
  ) {
    for (let a of s.sh)
      n.getShaderParameter(a, n.COMPILE_STATUS) ||
        console.warn("BalloonZinnia shader:", n.getShaderInfoLog(a));
    console.warn("BalloonZinnia link:", n.getProgramInfoLog(s.p));
  }
  for (let a of s.sh) n.deleteShader(a);
  return ((s.sh.length = 0), !0);
}
function Aa(n) {
  let s = (a, l) => {
      let c = a.loc.get(l);
      return (
        c === void 0 && ((c = n.getUniformLocation(a.p, l)), a.loc.set(l, c)),
        c
      );
    },
    i = (a, l, c, m, g) => {
      let M = a.cache.get(l);
      return (
        M || ((M = new Float64Array([NaN, NaN, NaN])), a.cache.set(l, M)),
        M[0] === c && M[1] === m && M[2] === g
          ? !1
          : ((M[0] = c), (M[1] = m), (M[2] = g), !0)
      );
    };
  return {
    f1(a, l, c) {
      i(a, l, c, 0, 0) && n.uniform1f(s(a, l), c);
    },
    f2(a, l, c, m) {
      i(a, l, c, m, 0) && n.uniform2f(s(a, l), c, m);
    },
    f3(a, l, c, m, g) {
      i(a, l, c, m, g) && n.uniform3f(s(a, l), c, m, g);
    },
    i1(a, l, c) {
      i(a, l, c, 0, 0) && n.uniform1i(s(a, l), c);
    },
  };
}
function rr({
  colors: n = [
    { color: "#479413", width: 9.4 },
    { color: "#6A9644", width: 6.2 },
    { color: "#CEACB7", width: 3.1 },
    { color: "#F3ABCE", width: 14.8 },
    { color: "#FB3B66", width: 2.3 },
    { color: "#EA0444", width: 4.7 },
    { color: "#842643", width: 2.3 },
    { color: "#1A1B2C", width: 6.3 },
    { color: "#243A86", width: 10.2 },
    { color: "#3955DA", width: 12.5 },
    { color: "#698AFD", width: 4.7 },
    { color: "#B2BCE4", width: 0.8 },
    { color: "#E7D4CA", width: 22.7 },
  ],
  background: s = "#000000",
  petals: i = 22,
  stem: a,
  petalLength: l = 200,
  petalWidth: c = 100,
  puff: m = 134,
  bands: g = 5,
  grain: M = 0,
  scale: L = 100,
  placement: j,
  entrance: ye,
  response: ae,
  motion: fe,
  advanced: se,
  style: ge,
}) {
  let de = bt(null),
    he = bt(null),
    d = {
      colors: Array.isArray(n) && n.length >= 2 ? n : Sn,
      petals: i,
      stem: { ..._n, ...a },
      petalLength: l,
      petalWidth: c,
      puff: m,
      bands: g,
      grain: M,
      scale: L,
      placement: { ...kr, ...j },
      entrance: { ...Tn, ...ye },
      response: { ...Ke, ...ae },
      motion: { ...ce, ...fe },
      adv: { ...q, ...se },
    },
    Q = bt(d);
  Q.current = d;
  let le = bt(() => {});
  return (
    yn(() => {
      le.current();
    }),
    yn(() => {
      let S = de.current,
        k = he.current;
      if (!S || !k) return;
      let N = null,
        ie = !1,
        F = null,
        B = null,
        ve = null,
        De = null,
        Be = [],
        Ve = [],
        Dn = !1,
        xt = null,
        yt = null,
        Qe = null,
        Wt = !1,
        gt = !1,
        ee = 0,
        Fe = 0,
        Ge = 1,
        vt = 1,
        ze = 0,
        et = 0,
        _t = "",
        Ht = null,
        Bn = new Uint8Array(Xe * 4),
        Xt = NaN,
        Tt = new Float64Array(oe * 3),
        Fn = new Float64Array(oe * 3),
        Cn = new Float64Array(oe * 3),
        _e = new Float32Array(oe * 12),
        D = new Float64Array($e * 12),
        pe = new Float64Array(72),
        Pn = new Float64Array($e),
        Nn = new Int32Array($e),
        tt = new Float32Array($e * 16),
        nt = new Int32Array(ue.length),
        zt = new Int32Array(ue.length),
        In = new Int32Array(ue.length),
        Rt = 0,
        At = 0,
        jt = 0,
        Mt = 0,
        ot = !1,
        je = !0,
        rt = new Float64Array(24),
        Lt = new Float64Array(24),
        at = new Float64Array(24),
        X = { x: 0, y: 0, vx: 0, vy: 0 },
        me = { x: 0, y: 0 },
        T = { x: 0, y: 0, vx: 0, vy: 0, squash: 0, at: -1 },
        W = new Float64Array(9),
        V = new Float64Array(9),
        St = new Float64Array(9),
        Un = new Float64Array(9),
        On = new Float64Array(9),
        u = { cx: 0, cy: 0, f: 1, c: 1, s: 0, sx: 0, sy: 0, d: 20 },
        v = {
          cx: 0,
          cy: 0,
          inside: !1,
          moved: !1,
          down: !1,
          id: -1,
          sx: 0,
          sy: 0,
          type: "mouse",
          tap: !1,
        },
        $ = { x: 0, y: 0, has: !1 },
        Zt = 0,
        Vn = 0,
        Gn = 0,
        kn =
          typeof window.matchMedia == "function"
            ? window.matchMedia("(prefers-reduced-motion: reduce)")
            : null,
        Dt = !0,
        st = !0,
        Wn = () => {
          let e = k.getContext("webgl2", {
            alpha: !0,
            premultipliedAlpha: !0,
            antialias: !0,
            depth: !0,
            stencil: !1,
            powerPreference: "low-power",
            preserveDrawingBuffer: !1,
          });
          if (!e) return !1;
          ((N = e), (Wt = !!e.getExtension("KHR_parallel_shader_compile")));
          let r = tr(e, Ta, er(!1)),
            y = tr(e, Ra, er(!0));
          if (!r || !y) return !1;
          ((F = { ell: r, stem: y }),
            (gt = !1),
            (B = Aa(e)),
            (ve = e.createVertexArray()),
            e.bindVertexArray(ve));
          let _ = 0;
          for (let [R, ne] of ue) _ += R * ne * 6;
          for (let R of wt) _ += (oe - 1) * R * 6;
          let h = new Uint32Array(_),
            C = 0;
          Be.length = 0;
          for (let [R, ne] of ue) {
            let G = C;
            for (let U = 0; U < ne; U++)
              for (let re = 0; re < R; re++) {
                let we = U * R + re,
                  Ae = U * R + ((re + 1) % R),
                  Me = (U + 1) * R + re,
                  z = (U + 1) * R + ((re + 1) % R);
                ((h[C++] = we),
                  (h[C++] = Ae),
                  (h[C++] = Me),
                  (h[C++] = Ae),
                  (h[C++] = z),
                  (h[C++] = Me));
              }
            Be.push([G * 4, C - G]);
          }
          Ve.length = 0;
          for (let R of wt) {
            let ne = C;
            for (let G = 0; G < oe - 1; G++)
              for (let U = 0; U < R; U++) {
                let re = G * R + U,
                  we = G * R + ((U + 1) % R),
                  Ae = (G + 1) * R + U,
                  Me = (G + 1) * R + ((U + 1) % R);
                ((h[C++] = re),
                  (h[C++] = Ae),
                  (h[C++] = we),
                  (h[C++] = we),
                  (h[C++] = Ae),
                  (h[C++] = Me));
              }
            Ve.push([ne * 4, C - ne]);
          }
          ((De = e.createBuffer()),
            e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, De),
            e.bufferData(e.ELEMENT_ARRAY_BUFFER, h, e.STATIC_DRAW),
            e.bindVertexArray(null));
          let I = e.getExtension("WEBGL_debug_renderer_info"),
            J = I ? String(e.getParameter(I.UNMASKED_RENDERER_WEBGL)) : "";
          ((Dn = /swiftshader|llvmpipe|software|basic render/i.test(J)),
            (xt = e.createTexture()),
            e.bindTexture(e.TEXTURE_2D, xt),
            e.texStorage2D(e.TEXTURE_2D, 1, e.RGBA32F, 4, $e));
          for (let R of [e.TEXTURE_MIN_FILTER, e.TEXTURE_MAG_FILTER])
            e.texParameteri(e.TEXTURE_2D, R, e.NEAREST);
          ((yt = e.createTexture()),
            e.bindTexture(e.TEXTURE_2D, yt),
            e.texStorage2D(e.TEXTURE_2D, 1, e.RGBA32F, 3, oe));
          for (let R of [e.TEXTURE_MIN_FILTER, e.TEXTURE_MAG_FILTER])
            e.texParameteri(e.TEXTURE_2D, R, e.NEAREST);
          return (
            (Qe = e.createTexture()),
            e.bindTexture(e.TEXTURE_2D, Qe),
            e.texStorage2D(e.TEXTURE_2D, Math.log2(Xe) + 1, e.RGBA8, Xe, 1),
            e.texParameteri(
              e.TEXTURE_2D,
              e.TEXTURE_MIN_FILTER,
              e.LINEAR_MIPMAP_LINEAR,
            ),
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR),
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT),
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE),
            (_t = ""),
            (Ht = null),
            (Xt = NaN),
            (ze = et = 0),
            !0
          );
        },
        ar = () => {
          if (!(!N || N.isContextLost())) {
            if (F) for (let e of Object.values(F)) N.deleteProgram(e.p);
            for (let e of [xt, yt, Qe]) e && N.deleteTexture(e);
            (De && N.deleteBuffer(De),
              ve && N.deleteVertexArray(ve),
              (F = null));
          }
        };
      if (!Wn()) {
        k.style.display = "none";
        return;
      }
      let Hn = new ResizeObserver((e) => {
        let r = e[0];
        if (!r) return;
        ((ee = r.contentRect.width), (Fe = r.contentRect.height));
        let y = S.getBoundingClientRect();
        if (ee > 0) {
          let _ = y.width / ee;
          Math.abs(_ - Ge) / Ge > 0.05 && (Ge = _);
        }
        be();
      });
      Hn.observe(S);
      let Xn =
        typeof IntersectionObserver == "function"
          ? new IntersectionObserver((e) => {
              for (let r of e) Dt = r.isIntersecting;
              Dt && be();
            })
          : null;
      Xn?.observe(S);
      let zn = () => {
        document.hidden || be();
      };
      document.addEventListener("visibilitychange", zn);
      let jn = (e) => {
          (e.preventDefault(), (ie = !0), io());
        },
        Zn = () => {
          ((ie = !1), Wn() && be());
        };
      (k.addEventListener("webglcontextlost", jn),
        k.addEventListener("webglcontextrestored", Zn));
      let sr = () => {
          let e = S.getBoundingClientRect();
          if (
            ((Zt = e.width), (Vn = e.left), (Gn = e.top), ee > 0 && e.width > 0)
          ) {
            let r = e.width / ee;
            Math.abs(r - Ge) / Ge > 0.05 && (Ge = r);
          }
        },
        lt = (e) => {
          (e.clientX === v.cx && e.clientY === v.cy && v.inside) ||
            ((v.cx = e.clientX),
            (v.cy = e.clientY),
            (v.inside = !0),
            (v.moved = !0),
            (v.type = e.pointerType),
            be());
        },
        Yn = (e) => {
          ((e.pointerType !== "mouse" || !v.down) && (v.inside = !1), be());
        },
        qn = (e) => {
          (lt(e),
            !(e.button !== 0 && e.pointerType === "mouse") &&
              ((v.down = !0),
              (v.id = e.pointerId),
              (v.sx = e.clientX),
              (v.sy = e.clientY)));
        },
        Bt = (e) => {
          let r = v.down && v.id === e.pointerId;
          ((v.down = !1),
            (v.id = -1),
            r &&
              e.type === "pointerup" &&
              Math.abs(e.clientX - v.sx) + Math.abs(e.clientY - v.sy) < 8 &&
              ((v.cx = e.clientX),
              (v.cy = e.clientY),
              (v.moved = !0),
              (v.tap = !0)),
            e.pointerType === "touch" && (v.inside = !1),
            be());
        },
        Kn = () => {
          v.inside && ((v.moved = !0), be());
        };
      (S.addEventListener("pointermove", lt),
        S.addEventListener("pointerenter", lt),
        S.addEventListener("pointerleave", Yn),
        S.addEventListener("pointerdown", qn),
        window.addEventListener("pointerup", Bt),
        window.addEventListener("pointercancel", Bt),
        window.addEventListener("scroll", Kn, { passive: !0, capture: !0 }));
      let ke = 0,
        Ze = -1,
        Te = -1,
        $n = new Float64Array(15),
        it = new Float64Array(15),
        Ft = 0,
        Yt = 0,
        ct = 16.67,
        ut = 1,
        Jn = new Float64Array(9),
        Ye = 0,
        qt = 0,
        Ce = 0,
        Kt = [1, 0.85, 0.72, 0.6],
        ft = -1,
        dt = -1,
        te = { dir: 0, at: 0, before: 0 },
        Qn = 0,
        eo = 0,
        to = 3e4,
        no = 3e4,
        oo = 0,
        ro = (e, r) => {
          for (let y = 0; y < r; y++) {
            let _ = e[y],
              h = y - 1;
            for (; h >= 0 && it[h] > _;) ((it[h + 1] = it[h]), h--);
            it[h + 1] = _;
          }
          return r ? it[r >> 1] : 0;
        },
        $t = () => {
          let e = qe.current();
          return !!(kn && kn.matches) || e === qe.thumbnail || e === qe.export;
        },
        ao = () => {
          if ($t()) return !1;
          let e = Q.current.motion;
          return w(e.speed, ce.speed) > 0
            ? w(e.sway, ce.sway) > 0 ||
                w(e.breathe, ce.breathe) > 0 ||
                w(e.flow, ce.flow) !== 0 ||
                w(e.pulse, ce.pulse) > 0
            : !1;
        },
        so = () => {
          if (
            !gt ||
            !je ||
            Math.abs(X.vx) + Math.abs(X.vy) > 1e-5 ||
            Math.abs(X.x - me.x) + Math.abs(X.y - me.y) > 1e-5 ||
            Math.abs(T.x) + Math.abs(T.y) + Math.abs(T.vx) + Math.abs(T.vy) >
              1e-5 ||
            T.at >= 0
          )
            return !0;
          for (let e = 0; e < 24; e++)
            if (Math.abs(Lt[e]) > 1e-4 || Math.abs(rt[e] - at[e]) > 1e-4)
              return !0;
          return !1;
        },
        lo = (e) => {
          if (((ke = 0), ie || !Dt || document.hidden)) {
            Ze = Te = -1;
            return;
          }
          if (Ze >= 0) {
            let h = e - Ze;
            h > 2 &&
              h < 120 &&
              (($n[Yt] = h), (Yt = (Yt + 1) % 15), (Ft = Math.min(15, Ft + 1)));
          }
          ((Ze = e), Ft >= 3 && (ct = ro($n, Ft)));
          let r = 16.667 / ct;
          (r < ut - 0.1 || r >= ut + 1.1) &&
            (ut = Math.max(1, Math.floor(r + 0.1)));
          let y = Te < 0 || e - Te >= (ut - 0.5) * ct,
            _ = ao() || so();
          if (y && (_ || st)) {
            let h = Te < 0 ? 0 : e - Te;
            (Te >= 0 && _ && lr(e, h),
              (Te = e),
              (st = !1),
              cr(Math.min(0.1, h / 1e3)));
          }
          ao() || so() || st
            ? (ke = requestAnimationFrame(lo))
            : (Ze = Te = -1);
        },
        lr = (e, r) => {
          if ((oo++, oo < 30)) return;
          ((Jn[qt] = r), (qt = (qt + 1) % 9), (Ye = Math.min(9, Ye + 1)));
          let y = ro(Jn, Ye),
            _ = Math.min(ut * ct, 33.4);
          if (te.dir !== 0) {
            if (e - te.at < 1500 || Ye < 9) return;
            (te.dir < 0 && y > te.before * 0.87
              ? (Ce--, (Qn = e + to), (to *= 2))
              : te.dir > 0 &&
                y > te.before * 1.13 &&
                (Ce++, (eo = e + no), (no *= 2)),
              (te.dir = 0),
              (vt = Kt[Ce]));
            return;
          }
          let h = y > 1.3 * _ || ct > 21;
          (h && Ce < Kt.length - 1 && e > Qn
            ? (ft < 0 && (ft = e),
              e - ft > 600 &&
                (Ce++,
                (te.dir = -1),
                (te.at = e),
                (te.before = y),
                (Ye = 0),
                (ft = -1)))
            : (ft = -1),
            !h && y < 1.1 * _ && Ce > 0 && e > eo
              ? (dt < 0 && (dt = e),
                e - dt > 4e3 &&
                  (Ce--,
                  (te.dir = 1),
                  (te.at = e),
                  (te.before = y),
                  (Ye = 0),
                  (dt = -1)))
              : (dt = -1),
            (vt = Kt[Ce]));
        },
        be = () => {
          ((st = !0),
            !ke &&
              !ie &&
              Dt &&
              !document.hidden &&
              (ke = requestAnimationFrame(lo)));
        },
        io = () => {
          (ke && cancelAnimationFrame(ke), (ke = 0), (Ze = Te = -1));
        };
      le.current = be;
      let Jt = (e, r, y, _, h, C) => {
          let I = 5.8 / Math.max(_, 0.02),
            J = h;
          for (; J > 1e-6;) {
            let R = Math.min(0.004, J);
            ((J -= R), (r += (I * I * (y - e) - 2 * I * r) * R), (e += r * R));
          }
          (Math.abs(e - y) < 1e-5 && Math.abs(r) < 1e-4 && ((e = y), (r = 0)),
            (C[0] = e),
            (C[1] = r));
        },
        Re = [0, 0],
        ht = { x: 0, y: 0, z: 0 },
        ir = (e, r, y) => {
          let _ = V[0] * e + V[1] * r + V[2] * y,
            h = V[3] * e + V[4] * r + V[5] * y,
            I = -(V[6] * e + V[7] * r + V[8] * y - u.d);
          if (I < Je) return !1;
          let J = (u.f * _) / I + u.sx,
            R = (u.f * h) / I + u.sy;
          return (
            (ht.x = u.cx + u.c * J + u.s * R),
            (ht.y = u.cy - (-u.s * J + u.c * R)),
            (ht.z = I),
            !0
          );
        },
        Ee = 0,
        Ct = (e, r, y, _, h, C, I, J, R, ne, G, U, re = 0) => {
          if (Ee >= $e) return;
          Pn[Ee] = re;
          let we = h * R - C * J,
            Ae = C * I - _ * R,
            Me = _ * J - h * I,
            z = Ee * 12;
          ((D[z] = e),
            (D[z + 1] = r),
            (D[z + 2] = y),
            (D[z + 3] = _ * ne),
            (D[z + 4] = h * ne),
            (D[z + 5] = C * ne),
            (D[z + 6] = I * G),
            (D[z + 7] = J * G),
            (D[z + 8] = R * G),
            (D[z + 9] = we * U),
            (D[z + 10] = Ae * U),
            (D[z + 11] = Me * U),
            Ee++);
        },
        cr = (e) => {
          if (!N || !F || !B || ee < 2 || Fe < 2) return;
          if (!gt) {
            let o = nr(N, F.ell, Wt),
              b = nr(N, F.stem, Wt);
            if (!o || !b) {
              st = !0;
              return;
            }
            if (!F.ell.ok || !F.stem.ok) {
              ((k.style.display = "none"), (F = null));
              return;
            }
            gt = !0;
            let E = qe.current();
            ((ot = !!Q.current.entrance.animate && !$t() && E !== qe.canvas),
              (je = !ot),
              (Mt = 0));
          }
          let r = N,
            y = Q.current,
            _ = y.adv,
            h = $t(),
            C =
              typeof window.devicePixelRatio == "number"
                ? window.devicePixelRatio
                : 1,
            I = Math.min(C, 2) * p(Ge, 1, 2),
            J = Math.sqrt(32e5 / (ee * Fe));
          ((I = Math.min(I, Math.max(J, 1))),
            (I = Math.max(Math.min(1, I), I * vt)));
          let R = Math.max(1, Math.round(ee * I)),
            ne = Math.max(1, Math.round(Fe * I));
          (R !== ze || ne !== et) && ((k.width = ze = R), (k.height = et = ne));
          let G = ze / ee,
            U = y.motion,
            re = h ? 0 : p(w(U.sway, ce.sway), 0, 10) / 5,
            we = h ? 0 : p(w(U.breathe, ce.breathe), 0, 10) / 5,
            Ae = h ? 0 : p(w(U.pulse, ce.pulse), 0, 10) / 5,
            Me = p(w(U.speed, ce.speed), 0, 10),
            z = Me > 0 ? Math.pow(2, (Me - 5) / 2.5) : 0,
            Pt = p(w(_.swayPeriod, q.swayPeriod), 1, 120);
          if (!h && z > 0) {
            ((Rt += e * z), (Rt -= Math.floor(Rt / Pt) * Pt));
            let o = p(w(U.flow, ce.flow), -10, 10) / 5;
            ((At += (e * z * o * la) / Pt),
              (At -= Math.floor(At)),
              (jt = (jt + 1) & 65535));
          }
          ot && !je && (Mt += e);
          let pt = Rt / Pt,
            Pe = Math.min(Fe, ee / Wr),
            Ne = p(w(y.scale, Gr), 30, 100) / 100,
            ur = p(w(_.lens, q.lens), 2, 60);
          ((u.d = 1 / (2 * Go * Math.tan((ur * K) / 2))),
            (u.f = Go * Pe * Ne * u.d));
          let Nt = y.placement,
            co = p(w(Nt.angle, 0), -180, 180) * K;
          if (
            ((u.c = Math.cos(co)),
            (u.s = Math.sin(co)),
            (u.sx = 0),
            (u.sy = Hr * Pe * Ne),
            (u.cx = ee / 2 + (p(w(Nt.x, 0), -50, 50) / 100) * ee),
            (u.cy = Fe / 2 + (p(w(Nt.y, 0), -50, 50) / 100) * Fe),
            v.moved && ((v.moved = !1), sr(), Zt > 0))
          ) {
            let o = ee / Zt;
            (($.x = (v.cx - Vn) * o), ($.y = (v.cy - Gn) * o), ($.has = !0));
          }
          let mt = y.response,
            Qt =
              $.has &&
              v.inside &&
              !h &&
              (v.type === "mouse" || v.type === "pen" || v.down),
            en = u.cx + u.c * u.sx + u.s * u.sy,
            tn = u.cy - (-u.s * u.sx + u.c * u.sy),
            nn = p(w(mt.follow, Ke.follow), 0, 10) / 10;
          if (((me.x = me.y = 0), Qt && nn > 0 && v.type !== "touch")) {
            let o = $.x - en,
              b = $.y - tn,
              E = p((u.c * o - u.s * b) / (0.5 * Pe * Ne), -1, 1),
              A = p((u.s * o + u.c * b) / (0.5 * Pe * Ne), -1, 1);
            ((me.x = E * ba * nn), (me.y = A * Ea * nn));
          }
          let uo = p(w(_.followEase, q.followEase), 0.02, 3);
          h
            ? ((X.x = me.x), (X.y = me.y), (X.vx = X.vy = 0))
            : (Jt(X.x, X.vx, me.x, uo, e, Re),
              (X.x = Re[0]),
              (X.vx = Re[1]),
              Jt(X.y, X.vy, me.y, uo, e, Re),
              (X.y = Re[0]),
              (X.vy = Re[1]));
          {
            let o = xe * wa,
              b = e;
            for (; b > 1e-6;) {
              let E = Math.min(0.004, b);
              ((b -= E),
                (T.vx += (-o * o * T.x - 2 * qo * o * T.vx) * E),
                (T.vy += (-o * o * T.y - 2 * qo * o * T.vy) * E),
                (T.x += T.vx * E),
                (T.y += T.vy * E));
            }
            (Math.abs(T.x) + Math.abs(T.y) < 2e-5 &&
              Math.abs(T.vx) + Math.abs(T.vy) < 2e-4 &&
              (T.x = T.y = T.vx = T.vy = 0),
              T.at >= 0 && ((T.at += e), T.at > 2.5 && (T.at = -1)),
              (T.squash =
                T.at >= 0
                  ? Math.exp(-T.at / 0.35) * Math.sin(xe * 3.2 * T.at)
                  : 0));
          }
          let fo = p(w(Nt.tilt, 0), -90, 90) * K,
            fr = p(w(_.lean, q.lean), -90, 90) * K,
            on =
              -re * p(w(_.swayYaw, q.swayYaw), 0, 90) * K * Math.cos(xe * pt),
            dr = on + X.x + T.x,
            hr = X.y + T.y;
          (Jo(-(fr + fo), St),
            Jo(hr, Un),
            Qo(Un, St, On),
            ya(dr, St),
            Qo(St, On, W),
            V.set(W));
          let pr = Math.min(
              0.9,
              (p(w(_.pulseDepth, q.pulseDepth), 0, 90) / 100) * Ae,
            ),
            rn =
              Xr *
              Math.pow(2, (p(w(y.bands, Or), 0, 10) - 5) / 2.5) *
              (1 + pr * Math.cos(xe * ia * (pt - ca))),
            ho = p(w(_.bandAxis, q.bandAxis), -90, 90) * K + fo,
            po = Math.sin(ho),
            It = Math.cos(ho),
            mo = Math.sin(on),
            bo = Math.cos(on),
            mr = It * mo * rn,
            br = po * rn,
            Er = It * bo * rn,
            wr = -Mn * It * mo,
            xr = -Mn * po,
            yr = -u.d - Mn * It * bo,
            Eo = w(_.phase, q.phase) / 100 - At,
            gr = we * aa * Math.cos(xe * An * (pt - sa)),
            Le = Math.round(p(w(y.petals, Pr), 6, 24)),
            vr = p(w(y.petalLength, Nr), 40, 200) / 100,
            _r = p(w(y.petalWidth, Ir), 30, 250) / 100,
            Tr = p(w(y.puff, Ur), 20, 250) / 100,
            an = jr * vr,
            Rr = Math.min(Zr * _r * (15 / Le), 0.7),
            Ut = Yr * Tr,
            sn = we * Math.cos(xe * An * (pt - na)),
            wo = p(w(_.cup, q.cup), -60, 60) * K,
            ln = wo + sn * p(w(_.breatheAngle, q.breatheAngle), 0, 80) * K,
            cn =
              -an * (1 - 2 * Rn) * (Math.sin(ln) - Math.sin(wo)) +
              -we * oa * Math.cos(xe * An * (pt - ra)),
            xo = p(w(_.twist, q.twist), -60, 60) * K,
            yo = y.entrance,
            go = p(w(yo.stagger, Tn.stagger), 0, 10) * 0.012,
            vo = p(w(_.bloomTime, q.bloomTime), 0.1, 5),
            _o = Math.max(0, w(yo.delay, Tn.delay)),
            To = (o) => {
              if (!ot || je) return 1;
              let b = p((Mt - _o - go * o) / vo, 0, 1),
                E = b - 1;
              return b <= 0 ? 0 : 1 + 2.4 * E * E * E + 1.4 * E * E;
            },
            Ro = p(w(mt.swell, Ke.swell), 0, 10) / 10,
            Ar = p(w(mt.reach, Ke.reach), 0, 10),
            Mr = Pe * Ne * (0.03 + 0.014 * Ar),
            un = T.squash * 0.07;
          Ee = 0;
          for (let o = 0; o < Le; o++) {
            let b = Math.PI / 2 + (xe * o) / Le,
              E = Math.cos(b),
              A = Math.sin(b),
              x = Math.min(o, Le - o),
              P = To(x);
            if (P <= 0.001) continue;
            let O = 1 + ma * rt[o],
              Z = P * O,
              Y = Math.cos(ln),
              He = Math.sin(ln),
              Ie = E * Y,
              Ue = A * Y,
              Oe = He,
              Bo = Math.cos(xo),
              mn = Math.sin(xo),
              bn = -A * Bo - E * He * mn,
              En = E * Bo - A * He * mn,
              wn = Y * mn,
              Fo = an * Z * (1 - un),
              Co = zr + 2 * an * Rn,
              xn = Fo * (1 - 2 * Rn),
              Po = E * Co + Ie * xn,
              No = A * Co + Ue * xn,
              Io = Oe * xn + cn;
            Ct(
              Po,
              No,
              Io,
              Ie,
              Ue,
              Oe,
              bn,
              En,
              wn,
              Fo,
              Rr * Z * (1 + un),
              Ut * Z * (1 + un),
              qr,
            );
            let Lr = Ue * wn - Oe * En,
              Sr = Oe * bn - Ie * wn,
              Dr = Ie * En - Ue * bn;
            ((pe[o * 3] = Po + Lr * Ut),
              (pe[o * 3 + 1] = No + Sr * Ut),
              (pe[o * 3 + 2] = Io + Dr * Ut));
          }
          let Ot = Math.round(p(w(_.ribs, q.ribs), 0, 24)),
            fn = p($r + Jr * sn, 0, 89) * K;
          for (let o = 0; o < Ot; o++) {
            let b = Math.PI / 2 + (xe * (o + 0.5)) / Ot,
              E = Math.cos(b),
              A = Math.sin(b),
              x = To(Le / 2 + Math.min(o, Ot - o) * (Le / Math.max(Ot, 1)));
            if (x <= 0.001) continue;
            let P = -E * Math.cos(fn),
              O = -A * Math.cos(fn),
              Z = Math.sin(fn),
              Y = Kr * x;
            Ct(
              E * ko + P * Y,
              A * ko + O * Y,
              Z * Y + cn,
              P,
              O,
              Z,
              -A,
              E,
              0,
              Y,
              Wo * x,
              Wo * x,
            );
          }
          (Ct(0, 0, Et, 1, 0, 0, 0, 1, 0, Ho, Ho, Qr),
            Ct(0, 0, ea + cn, 1, 0, 0, 0, 1, 0, Xo, Xo, ta));
          let dn = -sn * p(w(_.nodAngle, q.nodAngle), 0, 60) * K;
          if (dn !== 0) {
            let o = Math.cos(dn),
              b = Math.sin(dn);
            for (let E = 0; E < Ee; E++) {
              let A = E * 12;
              for (let x = 0; x < 4; x++) {
                let P = D[A + x * 3 + 1],
                  O = D[A + x * 3 + 2] - (x === 0 ? Et : 0);
                ((D[A + x * 3 + 1] = o * P - b * O),
                  (D[A + x * 3 + 2] = b * P + o * O + (x === 0 ? Et : 0)));
              }
            }
            for (let E = 0; E < Le; E++) {
              let A = pe[E * 3 + 1],
                x = pe[E * 3 + 2] - Et;
              ((pe[E * 3 + 1] = o * A - b * x),
                (pe[E * 3 + 2] = b * A + o * x + Et));
            }
          }
          for (let o = 0; o < 24; o++) at[o] = 0;
          if (Qt && Ro > 0 && $.has)
            for (let o = 0; o < Le; o++) {
              if (!ir(pe[o * 3], pe[o * 3 + 1], pe[o * 3 + 2])) continue;
              let b = Math.hypot($.x - ht.x, $.y - ht.y);
              at[o] = Math.exp(-((b / Mr) ** 2)) * Ro;
            }
          for (let o = 0; o < 24; o++)
            h
              ? ((rt[o] = at[o]), (Lt[o] = 0))
              : (Jt(rt[o], Lt[o], at[o], 0.14, e, Re),
                (rt[o] = Re[0]),
                (Lt[o] = Re[1]));
          if (v.tap) {
            v.tap = !1;
            let o = h ? 0 : p(w(mt.bounce, Ke.bounce), 0, 10) / 10;
            if (o > 0 && $.has) {
              let b = $.x - en,
                E = $.y - tn,
                A = (u.c * b - u.s * E) / (0.5 * Pe * Ne),
                x = (u.s * b + u.c * E) / (0.5 * Pe * Ne),
                P = Math.hypot(A, x);
              if (P < 1.4) {
                let O = P > 0.001 ? A / P : 0,
                  Z = P > 0.001 ? x / P : 0;
                ((T.vx += O * Ko * o), (T.vy -= Z * Ko * o), (T.at = 0));
              }
            }
          }
          let Ao = (Dn ? ha : da) / vt;
          nt.fill(0);
          for (let o = 0; o < Ee; o++) {
            let b = o * 12,
              E = V[6] * D[b] + V[7] * D[b + 1] + V[8] * D[b + 2] - u.d,
              A = Math.max(
                Math.hypot(D[b + 3], D[b + 4], D[b + 5]),
                Math.hypot(D[b + 6], D[b + 7], D[b + 8]),
                Math.hypot(D[b + 9], D[b + 10], D[b + 11]),
              ),
              x = (u.f * G * A) / Math.max(Je, -E - A),
              P = Math.PI * Math.sqrt(x / (2 * Ao)),
              O = 0;
            for (; O < ue.length - 1 && ue[O][0] < P;) O++;
            ((Nn[o] = O), nt[O]++);
          }
          let Mo = 0;
          for (let o = 0; o < ue.length; o++) ((zt[o] = Mo), (Mo += nt[o]));
          In.set(zt);
          for (let o = 0; o < Ee; o++) {
            let b = o * 12,
              A = In[Nn[o]]++ * 16;
            for (let x = 0; x < 4; x++) {
              let P = D[b + x * 3],
                O = D[b + x * 3 + 1],
                Z = D[b + x * 3 + 2];
              ((tt[A + x * 4] = V[0] * P + V[1] * O + V[2] * Z),
                (tt[A + x * 4 + 1] = V[3] * P + V[4] * O + V[5] * Z),
                (tt[A + x * 4 + 2] =
                  V[6] * P + V[7] * O + V[8] * Z - (x === 0 ? u.d : 0)),
                (tt[A + x * 4 + 3] = x === 0 ? Pn[o] : 0));
            }
          }
          let hn = y.stem,
            Vt = hn.show !== !1,
            pn = p(w(hn.curve, _n.curve), 0, 300) / 100;
          Vt && pn !== Xt && ((Xt = pn), ga(pn, Tt, Fn, Cn));
          let Lo = (ua * p(w(hn.thickness, _n.thickness), 20, 300)) / 100,
            We = 0;
          if (Vt) {
            for (let E = 0; E < oe; E++) {
              let A = E * 3,
                x = E * 12,
                P = Tt[A],
                O = Tt[A + 1],
                Z = Tt[A + 2];
              ((_e[x] = W[0] * P + W[1] * O + W[2] * Z),
                (_e[x + 1] = W[3] * P + W[4] * O + W[5] * Z),
                (_e[x + 2] = W[6] * P + W[7] * O + W[8] * Z - u.d),
                (_e[x + 3] = Lo));
              for (let Y = 0; Y < 2; Y++) {
                let He = Y === 0 ? Fn : Cn,
                  Ie = He[A],
                  Ue = He[A + 1],
                  Oe = He[A + 2];
                ((_e[x + 4 + Y * 4] = W[0] * Ie + W[1] * Ue + W[2] * Oe),
                  (_e[x + 5 + Y * 4] = W[3] * Ie + W[4] * Ue + W[5] * Oe),
                  (_e[x + 6 + Y * 4] = W[6] * Ie + W[7] * Ue + W[8] * Oe),
                  (_e[x + 7 + Y * 4] = 0));
              }
            }
            let o = (u.f * G * Lo) / (u.d - 3),
              b = Math.PI * Math.sqrt(o / (2 * Ao));
            for (We = 0; We < wt.length - 1 && wt[We] < b;) We++;
          }
          let Gt = y.colors,
            So = Gt === Ht ? _t : JSON.stringify(Gt);
          ((Ht = Gt),
            So !== _t &&
              ((_t = So),
              xa(Gt, Bn),
              r.bindTexture(r.TEXTURE_2D, Qe),
              r.texSubImage2D(
                r.TEXTURE_2D,
                0,
                0,
                0,
                Xe,
                1,
                r.RGBA,
                r.UNSIGNED_BYTE,
                Bn,
              ),
              r.generateMipmap(r.TEXTURE_2D)),
            r.bindFramebuffer(r.FRAMEBUFFER, null),
            r.viewport(0, 0, ze, et),
            r.disable(r.BLEND),
            r.enable(r.DEPTH_TEST),
            r.depthFunc(r.LEQUAL),
            r.depthMask(!0),
            r.enable(r.CULL_FACE),
            r.cullFace(r.BACK),
            r.clearColor(0, 0, 0, 0),
            r.clearDepth(1),
            r.clear(r.COLOR_BUFFER_BIT | r.DEPTH_BUFFER_BIT),
            r.bindVertexArray(ve),
            r.activeTexture(r.TEXTURE0),
            r.bindTexture(r.TEXTURE_2D, xt),
            Ee > 0 &&
              r.texSubImage2D(
                r.TEXTURE_2D,
                0,
                0,
                0,
                4,
                Ee,
                r.RGBA,
                r.FLOAT,
                tt,
                0,
              ),
            r.activeTexture(r.TEXTURE1),
            r.bindTexture(r.TEXTURE_2D, yt),
            Vt &&
              r.texSubImage2D(
                r.TEXTURE_2D,
                0,
                0,
                0,
                3,
                oe,
                r.RGBA,
                r.FLOAT,
                _e,
                0,
              ),
            r.activeTexture(r.TEXTURE2),
            r.bindTexture(r.TEXTURE_2D, Qe));
          for (let o of [F.ell, F.stem])
            (r.useProgram(o.p),
              B.i1(o, o === F.ell ? "uData" : "uStem", o === F.ell ? 0 : 1),
              B.i1(o, "uPal", 2),
              B.f2(o, "uCenter", u.cx * G, (Fe - u.cy) * G),
              B.f2(o, "uRes", ze, et),
              B.f1(o, "uFocal", u.f * G),
              B.f2(o, "uRoll", u.c, u.s),
              B.f2(o, "uShift", u.sx * G, u.sy * G),
              B.f3(o, "uG", mr, br, Er),
              B.f1(o, "uPhase", o === F.ell ? Eo + gr : Eo),
              B.f3(o, "uHead", wr, xr, yr),
              B.f1(o, "uGrain", p(w(y.grain, Vr), 0, 10) * pa),
              B.f1(o, "uGrainPx", G),
              B.i1(o, "uSeed", jt));
          r.useProgram(F.ell.p);
          for (let o = 0; o < ue.length; o++)
            nt[o] !== 0 &&
              (B.i1(F.ell, "uBase", zt[o]),
              B.i1(F.ell, "uLon", ue[o][0]),
              B.i1(F.ell, "uLat", ue[o][1]),
              r.drawElementsInstanced(
                r.TRIANGLES,
                Be[o][1],
                r.UNSIGNED_INT,
                Be[o][0],
                nt[o],
              ));
          (Vt &&
            (r.useProgram(F.stem.p),
            B.i1(F.stem, "uRound", wt[We]),
            r.drawElements(r.TRIANGLES, Ve[We][1], r.UNSIGNED_INT, Ve[We][0])),
            r.bindVertexArray(null));
          let Do =
            Qt &&
            w(mt.bounce, Ke.bounce) > 0 &&
            Math.hypot($.x - en, $.y - tn) < 0.3 * Pe * Ne
              ? "pointer"
              : "";
          (S.style.cursor !== Do && (S.style.cursor = Do),
            ot && !je && Mt > _o + go * (Le + 2) + vo && (je = !0));
        };
      return (
        be(),
        () => {
          (io(),
            (le.current = () => {}),
            Hn.disconnect(),
            Xn?.disconnect(),
            document.removeEventListener("visibilitychange", zn),
            k.removeEventListener("webglcontextlost", jn),
            k.removeEventListener("webglcontextrestored", Zn),
            S.removeEventListener("pointermove", lt),
            S.removeEventListener("pointerenter", lt),
            S.removeEventListener("pointerleave", Yn),
            S.removeEventListener("pointerdown", qn),
            window.removeEventListener("pointerup", Bt),
            window.removeEventListener("pointercancel", Bt),
            window.removeEventListener("scroll", Kn, { capture: !0 }),
            ar());
        }
      );
    }, []),
    vn("div", {
      ref: de,
      style: {
        ...ge,
        position: "relative",
        width: "100%",
        height: "100%",
        aspectRatio: "720 / 1280",
        overflow: "hidden",
        background: s,
        touchAction: "pan-y",
        userSelect: "none",
        WebkitUserSelect: "none",
      },
      children: vn("canvas", {
        ref: he,
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        },
      }),
    })
  );
}
Oo(rr, {
  background: {
    type: f.Color,
    title: "Background",
    defaultValue: "#000000",
    description: "Behind the flower.",
  },
  colors: {
    type: f.Array,
    title: "Colors",
    description:
      "The colour loop the bands run through, in order; the last colour blends back into the first.",
    control: {
      type: f.Object,
      controls: {
        color: {
          type: f.Color,
          title: "Color",
          defaultValue: [
            { color: "#479413", width: 9.4 },
            { color: "#6A9644", width: 6.2 },
            { color: "#CEACB7", width: 3.1 },
            { color: "#F3ABCE", width: 14.8 },
            { color: "#FB3B66", width: 2.3 },
            { color: "#EA0444", width: 4.7 },
            { color: "#842643", width: 2.3 },
            { color: "#1A1B2C", width: 6.3 },
            { color: "#243A86", width: 10.2 },
            { color: "#3955DA", width: 12.5 },
            { color: "#698AFD", width: 4.7 },
            { color: "#B2BCE4", width: 0.8 },
            { color: "#E7D4CA", width: 22.7 },
          ],
        },
        width: {
          type: f.Number,
          title: "Width",
          min: 0.1,
          max: 50,
          step: 0.1,
          unit: "%",
          defaultValue: [
            { color: "#479413", width: 9.4 },
            { color: "#6A9644", width: 6.2 },
            { color: "#CEACB7", width: 3.1 },
            { color: "#F3ABCE", width: 14.8 },
            { color: "#FB3B66", width: 2.3 },
            { color: "#EA0444", width: 4.7 },
            { color: "#842643", width: 2.3 },
            { color: "#1A1B2C", width: 6.3 },
            { color: "#243A86", width: 10.2 },
            { color: "#3955DA", width: 12.5 },
            { color: "#698AFD", width: 4.7 },
            { color: "#B2BCE4", width: 0.8 },
            { color: "#E7D4CA", width: 22.7 },
          ],
          description:
            "Share of the loop this colour takes before it blends into the next.",
        },
      },
    },
    defaultValue: [
      { color: "#479413", width: 9.4 },
      { color: "#6A9644", width: 6.2 },
      { color: "#CEACB7", width: 3.1 },
      { color: "#F3ABCE", width: 14.8 },
      { color: "#FB3B66", width: 2.3 },
      { color: "#EA0444", width: 4.7 },
      { color: "#842643", width: 2.3 },
      { color: "#1A1B2C", width: 6.3 },
      { color: "#243A86", width: 10.2 },
      { color: "#3955DA", width: 12.5 },
      { color: "#698AFD", width: 4.7 },
      { color: "#B2BCE4", width: 0.8 },
      { color: "#E7D4CA", width: 22.7 },
    ],
  },
  petals: {
    type: f.Number,
    title: "Petals",
    min: 6,
    max: 24,
    step: 1,
    displayStepper: !0,
    defaultValue: 22,
    description: "Petals in the outer ring.",
  },
  stem: {
    type: f.Object,
    title: "Stem",
    controls: {
      show: {
        type: f.Boolean,
        title: "Show",
        defaultValue: !0,
        enabledTitle: "On",
        disabledTitle: "Off",
        description: "Off leaves the head floating.",
      },
      curve: {
        type: f.Number,
        title: "Curve",
        min: 0,
        max: 300,
        step: 1,
        unit: "%",
        defaultValue: 100,
        hidden: (n) => n.show === !1,
        description: "How deep the stem's S-bends are. 0 is a straight stem.",
      },
      thickness: {
        type: f.Number,
        title: "Thickness",
        min: 20,
        max: 300,
        step: 1,
        unit: "%",
        defaultValue: 100,
        hidden: (n) => n.show === !1,
        description: "Thickness of the stem.",
      },
    },
  },
  petalLength: {
    type: f.Number,
    title: "Petal Length",
    min: 40,
    max: 200,
    step: 1,
    unit: "%",
    defaultValue: 200,
    description: "Length of each petal from the throat outward.",
  },
  petalWidth: {
    type: f.Number,
    title: "Petal Width",
    min: 30,
    max: 250,
    step: 1,
    unit: "%",
    defaultValue: 100,
    description:
      "Width across the ring. 100 overlaps the petals as in the clip at any count.",
  },
  puff: {
    type: f.Number,
    title: "Puff",
    min: 20,
    max: 250,
    step: 1,
    unit: "%",
    defaultValue: 134,
    description: "How fat the petals are blown.",
  },
  bands: {
    type: f.Number,
    title: "Bands",
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 5,
    description:
      "How many colour bands span the flower. 5 is the clip; each step of 2.5 doubles them.",
  },
  grain: {
    type: f.Number,
    title: "Grain",
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 0,
    description:
      "Fine film grain over the flower, one grain per pixel; the Background stays clean. 0 = off.",
  },
  scale: {
    type: f.Number,
    title: "Scale",
    min: 30,
    max: 100,
    step: 1,
    unit: "%",
    defaultValue: 100,
    description: "Size of the flower in the frame. 100 is the clip's framing.",
  },
  placement: {
    type: f.Object,
    title: "Placement",
    controls: {
      x: {
        type: f.Number,
        title: "X Offset",
        unit: "%",
        min: -50,
        max: 50,
        step: 0.5,
        defaultValue: 0,
        description: "Moves the flower across the frame. Positive is right.",
      },
      y: {
        type: f.Number,
        title: "Y Offset",
        unit: "%",
        min: -50,
        max: 50,
        step: 0.5,
        defaultValue: 0,
        description: "Moves the flower down the frame. Positive is down.",
      },
      angle: {
        type: f.Number,
        title: "Angle",
        unit: "\xB0",
        min: -180,
        max: 180,
        step: 1,
        defaultValue: 0,
        description:
          "Turns the flower in the picture about the frame's centre. Positive is clockwise.",
      },
      tilt: {
        type: f.Number,
        title: "Tilt",
        unit: "\xB0",
        min: -60,
        max: 60,
        step: 1,
        defaultValue: 0,
        description:
          "Leans the flower about the horizontal axis. Positive tips its top away from you; the bands lean with it.",
      },
    },
  },
  entrance: {
    type: f.Object,
    title: "Entrance",
    controls: {
      stagger: {
        type: f.Number,
        title: "Stagger",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        hidden: (n) => n.animate === !1,
        description:
          "Gap between one petal and the next as the bloom runs round the ring from the top.",
      },
      delay: {
        type: f.Number,
        title: "Delay",
        min: 0,
        max: 5,
        step: 0.1,
        unit: "s",
        defaultValue: 0,
        hidden: (n) => n.animate === !1,
        description: "Wait before the bloom.",
      },
      animate: {
        type: f.Boolean,
        title: "Animate",
        defaultValue: !1,
        enabledTitle: "On",
        disabledTitle: "Off",
        description:
          "Petals inflate round the ring when the flower first appears.",
      },
    },
  },
  response: {
    type: f.Object,
    title: "Response",
    controls: {
      reach: {
        type: f.Number,
        title: "Reach",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description: "How far round the pointer petals swell.",
      },
      swell: {
        type: f.Number,
        title: "Swell",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description: "Petals under the pointer blow up a little. 0 = off.",
      },
      follow: {
        type: f.Number,
        title: "Follow",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "The flower turns to look at the pointer, sliding the bands over itself. 0 = off.",
      },
      bounce: {
        type: f.Number,
        title: "Bounce",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "A tap on the head knocks it away from your finger and it bobs back, petals jiggling. 0 = off.",
      },
    },
  },
  motion: {
    type: f.Object,
    title: "Motion",
    controls: {
      sway: {
        type: f.Number,
        title: "Sway",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "How far the flower turns left and right, once per loop. 0 holds it square to you.",
      },
      breathe: {
        type: f.Number,
        title: "Breathe",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "How far the petals open and close, eight times per loop, in step with the colours. 0 = off.",
      },
      speed: {
        type: f.Number,
        title: "Speed",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "Pace of everything together. 5 = the clip's 14 s loop; each step of 2.5 doubles it. 0 freezes it.",
      },
      flow: {
        type: f.Number,
        title: "Flow",
        min: -10,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "How fast the colours run along the bands. 5 = eight times round per loop, as in the clip; negative runs them the other way; 0 holds them.",
      },
      pulse: {
        type: f.Number,
        title: "Pulse",
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 5,
        description:
          "How much the bands breathe wider and tighter, six times per loop. 0 = off.",
      },
    },
  },
  advanced: {
    type: f.Object,
    title: "Advanced",
    description: "The numbers behind the look. Defaults are the clip.",
    controls: {
      lean: {
        type: f.Number,
        title: "Rest Lean",
        min: -90,
        max: 90,
        step: 1,
        unit: "\xB0",
        defaultValue: 48,
        description:
          "How far the flower leans back to face up at you when it is not swaying.",
      },
      bandAxis: {
        type: f.Number,
        title: "Band Axis",
        min: -90,
        max: 90,
        step: 1,
        unit: "\xB0",
        defaultValue: 48,
        description:
          "Direction the bands are laid along, up from the line of sight. Equal to Rest Lean they run along the resting flower's axis; 0 makes them depth from the camera.",
      },
      lens: {
        type: f.Number,
        title: "Lens",
        min: 2,
        max: 60,
        step: 1,
        unit: "\xB0",
        defaultValue: 12,
        description:
          "Field of view across the composition's height. Lower flattens the perspective.",
      },
      cup: {
        type: f.Number,
        title: "Cup",
        min: -60,
        max: 60,
        step: 1,
        unit: "\xB0",
        defaultValue: 25,
        description:
          "The angle the petals swing about on their hinges: higher closes the flower toward a tulip, negative opens it into an umbrella. Breathing swings them either side of it.",
      },
      twist: {
        type: f.Number,
        title: "Twist",
        min: -60,
        max: 60,
        step: 1,
        unit: "\xB0",
        defaultValue: 0,
        description:
          "Rolls every petal about its own length so each one laps over the next.",
      },
      ribs: {
        type: f.Number,
        title: "Inner Capsules",
        min: 0,
        max: 24,
        step: 1,
        defaultValue: 10,
        description:
          "Little balloons round the throat: upright beads when the flower closes, a star over the centre when it opens. 0 leaves the throat bare.",
      },
      swayYaw: {
        type: f.Number,
        title: "Turn",
        min: 0,
        max: 90,
        step: 1,
        unit: "\xB0",
        defaultValue: 29,
        description: "How far the flower turns each way at Sway 5.",
      },
      nodAngle: {
        type: f.Number,
        title: "Nod Angle",
        min: 0,
        max: 60,
        step: 0.5,
        unit: "\xB0",
        defaultValue: q.nodAngle,
        description:
          "How far the head tips its face up as the petals close (and toward you as they open), about the neck, at Breathe 5.",
      },
      breatheAngle: {
        type: f.Number,
        title: "Breathe Angle",
        min: 0,
        max: 80,
        step: 0.5,
        unit: "\xB0",
        defaultValue: 35,
        description:
          "How far the petals lift and fall each way about Cup at Breathe 5.",
      },
      swayPeriod: {
        type: f.Number,
        title: "Loop",
        min: 1,
        max: 120,
        step: 0.5,
        unit: "s",
        defaultValue: 14,
        description:
          "Length of the whole loop at Speed 5: one turn, eight breaths, eight colour flows, six pulses.",
      },
      pulseDepth: {
        type: f.Number,
        title: "Pulse Depth",
        min: 0,
        max: 90,
        step: 1,
        unit: "%",
        defaultValue: 36,
        description: "How far the band spacing swings either way at Pulse 5.",
      },
      phase: {
        type: f.Number,
        title: "Phase",
        min: 0,
        max: 100,
        step: 0.5,
        unit: "%",
        defaultValue: 60,
        description: "Where in the colour loop the head's centre starts.",
      },
      bloomTime: {
        type: f.Number,
        title: "Bloom Time",
        min: 0.1,
        max: 5,
        step: 0.05,
        unit: "s",
        defaultValue: 0.9,
        description: "How long each petal takes to inflate in the entrance.",
      },
      followEase: {
        type: f.Number,
        title: "Follow Ease",
        min: 0.02,
        max: 3,
        step: 0.01,
        unit: "s",
        defaultValue: 0.3,
        description:
          "Time the flower takes to settle into its turn toward the pointer.",
      },
    },
  },
});
export { rr as default };
