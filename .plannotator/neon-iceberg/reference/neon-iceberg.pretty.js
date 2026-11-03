var tje = {
    version: 2,
    appId: `neon-iceberg-2`,
    state: {
      values: {
        "export.includeBackground": !0,
        "appearance.background": `#FAFAFA`,
        "canvas.aspectRatio": {
          height: 4,
          mode: `preset`,
          value: `3:4`,
          width: 3,
        },
        "canvas.size.width": 1200,
        "canvas.size.height": 1600,
        "canvas.renderScale": 2,
        "canvas.rotationLocked": !1,
        "iceberg.height": 1.55,
        "iceberg.width": 2.18,
        "iceberg.sharpness": 1.39,
        "iceberg.asymmetry": 0.15,
        "iceberg.shoulder": 0.63,
        "iceberg.seed": 97,
        "view.orbit": {
          position: [5.398182941229226, 2.21363371348611, 4.971865516638815],
          up: [-0.21241246223585997, 0.9573959336839413, -0.19563734830638396],
        },
        "iceberg.ridges": 0.66,
        "iceberg.frequency": 3,
        "iceberg.erosion": 0,
        "iceberg.detail": 0.64,
        "iceberg.depth": 1.36,
        "iceberg.plateGap": 0.11,
        "iceberg.seamLevel": -0.03,
        "iceberg.seamValley": 0.33,
        "iceberg.seamPhase": 81,
        "iceberg.seamWarp": 0.52,
        "iceberg.seamTerraces": 0.6,
        "iceberg.seamJagged": 1,
        "iceberg.seamScale": 1,
        "iceberg.seamVariation": 0.5,
        "iceberg.seamFrequency": 11.1,
        "iceberg.cliff": 0.17,
        "iceberg.frontColumns": 32,
        "iceberg.rightColumns": 16,
        "iceberg.backColumns": 14,
        "iceberg.leftColumns": 10,
        "iceberg.gridThickness": 2.5,
        "iceberg.gridStrength": 0.5,
        "iceberg.planeLineThickness": 90,
        "iceberg.planeLineDensity": 84,
        "iceberg.planeLineDirection": 24,
        "iceberg.rockColor": `#D9DDE0`,
        "iceberg.iceColor": `#F0F1F2`,
        "iceberg.contrast": 0,
        "iceberg.grain": 0.65,
        "iceberg.light": 44,
        "iceberg.lightDrama": 0.66,
        "iceberg.engravingEnabled": !0,
        "iceberg.engravingStrength": 0.49,
        "iceberg.engravingScale": 0.65,
        "iceberg.engravingThickness": 51,
        "export.image.format": `png`,
        "export.image.resolution": `4k`,
        "export.video.format": `mp4`,
        "export.video.resolution": `4k`,
      },
      canvas: {
        offset: { x: -178.9712787005127, y: -179.04479436816 },
        size: { height: 1600, unit: `px`, width: 1200 },
        zoom: 130,
        mode: `finite`,
      },
      panels: {
        controls: {
          collapsedSections: {
            surface: !0,
            mountain: !0,
            rock: !0,
            base: !0,
            patterns: !0,
          },
          offset: { x: 0, y: 0 },
          scrollTop: 0,
        },
        layers: { offset: { x: 0, y: 0 } },
        timeline: { offset: { x: 0, y: 0 }, extended: !0 },
        toolbar: { offset: { x: 0, y: 0 } },
      },
      timeline: {
        currentTimeSeconds: 1.4322144685072953,
        durationSeconds: 2,
        expanded: !1,
        isLooping: !0,
        isPlaying: !0,
        selectedKeyframeId: null,
        keyframeGroups: [],
      },
      layers: [],
      selectedLayerId: null,
      mediaAssets: [],
    },
    resources: [],
    theme: `dark`,
  },
  nje = { id: `neon-iceberg-2`, title: `Neon Iceberg 2` },
  L9 = [
    {
      section: `mountain`,
      key: `height`,
      label: `Peak height`,
      value: 2.65,
      min: 0.5,
      max: 4,
      step: 0.01,
      help: `Height of the main peak above the base boundary.`,
    },
    {
      section: `mountain`,
      key: `width`,
      label: `Iceberg width`,
      value: 2.35,
      min: 1.2,
      max: 3.6,
      step: 0.01,
      help: `Width of the square cross section of the mountain and base.`,
    },
    {
      section: `mountain`,
      key: `sharpness`,
      label: `Sharpness`,
      value: 1.55,
      min: 0.65,
      max: 3,
      step: 0.01,
      help: `Shapes the slopes from broad shoulders to a narrow, sharp peak.`,
    },
    {
      section: `mountain`,
      key: `asymmetry`,
      label: `Asymmetry`,
      value: 0.3,
      min: -0.7,
      max: 0.7,
      step: 0.01,
      help: `Tilts the main ridge and shifts the peak in model space.`,
    },
    {
      section: `mountain`,
      key: `shoulder`,
      label: `Side peak`,
      value: 0.46,
      min: 0,
      max: 0.9,
      step: 0.01,
      help: `Height of the secondary peak to the left of the main ridge.`,
    },
    {
      section: `mountain`,
      key: `seed`,
      label: `Terrain seed`,
      value: 17,
      min: 1,
      max: 100,
      step: 1,
      help: `A repeatable variation of the rock folds and boundary.`,
    },
    {
      section: `rock`,
      key: `ridges`,
      label: `Fold depth`,
      value: 0.42,
      min: 0.05,
      max: 0.85,
      step: 0.01,
      help: `Depth of the vertical crevices running from the peak to the base.`,
    },
    {
      section: `rock`,
      key: `frequency`,
      label: `Fold frequency`,
      value: 9,
      min: 3,
      max: 24,
      step: 0.1,
      help: `Controls the main ridges. Higher values create narrower folds.`,
    },
    {
      section: `rock`,
      key: `erosion`,
      label: `Erosion`,
      value: 0.2,
      min: 0,
      max: 0.6,
      step: 0.01,
      help: `Breaks up smooth slopes and adds small outcrops.`,
    },
    {
      section: `rock`,
      key: `detail`,
      label: `Surface detail`,
      value: 0.48,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Fine roughness and cracks on the rock surface.`,
    },
    {
      section: `base`,
      key: `depth`,
      label: `Block depth`,
      value: 1.2,
      min: 0.65,
      max: 2.5,
      step: 0.01,
      help: `Distance from the boundary zero level to the flat bottom.`,
    },
    {
      section: `base`,
      key: `plateGap`,
      label: `Plate gap`,
      value: 0,
      min: 0,
      max: 0.6,
      step: 0.01,
      help: `Separates four equally thick plates below the recesses. The upper piece keeps the mountain, and grid lines outline every separated block edge. Deeper recesses leave thinner plates; 0 closes all four cuts.`,
    },
    {
      section: `base`,
      key: `seamLevel`,
      label: `Boundary level`,
      value: 0,
      min: -0.35,
      max: 0.6,
      step: 0.01,
      help: `Raises or lowers the boundary between the rock and the block.`,
    },
    {
      section: `base`,
      key: `seamValley`,
      label: `Valley depth`,
      value: 0.95,
      min: 0,
      max: 1.8,
      step: 0.01,
      help: `Depth of the large recesses that contain terraces and smaller chips.`,
    },
    {
      section: `base`,
      key: `seamPhase`,
      label: `Valley position`,
      value: 45,
      min: -180,
      max: 180,
      step: 1,
      unit: `°`,
      help: `Moves the main recess around the base, independently of the viewing angle.`,
    },
    {
      section: `base`,
      key: `seamWarp`,
      label: `Contour complexity`,
      value: 0.72,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Distorts the recesses, steepening one side and adding nested side cuts.`,
    },
    {
      section: `base`,
      key: `seamTerraces`,
      label: `Terraces`,
      value: 0.62,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Creates ledges and abrupt drops along the edges of large recesses.`,
    },
    {
      section: `base`,
      key: `seamJagged`,
      label: `Jagged edge`,
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Adds small chips and cuts along the existing rock and ice boundary. The overall profile and heights stay the same; 0 turns the pattern off.`,
    },
    {
      section: `base`,
      key: `seamScale`,
      label: `Chip scale`,
      value: 1,
      min: 1,
      max: 3,
      step: 0.01,
      unit: `×`,
      help: `Scales the width and depth of the jagged edge pattern up to three times. Requires Jagged edge above 0; the mountain shape and main valley positions stay the same.`,
    },
    {
      section: `base`,
      key: `seamVariation`,
      label: `Edge roughness`,
      value: 0.48,
      min: 0,
      max: 0.85,
      step: 0.01,
      help: `Depth of small notches and chips layered over the large valleys. For a level boundary, also set Valley depth to 0.`,
    },
    {
      section: `base`,
      key: `seamFrequency`,
      label: `Notch frequency`,
      value: 7.5,
      min: 2,
      max: 18,
      step: 0.1,
      help: `Controls the spacing of local notches and chips. The large valley shape is adjusted separately.`,
    },
    {
      section: `base`,
      key: `cliff`,
      label: `Edge cliff`,
      value: 0.36,
      min: 0,
      max: 0.8,
      step: 0.01,
      help: `Raises the rock rim above the block while keeping the seam connected.`,
    },
    {
      section: `patterns`,
      key: `frontColumns`,
      label: `Front columns`,
      value: 14,
      min: 1,
      max: 32,
      step: 1,
      discrete: !0,
      help: `Number of whole columns on the front face, shown on the left in the initial view. Fewer columns create larger square cells. The grid aligns with both vertical edges.`,
    },
    {
      section: `patterns`,
      key: `rightColumns`,
      label: `Right columns`,
      value: 10,
      min: 1,
      max: 32,
      step: 1,
      discrete: !0,
      help: `Number of whole columns on the right face in the initial view. Cell size on this face is independent of the others.`,
    },
    {
      section: `patterns`,
      key: `backColumns`,
      label: `Back columns`,
      value: 14,
      min: 1,
      max: 32,
      step: 1,
      discrete: !0,
      help: `Number of whole columns on the back face. Rotate the block to see the result.`,
    },
    {
      section: `patterns`,
      key: `leftColumns`,
      label: `Left columns`,
      value: 10,
      min: 1,
      max: 32,
      step: 1,
      discrete: !0,
      help: `Number of whole columns on the left side face, hidden in the initial view. Rotate the block to see the result.`,
    },
    {
      section: `patterns`,
      key: `gridThickness`,
      label: `Line thickness`,
      value: 5,
      min: 1,
      max: 20,
      step: 0.1,
      unit: `%`,
      help: `Line thickness on all side faces, relative to cell size. The top of the grid follows the uneven rock boundary.`,
    },
    {
      section: `patterns`,
      key: `gridStrength`,
      label: `Line strength`,
      value: 0.9,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Intensity of the dark grid on all side faces. At 0, the lines disappear.`,
    },
    {
      section: `patterns`,
      key: `planeLineThickness`,
      label: `Pattern line width`,
      value: 38,
      min: 5,
      max: 90,
      step: 1,
      unit: `%`,
      help: `Width of the dark printed lines on the four horizontal plate surfaces, measured as a percentage of their spacing.`,
    },
    {
      section: `patterns`,
      key: `planeLineDensity`,
      label: `Pattern density`,
      value: 42,
      min: 4,
      max: 96,
      step: 1,
      help: `Number of flowing print lines across the block. Higher values bring the lines closer together without making them thicker.`,
    },
    {
      section: `patterns`,
      key: `planeLineDirection`,
      label: `Pattern direction`,
      value: 15,
      min: -180,
      max: 180,
      step: 1,
      unit: `°`,
      help: `Average world-space flow direction of the curved lines on every horizontal plate.`,
    },
    {
      section: `surface`,
      key: `contrast`,
      label: `Contrast`,
      value: 0.72,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Deepens dark rock shadows and brightens exposed ridges.`,
    },
    {
      section: `surface`,
      key: `grain`,
      label: `Grain`,
      value: 0.23,
      min: 0,
      max: 0.65,
      step: 0.01,
      help: `Static photographic grain, matching the reference image.`,
    },
    {
      section: `surface`,
      key: `light`,
      label: `Light direction`,
      value: 55,
      min: -180,
      max: 180,
      step: 1,
      help: `Horizontal angle of the light source around the object.`,
      unit: `°`,
    },
    {
      section: `surface`,
      key: `lightDrama`,
      label: `Dramatic lighting`,
      value: 0.75,
      min: 0,
      max: 1,
      step: 0.01,
      help: `Low side lighting with deep shadows and bright lit faces. Also affects engraving. At 0, restores the original soft lighting.`,
    },
    {
      section: `engraving`,
      key: `engravingStrength`,
      label: `Engraving strength`,
      value: 1,
      min: 0.05,
      max: 1,
      step: 0.01,
      help: `Blends the original rock material with engraved hatching. The cube grid stays unchanged.`,
    },
    {
      section: `engraving`,
      key: `engravingScale`,
      label: `Stroke scale`,
      value: 1,
      min: 0.5,
      max: 3,
      step: 0.01,
      help: `Higher values increase the spacing between strokes. Horizontal direction and relative scale remain consistent when rotating, zooming and exporting.`,
    },
    {
      section: `engraving`,
      key: `engravingThickness`,
      label: `Stroke thickness`,
      value: 50,
      min: 15,
      max: 100,
      step: 1,
      unit: `%`,
      help: `Controls line coverage: strokes are wider in shadows and thinner on lit ridges. Follows the lighting on each surface.`,
    },
  ],
  R9 = { position: [4, 2.6, 6], up: [0, 1, 0] },
  z9 = (e) => `iceberg.${e}`;
Object.fromEntries(L9.map((e) => [e.key, e.value]));
function B9(e) {
  return {
    ...Object.fromEntries(
      L9.map((t) => [t.key, Number(e[z9(t.key)] ?? t.value)]),
    ),
    rockColor: String(e[`iceberg.rockColor`] ?? `#D9DDE0`),
    iceColor: String(e[`iceberg.iceColor`] ?? `#F0F1F2`),
    engravingEnabled: e[`iceberg.engravingEnabled`] === !0,
  };
}
function V9(e) {
  return Object.fromEntries(
    L9.filter((t) => t.section === e).map((e) => [
      e.key,
      {
        type: `slider`,
        target: z9(e.key),
        label: e.label,
        description: e.help,
        defaultValue: e.value,
        min: e.min,
        max: e.max,
        step: e.step,
        ...(`discrete` in e
          ? { sliderValueKind: `discrete`, variant: `discrete` }
          : { sliderValueKind: `continuous` }),
        applicability:
          e.section === `engraving`
            ? {
                mode: `conditional`,
                all: [{ target: `iceberg.engravingEnabled`, equals: !0 }],
              }
            : { mode: `always` },
        keyframeable: !1,
        performanceRole: `responsiveness`,
        performanceReason: `Updates bounded mesh deformation or material uniforms without allocating topology.`,
        ...(`unit` in e ? { unit: e.unit } : {}),
      },
    ]),
  );
}
var rje = `export-settings`,
  ije = `iceberg.settingsExport`,
  aje = ({ action: e, state: t }) => {
    e.value === `export-settings` && hOe(t);
  },
  H9 = (e, t, n) => ({
    type: `color`,
    target: e,
    label: t,
    defaultValue: n,
    applicability: { mode: `always` },
    keyframeable: !1,
    semanticGroup: `material-tones`,
    performanceRole: `responsiveness`,
    performanceReason: `Updates one surface color uniform.`,
  }),
  oje = $Ae({
    defaults: tje,
    base: {
      identity: nje,
      canvas: {
        enabled: !0,
        draggable: !0,
        upload: !1,
        size: { width: 1200, height: 1600, unit: `px` },
        sizing: { mode: `editable-output` },
        renderScale: !0,
      },
      panels: {
        controls: {
          title: `Iceberg`,
          sections: [
            {
              id: `background`,
              title: `Background`,
              controls: {
                include: {
                  type: `switch`,
                  target: `export.includeBackground`,
                  defaultValue: !0,
                  label: `Background`,
                  applicability: { mode: `always` },
                  performanceRole: `responsiveness`,
                  performanceReason: `Runtime toggles the background layer.`,
                },
                color: H9(
                  `appearance.background`,
                  `Background color`,
                  `#FFFFFF`,
                ),
              },
            },
            {
              id: `settings`,
              title: `Settings Export`,
              controls: {
                exportSettings: {
                  type: `actions`,
                  target: ije,
                  label: !1,
                  defaultValue: null,
                  actions: [
                    {
                      value: rje,
                      label: `Export Settings`,
                      icon: `download-simple`,
                      variant: `outline`,
                    },
                  ],
                  applicability: { mode: `always` },
                  keyframeable: !1,
                  performanceRole: `responsiveness`,
                  performanceReason: `Serializes one immutable runtime state snapshot to a JSON download.`,
                },
              },
            },
            {
              id: `mountain`,
              title: `Mountain`,
              controls: {
                ...V9(`mountain`),
                orientation: {
                  type: `orientationGizmo`,
                  target: `view.orbit`,
                  defaultValue: R9,
                  label: !1,
                  keyframeable: !1,
                  applicability: { mode: `always` },
                  performanceRole: `responsiveness`,
                  performanceReason: `Camera pose changes only rendering uniforms.`,
                },
              },
            },
            { id: `rock`, title: `Rock relief`, controls: V9(`rock`) },
            { id: `base`, title: `Base`, controls: V9(`base`) },
            {
              id: `patterns`,
              title: `Base patterns`,
              controls: V9(`patterns`),
            },
            {
              id: `surface`,
              title: `Material`,
              controls: {
                rock: H9(`iceberg.rockColor`, `Rock`, `#D9DDE0`),
                ice: H9(`iceberg.iceColor`, `Ice`, `#F0F1F2`),
                ...V9(`surface`),
                engravingEnabled: {
                  type: `switch`,
                  target: `iceberg.engravingEnabled`,
                  label: `Engraving`,
                  description: `Horizontal tonal hatching only on the rock, like a printed illustration.`,
                  defaultValue: !1,
                  applicability: { mode: `always` },
                  keyframeable: !1,
                  performanceRole: `responsiveness`,
                  performanceReason: `Toggles one bounded fragment material effect on the retained scene.`,
                },
                ...V9(`engraving`),
              },
            },
          ],
        },
      },
      toolbar: { history: !0, radar: !0, zoom: !0, theme: !0 },
    },
    modules: [
      OOe(),
      P7({ mode: `playback`, defaultDurationSeconds: 1.2 }),
      wOe(),
      POe(),
    ],
  });
function U9(e) {
  return Math.max(0, Math.min(1, e));
}
function sje(e) {
  let t = Math.max(0, e.currentTimeSeconds);
  return (
    1 -
    (1 -
      U9(
        e.isLooping
          ? KEe({ currentTimeSeconds: t, durationSeconds: e.durationSeconds })
          : U9(t / e.durationSeconds),
      )) **
      4
  );
}
function W9(e, t) {
  let n = B9(e);
  return { ...n, plateGap: n.plateGap * sje(t) };
}
var G9 = [
    ...L9.map((e) => z9(e.key)),
    `iceberg.rockColor`,
    `iceberg.iceColor`,
    `iceberg.engravingEnabled`,
    `view.orbit`,
  ],
  K9 = Vae()({
    runtimeId: `iceberg-three-v1`,
    passes: [
      {
        id: `resources`,
        kind: `preprocess`,
        runsOn: `main`,
        output: `source`,
        quality: `full`,
        inputs: [`surface`],
        invalidatedBy: [`renderer-mount`],
        cacheKey: [`surface`],
        lifecycle: { cache: `retained-resource`, resourceScope: `renderer` },
        cost: { dimensions: [], frequency: `once`, relationship: `constant` },
      },
      {
        id: `preview`,
        kind: `rasterize`,
        runsOn: `gpu`,
        output: `preview`,
        quality: `retina`,
        inputs: [...G9, `timeline.time`, `canvas.renderScale`, `canvas.zoom`],
        invalidatedBy: [
          ...G9,
          `timeline.time`,
          `canvas.renderScale`,
          `canvas.zoom`,
        ],
        lifecycle: { cache: `none`, resourceScope: `call` },
        cost: {
          dimensions: [`preview-scale`],
          frequency: `frame`,
          relationship: `quadratic`,
        },
        gpu: {
          stage: `render`,
          resources: `uniforms-only`,
          state: `stateless`,
          surfaces: [`preview`],
        },
      },
      {
        id: `export`,
        kind: `export`,
        runsOn: `gpu`,
        output: `export`,
        quality: `export`,
        inputs: [
          ...G9,
          `timeline.time`,
          `export.image.resolution`,
          `export.image.format`,
        ],
        invalidatedBy: [`export`, `timeline.time`],
        lifecycle: { cache: `none`, resourceScope: `call` },
        cost: {
          dimensions: [`export-edge`],
          frequency: `batch`,
          relationship: `quadratic`,
        },
        gpu: {
          stage: `render`,
          resources: `uniforms-only`,
          state: `stateless`,
          surfaces: [`export`],
        },
      },
    ],
    interactionInvalidation: [
      {
        interaction: `initial-render`,
        targets: [],
        invalidates: [`resources`, `preview`],
      },
      {
        interaction: `control-drag`,
        targets: [
          ...G9.filter((e) => e !== `iceberg.engravingEnabled`),
          `canvas.renderScale`,
        ],
        invalidates: [`preview`],
        mustNotInvalidate: [`resources`],
      },
      {
        interaction: `control-change`,
        targets: [`iceberg.engravingEnabled`],
        invalidates: [`preview`],
        mustNotInvalidate: [`resources`],
      },
      {
        interaction: `control-change`,
        targets: [
          `export.includeBackground`,
          `appearance.background`,
          `export.image.format`,
          `export.image.resolution`,
          `canvas.size.width`,
          `canvas.size.height`,
          `canvas.aspectRatio`,
          `canvas.infinity`,
          `canvas.rotationLocked`,
        ],
        invalidates: [],
        mustNotInvalidate: [`resources`, `preview`],
      },
      {
        interaction: `viewport-drag`,
        targets: [`canvas.offset`],
        invalidates: [],
        mustNotInvalidate: [`resources`, `preview`],
      },
      {
        interaction: `viewport-zoom`,
        targets: [`canvas.zoom`],
        invalidates: [`preview`],
        mustNotInvalidate: [`resources`],
      },
      {
        interaction: `timeline-playback`,
        targets: [`timeline.time`],
        invalidates: [`preview`],
        mustNotInvalidate: [`resources`],
      },
      {
        interaction: `timeline-scrub`,
        targets: [`timeline.time`],
        invalidates: [`preview`],
        mustNotInvalidate: [`resources`],
      },
      {
        interaction: `export`,
        targets: [`actions.output`],
        invalidates: [`export`],
        retainedAccesses: [`resources`],
        mustNotInvalidate: [`preview`],
      },
    ],
  });
function cje(e) {
  let t = Math.max(0.12, e.seamLevel + e.depth - 0.12),
    n = e.seamLevel - t,
    r = Math.min(0.16, t * 0.25),
    i = e.seamLevel - t * (1 - Math.exp(-e.seamValley / t)) - e.seamVariation,
    a = i < n + r ? n + r * Math.exp((i - n - r) / r) : i;
  return (e.depth + Math.min(e.seamLevel, a)) / 4;
}
function lje(e, t) {
  return (e - 4) * t;
}
var uje = `
uniform float uFrontColumns, uRightColumns, uBackColumns, uLeftColumns;
uniform float uGridThickness, uGridStrength;
uniform vec3 uViewDirection;

float cubePatternInk(
  vec3 world,
  float region,
  float rockMask,
  float slice,
  float plateGap,
  float plateThickness
) {
  // Ice cutouts also occupy the sloped cap. Evaluate their ink on the virtual
  // cube plane along the orthographic sight ray, so lines continue straight
  // through the join instead of wrapping around the mountain's triangles.
  if(max(abs(uViewDirection.x),abs(uViewDirection.z))<0.00001) return 0.0;
  vec2 travel=vec2(1000000.0);
  if(abs(uViewDirection.x)>0.00001)
    travel.x=(sign(uViewDirection.x)*uWidth*0.5-world.x)/uViewDirection.x;
  if(abs(uViewDirection.z)>0.00001)
    travel.y=(sign(uViewDirection.z)*uWidth*0.5-world.z)/uViewDirection.z;
  vec3 plane=world+uViewDirection*max(0.0,min(travel.x,travel.y));
  // The same planar derivatives keep line weight continuous at the join.
  float footprint=max(length(dFdx(plane)),length(dFdy(plane)));
  if(region>1.5||rockMask>=1.0) return 0.0;
  // A visible cap cutout can belong to a far cube edge. Its nearest physical
  // boundary must face the camera before projecting ink onto the near plane;
  // otherwise the far side's pattern appears painted over the upper slope.
  vec2 boundaryNormal=abs(world.x)>=abs(world.z)
    ?vec2(sign(world.x),0.0):vec2(0.0,sign(world.z));
  if(dot(boundaryNormal,uViewDirection.xz)<=0.00001) return 0.0;
  bool zFace=travel.y<=travel.x;
  float columns=zFace
    ? (uViewDirection.z>=0.0?uFrontColumns:uBackColumns)
    : (uViewDirection.x>=0.0?uRightColumns:uLeftColumns);
  // Numeric entry/import may contain fractions. Tile subdivision is discrete
  // even during a smooth pointer drag, so never render a partial last column.
  columns=clamp(floor(columns+0.5),1.0,32.0);
  float across=zFace?plane.x:plane.z;
  // Both vertical edges land on integer grid lines. The same world spacing
  // vertically keeps tiles square, independently of block width and depth.
  float frequency=columns/uWidth;
  vec2 q=vec2(across+uWidth*0.5,plane.y+uDepth)*frequency;
  vec2 distance=abs(fract(q+0.5)-0.5);
  // Each separated solid keeps a continuous ink line along its straight top
  // and bottom edges, even when those heights fall between the square grid's
  // regular rows. Draw it on the side wall so the horizontal top surfaces
  // remain clean while their perimeter stays legible.
  float blockEdgeDistance=1000000.0;
  if(plateGap>0.0&&region>0.5&&region<1.5) {
    if(slice<4.0) {
      float plateBottom=-uDepth+slice*plateThickness;
      float plateTop=plateBottom+plateThickness;
      blockEdgeDistance=min(abs(plane.y-plateBottom),abs(plane.y-plateTop))*frequency;
    } else {
      float upperBottom=-uDepth+4.0*plateThickness;
      blockEdgeDistance=abs(plane.y-upperBottom)*frequency;
    }
  }
  float halfStroke=uGridThickness*0.005;
  float aa=max(0.0001,footprint*frequency*0.6);
  // Replace the nearest regular horizontal row around a separated boundary.
  // Keeping both rows lets two almost-coincident strokes merge into a heavy
  // band. The perimeter remains visible, but uses a lighter stroke because it
  // is already reinforced visually by the dark printed plane beside it.
  float horizontalDistance=blockEdgeDistance<0.5?1000000.0:distance.y;
  float regularDistance=min(distance.x,horizontalDistance);
  float regularLines=1.0-smoothstep(halfStroke-aa,halfStroke+aa,regularDistance);
  float edgeHalfStroke=halfStroke*0.5;
  float edgeLines=1.0-smoothstep(edgeHalfStroke-aa,edgeHalfStroke+aa,blockEdgeDistance);
  float lines=max(regularLines,edgeLines);
  float average=1.0-pow(1.0-2.0*halfStroke,2.0);
  return mix(lines,average,smoothstep(0.35,1.0,aa))*uGridStrength;
}
`,
  dje = `
uniform float uPlaneLineThickness, uPlaneLineDensity, uPlaneLineDirection;

float platePlaneLineInk(vec3 world, float region, float slice) {
  // Region 3 is the upward-facing face of each lower plate. Keep the mountain,
  // upper block and vertical grid on their existing materials.
  if(region<2.5||slice>=4.0) return 0.0;

  // Rotate a world-space line basis, then bend its cross-axis coordinate with
  // low-frequency noise. This keeps a readable common direction while avoiding
  // mechanically straight stripes. Slice phase varies the four exposed prints.
  float angle=radians(uPlaneLineDirection);
  vec2 direction=vec2(cos(angle),sin(angle));
  vec2 acrossAxis=vec2(-direction.y,direction.x);
  vec2 q=world.xz/max(0.0001,uWidth);
  vec2 local=vec2(dot(q,direction),dot(q,acrossAxis));
  float slicePhase=uSeed*0.071+slice*8.41;
  vec2 warp=vec2(
    noise2(local*vec2(1.45,1.10)+vec2(slicePhase,11.3)),
    noise2(local*vec2(1.15,1.70)+vec2(19.7,slicePhase))
  )-0.5;
  float broad=noise2((local+warp*0.34)*vec2(2.35,1.75)+vec2(slicePhase,7.1))-0.5;
  float detail=noise2((local+warp*0.16)*vec2(6.2,3.8)+vec2(23.4,slicePhase))-0.5;
  float displacement=broad*0.24+detail*0.065;
  float density=clamp(uPlaneLineDensity,4.0,96.0);
  float phase=(local.y+displacement)*density+slice*0.37;
  float lineDistance=abs(fract(phase)-0.5);
  float halfWidth=clamp(uPlaneLineThickness,5.0,90.0)*0.005;
  float aa=clamp(fwidth(phase)*0.55,0.001,0.24);
  return 1.0-smoothstep(halfWidth-aa,halfWidth+aa,lineDistance);
}

float platePlanePrintShade(
  float litShade,
  float ink,
  float grain,
  float region,
  float slice
) {
  // The exposed plate planes read as a graphic printed material rather than
  // another lit grid face. Keep almost-white paper and almost-black ink stable
  // under the scene light, with only a small amount of the shared film grain.
  float planeMask=step(2.5,region)*(1.0-step(3.5,slice));
  float printShade=clamp(mix(0.985,0.025,ink)+grain*0.08,0.025,1.0);
  return mix(litShade,printShade,planeMask);
}
`,
  fje = `
uniform bool uEngravingEnabled;
uniform float uEngravingStrength, uEngravingScale, uEngravingThickness;
varying float vPrintY;

float engravedStripeIntegral(float phase, float coverage) {
  return floor(phase)*coverage+min(fract(phase),coverage);
}
float engraveRock(float shade) {
  if(!uEngravingEnabled) return shade;
  // A printing-screen coordinate, rather than surface height: every stroke
  // stays horizontal while lighting and relief keep describing the 3D rock.
  float coverage=clamp((1.0-clamp(shade,0.0,1.0))*uEngravingThickness/50.0,0.015,0.965);
  float phase=vPrintY*280.0/max(0.5,uEngravingScale)+coverage*0.5;
  float footprint=max(fwidth(vPrintY)*280.0/max(0.5,uEngravingScale),0.0001);
  // Integrate the periodic ink stroke over a pixel. Fine lines retain their
  // average tone when zoomed out, using the same pattern for preview/export.
  float ink=(engravedStripeIntegral(phase+footprint*0.5,coverage)
            -engravedStripeIntegral(phase-footprint*0.5,coverage))/footprint;
  float engraving=mix(0.98,0.045,clamp(ink,0.0,1.0));
  return mix(shade,engraving,uEngravingStrength);
}
`,
  q9 = `
uniform float uHeight, uWidth, uSharpness, uAsymmetry, uShoulder, uSeed;
uniform float uRidges, uFrequency, uErosion, uDetail;
uniform float uDepth, uSeamLevel, uSeamVariation, uSeamFrequency, uCliff;
uniform float uSeamValley, uSeamPhase, uSeamWarp, uSeamTerraces;
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise2(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) { return noise2(p)*0.53+noise2(p*2.07+8.1)*0.27+noise2(p*4.13+19.3)*0.13+noise2(p*8.17+2.4)*0.07; }
float angularNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float polarAngle(vec2 p) {
  // Keep axis vertices (including the origin) out of atan's undefined input.
  return p.x==0.0 ? sign(p.y)*1.57079632679 : atan(p.y,p.x);
}
float seam(vec2 p) {
  vec2 s=vec2(uSeed*1.13,uSeed*0.71);
  // Warp the coordinates, so nested cuts have unequal shoulders and widths.
  vec2 warp=vec2(noise2(p*1.65+s),noise2(p*2.1+s+vec2(8.4,3.7)))-0.5;
  vec2 q=p+warp*uSeamWarp*0.58;
  float angle=polarAngle(p);
  float bentAngle=angle+uSeamWarp*(warp.x*1.6+sin(angle*3.0+uSeed)*0.18);
  float bay=pow(smoothstep(-0.65,0.96,cos(bentAngle-radians(uSeamPhase))),1.55);
  // The angular excavation has no direction at the center of the height field.
  bay*=smoothstep(0.0,0.15,length(p));
  // Unequally spaced shelves sit inside the broad excavation.
  float shelves=0.24*smoothstep(0.12,0.21,bay)
               +0.33*smoothstep(0.38,0.49,bay)
               +0.43*smoothstep(0.73,0.88,bay);
  float excavation=mix(bay,shelves,uSeamTerraces*0.8);
  vec2 cutCoords=q*uSeamFrequency*0.48+s;
  float cuts=noise2(cutCoords);
  float cutSteps=0.55*smoothstep(0.26,0.36,cuts)+0.45*smoothstep(0.62,0.76,cuts);
  cuts=mix(cuts,cutSteps,uSeamTerraces);
  vec2 nestedCoords=cutCoords*2.37+vec2(cuts*2.1,warp.y*3.0);
  float nested=mix(noise2(nestedCoords),angularNoise(nestedCoords),uSeamWarp);
  float chips=angularNoise(cutCoords*5.13+vec2(nested*1.7,0.0));
  float fracture=(cuts*0.58+nested*0.28+chips*0.14)*2.0-1.0;
  // Limit the large excavation first, preserving the small cuts in deep bays.
  float clearance=max(0.12,uSeamLevel+uDepth-0.12);
  float floorLevel=uSeamLevel-clearance;
  float height=uSeamLevel-clearance*(1.0-exp(-uSeamValley*excavation/clearance))+uSeamVariation*fracture;
  float cushion=min(0.16,clearance*0.25);
  return height<floorLevel+cushion
    ? floorLevel+cushion*exp((height-floorLevel-cushion)/cushion)
    : height;
}
float terrain(vec2 p,float boundary) {
  vec2 peak=vec2(uAsymmetry*0.42,-uAsymmetry*0.18);
  vec2 q=p-peak;
  vec2 extent=vec2(q.x>0.0?1.0-peak.x:1.0+peak.x,q.y>0.0?1.0-peak.y:1.0+peak.y);
  float d=clamp(max(abs(q.x)/extent.x,abs(q.y)/extent.y),0.0,1.0);
  float radius=length(q);
  float angle=polarAngle(q);
  vec2 ns=vec2(uSeed*0.83,uSeed*1.29);
  float warp=fbm(p*3.0+ns);
  // Each integer harmonic closes around the mountain. Blend their heights
  // for fractional frequencies; multiplying the angle by a fractional count
  // creates a height jump at -PI / PI and a thin vertical fin in the mesh.
  float frequency=floor(uFrequency), phase=warp*2.8+radius*1.1;
  float lowerFolds=pow(abs(sin(angle*frequency*0.5+phase)),1.4);
  float upperFolds=pow(abs(sin(angle*(frequency+1.0)*0.5+phase)),1.4);
  float folds=mix(lowerFolds,upperFolds,fract(uFrequency));
  float ridgeShape=1.0-uRidges*folds*smoothstep(0.025,0.28,radius);
  float mainPeak=pow(max(0.0,1.0-d),uSharpness)*uHeight*ridgeShape;
  float sideDistance=length((p-vec2(-0.46,0.08))*vec2(1.0,1.2));
  float sidePeak=pow(max(0.0,1.0-sideDistance/0.65),1.35)*uHeight*uShoulder;
  // The shoulder's support reaches beyond the square. Taper only its outer
  // strip so the cap meets the wall at the exact same seam height.
  sidePeak*=smoothstep(0.0,0.12,1.0-d);
  float mountain=max(mainPeak,sidePeak);
  float envelope=sin(min(d,1.0-d)*3.14159265);
  mountain+=uCliff*pow(max(0.0,envelope),0.35)*(0.55+0.45*warp);
  mountain+=(fbm(p*15.0+ns)*2.0-1.0)*uErosion*envelope;
  mountain+=(noise2(p*52.0+ns)-0.5)*uDetail*0.12*envelope;
  return uSeamLevel+(boundary-uSeamLevel)*pow(d,2.5)+max(0.0,mountain);
}
`,
  pje = `
${q9}
attribute float region;
attribute float slice;
uniform float uPlateGap, uPlateThickness;
varying float vSlice;
varying float vPrintY;
varying vec3 vWorld;
varying float vRegion;
varying float vSeamDistance;
varying vec3 vBoundaryNormal;
varying vec3 vIceNormal;
vec3 boundaryNormal(vec2 edge) {
  // Sample the same inner rock slope for cap and wall vertices. This carries
  // the relief's lighting through a material cut without displacing geometry.
  float e=1.0/192.0;
  vec2 c=edge*(1.0-e);
  vec2 dx=vec2(e,0.0), dz=vec2(0.0,e);
  float hx=terrain(c+dx,seam(c+dx))-terrain(c-dx,seam(c-dx));
  float hz=terrain(c+dz,seam(c+dz))-terrain(c-dz,seam(c-dz));
  return normalize(vec3(-hx,e*uWidth,-hz));
}
void main() {
  vec3 p=position;
  vec2 ground=p.xz;
  float radius=max(abs(ground.x),abs(ground.y));
  vec2 edge=ground/max(0.0001,radius);
  float boundary=seam(ground);
  float bottom=uPlateGap>0.0?-uDepth+4.0*uPlateThickness:-uDepth;
  if(slice<4.0) p.y=-uDepth+(slice+position.y)*uPlateThickness;
  else if(region<0.5) p.y=terrain(ground,boundary);
  else if(region<1.5) p.y=mix(bottom,boundary,position.y);
  else p.y=bottom;
  vSeamDistance=p.y-boundary;
  if(region<0.5) {
    // Distance to the physical perimeter, not an interior height-field contour.
    vSeamDistance=length(vec3((ground-edge)*uWidth*0.5,p.y-seam(edge)));
  }
  vBoundaryNormal=boundaryNormal(edge);
  vIceNormal=abs(edge.x)>=abs(edge.y)?vec3(sign(edge.x),0,0):vec3(0,0,sign(edge.y));
  p.xz*=uWidth*0.5;
  vWorld=p; vRegion=region; vSlice=slice;
  // Print and grain stay in the unsplit material coordinates. Only geometry
  // translates, so the grid travels with each rigid plate.
  p.y+=(slice-4.0)*uPlateGap;
  vec4 viewPosition=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*viewPosition;
  // Printing scale/phase stays fixed when the render frame grows around it.
  vPrintY=viewPosition.y/7.0+0.5;
}
`,
  mje = `
${q9}
uniform vec3 uRockColor, uIceColor;
uniform float uPlateGap, uPlateThickness;
varying float vSlice;
uniform float uContrast, uGrain, uLight, uLightDrama, uSeamJagged, uSeamScale;
varying vec3 vWorld;
varying float vRegion;
varying float vSeamDistance;
varying vec3 vBoundaryNormal;
varying vec3 vIceNormal;
float grain3(vec3 p) { return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
${uje}
${dje}
${fje}
float edgeRockMask() {
  float original=vRegion<0.5?1.0:0.0;
  // This setting changes only the material contour, never vertex heights.
  float band=uSeamJagged*uSeamScale*0.10;
  float aa=clamp(fwidth(vSeamDistance)*0.4,0.0001,0.008);
  if(band<=0.0||abs(vSeamDistance)>=band||vRegion>1.5||vSlice<4.0) return original;
  // A two-dimensional, world-anchored cut pattern creates lateral notches too.
  vec2 q=vec2(vWorld.x*19.0+vWorld.z*23.0,vWorld.y*27.0)/uSeamScale+uSeed;
  vec2 warp=vec2(noise2(q*0.81+7.1),noise2(q*0.91+19.4))-0.5;
  float cuts=(angularNoise(q+warp*2.0)-0.5)*1.2;
  cuts+=(angularNoise(q*2.7+warp)-0.5)*0.42;
  float distance=vSeamDistance+band*cuts;
  return smoothstep(-aa,aa,distance);
}
void main() {
  // At zero keep the original unsplit topology's output, including its bottom.
  if(uPlateGap<=0.0&&vSlice<4.0) discard;
  vec3 n=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
  if(!gl_FrontFacing) n=-n;
  float a=radians(uLight);
  // Lower the key light and remove fill together, so drama reveals facet
  // direction instead of merely darkening the whole image. Zero is the
  // original lighting, including its azimuth and ambient contribution.
  vec3 softLight=vec3(cos(a)*1.5,2.6,-sin(a)*0.65);
  vec3 sideLight=vec3(cos(a)*1.5,0.7,-sin(a)*0.65);
  vec3 light=normalize(mix(softLight,sideLight,uLightDrama));
  float band=uSeamJagged*uSeamScale*0.10;
  float join=band>0.0&&abs(vSeamDistance)<band&&vRegion<1.5
    ? (1.0-smoothstep(0.0,band,max(0.0,vSeamDistance)))*smoothstep(0.0,0.15,uSeamJagged)
    : 0.0;
  vec3 rockNormal=join>0.0?normalize(mix(n,normalize(vBoundaryNormal),join)):n;
  vec3 iceNormal=join>0.0&&vRegion<0.5?normalize(mix(n,normalize(vIceNormal),join)):n;
  float diffuse=max(0.0,dot(rockNormal,light));
  vec2 veins=vWorld.xz*7.5+vec2(vWorld.y*0.42,uSeed);
  float striation=fbm(veins+vec2(fbm(vWorld.xz*4.0+uSeed),0.0)*3.0);
  float micro=(noise2(vWorld.xz*90.0+vWorld.y*vec2(4,2))-0.5)*uDetail;
  float rockShade=mix(0.25,0.045,uLightDrama)
                 +pow(diffuse,mix(1.0,1.2,uLightDrama))*mix(0.95,1.65,uLightDrama);
  rockShade*=mix(0.55,1.2,smoothstep(0.25,0.72,striation+micro*0.3));
  rockShade=mix(rockShade,smoothstep(0.16,0.8,rockShade),uContrast);
  rockShade=engraveRock(rockShade);
  float iceShade=mix(0.57,0.38,uLightDrama)
                +max(0.0,dot(iceNormal,light))*mix(0.46,0.66,uLightDrama);
  float rockMask=edgeRockMask();
  iceShade*=1.0-0.93*cubePatternInk(vWorld,vRegion,rockMask,vSlice,uPlateGap,uPlateThickness);
  float planeInk=platePlaneLineInk(vWorld,vRegion,vSlice);
  vec3 tint=mix(uIceColor,uRockColor,rockMask);
  float shade=mix(iceShade,rockShade,rockMask);
  float grain=(grain3(floor(vWorld*1050.0))-0.5)*uGrain;
  shade=clamp(shade+grain*mix(0.65,1.1,rockMask),0.025,1.0);
  shade=platePlanePrintShade(shade,planeInk,grain,vRegion,vSlice);
  vec3 c=pow(tint,vec3(1.0/2.2))*shade;
  gl_FragColor=vec4(c,1.0);
}
`;
function hje() {
  let e = [],
    t = [],
    n = [];
  for (let n = 0; n <= 192; n++)
    for (let r = 0; r <= 192; r++)
      (e.push((r / 192) * 2 - 1, 0, (n / 192) * 2 - 1), t.push(0));
  for (let e = 0; e < 192; e++)
    for (let t = 0; t < 192; t++) {
      let r = e * 193 + t,
        i = r + 1,
        a = r + 192 + 1,
        o = a + 1;
      n.push(r, a, i, i, a, o);
    }
  let r = (e, t) =>
    e === 0 ? [t, 1] : e === 1 ? [1, -t] : e === 2 ? [-t, -1] : [-1, t];
  for (let i = 0; i < 4; i++) {
    let a = e.length / 3;
    for (let n = 0; n <= 192; n++) {
      let [a, o] = r(i, (n / 192) * 2 - 1);
      (e.push(a, 0, o, a, 1, o), t.push(1, 1));
    }
    for (let e = 0; e < 192; e++) {
      let t = a + e * 2;
      n.push(t, t + 2, t + 1, t + 1, t + 2, t + 3);
    }
  }
  let i = e.length / 3;
  (e.push(-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1),
    t.push(2, 2, 2, 2),
    n.push(i, i + 1, i + 2, i, i + 2, i + 3));
  let a = Array(t.length).fill(4),
    o = [
      [-1, 0, 1, 1, 0, 1, 1, 1, 1, -1, 1, 1],
      [1, 0, 1, 1, 0, -1, 1, 1, -1, 1, 1, 1],
      [1, 0, -1, -1, 0, -1, -1, 1, -1, 1, 1, -1],
      [-1, 0, -1, -1, 0, 1, -1, 1, 1, -1, 1, -1],
      [-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1],
      [-1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1],
    ];
  for (let r = 0; r < 4; r++)
    for (let [i, s] of o.entries()) {
      let o = e.length / 3;
      (e.push(...s),
        t.push(...[, , , ,].fill(i < 4 ? 1 : i === 4 ? 2 : 3)),
        a.push(r, r, r, r),
        n.push(o, o + 1, o + 2, o, o + 2, o + 3));
    }
  let s = new oe();
  return (
    s.setAttribute(`position`, new ze(e, 3)),
    s.setAttribute(`region`, new ze(t, 1)),
    s.setAttribute(`slice`, new ze(a, 1)),
    s.setIndex(n),
    s
  );
}
var J9 = 0.66,
  Y9 = { x: -500, y: -700, width: 1e3, height: 1400 };
function X9(e, t) {
  let n = e.width * 0.5,
    r =
      e.seamLevel +
      e.seamVariation +
      e.height * Math.max(1, e.shoulder) +
      e.cliff +
      e.erosion +
      e.detail * 0.06,
    i = new Ie(t.position[0], t.position[1], t.position[2]),
    a = new Ie(t.up[0], t.up[1], t.up[2]),
    o = new N().lookAt(i, new Ie(), a).elements,
    s = Y9.x,
    c = Y9.x + Y9.width,
    l = Y9.y,
    u = Y9.y + Y9.height,
    d = -e.depth + lje(0, e.plateGap);
  for (let e of [-n, n])
    for (let t of [d, r])
      for (let r of [-n, n]) {
        let n = t - J9,
          i = (o[0] * e + o[1] * n + o[2] * r) * 200,
          a = -(o[4] * e + o[5] * n + o[6] * r) * 200;
        ((s = Math.min(s, Math.floor(i - 8))),
          (c = Math.max(c, Math.ceil(i + 8))),
          (l = Math.min(l, Math.floor(a - 8))),
          (u = Math.max(u, Math.ceil(a + 8))));
      }
  return { x: s, y: l, width: c - s, height: u - l };
}
function gje(e, t, n) {
  let r = X9(t, n);
  ((e.left = r.x / 200),
    (e.right = (r.x + r.width) / 200),
    (e.top = -r.y / 200),
    (e.bottom = -(r.y + r.height) / 200),
    e.updateProjectionMatrix(),
    e.position
      .set(n.position[0], n.position[1], n.position[2])
      .normalize()
      .multiplyScalar(12),
    (e.position.y += J9),
    e.up.set(n.up[0], n.up[1], n.up[2]),
    e.lookAt(0, J9, 0),
    e.updateMatrixWorld());
}
function _je(e) {
  let t = new WN({
    canvas: e,
    alpha: !0,
    antialias: !0,
    preserveDrawingBuffer: !0,
  });
  (t.setClearColor(0, 0), (t.toneMapping = 0));
  let n = new C(),
    r = new S(-2.5, 2.5, 3.5, -3.5, 0.01, 100),
    i = Object.fromEntries(
      L9.map((e) => [
        `u${e.key[0].toUpperCase()}${e.key.slice(1)}`,
        { value: e.value },
      ]),
    );
  ((i.uRockColor = { value: new ce(`#D9DDE0`) }),
    (i.uIceColor = { value: new ce(`#F0F1F2`) }),
    (i.uViewDirection = { value: new Ie() }),
    (i.uEngravingEnabled = { value: !1 }),
    (i.uPlateThickness = { value: 0 }));
  let a = new U({
      vertexShader: pje,
      fragmentShader: mje,
      uniforms: i,
      side: 2,
    }),
    o = hje(),
    s = new Ge(o, a);
  ((s.frustumCulled = !1), n.add(s));
  let c = null,
    l = null;
  function u(e, t) {
    for (let t of L9)
      i[`u${t.key[0].toUpperCase()}${t.key.slice(1)}`].value = e[t.key];
    (i.uRockColor.value.set(e.rockColor),
      i.uIceColor.value.set(e.iceColor),
      (i.uEngravingEnabled.value = e.engravingEnabled),
      (i.uPlateThickness.value = cje(e)),
      i.uViewDirection.value
        .set(t.position[0], t.position[1], t.position[2])
        .normalize(),
      gje(r, e, t));
  }
  function d(i, a, o, s) {
    ((c = i),
      (l = a),
      u(i, a),
      (e.width !== o || e.height !== s) && t.setSize(o, s, !1),
      t.setRenderTarget(null),
      t.render(n, r));
  }
  function f(n, r) {
    let i = e.getBoundingClientRect(),
      a = Math.floor(((n - i.left) / i.width) * e.width),
      o = Math.floor(((i.bottom - r) / i.height) * e.height);
    if (a < 0 || o < 0 || a >= e.width || o >= e.height) return !1;
    let s = t.getContext(),
      c = new Uint8Array(4);
    return (s.readPixels(a, o, 1, 1, s.RGBA, s.UNSIGNED_BYTE, c), c[3] > 127);
  }
  async function p(e, i, a) {
    a.signal.throwIfAborted();
    let o = Math.max(1, Math.round(a.frame.width * a.pixelRatio)),
      s = Math.max(1, Math.round(a.frame.height * a.pixelRatio)),
      d = new De(o, s, { format: Ae, type: Pe, depthBuffer: !0 });
    try {
      (u(e, i), t.setRenderTarget(d), t.render(n, r));
      let c = new Uint8Array(o * s * 4);
      t.readRenderTargetPixels(d, 0, 0, o, s, c);
      let l = new Uint8ClampedArray(c.length);
      for (let e = 0; e < s; e++)
        l.set(c.subarray((s - e - 1) * o * 4, (s - e) * o * 4), e * o * 4);
      let f = await createImageBitmap(new ImageData(l, o, s));
      try {
        (a.signal.throwIfAborted(),
          a.context.drawImage(
            f,
            a.frame.x,
            a.frame.y,
            a.frame.width,
            a.frame.height,
          ));
      } finally {
        f.close();
      }
    } finally {
      (t.setRenderTarget(null),
        d.dispose(),
        c && l && (u(c, l), t.render(n, r)));
    }
  }
  return {
    canvas: e,
    draw: d,
    hitTest: f,
    exportFrame: p,
    dispose: () => {
      (o.dispose(), a.dispose(), t.dispose(), t.forceContextLoss());
    },
  };
}
function vje(e) {
  let t = n6(),
    [n, r] = (0, J.useState)(null),
    [i, a] = (0, J.useState)(null);
  if (
    ((0, J.useEffect)(() => {
      if (!e || !t) return;
      let n = !0,
        i = K9.getPass(`resources`),
        o = () =>
          t.runPass(i, { surface: `iceberg` }, (t) =>
            t.getOrCreateResource(
              [`iceberg`],
              () => _je(e),
              (e) => e.dispose(),
            ),
          );
      return (
        (async () => {
          let a = await o();
          (a.canvas !== e &&
            (await t.invalidatePass(i).cleanup, (a = await o())),
            n && r(a));
        })().catch((e) => {
          n &&
            a(
              Error(`Unable to create the 3D scene. This app requires WebGL.`, {
                cause: e,
              }),
            );
        }),
        () => {
          n = !1;
        }
      );
    }, [e, t]),
    i)
  )
    throw i;
  return n?.canvas === e ? n : null;
}
var yje = { canvas: `_canvas_kk8y1_1` },
  bje = [...G9, `canvas.renderScale`];
function xje() {
  let [e, t] = (0, J.useState)(null),
    n = xz(),
    r = n6(),
    i = Bz(
      (e) => e.values,
      (e, t) => bje.every((n) => e[n] === t[n]),
    ),
    a = Bz(
      (e) => ({
        currentTimeSeconds: e.timeline.currentTimeSeconds,
        durationSeconds: e.timeline.durationSeconds,
        isLooping: e.timeline.isLooping,
      }),
      (e, t) =>
        e.currentTimeSeconds === t.currentTimeSeconds &&
        e.durationSeconds === t.durationSeconds &&
        e.isLooping === t.isLooping,
    ),
    o = Bz((e) => e.canvas.zoom),
    s = r7(),
    [c, l] = (0, J.useState)(!1),
    u = (0, J.useRef)(a),
    d = s || c;
  d || (u.current = a);
  let f = d ? u.current : a,
    [p, m] = (0, J.useState)(() => window.devicePixelRatio || 1),
    h = (0, J.useRef)(null),
    g = vje(e);
  h.current = g;
  let _ = JQ({
    target: `view.orbit`,
    hitTest: (e, t) => h.current?.hitTest(e, t) ?? !1,
  });
  return (
    (0, J.useEffect)(() => {
      let e = () => m(window.devicePixelRatio || 1);
      return (
        window.addEventListener(`resize`, e),
        () => window.removeEventListener(`resize`, e)
      );
    }, []),
    (0, J.useEffect)(() => {
      if (!g || !r || n.kind !== `ready`) return;
      let e = Number(i[`canvas.renderScale`] ?? 2) * (o / 100) * p;
      r.runPass(K9.getPass(`preview`), void 0, () => {
        g.draw(
          W9(i, f),
          i[`view.orbit`] ?? R9,
          Math.max(1, Math.round(n.rect.width * e)),
          Math.max(1, Math.round(n.rect.height * e)),
        );
      });
    }, [
      g,
      r,
      i,
      f,
      o,
      p,
      n.kind,
      n.kind === `ready` ? n.rect.width : 0,
      n.kind === `ready` ? n.rect.height : 0,
    ]),
    (0, Y.jsx)(`canvas`, {
      ref: t,
      className: yje.canvas,
      "data-iceberg-canvas": ``,
      "data-canvas-model-layer": `iceberg`,
      "data-toolcraft-model-orbit-surface": `true`,
      "data-toolcraft-product-output": ``,
      "aria-label": `3D iceberg`,
      onPointerDown: (e) => {
        (_.onPointerDown(e),
          e.currentTarget.hasPointerCapture(e.pointerId) && l(!0));
      },
      onPointerMove: _.onPointerMove,
      onPointerUp: (e) => {
        (_.onPointerUp(e), l(!1));
      },
      onPointerCancel: (e) => {
        (_.onPointerCancel(e), l(!1));
      },
      onLostPointerCapture: (e) => {
        (_.onLostPointerCapture(e), l(!1));
      },
    })
  );
}
var Z9 = uOe(oje, {
  actions: { onPanelAction: aje },
  renderer: { pipelineRegistration: K9 },
  scene: {
    canvasContent: (0, Y.jsx)(xje, {}),
    renderDefaultCanvasMedia: !1,
    sceneBoundsProvider: ({ state: e }) => [
      X9(B9(e.values), e.values[`view.orbit`] ?? R9),
    ],
    rasterFrameRenderer: {
      baseFileName: `iceberg`,
      renderFrame: async (e) => {
        if (!e.rendererPipeline)
          throw Error(`Iceberg renderer is unavailable.`);
        if (!e.rendererPipeline.getSnapshot().passes.resources?.activeResources)
          throw Error(`Wait for the iceberg preview to finish loading.`);
        let t = await e.rendererPipeline.runPass(
          K9.getPass(`resources`),
          { surface: `iceberg` },
          (e) =>
            e.getOrCreateResource(
              [`iceberg`],
              () => {
                throw Error(`Iceberg preview is not ready.`);
              },
              (e) => e.dispose(),
            ),
        );
        await e.rendererPipeline.runPass(K9.getPass(`export`), void 0, () =>
          t.exportFrame(
            W9(e.state.values, e.state.timeline),
            e.state.values[`view.orbit`] ?? R9,
            e,
          ),
        );
      },
    },
  },
});
