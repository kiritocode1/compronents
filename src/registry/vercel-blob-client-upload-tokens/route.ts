import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { authorizeUpload, type UploadSession } from "./upload-policy";

/**
 * The `handleUpload` route: one endpoint serving two unrelated callers.
 *
 * A POST here is either the browser asking for a capability, or Vercel's own
 * servers reporting that an upload finished. `handleUpload` discriminates on
 * `body.type` and dispatches. That second caller is the source of most of the
 * surprises below, because it is an INBOUND request from Vercel to your
 * deployment rather than anything your app initiated.
 *
 * Failure modes solved:
 *
 *   1. onUploadCompleted DOES NOT RUN LOCALLY. The callback is delivered to a
 *      URL resolved from `VERCEL_BLOB_CALLBACK_URL` or the deployment's own
 *      URL, and Vercel cannot reach `http://localhost:3000`. A handler that
 *      writes its database row only in `onUploadCompleted` therefore uploads
 *      files successfully in development and records nothing, which reads as
 *      "the upload silently failed" and sends people looking in the wrong
 *      place. Point `VERCEL_BLOB_CALLBACK_URL` at a tunnel to exercise it.
 *
 *   2. THE BLOB EXISTS BEFORE THE ROW DOES. By the time this callback fires,
 *      the object is committed and billable. If the callback is lost, or your
 *      database is down for the two seconds it takes, you have an orphan: bytes
 *      in the store that no query will ever find, and no error anywhere. Two
 *      consequences, both implemented below: the row write is idempotent on the
 *      blob pathname so a redelivery cannot duplicate it, and a periodic sweep
 *      over `list({ prefix })` reconciles blobs with no row.
 *
 *   3. THE CALLBACK HAS NO SESSION. There is no user cookie on a
 *      server-to-server request, so `tokenPayload` is the only context
 *      available, which is exactly why the policy module derives it entirely
 *      from the authenticated session and never echoes `clientPayload`.
 *
 * Verified against @vercel/blob 2.6.1 (dist/client.d.ts).
 * Docs: https://vercel.com/docs/vercel-blob/client-upload
 */

type Deps = {
  /** Your own auth. Throws or returns null when the caller is anonymous. */
  getSession: (request: Request) => Promise<UploadSession | null>;
  /**
   * Idempotent on `pathname`. Called from a retryable server-to-server
   * callback, so "insert" is the wrong verb: use an upsert on a unique index.
   */
  recordUpload: (row: {
    accountId: string;
    userId: string;
    purpose: string;
    pathname: string;
    url: string;
    contentType: string;
  }) => Promise<void>;
};

export async function handleUploadRequest(
  request: Request,
  deps: Deps,
): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,

      /**
       * Runs only for `blob.generate-client-token`. The session is read here,
       * on the request that carries the caller's cookies, and not in
       * `onUploadCompleted`, where there are none.
       */
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        const session = await deps.getSession(request);
        if (!session) throw new Error("unauthenticated upload request");

        const decision = authorizeUpload({
          session,
          pathname,
          clientPayload,
          multipart,
          now: Date.now(),
        });

        /**
         * A refusal has to throw. There is no "deny" return value: the hook's
         * return type only describes constraints, and returning a narrower set
         * of them still mints a working token for the pathname the client
         * chose. Throwing is the only refusal the SDK understands.
         */
        if (!decision.ok) {
          throw new Error(
            `upload denied (${decision.code}): ${decision.message}`,
          );
        }

        return {
          ...decision.grant,
          /**
           * Explicit rather than inferred, so a preview deployment does not
           * quietly send its callbacks to a URL that will be torn down before
           * the upload finishes. Locally this is a tunnel; unset, the callback
           * never arrives and only the sweep in reconcileOrphans finds the blob.
           */
          callbackUrl: process.env.VERCEL_BLOB_CALLBACK_URL,
        };
      },

      /**
       * Runs only for `blob.upload-completed`, from Vercel, after the object is
       * committed. Everything it knows is in these two fields.
       */
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const context = JSON.parse(tokenPayload ?? "{}") as {
          accountId?: string;
          userId?: string;
          purpose?: string;
        };
        if (!context.accountId || !context.userId || !context.purpose) {
          /**
           * Throwing here fails the callback, which means the blob stays
           * orphaned rather than being attributed to the wrong account. That is
           * the correct trade: the sweep can delete an orphan, nothing can undo
           * a misattributed invoice.
           */
          throw new Error(
            "upload callback missing server-derived tokenPayload",
          );
        }

        await deps.recordUpload({
          accountId: context.accountId,
          userId: context.userId,
          purpose: context.purpose,
          pathname: blob.pathname,
          url: blob.url,
          contentType: blob.contentType,
        });
      },
    });

    /**
     * Returned verbatim. For the token branch this JSON is what the browser's
     * `upload()` call is waiting for; reshaping it breaks the client.
     */
    return Response.json(result);
  } catch (error) {
    /**
     * 400, not 500. Every path into this catch is a rejected request: a bad
     * body, an unauthenticated caller, or a pathname the policy refused. A 500
     * puts a policy decision in the error budget and a stack trace in the
     * response.
     */
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "upload request rejected",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  return handleUploadRequest(request, resolveDeps());
}

function resolveDeps(): Deps {
  throw new Error("wire handleUploadRequest to your session and uploads table");
}

/**
 * The reconciliation the callback cannot provide. Run it on a schedule.
 *
 * ```ts
 * import { del, list } from "@vercel/blob";
 *
 * export async function reconcileOrphans(
 *   accountId: string,
 *   knownPathnames: Set<string>,
 *   olderThanMs = 60 * 60 * 1000,
 * ): Promise<number> {
 *   const cutoff = Date.now() - olderThanMs;
 *   let deleted = 0;
 *   let cursor: string | undefined;
 *   do {
 *     const page = await list({ prefix: `accounts/${accountId}/`, cursor });
 *     const orphans = page.blobs.filter(
 *       (b) => b.uploadedAt.getTime() < cutoff && !knownPathnames.has(b.pathname),
 *     );
 *     if (orphans.length > 0) {
 *       await del(orphans.map((b) => b.url));
 *       deleted += orphans.length;
 *     }
 *     cursor = page.hasMore ? page.cursor : undefined;
 *   } while (cursor);
 *   return deleted;
 * }
 * ```
 *
 * The age cutoff is load-bearing: without it the sweep races an upload that is
 * committed but whose callback has not been delivered yet, and deletes a file
 * the user is about to see.
 */
