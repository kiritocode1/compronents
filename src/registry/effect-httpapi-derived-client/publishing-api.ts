/**
 * A content-publishing HTTP API declared once as an Effect 4 HttpApi, so the
 * server, the client, and the OpenAPI document all come from a single source.
 *
 * The problem this replaces. The usual REST service has three artefacts that are
 * supposed to agree and do not: the server routes, a client SDK, and an OpenAPI
 * file that some generator produces from annotations nobody keeps current. Each
 * is edited by a different person at a different time, and the OpenAPI doc is the
 * first to rot because nothing breaks when it is wrong. The result is a spec that
 * describes an API that no longer exists.
 *
 * What an HttpApi gives instead. This file is the declaration: groups of
 * endpoints, each endpoint naming its method, path, path params, payload,
 * success, and errors as schemas. From this one value three things are derived.
 * The server (publishing-server.ts) implements handlers against it. A client is
 * derived from it with no codegen step. And OpenApi.fromApi turns it into an
 * OpenAPI document. Because all three read the same declaration, the doc cannot
 * describe an endpoint the server does not serve, and the client cannot call a
 * path the server does not expose.
 *
 * What the declaration guarantees, and what it does not:
 *
 *   - Everything crossing the boundary is a schema: path params, query, payload,
 *     response, and errors. The framework validates the request against these at
 *     RUNTIME before a handler runs and encodes the response through them on the
 *     way out. A params.id declared Schema.Int arrives at the handler as a number,
 *     because the string from the URL was decoded and a non-integer was rejected
 *     with a 400 before the handler saw it.
 *   - Status codes live on the schema, not the endpoint. An error carries an
 *     httpApiStatus annotation (AlreadyPublished below sets 409 as its third
 *     TaggedErrorClass argument), so the mapping is defined once with the error
 *     and not repeated per route. The prebuilt HttpApiError.NotFound and friends
 *     carry their status already.
 *   - The OpenAPI document is generated from the same schemas, so it is correct by
 *     construction rather than maintained. Regenerate it in CI and it never drifts
 *     from the server.
 *   - Enforcement is two layers. The handler and client types are derived from
 *     this declaration, so a handler returning the wrong shape or a call with the
 *     wrong params does not compile, and the schema validates the same shapes at
 *     runtime as an independent guard against a non-typed caller.
 *
 * Every API is from effect@4.0.0-beta.98:
 * node_modules/effect/src/unstable/httpapi/. The HttpApi layer is largely Tim
 * Smart's work.
 */

import { Schema } from "effect";
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  OpenApi,
} from "effect/unstable/httpapi";

/** A published or draft article. The id and slug are assigned server-side. */
export class Article extends Schema.Class<Article>("BLANK/Publishing/Article")({
  id: Schema.Int,
  slug: Schema.String,
  title: Schema.String,
  body: Schema.String,
  authorId: Schema.String,
  state: Schema.Literals(["draft", "published"]),
  publishedAt: Schema.optional(Schema.DateTimeUtc),
}) {}

/** The body accepted when creating a draft. No id or slug: the server assigns them. */
export class CreateArticle extends Schema.Class<CreateArticle>(
  "BLANK/Publishing/CreateArticle",
)({
  title: Schema.String,
  body: Schema.String,
}) {}

/**
 * A publish was attempted on an article that is already published. A custom
 * tagged error mapped to 409 Conflict by the status annotation on its schema, so
 * the status lives with the error once rather than being restated at each route
 * that can raise it.
 */
export class AlreadyPublished extends Schema.TaggedErrorClass<AlreadyPublished>()(
  "AlreadyPublished",
  { articleId: Schema.Int },
  { httpApiStatus: 409 },
) {}

/**
 * The publishing group. Each endpoint names its path params, payload, success,
 * and errors as schemas. HttpApiError.NotFound and Forbidden are the framework's
 * prebuilt errors and already carry their 404 and 403 statuses.
 */
export const PublishingGroup = HttpApiGroup.make("articles")
  .add(
    HttpApiEndpoint.get("list", "/articles", {
      // A typed query string: state is validated against the literal union, so a
      // handler never sees a state outside the two it knows.
      query: {
        state: Schema.optional(Schema.Literals(["draft", "published"])),
      },
      success: Schema.Array(Article),
    }),
  )
  .add(
    HttpApiEndpoint.get("getById", "/articles/:id", {
      // params.id is Schema.Int: the string in the URL is decoded to a number and
      // a non-integer is a 400 before any handler runs.
      params: { id: Schema.Int },
      success: Article,
      error: HttpApiError.NotFound,
    }),
  )
  .add(
    HttpApiEndpoint.post("createDraft", "/articles", {
      payload: CreateArticle,
      success: Article,
      error: HttpApiError.Forbidden,
    }),
  )
  .add(
    HttpApiEndpoint.post("publish", "/articles/:id/publish", {
      params: { id: Schema.Int },
      success: Article,
      // A union of errors: not found (404), not the author (403), or already
      // published (409). Each carries its own status from its schema.
      error: Schema.Union([
        HttpApiError.NotFound,
        HttpApiError.Forbidden,
        AlreadyPublished,
      ]),
    }),
  );

/**
 * The whole API. Add more groups here as the service grows; each is a named,
 * independently implemented slice of the same declaration.
 */
export const PublishingApi = HttpApi.make("BLANK/PublishingApi").add(
  PublishingGroup,
);

/**
 * The OpenAPI document, derived from the same declaration the server and client
 * use. Serve this at /openapi.json or write it to disk in CI. It is correct by
 * construction: it cannot describe a route the API does not declare.
 */
export const PublishingOpenApi = OpenApi.fromApi(PublishingApi);
