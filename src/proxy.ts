import { type NextRequest, NextResponse } from "next/server";

// Known AI crawlers/agents plus generic programmatic HTTP clients. UA is the
// only reliable signal here: Next strips all RSC/flight markers before the
// proxy runs, so Accept-header sniffing would also catch the app router's own
// client-navigation fetches (browser UA, Accept: */*) and break in-app nav.
const AGENT_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|DuckAssistBot|cohere-ai|meta-externalagent|Bytespider|CCBot|Amazonbot|Applebot-Extended|MistralAI-User|curl|Wget|python-requests|python-httpx|Python-urllib|aiohttp|Go-http-client|node-fetch|undici|axios|okhttp|Java\//i;

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";

  // Real browsers send Sec-Fetch-Dest on every request (including the app
  // router's own RSC fetches). Server-side fetchers spoofing a browser UA
  // (Grok, ChatGPT browsing) do not, so its absence marks an agent.
  // ponytail: pre-2023 browsers lack Sec-Fetch-* and get markdown; acceptable.
  const isBrowser = request.headers.has("sec-fetch-dest");

  // The gated React page is useless to an agent; hand it the markdown index.
  if (ua === "" || AGENT_UA.test(ua) || !isBrowser) {
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
