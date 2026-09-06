import { compatibilityResponse } from "@/lib/inspiration/compat";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return compatibilityResponse(request, "discover", true);
}
