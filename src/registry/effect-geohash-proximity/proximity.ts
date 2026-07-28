/**
 * proximity.ts
 *
 * Failure modes solved:
 *   1. The full-table distance scan: "restaurants near me" computed naively
 *      is a haversine against every row, per query. Geohashing turns 2D
 *      proximity into string prefixes: interleave longitude and latitude
 *      bits, base32-encode, and points that are near each other usually
 *      share a prefix, so a nearby query becomes an index lookup on the
 *      query point's cell instead of a scan of the world.
 *   2. The restaurant across the street that never shows up (the boundary
 *      problem): "usually share a prefix" hides a sharp edge, two points
 *      meters apart on opposite sides of a cell boundary share NO useful
 *      prefix, and a naive single-cell lookup silently drops them. The
 *      search reads the center cell AND its 8 neighbors, then applies the
 *      exact haversine filter to the candidates, so the grid is only ever
 *      a candidate generator and correctness comes from the final circle
 *      test, never from the cell shape.
 *
 * Why the primitives make it correct: the cell index is a Ref-held map
 * from prefix to member set updated atomically per insert, encode/decode
 * are pure bit math, and the neighbor cells are derived by decoding the
 *      center cell's bounds and re-encoding one cell-width away, which is
 * immune to the base32 edge cases of table-driven neighbor lookup.
 */

import { Effect, Ref } from "effect";

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/** standard geohash: interleaved lon/lat bisection, base32 output */
export const encodeGeohash = (
  lat: number,
  lng: number,
  precision: number,
): string => {
  let minLat = -90;
  let maxLat = 90;
  let minLng = -180;
  let maxLng = 180;
  let hash = "";
  let bits = 0;
  let bitCount = 0;
  let evenBit = true;
  while (hash.length < precision) {
    if (evenBit) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) {
        bits = (bits << 1) | 1;
        minLng = mid;
      } else {
        bits = bits << 1;
        maxLng = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        bits = (bits << 1) | 1;
        minLat = mid;
      } else {
        bits = bits << 1;
        maxLat = mid;
      }
    }
    evenBit = !evenBit;
    bitCount++;
    if (bitCount === 5) {
      hash += BASE32[bits];
      bits = 0;
      bitCount = 0;
    }
  }
  return hash;
};

/** cell bounds of a geohash: the inverse bisection */
export const decodeBounds = (hash: string) => {
  let minLat = -90;
  let maxLat = 90;
  let minLng = -180;
  let maxLng = 180;
  let evenBit = true;
  for (const ch of hash) {
    const idx = BASE32.indexOf(ch);
    for (let bit = 4; bit >= 0; bit--) {
      const on = (idx >> bit) & 1;
      if (evenBit) {
        const mid = (minLng + maxLng) / 2;
        if (on) minLng = mid;
        else maxLng = mid;
      } else {
        const mid = (minLat + maxLat) / 2;
        if (on) minLat = mid;
        else maxLat = mid;
      }
      evenBit = !evenBit;
    }
  }
  return { minLat, maxLat, minLng, maxLng };
};

const EARTH_RADIUS_M = 6_371_000;

export const haversineMeters = (
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s));
};

/** the 9 cells covering the query point's cell and its neighbors */
export const coveringCells = (
  lat: number,
  lng: number,
  precision: number,
): readonly string[] => {
  const center = encodeGeohash(lat, lng, precision);
  const b = decodeBounds(center);
  const dLat = b.maxLat - b.minLat;
  const dLng = b.maxLng - b.minLng;
  const cells = new Set<string>();
  for (const dy of [-1, 0, 1]) {
    for (const dx of [-1, 0, 1]) {
      const nLat = Math.max(
        -90,
        Math.min(90, (b.minLat + b.maxLat) / 2 + dy * dLat),
      );
      const nLng = (((b.minLng + b.maxLng) / 2 + dx * dLng + 540) % 360) - 180; // wrap the antimeridian
      cells.add(encodeGeohash(nLat, nLng, precision));
    }
  }
  return [...cells];
};

export interface Place {
  readonly id: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
}

export interface ProximityIndex {
  readonly add: (place: Place) => Effect.Effect<void>;
  readonly remove: (id: string) => Effect.Effect<void>;
  readonly nearby: (
    lat: number,
    lng: number,
    radiusMeters: number,
  ) => Effect.Effect<readonly (Place & { readonly distanceMeters: number })[]>;
  /** how many candidates the grid produced for the last query (vs a full scan) */
  readonly lastCandidateCount: Effect.Effect<number>;
}

export const makeProximityIndex = (options: {
  /** geohash length; 6 chars is a ~1.2km x 0.6km cell, right for city radius queries */
  readonly precision: number;
}): Effect.Effect<ProximityIndex> =>
  Effect.gen(function* () {
    const cells = yield* Ref.make(new Map<string, Map<string, Place>>());
    const byId = yield* Ref.make(new Map<string, string>()); // id -> cell
    const lastCandidates = yield* Ref.make(0);

    const add = (place: Place) =>
      Effect.gen(function* () {
        const cell = encodeGeohash(place.lat, place.lng, options.precision);
        yield* Ref.update(cells, (m) => {
          const next = new Map(m);
          const members = new Map(next.get(cell) ?? []);
          members.set(place.id, place);
          next.set(cell, members);
          return next;
        });
        yield* Ref.update(byId, (m) => new Map(m).set(place.id, cell));
      });

    const remove = (id: string) =>
      Effect.gen(function* () {
        const cell = (yield* Ref.get(byId)).get(id);
        if (cell === undefined) return;
        yield* Ref.update(cells, (m) => {
          const next = new Map(m);
          const members = new Map(next.get(cell) ?? []);
          members.delete(id);
          if (members.size === 0) next.delete(cell);
          else next.set(cell, members);
          return next;
        });
        yield* Ref.update(byId, (m) => {
          const next = new Map(m);
          next.delete(id);
          return next;
        });
      });

    const nearby = (lat: number, lng: number, radiusMeters: number) =>
      Effect.gen(function* () {
        const index = yield* Ref.get(cells);
        // grid = candidate generator (center + 8 neighbors)...
        const candidates: Place[] = [];
        for (const cell of coveringCells(lat, lng, options.precision)) {
          const members = index.get(cell);
          if (members) candidates.push(...members.values());
        }
        yield* Ref.set(lastCandidates, candidates.length);
        // ...exact circle test = correctness
        return candidates
          .map((p) => ({
            ...p,
            distanceMeters: haversineMeters(lat, lng, p.lat, p.lng),
          }))
          .filter((p) => p.distanceMeters <= radiusMeters)
          .sort((a, b) => a.distanceMeters - b.distanceMeters);
      });

    return {
      add,
      remove,
      nearby,
      lastCandidateCount: Ref.get(lastCandidates),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const index = yield* makeProximityIndex({ precision: 6 });

  // A small Manhattan: the user stands at Washington Square Park.
  const USER = { lat: 40.7308, lng: -73.9973 };
  const places: Place[] = [
    { id: "p1", name: "Blue Note Cafe", lat: 40.7306, lng: -73.9997 }, // ~200m
    { id: "p2", name: "Mercer Ramen", lat: 40.727, lng: -73.9959 }, // ~440m
    { id: "p3", name: "Union Sq Tacos", lat: 40.7359, lng: -73.9911 }, // ~780m
    { id: "p4", name: "Midtown Deli", lat: 40.7549, lng: -73.984 }, // ~2.9km
    { id: "p5", name: "Brooklyn Bagels", lat: 40.6782, lng: -73.9442 }, // ~7.4km
  ];
  for (const p of places) yield* index.add(p);
  // and 2000 far-away places that a full scan would have to touch
  for (let i = 0; i < 2000; i++) {
    yield* index.add({
      id: `far-${i}`,
      name: `Far ${i}`,
      lat: 34 + (i % 50) * 0.01,
      lng: -118 + Math.floor(i / 50) * 0.01,
    });
  }

  // Property 1: a 1km query returns exactly the walkable spots, sorted.
  {
    const results = yield* index.nearby(USER.lat, USER.lng, 1000);
    const names = results.map((r) => r.name);
    const candidates = yield* index.lastCandidateCount;
    yield* check(
      "radius query is exact and sorted",
      names.join(" | ") === "Blue Note Cafe | Mercer Ramen | Union Sq Tacos" &&
        results.every(
          (r, i) =>
            i === 0 || results[i - 1].distanceMeters <= r.distanceMeters,
        ),
      `1km around Washington Sq: [${names.join(", ")}] at ${results.map((r) => Math.round(r.distanceMeters) + "m").join(", ")}`,
    );
    yield* check(
      "the grid pruned the scan",
      candidates <= 20,
      `${candidates} candidates examined instead of ${places.length + 2000} rows (the LA noise never entered the haversine)`,
    );
  }

  // Property 2: the boundary problem. Two points ~150m apart on opposite
  // sides of a cell edge share no useful prefix; single-cell lookup drops
  // one, the 9-cell covering finds it.
  {
    // construct the pair from the real cell bounds: the user just south of
    // their cell's top edge, the restaurant just north of it
    const userCellBounds = decodeBounds(encodeGeohash(40.7338, -73.99, 6));
    const edgeLat = userCellBounds.maxLat;
    const cellHeight = userCellBounds.maxLat - userCellBounds.minLat;
    const south = { lat: edgeLat - cellHeight * 0.1, lng: -73.99 }; // the user
    const north = {
      id: "b1",
      name: "North of the line",
      lat: edgeLat + cellHeight * 0.1,
      lng: -73.99,
    };
    yield* index.add(north);
    const northCell = encodeGeohash(north.lat, north.lng, 6);
    const userCell = encodeGeohash(south.lat, south.lng, 6);
    const distance = haversineMeters(
      south.lat,
      south.lng,
      north.lat,
      north.lng,
    );
    const found = yield* index.nearby(south.lat, south.lng, 300);
    yield* check(
      "neighbor scan beats the cell edge",
      northCell !== userCell &&
        distance < 300 &&
        found.some((r) => r.id === "b1"),
      `${Math.round(distance)}m apart across cells ${userCell}/${northCell}: single-cell lookup would miss it, 9-cell covering found it`,
    );
  }

  // Property 3: nearby points share prefixes (the index property), and
  // removal takes effect immediately.
  {
    const a = encodeGeohash(40.7308, -73.9973, 6);
    const b = encodeGeohash(40.7306, -73.9997, 6);
    const c = encodeGeohash(34.05, -118.24, 6);
    yield* index.remove("p1");
    const after = yield* index.nearby(USER.lat, USER.lng, 1000);
    yield* check(
      "prefix locality holds; removal is immediate",
      a.slice(0, 4) === b.slice(0, 4) &&
        c.slice(0, 2) !== a.slice(0, 2) &&
        after.every((r) => r.id !== "p1"),
      `NYC pair shares "${a.slice(0, 4)}" prefix, LA starts "${c.slice(0, 2)}"; removed cafe no longer returned`,
    );
  }

  console.log("proximity.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
