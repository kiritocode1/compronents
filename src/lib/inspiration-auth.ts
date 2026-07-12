"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ponytail: single shared-password gate over a public bookmark wall, not real auth.
// Anyone with the password (or the httpOnly cookie) sees the links. Swap for real
// per-user auth if these ever become genuinely private.

export async function unlockInspiration(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "").trim();
  if (password !== (process.env.INSPIRATION_PASSWORD ?? "magician")) {
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
