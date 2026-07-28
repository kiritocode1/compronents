/**
 * sandbox.ts: a permission-sandboxed plugin runner for untrusted code.
 *
 * Executes plugin files in a child Node process under the permission model:
 * the plugin can read ONLY a whitelisted data directory (plus its own file),
 * and gets ERR_ACCESS_DENIED on any fs write, fs read outside the whitelist,
 * child process spawn, or worker thread. The child receives a clean env
 * (no parent secrets), a JSON input payload, a wall-clock timeout with
 * SIGKILL, and reports results over a structured stdout line protocol.
 *
 * Modern Node primitives used:
 *   --permission / --allow-fs-read (permission model, stable in 22.x)
 *   node:util parseArgs + styleText, fs.realpathSync (symlink-safe allowlists,
 *   /tmp -> /private/tmp on macOS breaks naive allowlists), AbortSignal-free
 *   timeout kill, structuredClone for result isolation, type stripping so
 *   plugins are plain .ts files with zero build step.
 *
 * Known ceiling: Node 22 has no net scope in the permission model, so
 * outbound network from a plugin is NOT blocked here. Node 24+ adds
 * --allow-net; this runner auto-detects the flag and applies net denial
 * when the runtime supports it. Env leakage IS blocked on 22 (clean env).
 *
 * run: node sandbox.ts demo
 * run: node sandbox.ts run <plugin.ts> --read-dir <dir> [--timeout 3000] [--input '{"k":1}']
 */

import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs, styleText } from "node:util";

const RESULT_PREFIX = "@@sandbox:";

export interface SandboxOptions {
  readDir: string;
  timeoutMs?: number;
  input?: unknown;
  maxOutputBytes?: number;
}

export interface SandboxOutcome {
  ok: boolean;
  result?: unknown;
  timedOut: boolean;
  exitCode: number | null;
  signal: string | null;
  durationMs: number;
  deniedPermission?: string;
  stderrTail: string;
}

// Detect once whether this Node build supports the net permission scope.
const hasNetScope: boolean = (() => {
  try {
    return execFileSync(process.execPath, ["--help"], {
      encoding: "utf8",
    }).includes("--allow-net");
  } catch {
    return false;
  }
})();

export function runPlugin(
  pluginPath: string,
  opts: SandboxOptions,
): Promise<SandboxOutcome> {
  const plugin = realpathSync(resolve(pluginPath));
  const readDir = realpathSync(resolve(opts.readDir));
  const timeoutMs = opts.timeoutMs ?? 3000;
  const maxOut = opts.maxOutputBytes ?? 256 * 1024;

  const args = [
    "--permission",
    // realpath both entries: the permission model matches resolved paths,
    // a symlinked /tmp allowlist silently denies everything under it.
    `--allow-fs-read=${readDir}/*`,
    `--allow-fs-read=${plugin}`,
    "--no-warnings",
  ];
  // ponytail: net scope exists only on Node 24+; on 22 outbound net stays open, documented above.
  // (no flag needed: with the model enabled on 24+, net is denied unless --allow-net is passed)
  void hasNetScope;

  return new Promise((resolvePromise) => {
    const started = performance.now();
    const child = spawn(process.execPath, [...args, plugin], {
      env: {
        // clean env: no parent secrets reach the plugin
        PLUGIN_INPUT: JSON.stringify(opts.input ?? null),
        PLUGIN_READ_DIR: readDir,
        NO_COLOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    child.stdout.on("data", (d: Buffer) => {
      if (stdout.length < maxOut) stdout += d.toString("utf8");
    });
    child.stderr.on("data", (d: Buffer) => {
      if (stderr.length < maxOut) stderr += d.toString("utf8");
    });

    const killer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.on("close", (exitCode, signal) => {
      clearTimeout(killer);
      const durationMs = Math.round(performance.now() - started);
      let result: unknown;
      let ok = false;
      for (const line of stdout.split("\n")) {
        if (line.startsWith(RESULT_PREFIX)) {
          try {
            result = structuredClone(
              JSON.parse(line.slice(RESULT_PREFIX.length)),
            );
            ok = true;
          } catch {
            /* malformed result line stays a failure */
          }
        }
      }
      const denied =
        /code:\s*'ERR_ACCESS_DENIED'[\s\S]*?permission:\s*'(\w+)'/.exec(stderr);
      resolvePromise({
        ok: ok && exitCode === 0 && !timedOut,
        result,
        timedOut,
        exitCode,
        signal,
        durationMs,
        deniedPermission: denied?.[1],
        stderrTail: stderr.split("\n").slice(-6).join("\n").trim(),
      });
    });
  });
}

// ---------------------------------------------------------------- demo mode

const DEMO_PLUGINS: Record<string, string> = {
  // A well-behaved plugin: reads only the whitelisted dir, reports via protocol.
  "wordcount.ts": `
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = process.env.PLUGIN_READ_DIR!;
let words = 0, files = 0;
for (const f of readdirSync(dir)) {
	words += readFileSync(join(dir, f), "utf8").split(/\\s+/).filter(Boolean).length;
	files++;
}
console.log("${RESULT_PREFIX}" + JSON.stringify({ files, words, env: Object.keys(process.env).length }));
`,
  // Malicious: tries to write a file outside any grant. Must die with ERR_ACCESS_DENIED.
  "evil-write.ts": `
import { writeFileSync } from "node:fs";
writeFileSync("/tmp/pwned-by-plugin.txt", "gotcha");
console.log("${RESULT_PREFIX}" + JSON.stringify({ pwned: true }));
`,
  // Malicious: tries to read outside the whitelist. Must be denied.
  // Note the clean env also means HOME and friends do not even exist here.
  "evil-read.ts": `
import { readFileSync } from "node:fs";
const hosts = readFileSync("/etc/hosts", "utf8");
console.log("${RESULT_PREFIX}" + JSON.stringify({ stolen: hosts.length }));
`,
  // Malicious: tries to spawn a shell. ChildProcess scope is denied by default.
  "evil-spawn.ts": `
import { execSync } from "node:child_process";
console.log("${RESULT_PREFIX}" + JSON.stringify({ shell: execSync("id").toString() }));
`,
  // Hostile: spins forever, must be SIGKILLed at the timeout.
  "spin.ts": `
for (;;) {}
`,
};

async function demo(baseDir: string): Promise<void> {
  const dataDir = join(baseDir, "data");
  const pluginDir = join(baseDir, "plugins");
  rmSync(baseDir, { recursive: true, force: true });
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(pluginDir, { recursive: true });
  writeFileSync(
    join(dataDir, "notes.txt"),
    "durable queues beat fragile cron jobs every single time",
  );
  writeFileSync(
    join(dataDir, "spec.txt"),
    "plugins read data, plugins never write, the runner decides",
  );
  for (const [name, src] of Object.entries(DEMO_PLUGINS)) {
    writeFileSync(join(pluginDir, name), src.trimStart());
  }

  console.log(
    styleText(
      "bold",
      `sandbox demo: whitelist=${dataDir}, netScope=${hasNetScope ? "enforced" : "unavailable on this Node, ceiling documented"}`,
    ),
  );
  for (const name of Object.keys(DEMO_PLUGINS)) {
    const out = await runPlugin(join(pluginDir, name), {
      readDir: dataDir,
      timeoutMs: 1500,
    });
    const verdict = out.ok
      ? styleText("green", "ALLOWED")
      : out.timedOut
        ? styleText("yellow", "KILLED (timeout)")
        : styleText(
            "red",
            `BLOCKED${out.deniedPermission ? ` (${out.deniedPermission})` : ""}`,
          );
    console.log(
      `\n${styleText("bold", name)} -> ${verdict}  exit=${out.exitCode} signal=${out.signal} ${out.durationMs}ms`,
    );
    if (out.ok) console.log("  result:", JSON.stringify(out.result));
    else if (!out.timedOut)
      console.log(
        styleText(
          "dim",
          "  " + out.stderrTail.split("\n").slice(0, 3).join("\n  "),
        ),
      );
  }
}

// ---------------------------------------------------------------------- cli

if ((import.meta as { main?: boolean }).main) {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      "read-dir": { type: "string" },
      timeout: { type: "string", default: "3000" },
      input: { type: "string" },
    },
  });
  const [cmd, target] = positionals;
  if (cmd === "demo") {
    await demo(
      join(dirname(new URL(import.meta.url).pathname), "sandbox-demo"),
    );
  } else if (cmd === "run" && target && values["read-dir"]) {
    const out = await runPlugin(target, {
      readDir: values["read-dir"],
      timeoutMs: Number(values.timeout),
      input: values.input ? JSON.parse(values.input) : null,
    });
    console.log(JSON.stringify(out, null, 2));
    process.exitCode = out.ok ? 0 : 1;
  } else {
    console.error(
      "usage: node sandbox.ts demo | node sandbox.ts run <plugin.ts> --read-dir <dir> [--timeout ms] [--input json]",
    );
    process.exitCode = 2;
  }
}
