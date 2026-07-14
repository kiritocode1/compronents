import { type NextRequest, NextResponse } from "next/server";

// Known AI crawlers/agents plus generic programmatic HTTP clients. UA is the
// only reliable signal here: Next strips all RSC/flight markers before the
// proxy runs, so Accept-header sniffing would also catch the app router's own
// client-navigation fetches (browser UA, Accept: */*) and break in-app nav.
const AGENT_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|DuckAssistBot|cohere-ai|meta-externalagent|Bytespider|CCBot|Amazonbot|Applebot-Extended|MistralAI-User|curl|Wget|python-requests|python-httpx|Python-urllib|aiohttp|Go-http-client|node-fetch|undici|axios|okhttp|Java\//i;

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";

  // The gated React page is useless to an agent; hand it the markdown index.
  if (ua === "" || AGENT_UA.test(ua)) {
    return NextResponse.redirect(
      new URL("/inspiration/llms.txt", request.url),
      307,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/inspiration",
};
