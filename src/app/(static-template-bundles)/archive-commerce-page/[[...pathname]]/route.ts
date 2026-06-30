import { staticTemplateResponse } from "@/lib/static-template-proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ pathname?: string[] }> },
) {
  const { pathname } = await context.params;
  return staticTemplateResponse({ slug: "archive-commerce-page", pathname });
}
