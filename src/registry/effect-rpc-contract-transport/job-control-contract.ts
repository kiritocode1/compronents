/**
 * An internal job-control API defined once as a schema contract that the client
 * and the server both import, with the transport underneath left swappable.
 *
 * The problem this replaces. A typical internal service is a set of route
 * handlers on one side and a hand-written fetch wrapper on the other, with a
 * types package in the middle that somebody updates when they remember. The
 * contract is implicit: it lives in whatever the handler happens to read off the
 * request and whatever the client happens to send. The two drift, and the drift
 * surfaces at runtime as a field that is undefined in production and was a string
 * in the caller's head.
 *
 * What an RpcGroup gives instead. This file IS the contract, and it is imported
 * unchanged by both the server and the client. Each Rpc.make binds a tag to a
 * payload schema, a success schema, and a typed error schema, in one place, so
 * there is no separate types package to update and no second definition of the
 * wire shape to drift from. The server implements handlers against this group and
 * the client is derived from it, so the shapes that cross the wire have a single
 * author.
 *
 * What the contract guarantees, and what it does not:
 *
 *   - Enforcement is two layers, and both hold. At compile time the handler and
 *     client types are derived from the group, so a handler that returns the
 *     wrong shape or a call with the wrong payload does not type-check. At runtime
 *     the schema validates the boundary independently: a request whose payload
 *     does not decode is rejected before a handler runs, and a reply is encoded
 *     through the success schema on the way out, which also guards the wire
 *     against a peer that is not this codebase.
 *   - Declared errors cross the wire as typed failures carrying their tag.
 *     JobNotFound below is a TaggedErrorClass, so it travels with its _tag intact
 *     and the client matches it with Effect.catchTag by name at runtime, rather
 *     than inspecting a status code. This is the payoff of putting the error in
 *     the schema and giving it a tag.
 *   - A DEFECT is not in the schema and does not travel as data. A bug that
 *     throws something undeclared stays a defect: the server logs it and the
 *     client sees a transport-level failure, not a typed error it can branch on.
 *     Anything a caller is meant to handle must be a declared, tagged error;
 *     anything else is a defect and is meant to page someone.
 *   - The transport is not named here on purpose. HTTP with ndjson, WebSocket, or
 *     a Worker MessagePort are all the same contract with a different protocol
 *     layer, chosen in job-control-service.ts. Nothing in this file changes when
 *     the transport does.
 *   - Middleware runs before handlers and can PROVIDE a service. OperatorAuth
 *     below authenticates the caller and provides CurrentOperator, so every
 *     handler can read the authenticated operator without re-checking a token,
 *     and a failed authentication fails the request with a declared Unauthorized
 *     error at the edge rather than deep in a handler.
 *
 * Every API is from effect@4.0.0-beta.98:
 * node_modules/effect/src/unstable/rpc/{Rpc,RpcGroup,RpcMiddleware}.ts. The RPC
 * layer is largely Tim Smart's work.
 */

import { Context, Schema } from "effect";
import { Rpc, RpcGroup, RpcMiddleware } from "effect/unstable/rpc";

/** The authenticated operator a request runs as, provided by the auth middleware. */
export class Operator extends Schema.Class<Operator>(
  "BLANK/JobControl/Operator",
)({
  id: Schema.String,
  email: Schema.String,
  /** Operators without this cannot cancel jobs, only read them. */
  canCancel: Schema.Boolean,
}) {}

/** The service handlers read to learn who is calling. Populated by OperatorAuth. */
export class CurrentOperator extends Context.Service<
  CurrentOperator,
  Operator
>()("BLANK/JobControl/CurrentOperator") {}

/** A snapshot of one background job. */
export class Job extends Schema.Class<Job>("BLANK/JobControl/Job")({
  id: Schema.String,
  kind: Schema.Literals(["export", "reindex", "invoice-run"]),
  state: Schema.Literals([
    "queued",
    "running",
    "succeeded",
    "failed",
    "cancelled",
  ]),
  attempt: Schema.Int,
  enqueuedAt: Schema.DateTimeUtc,
}) {}

/** One line of a job's live event stream. */
export class JobEvent extends Schema.Class<JobEvent>(
  "BLANK/JobControl/JobEvent",
)({
  jobId: Schema.String,
  at: Schema.DateTimeUtc,
  message: Schema.String,
}) {}

/**
 * The requested job id does not exist. A declared, tagged error: TaggedErrorClass
 * auto-populates a `_tag` of "JobNotFound", which is the discriminant the client
 * matches on with Effect.catchTag. A plain ErrorClass carries no `_tag`, so
 * catchTag would have nothing to match and would silently never fire; the tag is
 * what makes typed error handling across the wire real rather than decorative.
 */
export class JobNotFound extends Schema.TaggedErrorClass<JobNotFound>()(
  "JobNotFound",
  { jobId: Schema.String },
) {}

/** The operator is authenticated but not allowed to perform this action. */
export class Forbidden extends Schema.TaggedErrorClass<Forbidden>()(
  "Forbidden",
  { action: Schema.String },
) {}

/** The caller could not be authenticated at all. Raised by the middleware. */
export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  { reason: Schema.String },
) {}

/**
 * Authentication middleware. It runs before every handler, provides
 * CurrentOperator on success, and fails the whole request with Unauthorized on
 * failure. requiredForClient: true declares that the client side participates in
 * the middleware too, so the credential is attached at the edge and an
 * unauthenticated call fails there rather than deep inside a handler.
 */
export class OperatorAuth extends RpcMiddleware.Service<
  OperatorAuth,
  {
    provides: CurrentOperator;
  }
>()("BLANK/JobControl/OperatorAuth", {
  error: Unauthorized,
  requiredForClient: true,
}) {}

/**
 * The job-control contract. StreamJobEvents is a streaming RPC (stream: true):
 * the server replies with a stream of JobEvent values rather than a single
 * value, and the client consumes it as a Stream. Every RPC in the group is
 * guarded by OperatorAuth via .middleware at the end.
 */
export const JobControl = RpcGroup.make(
  Rpc.make("ListJobs", {
    success: Schema.Array(Job),
    payload: { state: Schema.optional(Schema.String) },
  }),
  Rpc.make("GetJob", {
    success: Job,
    error: JobNotFound,
    payload: { jobId: Schema.String },
  }),
  Rpc.make("CancelJob", {
    success: Job,
    error: Schema.Union([JobNotFound, Forbidden]),
    payload: { jobId: Schema.String, reason: Schema.String },
  }),
  Rpc.make("StreamJobEvents", {
    success: JobEvent,
    error: JobNotFound,
    payload: { jobId: Schema.String },
    stream: true,
  }),
).middleware(OperatorAuth);
