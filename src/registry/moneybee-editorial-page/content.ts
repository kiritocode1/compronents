/**
 * Copy for option three.
 *
 * The layout is a one-to-one replica of the reference; only the words change.
 * Voice follows docs/direction.md: conviction over enthusiasm, concrete over
 * abstract, no urgency, and no "Invest Now" as a call to action.
 */

export const NAV_HOME = [
  { label: "Option 01", href: "/option-1" },
  { label: "Option 02", href: "/option-2" },
  { label: "Option 03", href: "/option-3" },
] as const;

export const NAV_MAIN = [
  { label: "Option 01", href: "/option-1" },
  { label: "Option 02", href: "/option-2" },
  { label: "Option 03", href: "/option-3" },
  { label: "Approach", href: "#approach" },
  { label: "Strategies", href: "#strategies" },
  { label: "Mandates", href: "#mandates" },
  { label: "Contact", href: "#contact" },
] as const;

export const NAV_INNER = [
  { label: "Investment desk", href: "#insights" },
  { label: "Research notes", href: "#research" },
  { label: "Our practice", href: "#practice" },
  { label: "Investor questions", href: "#faq" },
  { label: "Disclosures", href: "#contact" },
  { label: "Investor charter", href: "#contact" },
] as const;

export const NAV_UTILITY = [
  { label: "Investor login", href: "https://www.moneybee.in/register.php" },
  { label: "Grievances", href: "#contact" },
  { label: "SEBI SCORES", href: "#contact" },
  { label: "Risk disclosure", href: "#contact" },
] as const;

export const NAV_LINKS = [
  { label: "About", href: "#approach" },
  { label: "Mandates", href: "#mandates" },
  { label: "Research", href: "#research" },
  { label: "Notes", href: "#insights" },
] as const;

export const SERVICES = [
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/pen.svg",
    title: "Portfolio Management",
    copy: "A discretionary equity mandate built from the bottom up. We hold a focused set of businesses we can explain, and we hold them long enough for the business to matter more than the market.",
    tags: ["PMS", "Listed equity", "Discretionary"],
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/file.svg",
    title: "Alternative Investments",
    copy: "A pooled vehicle for investors who want exposure to the parts of the market that institutional research reaches last, with the mandate flexibility that structure allows.",
    tags: ["AIF", "Category III", "Long horizon"],
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/seo.svg",
    title: "Investment Advisory",
    copy: "For investors who prefer to hold securities directly. We do the research, argue the case, and leave the decision where it belongs, with a clear record of why each idea exists.",
    tags: ["Advisory", "Research", "Suitability"],
  },
] as const;

export const PROJECTS = [
  {
    index: "01 //",
    title: "Specialty chemicals. A capacity cycle read early",
    copy: "Import substitution and a tightening supply base, visible in customer disclosures long before it reached a sell-side note.",
    tags: ["Small cap", "Multi-year hold"],
    year: "2024",
    images: [
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-1.avif",
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-2.avif",
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-3.avif",
    ],
  },
  {
    index: "02 //",
    title: "Auto ancillaries. Content per vehicle rising",
    copy: "The vehicle count was flat and the story looked dull. The value of the parts inside each vehicle was not.",
    tags: ["Mid cap", "Structural shift"],
    year: "2024",
    images: [
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-4.avif",
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-5.avif",
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-6.avif",
    ],
  },
  {
    index: "03 //",
    title: "Financial services. Underwriting that held up",
    copy: "Two lenders, one cycle, very different credit costs. The difference was in the loan book, not the branding.",
    tags: ["Franchise quality", "Cycle tested"],
    year: "2023",
    images: [
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-7.avif",
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-8.avif",
      "https://ui.aryank.space/assets/moneybee-editorial-page/project-image-9.avif",
    ],
  },
] as const;

export const GROWTH = [
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/pen-2.svg",
    badge: "Where we start",
    title: "Fundamental research",
    copy: "We understand the business before we value the security: its economics, its incentives, its history, and who it has to beat.",
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/file-2.svg",
    badge: "What we pay",
    title: "Valuation discipline",
    copy: "A good company is not a good investment at every price. Price is a decision in itself, not a detail of one.",
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/seo-2.svg",
    badge: "How we hold",
    title: "Long-term ownership",
    copy: "Business performance drives returns over years. Market noise drives them over weeks. We invest in the first.",
  },
] as const;

type Feedback = { name: string; role: string; image: string; quote: string };

export const FEEDBACK_A: Feedback[] = [
  {
    name: "Private client",
    role: "Portfolio Management Service",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-1.avif",
    quote:
      "“The process is explainable. Every holding has a reason we can follow, and that has made it far easier to stay patient.”",
  },
  {
    name: "Family office",
    role: "Multi-generational mandate",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-2.avif",
    quote:
      "“What persuaded us was the willingness to talk about risk before returns. The first meeting was about what could go wrong, how positions are sized, and what would make them sell. We had not had that conversation with anyone else.”",
  },
  {
    name: "Long-term investor",
    role: "Alternative Investment Fund",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-4.avif",
    quote:
      "“They were early on two ideas that took three years to work. Nobody rushed us, and nobody changed the story along the way.”",
  },
  {
    name: "Professional investor",
    role: "Investment Advisory",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-3.avif",
    quote:
      "“We hold the securities ourselves, so the research has to stand on its own. It does. The notes are specific, the assumptions are stated, and when a thesis breaks we hear about it from them first rather than from the price. That is the whole relationship.”",
  },
];

export const FEEDBACK_B: Feedback[] = [
  {
    name: "Long-term investor",
    role: "Alternative Investment Fund",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-4.avif",
    quote:
      "“We know what we own and why we own it. Through a difficult year that turned out to matter more than any forecast.”",
  },
  {
    name: "Private client",
    role: "Portfolio Management Service",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-2.avif",
    quote:
      "“The reporting explains decisions rather than celebrating them. When a position was cut, the note said plainly what had changed and what they had got wrong. That candour is rarer than performance.”",
  },
  {
    name: "Business promoter",
    role: "Private client",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-1.avif",
    quote:
      "“They asked about my objectives, my horizon, and my other assets before they said a word about a portfolio.”",
  },
  {
    name: "Retired professional",
    role: "Portfolio Management Service",
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/profile-3.avif",
    quote:
      "“I wanted someone who would still be answering the phone in a bad quarter. Six years in, that has held true. The calls come from the people making the decisions, not from a relationship desk reading a script.”",
  },
];

export const STATISTICS = [
  // The roll lands on the last digit of `upper` and the first of `lower`.
  {
    upper: "4286302749",
    lower: "8245037965",
    suffix: "%",
    label: "Investor retention",
  },
  {
    upper: "4286302742",
    lower: "4245037965",
    suffix: "+",
    label: "Years in the market",
  },
] as const;

type Plan = {
  icon: string;
  badge: string;
  featured?: boolean;
  title: string;
  copy: string;
  price: string;
  duration: string;
  features: string[];
};

export const PLANS_STANDARD: Plan[] = [
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/pen-2.svg",
    badge: "Fixed fee",
    title: "Core Mandate",
    copy: "The starting point for investors placing a meaningful allocation with a discretionary manager for the first time.",
    price: "₹50L",
    duration: "/ minimum",
    features: [
      "Discretionary equity portfolio",
      "Quarterly portfolio review",
      "Monthly holdings statement",
      "Named relationship manager",
    ],
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/plan-icon-02.svg",
    badge: "Most chosen",
    featured: true,
    title: "Focused Mandate",
    copy: "A concentrated portfolio for investors who want fewer positions, held longer, with more contact with the desk.",
    price: "₹1Cr",
    duration: "/ minimum",
    features: [
      "Concentrated portfolio construction",
      "Direct access to the investment team",
      "Written rationale for every position",
      "Annual review with the CIO",
    ],
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/plan-icon-03.svg",
    badge: "Fixed fee",
    title: "Bespoke Mandate",
    copy: "For family offices and institutions with their own constraints, exclusions, and reporting requirements.",
    price: "₹5Cr",
    duration: "/ minimum",
    features: [
      "Mandate written to your constraints",
      "Custom exclusions and reporting",
      "Direct custodian relationship",
      "Succession and transfer support",
    ],
  },
];

export const PLANS_PERFORMANCE: Plan[] = [
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/pen-2.svg",
    badge: "Performance linked",
    title: "Core Mandate",
    copy: "The same portfolio, with a lower fixed fee and a share of returns above an agreed hurdle.",
    price: "₹75L",
    duration: "/ minimum",
    features: [
      "Reduced fixed management fee",
      "Hurdle agreed before you invest",
      "High-water mark applied",
      "Named relationship manager",
    ],
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/plan-icon-02.svg",
    badge: "Most chosen",
    featured: true,
    title: "Focused Mandate",
    copy: "Concentrated construction on a performance-linked basis, for investors comfortable with a longer lock-in.",
    price: "₹1.5Cr",
    duration: "/ minimum",
    features: [
      "Concentrated portfolio construction",
      "Hurdle and catch-up stated in writing",
      "High-water mark applied",
      "Annual review with the CIO",
    ],
  },
  {
    icon: "https://ui.aryank.space/assets/moneybee-editorial-page/plan-icon-03.svg",
    badge: "Performance linked",
    title: "Bespoke Mandate",
    copy: "Fee structure negotiated alongside the mandate itself, as most institutional allocations require.",
    price: "₹7.5Cr",
    duration: "/ minimum",
    features: [
      "Fee structure negotiated with the mandate",
      "Custom exclusions and reporting",
      "Direct custodian relationship",
      "Succession and transfer support",
    ],
  },
];

export const FAQS = [
  {
    q: "What is Moneybee's investment approach?",
    a: "We research businesses from the bottom up, buy them only at a price that leaves room for error, and hold them long enough for business performance rather than sentiment to drive the outcome.",
  },
  {
    q: "Who can invest in the Portfolio Management Service?",
    a: "The PMS is for investors who meet the regulatory minimum of ₹50 lakh and are comfortable with equity market risk over a horizon measured in years rather than quarters.",
  },
  {
    q: "How is risk managed?",
    a: "Before capital is committed, not after. Business quality filters, valuation discipline, position sizing, and balance-sheet strength all sit ahead of the buy decision, and every holding is reviewed against the thesis that justified it.",
  },
  {
    q: "How often will I hear from the team?",
    a: "Monthly statements, quarterly reviews, and a written note whenever something material changes. When a thesis breaks you hear it from us, in plain language, before you read it in the price.",
  },
  {
    q: "What happens in a bad year?",
    a: "We explain it. Drawdowns are part of equity investing and we would rather discuss the ones we expect than pretend they will not arrive. Nothing in the process changes because a quarter was difficult.",
  },
] as const;

export const POSTS = [
  {
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/blog-image-01.avif",
    date: "Published on 14 July 2026",
    title: "Why patience is still the most underpriced edge in Indian equities",
    tag: "Philosophy",
    tone: "#fdefe2",
  },
  {
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/blog-image-02.avif",
    date: "Published on 2 June 2026",
    title: "Reading beyond the quarter: what a cash flow statement admits",
    tag: "Research",
    tone: "#edeeef",
  },
  {
    image:
      "https://ui.aryank.space/assets/moneybee-editorial-page/blog-image-03.avif",
    date: "Published on 19 May 2026",
    title:
      "The price of conviction, and when a good company is a bad investment",
    tag: "Valuation",
    tone: "#fbd4b3",
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Moneybee",
    links: [
      { label: "Our approach", href: "#approach" },
      { label: "Strategies", href: "#strategies" },
      { label: "Research", href: "#research" },
      { label: "Desk notes", href: "#insights" },
      { label: "Mandates", href: "#mandates" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Investors",
    links: [
      { label: "Investor login", href: "https://www.moneybee.in/register.php" },
      { label: "Disclosures", href: "#contact" },
      { label: "Investor charter", href: "#contact" },
      { label: "Grievances", href: "#contact" },
      { label: "SEBI SCORES", href: "#contact" },
      { label: "Risk disclosure", href: "#contact" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com" },
      { label: "X", href: "https://www.x.com" },
      { label: "YouTube", href: "https://www.youtube.com" },
      { label: "Instagram", href: "https://www.instagram.com" },
    ],
  },
] as const;

export const BRAND_LOGOS = [
  "https://ui.aryank.space/assets/moneybee-editorial-page/logo-1.svg",
  "https://ui.aryank.space/assets/moneybee-editorial-page/logo-9.svg",
  "https://ui.aryank.space/assets/moneybee-editorial-page/logo-6.svg",
  "https://ui.aryank.space/assets/moneybee-editorial-page/logo-8.svg",
  "https://ui.aryank.space/assets/moneybee-editorial-page/logo-7.svg",
] as const;
