  class WD extends mp {
    static get type() {
      return "GaussianBlurNode";
    }
    constructor(e, t = null, s = 4, i = {}) {
      super("vec4"),
        (this.textureNode = e),
        (this.directionNode = t),
        (this.sigma = s),
        (this._invSize = ID(new hl())),
        (this._passDirection = ID(new hl())),
        (this._horizontalRT = new Ll(1, 1, { depthBuffer: !1 })),
        (this._horizontalRT.texture.name = "GaussianBlurNode.horizontal"),
        (this._verticalRT = new Ll(1, 1, { depthBuffer: !1 })),
        (this._verticalRT.texture.name = "GaussianBlurNode.vertical"),
        (this._textureNode = AD(this, this._verticalRT.texture)),
        (this._textureNode.uvNode = e.uvNode),
        (this.updateBeforeType = ip.FRAME),
        (this.resolutionScale = i.resolutionScale || 1),
        (this.premultipliedAlpha = i.premultipliedAlpha || !1);
    }
    setSize(e, t) {
      (e = Math.max(Math.round(e * this.resolutionScale), 1)),
        (t = Math.max(Math.round(t * this.resolutionScale), 1)),
        this._invSize.value.set(1 / e, 1 / t),
        this._horizontalRT.setSize(e, t),
        this._verticalRT.setSize(e, t);
    }
    updateBefore(e) {
      const { renderer: t } = e;
      jD = $A.resetRendererState(t, jD);
      const s = this.textureNode,
        i = s.value,
        r = s.value;
      ($D.material = this._material),
        this.setSize(i.image.width, i.image.height);
      const n = i.type;
      (this._horizontalRT.texture.type = n),
        (this._verticalRT.texture.type = n),
        t.setRenderTarget(this._horizontalRT),
        this._passDirection.value.set(1, 0),
        ($D.name = "Gaussian Blur [ Horizontal Pass ]"),
        $D.render(t),
        (s.value = this._horizontalRT.texture),
        t.setRenderTarget(this._verticalRT),
        this._passDirection.value.set(0, 1),
        ($D.name = "Gaussian Blur [ Vertical Pass ]"),
        $D.render(t),
        (s.value = r),
        $A.restoreRendererState(t, jD);
    }
    getTextureNode() {
      return this._textureNode;
    }
    setup(e) {
      const t = this.textureNode,
        s = OD(),
        i = UD(this.directionNode || 1);
      let r, n;
      this.premultipliedAlpha
        ? ((r = (e) => RD(t.sample(e))), (n = (e) => DD(e)))
        : ((r = (e) => t.sample(e)), (n = (e) => e));
      const o = gD(() => {
          const e = 3 + 2 * this.sigma,
            t = this._getCoefficients(e),
            o = this._invSize,
            a = i.mul(this._passDirection),
            l = GD(r(s).mul(t[0])).toVar();
          for (let i = 1; i < e; i++) {
            const e = vD(i),
              n = vD(t[i]),
              u = UD(a.mul(o.mul(e))).toVar(),
              h = r(s.add(u)),
              c = r(s.sub(u));
            l.addAssign(h.add(c).mul(n));
          }
          return n(l);
        }),
        a = this._material || (this._material = new jw());
      (a.fragmentNode = o().context(e.getSharedContext())),
        (a.name = "Gaussian_blur"),
        (a.needsUpdate = !0);
      return (e.getNodeProperties(this).textureNode = t), this._textureNode;
    }
    dispose() {
      this._horizontalRT.dispose(), this._verticalRT.dispose();
    }
    _getCoefficients(e) {
      const t = [],
        s = e / 3;
      for (let i = 0; i < e; i++)
        t.push((0.39894 * Math.exp((-0.5 * i * i) / (s * s))) / s);
      return t;
    }
    get resolution() {
      return (
        console.warn(
          'THREE.GaussianBlurNode: The "resolution" property has been renamed to "resolutionScale" and is now of type `number`.',
        ),
        new hl(this.resolutionScale, this.resolutionScale)
      );
    }
    set resolution(e) {
      console.warn(
        'THREE.GaussianBlurNode: The "resolution" property has been renamed to "resolutionScale" and is now of type `number`.',
      ),
        (this.resolutionScale = e.x);
    }
  }
  const HD = (e, t, s, i = {}) => ND(new WD(fD(e), t, s, i));
  class qD extends mp {
    static get type() {
      return "RGBShiftNode";
    }
    constructor(e, t = 0.005, s = 0) {
      super("vec4"),
        (this.textureNode = e),
        (this.amount = ID(t)),
        (this.angle = ID(s));
    }
    setup() {
      const { textureNode: e } = this,
        t = e.uvNode || OD(),
        s = (t) => e.sample(t);
      return gD(() => {
        const e = UD(yD(this.angle), LD(this.angle)).mul(this.amount),
          i = s(t.add(e)),
          r = s(t),
          n = s(t.sub(e));
        return GD(i.r, r.g, n.b, r.a);
      })();
    }
  }
  const XD = { width: 1920, height: 1080 },
    YD = new Tc(1, 1),
    KD = new jw(),
    QD = new kh(YD, KD);
  let ZD = gD(() => {}),
    JD = gD(() => {}),
    eO = !1;
  const tO = () => {
      if (eO) return;
      eO = !0;
      const e = oO();
      e.play();
      const t = new bc(e);
      (t.colorSpace = Ba),
        (ZD = gD(() => VD(t, OD()))),
        (JD = gD(() => ZD())),
        (KD.colorNode = JD()),
        nO();
    },
    sO = () => QD,
    iO = () => {
      nO();
    },
    rO = () => {
      eO = !1;
    },
    nO = () => {
      const e = Bd.getSize(),
        t = aO(e, XD);
      (QD.scale.x = t.width), (QD.scale.y = t.height);
    },
    oO = () => V("#navVideo"),
    aO = (e, t) => {
      const s = e.width / e.height,
        i = t.width / t.height,
        r = { width: 0, height: 0 };
      return (
        s > i
          ? ((r.width = e.width), (r.height = e.width / i))
          : ((r.height = e.height), (r.width = e.height * i)),
        r
      );
    },
    lO = new Jh(),
    uO = () => {
      tO(), lO.add(sO()), lO.add(Fd());
    },
    hO = () => {
      rO();
    },
    cO = () => {
      iO();
    },
    dO = () => lO,
    pO = ID(new hl(0, 0)),
    mO = ID(!1),
    gO = ID(0.92),
    fO = ID(4),
    yO = ID(0.2),
    vO = ID(0.03),
    bO = ID(45),
    xO = (e, t) => {
      const s = new mD(e, t);
      return (
        (s.type = Vo),
        (s.format = Go),
        (s.minFilter = wo),
        (s.magFilter = wo),
        (s.colorSpace = Va),
        s
      );
    };
  let { width: _O, height: wO } = Bd.getDimensions(),
    TO = xO(_O, wO),
    SO = xO(_O, wO);
  const NO = xO(_O, wO),
    MO = gD(() => {
      const e = zD(0).toVar(),
        t = EO.calcPx({ width: _O }),
        s = PD(mO, CO(), zD(0)),
        i = FD(TO, t).mul(gO);
      e.assign(s.add(i)),
        kD(SO, t, GD(e, 1)).toWriteOnly(),
        kD(NO, t, GD(e, 1)).toWriteOnly();
    }),
    CO = gD(() => {
      const e = zD(0).toVar(),
        t = EO.calcPx({ width: _O }),
        s = EO.pxToUv({ px: t }),
        i = EO.aspectCorrectUv({ uv: s, screenSize: UD(_O, wO) }),
        r = EO.aspectCorrectUv({ uv: pO, screenSize: UD(_O, wO) }),
        n = i.sub(r),
        o = EO.sdSphere({ uv: n, radius: vD(0) }).toVar();
      return (
        o
          .assign(BD(yO, 0, o))
          .sub(0.2)
          .clamp(0, 1),
        e.addAssign(o),
        e
      );
    }),
    EO = {
      calcPx: gD(({ width: e }) => {
        const t = bD.mod(xD(e)),
          s = bD.div(xD(e));
        return _D(t, s);
      }),
      pxToUv: gD(({ px: e }) => {
        const t = vD(e.x).div(vD(_O)),
          s = vD(1).sub(vD(e.y).div(vD(wO)));
        return UD(t, s);
      }),
      aspectCorrectUv: gD(({ uv: e, screenSize: t }) => {
        const s = vD(0.5),
          i = e.sub(s);
        return PD(
          t.x.greaterThan(t.y),
          UD(i.x.mul(t.x.div(t.y)), i.y),
          UD(i.x, i.y.mul(t.y.div(t.x))),
        );
      }),
      sdSphere: gD(({ uv: e, radius: t }) => wD(e).sub(t)),
    },
    AO = {
      resetTextures: () => {
        const e = Bd.getDimensions();
        (_O = e.width),
          (wO = e.height),
          TO.setSize(_O, wO, 1),
          SO.setSize(_O, wO, 1),
          NO.setSize(_O, wO, 1);
      },
      makeComputeJob: () => MO({}).compute(Bd.getPixelCount()),
      swapTextures: () => {
        const e = TO;
        (TO = SO), (SO = e);
      },
      updateUniforms: () => {
        if (!Bd.getCanvas()) return;
        const e = Jn();
        mO.value = e;
        const { width: t, height: s } = Bd.getDimensions();
        if (!e) return;
        let { x: i, y: r } = eo(Bd.getCanvas());
        (i = Math.min(Math.max(i, 0), t)), (r = Math.min(Math.max(r, 0), s));
        const n = i / t,
          o = 1 - r / s;
        pO.value.set(n, o);
      },
      outputNode: gD(() => {
        const e = VD(NO, OD()).toVar();
        return e.assign(e.clamp(0, 1)), e;
      }),
    };
  let RO = new dD(),
    PO = new pD(RO),
    LO = !1;
  const BO = ED(dO(), Fd()),
    VO =
      ((FO = BO),
      (kO = vO.value),
      (IO = D(bO.value)),
      ND(new qD(fD(FO), kO, IO)));
  var FO, kO, IO;
  const DO = UD(1, 1).mul(fO),
    OO = HD(VO, DO, 16),
    UO = TD(BO, OO, AO.outputNode()),
    zO = async () => {
      if (LO) return;
      (RO = new dD({ canvas: Bd.getCanvas(), alpha: !0 })),
        await RO.init(),
        (RO.outputColorSpace = Ba),
        (PO = new pD(RO)),
        BO.setMRT(SD({ output: CD, normal: MD })),
        (PO.outputNode = HO() ? UO : BO),
        (LO = !0);
      Object.entries(navigator).map(([e, t]) => `${e}: ${typeof t}`);
    },
    GO = () => {
      LO &&
        setTimeout(() => {
          PO.dispose(), RO.dispose(), (LO = !1);
        }, 30);
    },
    $O = async () => {
      LO &&
        (HO() && (await RO.computeAsync(AO.makeComputeJob())),
        PO.render(),
        AO.updateUniforms(),
        AO.swapTextures());
    },
    jO = () => {
      const { width: e, height: t, pixelRatio: s } = Bd.getDimensions();
      RO.setSize(e, t), RO.setPixelRatio(s), AO.resetTextures();
    },
    WO = () => {
      (VO.amount.value = vO.value), (VO.angle.value = D(bO.value));
    },
    HO = () => "undefined" != typeof navigator && void 0 !== navigator.gpu;
  let qO = !1,
    XO = null;
  const YO = () => {
      Bd.update(), jO(), kd(), cO();
    },
    KO = async () => {
      qO && (await $O(), requestAnimationFrame(KO));
    },
    QO = async () => {
      if (
        !qO &&
        ((XO = k("kvCanvas")),
        ((e) => {
          return !(!e || ((t = e), "true" === t.dataset.destroyed));
          var t;
        })(XO))
      ) {
        qO = !0;
        const e = XO.parentElement;
        Bd.init(XO, e),
          uO(),
          await zO(),
          window.addEventListener("resize", YO),
          YO(),
          KO();
      }
    },
    ZO = () => {
      qO && ((qO = !1), GO(), hO(), XO && (XO.dataset.destroyed = "true"));
    };
  function JO(e) {
    return null == e;
