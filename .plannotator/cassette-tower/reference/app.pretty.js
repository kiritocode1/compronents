(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      (t.credentials =
        e.crossOrigin === `use-credentials`
          ? `include`
          : e.crossOrigin === `anonymous`
            ? `omit`
            : `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var e = (e) => {
  let t = new Set();
  do for (let n of Reflect.ownKeys(e)) t.add([e, n]);
  while ((e = Reflect.getPrototypeOf(e)) && e !== Object.prototype);
  return t;
};
function t(t, { include: n, exclude: r } = {}) {
  let i = (e) => {
    let t = (t) => (typeof t == `string` ? e === t : t.test(e));
    return n ? n.some(t) : !r || !r.some(t);
  };
  for (let [n, r] of e(t.constructor.prototype)) {
    if (r === `constructor` || !i(r)) continue;
    let e = Reflect.getOwnPropertyDescriptor(n, r);
    e && typeof e.value == `function` && (t[r] = t[r].bind(t));
  }
  return t;
}
function n(e, t) {
  return class extends e {
    constructor(...e) {
      super(...e), t(this);
    }
  };
}
var r = n(Array, (e) => e.fill(0)),
  i = 1e-6;
function a(e) {
  function t(t = 0, n = 0) {
    let r = new e(2);
    return t !== void 0 && ((r[0] = t), n !== void 0 && (r[1] = n)), r;
  }
  let n = t;
  function r(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t), (i[1] = n), i;
  }
  function a(t, n) {
    let r = n ?? new e(2);
    return (r[0] = Math.ceil(t[0])), (r[1] = Math.ceil(t[1])), r;
  }
  function o(t, n) {
    let r = n ?? new e(2);
    return (r[0] = Math.floor(t[0])), (r[1] = Math.floor(t[1])), r;
  }
  function s(t, n) {
    let r = n ?? new e(2);
    return (r[0] = Math.round(t[0])), (r[1] = Math.round(t[1])), r;
  }
  function c(t, n = 0, r = 1, i) {
    let a = i ?? new e(2);
    return (
      (a[0] = Math.min(r, Math.max(n, t[0]))),
      (a[1] = Math.min(r, Math.max(n, t[1]))),
      a
    );
  }
  function l(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t[0] + n[0]), (i[1] = t[1] + n[1]), i;
  }
  function u(t, n, r, i) {
    let a = i ?? new e(2);
    return (a[0] = t[0] + n[0] * r), (a[1] = t[1] + n[1] * r), a;
  }
  function d(e, t) {
    let n = e[0],
      r = e[1],
      i = t[0],
      a = t[1],
      o = Math.sqrt(n * n + r * r) * Math.sqrt(i * i + a * a),
      s = o && E(e, t) / o;
    return Math.acos(s);
  }
  function f(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t[0] - n[0]), (i[1] = t[1] - n[1]), i;
  }
  let p = f;
  function m(e, t) {
    return Math.abs(e[0] - t[0]) < i && Math.abs(e[1] - t[1]) < i;
  }
  function h(e, t) {
    return e[0] === t[0] && e[1] === t[1];
  }
  function g(t, n, r, i) {
    let a = i ?? new e(2);
    return (
      (a[0] = t[0] + r * (n[0] - t[0])), (a[1] = t[1] + r * (n[1] - t[1])), a
    );
  }
  function _(t, n, r, i) {
    let a = i ?? new e(2);
    return (
      (a[0] = t[0] + r[0] * (n[0] - t[0])),
      (a[1] = t[1] + r[1] * (n[1] - t[1])),
      a
    );
  }
  function v(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = Math.max(t[0], n[0])), (i[1] = Math.max(t[1], n[1])), i;
  }
  function y(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = Math.min(t[0], n[0])), (i[1] = Math.min(t[1], n[1])), i;
  }
  function b(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t[0] * n), (i[1] = t[1] * n), i;
  }
  let x = b;
  function S(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t[0] / n), (i[1] = t[1] / n), i;
  }
  function C(t, n) {
    let r = n ?? new e(2);
    return (r[0] = 1 / t[0]), (r[1] = 1 / t[1]), r;
  }
  let w = C;
  function T(t, n, r) {
    let i = r ?? new e(3),
      a = t[0] * n[1] - t[1] * n[0];
    return (i[0] = 0), (i[1] = 0), (i[2] = a), i;
  }
  function E(e, t) {
    return e[0] * t[0] + e[1] * t[1];
  }
  function D(e) {
    let t = e[0],
      n = e[1];
    return Math.sqrt(t * t + n * n);
  }
  let O = D;
  function k(e) {
    let t = e[0],
      n = e[1];
    return t * t + n * n;
  }
  let ee = k;
  function A(e, t) {
    let n = e[0] - t[0],
      r = e[1] - t[1];
    return Math.sqrt(n * n + r * r);
  }
  let te = A;
  function j(e, t) {
    let n = e[0] - t[0],
      r = e[1] - t[1];
    return n * n + r * r;
  }
  let M = j;
  function N(t, n) {
    let r = n ?? new e(2),
      i = t[0],
      a = t[1],
      o = i * i + a * a,
      s = o > 0 ? 1 / Math.sqrt(o) : 1;
    return (r[0] = i * s), (r[1] = a * s), r;
  }
  function ne(t, n) {
    let r = n ?? new e(2);
    return (r[0] = -t[0]), (r[1] = -t[1]), r;
  }
  function re(t, n) {
    let r = n ?? new e(2);
    return (r[0] = t[0]), (r[1] = t[1]), r;
  }
  let ie = re;
  function ae(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t[0] * n[0]), (i[1] = t[1] * n[1]), i;
  }
  let oe = ae;
  function se(t, n, r) {
    let i = r ?? new e(2);
    return (i[0] = t[0] / n[0]), (i[1] = t[1] / n[1]), i;
  }
  let ce = se;
  function le(t = 1, n) {
    let r = n ?? new e(2),
      i = Math.random() * 2 * Math.PI;
    return (r[0] = Math.cos(i) * t), (r[1] = Math.sin(i) * t), r;
  }
  function ue(t) {
    let n = t ?? new e(2);
    return (n[0] = 0), (n[1] = 0), n;
  }
  function de(t, n, r) {
    let i = r ?? new e(2),
      a = t[0],
      o = t[1];
    return (
      (i[0] = a * n[0] + o * n[4] + n[12]),
      (i[1] = a * n[1] + o * n[5] + n[13]),
      i
    );
  }
  function fe(t, n, r) {
    let i = r ?? new e(2),
      a = t[0],
      o = t[1];
    return (
      (i[0] = n[0] * a + n[4] * o + n[8]),
      (i[1] = n[1] * a + n[5] * o + n[9]),
      i
    );
  }
  function pe(t, n, r, i) {
    let a = i ?? new e(2),
      o = t[0] - n[0],
      s = t[1] - n[1],
      c = Math.sin(r),
      l = Math.cos(r);
    return (a[0] = o * l - s * c + n[0]), (a[1] = o * c + s * l + n[1]), a;
  }
  function P(t, n, r) {
    let i = r ?? new e(2);
    return N(t, i), b(i, n, i);
  }
  function me(t, n, r) {
    let i = r ?? new e(2);
    return D(t) > n ? P(t, n, i) : re(t, i);
  }
  function he(t, n, r) {
    return g(t, n, 0.5, r ?? new e(2));
  }
  return {
    create: t,
    fromValues: n,
    set: r,
    ceil: a,
    floor: o,
    round: s,
    clamp: c,
    add: l,
    addScaled: u,
    angle: d,
    subtract: f,
    sub: p,
    equalsApproximately: m,
    equals: h,
    lerp: g,
    lerpV: _,
    max: v,
    min: y,
    mulScalar: b,
    scale: x,
    divScalar: S,
    inverse: C,
    invert: w,
    cross: T,
    dot: E,
    length: D,
    len: O,
    lengthSq: k,
    lenSq: ee,
    distance: A,
    dist: te,
    distanceSq: j,
    distSq: M,
    normalize: N,
    negate: ne,
    copy: re,
    clone: ie,
    multiply: ae,
    mul: oe,
    divide: se,
    div: ce,
    random: le,
    zero: ue,
    transformMat4: de,
    transformMat3: fe,
    rotate: pe,
    setLength: P,
    truncate: me,
    midpoint: he,
  };
}
var o = new Map();
function s(e) {
  let t = o.get(e);
  return t || ((t = a(e)), o.set(e, t)), t;
}
function c(e) {
  function t(t, n, r) {
    let i = new e(3);
    return (
      t !== void 0 &&
        ((i[0] = t), n !== void 0 && ((i[1] = n), r !== void 0 && (i[2] = r))),
      i
    );
  }
  let n = t;
  function r(t, n, r, i) {
    let a = i ?? new e(3);
    return (a[0] = t), (a[1] = n), (a[2] = r), a;
  }
  function a(t, n) {
    let r = n ?? new e(3);
    return (
      (r[0] = Math.ceil(t[0])),
      (r[1] = Math.ceil(t[1])),
      (r[2] = Math.ceil(t[2])),
      r
    );
  }
  function o(t, n) {
    let r = n ?? new e(3);
    return (
      (r[0] = Math.floor(t[0])),
      (r[1] = Math.floor(t[1])),
      (r[2] = Math.floor(t[2])),
      r
    );
  }
  function s(t, n) {
    let r = n ?? new e(3);
    return (
      (r[0] = Math.round(t[0])),
      (r[1] = Math.round(t[1])),
      (r[2] = Math.round(t[2])),
      r
    );
  }
  function c(t, n = 0, r = 1, i) {
    let a = i ?? new e(3);
    return (
      (a[0] = Math.min(r, Math.max(n, t[0]))),
      (a[1] = Math.min(r, Math.max(n, t[1]))),
      (a[2] = Math.min(r, Math.max(n, t[2]))),
      a
    );
  }
  function l(t, n, r) {
    let i = r ?? new e(3);
    return (i[0] = t[0] + n[0]), (i[1] = t[1] + n[1]), (i[2] = t[2] + n[2]), i;
  }
  function u(t, n, r, i) {
    let a = i ?? new e(3);
    return (
      (a[0] = t[0] + n[0] * r),
      (a[1] = t[1] + n[1] * r),
      (a[2] = t[2] + n[2] * r),
      a
    );
  }
  function d(e, t) {
    let n = e[0],
      r = e[1],
      i = e[2],
      a = t[0],
      o = t[1],
      s = t[2],
      c = Math.sqrt(n * n + r * r + i * i) * Math.sqrt(a * a + o * o + s * s),
      l = c && E(e, t) / c;
    return Math.acos(l);
  }
  function f(t, n, r) {
    let i = r ?? new e(3);
    return (i[0] = t[0] - n[0]), (i[1] = t[1] - n[1]), (i[2] = t[2] - n[2]), i;
  }
  let p = f;
  function m(e, t) {
    return (
      Math.abs(e[0] - t[0]) < i &&
      Math.abs(e[1] - t[1]) < i &&
      Math.abs(e[2] - t[2]) < i
    );
  }
  function h(e, t) {
    return e[0] === t[0] && e[1] === t[1] && e[2] === t[2];
  }
  function g(t, n, r, i) {
    let a = i ?? new e(3);
    return (
      (a[0] = t[0] + r * (n[0] - t[0])),
      (a[1] = t[1] + r * (n[1] - t[1])),
      (a[2] = t[2] + r * (n[2] - t[2])),
      a
    );
  }
  function _(t, n, r, i) {
    let a = i ?? new e(3);
    return (
      (a[0] = t[0] + r[0] * (n[0] - t[0])),
      (a[1] = t[1] + r[1] * (n[1] - t[1])),
      (a[2] = t[2] + r[2] * (n[2] - t[2])),
      a
    );
  }
  function v(t, n, r) {
    let i = r ?? new e(3);
    return (
      (i[0] = Math.max(t[0], n[0])),
      (i[1] = Math.max(t[1], n[1])),
      (i[2] = Math.max(t[2], n[2])),
      i
    );
  }
  function y(t, n, r) {
    let i = r ?? new e(3);
    return (
      (i[0] = Math.min(t[0], n[0])),
      (i[1] = Math.min(t[1], n[1])),
      (i[2] = Math.min(t[2], n[2])),
      i
    );
  }
  function b(t, n, r) {
    let i = r ?? new e(3);
    return (i[0] = t[0] * n), (i[1] = t[1] * n), (i[2] = t[2] * n), i;
  }
  let x = b;
  function S(t, n, r) {
    let i = r ?? new e(3);
    return (i[0] = t[0] / n), (i[1] = t[1] / n), (i[2] = t[2] / n), i;
  }
  function C(t, n) {
    let r = n ?? new e(3);
    return (r[0] = 1 / t[0]), (r[1] = 1 / t[1]), (r[2] = 1 / t[2]), r;
  }
  let w = C;
  function T(t, n, r) {
    let i = r ?? new e(3),
      a = t[2] * n[0] - t[0] * n[2],
      o = t[0] * n[1] - t[1] * n[0];
    return (i[0] = t[1] * n[2] - t[2] * n[1]), (i[1] = a), (i[2] = o), i;
  }
  function E(e, t) {
    return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
  }
  function D(e) {
    let t = e[0],
      n = e[1],
      r = e[2];
    return Math.sqrt(t * t + n * n + r * r);
  }
  let O = D;
  function k(e) {
    let t = e[0],
      n = e[1],
      r = e[2];
    return t * t + n * n + r * r;
  }
  let ee = k;
  function A(e, t) {
    let n = e[0] - t[0],
      r = e[1] - t[1],
      i = e[2] - t[2];
    return Math.sqrt(n * n + r * r + i * i);
  }
  let te = A;
  function j(e, t) {
    let n = e[0] - t[0],
      r = e[1] - t[1],
      i = e[2] - t[2];
    return n * n + r * r + i * i;
  }
  let M = j;
  function N(t, n) {
    let r = n ?? new e(3),
      i = t[0],
      a = t[1],
      o = t[2],
      s = i * i + a * a + o * o,
      c = s > 0 ? 1 / Math.sqrt(s) : 1;
    return (r[0] = i * c), (r[1] = a * c), (r[2] = o * c), r;
  }
  function ne(t, n) {
    let r = n ?? new e(3);
    return (r[0] = -t[0]), (r[1] = -t[1]), (r[2] = -t[2]), r;
  }
  function re(t, n) {
    let r = n ?? new e(3);
    return (r[0] = t[0]), (r[1] = t[1]), (r[2] = t[2]), r;
  }
  let ie = re;
  function ae(t, n, r) {
    let i = r ?? new e(3);
    return (i[0] = t[0] * n[0]), (i[1] = t[1] * n[1]), (i[2] = t[2] * n[2]), i;
  }
  let oe = ae;
  function se(t, n, r) {
    let i = r ?? new e(3);
    return (i[0] = t[0] / n[0]), (i[1] = t[1] / n[1]), (i[2] = t[2] / n[2]), i;
  }
  let ce = se;
  function le(t = 1, n) {
    let r = n ?? new e(3),
      i = Math.random() * 2 * Math.PI,
      a = Math.random() * 2 - 1,
      o = Math.sqrt(1 - a * a) * t;
    return (
      (r[0] = Math.cos(i) * o), (r[1] = Math.sin(i) * o), (r[2] = a * t), r
    );
  }
  function ue(t) {
    let n = t ?? new e(3);
    return (n[0] = 0), (n[1] = 0), (n[2] = 0), n;
  }
  function de(t, n, r) {
    let i = r ?? new e(3),
      a = t[0],
      o = t[1],
      s = t[2],
      c = n[3] * a + n[7] * o + n[11] * s + n[15] || 1;
    return (
      (i[0] = (n[0] * a + n[4] * o + n[8] * s + n[12]) / c),
      (i[1] = (n[1] * a + n[5] * o + n[9] * s + n[13]) / c),
      (i[2] = (n[2] * a + n[6] * o + n[10] * s + n[14]) / c),
      i
    );
  }
  function fe(t, n, r) {
    let i = r ?? new e(3),
      a = t[0],
      o = t[1],
      s = t[2];
    return (
      (i[0] = a * n[0] + o * n[4] + s * n[8]),
      (i[1] = a * n[1] + o * n[5] + s * n[9]),
      (i[2] = a * n[2] + o * n[6] + s * n[10]),
      i
    );
  }
  function pe(t, n, r) {
    let i = r ?? new e(3),
      a = t[0],
      o = t[1],
      s = t[2];
    return (
      (i[0] = a * n[0] + o * n[4] + s * n[8]),
      (i[1] = a * n[1] + o * n[5] + s * n[9]),
      (i[2] = a * n[2] + o * n[6] + s * n[10]),
      i
    );
  }
  function P(t, n, r) {
    let i = r ?? new e(3),
      a = n[0],
      o = n[1],
      s = n[2],
      c = n[3] * 2,
      l = t[0],
      u = t[1],
      d = t[2],
      f = o * d - s * u,
      p = s * l - a * d,
      m = a * u - o * l;
    return (
      (i[0] = l + f * c + (o * m - s * p) * 2),
      (i[1] = u + p * c + (s * f - a * m) * 2),
      (i[2] = d + m * c + (a * p - o * f) * 2),
      i
    );
  }
  function me(t, n) {
    let r = n ?? new e(3);
    return (r[0] = t[12]), (r[1] = t[13]), (r[2] = t[14]), r;
  }
  function he(t, n, r) {
    let i = r ?? new e(3),
      a = n * 4;
    return (i[0] = t[a + 0]), (i[1] = t[a + 1]), (i[2] = t[a + 2]), i;
  }
  function ge(t, n) {
    let r = n ?? new e(3),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[4],
      c = t[5],
      l = t[6],
      u = t[8],
      d = t[9],
      f = t[10];
    return (
      (r[0] = Math.sqrt(i * i + a * a + o * o)),
      (r[1] = Math.sqrt(s * s + c * c + l * l)),
      (r[2] = Math.sqrt(u * u + d * d + f * f)),
      r
    );
  }
  function _e(t, n, r, i) {
    let a = i ?? new e(3),
      o = [],
      s = [];
    return (
      (o[0] = t[0] - n[0]),
      (o[1] = t[1] - n[1]),
      (o[2] = t[2] - n[2]),
      (s[0] = o[0]),
      (s[1] = o[1] * Math.cos(r) - o[2] * Math.sin(r)),
      (s[2] = o[1] * Math.sin(r) + o[2] * Math.cos(r)),
      (a[0] = s[0] + n[0]),
      (a[1] = s[1] + n[1]),
      (a[2] = s[2] + n[2]),
      a
    );
  }
  function ve(t, n, r, i) {
    let a = i ?? new e(3),
      o = [],
      s = [];
    return (
      (o[0] = t[0] - n[0]),
      (o[1] = t[1] - n[1]),
      (o[2] = t[2] - n[2]),
      (s[0] = o[2] * Math.sin(r) + o[0] * Math.cos(r)),
      (s[1] = o[1]),
      (s[2] = o[2] * Math.cos(r) - o[0] * Math.sin(r)),
      (a[0] = s[0] + n[0]),
      (a[1] = s[1] + n[1]),
      (a[2] = s[2] + n[2]),
      a
    );
  }
  function ye(t, n, r, i) {
    let a = i ?? new e(3),
      o = [],
      s = [];
    return (
      (o[0] = t[0] - n[0]),
      (o[1] = t[1] - n[1]),
      (o[2] = t[2] - n[2]),
      (s[0] = o[0] * Math.cos(r) - o[1] * Math.sin(r)),
      (s[1] = o[0] * Math.sin(r) + o[1] * Math.cos(r)),
      (s[2] = o[2]),
      (a[0] = s[0] + n[0]),
      (a[1] = s[1] + n[1]),
      (a[2] = s[2] + n[2]),
      a
    );
  }
  function be(t, n, r) {
    let i = r ?? new e(3);
    return N(t, i), b(i, n, i);
  }
  function xe(t, n, r) {
    let i = r ?? new e(3);
    return D(t) > n ? be(t, n, i) : re(t, i);
  }
  function Se(t, n, r) {
    return g(t, n, 0.5, r ?? new e(3));
  }
  return {
    create: t,
    fromValues: n,
    set: r,
    ceil: a,
    floor: o,
    round: s,
    clamp: c,
    add: l,
    addScaled: u,
    angle: d,
    subtract: f,
    sub: p,
    equalsApproximately: m,
    equals: h,
    lerp: g,
    lerpV: _,
    max: v,
    min: y,
    mulScalar: b,
    scale: x,
    divScalar: S,
    inverse: C,
    invert: w,
    cross: T,
    dot: E,
    length: D,
    len: O,
    lengthSq: k,
    lenSq: ee,
    distance: A,
    dist: te,
    distanceSq: j,
    distSq: M,
    normalize: N,
    negate: ne,
    copy: re,
    clone: ie,
    multiply: ae,
    mul: oe,
    divide: se,
    div: ce,
    random: le,
    zero: ue,
    transformMat4: de,
    transformMat4Upper3x3: fe,
    transformMat3: pe,
    transformQuat: P,
    getTranslation: me,
    getAxis: he,
    getScaling: ge,
    rotateX: _e,
    rotateY: ve,
    rotateZ: ye,
    setLength: be,
    truncate: xe,
    midpoint: Se,
  };
}
var l = new Map();
function u(e) {
  let t = l.get(e);
  return t || ((t = c(e)), l.set(e, t)), t;
}
function d(e) {
  let t = s(e),
    n = u(e);
  function r(t, n, r, i, a, o, s, c, l) {
    let u = new e(12);
    return (
      (u[3] = 0),
      (u[7] = 0),
      (u[11] = 0),
      t !== void 0 &&
        ((u[0] = t),
        n !== void 0 &&
          ((u[1] = n),
          r !== void 0 &&
            ((u[2] = r),
            i !== void 0 &&
              ((u[4] = i),
              a !== void 0 &&
                ((u[5] = a),
                o !== void 0 &&
                  ((u[6] = o),
                  s !== void 0 &&
                    ((u[8] = s),
                    c !== void 0 &&
                      ((u[9] = c), l !== void 0 && (u[10] = l))))))))),
      u
    );
  }
  function a(t, n, r, i, a, o, s, c, l, u) {
    let d = u ?? new e(12);
    return (
      (d[0] = t),
      (d[1] = n),
      (d[2] = r),
      (d[3] = 0),
      (d[4] = i),
      (d[5] = a),
      (d[6] = o),
      (d[7] = 0),
      (d[8] = s),
      (d[9] = c),
      (d[10] = l),
      (d[11] = 0),
      d
    );
  }
  function o(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = t[0]),
      (r[1] = t[1]),
      (r[2] = t[2]),
      (r[3] = 0),
      (r[4] = t[4]),
      (r[5] = t[5]),
      (r[6] = t[6]),
      (r[7] = 0),
      (r[8] = t[8]),
      (r[9] = t[9]),
      (r[10] = t[10]),
      (r[11] = 0),
      r
    );
  }
  function c(t, n) {
    let r = n ?? new e(12),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = i + i,
      l = a + a,
      u = o + o,
      d = i * c,
      f = a * c,
      p = a * l,
      m = o * c,
      h = o * l,
      g = o * u,
      _ = s * c,
      v = s * l,
      y = s * u;
    return (
      (r[0] = 1 - p - g),
      (r[1] = f + y),
      (r[2] = m - v),
      (r[3] = 0),
      (r[4] = f - y),
      (r[5] = 1 - d - g),
      (r[6] = h + _),
      (r[7] = 0),
      (r[8] = m + v),
      (r[9] = h - _),
      (r[10] = 1 - d - p),
      (r[11] = 0),
      r
    );
  }
  function l(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = -t[0]),
      (r[1] = -t[1]),
      (r[2] = -t[2]),
      (r[4] = -t[4]),
      (r[5] = -t[5]),
      (r[6] = -t[6]),
      (r[8] = -t[8]),
      (r[9] = -t[9]),
      (r[10] = -t[10]),
      r
    );
  }
  function d(t, n, r) {
    let i = r ?? new e(12);
    return (
      (i[0] = t[0] * n),
      (i[1] = t[1] * n),
      (i[2] = t[2] * n),
      (i[4] = t[4] * n),
      (i[5] = t[5] * n),
      (i[6] = t[6] * n),
      (i[8] = t[8] * n),
      (i[9] = t[9] * n),
      (i[10] = t[10] * n),
      i
    );
  }
  let f = d;
  function p(t, n, r) {
    let i = r ?? new e(12);
    return (
      (i[0] = t[0] + n[0]),
      (i[1] = t[1] + n[1]),
      (i[2] = t[2] + n[2]),
      (i[4] = t[4] + n[4]),
      (i[5] = t[5] + n[5]),
      (i[6] = t[6] + n[6]),
      (i[8] = t[8] + n[8]),
      (i[9] = t[9] + n[9]),
      (i[10] = t[10] + n[10]),
      i
    );
  }
  function m(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = t[0]),
      (r[1] = t[1]),
      (r[2] = t[2]),
      (r[4] = t[4]),
      (r[5] = t[5]),
      (r[6] = t[6]),
      (r[8] = t[8]),
      (r[9] = t[9]),
      (r[10] = t[10]),
      r
    );
  }
  let h = m;
  function g(e, t) {
    return (
      Math.abs(e[0] - t[0]) < i &&
      Math.abs(e[1] - t[1]) < i &&
      Math.abs(e[2] - t[2]) < i &&
      Math.abs(e[4] - t[4]) < i &&
      Math.abs(e[5] - t[5]) < i &&
      Math.abs(e[6] - t[6]) < i &&
      Math.abs(e[8] - t[8]) < i &&
      Math.abs(e[9] - t[9]) < i &&
      Math.abs(e[10] - t[10]) < i
    );
  }
  function _(e, t) {
    return (
      e[0] === t[0] &&
      e[1] === t[1] &&
      e[2] === t[2] &&
      e[4] === t[4] &&
      e[5] === t[5] &&
      e[6] === t[6] &&
      e[8] === t[8] &&
      e[9] === t[9] &&
      e[10] === t[10]
    );
  }
  function v(t) {
    let n = t ?? new e(12);
    return (
      (n[0] = 1),
      (n[1] = 0),
      (n[2] = 0),
      (n[4] = 0),
      (n[5] = 1),
      (n[6] = 0),
      (n[8] = 0),
      (n[9] = 0),
      (n[10] = 1),
      n
    );
  }
  function y(t, n) {
    let r = n ?? new e(12);
    if (r === t) {
      let e;
      return (
        (e = t[1]),
        (t[1] = t[4]),
        (t[4] = e),
        (e = t[2]),
        (t[2] = t[8]),
        (t[8] = e),
        (e = t[6]),
        (t[6] = t[9]),
        (t[9] = e),
        r
      );
    }
    let i = t[0],
      a = t[1],
      o = t[2],
      s = t[4],
      c = t[5],
      l = t[6],
      u = t[8],
      d = t[9],
      f = t[10];
    return (
      (r[0] = i),
      (r[1] = s),
      (r[2] = u),
      (r[4] = a),
      (r[5] = c),
      (r[6] = d),
      (r[8] = o),
      (r[9] = l),
      (r[10] = f),
      r
    );
  }
  function b(t, n) {
    let r = n ?? new e(12),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[4],
      c = t[5],
      l = t[6],
      u = t[8],
      d = t[9],
      f = t[10],
      p = f * c - l * d,
      m = -f * s + l * u,
      h = d * s - c * u,
      g = 1 / (i * p + a * m + o * h);
    return (
      (r[0] = p * g),
      (r[1] = (-f * a + o * d) * g),
      (r[2] = (l * a - o * c) * g),
      (r[4] = m * g),
      (r[5] = (f * i - o * u) * g),
      (r[6] = (-l * i + o * s) * g),
      (r[8] = h * g),
      (r[9] = (-d * i + a * u) * g),
      (r[10] = (c * i - a * s) * g),
      r
    );
  }
  function x(e) {
    let t = e[0],
      n = e[1],
      r = e[2],
      i = e[4],
      a = e[5],
      o = e[6],
      s = e[8],
      c = e[9],
      l = e[10];
    return t * (a * l - c * o) - i * (n * l - c * r) + s * (n * o - a * r);
  }
  let S = b;
  function C(t, n, r) {
    let i = r ?? new e(12),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[4],
      l = t[5],
      u = t[6],
      d = t[8],
      f = t[9],
      p = t[10],
      m = n[0],
      h = n[1],
      g = n[2],
      _ = n[4],
      v = n[5],
      y = n[6],
      b = n[8],
      x = n[9],
      S = n[10];
    return (
      (i[0] = a * m + c * h + d * g),
      (i[1] = o * m + l * h + f * g),
      (i[2] = s * m + u * h + p * g),
      (i[4] = a * _ + c * v + d * y),
      (i[5] = o * _ + l * v + f * y),
      (i[6] = s * _ + u * v + p * y),
      (i[8] = a * b + c * x + d * S),
      (i[9] = o * b + l * x + f * S),
      (i[10] = s * b + u * x + p * S),
      i
    );
  }
  let w = C;
  function T(e, t, n) {
    let r = n ?? v();
    return (
      e !== r &&
        ((r[0] = e[0]),
        (r[1] = e[1]),
        (r[2] = e[2]),
        (r[4] = e[4]),
        (r[5] = e[5]),
        (r[6] = e[6])),
      (r[8] = t[0]),
      (r[9] = t[1]),
      (r[10] = 1),
      r
    );
  }
  function E(e, n) {
    let r = n ?? t.create();
    return (r[0] = e[8]), (r[1] = e[9]), r;
  }
  function D(e, n, r) {
    let i = r ?? t.create(),
      a = n * 4;
    return (i[0] = e[a + 0]), (i[1] = e[a + 1]), i;
  }
  function O(e, t, n, r) {
    let i = r === e ? e : m(e, r),
      a = n * 4;
    return (i[a + 0] = t[0]), (i[a + 1] = t[1]), i;
  }
  function k(e, n) {
    let r = n ?? t.create(),
      i = e[0],
      a = e[1],
      o = e[4],
      s = e[5];
    return (
      (r[0] = Math.sqrt(i * i + a * a)), (r[1] = Math.sqrt(o * o + s * s)), r
    );
  }
  function ee(e, t) {
    let r = t ?? n.create(),
      i = e[0],
      a = e[1],
      o = e[2],
      s = e[4],
      c = e[5],
      l = e[6],
      u = e[8],
      d = e[9],
      f = e[10];
    return (
      (r[0] = Math.sqrt(i * i + a * a + o * o)),
      (r[1] = Math.sqrt(s * s + c * c + l * l)),
      (r[2] = Math.sqrt(u * u + d * d + f * f)),
      r
    );
  }
  function A(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = 1),
      (r[1] = 0),
      (r[2] = 0),
      (r[4] = 0),
      (r[5] = 1),
      (r[6] = 0),
      (r[8] = t[0]),
      (r[9] = t[1]),
      (r[10] = 1),
      r
    );
  }
  function te(t, n, r) {
    let i = r ?? new e(12),
      a = n[0],
      o = n[1],
      s = t[0],
      c = t[1],
      l = t[2],
      u = t[4],
      d = t[5],
      f = t[6],
      p = t[8],
      m = t[9],
      h = t[10];
    return (
      t !== i &&
        ((i[0] = s),
        (i[1] = c),
        (i[2] = l),
        (i[4] = u),
        (i[5] = d),
        (i[6] = f)),
      (i[8] = s * a + u * o + p),
      (i[9] = c * a + d * o + m),
      (i[10] = l * a + f * o + h),
      i
    );
  }
  function j(t, n) {
    let r = n ?? new e(12),
      i = Math.cos(t),
      a = Math.sin(t);
    return (
      (r[0] = i),
      (r[1] = a),
      (r[2] = 0),
      (r[4] = -a),
      (r[5] = i),
      (r[6] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = 1),
      r
    );
  }
  function M(t, n, r) {
    let i = r ?? new e(12),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[4],
      l = t[5],
      u = t[6],
      d = Math.cos(n),
      f = Math.sin(n);
    return (
      (i[0] = d * a + f * c),
      (i[1] = d * o + f * l),
      (i[2] = d * s + f * u),
      (i[4] = d * c - f * a),
      (i[5] = d * l - f * o),
      (i[6] = d * u - f * s),
      t !== i && ((i[8] = t[8]), (i[9] = t[9]), (i[10] = t[10])),
      i
    );
  }
  function N(t, n) {
    let r = n ?? new e(12),
      i = Math.cos(t),
      a = Math.sin(t);
    return (
      (r[0] = 1),
      (r[1] = 0),
      (r[2] = 0),
      (r[4] = 0),
      (r[5] = i),
      (r[6] = a),
      (r[8] = 0),
      (r[9] = -a),
      (r[10] = i),
      r
    );
  }
  function ne(t, n, r) {
    let i = r ?? new e(12),
      a = t[4],
      o = t[5],
      s = t[6],
      c = t[8],
      l = t[9],
      u = t[10],
      d = Math.cos(n),
      f = Math.sin(n);
    return (
      (i[4] = d * a + f * c),
      (i[5] = d * o + f * l),
      (i[6] = d * s + f * u),
      (i[8] = d * c - f * a),
      (i[9] = d * l - f * o),
      (i[10] = d * u - f * s),
      t !== i && ((i[0] = t[0]), (i[1] = t[1]), (i[2] = t[2])),
      i
    );
  }
  function re(t, n) {
    let r = n ?? new e(12),
      i = Math.cos(t),
      a = Math.sin(t);
    return (
      (r[0] = i),
      (r[1] = 0),
      (r[2] = -a),
      (r[4] = 0),
      (r[5] = 1),
      (r[6] = 0),
      (r[8] = a),
      (r[9] = 0),
      (r[10] = i),
      r
    );
  }
  function ie(t, n, r) {
    let i = r ?? new e(12),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[8],
      l = t[9],
      u = t[10],
      d = Math.cos(n),
      f = Math.sin(n);
    return (
      (i[0] = d * a - f * c),
      (i[1] = d * o - f * l),
      (i[2] = d * s - f * u),
      (i[8] = d * c + f * a),
      (i[9] = d * l + f * o),
      (i[10] = d * u + f * s),
      t !== i && ((i[4] = t[4]), (i[5] = t[5]), (i[6] = t[6])),
      i
    );
  }
  let ae = j,
    oe = M;
  function se(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = t[0]),
      (r[1] = 0),
      (r[2] = 0),
      (r[4] = 0),
      (r[5] = t[1]),
      (r[6] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = 1),
      r
    );
  }
  function ce(t, n, r) {
    let i = r ?? new e(12),
      a = n[0],
      o = n[1];
    return (
      (i[0] = a * t[0]),
      (i[1] = a * t[1]),
      (i[2] = a * t[2]),
      (i[4] = o * t[4]),
      (i[5] = o * t[5]),
      (i[6] = o * t[6]),
      t !== i && ((i[8] = t[8]), (i[9] = t[9]), (i[10] = t[10])),
      i
    );
  }
  function le(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = t[0]),
      (r[1] = 0),
      (r[2] = 0),
      (r[4] = 0),
      (r[5] = t[1]),
      (r[6] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = t[2]),
      r
    );
  }
  function ue(t, n, r) {
    let i = r ?? new e(12),
      a = n[0],
      o = n[1],
      s = n[2];
    return (
      (i[0] = a * t[0]),
      (i[1] = a * t[1]),
      (i[2] = a * t[2]),
      (i[4] = o * t[4]),
      (i[5] = o * t[5]),
      (i[6] = o * t[6]),
      (i[8] = s * t[8]),
      (i[9] = s * t[9]),
      (i[10] = s * t[10]),
      i
    );
  }
  function de(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = t),
      (r[1] = 0),
      (r[2] = 0),
      (r[4] = 0),
      (r[5] = t),
      (r[6] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = 1),
      r
    );
  }
  function fe(t, n, r) {
    let i = r ?? new e(12);
    return (
      (i[0] = n * t[0]),
      (i[1] = n * t[1]),
      (i[2] = n * t[2]),
      (i[4] = n * t[4]),
      (i[5] = n * t[5]),
      (i[6] = n * t[6]),
      t !== i && ((i[8] = t[8]), (i[9] = t[9]), (i[10] = t[10])),
      i
    );
  }
  function pe(t, n) {
    let r = n ?? new e(12);
    return (
      (r[0] = t),
      (r[1] = 0),
      (r[2] = 0),
      (r[4] = 0),
      (r[5] = t),
      (r[6] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = t),
      r
    );
  }
  function P(t, n, r) {
    let i = r ?? new e(12);
    return (
      (i[0] = n * t[0]),
      (i[1] = n * t[1]),
      (i[2] = n * t[2]),
      (i[4] = n * t[4]),
      (i[5] = n * t[5]),
      (i[6] = n * t[6]),
      (i[8] = n * t[8]),
      (i[9] = n * t[9]),
      (i[10] = n * t[10]),
      i
    );
  }
  return {
    add: p,
    clone: h,
    copy: m,
    create: r,
    determinant: x,
    equals: _,
    equalsApproximately: g,
    fromMat4: o,
    fromQuat: c,
    get3DScaling: ee,
    getAxis: D,
    getScaling: k,
    getTranslation: E,
    identity: v,
    inverse: b,
    invert: S,
    mul: w,
    mulScalar: f,
    multiply: C,
    multiplyScalar: d,
    negate: l,
    rotate: M,
    rotateX: ne,
    rotateY: ie,
    rotateZ: oe,
    rotation: j,
    rotationX: N,
    rotationY: re,
    rotationZ: ae,
    scale: ce,
    scale3D: ue,
    scaling: se,
    scaling3D: le,
    set: a,
    setAxis: O,
    setTranslation: T,
    translate: te,
    translation: A,
    transpose: y,
    uniformScale: fe,
    uniformScale3D: P,
    uniformScaling: de,
    uniformScaling3D: pe,
  };
}
var f = new Map();
function p(e) {
  let t = f.get(e);
  return t || ((t = d(e)), f.set(e, t)), t;
}
function m(e) {
  let t = u(e);
  function n(t, n, r, i, a, o, s, c, l, u, d, f, p, m, h, g) {
    let _ = new e(16);
    return (
      t !== void 0 &&
        ((_[0] = t),
        n !== void 0 &&
          ((_[1] = n),
          r !== void 0 &&
            ((_[2] = r),
            i !== void 0 &&
              ((_[3] = i),
              a !== void 0 &&
                ((_[4] = a),
                o !== void 0 &&
                  ((_[5] = o),
                  s !== void 0 &&
                    ((_[6] = s),
                    c !== void 0 &&
                      ((_[7] = c),
                      l !== void 0 &&
                        ((_[8] = l),
                        u !== void 0 &&
                          ((_[9] = u),
                          d !== void 0 &&
                            ((_[10] = d),
                            f !== void 0 &&
                              ((_[11] = f),
                              p !== void 0 &&
                                ((_[12] = p),
                                m !== void 0 &&
                                  ((_[13] = m),
                                  h !== void 0 &&
                                    ((_[14] = h),
                                    g !== void 0 && (_[15] = g)))))))))))))))),
      _
    );
  }
  function r(t, n, r, i, a, o, s, c, l, u, d, f, p, m, h, g, _) {
    let v = _ ?? new e(16);
    return (
      (v[0] = t),
      (v[1] = n),
      (v[2] = r),
      (v[3] = i),
      (v[4] = a),
      (v[5] = o),
      (v[6] = s),
      (v[7] = c),
      (v[8] = l),
      (v[9] = u),
      (v[10] = d),
      (v[11] = f),
      (v[12] = p),
      (v[13] = m),
      (v[14] = h),
      (v[15] = g),
      v
    );
  }
  function a(t, n) {
    let r = n ?? new e(16);
    return (
      (r[0] = t[0]),
      (r[1] = t[1]),
      (r[2] = t[2]),
      (r[3] = 0),
      (r[4] = t[4]),
      (r[5] = t[5]),
      (r[6] = t[6]),
      (r[7] = 0),
      (r[8] = t[8]),
      (r[9] = t[9]),
      (r[10] = t[10]),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function o(t, n) {
    let r = n ?? new e(16),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = i + i,
      l = a + a,
      u = o + o,
      d = i * c,
      f = a * c,
      p = a * l,
      m = o * c,
      h = o * l,
      g = o * u,
      _ = s * c,
      v = s * l,
      y = s * u;
    return (
      (r[0] = 1 - p - g),
      (r[1] = f + y),
      (r[2] = m - v),
      (r[3] = 0),
      (r[4] = f - y),
      (r[5] = 1 - d - g),
      (r[6] = h + _),
      (r[7] = 0),
      (r[8] = m + v),
      (r[9] = h - _),
      (r[10] = 1 - d - p),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function s(t, n) {
    let r = n ?? new e(16);
    return (
      (r[0] = -t[0]),
      (r[1] = -t[1]),
      (r[2] = -t[2]),
      (r[3] = -t[3]),
      (r[4] = -t[4]),
      (r[5] = -t[5]),
      (r[6] = -t[6]),
      (r[7] = -t[7]),
      (r[8] = -t[8]),
      (r[9] = -t[9]),
      (r[10] = -t[10]),
      (r[11] = -t[11]),
      (r[12] = -t[12]),
      (r[13] = -t[13]),
      (r[14] = -t[14]),
      (r[15] = -t[15]),
      r
    );
  }
  function c(t, n, r) {
    let i = r ?? new e(16);
    return (
      (i[0] = t[0] + n[0]),
      (i[1] = t[1] + n[1]),
      (i[2] = t[2] + n[2]),
      (i[3] = t[3] + n[3]),
      (i[4] = t[4] + n[4]),
      (i[5] = t[5] + n[5]),
      (i[6] = t[6] + n[6]),
      (i[7] = t[7] + n[7]),
      (i[8] = t[8] + n[8]),
      (i[9] = t[9] + n[9]),
      (i[10] = t[10] + n[10]),
      (i[11] = t[11] + n[11]),
      (i[12] = t[12] + n[12]),
      (i[13] = t[13] + n[13]),
      (i[14] = t[14] + n[14]),
      (i[15] = t[15] + n[15]),
      i
    );
  }
  function l(t, n, r) {
    let i = r ?? new e(16);
    return (
      (i[0] = t[0] * n),
      (i[1] = t[1] * n),
      (i[2] = t[2] * n),
      (i[3] = t[3] * n),
      (i[4] = t[4] * n),
      (i[5] = t[5] * n),
      (i[6] = t[6] * n),
      (i[7] = t[7] * n),
      (i[8] = t[8] * n),
      (i[9] = t[9] * n),
      (i[10] = t[10] * n),
      (i[11] = t[11] * n),
      (i[12] = t[12] * n),
      (i[13] = t[13] * n),
      (i[14] = t[14] * n),
      (i[15] = t[15] * n),
      i
    );
  }
  let d = l;
  function f(t, n) {
    let r = n ?? new e(16);
    return (
      (r[0] = t[0]),
      (r[1] = t[1]),
      (r[2] = t[2]),
      (r[3] = t[3]),
      (r[4] = t[4]),
      (r[5] = t[5]),
      (r[6] = t[6]),
      (r[7] = t[7]),
      (r[8] = t[8]),
      (r[9] = t[9]),
      (r[10] = t[10]),
      (r[11] = t[11]),
      (r[12] = t[12]),
      (r[13] = t[13]),
      (r[14] = t[14]),
      (r[15] = t[15]),
      r
    );
  }
  let p = f;
  function m(e, t) {
    return (
      Math.abs(e[0] - t[0]) < i &&
      Math.abs(e[1] - t[1]) < i &&
      Math.abs(e[2] - t[2]) < i &&
      Math.abs(e[3] - t[3]) < i &&
      Math.abs(e[4] - t[4]) < i &&
      Math.abs(e[5] - t[5]) < i &&
      Math.abs(e[6] - t[6]) < i &&
      Math.abs(e[7] - t[7]) < i &&
      Math.abs(e[8] - t[8]) < i &&
      Math.abs(e[9] - t[9]) < i &&
      Math.abs(e[10] - t[10]) < i &&
      Math.abs(e[11] - t[11]) < i &&
      Math.abs(e[12] - t[12]) < i &&
      Math.abs(e[13] - t[13]) < i &&
      Math.abs(e[14] - t[14]) < i &&
      Math.abs(e[15] - t[15]) < i
    );
  }
  function h(e, t) {
    return (
      e[0] === t[0] &&
      e[1] === t[1] &&
      e[2] === t[2] &&
      e[3] === t[3] &&
      e[4] === t[4] &&
      e[5] === t[5] &&
      e[6] === t[6] &&
      e[7] === t[7] &&
      e[8] === t[8] &&
      e[9] === t[9] &&
      e[10] === t[10] &&
      e[11] === t[11] &&
      e[12] === t[12] &&
      e[13] === t[13] &&
      e[14] === t[14] &&
      e[15] === t[15]
    );
  }
  function g(t) {
    let n = t ?? new e(16);
    return (
      (n[0] = 1),
      (n[1] = 0),
      (n[2] = 0),
      (n[3] = 0),
      (n[4] = 0),
      (n[5] = 1),
      (n[6] = 0),
      (n[7] = 0),
      (n[8] = 0),
      (n[9] = 0),
      (n[10] = 1),
      (n[11] = 0),
      (n[12] = 0),
      (n[13] = 0),
      (n[14] = 0),
      (n[15] = 1),
      n
    );
  }
  function _(t, n) {
    let r = n ?? new e(16);
    if (r === t) {
      let e;
      return (
        (e = t[1]),
        (t[1] = t[4]),
        (t[4] = e),
        (e = t[2]),
        (t[2] = t[8]),
        (t[8] = e),
        (e = t[3]),
        (t[3] = t[12]),
        (t[12] = e),
        (e = t[6]),
        (t[6] = t[9]),
        (t[9] = e),
        (e = t[7]),
        (t[7] = t[13]),
        (t[13] = e),
        (e = t[11]),
        (t[11] = t[14]),
        (t[14] = e),
        r
      );
    }
    let i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = t[4],
      l = t[5],
      u = t[6],
      d = t[7],
      f = t[8],
      p = t[9],
      m = t[10],
      h = t[11],
      g = t[12],
      _ = t[13],
      v = t[14],
      y = t[15];
    return (
      (r[0] = i),
      (r[1] = c),
      (r[2] = f),
      (r[3] = g),
      (r[4] = a),
      (r[5] = l),
      (r[6] = p),
      (r[7] = _),
      (r[8] = o),
      (r[9] = u),
      (r[10] = m),
      (r[11] = v),
      (r[12] = s),
      (r[13] = d),
      (r[14] = h),
      (r[15] = y),
      r
    );
  }
  function v(t, n) {
    let r = n ?? new e(16),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = t[4],
      l = t[5],
      u = t[6],
      d = t[7],
      f = t[8],
      p = t[9],
      m = t[10],
      h = t[11],
      g = t[12],
      _ = t[13],
      v = t[14],
      y = t[15],
      b = m * y,
      x = v * h,
      S = u * y,
      C = v * d,
      w = u * h,
      T = m * d,
      E = o * y,
      D = v * s,
      O = o * h,
      k = m * s,
      ee = o * d,
      A = u * s,
      te = f * _,
      j = g * p,
      M = c * _,
      N = g * l,
      ne = c * p,
      re = f * l,
      ie = i * _,
      ae = g * a,
      oe = i * p,
      se = f * a,
      ce = i * l,
      le = c * a,
      ue = b * l + C * p + w * _ - (x * l + S * p + T * _),
      de = x * a + E * p + k * _ - (b * a + D * p + O * _),
      fe = S * a + D * l + ee * _ - (C * a + E * l + A * _),
      pe = T * a + O * l + A * p - (w * a + k * l + ee * p),
      P = 1 / (i * ue + c * de + f * fe + g * pe);
    return (
      (r[0] = P * ue),
      (r[1] = P * de),
      (r[2] = P * fe),
      (r[3] = P * pe),
      (r[4] = P * (x * c + S * f + T * g - (b * c + C * f + w * g))),
      (r[5] = P * (b * i + D * f + O * g - (x * i + E * f + k * g))),
      (r[6] = P * (C * i + E * c + A * g - (S * i + D * c + ee * g))),
      (r[7] = P * (w * i + k * c + ee * f - (T * i + O * c + A * f))),
      (r[8] = P * (te * d + N * h + ne * y - (j * d + M * h + re * y))),
      (r[9] = P * (j * s + ie * h + se * y - (te * s + ae * h + oe * y))),
      (r[10] = P * (M * s + ae * d + ce * y - (N * s + ie * d + le * y))),
      (r[11] = P * (re * s + oe * d + le * h - (ne * s + se * d + ce * h))),
      (r[12] = P * (M * m + re * v + j * u - (ne * v + te * u + N * m))),
      (r[13] = P * (oe * v + te * o + ae * m - (ie * m + se * v + j * o))),
      (r[14] = P * (ie * u + le * v + N * o - (ce * v + M * o + ae * u))),
      (r[15] = P * (ce * m + ne * o + se * u - (oe * u + le * m + re * o))),
      r
    );
  }
  function y(e) {
    let t = e[0],
      n = e[1],
      r = e[2],
      i = e[3],
      a = e[4],
      o = e[5],
      s = e[6],
      c = e[7],
      l = e[8],
      u = e[9],
      d = e[10],
      f = e[11],
      p = e[12],
      m = e[13],
      h = e[14],
      g = e[15],
      _ = d * g,
      v = h * f,
      y = s * g,
      b = h * c,
      x = s * f,
      S = d * c,
      C = r * g,
      w = h * i,
      T = r * f,
      E = d * i,
      D = r * c,
      O = s * i,
      k = _ * o + b * u + x * m - (v * o + y * u + S * m),
      ee = v * n + C * u + E * m - (_ * n + w * u + T * m),
      A = y * n + w * o + D * m - (b * n + C * o + O * m),
      te = S * n + T * o + O * u - (x * n + E * o + D * u);
    return t * k + a * ee + l * A + p * te;
  }
  let b = v;
  function x(t, n, r) {
    let i = r ?? new e(16),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[3],
      l = t[4],
      u = t[5],
      d = t[6],
      f = t[7],
      p = t[8],
      m = t[9],
      h = t[10],
      g = t[11],
      _ = t[12],
      v = t[13],
      y = t[14],
      b = t[15],
      x = n[0],
      S = n[1],
      C = n[2],
      w = n[3],
      T = n[4],
      E = n[5],
      D = n[6],
      O = n[7],
      k = n[8],
      ee = n[9],
      A = n[10],
      te = n[11],
      j = n[12],
      M = n[13],
      N = n[14],
      ne = n[15];
    return (
      (i[0] = a * x + l * S + p * C + _ * w),
      (i[1] = o * x + u * S + m * C + v * w),
      (i[2] = s * x + d * S + h * C + y * w),
      (i[3] = c * x + f * S + g * C + b * w),
      (i[4] = a * T + l * E + p * D + _ * O),
      (i[5] = o * T + u * E + m * D + v * O),
      (i[6] = s * T + d * E + h * D + y * O),
      (i[7] = c * T + f * E + g * D + b * O),
      (i[8] = a * k + l * ee + p * A + _ * te),
      (i[9] = o * k + u * ee + m * A + v * te),
      (i[10] = s * k + d * ee + h * A + y * te),
      (i[11] = c * k + f * ee + g * A + b * te),
      (i[12] = a * j + l * M + p * N + _ * ne),
      (i[13] = o * j + u * M + m * N + v * ne),
      (i[14] = s * j + d * M + h * N + y * ne),
      (i[15] = c * j + f * M + g * N + b * ne),
      i
    );
  }
  let S = x;
  function C(e, t, n) {
    let r = n ?? g();
    return (
      e !== r &&
        ((r[0] = e[0]),
        (r[1] = e[1]),
        (r[2] = e[2]),
        (r[3] = e[3]),
        (r[4] = e[4]),
        (r[5] = e[5]),
        (r[6] = e[6]),
        (r[7] = e[7]),
        (r[8] = e[8]),
        (r[9] = e[9]),
        (r[10] = e[10]),
        (r[11] = e[11])),
      (r[12] = t[0]),
      (r[13] = t[1]),
      (r[14] = t[2]),
      (r[15] = 1),
      r
    );
  }
  function w(e, n) {
    let r = n ?? t.create();
    return (r[0] = e[12]), (r[1] = e[13]), (r[2] = e[14]), r;
  }
  function T(e, n, r) {
    let i = r ?? t.create(),
      a = n * 4;
    return (i[0] = e[a + 0]), (i[1] = e[a + 1]), (i[2] = e[a + 2]), i;
  }
  function E(e, t, n, r) {
    let i = r === e ? r : f(e, r),
      a = n * 4;
    return (i[a + 0] = t[0]), (i[a + 1] = t[1]), (i[a + 2] = t[2]), i;
  }
  function D(e, n) {
    let r = n ?? t.create(),
      i = e[0],
      a = e[1],
      o = e[2],
      s = e[4],
      c = e[5],
      l = e[6],
      u = e[8],
      d = e[9],
      f = e[10];
    return (
      (r[0] = Math.sqrt(i * i + a * a + o * o)),
      (r[1] = Math.sqrt(s * s + c * c + l * l)),
      (r[2] = Math.sqrt(u * u + d * d + f * f)),
      r
    );
  }
  function O(t, n, r, i, a) {
    let o = a ?? new e(16),
      s = Math.tan(Math.PI * 0.5 - 0.5 * t);
    if (
      ((o[0] = s / n),
      (o[1] = 0),
      (o[2] = 0),
      (o[3] = 0),
      (o[4] = 0),
      (o[5] = s),
      (o[6] = 0),
      (o[7] = 0),
      (o[8] = 0),
      (o[9] = 0),
      (o[11] = -1),
      (o[12] = 0),
      (o[13] = 0),
      (o[15] = 0),
      Number.isFinite(i))
    ) {
      let e = 1 / (r - i);
      (o[10] = i * e), (o[14] = i * r * e);
    } else (o[10] = -1), (o[14] = -r);
    return o;
  }
  function k(t, n, r, i = 1 / 0, a) {
    let o = a ?? new e(16),
      s = 1 / Math.tan(t * 0.5);
    if (
      ((o[0] = s / n),
      (o[1] = 0),
      (o[2] = 0),
      (o[3] = 0),
      (o[4] = 0),
      (o[5] = s),
      (o[6] = 0),
      (o[7] = 0),
      (o[8] = 0),
      (o[9] = 0),
      (o[11] = -1),
      (o[12] = 0),
      (o[13] = 0),
      (o[15] = 0),
      i === 1 / 0)
    )
      (o[10] = 0), (o[14] = r);
    else {
      let e = 1 / (i - r);
      (o[10] = r * e), (o[14] = i * r * e);
    }
    return o;
  }
  function ee(t, n, r, i, a, o, s) {
    let c = s ?? new e(16);
    return (
      (c[0] = 2 / (n - t)),
      (c[1] = 0),
      (c[2] = 0),
      (c[3] = 0),
      (c[4] = 0),
      (c[5] = 2 / (i - r)),
      (c[6] = 0),
      (c[7] = 0),
      (c[8] = 0),
      (c[9] = 0),
      (c[10] = 1 / (a - o)),
      (c[11] = 0),
      (c[12] = (n + t) / (t - n)),
      (c[13] = (i + r) / (r - i)),
      (c[14] = a / (a - o)),
      (c[15] = 1),
      c
    );
  }
  function A(t, n, r, i, a, o, s) {
    let c = s ?? new e(16),
      l = n - t,
      u = i - r,
      d = a - o;
    return (
      (c[0] = (2 * a) / l),
      (c[1] = 0),
      (c[2] = 0),
      (c[3] = 0),
      (c[4] = 0),
      (c[5] = (2 * a) / u),
      (c[6] = 0),
      (c[7] = 0),
      (c[8] = (t + n) / l),
      (c[9] = (i + r) / u),
      (c[10] = o / d),
      (c[11] = -1),
      (c[12] = 0),
      (c[13] = 0),
      (c[14] = (a * o) / d),
      (c[15] = 0),
      c
    );
  }
  function te(t, n, r, i, a, o = 1 / 0, s) {
    let c = s ?? new e(16),
      l = n - t,
      u = i - r;
    if (
      ((c[0] = (2 * a) / l),
      (c[1] = 0),
      (c[2] = 0),
      (c[3] = 0),
      (c[4] = 0),
      (c[5] = (2 * a) / u),
      (c[6] = 0),
      (c[7] = 0),
      (c[8] = (t + n) / l),
      (c[9] = (i + r) / u),
      (c[11] = -1),
      (c[12] = 0),
      (c[13] = 0),
      (c[15] = 0),
      o === 1 / 0)
    )
      (c[10] = 0), (c[14] = a);
    else {
      let e = 1 / (o - a);
      (c[10] = a * e), (c[14] = o * a * e);
    }
    return c;
  }
  let j = t.create(),
    M = t.create(),
    N = t.create();
  function ne(n, r, i, a) {
    let o = a ?? new e(16);
    return (
      t.normalize(t.subtract(r, n, N), N),
      t.normalize(t.cross(i, N, j), j),
      t.normalize(t.cross(N, j, M), M),
      (o[0] = j[0]),
      (o[1] = j[1]),
      (o[2] = j[2]),
      (o[3] = 0),
      (o[4] = M[0]),
      (o[5] = M[1]),
      (o[6] = M[2]),
      (o[7] = 0),
      (o[8] = N[0]),
      (o[9] = N[1]),
      (o[10] = N[2]),
      (o[11] = 0),
      (o[12] = n[0]),
      (o[13] = n[1]),
      (o[14] = n[2]),
      (o[15] = 1),
      o
    );
  }
  function re(n, r, i, a) {
    let o = a ?? new e(16);
    return (
      t.normalize(t.subtract(n, r, N), N),
      t.normalize(t.cross(i, N, j), j),
      t.normalize(t.cross(N, j, M), M),
      (o[0] = j[0]),
      (o[1] = j[1]),
      (o[2] = j[2]),
      (o[3] = 0),
      (o[4] = M[0]),
      (o[5] = M[1]),
      (o[6] = M[2]),
      (o[7] = 0),
      (o[8] = N[0]),
      (o[9] = N[1]),
      (o[10] = N[2]),
      (o[11] = 0),
      (o[12] = n[0]),
      (o[13] = n[1]),
      (o[14] = n[2]),
      (o[15] = 1),
      o
    );
  }
  function ie(n, r, i, a) {
    let o = a ?? new e(16);
    return (
      t.normalize(t.subtract(n, r, N), N),
      t.normalize(t.cross(i, N, j), j),
      t.normalize(t.cross(N, j, M), M),
      (o[0] = j[0]),
      (o[1] = M[0]),
      (o[2] = N[0]),
      (o[3] = 0),
      (o[4] = j[1]),
      (o[5] = M[1]),
      (o[6] = N[1]),
      (o[7] = 0),
      (o[8] = j[2]),
      (o[9] = M[2]),
      (o[10] = N[2]),
      (o[11] = 0),
      (o[12] = -(j[0] * n[0] + j[1] * n[1] + j[2] * n[2])),
      (o[13] = -(M[0] * n[0] + M[1] * n[1] + M[2] * n[2])),
      (o[14] = -(N[0] * n[0] + N[1] * n[1] + N[2] * n[2])),
      (o[15] = 1),
      o
    );
  }
  function ae(t, n) {
    let r = n ?? new e(16);
    return (
      (r[0] = 1),
      (r[1] = 0),
      (r[2] = 0),
      (r[3] = 0),
      (r[4] = 0),
      (r[5] = 1),
      (r[6] = 0),
      (r[7] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = 1),
      (r[11] = 0),
      (r[12] = t[0]),
      (r[13] = t[1]),
      (r[14] = t[2]),
      (r[15] = 1),
      r
    );
  }
  function oe(t, n, r) {
    let i = r ?? new e(16),
      a = n[0],
      o = n[1],
      s = n[2],
      c = t[0],
      l = t[1],
      u = t[2],
      d = t[3],
      f = t[4],
      p = t[5],
      m = t[6],
      h = t[7],
      g = t[8],
      _ = t[9],
      v = t[10],
      y = t[11],
      b = t[12],
      x = t[13],
      S = t[14],
      C = t[15];
    return (
      t !== i &&
        ((i[0] = c),
        (i[1] = l),
        (i[2] = u),
        (i[3] = d),
        (i[4] = f),
        (i[5] = p),
        (i[6] = m),
        (i[7] = h),
        (i[8] = g),
        (i[9] = _),
        (i[10] = v),
        (i[11] = y)),
      (i[12] = c * a + f * o + g * s + b),
      (i[13] = l * a + p * o + _ * s + x),
      (i[14] = u * a + m * o + v * s + S),
      (i[15] = d * a + h * o + y * s + C),
      i
    );
  }
  function se(t, n) {
    let r = n ?? new e(16),
      i = Math.cos(t),
      a = Math.sin(t);
    return (
      (r[0] = 1),
      (r[1] = 0),
      (r[2] = 0),
      (r[3] = 0),
      (r[4] = 0),
      (r[5] = i),
      (r[6] = a),
      (r[7] = 0),
      (r[8] = 0),
      (r[9] = -a),
      (r[10] = i),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function ce(t, n, r) {
    let i = r ?? new e(16),
      a = t[4],
      o = t[5],
      s = t[6],
      c = t[7],
      l = t[8],
      u = t[9],
      d = t[10],
      f = t[11],
      p = Math.cos(n),
      m = Math.sin(n);
    return (
      (i[4] = p * a + m * l),
      (i[5] = p * o + m * u),
      (i[6] = p * s + m * d),
      (i[7] = p * c + m * f),
      (i[8] = p * l - m * a),
      (i[9] = p * u - m * o),
      (i[10] = p * d - m * s),
      (i[11] = p * f - m * c),
      t !== i &&
        ((i[0] = t[0]),
        (i[1] = t[1]),
        (i[2] = t[2]),
        (i[3] = t[3]),
        (i[12] = t[12]),
        (i[13] = t[13]),
        (i[14] = t[14]),
        (i[15] = t[15])),
      i
    );
  }
  function le(t, n) {
    let r = n ?? new e(16),
      i = Math.cos(t),
      a = Math.sin(t);
    return (
      (r[0] = i),
      (r[1] = 0),
      (r[2] = -a),
      (r[3] = 0),
      (r[4] = 0),
      (r[5] = 1),
      (r[6] = 0),
      (r[7] = 0),
      (r[8] = a),
      (r[9] = 0),
      (r[10] = i),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function ue(t, n, r) {
    let i = r ?? new e(16),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[3],
      l = t[8],
      u = t[9],
      d = t[10],
      f = t[11],
      p = Math.cos(n),
      m = Math.sin(n);
    return (
      (i[0] = p * a - m * l),
      (i[1] = p * o - m * u),
      (i[2] = p * s - m * d),
      (i[3] = p * c - m * f),
      (i[8] = p * l + m * a),
      (i[9] = p * u + m * o),
      (i[10] = p * d + m * s),
      (i[11] = p * f + m * c),
      t !== i &&
        ((i[4] = t[4]),
        (i[5] = t[5]),
        (i[6] = t[6]),
        (i[7] = t[7]),
        (i[12] = t[12]),
        (i[13] = t[13]),
        (i[14] = t[14]),
        (i[15] = t[15])),
      i
    );
  }
  function de(t, n) {
    let r = n ?? new e(16),
      i = Math.cos(t),
      a = Math.sin(t);
    return (
      (r[0] = i),
      (r[1] = a),
      (r[2] = 0),
      (r[3] = 0),
      (r[4] = -a),
      (r[5] = i),
      (r[6] = 0),
      (r[7] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = 1),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function fe(t, n, r) {
    let i = r ?? new e(16),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[3],
      l = t[4],
      u = t[5],
      d = t[6],
      f = t[7],
      p = Math.cos(n),
      m = Math.sin(n);
    return (
      (i[0] = p * a + m * l),
      (i[1] = p * o + m * u),
      (i[2] = p * s + m * d),
      (i[3] = p * c + m * f),
      (i[4] = p * l - m * a),
      (i[5] = p * u - m * o),
      (i[6] = p * d - m * s),
      (i[7] = p * f - m * c),
      t !== i &&
        ((i[8] = t[8]),
        (i[9] = t[9]),
        (i[10] = t[10]),
        (i[11] = t[11]),
        (i[12] = t[12]),
        (i[13] = t[13]),
        (i[14] = t[14]),
        (i[15] = t[15])),
      i
    );
  }
  function pe(t, n, r) {
    let i = r ?? new e(16),
      a = t[0],
      o = t[1],
      s = t[2],
      c = Math.sqrt(a * a + o * o + s * s);
    (a /= c), (o /= c), (s /= c);
    let l = a * a,
      u = o * o,
      d = s * s,
      f = Math.cos(n),
      p = Math.sin(n),
      m = 1 - f;
    return (
      (i[0] = l + (1 - l) * f),
      (i[1] = a * o * m + s * p),
      (i[2] = a * s * m - o * p),
      (i[3] = 0),
      (i[4] = a * o * m - s * p),
      (i[5] = u + (1 - u) * f),
      (i[6] = o * s * m + a * p),
      (i[7] = 0),
      (i[8] = a * s * m + o * p),
      (i[9] = o * s * m - a * p),
      (i[10] = d + (1 - d) * f),
      (i[11] = 0),
      (i[12] = 0),
      (i[13] = 0),
      (i[14] = 0),
      (i[15] = 1),
      i
    );
  }
  let P = pe;
  function me(t, n, r, i) {
    let a = i ?? new e(16),
      o = n[0],
      s = n[1],
      c = n[2],
      l = Math.sqrt(o * o + s * s + c * c);
    (o /= l), (s /= l), (c /= l);
    let u = o * o,
      d = s * s,
      f = c * c,
      p = Math.cos(r),
      m = Math.sin(r),
      h = 1 - p,
      g = u + (1 - u) * p,
      _ = o * s * h + c * m,
      v = o * c * h - s * m,
      y = o * s * h - c * m,
      b = d + (1 - d) * p,
      x = s * c * h + o * m,
      S = o * c * h + s * m,
      C = s * c * h - o * m,
      w = f + (1 - f) * p,
      T = t[0],
      E = t[1],
      D = t[2],
      O = t[3],
      k = t[4],
      ee = t[5],
      A = t[6],
      te = t[7],
      j = t[8],
      M = t[9],
      N = t[10],
      ne = t[11];
    return (
      (a[0] = g * T + _ * k + v * j),
      (a[1] = g * E + _ * ee + v * M),
      (a[2] = g * D + _ * A + v * N),
      (a[3] = g * O + _ * te + v * ne),
      (a[4] = y * T + b * k + x * j),
      (a[5] = y * E + b * ee + x * M),
      (a[6] = y * D + b * A + x * N),
      (a[7] = y * O + b * te + x * ne),
      (a[8] = S * T + C * k + w * j),
      (a[9] = S * E + C * ee + w * M),
      (a[10] = S * D + C * A + w * N),
      (a[11] = S * O + C * te + w * ne),
      t !== a &&
        ((a[12] = t[12]), (a[13] = t[13]), (a[14] = t[14]), (a[15] = t[15])),
      a
    );
  }
  let he = me;
  function ge(t, n) {
    let r = n ?? new e(16);
    return (
      (r[0] = t[0]),
      (r[1] = 0),
      (r[2] = 0),
      (r[3] = 0),
      (r[4] = 0),
      (r[5] = t[1]),
      (r[6] = 0),
      (r[7] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = t[2]),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function _e(t, n, r) {
    let i = r ?? new e(16),
      a = n[0],
      o = n[1],
      s = n[2];
    return (
      (i[0] = a * t[0]),
      (i[1] = a * t[1]),
      (i[2] = a * t[2]),
      (i[3] = a * t[3]),
      (i[4] = o * t[4]),
      (i[5] = o * t[5]),
      (i[6] = o * t[6]),
      (i[7] = o * t[7]),
      (i[8] = s * t[8]),
      (i[9] = s * t[9]),
      (i[10] = s * t[10]),
      (i[11] = s * t[11]),
      t !== i &&
        ((i[12] = t[12]), (i[13] = t[13]), (i[14] = t[14]), (i[15] = t[15])),
      i
    );
  }
  function ve(t, n) {
    let r = n ?? new e(16);
    return (
      (r[0] = t),
      (r[1] = 0),
      (r[2] = 0),
      (r[3] = 0),
      (r[4] = 0),
      (r[5] = t),
      (r[6] = 0),
      (r[7] = 0),
      (r[8] = 0),
      (r[9] = 0),
      (r[10] = t),
      (r[11] = 0),
      (r[12] = 0),
      (r[13] = 0),
      (r[14] = 0),
      (r[15] = 1),
      r
    );
  }
  function ye(t, n, r) {
    let i = r ?? new e(16);
    return (
      (i[0] = n * t[0]),
      (i[1] = n * t[1]),
      (i[2] = n * t[2]),
      (i[3] = n * t[3]),
      (i[4] = n * t[4]),
      (i[5] = n * t[5]),
      (i[6] = n * t[6]),
      (i[7] = n * t[7]),
      (i[8] = n * t[8]),
      (i[9] = n * t[9]),
      (i[10] = n * t[10]),
      (i[11] = n * t[11]),
      t !== i &&
        ((i[12] = t[12]), (i[13] = t[13]), (i[14] = t[14]), (i[15] = t[15])),
      i
    );
  }
  return {
    add: c,
    aim: ne,
    axisRotate: me,
    axisRotation: pe,
    cameraAim: re,
    clone: p,
    copy: f,
    create: n,
    determinant: y,
    equals: h,
    equalsApproximately: m,
    fromMat3: a,
    fromQuat: o,
    frustum: A,
    frustumReverseZ: te,
    getAxis: T,
    getScaling: D,
    getTranslation: w,
    identity: g,
    inverse: v,
    invert: b,
    lookAt: ie,
    mul: S,
    mulScalar: d,
    multiply: x,
    multiplyScalar: l,
    negate: s,
    ortho: ee,
    perspective: O,
    perspectiveReverseZ: k,
    rotate: he,
    rotateX: ce,
    rotateY: ue,
    rotateZ: fe,
    rotation: P,
    rotationX: se,
    rotationY: le,
    rotationZ: de,
    scale: _e,
    scaling: ge,
    set: r,
    setAxis: E,
    setTranslation: C,
    translate: oe,
    translation: ae,
    transpose: _,
    uniformScale: ye,
    uniformScaling: ve,
  };
}
var h = new Map();
function g(e) {
  let t = h.get(e);
  return t || ((t = m(e)), h.set(e, t)), t;
}
function _(e) {
  let t = u(e);
  function n(t, n, r, i) {
    let a = new e(4);
    return (
      t !== void 0 &&
        ((a[0] = t),
        n !== void 0 &&
          ((a[1] = n),
          r !== void 0 && ((a[2] = r), i !== void 0 && (a[3] = i)))),
      a
    );
  }
  let r = n;
  function a(t, n, r, i, a) {
    let o = a ?? new e(4);
    return (o[0] = t), (o[1] = n), (o[2] = r), (o[3] = i), o;
  }
  function o(t, n, r) {
    let i = r ?? new e(4),
      a = n * 0.5,
      o = Math.sin(a);
    return (
      (i[0] = o * t[0]),
      (i[1] = o * t[1]),
      (i[2] = o * t[2]),
      (i[3] = Math.cos(a)),
      i
    );
  }
  function s(e, n) {
    let r = n ?? t.create(3),
      a = Math.acos(e[3]) * 2,
      o = Math.sin(a * 0.5);
    return (
      o > i
        ? ((r[0] = e[0] / o), (r[1] = e[1] / o), (r[2] = e[2] / o))
        : ((r[0] = 1), (r[1] = 0), (r[2] = 0)),
      { angle: a, axis: r }
    );
  }
  function c(e, t) {
    let n = O(e, t);
    return Math.acos(2 * n * n - 1);
  }
  function l(t, n, r) {
    let i = r ?? new e(4),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[3],
      l = n[0],
      u = n[1],
      d = n[2],
      f = n[3];
    return (
      (i[0] = a * f + c * l + o * d - s * u),
      (i[1] = o * f + c * u + s * l - a * d),
      (i[2] = s * f + c * d + a * u - o * l),
      (i[3] = c * f - a * l - o * u - s * d),
      i
    );
  }
  let d = l;
  function f(t, n, r) {
    let i = r ?? new e(4),
      a = n * 0.5,
      o = t[0],
      s = t[1],
      c = t[2],
      l = t[3],
      u = Math.sin(a),
      d = Math.cos(a);
    return (
      (i[0] = o * d + l * u),
      (i[1] = s * d + c * u),
      (i[2] = c * d - s * u),
      (i[3] = l * d - o * u),
      i
    );
  }
  function p(t, n, r) {
    let i = r ?? new e(4),
      a = n * 0.5,
      o = t[0],
      s = t[1],
      c = t[2],
      l = t[3],
      u = Math.sin(a),
      d = Math.cos(a);
    return (
      (i[0] = o * d - c * u),
      (i[1] = s * d + l * u),
      (i[2] = c * d + o * u),
      (i[3] = l * d - s * u),
      i
    );
  }
  function m(t, n, r) {
    let i = r ?? new e(4),
      a = n * 0.5,
      o = t[0],
      s = t[1],
      c = t[2],
      l = t[3],
      u = Math.sin(a),
      d = Math.cos(a);
    return (
      (i[0] = o * d + s * u),
      (i[1] = s * d - o * u),
      (i[2] = c * d + l * u),
      (i[3] = l * d - c * u),
      i
    );
  }
  function h(t, n, r, a) {
    let o = a ?? new e(4),
      s = t[0],
      c = t[1],
      l = t[2],
      u = t[3],
      d = n[0],
      f = n[1],
      p = n[2],
      m = n[3],
      h = s * d + c * f + l * p + u * m;
    h < 0 && ((h = -h), (d = -d), (f = -f), (p = -p), (m = -m));
    let g, _;
    if (1 - h > i) {
      let e = Math.acos(h),
        t = Math.sin(e);
      (g = Math.sin((1 - r) * e) / t), (_ = Math.sin(r * e) / t);
    } else (g = 1 - r), (_ = r);
    return (
      (o[0] = g * s + _ * d),
      (o[1] = g * c + _ * f),
      (o[2] = g * l + _ * p),
      (o[3] = g * u + _ * m),
      o
    );
  }
  function g(t, n) {
    let r = n ?? new e(4),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = i * i + a * a + o * o + s * s,
      l = c ? 1 / c : 0;
    return (r[0] = -i * l), (r[1] = -a * l), (r[2] = -o * l), (r[3] = s * l), r;
  }
  function _(t, n) {
    let r = n ?? new e(4);
    return (r[0] = -t[0]), (r[1] = -t[1]), (r[2] = -t[2]), (r[3] = t[3]), r;
  }
  function v(t, n) {
    let r = n ?? new e(4),
      i = t[0] + t[5] + t[10];
    if (i > 0) {
      let e = Math.sqrt(i + 1);
      r[3] = 0.5 * e;
      let n = 0.5 / e;
      (r[0] = (t[6] - t[9]) * n),
        (r[1] = (t[8] - t[2]) * n),
        (r[2] = (t[1] - t[4]) * n);
    } else {
      let e = 0;
      t[5] > t[0] && (e = 1), t[10] > t[e * 4 + e] && (e = 2);
      let n = (e + 1) % 3,
        i = (e + 2) % 3,
        a = Math.sqrt(t[e * 4 + e] - t[n * 4 + n] - t[i * 4 + i] + 1);
      r[e] = 0.5 * a;
      let o = 0.5 / a;
      (r[3] = (t[n * 4 + i] - t[i * 4 + n]) * o),
        (r[n] = (t[n * 4 + e] + t[e * 4 + n]) * o),
        (r[i] = (t[i * 4 + e] + t[e * 4 + i]) * o);
    }
    return r;
  }
  function y(t, n, r, i, a) {
    let o = a ?? new e(4),
      s = t * 0.5,
      c = n * 0.5,
      l = r * 0.5,
      u = Math.sin(s),
      d = Math.cos(s),
      f = Math.sin(c),
      p = Math.cos(c),
      m = Math.sin(l),
      h = Math.cos(l);
    switch (i) {
      case `xyz`:
        (o[0] = u * p * h + d * f * m),
          (o[1] = d * f * h - u * p * m),
          (o[2] = d * p * m + u * f * h),
          (o[3] = d * p * h - u * f * m);
        break;
      case `xzy`:
        (o[0] = u * p * h - d * f * m),
          (o[1] = d * f * h - u * p * m),
          (o[2] = d * p * m + u * f * h),
          (o[3] = d * p * h + u * f * m);
        break;
      case `yxz`:
        (o[0] = u * p * h + d * f * m),
          (o[1] = d * f * h - u * p * m),
          (o[2] = d * p * m - u * f * h),
          (o[3] = d * p * h + u * f * m);
        break;
      case `yzx`:
        (o[0] = u * p * h + d * f * m),
          (o[1] = d * f * h + u * p * m),
          (o[2] = d * p * m - u * f * h),
          (o[3] = d * p * h - u * f * m);
        break;
      case `zxy`:
        (o[0] = u * p * h - d * f * m),
          (o[1] = d * f * h + u * p * m),
          (o[2] = d * p * m + u * f * h),
          (o[3] = d * p * h - u * f * m);
        break;
      case `zyx`:
        (o[0] = u * p * h - d * f * m),
          (o[1] = d * f * h + u * p * m),
          (o[2] = d * p * m - u * f * h),
          (o[3] = d * p * h + u * f * m);
        break;
      default:
        throw Error(`Unknown rotation order: ${i}`);
    }
    return o;
  }
  function b(t, n) {
    let r = n ?? new e(4);
    return (r[0] = t[0]), (r[1] = t[1]), (r[2] = t[2]), (r[3] = t[3]), r;
  }
  let x = b;
  function S(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] + n[0]),
      (i[1] = t[1] + n[1]),
      (i[2] = t[2] + n[2]),
      (i[3] = t[3] + n[3]),
      i
    );
  }
  function C(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] - n[0]),
      (i[1] = t[1] - n[1]),
      (i[2] = t[2] - n[2]),
      (i[3] = t[3] - n[3]),
      i
    );
  }
  let w = C;
  function T(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] * n),
      (i[1] = t[1] * n),
      (i[2] = t[2] * n),
      (i[3] = t[3] * n),
      i
    );
  }
  let E = T;
  function D(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] / n),
      (i[1] = t[1] / n),
      (i[2] = t[2] / n),
      (i[3] = t[3] / n),
      i
    );
  }
  function O(e, t) {
    return e[0] * t[0] + e[1] * t[1] + e[2] * t[2] + e[3] * t[3];
  }
  function k(t, n, r, i) {
    let a = i ?? new e(4);
    return (
      (a[0] = t[0] + r * (n[0] - t[0])),
      (a[1] = t[1] + r * (n[1] - t[1])),
      (a[2] = t[2] + r * (n[2] - t[2])),
      (a[3] = t[3] + r * (n[3] - t[3])),
      a
    );
  }
  function ee(e) {
    let t = e[0],
      n = e[1],
      r = e[2],
      i = e[3];
    return Math.sqrt(t * t + n * n + r * r + i * i);
  }
  let A = ee;
  function te(e) {
    let t = e[0],
      n = e[1],
      r = e[2],
      i = e[3];
    return t * t + n * n + r * r + i * i;
  }
  let j = te;
  function M(t, n) {
    let r = n ?? new e(4),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = Math.sqrt(i * i + a * a + o * o + s * s);
    return (
      c > 1e-5
        ? ((r[0] = i / c), (r[1] = a / c), (r[2] = o / c), (r[3] = s / c))
        : ((r[0] = 0), (r[1] = 0), (r[2] = 0), (r[3] = 1)),
      r
    );
  }
  function N(e, t) {
    return (
      Math.abs(e[0] - t[0]) < i &&
      Math.abs(e[1] - t[1]) < i &&
      Math.abs(e[2] - t[2]) < i &&
      Math.abs(e[3] - t[3]) < i
    );
  }
  function ne(e, t) {
    return e[0] === t[0] && e[1] === t[1] && e[2] === t[2] && e[3] === t[3];
  }
  function re(t) {
    let n = t ?? new e(4);
    return (n[0] = 0), (n[1] = 0), (n[2] = 0), (n[3] = 1), n;
  }
  let ie = t.create(),
    ae = t.create(),
    oe = t.create();
  function se(n, r, i) {
    let a = i ?? new e(4),
      s = t.dot(n, r);
    return s < -0.999999
      ? (t.cross(ae, n, ie),
        t.len(ie) < 1e-6 && t.cross(oe, n, ie),
        t.normalize(ie, ie),
        o(ie, Math.PI, a),
        a)
      : s > 0.999999
        ? ((a[0] = 0), (a[1] = 0), (a[2] = 0), (a[3] = 1), a)
        : (t.cross(n, r, ie),
          (a[0] = ie[0]),
          (a[1] = ie[1]),
          (a[2] = ie[2]),
          (a[3] = 1 + s),
          M(a, a));
  }
  let ce = new e(4),
    le = new e(4);
  function ue(t, n, r, i, a, o) {
    let s = o ?? new e(4);
    return h(t, i, a, ce), h(n, r, a, le), h(ce, le, 2 * a * (1 - a), s), s;
  }
  return {
    create: n,
    fromValues: r,
    set: a,
    fromAxisAngle: o,
    toAxisAngle: s,
    angle: c,
    multiply: l,
    mul: d,
    rotateX: f,
    rotateY: p,
    rotateZ: m,
    slerp: h,
    inverse: g,
    conjugate: _,
    fromMat: v,
    fromEuler: y,
    copy: b,
    clone: x,
    add: S,
    subtract: C,
    sub: w,
    mulScalar: T,
    scale: E,
    divScalar: D,
    dot: O,
    lerp: k,
    length: ee,
    len: A,
    lengthSq: te,
    lenSq: j,
    normalize: M,
    equalsApproximately: N,
    equals: ne,
    identity: re,
    rotationTo: se,
    sqlerp: ue,
  };
}
var v = new Map();
function y(e) {
  let t = v.get(e);
  return t || ((t = _(e)), v.set(e, t)), t;
}
function b(e) {
  function t(t, n, r, i) {
    let a = new e(4);
    return (
      t !== void 0 &&
        ((a[0] = t),
        n !== void 0 &&
          ((a[1] = n),
          r !== void 0 && ((a[2] = r), i !== void 0 && (a[3] = i)))),
      a
    );
  }
  let n = t;
  function r(t, n, r, i, a) {
    let o = a ?? new e(4);
    return (o[0] = t), (o[1] = n), (o[2] = r), (o[3] = i), o;
  }
  function a(t, n) {
    let r = n ?? new e(4);
    return (
      (r[0] = Math.ceil(t[0])),
      (r[1] = Math.ceil(t[1])),
      (r[2] = Math.ceil(t[2])),
      (r[3] = Math.ceil(t[3])),
      r
    );
  }
  function o(t, n) {
    let r = n ?? new e(4);
    return (
      (r[0] = Math.floor(t[0])),
      (r[1] = Math.floor(t[1])),
      (r[2] = Math.floor(t[2])),
      (r[3] = Math.floor(t[3])),
      r
    );
  }
  function s(t, n) {
    let r = n ?? new e(4);
    return (
      (r[0] = Math.round(t[0])),
      (r[1] = Math.round(t[1])),
      (r[2] = Math.round(t[2])),
      (r[3] = Math.round(t[3])),
      r
    );
  }
  function c(t, n = 0, r = 1, i) {
    let a = i ?? new e(4);
    return (
      (a[0] = Math.min(r, Math.max(n, t[0]))),
      (a[1] = Math.min(r, Math.max(n, t[1]))),
      (a[2] = Math.min(r, Math.max(n, t[2]))),
      (a[3] = Math.min(r, Math.max(n, t[3]))),
      a
    );
  }
  function l(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] + n[0]),
      (i[1] = t[1] + n[1]),
      (i[2] = t[2] + n[2]),
      (i[3] = t[3] + n[3]),
      i
    );
  }
  function u(t, n, r, i) {
    let a = i ?? new e(4);
    return (
      (a[0] = t[0] + n[0] * r),
      (a[1] = t[1] + n[1] * r),
      (a[2] = t[2] + n[2] * r),
      (a[3] = t[3] + n[3] * r),
      a
    );
  }
  function d(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] - n[0]),
      (i[1] = t[1] - n[1]),
      (i[2] = t[2] - n[2]),
      (i[3] = t[3] - n[3]),
      i
    );
  }
  let f = d;
  function p(e, t) {
    return (
      Math.abs(e[0] - t[0]) < i &&
      Math.abs(e[1] - t[1]) < i &&
      Math.abs(e[2] - t[2]) < i &&
      Math.abs(e[3] - t[3]) < i
    );
  }
  function m(e, t) {
    return e[0] === t[0] && e[1] === t[1] && e[2] === t[2] && e[3] === t[3];
  }
  function h(t, n, r, i) {
    let a = i ?? new e(4);
    return (
      (a[0] = t[0] + r * (n[0] - t[0])),
      (a[1] = t[1] + r * (n[1] - t[1])),
      (a[2] = t[2] + r * (n[2] - t[2])),
      (a[3] = t[3] + r * (n[3] - t[3])),
      a
    );
  }
  function g(t, n, r, i) {
    let a = i ?? new e(4);
    return (
      (a[0] = t[0] + r[0] * (n[0] - t[0])),
      (a[1] = t[1] + r[1] * (n[1] - t[1])),
      (a[2] = t[2] + r[2] * (n[2] - t[2])),
      (a[3] = t[3] + r[3] * (n[3] - t[3])),
      a
    );
  }
  function _(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = Math.max(t[0], n[0])),
      (i[1] = Math.max(t[1], n[1])),
      (i[2] = Math.max(t[2], n[2])),
      (i[3] = Math.max(t[3], n[3])),
      i
    );
  }
  function v(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = Math.min(t[0], n[0])),
      (i[1] = Math.min(t[1], n[1])),
      (i[2] = Math.min(t[2], n[2])),
      (i[3] = Math.min(t[3], n[3])),
      i
    );
  }
  function y(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] * n),
      (i[1] = t[1] * n),
      (i[2] = t[2] * n),
      (i[3] = t[3] * n),
      i
    );
  }
  let b = y;
  function x(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] / n),
      (i[1] = t[1] / n),
      (i[2] = t[2] / n),
      (i[3] = t[3] / n),
      i
    );
  }
  function S(t, n) {
    let r = n ?? new e(4);
    return (
      (r[0] = 1 / t[0]),
      (r[1] = 1 / t[1]),
      (r[2] = 1 / t[2]),
      (r[3] = 1 / t[3]),
      r
    );
  }
  let C = S;
  function w(e, t) {
    return e[0] * t[0] + e[1] * t[1] + e[2] * t[2] + e[3] * t[3];
  }
  function T(e) {
    let t = e[0],
      n = e[1],
      r = e[2],
      i = e[3];
    return Math.sqrt(t * t + n * n + r * r + i * i);
  }
  let E = T;
  function D(e) {
    let t = e[0],
      n = e[1],
      r = e[2],
      i = e[3];
    return t * t + n * n + r * r + i * i;
  }
  let O = D;
  function k(e, t) {
    let n = e[0] - t[0],
      r = e[1] - t[1],
      i = e[2] - t[2],
      a = e[3] - t[3];
    return Math.sqrt(n * n + r * r + i * i + a * a);
  }
  let ee = k;
  function A(e, t) {
    let n = e[0] - t[0],
      r = e[1] - t[1],
      i = e[2] - t[2],
      a = e[3] - t[3];
    return n * n + r * r + i * i + a * a;
  }
  let te = A;
  function j(t, n) {
    let r = n ?? new e(4),
      i = t[0],
      a = t[1],
      o = t[2],
      s = t[3],
      c = i * i + a * a + o * o + s * s,
      l = c > 0 ? 1 / Math.sqrt(c) : 1;
    return (r[0] = i * l), (r[1] = a * l), (r[2] = o * l), (r[3] = s * l), r;
  }
  function M(t, n) {
    let r = n ?? new e(4);
    return (r[0] = -t[0]), (r[1] = -t[1]), (r[2] = -t[2]), (r[3] = -t[3]), r;
  }
  function N(t, n) {
    let r = n ?? new e(4);
    return (r[0] = t[0]), (r[1] = t[1]), (r[2] = t[2]), (r[3] = t[3]), r;
  }
  let ne = N;
  function re(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] * n[0]),
      (i[1] = t[1] * n[1]),
      (i[2] = t[2] * n[2]),
      (i[3] = t[3] * n[3]),
      i
    );
  }
  let ie = re;
  function ae(t, n, r) {
    let i = r ?? new e(4);
    return (
      (i[0] = t[0] / n[0]),
      (i[1] = t[1] / n[1]),
      (i[2] = t[2] / n[2]),
      (i[3] = t[3] / n[3]),
      i
    );
  }
  let oe = ae;
  function se(t) {
    let n = t ?? new e(4);
    return (n[0] = 0), (n[1] = 0), (n[2] = 0), (n[3] = 0), n;
  }
  function ce(t, n, r) {
    let i = r ?? new e(4),
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[3];
    return (
      (i[0] = n[0] * a + n[4] * o + n[8] * s + n[12] * c),
      (i[1] = n[1] * a + n[5] * o + n[9] * s + n[13] * c),
      (i[2] = n[2] * a + n[6] * o + n[10] * s + n[14] * c),
      (i[3] = n[3] * a + n[7] * o + n[11] * s + n[15] * c),
      i
    );
  }
  function le(t, n, r) {
    let i = r ?? new e(4);
    return j(t, i), y(i, n, i);
  }
  function ue(t, n, r) {
    let i = r ?? new e(4);
    return T(t) > n ? le(t, n, i) : N(t, i);
  }
  function de(t, n, r) {
    return h(t, n, 0.5, r ?? new e(4));
  }
  return {
    create: t,
    fromValues: n,
    set: r,
    ceil: a,
    floor: o,
    round: s,
    clamp: c,
    add: l,
    addScaled: u,
    subtract: d,
    sub: f,
    equalsApproximately: p,
    equals: m,
    lerp: h,
    lerpV: g,
    max: _,
    min: v,
    mulScalar: y,
    scale: b,
    divScalar: x,
    inverse: S,
    invert: C,
    dot: w,
    length: T,
    len: E,
    lengthSq: D,
    lenSq: O,
    distance: k,
    dist: ee,
    distanceSq: A,
    distSq: te,
    normalize: j,
    negate: M,
    copy: N,
    clone: ne,
    multiply: re,
    mul: ie,
    divide: ae,
    div: oe,
    zero: se,
    transformMat4: ce,
    setLength: le,
    truncate: ue,
    midpoint: de,
  };
}
var x = new Map();
function S(e) {
  let t = x.get(e);
  return t || ((t = b(e)), x.set(e, t)), t;
}
function C(e, t, n, r, i, a) {
  return {
    mat3: p(e),
    mat4: g(t),
    quat: y(n),
    vec2: s(r),
    vec3: u(i),
    vec4: S(a),
  };
}
var {
    mat3: w,
    mat4: T,
    quat: E,
    vec2: D,
    vec3: O,
    vec4: k,
  } = C(
    Float32Array,
    Float32Array,
    Float32Array,
    Float32Array,
    Float32Array,
    Float32Array,
  ),
  {
    mat3: ee,
    mat4: A,
    quat: te,
    vec2: j,
    vec3: M,
    vec4: N,
  } = C(
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ),
  {
    mat3: ne,
    mat4: re,
    quat: ie,
    vec2: ae,
    vec3: oe,
    vec4: se,
  } = C(r, Array, Array, Array, Array, Array),
  ce = class e extends Float32Array {
    constructor(e = 0, t = 0, n = 0) {
      super(3), (this[0] = e), (this[1] = t), (this[2] = n);
    }
    get x() {
      return this[0];
    }
    set x(e) {
      this[0] = e;
    }
    get y() {
      return this[1];
    }
    set y(e) {
      this[1] = e;
    }
    get z() {
      return this[2];
    }
    set z(e) {
      this[2] = e;
    }
    set(e, t, n) {
      return typeof e == `object` && e
        ? (super.set(e, t), this)
        : ((this[0] = e),
          t !== void 0 && (this[1] = t),
          n !== void 0 && (this[2] = n),
          this);
    }
    copy(e) {
      return (this[0] = e[0]), (this[1] = e[1]), (this[2] = e[2]), this;
    }
    clone() {
      return new e(this[0], this[1], this[2]);
    }
    add(e) {
      return O.add(this, e, this), this;
    }
    sub(e) {
      return O.subtract(this, e, this), this;
    }
    multiply(e) {
      return O.multiply(this, e, this), this;
    }
    scale(e) {
      return O.scale(this, e, this), this;
    }
    multiplyScalar(e) {
      return O.scale(this, e, this), this;
    }
    addScaled(e, t) {
      return O.addScaled(this, e, t, this), this;
    }
    negate() {
      return O.negate(this, this), this;
    }
    normalize() {
      return O.normalize(this, this), this;
    }
    lerp(e, t) {
      return O.lerp(this, e, t, this), this;
    }
    smoothLerp(e, t, n) {
      let r = 1 - Math.exp(-t * n);
      return O.lerp(this, e, r, this), this;
    }
    divide(e) {
      return O.divide(this, e, this), this;
    }
    angle(e) {
      return O.angle(this, e);
    }
    cross(e) {
      return O.cross(this, e, this), this;
    }
    min(e) {
      return O.min(this, e, this), this;
    }
    max(e) {
      return O.max(this, e, this), this;
    }
    applyMat4(e) {
      return O.transformMat4(this, e, this), this;
    }
    applyMat3(e) {
      return O.transformMat3(this, e, this), this;
    }
    applyQuat(e) {
      return O.transformQuat(this, e, this), this;
    }
    scaleRotateMat4(e) {
      return O.transformMat4Upper3x3(this, e, this), this;
    }
    transformDirection(e) {
      return O.transformMat4Upper3x3(this, e, this), this.normalize();
    }
    dot(e) {
      return O.dot(this, e);
    }
    len() {
      return O.length(this);
    }
    lenSq() {
      return O.lengthSq(this);
    }
    distance(e) {
      return O.distance(this, e);
    }
    distanceSq(e) {
      return O.distanceSq(this, e);
    }
    equals(e) {
      return this[0] === e[0] && this[1] === e[1] && this[2] === e[2];
    }
    fromArray(e, t = 0) {
      return (this[0] = e[t]), (this[1] = e[t + 1]), (this[2] = e[t + 2]), this;
    }
    toArray(e = [], t = 0) {
      return (e[t] = this[0]), (e[t + 1] = this[1]), (e[t + 2] = this[2]), e;
    }
    applyMatrix4(e) {
      return this.applyMat4(e);
    }
    applyMatrix3(e) {
      return this.applyMat3(e);
    }
    applyQuaternion(e) {
      return this.applyQuat(e);
    }
    scaleRotateMatrix4(e) {
      return this.scaleRotateMat4(e);
    }
    squaredLen() {
      return this.lenSq();
    }
    squaredDistance(e) {
      return this.distanceSq(e);
    }
  },
  le = (e, t, n, r) => {
    let i = e,
      a = t[0],
      o = t[1],
      s = t[2],
      c = t[3],
      l = a + a,
      u = o + o,
      d = s + s,
      f = a * l,
      p = a * u,
      m = a * d,
      h = o * u,
      g = o * d,
      _ = s * d,
      v = c * l,
      y = c * u,
      b = c * d,
      x = r[0],
      S = r[1],
      C = r[2];
    return (
      (i[0] = (1 - (h + _)) * x),
      (i[1] = (p + b) * x),
      (i[2] = (m - y) * x),
      (i[3] = 0),
      (i[4] = (p - b) * S),
      (i[5] = (1 - (f + _)) * S),
      (i[6] = (g + v) * S),
      (i[7] = 0),
      (i[8] = (m + y) * C),
      (i[9] = (g - v) * C),
      (i[10] = (1 - (f + h)) * C),
      (i[11] = 0),
      (i[12] = n[0]),
      (i[13] = n[1]),
      (i[14] = n[2]),
      (i[15] = 1),
      i
    );
  };
function ue(e, t, n, r) {
  let i = O.length([e[0], e[1], e[2]]),
    a = O.length([e[4], e[5], e[6]]),
    o = O.length([e[8], e[9], e[10]]);
  T.determinant(e) < 0 && (i = -i),
    (n[0] = e[12]),
    (n[1] = e[13]),
    (n[2] = e[14]);
  let s = e.slice(),
    c = 1 / i,
    l = 1 / a,
    u = 1 / o;
  (s[0] *= c),
    (s[1] *= c),
    (s[2] *= c),
    (s[4] *= l),
    (s[5] *= l),
    (s[6] *= l),
    (s[8] *= u),
    (s[9] *= u),
    (s[10] *= u),
    E.fromMat(s, t),
    (r[0] = i),
    (r[1] = a),
    (r[2] = o);
}
var de = class e extends Float32Array {
  constructor() {
    super(16), T.identity(this);
  }
  set(...e) {
    if (e.length === 1 && typeof e[0] == `object`)
      return super.set(e[0], e[1] || 0), this;
    for (let t = 0; t < 16; t++) this[t] = e[t];
    return this;
  }
  copy(e) {
    return T.copy(e, this), this;
  }
  clone() {
    return new e().copy(this);
  }
  identity() {
    return T.identity(this), this;
  }
  multiply(e) {
    return T.multiply(this, e, this), this;
  }
  premultiply(e) {
    return T.multiply(e, this, this), this;
  }
  invert() {
    return T.inverse(this, this), this;
  }
  transpose() {
    return T.transpose(this, this), this;
  }
  fromQuat(e) {
    return T.fromQuat(e, this), this;
  }
  compose(e, t, n) {
    return le(this, t, e, n), this;
  }
  decompose(e, t, n) {
    return ue(this, t, e, n), this;
  }
  scale(e) {
    return T.scale(this, e, this), this;
  }
  translate(e) {
    return T.translate(this, e, this), this;
  }
  rotateX(e) {
    return T.rotateX(this, e, this), this;
  }
  rotateY(e) {
    return T.rotateY(this, e, this), this;
  }
  rotateZ(e) {
    return T.rotateZ(this, e, this), this;
  }
  perspective(e, t, n, r) {
    return T.perspective(e, t, n, r, this), this;
  }
  ortho(e, t, n, r, i, a) {
    return T.ortho(e, t, n, r, i, a, this), this;
  }
  lookAt(e, t, n) {
    return T.lookAt(e, t, n, this), this;
  }
  aim(e, t, n) {
    return T.aim(e, t, n, this), this;
  }
  determinant() {
    return T.determinant(this);
  }
  getTranslation(e) {
    return T.getTranslation(this, e);
  }
  getScale(e) {
    return T.getScaling(this, e);
  }
  getRotation(e) {
    return E.fromMat(this, e);
  }
  getAxis(e, t) {
    return T.getAxis(this, e, t);
  }
  getMaxScaleOnAxis() {
    let e = this[0] * this[0] + this[1] * this[1] + this[2] * this[2],
      t = this[4] * this[4] + this[5] * this[5] + this[6] * this[6],
      n = this[8] * this[8] + this[9] * this[9] + this[10] * this[10];
    return Math.sqrt(Math.max(e, t, n));
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++) this[n] = e[t + n];
    return this;
  }
  toArray(e = [], t = 0) {
    for (let n = 0; n < 16; n++) e[t + n] = this[n];
    return e;
  }
  inverse() {
    return this.invert();
  }
  fromQuaternion(e) {
    return this.fromQuat(e);
  }
};
function fe(e, t = ``) {
  if (!e) throw Error(t);
}
var pe = new Set();
typeof GPUQueue < `u` &&
  (GPUQueue.prototype.submit = (function (e) {
    return function (t) {
      e.call(this, t), t.forEach((e) => pe.delete(e));
    };
  })(GPUQueue.prototype.submit));
var P = class {
    #e;
    #t;
    #n;
    #r;
    #i;
    #a;
    #o = [];
    #s = `free`;
    constructor(e) {
      (this.#t = e),
        (this.#e = e.features.has(`timestamp-query`)),
        this.#e &&
          ((this.#n = e.createQuerySet({ type: `timestamp`, count: 2 })),
          (this.#r = e.createBuffer({
            size: this.#n.count * 8,
            usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
          })));
    }
    #c(e, t, n) {
      if (this.#e) {
        fe(this.#s === `free`, `state not free`), (this.#s = `need resolve`);
        let r = e[t]({
            ...n,
            timestampWrites: {
              querySet: this.#n,
              beginningOfPassWriteIndex: 0,
              endOfPassWriteIndex: 1,
            },
          }),
          i = () => this.#u(e),
          a = (e) => this.#l(e);
        return (
          (r.end = (function (e) {
            return function () {
              e.call(this), i();
            };
          })(r.end)),
          (e.finish = (function (e) {
            return function () {
              let t = e.call(this);
              return a(t), t;
            };
          })(e.finish)),
          r
        );
      }
      return e[t](n);
    }
    beginRenderPass(e, t = {}) {
      return this.#c(e, `beginRenderPass`, t);
    }
    beginComputePass(e, t = {}) {
      return this.#c(e, `beginComputePass`, t);
    }
    #l(e) {
      this.#e &&
        (fe(this.#s === `need finish`, `you must call encoder.finish`),
        (this.#a = e),
        pe.add(e),
        (this.#s = `wait for result`));
    }
    #u(e) {
      this.#e &&
        (fe(
          this.#s === `need resolve`,
          `you must use timerHelper.beginComputePass or timerHelper.beginRenderPass`,
        ),
        (this.#s = `need finish`),
        (this.#i =
          this.#o.pop() ||
          this.#t.createBuffer({
            size: this.#r.size,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
          })),
        e.resolveQuerySet(this.#n, 0, this.#n.count, this.#r, 0),
        e.copyBufferToBuffer(this.#r, 0, this.#i, 0, this.#i.size));
    }
    async getResult() {
      if (!this.#e) return 0;
      fe(
        this.#s === `wait for result`,
        `you must call encoder.finish and submit the command buffer before you can read the result`,
      ),
        fe(!!this.#a),
        fe(
          !pe.has(this.#a),
          `you must submit the command buffer before you can read the result`,
        ),
        (this.#a = void 0),
        (this.#s = `free`);
      let e = this.#i;
      await e.mapAsync(GPUMapMode.READ);
      let t = new BigInt64Array(e.getMappedRange()),
        n = Number(t[1] - t[0]);
      return e.unmap(), this.#o.push(e), n;
    }
  },
  me = class {
    #e = 0;
    #t = [];
    #n = 0;
    #r;
    constructor(e = 30) {
      this.#r = e;
    }
    addSample(e) {
      !Number.isNaN(e) &&
        Number.isFinite(e) &&
        e >= 0 &&
        ((this.#e += e - (this.#t[this.#n] || 0)),
        (this.#t[this.#n] = e),
        (this.#n = (this.#n + 1) % this.#r));
    }
    get() {
      return this.#e / this.#t.length;
    }
  },
  he = () => {
    let e,
      t,
      n = new Promise((n, r) => {
        (e = n), (t = r);
      });
    return (n.resolve = e), (n.reject = t), n;
  },
  ge = class {
    constructor(e, { label: t = `per-draw-uniforms`, size: n = 1 << 20 } = {}) {
      (this.gpu = e),
        (this.size = n),
        (this.align = e.device.limits.minUniformBufferOffsetAlignment),
        (this.buffer = e.device.createBuffer({
          label: t,
          size: n,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })),
        (this.pointer = 0);
    }
    alloc(e) {
      let t = this.pointer;
      return (
        (this.pointer += Math.ceil(e / this.align) * this.align),
        this.pointer > this.size &&
          !this._overflowReported &&
          ((this._overflowReported = !0),
          console.error(
            `per-draw uniform buffer overflow (${this.pointer} > ${this.size}) — raise Renderer's perDrawSize`,
          )),
        t
      );
    }
    reset() {
      (this.pointer = 0), (this._overflowReported = !1);
    }
  },
  _e = Object.freeze({
    R8UNORM: `r8unorm`,
    R8SNORM: `r8snorm`,
    R8UINT: `r8uint`,
    R8SINT: `r8sint`,
    R16UNORM: `r16unorm`,
    R16SNORM: `r16snorm`,
    R16UINT: `r16uint`,
    R16SINT: `r16sint`,
    R16FLOAT: `r16float`,
    RG8UNORM: `rg8unorm`,
    RG8SNORM: `rg8snorm`,
    RG8UINT: `rg8uint`,
    RG8SINT: `rg8sint`,
    R32UINT: `r32uint`,
    R32SINT: `r32sint`,
    R32FLOAT: `r32float`,
    RG16UNORM: `rg16unorm`,
    RG16SNORM: `rg16snorm`,
    RG16UINT: `rg16uint`,
    RG16SINT: `rg16sint`,
    RG16FLOAT: `rg16float`,
    RGBA8UNORM: `rgba8unorm`,
    RGBA8UNORM_SRGB: `rgba8unorm-srgb`,
    RGBA8SNORM: `rgba8snorm`,
    RGBA8UINT: `rgba8uint`,
    RGBA8SINT: `rgba8sint`,
    BGRA8UNORM: `bgra8unorm`,
    BGRA8UNORM_SRGB: `bgra8unorm-srgb`,
    RGB9E5UFLOAT: `rgb9e5ufloat`,
    RGB10A2UINT: `rgb10a2uint`,
    RGB10A2UNORM: `rgb10a2unorm`,
    RG11B10UFLOAT: `rg11b10ufloat`,
    RG32UINT: `rg32uint`,
    RG32SINT: `rg32sint`,
    RG32FLOAT: `rg32float`,
    RGBA16UNORM: `rgba16unorm`,
    RGBA16SNORM: `rgba16snorm`,
    RGBA16UINT: `rgba16uint`,
    RGBA16SINT: `rgba16sint`,
    RGBA16FLOAT: `rgba16float`,
    RGBA32UINT: `rgba32uint`,
    RGBA32SINT: `rgba32sint`,
    RGBA32FLOAT: `rgba32float`,
    STENCIL8: `stencil8`,
    DEPTH16UNORM: `depth16unorm`,
    DEPTH24PLUS: `depth24plus`,
    DEPTH24PLUS_STENCIL8: `depth24plus-stencil8`,
    DEPTH32FLOAT: `depth32float`,
    DEPTH32FLOAT_STENCIL8: `depth32float-stencil8`,
    BC1_RGBA_UNORM: `bc1-rgba-unorm`,
    BC1_RGBA_UNORM_SRGB: `bc1-rgba-unorm-srgb`,
    BC2_RGBA_UNORM: `bc2-rgba-unorm`,
    BC2_RGBA_UNORM_SRGB: `bc2-rgba-unorm-srgb`,
    BC3_RGBA_UNORM: `bc3-rgba-unorm`,
    BC3_RGBA_UNORM_SRGB: `bc3-rgba-unorm-srgb`,
    BC4_R_UNORM: `bc4-r-unorm`,
    BC4_R_SNORM: `bc4-r-snorm`,
    BC5_RG_UNORM: `bc5-rg-unorm`,
    BC5_RG_SNORM: `bc5-rg-snorm`,
    BC6H_RGB_UFLOAT: `bc6h-rgb-ufloat`,
    BC6H_RGB_FLOAT: `bc6h-rgb-float`,
    BC7_RGBA_UNORM: `bc7-rgba-unorm`,
    BC7_RGBA_UNORM_SRGB: `bc7-rgba-unorm-srgb`,
    ETC2_RGB8UNORM: `etc2-rgb8unorm`,
    ETC2_RGB8UNORM_SRGB: `etc2-rgb8unorm-srgb`,
    ETC2_RGB8A1UNORM: `etc2-rgb8a1unorm`,
    ETC2_RGB8A1UNORM_SRGB: `etc2-rgb8a1unorm-srgb`,
    ETC2_RGBA8UNORM: `etc2-rgba8unorm`,
    ETC2_RGBA8UNORM_SRGB: `etc2-rgba8unorm-srgb`,
    EAC_R11UNORM: `eac-r11unorm`,
    EAC_R11SNORM: `eac-r11snorm`,
    EAC_RG11UNORM: `eac-rg11unorm`,
    EAC_RG11SNORM: `eac-rg11snorm`,
    ASTC_4X4_UNORM: `astc-4x4-unorm`,
    ASTC_4X4_UNORM_SRGB: `astc-4x4-unorm-srgb`,
    ASTC_5X4_UNORM: `astc-5x4-unorm`,
    ASTC_5X4_UNORM_SRGB: `astc-5x4-unorm-srgb`,
    ASTC_5X5_UNORM: `astc-5x5-unorm`,
    ASTC_5X5_UNORM_SRGB: `astc-5x5-unorm-srgb`,
    ASTC_6X5_UNORM: `astc-6x5-unorm`,
    ASTC_6X5_UNORM_SRGB: `astc-6x5-unorm-srgb`,
    ASTC_6X6_UNORM: `astc-6x6-unorm`,
    ASTC_6X6_UNORM_SRGB: `astc-6x6-unorm-srgb`,
    ASTC_8X5_UNORM: `astc-8x5-unorm`,
    ASTC_8X5_UNORM_SRGB: `astc-8x5-unorm-srgb`,
    ASTC_8X6_UNORM: `astc-8x6-unorm`,
    ASTC_8X6_UNORM_SRGB: `astc-8x6-unorm-srgb`,
    ASTC_8X8_UNORM: `astc-8x8-unorm`,
    ASTC_8X8_UNORM_SRGB: `astc-8x8-unorm-srgb`,
    ASTC_10X5_UNORM: `astc-10x5-unorm`,
    ASTC_10X5_UNORM_SRGB: `astc-10x5-unorm-srgb`,
    ASTC_10X6_UNORM: `astc-10x6-unorm`,
    ASTC_10X6_UNORM_SRGB: `astc-10x6-unorm-srgb`,
    ASTC_10X8_UNORM: `astc-10x8-unorm`,
    ASTC_10X8_UNORM_SRGB: `astc-10x8-unorm-srgb`,
    ASTC_10X10_UNORM: `astc-10x10-unorm`,
    ASTC_10X10_UNORM_SRGB: `astc-10x10-unorm-srgb`,
    ASTC_12X10_UNORM: `astc-12x10-unorm`,
    ASTC_12X10_UNORM_SRGB: `astc-12x10-unorm-srgb`,
    ASTC_12X12_UNORM: `astc-12x12-unorm`,
    ASTC_12X12_UNORM_SRGB: `astc-12x12-unorm-srgb`,
  });
Object.freeze({
  UINT8: `uint8`,
  UINT8X2: `uint8x2`,
  UINT8X4: `uint8x4`,
  SINT8: `sint8`,
  SINT8X2: `sint8x2`,
  SINT8X4: `sint8x4`,
  UNORM8: `unorm8`,
  UNORM8X2: `unorm8x2`,
  UNORM8X4: `unorm8x4`,
  SNORM8: `snorm8`,
  SNORM8X2: `snorm8x2`,
  SNORM8X4: `snorm8x4`,
  UINT16: `uint16`,
  UINT16X2: `uint16x2`,
  UINT16X4: `uint16x4`,
  SINT16: `sint16`,
  SINT16X2: `sint16x2`,
  SINT16X4: `sint16x4`,
  UNORM16: `unorm16`,
  UNORM16X2: `unorm16x2`,
  UNORM16X4: `unorm16x4`,
  SNORM16: `snorm16`,
  SNORM16X2: `snorm16x2`,
  SNORM16X4: `snorm16x4`,
  FLOAT16: `float16`,
  FLOAT16X2: `float16x2`,
  FLOAT16X4: `float16x4`,
  FLOAT32: `float32`,
  FLOAT32X2: `float32x2`,
  FLOAT32X3: `float32x3`,
  FLOAT32X4: `float32x4`,
  UINT32: `uint32`,
  UINT32X2: `uint32x2`,
  UINT32X3: `uint32x3`,
  UINT32X4: `uint32x4`,
  SINT32: `sint32`,
  SINT32X2: `sint32x2`,
  SINT32X3: `sint32x3`,
  SINT32X4: `sint32x4`,
  UNORM10_10_10_2: `unorm10-10-10-2`,
  UNORM8X4_BGRA: `unorm8x4-bgra`,
});
var ve = Object.freeze({ OPAQUE: `opaque`, PREMULTIPLIED: `premultiplied` }),
  ye = Object.freeze({
    ZERO: `zero`,
    ONE: `one`,
    SRC: `src`,
    ONE_MINUS_SRC: `one-minus-src`,
    SRC_ALPHA: `src-alpha`,
    ONE_MINUS_SRC_ALPHA: `one-minus-src-alpha`,
    DST: `dst`,
    ONE_MINUS_DST: `one-minus-dst`,
    DST_ALPHA: `dst-alpha`,
    ONE_MINUS_DST_ALPHA: `one-minus-dst-alpha`,
    SRC_ALPHA_SATURATED: `src-alpha-saturated`,
    CONSTANT: `constant`,
    ONE_MINUS_CONSTANT: `one-minus-constant`,
    SRC1: `src1`,
    ONE_MINUS_SRC1: `one-minus-src1`,
    SRC1_ALPHA: `src1-alpha`,
    ONE_MINUS_SRC1_ALPHA: `one-minus-src1-alpha`,
  });
Object.freeze({
  ADD: `add`,
  SUBTRACT: `subtract`,
  REVERSE_SUBTRACT: `reverse-subtract`,
  MIN: `min`,
  MAX: `max`,
}),
  Object.freeze({
    NEVER: `never`,
    LESS: `less`,
    EQUAL: `equal`,
    LESS_EQUAL: `less-equal`,
    GREATER: `greater`,
    NOT_EQUAL: `not-equal`,
    GREATER_EQUAL: `greater-equal`,
    ALWAYS: `always`,
  }),
  Object.freeze({
    KEEP: `keep`,
    ZERO: `zero`,
    REPLACE: `replace`,
    INVERT: `invert`,
    INCREMENT_CLAMP: `increment-clamp`,
    DECREMENT_CLAMP: `decrement-clamp`,
    INCREMENT_WRAP: `increment-wrap`,
    DECREMENT_WRAP: `decrement-wrap`,
  }),
  Object.freeze({
    POINT_LIST: `point-list`,
    LINE_LIST: `line-list`,
    LINE_STRIP: `line-strip`,
    TRIANGLE_LIST: `triangle-list`,
    TRIANGLE_STRIP: `triangle-strip`,
  }),
  Object.freeze({ CCW: `ccw`, CW: `cw` }),
  Object.freeze({ NONE: `none`, FRONT: `front`, BACK: `back` }),
  Object.freeze({ UINT16: `uint16`, UINT32: `uint32` }),
  Object.freeze({ VERTEX: `vertex`, INSTANCE: `instance` }),
  Object.freeze({ LOAD: `load`, CLEAR: `clear` }),
  Object.freeze({ STORE: `store`, DISCARD: `discard` }),
  Object.freeze({
    CLAMP_TO_EDGE: `clamp-to-edge`,
    REPEAT: `repeat`,
    MIRROR_REPEAT: `mirror-repeat`,
  }),
  Object.freeze({ NEAREST: `nearest`, LINEAR: `linear` }),
  Object.freeze({ NEAREST: `nearest`, LINEAR: `linear` }),
  Object.freeze({ D1: `1d`, D2: `2d`, D3: `3d` }),
  Object.freeze({
    D1: `1d`,
    D2: `2d`,
    D2_ARRAY: `2d-array`,
    CUBE: `cube`,
    CUBE_ARRAY: `cube-array`,
    D3: `3d`,
  }),
  Object.freeze({
    ALL: `all`,
    STENCIL_ONLY: `stencil-only`,
    DEPTH_ONLY: `depth-only`,
  }),
  Object.freeze({
    UNIFORM: `uniform`,
    STORAGE: `storage`,
    READ_ONLY_STORAGE: `read-only-storage`,
  }),
  Object.freeze({
    FILTERING: `filtering`,
    NON_FILTERING: `non-filtering`,
    COMPARISON: `comparison`,
  }),
  Object.freeze({
    FLOAT: `float`,
    UNFILTERABLE_FLOAT: `unfilterable-float`,
    DEPTH: `depth`,
    SINT: `sint`,
    UINT: `uint`,
  }),
  Object.freeze({
    WRITE_ONLY: `write-only`,
    READ_ONLY: `read-only`,
    READ_WRITE: `read-write`,
  }),
  Object.freeze({ AUTO: `auto` }),
  Object.freeze({ STANDARD: `standard`, EXTENDED: `extended` }),
  Object.freeze({ OCCLUSION: `occlusion`, TIMESTAMP: `timestamp` }),
  Object.freeze({
    LOW_POWER: `low-power`,
    HIGH_PERFORMANCE: `high-performance`,
  }),
  Object.freeze({ UNMAPPED: `unmapped`, PENDING: `pending`, MAPPED: `mapped` }),
  Object.freeze({ UNKNOWN: `unknown`, DESTROYED: `destroyed` }),
  Object.freeze({
    VALIDATION: `validation`,
    OUT_OF_MEMORY: `out-of-memory`,
    INTERNAL: `internal`,
  }),
  Object.freeze({ ERROR: `error`, WARNING: `warning`, INFO: `info` }),
  Object.freeze({ VALIDATION: `validation`, INTERNAL: `internal` }),
  Object.freeze({
    CORE_FEATURES_AND_LIMITS: `core-features-and-limits`,
    DEPTH_CLIP_CONTROL: `depth-clip-control`,
    DEPTH32FLOAT_STENCIL8: `depth32float-stencil8`,
    TEXTURE_COMPRESSION_BC: `texture-compression-bc`,
    TEXTURE_COMPRESSION_BC_SLICED_3D: `texture-compression-bc-sliced-3d`,
    TEXTURE_COMPRESSION_ETC2: `texture-compression-etc2`,
    TEXTURE_COMPRESSION_ASTC: `texture-compression-astc`,
    TEXTURE_COMPRESSION_ASTC_SLICED_3D: `texture-compression-astc-sliced-3d`,
    TIMESTAMP_QUERY: `timestamp-query`,
    INDIRECT_FIRST_INSTANCE: `indirect-first-instance`,
    SHADER_F16: `shader-f16`,
    RG11B10UFLOAT_RENDERABLE: `rg11b10ufloat-renderable`,
    BGRA8UNORM_STORAGE: `bgra8unorm-storage`,
    FLOAT32_FILTERABLE: `float32-filterable`,
    FLOAT32_BLENDABLE: `float32-blendable`,
    CLIP_DISTANCES: `clip-distances`,
    DUAL_SOURCE_BLENDING: `dual-source-blending`,
    SUBGROUPS: `subgroups`,
    TEXTURE_FORMATS_TIER1: `texture-formats-tier1`,
    TEXTURE_FORMATS_TIER2: `texture-formats-tier2`,
    PRIMITIVE_INDEX: `primitive-index`,
    TEXTURE_COMPONENT_SWIZZLE: `texture-component-swizzle`,
    SUBGROUP_SIZE_CONTROL: `subgroup-size-control`,
  });
var be = (e, t) => (((e + t - 1) / t) | 0) * t;
function xe(e) {
  return Object.keys(e);
}
function Se(e, t) {
  return Array(e)
    .fill(0)
    .map((e, n) => t(n));
}
var Ce = (e) =>
    e &&
    typeof e.length == `number` &&
    e.buffer instanceof ArrayBuffer &&
    typeof e.byteLength == `number`,
  we = (e) => e,
  F = we({
    i32: { numElements: 1, align: 4, size: 4, type: `i32`, View: Int32Array },
    u32: { numElements: 1, align: 4, size: 4, type: `u32`, View: Uint32Array },
    f32: { numElements: 1, align: 4, size: 4, type: `f32`, View: Float32Array },
    f16: { numElements: 1, align: 2, size: 2, type: `u16`, View: Uint16Array },
    vec2f: {
      numElements: 2,
      align: 8,
      size: 8,
      type: `f32`,
      View: Float32Array,
    },
    vec2i: { numElements: 2, align: 8, size: 8, type: `i32`, View: Int32Array },
    vec2u: {
      numElements: 2,
      align: 8,
      size: 8,
      type: `u32`,
      View: Uint32Array,
    },
    vec2h: {
      numElements: 2,
      align: 4,
      size: 4,
      type: `u16`,
      View: Uint16Array,
    },
    vec3i: {
      numElements: 3,
      align: 16,
      size: 12,
      type: `i32`,
      View: Int32Array,
    },
    vec3u: {
      numElements: 3,
      align: 16,
      size: 12,
      type: `u32`,
      View: Uint32Array,
    },
    vec3f: {
      numElements: 3,
      align: 16,
      size: 12,
      type: `f32`,
      View: Float32Array,
    },
    vec3h: {
      numElements: 3,
      align: 8,
      size: 6,
      type: `u16`,
      View: Uint16Array,
    },
    vec4i: {
      numElements: 4,
      align: 16,
      size: 16,
      type: `i32`,
      View: Int32Array,
    },
    vec4u: {
      numElements: 4,
      align: 16,
      size: 16,
      type: `u32`,
      View: Uint32Array,
    },
    vec4f: {
      numElements: 4,
      align: 16,
      size: 16,
      type: `f32`,
      View: Float32Array,
    },
    vec4h: {
      numElements: 4,
      align: 8,
      size: 8,
      type: `u16`,
      View: Uint16Array,
    },
    mat2x2f: {
      numElements: 4,
      align: 8,
      size: 16,
      type: `f32`,
      View: Float32Array,
    },
    mat2x2h: {
      numElements: 4,
      align: 4,
      size: 8,
      type: `u16`,
      View: Uint16Array,
    },
    mat3x2f: {
      numElements: 6,
      align: 8,
      size: 24,
      type: `f32`,
      View: Float32Array,
    },
    mat3x2h: {
      numElements: 6,
      align: 4,
      size: 12,
      type: `u16`,
      View: Uint16Array,
    },
    mat4x2f: {
      numElements: 8,
      align: 8,
      size: 32,
      type: `f32`,
      View: Float32Array,
    },
    mat4x2h: {
      numElements: 8,
      align: 4,
      size: 16,
      type: `u16`,
      View: Uint16Array,
    },
    mat2x3f: {
      numElements: 8,
      align: 16,
      size: 32,
      pad: [3, 1],
      type: `f32`,
      View: Float32Array,
    },
    mat2x3h: {
      numElements: 8,
      align: 8,
      size: 16,
      pad: [3, 1],
      type: `u16`,
      View: Uint16Array,
    },
    mat3x3f: {
      numElements: 12,
      align: 16,
      size: 48,
      pad: [3, 1],
      type: `f32`,
      View: Float32Array,
    },
    mat3x3h: {
      numElements: 12,
      align: 8,
      size: 24,
      pad: [3, 1],
      type: `u16`,
      View: Uint16Array,
    },
    mat4x3f: {
      numElements: 16,
      align: 16,
      size: 64,
      pad: [3, 1],
      type: `f32`,
      View: Float32Array,
    },
    mat4x3h: {
      numElements: 16,
      align: 8,
      size: 32,
      pad: [3, 1],
      type: `u16`,
      View: Uint16Array,
    },
    mat2x4f: {
      numElements: 8,
      align: 16,
      size: 32,
      type: `f32`,
      View: Float32Array,
    },
    mat2x4h: {
      numElements: 8,
      align: 8,
      size: 16,
      type: `u16`,
      View: Uint16Array,
    },
    mat3x4f: {
      numElements: 12,
      align: 16,
      size: 48,
      pad: [3, 1],
      type: `f32`,
      View: Float32Array,
    },
    mat3x4h: {
      numElements: 12,
      align: 8,
      size: 24,
      pad: [3, 1],
      type: `u16`,
      View: Uint16Array,
    },
    mat4x4f: {
      numElements: 16,
      align: 16,
      size: 64,
      type: `f32`,
      View: Float32Array,
    },
    mat4x4h: {
      numElements: 16,
      align: 8,
      size: 32,
      type: `u16`,
      View: Uint16Array,
    },
    bool: {
      numElements: 0,
      align: 1,
      size: 0,
      type: `bool`,
      View: Uint32Array,
    },
  }),
  Te = we({
    ...F,
    "atomic<i32>": F.i32,
    "atomic<u32>": F.u32,
    "vec2<i32>": F.vec2i,
    "vec2<u32>": F.vec2u,
    "vec2<f32>": F.vec2f,
    "vec2<f16>": F.vec2h,
    "vec3<i32>": F.vec3i,
    "vec3<u32>": F.vec3u,
    "vec3<f32>": F.vec3f,
    "vec3<f16>": F.vec3h,
    "vec4<i32>": F.vec4i,
    "vec4<u32>": F.vec4u,
    "vec4<f32>": F.vec4f,
    "vec4<f16>": F.vec4h,
    "mat2x2<f32>": F.mat2x2f,
    "mat2x2<f16>": F.mat2x2h,
    "mat3x2<f32>": F.mat3x2f,
    "mat3x2<f16>": F.mat3x2h,
    "mat4x2<f32>": F.mat4x2f,
    "mat4x2<f16>": F.mat4x2h,
    "mat2x3<f32>": F.mat2x3f,
    "mat2x3<f16>": F.mat2x3h,
    "mat3x3<f32>": F.mat3x3f,
    "mat3x3<f16>": F.mat3x3h,
    "mat4x3<f32>": F.mat4x3f,
    "mat4x3<f16>": F.mat4x3h,
    "mat2x4<f32>": F.mat2x4f,
    "mat2x4<f16>": F.mat2x4h,
    "mat3x4<f32>": F.mat3x4f,
    "mat3x4<f16>": F.mat3x4h,
    "mat4x4<f32>": F.mat4x4f,
    "mat4x4<f16>": F.mat4x4h,
  }),
  Ee = xe(Te);
function De(e = [], t) {
  let n = new Set();
  for (let r of Ee) {
    let i = Te[r];
    n.has(i) || (n.add(i), (i.flatten = e.includes(r) ? t : !t));
  }
}
De();
function Oe(e) {
  let t = e;
  if (t.elementType) return t.size;
  {
    let n = e,
      r = t.numElements || 1;
    if (n.fields) return e.size * r;
    {
      let { align: t } = Te[e.type];
      return r > 1 ? be(e.size, t) * r : e.size;
    }
  }
}
function ke(e, t, n, r) {
  let { size: i, type: a } = e;
  try {
    let { View: e, align: o, size: s } = Te[a],
      c = r !== void 0,
      l = c ? be(i, o) : s;
    return new e(
      t,
      n,
      (l / e.BYTES_PER_ELEMENT) *
        (c ? (r === 0 ? (t.byteLength - n) / l : r) : 1),
    );
  } catch {
    throw Error(`unknown type: ${a}`);
  }
}
function Ae(e) {
  return !e.fields && !e.elementType;
}
function je(e, t, n) {
  let r = n || 0,
    i = t || new ArrayBuffer(Oe(e)),
    a = (e, t) => {
      let n = e,
        r = n.elementType;
      if (r) {
        if (Ae(r) && Te[r.type].flatten) return ke(r, i, t, n.numElements);
        {
          let { size: o } = Fe(e);
          return Se(
            n.numElements === 0 ? (i.byteLength - t) / o : n.numElements,
            (e) => a(r, t + o * e),
          );
        }
      }
      if (typeof e == `string`) throw Error(`unreachable`);
      {
        let n = e.fields;
        if (n) {
          let e = {};
          for (let [r, { type: i, offset: o }] of Object.entries(n))
            e[r] = a(i, t + o);
          return e;
        }
        return ke(e, i, t);
      }
    };
  return { views: a(e, r), arrayBuffer: i };
}
function Me(e, t) {
  if (e !== void 0) {
    if (Ce(t)) {
      let n = t;
      if (n.length === 1 && typeof e == `number`) n[0] = e;
      else if (Array.isArray(e[0]) || Ce(e[0])) {
        let t = e[0].length,
          r = t === 3 ? 4 : t;
        for (let t = 0; t < e.length; ++t) {
          let i = t * r;
          n.set(e[t], i);
        }
      } else n.set(e);
    } else if (Array.isArray(t)) {
      let n = t;
      e.forEach((e, t) => {
        Me(e, n[t]);
      });
    } else {
      let n = t;
      for (let [t, r] of Object.entries(e)) {
        let e = n[t];
        e && Me(r, e);
      }
    }
  }
}
function Ne(e, t, n = 0) {
  let r = e,
    i = je(r.group === void 0 ? e : r.typeDefinition, t, n);
  return {
    ...i,
    set(e) {
      Me(e, i.views);
    },
  };
}
function Pe(e) {
  let t = e.elementType;
  if (t) return Pe(t);
  let n = e.fields;
  if (n)
    return Object.values(n).reduce((e, { type: t }) => Math.max(e, Pe(t)), 0);
  let { type: r } = e,
    { align: i } = Te[r];
  return i;
}
function Fe(e) {
  let t = e.elementType;
  if (t) {
    let e = t.size,
      n = Pe(t);
    return { unalignedSize: e, align: n, size: be(e, n) };
  }
  let n = e.fields;
  if (n) {
    let e = Object.values(n).pop();
    if (e.type.size === 0) return Fe(e.type);
  }
  return { size: 0, unalignedSize: 0, align: 1 };
}
var Ie = class {
    constructor(e, t) {
      (this.name = e), (this.attributes = t), (this.size = 0);
    }
    get isArray() {
      return !1;
    }
    get isStruct() {
      return !1;
    }
    get isTemplate() {
      return !1;
    }
    get isPointer() {
      return !1;
    }
    getTypeName() {
      return this.name;
    }
  },
  Le = class {
    constructor(e, t, n) {
      (this.name = e),
        (this.type = t),
        (this.attributes = n),
        (this.offset = 0),
        (this.size = 0);
    }
    get isArray() {
      return this.type.isArray;
    }
    get isStruct() {
      return this.type.isStruct;
    }
    get isTemplate() {
      return this.type.isTemplate;
    }
    get align() {
      return this.type.isStruct ? this.type.align : 0;
    }
    get members() {
      return this.type.isStruct ? this.type.members : null;
    }
    get format() {
      return this.type.isArray || this.type.isTemplate
        ? this.type.format
        : null;
    }
    get count() {
      return this.type.isArray ? this.type.count : 0;
    }
    get stride() {
      return this.type.isArray ? this.type.stride : this.size;
    }
  },
  Re = class extends Ie {
    constructor(e, t) {
      super(e, t),
        (this.members = []),
        (this.align = 0),
        (this.startLine = -1),
        (this.endLine = -1),
        (this.inUse = !1);
    }
    get isStruct() {
      return !0;
    }
  },
  ze = class extends Ie {
    constructor(e, t) {
      super(e, t), (this.count = 0), (this.stride = 0);
    }
    get isArray() {
      return !0;
    }
    getTypeName() {
      return `array<${this.format.getTypeName()}, ${this.count}>`;
    }
  },
  Be = class extends Ie {
    constructor(e, t, n) {
      super(e, n), (this.format = t);
    }
    get isPointer() {
      return !0;
    }
    getTypeName() {
      return `&${this.format.getTypeName()}`;
    }
  },
  Ve = class extends Ie {
    constructor(e, t, n, r) {
      super(e, n), (this.format = t), (this.access = r);
    }
    get isTemplate() {
      return !0;
    }
    getTypeName() {
      let e = this.name;
      if (this.format !== null) {
        if (
          e === `vec2` ||
          e === `vec3` ||
          e === `vec4` ||
          e === `mat2x2` ||
          e === `mat2x3` ||
          e === `mat2x4` ||
          e === `mat3x2` ||
          e === `mat3x3` ||
          e === `mat3x4` ||
          e === `mat4x2` ||
          e === `mat4x3` ||
          e === `mat4x4`
        ) {
          if (this.format.name === `f32`) return (e += `f`), e;
          if (this.format.name === `i32`) return (e += `i`), e;
          if (this.format.name === `u32`) return (e += `u`), e;
          if (this.format.name === `bool`) return (e += `b`), e;
          if (this.format.name === `f16`) return (e += `h`), e;
        }
        e += `<${this.format.name}>`;
      } else if (e === `vec2` || e === `vec3` || e === `vec4`) return e;
      return e;
    }
  },
  He;
((e) => {
  (e[(e.Uniform = 0)] = `Uniform`),
    (e[(e.Storage = 1)] = `Storage`),
    (e[(e.Texture = 2)] = `Texture`),
    (e[(e.Sampler = 3)] = `Sampler`),
    (e[(e.StorageTexture = 4)] = `StorageTexture`);
})((He ||= {}));
var Ue = class {
    constructor(e, t, n, r, i, a, o) {
      (this.name = e),
        (this.type = t),
        (this.group = n),
        (this.binding = r),
        (this.attributes = i),
        (this.resourceType = a),
        (this.access = o);
    }
    get isArray() {
      return this.type.isArray;
    }
    get isStruct() {
      return this.type.isStruct;
    }
    get isTemplate() {
      return this.type.isTemplate;
    }
    get size() {
      return this.type.size;
    }
    get align() {
      return this.type.isStruct ? this.type.align : 0;
    }
    get members() {
      return this.type.isStruct ? this.type.members : null;
    }
    get format() {
      return this.type.isArray || this.type.isTemplate
        ? this.type.format
        : null;
    }
    get count() {
      return this.type.isArray ? this.type.count : 0;
    }
    get stride() {
      return this.type.isArray ? this.type.stride : this.size;
    }
  },
  We = class {
    constructor(e, t) {
      (this.name = e), (this.type = t);
    }
  },
  Ge = class {
    constructor(e, t, n, r) {
      (this.name = e),
        (this.type = t),
        (this.locationType = n),
        (this.location = r),
        (this.interpolation = null);
    }
  },
  Ke = class {
    constructor(e, t, n, r) {
      (this.name = e),
        (this.type = t),
        (this.locationType = n),
        (this.location = r);
    }
  },
  qe = class {
    constructor(e, t, n, r) {
      (this.name = e), (this.type = t), (this.attributes = n), (this.id = r);
    }
  },
  Je = class {
    constructor(e, t, n) {
      (this.name = e), (this.type = t), (this.attributes = n);
    }
  },
  Ye = class {
    constructor(e, t = null, n) {
      (this.stage = null),
        (this.inputs = []),
        (this.outputs = []),
        (this.arguments = []),
        (this.returnType = null),
        (this.resources = []),
        (this.overrides = []),
        (this.startLine = -1),
        (this.endLine = -1),
        (this.inUse = !1),
        (this.calls = new Set()),
        (this.name = e),
        (this.stage = t),
        (this.attributes = n);
    }
  },
  Xe = class {
    constructor() {
      (this.vertex = []), (this.fragment = []), (this.compute = []);
    }
  },
  Ze = new Float32Array(1),
  Qe = new Int32Array(Ze.buffer),
  $e = new Uint16Array(1);
function et(e) {
  Ze[0] = e;
  let t = Qe[0],
    n = (t >> 31) & 1,
    r = (t >> 23) & 255,
    i = 8388607 & t;
  if (r === 255)
    return ($e[0] = (n << 15) | 31744 | (i === 0 ? 0 : 512)), $e[0];
  if (r === 0) {
    if (i === 0) return ($e[0] = n << 15), $e[0];
    i |= 8388608;
    let e = 113;
    for (; !(8388608 & i); ) (i <<= 1), e--;
    return (
      (r = 127 - e),
      (i &= 8388607),
      r > 0
        ? ((i = (i >> (126 - r)) + ((i >> (127 - r)) & 1)),
          ($e[0] = (n << 15) | (r << 10) | (i >> 13)),
          $e[0])
        : (($e[0] = n << 15), $e[0])
    );
  }
  return (
    (r = r - 127 + 15),
    r >= 31
      ? (($e[0] = (n << 15) | 31744), $e[0])
      : r <= 0
        ? r < -10
          ? (($e[0] = n << 15), $e[0])
          : ((i = (8388608 | i) >> (1 - r)),
            ($e[0] = (n << 15) | (i >> 13)),
            $e[0])
        : ((i >>= 13), ($e[0] = (n << 15) | (r << 10) | i), $e[0])
  );
}
var tt = new Uint32Array(1),
  nt = new Float32Array(tt.buffer, 0, 1);
function rt(e) {
  return (tt[0] = ((112 + ((e >> 6) & 31)) << 23) | ((63 & e) << 17)), nt[0];
}
function it(e, t, n, r, i, a, o, s, c) {
  let l = r * (o >>= i) * (a >>= i) + n * o + t * s;
  switch (c) {
    case `r8unorm`:
      return [I(e, l, `8unorm`, 1)[0]];
    case `r8snorm`:
      return [I(e, l, `8snorm`, 1)[0]];
    case `r8uint`:
      return [I(e, l, `8uint`, 1)[0]];
    case `r8sint`:
      return [I(e, l, `8sint`, 1)[0]];
    case `rg8unorm`: {
      let t = I(e, l, `8unorm`, 2);
      return [t[0], t[1]];
    }
    case `rg8snorm`: {
      let t = I(e, l, `8snorm`, 2);
      return [t[0], t[1]];
    }
    case `rg8uint`: {
      let t = I(e, l, `8uint`, 2);
      return [t[0], t[1]];
    }
    case `rg8sint`: {
      let t = I(e, l, `8sint`, 2);
      return [t[0], t[1]];
    }
    case `rgba8unorm-srgb`:
    case `rgba8unorm`: {
      let t = I(e, l, `8unorm`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba8snorm`: {
      let t = I(e, l, `8snorm`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba8uint`: {
      let t = I(e, l, `8uint`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba8sint`: {
      let t = I(e, l, `8sint`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `bgra8unorm-srgb`:
    case `bgra8unorm`: {
      let t = I(e, l, `8unorm`, 4);
      return [t[2], t[1], t[0], t[3]];
    }
    case `r16uint`:
      return [I(e, l, `16uint`, 1)[0]];
    case `r16sint`:
      return [I(e, l, `16sint`, 1)[0]];
    case `r16float`:
      return [I(e, l, `16float`, 1)[0]];
    case `rg16uint`: {
      let t = I(e, l, `16uint`, 2);
      return [t[0], t[1]];
    }
    case `rg16sint`: {
      let t = I(e, l, `16sint`, 2);
      return [t[0], t[1]];
    }
    case `rg16float`: {
      let t = I(e, l, `16float`, 2);
      return [t[0], t[1]];
    }
    case `rgba16uint`: {
      let t = I(e, l, `16uint`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba16sint`: {
      let t = I(e, l, `16sint`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba16float`: {
      let t = I(e, l, `16float`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `r32uint`:
      return [I(e, l, `32uint`, 1)[0]];
    case `r32sint`:
      return [I(e, l, `32sint`, 1)[0]];
    case `depth16unorm`:
    case `depth24plus`:
    case `depth24plus-stencil8`:
    case `depth32float`:
    case `depth32float-stencil8`:
    case `r32float`:
      return [I(e, l, `32float`, 1)[0]];
    case `rg32uint`: {
      let t = I(e, l, `32uint`, 2);
      return [t[0], t[1]];
    }
    case `rg32sint`: {
      let t = I(e, l, `32sint`, 2);
      return [t[0], t[1]];
    }
    case `rg32float`: {
      let t = I(e, l, `32float`, 2);
      return [t[0], t[1]];
    }
    case `rgba32uint`: {
      let t = I(e, l, `32uint`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba32sint`: {
      let t = I(e, l, `32sint`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rgba32float`: {
      let t = I(e, l, `32float`, 4);
      return [t[0], t[1], t[2], t[3]];
    }
    case `rg11b10ufloat`: {
      let t = new Uint32Array(e.buffer, l, 1)[0],
        n = (4192256 & t) >> 11,
        r = (4290772992 & t) >> 22;
      return [
        rt(2047 & t),
        rt(n),
        (function (e) {
          return (
            (tt[0] = ((112 + ((e >> 5) & 31)) << 23) | ((31 & e) << 18)), nt[0]
          );
        })(r),
        1,
      ];
    }
  }
  return null;
}
function I(e, t, n, r) {
  let i = [0, 0, 0, 0];
  for (let l = 0; l < r; ++l)
    switch (n) {
      case `8unorm`:
        (i[l] = e[t] / 255), t++;
        break;
      case `8snorm`:
        (i[l] = (e[t] / 255) * 2 - 1), t++;
        break;
      case `8uint`:
        (i[l] = e[t]), t++;
        break;
      case `8sint`:
        (i[l] = e[t] - 127), t++;
        break;
      case `16uint`:
        (i[l] = e[t] | (e[t + 1] << 8)), (t += 2);
        break;
      case `16sint`:
        (i[l] = (e[t] | (e[t + 1] << 8)) - 32768), (t += 2);
        break;
      case `16float`:
        (i[l] =
          ((a = e[t] | (e[t + 1] << 8)),
          (o = void 0),
          (s = void 0),
          (c = void 0),
          (o = (32768 & a) >> 15),
          (c = 1023 & a),
          (s = (31744 & a) >> 10) == 0
            ? (o ? -1 : 1) * 2 ** -14 * (c / 1024)
            : s == 31
              ? c
                ? NaN
                : (1 / 0) * (o ? -1 : 1)
              : (o ? -1 : 1) * 2 ** (s - 15) * (1 + c / 1024))),
          (t += 2);
        break;
      case `32uint`:
      case `32sint`:
        (i[l] = e[t] | (e[t + 1] << 8) | (e[t + 2] << 16) | (e[t + 3] << 24)),
          (t += 4);
        break;
      case `32float`:
        (i[l] = new Float32Array(e.buffer, t, 1)[0]), (t += 4);
    }
  var a, o, s, c;
  return i;
}
function L(e, t, n, r, i) {
  for (let a = 0; a < r; ++a)
    switch (n) {
      case `8unorm`:
        (e[t] = 255 * i[a]), t++;
        break;
      case `8snorm`:
        (e[t] = 0.5 * (i[a] + 1) * 255), t++;
        break;
      case `8uint`:
        (e[t] = i[a]), t++;
        break;
      case `8sint`:
        (e[t] = i[a] + 127), t++;
        break;
      case `16uint`:
        (new Uint16Array(e.buffer, t, 1)[0] = i[a]), (t += 2);
        break;
      case `16sint`:
        (new Int16Array(e.buffer, t, 1)[0] = i[a]), (t += 2);
        break;
      case `16float`: {
        let n = et(i[a]);
        (new Uint16Array(e.buffer, t, 1)[0] = n), (t += 2);
        break;
      }
      case `32uint`:
        (new Uint32Array(e.buffer, t, 1)[0] = i[a]), (t += 4);
        break;
      case `32sint`:
        (new Int32Array(e.buffer, t, 1)[0] = i[a]), (t += 4);
        break;
      case `32float`:
        (new Float32Array(e.buffer, t, 1)[0] = i[a]), (t += 4);
    }
  return i;
}
var at = {
    r8unorm: {
      bytesPerBlock: 1,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r8snorm: {
      bytesPerBlock: 1,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r8uint: {
      bytesPerBlock: 1,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r8sint: {
      bytesPerBlock: 1,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    rg8unorm: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg8snorm: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg8uint: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg8sint: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rgba8unorm: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    "rgba8unorm-srgb": {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba8snorm: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba8uint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba8sint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    bgra8unorm: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    "bgra8unorm-srgb": {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    r16uint: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r16sint: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r16float: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    rg16uint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg16sint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg16float: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rgba16uint: {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba16sint: {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba16float: {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    r32uint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r32sint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    r32float: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 1,
    },
    rg32uint: {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg32sint: {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rg32float: {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 2,
    },
    rgba32uint: {
      bytesPerBlock: 16,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba32sint: {
      bytesPerBlock: 16,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgba32float: {
      bytesPerBlock: 16,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgb10a2uint: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rgb10a2unorm: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    rg11b10ufloat: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    stencil8: {
      bytesPerBlock: 1,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      isDepthStencil: !0,
      hasDepth: !1,
      hasStencil: !0,
      channels: 1,
    },
    depth16unorm: {
      bytesPerBlock: 2,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      isDepthStencil: !0,
      hasDepth: !0,
      hasStencil: !1,
      channels: 1,
    },
    depth24plus: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      isDepthStencil: !0,
      hasDepth: !0,
      hasStencil: !1,
      depthOnlyFormat: `depth32float`,
      channels: 1,
    },
    "depth24plus-stencil8": {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      isDepthStencil: !0,
      hasDepth: !0,
      hasStencil: !0,
      depthOnlyFormat: `depth32float`,
      channels: 1,
    },
    depth32float: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      isDepthStencil: !0,
      hasDepth: !0,
      hasStencil: !1,
      channels: 1,
    },
    "depth32float-stencil8": {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      isDepthStencil: !0,
      hasDepth: !0,
      hasStencil: !0,
      stencilOnlyFormat: `depth32float`,
      channels: 1,
    },
    rgb9e5ufloat: {
      bytesPerBlock: 4,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !1,
      channels: 4,
    },
    "bc1-rgba-unorm": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc1-rgba-unorm-srgb": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc2-rgba-unorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc2-rgba-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc3-rgba-unorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc3-rgba-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc4-r-unorm": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 1,
    },
    "bc4-r-snorm": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 1,
    },
    "bc5-rg-unorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 2,
    },
    "bc5-rg-snorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 2,
    },
    "bc6h-rgb-ufloat": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc6h-rgb-float": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc7-rgba-unorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "bc7-rgba-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "etc2-rgb8unorm": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "etc2-rgb8unorm-srgb": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "etc2-rgb8a1unorm": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "etc2-rgb8a1unorm-srgb": {
      bytesPerBlock: 8,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "etc2-rgba8unorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "etc2-rgba8unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "eac-r11unorm": {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !0,
      channels: 1,
    },
    "eac-r11snorm": {
      bytesPerBlock: 8,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !0,
      channels: 1,
    },
    "eac-rg11unorm": {
      bytesPerBlock: 16,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !0,
      channels: 2,
    },
    "eac-rg11snorm": {
      bytesPerBlock: 16,
      blockWidth: 1,
      blockHeight: 1,
      isCompressed: !0,
      channels: 2,
    },
    "astc-4x4-unorm": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "astc-4x4-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 4,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "astc-5x4-unorm": {
      bytesPerBlock: 16,
      blockWidth: 5,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "astc-5x4-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 5,
      blockHeight: 4,
      isCompressed: !0,
      channels: 4,
    },
    "astc-5x5-unorm": {
      bytesPerBlock: 16,
      blockWidth: 5,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-5x5-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 5,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-6x5-unorm": {
      bytesPerBlock: 16,
      blockWidth: 6,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-6x5-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 6,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-6x6-unorm": {
      bytesPerBlock: 16,
      blockWidth: 6,
      blockHeight: 6,
      isCompressed: !0,
      channels: 4,
    },
    "astc-6x6-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 6,
      blockHeight: 6,
      isCompressed: !0,
      channels: 4,
    },
    "astc-8x5-unorm": {
      bytesPerBlock: 16,
      blockWidth: 8,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-8x5-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 8,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-8x6-unorm": {
      bytesPerBlock: 16,
      blockWidth: 8,
      blockHeight: 6,
      isCompressed: !0,
      channels: 4,
    },
    "astc-8x6-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 8,
      blockHeight: 6,
      isCompressed: !0,
      channels: 4,
    },
    "astc-8x8-unorm": {
      bytesPerBlock: 16,
      blockWidth: 8,
      blockHeight: 8,
      isCompressed: !0,
      channels: 4,
    },
    "astc-8x8-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 8,
      blockHeight: 8,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x5-unorm": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x5-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 5,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x6-unorm": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 6,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x6-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 6,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x8-unorm": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 8,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x8-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 8,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x10-unorm": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 10,
      isCompressed: !0,
      channels: 4,
    },
    "astc-10x10-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 10,
      blockHeight: 10,
      isCompressed: !0,
      channels: 4,
    },
    "astc-12x10-unorm": {
      bytesPerBlock: 16,
      blockWidth: 12,
      blockHeight: 10,
      isCompressed: !0,
      channels: 4,
    },
    "astc-12x10-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 12,
      blockHeight: 10,
      isCompressed: !0,
      channels: 4,
    },
    "astc-12x12-unorm": {
      bytesPerBlock: 16,
      blockWidth: 12,
      blockHeight: 12,
      isCompressed: !0,
      channels: 4,
    },
    "astc-12x12-unorm-srgb": {
      bytesPerBlock: 16,
      blockWidth: 12,
      blockHeight: 12,
      isCompressed: !0,
      channels: 4,
    },
  },
  ot = class e {
    constructor() {
      (this.id = e._id++), (this.line = 0);
    }
    get isAstNode() {
      return !0;
    }
    get astNodeType() {
      return ``;
    }
    search(e) {
      e(this);
    }
    searchBlock(e, t) {
      if (e) {
        t(st.instance);
        for (let n of e)
          n instanceof Array ? this.searchBlock(n, t) : n.search(t);
        t(ct.instance);
      }
    }
    constEvaluate(e, t) {
      throw Error(`Cannot evaluate node`);
    }
    constEvaluateString(e) {
      return this.constEvaluate(e).toString();
    }
  };
ot._id = 0;
var st = class extends ot {};
st.instance = new st();
var ct = class extends ot {};
ct.instance = new ct();
var lt = new Set(
    `all.all.any.select.arrayLength.abs.acos.acosh.asin.asinh.atan.atanh.atan2.ceil.clamp.cos.cosh.countLeadingZeros.countOneBits.countTrailingZeros.cross.degrees.determinant.distance.dot.dot4U8Packed.dot4I8Packed.exp.exp2.extractBits.faceForward.firstLeadingBit.firstTrailingBit.floor.fma.fract.frexp.insertBits.inverseSqrt.ldexp.length.log.log2.max.min.mix.modf.normalize.pow.quantizeToF16.radians.reflect.refract.reverseBits.round.saturate.sign.sin.sinh.smoothStep.sqrt.step.tan.tanh.transpose.trunc.dpdx.dpdxCoarse.dpdxFine.dpdy.dpdyCoarse.dpdyFine.fwidth.fwidthCoarse.fwidthFine.textureDimensions.textureGather.textureGatherCompare.textureLoad.textureNumLayers.textureNumLevels.textureNumSamples.textureSample.textureSampleBias.textureSampleCompare.textureSampleCompareLevel.textureSampleGrad.textureSampleLevel.textureSampleBaseClampToEdge.textureStore.atomicLoad.atomicStore.atomicAdd.atomicSub.atomicMax.atomicMin.atomicAnd.atomicOr.atomicXor.atomicExchange.atomicCompareExchangeWeak.pack4x8snorm.pack4x8unorm.pack4xI8.pack4xU8.pack4x8Clamp.pack4xU8Clamp.pack2x16snorm.pack2x16unorm.pack2x16float.unpack4x8snorm.unpack4x8unorm.unpack4xI8.unpack4xU8.unpack2x16snorm.unpack2x16unorm.unpack2x16float.storageBarrier.textureBarrier.workgroupBarrier.workgroupUniformLoad.subgroupAdd.subgroupExclusiveAdd.subgroupInclusiveAdd.subgroupAll.subgroupAnd.subgroupAny.subgroupBallot.subgroupBroadcast.subgroupBroadcastFirst.subgroupElect.subgroupMax.subgroupMin.subgroupMul.subgroupExclusiveMul.subgroupInclusiveMul.subgroupOr.subgroupShuffle.subgroupShuffleDown.subgroupShuffleUp.subgroupShuffleXor.subgroupXor.quadBroadcast.quadSwapDiagonal.quadSwapX.quadSwapY`.split(
      `.`,
    ),
  ),
  R = class extends ot {
    constructor() {
      super();
    }
  },
  ut = class extends R {
    constructor(e, t, n, r, i, a) {
      super(),
        (this.calls = new Set()),
        (this.name = e),
        (this.args = t),
        (this.returnType = n),
        (this.body = r),
        (this.startLine = i),
        (this.endLine = a);
    }
    get astNodeType() {
      return `function`;
    }
    search(e) {
      if (this.attributes) for (let t of this.attributes) e(t);
      e(this);
      for (let t of this.args) e(t);
      this.searchBlock(this.body, e);
    }
  },
  dt = class extends R {
    constructor(e) {
      super(), (this.expression = e);
    }
    get astNodeType() {
      return `staticAssert`;
    }
    search(e) {
      this.expression.search(e);
    }
  },
  ft = class extends R {
    constructor(e, t) {
      super(), (this.condition = e), (this.body = t);
    }
    get astNodeType() {
      return `while`;
    }
    search(e) {
      this.condition.search(e), this.searchBlock(this.body, e);
    }
  },
  pt = class extends R {
    constructor(e, t) {
      super(), (this.body = e), (this.loopId = t);
    }
    get astNodeType() {
      return `continuing`;
    }
    search(e) {
      this.searchBlock(this.body, e);
    }
  },
  mt = class extends R {
    constructor(e, t, n, r) {
      super(),
        (this.init = e),
        (this.condition = t),
        (this.increment = n),
        (this.body = r);
    }
    get astNodeType() {
      return `for`;
    }
    search(e) {
      var t, n, r;
      (t = this.init) == null || t.search(e),
        (n = this.condition) == null || n.search(e),
        (r = this.increment) == null || r.search(e),
        this.searchBlock(this.body, e);
    }
  },
  ht = class extends R {
    constructor(e, t, n, r, i) {
      super(),
        (this.attributes = null),
        (this.name = e),
        (this.type = t),
        (this.storage = n),
        (this.access = r),
        (this.value = i);
    }
    get astNodeType() {
      return `var`;
    }
    search(e) {
      var t;
      e(this), (t = this.value) == null || t.search(e);
    }
  },
  gt = class extends R {
    constructor(e, t, n) {
      super(),
        (this.attributes = null),
        (this.name = e),
        (this.type = t),
        (this.value = n);
    }
    get astNodeType() {
      return `override`;
    }
    search(e) {
      var t;
      (t = this.value) == null || t.search(e);
    }
  },
  _t = class extends R {
    constructor(e, t, n, r, i) {
      super(),
        (this.attributes = null),
        (this.name = e),
        (this.type = t),
        (this.storage = n),
        (this.access = r),
        (this.value = i);
    }
    get astNodeType() {
      return `let`;
    }
    search(e) {
      var t;
      e(this), (t = this.value) == null || t.search(e);
    }
  },
  vt = class extends R {
    constructor(e, t, n, r, i) {
      super(),
        (this.attributes = null),
        (this.name = e),
        (this.type = t),
        (this.storage = n),
        (this.access = r),
        (this.value = i);
    }
    get astNodeType() {
      return `const`;
    }
    constEvaluate(e, t) {
      return this.value.constEvaluate(e, t);
    }
    search(e) {
      var t;
      e(this), (t = this.value) == null || t.search(e);
    }
  },
  yt,
  bt,
  z,
  B;
((e) => {
  (e.increment = `++`), (e.decrement = `--`);
})((yt ||= {})),
  ((e) => {
    e.parse = function (t) {
      let n = t;
      if (n == `parse`) throw Error(`Invalid value for IncrementOperator`);
      return e[n];
    };
  })((yt ||= {}));
var xt = class extends R {
  constructor(e, t) {
    super(), (this.operator = e), (this.variable = t);
  }
  get astNodeType() {
    return `increment`;
  }
  search(e) {
    this.variable.search(e);
  }
};
((e) => {
  (e.assign = `=`),
    (e.addAssign = `+=`),
    (e.subtractAssin = `-=`),
    (e.multiplyAssign = `*=`),
    (e.divideAssign = `/=`),
    (e.moduloAssign = `%=`),
    (e.andAssign = `&=`),
    (e.orAssign = `|=`),
    (e.xorAssign = `^=`),
    (e.shiftLeftAssign = `<<=`),
    (e.shiftRightAssign = `>>=`);
})((bt ||= {})),
  ((e) => {
    e.parse = function (e) {
      let t = e;
      if (t == `parse`) throw Error(`Invalid value for AssignOperator`);
      return t;
    };
  })((bt ||= {}));
var St = class extends R {
    constructor(e, t, n) {
      super(), (this.operator = e), (this.variable = t), (this.value = n);
    }
    get astNodeType() {
      return `assign`;
    }
    search(e) {
      this.variable.search(e), this.value.search(e);
    }
  },
  Ct = class extends R {
    constructor(e, t) {
      super(), (this.name = e), (this.args = t);
    }
    get astNodeType() {
      return `call`;
    }
    isBuiltin() {
      return lt.has(this.name);
    }
    search(e) {
      for (let t of this.args) t.search(e);
      e(this);
    }
  },
  wt = class extends R {
    constructor(e, t) {
      super(), (this.body = e), (this.continuing = t);
    }
    get astNodeType() {
      return `loop`;
    }
  },
  Tt = class extends R {
    constructor(e, t) {
      super(), (this.condition = e), (this.cases = t);
    }
    get astNodeType() {
      return `switch`;
    }
  },
  Et = class extends R {
    constructor(e, t, n, r) {
      super(),
        (this.condition = e),
        (this.body = t),
        (this.elseif = n),
        (this.else = r);
    }
    get astNodeType() {
      return `if`;
    }
    search(e) {
      this.condition.search(e),
        this.searchBlock(this.body, e),
        this.searchBlock(this.elseif, e),
        this.searchBlock(this.else, e);
    }
  },
  Dt = class extends R {
    constructor(e) {
      super(), (this.value = e);
    }
    get astNodeType() {
      return `return`;
    }
    search(e) {
      var t;
      (t = this.value) == null || t.search(e);
    }
  },
  Ot = class extends R {
    constructor(e) {
      super(), (this.name = e);
    }
    get astNodeType() {
      return `enable`;
    }
  },
  kt = class extends R {
    constructor(e) {
      super(), (this.extensions = e);
    }
    get astNodeType() {
      return `requires`;
    }
  },
  At = class extends R {
    constructor(e, t) {
      super(), (this.severity = e), (this.rule = t);
    }
    get astNodeType() {
      return `diagnostic`;
    }
  },
  jt = class extends R {
    constructor(e, t) {
      super(), (this.name = e), (this.type = t);
    }
    get astNodeType() {
      return `alias`;
    }
  },
  Mt = class extends R {
    constructor() {
      super();
    }
    get astNodeType() {
      return `discard`;
    }
  },
  Nt = class extends R {
    constructor() {
      super(), (this.condition = null), (this.loopId = -1);
    }
    get astNodeType() {
      return `break`;
    }
  },
  Pt = class extends R {
    constructor() {
      super(), (this.loopId = -1);
    }
    get astNodeType() {
      return `continue`;
    }
  },
  V = class e extends R {
    constructor(e) {
      super(), (this.attributes = null), (this.name = e);
    }
    get astNodeType() {
      return `type`;
    }
    get isStruct() {
      return !1;
    }
    get isArray() {
      return !1;
    }
    static maxFormatType(t) {
      let n = t[0];
      if (n.name === `f32`) return n;
      for (let r = 1; r < t.length; ++r) {
        let i = e._priority.get(n.name);
        e._priority.get(t[r].name) < i && (n = t[r]);
      }
      return n.name === `x32` ? e.i32 : n;
    }
    getTypeName() {
      return this.name;
    }
  };
(V.x32 = new V(`x32`)),
  (V.f32 = new V(`f32`)),
  (V.i32 = new V(`i32`)),
  (V.u32 = new V(`u32`)),
  (V.f16 = new V(`f16`)),
  (V.bool = new V(`bool`)),
  (V.void = new V(`void`)),
  (V._priority = new Map([
    [`f32`, 0],
    [`f16`, 1],
    [`u32`, 2],
    [`i32`, 3],
    [`x32`, 3],
  ]));
var Ft = class extends V {
    constructor(e) {
      super(e);
    }
  },
  It = class extends V {
    constructor(e, t, n, r) {
      super(e), (this.members = t), (this.startLine = n), (this.endLine = r);
    }
    get astNodeType() {
      return `struct`;
    }
    get isStruct() {
      return !0;
    }
    getMemberIndex(e) {
      for (let t = 0; t < this.members.length; t++)
        if (this.members[t].name == e) return t;
      return -1;
    }
    search(e) {
      for (let t of this.members) e(t);
    }
  },
  H = class extends V {
    constructor(e, t, n) {
      super(e), (this.format = t), (this.access = n);
    }
    get astNodeType() {
      return `template`;
    }
    getTypeName() {
      let e = this.name;
      if (this.format !== null) {
        if (
          e === `vec2` ||
          e === `vec3` ||
          e === `vec4` ||
          e === `mat2x2` ||
          e === `mat2x3` ||
          e === `mat2x4` ||
          e === `mat3x2` ||
          e === `mat3x3` ||
          e === `mat3x4` ||
          e === `mat4x2` ||
          e === `mat4x3` ||
          e === `mat4x4`
        ) {
          if (this.format.name === `f32`) return (e += `f`), e;
          if (this.format.name === `i32`) return (e += `i`), e;
          if (this.format.name === `u32`) return (e += `u`), e;
          if (this.format.name === `bool`) return (e += `b`), e;
          if (this.format.name === `f16`) return (e += `h`), e;
        }
        e += `<${this.format.name}>`;
      } else if (e === `vec2` || e === `vec3` || e === `vec4`) return e;
      return e;
    }
  };
(H.vec2f = new H(`vec2`, V.f32, null)),
  (H.vec3f = new H(`vec3`, V.f32, null)),
  (H.vec4f = new H(`vec4`, V.f32, null)),
  (H.vec2i = new H(`vec2`, V.i32, null)),
  (H.vec3i = new H(`vec3`, V.i32, null)),
  (H.vec4i = new H(`vec4`, V.i32, null)),
  (H.vec2u = new H(`vec2`, V.u32, null)),
  (H.vec3u = new H(`vec3`, V.u32, null)),
  (H.vec4u = new H(`vec4`, V.u32, null)),
  (H.vec2h = new H(`vec2`, V.f16, null)),
  (H.vec3h = new H(`vec3`, V.f16, null)),
  (H.vec4h = new H(`vec4`, V.f16, null)),
  (H.vec2b = new H(`vec2`, V.bool, null)),
  (H.vec3b = new H(`vec3`, V.bool, null)),
  (H.vec4b = new H(`vec4`, V.bool, null)),
  (H.mat2x2f = new H(`mat2x2`, V.f32, null)),
  (H.mat2x3f = new H(`mat2x3`, V.f32, null)),
  (H.mat2x4f = new H(`mat2x4`, V.f32, null)),
  (H.mat3x2f = new H(`mat3x2`, V.f32, null)),
  (H.mat3x3f = new H(`mat3x3`, V.f32, null)),
  (H.mat3x4f = new H(`mat3x4`, V.f32, null)),
  (H.mat4x2f = new H(`mat4x2`, V.f32, null)),
  (H.mat4x3f = new H(`mat4x3`, V.f32, null)),
  (H.mat4x4f = new H(`mat4x4`, V.f32, null)),
  (H.mat2x2h = new H(`mat2x2`, V.f16, null)),
  (H.mat2x3h = new H(`mat2x3`, V.f16, null)),
  (H.mat2x4h = new H(`mat2x4`, V.f16, null)),
  (H.mat3x2h = new H(`mat3x2`, V.f16, null)),
  (H.mat3x3h = new H(`mat3x3`, V.f16, null)),
  (H.mat3x4h = new H(`mat3x4`, V.f16, null)),
  (H.mat4x2h = new H(`mat4x2`, V.f16, null)),
  (H.mat4x3h = new H(`mat4x3`, V.f16, null)),
  (H.mat4x4h = new H(`mat4x4`, V.f16, null)),
  (H.mat2x2i = new H(`mat2x2`, V.i32, null)),
  (H.mat2x3i = new H(`mat2x3`, V.i32, null)),
  (H.mat2x4i = new H(`mat2x4`, V.i32, null)),
  (H.mat3x2i = new H(`mat3x2`, V.i32, null)),
  (H.mat3x3i = new H(`mat3x3`, V.i32, null)),
  (H.mat3x4i = new H(`mat3x4`, V.i32, null)),
  (H.mat4x2i = new H(`mat4x2`, V.i32, null)),
  (H.mat4x3i = new H(`mat4x3`, V.i32, null)),
  (H.mat4x4i = new H(`mat4x4`, V.i32, null)),
  (H.mat2x2u = new H(`mat2x2`, V.u32, null)),
  (H.mat2x3u = new H(`mat2x3`, V.u32, null)),
  (H.mat2x4u = new H(`mat2x4`, V.u32, null)),
  (H.mat3x2u = new H(`mat3x2`, V.u32, null)),
  (H.mat3x3u = new H(`mat3x3`, V.u32, null)),
  (H.mat3x4u = new H(`mat3x4`, V.u32, null)),
  (H.mat4x2u = new H(`mat4x2`, V.u32, null)),
  (H.mat4x3u = new H(`mat4x3`, V.u32, null)),
  (H.mat4x4u = new H(`mat4x4`, V.u32, null));
var Lt = class extends V {
    constructor(e, t, n, r) {
      super(e), (this.storage = t), (this.type = n), (this.access = r);
    }
    get astNodeType() {
      return `pointer`;
    }
  },
  Rt = class extends V {
    constructor(e, t, n, r) {
      super(e), (this.attributes = t), (this.format = n), (this.count = r);
    }
    get astNodeType() {
      return `array`;
    }
    get isArray() {
      return !0;
    }
  },
  zt = class extends V {
    constructor(e, t, n) {
      super(e), (this.format = t), (this.access = n);
    }
    get astNodeType() {
      return `sampler`;
    }
  },
  Bt = class extends ot {
    constructor() {
      super(), (this.postfix = null);
    }
  },
  Vt = class extends Bt {
    constructor(e) {
      super(), (this.value = e);
    }
    get astNodeType() {
      return `stringExpr`;
    }
    toString() {
      return this.value;
    }
    constEvaluateString() {
      return this.value;
    }
  },
  Ht = class extends Bt {
    constructor(e, t) {
      super(), (this.type = e), (this.args = t);
    }
    get astNodeType() {
      return `createExpr`;
    }
    search(e) {
      if ((e(this), this.args)) for (let t of this.args) t.search(e);
    }
    constEvaluate(e, t) {
      return t && (t[0] = this.type), e.evalExpression(this, e.context);
    }
  },
  Ut = class extends Bt {
    constructor(e, t) {
      super(),
        (this.cachedReturnValue = null),
        (this.name = e),
        (this.args = t);
    }
    get astNodeType() {
      return `callExpr`;
    }
    setCachedReturnValue(e) {
      this.cachedReturnValue = e;
    }
    get isBuiltin() {
      return lt.has(this.name);
    }
    constEvaluate(e, t) {
      return e.evalExpression(this, e.context);
    }
    search(e) {
      for (let t of this.args) t.search(e);
      e(this);
    }
  },
  Wt = class extends Bt {
    constructor(e) {
      super(), (this.name = e);
    }
    get astNodeType() {
      return `varExpr`;
    }
    search(e) {
      e(this), this.postfix && this.postfix.search(e);
    }
    constEvaluate(e, t) {
      return e.evalExpression(this, e.context);
    }
  },
  Gt = class extends Bt {
    constructor(e, t) {
      super(), (this.name = e), (this.initializer = t);
    }
    get astNodeType() {
      return `constExpr`;
    }
    constEvaluate(e, t) {
      if (this.initializer) {
        let t = e.evalExpression(this.initializer, e.context);
        return t !== null && this.postfix
          ? t.getSubData(e, this.postfix, e.context)
          : t;
      }
      return null;
    }
    search(e) {
      this.initializer.search(e);
    }
  },
  Kt = class extends Bt {
    constructor(e, t) {
      super(), (this.value = e), (this.type = t);
    }
    get astNodeType() {
      return `literalExpr`;
    }
    constEvaluate(e, t) {
      return t !== void 0 && (t[0] = this.type), this.value;
    }
    get isScalar() {
      return this.value instanceof W;
    }
    get isVector() {
      return this.value instanceof G || this.value instanceof K;
    }
    get scalarValue() {
      return this.value instanceof W
        ? this.value.value
        : (console.error(`Value is not scalar.`), 0);
    }
    get vectorValue() {
      return this.value instanceof G || this.value instanceof K
        ? this.value.data
        : (console.error(`Value is not a vector or matrix.`),
          new Float32Array());
    }
  },
  qt = class extends Bt {
    constructor(e, t) {
      super(), (this.type = e), (this.value = t);
    }
    get astNodeType() {
      return `bitcastExpr`;
    }
    search(e) {
      this.value.search(e);
    }
  },
  Jt = class extends Bt {
    constructor(e) {
      super(), (this.index = e);
    }
    search(e) {
      this.index.search(e);
    }
  },
  Yt = class extends Bt {
    constructor() {
      super();
    }
  },
  U = class extends Yt {
    constructor(e, t) {
      super(), (this.operator = e), (this.right = t);
    }
    get astNodeType() {
      return `unaryOp`;
    }
    constEvaluate(e, t) {
      return e.evalExpression(this, e.context);
    }
    search(e) {
      this.right.search(e);
    }
  },
  Xt = class extends Yt {
    constructor(e, t, n) {
      super(), (this.operator = e), (this.left = t), (this.right = n);
    }
    get astNodeType() {
      return `binaryOp`;
    }
    _getPromotedType(e, t) {
      return e.name === t.name
        ? e
        : e.name === `f32` || t.name === `f32`
          ? V.f32
          : e.name === `u32` || t.name === `u32`
            ? V.u32
            : V.i32;
    }
    constEvaluate(e, t) {
      return e.evalExpression(this, e.context);
    }
    search(e) {
      this.left.search(e), this.right.search(e);
    }
  },
  Zt = class extends ot {
    constructor(e) {
      super(), (this.body = e);
    }
  },
  Qt = class extends Bt {
    constructor() {
      super();
    }
    get astNodeType() {
      return `default`;
    }
  },
  $t = class extends Zt {
    constructor(e, t) {
      super(t), (this.selectors = e);
    }
    get astNodeType() {
      return `case`;
    }
    search(e) {
      this.searchBlock(this.body, e);
    }
  },
  en = class extends Zt {
    constructor(e) {
      super(e);
    }
    get astNodeType() {
      return `default`;
    }
    search(e) {
      this.searchBlock(this.body, e);
    }
  },
  tn = class extends ot {
    constructor(e, t, n) {
      super(), (this.name = e), (this.type = t), (this.attributes = n);
    }
    get astNodeType() {
      return `argument`;
    }
  },
  nn = class extends ot {
    constructor(e, t) {
      super(), (this.condition = e), (this.body = t);
    }
    get astNodeType() {
      return `elseif`;
    }
    search(e) {
      this.condition.search(e), this.searchBlock(this.body, e);
    }
  },
  rn = class extends ot {
    constructor(e, t, n) {
      super(), (this.name = e), (this.type = t), (this.attributes = n);
    }
    get astNodeType() {
      return `member`;
    }
  },
  an = class extends ot {
    constructor(e, t) {
      super(), (this.name = e), (this.value = t);
    }
    get astNodeType() {
      return `attribute`;
    }
  },
  on = class e {
    constructor(t, n) {
      (this.parent = null),
        (this.typeInfo = t),
        (this.parent = n),
        (this.id = e._id++);
    }
    clone() {
      throw `Clone: Not implemented for ${this.constructor.name}`;
    }
    setDataValue(e, t, n, r) {
      console.error(
        `SetDataValue: Not implemented for ${this.constructor.name}`,
      );
    }
    getSubData(e, t, n) {
      return (
        console.error(
          `GetDataValue: Not implemented for ${this.constructor.name}`,
        ),
        null
      );
    }
    toString() {
      return `<${this.typeInfo.getTypeName()}>`;
    }
  };
on._id = 0;
var sn = class extends on {
  constructor() {
    super(new Ie(`void`, null), null);
  }
  toString() {
    return `void`;
  }
};
sn.void = new sn();
var cn = class extends on {
    constructor(e) {
      super(new Be(`pointer`, e.typeInfo, null), null), (this.reference = e);
    }
    clone() {
      return this;
    }
    setDataValue(e, t, n, r) {
      this.reference.setDataValue(e, t, n, r);
    }
    getSubData(e, t, n) {
      return t ? this.reference.getSubData(e, t, n) : this;
    }
    toString() {
      return `&${this.reference.toString()}`;
    }
  },
  W = class e extends on {
    constructor(e, t, n = null) {
      super(t, n),
        e instanceof Int32Array ||
        e instanceof Uint32Array ||
        e instanceof Float32Array
          ? (this.data = e)
          : this.typeInfo.name === `x32`
            ? (this.data =
                e - Math.floor(e) == 0
                  ? e >= 0
                    ? new Uint32Array([e])
                    : new Int32Array([e])
                  : new Float32Array([e]))
            : this.typeInfo.name === `i32` || this.typeInfo.name === `bool`
              ? (this.data = new Int32Array([e]))
              : this.typeInfo.name === `u32`
                ? (this.data = new Uint32Array([e]))
                : this.typeInfo.name === `f32` || this.typeInfo.name === `f16`
                  ? (this.data = new Float32Array([e]))
                  : console.error(`ScalarData2: Invalid type`, t);
    }
    clone() {
      if (this.data instanceof Float32Array)
        return new e(new Float32Array(this.data), this.typeInfo, null);
      if (this.data instanceof Int32Array)
        return new e(new Int32Array(this.data), this.typeInfo, null);
      if (this.data instanceof Uint32Array)
        return new e(new Uint32Array(this.data), this.typeInfo, null);
      throw `ScalarData: Invalid data type`;
    }
    get value() {
      return this.data[0];
    }
    set value(e) {
      this.data[0] = e;
    }
    setDataValue(t, n, r, i) {
      if (r)
        return void console.error(
          `SetDataValue: Scalar data does not support postfix`,
          r,
        );
      if (!(n instanceof e))
        return void console.error(`SetDataValue: Invalid value`, n);
      let a = n.data[0];
      this.typeInfo.name === `i32` || this.typeInfo.name === `u32`
        ? (a = Math.floor(a))
        : this.typeInfo.name === `bool` && (a = +!!a),
        (this.data[0] = a);
    }
    getSubData(e, t, n) {
      return t
        ? (console.error(`getSubData: Scalar data does not support postfix`, t),
          null)
        : this;
    }
    toString() {
      return `${this.value}`;
    }
  };
function ln(e, t, n) {
  let r = t.length;
  return r === 2
    ? n === `f32`
      ? new G(new Float32Array(t), e.getTypeInfo(`vec2f`))
      : n === `i32` || n === `bool`
        ? new G(new Int32Array(t), e.getTypeInfo(`vec2i`))
        : n === `u32`
          ? new G(new Uint32Array(t), e.getTypeInfo(`vec2u`))
          : n === `f16`
            ? new G(new Float32Array(t), e.getTypeInfo(`vec2h`))
            : (console.error(`getSubData: Unknown format ${n}`), null)
    : r === 3
      ? n === `f32`
        ? new G(new Float32Array(t), e.getTypeInfo(`vec3f`))
        : n === `i32` || n === `bool`
          ? new G(new Int32Array(t), e.getTypeInfo(`vec3i`))
          : n === `u32`
            ? new G(new Uint32Array(t), e.getTypeInfo(`vec3u`))
            : n === `f16`
              ? new G(new Float32Array(t), e.getTypeInfo(`vec3h`))
              : (console.error(`getSubData: Unknown format ${n}`), null)
      : r === 4
        ? n === `f32`
          ? new G(new Float32Array(t), e.getTypeInfo(`vec4f`))
          : n === `i32` || n === `bool`
            ? new G(new Int32Array(t), e.getTypeInfo(`vec4i`))
            : n === `u32`
              ? new G(new Uint32Array(t), e.getTypeInfo(`vec4u`))
              : n === `f16`
                ? new G(new Float32Array(t), e.getTypeInfo(`vec4h`))
                : (console.error(`getSubData: Unknown format ${n}`), null)
        : (console.error(`getSubData: Invalid vector size ${t.length}`), null);
}
var G = class e extends on {
    constructor(e, t, n = null) {
      if (
        (super(t, n),
        e instanceof Float32Array ||
          e instanceof Uint32Array ||
          e instanceof Int32Array)
      )
        this.data = e;
      else {
        let t = this.typeInfo.name;
        t === `vec2f` || t === `vec3f` || t === `vec4f`
          ? (this.data = new Float32Array(e))
          : t === `vec2i` || t === `vec3i` || t === `vec4i`
            ? (this.data = new Int32Array(e))
            : t === `vec2u` || t === `vec3u` || t === `vec4u`
              ? (this.data = new Uint32Array(e))
              : t === `vec2h` || t === `vec3h` || t === `vec4h`
                ? (this.data = new Float32Array(e))
                : t === `vec2b` || t === `vec3b` || t === `vec4b`
                  ? (this.data = new Int32Array(e))
                  : t === `vec2` || t === `vec3` || t === `vec4`
                    ? (this.data = new Float32Array(e))
                    : console.error(`VectorData: Invalid type ${t}`);
      }
    }
    clone() {
      if (this.data instanceof Float32Array)
        return new e(new Float32Array(this.data), this.typeInfo, null);
      if (this.data instanceof Int32Array)
        return new e(new Int32Array(this.data), this.typeInfo, null);
      if (this.data instanceof Uint32Array)
        return new e(new Uint32Array(this.data), this.typeInfo, null);
      throw `VectorData: Invalid data type`;
    }
    setDataValue(t, n, r, i) {
      r instanceof Vt
        ? console.error(`TODO: Set vector postfix`)
        : n instanceof e
          ? (this.data = n.data)
          : console.error(`SetDataValue: Invalid value`, n);
    }
    getSubData(e, t, n) {
      if (t === null) return this;
      let r = e.getTypeInfo(`f32`);
      if (this.typeInfo instanceof Ve) r = this.typeInfo.format || r;
      else {
        let t = this.typeInfo.name;
        t === `vec2f` || t === `vec3f` || t === `vec4f`
          ? (r = e.getTypeInfo(`f32`))
          : t === `vec2i` || t === `vec3i` || t === `vec4i`
            ? (r = e.getTypeInfo(`i32`))
            : t === `vec2b` || t === `vec3b` || t === `vec4b`
              ? (r = e.getTypeInfo(`bool`))
              : t === `vec2u` || t === `vec3u` || t === `vec4u`
                ? (r = e.getTypeInfo(`u32`))
                : t === `vec2h` || t === `vec3h` || t === `vec4h`
                  ? (r = e.getTypeInfo(`f16`))
                  : console.error(`GetSubData: Unknown type ${t}`);
      }
      let i = this;
      for (; t !== null && i !== null; ) {
        if (t instanceof Jt) {
          let a = t.index,
            o = -1;
          if (a instanceof Kt) {
            if (!(a.value instanceof W))
              return (
                console.error(`GetSubData: Invalid array index ${a.value}`),
                null
              );
            o = a.value.value;
          } else {
            let t = e.evalExpression(a, n);
            if (!(t instanceof W))
              return console.error(`GetSubData: Unknown index type`, a), null;
            o = t.value;
          }
          if (o < 0 || o >= i.data.length)
            return console.error(`GetSubData: Index out of range`, o), null;
          if (i.data instanceof Float32Array)
            return new W(
              new Float32Array(i.data.buffer, i.data.byteOffset + 4 * o, 1),
              r,
            );
          if (i.data instanceof Int32Array)
            return new W(
              new Int32Array(i.data.buffer, i.data.byteOffset + 4 * o, 1),
              r,
            );
          if (i.data instanceof Uint32Array)
            return new W(
              new Uint32Array(i.data.buffer, i.data.byteOffset + 4 * o, 1),
              r,
            );
          throw `GetSubData: Invalid data type`;
        }
        if (!(t instanceof Vt))
          return console.error(`GetSubData: Unknown postfix`, t), null;
        {
          let n = t.value.toLowerCase();
          if (n.length === 1) {
            let e = 0;
            if (n === `x` || n === `r`) e = 0;
            else if (n === `y` || n === `g`) e = 1;
            else if (n === `z` || n === `b`) e = 2;
            else {
              if (n !== `w` && n !== `a`)
                return console.error(`GetSubData: Unknown member ${n}`), null;
              e = 3;
            }
            if (this.data instanceof Float32Array)
              return new W(
                new Float32Array(
                  this.data.buffer,
                  this.data.byteOffset + 4 * e,
                  1,
                ),
                r,
                this,
              );
            if (this.data instanceof Int32Array)
              return new W(
                new Int32Array(
                  this.data.buffer,
                  this.data.byteOffset + 4 * e,
                  1,
                ),
                r,
                this,
              );
            if (this.data instanceof Uint32Array)
              return new W(
                new Uint32Array(
                  this.data.buffer,
                  this.data.byteOffset + 4 * e,
                  1,
                ),
                r,
                this,
              );
          }
          let a = [];
          for (let e of n)
            e === `x` || e === `r`
              ? a.push(this.data[0])
              : e === `y` || e === `g`
                ? a.push(this.data[1])
                : e === `z` || e === `b`
                  ? a.push(this.data[2])
                  : e === `w` || e === `a`
                    ? a.push(this.data[3])
                    : console.error(`GetDataValue: Unknown member ${e}`);
          i = ln(e, a, r.name);
        }
        t = t.postfix;
      }
      return i;
    }
    toString() {
      let e = `${this.data[0]}`;
      for (let t = 1; t < this.data.length; ++t) e += `, ${this.data[t]}`;
      return e;
    }
  },
  K = class e extends on {
    constructor(e, t, n = null) {
      super(t, n),
        (this.data = e instanceof Float32Array ? e : new Float32Array(e));
    }
    clone() {
      return new e(new Float32Array(this.data), this.typeInfo, null);
    }
    setDataValue(t, n, r, i) {
      r instanceof Vt
        ? console.error(`TODO: Set matrix postfix`)
        : n instanceof e
          ? (this.data = n.data)
          : console.error(`SetDataValue: Invalid value`, n);
    }
    getSubData(e, t, n) {
      if (t === null) return this;
      let r = this.typeInfo.name;
      if ((e.getTypeInfo(`f32`), this.typeInfo instanceof Ve))
        this.typeInfo.format;
      else if (r.endsWith(`f`)) e.getTypeInfo(`f32`);
      else if (r.endsWith(`i`)) e.getTypeInfo(`i32`);
      else if (r.endsWith(`u`)) e.getTypeInfo(`u32`);
      else {
        if (!r.endsWith(`h`))
          return console.error(`GetDataValue: Unknown type ${r}`), null;
        e.getTypeInfo(`f16`);
      }
      if (t instanceof Jt) {
        let i = t.index,
          a = -1;
        if (i instanceof Kt) {
          if (!(i.value instanceof W))
            return (
              console.error(`GetDataValue: Invalid array index ${i.value}`),
              null
            );
          a = i.value.value;
        } else {
          let t = e.evalExpression(i, n);
          if (!(t instanceof W))
            return console.error(`GetDataValue: Unknown index type`, i), null;
          a = t.value;
        }
        if (a < 0 || a >= this.data.length)
          return console.error(`GetDataValue: Index out of range`, a), null;
        let o = r.endsWith(`h`) ? `h` : `f`,
          s;
        if (
          r === `mat2x2` ||
          r === `mat2x2f` ||
          r === `mat2x2h` ||
          r === `mat3x2` ||
          r === `mat3x2f` ||
          r === `mat3x2h` ||
          r === `mat4x2` ||
          r === `mat4x2f` ||
          r === `mat4x2h`
        )
          s = new G(
            new Float32Array(
              this.data.buffer,
              this.data.byteOffset + 2 * a * 4,
              2,
            ),
            e.getTypeInfo(`vec2${o}`),
          );
        else if (
          r === `mat2x3` ||
          r === `mat2x3f` ||
          r === `mat2x3h` ||
          r === `mat3x3` ||
          r === `mat3x3f` ||
          r === `mat3x3h` ||
          r === `mat4x3` ||
          r === `mat4x3f` ||
          r === `mat4x3h`
        )
          s = new G(
            new Float32Array(
              this.data.buffer,
              this.data.byteOffset + 3 * a * 4,
              3,
            ),
            e.getTypeInfo(`vec3${o}`),
          );
        else {
          if (
            r !== `mat2x4` &&
            r !== `mat2x4f` &&
            r !== `mat2x4h` &&
            r !== `mat3x4` &&
            r !== `mat3x4f` &&
            r !== `mat3x4h` &&
            r !== `mat4x4` &&
            r !== `mat4x4f` &&
            r !== `mat4x4h`
          )
            return console.error(`GetDataValue: Unknown type ${r}`), null;
          s = new G(
            new Float32Array(
              this.data.buffer,
              this.data.byteOffset + 4 * a * 4,
              4,
            ),
            e.getTypeInfo(`vec4${o}`),
          );
        }
        return t.postfix ? s.getSubData(e, t.postfix, n) : s;
      }
      return console.error(`GetDataValue: Invalid postfix`, t), null;
    }
    toString() {
      let e = `${this.data[0]}`;
      for (let t = 1; t < this.data.length; ++t) e += `, ${this.data[t]}`;
      return e;
    }
  },
  un = class e extends on {
    constructor(e, t, n = 0, r = null) {
      super(t, r),
        (this.buffer = e instanceof ArrayBuffer ? e : e.buffer),
        (this.offset = n);
    }
    clone() {
      let t = new Uint8Array(
        new Uint8Array(this.buffer, this.offset, this.typeInfo.size),
      );
      return new e(t.buffer, this.typeInfo, 0, null);
    }
    setDataValue(e, t, n, r) {
      if (t === null) return void console.log(`setDataValue: NULL data.`);
      let i = this.offset,
        a = this.typeInfo;
      for (; n; ) {
        if (n instanceof Jt) {
          if (a instanceof ze) {
            let t = n.index;
            if (t instanceof Kt) {
              if (!(t.value instanceof W))
                return void console.error(
                  `SetDataValue: Invalid index type ${t.value}`,
                );
              i += t.value.value * a.stride;
            } else {
              let n = e.evalExpression(t, r);
              if (!(n instanceof W))
                return void console.error(
                  `SetDataValue: Unknown index type`,
                  t,
                );
              i += n.value * a.stride;
            }
            a = a.format;
          } else
            console.error(
              `SetDataValue: Type ${a.getTypeName()} is not an array`,
            );
        } else {
          if (!(n instanceof Vt))
            return void console.error(`SetDataValue: Unknown postfix type`, n);
          {
            let e = n.value;
            if (a instanceof Re) {
              let t = !1;
              for (let n of a.members)
                if (n.name === e) {
                  (i += n.offset), (a = n.type), (t = !0);
                  break;
                }
              if (!t)
                return void console.error(
                  `SetDataValue: Member ${e} not found`,
                );
            } else if (a instanceof Ie) {
              let n = a.getTypeName(),
                r = 0;
              if (e === `x` || e === `r`) r = 0;
              else if (e === `y` || e === `g`) r = 1;
              else if (e === `z` || e === `b`) r = 2;
              else {
                if (e !== `w` && e !== `a`)
                  return void console.error(
                    `SetDataValue: Unknown member ${e}`,
                  );
                r = 3;
              }
              if (!(t instanceof W))
                return void console.error(`SetDataValue: Invalid value`, t);
              let o = t.value;
              n === `vec2f`
                ? (new Float32Array(this.buffer, i, 2)[r] = o)
                : n === `vec3f`
                  ? (new Float32Array(this.buffer, i, 3)[r] = o)
                  : n === `vec4f`
                    ? (new Float32Array(this.buffer, i, 4)[r] = o)
                    : n === `vec2i`
                      ? (new Int32Array(this.buffer, i, 2)[r] = o)
                      : n === `vec3i`
                        ? (new Int32Array(this.buffer, i, 3)[r] = o)
                        : n === `vec4i`
                          ? (new Int32Array(this.buffer, i, 4)[r] = o)
                          : n === `vec2u`
                            ? (new Uint32Array(this.buffer, i, 2)[r] = o)
                            : n === `vec3u`
                              ? (new Uint32Array(this.buffer, i, 3)[r] = o)
                              : n === `vec4u`
                                ? (new Uint32Array(this.buffer, i, 4)[r] = o)
                                : console.error(
                                    `SetDataValue: Type ${n} is not a struct`,
                                  );
              return;
            }
          }
        }
        n = n.postfix;
      }
      this.setData(e, t, a, i, r);
    }
    setData(t, n, r, i, a) {
      let o = r.getTypeName();
      if (o !== `f32` && o !== `f16`) {
        if (o !== `i32` && o !== `atomic<i32>` && o !== `x32`) {
          if (o !== `u32` && o !== `atomic<u32>`) {
            if (o !== `bool`) {
              if (o !== `vec2f` && o !== `vec2h`) {
                if (o !== `vec3f` && o !== `vec3h`) {
                  if (o !== `vec4f` && o !== `vec4h`) {
                    if (o !== `vec2i`) {
                      if (o !== `vec3i`) {
                        if (o !== `vec4i`) {
                          if (o !== `vec2u`) {
                            if (o !== `vec3u`) {
                              if (o !== `vec4u`) {
                                if (o !== `vec2b`) {
                                  if (o !== `vec3b`) {
                                    if (o !== `vec4b`) {
                                      if (o !== `mat2x2f` && o !== `mat2x2h`) {
                                        if (
                                          o !== `mat2x3f` &&
                                          o !== `mat2x3h`
                                        ) {
                                          if (
                                            o !== `mat2x4f` &&
                                            o !== `mat2x4h`
                                          ) {
                                            if (
                                              o !== `mat3x2f` &&
                                              o !== `mat3x2h`
                                            ) {
                                              if (
                                                o !== `mat3x3f` &&
                                                o !== `mat3x3h`
                                              ) {
                                                if (
                                                  o !== `mat3x4f` &&
                                                  o !== `mat3x4h`
                                                ) {
                                                  if (
                                                    o !== `mat4x2f` &&
                                                    o !== `mat4x2h`
                                                  ) {
                                                    if (
                                                      o !== `mat4x3f` &&
                                                      o !== `mat4x3h`
                                                    ) {
                                                      if (
                                                        o !== `mat4x4f` &&
                                                        o !== `mat4x4h`
                                                      ) {
                                                        if (n instanceof e) {
                                                          if (
                                                            r === n.typeInfo
                                                          ) {
                                                            new Uint8Array(
                                                              this.buffer,
                                                              i,
                                                              n.buffer.byteLength,
                                                            ).set(
                                                              new Uint8Array(
                                                                n.buffer,
                                                              ),
                                                            );
                                                            return;
                                                          }
                                                          console.error(
                                                            `SetDataValue: Type mismatch`,
                                                            o,
                                                            n.typeInfo.getTypeName(),
                                                          );
                                                        } else
                                                          console.error(
                                                            `SetData: Unknown type ${o}`,
                                                          );
                                                      } else {
                                                        let e =
                                                          new Float32Array(
                                                            this.buffer,
                                                            i,
                                                            16,
                                                          );
                                                        n instanceof K
                                                          ? ((e[0] = n.data[0]),
                                                            (e[1] = n.data[1]),
                                                            (e[2] = n.data[2]),
                                                            (e[3] = n.data[3]),
                                                            (e[4] = n.data[4]),
                                                            (e[5] = n.data[5]),
                                                            (e[6] = n.data[6]),
                                                            (e[7] = n.data[7]),
                                                            (e[8] = n.data[8]),
                                                            (e[9] = n.data[9]),
                                                            (e[10] =
                                                              n.data[10]),
                                                            (e[11] =
                                                              n.data[11]),
                                                            (e[12] =
                                                              n.data[12]),
                                                            (e[13] =
                                                              n.data[13]),
                                                            (e[14] =
                                                              n.data[14]),
                                                            (e[15] =
                                                              n.data[15]))
                                                          : ((e[0] = n[0]),
                                                            (e[1] = n[1]),
                                                            (e[2] = n[2]),
                                                            (e[3] = n[3]),
                                                            (e[4] = n[4]),
                                                            (e[5] = n[5]),
                                                            (e[6] = n[6]),
                                                            (e[7] = n[7]),
                                                            (e[8] = n[8]),
                                                            (e[9] = n[9]),
                                                            (e[10] = n[10]),
                                                            (e[11] = n[11]),
                                                            (e[12] = n[12]),
                                                            (e[13] = n[13]),
                                                            (e[14] = n[14]),
                                                            (e[15] = n[15]));
                                                      }
                                                    } else {
                                                      let e = new Float32Array(
                                                        this.buffer,
                                                        i,
                                                        12,
                                                      );
                                                      n instanceof K
                                                        ? ((e[0] = n.data[0]),
                                                          (e[1] = n.data[1]),
                                                          (e[2] = n.data[2]),
                                                          (e[3] = n.data[3]),
                                                          (e[4] = n.data[4]),
                                                          (e[5] = n.data[5]),
                                                          (e[6] = n.data[6]),
                                                          (e[7] = n.data[7]),
                                                          (e[8] = n.data[8]),
                                                          (e[9] = n.data[9]),
                                                          (e[10] = n.data[10]),
                                                          (e[11] = n.data[11]))
                                                        : ((e[0] = n[0]),
                                                          (e[1] = n[1]),
                                                          (e[2] = n[2]),
                                                          (e[3] = n[3]),
                                                          (e[4] = n[4]),
                                                          (e[5] = n[5]),
                                                          (e[6] = n[6]),
                                                          (e[7] = n[7]),
                                                          (e[8] = n[8]),
                                                          (e[9] = n[9]),
                                                          (e[10] = n[10]),
                                                          (e[11] = n[11]));
                                                    }
                                                  } else {
                                                    let e = new Float32Array(
                                                      this.buffer,
                                                      i,
                                                      8,
                                                    );
                                                    n instanceof K
                                                      ? ((e[0] = n.data[0]),
                                                        (e[1] = n.data[1]),
                                                        (e[2] = n.data[2]),
                                                        (e[3] = n.data[3]),
                                                        (e[4] = n.data[4]),
                                                        (e[5] = n.data[5]),
                                                        (e[6] = n.data[6]),
                                                        (e[7] = n.data[7]))
                                                      : ((e[0] = n[0]),
                                                        (e[1] = n[1]),
                                                        (e[2] = n[2]),
                                                        (e[3] = n[3]),
                                                        (e[4] = n[4]),
                                                        (e[5] = n[5]),
                                                        (e[6] = n[6]),
                                                        (e[7] = n[7]));
                                                  }
                                                } else {
                                                  let e = new Float32Array(
                                                    this.buffer,
                                                    i,
                                                    12,
                                                  );
                                                  n instanceof K
                                                    ? ((e[0] = n.data[0]),
                                                      (e[1] = n.data[1]),
                                                      (e[2] = n.data[2]),
                                                      (e[3] = n.data[3]),
                                                      (e[4] = n.data[4]),
                                                      (e[5] = n.data[5]),
                                                      (e[6] = n.data[6]),
                                                      (e[7] = n.data[7]),
                                                      (e[8] = n.data[8]),
                                                      (e[9] = n.data[9]),
                                                      (e[10] = n.data[10]),
                                                      (e[11] = n.data[11]))
                                                    : ((e[0] = n[0]),
                                                      (e[1] = n[1]),
                                                      (e[2] = n[2]),
                                                      (e[3] = n[3]),
                                                      (e[4] = n[4]),
                                                      (e[5] = n[5]),
                                                      (e[6] = n[6]),
                                                      (e[7] = n[7]),
                                                      (e[8] = n[8]),
                                                      (e[9] = n[9]),
                                                      (e[10] = n[10]),
                                                      (e[11] = n[11]));
                                                }
                                              } else {
                                                let e = new Float32Array(
                                                  this.buffer,
                                                  i,
                                                  9,
                                                );
                                                n instanceof K
                                                  ? ((e[0] = n.data[0]),
                                                    (e[1] = n.data[1]),
                                                    (e[2] = n.data[2]),
                                                    (e[3] = n.data[3]),
                                                    (e[4] = n.data[4]),
                                                    (e[5] = n.data[5]),
                                                    (e[6] = n.data[6]),
                                                    (e[7] = n.data[7]),
                                                    (e[8] = n.data[8]))
                                                  : ((e[0] = n[0]),
                                                    (e[1] = n[1]),
                                                    (e[2] = n[2]),
                                                    (e[3] = n[3]),
                                                    (e[4] = n[4]),
                                                    (e[5] = n[5]),
                                                    (e[6] = n[6]),
                                                    (e[7] = n[7]),
                                                    (e[8] = n[8]));
                                              }
                                            } else {
                                              let e = new Float32Array(
                                                this.buffer,
                                                i,
                                                6,
                                              );
                                              n instanceof K
                                                ? ((e[0] = n.data[0]),
                                                  (e[1] = n.data[1]),
                                                  (e[2] = n.data[2]),
                                                  (e[3] = n.data[3]),
                                                  (e[4] = n.data[4]),
                                                  (e[5] = n.data[5]))
                                                : ((e[0] = n[0]),
                                                  (e[1] = n[1]),
                                                  (e[2] = n[2]),
                                                  (e[3] = n[3]),
                                                  (e[4] = n[4]),
                                                  (e[5] = n[5]));
                                            }
                                          } else {
                                            let e = new Float32Array(
                                              this.buffer,
                                              i,
                                              8,
                                            );
                                            n instanceof K
                                              ? ((e[0] = n.data[0]),
                                                (e[1] = n.data[1]),
                                                (e[2] = n.data[2]),
                                                (e[3] = n.data[3]),
                                                (e[4] = n.data[4]),
                                                (e[5] = n.data[5]),
                                                (e[6] = n.data[6]),
                                                (e[7] = n.data[7]))
                                              : ((e[0] = n[0]),
                                                (e[1] = n[1]),
                                                (e[2] = n[2]),
                                                (e[3] = n[3]),
                                                (e[4] = n[4]),
                                                (e[5] = n[5]),
                                                (e[6] = n[6]),
                                                (e[7] = n[7]));
                                          }
                                        } else {
                                          let e = new Float32Array(
                                            this.buffer,
                                            i,
                                            6,
                                          );
                                          n instanceof K
                                            ? ((e[0] = n.data[0]),
                                              (e[1] = n.data[1]),
                                              (e[2] = n.data[2]),
                                              (e[3] = n.data[3]),
                                              (e[4] = n.data[4]),
                                              (e[5] = n.data[5]))
                                            : ((e[0] = n[0]),
                                              (e[1] = n[1]),
                                              (e[2] = n[2]),
                                              (e[3] = n[3]),
                                              (e[4] = n[4]),
                                              (e[5] = n[5]));
                                        }
                                      } else {
                                        let e = new Float32Array(
                                          this.buffer,
                                          i,
                                          4,
                                        );
                                        n instanceof K
                                          ? ((e[0] = n.data[0]),
                                            (e[1] = n.data[1]),
                                            (e[2] = n.data[2]),
                                            (e[3] = n.data[3]))
                                          : ((e[0] = n[0]),
                                            (e[1] = n[1]),
                                            (e[2] = n[2]),
                                            (e[3] = n[3]));
                                      }
                                    } else {
                                      let e = new Uint32Array(
                                        this.buffer,
                                        i,
                                        4,
                                      );
                                      n instanceof G
                                        ? ((e[0] = n.data[0]),
                                          (e[1] = n.data[1]),
                                          (e[2] = n.data[2]),
                                          (e[3] = n.data[3]))
                                        : ((e[0] = n[0]),
                                          (e[1] = n[1]),
                                          (e[2] = n[2]),
                                          (e[3] = n[3]));
                                    }
                                  } else {
                                    let e = new Uint32Array(this.buffer, i, 3);
                                    n instanceof G
                                      ? ((e[0] = n.data[0]),
                                        (e[1] = n.data[1]),
                                        (e[2] = n.data[2]))
                                      : ((e[0] = n[0]),
                                        (e[1] = n[1]),
                                        (e[2] = n[2]));
                                  }
                                } else {
                                  let e = new Uint32Array(this.buffer, i, 2);
                                  n instanceof G
                                    ? ((e[0] = n.data[0]), (e[1] = n.data[1]))
                                    : ((e[0] = n[0]), (e[1] = n[1]));
                                }
                              } else {
                                let e = new Uint32Array(this.buffer, i, 4);
                                n instanceof G
                                  ? ((e[0] = n.data[0]),
                                    (e[1] = n.data[1]),
                                    (e[2] = n.data[2]),
                                    (e[3] = n.data[3]))
                                  : ((e[0] = n[0]),
                                    (e[1] = n[1]),
                                    (e[2] = n[2]),
                                    (e[3] = n[3]));
                              }
                            } else {
                              let e = new Uint32Array(this.buffer, i, 3);
                              n instanceof G
                                ? ((e[0] = n.data[0]),
                                  (e[1] = n.data[1]),
                                  (e[2] = n.data[2]))
                                : ((e[0] = n[0]), (e[1] = n[1]), (e[2] = n[2]));
                            }
                          } else {
                            let e = new Uint32Array(this.buffer, i, 2);
                            n instanceof G
                              ? ((e[0] = n.data[0]), (e[1] = n.data[1]))
                              : ((e[0] = n[0]), (e[1] = n[1]));
                          }
                        } else {
                          let e = new Int32Array(this.buffer, i, 4);
                          n instanceof G
                            ? ((e[0] = n.data[0]),
                              (e[1] = n.data[1]),
                              (e[2] = n.data[2]),
                              (e[3] = n.data[3]))
                            : ((e[0] = n[0]),
                              (e[1] = n[1]),
                              (e[2] = n[2]),
                              (e[3] = n[3]));
                        }
                      } else {
                        let e = new Int32Array(this.buffer, i, 3);
                        n instanceof G
                          ? ((e[0] = n.data[0]),
                            (e[1] = n.data[1]),
                            (e[2] = n.data[2]))
                          : ((e[0] = n[0]), (e[1] = n[1]), (e[2] = n[2]));
                      }
                    } else {
                      let e = new Int32Array(this.buffer, i, 2);
                      n instanceof G
                        ? ((e[0] = n.data[0]), (e[1] = n.data[1]))
                        : ((e[0] = n[0]), (e[1] = n[1]));
                    }
                  } else {
                    let e = new Float32Array(this.buffer, i, 4);
                    n instanceof G
                      ? ((e[0] = n.data[0]),
                        (e[1] = n.data[1]),
                        (e[2] = n.data[2]),
                        (e[3] = n.data[3]))
                      : ((e[0] = n[0]),
                        (e[1] = n[1]),
                        (e[2] = n[2]),
                        (e[3] = n[3]));
                  }
                } else {
                  let e = new Float32Array(this.buffer, i, 3);
                  n instanceof G
                    ? ((e[0] = n.data[0]),
                      (e[1] = n.data[1]),
                      (e[2] = n.data[2]))
                    : ((e[0] = n[0]), (e[1] = n[1]), (e[2] = n[2]));
                }
              } else {
                let e = new Float32Array(this.buffer, i, 2);
                n instanceof G
                  ? ((e[0] = n.data[0]), (e[1] = n.data[1]))
                  : ((e[0] = n[0]), (e[1] = n[1]));
              }
            } else
              n instanceof W &&
                (new Int32Array(this.buffer, i, 1)[0] = n.value);
          } else
            n instanceof W && (new Uint32Array(this.buffer, i, 1)[0] = n.value);
        } else
          n instanceof W && (new Int32Array(this.buffer, i, 1)[0] = n.value);
      } else
        n instanceof W && (new Float32Array(this.buffer, i, 1)[0] = n.value);
    }
    getSubData(t, n, r) {
      if (n === null) return this;
      let i = this.offset,
        a = this.typeInfo;
      for (; n; ) {
        if (n instanceof Jt) {
          let e = n.index,
            o = e instanceof Bt ? t.evalExpression(e, r) : e,
            s = 0;
          if (
            (o instanceof W
              ? (s = o.value)
              : typeof o == `number`
                ? (s = o)
                : console.error(`GetDataValue: Invalid index type`, e),
            a instanceof ze)
          )
            (i += s * a.stride), (a = a.format);
          else {
            let e = a.getTypeName();
            e === `mat4x4` || e === `mat4x4f` || e === `mat4x4h`
              ? ((i += 16 * s), (a = t.getTypeInfo(`vec4f`)))
              : console.error(
                  `getDataValue: Type ${a.getTypeName()} is not an array`,
                );
          }
        } else {
          if (!(n instanceof Vt))
            return console.error(`GetDataValue: Unknown postfix type`, n), null;
          {
            let e = n.value;
            if (a instanceof Re) {
              let t = !1;
              for (let n of a.members)
                if (n.name === e) {
                  (i += n.offset), (a = n.type), (t = !0);
                  break;
                }
              if (!t)
                return (
                  console.error(`GetDataValue: Member ${e} not found`), null
                );
            } else if (a instanceof Ie) {
              let n = a.getTypeName();
              if (
                n === `vec2f` ||
                n === `vec3f` ||
                n === `vec4f` ||
                n === `vec2i` ||
                n === `vec3i` ||
                n === `vec4i` ||
                n === `vec2u` ||
                n === `vec3u` ||
                n === `vec4u` ||
                n === `vec2b` ||
                n === `vec3b` ||
                n === `vec4b` ||
                n === `vec2h` ||
                n === `vec3h` ||
                n === `vec4h` ||
                n === `vec2` ||
                n === `vec3` ||
                n === `vec4`
              ) {
                if (e.length > 0 && e.length < 5) {
                  let r = `f`,
                    o = [];
                  for (let a = 0; a < e.length; ++a) {
                    let s = e[a].toLowerCase(),
                      c = 0;
                    if (s === `x` || s === `r`) c = 0;
                    else if (s === `y` || s === `g`) c = 1;
                    else if (s === `z` || s === `b`) c = 2;
                    else {
                      if (s !== `w` && s !== `a`)
                        return console.error(`Unknown member ${e}`), null;
                      c = 3;
                    }
                    if (e.length === 1) {
                      if (n.endsWith(`f`))
                        return this.buffer.byteLength < i + 4 * c + 4
                          ? (console.log(`Insufficient buffer data`), null)
                          : new W(
                              new Float32Array(this.buffer, i + 4 * c, 1),
                              t.getTypeInfo(`f32`),
                              this,
                            );
                      if (n.endsWith(`h`))
                        return new W(
                          new Float32Array(this.buffer, i + 4 * c, 1),
                          t.getTypeInfo(`f16`),
                          this,
                        );
                      if (n.endsWith(`i`))
                        return new W(
                          new Int32Array(this.buffer, i + 4 * c, 1),
                          t.getTypeInfo(`i32`),
                          this,
                        );
                      if (n.endsWith(`b`))
                        return new W(
                          new Int32Array(this.buffer, i + 4 * c, 1),
                          t.getTypeInfo(`bool`),
                          this,
                        );
                      if (n.endsWith(`u`))
                        return new W(
                          new Uint32Array(this.buffer, i + 4 * c, 1),
                          t.getTypeInfo(`i32`),
                          this,
                        );
                    }
                    if (n === `vec2f`)
                      o.push(new Float32Array(this.buffer, i, 2)[c]);
                    else if (n === `vec3f`) {
                      if (i + 12 >= this.buffer.byteLength)
                        return console.log(`Insufficient buffer data`), null;
                      let e = new Float32Array(this.buffer, i, 3);
                      o.push(e[c]);
                    } else if (n === `vec4f`)
                      o.push(new Float32Array(this.buffer, i, 4)[c]);
                    else if (n === `vec2i`)
                      (r = `i`), o.push(new Int32Array(this.buffer, i, 2)[c]);
                    else if (n === `vec3i`)
                      (r = `i`), o.push(new Int32Array(this.buffer, i, 3)[c]);
                    else if (n === `vec4i`)
                      (r = `i`), o.push(new Int32Array(this.buffer, i, 4)[c]);
                    else if (n === `vec2u`) {
                      r = `u`;
                      let e = new Uint32Array(this.buffer, i, 2);
                      o.push(e[c]);
                    } else
                      n === `vec3u`
                        ? ((r = `u`),
                          o.push(new Uint32Array(this.buffer, i, 3)[c]))
                        : n === `vec4u` &&
                          ((r = `u`),
                          o.push(new Uint32Array(this.buffer, i, 4)[c]));
                  }
                  return (
                    o.length === 2
                      ? (a = t.getTypeInfo(`vec2${r}`))
                      : o.length === 3
                        ? (a = t.getTypeInfo(`vec3${r}`))
                        : o.length === 4
                          ? (a = t.getTypeInfo(`vec4${r}`))
                          : console.error(
                              `GetDataValue: Invalid vector length ${o.length}`,
                            ),
                    new G(o, a, null)
                  );
                }
                return console.error(`GetDataValue: Unknown member ${e}`), null;
              }
              return (
                console.error(`GetDataValue: Type ${n} is not a struct`), null
              );
            }
          }
        }
        n = n.postfix;
      }
      let o = a.getTypeName();
      return o === `f32`
        ? new W(new Float32Array(this.buffer, i, 1), a, this)
        : o === `i32`
          ? new W(new Int32Array(this.buffer, i, 1), a, this)
          : o === `u32`
            ? new W(new Uint32Array(this.buffer, i, 1), a, this)
            : o === `vec2f`
              ? new G(new Float32Array(this.buffer, i, 2), a, this)
              : o === `vec3f`
                ? new G(new Float32Array(this.buffer, i, 3), a, this)
                : o === `vec4f`
                  ? new G(new Float32Array(this.buffer, i, 4), a, this)
                  : o === `vec2i`
                    ? new G(new Int32Array(this.buffer, i, 2), a, this)
                    : o === `vec3i`
                      ? new G(new Int32Array(this.buffer, i, 3), a, this)
                      : o === `vec4i`
                        ? new G(new Int32Array(this.buffer, i, 4), a, this)
                        : o === `vec2u`
                          ? new G(new Uint32Array(this.buffer, i, 2), a, this)
                          : o === `vec3u`
                            ? new G(new Uint32Array(this.buffer, i, 3), a, this)
                            : o === `vec4u`
                              ? new G(
                                  new Uint32Array(this.buffer, i, 4),
                                  a,
                                  this,
                                )
                              : a instanceof Ve && a.name === `atomic`
                                ? a.format?.name === `u32`
                                  ? new W(
                                      new Uint32Array(this.buffer, i, 1)[0],
                                      a.format,
                                      this,
                                    )
                                  : a.format?.name === `i32`
                                    ? new W(
                                        new Int32Array(this.buffer, i, 1)[0],
                                        a.format,
                                        this,
                                      )
                                    : (console.error(
                                        `GetDataValue: Invalid atomic format ${a.format?.name}`,
                                      ),
                                      null)
                                : new e(this.buffer, a, i, this);
    }
    toString() {
      let e = ``;
      if (this.typeInfo instanceof ze) {
        if (this.typeInfo.format.name === `f32`) {
          let t = new Float32Array(this.buffer, this.offset);
          e = `[${t[0]}`;
          for (let n = 1; n < t.length; ++n) e += `, ${t[n]}`;
        } else if (this.typeInfo.format.name === `i32`) {
          let t = new Int32Array(this.buffer, this.offset);
          e = `[${t[0]}`;
          for (let n = 1; n < t.length; ++n) e += `, ${t[n]}`;
        } else if (this.typeInfo.format.name === `u32`) {
          let t = new Uint32Array(this.buffer, this.offset);
          e = `[${t[0]}`;
          for (let n = 1; n < t.length; ++n) e += `, ${t[n]}`;
        } else if (this.typeInfo.format.name === `vec2f`) {
          let t = new Float32Array(this.buffer, this.offset);
          e = `[${t[0]}, ${t[1]}]`;
          for (let n = 1; n < t.length / 2; ++n)
            e += `, [${t[2 * n]}, ${t[2 * n + 1]}]`;
        } else if (this.typeInfo.format.name === `vec3f`) {
          let t = new Float32Array(this.buffer, this.offset);
          e = `[${t[0]}, ${t[1]}, ${t[2]}]`;
          for (let n = 4; n < t.length; n += 4)
            e += `, [${t[n]}, ${t[n + 1]}, ${t[n + 2]}]`;
        } else if (this.typeInfo.format.name === `vec4f`) {
          let t = new Float32Array(this.buffer, this.offset);
          e = `[${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}]`;
          for (let n = 4; n < t.length; n += 4)
            e += `, [${t[n]}, ${t[n + 1]}, ${t[n + 2]}, ${t[n + 3]}]`;
        } else e = `[...]`;
      } else this.typeInfo instanceof Re ? (e += `{...}`) : (e = `[...]`);
      return e;
    }
  },
  dn = class e extends on {
    constructor(e, t, n, r) {
      super(t, null), (this.data = e), (this.descriptor = n), (this.view = r);
    }
    clone() {
      return new e(this.data, this.typeInfo, this.descriptor, this.view);
    }
    get width() {
      var e;
      let t = this.descriptor.size;
      return t instanceof Array && t.length > 0
        ? (t[0] ?? 0)
        : t instanceof Object && (e = t.width) != null
          ? e
          : 0;
    }
    get height() {
      var e;
      let t = this.descriptor.size;
      return t instanceof Array && t.length > 1
        ? (t[1] ?? 0)
        : t instanceof Object && (e = t.height) != null
          ? e
          : 0;
    }
    get depthOrArrayLayers() {
      var e;
      let t = this.descriptor.size;
      return t instanceof Array && t.length > 2
        ? (t[2] ?? 0)
        : t instanceof Object && (e = t.depthOrArrayLayers) != null
          ? e
          : 0;
    }
    get format() {
      var e;
      return this.descriptor && (e = this.descriptor.format) != null
        ? e
        : `rgba8unorm`;
    }
    get sampleCount() {
      var e;
      return this.descriptor && (e = this.descriptor.sampleCount) != null
        ? e
        : 1;
    }
    get mipLevelCount() {
      var e;
      return this.descriptor && (e = this.descriptor.mipLevelCount) != null
        ? e
        : 1;
    }
    get dimension() {
      var e;
      return this.descriptor && (e = this.descriptor.dimension) != null
        ? e
        : `2d`;
    }
    getMipLevelSize(e) {
      if (e >= this.mipLevelCount) return [0, 0, 0];
      let t = [this.width, this.height, this.depthOrArrayLayers];
      for (let n = 0; n < t.length; ++n) t[n] = Math.max(1, t[n] >> e);
      return t;
    }
    get texelByteSize() {
      let e = at[this.format];
      return e ? (e.isDepthStencil ? 4 : e.bytesPerBlock) : 0;
    }
    get bytesPerRow() {
      return this.width * this.texelByteSize;
    }
    get isDepthStencil() {
      let e = at[this.format];
      return !!e && e.isDepthStencil;
    }
    getGpuSize() {
      let e = this.format,
        t = at[e],
        n = this.width;
      if (!e || n <= 0 || !t) return -1;
      let r = this.height,
        i = this.depthOrArrayLayers,
        a = this.dimension;
      return (
        (n / t.blockWidth) *
        (a === `1d` ? 1 : r / t.blockHeight) *
        t.bytesPerBlock *
        i
      );
    }
    getPixel(e, t, n = 0, r = 0) {
      let i = this.texelByteSize,
        a = this.bytesPerRow,
        o = this.height,
        s = this.data[r];
      return it(new Uint8Array(s), e, t, n, r, o, a, i, this.format);
    }
    setPixel(e, t, n, r, i) {
      let a = this.texelByteSize,
        o = this.bytesPerRow,
        s = this.height,
        c = this.data[r];
      (function (e, t, n, r, i, a, o, s, c, l) {
        let u = r * (o >>= i) * (a >>= i) + n * o + t * s;
        switch (c) {
          case `r8unorm`:
            L(e, u, `8unorm`, 1, l);
            return;
          case `r8snorm`:
            L(e, u, `8snorm`, 1, l);
            return;
          case `r8uint`:
            L(e, u, `8uint`, 1, l);
            return;
          case `r8sint`:
            L(e, u, `8sint`, 1, l);
            return;
          case `rg8unorm`:
            L(e, u, `8unorm`, 2, l);
            return;
          case `rg8snorm`:
            L(e, u, `8snorm`, 2, l);
            return;
          case `rg8uint`:
            L(e, u, `8uint`, 2, l);
            return;
          case `rg8sint`:
            L(e, u, `8sint`, 2, l);
            return;
          case `rgba8unorm-srgb`:
          case `rgba8unorm`:
          case `bgra8unorm-srgb`:
          case `bgra8unorm`:
            L(e, u, `8unorm`, 4, l);
            return;
          case `rgba8snorm`:
            L(e, u, `8snorm`, 4, l);
            return;
          case `rgba8uint`:
            L(e, u, `8uint`, 4, l);
            return;
          case `rgba8sint`:
            L(e, u, `8sint`, 4, l);
            return;
          case `r16uint`:
            L(e, u, `16uint`, 1, l);
            return;
          case `r16sint`:
            L(e, u, `16sint`, 1, l);
            return;
          case `r16float`:
            L(e, u, `16float`, 1, l);
            return;
          case `rg16uint`:
            L(e, u, `16uint`, 2, l);
            return;
          case `rg16sint`:
            L(e, u, `16sint`, 2, l);
            return;
          case `rg16float`:
            L(e, u, `16float`, 2, l);
            return;
          case `rgba16uint`:
            L(e, u, `16uint`, 4, l);
            return;
          case `rgba16sint`:
            L(e, u, `16sint`, 4, l);
            return;
          case `rgba16float`:
            L(e, u, `16float`, 4, l);
            return;
          case `r32uint`:
            L(e, u, `32uint`, 1, l);
            return;
          case `r32sint`:
            L(e, u, `32sint`, 1, l);
            return;
          case `depth16unorm`:
          case `depth24plus`:
          case `depth24plus-stencil8`:
          case `depth32float`:
          case `depth32float-stencil8`:
          case `r32float`:
            L(e, u, `32float`, 1, l);
            return;
          case `rg32uint`:
            L(e, u, `32uint`, 2, l);
            return;
          case `rg32sint`:
            L(e, u, `32sint`, 2, l);
            return;
          case `rg32float`:
            L(e, u, `32float`, 2, l);
            return;
          case `rgba32uint`:
            L(e, u, `32uint`, 4, l);
            return;
          case `rgba32sint`:
            L(e, u, `32sint`, 4, l);
            return;
          case `rgba32float`:
            L(e, u, `32float`, 4, l);
            return;
          case `rg11b10ufloat`:
            console.error(`TODO: rg11b10ufloat not supported for writing`);
        }
      })(new Uint8Array(c), e, t, n, r, s, o, a, this.format, i);
    }
  };
((e) => {
  (e[(e.token = 0)] = `token`),
    (e[(e.keyword = 1)] = `keyword`),
    (e[(e.reserved = 2)] = `reserved`);
})((B ||= {}));
var q = class {
    constructor(e, t, n) {
      (this.name = e), (this.type = t), (this.rule = n);
    }
    toString() {
      return this.name;
    }
  },
  J = class {};
(z = J),
  (J.none = new q(``, B.reserved, ``)),
  (J.eof = new q(`EOF`, B.token, ``)),
  (J.reserved = {
    asm: new q(`asm`, B.reserved, `asm`),
    bf16: new q(`bf16`, B.reserved, `bf16`),
    do: new q(`do`, B.reserved, `do`),
    enum: new q(`enum`, B.reserved, `enum`),
    f16: new q(`f16`, B.reserved, `f16`),
    f64: new q(`f64`, B.reserved, `f64`),
    handle: new q(`handle`, B.reserved, `handle`),
    i8: new q(`i8`, B.reserved, `i8`),
    i16: new q(`i16`, B.reserved, `i16`),
    i64: new q(`i64`, B.reserved, `i64`),
    mat: new q(`mat`, B.reserved, `mat`),
    premerge: new q(`premerge`, B.reserved, `premerge`),
    regardless: new q(`regardless`, B.reserved, `regardless`),
    typedef: new q(`typedef`, B.reserved, `typedef`),
    u8: new q(`u8`, B.reserved, `u8`),
    u16: new q(`u16`, B.reserved, `u16`),
    u64: new q(`u64`, B.reserved, `u64`),
    unless: new q(`unless`, B.reserved, `unless`),
    using: new q(`using`, B.reserved, `using`),
    vec: new q(`vec`, B.reserved, `vec`),
    void: new q(`void`, B.reserved, `void`),
  }),
  (J.keywords = {
    array: new q(`array`, B.keyword, `array`),
    atomic: new q(`atomic`, B.keyword, `atomic`),
    bool: new q(`bool`, B.keyword, `bool`),
    f32: new q(`f32`, B.keyword, `f32`),
    i32: new q(`i32`, B.keyword, `i32`),
    mat2x2: new q(`mat2x2`, B.keyword, `mat2x2`),
    mat2x3: new q(`mat2x3`, B.keyword, `mat2x3`),
    mat2x4: new q(`mat2x4`, B.keyword, `mat2x4`),
    mat3x2: new q(`mat3x2`, B.keyword, `mat3x2`),
    mat3x3: new q(`mat3x3`, B.keyword, `mat3x3`),
    mat3x4: new q(`mat3x4`, B.keyword, `mat3x4`),
    mat4x2: new q(`mat4x2`, B.keyword, `mat4x2`),
    mat4x3: new q(`mat4x3`, B.keyword, `mat4x3`),
    mat4x4: new q(`mat4x4`, B.keyword, `mat4x4`),
    ptr: new q(`ptr`, B.keyword, `ptr`),
    sampler: new q(`sampler`, B.keyword, `sampler`),
    sampler_comparison: new q(
      `sampler_comparison`,
      B.keyword,
      `sampler_comparison`,
    ),
    struct: new q(`struct`, B.keyword, `struct`),
    texture_1d: new q(`texture_1d`, B.keyword, `texture_1d`),
    texture_2d: new q(`texture_2d`, B.keyword, `texture_2d`),
    texture_2d_array: new q(`texture_2d_array`, B.keyword, `texture_2d_array`),
    texture_3d: new q(`texture_3d`, B.keyword, `texture_3d`),
    texture_cube: new q(`texture_cube`, B.keyword, `texture_cube`),
    texture_cube_array: new q(
      `texture_cube_array`,
      B.keyword,
      `texture_cube_array`,
    ),
    texture_multisampled_2d: new q(
      `texture_multisampled_2d`,
      B.keyword,
      `texture_multisampled_2d`,
    ),
    texture_storage_1d: new q(
      `texture_storage_1d`,
      B.keyword,
      `texture_storage_1d`,
    ),
    texture_storage_2d: new q(
      `texture_storage_2d`,
      B.keyword,
      `texture_storage_2d`,
    ),
    texture_storage_2d_array: new q(
      `texture_storage_2d_array`,
      B.keyword,
      `texture_storage_2d_array`,
    ),
    texture_storage_3d: new q(
      `texture_storage_3d`,
      B.keyword,
      `texture_storage_3d`,
    ),
    texture_depth_2d: new q(`texture_depth_2d`, B.keyword, `texture_depth_2d`),
    texture_depth_2d_array: new q(
      `texture_depth_2d_array`,
      B.keyword,
      `texture_depth_2d_array`,
    ),
    texture_depth_cube: new q(
      `texture_depth_cube`,
      B.keyword,
      `texture_depth_cube`,
    ),
    texture_depth_cube_array: new q(
      `texture_depth_cube_array`,
      B.keyword,
      `texture_depth_cube_array`,
    ),
    texture_depth_multisampled_2d: new q(
      `texture_depth_multisampled_2d`,
      B.keyword,
      `texture_depth_multisampled_2d`,
    ),
    texture_external: new q(`texture_external`, B.keyword, `texture_external`),
    u32: new q(`u32`, B.keyword, `u32`),
    vec2: new q(`vec2`, B.keyword, `vec2`),
    vec3: new q(`vec3`, B.keyword, `vec3`),
    vec4: new q(`vec4`, B.keyword, `vec4`),
    bitcast: new q(`bitcast`, B.keyword, `bitcast`),
    block: new q(`block`, B.keyword, `block`),
    break: new q(`break`, B.keyword, `break`),
    case: new q(`case`, B.keyword, `case`),
    continue: new q(`continue`, B.keyword, `continue`),
    continuing: new q(`continuing`, B.keyword, `continuing`),
    default: new q(`default`, B.keyword, `default`),
    diagnostic: new q(`diagnostic`, B.keyword, `diagnostic`),
    discard: new q(`discard`, B.keyword, `discard`),
    else: new q(`else`, B.keyword, `else`),
    enable: new q(`enable`, B.keyword, `enable`),
    fallthrough: new q(`fallthrough`, B.keyword, `fallthrough`),
    false: new q(`false`, B.keyword, `false`),
    fn: new q(`fn`, B.keyword, `fn`),
    for: new q(`for`, B.keyword, `for`),
    function: new q(`function`, B.keyword, `function`),
    if: new q(`if`, B.keyword, `if`),
    let: new q(`let`, B.keyword, `let`),
    const: new q(`const`, B.keyword, `const`),
    loop: new q(`loop`, B.keyword, `loop`),
    while: new q(`while`, B.keyword, `while`),
    private: new q(`private`, B.keyword, `private`),
    read: new q(`read`, B.keyword, `read`),
    read_write: new q(`read_write`, B.keyword, `read_write`),
    return: new q(`return`, B.keyword, `return`),
    requires: new q(`requires`, B.keyword, `requires`),
    storage: new q(`storage`, B.keyword, `storage`),
    switch: new q(`switch`, B.keyword, `switch`),
    true: new q(`true`, B.keyword, `true`),
    alias: new q(`alias`, B.keyword, `alias`),
    type: new q(`type`, B.keyword, `type`),
    uniform: new q(`uniform`, B.keyword, `uniform`),
    var: new q(`var`, B.keyword, `var`),
    override: new q(`override`, B.keyword, `override`),
    workgroup: new q(`workgroup`, B.keyword, `workgroup`),
    write: new q(`write`, B.keyword, `write`),
    r8unorm: new q(`r8unorm`, B.keyword, `r8unorm`),
    r8snorm: new q(`r8snorm`, B.keyword, `r8snorm`),
    r8uint: new q(`r8uint`, B.keyword, `r8uint`),
    r8sint: new q(`r8sint`, B.keyword, `r8sint`),
    r16uint: new q(`r16uint`, B.keyword, `r16uint`),
    r16sint: new q(`r16sint`, B.keyword, `r16sint`),
    r16float: new q(`r16float`, B.keyword, `r16float`),
    rg8unorm: new q(`rg8unorm`, B.keyword, `rg8unorm`),
    rg8snorm: new q(`rg8snorm`, B.keyword, `rg8snorm`),
    rg8uint: new q(`rg8uint`, B.keyword, `rg8uint`),
    rg8sint: new q(`rg8sint`, B.keyword, `rg8sint`),
    r32uint: new q(`r32uint`, B.keyword, `r32uint`),
    r32sint: new q(`r32sint`, B.keyword, `r32sint`),
    r32float: new q(`r32float`, B.keyword, `r32float`),
    rg16uint: new q(`rg16uint`, B.keyword, `rg16uint`),
    rg16sint: new q(`rg16sint`, B.keyword, `rg16sint`),
    rg16float: new q(`rg16float`, B.keyword, `rg16float`),
    rgba8unorm: new q(`rgba8unorm`, B.keyword, `rgba8unorm`),
    rgba8unorm_srgb: new q(`rgba8unorm_srgb`, B.keyword, `rgba8unorm_srgb`),
    rgba8snorm: new q(`rgba8snorm`, B.keyword, `rgba8snorm`),
    rgba8uint: new q(`rgba8uint`, B.keyword, `rgba8uint`),
    rgba8sint: new q(`rgba8sint`, B.keyword, `rgba8sint`),
    bgra8unorm: new q(`bgra8unorm`, B.keyword, `bgra8unorm`),
    bgra8unorm_srgb: new q(`bgra8unorm_srgb`, B.keyword, `bgra8unorm_srgb`),
    rgb10a2unorm: new q(`rgb10a2unorm`, B.keyword, `rgb10a2unorm`),
    rg11b10float: new q(`rg11b10float`, B.keyword, `rg11b10float`),
    rg32uint: new q(`rg32uint`, B.keyword, `rg32uint`),
    rg32sint: new q(`rg32sint`, B.keyword, `rg32sint`),
    rg32float: new q(`rg32float`, B.keyword, `rg32float`),
    rgba16uint: new q(`rgba16uint`, B.keyword, `rgba16uint`),
    rgba16sint: new q(`rgba16sint`, B.keyword, `rgba16sint`),
    rgba16float: new q(`rgba16float`, B.keyword, `rgba16float`),
    rgba32uint: new q(`rgba32uint`, B.keyword, `rgba32uint`),
    rgba32sint: new q(`rgba32sint`, B.keyword, `rgba32sint`),
    rgba32float: new q(`rgba32float`, B.keyword, `rgba32float`),
    static_assert: new q(`static_assert`, B.keyword, `static_assert`),
  }),
  (J.tokens = {
    decimal_float_literal: new q(
      `decimal_float_literal`,
      B.token,
      /((-?[0-9]*\.[0-9]+|-?[0-9]+\.[0-9]*)((e|E)(\+|-)?[0-9]+)?[fh]?)|(-?[0-9]+(e|E)(\+|-)?[0-9]+[fh]?)|(-?[0-9]+[fh])/,
    ),
    hex_float_literal: new q(
      `hex_float_literal`,
      B.token,
      /-?0x((([0-9a-fA-F]*\.[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)((p|P)(\+|-)?[0-9]+[fh]?)?)|([0-9a-fA-F]+(p|P)(\+|-)?[0-9]+[fh]?))/,
    ),
    int_literal: new q(
      `int_literal`,
      B.token,
      /-?0x[0-9a-fA-F]+|0i?|-?[1-9][0-9]*i?/,
    ),
    uint_literal: new q(
      `uint_literal`,
      B.token,
      /0x[0-9a-fA-F]+u|0u|[1-9][0-9]*u/,
    ),
    name: new q(
      `name`,
      B.token,
      /([_\p{XID_Start}][\p{XID_Continue}]+)|([\p{XID_Start}])/u,
    ),
    ident: new q(`ident`, B.token, /[_a-zA-Z][0-9a-zA-Z_]*/),
    and: new q(`and`, B.token, `&`),
    and_and: new q(`and_and`, B.token, `&&`),
    arrow: new q(`arrow `, B.token, `->`),
    attr: new q(`attr`, B.token, `@`),
    forward_slash: new q(`forward_slash`, B.token, `/`),
    bang: new q(`bang`, B.token, `!`),
    bracket_left: new q(`bracket_left`, B.token, `[`),
    bracket_right: new q(`bracket_right`, B.token, `]`),
    brace_left: new q(`brace_left`, B.token, `{`),
    brace_right: new q(`brace_right`, B.token, `}`),
    colon: new q(`colon`, B.token, `:`),
    comma: new q(`comma`, B.token, `,`),
    equal: new q(`equal`, B.token, `=`),
    equal_equal: new q(`equal_equal`, B.token, `==`),
    not_equal: new q(`not_equal`, B.token, `!=`),
    greater_than: new q(`greater_than`, B.token, `>`),
    greater_than_equal: new q(`greater_than_equal`, B.token, `>=`),
    shift_right: new q(`shift_right`, B.token, `>>`),
    less_than: new q(`less_than`, B.token, `<`),
    less_than_equal: new q(`less_than_equal`, B.token, `<=`),
    shift_left: new q(`shift_left`, B.token, `<<`),
    modulo: new q(`modulo`, B.token, `%`),
    minus: new q(`minus`, B.token, `-`),
    minus_minus: new q(`minus_minus`, B.token, `--`),
    period: new q(`period`, B.token, `.`),
    plus: new q(`plus`, B.token, `+`),
    plus_plus: new q(`plus_plus`, B.token, `++`),
    or: new q(`or`, B.token, `|`),
    or_or: new q(`or_or`, B.token, `||`),
    paren_left: new q(`paren_left`, B.token, `(`),
    paren_right: new q(`paren_right`, B.token, `)`),
    semicolon: new q(`semicolon`, B.token, `;`),
    star: new q(`star`, B.token, `*`),
    tilde: new q(`tilde`, B.token, `~`),
    underscore: new q(`underscore`, B.token, `_`),
    xor: new q(`xor`, B.token, `^`),
    plus_equal: new q(`plus_equal`, B.token, `+=`),
    minus_equal: new q(`minus_equal`, B.token, `-=`),
    times_equal: new q(`times_equal`, B.token, `*=`),
    division_equal: new q(`division_equal`, B.token, `/=`),
    modulo_equal: new q(`modulo_equal`, B.token, `%=`),
    and_equal: new q(`and_equal`, B.token, `&=`),
    or_equal: new q(`or_equal`, B.token, `|=`),
    xor_equal: new q(`xor_equal`, B.token, `^=`),
    shift_right_equal: new q(`shift_right_equal`, B.token, `>>=`),
    shift_left_equal: new q(`shift_left_equal`, B.token, `<<=`),
  }),
  (J.simpleTokens = {
    "@": z.tokens.attr,
    "{": z.tokens.brace_left,
    "}": z.tokens.brace_right,
    ":": z.tokens.colon,
    ",": z.tokens.comma,
    "(": z.tokens.paren_left,
    ")": z.tokens.paren_right,
    ";": z.tokens.semicolon,
  }),
  (J.literalTokens = {
    "&": z.tokens.and,
    "&&": z.tokens.and_and,
    "->": z.tokens.arrow,
    "/": z.tokens.forward_slash,
    "!": z.tokens.bang,
    "[": z.tokens.bracket_left,
    "]": z.tokens.bracket_right,
    "=": z.tokens.equal,
    "==": z.tokens.equal_equal,
    "!=": z.tokens.not_equal,
    ">": z.tokens.greater_than,
    ">=": z.tokens.greater_than_equal,
    ">>": z.tokens.shift_right,
    "<": z.tokens.less_than,
    "<=": z.tokens.less_than_equal,
    "<<": z.tokens.shift_left,
    "%": z.tokens.modulo,
    "-": z.tokens.minus,
    "--": z.tokens.minus_minus,
    ".": z.tokens.period,
    "+": z.tokens.plus,
    "++": z.tokens.plus_plus,
    "|": z.tokens.or,
    "||": z.tokens.or_or,
    "*": z.tokens.star,
    "~": z.tokens.tilde,
    _: z.tokens.underscore,
    "^": z.tokens.xor,
    "+=": z.tokens.plus_equal,
    "-=": z.tokens.minus_equal,
    "*=": z.tokens.times_equal,
    "/=": z.tokens.division_equal,
    "%=": z.tokens.modulo_equal,
    "&=": z.tokens.and_equal,
    "|=": z.tokens.or_equal,
    "^=": z.tokens.xor_equal,
    ">>=": z.tokens.shift_right_equal,
    "<<=": z.tokens.shift_left_equal,
  }),
  (J.regexTokens = {
    decimal_float_literal: z.tokens.decimal_float_literal,
    hex_float_literal: z.tokens.hex_float_literal,
    int_literal: z.tokens.int_literal,
    uint_literal: z.tokens.uint_literal,
    ident: z.tokens.ident,
  }),
  (J.storage_class = [
    z.keywords.function,
    z.keywords.private,
    z.keywords.workgroup,
    z.keywords.uniform,
    z.keywords.storage,
  ]),
  (J.access_mode = [z.keywords.read, z.keywords.write, z.keywords.read_write]),
  (J.sampler_type = [z.keywords.sampler, z.keywords.sampler_comparison]),
  (J.sampled_texture_type = [
    z.keywords.texture_1d,
    z.keywords.texture_2d,
    z.keywords.texture_2d_array,
    z.keywords.texture_3d,
    z.keywords.texture_cube,
    z.keywords.texture_cube_array,
  ]),
  (J.multisampled_texture_type = [z.keywords.texture_multisampled_2d]),
  (J.storage_texture_type = [
    z.keywords.texture_storage_1d,
    z.keywords.texture_storage_2d,
    z.keywords.texture_storage_2d_array,
    z.keywords.texture_storage_3d,
  ]),
  (J.depth_texture_type = [
    z.keywords.texture_depth_2d,
    z.keywords.texture_depth_2d_array,
    z.keywords.texture_depth_cube,
    z.keywords.texture_depth_cube_array,
    z.keywords.texture_depth_multisampled_2d,
  ]),
  (J.texture_external_type = [z.keywords.texture_external]),
  (J.any_texture_type = [
    ...z.sampled_texture_type,
    ...z.multisampled_texture_type,
    ...z.storage_texture_type,
    ...z.depth_texture_type,
    ...z.texture_external_type,
  ]),
  (J.texel_format = [
    z.keywords.r8unorm,
    z.keywords.r8snorm,
    z.keywords.r8uint,
    z.keywords.r8sint,
    z.keywords.r16uint,
    z.keywords.r16sint,
    z.keywords.r16float,
    z.keywords.rg8unorm,
    z.keywords.rg8snorm,
    z.keywords.rg8uint,
    z.keywords.rg8sint,
    z.keywords.r32uint,
    z.keywords.r32sint,
    z.keywords.r32float,
    z.keywords.rg16uint,
    z.keywords.rg16sint,
    z.keywords.rg16float,
    z.keywords.rgba8unorm,
    z.keywords.rgba8unorm_srgb,
    z.keywords.rgba8snorm,
    z.keywords.rgba8uint,
    z.keywords.rgba8sint,
    z.keywords.bgra8unorm,
    z.keywords.bgra8unorm_srgb,
    z.keywords.rgb10a2unorm,
    z.keywords.rg11b10float,
    z.keywords.rg32uint,
    z.keywords.rg32sint,
    z.keywords.rg32float,
    z.keywords.rgba16uint,
    z.keywords.rgba16sint,
    z.keywords.rgba16float,
    z.keywords.rgba32uint,
    z.keywords.rgba32sint,
    z.keywords.rgba32float,
  ]),
  (J.const_literal = [
    z.tokens.int_literal,
    z.tokens.uint_literal,
    z.tokens.decimal_float_literal,
    z.tokens.hex_float_literal,
    z.keywords.true,
    z.keywords.false,
  ]),
  (J.literal_or_ident = [
    z.tokens.ident,
    z.tokens.int_literal,
    z.tokens.uint_literal,
    z.tokens.decimal_float_literal,
    z.tokens.hex_float_literal,
    z.tokens.name,
  ]),
  (J.element_count_expression = [
    z.tokens.int_literal,
    z.tokens.uint_literal,
    z.tokens.ident,
  ]),
  (J.template_types = [
    z.keywords.vec2,
    z.keywords.vec3,
    z.keywords.vec4,
    z.keywords.mat2x2,
    z.keywords.mat2x3,
    z.keywords.mat2x4,
    z.keywords.mat3x2,
    z.keywords.mat3x3,
    z.keywords.mat3x4,
    z.keywords.mat4x2,
    z.keywords.mat4x3,
    z.keywords.mat4x4,
    z.keywords.atomic,
    z.keywords.bitcast,
    ...z.any_texture_type,
  ]),
  (J.attribute_name = [
    z.tokens.ident,
    z.keywords.block,
    z.keywords.diagnostic,
  ]),
  (J.assignment_operators = [
    z.tokens.equal,
    z.tokens.plus_equal,
    z.tokens.minus_equal,
    z.tokens.times_equal,
    z.tokens.division_equal,
    z.tokens.modulo_equal,
    z.tokens.and_equal,
    z.tokens.or_equal,
    z.tokens.xor_equal,
    z.tokens.shift_right_equal,
    z.tokens.shift_left_equal,
  ]),
  (J.increment_operators = [z.tokens.plus_plus, z.tokens.minus_minus]);
var fn = class {
    constructor(e, t, n, r, i) {
      (this.type = e),
        (this.lexeme = t),
        (this.line = n),
        (this.start = r),
        (this.end = i);
    }
    toString() {
      return this.lexeme;
    }
    isTemplateType() {
      return J.template_types.indexOf(this.type) != -1;
    }
    isArrayType() {
      return this.type == J.keywords.array;
    }
    isArrayOrTemplateType() {
      return this.isArrayType() || this.isTemplateType();
    }
  },
  pn = class {
    constructor(e) {
      (this._tokens = []),
        (this._start = 0),
        (this._current = 0),
        (this._line = 1),
        (this._source = e ?? ``);
    }
    scanTokens() {
      for (; !this._isAtEnd(); )
        if (((this._start = this._current), !this.scanToken()))
          throw `Invalid syntax at line ${this._line}`;
      return (
        this._tokens.push(
          new fn(J.eof, ``, this._line, this._current, this._current),
        ),
        this._tokens
      );
    }
    scanToken() {
      let e = this._advance();
      if (
        e ==
        `
`
      )
        return this._line++, !0;
      if (this._isWhitespace(e)) return !0;
      if (e == `/`) {
        if (this._peekAhead() == `/`) {
          for (
            ;
            e !=
            `
`;

          ) {
            if (this._isAtEnd()) return !0;
            e = this._advance();
          }
          return this._line++, !0;
        }
        if (this._peekAhead() == `*`) {
          this._advance();
          let t = 1;
          for (; t > 0; ) {
            if (this._isAtEnd()) return !0;
            if (
              ((e = this._advance()),
              e ==
                `
`)
            )
              this._line++;
            else if (e == `*`) {
              if (this._peekAhead() == `/` && (this._advance(), t--, t == 0))
                return !0;
            } else
              e == `/` && this._peekAhead() == `*` && (this._advance(), t++);
          }
          return !0;
        }
      }
      let t = J.simpleTokens[e];
      if (t) return this._addToken(t), !0;
      let n = J.none,
        r = this._isAlpha(e),
        i = e === `_`;
      if (this._isAlphaNumeric(e)) {
        let t = this._peekAhead();
        for (; this._isAlphaNumeric(t); )
          (e += this._advance()), (t = this._peekAhead());
      }
      if (r) {
        let t = J.keywords[e];
        if (t) return this._addToken(t), !0;
      }
      if (r || i) return this._addToken(J.tokens.ident), !0;
      for (;;) {
        let t = this._findType(e),
          r = this._peekAhead();
        if (e == `-` && this._tokens.length > 0) {
          if (r == `=`)
            return (
              this._current++,
              (e += r),
              this._addToken(J.tokens.minus_equal),
              !0
            );
          if (r == `-`)
            return (
              this._current++,
              (e += r),
              this._addToken(J.tokens.minus_minus),
              !0
            );
          let n = this._tokens.length - 1;
          if (
            (J.literal_or_ident.indexOf(this._tokens[n].type) != -1 ||
              this._tokens[n].type == J.tokens.paren_right) &&
            r != `>`
          )
            return this._addToken(t), !0;
        }
        if (e == `>` && (r == `>` || r == `=`)) {
          let e = !1,
            n = this._tokens.length - 1;
          for (
            let t = 0;
            t < 5 &&
            n >= 0 &&
            J.assignment_operators.indexOf(this._tokens[n].type) === -1;
            ++t, --n
          )
            if (this._tokens[n].type === J.tokens.less_than) {
              n > 0 && this._tokens[n - 1].isArrayOrTemplateType() && (e = !0);
              break;
            }
          if (e) return this._addToken(t), !0;
        }
        if (t === J.none) {
          let r = e,
            i = 0;
          for (let e = 0; e < 2; ++e)
            if (
              ((r += this._peekAhead(e)), (t = this._findType(r)), t !== J.none)
            ) {
              i = e;
              break;
            }
          if (t === J.none)
            return n !== J.none && (this._current--, this._addToken(n), !0);
          (e = r), (this._current += i + 1);
        }
        if (((n = t), this._isAtEnd())) break;
        e += this._advance();
      }
      return n !== J.none && (this._addToken(n), !0);
    }
    _findType(e) {
      for (let t in J.regexTokens) {
        let n = J.regexTokens[t];
        if (this._match(e, n.rule)) return n;
      }
      return J.literalTokens[e] || J.none;
    }
    _match(e, t) {
      let n = t.exec(e);
      return n && n.index == 0 && n[0] == e;
    }
    _isAtEnd() {
      return this._current >= this._source.length;
    }
    _isAlpha(e) {
      return (
        !this._isNumeric(e) &&
        !this._isWhitespace(e) &&
        e !== `_` &&
        e !== `.` &&
        e !== `(` &&
        e !== `)` &&
        e !== `[` &&
        e !== `]` &&
        e !== `{` &&
        e !== `}` &&
        e !== `,` &&
        e !== `;` &&
        e !== `:` &&
        e !== `=` &&
        e !== `!` &&
        e !== `<` &&
        e !== `>` &&
        e !== `+` &&
        e !== `-` &&
        e !== `*` &&
        e !== `/` &&
        e !== `%` &&
        e !== `&` &&
        e !== `|` &&
        e !== `^` &&
        e !== `~` &&
        e !== `@` &&
        e !== `#` &&
        e !== `?` &&
        e !== `'` &&
        e !== "`" &&
        e !== `"` &&
        e !== `\\` &&
        e !==
          `
` &&
        e !== `\r` &&
        e !== `	` &&
        e !== `\0`
      );
    }
    _isNumeric(e) {
      return e >= `0` && e <= `9`;
    }
    _isAlphaNumeric(e) {
      return this._isAlpha(e) || this._isNumeric(e) || e === `_`;
    }
    _isWhitespace(e) {
      return e == ` ` || e == `	` || e == `\r`;
    }
    _advance(e = 0) {
      let t = this._source[this._current];
      return (e ||= 0), e++, (this._current += e), t;
    }
    _peekAhead(e = 0) {
      return (
        (e ||= 0),
        this._current + e >= this._source.length
          ? `\0`
          : this._source[this._current + e]
      );
    }
    _addToken(e) {
      let t = this._source.substring(this._start, this._current);
      this._tokens.push(new fn(e, t, this._line, this._start, this._current));
    }
  };
function Y(e) {
  return Array.isArray(e) || e?.buffer instanceof ArrayBuffer;
}
var mn = new Float32Array(1),
  hn = new Uint32Array(mn.buffer),
  gn = new Uint32Array(mn.buffer),
  _n = new Int32Array(1),
  vn = new Float32Array(_n.buffer),
  yn = new Uint32Array(_n.buffer),
  bn = new Uint32Array(1),
  xn = new Float32Array(bn.buffer),
  Sn = new Int32Array(bn.buffer);
function Cn(e, t, n) {
  if (t === n) return e;
  if (t === `f32`) {
    if (n === `i32` || n === `x32`) return (mn[0] = e), hn[0];
    if (n === `u32`) return (mn[0] = e), gn[0];
  } else if (t === `i32` || t === `x32`) {
    if (n === `f32`) return (_n[0] = e), vn[0];
    if (n === `u32`) return (_n[0] = e), yn[0];
  } else if (t === `u32`) {
    if (n === `f32`) return (bn[0] = e), xn[0];
    if (n === `i32` || n === `x32`) return (bn[0] = e), Sn[0];
  }
  return console.error(`Unsupported cast from ${t} to ${n}`), e;
}
var wn = class {
    constructor(e) {
      (this.resources = null),
        (this.inUse = !1),
        (this.info = null),
        (this.node = e);
    }
  },
  Tn = class {
    constructor(e, t) {
      (this.align = e), (this.size = t);
    }
  },
  En = class e {
    constructor() {
      (this.uniforms = []),
        (this.storage = []),
        (this.textures = []),
        (this.samplers = []),
        (this.aliases = []),
        (this.overrides = []),
        (this.structs = []),
        (this.entry = new Xe()),
        (this.functions = []),
        (this._types = new Map()),
        (this._functions = new Map());
    }
    _isStorageTexture(e) {
      return (
        e.name == `texture_storage_1d` ||
        e.name == `texture_storage_2d` ||
        e.name == `texture_storage_2d_array` ||
        e.name == `texture_storage_3d`
      );
    }
    updateAST(e) {
      for (let t of e)
        t instanceof ut && this._functions.set(t.name, new wn(t));
      for (let t of e)
        if (t instanceof It) {
          let e = this.getTypeInfo(t, null);
          e instanceof Re && this.structs.push(e);
        }
      for (let t of e)
        if (t instanceof jt) this.aliases.push(this._getAliasInfo(t));
        else if (t instanceof gt) {
          let e = t,
            n = this._getAttributeNum(e.attributes, `id`, 0),
            r = e.type == null ? null : this.getTypeInfo(e.type, e.attributes);
          this.overrides.push(new qe(e.name, r, e.attributes, n));
        } else if (this._isUniformVar(t)) {
          let e = t,
            n = this._getAttributeNum(e.attributes, `group`, 0),
            r = this._getAttributeNum(e.attributes, `binding`, 0),
            i = this.getTypeInfo(e.type, e.attributes),
            a = new Ue(e.name, i, n, r, e.attributes, He.Uniform, e.access);
          (a.access ||= `read`), this.uniforms.push(a);
        } else if (this._isStorageVar(t)) {
          let e = t,
            n = this._getAttributeNum(e.attributes, `group`, 0),
            r = this._getAttributeNum(e.attributes, `binding`, 0),
            i = this.getTypeInfo(e.type, e.attributes),
            a = this._isStorageTexture(i),
            o = new Ue(
              e.name,
              i,
              n,
              r,
              e.attributes,
              a ? He.StorageTexture : He.Storage,
              e.access,
            );
          (o.access ||= `read`), this.storage.push(o);
        } else if (this._isTextureVar(t)) {
          let e = t,
            n = this._getAttributeNum(e.attributes, `group`, 0),
            r = this._getAttributeNum(e.attributes, `binding`, 0),
            i = this.getTypeInfo(e.type, e.attributes),
            a = this._isStorageTexture(i),
            o = new Ue(
              e.name,
              i,
              n,
              r,
              e.attributes,
              a ? He.StorageTexture : He.Texture,
              e.access,
            );
          (o.access ||= `read`),
            a ? this.storage.push(o) : this.textures.push(o);
        } else if (this._isSamplerVar(t)) {
          let e = t,
            n = this._getAttributeNum(e.attributes, `group`, 0),
            r = this._getAttributeNum(e.attributes, `binding`, 0),
            i = this.getTypeInfo(e.type, e.attributes),
            a = new Ue(e.name, i, n, r, e.attributes, He.Sampler, e.access);
          this.samplers.push(a);
        }
      for (let t of e)
        if (t instanceof ut) {
          let e = this._getAttribute(t, `vertex`),
            n = this._getAttribute(t, `fragment`),
            r = this._getAttribute(t, `compute`),
            i = e || n || r,
            a = new Ye(t.name, i?.name, t.attributes);
          (a.attributes = t.attributes),
            (a.startLine = t.startLine),
            (a.endLine = t.endLine),
            this.functions.push(a),
            (this._functions.get(t.name).info = a),
            i &&
              ((this._functions.get(t.name).inUse = !0),
              (a.inUse = !0),
              (a.resources = this._findResources(t, !!i)),
              (a.inputs = this._getInputs(t.args)),
              (a.outputs = this._getOutputs(t.returnType)),
              this.entry[i.name].push(a)),
            (a.arguments = t.args.map(
              (e) =>
                new Je(
                  e.name,
                  this.getTypeInfo(e.type, e.attributes),
                  e.attributes,
                ),
            )),
            (a.returnType = t.returnType
              ? this.getTypeInfo(t.returnType, t.attributes)
              : null);
        }
      for (let e of this._functions.values())
        e.info &&
          ((e.info.inUse = e.inUse), this._addCalls(e.node, e.info.calls));
      for (let e of this._functions.values())
        e.node.search((t) => {
          var n, r, i;
          if (t instanceof an) {
            if (t.value) {
              if (Y(t.value))
                for (let r of t.value)
                  for (let t of this.overrides)
                    r === t.name &&
                      ((n = e.info) == null || n.overrides.push(t));
              else
                for (let n of this.overrides)
                  t.value === n.name &&
                    ((r = e.info) == null || r.overrides.push(n));
            }
          } else if (t instanceof Wt)
            for (let n of this.overrides)
              t.name === n.name &&
                ((i = e.info) == null || i.overrides.push(n));
        });
      for (let e of this.uniforms) this._markStructsInUse(e.type);
      for (let e of this.storage) this._markStructsInUse(e.type);
    }
    getStructInfo(e) {
      for (let t of this.structs) if (t.name == e) return t;
      return null;
    }
    getOverrideInfo(e) {
      for (let t of this.overrides) if (t.name == e) return t;
      return null;
    }
    _markStructsInUse(e) {
      if (e) {
        if (e.isStruct) {
          if (((e.inUse = !0), e.members))
            for (let t of e.members) this._markStructsInUse(t.type);
        } else if (e.isArray) this._markStructsInUse(e.format);
        else if (e.isTemplate) e.format && this._markStructsInUse(e.format);
        else {
          let t = this._getAlias(e.name);
          t && this._markStructsInUse(t);
        }
      }
    }
    _addCalls(e, t) {
      for (let n of e.calls) {
        let e = this._functions.get(n.name)?.info;
        e && t.add(e);
      }
    }
    findResource(e, t, n) {
      if (n) {
        for (let r of this.entry.compute)
          if (r.name === n) {
            for (let n of r.resources)
              if (n.group == e && n.binding == t) return n;
          }
        for (let r of this.entry.vertex)
          if (r.name === n) {
            for (let n of r.resources)
              if (n.group == e && n.binding == t) return n;
          }
        for (let r of this.entry.fragment)
          if (r.name === n) {
            for (let n of r.resources)
              if (n.group == e && n.binding == t) return n;
          }
      }
      for (let n of this.uniforms) if (n.group == e && n.binding == t) return n;
      for (let n of this.storage) if (n.group == e && n.binding == t) return n;
      for (let n of this.textures) if (n.group == e && n.binding == t) return n;
      for (let n of this.samplers) if (n.group == e && n.binding == t) return n;
      return null;
    }
    _findResource(e) {
      for (let t of this.uniforms) if (t.name == e) return t;
      for (let t of this.storage) if (t.name == e) return t;
      for (let t of this.textures) if (t.name == e) return t;
      for (let t of this.samplers) if (t.name == e) return t;
      return null;
    }
    _markStructsFromAST(e) {
      let t = this.getTypeInfo(e, null);
      this._markStructsInUse(t);
    }
    _findResources(e, t) {
      let n = [],
        r = this,
        i = [];
      return (
        e.search((a) => {
          if (a instanceof st) i.push({});
          else if (a instanceof ct) i.pop();
          else if (a instanceof ht) {
            let e = a;
            t && e.type !== null && this._markStructsFromAST(e.type),
              i.length > 0 && (i[i.length - 1][e.name] = e);
          } else if (a instanceof Ht) {
            let e = a;
            t && e.type !== null && this._markStructsFromAST(e.type);
          } else if (a instanceof _t) {
            let e = a;
            t && e.type !== null && this._markStructsFromAST(e.type),
              i.length > 0 && (i[i.length - 1][e.name] = e);
          } else if (a instanceof Wt) {
            let e = a;
            if (i.length > 0 && i[i.length - 1][e.name]) return;
            let t = r._findResource(e.name);
            t && n.push(t);
          } else if (a instanceof Ut) {
            let i = a,
              o = r._functions.get(i.name);
            o &&
              (t && (o.inUse = !0),
              e.calls.add(o.node),
              o.resources === null &&
                (o.resources = r._findResources(o.node, t)),
              n.push(...o.resources));
          } else if (a instanceof Ct) {
            let i = a,
              o = r._functions.get(i.name);
            o &&
              (t && (o.inUse = !0),
              e.calls.add(o.node),
              o.resources === null &&
                (o.resources = r._findResources(o.node, t)),
              n.push(...o.resources));
          }
        }),
        [...new Map(n.map((e) => [e.name, e])).values()]
      );
    }
    getBindGroups() {
      let e = [];
      function t(t, n) {
        t >= e.length && (e.length = t + 1),
          e[t] === void 0 && (e[t] = []),
          n >= e[t].length && (e[t].length = n + 1);
      }
      for (let n of this.uniforms)
        t(n.group, n.binding), (e[n.group][n.binding] = n);
      for (let n of this.storage)
        t(n.group, n.binding), (e[n.group][n.binding] = n);
      for (let n of this.textures)
        t(n.group, n.binding), (e[n.group][n.binding] = n);
      for (let n of this.samplers)
        t(n.group, n.binding), (e[n.group][n.binding] = n);
      return e;
    }
    _getOutputs(e, t = void 0) {
      if ((t === void 0 && (t = []), e instanceof It))
        this._getStructOutputs(e, t);
      else {
        let n = this._getOutputInfo(e);
        n !== null && t.push(n);
      }
      return t;
    }
    _getStructOutputs(e, t) {
      for (let n of e.members)
        if (n.type instanceof It) this._getStructOutputs(n.type, t);
        else {
          let e =
            this._getAttribute(n, `location`) ||
            this._getAttribute(n, `builtin`);
          if (e !== null) {
            let r = this.getTypeInfo(n.type, n.type.attributes),
              i = this._parseInt(e.value),
              a = new Ke(n.name, r, e.name, i);
            t.push(a);
          }
        }
    }
    _getOutputInfo(e) {
      let t =
        this._getAttribute(e, `location`) || this._getAttribute(e, `builtin`);
      if (t !== null) {
        let n = this.getTypeInfo(e, e.attributes),
          r = this._parseInt(t.value);
        return new Ke(``, n, t.name, r);
      }
      return null;
    }
    _getInputs(e, t = void 0) {
      t === void 0 && (t = []);
      for (let n of e)
        if (n.type instanceof It) this._getStructInputs(n.type, t);
        else {
          let e = this._getInputInfo(n);
          e !== null && t.push(e);
        }
      return t;
    }
    _getStructInputs(e, t) {
      for (let n of e.members)
        if (n.type instanceof It) this._getStructInputs(n.type, t);
        else {
          let e = this._getInputInfo(n);
          e !== null && t.push(e);
        }
    }
    _getInputInfo(e) {
      let t =
        this._getAttribute(e, `location`) || this._getAttribute(e, `builtin`);
      if (t !== null) {
        let n = this._getAttribute(e, `interpolation`),
          r = this.getTypeInfo(e.type, e.attributes),
          i = this._parseInt(t.value),
          a = new Ge(e.name, r, t.name, i);
        return n !== null && (a.interpolation = this._parseString(n.value)), a;
      }
      return null;
    }
    _parseString(e) {
      return e instanceof Array && (e = e[0]), e;
    }
    _parseInt(e) {
      e instanceof Array && (e = e[0]);
      let t = parseInt(e);
      return isNaN(t) ? e : t;
    }
    _getAlias(e) {
      for (let t of this.aliases) if (t.name == e) return t.type;
      return null;
    }
    _getAliasInfo(e) {
      return new We(e.name, this.getTypeInfo(e.type, null));
    }
    getTypeInfoByName(e) {
      for (let t of this.structs) if (t.name == e) return t;
      for (let t of this.aliases) if (t.name == e) return t.type;
      return null;
    }
    getTypeInfo(e, t = null) {
      if (this._types.has(e)) return this._types.get(e);
      if (e instanceof Lt) {
        let n = e.type ? this.getTypeInfo(e.type, e.attributes) : null,
          r = new Be(e.name, n, t);
        return this._types.set(e, r), this._updateTypeInfo(r), r;
      }
      if (e instanceof Rt) {
        let n = e,
          r = n.format ? this.getTypeInfo(n.format, n.attributes) : null,
          i = new ze(n.name, t);
        return (
          (i.format = r),
          (i.count = n.count),
          this._types.set(e, i),
          this._updateTypeInfo(i),
          i
        );
      }
      if (e instanceof It) {
        let n = e,
          r = new Re(n.name, t);
        (r.startLine = n.startLine), (r.endLine = n.endLine);
        for (let e of n.members) {
          let t = this.getTypeInfo(e.type, e.attributes);
          r.members.push(new Le(e.name, t, e.attributes));
        }
        return this._types.set(e, r), this._updateTypeInfo(r), r;
      }
      if (e instanceof zt) {
        let n = e,
          r = n.format instanceof V,
          i = n.format
            ? r
              ? this.getTypeInfo(n.format, null)
              : new Ie(n.format, null)
            : null,
          a = new Ve(n.name, i, t, n.access);
        return this._types.set(e, a), this._updateTypeInfo(a), a;
      }
      if (e instanceof H) {
        let n = e,
          r = n.format ? this.getTypeInfo(n.format, null) : null,
          i = new Ve(n.name, r, t, n.access);
        return this._types.set(e, i), this._updateTypeInfo(i), i;
      }
      let n = new Ie(e.name, t);
      return this._types.set(e, n), this._updateTypeInfo(n), n;
    }
    _updateTypeInfo(e) {
      if (
        ((e.size = this._getTypeSize(e)?.size ?? 0),
        e instanceof ze && e.format)
      ) {
        let t = this._getTypeSize(e.format);
        (e.stride = Math.max(t?.size ?? 0, t?.align ?? 0)),
          this._updateTypeInfo(e.format);
      }
      e instanceof Be && this._updateTypeInfo(e.format),
        e instanceof Re && this._updateStructInfo(e);
    }
    _updateStructInfo(e) {
      let t = 0,
        n = 0,
        r = 0,
        i = 0;
      for (let a = 0, o = e.members.length; a < o; ++a) {
        let o = e.members[a],
          s = this._getTypeSize(o);
        if (!s) continue;
        this._getAlias(o.type.name) ?? o.type;
        let c = s.align,
          l = s.size;
        (t = this._roundUp(c, t + n)),
          (n = l),
          (r = t),
          (i = Math.max(i, c)),
          (o.offset = t),
          (o.size = l),
          this._updateTypeInfo(o.type);
      }
      (e.size = this._roundUp(i, r + n)), (e.align = i);
    }
    _getTypeSize(t) {
      if (t == null) return null;
      let n = this._getAttributeNum(t.attributes, `size`, 0),
        r = this._getAttributeNum(t.attributes, `align`, 0);
      if ((t instanceof Le && (t = t.type), t instanceof Ie)) {
        let e = this._getAlias(t.name);
        e !== null && (t = e);
      }
      {
        let i = e._typeInfo[t.name];
        if (i !== void 0) {
          let e = t.format?.name === `f16` ? 2 : 1;
          return new Tn(Math.max(r, i.align / e), Math.max(n, i.size / e));
        }
      }
      {
        let i = e._typeInfo[t.name.substring(0, t.name.length - 1)];
        if (i) {
          let e = t.name[t.name.length - 1] === `h` ? 2 : 1;
          return new Tn(Math.max(r, i.align / e), Math.max(n, i.size / e));
        }
      }
      if (t instanceof ze) {
        let e = t,
          i = 8,
          a = 8,
          o = this._getTypeSize(e.format);
        return (
          o !== null && ((a = o.size), (i = o.align)),
          (a =
            e.count *
            this._getAttributeNum(
              t?.attributes ?? null,
              `stride`,
              this._roundUp(i, a),
            )),
          n && (a = n),
          new Tn(Math.max(r, i), Math.max(n, a))
        );
      }
      if (t instanceof Re) {
        let e = 0,
          i = 0,
          a = 0,
          o = 0,
          s = 0;
        for (let n of t.members) {
          let t = this._getTypeSize(n.type);
          t !== null &&
            ((e = Math.max(t.align, e)),
            (a = this._roundUp(t.align, a + o)),
            (o = t.size),
            (s = a));
        }
        return (
          (i = this._roundUp(e, s + o)), new Tn(Math.max(r, e), Math.max(n, i))
        );
      }
      return null;
    }
    _isUniformVar(e) {
      return e instanceof ht && e.storage == `uniform`;
    }
    _isStorageVar(e) {
      return e instanceof ht && e.storage == `storage`;
    }
    _isTextureVar(t) {
      return (
        t instanceof ht &&
        t.type !== null &&
        e._textureTypes.indexOf(t.type.name) != -1
      );
    }
    _isSamplerVar(t) {
      return (
        t instanceof ht &&
        t.type !== null &&
        e._samplerTypes.indexOf(t.type.name) != -1
      );
    }
    _getAttribute(e, t) {
      let n = e;
      if (!n || !n.attributes) return null;
      let r = n.attributes;
      for (let e of r) if (e.name == t) return e;
      return null;
    }
    _getAttributeNum(e, t, n) {
      if (e === null) return n;
      for (let r of e)
        if (r.name == t) {
          let e = r !== null && r.value !== null ? r.value : n;
          return (
            e instanceof Array && (e = e[0]),
            typeof e == `number` ? e : typeof e == `string` ? parseInt(e) : n
          );
        }
      return n;
    }
    _roundUp(e, t) {
      return Math.ceil(t / e) * e;
    }
  };
(En._typeInfo = {
  f16: { align: 2, size: 2 },
  i32: { align: 4, size: 4 },
  u32: { align: 4, size: 4 },
  f32: { align: 4, size: 4 },
  atomic: { align: 4, size: 4 },
  vec2: { align: 8, size: 8 },
  vec3: { align: 16, size: 12 },
  vec4: { align: 16, size: 16 },
  mat2x2: { align: 8, size: 16 },
  mat3x2: { align: 8, size: 24 },
  mat4x2: { align: 8, size: 32 },
  mat2x3: { align: 16, size: 32 },
  mat3x3: { align: 16, size: 48 },
  mat4x3: { align: 16, size: 64 },
  mat2x4: { align: 16, size: 32 },
  mat3x4: { align: 16, size: 48 },
  mat4x4: { align: 16, size: 64 },
}),
  (En._textureTypes = J.any_texture_type.map((e) => e.name)),
  (En._samplerTypes = J.sampler_type.map((e) => e.name));
var Dn = 0,
  On = class e {
    constructor(e, t, n) {
      (this.id = Dn++), (this.name = e), (this.value = t), (this.node = n);
    }
    clone() {
      return new e(this.name, this.value, this.node);
    }
  },
  kn = class e {
    constructor(e) {
      (this.id = Dn++), (this.name = e.name), (this.node = e);
    }
    clone() {
      return new e(this.node);
    }
  },
  An = class e {
    constructor(e) {
      (this.parent = null),
        (this.variables = new Map()),
        (this.functions = new Map()),
        (this.currentFunctionName = ``),
        (this.id = Dn++),
        e &&
          ((this.parent = e),
          (this.currentFunctionName = e.currentFunctionName));
    }
    getVariable(e) {
      return this.variables.has(e)
        ? (this.variables.get(e) ?? null)
        : this.parent
          ? this.parent.getVariable(e)
          : null;
    }
    getFunction(e) {
      return this.functions.has(e)
        ? (this.functions.get(e) ?? null)
        : this.parent
          ? this.parent.getFunction(e)
          : null;
    }
    createVariable(e, t, n) {
      this.variables.set(e, new On(e, t, n ?? null));
    }
    setVariable(e, t, n) {
      let r = this.getVariable(e);
      r === null ? this.createVariable(e, t, n) : (r.value = t);
    }
    getVariableValue(e) {
      return this.getVariable(e)?.value ?? null;
    }
    clone() {
      return new e(this);
    }
  },
  jn = class {
    evalExpression(e, t) {
      return null;
    }
    getTypeInfo(e) {
      return null;
    }
    getVariableName(e, t) {
      return ``;
    }
  },
  Mn = class {
    constructor(e) {
      this.exec = e;
    }
    getTypeInfo(e) {
      return this.exec.getTypeInfo(e);
    }
    All(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = !0;
      if (n instanceof G)
        return (
          n.data.forEach((e) => {
            e || (r = !1);
          }),
          new W(+!!r, this.getTypeInfo(`bool`))
        );
      throw Error(`All() expects a vector argument. Line ${e.line}`);
    }
    Any(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new W(+!!n.data.some((e) => e), this.getTypeInfo(`bool`));
      throw Error(`Any() expects a vector argument. Line ${e.line}`);
    }
    Select(e, t) {
      let n = this.exec.evalExpression(e.args[2], t);
      if (!(n instanceof W))
        throw Error(`Select() expects a bool condition. Line ${e.line}`);
      return n.value
        ? this.exec.evalExpression(e.args[1], t)
        : this.exec.evalExpression(e.args[0], t);
    }
    ArrayLength(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.evalExpression(n, t);
      if (r instanceof un && r.typeInfo.size === 0) {
        let e = r.typeInfo;
        return new W(r.buffer.byteLength / e.stride, this.getTypeInfo(`u32`));
      }
      return new W(r.typeInfo.size, this.getTypeInfo(`u32`));
    }
    Abs(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new G(
          n.data.map((e) => Math.abs(e)),
          n.typeInfo,
        );
      let r = n;
      return new W(Math.abs(r.value), r.typeInfo);
    }
    Acos(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.acos(e)),
            n.typeInfo,
          )
        : new W(Math.acos(n.value), n.typeInfo);
    }
    Acosh(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.acosh(e)),
            n.typeInfo,
          )
        : new W(Math.acosh(n.value), n.typeInfo);
    }
    Asin(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.asin(e)),
            n.typeInfo,
          )
        : new W(Math.asin(n.value), n.typeInfo);
    }
    Asinh(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.asinh(e)),
            n.typeInfo,
          )
        : new W(Math.asinh(n.value), n.typeInfo);
    }
    Atan(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.atan(e)),
            n.typeInfo,
          )
        : new W(Math.atan(n.value), n.typeInfo);
    }
    Atanh(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.atanh(e)),
            n.typeInfo,
          )
        : new W(Math.atanh(n.value), n.typeInfo);
    }
    Atan2(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G)
        return new G(
          n.data.map((e, t) => Math.atan2(e, r.data[t])),
          n.typeInfo,
        );
      let i = n,
        a = r;
      return new W(Math.atan2(i.value, a.value), n.typeInfo);
    }
    Ceil(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.ceil(e)),
            n.typeInfo,
          )
        : new W(Math.ceil(n.value), n.typeInfo);
    }
    _clamp(e, t, n) {
      return Math.min(Math.max(e, t), n);
    }
    Clamp(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      if (n instanceof G && r instanceof G && i instanceof G)
        return new G(
          n.data.map((e, t) => this._clamp(e, r.data[t], i.data[t])),
          n.typeInfo,
        );
      let a = n,
        o = r,
        s = i;
      return new W(this._clamp(a.value, o.value, s.value), n.typeInfo);
    }
    Cos(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.cos(e)),
            n.typeInfo,
          )
        : new W(Math.cos(n.value), n.typeInfo);
    }
    Cosh(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.cosh(e)),
            n.typeInfo,
          )
        : new W(Math.cos(n.value), n.typeInfo);
    }
    CountLeadingZeros(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.clz32(e)),
            n.typeInfo,
          )
        : new W(Math.clz32(n.value), n.typeInfo);
    }
    _countOneBits(e) {
      let t = 0;
      for (; e !== 0; ) 1 & e && t++, (e >>= 1);
      return t;
    }
    CountOneBits(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new G(
          n.data.map((e) => this._countOneBits(e)),
          n.typeInfo,
        );
      let r = n;
      return new W(this._countOneBits(r.value), n.typeInfo);
    }
    _countTrailingZeros(e) {
      if (e === 0) return 32;
      let t = 0;
      for (; !(1 & e); ) (e >>= 1), t++;
      return t;
    }
    CountTrailingZeros(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new G(
          n.data.map((e) => this._countTrailingZeros(e)),
          n.typeInfo,
        );
      let r = n;
      return new W(this._countTrailingZeros(r.value), n.typeInfo);
    }
    Cross(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G) {
        if (n.data.length !== 3 || r.data.length !== 3)
          return (
            console.error(`Cross() expects 3D vectors. Line ${e.line}`), null
          );
        let t = n.data,
          i = r.data;
        return new G(
          [
            t[1] * i[2] - i[1] * t[2],
            t[2] * i[0] - i[2] * t[0],
            t[0] * i[1] - i[0] * t[1],
          ],
          n.typeInfo,
        );
      }
      return (
        console.error(`Cross() expects vector arguments. Line ${e.line}`), null
      );
    }
    Degrees(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = 180 / Math.PI;
      return n instanceof G
        ? new G(
            n.data.map((e) => e * r),
            n.typeInfo,
          )
        : new W(n.value * r, this.getTypeInfo(`f32`));
    }
    Determinant(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof K) {
        let e = n.data,
          t = n.typeInfo.getTypeName(),
          r = t.endsWith(`h`)
            ? this.getTypeInfo(`f16`)
            : this.getTypeInfo(`f32`);
        if (t === `mat2x2` || t === `mat2x2f` || t === `mat2x2h`)
          return new W(e[0] * e[3] - e[1] * e[2], r);
        if (t === `mat2x3` || t === `mat2x3f` || t === `mat2x3h`)
          return new W(
            e[0] * (e[4] * e[8] - e[5] * e[7]) -
              e[1] * (e[3] * e[8] - e[5] * e[6]) +
              e[2] * (e[3] * e[7] - e[4] * e[6]),
            r,
          );
        if (t === `mat2x4` || t === `mat2x4f` || t === `mat2x4h`)
          console.error(`TODO: Determinant for ${t}`);
        else if (t === `mat3x2` || t === `mat3x2f` || t === `mat3x2h`)
          console.error(`TODO: Determinant for ${t}`);
        else {
          if (t === `mat3x3` || t === `mat3x3f` || t === `mat3x3h`)
            return new W(
              e[0] * (e[4] * e[8] - e[5] * e[7]) -
                e[1] * (e[3] * e[8] - e[5] * e[6]) +
                e[2] * (e[3] * e[7] - e[4] * e[6]),
              r,
            );
          t === `mat3x4` ||
          t === `mat3x4f` ||
          t === `mat3x4h` ||
          t === `mat4x2` ||
          t === `mat4x2f` ||
          t === `mat4x2h` ||
          t === `mat4x3` ||
          t === `mat4x3f` ||
          t === `mat4x3h`
            ? console.error(`TODO: Determinant for ${t}`)
            : (t !== `mat4x4` && t !== `mat4x4f` && t !== `mat4x4h`) ||
              console.error(`TODO: Determinant for ${t}`);
        }
      }
      return (
        console.error(`Determinant expects a matrix argument. Line ${e.line}`),
        null
      );
    }
    Distance(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G) {
        let e = 0;
        for (let t = 0; t < n.data.length; ++t)
          e += (n.data[t] - r.data[t]) * (n.data[t] - r.data[t]);
        return new W(Math.sqrt(e), this.getTypeInfo(`f32`));
      }
      let i = n,
        a = r;
      return new W(Math.abs(i.value - a.value), n.typeInfo);
    }
    _dot(e, t) {
      let n = 0;
      for (let r = 0; r < e.length; ++r) n += t[r] * e[r];
      return n;
    }
    Dot(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      return n instanceof G && r instanceof G
        ? new W(this._dot(n.data, r.data), this.getTypeInfo(`f32`))
        : (console.error(`Dot() expects vector arguments. Line ${e.line}`),
          null);
    }
    Dot4U8Packed(e, t) {
      return console.error(`TODO: dot4U8Packed. Line ${e.line}`), null;
    }
    Dot4I8Packed(e, t) {
      return console.error(`TODO: dot4I8Packed. Line ${e.line}`), null;
    }
    Exp(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.exp(e)),
            n.typeInfo,
          )
        : new W(Math.exp(n.value), n.typeInfo);
    }
    Exp2(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => 2 ** e),
            n.typeInfo,
          )
        : new W(2 ** n.value, n.typeInfo);
    }
    ExtractBits(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      if (r.typeInfo.name !== `u32` && r.typeInfo.name !== `x32`)
        return (
          console.error(
            `ExtractBits() expects an i32 offset argument. Line ${e.line}`,
          ),
          null
        );
      if (i.typeInfo.name !== `u32` && i.typeInfo.name !== `x32`)
        return (
          console.error(
            `ExtractBits() expects an i32 count argument. Line ${e.line}`,
          ),
          null
        );
      let a = r.value,
        o = i.value;
      if (n instanceof G)
        return new G(
          n.data.map((e) => (e >> a) & ((1 << o) - 1)),
          n.typeInfo,
        );
      if (n.typeInfo.name !== `i32` && n.typeInfo.name !== `x32`)
        return (
          console.error(
            `ExtractBits() expects an i32 argument. Line ${e.line}`,
          ),
          null
        );
      let s = n.value;
      return new W((s >> a) & ((1 << o) - 1), this.getTypeInfo(`i32`));
    }
    FaceForward(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      return n instanceof G && r instanceof G && i instanceof G
        ? new G(
            this._dot(r.data, i.data) < 0
              ? Array.from(n.data)
              : n.data.map((e) => -e),
            n.typeInfo,
          )
        : (console.error(
            `FaceForward() expects vector arguments. Line ${e.line}`,
          ),
          null);
    }
    _firstLeadingBit(e) {
      return e === 0 ? -1 : 31 - Math.clz32(e);
    }
    FirstLeadingBit(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new G(
          n.data.map((e) => this._firstLeadingBit(e)),
          n.typeInfo,
        );
      let r = n;
      return new W(this._firstLeadingBit(r.value), n.typeInfo);
    }
    _firstTrailingBit(e) {
      return e === 0 ? -1 : Math.log2(e & -e);
    }
    FirstTrailingBit(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new G(
          n.data.map((e) => this._firstTrailingBit(e)),
          n.typeInfo,
        );
      let r = n;
      return new W(this._firstTrailingBit(r.value), n.typeInfo);
    }
    Floor(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.floor(e)),
            n.typeInfo,
          )
        : new W(Math.floor(n.value), n.typeInfo);
    }
    Fma(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      if (n instanceof G && r instanceof G && i instanceof G)
        return n.data.length !== r.data.length ||
          n.data.length !== i.data.length
          ? (console.error(
              `Fma() expects vectors of the same length. Line ${e.line}`,
            ),
            null)
          : new G(
              n.data.map((e, t) => e * r.data[t] + i.data[t]),
              n.typeInfo,
            );
      let a = n,
        o = r,
        s = i;
      return new W(a.value * o.value + s.value, a.typeInfo);
    }
    Fract(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G)
        return new G(
          n.data.map((e) => e - Math.floor(e)),
          n.typeInfo,
        );
      let r = n;
      return new W(r.value - Math.floor(r.value), n.typeInfo);
    }
    Frexp(e, t) {
      return console.error(`TODO: frexp. Line ${e.line}`), null;
    }
    InsertBits(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t),
        a = this.exec.evalExpression(e.args[3], t);
      if (i.typeInfo.name !== `u32` && i.typeInfo.name !== `x32`)
        return (
          console.error(
            `InsertBits() expects an i32 offset argument. Line ${e.line}`,
          ),
          null
        );
      let o = i.value,
        s = ((1 << a.value) - 1) << o,
        c = ~s;
      if (n instanceof G && r instanceof G)
        return new G(
          n.data.map((e, t) => (e & c) | ((r.data[t] << o) & s)),
          n.typeInfo,
        );
      let l = n.value,
        u = r.value;
      return new W((l & c) | ((u << o) & s), n.typeInfo);
    }
    InverseSqrt(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => 1 / Math.sqrt(e)),
            n.typeInfo,
          )
        : new W(1 / Math.sqrt(n.value), n.typeInfo);
    }
    Ldexp(e, t) {
      return console.error(`TODO: ldexp. Line ${e.line}`), null;
    }
    Length(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G) {
        let e = 0;
        return (
          n.data.forEach((t) => {
            e += t * t;
          }),
          new W(Math.sqrt(e), this.getTypeInfo(`f32`))
        );
      }
      return new W(Math.abs(n.value), n.typeInfo);
    }
    Log(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.log(e)),
            n.typeInfo,
          )
        : new W(Math.log(n.value), n.typeInfo);
    }
    Log2(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.log2(e)),
            n.typeInfo,
          )
        : new W(Math.log2(n.value), n.typeInfo);
    }
    Max(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G)
        return new G(
          n.data.map((e, t) => Math.max(e, r.data[t])),
          n.typeInfo,
        );
      let i = n,
        a = r;
      return new W(Math.max(i.value, a.value), n.typeInfo);
    }
    Min(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G)
        return new G(
          n.data.map((e, t) => Math.min(e, r.data[t])),
          n.typeInfo,
        );
      let i = n,
        a = r;
      return new W(Math.min(i.value, a.value), n.typeInfo);
    }
    Mix(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      if (n instanceof G && r instanceof G && i instanceof G)
        return new G(
          n.data.map(
            (e, t) => n.data[t] * (1 - i.data[t]) + r.data[t] * i.data[t],
          ),
          n.typeInfo,
        );
      let a = r,
        o = i;
      return new W(n.value * (1 - o.value) + a.value * o.value, n.typeInfo);
    }
    Modf(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G)
        return new G(
          n.data.map((e, t) => e % r.data[t]),
          n.typeInfo,
        );
      let i = r;
      return new W(n.value % i.value, n.typeInfo);
    }
    Normalize(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (n instanceof G) {
        let r = this.Length(e, t).value;
        return new G(
          n.data.map((e) => e / r),
          n.typeInfo,
        );
      }
      return (
        console.error(`Normalize() expects a vector argument. Line ${e.line}`),
        null
      );
    }
    Pow(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G)
        return new G(
          n.data.map((e, t) => e ** +r.data[t]),
          n.typeInfo,
        );
      let i = n,
        a = r;
      return new W(i.value ** +a.value, n.typeInfo);
    }
    QuantizeToF16(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => e),
            n.typeInfo,
          )
        : new W(n.value, n.typeInfo);
    }
    Radians(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => (e * Math.PI) / 180),
            n.typeInfo,
          )
        : new W((n.value * Math.PI) / 180, this.getTypeInfo(`f32`));
    }
    Reflect(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (n instanceof G && r instanceof G) {
        let e = this._dot(n.data, r.data);
        return new G(
          n.data.map((t, n) => t - 2 * e * r.data[n]),
          n.typeInfo,
        );
      }
      return (
        console.error(`Reflect() expects vector arguments. Line ${e.line}`),
        null
      );
    }
    Refract(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      if (n instanceof G && r instanceof G && i instanceof W) {
        let e = this._dot(r.data, n.data);
        return new G(
          n.data.map((t, n) => {
            let a = 1 - i.value * i.value * (1 - e * e);
            if (a < 0) return 0;
            let o = Math.sqrt(a);
            return i.value * t - (i.value * e + o) * r.data[n];
          }),
          n.typeInfo,
        );
      }
      return (
        console.error(
          `Refract() expects vector arguments and a scalar argument. Line ${e.line}`,
        ),
        null
      );
    }
    ReverseBits(e, t) {
      return console.error(`TODO: reverseBits. Line ${e.line}`), null;
    }
    Round(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.round(e)),
            n.typeInfo,
          )
        : new W(Math.round(n.value), n.typeInfo);
    }
    Saturate(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.min(Math.max(e, 0), 1)),
            n.typeInfo,
          )
        : new W(Math.min(Math.max(n.value, 0), 1), n.typeInfo);
    }
    Sign(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.sign(e)),
            n.typeInfo,
          )
        : new W(Math.sign(n.value), n.typeInfo);
    }
    Sin(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.sin(e)),
            n.typeInfo,
          )
        : new W(Math.sin(n.value), n.typeInfo);
    }
    Sinh(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.sinh(e)),
            n.typeInfo,
          )
        : new W(Math.sinh(n.value), n.typeInfo);
    }
    _smoothstep(e, t, n) {
      let r = Math.min(Math.max((n - e) / (t - e), 0), 1);
      return r * r * (3 - 2 * r);
    }
    SmoothStep(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t),
        i = this.exec.evalExpression(e.args[2], t);
      if (i instanceof G && n instanceof G && r instanceof G)
        return new G(
          i.data.map((e, t) => this._smoothstep(n.data[t], r.data[t], e)),
          i.typeInfo,
        );
      let a = n,
        o = r,
        s = i;
      return new W(this._smoothstep(a.value, o.value, s.value), i.typeInfo);
    }
    Sqrt(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.sqrt(e)),
            n.typeInfo,
          )
        : new W(Math.sqrt(n.value), n.typeInfo);
    }
    Step(e, t) {
      let n = this.exec.evalExpression(e.args[0], t),
        r = this.exec.evalExpression(e.args[1], t);
      if (r instanceof G && n instanceof G)
        return new G(
          r.data.map((e, t) => (e < n.data[t] ? 0 : 1)),
          r.typeInfo,
        );
      let i = n;
      return new W(r.value < i.value ? 0 : 1, i.typeInfo);
    }
    Tan(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.tan(e)),
            n.typeInfo,
          )
        : new W(Math.tan(n.value), n.typeInfo);
    }
    Tanh(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.tanh(e)),
            n.typeInfo,
          )
        : new W(Math.tanh(n.value), n.typeInfo);
    }
    _getTransposeType(e) {
      let t = e.getTypeName();
      return t === `mat2x2f` || t === `mat2x2h`
        ? e
        : t === `mat2x3f`
          ? this.getTypeInfo(`mat3x2f`)
          : t === `mat2x3h`
            ? this.getTypeInfo(`mat3x2h`)
            : t === `mat2x4f`
              ? this.getTypeInfo(`mat4x2f`)
              : t === `mat2x4h`
                ? this.getTypeInfo(`mat4x2h`)
                : t === `mat3x2f`
                  ? this.getTypeInfo(`mat2x3f`)
                  : t === `mat3x2h`
                    ? this.getTypeInfo(`mat2x3h`)
                    : t === `mat3x3f` || t === `mat3x3h`
                      ? e
                      : t === `mat3x4f`
                        ? this.getTypeInfo(`mat4x3f`)
                        : t === `mat3x4h`
                          ? this.getTypeInfo(`mat4x3h`)
                          : t === `mat4x2f`
                            ? this.getTypeInfo(`mat2x4f`)
                            : t === `mat4x2h`
                              ? this.getTypeInfo(`mat2x4h`)
                              : t === `mat4x3f`
                                ? this.getTypeInfo(`mat3x4f`)
                                : t === `mat4x3h`
                                  ? this.getTypeInfo(`mat3x4h`)
                                  : (t === `mat4x4f` ||
                                      t === `mat4x4h` ||
                                      console.error(`Invalid matrix type ${t}`),
                                    e);
    }
    Transpose(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      if (!(n instanceof K))
        return (
          console.error(
            `Transpose() expects a matrix argument. Line ${e.line}`,
          ),
          null
        );
      let r = this._getTransposeType(n.typeInfo);
      if (
        n.typeInfo.name === `mat2x2` ||
        n.typeInfo.name === `mat2x2f` ||
        n.typeInfo.name === `mat2x2h`
      ) {
        let e = n.data;
        return new K([e[0], e[2], e[1], e[3]], r);
      }
      if (
        n.typeInfo.name === `mat2x3` ||
        n.typeInfo.name === `mat2x3f` ||
        n.typeInfo.name === `mat2x3h`
      ) {
        let e = n.data;
        return new K([e[0], e[3], e[6], e[1], e[4], e[7]], r);
      }
      if (
        n.typeInfo.name === `mat2x4` ||
        n.typeInfo.name === `mat2x4f` ||
        n.typeInfo.name === `mat2x4h`
      ) {
        let e = n.data;
        return new K([e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13]], r);
      }
      if (
        n.typeInfo.name === `mat3x2` ||
        n.typeInfo.name === `mat3x2f` ||
        n.typeInfo.name === `mat3x2h`
      ) {
        let e = n.data;
        return new K([e[0], e[3], e[1], e[4], e[2], e[5]], r);
      }
      if (
        n.typeInfo.name === `mat3x3` ||
        n.typeInfo.name === `mat3x3f` ||
        n.typeInfo.name === `mat3x3h`
      ) {
        let e = n.data;
        return new K([e[0], e[3], e[6], e[1], e[4], e[7], e[2], e[5], e[8]], r);
      }
      if (
        n.typeInfo.name === `mat3x4` ||
        n.typeInfo.name === `mat3x4f` ||
        n.typeInfo.name === `mat3x4h`
      ) {
        let e = n.data;
        return new K(
          [
            e[0],
            e[4],
            e[8],
            e[12],
            e[1],
            e[5],
            e[9],
            e[13],
            e[2],
            e[6],
            e[10],
            e[14],
          ],
          r,
        );
      }
      if (
        n.typeInfo.name === `mat4x2` ||
        n.typeInfo.name === `mat4x2f` ||
        n.typeInfo.name === `mat4x2h`
      ) {
        let e = n.data;
        return new K([e[0], e[4], e[1], e[5], e[2], e[6]], r);
      }
      if (
        n.typeInfo.name === `mat4x3` ||
        n.typeInfo.name === `mat4x3f` ||
        n.typeInfo.name === `mat4x3h`
      ) {
        let e = n.data;
        return new K(
          [e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]],
          r,
        );
      }
      if (
        n.typeInfo.name === `mat4x4` ||
        n.typeInfo.name === `mat4x4f` ||
        n.typeInfo.name === `mat4x4h`
      ) {
        let e = n.data;
        return new K(
          [
            e[0],
            e[4],
            e[8],
            e[12],
            e[1],
            e[5],
            e[9],
            e[13],
            e[2],
            e[6],
            e[10],
            e[14],
            e[3],
            e[7],
            e[11],
            e[15],
          ],
          r,
        );
      }
      return console.error(`Invalid matrix type ${n.typeInfo.name}`), null;
    }
    Trunc(e, t) {
      let n = this.exec.evalExpression(e.args[0], t);
      return n instanceof G
        ? new G(
            n.data.map((e) => Math.trunc(e)),
            n.typeInfo,
          )
        : new W(Math.trunc(n.value), n.typeInfo);
    }
    Dpdx(e, t) {
      return console.error(`TODO: dpdx. Line ${e.line}`), null;
    }
    DpdxCoarse(e, t) {
      return console.error(`TODO: dpdxCoarse. Line ${e.line}`), null;
    }
    DpdxFine(e, t) {
      return console.error(`TODO: dpdxFine`), null;
    }
    Dpdy(e, t) {
      return console.error(`TODO: dpdy`), null;
    }
    DpdyCoarse(e, t) {
      return console.error(`TODO: dpdyCoarse`), null;
    }
    DpdyFine(e, t) {
      return console.error(`TODO: dpdyFine`), null;
    }
    Fwidth(e, t) {
      return console.error(`TODO: fwidth`), null;
    }
    FwidthCoarse(e, t) {
      return console.error(`TODO: fwidthCoarse`), null;
    }
    FwidthFine(e, t) {
      return console.error(`TODO: fwidthFine`), null;
    }
    TextureDimensions(e, t) {
      let n = e.args[0],
        r =
          e.args.length > 1 ? this.exec.evalExpression(e.args[1], t).value : 0;
      if (n instanceof Wt) {
        let i = n.name,
          a = t.getVariableValue(i);
        if (a instanceof dn) {
          if (r < 0 || r >= a.mipLevelCount)
            return (
              console.error(
                `Invalid mip level for textureDimensions. Line ${e.line}`,
              ),
              null
            );
          let t = a.getMipLevelSize(r),
            n = a.dimension;
          return n === `1d`
            ? new W(t[0], this.getTypeInfo(`u32`))
            : n === `3d`
              ? new G(t, this.getTypeInfo(`vec3u`))
              : n === `2d`
                ? new G(t.slice(0, 2), this.getTypeInfo(`vec2u`))
                : (console.error(
                    `Invalid texture dimension ${n} not found. Line ${e.line}`,
                  ),
                  null);
        }
        return console.error(`Texture ${i} not found. Line ${e.line}`), null;
      }
      return (
        console.error(
          `Invalid texture argument for textureDimensions. Line ${e.line}`,
        ),
        null
      );
    }
    TextureGather(e, t) {
      return console.error(`TODO: textureGather`), null;
    }
    TextureGatherCompare(e, t) {
      return console.error(`TODO: textureGatherCompare`), null;
    }
    TextureLoad(e, t) {
      let n = e.args[0],
        r = this.exec.evalExpression(e.args[1], t),
        i =
          e.args.length > 2 ? this.exec.evalExpression(e.args[2], t).value : 0;
      if (!(r instanceof G) || r.data.length !== 2)
        return (
          console.error(`Invalid UV argument for textureLoad. Line ${e.line}`),
          null
        );
      if (n instanceof Wt) {
        let a = n.name,
          o = t.getVariableValue(a);
        if (o instanceof dn) {
          let t = Math.floor(r.data[0]),
            n = Math.floor(r.data[1]);
          if (t < 0 || t >= o.width || n < 0 || n >= o.height)
            return (
              console.error(`Texture ${a} out of bounds. Line ${e.line}`), null
            );
          let s = o.getPixel(t, n, 0, i);
          return s === null
            ? (console.error(
                `Invalid texture format for textureLoad. Line ${e.line}`,
              ),
              null)
            : new G(s, this.getTypeInfo(`vec4f`));
        }
        return console.error(`Texture ${a} not found. Line ${e.line}`), null;
      }
      return (
        console.error(
          `Invalid texture argument for textureLoad. Line ${e.line}`,
        ),
        null
      );
    }
    TextureNumLayers(e, t) {
      let n = e.args[0];
      if (n instanceof Wt) {
        let r = n.name,
          i = t.getVariableValue(r);
        return i instanceof dn
          ? new W(i.depthOrArrayLayers, this.getTypeInfo(`u32`))
          : (console.error(`Texture ${r} not found. Line ${e.line}`), null);
      }
      return (
        console.error(
          `Invalid texture argument for textureNumLayers. Line ${e.line}`,
        ),
        null
      );
    }
    TextureNumLevels(e, t) {
      let n = e.args[0];
      if (n instanceof Wt) {
        let r = n.name,
          i = t.getVariableValue(r);
        return i instanceof dn
          ? new W(i.mipLevelCount, this.getTypeInfo(`u32`))
          : (console.error(`Texture ${r} not found. Line ${e.line}`), null);
      }
      return (
        console.error(
          `Invalid texture argument for textureNumLevels. Line ${e.line}`,
        ),
        null
      );
    }
    TextureNumSamples(e, t) {
      let n = e.args[0];
      if (n instanceof Wt) {
        let r = n.name,
          i = t.getVariableValue(r);
        return i instanceof dn
          ? new W(i.sampleCount, this.getTypeInfo(`u32`))
          : (console.error(`Texture ${r} not found. Line ${e.line}`), null);
      }
      return (
        console.error(
          `Invalid texture argument for textureNumSamples. Line ${e.line}`,
        ),
        null
      );
    }
    TextureSample(e, t) {
      return console.error(`TODO: textureSample`), null;
    }
    TextureSampleBias(e, t) {
      return console.error(`TODO: textureSampleBias`), null;
    }
    TextureSampleCompare(e, t) {
      return console.error(`TODO: textureSampleCompare`), null;
    }
    TextureSampleCompareLevel(e, t) {
      return console.error(`TODO: textureSampleCompareLevel`), null;
    }
    TextureSampleGrad(e, t) {
      return console.error(`TODO: textureSampleGrad`), null;
    }
    TextureSampleLevel(e, t) {
      return console.error(`TODO: textureSampleLevel`), null;
    }
    TextureSampleBaseClampToEdge(e, t) {
      return console.error(`TODO: textureSampleBaseClampToEdge`), null;
    }
    TextureStore(e, t) {
      let n = e.args[0],
        r = this.exec.evalExpression(e.args[1], t),
        i =
          e.args.length === 4
            ? this.exec.evalExpression(e.args[2], t).value
            : 0,
        a =
          e.args.length === 4
            ? this.exec.evalExpression(e.args[3], t).data
            : this.exec.evalExpression(e.args[2], t).data;
      if (a.length !== 4)
        return (
          console.error(
            `Invalid value argument for textureStore. Line ${e.line}`,
          ),
          null
        );
      if (!(r instanceof G) || r.data.length !== 2)
        return (
          console.error(`Invalid UV argument for textureStore. Line ${e.line}`),
          null
        );
      if (n instanceof Wt) {
        let o = n.name,
          s = t.getVariableValue(o);
        if (s instanceof dn) {
          let t = s.getMipLevelSize(0),
            n = Math.floor(r.data[0]),
            c = Math.floor(r.data[1]);
          return n < 0 || n >= t[0] || c < 0 || c >= t[1]
            ? (console.error(`Texture ${o} out of bounds. Line ${e.line}`),
              null)
            : (s.setPixel(n, c, 0, i, Array.from(a)), null);
        }
        return console.error(`Texture ${o} not found. Line ${e.line}`), null;
      }
      return (
        console.error(
          `Invalid texture argument for textureStore. Line ${e.line}`,
        ),
        null
      );
    }
    AtomicLoad(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t);
      return t.getVariable(r).value.getSubData(this.exec, n.postfix, t);
    }
    AtomicStore(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t);
      return (
        s instanceof W && o instanceof W && (s.value = o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        null
      );
    }
    AtomicAdd(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W && o instanceof W && (s.value += o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicSub(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W && o instanceof W && (s.value -= o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicMax(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W &&
          o instanceof W &&
          (s.value = Math.max(s.value, o.value)),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicMin(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W &&
          o instanceof W &&
          (s.value = Math.min(s.value, o.value)),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicAnd(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W && o instanceof W && (s.value &= o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicOr(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W && o instanceof W && (s.value |= o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicXor(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W && o instanceof W && (s.value ^= o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicExchange(e, t) {
      let n = e.args[0];
      n instanceof U && (n = n.right);
      let r = this.exec.getVariableName(n, t),
        i = t.getVariable(r),
        a = e.args[1],
        o = this.exec.evalExpression(a, t),
        s = i.value.getSubData(this.exec, n.postfix, t),
        c = new W(s.value, s.typeInfo);
      return (
        s instanceof W && o instanceof W && (s.value = o.value),
        i.value instanceof un &&
          i.value.setDataValue(this.exec, s, n.postfix, t),
        c
      );
    }
    AtomicCompareExchangeWeak(e, t) {
      return console.error(`TODO: atomicCompareExchangeWeak`), null;
    }
    Pack4x8snorm(e, t) {
      return console.error(`TODO: pack4x8snorm`), null;
    }
    Pack4x8unorm(e, t) {
      return console.error(`TODO: pack4x8unorm`), null;
    }
    Pack4xI8(e, t) {
      return console.error(`TODO: pack4xI8`), null;
    }
    Pack4xU8(e, t) {
      return console.error(`TODO: pack4xU8`), null;
    }
    Pack4x8Clamp(e, t) {
      return console.error(`TODO: pack4x8Clamp`), null;
    }
    Pack4xU8Clamp(e, t) {
      return console.error(`TODO: pack4xU8Clamp`), null;
    }
    Pack2x16snorm(e, t) {
      return console.error(`TODO: pack2x16snorm`), null;
    }
    Pack2x16unorm(e, t) {
      return console.error(`TODO: pack2x16unorm`), null;
    }
    Pack2x16float(e, t) {
      return console.error(`TODO: pack2x16float`), null;
    }
    Unpack4x8snorm(e, t) {
      return console.error(`TODO: unpack4x8snorm`), null;
    }
    Unpack4x8unorm(e, t) {
      return console.error(`TODO: unpack4x8unorm`), null;
    }
    Unpack4xI8(e, t) {
      return console.error(`TODO: unpack4xI8`), null;
    }
    Unpack4xU8(e, t) {
      return console.error(`TODO: unpack4xU8`), null;
    }
    Unpack2x16snorm(e, t) {
      return console.error(`TODO: unpack2x16snorm`), null;
    }
    Unpack2x16unorm(e, t) {
      return console.error(`TODO: unpack2x16unorm`), null;
    }
    Unpack2x16float(e, t) {
      return console.error(`TODO: unpack2x16float`), null;
    }
    StorageBarrier(e, t) {
      return null;
    }
    TextureBarrier(e, t) {
      return null;
    }
    WorkgroupBarrier(e, t) {
      return null;
    }
    WorkgroupUniformLoad(e, t) {
      return null;
    }
    SubgroupAdd(e, t) {
      return console.error(`TODO: subgroupAdd`), null;
    }
    SubgroupExclusiveAdd(e, t) {
      return console.error(`TODO: subgroupExclusiveAdd`), null;
    }
    SubgroupInclusiveAdd(e, t) {
      return console.error(`TODO: subgroupInclusiveAdd`), null;
    }
    SubgroupAll(e, t) {
      return console.error(`TODO: subgroupAll`), null;
    }
    SubgroupAnd(e, t) {
      return console.error(`TODO: subgroupAnd`), null;
    }
    SubgroupAny(e, t) {
      return console.error(`TODO: subgroupAny`), null;
    }
    SubgroupBallot(e, t) {
      return console.error(`TODO: subgroupBallot`), null;
    }
    SubgroupBroadcast(e, t) {
      return console.error(`TODO: subgroupBroadcast`), null;
    }
    SubgroupBroadcastFirst(e, t) {
      return console.error(`TODO: subgroupBroadcastFirst`), null;
    }
    SubgroupElect(e, t) {
      return console.error(`TODO: subgroupElect`), null;
    }
    SubgroupMax(e, t) {
      return console.error(`TODO: subgroupMax`), null;
    }
    SubgroupMin(e, t) {
      return console.error(`TODO: subgroupMin`), null;
    }
    SubgroupMul(e, t) {
      return console.error(`TODO: subgroupMul`), null;
    }
    SubgroupExclusiveMul(e, t) {
      return console.error(`TODO: subgroupExclusiveMul`), null;
    }
    SubgroupInclusiveMul(e, t) {
      return console.error(`TODO: subgroupInclusiveMul`), null;
    }
    SubgroupOr(e, t) {
      return console.error(`TODO: subgroupOr`), null;
    }
    SubgroupShuffle(e, t) {
      return console.error(`TODO: subgroupShuffle`), null;
    }
    SubgroupShuffleDown(e, t) {
      return console.error(`TODO: subgroupShuffleDown`), null;
    }
    SubgroupShuffleUp(e, t) {
      return console.error(`TODO: subgroupShuffleUp`), null;
    }
    SubgroupShuffleXor(e, t) {
      return console.error(`TODO: subgroupShuffleXor`), null;
    }
    SubgroupXor(e, t) {
      return console.error(`TODO: subgroupXor`), null;
    }
    QuadBroadcast(e, t) {
      return console.error(`TODO: quadBroadcast`), null;
    }
    QuadSwapDiagonal(e, t) {
      return console.error(`TODO: quadSwapDiagonal`), null;
    }
    QuadSwapX(e, t) {
      return console.error(`TODO: quadSwapX`), null;
    }
    QuadSwapY(e, t) {
      return console.error(`TODO: quadSwapY`), null;
    }
  },
  Nn = {
    vec2: 2,
    vec2f: 2,
    vec2i: 2,
    vec2u: 2,
    vec2b: 2,
    vec2h: 2,
    vec3: 3,
    vec3f: 3,
    vec3i: 3,
    vec3u: 3,
    vec3b: 3,
    vec3h: 3,
    vec4: 4,
    vec4f: 4,
    vec4i: 4,
    vec4u: 4,
    vec4b: 4,
    vec4h: 4,
  },
  Pn = {
    mat2x2: [2, 2, 4],
    mat2x2f: [2, 2, 4],
    mat2x2h: [2, 2, 4],
    mat2x3: [2, 3, 6],
    mat2x3f: [2, 3, 6],
    mat2x3h: [2, 3, 6],
    mat2x4: [2, 4, 8],
    mat2x4f: [2, 4, 8],
    mat2x4h: [2, 4, 8],
    mat3x2: [3, 2, 6],
    mat3x2f: [3, 2, 6],
    mat3x2h: [3, 2, 6],
    mat3x3: [3, 3, 9],
    mat3x3f: [3, 3, 9],
    mat3x3h: [3, 3, 9],
    mat3x4: [3, 4, 12],
    mat3x4f: [3, 4, 12],
    mat3x4h: [3, 4, 12],
    mat4x2: [4, 2, 8],
    mat4x2f: [4, 2, 8],
    mat4x2h: [4, 2, 8],
    mat4x3: [4, 3, 12],
    mat4x3f: [4, 3, 12],
    mat4x3h: [4, 3, 12],
    mat4x4: [4, 4, 16],
    mat4x4f: [4, 4, 16],
    mat4x4h: [4, 4, 16],
  },
  Fn = class e extends jn {
    constructor(e, t) {
      super(),
        (this.ast = e ?? []),
        (this.reflection = new En()),
        this.reflection.updateAST(this.ast),
        (this.context = t?.clone() ?? new An()),
        (this.builtins = new Mn(this)),
        (this.typeInfo = {
          bool: this.getTypeInfo(V.bool),
          i32: this.getTypeInfo(V.i32),
          u32: this.getTypeInfo(V.u32),
          f32: this.getTypeInfo(V.f32),
          f16: this.getTypeInfo(V.f16),
          vec2f: this.getTypeInfo(H.vec2f),
          vec2u: this.getTypeInfo(H.vec2u),
          vec2i: this.getTypeInfo(H.vec2i),
          vec2h: this.getTypeInfo(H.vec2h),
          vec3f: this.getTypeInfo(H.vec3f),
          vec3u: this.getTypeInfo(H.vec3u),
          vec3i: this.getTypeInfo(H.vec3i),
          vec3h: this.getTypeInfo(H.vec3h),
          vec4f: this.getTypeInfo(H.vec4f),
          vec4u: this.getTypeInfo(H.vec4u),
          vec4i: this.getTypeInfo(H.vec4i),
          vec4h: this.getTypeInfo(H.vec4h),
          mat2x2f: this.getTypeInfo(H.mat2x2f),
          mat2x3f: this.getTypeInfo(H.mat2x3f),
          mat2x4f: this.getTypeInfo(H.mat2x4f),
          mat3x2f: this.getTypeInfo(H.mat3x2f),
          mat3x3f: this.getTypeInfo(H.mat3x3f),
          mat3x4f: this.getTypeInfo(H.mat3x4f),
          mat4x2f: this.getTypeInfo(H.mat4x2f),
          mat4x3f: this.getTypeInfo(H.mat4x3f),
          mat4x4f: this.getTypeInfo(H.mat4x4f),
        });
    }
    getVariableValue(e) {
      let t = this.context.getVariable(e)?.value ?? null;
      if (t === null) return null;
      if (t instanceof W) return t.value;
      if (t instanceof G || t instanceof K) return Array.from(t.data);
      if (t instanceof un && t.typeInfo instanceof ze) {
        if (t.typeInfo.format.name === `u32`)
          return Array.from(
            new Uint32Array(t.buffer, t.offset, t.typeInfo.count),
          );
        if (t.typeInfo.format.name === `i32`)
          return Array.from(
            new Int32Array(t.buffer, t.offset, t.typeInfo.count),
          );
        if (t.typeInfo.format.name === `f32`)
          return Array.from(
            new Float32Array(t.buffer, t.offset, t.typeInfo.count),
          );
      }
      return (
        console.error(`Unsupported return variable type ${t.typeInfo.name}`),
        null
      );
    }
    execute(e) {
      (e ??= {}).constants && this._setOverrides(e.constants, this.context),
        this._execStatements(this.ast, this.context);
    }
    dispatchWorkgroups(e, t, n, r) {
      let i = this.context.clone();
      (r ??= {}).constants && this._setOverrides(r.constants, i),
        this._execStatements(this.ast, i);
      let a = i.getFunction(e);
      if (!a) return void console.error(`Function ${e} not found`);
      if (typeof t == `number`) t = [t, 1, 1];
      else {
        if (t.length === 0) return void console.error(`Invalid dispatch count`);
        t.length === 1
          ? (t = [t[0], 1, 1])
          : t.length === 2
            ? (t = [t[0], t[1], 1])
            : t.length > 3 && (t = [t[0], t[1], t[2]]);
      }
      let o = t[0],
        s = t[1],
        c = t[2],
        l = this.getTypeInfo(`vec3u`);
      i.setVariable(`@num_workgroups`, new G(t, l));
      for (let e in n)
        for (let t in n[e]) {
          let r = n[e][t];
          i.variables.forEach((n) => {
            let i = n.node;
            if (i?.attributes) {
              let a = null,
                o = null;
              for (let e of i.attributes)
                e.name === `binding`
                  ? (a = e.value)
                  : e.name === `group` && (o = e.value);
              t == a &&
                e == o &&
                (n.value =
                  r.texture !== void 0 && r.descriptor !== void 0
                    ? new dn(
                        r.texture,
                        this.getTypeInfo(i.type),
                        r.descriptor,
                        r.texture.view ?? null,
                      )
                    : r.uniform === void 0
                      ? new un(r, this.getTypeInfo(i.type))
                      : new un(r.uniform, this.getTypeInfo(i.type)));
            }
          });
        }
      for (let e = 0; e < c; ++e)
        for (let t = 0; t < s; ++t)
          for (let n = 0; n < o; ++n)
            i.setVariable(
              `@workgroup_id`,
              new G([n, t, e], this.getTypeInfo(`vec3u`)),
            ),
              this._dispatchWorkgroup(a, [n, t, e], i);
    }
    execStatement(t, n) {
      if (t instanceof Dt) return this.evalExpression(t.value, n);
      if (t instanceof Nt) {
        if (t.condition) {
          let e = this.evalExpression(t.condition, n);
          if (!(e instanceof W)) throw Error(`Invalid break-if condition`);
          if (!e.value) return null;
        }
        return e._breakObj;
      }
      if (t instanceof Pt) return e._continueObj;
      if (t instanceof _t) this._let(t, n);
      else if (t instanceof ht) this._var(t, n);
      else if (t instanceof vt) this._const(t, n);
      else if (t instanceof ut) this._function(t, n);
      else {
        if (t instanceof Et) return this._if(t, n);
        if (t instanceof Tt) return this._switch(t, n);
        if (t instanceof mt) return this._for(t, n);
        if (t instanceof ft) return this._while(t, n);
        if (t instanceof wt) return this._loop(t, n);
        if (t instanceof pt) {
          let e = n.clone();
          return (
            (e.currentFunctionName = n.currentFunctionName),
            this._execStatements(t.body, e)
          );
        }
        if (t instanceof St) this._assign(t, n);
        else if (t instanceof xt) this._increment(t, n);
        else {
          if (t instanceof It) return null;
          if (t instanceof gt) {
            let e = t.name;
            n.getVariable(e) === null &&
              n.setVariable(e, new W(0, this.getTypeInfo(`u32`)));
          } else if (t instanceof Ct) this._call(t, n);
          else {
            if (t instanceof At || t instanceof jt) return null;
            console.error(`Invalid statement type.`, t, `Line ${t.line}`);
          }
        }
      }
      return null;
    }
    evalExpression(e, t) {
      return e instanceof Xt
        ? this._evalBinaryOp(e, t)
        : e instanceof Kt
          ? this._evalLiteral(e, t)
          : e instanceof Wt
            ? this._evalVariable(e, t)
            : e instanceof Ut
              ? this._evalCall(e, t)
              : e instanceof Ht
                ? this._evalCreate(e, t)
                : e instanceof Gt
                  ? this._evalConst(e, t)
                  : e instanceof qt
                    ? this._evalBitcast(e, t)
                    : e instanceof U
                      ? this._evalUnaryOp(e, t)
                      : (console.error(
                          `Invalid expression type`,
                          e,
                          `Line ${e.line}`,
                        ),
                        null);
    }
    getTypeInfo(e) {
      if (e instanceof V) {
        let t = this.reflection.getTypeInfo(e);
        if (t !== null) return t;
      }
      let t = this.typeInfo[e] ?? null;
      return t !== null || (t = this.reflection.getTypeInfoByName(e)), t;
    }
    _setOverrides(e, t) {
      for (let n in e) {
        let r = e[n],
          i = this.reflection.getOverrideInfo(n);
        i === null
          ? console.error(`Override ${n} does not exist in the shader.`)
          : (i.type === null && (i.type = this.getTypeInfo(`u32`)),
            i.type.name === `u32` ||
            i.type.name === `i32` ||
            i.type.name === `f32` ||
            i.type.name === `f16`
              ? t.setVariable(n, new W(r, i.type))
              : i.type.name === `bool`
                ? t.setVariable(n, new W(+!!r, i.type))
                : i.type.name === `vec2` ||
                    i.type.name === `vec3` ||
                    i.type.name === `vec4` ||
                    i.type.name === `vec2f` ||
                    i.type.name === `vec3f` ||
                    i.type.name === `vec4f` ||
                    i.type.name === `vec2i` ||
                    i.type.name === `vec3i` ||
                    i.type.name === `vec4i` ||
                    i.type.name === `vec2u` ||
                    i.type.name === `vec3u` ||
                    i.type.name === `vec4u` ||
                    i.type.name === `vec2h` ||
                    i.type.name === `vec3h` ||
                    i.type.name === `vec4h`
                  ? t.setVariable(n, new G(r, i.type))
                  : console.error(`Invalid constant type for ${n}`));
      }
    }
    _dispatchWorkgroup(e, t, n) {
      let r = [1, 1, 1];
      for (let t of e.node.attributes)
        if (t.name === `workgroup_size`) {
          if (t.value.length > 0) {
            let e = n.getVariableValue(t.value[0]);
            r[0] = e instanceof W ? e.value : parseInt(t.value[0]);
          }
          if (t.value.length > 1) {
            let e = n.getVariableValue(t.value[1]);
            r[1] = e instanceof W ? e.value : parseInt(t.value[1]);
          }
          if (t.value.length > 2) {
            let e = n.getVariableValue(t.value[2]);
            r[2] = e instanceof W ? e.value : parseInt(t.value[2]);
          }
        }
      let i = this.getTypeInfo(`vec3u`),
        a = this.getTypeInfo(`u32`);
      n.setVariable(`@workgroup_size`, new G(r, i));
      let o = r[0],
        s = r[1],
        c = r[2];
      for (let l = 0, u = 0; l < c; ++l)
        for (let c = 0; c < s; ++c)
          for (let s = 0; s < o; ++s, ++u) {
            let o = [s, c, l],
              d = [s + t[0] * r[0], c + t[1] * r[1], l + t[2] * r[2]];
            n.setVariable(`@local_invocation_id`, new G(o, i)),
              n.setVariable(`@global_invocation_id`, new G(d, i)),
              n.setVariable(`@local_invocation_index`, new W(u, a)),
              this._dispatchExec(e, n);
          }
    }
    _dispatchExec(e, t) {
      for (let n of e.node.args)
        for (let e of n.attributes)
          if (e.name === `builtin`) {
            let r = `@${e.value}`,
              i = t.getVariable(r);
            i !== void 0 && t.variables.set(n.name, i);
          }
      this._execStatements(e.node.body, t);
    }
    getVariableName(e, t) {
      for (; e instanceof U; ) e = e.right;
      return e instanceof Wt
        ? e.name
        : (console.error(`Unknown variable type`, e, `Line`, e.line), null);
    }
    _execStatements(e, t) {
      for (let n of e) {
        if (n instanceof Array) {
          let e = t.clone(),
            r = this._execStatements(n, e);
          if (r) return r;
          continue;
        }
        let e = this.execStatement(n, t);
        if (e) return e;
      }
      return null;
    }
    _call(e, t) {
      let n = t.clone();
      n.currentFunctionName = e.name;
      let r = t.getFunction(e.name);
      if (r) {
        for (let t = 0; t < r.node.args.length; ++t) {
          let i = r.node.args[t],
            a = this.evalExpression(e.args[t], n);
          n.setVariable(i.name, a, i);
        }
        this._execStatements(r.node.body, n);
      } else
        e.isBuiltin
          ? this._callBuiltinFunction(e, n)
          : this.getTypeInfo(e.name) && this._evalCreate(e, t);
    }
    _increment(e, t) {
      let n = this.getVariableName(e.variable, t),
        r = t.getVariable(n);
      r
        ? e.operator === `++`
          ? r.value instanceof W
            ? r.value.value++
            : console.error(`Variable ${n} is not a scalar. Line ${e.line}`)
          : e.operator === `--`
            ? r.value instanceof W
              ? r.value.value--
              : console.error(`Variable ${n} is not a scalar. Line ${e.line}`)
            : console.error(
                `Unknown increment operator ${e.operator}. Line ${e.line}`,
              )
        : console.error(`Variable ${n} not found. Line ${e.line}`);
    }
    _getVariableData(e, t) {
      if (e instanceof Wt) {
        let n = this.getVariableName(e, t),
          r = t.getVariable(n);
        return r === null
          ? (console.error(`Variable ${n} not found. Line ${e.line}`), null)
          : r.value.getSubData(this, e.postfix, t);
      }
      if (e instanceof U) {
        if (e.operator === `*`) {
          let n = this._getVariableData(e.right, t);
          return n instanceof cn
            ? n.reference.getSubData(this, e.postfix, t)
            : (console.error(
                `Variable ${e.right} is not a pointer. Line ${e.line}`,
              ),
              null);
        }
        if (e.operator === `&`)
          return new cn(this._getVariableData(e.right, t));
      }
      return null;
    }
    _assign(e, t) {
      let n = null,
        r = `<var>`,
        i = null;
      if (e.variable instanceof U) {
        let n = this._getVariableData(e.variable, t),
          r = this.evalExpression(e.value, t),
          i = e.operator;
        if (i === `=`) {
          if (n instanceof W || n instanceof G || n instanceof K) {
            if (
              r instanceof W ||
              r instanceof G ||
              (r instanceof K && n.data.length === r.data.length)
            )
              return void n.data.set(r.data);
            console.error(`Invalid assignment. Line ${e.line}`);
          } else if (
            n instanceof un &&
            r instanceof un &&
            n.buffer.byteLength - n.offset >= r.buffer.byteLength - r.offset
          )
            return void (n.buffer.byteLength % 4 == 0
              ? new Uint32Array(n.buffer, n.offset, n.typeInfo.size / 4).set(
                  new Uint32Array(r.buffer, r.offset, r.typeInfo.size / 4),
                )
              : new Uint8Array(n.buffer, n.offset, n.typeInfo.size).set(
                  new Uint8Array(r.buffer, r.offset, r.typeInfo.size),
                ));
          return console.error(`Invalid assignment. Line ${e.line}`), null;
        }
        if (i === `+=`)
          return n instanceof W || n instanceof G || n instanceof K
            ? r instanceof W || r instanceof G || r instanceof K
              ? void n.data.set(r.data.map((e, t) => n.data[t] + e))
              : void console.error(`Invalid assignment . Line ${e.line}`)
            : void console.error(`Invalid assignment. Line ${e.line}`);
        if (i === `-=`)
          return (n instanceof W || n instanceof G || n instanceof K) &&
            (r instanceof W || r instanceof G || r instanceof K)
            ? void n.data.set(r.data.map((e, t) => n.data[t] - e))
            : void console.error(`Invalid assignment. Line ${e.line}`);
      }
      if (e.variable instanceof U) {
        if (e.variable.operator === `*`) {
          r = this.getVariableName(e.variable.right, t);
          let i = t.getVariable(r);
          if (!(i && i.value instanceof cn))
            return void console.error(
              `Variable ${r} is not a pointer. Line ${e.line}`,
            );
          n = i.value.reference;
          let a = e.variable.postfix;
          if (!a) {
            let t = e.variable.right;
            for (; t instanceof U; ) {
              if (t.postfix) {
                a = t.postfix;
                break;
              }
              t = t.right;
            }
          }
          a && (n = n.getSubData(this, a, t));
        }
      } else {
        (i = e.variable.postfix), (r = this.getVariableName(e.variable, t));
        let a = t.getVariable(r);
        if (a === null)
          return void console.error(`Variable ${r} not found. Line ${e.line}`);
        n = a.value;
      }
      if ((n instanceof cn && (n = n.reference), n === null))
        return void console.error(`Variable ${r} not found. Line ${e.line}`);
      let a = this.evalExpression(e.value, t),
        o = e.operator;
      if (o === `=`) {
        if (n instanceof un) n.setDataValue(this, a, i, t);
        else if (i) {
          if (!(n instanceof G || n instanceof K))
            return void console.error(
              `Variable ${r} is not a vector or matrix. Line ${e.line}`,
            );
          if (i instanceof Jt) {
            let o = this.evalExpression(i.index, t).value;
            if (n instanceof G) {
              if (!(a instanceof W))
                return void console.error(
                  `Invalid assignment to ${r}. Line ${e.line}`,
                );
              n.data[o] = a.value;
            } else {
              if (!(n instanceof K))
                return void console.error(
                  `Invalid assignment to ${r}. Line ${e.line}`,
                );
              {
                let o = this.evalExpression(i.index, t).value;
                if (o < 0 || !(a instanceof G))
                  return void console.error(
                    `Invalid assignment to ${r}. Line ${e.line}`,
                  );
                {
                  let t = n.typeInfo.getTypeName();
                  if (t === `mat2x2` || t === `mat2x2f` || t === `mat2x2h`) {
                    if (!(o < 2 && a.data.length === 2))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[2 * o] = a.data[0]),
                      (n.data[2 * o + 1] = a.data[1]);
                  } else if (
                    t === `mat2x3` ||
                    t === `mat2x3f` ||
                    t === `mat2x3h`
                  ) {
                    if (!(o < 2 && a.data.length === 3))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[3 * o] = a.data[0]),
                      (n.data[3 * o + 1] = a.data[1]),
                      (n.data[3 * o + 2] = a.data[2]);
                  } else if (
                    t === `mat2x4` ||
                    t === `mat2x4f` ||
                    t === `mat2x4h`
                  ) {
                    if (!(o < 2 && a.data.length === 4))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[4 * o] = a.data[0]),
                      (n.data[4 * o + 1] = a.data[1]),
                      (n.data[4 * o + 2] = a.data[2]),
                      (n.data[4 * o + 3] = a.data[3]);
                  } else if (
                    t === `mat3x2` ||
                    t === `mat3x2f` ||
                    t === `mat3x2h`
                  ) {
                    if (!(o < 3 && a.data.length === 2))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[2 * o] = a.data[0]),
                      (n.data[2 * o + 1] = a.data[1]);
                  } else if (
                    t === `mat3x3` ||
                    t === `mat3x3f` ||
                    t === `mat3x3h`
                  ) {
                    if (!(o < 3 && a.data.length === 3))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[3 * o] = a.data[0]),
                      (n.data[3 * o + 1] = a.data[1]),
                      (n.data[3 * o + 2] = a.data[2]);
                  } else if (
                    t === `mat3x4` ||
                    t === `mat3x4f` ||
                    t === `mat3x4h`
                  ) {
                    if (!(o < 3 && a.data.length === 4))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[4 * o] = a.data[0]),
                      (n.data[4 * o + 1] = a.data[1]),
                      (n.data[4 * o + 2] = a.data[2]),
                      (n.data[4 * o + 3] = a.data[3]);
                  } else if (
                    t === `mat4x2` ||
                    t === `mat4x2f` ||
                    t === `mat4x2h`
                  ) {
                    if (!(o < 4 && a.data.length === 2))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[2 * o] = a.data[0]),
                      (n.data[2 * o + 1] = a.data[1]);
                  } else if (
                    t === `mat4x3` ||
                    t === `mat4x3f` ||
                    t === `mat4x3h`
                  ) {
                    if (!(o < 4 && a.data.length === 3))
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[3 * o] = a.data[0]),
                      (n.data[3 * o + 1] = a.data[1]),
                      (n.data[3 * o + 2] = a.data[2]);
                  } else {
                    if (
                      (t !== `mat4x4` && t !== `mat4x4f` && t !== `mat4x4h`) ||
                      !(o < 4 && a.data.length === 4)
                    )
                      return void console.error(
                        `Invalid assignment to ${r}. Line ${e.line}`,
                      );
                    (n.data[4 * o] = a.data[0]),
                      (n.data[4 * o + 1] = a.data[1]),
                      (n.data[4 * o + 2] = a.data[2]),
                      (n.data[4 * o + 3] = a.data[3]);
                  }
                }
              }
            }
          } else if (i instanceof Vt) {
            let t = i.value;
            if (!(n instanceof G))
              return void console.error(
                `Invalid assignment to ${t}. Variable ${r} is not a vector. Line ${e.line}`,
              );
            if (a instanceof W) {
              if (t.length > 1)
                return void console.error(
                  `Invalid assignment to ${t} for variable ${r}. Line ${e.line}`,
                );
              if (t === `x`) n.data[0] = a.value;
              else if (t === `y`) {
                if (n.data.length < 2)
                  return void console.error(
                    `Invalid assignment to ${t} for variable ${r}. Line ${e.line}`,
                  );
                n.data[1] = a.value;
              } else if (t === `z`) {
                if (n.data.length < 3)
                  return void console.error(
                    `Invalid assignment to ${t} for variable ${r}. Line ${e.line}`,
                  );
                n.data[2] = a.value;
              } else if (t === `w`) {
                if (n.data.length < 4)
                  return void console.error(
                    `Invalid assignment to ${t} for variable ${r}. Line ${e.line}`,
                  );
                n.data[3] = a.value;
              }
            } else {
              if (!(a instanceof G))
                return void console.error(
                  `Invalid assignment to ${r}. Line ${e.line}`,
                );
              if (t.length !== a.data.length)
                return void console.error(
                  `Invalid assignment to ${t} for variable ${r}. Line ${e.line}`,
                );
              for (let i = 0; i < t.length; ++i) {
                let o = t[i];
                if (o === `x` || o === `r`) n.data[0] = a.data[i];
                else if (o === `y` || o === `g`) {
                  if (a.data.length < 2)
                    return void console.error(
                      `Invalid assignment to ${o} for variable ${r}. Line ${e.line}`,
                    );
                  n.data[1] = a.data[i];
                } else if (o === `z` || o === `b`) {
                  if (a.data.length < 3)
                    return void console.error(
                      `Invalid assignment to ${o} for variable ${r}. Line ${e.line}`,
                    );
                  n.data[2] = a.data[i];
                } else {
                  if ((o !== `w` && o !== `a`) || a.data.length < 4)
                    return void console.error(
                      `Invalid assignment to ${o} for variable ${r}. Line ${e.line}`,
                    );
                  n.data[3] = a.data[i];
                }
              }
            }
          }
        } else
          n instanceof W && a instanceof W
            ? (n.value = a.value)
            : (n instanceof G && a instanceof G) ||
                (n instanceof K && a instanceof K)
              ? n.data.set(a.data)
              : console.error(`Invalid assignment to ${r}. Line ${e.line}`);
      } else {
        let r = n.getSubData(this, i, t);
        if (r instanceof G && a instanceof W) {
          let t = r.data,
            n = a.value;
          if (o === `+=`) for (let e = 0; e < t.length; ++e) t[e] += n;
          else if (o === `-=`) for (let e = 0; e < t.length; ++e) t[e] -= n;
          else if (o === `*=`) for (let e = 0; e < t.length; ++e) t[e] *= n;
          else if (o === `/=`) for (let e = 0; e < t.length; ++e) t[e] /= n;
          else if (o === `%=`) for (let e = 0; e < t.length; ++e) t[e] %= n;
          else if (o === `&=`) for (let e = 0; e < t.length; ++e) t[e] &= n;
          else if (o === `|=`) for (let e = 0; e < t.length; ++e) t[e] |= n;
          else if (o === `^=`) for (let e = 0; e < t.length; ++e) t[e] ^= n;
          else if (o === `<<=`) for (let e = 0; e < t.length; ++e) t[e] <<= n;
          else if (o === `>>=`) for (let e = 0; e < t.length; ++e) t[e] >>= n;
          else console.error(`Invalid operator ${o}. Line ${e.line}`);
        } else if (r instanceof G && a instanceof G) {
          let t = r.data,
            n = a.data;
          if (t.length !== n.length)
            return void console.error(`Vector length mismatch. Line ${e.line}`);
          if (o === `+=`) for (let e = 0; e < t.length; ++e) t[e] += n[e];
          else if (o === `-=`) for (let e = 0; e < t.length; ++e) t[e] -= n[e];
          else if (o === `*=`) for (let e = 0; e < t.length; ++e) t[e] *= n[e];
          else if (o === `/=`) for (let e = 0; e < t.length; ++e) t[e] /= n[e];
          else if (o === `%=`) for (let e = 0; e < t.length; ++e) t[e] %= n[e];
          else if (o === `&=`) for (let e = 0; e < t.length; ++e) t[e] &= n[e];
          else if (o === `|=`) for (let e = 0; e < t.length; ++e) t[e] |= n[e];
          else if (o === `^=`) for (let e = 0; e < t.length; ++e) t[e] ^= n[e];
          else if (o === `<<=`)
            for (let e = 0; e < t.length; ++e) t[e] <<= n[e];
          else if (o === `>>=`)
            for (let e = 0; e < t.length; ++e) t[e] >>= n[e];
          else console.error(`Invalid operator ${o}. Line ${e.line}`);
        } else {
          if (!(r instanceof W && a instanceof W))
            return void console.error(
              `Invalid type for ${e.operator} operator. Line ${e.line}`,
            );
          o === `+=`
            ? (r.value += a.value)
            : o === `-=`
              ? (r.value -= a.value)
              : o === `*=`
                ? (r.value *= a.value)
                : o === `/=`
                  ? (r.value /= a.value)
                  : o === `%=`
                    ? (r.value %= a.value)
                    : o === `&=`
                      ? (r.value &= a.value)
                      : o === `|=`
                        ? (r.value |= a.value)
                        : o === `^=`
                          ? (r.value ^= a.value)
                          : o === `<<=`
                            ? (r.value <<= a.value)
                            : o === `>>=`
                              ? (r.value >>= a.value)
                              : console.error(
                                  `Invalid operator ${o}. Line ${e.line}`,
                                );
        }
        n instanceof un && n.setDataValue(this, r, i, t);
      }
    }
    _function(e, t) {
      let n = new kn(e);
      t.functions.set(e.name, n);
    }
    _const(e, t) {
      let n = null;
      e.value !== null && (n = this.evalExpression(e.value, t)),
        t.createVariable(e.name, n, e);
    }
    _let(e, t) {
      let n = null;
      if (e.value !== null) {
        if (((n = this.evalExpression(e.value, t)), n === null))
          return void console.error(
            `Invalid value for variable ${e.name}. Line ${e.line}`,
          );
        e.value instanceof U || (n = n.clone());
      } else {
        let r = e.type.name;
        if (
          r === `f32` ||
          r === `i32` ||
          r === `u32` ||
          r === `bool` ||
          r === `f16` ||
          r === `vec2` ||
          r === `vec3` ||
          r === `vec4` ||
          r === `vec2f` ||
          r === `vec3f` ||
          r === `vec4f` ||
          r === `vec2i` ||
          r === `vec3i` ||
          r === `vec4i` ||
          r === `vec2u` ||
          r === `vec3u` ||
          r === `vec4u` ||
          r === `vec2h` ||
          r === `vec3h` ||
          r === `vec4h` ||
          r === `vec2b` ||
          r === `vec3b` ||
          r === `vec4b` ||
          r === `mat2x2` ||
          r === `mat2x3` ||
          r === `mat2x4` ||
          r === `mat3x2` ||
          r === `mat3x3` ||
          r === `mat3x4` ||
          r === `mat4x2` ||
          r === `mat4x3` ||
          r === `mat4x4` ||
          r === `mat2x2f` ||
          r === `mat2x3f` ||
          r === `mat2x4f` ||
          r === `mat3x2f` ||
          r === `mat3x3f` ||
          r === `mat3x4f` ||
          r === `mat4x2f` ||
          r === `mat4x3f` ||
          r === `mat4x4f` ||
          r === `mat2x2h` ||
          r === `mat2x3h` ||
          r === `mat2x4h` ||
          r === `mat3x2h` ||
          r === `mat3x3h` ||
          r === `mat3x4h` ||
          r === `mat4x2h` ||
          r === `mat4x3h` ||
          r === `mat4x4h` ||
          r === `array`
        ) {
          let r = new Ht(e.type, []);
          n = this._evalCreate(r, t);
        }
      }
      t.createVariable(e.name, n, e);
    }
    _var(e, t) {
      let n = null;
      if (e.value !== null) {
        if (((n = this.evalExpression(e.value, t)), n === null))
          return void console.error(
            `Invalid value for variable ${e.name}. Line ${e.line}`,
          );
        e.value instanceof U || (n = n.clone());
      } else {
        if (e.type === null)
          return void console.error(
            `Variable ${e.name} has no type. Line ${e.line}`,
          );
        let r = e.type.name;
        if (
          r === `f32` ||
          r === `i32` ||
          r === `u32` ||
          r === `bool` ||
          r === `f16` ||
          r === `vec2` ||
          r === `vec3` ||
          r === `vec4` ||
          r === `vec2f` ||
          r === `vec3f` ||
          r === `vec4f` ||
          r === `vec2i` ||
          r === `vec3i` ||
          r === `vec4i` ||
          r === `vec2u` ||
          r === `vec3u` ||
          r === `vec4u` ||
          r === `vec2h` ||
          r === `vec3h` ||
          r === `vec4h` ||
          r === `vec2b` ||
          r === `vec3b` ||
          r === `vec4b` ||
          r === `mat2x2` ||
          r === `mat2x3` ||
          r === `mat2x4` ||
          r === `mat3x2` ||
          r === `mat3x3` ||
          r === `mat3x4` ||
          r === `mat4x2` ||
          r === `mat4x3` ||
          r === `mat4x4` ||
          r === `mat2x2f` ||
          r === `mat2x3f` ||
          r === `mat2x4f` ||
          r === `mat3x2f` ||
          r === `mat3x3f` ||
          r === `mat3x4f` ||
          r === `mat4x2f` ||
          r === `mat4x3f` ||
          r === `mat4x4f` ||
          r === `mat2x2h` ||
          r === `mat2x3h` ||
          r === `mat2x4h` ||
          r === `mat3x2h` ||
          r === `mat3x3h` ||
          r === `mat3x4h` ||
          r === `mat4x2h` ||
          r === `mat4x3h` ||
          r === `mat4x4h` ||
          e.type instanceof Rt ||
          e.type instanceof It ||
          e.type instanceof H
        ) {
          let r = new Ht(e.type, []);
          n = this._evalCreate(r, t);
        }
      }
      t.createVariable(e.name, n, e);
    }
    _switch(e, t) {
      t = t.clone();
      let n = this.evalExpression(e.condition, t);
      if (!(n instanceof W))
        return console.error(`Invalid if condition. Line ${e.line}`), null;
      let r = null;
      for (let i of e.cases)
        if (i instanceof $t)
          for (let a of i.selectors) {
            if (a instanceof Qt) {
              r = i;
              continue;
            }
            let o = this.evalExpression(a, t);
            if (!(o instanceof W))
              return (
                console.error(`Invalid case selector. Line ${e.line}`), null
              );
            if (o.value === n.value) return this._execStatements(i.body, t);
          }
        else i instanceof en && (r = i);
      return r ? this._execStatements(r.body, t) : null;
    }
    _if(e, t) {
      t = t.clone();
      let n = this.evalExpression(e.condition, t);
      if (!(n instanceof W))
        return console.error(`Invalid if condition. Line ${e.line}`), null;
      if (n.value) return this._execStatements(e.body, t);
      for (let n of e.elseif) {
        let r = this.evalExpression(n.condition, t);
        if (!(r instanceof W))
          return console.error(`Invalid if condition. Line ${e.line}`), null;
        if (r.value) return this._execStatements(n.body, t);
      }
      return e.else ? this._execStatements(e.else, t) : null;
    }
    _getScalarValue(e) {
      return e instanceof W
        ? e.value
        : (console.error(`Expected scalar value.`, e), 0);
    }
    _for(t, n) {
      for (
        n = n.clone(), this.execStatement(t.init, n);
        this._getScalarValue(this.evalExpression(t.condition, n));

      ) {
        let r = this._execStatements(t.body, n);
        if (r === e._breakObj) break;
        if (r !== null && r !== e._continueObj) return r;
        this.execStatement(t.increment, n);
      }
      return null;
    }
    _loop(t, n) {
      for (n = n.clone(); ; ) {
        let r = this._execStatements(t.body, n);
        if (r === e._breakObj) break;
        if (r === e._continueObj) {
          if (
            t.continuing &&
            this._execStatements(t.continuing.body, n) === e._breakObj
          )
            break;
        } else if (r !== null) return r;
      }
      return null;
    }
    _while(t, n) {
      for (
        n = n.clone();
        this._getScalarValue(this.evalExpression(t.condition, n));

      ) {
        let r = this._execStatements(t.body, n);
        if (r === e._breakObj) break;
        if (r !== e._continueObj && r !== null) return r;
      }
      return null;
    }
    _evalBitcast(e, t) {
      let n = this.evalExpression(e.value, t),
        r = e.type;
      if (n instanceof W)
        return new W(Cn(n.value, n.typeInfo.name, r.name), this.getTypeInfo(r));
      if (n instanceof G) {
        let t = n.typeInfo.getTypeName(),
          i = ``;
        if (t.endsWith(`f`)) i = `f32`;
        else if (t.endsWith(`i`)) i = `i32`;
        else if (t.endsWith(`u`)) i = `u32`;
        else if (t.endsWith(`b`)) i = `bool`;
        else {
          if (!t.endsWith(`h`))
            return (
              console.error(`Unknown vector type ${t}. Line ${e.line}`), null
            );
          i = `f16`;
        }
        let a = r.getTypeName(),
          o = ``;
        if (a.endsWith(`f`)) o = `f32`;
        else if (a.endsWith(`i`)) o = `i32`;
        else if (a.endsWith(`u`)) o = `u32`;
        else if (a.endsWith(`b`)) o = `bool`;
        else {
          if (!a.endsWith(`h`))
            return (
              console.error(`Unknown vector type ${o}. Line ${e.line}`), null
            );
          o = `f16`;
        }
        return new G(
          (function (e, t, n) {
            if (t === n) return e;
            let r = Array(e.length);
            for (let i = 0; i < e.length; i++) r[i] = Cn(e[i], t, n);
            return r;
          })(Array.from(n.data), i, o),
          this.getTypeInfo(r),
        );
      }
      return (
        console.error(`TODO: bitcast for ${n.typeInfo.name}. Line ${e.line}`),
        null
      );
    }
    _evalConst(e, t) {
      return t.getVariableValue(e.name).clone().getSubData(this, e.postfix, t);
    }
    _evalCreate(e, t) {
      if (e instanceof Ht) {
        if (e.type === null) return sn.void;
        switch (e.type.getTypeName()) {
          case `bool`:
          case `i32`:
          case `u32`:
          case `f32`:
          case `f16`:
            return this._callConstructorValue(e, t);
          case `vec2`:
          case `vec3`:
          case `vec4`:
          case `vec2f`:
          case `vec3f`:
          case `vec4f`:
          case `vec2h`:
          case `vec3h`:
          case `vec4h`:
          case `vec2i`:
          case `vec3i`:
          case `vec4i`:
          case `vec2u`:
          case `vec3u`:
          case `vec4u`:
          case `vec2b`:
          case `vec3b`:
          case `vec4b`:
            return this._callConstructorVec(e, t);
          case `mat2x2`:
          case `mat2x2f`:
          case `mat2x2h`:
          case `mat2x3`:
          case `mat2x3f`:
          case `mat2x3h`:
          case `mat2x4`:
          case `mat2x4f`:
          case `mat2x4h`:
          case `mat3x2`:
          case `mat3x2f`:
          case `mat3x2h`:
          case `mat3x3`:
          case `mat3x3f`:
          case `mat3x3h`:
          case `mat3x4`:
          case `mat3x4f`:
          case `mat3x4h`:
          case `mat4x2`:
          case `mat4x2f`:
          case `mat4x2h`:
          case `mat4x3`:
          case `mat4x3f`:
          case `mat4x3h`:
          case `mat4x4`:
          case `mat4x4f`:
          case `mat4x4h`:
            return this._callConstructorMatrix(e, t);
        }
      }
      let n = e instanceof Ht ? e.type.name : e.name,
        r =
          e instanceof Ht ? this.getTypeInfo(e.type) : this.getTypeInfo(e.name);
      if (r === null)
        return console.error(`Unknown type ${n}. Line ${e.line}`), null;
      if (r.size === 0) return null;
      let i = new un(new ArrayBuffer(r.size), r, 0);
      if (r instanceof Re) {
        if (e.args)
          for (let n = 0; n < e.args.length; ++n) {
            let a = r.members[n],
              o = e.args[n],
              s = this.evalExpression(o, t);
            i.setData(this, s, a.type, a.offset, t);
          }
      } else if (r instanceof ze) {
        let n = 0;
        if (e.args)
          for (let a = 0; a < e.args.length; ++a) {
            let o = e.args[a],
              s = this.evalExpression(o, t);
            r.format === null &&
              (r.format =
                s.typeInfo?.name === `x32`
                  ? this.getTypeInfo(`i32`)
                  : s.typeInfo),
              i.setData(this, s, r.format, n, t),
              (n += r.stride);
          }
      } else console.error(`Unknown type "${n}". Line ${e.line}`);
      return e instanceof Ht ? i.getSubData(this, e.postfix, t) : i;
    }
    _evalLiteral(e, t) {
      let n = this.getTypeInfo(e.type),
        r = n.name;
      return r === `x32` ||
        r === `u32` ||
        r === `f32` ||
        r === `f16` ||
        r === `i32` ||
        r === `bool`
        ? new W(e.scalarValue, n)
        : r === `vec2` ||
            r === `vec3` ||
            r === `vec4` ||
            r === `vec2f` ||
            r === `vec3f` ||
            r === `vec4f` ||
            r === `vec2h` ||
            r === `vec3h` ||
            r === `vec4h` ||
            r === `vec2i` ||
            r === `vec3i` ||
            r === `vec4i` ||
            r === `vec2u` ||
            r === `vec3u` ||
            r === `vec4u`
          ? this._callConstructorVec(e, t)
          : r === `mat2x2` ||
              r === `mat2x3` ||
              r === `mat2x4` ||
              r === `mat3x2` ||
              r === `mat3x3` ||
              r === `mat3x4` ||
              r === `mat4x2` ||
              r === `mat4x3` ||
              r === `mat4x4` ||
              r === `mat2x2f` ||
              r === `mat2x3f` ||
              r === `mat2x4f` ||
              r === `mat3x2f` ||
              r === `mat3x3f` ||
              r === `mat3x4f` ||
              r === `mat4x2f` ||
              r === `mat4x3f` ||
              r === `mat4x4f` ||
              r === `mat2x2h` ||
              r === `mat2x3h` ||
              r === `mat2x4h` ||
              r === `mat3x2h` ||
              r === `mat3x3h` ||
              r === `mat3x4h` ||
              r === `mat4x2h` ||
              r === `mat4x3h` ||
              r === `mat4x4h`
            ? this._callConstructorMatrix(e, t)
            : e.value;
    }
    _evalVariable(e, t) {
      let n = t.getVariableValue(e.name);
      return n === null ? n : n.getSubData(this, e.postfix, t);
    }
    _maxFormatTypeInfo(t) {
      let n = t[0];
      if (n.name === `f32`) return n;
      for (let r = 1; r < t.length; ++r) {
        let i = e._priority.get(n.name);
        e._priority.get(t[r].name) < i && (n = t[r]);
      }
      return n.name === `x32` ? this.getTypeInfo(`i32`) : n;
    }
    _evalUnaryOp(e, t) {
      let n = this.evalExpression(e.right, t);
      if (e.operator === `&`) return new cn(n);
      if (e.operator === `*`)
        return n instanceof cn
          ? n.reference.getSubData(this, e.postfix, t)
          : (console.error(`Invalid dereference. Line ${e.line}`), null);
      let r =
        n instanceof W ? n.value : n instanceof G ? Array.from(n.data) : null;
      switch (e.operator) {
        case `+`: {
          if (Y(r))
            return new G(
              r.map((e, t) => +e),
              n.typeInfo,
            );
          let e = r,
            t = this._maxFormatTypeInfo([n.typeInfo, n.typeInfo]);
          return new W(+e, t);
        }
        case `-`: {
          if (Y(r))
            return new G(
              r.map((e, t) => -e),
              n.typeInfo,
            );
          let e = r,
            t = this._maxFormatTypeInfo([n.typeInfo, n.typeInfo]);
          return new W(-e, t);
        }
        case `!`: {
          if (Y(r))
            return new G(
              r.map((e, t) => +!e),
              n.typeInfo,
            );
          let e = r,
            t = this._maxFormatTypeInfo([n.typeInfo, n.typeInfo]);
          return new W(+!e, t);
        }
        case `~`: {
          if (Y(r))
            return new G(
              r.map((e, t) => ~e),
              n.typeInfo,
            );
          let e = r,
            t = this._maxFormatTypeInfo([n.typeInfo, n.typeInfo]);
          return new W(~e, t);
        }
      }
      return (
        console.error(`Invalid unary operator ${e.operator}. Line ${e.line}`),
        null
      );
    }
    _evalBinaryOp(e, t) {
      let n = this.evalExpression(e.left, t),
        r = this.evalExpression(e.right, t),
        i =
          n instanceof W
            ? n.value
            : n instanceof G || n instanceof K
              ? Array.from(n.data)
              : null,
        a =
          r instanceof W
            ? r.value
            : r instanceof G || r instanceof K
              ? Array.from(r.data)
              : null;
      switch (e.operator) {
        case `+`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e + r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t + e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e + t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t + o, s);
        }
        case `-`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e - r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t - e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e - t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t - o, s);
        }
        case `*`: {
          if (Y(i) && Y(a)) {
            let t = i,
              o = a;
            if (n instanceof K && r instanceof K) {
              let i = (function (e, t, n, r) {
                if (Pn[t.name] === void 0 || Pn[r.name] === void 0) return null;
                let i = Pn[t.name][0],
                  a = Pn[t.name][1],
                  o = Pn[r.name][0];
                if (i !== Pn[r.name][1]) return null;
                let s = Array(o * a);
                for (let t = 0; t < a; t++)
                  for (let r = 0; r < o; r++) {
                    let c = 0;
                    for (let o = 0; o < i; o++)
                      c += e[o * a + t] * n[r * i + o];
                    s[t * o + r] = c;
                  }
                return s;
              })(t, n.typeInfo, o, r.typeInfo);
              if (i === null)
                return (
                  console.error(
                    `Matrix multiplication failed. Line ${e.line}.`,
                  ),
                  null
                );
              let a = Pn[r.typeInfo.name][0],
                s = Pn[n.typeInfo.name][1];
              return new K(i, this.getTypeInfo(`mat${a}x${s}f`));
            }
            if (n instanceof K && r instanceof G) {
              let i = (function (e, t, n, r) {
                if (Pn[t.name] === void 0 || Nn[r.name] === void 0) return null;
                let i = Pn[t.name][0],
                  a = Pn[t.name][1];
                if (i !== n.length) return null;
                let o = Array(a);
                for (let t = 0; t < a; t++) {
                  let r = 0;
                  for (let o = 0; o < i; o++) r += e[o * a + t] * n[o];
                  o[t] = r;
                }
                return o;
              })(t, n.typeInfo, o, r.typeInfo);
              return i === null
                ? (console.error(
                    `Matrix vector multiplication failed. Line ${e.line}.`,
                  ),
                  null)
                : new G(i, r.typeInfo);
            }
            if (n instanceof G && r instanceof K) {
              let i = (function (e, t, n, r) {
                if (Nn[t.name] === void 0 || Pn[r.name] === void 0) return null;
                let i = Pn[r.name][0],
                  a = Pn[r.name][1];
                if (a !== e.length) return null;
                let o = [];
                for (let t = 0; t < i; t++) {
                  let r = 0;
                  for (let o = 0; o < a; o++) r += e[o] * n[o * i + t];
                  o[t] = r;
                }
                return o;
              })(t, n.typeInfo, o, r.typeInfo);
              return i === null
                ? (console.error(
                    `Matrix vector multiplication failed. Line ${e.line}.`,
                  ),
                  null)
                : new G(i, n.typeInfo);
            }
            return t.length === o.length
              ? new G(
                  t.map((e, t) => e * o[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a,
              t = i.map((t, n) => t * e);
            return n instanceof K ? new K(t, n.typeInfo) : new G(t, n.typeInfo);
          }
          if (Y(a)) {
            let e = i,
              t = a.map((t, n) => e * t);
            return r instanceof K ? new K(t, r.typeInfo) : new G(t, r.typeInfo);
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t * o, s);
        }
        case `%`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e % r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t % e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e % t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t % o, s);
        }
        case `/`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e / r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t / e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e / t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t / o, s);
        }
        case `&`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e & r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t & e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e & t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t & o, s);
        }
        case `|`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e | r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t | e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e | t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t | o, s);
        }
        case `^`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e ^ r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t ^ e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e ^ t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t ^ o, s);
        }
        case `<<`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e << r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t << e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e << t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t << o, s);
        }
        case `>>`: {
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => e >> r[t]),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => t >> e),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => e >> t),
              r.typeInfo,
            );
          }
          let t = i,
            o = a,
            s = this._maxFormatTypeInfo([n.typeInfo, r.typeInfo]);
          return new W(t >> o, s);
        }
        case `>`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => +(e > r[t])),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => +(t > e)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => +(e > t)),
              r.typeInfo,
            );
          }
          return new W(+(i > a), this.getTypeInfo(`bool`));
        case `<`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => +(e < r[t])),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => +(t < e)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => +(e < t)),
              r.typeInfo,
            );
          }
          return new W(+(i < a), this.getTypeInfo(`bool`));
        case `==`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => +(e === r[t])),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => +(t == e)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => +(e == t)),
              r.typeInfo,
            );
          }
          return new W(+(i === a), this.getTypeInfo(`bool`));
        case `!=`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => (e === r[t] ? 0 : 1)),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => (t === e ? 0 : 1)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => (e === t ? 0 : 1)),
              r.typeInfo,
            );
          }
          return new W(i === a ? 0 : 1, this.getTypeInfo(`bool`));
        case `>=`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => +(e >= r[t])),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => +(t >= e)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => +(e >= t)),
              r.typeInfo,
            );
          }
          return new W(+(i >= a), this.getTypeInfo(`bool`));
        case `<=`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => +(e <= r[t])),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => +(t <= e)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => +(e <= t)),
              r.typeInfo,
            );
          }
          return new W(+(i <= a), this.getTypeInfo(`bool`));
        case `&&`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => (e && r[t] ? 1 : 0)),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => (t && e ? 1 : 0)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => (e && t ? 1 : 0)),
              r.typeInfo,
            );
          }
          return new W(i && a ? 1 : 0, this.getTypeInfo(`bool`));
        case `||`:
          if (Y(i) && Y(a)) {
            let t = i,
              r = a;
            return t.length === r.length
              ? new G(
                  t.map((e, t) => (e || r[t] ? 1 : 0)),
                  n.typeInfo,
                )
              : (console.error(`Vector length mismatch. Line ${e.line}.`),
                null);
          }
          if (Y(i)) {
            let e = a;
            return new G(
              i.map((t, n) => (t || e ? 1 : 0)),
              n.typeInfo,
            );
          }
          if (Y(a)) {
            let e = i;
            return new G(
              a.map((t, n) => (e || t ? 1 : 0)),
              r.typeInfo,
            );
          }
          return new W(i || a ? 1 : 0, this.getTypeInfo(`bool`));
      }
      return (
        console.error(`Unknown operator ${e.operator}. Line ${e.line}`), null
      );
    }
    _evalCall(e, t) {
      if (e.cachedReturnValue !== null) return e.cachedReturnValue;
      let n = t.clone();
      n.currentFunctionName = e.name;
      let r = t.getFunction(e.name);
      if (!r)
        return e.isBuiltin
          ? this._callBuiltinFunction(e, n)
          : this.getTypeInfo(e.name)
            ? this._evalCreate(e, t)
            : (console.error(`Unknown function "${e.name}". Line ${e.line}`),
              null);
      for (let t = 0; t < r.node.args.length; ++t) {
        let i = r.node.args[t],
          a = this.evalExpression(e.args[t], n);
        n.createVariable(i.name, a, i);
      }
      return this._execStatements(r.node.body, n);
    }
    _callBuiltinFunction(e, t) {
      switch (e.name) {
        case `all`:
          return this.builtins.All(e, t);
        case `any`:
          return this.builtins.Any(e, t);
        case `select`:
          return this.builtins.Select(e, t);
        case `arrayLength`:
          return this.builtins.ArrayLength(e, t);
        case `abs`:
          return this.builtins.Abs(e, t);
        case `acos`:
          return this.builtins.Acos(e, t);
        case `acosh`:
          return this.builtins.Acosh(e, t);
        case `asin`:
          return this.builtins.Asin(e, t);
        case `asinh`:
          return this.builtins.Asinh(e, t);
        case `atan`:
          return this.builtins.Atan(e, t);
        case `atanh`:
          return this.builtins.Atanh(e, t);
        case `atan2`:
          return this.builtins.Atan2(e, t);
        case `ceil`:
          return this.builtins.Ceil(e, t);
        case `clamp`:
          return this.builtins.Clamp(e, t);
        case `cos`:
          return this.builtins.Cos(e, t);
        case `cosh`:
          return this.builtins.Cosh(e, t);
        case `countLeadingZeros`:
          return this.builtins.CountLeadingZeros(e, t);
        case `countOneBits`:
          return this.builtins.CountOneBits(e, t);
        case `countTrailingZeros`:
          return this.builtins.CountTrailingZeros(e, t);
        case `cross`:
          return this.builtins.Cross(e, t);
        case `degrees`:
          return this.builtins.Degrees(e, t);
        case `determinant`:
          return this.builtins.Determinant(e, t);
        case `distance`:
          return this.builtins.Distance(e, t);
        case `dot`:
          return this.builtins.Dot(e, t);
        case `dot4U8Packed`:
          return this.builtins.Dot4U8Packed(e, t);
        case `dot4I8Packed`:
          return this.builtins.Dot4I8Packed(e, t);
        case `exp`:
          return this.builtins.Exp(e, t);
        case `exp2`:
          return this.builtins.Exp2(e, t);
        case `extractBits`:
          return this.builtins.ExtractBits(e, t);
        case `faceForward`:
          return this.builtins.FaceForward(e, t);
        case `firstLeadingBit`:
          return this.builtins.FirstLeadingBit(e, t);
        case `firstTrailingBit`:
          return this.builtins.FirstTrailingBit(e, t);
        case `floor`:
          return this.builtins.Floor(e, t);
        case `fma`:
          return this.builtins.Fma(e, t);
        case `fract`:
          return this.builtins.Fract(e, t);
        case `frexp`:
          return this.builtins.Frexp(e, t);
        case `insertBits`:
          return this.builtins.InsertBits(e, t);
        case `inverseSqrt`:
          return this.builtins.InverseSqrt(e, t);
        case `ldexp`:
          return this.builtins.Ldexp(e, t);
        case `length`:
          return this.builtins.Length(e, t);
        case `log`:
          return this.builtins.Log(e, t);
        case `log2`:
          return this.builtins.Log2(e, t);
        case `max`:
          return this.builtins.Max(e, t);
        case `min`:
          return this.builtins.Min(e, t);
        case `mix`:
          return this.builtins.Mix(e, t);
        case `modf`:
          return this.builtins.Modf(e, t);
        case `normalize`:
          return this.builtins.Normalize(e, t);
        case `pow`:
          return this.builtins.Pow(e, t);
        case `quantizeToF16`:
          return this.builtins.QuantizeToF16(e, t);
        case `radians`:
          return this.builtins.Radians(e, t);
        case `reflect`:
          return this.builtins.Reflect(e, t);
        case `refract`:
          return this.builtins.Refract(e, t);
        case `reverseBits`:
          return this.builtins.ReverseBits(e, t);
        case `round`:
          return this.builtins.Round(e, t);
        case `saturate`:
          return this.builtins.Saturate(e, t);
        case `sign`:
          return this.builtins.Sign(e, t);
        case `sin`:
          return this.builtins.Sin(e, t);
        case `sinh`:
          return this.builtins.Sinh(e, t);
        case `smoothStep`:
          return this.builtins.SmoothStep(e, t);
        case `sqrt`:
          return this.builtins.Sqrt(e, t);
        case `step`:
          return this.builtins.Step(e, t);
        case `tan`:
          return this.builtins.Tan(e, t);
        case `tanh`:
          return this.builtins.Tanh(e, t);
        case `transpose`:
          return this.builtins.Transpose(e, t);
        case `trunc`:
          return this.builtins.Trunc(e, t);
        case `dpdx`:
          return this.builtins.Dpdx(e, t);
        case `dpdxCoarse`:
          return this.builtins.DpdxCoarse(e, t);
        case `dpdxFine`:
          return this.builtins.DpdxFine(e, t);
        case `dpdy`:
          return this.builtins.Dpdy(e, t);
        case `dpdyCoarse`:
          return this.builtins.DpdyCoarse(e, t);
        case `dpdyFine`:
          return this.builtins.DpdyFine(e, t);
        case `fwidth`:
          return this.builtins.Fwidth(e, t);
        case `fwidthCoarse`:
          return this.builtins.FwidthCoarse(e, t);
        case `fwidthFine`:
          return this.builtins.FwidthFine(e, t);
        case `textureDimensions`:
          return this.builtins.TextureDimensions(e, t);
        case `textureGather`:
          return this.builtins.TextureGather(e, t);
        case `textureGatherCompare`:
          return this.builtins.TextureGatherCompare(e, t);
        case `textureLoad`:
          return this.builtins.TextureLoad(e, t);
        case `textureNumLayers`:
          return this.builtins.TextureNumLayers(e, t);
        case `textureNumLevels`:
          return this.builtins.TextureNumLevels(e, t);
        case `textureNumSamples`:
          return this.builtins.TextureNumSamples(e, t);
        case `textureSample`:
          return this.builtins.TextureSample(e, t);
        case `textureSampleBias`:
          return this.builtins.TextureSampleBias(e, t);
        case `textureSampleCompare`:
          return this.builtins.TextureSampleCompare(e, t);
        case `textureSampleCompareLevel`:
          return this.builtins.TextureSampleCompareLevel(e, t);
        case `textureSampleGrad`:
          return this.builtins.TextureSampleGrad(e, t);
        case `textureSampleLevel`:
          return this.builtins.TextureSampleLevel(e, t);
        case `textureSampleBaseClampToEdge`:
          return this.builtins.TextureSampleBaseClampToEdge(e, t);
        case `textureStore`:
          return this.builtins.TextureStore(e, t);
        case `atomicLoad`:
          return this.builtins.AtomicLoad(e, t);
        case `atomicStore`:
          return this.builtins.AtomicStore(e, t);
        case `atomicAdd`:
          return this.builtins.AtomicAdd(e, t);
        case `atomicSub`:
          return this.builtins.AtomicSub(e, t);
        case `atomicMax`:
          return this.builtins.AtomicMax(e, t);
        case `atomicMin`:
          return this.builtins.AtomicMin(e, t);
        case `atomicAnd`:
          return this.builtins.AtomicAnd(e, t);
        case `atomicOr`:
          return this.builtins.AtomicOr(e, t);
        case `atomicXor`:
          return this.builtins.AtomicXor(e, t);
        case `atomicExchange`:
          return this.builtins.AtomicExchange(e, t);
        case `atomicCompareExchangeWeak`:
          return this.builtins.AtomicCompareExchangeWeak(e, t);
        case `pack4x8snorm`:
          return this.builtins.Pack4x8snorm(e, t);
        case `pack4x8unorm`:
          return this.builtins.Pack4x8unorm(e, t);
        case `pack4xI8`:
          return this.builtins.Pack4xI8(e, t);
        case `pack4xU8`:
          return this.builtins.Pack4xU8(e, t);
        case `pack4x8Clamp`:
          return this.builtins.Pack4x8Clamp(e, t);
        case `pack4xU8Clamp`:
          return this.builtins.Pack4xU8Clamp(e, t);
        case `pack2x16snorm`:
          return this.builtins.Pack2x16snorm(e, t);
        case `pack2x16unorm`:
          return this.builtins.Pack2x16unorm(e, t);
        case `pack2x16float`:
          return this.builtins.Pack2x16float(e, t);
        case `unpack4x8snorm`:
          return this.builtins.Unpack4x8snorm(e, t);
        case `unpack4x8unorm`:
          return this.builtins.Unpack4x8unorm(e, t);
        case `unpack4xI8`:
          return this.builtins.Unpack4xI8(e, t);
        case `unpack4xU8`:
          return this.builtins.Unpack4xU8(e, t);
        case `unpack2x16snorm`:
          return this.builtins.Unpack2x16snorm(e, t);
        case `unpack2x16unorm`:
          return this.builtins.Unpack2x16unorm(e, t);
        case `unpack2x16float`:
          return this.builtins.Unpack2x16float(e, t);
        case `storageBarrier`:
          return this.builtins.StorageBarrier(e, t);
        case `textureBarrier`:
          return this.builtins.TextureBarrier(e, t);
        case `workgroupBarrier`:
          return this.builtins.WorkgroupBarrier(e, t);
        case `workgroupUniformLoad`:
          return this.builtins.WorkgroupUniformLoad(e, t);
        case `subgroupAdd`:
          return this.builtins.SubgroupAdd(e, t);
        case `subgroupExclusiveAdd`:
          return this.builtins.SubgroupExclusiveAdd(e, t);
        case `subgroupInclusiveAdd`:
          return this.builtins.SubgroupInclusiveAdd(e, t);
        case `subgroupAll`:
          return this.builtins.SubgroupAll(e, t);
        case `subgroupAnd`:
          return this.builtins.SubgroupAnd(e, t);
        case `subgroupAny`:
          return this.builtins.SubgroupAny(e, t);
        case `subgroupBallot`:
          return this.builtins.SubgroupBallot(e, t);
        case `subgroupBroadcast`:
          return this.builtins.SubgroupBroadcast(e, t);
        case `subgroupBroadcastFirst`:
          return this.builtins.SubgroupBroadcastFirst(e, t);
        case `subgroupElect`:
          return this.builtins.SubgroupElect(e, t);
        case `subgroupMax`:
          return this.builtins.SubgroupMax(e, t);
        case `subgroupMin`:
          return this.builtins.SubgroupMin(e, t);
        case `subgroupMul`:
          return this.builtins.SubgroupMul(e, t);
        case `subgroupExclusiveMul`:
          return this.builtins.SubgroupExclusiveMul(e, t);
        case `subgroupInclusiveMul`:
          return this.builtins.SubgroupInclusiveMul(e, t);
        case `subgroupOr`:
          return this.builtins.SubgroupOr(e, t);
        case `subgroupShuffle`:
          return this.builtins.SubgroupShuffle(e, t);
        case `subgroupShuffleDown`:
          return this.builtins.SubgroupShuffleDown(e, t);
        case `subgroupShuffleUp`:
          return this.builtins.SubgroupShuffleUp(e, t);
        case `subgroupShuffleXor`:
          return this.builtins.SubgroupShuffleXor(e, t);
        case `subgroupXor`:
          return this.builtins.SubgroupXor(e, t);
        case `quadBroadcast`:
          return this.builtins.QuadBroadcast(e, t);
        case `quadSwapDiagonal`:
          return this.builtins.QuadSwapDiagonal(e, t);
        case `quadSwapX`:
          return this.builtins.QuadSwapX(e, t);
        case `quadSwapY`:
          return this.builtins.QuadSwapY(e, t);
      }
      let n = t.getFunction(e.name);
      if (n) {
        let r = t.clone();
        for (let t = 0; t < n.node.args.length; ++t) {
          let i = n.node.args[t],
            a = this.evalExpression(e.args[t], r);
          r.setVariable(i.name, a, i);
        }
        return this._execStatements(n.node.body, r);
      }
      return null;
    }
    _callConstructorValue(e, t) {
      if (!e.args || e.args.length === 0)
        return new W(0, this.getTypeInfo(e.type));
      let n = this.evalExpression(e.args[0], t);
      return (
        (n.typeInfo = this.getTypeInfo(e.type)),
        n.getSubData(this, e.postfix, t).clone()
      );
    }
    _callConstructorVec(e, t) {
      let n = this.getTypeInfo(e.type),
        r = e.type.getTypeName(),
        i = Nn[r];
      if (i === void 0)
        return (
          console.error(`Invalid vec constructor ${r}. Line ${e.line}`), null
        );
      let a = [];
      if (e instanceof Kt) {
        if (e.isVector) {
          let t = e.vectorValue;
          for (let e of t) a.push(e);
        } else a.push(e.scalarValue);
      } else if (e.args)
        for (let n of e.args) {
          let e = this.evalExpression(n, t);
          if (e instanceof G) {
            let t = e.data;
            for (let e = 0; e < t.length; ++e) {
              let n = t[e];
              a.push(n);
            }
          } else if (e instanceof W) {
            let t = e.value;
            a.push(t);
          }
        }
      if (
        (e.type instanceof H &&
          e.type.format === null &&
          (e.type.format = H.f32),
        a.length === 0)
      )
        return new G(Array(i).fill(0), n).getSubData(this, e.postfix, t);
      if (a.length === 1) for (; a.length < i; ) a.push(a[0]);
      return a.length < i
        ? (console.error(`Invalid vec constructor. Line ${e.line}`), null)
        : new G(a.length > i ? a.slice(0, i) : a, n).getSubData(
            this,
            e.postfix,
            t,
          );
    }
    _callConstructorMatrix(e, t) {
      let n = this.getTypeInfo(e.type),
        r = e.type.getTypeName(),
        i = Pn[r];
      if (i === void 0)
        return (
          console.error(`Invalid matrix constructor ${r}. Line ${e.line}`), null
        );
      let a = [];
      if (e instanceof Kt) {
        if (e.isVector) {
          let t = e.vectorValue;
          for (let e of t) a.push(e);
        } else a.push(e.scalarValue);
      } else if (e.args)
        for (let n of e.args) {
          let e = this.evalExpression(n, t);
          e instanceof G
            ? a.push(...e.data)
            : e instanceof W
              ? a.push(e.value)
              : e instanceof K && a.push(...e.data);
        }
      return (
        n instanceof Ve &&
          n.format === null &&
          (n.format = this.getTypeInfo(`f32`)),
        a.length === 0
          ? new K(Array(i[2]).fill(0), n).getSubData(this, e.postfix, t)
          : a.length === i[2]
            ? new K(a, n).getSubData(this, e.postfix, t)
            : (console.error(`Invalid matrix constructor. Line ${e.line}`),
              null)
      );
    }
  };
(Fn._breakObj = new on(new Ie(`BREAK`, null), null)),
  (Fn._continueObj = new on(new Ie(`CONTINUE`, null), null)),
  (Fn._priority = new Map([
    [`f32`, 0],
    [`f16`, 1],
    [`u32`, 2],
    [`i32`, 3],
    [`x32`, 3],
  ]));
var In = class {
    constructor() {
      (this.constants = new Map()),
        (this.aliases = new Map()),
        (this.structs = new Map());
    }
  },
  Ln = class {
    constructor() {
      (this._tokens = []),
        (this._current = 0),
        (this._currentLine = 1),
        (this._deferArrayCountEval = []),
        (this._currentLoop = []),
        (this._context = new In()),
        (this._exec = new Fn()),
        (this._forwardTypeCount = 0);
    }
    parse(e) {
      this._initialize(e), (this._deferArrayCountEval.length = 0);
      let t = [];
      for (; !this._isAtEnd(); ) {
        let e = this._global_decl_or_directive();
        if (!e) break;
        t.push(e);
      }
      if (this._deferArrayCountEval.length > 0) {
        for (let e of this._deferArrayCountEval) {
          let t = e.arrayType,
            n = e.countNode;
          if (n instanceof Wt) {
            let e = n.name,
              r = this._context.constants.get(e);
            if (r)
              try {
                t.count = r.constEvaluate(this._exec);
              } catch {}
          }
        }
        this._deferArrayCountEval.length = 0;
      }
      if (this._forwardTypeCount > 0)
        for (let e of t)
          e.search((e) => {
            e instanceof rn || e instanceof Lt
              ? (e.type = this._forwardType(e.type))
              : e instanceof Rt
                ? (e.format = this._forwardType(e.format))
                : e instanceof ht || e instanceof _t || e instanceof vt
                  ? (e.type = this._forwardType(e.type))
                  : e instanceof ut
                    ? (e.returnType = this._forwardType(e.returnType))
                    : e instanceof tn && (e.type = this._forwardType(e.type));
          });
      return t;
    }
    _forwardType(e) {
      if (e instanceof Ft) {
        let t = this._getType(e.name);
        if (t) return t;
      } else
        e instanceof Lt
          ? (e.type = this._forwardType(e.type))
          : e instanceof Rt && (e.format = this._forwardType(e.format));
      return e;
    }
    _initialize(e) {
      if (e) {
        if (typeof e == `string`) {
          let t = new pn(e);
          this._tokens = t.scanTokens();
        } else this._tokens = e;
      } else this._tokens = [];
      this._current = 0;
    }
    _updateNode(e, t) {
      return (e.line = t ?? this._currentLine), e;
    }
    _error(e, t) {
      return { token: e, message: t, toString: () => `${t}` };
    }
    _isAtEnd() {
      return this._current >= this._tokens.length || this._peek().type == J.eof;
    }
    _match(e) {
      if (e instanceof q) return !!this._check(e) && (this._advance(), !0);
      for (let t = 0, n = e.length; t < n; ++t) {
        let n = e[t];
        if (this._check(n)) return this._advance(), !0;
      }
      return !1;
    }
    _consume(e, t) {
      if (this._check(e)) return this._advance();
      throw this._error(this._peek(), `${t}. Line:${this._currentLine}`);
    }
    _check(e) {
      if (this._isAtEnd()) return !1;
      let t = this._peek();
      if (e instanceof Array) {
        let n = t.type,
          r = !1;
        for (let t of e) {
          if (n === t) return !0;
          t === J.tokens.name && (r = !0);
        }
        if (r) {
          let e = J.tokens.name.rule.exec(t.lexeme);
          if (e && e.index == 0 && e[0] == t.lexeme) return !0;
        }
        return !1;
      }
      if (t.type === e) return !0;
      if (e === J.tokens.name) {
        let e = J.tokens.name.rule.exec(t.lexeme);
        return e && e.index == 0 && e[0] == t.lexeme;
      }
      return !1;
    }
    _advance() {
      return (
        (this._currentLine = this._peek()?.line ?? -1),
        this._isAtEnd() || this._current++,
        this._previous()
      );
    }
    _peek() {
      return this._tokens[this._current];
    }
    _previous() {
      return this._tokens[this._current - 1];
    }
    _global_decl_or_directive() {
      for (; this._match(J.tokens.semicolon) && !this._isAtEnd(); );
      if (this._match(J.keywords.alias)) {
        let e = this._type_alias();
        return (
          this._consume(J.tokens.semicolon, `Expected ';'`),
          this._exec.reflection.updateAST([e]),
          e
        );
      }
      if (this._match(J.keywords.diagnostic)) {
        let e = this._diagnostic();
        return (
          this._consume(J.tokens.semicolon, `Expected ';'`),
          this._exec.reflection.updateAST([e]),
          e
        );
      }
      if (this._match(J.keywords.requires)) {
        let e = this._requires_directive();
        return (
          this._consume(J.tokens.semicolon, `Expected ';'`),
          this._exec.reflection.updateAST([e]),
          e
        );
      }
      if (this._match(J.keywords.enable)) {
        let e = this._enable_directive();
        return (
          this._consume(J.tokens.semicolon, `Expected ';'`),
          this._exec.reflection.updateAST([e]),
          e
        );
      }
      let e = this._attribute();
      if (this._check(J.keywords.var)) {
        let t = this._global_variable_decl();
        return (
          t != null && (t.attributes = e),
          this._consume(J.tokens.semicolon, `Expected ';'.`),
          this._exec.reflection.updateAST([t]),
          t
        );
      }
      if (this._check(J.keywords.override)) {
        let t = this._override_variable_decl();
        return (
          t != null && (t.attributes = e),
          this._consume(J.tokens.semicolon, `Expected ';'.`),
          this._exec.reflection.updateAST([t]),
          t
        );
      }
      if (this._check(J.keywords.let)) {
        let t = this._global_let_decl();
        return (
          t != null && (t.attributes = e),
          this._consume(J.tokens.semicolon, `Expected ';'.`),
          this._exec.reflection.updateAST([t]),
          t
        );
      }
      if (this._check(J.keywords.const)) {
        let t = this._global_const_decl();
        return (
          t != null && (t.attributes = e),
          this._consume(J.tokens.semicolon, `Expected ';'.`),
          this._exec.reflection.updateAST([t]),
          t
        );
      }
      if (this._check(J.keywords.struct)) {
        let t = this._struct_decl();
        return (
          t != null && (t.attributes = e),
          this._exec.reflection.updateAST([t]),
          t
        );
      }
      if (this._check(J.keywords.fn)) {
        let t = this._function_decl();
        return (
          t != null && (t.attributes = e),
          this._exec.reflection.updateAST([t]),
          t
        );
      }
      return null;
    }
    _function_decl() {
      if (!this._match(J.keywords.fn)) return null;
      let e = this._currentLine,
        t = this._consume(J.tokens.ident, `Expected function name.`).toString();
      this._consume(
        J.tokens.paren_left,
        `Expected '(' for function arguments.`,
      );
      let n = [];
      if (!this._check(J.tokens.paren_right))
        do {
          if (this._check(J.tokens.paren_right)) break;
          let e = this._attribute(),
            t = this._consume(
              J.tokens.name,
              `Expected argument name.`,
            ).toString();
          this._consume(J.tokens.colon, `Expected ':' for argument type.`);
          let r = this._attribute(),
            i = this._type_decl();
          i != null &&
            ((i.attributes = r), n.push(this._updateNode(new tn(t, i, e))));
        } while (this._match(J.tokens.comma));
      this._consume(
        J.tokens.paren_right,
        `Expected ')' after function arguments.`,
      );
      let r = null;
      if (this._match(J.tokens.arrow)) {
        let e = this._attribute();
        (r = this._type_decl()), r != null && (r.attributes = e);
      }
      let i = this._compound_statement(),
        a = this._currentLine;
      return this._updateNode(new ut(t, n, r, i, e, a), e);
    }
    _compound_statement() {
      let e = [];
      for (
        this._consume(J.tokens.brace_left, `Expected '{' for block.`);
        !this._check(J.tokens.brace_right);

      ) {
        let t = this._statement();
        t !== null && e.push(t);
      }
      return this._consume(J.tokens.brace_right, `Expected '}' for block.`), e;
    }
    _statement() {
      for (; this._match(J.tokens.semicolon) && !this._isAtEnd(); );
      if (
        (this._check(J.tokens.attr) && this._attribute(),
        this._check(J.keywords.if))
      )
        return this._if_statement();
      if (this._check(J.keywords.switch)) return this._switch_statement();
      if (this._check(J.keywords.loop)) return this._loop_statement();
      if (this._check(J.keywords.for)) return this._for_statement();
      if (this._check(J.keywords.while)) return this._while_statement();
      if (this._check(J.keywords.continuing))
        return this._continuing_statement();
      if (this._check(J.keywords.static_assert))
        return this._static_assert_statement();
      if (this._check(J.tokens.brace_left)) return this._compound_statement();
      let e = null;
      if (this._check(J.keywords.return)) e = this._return_statement();
      else if (this._check([J.keywords.var, J.keywords.let, J.keywords.const]))
        e = this._variable_statement();
      else if (this._match(J.keywords.discard)) e = this._updateNode(new Mt());
      else if (this._match(J.keywords.break)) {
        let t = this._updateNode(new Nt());
        this._currentLoop.length > 0 &&
          (t.loopId = this._currentLoop[this._currentLoop.length - 1].id),
          (e = t),
          this._check(J.keywords.if) &&
            (this._advance(),
            (t.condition = this._optional_paren_expression()));
      } else if (this._match(J.keywords.continue)) {
        let t = this._updateNode(new Pt());
        if (!(this._currentLoop.length > 0))
          throw this._error(
            this._peek(),
            `Continue statement must be inside a loop. Line: ${t.line}`,
          );
        (t.loopId = this._currentLoop[this._currentLoop.length - 1].id),
          (e = t);
      } else
        e =
          this._increment_decrement_statement() ||
          this._func_call_statement() ||
          this._assignment_statement();
      return (
        e != null &&
          this._consume(J.tokens.semicolon, `Expected ';' after statement.`),
        e
      );
    }
    _static_assert_statement() {
      if (!this._match(J.keywords.static_assert)) return null;
      let e = this._currentLine,
        t = this._optional_paren_expression();
      return this._updateNode(new dt(t), e);
    }
    _while_statement() {
      if (!this._match(J.keywords.while)) return null;
      let e = this._updateNode(new ft(null, null));
      return (
        this._currentLoop.push(e),
        (e.condition = this._optional_paren_expression()),
        this._check(J.tokens.attr) && this._attribute(),
        (e.body = this._compound_statement()),
        this._currentLoop.pop(),
        e
      );
    }
    _continuing_statement() {
      let e =
        this._currentLoop.length > 0
          ? this._currentLoop[this._currentLoop.length - 1].id
          : -1;
      if (!this._match(J.keywords.continuing)) return null;
      let t = this._currentLine,
        n = this._compound_statement();
      return this._updateNode(new pt(n, e), t);
    }
    _for_statement() {
      if (!this._match(J.keywords.for)) return null;
      this._consume(J.tokens.paren_left, `Expected '('.`);
      let e = this._updateNode(new mt(null, null, null, null));
      return (
        this._currentLoop.push(e),
        (e.init = this._check(J.tokens.semicolon) ? null : this._for_init()),
        this._consume(J.tokens.semicolon, `Expected ';'.`),
        (e.condition = this._check(J.tokens.semicolon)
          ? null
          : this._short_circuit_or_expression()),
        this._consume(J.tokens.semicolon, `Expected ';'.`),
        (e.increment = this._check(J.tokens.paren_right)
          ? null
          : this._for_increment()),
        this._consume(J.tokens.paren_right, `Expected ')'.`),
        this._check(J.tokens.attr) && this._attribute(),
        (e.body = this._compound_statement()),
        this._currentLoop.pop(),
        e
      );
    }
    _for_init() {
      return (
        this._variable_statement() ||
        this._func_call_statement() ||
        this._assignment_statement()
      );
    }
    _for_increment() {
      return (
        this._func_call_statement() ||
        this._increment_decrement_statement() ||
        this._assignment_statement()
      );
    }
    _variable_statement() {
      if (this._check(J.keywords.var)) {
        let e = this._variable_decl();
        if (e === null)
          throw this._error(this._peek(), `Variable declaration expected.`);
        let t = null;
        return (
          this._match(J.tokens.equal) &&
            (t = this._short_circuit_or_expression()),
          this._updateNode(
            new ht(e.name, e.type, e.storage, e.access, t),
            e.line,
          )
        );
      }
      if (this._match(J.keywords.let)) {
        let e = this._currentLine,
          t = this._consume(J.tokens.name, `Expected name for let.`).toString(),
          n = null;
        if (this._match(J.tokens.colon)) {
          let e = this._attribute();
          (n = this._type_decl()), n != null && (n.attributes = e);
        }
        this._consume(J.tokens.equal, `Expected '=' for let.`);
        let r = this._short_circuit_or_expression();
        return this._updateNode(new _t(t, n, null, null, r), e);
      }
      if (this._match(J.keywords.const)) {
        let e = this._currentLine,
          t = this._consume(
            J.tokens.name,
            `Expected name for const.`,
          ).toString(),
          n = null;
        if (this._match(J.tokens.colon)) {
          let e = this._attribute();
          (n = this._type_decl()), n != null && (n.attributes = e);
        }
        this._consume(J.tokens.equal, `Expected '=' for const.`);
        let r = this._short_circuit_or_expression();
        return (
          n === null && r instanceof Kt && (n = r.type),
          this._updateNode(new vt(t, n, null, null, r), e)
        );
      }
      return null;
    }
    _increment_decrement_statement() {
      let e = this._current,
        t = this._unary_expression();
      if (t == null) return null;
      if (!this._check(J.increment_operators)) return (this._current = e), null;
      let n = this._consume(
        J.increment_operators,
        `Expected increment operator`,
      );
      return this._updateNode(
        new xt(n.type === J.tokens.plus_plus ? yt.increment : yt.decrement, t),
      );
    }
    _assignment_statement() {
      let e = null,
        t = this._currentLine;
      if (this._check(J.tokens.brace_right)) return null;
      let n = this._match(J.tokens.underscore);
      if ((n || (e = this._unary_expression()), !n && e == null)) return null;
      let r = this._consume(
          J.assignment_operators,
          `Expected assignment operator.`,
        ),
        i = this._short_circuit_or_expression();
      return this._updateNode(new St(bt.parse(r.lexeme), e, i), t);
    }
    _func_call_statement() {
      if (!this._check(J.tokens.ident)) return null;
      let e = this._currentLine,
        t = this._current,
        n = this._consume(J.tokens.ident, `Expected function name.`),
        r = this._argument_expression_list();
      return r === null
        ? ((this._current = t), null)
        : this._updateNode(new Ct(n.lexeme, r), e);
    }
    _loop_statement() {
      if (!this._match(J.keywords.loop)) return null;
      this._check(J.tokens.attr) && this._attribute(),
        this._consume(J.tokens.brace_left, `Expected '{' for loop.`);
      let e = this._updateNode(new wt([], null));
      this._currentLoop.push(e);
      let t = this._statement();
      for (; t !== null; ) {
        if (Array.isArray(t)) for (let n of t) e.body.push(n);
        else e.body.push(t);
        if (t instanceof pt) {
          e.continuing = t;
          break;
        }
        t = this._statement();
      }
      return (
        this._currentLoop.pop(),
        this._consume(J.tokens.brace_right, `Expected '}' for loop.`),
        e
      );
    }
    _switch_statement() {
      if (!this._match(J.keywords.switch)) return null;
      let e = this._updateNode(new Tt(null, []));
      if (
        (this._currentLoop.push(e),
        (e.condition = this._optional_paren_expression()),
        this._check(J.tokens.attr) && this._attribute(),
        this._consume(J.tokens.brace_left, `Expected '{' for switch.`),
        (e.cases = this._switch_body()),
        e.cases == null || e.cases.length == 0)
      )
        throw this._error(this._previous(), `Expected 'case' or 'default'.`);
      return (
        this._consume(J.tokens.brace_right, `Expected '}' for switch.`),
        this._currentLoop.pop(),
        e
      );
    }
    _switch_body() {
      let e = [],
        t = !1;
      for (; this._check([J.keywords.default, J.keywords.case]); ) {
        if (this._match(J.keywords.case)) {
          let n = this._case_selectors();
          for (let e of n)
            if (e instanceof Qt) {
              if (t)
                throw this._error(
                  this._previous(),
                  `Multiple default cases in switch statement.`,
                );
              t = !0;
              break;
            }
          this._match(J.tokens.colon),
            this._check(J.tokens.attr) && this._attribute(),
            this._consume(J.tokens.brace_left, `Exected '{' for switch case.`);
          let r = this._case_body();
          this._consume(J.tokens.brace_right, `Exected '}' for switch case.`),
            e.push(this._updateNode(new $t(n, r)));
        }
        if (this._match(J.keywords.default)) {
          if (t)
            throw this._error(
              this._previous(),
              `Multiple default cases in switch statement.`,
            );
          this._match(J.tokens.colon),
            this._check(J.tokens.attr) && this._attribute(),
            this._consume(
              J.tokens.brace_left,
              `Exected '{' for switch default.`,
            );
          let n = this._case_body();
          this._consume(
            J.tokens.brace_right,
            `Exected '}' for switch default.`,
          ),
            e.push(this._updateNode(new en(n)));
        }
      }
      return e;
    }
    _case_selectors() {
      let e = [];
      for (
        this._match(J.keywords.default)
          ? e.push(this._updateNode(new Qt()))
          : e.push(this._shift_expression());
        this._match(J.tokens.comma);

      )
        this._match(J.keywords.default)
          ? e.push(this._updateNode(new Qt()))
          : e.push(this._shift_expression());
      return e;
    }
    _case_body() {
      if (this._match(J.keywords.fallthrough))
        return this._consume(J.tokens.semicolon, `Expected ';'`), [];
      let e = this._statement();
      if (e == null) return [];
      e instanceof Array || (e = [e]);
      let t = this._case_body();
      return t.length == 0 ? e : [...e, t[0]];
    }
    _if_statement() {
      if (!this._match(J.keywords.if)) return null;
      let e = this._currentLine,
        t = this._optional_paren_expression();
      this._check(J.tokens.attr) && this._attribute();
      let n = this._compound_statement(),
        r = [];
      this._match_elseif() &&
        (this._check(J.tokens.attr) && this._attribute(),
        (r = this._elseif_statement(r)));
      let i = null;
      return (
        this._match(J.keywords.else) &&
          (this._check(J.tokens.attr) && this._attribute(),
          (i = this._compound_statement())),
        this._updateNode(new Et(t, n, r, i), e)
      );
    }
    _match_elseif() {
      return (
        this._tokens[this._current].type === J.keywords.else &&
        this._tokens[this._current + 1].type === J.keywords.if &&
        (this._advance(), this._advance(), !0)
      );
    }
    _elseif_statement(e = []) {
      let t = this._optional_paren_expression(),
        n = this._compound_statement();
      return (
        e.push(this._updateNode(new nn(t, n))),
        this._match_elseif() &&
          (this._check(J.tokens.attr) && this._attribute(),
          this._elseif_statement(e)),
        e
      );
    }
    _return_statement() {
      if (!this._match(J.keywords.return)) return null;
      let e = this._short_circuit_or_expression();
      return this._updateNode(new Dt(e));
    }
    _short_circuit_or_expression() {
      let e = this._short_circuit_and_expr();
      for (; this._match(J.tokens.or_or); )
        e = this._updateNode(
          new Xt(
            this._previous().toString(),
            e,
            this._short_circuit_and_expr(),
          ),
        );
      return e;
    }
    _short_circuit_and_expr() {
      let e = this._inclusive_or_expression();
      for (; this._match(J.tokens.and_and); )
        e = this._updateNode(
          new Xt(
            this._previous().toString(),
            e,
            this._inclusive_or_expression(),
          ),
        );
      return e;
    }
    _inclusive_or_expression() {
      let e = this._exclusive_or_expression();
      for (; this._match(J.tokens.or); )
        e = this._updateNode(
          new Xt(
            this._previous().toString(),
            e,
            this._exclusive_or_expression(),
          ),
        );
      return e;
    }
    _exclusive_or_expression() {
      let e = this._and_expression();
      for (; this._match(J.tokens.xor); )
        e = this._updateNode(
          new Xt(this._previous().toString(), e, this._and_expression()),
        );
      return e;
    }
    _and_expression() {
      let e = this._equality_expression();
      for (; this._match(J.tokens.and); )
        e = this._updateNode(
          new Xt(this._previous().toString(), e, this._equality_expression()),
        );
      return e;
    }
    _equality_expression() {
      let e = this._relational_expression();
      return this._match([J.tokens.equal_equal, J.tokens.not_equal])
        ? this._updateNode(
            new Xt(
              this._previous().toString(),
              e,
              this._relational_expression(),
            ),
          )
        : e;
    }
    _relational_expression() {
      let e = this._shift_expression();
      for (
        ;
        this._match([
          J.tokens.less_than,
          J.tokens.greater_than,
          J.tokens.less_than_equal,
          J.tokens.greater_than_equal,
        ]);

      )
        e = this._updateNode(
          new Xt(this._previous().toString(), e, this._shift_expression()),
        );
      return e;
    }
    _shift_expression() {
      let e = this._additive_expression();
      for (; this._match([J.tokens.shift_left, J.tokens.shift_right]); )
        e = this._updateNode(
          new Xt(this._previous().toString(), e, this._additive_expression()),
        );
      return e;
    }
    _additive_expression() {
      let e = this._multiplicative_expression();
      for (; this._match([J.tokens.plus, J.tokens.minus]); )
        e = this._updateNode(
          new Xt(
            this._previous().toString(),
            e,
            this._multiplicative_expression(),
          ),
        );
      return e;
    }
    _multiplicative_expression() {
      let e = this._unary_expression();
      for (
        ;
        this._match([J.tokens.star, J.tokens.forward_slash, J.tokens.modulo]);

      )
        e = this._updateNode(
          new Xt(this._previous().toString(), e, this._unary_expression()),
        );
      return e;
    }
    _unary_expression() {
      return this._match([
        J.tokens.minus,
        J.tokens.bang,
        J.tokens.tilde,
        J.tokens.star,
        J.tokens.and,
      ])
        ? this._updateNode(
            new U(this._previous().toString(), this._unary_expression()),
          )
        : this._singular_expression();
    }
    _singular_expression() {
      let e = this._primary_expression(),
        t = this._postfix_expression();
      return t && (e.postfix = t), e;
    }
    _postfix_expression() {
      if (this._match(J.tokens.bracket_left)) {
        let e = this._short_circuit_or_expression();
        this._consume(J.tokens.bracket_right, `Expected ']'.`);
        let t = this._updateNode(new Jt(e)),
          n = this._postfix_expression();
        return n && (t.postfix = n), t;
      }
      if (this._match(J.tokens.period)) {
        let e = this._consume(J.tokens.name, `Expected member name.`),
          t = this._postfix_expression(),
          n = this._updateNode(new Vt(e.lexeme));
        return t && (n.postfix = t), n;
      }
      return null;
    }
    _getStruct(e) {
      return this._context.aliases.has(e)
        ? this._context.aliases.get(e).type
        : this._context.structs.has(e)
          ? this._context.structs.get(e)
          : null;
    }
    _getType(e) {
      let t = this._getStruct(e);
      if (t !== null) return t;
      switch (e) {
        case `void`:
          return V.void;
        case `bool`:
          return V.bool;
        case `i32`:
          return V.i32;
        case `u32`:
          return V.u32;
        case `f32`:
          return V.f32;
        case `f16`:
          return V.f16;
        case `vec2f`:
          return H.vec2f;
        case `vec3f`:
          return H.vec3f;
        case `vec4f`:
          return H.vec4f;
        case `vec2i`:
          return H.vec2i;
        case `vec3i`:
          return H.vec3i;
        case `vec4i`:
          return H.vec4i;
        case `vec2u`:
          return H.vec2u;
        case `vec3u`:
          return H.vec3u;
        case `vec4u`:
          return H.vec4u;
        case `vec2h`:
          return H.vec2h;
        case `vec3h`:
          return H.vec3h;
        case `vec4h`:
          return H.vec4h;
        case `mat2x2f`:
          return H.mat2x2f;
        case `mat2x3f`:
          return H.mat2x3f;
        case `mat2x4f`:
          return H.mat2x4f;
        case `mat3x2f`:
          return H.mat3x2f;
        case `mat3x3f`:
          return H.mat3x3f;
        case `mat3x4f`:
          return H.mat3x4f;
        case `mat4x2f`:
          return H.mat4x2f;
        case `mat4x3f`:
          return H.mat4x3f;
        case `mat4x4f`:
          return H.mat4x4f;
        case `mat2x2h`:
          return H.mat2x2h;
        case `mat2x3h`:
          return H.mat2x3h;
        case `mat2x4h`:
          return H.mat2x4h;
        case `mat3x2h`:
          return H.mat3x2h;
        case `mat3x3h`:
          return H.mat3x3h;
        case `mat3x4h`:
          return H.mat3x4h;
        case `mat4x2h`:
          return H.mat4x2h;
        case `mat4x3h`:
          return H.mat4x3h;
        case `mat4x4h`:
          return H.mat4x4h;
        case `mat2x2i`:
          return H.mat2x2i;
        case `mat2x3i`:
          return H.mat2x3i;
        case `mat2x4i`:
          return H.mat2x4i;
        case `mat3x2i`:
          return H.mat3x2i;
        case `mat3x3i`:
          return H.mat3x3i;
        case `mat3x4i`:
          return H.mat3x4i;
        case `mat4x2i`:
          return H.mat4x2i;
        case `mat4x3i`:
          return H.mat4x3i;
        case `mat4x4i`:
          return H.mat4x4i;
        case `mat2x2u`:
          return H.mat2x2u;
        case `mat2x3u`:
          return H.mat2x3u;
        case `mat2x4u`:
          return H.mat2x4u;
        case `mat3x2u`:
          return H.mat3x2u;
        case `mat3x3u`:
          return H.mat3x3u;
        case `mat3x4u`:
          return H.mat3x4u;
        case `mat4x2u`:
          return H.mat4x2u;
        case `mat4x3u`:
          return H.mat4x3u;
        case `mat4x4u`:
          return H.mat4x4u;
      }
      return null;
    }
    _validateTypeRange(e, t) {
      if (t.name === `i32`) {
        if (e < -2147483648 || e > 2147483647)
          throw this._error(
            this._previous(),
            `Value out of range for i32: ${e}. Line: ${this._currentLine}.`,
          );
      } else if (t.name === `u32` && (e < 0 || e > 4294967295))
        throw this._error(
          this._previous(),
          `Value out of range for u32: ${e}. Line: ${this._currentLine}.`,
        );
    }
    _primary_expression() {
      if (this._match(J.tokens.ident)) {
        let e = this._previous().toString();
        if (this._check(J.tokens.paren_left)) {
          let t = this._argument_expression_list(),
            n = this._getType(e);
          return n === null
            ? this._updateNode(new Ut(e, t))
            : this._updateNode(new Ht(n, t));
        }
        if (this._context.constants.has(e)) {
          let t = this._context.constants.get(e);
          return this._updateNode(new Gt(e, t.value));
        }
        return this._updateNode(new Wt(e));
      }
      if (this._match(J.tokens.int_literal)) {
        let e = this._previous().toString(),
          t =
            e.endsWith(`i`) || e.endsWith(`i`)
              ? V.i32
              : e.endsWith(`u`) || e.endsWith(`U`)
                ? V.u32
                : V.x32,
          n = parseInt(e);
        return (
          this._validateTypeRange(n, t),
          this._updateNode(new Kt(new W(n, this._exec.getTypeInfo(t)), t))
        );
      }
      if (this._match(J.tokens.uint_literal)) {
        let e = parseInt(this._previous().toString());
        return (
          this._validateTypeRange(e, V.u32),
          this._updateNode(
            new Kt(new W(e, this._exec.getTypeInfo(V.u32)), V.u32),
          )
        );
      }
      if (
        this._match([
          J.tokens.decimal_float_literal,
          J.tokens.hex_float_literal,
        ])
      ) {
        let e = this._previous().toString(),
          t = e.endsWith(`h`);
        t && (e = e.substring(0, e.length - 1));
        let n = parseFloat(e);
        this._validateTypeRange(n, t ? V.f16 : V.f32);
        let r = t ? V.f16 : V.f32;
        return this._updateNode(new Kt(new W(n, this._exec.getTypeInfo(r)), r));
      }
      if (this._match([J.keywords.true, J.keywords.false])) {
        let e = this._previous().toString() === J.keywords.true.rule;
        return this._updateNode(
          new Kt(new W(+!!e, this._exec.getTypeInfo(V.bool)), V.bool),
        );
      }
      if (this._check(J.tokens.paren_left)) return this._paren_expression();
      if (this._match(J.keywords.bitcast)) {
        this._consume(J.tokens.less_than, `Expected '<'.`);
        let e = this._type_decl();
        this._consume(J.tokens.greater_than, `Expected '>'.`);
        let t = this._paren_expression();
        return this._updateNode(new qt(e, t));
      }
      let e = this._type_decl(),
        t = this._argument_expression_list();
      return this._updateNode(new Ht(e, t));
    }
    _argument_expression_list() {
      if (!this._match(J.tokens.paren_left)) return null;
      let e = [];
      do {
        if (this._check(J.tokens.paren_right)) break;
        let t = this._short_circuit_or_expression();
        e.push(t);
      } while (this._match(J.tokens.comma));
      return (
        this._consume(J.tokens.paren_right, `Expected ')' for agument list`), e
      );
    }
    _optional_paren_expression() {
      this._match(J.tokens.paren_left);
      let e = this._short_circuit_or_expression();
      return this._match(J.tokens.paren_right), e;
    }
    _paren_expression() {
      this._consume(J.tokens.paren_left, `Expected '('.`);
      let e = this._short_circuit_or_expression();
      return this._consume(J.tokens.paren_right, `Expected ')'.`), e;
    }
    _struct_decl() {
      if (!this._match(J.keywords.struct)) return null;
      let e = this._currentLine,
        t = this._consume(
          J.tokens.ident,
          `Expected name for struct.`,
        ).toString();
      this._consume(J.tokens.brace_left, `Expected '{' for struct body.`);
      let n = [];
      for (; !this._check(J.tokens.brace_right); ) {
        let e = this._attribute(),
          t = this._consume(
            J.tokens.name,
            `Expected variable name.`,
          ).toString();
        this._consume(J.tokens.colon, `Expected ':' for struct member type.`);
        let r = this._attribute(),
          i = this._type_decl();
        i != null && (i.attributes = r),
          this._check(J.tokens.brace_right)
            ? this._match(J.tokens.comma)
            : this._consume(J.tokens.comma, `Expected ',' for struct member.`),
          n.push(this._updateNode(new rn(t, i, e)));
      }
      this._consume(J.tokens.brace_right, `Expected '}' after struct body.`);
      let r = this._currentLine,
        i = this._updateNode(new It(t, n, e, r), e);
      return this._context.structs.set(t, i), i;
    }
    _global_variable_decl() {
      let e = this._variable_decl();
      if (!e) return null;
      if (
        (this._match(J.tokens.equal) && (e.value = this._const_expression()),
        e.type !== null && e.value instanceof Kt)
      ) {
        if (
          e.value.type.name !== `x32` &&
          e.type.getTypeName() !== e.value.type.getTypeName()
        )
          throw this._error(
            this._peek(),
            `Invalid cast from ${e.value.type.name} to ${e.type.name}. Line:${this._currentLine}`,
          );
        e.value.isScalar &&
          this._validateTypeRange(e.value.scalarValue, e.type),
          (e.value.type = e.type);
      } else
        e.type === null &&
          e.value instanceof Kt &&
          ((e.type = e.value.type.name === `x32` ? V.i32 : e.value.type),
          e.value.isScalar &&
            this._validateTypeRange(e.value.scalarValue, e.type));
      return e;
    }
    _override_variable_decl() {
      let e = this._override_decl();
      return (
        e &&
          this._match(J.tokens.equal) &&
          (e.value = this._const_expression()),
        e
      );
    }
    _global_const_decl() {
      if (!this._match(J.keywords.const)) return null;
      let e = this._consume(J.tokens.name, `Expected variable name`),
        t = this._currentLine,
        n = null;
      if (this._match(J.tokens.colon)) {
        let e = this._attribute();
        (n = this._type_decl()), n != null && (n.attributes = e);
      }
      let r = null;
      this._consume(J.tokens.equal, `const declarations require an assignment`);
      let i = this._short_circuit_or_expression();
      try {
        let t = [V.f32],
          n = i.constEvaluate(this._exec, t);
        n instanceof W && this._validateTypeRange(n.value, t[0]),
          t[0] instanceof H &&
            t[0].format === null &&
            n.typeInfo instanceof Ve &&
            n.typeInfo.format !== null &&
            (n.typeInfo.format.name === `f16`
              ? (t[0].format = V.f16)
              : n.typeInfo.format.name === `f32`
                ? (t[0].format = V.f32)
                : n.typeInfo.format.name === `i32`
                  ? (t[0].format = V.i32)
                  : n.typeInfo.format.name === `u32`
                    ? (t[0].format = V.u32)
                    : n.typeInfo.format.name === `bool`
                      ? (t[0].format = V.bool)
                      : console.error(
                          `TODO: impelement template format type ${n.typeInfo.format.name}`,
                        )),
          (r = this._updateNode(new Kt(n, t[0]))),
          this._exec.context.setVariable(e.toString(), n);
      } catch {
        r = i;
      }
      if (n !== null && r instanceof Kt) {
        if (r.type.name !== `x32` && n.getTypeName() !== r.type.getTypeName())
          throw this._error(
            this._peek(),
            `Invalid cast from ${r.type.name} to ${n.name}. Line:${this._currentLine}`,
          );
        (r.type = n),
          r.isScalar && this._validateTypeRange(r.scalarValue, r.type);
      } else
        n === null &&
          r instanceof Kt &&
          ((n = r?.type ?? V.f32), n === V.x32 && (n = V.i32));
      let a = this._updateNode(new vt(e.toString(), n, ``, ``, r), t);
      return this._context.constants.set(a.name, a), a;
    }
    _global_let_decl() {
      if (!this._match(J.keywords.let)) return null;
      let e = this._currentLine,
        t = this._consume(J.tokens.name, `Expected variable name`),
        n = null;
      if (this._match(J.tokens.colon)) {
        let e = this._attribute();
        (n = this._type_decl()), n != null && (n.attributes = e);
      }
      let r = null;
      if (
        (this._match(J.tokens.equal) && (r = this._const_expression()),
        n !== null && r instanceof Kt)
      ) {
        if (r.type.name !== `x32` && n.getTypeName() !== r.type.getTypeName())
          throw this._error(
            this._peek(),
            `Invalid cast from ${r.type.name} to ${n.name}. Line:${this._currentLine}`,
          );
        r.type = n;
      } else
        n === null &&
          r instanceof Kt &&
          (n = r.type.name === `x32` ? V.i32 : r.type);
      return (
        r instanceof Kt &&
          r.isScalar &&
          this._validateTypeRange(r.scalarValue, n),
        this._updateNode(new _t(t.toString(), n, ``, ``, r), e)
      );
    }
    _const_expression() {
      return this._short_circuit_or_expression();
    }
    _variable_decl() {
      if (!this._match(J.keywords.var)) return null;
      let e = this._currentLine,
        t = ``,
        n = ``;
      this._match(J.tokens.less_than) &&
        ((t = this._consume(
          J.storage_class,
          `Expected storage_class.`,
        ).toString()),
        this._match(J.tokens.comma) &&
          (n = this._consume(
            J.access_mode,
            `Expected access_mode.`,
          ).toString()),
        this._consume(J.tokens.greater_than, `Expected '>'.`));
      let r = this._consume(J.tokens.name, `Expected variable name`),
        i = null;
      if (this._match(J.tokens.colon)) {
        let e = this._attribute();
        (i = this._type_decl()), i != null && (i.attributes = e);
      }
      return this._updateNode(new ht(r.toString(), i, t, n, null), e);
    }
    _override_decl() {
      if (!this._match(J.keywords.override)) return null;
      let e = this._consume(J.tokens.name, `Expected variable name`),
        t = null;
      if (this._match(J.tokens.colon)) {
        let e = this._attribute();
        (t = this._type_decl()), t != null && (t.attributes = e);
      }
      return this._updateNode(new gt(e.toString(), t, null));
    }
    _diagnostic() {
      this._consume(J.tokens.paren_left, `Expected '('`);
      let e = this._consume(J.tokens.ident, `Expected severity control name.`);
      this._consume(J.tokens.comma, `Expected ','`);
      let t = this._consume(
        J.tokens.ident,
        `Expected diagnostic rule name.`,
      ).toString();
      return (
        this._match(J.tokens.period) &&
          (t += `.${this._consume(J.tokens.ident, `Expected diagnostic message.`).toString()}`),
        this._consume(J.tokens.paren_right, `Expected ')'`),
        this._updateNode(new At(e.toString(), t))
      );
    }
    _enable_directive() {
      let e = this._consume(J.tokens.ident, `identity expected.`);
      return this._updateNode(new Ot(e.toString()));
    }
    _requires_directive() {
      let e = [this._consume(J.tokens.ident, `identity expected.`).toString()];
      for (; this._match(J.tokens.comma); ) {
        let t = this._consume(J.tokens.ident, `identity expected.`);
        e.push(t.toString());
      }
      return this._updateNode(new kt(e));
    }
    _type_alias() {
      let e = this._consume(J.tokens.ident, `identity expected.`);
      this._consume(J.tokens.equal, `Expected '=' for type alias.`);
      let t = this._type_decl();
      if (t === null)
        throw this._error(this._peek(), `Expected Type for Alias.`);
      this._context.aliases.has(t.name) &&
        (t = this._context.aliases.get(t.name).type);
      let n = this._updateNode(new jt(e.toString(), t));
      return this._context.aliases.set(n.name, n), n;
    }
    _type_decl() {
      if (
        this._check([
          J.tokens.ident,
          ...J.texel_format,
          J.keywords.bool,
          J.keywords.f32,
          J.keywords.i32,
          J.keywords.u32,
        ])
      ) {
        let e = this._advance().toString();
        if (this._context.structs.has(e)) return this._context.structs.get(e);
        if (this._context.aliases.has(e))
          return this._context.aliases.get(e).type;
        if (!this._getType(e)) {
          let t = this._updateNode(new Ft(e));
          return this._forwardTypeCount++, t;
        }
        return this._updateNode(new V(e));
      }
      let e = this._texture_sampler_types();
      if (e) return e;
      if (this._check(J.template_types)) {
        let e = this._advance().toString(),
          t = null,
          n = null;
        return (
          this._match(J.tokens.less_than) &&
            ((t = this._type_decl()),
            (n = null),
            this._match(J.tokens.comma) &&
              (n = this._consume(
                J.access_mode,
                `Expected access_mode for pointer`,
              ).toString()),
            this._consume(J.tokens.greater_than, `Expected '>' for type.`)),
          this._updateNode(new H(e, t, n))
        );
      }
      if (this._match(J.keywords.ptr)) {
        let e = this._previous().toString();
        this._consume(J.tokens.less_than, `Expected '<' for pointer.`);
        let t = this._consume(
          J.storage_class,
          `Expected storage_class for pointer`,
        );
        this._consume(J.tokens.comma, `Expected ',' for pointer.`);
        let n = this._type_decl(),
          r = null;
        return (
          this._match(J.tokens.comma) &&
            (r = this._consume(
              J.access_mode,
              `Expected access_mode for pointer`,
            ).toString()),
          this._consume(J.tokens.greater_than, `Expected '>' for pointer.`),
          this._updateNode(new Lt(e, t.toString(), n, r))
        );
      }
      let t = this._attribute();
      if (this._match(J.keywords.array)) {
        let e = null,
          n = -1,
          r = this._previous(),
          i = null;
        if (this._match(J.tokens.less_than)) {
          (e = this._type_decl()),
            this._context.aliases.has(e.name) &&
              (e = this._context.aliases.get(e.name).type);
          let t = ``;
          if (this._match(J.tokens.comma)) {
            i = this._shift_expression();
            try {
              (t = i.constEvaluate(this._exec).toString()), (i = null);
            } catch {
              t = `1`;
            }
          }
          this._consume(J.tokens.greater_than, `Expected '>' for array.`),
            (n = t ? parseInt(t) : 0);
        }
        let a = this._updateNode(new Rt(r.toString(), t, e, n));
        return (
          i && this._deferArrayCountEval.push({ arrayType: a, countNode: i }), a
        );
      }
      return null;
    }
    _texture_sampler_types() {
      if (this._match(J.sampler_type) || this._match(J.depth_texture_type))
        return this._updateNode(
          new zt(this._previous().toString(), null, null),
        );
      if (
        this._match(J.sampled_texture_type) ||
        this._match(J.multisampled_texture_type)
      ) {
        let e = this._previous();
        this._consume(J.tokens.less_than, `Expected '<' for sampler type.`);
        let t = this._type_decl();
        return (
          this._consume(
            J.tokens.greater_than,
            `Expected '>' for sampler type.`,
          ),
          this._updateNode(new zt(e.toString(), t, null))
        );
      }
      if (this._match(J.storage_texture_type)) {
        let e = this._previous();
        this._consume(J.tokens.less_than, `Expected '<' for sampler type.`);
        let t = this._consume(
          J.texel_format,
          `Invalid texel format.`,
        ).toString();
        this._consume(J.tokens.comma, `Expected ',' after texel format.`);
        let n = this._consume(
          J.access_mode,
          `Expected access mode for storage texture type.`,
        ).toString();
        return (
          this._consume(
            J.tokens.greater_than,
            `Expected '>' for sampler type.`,
          ),
          this._updateNode(new zt(e.toString(), t, n))
        );
      }
      return null;
    }
    _attribute() {
      let e = [];
      for (; this._match(J.tokens.attr); ) {
        let t = this._consume(J.attribute_name, `Expected attribute name`),
          n = this._updateNode(new an(t.toString(), null));
        if (this._match(J.tokens.paren_left)) {
          if (
            ((n.value = this._consume(
              J.literal_or_ident,
              `Expected attribute value`,
            ).toString()),
            this._check(J.tokens.comma))
          ) {
            this._advance();
            do {
              let e = this._consume(
                J.literal_or_ident,
                `Expected attribute value`,
              ).toString();
              n.value instanceof Array || (n.value = [n.value]),
                n.value.push(e);
            } while (this._match(J.tokens.comma));
          }
          this._consume(J.tokens.paren_right, `Expected ')'`);
        }
        e.push(n);
      }
      return e.length == 0 ? null : e;
    }
  },
  Rn = class extends En {
    constructor(e) {
      super(), e && this.update(e);
    }
    update(e) {
      let t = new Ln().parse(e);
      this.updateAST(t);
    }
  };
function zn(e, t, n) {
  let { entryPoint: r } = t;
  if (r) {
    let t = e.entryPoints[r];
    return t && t.stage === n ? t : void 0;
  }
  return Object.values(e.entryPoints).filter((e) => e.stage === n)[0];
}
function Bn(e, t, n) {
  return (t && zn(e, t, n)?.resources) || [];
}
var Vn = (e, t) => Math.sign(e.binding - t.binding);
function Hn(e, t) {
  e = Array.isArray(e) ? e : [e];
  let n = [
      ...Bn(e[0], t.vertex, GPUShaderStage.VERTEX),
      ...Bn(e[e.length - 1], t.fragment, GPUShaderStage.FRAGMENT),
      ...Bn(e[0], t.compute, GPUShaderStage.COMPUTE),
    ],
    r = [];
  for (let e of n) {
    let t = r[e.group] || new Map();
    r[e.group] = t;
    let n = t.get(e.entry.binding);
    t.set(e.entry.binding, {
      ...e.entry,
      visibility: e.entry.visibility | (n?.visibility || 0),
    });
  }
  return r.map((e) => ({ entries: [...e.values()].sort(Vn) }));
}
function Un(e, t) {
  return Object.fromEntries(
    t.map((t) => {
      let n = $n(e, t, 0);
      return [
        t.name,
        { typeDefinition: n, group: t.group, binding: t.binding, size: n.size },
      ];
    }),
  );
}
function Wn(e, t, n) {
  return {
    fields: Object.fromEntries(
      t.members.map((t) => [
        t.name,
        { offset: t.offset, type: er(e, t.type, 0) },
      ]),
    ),
    size: t.size,
    offset: n,
  };
}
function Gn(e) {
  if (e.name.includes(`depth`)) return `depth`;
  switch (e.format?.name) {
    case `f32`:
      return `float`;
    case `i32`:
      return `sint`;
    case `u32`:
      return `uint`;
    default:
      throw Error(`unknown texture sample type`);
  }
}
function Kn(e) {
  return e.name.includes(`2d_array`)
    ? `2d-array`
    : e.name.includes(`cube_array`)
      ? `cube-array`
      : e.name.includes(`3d`)
        ? `3d`
        : e.name.includes(`1d`)
          ? `1d`
          : e.name.includes(`cube`)
            ? `cube`
            : `2d`;
}
function qn(e) {
  switch (e.access) {
    case `read`:
      return `read-only`;
    case `write`:
      return `write-only`;
    case `read_write`:
      return `read-write`;
    default:
      throw Error(`unknonw storage texture access`);
  }
}
function Jn(e) {
  return e.name.endsWith(`_comparison`) ? `comparison` : `filtering`;
}
function Yn(e, t) {
  let { binding: n, access: r, type: i } = e;
  switch (e.resourceType) {
    case He.Uniform:
      return {
        binding: n,
        visibility: t,
        buffer: { ...(e.size && { minBindingSize: e.size }) },
      };
    case He.Storage:
      return {
        binding: n,
        visibility: t,
        buffer: {
          type: r === `` || r === `read` ? `read-only-storage` : `storage`,
          ...(e.size && { minBindingSize: e.size }),
        },
      };
    case He.Texture: {
      if (i.name === `texture_external`)
        return { binding: n, visibility: t, externalTexture: {} };
      let e = i.name.includes(`multisampled`);
      return {
        binding: n,
        visibility: t,
        texture: { sampleType: Gn(i), viewDimension: Kn(i), multisampled: e },
      };
    }
    case He.Sampler:
      return { binding: n, visibility: t, sampler: { type: Jn(i) } };
    case He.StorageTexture:
      return {
        binding: n,
        visibility: t,
        storageTexture: {
          access: qn(i),
          format: i.format.name,
          viewDimension: Kn(i),
        },
      };
    default:
      throw Error(`unknown resource type`);
  }
}
function Xn(e, t) {
  let n = {};
  for (let r of e)
    n[r.name] = {
      stage: t,
      resources: r.resources.map((e) => {
        let { name: n, group: r } = e;
        return { name: n, group: r, entry: Yn(e, t) };
      }),
    };
  return n;
}
function Zn(e) {
  let t = new Rn(e),
    n = Object.fromEntries(t.structs.map((e) => [e.name, Wn(t, e, 0)])),
    r = Un(t, t.uniforms),
    i = Un(
      t,
      t.storage.filter((e) => e.resourceType === He.Storage),
    ),
    a = Un(
      t,
      t.storage.filter((e) => e.resourceType === He.StorageTexture),
    ),
    o = Un(
      t,
      t.textures.filter((e) => e.type.name !== `texture_external`),
    );
  return {
    externalTextures: Un(
      t,
      t.textures.filter((e) => e.type.name === `texture_external`),
    ),
    samplers: Un(t, t.samplers),
    structs: n,
    storages: i,
    storageTextures: a,
    textures: o,
    uniforms: r,
    entryPoints: {
      ...Xn(t.entry.vertex, GPUShaderStage.VERTEX),
      ...Xn(t.entry.fragment, GPUShaderStage.FRAGMENT),
      ...Xn(t.entry.compute, GPUShaderStage.COMPUTE),
    },
  };
}
function Qn(e, t = ``) {
  if (!e) throw Error(t);
}
function $n(e, t, n) {
  switch (t.resourceType) {
    case He.Uniform:
    case He.Storage:
    case He.StorageTexture:
      return er(e, t.type, n);
    default:
      return { size: 0, type: t.type.name };
  }
}
function er(e, t, n) {
  if (t.isArray) {
    Qn(!t.isStruct, `struct array is invalid`),
      Qn(!t.isStruct, `template array is invalid`);
    let r = t;
    return {
      size: r.size,
      elementType: er(e, r.format, n),
      numElements: r.count,
    };
  }
  if (t.isStruct)
    return Qn(!t.isTemplate, `template struct is invalid`), Wn(e, t, n);
  {
    let e = t,
      n = t.isTemplate ? `${e.name}<${e.format.name}>` : t.name;
    return { size: t.size, type: n };
  }
}
function tr(e, t) {
  switch (e) {
    case `1d`:
      return `1d`;
    case `3d`:
      return `3d`;
    default:
      return t > 1 ? `2d-array` : `2d`;
  }
}
function nr(e) {
  return [e.width, e.height || 1, e.depthOrArrayLayers || 1];
}
function rr(e) {
  return Array.isArray(e) || Ce(e) ? [...e, 1, 1].slice(0, 3) : nr(e);
}
function ir(e, t) {
  let n = rr(e),
    r = Math.max(...n.slice(0, t === `3d` ? 3 : 2));
  return (1 + Math.log2(r)) | 0;
}
var ar = new WeakMap();
function or(e, t, n) {
  let r = ar.get(e);
  r ||
    ((r = { pipelineByFormatAndViewDimension: {}, moduleByViewDimension: {} }),
    ar.set(e, r));
  let { sampler: i, module: a } = r,
    { pipelineByFormatAndViewDimension: o } = r;
  (n = e.features.has(`core-features-and-limits`)
    ? `2d-array`
    : (n ?? tr(t.dimension, t.depthOrArrayLayers))),
    a ||
      ((a = e.createShaderModule({
        label: `mip level generation for ${n}`,
        code: `
        const faceMat = array(
          mat3x3f( 0,  0,  -2,  0, -2,   0,  1,  1,   1),   // pos-x
          mat3x3f( 0,  0,   2,  0, -2,   0, -1,  1,  -1),   // neg-x
          mat3x3f( 2,  0,   0,  0,  0,   2, -1,  1,  -1),   // pos-y
          mat3x3f( 2,  0,   0,  0,  0,  -2, -1, -1,   1),   // neg-y
          mat3x3f( 2,  0,   0,  0, -2,   0, -1,  1,   1),   // pos-z
          mat3x3f(-2,  0,   0,  0, -2,   0,  1,  1,  -1));  // neg-z

        struct VSOutput {
          @builtin(position) position: vec4f,
          @location(0) texcoord: vec2f,
          @location(1) @interpolate(flat, either) baseArrayLayer: u32,
        };

        @vertex fn vs(
          @builtin(vertex_index) vertexIndex : u32,
          @builtin(instance_index) baseArrayLayer: u32,
        ) -> VSOutput {
          var pos = array<vec2f, 3>(
            vec2f(-1.0, -1.0),
            vec2f(-1.0,  3.0),
            vec2f( 3.0, -1.0),
          );

          var vsOutput: VSOutput;
          let xy = pos[vertexIndex];
          vsOutput.position = vec4f(xy, 0.0, 1.0);
          vsOutput.texcoord = xy * vec2f(0.5, -0.5) + vec2f(0.5);
          vsOutput.baseArrayLayer = baseArrayLayer;
          return vsOutput;
        }

        @group(0) @binding(0) var ourSampler: sampler;

        @group(0) @binding(1) var ourTexture2d: texture_2d<f32>;
        @fragment fn fs2d(fsInput: VSOutput) -> @location(0) vec4f {
          return textureSample(ourTexture2d, ourSampler, fsInput.texcoord);
        }

        @group(0) @binding(1) var ourTexture2dArray: texture_2d_array<f32>;
        @fragment fn fs2darray(fsInput: VSOutput) -> @location(0) vec4f {
          return textureSample(
            ourTexture2dArray,
            ourSampler,
            fsInput.texcoord,
            fsInput.baseArrayLayer);
        }

        @group(0) @binding(1) var ourTextureCube: texture_cube<f32>;
        @fragment fn fscube(fsInput: VSOutput) -> @location(0) vec4f {
          return textureSample(
            ourTextureCube,
            ourSampler,
            faceMat[fsInput.baseArrayLayer] * vec3f(fract(fsInput.texcoord), 1));
        }

        @group(0) @binding(1) var ourTextureCubeArray: texture_cube_array<f32>;
        @fragment fn fscubearray(fsInput: VSOutput) -> @location(0) vec4f {
          return textureSample(
            ourTextureCubeArray,
            ourSampler,
            faceMat[fsInput.baseArrayLayer] * vec3f(fract(fsInput.texcoord), 1), fsInput.baseArrayLayer);
        }
      `,
      })),
      (i = e.createSampler({ minFilter: `linear`, magFilter: `linear` })),
      Object.assign(r, { sampler: i, module: a }));
  let s = `${t.format}.${n}`;
  if (!o[s]) {
    let r = `fs${n.replace(/[\W]/, ``)}`;
    o[s] = e.createRenderPipeline({
      label: `mip level generator pipeline for ${n}`,
      layout: `auto`,
      vertex: { module: a },
      fragment: { module: a, entryPoint: r, targets: [{ format: t.format }] },
    });
  }
  let c = o[s],
    l = e.createCommandEncoder({ label: `mip gen encoder` });
  for (let r = 1; r < t.mipLevelCount; ++r)
    for (let a = 0; a < t.depthOrArrayLayers; ++a) {
      let o = e.createBindGroup({
          layout: c.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: i },
            {
              binding: 1,
              resource: t.createView({
                dimension: n,
                baseMipLevel: r - 1,
                mipLevelCount: 1,
              }),
            },
          ],
        }),
        s = {
          label: `mip gen renderPass`,
          colorAttachments: [
            {
              view: t.createView({
                dimension: `2d`,
                baseMipLevel: r,
                mipLevelCount: 1,
                baseArrayLayer: a,
                arrayLayerCount: 1,
              }),
              loadOp: `clear`,
              storeOp: `store`,
            },
          ],
        },
        u = l.beginRenderPass(s);
      u.setPipeline(c), u.setBindGroup(0, o), u.draw(3, 1, 0, a), u.end();
    }
  let u = l.finish();
  e.queue.submit([u]);
}
var sr = new Map([
    [Int8Array, { formats: [`sint8`, `snorm8`], defaultForType: 1 }],
    [Uint8Array, { formats: [`uint8`, `unorm8`], defaultForType: 1 }],
    [Int16Array, { formats: [`sint16`, `snorm16`], defaultForType: 1 }],
    [Uint16Array, { formats: [`uint16`, `unorm16`], defaultForType: 1 }],
    [Int32Array, { formats: [`sint32`, `snorm32`], defaultForType: 0 }],
    [Uint32Array, { formats: [`uint32`, `unorm32`], defaultForType: 0 }],
    [Float32Array, { formats: [`float32`, `float32`], defaultForType: 0 }],
  ]),
  cr = new Map(
    [...sr.entries()]
      .map(
        ([
          e,
          {
            formats: [t, n],
          },
        ]) => [
          [t, e],
          [n, e],
        ],
      )
      .flat(),
  );
function lr(e) {
  return e === `indices`;
}
function ur(e, t) {
  if (Ce(e)) return e;
  let n = e;
  if (Ce(n.data)) return n.data;
  (Array.isArray(e) || typeof e == `number`) && (n = { data: e });
  let r = n.type;
  return (r ||= lr(t) ? Uint32Array : Float32Array), new r(n.data);
}
function dr(e) {
  return e.length ? e : e.data;
}
var fr = [
  { re: /coord|texture|uv/i, numComponents: 2 },
  { re: /color|colour/i, numComponents: 4 },
];
function pr(e) {
  for (let { re: t, numComponents: n } of fr) if (t.test(e)) return n;
  return 3;
}
function mr(e, t) {
  let n = pr(e);
  if (t % n > 0)
    throw Error(
      `Can not guess numComponents for attribute '${e}'. Tried ${n} but ${t} values is not evenly divisible by ${n}. You should specify it.`,
    );
  return n;
}
function hr(e, t) {
  return e.numComponents || mr(t, dr(e).length);
}
var gr = /(\w+)(?:x(\d))$/;
function _r(e) {
  let t = gr.exec(e),
    [n, r] = t ? [t[1], parseInt(t[2])] : [e, 1];
  return { Type: cr.get(n), numComponents: r };
}
function vr(e, t) {
  let n = Object.getPrototypeOf(e).constructor;
  return new n(t);
}
function yr(e, t = {}) {
  let n = t.interleave === void 0 || t.interleave,
    r = t.stepMode || `vertex`,
    i = t.shaderLocation
      ? Array.isArray(t.shaderLocation)
        ? t.shaderLocation
        : [t.shaderLocation]
      : [0],
    a = 0,
    o = [],
    s = [],
    c = [];
  return (
    Object.keys(e)
      .filter((e) => !lr(e))
      .forEach((t) => {
        let l = e[t],
          u = ur(l, t),
          d = hr(l, t),
          f = d / 4,
          p = d / 3,
          m = f % 1 == 0 ? 4 : p % 1 == 0 ? 3 : 4;
        for (let e = 0; e < d; e += m) {
          let t = Math.min(m, d - e),
            n = a;
          a += t * u.BYTES_PER_ELEMENT;
          let { defaultForType: r, formats: o } = sr.get(
              Object.getPrototypeOf(u).constructor,
            ),
            f = l.normalize,
            p = `${o[f === void 0 ? r : +!!f]}${t > 1 ? `x${t}` : ``}`,
            h = i.shift();
          i.length === 0 && i.push(h + 1),
            s.push({ offset: n, format: p, shaderLocation: h }),
            c.push({ data: u, offset: e, stride: d });
        }
        n ||
          (o.push({ stepMode: r, arrayStride: a, attributes: s.slice() }),
          (a = 0),
          (s.length = 0));
      }),
    s.length && o.push({ stepMode: r, arrayStride: a, attributes: s }),
    { bufferLayouts: o, typedArrays: c }
  );
}
function br(e, t) {
  return Ce(e) ? { data: e, offset: 0, stride: t } : e;
}
function xr(e, t, n, r) {
  let i = new Map(),
    a = (e) => {
      let t = Object.getPrototypeOf(e).constructor,
        n = i.get(t);
      if (n) return n;
      let a = new t(r);
      return i.set(t, a), a;
    };
  e.forEach((e, r) => {
    let { offset: i, format: o } = e,
      { numComponents: s } = _r(o),
      { data: c, offset: l, stride: u } = br(t[r], s),
      d = a(c);
    for (let e = 0; e < c.length; e += u) {
      let t = (i + (e / u) * n) / d.BYTES_PER_ELEMENT,
        r = e + l,
        a = c.subarray(r, r + s);
      d.set(a, t);
    }
  });
}
function Sr(e, t, n = {}) {
  let r = n.usage || 0,
    { bufferLayouts: i, typedArrays: a } = yr(t, n),
    o = [],
    s = -1,
    c = 0;
  for (let { attributes: t, arrayStride: n } of i) {
    let i = t,
      l = i[0],
      { numComponents: u } = _r(l.format),
      { data: d, stride: f } = br(a[c], u);
    s < 0 && (s = d.length / f);
    let p = n * s,
      m = e.createBuffer({
        usage: r | GPUBufferUsage.VERTEX,
        size: p,
        mappedAtCreation: !0,
      }),
      h = m.getMappedRange();
    i.length === 1 && n === d.BYTES_PER_ELEMENT * u
      ? vr(d, h).set(d)
      : xr(i, a.slice(c), n, h),
      m.unmap(),
      o.push(m),
      (c += i.length);
  }
  let l = { numElements: s, bufferLayouts: i, buffers: o },
    u = Object.entries(t).find(([e]) => lr(e));
  if (u) {
    let t = ur(u[1], `indices`),
      n = e.createBuffer({
        size: t.byteLength,
        usage: GPUBufferUsage.INDEX | r,
        mappedAtCreation: !0,
      });
    vr(t, n.getMappedRange()).set(t),
      n.unmap(),
      (l.indexBuffer = n),
      (l.indexFormat = t instanceof Uint16Array ? `uint16` : `uint32`),
      (l.numElements = t.length);
  }
  return l;
}
function Cr(e) {
  let t = e;
  return Ce(t.data) || Array.isArray(t.data);
}
function wr(e) {
  return Ce(e) || Array.isArray(e) || Cr(e);
}
function Tr(e, t) {
  if (Ce(e)) return e;
  let { Type: n } = Ar(t);
  return new n(e);
}
function Er(e, t, n, r = `2d`) {
  if (n % 1 != 0) throw Error(`can't guess dimensions`);
  if (!e && !t) {
    let i = Math.sqrt(n / (r === `cube` ? 6 : 1));
    i % 1 == 0 ? ((e = i), (t = i)) : ((e = n), (t = 1));
  } else if (!t) {
    if (((t = n / e), t % 1)) throw Error(`can't guess dimensions`);
  } else if (!e && ((e = n / t), e % 1)) throw Error(`can't guess dimensions`);
  let i = n / e / t;
  if (i % 1) throw Error(`can't guess dimensions`);
  return [e, t, i];
}
function Dr(e) {
  switch (e) {
    case `1d`:
      return `1d`;
    case `3d`:
      return `3d`;
    default:
      return `2d`;
  }
}
var Or = {
    "8snorm": Int8Array,
    "8unorm": Uint8Array,
    "8sint": Int8Array,
    "8uint": Uint8Array,
    "16snorm": Int16Array,
    "16unorm": Uint16Array,
    "16sint": Int16Array,
    "16uint": Uint16Array,
    "32snorm": Int32Array,
    "32unorm": Uint32Array,
    "32sint": Int32Array,
    "32uint": Uint32Array,
    "16float": Uint16Array,
    "32float": Float32Array,
  },
  kr = /([a-z]+)(\d+)([a-z]+)/;
function Ar(e) {
  let [, t, n, r] = kr.exec(e),
    i = t.length,
    a = parseInt(n) / 8;
  return {
    channels: t,
    numChannels: i,
    bytesPerChannel: a,
    bytesPerElement: i * a,
    Type: Or[`${n}${r}`],
  };
}
function jr(e, t) {
  return [e.width, e.height, e.depthOrArrayLayers].map((e) =>
    Math.max(1, Math.floor(e / 2 ** t)),
  );
}
function Mr(e, t, n, r) {
  let i = Tr(n.data || n, t.format),
    a = jr(t, 0),
    { bytesPerElement: o } = Ar(t.format),
    s = r.origin || [0, 0, 0];
  e.queue.writeTexture(
    { texture: t, origin: s },
    i,
    { bytesPerRow: o * a[0], rowsPerImage: a[1] },
    a,
  );
}
function Nr(e, t, n, r = {}) {
  let i;
  n.forEach((n, a) => {
    let o = [0, 0, a + (r.baseArrayLayer || 0)];
    if (wr(n)) Mr(e, t, n, { origin: o });
    else {
      let a = n,
        s = t,
        c = o;
      t.dimension === `3d` &&
        ((i ??= e.createTexture({
          format: t.format,
          usage: t.usage | GPUTextureUsage.COPY_SRC,
          size: [t.width, t.height, 1],
        })),
        (s = i),
        (c = [0, 0, 0]));
      let { flipY: l, premultipliedAlpha: u, colorSpace: d } = r;
      if (
        (e.queue.copyExternalImageToTexture(
          { source: a, flipY: l },
          { texture: s, premultipliedAlpha: u, colorSpace: d, origin: c },
          Pr(a, r),
        ),
        i)
      ) {
        let n = e.createCommandEncoder();
        n.copyTextureToTexture({ texture: i }, { texture: t, origin: o }, i),
          e.queue.submit([n.finish()]);
      }
    }
  }),
    i && i.destroy(),
    t.mipLevelCount > 1 &&
      or(e, t, r.viewDimension ?? tr(t.dimension, t.depthOrArrayLayers));
}
function Pr(e, t) {
  if (`videoWidth` in e && `videoHeight` in e)
    return [e.videoWidth, e.videoHeight, 1];
  {
    let { width: n, height: r } = e;
    if (n > 0 && r > 0 && !wr(e)) return [n, r, 1];
    let { bytesPerElement: i, bytesPerChannel: a } = Ar(
        t.format || `rgba8unorm`,
      ),
      o = Ce(e) || Array.isArray(e) ? e : e.data;
    return Er(n, r, (Ce(o) ? o.byteLength : o.length * a) / i);
  }
}
function Fr(e, t, n = {}) {
  let r = Pr(t[0], n);
  r[2] = r[2] > 1 ? r[2] : t.length;
  let i = n.viewDimension ?? tr(n.dimension, r[2]),
    a = Dr(i),
    o = e.createTexture({
      dimension: a,
      textureBindingViewDimension: i,
      format: n.format || `rgba8unorm`,
      mipLevelCount: n.mipLevelCount ? n.mipLevelCount : n.mips ? ir(r) : 1,
      size: r,
      usage:
        (n.usage ?? 0) |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
  return Nr(e, o, t, n), o;
}
function Ir(e, t, n = {}) {
  return Fr(e, [t], n);
}
var Lr = class {
  typedArray;
  cursor = 0;
  numComponents;
  constructor(e, t) {
    (this.typedArray = e), (this.numComponents = t);
  }
  get numElements() {
    return this.typedArray.length / this.numComponents;
  }
  push(...e) {
    for (let t of e)
      if (Array.isArray(t) || Ce(t)) {
        let t = e;
        this.typedArray.set(t, this.cursor), (this.cursor += t.length);
      } else this.typedArray[this.cursor++] = t;
  }
  reset(e = 0) {
    this.cursor = e;
  }
};
function X(e, t, n) {
  return new Lr(new n(e * t), e);
}
function Rr(e, t, n) {
  let r = n.constructor;
  return new Lr(new r(e * t), e);
}
function zr({ size: e = 2, xOffset: t = 0, yOffset: n = 0 } = {}) {
  let r = e * 0.5;
  return {
    position: {
      numComponents: 2,
      data: [
        t + -1 * r,
        n + -1 * r,
        t + 1 * r,
        n + -1 * r,
        t + -1 * r,
        n + 1 * r,
        t + 1 * r,
        n + 1 * r,
      ],
    },
    normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
    indices: [0, 1, 2, 2, 1, 3],
  };
}
function Br({
  width: e = 1,
  depth: t = 1,
  subdivisionsWidth: n = 1,
  subdivisionsDepth: r = 1,
} = {}) {
  let i = (n + 1) * (r + 1),
    a = X(3, i, Float32Array),
    o = X(3, i, Float32Array),
    s = X(2, i, Float32Array);
  for (let i = 0; i <= r; i++)
    for (let c = 0; c <= n; c++) {
      let l = c / n,
        u = i / r;
      a.push(e * l - e * 0.5, 0, t * u - t * 0.5),
        o.push(0, 1, 0),
        s.push(l, u);
    }
  let c = n + 1,
    l = X(3, n * r * 2, Uint16Array);
  for (let e = 0; e < r; e++)
    for (let t = 0; t < n; t++)
      l.push((e + 0) * c + t, (e + 1) * c + t, (e + 0) * c + t + 1),
        l.push((e + 1) * c + t, (e + 1) * c + t + 1, (e + 0) * c + t + 1);
  return {
    position: a.typedArray,
    normal: o.typedArray,
    texcoord: s.typedArray,
    indices: l.typedArray,
  };
}
function Vr({
  radius: e = 1,
  subdivisionsAxis: t = 24,
  subdivisionsHeight: n = 12,
  startLatitudeInRadians: r = 0,
  endLatitudeInRadians: i = Math.PI,
  startLongitudeInRadians: a = 0,
  endLongitudeInRadians: o = Math.PI * 2,
} = {}) {
  if (t <= 0 || n <= 0)
    throw Error(`subdivisionAxis and subdivisionHeight must be > 0`);
  let s = i - r,
    c = o - a,
    l = (t + 1) * (n + 1),
    u = X(3, l, Float32Array),
    d = X(3, l, Float32Array),
    f = X(2, l, Float32Array);
  for (let i = 0; i <= n; i++)
    for (let o = 0; o <= t; o++) {
      let l = o / t,
        p = i / n,
        m = c * l + a,
        h = s * p + r,
        g = Math.sin(m),
        _ = Math.cos(m),
        v = Math.sin(h),
        y = Math.cos(h),
        b = _ * v,
        x = y,
        S = g * v;
      u.push(e * b, e * x, e * S), d.push(b, x, S), f.push(1 - l, p);
    }
  let p = t + 1,
    m = X(3, t * n * 2, Uint16Array);
  for (let e = 0; e < t; e++)
    for (let t = 0; t < n; t++)
      m.push((t + 0) * p + e, (t + 0) * p + e + 1, (t + 1) * p + e),
        m.push((t + 1) * p + e, (t + 0) * p + e + 1, (t + 1) * p + e + 1);
  return {
    position: u.typedArray,
    normal: d.typedArray,
    texcoord: f.typedArray,
    indices: m.typedArray,
  };
}
var Hr = [
  [3, 7, 5, 1],
  [6, 2, 0, 4],
  [6, 7, 3, 2],
  [0, 1, 5, 4],
  [7, 6, 4, 5],
  [2, 3, 1, 0],
];
function Ur({ size: e = 1 } = {}) {
  let t = e / 2,
    n = [
      [-t, -t, -t],
      [+t, -t, -t],
      [-t, +t, -t],
      [+t, +t, -t],
      [-t, -t, +t],
      [+t, -t, +t],
      [-t, +t, +t],
      [+t, +t, +t],
    ],
    r = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    i = [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    a = X(3, 24, Float32Array),
    o = X(3, 24, Float32Array),
    s = X(2, 24, Float32Array),
    c = X(3, 12, Uint16Array);
  for (let e = 0; e < 6; ++e) {
    let t = Hr[e];
    for (let c = 0; c < 4; ++c) {
      let l = n[t[c]],
        u = r[e],
        d = i[c];
      a.push(...l), o.push(...u), s.push(...d);
    }
    let l = 4 * e;
    c.push(l + 0, l + 1, l + 2), c.push(l + 0, l + 2, l + 3);
  }
  return {
    position: a.typedArray,
    normal: o.typedArray,
    texcoord: s.typedArray,
    indices: c.typedArray,
  };
}
function Wr({
  bottomRadius: e = 1,
  topRadius: t = 0,
  height: n = 1,
  radialSubdivisions: r = 24,
  verticalSubdivisions: i = 1,
  topCap: a = !0,
  bottomCap: o = !0,
} = {}) {
  if (r < 3) throw Error(`radialSubdivisions must be 3 or greater`);
  if (i < 1) throw Error(`verticalSubdivisions must be 1 or greater`);
  let s = (a ? 2 : 0) + (o ? 2 : 0),
    c = (r + 1) * (i + 1 + s),
    l = X(3, c, Float32Array),
    u = X(3, c, Float32Array),
    d = X(2, c, Float32Array),
    f = X(3, r * (i + s / 2) * 2, Uint16Array),
    p = r + 1,
    m = Math.atan2(e - t, n),
    h = Math.cos(m),
    g = Math.sin(m),
    _ = a ? -2 : 0,
    v = i + (o ? 2 : 0);
  for (let a = _; a <= v; ++a) {
    let o = a / i,
      s = n * o,
      c;
    a < 0
      ? ((s = 0), (o = 1), (c = e))
      : a > i
        ? ((s = n), (o = 1), (c = t))
        : (c = e + (t - e) * (a / i)),
      (a === -2 || a === i + 2) && ((c = 0), (o = 0)),
      (s -= n / 2);
    for (let e = 0; e < p; ++e) {
      let t = Math.sin((e * Math.PI * 2) / r),
        n = Math.cos((e * Math.PI * 2) / r);
      l.push(t * c, s, n * c),
        a < 0
          ? u.push(0, -1, 0)
          : a > i
            ? u.push(0, 1, 0)
            : c === 0
              ? u.push(0, 0, 0)
              : u.push(t * h, g, n * h),
        d.push(e / r, 1 - o);
    }
  }
  for (let e = 0; e < i + s; ++e)
    if (!((e === 1 && a) || (e === i + s - 2 && o)))
      for (let t = 0; t < r; ++t)
        f.push(p * (e + 0) + 0 + t, p * (e + 0) + 1 + t, p * (e + 1) + 1 + t),
          f.push(p * (e + 0) + 0 + t, p * (e + 1) + 1 + t, p * (e + 1) + 0 + t);
  return {
    position: l.typedArray,
    normal: u.typedArray,
    texcoord: d.typedArray,
    indices: f.typedArray,
  };
}
function Gr(e, t = []) {
  t ||= [];
  let n = [];
  for (let r = 0; r < e.length; r += 4) {
    let i = e[r],
      a = e.slice(r + 1, r + 4);
    a.push(...t);
    for (let e = 0; e < i; ++e) n.push(...a);
  }
  return n;
}
function Kr() {
  let e = [
      0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0, 30, 0, 0,
      30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0, 30, 60, 0, 30, 90,
      0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0, 0, 0, 30, 30, 0, 30, 0,
      150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30, 30, 0, 30, 100, 0, 30, 30,
      30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30, 30, 60, 30, 67, 60, 30, 30,
      90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30, 0, 0, 0, 100, 0, 0, 100, 0,
      30, 0, 0, 0, 100, 0, 30, 0, 0, 30, 100, 0, 0, 100, 30, 0, 100, 30, 30,
      100, 0, 0, 100, 30, 30, 100, 0, 30, 30, 30, 0, 30, 30, 30, 100, 30, 30,
      30, 30, 0, 100, 30, 30, 100, 30, 0, 30, 30, 0, 30, 60, 30, 30, 30, 30, 30,
      30, 0, 30, 60, 0, 30, 60, 30, 30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60,
      0, 67, 60, 0, 67, 60, 30, 67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0,
      67, 90, 0, 67, 90, 30, 30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67,
      90, 30, 67, 90, 0, 30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150,
      0, 30, 150, 30, 0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150,
      30, 30, 150, 0, 0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0,
      150, 0,
    ],
    t = [
      0.22, 0.19, 0.22, 0.79, 0.34, 0.19, 0.22, 0.79, 0.34, 0.79, 0.34, 0.19,
      0.34, 0.19, 0.34, 0.31, 0.62, 0.19, 0.34, 0.31, 0.62, 0.31, 0.62, 0.19,
      0.34, 0.43, 0.34, 0.55, 0.49, 0.43, 0.34, 0.55, 0.49, 0.55, 0.49, 0.43, 0,
      0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0,
      1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
      0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1,
      0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0,
      1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0,
      0, 1, 1, 1, 0,
    ],
    n = Gr([
      18, 0, 0, 1, 18, 0, 0, -1, 6, 0, 1, 0, 6, 1, 0, 0, 6, 0, -1, 0, 6, 1, 0,
      0, 6, 0, 1, 0, 6, 1, 0, 0, 6, 0, -1, 0, 6, 1, 0, 0, 6, 0, -1, 0, 6, -1, 0,
      0,
    ]),
    r = Gr(
      [
        18, 200, 70, 120, 18, 80, 70, 200, 6, 70, 200, 210, 6, 200, 200, 70, 6,
        210, 100, 70, 6, 210, 160, 70, 6, 70, 180, 210, 6, 100, 70, 210, 6, 76,
        210, 100, 6, 140, 210, 80, 6, 90, 130, 110, 6, 160, 160, 220,
      ],
      [255],
    ),
    i = e.length / 3,
    a = {
      position: X(3, i, Float32Array),
      texcoord: X(2, i, Float32Array),
      normal: X(3, i, Float32Array),
      color: X(4, i, Uint8Array),
      indices: X(3, i / 3, Uint16Array),
    };
  a.position.push(e), a.texcoord.push(t), a.normal.push(n), a.color.push(r);
  for (let e = 0; e < i; ++e) a.indices.push(e);
  return Object.fromEntries(
    Object.entries(a).map(([e, t]) => [e, t.typedArray]),
  );
}
function qr({
  radius: e = 1,
  height: t = 1,
  radialSubdivisions: n = 24,
  verticalSubdivisions: r = 1,
  topCap: i = !0,
  bottomCap: a = !0,
} = {}) {
  return Wr({
    bottomRadius: e,
    topRadius: e,
    height: t,
    radialSubdivisions: n,
    verticalSubdivisions: r,
    topCap: i,
    bottomCap: a,
  });
}
function Jr({
  radius: e = 1,
  thickness: t = 0.24,
  radialSubdivisions: n = 24,
  bodySubdivisions: r = 12,
  startAngle: i = 0,
  endAngle: a = Math.PI * 2,
} = {}) {
  if (n < 3) throw Error(`radialSubdivisions must be 3 or greater`);
  if (r < 3) throw Error(`verticalSubdivisions must be 3 or greater`);
  let o = a - i,
    s = n + 1,
    c = r + 1,
    l = s * c,
    u = X(3, l, Float32Array),
    d = X(3, l, Float32Array),
    f = X(2, l, Float32Array),
    p = X(3, n * r * 2, Uint16Array);
  for (let a = 0; a < c; ++a) {
    let c = a / r,
      l = c * Math.PI * 2,
      p = Math.sin(l),
      m = e + p * t,
      h = Math.cos(l),
      g = h * t;
    for (let e = 0; e < s; ++e) {
      let t = e / n,
        r = i + t * o,
        a = Math.sin(r),
        s = Math.cos(r),
        l = a * m,
        _ = s * m,
        v = a * p,
        y = s * p;
      u.push(l, g, _), d.push(v, h, y), f.push(t, 1 - c);
    }
  }
  for (let e = 0; e < r; ++e)
    for (let t = 0; t < n; ++t) {
      let n = 1 + t,
        r = 1 + e;
      p.push(s * e + t, s * r + t, s * e + n),
        p.push(s * r + t, s * r + n, s * e + n);
    }
  return {
    position: u.typedArray,
    normal: d.typedArray,
    texcoord: f.typedArray,
    indices: p.typedArray,
  };
}
function Yr({
  radius: e = 1,
  divisions: t = 24,
  stacks: n = 1,
  innerRadius: r = 0,
  stackPower: i = 1,
} = {}) {
  if (t < 3) throw Error(`divisions must be at least 3`);
  let a = (t + 1) * (n + 1),
    o = X(3, a, Float32Array),
    s = X(3, a, Float32Array),
    c = X(2, a, Float32Array),
    l = X(3, n * t * 2, Uint16Array),
    u = 0,
    d = e - r,
    f = t + 1;
  for (let e = 0; e <= n; ++e) {
    let a = r + d * (e / n) ** +i;
    for (let r = 0; r <= t; ++r) {
      let i = (2 * Math.PI * r) / t,
        d = a * Math.cos(i),
        p = a * Math.sin(i);
      if (
        (o.push(d, 0, p),
        s.push(0, 1, 0),
        c.push(1 - r / t, e / n),
        e > 0 && r !== t)
      ) {
        let e = u + (r + 1),
          t = u + r,
          n = u + r - f,
          i = u + (r + 1) - f;
        l.push(e, t, n), l.push(e, n, i);
      }
    }
    u += t + 1;
  }
  return {
    position: o.typedArray,
    normal: s.typedArray,
    texcoord: c.typedArray,
    indices: l.typedArray,
  };
}
function Xr(e) {
  return e !== `indices`;
}
function Zr(e) {
  let t = e.indices,
    n = {},
    r = ur(t, `indices`),
    i = r.length;
  function a(t) {
    let a = ur(e[t], t),
      o = hr(a, t),
      s = Rr(o, i, a);
    for (let e = 0; e < i; ++e) {
      let t = r[e] * o;
      for (let e = 0; e < o; ++e) s.push(a[t + e]);
    }
    n[t] = s.typedArray;
  }
  return Object.keys(e).filter(Xr).forEach(a), n;
}
var Qr = ([e, t, n]) => {
    let r = e * e + t * t + n * n;
    return new Float32Array([e / r, t / r, n / r]);
  },
  $r = (e, t) => {
    let n = new Float32Array(e.length);
    for (let r = 0; r < e.length; ++r) n[r] = e[r] - t[r];
    return n;
  },
  ei = (e, t) => {
    let n = new Float32Array(e.length);
    return (
      (n[0] = e[1] * t[2] - e[2] * t[1]),
      (n[1] = e[2] * t[0] - e[0] * t[2]),
      (n[2] = e[0] * t[1] - e[1] * t[0]),
      n
    );
  };
function ti(e) {
  let t = new Float32Array(e.length);
  for (let n = 0; n < e.length; n += 9) {
    let r = e.subarray(n, n + 3),
      i = e.subarray(n + 3, n + 6),
      a = e.subarray(n + 6, n + 9),
      o = ei(Qr($r(r, i)), Qr($r(r, a)));
    t.set(o, n), t.set(o, n + 3), t.set(o, n + 6);
  }
  return t;
}
var ni = {
    __proto__: null,
    TypedArrayWrapper: Lr,
    create3DFVertices: Kr,
    createCubeVertices: Ur,
    createCylinderVertices: qr,
    createDiscVertices: Yr,
    createPlaneVertices: Br,
    createSphereVertices: Vr,
    createTorusVertices: Jr,
    createTruncatedConeVertices: Wr,
    createXYQuadVertices: zr,
    deindex: Zr,
    generateTriangleNormals: ti,
  },
  ri = class {
    constructor(
      e,
      {
        data: t,
        instancedData: n,
        interleave: r = !1,
        drawBuffer: i = null,
        usage: a = 0,
      } = {},
    ) {
      if (!t)
        throw Error(
          "Geometry: `data` attribute arrays are required — drawBuffer-only geometry without vertex data is not supported",
        );
      (this.attributes = t),
        (this.drawBuffer = i),
        (this.nonInstancedVerts = Sr(e.device, t, { usage: a }));
      let o = {
        stepMode: `instance`,
        interleave: r,
        shaderLocation:
          Math.max(
            -1,
            ...this.nonInstancedVerts.bufferLayouts.flatMap((e) =>
              e.attributes.map((e) => e.shaderLocation),
            ),
          ) + 1,
        usage: a,
      };
      (this.instancedVerts = n ? Sr(e.device, n, o) : {}),
        (this.hasInstancedAttributes =
          this.instancedVerts?.buffers?.length > 0),
        (this.bufferLayouts = [
          ...this.nonInstancedVerts.bufferLayouts,
          ...(this.instancedVerts?.bufferLayouts || []),
        ]),
        (this.numBuffers = this.nonInstancedVerts.buffers.length),
        this.hasInstancedAttributes &&
          (this.numBuffers += this.instancedVerts.buffers.length);
    }
    get instanced() {
      return this.hasInstancedAttributes || !!this.drawBuffer;
    }
    _positionAttr() {
      let e = this.attributes?.position;
      if (!e) return null;
      let t = e.data ?? e;
      return !t || typeof t.length != `number` || t.length === 0
        ? null
        : { data: t, stride: e.numComponents || 3 };
    }
    computeBoundingBox(e = this._positionAttr()) {
      if (!e) return null;
      this.bounds ||= {
        min: new ce(),
        max: new ce(),
        center: new ce(),
        scale: new ce(),
        radius: 1 / 0,
      };
      let { data: t, stride: n } = e,
        { min: r, max: i, center: a, scale: o } = this.bounds;
      r.set(1 / 0, 1 / 0, 1 / 0), i.set(-1 / 0, -1 / 0, -1 / 0);
      let s = n > 2;
      for (let e = 0; e < t.length; e += n) {
        let n = t[e],
          a = t[e + 1];
        (r.x = Math.min(n, r.x)),
          (r.y = Math.min(a, r.y)),
          (i.x = Math.max(n, i.x)),
          (i.y = Math.max(a, i.y)),
          s &&
            ((r.z = Math.min(t[e + 2], r.z)), (i.z = Math.max(t[e + 2], i.z)));
      }
      return (
        s || (r.z = i.z = 0),
        o.copy(i).sub(r),
        a.copy(r).add(i).scale(0.5),
        this.bounds
      );
    }
    computeBoundingSphere(e = this._positionAttr()) {
      if (!e) return null;
      this.bounds || this.computeBoundingBox(e);
      let { data: t, stride: n } = e,
        { center: r } = this.bounds,
        i = 0;
      for (let e = 0; e < t.length; e += n) {
        let a = t[e] - r.x,
          o = t[e + 1] - r.y,
          s = (n > 2 ? t[e + 2] : 0) - r.z;
        i = Math.max(i, a * a + o * o + s * s);
      }
      return (this.bounds.radius = Math.sqrt(i)), this.bounds;
    }
    destroy() {
      for (let e of this.nonInstancedVerts.buffers) e.destroy();
      if (
        (this.nonInstancedVerts.indexBuffer?.destroy(),
        this.hasInstancedAttributes)
      )
        for (let e of this.instancedVerts.buffers) e.destroy();
      this.instancedVerts.indexBuffer?.destroy();
    }
  },
  ii = [-1, 3, 0, 3, -1, 0, -1, -1, 0],
  ai = [0, 2, 2, 0, 0, 0],
  oi = class extends ri {
    constructor(e, { instancedData: t, interleave: n } = {}) {
      super(e, {
        data: {
          position: { data: ii, numComponents: 3, type: Float32Array },
          uv: { data: ai, numComponents: 2, type: Float32Array },
        },
        instancedData: t,
        interleave: n,
      });
    }
  },
  si = class extends ri {
    constructor(e, { instancedData: t, interleave: n, ...r } = {}) {
      super(e, {
        data: ni.createXYQuadVertices(r),
        instancedData: t,
        interleave: n,
      }),
        (this.parameters = r);
    }
  },
  ci = new ce(0, 0, 0),
  li = class {
    constructor({
      canvas: e = null,
      dpr: t = null,
      transparent: n = !1,
      depth: r = !0,
      perDrawSize: i = 1 << 20,
    } = {}) {
      (this.canvas = e),
        (this.dpr = t || Math.min(2, devicePixelRatio)),
        (this.width = 2),
        (this.height = 2),
        (this.perDrawSize = i),
        (this.depth = r),
        (this.transparent = n),
        this.setClearColor(),
        (this.time = 0),
        (this.deltaTime = 0),
        (this.prevTime = 0),
        (this.paused = !1),
        (this.callBacks = new Set()),
        (this.deviceLostHandlers = new Set()),
        (this.deviceRestoredHandlers = new Set()),
        (this.resizeHandlers = new Set()),
        (this.errorHandlers = new Set()),
        (this._contexts = new Set()),
        (this.ready = he()),
        (this.isReady = !1),
        (this._initialized = !1),
        (this._bootPromises = []),
        (this._bootStarted = !1),
        (this.bootProgressHandlers = new Set()),
        (this.bootCompleteHandlers = new Set()),
        this.initDevice();
    }
    async initDevice() {
      if (!navigator.gpu) {
        let e = this._initialized
          ? `[webgpu] device recovery failed — could not re-acquire an adapter/device; engine halted`
          : `this browser does not support WebGPU`;
        console.error(e), this.ready.reject(Error(e));
        return;
      }
      let e = await navigator.gpu?.requestAdapter({
        powerPreference: `high-performance`,
      });
      if (!e) {
        let e = this._initialized
          ? `[webgpu] device recovery failed — could not re-acquire an adapter/device; engine halted`
          : `this browser supports webgpu but it appears disabled`;
        console.error(e), this.ready.reject(Error(e));
        return;
      }
      let t = [
          `bgra8unorm-storage`,
          `core-features-and-limits`,
          `depth-clip-control`,
          `depth32float-stencil8`,
          `float32-blendable`,
          `float32-filterable`,
          `indirect-first-instance`,
          `rg11b10ufloat-renderable`,
          `shader-f16`,
          `texture-compression-astc`,
          `texture-compression-astc-sliced-3d`,
          `texture-compression-bc`,
          `texture-compression-bc-sliced-3d`,
          `texture-compression-etc2`,
          `timestamp-query`,
          `texture-formats-tier1`,
          `texture-formats-tier2`,
        ],
        n = t.filter((t) => e.features.has(t)),
        r = t.filter((t) => !e.features.has(t));
      r.length &&
        console.warn(
          `WebGPU features unavailable on this adapter:`,
          r.join(`, `),
        );
      let i = await e?.requestDevice({
        requiredLimits: {
          maxBufferSize: Math.min(2147483644, e.limits.maxBufferSize),
          maxStorageBufferBindingSize: Math.min(
            2147483644,
            e.limits.maxStorageBufferBindingSize,
          ),
          maxStorageTexturesPerShaderStage: Math.min(
            8,
            e.limits.maxStorageTexturesPerShaderStage,
          ),
        },
        requiredFeatures: n,
      });
      if (
        (window.ktx ||
          (typeof window.createKtxReadModule == `function`
            ? (window.ktx = await window.createKtxReadModule({
                locateFile: (e) =>
                  e.endsWith(`.wasm`) ? `./libktx_read.wasm` : e,
              }))
            : console.warn(
                `[webgpu] libktx_read.js not loaded — KTX textures unavailable`,
              )),
        this._destroyed)
      ) {
        i.destroy();
        return;
      }
      i.addEventListener(`uncapturederror`, (e) => {
        this.errorHandlers.forEach((t) => t?.(e.error, e));
      }),
        (this.gpuAverage ??= new me()),
        (this.timingHelper = new P(i)),
        i.lost.then((e) => {
          (this.gpu?.device && this.gpu.device !== i) || this._onDeviceLost(e);
        }),
        this._initialized ? this._restore(i) : this.init(i);
    }
    init(e) {
      this.canvas ||
        ((this.canvas = document.createElement(`canvas`)),
        (this.canvas.id = `web-gpu-canvas`),
        document.body.appendChild(this.canvas),
        (this._ownsCanvas = !0)),
        this._configureContext(e),
        (this.perDraw = new ge(this.gpu, { size: this.perDrawSize })),
        (this.isReady = !0),
        (this._initialized = !0),
        (this._debug = new URLSearchParams(location.search).has(`debug`)),
        this.addHandlers(),
        this._startLoop(),
        this.ready.resolve();
    }
    _configureContext(e) {
      (this.gpu = this.canvas.getContext(`webgpu`)),
        (this.gpu.device = e),
        (this.gpu.renderer = this),
        (this.presentationFormat = navigator.gpu.getPreferredCanvasFormat());
      let t = this.transparent ? ve.PREMULTIPLIED : ve.OPAQUE;
      this.gpu.configure({
        device: e,
        format: this.presentationFormat,
        alphaMode: t,
      }),
        (this.gpu.presentationFormat = this.presentationFormat),
        (this.gpu.alphaMode = t),
        (this.gpu.TRIANGLE = new oi(this.gpu)),
        (this.gpu.QUAD = new si(this.gpu));
    }
    _onDeviceLost(e) {
      this._destroyed ||
        (console.error(
          `WebGPU device was lost: ${e.message} (reason: ${e.reason})`,
        ),
        (this.isReady = !1),
        (this._deviceLost = !0),
        this.deviceLostHandlers.forEach((t) => t?.(e)),
        e.reason !== `destroyed` && this.initDevice());
    }
    _restore(e) {
      this._configureContext(e),
        (this.depthTexture = null),
        (this._depthView = null),
        this.depth && this.createDepthTexture(),
        (this.perDraw = new ge(this.gpu, { size: this.perDrawSize })),
        (this.isReady = !0),
        (this._deviceLost = !1),
        this.deviceRestoredHandlers.forEach((e) => e?.(this.gpu)),
        this._startLoop(),
        console.log(`[webgpu] device restored`);
    }
    _startLoop() {
      this._loopRunning ||
        ((this._loopRunning = !0),
        (this._rafHandle = requestAnimationFrame(this.update)));
    }
    createDepthTexture() {
      this.depthTexture && this?.depthTexture?.destroy?.(),
        (this.depthTexture = this.gpu.device.createTexture({
          size: [this.gpu.canvas.width, this.gpu.canvas.height],
          format: _e.DEPTH24PLUS,
          usage:
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        })),
        (this._depthView = null);
    }
    addHandlers() {
      this._resizeObserver = new ResizeObserver(this.handleResize);
      try {
        this._resizeObserver.observe(this.canvas, {
          box: `device-pixel-content-box`,
        });
      } catch {
        this._resizeObserver.observe(this.canvas, { box: `content-box` });
      }
      document.addEventListener(
        `visibilitychange`,
        this.handleVisibilityChange,
      );
    }
    handleResize = (e) => {
      for (let t of e) {
        let e = Math.round(t.contentBoxSize[0].inlineSize * this.dpr),
          n = Math.round(t.contentBoxSize[0].blockSize * this.dpr),
          r = t.devicePixelContentBoxSize?.[0].inlineSize ?? 0,
          i = t.devicePixelContentBoxSize?.[0].blockSize ?? 0,
          a = this.dpr >= devicePixelRatio && r >= e * 0.75 && i >= n * 0.75,
          o = a ? r : e,
          s = a ? i : n,
          c = t.target;
        (c.width = this.width =
          Math.max(
            1,
            Math.min(o, this.gpu.device.limits.maxTextureDimension2D),
          )),
          (c.height = this.height =
            Math.max(
              1,
              Math.min(s, this.gpu.device.limits.maxTextureDimension2D),
            )),
          this.depth && this.createDepthTexture();
      }
      for (let e of this.resizeHandlers) e(this.width, this.height);
    };
    addResizeHandler(e) {
      return this.resizeHandlers.add(e), () => this.resizeHandlers.delete(e);
    }
    handleVisibilityChange = () => {
      document.visibilityState === `hidden` ? this.pause() : this.resume();
    };
    add(e) {
      this.callBacks.add(e);
    }
    remove(e) {
      this.callBacks.delete(e);
    }
    addDeviceLostHandler(e) {
      return (
        this.deviceLostHandlers.add(e), () => this.deviceLostHandlers.delete(e)
      );
    }
    addDeviceRestoredHandler(e) {
      return (
        this.deviceRestoredHandlers.add(e),
        () => this.deviceRestoredHandlers.delete(e)
      );
    }
    addErrorHandler(e) {
      return this.errorHandlers.add(e), () => this.errorHandlers.delete(e);
    }
    addBootProgressHandler(e) {
      return (
        this.bootProgressHandlers.add(e),
        () => this.bootProgressHandlers.delete(e)
      );
    }
    addBootCompleteHandler(e) {
      return (
        this.bootCompleteHandlers.add(e),
        () => this.bootCompleteHandlers.delete(e)
      );
    }
    forceDeviceLoss() {
      this._onDeviceLost({
        reason: `simulated`,
        message: `forced via forceDeviceLoss()`,
      });
    }
    destroy() {
      this._destroyed ||
        ((this._destroyed = !0),
        (this.isReady = !1),
        (this._loopRunning = !1),
        this._rafHandle && cancelAnimationFrame(this._rafHandle),
        this._resizeObserver?.disconnect(),
        document.removeEventListener(
          `visibilitychange`,
          this.handleVisibilityChange,
        ),
        this.callBacks.clear(),
        this.deviceLostHandlers.clear(),
        this.deviceRestoredHandlers.clear(),
        this.resizeHandlers.clear(),
        this.errorHandlers.clear(),
        this.bootProgressHandlers.clear(),
        this.bootCompleteHandlers.clear(),
        this._contexts.forEach((e) => {
          e.depthTexture?.destroy(),
            (e.depthTexture = e.depthView = null),
            e.unconfigure?.();
        }),
        this._contexts.clear(),
        this.depthTexture?.destroy(),
        (this.depthTexture = this._depthView = null),
        this.perDraw?.buffer?.destroy(),
        (this.perDraw = null),
        this.gpu?.device?.destroy(),
        this.gpu?.unconfigure?.(),
        (this.gpu = null),
        this._ownsCanvas && this.canvas.remove());
    }
    pause = () => {
      this.paused = !0;
    };
    resume = () => {
      (this.prevTime = 0), (this.paused = !1);
    };
    setClearColor({
      r: e = 0,
      g: t = 0,
      b: n = 0,
      a: r = +!this.transparent,
    } = {}) {
      this.clearColor = { r: e, g: t, b: n, a: r };
    }
    trackCompile(e) {
      e &&
        (this._bootPromises.push(e),
        e.finally(() => {
          (this._bootSettled = (this._bootSettled || 0) + 1),
            this._setProgress(
              (this._bootSettled / this._bootPromises.length) * 100,
            );
        }));
    }
    _setProgress(e) {
      let t = Math.max(this._bootProgress || 0, Math.min(100, e));
      (this._bootProgress = t),
        this.bootProgressHandlers.forEach((e) => e?.(t));
    }
    async _startBoot() {
      if (this._bootStarted) return;
      this._bootStarted = !0;
      let e = performance.now(),
        t = setTimeout(() => this._completeBoot(), 8e3),
        n = -1;
      for (; this._bootPromises.length !== n; )
        (n = this._bootPromises.length),
          await Promise.allSettled(this._bootPromises),
          await new Promise((e) => requestAnimationFrame(e));
      await new Promise((e) => requestAnimationFrame(e)),
        await new Promise((e) => requestAnimationFrame(e));
      let r = 350 - (performance.now() - e);
      r > 0 && (await new Promise((e) => setTimeout(e, r))),
        clearTimeout(t),
        this._setProgress(100),
        this._completeBoot();
    }
    _completeBoot() {
      this._bootComplete ||
        ((this._bootComplete = !0),
        this.bootCompleteHandlers.forEach((e) => e?.()));
    }
    updateClock(e = 0) {
      (this.deltaTime = this.prevTime ? (e - this.prevTime) / 1e3 : 0),
        (this.prevTime = e),
        (this.time += this.deltaTime);
    }
    sortOpaque(e, t) {
      return e.renderOrder === t.renderOrder
        ? e.pipeline.id === t.pipeline.id
          ? e.zDepth === t.zDepth
            ? t.id - e.id
            : e.zDepth - t.zDepth
          : e.pipeline.id - t.pipeline.id
        : e.renderOrder - t.renderOrder;
    }
    sortTransparent(e, t) {
      return e.renderOrder === t.renderOrder
        ? e.zDepth === t.zDepth
          ? t.id - e.id
          : t.zDepth - e.zDepth
        : e.renderOrder - t.renderOrder;
    }
    sortUI(e, t) {
      return e.renderOrder === t.renderOrder
        ? e.pipeline.id === t.pipeline.id
          ? t.id - e.id
          : e.pipeline.id - t.pipeline.id
        : e.renderOrder - t.renderOrder;
    }
    getRenderQueue({
      scene: e,
      camera: t,
      sort: n = !0,
      frustumCull: r = !0,
    } = {}) {
      this.renderQueue = [];
      let i = r && !!t;
      if (
        (i && t.updateFrustum(),
        e.traverse((e) => {
          if (!e.visible) return !0;
          e.manualRender ||
            (e.draw &&
              ((i && e.frustumCulled && !t.frustumIntersectsMesh(e)) ||
                this.renderQueue.push(e)));
        }),
        n)
      ) {
        let e = [],
          n = [],
          r = [];
        this.renderQueue.forEach((i) => {
          i.pipeline.transparent
            ? i.pipeline.depthTest
              ? n.push(i)
              : r.push(i)
            : e.push(i),
            (i.zDepth = 0),
            i.pipeline.depthTest &&
              t &&
              (i.worldMatrix.getTranslation(ci),
              ci.applyMat4(t.projectionViewMatrix),
              (i.zDepth = ci[2]));
        }),
          e.sort(this.sortOpaque),
          n.sort(this.sortTransparent),
          r.sort(this.sortUI),
          (this.renderQueue = e.concat(n, r));
      }
      return this.renderQueue;
    }
    setContext(e = null, t) {
      if (!this.gpu) return;
      let n = e || this.canvas;
      if (n === this.gpu.canvas) return;
      (this.gpu.depthTexture = this.depthTexture),
        (this.gpu.depthView = this._depthView);
      let r = this.contextFor(n, t);
      (this.gpu = r),
        (this.depthTexture = r.depthTexture ?? null),
        (this._depthView = r.depthView ?? null);
    }
    contextFor(e, { transparent: t, format: n } = {}) {
      let r = e.getContext(`webgpu`),
        i = n ?? r.presentationFormat ?? this.presentationFormat,
        a =
          t === void 0
            ? (r.alphaMode ?? (this.transparent ? ve.PREMULTIPLIED : ve.OPAQUE))
            : t
              ? ve.PREMULTIPLIED
              : ve.OPAQUE,
        o = r.device !== this.gpu.device;
      return !o && r.presentationFormat === i && r.alphaMode === a
        ? r
        : (r.configure({ device: this.gpu.device, format: i, alphaMode: a }),
          Object.assign(r, {
            device: this.gpu.device,
            renderer: this,
            presentationFormat: i,
            alphaMode: a,
            TRIANGLE: this.gpu.TRIANGLE,
            QUAD: this.gpu.QUAD,
            depthTexture: o ? null : (r.depthTexture ?? null),
            depthView: o ? null : (r.depthView ?? null),
          }),
          this._contexts.add(r),
          r);
    }
    _targetPassDescriptor(
      e,
      { loadOp: t, storeOp: n, depthLoadOp: r, depthStoreOp: i },
    ) {
      let a = e.msaaTextures.length > 0,
        o = [];
      return (
        e.textures.forEach((r, i) => {
          r.isDestroyed ||
            o.push({
              view: a ? e.msaaTextures[i]?.createView?.() : r?.createView?.(),
              ...(a && { resolveTarget: r?.createView?.() }),
              clearValue:
                r?.clearValue ||
                (i === 0 ? this.clearColor : { r: 0, g: 0, b: 0, a: 0 }),
              loadOp: t,
              storeOp: n,
            });
        }),
        e.depthTexture
          ? {
              colorAttachments: o,
              depthStencilAttachment: {
                view: e?.depthView?.(),
                depthClearValue: 1,
                depthLoadOp: r,
                depthStoreOp: i,
              },
            }
          : { colorAttachments: o }
      );
    }
    _canvasPassDescriptor({
      loadOp: e,
      storeOp: t,
      depthLoadOp: n,
      depthStoreOp: r,
    }) {
      let { width: i, height: a } = this.gpu.canvas;
      this.depth &&
        (!this.depthTexture ||
          this.depthTexture.width !== i ||
          this.depthTexture.height !== a) &&
        this.createDepthTexture();
      let o = {
        colorAttachments: [
          {
            view: this?.gpu?.getCurrentTexture()?.createView?.(),
            clearValue: this.clearColor,
            loadOp: e,
            storeOp: t,
          },
        ],
      };
      return (
        this.depthTexture &&
          ((this._depthView ??= this.depthTexture.createView()),
          (o.depthStencilAttachment = {
            view: this._depthView,
            depthClearValue: 1,
            depthLoadOp: n,
            depthStoreOp: r,
          })),
        o
      );
    }
    render({
      scene: e,
      camera: t,
      target: n = null,
      loadOp: r = `clear`,
      storeOp: i = `store`,
      depthLoadOp: a = `clear`,
      depthStoreOp: o = `store`,
      timing: s = !1,
      encoder: c = null,
      frustumCull: l = !0,
      updateMatrices: u = !0,
    } = {}) {
      try {
        if (!this.gpu?.device) {
          console.error(`No device found`);
          return;
        }
        if (!this.isReady || this.paused) return;
        this._debug && !c && n === null && (s = !0),
          c && (s = !1),
          this._bootStarted || this._startBoot(),
          u && (t?.updateMatrixWorld?.(), e?.updateMatrixWorld?.());
        let d = { loadOp: r, storeOp: i, depthLoadOp: a, depthStoreOp: o },
          f = n
            ? this._targetPassDescriptor(n, d)
            : this._canvasPassDescriptor(d),
          p =
            c ||
            this.gpu.device.createCommandEncoder({ label: `renderer-encoder` }),
          m = s
            ? this.timingHelper.beginRenderPass(p, f)
            : p.beginRenderPass(f);
        this.getRenderQueue({ scene: e, camera: t, frustumCull: l });
        let h = n
          ? [n.width, n.height]
          : [this.gpu.canvas.width, this.gpu.canvas.height];
        if (
          (this.renderQueue?.forEach?.((e) => {
            e.draw({ camera: t, pass: m, time: this.time, resolution: h });
          }),
          m.end(),
          c)
        )
          return;
        this.gpu.device.queue.submit([p.finish()]),
          s &&
            this.timingHelper
              .getResult()
              .then((e) => {
                this.gpuAverage.addSample(e / 1e3), (this._gpuMs = e / 1e6);
              })
              .catch(() => {});
      } finally {
        this.setContext(null);
      }
    }
    update = (e) => {
      if (!this.isReady || !this.gpu?.device) {
        this._loopRunning = !1;
        return;
      }
      (this._rafHandle = requestAnimationFrame(this.update)),
        !this.paused &&
          (this.perDraw?.reset(),
          this.updateClock(e),
          this.callBacks.forEach(
            (e) => e && e({ time: this.time, deltaTime: this.deltaTime }),
          ));
    };
  },
  ui = () => {};
function di(e) {
  return ui;
}
var fi =
    /(?:@id\s*\(\s*\d+\s*\)\s*)?override\s+([A-Za-z_]\w*)\s*(?::\s*([A-Za-z_][\w<>]*))?\s*(?:=\s*([^;]+?))?\s*;/g,
  pi = /^\s*const\s+([A-Za-z_]\w*)\s*(?::[^=]*)?\s*=\s*([^;]+?)\s*;/gm;
function mi(e, t) {
  if (typeof e == `boolean`) return e ? `true` : `false`;
  let n = t || ``;
  return n === `i32` || n === `u32`
    ? String(Math.trunc(e))
    : n === `f32` || n === `f16`
      ? Number.isInteger(e)
        ? e.toFixed(1)
        : String(e)
      : Number.isInteger(e)
        ? String(e)
        : String(e) + `f`;
}
function hi(e) {
  let t = e.replace(/\b(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)[uifh]\b/g, `$1`);
  if (!/[a-zA-Z_]/.test(t) && !/[^0-9\s+\-*/%^()|&<>.!~]/.test(t))
    try {
      let e = Function(`"use strict"; return (` + t + `)`)();
      return typeof e == `number` && isFinite(e) ? e : void 0;
    } catch {
      return;
    }
}
function gi(e, t) {
  let n = e;
  for (let [e, r] of Object.entries(t))
    n = n.replace(RegExp(`\\b${e}\\b`, `g`), String(r));
  return n;
}
function _i(e, t = {}) {
  let n = {};
  for (let [, t, r] of e.matchAll(pi)) {
    let e = hi(r.trim());
    e !== void 0 && (n[t] = e);
  }
  return e.replace(fi, (e, r, i, a) => {
    let o = t[r] !== void 0 && t[r] !== null,
      s;
    if (o) {
      let e = t[r];
      typeof e == `number` && (n[r] = e), (s = mi(e, i));
    } else if (a !== void 0) {
      let e = gi(a.trim(), n),
        t = hi(e);
      t === void 0
        ? (s = e)
        : (typeof t == `number` && (n[r] = t), (s = mi(t, i)));
    } else
      return (
        console.error(
          `[wgslOverrides] override '${r}' has no default and no value supplied`,
        ),
        e
      );
    return i ? `const ${r}: ${i} = ${s};` : `const ${r} = ${s};`;
  });
}
var vi = 1,
  yi = class {
    constructor(
      e,
      {
        label: t = `rendering`,
        code: n = ``,
        vertexBuffers: r = [],
        targets: i,
        depthTest: a = !0,
        depthWrite: o = !0,
        depthStencil: s = {},
        transparent: c = !1,
        cullMode: l = `back`,
        topology: u = `triangle-list`,
        blending: d = {},
        sampleCount: f = 1,
        constants: p = {},
      } = {},
    ) {
      if (!e)
        throw Error(`[render-pipeline ${t}] no webgpu context (gpu) provided`);
      if (!n) throw Error(`[render-pipeline ${t}] no shader code provided`);
      (this.label = t),
        (this.gpu = e),
        (this.depthTest = a),
        (this.depthWrite = o),
        (this.depthStencil = s),
        (this.transparent = c),
        (this.cullMode = l),
        (this.id = vi++),
        (this.vertexBuffers = r),
        (this._buildOpts = {
          targets: i,
          topology: u,
          blending: d,
          sampleCount: f,
          constants: p,
        });
      try {
        this.build(n);
      } catch (e) {
        throw Error(
          `[render-pipeline ${t}] shader build failed: ${e.message}`,
          { cause: e },
        );
      }
      this._unregister = di(this);
    }
    build(e) {
      this.code = e;
      let {
          targets: t,
          topology: n,
          blending: r,
          sampleCount: i,
          constants: a,
        } = this._buildOpts,
        o = _i(e, a);
      (this.module = this.gpu.device.createShaderModule({
        label: this.label,
        code: o,
      })),
        (this.defs = Zn(o));
      let s = t?.length > 0 ? t : [{ format: this.gpu.presentationFormat }],
        c = r;
      (this.transparent || c.color) &&
        ((c = c.color
          ? {
              alpha: {
                srcFactor: ye.SRC_ALPHA,
                dstFactor: ye.ONE_MINUS_SRC_ALPHA,
              },
              ...c,
            }
          : {
              color: {
                srcFactor: ye.SRC_ALPHA,
                dstFactor: ye.ONE_MINUS_SRC_ALPHA,
              },
              alpha: {
                srcFactor: ye.SRC_ALPHA,
                dstFactor: ye.ONE_MINUS_SRC_ALPHA,
              },
            }),
        (s = s.map((e) => ({ ...e, blend: c }))));
      let l = {
        vertex: {
          entryPoint: `vs`,
          module: this.module,
          buffers: this.vertexBuffers,
        },
        multisample: { count: i },
      };
      this.defs.entryPoints?.fs &&
        (l.fragment = { entryPoint: `fs`, module: this.module, targets: s });
      let u = Hn(this.defs, l),
        d = u[0]?.entries?.find((e) => e.binding === 0 && e.buffer);
      d && (d.buffer.hasDynamicOffset = !0),
        (this.hasDynamicUniform = !!d),
        (this._bindGroupLayouts = u.map((e) =>
          this.gpu.device.createBindGroupLayout(e),
        ));
      let f = this.gpu.device.createPipelineLayout({
          bindGroupLayouts: this._bindGroupLayouts,
        }),
        p =
          this.depthStencil && Object.keys(this.depthStencil).length
            ? this.depthStencil
            : this.depthStencil
              ? {
                  depthWriteEnabled: this.depthWrite,
                  depthCompare: this.depthTest ? `less` : `always`,
                  format: _e.DEPTH24PLUS,
                }
              : null;
      this.pipeline = this.gpu.device.createRenderPipeline({
        label: this.label,
        layout: f,
        ...l,
        primitive: { cullMode: this.cullMode, topology: n },
        ...(p ? { depthStencil: p } : {}),
      });
    }
    bindGroupLayout(e = 0) {
      return this._bindGroupLayouts[e];
    }
    reload(e) {
      try {
        this.build(e),
          console.log(`[hot] reloaded render pipeline '${this.label}'`);
      } catch (e) {
        console.error(
          `[hot] failed to reload render pipeline '${this.label}'`,
          e,
        );
      }
    }
    destroy() {
      this._unregister?.();
    }
  };
function bi(
  e,
  {
    pipeline: t,
    geometry: n,
    targetView: r,
    bindGroup: i,
    clear: a = !0,
    label: o,
  } = {},
) {
  let s = e.beginRenderPass({
    label: o,
    colorAttachments: [
      {
        view: r,
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: a ? `clear` : `load`,
        storeOp: `store`,
      },
    ],
  });
  s.setPipeline(t.pipeline),
    s.setBindGroup(0, i, t.hasDynamicUniform ? [0] : []);
  let c = n.nonInstancedVerts;
  c.buffers.forEach((e, t) => s.setVertexBuffer(t, e)),
    c.indexBuffer
      ? (s.setIndexBuffer(c.indexBuffer, c.indexFormat),
        s.drawIndexed(c.numElements))
      : s.draw(c.numElements),
    s.end();
}
function xi(e, t = 0, n = 1) {
  return Math.min(Math.max(e, t), n);
}
function Si(e, t) {
  return 1 - Math.exp(-e * t);
}
function Ci(e) {
  let t = e >>> 0;
  return (e = 0, n = 1) => {
    t = (t + 1831565813) >>> 0;
    let r = t;
    return (
      (r = Math.imul(r ^ (r >>> 15), r | 1)),
      (r ^= r + Math.imul(r ^ (r >>> 7), r | 61)),
      e + (((r ^ (r >>> 14)) >>> 0) / 4294967296) * (n - e)
    );
  };
}
function wi(e) {
  return e < 0.04045
    ? e * 0.0773993808
    : (e * 0.9478672986 + 0.0521327014) ** 2.4;
}
function Ti(e) {
  let t = Number.parseInt(e.replace(`#`, ``), 16);
  return [
    wi(((t >> 16) & 255) / 255),
    wi(((t >> 8) & 255) / 255),
    wi((t & 255) / 255),
  ];
}
function Ei(e, t, n) {
  let r = document.createElement(`canvas`);
  (r.height = t), (r.width = e);
  let i = r.getContext(`2d`, n);
  if (!i) throw Error(`2D canvas is required for the textures.`);
  return { canvas: r, context: i };
}
function Di(e) {
  let { canvas: t, context: n } = Ei(512, 512);
  (n.fillStyle = `#808080`), n.fillRect(0, 0, 512, 512);
  for (let t = 256; t > 0; t -= e(0.6, 2.2)) {
    let r = Math.round(e(70, 190));
    n.beginPath(),
      n.arc(256, 256, t, 0, Math.PI * 2),
      (n.fillStyle = `rgb(${r} ${r} ${r})`),
      n.fill();
  }
  return t;
}
var Oi = { height: 1080, width: 1920 },
  ki = { height: 360, width: 640 },
  Ai = { height: 54, width: 96 },
  ji = { height: 16, width: 28 };
async function Mi(e) {
  let t = new Image(),
    n = URL.createObjectURL(e);
  t.src = n;
  try {
    await t.decode();
  } finally {
    URL.revokeObjectURL(n);
  }
  return t;
}
function Ni(e, t) {
  let { height: n, width: r } = ki;
  (e.fillStyle = `#000`),
    e.fillRect(0, 0, r, n),
    (e.fillStyle = `#fff`),
    (e.textBaseline = `top`),
    (e.font = `700 92px "Helvetica Neue", Helvetica, Arial, sans-serif`);
  let i = t.name.toUpperCase().split(` `),
    a = ``,
    o = 36;
  for (let t of i) {
    let n = a ? `${a} ${t}` : t;
    e.measureText(n).width > r - 64 && a
      ? (e.fillText(a, 32, o), (a = t), (o += 92))
      : (a = n);
  }
  e.fillText(a, 32, o),
    (e.font = `500 22px "Helvetica Neue", Helvetica, Arial, sans-serif`),
    e.fillText(t.client.toUpperCase(), 34, n - 56);
}
function Pi(e) {
  let t = document.createElement(`video`);
  return (
    (t.loop = !0),
    (t.muted = !0),
    (t.playsInline = !0),
    (t.preload = `metadata`),
    (t.src = e),
    t
  );
}
function Fi(e, t) {
  let { data: n } = e.getImageData(0, 0, Ai.width, Ai.height);
  for (let e = 0; e < t.length; e++) {
    let r = n[e * 4] ?? 0,
      i = n[e * 4 + 1] ?? 0,
      a = n[e * 4 + 2] ?? 0;
    t[e] = (r * 0.2126 + i * 0.7152 + a * 0.0722) / 255;
  }
}
function Ii(e) {
  return !!e.video && e.video.readyState >= 2 && !e.video.paused;
}
function Li(e) {
  e.video &&
    Ii(e) &&
    (e.pixelsContext.drawImage(e.video, 0, 0, ji.width, ji.height),
    e.sample.drawImage(e.video, 0, 0, Ai.width, Ai.height),
    Fi(e.sample, e.luminance));
}
function Ri(e, t = e.image, n = e.image) {
  e.pixelsContext.drawImage(t, 0, 0, ji.width, ji.height),
    e.sample.drawImage(n, 0, 0, Ai.width, Ai.height),
    Fi(e.sample, e.luminance),
    (e.isBright =
      e.luminance.reduce((e, t) => e + t, 0) / e.luminance.length > 0.55);
}
function zi(e) {
  let t = Ei(ki.width, ki.height);
  e.image
    ? ((t.context.fillStyle = `#000`),
      t.context.fillRect(0, 0, ki.width, ki.height))
    : Ni(t.context, e);
  let n = Ei(ji.width, ji.height),
    r = Ei(Ai.width, Ai.height, { willReadFrequently: !0 }),
    i,
    a = {
      image: t.canvas,
      isBright: !1,
      load: () =>
        e.image
          ? ((i ??= (async () => {
              a.state = `loading`;
              try {
                let t = await fetch(e.image).then((e) => e.blob());
                a.image = await Mi(t);
                let [n, r] = await Promise.all([
                  createImageBitmap(t, {
                    resizeHeight: ji.height,
                    resizeQuality: `low`,
                    resizeWidth: ji.width,
                  }),
                  createImageBitmap(t, {
                    resizeHeight: Ai.height,
                    resizeQuality: `low`,
                    resizeWidth: Ai.width,
                  }),
                ]);
                Ri(a, n, r), n.close(), r.close();
              } catch {}
              a.state = `ready`;
            })()),
            i)
          : Promise.resolve(),
      luminance: new Float32Array(Ai.width * Ai.height),
      pixels: n.canvas,
      pixelsContext: n.context,
      sample: r.context,
      state: e.image ? `idle` : `ready`,
      video: e.video ? Pi(e.video) : void 0,
    };
  return Ri(a), a;
}
function Bi(e) {
  return e.map(zi);
}
async function Vi(e) {
  for (let t of e) await t.load();
}
var Hi = {
    "0cb0f81c4b74": {
      video: `./projects/minidiscs.d5973134.mp4`,
      image: `./projects/minidiscs.99f4fef8.webp`,
    },
    df4b17f4ae02: {
      video: `./projects/age-of-learning.b4dba46c.mp4`,
      image: `./projects/age-of-learning.fa184285.webp`,
    },
    c0449efe5104: { image: `./projects/gudu-records.6574f7cd.webp` },
    caf7d3f99237: { image: `./projects/nasa-force.f6c3662e.webp` },
    "norm-law": {
      video: `./projects/norm-law.5d7faf31.mp4`,
      image: `./projects/norm-law.fec71be8.webp`,
    },
    c454ec9a8a11: { image: `./projects/expa.27b8ea09.webp` },
    f0edc6075ef8: { image: `./projects/zerotrillion.e17c3d87.webp` },
    c04aede2560f: {
      video: `./projects/norm-ai-2026.3acce411.mp4`,
      image: `./projects/norm-ai-2026.3f72b9fa.webp`,
    },
    "7b3e91d04a6c": {
      video: `./projects/norm-ai-2025.ff375763.mp4`,
      image: `./projects/norm-ai-2025.9b4212c7.webp`,
    },
    dcf43857eb0c: {
      image: `./projects/airbnb-2025-summer-release.016c118b.webp`,
    },
    d7d227a77d4c: { image: `./projects/airbnb-experiences.0b80d982.webp` },
    c065e4948a1d: { image: `./projects/airbnb-services.524cfd55.webp` },
    e1b5147036be: { image: `./projects/fwd-people.7422ccd8.webp` },
    d4cc9586c09f: {
      video: `./projects/golfzon-social.d87d997e.mp4`,
      image: `./projects/golfzon-social.f3bdbba1.webp`,
    },
    f69c8bd21a69: { image: `./projects/macbook-pro-m4.bea23229.webp` },
    f3625c166497: { image: `./projects/iphone-16-pro.fcc8897a.webp` },
    d58a76814452: { image: `./projects/iphone-16.84fc39d3.webp` },
    dd111a25ff26: { image: `./projects/bizarro-portfolio-2024.517157b8.webp` },
    f8d427093c92: {
      video: `./projects/studio-chapeaux.a002296b.mp4`,
      image: `./projects/studio-chapeaux.9127800b.webp`,
    },
    f072e000ed08: { image: `./projects/macbook-pro-m1.a237ccce.webp` },
    f6128ce2e0cd: { image: `./projects/iphone-15-pro.bc547a5e.webp` },
    e6a39805494c: { image: `./projects/iphone-15.6b963d08.webp` },
    ee9a33ea88b7: { image: `./projects/apple-vision-pro.4ad30d32.webp` },
    c46b5060e90f: {
      video: `./projects/thieb-portfolio.a199bd4d.mp4`,
      image: `./projects/thieb-portfolio.a4ae4931.webp`,
    },
    da1ec0c66a69: {
      video: `./projects/yuri-gravity.d46d438d.mp4`,
      image: `./projects/yuri-gravity.5effb20f.webp`,
    },
    ec4387087015: {
      image: `./projects/karina-sirqueira-portfolio.caa55181.webp`,
    },
    f7645ca0d10d: {
      video: `./projects/tarot-with-youtube.b4d7b555.mp4`,
      image: `./projects/tarot-with-youtube.55f0825b.webp`,
    },
    db3ae86396ab: {
      video: `./projects/ambush-silver-fctry.9767a206.mp4`,
      image: `./projects/ambush-silver-fctry.6af767bd.webp`,
    },
    f48f225d79d7: {
      video: `./projects/anduril.9fdff11c.mp4`,
      image: `./projects/anduril.edfe5e37.webp`,
    },
    fec89ab644b1: { image: `./projects/dreamwave-3d-demo.935a44a0.webp` },
    e4d52db79a43: { image: `./projects/castle-crush.093edfd2.webp` },
    f7e679130fdb: {
      video: `./projects/xbox-museum.0b40cce9.mp4`,
      image: `./projects/xbox-museum.184f76d3.webp`,
    },
    f218de39ac9a: { image: `./projects/bbdo.a45b3af0.webp` },
    fd0e9f0b5ab4: {
      video: `./projects/design-embraced-portfolio.db756d1c.mp4`,
      image: `./projects/design-embraced-portfolio.3a545788.webp`,
    },
    d1dc752869bb: {
      video: `./projects/peggy-gou.5eea263e.mp4`,
      image: `./projects/peggy-gou.93ecaf64.webp`,
    },
    fefbdb77d27f: {
      video: `./projects/kacper-chlebowicz-portfolio.5bd057a5.mp4`,
      image: `./projects/kacper-chlebowicz-portfolio.5330724c.webp`,
    },
    ccebc0d1ae9f: { image: `./projects/floema-jewelry.4df15b20.webp` },
    faf2f5663f16: {
      image: `./projects/isabel-moranta-portfolio.82bed589.webp`,
    },
    cf07f2275720: { image: `./projects/garoa-skincare.3feba860.webp` },
    d4b428f5e309: { image: `./projects/bizarro-portfolio-2020.0dc9d85f.webp` },
    c8d11680e28a: {
      video: `./projects/trolli-deliciously-dark-escape.66002f42.mp4`,
      image: `./projects/trolli-deliciously-dark-escape.1c422cc9.webp`,
    },
    d7cc4c94c86a: {
      video: `./projects/inbound-2020.a65e6d35.mp4`,
      image: `./projects/inbound-2020.850362f3.webp`,
    },
    d19a10557aeb: { image: `./projects/kaleidoz.fab754a3.webp` },
    d071f7466a07: {
      video: `./projects/adventure-time-distant-lands.d6067736.mp4`,
      image: `./projects/adventure-time-distant-lands.b16cc5b8.webp`,
    },
    f42b3d791807: {
      video: `./projects/redisconf20.5c62f5a8.mp4`,
      image: `./projects/redisconf20.bab0cd33.webp`,
    },
    ca13fa61531a: { image: `./projects/oneplus-crackables-2-0.e02b2201.webp` },
    cfd033cdb76a: {
      video: `./projects/studio-maertens.18713fe0.mp4`,
      image: `./projects/studio-maertens.fa514ef9.webp`,
    },
    d3369cce859e: { image: `./projects/erika-moreira-portfolio.ec1165c6.webp` },
    c687e0960a75: {
      video: `./projects/bruno-arizio-portfolio.9d5255d1.mp4`,
      image: `./projects/bruno-arizio-portfolio.1af226dc.webp`,
    },
    f66ec204c826: { image: `./projects/samsung-spaceselfie.3e98d1a7.webp` },
    da32e0f46f58: {
      image: `./projects/dominic-berzins-portfolio.aecd130e.webp`,
    },
    f8bdad89df4c: { image: `./projects/stubhub-gift-rapper.adf9fb93.webp` },
    d872a20e6168: {
      video: `./projects/cult-london.3efbf910.mp4`,
      image: `./projects/cult-london.3a8d2f39.webp`,
    },
    cd75ceff320c: {
      image: `./projects/lufthansa-sayyestotheworld-2.7f3389f3.webp`,
    },
    e66925706dbc: {
      image: `./projects/tiaa-the-difference-maker.b7832d83.webp`,
    },
    e463394a69cc: {
      image: `./projects/lufthansa-sayyestotheworld.b229ca49.webp`,
    },
    f4cbde4eb122: { image: `./projects/corvette-zr1-modules.f5e85f2e.webp` },
    e352e9b2c8c6: { image: `./projects/shell-make-the-future.55b42b25.webp` },
    f41189642f53: { image: `./projects/nike-city-fast.4a651610.webp` },
    c57d691545e7: { image: `./projects/airbnb-family-trips.dceaf699.webp` },
  },
  Ui = JSON.parse(
    `[{"client":"Bizarro","date":"2026-11-02","id":"0cb0f81c4b74","name":"MiniDiscs","url":"https://minidiscs.bizar.ro/","slug":"minidiscs"},{"client":"Bizarro","date":"2026-08-01","id":"df4b17f4ae02","name":"Age of Learning","url":"https://age-of-learning.bizarro.dev/","slug":"age-of-learning"},{"client":"Bizarro","date":"2026-06-01","id":"c0449efe5104","name":"Gudu Records","url":"https://www.gudurecords.co/","slug":"gudu-records"},{"client":"National Design Studio","date":"2026-04-01","id":"caf7d3f99237","name":"NASA Force","url":"https://nasaforce.gov/","slug":"nasa-force"},{"client":"Bizarro","date":"2026-01-01","id":"norm-law","name":"Norm Law","url":"https://www.normlaw.com/","slug":"norm-law"},{"client":"Bizarro","date":"2026-01-01","id":"c04aede2560f","name":"Norm Ai 2026","url":"https://www.norm.ai/","slug":"norm-ai-2026"},{"client":"Bizarro","date":"2025-10-13","id":"c454ec9a8a11","name":"Expa","url":"https://expa.com/","slug":"expa"},{"client":"Bizarro","date":"2025-10-03","id":"f0edc6075ef8","name":"Zerotrillion","url":"https://zerotrillion.com/","slug":"zerotrillion"},{"client":"Bizarro","date":"2025-09-24","id":"7b3e91d04a6c","name":"Norm Ai 2025","url":"https://norm-ai.bizarro.dev/","slug":"norm-ai-2025"},{"client":"Airbnb","date":"2025-05-13","id":"dcf43857eb0c","name":"Airbnb 2025 Summer Release","url":"https://airbnb.com/release/2025-summer/","slug":"airbnb-2025-summer-release"},{"client":"Airbnb","date":"2025-05-13","id":"d7d227a77d4c","name":"Airbnb Experiences","url":"https://www.airbnb.com/host/experiences","slug":"airbnb-experiences"},{"client":"Airbnb","date":"2025-05-13","id":"c065e4948a1d","name":"Airbnb Services","url":"https://www.airbnb.com/host/services","slug":"airbnb-services"},{"client":"Bizarro","date":"2025-01-01","id":"e1b5147036be","name":"FWD People","url":"https://fwdpeople.com/","slug":"fwd-people"},{"client":"Bizarro","date":"2024-11-12","id":"d4cc9586c09f","name":"Golfzon Social","url":"https://golfzon.bizarro.dev/","slug":"golfzon-social"},{"client":"Apple","date":"2024-10-30","id":"f69c8bd21a69","name":"Macbook Pro M4","url":"https://web.archive.org/web/20241120230208/https://www.apple.com/macbook-pro/","slug":"macbook-pro-m4"},{"client":"Apple","date":"2024-09-09","id":"f3625c166497","name":"iPhone 16 Pro","url":"https://web.archive.org/web/20240909202524/https://www.apple.com/iphone-16-pro/","slug":"iphone-16-pro"},{"client":"Apple","date":"2024-09-09","id":"d58a76814452","name":"iPhone 16","url":"https://web.archive.org/web/20240909192349/https://www.apple.com/iphone-16/","slug":"iphone-16"},{"client":"Bizarro","date":"2024-06-14","id":"dd111a25ff26","name":"Bizarro Portfolio","url":"https://2024.bizar.ro/","slug":"bizarro-portfolio-2024"},{"client":"Bizarro","date":"2024-06-13","id":"f8d427093c92","name":"Studio Chapeaux","url":"https://studio-chapeaux.bizarro.dev/","slug":"studio-chapeaux"},{"client":"Apple","date":"2023-10-30","id":"f072e000ed08","name":"MacBook Pro M1","url":"https://web.archive.org/web/20231101163212/https://www.apple.com/macbook-pro/","slug":"macbook-pro-m1"},{"client":"Apple","date":"2023-09-12","id":"f6128ce2e0cd","name":"iPhone 15 Pro","url":"https://web.archive.org/web/20230913110220/https://www.apple.com/iphone-15-pro/","slug":"iphone-15-pro"},{"client":"Apple","date":"2023-09-12","id":"e6a39805494c","name":"iPhone 15","url":"https://web.archive.org/web/20230913110218/https://www.apple.com/iphone-15/","slug":"iphone-15"},{"client":"Apple","date":"2023-06-05","id":"ee9a33ea88b7","name":"Apple Vision Pro","url":"https://web.archive.org/web/20240203031537/https://www.apple.com/apple-vision-pro/","slug":"apple-vision-pro"},{"client":"Bizarro","date":"2023-04-14","id":"c46b5060e90f","name":"Thieb Portfolio","url":"https://thieb.bizarro.dev","slug":"thieb-portfolio"},{"client":"Bizarro","date":"2023-01-25","id":"da1ec0c66a69","name":"Yuri Gravity","url":"https://yuri.bizarro.dev","slug":"yuri-gravity"},{"client":"Bizarro","date":"2022-09-11","id":"ec4387087015","name":"Karina Sirqueira Portfolio","url":"https://karina-sirqueira.bizarro.dev","slug":"karina-sirqueira-portfolio"},{"client":"Active Theory","date":"2022-06-07","id":"f7645ca0d10d","name":"Tarot with YouTube","url":"https://x.com/active_theory/status/1534187453669462016","slug":"tarot-with-youtube"},{"client":"Active Theory","date":"2022-03-16","id":"db3ae86396ab","name":"AMBUSH® SILVER FCTRY","url":"https://x.com/dreamwave/status/1504087136269582337","slug":"ambush-silver-fctry"},{"client":"Bizarro","date":"2022-03-01","id":"f48f225d79d7","name":"Anduril","url":"https://anduril.bizarro.dev/","slug":"anduril"},{"client":"Active Theory","date":"2022-05-12","id":"fec89ab644b1","name":"Dreamwave 3D Demo","url":"https://x.com/active_theory/status/1524736398485442560","slug":"dreamwave-3d-demo"},{"client":"Bizarro","date":"2022-05-06","id":"e4d52db79a43","name":"Castle Crush","url":"https://castle-crush.bizarro.dev","slug":"castle-crush"},{"client":"Active Theory","date":"2021-11-23","id":"f7e679130fdb","name":"Xbox Museum","url":"https://x.com/active_theory/status/1463260489434206213","slug":"xbox-museum"},{"client":"Bizarro","date":"2021-12-26","id":"f218de39ac9a","name":"BBDO","url":"https://bbdo.bizarro.dev/","slug":"bbdo"},{"client":"Bizarro","date":"2021-03-08","id":"fd0e9f0b5ab4","name":"Design Embraced Portfolio","url":"https://design-embraced.bizarro.dev","slug":"design-embraced-portfolio"},{"client":"Bizarro","date":"2021-05-14","id":"d1dc752869bb","name":"Peggy Gou","url":"https://peggygou.com","slug":"peggy-gou"},{"client":"Bizarro","date":"2021-02-20","id":"fefbdb77d27f","name":"Kacper Chlebowicz Portfolio","url":"https://kacper-chlebowicz.bizarro.dev","slug":"kacper-chlebowicz-portfolio"},{"client":"Bizarro","date":"2021-07-30","id":"ccebc0d1ae9f","name":"Floema Jewelry","url":"https://floema.bizarro.dev","slug":"floema-jewelry"},{"client":"Bizarro","date":"2021-07-06","id":"faf2f5663f16","name":"Isabel Moranta Portfolio","url":"https://isabel-moranta.bizarro.dev","slug":"isabel-moranta-portfolio"},{"client":"Bizarro","date":"2021-04-06","id":"cf07f2275720","name":"Garoa Skincare","url":"https://garoa.bizarro.dev","slug":"garoa-skincare"},{"client":"Bizarro","date":"2020-12-14","id":"d4b428f5e309","name":"Bizarro Portfolio","url":"https://2020.bizarro.dev/","slug":"bizarro-portfolio-2020"},{"client":"Active Theory","date":"2020-10-22","id":"c8d11680e28a","name":"Trolli: Deliciously Dark Escape","url":"https://x.com/active_theory/status/1319270945370992640","slug":"trolli-deliciously-dark-escape"},{"client":"Active Theory","date":"2020-09-22","id":"d7cc4c94c86a","name":"INBOUND 2020","url":"https://x.com/dreamwave/status/1318891462260555776","slug":"inbound-2020"},{"client":"Bizarro","date":"2020-07-24","id":"d19a10557aeb","name":"Kaleidoz","url":"https://kaleidoz.bizarro.dev","slug":"kaleidoz"},{"client":"Active Theory","date":"2020-06-16","id":"d071f7466a07","name":"Adventure Time: Distant Lands","url":"https://x.com/active_theory/status/1272880618783870976","slug":"adventure-time-distant-lands"},{"client":"Active Theory","date":"2020-05-13","id":"f42b3d791807","name":"RedisConf20","url":"https://x.com/dreamwave/status/1277619689087209472","slug":"redisconf20"},{"client":"UNIT9","date":"2020-05-13","id":"ca13fa61531a","name":"OnePlus: Crackables 2.0","url":"https://www.unit9.com/project/oneplus-crackables-2-0","slug":"oneplus-crackables-2-0"},{"client":"Bizarro","date":"2020-06-05","id":"cfd033cdb76a","name":"Studio Maertens","url":"https://studiomaertens.com","slug":"studio-maertens"},{"client":"Bizarro","date":"2020-03-16","id":"d3369cce859e","name":"Erika Moreira Portfolio","url":"https://erika-moreira-2019.bizarro.dev","slug":"erika-moreira-portfolio"},{"client":"Bizarro","date":"2019-11-25","id":"c687e0960a75","name":"Bruno Arizio Portfolio","url":"https://bruno-arizio-2019.bizarro.dev","slug":"bruno-arizio-portfolio"},{"client":"UNIT9","date":"2019-10-17","id":"f66ec204c826","name":"Samsung: SpaceSelfie","url":"https://www.unit9.com/project/samsung-spaceselfie","slug":"samsung-spaceselfie"},{"client":"Bizarro","date":"2019-03-07","id":"da32e0f46f58","name":"Dominic Berzins Portfolio","url":"https://dominic-berzins.bizarro.dev","slug":"dominic-berzins-portfolio"},{"client":"UNIT9","date":"2018-11-23","id":"f8bdad89df4c","name":"StubHub: Gift Rapper","url":"https://www.unit9.com/project/stubhub-gift-rapper","slug":"stubhub-gift-rapper"},{"client":"Bizarro","date":"2018-12-21","id":"d872a20e6168","name":"Cult London","url":"https://cult.bizarro.dev/","slug":"cult-london"},{"client":"UNIT9","date":"2018-10-16","id":"cd75ceff320c","name":"Lufthansa: #SayYesToTheWorld 2","url":"https://www.unit9.com/project/lufthansa-sayyestotheworld-2","slug":"lufthansa-sayyestotheworld-2"},{"client":"UNIT9","date":"2018-04-16","id":"e66925706dbc","name":"TIAA: The Difference Maker","url":"https://www.unit9.com/project/tiaa-difference-maker","slug":"tiaa-the-difference-maker"},{"client":"UNIT9","date":"2018-02-13","id":"e463394a69cc","name":"Lufthansa: #SayYesToTheWorld","url":"https://www.unit9.com/project/lufthansa-sayyestotheworld","slug":"lufthansa-sayyestotheworld"},{"client":"UNIT9","date":"2017-11-27","id":"f4cbde4eb122","name":"Corvette: ZR1 Modules","url":"https://www.unit9.com/project/corvette-modules","slug":"corvette-zr1-modules"},{"client":"UNIT9","date":"2018-02-06","id":"e352e9b2c8c6","name":"Shell: Make The Future","url":"https://www.unit9.com/project/shell-make-future","slug":"shell-make-the-future"},{"client":"UNIT9","date":"2017-08-18","id":"f41189642f53","name":"Nike: City Fast","url":"https://www.unit9.com/project/nike-city-fast","slug":"nike-city-fast"},{"client":"UNIT9","date":"2017-04-25","id":"c57d691545e7","name":"Airbnb: Family Trips","url":"https://www.unit9.com/project/airbnb-family-trips","slug":"airbnb-family-trips"}]`,
  ),
  Wi = Hi,
  Gi = Ui.map((e) => ({ ...e, ...Wi[e.id] }));
function Ki(e) {
  if (!e.url) return `Offline`;
  let t = e.url.match(/web\.archive\.org\/web\/(\d{4})\d*\/(https?:\/\/.+)$/);
  return t?.[1] && t[2]
    ? `${new URL(t[2]).host.replace(/^www\./, ``)} (archived ${t[1]})`
    : new URL(e.url).host.replace(/^www\./, ``);
}
function qi(e) {
  return e.date.slice(0, 4);
}
var Ji =
    new URLSearchParams(window.location.search).get(`quality`) === `low`
      ? `low`
      : `high`,
  Yi = 0.062,
  Xi = Ji === `low` ? 2048 : 4096,
  Zi = 0.75,
  Qi = 0.85,
  $i = {
    background: `#000000`,
    glow: `#ffffff`,
    halation: `#ffffff`,
    key: `#ffffff`,
    rim: `#f4f4f4`,
    tape: `#1a1a1a`,
  },
  ea = {
    aberration: 0.006,
    adaptiveResolution: !0,
    aperture: 0.007,
    bloom: 0.4,
    bloomRadius: 1,
    contrast: 1.2,
    coreIntensity: 0.45,
    edgeGlow: 0.25,
    environmentIntensity: 0.9,
    exposure: 1,
    focus: 0,
    frameRate: 120,
    glassOpacity: 0.3,
    glints: 1.2,
    grain: 0.04,
    keyIntensity: 2.5,
    lensMaximum: 8,
    parallax: 1,
    pixelRatio: Math.min(window.devicePixelRatio, Ji === `low` ? 1 : 2),
    rimIntensity: 0.8,
    roughness: 0.06,
    saturation: 0,
    shutter: 1.6,
    spin: Qi,
    threshold: 1.4,
    vignette: 0.75,
    volume: 0.8,
  };
function ta(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function na(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function ra(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function ia(e, t) {
  return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function aa(e, t) {
  return [
    e[1] * t[2] - e[2] * t[1],
    e[2] * t[0] - e[0] * t[2],
    e[0] * t[1] - e[1] * t[0],
  ];
}
function oa(e) {
  return ia(e, e);
}
function sa(e) {
  return ra(e, 1 / (Math.sqrt(oa(e)) || 1));
}
function ca(e, t) {
  let n = Math.sin(t / 2);
  return [e[0] * n, e[1] * n, e[2] * n, Math.cos(t / 2)];
}
function la(e, t) {
  let [n, r, i, a] = e,
    [o, s, c, l] = t;
  return [
    n * l + a * o + r * c - i * s,
    r * l + a * s + i * o - n * c,
    i * l + a * c + n * s - r * o,
    a * l - n * o - r * s - i * c,
  ];
}
function ua(e) {
  let [t, n, r] = wa(e, 0),
    [i, a, o] = wa(e, 1),
    [s, c, l] = wa(e, 2),
    u = t + a + l;
  if (u > 0) {
    let e = 0.5 / Math.sqrt(u + 1);
    return [(o - c) * e, (s - r) * e, (n - i) * e, 0.25 / e];
  }
  if (t > a && t > l) {
    let e = 2 * Math.sqrt(1 + t - a - l);
    return [0.25 * e, (i + n) / e, (s + r) / e, (o - c) / e];
  }
  if (a > l) {
    let e = 2 * Math.sqrt(1 + a - t - l);
    return [(i + n) / e, 0.25 * e, (c + o) / e, (s - r) / e];
  }
  let d = 2 * Math.sqrt(1 + l - t - a);
  return [(s + r) / d, (c + o) / d, 0.25 * d, (n - i) / d];
}
function da(e, t, n) {
  return [...e, 0, ...t, 0, ...n, 0, 0, 0, 0, 1];
}
function fa(e, t) {
  let [n, r, i, a] = t,
    o = n + n,
    s = r + r,
    c = i + i,
    l = n * o,
    u = n * s,
    d = n * c,
    f = r * s,
    p = r * c,
    m = i * c,
    h = a * o,
    g = a * s,
    _ = a * c;
  return [
    1 - (f + m),
    u + _,
    d - g,
    0,
    u - _,
    1 - (l + m),
    p + h,
    0,
    d + g,
    p - h,
    1 - (l + f),
    0,
    ...e,
    1,
  ];
}
function pa() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function ma(e, t) {
  let n = Array(16);
  for (let r = 0; r < 4; r++)
    for (let i = 0; i < 4; i++) {
      let a = 0;
      for (let n = 0; n < 4; n++)
        a += (e[n * 4 + i] ?? 0) * (t[r * 4 + n] ?? 0);
      n[r * 4 + i] = a;
    }
  return n;
}
function ha(e, t, n) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, e, t, n, 1];
}
function ga(e, t, n) {
  return [e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1];
}
function _a(e) {
  let t = Math.cos(e),
    n = Math.sin(e);
  return [1, 0, 0, 0, 0, t, n, 0, 0, -n, t, 0, 0, 0, 0, 1];
}
function va(e) {
  let t = Math.cos(e),
    n = Math.sin(e);
  return [t, 0, -n, 0, 0, 1, 0, 0, n, 0, t, 0, 0, 0, 0, 1];
}
function ya(e) {
  let t = Math.cos(e),
    n = Math.sin(e);
  return [t, n, 0, 0, -n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function ba(e, t) {
  return ta(
    ta(ta(ra(wa(e, 0), t[0]), ra(wa(e, 1), t[1])), ra(wa(e, 2), t[2])),
    wa(e, 3),
  );
}
function xa(e, t) {
  let n = wa(e, 0),
    r = wa(e, 1),
    i = wa(e, 2),
    a = aa(r, i),
    o = aa(i, n),
    s = aa(n, r),
    c = ia(n, a);
  return sa(ra(ta(ta(ra(a, t[0]), ra(o, t[1])), ra(s, t[2])), 1 / c));
}
function Sa(e, [t, n, r], i = 1) {
  return [0, 1, 2, 3].map(
    (a) =>
      (e[a] ?? 0) * t +
      (e[4 + a] ?? 0) * n +
      (e[8 + a] ?? 0) * r +
      (e[12 + a] ?? 0) * i,
  );
}
function Ca(e, t) {
  let [n, r, i, a] = Sa(e, t);
  return [n / a, r / a, i / a];
}
function wa(e, t) {
  return [e[t * 4] ?? 0, e[t * 4 + 1] ?? 0, e[t * 4 + 2] ?? 0];
}
function Ta(e, t) {
  (e[12] = t[0]), (e[13] = t[1]), (e[14] = t[2]);
}
var Ea = `// Thirteen taps (Jimenez, "Next Generation Post Processing in Call of Duty: Advanced Warfare").

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}


@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var tSource: texture_2d<f32>;

fn tap(uv: vec2f, offset: vec2f, texel: vec2f) -> vec3f {
  return textureSampleLevel(tSource, linearSampler, uv + texel * offset, 0.0).rgb;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let uv = in.uv;
  let texel = 1.0 / vec2f(textureDimensions(tSource));
  var color = tap(uv, vec2f(0.0), texel) * 0.125;

  color += (tap(uv, vec2f(-2.0, -2.0), texel) + tap(uv, vec2f(2.0, -2.0), texel) + tap(uv, vec2f(-2.0, 2.0), texel) +
    tap(uv, vec2f(2.0, 2.0), texel)) * 0.03125;
  color += (tap(uv, vec2f(0.0, -2.0), texel) + tap(uv, vec2f(-2.0, 0.0), texel) + tap(uv, vec2f(2.0, 0.0), texel) +
    tap(uv, vec2f(0.0, 2.0), texel)) * 0.0625;
  color += (tap(uv, vec2f(-1.0, -1.0), texel) + tap(uv, vec2f(1.0, -1.0), texel) + tap(uv, vec2f(-1.0, 1.0), texel) +
    tap(uv, vec2f(1.0, 1.0), texel)) * 0.125;

  return vec4f(color, 1.0);
}
`,
  Da = `// Into half resolution, the first level of the bloom chain: only what is brighter than the threshold.

// The uniform block the full screen passes after the scene share, written once a frame. Each pass declares only the
// bindings it reads.
struct Uniforms {
  projectionInverse: mat4x4f,
  reprojection: mat4x4f,
  // xy render size, z frame, w time.
  resolution: vec4f,
  // x aperture, y focus, z lens maximum, w shutter.
  lens: vec4f,
  // x aberration, y bloom, z contrast, w exposure.
  grade: vec4f,
  // x grain, y saturation, z vignette, w threshold.
  finish: vec4f,
  // rgb bloom tint, w bloom radius.
  bloom: vec4f,
}

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}

// Hash without Sine, by Dave Hoskins (MIT).
fn hash12(point: vec2f) -> f32 {
  var value = fract(vec3f(point.xyx) * 0.1031);

  value += dot(value, value.yzx + 33.33);

  return fract((value.x + value.y) * value.z);
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722));
}


@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var tSource: texture_2d<f32>;

// Karis average: each tap is weighted down by its own brightness, so a single hot pixel can't flicker the whole glow.
fn prefilterTap(uv: vec2f, offset: vec2f, texel: vec2f) -> vec3f {
  let color = textureSampleLevel(tSource, linearSampler, uv + offset * texel, 0.0).rgb;

  return color / (1.0 + luminance(color));
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let texel = 1.0 / vec2f(textureDimensions(tSource));
  var color = prefilterTap(in.uv, vec2f(-1.0, -1.0), texel) + prefilterTap(in.uv, vec2f(1.0, -1.0), texel) +
    prefilterTap(in.uv, vec2f(-1.0, 1.0), texel) + prefilterTap(in.uv, vec2f(1.0, 1.0), texel);

  color *= 0.25;
  color /= max(1.0 - luminance(color), 0.0001);

  let threshold = uniforms.finish.w;
  let knee = smoothstep(threshold, threshold + 0.5, luminance(color));

  return vec4f(color * knee, 1.0);
}
`,
  Oa = `// A 3×3 tent over the smaller level (tSource), added onto this one (tSecond), so every level of the chain spreads the
// glow wider.

// The uniform block the full screen passes after the scene share, written once a frame. Each pass declares only the
// bindings it reads.
struct Uniforms {
  projectionInverse: mat4x4f,
  reprojection: mat4x4f,
  // xy render size, z frame, w time.
  resolution: vec4f,
  // x aperture, y focus, z lens maximum, w shutter.
  lens: vec4f,
  // x aberration, y bloom, z contrast, w exposure.
  grade: vec4f,
  // x grain, y saturation, z vignette, w threshold.
  finish: vec4f,
  // rgb bloom tint, w bloom radius.
  bloom: vec4f,
}

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}


@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var tSource: texture_2d<f32>;
@group(0) @binding(3) var tSecond: texture_2d<f32>;

fn tap(uv: vec2f, offset: vec2f) -> vec3f {
  return textureSampleLevel(tSource, linearSampler, uv + offset, 0.0).rgb;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let offset = uniforms.bloom.w / vec2f(textureDimensions(tSource));
  let uv = in.uv;
  var color = tap(uv, vec2f(0.0)) * 4.0;

  color += (tap(uv, vec2f(-offset.x, 0.0)) + tap(uv, vec2f(offset.x, 0.0))) * 2.0;
  color += (tap(uv, vec2f(0.0, -offset.y)) + tap(uv, vec2f(0.0, offset.y))) * 2.0;
  color += tap(uv, -offset) + tap(uv, offset);
  color += tap(uv, vec2f(-offset.x, offset.y)) + tap(uv, vec2f(offset.x, -offset.y));

  return vec4f(textureSampleLevel(tSecond, linearSampler, uv, 0.0).rgb + color / 16.0, 1.0);
}
`,
  ka = `// Chromatic aberration, bloom with a tinted halation, vignette, ACES, sRGB, the grade and grain, into the canvas. The
// canvas is not an sRGB format: the conversion happens here.

// The uniform block the full screen passes after the scene share, written once a frame. Each pass declares only the
// bindings it reads.
struct Uniforms {
  projectionInverse: mat4x4f,
  reprojection: mat4x4f,
  // xy render size, z frame, w time.
  resolution: vec4f,
  // x aperture, y focus, z lens maximum, w shutter.
  lens: vec4f,
  // x aberration, y bloom, z contrast, w exposure.
  grade: vec4f,
  // x grain, y saturation, z vignette, w threshold.
  finish: vec4f,
  // rgb bloom tint, w bloom radius.
  bloom: vec4f,
}

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}

// Hash without Sine, by Dave Hoskins (MIT).
fn hash12(point: vec2f) -> f32 {
  var value = fract(vec3f(point.xyx) * 0.1031);

  value += dot(value, value.yzx + 33.33);

  return fract((value.x + value.y) * value.z);
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722));
}


@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var tSource: texture_2d<f32>;
@group(0) @binding(3) var tSecond: texture_2d<f32>;

// ACES filmic fit by Krzysztof Narkowicz.
fn tonemap(color: vec3f) -> vec3f {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
}

fn toSrgb(color: vec3f) -> vec3f {
  return select(color * 12.92, 1.055 * pow(color, vec3f(1.0 / 2.4)) - 0.055, color > vec3f(0.0031308));
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let center = in.uv - 0.5;
  let distance = length(center);
  let shift = center * distance * uniforms.grade.x;
  var color = vec3f(
    textureSampleLevel(tSource, linearSampler, in.uv + shift, 0.0).r,
    textureSampleLevel(tSource, linearSampler, in.uv, 0.0).g,
    textureSampleLevel(tSource, linearSampler, in.uv - shift, 0.0).b,
  );

  // Halation: the glow is partly tinted, like light scattering back through the film.
  let bloom = textureSampleLevel(tSecond, linearSampler, in.uv, 0.0).rgb;

  color += mix(bloom, uniforms.bloom.rgb * luminance(bloom), 0.35) * uniforms.grade.y;
  color *= 1.0 - smoothstep(0.25, 0.85, distance) * uniforms.finish.z;
  color = toSrgb(tonemap(color * uniforms.grade.w));
  color = mix(vec3f(luminance(color)), color, uniforms.finish.y);
  color = (color - 0.5) * uniforms.grade.z + 0.5;

  let noise = hash12(floor(in.uv * uniforms.resolution.xy) + fract(uniforms.resolution.w) * vec2f(1931.0, 2713.0));

  color += (noise - 0.5) * uniforms.finish.x;

  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}
`,
  Aa = `// Scatter as gather along a golden angle spiral, after Dennis Gustafsson, "Bokeh depth of field in a single pass".
// Each sample covers the centre if its own circle reaches it; samples behind a sharper centre can't bleed over it.

// The uniform block the full screen passes after the scene share, written once a frame. Each pass declares only the
// bindings it reads.
struct Uniforms {
  projectionInverse: mat4x4f,
  reprojection: mat4x4f,
  // xy render size, z frame, w time.
  resolution: vec4f,
  // x aperture, y focus, z lens maximum, w shutter.
  lens: vec4f,
  // x aberration, y bloom, z contrast, w exposure.
  grade: vec4f,
  // x grain, y saturation, z vignette, w threshold.
  finish: vec4f,
  // rgb bloom tint, w bloom radius.
  bloom: vec4f,
}

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}

// Hash without Sine, by Dave Hoskins (MIT).
fn hash12(point: vec2f) -> f32 {
  var value = fract(vec3f(point.xyx) * 0.1031);

  value += dot(value, value.yzx + 33.33);

  return fract((value.x + value.y) * value.z);
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722));
}


@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var tSource: texture_2d<f32>;

const GOLDEN_ANGLE: f32 = 2.39996323;

const RADIUS_SCALE: f32 = 1.25;

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let center = textureSampleLevel(tSource, linearSampler, in.uv, 0.0);
  let centerSize = abs(center.a);
  let texel = 1.0 / uniforms.resolution.xy;
  var color = center.rgb;
  var total = 1.0;
  var radius = RADIUS_SCALE;
  var angle = hash12(in.position.xy + fract(uniforms.resolution.z * 0.618) * 113.0) * 6.28318;

  for (var index = 0; index < 160; index++) {
    if (radius >= uniforms.lens.z) {
      break;
    }

    let offset = vec2f(cos(angle), sin(angle)) * radius * texel;
    let neighbour = textureSampleLevel(tSource, linearSampler, in.uv + offset, 0.0);
    var neighbourSize = abs(neighbour.a);

    if (neighbour.a > center.a) {
      neighbourSize = clamp(neighbourSize, 0.0, centerSize * 2.0);
    }

    let weight = smoothstep(radius - 0.5, radius + 0.5, neighbourSize);

    color += mix(color / total, neighbour.rgb, weight);
    total += 1.0;
    radius += RADIUS_SCALE / radius;
    angle += GOLDEN_ANGLE;
  }

  return vec4f(color / total, 1.0);
}
`,
  ja = `// Every pixel is put back where it was a frame ago: from the depth buffer to the world, into the tower's previous
// rotation and through the previous camera. The tower turns as one rigid body, so this is its exact motion, and the
// colour is smeared along it like a slow shutter. Alpha carries the signed circle of confusion for the lens pass.

// The uniform block the full screen passes after the scene share, written once a frame. Each pass declares only the
// bindings it reads.
struct Uniforms {
  projectionInverse: mat4x4f,
  reprojection: mat4x4f,
  // xy render size, z frame, w time.
  resolution: vec4f,
  // x aperture, y focus, z lens maximum, w shutter.
  lens: vec4f,
  // x aberration, y bloom, z contrast, w exposure.
  grade: vec4f,
  // x grain, y saturation, z vignette, w threshold.
  finish: vec4f,
  // rgb bloom tint, w bloom radius.
  bloom: vec4f,
}

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}

// Hash without Sine, by Dave Hoskins (MIT).
fn hash12(point: vec2f) -> f32 {
  var value = fract(vec3f(point.xyx) * 0.1031);

  value += dot(value, value.yzx + 33.33);

  return fract((value.x + value.y) * value.z);
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722));
}


@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var tSource: texture_2d<f32>;
@group(0) @binding(3) var tDepth: texture_depth_multisampled_2d;

const SAMPLES: i32 = 12;

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let resolution = uniforms.resolution.xy;
  let depth = textureLoad(tDepth, vec2i(in.uv * resolution), 0);
  let clip = vec4f(in.uv.x * 2.0 - 1.0, 1.0 - in.uv.y * 2.0, depth, 1.0);
  let view = uniforms.projectionInverse * clip;
  let viewDistance = -view.z / view.w;
  var velocity = vec2f(0.0);

  if (depth < 1.0) {
    let previous = uniforms.reprojection * clip;
    let moved = (clip.xy - previous.xy / previous.w) * 0.5 * uniforms.lens.w;

    velocity = vec2f(moved.x, -moved.y);
  }

  let travel = length(velocity * resolution);
  let maximum = resolution.y * 0.035;

  if (travel > maximum) {
    velocity *= maximum / travel;
  }

  let jitter = hash12(in.position.xy + fract(uniforms.resolution.z * 0.618) * 97.0) - 0.5;
  var color = vec3f(0.0);

  for (var index = 0; index < SAMPLES; index++) {
    let offset = (f32(index) + 0.5 + jitter) / f32(SAMPLES) - 0.5;

    color += textureSampleLevel(tSource, linearSampler, in.uv - velocity * offset, 0.0).rgb;
  }

  color /= f32(SAMPLES);

  let aperture = uniforms.lens.x;
  let focus = uniforms.lens.y;
  let lensMaximum = uniforms.lens.z;
  var size = lensMaximum;

  if (depth < 1.0) {
    size = aperture * (viewDistance - focus) / viewDistance * resolution.y;
  }

  return vec4f(color, clamp(size, -lensMaximum, lensMaximum));
}
`,
  Ma = `rgba16float`,
  Na = `depth32float`,
  Pa = [`samplers`, `storages`, `storageTextures`, `textures`, `uniforms`];
function Fa(e, t, n, r, i) {
  let a = [],
    o = t.defs;
  for (let [e, t] of Object.entries(r))
    for (let r of Pa) {
      let i = o[r]?.[e];
      i && i.group === n && a.push({ binding: i.binding, resource: t });
    }
  return e.device.createBindGroup({
    entries: a,
    label: i,
    layout: t.bindGroupLayout(n),
  });
}
function Ia(e, t, n) {
  return e.device.createBuffer({
    label: n,
    size: t,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}
function La(e, t, n, r, i = 1) {
  return e.device.createTexture({
    format: r,
    label: `target-${r}`,
    sampleCount: i,
    size: [Math.max(1, t), Math.max(1, n)],
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });
}
function Ra(e, t, n) {
  return Ir(e.device, t, { format: n, mips: !0 });
}
function za(e) {
  return e.device.createSampler({
    addressModeU: `clamp-to-edge`,
    addressModeV: `clamp-to-edge`,
    addressModeW: `clamp-to-edge`,
    magFilter: `linear`,
    maxAnisotropy: 8,
    minFilter: `linear`,
    mipmapFilter: `linear`,
  });
}
var Ba = class {
    buffer;
    gpu;
    height = 1;
    passes = [];
    pipelines;
    sampler;
    targets;
    uniforms;
    width = 1;
    constructor(e) {
      t(this), (this.gpu = e);
      let n = (t, n, r = Ma) =>
        new yi(e, {
          code: t,
          cullMode: `none`,
          depthStencil: !1,
          label: n,
          targets: [{ format: r }],
          vertexBuffers: e.TRIANGLE.bufferLayouts,
        });
      (this.pipelines = {
        bloomDownsample: n(Ea, `bloom-downsample`),
        bloomPrefilter: n(Da, `bloom-prefilter`),
        bloomUpsample: n(Oa, `bloom-upsample`),
        final: n(ka, `final`, e.presentationFormat),
        lens: n(Aa, `lens`),
        motion: n(ja, `motion`),
      }),
        (this.uniforms = Ne(this.pipelines.motion.defs.uniforms.uniforms)),
        (this.buffer = Ia(e, this.uniforms.arrayBuffer.byteLength, `post`)),
        (this.sampler = za(e));
    }
    getBloomSize(e) {
      let t = 2 ** (e + 1);
      return {
        height: Math.max(1, Math.round(this.height / t)),
        width: Math.max(1, Math.round(this.width / t)),
      };
    }
    resize(e, t) {
      if (this.targets && e === this.width && t === this.height) return;
      this.destroyTargets(), (this.width = e), (this.height = t);
      let { gpu: n } = this,
        r = [],
        i = [];
      for (let e = 0; e < 6; e++) {
        let t = this.getBloomSize(e);
        r.push(La(n, t.width, t.height, Ma)),
          e < 5 && i.push(La(n, t.width, t.height, Ma));
      }
      let a = {
        bloomDown: r,
        bloomUp: i,
        depth: La(n, e, t, Na, 4),
        lens: La(n, e, t, Ma),
        motion: La(n, e, t, Ma),
        samples: La(n, e, t, Ma, 4),
        scene: La(n, e, t, Ma),
      };
      (this.targets = a), (this.passes = this.createPasses(a));
    }
    createPasses(e) {
      let { pipelines: t } = this,
        n = (t, n, r, i) => {
          let a = {
            linearSampler: this.sampler,
            tDepth: e.depth.createView(),
            tSource: r.createView(),
            uniforms: { buffer: this.buffer },
          };
          return (
            i && (a.tSecond = i.createView()),
            {
              bindGroup: Fa(this.gpu, t, 0, a, t.label),
              pipeline: t,
              target: n?.createView(),
            }
          );
        },
        r = [
          n(t.motion, e.motion, e.scene),
          n(t.lens, e.lens, e.motion),
          n(t.bloomPrefilter, e.bloomDown[0], e.lens),
        ];
      for (let i = 1; i < 6; i++) {
        let a = e.bloomDown[i - 1];
        r.push(n(t.bloomDownsample, e.bloomDown[i], a));
      }
      for (let i = 4; i >= 0; i--) {
        let a = i === 4 ? e.bloomDown[i + 1] : e.bloomUp[i + 1];
        r.push(n(t.bloomUpsample, e.bloomUp[i], a, e.bloomDown[i]));
      }
      return r.push(n(t.final, null, e.lens, e.bloomUp[0])), r;
    }
    getSceneViews() {
      let e = this.targets;
      return {
        color: e.samples.createView(),
        depth: e.depth.createView(),
        resolve: e.scene.createView(),
      };
    }
    render(e, t, n) {
      let { settings: r } = n,
        i = r.shutter / Math.max(n.delta * 60, 0.25);
      this.uniforms.set({
        bloom: [...Ti($i.halation), r.bloomRadius],
        finish: [r.grain, r.saturation, r.vignette, r.threshold],
        grade: [r.aberration, r.bloom, r.contrast, r.exposure],
        lens: [r.aperture, n.focus, r.lensMaximum, i],
        projectionInverse: Array.from(n.projectionInverse),
        reprojection: Array.from(n.reprojection),
        resolution: [this.width, this.height, n.frame, n.time],
      }),
        this.gpu.device.queue.writeBuffer(
          this.buffer,
          0,
          this.uniforms.arrayBuffer,
        );
      for (let n of this.passes)
        bi(e, {
          bindGroup: n.bindGroup,
          geometry: this.gpu.TRIANGLE,
          label: n.pipeline.label,
          pipeline: n.pipeline,
          targetView: n.target ?? t,
        });
      return this.passes.length;
    }
    destroyTargets() {
      if (!this.targets) return;
      let { bloomDown: e, bloomUp: t, ...n } = this.targets;
      for (let r of [...e, ...t, ...Object.values(n)]) r.destroy();
      this.targets = void 0;
    }
    destroy() {
      this.destroyTargets(), this.buffer.destroy();
      for (let e of Object.values(this.pipelines)) e.destroy();
    }
  },
  Va = class e {
    constructor(t, n, r, i, a = `div`) {
      (this.parent = t),
        (this.object = n),
        (this.property = r),
        (this._disabled = !1),
        (this._hidden = !1),
        (this.initialValue = this.getValue()),
        (this.domElement = document.createElement(a)),
        this.domElement.classList.add(`lil-controller`),
        this.domElement.classList.add(i),
        (this.$name = document.createElement(`div`)),
        this.$name.classList.add(`lil-name`),
        (e.nextNameID = e.nextNameID || 0),
        (this.$name.id = `lil-gui-name-${++e.nextNameID}`),
        (this.$widget = document.createElement(`div`)),
        this.$widget.classList.add(`lil-widget`),
        (this.$disable = this.$widget),
        this.domElement.appendChild(this.$name),
        this.domElement.appendChild(this.$widget),
        this.domElement.addEventListener(`keydown`, (e) => e.stopPropagation()),
        this.domElement.addEventListener(`keyup`, (e) => e.stopPropagation()),
        this.parent.children.push(this),
        this.parent.controllers.push(this),
        this.parent.$children.appendChild(this.domElement),
        (this._listenCallback = this._listenCallback.bind(this)),
        this.name(r);
    }
    name(e) {
      return (this._name = e), (this.$name.textContent = e), this;
    }
    onChange(e) {
      return (this._onChange = e), this;
    }
    _callOnChange() {
      this.parent._callOnChange(this),
        this._onChange !== void 0 && this._onChange.call(this, this.getValue()),
        (this._changed = !0);
    }
    onFinishChange(e) {
      return (this._onFinishChange = e), this;
    }
    _callOnFinishChange() {
      this._changed &&
        (this.parent._callOnFinishChange(this),
        this._onFinishChange !== void 0 &&
          this._onFinishChange.call(this, this.getValue())),
        (this._changed = !1);
    }
    reset() {
      return this.setValue(this.initialValue), this._callOnFinishChange(), this;
    }
    enable(e = !0) {
      return this.disable(!e);
    }
    disable(e = !0) {
      return e === this._disabled
        ? this
        : ((this._disabled = e),
          this.domElement.classList.toggle(`lil-disabled`, e),
          this.$disable.toggleAttribute(`disabled`, e),
          this);
    }
    show(e = !0) {
      return (
        (this._hidden = !e),
        (this.domElement.style.display = this._hidden ? `none` : ``),
        this
      );
    }
    hide() {
      return this.show(!1);
    }
    options(e) {
      let t = this.parent.add(this.object, this.property, e);
      return t.name(this._name), this.destroy(), t;
    }
    min(e) {
      return this;
    }
    max(e) {
      return this;
    }
    step(e) {
      return this;
    }
    decimals(e) {
      return this;
    }
    listen(e = !0) {
      return (
        (this._listening = e),
        this._listenCallbackID !== void 0 &&
          (cancelAnimationFrame(this._listenCallbackID),
          (this._listenCallbackID = void 0)),
        this._listening && this._listenCallback(),
        this
      );
    }
    _listenCallback() {
      this._listenCallbackID = requestAnimationFrame(this._listenCallback);
      let e = this.save();
      e !== this._listenPrevValue && this.updateDisplay(),
        (this._listenPrevValue = e);
    }
    getValue() {
      return this.object[this.property];
    }
    setValue(e) {
      return (
        this.getValue() !== e &&
          ((this.object[this.property] = e),
          this._callOnChange(),
          this.updateDisplay()),
        this
      );
    }
    updateDisplay() {
      return this;
    }
    load(e) {
      return this.setValue(e), this._callOnFinishChange(), this;
    }
    save() {
      return this.getValue();
    }
    destroy() {
      this.listen(!1),
        this.parent.children.splice(this.parent.children.indexOf(this), 1),
        this.parent.controllers.splice(
          this.parent.controllers.indexOf(this),
          1,
        ),
        this.parent.$children.removeChild(this.domElement);
    }
  },
  Ha = class extends Va {
    constructor(e, t, n) {
      super(e, t, n, `lil-boolean`, `label`),
        (this.$input = document.createElement(`input`)),
        this.$input.setAttribute(`type`, `checkbox`),
        this.$input.setAttribute(`aria-labelledby`, this.$name.id),
        this.$widget.appendChild(this.$input),
        this.$input.addEventListener(`change`, () => {
          this.setValue(this.$input.checked), this._callOnFinishChange();
        }),
        (this.$disable = this.$input),
        this.updateDisplay();
    }
    updateDisplay() {
      return (this.$input.checked = this.getValue()), this;
    }
  };
function Ua(e) {
  let t, n;
  return (
    (t = e.match(/(#|0x)?([a-f0-9]{6})/i))
      ? (n = t[2])
      : (t = e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))
        ? (n =
            parseInt(t[1]).toString(16).padStart(2, 0) +
            parseInt(t[2]).toString(16).padStart(2, 0) +
            parseInt(t[3]).toString(16).padStart(2, 0))
        : (t = e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i)) &&
          (n = t[1] + t[1] + t[2] + t[2] + t[3] + t[3]),
    n ? `#` + n : !1
  );
}
var Wa = {
    isPrimitive: !0,
    match: (e) => typeof e == `string`,
    fromHexString: Ua,
    toHexString: Ua,
  },
  Ga = {
    isPrimitive: !0,
    match: (e) => typeof e == `number`,
    fromHexString: (e) => parseInt(e.substring(1), 16),
    toHexString: (e) => `#` + e.toString(16).padStart(6, 0),
  },
  Ka = [
    Wa,
    Ga,
    {
      isPrimitive: !1,
      match: (e) => Array.isArray(e) || ArrayBuffer.isView(e),
      fromHexString(e, t, n = 1) {
        let r = Ga.fromHexString(e);
        (t[0] = (((r >> 16) & 255) / 255) * n),
          (t[1] = (((r >> 8) & 255) / 255) * n),
          (t[2] = ((r & 255) / 255) * n);
      },
      toHexString([e, t, n], r = 1) {
        r = 255 / r;
        let i = ((e * r) << 16) ^ ((t * r) << 8) ^ ((n * r) << 0);
        return Ga.toHexString(i);
      },
    },
    {
      isPrimitive: !1,
      match: (e) => Object(e) === e,
      fromHexString(e, t, n = 1) {
        let r = Ga.fromHexString(e);
        (t.r = (((r >> 16) & 255) / 255) * n),
          (t.g = (((r >> 8) & 255) / 255) * n),
          (t.b = ((r & 255) / 255) * n);
      },
      toHexString({ r: e, g: t, b: n }, r = 1) {
        r = 255 / r;
        let i = ((e * r) << 16) ^ ((t * r) << 8) ^ ((n * r) << 0);
        return Ga.toHexString(i);
      },
    },
  ];
function qa(e) {
  return Ka.find((t) => t.match(e));
}
var Ja = class extends Va {
    constructor(e, t, n, r) {
      super(e, t, n, `lil-color`),
        (this.$input = document.createElement(`input`)),
        this.$input.setAttribute(`type`, `color`),
        this.$input.setAttribute(`tabindex`, -1),
        this.$input.setAttribute(`aria-labelledby`, this.$name.id),
        (this.$text = document.createElement(`input`)),
        this.$text.setAttribute(`type`, `text`),
        this.$text.setAttribute(`spellcheck`, `false`),
        this.$text.setAttribute(`aria-labelledby`, this.$name.id),
        (this.$display = document.createElement(`div`)),
        this.$display.classList.add(`lil-display`),
        this.$display.appendChild(this.$input),
        this.$widget.appendChild(this.$display),
        this.$widget.appendChild(this.$text),
        (this._format = qa(this.initialValue)),
        (this._rgbScale = r),
        (this._initialValueHexString = this.save()),
        (this._textFocused = !1),
        this.$input.addEventListener(`input`, () => {
          this._setValueFromHexString(this.$input.value);
        }),
        this.$input.addEventListener(`blur`, () => {
          this._callOnFinishChange();
        }),
        this.$text.addEventListener(`input`, () => {
          let e = Ua(this.$text.value);
          e && this._setValueFromHexString(e);
        }),
        this.$text.addEventListener(`focus`, () => {
          (this._textFocused = !0), this.$text.select();
        }),
        this.$text.addEventListener(`blur`, () => {
          (this._textFocused = !1),
            this.updateDisplay(),
            this._callOnFinishChange();
        }),
        (this.$disable = this.$text),
        this.updateDisplay();
    }
    reset() {
      return this._setValueFromHexString(this._initialValueHexString), this;
    }
    _setValueFromHexString(e) {
      if (this._format.isPrimitive) {
        let t = this._format.fromHexString(e);
        this.setValue(t);
      } else
        this._format.fromHexString(e, this.getValue(), this._rgbScale),
          this._callOnChange(),
          this.updateDisplay();
    }
    save() {
      return this._format.toHexString(this.getValue(), this._rgbScale);
    }
    load(e) {
      return this._setValueFromHexString(e), this._callOnFinishChange(), this;
    }
    updateDisplay() {
      return (
        (this.$input.value = this._format.toHexString(
          this.getValue(),
          this._rgbScale,
        )),
        this._textFocused ||
          (this.$text.value = this.$input.value.substring(1)),
        (this.$display.style.backgroundColor = this.$input.value),
        this
      );
    }
  },
  Ya = class extends Va {
    constructor(e, t, n) {
      super(e, t, n, `lil-function`),
        (this.$button = document.createElement(`button`)),
        this.$button.appendChild(this.$name),
        this.$widget.appendChild(this.$button),
        this.$button.addEventListener(`click`, (e) => {
          e.preventDefault(),
            this.getValue().call(this.object),
            this._callOnChange();
        }),
        this.$button.addEventListener(`touchstart`, () => {}, { passive: !0 }),
        (this.$disable = this.$button);
    }
  },
  Xa = class extends Va {
    constructor(e, t, n, r, i, a) {
      super(e, t, n, `lil-number`), this._initInput(), this.min(r), this.max(i);
      let o = a !== void 0;
      this.step(o ? a : this._getImplicitStep(), o), this.updateDisplay();
    }
    decimals(e) {
      return (this._decimals = e), this.updateDisplay(), this;
    }
    min(e) {
      return (this._min = e), this._onUpdateMinMax(), this;
    }
    max(e) {
      return (this._max = e), this._onUpdateMinMax(), this;
    }
    step(e, t = !0) {
      return (this._step = e), (this._stepExplicit = t), this;
    }
    updateDisplay() {
      let e = this.getValue();
      if (this._hasSlider) {
        let t = (e - this._min) / (this._max - this._min);
        (t = Math.max(0, Math.min(t, 1))),
          (this.$fill.style.width = t * 100 + `%`);
      }
      return (
        this._inputFocused ||
          (this.$input.value =
            this._decimals === void 0 ? e : e.toFixed(this._decimals)),
        this
      );
    }
    _initInput() {
      (this.$input = document.createElement(`input`)),
        this.$input.setAttribute(`type`, `text`),
        this.$input.setAttribute(`aria-labelledby`, this.$name.id),
        window.matchMedia(`(pointer: coarse)`).matches &&
          (this.$input.setAttribute(`type`, `number`),
          this.$input.setAttribute(`step`, `any`)),
        this.$widget.appendChild(this.$input),
        (this.$disable = this.$input);
      let e = () => {
          let e = parseFloat(this.$input.value);
          isNaN(e) ||
            (this._stepExplicit && (e = this._snap(e)),
            this.setValue(this._clamp(e)));
        },
        t = (e) => {
          let t = parseFloat(this.$input.value);
          isNaN(t) ||
            (this._snapClampSetValue(t + e),
            (this.$input.value = this.getValue()));
        },
        n = (e) => {
          e.key === `Enter` && this.$input.blur(),
            e.code === `ArrowUp` &&
              (e.preventDefault(), t(this._step * this._arrowKeyMultiplier(e))),
            e.code === `ArrowDown` &&
              (e.preventDefault(),
              t(this._step * this._arrowKeyMultiplier(e) * -1));
        },
        r = (e) => {
          this._inputFocused &&
            (e.preventDefault(), t(this._step * this._normalizeMouseWheel(e)));
        },
        i = !1,
        a,
        o,
        s,
        c,
        l,
        u = (e) => {
          (a = e.clientX),
            (o = s = e.clientY),
            (i = !0),
            (c = this.getValue()),
            (l = 0),
            window.addEventListener(`mousemove`, d),
            window.addEventListener(`mouseup`, f);
        },
        d = (e) => {
          if (i) {
            let t = e.clientX - a,
              n = e.clientY - o;
            Math.abs(n) > 5
              ? (e.preventDefault(),
                this.$input.blur(),
                (i = !1),
                this._setDraggingStyle(!0, `vertical`))
              : Math.abs(t) > 5 && f();
          }
          if (!i) {
            let t = e.clientY - s;
            (l -= t * this._step * this._arrowKeyMultiplier(e)),
              c + l > this._max
                ? (l = this._max - c)
                : c + l < this._min && (l = this._min - c),
              this._snapClampSetValue(c + l);
          }
          s = e.clientY;
        },
        f = () => {
          this._setDraggingStyle(!1, `vertical`),
            this._callOnFinishChange(),
            window.removeEventListener(`mousemove`, d),
            window.removeEventListener(`mouseup`, f);
        };
      this.$input.addEventListener(`input`, e),
        this.$input.addEventListener(`keydown`, n),
        this.$input.addEventListener(`wheel`, r, { passive: !1 }),
        this.$input.addEventListener(`mousedown`, u),
        this.$input.addEventListener(`focus`, () => {
          this._inputFocused = !0;
        }),
        this.$input.addEventListener(`blur`, () => {
          (this._inputFocused = !1),
            this.updateDisplay(),
            this._callOnFinishChange();
        });
    }
    _initSlider() {
      (this._hasSlider = !0),
        (this.$slider = document.createElement(`div`)),
        this.$slider.classList.add(`lil-slider`),
        (this.$fill = document.createElement(`div`)),
        this.$fill.classList.add(`lil-fill`),
        this.$slider.appendChild(this.$fill),
        this.$widget.insertBefore(this.$slider, this.$input),
        this.domElement.classList.add(`lil-has-slider`);
      let e = (e, t, n, r, i) => ((e - t) / (n - t)) * (i - r) + r,
        t = (t) => {
          let n = this.$slider.getBoundingClientRect(),
            r = e(t, n.left, n.right, this._min, this._max);
          this._snapClampSetValue(r);
        },
        n = (e) => {
          this._setDraggingStyle(!0),
            t(e.clientX),
            window.addEventListener(`mousemove`, r),
            window.addEventListener(`mouseup`, i);
        },
        r = (e) => {
          t(e.clientX);
        },
        i = () => {
          this._callOnFinishChange(),
            this._setDraggingStyle(!1),
            window.removeEventListener(`mousemove`, r),
            window.removeEventListener(`mouseup`, i);
        },
        a = !1,
        o,
        s,
        c = (e) => {
          e.preventDefault(),
            this._setDraggingStyle(!0),
            t(e.touches[0].clientX),
            (a = !1);
        },
        l = (e) => {
          e.touches.length > 1 ||
            (this._hasScrollBar
              ? ((o = e.touches[0].clientX),
                (s = e.touches[0].clientY),
                (a = !0))
              : c(e),
            window.addEventListener(`touchmove`, u, { passive: !1 }),
            window.addEventListener(`touchend`, d));
        },
        u = (e) => {
          if (a) {
            let t = e.touches[0].clientX - o,
              n = e.touches[0].clientY - s;
            Math.abs(t) > Math.abs(n)
              ? c(e)
              : (window.removeEventListener(`touchmove`, u),
                window.removeEventListener(`touchend`, d));
          } else e.preventDefault(), t(e.touches[0].clientX);
        },
        d = () => {
          this._callOnFinishChange(),
            this._setDraggingStyle(!1),
            window.removeEventListener(`touchmove`, u),
            window.removeEventListener(`touchend`, d);
        },
        f = this._callOnFinishChange.bind(this),
        p;
      this.$slider.addEventListener(`mousedown`, n),
        this.$slider.addEventListener(`touchstart`, l, { passive: !1 }),
        this.$slider.addEventListener(
          `wheel`,
          (e) => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && this._hasScrollBar)
              return;
            e.preventDefault();
            let t = this._normalizeMouseWheel(e) * this._step;
            this._snapClampSetValue(this.getValue() + t),
              (this.$input.value = this.getValue()),
              clearTimeout(p),
              (p = setTimeout(f, 400));
          },
          { passive: !1 },
        );
    }
    _setDraggingStyle(e, t = `horizontal`) {
      this.$slider && this.$slider.classList.toggle(`lil-active`, e),
        document.body.classList.toggle(`lil-dragging`, e),
        document.body.classList.toggle(`lil-${t}`, e);
    }
    _getImplicitStep() {
      return this._hasMin && this._hasMax ? (this._max - this._min) / 1e3 : 0.1;
    }
    _onUpdateMinMax() {
      !this._hasSlider &&
        this._hasMin &&
        this._hasMax &&
        (this._stepExplicit || this.step(this._getImplicitStep(), !1),
        this._initSlider(),
        this.updateDisplay());
    }
    _normalizeMouseWheel(e) {
      let { deltaX: t, deltaY: n } = e;
      return (
        Math.floor(e.deltaY) !== e.deltaY &&
          e.wheelDelta &&
          ((t = 0),
          (n = -e.wheelDelta / 120),
          (n *= this._stepExplicit ? 1 : 10)),
        t + -n
      );
    }
    _arrowKeyMultiplier(e) {
      let t = this._stepExplicit ? 1 : 10;
      return e.shiftKey ? (t *= 10) : e.altKey && (t /= 10), t;
    }
    _snap(e) {
      let t = 0;
      return (
        this._hasMin ? (t = this._min) : this._hasMax && (t = this._max),
        (e -= t),
        (e = Math.round(e / this._step) * this._step),
        (e += t),
        (e = parseFloat(e.toPrecision(15))),
        e
      );
    }
    _clamp(e) {
      return (
        e < this._min && (e = this._min), e > this._max && (e = this._max), e
      );
    }
    _snapClampSetValue(e) {
      this.setValue(this._clamp(this._snap(e)));
    }
    get _hasScrollBar() {
      let e = this.parent.root.$children;
      return e.scrollHeight > e.clientHeight;
    }
    get _hasMin() {
      return this._min !== void 0;
    }
    get _hasMax() {
      return this._max !== void 0;
    }
  },
  Za = class extends Va {
    constructor(e, t, n, r) {
      super(e, t, n, `lil-option`),
        (this.$select = document.createElement(`select`)),
        this.$select.setAttribute(`aria-labelledby`, this.$name.id),
        (this.$display = document.createElement(`div`)),
        this.$display.classList.add(`lil-display`),
        this.$select.addEventListener(`change`, () => {
          this.setValue(this._values[this.$select.selectedIndex]),
            this._callOnFinishChange();
        }),
        this.$select.addEventListener(`focus`, () => {
          this.$display.classList.add(`lil-focus`);
        }),
        this.$select.addEventListener(`blur`, () => {
          this.$display.classList.remove(`lil-focus`);
        }),
        this.$widget.appendChild(this.$select),
        this.$widget.appendChild(this.$display),
        (this.$disable = this.$select),
        this.options(r);
    }
    options(e) {
      return (
        (this._values = Array.isArray(e) ? e : Object.values(e)),
        (this._names = Array.isArray(e) ? e : Object.keys(e)),
        this.$select.replaceChildren(),
        this._names.forEach((e) => {
          let t = document.createElement(`option`);
          (t.textContent = e), this.$select.appendChild(t);
        }),
        this.updateDisplay(),
        this
      );
    }
    updateDisplay() {
      let e = this.getValue(),
        t = this._values.indexOf(e);
      return (
        (this.$select.selectedIndex = t),
        (this.$display.textContent = t === -1 ? e : this._names[t]),
        this
      );
    }
  },
  Qa = class extends Va {
    constructor(e, t, n) {
      super(e, t, n, `lil-string`),
        (this.$input = document.createElement(`input`)),
        this.$input.setAttribute(`type`, `text`),
        this.$input.setAttribute(`spellcheck`, `false`),
        this.$input.setAttribute(`aria-labelledby`, this.$name.id),
        this.$input.addEventListener(`input`, () => {
          this.setValue(this.$input.value);
        }),
        this.$input.addEventListener(`keydown`, (e) => {
          e.code === `Enter` && this.$input.blur();
        }),
        this.$input.addEventListener(`blur`, () => {
          this._callOnFinishChange();
        }),
        this.$widget.appendChild(this.$input),
        (this.$disable = this.$input),
        this.updateDisplay();
    }
    updateDisplay() {
      return (this.$input.value = this.getValue()), this;
    }
  },
  $a = `.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;
function eo(e) {
  let t = document.createElement(`style`);
  t.innerHTML = e;
  let n = document.querySelector(`head link[rel=stylesheet], head style`);
  n ? document.head.insertBefore(t, n) : document.head.appendChild(t);
}
var to = !1,
  no = class e {
    constructor({
      parent: e,
      autoPlace: t = e === void 0,
      container: n,
      width: r,
      title: i = `Controls`,
      closeFolders: a = !1,
      injectStyles: o = !0,
      touchStyles: s = !0,
    } = {}) {
      if (
        ((this.parent = e),
        (this.root = e ? e.root : this),
        (this.children = []),
        (this.controllers = []),
        (this.folders = []),
        (this._closed = !1),
        (this._hidden = !1),
        (this.domElement = document.createElement(`div`)),
        this.domElement.classList.add(`lil-gui`),
        (this.$title = document.createElement(`button`)),
        this.$title.classList.add(`lil-title`),
        this.$title.setAttribute(`aria-expanded`, !0),
        this.$title.addEventListener(`click`, () =>
          this.openAnimated(this._closed),
        ),
        this.$title.addEventListener(`touchstart`, () => {}, { passive: !0 }),
        (this.$children = document.createElement(`div`)),
        this.$children.classList.add(`lil-children`),
        this.domElement.appendChild(this.$title),
        this.domElement.appendChild(this.$children),
        this.title(i),
        this.parent)
      ) {
        this.parent.children.push(this),
          this.parent.folders.push(this),
          this.parent.$children.appendChild(this.domElement);
        return;
      }
      this.domElement.classList.add(`lil-root`),
        s && this.domElement.classList.add(`lil-allow-touch-styles`),
        !to && o && (eo($a), (to = !0)),
        n
          ? n.appendChild(this.domElement)
          : t &&
            (this.domElement.classList.add(`lil-auto-place`, `autoPlace`),
            document.body.appendChild(this.domElement)),
        r && this.domElement.style.setProperty(`--width`, r + `px`),
        (this._closeFolders = a);
    }
    add(e, t, n, r, i) {
      if (Object(n) === n) return new Za(this, e, t, n);
      let a = e[t];
      switch (typeof a) {
        case `number`:
          return new Xa(this, e, t, n, r, i);
        case `boolean`:
          return new Ha(this, e, t);
        case `string`:
          return new Qa(this, e, t);
        case `function`:
          return new Ya(this, e, t);
      }
      console.error(
        `gui.add failed
	property:`,
        t,
        `
	object:`,
        e,
        `
	value:`,
        a,
      );
    }
    addColor(e, t, n = 1) {
      return new Ja(this, e, t, n);
    }
    addFolder(t) {
      let n = new e({ parent: this, title: t });
      return this.root._closeFolders && n.close(), n;
    }
    load(e, t = !0) {
      return (
        e.controllers &&
          this.controllers.forEach((t) => {
            t instanceof Ya ||
              (t._name in e.controllers && t.load(e.controllers[t._name]));
          }),
        t &&
          e.folders &&
          this.folders.forEach((t) => {
            t._title in e.folders && t.load(e.folders[t._title]);
          }),
        this
      );
    }
    save(e = !0) {
      let t = { controllers: {}, folders: {} };
      return (
        this.controllers.forEach((e) => {
          if (!(e instanceof Ya)) {
            if (e._name in t.controllers)
              throw Error(
                `Cannot save GUI with duplicate property "${e._name}"`,
              );
            t.controllers[e._name] = e.save();
          }
        }),
        e &&
          this.folders.forEach((e) => {
            if (e._title in t.folders)
              throw Error(
                `Cannot save GUI with duplicate folder "${e._title}"`,
              );
            t.folders[e._title] = e.save();
          }),
        t
      );
    }
    open(e = !0) {
      return (
        this._setClosed(!e),
        this.$title.setAttribute(`aria-expanded`, !this._closed),
        this.domElement.classList.toggle(`lil-closed`, this._closed),
        this
      );
    }
    close() {
      return this.open(!1);
    }
    _setClosed(e) {
      this._closed !== e && ((this._closed = e), this._callOnOpenClose(this));
    }
    show(e = !0) {
      return (
        (this._hidden = !e),
        (this.domElement.style.display = this._hidden ? `none` : ``),
        this
      );
    }
    hide() {
      return this.show(!1);
    }
    openAnimated(e = !0) {
      return (
        this._setClosed(!e),
        this.$title.setAttribute(`aria-expanded`, !this._closed),
        requestAnimationFrame(() => {
          let t = this.$children.clientHeight;
          (this.$children.style.height = t + `px`),
            this.domElement.classList.add(`lil-transition`);
          let n = (e) => {
            e.target === this.$children &&
              ((this.$children.style.height = ``),
              this.domElement.classList.remove(`lil-transition`),
              this.$children.removeEventListener(`transitionend`, n));
          };
          this.$children.addEventListener(`transitionend`, n);
          let r = e ? this.$children.scrollHeight : 0;
          this.domElement.classList.toggle(`lil-closed`, !e),
            requestAnimationFrame(() => {
              this.$children.style.height = r + `px`;
            });
        }),
        this
      );
    }
    title(e) {
      return (this._title = e), (this.$title.textContent = e), this;
    }
    reset(e = !0) {
      return (
        (e ? this.controllersRecursive() : this.controllers).forEach((e) =>
          e.reset(),
        ),
        this
      );
    }
    onChange(e) {
      return (this._onChange = e), this;
    }
    _callOnChange(e) {
      this.parent && this.parent._callOnChange(e),
        this._onChange !== void 0 &&
          this._onChange.call(this, {
            object: e.object,
            property: e.property,
            value: e.getValue(),
            controller: e,
          });
    }
    onFinishChange(e) {
      return (this._onFinishChange = e), this;
    }
    _callOnFinishChange(e) {
      this.parent && this.parent._callOnFinishChange(e),
        this._onFinishChange !== void 0 &&
          this._onFinishChange.call(this, {
            object: e.object,
            property: e.property,
            value: e.getValue(),
            controller: e,
          });
    }
    onOpenClose(e) {
      return (this._onOpenClose = e), this;
    }
    _callOnOpenClose(e) {
      this.parent && this.parent._callOnOpenClose(e),
        this._onOpenClose !== void 0 && this._onOpenClose.call(this, e);
    }
    destroy() {
      this.parent &&
        (this.parent.children.splice(this.parent.children.indexOf(this), 1),
        this.parent.folders.splice(this.parent.folders.indexOf(this), 1)),
        this.domElement.parentElement &&
          this.domElement.parentElement.removeChild(this.domElement),
        Array.from(this.children).forEach((e) => e.destroy());
    }
    controllersRecursive() {
      let e = Array.from(this.controllers);
      return (
        this.folders.forEach((t) => {
          e = e.concat(t.controllersRecursive());
        }),
        e
      );
    }
    foldersRecursive() {
      let e = Array.from(this.folders);
      return (
        this.folders.forEach((t) => {
          e = e.concat(t.foldersRecursive());
        }),
        e
      );
    }
  },
  ro = class {
    gui;
    constructor({ onResize: e, settings: t, stats: n }) {
      (this.gui = new no({ title: `Cassettes` })),
        this.gui.add(n, `calls`).name(`draw calls`).disable().listen(),
        this.gui.add(n, `resolution`).name(`pixel ratio`).disable().listen(),
        this.gui.add(t, `adaptiveResolution`).onChange(e),
        this.gui.add(t, `frameRate`, 30, 240, 1);
      let r = this.gui.addFolder(`Motion`);
      r.add(t, `spin`, -2, 2, 0.01),
        r.add(t, `parallax`, 0, 3, 0.01),
        r.add(t, `volume`, 0, 1.5, 0.01);
      let i = this.gui.addFolder(`Materials`);
      i.add(t, `roughness`, 0, 0.6, 0.001),
        i.add(t, `glassOpacity`, 0, 1, 0.01),
        i.add(t, `edgeGlow`, 0, 10, 0.01),
        i.add(t, `glints`, 0, 30, 0.1);
      let a = this.gui.addFolder(`Lights`);
      a.add(t, `keyIntensity`, 0, 10, 0.01),
        a.add(t, `rimIntensity`, 0, 30, 0.01),
        a.add(t, `coreIntensity`, 0, 30, 0.01),
        a.add(t, `environmentIntensity`, 0, 4, 0.01);
      let o = this.gui.addFolder(`Lens`);
      o.add(t, `focus`, -2, 2, 0.01),
        o.add(t, `aperture`, 0, 0.06, 5e-4),
        o.add(t, `lensMaximum`, 0, 40, 1),
        o.add(t, `shutter`, 0, 12, 0.01);
      let s = this.gui.addFolder(`Post`);
      s.add(t, `bloom`, 0, 3, 0.01),
        s.add(t, `bloomRadius`, 0.5, 3, 0.01),
        s.add(t, `threshold`, 0, 4, 0.01),
        s.add(t, `exposure`, 0, 5, 0.01),
        s.add(t, `contrast`, 0.5, 2, 0.01),
        s.add(t, `saturation`, 0, 2, 0.01),
        s.add(t, `aberration`, 0, 0.1, 0.001),
        s.add(t, `vignette`, 0, 1.5, 0.01),
        s.add(t, `grain`, 0, 0.3, 0.001);
    }
  },
  io = `// A black studio with a few emissive panels, prefiltered once into a cube with one roughness per level. The clear
// shells only show what they reflect, so these panels are most of what you see on them. The panels are evaluated as
// rectangles hit by a ray from the centre, so no level is ever rendered from a coarser one.

const PI: f32 = 3.141592653589793;

const PANELS: u32 = 5u;

struct Panel {
  // xyz centre, w half width.
  center: vec4f,
  // xyz facing the centre of the studio, w half height.
  normal: vec4f,
  // xyz the panel's own X, w unused.
  across: vec4f,
  color: vec4f,
}

struct Uniforms {
  panels: array<Panel, 5>,
  // x face, y roughness, z samples, w face size.
  destination: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Vertex stage for OGPU's shared fullscreen triangle (gpu.TRIANGLE). UV runs 0..1 with y down, matching textures.
struct Vertex {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  var out: VertexOutput;

  out.position = vec4f(in.position.xy, 0.0, 1.0);
  out.uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  return out;
}


// The direction through a texel of a cube face, faces in the order +X, -X, +Y, -Y, +Z, -Z.
fn faceDirection(face: u32, uv: vec2f) -> vec3f {
  let u = uv.x * 2.0 - 1.0;
  let v = uv.y * 2.0 - 1.0;

  switch face {
    case 0u: { return normalize(vec3f(1.0, -v, -u)); }
    case 1u: { return normalize(vec3f(-1.0, -v, u)); }
    case 2u: { return normalize(vec3f(u, 1.0, v)); }
    case 3u: { return normalize(vec3f(u, -1.0, -v)); }
    case 4u: { return normalize(vec3f(u, -v, 1.0)); }
    default: { return normalize(vec3f(-u, -v, -1.0)); }
  }
}

// What the studio shows along a direction: the nearest panel it hits, or black.
fn radiance(direction: vec3f) -> vec3f {
  var nearest = 1e9;
  var color = vec3f(0.0);

  for (var index = 0u; index < PANELS; index++) {
    let panel = uniforms.panels[index];
    let facing = dot(direction, panel.normal.xyz);

    if (abs(facing) < 1e-5) {
      continue;
    }

    let distance = dot(panel.center.xyz, panel.normal.xyz) / facing;

    if (distance <= 0.0 || distance >= nearest) {
      continue;
    }

    let local = direction * distance - panel.center.xyz;
    let up = cross(panel.normal.xyz, panel.across.xyz);

    if (abs(dot(local, panel.across.xyz)) <= panel.center.w && abs(dot(local, up)) <= panel.normal.w) {
      nearest = distance;
      color = panel.color.rgb;
    }
  }

  return color;
}

fn radicalInverse(input: u32) -> f32 {
  var bits = input;

  bits = (bits << 16u) | (bits >> 16u);
  bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
  bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
  bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
  bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);

  return f32(bits) * 2.3283064365386963e-10;
}

// GGX importance sampling around the normal, the view taken along it (Karis, "Real Shading in Unreal Engine 4").
fn importanceSample(point: vec2f, normal: vec3f, roughness: f32) -> vec3f {
  let alpha = roughness * roughness;
  let phi = 2.0 * PI * point.x;
  let cosine = sqrt((1.0 - point.y) / (1.0 + (alpha * alpha - 1.0) * point.y));
  let sine = sqrt(1.0 - cosine * cosine);
  let halfVector = vec3f(sine * cos(phi), sine * sin(phi), cosine);
  let up = select(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 0.0, 1.0), abs(normal.z) < 0.999);
  let tangent = normalize(cross(up, normal));
  let bitangent = cross(normal, tangent);

  return tangent * halfVector.x + bitangent * halfVector.y + normal * halfVector.z;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let face = u32(uniforms.destination.x);
  let normal = faceDirection(face, in.uv);
  let roughness = uniforms.destination.y;
  let samples = u32(uniforms.destination.z);

  // A sharp level is the studio itself, a little supersampled across the texel.
  if (roughness <= 0.0) {
    let texel = 1.0 / uniforms.destination.w;
    var color = vec3f(0.0);

    for (var index = 0u; index < 16u; index++) {
      let offset = (vec2f(f32(index % 4u), f32(index / 4u)) + 0.5) / 4.0 - 0.5;

      color += radiance(faceDirection(face, in.uv + offset * texel));
    }

    return vec4f(color / 16.0, 1.0);
  }

  var color = vec3f(0.0);
  var weight = 0.0;

  for (var index = 0u; index < samples; index++) {
    let point = vec2f(f32(index) / f32(samples), radicalInverse(index));
    let halfVector = importanceSample(point, normal, roughness);
    let light = normalize(2.0 * dot(normal, halfVector) * halfVector - normal);
    let dotNL = dot(normal, light);

    if (dotNL > 0.0) {
      color += radiance(light) * dotNL;
      weight += dotNL;
    }
  }

  return vec4f(color / max(weight, 1e-4), 1.0);
}
`,
  ao = [
    {
      color: $i.rim,
      height: 2.4,
      intensity: 7,
      position: [2.6, -0.4, -2.4],
      width: 3.4,
    },
    {
      color: $i.rim,
      height: 0.3,
      intensity: 10,
      position: [-3, -1.6, -0.8],
      width: 2.4,
    },
    {
      color: $i.glow,
      height: 1.6,
      intensity: 4,
      position: [-2.2, 0.4, -2.8],
      width: 0.6,
    },
    {
      color: $i.key,
      height: 0.35,
      intensity: 6,
      position: [-1.4, 3, 1.4],
      width: 3.4,
    },
    {
      color: $i.key,
      height: 1.2,
      intensity: 1.6,
      position: [2.6, 1.2, 2.2],
      width: 0.5,
    },
  ],
  oo = [-1.6, 2.6, 2.2],
  so = [2.4, -0.8, -2.6],
  co = [-2.6, -1.4, -1.2],
  lo = 1024;
function uo(e) {
  let t = sa(ra(e.position, -1));
  return {
    across: [...sa(aa([0, 1, 0], t)), 0],
    center: [...e.position, e.width / 2],
    color: [...Ti(e.color).map((t) => t * e.intensity), 1],
    normal: [...t, e.height / 2],
  };
}
var fo = class {
    environment;
    key = sa(oo);
    keyIntensity = 0;
    rim = sa(so);
    rimFill = sa(co);
    rimFillIntensity = 0;
    rimIntensity = 0;
    constructor(e) {
      t(this), (this.environment = this.createEnvironment(e));
    }
    createEnvironment(e) {
      let t = e.device.createTexture({
          format: Ma,
          label: `environment`,
          mipLevelCount: 6,
          size: [256, 256, 6],
          textureBindingViewDimension: `cube`,
          usage:
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        }),
        n = new yi(e, {
          code: io,
          cullMode: `none`,
          depthStencil: !1,
          label: `environment`,
          targets: [{ format: Ma }],
          vertexBuffers: e.TRIANGLE.bufferLayouts,
        }),
        r = Ne(n.defs.uniforms.uniforms),
        i = ao.map(uo),
        a = e.device.createCommandEncoder({ label: `environment` }),
        o = [];
      for (let s = 0; s < 6; s++) {
        let c = s / 5,
          l = Math.max(256 >> s, 1);
        for (let u = 0; u < 6; u++) {
          let d = Ia(e, r.arrayBuffer.byteLength, `prefilter`);
          r.set({ destination: [u, c, lo, l], panels: i }),
            e.device.queue.writeBuffer(d, 0, r.arrayBuffer),
            bi(a, {
              bindGroup: Fa(e, n, 0, { uniforms: { buffer: d } }, `prefilter`),
              geometry: e.TRIANGLE,
              pipeline: n,
              targetView: t.createView({
                arrayLayerCount: 1,
                baseArrayLayer: u,
                baseMipLevel: s,
                dimension: `2d`,
                mipLevelCount: 1,
              }),
            }),
            o.push(d);
        }
      }
      return (
        e.device.queue.submit([a.finish()]),
        e.device.queue.onSubmittedWorkDone().then(() => {
          for (let e of o) e.destroy();
          n.destroy();
        }),
        t
      );
    }
    update({ pointer: e, settings: t }) {
      (this.key = sa([oo[0] + e.x * 1.4, oo[1] + e.y * 0.8, oo[2]])),
        (this.keyIntensity = t.keyIntensity),
        (this.rim = sa([so[0] - e.x * 0.8, so[1] - e.y * 0.5, so[2]])),
        (this.rimIntensity = t.rimIntensity),
        (this.rimFillIntensity = t.rimIntensity * 0.45);
    }
    destroy() {
      this.environment.destroy();
    }
  },
  po = `projectfocus`,
  mo = `projectblur`,
  ho = class {
    element;
    links;
    constructor({ element: e }) {
      t(this),
        (this.element = e),
        (this.links = Array.from(e.querySelectorAll(`a`))),
        this.element.addEventListener(`focusin`, this.onFocusIn),
        this.element.addEventListener(`focusout`, this.onFocusOut),
        this.element.addEventListener(`keydown`, this.onKeyDown);
    }
    highlight(e) {
      this.element.style.setProperty(`--active`, String(e)),
        this.links.forEach((t, n) => {
          t.parentElement?.style.setProperty(
            `--distance`,
            String(Math.min(Math.abs(n - e), 6)),
          ),
            t.parentElement?.classList.toggle(`is-active`, n === e);
        });
    }
    onFocusIn(e) {
      let t = Number(e.target?.dataset.index);
      Number.isNaN(t) ||
        (this.highlight(t),
        window.dispatchEvent(new CustomEvent(po, { detail: t })));
    }
    onFocusOut(e) {
      (e.relatedTarget instanceof Node &&
        this.element.contains(e.relatedTarget)) ||
        window.dispatchEvent(new CustomEvent(mo));
    }
    onKeyDown(e) {
      let t = this.links.indexOf(document.activeElement);
      if (e.key === `Escape`) {
        e.preventDefault(), document.activeElement?.blur();
        return;
      }
      let n = { ArrowDown: 1, ArrowRight: 1, ArrowLeft: -1, ArrowUp: -1 }[
        e.key
      ];
      n !== void 0 &&
        t !== -1 &&
        (e.preventDefault(),
        e.stopPropagation(),
        this.links[(t + n + this.links.length) % this.links.length]?.focus());
    }
  },
  go = 30,
  _o = 1,
  vo = 3,
  yo = 20,
  bo = 0.25,
  xo = class {
    cooldown = 3;
    failures = new Map();
    fastest = 1;
    maximum;
    minimum;
    ratio;
    samples = [];
    settled = 0;
    time = 0;
    constructor({ maximum: e, minimum: n, ratio: r }) {
      t(this),
        (this.maximum = e),
        (this.minimum = Math.min(n, e)),
        (this.ratio = Math.min(r, e));
    }
    update({ delta: e, target: t }) {
      (this.time += e),
        e > 1 / 500 && (this.fastest = Math.min(this.fastest, e));
      let n = Math.max(this.fastest, 1 / t);
      if (this.cooldown > 0)
        return (this.cooldown -= e), (this.samples = []), !1;
      if ((this.samples.push(e), this.samples.length < go)) return !1;
      let r = this.samples.sort((e, t) => e - t).slice(0, 28),
        i = r.reduce((e, t) => e + t, 0) / r.length;
      if (((this.samples = []), i > n * 1.08 && this.ratio > this.minimum))
        return (
          this.failures.set(this.ratio, this.time),
          this.change(Math.max(this.minimum, this.ratio - bo))
        );
      this.settled = i < n * 1.02 ? this.settled + i * r.length : 0;
      let a = Math.min(this.maximum, this.ratio + bo),
        o = this.failures.get(a),
        s = o === void 0 || this.time - o > yo;
      return this.settled > vo && a > this.ratio && s ? this.change(a) : !1;
    }
    change(e) {
      return (this.ratio = e), (this.settled = 0), (this.cooldown = _o), !0;
    }
  },
  So = `// Light leaking through the openings along the bottom edge, unlit.

// What every part of the tower shares: the frame, its material, and the instanced vertex stage. The fragment stage of
// each material is its own file (scene-*.wgsl).

const PI: f32 = 3.141592653589793;

const CORE_LIGHTS: u32 = 3u;

struct Uniforms {
  viewProjection: mat4x4f,
  tower: mat4x4f,
  camera: vec4f,
  // xyz towards the light, w intensity.
  key: vec4f,
  rim: vec4f,
  rimFill: vec4f,
  keyColor: vec4f,
  rimColor: vec4f,
  rimFillColor: vec4f,
  // xyz in the world, w intensity.
  core: array<vec4f, 3>,
  coreColor: vec4f,
  // x environment intensity, y roughness levels of the environment, z label columns, w label rows.
  environment: vec4f,
  // x edge glow, y glass opacity, z shell roughness, w glints.
  shell: vec4f,
  edgeColor: vec4f,
}

struct Material {
  // rgb colour, a unused.
  color: vec4f,
  // x metalness, y roughness, z bump scale, w 1 for the labels.
  surface: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(1) @binding(0) var<uniform> material: Material;

struct Vertex {
  @location(0) normal: vec3f,
  @location(1) position: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec4f,
  @location(4) matrix0: vec4f,
  @location(5) matrix1: vec4f,
  @location(6) matrix2: vec4f,
  @location(7) matrix3: vec4f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  let instance = mat4x4f(in.matrix0, in.matrix1, in.matrix2, in.matrix3);
  let world = uniforms.tower * instance * vec4f(in.position, 1.0);

  // Scaled instances (the packs, the tape) keep their normals perpendicular.
  let basis = mat3x3f(instance[0].xyz, instance[1].xyz, instance[2].xyz);
  var normal = in.normal / vec3f(dot(basis[0], basis[0]), dot(basis[1], basis[1]), dot(basis[2], basis[2]));

  normal = basis * normal;

  let tower = mat3x3f(uniforms.tower[0].xyz, uniforms.tower[1].xyz, uniforms.tower[2].xyz);
  var out: VertexOutput;

  out.position = uniforms.viewProjection * world;
  out.world = world.xyz;
  out.normal = tower * normal;
  out.uv = in.uv;
  out.color = in.color.rgb;

  // The label's instance colour carries its atlas cell, it doesn't tint it.
  if (material.surface.w > 0.5) {
    let cell = floor(in.color.r + 0.5);
    let columns = uniforms.environment.z;
    let rows = uniforms.environment.w;
    let column = cell - floor(cell / columns) * columns;
    let row = floor(cell / columns);

    out.uv = vec2f((column + in.uv.x) / columns, (row + 1.0 - in.uv.y) / rows);
  }

  return out;
}


@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  return vec4f(material.color.rgb * uniforms.shell.w * in.color, 1.0);
}
`,
  Co = `// The printed card, cut out where the atlas is transparent: the spindle holes and the window.

// What every part of the tower shares: the frame, its material, and the instanced vertex stage. The fragment stage of
// each material is its own file (scene-*.wgsl).

const PI: f32 = 3.141592653589793;

const CORE_LIGHTS: u32 = 3u;

struct Uniforms {
  viewProjection: mat4x4f,
  tower: mat4x4f,
  camera: vec4f,
  // xyz towards the light, w intensity.
  key: vec4f,
  rim: vec4f,
  rimFill: vec4f,
  keyColor: vec4f,
  rimColor: vec4f,
  rimFillColor: vec4f,
  // xyz in the world, w intensity.
  core: array<vec4f, 3>,
  coreColor: vec4f,
  // x environment intensity, y roughness levels of the environment, z label columns, w label rows.
  environment: vec4f,
  // x edge glow, y glass opacity, z shell roughness, w glints.
  shell: vec4f,
  edgeColor: vec4f,
}

struct Material {
  // rgb colour, a unused.
  color: vec4f,
  // x metalness, y roughness, z bump scale, w 1 for the labels.
  surface: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(1) @binding(0) var<uniform> material: Material;

struct Vertex {
  @location(0) normal: vec3f,
  @location(1) position: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec4f,
  @location(4) matrix0: vec4f,
  @location(5) matrix1: vec4f,
  @location(6) matrix2: vec4f,
  @location(7) matrix3: vec4f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  let instance = mat4x4f(in.matrix0, in.matrix1, in.matrix2, in.matrix3);
  let world = uniforms.tower * instance * vec4f(in.position, 1.0);

  // Scaled instances (the packs, the tape) keep their normals perpendicular.
  let basis = mat3x3f(instance[0].xyz, instance[1].xyz, instance[2].xyz);
  var normal = in.normal / vec3f(dot(basis[0], basis[0]), dot(basis[1], basis[1]), dot(basis[2], basis[2]));

  normal = basis * normal;

  let tower = mat3x3f(uniforms.tower[0].xyz, uniforms.tower[1].xyz, uniforms.tower[2].xyz);
  var out: VertexOutput;

  out.position = uniforms.viewProjection * world;
  out.world = world.xyz;
  out.normal = tower * normal;
  out.uv = in.uv;
  out.color = in.color.rgb;

  // The label's instance colour carries its atlas cell, it doesn't tint it.
  if (material.surface.w > 0.5) {
    let cell = floor(in.color.r + 0.5);
    let columns = uniforms.environment.z;
    let rows = uniforms.environment.w;
    let column = cell - floor(cell / columns) * columns;
    let row = floor(cell / columns);

    out.uv = vec2f((column + in.uv.x) / columns, (row + 1.0 - in.uv.y) / rows);
  }

  return out;
}

// MeshStandardMaterial's lighting, as three.js does it: GGX direct light from the key, the two rims and the core lights,
// and a prefiltered studio for the indirect light, with the multiple scattering of Fdez-Agüera. Needs chunks/scene.wgsl.

// Distance and decay of the core point lights.
const CORE_DISTANCE: f32 = 1.8;

@group(0) @binding(1) var tEnvironment: texture_cube<f32>;
@group(0) @binding(2) var linearSampler: sampler;

fn pow2(value: f32) -> f32 {
  return value * value;
}

fn fresnelSchlick(f0: vec3f, f90: f32, dotVH: f32) -> vec3f {
  let fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);

  return f0 * (1.0 - fresnel) + f90 * fresnel;
}

fn visibilitySmithCorrelated(alpha: f32, dotNL: f32, dotNV: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let view = dotNL * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNV));
  let light = dotNV * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNL));

  return 0.5 / max(view + light, 1e-6);
}

fn distributionGgx(alpha: f32, dotNH: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let denominator = pow2(dotNH) * (alphaSquared - 1.0) + 1.0;

  return alphaSquared / (PI * pow2(denominator));
}

fn brdfGgx(light: vec3f, view: vec3f, normal: vec3f, f0: vec3f, roughness: f32) -> vec3f {
  let alpha = pow2(roughness);
  let halfDirection = normalize(light + view);
  let dotNL = saturate(dot(normal, light));
  let dotNV = saturate(dot(normal, view));
  let dotNH = saturate(dot(normal, halfDirection));
  let dotVH = saturate(dot(view, halfDirection));

  return fresnelSchlick(f0, 1.0, dotVH) * visibilitySmithCorrelated(alpha, dotNL, dotNV) * distributionGgx(alpha, dotNH);
}

// Analytical approximation of the DFG term (Karis, mobile), as three.js uses it.
fn dfgApproximation(normal: vec3f, view: vec3f, roughness: f32) -> vec2f {
  let dotNV = saturate(dot(normal, view));
  let c0 = vec4f(-1.0, -0.0275, -0.572, 0.022);
  let c1 = vec4f(1.0, 0.0425, 1.04, -0.04);
  let r = roughness * c0 + c1;
  let a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;

  return vec2f(-1.04, 1.04) * a004 + r.zw;
}

fn environmentLevel(roughness: f32) -> f32 {
  return roughness * (uniforms.environment.y - 1.0);
}

fn environmentRadiance(view: vec3f, normal: vec3f, roughness: f32) -> vec3f {
  var reflected = reflect(-view, normal);

  reflected = normalize(mix(reflected, normal, roughness * roughness));

  return textureSampleLevel(tEnvironment, linearSampler, reflected, environmentLevel(roughness)).rgb *
    uniforms.environment.x;
}

fn environmentIrradiance(normal: vec3f) -> vec3f {
  return PI * textureSampleLevel(tEnvironment, linearSampler, normal, environmentLevel(1.0)).rgb *
    uniforms.environment.x;
}

// Normal roughness from the screen derivatives of the normal, so thin highlights don't sparkle.
fn geometryRoughness(normal: vec3f) -> f32 {
  let change = max(abs(dpdx(normal)), abs(dpdy(normal)));

  return max(max(change.x, change.y), change.z);
}

fn surfaceRoughness(normal: vec3f, roughness: f32) -> f32 {
  return min(max(roughness, 0.0525) + geometryRoughness(normal), 1.0);
}

struct Surface {
  albedo: vec3f,
  metalness: f32,
  normal: vec3f,
  roughness: f32,
  world: vec3f,
}

// Single and multiple scattering of the studio's specular light, x and y of the DFG term folded in.
struct Scattering {
  single: vec3f,
  multiple: vec3f,
}

fn scattering(normal: vec3f, view: vec3f, roughness: f32, f0: vec3f) -> Scattering {
  let dfg = dfgApproximation(normal, view, roughness);
  let single = f0 * dfg.x + dfg.y;
  let missing = 1.0 - (dfg.x + dfg.y);
  let average = f0 + (1.0 - f0) * 0.047619;

  return Scattering(single, single * average / (1.0 - missing * average) * missing);
}

fn directLight(surface: Surface, view: vec3f, light: vec3f, irradianceColor: vec3f, diffuse: vec3f, f0: vec3f) -> vec3f {
  let irradiance = saturate(dot(surface.normal, light)) * irradianceColor;

  return irradiance * (diffuse / PI + brdfGgx(light, view, surface.normal, f0, surface.roughness));
}

fn shade(surface: Surface, view: vec3f) -> vec3f {
  let diffuse = surface.albedo * (1.0 - surface.metalness);
  let f0 = mix(vec3f(0.04), surface.albedo, surface.metalness);
  var color = vec3f(0.0);

  color += directLight(surface, view, uniforms.key.xyz, uniforms.keyColor.rgb * uniforms.key.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rim.xyz, uniforms.rimColor.rgb * uniforms.rim.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rimFill.xyz, uniforms.rimFillColor.rgb * uniforms.rimFill.w, diffuse, f0);

  for (var index = 0u; index < CORE_LIGHTS; index++) {
    let core = uniforms.core[index];
    let toward = core.xyz - surface.world;
    let distance = length(toward);
    var falloff = 1.0 / max(distance * distance, 0.01);

    falloff *= pow2(saturate(1.0 - pow(distance / CORE_DISTANCE, 4.0)));
    color += directLight(surface, view, toward / distance, uniforms.coreColor.rgb * core.w * falloff, diffuse, f0);
  }

  // Indirect light from the studio, with multiple scattering.
  let specular = scattering(surface.normal, view, surface.roughness, f0);
  let total = specular.single + specular.multiple;
  let diffuseShare = diffuse * (1.0 - max(max(total.r, total.g), total.b));
  let irradiance = environmentIrradiance(surface.normal) / PI;

  color += environmentRadiance(view, surface.normal, surface.roughness) * specular.single;
  color += specular.multiple * irradiance;
  color += diffuseShare * irradiance;

  return color;
}

fn lit(in: VertexOutput, albedo: vec3f, normal: vec3f, roughness: f32) -> vec4f {
  let view = normalize(uniforms.camera.xyz - in.world);
  let surface = Surface(albedo, material.surface.x, normal, surfaceRoughness(normal, roughness), in.world);

  return vec4f(shade(surface, view), 1.0);
}


@group(1) @binding(1) var tLabels: texture_2d<f32>;

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let label = textureSample(tLabels, linearSampler, in.uv);

  if (label.a < 0.5) {
    discard;
  }

  return lit(in, label.rgb, normalize(in.normal), material.surface.y);
}
`,
  wo = `// Wound tape: the rings of the pack texture as roughness and bump.

// What every part of the tower shares: the frame, its material, and the instanced vertex stage. The fragment stage of
// each material is its own file (scene-*.wgsl).

const PI: f32 = 3.141592653589793;

const CORE_LIGHTS: u32 = 3u;

struct Uniforms {
  viewProjection: mat4x4f,
  tower: mat4x4f,
  camera: vec4f,
  // xyz towards the light, w intensity.
  key: vec4f,
  rim: vec4f,
  rimFill: vec4f,
  keyColor: vec4f,
  rimColor: vec4f,
  rimFillColor: vec4f,
  // xyz in the world, w intensity.
  core: array<vec4f, 3>,
  coreColor: vec4f,
  // x environment intensity, y roughness levels of the environment, z label columns, w label rows.
  environment: vec4f,
  // x edge glow, y glass opacity, z shell roughness, w glints.
  shell: vec4f,
  edgeColor: vec4f,
}

struct Material {
  // rgb colour, a unused.
  color: vec4f,
  // x metalness, y roughness, z bump scale, w 1 for the labels.
  surface: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(1) @binding(0) var<uniform> material: Material;

struct Vertex {
  @location(0) normal: vec3f,
  @location(1) position: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec4f,
  @location(4) matrix0: vec4f,
  @location(5) matrix1: vec4f,
  @location(6) matrix2: vec4f,
  @location(7) matrix3: vec4f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  let instance = mat4x4f(in.matrix0, in.matrix1, in.matrix2, in.matrix3);
  let world = uniforms.tower * instance * vec4f(in.position, 1.0);

  // Scaled instances (the packs, the tape) keep their normals perpendicular.
  let basis = mat3x3f(instance[0].xyz, instance[1].xyz, instance[2].xyz);
  var normal = in.normal / vec3f(dot(basis[0], basis[0]), dot(basis[1], basis[1]), dot(basis[2], basis[2]));

  normal = basis * normal;

  let tower = mat3x3f(uniforms.tower[0].xyz, uniforms.tower[1].xyz, uniforms.tower[2].xyz);
  var out: VertexOutput;

  out.position = uniforms.viewProjection * world;
  out.world = world.xyz;
  out.normal = tower * normal;
  out.uv = in.uv;
  out.color = in.color.rgb;

  // The label's instance colour carries its atlas cell, it doesn't tint it.
  if (material.surface.w > 0.5) {
    let cell = floor(in.color.r + 0.5);
    let columns = uniforms.environment.z;
    let rows = uniforms.environment.w;
    let column = cell - floor(cell / columns) * columns;
    let row = floor(cell / columns);

    out.uv = vec2f((column + in.uv.x) / columns, (row + 1.0 - in.uv.y) / rows);
  }

  return out;
}

// MeshStandardMaterial's lighting, as three.js does it: GGX direct light from the key, the two rims and the core lights,
// and a prefiltered studio for the indirect light, with the multiple scattering of Fdez-Agüera. Needs chunks/scene.wgsl.

// Distance and decay of the core point lights.
const CORE_DISTANCE: f32 = 1.8;

@group(0) @binding(1) var tEnvironment: texture_cube<f32>;
@group(0) @binding(2) var linearSampler: sampler;

fn pow2(value: f32) -> f32 {
  return value * value;
}

fn fresnelSchlick(f0: vec3f, f90: f32, dotVH: f32) -> vec3f {
  let fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);

  return f0 * (1.0 - fresnel) + f90 * fresnel;
}

fn visibilitySmithCorrelated(alpha: f32, dotNL: f32, dotNV: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let view = dotNL * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNV));
  let light = dotNV * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNL));

  return 0.5 / max(view + light, 1e-6);
}

fn distributionGgx(alpha: f32, dotNH: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let denominator = pow2(dotNH) * (alphaSquared - 1.0) + 1.0;

  return alphaSquared / (PI * pow2(denominator));
}

fn brdfGgx(light: vec3f, view: vec3f, normal: vec3f, f0: vec3f, roughness: f32) -> vec3f {
  let alpha = pow2(roughness);
  let halfDirection = normalize(light + view);
  let dotNL = saturate(dot(normal, light));
  let dotNV = saturate(dot(normal, view));
  let dotNH = saturate(dot(normal, halfDirection));
  let dotVH = saturate(dot(view, halfDirection));

  return fresnelSchlick(f0, 1.0, dotVH) * visibilitySmithCorrelated(alpha, dotNL, dotNV) * distributionGgx(alpha, dotNH);
}

// Analytical approximation of the DFG term (Karis, mobile), as three.js uses it.
fn dfgApproximation(normal: vec3f, view: vec3f, roughness: f32) -> vec2f {
  let dotNV = saturate(dot(normal, view));
  let c0 = vec4f(-1.0, -0.0275, -0.572, 0.022);
  let c1 = vec4f(1.0, 0.0425, 1.04, -0.04);
  let r = roughness * c0 + c1;
  let a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;

  return vec2f(-1.04, 1.04) * a004 + r.zw;
}

fn environmentLevel(roughness: f32) -> f32 {
  return roughness * (uniforms.environment.y - 1.0);
}

fn environmentRadiance(view: vec3f, normal: vec3f, roughness: f32) -> vec3f {
  var reflected = reflect(-view, normal);

  reflected = normalize(mix(reflected, normal, roughness * roughness));

  return textureSampleLevel(tEnvironment, linearSampler, reflected, environmentLevel(roughness)).rgb *
    uniforms.environment.x;
}

fn environmentIrradiance(normal: vec3f) -> vec3f {
  return PI * textureSampleLevel(tEnvironment, linearSampler, normal, environmentLevel(1.0)).rgb *
    uniforms.environment.x;
}

// Normal roughness from the screen derivatives of the normal, so thin highlights don't sparkle.
fn geometryRoughness(normal: vec3f) -> f32 {
  let change = max(abs(dpdx(normal)), abs(dpdy(normal)));

  return max(max(change.x, change.y), change.z);
}

fn surfaceRoughness(normal: vec3f, roughness: f32) -> f32 {
  return min(max(roughness, 0.0525) + geometryRoughness(normal), 1.0);
}

struct Surface {
  albedo: vec3f,
  metalness: f32,
  normal: vec3f,
  roughness: f32,
  world: vec3f,
}

// Single and multiple scattering of the studio's specular light, x and y of the DFG term folded in.
struct Scattering {
  single: vec3f,
  multiple: vec3f,
}

fn scattering(normal: vec3f, view: vec3f, roughness: f32, f0: vec3f) -> Scattering {
  let dfg = dfgApproximation(normal, view, roughness);
  let single = f0 * dfg.x + dfg.y;
  let missing = 1.0 - (dfg.x + dfg.y);
  let average = f0 + (1.0 - f0) * 0.047619;

  return Scattering(single, single * average / (1.0 - missing * average) * missing);
}

fn directLight(surface: Surface, view: vec3f, light: vec3f, irradianceColor: vec3f, diffuse: vec3f, f0: vec3f) -> vec3f {
  let irradiance = saturate(dot(surface.normal, light)) * irradianceColor;

  return irradiance * (diffuse / PI + brdfGgx(light, view, surface.normal, f0, surface.roughness));
}

fn shade(surface: Surface, view: vec3f) -> vec3f {
  let diffuse = surface.albedo * (1.0 - surface.metalness);
  let f0 = mix(vec3f(0.04), surface.albedo, surface.metalness);
  var color = vec3f(0.0);

  color += directLight(surface, view, uniforms.key.xyz, uniforms.keyColor.rgb * uniforms.key.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rim.xyz, uniforms.rimColor.rgb * uniforms.rim.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rimFill.xyz, uniforms.rimFillColor.rgb * uniforms.rimFill.w, diffuse, f0);

  for (var index = 0u; index < CORE_LIGHTS; index++) {
    let core = uniforms.core[index];
    let toward = core.xyz - surface.world;
    let distance = length(toward);
    var falloff = 1.0 / max(distance * distance, 0.01);

    falloff *= pow2(saturate(1.0 - pow(distance / CORE_DISTANCE, 4.0)));
    color += directLight(surface, view, toward / distance, uniforms.coreColor.rgb * core.w * falloff, diffuse, f0);
  }

  // Indirect light from the studio, with multiple scattering.
  let specular = scattering(surface.normal, view, surface.roughness, f0);
  let total = specular.single + specular.multiple;
  let diffuseShare = diffuse * (1.0 - max(max(total.r, total.g), total.b));
  let irradiance = environmentIrradiance(surface.normal) / PI;

  color += environmentRadiance(view, surface.normal, surface.roughness) * specular.single;
  color += specular.multiple * irradiance;
  color += diffuseShare * irradiance;

  return color;
}

fn lit(in: VertexOutput, albedo: vec3f, normal: vec3f, roughness: f32) -> vec4f {
  let view = normalize(uniforms.camera.xyz - in.world);
  let surface = Surface(albedo, material.surface.x, normal, surfaceRoughness(normal, roughness), in.world);

  return vec4f(shade(surface, view), 1.0);
}


@group(1) @binding(1) var tPack: texture_2d<f32>;

// three.js' bump mapping: the height's screen derivatives tilt the normal.
fn bump(world: vec3f, normal: vec3f, uv: vec2f, scale: f32) -> vec3f {
  let uvX = dpdx(uv);
  let uvY = dpdy(uv);
  let height = scale * textureSample(tPack, linearSampler, uv).x;
  let heightX = scale * textureSample(tPack, linearSampler, uv + uvX).x - height;
  let heightY = scale * textureSample(tPack, linearSampler, uv + uvY).x - height;
  let sigmaX = normalize(dpdx(world));
  let sigmaY = normalize(dpdy(world));
  let r1 = cross(sigmaY, normal);
  let r2 = cross(normal, sigmaX);
  let determinant = dot(sigmaX, r1);
  let gradient = sign(determinant) * (heightX * r1 + heightY * r2);

  return normalize(abs(determinant) * normal - gradient);
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let rings = textureSample(tPack, linearSampler, in.uv);
  let normal = bump(in.world, normalize(in.normal), in.uv, material.surface.z);

  return lit(in, material.color.rgb, normal, material.surface.y * rings.g);
}
`,
  To = `// Glass without transmission: diffuse off so clear plastic never turns milky, no direct lights (the shells are stacked
// several deep, each light would cost them the most), only the studio's reflections and an edge glow. Blended with ONE
// and ONE_MINUS_SRC_ALPHA, so the reflections add at full strength while what is behind only dims.

// What every part of the tower shares: the frame, its material, and the instanced vertex stage. The fragment stage of
// each material is its own file (scene-*.wgsl).

const PI: f32 = 3.141592653589793;

const CORE_LIGHTS: u32 = 3u;

struct Uniforms {
  viewProjection: mat4x4f,
  tower: mat4x4f,
  camera: vec4f,
  // xyz towards the light, w intensity.
  key: vec4f,
  rim: vec4f,
  rimFill: vec4f,
  keyColor: vec4f,
  rimColor: vec4f,
  rimFillColor: vec4f,
  // xyz in the world, w intensity.
  core: array<vec4f, 3>,
  coreColor: vec4f,
  // x environment intensity, y roughness levels of the environment, z label columns, w label rows.
  environment: vec4f,
  // x edge glow, y glass opacity, z shell roughness, w glints.
  shell: vec4f,
  edgeColor: vec4f,
}

struct Material {
  // rgb colour, a unused.
  color: vec4f,
  // x metalness, y roughness, z bump scale, w 1 for the labels.
  surface: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(1) @binding(0) var<uniform> material: Material;

struct Vertex {
  @location(0) normal: vec3f,
  @location(1) position: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec4f,
  @location(4) matrix0: vec4f,
  @location(5) matrix1: vec4f,
  @location(6) matrix2: vec4f,
  @location(7) matrix3: vec4f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  let instance = mat4x4f(in.matrix0, in.matrix1, in.matrix2, in.matrix3);
  let world = uniforms.tower * instance * vec4f(in.position, 1.0);

  // Scaled instances (the packs, the tape) keep their normals perpendicular.
  let basis = mat3x3f(instance[0].xyz, instance[1].xyz, instance[2].xyz);
  var normal = in.normal / vec3f(dot(basis[0], basis[0]), dot(basis[1], basis[1]), dot(basis[2], basis[2]));

  normal = basis * normal;

  let tower = mat3x3f(uniforms.tower[0].xyz, uniforms.tower[1].xyz, uniforms.tower[2].xyz);
  var out: VertexOutput;

  out.position = uniforms.viewProjection * world;
  out.world = world.xyz;
  out.normal = tower * normal;
  out.uv = in.uv;
  out.color = in.color.rgb;

  // The label's instance colour carries its atlas cell, it doesn't tint it.
  if (material.surface.w > 0.5) {
    let cell = floor(in.color.r + 0.5);
    let columns = uniforms.environment.z;
    let rows = uniforms.environment.w;
    let column = cell - floor(cell / columns) * columns;
    let row = floor(cell / columns);

    out.uv = vec2f((column + in.uv.x) / columns, (row + 1.0 - in.uv.y) / rows);
  }

  return out;
}

// MeshStandardMaterial's lighting, as three.js does it: GGX direct light from the key, the two rims and the core lights,
// and a prefiltered studio for the indirect light, with the multiple scattering of Fdez-Agüera. Needs chunks/scene.wgsl.

// Distance and decay of the core point lights.
const CORE_DISTANCE: f32 = 1.8;

@group(0) @binding(1) var tEnvironment: texture_cube<f32>;
@group(0) @binding(2) var linearSampler: sampler;

fn pow2(value: f32) -> f32 {
  return value * value;
}

fn fresnelSchlick(f0: vec3f, f90: f32, dotVH: f32) -> vec3f {
  let fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);

  return f0 * (1.0 - fresnel) + f90 * fresnel;
}

fn visibilitySmithCorrelated(alpha: f32, dotNL: f32, dotNV: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let view = dotNL * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNV));
  let light = dotNV * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNL));

  return 0.5 / max(view + light, 1e-6);
}

fn distributionGgx(alpha: f32, dotNH: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let denominator = pow2(dotNH) * (alphaSquared - 1.0) + 1.0;

  return alphaSquared / (PI * pow2(denominator));
}

fn brdfGgx(light: vec3f, view: vec3f, normal: vec3f, f0: vec3f, roughness: f32) -> vec3f {
  let alpha = pow2(roughness);
  let halfDirection = normalize(light + view);
  let dotNL = saturate(dot(normal, light));
  let dotNV = saturate(dot(normal, view));
  let dotNH = saturate(dot(normal, halfDirection));
  let dotVH = saturate(dot(view, halfDirection));

  return fresnelSchlick(f0, 1.0, dotVH) * visibilitySmithCorrelated(alpha, dotNL, dotNV) * distributionGgx(alpha, dotNH);
}

// Analytical approximation of the DFG term (Karis, mobile), as three.js uses it.
fn dfgApproximation(normal: vec3f, view: vec3f, roughness: f32) -> vec2f {
  let dotNV = saturate(dot(normal, view));
  let c0 = vec4f(-1.0, -0.0275, -0.572, 0.022);
  let c1 = vec4f(1.0, 0.0425, 1.04, -0.04);
  let r = roughness * c0 + c1;
  let a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;

  return vec2f(-1.04, 1.04) * a004 + r.zw;
}

fn environmentLevel(roughness: f32) -> f32 {
  return roughness * (uniforms.environment.y - 1.0);
}

fn environmentRadiance(view: vec3f, normal: vec3f, roughness: f32) -> vec3f {
  var reflected = reflect(-view, normal);

  reflected = normalize(mix(reflected, normal, roughness * roughness));

  return textureSampleLevel(tEnvironment, linearSampler, reflected, environmentLevel(roughness)).rgb *
    uniforms.environment.x;
}

fn environmentIrradiance(normal: vec3f) -> vec3f {
  return PI * textureSampleLevel(tEnvironment, linearSampler, normal, environmentLevel(1.0)).rgb *
    uniforms.environment.x;
}

// Normal roughness from the screen derivatives of the normal, so thin highlights don't sparkle.
fn geometryRoughness(normal: vec3f) -> f32 {
  let change = max(abs(dpdx(normal)), abs(dpdy(normal)));

  return max(max(change.x, change.y), change.z);
}

fn surfaceRoughness(normal: vec3f, roughness: f32) -> f32 {
  return min(max(roughness, 0.0525) + geometryRoughness(normal), 1.0);
}

struct Surface {
  albedo: vec3f,
  metalness: f32,
  normal: vec3f,
  roughness: f32,
  world: vec3f,
}

// Single and multiple scattering of the studio's specular light, x and y of the DFG term folded in.
struct Scattering {
  single: vec3f,
  multiple: vec3f,
}

fn scattering(normal: vec3f, view: vec3f, roughness: f32, f0: vec3f) -> Scattering {
  let dfg = dfgApproximation(normal, view, roughness);
  let single = f0 * dfg.x + dfg.y;
  let missing = 1.0 - (dfg.x + dfg.y);
  let average = f0 + (1.0 - f0) * 0.047619;

  return Scattering(single, single * average / (1.0 - missing * average) * missing);
}

fn directLight(surface: Surface, view: vec3f, light: vec3f, irradianceColor: vec3f, diffuse: vec3f, f0: vec3f) -> vec3f {
  let irradiance = saturate(dot(surface.normal, light)) * irradianceColor;

  return irradiance * (diffuse / PI + brdfGgx(light, view, surface.normal, f0, surface.roughness));
}

fn shade(surface: Surface, view: vec3f) -> vec3f {
  let diffuse = surface.albedo * (1.0 - surface.metalness);
  let f0 = mix(vec3f(0.04), surface.albedo, surface.metalness);
  var color = vec3f(0.0);

  color += directLight(surface, view, uniforms.key.xyz, uniforms.keyColor.rgb * uniforms.key.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rim.xyz, uniforms.rimColor.rgb * uniforms.rim.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rimFill.xyz, uniforms.rimFillColor.rgb * uniforms.rimFill.w, diffuse, f0);

  for (var index = 0u; index < CORE_LIGHTS; index++) {
    let core = uniforms.core[index];
    let toward = core.xyz - surface.world;
    let distance = length(toward);
    var falloff = 1.0 / max(distance * distance, 0.01);

    falloff *= pow2(saturate(1.0 - pow(distance / CORE_DISTANCE, 4.0)));
    color += directLight(surface, view, toward / distance, uniforms.coreColor.rgb * core.w * falloff, diffuse, f0);
  }

  // Indirect light from the studio, with multiple scattering.
  let specular = scattering(surface.normal, view, surface.roughness, f0);
  let total = specular.single + specular.multiple;
  let diffuseShare = diffuse * (1.0 - max(max(total.r, total.g), total.b));
  let irradiance = environmentIrradiance(surface.normal) / PI;

  color += environmentRadiance(view, surface.normal, surface.roughness) * specular.single;
  color += specular.multiple * irradiance;
  color += diffuseShare * irradiance;

  return color;
}

fn lit(in: VertexOutput, albedo: vec3f, normal: vec3f, roughness: f32) -> vec4f {
  let view = normalize(uniforms.camera.xyz - in.world);
  let surface = Surface(albedo, material.surface.x, normal, surfaceRoughness(normal, roughness), in.world);

  return vec4f(shade(surface, view), 1.0);
}


@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let view = normalize(uniforms.camera.xyz - in.world);
  let normal = normalize(in.normal);
  let tint = in.color;
  let roughness = surfaceRoughness(normal, uniforms.shell.z);
  let specular = scattering(normal, view, roughness, vec3f(0.04));
  let irradiance = environmentIrradiance(normal) / PI;
  var color = environmentRadiance(view, normal, roughness) * specular.single + specular.multiple * irradiance;

  // Clear plastic pipes light along its walls: wherever a face turns away from the camera, the bevels and the sides,
  // the shell glows. Smoked shells glow less.
  let facing = abs(dot(normal, view));

  color += uniforms.edgeColor.rgb * tint * (pow(1.0 - facing, 4.0) + 0.015) * uniforms.shell.x;

  // How much of what is behind a shell it hides: a little face on, more at grazing angles where glass turns into a
  // mirror, and much more through a smoked shell.
  let fresnel = pow(1.0 - facing, 5.0);
  let smoke = 1.0 - dot(tint, vec3f(0.3333));
  let alpha = clamp(uniforms.shell.y + fresnel * 0.5 + smoke * 0.75, 0.0, 1.0);

  return vec4f(color, alpha);
}
`,
  Eo = `// Hubs, metal, felt and tape: MeshStandardMaterial with the instance colour as a tint.

// What every part of the tower shares: the frame, its material, and the instanced vertex stage. The fragment stage of
// each material is its own file (scene-*.wgsl).

const PI: f32 = 3.141592653589793;

const CORE_LIGHTS: u32 = 3u;

struct Uniforms {
  viewProjection: mat4x4f,
  tower: mat4x4f,
  camera: vec4f,
  // xyz towards the light, w intensity.
  key: vec4f,
  rim: vec4f,
  rimFill: vec4f,
  keyColor: vec4f,
  rimColor: vec4f,
  rimFillColor: vec4f,
  // xyz in the world, w intensity.
  core: array<vec4f, 3>,
  coreColor: vec4f,
  // x environment intensity, y roughness levels of the environment, z label columns, w label rows.
  environment: vec4f,
  // x edge glow, y glass opacity, z shell roughness, w glints.
  shell: vec4f,
  edgeColor: vec4f,
}

struct Material {
  // rgb colour, a unused.
  color: vec4f,
  // x metalness, y roughness, z bump scale, w 1 for the labels.
  surface: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(1) @binding(0) var<uniform> material: Material;

struct Vertex {
  @location(0) normal: vec3f,
  @location(1) position: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec4f,
  @location(4) matrix0: vec4f,
  @location(5) matrix1: vec4f,
  @location(6) matrix2: vec4f,
  @location(7) matrix3: vec4f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
}

@vertex
fn vs(in: Vertex) -> VertexOutput {
  let instance = mat4x4f(in.matrix0, in.matrix1, in.matrix2, in.matrix3);
  let world = uniforms.tower * instance * vec4f(in.position, 1.0);

  // Scaled instances (the packs, the tape) keep their normals perpendicular.
  let basis = mat3x3f(instance[0].xyz, instance[1].xyz, instance[2].xyz);
  var normal = in.normal / vec3f(dot(basis[0], basis[0]), dot(basis[1], basis[1]), dot(basis[2], basis[2]));

  normal = basis * normal;

  let tower = mat3x3f(uniforms.tower[0].xyz, uniforms.tower[1].xyz, uniforms.tower[2].xyz);
  var out: VertexOutput;

  out.position = uniforms.viewProjection * world;
  out.world = world.xyz;
  out.normal = tower * normal;
  out.uv = in.uv;
  out.color = in.color.rgb;

  // The label's instance colour carries its atlas cell, it doesn't tint it.
  if (material.surface.w > 0.5) {
    let cell = floor(in.color.r + 0.5);
    let columns = uniforms.environment.z;
    let rows = uniforms.environment.w;
    let column = cell - floor(cell / columns) * columns;
    let row = floor(cell / columns);

    out.uv = vec2f((column + in.uv.x) / columns, (row + 1.0 - in.uv.y) / rows);
  }

  return out;
}

// MeshStandardMaterial's lighting, as three.js does it: GGX direct light from the key, the two rims and the core lights,
// and a prefiltered studio for the indirect light, with the multiple scattering of Fdez-Agüera. Needs chunks/scene.wgsl.

// Distance and decay of the core point lights.
const CORE_DISTANCE: f32 = 1.8;

@group(0) @binding(1) var tEnvironment: texture_cube<f32>;
@group(0) @binding(2) var linearSampler: sampler;

fn pow2(value: f32) -> f32 {
  return value * value;
}

fn fresnelSchlick(f0: vec3f, f90: f32, dotVH: f32) -> vec3f {
  let fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);

  return f0 * (1.0 - fresnel) + f90 * fresnel;
}

fn visibilitySmithCorrelated(alpha: f32, dotNL: f32, dotNV: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let view = dotNL * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNV));
  let light = dotNV * sqrt(alphaSquared + (1.0 - alphaSquared) * pow2(dotNL));

  return 0.5 / max(view + light, 1e-6);
}

fn distributionGgx(alpha: f32, dotNH: f32) -> f32 {
  let alphaSquared = pow2(alpha);
  let denominator = pow2(dotNH) * (alphaSquared - 1.0) + 1.0;

  return alphaSquared / (PI * pow2(denominator));
}

fn brdfGgx(light: vec3f, view: vec3f, normal: vec3f, f0: vec3f, roughness: f32) -> vec3f {
  let alpha = pow2(roughness);
  let halfDirection = normalize(light + view);
  let dotNL = saturate(dot(normal, light));
  let dotNV = saturate(dot(normal, view));
  let dotNH = saturate(dot(normal, halfDirection));
  let dotVH = saturate(dot(view, halfDirection));

  return fresnelSchlick(f0, 1.0, dotVH) * visibilitySmithCorrelated(alpha, dotNL, dotNV) * distributionGgx(alpha, dotNH);
}

// Analytical approximation of the DFG term (Karis, mobile), as three.js uses it.
fn dfgApproximation(normal: vec3f, view: vec3f, roughness: f32) -> vec2f {
  let dotNV = saturate(dot(normal, view));
  let c0 = vec4f(-1.0, -0.0275, -0.572, 0.022);
  let c1 = vec4f(1.0, 0.0425, 1.04, -0.04);
  let r = roughness * c0 + c1;
  let a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;

  return vec2f(-1.04, 1.04) * a004 + r.zw;
}

fn environmentLevel(roughness: f32) -> f32 {
  return roughness * (uniforms.environment.y - 1.0);
}

fn environmentRadiance(view: vec3f, normal: vec3f, roughness: f32) -> vec3f {
  var reflected = reflect(-view, normal);

  reflected = normalize(mix(reflected, normal, roughness * roughness));

  return textureSampleLevel(tEnvironment, linearSampler, reflected, environmentLevel(roughness)).rgb *
    uniforms.environment.x;
}

fn environmentIrradiance(normal: vec3f) -> vec3f {
  return PI * textureSampleLevel(tEnvironment, linearSampler, normal, environmentLevel(1.0)).rgb *
    uniforms.environment.x;
}

// Normal roughness from the screen derivatives of the normal, so thin highlights don't sparkle.
fn geometryRoughness(normal: vec3f) -> f32 {
  let change = max(abs(dpdx(normal)), abs(dpdy(normal)));

  return max(max(change.x, change.y), change.z);
}

fn surfaceRoughness(normal: vec3f, roughness: f32) -> f32 {
  return min(max(roughness, 0.0525) + geometryRoughness(normal), 1.0);
}

struct Surface {
  albedo: vec3f,
  metalness: f32,
  normal: vec3f,
  roughness: f32,
  world: vec3f,
}

// Single and multiple scattering of the studio's specular light, x and y of the DFG term folded in.
struct Scattering {
  single: vec3f,
  multiple: vec3f,
}

fn scattering(normal: vec3f, view: vec3f, roughness: f32, f0: vec3f) -> Scattering {
  let dfg = dfgApproximation(normal, view, roughness);
  let single = f0 * dfg.x + dfg.y;
  let missing = 1.0 - (dfg.x + dfg.y);
  let average = f0 + (1.0 - f0) * 0.047619;

  return Scattering(single, single * average / (1.0 - missing * average) * missing);
}

fn directLight(surface: Surface, view: vec3f, light: vec3f, irradianceColor: vec3f, diffuse: vec3f, f0: vec3f) -> vec3f {
  let irradiance = saturate(dot(surface.normal, light)) * irradianceColor;

  return irradiance * (diffuse / PI + brdfGgx(light, view, surface.normal, f0, surface.roughness));
}

fn shade(surface: Surface, view: vec3f) -> vec3f {
  let diffuse = surface.albedo * (1.0 - surface.metalness);
  let f0 = mix(vec3f(0.04), surface.albedo, surface.metalness);
  var color = vec3f(0.0);

  color += directLight(surface, view, uniforms.key.xyz, uniforms.keyColor.rgb * uniforms.key.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rim.xyz, uniforms.rimColor.rgb * uniforms.rim.w, diffuse, f0);
  color += directLight(surface, view, uniforms.rimFill.xyz, uniforms.rimFillColor.rgb * uniforms.rimFill.w, diffuse, f0);

  for (var index = 0u; index < CORE_LIGHTS; index++) {
    let core = uniforms.core[index];
    let toward = core.xyz - surface.world;
    let distance = length(toward);
    var falloff = 1.0 / max(distance * distance, 0.01);

    falloff *= pow2(saturate(1.0 - pow(distance / CORE_DISTANCE, 4.0)));
    color += directLight(surface, view, toward / distance, uniforms.coreColor.rgb * core.w * falloff, diffuse, f0);
  }

  // Indirect light from the studio, with multiple scattering.
  let specular = scattering(surface.normal, view, surface.roughness, f0);
  let total = specular.single + specular.multiple;
  let diffuseShare = diffuse * (1.0 - max(max(total.r, total.g), total.b));
  let irradiance = environmentIrradiance(surface.normal) / PI;

  color += environmentRadiance(view, surface.normal, surface.roughness) * specular.single;
  color += specular.multiple * irradiance;
  color += diffuseShare * irradiance;

  return color;
}

fn lit(in: VertexOutput, albedo: vec3f, normal: vec3f, roughness: f32) -> vec4f {
  let view = normalize(uniforms.camera.xyz - in.world);
  let surface = Surface(albedo, material.surface.x, normal, surfaceRoughness(normal, roughness), in.world);

  return vec4f(shade(surface, view), 1.0);
}


@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  return lit(in, material.color.rgb * in.color, normalize(in.normal), material.surface.y);
}
`,
  Do = new Set(),
  Oo = !1;
function ko(e, t, n = 2) {
  let r = t && t.length,
    i = r ? t[0] * n : e.length;
  Do.size && Do.clear();
  let a = Ao(e, 0, i, n, !0),
    o = [];
  if (!a || a.next === a.prev) return o;
  let s = 0,
    c = 0,
    l = 0;
  if ((r && (a = Ro(e, t, a, n)), e.length > 80 * n)) {
    (s = e[0]), (c = e[1]);
    let t = s,
      r = c;
    for (let a = n; a < i; a += n) {
      let n = e[a],
        i = e[a + 1];
      n < s && (s = n), i < c && (c = i), n > t && (t = n), i > r && (r = i);
    }
    (l = Math.max(t - s, r - c)), (l = l === 0 ? 0 : 32767 / l);
  }
  return Mo(a, o, s, c, l), o;
}
function Ao(e, t, n, r, i) {
  let a = null;
  if (i === xs(e, t, n, r) > 0)
    for (let i = t; i < n; i += r) a = vs((i / r) | 0, e[i], e[i + 1], a);
  else
    for (let i = n - r; i >= t; i -= r) a = vs((i / r) | 0, e[i], e[i + 1], a);
  return a && ds(a, a.next) && (ys(a), (a = a.next)), a;
}
function jo(e, t = e) {
  let n = t === e,
    r = e,
    i;
  do
    (i = !1),
      r !== r.next &&
      (Do.size === 0 || !Do.has(r)) &&
      (ds(r, r.next) || us(r.prev, r, r.next) === 0)
        ? ((n || r === t) && (t = r.prev),
          (Oo = !0),
          ys(r),
          (r = r.prev),
          (i = !0))
        : (n || r !== t) && ((r = r.next), (i = !n));
  while (i || r !== t);
  return t;
}
function Mo(e, t, n, r, i) {
  i && rs(e, n, r, i);
  let a = e,
    o = !1;
  for (; e.prev !== e.next; ) {
    let s = e.prev,
      c = e.next;
    if (us(s, e, c) < 0 && (i ? Po(e, n, r, i) : No(e))) {
      t.push(s.i, e.i, c.i), ys(e), (e = c), (a = c);
      continue;
    }
    if (((e = c), e === a)) {
      if (((Oo = !1), (e = jo(e)), Oo)) {
        a = e;
        continue;
      }
      if (!o) {
        (e = Fo(e, t)), (a = e), (o = !0);
        continue;
      }
      Io(e, t, n, r, i);
      break;
    }
  }
}
function No(e) {
  let t = e.prev,
    n = e,
    r = e.next,
    i = t.x,
    a = n.x,
    o = r.x,
    s = t.y,
    c = n.y,
    l = r.y,
    u = Math.min(i, a, o),
    d = Math.min(s, c, l),
    f = Math.max(i, a, o),
    p = Math.max(s, c, l),
    m = r.next;
  for (; m !== t; ) {
    if (
      m.x >= u &&
      m.x <= f &&
      m.y >= d &&
      m.y <= p &&
      (i !== m.x || s !== m.y) &&
      cs(i, s, a, c, o, l, m.x, m.y) &&
      us(m.prev, m, m.next) >= 0
    )
      return !1;
    m = m.next;
  }
  return !0;
}
function Po(e, t, n, r) {
  let i = e.prev,
    a = e,
    o = e.next,
    s = i.x,
    c = a.x,
    l = o.x,
    u = i.y,
    d = a.y,
    f = o.y,
    p = Math.min(s, c, l),
    m = Math.min(u, d, f),
    h = Math.max(s, c, l),
    g = Math.max(u, d, f),
    _ = os(p, m, t, n, r),
    v = os(h, g, t, n, r),
    y = e.prevZ;
  for (; y && y.z >= _; ) {
    if (
      y.x >= p &&
      y.x <= h &&
      y.y >= m &&
      y.y <= g &&
      y !== o &&
      (s !== y.x || u !== y.y) &&
      cs(s, u, c, d, l, f, y.x, y.y) &&
      us(y.prev, y, y.next) >= 0
    )
      return !1;
    y = y.prevZ;
  }
  let b = e.nextZ;
  for (; b && b.z <= v; ) {
    if (
      b.x >= p &&
      b.x <= h &&
      b.y >= m &&
      b.y <= g &&
      b !== o &&
      (s !== b.x || u !== b.y) &&
      cs(s, u, c, d, l, f, b.x, b.y) &&
      us(b.prev, b, b.next) >= 0
    )
      return !1;
    b = b.nextZ;
  }
  return !0;
}
function Fo(e, t) {
  let n = e,
    r = !1;
  do {
    let i = n.prev,
      a = n.next.next;
    fs(i, n, n.next, a, !1) &&
      hs(i, a) &&
      hs(a, i) &&
      (t.push(i.i, n.i, a.i), ys(n), ys(n.next), (n = e = a), (r = !0)),
      (n = n.next);
  } while (n !== e);
  return r ? jo(n) : n;
}
function Io(e, t, n, r, i) {
  let a = e;
  do {
    let e = a.next.next;
    for (; e !== a.prev; ) {
      if (a.i !== e.i && ls(a, e)) {
        let o = _s(a, e);
        (a = jo(a, a.next)),
          (o = jo(o, o.next)),
          Mo(a, t, n, r, i),
          Mo(o, t, n, r, i);
        return;
      }
      e = e.next;
    }
    a = a.next;
  } while (a !== e);
}
var Lo = !1;
function Ro(e, t, n, r) {
  let i = [];
  for (let n = 0, a = t.length; n < a; n++) {
    let o = Ao(e, t[n] * r, n < a - 1 ? t[n + 1] * r : e.length, r, !1);
    o === o.next && Do.add(o), i.push(ss(o));
  }
  i.sort(zo), Go(e.length / r, t.length), Ko(n, n), (Lo = !0);
  for (let e = 0; e < i.length; e++) n = Bo(i[e], n);
  return (Lo = !1), jo(n);
}
function zo(e, t) {
  return (
    e.x - t.x ||
    e.y - t.y ||
    (e.next.y - e.y) / (e.next.x - e.x) - (t.next.y - t.y) / (t.next.x - t.x)
  );
}
function Bo(e, t) {
  let n = Xo(e, t);
  if (!n) return t;
  let r = _s(n, e),
    i = r.next;
  return Ko(n, i.next), jo(r, r.next), jo(n, n.next);
}
var Vo = 16,
  Z = new Float64Array(),
  Ho = 0,
  Uo = [],
  Wo = [];
function Go(e, t) {
  let n = Math.ceil((e + 2 * t) / Vo) + t + 2;
  Z.length < n * 4 && (Z = new Float64Array(n * 4)), (Ho = 0);
}
function Ko(e, t) {
  let n = e;
  do {
    let e = Ho++;
    Uo[e] = n;
    let r = n.x,
      i = n.y,
      a = n.x,
      o = n.y,
      s = 0;
    do {
      let t = n.next;
      (n.z = e),
        t.x < r && (r = t.x),
        t.x > a && (a = t.x),
        t.y < i && (i = t.y),
        t.y > o && (o = t.y),
        (n = t);
    } while (++s < Vo && n !== t);
    Wo[e] = n;
    let c = e * 4;
    (Z[c] = r), (Z[c + 1] = i), (Z[c + 2] = a), (Z[c + 3] = o);
  } while (n !== t);
}
function qo(e, t) {
  let n = e.z * 4;
  t.x < Z[n] && (Z[n] = t.x),
    t.y < Z[n + 1] && (Z[n + 1] = t.y),
    t.x > Z[n + 2] && (Z[n + 2] = t.x),
    t.y > Z[n + 3] && (Z[n + 3] = t.y);
}
function Jo(e) {
  let t = Wo[e];
  for (; t.prev.next !== t; ) t = t.next;
  return (Wo[e] = t), t;
}
function Yo(e) {
  let t = Uo[e];
  for (; t.prev.next !== t; ) t = t.next;
  return (Uo[e] = t), t;
}
function Xo(e, t) {
  let n = t,
    r = e.x,
    i = e.y,
    a = -1 / 0,
    o;
  if (ds(e, n)) return n;
  for (let t = 0, s = 0; t < Ho; t++, s += 4) {
    if (i < Z[s + 1] || i > Z[s + 3] || Z[s] > r || Z[s + 2] <= a) continue;
    let c = Jo(t);
    n = Yo(t);
    do {
      if (n.prev.next === n) {
        if (ds(e, n.next)) return n.next;
        if (i <= n.y && i >= n.next.y && n.next.y !== n.y) {
          let e = n.x + ((i - n.y) * (n.next.x - n.x)) / (n.next.y - n.y);
          if (
            e <= r &&
            e > a &&
            ((a = e), (o = n.x < n.next.x ? n : n.next), e === r)
          )
            return o;
        }
      }
      n = n.next;
    } while (n !== c);
  }
  if (!o) return null;
  let s = o.x,
    c = o.y,
    l = Math.min(i, c),
    u = Math.max(i, c),
    d = 1 / 0;
  for (let t = 0, f = 0; t < Ho; t++, f += 4) {
    if (Z[f + 2] < s || Z[f] > r || Z[f + 3] < l || Z[f + 1] > u) continue;
    let p = Jo(t);
    n = Yo(t);
    do {
      if (
        n.prev.next === n &&
        r >= n.x &&
        n.x >= s &&
        r !== n.x &&
        cs(i < c ? r : a, i, s, c, i < c ? a : r, i, n.x, n.y)
      ) {
        let t = Math.abs(i - n.y) / (r - n.x);
        (hs(n, e) || (n.y === i && n.next.y === i && n.next.x > r)) &&
          (t < d || (t === d && (n.x > o.x || (n.x === o.x && Zo(o, n))))) &&
          ((o = n), (d = t));
      }
      n = n.next;
    } while (n !== p);
  }
  return o;
}
function Zo(e, t) {
  return us(e.prev, e, t.prev) < 0 && us(t.next, e, e.next) < 0;
}
var Qo = [],
  $o = [],
  es = new Uint32Array(),
  ts = new Uint32Array(),
  ns = new Uint32Array(256);
function rs(e, t, n, r) {
  let i = e,
    a = 0;
  do (i.z = os(i.x, i.y, t, n, r)), (Qo[a++] = i), (i = i.next);
  while (i !== e);
  is(a);
  let o = null;
  for (let e = 0; e < a; e++) {
    let t = Qo[e];
    (t.prevZ = o), o && (o.nextZ = t), (o = t);
  }
  (o.nextZ = null), Qo.fill(null, 0, a), $o.fill(null, 0, a);
}
function is(e) {
  if (e <= 32) {
    for (let t = 1; t < e; t++) {
      let e = Qo[t],
        n = e.z,
        r = t - 1;
      for (; r >= 0 && Qo[r].z > n; ) (Qo[r + 1] = Qo[r]), r--;
      Qo[r + 1] = e;
    }
    return;
  }
  es.length < e &&
    ((es = new Uint32Array(e)), (ts = new Uint32Array(e)), ($o = Array(e)));
  for (let t = 0; t < e; t++) es[t] = Qo[t].z;
  as(e, Qo, es, $o, ts, 0),
    as(e, $o, ts, Qo, es, 8),
    as(e, Qo, es, $o, ts, 16),
    as(e, $o, ts, Qo, es, 24);
}
function as(e, t, n, r, i, a) {
  ns.fill(0);
  for (let t = 0; t < e; t++) ns[(n[t] >>> a) & 255]++;
  let o = 0;
  for (let e = 0; e < 256; e++) {
    let t = ns[e];
    (ns[e] = o), (o += t);
  }
  for (let o = 0; o < e; o++) {
    let e = n[o],
      s = ns[(e >>> a) & 255]++;
    (r[s] = t[o]), (i[s] = e);
  }
}
function os(e, t, n, r, i) {
  return (
    (e = ((e - n) * i) | 0),
    (t = ((t - r) * i) | 0),
    (e = (e | (e << 8)) & 16711935),
    (e = (e | (e << 4)) & 252645135),
    (e = (e | (e << 2)) & 858993459),
    (e = (e | (e << 1)) & 1431655765),
    (t = (t | (t << 8)) & 16711935),
    (t = (t | (t << 4)) & 252645135),
    (t = (t | (t << 2)) & 858993459),
    (t = (t | (t << 1)) & 1431655765),
    e | (t << 1)
  );
}
function ss(e) {
  let t = e,
    n = e;
  do (t.x < n.x || (t.x === n.x && t.y < n.y)) && (n = t), (t = t.next);
  while (t !== e);
  return n;
}
function cs(e, t, n, r, i, a, o, s) {
  return (
    (i - o) * (t - s) >= (e - o) * (a - s) &&
    (e - o) * (r - s) >= (n - o) * (t - s) &&
    (n - o) * (a - s) >= (i - o) * (r - s)
  );
}
function ls(e, t) {
  let n = ds(e, t) && us(e.prev, e, e.next) > 0 && us(t.prev, t, t.next) > 0;
  return (
    e.next.i !== t.i &&
    (n ||
      (hs(e, t) &&
        hs(t, e) &&
        (us(e.prev, e, t.prev) !== 0 || us(e, t.prev, t) !== 0))) &&
    !ms(e, t) &&
    (n || gs(e, t))
  );
}
function us(e, t, n) {
  return (t.y - e.y) * (n.x - t.x) - (t.x - e.x) * (n.y - t.y);
}
function ds(e, t) {
  return e.x === t.x && e.y === t.y;
}
function fs(e, t, n, r, i = !0) {
  let a = us(e, t, n),
    o = us(e, t, r),
    s = us(n, r, e),
    c = us(n, r, t);
  return ((a > 0 && o < 0) || (a < 0 && o > 0)) &&
    ((s > 0 && c < 0) || (s < 0 && c > 0))
    ? !0
    : i
      ? !!(
          (a === 0 && ps(e, n, t)) ||
          (o === 0 && ps(e, r, t)) ||
          (s === 0 && ps(n, e, r)) ||
          (c === 0 && ps(n, t, r))
        )
      : !1;
}
function ps(e, t, n) {
  return (
    t.x <= Math.max(e.x, n.x) &&
    t.x >= Math.min(e.x, n.x) &&
    t.y <= Math.max(e.y, n.y) &&
    t.y >= Math.min(e.y, n.y)
  );
}
function ms(e, t) {
  let n = Math.min(e.x, t.x),
    r = Math.max(e.x, t.x),
    i = Math.min(e.y, t.y),
    a = Math.max(e.y, t.y),
    o = e;
  do {
    let s = o.next;
    if (
      (o.x > r && s.x > r) ||
      (o.x < n && s.x < n) ||
      (o.y > a && s.y > a) ||
      (o.y < i && s.y < i)
    ) {
      o = s;
      continue;
    }
    if (
      o.i !== e.i &&
      s.i !== e.i &&
      o.i !== t.i &&
      s.i !== t.i &&
      fs(o, s, e, t)
    )
      return !0;
    o = s;
  } while (o !== e);
  return !1;
}
function hs(e, t) {
  return us(e.prev, e, e.next) < 0
    ? us(e, t, e.next) >= 0 && us(e, e.prev, t) >= 0
    : us(e, t, e.prev) < 0 || us(e, e.next, t) < 0;
}
function gs(e, t) {
  let n = e,
    r = !1,
    i = (e.x + t.x) / 2,
    a = (e.y + t.y) / 2;
  do {
    let e = n.next;
    n.y > a != e.y > a &&
      i < ((e.x - n.x) * (a - n.y)) / (e.y - n.y) + n.x &&
      (r = !r),
      (n = e);
  } while (n !== e);
  return r;
}
function _s(e, t) {
  let n = bs(e.i, e.x, e.y),
    r = bs(t.i, t.x, t.y),
    i = e.next,
    a = t.prev;
  return (
    (e.next = t),
    (t.prev = e),
    (n.next = i),
    (i.prev = n),
    (r.next = n),
    (n.prev = r),
    (a.next = r),
    (r.prev = a),
    r
  );
}
function vs(e, t, n, r) {
  let i = bs(e, t, n);
  return (
    r
      ? ((i.next = r.next), (i.prev = r), (r.next.prev = i), (r.next = i))
      : ((i.prev = i), (i.next = i)),
    i
  );
}
function ys(e) {
  (e.next.prev = e.prev),
    (e.prev.next = e.next),
    e.prevZ && (e.prevZ.nextZ = e.nextZ),
    e.nextZ && (e.nextZ.prevZ = e.prevZ),
    Lo && qo(e.prev, e.next);
}
function bs(e, t, n) {
  return {
    i: e,
    x: t,
    y: n,
    prev: null,
    next: null,
    z: 0,
    prevZ: null,
    nextZ: null,
  };
}
function xs(e, t, n, r) {
  let i = 0;
  for (let a = t, o = n - r; a < n; a += r)
    (i += (e[o] - e[a]) * (e[a + 1] + e[o + 1])), (o = a);
  return i;
}
var Ss = 0.01,
  Q = {
    bodyThickness: 8.8,
    height: 63.8,
    hubRadius: 10.8,
    hubSpacing: 42.6,
    hubY: 3.4,
    packMaximum: 27.5,
    ridgeThickness: 1.6,
    tapeWidth: 3.81,
    width: 100.4,
  },
  Cs = [
    { width: 5, x: -31 },
    { width: 6.5, x: -17.5 },
    { width: 12, x: 0 },
    { width: 6.5, x: 17.5 },
    { width: 5, x: 31 },
  ],
  ws = [
    { x: -45.2, y: 27.3 },
    { x: 45.2, y: 27.3 },
    { x: -45.2, y: -26 },
    { x: 45.2, y: -26 },
    { x: 0, y: -20.5 },
  ];
function Ts(e, t, n, r = [0, 0]) {
  e.push(...n, ...t, ...r);
}
function Es(e, t) {
  let n = sa(aa(na(t[1], t[0]), na(t[2], t[0])));
  for (let r of t) Ts(e, r, n);
}
function Ds(e, t) {
  let n = [];
  for (let r = 0; r < e.length; r += 8) {
    let [i = 0, a = 0, o = 0, s = 0, c = 0, l = 0, u = 0, d = 0] = e.slice(
      r,
      r + 8,
    );
    Ts(n, ba(t, [s, c, l]), xa(t, [i, a, o]), [u, d]);
  }
  return n;
}
function Os(e) {
  return Ds(e, ga(Ss, Ss, Ss));
}
function ks(e) {
  let t = 0;
  return (
    e.forEach((n, r) => {
      let i = e[(r + 1) % e.length];
      t += n[0] * i[1] - i[0] * n[1];
    }),
    t / 2
  );
}
function As(e, t) {
  return ks(e) > 0 === t ? e : [...e].reverse();
}
function js(e) {
  let t = e[0],
    n = e[e.length - 1];
  return (
    e.length > 2 && Math.hypot(t[0] - n[0], t[1] - n[1]) < 1e-5 && e.pop(), e
  );
}
function Ms(e, t, n, r, i) {
  for (let a = 1; a <= i; a++) {
    let o = a / i,
      s = 1 - o;
    e.push([
      t[0] * s * s + n[0] * 2 * s * o + r[0] * o * o,
      t[1] * s * s + n[1] * 2 * s * o + r[1] * o * o,
    ]);
  }
}
function Ns(e, t, n, r) {
  let i = -e / 2,
    a = -t / 2,
    o = [[i + n, a]];
  return (
    o.push([i + e - n, a]),
    Ms(o, [i + e - n, a], [i + e, a], [i + e, a + n], r),
    o.push([i + e, a + t - n]),
    Ms(o, [i + e, a + t - n], [i + e, a + t], [i + e - n, a + t], r),
    o.push([i + n, a + t]),
    Ms(o, [i + n, a + t], [i, a + t], [i, a + t - n], r),
    o.push([i, a + n]),
    Ms(o, [i, a + n], [i, a], [i + n, a], r),
    js(o)
  );
}
function Ps(e, t, n, r) {
  return Array.from({ length: r }, (i, a) => {
    let o = (a / r) * Math.PI * 2;
    return [e + Math.cos(o) * n, t + Math.sin(o) * n];
  });
}
function Fs(e) {
  return e.map((t, n) => {
    let r = e[(n + e.length - 1) % e.length],
      i = e[(n + 1) % e.length],
      a = Is([t[0] - r[0], t[1] - r[1]]),
      o = Is([i[0] - t[0], i[1] - t[1]]),
      s = [a[1], -a[0]],
      c = [o[1], -o[0]],
      l = 1 + s[0] * c[0] + s[1] * c[1];
    return l < 1e-4 ? s : [(s[0] + c[0]) / l, (s[1] + c[1]) / l];
  });
}
function Is(e) {
  let t = Math.hypot(e[0], e[1]);
  return t > 0 ? [e[0] / t, e[1] / t] : [0, 0];
}
function Ls(e, t, n) {
  let r = [As(e, !0), ...t.map((e) => As(e, !1))],
    { bevelSegments: i, bevelSize: a, bevelThickness: o, depth: s } = n,
    c = [];
  for (let e = 0; e < i; e++) {
    let t = (e / i) * (Math.PI / 2);
    c.push([a * Math.sin(t), -o * Math.cos(t)]);
  }
  c.push([a, 0], [a, s]);
  for (let e = i - 1; e >= 0; e--) {
    let t = (e / i) * (Math.PI / 2);
    c.push([a * Math.sin(t), s + o * Math.cos(t)]);
  }
  let l = [];
  for (let e of r) {
    let t = Fs(e),
      n = (n, [r, i]) => {
        let a = e[n],
          o = t[n];
        return [a[0] + o[0] * r, a[1] + o[1] * r, i];
      };
    for (let t = 0; t < c.length - 1; t++) {
      let r = c[t],
        i = c[t + 1];
      for (let t = 0; t < e.length; t++) {
        let a = (t + 1) % e.length,
          o = n(t, r),
          s = n(a, r),
          c = n(a, i),
          u = n(t, i);
        Es(l, [o, s, c]), Es(l, [o, c, u]);
      }
    }
  }
  let u = r.flat(2),
    d = [],
    f = 0;
  r.forEach((e, t) => {
    t > 0 && d.push(f), (f += e.length);
  });
  let p = ko(u, d, 2),
    m = c[0][1],
    h = c[c.length - 1][1],
    g = (e, t) => [u[e * 2] ?? 0, u[e * 2 + 1] ?? 0, t];
  for (let e = 0; e < p.length; e += 3) {
    let t = [p[e] ?? 0, p[e + 1] ?? 0, p[e + 2] ?? 0],
      n = t.map((e) => g(e, h)),
      r = t.map((e) => g(e, m)),
      i = (e) => aa(na(e[1], e[0]), na(e[2], e[0]))[2];
    i(n) < 0 && n.reverse(), i(r) > 0 && r.reverse(), Es(l, n), Es(l, r);
  }
  return l;
}
function Rs(e, t, n) {
  let r = [],
    i = t / 2,
    a = (t, n) => {
      let r = t * Math.PI * 2;
      return [
        [e * Math.sin(r), n, e * Math.cos(r)],
        [Math.sin(r), 0, Math.cos(r)],
        [t, n > 0 ? 0 : 1],
      ];
    };
  for (let e = 0; e < n; e++) {
    let t = e / n,
      o = (e + 1) / n,
      s = [a(t, i), a(t, -i), a(o, -i), a(o, i)];
    for (let e of [0, 1, 3, 1, 2, 3]) {
      let [t, n, i] = s[e];
      Ts(r, t, n, i);
    }
  }
  for (let [t, a] of [
    [i, 1],
    [-i, -1],
  ]) {
    let i = [0, a, 0],
      o = (r) => {
        let i = (r / n) * Math.PI * 2;
        return [
          [e * Math.sin(i), t, e * Math.cos(i)],
          [Math.cos(i) * 0.5 + 0.5, Math.sin(i) * 0.5 * a + 0.5],
        ];
      };
    for (let e = 0; e < n; e++) {
      let n = [
          [0, t, 0],
          [0.5, 0.5],
        ],
        s = o(e),
        c = o(e + 1),
        l = a > 0 ? [n, s, c] : [n, c, s];
      for (let [e, t] of l) Ts(r, e, i, t);
    }
  }
  return Ds(r, _a(Math.PI / 2));
}
var zs = [
  [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0],
  ],
  [
    [-1, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, -1],
  ],
  [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ],
  [
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
  ],
  [
    [0, 0, -1],
    [-1, 0, 0],
    [0, 1, 0],
  ],
];
function Bs(e, t, n) {
  let r = [],
    i = [e / 2, t / 2, n / 2],
    a = [
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ];
  for (let [e, t, n] of zs) {
    let o = (r, a) => [
        (e[0] + t[0] * r + n[0] * a) * i[0],
        (e[1] + t[1] * r + n[1] * a) * i[1],
        (e[2] + t[2] * r + n[2] * a) * i[2],
      ],
      s = [o(-1, -1), o(1, -1), o(1, 1), o(-1, 1)];
    for (let t of [0, 1, 2, 0, 2, 3]) Ts(r, s[t], e, a[t]);
  }
  return r;
}
function Vs() {
  let e = 1.3,
    t = Q.bodyThickness - e * 2,
    n = Ds(
      Ls(
        Ns(Q.width - e * 2, Q.height - e * 2, 2.6, 12),
        [
          Ps(-Q.hubSpacing / 2, Q.hubY, 6.6, 24),
          Ps(Q.hubSpacing / 2, Q.hubY, 6.6, 24),
        ],
        { bevelSegments: 4, bevelSize: e, bevelThickness: e, depth: t },
      ),
      ha(0, 0, -t / 2),
    ),
    r = -Q.height / 2 + 0.4,
    i = [
      [-35, r],
      [35, r],
      [28.5, r + 10.5],
      [-28.5, r + 10.5],
    ],
    a = Q.ridgeThickness - 0.4,
    o = Ls(i, [], {
      bevelSegments: 2,
      bevelSize: 0.3,
      bevelThickness: 0.3,
      depth: a,
    });
  n.push(...Ds(o, ha(0, 0, Q.bodyThickness / 2 - 0.3))),
    n.push(...Ds(o, ha(0, 0, -Q.bodyThickness / 2 - a + 0.3)));
  for (let e of [-1, 1])
    for (let t of [Q.hubY - 11, Q.hubY + 11])
      n.push(
        ...Ds(Bs(50, 0.9, 0.5), ha(0, t, e * (Q.bodyThickness / 2 + 0.15))),
      );
  return Os(n);
}
function Hs() {
  let e = Array.from({ length: 73 }, (e, t) => {
    let n = -(t / 72) * Math.PI * 2,
      r = Math.cos(n * 6) > 0.82 ? 3.1 : 4.3;
    return [Math.cos(n) * r, Math.sin(n) * r];
  });
  return Ds(
    Ls(Ps(0, 0, Q.hubRadius, 64), [js(e)], {
      bevelSegments: 1,
      bevelSize: 0.3,
      bevelThickness: 0.3,
      depth: 6.2,
    }),
    ha(0, 0, -6.2 / 2),
  );
}
function Us() {
  return Os(Rs(1, Q.tapeWidth, 64));
}
function Ws(e, t, n) {
  return Os(Bs(e, t, n));
}
function Gs() {
  let e = (e, t) => {
    let n = [],
      r = [
        [-44, -25, 0, 0],
        [44, -25, 1, 0],
        [44, 25, 1, 1],
        [-44, 25, 0, 1],
      ];
    for (let e of [0, 1, 2, 0, 2, 3]) {
      let [t, i, a, o] = r[e];
      Ts(n, [t, i, 0], [0, 0, 1], [a, o]);
    }
    return Ds(n, ma(ha(0, 5, e), va(t)));
  };
  return Os([
    ...e(Q.bodyThickness / 2 + 0.06, 0),
    ...e(-Q.bodyThickness / 2 - 0.06, Math.PI),
  ]);
}
function Ks(e) {
  let t = Q.hubRadius ** 2,
    n = Q.packMaximum ** 2 - t;
  return { left: Math.sqrt(t + n * (1 - e)), right: Math.sqrt(t + n * e) };
}
function qs(e, t, n = 0) {
  return ha(e * Ss, t * Ss, n * Ss);
}
function Js(e) {
  return e.flatMap(({ geometry: e, matrices: t }) =>
    t.flatMap((t) => Ds(e, t)),
  );
}
function Ys() {
  let e = ws.flatMap((e) =>
    [-1, 1].map((t) => qs(e.x, e.y, t * (Q.bodyThickness / 2 - 0.9))),
  );
  return Js([
    { geometry: Os(Rs(2.1, 1.1, 18)), matrices: e },
    {
      geometry: Os(Rs(0.9, Q.bodyThickness - 1.4, 10)),
      matrices: [qs(-24.5, -27.6), qs(24.5, -27.6)],
    },
    { geometry: Ws(11, 0.5, 5.6), matrices: [qs(0, -26.6)] },
  ]);
}
function Xs() {
  let e = [-1, 1].map((e, t) =>
    ma(qs((e * Q.hubSpacing) / 2, Q.hubY), ya(t * 0.35)),
  );
  return Js([
    { geometry: Os(Hs()), matrices: e },
    {
      geometry: Os(Rs(2.5, Q.bodyThickness - 1.6, 20)),
      matrices: [qs(-34.5, -24.8), qs(34.5, -24.8)],
    },
  ]);
}
function Zs(e, t) {
  return {
    axes: [sa(wa(e, 0)), sa(wa(e, 1)), sa(wa(e, 2))],
    center: wa(e, 3),
    half: t,
  };
}
function Qs(e) {
  return e.axes.reduce((t, n, r) => t + Math.abs(n[1]) * (e.half[r] ?? 0), 0);
}
function $s(e, t) {
  return e.axes.reduce(
    (n, r, i) => n + Math.abs(ia(r, t)) * (e.half[i] ?? 0),
    0,
  );
}
function ec(e, t, n = 0) {
  let r = na(t.center, e.center);
  r[1] += n;
  let i = [...e.axes, ...t.axes];
  for (let n of e.axes) for (let e of t.axes) i.push(aa(n, e));
  for (let n of i) {
    if (oa(n) < 1e-8) continue;
    let i = sa(n);
    if (Math.abs(ia(r, i)) > $s(e, i) + $s(t, i)) return !1;
  }
  return !0;
}
function tc(e, t, n, r = 0) {
  let i = na(e.center, t);
  i[1] += r;
  let a = 0,
    o = 1 / 0;
  for (let t = 0; t < 3; t++) {
    let r = e.axes[t],
      s = e.half[t] ?? 0,
      c = ia(r, i),
      l = ia(r, n);
    if (Math.abs(l) < 1e-8) {
      if (Math.abs(c) > s) return 1 / 0;
      continue;
    }
    let u = (c - s) / l,
      d = (c + s) / l;
    if (
      (u > d && ([u, d] = [d, u]),
      (a = Math.max(a, u)),
      (o = Math.min(o, d)),
      a > o)
    )
      return 1 / 0;
  }
  return a;
}
var nc = { height: 50, width: 88, y: 5 },
  rc = 7,
  ic = Q.hubSpacing / 2,
  ac = nc.y - Q.hubY,
  oc = [46, 54, 60, 74, 90, 100],
  sc = [
    `"Bradley Hand"`,
    `"Noteworthy"`,
    `"Marker Felt"`,
    `"Chalkboard SE"`,
    `"Comic Sans MS"`,
  ],
  cc = `"Rockwell", "Clarendon", "Georgia", serif`,
  lc = `"Helvetica Neue", Helvetica, Arial, sans-serif`;
function uc(e, t) {
  return t[Math.floor(e(0, t.length))];
}
function dc(e, t) {
  return {
    address: Ki(t),
    client: t.client,
    hand: uc(e, sc),
    length: uc(e, oc),
    side: e() < 0.6 ? `A` : `B`,
    title: t.name,
  };
}
function fc(e, t, n, r, i) {
  (e.fillStyle = i),
    (e.font = `700 ${r}px ${cc}`),
    (e.textAlign = `left`),
    (e.textBaseline = `alphabetic`),
    e.fillText(`SONY`, t, n);
}
function pc(e, t, n, r, i, a = `left`, o) {
  (e.font = `600 ${i}px ${lc}`), (e.textAlign = a), e.fillText(t, n, r, o);
}
function mc(e, t, n, r, i, a, o, s) {
  e.save(),
    e.translate(i, a),
    e.rotate(t(-0.05, 0.05)),
    (e.font = `${o}px ${n.hand}, cursive`),
    (e.textAlign = `left`),
    e.fillText(r, 0, 0, s),
    e.restore();
}
function hc(e, t, n, r) {
  e.beginPath(),
    e.moveTo(t - r * 0.2, n - r),
    e.lineTo(t + r * 0.2, n - r),
    e.lineTo(t + r * 0.2, n),
    e.lineTo(t + r * 0.55, n),
    e.lineTo(t, n + r * 0.7),
    e.lineTo(t - r * 0.55, n),
    e.lineTo(t - r * 0.2, n),
    e.closePath(),
    e.stroke();
}
function gc(e, t, n) {
  e.save(),
    (e.globalCompositeOperation = `destination-out`),
    (e.fillStyle = `#000000`);
  for (let t of [-ic, ic])
    e.beginPath(), e.arc(t, ac, 7.2, 0, Math.PI * 2), e.fill();
  e.beginPath(),
    e.roundRect(-t / 2, ac - n / 2, t, n, 1.4),
    e.fill(),
    e.restore();
}
var _c = [
  (e, t, n) => {
    let r = uc(t, [`UX`, `UX-S`, `UX-PRO`, `UX-ES`]);
    (e.fillStyle = `#1d1d1f`),
      e.fillRect(-44, -25, 88, 50),
      (e.fillStyle = `#0c0c0d`),
      e.fillRect(-26, -9, 52, 22),
      (e.fillStyle = `#4a4a4f`);
    for (let t = -7.8; t < 13; t += 1.1)
      for (let n = -24.8; n < 26; n += 1.1)
        e.beginPath(), e.arc(n, t, 0.28, 0, Math.PI * 2), e.fill();
    fc(e, -40, -15, 9, `#e8e8e8`),
      (e.fillStyle = `#e8e8e8`),
      pc(e, `${r} ${n.length}`, 40, -15, 6.5, `right`),
      pc(e, n.title.toUpperCase(), -40, -10.6, 3, `left`, 62),
      pc(e, n.side, -40, 22, 6),
      pc(e, `${n.client.toUpperCase()}  TYPE II`, -34, 21.6, 2.2, `left`, 50),
      (e.strokeStyle = `#e8e8e8`),
      (e.lineWidth = 0.4),
      hc(e, 33, 10, 5),
      gc(e, 16, 10);
  },
  (e, t, n) => {
    let r = uc(t, [`HF`, `HF-S`, `EF`, `HF-ES`]);
    (e.fillStyle = `#efede7`),
      e.fillRect(-44, -25, 88, 50),
      (e.fillStyle = `#161616`),
      e.fillRect(-44, -25, 88, 7.5),
      fc(e, -41, -19.2, 5.6, `#efede7`),
      (e.fillStyle = `#efede7`),
      pc(e, `${r} ${n.length}`, 41, -19.4, 4.4, `right`),
      (e.strokeStyle = `#9a9a9a`),
      (e.lineWidth = 0.25);
    for (let t of [-10, -4.5, 15, 19.5, 24])
      e.beginPath(), e.moveTo(-40, t), e.lineTo(40, t), e.stroke();
    (e.fillStyle = `#202020`),
      mc(e, t, n, n.title, -38, -11, 5.2, 66),
      mc(e, t, n, n.client, -38, 14, 3.4, 36),
      mc(e, t, n, n.address, -38, 18.6, 3.2, 76),
      (e.lineWidth = 0.4),
      (e.strokeStyle = `#202020`),
      e.beginPath(),
      e.arc(37, -11, 3, 0, Math.PI * 2),
      e.stroke(),
      pc(e, n.side, 37, -9.8, 3.6, `center`),
      gc(e, 56, 13);
  },
  (e, t, n) => {
    let r = e.createLinearGradient(-44, -25, 44, 25);
    r.addColorStop(0, `#b9b9bb`),
      r.addColorStop(0.5, `#e3e3e5`),
      r.addColorStop(1, `#8e8e91`),
      (e.fillStyle = r),
      e.fillRect(-44, -25, 88, 50),
      (e.strokeStyle = `rgb(0 0 0 / 18%)`),
      (e.lineWidth = 1.6);
    for (let t = -90; t < 90; t += 5)
      e.beginPath(), e.moveTo(t, 25), e.lineTo(t + 50, -25), e.stroke();
    fc(e, -40, -16, 7, `#151515`),
      (e.fillStyle = `#151515`),
      pc(
        e,
        uc(t, [`CDit II`, `CDit I`, `CDix II`, `CDix IV`]),
        40,
        -16,
        6,
        `right`,
      ),
      pc(e, `${n.length} MIN`, 40, 22, 4, `right`),
      pc(e, n.client.toUpperCase(), -40, -11, 2.6, `left`, 40),
      mc(e, t, n, n.title, -40, 22, 4.4, 58),
      gc(e, 22, 11);
  },
  (e, t, n) => {
    (e.fillStyle = `#0b0b0b`),
      e.fillRect(-44, -25, 88, 50),
      (e.fillStyle = `#9d9d9f`);
    for (let t = 0; t < 5; t++) e.fillRect(-44, 12 + t * 2.4, 88, 1.1);
    fc(e, -40, -15, 8, `#f0f0f0`),
      (e.fillStyle = `#f0f0f0`),
      pc(
        e,
        uc(t, [`METAL-XR`, `METAL-ES`, `METAL MASTER`, `METAL-SR`]),
        40,
        -15,
        4.6,
        `right`,
      ),
      pc(e, `${n.length}`, 40, -9, 4.6, `right`),
      pc(e, n.title.toUpperCase(), -40, -9.6, 3, `left`, 64),
      pc(e, `${n.client.toUpperCase()}  TYPE IV`, -40, 9.4, 2.2, `left`, 56),
      pc(e, n.side, 38, 9.4, 4.4, `right`),
      gc(e, 18, 10);
  },
  (e, t, n) => {
    (e.fillStyle = `#f1efe9`),
      e.fillRect(-44, -25, 88, 11),
      fc(e, -41, -20.6, 3.6, `#161616`),
      (e.fillStyle = `#161616`),
      pc(
        e,
        `${n.client.toUpperCase()}  C${n.length}`,
        41,
        -20.6,
        2.6,
        `right`,
        50,
      ),
      mc(e, t, n, n.title, -41, -15.6, 4.2, 72),
      pc(e, n.side, 41, -15.8, 3.4, `right`);
  },
  (e, t, n) => {
    (e.fillStyle = `#f4f4f4`),
      (e.strokeStyle = `#f4f4f4`),
      fc(e, -9, -15, 6, `#f4f4f4`),
      pc(e, `${uc(t, [`HF`, `UX`, `EF`])} C-${n.length}`, 0, 21, 3.6, `center`),
      pc(e, n.title.toUpperCase(), 0, -9.5, 3.4, `center`, 60),
      pc(e, n.client.toUpperCase(), 0, 13.6, 2.2, `center`, 60),
      pc(e, n.side, -40, -16, 5),
      (e.lineWidth = 0.5);
    for (let t of [-ic, ic])
      e.beginPath(), e.arc(t, ac, 9, 0, Math.PI * 2), e.stroke();
    e.beginPath(), e.moveTo(-40, 16), e.lineTo(40, 16), e.stroke();
  },
];
function vc(e, t, n) {
  let r = Math.ceil(n.length / rc),
    i = t / rc,
    a = Math.floor((i * nc.height) / nc.width),
    { canvas: o, context: s } = Ei(t, r * a);
  return (
    n.forEach((t, n) => {
      let r = (n % rc) * i,
        o = Math.floor(n / rc) * a;
      s.save(),
        s.beginPath(),
        s.rect(r + 2, o + 2, i - 4, a - 4),
        s.clip(),
        s.setTransform(
          (i - 4) / nc.width,
          0,
          0,
          (a - 4) / nc.height,
          r + i / 2,
          o + a / 2,
        ),
        uc(e, _c)(s, e, dc(e, t)),
        s.restore();
    }),
    { canvas: o, columns: rc, rows: r }
  );
}
var yc = [
    (Q.width / 2) * Ss + 4e-4,
    (Q.height / 2) * Ss + 4e-4,
    (Q.bodyThickness / 2 + Q.ridgeThickness) * Ss + 4e-4,
  ],
  bc = 4,
  xc = 12,
  Sc = Math.PI * (3 - Math.sqrt(5)),
  Cc = 0.3,
  wc = 0.01,
  Tc = [0, 1, 0];
function Ec(e, t) {
  return (
    e.center[1] - Qs(e) < 0 ||
    t.some((t) => Math.abs(t.center[1] - e.center[1]) < 1.2 && ec(e, t))
  );
}
function Dc(e, t, n) {
  let r = n;
  for (e.center[1] = n; (e.center[1] = r - wc), !Ec(e, t); ) r -= wc;
  let i = r - wc;
  for (let n = 0; n < 8; n++)
    (e.center[1] = (r + i) / 2),
      Ec(e, t) ? (i = e.center[1]) : (r = e.center[1]);
  return (e.center[1] = r), e;
}
function Oc(e) {
  let t = e.map((e) => e.center[1]),
    n = Math.max(...e.map(Qs)),
    r = Math.max(...t) - Math.min(...t) + n * 2,
    i = (t) =>
      e.some((r) =>
        e.some(
          (e) => Math.abs(e.center[1] + t - r.center[1]) < n * 2 && ec(r, e, t),
        ),
      );
  for (; !i(r - wc); ) r -= wc;
  return r;
}
function kc(e, t) {
  let n = [],
    r = [],
    i = [],
    a = e(0, Math.PI * 2),
    o = 0;
  for (let s = 0; s < xc + t; s++) {
    a += Sc + e(-0.35, 0.35);
    let t = e(0.42, 0.62),
      c = [Math.cos(a), 0, Math.sin(a)],
      l = aa(Tc, c),
      u,
      d = e() < 0.5;
    for (let r = 0; r < bc; r++) {
      let r = ua(da(c, l, Tc));
      (r = la(r, ca([1, 0, 0], e(-0.45, 0.45)))),
        (r = la(r, ca([0, 1, 0], e(-0.3, 0.3)))),
        (r = la(r, ca([0, 0, 1], e(-0.3, 0.3)))),
        d && (r = la(r, ca([1, 0, 0], Math.PI)));
      let i = fa(ra(c, t), r),
        a = Dc(Zs(i, yc), n, o + Cc);
      (!u || a.center[1] < u.box.center[1]) && (u = { box: a, matrix: i });
    }
    if (
      !u ||
      (Ta(u.matrix, u.box.center),
      n.push(u.box),
      (o = Math.max(o, u.box.center[1] + Qs(u.box))),
      s < xc)
    )
      continue;
    i.push(u.box);
    let f = e(),
      p = e(0.9, 1);
    r.push({
      box: u.box,
      glints: Cs.map(() => (e() < 0.7 ? e(0.4, 1) : e(0, 0.12))),
      hubColor: e() < 0.75 ? 0.5 : 0.06,
      matrix: u.matrix,
      packs: Ks(e(0.05, 0.95)),
      project: s - xc,
      shellColor: f < 0.55 ? p : f < 0.85 ? e(0.25, 0.4) : 0.12,
      y: u.box.center[1],
    });
  }
  let s = Oc(i),
    c = r.map((e) => e.y),
    l = -(Math.min(...c) + Math.max(...c)) / 2;
  for (let e of r)
    (e.y += l),
      (e.box.center[1] += l),
      (e.matrix[13] = (e.matrix[13] ?? 0) + l);
  return r.sort((e, t) => e.y - t.y), { cassettes: r, height: s };
}
var Ac = 0.8,
  jc = class {
    cassettes = [];
    coreLights = [];
    height = 0;
    instances = [];
    labels;
    matrix = new de();
    packTexture;
    parts = [];
    random;
    rotation = 0;
    visible = ``;
    constructor() {
      t(this), (this.random = Ci(9017));
      let { cassettes: e, height: n } = kc(this.random, Gi.length);
      (this.cassettes = e),
        (this.height = n),
        (this.packTexture = Di(this.random)),
        (this.labels = vc(this.random, Xi, Gi)),
        this.createParts();
    }
    createPart(e, t, n) {
      let r = [],
        i = [];
      for (let e of this.cassettes)
        i.push(r.length / 20),
          n(e, (t, n = [1, 1, 1]) => {
            r.push(n[0] ?? 1, n[1] ?? 1, n[2] ?? 1, 1, ...ma(e.matrix, t));
          });
      i.push(r.length / 20),
        this.parts.push({
          instances: new Float32Array(r),
          material: e,
          mesh: t,
          offsets: i,
          visible: new Float32Array(r.length * 2),
          visibleCount: 0,
        });
    }
    createParts() {
      let e = [-Q.hubSpacing / 2, Q.hubSpacing / 2];
      this.createPart(`shell`, Vs(), (e, t) => {
        t(pa(), [e.shellColor, e.shellColor, e.shellColor]);
      }),
        this.createPart(`hub`, Xs(), (e, t) => {
          t(pa(), [e.hubColor, e.hubColor, e.hubColor]);
        }),
        this.createPart(`metal`, Ys(), (e, t) => {
          t(pa());
        }),
        this.createPart(`pack`, Us(), (t, n) => {
          e.forEach((e, r) => {
            let i = r === 0 ? t.packs.left : t.packs.right;
            n(ma(qs(e, Q.hubY), ga(i, i, 1)));
          });
        }),
        this.createPart(`felt`, Ws(5, 2.6, 3.6), (e, t) => {
          t(qs(0, -29));
        }),
        this.createPart(`tape`, Ws(1, 0.16, Q.tapeWidth), (t, n) => {
          n(ma(qs(0, -27.4), ga(69, 1, 1))),
            e.forEach((e, r) => {
              let i = r === 0 ? -1 : 1,
                a = r === 0 ? t.packs.left : t.packs.right,
                o = e + i * a * 0.35,
                s = Q.hubY - a * 0.94,
                c = i * 37,
                l = -25.4,
                u = Math.hypot(c - o, l - s),
                d = Math.atan2(l - s, c - o);
              n(ma(ma(qs((o + c) / 2, (s + l) / 2), ya(d)), ga(u, 1, 1)));
            });
        }),
        this.createPart(`glint`, Ws(1, 1.4, 5.2), (e, t) => {
          Cs.forEach((n, r) => {
            let i = e.glints[r] ?? 0;
            t(ma(qs(n.x, -Q.height / 2 + 1.6), ga(n.width, 1, 1)), [i, i, i]);
          });
        }),
        this.createPart(`label`, Gs(), (e, t) => {
          t(pa(), [e.project, 0, 0]);
        });
    }
    cull(e, t) {
      let n = [],
        r = Math.floor((e + this.height / 2) / this.height) - 1,
        i = Math.floor((t + this.height / 2) / this.height) + 1;
      for (let a = r; a <= i; a++) {
        let r = a * this.height,
          i = this.cassettes.filter((t) => t.y < e - r).length,
          o = this.cassettes.filter((e) => e.y <= t - r).length;
        o > i && n.push({ first: i, last: o, offset: r });
      }
      let a = n
        .map(({ first: e, last: t, offset: n }) => `${e}:${t}:${n}`)
        .join(` `);
      if (a === this.visible) return !1;
      (this.visible = a),
        (this.instances = n.flatMap(({ first: e, last: t, offset: n }) =>
          this.cassettes.slice(e, t).map((e) => ({ cassette: e, offset: n })),
        ));
      for (let e of this.parts) {
        let t = 0;
        for (let r of n) {
          let n = e.offsets[r.first] ?? 0,
            i = Math.max(e.offsets[r.last] ?? 0, n);
          e.visible.set(e.instances.subarray(n * 20, i * 20), t * 20);
          for (let a = t; a < t + i - n; a++)
            e.visible[a * 20 + 4 + 13] =
              (e.visible[a * 20 + 4 + 13] ?? 0) + r.offset;
          t += i - n;
        }
        e.visibleCount = t;
      }
      return !0;
    }
    pick(e, t) {
      let n,
        r = 1 / 0;
      for (let i of this.instances) {
        let a = tc(i.cassette.box, e, t, i.offset);
        a < r && ((n = i), (r = a));
      }
      return n;
    }
    getWorldMatrix({ cassette: e, offset: t }, n) {
      return n
        .identity()
        .translate([0, t, 0])
        .premultiply(this.matrix)
        .multiply(e.matrix);
    }
    update({ height: e, rotation: t }) {
      (this.rotation = t),
        this.matrix.identity().rotateY(t),
        (this.coreLights = Array.from({ length: 3 }, (t, n) => {
          let r = n * 2.4;
          return [Math.cos(r) * 0.16, e + (n - 1) * Ac, Math.sin(r) * 0.16];
        }));
    }
  },
  Mc = [`hub`, `metal`, `pack`, `felt`, `tape`, `glint`, `label`, `shell`],
  Nc = {
    arrayStride: 32,
    attributes: [
      { format: `float32x3`, offset: 0, shaderLocation: 0 },
      { format: `float32x3`, offset: 12, shaderLocation: 1 },
      { format: `float32x2`, offset: 24, shaderLocation: 2 },
    ],
  },
  Pc = {
    arrayStride: 80,
    attributes: [0, 1, 2, 3, 4].map((e) => ({
      format: `float32x4`,
      offset: e * 16,
      shaderLocation: 3 + e,
    })),
    stepMode: `instance`,
  },
  Fc = { depthCompare: `less-equal`, depthWriteEnabled: !0, format: Na },
  Ic = { dstFactor: `one-minus-src-alpha`, operation: `add`, srcFactor: `one` };
function Lc(e) {
  return [...Ti(e), 1];
}
function Rc(e) {
  let t = Lc($i.tape),
    n = [1, 1, 1, 1];
  return {
    felt: { color: Lc(`#555555`), surface: [0, 1, 0, 0] },
    glint: { color: Lc($i.glow), surface: [0, 1, 0, 0] },
    hub: { color: n, surface: [0, 0.38, 0, 0] },
    label: { color: n, surface: [0.1, 0.55, 0, 1] },
    metal: { color: Lc(`#cfcfcf`), surface: [1, 0.26, 0, 0] },
    pack: { color: t, surface: [0.2, 0.5, 0.6, 0] },
    shell: { color: n, surface: [0, 0.06, 0, 0] },
    tape: { color: t, surface: [0.3, 0.35, 0, 0] },
  }[e];
}
var zc = class {
    frameBuffer;
    frameGroups = new Map();
    frameUniforms;
    gpu;
    labelColumns;
    labelRows;
    parts = [];
    pipelines;
    resources = [];
    constructor({ gpu: e, lighting: n, tower: r }) {
      t(this),
        (this.gpu = e),
        (this.labelColumns = r.labels.columns),
        (this.labelRows = r.labels.rows);
      let i = (t, n, r = !1) =>
        new yi(e, {
          blending: r ? { alpha: Ic, color: Ic } : {},
          code: t,
          cullMode: `back`,
          depthStencil: Fc,
          label: n,
          sampleCount: 4,
          targets: [{ format: Ma }],
          vertexBuffers: [Nc, Pc],
        });
      (this.pipelines = {
        glint: i(So, `scene-glint`),
        label: i(Co, `scene-label`),
        pack: i(wo, `scene-pack`),
        shell: i(To, `scene-shell`, !0),
        standard: i(Eo, `scene-standard`),
      }),
        (this.frameUniforms = Ne(
          this.pipelines.standard.defs.uniforms.uniforms,
        )),
        (this.frameBuffer = Ia(
          e,
          this.frameUniforms.arrayBuffer.byteLength,
          `frame`,
        ));
      let a = za(e),
        o = Ra(e, r.labels.canvas, `rgba8unorm-srgb`),
        s = Ra(e, r.packTexture, `rgba8unorm`);
      this.resources.push(this.frameBuffer, o, s);
      for (let t of Object.values(this.pipelines)) {
        let r = {
          linearSampler: a,
          tEnvironment: n.environment.createView({ dimension: `cube` }),
          uniforms: { buffer: this.frameBuffer },
        };
        this.frameGroups.set(t, Fa(e, t, 0, r, `frame`));
      }
      for (let t of r.parts) {
        let n = this.getPipeline(t.material),
          r = Ne(n.defs.uniforms.material),
          i = Ia(e, r.arrayBuffer.byteLength, `material-${t.material}`);
        r.set(Rc(t.material)), e.device.queue.writeBuffer(i, 0, r.arrayBuffer);
        let a = new Float32Array(t.mesh),
          c = e.device.createBuffer({
            label: `vertices-${t.material}`,
            size: a.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          });
        e.device.queue.writeBuffer(c, 0, a);
        let l = e.device.createBuffer({
            label: `instances-${t.material}`,
            size: t.visible.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          }),
          u = {
            material: { buffer: i },
            tLabels: o.createView(),
            tPack: s.createView(),
          };
        this.resources.push(i, c, l),
          this.parts.push({
            bindGroup: Fa(e, n, 1, u, `material-${t.material}`),
            instanceBuffer: l,
            instanceCount: 0,
            material: t.material,
            pipeline: n,
            vertexBuffer: c,
            vertexCount: a.length / 8,
          });
      }
      this.parts.sort(
        (e, t) => Mc.indexOf(e.material) - Mc.indexOf(t.material),
      );
    }
    getPipeline(e) {
      return e === `glint` || e === `label` || e === `pack` || e === `shell`
        ? this.pipelines[e]
        : this.pipelines.standard;
    }
    uploadInstances(e) {
      for (let t of e.parts) {
        let e = this.parts.find((e) => e.material === t.material);
        e &&
          ((e.instanceCount = t.visibleCount),
          this.gpu.device.queue.writeBuffer(
            e.instanceBuffer,
            0,
            t.visible,
            0,
            t.visibleCount * 20,
          ));
      }
    }
    update(e, { camera: t, lighting: n, settings: r, viewProjection: i }) {
      let a = Array.from(e.matrix);
      this.frameUniforms.set({
        camera: [...t, 1],
        core: e.coreLights.map((e) => [...ba(a, e), r.coreIntensity]),
        coreColor: Lc($i.glow),
        edgeColor: Lc($i.glow),
        environment: [
          r.environmentIntensity,
          6,
          this.labelColumns,
          this.labelRows,
        ],
        key: [...n.key, n.keyIntensity],
        keyColor: Lc($i.key),
        rim: [...n.rim, n.rimIntensity],
        rimColor: Lc($i.rim),
        rimFill: [...n.rimFill, n.rimFillIntensity],
        rimFillColor: Lc($i.glow),
        shell: [r.edgeGlow, r.glassOpacity, r.roughness, r.glints],
        tower: a,
        viewProjection: Array.from(i),
      }),
        this.gpu.device.queue.writeBuffer(
          this.frameBuffer,
          0,
          this.frameUniforms.arrayBuffer,
        );
    }
    draw(e, { color: t, depth: n, resolve: r }) {
      let [i = 0, a = 0, o = 0] = Ti($i.background),
        s = e.beginRenderPass({
          colorAttachments: [
            {
              clearValue: { a: 1, b: o, g: a, r: i },
              loadOp: `clear`,
              resolveTarget: r,
              storeOp: `discard`,
              view: t,
            },
          ],
          depthStencilAttachment: {
            depthClearValue: 1,
            depthLoadOp: `clear`,
            depthStoreOp: `store`,
            view: n,
          },
          label: `scene`,
        }),
        c = 0,
        l;
      for (let e of this.parts)
        e.instanceCount !== 0 &&
          (e.pipeline !== l &&
            ((l = e.pipeline),
            s.setPipeline(l.pipeline),
            s.setBindGroup(
              0,
              this.frameGroups.get(l),
              l.hasDynamicUniform ? [0] : [],
            )),
          s.setBindGroup(1, e.bindGroup),
          s.setVertexBuffer(0, e.vertexBuffer),
          s.setVertexBuffer(1, e.instanceBuffer),
          s.draw(e.vertexCount, e.instanceCount),
          c++);
      return s.end(), c;
    }
    destroy() {
      for (let e of this.resources) e.destroy();
      for (let e of Object.values(this.pipelines)) e.destroy();
    }
  },
  Bc = 84,
  Vc = 60 / Bc / 4,
  Hc = 0.16,
  Uc = 16,
  Wc = 0.15,
  Gc = [`click`, `keydown`, `pointerup`, `touchend`],
  Kc = [
    { bass: 36, keys: [52, 55, 59, 62] },
    { bass: 45, keys: [55, 59, 60, 64] },
    { bass: 38, keys: [53, 57, 60, 64] },
    { bass: 43, keys: [53, 57, 59, 64] },
  ],
  qc = [72, 74, 76, 79, 81, 84];
function Jc(e) {
  return 440 * 2 ** ((e - 69) / 12);
}
function Yc(e, t) {
  let n = e.createBuffer(1, Math.round(e.sampleRate * t), e.sampleRate),
    r = n.getChannelData(0);
  for (let e = 0; e < r.length; e++) r[e] = Math.random() * 2 - 1;
  return n;
}
function Xc(e, t) {
  let n = e.createBuffer(1, Math.round(e.sampleRate * t), e.sampleRate),
    r = n.getChannelData(0);
  for (let e = 0; e < r.length; e++)
    r[e] =
      Math.random() < 4e-4
        ? (Math.random() * 2 - 1) * 0.8
        : (Math.random() * 2 - 1) * 0.004;
  return n;
}
function Zc(e, t) {
  let n = Math.round(e.sampleRate * t),
    r = e.createBuffer(2, n, e.sampleRate);
  for (let e = 0; e < 2; e++) {
    let t = r.getChannelData(e);
    for (let e = 0; e < n; e++)
      t[e] = (Math.random() * 2 - 1) * (1 - e / n) ** 3;
  }
  return r;
}
var Qc = class {
    button;
    energy = 0;
    graph;
    isEnabled = !1;
    nextTime = 0;
    rate = 0;
    step = 0;
    constructor({ button: e }) {
      t(this),
        (this.button = e),
        this.button?.addEventListener(`click`, this.onButtonClick);
      for (let e of Gc)
        window.addEventListener(e, this.onGesture, {
          capture: !0,
          passive: !0,
        });
      document.addEventListener(`visibilitychange`, this.onVisibilityChange),
        this.render();
    }
    create() {
      let { audioSession: e } = navigator;
      e && (e.type = `playback`);
      let t = new AudioContext(),
        n = Yc(t, 2),
        r = t.createDynamicsCompressor();
      (r.ratio.value = 3), (r.threshold.value = -18), r.connect(t.destination);
      let i = t.createGain();
      (i.gain.value = 0), i.connect(r);
      let a = t.createConvolver();
      a.buffer = Zc(t, 1.6);
      let o = t.createGain();
      (o.gain.value = 0.18), o.connect(a).connect(i);
      let s = t.createBiquadFilter();
      (s.type = `lowpass`),
        (s.frequency.value = 6e3),
        (s.Q.value = 0.5),
        s.connect(i),
        s.connect(o);
      let c = t.createGain();
      (c.gain.value = 0.8), c.connect(s);
      let l = t.createBufferSource(),
        u = t.createBiquadFilter(),
        d = t.createGain();
      (l.buffer = Xc(t, 4)),
        (l.loop = !0),
        (u.type = `bandpass`),
        (u.frequency.value = 2500),
        (u.Q.value = 0.6),
        (d.gain.value = 0.12),
        l.connect(u).connect(d).connect(c),
        l.start();
      let f = t.createGain(),
        p = t.createGain();
      return (
        (p.gain.value = 0.25),
        f.connect(i),
        f.connect(p).connect(a),
        { context: t, effects: f, master: i, music: c, noise: n, tone: s }
      );
    }
    playKeys(e, t, n, r) {
      let i = this.graph;
      if (!i) return;
      let { context: a, music: o } = i,
        s = a.createGain(),
        c = a.createOscillator(),
        l = a.createGain(),
        u = Jc(e);
      s.gain.setValueAtTime(0, t),
        s.gain.linearRampToValueAtTime(r, t + 0.012),
        s.gain.setTargetAtTime(r * 0.35, t + 0.012, 0.25),
        s.gain.setTargetAtTime(0, t + n, 0.18),
        (c.frequency.value = 4.6),
        (l.gain.value = r * 0.12),
        c.connect(l).connect(s.gain);
      for (let [e, r, i] of [
        [1, 1, -4],
        [1, 0.6, 5],
        [2, 0.18, 0],
      ]) {
        let o = a.createOscillator(),
          c = a.createGain();
        (o.type = `sine`),
          (o.frequency.value = u * e),
          (o.detune.value = i),
          (c.gain.value = r),
          o.connect(c).connect(s),
          o.start(t),
          o.stop(t + n + 1);
      }
      c.start(t), c.stop(t + n + 1), s.connect(o);
    }
    playBass(e, t, n) {
      let r = this.graph;
      if (!r) return;
      let { context: i, music: a } = r,
        o = i.createOscillator(),
        s = i.createBiquadFilter(),
        c = i.createGain();
      (o.type = `triangle`),
        (o.frequency.value = Jc(e)),
        (s.type = `lowpass`),
        (s.frequency.value = 420),
        c.gain.setValueAtTime(0, t),
        c.gain.linearRampToValueAtTime(0.32, t + 0.015),
        c.gain.setTargetAtTime(0, t + n, 0.08),
        o.connect(s).connect(c).connect(a),
        o.start(t),
        o.stop(t + n + 0.5);
    }
    playKick(e, t) {
      let n = this.graph;
      if (!n) return;
      let { context: r, music: i } = n,
        a = r.createOscillator(),
        o = r.createGain();
      (a.type = `sine`),
        a.frequency.setValueAtTime(110, e),
        a.frequency.exponentialRampToValueAtTime(42, e + 0.12),
        o.gain.setValueAtTime(t, e),
        o.gain.exponentialRampToValueAtTime(1e-4, e + 0.32),
        a.connect(o).connect(i),
        a.start(e),
        a.stop(e + 0.35);
    }
    playNoise(e, { frequency: t, gain: n, length: r, type: i }) {
      let a = this.graph;
      if (!a) return;
      let { context: o, music: s, noise: c } = a,
        l = o.createBufferSource(),
        u = o.createBiquadFilter(),
        d = o.createGain();
      (l.buffer = c),
        (u.type = i),
        (u.frequency.value = t),
        (u.Q.value = 0.8),
        d.gain.setValueAtTime(n, e),
        d.gain.exponentialRampToValueAtTime(1e-4, e + r),
        l.connect(u).connect(d).connect(s),
        l.start(e, Math.random() * 1.5),
        l.stop(e + r + 0.02);
    }
    schedule(e, t) {
      let n = e % Uc,
        r = Math.floor(e / Uc),
        i = Kc[r % Kc.length],
        a = 60 / Bc;
      if (
        (n === 0 &&
          (i.keys.forEach((e, n) => {
            this.playKeys(e, t + n * 0.012, a * 3.2, 0.06);
          }),
          this.playBass(i.bass, t, a * 1.6)),
        n === 10)
      )
        for (let e of i.keys.slice(1)) this.playKeys(e, t, a * 0.7, 0.035);
      if (
        ((n === 8 || n === 14) &&
          this.playBass(i.bass + (n === 14 ? 7 : 0), t, a * 0.45),
        (n === 0 || n === 10 || (n === 7 && r % 2 == 1)) &&
          this.playKick(t, 0.42),
        (n === 4 || n === 12) &&
          this.playNoise(t, {
            frequency: 1700,
            gain: 0.11,
            length: 0.14,
            type: `bandpass`,
          }),
        n % 2 == 0
          ? this.playNoise(t, {
              frequency: 7500,
              gain: 0.03,
              length: 0.035,
              type: `highpass`,
            })
          : this.energy > 0.6 &&
            this.playNoise(t, {
              frequency: 8500,
              gain: 0.014 * this.energy,
              length: 0.025,
              type: `highpass`,
            }),
        (n === 6 || n === 11 || n === 14) &&
          Math.random() < 0.3 + this.energy * 0.2)
      ) {
        let e = qc[Math.floor(Math.random() * qc.length)] ?? 72;
        this.playKeys(e, t, a * 0.9, 0.035);
      }
    }
    beep({
      delay: e = 0,
      end: t,
      gain: n,
      length: r,
      pan: i,
      start: a,
      type: o,
    }) {
      let s = this.graph;
      if (!s || !this.isEnabled) return;
      let { context: c, effects: l } = s,
        u = c.currentTime + e,
        d = c.createOscillator(),
        f = c.createGain(),
        p = c.createStereoPanner();
      (d.type = o),
        d.frequency.setValueAtTime(a, u),
        d.frequency.exponentialRampToValueAtTime(t, u + r),
        f.gain.setValueAtTime(0, u),
        f.gain.linearRampToValueAtTime(n, u + 0.006),
        f.gain.exponentialRampToValueAtTime(1e-4, u + r),
        (p.pan.value = xi(i, -1, 1)),
        d.connect(f).connect(p).connect(l),
        d.start(u),
        d.stop(u + r + 0.02);
    }
    burst({ frequency: e, gain: t, length: n, pan: r }) {
      let i = this.graph;
      if (!i || !this.isEnabled) return;
      let { context: a, effects: o, noise: s } = i,
        c = a.currentTime,
        l = a.createBufferSource(),
        u = a.createBiquadFilter(),
        d = a.createGain(),
        f = a.createStereoPanner();
      (l.buffer = s),
        (u.type = `bandpass`),
        (u.frequency.value = e),
        (u.Q.value = 1.4),
        d.gain.setValueAtTime(t, c),
        d.gain.exponentialRampToValueAtTime(1e-4, c + n),
        (f.pan.value = xi(r, -1, 1)),
        l.connect(u).connect(d).connect(f).connect(o),
        l.start(c, Math.random() * 1.5),
        l.stop(c + n + 0.02);
    }
    lock(e) {
      [76, 79, 84].forEach((t, n) => {
        let r = Jc(t);
        this.beep({
          delay: n * 0.055,
          end: r,
          gain: 0.045,
          length: 0.35,
          pan: e,
          start: r,
          type: `sine`,
        });
      });
      for (let t = 0; t < 4; t++) {
        let n = Jc((qc[Math.floor(Math.random() * qc.length)] ?? 84) + 12);
        this.beep({
          delay: 0.2 + t * 0.06,
          end: n,
          gain: 0.012,
          length: 0.12,
          pan: e,
          start: n,
          type: `sine`,
        });
      }
    }
    tick(e) {
      this.burst({
        frequency: 5200 + Math.random() * 2400,
        gain: 0.035,
        length: 0.015,
        pan: e,
      });
    }
    eject() {
      this.beep({
        end: 55,
        gain: 0.12,
        length: 0.16,
        pan: 0,
        start: 120,
        type: `sine`,
      }),
        this.burst({ frequency: 1400, gain: 0.08, length: 0.06, pan: 0 });
    }
    update({ delta: e, rate: t, volume: n }) {
      let r = this.graph;
      if (
        ((this.rate += (Math.abs(t) - this.rate) * Si(4, e)),
        (this.energy = xi(this.rate / 2.5)),
        !r || !this.isEnabled)
      )
        return;
      let { context: i, master: a, music: o, tone: s } = r,
        c = i.currentTime,
        l = xi(this.rate);
      for (
        a.gain.setTargetAtTime(n * 0.9, c, 0.15),
          o.gain.setTargetAtTime(0.55 + l * 0.3, c, 0.2),
          s.frequency.setTargetAtTime(
            500 + l * 5500 + this.energy * 3e3,
            c,
            0.2,
          ),
          this.nextTime < c - 0.25 &&
            ((this.nextTime = c + 0.05),
            (this.step = Math.ceil(this.step / Uc) * Uc));
        this.nextTime < c + Wc;

      ) {
        let e = this.step % 2 == 1 ? Vc * Hc : 0;
        this.schedule(this.step, this.nextTime + e),
          (this.nextTime += Vc),
          this.step++;
      }
    }
    unlock() {
      let e = this.graph?.context;
      if (!e || e.state === `running`) return;
      let t = e.createBufferSource();
      (t.buffer = e.createBuffer(1, 1, e.sampleRate)),
        t.connect(e.destination),
        t.start(),
        e.resume();
    }
    onGesture(e) {
      (e.target instanceof Node && this.button?.contains(e.target)) ||
        (e instanceof KeyboardEvent && [`Escape`, `M`, `m`].includes(e.key)) ||
        (this.isEnabled ? this.unlock() : this.toggle(!0));
    }
    onButtonClick(e) {
      e.stopPropagation(), this.toggle(!this.isEnabled);
    }
    onVisibilityChange() {
      let e = this.graph?.context;
      e && (document.hidden ? e.suspend() : this.isEnabled && e.resume());
    }
    toggle(e) {
      this.graph ||= this.create();
      let { context: t, master: n } = this.graph;
      (this.isEnabled = e),
        e
          ? (this.unlock(),
            (this.nextTime = t.currentTime + 0.05),
            (this.step = 0))
          : n.gain.setTargetAtTime(0, t.currentTime, 0.08),
        this.render();
    }
    render() {
      this.button &&
        (this.button.setAttribute(
          `aria-label`,
          this.isEnabled ? `Turn sound off` : `Turn sound on`,
        ),
        this.button.setAttribute(`aria-pressed`, String(this.isEnabled)));
    }
  },
  $c = [
    { height: 50, isLabeled: !0, width: 88, x: 0, y: 5 },
    { height: 22, isLabeled: !0, width: 22, x: -Q.hubSpacing / 2, y: Q.hubY },
    { height: 22, isLabeled: !0, width: 22, x: Q.hubSpacing / 2, y: Q.hubY },
    { height: 10, isLabeled: !1, width: 16, x: 0, y: Q.hubY },
    { height: 18, isLabeled: !0, width: 26, x: -28, y: 19 },
    { height: 14, isLabeled: !1, width: 20, x: 12, y: 19 },
    { height: 12, isLabeled: !0, width: 30, x: 26, y: -12 },
    { height: 16, isLabeled: !1, width: 12, x: -38, y: -8 },
    ...ws.map(({ x: e, y: t }, n) => ({
      height: 6,
      isLabeled: n % 2 == 0,
      width: 6,
      x: e,
      y: t,
    })),
    { height: 8, isLabeled: !0, width: 8, x: -34.5, y: -24.8 },
    { height: 8, isLabeled: !1, width: 8, x: 34.5, y: -24.8 },
    ...Cs.map(({ width: e, x: t }, n) => ({
      height: 4,
      isLabeled: n === 2,
      width: e,
      x: t,
      y: -30,
    })),
  ],
  el = 72,
  tl = [[], [3, 4], [6, 5], [1, 4], [12, 6]],
  nl = 0.14,
  rl = 0.09,
  il = 0.4,
  al = 0.25,
  ol = 18,
  sl = 30,
  cl = 120,
  ll = 240,
  ul = 8,
  dl = 4,
  fl = 7,
  pl = [``, `·`, `/`, `×`, `□`, `▣`],
  ml = `500 11px "Helvetica Neue", Helvetica, Arial, sans-serif`,
  hl = `600 8px Menlo, "SF Mono", monospace`,
  gl = `rgb(236 236 236 / 85%)`,
  _l = `rgb(0 0 0 / 70%)`,
  vl = `600 13px "Helvetica Neue", Helvetica, Arial, sans-serif`;
function $(e = 0, t = 1) {
  return e + Math.random() * (t - e);
}
function yl(e) {
  return e[Math.floor(Math.random() * e.length)];
}
function bl() {
  return {
    ascii: $(0.1, 1),
    image: $(0.2, 1),
    none: $(0, 0.35),
    pixels: $(0.1, 1),
  };
}
function xl(e) {
  let t = e.ascii + e.image + e.none + e.pixels,
    n = Math.random() * t;
  for (let t of [`image`, `ascii`, `pixels`, `none`])
    if (((n -= e[t]), n <= 0)) return t;
  return `image`;
}
function Sl() {
  let e = Math.random();
  return e < 0.5
    ? `solid`
    : e < 0.68
      ? `brackets`
      : e < 0.85
        ? `dashed`
        : `faint`;
}
function Cl() {
  return Array.from({ length: Math.floor($(4, 9)) }, () => {
    let e = Math.random() < 0.55;
    return {
      angle: $(-1, 1) * (Math.random() < 0.5 ? 0.7 : Math.PI),
      dash: yl(tl),
      dashSpeed: $(-30, 30),
      delay: $(0, 0.35),
      isMeridian: Math.random() < 0.45,
      opacity: $(0.18, 0.75),
      tiltX: $(-0.35, 0.35),
      tiltZ: $(-0.35, 0.35),
      travellers: e
        ? Array.from({ length: Math.floor($(1, 4)) }, () => ({
            isSquare: Math.random() < 0.3,
            offset: Math.random(),
            size: $(1.5, 3.2),
            speed: $(0.04, 0.22) * (Math.random() < 0.5 ? -1 : 1),
          }))
        : [],
      width: yl([0.75, 1, 1, 1.5]),
    };
  });
}
var wl = class {
    canvas;
    context;
    isClear = !0;
    matrix = new de();
    onLock;
    onTick;
    opacity = 0;
    dim = 0;
    reticle = 0;
    pointer;
    pointerSpeed = 0;
    sources = [];
    speedBoost = 1;
    target;
    time = 0;
    travel = 0;
    constructor({ onLock: e, onTick: n } = {}) {
      t(this),
        (this.onLock = e),
        (this.onTick = n),
        (this.canvas = document.createElement(`canvas`)),
        this.canvas.classList.add(`tracker`),
        this.canvas.setAttribute(`aria-hidden`, `true`);
      let r = this.canvas.getContext(`2d`);
      if (!r) throw Error(`2D canvas is required for the tracker.`);
      (this.context = r),
        document.body.appendChild(this.canvas),
        this.onResize();
    }
    select(e) {
      if (!e || e.cassette === this.target?.instance.cassette) return;
      let t = Gi[e.cassette.project];
      if (!t) return;
      this.target?.source?.video?.pause();
      let n = this.sources[e.cassette.project];
      n?.load(), n?.video?.play().catch(() => {});
      let r = bl(),
        i = $(0.15, 0.55);
      (this.target = {
        connection: yl([[1, 3], [1, 3], [4, 4], [], void 0]),
        elements: $c.map((e, t) => ({
          ...e,
          delay: t === 0 ? 0 : $(0, 0.45),
          fill: t === 0 ? `none` : xl(r),
          flash: 0,
          focus: 0,
          hasCorners: t !== 0 && Math.random() < i,
          hasTicked: !1,
          isCornerFilled: Math.random() < 0.5,
          isCrossed: Math.random() < 0.35,
          isSizeLabel: e.width >= 20 && Math.random() < 0.3,
          labelSide: yl([`above`, `above`, `above`, `below`, `right`]),
          nextFill: this.time + $(1, 3),
          outline: t === 0 ? `solid` : Sl(),
        })),
        fills: r,
        instance: e,
        project: t,
        rings: Cl(),
        shell: { x: $(70, 92), y: $(46, 64), z: $(32, 50) },
        source: n,
        time: this.time,
      }),
        (this.opacity = 1),
        this.onLock?.(this.getPan(e));
    }
    getPan(e) {
      return xi((e.cassette.box.center[0] / 0.8) * 0.5, -1, 1);
    }
    project(e, t, n, r) {
      let i = Sa(this.matrix, [t * Ss, n * Ss, r * Ss]),
        [a, o, s, c] = Sa(e.viewProjection, [i[0], i[1], i[2]]);
      if (!(c <= 0 || s / c > 1))
        return {
          x: ((a / c) * 0.5 + 0.5) * window.innerWidth,
          y: (-(o / c) * 0.5 + 0.5) * window.innerHeight,
        };
    }
    measure(e, t, n) {
      let r = 1 / 0,
        i = 1 / 0,
        a = -1 / 0,
        o = -1 / 0;
      for (let [s, c] of [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5],
        [-0.5, 0.5],
      ]) {
        let l = this.project(e, t.x + s * t.width, t.y + c * t.height, n);
        if (!l) return;
        (r = Math.min(r, l.x)),
          (i = Math.min(i, l.y)),
          (a = Math.max(a, l.x)),
          (o = Math.max(o, l.y));
      }
      return { height: o - i, left: r, top: i, width: a - r };
    }
    update({
      camera: e,
      cursor: t,
      delta: n,
      getMatrix: r,
      isFocused: i,
      isHovering: a,
      pointer: o,
    }) {
      if (((this.time += n), o && this.pointer && n > 0)) {
        let e = Math.hypot(o.x - this.pointer.x, o.y - this.pointer.y) / n;
        this.pointerSpeed += (e - this.pointerSpeed) * Si(6, n);
      } else this.pointerSpeed *= Math.exp(-n * 4);
      (this.pointer = o ? { ...o } : void 0),
        (this.speedBoost = 1 + Math.min(this.pointerSpeed / 500, 3)),
        (this.travel += n * this.speedBoost);
      let { context: s, target: c } = this;
      if (
        (a || (this.opacity = Math.max(0, this.opacity - n / al)),
        (this.dim += (+!!i - this.dim) * Si(6, n)),
        (this.reticle +=
          ((t === `hover` ? 1 : t === `drag` ? -1 : 0) - this.reticle) *
          Si(14, n)),
        !c || this.opacity === 0)
      ) {
        (this.isClear ||=
          (s.clearRect(0, 0, window.innerWidth, window.innerHeight), !0)),
          c &&
            this.opacity === 0 &&
            (c.source?.video?.pause(), (this.target = void 0)),
          this.drawReticle();
        return;
      }
      r(c.instance, this.matrix), c.source && Li(c.source);
      let l = Array.from(this.matrix),
        u =
          (ia(wa(l, 2), na(wa(l, 3), e.position)) < 0 ? 1 : -1) *
          (Q.bodyThickness / 2 + Q.ridgeThickness),
        d = this.time - c.time,
        f = c.elements.map((t) => this.measure(e, t, u)),
        p = f[0];
      if (
        (s.clearRect(0, 0, window.innerWidth, window.innerHeight),
        (this.isClear = !1),
        p && this.dim > 0.01 && this.drawSpotlight(p),
        (s.globalAlpha = this.opacity),
        this.drawShell(e, c, d),
        !p)
      ) {
        (s.globalAlpha = 1), this.drawReticle();
        return;
      }
      let m = Math.hypot(p.width, p.height),
        h = Math.max(m * 1.15, 1),
        g = (h * Oi.height) / Oi.width,
        _ = {
          height: g,
          left: p.left + p.width / 2 - h / 2,
          top: p.top + p.height / 2 - g / 2,
          width: h,
        };
      this.updateFocus(c, f, n),
        this.drawConnections(c, f, d),
        c.elements.forEach((e, t) => {
          let n = f[t];
          n && this.drawElement(e, n, _, c, d);
        }),
        this.drawTracking(c, f, d),
        this.drawTitle(c.project, p, d),
        (s.globalAlpha = 1),
        this.drawReticle();
    }
    updateFocus(e, t, n) {
      e.elements.forEach((e, r) => {
        let i = t[r],
          a = 0;
        i &&
          this.pointer &&
          e.width < 80 &&
          (a =
            1 -
            xi(
              Math.hypot(
                this.pointer.x - (i.left + i.width / 2),
                this.pointer.y - (i.top + i.height / 2),
              ) / cl,
            )),
          (e.focus += (a - e.focus) * Si(10, n));
      });
    }
    getRingPoint(e, t, n) {
      let { shell: r } = e,
        i = 0,
        a = 0,
        o = 0;
      if (t.isMeridian)
        (i = r.x * Math.cos(n) * Math.cos(t.angle)),
          (a = r.y * Math.sin(n)),
          (o = r.z * Math.cos(n) * Math.sin(t.angle));
      else {
        let e = xi(t.angle, -1.2, 1.2);
        (i = r.x * Math.cos(e) * Math.cos(n)),
          (a = r.y * Math.sin(e)),
          (o = r.z * Math.cos(e) * Math.sin(n));
      }
      let s = Math.cos(t.tiltX),
        c = Math.sin(t.tiltX),
        l = a * s - o * c,
        u = a * c + o * s,
        d = Math.cos(t.tiltZ),
        f = Math.sin(t.tiltZ);
      return [i * d - l * f, i * f + l * d, u];
    }
    drawShell(e, t, n) {
      let { context: r } = this;
      for (let i of t.rings) {
        let a = xi((n - i.delay) / 0.5);
        if (a <= 0) continue;
        let o = [];
        for (let n = 0; n <= el; n++) {
          let [r, a, s] = this.getRingPoint(t, i, (n / el) * Math.PI * 2);
          o.push(this.project(e, r, a, s));
        }
        r.save(),
          (r.globalAlpha *= i.opacity),
          (r.strokeStyle = gl),
          (r.lineWidth = i.width),
          (r.lineCap = `round`),
          r.setLineDash(i.dash),
          (r.lineDashOffset = this.travel * i.dashSpeed),
          r.beginPath();
        let s = !1;
        for (let e = 0; e <= el * a; e++) {
          let t = o[e];
          if (!t) {
            s = !1;
            continue;
          }
          s ? r.lineTo(t.x, t.y) : (r.moveTo(t.x, t.y), (s = !0));
        }
        r.stroke(),
          (r.globalAlpha = this.opacity * a * 0.95),
          (r.fillStyle = `#fff`);
        for (let e of i.travellers) {
          let t = ((((e.offset + this.travel * e.speed) % 1) + 1) % 1) * el,
            n = Math.floor(t),
            i = o[n],
            a = o[Math.min(n + 1, el)];
          if (!i || !a) continue;
          let s = t - n,
            c = i.x + (a.x - i.x) * s,
            l = i.y + (a.y - i.y) * s;
          e.isSquare
            ? r.fillRect(c - e.size, l - e.size, e.size * 2, e.size * 2)
            : (r.beginPath(), r.arc(c, l, e.size, 0, Math.PI * 2), r.fill());
        }
        r.restore();
      }
    }
    drawConnections(e, t, n) {
      if (!e.connection) return;
      let { context: r } = this,
        i = e.elements
          .map((e, n) => ({ element: e, rectangle: t[n] }))
          .filter(
            ({ element: e, rectangle: t }) => t && n > e.delay && e.width < 80,
          )
          .sort((e, t) => e.element.delay - t.element.delay)
          .map(({ rectangle: e }) => e)
          .map(({ height: e, left: t, top: n, width: r }) => ({
            x: t + r / 2,
            y: n + e / 2,
          }));
      r.save(),
        (r.globalAlpha *= e.connection.length > 0 ? 0.4 : 0.22),
        (r.strokeStyle = gl),
        (r.lineWidth = 1),
        r.setLineDash(e.connection),
        r.beginPath(),
        i.forEach(({ x: e, y: t }, n) => {
          n === 0 ? r.moveTo(e, t) : r.lineTo(e, t);
        }),
        r.stroke(),
        r.restore();
    }
    drawElement(e, t, n, r, i) {
      let { context: a } = this,
        { source: o } = r,
        s = i - e.delay;
      if (s <= 0) return;
      e.hasTicked ||
        ((e.hasTicked = !0),
        (e.flash = this.time + rl),
        this.onTick?.(this.getPan(r.instance))),
        this.time > e.nextFill &&
          e.fill !== `none` &&
          ((e.fill = xl(r.fills)),
          (e.flash = this.time + rl),
          (e.nextFill = this.time + $(1.2, 3.6)));
      let c =
          e.fill === `none` && e.focus > 0.5 && e.width < 80 ? `image` : e.fill,
        l = s < nl && Math.floor(this.time * 40) % 2 == 0,
        u = (1.25 - 0.25 * xi(s / nl)) * (1 + e.focus * 0.18),
        d = t.left + t.width / 2,
        f = t.top + t.height / 2,
        p = c === `none` || e.width >= 80 ? 0 : sl,
        m = Math.round(Math.max(t.width, p) * u),
        h = Math.round(Math.max(t.height, p) * u),
        g = Math.round(d - m / 2),
        _ = Math.round(f - h / 2),
        v = { height: h, left: g, top: _, width: m };
      if (
        (a.save(),
        (a.globalAlpha *= l ? 0.3 : 1),
        (o && c !== `none` && m >= ol && h >= ol) || this.time < e.flash)
      ) {
        if (
          (a.save(),
          a.beginPath(),
          a.rect(g, _, m, h),
          a.clip(),
          this.time < e.flash)
        )
          (a.fillStyle = `rgb(255 255 255 / 85%)`), a.fillRect(g, _, m, h);
        else if (o && c === `image`) {
          let e = o.video && Ii(o) ? o.video : o.image;
          a.drawImage(e, n.left, n.top, n.width, n.height);
        } else
          o && c === `pixels`
            ? ((a.imageSmoothingEnabled = !1),
              a.drawImage(o.pixels, n.left, n.top, n.width, n.height),
              (a.imageSmoothingEnabled = !0))
            : o && c === `ascii` && this.drawAscii(o, v, n);
        a.restore();
      }
      this.drawOutline(e, v),
        e.isCrossed &&
          m >= ol &&
          ((a.strokeStyle = gl),
          a.beginPath(),
          a.moveTo(d - 3, f - 3),
          a.lineTo(d + 3, f + 3),
          a.moveTo(d + 3, f - 3),
          a.lineTo(d - 3, f + 3),
          a.stroke()),
        (e.isLabeled || e.focus > 0.4) && this.drawLabel(e, v, s),
        a.restore();
    }
    drawOutline(e, { height: t, left: n, top: r, width: i }) {
      let { context: a } = this,
        o = n + i,
        s = r + t;
      if (
        (a.save(),
        (a.strokeStyle = gl),
        (a.lineWidth = 1),
        (a.globalAlpha *=
          e.outline === `faint`
            ? 0.35 + e.focus * 0.65
            : 0.85 + e.focus * 0.15),
        e.outline === `brackets`)
      ) {
        let e = Math.min(fl, i / 2, t / 2);
        a.beginPath();
        for (let [t, i, c, l] of [
          [n, r, 1, 1],
          [o, r, -1, 1],
          [o, s, -1, -1],
          [n, s, 1, -1],
        ])
          a.moveTo(t + 0.5 + c * e, i + 0.5),
            a.lineTo(t + 0.5, i + 0.5),
            a.lineTo(t + 0.5, i + 0.5 + l * e);
        a.stroke();
      } else
        a.setLineDash(e.outline === `dashed` ? [3, 3] : []),
          a.strokeRect(n + 0.5, r + 0.5, i, t);
      if (e.hasCorners || e.focus > 0.35) {
        let t = dl + e.focus * 2;
        a.setLineDash([]), (a.fillStyle = `#fff`);
        for (let [i, c] of [
          [n, r],
          [o, r],
          [o, s],
          [n, s],
        ])
          e.isCornerFilled
            ? a.fillRect(i - t / 2, c - t / 2, t, t)
            : a.strokeRect(i - t / 2 + 0.5, c - t / 2 + 0.5, t, t);
      }
      a.restore();
    }
    drawLabel(e, { height: t, left: n, top: r, width: i }, a) {
      let { context: o } = this,
        s = window.devicePixelRatio,
        c = a < il,
        l = () => Math.floor(Math.random() * 3e3),
        u = c ? l() : Math.round((e.isSizeLabel ? i : n + i / 2) * s),
        d = c ? l() : Math.round((e.isSizeLabel ? t : r + t / 2) * s),
        f = e.isSizeLabel ? `w: ${u}  h: ${d}` : `x: ${u}  y: ${d}`;
      (o.fillStyle = `#fff`),
        (o.font = ml),
        (o.shadowBlur = 3),
        (o.shadowColor = _l),
        e.labelSide === `below`
          ? ((o.textBaseline = `top`), o.fillText(f, n, r + t + 4))
          : e.labelSide === `right`
            ? ((o.textBaseline = `middle`), o.fillText(f, n + i + 6, r + t / 2))
            : ((o.textBaseline = `bottom`), o.fillText(f, n, r - 4));
    }
    drawTracking(e, t, n) {
      let { context: r, pointer: i } = this;
      if (!i) return;
      let a,
        o = ll;
      e.elements.forEach((e, r) => {
        let s = t[r];
        if (!s || e.width >= 80 || n < e.delay) return;
        let c = { x: s.left + s.width / 2, y: s.top + s.height / 2 },
          l = Math.hypot(c.x - i.x, c.y - i.y);
        l < o && ((a = c), (o = l));
      }),
        r.save(),
        (r.fillStyle = `#fff`),
        a &&
          ((r.globalAlpha *= 0.7),
          r.setLineDash([2, 3]),
          (r.lineDashOffset = -this.travel * 20),
          r.beginPath(),
          r.moveTo(i.x, i.y),
          r.lineTo(a.x, a.y),
          (r.strokeStyle = _l),
          (r.lineWidth = 3),
          r.stroke(),
          (r.strokeStyle = gl),
          (r.lineWidth = 1),
          r.stroke(),
          (r.font = ml),
          (r.textBaseline = `top`),
          (r.shadowBlur = 3),
          (r.shadowColor = _l),
          r.fillText(
            `d: ${Math.round(o * window.devicePixelRatio)}`,
            i.x + 14,
            i.y + 10,
          )),
        r.restore();
    }
    drawSpotlight(e) {
      let { context: t } = this,
        n = e.left + e.width / 2,
        r = e.top + e.height / 2,
        i = Math.max(Math.hypot(e.width, e.height) * 0.75, 160);
      t.save(),
        (t.globalAlpha = this.dim * this.opacity * 0.78),
        (t.fillStyle = `#000`),
        t.fillRect(0, 0, window.innerWidth, window.innerHeight);
      let a = t.createRadialGradient(n, r, i * 0.45, n, r, i * 1.15);
      a.addColorStop(0, `rgb(0 0 0 / 100%)`),
        a.addColorStop(1, `rgb(0 0 0 / 0%)`),
        (t.globalAlpha = 1),
        (t.globalCompositeOperation = `destination-out`),
        (t.fillStyle = a),
        t.fillRect(0, 0, window.innerWidth, window.innerHeight),
        t.restore();
    }
    drawReticle() {
      let { context: e, pointer: t, reticle: n } = this;
      if (!t) return;
      let r = 7 + n * 4 + Math.sin(this.time * 6) * (1 + Math.max(n, 0)),
        i = 2 + Math.max(n, 0) * 2,
        a = 5 - Math.min(n, 0) * 2,
        o = this.time * (0.6 + Math.max(n, 0) * 2.4);
      e.save(),
        (e.globalAlpha = 0.95),
        e.beginPath(),
        e.arc(t.x, t.y, r, 0, Math.PI * 2);
      for (let n = 0; n < 4; n++) {
        let s = o + (n * Math.PI) / 2,
          c = Math.cos(s),
          l = Math.sin(s);
        e.moveTo(t.x + c * (r + i), t.y + l * (r + i)),
          e.lineTo(t.x + c * (r + i + a), t.y + l * (r + i + a));
      }
      (e.strokeStyle = _l),
        (e.lineWidth = 3),
        e.stroke(),
        (e.strokeStyle = gl),
        (e.lineWidth = 1),
        e.stroke(),
        (e.fillStyle = `#fff`),
        e.fillRect(Math.round(t.x) - 1, Math.round(t.y) - 1, 2, 2),
        e.restore(),
        (this.isClear = !1);
    }
    drawAscii(e, t, n) {
      let { context: r } = this,
        i = n.left + Math.floor((t.left - n.left) / ul) * ul,
        a = n.top + Math.floor((t.top - n.top) / ul) * ul;
      (r.fillStyle = `rgb(0 0 0 / 55%)`),
        r.fillRect(t.left, t.top, t.width, t.height),
        (r.font = hl),
        (r.textAlign = `center`),
        (r.textBaseline = `middle`);
      for (let o = a; o < t.top + t.height; o += ul)
        for (let a = i; a < t.left + t.width; a += ul) {
          let t = Math.floor(xi((a - n.left) / n.width, 0, 0.999) * Ai.width),
            i = Math.floor(xi((o - n.top) / n.height, 0, 0.999) * Ai.height),
            s = e.luminance[i * Ai.width + t] ?? 0,
            c = e.isBright ? 1 - s : s,
            l = pl[Math.min(pl.length - 1, Math.floor(c * pl.length))] ?? ``;
          c > 0.18 &&
            ((r.fillStyle = `rgb(255 255 255 / ${Math.round(c * 45)}%)`),
            r.fillRect(a, o, 7, 7)),
            l &&
              ((r.fillStyle = `#fff`), r.fillText(l, a + ul / 2, o + ul / 2));
        }
      r.textAlign = `left`;
    }
    drawTitle(e, t, n) {
      let { context: r } = this,
        i = Math.floor(xi((n - 0.15) / 0.6) * e.name.length),
        a = `${Ki(e)}${e.url ? `  ↗` : ``}`,
        o = `${e.client}  ·  ${qi(e)}  ·  ${a}`;
      r.save(),
        (r.fillStyle = `#fff`),
        (r.shadowBlur = 3),
        (r.shadowColor = _l),
        (r.textBaseline = `bottom`),
        (r.font = vl),
        r.fillText(
          e.name.slice(0, i).toUpperCase(),
          Math.round(t.left),
          Math.round(t.top) - 36,
        ),
        (r.globalAlpha *= xi((n - 0.5) / 0.3)),
        (r.font = ml),
        r.fillText(o, Math.round(t.left), Math.round(t.top) - 20),
        r.restore();
    }
    onResize() {
      let e = Math.min(window.devicePixelRatio, 2);
      (this.canvas.height = Math.round(window.innerHeight * e)),
        (this.canvas.width = Math.round(window.innerWidth * e)),
        this.context.setTransform(e, 0, 0, e, 0, 0),
        (this.isClear = !1);
    }
  },
  Tl = 2.3,
  El = -0.09,
  Dl = 34,
  Ol = 0.1,
  kl = 30,
  Al = 6,
  jl = 0.18,
  Ml = Math.PI * 1.2,
  Nl = 0.7,
  Pl = class {
    camera = [0, 0, Tl];
    cameraHeight = 0;
    cameraHeightTarget = 0;
    composer;
    controls;
    dragVelocity = 0;
    element;
    elapsed = 0;
    focused;
    focusSpin = 0;
    frame = 0;
    hover;
    hoverSpin = 1;
    hasLink = !1;
    isDragging = !1;
    isOverInterface = !1;
    isPointerInside = !1;
    isTouch = !1;
    lastMoveTime;
    lighting;
    motionScale = 1;
    pointer = { x: 0, y: 0 };
    pointerStart = { x: 0, y: 0 };
    pointerTarget = { x: 0, y: 0 };
    pressDistance = 0;
    pressed;
    previousTower = new de();
    previousViewProjection = new de();
    projection = new de();
    projectionInverse = new de();
    renderer;
    reprojection = new de();
    resolution;
    scene;
    sound;
    spin = 0;
    spinBoost = 0;
    spinVelocity = 0;
    stats = { calls: 0, resolution: 0 };
    tower;
    towerInverse = new de();
    tracker;
    view = new de();
    viewProjection = new de();
    viewProjectionInverse = new de();
    constructor() {
      if ((t(this), !navigator.gpu)) throw Error(`WebGPU is required.`);
      (this.resolution = new xo({
        maximum: ea.pixelRatio,
        minimum: Zi,
        ratio: 1,
      })),
        (this.element = document.createElement(`canvas`)),
        this.element.classList.add(`canvas`),
        this.element.setAttribute(`aria-hidden`, `true`),
        document.body.appendChild(this.element),
        (this.renderer = new li({
          canvas: this.element,
          depth: !1,
          dpr: this.getPixelRatio(),
        })),
        (this.tower = new jc()),
        (this.sound = new Qc({
          button: document.querySelector(`[data-sound]`),
        })),
        (this.tracker = new wl({
          onLock: this.sound.lock,
          onTick: this.sound.tick,
        })),
        window.location.hash === `#debug` &&
          (this.controls = new ro({
            onResize: this.onResize,
            settings: ea,
            stats: this.stats,
          }));
      let e = window.matchMedia(`(prefers-reduced-motion: reduce)`);
      (this.motionScale = e.matches ? 0.35 : 1),
        e.addEventListener(`change`, (e) => {
          this.motionScale = e.matches ? 0.35 : 1;
        }),
        this.addEventListeners();
    }
    async load() {
      await document.fonts.ready,
        await this.renderer.ready,
        this.build(),
        this.renderer.addDeviceRestoredHandler(this.build),
        this.onResize(),
        this.update(0),
        this.render(),
        await this.renderer.gpu.device.queue.onSubmittedWorkDone();
      let e = Bi(Gi);
      (this.tracker.sources = e),
        window.requestAnimationFrame(() => {
          document.documentElement.classList.add(`is-ready`),
            this.renderer.add(this.onLoop),
            Vi(e);
        });
    }
    build() {
      this.scene?.destroy(), this.lighting?.destroy(), this.composer?.destroy();
      let { gpu: e } = this.renderer;
      (this.lighting = new fo(e)),
        (this.scene = new zc({
          gpu: e,
          lighting: this.lighting,
          tower: this.tower,
        })),
        (this.composer = new Ba(e)),
        (this.tower.visible = ``);
    }
    update(e) {
      this.elapsed += e;
      let t = this.elapsed;
      (this.spinBoost *= Math.exp(-e * 1.1)),
        this.isDragging && (this.dragVelocity *= Math.exp(-e * 6)),
        (this.hoverSpin += ((this.hover ? jl : 1) - this.hoverSpin) * Si(4, e));
      let n = ea.spin * this.motionScale * this.hoverSpin;
      if (this.focused) {
        let t = (this.focusSpin - this.spin) * Si(4, e);
        (this.spin += t),
          (this.spinVelocity = e > 0 ? t / e : 0),
          (this.spinBoost = 0);
      } else
        (this.spinVelocity = this.isDragging
          ? this.dragVelocity
          : n + this.spinBoost),
          (this.spin += this.isDragging ? 0 : this.spinVelocity * e);
      let r = this.tower.height;
      if (Math.abs(this.cameraHeight) > r / 2) {
        let e = Math.round(this.cameraHeight / r) * r;
        (this.cameraHeight -= e),
          (this.cameraHeightTarget -= e),
          this.focused && (this.focused.offset -= e),
          this.previousViewProjection.translate([0, e, 0]);
      }
      (this.cameraHeight +=
        (this.cameraHeightTarget - this.cameraHeight) * Si(3, e)),
        (this.pointer.x += (this.pointerTarget.x - this.pointer.x) * Si(3, e)),
        (this.pointer.y += (this.pointerTarget.y - this.pointer.y) * Si(3, e));
      let i = ea.parallax * this.motionScale,
        a = this.cameraHeight + Math.sin(t * 0.13) * 0.18 * this.motionScale,
        o = Math.sin(t * 0.09) * 0.12 * this.motionScale;
      this.camera = [
        o + this.pointer.x * 0.35 * i,
        a + 0.12 + this.pointer.y * 0.22 * i,
        Tl + Math.sin(t * 0.07) * 0.1,
      ];
      let s = this.element.width / Math.max(this.element.height, 1);
      this.projection.perspective((Dl * Math.PI) / 180, s, Ol, kl),
        this.projectionInverse.copy(this.projection).invert(),
        this.view.lookAt(
          this.camera,
          [-0.06, a + 0.02, 0],
          [Math.sin(El), Math.cos(El), 0],
        ),
        this.viewProjection.copy(this.projection).multiply(this.view),
        this.viewProjectionInverse.copy(this.viewProjection).invert(),
        this.tower.update({ height: a, rotation: this.spin }),
        this.towerInverse.copy(this.tower.matrix).invert();
      let c = Math.tan((Dl * Math.PI) / 360) * 3.3 + Nl;
      if (
        (this.tower.cull(a - c, a + c) &&
          this.scene?.uploadInstances(this.tower),
        this.lighting?.update({ pointer: this.pointer, settings: ea }),
        this.focused)
      )
        this.hover = this.focused;
      else if (!this.isTouch) {
        let e = this.isPointerInside && this.pressDistance < Al;
        this.hover = e ? this.pick() : void 0;
      }
      let l = this.hover && Gi[this.hover.cassette.project];
      (this.hasLink = !!l?.url),
        document.documentElement.classList.toggle(`is-hovering`, this.hasLink),
        this.tracker.select(this.hover),
        this.sound.update({
          delta: e,
          rate: this.spinVelocity / Qi,
          volume: ea.volume,
        });
    }
    render(e = 1 / 60) {
      let { composer: t, lighting: n, renderer: r, scene: i } = this;
      if (!t || !n || !i || !r.isReady) return;
      this.frame === 0 &&
        (this.previousTower.copy(this.tower.matrix),
        this.previousViewProjection.copy(this.viewProjection)),
        this.reprojection
          .copy(this.previousViewProjection)
          .multiply(this.previousTower)
          .multiply(this.towerInverse)
          .multiply(this.viewProjectionInverse),
        t.resize(this.element.width, this.element.height),
        i.update(this.tower, {
          camera: this.camera,
          lighting: n,
          settings: ea,
          viewProjection: this.viewProjection,
        });
      let { device: a } = r.gpu,
        o = a.createCommandEncoder({ label: `frame` }),
        s =
          1.6799999999999997 + ea.focus + Math.sin(this.elapsed * 0.21) * 0.12,
        c = i.draw(o, t.getSceneViews());
      (c += t.render(o, r.gpu.getCurrentTexture().createView(), {
        delta: e,
        focus: s,
        frame: this.frame,
        projectionInverse: this.projectionInverse,
        reprojection: this.reprojection,
        settings: ea,
        time: this.elapsed,
      })),
        a.queue.submit([o.finish()]);
      let l =
        this.isDragging && this.pressDistance >= Al
          ? `drag`
          : this.hasLink
            ? `hover`
            : `idle`;
      this.tracker.update({
        camera: { position: this.camera, viewProjection: this.viewProjection },
        cursor: l,
        delta: e,
        getMatrix: this.tower.getWorldMatrix,
        isFocused: !!this.focused,
        isHovering: !!this.hover,
        pointer:
          this.isPointerInside && !this.isTouch && !this.isOverInterface
            ? {
                x: ((this.pointerTarget.x + 1) / 2) * window.innerWidth,
                y: ((1 - this.pointerTarget.y) / 2) * window.innerHeight,
              }
            : void 0,
      }),
        this.previousTower.copy(this.tower.matrix),
        this.previousViewProjection.copy(this.viewProjection),
        (this.stats.calls = c),
        (this.stats.resolution = this.getPixelRatio()),
        this.frame++;
    }
    pick() {
      let e = Ca(this.viewProjectionInverse, [
          this.pointerTarget.x,
          this.pointerTarget.y,
          0.5,
        ]),
        t = Ca(this.towerInverse, this.camera),
        n = sa(na(Ca(this.towerInverse, e), t));
      return this.tower.pick(t, n);
    }
    open(e) {
      let t = Gi[e.cassette.project];
      t?.url &&
        (this.sound.eject(),
        window.open(t.url, `_blank`, `noopener,noreferrer`));
    }
    onTap() {
      if (this.isTouch) {
        let e = this.pick();
        e && e.cassette === this.hover?.cassette
          ? this.open(e)
          : (this.hover = e);
        return;
      }
      this.hover &&
        this.hover.cassette === this.pressed &&
        this.open(this.hover);
    }
    getPixelRatio() {
      return ea.adaptiveResolution ? this.resolution.ratio : ea.pixelRatio;
    }
    focus(e) {
      let t = this.tower.cassettes.find((t) => t.project === e);
      if (!t) return;
      let n = this.tower.height,
        r = Math.round((this.cameraHeight - t.y) / n) * n,
        [i, , a] = t.box.center,
        o =
          ((((-Math.atan2(i, a) - this.spin) % (Math.PI * 2)) + Math.PI * 3) %
            (Math.PI * 2)) -
          Math.PI;
      (this.focused = { cassette: t, offset: r }),
        (this.focusSpin = this.spin + o),
        (this.cameraHeightTarget = t.y + r);
    }
    blur() {
      this.focused = void 0;
    }
    addEventListeners() {
      document.documentElement.addEventListener(
        `pointerleave`,
        this.onPointerLeave,
      ),
        window.addEventListener(mo, this.onProjectBlur),
        window.addEventListener(po, this.onProjectFocus),
        window.addEventListener(`keydown`, this.onKeyDown),
        window.addEventListener(`pointercancel`, this.onPointerUp),
        window.addEventListener(`pointerdown`, this.onPointerDown),
        window.addEventListener(`pointermove`, this.onPointerMove),
        window.addEventListener(`pointerup`, this.onPointerUp),
        window.addEventListener(`resize`, this.onResize),
        window.addEventListener(`wheel`, this.onWheel, { passive: !0 });
    }
    onLoop({ deltaTime: e }) {
      if (e <= 0) return;
      let t = Math.min(e, 0.1);
      ea.adaptiveResolution &&
        this.resolution.update({ delta: t, target: ea.frameRate }) &&
        this.onResize(),
        this.update(t),
        this.render(t);
    }
    onProjectFocus(e) {
      this.focus(e.detail);
    }
    onProjectBlur() {
      this.blur();
    }
    onKeyDown(e) {
      if (e.key === `m` || e.key === `M`) {
        this.sound.toggle(!this.sound.isEnabled);
        return;
      }
      (e.key === `ArrowLeft` || e.key === `ArrowRight`) &&
        (this.spinBoost += e.key === `ArrowLeft` ? -1.2 : 1.2),
        (e.key === `ArrowUp` || e.key === `ArrowDown`) &&
          (this.cameraHeightTarget += e.key === `ArrowUp` ? 0.4 : -0.4);
    }
    onPointerDown(e) {
      (e.target instanceof Element &&
        e.target.closest(`a, button, .lil-gui`)) ||
        ((this.isTouch = e.pointerType !== `mouse`),
        (this.pressDistance = 0),
        (this.pressed = this.hover?.cassette),
        this.onPointerMove(e),
        (this.isDragging = !0),
        (this.dragVelocity = this.spinVelocity),
        (this.pointerStart = { x: e.clientX, y: e.clientY }),
        document.documentElement.classList.add(`is-dragging`));
    }
    onPointerLeave() {
      (this.isPointerInside = !1), (this.pointerTarget = { x: 0, y: 0 });
    }
    onPointerMove(e) {
      if (
        ((this.isPointerInside = !0),
        (this.isTouch = e.pointerType !== `mouse`),
        (this.isOverInterface =
          e.target instanceof Element &&
          !!e.target.closest(`a, button, .lil-gui`)),
        (this.pointerTarget = {
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -((e.clientY / window.innerHeight) * 2 - 1),
        }),
        !this.isDragging)
      )
        return;
      let t = e.clientX - this.pointerStart.x,
        n = e.clientY - this.pointerStart.y;
      this.pressDistance += Math.hypot(t, n);
      let r = (t / window.innerWidth) * Ml,
        i = Math.max(e.timeStamp - (this.lastMoveTime ?? e.timeStamp), 8) / 1e3;
      (this.spin += r),
        (this.dragVelocity += (r / i - this.dragVelocity) * 0.35),
        (this.cameraHeightTarget += (n / window.innerHeight) * 2.2),
        (this.pointerStart = { x: e.clientX, y: e.clientY }),
        (this.lastMoveTime = e.timeStamp);
    }
    onPointerUp(e) {
      this.isDragging &&
        (e.type === `pointerup` && this.pressDistance < Al && this.onTap(),
        (this.pressDistance = 0),
        (this.isDragging = !1),
        (this.spinBoost = this.dragVelocity - ea.spin * this.motionScale),
        (this.lastMoveTime = void 0),
        document.documentElement.classList.remove(`is-dragging`));
    }
    onResize() {
      let e = this.getPixelRatio(),
        t = this.renderer.gpu?.device.limits.maxTextureDimension2D ?? 8192;
      (this.renderer.dpr = e),
        (this.element.width = Math.max(
          1,
          Math.min(Math.round(window.innerWidth * e), t),
        )),
        (this.element.height = Math.max(
          1,
          Math.min(Math.round(window.innerHeight * e), t),
        )),
        this.tracker.onResize();
    }
    onWheel(e) {
      this.cameraHeightTarget -= (e.deltaY / 100) * Yi * 2;
    }
  };
await new Promise((e) => requestAnimationFrame(() => setTimeout(e)));
function Fl(e) {
  document.documentElement.classList.add(`is-unsupported`), console.error(e);
}
var Il = document.querySelector(`.projects`);
Il && new ho({ element: Il });
try {
  new Pl().load().catch(Fl);
} catch (e) {
  Fl(e);
}
