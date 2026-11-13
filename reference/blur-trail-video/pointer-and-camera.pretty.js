  let zn = 0.1,
    Gn = 0,
    $n = 0,
    jn = 0,
    Wn = 0,
    Hn = !0,
    qn = !1,
    Xn = null,
    Yn = !1,
    Kn = null,
    Qn = null;
  const Zn = (e = {}) => {
      "number" == typeof e.smoothing && (zn = e.smoothing),
        window.addEventListener("pointermove", to),
        so(),
        e.debug && io();
    },
    Jn = () => Hn,
    eo = (e) => {
      const { left: t, top: s } = e.getBoundingClientRect();
      return { x: jn - t, y: Wn - s };
    },
    to = (e) => {
      const { clientX: t, clientY: s } = e;
      (Gn = t), ($n = s), Yn || ((jn = Gn), (Wn = $n), (Yn = !0)), (Hn = !0);
    },
    so = () => {
      if (null != Xn) return;
      const e = () => {
        const t = Gn - jn,
          s = $n - Wn;
        (jn += t * zn),
          (Wn += s * zn),
          (Hn = Math.abs(t) > 3 || Math.abs(s) > 3),
          qn && Qn && ((Qn.style.left = `${jn}px`), (Qn.style.top = `${Wn}px`)),
          (Xn = requestAnimationFrame(e));
      };
      Xn = requestAnimationFrame(e);
    },
    Ad,
    Rd = 128,
    Pd = 128,
    Ld = 1;
  const Bd = {
      init: (e, t) => {
        (Ad = e), (Ed = t), Bd.update();
      },
      getCanvas: () => Ad,
      getSize: () => ({ width: Rd, height: Pd }),
      getDimensions: () => ({ width: Rd, height: Pd, pixelRatio: Ld }),
      update: () => {
        const e = Ed.getBoundingClientRect();
        (Rd = e.width),
          (Pd = e.height),
          (Ld = Math.min(2, window.devicePixelRatio));
      },
      getPixelCount: () => Rd * Pd,
    },
    Vd = new Wh(75, 1, 1, 1e4);
  Vd.position.z = 1e3;
  const Fd = () => Vd,
    kd = () => {
      const { width: e, height: t } = Bd.getDimensions();
      var s, i;
      (Vd.aspect = e / t),
        (Vd.fov =
          ((s = t),
          (i = Vd.position.z),
          (2 * Math.atan(s / 2 / i) * 180) / Math.PI)),
        Vd.updateProjectionMatrix();
