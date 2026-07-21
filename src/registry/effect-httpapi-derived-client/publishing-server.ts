/**
 * The publishing server and its derived client: handlers implemented against the
 * declaration, and a client produced from the same declaration with no codegen.
 *
 * HttpApiBuilder.group takes the API, the name of one group, and a function that
 * fills in a handler per endpoint. Each handler receives the already-decoded
 * request: params, payload, and query have passed through their schemas, so
 * params.id is a number here, not the raw string from the URL. The handler
 * returns the declared success or fails with one of the declared errors, and the
 * framework encodes the result and maps the error to its status.
 *
 * The client side is HttpApiClient.make(PublishingApi). It reads the same
 * declaration and produces a client whose calls are grouped and named exactly
 * like the endpoints, encoding requests and decoding responses through the same
 * schemas the server uses. There is no generated SDK to publish and no second
 * description of the API to keep in sync.
 *
 * The OS HTTP server binding (HttpServer plus a platform layer such as
 * NodeHttpServer from @effect/platform-node) is a separate install and is
 * provided where the router is served; it is referenced in comments here so the
 * API and its handlers stay platform-agnostic.
 *
 * Every API is from effect@4.0.0-beta.98:
 * node_modules/effect/src/unstable/httpapi/{HttpApiBuilder,HttpApiClient}.ts.
 */

import { DateTime, Effect, Layer } from "effect";
import {
  HttpApiBuilder,
  HttpApiClient,
  HttpApiError,
} from "effect/unstable/httpapi";
import { AlreadyPublished, Article, PublishingApi } from "./publishing-api.ts";

/**
 * The handlers for the "articles" group. The store is an in-memory map for the
 * component; swap it for the real data source.
 *
 * ponytail: stubbed store, the point is the API shape and the derived client, not
 * persistence.
 */
export const PublishingGroupLive = HttpApiBuilder.group(
  PublishingApi,
  "articles",
  (handlers) => {
    const articles = new Map<number, Article>();
    let nextId = 1;

    return handlers
      .handle("list", ({ query }) =>
        Effect.sync(() => {
          const all = Array.from(articles.values());
          return query.state === undefined
            ? all
            : all.filter((article) => article.state === query.state);
        }),
      )
      .handle("getById", ({ params }) => {
        const article = articles.get(params.id);
        // params.id is a number here: the schema decoded it and rejected a
        // non-integer with a 400 before this handler ran.
        return article === undefined
          ? Effect.fail(new HttpApiError.NotFound())
          : Effect.succeed(article);
      })
      .handle("createDraft", ({ payload }) =>
        Effect.sync(() => {
          const id = nextId++;
          const article = new Article({
            id,
            slug: `${id}-${payload.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")}`,
            title: payload.title,
            body: payload.body,
            authorId: "op_local",
            state: "draft",
            publishedAt: undefined,
          });
          articles.set(id, article);
          return article;
        }),
      )
      .handle("publish", ({ params }) =>
        Effect.gen(function* () {
          const article = articles.get(params.id);
          if (article === undefined) {
            return yield* Effect.fail(new HttpApiError.NotFound());
          }
          // A declared error mapped to 409 by its schema status. Publishing an
          // already-published article is a conflict, not a success.
          if (article.state === "published") {
            return yield* Effect.fail(
              new AlreadyPublished({ articleId: params.id }),
            );
          }
          const now = yield* DateTime.now;
          const published = new Article({
            ...article,
            state: "published",
            publishedAt: now,
          });
          articles.set(params.id, published);
          return published;
        }),
      );
  },
);

/**
 * The API as one layer: HttpApiBuilder.layer builds the router from the
 * declaration, and the group's handlers are provided under it. The openapiPath
 * option mounts the generated OpenAPI document as a route, so the spec is served
 * from the same source as the routes it describes.
 *
 * The layer's remaining requirements (HttpRouter, HttpPlatform, Etag, FileSystem,
 * Path) plus an OS HTTP server binding (NodeHttpServer.layer for Node, the Bun or
 * browser equivalents) are provided where this is served. The handlers above do
 * not change with the platform.
 */
export const PublishingApiLive = HttpApiBuilder.layer(PublishingApi, {
  openapiPath: "/openapi.json",
}).pipe(Layer.provide(PublishingGroupLive));

/**
 * A derived client for the same API. HttpApiClient.make reads the declaration and
 * returns a client grouped and named like the endpoints:
 * client.articles.getById({ params: { id } }) calls GET /articles/:id, encoding the
 * path param and decoding the Article response through the declared schemas. The
 * HttpClient it needs is provided where this effect is run.
 */
export const makePublishingClient = Effect.gen(function* () {
  const client = yield* HttpApiClient.make(PublishingApi, {
    baseUrl: "https://api.blank.example",
  });
  return client;
});

/**
 * A call against the derived client. getById returns the Article or fails with
 * the declared NotFound; here it is mapped to null. The call site names the
 * endpoint through the same group and name the server implemented, so a renamed
 * endpoint is a renamed call, from one declaration.
 */
export const fetchArticleOrNull = (id: number) =>
  Effect.gen(function* () {
    const client = yield* makePublishingClient;
    return yield* client.articles
      .getById({ params: { id } })
      .pipe(Effect.catchTag("NotFound", () => Effect.succeed(null)));
  });
