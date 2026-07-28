import type {
  ValidateUserInfoResult,
  ValidateUserInfoSource,
} from "better-auth";

/**
 * A tenant admission gate for `user.validateUserInfo`.
 *
 * Requires better-auth >= 1.7.0. `validateUserInfo` landed in 1.7.0
 * (PR #9864). It is the only hook that runs across every authentication
 * method (OAuth, SSO OIDC, SSO SAML, email/password, magic link, OTP,
 * SIWE, anonymous, admin-created) at three points: `create-user`,
 * `link-account`, and OAuth/SSO `sign-in`.
 *
 * Why the `sign-in` case matters: it is the one action where the hook is
 * handed the FRESH provider email and profile rather than the stored row.
 * A user who was provisioned at `alice@acme.com` and later moved to
 * `alice@gmail.com` at the IdP is caught on their next sign-in. A gate that
 * only runs at creation time never sees that move.
 *
 * Before 1.7.0 the closest equivalent was a `databaseHooks.user.create.before`
 * hook, which covers creation only and cannot see the raw provider profile.
 *
 * Wire it up:
 *
 * ```ts
 * betterAuth({
 *   user: {
 *     validateUserInfo: createProvisioningGate({
 *       allowedEmailDomains: ["acme.com", "acme.co.uk"],
 *       ssoProviderDomains: { "acme-okta": ["acme.com"] },
 *     }),
 *   },
 * });
 * ```
 */

export type ProvisioningGateConfig = {
  /**
   * Domains permitted to hold an account, lowercase, no leading "@".
   * Subdomains are NOT implied: list "eu.acme.com" explicitly if you want it.
   */
  allowedEmailDomains: readonly string[];
  /**
   * Optional per-SSO-provider narrowing. A provider listed here may only
   * provision the domains it maps to, so a second IdP added to the same
   * deployment cannot mint accounts on another tenant's domain.
   */
  ssoProviderDomains?: Readonly<Record<string, readonly string[]>>;
  /**
   * OAuth providers whose `email_verified` claim is trusted. Anything not
   * listed must verify the address through Better Auth's own email flow,
   * because an unverified provider email is an account-takeover primitive:
   * whoever registers it at the IdP inherits the matching local account.
   */
  trustedEmailVerifyingProviders?: readonly string[];
};

/** Rejection codes. Machine readable, surfaced to the client, so keep them free of internals. */
const DENY = {
  noEmail: "provisioning_no_email",
  domain: "provisioning_domain_not_allowed",
  ssoDomain: "provisioning_sso_domain_mismatch",
  unverified: "provisioning_email_not_verified",
  anonymous: "provisioning_anonymous_disabled",
} as const;

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

export function createProvisioningGate(config: ProvisioningGateConfig) {
  const allowed = new Set(
    config.allowedEmailDomains.map((d) => d.toLowerCase()),
  );
  const trustedVerifiers = new Set(config.trustedEmailVerifyingProviders ?? []);

  return function validateUserInfo(data: {
    user: Partial<{ email: string; emailVerified: boolean }> &
      Record<string, unknown>;
    source: ValidateUserInfoSource;
  }): ValidateUserInfoResult | void {
    const { user, source } = data;

    // Anonymous sessions never belong to a tenant. Reject before any email
    // logic, since anonymous users have no meaningful address to inspect.
    if (source.method === "anonymous") {
      return {
        error: DENY.anonymous,
        errorDescription: "Guest accounts are not available on this workspace.",
      };
    }

    const email =
      typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    const domain = email ? emailDomain(email) : null;
    if (!domain) {
      // Fail closed. A provider that returns no email cannot be domain checked,
      // so it cannot be admitted by a domain policy.
      return {
        error: DENY.noEmail,
        errorDescription:
          "This identity provider did not return an email address.",
      };
    }

    if (!allowed.has(domain)) {
      return {
        error: DENY.domain,
        errorDescription: `Accounts on ${domain} are not permitted on this workspace.`,
      };
    }

    // SSO: keep each IdP inside the domains it is authoritative for.
    const ssoProviderId = source.sso?.providerId;
    if (ssoProviderId) {
      const scoped = config.ssoProviderDomains?.[ssoProviderId];
      if (scoped && !scoped.some((d) => d.toLowerCase() === domain)) {
        return {
          error: DENY.ssoDomain,
          errorDescription: `${ssoProviderId} is not authoritative for ${domain}.`,
        };
      }
    }

    // Only gate verification where a new identity is being attached. A repeat
    // `sign-in` re-runs for the domain check above; re-testing verification
    // there would lock out users whose provider stopped sending the claim.
    if (source.action === "create-user" || source.action === "link-account") {
      const providerId = source.oauth?.providerId;
      const providerAssertsVerified =
        providerId !== undefined &&
        trustedVerifiers.has(providerId) &&
        user.emailVerified === true;

      // Email/password and OTP flows run Better Auth's own verification, so
      // they are allowed through unverified and gated by the normal flow.
      const selfVerifyingMethod =
        source.method === "email-password" ||
        source.method === "email-otp" ||
        source.method === "magic-link";

      if (
        providerId !== undefined &&
        !providerAssertsVerified &&
        !selfVerifyingMethod
      ) {
        return {
          error: DENY.unverified,
          errorDescription:
            "This provider does not assert a verified email address for this account.",
        };
      }
    }

    // Returning nothing admits the identity.
  };
}
