"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import * as THREE from "three";
import { Font, type FontData } from "three/addons/loaders/FontLoader.js";
import {
  mergeGeometries,
  mergeVertices,
} from "three/addons/utils/BufferGeometryUtils.js";

export type ExtrudeTypeOptions = {
  title: string;
  body: string;
  font: FontData;
  radius?: number;
  peak?: number;
  depth?: number;
  hold?: number;
  sink?: number;
  elevation?: number;
  spread?: number;
  marble?: string;
  keyColor?: string;
  keyIntensity?: number;
  fillColor?: string;
  fillIntensity?: number;
  falloff?: number;
  glow?: number;
  soften?: number;
  intro?: boolean;
};

export interface ExtrudeTypeProps {
  title?: string;
  body?: string;
  radius?: number;
  peak?: number;
  depth?: number;
  hold?: number;
  sink?: number;
  elevation?: number;
  spread?: number;
  marble?: string;
  keyColor?: string;
  keyIntensity?: number;
  fillColor?: string;
  fillIntensity?: number;
  falloff?: number;
  glow?: number;
  soften?: number;
  intro?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ASSET_BASE = "https://ui.aryank.space/assets/extrude-type";

const DEFAULT_TITLE = "Attention Is All You Need";
const DEFAULT_BODY =
  "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.";

const TITLE_SCALE = 2.1;
const LINE_HEIGHT = 1.42;
const TITLE_GAP = 1.6;
const MARGIN = 2.5;
const SLAB = 1;
const BEVEL = 0.03;
const CLEARANCE = 0.004;
const CURVE_SEGMENTS = 6;

const HEIGHT_CHUNK = `#include <begin_vertex>
  float bodyTop = aHeight - ${BEVEL.toFixed(3)};
  transformed.z = transformed.z <= 0.0 ? ${(-SLAB).toFixed(3)} + transformed.z
    : transformed.z <= 1.0 ? mix(${(-SLAB).toFixed(3)}, bodyTop, transformed.z)
    : bodyTop + (transformed.z - 1.0);`;

const withHeight = <M extends THREE.Material>(material: M) => {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aHeight;",
      )
      .replace("#include <begin_vertex>", HEIGHT_CHUNK);
  };
  material.customProgramCacheKey = () => "extrude-type-height";
  return material;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function mountExtrudeType(host: HTMLElement, options: ExtrudeTypeOptions) {
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

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    stencil: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor("#d4d4d6");
  renderer.domElement.style.cssText = `display:block;width:100%;height:100%;touch-action:pan-y${soften > 0 ? `;filter:blur(${soften}px)` : ""}`;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const shade = document.createElement("div");
  const f = Math.round(falloff * 255);
  shade.style.cssText = `position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;background:linear-gradient(to bottom right,#fff 15%,rgb(${f},${f},${f}) 100%)`;
  host.append(shade);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 4000);

  scene.add(new THREE.HemisphereLight(fillColor, fillColor, fillIntensity));
  const KEY_SAMPLES = [-1, -0.5, 0, 0.5, 1];
  const meanSin =
    KEY_SAMPLES.reduce(
      (sum, u) =>
        sum + Math.sin(THREE.MathUtils.degToRad(elevation + spread * u)),
      0,
    ) / KEY_SAMPLES.length;
  const perSun =
    (keyIntensity * Math.sin(THREE.MathUtils.degToRad(24))) /
    meanSin /
    KEY_SAMPLES.length;
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
  const letterMaterial = withHeight(
    new THREE.MeshPhysicalMaterial(marbleParams),
  );
  const depthMaterial = withHeight(new THREE.MeshDepthMaterial());

  // The marble surface is one flat plane. Letter openings are punched through it with the
  // stencil buffer instead of cutting holes into the mesh: triangulating a line of text as
  // one polygon with dozens of holes fails and covers some slots back over.
  slabMaterial.stencilWrite = true;
  slabMaterial.stencilRef = 1;
  slabMaterial.stencilFunc = THREE.NotEqualStencilFunc;
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    slabMaterial,
  );
  surface.receiveShadow = true;
  surface.renderOrder = 1;
  scene.add(surface);

  // Letter-shaped masks at the surface, drawn first, mark where the plane must not draw.
  const maskMaterial = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilZPass: THREE.ReplaceStencilOp,
  });
  const masks = new THREE.Mesh(new THREE.BufferGeometry(), maskMaterial);
  masks.renderOrder = 0;
  scene.add(masks);

  // The inside walls of every slot, seen from within the opening, so they render back faces.
  // They cast the shadows that fall onto a sunken letter.
  const wallMaterial = new THREE.MeshPhysicalMaterial({
    ...marbleParams,
    side: THREE.BackSide,
    shadowSide: THREE.DoubleSide,
  });
  const walls = new THREE.Mesh(new THREE.BufferGeometry(), wallMaterial);
  walls.castShadow = true;
  walls.receiveShadow = true;
  scene.add(walls);

  // Per-character unit-size pieces: the flat opening (counters stay solid) and the slot's
  // side walls running from the surface down to the slab floor.
  const pieces = new Map<
    string,
    { mask: THREE.BufferGeometry; wall: THREE.BufferGeometry }
  >();
  const pieceOf = (ch: string) => {
    let piece = pieces.get(ch);
    if (!piece) {
      const shapes = font.generateShapes(ch, 1);
      const mask = new THREE.ShapeGeometry(shapes, CURVE_SEGMENTS);
      mask.deleteAttribute("normal");
      mask.deleteAttribute("uv");
      const extruded = new THREE.ExtrudeGeometry(shapes, {
        depth: SLAB,
        bevelEnabled: false,
        curveSegments: CURVE_SEGMENTS,
      });
      // ExtrudeGeometry tags caps as material 0 and side walls as material 1.
      const position = extruded.getAttribute("position");
      const normal = extruded.getAttribute("normal");
      const kept: number[] = [];
      const keptNormals: number[] = [];
      for (const group of extruded.groups) {
        if (group.materialIndex !== 1) continue;
        for (let i = group.start; i < group.start + group.count; i++) {
          kept.push(
            position.getX(i),
            position.getY(i),
            position.getZ(i) - SLAB,
          );
          keptNormals.push(normal.getX(i), normal.getY(i), normal.getZ(i));
        }
      }
      extruded.dispose();
      const wall = new THREE.BufferGeometry();
      wall.setAttribute("position", new THREE.Float32BufferAttribute(kept, 3));
      wall.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(keptNormals, 3),
      );
      piece = { mask, wall };
      pieces.set(ch, piece);
    }
    return piece;
  };

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
      bevelOffset: -BEVEL - CLEARANCE,
      bevelSegments: 4,
    });
    extruded.deleteAttribute("normal");
    extruded.deleteAttribute("uv");
    const geometry = mergeVertices(extruded, 1e-5);
    geometry.computeVertexNormals();
    extruded.dispose();
    const height = new THREE.InstancedBufferAttribute(
      new Float32Array(count),
      1,
    );
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
  const advanceOf = (ch: string) =>
    (options.font.glyphs[ch]?.ha ?? options.font.glyphs["?"]?.ha ?? 500) /
    resolution;
  const wordWidth = (w: string) =>
    [...w].reduce((sum, ch) => sum + advanceOf(ch), 0);
  const space = advanceOf(" ");

  type Placement = {
    ch: string;
    x: number;
    y: number;
    size: number;
    advance: number;
    word: number;
  };

  const layout = (w: number) => {
    const placements: Placement[] = [];
    let wordIndex = 0;
    const set = (
      text: string,
      size: number,
      top: number,
      mode: "center" | "left",
    ) => {
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
        y -= size;
        const natural =
          ln.reduce((s, word) => s + wordWidth(word) * size, 0) +
          space * size * (ln.length - 1);
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
      }
      return y;
    };
    const titleBottom = set(title, TITLE_SCALE, 0, "center");
    const bottom = set(body, 1, titleBottom - TITLE_GAP, "left");
    return { placements, height: -bottom };
  };

  // Places a copy of every letter's opening and walls; rebuilt on each layout.
  const buildSlots = (placements: Placement[], shiftY: number) => {
    const maskParts: THREE.BufferGeometry[] = [];
    const wallParts: THREE.BufferGeometry[] = [];
    const placed = new THREE.Matrix4();
    for (const p of placements) {
      const { mask, wall } = pieceOf(p.ch);
      placed.makeScale(p.size, p.size, 1);
      placed.setPosition(p.x, p.y + shiftY, 0);
      maskParts.push(mask.clone().applyMatrix4(placed));
      wallParts.push(wall.clone().applyMatrix4(placed));
    }
    const merged = {
      mask: mergeGeometries(maskParts) ?? new THREE.BufferGeometry(),
      wall: mergeGeometries(wallParts) ?? new THREE.BufferGeometry(),
    };
    for (const part of [...maskParts, ...wallParts]) part.dispose();
    return merged;
  };

  let letters: {
    mesh: THREE.InstancedMesh;
    index: number;
    cx: number;
    cy: number;
  }[] = [];
  let mem = new Float32Array(0);
  let level = new Float32Array(0);
  let touched = new Float32Array(0);
  const jitter = Float32Array.from(
    chars,
    (_, i) => 0.35 + 0.65 * hash(i) ** 1.3,
  );
  let restDepth = new Float32Array(0);
  const m = new THREE.Matrix4();

  const writeHeight = (i: number) => {
    const l = letters[i];
    const r = -restDepth[i];
    const h = r + (peak * jitter[i] - r) * smooth(clamp01(level[i]));
    const attr = l.mesh.geometry.getAttribute(
      "aHeight",
    ) as THREE.InstancedBufferAttribute;
    attr.setX(l.index, h);
    attr.needsUpdate = true;
  };

  const relayout = (aspect: number) => {
    let best = { w: 30, score: Infinity, result: layout(30) };
    for (let w = 14; w <= 72; w += 1) {
      const result = layout(w);
      const score = Math.abs(Math.log(w / (result.height + 1.5) / aspect));
      if (score < best.score) best = { w, score, result };
    }
    const { placements, height } = best.result;
    const w = best.w;
    const shiftY = height / 2;

    const slots = buildSlots(placements, shiftY);
    masks.geometry.dispose();
    masks.geometry = slots.mask;
    walls.geometry.dispose();
    walls.geometry = slots.wall;

    restDepth = Float32Array.from(
      placements,
      (p, i) =>
        depth *
        (0.15 + 0.85 * hash(p.word + 1000) ** 1.5) *
        (0.85 + 0.3 * hash(i + 500)),
    );
    const next = new Map<string, number>();
    letters = placements.map((p) => {
      const index = next.get(p.ch) ?? 0;
      next.set(p.ch, index + 1);
      const mesh = glyphs.get(p.ch) as THREE.InstancedMesh;
      m.makeScale(p.size, p.size, 1);
      m.setPosition(p.x, p.y + shiftY, 0);
      mesh.setMatrixAt(index, m);
      return {
        mesh,
        index,
        cx: p.x + p.advance / 2,
        cy: p.y + shiftY + p.size * 0.36,
      };
    });
    for (const mesh of glyphs.values()) mesh.instanceMatrix.needsUpdate = true;
    if (mem.length !== letters.length) {
      mem = new Float32Array(letters.length);
      level = new Float32Array(letters.length);
      touched = new Float32Array(letters.length).fill(-1e9);
    }
    for (let i = 0; i < letters.length; i++) writeHeight(i);

    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const distH = ((height + 1.5) * 1.12) / 2 / Math.tan(vfov / 2);
    const distW = (w * 1.12) / 2 / Math.tan(vfov / 2) / aspect;
    const dist = Math.max(distH, distW);
    camera.position.set(0, 0, dist);
    camera.near = dist * 0.2;
    camera.far = dist * 3;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const reach =
      peak /
      Math.tan(THREE.MathUtils.degToRad(Math.max(elevation - spread, 4)));
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
      const dir = new THREE.Vector3(
        Math.cos(az) * Math.cos(el),
        Math.sin(az) * Math.cos(el),
        Math.sin(el),
      );
      sun.position.copy(dir.multiplyScalar(span * 2));
      sun.target.position.set(0, 0, 0);
      const sc = sun.shadow.camera;
      sc.position.copy(sun.position);
      sc.lookAt(0, 0, 0);
      sc.updateMatrixWorld();
      const box = new THREE.Box3();
      for (const c of fit)
        box.expandByPoint(c.clone().applyMatrix4(sc.matrixWorldInverse));
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

  let pointer: THREE.Vector2 | null = null;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const pagePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const onMove = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(pagePlane, hit))
      pointer = new THREE.Vector2(hit.x, hit.y);
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

    let brush = pointer;
    if (introStart > 0 && now >= introStart) {
      const p = (now - introStart) / INTRO;
      if (p >= 1) introStart = -1;
      else {
        const halfW =
          camera.position.z *
          Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) *
          camera.aspect *
          0.55;
        brush = new THREE.Vector2(
          -halfW + 2 * halfW * p,
          Math.sin(p * Math.PI * 2) * 2.5,
        );
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
      else if (t - touched[i] > hold)
        mem[i] = reduced ? 0 : Math.max(0, mem[i] - dt / sink);
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
    masks.geometry.dispose();
    walls.geometry.dispose();
    surface.geometry.dispose();
    for (const piece of pieces.values()) {
      piece.mask.dispose();
      piece.wall.dispose();
    }
    slabMaterial.dispose();
    maskMaterial.dispose();
    wallMaterial.dispose();
    letterMaterial.dispose();
    depthMaterial.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    shade.remove();
  };
}

export default function ExtrudeType({
  title = DEFAULT_TITLE,
  body = DEFAULT_BODY,
  radius,
  peak,
  depth,
  hold,
  sink,
  elevation,
  spread,
  marble,
  keyColor,
  keyIntensity,
  fillColor,
  fillIntensity,
  falloff,
  glow,
  soften,
  intro,
  className,
  style,
}: ExtrudeTypeProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        const res = await fetch(`${ASSET_BASE}/helvetiker_bold.typeface.json`);
        const fontData = (await res.json()) as FontData;
        if (cancelled) return;
        cleanup = mountExtrudeType(host, {
          title,
          body,
          font: fontData,
          radius,
          peak,
          depth,
          hold,
          sink,
          elevation,
          spread,
          marble,
          keyColor,
          keyIntensity,
          fillColor,
          fillIntensity,
          falloff,
          glow,
          soften,
          intro,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("ExtrudeType failed to load font", e);
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [
    title,
    body,
    radius,
    peak,
    depth,
    hold,
    sink,
    elevation,
    spread,
    marble,
    keyColor,
    keyIntensity,
    fillColor,
    fillIntensity,
    falloff,
    glow,
    soften,
    intro,
  ]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
      role="img"
      aria-label="Extruded type"
    />
  );
}
