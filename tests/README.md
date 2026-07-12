# Registry tests

Verifies every item in `src/lib/registry.ts` is genuinely shadcn-installable and
that what the site shows matches what installs. No test framework: plain
`node --test` (Node 22 type-strips `registry.ts` directly).

`pnpm test` runs the two offline suites below. `pnpm test:install` runs the
live one.

## `registry-integrity.test.mjs` — offline

Per registry item, without a server:

- **catalog** is well-formed (unique names, valid types, non-empty).
- **installs cleanly**: every `files[].path` exists on disk, targets are unique,
  every relative import resolves to a file the item also ships, every bare
  import's package is declared in `dependencies`, and no non-portable `@/`
  aliases leak into shipped source. This is the drift that silently breaks an
  installed component.
- **demo renders the installed source**: `src/components/demos/<name>.tsx` exists
  and imports `@/registry/<name>`, so the iframe demo is the exact source that
  installs.

## `portrayal.test.mjs` — offline

The code we **show** must be the code that **renders**. Each component has up to
three site wrappers around the same `@/registry/<name>` source: `demos/<name>`
(the only one shown as copyable code), `previews/<name>` (the fullscreen iframe),
and `studios/<name>` (the interactive panel). This suite asserts the preview and
the studio's **at-rest** state (its first preset) render the same registry
component with the same scalar prop values the shown demo uses, so what you see
is what you copy. Ignores data arrays and the `embedded` bounded-vs-fullscreen
mode flag (see `PORTRAYAL_IGNORED_PROPS`).

## `shadcn-install.test.mjs` — ground truth, needs the dev server

```bash
pnpm dev            # in another terminal, serves /r/*.json
pnpm test:install   # runs the real `npx shadcn@latest add` per item
```

Per item it runs the **real shadcn CLI** into a throwaway project and asserts it
exits 0 and writes every declared file. Separately it asserts the **served JSON
is byte-for-byte identical to the disk source** (the 1:1 "manual copy"
guarantee; the site's copy view reads the same bytes).

Note: the install assertion checks "written and non-empty", not byte-equality,
because shadcn's transformer may legally reformat a file on write (e.g. drop a
detached leading comment). Exact 1:1 is the JSON-vs-disk check.

Skips cleanly if no server is reachable. Env: `REGISTRY_TEST_URL` (base origin),
`REGISTRY_TEST_ONLY=a,b` (subset), `REGISTRY_TEST_LIMIT=N` (first N, quick smoke).
