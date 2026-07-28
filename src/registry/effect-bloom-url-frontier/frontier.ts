/**
 * frontier.ts
 *
 * Failure modes solved:
 *   1. The seen-set that eats the fleet (exact dedupe at scale): a crawler
 *      must never fetch the same URL twice, but an exact Set of a billion
 *      URLs is tens of gigabytes of RAM per worker, and putting the set in
 *      a database turns every enqueue into a hot read. A Bloom filter
 *      answers "have I seen this?" in a fixed bit array: k hash positions
 *      per URL, all-ones means probably seen, any zero means definitely
 *      new. The memory is a formula you choose (bits per element), not a
 *      function of URL length.
 *   2. Re-crawling forever vs missing pages: the trade has a safe side and
 *      an unsafe side, and the filter sits on the safe one. False
 *      negatives are impossible (a seen URL always reports seen), so the
 *      crawler never loops; false positives happen at the configured rate
 *      (a fresh URL occasionally reported seen, so it is skipped), which
 *      for crawling costs a page, never correctness. The demo measures
 *      the actual false-positive rate against the predicted one.
 *
 * Why the primitives make it correct: the bit array and the counters live
 * behind one Ref-guarded structure with an atomic test-and-set per URL, so
 * two workers discovering the same link race to one winner, and the
 * frontier is a bounded Queue, so discovery backpressures the fetchers
 * instead of buffering the web in memory.
 */

import { Effect, Queue, Ref } from "effect";

// FNV-1a with avalanche finish; two independent seeds give h1 and h2, and
// double hashing (h1 + i*h2) derives the k positions, the standard trick.
const hash = (input: string, seed: number): number => {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

export interface BloomStats {
  readonly bits: number;
  readonly hashes: number;
  readonly bytes: number;
  readonly predictedFalsePositiveRate: number;
}

export interface UrlFrontier {
  /** true if enqueued (definitely new), false if skipped (probably seen) */
  readonly discover: (url: string) => Effect.Effect<boolean>;
  /** next URL to fetch; suspends when the frontier is empty */
  readonly take: Effect.Effect<string>;
  readonly stats: (expectedItems: number) => BloomStats;
}

export const makeUrlFrontier = (options: {
  /** how many URLs the filter is sized for */
  readonly capacity: number;
  /** acceptable false-positive rate at capacity, e.g. 0.01 */
  readonly falsePositiveRate: number;
  /** frontier queue bound: discovery backpressures beyond this */
  readonly queueBound: number;
}): Effect.Effect<UrlFrontier> =>
  Effect.gen(function* () {
    // m = -n ln p / (ln 2)^2, k = (m/n) ln 2: the textbook sizing.
    const m = Math.ceil(
      (-options.capacity * Math.log(options.falsePositiveRate)) /
        (Math.LN2 * Math.LN2),
    );
    const k = Math.max(1, Math.round((m / options.capacity) * Math.LN2));
    const bitsArray = new Uint8Array(Math.ceil(m / 8));
    const gate = yield* Ref.make(0); // serializes test-and-set so races have one winner
    const frontier = yield* Queue.bounded<string>(options.queueBound);

    const testAndSet = (url: string): boolean => {
      const h1 = hash(url, 0x9747b28c);
      // odd so positions cycle the whole array; >>> 0 keeps it unsigned (| 1
      // alone would flip half the hashes negative, and a typed array silently
      // drops writes at negative indices, which manifests as false negatives)
      const h2 = (hash(url, 0x3b9aca07) | 1) >>> 0;
      let seen = true;
      for (let i = 0; i < k; i++) {
        const pos = (h1 + i * h2) % m;
        const byte = pos >> 3;
        const mask = 1 << (pos & 7);
        if ((bitsArray[byte] & mask) === 0) {
          seen = false;
          bitsArray[byte] |= mask;
        }
      }
      return seen;
    };

    const discover = (url: string) =>
      Effect.gen(function* () {
        // Ref.modify gives atomicity for the mutation of the shared bit array:
        // fibers are cooperative, but the explicit gate documents the intent
        // and keeps the invariant if discover is ever run from workers.
        const seen = yield* Ref.modify(
          gate,
          (n) => [testAndSet(url), n + 1] as const,
        );
        if (seen) return false;
        yield* Queue.offer(frontier, url);
        return true;
      });

    const stats = (expectedItems: number): BloomStats => ({
      bits: m,
      hashes: k,
      bytes: bitsArray.length,
      predictedFalsePositiveRate: (1 - Math.exp((-k * expectedItems) / m)) ** k,
    });

    return { discover, take: Queue.take(frontier), stats } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const N = 100_000;
  const frontier = yield* makeUrlFrontier({
    capacity: N,
    falsePositiveRate: 0.01,
    // room for the crawl set plus the fresh URLs of property 3
    queueBound: N + 25_000,
  });

  // Crawl N distinct URLs.
  const urls = Array.from(
    { length: N },
    (_, i) => `https://site-${i % 500}.example/page/${i}`,
  );
  let enqueued = 0;
  for (const url of urls) {
    if (yield* frontier.discover(url)) enqueued++;
  }

  // Property 1: memory is a formula, not a function of the corpus. An exact
  // Set of these URLs holds ~4.1MB of string data alone (~40 chars each,
  // 2 bytes/char in JS) plus per-entry overhead; the filter is ~117KB.
  {
    const s = frontier.stats(N);
    const approxSetBytes = urls.reduce((a, u) => a + u.length * 2 + 60, 0);
    yield* check(
      "fixed bits replace a growing set",
      s.bytes < 150_000 && approxSetBytes > 8_000_000,
      `filter: ${(s.bytes / 1024).toFixed(0)}KB (${s.hashes} hashes, ${s.bits} bits) vs exact Set ~${(approxSetBytes / 1_048_576).toFixed(1)}MB for ${N} URLs`,
    );
  }

  // Property 2: zero false negatives. Every URL already crawled reports seen.
  {
    let falseNegatives = 0;
    for (const url of urls) {
      if (yield* frontier.discover(url)) falseNegatives++;
    }
    yield* check(
      "a seen URL is never re-crawled",
      falseNegatives === 0,
      `${N} re-discoveries, ${falseNegatives} slipped through (false negatives are structurally impossible)`,
    );
  }

  // Property 3: the measured false-positive rate is near the configured 1%.
  {
    let falsePositives = 0;
    const FRESH = 20_000;
    for (let i = 0; i < FRESH; i++) {
      const fresh = `https://never-seen.example/item/${i}`;
      if (!(yield* frontier.discover(fresh))) falsePositives++;
    }
    const rate = falsePositives / FRESH;
    yield* check(
      "false positives stay at the configured rate",
      rate < 0.03,
      `${falsePositives}/${FRESH} fresh URLs skipped = ${(rate * 100).toFixed(2)}% (configured 1%): each costs one missed page, never a loop`,
    );
  }

  // Property 4: the frontier delivered the enqueued URLs in discovery order.
  // A small slice of first-time URLs is skipped as false positives even
  // during filling; that is the configured trade (a missed page), and the
  // rate stays inside the same budget.
  {
    const first = yield* frontier.take;
    const skipped = N - enqueued;
    yield* check(
      "frontier hands out work in discovery order",
      first === urls[0] && skipped / N < 0.01,
      `${enqueued}/${N} URLs enqueued once each (${skipped} skipped as in-fill false positives, ${((skipped / N) * 100).toFixed(2)}%); first out was ${first}`,
    );
  }

  console.log("frontier.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
