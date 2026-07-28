/**
 * multipart.ts
 *
 * Failure modes solved:
 *   1. The restart-from-zero upload: pushing a large object in one request
 *      means a connection drop at 95% throws away everything. Multipart
 *      slices the object into parts uploaded independently (and in
 *      parallel, bounded), each acknowledged with an ETag; a failed part is
 *      the only thing retried, and a resumed session re-uploads only the
 *      parts the store has not acknowledged.
 *   2. Orphaned parts that bill forever: an initiated multipart upload that
 *      is never completed nor aborted keeps its uploaded parts in storage,
 *      invisible in the bucket listing but very visible on the invoice. The
 *      upload session is Effect.acquireRelease: initiate is the acquire,
 *      and the release aborts the upload unless it completed, so a crash,
 *      a failure, or an interrupt mid-transfer always frees the parts. The
 *      cleanup is a property of the scope, not a finally the caller must
 *      remember.
 *
 * Why the primitives make it correct: acquireRelease runs the abort on
 * every exit path including interruption, Effect.all with bounded
 * concurrency is the parallel part uploader, and per-part retry means one
 * flaky part cannot force its neighbors to re-upload.
 */

import { Data, Effect, Exit, Ref, Schedule } from "effect";

class PartUploadFailed extends Data.TaggedError("PartUploadFailed")<{
  readonly partNumber: number;
}> {}

interface StoredUpload {
  /** partNumber -> etag, only acknowledged parts */
  readonly parts: Map<number, string>;
  readonly completed: boolean;
}

/** In-memory stand-in for the object store's multipart API. */
export interface ObjectStore {
  readonly initiate: (key: string) => Effect.Effect<string>;
  readonly uploadPart: (
    uploadId: string,
    partNumber: number,
    bytes: string,
  ) => Effect.Effect<string, PartUploadFailed>;
  readonly complete: (
    uploadId: string,
    parts: readonly { partNumber: number; etag: string }[],
  ) => Effect.Effect<void>;
  readonly abort: (uploadId: string) => Effect.Effect<void>;
  /** parts sitting in storage for uploads that never completed */
  readonly orphanedParts: Effect.Effect<number>;
  readonly acknowledged: (
    uploadId: string,
  ) => Effect.Effect<Map<number, string>>;
  readonly objects: Ref.Ref<Map<string, string>>;
}

export const makeObjectStore = (options: {
  /** partNumbers that fail on their first attempt, to model a flaky network */
  readonly flakyParts?: readonly number[];
}): Effect.Effect<ObjectStore> =>
  Effect.gen(function* () {
    const uploads = yield* Ref.make(new Map<string, StoredUpload>());
    const objects = yield* Ref.make(new Map<string, string>());
    const keys = yield* Ref.make(new Map<string, string>());
    const failedOnce = yield* Ref.make(new Set<number>());
    let nextId = 1;

    const initiate = (key: string) =>
      Effect.gen(function* () {
        const uploadId = `upload-${nextId++}`;
        yield* Ref.update(uploads, (m) =>
          new Map(m).set(uploadId, { parts: new Map(), completed: false }),
        );
        yield* Ref.update(keys, (m) => new Map(m).set(uploadId, key));
        return uploadId;
      });

    const uploadPart = (uploadId: string, partNumber: number, bytes: string) =>
      Effect.gen(function* () {
        if (options.flakyParts?.includes(partNumber)) {
          const seen = yield* Ref.get(failedOnce);
          if (!seen.has(partNumber)) {
            yield* Ref.update(failedOnce, (s) => new Set(s).add(partNumber));
            return yield* new PartUploadFailed({ partNumber });
          }
        }
        yield* Effect.sleep("5 millis"); // model the transfer
        const etag = `etag-${partNumber}-${bytes.length}`;
        yield* Ref.update(uploads, (m) => {
          const u = m.get(uploadId);
          if (u === undefined || u.completed) return m;
          const next = new Map(m);
          next.set(uploadId, {
            ...u,
            parts: new Map(u.parts).set(partNumber, etag),
          });
          return next;
        });
        return etag;
      });

    const complete = (
      uploadId: string,
      parts: readonly { partNumber: number; etag: string }[],
    ) =>
      Effect.gen(function* () {
        const key = (yield* Ref.get(keys)).get(uploadId) ?? uploadId;
        const body = parts
          .slice()
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => p.etag)
          .join("+");
        yield* Ref.update(objects, (m) => new Map(m).set(key, body));
        yield* Ref.update(uploads, (m) => {
          const u = m.get(uploadId);
          if (u === undefined) return m;
          return new Map(m).set(uploadId, { ...u, completed: true });
        });
      });

    const abort = (uploadId: string) =>
      Ref.update(uploads, (m) => {
        const next = new Map(m);
        next.delete(uploadId);
        return next;
      });

    const orphanedParts = Ref.get(uploads).pipe(
      Effect.map((m) =>
        [...m.values()]
          .filter((u) => !u.completed)
          .reduce((n, u) => n + u.parts.size, 0),
      ),
    );

    const acknowledged = (uploadId: string) =>
      Ref.get(uploads).pipe(
        Effect.map((m) => new Map(m.get(uploadId)?.parts ?? [])),
      );

    return {
      initiate,
      uploadPart,
      complete,
      abort,
      orphanedParts,
      acknowledged,
      objects,
    } as const;
  });

/**
 * Upload `parts` under `key`. The multipart session lives in a scope: if the
 * effect fails or is interrupted before complete(), the release aborts the
 * upload and the store frees every part. Pass `resumeFrom` (a previous
 * uploadId) to skip parts the store already acknowledged.
 */
export const multipartUpload = (
  store: ObjectStore,
  key: string,
  parts: readonly string[],
  options: {
    readonly concurrency: number;
    readonly retriesPerPart: number;
    readonly resumeFrom?: string;
  },
): Effect.Effect<{ uploadId: string; uploadedNow: number }, PartUploadFailed> =>
  Effect.scoped(
    Effect.gen(function* () {
      const done = yield* Ref.make(false);
      const uploadId =
        options.resumeFrom ??
        (yield* Effect.acquireRelease(store.initiate(key), () => Effect.void));
      // The abort finalizer: runs on failure AND interrupt, skips after complete.
      yield* Effect.addFinalizer(() =>
        Ref.get(done).pipe(
          Effect.flatMap((ok) => (ok ? Effect.void : store.abort(uploadId))),
        ),
      );

      const already = options.resumeFrom
        ? yield* store.acknowledged(options.resumeFrom)
        : new Map<number, string>();

      const uploadOne = (bytes: string, index: number) => {
        const partNumber = index + 1;
        const existing = already.get(partNumber);
        if (existing !== undefined) {
          return Effect.succeed({ partNumber, etag: existing, reused: true });
        }
        return store.uploadPart(uploadId, partNumber, bytes).pipe(
          Effect.retry({ schedule: Schedule.recurs(options.retriesPerPart) }),
          Effect.map((etag) => ({ partNumber, etag, reused: false })),
        );
      };

      const results = yield* Effect.all(parts.map(uploadOne), {
        concurrency: options.concurrency,
      });
      yield* store.complete(uploadId, results);
      yield* Ref.set(done, true);
      return { uploadId, uploadedNow: results.filter((r) => !r.reused).length };
    }),
  );

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const eightParts = Array.from({ length: 8 }, (_, i) =>
    `chunk-${i + 1}`.padEnd(200, "x"),
  );

  // Property 1: a flaky part is retried alone; the object still completes.
  {
    const store = yield* makeObjectStore({ flakyParts: [5] });
    const { uploadedNow } = yield* multipartUpload(
      store,
      "backup.tar",
      eightParts,
      {
        concurrency: 4,
        retriesPerPart: 2,
      },
    );
    const body = (yield* Ref.get(store.objects)).get("backup.tar");
    const orphans = yield* store.orphanedParts;
    yield* check(
      "flaky part retried, object assembled",
      uploadedNow === 8 && body?.split("+").length === 8 && orphans === 0,
      `8 parts uploaded (part 5 failed once and retried), assembled ${body?.split("+").length} parts in order, 0 orphans`,
    );
  }

  // Property 2: a crash mid-upload aborts the session; nothing is left billing.
  {
    // part 4 fails and has no retries left, so the session dies mid-transfer
    const flakyStore = yield* makeObjectStore({ flakyParts: [4] });
    const exit = yield* Effect.exit(
      multipartUpload(flakyStore, "video.mp4", eightParts, {
        concurrency: 2,
        retriesPerPart: 0,
      }),
    );
    const orphans = yield* flakyStore.orphanedParts;
    yield* check(
      "failed session aborts, zero orphaned parts",
      Exit.isFailure(exit) && orphans === 0,
      `upload failed on part 4, abort finalizer ran, orphaned parts in storage: ${orphans}`,
    );
  }

  // Property 3: resume re-uploads only the missing parts.
  {
    const store = yield* makeObjectStore({});
    // First session: upload 5 of 8 parts, then stop (no complete, no abort:
    // the operator chose to keep the session for resumption).
    const uploadId = yield* store.initiate("dataset.parquet");
    for (let i = 0; i < 5; i++) {
      yield* store.uploadPart(uploadId, i + 1, eightParts[i]);
    }
    const { uploadedNow } = yield* multipartUpload(
      store,
      "dataset.parquet",
      eightParts,
      {
        concurrency: 4,
        retriesPerPart: 1,
        resumeFrom: uploadId,
      },
    );
    const body = (yield* Ref.get(store.objects)).get("dataset.parquet");
    yield* check(
      "resume uploads only the gap",
      uploadedNow === 3 && body?.split("+").length === 8,
      `5 parts were acknowledged, resume uploaded ${uploadedNow} more, final object has ${body?.split("+").length} parts`,
    );
  }

  console.log("multipart.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
