"use client";

/**
 * Dust Morph Hero
 *
 * A hero where the subject is never a mesh. Each shape is a cloud of points, and
 * the same cloud is reused for every shape in the set, so moving between shapes
 * is not a swap or a crossfade: every point keeps its identity and travels from
 * where it sat on the old surface to where it sits on the new one.
 *
 * Every point carries a surface normal as well as a position, and that is what
 * separates this from a particle toy. The normal does three jobs:
 *
 *   - It lights the cloud. Ambient, a wrapped diffuse term and a rim term are
 *     evaluated per point, so a settled cloud reads as a lit form with a near
 *     side and a far side rather than a flat spray of ink.
 *   - It aims the burst. Points leave along their own outward direction, so the
 *     shape inflates off its own surface instead of smearing toward a random
 *     point in space. That is the difference between a form coming apart and a
 *     tween with noise on it.
 *   - It survives the move. Normals are interpolated alongside positions, so the
 *     shading is continuous through the morph instead of popping at the end.
 *
 * The morph runs in three overlapping phases (burst out along the source normal,
 * cross to a shell just off the target, settle onto it), each with its own
 * easing, and each point's start is delayed by its rank along an axis. That rank
 * is what makes the change read as a wipe travelling through the form rather
 * than every point leaving at once.
 *
 * Shapes default to parametric geometry, so the component ships with no asset to
 * host. Give a shape a `model` URL and the file is fetched once and dispatched
 * on its magic bytes: a glTF binary is sampled into a cloud, and a PCLD/PCL2/
 * PCL4 point cloud is decoded directly, since it is already one. Both paths
 * produce positions and normals, so nothing downstream knows which was used.
 *
 * You must have the rights to any model you point this at. Nothing is bundled.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Axis the morph wipes along, or "none" to stagger by seed instead. */
export type DustMorphWipe = "x+" | "x-" | "y+" | "y-" | "z+" | "z-" | "none";

export interface DustMorphShape {
  /** Label shown under the cloud while this shape is settled. */
  label: string;
  /**
   * URL of a model to use instead of the built-in parametric shape. Either a
   * glTF binary, which is sampled into a cloud, or a PCLD/PCL2/PCL4 point
   * cloud, which is decoded as-is. The format is detected from the file's magic
   * bytes rather than its extension. Falls back to the parametric shape if the
   * file cannot be loaded.
   */
  model?: string;
}

export interface DustMorphLighting {
  /** Direction the light comes from, in view space. Normalised for you. */
  direction?: [number, number, number];
  /** Floor brightness, so points facing away are shaded rather than black. */
  ambient?: number;
  /** Strength of the lambert term. */
  diffuse?: number;
  /**
   * Wraps the lambert term past the terminator. Higher values soften the
   * shadow line, which suits a cloud: a hard terminator on loose points reads
   * as a seam rather than a shadow.
   */
  wrap?: number;
  /** Strength of the grazing-angle term that picks out the silhouette. */
  rim?: number;
  /** Tightness of that rim. Higher is a thinner edge. */
  rimPower?: number;
}

export interface DustMorphHeroProps {
  /** Shapes cycled through, in order. Two or more to have anything to morph. */
  shapes?: DustMorphShape[];
  /** Points drawn per shape. The single biggest cost lever. */
  count?: number;
  /** Seconds a shape holds before advancing on its own. 0 waits for input. */
  dwell?: number;
  /** Seconds a morph takes end to end. */
  morphDuration?: number;
  /** How far points burst along their own normal, in world units. */
  disperse?: number;
  /** How far off the target surface points gather before settling onto it. */
  settleOffset?: number;
  /**
   * Per-point variation in burst distance, as a fraction. 0 gives a clean
   * offset shell, higher values give a ragged one.
   */
  spike?: number;
  /**
   * Share of the morph spent handing over from the first point to the last.
   * 0 moves every point together; near 1 is a slow sweep.
   */
  stagger?: number;
  /** Axis the wipe travels along. */
  wipe?: DustMorphWipe;
  /**
   * Share of the frame the subject fills, 0 to 1. The camera is placed to
   * satisfy this against whichever of width or height is tighter, so the subject
   * is the same size on a phone as on a desktop and never crops.
   */
  fit?: number;
  /** Point size in px at the reference distance. */
  pointSize?: number;
  /**
   * Device pixels drawn per CSS pixel, capped by the screen's own ratio.
   *
   * This is a density control, not a quality one. What makes a cloud read as a
   * volume is points per pixel, so rendering at full retina resolution spreads
   * the same points over four times the area and thins the subject to grain.
   * Trading resolution for points is the better side of that bargain here.
   */
  pixelRatio?: number;
  /** Ink the points are drawn in, at full light. */
  color?: string;
  /** Paper behind the cloud. */
  background?: string;
  /** Lighting model applied per point. */
  lighting?: DustMorphLighting;
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

/**
 * A mid grey-green rather than a near-black. The lighting term multiplies this,
 * so the ink needs headroom to darken into: pick something already near black
 * and every point shades to the same near black, which is a flat cloud with
 * extra maths behind it.
 *
 * Burst and settle distances are quoted against a cloud normalised to
 * CLOUD_RADIUS, so they stay in proportion whatever the source model measured.
 */
const DEFAULT_COLOR = "#7b7c74";
/** Cool grey-green paper, sampled rather than guessed. */
const DEFAULT_BACKGROUND = "#d4d5cd";

const DEFAULT_LIGHTING: Required<DustMorphLighting> = {
  direction: [0.35, 0.9, 0.45],
  ambient: 0.24,
  diffuse: 1.12,
  wrap: 0.64,
  rim: 0.36,
  rimPower: 3.35,
};

/**
 * Phase windows, as fractions of a single point's own travel. They overlap on
 * purpose: the cross begins before the burst has finished, so the cloud is never
 * momentarily still at its widest, which would read as two moves rather than one.
 */
const BURST_START = 0;
const BURST_DURATION = 0.38;
const CROSS_START = 0.38;
const CROSS_DURATION = 0.46;
const SETTLE_START = 0.8;
const SETTLE_DURATION = 0.18;
/** Share of the stagger applied again to the burst alone, so it leads the cross. */
const BURST_STAGGER = 0.22;

/**
 * Radius every cloud is scaled to. The value itself is arbitrary; what matters
 * is that all shapes share it, so the camera can be framed once against a known
 * size rather than per shape.
 */
const CLOUD_RADIUS = 1.5;
/** Vertical field of view, degrees. */
const FOV = 44;
/** Turn rate about Y, radians per second. Roughly 8.7 degrees per second. */
const SPIN = 0.152;

/** A cloud is the only currency here: positions, normals, and a wipe order. */
interface Cloud {
  positions: Float32Array;
  normals: Float32Array;
  rank: Float32Array;
}

/* -------------------------------------------------------------------------- */
/* Point cloud decoding                                                        */
/* -------------------------------------------------------------------------- */

const PCL_HEADER_V1 = 12;
const PCL_HEADER_V2 = 16;
const PCL_HEADER_V4 = 28;

/**
 * Read `count` little-endian values of `bits` width from a bit-packed run.
 *
 * Positions are quantized to a width that is rarely a whole number of bytes, so
 * values straddle byte boundaries. Bytes are pulled into an accumulator only as
 * the width demands, which means the returned cursor is the first byte the next
 * section starts on rather than a padded offset.
 */
function unpackBits(
  view: DataView,
  offset: number,
  count: number,
  bits: number,
): { values: Uint32Array; next: number } {
  if (bits <= 0 || bits > 32) throw new Error(`bad packed width ${bits}`);
  const values = new Uint32Array(count);
  const mask = bits === 32 ? 0xffffffff : (1 << bits) - 1;
  let at = offset;
  let acc = 0;
  let have = 0;
  for (let i = 0; i < count; i += 1) {
    while (have < bits) {
      if (at >= view.byteLength) throw new Error("point cloud ended early");
      acc |= view.getUint8(at) << have;
      have += 8;
      at += 1;
    }
    values[i] = (acc & mask) >>> 0;
    acc >>>= bits;
    have -= bits;
  }
  return { values, next: at };
}

/** Zig-zag: maps signed deltas onto unsigned so small negatives stay small. */
const zigzag = (v: number) => (v >>> 1) ^ -(v & 1);

/**
 * Octahedral decode. A unit normal costs two bytes this way instead of twelve,
 * with an error far below what a one-pixel point could ever show.
 */
function octDecode(u: number, v: number): [number, number, number] {
  let x = u * 2 - 1;
  let y = v * 2 - 1;
  const z = 1 - Math.abs(x) - Math.abs(y);
  if (z < 0) {
    const px = x;
    x = (1 - Math.abs(y)) * (px >= 0 ? 1 : -1);
    y = (1 - Math.abs(px)) * (y >= 0 ? 1 : -1);
  }
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function readNormals(
  buffer: ArrayBuffer,
  view: DataView,
  offset: number,
  count: number,
  mode: number,
): { normals: Float32Array; next: number } {
  const normals = new Float32Array(count * 3);
  if (mode === 0) {
    const bytes = count * 3 * 4;
    if (buffer.byteLength < offset + bytes)
      throw new Error("normals truncated");
    normals.set(new Float32Array(buffer.slice(offset, offset + bytes)));
    return { normals, next: offset + bytes };
  }
  if (mode !== 1) throw new Error(`unsupported normal mode ${mode}`);
  const bytes = count * 2;
  if (buffer.byteLength < offset + bytes) throw new Error("normals truncated");
  for (let i = 0; i < count; i += 1) {
    const [x, y, z] = octDecode(
      view.getUint8(offset + i * 2) / 255,
      view.getUint8(offset + i * 2 + 1) / 255,
    );
    normals[i * 3] = x;
    normals[i * 3 + 1] = y;
    normals[i * 3 + 2] = z;
  }
  return { normals, next: offset + bytes };
}

/**
 * Decode a baked point cloud.
 *
 * Three revisions of the same idea are accepted. PCLD is raw float32 positions
 * followed by raw float32 normals. PCL2 optionally quantizes positions into one
 * global bounding box and normals to octahedral bytes. PCL4 splits the cloud
 * into spatially coherent chunks, each with its own tight box, and stores only
 * the first point of a chunk outright: every point after it is a small
 * zig-zagged delta from the one before. A tighter box per chunk means fewer bits
 * buy the same precision, which is how seven hundred thousand lit points fit in
 * a few megabytes.
 */
function decodePointCloud(
  buffer: ArrayBuffer,
  label: string,
): { positions: Float32Array; normals: Float32Array } {
  if (buffer.byteLength < PCL_HEADER_V1) throw new Error(`${label}: too small`);
  const view = new DataView(buffer);
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  const count = view.getUint32(8, true);

  if (magic === "PCLD") {
    const bytes = count * 3 * 4;
    const end = PCL_HEADER_V1 + bytes * 2;
    if (buffer.byteLength !== end) throw new Error(`${label}: bad length`);
    return {
      positions: new Float32Array(
        buffer.slice(PCL_HEADER_V1, PCL_HEADER_V1 + bytes),
      ),
      normals: new Float32Array(buffer.slice(PCL_HEADER_V1 + bytes, end)),
    };
  }

  if (magic === "PCL2") {
    const positionMode = view.getUint8(12);
    const normalMode = view.getUint8(13);
    let at = PCL_HEADER_V2;
    const positions = new Float32Array(count * 3);
    if (positionMode === 0) {
      positions.set(new Float32Array(buffer, at, count * 3));
      at += count * 3 * 4;
    } else if (positionMode === 1) {
      const minX = view.getFloat32(at, true);
      const minY = view.getFloat32(at + 4, true);
      const minZ = view.getFloat32(at + 8, true);
      const spanX = Math.max(view.getFloat32(at + 12, true) - minX, 1e-8);
      const spanY = Math.max(view.getFloat32(at + 16, true) - minY, 1e-8);
      const spanZ = Math.max(view.getFloat32(at + 20, true) - minZ, 1e-8);
      at += 24;
      for (let i = 0; i < count; i += 1) {
        const at3 = at + i * 6;
        positions[i * 3] = minX + (view.getUint16(at3, true) / 65535) * spanX;
        positions[i * 3 + 1] =
          minY + (view.getUint16(at3 + 2, true) / 65535) * spanY;
        positions[i * 3 + 2] =
          minZ + (view.getUint16(at3 + 4, true) / 65535) * spanZ;
      }
      at += count * 6;
    } else {
      throw new Error(`${label}: unsupported position mode ${positionMode}`);
    }
    const { normals } = readNormals(buffer, view, at, count, normalMode);
    return { positions, normals };
  }

  if (magic !== "PCL4") throw new Error(`${label}: unknown magic "${magic}"`);
  if (buffer.byteLength < PCL_HEADER_V4) throw new Error(`${label}: too small`);

  const positionMode = view.getUint8(12);
  const normalMode = view.getUint8(13);
  const flags = view.getUint8(15);
  const chunkSize = view.getUint32(16, true);
  const chunkCount = view.getUint32(20, true);
  const anchorBits = view.getUint8(24);
  const deltaBits = view.getUint8(25);
  const delta = (flags & 1) !== 0;

  let at = PCL_HEADER_V4;
  const positions = new Float32Array(count * 3);

  if (positionMode === 0) {
    positions.set(new Float32Array(buffer, at, count * 3));
    at += count * 3 * 4;
  } else {
    if (chunkSize <= 0 || chunkCount <= 0) {
      throw new Error(`${label}: missing chunk metadata`);
    }
    // Per-chunk bounding boxes, read before the packed streams that index them.
    const boxes: Array<{
      minX: number;
      minY: number;
      minZ: number;
      spanX: number;
      spanY: number;
      spanZ: number;
    }> = [];
    for (let c = 0; c < chunkCount; c += 1) {
      const minX = view.getFloat32(at, true);
      const minY = view.getFloat32(at + 4, true);
      const minZ = view.getFloat32(at + 8, true);
      boxes.push({
        minX,
        minY,
        minZ,
        spanX: Math.max(view.getFloat32(at + 12, true) - minX, 1e-8),
        spanY: Math.max(view.getFloat32(at + 16, true) - minY, 1e-8),
        spanZ: Math.max(view.getFloat32(at + 20, true) - minZ, 1e-8),
      });
      at += 24;
    }

    const scale = (1 << anchorBits) - 1;
    const write = (
      index: number,
      box: (typeof boxes)[number],
      x: number,
      y: number,
      z: number,
    ) => {
      const o = index * 3;
      positions[o] = box.minX + (x / scale) * box.spanX;
      positions[o + 1] = box.minY + (y / scale) * box.spanY;
      positions[o + 2] = box.minZ + (z / scale) * box.spanZ;
    };

    if (delta) {
      // One outright anchor per chunk, then a delta per point after it.
      const anchors = unpackBits(view, at, chunkCount * 3, anchorBits);
      at = anchors.next;
      const deltas = unpackBits(
        view,
        at,
        Math.max(count - chunkCount, 0) * 3,
        deltaBits,
      );
      at = deltas.next;

      let a = 0;
      let d = 0;
      for (let c = 0; c < chunkCount; c += 1) {
        const start = c * chunkSize;
        const end = Math.min(start + chunkSize, count);
        const box = boxes[c];
        let x = anchors.values[a];
        let y = anchors.values[a + 1];
        let z = anchors.values[a + 2];
        a += 3;
        write(start, box, x, y, z);
        for (let i = start + 1; i < end; i += 1) {
          x += zigzag(deltas.values[d]);
          y += zigzag(deltas.values[d + 1]);
          z += zigzag(deltas.values[d + 2]);
          d += 3;
          write(i, box, x, y, z);
        }
      }
    } else {
      const packed = unpackBits(view, at, count * 3, anchorBits);
      at = packed.next;
      let p = 0;
      for (let c = 0; c < chunkCount; c += 1) {
        const start = c * chunkSize;
        const end = Math.min(start + chunkSize, count);
        const box = boxes[c];
        for (let i = start; i < end; i += 1) {
          write(
            i,
            box,
            packed.values[p],
            packed.values[p + 1],
            packed.values[p + 2],
          );
          p += 3;
        }
      }
    }
  }

  const { normals } = readNormals(buffer, view, at, count, normalMode);
  return { positions, normals };
}

/* -------------------------------------------------------------------------- */
/* Parametric geometry                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Concatenate geometries into one position-and-normal buffer. Everything else is
 * dropped: the cloud never textures, so UVs are dead weight, and stripping them
 * means parts with mismatched attributes still merge without complaint.
 */
function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positionChunks: Float32Array[] = [];
  const normalChunks: Float32Array[] = [];
  let total = 0;
  for (const part of parts) {
    const source = part.index ? part.toNonIndexed() : part;
    if (!source.getAttribute("normal")) source.computeVertexNormals();
    const position = source.getAttribute("position");
    const normal = source.getAttribute("normal");
    positionChunks.push(new Float32Array(position.array as ArrayLike<number>));
    normalChunks.push(new Float32Array(normal.array as ArrayLike<number>));
    total += position.count * 3;
    if (source !== part) source.dispose();
    part.dispose();
  }
  const positions = new Float32Array(total);
  const normals = new Float32Array(total);
  let offset = 0;
  for (let i = 0; i < positionChunks.length; i += 1) {
    positions.set(positionChunks[i], offset);
    normals.set(normalChunks[i], offset);
    offset += positionChunks[i].length;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  return geometry;
}

/**
 * A run of interlocking links following a gentle S. Consecutive links are spaced
 * under their own diameter and swung into alternating planes, so they actually
 * pass through one another rather than sitting in a row. Sampled as a cloud the
 * interlock is the whole point: it gives the silhouette holes that survive the
 * morph, which is what a solid blob cannot do.
 */
function chainGeometry(links = 5): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const ring = 0.46;
  const tube = 0.125;
  /** Elongation along the run, which is what makes a link a link. */
  const stretch = 1.7;
  // Half a link's length, so consecutive loops overlap rather than abut.
  const pitch = ring * stretch;

  for (let i = 0; i < links; i += 1) {
    const link = new THREE.TorusGeometry(ring, tube, 20, 96);
    // Stretch in the ring's own plane before any rotation, so the long axis ends
    // up along the run no matter which plane the link is turned into.
    link.scale(stretch, 1, 1);

    const t = i - (links - 1) / 2;
    const position = new THREE.Vector3(
      t * pitch,
      Math.sin((t / links) * Math.PI * 1.5) * 0.42,
      Math.cos((t / links) * Math.PI * 1.1) * 0.2,
    );
    // A torus is rotationally symmetric about its own hole axis, so turning a
    // link about the run would do nothing at all. The alternation has to swing
    // the whole plane instead: even links lie in the run's horizontal plane, odd
    // ones stand upright in it, and that crossing is the interlock.
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
  return mergeParts(parts);
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
  // The sphere's own normals still point at the undisplaced surface, and the
  // lighting is entirely normal-driven, so recomputing here is not a tidy-up:
  // skip it and the swells are invisible.
  sphere.computeVertexNormals();
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

/* -------------------------------------------------------------------------- */
/* Sampling                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Area-weighted surface sampling. Picking a triangle uniformly would crowd the
 * points wherever the source mesh happens to be finely tessellated, so triangles
 * are drawn in proportion to their area from a cumulative table, then a point is
 * placed inside one with reflected barycentric coordinates.
 *
 * The same barycentric weights interpolate the vertex normals, so a sampled
 * point is lit by the surface it came from rather than by its triangle's facet.
 * Where the source carries no normals at all, the face normal stands in.
 */
function sampleGeometry(
  geometry: THREE.BufferGeometry,
  count: number,
  random: () => number,
): { positions: Float32Array; normals: Float32Array } {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
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
  const na = new THREE.Vector3();
  const nb = new THREE.Vector3();
  const nc = new THREE.Vector3();

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

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  if (total <= 0) return { positions, normals };

  for (let i = 0; i < count; i += 1) {
    const pick = random() * total;
    let lo = 0;
    let hi = triangles - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < pick) lo = mid + 1;
      else hi = mid;
    }
    const i0 = corner(lo, 0);
    const i1 = corner(lo, 1);
    const i2 = corner(lo, 2);
    a.fromBufferAttribute(position, i0);
    b.fromBufferAttribute(position, i1);
    c.fromBufferAttribute(position, i2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);

    let u = random();
    let v = random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const o = i * 3;
    positions[o] = a.x + ab.x * u + ac.x * v;
    positions[o + 1] = a.y + ab.y * u + ac.y * v;
    positions[o + 2] = a.z + ab.z * u + ac.z * v;

    if (normal) {
      na.fromBufferAttribute(normal, i0);
      nb.fromBufferAttribute(normal, i1);
      nc.fromBufferAttribute(normal, i2);
      na.multiplyScalar(1 - u - v)
        .addScaledVector(nb, u)
        .addScaledVector(nc, v);
      if (na.lengthSq() < 1e-12) na.copy(cross.crossVectors(ab, ac));
    } else {
      na.copy(cross.crossVectors(ab, ac));
    }
    na.normalize();
    normals[o] = na.x;
    normals[o + 1] = na.y;
    normals[o + 2] = na.z;
  }
  return { positions, normals };
}

/**
 * Reduce a decoded cloud to the working point budget by walking it at a stride.
 *
 * A baked cloud is stored in spatially coherent chunks so its deltas stay small,
 * which means taking a prefix would return one corner of the model. A stride
 * crosses every chunk instead, so a tenth of the points is still the whole
 * shape. Points are also repeated rather than refused when the budget exceeds
 * what the file holds, so a cloud is never the reason a set fails to morph.
 */
function resample(
  source: { positions: Float32Array; normals: Float32Array },
  count: number,
): { positions: Float32Array; normals: Float32Array } {
  const available = Math.floor(source.positions.length / 3);
  if (available === count) return source;
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const pick = available > 0 ? Math.floor((i * available) / count) : 0;
    const from = pick * 3;
    const to = i * 3;
    positions[to] = source.positions[from];
    positions[to + 1] = source.positions[from + 1];
    positions[to + 2] = source.positions[from + 2];
    normals[to] = source.normals[from];
    normals[to + 1] = source.normals[from + 1];
    normals[to + 2] = source.normals[from + 2];
  }
  return { positions, normals };
}

/**
 * Center a cloud and scale it to a common radius, so every shape in the set
 * occupies the same volume. Without this a morph reads as a zoom as much as a
 * change of form. Normals are untouched: a uniform scale about the centre does
 * not turn them.
 */
function normalise(positions: Float32Array, target: number) {
  const count = positions.length / 3;
  if (count === 0) return;

  // Centre on the bounding box, not the centroid. A centroid is weighted by
  // where the points happen to be dense, so a shape with a heavy base would sit
  // off-centre and the whole set would appear to shift during a morph.
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;

  let maxSq = 0;
  for (let i = 0; i < count; i += 1) {
    const dx = positions[i * 3] - cx;
    const dy = positions[i * 3 + 1] - cy;
    const dz = positions[i * 3 + 2] - cz;
    const sq = dx * dx + dy * dy + dz * dz;
    if (sq > maxSq) maxSq = sq;
  }
  const scale = maxSq > 0 ? target / Math.sqrt(maxSq) : 1;
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (positions[i * 3] - cx) * scale;
    positions[i * 3 + 1] = (positions[i * 3 + 1] - cy) * scale;
    positions[i * 3 + 2] = (positions[i * 3 + 2] - cz) * scale;
  }
}

/**
 * Measure how much room a cloud actually needs, split by axis.
 *
 * The cloud spins about Y and nothing else, so its silhouette sweeps a cylinder
 * rather than a sphere: the widest it can ever appear is the largest distance
 * from the Y axis, and its height never changes at all. Measuring those two
 * separately is what lets a tall subject fill a tall frame. Fitting a sphere
 * instead would reserve the width for a depth that is never turned toward the
 * camera, and leave a standing shape floating in empty space.
 */
function measureExtent(positions: Float32Array): { xz: number; y: number } {
  let xz = 0;
  let y = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    const radial = x * x + z * z;
    if (radial > xz) xz = radial;
    const height = Math.abs(positions[i + 1]);
    if (height > y) y = height;
  }
  return { xz: Math.sqrt(xz), y };
}

/**
 * Rank every point 0..1 along the wipe axis, which the shader turns into a
 * per-point delay. Ranking against the cloud's own extent rather than a fixed
 * range means the wipe takes the same time across a tall shape and a wide one.
 */
function computeRank(
  positions: Float32Array,
  wipe: DustMorphWipe,
  fallback: Float32Array,
): Float32Array {
  const count = positions.length / 3;
  if (wipe === "none") return fallback;
  const axis = wipe[0] === "x" ? 0 : wipe[0] === "y" ? 1 : 2;
  const reversed = wipe[1] === "-";
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const v = positions[i * 3 + axis];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = Math.max(max - min, 1e-5);
  const rank = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = (positions[i * 3 + axis] - min) / span;
    rank[i] = reversed ? 1 - t : t;
  }
  return rank;
}

/**
 * Fetch a model and dispatch on what it actually is. Sniffing the magic bytes
 * rather than the extension means a cloud served without one, or a `.bin` that
 * turns out to be a glTF, still lands in the right decoder.
 */
async function loadCloud(
  url: string,
  count: number,
  random: () => number,
): Promise<{ positions: Float32Array; normals: Float32Array }> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength < 4) throw new Error(`${url}: empty`);

  const magic = String.fromCharCode(...new Uint8Array(buffer.slice(0, 4)));

  if (magic === "PCLD" || magic === "PCL2" || magic === "PCL4") {
    return resample(decodePointCloud(buffer, url), count);
  }

  // glTF binary. The loader is imported here rather than at module scope so a
  // component using only clouds or parametric shapes never pays for it.
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Object3D }>(
    (resolve, reject) => {
      loader.parse(buffer, "", resolve, reject);
    },
  );
  gltf.scene.updateMatrixWorld(true);

  // Each part is baked through its own world matrix first, or a model whose
  // parts are placed by node transforms collapses onto the origin.
  const parts: THREE.BufferGeometry[] = [];
  gltf.scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const clone = mesh.geometry.clone();
    clone.applyMatrix4(mesh.matrixWorld);
    parts.push(clone);
  });
  if (parts.length === 0) throw new Error(`${url}: no mesh geometry`);

  const merged = mergeParts(parts);
  const sampled = sampleGeometry(merged, count, random);
  merged.dispose();
  return sampled;
}

/* -------------------------------------------------------------------------- */
/* Shaders                                                                     */
/* -------------------------------------------------------------------------- */

const VERTEX_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uStagger;
  uniform float uBurst;
  uniform float uSettleOffset;
  uniform float uSpike;
  uniform float uSize;
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uPointerStrength;
  uniform float uPointerRadius;

  uniform vec3  uLightDirection;
  uniform float uAmbient;
  uniform float uDiffuse;
  uniform float uWrap;
  uniform float uRim;
  uniform float uRimPower;

  attribute vec3  aFrom;
  attribute vec3  aTo;
  attribute vec3  aFromNormal;
  attribute vec3  aToNormal;
  attribute float aRank;
  attribute float aSeed;

  varying float vAlpha;
  varying float vLight;

  float easeOutCubic(float t) {
    float inv = 1.0 - t;
    return 1.0 - inv * inv * inv;
  }

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
  }

  float phase(float t, float start, float duration) {
    return clamp((t - start) / max(duration, 0.00001), 0.0, 1.0);
  }

  // Stable per point, derived from where it started, so a shape's raggedness is
  // a property of the shape rather than something that reshuffles every morph.
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    // Rank decides when this point moves; the seed only jitters that slightly,
    // so the wipe stays readable as a direction rather than dissolving into
    // noise the moment the stagger goes up.
    float stagger = clamp(uStagger, 0.0, 0.95);
    float jitter = (aSeed - 0.5) * (0.08 * stagger);
    float delay = clamp(aRank * stagger + jitter, 0.0, 0.98);
    float window = max(1.0 - stagger, 0.00001);
    float localT = clamp((uProgress - delay) / window, 0.0, 1.0);

    float burstT  = phase(localT, ${BURST_START.toFixed(3)} + aRank * stagger * ${BURST_STAGGER.toFixed(3)}, ${BURST_DURATION.toFixed(3)});
    float crossT  = phase(localT, ${CROSS_START.toFixed(3)}, ${CROSS_DURATION.toFixed(3)});
    float settleT = phase(localT, ${SETTLE_START.toFixed(3)}, ${SETTLE_DURATION.toFixed(3)});

    float spike = mix(1.0 - uSpike, 1.0 + uSpike, hash13(aFrom * 18.0));

    // Out along the surface it is leaving, in along the surface it is joining.
    // Both offsets are normal-aligned, so the cloud reads as the form inflating
    // and deflating rather than as points crossing the middle of the frame.
    vec3 burstPos  = aFrom + aFromNormal * (uBurst * spike);
    vec3 targetPos = aTo   + aToNormal   * (uSettleOffset * spike);

    vec3 pos = aFrom;
    pos = mix(pos, burstPos,  easeOutCubic(burstT));
    pos = mix(pos, targetPos, easeInOutCubic(crossT));
    pos = mix(pos, aTo,       easeOutCubic(settleT));

    vec3 nrm = normalize(mix(aFromNormal, aToNormal, easeInOutCubic(localT)));

    // A little idle life so a settled shape is never completely static. Along
    // the normal, so it breathes rather than drifts.
    pos += nrm * 0.006 * sin(uTime * 0.6 + aSeed * 42.0);

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

    // Lighting is evaluated per point and passed down as a single scalar. The
    // light sits in view space, so it does not turn with the cloud: the shading
    // sweeps across the form as it rotates, which is what tells you the thing
    // has volume.
    vec3 viewNormal = normalize(normalMatrix * nrm);
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(-viewPos.xyz);

    float ndl = dot(viewNormal, lightDir);
    // Wrapped rather than clamped: a hard terminator across loose points reads
    // as a seam, because there is no surface to carry the shadow.
    float wrapped = max((ndl + uWrap) / (1.0 + uWrap), 0.0);
    float rimBase = 1.0 - max(dot(viewNormal, viewDir), 0.0);
    float rim = pow(clamp(rimBase, 0.0, 1.0), max(uRimPower, 0.0001)) * uRim;
    vLight = clamp(uAmbient + wrapped * uDiffuse + rim, 0.0, 1.0);

    // One flat size in device pixels, deliberately not scaled by depth or by a
    // per point factor.
    //
    // Perspective scaling seems obviously right and is a trap here: the near
    // face of the cloud swells into heavy overdraw while the far face shrinks
    // under one pixel, and a point under a pixel is not drawn faintly, it is not
    // rasterized at all. The cloud then loses its back half entirely and reads
    // as a solid crust. A constant size keeps the grain even, and depth is
    // carried by the lighting instead.
    gl_PointSize = uSize;

    vAlpha = 0.92;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vLight;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    // Round the sprite and soften its rim so dense areas sinter together
    // instead of showing a grid of squares.
    float d = dot(offset, offset);
    if (d > 0.25) discard;
    float falloff = smoothstep(0.25, 0.0, d);

    // A touch of shading across the sprite itself, so a point still has a lit
    // side when it is large enough to see one.
    float radial = clamp(1.0 - d * 4.0, 0.0, 1.0);
    float shade = mix(0.9, 1.0, sqrt(radial));

    gl_FragColor = vec4(uColor * (vLight * shade), falloff * vAlpha);
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
  count = 700000,
  dwell = 4.2,
  morphDuration = 1.9,
  disperse = 0.47,
  settleOffset = 0.21,
  spike = 0.18,
  stagger = 0.25,
  wipe = "y-",
  fit = 0.82,
  pointSize = 3,
  pixelRatio = 1.25,
  color = DEFAULT_COLOR,
  background = DEFAULT_BACKGROUND,
  lighting,
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

  const light = { ...DEFAULT_LIGHTING, ...lighting };

  // Mirrored so the render loop can read current values without restarting.
  const live = useRef({
    dwell,
    morphDuration,
    disperse,
    settleOffset,
    spike,
    stagger,
    pointSize,
    pointerStrength,
    pointerRadius,
    color,
    light,
    fit,
  });
  live.current = {
    dwell,
    morphDuration,
    disperse,
    settleOffset,
    spike,
    stagger,
    pointSize,
    pointerStrength,
    pointerRadius,
    color,
    light,
    fit,
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Sampling can involve a network fetch, so setup is async. Everything
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

      const random = makeRandom(0x9e3779b9);
      const extent = { xz: 0, y: 0 };

      // Seeds double as the fallback wipe order, so "none" still staggers.
      const seedRandom = makeRandom(0x517cc1b7);
      const seeds = new Float32Array(points);
      for (let i = 0; i < points; i += 1) seeds[i] = seedRandom();

      // Sample every shape up front. All clouds share a point count, so index i
      // on one shape is the same point as index i on the next.
      const clouds: Cloud[] = [];
      for (let i = 0; i < shapeCount; i += 1) {
        const url = shapes[i]?.model;
        let sampled: { positions: Float32Array; normals: Float32Array };
        if (url) {
          try {
            sampled = await loadCloud(url, points, random);
          } catch {
            // A missing or broken model degrades to its parametric slot rather
            // than leaving a hole in the cycle.
            const geometry = parametricGeometry(i);
            sampled = sampleGeometry(geometry, points, random);
            geometry.dispose();
          }
        } else {
          const geometry = parametricGeometry(i);
          sampled = sampleGeometry(geometry, points, random);
          geometry.dispose();
        }
        if (cancelled) return;
        normalise(sampled.positions, CLOUD_RADIUS);
        // Framing is measured across the whole set, never per shape: a camera
        // that refitted on each one would zoom on every morph.
        const shapeExtent = measureExtent(sampled.positions);
        extent.xz = Math.max(extent.xz, shapeExtent.xz);
        extent.y = Math.max(extent.y, shapeExtent.y);
        clouds.push({
          positions: sampled.positions,
          normals: sampled.normals,
          rank: computeRank(sampled.positions, wipe, seeds),
        });
      }
      if (cancelled) return;

      buildScene(clouds, seeds, shapeCount, reduceMotion, extent);
    };

    const buildScene = (
      clouds: Cloud[],
      seeds: Float32Array,
      shapeCount: number,
      reduceMotion: boolean,
      extent: { xz: number; y: number },
    ) => {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, Math.max(0.5, pixelRatio)),
      );
      renderer.setClearColor(new THREE.Color(background), 1);
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(clouds[0].positions.slice(), 3),
      );
      geometry.setAttribute(
        "aFrom",
        new THREE.BufferAttribute(clouds[0].positions.slice(), 3),
      );
      geometry.setAttribute(
        "aTo",
        new THREE.BufferAttribute(clouds[0].positions.slice(), 3),
      );
      geometry.setAttribute(
        "aFromNormal",
        new THREE.BufferAttribute(clouds[0].normals.slice(), 3),
      );
      geometry.setAttribute(
        "aToNormal",
        new THREE.BufferAttribute(clouds[0].normals.slice(), 3),
      );
      geometry.setAttribute(
        "aRank",
        new THREE.BufferAttribute(clouds[0].rank.slice(), 1),
      );
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

      const uniforms = {
        uProgress: { value: 0 },
        uStagger: { value: stagger },
        uBurst: { value: disperse },
        uSettleOffset: { value: settleOffset },
        uSpike: { value: spike },
        uSize: { value: pointSize },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(10, 10) },
        uPointerStrength: { value: 0 },
        uPointerRadius: { value: pointerRadius },
        uColor: { value: new THREE.Color(color) },
        uLightDirection: {
          value: new THREE.Vector3(...light.direction).normalize(),
        },
        uAmbient: { value: light.ambient },
        uDiffuse: { value: light.diffuse },
        uWrap: { value: light.wrap },
        uRim: { value: light.rim },
        uRimPower: { value: light.rimPower },
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
      const fromNormalAttr = geometry.getAttribute(
        "aFromNormal",
      ) as THREE.BufferAttribute;
      const toNormalAttr = geometry.getAttribute(
        "aToNormal",
      ) as THREE.BufferAttribute;
      const rankAttr = geometry.getAttribute("aRank") as THREE.BufferAttribute;

      const beginMorph = (next: number) => {
        if (morphing || shapeCount < 2) return;
        const target = ((next % shapeCount) + shapeCount) % shapeCount;
        if (target === current) return;
        fromAttr.array.set(clouds[current].positions);
        toAttr.array.set(clouds[target].positions);
        fromNormalAttr.array.set(clouds[current].normals);
        toNormalAttr.array.set(clouds[target].normals);
        // Rank comes from the shape being left, so the wipe is measured against
        // the form you can currently see.
        rankAttr.array.set(clouds[current].rank);
        fromAttr.needsUpdate = true;
        toAttr.needsUpdate = true;
        fromNormalAttr.needsUpdate = true;
        toNormalAttr.needsUpdate = true;
        rankAttr.needsUpdate = true;
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

      /**
       * Place the camera so the subject fills `fit` of the frame.
       *
       * Solving it rather than tuning a distance is what makes the subject the
       * same size everywhere: at distance d the visible half-height is
       * d·tan(fov/2), so the distance that makes a cloud of radius r occupy a
       * fraction f of the height is r/(f·tan(fov/2)). The width imposes the same
       * constraint scaled by the aspect, and taking whichever distance is larger
       * satisfies both, so a portrait viewport pulls back instead of cropping.
       *
       * Because the cloud turns, it is fitted as a sphere: any axis can end up
       * facing the camera, and a fit that only held for the current rotation
       * would clip a moment later.
       */
      const applyFraming = () => {
        const f = Math.min(0.99, Math.max(0.05, live.current.fit));
        const halfTan = Math.tan((FOV * Math.PI) / 360);
        // A hair of slack for the idle breathing along the normals. The tilt
        // and lean this used to allow for are gone, so the subject can sit
        // closer to the edges than it did.
        const halfHeight = Math.max(extent.y, 1e-3) * 1.02;
        const halfWidth = Math.max(extent.xz, 1e-3) * 1.02;
        const byHeight = halfHeight / (f * halfTan);
        const byWidth =
          halfWidth / (f * halfTan * Math.max(camera.aspect, 0.01));
        camera.position.z = Math.max(byHeight, byWidth);
      };

      const resize = () => {
        const rect = mount.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        applyFraming();
      };

      const render = () => {
        const time = clock.getElapsedTime();
        const s = live.current;

        uniforms.uTime.value = time;
        uniforms.uBurst.value = s.disperse;
        uniforms.uSettleOffset.value = s.settleOffset;
        uniforms.uSpike.value = s.spike;
        uniforms.uStagger.value = s.stagger;
        uniforms.uSize.value = s.pointSize;
        uniforms.uPointerRadius.value = s.pointerRadius;
        uniforms.uAmbient.value = s.light.ambient;
        uniforms.uDiffuse.value = s.light.diffuse;
        uniforms.uWrap.value = s.light.wrap;
        uniforms.uRim.value = s.light.rim;
        uniforms.uRimPower.value = s.light.rimPower;

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
            fromAttr.array.set(clouds[current].positions);
            fromNormalAttr.array.set(clouds[current].normals);
            fromAttr.needsUpdate = true;
            fromNormalAttr.needsUpdate = true;
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

        // One constant turn about Y, and nothing else.
        //
        // Leaning or nodding the whole cloud toward the cursor reads as
        // dragging the object around the frame: the subject stops being a thing
        // that stands there and turns into something being handled. The
        // pointer's business is displacing the points it passes, which happens
        // per point in the shader, and it should not also steer the form.
        cloud.rotation.y = time * SPIN;

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
    // Rebuild when the point budget, the shape set, the wipe order, or the paper
    // changes. Everything else is read live by the render loop.
  }, [count, shapes.length, shapeKey, background, wipe, pixelRatio]);

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

      {/* One blended layer over the canvas rather than three.
          The subject sits directly behind this text and is dark ink on light
          paper, so a fixed colour is unreadable against one of them whichever
          you pick. Difference against white resolves it per pixel: type reads
          near-black over the paper and inverts to near-white where the cloud
          passes behind it. Blending the group keeps the three elements
          consistent with one another instead of each solving it differently. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          justifyItems: "center",
          alignItems: "center",
          pointerEvents: "none",
          textAlign: "center",
          padding: "clamp(1.5rem, 4vh, 2.75rem) 1.5rem",
          color: "#ffffff",
          mixBlendMode: "difference",
        }}
      >
        {/* Eyebrow and control are pinned to the edges, clear of the middle.
            Blending keeps them legible, but small type over the dense centre of
            the cloud is uncomfortable to read however well it contrasts, so
            they are kept off it. The label is large enough to sit on top. */}
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            opacity: 0.62,
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
            alignSelf: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: "clamp(1.6rem, 4.2vw, 3.4rem)",
            fontWeight: 400,
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
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
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              border: "1px solid rgba(255, 255, 255, 0.32)",
              borderRadius: "999px",
              background: "transparent",
              color: "inherit",
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
        {shapes.length <= 1 && <span />}
      </div>
    </section>
  );
}
