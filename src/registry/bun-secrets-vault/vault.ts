/**
 * vault.ts: keychain-backed config loader so teams never commit .env again.
 *
 * Secrets live in the OS credential store (macOS Keychain, Linux libsecret,
 * Windows Credential Manager) via Bun.secrets, encrypted at rest and scoped to
 * the logged-in user. Since Bun.secrets has no native "list", vault keeps its
 * own key index as one extra secret, so `list` and `run` work like you expect.
 * Zero npm deps: Bun.secrets, Bun.spawn, and process.env cover everything.
 *
 * run:
 *   bun vault.ts set STRIPE_KEY sk_live_abc123
 *   bun vault.ts get STRIPE_KEY
 *   bun vault.ts list
 *   bun vault.ts rm STRIPE_KEY
 *   bun vault.ts run -- bun server.ts        (spawns with secrets injected as env)
 *   bun vault.ts self-test
 *
 * library:
 *   import { loadConfig } from "./vault";
 *   const cfg = await loadConfig(["STRIPE_KEY", "DB_URL"]);   keychain first, process.env (.env) fallback
 */

import { secrets } from "bun";

const SERVICE = process.env.VAULT_SERVICE ?? `vault:${process.cwd().split("/").pop()}`;
const INDEX = "__vault_index__";

async function readIndex(service = SERVICE): Promise<string[]> {
  const raw = await secrets.get({ service, name: INDEX });
  return raw ? JSON.parse(raw) : [];
}

async function writeIndex(keys: string[], service = SERVICE) {
  await secrets.set({ service, name: INDEX, value: JSON.stringify([...new Set(keys)].sort()) });
}

export async function vaultSet(key: string, value: string, service = SERVICE) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new Error(`invalid key name: ${key}`);
  await secrets.set({ service, name: key, value });
  await writeIndex([...(await readIndex(service)), key], service);
}

export async function vaultGet(key: string, service = SERVICE): Promise<string | null> {
  return secrets.get({ service, name: key });
}

export async function vaultRm(key: string, service = SERVICE): Promise<boolean> {
  const deleted = await secrets.delete({ service, name: key });
  await writeIndex((await readIndex(service)).filter(k => k !== key), service);
  return deleted;
}

export async function vaultList(service = SERVICE): Promise<string[]> {
  return readIndex(service);
}

/** Keychain wins; process.env (which includes Bun's auto-loaded .env) is the fallback. */
export async function loadConfig(keys: string[], service = SERVICE): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const missing: string[] = [];
  for (const key of keys) {
    const v = (await secrets.get({ service, name: key })) ?? process.env[key];
    if (v == null) missing.push(key);
    else out[key] = v;
  }
  if (missing.length) throw new Error(`vault: missing config keys: ${missing.join(", ")} (set with: bun vault.ts set <KEY> <value>)`);
  return out;
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  switch (cmd) {
    case "set": {
      const [key, value] = args;
      if (!key || value == null) fail("usage: bun vault.ts set <KEY> <value>");
      await vaultSet(key, value);
      console.log(`stored ${key} in ${SERVICE}`);
      break;
    }
    case "get": {
      if (!args[0]) fail("usage: bun vault.ts get <KEY>");
      const v = await vaultGet(args[0]);
      if (v == null) fail(`${args[0]} not found in ${SERVICE}`);
      console.log(v);
      break;
    }
    case "rm": {
      if (!args[0]) fail("usage: bun vault.ts rm <KEY>");
      console.log((await vaultRm(args[0])) ? `removed ${args[0]}` : `${args[0]} was not set`);
      break;
    }
    case "list": {
      const keys = await vaultList();
      console.log(keys.length ? keys.join("\n") : `(no secrets in ${SERVICE})`);
      break;
    }
    case "run": {
      const sep = args.indexOf("--");
      const argv = sep >= 0 ? args.slice(sep + 1) : args;
      if (!argv.length) fail("usage: bun vault.ts run -- <command> [args]");
      const env = { ...process.env };
      for (const key of await vaultList()) env[key] = (await vaultGet(key)) ?? "";
      const proc = Bun.spawn(argv, { env, stdio: ["inherit", "inherit", "inherit"] });
      process.exit(await proc.exited);
    }
    case "self-test": {
      const svc = `vault:selftest-${Date.now()}`;
      await vaultSet("API_KEY", "k-123", svc);
      await vaultSet("DB_URL", "postgres://localhost/app", svc);
      if ((await vaultGet("API_KEY", svc)) !== "k-123") throw new Error("get failed");
      const listed = await vaultList(svc);
      if (listed.join(",") !== "API_KEY,DB_URL") throw new Error(`list failed: ${listed}`);
      process.env.ENV_ONLY = "from-env";
      const cfg = await loadConfig(["API_KEY", "ENV_ONLY"], svc);
      if (cfg.API_KEY !== "k-123" || cfg.ENV_ONLY !== "from-env") throw new Error("loadConfig failed");
      let threw = false;
      await loadConfig(["NOPE_MISSING"], svc).catch(() => (threw = true));
      if (!threw) throw new Error("loadConfig should throw on missing key");
      if (!(await vaultRm("API_KEY", svc))) throw new Error("rm failed");
      if ((await vaultList(svc)).join(",") !== "DB_URL") throw new Error("index not updated after rm");
      await vaultRm("DB_URL", svc);
      await secrets.delete({ service: svc, name: INDEX });
      console.log("vault self-test: all assertions passed");
      break;
    }
    default:
      fail("commands: set <KEY> <value> | get <KEY> | rm <KEY> | list | run -- <cmd> | self-test");
  }
}

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

if (import.meta.main) await main();
