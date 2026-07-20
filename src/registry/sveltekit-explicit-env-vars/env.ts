// Explicit, schema-validated environment variables for SvelteKit.
//
// SvelteKit's older `$env/static/*` and `$env/dynamic/*` modules decide public versus
// private by string prefix (`PUBLIC_`) and hand you untyped strings. The explicit system
// replaces that with one declared manifest: every variable states its visibility, whether
// it is inlined at build time, and a validator that runs once at startup.
//
// Requires @sveltejs/kit >= 2.70.0 and this flag, still experimental at 2.70.1:
//
//   // svelte.config.js
//   export default {
//     kit: { experimental: { explicitEnvironmentVariables: true } }
//   };
//
// Version notes that matter here:
//   2.63.0 (2026-06-02) shipped explicit env vars; `defineEnvVars` lived in `@sveltejs/kit`.
//   2.70.0 (2026-07-17) moved `defineEnvVars` to `@sveltejs/kit/env`. The old import
//                       still resolves but is marked deprecated in the type definitions.
//
// This file MUST live at `src/env.ts` and MUST export a binding named `variables`.
// SvelteKit reads it to generate `$app/env/public` and `$app/env/private`.

import type { StandardSchemaV1 } from "@standard-schema/spec";
import { defineEnvVars } from "@sveltejs/kit/env";

/**
 * Minimal Standard Schema validators. Any Standard Schema library (Valibot, Zod 4,
 * ArkType) drops in here unchanged; these exist so the snippet adds no runtime dependency.
 *
 * `EnvVarConfig.schema` is typed `StandardSchemaV1<string | undefined, T>`: input is always
 * the raw string (or `undefined` when unset), output is whatever you parse it into.
 */
function envSchema<T>(
  name: string,
  parse: (raw: string) => T,
): StandardSchemaV1<string | undefined, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "blank",
      validate: (value) => {
        if (typeof value !== "string" || value.length === 0) {
          return {
            issues: [{ message: `${name} is required but was not set` }],
          };
        }
        try {
          return { value: parse(value) };
        } catch (cause) {
          const message =
            cause instanceof Error ? cause.message : `${name} is invalid`;
          return { issues: [{ message: `${name}: ${message}` }] };
        }
      },
    },
  };
}

const httpsUrl = (name: string) =>
  envSchema(name, (raw) => {
    const url = new URL(raw);
    if (url.protocol !== "https:") throw new Error("must use https");
    return url.origin;
  });

const boundedInt = (name: string, min: number, max: number) =>
  envSchema(name, (raw) => {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      throw new Error(`must be an integer between ${min} and ${max}`);
    }
    return parsed;
  });

export const variables = defineEnvVars({
  // Defaults are `public: false` and `static: false`, so this is a private variable
  // read from the process environment at boot. Importing it from `$app/env/private`
  // in client-reachable code is a build error, not a runtime leak.
  DATABASE_URL: {
    description: "Postgres connection string for the BLANK registry database",
    schema: envSchema("DATABASE_URL", (raw) => {
      if (!raw.startsWith("postgres://") && !raw.startsWith("postgresql://")) {
        throw new Error("must be a postgres:// or postgresql:// URL");
      }
      return raw;
    }),
  },

  // No schema means "any non-empty string, required at startup". Missing values fail
  // the boot, not the first request that happens to need them.
  REGISTRY_ASSET_ADMIN_TOKEN: {
    description: "Bearer token accepted by the registry asset upload endpoint",
  },

  // `static: true` inlines the build-time value, which lets the bundler dead-code
  // eliminate branches around it. Only set it for values fixed at build time.
  BLANK_ASSET_BASE: {
    public: true,
    static: true,
    description:
      "Origin serving registry assets, for example https://ui.aryank.space",
    schema: httpsUrl("BLANK_ASSET_BASE"),
  },

  // Public and non-static: read at runtime and serialized to the browser with devalue,
  // so the schema output has to be devalue-serializable. A number is.
  BLANK_UPLOAD_CONCURRENCY: {
    public: true,
    description:
      "Parallel asset uploads the browser client is allowed to start",
    schema: boundedInt("BLANK_UPLOAD_CONCURRENCY", 1, 32),
  },
});

// Consume the generated modules, not this file:
//
//   import { DATABASE_URL } from "$app/env/private";   // server-only module
//   import { BLANK_ASSET_BASE } from "$app/env/public";
//
// `DATABASE_URL` is `string`, `BLANK_UPLOAD_CONCURRENCY` is `number`. The `description`
// fields above surface as editor hover documentation on each import.
