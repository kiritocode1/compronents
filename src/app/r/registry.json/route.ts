import { buildRegistryCatalog } from "@/lib/registry-server";

export function GET() {
  return Response.json(buildRegistryCatalog());
}
