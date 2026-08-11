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
  /**
   * Degrees to turn this shape about Y before it is used, so a set of models
   * that were not authored facing the same way can be pointed at the camera
   * consistently.
   */
  yaw?: number;
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

/**
 * Cursor simulation constants.
 *
 * The pointer does not displace points directly. It drives a two pass
 * simulation whose state persists between frames, which is the whole reason the
 * cloud can be dragged: a point pushed aside stays aside, carries momentum, and
 * is pulled home by a spring rather than snapping back the instant the cursor
 * leaves. Strengths are accelerations in brush space, radii are ratios of the
 * cursor radius, and the decay terms are what hold the trail open behind a
 * moving cursor.
 */
const CURSOR = {
  /** Reach of the brush, as a fraction of half the viewport height. */
  radius: 0.46,
  /** Divides the falloff powers. Higher is a softer edge. */
  softness: 1.12,
  /** Multiplies every force, so one number scales the whole response. */
  strength: 1.3,
  /** How much further points fall off with view depth. */
  depthFalloff: 0.45,
  coreRadiusRatio: 0.36,
  coreStrength: 10.5,
  tailStrength: 1.4,
  coreFalloff: 4.2,
  tailFalloff: 3,
  /** Pull back toward rest, and the drag that stops it oscillating. */
  springStrength: 13,
  damping: 4.6,
  maxVelocity: 8.5,
  maxOffset: 0.86,
  /** Swirl around the cursor, scaled by how fast the cursor is moving. */
  curlStrength: 2.3,
  curlRadiusRatio: 0.78,
  curlFalloff: 2.4,
  /** How much points flee along their own normal rather than radially. */
  normalDirectionInfluence: 0.78,
  repelRandomness: 0.08,
  /** Filament structure: dust clumps into strands rather than a smooth push. */
  clumpScale: 3.2,
  clumpContrast: 0.74,
  clumpBoost: 2.4,
  tipBias: 0.62,
  /** How long displacement is remembered. This is the drag. */
  clusterMemory: 0.38,
  /** How strongly neighbouring points chain into the same strand. */
  chainCoherence: 0.72,
} as const;

/** Resolution of the screen space brush field. */
const FIELD_SIZE = 192;

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
 * Centre a cloud on its own bounding box and report the radius it needs.
 *
 * Deliberately does not scale. Models in a set are authored at different sizes
 * on purpose, and forcing each to a common radius throws that away: a subject
 * that should tower over the others arrives the same size as them, and the set
 * stops being a group of objects and becomes a sequence of equally sized
 * silhouettes. One scale is chosen later for the whole set, so relative size
 * survives while the group as a whole still fits the frame.
 */
function centreCloud(positions: Float32Array): number {
  const count = positions.length / 3;
  if (count === 0) return 0;

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
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] -= cx;
    positions[i * 3 + 1] -= cy;
    positions[i * 3 + 2] -= cz;
  }
  return Math.sqrt(maxSq);
}

/** Scale in place. Normals are untouched: a uniform scale does not turn them. */
function scaleCloud(positions: Float32Array, scale: number) {
  for (let i = 0; i < positions.length; i += 1) positions[i] *= scale;
}

/**
 * Turn a cloud about Y. Models in a set rarely face the same way, and the
 * normals have to turn with the positions or the lighting comes off the shape
 * it had before.
 */
function yawCloud(
  positions: Float32Array,
  normals: Float32Array,
  degrees: number,
) {
  if (!degrees) return;
  const angle = (degrees * Math.PI) / 180;
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  for (const array of [positions, normals]) {
    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const z = array[i + 2];
      array[i] = x * c + z * sn;
      array[i + 2] = -x * sn + z * c;
    }
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

  uniform vec3  uLightDirection;
  uniform float uAmbient;
  uniform float uDiffuse;
  uniform float uWrap;
  uniform float uRim;
  uniform float uRimPower;

  uniform sampler2D uInteractionState;
  uniform float uViewportAspect;

  attribute vec3  aFrom;
  attribute vec3  aTo;
  attribute vec3  aFromNormal;
  attribute vec3  aToNormal;
  attribute float aRank;
  attribute float aSeed;
  attribute vec2  aInteractionUv;

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

    // The cursor offset is simulated elsewhere and only read here. Each point
    // owns one texel of the state texture, so this is a single fetch of a
    // displacement that has been accumulating across frames. Applying it in
    // clip space, scaled by w, keeps the push the same apparent size whatever
    // depth the point sits at.
    vec4 state = texture2D(uInteractionState, aInteractionUv);
    float safeW = max(clip.w, 0.00001);
    vec2 offsetNdc = vec2(state.x / max(uViewportAspect, 0.0001), state.y);
    clip.xy += offsetNdc * safeW;

    gl_Position = clip;

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

/**
 * Shared noise, used by both simulation passes so the filaments the field lays
 * down and the strands the particles chain into agree with one another.
 */
const SIM_NOISE = /* glsl */ `
  float inverseSquareMask(float distance, float radius, float falloffPower) {
    float safeRadius = max(radius, 0.0001);
    float normalized = distance / safeRadius;
    float invSq = 1.0 / (1.0 + normalized * normalized);
    float shaped = pow(invSq, max(falloffPower, 0.0001));
    float outerCutoff = 1.0 - smoothstep(1.0, 1.35, normalized);
    return shaped * outerCutoff;
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
`;

/** Full screen triangle for both simulation passes. */
const PASS_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Pass one: the brush field, in screen space.
 *
 * This is what a cursor leaves behind. Flow is advected along itself and
 * diffused into its neighbours, so a stroke keeps moving and spreading after
 * the cursor has gone, and both flow and strength decay exponentially at a rate
 * set by clusterMemory. Injection is aimed between the cursor's direction of
 * travel and the tangent, which is what curls the trail rather than shoving
 * straight out, and it is masked by a ridged noise so the disturbance arrives
 * as strands instead of a smooth blob.
 */
const FIELD_SHADER = /* glsl */ `
  uniform sampler2D uFieldTex;
  uniform vec2  uTexelSize;
  uniform float uDelta;
  uniform vec2  uCursorNdc;
  uniform vec2  uCursorVelocity;
  uniform float uCursorInfluence;
  uniform float uViewportAspect;
  uniform float uViewportHeightPx;
  uniform float uCoreRadius;
  uniform float uTailRadius;
  uniform float uClumpScale;
  uniform float uClumpContrast;
  uniform float uTipBias;
  uniform float uClusterMemory;
  uniform float uChainCoherence;
  uniform float uTime;
  varying vec2 vUv;

  ${SIM_NOISE}

  float fbm3(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i += 1) {
      value += amplitude * valueNoise(p);
      p = p * 2.03 + vec2(14.7, -9.5);
      amplitude *= 0.5;
    }
    return value / 0.875;
  }

  void main() {
    vec2 uv = vUv;
    vec4 previous = texture2D(uFieldTex, uv);
    vec2 previousFlow = previous.xy;

    float dt = clamp(uDelta, 0.0001, 0.05);
    float advectionStrength = 0.06 + 0.16 * clamp(uChainCoherence, 0.0, 1.5);
    vec2 advectedUv = clamp(uv - previousFlow * advectionStrength * dt, vec2(0.0), vec2(1.0));
    vec4 advected = texture2D(uFieldTex, advectedUv);

    vec4 north = texture2D(uFieldTex, clamp(uv + vec2(0.0, uTexelSize.y), vec2(0.0), vec2(1.0)));
    vec4 south = texture2D(uFieldTex, clamp(uv - vec2(0.0, uTexelSize.y), vec2(0.0), vec2(1.0)));
    vec4 east  = texture2D(uFieldTex, clamp(uv + vec2(uTexelSize.x, 0.0), vec2(0.0), vec2(1.0)));
    vec4 west  = texture2D(uFieldTex, clamp(uv - vec2(uTexelSize.x, 0.0), vec2(0.0), vec2(1.0)));
    vec4 neighbors = (north + south + east + west) * 0.25;

    float diffusion = mix(0.03, 0.09, 1.0 - clamp(uChainCoherence, 0.0, 1.0));
    vec2 flow = mix(advected.xy, neighbors.xy, diffusion);
    float fieldStrength = mix(advected.z, neighbors.z, diffusion * 0.9);

    vec2 cursorUv = uCursorNdc * 0.5 + 0.5;
    vec2 uvDelta = uv - cursorUv;
    vec2 deltaBrush = vec2(uvDelta.x * uViewportAspect, uvDelta.y);
    float distancePx = length(deltaBrush) * max(uViewportHeightPx, 1.0) * 0.5;
    float coreMask = inverseSquareMask(distancePx, uCoreRadius, 2.6);
    float tailMask = inverseSquareMask(distancePx, uTailRadius, 2.0);
    float localInject = clamp((coreMask + tailMask * 0.35) * uCursorInfluence, 0.0, 1.0);
    localInject = pow(localInject, 1.6);

    vec2 cursorVelocityBrush = vec2(uCursorVelocity.x * uViewportAspect, uCursorVelocity.y);
    float cursorSpeed = length(cursorVelocityBrush);
    vec2 cursorDirBrush = cursorSpeed > 0.0001 ? cursorVelocityBrush / cursorSpeed : vec2(0.0);
    vec2 radialDir = length(deltaBrush) > 0.0001 ? normalize(deltaBrush) : vec2(0.0, 1.0);
    vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
    float swirlSign = sign(cursorVelocityBrush.x * radialDir.y - cursorVelocityBrush.y * radialDir.x);
    if (abs(swirlSign) < 0.001) swirlSign = 1.0;

    vec2 injectDirBrush = normalize(mix(cursorDirBrush, tangentDir * swirlSign, 0.25));
    if (length(injectDirBrush) <= 0.0001) injectDirBrush = tangentDir;
    vec2 injectDirNdc = vec2(injectDirBrush.x / max(uViewportAspect, 0.0001), injectDirBrush.y);

    float clumpScale = max(uClumpScale, 0.05);
    float clumpContrast = clamp(uClumpContrast, 0.0, 1.0);
    float tipBias = clamp(uTipBias, 0.0, 1.0);
    float noiseDomainScale = 7.0 + clumpScale * 7.0;
    vec2 noiseDomain = uv * noiseDomainScale + vec2(uTime * 0.23, -uTime * 0.17);
    float ridgeNoise = fbm3(noiseDomain);
    float ridgePhase = (uv.x + uv.y) * (26.0 + clumpScale * 7.5) + ridgeNoise * 6.2831;
    float ridge = pow(clamp(0.5 + 0.5 * sin(ridgePhase), 0.0, 1.0), mix(1.8, 6.8, clumpContrast));
    float tipThreshold = mix(0.48, 0.9, 0.55 * tipBias + 0.45 * clumpContrast);
    float tipMask = smoothstep(tipThreshold, 1.0, ridge);
    float injectMask = mix(0.75, 1.0, ridge) * mix(0.78, 1.0, tipMask);
    float injectAmount = localInject * injectMask;

    float memory = clamp(uClusterMemory, 0.0, 1.2);
    float flowDecay = exp(-mix(4.6, 1.7, memory) * dt);
    float strengthDecay = exp(-mix(6.0, 2.2, memory) * dt);
    flow = flow * flowDecay + injectDirNdc * injectAmount * (0.08 + 0.14 * clamp(uChainCoherence, 0.0, 1.5));
    fieldStrength = fieldStrength * strengthDecay + injectAmount * (0.46 + 0.32 * clumpContrast);

    float maxFlow = 0.015;
    float flowMagnitude = length(flow);
    if (flowMagnitude > maxFlow) flow *= maxFlow / max(flowMagnitude, 0.0001);

    gl_FragColor = vec4(flow, clamp(fieldStrength, 0.0, 1.0), 1.0);
  }
`;

/**
 * Pass two: one spring-damper per point, integrated in its own texel.
 *
 * The state carried between frames is an offset and a velocity, which is what
 * makes this a drag rather than a push: forces accumulate into velocity,
 * velocity into offset, and a spring pulls the offset back to zero while
 * damping keeps it from ringing. Release the cursor and the cloud recovers over
 * time instead of snapping.
 *
 * The point's own screen position has to be known to know how far it is from
 * the cursor, so the morph is evaluated here exactly as the render pass
 * evaluates it. Repulsion is aimed between straight-away-from-cursor and the
 * point's own normal projected to screen, then bent along a curl-noise flow so
 * displaced dust gathers into strands rather than spraying evenly.
 */
const STATE_SHADER = /* glsl */ `
  uniform sampler2D uStateTex;
  uniform sampler2D uFieldTex;
  uniform sampler2D uSourcePositionTex;
  uniform sampler2D uTargetPositionTex;
  uniform sampler2D uSourceNormalTex;
  uniform sampler2D uTargetNormalTex;
  uniform sampler2D uTimingTex;
  uniform float uPointCount;
  uniform float uTextureSize;
  uniform float uDelta;
  uniform float uProgress;
  uniform float uStagger;
  uniform float uBurst;
  uniform float uSettleOffset;
  uniform float uSpike;
  uniform mat4  uModelViewMatrix;
  uniform mat4  uProjectionMatrix;
  uniform mat3  uNormalMatrix;
  uniform vec2  uCursorNdc;
  uniform vec2  uCursorVelocity;
  uniform float uCursorInfluence;
  uniform float uViewportAspect;
  uniform float uViewportHeightPx;
  uniform float uCoreRadius;
  uniform float uTailRadius;
  uniform float uCoreStrength;
  uniform float uTailStrength;
  uniform float uCoreFalloff;
  uniform float uTailFalloff;
  uniform float uDepthFalloff;
  uniform float uSpringStrength;
  uniform float uDamping;
  uniform float uMaxVelocity;
  uniform float uMaxOffset;
  uniform float uCurlStrength;
  uniform float uCurlRadius;
  uniform float uCurlFalloff;
  uniform float uNormalDirectionInfluence;
  uniform float uRepelRandomness;
  uniform float uClumpScale;
  uniform float uClumpContrast;
  uniform float uClumpBoost;
  uniform float uTipBias;
  uniform float uClusterMemory;
  uniform float uChainCoherence;
  varying vec2 vUv;

  ${SIM_NOISE}

  float fbm3(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i += 1) {
      value += amplitude * valueNoise(p);
      p = p * 2.02 + vec2(17.13, -9.41);
      amplitude *= 0.5;
    }
    return value / 0.875;
  }

  float easeOutCubic(float t) { float inv = 1.0 - t; return 1.0 - inv * inv * inv; }
  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
  }
  float phase(float t, float start, float duration) {
    return clamp((t - start) / max(duration, 0.00001), 0.0, 1.0);
  }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy - vec2(0.5));
    float index = cell.y * uTextureSize + cell.x;
    if (index >= uPointCount) { gl_FragColor = vec4(0.0); return; }

    vec4 state = texture2D(uStateTex, vUv);
    vec2 offsetBrush = state.xy;
    vec2 velocityBrush = state.zw;

    vec3 source = texture2D(uSourcePositionTex, vUv).xyz;
    vec3 target = texture2D(uTargetPositionTex, vUv).xyz;
    vec3 sourceNormal = normalize(texture2D(uSourceNormalTex, vUv).xyz);
    vec3 targetNormal = normalize(texture2D(uTargetNormalTex, vUv).xyz);
    vec4 timing = texture2D(uTimingTex, vUv);
    float aSeed = timing.x;
    float aRank = timing.y;

    // Identical to the render pass, so the simulation pushes the point that is
    // actually on screen rather than one a frame behind it.
    float stagger = clamp(uStagger, 0.0, 0.95);
    float jitter = (aSeed - 0.5) * (0.08 * stagger);
    float delay = clamp(aRank * stagger + jitter, 0.0, 0.98);
    float window = max(1.0 - stagger, 0.00001);
    float localT = clamp((uProgress - delay) / window, 0.0, 1.0);

    float burstT  = phase(localT, ${BURST_START.toFixed(3)} + aRank * stagger * ${BURST_STAGGER.toFixed(3)}, ${BURST_DURATION.toFixed(3)});
    float crossT  = phase(localT, ${CROSS_START.toFixed(3)}, ${CROSS_DURATION.toFixed(3)});
    float settleT = phase(localT, ${SETTLE_START.toFixed(3)}, ${SETTLE_DURATION.toFixed(3)});

    float spike = mix(1.0 - uSpike, 1.0 + uSpike, hash13(source * 18.0));
    vec3 burstPos  = source + sourceNormal * (uBurst * spike);
    vec3 targetPos = target + targetNormal * (uSettleOffset * spike);

    vec3 basePosition = source;
    basePosition = mix(basePosition, burstPos,  easeOutCubic(burstT));
    basePosition = mix(basePosition, targetPos, easeInOutCubic(crossT));
    basePosition = mix(basePosition, target,    easeOutCubic(settleT));
    vec3 baseNormal = normalize(mix(sourceNormal, targetNormal, easeInOutCubic(localT)));

    vec4 mvPosition = uModelViewMatrix * vec4(basePosition, 1.0);
    vec4 clipPosition = uProjectionMatrix * mvPosition;
    float safeW = max(clipPosition.w, 0.00001);
    float safeAspect = max(uViewportAspect, 0.0001);
    vec2 offsetNdc = vec2(offsetBrush.x / safeAspect, offsetBrush.y);
    vec2 particleNdc = clipPosition.xy / safeW + offsetNdc;

    vec2 fieldUv = clamp(particleNdc * 0.5 + 0.5, vec2(0.0), vec2(1.0));
    vec4 fieldSample = texture2D(uFieldTex, fieldUv);
    vec2 fieldFlowRaw = vec2(fieldSample.x * safeAspect, fieldSample.y);
    vec2 fieldFlowBrush = length(fieldFlowRaw) > 0.0001 ? normalize(fieldFlowRaw) : vec2(0.0);
    float fieldStrength = clamp(fieldSample.z, 0.0, 1.2);

    vec2 ndcDelta = particleNdc - uCursorNdc;
    vec2 brushDelta = vec2(ndcDelta.x * uViewportAspect, ndcDelta.y);
    float brushDistance = length(brushDelta);
    float distancePx = brushDistance * max(uViewportHeightPx, 1.0) * 0.5;
    vec2 radialDir = brushDistance > 0.0001 ? normalize(brushDelta) : vec2(0.0);

    vec3 viewNormal = normalize(uNormalMatrix * baseNormal);
    vec2 normalScreenRaw = vec2(viewNormal.x, viewNormal.y);
    float normalScreenLength = length(normalScreenRaw);
    vec2 normalScreenDir = normalScreenLength > 0.0001 ? normalScreenRaw / normalScreenLength : radialDir;
    float viewDepth = max(-mvPosition.z, 0.0001);
    float depthMask = 1.0 / (1.0 + uDepthFalloff * viewDepth);

    float coreMask = inverseSquareMask(distancePx, uCoreRadius, uCoreFalloff);
    float tailMask = inverseSquareMask(distancePx, uTailRadius, uTailFalloff);
    float localFieldWeight = clamp((coreMask + tailMask) * 0.9, 0.0, 1.0);
    float cursorFocus = pow(localFieldWeight, 1.45);
    float fieldInfluence = fieldStrength * cursorFocus;

    // A surface frame, so the filaments run along the form rather than across
    // the screen: two curl-noise fields crossed give the strand direction.
    vec3 normalObject = normalize(baseNormal);
    vec3 referenceAxis = abs(normalObject.y) < 0.92 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangentObject = normalize(cross(referenceAxis, normalObject));
    vec3 bitangentObject = normalize(cross(normalObject, tangentObject));
    vec2 localSurface = vec2(dot(basePosition, tangentObject), dot(basePosition, bitangentObject));

    float clumpScale = max(uClumpScale, 0.05);
    float clumpContrast = clamp(uClumpContrast, 0.0, 1.0);
    float tipBias = clamp(uTipBias, 0.0, 1.0);
    float clusterMemory = clamp(uClusterMemory, 0.0, 1.2);
    float chainCoherence = clamp(uChainCoherence, 0.0, 1.5);

    float flowDensity = 1.4 + clumpScale * 1.55;
    vec2 flowDomain = localSurface * flowDensity + vec2(aSeed * 5.9, -aSeed * 4.1) + offsetBrush * 2.8;
    float flowEps = 0.03;
    vec2 flowGradA = vec2(
      fbm3(flowDomain + vec2(flowEps, 0.0)) - fbm3(flowDomain - vec2(flowEps, 0.0)),
      fbm3(flowDomain + vec2(0.0, flowEps)) - fbm3(flowDomain - vec2(0.0, flowEps))
    ) / (2.0 * flowEps);
    vec2 flowA = length(flowGradA) > 0.0001 ? normalize(vec2(-flowGradA.y, flowGradA.x)) : vec2(1.0, 0.0);

    vec2 flowDomainB = flowDomain * 1.91 + vec2(13.7, -8.3);
    vec2 flowGradB = vec2(
      fbm3(flowDomainB + vec2(flowEps, 0.0)) - fbm3(flowDomainB - vec2(flowEps, 0.0)),
      fbm3(flowDomainB + vec2(0.0, flowEps)) - fbm3(flowDomainB - vec2(0.0, flowEps))
    ) / (2.0 * flowEps);
    vec2 flowB = length(flowGradB) > 0.0001 ? normalize(vec2(-flowGradB.y, flowGradB.x)) : vec2(-flowA.y, flowA.x);

    vec2 flowSurface = normalize(mix(flowA, flowB, 0.42 + 0.34 * clumpContrast));
    if (length(flowSurface) <= 0.0001) flowSurface = vec2(1.0, 0.0);
    vec2 flowPerpSurface = vec2(-flowSurface.y, flowSurface.x);

    float alongFlow = dot(localSurface, flowSurface);
    float acrossFlow = dot(localSurface, flowPerpSurface);
    float ridgeFreq = 2.7 + clumpScale * 6.4;
    float ridgeA = pow(
      0.5 + 0.5 * sin(alongFlow * ridgeFreq + fbm3(flowDomain * 0.63 + vec2(5.0, 3.0)) * 6.2831),
      mix(2.0, 9.0, clumpContrast)
    );
    float ridgeB = pow(
      0.5 + 0.5 * sin(acrossFlow * (ridgeFreq * 0.62) + aSeed * 6.2831),
      mix(1.4, 5.5, clumpContrast)
    );
    float filamentSeed = clamp(ridgeA * 0.8 + ridgeA * ridgeB * 0.6, 0.0, 1.0);

    float localDrive = localFieldWeight * uCursorInfluence;
    float offsetMemory = smoothstep(0.01, 0.28, length(offsetBrush));
    float magnetization = clamp(localDrive + offsetMemory * mix(0.2, 1.0, clusterMemory), 0.0, 1.25);
    float activation = clamp(magnetization * mix(0.62, 1.18, clumpContrast), 0.0, 1.0);
    float bodyField = smoothstep(0.28, 0.92, filamentSeed) * activation;
    float tipThreshold = mix(0.52, 0.9, 0.6 * tipBias + 0.4 * clumpContrast);
    float tipField = smoothstep(tipThreshold, 1.0, filamentSeed) * pow(activation, mix(0.9, 0.45, clumpContrast));
    bodyField = clamp(max(bodyField, fieldInfluence * (0.28 + 0.24 * clusterMemory)), 0.0, 1.0);
    tipField = clamp(max(tipField, fieldInfluence * bodyField * (0.32 + 0.38 * tipBias)), 0.0, 1.0);
    float clumpField = clamp(max(bodyField, tipField), 0.0, 1.0);

    float normalBlend = clamp(uNormalDirectionInfluence * (0.62 + 0.32 * bodyField), 0.0, 1.0);
    vec2 baseRepulseDir = normalize(mix(radialDir, normalScreenDir, normalBlend));
    if (length(baseRepulseDir) <= 0.0001) baseRepulseDir = radialDir;
    if (length(radialDir) > 0.0001 && dot(baseRepulseDir, radialDir) < 0.0) baseRepulseDir *= -1.0;

    vec2 cursorVelocityBrush = vec2(uCursorVelocity.x * safeAspect, uCursorVelocity.y);
    float cursorSpeed = length(cursorVelocityBrush);

    vec3 flowObject = normalize(tangentObject * flowSurface.x + bitangentObject * flowSurface.y);
    vec3 flowView = normalize(uNormalMatrix * flowObject);
    vec2 flowScreenRaw = vec2(flowView.x, flowView.y);
    vec2 flowScreen = length(flowScreenRaw) > 0.0001
      ? normalize(flowScreenRaw)
      : vec2(-baseRepulseDir.y, baseRepulseDir.x);
    if (length(fieldFlowBrush) > 0.0001) {
      flowScreen = normalize(mix(flowScreen, fieldFlowBrush, clamp(0.18 + 0.32 * fieldInfluence, 0.0, 0.72)));
    }
    if (cursorSpeed > 0.0001) {
      vec2 cursorDir = cursorVelocityBrush / max(cursorSpeed, 0.0001);
      if (dot(flowScreen, cursorDir) < 0.0) flowScreen *= -1.0;
    }

    float flowBlend = clamp(0.1 + 0.34 * bodyField + 0.34 * tipField + 0.28 * fieldInfluence, 0.0, 0.82);
    vec2 flowBiasedDir = normalize(
      baseRepulseDir + flowScreen * (0.16 + 0.92 * tipField) + fieldFlowBrush * (0.08 + 0.42 * fieldInfluence)
    );
    vec2 repulseDir = length(flowBiasedDir) > 0.0001
      ? normalize(mix(baseRepulseDir, flowBiasedDir, flowBlend))
      : baseRepulseDir;
    if (length(radialDir) > 0.0001 && dot(repulseDir, radialDir) < 0.0) repulseDir *= -1.0;

    float randomStrength = clamp(uRepelRandomness, 0.0, 1.5);
    float perParticleBoost = mix(0.12, 1.0, aSeed);
    float domainNoise = hash13(basePosition * 11.0 + vec3(offsetBrush * 2.6, aSeed * 3.1));
    float randomProfile = mix(0.8 + 0.2 * perParticleBoost, perParticleBoost * mix(0.6, 1.0, domainNoise), 0.25);
    float randomGain = 1.0 + randomStrength * cursorFocus * randomProfile;
    float bodySuppression = mix(0.1, 1.0, max(bodyField, fieldInfluence * 0.6));
    float spikeGain = 1.0 + max(uClumpBoost, 0.0) * localFieldWeight *
      (0.42 * bodyField + 2.8 * tipField + 0.55 * fieldInfluence);
    vec2 repulseForce = repulseDir *
      ((uCoreStrength * coreMask + uTailStrength * tailMask) * depthMask * uCursorInfluence *
       randomGain * bodySuppression * spikeGain);

    vec2 flowForce = flowScreen *
      ((uCoreStrength * 0.06 + uTailStrength * 0.18) * cursorFocus * depthMask * uCursorInfluence *
       (0.2 * bodyField + 0.62 * tipField + 0.55 * fieldInfluence) * (0.2 + 0.5 * chainCoherence));
    vec2 fieldForce = fieldFlowBrush *
      ((uCoreStrength * 0.04 + uTailStrength * 0.1) * cursorFocus * depthMask * uCursorInfluence *
       fieldInfluence * (0.24 + 0.36 * chainCoherence));

    vec2 tangentDir = vec2(-repulseDir.y, repulseDir.x);
    float curlMask = inverseSquareMask(distancePx, uCurlRadius, uCurlFalloff);
    float swirlSign = sign(cursorVelocityBrush.x * repulseDir.y - cursorVelocityBrush.y * repulseDir.x);
    float curlSuppression = 1.0 - clamp(
      chainCoherence * (0.2 * bodyField + 0.66 * tipField + 0.25 * fieldInfluence), 0.0, 0.95);
    vec2 curlForce = tangentDir * swirlSign *
      (uCurlStrength * curlMask * cursorSpeed * depthMask * uCursorInfluence *
       (1.0 + 0.32 * randomStrength * localFieldWeight * perParticleBoost) *
       (0.2 + 0.8 * clumpField) * curlSuppression);

    // The spring is what makes this recoverable rather than cumulative.
    vec2 springForce = -offsetBrush * uSpringStrength;
    vec2 acceleration = repulseForce + flowForce + fieldForce + curlForce + springForce;

    // Damp motion across the strand so points travel along it, which is what
    // makes displaced dust chain instead of spraying.
    float filingCoherence = clamp(
      chainCoherence * (0.24 * bodyField + tipField + 0.24 * fieldInfluence), 0.0, 1.1);
    vec2 flowPerpScreen = vec2(-flowScreen.y, flowScreen.x);
    acceleration -= flowPerpScreen * dot(acceleration, flowPerpScreen) *
      clamp(filingCoherence * 0.5, 0.0, 0.85);

    float dt = clamp(uDelta, 0.0001, 0.05);
    velocityBrush += acceleration * dt;
    velocityBrush *= exp(-max(uDamping, 0.0) * dt);
    velocityBrush -= flowPerpScreen * dot(velocityBrush, flowPerpScreen) *
      clamp(filingCoherence * (0.42 + 0.2 * clumpContrast), 0.0, 0.85);

    float velocityMagnitude = length(velocityBrush);
    if (velocityMagnitude > uMaxVelocity) {
      velocityBrush *= uMaxVelocity / max(velocityMagnitude, 0.0001);
    }

    offsetBrush += velocityBrush * dt;
    float offsetMagnitude = length(offsetBrush);
    if (offsetMagnitude > uMaxOffset) {
      offsetBrush *= uMaxOffset / max(offsetMagnitude, 0.0001);
      velocityBrush *= 0.45;
    }

    gl_FragColor = vec4(offsetBrush, velocityBrush);
  }
`;

/**
 * Pack per point data into a square texture, one texel per point.
 *
 * The simulation runs as a fragment shader, so every point needs an address it
 * can be found at. A square grid indexed by point id gives it one, and the same
 * grid coordinate becomes the point's `aInteractionUv` so the render pass can
 * read its own result back.
 */
function packDataTexture(
  source: Float32Array | null,
  count: number,
  size: number,
  stride: number,
): THREE.DataTexture {
  const data = new Float32Array(size * size * 4);
  if (source) {
    for (let i = 0; i < count; i += 1) {
      const from = i * stride;
      const to = i * 4;
      data[to] = source[from];
      data[to + 1] = stride > 1 ? source[from + 1] : 0;
      data[to + 2] = stride > 2 ? source[from + 2] : 0;
      data[to + 3] = 1;
    }
  }
  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Write per point values into an existing data texture and flag it. */
function writeDataTexture(
  texture: THREE.DataTexture,
  source: Float32Array,
  count: number,
  stride: number,
) {
  const data = texture.image.data as Float32Array;
  for (let i = 0; i < count; i += 1) {
    const from = i * stride;
    const to = i * 4;
    data[to] = source[from];
    data[to + 1] = stride > 1 ? source[from + 1] : 0;
    data[to + 2] = stride > 2 ? source[from + 2] : 0;
  }
  texture.needsUpdate = true;
}

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
  count = 240000,
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
  pointerStrength = 1.3,
  pointerRadius = 0.46,
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
      const radii: number[] = [];

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
        yawCloud(sampled.positions, sampled.normals, shapes[i]?.yaw ?? 0);
        radii.push(centreCloud(sampled.positions));
        clouds.push({
          positions: sampled.positions,
          normals: sampled.normals,
          rank: new Float32Array(0),
        });
      }
      if (cancelled) return;

      // One scale for the set, so relative size survives. Rank is computed
      // after scaling so the wipe measures the shape as it will be drawn.
      const setScale = CLOUD_RADIUS / Math.max(...radii, 1e-6);
      const shapeExtents: Array<{ xz: number; y: number }> = [];
      for (const cloud of clouds) {
        scaleCloud(cloud.positions, setScale);
        cloud.rank = computeRank(cloud.positions, wipe, seeds);
        shapeExtents.push(measureExtent(cloud.positions));
      }

      // Frame on the median shape, not the largest.
      //
      // The camera is fixed for the whole set, since one that refitted per
      // shape would zoom on every morph. Fitting it to the largest would then
      // let a single outlier govern everything: one very wide subject pushes
      // the camera back until every other shape is a detail in the middle of an
      // empty frame. The median keeps the typical shape filling the frame and
      // lets a genuinely oversized one overflow, which is the point of keeping
      // relative scale in the first place.
      const median = (values: number[]) => {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      };
      extent.xz = median(shapeExtents.map((e) => e.xz));
      extent.y = median(shapeExtents.map((e) => e.y));

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
        uInteractionState: { value: null as THREE.Texture | null },
        uViewportAspect: { value: 1 },
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
      cloud.frustumCulled = false;
      scene.add(cloud);

      /* ---------------------------------------------------------------- */
      /* Cursor simulation                                                 */
      /* ---------------------------------------------------------------- */

      // One texel per point, so the grid is the smallest square that holds them.
      const stateSize = Math.max(
        2,
        Math.ceil(Math.sqrt(geometry.getAttribute("position").count)),
      );
      const pointCount = geometry.getAttribute("position").count;

      const interactionUv = new Float32Array(pointCount * 2);
      for (let i = 0; i < pointCount; i += 1) {
        interactionUv[i * 2] = ((i % stateSize) + 0.5) / stateSize;
        interactionUv[i * 2 + 1] =
          (Math.floor(i / stateSize) + 0.5) / stateSize;
      }
      geometry.setAttribute(
        "aInteractionUv",
        new THREE.BufferAttribute(interactionUv, 2),
      );

      const sourcePositionTex = packDataTexture(
        clouds[0].positions,
        pointCount,
        stateSize,
        3,
      );
      const targetPositionTex = packDataTexture(
        clouds[0].positions,
        pointCount,
        stateSize,
        3,
      );
      const sourceNormalTex = packDataTexture(
        clouds[0].normals,
        pointCount,
        stateSize,
        3,
      );
      const targetNormalTex = packDataTexture(
        clouds[0].normals,
        pointCount,
        stateSize,
        3,
      );
      // Seed and rank share one texel, since both are per point timing.
      const timingTex = packDataTexture(null, pointCount, stateSize, 1);
      {
        const data = timingTex.image.data as Float32Array;
        for (let i = 0; i < pointCount; i += 1) {
          data[i * 4] = seeds[i];
          data[i * 4 + 1] = clouds[0].rank[i];
        }
        timingTex.needsUpdate = true;
      }

      const makeTarget = (size: number, smooth: boolean) =>
        new THREE.WebGLRenderTarget(size, size, {
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
          minFilter: smooth ? THREE.LinearFilter : THREE.NearestFilter,
          magFilter: smooth ? THREE.LinearFilter : THREE.NearestFilter,
          depthBuffer: false,
          stencilBuffer: false,
        });

      // Both passes read the previous frame while writing the next, so each
      // needs two targets to swap between: a shader cannot sample the buffer it
      // is drawing into.
      let stateA = makeTarget(stateSize, false);
      let stateB = makeTarget(stateSize, false);
      let fieldA = makeTarget(FIELD_SIZE, true);
      let fieldB = makeTarget(FIELD_SIZE, true);

      const sizeScratch = new THREE.Vector2();
      const passCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const passGeometry = new THREE.PlaneGeometry(2, 2);

      const fieldUniforms = {
        uFieldTex: { value: fieldA.texture },
        uTexelSize: {
          value: new THREE.Vector2(1 / FIELD_SIZE, 1 / FIELD_SIZE),
        },
        uDelta: { value: 1 / 60 },
        uCursorNdc: { value: new THREE.Vector2(2, 2) },
        uCursorVelocity: { value: new THREE.Vector2() },
        uCursorInfluence: { value: 0 },
        uViewportAspect: { value: 1 },
        uViewportHeightPx: { value: 1 },
        uCoreRadius: { value: 1 },
        uTailRadius: { value: 1 },
        uClumpScale: { value: CURSOR.clumpScale },
        uClumpContrast: { value: CURSOR.clumpContrast },
        uTipBias: { value: CURSOR.tipBias },
        uClusterMemory: { value: CURSOR.clusterMemory },
        uChainCoherence: { value: CURSOR.chainCoherence },
        uTime: { value: 0 },
      };
      const fieldMaterial = new THREE.ShaderMaterial({
        uniforms: fieldUniforms,
        vertexShader: PASS_VERTEX_SHADER,
        fragmentShader: FIELD_SHADER,
        depthTest: false,
        depthWrite: false,
      });
      const fieldScene = new THREE.Scene();
      const fieldQuad = new THREE.Mesh(passGeometry, fieldMaterial);
      fieldQuad.frustumCulled = false;
      fieldScene.add(fieldQuad);

      const stateUniforms = {
        uStateTex: { value: stateA.texture },
        uFieldTex: { value: fieldA.texture },
        uSourcePositionTex: { value: sourcePositionTex },
        uTargetPositionTex: { value: targetPositionTex },
        uSourceNormalTex: { value: sourceNormalTex },
        uTargetNormalTex: { value: targetNormalTex },
        uTimingTex: { value: timingTex },
        uPointCount: { value: pointCount },
        uTextureSize: { value: stateSize },
        uDelta: { value: 1 / 60 },
        uProgress: { value: 0 },
        uStagger: { value: stagger },
        uBurst: { value: disperse },
        uSettleOffset: { value: settleOffset },
        uSpike: { value: spike },
        uModelViewMatrix: { value: new THREE.Matrix4() },
        uProjectionMatrix: { value: new THREE.Matrix4() },
        uNormalMatrix: { value: new THREE.Matrix3() },
        uCursorNdc: { value: new THREE.Vector2(2, 2) },
        uCursorVelocity: { value: new THREE.Vector2() },
        uCursorInfluence: { value: 0 },
        uViewportAspect: { value: 1 },
        uViewportHeightPx: { value: 1 },
        uCoreRadius: { value: 1 },
        uTailRadius: { value: 1 },
        uCoreStrength: { value: 0 },
        uTailStrength: { value: 0 },
        uCoreFalloff: { value: CURSOR.coreFalloff / CURSOR.softness },
        uTailFalloff: { value: CURSOR.tailFalloff / CURSOR.softness },
        uDepthFalloff: { value: CURSOR.depthFalloff },
        uSpringStrength: { value: CURSOR.springStrength },
        uDamping: { value: CURSOR.damping },
        uMaxVelocity: { value: CURSOR.maxVelocity },
        uMaxOffset: { value: CURSOR.maxOffset },
        uCurlStrength: { value: 0 },
        uCurlRadius: { value: 1 },
        uCurlFalloff: { value: CURSOR.curlFalloff },
        uNormalDirectionInfluence: {
          value: CURSOR.normalDirectionInfluence,
        },
        uRepelRandomness: { value: CURSOR.repelRandomness },
        uClumpScale: { value: CURSOR.clumpScale },
        uClumpContrast: { value: CURSOR.clumpContrast },
        uClumpBoost: { value: CURSOR.clumpBoost },
        uTipBias: { value: CURSOR.tipBias },
        uClusterMemory: { value: CURSOR.clusterMemory },
        uChainCoherence: { value: CURSOR.chainCoherence },
      };
      const stateMaterial = new THREE.ShaderMaterial({
        uniforms: stateUniforms,
        vertexShader: PASS_VERTEX_SHADER,
        fragmentShader: STATE_SHADER,
        depthTest: false,
        depthWrite: false,
      });
      const stateScene = new THREE.Scene();
      const stateQuad = new THREE.Mesh(passGeometry, stateMaterial);
      stateQuad.frustumCulled = false;
      stateScene.add(stateQuad);

      // Both histories start empty, or the first frame reads whatever the
      // driver left in the buffer and the cloud jumps. They must clear to zero
      // rather than to the paper colour: these buffers hold offsets and
      // velocities, and clearing them to the background would seed every point
      // with a displacement it never earned.
      {
        const clearColor = new THREE.Color();
        renderer.getClearColor(clearColor);
        const clearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(0x000000, 0);
        for (const target of [stateA, stateB, fieldA, fieldB]) {
          renderer.setRenderTarget(target);
          renderer.clear(true, false, false);
        }
        renderer.setRenderTarget(null);
        renderer.setClearColor(clearColor, clearAlpha);
      }

      let current = 0;
      let morphing = false;
      let morphStart = 0;
      let holdUntil = 0;
      let frame = 0;
      let running = true;
      let elapsed = 0;
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
        // The simulation resolves screen positions from its own textures, so
        // they have to follow the morph as well. Skip this and the cursor keeps
        // shoving the shape the cloud has already left.
        writeDataTexture(
          sourcePositionTex,
          clouds[current].positions,
          pointCount,
          3,
        );
        writeDataTexture(
          targetPositionTex,
          clouds[target].positions,
          pointCount,
          3,
        );
        writeDataTexture(
          sourceNormalTex,
          clouds[current].normals,
          pointCount,
          3,
        );
        writeDataTexture(
          targetNormalTex,
          clouds[target].normals,
          pointCount,
          3,
        );
        {
          const data = timingTex.image.data as Float32Array;
          const rank = clouds[current].rank;
          for (let i = 0; i < pointCount; i += 1) data[i * 4 + 1] = rank[i];
          timingTex.needsUpdate = true;
        }
        uniforms.uProgress.value = 0;
        morphing = true;
        morphStart = elapsed;
        current = target;
        setActive(target);
        setSettled(false);
      };

      advanceRef.current = () => beginMorph(current + 1);

      // The simulation needs where the cursor is, how fast it is moving, and
      // whether it is on the canvas at all. Velocity is what drives the swirl,
      // so it is measured per event and decays on its own: a cursor that stops
      // should stop stirring even though it is still hovering.
      const cursorNdc = new THREE.Vector2(2, 2);
      const cursorVelocity = new THREE.Vector2();
      let cursorInfluenceTarget = 0;
      let cursorInfluence = 0;
      let lastPointerTime = 0;

      const onPointerMove = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        const now = elapsed;
        const dt = Math.min(0.05, Math.max(1 / 240, now - lastPointerTime));
        if (cursorNdc.x < 1.5) {
          cursorVelocity.set((x - cursorNdc.x) / dt, (y - cursorNdc.y) / dt);
        }
        lastPointerTime = now;
        cursorNdc.set(x, y);
        cursorInfluenceTarget = 1;
      };
      const onPointerLeave = () => {
        cursorInfluenceTarget = 0;
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
        // getDelta advances the clock's own marker, so elapsed time is
        // accumulated here rather than read back from the same clock.
        const dt = Math.min(0.05, Math.max(0.0001, clock.getDelta()));
        elapsed += dt;
        const time = elapsed;
        const s = live.current;

        uniforms.uTime.value = time;
        uniforms.uBurst.value = s.disperse;
        uniforms.uSettleOffset.value = s.settleOffset;
        uniforms.uSpike.value = s.spike;
        uniforms.uStagger.value = s.stagger;
        uniforms.uSize.value = s.pointSize;
        uniforms.uAmbient.value = s.light.ambient;
        uniforms.uDiffuse.value = s.light.diffuse;
        uniforms.uWrap.value = s.light.wrap;
        uniforms.uRim.value = s.light.rim;
        uniforms.uRimPower.value = s.light.rimPower;

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
            writeDataTexture(
              sourcePositionTex,
              clouds[current].positions,
              pointCount,
              3,
            );
            writeDataTexture(
              sourceNormalTex,
              clouds[current].normals,
              pointCount,
              3,
            );
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

        // ------------------------------------------------------------------
        // Cursor simulation, stepped before the cloud is drawn so the render
        // pass reads this frame's displacement rather than the last one's.
        // ------------------------------------------------------------------
        cursorInfluence += (cursorInfluenceTarget - cursorInfluence) * 0.12;
        // Velocity decays whether or not events arrive, so a resting cursor
        // stops swirling instead of stirring forever at its last speed.
        cursorVelocity.multiplyScalar(Math.exp(-9 * dt));

        const size = renderer.getSize(sizeScratch);
        const aspect = size.x / Math.max(size.y, 1);
        const heightPx = size.y;
        const radiusPx = s.pointerRadius * Math.max(heightPx, 1) * 0.5;
        const gain = s.pointerStrength;

        fieldUniforms.uDelta.value = dt;
        fieldUniforms.uTime.value = time;
        fieldUniforms.uCursorNdc.value.copy(cursorNdc);
        fieldUniforms.uCursorVelocity.value.copy(cursorVelocity);
        fieldUniforms.uCursorInfluence.value = cursorInfluence;
        fieldUniforms.uViewportAspect.value = aspect;
        fieldUniforms.uViewportHeightPx.value = heightPx;
        fieldUniforms.uCoreRadius.value = radiusPx * CURSOR.coreRadiusRatio;
        fieldUniforms.uTailRadius.value = radiusPx;
        fieldUniforms.uFieldTex.value = fieldA.texture;

        const previousTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(fieldB);
        renderer.render(fieldScene, passCamera);
        const swapField = fieldA;
        fieldA = fieldB;
        fieldB = swapField;

        // The simulation resolves the point's screen position itself, so it
        // needs the same matrices the cloud is about to be drawn with.
        camera.updateMatrixWorld();
        cloud.updateMatrixWorld();
        cloud.modelViewMatrix.multiplyMatrices(
          camera.matrixWorldInverse,
          cloud.matrixWorld,
        );
        cloud.normalMatrix.getNormalMatrix(cloud.modelViewMatrix);

        stateUniforms.uDelta.value = dt;
        stateUniforms.uProgress.value = uniforms.uProgress.value;
        stateUniforms.uStagger.value = s.stagger;
        stateUniforms.uBurst.value = s.disperse;
        stateUniforms.uSettleOffset.value = s.settleOffset;
        stateUniforms.uSpike.value = s.spike;
        stateUniforms.uModelViewMatrix.value.copy(cloud.modelViewMatrix);
        stateUniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
        stateUniforms.uNormalMatrix.value.copy(cloud.normalMatrix);
        stateUniforms.uCursorNdc.value.copy(cursorNdc);
        stateUniforms.uCursorVelocity.value.copy(cursorVelocity);
        stateUniforms.uCursorInfluence.value = cursorInfluence;
        stateUniforms.uViewportAspect.value = aspect;
        stateUniforms.uViewportHeightPx.value = heightPx;
        stateUniforms.uCoreRadius.value = radiusPx * CURSOR.coreRadiusRatio;
        stateUniforms.uTailRadius.value = radiusPx;
        stateUniforms.uCurlRadius.value = radiusPx * CURSOR.curlRadiusRatio;
        stateUniforms.uCoreStrength.value = gain * CURSOR.coreStrength;
        stateUniforms.uTailStrength.value = gain * CURSOR.tailStrength;
        stateUniforms.uCurlStrength.value = gain * CURSOR.curlStrength;
        stateUniforms.uStateTex.value = stateA.texture;
        stateUniforms.uFieldTex.value = fieldA.texture;

        renderer.setRenderTarget(stateB);
        renderer.render(stateScene, passCamera);
        const swapState = stateA;
        stateA = stateB;
        stateB = swapState;
        renderer.setRenderTarget(previousTarget);

        uniforms.uInteractionState.value = stateA.texture;
        uniforms.uViewportAspect.value = aspect;

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
        stateA.dispose();
        stateB.dispose();
        fieldA.dispose();
        fieldB.dispose();
        fieldMaterial.dispose();
        stateMaterial.dispose();
        passGeometry.dispose();
        sourcePositionTex.dispose();
        targetPositionTex.dispose();
        sourceNormalTex.dispose();
        targetNormalTex.dispose();
        timingTex.dispose();
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
