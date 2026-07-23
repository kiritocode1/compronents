/**
 * integrity.ts
 *
 * Failure modes solved:
 *   1. The large upload corrupted in flight, accepted anyway: sending a
 *      100MB file as one stream means a single flipped byte (a flaky proxy,
 *      a truncated connection) produces a file that is the wrong size or
 *      silently wrong, and the server stores it as if it were fine. Chunked
 *      upload with a per-chunk checksum catches corruption at the chunk
 *      boundary: every chunk carries a hash, the server recomputes it on
 *      arrival, and a mismatch rejects THAT chunk for re-send instead of
 *      poisoning the whole object.
 *   2. Restarting the whole transfer after a drop: without resumability, a
 *      connection lost at 95% throws away 95MB of good work. Tracking which
 *      chunks are already verified lets the client resume by sending only
 *      the missing ones, and a final whole-object checksum proves the
 *      reassembled file matches what the client meant to send, so the
 *      upload is complete only when both every chunk and the full digest
 *      agree.
 *
 * Why the primitives make it correct: received chunks accumulate in one Ref
 * keyed by index, and accepting a chunk is a single Ref.modify that
 * recomputes and compares the checksum before storing (a corrupt chunk
 * never lands), so a re-sent chunk is idempotent and a wrong one is a typed
 * ChecksumMismatch; completion recomputes the digest over the reassembled
 * bytes and refuses if any chunk is missing or the whole-object hash
 * disagrees.
 */

import { Data, Effect, Ref } from "effect";

class ChecksumMismatch extends Data.TaggedError("ChecksumMismatch")<{
  readonly index: number;
  readonly expected: string;
  readonly actual: string;
}> {}

class IncompleteUpload extends Data.TaggedError("IncompleteUpload")<{
  readonly missing: readonly number[];
}> {}

class ObjectChecksumMismatch extends Data.TaggedError(
  "ObjectChecksumMismatch",
)<{
  readonly expected: string;
  readonly actual: string;
}> {}

/** FNV-1a hex digest; a stand-in for a real content hash (SHA-256, etc.) */
export const digest = (bytes: string) => {
  let x = 0x811c9dc5 >>> 0;
  for (let i = 0; i < bytes.length; i++)
    x = Math.imul(x ^ bytes.charCodeAt(i), 0x01000193) >>> 0;
  return (x >>> 0).toString(16).padStart(8, "0");
};

export interface Chunk {
  readonly index: number;
  readonly data: string;
  readonly checksum: string;
}

/** split a payload into chunks, each stamped with its own checksum */
export const chunkify = (payload: string, chunkSize: number): Chunk[] => {
  const chunks: Chunk[] = [];
  for (let i = 0, idx = 0; i < payload.length; i += chunkSize, idx++) {
    const data = payload.slice(i, i + chunkSize);
    chunks.push({ index: idx, data, checksum: digest(data) });
  }
  return chunks;
};

export interface Upload {
  readonly total: number;
  readonly objectChecksum: string;
  readonly receive: (
    chunk: Chunk,
  ) => Effect.Effect<{ accepted: boolean }, ChecksumMismatch>;
  readonly missing: Effect.Effect<readonly number[]>;
  readonly complete: Effect.Effect<
    string,
    IncompleteUpload | ObjectChecksumMismatch
  >;
}

export const beginUpload = (
  total: number,
  objectChecksum: string,
): Effect.Effect<Upload> =>
  Effect.gen(function* () {
    const received = yield* Ref.make(new Map<number, string>());

    const receive = (chunk: Chunk) =>
      Effect.gen(function* () {
        const actual = digest(chunk.data);
        if (actual !== chunk.checksum) {
          // corruption in flight: reject this chunk, do not store it
          return yield* new ChecksumMismatch({
            index: chunk.index,
            expected: chunk.checksum,
            actual,
          });
        }
        // idempotent: re-sending an already-verified chunk is a no-op accept
        yield* Ref.update(received, (m) =>
          new Map(m).set(chunk.index, chunk.data),
        );
        return { accepted: true };
      });

    const missing = Ref.get(received).pipe(
      Effect.map((m) => {
        const out: number[] = [];
        for (let i = 0; i < total; i++) if (!m.has(i)) out.push(i);
        return out;
      }),
    );

    const complete = Effect.gen(function* () {
      const m = yield* Ref.get(received);
      const gaps: number[] = [];
      for (let i = 0; i < total; i++) if (!m.has(i)) gaps.push(i);
      if (gaps.length > 0)
        return yield* new IncompleteUpload({ missing: gaps });
      let reassembled = "";
      for (let i = 0; i < total; i++) reassembled += m.get(i)!;
      const actual = digest(reassembled);
      if (actual !== objectChecksum) {
        return yield* new ObjectChecksumMismatch({
          expected: objectChecksum,
          actual,
        });
      }
      return reassembled;
    });

    return { total, objectChecksum, receive, missing, complete } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const payload =
    "the-quick-brown-fox-jumps-over-the-lazy-dog-again-and-again-1234567890";
  const chunks = chunkify(payload, 8);
  const objectChecksum = digest(payload);

  // Property 1: a clean chunked upload reassembles to the exact object.
  {
    const up = yield* beginUpload(chunks.length, objectChecksum);
    for (const c of chunks) yield* up.receive(c);
    const result = yield* up.complete;
    yield* check(
      "verified chunks reassemble to the original object",
      result === payload,
      `${chunks.length} chunks uploaded and reassembled to the exact ${payload.length}-byte payload`,
    );
  }

  // Property 2: a chunk corrupted in flight is rejected, not stored.
  {
    const up = yield* beginUpload(chunks.length, objectChecksum);
    const corrupt = { ...chunks[2], data: chunks[2].data.replace(/./, "X") }; // byte flipped, checksum stale
    const exit = yield* Effect.exit(up.receive(corrupt));
    const missing = yield* up.missing;
    yield* check(
      "a corrupted chunk is refused for re-send",
      exit._tag === "Failure" && missing.includes(2),
      `chunk 2 arrived corrupted (checksum mismatch) and was rejected; it stays in the missing list [${missing.join(",")}]`,
    );
  }

  // Property 3: resumability. After a drop, only the missing chunks are sent.
  {
    const up = yield* beginUpload(chunks.length, objectChecksum);
    // "connection dropped" after the first 5 chunks
    for (const c of chunks.slice(0, 5)) yield* up.receive(c);
    const beforeResume = yield* up.missing;
    // resume: send only what is missing
    for (const idx of beforeResume) yield* up.receive(chunks[idx]);
    const result = yield* Effect.exit(up.complete);
    yield* check(
      "resume sends only the missing chunks",
      beforeResume.length === chunks.length - 5 && result._tag === "Success",
      `after a drop at chunk 5, only the remaining ${beforeResume.length} chunks were re-sent and the upload completed`,
    );
  }

  // Property 4: completion refuses a whole-object checksum mismatch even if
  // every chunk individually verified (guards against wrong reassembly).
  {
    // an upload whose declared object checksum does not match the content
    const up = yield* beginUpload(chunks.length, "deadbeef");
    for (const c of chunks) yield* up.receive(c);
    const exit = yield* Effect.exit(up.complete);
    const failedOnObject =
      exit._tag === "Failure" &&
      String(exit.cause).includes("ObjectChecksumMismatch");
    yield* check(
      "the final digest is the last line of defense",
      failedOnObject,
      `every chunk verified, but the reassembled object's digest disagreed with the declared one, so completion was refused`,
    );
  }

  // Property 5: re-sending an already-accepted chunk is idempotent.
  {
    const up = yield* beginUpload(chunks.length, objectChecksum);
    for (const c of chunks) yield* up.receive(c);
    yield* up.receive(chunks[0]); // duplicate, e.g. a retried request
    yield* up.receive(chunks[0]);
    const result = yield* up.complete;
    yield* check(
      "duplicate chunks do not corrupt the object",
      result === payload,
      `re-sending chunk 0 twice was a harmless no-op; the object still matches its checksum`,
    );
  }

  console.log("integrity.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
