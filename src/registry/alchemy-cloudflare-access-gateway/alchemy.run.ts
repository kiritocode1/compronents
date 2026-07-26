import alchemy from "alchemy";
import {
  AccessApplication,
  AccessPolicy,
  AccessServiceToken,
  Assets,
  Worker,
} from "alchemy/cloudflare";
import { Config, Effect, Schema } from "effect";

const Email = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
);
const Hostname = Schema.String.check(
  Schema.isPattern(
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i,
  ),
);

const DeploymentConfig = Config.all({
  gatewayHostname: Config.schema(Hostname, "GATEWAY_HOSTNAME"),
  ownerEmail: Config.schema(Email, "OWNER_EMAIL"),
});

export class GatewayProvisioningError extends Schema.TaggedErrorClass<GatewayProvisioningError>()(
  "GatewayProvisioningError",
  {
    resource: Schema.String,
    cause: Schema.Defect(),
  },
) {}

const provision = <A>(resource: string, deploy: () => PromiseLike<A>) =>
  Effect.tryPromise({
    try: deploy,
    catch: (cause) => new GatewayProvisioningError({ resource, cause }),
  });

const deployGateway = Effect.fn("AccessGateway.deploy")(function* () {
  const config = yield* DeploymentConfig;

  const agentToken = yield* provision("agent service token", () =>
    AccessServiceToken("agent", {
      name: "BLANK Agent",
      duration: "8760h",
    }),
  );

  const humanPolicy = yield* provision("human access policy", () =>
    AccessPolicy("human", {
      name: "BLANK Human",
      decision: "allow",
      include: [{ email: { email: config.ownerEmail } }],
    }),
  );

  const agentPolicy = yield* provision("agent access policy", () =>
    AccessPolicy("agent", {
      name: "BLANK Agent",
      decision: "non_identity",
      include: [{ service_token: { token_id: agentToken } }],
    }),
  );

  const access = yield* provision("Access application", () =>
    AccessApplication("api-gateway", {
      name: "BLANK API Gateway",
      type: "self_hosted",
      domain: config.gatewayHostname,
      policies: [humanPolicy, agentPolicy],
      sessionDuration: "24h",
      serviceAuth401Redirect: true,
    }),
  );

  const staticAssets = yield* provision("static assets", () =>
    Assets({ path: "dist" }),
  );

  const worker = yield* provision("gateway Worker", () =>
    Worker("api-gateway", {
      name: "blank-api-gateway",
      entrypoint: "src/worker.ts",
      routes: [`${config.gatewayHostname}/*`],
      bindings: {
        ACCESS_AUDIENCE: access.aud,
        ASSETS: staticAssets,
      },
      assets: {
        not_found_handling: "single-page-application",
        run_worker_first: ["/api", "/api/*"],
      },
      compatibilityDate: "2026-07-26",
      compatibility: "node",
      sourceMap: true,
      url: false,
      previewSubdomains: false,
      observability: {
        enabled: true,
        logs: { enabled: true, persist: true },
        traces: { enabled: true, persist: true },
      },
    }),
  );

  return { access, agentPolicy, agentToken, humanPolicy, worker } as const;
});

const app = await alchemy("blank-access-gateway");

export const gateway = await Effect.runPromise(deployGateway());

await app.finalize();
