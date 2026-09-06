import { handleInspiration } from "@/lib/inspiration/http";

export const runtime = "nodejs";
export const GET = (request: Request) => handleInspiration(request);
export const POST = (request: Request) => handleInspiration(request);
