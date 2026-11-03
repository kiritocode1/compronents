      return () => {
        r && ((r = !1), c.delete(n.id), d());
      };
    },
    reportMissing: (e) => {
      r(e, OD);
    },
    subscribe: (e) => (s.add(e), () => s.delete(e)),
    version: () => l,
  });
}
var ND = J.createContext(null),
  PD = 1e-12;
function FD(e, t) {
  return [
    e[1] * t[2] - e[2] * t[1],
    e[2] * t[0] - e[0] * t[2],
    e[0] * t[1] - e[1] * t[0],
  ];
}
function ID(e, t) {
  return e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
}
function LD(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function RD(e) {
  let t = LD(e);
  return t <= PD ? [0, 0, 0] : [e[0] / t, e[1] / t, e[2] / t];
}
function zD(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
var BD = class e {
  x;
  y;
  z;
  w;
  constructor(e = 0, t = 0, n = 0, r = 1) {
    ((this.x = e), (this.y = t), (this.z = n), (this.w = r));
  }
  clone() {
    return new e(this.x, this.y, this.z, this.w);
  }
  invert() {
    let e =
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    return e <= PD
      ? ((this.x = 0), (this.y = 0), (this.z = 0), (this.w = 1), this)
      : ((this.x = -this.x / e),
        (this.y = -this.y / e),
        (this.z = -this.z / e),
        (this.w /= e),
        this);
  }
  length() {
    return Math.hypot(this.x, this.y, this.z, this.w);
  }
  multiply(e) {
    let t = this.x,
      n = this.y,
      r = this.z,
      i = this.w;
    return (
      (this.x = i * e.x + t * e.w + n * e.z - r * e.y),
      (this.y = i * e.y - t * e.z + n * e.w + r * e.x),
      (this.z = i * e.z + t * e.y - n * e.x + r * e.w),
      (this.w = i * e.w - t * e.x - n * e.y - r * e.z),
      this
    );
  }
  normalize() {
    let e = this.length();
    return e <= PD
      ? ((this.x = 0), (this.y = 0), (this.z = 0), (this.w = 1), this)
      : ((this.x /= e), (this.y /= e), (this.z /= e), (this.w /= e), this);
  }
  slerp(e, t) {
    let n = Math.max(0, Math.min(1, t)),
      r = e.x,
      i = e.y,
      a = e.z,
      o = e.w,
      s = this.x * r + this.y * i + this.z * a + this.w * o;
    if (
      (s < 0 && ((s = -s), (r = -r), (i = -i), (a = -a), (o = -o)), s > 0.9995)
    )
      return (
        (this.x += (r - this.x) * n),
        (this.y += (i - this.y) * n),
        (this.z += (a - this.z) * n),
        (this.w += (o - this.w) * n),
        this.normalize()
      );
    let c = Math.acos(Math.max(-1, Math.min(1, s))),
      l = Math.sin(c),
      u = Math.sin((1 - n) * c) / l,
      d = Math.sin(n * c) / l;
    return (
      (this.x = this.x * u + r * d),
      (this.y = this.y * u + i * d),
      (this.z = this.z * u + a * d),
      (this.w = this.w * u + o * d),
      this.normalize()
    );
  }
};
function VD(e, t) {
  let [n, r, i] = e,
    { w: a, x: o, y: s, z: c } = t,
    l = a * n + s * i - c * r,
    u = a * r + c * n - o * i,
    d = a * i + o * r - s * n,
    f = -o * n - s * r - c * i;
  return [
    l * a + f * -o + u * -c - d * -s,
    u * a + f * -s + d * -o - l * -c,
    d * a + f * -c + l * -s - u * -o,
  ];
}
function HD(e, t, n) {
  let r = e[0],
    i = t[0],
    a = n[0],
    o = e[1],
    s = t[1],
    c = n[1],
    l = e[2],
    u = t[2],
    d = n[2],
    f = r + s + d,
    p = new BD();
  if (f > 0) {
    let e = 0.5 / Math.sqrt(f + 1);
    ((p.w = 0.25 / e),
      (p.x = (u - c) * e),
      (p.y = (a - l) * e),
      (p.z = (o - i) * e));
  } else if (r > s && r > d) {
    let e = 2 * Math.sqrt(1 + r - s - d);
    ((p.w = (u - c) / e),
      (p.x = 0.25 * e),
      (p.y = (i + o) / e),
      (p.z = (a + l) / e));
  } else if (s > d) {
    let e = 2 * Math.sqrt(1 + s - r - d);
    ((p.w = (a - l) / e),
      (p.x = (i + o) / e),
      (p.y = 0.25 * e),
      (p.z = (c + u) / e));
  } else {
    let e = 2 * Math.sqrt(1 + d - r - s);
    ((p.w = (o - i) / e),
      (p.x = (a + l) / e),
      (p.y = (c + u) / e),
      (p.z = 0.25 * e));
  }
  return p.normalize();
}
function UD(e, t) {
  let n = RD(e),
    r = Number.isFinite(t) ? t / 2 : 0,
    i = Math.sin(r);
  return new BD(n[0] * i, n[1] * i, n[2] * i, Math.cos(r)).normalize();
}
var WD = [`+x`, `-x`, `+y`, `-y`, `+z`, `-z`],
  GD = Math.PI / 450,
  KD = [0, 1, 0],
  qD = {
    "+x": [1, 0, 0],
    "-x": [-1, 0, 0],
    "+y": [0, 1, 0],
    "-y": [0, -1, 0],
    "+z": [0, 0, 1],
    "-z": [0, 0, -1],
  };
function JD(e) {
  return LD(e.position);
}
function YD(e, t, n) {
  return [
    e[0] + (t[0] - e[0]) * n,
    e[1] + (t[1] - e[1]) * n,
    e[2] + (t[2] - e[2]) * n,
  ];
}
function XD(e, t, n) {
  let r = lc(e);
  if (!Number.isFinite(t) || !Number.isFinite(n)) return r;
  let i = ZD(r),
    a = RD(r.position),
    o = RD(VD([1, 0, 0], i)),
    s = FD(KD, a),
    c = o;
  if (ID(s, s) > 0.001) {
    let e = ID(s, o) < 0 ? zD(s, -1) : s,
      t = Math.acos(Math.max(-1, Math.min(1, ID(KD, a)))) / Math.PI;
    ((t = Math.abs(t - 0.5) * 2), (t *= t), (c = RD(YD(e, o, t))));
  }
  let l = UD(c, -n * GD),
    u = UD(KD, -t * GD)
      .multiply(l)
      .multiply(i)
      .normalize();
  return { position: VD([0, 0, JD(r)], u), up: RD(VD([0, 1, 0], u)) };
}
function ZD(e) {
  let t = lc(e),
    n = RD(t.position),
    r = RD(FD(t.up, n));
  return HD(r, RD(FD(n, r)), n);
function Jge(e) {
  return e.button === 0 && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
}
function JQ({
  enabled: e = !0,
  historyLabel: t = `Model orbit`,
  hitTest: n,
  target: r,
}) {
  let i = OR(),
    a = J.useRef(null),
    o = J.useRef(0),
    s = J.useCallback(() => {
      let e = a.current;
      if (
        ((o.current = 0),
        !e || (e.pendingDeltaX === 0 && e.pendingDeltaY === 0))
      )
        return;
      let n = e.pendingDeltaX,
        s = e.pendingDeltaY;
      ((e.pendingDeltaX = 0), (e.pendingDeltaY = 0));
      let c = i.getState(),
        l = lc(c.values[r], lc(c.defaults[r]));
      e.interaction.runOwnWrite(() => {
        i.dispatch({
          history: `merge`,
          historyGroup: e.historyGroup,
          label: t,
          target: r,
          type: `controls.setValue`,
          value: XD(l, n, s),
        });
      });
    }, [t, i, r]),
    c = J.useCallback(() => {
      o.current === 0 && (o.current = window.requestAnimationFrame(s));
    }, [s]),
    l = J.useCallback(
      (e) => {
        let t = a.current;
        t &&
          t.pointerId === e.pointerId &&
          (e.preventDefault(),
          e.stopPropagation(),
          window.cancelAnimationFrame(o.current),
          (o.current = 0),
          s(),
          (a.current = null),
          t.interaction.release(),
          qQ(t));
      },
      [s],
    );
  return (
    J.useEffect(
      () => () => {
        (window.cancelAnimationFrame(o.current), (o.current = 0));
        let e = a.current;
        ((a.current = null), e?.interaction.release(), e && qQ(e));
      },
      [e, r],
    ),
    {
      onLostPointerCapture: l,
      onPointerCancel: l,
      onPointerDown: J.useCallback(
        (t) => {
          if (!e || !Jge(t) || !n(t.clientX, t.clientY)) return;
          (window.cancelAnimationFrame(o.current), (o.current = 0));
          let s;
          ((s = KQ({
            onCancel: () => {
              let e = a.current;
              e &&
                e.interaction === s &&
                (window.cancelAnimationFrame(o.current),
                (o.current = 0),
                (a.current = null),
                qQ(e));
            },
            store: i,
            target: r,
          })),
            s &&
              (t.preventDefault(),
              t.stopPropagation(),
              (a.current = {
                element: t.currentTarget,
                historyGroup: QG(`model-orbit`),
                interaction: s,
                lastX: t.clientX,
                lastY: t.clientY,
                pendingDeltaX: 0,
                pendingDeltaY: 0,
                pointerId: t.pointerId,
              }),
              t.currentTarget.setPointerCapture?.(t.pointerId)));
        },
        [e, n, i, r],
      ),
      onPointerMove: J.useCallback(
        (e) => {
          let t = a.current;
          t &&
            t.pointerId === e.pointerId &&
            (e.preventDefault(),
            e.stopPropagation(),
            (t.pendingDeltaX += e.clientX - t.lastX),
            (t.pendingDeltaY += e.clientY - t.lastY),
            (t.lastX = e.clientX),
            (t.lastY = e.clientY),
            c());
        },
        [c],
      ),
      onPointerUp: l,
    }
  );
function GEe(e, t) {
  return ((e % t) + t) % t;
}
function I5({ currentTimeSeconds: e, durationSeconds: t }) {
  return !Number.isFinite(e) || !Number.isFinite(t) || t <= 0 ? 0 : GEe(e, t);
}
function KEe(e) {
  return !Number.isFinite(e.durationSeconds) || e.durationSeconds <= 0
    ? 0
    : I5(e) / e.durationSeconds;
}
function qEe({ currentTimeSeconds: e, durationSeconds: t, key: n }) {
  return n === `ArrowLeft`
