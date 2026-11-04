/**
 * Lists the evaluation ("decision") models available on the Vercel AI Gateway,
 * with per-token pricing. The noul semantic gate needs a decision model, and
 * some are refused on the free tier (see JUDGE_MODEL in judge.ts), so this shows which
 * substitutes exist and what they cost.
 *
 * Run under the production wrapper for auth (VERCEL_OIDC_TOKEN, or an
 * AI_GATEWAY_API_KEY if one is set):
 *
 *   pnpm inspiration:production --help  # wrapper how-to in AGENTS.md
 *   node --import ./tests/alias-hooks.mjs scripts/inspiration-eval-models.mjs
 *
 * Auth mirrors the gateway SDK: AI_GATEWAY_API_KEY first, else the OIDC token
 * the Vercel CLI injects. The protocol header matches @ai-sdk/gateway.
 */
const key = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
if (!key) {
  throw new Error(
    "No gateway auth in env. Run under the production wrapper, or set AI_GATEWAY_API_KEY.",
  );
}
const res = await fetch("https://ai-gateway.vercel.sh/v4/ai/config", {
  headers: {
    Authorization: `Bearer ${key}`,
    "ai-gateway-protocol-version": "0.0.1",
  },
});
if (!res.ok) {
  throw new Error(
    `Config fetch failed: ${res.status} ${(await res.text()).slice(0, 200)}`,
  );
}
const { models } = await res.json();
const evalModels = models.filter((m) => m.modelType === "evaluation");
console.log(
  `total models: ${models.length}, evaluation models: ${evalModels.length}`,
);
for (const m of evalModels) {
  const pricing = m.pricing
    ? ` in=${m.pricing.input} out=${m.pricing.output}`
    : " free?";
  console.log(`- ${m.id}${pricing}`);
}
