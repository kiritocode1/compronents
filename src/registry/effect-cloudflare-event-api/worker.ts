/// <reference types="@cloudflare/workers-types" />

import { Context, Effect, Layer, Schema } from "effect";
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";
import {
  CreateEventInput,
  EventId,
  type EventIdGenerationError,
  type EventNotFoundError,
  type EventStoreError,
  InvalidRequestError,
  ResponseEncodingError,
} from "./domain";
import {
  BackgroundTasks,
  type CloudflareEnvShape,
  type CloudflareExecutionContextShape,
  EventService,
  makeBackgroundTasks,
  makeEventIdGenerator,
  makeEventService,
  makeEventStore,
} from "./services";

const json = (body: unknown, status = 200) =>
  HttpServerResponse.json(body, { status }).pipe(
    Effect.mapError((cause) => new ResponseEncodingError({ cause })),
  );

const errorResponse = (status: number, code: string, message: string) =>
  HttpServerResponse.jsonUnsafe({ error: { code, message } }, { status });

const handleApiErrors = Effect.catchTags({
  InvalidRequestError: (error: InvalidRequestError) =>
    Effect.logWarning("Invalid API request", error.cause).pipe(
      Effect.as(errorResponse(400, error._tag, error.message)),
    ),
  EventNotFoundError: (error: EventNotFoundError) =>
    Effect.succeed(
      errorResponse(404, error._tag, `Event ${error.id} was not found`),
    ),
  EventStoreError: (error: EventStoreError) =>
    Effect.logError("Event store failed", error).pipe(
      Effect.as(errorResponse(503, error._tag, "Event storage is unavailable")),
    ),
  EventIdGenerationError: (error: EventIdGenerationError) =>
    Effect.logError("Event ID generation failed", error).pipe(
      Effect.as(errorResponse(500, error._tag, "Could not create the event")),
    ),
  ResponseEncodingError: (error: ResponseEncodingError) =>
    Effect.logError("Response encoding failed", error).pipe(
      Effect.as(
        errorResponse(500, error._tag, "Could not encode the response"),
      ),
    ),
});

const HealthRoute = HttpRouter.add(
  "GET",
  "/health",
  json({ status: "ok" }).pipe(handleApiErrors),
);

const CreateEventRoute = HttpRouter.add(
  "POST",
  "/v1/events",
  Effect.gen(function* () {
    const input = yield* HttpServerRequest.schemaBodyJson(
      CreateEventInput,
    ).pipe(
      Effect.mapError(
        (cause) =>
          new InvalidRequestError({
            message: "Expected a non-empty event type and an object data field",
            cause,
          }),
      ),
    );
    const events = yield* EventService;
    const background = yield* BackgroundTasks;
    const event = yield* events.create(input);

    yield* background.schedule(
      "event-created-audit",
      Effect.logInfo("Event creation audit", { eventId: event.id }),
    );

    return yield* json({ event }, 201);
  }).pipe(handleApiErrors),
);

const GetEventRoute = HttpRouter.add(
  "GET",
  "/v1/events/:id",
  Effect.gen(function* () {
    const { id } = yield* HttpRouter.schemaPathParams(
      // A malformed UUID never reaches EventService.
      Schema.Struct({ id: EventId }),
    ).pipe(
      Effect.mapError(
        (cause) =>
          new InvalidRequestError({
            message: "Event id must be a UUID v4",
            cause,
          }),
      ),
    );
    const events = yield* EventService;
    const event = yield* events.findById(id);
    return yield* json({ event });
  }).pipe(handleApiErrors),
);

const ApiRoutes = Layer.mergeAll(HealthRoute, CreateEventRoute, GetEventRoute);

const { handler } = HttpRouter.toWebHandler(ApiRoutes);

const requestContext = (
  env: CloudflareEnvShape,
  context: CloudflareExecutionContextShape,
) =>
  Context.make(
    EventService,
    makeEventService(makeEventStore(env), makeEventIdGenerator()),
  ).pipe(Context.add(BackgroundTasks, makeBackgroundTasks(context)));

export default {
  fetch: (request, env, context) =>
    handler(request, requestContext(env, context)),
} satisfies ExportedHandler<CloudflareEnvShape>;
