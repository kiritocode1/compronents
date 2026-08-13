/**
 * Settlement Layer Page - content model.
 *
 * All copy here is original and written for this template. The product suite,
 * article set, roles and policy text describe a fictional BLANK infrastructure
 * product so the template ships as a usable starting point rather than a shell
 * full of placeholder text.
 */

export type NavLink = { label: string; href: string };

/** Centre pill group. */
export const NAV_LINKS: NavLink[] = [
  { label: "Products", href: "/products" },
  { label: "Partners", href: "/partners" },
  { label: "News", href: "/newsroom" },
  { label: "Blog", href: "/blog" },
];

/** Right-hand pill group, sitting beside the primary call to action. */
export const UTILITY_LINKS: NavLink[] = [
  { label: "Career", href: "/career" },
  { label: "Company", href: "/company" },
];

export type Product = {
  slug: string;
  name: string;
  kicker: string;
  tagline: string;
  summary: string;
  operational: { title: string; body: string }[];
  properties: { label: string; value: string }[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "vault",
    name: "BLANK Vault",
    kicker: "Custody",
    tagline: "Segregated custody with policy at the signing boundary",
    summary:
      "Vault holds client assets in segregated accounts and moves them only when a signed policy says it may. Quorums, spending ceilings and time locks are evaluated before a signature is produced, not after a transaction is broadcast.",
    operational: [
      {
        title: "Threshold signing",
        body: "Keys are split across hardware modules in separate failure domains. A transfer needs a quorum, and the quorum is a property of the account rather than a convention the desk agrees to follow.",
      },
      {
        title: "Policy before signature",
        body: "Limits, allow lists and dual control run inside the signing path. A request that fails policy never reaches the network, so there is nothing to unwind.",
      },
      {
        title: "Reconstructable history",
        body: "Every approval, rejection and key ceremony is written to an append-only log that reconciles against on-ledger state without a manual export.",
      },
    ],
    properties: [
      { label: "Key model", value: "Threshold, hardware backed" },
      { label: "Approval", value: "Configurable quorum, dual control" },
      { label: "Recovery", value: "Sharded, ceremony logged" },
      { label: "Audit", value: "Append-only, reconcilable" },
    ],
  },
  {
    slug: "ledger",
    name: "BLANK Ledger",
    kicker: "Issuance",
    tagline: "Issue an instrument once and keep its rules attached",
    summary:
      "Ledger turns an instrument's terms into executable rules that travel with the asset. Transfer restrictions, holder eligibility and corporate actions live with the instrument instead of in a spreadsheet beside it.",
    operational: [
      {
        title: "Terms as code",
        body: "Lockups, jurisdiction rules and holder caps compile into the instrument. A transfer that would breach them fails at submission rather than in a quarterly review.",
      },
      {
        title: "Lifecycle without reissue",
        body: "Coupons, splits and redemptions run as lifecycle events against the existing instrument, so holder records stay continuous across the whole term.",
      },
      {
        title: "Register as source of truth",
        body: "The holder register is derived from settled state, not maintained alongside it, which removes the class of breaks that come from two systems disagreeing.",
      },
    ],
    properties: [
      { label: "Instrument types", value: "Debt, equity, fund, structured" },
      { label: "Restrictions", value: "Enforced at transfer" },
      { label: "Corporate actions", value: "Native lifecycle events" },
      { label: "Register", value: "Derived from settled state" },
    ],
  },
  {
    slug: "desk",
    name: "BLANK Desk",
    kicker: "Treasury",
    tagline: "One operating surface for balances, limits and approvals",
    summary:
      "Desk is where treasury actually works: positions across every account, limits that are enforced rather than advisory, and an approval queue that shows who is blocking what.",
    operational: [
      {
        title: "Position in one place",
        body: "Balances across custodians, venues and wallets resolve into a single view that updates from settled state instead of an overnight file.",
      },
      {
        title: "Limits that hold",
        body: "Counterparty and instrument limits are checked in the request path. Breaching one produces a rejection with a reason, not an alert after the fact.",
      },
      {
        title: "Approvals with context",
        body: "Each pending item carries the policy that stopped it and the history of similar decisions, so approvers are not reconstructing context from chat.",
      },
    ],
    properties: [
      { label: "Coverage", value: "Multi custodian, multi venue" },
      { label: "Limits", value: "Pre-trade, enforced" },
      { label: "Approvals", value: "Queued, context attached" },
      { label: "Reporting", value: "Settled state, no overnight file" },
    ],
  },
  {
    slug: "forge",
    name: "BLANK Forge",
    kicker: "Development",
    tagline: "Write, test and ship contracts against a real ledger",
    summary:
      "Forge gives engineering a full local ledger, a typed contract toolchain and a promotion path that does not involve pasting artefacts between environments.",
    operational: [
      {
        title: "Local ledger",
        body: "A complete network runs on a laptop with seeded parties and instruments, so a contract can be exercised end to end before it touches shared infrastructure.",
      },
      {
        title: "Types across the boundary",
        body: "Contract types generate client bindings. A field that changes shape breaks the build instead of failing in production against a stale client.",
      },
      {
        title: "Promotion, not redeployment",
        body: "An artefact built once is promoted through environments with its parameters, which keeps what was tested and what runs the same object.",
      },
    ],
    properties: [
      { label: "Local network", value: "Full ledger, seeded" },
      { label: "Bindings", value: "Generated, type checked" },
      { label: "Testing", value: "Scenario and property based" },
      { label: "Promotion", value: "Build once, parameterised" },
    ],
  },
  {
    slug: "conduit",
    name: "BLANK Conduit",
    kicker: "Privacy",
    tagline: "Settle with counterparties without publishing to everyone",
    summary:
      "Conduit keeps transaction detail scoped to the parties entitled to see it while still producing a settlement both sides and their auditors can prove.",
    operational: [
      {
        title: "Scoped disclosure",
        body: "Only stated parties receive the detail of a transfer. Everyone else can verify that settlement occurred without learning size, price or counterparty.",
      },
      {
        title: "Atomic exchange",
        body: "Delivery and payment commit together or not at all, which removes the settlement window that principal risk lives inside.",
      },
      {
        title: "Disclosure on demand",
        body: "A supervisor can be granted a scoped, revocable view after the fact without reopening the transaction or widening it to other participants.",
      },
    ],
    properties: [
      { label: "Visibility", value: "Party scoped" },
      { label: "Settlement", value: "Atomic delivery versus payment" },
      { label: "Supervisory access", value: "Granted, scoped, revocable" },
      { label: "Proof", value: "Verifiable without disclosure" },
    ],
  },
  {
    slug: "bridge",
    name: "BLANK Bridge",
    kicker: "Exchange",
    tagline: "Swap modules that settle both legs or neither",
    summary:
      "Bridge composes exchange as a settlement primitive. Both legs commit in one transaction, so a swap never leaves one side delivered and the other pending.",
    operational: [
      {
        title: "Both legs, one commit",
        body: "The exchange is a single atomic step. There is no interval in which one party has delivered and the other has not.",
      },
      {
        title: "Quotes with expiry",
        body: "Quotes carry validity windows enforced at settlement, so a stale quote cannot be executed against a moved market.",
      },
      {
        title: "Composable routing",
        body: "Multi leg routes execute as one unit, which lets a swap cross instruments without inheriting the risk of chained settlements.",
      },
    ],
    properties: [
      { label: "Atomicity", value: "All legs or none" },
      { label: "Quotes", value: "Expiry enforced at settlement" },
      { label: "Routing", value: "Multi leg, single commit" },
      { label: "Failure mode", value: "Reject, never partial" },
    ],
  },
  {
    slug: "anchor",
    name: "BLANK Anchor",
    kicker: "Infrastructure",
    tagline: "Run validators without running an on-call rota",
    summary:
      "Anchor operates validator infrastructure with the availability terms written down: regions, upgrade windows, evidence of uptime and a support path that reaches an engineer.",
    operational: [
      {
        title: "Distributed by default",
        body: "Nodes are placed across regions and providers so no single operator outage takes participation with it.",
      },
      {
        title: "Upgrades on a schedule",
        body: "Network upgrades are staged and rehearsed against a mirror of production before the window opens, and the window is published in advance.",
      },
      {
        title: "Evidence, not assurance",
        body: "Uptime, sync distance and signing participation are published continuously so the service can be verified rather than taken on trust.",
      },
    ],
    properties: [
      { label: "Placement", value: "Multi region, multi provider" },
      { label: "Upgrades", value: "Staged, rehearsed, scheduled" },
      { label: "Monitoring", value: "Published continuously" },
      { label: "Support", value: "Escalates to an engineer" },
    ],
  },
];

export type Capability = {
  title: string;
  body: string;
};

export const CAPABILITIES: Capability[] = [
  {
    title: "Tokenised Assets",
    body: "Issue instruments whose transfer rules are enforced by the ledger, so eligibility and lockups hold without a reconciliation step behind them.",
  },
  {
    title: "Treasury Operations",
    body: "Hold, move and report on positions from one surface, with limits checked before a transfer is signed rather than flagged the next morning.",
  },
  {
    title: "Payments and Payroll",
    body: "Run scheduled and on demand disbursement with approval policy attached to the payment rather than to the person submitting it.",
  },
  {
    title: "Trading and Settlement",
    body: "Match, net and settle atomically, so delivery and payment commit together and the settlement window stops carrying principal risk.",
  },
];

export const BUILT_FOR = {
  eyebrow: "Built for",
  heading: "Built for institutional workflows",
  body: "The controls institutions already run on, expressed where they can be enforced: at issuance, at custody and at settlement. Configuration is a deployment concern, not a rebuild.",
  panel: {
    title: "From issuance to execution within a single configurable system",
    body: "Issue an instrument, custody it, move it under policy and settle against a counterparty without handing state between four vendors and reconciling the seams.",
    cta: "Read the overview",
  },
};

export const TRUSTED = {
  heading: "Trusted by institutions",
  body: "Banks, asset managers and market infrastructure operators run regulated workflows on this stack. Deployments start from an existing control framework rather than replacing it.",
};

export const CUTTING_EDGE = {
  heading: "At the cutting edge of institutional workflows",
  body: "Four capability areas, one settlement layer underneath them.",
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
  excerpt: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "settlement-windows-are-a-design-choice",
    title: "Settlement windows are a design choice, not a law",
    category: "Research",
    date: "2026-07-30",
    readingTime: "6 min",
    excerpt:
      "Two day settlement is an artefact of batch processing and paper confirmations. When delivery and payment commit in one step, the window is not shortened. It stops existing.",
    body: [
      "Settlement risk is usually described as though it were weather: a condition to be hedged, capitalised against and monitored. It is more accurate to call it a consequence. The gap between delivery and payment exists because the two legs are recorded in different systems that reconcile on a schedule.",
      "Once both legs commit in a single transaction, the exposure does not shrink. It has nowhere to live. A trade either settles or it does not, and the intermediate state where one party has delivered and the other has not is no longer representable.",
      "The operational consequence is larger than the capital one. Most of the machinery around settlement, the fails queues, the buy-in processes, the reconciliation desks, exists to manage a state that atomic settlement removes. Teams find the harder adjustment is organisational rather than technical.",
      "None of this argues for replacing existing infrastructure wholesale. It argues for being precise about which risks are inherent to a market and which are inherited from how the market was wired.",
    ],
  },
  {
    slug: "privacy-is-a-prerequisite-not-a-feature",
    title: "Privacy is a prerequisite for institutional adoption",
    category: "Perspective",
    date: "2026-06-18",
    readingTime: "5 min",
    excerpt:
      "An institution cannot publish its positions to competitors. Any ledger that requires it has ruled itself out before the compliance conversation starts.",
    body: [
      "The first question an institution asks about a shared ledger is not throughput. It is who else can see this. A design that answers everyone has ended the evaluation, whatever its other properties.",
      "Scoped disclosure changes the question. Transaction detail reaches the parties entitled to it and no one else, while the network still produces a settlement that both sides and their supervisors can verify.",
      "This is not the same as encrypting a public record. The distinction matters under supervision: a regulator granted a scoped view sees a complete picture of the transactions in scope, without that grant widening visibility to other participants.",
      "Treating privacy as something to be added later inverts the dependency. The disclosure model determines what can be built on top of it, which makes it the first decision rather than a late one.",
    ],
  },
  {
    slug: "what-institutional-grade-actually-requires",
    title: "What institutional grade actually requires",
    category: "Engineering",
    date: "2026-05-02",
    readingTime: "8 min",
    excerpt:
      "The phrase is used to mean fast. In practice it means recoverable, auditable and boring under load, which are harder properties to demonstrate.",
    body: [
      "Institutional grade is a claim about failure, not about throughput. The relevant question is what happens during a network partition, a bad upgrade or a key compromise, and whether the answer was written down before it was needed.",
      "Recoverability comes first. If a component fails, can state be reconstructed from a durable log rather than from the memory of whoever was on call. This is unglamorous and it is what distinguishes a system that can be run under a regulatory obligation.",
      "Auditability follows. Every state change needs an attributable record that reconciles against the ledger without a manual export. Systems that treat audit as a reporting feature discover the gap during their first examination.",
      "Being boring under load is the last property and the hardest to fake. Performance claims are made at peak. Operational confidence is built on the behaviour of a system in its ordinary hours, over quarters, without incident.",
    ],
  },
];

export type NewsItem = {
  date: string;
  category: string;
  title: string;
  href: string;
};

export const NEWSROOM: NewsItem[] = [
  {
    date: "2026-08-04",
    category: "Product",
    title: "Conduit adds scoped supervisory disclosure",
    href: "/newsroom",
  },
  {
    date: "2026-07-22",
    category: "Network",
    title: "Anchor expands validator placement to three new regions",
    href: "/newsroom",
  },
  {
    date: "2026-07-09",
    category: "Research",
    title: "A settlement study with two clearing participants",
    href: "/newsroom",
  },
  {
    date: "2026-06-25",
    category: "Company",
    title: "Engineering team doubles ahead of the Ledger release",
    href: "/newsroom",
  },
  {
    date: "2026-06-11",
    category: "Product",
    title: "Vault ships configurable time locked approval tiers",
    href: "/newsroom",
  },
  {
    date: "2026-05-28",
    category: "Network",
    title: "Bridge routes settle across four instrument classes",
    href: "/newsroom",
  },
];

export const COMPANY = {
  heading: "We build the layer institutions settle on",
  body: "BLANK builds infrastructure for institutions moving regulated assets onto shared ledgers. The team comes from clearing, custody and distributed systems, and the product reflects both halves of that.",
  cards: [
    {
      title: "Correctness first",
      body: "Settlement software is judged on its worst day. We design for the failure case and let the ordinary case follow from it.",
    },
    {
      title: "Configuration over rebuild",
      body: "Institutions arrive with a control framework that works. The product is configured into it rather than asking for it to be replaced.",
    },
    {
      title: "Evidence over assurance",
      body: "Uptime, participation and reconciliation are published continuously, so the service can be checked rather than believed.",
    },
    {
      title: "Operated, not shipped",
      body: "We run what we build. The engineers who write the settlement path are the ones who carry the pager for it.",
    },
  ],
  stats: [
    { value: "2019", label: "Founded" },
    { value: "60+", label: "Engineers" },
    { value: "4", label: "Regions" },
    { value: "99.99%", label: "Network availability" },
  ],
};

export const PARTNERS = {
  heading: "Partners",
  body: "We work with custodians, market infrastructure operators and technology firms who bring the parts of the stack we do not build ourselves.",
  quote: {
    text: "The reason this worked was that the control model did not have to change. We configured our existing approval framework into it and went live against real flow in a quarter.",
    attribution: "Head of Digital Assets, European custodian",
  },
  testimonials: [
    {
      text: "The reason this worked was that the control model did not have to change. We configured our existing approval framework into it and went live against real flow in a quarter.",
      attribution: "Head of Digital Assets, European custodian",
    },
    {
      text: "We had spent two years being told atomic settlement was eighteen months away. This was the first time we saw both legs commit in one step against instruments we actually issue.",
      attribution: "Director of Market Infrastructure, clearing operator",
    },
    {
      text: "What convinced our risk committee was not the throughput number. It was that a transfer breaching a limit produced a rejection with a reason, every time, in front of them.",
      attribution: "Chief Risk Officer, asset manager",
    },
  ],
  categories: [
    {
      title: "Custodians",
      body: "Regulated custody providers integrating Vault as a signing and policy layer.",
    },
    {
      title: "Market infrastructure",
      body: "Exchanges and clearing operators settling through Bridge and Conduit.",
    },
    {
      title: "Technology",
      body: "Implementation partners delivering deployments inside existing estates.",
    },
  ],
};

export type Role = {
  title: string;
  team: string;
  location: string;
  type: string;
};

export const ROLES: Role[] = [
  {
    title: "Distributed Systems Engineer",
    team: "Settlement",
    location: "London",
    type: "Full time",
  },
  {
    title: "Applied Cryptographer",
    team: "Vault",
    location: "Zurich",
    type: "Full time",
  },
  {
    title: "Protocol Engineer",
    team: "Ledger",
    location: "Remote, EU",
    type: "Full time",
  },
  {
    title: "Site Reliability Engineer",
    team: "Anchor",
    location: "Singapore",
    type: "Full time",
  },
  {
    title: "Solutions Architect",
    team: "Delivery",
    location: "New York",
    type: "Full time",
  },
  {
    title: "Technical Writer",
    team: "Product",
    location: "Remote, EU",
    type: "Contract",
  },
];

export const CAREER = {
  heading: "Build settlement infrastructure",
  body: "Small teams, long horizons and a product whose failure modes matter. We hire people who want to own a system rather than a ticket queue.",
};

export const CONTACT = {
  heading: "Talk to an engineer",
  body: "Deployment questions get an engineer rather than a form response. Tell us what you are settling and we will tell you whether we are a fit.",
  offices: [
    { city: "London", detail: "Registered office" },
    { city: "Zurich", detail: "Cryptography and custody" },
    { city: "Singapore", detail: "Asia Pacific operations" },
  ],
};

export const CTA = {
  heading: "Start building on the settlement layer",
  body: "Set up a technical session with the team that operates the network.",
  primary: "Talk to us",
  secondary: "Read the docs",
};

export const FOOTER_COLUMNS = [
  {
    title: "Products",
    links: PRODUCTS.map((p) => ({
      label: p.name,
      href: `/products/${p.slug}`,
    })),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Partners", href: "/partners" },
      { label: "Careers", href: "/career" },
      { label: "Newsroom", href: "/newsroom" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookie policy", href: "/legal/cookies" },
    ],
  },
];

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy policy",
    updated: "2026-06-01",
    sections: [
      {
        heading: "What we collect",
        body: [
          "We collect the information you provide when you contact us or apply for a role, together with basic technical data about how this site is used. We do not buy personal data from third parties.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Contact information is used to respond to your enquiry and, where you have asked for it, to send product updates. Technical data is used in aggregate to understand which pages are useful.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can request a copy of the personal data we hold about you, ask us to correct it, or ask us to delete it. Write to the contact address on this site and we will respond within one month.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms and conditions",
    updated: "2026-06-01",
    sections: [
      {
        heading: "Use of this site",
        body: [
          "This site is provided for information. Nothing on it is an offer to sell a security, an invitation to invest, or advice on which you should rely when making a financial decision.",
        ],
      },
      {
        heading: "Availability",
        body: [
          "We aim to keep this site available but do not guarantee uninterrupted access. Product availability is governed by the service agreement, not by this page.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie policy",
    updated: "2026-06-01",
    sections: [
      {
        heading: "What we set",
        body: [
          "We set the cookies required for the site to function and, with your consent, a small number of analytics cookies that tell us which pages are read.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "You can clear or block cookies in your browser settings. Blocking functional cookies may stop parts of this site from working as intended.",
        ],
      },
    ],
  },
];
