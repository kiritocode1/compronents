import { neon } from "@neondatabase/serverless";
import type { PGlite } from "@electric-sql/pglite";
import { resolve } from "node:path";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { schema } from "./schema.ts";

export interface InspirationDatabase {
  query<T>(statement: string, params?: unknown[]): Promise<T[]>;
  close?: () => Promise<void>;
  kind: "local" | "neon";
}

export async function localDatabase(path?: string): Promise<InspirationDatabase> {
  let release = () => {};
  if (path) {
    const lock = `${resolve(path)}.lock`;
    try { mkdirSync(lock); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const pid = Number(readFileSync(`${lock}/pid`, "utf8"));
      let alive = true;
      try { process.kill(pid, 0); } catch (probe) { alive = (probe as NodeJS.ErrnoException).code !== "ESRCH"; }
      if (alive || !Number.isInteger(pid) || pid <= 0) throw new Error("The local inspiration database is open in another process. Use its API or stop that server before running the CLI.");
      rmSync(lock, { recursive: true });
      mkdirSync(lock);
    }
    writeFileSync(`${lock}/pid`, String(process.pid));
    release = () => { rmSync(lock, { recursive: true, force: true }); };
    process.once("exit", release);
  }
  const [{ PGlite }, { pg_trgm }] = await Promise.all([
    import("@electric-sql/pglite"), import("@electric-sql/pglite/contrib/pg_trgm"),
  ]);
  const pg: PGlite = new PGlite({ dataDir: path, extensions: { pg_trgm } });
  return {
    kind: "local",
    query: async <T>(statement: string, params: unknown[] = []) => (await pg.query<T>(statement, params)).rows,
    close: async () => { await pg.close(); process.removeListener("exit", release); release(); },
  };
}

export async function migrate(db: InspirationDatabase) {
  for (const statement of schema) await db.query(statement);
}

const globalDb = globalThis as typeof globalThis & { inspirationDatabase?: Promise<InspirationDatabase | null> };

/** Local disk is allowed only off Vercel and outside production. Never use DATABASE_URL. */
export function getInspirationDatabase(): Promise<InspirationDatabase | null> {
  globalDb.inspirationDatabase ??= (async () => {
    const url = process.env.INSPIRATION_DATABASE_URL;
    if (url) {
      const sql = neon(url);
      return {
        kind: "neon" as const,
        query: async <T>(statement: string, params: unknown[] = []) =>
          await sql.query(statement, params) as T[],
      };
    }
    if (process.env.VERCEL || process.env.NODE_ENV === "production") return null;
    const db = await localDatabase(resolve(process.env.INSPIRATION_LOCAL_DB || ".inspiration-local"));
    await migrate(db);
    return db;
  })().catch((error) => {
    globalDb.inspirationDatabase = undefined;
    throw error;
  });
  return globalDb.inspirationDatabase;
}
