// Pinned 2026-11-13 from https://phonestackcarousel.framer.website/
// shared-lib.Bz89GO8f.mjs, prettier 3.3.3, lines 4171-5576 (code component) and 5691-5855 (page instance props).
// Hook aliases: a=useRef, o=useMemo, ee=useEffect, i=window, l/c=jsx/jsxs.
function Ya(e) {
  let t = e?.image,
    n = typeof t == `string` ? t : t?.src,
    r = e?.kind === `video`;
  return {
    img: r ? `` : n || e?.imageUrl || ``,
    vid: (r && (e?.videoUrl || e?.video)) || ``,
    title: e?.title || ``,
    link: e?.link || ``,
  };
}
function Xa(e, t) {
  if (t <= 0) return 0;
  let n = ((e % t) + t) % t;
  return n > t / 2 && (n -= t), n;
}
function Za(e) {
  let t = e.device || {},
    n = e.cards || {},
    r = e.motion || {},
    i = e.surface || {},
    a = e.indicator || {},
    o = Q(t.size ?? 82, 50, 96),
    s = o * 0.488,
    c = s * 0.172,
    l = s * 0.05,
    u = s - l * 2,
    d = o - l * 2,
    f = c - l * 0.9,
    p = s * Q((n.width ?? 80) / 100, 0.4, 1.2),
    ee = o * Q((n.height ?? 80) / 100, 0.4, 1.05),
    m = Q((n.depth ?? 8) / 100, 0, 0.2),
    h = Q((n.overlap ?? 12) / 100, -0.3, 0.6),
    g = p * 0.16,
    te = s / 2 - g + (p * (1 - m)) / 2,
    ne = p * (1 - m * 1.6) * (1 - h),
    _ = a.show ?? !0,
    re = _ ? 2.2 : 0;
  return {
    PH: o,
    PW: s,
    R: c,
    inset: l,
    SW: u,
    SH: d,
    screenR: f,
    keyW: s * 0.013,
    cardW: p,
    cardH: ee,
    shrink: m,
    first: te,
    step: ne,
    lift: re,
    span: Q(Math.round(n.span ?? 3), 1, 6),
    dim: Q((n.dim ?? 45) / 100, 0, 1),
    radius: n.radius ?? 22,
    sideVideo: n.sideVideo ?? `play`,
    edgeFade: n.edgeFade ?? !0,
    newTab: n.newTab ?? !0,
    finish: lo[t.finish] ? t.finish : `obsidian`,
    statusBar: t.statusBar ?? !0,
    clock: t.clock ?? `9:41`,
    homeBar: t.homeBar ?? !0,
    glare: t.glare ?? !0,
    screen: t.screen ?? `#050506`,
    autoplay: r.autoplay ?? !0,
    interval: Q(r.interval ?? 3.2, 1, 20),
    hoverPause: r.hoverPause ?? !0,
    wheel: r.wheel ?? `both`,
    feel: r.feel ?? `silk`,
    lean: Q(r.lean ?? 6, 0, 20),
    intro: r.intro ?? !0,
    wobble: (r.morph ?? `liquid`) === `liquid` ? 0.11 : 0,
    bg: i.background ?? `#08080A`,
    grid: i.grid ?? !0,
    gridColor: i.gridColor ?? `rgba(255,255,255,0.07)`,
    halo: i.halo ?? `rgba(170,180,210,0.14)`,
    showDots: _,
    dotColor: a.color ?? `rgba(255,255,255,0.22)`,
    dotActive: a.active ?? `#FFFFFF`,
  };
}
function Qa(e, t, n) {
  let r = Math.abs(e),
    i = e < 0 ? -1 : 1,
    a = r <= 1 ? r * t.first : t.first + (r - 1) * t.step,
    o = Math.min(t.span + 1, n / 2);
  return {
    x: i * a,
    s: 1 - t.shrink * Math.min(r, 4),
    z: 200 - Math.round(r * 20),
    alpha: Q((o - r) / 0.5, 0, 1),
    shade: t.dim * Math.min(r / t.span, 1),
  };
}
function $a(e, t, n) {
  if (e <= 0) return `polygon(100% 50%, 100% 50%, 100% 50%)`;
  let r = t.SW,
    i = t.SH / 2,
    a = Math.hypot(t.SW, t.SH / 2) * 1.08 * e,
    o = n * Math.sin(Math.PI * e),
    s = e * 2.6,
    c = [];
  for (let e = 0; e < 60; e++) {
    let n = (e / 60) * Math.PI * 2,
      l =
        a *
        (1 + o * (0.6 * Math.sin(3 * n + s) + 0.4 * Math.sin(5 * n - 1.3 * s))),
      u = ((r + l * Math.cos(n)) / t.SW) * 100,
      d = ((i + l * Math.sin(n)) / t.SH) * 100;
    c.push(`${u.toFixed(2)}% ${d.toFixed(2)}%`);
  }
  return `polygon(${c.join(`, `)})`;
}
function eo(e) {
  let t = lo[e.finish],
    n = e.R,
    r = e.PW * 0.021,
    i = e.PW * 0.006,
    a = t.band,
    o = `linear-gradient(90deg, ${t.key[0]}, ${t.key[1]} 45%, ${t.key[2]})`,
    s = e.keyW,
    c = (n, r, i) => ({
      position: `absolute`,
      top: $(e.PH * r),
      height: $(e.PH * i),
      width: $(s),
      [n === `l` ? `left` : `right`]: $(-s * 0.82),
      borderRadius: $(s),
      background: o,
      boxShadow: `inset 0 0 0 ${$(0.08)} rgba(255,255,255,${(t.edge * 0.5).toFixed(2)}), 0 0 ${$(0.3)} rgba(0,0,0,0.5)`,
    }),
    l = (t, n) => ({
      position: `absolute`,
      [t === `l` ? `left` : `right`]: 0,
      top: n,
      width: $(r),
      height: $(e.PW * 0.011),
      background: `rgba(0,0,0,0.38)`,
    });
  return {
    frame: (t = {}) => ({
      position: `absolute`,
      left: `50%`,
      top: `calc(50% - ${$(e.lift)})`,
      width: $(e.PW),
      height: $(e.PH),
      transform: `translate(-50%, -50%)`,
      ...t,
    }),
    keys: [
      c(`l`, 0.19, 0.038),
      c(`l`, 0.262, 0.072),
      c(`l`, 0.352, 0.072),
      c(`r`, 0.29, 0.108),
    ],
    notches: [
      l(`l`, $(n * 0.95)),
      l(`r`, $(n * 0.95)),
      l(`l`, `calc(100% - ${$(n * 0.95)})`),
      l(`r`, `calc(100% - ${$(n * 0.95)})`),
    ],
    cast: {
      position: `absolute`,
      inset: 0,
      borderRadius: $(n),
      boxShadow: `0 ${$(4)} ${$(9)} rgba(0,0,0,0.6), 0 ${$(1.2)} ${$(2.4)} rgba(0,0,0,0.55)`,
      pointerEvents: `none`,
    },
    body: {
      position: `absolute`,
      inset: 0,
      borderRadius: $(n),
      background: `linear-gradient(142deg, ${a[0]} 0%, ${a[1]} 14%, ${a[2]} 34%, ${a[3]} 58%, ${a[4]} 80%, ${a[5]} 100%)`,
      boxShadow: [
        `inset 0 0 0 ${$(0.11)} rgba(255,255,255,${t.edge})`,
        `inset 0 0 ${$(0.5)} ${$(0.18)} rgba(0,0,0,0.45)`,
      ].join(`, `),
    },
    seam: {
      position: `absolute`,
      inset: $(r),
      borderRadius: $(n - r),
      background: t.seam,
      boxShadow: `inset 0 ${$(0.12)} ${$(0.2)} rgba(255,255,255,0.14)`,
    },
    glass: {
      position: `absolute`,
      inset: $(r + i),
      borderRadius: $(n - r - i),
      background: `linear-gradient(180deg, #0a0a0c, #020203)`,
      boxShadow: `inset 0 0 0 ${$(0.1)} rgba(255,255,255,0.06)`,
    },
    screen: {
      position: `absolute`,
      inset: $(e.inset),
      borderRadius: $(e.screenR),
      overflow: `hidden`,
      background: e.screen,
      isolation: `isolate`,
      WebkitMaskImage: `-webkit-radial-gradient(white, black)`,
    },
    island: {
      position: `absolute`,
      left: `50%`,
      top: $(e.PW * 0.034),
      width: $(e.SW * 0.34),
      height: $(e.PW * 0.092),
      transform: `translateX(-50%)`,
      borderRadius: $(e.PW * 0.05),
      background: `#000`,
      zIndex: 6,
    },
    lens: {
      position: `absolute`,
      right: $(e.PW * 0.026),
      top: `50%`,
      width: $(e.PW * 0.042),
      height: $(e.PW * 0.042),
      transform: `translateY(-50%)`,
      borderRadius: `50%`,
      background: `radial-gradient(circle at 38% 34%, rgba(120,150,255,0.55) 0 14%, rgba(30,40,80,0.9) 32%, #07080c 62%)`,
      boxShadow: `0 0 0 ${$(0.12)} rgba(255,255,255,0.05)`,
    },
    status: {
      position: `absolute`,
      left: 0,
      right: 0,
      top: $(e.PW * 0.034),
      height: $(e.PW * 0.092),
      display: `flex`,
      alignItems: `center`,
      justifyContent: `space-between`,
      padding: `0 ${$(e.SW * 0.1)} 0 ${$(e.SW * 0.13)}`,
      color: `#fff`,
      fontFamily: `system-ui, sans-serif`,
      fontWeight: 600,
      fontSize: $(e.PW * 0.05),
      letterSpacing: `0.01em`,
      zIndex: 5,
      pointerEvents: `none`,
    },
    glyphs: {
      width: $(e.SW * 0.22),
      height: $(e.SW * 0.044),
      backgroundImage: uo,
      backgroundSize: `100% 100%`,
      backgroundRepeat: `no-repeat`,
    },
    topShade: {
      position: `absolute`,
      left: 0,
      right: 0,
      top: 0,
      height: `16%`,
      background: `linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0))`,
      zIndex: 4,
      pointerEvents: `none`,
    },
    homeBar: {
      position: `absolute`,
      left: `50%`,
      bottom: $(e.PW * 0.022),
      width: $(e.SW * 0.36),
      height: $(e.PW * 0.013),
      transform: `translateX(-50%)`,
      borderRadius: $(e.PW * 0.01),
      background: `rgba(255,255,255,0.88)`,
      zIndex: 5,
      pointerEvents: `none`,
    },
    glare: {
      position: `absolute`,
      inset: 0,
      background: `linear-gradient(118deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.035) 26%, rgba(255,255,255,0) 44%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 8%)`,
      zIndex: 7,
      pointerEvents: `none`,
    },
    rim: {
      position: `absolute`,
      inset: 0,
      borderRadius: $(n),
      boxShadow: `inset 0 ${$(0.15)} ${$(0.2)} rgba(255,255,255,${(t.edge * 0.8).toFixed(2)}), inset 0 ${$(-0.15)} ${$(0.25)} rgba(0,0,0,0.4)`,
      pointerEvents: `none`,
    },
  };
}
function to(e) {
  return {
    root: {
      position: `relative`,
      width: `100%`,
      height: `100%`,
      overflow: `hidden`,
      background: e.bg,
      containerType: `size`,
    },
    scale: { position: `absolute`, inset: 0, "--u": `min(1cqh, 1.95cqw)` },
    grid: {
      position: `absolute`,
      inset: 0,
      backgroundImage: `radial-gradient(${e.gridColor} 1px, transparent 1.4px)`,
      backgroundSize: `22px 22px`,
      backgroundPosition: `center`,
      pointerEvents: `none`,
    },
    halo: {
      position: `absolute`,
      left: `50%`,
      top: `calc(50% - ${$(e.lift)})`,
      width: $(e.PW * 2.3),
      height: $(e.PH * 0.95),
      transform: `translate(-50%, -50%)`,
      background: `radial-gradient(closest-side, ${e.halo}, rgba(0,0,0,0))`,
      pointerEvents: `none`,
    },
    fade: e.edgeFade
      ? {
          WebkitMaskImage: `linear-gradient(90deg, transparent 0%, #000 11%, #000 89%, transparent 100%)`,
          maskImage: `linear-gradient(90deg, transparent 0%, #000 11%, #000 89%, transparent 100%)`,
        }
      : {},
    card: {
      position: `absolute`,
      left: `50%`,
      top: `calc(50% - ${$(e.lift)})`,
      overflow: `hidden`,
      background: `#121214`,
      boxShadow: `0 ${$(2)} ${$(5)} rgba(0,0,0,0.5)`,
    },
    cardEdge: {
      position: `absolute`,
      inset: 0,
      borderRadius: `inherit`,
      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06)`,
      pointerEvents: `none`,
    },
    dots: {
      position: `absolute`,
      left: `50%`,
      top: `calc(50% - ${$(e.lift)} + ${$(e.PH / 2 + 2.6)})`,
      transform: `translate(-50%, -50%)`,
      display: `flex`,
      alignItems: `center`,
      gap: $(0.8),
      zIndex: 600,
    },
    dot: { height: $(0.75), width: $(0.75), borderRadius: $(1) },
    media: {
      position: `absolute`,
      inset: 0,
      width: `100%`,
      height: `100%`,
      objectFit: `cover`,
      display: `block`,
      pointerEvents: `none`,
    },
  };
}
function no(e) {
  return oe() ? /*#__PURE__*/ l(ro, { ...e }) : /*#__PURE__*/ l(io, { ...e });
}
function ro(e) {
  let t = Za(e),
    n = (e.items && e.items.length ? e.items : oo).map(Ya),
    r = n.length,
    i = r ? ((Math.round(e.start ?? 0) % r) + r) % r : 0,
    a = eo(t),
    o = to(t),
    s = n[i];
  return /*#__PURE__*/ l(`div`, {
    style: o.root,
    children: /*#__PURE__*/ c(`div`, {
      style: o.scale,
      children: [
        t.grid && /*#__PURE__*/ l(`div`, { style: o.grid }),
        /*#__PURE__*/ l(`div`, { style: o.halo }),
        /*#__PURE__*/ l(`div`, {
          style: { position: `absolute`, inset: 0, ...o.fade },
          children: n.map((e, n) => {
            let a = Xa(n - i, r);
            if (Math.abs(a) < 0.5) return null;
            let s = Qa(a, t, r);
            return s.alpha <= 0.001
              ? null
              : /*#__PURE__*/ c(
                  `div`,
                  {
                    style: {
                      ...o.card,
                      width: $(t.cardW),
                      height: $(t.cardH),
                      borderRadius: t.radius,
                      zIndex: s.z,
                      opacity: s.alpha,
                      transform: `translate(-50%, -50%) translateX(${$(s.x)}) scale(${s.s})`,
                    },
                    children: [
                      e.vid
                        ? /*#__PURE__*/ l(`video`, {
                            src: `${e.vid}#t=0.1`,
                            muted: !0,
                            playsInline: !0,
                            preload: `metadata`,
                            autoPlay: !1,
                            style: o.media,
                          })
                        : e.img
                          ? /*#__PURE__*/ l(`img`, {
                              src: e.img,
                              alt: e.title,
                              style: o.media,
                            })
                          : null,
                      /*#__PURE__*/ l(`div`, {
                        style: {
                          position: `absolute`,
                          inset: 0,
                          background: `#000`,
                          opacity: s.shade,
                        },
                      }),
                      /*#__PURE__*/ l(`div`, { style: o.cardEdge }),
                    ],
                  },
                  n,
                );
          }),
        }),
        /*#__PURE__*/ c(`div`, {
          style: a.frame({ zIndex: 400 }),
          children: [
            /*#__PURE__*/ l(`div`, { style: a.cast }),
            a.keys.map((e, t) => /*#__PURE__*/ l(`div`, { style: e }, t)),
            /*#__PURE__*/ l(`div`, {
              style: a.body,
              children: a.notches.map((e, t) =>
                /*#__PURE__*/ l(`div`, { style: e }, t),
              ),
            }),
            /*#__PURE__*/ l(`div`, { style: a.seam }),
            /*#__PURE__*/ l(`div`, { style: a.glass }),
            /*#__PURE__*/ c(`div`, {
              style: a.screen,
              children: [
                s && s.vid
                  ? /*#__PURE__*/ l(`video`, {
                      src: `${s.vid}#t=0.1`,
                      muted: !0,
                      playsInline: !0,
                      preload: `metadata`,
                      autoPlay: !1,
                      style: o.media,
                    })
                  : s && s.img
                    ? /*#__PURE__*/ l(`img`, {
                        src: s.img,
                        alt: s.title,
                        style: o.media,
                      })
                    : null,
                t.statusBar && /*#__PURE__*/ l(`div`, { style: a.topShade }),
                t.statusBar &&
                  /*#__PURE__*/ c(`div`, {
                    style: a.status,
                    children: [
                      /*#__PURE__*/ l(`span`, { children: t.clock }),
                      /*#__PURE__*/ l(`span`, { style: a.glyphs }),
                    ],
                  }),
                /*#__PURE__*/ l(`div`, {
                  style: a.island,
                  children: /*#__PURE__*/ l(`div`, { style: a.lens }),
                }),
                t.homeBar && /*#__PURE__*/ l(`div`, { style: a.homeBar }),
                t.glare && /*#__PURE__*/ l(`div`, { style: a.glare }),
              ],
            }),
            /*#__PURE__*/ l(`div`, { style: a.rim }),
          ],
        }),
        t.showDots &&
          r > 1 &&
          /*#__PURE__*/ l(`div`, {
            style: o.dots,
            children: n.map((e, n) =>
              /*#__PURE__*/ l(
                `div`,
                {
                  style: {
                    ...o.dot,
                    width: $(n === i ? 2.6 : 0.75),
                    background: n === i ? t.dotActive : t.dotColor,
                  },
                },
                n,
              ),
            ),
          }),
      ],
    }),
  });
}
function io(e) {
  let t = Za(e),
    n = e.items && e.items.length ? e.items : oo,
    r = o(() => n.map(Ya), [n]),
    s = r.length,
    u = eo(t),
    d = to(t),
    f = a({ c: t, n: s, list: r });
  f.current = { c: t, n: s, list: r };
  let p = a(null),
    m = a([]),
    h = a([]),
    g = a([]),
    te = a([]),
    ne = a([]),
    _ = a([]),
    re = a([]),
    ie = a([]),
    ae = Math.round(e.start ?? 0),
    v = a({
      pos: ae,
      vel: 0,
      goal: ae,
      raf: 0,
      last: 0,
      permit: !1,
      calm: !1,
      hover: !1,
      intro: t.intro ? -2 : -1,
      shown: -999,
      wheelT: 0,
      autoT: 0,
      grab: null,
    }).current,
    oe = (e, t) =>
      v.intro === -1
        ? 1
        : v.intro === -2
          ? 0
          : so(Q((e - v.intro - t * 85) / 1050, 0, 1)),
    se = (e) => {
      let { c: t, n } = f.current;
      if (!n) return;
      let r = v.calm ? 0 : Q(-v.vel * 2.4, -t.lean, t.lean);
      for (let i = 0; i < n; i++) {
        let a = m.current[i];
        if (!a) continue;
        let o = Xa(i - v.pos, n),
          s = Math.abs(o),
          c = Qa(o, t, n);
        if (c.alpha <= 0.001 || s < 0.02) {
          a.style.visibility = `hidden`;
          continue;
        }
        let l = oe(e, s);
        (a.style.visibility = `visible`),
          (a.style.zIndex = String(c.z)),
          (a.style.opacity = String(c.alpha)),
          (a.style.transform = `translate3d(-50%, -50%, 0) translate3d(${$(c.x * l)}, 0, 0) rotateY(${r.toFixed(3)}deg) scale(${(c.s * (0.92 + 0.08 * l)).toFixed(4)})`);
        let u = h.current[i];
        u && (u.style.opacity = c.shade.toFixed(3));
      }
      let i = Math.floor(v.pos),
        a = v.pos - i,
        o = ((i % n) + n) % n,
        s = (o + 1) % n,
        c = co(Q(a, 0, 1));
      for (let e = 0; e < n; e++) {
        let n = te.current[e];
        if (!n) continue;
        let r = ne.current[e],
          i = _.current[e];
        if (e === s && s !== o && c > 5e-4) {
          (n.style.visibility = `visible`), (n.style.zIndex = `2`);
          let e = $a(c, t, t.wobble);
          (n.style.clipPath = e),
            (n.style.webkitClipPath = e),
            r && (r.style.transform = `scale(${(1.22 - 0.22 * c).toFixed(4)})`),
            i && (i.style.opacity = ((1 - c) * 0.35).toFixed(3));
        } else
          e === o
            ? ((n.style.visibility = `visible`),
              (n.style.zIndex = `1`),
              (n.style.clipPath = `none`),
              (n.style.webkitClipPath = `none`),
              r && (r.style.transform = `scale(${(1 - 0.07 * c).toFixed(4)})`),
              i && (i.style.opacity = (c * 0.6).toFixed(3)))
            : (n.style.visibility = `hidden`);
      }
      for (let e = 0; e < n; e++) {
        let r = ie.current[e];
        if (!r) continue;
        let i = Math.max(0, 1 - Math.abs(Xa(e - v.pos, n)));
        (r.style.width = $(0.75 + 1.85 * i)),
          (r.style.background = i > 0.5 ? t.dotActive : t.dotColor),
          (r.style.opacity = String(0.65 + 0.35 * i));
      }
    },
    ce = () => {
      let { c: e, n: t } = f.current;
      for (let n = 0; n < t; n++) {
        let r = Math.abs(Xa(n - v.goal, t)),
          i = re.current[n];
        i && (v.permit && r < 0.5 ? i.play().catch(() => {}) : i.pause());
        let a = g.current[n];
        a &&
          (v.permit && r >= 0.5 && r <= e.span + 0.5
            ? a.play().catch(() => {})
            : a.pause());
      }
    },
    le = () => {
      let { n: e } = f.current,
        t = e ? ((Math.round(v.goal) % e) + e) % e : 0;
      t !== v.shown && ((v.shown = t), ce());
    },
    ue = () => {
      clearTimeout(v.autoT), (v.autoT = 0);
      let { c: e, n: t } = f.current;
      !e.autoplay ||
        !v.permit ||
        v.calm ||
        v.grab ||
        t < 2 ||
        (e.hoverPause && v.hover) ||
        (v.autoT = setTimeout(() => {
          (v.autoT = 0),
            !(!v.permit || v.grab || (f.current.c.hoverPause && v.hover)) &&
              ((v.goal = Math.round(v.goal) + 1), fe());
        }, e.interval * 1e3));
    },
    de = (e) => {
      if (((v.raf = 0), !v.permit)) return;
      let { c: t, n } = f.current,
        r = v.last ? Math.min((e - v.last) / 1e3, 1 / 30) : 1 / 60;
      (v.last = e), v.intro === -2 && (v.intro = e);
      let i = !1;
      if (v.grab) i = !0;
      else if (v.calm) (v.pos = v.goal), (v.vel = 0);
      else {
        let e = fo[t.feel] || fo.silk,
          a = 2 * e.z * Math.sqrt(e.k),
          o = r / 3;
        for (let t = 0; t < 3; t++) {
          let t = -e.k * (v.pos - v.goal) - a * v.vel;
          (v.vel += t * o), (v.pos += v.vel * o);
        }
        if (Math.abs(v.pos - v.goal) < 4e-4 && Math.abs(v.vel) < 0.002) {
          if (((v.pos = v.goal), (v.vel = 0), n > 0)) {
            let e = Math.floor(v.pos / n) * n;
            (v.pos -= e), (v.goal -= e);
          }
        } else i = !0;
      }
      v.intro >= 0 &&
        (e - v.intro < 1050 + (t.span + 1) * 85 ? (i = !0) : (v.intro = -1)),
        se(e),
        le(),
        i ? (v.raf = requestAnimationFrame(de)) : ((v.last = 0), ue());
    },
    fe = () => {
      v.permit &&
        !v.raf &&
        (clearTimeout(v.autoT),
        (v.autoT = 0),
        (v.raf = requestAnimationFrame(de)));
    },
    pe = () => {
      cancelAnimationFrame(v.raf),
        (v.raf = 0),
        (v.last = 0),
        clearTimeout(v.autoT),
        clearTimeout(v.wheelT),
        (v.autoT = 0),
        (v.wheelT = 0),
        (v.grab = null),
        (v.vel = 0),
        (v.goal = Math.round(v.goal)),
        (v.pos = v.goal),
        v.intro >= 0 && (v.intro = -1),
        se(performance.now());
      for (let e of re.current) e && e.pause();
      for (let e of g.current) e && e.pause();
    };
  ee(() => {
    let e = p.current;
    if (!e) return;
    let t = typeof IntersectionObserver < `u`,
      n = !t,
      r = document.visibilityState !== `hidden`,
      a =
        typeof i.matchMedia == `function`
          ? i.matchMedia(`(prefers-reduced-motion: reduce)`)
          : null;
    v.calm = !!a?.matches;
    let o = () => {
        let e = n && r;
        e !== v.permit &&
          ((v.permit = e),
          e
            ? (v.intro === -2 &&
                (v.calm || !f.current.c.intro) &&
                (v.intro = -1),
              ce(),
              fe())
            : pe());
      },
      s = t
        ? new IntersectionObserver(
            (e) => {
              (n = e.some((e) => e.isIntersecting)), o();
            },
            { threshold: 0.01 },
          )
        : null;
    s?.observe(e);
    let c = () => {
        (r = document.visibilityState !== `hidden`), o();
      },
      l = () => {
        (v.calm = !!a?.matches),
          v.calm && ((v.intro = -1), clearTimeout(v.autoT), (v.autoT = 0)),
          fe(),
          v.raf || ue();
      };
    return (
      document.addEventListener(`visibilitychange`, c),
      a?.addEventListener?.(`change`, l),
      o(),
      () => {
        s?.disconnect(),
          document.removeEventListener(`visibilitychange`, c),
          a?.removeEventListener?.(`change`, l),
          (v.permit = !1),
          pe();
      }
    );
  }, []),
    ee(() => {
      let e = p.current;
      if (!e) return;
      let t = (e) => {
        let { c: t } = f.current;
        if (t.wheel === `off` || !v.permit) return;
        let n = 0;
        if (
          (Math.abs(e.deltaX) > Math.abs(e.deltaY)
            ? (n = e.deltaX)
            : t.wheel === `both` && (n = e.deltaY),
          !n)
        )
          return;
        e.preventDefault();
        let r = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 420 : 1,
          i = Math.round(v.pos);
        (v.goal = Q(v.goal + (n * r) / 360, i - 3, i + 3)),
          clearTimeout(v.wheelT),
          (v.wheelT = setTimeout(() => {
            (v.wheelT = 0), (v.goal = Math.round(v.goal)), fe();
          }, 150)),
          fe();
      };
      return (
        e.addEventListener(`wheel`, t, { passive: !1 }),
        () => e.removeEventListener(`wheel`, t)
      );
    }, []),
    ee(() => {
      se(performance.now()), (v.shown = -999), le();
    });
  let y = (e) => {
      if (e.button !== 0 || !v.permit) return;
      let t = f.current.c,
        n = e.target,
        r = n.closest?.(`[data-slot]`),
        i = p.current?.getBoundingClientRect(),
        a = i ? Math.min(i.height * 0.01, i.width * 0.0195) : 7;
      (v.grab = {
        id: e.pointerId,
        x: e.clientX,
        t: performance.now(),
        v: 0,
        moved: 0,
        per: Math.max(40, t.first * a),
        hit: r ? Number(r.dataset.slot) : -1,
        onScreen: !!n.closest?.(`[data-pane]`),
      }),
        (v.vel = 0),
        clearTimeout(v.wheelT),
        (v.wheelT = 0);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      p.current && (p.current.style.cursor = `grabbing`), fe();
    },
    me = (e) => {
      let t = v.grab;
      if (!t || t.id !== e.pointerId) return;
      let n = performance.now(),
        r = e.clientX - t.x,
        i = -r / t.per;
      (v.pos += i), (v.goal = v.pos);
      let a = Math.max((n - t.t) / 1e3, 0.001);
      (t.v = t.v * 0.65 + (i / a) * 0.35),
        (t.moved += Math.abs(r)),
        (t.x = e.clientX),
        (t.t = n),
        (v.vel = t.v);
    },
    he = (e, t) => {
      let n = v.grab;
      if (!n || n.id !== e.pointerId) return;
      (v.grab = null), p.current && (p.current.style.cursor = `grab`);
      let { c: r, n: a, list: o } = f.current,
        s = Math.round(v.pos);
      if (!t && n.moved < 6) {
        if (((v.vel = 0), (v.goal = s), n.onScreen && a)) {
          let e = o[((s % a) + a) % a];
          e &&
            e.link &&
            i.open(e.link, r.newTab ? `_blank` : `_self`, `noopener`);
        } else n.hit >= 0 && a && (v.goal = s + Xa(n.hit - s, a));
      } else {
        let e = performance.now() - n.t > 90 ? 0 : Q(n.v, -14, 14);
        (v.vel = e), (v.goal = Q(Math.round(v.pos + e * 0.24), s - 4, s + 4));
      }
      fe();
    },
    b = (e) => {
      (e.key === `ArrowRight` || e.key === `ArrowLeft`) &&
        (e.preventDefault(),
        (v.goal = Math.round(v.goal) + (e.key === `ArrowRight` ? 1 : -1)),
        fe());
    },
    ge = () => {
      (v.hover = !0), clearTimeout(v.autoT), (v.autoT = 0);
    },
    x = () => {
      (v.hover = !1), v.raf || ue();
    },
    _e = ((ae % (s || 1)) + (s || 1)) % (s || 1);
  return /*#__PURE__*/ l(`div`, {
    ref: p,
    tabIndex: 0,
    role: `region`,
    "aria-roledescription": `carousel`,
    "aria-label": `Media carousel`,
    onPointerDown: y,
    onPointerMove: me,
    onPointerUp: (e) => he(e, !1),
    onPointerCancel: (e) => he(e, !0),
    onPointerEnter: ge,
    onPointerLeave: x,
    onKeyDown: b,
    style: {
      ...d.root,
      cursor: `grab`,
      touchAction: `pan-y`,
      userSelect: `none`,
      outline: `none`,
    },
    children: /*#__PURE__*/ c(`div`, {
      style: d.scale,
      children: [
        t.grid && /*#__PURE__*/ l(`div`, { style: d.grid }),
        /*#__PURE__*/ l(`div`, { style: d.halo }),
        /*#__PURE__*/ l(`div`, {
          style: {
            position: `absolute`,
            inset: 0,
            perspective: $(220),
            ...d.fade,
          },
          children: r.map((e, n) =>
            /*#__PURE__*/ c(
              `div`,
              {
                "data-slot": n,
                ref: (e) => (m.current[n] = e),
                style: {
                  ...d.card,
                  width: $(t.cardW),
                  height: $(t.cardH),
                  borderRadius: t.radius,
                  visibility: `hidden`,
                  willChange: `transform, opacity`,
                },
                children: [
                  e.vid && t.sideVideo === `play`
                    ? /*#__PURE__*/ l(`video`, {
                        ref: (e) => (g.current[n] = e),
                        src: e.vid,
                        poster: e.img || void 0,
                        muted: !0,
                        loop: !0,
                        playsInline: !0,
                        preload: `metadata`,
                        style: d.media,
                      })
                    : e.img
                      ? /*#__PURE__*/ l(`img`, {
                          src: e.img,
                          alt: e.title,
                          draggable: !1,
                          style: d.media,
                        })
                      : null,
                  /*#__PURE__*/ l(`div`, {
                    ref: (e) => (h.current[n] = e),
                    style: {
                      position: `absolute`,
                      inset: 0,
                      background: `#000`,
                      opacity: 0,
                    },
                  }),
                  /*#__PURE__*/ l(`div`, { style: d.cardEdge }),
                ],
              },
              n,
            ),
          ),
        }),
        /*#__PURE__*/ c(`div`, {
          style: u.frame({ zIndex: 400 }),
          children: [
            /*#__PURE__*/ l(`div`, { style: u.cast }),
            u.keys.map((e, t) => /*#__PURE__*/ l(`div`, { style: e }, t)),
            /*#__PURE__*/ l(`div`, {
              style: u.body,
              children: u.notches.map((e, t) =>
                /*#__PURE__*/ l(`div`, { style: e }, t),
              ),
            }),
            /*#__PURE__*/ l(`div`, { style: u.seam }),
            /*#__PURE__*/ l(`div`, { style: u.glass }),
            /*#__PURE__*/ c(`div`, {
              "data-pane": ``,
              style: u.screen,
              children: [
                r.map((e, t) =>
                  /*#__PURE__*/ c(
                    `div`,
                    {
                      ref: (e) => (te.current[t] = e),
                      style: {
                        position: `absolute`,
                        inset: 0,
                        overflow: `hidden`,
                        visibility: t === _e ? `visible` : `hidden`,
                        willChange: `clip-path`,
                      },
                      children: [
                        /*#__PURE__*/ l(`div`, {
                          ref: (e) => (ne.current[t] = e),
                          style: {
                            position: `absolute`,
                            inset: 0,
                            willChange: `transform`,
                          },
                          children: e.vid
                            ? /*#__PURE__*/ l(`video`, {
                                ref: (e) => (re.current[t] = e),
                                src: e.vid,
                                poster: e.img || void 0,
                                muted: !0,
                                loop: !0,
                                playsInline: !0,
                                preload: `metadata`,
                                style: d.media,
                              })
                            : e.img
                              ? /*#__PURE__*/ l(`img`, {
                                  src: e.img,
                                  alt: e.title,
                                  draggable: !1,
                                  style: d.media,
                                })
                              : null,
                        }),
                        /*#__PURE__*/ l(`div`, {
                          ref: (e) => (_.current[t] = e),
                          style: {
                            position: `absolute`,
                            inset: 0,
                            background: `#000`,
                            opacity: 0,
                            pointerEvents: `none`,
                          },
                        }),
                      ],
                    },
                    t,
                  ),
                ),
                t.statusBar && /*#__PURE__*/ l(`div`, { style: u.topShade }),
                t.statusBar &&
                  /*#__PURE__*/ c(`div`, {
                    style: u.status,
                    children: [
                      /*#__PURE__*/ l(`span`, { children: t.clock }),
                      /*#__PURE__*/ l(`span`, { style: u.glyphs }),
                    ],
                  }),
                /*#__PURE__*/ l(`div`, {
                  style: u.island,
                  children: /*#__PURE__*/ l(`div`, { style: u.lens }),
                }),
                t.homeBar && /*#__PURE__*/ l(`div`, { style: u.homeBar }),
                t.glare && /*#__PURE__*/ l(`div`, { style: u.glare }),
              ],
            }),
            /*#__PURE__*/ l(`div`, { style: u.rim }),
          ],
        }),
        t.showDots &&
          s > 1 &&
          /*#__PURE__*/ l(`div`, {
            style: d.dots,
            children: r.map((e, n) =>
              /*#__PURE__*/ l(
                `div`,
                {
                  ref: (e) => (ie.current[n] = e),
                  style: { ...d.dot, background: t.dotColor },
                },
                n,
              ),
            ),
          }),
      ],
    }),
  });
}
var ao, oo, Q, so, co, $, lo, uo, fo;
function po() {
  return (po = e(() => {
    r(),
      d(),
      f(),
      _(),
      (ao = (e) =>
        `https://images.unsplash.com/photo-${e}?auto=format&fit=crop&w=900&q=80`),
      (oo = [
        {
          kind: `image`,
          imageUrl: ao(`1618005182384-a83a8bd57fbe`),
          title: `Chrome Study`,
        },
        {
          kind: `image`,
          imageUrl: ao(`1620641788421-7a1c342ea42e`),
          title: `Soft Ritual`,
        },
        {
          kind: `image`,
          imageUrl: ao(`1634017839464-5c339ebe3cb4`),
          title: `Glass Edge`,
        },
        {
          kind: `image`,
          imageUrl: ao(`1614850523459-c2f4c699c52e`),
          title: `Lattice`,
        },
        {
          kind: `image`,
          imageUrl: ao(`1604871000636-074fa5117945`),
          title: `Plume`,
        },
        {
          kind: `image`,
          imageUrl: ao(`1550684376-efcbd6e3f031`),
          title: `Quiet Form`,
        },
        {
          kind: `image`,
          imageUrl: ao(`1557672172-298e090bd0f1`),
          title: `Night Grain`,
        },
      ]),
      (Q = (e, t, n) => Math.min(n, Math.max(t, e))),
      (so = (e) => 1 - (1 - e) ** 4),
      (co = (e) => 0.5 - 0.5 * Math.cos(Math.PI * e)),
      ($ = (e) => `calc(var(--u) * ${e.toFixed(4)})`),
      (lo = {
        obsidian: {
          band: [
            `#0c0c0e`,
            `#3c3d42`,
            `#17171a`,
            `#2d2e32`,
            `#121214`,
            `#060607`,
          ],
          key: [`#141416`, `#3a3b40`, `#1a1a1d`],
          seam: `#050506`,
          edge: 0.22,
        },
        graphite: {
          band: [
            `#1d1e21`,
            `#6e7075`,
            `#38393d`,
            `#5a5c61`,
            `#2c2d30`,
            `#121315`,
          ],
          key: [`#2a2b2e`, `#6a6c71`, `#323337`],
          seam: `#0b0b0c`,
          edge: 0.32,
        },
        ink: {
          band: [
            `#0f131c`,
            `#4a5568`,
            `#1d2331`,
            `#3a4459`,
            `#171c28`,
            `#080a0f`,
          ],
          key: [`#181d29`, `#465067`, `#20263a`],
          seam: `#05070a`,
          edge: 0.26,
        },
        silver: {
          band: [
            `#7f8186`,
            `#f3f4f6`,
            `#b4b6ba`,
            `#e6e7ea`,
            `#9c9ea2`,
            `#5d5f63`,
          ],
          key: [`#8e9094`, `#eceef0`, `#a5a7ab`],
          seam: `#1c1d1f`,
          edge: 0.45,
        },
      }),
      (uo = `url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2070%2014'%3E%3Cg%20fill%3D'white'%3E%3Crect%20x%3D'0'%20y%3D'8'%20width%3D'3.2'%20height%3D'4'%20rx%3D'0.8'%2F%3E%3Crect%20x%3D'4.8'%20y%3D'5.8'%20width%3D'3.2'%20height%3D'6.2'%20rx%3D'0.8'%2F%3E%3Crect%20x%3D'9.6'%20y%3D'3.4'%20width%3D'3.2'%20height%3D'8.6'%20rx%3D'0.8'%2F%3E%3Crect%20x%3D'14.4'%20y%3D'1'%20width%3D'3.2'%20height%3D'11'%20rx%3D'0.8'%2F%3E%3Ccircle%20cx%3D'30'%20cy%3D'10.9'%20r%3D'1.45'%2F%3E%3C%2Fg%3E%3Cg%20fill%3D'none'%20stroke%3D'white'%20stroke-width%3D'1.8'%20stroke-linecap%3D'round'%3E%3Cpath%20d%3D'M26.9%207.9%20A4.4%204.4%200%200%201%2033.1%207.9'%2F%3E%3Cpath%20d%3D'M24.2%205.2%20A8.2%208.2%200%200%201%2035.8%205.2'%2F%3E%3C%2Fg%3E%3Crect%20x%3D'44.5'%20y%3D'1.5'%20width%3D'21'%20height%3D'11'%20rx%3D'3.4'%20fill%3D'none'%20stroke%3D'white'%20stroke-opacity%3D'0.45'%2F%3E%3Crect%20x%3D'46.5'%20y%3D'3.5'%20width%3D'14.5'%20height%3D'7'%20rx%3D'1.8'%20fill%3D'white'%2F%3E%3Crect%20x%3D'66.6'%20y%3D'5'%20width%3D'1.7'%20height%3D'4'%20rx%3D'0.85'%20fill%3D'white'%20fill-opacity%3D'0.45'%2F%3E%3C%2Fsvg%3E")`),
      (fo = {
        silk: { k: 110, z: 1 },
        brisk: { k: 260, z: 0.94 },
        drift: { k: 60, z: 0.8 },
      }),
      pe(no, {
        items: {
          type: y.Array,
          title: `Slides`,
          maxCount: 24,
          defaultValue: oo,
          control: {
            type: y.Object,
            controls: {
              kind: {
                type: y.Enum,
                title: `Media`,
                options: [`image`, `video`],
                optionTitles: [`Image`, `Video`],
                displaySegmentedControl: !0,
                defaultValue: `image`,
              },
              image: {
                type: y.ResponsiveImage,
                title: `Image`,
                hidden: (e) => e.kind === `video`,
              },
              imageUrl: {
                type: y.String,
                title: `Image URL`,
                placeholder: `https://…`,
                hidden: (e) => e.kind === `video`,
              },
              video: {
                type: y.File,
                title: `Video`,
                allowedFileTypes: [`mp4`, `webm`, `mov`],
                hidden: (e) => e.kind !== `video`,
              },
              videoUrl: {
                type: y.String,
                title: `Video URL`,
                placeholder: `https://….mp4`,
                hidden: (e) => e.kind !== `video`,
              },
              title: { type: y.String, title: `Alt Text`, defaultValue: `` },
              link: { type: y.Link, title: `Link` },
            },
          },
        },
        start: {
          type: y.Number,
          title: `Start At`,
          defaultValue: 0,
          min: 0,
          max: 23,
          step: 1,
          displayStepper: !0,
        },
        device: {
          type: y.Object,
          title: `Device`,
          controls: {
            size: {
              type: y.Number,
              title: `Height`,
              defaultValue: 82,
              min: 50,
              max: 96,
              unit: `%`,
            },
            finish: {
              type: y.Enum,
              title: `Finish`,
              options: [`obsidian`, `graphite`, `ink`, `silver`],
              optionTitles: [`Obsidian`, `Graphite`, `Ink`, `Silver`],
              defaultValue: `obsidian`,
            },
            screen: { type: y.Color, title: `Screen`, defaultValue: `#050506` },
            statusBar: {
              type: y.Boolean,
              title: `Status Bar`,
              defaultValue: !0,
            },
            clock: {
              type: y.String,
              title: `Clock`,
              defaultValue: `9:41`,
              hidden: (e) => e.statusBar === !1,
            },
            homeBar: { type: y.Boolean, title: `Home Bar`, defaultValue: !0 },
            glare: { type: y.Boolean, title: `Glass Glare`, defaultValue: !0 },
          },
        },
        cards: {
          type: y.Object,
          title: `Side Cards`,
          controls: {
            width: {
              type: y.Number,
              title: `Width`,
              defaultValue: 80,
              min: 40,
              max: 120,
              unit: `%`,
            },
            height: {
              type: y.Number,
              title: `Height`,
              defaultValue: 80,
              min: 40,
              max: 105,
              unit: `%`,
            },
            radius: {
              type: y.Number,
              title: `Radius`,
              defaultValue: 22,
              min: 0,
              max: 60,
            },
            overlap: {
              type: y.Number,
              title: `Overlap`,
              defaultValue: 12,
              min: -30,
              max: 60,
              unit: `%`,
            },
            depth: {
              type: y.Number,
              title: `Depth Shrink`,
              defaultValue: 8,
              min: 0,
              max: 20,
              unit: `%`,
            },
            dim: {
              type: y.Number,
              title: `Dim`,
              defaultValue: 45,
              min: 0,
              max: 100,
              unit: `%`,
            },
            span: {
              type: y.Number,
              title: `Per Side`,
              defaultValue: 3,
              min: 1,
              max: 6,
              step: 1,
              displayStepper: !0,
            },
            sideVideo: {
              type: y.Enum,
              title: `Side Video`,
              options: [`play`, `poster`],
              optionTitles: [`Play`, `Paused`],
              displaySegmentedControl: !0,
              defaultValue: `play`,
            },
            edgeFade: { type: y.Boolean, title: `Edge Fade`, defaultValue: !0 },
            newTab: {
              type: y.Boolean,
              title: `Links New Tab`,
              defaultValue: !0,
            },
          },
        },
        motion: {
          type: y.Object,
          title: `Motion`,
          controls: {
            autoplay: { type: y.Boolean, title: `Autoplay`, defaultValue: !0 },
            interval: {
              type: y.Number,
              title: `Interval`,
              defaultValue: 3.2,
              min: 1,
              max: 20,
              step: 0.1,
              unit: `s`,
              hidden: (e) => e.autoplay === !1,
            },
            hoverPause: {
              type: y.Boolean,
              title: `Hover Pause`,
              defaultValue: !0,
              hidden: (e) => e.autoplay === !1,
            },
            wheel: {
              type: y.Enum,
              title: `Wheel`,
              options: [`both`, `horizontal`, `off`],
              optionTitles: [`Both Axes`, `Horizontal`, `Off`],
              defaultValue: `both`,
            },
            feel: {
              type: y.Enum,
              title: `Feel`,
              options: [`silk`, `brisk`, `drift`],
              optionTitles: [`Silk`, `Brisk`, `Drift`],
              displaySegmentedControl: !0,
              defaultValue: `silk`,
            },
            morph: {
              type: y.Enum,
              title: `Screen Morph`,
              options: [`liquid`, `iris`],
              optionTitles: [`Liquid`, `Iris`],
              displaySegmentedControl: !0,
              defaultValue: `liquid`,
            },
            lean: {
              type: y.Number,
              title: `Lean`,
              defaultValue: 6,
              min: 0,
              max: 20,
              unit: `°`,
            },
            intro: { type: y.Boolean, title: `Intro`, defaultValue: !0 },
          },
        },
        surface: {
          type: y.Object,
          title: `Backdrop`,
          controls: {
            background: {
              type: y.Color,
              title: `Fill`,
              defaultValue: `#08080A`,
            },
            grid: { type: y.Boolean, title: `Dot Grid`, defaultValue: !0 },
            gridColor: {
              type: y.Color,
              title: `Grid Color`,
              defaultValue: `rgba(255,255,255,0.07)`,
              hidden: (e) => e.grid === !1,
            },
            halo: {
              type: y.Color,
              title: `Halo`,
              defaultValue: `rgba(170,180,210,0.14)`,
            },
          },
        },
        indicator: {
          type: y.Object,
          title: `Indicator`,
          controls: {
            show: { type: y.Boolean, title: `Show`, defaultValue: !0 },
            color: {
              type: y.Color,
              title: `Dot`,
              defaultValue: `rgba(255,255,255,0.22)`,
            },
            active: { type: y.Color, title: `Active`, defaultValue: `#FFFFFF` },
          },
        },
      });
  }))();
}

// ---- page instance ----
                        children: /*#__PURE__*/ l(no, {
                          cards: {
                            depth: 8,
                            dim: 45,
                            edgeFade: !0,
                            height: 80,
                            newTab: !0,
                            overlap: 12,
                            radius: 22,
                            sideVideo: `play`,
                            span: 3,
                            width: 80,
                          },
                          device: {
                            clock: `9:41`,
                            finish: `ink`,
                            glare: !0,
                            homeBar: !0,
                            screen: `rgb(5, 5, 6)`,
                            size: 82,
                            statusBar: !1,
                          },
                          height: `100%`,
                          id: `wn_roz5NN`,
                          indicator: {
                            active: `rgb(255, 255, 255)`,
                            color: `rgba(255, 255, 255, 0.22)`,
                            show: !1,
                          },
                          items: [
                            {
                              id: `default-item-0`,
                              image: Eo(
                                {
                                  pixelHeight: 958,
                                  pixelWidth: 736,
                                  src: `https://framerusercontent.com/images/hKcEsn0JC6BzFmP1LFaJXM9OQnI.jpg?width=736&height=958`,
                                  srcSet: `https://framerusercontent.com/images/hKcEsn0JC6BzFmP1LFaJXM9OQnI.jpg?width=736&height=958 736w`,
                                },
                                ``,
                              ),
                              imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80`,
                              kind: `image`,
                              title: `Chrome Study`,
                              videoUrl: ``,
                            },
                            {
                              id: `default-item-1`,
                              image: Eo(
                                {
                                  pixelHeight: 1200,
                                  pixelWidth: 800,
                                  src: `https://framerusercontent.com/images/KbhZ8TSifLt6oom0DJy3I6dtRk.png?width=800&height=1200`,
                                  srcSet: `https://framerusercontent.com/images/KbhZ8TSifLt6oom0DJy3I6dtRk.png?scale-down-to=1024&width=800&height=1200 682w,https://framerusercontent.com/images/KbhZ8TSifLt6oom0DJy3I6dtRk.png?width=800&height=1200 800w`,
                                },
                                ``,
                              ),
                              imageUrl: `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=900&q=80`,
                              kind: `image`,
                              title: `Soft Ritual`,
                              videoUrl: ``,
                            },
                            {
                              id: `default-item-3`,
                              imageUrl: `https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=900&q=80`,
                              kind: `video`,
                              title: `Lattice`,
                              video: `https://framerusercontent.com/assets/evzABRU4WEqu8p0fD9C5sDiGY9s.mp4`,
                              videoUrl: ``,
                            },
                            {
                              id: `default-item-2`,
                              image: Eo(
                                {
                                  pixelHeight: 919,
                                  pixelWidth: 736,
                                  src: `https://framerusercontent.com/images/N1JlQm7o4uyWW9iqV5Rz9BMeA.jpg?width=736&height=919`,
                                  srcSet: `https://framerusercontent.com/images/N1JlQm7o4uyWW9iqV5Rz9BMeA.jpg?width=736&height=919 736w`,
                                },
                                ``,
                              ),
                              imageUrl: `https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80`,
                              kind: `image`,
                              title: `Glass Edge`,
                              videoUrl: ``,
                            },
                            {
                              id: `default-item-4`,
                              image: Eo(
                                {
                                  pixelHeight: 2400,
                                  pixelWidth: 1796,
                                  src: `https://framerusercontent.com/images/FnA0lOktORlmJAnlNebTalpe6ZM.png?width=1796&height=2400`,
                                  srcSet: `https://framerusercontent.com/images/FnA0lOktORlmJAnlNebTalpe6ZM.png?scale-down-to=1024&width=1796&height=2400 766w,https://framerusercontent.com/images/FnA0lOktORlmJAnlNebTalpe6ZM.png?scale-down-to=2048&width=1796&height=2400 1532w,https://framerusercontent.com/images/FnA0lOktORlmJAnlNebTalpe6ZM.png?width=1796&height=2400 1796w`,
                                },
                                ``,
                              ),
                              imageUrl: `https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=900&q=80`,
                              kind: `image`,
                              title: `Plume`,
                              videoUrl: ``,
                            },
                            {
                              id: `default-item-5`,
                              image: Eo(
                                {
                                  pixelHeight: 2048,
                                  pixelWidth: 1536,
                                  src: `https://framerusercontent.com/images/xUSdDKegY1epCfmV1Z59ievg1LI.png?width=1536&height=2048`,
                                  srcSet: `https://framerusercontent.com/images/xUSdDKegY1epCfmV1Z59ievg1LI.png?scale-down-to=1024&width=1536&height=2048 768w,https://framerusercontent.com/images/xUSdDKegY1epCfmV1Z59ievg1LI.png?width=1536&height=2048 1536w`,
                                },
                                ``,
                              ),
                              imageUrl: `https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=900&q=80`,
                              kind: `video`,
                              title: `Quiet Form`,
                              video: `https://framerusercontent.com/assets/NN6Lx6k4t7M9vGURDbnyq40sQ.mp4`,
                              videoUrl: ``,
                            },
                            {
                              id: `default-item-6`,
                              image: Eo(
                                {
                                  pixelHeight: 1600,
                                  pixelWidth: 1200,
                                  src: `https://framerusercontent.com/images/amKQGUjyxH3cwRmcKcFl6ClvObQ.jpg?width=1200&height=1600`,
                                  srcSet: `https://framerusercontent.com/images/amKQGUjyxH3cwRmcKcFl6ClvObQ.jpg?scale-down-to=1024&width=1200&height=1600 768w,https://framerusercontent.com/images/amKQGUjyxH3cwRmcKcFl6ClvObQ.jpg?width=1200&height=1600 1200w`,
                                },
                                ``,
                              ),
                              imageUrl: `https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=900&q=80`,
                              kind: `image`,
                              title: `Night Grain`,
                              videoUrl: ``,
                            },
                            {
                              id: `Vl7vIHzyP`,
                              imageUrl: ``,
                              kind: `video`,
                              title: ``,
                              video: `https://framerusercontent.com/assets/roSTU06jbgGlsYXGIPH26maBtQQ.mp4`,
                              videoUrl: ``,
                            },
                          ],
                          layoutId: `wn_roz5NN`,
                          motion: {
                            autoplay: !0,
                            feel: `silk`,
                            hoverPause: !0,
                            interval: 3.2,
                            intro: !0,
                            lean: 6,
                            morph: `liquid`,
                            wheel: `both`,
                          },
                          start: 0,
                          style: { height: `100%`, width: `100%` },
                          surface: {
                            background: `rgb(255, 255, 255)`,
                            grid: !0,
                            gridColor: `rgba(255, 255, 255, 0.07)`,
                            halo: `rgba(170, 180, 210, 0.14)`,
                          },
                          width: `100%`,
                        }),
