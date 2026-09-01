"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { getComponentMeta } from "@/lib/component-meta";
import { hasDatabase } from "@/lib/db";
import { getRegistryItem } from "@/lib/registry";
import { buildRegistryItemMarkdown } from "@/lib/registry-markdown";
import { buildRegistryItem } from "@/lib/registry-server";
import {
  currentSourceSession,
  REGISTRY_SESSION_COOKIE,
  REGISTRY_SESSION_MAX_AGE,
} from "@/lib/registry-session";
import {
  bumpTokenUsage,
  findActiveTokenByHash,
} from "@/lib/registry-token-store";
import { hashToken } from "@/lib/token-contract";

/**
 * Source files and handoff documents are served through these actions rather
 * than embedded in the page, so the detail pages stay statically prerendered
 * while their source stays gated. Every action re-checks the session; none of
 * them trust the client.
 */

export async function isSourceUnlocked() {
  return Boolean(await currentSourceSession());
}

export async function unlockSource(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  if (!hasDatabase()) {
    return { error: "Source access is not configured." };
  }

  const raw = String(formData.get("token") ?? "").trim();
  if (!raw) return { error: "Paste a registry token." };

  const hash = hashToken(raw);
  const token = await findActiveTokenByHash(hash).catch(() => null);
  if (!token) return { error: "That token is not valid or was revoked." };

  (await cookies()).set(REGISTRY_SESSION_COOKIE, hash, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REGISTRY_SESSION_MAX_AGE,
  });
  bumpTokenUsage(token.id);
  return {};
}

export async function lockSource() {
  (await cookies()).delete(REGISTRY_SESSION_COOKIE);
}

/**
 * Returns null rather than throwing. A thrown server action error is sanitised
 * to a generic digest in production, so callers could not tell "locked" from
 * "broken"; a null lets them render the gate instead of an error.
 */
async function resolveScope(name: string) {
  const session = await currentSourceSession();
  if (!session) return null;

  const section = getRegistryItem(name)?.section;
  if (section && !session.scopes.includes(section)) return null;

  return session;
}

export async function loadSourceFiles(name: string) {
  if (!(await resolveScope(name))) return null;
  const built = await buildRegistryItem(name);

  // The demo is part of the gated payload too: it is the usage example, and
  // shipping it while hiding the component would leak the interesting half.
  const meta = getComponentMeta(name);
  const demo = meta
    ? {
        filename: "demo.tsx",
        content: await readFile(
          path.join(process.cwd(), meta.demoPath),
          "utf-8",
        ),
      }
    : undefined;

  return {
    demo,
    files: built.files.map((file) => ({
      target: file.target,
      content: file.content,
    })),
  };
}

export async function loadHandoff(name: string) {
  const session = await resolveScope(name);
  if (!session) return null;

  bumpTokenUsage(session.id);
  return buildRegistryItemMarkdown(name);
}
