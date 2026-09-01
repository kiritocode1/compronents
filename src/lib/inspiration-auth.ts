"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  (await cookies()).set("inspiration_unlock", "unlocked", {
    httpOnly: true,
    sameSite: "lax",
    path: "/inspiration",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/inspiration");
}
