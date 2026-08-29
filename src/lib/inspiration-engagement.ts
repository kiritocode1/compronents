export type EngagementMode =
  | "inspect-install-run"
  | "search-source-catalog"
  | "load-skill"
  | "read-study"
  | "use-evaluate"
  | "curate-with-argent"
  | "inspect-asset"
  | "watch-listen"
  | "practice"
  | "deploy-evaluate"
  | "inspect-tastemaker";

export interface EngagementStrategy {
  mode: EngagementMode;
  instruction: string;
  evidenceRequired: string;
  skill?: string;
}

export interface EngagementInput {
  source: "registry" | "wall";
  category: string;
  kind: readonly string[];
}

const STRATEGIES: Record<EngagementMode, EngagementStrategy> = {
  "inspect-install-run": {
    mode: "inspect-install-run",
    instruction:
      "Inspect the BLANK detail page and source, install the item with the returned command, then run it in the current project.",
    evidenceRequired:
      "A rendered result, focused test, or working runtime flow.",
  },
  "search-source-catalog": {
    mode: "search-source-catalog",
    instruction:
      "Open the source, search its own catalog with task-specific terms, inspect the concrete component, block, API, source, or example, then install or copy only the chosen item.",
    evidenceRequired:
      "The concrete component, documentation page, source file, or example that informed the choice.",
  },
  "load-skill": {
    mode: "load-skill",
    instruction:
      "If the skill is available, read its SKILL.md fully and follow it. If it is absent, inspect it and use the approved skill-install flow only when installation is in scope.",
    evidenceRequired: "The loaded skill name and the procedure it changed.",
  },
  "read-study": {
    mode: "read-study",
    instruction:
      "Read the relevant article, chapter, or documentation section. Extract its thesis, mechanism, evidence, and the decision it changes for this task.",
    evidenceRequired:
      "A source-specific argument or detail that is not merely the catalog description.",
  },
  "use-evaluate": {
    mode: "use-evaluate",
    instruction:
      "Open or run the tool against the current task. Evaluate the produced result or focused behavior instead of stopping at the homepage.",
    evidenceRequired:
      "A produced artifact, API result, command output, or focused evaluation.",
  },
  "curate-with-argent": {
    mode: "curate-with-argent",
    skill: "argent-device-interact",
    instruction:
      "Load argent-device-interact. Use Argent with a running Chromium CDP target, open the live source, discover before interactions, inspect relevant states and motion, and curate details for the current task.",
    evidenceRequired:
      "A live interaction observation and visual evidence such as a screenshot or inspected state.",
  },
  "inspect-asset": {
    mode: "inspect-asset",
    instruction:
      "Inspect the actual specimen or asset and verify usage and licensing constraints before adopting it through the project's approved asset workflow.",
    evidenceRequired:
      "The inspected specimen plus its relevant license or usage constraint.",
  },
  "watch-listen": {
    mode: "watch-listen",
    instruction:
      "Watch or listen to the relevant item, or use a reliable transcript when playback is unavailable. Extract the argument, demonstration, or comparison that matters here.",
    evidenceRequired: "A source-specific point, demonstration, or comparison.",
  },
  practice: {
    mode: "practice",
    instruction:
      "Work through the relevant lesson or exercise. Run the example or solve the focused problem instead of merely linking it.",
    evidenceRequired:
      "A completed focused exercise, example run, or applied lesson.",
  },
  "deploy-evaluate": {
    mode: "deploy-evaluate",
    instruction:
      "Inspect deployment requirements. Deploy only when infrastructure changes are authorized; otherwise produce a concrete fit and tradeoff evaluation.",
    evidenceRequired:
      "A deployment result or a requirement and tradeoff evaluation.",
  },
  "inspect-tastemaker": {
    mode: "inspect-tastemaker",
    instruction:
      "Inspect recent or task-relevant work and follow references to the actual artifact. Do not perform social actions without authorization.",
    evidenceRequired: "The specific work or artifact that informed the task.",
  },
};

const SEARCH_CATEGORIES = [
  "React",
  "React Native and mobile",
  "JavaScript and TypeScript",
  "Icons",
  "Animated icon libraries",
  "UI kit directories",
  "Component libraries and blocks",
  "Animation and motion",
  "WebGL, shaders and creative coding",
  "Audio, video and media",
  "AI agent platforms and infrastructure",
  "Effect ecosystem",
] as const;

const READ_CATEGORIES = [
  "Web platform, CSS and performance",
  "Frontend architecture and patterns",
  "Interface design guidelines and craft",
  "Design essays and culture",
  "LLMs and AI engineering",
  "Machine learning and deep learning",
  "Backend engineering",
  "Distributed systems and computer science",
  "Books and fundamentals",
  "Personal blogs and sites",
  "Engineering essays and culture",
] as const;

const ARGENT_CATEGORIES = [
  "Component demos and micro-interactions",
  "Design inspiration galleries",
  "Portfolios and studios",
  "Branding and logo archives",
] as const;

const USE_CATEGORIES = [
  "Color, gradients and palettes",
  "CSS and shape generators",
  "Typography tools",
  "AI tools, agents and search",
  "Databases and storage",
  "Infrastructure, observability and runtimes",
  "Developer tools and utilities",
  "Productivity and business tools",
  "File sharing and conversion tools",
  "ASCII art and diagram tools",
  "Marketing and growth tools",
  "Docs, slides and content tools",
] as const;

const ASSET_CATEGORIES = [
  "Illustration and visual assets",
  "Type foundries and directories",
  "Free typefaces",
  "Mockups, textures and patterns",
] as const;

const WATCH_CATEGORIES = [
  "YouTube channels",
  "Talks and individual videos",
  "VPS and hosting videos",
] as const;

function categoryMap(
  categories: readonly string[],
  mode: EngagementMode,
): Record<string, EngagementMode> {
  return Object.fromEntries(categories.map((category) => [category, mode]));
}

export const CATEGORY_ENGAGEMENT: Readonly<Record<string, EngagementMode>> = {
  ...categoryMap(SEARCH_CATEGORIES, "search-source-catalog"),
  ...categoryMap(READ_CATEGORIES, "read-study"),
  ...categoryMap(ARGENT_CATEGORIES, "curate-with-argent"),
  ...categoryMap(USE_CATEGORIES, "use-evaluate"),
  ...categoryMap(ASSET_CATEGORIES, "inspect-asset"),
  ...categoryMap(WATCH_CATEGORIES, "watch-listen"),
  "Courses and learning paths": "practice",
  "Coding challenges and practice": "practice",
  "Self-hosted software": "deploy-evaluate",
  "Developer profiles and socials": "inspect-tastemaker",
  "Agent skills directories": "load-skill",
};

const KIND_ENGAGEMENT: Readonly<Record<string, EngagementMode>> = {
  skill: "load-skill",
  video: "watch-listen",
  course: "practice",
  asset: "inspect-asset",
  demo: "curate-with-argent",
  portfolio: "curate-with-argent",
  gallery: "curate-with-argent",
  essay: "read-study",
  library: "search-source-catalog",
  tool: "use-evaluate",
};

const KIND_PRIORITY = [
  "skill",
  "video",
  "course",
  "asset",
  "demo",
  "portfolio",
  "gallery",
  "essay",
  "library",
  "tool",
] as const;

export function resolveEngagement(input: EngagementInput): EngagementStrategy {
  if (input.source === "registry") return STRATEGIES["inspect-install-run"];

  for (const kind of KIND_PRIORITY) {
    if (input.kind.includes(kind)) return STRATEGIES[KIND_ENGAGEMENT[kind]];
  }

  const mode = CATEGORY_ENGAGEMENT[input.category] ?? "read-study";
  return STRATEGIES[mode];
}
