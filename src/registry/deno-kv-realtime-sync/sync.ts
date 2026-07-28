// sync.ts: a tiny realtime table server, multiplayer state sync over plain
// HTTP with zero websocket infrastructure and zero dependencies.
//
// What it is: every table is one KV document. Clients subscribe with
// GET /table/:name (an SSE stream) and mutate with POST /table/:name carrying
// the versionstamp they last saw. Writes go through kv.atomic() with a
// versionstamp check, so concurrent editors get clean optimistic-concurrency
// conflicts (409 with the fresh state) instead of lost updates. Every
// subscriber sees every committed change pushed instantly.
//
// Why Deno makes this trivial: kv.watch() is already a ReadableStream, so the
// SSE response body is literally the watch stream piped through one
// TransformStream; client disconnect cancels the watch automatically through
// stream teardown. KV versionstamps give a total order and a free optimistic
// locking token, so "multiplayer sync" collapses to about 100 lines. On
// Deploy the same code fans out across regions because watch and atomic are
// global.
//
// run:
//   deno run -A --unstable-kv sync.ts               (server on :4120)
//   curl -N http://localhost:4120/table/todo        (subscribe, SSE)
//   curl -X POST http://localhost:4120/table/todo \
//     -d '{"expect":null,"set":{"task1":"buy milk"}}'
//   POST again with "expect" set to the versionstamp from the response; a
//   stale versionstamp returns 409 with the current state.

interface TableDoc {
  rows: Record<string, unknown>;
}

interface Mutation {
  /** Versionstamp the client last saw, or null for "table must not exist". */
  expect: string | null;
  set?: Record<string, unknown>;
  delete?: string[];
}

const tableKey = (name: string): Deno.KvKey => ["table", name];

function sseEvent(entry: {
  value: TableDoc | null;
  versionstamp: string | null;
}): string {
  return `event: table\ndata: ${JSON.stringify({
    versionstamp: entry.versionstamp,
    rows: entry.value?.rows ?? {},
  })}\n\n`;
}

/** SSE stream of table state: initial snapshot, then a push per commit. */
export function streamTable(kv: Deno.Kv, name: string): Response {
  const body = kv
    .watch<[TableDoc]>([tableKey(name)])
    .pipeThrough(
      new TransformStream<[Deno.KvEntryMaybe<TableDoc>], string>({
        transform([entry], controller) {
          controller.enqueue(sseEvent(entry));
        },
      }),
    )
    .pipeThrough(new TextEncoderStream());
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
    },
  });
}

/** Apply an optimistic mutation. Returns the HTTP response to send. */
export async function mutateTable(
  kv: Deno.Kv,
  name: string,
  m: Mutation,
): Promise<Response> {
  const cur = await kv.get<TableDoc>(tableKey(name));
  if (cur.versionstamp !== m.expect) {
    return Response.json(
      {
        error: "version conflict, rebase on current state",
        versionstamp: cur.versionstamp,
        rows: cur.value?.rows ?? {},
      },
      { status: 409 },
    );
  }
  const rows = { ...(cur.value?.rows ?? {}), ...(m.set ?? {}) };
  for (const k of m.delete ?? []) delete rows[k];
  const res = await kv
    .atomic()
    .check({ key: tableKey(name), versionstamp: cur.versionstamp })
    .set(tableKey(name), { rows } satisfies TableDoc)
    .commit();
  if (!res.ok) {
    // Lost the race between our read and our write: same contract as above.
    const fresh = await kv.get<TableDoc>(tableKey(name));
    return Response.json(
      {
        error: "version conflict, rebase on current state",
        versionstamp: fresh.versionstamp,
        rows: fresh.value?.rows ?? {},
      },
      { status: 409 },
    );
  }
  return Response.json({ versionstamp: res.versionstamp, rows });
}

export function tableServer(kv: Deno.Kv): Deno.ServeHandler {
  return async (req) => {
    const match = new URLPattern({ pathname: "/table/:name" }).exec(req.url);
    if (!match) return new Response("not found\n", { status: 404 });
    const name = match.pathname.groups.name!;
    if (req.method === "GET") return streamTable(kv, name);
    if (req.method === "POST") {
      let m: Mutation;
      try {
        m = await req.json();
        if (typeof m !== "object" || m === null || !("expect" in m)) {
          throw new Error("missing expect");
        }
      } catch {
        return Response.json(
          { error: 'body must be JSON: {"expect", "set"?, "delete"?}' },
          { status: 400 },
        );
      }
      return mutateTable(kv, name, m);
    }
    return new Response("method not allowed\n", { status: 405 });
  };
}

if (import.meta.main) {
  const kv = await Deno.openKv();
  Deno.serve({ port: 4120 }, tableServer(kv));
}
