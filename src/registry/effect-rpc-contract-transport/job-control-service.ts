/**
 * The job-control server and its derived client: handlers whose types come from
 * the contract, a middleware implementation, and the transport chosen as layers.
 *
 * This file is where the contract in job-control-contract.ts becomes a running
 * service. Three things are assembled:
 *
 *   1. The handlers, via JobControl.toLayer. There is one handler per RPC in the
 *      group, named by tag, each returning the declared success or a declared
 *      error. The handler types are derived from the group, so a handler that
 *      returns the wrong shape does not compile, and the schema validates the same
 *      shapes at the boundary at runtime as a second, independent guard.
 *   2. The auth middleware implementation, via Layer.succeed(OperatorAuth)(...).
 *      The contract declared that OperatorAuth provides CurrentOperator; this is
 *      where that promise is kept, by reading a header and providing the
 *      Operator, or failing the request with the declared Unauthorized error.
 *   3. The transport, as two swappable layers: a protocol (HTTP ndjson here) and
 *      a serialization. Nothing above this line knows which was chosen.
 *
 * Swapping the transport is a change to the layer wiring only. RpcServer's
 * layerProtocolHttp becomes layerProtocolWebsocket, or the client's
 * layerProtocolHttp becomes layerProtocolSocket, and the handlers do not move.
 * The OS-level HTTP server binding (NodeHttpServer from @effect/platform-node,
 * or the Bun and browser equivalents) is a separate install and is provided
 * where this layer is served; it is named in comments rather than imported here
 * so the contract and its handlers stay platform-agnostic.
 *
 * Every API is from effect@4.0.0-beta.98:
 * node_modules/effect/src/unstable/rpc/{RpcServer,RpcClient,RpcSerialization}.ts.
 */

import { DateTime, Effect, Layer, Stream } from "effect";
import { Headers } from "effect/unstable/http";
import { RpcClient, RpcSerialization, RpcServer } from "effect/unstable/rpc";
import {
  CurrentOperator,
  Forbidden,
  Job,
  JobControl,
  JobEvent,
  JobNotFound,
  Operator,
  OperatorAuth,
  Unauthorized,
} from "./job-control-contract.ts";

/**
 * The auth middleware implementation. It runs before every handler. Here it
 * trusts two headers for brevity; a real deployment verifies a signed token.
 * On success it provides CurrentOperator to the wrapped handler; on failure it
 * fails with the Unauthorized error the contract declared, which is what the
 * caller receives typed.
 */
export const OperatorAuthLive = Layer.succeed(OperatorAuth)(
  OperatorAuth.of((handler, options) => {
    const id = Headers.get(options.headers, "x-operator-id");
    if (id._tag === "None") {
      return Effect.fail(
        new Unauthorized({ reason: "missing x-operator-id header" }),
      );
    }
    const operator = new Operator({
      id: id.value,
      email: Headers.get(options.headers, "x-operator-email").pipe((o) =>
        o._tag === "Some" ? o.value : `${id.value}@blank.internal`,
      ),
      canCancel: Headers.get(options.headers, "x-operator-can-cancel").pipe(
        (o) => o._tag === "Some" && o.value === "true",
      ),
    });
    return Effect.provideService(handler, CurrentOperator, operator);
  }),
);

/**
 * The handlers. Each reads its typed payload and returns the declared success or
 * fails with a declared error. CurrentOperator is in scope because OperatorAuth
 * provides it, so a handler reads who is calling without re-authenticating.
 *
 * ponytail: the job store is stubbed in memory; swap forId/the map for the real
 * data source. The point of the component is the contract and transport, not the
 * store.
 */
export const JobControlHandlers = JobControl.toLayer(
  Effect.gen(function* () {
    const jobs = new Map<string, Job>();

    const seed = (job: Job) => jobs.set(job.id, job);
    seed(
      new Job({
        id: "job_export_1",
        kind: "export",
        state: "running",
        attempt: 1,
        enqueuedAt: DateTime.makeUnsafe("2026-07-21T09:00:00Z"),
      }),
    );

    return JobControl.of({
      ListJobs: (payload) =>
        Effect.sync(() => {
          const all = Array.from(jobs.values());
          return payload.state === undefined
            ? all
            : all.filter((job) => job.state === payload.state);
        }),

      GetJob: (payload) => {
        const job = jobs.get(payload.jobId);
        return job === undefined
          ? Effect.fail(new JobNotFound({ jobId: payload.jobId }))
          : Effect.succeed(job);
      },

      CancelJob: Effect.fnUntraced(function* (payload) {
        // CurrentOperator is available because the middleware provided it. A
        // permission check that reads the authenticated caller, expressed as a
        // declared Forbidden error rather than a thrown one.
        const operator = yield* CurrentOperator;
        if (!operator.canCancel) {
          return yield* Effect.fail(new Forbidden({ action: "CancelJob" }));
        }
        const job = jobs.get(payload.jobId);
        if (job === undefined) {
          return yield* Effect.fail(new JobNotFound({ jobId: payload.jobId }));
        }
        const cancelled = new Job({ ...job, state: "cancelled" });
        jobs.set(job.id, cancelled);
        return cancelled;
      }),

      // A streaming handler returns a Stream directly, not an Effect, and the
      // declared error rides in the STREAM's error channel rather than an Effect
      // failure. The client consumes it as a Stream too, so a long-lived event
      // feed is the same contract as a unary call, just with many replies. A
      // JobNotFound fails the stream before it yields anything.
      StreamJobEvents: (payload) =>
        jobs.has(payload.jobId)
          ? Stream.fromEffect(
              DateTime.now.pipe(
                Effect.map(
                  (now) =>
                    new JobEvent({
                      jobId: payload.jobId,
                      at: now,
                      message: "attached to job event stream",
                    }),
                ),
              ),
            )
          : Stream.fail(new JobNotFound({ jobId: payload.jobId })),
    });
  }),
);

/**
 * The server as one layer: handlers, auth, the RPC server runtime, the HTTP
 * ndjson transport. Serve this behind an OS HTTP server binding.
 *
 * To move to WebSocket: replace RpcServer.layerProtocolHttp with
 * RpcServer.layerProtocolWebsocket. To move the wire format: replace
 * RpcSerialization.layerNdjson with layerMsgPack or layerJson. The handlers
 * above are untouched by either change.
 */
export const JobControlServer = RpcServer.layer(JobControl).pipe(
  Layer.provide(JobControlHandlers),
  Layer.provide(OperatorAuthLive),
  Layer.provide(RpcServer.layerProtocolHttp({ path: "/rpc" })),
  Layer.provide(RpcSerialization.layerNdjson),
);

/**
 * A derived client for the same contract. RpcClient.make(JobControl) yields a
 * client whose methods are exactly the group's RPCs, named by tag, sending and
 * receiving through the same schemas the server uses. The transport is the
 * client-side protocol layer, chosen the same way the server's was, and provided
 * where this effect is run. The client methods are typed from the group, so a
 * call with the wrong payload does not compile and the declared errors show up in
 * the call's error channel, matched by tag below.
 */
export const makeJobControlClient = Effect.gen(function* () {
  const client = yield* RpcClient.make(JobControl);
  return client;
});

/**
 * A call against the derived client. JobNotFound is caught with catchTag by its
 * runtime tag, the same tag TaggedErrorClass put on it in the contract: the
 * failure the server declared in the schema is the failure the client branches
 * on by name, with no status-code inspection. The match is a real runtime tag
 * comparison, which is why the error had to be a TaggedErrorClass and not a bare
 * ErrorClass that carries no tag.
 */
export const getJobOrNull = (jobId: string) =>
  Effect.gen(function* () {
    const client = yield* makeJobControlClient;
    return yield* client
      .GetJob({ jobId })
      .pipe(Effect.catchTag("JobNotFound", () => Effect.succeed(null)));
  });
