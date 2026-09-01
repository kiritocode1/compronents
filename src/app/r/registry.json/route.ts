import { requireRegistryToken } from "@/lib/registry-auth";
import { buildRegistryCatalog } from "@/lib/registry-server";

export async function GET(request: Request) {
  const authError = await requireRegistryToken(request, null);
  if (authError) return authError;

  // no-store because the response is authorized: a shared cache must never
  // hand a token holder's copy to the next anonymous caller.
  return Response.json(buildRegistryCatalog(), {
    headers: { "Cache-Control": "no-store" },
  });
}
