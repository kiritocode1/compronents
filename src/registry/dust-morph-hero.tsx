"use client";

/**
 * Dust Morph Hero
 *
 * A hero where the subject is never a mesh. Each shape is sampled into a cloud
 * of points, area-weighted so the density is even rather than bunched at the
 * poles of the source geometry, and the same cloud is reused for every shape in
 * the set. Moving between shapes is therefore not a swap or a crossfade: every
 * point keeps its identity and travels from where it sat on the old surface to
 * where it sits on the new one.
 *
 * The travel is staggered per point and bowed outward along a random direction,
 * so the cloud loses its silhouette in the middle of the move and recovers it at
 * the end. That is what reads as dust rather than a tween. Points also fade as
 * they disperse, which keeps the loose middle of the transition from looking
 * like noise sprayed over the frame.
 *
 * Sampling, morphing and pointer response all run on attributes and uniforms, so
 * the per-frame cost is one draw call no matter how many points are in flight.
 *
 * Shapes default to parametric geometry, so the component ships with no asset
 * to host. Give a shape a `model` URL and the GLB is loaded, flattened to
 * world-space positions and sampled by the same code instead: the sampler only
 * ever reads a position attribute and an optional index, so a loaded mesh and a
 * torus knot are the same input to it. A model that fails to load falls back to
 * its parametric slot rather than leaving a hole in the cycle, and the loader is
 * imported on demand so the parametric path never pays for it.
 *
 * You must have the rights to any model you point this at. Nothing is bundled.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface DustMorphShape {
  /** Label shown under the cloud while this shape is settled. */
  label: string;
  /**
   * URL of a GLB to sample instead of the built-in parametric shape. Only the
   * position attributes are read, so materials and textures are irrelevant and
   * a draco-free mesh export is enough. Falls back to the parametric shape if
   * the file cannot be loaded.
   */
  model?: string;
}

export interface DustMorphHeroProps {
  /** Shapes cycled through, in order. Two or more to have anything to morph. */
  shapes?: DustMorphShape[];
  /** Points sampled onto every shape. The single biggest cost lever. */
  count?: number;
  /** Seconds a shape holds before advancing on its own. 0 waits for input. */
  dwell?: number;
  /** Seconds a morph takes end to end. */
  morphDuration?: number;
  /** How far points bow off their path mid-morph, in world units. */
  disperse?: number;
  /** Point size in px at the reference distance. */
  pointSize?: number;
  /** Ink the points are drawn in. */
  color?: string;
  /** Paper behind the cloud. */
  background?: string;
  /** How hard the pointer pushes points aside. 0 disables it. */
  pointerStrength?: number;
  /** Reach of the pointer, in normalized screen units. */
  pointerRadius?: number;
  /** Eyebrow above the label. */
  eyebrow?: string;
  className?: string;
}

const DEFAULT_SHAPES: DustMorphShape[] = [
  { label: "Curated systems" },
  { label: "Considered motion" },
  { label: "Durable interfaces" },
  { label: "Quiet machinery" },
];

const DEFAULT_COLOR = "#171512";
/** Cool grey-green paper, sampled rather than guessed. */
const DEFAULT_BACKGROUND = "#d4d5cd";

/**
 * Concatenate geometries into one position-only buffer. The cloud never shades,
 * so normals and UVs are dropped, which also means parts with mismatched
 * attributes still merge without complaint.
 */
function mergePositions(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let total = 0;
  const chunks: Float32Array[] = [];
  for (const part of parts) {
    const source = part.index ? part.toNonIndexed() : part;
    const position = source.getAttribute("position");
    const copy = new Float32Array(position.array as ArrayLike<number>);
    chunks.push(copy);
    total += copy.length;
    if (source !== part) source.dispose();
    part.dispose();
  }
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(merged, 3));
  return geometry;
}

/**
 * A run of interlocking links following a gentle S. Consecutive links are
 * spaced under their own diameter and rotated a quarter turn about the run, so
 * they actually pass through one another rather than sitting in a row. Sampled
 * as a cloud the interlock is the whole point: it gives the silhouette holes
 * that survive the morph, which is what a solid blob cannot do.
 */
function chainGeometry(links = 5): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const ring = 0.46;
  const tube = 0.125;
  /** Elongation along the run, which is what makes a link a link. */
  const stretch = 1.7;
  const half = ring * stretch;
  // Half a link's length, so consecutive loops overlap rather than abut.
  const pitch = half;

  for (let i = 0; i < links; i += 1) {
    const link = new THREE.TorusGeometry(ring, tube, 20, 96);
    // Stretch in the ring's own plane before any rotation, so the long axis
    // ends up along the run no matter which plane the link is turned into.
    link.scale(stretch, 1, 1);

    const t = i - (links - 1) / 2;
    const position = new THREE.Vector3(
      t * pitch,
      Math.sin((t / links) * Math.PI * 1.5) * 0.42,
      Math.cos((t / links) * Math.PI * 1.1) * 0.2,
    );
    // A torus is rotationally symmetric about its own hole axis, so turning a
    // link about the run would do nothing at all. The alternation has to swing
    // the whole plane instead: even links lie in the run's horizontal plane,
    // odd ones stand upright in it, and that crossing is the interlock.
    const rotation = new THREE.Euler(
      i % 2 === 0 ? 0 : Math.PI / 2,
      0,
      (t / links) * 0.55,
    );
    link.applyMatrix4(
      new THREE.Matrix4().compose(
        position,
        new THREE.Quaternion().setFromEuler(rotation),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    parts.push(link);
  }
  return mergePositions(parts);
}

/**
 * A lathed, noise-displaced form: something with a silhouette rather than a
 * primitive's obvious profile, so the settled cloud reads as a subject instead
 * of a demo of a built-in geometry.
 */
function sculptGeometry(): THREE.BufferGeometry {
  const sphere = new THREE.SphereGeometry(1.3, 128, 96);
  const position = sphere.getAttribute("position");
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const direction = vertex.clone().normalize();
    // Layered trig standing in for noise: cheap, seamless on a sphere, and
    // deterministic, which keeps the shape identical between renders.
    const swell =
      0.34 * Math.sin(direction.y * 3.1 + 0.6) +
      0.16 * Math.sin(direction.x * 5.2 + direction.z * 3.7) +
      0.09 * Math.sin(direction.z * 8.4 - direction.y * 6.1);
    // Taper toward the base so it stands rather than floats.
    const taper = 1 + 0.22 * direction.y;
    vertex.copy(direction).multiplyScalar((1.3 + swell) * taper);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  position.needsUpdate = true;
  return sphere;
}

/** Built-in geometry, one per slot, used when a shape carries no model URL. */
function parametricGeometry(slot: number): THREE.BufferGeometry {
  switch (slot % 4) {
    case 0:
      return chainGeometry();
    case 1:
      return sculptGeometry();
    case 2:
      return new THREE.TorusKnotGeometry(1, 0.32, 320, 40);
    default:
      return new THREE.TorusGeometry(1.15, 0.4, 48, 200);
  }
}

/**
 * Scale and center a geometry so every shape in the set occupies the same
 * volume. Without this a morph reads as a zoom as much as a change of form.
 */
function normalise(geometry: THREE.BufferGeometry, target = 1.5) {
  geometry.computeBoundingSphere();
  const sphere = geometry.boundingSphere;
  if (!sphere) return geometry;
  geometry.translate(-sphere.center.x, -sphere.center.y, -sphere.center.z);
  geometry.scale(
    target / sphere.radius,
    target / sphere.radius,
    target / sphere.radius,
  );
  return geometry;
}

/**
 * Load a GLB and reduce it to a single position-only geometry in world space.
 *
 * Everything except positions is dropped: the cloud never shades, so materials,
 * normals and UVs are dead weight, and stripping them means a mesh with several
 * differently-attributed parts still merges cleanly. Each part is baked through
 * its own world matrix first, otherwise a model whose parts are placed by node
 * transforms collapses onto the origin.
 *
 * The loader is imported here rather than at module scope so a component using
 * only parametric shapes never pays for it.
 */
async function loadModelGeometry(url: string): Promise<THREE.BufferGeometry> {
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const gltf = await new GLTFLoader().loadAsync(url);
  gltf.scene.updateMatrixWorld(true);

  const chunks: Float32Array[] = [];
  let total = 0;
  gltf.scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const source = mesh.geometry.index
      ? mesh.geometry.toNonIndexed()
      : mesh.geometry.clone();
    source.applyMatrix4(mesh.matrixWorld);
    const position = source.getAttribute("position");
    if (position) {
      const copy = new Float32Array(position.array as ArrayLike<number>);
      chunks.push(copy);
      total += copy.length;
    }
    source.dispose();
  });

  if (total === 0) throw new Error("no mesh geometry in model");

  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(merged, 3));
  return geometry;
}

/**
 * Area-weighted surface sampling. Picking a triangle uniformly would crowd the
 * points wherever the source mesh happens to be finely tessellated, so triangles
 * are drawn in proportion to their area from a cumulative table, then a point is
 * placed inside one with reflected barycentric coordinates.
 */
function sampleSurface(
  geometry: THREE.BufferGeometry,
  count: number,
  random: () => number,
): Float32Array {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const triangles = index ? index.count / 3 : position.count / 3;
  const corner = (t: number, k: number) =>
    index ? index.getX(t * 3 + k) : t * 3 + k;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const cross = new THREE.Vector3();

  const cumulative = new Float32Array(triangles);
  let total = 0;
  for (let t = 0; t < triangles; t += 1) {
    a.fromBufferAttribute(position, corner(t, 0));
    b.fromBufferAttribute(position, corner(t, 1));
    c.fromBufferAttribute(position, corner(t, 2));
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    total += cross.crossVectors(ab, ac).length() * 0.5;
    cumulative[t] = total;
  }

  const out = new Float32Array(count * 3);
  if (total <= 0) return out;

  for (let i = 0; i < count; i += 1) {
    const pick = random() * total;
    let lo = 0;
    let hi = triangles - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < pick) lo = mid + 1;
      else hi = mid;
    }
    a.fromBufferAttribute(position, corner(lo, 0));
    b.fromBufferAttribute(position, corner(lo, 1));
    c.fromBufferAttribute(position, corner(lo, 2));
    ab.subVectors(b, a);
    ac.subVectors(c, a);

    let u = random();
    let v = random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    out[i * 3] = a.x + ab.x * u + ac.x * v;
    out[i * 3 + 1] = a.y + ab.y * u + ac.y * v;
    out[i * 3 + 2] = a.z + ab.z * u + ac.z * v;
  }
  return out;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uStagger;
  uniform float uDisperse;
  uniform float uSize;
  uniform float uDepthRef;
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uPointerStrength;
  uniform float uPointerRadius;

  attribute vec3  aFrom;
  attribute vec3  aTo;
  attribute vec3  aDrift;
  attribute float aSeed;

  varying float vAlpha;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Each point starts its own move a little after the one before it, so the
    // cloud peels off the old shape instead of leaving it all at once.
    float local = clamp(uProgress * (1.0 + uStagger) - aSeed * uStagger, 0.0, 1.0);
    float eased = easeInOut(local);

    vec3 pos = mix(aFrom, aTo, eased);

    // Bow the path outward, peaking halfway. This is what turns a straight
    // interpolation into something that looks like it came apart and reformed.
    float burst = sin(local * 3.141592653589793);
    pos += aDrift * burst * uDisperse * (0.45 + aSeed);

    // A little idle life so a settled shape is never completely static.
    pos += aDrift * 0.012 * sin(uTime * 0.6 + aSeed * 42.0);

    vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * viewPos;

    // Push points away from the cursor in screen space, so the response reads
    // the same wherever the cloud happens to be in depth.
    vec2 ndc = clip.xy / clip.w;
    vec2 away = ndc - uPointer;
    float dist = length(away);
    float influence = exp(-pow(dist / uPointerRadius, 2.0) * 2.0) * uPointerStrength;
    viewPos.xy += normalize(away + vec2(1e-5)) * influence;

    gl_Position = projectionMatrix * viewPos;

    // Size is normalised against the camera distance, so uSize is a size in
    // pixels at the middle of the cloud rather than a world measurement. Scaling
    // by raw depth instead would make each point tens of pixels across, and the
    // cloud would fuse into a silhouette instead of reading as grain.
    gl_PointSize =
      uSize * (0.55 + 0.9 * aSeed) * (uDepthRef / max(0.001, -viewPos.z));

    // Kept well below opaque: the mass has to come from many points overlapping,
    // not from any one of them. Fading further while dispersed stops the loose
    // middle of a morph reading as noise sprayed over the frame.
    vAlpha = 0.5 - 0.28 * burst;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    // Round the sprite and soften its rim so dense areas sinter together
    // instead of showing a grid of squares.
    float d = dot(offset, offset);
    if (d > 0.25) discard;
    float edge = smoothstep(0.25, 0.06, d);
    gl_FragColor = vec4(uColor, vAlpha * edge);
  }
`;

/** Deterministic RNG, so the cloud is identical between server and client. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export default function DustMorphHero({
  shapes = DEFAULT_SHAPES,
  count = 65000,
  dwell = 4.2,
  morphDuration = 1.9,
  disperse = 0.85,
  pointSize = 1.9,
  color = DEFAULT_COLOR,
  background = DEFAULT_BACKGROUND,
  pointerStrength = 0.42,
  pointerRadius = 0.42,
  eyebrow = "BLANK",
  className,
}: DustMorphHeroProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // Model URLs, flattened, so a changed source re-samples but a new array
  // literal with the same contents does not tear the scene down.
  const shapeKey = shapes.map((shape) => shape.model ?? "").join("|");
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(true);
  const advanceRef = useRef<(() => void) | null>(null);

  // Mirrored so the render loop can read current values without restarting.
  const live = useRef({
    dwell,
    morphDuration,
    disperse,
    pointSize,
    pointerStrength,
    pointerRadius,
    color,
  });
  live.current = {
    dwell,
    morphDuration,
    disperse,
    pointSize,
    pointerStrength,
    pointerRadius,
    color,
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Sampling can now involve a network fetch, so setup is async. Everything
    // disposable registers here, and the cleanup runs whatever exists at the
    // time: unmounting mid-load must not leave a renderer or a socket behind.
    let cancelled = false;
    const disposers: Array<() => void> = [];

    const setup = async () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const shapeCount = Math.max(1, shapes.length);
      const points = Math.max(1000, Math.round(count));

      // Sample every shape up front. All clouds share a point count so index i
      // on one shape is the same point as index i on the next.
      const random = makeRandom(0x9e3779b9);
      const clouds: Float32Array[] = [];
      for (let i = 0; i < shapeCount; i += 1) {
        const url = shapes[i]?.model;
        let geometry: THREE.BufferGeometry;
        if (url) {
          try {
            geometry = normalise(await loadModelGeometry(url));
          } catch {
            // A missing or broken model degrades to its parametric slot rather
            // than leaving a hole in the cycle.
            geometry = normalise(parametricGeometry(i));
          }
        } else {
          geometry = normalise(parametricGeometry(i));
        }
        if (cancelled) {
          geometry.dispose();
          return;
        }
        clouds.push(sampleSurface(geometry, points, random));
        geometry.dispose();
      }
      if (cancelled) return;

      buildScene(clouds, points, shapeCount, reduceMotion);
    };

    const buildScene = (
      clouds: Float32Array[],
      points: number,
      shapeCount: number,
      reduceMotion: boolean,
    ) => {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(new THREE.Color(background), 1);
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      const random = makeRandom(0x517cc1b7);
      const drift = new Float32Array(points * 3);
      const seeds = new Float32Array(points);
      for (let i = 0; i < points; i += 1) {
        // Random unit direction, rejection-free via spherical coordinates.
        const theta = random() * Math.PI * 2;
        const z = random() * 2 - 1;
        const r = Math.sqrt(Math.max(0, 1 - z * z));
        drift[i * 3] = Math.cos(theta) * r;
        drift[i * 3 + 1] = Math.sin(theta) * r;
        drift[i * 3 + 2] = z;
        seeds[i] = random();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(clouds[0].slice(), 3),
      );
      geometry.setAttribute(
        "aFrom",
        new THREE.BufferAttribute(clouds[0].slice(), 3),
      );
      geometry.setAttribute(
        "aTo",
        new THREE.BufferAttribute(clouds[0].slice(), 3),
      );
      geometry.setAttribute("aDrift", new THREE.BufferAttribute(drift, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

      const uniforms = {
        uProgress: { value: 0 },
        uStagger: { value: 0.55 },
        uDisperse: { value: disperse },
        uSize: { value: pointSize },
        uDepthRef: { value: camera.position.z },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(10, 10) },
        uPointerStrength: { value: 0 },
        uPointerRadius: { value: pointerRadius },
        uColor: { value: new THREE.Color(color) },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      });

      const cloud = new THREE.Points(geometry, material);
      scene.add(cloud);

      let current = 0;
      let morphing = false;
      let morphStart = 0;
      let holdUntil = 0;
      let frame = 0;
      let running = true;
      const clock = new THREE.Clock();

      const fromAttr = geometry.getAttribute("aFrom") as THREE.BufferAttribute;
      const toAttr = geometry.getAttribute("aTo") as THREE.BufferAttribute;

      const beginMorph = (next: number) => {
        if (morphing || shapeCount < 2) return;
        const target = ((next % shapeCount) + shapeCount) % shapeCount;
        if (target === current) return;
        fromAttr.array.set(clouds[current]);
        toAttr.array.set(clouds[target]);
        fromAttr.needsUpdate = true;
        toAttr.needsUpdate = true;
        uniforms.uProgress.value = 0;
        morphing = true;
        morphStart = clock.getElapsedTime();
        current = target;
        setActive(target);
        setSettled(false);
      };

      advanceRef.current = () => beginMorph(current + 1);

      const pointerTarget = new THREE.Vector2(10, 10);
      let pointerWeightTarget = 0;
      let pointerWeight = 0;

      const onPointerMove = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerTarget.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        );
        pointerWeightTarget = 1;
      };
      const onPointerLeave = () => {
        pointerWeightTarget = 0;
      };

      const resize = () => {
        const rect = mount.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Pull back on narrow screens so the cloud never crops.
        camera.position.z = 6.2 * Math.max(1, 1.15 / Math.min(1, width / 900));
        camera.updateProjectionMatrix();
        // Point size is measured against this, so it has to follow the pull-back.
        uniforms.uDepthRef.value = camera.position.z;
      };

      const render = () => {
        const time = clock.getElapsedTime();
        const s = live.current;

        uniforms.uTime.value = time;
        uniforms.uDisperse.value = s.disperse;
        uniforms.uSize.value = s.pointSize;
        uniforms.uPointerRadius.value = s.pointerRadius;

        pointerWeight += (pointerWeightTarget - pointerWeight) * 0.07;
        uniforms.uPointer.value.lerp(pointerTarget, 0.12);
        uniforms.uPointerStrength.value = s.pointerStrength * pointerWeight;

        if (morphing) {
          const t = Math.min(
            1,
            (time - morphStart) / Math.max(0.001, s.morphDuration),
          );
          uniforms.uProgress.value = t;
          if (t >= 1) {
            // Bake the arrival so the next morph starts from a clean baseline.
            fromAttr.array.set(clouds[current]);
            fromAttr.needsUpdate = true;
            uniforms.uProgress.value = 0;
            morphing = false;
            holdUntil = time + s.dwell;
            setSettled(true);
          }
        } else if (
          s.dwell > 0 &&
          !reduceMotion &&
          time > holdUntil &&
          shapeCount > 1
        ) {
          beginMorph(current + 1);
        }

        // Slow turn, plus a slight lean toward the pointer.
        cloud.rotation.y =
          time * 0.14 + uniforms.uPointer.value.x * 0.25 * pointerWeight;
        cloud.rotation.x =
          Math.sin(time * 0.11) * 0.09 -
          uniforms.uPointer.value.y * 0.18 * pointerWeight;

        renderer.render(scene, camera);
      };

      const loop = () => {
        if (!running) return;
        render();
        frame = requestAnimationFrame(loop);
      };

      resize();
      holdUntil = dwell;
      if (reduceMotion) {
        render();
      } else {
        frame = requestAnimationFrame(loop);
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);

      // Stop rendering when the hero is not on screen; a point cloud this size is
      // not something to keep running behind the fold.
      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          const visible = entry?.isIntersecting ?? true;
          if (reduceMotion) return;
          if (visible && !running) {
            running = true;
            frame = requestAnimationFrame(loop);
          } else if (!visible && running) {
            running = false;
            cancelAnimationFrame(frame);
          }
        },
        { rootMargin: "96px" },
      );
      intersectionObserver.observe(mount);

      const element = renderer.domElement;
      element.addEventListener("pointermove", onPointerMove, { passive: true });
      element.addEventListener("pointerleave", onPointerLeave, {
        passive: true,
      });

      disposers.push(() => {
        running = false;
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerleave", onPointerLeave);
        advanceRef.current = null;
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (element.parentNode === mount) mount.removeChild(element);
      });
    };

    setup();

    return () => {
      cancelled = true;
      for (const dispose of disposers) dispose();
    };
    // Rebuild when the point budget, the shape count, or any model URL changes.
  }, [count, shapes.length, shapeKey, background]);

  const label = shapes[active]?.label ?? "";

  return (
    <section
      className={className}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100svh",
        width: "100%",
        overflow: "hidden",
        background,
        color,
      }}
    >
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          pointerEvents: "none",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            opacity: 0.55,
          }}
        >
          {eyebrow}
        </span>

        {/* Keyed on the label so React remounts it, which restarts the reveal
            without needing a transition library to sequence it. */}
        <h1
          key={label}
          style={{
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: "clamp(1.6rem, 4.2vw, 3.4rem)",
            fontWeight: 400,
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
            mixBlendMode: "multiply",
          }}
        >
          {label.split("").map((character, index) => (
            <span
              key={`${label}-${index}`}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: settled ? 1 : 0,
                transform: settled ? "none" : "translateY(0.45em)",
                filter: settled ? "blur(0)" : "blur(6px)",
                transition: `opacity 520ms ease ${index * 26}ms, transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 26}ms, filter 520ms ease ${index * 26}ms`,
              }}
            >
              {character}
            </span>
          ))}
        </h1>

        {shapes.length > 1 && (
          <button
            type="button"
            onClick={() => advanceRef.current?.()}
            style={{
              pointerEvents: "auto",
              marginTop: "1.1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              border: `1px solid ${color}33`,
              borderRadius: "999px",
              background: "transparent",
              color,
              cursor: "pointer",
              padding: "0.7em 1.4em",
              font: "inherit",
              fontSize: "0.78rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Next
            <span aria-hidden="true" style={{ opacity: 0.5 }}>
              {active + 1}/{shapes.length}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
