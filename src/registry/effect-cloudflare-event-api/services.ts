import { Clock, Context, Effect, Layer, Schema } from "effect";
import {
  type CreateEventInput,
  EventId,
  EventIdGenerationError,
  EventNotFoundError,
  EventStoreError,
  StoredEvent,
} from "./domain";

const keyFor = (id: EventId) => `event:${id}`;

/** The small portion of Workers KV that this application actually needs. */
export interface EventKvNamespace {
  get(key: string, type: "json"): Promise<unknown | null>;
  put(key: string, value: string): Promise<void>;
}

export interface CloudflareEnvShape {
  readonly EVENTS: EventKvNamespace;
}

export interface CloudflareExecutionContextShape {
  waitUntil(promise: Promise<unknown>): void;
}

export class CloudflareEnv extends Context.Service<
  CloudflareEnv,
  CloudflareEnvShape
>()("@blank/CloudflareEnv") {}

export class CloudflareExecutionContext extends Context.Service<
  CloudflareExecutionContext,
  CloudflareExecutionContextShape
>()("@blank/CloudflareExecutionContext") {}

export interface EventStoreShape {
  readonly put: (event: StoredEvent) => Effect.Effect<void, EventStoreError>;
  readonly get: (
    id: EventId,
  ) => Effect.Effect<StoredEvent, EventNotFoundError | EventStoreError>;
}

export const makeEventStore = (env: CloudflareEnvShape): EventStoreShape => {
  const put = Effect.fn("EventStore.put")(function* (event: StoredEvent) {
    const value = yield* Effect.try({
      try: () => JSON.stringify(event),
      catch: (cause) => new EventStoreError({ operation: "encode", cause }),
    });

    yield* Effect.tryPromise({
      try: () => env.EVENTS.put(keyFor(event.id), value),
      catch: (cause) => new EventStoreError({ operation: "write", cause }),
    });
  });

  const get = Effect.fn("EventStore.get")(function* (id: EventId) {
    const value = yield* Effect.tryPromise({
      try: () => env.EVENTS.get(keyFor(id), "json"),
      catch: (cause) => new EventStoreError({ operation: "read", cause }),
    });

    if (value === null) {
      return yield* new EventNotFoundError({ id });
    }

    return yield* Schema.decodeUnknownEffect(StoredEvent)(value).pipe(
      Effect.mapError(
        (cause) => new EventStoreError({ operation: "decode", cause }),
      ),
    );
  });

  return { put, get };
};

export class EventStore extends Context.Service<EventStore, EventStoreShape>()(
  "@blank/EventStore",
  {
    make: Effect.map(CloudflareEnv, makeEventStore),
  },
) {
  static readonly layer = Layer.effect(EventStore, EventStore.make);
}

export interface EventIdGeneratorShape {
  readonly next: Effect.Effect<EventId, EventIdGenerationError>;
}

export const makeEventIdGenerator = (): EventIdGeneratorShape => ({
  next: Effect.try({
    try: () => crypto.randomUUID(),
    catch: (cause) => new EventIdGenerationError({ cause }),
  }).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(EventId)),
    Effect.mapError((cause) => new EventIdGenerationError({ cause })),
  ),
});

export class EventIdGenerator extends Context.Service<
  EventIdGenerator,
  EventIdGeneratorShape
>()("@blank/EventIdGenerator", {
  make: Effect.sync(makeEventIdGenerator),
}) {
  static readonly layer = Layer.effect(EventIdGenerator, EventIdGenerator.make);
}

export interface EventServiceShape {
  readonly create: (
    input: CreateEventInput,
  ) => Effect.Effect<StoredEvent, EventIdGenerationError | EventStoreError>;
  readonly findById: (
    id: EventId,
  ) => Effect.Effect<StoredEvent, EventNotFoundError | EventStoreError>;
}

export const makeEventService = (
  store: EventStoreShape,
  ids: EventIdGeneratorShape,
): EventServiceShape => {
  const create = Effect.fn("EventService.create")(function* (
    input: CreateEventInput,
  ) {
    const id = yield* ids.next;
    const currentTimeMillis = yield* Clock.currentTimeMillis;
    const event: StoredEvent = {
      id,
      type: input.type,
      data: input.data,
      createdAt: new Date(currentTimeMillis).toISOString(),
    };

    yield* store.put(event);
    yield* Effect.logInfo("Event created", {
      eventId: event.id,
      eventType: event.type,
    });
    return event;
  });

  const findById = Effect.fn("EventService.findById")(function* (id: EventId) {
    return yield* store.get(id);
  });

  return { create, findById };
};

export class EventService extends Context.Service<
  EventService,
  EventServiceShape
>()("@blank/EventService", {
  make: Effect.gen(function* () {
    const store = yield* EventStore;
    const ids = yield* EventIdGenerator;
    return makeEventService(store, ids);
  }),
}) {
  static readonly layer = Layer.effect(EventService, EventService.make).pipe(
    Layer.provide(Layer.merge(EventStore.layer, EventIdGenerator.layer)),
  );
}

export interface BackgroundTasksShape {
  readonly schedule: (
    name: string,
    task: Effect.Effect<void, unknown>,
  ) => Effect.Effect<void>;
}

export const makeBackgroundTasks = (
  context: CloudflareExecutionContextShape,
): BackgroundTasksShape => {
  const schedule = Effect.fn("BackgroundTasks.schedule")(
    (name: string, task: Effect.Effect<void, unknown>) =>
      Effect.sync(() => {
        const supervised = task.pipe(
          Effect.annotateLogs({ backgroundTask: name }),
          Effect.catchCause((cause) =>
            Effect.logError("Background task failed", cause),
          ),
        );
        context.waitUntil(Effect.runPromise(supervised));
      }),
  );

  return { schedule };
};

export class BackgroundTasks extends Context.Service<
  BackgroundTasks,
  BackgroundTasksShape
>()("@blank/BackgroundTasks", {
  make: Effect.map(CloudflareExecutionContext, makeBackgroundTasks),
}) {
  static readonly layer = Layer.effect(BackgroundTasks, BackgroundTasks.make);
}
