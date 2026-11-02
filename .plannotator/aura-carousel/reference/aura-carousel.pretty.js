var hJ = { id: `aura-carousel`, title: `Aura Carousel` },
  gJ = `How focused teams turn insights into action.`,
  _J = { fontSize: 20, fontWeight: 400, lineHeight: 26, padding: 24 },
  vJ = {
    cardGap: 16,
    cardHeight: 560,
    cardRadius: 12,
    cardWidth: 448,
    canvasHeight: 1034,
    canvasWidth: 1472,
    contentHeight: 714,
    effectPadding: 64,
    headerHeight: 106,
    headerTop: 160,
    railTop: 314,
    trackWidth: 2304,
    verticalPadding: 160,
  },
  yJ = { height: vJ.canvasHeight, width: 1920 },
  bJ = `/demos/aura-carousel/`,
  xJ = [
    {
      alt: `Anthropic customer story`,
      id: `anthropic-portrait`,
      src: `${bJ}assets/dispersion-carousel/card-anthropic-portrait@2x.png`,
      testimonial: `“Bringing our research into one clear view helped the team agree on priorities and decide what to build next.”`,
    },
    {
      alt: `Shopify customer story`,
      id: `shopify`,
      src: `${bJ}assets/dispersion-carousel/card-shopify@2x.png`,
      testimonial: `“Learning why customers came back helped us improve our products and focus on the details they value most.”`,
    },
    {
      alt: `Anthropic studio customer story`,
      id: `anthropic-studio`,
      src: `${bJ}assets/dispersion-carousel/card-anthropic-studio@2x.png`,
      testimonial: `“A shared brief gave everyone a clear view of the goal and their role in reaching it. We made decisions sooner and kept work moving without extra meetings.”`,
    },
    {
      alt: `Walmart customer story`,
      id: `walmart`,
      src: `${bJ}assets/dispersion-carousel/card-walmart@2x.png`,
      testimonial: `“We replaced disconnected reports with shared measures, so teams could spot problems early and make better decisions together.”`,
    },
    {
      alt: `Google customer story`,
      id: `google`,
      src: `${bJ}assets/dispersion-carousel/card-google@2x.png`,
      testimonial: `“Simpler reporting freed up time to hear from customers, test new ideas, and improve the services they use daily.”`,
    },
  ],
  SJ = vJ.cardWidth + vJ.cardGap,
  CJ = SJ * xJ.length,
  wJ = 1856,
  TJ = CJ * 3 - vJ.cardGap,
  Q = {
    amount: `dispersion.amount`,
    aura: `dispersion.aura`,
    background: `appearance.background`,
    blur: `dispersion.blur`,
    count: `dispersion.count`,
    curve: `edgeZone.curve`,
    edgeFade: `edgeZone.fade`,
    edgeWidth: `edgeZone.width`,
    gateGlow: `auraGate.glow`,
    gateOffset: `auraGate.offset`,
    gateRefraction: `auraGate.refraction`,
    gateWidth: `auraGate.width`,
    hue: `dispersion.hue`,
    imageFormat: `export.image.format`,
    imageResolution: `export.image.resolution`,
    includeBackground: `export.includeBackground`,
    includeText: `dispersion.includeText`,
    spectrum: `dispersion.spectrum`,
    turbulence: `edgeZone.turbulence`,
    turbulenceScale: `edgeZone.turbulenceScale`,
    velocity: `dispersion.velocity`,
    warp: `edgeZone.warp`,
    warpFace: `edgeZone.warpFace`,
    warpOffset: `edgeZone.warpOffset`,
    warpSharpness: `edgeZone.warpSharpness`,
    warpStyle: `edgeZone.warpStyle`,
    warpWave: `edgeZone.warpWave`,
    warpWaveBlur: `edgeZone.warpWaveBlur`,
    warpWaveEnabled: `edgeZone.warpWaveEnabled`,
    warpWaveKind: `edgeZone.warpWaveKind`,
    warpWaveLength: `edgeZone.warpWaveLength`,
  },
  EJ = {
    amount: 85,
    aura: 0.69,
    background: `#FFFFFF`,
    blur: 0,
    count: 20,
    curve: 1.15,
    edgeFade: 0.51,
    edgeWidth: 13,
    gateGlow: 0.49,
    gateOffset: 9,
    gateRefraction: 7,
    gateWidth: 147,
    hue: 0,
    includeBackground: !0,
    includeText: !0,
    spectrum: 0.67,
    turbulence: 0.79,
    turbulenceScale: 168,
    velocity: 0.45,
    warp: 8,
    warpFace: 133,
    warpOffset: 1,
    warpSharpness: 2.35,
    warpStyle: `stretch`,
    warpWave: 3,
    warpWaveBlur: 0,
    warpWaveEnabled: !0,
    warpWaveKind: `ripple`,
    warpWaveLength: 336,
  };
function DJ(e, t, n) {
  let r = Number(e.values[t]);
  return Number.isFinite(r) ? r : n;
}
function OJ(e, t) {
  return typeof e == `string`
    ? e
    : typeof e == `object` && e && `hex` in e && typeof e.hex == `string`
      ? e.hex
      : t;
}
function kJ(e) {
  let t = Q,
    n = EJ;
  return {
    amount: DJ(e, t.amount, n.amount),
    aura: DJ(e, t.aura, n.aura),
    background: OJ(e.values[t.background], n.background),
    blur: DJ(e, t.blur, n.blur),
    count: DJ(e, t.count, n.count),
    curve: DJ(e, t.curve, n.curve),
    edgeFade: DJ(e, t.edgeFade, n.edgeFade),
    edgeWidth: DJ(e, t.edgeWidth, n.edgeWidth),
    gateGlow: DJ(e, t.gateGlow, n.gateGlow),
    gateOffset: DJ(e, t.gateOffset, n.gateOffset),
    gateRefraction: DJ(e, t.gateRefraction, n.gateRefraction),
    gateWidth: DJ(e, t.gateWidth, n.gateWidth),
    hue: DJ(e, t.hue, n.hue),
    includeBackground: e.values[t.includeBackground] !== !1,
    includeText: e.values[t.includeText] !== !1,
    spectrum: DJ(e, t.spectrum, n.spectrum),
    turbulence: DJ(e, t.turbulence, n.turbulence),
    turbulenceScale: DJ(e, t.turbulenceScale, n.turbulenceScale),
    velocity: DJ(e, t.velocity, n.velocity),
    warp: DJ(e, t.warp, n.warp),
    warpFace: DJ(e, t.warpFace, n.warpFace),
    warpOffset: DJ(e, t.warpOffset, n.warpOffset),
    warpSharpness: DJ(e, t.warpSharpness, n.warpSharpness),
    warpStyle: e.values[t.warpStyle] === `prism` ? `prism` : `stretch`,
    warpWave: DJ(e, t.warpWave, n.warpWave),
    warpWaveBlur: DJ(e, t.warpWaveBlur, n.warpWaveBlur),
    warpWaveEnabled: e.values[t.warpWaveEnabled] === !0,
    warpWaveKind: e.values[t.warpWaveKind] === `ripple` ? `ripple` : `glass`,
    warpWaveLength: DJ(e, t.warpWaveLength, n.warpWaveLength),
  };
}
var AJ = (e) => ({ performanceReason: e, performanceRole: `responsiveness` });
function jJ(e, t, n, r, i, a, o, s = {}) {
  return {
    applicability: s.applicability ?? { mode: `always` },
    defaultValue: n,
    description: o,
    label: t,
    max: i,
    min: r,
    orderRole: s.orderRole ?? `detail`,
    performanceReason:
      s.workloadReason ??
      `Updates one uniform in the retained screen-space dispersion pass.`,
    performanceRole: s.workloadReason ? `workload` : `responsiveness`,
    ...(s.semanticGroup ? { semanticGroup: s.semanticGroup } : {}),
    sliderValueKind: `continuous`,
    step: a,
    target: e,
    type: `slider`,
    ...(s.unit ? { unit: s.unit } : {}),
  };
}
var MJ = EJ,
  $ = Q,
  NJ = [
    {
      controls: {
        edgeWidth: jJ(
          $.edgeWidth,
          `Edge width`,
          MJ.edgeWidth,
          0,
          50,
          1,
          `Sets how far the stationary aura zone reaches inward from each side of the viewport.`,
          { orderRole: `primary`, unit: `%` },
        ),
        curve: jJ(
          $.curve,
          `Falloff`,
          MJ.curve,
          0.5,
          3,
          0.05,
          `Shapes how quickly the effect strengthens inside the zone; higher values keep more of the center clean.`,
        ),
        edgeFade: jJ(
          $.edgeFade,
          `Edge fade`,
          MJ.edgeFade,
          0,
          1,
          0.01,
          `Dissolves the outermost pixels into the page background at the viewport boundary.`,
        ),
        turbulence: jJ(
          $.turbulence,
          `Turbulence`,
          MJ.turbulence,
          0,
          1,
          0.01,
          `Makes the edge halos ragged and organic; zero keeps a perfectly smooth envelope.`,
        ),
        turbulenceScale: jJ(
          $.turbulenceScale,
          `Turbulence size`,
          MJ.turbulenceScale,
          40,
          280,
          2,
          `Sets the wavelength of the ragged halo contour along the card edges.`,
          { unit: `px` },
        ),
      },
      id: `edge-zone`,
      title: `Edge Zone`,
    },
    {
      controls: {
        warp: jJ(
          $.warp,
          `Warp`,
          MJ.warp,
          0,
          80,
          1,
          `Sets how far cards geometrically bend. Stretch grows toward the outer rim; Prism uses it as the shift through the refractive face.`,
          {
            orderRole: `primary`,
            semanticGroup: `zone-warp-shape`,
            unit: `px`,
          },
        ),
        warpStyle: {
          applicability: { mode: `always` },
          defaultValue: MJ.warpStyle,
          description: `Stretch keeps the current gradual barrel. Prism places a refractive interface at the inner zone boundary so cards kink and offset as they cross the face.`,
          label: `Style`,
          options: [
            { label: `Stretch`, value: `stretch` },
            { label: `Prism`, value: `prism` },
          ],
          orderRole: `mode`,
          semanticGroup: `zone-warp-shape`,
          target: $.warpStyle,
          type: `segmented`,
          ...AJ(
            `Selects the warp profile without changing the retained rail textures.`,
          ),
        },
        warpOffset: jJ(
          $.warpOffset,
          `Offset`,
          MJ.warpOffset,
          0,
          40,
          1,
          `Slides the warp inward from both viewport edges. Zero pins it flush to the rim so cards still touch the edge; higher values move the band inward.`,
          { semanticGroup: `zone-warp-shape`, unit: `%` },
        ),
        warpWaveEnabled: {
          applicability: { mode: `always` },
          defaultValue: MJ.warpWaveEnabled,
          description: `Turns on wave distortion in the warp band. Kind chooses the previous sine ripple or the refractive glass slab.`,
          label: `Wave`,
          orderRole: `primary`,
          semanticGroup: `zone-warp-wave`,
          target: $.warpWaveEnabled,
          type: `switch`,
          ...AJ(
            `Enables wave uniforms without changing the retained rail textures.`,
          ),
        },
        warpWaveKind: {
          applicability: {
            all: [{ equals: !0, target: $.warpWaveEnabled }],
            mode: `conditional`,
          },
          defaultValue: MJ.warpWaveKind,
          description: `Ripple is the earlier sideways sine. Glass refracts through a rippled slab with surface normals and lensing.`,
          label: `Kind`,
          options: [
            { label: `Glass`, value: `glass` },
            { label: `Ripple`, value: `ripple` },
          ],
          orderRole: `mode`,
          semanticGroup: `zone-warp-wave`,
          target: $.warpWaveKind,
          type: `segmented`,
          ...AJ(
            `Selects the wave profile without changing the retained rail textures.`,
          ),
        },
        warpWave: jJ(
          $.warpWave,
          `Strength`,
          MJ.warpWave,
          0,
          48,
          1,
          `Sets how far Ripple shifts cards, or how thick the Glass slab is.`,
          {
            applicability: {
              all: [{ equals: !0, target: $.warpWaveEnabled }],
              mode: `conditional`,
            },
            semanticGroup: `zone-warp-wave`,
            unit: `px`,
          },
        ),
        warpWaveLength: jJ(
          $.warpWaveLength,
          `Length`,
          MJ.warpWaveLength,
          40,
          400,
          2,
          `Sets the dominant ripple scale. Shorter values stack tighter folds; longer values make slower waves.`,
          {
            applicability: {
              all: [{ equals: !0, target: $.warpWaveEnabled }],
              mode: `conditional`,
            },
            semanticGroup: `zone-warp-wave`,
            unit: `px`,
          },
        ),
        warpWaveBlur: jJ(
          $.warpWaveBlur,
          `Blur`,
          MJ.warpWaveBlur,
          0,
          28,
          1,
          `Softens the wave pattern and defocuses cards inside the warp band. Zero keeps the selected Kind sharp.`,
          {
            applicability: {
              all: [{ equals: !0, target: $.warpWaveEnabled }],
              mode: `conditional`,
            },
            semanticGroup: `zone-warp-wave`,
            unit: `px`,
          },
        ),
        warpFace: jJ(
          $.warpFace,
          `Face width`,
          MJ.warpFace,
          12,
          160,
          1,
          `Sets how thick the prism face is. Narrower values read as a sharp glass edge; wider values read as a slab the cards travel through.`,
          {
            applicability: {
              all: [{ equals: `prism`, target: $.warpStyle }],
              mode: `conditional`,
            },
            semanticGroup: `zone-warp-prism`,
            unit: `px`,
          },
        ),
        warpSharpness: jJ(
          $.warpSharpness,
          `Sharpness`,
          MJ.warpSharpness,
          0.4,
          4,
          0.05,
          `Concentrates the kink on the prism face. Higher values make the crossing snap; lower values soften the entry.`,
          {
            applicability: {
              all: [{ equals: `prism`, target: $.warpStyle }],
              mode: `conditional`,
            },
            semanticGroup: `zone-warp-prism`,
          },
        ),
      },
      id: `edge-warp`,
      title: `Edge Warp`,
    },
    {
      controls: {
        includeText: {
          applicability: { mode: `always` },
          defaultValue: MJ.includeText,
          description: `Includes testimonial copy in the same dispersion, blur, aura, and edge-fade sampling as the card images. Turn it off to keep the copy sharp.`,
          label: `Text effect`,
          orderRole: `primary`,
          target: $.includeText,
          type: `switch`,
          ...AJ(
            `Changes one texture-composition uniform in the retained screen-space dispersion pass.`,
          ),
        },
      },
      id: `card-content`,
      title: `Card Content`,
    },
    {
      controls: {
        amount: jJ(
          $.amount,
          `Dispersion`,
          MJ.amount,
          0,
          200,
          1,
          `Sets the maximum spectral offset a card reaches while it travels through the outer edge.`,
          { orderRole: `primary`, unit: `px` },
        ),
        count: jJ(
          $.count,
          `Samples`,
          MJ.count,
          6,
          48,
          1,
          `Sets the spectral tap count; higher values smooth the smear and cost more GPU work.`,
          {
            workloadReason: `Controls the bounded per-pixel sampling loop of the screen-space dispersion shader.`,
          },
        ),
        spectrum: jJ(
          $.spectrum,
          `Spectrum`,
          MJ.spectrum,
          0,
          1,
          0.01,
          `Blends the smear from a neutral streak into the fully saturated generated spectrum.`,
        ),
        hue: jJ(
          $.hue,
          `Hue`,
          MJ.hue,
          0,
          360,
          1,
          `Rotates the generated spectrum around the hue wheel.`,
          { unit: `°` },
        ),
        blur: jJ(
          $.blur,
          `Blur`,
          MJ.blur,
          0,
          48,
          1,
          `Sets the maximum defocus radius at the outside edges; focus returns progressively toward the zone boundary.`,
          {
            unit: `px`,
            workloadReason: `Widens the bounded defocus radius sampled inside the same dispersion loop.`,
          },
        ),
        aura: jJ(
          $.aura,
          `Aura`,
          MJ.aura,
          0,
          1,
          0.01,
          `Adds a soft spectral halo that bleeds past the card edges inside the zone.`,
        ),
        velocity: jJ(
          $.velocity,
          `Motion boost`,
          MJ.velocity,
          0,
          1,
          0.01,
          `Adds a scroll-speed streak so cards visibly smear while they move through the aura.`,
        ),
      },
      id: `edge-dispersion`,
      title: `Dispersion & Aura`,
    },
    {
      controls: {
        gateOffset: jJ(
          $.gateOffset,
          `Edge offset`,
          MJ.gateOffset,
          0,
          50,
          1,
          `Moves each light band inward from its nearest canvas edge independently of the Edge Zone width.`,
          { orderRole: `primary`, unit: `%` },
        ),
        gateWidth: jJ(
          $.gateWidth,
          `Band width`,
          MJ.gateWidth,
          20,
          240,
          1,
          `Sets how wide the stationary light band at each zone boundary is.`,
          { unit: `px` },
        ),
        gateGlow: jJ(
          $.gateGlow,
          `Glow`,
          MJ.gateGlow,
          0,
          1,
          0.01,
          `Sets how strongly cards flare while they cross the boundary band; scroll speed briefly intensifies it.`,
        ),
        gateRefraction: jJ(
          $.gateRefraction,
          `Refraction`,
          MJ.gateRefraction,
          0,
          60,
          1,
          `Bends the pixels crossing the band like a glass ridge at the zone boundary.`,
        ),
      },
      id: `aura-gate`,
      title: `Boundary Aura`,
    },
    {
      controls: {
        includeBackground: {
          applicability: { mode: `always` },
          defaultValue: MJ.includeBackground,
          description: `Controls the bounded preview and still-image background behind the carousel.`,
          label: `Include`,
          orderRole: `primary`,
          target: $.includeBackground,
          type: `switch`,
          ...AJ(
            `Changes one background fill without changing rail geometry or shader samples.`,
          ),
        },
        background: {
          applicability: {
            all: [{ equals: !0, target: $.includeBackground }],
            mode: `conditional`,
          },
          defaultValue: MJ.background,
          label: !1,
          orderRole: `color`,
          target: $.background,
          type: `color`,
          ...AJ(`Changes one background fill in preview and image export.`),
        },
      },
      id: `background`,
      layoutGroups: [
        {
          columns: 2,
          controls: [`includeBackground`, `background`],
          layout: `inline`,
        },
      ],
      title: `Background`,
    },
    {
      controls: {
        format: {
          applicability: { mode: `always` },
          defaultValue: `png`,
          label: `Format`,
          options: [
            { label: `PNG`, value: `png` },
            { label: `JPG`, value: `jpg` },
          ],
          orderRole: `mode`,
          target: $.imageFormat,
          type: `select`,
          ...AJ(
            `Selects runtime-owned image encoding without changing preview pixels.`,
          ),
        },
        resolution: {
          applicability: { mode: `always` },
          defaultValue: `4k`,
          label: `Resolution`,
          options: [
            { label: `2K`, value: `2k` },
            { label: `4K`, value: `4k` },
            { label: `8K`, value: `8k` },
          ],
          orderRole: `detail`,
          performanceReason: `Changes batch render and encoding pixels up to the real 8K output boundary.`,
          performanceRole: `workload`,
          target: $.imageResolution,
          type: `select`,
        },
      },
      id: `image-export`,
      layoutGroups: [
        { columns: 2, controls: [`format`, `resolution`], layout: `inline` },
      ],
      title: `Image Export`,
    },
    {
      actionGroup: `primary`,
      controls: {
        outputActions: {
          applicability: { mode: `always` },
          actions: [
            {
              icon: `upload-simple`,
              label: `Export PNG`,
              role: `export-image`,
              value: `export.png`,
            },
          ],
          label: !1,
          target: `actions.output`,
          type: `panelActions`,
        },
      },
      id: `output-actions`,
      title: `Export`,
    },
  ],
  PJ = pJ({
    canvas: {
      enabled: !0,
      renderScale: !0,
      size: { height: yJ.height, unit: `px`, width: yJ.width },
      sizing: { mode: `editable-output` },
      upload: !1,
    },
    export: { png: { background: `include` } },
    identity: hJ,
    panels: { controls: { sections: NJ, title: `Aura Carousel` } },
    persistence: {
      additionalValueTargets: [`carousel.scroll`],
      include: [`values`, `canvas`, `panels`],
      key: `toolcraft:aura-carousel:state:v8`,
      storage: `localStorage`,
      version: 8,
    },
    settingsTransfer: {
      additionalValueTargets: [`carousel.scroll`],
      appId: `aura-carousel`,
      enabled: `auto`,
      fileName: `aura-carousel-settings.json`,
    },
    toolbar: { history: !0, radar: !0, theme: !0, zoom: !0 },
  }),
  FJ = {
    imageExport: `dispersion-carousel.image-export`,
    preview: `dispersion-carousel.preview`,
  },
  IJ = [
    Q.edgeWidth,
    Q.curve,
    Q.edgeFade,
    Q.amount,
    Q.count,
    Q.spectrum,
    Q.hue,
    Q.blur,
    Q.aura,
    Q.velocity,
    Q.gateOffset,
    Q.gateWidth,
    Q.gateGlow,
    Q.gateRefraction,
    Q.turbulence,
    Q.turbulenceScale,
    Q.warp,
    Q.warpFace,
    Q.warpOffset,
    Q.warpSharpness,
    Q.warpWave,
    Q.warpWaveBlur,
    Q.warpWaveLength,
  ],
  LJ = fu()({
    interactionInvalidation: [
      {
        interaction: `initial-render`,
        invalidates: [FJ.preview],
        mustNotInvalidate: [FJ.imageExport],
        targets: [`runtime.initial-render`],
      },
      {
        interaction: `control-drag`,
        invalidates: [FJ.preview],
        mustNotInvalidate: [FJ.imageExport],
        targets: [...IJ, `canvas.renderScale`],
      },
      {
        interaction: `control-change`,
        invalidates: [FJ.preview],
        mustNotInvalidate: [FJ.imageExport],
        targets: [
          Q.includeText,
          Q.warpStyle,
          Q.warpWaveEnabled,
          Q.warpWaveKind,
          Q.includeBackground,
          Q.background,
          `canvas.aspectRatio`,
          `canvas.size.width`,
          `canvas.size.height`,
        ],
      },
      {
        interaction: `control-change`,
        invalidates: [],
        mustNotInvalidate: [FJ.preview, FJ.imageExport],
        targets: [Q.imageFormat, Q.imageResolution],
      },
      {
        interaction: `animation-frame`,
        invalidates: [FJ.preview],
        mustNotInvalidate: [FJ.imageExport],
        targets: [`carousel.scroll`],
      },
      {
        interaction: `viewport-drag`,
        invalidates: [],
        mustNotInvalidate: [FJ.preview, FJ.imageExport],
        targets: [`runtime.canvas.viewport`],
      },
      {
        interaction: `viewport-zoom`,
        invalidates: [],
        mustNotInvalidate: [FJ.preview, FJ.imageExport],
        targets: [`runtime.canvas.viewport`],
      },
      {
        interaction: `export`,
        invalidates: [FJ.imageExport],
        mustNotInvalidate: [FJ.preview],
        targets: [
          `export.png`,
          Q.imageFormat,
          Q.imageResolution,
          Q.includeBackground,
          Q.background,
          Q.includeText,
        ],
      },
    ],
    passes: [
      {
        cost: {
          dimensions: [`edge-blur-radius`, `lens-samples`],
          frequency: `frame`,
          relationship: `product`,
        },
        id: FJ.preview,
        inputs: [
          `five exact x2 card sources assembled once into one retained image texture`,
          `one retained transparent Figtree testimonial texture from the canonical DOM card data`,
          `screen-space spectral dispersion shader with aura, defocus, and geometric warp`,
          `stationary viewport-anchored edge field with independently positioned boundary light bands`,
          `normalized seamless carousel-cycle position and smoothed wrapped scroll velocity`,
          `selected render scale`,
          `source-derived transparent text rows and unchanged full-quality frame reuse`,
        ],
        invalidatedBy: [
          ...IJ,
          Q.includeText,
          Q.warpStyle,
          Q.warpWaveEnabled,
          Q.warpWaveKind,
          Q.includeBackground,
          Q.background,
          `canvas.aspectRatio`,
          `canvas.size.width`,
          `canvas.size.height`,
          `canvas.renderScale`,
          `carousel.scroll`,
        ],
        kind: `pixel-transform`,
        lifecycle: { cache: `none`, resourceScope: `renderer` },
        output: `preview`,
        quality: `retina`,
        runsOn: `gpu`,
      },
      {
        cost: {
          dimensions: [`edge-blur-radius`, `image-long-edge`, `lens-samples`],
          frequency: `batch`,
          relationship: `product`,
        },
        id: FJ.imageExport,
        inputs: [
          `current carousel position`,
          `Figma heading`,
          `selected clean-or-dispersed testimonial composition`,
          `deterministic velocity-free dispersion rail snapshot at export resolution`,
          `runtime-selected image export settings`,
        ],
        invalidatedBy: [
          `export.png`,
          Q.imageFormat,
          Q.imageResolution,
          Q.includeBackground,
          Q.background,
          Q.includeText,
        ],
        kind: `export`,
        lifecycle: { cache: `none`, resourceScope: `call` },
        output: `export`,
        quality: `export`,
        runsOn: `export-only`,
      },
    ],
    runtimeId: `dispersion-carousel.renderer@10`,
  }),
  RJ = {
    imageExport: LJ.getPass(FJ.imageExport),
    preview: LJ.getPass(FJ.preview),
  },
  zJ = 2,
  BJ = `400 20px "Dispersion Figtree", Arial, sans-serif`,
  VJ = null;
function HJ(e, t, n) {
  let { data: r } = e.getImageData(0, 0, t, n),
    i = (e) => {
      let n = (e + 1) * t * 4;
      for (let i = e * t * 4 + 3; i < n; i += 4) if (r[i] !== 0) return !0;
      return !1;
    },
    a = 0;
  for (; a < n && !i(a);) a++;
  if (a === n) return [1, 0];
  let o = n - 1;
  for (; o > a && !i(o);) o--;
  return [Math.max(0, a - 1) / n, Math.min(n, o + 2) / n];
}
function UJ(e) {
  return new Promise((t, n) => {
    let r = new Image();
    ((r.decoding = `async`),
      (r.onload = () => t(r)),
      (r.onerror = () => n(Error(`Failed to load carousel card: ${e}`))),
      (r.src = e));
  });
}
function WJ(e, t, n) {
  let r = t.split(/\s+/u),
    i = [],
    a = ``;
  for (let t of r) {
    let r = a ? `${a} ${t}` : t;
    a && e.measureText(r).width > n ? (i.push(a), (a = t)) : (a = r);
  }
  return (a && i.push(a), i);
}
function GJ(e, t, n, r) {
  let i = vJ,
    a = _J,
    o = i.cardWidth - a.padding * 2;
  ((e.font = BJ),
    (e.fontKerning = `normal`),
    (e.fillStyle = `#FFFFFF`),
    (e.textBaseline = `top`));
  let s = WJ(e, t, o),
    c = r + i.cardHeight - a.padding - s.length * a.lineHeight;
  for (let [t, r] of s.entries())
    e.fillText(r, n + a.padding, c + t * a.lineHeight);
}
async function KJ() {
  return (
    VJ ||
    ((VJ = (async () => {
      typeof document < `u` &&
        `fonts` in document &&
        (await document.fonts.load(BJ));
      let e = await Promise.all(xJ.map((e) => UJ(e.src))),
        t = CJ * zJ,
        n = vJ.cardHeight * zJ,
        r = document.createElement(`canvas`),
        i = document.createElement(`canvas`);
      ((r.width = t), (r.height = n), (i.width = t), (i.height = n));
      let a = r.getContext(`2d`),
        o = i.getContext(`2d`);
      if (!a || !o)
        throw Error(`The carousel strip textures require Canvas 2D support.`);
      a.clearRect(0, 0, t, n);
      for (let [t, n] of xJ.entries()) {
        let r = t * SJ * zJ;
        (a.drawImage(e[t], r, 0, vJ.cardWidth * zJ, vJ.cardHeight * zJ),
          o.save(),
          o.scale(zJ, zJ),
          GJ(o, n.testimonial, r / zJ, 0),
          o.restore());
      }
      return { image: r, text: i, textRowRange: HJ(o, t, n) };
    })()),
    VJ)
  );
}
var qJ = null;
function JJ(e) {
  return (
    (qJ = e),
    () => {
      qJ === e && (qJ = null);
    }
  );
}
async function YJ(e, t) {
  let n = vJ;
  typeof document < `u` &&
    `fonts` in document &&
    (await document.fonts.load(`500 48px "Dispersion Figtree"`));
  let r = t.x + Math.max(0, (t.width - n.canvasWidth) / 2);
  e.save();
  try {
    (e.beginPath(),
      e.rect(t.x, t.y, t.width, t.height),
      e.clip(),
      (e.fillStyle = `#000000`),
      (e.font = `500 48px "Dispersion Figtree", sans-serif`),
      (e.fontKerning = `none`),
      (e.textBaseline = `top`));
    let i = t.y + n.headerTop;
    (e.fillText(`How focused teams turn`, r, i - 2),
      e.fillText(`insights into action.`, r, i + 50.8));
  } finally {
    e.restore();
  }
}
function XJ(e) {
  let t = e.getTransform(),
    n = Math.max(Math.abs(t.a), Math.abs(t.d));
  return Number.isFinite(n) && n > 0 ? n : 2;
}
async function ZJ({ context: e, frame: t, state: n }) {
  let r = qJ;
  if (!r) throw Error(`The dispersion rail preview is not ready for export.`);
  let i = vJ;
  await YJ(e, t);
  let a = await r.snapshot(XJ(e));
  try {
    (e.save(),
      e.beginPath(),
      e.rect(t.x, t.y, t.width, t.height),
      e.clip(),
      e.drawImage(
        a,
        t.x,
        t.y + i.railTop - i.effectPadding,
        t.width,
        i.cardHeight + i.effectPadding * 2,
      ),
      e.restore());
  } finally {
    a.close();
  }
  if (!kJ(n).includeText) {
    typeof document < `u` &&
      `fonts` in document &&
      (await document.fonts.load(`400 20px "Dispersion Figtree"`));
    let n = r.getScrollLeft();
    e.save();
    try {
      (e.beginPath(), e.rect(t.x, t.y, t.width, t.height), e.clip());
      for (let r of [-1, 0, 1])
        for (let [a, o] of xJ.entries()) {
          let s = t.x + r * CJ + a * SJ - n;
          GJ(e, o.testimonial, s, t.y + i.railTop);
        }
    } finally {
      e.restore();
    }
  }
}
var QJ = {
  baseFileName: `aura-carousel`,
  async renderFrame({ context: e, frame: t, rendererPipeline: n, state: r }) {
    let i = () => ZJ({ context: e, frame: t, state: r });
    if (n) {
      await n.runPass(RJ.imageExport, void 0, i);
      return;
    }
    await i();
  },
};
function $J(e) {
  return ((e % CJ) + CJ) % CJ;
}
function eY(e) {
  return $J(Math.round(e / SJ) * SJ);
}
function tY(e) {
  return 1 - (1 - e) ** 3;
}
function nY(e, t) {
  let n = e / SJ;
  return (t > 0 ? Math.floor(n) + 1 : Math.ceil(n) - 1) * SJ;
}
function rY(e, t) {
  let n = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? t : 1,
    r = e.deltaX * n,
    i = e.deltaY * n;
  return Math.abs(r) >= Math.abs(i) ? r : e.shiftKey ? i : 0;
}
function iY(e, t) {
  let n = e - t;
  return n > CJ / 2 ? n - CJ : n < -CJ / 2 ? n + CJ : n;
}
function aY(e, t) {
  let n = null,
    r = (r) => {
      if (!n) return;
      let { pointerId: i } = n;
      ((n = null),
        delete e.dataset.carouselDragging,
        e.hasPointerCapture(i) && e.releasePointerCapture(i),
        r && t.onEnd());
    },
    i = (r) => {
      if (
        n ||
        r.defaultPrevented ||
        r.pointerType !== `mouse` ||
        r.button !== 0 ||
        r.ctrlKey ||
        r.metaKey ||
        r.altKey
      )
        return;
      (r.preventDefault(),
        r.stopPropagation(),
        e.setPointerCapture(r.pointerId));
      let i = e.getBoundingClientRect().width;
      ((n = {
        pointerId: r.pointerId,
        x: r.clientX,
        scale: i > 0 && e.clientWidth > 0 ? i / e.clientWidth : 1,
      }),
        (e.dataset.carouselDragging = `true`),
        e.focus({ preventScroll: !0 }),
        t.onStart());
    },
    a = (e) => {
      if (!n || e.pointerId !== n.pointerId) return;
      if ((e.preventDefault(), e.stopPropagation(), !(e.buttons & 1))) {
        r(!0);
        return;
      }
      let i = (n.x - e.clientX) / n.scale;
      ((n.x = e.clientX), i !== 0 && t.onDelta(i));
    },
    o = (e) => {
      !n || e.pointerId !== n.pointerId || (e.stopPropagation(), r(!0));
    },
    s = () => r(!0);
  return (
    e.addEventListener(`pointerdown`, i),
    e.addEventListener(`pointermove`, a),
    e.addEventListener(`pointerup`, o),
    e.addEventListener(`pointercancel`, o),
    e.addEventListener(`lostpointercapture`, o),
    window.addEventListener(`blur`, s),
    {
      isDragging: () => n !== null,
      dispose() {
        (e.removeEventListener(`pointerdown`, i),
          e.removeEventListener(`pointermove`, a),
          e.removeEventListener(`pointerup`, o),
          e.removeEventListener(`pointercancel`, o),
          e.removeEventListener(`lostpointercapture`, o),
          window.removeEventListener(`blur`, s),
          r(!1));
      },
    }
  );
}
var oY = {
    surface: `_surface_vtock_9`,
    header: `_header_vtock_17`,
    title: `_title_vtock_33`,
    navigation: `_navigation_vtock_47`,
    navigationButton: `_navigationButton_vtock_61`,
    chevron: `_chevron_vtock_84`,
    chevronPrevious: `_chevronPrevious_vtock_108`,
    railViewport: `_railViewport_vtock_112`,
    railTrack: `_railTrack_vtock_145`,
    card: `_card_vtock_151`,
    cardImage: `_cardImage_vtock_163`,
    testimonial: `_testimonial_vtock_173`,
    dispersionRail: `_dispersionRail_vtock_199`,
    dispersionRailCanvas: `_dispersionRailCanvas_vtock_209`,
    cleanTextViewport: `_cleanTextViewport_vtock_215`,
    cleanTextTrack: `_cleanTextTrack_vtock_226`,
    cleanTextCard: `_cleanTextCard_vtock_233`,
  },
  sY = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`,
  cY = `
precision highp float;

uniform sampler2D uStrip;
uniform sampler2D uText;
uniform vec2 uTextRowRange;
uniform vec2 uViewSize;
uniform vec2 uStripSize;
uniform float uPadY;
uniform float uScroll;
uniform float uEdgeStart;
uniform float uCurve;
uniform float uAmount;
uniform float uBlur;
uniform float uSpectrum;
uniform float uHue;
uniform float uIncludeText;
uniform float uAura;
uniform float uFade;
uniform float uVelocity;
uniform float uGateGlow;
uniform float uGateOffset;
uniform float uGateRefraction;
uniform float uGateWidth;
uniform float uTurbulence;
uniform float uTurbulenceFreq;
uniform float uWarp;
uniform float uWarpFace;
uniform float uWarpOffset;
uniform float uWarpSharpness;
uniform float uWarpStyle;
uniform float uWarpWave;
uniform float uWarpWaveBlur;
uniform float uWarpWaveKind;
uniform float uWarpWaveLength;
uniform int uSamples;

varying vec2 vUv;

const int MAX_SAMPLES = 48;
const int AURA_SAMPLES = 12;
const float GOLDEN_ANGLE = 2.399963;

vec4 sampleStrip(vec2 point) {
  float wrappedX = mod(mod(point.x + uScroll, uStripSize.x) + uStripSize.x, uStripSize.x);
  vec2 strip = vec2(wrappedX, point.y - uPadY);
  vec2 uv = strip / uStripSize;
  if (uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  vec4 imageTexel = texture2D(uStrip, uv);
  vec3 premultiplied = imageTexel.rgb * imageTexel.a;
  float alpha = imageTexel.a;
  if (uIncludeText > 0.5 && uv.y >= uTextRowRange.x && uv.y <= uTextRowRange.y) {
    vec4 textTexel = texture2D(uText, uv);
    premultiplied =
      textTexel.rgb * textTexel.a + premultiplied * (1.0 - textTexel.a);
    alpha = textTexel.a + alpha * (1.0 - textTexel.a);
  }
  return vec4(premultiplied, alpha);
}

vec3 spectralWeight(float t) {
  float h = uHue + t * 4.188790;
  vec3 rainbow = 0.5 + 0.5 * cos(h + vec3(0.0, -2.094395, -4.188790));
  rainbow = pow(rainbow, vec3(1.25)) * 1.8;
  return max(mix(vec3(1.0), rainbow, uSpectrum), 0.0);
}

float ditherPhase(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(valueHash(cell), valueHash(cell + vec2(1.0, 0.0)), u.x),
    mix(
      valueHash(cell + vec2(0.0, 1.0)),
      valueHash(cell + vec2(1.0, 1.0)),
      u.x
    ),
    u.y
  );
}

float fbm(vec2 p) {
  return valueNoise(p) * 0.65 + valueNoise(p * 2.13 + 7.7) * 0.35;
}

// Optical-path height of a wavy refractive slab. Several incommensurate
// sines plus a low fbm keep the surface from reading as a straight flag.
float waveHeight(vec2 p, float midY, float waveLen) {
  float q = (p.y - midY) / max(waveLen, 8.0);
  float px = p.x / max(uViewSize.x, 1.0);
  float p1 = q * 6.283185 + px * 2.6;
  float p2 = q * 13.63 + px * -3.4 + 1.27;
  float p3 = q * 22.05 + px * 1.8 + 2.41;
  float organic = fbm(vec2(px * 3.4, q * 1.85)) * 2.0 - 1.0;
  return 0.50 * sin(p1) + 0.26 * sin(p2) + 0.12 * sin(p3) + 0.22 * organic;
}

void main() {
  vec2 point = vUv * uViewSize;
  float centered = vUv.x * 2.0 - 1.0;
  float distance = abs(centered);
  float direction = centered >= 0.0 ? 1.0 : -1.0;
  float edge = clamp(
    (distance - uEdgeStart) / max(1.0 - uEdgeStart, 1e-4),
    0.0,
    1.0
  );
  edge = pow(edge, uCurve);

  // Relocatable warp band. Offset 0 pins the outer bound to the true
  // viewport rim. Displacement returns to zero AT that rim so cards
  // still press against the edge instead of leaving a vacated margin.
  float zoneWidth = max(1.0 - uEdgeStart, 0.04);
  float inset = clamp(uWarpOffset, 0.0, 0.85);
  float outer = 1.0 - inset;
  float inner = max(outer - zoneWidth, 0.0);
  float warpT = clamp((distance - inner) / max(outer - inner, 1e-4), 0.0, 1.0);
  float rimHold = smoothstep(0.78, 1.0, warpT);
  float warpEdge = pow(warpT, uCurve) * (1.0 - rimHold);
  float warpWindow = smoothstep(0.0, 0.2, warpT) * (1.0 - rimHold);

  if (uWarp > 0.5 || uWarpWave > 0.5) {
    float midY = uPadY + uStripSize.y * 0.5;
    if (uWarp > 0.5) {
      if (uWarpStyle < 0.5) {
        if (warpEdge > 0.0005) {
          float warp = min(uWarp * pow(warpEdge, 1.2), uViewSize.x * 0.12);
          point.x -= direction * warp;
          point.y += (point.y - midY) * warp / max(uStripSize.y, 1.0);
        }
      } else {
        float faceCenter = mix(inner, outer, 0.92);
        float faceHalf = max(uWarpFace, 4.0) / max(uViewSize.x * 0.5, 1.0);
        float s = (distance - faceCenter) / max(faceHalf, 1e-4);
        float plate = smoothstep(-1.0, 1.0, s);
        float kink = exp(-s * s * max(uWarpSharpness, 0.35));
        float shift = min(uWarp * (plate * 0.88 + kink * 0.55), uViewSize.x * 0.14);
        shift *= (1.0 - rimHold);
        point.x -= direction * shift;
        point.y += (point.y - midY) * kink * (uWarp / max(uStripSize.y, 1.0));
      }
    }
    if (uWarpWave > 0.5 && warpWindow > 0.001) {
      float waveLen = max(uWarpWaveLength, 8.0);
      float blurNorm = clamp(uWarpWaveBlur / 28.0, 0.0, 1.0);
      if (uWarpWaveKind < 0.5) {
        float phase = (point.y - midY) * 6.283185 / waveLen;
        float rippleSharp = sin(phase) + 0.28 * sin(phase * 2.0 + 0.4);
        float ripple = mix(rippleSharp, sin(phase), blurNorm);
        float wave = uWarpWave * ripple * warpWindow;
        point.x -= direction * wave;
        point.y += cos(phase) * wave * 0.18;
      } else {
        float thickness = uWarpWave * warpWindow;
        float eps = mix(2.0, 10.0, blurNorm);
        float hRich = waveHeight(point, midY, waveLen);
        float hSoft = sin((point.y - midY) * 6.283185 / waveLen);
        float h = mix(hRich, hSoft, blurNorm);
        float hx = mix(
          waveHeight(point + vec2(eps, 0.0), midY, waveLen),
          sin((point.y - midY) * 6.283185 / waveLen),
          blurNorm
        );
        float hy = mix(
          waveHeight(point + vec2(0.0, eps), midY, waveLen),
          sin((point.y + eps - midY) * 6.283185 / waveLen),
          blurNorm
        );
        vec2 grad = vec2(hx - h, hy - h) / max(eps, 1e-4);
        float iorBend = 1.0 - 1.0 / 1.28;
        point -= grad * thickness * (14.0 * iorBend + 6.5);
        point -= grad * h * thickness * 0.22;
        point.y += h * thickness * 0.12;
      }
    }
  }

  // Coverage of the authored rail after geometric warp, before spectral
  // displacement. Outside the card silhouettes the renderer may keep
  // spectral fringes, but must not turn a dark sampled pixel into a
  // neutral grey veil on the white canvas.
  float authoredCoverage = sampleStrip(point).a;

  float dispersionExtent = uAmount * edge;
  float blurExtent = uBlur * edge + uWarpWaveBlur * warpWindow;
  float velocity = uVelocity;
  float span = dispersionExtent + blurExtent;
  float verticalExtent = blurExtent * 0.5;

  // Irregular halo envelope: a static screen-space noise field modulates how
  // far the smear and the halo reach at every row, so the edge dissolves into
  // a ragged organic contour instead of a straight wash. The field morphs
  // slowly with scroll, staying deterministic for any given position.
  float haloSwing = 1.0;
  float haloWave = 0.0;
  if (uTurbulence > 0.002 && edge > 0.0005) {
    float rowCoord = point.y * uTurbulenceFreq;
    float drift = uScroll * uTurbulenceFreq * 0.3;
    float sideSeed = direction > 0.0 ? 13.7 : 3.1;
    float envelope = fbm(vec2(rowCoord, sideSeed + drift));
    float ragged = fbm(vec2(rowCoord * 0.55 + 31.0, sideSeed * 1.7 - drift * 0.6));
    span *= mix(1.0, 0.55 + 1.05 * envelope, uTurbulence);
    haloSwing = mix(1.0, 0.25 + 1.95 * ragged, uTurbulence);
    haloWave = (envelope - 0.5) * uTurbulence;
  }
  float extent = span + abs(velocity);

  // Every sample is transparent beyond this conservative vertical reach.
  // Account for defocus, aura jitter/drift, and the gate's +/-9px taps.
  float verticalReach = max(
    9.0,
    verticalExtent * 2.5 + 12.0 + abs(haloWave * 34.0)
  );
  if (point.y < uPadY - verticalReach ||
      point.y > uPadY + uStripSize.y + verticalReach) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Stationary boundary light band ("aura gate"): two vertical curtains whose
  // centers are positioned independently from the nearest viewport edge.
  float gateCenter = 1.0 - clamp(uGateOffset, 0.0, 0.5) * 2.0;
  float gateHalf = max(uGateWidth, 1.0) / (uViewSize.x * 0.5);
  float gateS = (distance - gateCenter) / max(gateHalf, 1e-4);
  float band = exp(-gateS * gateS * 1.1);
  if (uGateRefraction > 0.01) {
    // Glass-ridge displacement: a smooth monotonic push at the curtain, so
    // crossing content visibly refracts without double exposure.
    float ridge = min(uGateRefraction, uGateWidth * 0.6);
    point.x += direction * exp(-gateS * gateS) * ridge;
  }
  vec4 color = vec4(0.0);
  if (extent < 0.5) {
    color = sampleStrip(point);
  } else {
    vec3 accumulated = vec3(0.0);
    vec3 weightSum = vec3(0.0);
    float alpha = 0.0;
    float alphaWeight = 0.0;
    for (int i = 0; i < MAX_SAMPLES; i++) {
      if (i >= uSamples) {
        break;
      }
      float index = float(i);
      float jitterX = ditherPhase(gl_FragCoord.xy + index * vec2(0.754, 0.569));
      float jitterY = fract(jitterX * 61.803398 + index * 0.381966);
      float t = (index + jitterX) / float(uSamples);
      float spread = t - 0.5;
      vec3 weight = spectralWeight(t);
      vec2 offset = vec2(
        direction * span * spread + velocity * spread * 2.0,
        (jitterY * 2.0 - 1.0) * verticalExtent
      );
      vec4 texel = sampleStrip(point + offset);
      accumulated += texel.rgb * weight;
      weightSum += weight;
      float luminanceWeight = (weight.r + weight.g + weight.b) / 3.0;
      alpha += texel.a * luminanceWeight;
      alphaWeight += luminanceWeight;
    }
    color = vec4(
      accumulated / max(weightSum, vec3(1e-5)),
      alpha / max(alphaWeight, 1e-5)
    );

    float auraGain = uAura * edge * min(haloSwing, 1.6);
    if (auraGain > 0.002) {
      vec3 auraColor = vec3(0.0);
      vec3 auraWeightSum = vec3(0.0);
      float auraAlpha = 0.0;
      float auraAlphaWeight = 0.0;
      for (int j = 0; j < AURA_SAMPLES; j++) {
        float index = float(j);
        float jitterX = ditherPhase(gl_FragCoord.xy + index * vec2(0.591, 0.812));
        float jitterY = fract(jitterX * 61.803398 + index * 0.618034);
        float t = (index + jitterX) / float(AURA_SAMPLES);
        float spread = t - 0.5;
        vec3 weight = spectralWeight(t);
        vec2 offset = vec2(
          direction * (span * 2.6 + 24.0) * haloSwing * spread +
            velocity * spread * 3.0,
          (jitterY * 2.0 - 1.0) * (verticalExtent * 2.5 + 12.0) +
            haloWave * 34.0
        );
        vec4 texel = sampleStrip(point + offset);
        auraColor += texel.rgb * weight;
        auraWeightSum += weight;
        float luminanceWeight = (weight.r + weight.g + weight.b) / 3.0;
        auraAlpha += texel.a * luminanceWeight;
        auraAlphaWeight += luminanceWeight;
      }
      vec3 halo = auraColor / max(auraWeightSum, vec3(1e-5));
      float haloAlpha = auraAlpha / max(auraAlphaWeight, 1e-5);
      color.rgb += halo * auraGain * (1.0 - color.rgb);
      color.a += haloAlpha * auraGain * 0.9 * (1.0 - color.a);
    }
  }

  float gateGain = uGateGlow * band;
  if (gateGain > 0.004) {
    // Light source: a small local blur of the (refracted) content feeding the
    // curtain, so crossing cards flare while empty background stays faint.
    vec4 lightSample =
      sampleStrip(point) * 0.34 +
      sampleStrip(point + vec2(7.0, 0.0)) * 0.22 +
      sampleStrip(point - vec2(7.0, 0.0)) * 0.22 +
      sampleStrip(point + vec2(0.0, 9.0)) * 0.11 +
      sampleStrip(point - vec2(0.0, 9.0)) * 0.11;
    // Neutral light at the band core, prism colors along its rims.
    vec3 ramp = spectralWeight(clamp(0.5 + gateS * 0.5, 0.0, 1.0));
    ramp /= max(ramp.r + ramp.g + ramp.b, 1e-4);
    vec3 tint = mix(vec3(1.0 / 3.0), ramp, clamp(abs(gateS), 0.0, 1.0));
    float motionKick = 1.0 + min(abs(uVelocity) / 48.0, 1.0) * 0.7;
    float flare = gateGain * motionKick;
    float lightCoverage = clamp(lightSample.a, 0.0, 1.0);
    vec3 add =
      lightSample.rgb * flare * 1.15 +
      tint * flare * lightCoverage * 0.55;
    float addAlpha = flare * lightCoverage * 0.78;
    color.rgb = color.rgb + add * (1.0 - color.rgb);
    color.a = color.a + addAlpha * (1.0 - color.a);
  }

  // A premultiplied neutral halo composites as a grey band on white. Remove
  // only that neutral component outside the original card silhouette; the
  // channel differences remain as the intended red/green/blue dispersion.
  float outsideAuthoredContent =
    1.0 - smoothstep(0.001, 0.08, authoredCoverage);
  float neutral = min(color.r, min(color.g, color.b));
  vec3 spectralFringe = max(color.rgb - vec3(neutral), vec3(0.0));
  float spectralAlpha = max(
    spectralFringe.r,
    max(spectralFringe.g, spectralFringe.b)
  );
  color = mix(
    color,
    vec4(spectralFringe, spectralAlpha),
    outsideAuthoredContent
  );

  float fadeAmount = uFade * pow(edge, 2.0);
  gl_FragColor = color * (1.0 - fadeAmount);
}
`,
  lY = 16384,
  uY = 48e6;
function dY(e, t, n) {
  let r = e.createShader(t);
  if (!r) throw Error(`The dispersion rail could not allocate a shader.`);
  if (
    (e.shaderSource(r, n),
    e.compileShader(r),
    !e.getShaderParameter(r, e.COMPILE_STATUS))
  ) {
    let t = e.getShaderInfoLog(r) ?? `unknown error`;
    throw (
      e.deleteShader(r),
      Error(`The dispersion rail shader failed to compile: ${t}`)
    );
  }
  return r;
}
function fY(e, t, n) {
  let r = Math.max(0.5, n),
    i = lY / Math.max(1, Math.max(e, t));
  r = Math.min(r, i);
  let a = e * t * r * r;
  return (
    a > uY && (r *= Math.sqrt(uY / a)),
    {
      height: Math.max(1, Math.round(t * r)),
      width: Math.max(1, Math.round(e * r)),
    }
  );
}
function pY(e, t, n) {
  let r = e.getContext(`webgl`, {
    alpha: !0,
    antialias: !1,
    depth: !1,
    premultipliedAlpha: !0,
    preserveDrawingBuffer: !0,
    stencil: !1,
  });
  if (!r) throw Error(`The dispersion rail requires WebGL support.`);
  let i = !1,
    a = !1,
    o = 1,
    s = 1,
    c = 1,
    l = {
      amount: 0,
      aura: 0,
      blur: 0,
      curve: 1,
      edgeWidth: 0,
      fade: 0,
      gateGlow: 0,
      gateOffset: 0.3,
      gateRefraction: 0,
      gateWidth: 1,
      hue: 0,
      includeText: !0,
      samples: 8,
      spectrum: 0,
      turbulence: 0,
      turbulenceScale: 130,
      warp: 0,
      warpFace: 56,
      warpOffset: 0,
      warpSharpness: 2,
      warpStyle: `stretch`,
      warpWave: 0,
      warpWaveBlur: 0,
      warpWaveKind: `glass`,
      warpWaveLength: 140,
    },
    u = 0,
    d = 0,
    f = !0,
    p = !0,
    m = null,
    h = null,
    g = null,
    _ = null,
    v = null,
    y = () => {
      ((f = !0), (p = !0));
      let e = dY(r, r.VERTEX_SHADER, sY),
        i = dY(r, r.FRAGMENT_SHADER, cY),
        a = r.createProgram();
      if (!a) throw Error(`The dispersion rail could not allocate a program.`);
      if (
        (r.attachShader(a, e),
        r.attachShader(a, i),
        r.linkProgram(a),
        r.deleteShader(e),
        r.deleteShader(i),
        !r.getProgramParameter(a, r.LINK_STATUS))
      ) {
        let e = r.getProgramInfoLog(a) ?? `unknown error`;
        throw (
          r.deleteProgram(a),
          Error(`The dispersion rail program failed to link: ${e}`)
        );
      }
      ((m = a),
        r.useProgram(m),
        (h = r.createBuffer()),
        r.bindBuffer(r.ARRAY_BUFFER, h),
        r.bufferData(
          r.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          r.STATIC_DRAW,
        ));
      let o = r.getAttribLocation(m, `aPosition`);
      (r.enableVertexAttribArray(o),
        r.vertexAttribPointer(o, 2, r.FLOAT, !1, 0, 0));
      let s = (e, t) => {
        let n = r.createTexture();
        if (!n)
          throw Error(`The dispersion rail could not allocate a texture.`);
        return (
          r.activeTexture(e),
          r.bindTexture(r.TEXTURE_2D, n),
          r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
          r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, !1),
          r.texImage2D(r.TEXTURE_2D, 0, r.RGBA, r.RGBA, r.UNSIGNED_BYTE, t),
          r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.LINEAR),
          r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR),
          r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE),
          r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE),
          n
        );
      };
      ((g = s(r.TEXTURE0, t.image)),
        (_ = s(r.TEXTURE1, t.text)),
        (v = {
          amount: r.getUniformLocation(m, `uAmount`),
          aura: r.getUniformLocation(m, `uAura`),
          blur: r.getUniformLocation(m, `uBlur`),
          curve: r.getUniformLocation(m, `uCurve`),
          edgeStart: r.getUniformLocation(m, `uEdgeStart`),
          fade: r.getUniformLocation(m, `uFade`),
          gateGlow: r.getUniformLocation(m, `uGateGlow`),
          gateOffset: r.getUniformLocation(m, `uGateOffset`),
          gateRefraction: r.getUniformLocation(m, `uGateRefraction`),
          gateWidth: r.getUniformLocation(m, `uGateWidth`),
          hue: r.getUniformLocation(m, `uHue`),
          includeText: r.getUniformLocation(m, `uIncludeText`),
          padY: r.getUniformLocation(m, `uPadY`),
          samples: r.getUniformLocation(m, `uSamples`),
          scroll: r.getUniformLocation(m, `uScroll`),
          spectrum: r.getUniformLocation(m, `uSpectrum`),
          strip: r.getUniformLocation(m, `uStrip`),
          text: r.getUniformLocation(m, `uText`),
          textRowRange: r.getUniformLocation(m, `uTextRowRange`),
          stripSize: r.getUniformLocation(m, `uStripSize`),
          turbulence: r.getUniformLocation(m, `uTurbulence`),
          turbulenceFreq: r.getUniformLocation(m, `uTurbulenceFreq`),
          velocity: r.getUniformLocation(m, `uVelocity`),
          viewSize: r.getUniformLocation(m, `uViewSize`),
          warp: r.getUniformLocation(m, `uWarp`),
          warpFace: r.getUniformLocation(m, `uWarpFace`),
          warpOffset: r.getUniformLocation(m, `uWarpOffset`),
          warpSharpness: r.getUniformLocation(m, `uWarpSharpness`),
          warpStyle: r.getUniformLocation(m, `uWarpStyle`),
          warpWave: r.getUniformLocation(m, `uWarpWave`),
          warpWaveBlur: r.getUniformLocation(m, `uWarpWaveBlur`),
          warpWaveKind: r.getUniformLocation(m, `uWarpWaveKind`),
          warpWaveLength: r.getUniformLocation(m, `uWarpWaveLength`),
        }),
        r.uniform1i(v.strip, 0),
        r.uniform1i(v.text, 1));
      let c = t.textRowRange ?? [0, 1];
      (r.uniform2f(v.textRowRange, c[0], c[1]),
        r.uniform2f(v.stripSize, n.stripWidth, n.stripHeight),
        r.uniform1f(v.padY, n.padY),
        r.disable(r.BLEND),
        r.disable(r.DEPTH_TEST),
        r.clearColor(0, 0, 0, 0));
    },
    b = (t) => {
      let n = fY(o, s, t);
      ((e.width !== n.width || e.height !== n.height) &&
        ((e.width = n.width), (e.height = n.height), (p = !0)),
        r.viewport(0, 0, n.width, n.height));
    },
    x = (e, t) => {
      i ||
        a ||
        !m ||
        !v ||
        (!p && e === u && t === d) ||
        ((u = e),
        (d = t),
        r.useProgram(m),
        r.uniform1f(v.scroll, e),
        r.uniform1f(v.velocity, t),
        (f &&=
          (r.uniform2f(v.viewSize, o, s),
          r.uniform1f(v.amount, l.amount),
          r.uniform1f(v.aura, l.aura),
          r.uniform1f(v.blur, l.blur),
          r.uniform1f(v.curve, l.curve),
          r.uniform1f(
            v.edgeStart,
            Math.min(0.999, Math.max(0, 1 - l.edgeWidth * 2)),
          ),
          r.uniform1f(v.fade, l.fade),
          r.uniform1f(v.gateGlow, Math.max(0, Math.min(1, l.gateGlow))),
          r.uniform1f(v.gateOffset, Math.max(0, Math.min(0.5, l.gateOffset))),
          r.uniform1f(v.gateRefraction, Math.max(0, l.gateRefraction)),
          r.uniform1f(v.gateWidth, Math.max(1, l.gateWidth)),
          r.uniform1f(v.hue, (l.hue * Math.PI) / 180),
          r.uniform1f(v.includeText, +!!l.includeText),
          r.uniform1i(
            v.samples,
            Math.max(2, Math.min(48, Math.round(l.samples))),
          ),
          r.uniform1f(v.spectrum, l.spectrum),
          r.uniform1f(v.turbulence, Math.max(0, Math.min(1, l.turbulence))),
          r.uniform1f(v.turbulenceFreq, 1 / Math.max(8, l.turbulenceScale)),
          r.uniform1f(v.warp, Math.max(0, l.warp)),
          r.uniform1f(v.warpFace, Math.max(4, l.warpFace)),
          r.uniform1f(
            v.warpOffset,
            Math.max(0, Math.min(0.9, l.warpOffset * 2)),
          ),
          r.uniform1f(v.warpSharpness, Math.max(0.35, l.warpSharpness)),
          r.uniform1f(v.warpStyle, +(l.warpStyle === `prism`)),
          r.uniform1f(v.warpWave, Math.max(0, l.warpWave)),
          r.uniform1f(v.warpWaveBlur, Math.max(0, l.warpWaveBlur)),
          r.uniform1f(v.warpWaveKind, +(l.warpWaveKind === `glass`)),
          r.uniform1f(v.warpWaveLength, Math.max(8, l.warpWaveLength)),
          !1)),
        r.drawArrays(r.TRIANGLES, 0, 3),
        (p = !1));
    },
    S = (e) => {
      (e.preventDefault(), (a = !0));
    },
    C = () => {
      ((a = !1), y(), b(c), x(u, d));
    };
  return (
    e.addEventListener(`webglcontextlost`, S, !1),
    e.addEventListener(`webglcontextrestored`, C, !1),
    y(),
    {
      dispose() {
        ((i = !0),
          e.removeEventListener(`webglcontextlost`, S),
          e.removeEventListener(`webglcontextrestored`, C),
          g && r.deleteTexture(g),
          _ && r.deleteTexture(_),
          h && r.deleteBuffer(h),
          m && r.deleteProgram(m),
          (g = null),
          (_ = null),
          (h = null),
          (m = null));
      },
      isContextLost() {
        return a;
      },
      render(e, t) {
        x(e, t);
      },
      setSize(e, t, n) {
        ((o !== Math.max(1, e) || s !== Math.max(1, t)) && ((f = !0), (p = !0)),
          (o = Math.max(1, e)),
          (s = Math.max(1, t)),
          (c = n),
          b(c),
          x(u, d));
      },
      setUniforms(e) {
        Object.keys(e).every((t) => e[t] === l[t]) ||
          ((l = e), (f = !0), (p = !0), x(u, d));
      },
      async snapshot(t, n) {
        if (i || a) throw Error(`The dispersion rail renderer is unavailable.`);
        let r = u,
          o = d;
        (b(n), x(t, 0));
        try {
          return await createImageBitmap(e);
        } finally {
          (b(c), x(r, o));
        }
      },
    }
  );
}
var mY = `carousel.scroll`,
  hY = 0.2,
  gY = 0.05,
  _Y = 1.6,
  vY = 140,
  yY = 480,
  bY = 420,
  xY = [0, 1, 2].flatMap((e) => xJ.map((t) => ({ card: t, cycle: e })));
function SY(e) {
  let t = Number(e);
  return Number.isFinite(t) ? Math.min(2, Math.max(1, t)) : 2;
}
function CY(e) {
  let t = Number(e);
  return Number.isFinite(t) ? $J(t) : wJ;
}
function wY(e) {
  ((e.scrollLeftRef.current = e.logical),
    (e.railScrollLeftRef.current = e.physical),
    e.surface && (e.surface.dataset.scrollLeft = e.logical.toFixed(3)),
    e.cleanTextTrack &&
      (e.cleanTextTrack.style.transform = `translate3d(${-e.physical}px, 0, 0)`));
}
function TY() {
  let { dispatch: e, state: t } = dE(),
    n = tR(),
    r = ZT(),
    i = kJ(t),
    a = JSON.stringify(i),
    [o, s] = F.useState(i),
    [c, l] = F.useState(null),
    u = F.useRef(c),
    d = F.useRef(null),
    f = F.useRef(null),
    p = F.useRef(null),
    m = F.useRef(null),
    h = F.useRef(null),
    g = F.useRef(CY(t.values[mY])),
    _ = F.useRef(CJ + g.current),
    v = F.useRef(null),
    y = F.useRef(`native`),
    b = F.useRef(() => void 0),
    x = F.useRef(() => void 0),
    S = F.useRef(null),
    C = F.useRef(!1),
    w = F.useRef(o),
    T = F.useRef({ frame: null, lastScroll: g.current, velocity: 0 });
  ((w.current = o),
    F.useLayoutEffect(() => {
      u.current = c;
    }, [c]));
  let E = F.useCallback(() => {
    let e = T.current;
    if (e.frame !== null) return;
    let t = () => {
      e.frame = null;
      let r = u.current;
      if (!r) return;
      let i = g.current,
        a = iY(i, e.lastScroll);
      ((e.lastScroll = i), (e.velocity += (a - e.velocity) * (hY * 2)));
      let o = w.current.velocity,
        s = Math.max(-140, Math.min(vY, e.velocity * o * _Y));
      (n ? n.runPass(RJ.preview, void 0, () => r.render(i, s)) : r.render(i, s),
        (Math.abs(e.velocity) > gY || a !== 0) &&
          (e.frame = window.requestAnimationFrame(t)));
    };
    e.frame = window.requestAnimationFrame(t);
  }, [n]);
  F.useEffect(() => {
    let e = !0,
      t = () => {
        e && s(i);
      },
      r = n ? n.runPass(RJ.preview, void 0, t) : t();
    return (
      Promise.resolve(r),
      () => {
        e = !1;
      }
    );
  }, [n, a]);
  let D = F.useCallback((e, t) => {
    wY({
      cleanTextTrack: p.current,
      logical: e,
      physical: t,
      railScrollLeftRef: _,
      scrollLeftRef: g,
      surface: d.current,
    });
  }, []);
  (F.useLayoutEffect(() => {
    let e = f.current;
    if (!e || C.current) return;
    C.current = !0;
    let n = CY(t.values[mY]),
      r = CJ + n;
    ((e.scrollLeft = r), (T.current.lastScroll = n), D(n, r));
  }, [D, t.values]),
    F.useLayoutEffect(() => {
      let e = p.current;
      e && (e.style.transform = `translate3d(${-_.current}px, 0, 0)`);
    }, [o.includeText]),
    F.useEffect(() => {
      let t = f.current;
      if (!t) return;
      let n = g.current,
        r = t.scrollLeft,
        i = () => {
          let t = Math.round($J(g.current) * 1e3) / 1e3;
          t !== n &&
            ((n = t),
            e({
              history: `skip`,
              label: `Store carousel position`,
              target: mY,
              type: `controls.setValue`,
              value: t,
            }));
        },
        a = (e) => {
          let n = $J(e),
            i = CJ + n;
          (D(n, i), (t.scrollLeft = i), (r = t.scrollLeft), E());
        };
      b.current = a;
      let o = () => {
          (a(eY(g.current)), i());
        },
        s = () => {
          l.isDragging() ||
            (v.current !== null && window.clearTimeout(v.current),
            (v.current = window.setTimeout(() => {
              ((v.current = null), o());
            }, yY)));
        };
      x.current = s;
      let c = () => {
          let e = S.current;
          (e?.frame !== null && e && window.cancelAnimationFrame(e.frame),
            (S.current = null));
        },
        l = aY(t, {
          onStart() {
            ((y.current = `mouse`),
              c(),
              v.current !== null &&
                (window.clearTimeout(v.current), (v.current = null)));
          },
          onDelta: (e) => a(g.current + e),
          onEnd() {
            ((y.current = `programmatic`), i());
          },
        }),
        u = (e) => {
          let n = rY(e, t.clientWidth);
          if (
            (e.stopPropagation(),
            n === 0 || (e.preventDefault(), l.isDragging()))
          )
            return;
          ((y.current = `native`), c());
          let r = $J(g.current + n);
          (D(r, CJ + r), E(), s());
        },
        d = () => {
          let e = t.scrollLeft;
          if (e === r || ((r = e), y.current !== `native`)) return;
          let n = $J(e - CJ);
          (D(n, e), E(), s());
        };
      return (
        t.addEventListener(`wheel`, u, { capture: !0, passive: !1 }),
        t.addEventListener(`scroll`, d, { passive: !0 }),
        () => {
          (l.dispose(),
            y.current === `mouse` && (y.current = `programmatic`),
            t.removeEventListener(`wheel`, u, !0),
            t.removeEventListener(`scroll`, d),
            v.current !== null && window.clearTimeout(v.current));
        }
      );
    }, [e, D, E]),
    F.useEffect(() => {
      let e = h.current;
      if (!e) return;
      let t = !1,
        n = null;
      return (
        KJ()
          .then((r) => {
            t ||
              ((n = pY(e, r, {
                padY: vJ.effectPadding,
                stripHeight: vJ.cardHeight,
                stripWidth: CJ,
              })),
              (e.dataset.dispersionCarouselCanvas = `true`),
              (e.dataset.toolcraftProductCanvas = `true`),
              l(n));
          })
          .catch(() => {}),
        () => {
          ((t = !0), n?.dispose(), l((e) => (e === n ? null : e)));
        }
      );
    }, []));
  let O = SY(t.values[`canvas.renderScale`]),
    ee = Math.max(1, t.canvas.zoom) / 100;
  (F.useEffect(() => {
    let e = m.current;
    if (!e || !c) return;
    let t = typeof window > `u` ? 1 : Math.max(1, window.devicePixelRatio || 1),
      n = () => {
        let n = Math.max(1, e.clientWidth),
          r = Math.max(1, e.clientHeight);
        c.setSize(n, r, t * O * ee);
      };
    n();
    let r = new ResizeObserver(n);
    return (r.observe(e), () => r.disconnect());
  }, [ee, c, O]),
    F.useEffect(() => {
      c &&
        (c.setUniforms({
          amount: Math.max(0, o.amount),
          aura: Math.max(0, Math.min(1, o.aura)),
          blur: Math.max(0, o.blur),
          curve: Math.max(0.2, o.curve),
          edgeWidth: Math.max(0, Math.min(50, o.edgeWidth)) / 100,
          fade: Math.max(0, Math.min(1, o.edgeFade)),
          gateGlow: Math.max(0, Math.min(1, o.gateGlow)),
          gateOffset: Math.max(0, Math.min(50, o.gateOffset)) / 100,
          gateRefraction: Math.max(0, o.gateRefraction),
          gateWidth: Math.max(1, o.gateWidth),
          hue: o.hue,
          includeText: o.includeText,
          samples: o.count,
          spectrum: Math.max(0, Math.min(1, o.spectrum)),
          turbulence: Math.max(0, Math.min(1, o.turbulence)),
          turbulenceScale: Math.max(8, o.turbulenceScale),
          warp: Math.max(0, o.warp),
          warpFace: Math.max(4, o.warpFace),
          warpOffset: Math.max(0, Math.min(40, o.warpOffset)) / 100,
          warpSharpness: Math.max(0.35, o.warpSharpness),
          warpStyle: o.warpStyle,
          warpWave: o.warpWaveEnabled ? Math.max(0, o.warpWave) : 0,
          warpWaveBlur: o.warpWaveEnabled ? Math.max(0, o.warpWaveBlur) : 0,
          warpWaveKind: o.warpWaveKind,
          warpWaveLength: Math.max(8, o.warpWaveLength),
        }),
        E());
    }, [c, o, E]),
    F.useEffect(() => {
      if (c)
        return JJ({
          getScrollLeft: () => g.current,
          snapshot: (e) => {
            if (c.isContextLost())
              throw Error(`The dispersion rail WebGL context is lost.`);
            return c.snapshot(g.current, e);
          },
        });
    }, [c]),
    F.useEffect(() => {
      let e = T.current;
      return () => {
        e.frame !== null &&
          (window.cancelAnimationFrame(e.frame), (e.frame = null));
        let t = S.current;
        (t?.frame !== null && t && window.cancelAnimationFrame(t.frame),
          (S.current = null));
      };
    }, []));
  let k = F.useCallback(
      (e) => {
        y.current = `programmatic`;
        let t = performance.now(),
          n = S.current,
          r = g.current;
        if (n) {
          let e = Math.min(1, Math.max(0, (t - n.start) / bY));
          ((r = n.from + (n.to - n.from) * tY(e)),
            n.frame !== null && window.cancelAnimationFrame(n.frame));
        }
        v.current !== null &&
          (window.clearTimeout(v.current), (v.current = null));
        let i = {
          frame: null,
          from: r,
          start: t,
          to: nY(n ? n.to : r, e > 0 ? 1 : -1),
        };
        S.current = i;
        let a = (e) => {
          if (S.current !== i) return;
          let t = Math.min(1, Math.max(0, (e - i.start) / bY)),
            n = $J(i.from + (i.to - i.from) * tY(t));
          if ((D(n, CJ + n), E(), t < 1)) {
            i.frame = window.requestAnimationFrame(a);
            return;
          }
          (b.current(n), (S.current = null), x.current());
        };
        i.frame = window.requestAnimationFrame(a);
      },
      [D, E],
    ),
    te = F.useCallback(() => k(-SJ), [k]),
    ne = F.useCallback(() => k(SJ), [k]),
    re = F.useCallback(
      (e) => {
        e.key === `ArrowLeft`
          ? (e.preventDefault(), te())
          : e.key === `ArrowRight` && (e.preventDefault(), ne());
      },
      [ne, te],
    ),
    A = r.rect,
    j = A?.width ?? vJ.canvasWidth,
    ie = A?.height ?? vJ.canvasHeight,
    ae = eK({ state: t });
  return (0, I.jsxs)(`div`, {
    "aria-label": `Figma customer-story carousel with screen-space edge dispersion`,
    className: oY.surface,
    "data-dispersion-carousel": `true`,
    ref: d,
    "data-carousel-loop": `seamless`,
    "data-aura-gate": o.gateGlow.toFixed(2),
    "data-aura-gate-offset": o.gateOffset.toFixed(2),
    "data-dispersion-amount": o.amount.toFixed(2),
    "data-dispersion-aura": o.aura.toFixed(2),
    "data-edge-blur": o.blur.toFixed(2),
    "data-edge-turbulence": o.turbulence.toFixed(2),
    "data-edge-warp": o.warp.toFixed(2),
    "data-edge-warp-offset": o.warpOffset.toFixed(2),
    "data-edge-warp-style": o.warpStyle,
    "data-edge-warp-wave": o.warpWaveEnabled ? o.warpWave.toFixed(2) : `0.00`,
    "data-edge-warp-wave-enabled": o.warpWaveEnabled ? `on` : `off`,
    "data-edge-warp-wave-kind": o.warpWaveKind,
    "data-edge-width": o.edgeWidth.toFixed(2),
    "data-rail-renderer": c ? `webgl` : `loading`,
    "data-scroll-left": g.current.toFixed(3),
    "data-text-effect": o.includeText ? `shader` : `clean`,
    "data-toolcraft-product-output": `true`,
    style: {
      backgroundColor: ae ? o.background : `transparent`,
      height: ie,
      width: j,
    },
    children: [
      (0, I.jsxs)(`header`, {
        className: oY.header,
        "data-carousel-header": `true`,
        children: [
          (0, I.jsx)(`h1`, {
            className: oY.title,
            "data-toolcraft-product-text": `true`,
            children: gJ,
          }),
          (0, I.jsxs)(`div`, {
            className: oY.navigation,
            "data-carousel-navigation": `true`,
            onPointerDown: (e) => e.stopPropagation(),
            children: [
              (0, I.jsx)(`button`, {
                "aria-label": `Previous slide`,
                className: oY.navigationButton,
                onClick: te,
                type: `button`,
                children: (0, I.jsx)(`span`, {
                  className: `${oY.chevron} ${oY.chevronPrevious}`,
                }),
              }),
              (0, I.jsx)(`button`, {
                "aria-label": `Next slide`,
                className: oY.navigationButton,
                onClick: ne,
                type: `button`,
                children: (0, I.jsx)(`span`, { className: oY.chevron }),
              }),
            ],
          }),
        ],
      }),
      (0, I.jsx)(`div`, {
        "aria-label": `Customer stories`,
        "aria-roledescription": `carousel`,
        className: oY.railViewport,
        "data-carousel-base": `true`,
        "data-rail-visual": c ? `hidden` : `fallback`,
        onKeyDownCapture: re,
        onPointerDown: (e) => {
          (e.pointerType !== `mouse` && (y.current = `native`),
            e.stopPropagation());
        },
        onWheelCapture: (e) => {
          (y.current === `mouse` ? e.preventDefault() : (y.current = `native`),
            e.stopPropagation());
        },
        ref: f,
        role: `region`,
        tabIndex: 0,
        children: (0, I.jsx)(`div`, {
          className: oY.railTrack,
          style: { width: TJ },
          children: xY.map(({ card: e, cycle: t }) =>
            (0, I.jsxs)(
              `article`,
              {
                "aria-hidden": t !== 1 || void 0,
                className: oY.card,
                "data-carousel-card": t === 1 ? e.id : void 0,
                "data-carousel-loop-copy": t,
                children: [
                  (0, I.jsx)(`img`, {
                    alt: t === 1 ? e.alt : ``,
                    className: oY.cardImage,
                    draggable: !1,
                    src: e.src,
                  }),
                  (0, I.jsx)(`p`, {
                    className: oY.testimonial,
                    "data-card-testimonial": t === 1 ? `true` : void 0,
                    "data-toolcraft-product-text": `true`,
                    children: e.testimonial,
                  }),
                ],
              },
              `${String(t)}-${e.id}`,
            ),
          ),
        }),
      }),
      (0, I.jsx)(`div`, {
        "aria-hidden": `true`,
        className: oY.dispersionRail,
        "data-dispersion-rail": `true`,
        ref: m,
        children: (0, I.jsx)(`canvas`, {
          className: oY.dispersionRailCanvas,
          ref: h,
        }),
      }),
      c && !o.includeText
        ? (0, I.jsx)(`div`, {
            "aria-hidden": `true`,
            className: oY.cleanTextViewport,
            "data-clean-text-overlay": `true`,
            children: (0, I.jsx)(`div`, {
              className: oY.cleanTextTrack,
              ref: p,
              style: {
                transform: `translate3d(${-_.current}px, 0, 0)`,
                width: TJ,
              },
              children: xY.map(({ card: e, cycle: t }) =>
                (0, I.jsx)(
                  `div`,
                  {
                    className: oY.cleanTextCard,
                    children: (0, I.jsx)(`p`, {
                      className: oY.testimonial,
                      children: e.testimonial,
                    }),
                  },
                  `${String(t)}-${e.id}`,
                ),
              ),
            }),
          })
        : null,
    ],
  });
}
var EY = {
  canvasContent: (0, I.jsx)(TY, {}),
  exportRenderer: QJ,
  modelPresentation: { mode: `runtime` },
  rendererPipelineRegistration: LJ,
  renderDefaultCanvasMedia: !1,
  sceneBoundsProvider: () => [
    { height: vJ.canvasHeight, width: vJ.trackWidth, x: 0, y: 0 },
  ],
  schema: PJ,
};
function DY() {
  return (0, I.jsx)($G, {
    canvasContent: EY.canvasContent,
    className: `h-dvh min-h-dvh`,
    controlRenderers: EY.controlRenderers,
    exportRenderer: EY.exportRenderer,
    infiniteCanvasContent: EY.infiniteCanvasContent,
    modelPresentation: EY.modelPresentation,
    onPanelAction: EY.onPanelAction,
    renderDefaultCanvasMedia: EY.renderDefaultCanvasMedia,
    rendererPipelineRegistration: EY.rendererPipelineRegistration,
    sceneBoundsProvider: EY.sceneBoundsProvider,
    schema: EY.schema,
  });
}
function OY() {
  return (0, I.jsx)(Da, {});
}
var kY = va({ component: OY }),
  AY = ga({ component: DY, getParentRoute: () => kY, path: `/` }),
  jY = kY.addChildren([AY]),
  MY = Ma({
    basepath: `/demos/aura-carousel/`.replace(/\/$/u, ``) || `/`,
    defaultPreload: `intent`,
    defaultPreloadStaleTime: 0,
    routeTree: jY,
    scrollRestoration: !0,
  }),
  NY = document.getElementById(`root`);
if (!NY) throw Error(`Root element #root was not found.`);
(0, Ia.createRoot)(NY).render(
  (0, I.jsx)(F.StrictMode, { children: (0, I.jsx)(Fa, { router: MY }) }),
);
