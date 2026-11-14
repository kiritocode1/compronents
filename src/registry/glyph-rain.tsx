"use client";

/**
 * Glyph Rain: rows of extruded letters fall into a box and pile up, lit by a
 * point light and drawn through an 8x8 ordered dither in one flat colour.
 *
 * Ported from the basement.studio lab "Glyph Rain" experiment (34.svg-rain,
 * pinned in reference/svg-rain/). The source runs rapier with z translation
 * and x/y rotation locked, so its physics is planar. This port runs the same
 * scene in matter-js: each glyph's collider is the 2D convex hull of its
 * vertices, at 50 px per world unit, with rapier's defaults (friction 0.5, no
 * restitution, no damping) and gravity -4. The letters are cut from the BLANK
 * wordmark instead of the source's own glyph set.
 *
 * The shader matches the source: Lambert diffuse from `lightPosition`, then
 * dither(gl_FragCoord / canvasHeight * ditherSize). The cursor eases the
 * camera rotation and the light position, as in the source.
 */

import gsap from "gsap";
import Matter from "matter-js";
import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import {
  type CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export type GlyphSet = Map<string, THREE.BufferGeometry>;

export type GlyphRainHandle = {
  /** Drop every glyph again from the top. */
  replay: () => void;
};

export type GlyphRainProps = {
  /** Glyph keys per row, bottom row first. Every key must exist in the glyph set. */
  rows?: string[][];
  /**
   * Loads the glyph geometries, in the source's units (about 25 tall, 7.3
   * deep, centred on the origin). Defaults to the BLANK wordmark letters.
   */
  loadGlyphs?: () => Promise<GlyphSet>;
  /** Wordmark SVG the default loader cuts letters from. */
  markUrl?: string;
  color?: string;
  /** Dither cells per canvas height. */
  ditherSize?: number;
  /** Downward acceleration in world units per second squared. */
  gravity?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
  /** Vignette blend opacity, 0 to 1. */
  vignetteOpacity?: number;
  paused?: boolean;
  /** Width over height. The source canvas is 21:9. */
  ratio?: number;
  className?: string;
  style?: CSSProperties;
};

const MARK_URL = "https://ui.aryank.space/assets/glyph-rain/blank-mark.svg";

/** The BLANK band, repeated so every row has eight glyphs like the source. */
const BLANK_ROWS: string[][] = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 8 }, (_, c) => "BLANK"[(r * 8 + c) % 5]),
);

// Source constants (34.svg-rain.js).
const CAMERA = {
  position: new THREE.Vector3(
    -11.096288834783838,
    3.2768999336644313,
    6.823361968481603,
  ),
  rotation: new THREE.Euler(0, -0.83895665434904, 0, "YXZ"),
  fov: 20,
};
const LIGHT = new THREE.Vector3(
  -7.984629070935935,
  4.2702468181164335,
  5.463079488712904,
);
const GLYPH_SCALE = 0.05;
const LETTER_CONTAINER = 2.1;
const SAFE_RANDOM_SPACE = 2;
const VISIBLE_HEIGHT = 7.5;
const TIGHTEN_WALLS_BY = 1.5;
const WALL_THICKNESS = 1;
/** gsap DURATION in the source lab: (1 / golden ratio) * 0.8, eased over a 2.5th. */
const CURSOR_EASE_S = ((1 / 1.618033988749895) * 0.8) / 2.5;
/** Matter works in pixels; one world unit is this many. */
const PX = 50;
const STEP_MS = 1000 / 60;

const vertexShader = /* glsl */ `
uniform vec3 lightPosition;
varying vec3 vNormal;
varying vec3 vLightVec;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
  vNormal = normalMatrix * normal;
  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
  vec4 viewLightPos = viewMatrix * vec4(lightPosition, 1.0);
  vLightVec = viewLightPos.xyz - viewPos.xyz;
}
`;

// glsl-dither/8x8, verbatim thresholds.
const BAYER = [
  0.015625, 0.515625, 0.140625, 0.640625, 0.046875, 0.546875, 0.171875,
  0.671875, 0.765625, 0.265625, 0.890625, 0.390625, 0.796875, 0.296875,
  0.921875, 0.421875, 0.203125, 0.703125, 0.078125, 0.578125, 0.234375,
  0.734375, 0.109375, 0.609375, 0.953125, 0.453125, 0.828125, 0.328125,
  0.984375, 0.484375, 0.859375, 0.359375, 0.0625, 0.5625, 0.1875, 0.6875,
  0.03125, 0.53125, 0.15625, 0.65625, 0.8125, 0.3125, 0.9375, 0.4375, 0.78125,
  0.28125, 0.90625, 0.40625, 0.25, 0.75, 0.125, 0.625, 0.21875, 0.71875,
  0.09375, 0.59375, 1.0, 0.5, 0.875, 0.375, 0.96875, 0.46875, 0.84375, 0.34375,
];
const bayerChain = BAYER.map(
  (v, i) => `  if (index == ${i}) limit = ${v.toFixed(6)};`,
).join("\n");

const fragmentShader = /* glsl */ `
precision highp float;
uniform vec3 color;
uniform vec2 resolution;
uniform float ditherSize;
varying vec3 vNormal;
varying vec3 vLightVec;
float dither8x8(vec2 position, float brightness) {
  int x = int(mod(position.x, 8.0));
  int y = int(mod(position.y, 8.0));
  int index = x + y * 8;
  float limit = 0.0;
${bayerChain}
  return brightness < limit ? 0.0 : 1.0;
}
void main() {
  vec3 L = normalize(vLightVec);
  vec3 N = normalize(vNormal);
  float diffuse = max(dot(N, L), 0.0);
  float d = dither8x8(gl_FragCoord.xy / resolution.xy * ditherSize, diffuse);
  gl_FragColor = vec4(color * d, 1.0);
}
`;

/**
 * Cuts the letters out of a one-path wordmark SVG, left to right, keyed by
 * `keys`, extruded and sized like the source glyphs (25 tall, 7.3 deep).
 */
export async function loadWordmarkGlyphs(
  url: string,
  keys = ["B", "L", "A", "N", "K"],
) {
  const text = await (await fetch(url)).text();
  const data = new SVGLoader().parse(text);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const withX = shapes
    .map((shape) => {
      const box = new THREE.Box2().setFromPoints(shape.getPoints());
      return { shape, box };
    })
    .sort((a, b) => a.box.min.x - b.box.min.x);
  const height = Math.max(...withX.map((s) => s.box.max.y - s.box.min.y));
  const unit = 25 / height;
  const depth = 7.3;
  const set: GlyphSet = new Map();
  withX.slice(0, keys.length).forEach(({ shape, box }, i) => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 6,
    });
    const c = box.getCenter(new THREE.Vector2());
    // SVG y runs down; flip it and centre the glyph on the origin.
    g.translate(-c.x, -c.y, -depth / 2);
    g.scale(unit, -unit, 1);
    g.computeVertexNormals();
    set.set(keys[i], g);
  });
  return set;
}

/** 2D convex hull (monotone chain) of a geometry's x/y, scaled. */
function hull2d(geometry: THREE.BufferGeometry, scale: number) {
  const pos = geometry.getAttribute("position");
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < pos.count; i++)
    pts.push({ x: pos.getX(i) * scale, y: pos.getY(i) * scale });
  pts.sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof pts = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper: typeof pts = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Area centroid of a convex polygon. */
function centroid(poly: { x: number; y: number }[]) {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const f = p.x * q.y - q.x * p.y;
    a += f;
    cx += (p.x + q.x) * f;
    cy += (p.y + q.y) * f;
  }
  a *= 0.5;
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

type Glyph = {
  mesh: THREE.Mesh;
  body: Matter.Body;
  /** Hull centroid in the mesh's local frame, world units. */
  offset: { x: number; y: number };
  spawn: () => { x: number; y: number; angle: number };
};

const GlyphRain = forwardRef<GlyphRainHandle, GlyphRainProps>(
  function GlyphRain(
    {
      rows = BLANK_ROWS,
      loadGlyphs,
      markUrl = MARK_URL,
      color = "#ff4300",
      ditherSize = 200,
      gravity = 4,
      vignetteOffset = 0.4,
      vignetteDarkness = 0.6,
      vignetteOpacity = 1,
      paused = false,
      ratio = 21 / 9,
      className,
      style,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const replayRef = useRef<() => void>(() => {});
    const live = useRef({
      color,
      ditherSize,
      gravity,
      vignetteOffset,
      vignetteDarkness,
      vignetteOpacity,
      paused,
    });
    live.current = {
      color,
      ditherSize,
      gravity,
      vignetteOffset,
      vignetteDarkness,
      vignetteOpacity,
      paused,
    };
    const applyRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({ replay: () => replayRef.current() }), []);

    useEffect(() => {
      applyRef.current();
    });

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      let disposed = false;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor("#000000", 1);
      renderer.domElement.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";
      root.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#000000");
      const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 1000);
      camera.position.copy(CAMERA.position);
      camera.rotation.copy(CAMERA.rotation);

      const composer = new EffectComposer(renderer, { multisampling: 0 });
      composer.addPass(new RenderPass(scene, camera));
      const vignette = new VignetteEffect({
        blendFunction: BlendFunction.NORMAL,
        offset: vignetteOffset,
        darkness: vignetteDarkness,
      });
      vignette.blendMode.opacity.value = live.current.vignetteOpacity;
      composer.addPass(new EffectPass(camera, vignette));

      // One uniform set shared by every glyph, as all source materials move together.
      const uniforms = {
        color: { value: new THREE.Color(color) },
        resolution: { value: new THREE.Vector2(1, 1) },
        ditherSize: { value: ditherSize },
        lightPosition: { value: LIGHT.clone() },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });

      applyRef.current = () => {
        const l = live.current;
        uniforms.color.value.set(l.color);
        uniforms.ditherSize.value = l.ditherSize;
        vignette.offset = l.vignetteOffset;
        vignette.darkness = l.vignetteDarkness;
        vignette.blendMode.opacity.value = l.vignetteOpacity;
        engine.gravity.scale = (l.gravity * PX) / 1e6;
        if (!l.paused) kick();
      };

      // Physics: floor top at y = 0, wall inner faces at x = +-(FLOOR / 2 - 1.5).
      const largestRow = rows.reduce((m, r) => Math.max(m, r.length), 0);
      const floorSize = 2.5 * largestRow;
      const engine = Matter.Engine.create({
        gravity: { x: 0, y: 1, scale: (gravity * PX) / 1e6 },
      });
      const wallX = floorSize / 2 - TIGHTEN_WALLS_BY + WALL_THICKNESS / 2;
      Matter.Composite.add(engine.world, [
        Matter.Bodies.rectangle(
          0,
          0.5 * PX,
          floorSize * PX,
          WALL_THICKNESS * PX,
          { isStatic: true, friction: 0.5 },
        ),
        Matter.Bodies.rectangle(
          wallX * PX,
          -(floorSize / 2) * PX,
          WALL_THICKNESS * PX,
          floorSize * PX,
          { isStatic: true, friction: 0.5 },
        ),
        Matter.Bodies.rectangle(
          -wallX * PX,
          -(floorSize / 2) * PX,
          WALL_THICKNESS * PX,
          floorSize * PX,
          { isStatic: true, friction: 0.5 },
        ),
      ]);

      const glyphs: Glyph[] = [];
      const group = new THREE.Group();
      scene.add(group);

      const place = (g: Glyph) => {
        const s = g.spawn();
        // Body sits at the hull centroid; the mesh origin is offset from it.
        const cos = Math.cos(s.angle);
        const sin = Math.sin(s.angle);
        const cx = s.x + g.offset.x * cos - g.offset.y * sin;
        const cy = s.y + g.offset.x * sin + g.offset.y * cos;
        Matter.Body.setPosition(g.body, { x: cx * PX, y: -cy * PX });
        Matter.Body.setAngle(g.body, -s.angle);
        Matter.Body.setVelocity(g.body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(g.body, 0);
      };

      const sync = () => {
        for (const g of glyphs) {
          const a = -g.body.angle;
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          const cx = g.body.position.x / PX;
          const cy = -g.body.position.y / PX;
          g.mesh.position.set(
            cx - (g.offset.x * cos - g.offset.y * sin),
            cy - (g.offset.x * sin + g.offset.y * cos),
            0,
          );
          g.mesh.rotation.z = a;
        }
      };

      const build = (set: GlyphSet) => {
        rows.forEach((names, i1) => {
          names.forEach((name, i2) => {
            const geometry = set.get(name);
            if (!geometry) return;
            const poly = hull2d(geometry, GLYPH_SCALE);
            const c = centroid(poly);
            const body = Matter.Bodies.fromVertices(
              0,
              0,
              [
                poly.map((p) => ({
                  x: (p.x - c.x) * PX,
                  y: -(p.y - c.y) * PX,
                })),
              ],
              {
                friction: 0.5,
                frictionStatic: 0.5,
                frictionAir: 0,
                restitution: 0,
              },
            );
            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.setScalar(GLYPH_SCALE);
            group.add(mesh);
            const xDisplace = ((largestRow - 1) * LETTER_CONTAINER) / 2;
            const g: Glyph = {
              mesh,
              body,
              offset: c,
              spawn: () => {
                const random = Math.random();
                return {
                  x: i2 * LETTER_CONTAINER - xDisplace,
                  y:
                    i1 * LETTER_CONTAINER * SAFE_RANDOM_SPACE +
                    random * SAFE_RANDOM_SPACE +
                    VISIBLE_HEIGHT,
                  angle: Math.PI / 2 + Math.PI * random,
                };
              },
            };
            place(g);
            glyphs.push(g);
            Matter.Composite.add(engine.world, body);
          });
        });
        sync();
      };

      // Size the canvas to the box. The dither grid uses the CSS height, as the source does.
      const resize = () => {
        const w = root.clientWidth;
        const h = root.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        composer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        uniforms.resolution.value.set(h, h);
        render();
      };

      const render = () => composer.render();

      let raf = 0;
      let last = 0;
      let acc = 0;
      let visible = false;
      let settledFrames = 0;
      const loop = (now: number) => {
        raf = 0;
        if (disposed || !visible) return;
        const dt = last ? Math.min(now - last, 100) : STEP_MS;
        last = now;
        if (!live.current.paused) {
          acc += dt;
          while (acc >= STEP_MS) {
            Matter.Engine.update(engine, STEP_MS);
            acc -= STEP_MS;
          }
          sync();
        }
        render();
        // Keep drawing while anything moves or a cursor tween runs.
        const moving = glyphs.some(
          (g) => g.body.speed > 0.01 || Math.abs(g.body.angularSpeed) > 0.0005,
        );
        settledFrames =
          moving || gsap.isTweening(camera.rotation) ? 0 : settledFrames + 1;
        if (settledFrames < 30) raf = requestAnimationFrame(loop);
        else last = 0;
      };
      const kick = () => {
        if (!raf && visible && !disposed) raf = requestAnimationFrame(loop);
      };

      const reduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      const settleNow = () => {
        for (let i = 0; i < 60 * 20; i++) Matter.Engine.update(engine, STEP_MS);
        sync();
        render();
      };

      replayRef.current = () => {
        for (const g of glyphs) place(g);
        sync();
        if (reduced) settleNow();
        else {
          settledFrames = 0;
          kick();
        }
      };

      const io = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) kick();
      });
      io.observe(root);
      const ro = new ResizeObserver(resize);
      ro.observe(root);

      // The cursor eases the camera and the light, normalised to the box.
      const onMove = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 2 - 1;
        const y = -((e.clientY - r.top) / r.height) * 2 + 1;
        gsap.to(camera.rotation, {
          overwrite: true,
          duration: CURSOR_EASE_S,
          x: CAMERA.rotation.x + y * (Math.PI * 0.005),
          y: CAMERA.rotation.y - x * (Math.PI * 0.005),
          ease: "power2.out",
        });
        gsap.to(uniforms.lightPosition.value, {
          overwrite: true,
          duration: CURSOR_EASE_S,
          x: LIGHT.x + x,
          y: LIGHT.y + y * 2,
          ease: "power2.out",
        });
        settledFrames = 0;
        kick();
      };
      root.addEventListener("pointermove", onMove);

      const load = loadGlyphs ?? (() => loadWordmarkGlyphs(markUrl));
      load()
        .then((set) => {
          if (disposed) return;
          build(set);
          resize();
          if (reduced) settleNow();
          kick();
        })
        .catch((err: unknown) =>
          console.error("GlyphRain: could not load glyphs", err),
        );

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        root.removeEventListener("pointermove", onMove);
        gsap.killTweensOf(camera.rotation);
        gsap.killTweensOf(uniforms.lightPosition.value);
        Matter.Engine.clear(engine);
        const geos = new Set(glyphs.map((g) => g.mesh.geometry));
        for (const geo of geos) geo.dispose();
        material.dispose();
        composer.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        applyRef.current = () => {};
        replayRef.current = () => {};
      };
      // Rebuild only when the scene's structure changes; live values go through applyRef.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, loadGlyphs, markUrl]);

    return (
      <div
        ref={rootRef}
        className={className}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: String(ratio),
          overflow: "hidden",
          background: "#000",
          ...style,
        }}
      />
    );
  },
);

export default GlyphRain;
