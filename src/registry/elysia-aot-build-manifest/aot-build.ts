import { aot } from "elysia/plugin/aot/bun";

/**
 * Elysia 2.0 build-time AOT compilation.
 *
 * New in the elysia@2.0.0-exp line (module `elysia/plugin/aot/*`, absent from
 * 1.4.x). Elysia has always JIT compiled every route handler on boot with
 * Sucrose. The AOT plugin moves that work into the bundler: it replays the
 * app at build time, freezes the generated handlers and validators into a
 * manifest module, and can then stub out the entire JIT graph so the bundler
 * dead code eliminates it.
 *
 * What you get: no compile pass on cold start, and a materially smaller
 * bundle once Sucrose, the handler codegen, and unused TypeBox constructors
 * are dropped. Measured on elysia@2.0.0-exp.46 with a two route app, minified,
 * target bun: 392,129 bytes without the plugin, 133,671 bytes with the config
 * below. The stripped bundle still validates and still returns 422 on a bad
 * body, because the validators are baked rather than removed.
 *
 * Sibling entry points, all taking the same `ElysiaAotOptions`:
 *   elysia/plugin/aot/bun       -> BunPlugin, for Bun.build
 *   elysia/plugin/aot/vite      -> Vite plugin (build only, dev stays JIT)
 *   elysia/plugin/aot/esbuild   -> esbuild plugin
 *   elysia/plugin/aot/rspack    -> native rspack plugin
 *   elysia/plugin/aot/unplugin  -> raw `aotFactory`, wrap with your own
 *                                  `createUnplugin` for rollup/webpack/farm
 *
 * Run this file with `bun run aot-build.ts`.
 */

const entry = "src/index.ts";

await Bun.build({
  entrypoints: [entry],
  outdir: "dist",
  target: "bun",
  minify: true,
  plugins: [
    // The entry must be the module that EXPORTS the Elysia app, because the
    // plugin imports and replays it. Relative paths resolve from the nearest
    // package.json, not from this file.
    aot(entry, {
      // Replace `import { t } from 'elysia'` with `import * as t from
      // 'elysia/type'` so unused TypeBox constructors tree-shake. Default true.
      treeShake: true,

      // Stub the runtime handler compiler with a throwing stub so the bundler
      // can drop the JIT graph entirely. 'auto' (the default) replays a frozen
      // build first and only stubs when it proves no route still reaches
      // handler JIT. Set `true` to make an incomplete manifest a build error
      // instead of a silent fallback, which is what you want in CI.
      strip: true,

      // Bake `isProduction` to a compile-time `true` so the verbose dev error
      // branches DCE. Default true.
      production: true,

      // Group validator construction into lazily materialized thunks. Handlers
      // stay eager; only validators defer. Worth it for large route tables
      // where startup cost matters more than first-request latency in cold
      // groups. Pass a number to set the group size explicitly.
      lazy: 64,
    }),
  ],
});

// Bun keeps the process alive after a build with plugins, so exit explicitly.
process.exit(0);

/**
 * Cross target builds.
 *
 * `target` controls which build-time constants get baked into the response
 * header path, and it aliases `adapter/constants` so only the matching adapter
 * ships. Setting it to an unambiguous runtime lets the other adapter DCE.
 * Leave it unset to preserve the runtime `isBun` check.
 *
 * This is how you build a Cloudflare Workers bundle from a Bun toolchain:
 * the compilation runs under Bun, but the emitted manifest is valid on workerd.
 */
export const workersBuild = () =>
  Bun.build({
    entrypoints: [entry],
    outdir: "dist/workers",
    plugins: [
      aot(entry, {
        target: "workerd",
        strip: true,
        production: true,

        // The generated manifest imports `Compiled` from this specifier and it
        // MUST resolve to the same elysia instance the app runs, or handler
        // registration silently targets a different module graph. Override
        // only when your bundle aliases elysia (monorepo, vendored copy).
        registerFrom: "elysia",

        // The reconstruct table is pure, so any elysia copy works here.
        reconstructFrom: "elysia/reconstruct",
      }),
    ],
  });
