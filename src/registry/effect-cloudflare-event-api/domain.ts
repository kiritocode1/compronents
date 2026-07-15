import { Schema } from "effect";

export const EventId = Schema.String.pipe(
  Schema.check(Schema.isUUID(4)),
  Schema.brand("@blank/EventId"),
);
export type EventId = typeof EventId.Type;

export const CreateEventInput = Schema.Struct({
  type: Schema.NonEmptyString,
  data: Schema.Record(Schema.String, Schema.Unknown),
});
export type CreateEventInput = typeof CreateEventInput.Type;

export const StoredEvent = Schema.Struct({
  id: EventId,
  type: Schema.NonEmptyString,
  data: Schema.Record(Schema.String, Schema.Unknown),
  createdAt: Schema.String,
});
export type StoredEvent = typeof StoredEvent.Type;

export class InvalidRequestError extends Schema.TaggedErrorClass<InvalidRequestError>()(
  "InvalidRequestError",
  {
    message: Schema.String,
    cause: Schema.Defect(),
  },
) {}

export class EventNotFoundError extends Schema.TaggedErrorClass<EventNotFoundError>()(
  "EventNotFoundError",
  { id: EventId },
) {}

export class EventStoreError extends Schema.TaggedErrorClass<EventStoreError>()(
  "EventStoreError",
  {
    operation: Schema.Literals(["read", "write", "encode", "decode"]),
    cause: Schema.Defect(),
  },
) {}

export class EventIdGenerationError extends Schema.TaggedErrorClass<EventIdGenerationError>()(
  "EventIdGenerationError",
  { cause: Schema.Defect() },
) {}

export class ResponseEncodingError extends Schema.TaggedErrorClass<ResponseEncodingError>()(
  "ResponseEncodingError",
  { cause: Schema.Defect() },
) {}
