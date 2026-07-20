import { strict as assert } from "node:assert";
import type { PoolClient } from "pg";

/**
 * Keyset pagination (the "seek method") over plain Postgres, with an opaque
 * validated cursor. Replaces OFFSET.
 *
 * Two independent reasons OFFSET is the wrong tool, both from use-the-index-luke:
 *
 * 1. It does not skip work, it discards work. The rows before the offset are
 *    still read: "the database must still fetch these rows from the disk and
 *    bring them in order before it can send the following ones". Cost is a
 *    function of how deep the page is, so page 500 is expensive in a way page 1
 *    never showed in staging.
 * 2. It is wrong under concurrent writes. A row inserted ahead of the window
 *    between two requests shifts every later row down by one, so the reader
 *    sees one entry twice and never sees another at all. "the idea to use the
 *    number of rows seen to skip over them later is simply wrong" once the
 *    underlying set can change. An export loop built on OFFSET silently drops
 *    records, and nothing in the result signals it.
 *
 * The seek method anchors on the last row actually delivered rather than on a
 * count of rows skipped, so an insert elsewhere in the table cannot move the
 * boundary. The shape, verbatim from the source:
 *
 *   CREATE INDEX sl_dtid ON sales (sale_date, sale_id)
 *
 *   SELECT *
 *     FROM sales
 *    WHERE (sale_date, sale_id) < (?, ?)
 *    ORDER BY sale_date DESC, sale_id DESC
 *    FETCH FIRST 10 ROWS ONLY
 *
 * The row-value comparison is load bearing and is not the same query as
 * `sale_date < ? OR (sale_date = ? AND sale_id < ?)`. Postgres has "proper
 * support of row value predicates and uses them to access the index", so
 * `(a, b) < (?, ?)` becomes an index access predicate and the scan starts at
 * the cursor position instead of filtering from the top. This is not portable
 * comfort: the same page notes SQL Server 2017 has no row values at all,
 * Oracle rejects range operators on them (ORA-01796), and MySQL evaluates them
 * correctly but "cannot use them as access predicate during an index access".
 * On Postgres it is the fast path; do not expand it back into OR form.
 *
 * A tiebreaker column is required, not decorative. Sorting on `occurred_at`
 * alone leaves rows sharing a timestamp in an undefined order between calls,
 * and any of them can be delivered twice or skipped. The primary key is the
 * cheapest unique tiebreaker and it is already in the index.
 *
 * ---------------------------------------------------------------------------
 * Required index. Without it this is a full sort per page and strictly worse
 * than OFFSET:
 *
 *   CREATE INDEX events_occurred_at_id_desc ON events (occurred_at DESC, id DESC);
 *
 * A plain `(occurred_at, id)` index also serves this query, because Postgres
 * can walk a btree backwards. The explicit DESC pair is written out anyway so
 * the index and the ORDER BY read identically, which is what stops someone
 * later from changing one direction and quietly losing the index scan. Column
 * order must match the ORDER BY; `(id, occurred_at)` does not work here.
 *
 * ---------------------------------------------------------------------------
 * The SQL below is literal on purpose. Table and column names cannot be bound
 * as parameters, so a "generic" version would have to interpolate identifiers
 * from its caller and that is a SQL injection surface introduced to save a
 * copy and paste. Change the three identifiers (`events`, `occurred_at`, `id`)
 * to match the table, keep the structure.
 */

export type EventRow = {
  id: string;
  occurred_at: Date;
  kind: string;
  payload: unknown;
};

export type EventPage = {
  rows: EventRow[];
  /** Pass back verbatim to get the next page. `null` means the scan is done. */
  nextCursor: string | null;
};

/** Decoded cursor: the sort key and tiebreaker of the last row delivered. */
export type CursorTuple = { occurredAt: string; id: string };

export class InvalidCursorError extends Error {
  constructor(reason: string) {
    // Never echo the offending cursor. It arrives from the client, and an
    // error string that reflects it back becomes the payload carrier for
    // anything downstream that renders or logs errors unescaped.
    super(`invalid cursor: ${reason}`);
    this.name = "InvalidCursorError";
  }
}

/**
 * Encode the last row of a page as an opaque base64url cursor.
 *
 * Opaque is a deliberate contract, not obfuscation: an offset integer invites
 * clients to synthesize page numbers, and once they do the seek method cannot
 * be kept correct. Nothing here is secret. If the cursor must not be
 * modifiable at all, append an HMAC over this string and verify it in
 * `decodeCursor` before parsing; the validation below assumes it can be
 * tampered with, and rejects rather than trusts.
 *
 * `toISOString` is UTC with millisecond precision. Postgres `timestamptz`
 * stores microseconds, so two rows inside the same millisecond can serialize
 * to the same cursor timestamp. The `id` tiebreaker still separates them under
 * the row-value comparison, so paging stays correct. If the sort column is
 * microsecond-dense, select it as text (`to_char`) and carry that instead of
 * round-tripping through `Date`.
 */
export function encodeCursor(
  row: Pick<EventRow, "id" | "occurred_at">,
): string {
  const payload = JSON.stringify([row.occurred_at.toISOString(), row.id]);
  return Buffer.from(payload, "utf8").toString("base64url");
}

/** RFC 4122 textual UUID. `id` is bound as a parameter and cast to `uuid`. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BASE64URL = /^[A-Za-z0-9_-]+$/;
/** A well-formed cursor is well under 100 bytes. Bound the work before doing any. */
const MAX_CURSOR_LENGTH = 512;

/**
 * Decode and fully validate a client-supplied cursor.
 *
 * This is a trust boundary. The cursor comes off a query string, so every
 * field is attacker-controlled and every step below rejects instead of
 * repairing. Both values end up as bound parameters, never interpolated, so
 * this is defence in depth rather than the only defence; the point is to turn
 * junk into one 400 here instead of a Postgres `22007` or `22P02` surfacing as
 * a 500 from deep inside the query path.
 *
 * Order matters. Length is checked before decoding, and the charset is checked
 * before `Buffer.from`, because `Buffer.from(s, "base64url")` silently ignores
 * characters outside the alphabet rather than failing. Skipping that check
 * means two different cursor strings can decode to the same tuple, which is
 * exactly the kind of aliasing that makes a cursor forgeable when someone
 * later signs it.
 */
export function decodeCursor(raw: unknown): CursorTuple {
  if (typeof raw !== "string" || raw.length === 0)
    throw new InvalidCursorError("not a string");
  if (raw.length > MAX_CURSOR_LENGTH) throw new InvalidCursorError("too long");
  if (!BASE64URL.test(raw)) throw new InvalidCursorError("not base64url");

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    throw new InvalidCursorError("undecodable");
  }

  if (!Array.isArray(parsed) || parsed.length !== 2)
    throw new InvalidCursorError("bad shape");
  const [occurredAt, id] = parsed;
  if (typeof occurredAt !== "string" || typeof id !== "string") {
    throw new InvalidCursorError("bad field types");
  }
  // Reject before Postgres has to. An unparseable timestamp is a query error,
  // not an empty page, and it would arrive as a 500 with no useful cause.
  if (Number.isNaN(Date.parse(occurredAt)))
    throw new InvalidCursorError("bad timestamp");
  if (!UUID.test(id)) throw new InvalidCursorError("bad id");

  return { occurredAt, id };
}

const MAX_LIMIT = 200;

/**
 * Fetch one page, newest first.
 *
 * Two statements rather than one with a nullable cursor: the first page has no
 * anchor, and `WHERE ($1::timestamptz IS NULL OR (occurred_at, id) < (...))`
 * hides the row-value predicate behind an OR that the planner cannot use as an
 * access predicate, which loses the index scan that is the entire reason for
 * this pattern.
 *
 * `FETCH FIRST n ROWS ONLY` is the SQL:2008 spelling of `LIMIT n` and compiles
 * to the same plan. The count is parenthesised because the standard permits
 * only "a literal constant, a parameter, or a variable name" there; Postgres
 * allows other expressions "as a PostgreSQL extension, but will generally need
 * to be enclosed in parentheses to avoid ambiguity", and `$1::int` is a cast
 * expression rather than a bare parameter.
 *
 * `limit + 1` rows are requested so the extra row answers "is there a next
 * page" without a second count query. The extra row is dropped before return.
 */
export async function fetchEventPage(
  client: PoolClient,
  options: { cursor?: string | null; limit?: number } = {},
): Promise<EventPage> {
  const limit = Math.min(
    Math.max(Math.trunc(options.limit ?? 50), 1),
    MAX_LIMIT,
  );
  const cursor = options.cursor ? decodeCursor(options.cursor) : null;

  const result = cursor
    ? await client.query<EventRow>(
        `SELECT id, occurred_at, kind, payload
           FROM events
          WHERE (occurred_at, id) < ($1::timestamptz, $2::uuid)
          ORDER BY occurred_at DESC, id DESC
          FETCH FIRST ($3::int) ROWS ONLY`,
        [cursor.occurredAt, cursor.id, limit + 1],
      )
    : await client.query<EventRow>(
        `SELECT id, occurred_at, kind, payload
           FROM events
          ORDER BY occurred_at DESC, id DESC
          FETCH FIRST ($1::int) ROWS ONLY`,
        [limit + 1],
      );

  const hasMore = result.rows.length > limit;
  const rows = hasMore ? result.rows.slice(0, limit) : result.rows;
  const last = rows[rows.length - 1];

  return { rows, nextCursor: hasMore && last ? encodeCursor(last) : null };
}

/**
 * Self-check. Never runs on import. Touches no database, because the cursor
 * codec is the part that takes untrusted input and so the part worth pinning
 * down:
 *
 *   KEYSET_PAGE_SELFCHECK=1 node --experimental-strip-types keyset-page.ts
 */
export function demo(): void {
  const row = {
    id: "0d2f5c1a-9b3e-4a7d-8f61-2c4e6a8b0d13",
    occurred_at: new Date("2026-07-20T11:22:33.444Z"),
  };
  const cursor = encodeCursor(row);
  assert.deepStrictEqual(decodeCursor(cursor), {
    occurredAt: "2026-07-20T11:22:33.444Z",
    id: row.id,
  });
  assert.match(cursor, BASE64URL, "cursor must be URL safe unpadded");

  for (const bad of [
    "",
    null,
    42,
    "not base64!!",
    "a".repeat(MAX_CURSOR_LENGTH + 1),
    Buffer.from("[]").toString("base64url"),
    Buffer.from('["2026-07-20T11:22:33.444Z"]').toString("base64url"),
    Buffer.from('["2026-07-20T11:22:33.444Z", 1]').toString("base64url"),
    Buffer.from(
      '["yesterday", "0d2f5c1a-9b3e-4a7d-8f61-2c4e6a8b0d13"]',
    ).toString("base64url"),
    Buffer.from('["2026-07-20T11:22:33.444Z", "1 OR 1=1"]').toString(
      "base64url",
    ),
    Buffer.from("{}").toString("base64url"),
  ]) {
    assert.throws(
      () => decodeCursor(bad),
      InvalidCursorError,
      `should reject: ${String(bad)}`,
    );
  }

  console.log("keyset cursor self-check passed");
}

if (process.env.KEYSET_PAGE_SELFCHECK) demo();
