// Lab core for the extrude-type component. The page is a slab of marble with every letter
// cut into it. Each letter is a marble piston resting just below the surface, so at rest the
// text reads as an engraving. Letters near the pointer slide up out of their slots, hold
// briefly, then sink back in.
import * as THREE from "three";
import { Font, type FontData } from "three/addons/loaders/FontLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

export type ExtrudeTypeOptions = {
  title: string;
  body: string;
  font: FontData;
  /** Brush radius in body ems. */
  radius?: number;
  /** Tallest a raised letter stands above the page, in body ems. */
  peak?: number;
  /** Deepest a resting letter sits below the page, in body ems. Each word rests at its own depth. */
  depth?: number;
  /** Seconds a raised letter holds before sinking. */
  hold?: number;
  /** Seconds a fully raised letter takes to sink. */
  sink?: number;
  /** Light elevation above the page, degrees. Lower means longer shadows. */
  elevation?: number;
  /** Half-range of the key light's elevation in degrees. Wider means softer shadow tails. */
  spread?: number;
  /** Marble colour, shared by the page and every letter. */
  marble?: string;
  /** Cool key light; it lights the marble wherever nothing blocks it. */
  keyColor?: string;
  keyIntensity?: number;
  /** Warm fill; shadows only receive this, so it sets their yellow tint. */
  fillColor?: string;
  fillIntensity?: number;
  /** Darkening toward the lower right, as a multiply factor at the far corner. */
  falloff?: number;
  /** Self-lit share of the marble, standing in for light scattering through the stone. */
  glow?: number;
  /** Soft-focus radius in CSS px, like the shallow focus of the reference photo. */
  soften?: number;
  /** Plays one phantom brush sweep on mount so the effect is discoverable. */
  intro?: boolean;
};

type Letter = {
  mesh: THREE.InstancedMesh;
  index: number;
  cx: number;
  cy: number;
};

type Placement = { ch: string; x: number; y: number; size: number; advance: number; word: number };
type Row = { top: number; bottom: number };

const TITLE_SCALE = 2.1;
const LINE_HEIGHT = 1.42;
const TITLE_GAP = 1.6;
const MARGIN = 2.5;
// Slab thickness below the surface, in body ems. Pistons never sink below it.
const SLAB = 1;
// Rounded top edge of each letter, in glyph units, kept a fixed thickness at any height.
const BEVEL = 0.03;
// Gap between a letter and the wall of its slot, in glyph units. Without it the two
// surfaces coincide and flicker.
const CLEARANCE = 0.004;
const CURVE_SEGMENTS = 6;

// Places each piston vertex: the body (z in 0..1) spans from the slab floor up to the
// letter's height minus the cap, the rounded cap (z > 1) rides on top, the bottom bevel
// stays buried under the slab.
const HEIGHT_CHUNK = `#include <begin_vertex>
  float bodyTop = aHeight - ${BEVEL.toFixed(3)};
  transformed.z = transformed.z <= 0.0 ? ${(-SLAB).toFixed(3)} + transformed.z
    : transformed.z <= 1.0 ? mix(${(-SLAB).toFixed(3)}, bodyTop, transformed.z)
    : bodyTop + (transformed.z - 1.0);`;
const withHeight = <M extends THREE.Material>(material: M) => {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aHeight;")
      .replace("#include <begin_vertex>", HEIGHT_CHUNK);
  };
  material.customProgramCacheKey = () => "extrude-type-height";
  return material;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
// Stable per-index variation for tower heights and resting depths.
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** Mounts the scene into `host` and returns a cleanup function. */
export function mountExtrudeType(host: HTMLElement, options: ExtrudeTypeOptions) {
  const {
    title,
    body,
    radius = 3.6,
    peak = 2.4,
    depth = 0.1,
    hold = 0.35,
    sink = 1.5,
    elevation = 22,
    spread = 7,
    marble = "#ececec",
    keyColor = "#d9e1fc",
    keyIntensity = 4.75,
    fillColor = "#fff7d1",
    fillIntensity = 1.25,
    falloff = 0.9,
    glow = 0.08,
    soften = 0.7,
    intro = true,
  } = options;
  const font = new Font(options.font);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor("#d4d4d6");
  renderer.domElement.style.cssText = `display:block;width:100%;height:100%;touch-action:pan-y${soften > 0 ? `;filter:blur(${soften}px)` : ""}`;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  // Light falloff across the page, brighter near the light (upper left).
  const shade = document.createElement("div");
  const f = Math.round(falloff * 255);
  shade.style.cssText = `position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;background:linear-gradient(to bottom right,#fff 15%,rgb(${f},${f},${f}) 100%)`;
  host.append(shade);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 4000);

  // Shadows in the reference are a warm olive while lit marble is a cool grey. Shadowed
  // texels see only the fill, so a yellow fill under a blue-leaning key reproduces both.
  scene.add(new THREE.HemisphereLight(fillColor, fillColor, fillIntensity));
  // The key is a broad source, approximated by lights spread across elevations, so a
  // shadow is darkest at its foot and fades along its length.
  const KEY_SAMPLES = [-1, -0.5, 0, 0.5, 1];
  // Lit marble brightness scales with sin(elevation); normalise so `keyIntensity` means the
  // same brightness at any elevation (calibrated at 24 degrees).
  const meanSin =
    KEY_SAMPLES.reduce((sum, u) => sum + Math.sin(THREE.MathUtils.degToRad(elevation + spread * u)), 0) /
    KEY_SAMPLES.length;
  const perSun = (keyIntensity * Math.sin(THREE.MathUtils.degToRad(24))) / meanSin / KEY_SAMPLES.length;
  const suns = KEY_SAMPLES.map(() => {
    const sun = new THREE.DirectionalLight(keyColor, perSun);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 4;
    scene.add(sun, sun.target);
    return sun;
  });

  // One marble for everything: the slab and the letters are the same stone.
  const marbleParams: THREE.MeshPhysicalMaterialParameters = {
    color: marble,
    emissive: "#f7f3ea",
    emissiveIntensity: glow,
    roughness: 0.6,
    sheen: 0.6,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color("#fff4de"),
    metalness: 0,
  };
  const slabMaterial = new THREE.MeshPhysicalMaterial(marbleParams);
  const letterMaterial = withHeight(new THREE.MeshPhysicalMaterial(marbleParams));
  const depthMaterial = withHeight(new THREE.MeshDepthMaterial());

  // The slab is rebuilt on every layout: a frame around the text block plus one strip per
  // line with that line's letters cut out of it.
  const slab = new THREE.Mesh(new THREE.BufferGeometry(), slabMaterial);
  slab.castShadow = true;
  slab.receiveShadow = true;
  scene.add(slab);

  // Glyph outlines at unit size, cached per character: the outer contours become slots in
  // the slab, the counters (inside of o, a, e) become islands that stay in the slab.
  const outlines = new Map<string, { outers: THREE.Vector2[][]; counters: THREE.Vector2[][] }>();
  const outlineOf = (ch: string) => {
    let o = outlines.get(ch);
    if (!o) {
      const shapes = font.generateShapes(ch, 1);
      o = {
        outers: shapes.map((s) => s.getPoints(CURVE_SEGMENTS)),
        counters: shapes.flatMap((s) => s.holes.map((h) => h.getPoints(CURVE_SEGMENTS))),
      };
      outlines.set(ch, o);
    }
    return o;
  };

  // One piston geometry per distinct character, instanced. Instances scale x/y by font size;
  // a per-instance `aHeight` sets where the letter's top sits.
  const glyphs = new Map<string, THREE.InstancedMesh>();
  const chars = [...title.replace(/\s+/g, ""), ...body.replace(/\s+/g, "")];
  const counts = new Map<string, number>();
  for (const ch of chars) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const [ch, count] of counts) {
    const extruded = new THREE.ExtrudeGeometry(font.generateShapes(ch, 1), {
      depth: 1,
      curveSegments: CURVE_SEGMENTS,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      // The body is inset by the clearance so it slides inside its slot without touching.
      bevelOffset: -BEVEL - CLEARANCE,
      bevelSegments: 4,
    });
    // Welding gives smooth normals across the rounded cap.
    extruded.deleteAttribute("normal");
    extruded.deleteAttribute("uv");
    const geometry = mergeVertices(extruded, 1e-5);
    geometry.computeVertexNormals();
    extruded.dispose();
    const height = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    height.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aHeight", height);
    const mesh = new THREE.InstancedMesh(geometry, letterMaterial, count);
    mesh.customDepthMaterial = depthMaterial;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    glyphs.set(ch, mesh);
    scene.add(mesh);
  }

  const resolution = options.font.resolution;
  const advanceOf = (ch: string) => (options.font.glyphs[ch]?.ha ?? options.font.glyphs["?"]?.ha ?? 500) / resolution;
  const wordWidth = (w: string) => [...w].reduce((sum, ch) => sum + advanceOf(ch), 0);
  const space = advanceOf(" ");

  // Greedy line breaking at width `w` (body ems). Body lines are ragged right, title lines
  // centred. Returns each letter's placement and each line's vertical band.
  const layout = (w: number) => {
    const placements: Placement[] = [];
    const rows: Row[] = [];
    let wordIndex = 0;
    const set = (text: string, size: number, top: number, mode: "center" | "left") => {
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[][] = [];
      let line: string[] = [];
      let width = 0;
      for (const word of words) {
        const ww = wordWidth(word) * size;
        const next = line.length ? width + space * size + ww : ww;
        if (line.length && next > w) {
          lines.push(line);
          line = [word];
          width = ww;
        } else {
          line.push(word);
          width = next;
        }
      }
      if (line.length) lines.push(line);
      let y = top;
      for (const ln of lines) {
        const rowTop = y;
        y -= size;
        const natural = ln.reduce((s, word) => s + wordWidth(word) * size, 0) + space * size * (ln.length - 1);
        let x = mode === "center" ? -natural / 2 : -w / 2;
        for (const word of ln) {
          for (const ch of word) {
            const advance = advanceOf(ch) * size;
            placements.push({ ch, x, y, size, advance, word: wordIndex });
            x += advance;
          }
          x += space * size;
          wordIndex++;
        }
        y -= size * (LINE_HEIGHT - 1);
        rows.push({ top: rowTop, bottom: y });
      }
      return y;
    };
    const titleBottom = set(title, TITLE_SCALE, 0, "center");
    const bottom = set(body, 1, titleBottom - TITLE_GAP, "left");
    return { placements, rows, height: -bottom };
  };

  // Builds the slab: a frame around the block, and one strip per line band (plus filler
  // strips for the gaps between bands) with every letter outline cut through it.
  const buildSlab = (placements: Placement[], rows: Row[], w: number, height: number, shiftY: number) => {
    const left = -w / 2 - MARGIN;
    const right = w / 2 + MARGIN;
    const top = shiftY + MARGIN;
    const bottom = shiftY - height - MARGIN;
    const shapes: THREE.Shape[] = [];
    const rect = (x0: number, y0: number, x1: number, y1: number) =>
      new THREE.Shape([new THREE.Vector2(x0, y0), new THREE.Vector2(x1, y0), new THREE.Vector2(x1, y1), new THREE.Vector2(x0, y1)]);

    // Frame: a large board with the block cut out.
    const reachX = w * 3;
    const reachY = height * 3 + 20;
    const frame = rect(left - reachX, bottom - reachY, right + reachX, top + reachY);
    frame.holes.push(new THREE.Path(rect(left, bottom, right, top).getPoints()));
    shapes.push(frame);

    // Bands: block top margin, each line row, gaps between rows, bottom margin.
    const bands: Row[] = [];
    let cursor = top;
    for (const row of rows) {
      const rt = row.top + shiftY;
      const rb = row.bottom + shiftY;
      if (cursor > rt + 1e-6) bands.push({ top: cursor, bottom: rt });
      bands.push({ top: rt, bottom: rb });
      cursor = rb;
    }
    if (cursor > bottom + 1e-6) bands.push({ top: cursor, bottom });

    for (const band of bands) {
      const strip = rect(left, band.bottom, right, band.top);
      for (const p of placements) {
        const py = p.y + shiftY;
        if (py >= band.top || py <= band.bottom) continue;
        const { outers, counters } = outlineOf(p.ch);
        const place = (pts: THREE.Vector2[]) => pts.map((v) => new THREE.Vector2(p.x + v.x * p.size, py + v.y * p.size));
        for (const outer of outers) strip.holes.push(new THREE.Path(place(outer)));
        for (const counter of counters) shapes.push(new THREE.Shape(place(counter)));
      }
      shapes.push(strip);
    }
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: SLAB, bevelEnabled: false, curveSegments: CURVE_SEGMENTS });
    geometry.translate(0, 0, -SLAB);
    return geometry;
  };

  let letters: Letter[] = [];
  let mem = new Float32Array(0);
  let level = new Float32Array(0);
  let touched = new Float32Array(0);
  // Uneven tower heights so a raised cluster reads as a skyline rather than a dome.
  const jitter = Float32Array.from(chars, (_, i) => 0.35 + 0.65 * hash(i) ** 1.3);
  // Resting depth varies by word, so the engraving is irregular: some words cut deep,
  // some sit almost flush with the surface.
  let restDepth = new Float32Array(0);
  const m = new THREE.Matrix4();

  const writeHeight = (i: number) => {
    const l = letters[i];
    const r = -restDepth[i];
    const h = r + (peak * jitter[i] - r) * smooth(clamp01(level[i]));
    const attr = l.mesh.geometry.getAttribute("aHeight") as THREE.InstancedBufferAttribute;
    attr.setX(l.index, h);
    attr.needsUpdate = true;
  };

  const relayout = (aspect: number) => {
    // Pick the column width whose block aspect best matches the viewport.
    let best = { w: 30, score: Infinity, result: layout(30) };
    for (let w = 14; w <= 72; w += 1) {
      const result = layout(w);
      const score = Math.abs(Math.log(w / (result.height + 1.5) / aspect));
      if (score < best.score) best = { w, score, result };
    }
    const { placements, rows, height } = best.result;
    const w = best.w;
    const shiftY = height / 2;

    slab.geometry.dispose();
    slab.geometry = buildSlab(placements, rows, w, height, shiftY);

    restDepth = Float32Array.from(
      placements,
      (p, i) => depth * (0.15 + 0.85 * hash(p.word + 1000) ** 1.5) * (0.85 + 0.3 * hash(i + 500)),
    );
    const next = new Map<string, number>();
    letters = placements.map((p) => {
      const index = next.get(p.ch) ?? 0;
      next.set(p.ch, index + 1);
      const mesh = glyphs.get(p.ch) as THREE.InstancedMesh;
      m.makeScale(p.size, p.size, 1);
      m.setPosition(p.x, p.y + shiftY, 0);
      mesh.setMatrixAt(index, m);
      return { mesh, index, cx: p.x + p.advance / 2, cy: p.y + shiftY + p.size * 0.36 };
    });
    for (const mesh of glyphs.values()) mesh.instanceMatrix.needsUpdate = true;
    if (mem.length !== letters.length) {
      mem = new Float32Array(letters.length);
      level = new Float32Array(letters.length);
      touched = new Float32Array(letters.length).fill(-1e9);
    }
    for (let i = 0; i < letters.length; i++) writeHeight(i);

    // Straight-on camera, fitted to the block with a margin.
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const distH = ((height + 1.5) * 1.12) / 2 / Math.tan(vfov / 2);
    const distW = (w * 1.12) / 2 / Math.tan(vfov / 2) / aspect;
    const dist = Math.max(distH, distW);
    camera.position.set(0, 0, dist);
    camera.near = dist * 0.2;
    camera.far = dist * 3;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    // Light from the upper left, low over the page, so shadows run to the lower right.
    // Each shadow frustum is fitted to the block as that light sees it, for texel density.
    const reach = peak / Math.tan(THREE.MathUtils.degToRad(Math.max(elevation - spread, 4)));
    const fit = [
      [-w / 2 - MARGIN, height / 2 + MARGIN, 0],
      [w / 2 + reach, height / 2 + MARGIN, 0],
      [-w / 2 - MARGIN, -height / 2 - reach, 0],
      [w / 2 + reach, -height / 2 - reach, 0],
      [-w / 2, height / 2, peak],
      [w / 2, -height / 2, peak],
      [-w / 2, height / 2, -depth],
      [w / 2, -height / 2, -depth],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const az = THREE.MathUtils.degToRad(133);
    const span = Math.max(w, height) + reach;
    suns.forEach((sun, i) => {
      const el = THREE.MathUtils.degToRad(elevation + spread * KEY_SAMPLES[i]);
      const dir = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el));
      sun.position.copy(dir.multiplyScalar(span * 2));
      sun.target.position.set(0, 0, 0);
      const sc = sun.shadow.camera;
      sc.position.copy(sun.position);
      sc.lookAt(0, 0, 0);
      sc.updateMatrixWorld();
      const box = new THREE.Box3();
      for (const c of fit) box.expandByPoint(c.clone().applyMatrix4(sc.matrixWorldInverse));
      sc.left = box.min.x;
      sc.right = box.max.x;
      sc.bottom = box.min.y;
      sc.top = box.max.y;
      sc.near = Math.max(0.1, -box.max.z - 1);
      sc.far = -box.min.z + 1;
      sc.updateProjectionMatrix();
    });
    dirty = true;
  };

  // Pointer projected onto the page surface, in body ems. Null when off the page.
  let pointer: THREE.Vector2 | null = null;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const pagePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const onMove = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(pagePlane, hit)) pointer = new THREE.Vector2(hit.x, hit.y);
    introStart = -1;
    dirty = true;
  };
  const onLeave = () => {
    pointer = null;
  };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onMove);
  renderer.domElement.addEventListener("pointerleave", onLeave);

  let dirty = true;
  let raf = 0;
  let last = performance.now();
  let introStart = intro && !reduced ? last + 500 : -1;
  const INTRO = 2600;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    const t = now / 1000;

    // A phantom brush sweeps once across the block on mount.
    let brush = pointer;
    if (introStart > 0 && now >= introStart) {
      const p = (now - introStart) / INTRO;
      if (p >= 1) introStart = -1;
      else {
        const halfW = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect * 0.55;
        brush = new THREE.Vector2(-halfW + 2 * halfW * p, Math.sin(p * Math.PI * 2) * 2.5);
      }
    }

    let moving = false;
    const r2 = radius * radius;
    const rise = reduced ? 1 : 1 - Math.exp(-11 * dt);
    const fall = reduced ? 1 : 1 - Math.exp(-7 * dt);
    for (let i = 0; i < letters.length; i++) {
      const l = letters[i];
      let b = 0;
      if (brush) {
        const dx = l.cx - brush.x;
        const dy = l.cy - brush.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) b = smooth(1 - Math.sqrt(d2) / radius);
      }
      if (b > 0.02) touched[i] = t;
      if (b >= mem[i]) mem[i] = b;
      else if (t - touched[i] > hold) mem[i] = reduced ? 0 : Math.max(0, mem[i] - dt / sink);
      const target = mem[i];
      const delta = target - level[i];
      if (Math.abs(delta) > 1e-4) {
        level[i] += delta * (delta > 0 ? rise : fall);
        writeHeight(i);
        moving = true;
      } else if (level[i] !== target) {
        level[i] = target;
        writeHeight(i);
      }
    }

    if (moving || dirty || introStart > 0) {
      renderer.render(scene, camera);
      dirty = false;
    }
  };

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    relayout(w / h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    renderer.domElement.removeEventListener("pointermove", onMove);
    renderer.domElement.removeEventListener("pointerdown", onMove);
    renderer.domElement.removeEventListener("pointerleave", onLeave);
    for (const mesh of glyphs.values()) mesh.geometry.dispose();
    for (const sun of suns) sun.shadow.dispose();
    slab.geometry.dispose();
    slabMaterial.dispose();
    letterMaterial.dispose();
    depthMaterial.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    shade.remove();
  };
}
