"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createOwnerSession,
  OWNER_COOKIE,
  OWNER_SESSION_SECONDS,
  ownerPasswordMatches,
} from "./inspiration/auth.ts";

// ponytail: single shared-password gate over a public bookmark wall, not real auth.
// Anyone with the password (or the httpOnly cookie) sees the links. Swap for real
// per-user auth if these ever become genuinely private.

/**
 * Hashing first gives timingSafeEqual the equal-length buffers it requires, and
 * stops the comparison leaking length or position.
 */
function timingSafeEqualStr(a: string, b: string) {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

export async function unlockInspiration(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  // No source fallback. This file is in a public repo, so a literal default
  // here is the same as no gate at all.
  const expected = process.env.INSPIRATION_PASSWORD;
  if (!expected) {
    return { error: "INSPIRATION_PASSWORD is not configured." };
  }

  const password = String(formData.get("password") ?? "").trim();
  if (!password || !timingSafeEqualStr(password, expected)) {
    return { error: "That is not the password." };
  }

  const jar = await cookies();
  jar.set("inspiration_unlock", "unlocked", {
    httpOnly: true,
    sameSite: "lax",
    path: "/inspiration",
    maxAge: OWNER_SESSION_SECONDS,
  });

  // Same person, same passphrase. When it is also the owner secret, elevate here
  // rather than asking again on the page we just let them into. Owner access is
  // what attaches preferences, source evidence and semantic candidates.
  try {
    if (ownerPasswordMatches(password)) {
      jar.set(OWNER_COOKIE, createOwnerSession(), {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: OWNER_SESSION_SECONDS,
      });
    }
  } catch {
    // Owner secrets unconfigured. The page still unlocks; the sign-in block
    // under the search bar remains the way in.
  }

  redirect("/inspiration");
}
