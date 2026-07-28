/**
 * Authorization policy for Vercel Blob client uploads: the server-side decision
 * that turns a client-proposed pathname into a scoped, expiring, single
 * content-type capability, or into a refusal.
 *
 * Failure modes solved:
 *
 *   1. THE PATHNAME CANNOT BE REWRITTEN. This is the one that surprises
 *      everybody, and it is visible in the type rather than the prose. In
 *      @vercel/blob 2.6.1, `handleUpload`'s hook is declared as:
 *
 *        onBeforeGenerateToken: (
 *          pathname: string, clientPayload: string | null, multipart: boolean
 *        ) => Promise<
 *          Pick<GenerateClientTokenOptions,
 *            'allowedContentTypes' | 'maximumSizeInBytes' | 'validUntil' |
 *            'addRandomSuffix' | 'allowOverwrite' | 'cacheControlMaxAge' | 'ifMatch'
 *          > & { tokenPayload?: string | null; callbackUrl?: string }
 *        >
 *
 *      `pathname` is in the arguments and NOT in the returned Pick. There is no
 *      supported way to hand back a corrected path. Whatever the browser passed
 *      to `upload(pathname, ...)` is the pathname the token is minted for. The
 *      near-universal shape
 *
 *        onBeforeGenerateToken: async () => ({ allowedContentTypes: ["image/png"] })
 *
 *      therefore authorizes a write to any path in the store, including
 *      `avatars/<some-other-user-id>.png`. It reads as an allowlist and is one
 *      only for content type. The pathname must be validated and REFUSED, since
 *      it cannot be corrected.
 *
 *   2. THE DEFAULTS MAKE A DETERMINISTIC PATHNAME AN OVERWRITE PRIMITIVE.
 *      `addRandomSuffix` defaults to false and `allowOverwrite` defaults to
 *      false (both `@defaultvalue false` in the shipped types). A duplicate
 *      write throws, which is the safe direction, so teams reach for
 *      `allowOverwrite: true` the first time a user re-uploads their avatar.
 *      With that flag set and a client-controlled pathname, one authenticated
 *      user can replace any other user's file, and the blob URL does not
 *      change, so every cache and every embed silently serves the new bytes.
 *      Both modes below are legitimate; only one of them is safe without a
 *      prefix check, and this module makes you say which you are in.
 *
 *   3. THE FILE EXTENSION IS NOT THE CONTENT TYPE. `contentType` is "inferred
 *      from the pathname" by default, and it is the client that chooses both.
 *      A blob served from a public store with `text/html` is a stored XSS on
 *      your blob domain. The token pins exactly one media type, derived
 *      server-side from the purpose, not from what the client asked for.
 *
 *   4. maximumSizeInBytes MEANS TWO DIFFERENT THINGS. On the put options it is
 *      documented as "Currently only enforced client-side for multipart
 *      uploads", which is advisory. The one that matters is the identically
 *      named field on the client token constraints, which is baked into the
 *      capability you sign. Set it there. That the signed constraints are
 *      enforced by the store rather than by the browser is visible in the
 *      package's exported error classes: BlobPathnameMismatchError,
 *      BlobContentTypeNotAllowedError, BlobFileTooLargeError, and
 *      BlobClientTokenExpiredError are one per constraint, and they are thrown
 *      at the store, not by the SDK.
 *
 * Why client uploads at all: per the package README, a server upload goes
 * through your function and "you are limited to the request body your server
 * can handle. Which in case of a Vercel-hosted website is 4.5 MB", while a
 * client upload goes browser to store and "allows you to upload files up to
 * 5 TB". Proxying also bills the bytes twice, ingress to your function and
 * egress from it, and holds an invocation open for the duration of a phone's
 * upload on hotel wifi.
 *
 * Note for authored assets: a build-time or admin upload with a hand-written
 * pathname (`put()` from a script, stable nested names, no random suffix,
 * overwrite on) is a different and correct pattern, because nobody untrusted
 * chose the path. Everything here is about the case where they did.
 *
 * Verified against @vercel/blob 2.6.1 (dist/client.d.ts,
 * dist/create-folder-DAlHaCQ2.d.ts, README.md).
 * Docs: https://vercel.com/docs/vercel-blob/client-upload
 *
 * Run the self-check: `bun run upload-policy.ts`
 */

/** Established by your own auth, never by the request body. */
export type UploadSession = {
  accountId: string;
  userId: string;
  /** Drives the size ceiling baked into the token. */
  maxUploadBytes: number;
};

/**
 * What is being uploaded, chosen from a closed set on the server. The client
 * names a purpose; it does not describe one.
 */
export type UploadPurpose = "avatar" | "invoice-pdf" | "product-photo";

type PurposeRule = {
  /**
   * "stable": the pathname is deterministic so the app can reference it
   * without a database round trip, which means re-uploads must overwrite, which
   * means the prefix check below is the only thing standing between two users.
   *
   * "content-addressed": a random suffix is appended by the platform, so two
   * writes never collide and overwriting is never needed or allowed.
   */
  mode: "stable" | "content-addressed";
  /** Exactly one media type is pinned into the token. */
  contentType: string;
  extension: string;
  maxBytes: number;
};

const PURPOSES: Record<UploadPurpose, PurposeRule> = {
  avatar: {
    mode: "stable",
    contentType: "image/webp",
    extension: ".webp",
    maxBytes: 2 * 1024 * 1024,
  },
  "invoice-pdf": {
    mode: "content-addressed",
    contentType: "application/pdf",
    extension: ".pdf",
    maxBytes: 25 * 1024 * 1024,
  },
  "product-photo": {
    mode: "content-addressed",
    contentType: "image/jpeg",
    extension: ".jpg",
    maxBytes: 12 * 1024 * 1024,
  },
};

function isUploadPurpose(value: unknown): value is UploadPurpose {
  return typeof value === "string" && value in PURPOSES;
}

/**
 * The pathname the client is REQUIRED to have used. Published to the browser by
 * a separate authenticated endpoint (or rendered into the page), so the client
 * knows what to pass to `upload()`. It is still validated here, because a value
 * the client holds is a value the client can change.
 */
export function expectedPathname(
  session: UploadSession,
  purpose: UploadPurpose,
): string {
  const rule = PURPOSES[purpose];
  const leaf =
    rule.mode === "stable"
      ? `${session.userId}${rule.extension}`
      : `${session.userId}/upload${rule.extension}`;
  return `accounts/${session.accountId}/${purpose}/${leaf}`;
}

export type TokenGrant = {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  validUntil: number;
  addRandomSuffix: boolean;
  allowOverwrite: boolean;
  cacheControlMaxAge: number;
  tokenPayload: string;
};

export type PolicyDecision =
  | { ok: true; grant: TokenGrant }
  | { ok: false; code: string; message: string };

const deny = (code: string, message: string): PolicyDecision => ({
  ok: false,
  code,
  message,
});

/**
 * Rejects anything that is not a plain forward-slash relative path made of
 * conservative characters. Run BEFORE the prefix comparison, because a prefix
 * check on its own is defeated by `accounts/acme/avatar/../../other/x.webp`,
 * which starts with the right bytes and resolves somewhere else.
 */
function isSafePathname(pathname: string): boolean {
  if (pathname.length === 0 || pathname.length > 512) return false;
  if (pathname.startsWith("/")) return false;
  if (pathname.includes("//")) return false;
  if (pathname.includes("\\")) return false;
  if (pathname.includes("\0")) return false;
  if (
    pathname.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return false;
  }
  return /^[A-Za-z0-9._/-]+$/.test(pathname);
}

/**
 * The whole decision, as a pure function. Returns the exact object
 * `onBeforeGenerateToken` should spread, or a refusal with a reason worth
 * logging.
 */
export function authorizeUpload(input: {
  session: UploadSession;
  /** First argument handed to onBeforeGenerateToken. Untrusted. */
  pathname: string;
  /** Second argument. Untrusted, arbitrary, and possibly not JSON. */
  clientPayload: string | null;
  multipart: boolean;
  now: number;
  /** How long the capability lives. Kept short on purpose. */
  ttlMs?: number;
}): PolicyDecision {
  const ttlMs = input.ttlMs ?? 10 * 60 * 1000;

  let parsed: unknown;
  try {
    parsed = input.clientPayload ? JSON.parse(input.clientPayload) : null;
  } catch {
    return deny("bad_payload", "clientPayload is not valid JSON");
  }
  const purpose = (parsed as { purpose?: unknown } | null)?.purpose;
  if (!isUploadPurpose(purpose)) {
    return deny(
      "unknown_purpose",
      `purpose must be one of ${Object.keys(PURPOSES).join(", ")}`,
    );
  }
  const rule = PURPOSES[purpose];

  if (!isSafePathname(input.pathname)) {
    return deny(
      "unsafe_pathname",
      `refused pathname ${JSON.stringify(input.pathname)}`,
    );
  }

  /**
   * The check that replaces the rewrite the SDK does not offer. Exact equality,
   * not `startsWith`, because for these purposes the server already knows the
   * only pathname this session is allowed to write.
   */
  const expected = expectedPathname(input.session, purpose);
  if (input.pathname !== expected) {
    return deny(
      "pathname_not_owned",
      `session may only write ${expected}, client asked for ${input.pathname}`,
    );
  }

  /**
   * Belt and braces on top of the extension already fixed by `expected`: the
   * token pins one media type, so a `.webp` pathname carrying an HTML body is
   * rejected by the store rather than served from your blob domain.
   */
  if (!input.pathname.endsWith(rule.extension)) {
    return deny("extension_mismatch", `expected ${rule.extension}`);
  }

  const maximumSizeInBytes = Math.min(
    rule.maxBytes,
    input.session.maxUploadBytes,
  );
  if (maximumSizeInBytes <= 0) {
    return deny("quota_exhausted", "account upload allowance is zero");
  }

  return {
    ok: true,
    grant: {
      allowedContentTypes: [rule.contentType],
      maximumSizeInBytes,
      validUntil: input.now + ttlMs,
      /**
       * Content-addressed purposes get the suffix, so two writes to the same
       * path produce two blobs and nothing is ever replaced. Stable purposes
       * cannot, by definition, and pay for it with `allowOverwrite: true`, which
       * is safe here only because the pathname was proven to belong to this
       * session three checks ago.
       */
      addRandomSuffix: rule.mode === "content-addressed",
      allowOverwrite: rule.mode === "stable",
      cacheControlMaxAge: rule.mode === "stable" ? 60 : 31_536_000,
      /**
       * Server-derived only. This string comes back verbatim in
       * `onUploadCompleted`, which is the only context that handler gets, so
       * anything the client put in `clientPayload` must not survive into it.
       */
      tokenPayload: JSON.stringify({
        accountId: input.session.accountId,
        userId: input.session.userId,
        purpose,
        multipart: input.multipart,
      }),
    },
  };
}

// ---------------------------------------------------------------------------
// self-check
// ---------------------------------------------------------------------------

function demo(): void {
  let failures = 0;
  const check = (label: string, ok: boolean, detail: string) => {
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}: ${detail}`);
  };

  const session: UploadSession = {
    accountId: "acme",
    userId: "u_8412",
    maxUploadBytes: 50 * 1024 * 1024,
  };
  const now = 1_800_000_000_000;
  const call = (pathname: string, purpose: string, multipart = false) =>
    authorizeUpload({
      session,
      pathname,
      clientPayload: JSON.stringify({ purpose }),
      multipart,
      now,
    });

  // The path the browser is supposed to use.
  const avatarPath = expectedPathname(session, "avatar");
  {
    const d = call(avatarPath, "avatar");
    check(
      "own avatar is granted",
      d.ok &&
        d.grant.allowOverwrite &&
        !d.grant.addRandomSuffix &&
        d.grant.allowedContentTypes.length === 1 &&
        d.grant.validUntil === now + 600_000,
      d.ok
        ? `${avatarPath} -> overwrite=${d.grant.allowOverwrite}, suffix=${d.grant.addRandomSuffix}, types=${d.grant.allowedContentTypes.join()}, ttl=10m`
        : `unexpectedly denied: ${d.code}`,
    );
  }

  // The attack the missing rewrite makes possible.
  {
    const d = call("accounts/acme/avatar/u_9999.webp", "avatar");
    check(
      "another user's avatar is refused",
      !d.ok && d.code === "pathname_not_owned",
      d.ok
        ? "GRANTED, which would let one user replace another's avatar in place"
        : d.message,
    );
  }

  // Prefix checks alone are not enough.
  {
    const d = call("accounts/acme/avatar/../../evil/u_8412.webp", "avatar");
    check(
      "traversal inside a correct prefix is refused",
      !d.ok && d.code === "unsafe_pathname",
      d.ok
        ? "GRANTED"
        : `${d.code}: the string starts with accounts/acme/ and resolves elsewhere`,
    );
  }

  // Assorted hostile shapes.
  for (const bad of [
    "/accounts/acme/avatar/u_8412.webp",
    "accounts//acme/avatar/u_8412.webp",
    "accounts\\acme\\avatar\\u_8412.webp",
    "accounts/acme/avatar/u_8412.webp\0.html",
  ]) {
    const d = call(bad, "avatar");
    check(
      `hostile pathname refused: ${JSON.stringify(bad)}`,
      !d.ok,
      d.ok ? "GRANTED" : d.code,
    );
  }

  // Extension swap: right prefix, wrong type, would be served as HTML.
  {
    const d = call("accounts/acme/avatar/u_8412.html", "avatar");
    check(
      "html masquerading as an avatar is refused",
      !d.ok,
      d.ok ? "GRANTED, stored XSS on the blob domain" : d.code,
    );
  }

  // Purpose is a closed set, not a free string.
  {
    const d = call("accounts/acme/backup/db.sql", "backup");
    check(
      "unknown purpose is refused",
      !d.ok && d.code === "unknown_purpose",
      d.ok ? "GRANTED" : d.message,
    );
  }

  // Content-addressed purposes never overwrite.
  {
    const path = expectedPathname(session, "invoice-pdf");
    const d = call(path, "invoice-pdf", true);
    check(
      "invoice upload is content addressed",
      d.ok && d.grant.addRandomSuffix && !d.grant.allowOverwrite,
      d.ok
        ? `${path} -> suffix=${d.grant.addRandomSuffix}, overwrite=${d.grant.allowOverwrite}`
        : `denied: ${d.code}`,
    );
  }

  // The token ceiling is the lower of the plan and the purpose.
  {
    const small = { ...session, maxUploadBytes: 512 * 1024 };
    const d = authorizeUpload({
      session: small,
      pathname: expectedPathname(small, "product-photo"),
      clientPayload: JSON.stringify({ purpose: "product-photo" }),
      multipart: false,
      now,
    });
    check(
      "size ceiling is the lower of plan and purpose",
      d.ok && d.grant.maximumSizeInBytes === 512 * 1024,
      d.ok ? `${d.grant.maximumSizeInBytes} bytes` : `denied: ${d.code}`,
    );
  }

  // Nothing the client said survives into onUploadCompleted.
  {
    const d = authorizeUpload({
      session,
      pathname: avatarPath,
      clientPayload: JSON.stringify({
        purpose: "avatar",
        accountId: "someone-else",
        isAdmin: true,
      }),
      multipart: false,
      now,
    });
    const payload = d.ok ? JSON.parse(d.grant.tokenPayload) : {};
    check(
      "tokenPayload is server derived",
      d.ok && payload.accountId === "acme" && payload.isAdmin === undefined,
      `tokenPayload = ${d.ok ? d.grant.tokenPayload : "denied"}`,
    );
  }

  console.log(
    failures === 0
      ? "upload-policy.ts: all properties verified"
      : `upload-policy.ts: ${failures} check(s) failed`,
  );
  if (failures > 0) process.exit(1);
}

if (import.meta.main) demo();
