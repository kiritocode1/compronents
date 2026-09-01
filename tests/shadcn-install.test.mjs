// Ground-truth install test: runs the REAL `shadcn add` CLI against the served
// registry and asserts every item copies cleanly into a project (CLI exits 0,
// every declared file lands), plus an exact 1:1 served-JSON-vs-disk check.
//
// Needs a running registry (the dev server). Skips cleanly when none is
// reachable so `node --test tests/` stays green offline.
//
//   pnpm dev                 # in another terminal (serves /r/*.json)
//   node --test tests/shadcn-install.test.mjs
//
// Env:
//   REGISTRY_TEST_URL    base origin to install from (default: auto-probe
//                        http://localhost:3000..3002)
//   REGISTRY_TEST_ONLY   comma-separated item names to install (default: all)
//   REGISTRY_TEST_LIMIT  install only the first N items (quick smoke run)
//   REGISTRY_TEST_TOKEN  registry token, minted at mint-me.aryank.space. The
//                        registry is gated, so without this every request is
//                        401 and the suite fails rather than skipping.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { readFile, registryItems } from "./registry-data.mjs";

const TOKEN = process.env.REGISTRY_TEST_TOKEN?.trim();

/**
 * shadcn cannot attach a header to a plain-URL install, so the token rides as
 * a query parameter here, exactly as a real consumer would have to do it.
 */
function authed(url) {
  if (!TOKEN) return url;
  const next = new URL(url);
  next.searchParams.set("token", TOKEN);
  return next.toString();
}

async function probeServer() {
  const candidates = process.env.REGISTRY_TEST_URL
    ? [process.env.REGISTRY_TEST_URL]
    : [3000, 3001, 3002].map((port) => `http://localhost:${port}`);

  for (const url of candidates) {
    try {
      const res = await fetch(authed(`${url}/r/registry.json`));
      if (res.ok) return { url, ok: true };
      // Something IS serving here, it just refused us. Reporting that as
      // "no server" is what used to turn a 401 into a silent green skip.
      return { url, ok: false, status: res.status };
    } catch {
      // not listening; try next
    }
  }
  return null;
}

const probe = await probeServer();
const baseUrl = probe?.url;

if (!probe) {
  test(
    "shadcn install (skipped: no registry server)",
    { skip: true },
    () => {},
  );
} else if (!probe.ok) {
  // Deliberately a failure, never a skip: an unauthorised registry means this
  // suite covers nothing, and that must not look like passing.
  test("shadcn install: registry refused the test credentials", () => {
    assert.fail(
      `${probe.url}/r/registry.json responded ${probe.status}. ` +
        (TOKEN
          ? "REGISTRY_TEST_TOKEN was sent and rejected. Mint a fresh token at mint-me.aryank.space."
          : "The registry is token gated. Set REGISTRY_TEST_TOKEN to a live token."),
    );
  });
} else {
  const only = process.env.REGISTRY_TEST_ONLY?.split(",").map((s) => s.trim());
  const limit = process.env.REGISTRY_TEST_LIMIT
    ? Number(process.env.REGISTRY_TEST_LIMIT)
    : Infinity;
  let items = registryItems;
  if (only?.length) items = items.filter((i) => only.includes(i.name));
  items = items.slice(0, limit);

  // One throwaway shadcn project, reused for every item (--overwrite each time).
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "compronents-shadcn-"));
  fs.writeFileSync(
    path.join(fixture, "package.json"),
    JSON.stringify({
      name: "fixture",
      private: true,
      dependencies: { react: "19.2.4", "react-dom": "19.2.4" },
    }),
  );
  fs.writeFileSync(
    path.join(fixture, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        baseUrl: ".",
        paths: { "@/*": ["./src/*"] },
        jsx: "preserve",
        module: "esnext",
        moduleResolution: "bundler",
        target: "esnext",
        strict: true,
      },
      include: ["src"],
    }),
  );
  fs.writeFileSync(
    path.join(fixture, "components.json"),
    JSON.stringify({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "new-york",
      rsc: true,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/app/globals.css",
        baseColor: "neutral",
        cssVariables: true,
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks",
      },
    }),
  );
  fs.mkdirSync(path.join(fixture, "src/app"), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, "src/app/globals.css"),
    '@import "tailwindcss";\n',
  );

  after(() => fs.rmSync(fixture, { recursive: true, force: true }));

  for (const item of items) {
    test(`${item.name}: real shadcn add`, { timeout: 180_000 }, () => {
      const url = authed(`${baseUrl}/r/${item.name}.json`);
      // A non-zero exit throws and fails the test — this is the CLI's own
      // "copies cleanly" assertion (valid JSON, resolvable deps, files written).
      execFileSync(
        "npx",
        ["-y", "shadcn@latest", "add", url, "--yes", "--overwrite"],
        { cwd: fixture, stdio: "pipe", encoding: "utf8" },
      );

      // Every declared file lands under the project. With the fixture aliases,
      // a `components/ui/...` target maps to `src/<target>`.
      // (We assert "written and non-empty" rather than byte-equality because
      // shadcn's transformer legally reformats files, e.g. stripping a detached
      // leading comment. The exact 1:1 guarantee is the JSON==disk test below.)
      for (const file of item.files) {
        const dest = path.join(fixture, "src", file.target);
        assert.ok(
          fs.existsSync(dest),
          `${item.name}: shadcn did not write ${file.target}`,
        );
        assert.ok(
          fs.statSync(dest).size > 0,
          `${item.name}: wrote empty file ${file.target}`,
        );
      }
    });
  }

  // The "manual copy" code shown on the site is read from the same served JSON,
  // so this is the exact 1:1 guarantee: served content === disk source, byte for
  // byte, for every item. Cheap (no CLI), so it runs for all of them.
  for (const item of items) {
    test(`${item.name}: served JSON is 1:1 with disk`, async () => {
      const res = await fetch(authed(`${baseUrl}/r/${item.name}.json`));
      assert.ok(res.ok, `${item.name}: /r/${item.name}.json -> ${res.status}`);
      const json = await res.json();
      // Route inlines files in item order; json.files[i].content is the disk
      // content of item.files[i].path (json's own `path` is the install target).
      assert.equal(json.files.length, item.files.length);
      item.files.forEach((file, i) => {
        assert.equal(
          json.files[i].content,
          readFile(file.path),
          `${item.name}: served ${file.path} differs from disk`,
        );
      });
    });
  }
}
