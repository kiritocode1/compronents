(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [332],
  {
    4685: (e, t, i) => {
      "use strict";
      i.d(t, { A: () => l });
      var n = i(7876),
        a = i(7232),
        r = i(4154);
      let o = a.Ay.div.withConfig({
          displayName: "LayoutWrapper__Wrapper",
          componentId: "sc-eb50a3cb-0",
        })(["margin:0 auto;padding:0 ", ";"], (0, r.A)(16)),
        l = (e) =>
          (0, n.jsx)(o, { className: "layout-wrapper", children: e.children });
    },
    6760: (e, t, i) => {
      (window.__NEXT_P = window.__NEXT_P || []).push([
        "/",
        function () {
          return i(7045);
        },
      ]);
    },
    7045: (e, t, i) => {
      "use strict";
      i.r(t), i.d(t, { __N_SSG: () => tF, default: () => tO });
      var n = i(7876),
        a = i(7232),
        r = i(2867),
        o = i(1886),
        l = i(4154),
        s = i(8230),
        d = i.n(s),
        c = i(4232),
        p = i(4417);
      let u = a.Ay.div.withConfig({
          displayName: "Timezone__TimezoneWrapper",
          componentId: "sc-e001576e-0",
        })(["white-space:nowrap;"]),
        m = (e) => {
          var t;
          let { timezone: i } = e,
            [a, r] = (0, c.useState)(!1),
            [o, l] = (0, c.useState)(new Date()),
            s = ((e) => {
              try {
                return Intl.DateTimeFormat(void 0, { timeZone: e }), !0;
              } catch (e) {
                return !1;
              }
            })(i)
              ? i
              : "America/Toronto";
          if (
            ((0, c.useEffect)(() => {
              r(!0);
              let e = setInterval(() => {
                l(new Date());
              }, 1e3);
              return () => clearInterval(e);
            }, []),
            !a)
          )
            return (0, n.jsx)(u, {
              suppressHydrationWarning: !0,
              children: (0, p.qD)(new Date(), s, "HH:mm"),
            });
          let d = (0, p.qD)(o, s, "HH:mm"),
            m =
              (null ==
              (t = new Intl.DateTimeFormat("en", {
                timeZone: s,
                timeZoneName: "short",
              })
                .formatToParts(o)
                .find((e) => "timeZoneName" === e.type))
                ? void 0
                : t.value) || "";
          return (0, n.jsxs)(u, {
            suppressHydrationWarning: !0,
            children: [d, " ", m],
          });
        };
      var h = i(1727);
      let f = (0, a.Ay)(o.P.section).withConfig({
          displayName: "InfoScreen__InfoScreenWrapper",
          componentId: "sc-e19cc37c-0",
        })(
          [
            "position:fixed;top:0;left:0;height:100dvh;width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;overflow:auto;z-index:",
            ";pointer-events:",
            ";",
          ],
          (e) => (e.$isActive ? 20 : 1),
          (e) => (e.$isActive ? "auto" : "none"),
        ),
        v = a.Ay.div.withConfig({
          displayName: "InfoScreen__Inner",
          componentId: "sc-e19cc37c-1",
        })(
          [
            "display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:",
            ";pointer-events:",
            ";",
          ],
          (0, l.A)(360),
          (e) => (e.$isActive ? "auto" : "none"),
        ),
        y = (0, a.Ay)(o.P.div).withConfig({
          displayName: "InfoScreen__Cell",
          componentId: "sc-e19cc37c-2",
        })([
          "*{color:var(--colour-mid-grey);text-decoration:none;text-align:center;transition:all var(--transition-speed-default) var(--transition-ease);}a{transition:all var(--transition-speed-default) var(--transition-ease);}&:hover{a{color:var(--colour-off-black) !important;}}",
        ]),
        g = a.Ay.div.withConfig({
          displayName: "InfoScreen__TopBar",
          componentId: "sc-e19cc37c-3",
        })(
          [
            "display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:",
            ";",
          ],
          (0, l.A)(24),
        ),
        x = a.Ay.div.withConfig({
          displayName: "InfoScreen__DescriptionWrapper",
          componentId: "sc-e19cc37c-4",
        })(
          [
            "margin-bottom:",
            ";p{text-align:center;color:var(--colour-mid-grey);}a{color:var(--colour-mid-grey);transition:all var(--transition-speed-default) var(--transition-ease);&:hover{color:var(--colour-off-black);}}",
          ],
          (0, l.A)(24),
        ),
        w = a.Ay.div.withConfig({
          displayName: "InfoScreen__TimezoneWrapper",
          componentId: "sc-e19cc37c-5",
        })(
          [
            "margin-bottom:",
            ";display:flex;align-items:center;gap:",
            ";*{color:var(--colour-mid-grey);}",
          ],
          (0, l.A)(24),
          (0, l.A)(4),
        ),
        j = a.Ay.div.withConfig({
          displayName: "InfoScreen__LogosWrapper",
          componentId: "sc-e19cc37c-6",
        })(
          [
            "display:flex;flex-direction:row;align-items:center;justify-content:center;gap:",
            ";margin-bottom:",
            ";",
          ],
          (0, l.A)(24),
          (0, l.A)(24),
        ),
        b = a.Ay.img.withConfig({
          displayName: "InfoScreen__Logo",
          componentId: "sc-e19cc37c-7",
        })(
          ["width:auto;max-height:", ";max-width:", ";object-fit:contain;"],
          (0, l.A)(24),
          (0, l.A)(60),
        ),
        A = a.Ay.div.withConfig({
          displayName: "InfoScreen__Footer",
          componentId: "sc-e19cc37c-8",
        })([
          "display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--colour-mid-grey);a{color:var(--colour-mid-grey);transition:all var(--transition-speed-default) var(--transition-ease);&:hover{color:var(--colour-off-black);}}",
        ]),
        C = (e) => {
          let {
              variants: t,
              isActive: i,
              description: a,
              featuredLogos: r,
              instagramUrl: o,
              instagramHandle: l,
              email: s,
              location: c,
              timezone: p,
            } = e,
            u = r && r.length > 0;
          return (0, n.jsx)(f, {
            variants: t,
            initial: "hidden",
            animate: i ? "visible" : "hidden",
            $isActive: i,
            children: (0, n.jsxs)(v, {
              $isActive: i,
              children: [
                (0, n.jsxs)(g, {
                  children: [
                    o &&
                      (0, n.jsx)(
                        y,
                        {
                          className: "type-small",
                          children: (0, n.jsx)(d(), {
                            href: o,
                            target: "_blank",
                            children: l,
                          }),
                        },
                        "instagram",
                      ),
                    s &&
                      (0, n.jsx)(
                        y,
                        {
                          className: "type-small",
                          children: (0, n.jsx)(d(), {
                            href: "mailto:".concat(s),
                            children: s,
                          }),
                        },
                        "email",
                      ),
                  ],
                }),
                a &&
                  (0, n.jsx)(x, {
                    className: "type-small",
                    children: (0, n.jsx)(h.RK, { value: a }),
                  }),
                p &&
                  c &&
                  (0, n.jsxs)(w, {
                    className: "type-small",
                    children: [
                      (0, n.jsxs)("span", { children: [c, " — "] }),
                      (0, n.jsx)(m, { timezone: p }),
                    ],
                  }),
                u &&
                  (0, n.jsx)(j, {
                    children: r.map((e) => {
                      var t;
                      return (
                        (null == e || null == (t = e.asset) ? void 0 : t.url) &&
                        (0, n.jsx)(
                          b,
                          { src: e.asset.url, alt: "Featured logo" },
                          e.asset.url,
                        )
                      );
                    }),
                  }),
                (0, n.jsxs)(A, {
                  children: [
                    (0, n.jsxs)("p", {
                      className: "type-small",
                      children: [
                        (0, n.jsx)("span", { children: "\xa9" }),
                        " ",
                        new Date().getFullYear(),
                        " Abe Wynen",
                      ],
                    }),
                    (0, n.jsxs)("p", {
                      className: "type-small",
                      children: [
                        "Built by",
                        " ",
                        (0, n.jsx)(d(), {
                          href: "https://www.tayte.co",
                          target: "_blank",
                          children: "Tayte.co",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          });
        };
      var k = i(4820);
      let P = () => {
        let [e, t] = (0, c.useState)(""),
          i = () => {
            let e = window.innerWidth;
            e < 550 && t("mobile"),
              e > 551 && e < 768 && t("tabletPortrait"),
              e > 769 && e < 1124 && t("tabletMedium"),
              e > 1125 && e < 1440 && t("tabletLandscape"),
              e > 1441 && e < 1679 && t("laptop"),
              e > 1680 && t("desktop");
          };
        return (
          (0, c.useEffect)(
            () => (
              window.addEventListener("resize", i),
              i(),
              () => {
                window.removeEventListener("resize", i);
              }
            ),
            [],
          ),
          e
        );
      };
      var _ = i(4357);
      let I = a.Ay.div.withConfig({
          displayName: "ProjectCarousel__ProjectCarouselWrapper",
          componentId: "sc-c3dad835-0",
        })(
          ["@media ", "{display:none;}"],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        N = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectCarousel__Embla",
          componentId: "sc-c3dad835-1",
        })(["*{pointer-events:", " !important;}"], (e) => {
          let { $usePointerEvents: t } = e;
          return t ? "auto" : "none";
        }),
        L = a.Ay.div.withConfig({
          displayName: "ProjectCarousel__EmblaContainer",
          componentId: "sc-c3dad835-2",
        })(
          [
            "padding:50px;display:flex;flex-direction:column;height:100%;gap:",
            ";",
          ],
          (0, l.A)(2),
        ),
        M = a.Ay.div.withConfig({
          displayName: "ProjectCarousel__EmblaSlide",
          componentId: "sc-c3dad835-3",
        })(
          [
            "flex:0 0 9.09%;min-height:0;text-align:center;display:flex;justify-content:center;align-items:center;gap:",
            ";transition:opacity 0.06s linear;cursor:pointer;opacity:0;> .tile-slot{width:0;height:",
            ';overflow:hidden;display:flex;align-items:center;justify-content:center;flex:0 0 auto;transition:width 0.18s ease;}&[data-center="true"] > .tile-slot{width:',
            ';}> .tile-slot [data-tile]{opacity:0;transition:opacity 0.15s ease;transition-delay:0s;}&[data-center="true"] > .tile-slot [data-tile]{opacity:1;transition-delay:0.18s;}span{white-space:pre;}',
          ],
          (0, l.A)(6),
          (0, l.A)(12),
          (0, l.A)(12),
        ),
        S = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectCarousel__Content",
          componentId: "sc-c3dad835-4",
        })(
          [
            "display:flex;align-items:center;gap:",
            ";transition:gap 0.16s ease-in-out;span{color:",
            ";font-size:",
            " !important;line-height:1.5;transition:all var(--transition-speed-extra-slow) var(--transition-ease);@media ",
            "{font-size:",
            " !important;}}span:nth-child(2){opacity:0.4;}",
          ],
          (0, l.A)(4),
          (e) => {
            let { $isPlayerMode: t } = e;
            return t ? "var(--colour-white)" : "var(--colour-off-black)";
          },
          (0, l.A)(15),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(12),
        ),
        $ = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectCarousel__Tile",
          componentId: "sc-c3dad835-5",
        })(
          [
            "width:",
            ";height:",
            ";background:",
            ";border-radius:",
            ";opacity:0;transition:opacity 0.2s ease-in-out;",
          ],
          (0, l.A)(12),
          (0, l.A)(12),
          (e) => {
            let { $bg: t } = e;
            return t;
          },
          (0, l.A)(2),
        ),
        E = a.Ay.div.withConfig({
          displayName: "ProjectCarousel__TileSlot",
          componentId: "sc-c3dad835-6",
        })(
          [
            "width:0;height:",
            ";display:flex;align-items:center;justify-content:center;overflow:hidden;",
          ],
          (0, l.A)(12),
        ),
        T = {
          hidden: {
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          },
          visible: {
            opacity: 1,
            transition: { duration: 0.3, ease: "easeInOut" },
          },
        },
        B = (0, c.memo)((e) => {
          let {
              projects: t,
              activeProject: i,
              isPlayerMode: a,
              playerControlIsActive: r,
              activePage: o,
              isActive: l,
              setActiveProject: s,
              setActivePage: d,
            } = e,
            [p, u] = (0, c.useState)(null);
          (0, c.useRef)(new Set());
          let m = (0, c.useRef)(null),
            h = (0, c.useRef)(0),
            [f, v] = (0, k.A)(
              {
                loop: !0,
                axis: "y",
                startIndex: Math.floor(t.length / 2),
                dragFree: !0,
                align: "center",
                skipSnaps: !1,
                containScroll: !1,
                watchSlides: !1,
              },
              [(0, _.J)()],
            );
          (0, c.useEffect)(() => {
            if (!v || !i) return;
            let e = t.findIndex((e) => {
              var t, n;
              return (
                (null == (t = e.slug) ? void 0 : t.current) ===
                (null == (n = i.slug) ? void 0 : n.current)
              );
            });
            -1 !== e &&
              v.selectedScrollSnap() !== e &&
              (v.scrollTo(e, !0), u(e));
          }, [v, i, t]);
          let y = (0, c.useCallback)((e) => {
              if (e >= 6) return 0;
              let t = [1, 0.6, 0.35, 0.2, 0.12, 0.06, 0],
                i = Math.floor(e),
                n = t[i];
              return n + (t[i + 1] - n) * (e - i);
            }, []),
            g = (0, c.useCallback)(() => {
              if (!v || !t.length) return;
              let e = v.internalEngine(),
                i = v.scrollProgress(),
                n = v.containerNode(),
                a = v.slideNodes(),
                r = v.scrollSnapList(),
                o = r.length,
                l = 1 / 0,
                s = 0,
                d = Array(o);
              for (let t = 0; t < o; t += 1) {
                let n = r[t] - i;
                e.options.loop &&
                  e.slideLooper.loopPoints.forEach((e) => {
                    let a = e.target();
                    if (t === e.index && 0 !== a) {
                      let e = Math.sign(a);
                      -1 === e && (n = r[t] - (1 + i)),
                        1 === e && (n = r[t] + (1 - i));
                    }
                  });
                let a = Math.abs(n * o);
                (d[t] = a), a < l && ((l = a), (s = t));
              }
              h.current = s;
              for (let e = 0; e < o; e += 1) {
                let t = a[e],
                  i = d[e],
                  n = y(i);
                (t.style.opacity = String(n)),
                  (t.style.transform = "none"),
                  (t.style.pointerEvents = i <= 5 ? "auto" : "none"),
                  (t.style.willChange = "opacity"),
                  t.setAttribute("data-center", String(i < 0.5));
              }
              n.style.willChange = "transform";
            }, [v, t.length, y]),
            x = (0, c.useCallback)(() => {
              null === m.current &&
                (m.current = requestAnimationFrame(() => {
                  (m.current = null), g();
                }));
            }, [g]);
          (0, c.useEffect)(() => {
            if (!v || !l) return;
            let e =
              t.length % 2 == 0
                ? Math.floor(t.length / 2) - 1
                : Math.floor(t.length / 2);
            if (i) {
              let n = t.findIndex((e) => {
                var t, n;
                return (
                  (null == (t = e.slug) ? void 0 : t.current) ===
                  (null == (n = i.slug) ? void 0 : n.current)
                );
              });
              -1 !== n && (e = n);
            }
            v.scrollTo(e, !0), u(e), s(t[e]);
          }, [v, l]),
            (0, c.useEffect)(() => {
              if (!v) return;
              let e = () => {
                let e = v.selectedScrollSnap();
                u(e), s(t[e]);
              };
              return (
                v.on("select", e),
                () => {
                  v.off("select", e);
                }
              );
            }, [v, t, s]),
            (0, c.useEffect)(() => {
              if (!v) return;
              let e = (e) => {
                let {
                    scrollTo: t,
                    target: i,
                    location: n,
                  } = e.internalEngine(),
                  a = i.get() - n.get(),
                  r = 0.25 > Math.abs(a) ? 10 : 0.1;
                t.distance(a * r, !0);
              };
              return (
                v.on("pointerUp", e),
                () => {
                  v.off("pointerUp", e);
                }
              );
            }, [v]),
            (0, c.useEffect)(() => {
              if (!v) return;
              let e = () => {
                let {
                    limit: e,
                    target: t,
                    location: i,
                    offsetLocation: n,
                    scrollTo: a,
                    translate: r,
                    scrollBody: o,
                  } = v.internalEngine(),
                  l = null;
                e.reachedMax(t.get()) && (l = e.max),
                  e.reachedMin(t.get()) && (l = e.min),
                  null !== l
                    ? (n.set(l),
                      i.set(l),
                      t.set(l),
                      r.to(l),
                      r.toggleActive(!1),
                      o.useDuration(0).useFriction(0),
                      a.distance(0, !1))
                    : r.toggleActive(!0);
              };
              return (
                g(),
                v.on("scroll", e),
                v.on("scroll", x),
                v.on("reInit", g),
                () => {
                  v.off("scroll", e), v.off("scroll", x), v.off("reInit", g);
                }
              );
            }, [v, g, x]);
          let w = P(),
            j = "mobile" === w || "tabletPortrait" === w,
            b = (0, c.useCallback)(
              (e) => {
                v && (v.scrollTo(e), s(t[e]), j || d("player"));
              },
              [v, j, d, s, t],
            );
          return (0, n.jsx)(I, {
            children: (0, n.jsx)(N, {
              ref: f,
              variants: T,
              initial: "hidden",
              animate: "player" !== o || r ? "visible" : "hidden",
              $usePointerEvents: l,
              children: (0, n.jsx)(L, {
                children: t.map((e, t) => {
                  var i;
                  return (0, n.jsxs)(
                    M,
                    {
                      onClick: () => b(t),
                      $isActive:
                        (null == v ? void 0 : v.selectedScrollSnap()) === t,
                      children: [
                        (0, n.jsx)(E, {
                          className: "tile-slot",
                          children: (0, n.jsx)($, {
                            "data-tile": !0,
                            $bg:
                              (null == (i = e.tileColor) ? void 0 : i.hex) ||
                              "var(--colour-off-white)",
                          }),
                        }),
                        (0, n.jsxs)(S, {
                          $isPlayerMode: a,
                          children: [
                            (null == e ? void 0 : e.client) &&
                              (0, n.jsx)("span", { children: e.client }),
                            (null == e ? void 0 : e.title) &&
                              (0, n.jsx)("span", {
                                className: "project-title",
                                children: e.title,
                              }),
                          ],
                        }),
                      ],
                    },
                    "".concat(e.slug.current, "-").concat(t),
                  );
                }),
              }),
            }),
          });
        });
      B.displayName = "ProjectCarousel";
      let H = a.Ay.div.withConfig({
          displayName: "LayoutGrid__Grid",
          componentId: "sc-8bb6cacd-0",
        })(
          [
            "display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-column-gap:",
            ";align-items:start;@media ",
            "{grid-template-columns:repeat(6,minmax(0,1fr));}",
          ],
          (0, l.A)(16),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        V = (e) =>
          (0, n.jsx)(H, { className: "layout-grid", children: e.children });
      var z = i(3331),
        W = i(4587),
        Y = i.n(W),
        D = i(7212);
      let G = a.Ay.div.withConfig({
          displayName: "ProjectGridCard__ProjectGridCardWrapper",
          componentId: "sc-dc90f7fb-0",
        })(
          [
            "cursor:pointer;grid-column:span 4;@media ",
            "{grid-column:span 3;}",
          ],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        F = a.Ay.div.withConfig({
          displayName: "ProjectGridCard__MediaWrapper",
          componentId: "sc-dc90f7fb-1",
        })(
          [
            "position:relative;width:100%;padding-top:56.25%;margin-bottom:",
            ";",
          ],
          (0, l.A)(12),
        ),
        O = a.Ay.div.withConfig({
          displayName: "ProjectGridCard__MediaInner",
          componentId: "sc-dc90f7fb-2",
        })(
          [
            "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border-radius:",
            ";mux-player{height:100%;width:100%;object-fit:cover;}",
          ],
          (0, l.A)(2),
        ),
        X = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectGridCard__MediaLayer",
          componentId: "sc-dc90f7fb-3",
        })(["position:absolute;inset:0;width:100%;height:100%;z-index:2;"]),
        R = a.Ay.div.withConfig({
          displayName: "ProjectGridCard__ContentWrapper",
          componentId: "sc-dc90f7fb-4",
        })([""]),
        Z = a.Ay.p.withConfig({
          displayName: "ProjectGridCard__Title",
          componentId: "sc-dc90f7fb-5",
        })(
          [
            "color:var(--colour-off-black);display:flex;gap:",
            ";span:first-child:last-child{color:var(--colour-off-black);}span:last-child:not(:first-child){color:var(--colour-light-grey);}",
          ],
          (0, l.A)(4),
        ),
        U = a.Ay.p.withConfig({
          displayName: "ProjectGridCard__Type",
          componentId: "sc-dc90f7fb-6",
        })(["text-transform:capitalize;color:var(--colour-light-grey);"]),
        q = (e) => {
          var t, i, a, r, o, l, s, d, c, p;
          let {
            project: u,
            isPriority: m,
            isHovered: h,
            setActiveProject: f,
            setActivePage: v,
            setIsHovered: y,
          } = e;
          return (0, n.jsxs)(G, {
            onClick: () => {
              f(u), v("player");
            },
            onMouseOver: () => y(!0),
            onMouseOut: () => y(!1),
            children: [
              (0, n.jsx)(F, {
                children: (0, n.jsxs)(O, {
                  children: [
                    (null == u ||
                    null == (i = u.fallbackImage) ||
                    null == (t = i.asset)
                      ? void 0
                      : t.url) &&
                      (0, n.jsx)(Y(), {
                        src:
                          null == u ||
                          null == (r = u.fallbackImage) ||
                          null == (a = r.asset)
                            ? void 0
                            : a.url,
                        alt: ""
                          .concat(null == u ? void 0 : u.title, " - ")
                          .concat(null == u ? void 0 : u.client),
                        priority: m,
                        fill: !0,
                        style: { objectFit: "cover" },
                        sizes: "(max-width: 1024px) 90vw, 33vw",
                      }),
                    (0, n.jsx)(D.N, {
                      children:
                        h &&
                        (null == u ||
                        null == (l = u.snippetVideo) ||
                        null == (o = l.asset)
                          ? void 0
                          : o.playbackId) &&
                        (0, n.jsx)(
                          X,
                          {
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            transition: { duration: 0.3 },
                            children: (0, n.jsx)(z.Ay, {
                              streamType: "on-demand",
                              playbackId:
                                null == u ||
                                null == (d = u.snippetVideo) ||
                                null == (s = d.asset)
                                  ? void 0
                                  : s.playbackId,
                              autoPlay: "muted",
                              loop: !0,
                              thumbnailTime: 1,
                              preload: "auto",
                              muted: !0,
                              playsInline: !0,
                              poster: "".concat(
                                null == u ||
                                  null == (p = u.fallbackImage) ||
                                  null == (c = p.asset)
                                  ? void 0
                                  : c.url,
                              ),
                            }),
                          },
                          "video",
                        ),
                    }),
                  ],
                }),
              }),
              (0, n.jsxs)(R, {
                children: [
                  (0, n.jsxs)(Z, {
                    className: "type-small",
                    children: [
                      (null == u ? void 0 : u.title) &&
                        (0, n.jsx)("span", {
                          children: null == u ? void 0 : u.title,
                        }),
                      (null == u ? void 0 : u.client) &&
                        (0, n.jsx)("span", {
                          children: null == u ? void 0 : u.client,
                        }),
                    ],
                  }),
                  (null == u ? void 0 : u.type) &&
                    (0, n.jsx)(U, {
                      className: "type-small",
                      children: null == u ? void 0 : u.type,
                    }),
                ],
              }),
            ],
          });
        },
        J = a.Ay.div.withConfig({
          displayName: "ProjectGrid__ProjectGridWrapper",
          componentId: "sc-2940b0bf-0",
        })(
          [
            "pointer-events:",
            ";opacity:",
            ";transform:",
            ";width:100%;filter:",
            ";transition:all 750ms var(--transition-ease);transition-delay:",
            ";.layout-grid{grid-row-gap:",
            ";}",
          ],
          (e) => {
            let { $isPlayerMode: t, $isActive: i } = e;
            return t ? "none" : i ? "all" : "none";
          },
          (e) => {
            let { $isPlayerMode: t } = e;
            return +!t;
          },
          (e) => {
            let { $isPlayerMode: t } = e;
            return t ? "scale(0.98)" : "scale(1)";
          },
          (e) => {
            let { $isPlayerMode: t } = e;
            return t ? "blur(10px)" : "blur(0px)";
          },
          (e) => {
            let { $useDelay: t } = e;
            return t ? "500ms" : "0ms";
          },
          (0, l.A)(40),
        ),
        K = a.Ay.div.withConfig({
          displayName: "ProjectGrid__Wrapper",
          componentId: "sc-2940b0bf-1",
        })(["padding:0 15vw;"]),
        Q = (0, c.memo)((e) => {
          let {
              projects: t,
              isPlayerMode: i,
              isActive: a,
              useDelay: r,
              setActiveProject: o,
              setActivePage: l,
            } = e,
            [s, d] = (0, c.useState)(null),
            p = t && t.length > 0,
            u = (0, c.useCallback)(
              (e) => (t) => {
                d(t ? e : null);
              },
              [],
            );
          return (0, n.jsx)(J, {
            $isPlayerMode: i,
            $isActive: a,
            $useDelay: r,
            children:
              p &&
              (0, n.jsx)(K, {
                children: (0, n.jsx)(V, {
                  children: t.map((e, t) =>
                    (0, n.jsx)(
                      q,
                      {
                        project: e,
                        isHovered: s === e.slug.current,
                        anyCardHovered: null !== s,
                        isPriority: t < 3,
                        setActiveProject: o,
                        setActivePage: l,
                        setIsHovered: u(e.slug.current),
                      },
                      e.slug.current,
                    ),
                  ),
                }),
              }),
          });
        });
      Q.displayName = "ProjectGrid";
      let ee = a.Ay.div.withConfig({
          displayName: "MobileProjectCarousel__MobileProjectCarouselWrapper",
          componentId: "sc-8d83a8ee-0",
        })(
          [
            "display:none;@media ",
            "{display:block;padding-bottom:15%;}@media ",
            "{padding-bottom:calc(56.25% - 32px);}",
          ],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (e) => e.theme.mediaBreakpoints.mobile,
        ),
        et = (0, a.Ay)(o.P.div).withConfig({
          displayName: "MobileProjectCarousel__Embla",
          componentId: "sc-8d83a8ee-1",
        })(["pointer-events:", ";"], (e) => (e.$isActive ? "auto" : "none")),
        ei = a.Ay.div.withConfig({
          displayName: "MobileProjectCarousel__EmblaContainer",
          componentId: "sc-8d83a8ee-2",
        })(
          [
            "padding:50px;display:flex;flex-direction:column;height:100%;gap:",
            ";",
          ],
          (0, l.A)(2),
        ),
        en = a.Ay.div.withConfig({
          displayName: "MobileProjectCarousel__EmblaSlide",
          componentId: "sc-8d83a8ee-3",
        })(
          [
            "flex:0 0 9.09%;min-height:0;text-align:center;display:flex;justify-content:center;align-items:center;gap:",
            ";transition:opacity 0.06s linear;cursor:pointer;> .tile-slot{width:0;height:",
            ';overflow:hidden;display:flex;align-items:center;justify-content:center;flex:0 0 auto;transition:width 0.18s ease;}&[data-center="true"] > .tile-slot{width:',
            ';}> .tile-slot [data-tile]{opacity:0;transition:opacity 0.15s ease;transition-delay:0s;}&[data-center="true"] > .tile-slot [data-tile]{opacity:1;transition-delay:0.18s;}span{white-space:pre;}',
          ],
          (0, l.A)(6),
          (0, l.A)(12),
          (0, l.A)(12),
        ),
        ea = (0, a.Ay)(o.P.div).withConfig({
          displayName: "MobileProjectCarousel__Content",
          componentId: "sc-8d83a8ee-4",
        })(
          [
            "display:flex;align-items:center;justify-content:center;gap:",
            ";span{color:",
            ";max-width:320px;transition:all var(--transition-speed-slow) var(--transition-ease);}span:nth-child(2){opacity:0.4;text-overflow:ellipsis;overflow:hidden;max-width:200px;}",
          ],
          (0, l.A)(4),
          (e) => {
            let { $isPlayerMode: t } = e;
            return t ? "var(--colour-white)" : "var(--colour-off-black)";
          },
        ),
        er = (0, a.Ay)(o.P.div).withConfig({
          displayName: "MobileProjectCarousel__Tile",
          componentId: "sc-8d83a8ee-5",
        })(
          [
            "width:",
            ";height:",
            ";background:",
            ";border-radius:",
            ";opacity:0;transition:opacity 0.2s ease-in-out;",
          ],
          (0, l.A)(12),
          (0, l.A)(12),
          (e) => {
            let { $bg: t } = e;
            return t;
          },
          (0, l.A)(2),
        ),
        eo = {
          hidden: {
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          },
          visible: {
            opacity: 1,
            transition: { duration: 0.3, ease: "easeInOut", delay: 0.5 },
          },
        },
        el = (0, c.memo)((e) => {
          let {
              projects: t,
              activeProject: i,
              isPlayerMode: a,
              playerControlIsActive: r,
              activePage: o,
              isActive: l,
              setActiveProject: s,
              setActivePage: d,
            } = e,
            [p, u] = (0, c.useState)(!1),
            m = (0, c.useRef)(null),
            [h, f] = (0, k.A)({
              loop: !0,
              axis: "y",
              startIndex: Math.floor(t.length / 2),
              dragFree: !0,
              align: "center",
              skipSnaps: !1,
              containScroll: !1,
              watchSlides: !1,
            });
          (0, c.useEffect)(() => {
            if (!f || !i) return;
            let e = t.findIndex((e) => {
              var t, n;
              return (
                (null == (t = e.slug) ? void 0 : t.current) ===
                (null == (n = i.slug) ? void 0 : n.current)
              );
            });
            -1 !== e && f.selectedScrollSnap() !== e && f.scrollTo(e, !0);
          }, [f, i, t]);
          let v = (0, c.useCallback)((e) => {
              if (e >= 6) return 0;
              let t = [1, 0.6, 0.35, 0.2, 0.12, 0.06, 0],
                i = Math.floor(e),
                n = t[i];
              return n + (t[i + 1] - n) * (e - i);
            }, []),
            y = (0, c.useCallback)(() => {
              if (!f || !t.length) return;
              let e = f.internalEngine(),
                i = f.scrollProgress(),
                n = f.containerNode(),
                a = f.slideNodes(),
                r = f.scrollSnapList(),
                o = r.length,
                l = 1 / 0,
                s = Array(o);
              for (let t = 0; t < o; t += 1) {
                let n = r[t] - i;
                e.options.loop &&
                  e.slideLooper.loopPoints.forEach((e) => {
                    let a = e.target();
                    if (t === e.index && 0 !== a) {
                      let e = Math.sign(a);
                      -1 === e && (n = r[t] - (1 + i)),
                        1 === e && (n = r[t] + (1 - i));
                    }
                  });
                let a = Math.abs(n * o);
                (s[t] = a), a < l && (l = a);
              }
              for (let e = 0; e < o; e += 1) {
                let t = a[e],
                  i = s[e],
                  n = v(i);
                (t.style.opacity = String(n)),
                  (t.style.transform = "none"),
                  (t.style.willChange = "opacity"),
                  t.setAttribute("data-center", String(i < 0.5));
              }
              n.style.willChange = "transform";
            }, [f, t.length, v]),
            g = (0, c.useCallback)(() => {
              null === m.current &&
                (m.current = requestAnimationFrame(() => {
                  (m.current = null), y();
                }));
            }, [y]);
          (0, c.useEffect)(() => {
            if (f && l)
              return (
                y(),
                f.on("scroll", g),
                f.on("reInit", y),
                () => {
                  f.off("scroll", g), f.off("reInit", y);
                }
              );
          }, [f, y, g, l]),
            (0, c.useEffect)(() => {
              if (!f || !t.length || !l || i) return;
              let e = Math.floor(t.length / 2);
              s(t[e]);
            }, [f, t, s, l, i]),
            (0, c.useEffect)(() => {
              u(!0);
            }, []);
          let x = P(),
            w = (0, c.useCallback)(
              (e) => {
                if (f && l) {
                  if (f.selectedScrollSnap() === e) return void d("player");
                  f.scrollTo(e), s(t[e]);
                }
              },
              [f, "mobile" === x || "tabletPortrait" === x, d, s, t, l],
            );
          return (
            (0, c.useEffect)(() => {
              if (!f) return;
              let e = () => {
                s(t[f.selectedScrollSnap()]);
              };
              return (
                f.on("select", e),
                () => {
                  f.off("select", e);
                }
              );
            }, [f, t, s]),
            (0, n.jsx)(ee, {
              className: "performance",
              children: p
                ? (0, n.jsx)(et, {
                    ref: h,
                    variants: eo,
                    initial: "hidden",
                    animate: "player" !== o ? "visible" : "hidden",
                    $isActive: "projects" === o,
                    children: (0, n.jsx)(ei, {
                      children: t.map((e, t) => {
                        var i;
                        return (0, n.jsxs)(
                          en,
                          {
                            onClick: () => w(t),
                            $isActive:
                              (null == f ? void 0 : f.selectedScrollSnap()) ===
                              t,
                            children: [
                              (0, n.jsx)("div", {
                                className: "tile-slot",
                                children: (0, n.jsx)(er, {
                                  "data-tile": !0,
                                  $bg:
                                    (null == (i = e.tileColor)
                                      ? void 0
                                      : i.hex) || "var(--colour-off-white)",
                                }),
                              }),
                              (0, n.jsxs)(ea, {
                                layout: !0,
                                transition: { duration: 0.1 },
                                $isPlayerMode: a,
                                children: [
                                  (null == e ? void 0 : e.client) &&
                                    (0, n.jsx)("span", { children: e.client }),
                                  (null == e ? void 0 : e.title) &&
                                    (0, n.jsx)("span", {
                                      className: "project-title",
                                      children: e.title,
                                    }),
                                ],
                              }),
                            ],
                          },
                          "".concat(e.slug.current, "-").concat(t),
                        );
                      }),
                    }),
                  })
                : null,
            })
          );
        });
      el.displayName = "MobileProjectCarousel";
      let es = a.Ay.div.withConfig({
          displayName: "ProjectFilters__ProjectFiltersWrapper",
          componentId: "sc-70de7e97-0",
        })(
          [
            "position:fixed;top:",
            ";left:50%;transform:translateX(-50%);z-index:20;display:flex;justify-content:center;align-items:center;gap:",
            ";pointer-events:",
            ";opacity:",
            ";background:rgba(255,255,255,0);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:",
            ";padding:",
            " ",
            ";transition:all 500ms var(--transition-ease);@media ",
            "{display:none;}",
          ],
          (0, l.A)(24),
          (0, l.A)(2),
          (e) => (e.$isPlayerMode ? "none" : "auto"),
          (e) => +!e.$isPlayerMode,
          (0, l.A)(4),
          (0, l.A)(4),
          (0, l.A)(8),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        ed = a.Ay.button.withConfig({
          displayName: "ProjectFilters__Trigger",
          componentId: "sc-70de7e97-1",
        })(
          [
            "pointer-events:all;height:",
            ";width:auto;padding:0 ",
            ";display:flex;align-items:center;justify-content:center;border-radius:",
            ";position:relative;pointer-events:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);&:hover{span{color:var(--colour-mid-grey);}}span{position:relative;z-index:2;color:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);}",
          ],
          (0, l.A)(34),
          (0, l.A)(8),
          (0, l.A)(4),
          (e) => (e.$isActive ? "none" : "auto"),
          (e) =>
            e.$isActive ? "var(--colour-mid-grey)" : "var(--colour-light-grey)",
        ),
        ec = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectFilters__TileBg",
          componentId: "sc-70de7e97-2",
        })(
          [
            "position:absolute;top:0;left:0;width:100%;height:100%;background-color:var(--colour-off-white);border-radius:",
            ";z-index:1;",
          ],
          (0, l.A)(4),
        ),
        ep = (e) => {
          let { activeFilter: t, isPlayerMode: i, setActiveFilter: a } = e;
          return (0, n.jsxs)(es, {
            $isPlayerMode: i,
            children: [
              (0, n.jsxs)(ed, {
                $isActive: "all" === t,
                onClick: () => a("all"),
                children: [
                  (0, n.jsx)("span", { children: "All" }),
                  "all" === t && (0, n.jsx)(ec, { layoutId: "filter-tile-bg" }),
                ],
              }),
              (0, n.jsxs)(ed, {
                $isActive: "commercial" === t,
                onClick: () => a("commercial"),
                children: [
                  (0, n.jsx)("span", { children: "Commercial" }),
                  "commercial" === t &&
                    (0, n.jsx)(ec, { layoutId: "filter-tile-bg" }),
                ],
              }),
              (0, n.jsxs)(ed, {
                $isActive: "music" === t,
                onClick: () => a("music"),
                children: [
                  (0, n.jsx)("span", { children: "Music" }),
                  "music" === t &&
                    (0, n.jsx)(ec, { layoutId: "filter-tile-bg" }),
                ],
              }),
              (0, n.jsxs)(ed, {
                $isActive: "narrative" === t,
                onClick: () => a("narrative"),
                children: [
                  (0, n.jsx)("span", { children: "Narrative" }),
                  "narrative" === t &&
                    (0, n.jsx)(ec, { layoutId: "filter-tile-bg" }),
                ],
              }),
            ],
          });
        },
        eu = (0, a.Ay)(o.P.section).withConfig({
          displayName: "ProjectsScreen__ProjectsScreenWrapper",
          componentId: "sc-40dc11e0-0",
        })(
          [
            "position:fixed;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:",
            ";pointer-events:none;overflow:hidden;@media ",
            "{z-index:5;}",
          ],
          (e) => (e.$isActive ? 50 : 1),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        em = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectsScreen__ListWrapper",
          componentId: "sc-40dc11e0-1",
        })(
          [
            "position:fixed;top:0;left:0;width:100%;height:50dvh;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;z-index:",
            ";pointer-events:",
            ";overflow:auto;@media ",
            "{height:100lvh;}",
          ],
          (e) => (e.$isActive ? 20 : 1),
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        eh = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectsScreen__GridWrapper",
          componentId: "sc-40dc11e0-2",
        })(
          [
            "position:fixed;top:0;left:0;width:100%;height:100lvh;overflow:auto;touch-action:pan-y;padding:25vh 0;pointer-events:",
            ";z-index:",
            ";transition-delay:",
            ";",
          ],
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => (e.$isActive ? 20 : 1),
          (e) => {
            let { $useDelay: t } = e;
            return t ? "500ms" : "0ms";
          },
        ),
        ef = a.Ay.div.withConfig({
          displayName: "ProjectsScreen__Wrapper",
          componentId: "sc-40dc11e0-3",
        })(
          [
            "opacity:",
            ";pointer-events:",
            ";transition:opacity 0.5s ease;position:relative;z-index:15;",
          ],
          (e) => +!!e.$isActive,
          (e) => (e.$isActive ? "auto" : "none"),
        ),
        ev = {
          hidden: {
            opacity: 0,
            blur: 5,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
          visible: {
            opacity: 1,
            blur: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
        },
        ey = {
          hidden: {
            opacity: 0,
            filter: "blur(5px)",
            y: 15,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
          visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: { duration: 0.5, ease: "easeInOut", delay: 0.75 },
          },
          exit: {
            opacity: 0,
            filter: "blur(5px)",
            y: -15,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
        },
        eg = (0, c.memo)((e) => {
          let {
              projects: t,
              variants: i,
              isActive: a,
              activeProject: r,
              activePage: o,
              playerControlIsActive: l,
              projectViewMode: s,
              playerViewMode: d,
              setActiveProject: p,
              setActivePage: u,
            } = e,
            [m, h] = (0, c.useState)("all"),
            [f, v] = (0, c.useState)(t),
            [y, g] = (0, c.useState)(!1),
            x = (0, c.useRef)(null),
            w = t && t.length > 0,
            j = "player" === o,
            b = "list" === s,
            A = "grid" === s,
            C = P(),
            k = "mobile" === C || "tabletPortrait" === C,
            _ = f
              .map((e) => {
                var t;
                return null == (t = e.slug) ? void 0 : t.current;
              })
              .join("|");
          return (
            (0, c.useEffect)(() => {
              g(!0);
              let e = setTimeout(() => {
                "all" === m ? v(t) : v(t.filter((e) => e.type === m)), g(!1);
              }, 300);
              return () => clearTimeout(e);
            }, [m, t]),
            (0, n.jsxs)(eu, {
              variants: i,
              initial: "hidden",
              animate: a ? "visible" : "hidden",
              $isActive: a,
              children: [
                (0, n.jsx)(ep, {
                  isPlayerMode: j,
                  activeFilter: m,
                  setActiveFilter: h,
                }),
                (0, n.jsxs)(ef, {
                  $isActive: w && !y,
                  className: "projects-screen",
                  children: [
                    (0, n.jsxs)(em, {
                      variants: ev,
                      initial: "hidden",
                      animate:
                        a && "video" === d && (b || (A && j))
                          ? "visible"
                          : "hidden",
                      $isActive: a && "video" === d && (b || (A && j)),
                      children: [
                        !k &&
                          (0, n.jsx)(
                            B,
                            {
                              projects: f,
                              activeProject: r,
                              isPlayerMode: j,
                              activePage: o,
                              playerControlIsActive: l,
                              isActive: a && "video" === d && (b || (A && j)),
                              setActiveProject: p,
                              setActivePage: u,
                            },
                            _,
                          ),
                        k &&
                          (0, n.jsx)(
                            el,
                            {
                              projects: f,
                              activeProject: r,
                              isPlayerMode: j,
                              activePage: o,
                              playerControlIsActive: l,
                              isActive: a && !j,
                              setActiveProject: p,
                              setActivePage: u,
                            },
                            _,
                          ),
                      ],
                    }),
                    (0, n.jsx)(
                      eh,
                      {
                        ref: x,
                        variants: ey,
                        initial: "hidden",
                        animate: a && A ? "visible" : "hidden",
                        exit: "exit",
                        $isActive: a && A && !j,
                        $useDelay: "grid" === s && "player" === o,
                        children: (0, n.jsx)(Q, {
                          projects: f,
                          isPlayerMode: j,
                          isActive: a && A,
                          useDelay: "grid" === s && "player" !== o,
                          setActiveProject: p,
                          setActivePage: u,
                        }),
                      },
                      "".concat(x, "-").concat(t.length),
                    ),
                  ],
                }),
              ],
            })
          );
        });
      eg.displayName = "ProjectsScreen";
      var ex = i(7170),
        ew = i.n(ex);
      let ej = () => {
          let { innerWidth: e, innerHeight: t } = window;
          return { width: e, height: t };
        },
        eb = a.Ay.span.withConfig({
          displayName: "ColourTitle__ColourTitleWrapper",
          componentId: "sc-25f64898-0",
        })(
          ["color:hsl(", "deg,70%,50%);transition:color 0.2s ease;"],
          (e) => e.$hue,
        ),
        eA = () => {
          let { x: e } = (() => {
              let [e, t] = (0, c.useState)({ x: null, y: null }),
                i = (e) => t({ x: e.clientX, y: e.clientY });
              return (
                (0, c.useEffect)(() => {
                  let e = ew()(i, 100);
                  return (
                    window.addEventListener("mousemove", e),
                    () => {
                      e.cancel(), window.removeEventListener("mousemove", e);
                    }
                  );
                }, []),
                e
              );
            })(),
            { width: t } = (() => {
              let [e, t] = (0, c.useState)({ width: 0, height: 0 });
              return (
                (0, c.useEffect)(() => {
                  t(ej());
                  let e = ew()(
                    () => {
                      t(ej());
                    },
                    64,
                    { leading: !0, trailing: !0 },
                  );
                  return (
                    window.addEventListener("resize", e),
                    () => window.removeEventListener("resize", e)
                  );
                }, []),
                e
              );
            })(),
            i = Math.floor(((null != e ? e : 0) / (t || 1)) * 300);
          return (0, n.jsx)(eb, { $hue: i, children: "Colourist" });
        },
        eC = (0, a.Ay)(o.P.section).withConfig({
          displayName: "HomeScreen__HomeScreenWrapper",
          componentId: "sc-7388c11c-0",
        })(
          [
            "position:fixed;top:0;left:0;height:100dvh;width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:none;z-index:",
            ";",
          ],
          (e) => (e.$isActive ? 2 : 1),
        ),
        ek = a.Ay.div.withConfig({
          displayName: "HomeScreen__Content",
          componentId: "sc-7388c11c-1",
        })(
          [
            "display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:",
            ";opacity:",
            ";pointer-events:",
            ";transition:opacity var(--transition-speed-slow) var(--transition-ease);@media ",
            "{padding-bottom:calc(56.25% - 32px);padding-left:",
            ";padding-right:",
            ";}",
          ],
          (0, l.A)(380),
          (e) => {
            let { $isPlayerMode: t } = e;
            return +!t;
          },
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => e.theme.mediaBreakpoints.mobile,
          (0, l.A)(16),
          (0, l.A)(16),
        ),
        eP = a.Ay.h1.withConfig({
          displayName: "HomeScreen__Title",
          componentId: "sc-7388c11c-2",
        })(["color:var(--colour-off-black);text-align:center;"]),
        e_ = a.Ay.p.withConfig({
          displayName: "HomeScreen__SubTitle",
          componentId: "sc-7388c11c-3",
        })(["color:var(--colour-light-grey);text-align:center;"]),
        eI = (e) => {
          let {
            titleSuffix: t,
            subTitle: i,
            variants: a,
            isPlayerMode: r,
            isActive: o,
          } = e;
          return (0, n.jsx)(eC, {
            variants: a,
            initial: "hidden",
            animate: o ? "visible" : "hidden",
            $isActive: o,
            children: (0, n.jsxs)(ek, {
              $isPlayerMode: r,
              $isActive: o,
              children: [
                (0, n.jsxs)(eP, {
                  children: ["A ", (0, n.jsx)(eA, {}), " ", t || ""],
                }),
                (0, n.jsx)(e_, { children: i || "" }),
              ],
            }),
          });
        },
        eN = a.Ay.button.withConfig({
          displayName: "MainNavButton__MainNavButtonWrapper",
          componentId: "sc-8587098b-0",
        })(
          [
            "pointer-events:all;@media ",
            "{&.tile-button{width:auto;padding:0 ",
            ";}}&:hover{background:var(--colour-off-black);color:var(--colour-off-white);@media ",
            "{color:var(--colour-mid-grey);background:var(--colour-off-white);}.hint{opacity:1;transform:translateY(-50%) ",
            ";}}",
          ],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(8),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (e) => (e.$alignHintLeft ? "translateX(-4px)" : "translateX(4px)"),
        ),
        eL = a.Ay.p.withConfig({
          displayName: "MainNavButton__Hint",
          componentId: "sc-8587098b-1",
        })(
          [
            "font-size:",
            ";line-height:",
            ";color:var(--colour-mid-grey);position:absolute;top:50%;transform:translateY(-50%) translateX(0);",
            " opacity:",
            ";pointer-events:none;transition:all var(--transition-speed-default) var(--transition-ease);@media ",
            "{display:none;}",
          ],
          (0, l.A)(12),
          (0, l.A)(10),
          (e) => {
            let { $alignHintLeft: t } = e;
            return t ? "right: calc(100% + 8px);" : "left: calc(100% + 8px);";
          },
          (e) => {
            let { $keepHintActive: t } = e;
            return 0.4 * !!t;
          },
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        eM = (e) => {
          let {
              title: t,
              hint: i,
              handleClick: a,
              alignHintLeft: r,
              keepHintActive: o,
            } = e,
            [l, s] = (0, c.useState)(!0);
          return (
            (0, c.useEffect)(() => {
              let e = setTimeout(() => {
                s(!1);
              }, 2e3);
              return () => clearTimeout(e);
            }, []),
            (0, n.jsxs)(eN, {
              onClick: a,
              $alignHintLeft: r,
              className: "tile-button",
              children: [
                t,
                i &&
                  (0, n.jsx)(eL, {
                    $alignHintLeft: r,
                    $showInitial: l,
                    $keepHintActive: o,
                    className: "hint",
                    children: i,
                  }),
              ],
            })
          );
        },
        eS = a.Ay.button.withConfig({
          displayName: "EscButton__EscButtonWrapper",
          componentId: "sc-72b14214-0",
        })(
          [
            "pointer-events:all;border:1px solid ",
            ";backdrop-filter:blur(10px);&.tile-button{background:",
            ";color:",
            ";}&:hover{background:var(--colour-off-white);color:var(--colour-off-black);@media ",
            "{color:var(--colour-mid-grey);background:var(--colour-off-white);}.hint{opacity:1;transform:translateY(-50%) ",
            ";}}",
          ],
          (e) => {
            let { $useDarkMode: t } = e;
            return t ? "rgba(238, 238, 238, 0.1)" : "initial";
          },
          (e) => {
            let { $useDarkMode: t } = e;
            return t ? "rgba(238, 238, 238, 0.05)" : "var(--colour-off-white)";
          },
          (e) => {
            let { $useDarkMode: t } = e;
            return t ? "var(--colour-off-white)" : "var(--colour-mid-grey)";
          },
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (e) => (e.$alignHintLeft ? "translateX(-4px)" : "translateX(4px)"),
        ),
        e$ = a.Ay.p.withConfig({
          displayName: "EscButton__Hint",
          componentId: "sc-72b14214-1",
        })(
          [
            "font-size:",
            ";line-height:",
            ";color:",
            ";position:absolute;top:50%;transform:translateY(-50%) ",
            ";",
            " opacity:",
            ";pointer-events:none;transition:all var(--transition-speed-default) var(--transition-ease);@media ",
            "{display:none;}",
          ],
          (0, l.A)(12),
          (0, l.A)(10),
          (e) => {
            let { $useDarkMode: t } = e;
            return t ? "var(--colour-off-white)" : "var(--colour-mid-grey)";
          },
          (e) => {
            let { $alignHintLeft: t, $showInitial: i } = e;
            return "translateX(0)";
          },
          (e) => {
            let { $alignHintLeft: t } = e;
            return t ? "right: calc(100% + 8px);" : "left: calc(100% + 8px);";
          },
          (e) => {
            let { $showInitial: t } = e;
            return +!!t;
          },
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        eE = (e) => {
          let {
              activePage: t,
              alignHintLeft: i = !1,
              useDarkMode: a = !1,
              setActivePage: r,
              setPlayerViewMode: o,
            } = e,
            l = (0, c.useCallback)(() => {
              "player" === t
                ? r("projects")
                : "projects" === t
                  ? r("home")
                  : "home" === t && o
                    ? o("video")
                    : r("home");
            }, [t, r, o]);
          return (
            (0, c.useEffect)(() => {
              let e = (e) => {
                "Escape" === e.key && l();
              };
              return (
                window.addEventListener("keydown", e),
                () => {
                  window.removeEventListener("keydown", e);
                }
              );
            }, [l]),
            (0, n.jsxs)(eS, {
              className: "tile-button",
              onClick: l,
              $useDarkMode: a,
              $alignHintLeft: i,
              children: [
                "esc",
                (0, n.jsx)(e$, {
                  $showInitial: !1,
                  className: "hint",
                  $useDarkMode: a,
                  $alignHintLeft: i,
                  children: "Escape",
                }),
              ],
            })
          );
        },
        eT = (0, a.Ay)(o.P.div).withConfig({
          displayName: "HomeLayout__Layout",
          componentId: "sc-aa23277f-0",
        })(
          [
            "display:flex;justify-content:space-between;align-items:center;padding:0 ",
            ";pointer-events:",
            ";z-index:",
            ";@media ",
            "{align-items:flex-start;justify-content:flex-end;padding:",
            ";gap:",
            ";}",
          ],
          (0, l.A)(24),
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => (e.$isActive ? 2 : 1),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(12),
          (0, l.A)(8),
        ),
        eB = (e) => {
          let {
              variants: t,
              playerViewMode: i,
              isActive: a,
              setActivePage: r,
              setPlayerViewMode: o,
            } = e,
            l = P(),
            s = "mobile" === l || "tabletPortrait" === l;
          return (
            (0, c.useEffect)(() => {
              if (!a) return;
              let e = (e) => {
                if (e.defaultPrevented) return;
                let t = e.target;
                if (
                  t &&
                  ("INPUT" === t.tagName ||
                    "TEXTAREA" === t.tagName ||
                    t.isContentEditable)
                )
                  return;
                let i = e.key.toLowerCase();
                "p" === i ? r("projects") : "i" === i && r("information");
              };
              return (
                window.addEventListener("keydown", e),
                () => {
                  window.removeEventListener("keydown", e);
                }
              );
            }, [a, r]),
            (0, n.jsx)(eT, {
              variants: t,
              initial: "hidden",
              animate: a ? "visible" : "hidden",
              $isActive: a,
              children:
                "showreel" === i
                  ? (0, n.jsx)(eE, {
                      activePage: "home",
                      useDarkMode: !0,
                      setActivePage: r,
                      setPlayerViewMode: o,
                    })
                  : (0, n.jsxs)(n.Fragment, {
                      children: [
                        (0, n.jsx)(eM, {
                          title: s ? "Projects" : "P",
                          hint: "Projects",
                          handleClick: () => r("projects"),
                          keepHintActive: !0,
                        }),
                        (0, n.jsx)(eM, {
                          title: s ? "Info" : "I",
                          hint: "Info",
                          alignHintLeft: !0,
                          handleClick: () => r("information"),
                          keepHintActive: !0,
                        }),
                      ],
                    }),
            })
          );
        },
        eH = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "10",
            viewBox: "0 0 14 10",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M0.5 5H13.5",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M0.5 9.33325H13.5",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M0.5 0.666626H13.5",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        eV = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M7 0.5V13.5",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M0.5 7H13.5",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M12.0556 0.5H1.94444C1.1467 0.5 0.5 1.1467 0.5 1.94444V12.0556C0.5 12.8533 1.1467 13.5 1.94444 13.5H12.0556C12.8533 13.5 13.5 12.8533 13.5 12.0556V1.94444C13.5 1.1467 12.8533 0.5 12.0556 0.5Z",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        ez = a.Ay.div.withConfig({
          displayName: "ProjectViews__ProjectViewsWrapper",
          componentId: "sc-96c55b32-0",
        })(
          [
            "display:flex;flex-direction:column;justify-content:center;align-items:center;gap:",
            ";@media ",
            "{display:none;}",
          ],
          (0, l.A)(4),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        eW = a.Ay.button.withConfig({
          displayName: "ProjectViews__Trigger",
          componentId: "sc-96c55b32-1",
        })(
          [
            "pointer-events:all;height:",
            ";width:",
            ";display:flex;align-items:center;justify-content:center;border-radius:",
            ";position:relative;pointer-events:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);svg{position:relative;z-index:2;path{stroke:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);}}&:hover{svg{path{stroke:var(--colour-off-black);}}.hint{opacity:1;transform:translateY(-50%) translateX(-4px);}}",
          ],
          (0, l.A)(34),
          (0, l.A)(34),
          (0, l.A)(4),
          (e) => (e.$isActive ? "none" : "auto"),
          (e) => {
            let { $isActive: t } = e;
            return t ? "var(--colour-off-black)" : "var(--colour-light-grey)";
          },
        ),
        eY = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectViews__TileBg",
          componentId: "sc-96c55b32-2",
        })(
          [
            "position:absolute;top:0;left:0;width:100%;height:100%;background-color:var(--colour-off-white);border-radius:",
            ";z-index:1;",
          ],
          (0, l.A)(4),
        ),
        eD = a.Ay.p.withConfig({
          displayName: "ProjectViews__Hint",
          componentId: "sc-96c55b32-3",
        })(
          [
            "font-size:",
            ";line-height:",
            ";color:var(--colour-mid-grey);position:absolute;top:50%;transform:translateY(-50%) translateX(0);right:calc(100% + 8px);opacity:0;pointer-events:none;transition:all var(--transition-speed-default) var(--transition-ease);",
          ],
          (0, l.A)(12),
          (0, l.A)(10),
        ),
        eG = (e) => {
          let { setProjectViewMode: t, projectViewMode: i } = e;
          return (0, n.jsxs)(ez, {
            children: [
              (0, n.jsxs)(eW, {
                $isActive: "list" === i,
                onClick: () => t("list"),
                children: [
                  (0, n.jsx)(eH, {}),
                  (0, n.jsx)(eD, { className: "hint", children: "List" }),
                  "list" === i && (0, n.jsx)(eY, { layoutId: "tile-bg" }),
                ],
              }),
              (0, n.jsxs)(eW, {
                $isActive: "grid" === i,
                onClick: () => t("grid"),
                children: [
                  (0, n.jsx)(eV, {}),
                  (0, n.jsx)(eD, { className: "hint", children: "Grid" }),
                  "grid" === i && (0, n.jsx)(eY, { layoutId: "tile-bg" }),
                ],
              }),
            ],
          });
        },
        eF = (0, a.Ay)(o.P.div).withConfig({
          displayName: "ProjectLayout__Layout",
          componentId: "sc-1a5bdca4-0",
        })(
          [
            "display:flex;justify-content:space-between;align-items:center;padding:0 ",
            ";pointer-events:",
            ";z-index:",
            ";@media ",
            "{align-items:flex-start;justify-content:flex-end;padding:",
            ";}",
          ],
          (0, l.A)(24),
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => (e.$isActive ? 2 : 1),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(12),
        ),
        eO = (e) => {
          let {
            activePage: t,
            projectViewMode: i,
            variants: a,
            setActivePage: r,
            setProjectViewMode: o,
            isActive: l,
          } = e;
          return (0, n.jsxs)(eF, {
            variants: a,
            initial: "hidden",
            animate: l ? "visible" : "hidden",
            $isActive: l,
            children: [
              (0, n.jsx)(eE, {
                setActivePage: r,
                activePage: t,
                useDarkMode: !1,
              }),
              (0, n.jsx)(eG, { setProjectViewMode: o, projectViewMode: i }),
            ],
          });
        },
        eX = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "10",
            viewBox: "0 0 14 10",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M9.59961 5.65019L12.995 7.91386C13.0439 7.94643 13.1008 7.96512 13.1595 7.96793C13.2183 7.97074 13.2766 7.95756 13.3285 7.92981C13.3803 7.90206 13.4236 7.86077 13.4539 7.81033C13.4841 7.7599 13.5001 7.70221 13.5001 7.64341V2.31514C13.5001 2.25795 13.485 2.20176 13.4564 2.15225C13.4278 2.10275 13.3866 2.06168 13.337 2.03319C13.2874 2.0047 13.2311 1.9898 13.174 1.98999C13.1168 1.99019 13.0606 2.00547 13.0112 2.03429L9.59961 4.02492",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M8.30098 1.09937H1.80016C1.0821 1.09937 0.5 1.68149 0.5 2.39958V7.60043C0.5 8.31852 1.0821 8.90064 1.80016 8.90064H8.30098C9.01904 8.90064 9.60114 8.31852 9.60114 7.60043V2.39958C9.60114 1.68149 9.01904 1.09937 8.30098 1.09937Z",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        eR = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M11.6666 0.999634H2.33333C1.59695 0.999634 1 1.59662 1 2.33304V11.6669C1 12.4033 1.59695 13.0003 2.33333 13.0003H11.6666C12.403 13.0003 12.9999 12.4033 12.9999 11.6669V2.33304C12.9999 1.59662 12.403 0.999634 11.6666 0.999634Z",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M5 5.99986C5.55228 5.99986 5.99999 5.55212 5.99999 4.99981C5.99999 4.4475 5.55228 3.99976 5 3.99976C4.44771 3.99976 4 4.4475 4 4.99981C4 5.55212 4.44771 5.99986 5 5.99986Z",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M13 9.27787L10.9426 7.36329C10.6926 7.13068 10.3535 7 9.99997 7C9.64642 7 9.30734 7.13068 9.0573 7.36329L3 13.0003",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        eZ = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M7 9.4V7",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M7 4.59998H7.006",
                stroke: "var(--colour-off-black)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        eU = a.Ay.div.withConfig({
          displayName: "PlayerViews__PlayerViewsWrapper",
          componentId: "sc-c23c1020-0",
        })(
          [
            "display:flex;flex-direction:column;justify-content:center;align-items:center;gap:",
            ";@media ",
            "{display:none;}",
          ],
          (0, l.A)(4),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        eq = a.Ay.button.withConfig({
          displayName: "PlayerViews__Trigger",
          componentId: "sc-c23c1020-1",
        })(
          [
            "pointer-events:all;height:",
            ";width:",
            ";display:flex;align-items:center;justify-content:center;border-radius:",
            ";position:relative;pointer-events:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);svg{position:relative;z-index:2;path{stroke:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);}}&:hover{svg{path{stroke:var(--colour-off-white);}}.hint{opacity:1;transform:translateY(-50%) translateX(-4px);}}",
          ],
          (0, l.A)(34),
          (0, l.A)(34),
          (0, l.A)(4),
          (e) => (e.$isActive ? "none" : "auto"),
          (e) => {
            let { $isActive: t } = e;
            return t ? "var(--colour-off-black)" : "var(--colour-off-white)";
          },
        ),
        eJ = (0, a.Ay)(o.P.div).withConfig({
          displayName: "PlayerViews__TileBg",
          componentId: "sc-c23c1020-2",
        })(
          [
            "position:absolute;top:0;left:0;width:100%;height:100%;background-color:var(--colour-off-white);border-radius:",
            ";z-index:1;",
          ],
          (0, l.A)(4),
        ),
        eK = a.Ay.p.withConfig({
          displayName: "PlayerViews__Hint",
          componentId: "sc-c23c1020-3",
        })(
          [
            "font-size:",
            ";line-height:",
            ";color:var(--colour-off-white);position:absolute;top:50%;transform:translateY(-50%) translateX(0);right:calc(100% + 8px);opacity:0;pointer-events:none;transition:all var(--transition-speed-default) var(--transition-ease);",
          ],
          (0, l.A)(12),
          (0, l.A)(10),
        ),
        eQ = (e) => {
          let { setPlayerViewMode: t, playerViewMode: i } = e;
          return (0, n.jsxs)(eU, {
            children: [
              (0, n.jsxs)(eq, {
                $isActive: "video" === i,
                onClick: () => t("video"),
                children: [
                  (0, n.jsx)(eX, {}),
                  (0, n.jsx)(eK, { className: "hint", children: "Video" }),
                  "video" === i && (0, n.jsx)(eJ, { layoutId: "tile-bg" }),
                ],
              }),
              (0, n.jsxs)(eq, {
                $isActive: "gallery" === i,
                onClick: () => t("gallery"),
                children: [
                  (0, n.jsx)(eR, {}),
                  (0, n.jsx)(eK, { className: "hint", children: "Gallery" }),
                  "gallery" === i && (0, n.jsx)(eJ, { layoutId: "tile-bg" }),
                ],
              }),
              (0, n.jsxs)(eq, {
                $isActive: "info" === i,
                onClick: () => t("info"),
                children: [
                  (0, n.jsx)(eZ, {}),
                  (0, n.jsx)(eK, { className: "hint", children: "Info" }),
                  "info" === i && (0, n.jsx)(eJ, { layoutId: "tile-bg" }),
                ],
              }),
            ],
          });
        },
        e0 = (0, a.Ay)(o.P.div).withConfig({
          displayName: "PlayerLayout__Layout",
          componentId: "sc-baff057a-0",
        })(
          [
            "display:flex;justify-content:space-between;align-items:center;padding:0 ",
            ";pointer-events:",
            ";z-index:",
            ";@media ",
            "{align-items:flex-start;justify-content:flex-end;padding:",
            ";gap:",
            ";}",
          ],
          (0, l.A)(24),
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => (e.$isActive ? 2 : 1),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(12),
          (0, l.A)(8),
        ),
        e1 = (e) => {
          let {
            activePage: t,
            playerViewMode: i,
            variants: a,
            isActive: r,
            setPlayerViewMode: o,
            setActivePage: l,
          } = e;
          return (0, n.jsxs)(e0, {
            variants: a,
            initial: "hidden",
            animate: r ? "visible" : "hidden",
            $isActive: r,
            children: [
              (0, n.jsx)(eE, {
                setActivePage: l,
                activePage: t,
                useDarkMode: !0,
              }),
              (0, n.jsx)(eQ, { setPlayerViewMode: o, playerViewMode: i }),
            ],
          });
        },
        e3 = (0, a.Ay)(o.P.div).withConfig({
          displayName: "InfoLayout__Layout",
          componentId: "sc-906b99d5-0",
        })(
          [
            "display:flex;justify-content:flex-end;align-items:center;padding:0 ",
            ";pointer-events:",
            ";z-index:",
            ";@media ",
            "{align-items:flex-start;justify-content:flex-end;padding:",
            ";gap:",
            ";}",
          ],
          (0, l.A)(24),
          (e) => (e.$isActive ? "auto" : "none"),
          (e) => (e.$isActive ? 2 : 1),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(12),
          (0, l.A)(8),
        ),
        e2 = (e) => {
          let { setActivePage: t, activePage: i, variants: a, isActive: r } = e;
          return (0, n.jsx)(e3, {
            variants: a,
            initial: "hidden",
            animate: r ? "visible" : "hidden",
            $isActive: r,
            children: (0, n.jsx)(eE, {
              setActivePage: t,
              activePage: i,
              alignHintLeft: !0,
            }),
          });
        },
        e5 = a.Ay.header.withConfig({
          displayName: "Header__HeaderWrapper",
          componentId: "sc-d50b5efe-0",
        })(
          [
            "position:fixed;top:50%;transform:translateY(-50%);left:0;width:100%;z-index:100;pointer-events:none;& > div{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;height:100%;pointer-events:auto;}@media ",
            "{top:10px;transform:translateY(0);}",
          ],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        e9 = {
          hidden: {
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
          visible: {
            opacity: 1,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
        },
        e6 = (e) => {
          let {
              activePage: t,
              projectViewMode: i,
              playerViewMode: a,
              playerControlIsActive: r,
              setActivePage: o,
              setProjectViewMode: l,
              setPlayerViewMode: s,
            } = e,
            d = P();
          return (0, n.jsxs)(e5, {
            children: [
              (0, n.jsx)(eB, {
                playerViewMode: a,
                variants: e9,
                setActivePage: o,
                setPlayerViewMode: s,
                isActive: "home" === t,
              }),
              (0, n.jsx)(e2, {
                variants: e9,
                activePage: t,
                setActivePage: o,
                isActive: "information" === t,
              }),
              (0, n.jsx)(eO, {
                activePage: t,
                projectViewMode: i,
                variants: e9,
                setActivePage: o,
                setProjectViewMode: l,
                isActive: "projects" === t,
              }),
              (0, n.jsx)(e1, {
                activePage: t,
                playerViewMode: a,
                variants: e9,
                setActivePage: o,
                setPlayerViewMode: s,
                isActive:
                  ("player" === t && r) ||
                  (("mobile" === d || "tabletPortrait" === d) &&
                    "player" === t),
              }),
            ],
          });
        },
        e4 = (0, a.Ay)(o.P.div).withConfig({
          displayName: "Logo__LogoWrapper",
          componentId: "sc-91738493-0",
        })(
          [
            "position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:100;display:flex;justify-content:center;align-items:center;gap:",
            ";padding:",
            ";color:var(--colour-light-grey);opacity:",
            ";pointer-events:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);@media ",
            "{left:0;transform:translateX(0);padding:",
            " ",
            ";}@media ",
            "{opacity:1;}",
          ],
          (0, l.A)(4),
          (0, l.A)(16),
          (e) => {
            let { $isActive: t } = e;
            return +!!t;
          },
          (e) => {
            let { $isActive: t } = e;
            return t ? "auto" : "none";
          },
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(18),
          (0, l.A)(16),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        e7 = (0, a.Ay)(o.P.div).withConfig({
          displayName: "Logo__Cell",
          componentId: "sc-91738493-1",
        })([
          "*{color:var(--colour-light-grey);text-decoration:none;transition:all var(--transition-speed-default) var(--transition-ease);}&:hover{a{color:var(--colour-off-black);}}",
        ]),
        e8 = a.Ay.button.withConfig({
          displayName: "Logo__Button",
          componentId: "sc-91738493-2",
        })([
          "transition:all var(--transition-speed-default) var(--transition-ease);&:hover{color:var(--colour-off-black);}",
        ]),
        te = a.Ay.div.withConfig({
          displayName: "Logo__Spacer",
          componentId: "sc-91738493-3",
        })([""]),
        tt = (0, a.Ay)(o.P.div).withConfig({
          displayName: "Logo__InfoContainer",
          componentId: "sc-91738493-4",
        })(["display:flex;align-items:center;gap:", ";"], (0, l.A)(4)),
        ti = (e) => {
          let {
              name: t,
              email: i,
              instagramUrl: a,
              instagramHandle: r,
              timezone: o,
              activePage: l,
              playerViewMode: s,
              setActivePage: p,
            } = e,
            [u, h] = (0, c.useState)(!1),
            f = P(),
            v = "mobile" === f || "tabletPortrait" === f;
          return (0, n.jsx)(e4, {
            className: "type-p",
            onMouseOver: () => {
              v || h(!0);
            },
            onMouseOut: () => {
              v || h(!1);
            },
            $isActive: "player" !== l && "showreel" !== s && "projects" !== l,
            children: (0, n.jsxs)(D.N, {
              initial: !1,
              children: [
                (0, n.jsx)(
                  e7,
                  {
                    layout: !0,
                    children: (0, n.jsx)(e8, {
                      onClick: () => p("home"),
                      children: t || "Abe Wynen",
                    }),
                  },
                  "logo",
                ),
                u &&
                  (0, n.jsxs)(
                    tt,
                    {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 },
                      transition: { duration: 0.3, ease: "easeInOut" },
                      layout: !0,
                      children: [
                        (0, n.jsx)(te, { children: "—" }),
                        i &&
                          (0, n.jsx)(
                            e7,
                            {
                              children: (0, n.jsx)(d(), {
                                href: "mailto:".concat(i),
                                children: i,
                              }),
                            },
                            "email",
                          ),
                        (0, n.jsx)(te, { children: "—" }),
                        a &&
                          (0, n.jsx)(
                            e7,
                            {
                              children: (0, n.jsx)(d(), {
                                href: a,
                                target: "_blank",
                                children: r,
                              }),
                            },
                            "instagram",
                          ),
                        (0, n.jsx)(te, { children: "—" }),
                        (0, n.jsx)(
                          e7,
                          { children: (0, n.jsx)(m, { timezone: o }) },
                          "timezone",
                        ),
                      ],
                    },
                    "info-container",
                  ),
              ],
            }),
          });
        },
        tn = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M9.59961 5.05005C9.92741 5.48704 10.1398 5.99963 10.217 6.54041",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M11.7852 2.86365C12.6164 3.69447 13.1781 4.75644 13.3971 5.91115C13.6161 7.06587 13.4822 8.25977 13.0129 9.33728",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M0.5 0.500366L13.4986 13.4996",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M3.74966 3.75024L3.36815 4.13177C3.28327 4.21716 3.18229 4.28486 3.07106 4.33094C2.95983 4.37702 2.84056 4.40056 2.72016 4.40021H1.14993C0.977559 4.40021 0.812246 4.46869 0.69036 4.59058C0.568475 4.71247 0.5 4.87779 0.5 5.05017V8.94995C0.5 9.12233 0.568475 9.28765 0.69036 9.40954C0.812246 9.53143 0.977559 9.59991 1.14993 9.59991H2.72016C2.84056 9.59956 2.95983 9.62311 3.07106 9.66918C3.18229 9.71526 3.28327 9.78296 3.36815 9.86835L5.56686 12.0678C5.63095 12.132 5.71265 12.1758 5.80161 12.1935C5.89058 12.2112 5.98281 12.2022 6.06661 12.1674C6.15041 12.1327 6.22202 12.0739 6.27236 11.9984C6.3227 11.9229 6.34951 11.8342 6.34938 11.7435V6.3501",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M5.58789 1.91208C5.65021 1.84952 5.7297 1.80687 5.81629 1.78955C5.90287 1.77222 5.99265 1.781 6.07424 1.81477C6.15583 1.84853 6.22556 1.90577 6.27458 1.97921C6.32361 2.05266 6.34972 2.13901 6.34961 2.22731V2.67319",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        ta = () =>
          (0, n.jsxs)("svg", {
            width: "14",
            height: "12",
            viewBox: "0 0 14 12",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              (0, n.jsx)("path", {
                d: "M6.35035 1.25545C6.35022 1.16491 6.32327 1.07644 6.27291 1.0012C6.22254 0.925963 6.15102 0.867328 6.06736 0.832698C5.9837 0.798068 5.89166 0.788993 5.80285 0.806621C5.71404 0.824249 5.63244 0.867788 5.56835 0.931744L3.36862 3.13076C3.28373 3.21616 3.18273 3.28386 3.07148 3.32995C2.96024 3.37603 2.84095 3.39958 2.72053 3.39922H1.15004C0.977638 3.39922 0.812298 3.46771 0.690392 3.58961C0.568486 3.71151 0.5 3.87685 0.5 4.04924V7.94937C0.5 8.12176 0.568486 8.2871 0.690392 8.409C0.812298 8.5309 0.977638 8.59939 1.15004 8.59939H2.72053C2.84095 8.59904 2.96024 8.62258 3.07148 8.66867C3.18273 8.71475 3.28373 8.78245 3.36862 8.86785L5.5677 11.0675C5.6318 11.1317 5.71351 11.1755 5.80249 11.1932C5.89147 11.211 5.98372 11.2019 6.06753 11.1671C6.15135 11.1324 6.22297 11.0736 6.27332 10.9981C6.32367 10.9226 6.35048 10.8339 6.35035 10.7432V1.25545Z",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M9.60156 4.04919C10.0235 4.61177 10.2516 5.29603 10.2516 5.99926C10.2516 6.70248 10.0235 7.38674 9.60156 7.94932",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
              (0, n.jsx)("path", {
                d: "M11.7871 10.136C12.3304 9.59277 12.7613 8.94785 13.0553 8.23807C13.3493 7.52828 13.5007 6.76754 13.5007 5.99928C13.5007 5.23102 13.3493 4.47028 13.0553 3.76049C12.7613 3.05071 12.3304 2.40579 11.7871 1.86255",
                stroke: "var(--colour-off-white)",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ],
          }),
        tr = a.Ay.button.withConfig({
          displayName: "MuteTrigger__MuteTriggerWrapper",
          componentId: "sc-ce7c483d-0",
        })(
          [
            "height:",
            ";width:",
            ";display:flex;align-items:center;justify-content:center;border-radius:",
            ";transition:all var(--transition-speed-default) var(--transition-ease);& > div{display:flex;align-items:center;justify-content:center;}svg{path{transition:all var(--transition-speed-default) var(--transition-ease);}}&:hover{background:var(--colour-off-white);svg{path{stroke:var(--colour-off-black);}}}",
          ],
          (0, l.A)(40),
          (0, l.A)(40),
          (0, l.A)(4),
        ),
        to = (e) => {
          let { setIsMuted: t, isMuted: i } = e;
          return (0, n.jsx)(tr, {
            onClick: () => t(!i),
            children: (0, n.jsx)(D.N, {
              mode: "wait",
              children: i
                ? (0, n.jsx)(
                    o.P.div,
                    {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 },
                      transition: { duration: 0.2 },
                      children: (0, n.jsx)(tn, {}),
                    },
                    "muted-icon",
                  )
                : (0, n.jsx)(
                    o.P.div,
                    {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 },
                      transition: { duration: 0.2 },
                      children: (0, n.jsx)(ta, {}),
                    },
                    "unmuted-icon",
                  ),
            }),
          });
        },
        tl = a.Ay.div.withConfig({
          displayName: "SeekBar__SeekBarWrapper",
          componentId: "sc-641009b7-0",
        })(["flex:1;width:200px;height:100%;display:flex;align-items:center;"]),
        ts = a.Ay.div.withConfig({
          displayName: "SeekBar__SeekBarInner",
          componentId: "sc-641009b7-1",
        })(["position:relative;width:200px;height:15px;cursor:pointer;"]),
        td = a.Ay.div.withConfig({
          displayName: "SeekBar__FullBar",
          componentId: "sc-641009b7-2",
        })([
          "position:absolute;top:50%;left:0;transform:translateY(-50%);z-index:1;background:var(--colour-white);opacity:0.5;width:100%;height:1px;",
        ]),
        tc = a.Ay.div.withConfig({
          displayName: "SeekBar__CurrentTimeBar",
          componentId: "sc-641009b7-3",
        })([
          "position:absolute;top:50%;left:0;transform:translateY(-50%);z-index:2;background:var(--colour-white);height:3px;position:relative;will-change:width;transition:width 600ms linear;",
        ]),
        tp = (e) => {
          let { currentTime: t, videoLength: i, handleSeek: a } = e;
          return (0, n.jsx)(tl, {
            children: (0, n.jsxs)(ts, {
              onClick: (e) => {
                let t = e.currentTarget,
                  n = e.clientX - t.getBoundingClientRect().left;
                a(i ? (n / t.clientWidth) * i : 0);
              },
              children: [
                (0, n.jsx)(td, {}),
                (0, n.jsx)(tc, {
                  style: { width: "".concat(i ? (t / i) * 100 : 0, "%") },
                }),
              ],
            }),
          });
        },
        tu = a.Ay.div.withConfig({
          displayName: "TimeDisplay__TimeDisplayWrapper",
          componentId: "sc-674fd13-0",
        })(
          [
            "display:flex;align-items:center;justify-content:center;column-gap:",
            ";padding:0 ",
            ";@media ",
            "{display:none;}span{font-family:var(--font-pressura-mono);font-size:",
            ";line-height:1;font-weight:400;text-transform:uppercase;min-width:35px;text-align:center;}",
          ],
          (0, l.A)(4),
          (0, l.A)(12),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
          (0, l.A)(11),
        ),
        tm = (e) => {
          let { currentTime: t } = e,
            [i, a] = (0, c.useState)("00:00");
          return (
            (0, c.useEffect)(() => {
              a(
                ((e) => {
                  let t = Math.floor(e / 60)
                      .toString()
                      .padStart(2, "0"),
                    i = Math.floor(e % 60)
                      .toString()
                      .padStart(2, "0");
                  return "".concat(t, ":").concat(i);
                })(Math.floor(t)),
              );
            }, [t]),
            (0, n.jsx)(tu, {
              children: (0, n.jsx)("span", {
                className: "type-small",
                children: i,
              }),
            })
          );
        },
        th = a.Ay.div.withConfig({
          displayName: "ControlsPanel__ControlsPanelWrapper",
          componentId: "sc-cab2e7fe-0",
        })(
          [
            "height:100%;margin:0 auto;flex:1;display:flex;justify-content:center;align-items:center;gap:",
            ";",
          ],
          (0, l.A)(8),
        ),
        tf = (e) => {
          let {
            isMuted: t,
            currentTime: i,
            videoLength: a,
            setIsMuted: r,
            handleSeek: o,
          } = e;
          return (0, n.jsxs)(th, {
            children: [
              (0, n.jsx)(to, { setIsMuted: r, isMuted: t }),
              (0, n.jsx)(tp, { videoLength: a, currentTime: i, handleSeek: o }),
              (0, n.jsx)(tm, { currentTime: i }),
            ],
          });
        },
        tv = (0, a.Ay)(o.P.div).withConfig({
          displayName: "PlayerControls__PlayerControlsWrapper",
          componentId: "sc-863e1c60-0",
        })(
          [
            "position:absolute;bottom:40px;left:50%;transform:translate(-50%,-50%);z-index:4;color:var(--colour-white);@media ",
            "{bottom:50%;transform:translate(-50%,50%);}",
          ],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        ty = (0, a.Ay)(o.P.div).withConfig({
          displayName: "PlayerControls__Inner",
          componentId: "sc-863e1c60-1",
        })(
          [
            "height:100%;display:flex;position:relative;justify-content:center;padding:",
            ";background:rgba(253,253,253,0.05);border:1px solid rgba(253,253,253,0.1);backdrop-filter:blur(10px);border-radius:",
            ";",
          ],
          (0, l.A)(4),
          (0, l.A)(4),
        ),
        tg = {
          hidden: {
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut", delay: 0 },
          },
          visible: {
            opacity: 1,
            transition: { duration: 0.3, ease: "easeInOut", delay: 0.3 },
          },
        },
        tx = (e) => {
          let {
            isMuted: t,
            isPlaying: i,
            currentTime: a,
            videoLength: r,
            activePage: o,
            playerControlIsActive: l,
            playerViewMode: s,
            setIsMuted: d,
            setIsPlaying: p,
            handleSeek: u,
            setPlayerControlIsActive: m,
          } = e;
          return (
            (0, c.useEffect)(() => {
              let e;
              if ("player" !== o && "showreel" !== s) return void m(!1);
              let t = document.querySelector("body");
              if (!t) return;
              let i = () => {
                  t.classList.remove("hide-cursor"), m(!0);
                },
                n = () => {
                  e = setTimeout(() => {
                    t.classList.add("hide-cursor"), m(!1);
                  }, 2e3);
                };
              i(), n();
              let a = ew()(() => {
                clearTimeout(e), i(), n();
              }, 200);
              return (
                window.addEventListener("mousemove", a),
                window.addEventListener("touchstart", a),
                window.addEventListener("touchmove", a),
                () => {
                  window.removeEventListener("mousemove", a),
                    window.removeEventListener("touchstart", a),
                    window.removeEventListener("touchmove", a),
                    clearTimeout(e);
                }
              );
            }, [o, s]),
            (0, n.jsx)(D.N, {
              children:
                l &&
                (0, n.jsx)(
                  tv,
                  {
                    variants: tg,
                    initial: "hidden",
                    animate:
                      l && ("player" === o || "showreel" === s)
                        ? "visible"
                        : "hidden",
                    exit: "hidden",
                    children: (0, n.jsx)(ty, {
                      children: (0, n.jsx)(tf, {
                        isMuted: t,
                        isPlaying: i,
                        currentTime: a,
                        videoLength: r,
                        setIsMuted: d,
                        setIsPlaying: p,
                        handleSeek: u,
                      }),
                    }),
                  },
                  "controls-wrapper",
                ),
            })
          );
        },
        tw = a.Ay.div.withConfig({
          displayName: "ShowreelHint__ShowreelHintWrapper",
          componentId: "sc-abb7e5ff-0",
        })(
          [
            "position:absolute;bottom:calc(100% + 16px);left:50%;transform:translateX(-50%);color:var(--colour-light-grey);display:flex;flex-direction:column;align-items:center;opacity:",
            " !important;text-align:center;mix-blend-mode:difference;transition:all 0.3s ease;@media ",
            "{display:none;}",
          ],
          (e) => (e.$isActive ? (e.$showInitial, 0.3) : 0),
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        tj = a.Ay.div.withConfig({
          displayName: "ShowreelHint__Line",
          componentId: "sc-abb7e5ff-1",
        })(
          [
            "width:",
            ";height:",
            ";background:var(--colour-black);border-radius:",
            ";margin-top:",
            ";",
          ],
          (0, l.A)(80),
          (0, l.A)(2),
          (0, l.A)(2),
          (0, l.A)(4),
        ),
        tb = (e) => {
          let { isActive: t } = e,
            [i, a] = (0, c.useState)(!0);
          return (
            (0, c.useEffect)(() => {
              let e = setTimeout(() => {
                a(!1);
              }, 5e3);
              return () => clearTimeout(e);
            }, []),
            (0, n.jsx)(tw, {
              className: "type-small showreel-hint",
              $isActive: t,
              $showInitial: i,
              children: (0, n.jsx)(tj, {}),
            })
          );
        },
        tA = a.Ay.section.withConfig({
          displayName: "Player__PlayerWrapper",
          componentId: "sc-17003941-0",
        })(
          [
            "position:absolute;display:flex;align-items:center;justify-content:center;width:100vw;height:100%;transform:",
            ";top:0;z-index:10;will-change:transform;transition:all 1000ms var(--transition-ease);transition-delay:",
            ";@media ",
            "{bottom:",
            ";top:unset;transform:",
            ";height:unset;}mux-player{width:100%;height:100%;object-fit:cover;aspect-ratio:16 / 9;position:relative;z-index:1;border-radius:",
            "px;overflow:hidden;transition:border-radius 1000ms var(--transition-ease);@media ",
            "{border-radius:0;}}",
          ],
          (e) => {
            let { $usePlayer: t, $projectViewMode: i, $activePage: n } = e;
            return t
              ? "translateY(0)"
              : "home" === n || ("projects" === n && "list" === i)
                ? "translateY(calc(100vh - 64px))"
                : "translateY(100vh)";
          },
          (e) => {
            let { $useDelay: t, $projectViewMode: i, $activePage: n } = e;
            return (t && "grid" === i) || "list" === i || "home" === n
              ? "300ms"
              : "0ms";
          },
          (e) => e.theme.mediaBreakpoints.mobile,
          (e) =>
            "information" === e.$activePage
              ? "-50%"
              : e.$usePlayer
                ? "50%"
                : "0",
          (e) => (e.$usePlayer ? "translateY(50%)" : "translateY(0)"),
          (e) => 10 * !e.$usePlayer,
          (e) => e.theme.mediaBreakpoints.mobile,
        ),
        tC = a.Ay.div.withConfig({
          displayName: "Player__Inner",
          componentId: "sc-17003941-1",
        })(
          [
            "width:",
            ";height:100%;position:absolute;top:0;transform:translateY(0);will-change:transform,width;cursor:",
            ";pointer-events:",
            ";transition:all 1000ms var(--transition-ease);transition-delay:",
            ";.player-motion-wrapper{height:100%;display:flex;justify-content:center;align-items:flex-start;@media ",
            "{align-items:flex-end;}}@media ",
            "{position:relative;top:unset;bottom:unset;transform:translateY(0);width:100vw;}&:hover{transform:",
            ";@media ",
            "{transform:translateY(0);}.showreel-hint{opacity:",
            " !important;animation:bounce 0.5s ease-in-out;@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(3px);}}}}",
          ],
          (e) => (e.$usePlayer ? "100vw" : "80vw"),
          (e) => (e.$isClickable ? "pointer" : "default"),
          (e) => (e.$isTransitioning ? "none" : "auto"),
          (e) => {
            let { $useDelay: t } = e;
            return t ? "300ms" : "0ms";
          },
          (e) => e.theme.mediaBreakpoints.mobile,
          (e) => e.theme.mediaBreakpoints.mobile,
          (e) => e.$usePeek && "translateY(-32px)",
          (e) => e.theme.mediaBreakpoints.mobile,
          (e) => 0.5 * !e.$usePlayer,
        ),
        tk = a.Ay.div.withConfig({
          displayName: "Player__Backdrop",
          componentId: "sc-17003941-2",
        })(
          [
            "filter:brightness(",
            ");position:relative;width:100%;transform:translateY( ",
            " );transition:transform 1000ms var(--transition-ease),filter 500ms var(--transition-ease);@media ",
            "{display:flex;align-items:flex-end;transform:none;}",
          ],
          (e) => {
            let { $isActive: t } = e;
            return t ? 0.2 : 1;
          },
          (e) => (e.$usePlayer ? "calc(50vh - 50%)" : "0px"),
          (e) => e.theme.mediaBreakpoints.mobile,
        ),
        tP = a.Ay.canvas.withConfig({
          displayName: "Player__AmbientCanvas",
          componentId: "sc-17003941-3",
        })(
          [
            "position:absolute;top:0;left:0;width:100%;height:100%;filter:blur(",
            "px) saturate(1.5);z-index:0;transform:scale(",
            ") translateZ(0);-webkit-transform:scale(",
            ") translateZ(0);opacity:",
            ";",
            " @media ",
            "{filter:blur(35px);}transition:opacity 1000ms var(--transition-ease),filter 1000ms var(--transition-ease),transform 1000ms var(--transition-ease);",
          ],
          (e) => e.$blur,
          (e) => e.$spread,
          (e) => e.$spread,
          (e) => e.$opacity,
          (e) =>
            e.$isSafari &&
            "\n    will-change: transform, opacity;\n    backface-visibility: hidden;\n    -webkit-backface-visibility: hidden;\n  ",
          (e) => e.theme.mediaBreakpoints.mobile,
        ),
        t_ = (e) => {
          var t, i, a, r, l, s, d, p;
          let {
              showreel: u,
              blur: m = 100,
              spread: h = 1,
              activeProject: f,
              activePage: v,
              playerViewMode: y,
              playerControlIsActive: g,
              projectViewMode: x,
              setActivePage: w,
              setPlayerControlIsActive: j,
              setPlayerViewMode: b,
            } = e,
            A = (0, c.useRef)(null),
            [C, k] = (0, c.useState)(!0),
            [_, I] = (0, c.useState)(!0),
            [N, L] = (0, c.useState)(0),
            [M, S] = (0, c.useState)(!1),
            [$, E] = (0, c.useState)(
              f
                ? null == f ||
                  null == (a = f.video) ||
                  null == (i = a.asset) ||
                  null == (t = i.data)
                  ? void 0
                  : t.duration
                : null == u || null == (l = u.asset) || null == (r = l.data)
                  ? void 0
                  : r.duration,
            ),
            [T, B] = (0, c.useState)(null),
            H = (0, c.useRef)(0);
          (0, c.useRef)(0);
          let V = (0, c.useRef)(null);
          (0, c.useEffect)(() => {
            "player" !== v && k(!0);
          }, [v, y]),
            (0, c.useEffect)(() => {
              var e, t, i, n, a;
              f
                ? E(
                    null == f ||
                      null == (i = f.video) ||
                      null == (t = i.asset) ||
                      null == (e = t.data)
                      ? void 0
                      : e.duration,
                  )
                : u
                  ? E(
                      null == u || null == (a = u.asset) || null == (n = a.data)
                        ? void 0
                        : n.duration,
                    )
                  : E(0);
            }, [f, u]),
            (0, c.useEffect)(() => {
              T && (C ? (T.muted = !0) : (T.muted = !1));
            }, [C, T]),
            (0, c.useEffect)(() => {
              if (!T) return;
              let e = setTimeout(() => {
                T.muted = C;
              }, 100);
              return () => clearTimeout(e);
            }, [f, T, C]);
          let W =
            (null == f || null == (d = f.video) || null == (s = d.asset)
              ? void 0
              : s.playbackId) ||
            (null == u || null == (p = u.asset) ? void 0 : p.playbackId) ||
            null;
          (0, c.useEffect)(() => {
            var e;
            let t, i, n;
            if (!T || !A.current) return;
            let a = A.current,
              r = a.getContext("2d");
            if (!r) return;
            let o = null,
              l = !1,
              s = -1,
              d = /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
              c = new Image();
            (c.crossOrigin = "anonymous"),
              T.playbackId &&
                (c.src = "https://image.mux.com/".concat(
                  T.playbackId,
                  "/thumbnail.jpg?time=1",
                ));
            let p = 320,
              u = 180,
              m = () => {
                if (!l && o) {
                  try {
                    if (
                      o.readyState < 2 ||
                      0 === o.videoWidth ||
                      0 === o.videoHeight
                    )
                      return;
                    let e = o.currentTime;
                    if (!d && s === e && o.paused) return;
                    l = !0;
                    let t = a.getBoundingClientRect();
                    if (
                      t.width > 0 &&
                      t.height > 0 &&
                      a.width > 0 &&
                      a.height > 0 &&
                      (d && 0.05 > Math.random()
                        ? (r.save(),
                          r.setTransform(1, 0, 0, 1, 0, 0),
                          r.clearRect(0, 0, a.width, a.height),
                          r.restore())
                        : r.clearRect(0, 0, p, u),
                      r.drawImage(o, 0, 0, p, u),
                      (s = e),
                      d)
                    ) {
                      let e = a.style.transform || "translateZ(0)";
                      (a.style.transform = e.includes("0.001px")
                        ? "translateZ(0)"
                        : "translateZ(0.001px)"),
                        a.offsetHeight;
                      let t = a.style.willChange;
                      a.style.willChange =
                        "transform" === t ? "transform, opacity" : "transform";
                    }
                  } catch (e) {
                    console.warn(
                      "Canvas paint error (Safari compatibility):",
                      e,
                    );
                  } finally {
                    l = !1;
                  }
                  !d &&
                    (!o ||
                      o.paused ||
                      o.ended ||
                      (t = requestAnimationFrame(m)));
                }
              },
              h = () => {
                if (o && o.videoWidth > 0 && o.videoHeight > 0) {
                  (p = Math.max(1, o.videoWidth / 8)),
                    (u = Math.max(1, o.videoHeight / 8)),
                    (a.width = p),
                    (a.height = u),
                    d &&
                      ((a.style.willChange = "transform, opacity"),
                      (a.style.transform = "translateZ(0)"));
                  try {
                    c.complete &&
                      c.naturalWidth > 0 &&
                      r.drawImage(c, 0, 0, p, u);
                  } catch (e) {
                    console.warn("Poster draw error:", e);
                  }
                }
              },
              f = () => {
                try {
                  c.naturalWidth > 0 &&
                    c.naturalHeight > 0 &&
                    r.drawImage(c, 0, 0, p, u);
                } catch (e) {
                  console.warn("Poster load error:", e);
                }
              },
              v = () => {
                n && (clearInterval(n), (n = void 0));
              },
              y = () => {
                (s = -1),
                  d
                    ? d &&
                      !n &&
                      (n = window.setInterval(() => {
                        if (
                          o &&
                          !o.ended &&
                          o.readyState >= 2 &&
                          (m(), d && 0.1 > Math.random())
                        ) {
                          let e = a.style.transform || "translateZ(0)";
                          a.style.transform = e.includes("0.002px")
                            ? "translateZ(0)"
                            : "translateZ(0.002px)";
                        }
                      }, 100))
                    : m();
              },
              g = () => {
                t && (cancelAnimationFrame(t), (t = void 0)), d && v();
              },
              x = () => {
                if (d && o && !o.ended) {
                  m();
                  let e = a.style.marginTop || "0px";
                  a.style.marginTop = "0px" === e ? "0.001px" : "0px";
                }
              },
              w = () => {
                let e = () => {
                  var e;
                  return null == (e = T.media) ? void 0 : e.nativeEl;
                };
                if (!(o = e()))
                  return void setTimeout(() => {
                    (o = e()) && j();
                  }, 100);
                j();
              },
              j = () => {
                o &&
                  (c.addEventListener("load", f),
                  c.addEventListener("error", () =>
                    console.warn("Poster load failed"),
                  ),
                  o.addEventListener("loadedmetadata", h),
                  o.addEventListener("play", y),
                  o.addEventListener("playing", y),
                  o.addEventListener("pause", g),
                  o.addEventListener("ended", g),
                  d && o.addEventListener("timeupdate", x),
                  o.readyState >= 1 && h(),
                  !o.paused && o.readyState >= 2 && y());
              };
            return (
              (null == (e = T.media) ? void 0 : e.nativeEl)
                ? w()
                : T.addEventListener(
                    "playerready",
                    () => {
                      setTimeout(w, 50);
                    },
                    { once: !0 },
                  ),
              () => {
                (l = !1),
                  t && cancelAnimationFrame(t),
                  i &&
                    o &&
                    "cancelVideoFrameCallback" in HTMLVideoElement.prototype &&
                    o.cancelVideoFrameCallback(i),
                  v(),
                  o &&
                    (c.removeEventListener("load", f),
                    o.removeEventListener("loadedmetadata", h),
                    o.removeEventListener("play", y),
                    o.removeEventListener("playing", y),
                    o.removeEventListener("pause", g),
                    o.removeEventListener("ended", g),
                    d && o.removeEventListener("timeupdate", x)),
                  V.current && clearInterval(V.current);
              }
            );
          }, [T, W]);
          let Y = "mobile" === P();
          return (0, n.jsxs)(tA, {
            $usePlayer: "player" === v || "showreel" === y,
            $useDelay: "grid" === x && "player" === v,
            $hideOnMobile: "information" === v,
            $projectViewMode: x,
            $activePage: v,
            children: [
              (0, n.jsxs)(tC, {
                $usePeek:
                  ("projects" === v && "list" === x) ||
                  ("home" === v && "showreel" !== y),
                $usePlayer: "player" === v || "showreel" === y,
                onClick: () => {
                  S(!0),
                    "projects" === v
                      ? w("player")
                      : "home" === v && b("showreel"),
                    setTimeout(() => {
                      S(!1);
                    }, 1500);
                },
                onWheel: (e) => {
                  !Y &&
                    e.deltaY < -50 &&
                    (S(!0),
                    "projects" === v
                      ? w("player")
                      : "home" === v && b("showreel"),
                    setTimeout(() => {
                      S(!1);
                    }, 1500));
                },
                onTouchStart: (e) => {
                  let t = e.touches[0].clientY;
                  document.addEventListener(
                    "touchend",
                    (e) => {
                      t - e.changedTouches[0].clientY > 50 &&
                        (S(!0),
                        "projects" === v
                          ? w("player")
                          : "home" === v && b("showreel"),
                        setTimeout(() => {
                          S(!1);
                        }, 1500));
                    },
                    { once: !0 },
                  );
                },
                $isClickable: "projects" === v || "home" === v,
                $useDelay: "grid" === x && "player" === v,
                $isTransitioning: M,
                children: [
                  (0, n.jsx)(
                    o.P.div,
                    {
                      initial: { opacity: 0, pointerEvents: "none" },
                      animate: { opacity: 1, pointerEvents: "auto" },
                      exit: { opacity: 0, pointerEvents: "none" },
                      transition: { duration: 1 },
                      className: "player-motion-wrapper",
                      children: (0, n.jsxs)(tk, {
                        $isActive: g && "player" === v,
                        $usePlayer: "player" === v || "showreel" === y,
                        children: [
                          (0, n.jsx)(tP, {
                            ref: A,
                            width: "320",
                            height: "180",
                            $blur: m,
                            $spread: h,
                            $opacity: +(
                              "player" !== v &&
                              "grid" !== x &&
                              "showreel" !== y
                            ),
                            $isSafari: /^((?!chrome|android).)*safari/i.test(
                              navigator.userAgent,
                            ),
                          }),
                          W &&
                            (0, n.jsx)(z.Ay, {
                              ref: B,
                              streamType: "on-demand",
                              playbackId: W,
                              autoPlay: !0,
                              loop: !0,
                              thumbnailTime: 1,
                              preload: "auto",
                              muted: C,
                              playsInline: !0,
                              onTimeUpdate: (e) => {
                                let t = e.target.currentTime;
                                Math.abs(t - H.current) > 0.01 &&
                                  (L(t), (H.current = t));
                              },
                            }),
                        ],
                      }),
                    },
                    W,
                  ),
                  (0, n.jsx)(tb, {
                    isActive:
                      "showreel" !== y &&
                      "player" !== v &&
                      "information" !== v &&
                      "grid" !== x,
                  }),
                ],
              }),
              (0, n.jsx)(tx, {
                isMuted: C,
                isPlaying: _,
                currentTime: N,
                videoLength: $,
                playerControlIsActive: g,
                activePage: v,
                playerViewMode: y,
                setIsMuted: k,
                setIsPlaying: I,
                handleSeek: (e) => {
                  T && ((T.currentTime = e), L(e));
                },
                setPlayerControlIsActive: j,
              }),
            ],
          });
        };
      var tI = i(4685);
      let tN = (0, a.Ay)(o.P.section).withConfig({
          displayName: "Gallery__GalleryWrapper",
          componentId: "sc-f56d33c2-0",
        })(
          [
            "position:fixed;top:0;left:0;width:100%;height:100vh;background:var(--colour-black);padding:25vh 0;overflow:auto;pointer-events:",
            ";z-index:50;.layout-wrapper{width:100%;}.layout-grid{grid-row-gap:",
            ";}",
          ],
          (e) => (e.$isActive ? "auto" : "none"),
          (0, l.A)(24),
        ),
        tL = a.Ay.div.withConfig({
          displayName: "Gallery__ImageWrapper",
          componentId: "sc-f56d33c2-1",
        })(
          ["grid-column:4 / -4;width:100%;@media ", "{grid-column:1 / -1;}"],
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        tM = a.Ay.div.withConfig({
          displayName: "Gallery__Outer",
          componentId: "sc-f56d33c2-2",
        })(["position:relative;width:100%;padding-top:", "%;"], (e) => {
          let { $ratio: t } = e;
          return t;
        }),
        tS = a.Ay.div.withConfig({
          displayName: "Gallery__Inner",
          componentId: "sc-f56d33c2-3",
        })(["position:absolute;inset:0;width:100%;height:100%;"]),
        t$ = a.Ay.p.withConfig({
          displayName: "Gallery__NoGalleryText",
          componentId: "sc-f56d33c2-4",
        })([
          "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;text-align:center;color:var(--colour-white);",
        ]),
        tE = (e) => {
          let { isActive: t, gallery: i, galleryRatio: a, variants: r } = e;
          (0, c.useRef)(null);
          let o = i && i.length > 0;
          return (
            (0, c.useEffect)(() => {
              let e = document.querySelector(".projects-screen");
              e && (e.style.pointerEvents = t ? "none" : "auto");
            }, [t]),
            (0, n.jsx)(tN, {
              variants: r,
              initial: "hidden",
              animate: t ? "visible" : "hidden",
              $isActive: t,
              children: (0, n.jsx)(tI.A, {
                children: (0, n.jsxs)(V, {
                  children: [
                    o &&
                      i.map((e, t) => {
                        var i, r;
                        return (0, n.jsx)(
                          tL,
                          {
                            children:
                              (null == e || null == (i = e.asset)
                                ? void 0
                                : i.url) &&
                              (0, n.jsx)(tM, {
                                $ratio:
                                  (null == a || null == (r = a[0])
                                    ? void 0
                                    : r.value) || "56.25",
                                children: (0, n.jsx)(tS, {
                                  children: (0, n.jsx)(Y(), {
                                    src: e.asset.url,
                                    alt: "Gallery Image",
                                    priority: 0 === t,
                                    fill: !0,
                                    style: { objectFit: "cover" },
                                    sizes: "(max-width: 1024px) 90vw, 50vw",
                                  }),
                                }),
                              }),
                          },
                          t,
                        );
                      }),
                    !o && (0, n.jsx)(t$, { children: "N/A" }),
                  ],
                }),
              }),
            })
          );
        },
        tT = (0, a.Ay)(o.P.section).withConfig({
          displayName: "Info__InfoWrapper",
          componentId: "sc-e36a2a39-0",
        })(
          [
            "position:absolute;top:0;left:0;width:100%;height:100%;z-index:50;padding:25vh 0;overflow:hidden;background:var(--colour-black);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:",
            ";",
          ],
          (0, l.A)(24),
        ),
        tB = a.Ay.div.withConfig({
          displayName: "Info__ProjectInfo",
          componentId: "sc-e36a2a39-1",
        })([
          "display:flex;flex-direction:column;align-items:center;justify-content:center;",
        ]),
        tH = a.Ay.div.withConfig({
          displayName: "Info__CreditsInfo",
          componentId: "sc-e36a2a39-2",
        })([
          "display:flex;flex-direction:column;align-items:center;justify-content:center;",
        ]),
        tV = a.Ay.div.withConfig({
          displayName: "Info__Cell",
          componentId: "sc-e36a2a39-3",
        })(
          [
            "display:flex;gap:",
            ";a{text-decoration:underline;color:var(--colour-off-white);flex:1;width:",
            ";}",
          ],
          (0, l.A)(16),
          (0, l.A)(360),
        ),
        tz = a.Ay.p.withConfig({
          displayName: "Info__Role",
          componentId: "sc-e36a2a39-4",
        })(
          ["text-align:right;flex:1;color:var(--colour-off-white);width:", ";"],
          (0, l.A)(360),
        ),
        tW = a.Ay.p.withConfig({
          displayName: "Info__Title",
          componentId: "sc-e36a2a39-5",
        })(
          ["text-align:left;flex:1;color:var(--colour-off-white);width:", ";"],
          (0, l.A)(360),
        ),
        tY = (e) => {
          var t;
          let { isActive: i, activeProject: a } = e,
            r =
              a &&
              (null == a || null == (t = a.credits) ? void 0 : t.length) > 0;
          return (
            (0, c.useEffect)(() => {
              let e = document.querySelector(".projects-screen");
              e && (e.style.pointerEvents = i ? "none" : "auto");
            }, [i]),
            (0, n.jsx)(D.N, {
              children:
                i &&
                (0, n.jsxs)(
                  tT,
                  {
                    initial: { opacity: 0, pointerEvents: "none" },
                    animate: { opacity: 1, pointerEvents: "auto" },
                    exit: { opacity: 0, pointerEvents: "none" },
                    transition: { duration: 0.3 },
                    children: [
                      (0, n.jsxs)(tB, {
                        children: [
                          (null == a ? void 0 : a.client) &&
                            (0, n.jsxs)(tV, {
                              children: [
                                (0, n.jsx)(tz, {
                                  className: "type-small",
                                  children: "Client",
                                }),
                                (0, n.jsx)(tW, {
                                  className: "type-small",
                                  children: a.client,
                                }),
                              ],
                            }),
                          (null == a ? void 0 : a.title) &&
                            (0, n.jsxs)(tV, {
                              children: [
                                (0, n.jsx)(tz, {
                                  className: "type-small",
                                  children: "Title",
                                }),
                                (0, n.jsx)(tW, {
                                  className: "type-small",
                                  children: a.title,
                                }),
                              ],
                            }),
                          (null == a ? void 0 : a.year) &&
                            (0, n.jsxs)(tV, {
                              children: [
                                (0, n.jsx)(tz, {
                                  className: "type-small",
                                  children: "Year",
                                }),
                                (0, n.jsx)(tW, {
                                  className: "type-small",
                                  children: a.year,
                                }),
                              ],
                            }),
                          (null == a ? void 0 : a.type) &&
                            (0, n.jsxs)(tV, {
                              children: [
                                (0, n.jsx)(tz, {
                                  className: "type-small",
                                  children: "Type",
                                }),
                                (0, n.jsx)(tW, {
                                  className: "type-small",
                                  children:
                                    a.type.charAt(0).toUpperCase() +
                                    a.type.slice(1),
                                }),
                              ],
                            }),
                        ],
                      }),
                      r &&
                        (0, n.jsx)(tH, {
                          children:
                            null == a
                              ? void 0
                              : a.credits.map((e) =>
                                  e.link
                                    ? (0, n.jsxs)(
                                        tV,
                                        {
                                          children: [
                                            (0, n.jsx)(tz, {
                                              className: "type-small",
                                              children: e.role,
                                            }),
                                            (0, n.jsx)(d(), {
                                              href: e.link,
                                              target: "_blank",
                                              className: "type-small",
                                              children: e.title,
                                            }),
                                          ],
                                        },
                                        e.title,
                                      )
                                    : (0, n.jsxs)(
                                        tV,
                                        {
                                          children: [
                                            (0, n.jsx)(tz, {
                                              className: "type-small",
                                              children: e.role,
                                            }),
                                            (0, n.jsx)(tW, {
                                              className: "type-small",
                                              children: e.title,
                                            }),
                                          ],
                                        },
                                        e.title,
                                      ),
                                ),
                        }),
                    ],
                  },
                  "info-wrapper",
                ),
            })
          );
        },
        tD = a.Ay.div.withConfig({
          displayName: "pages__PageWrapper",
          componentId: "sc-5f03052d-0",
        })(
          [
            "height:100dvh;background:",
            ";transition:all 1500ms var(--transition-ease);@media ",
            "{overflow:hidden;}",
          ],
          (e) => {
            let { $usePlayer: t } = e;
            return t ? "var(--colour-black)" : "var(--colour-white)";
          },
          (e) => e.theme.mediaBreakpoints.tabletPortrait,
        ),
        tG = {
          hidden: {
            opacity: 0,
            transition: {
              duration: 0.5,
              filter: "blur(20px)",
              ease: "easeInOut",
            },
          },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.5,
              filter: "blur(0px)",
              ease: "easeInOut",
              delay: 0.3,
            },
          },
        };
      var tF = !0;
      let tO = (e) => {
        let { data: t, siteSettings: i, projects: a, information: o } = e,
          [l, s] = (0, c.useState)("home"),
          [d, p] = (0, c.useState)("list"),
          [u, m] = (0, c.useState)(null),
          [h, f] = (0, c.useState)("video"),
          [v, y] = (0, c.useState)(!1);
        return (
          (0, c.useEffect)(() => {
            "home" === l && (m(null), f("video")),
              "projects" === l && f("video");
          }, [l]),
          (0, c.useEffect)(() => {
            if ("home" !== l || "showreel" === h) return;
            let e = !1,
              t = () => {
                e || ((e = !0), f("showreel"), d());
              },
              i = (e) => {
                (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) && t();
              },
              n = 0,
              a = 0,
              r = (e) => {
                let t = e.touches && e.touches[0];
                t && ((n = t.clientY), (a = t.clientX));
              },
              o = (e) => {
                let i = e.touches && e.touches[0];
                if (!i) return;
                let r = Math.abs(i.clientY - n),
                  o = Math.abs(i.clientX - a);
                (r > 10 || o > 10) && t();
              },
              s = (e) => {
                new Set([
                  "ArrowDown",
                  "ArrowUp",
                  "ArrowLeft",
                  "ArrowRight",
                  "PageDown",
                  "PageUp",
                  "Home",
                  "End",
                  "Space",
                  " ",
                ]).has(e.key) && t();
              },
              d = () => {
                window.removeEventListener("wheel", i),
                  window.removeEventListener("touchstart", r),
                  window.removeEventListener("touchmove", o),
                  window.removeEventListener("keydown", s);
              };
            return (
              window.addEventListener("wheel", i, { passive: !0 }),
              window.addEventListener("touchstart", r, { passive: !0 }),
              window.addEventListener("touchmove", o, { passive: !0 }),
              window.addEventListener("keydown", s),
              () => {
                d();
              }
            );
          }, [l, h]),
          (0, n.jsxs)(tD, {
            $usePlayer: "player" === l || "showreel" === h,
            children: [
              (0, n.jsx)(r.bV, {
                title: (null == t ? void 0 : t.seoTitle) || "",
                description: (null == t ? void 0 : t.seoDescription) || "",
              }),
              (0, n.jsx)(ti, {
                name: null == i ? void 0 : i.name,
                email: null == i ? void 0 : i.email,
                instagramUrl: null == i ? void 0 : i.instagramUrl,
                instagramHandle: null == i ? void 0 : i.instagramHandle,
                timezone: null == i ? void 0 : i.timezone,
                activePage: l,
                setActivePage: s,
                playerViewMode: h,
              }),
              (0, n.jsx)(e6, {
                activePage: l,
                projectViewMode: d,
                playerViewMode: h,
                playerControlIsActive: v,
                setActivePage: s,
                setProjectViewMode: p,
                setPlayerViewMode: f,
              }),
              (0, n.jsx)(eI, {
                titleSuffix: null == t ? void 0 : t.titleSuffix,
                subTitle: null == t ? void 0 : t.subTitle,
                isPlayerMode: "showreel" === h,
                variants: tG,
                isActive: "home" === l,
              }),
              (0, n.jsx)(eg, {
                projects: a,
                activeProject: u,
                activePage: l,
                playerControlIsActive: v,
                projectViewMode: d,
                isActive: "projects" === l || "player" === l,
                variants: tG,
                playerViewMode: h,
                setActiveProject: m,
                setActivePage: s,
              }),
              (0, n.jsx)(C, {
                description: null == o ? void 0 : o.description,
                featuredLogos: null == o ? void 0 : o.featuredLogos,
                instagramUrl: null == i ? void 0 : i.instagramUrl,
                instagramHandle: null == i ? void 0 : i.instagramHandle,
                email: null == i ? void 0 : i.email,
                location: null == i ? void 0 : i.location,
                timezone: null == i ? void 0 : i.timezone,
                variants: tG,
                isActive: "information" === l,
              }),
              (0, n.jsx)(t_, {
                showreel: null == i ? void 0 : i.showreel,
                activeProject: u,
                activePage: l,
                playerControlIsActive: v,
                projectViewMode: d,
                playerViewMode: h,
                setActivePage: s,
                setPlayerControlIsActive: y,
                setPlayerViewMode: f,
              }),
              (0, n.jsx)(tE, {
                isActive: "gallery" === h && "player" === l,
                gallery: (null == u ? void 0 : u.gallery) || null,
                galleryRatio: (null == u ? void 0 : u.galleryRatio) || null,
                variants: tG,
              }),
              (0, n.jsx)(tY, {
                isActive: "info" === h && "player" === l,
                activeProject: u || null,
              }),
            ],
          })
        );
      };
    },
    9817: (e, t, i) => {
      "use strict";
      function n(e) {
        let { src: t, width: i, quality: n } = e,
          a = new URL(t);
        return "cdn.sanity.io" === a.hostname
          ? (a.searchParams.set("auto", "format"),
            a.searchParams.set("fit", "max"),
            a.searchParams.set("w", i.toString()),
            n && a.searchParams.set("q", n.toString()),
            a.toString())
          : "image.mux.com" === a.hostname
            ? (a.searchParams.has("width") &&
                a.searchParams.set("width", i.toString()),
              n && a.searchParams.set("quality", n.toString()),
              a.toString())
            : (console.warn(
                "Image Loader received an unsupported CDN URL: ".concat(t),
              ),
              t);
      }
      i.r(t), i.d(t, { default: () => n });
    },
  },
  (e) => {
    e.O(0, [888, 867, 886, 64, 636, 593, 792], () => e((e.s = 6760))),
      (_N_E = e.O());
  },
]);
