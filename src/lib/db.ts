import { neon } from "@neondatabase/serverless";

/**
 * The registry_tokens table is owned by the mint-me app. This repo only reads
 * from it, plus a usage bump. Schema changes belong there, not here.
 */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return neon(url);
}
