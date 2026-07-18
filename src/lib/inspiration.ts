export interface InspirationLink {
  title: string;
  href: string;
  description?: string;
}

export interface InspirationGroup {
  title: string;
  links: InspirationLink[];
}

export const inspirationGroups: InspirationGroup[] = [
  {
    title: "React",
    links: [
      {
        title: "React Flow",
        href: "https://reactflow.dev/",
        description:
          "Library for building node-based editors and interactive diagrams in React, drag-and-drop nodes, edges and custom node types, used for flow builders, pipelines and mind maps.",
      },
      {
        title: "Made With React",
        href: "https://madewithreactjs.com/",
        description:
          "Curated showcase of projects and apps built with React, browsable by category: frameworks, UI components, boilerplates and full apps.",
      },
      {
        title: "React Handbook",
        href: "https://devouringdetails.com/resources/react-handbook",
        description:
          "Guide to writing better React components through naming and architecture patterns: contextual props to cut redundancy, deriving booleans from existing props to prevent impossible states, and enum props for stronger typing and autocomplete.",
      },
      {
        title: "React Fiber, part 1",
        href: "https://kishore.app/blog/fiber-part-1?utm_source=x",
        description:
          "First part of a blog series digging into React Fiber, React's reconciliation engine, explaining how it schedules and interrupts rendering work.",
      },
      {
        title: "React Tricks",
        href: "https://molefrog.com/notes/react-tricks",
        description:
          "Performance and bundle-size techniques the author learned maintaining Wouter, a lightweight React router: composing with React.cloneElement, stable object references, initializing with useState, stable callbacks via useEvent, and subscribing to external state with useSyncExternalStore.",
      },
      {
        title: "Web Workers with React",
        href: "https://www.rahuljuliato.com/posts/react-workers",
        description:
          "Post walking through offloading heavy computation from a React app's main thread into Web Workers, keeping the UI responsive during expensive work.",
      },
      {
        title: "Prod-ready React hooks",
        href: "https://4markdown.com/1-prod-ready-react-usefeature-and-usesimplefeature-hooks/",
        description:
          "Walks through two custom hooks for managing UI visibility state: useSimpleFeature for plain toggles and useFeature for toggles that carry associated data, using a discriminant property for type safety.",
      },
      {
        title: "React TypeScript Cheatsheet",
        href: "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/",
        description:
          "Community-maintained cheatsheet for typing React with TypeScript: props, hooks, forms, events and common patterns, the go-to reference when you're not sure how to type something in React.",
      },
      {
        title: "TkDodo's blog",
        href: "https://tkdodo.eu/blog/all",
        description:
          "Blog by Dominik Dorfmeister, maintainer of TanStack Query, with deep, practical posts on React Query, testing, and React patterns that go well beyond the official docs.",
      },
      {
        title: "React Grab",
        href: "https://react-grab.com/",
        description:
          "Browser tool for grabbing a UI element's React component context with a hover and keyboard shortcut, for handing precise context to a coding agent instead of describing it in prose.",
      },
      {
        title: "React Quill",
        href: "https://zenoamaro.github.io/react-quill/",
        description:
          "React wrapper around the Quill rich text editor, for dropping a full WYSIWYG editor into a React app without wiring up Quill's imperative API by hand.",
      },
      {
        title: "NextFaster",
        href: "https://github.com/ethanniser/NextFaster",
        description:
          "Performance-obsessed Next.js e-commerce template built to feel instant: aggressive prefetching, minimal client JS and careful data loading, with a live demo and full source to study.",
      },
    ],
  },
  {
    title: "React Native and mobile",
    links: [
      {
        title: "React Native Reusables",
        href: "https://reactnativereusables.com/",
        description:
          "shadcn/ui-style, copy-paste component library for React Native and Expo, universal (works on web too) components styled with NativeWind.",
      },
      {
        title: "React Native Audio API",
        href: "https://docs.swmansion.com/react-native-audio-api/",
        description:
          "Native audio library from Software Mansion giving React Native a Web Audio API-like interface, for real-time effects, visualization and multi-track playback consistent across iOS, Android and web.",
      },
      {
        title: "React Native data detector",
        href: "https://github.com/pablogdcr/react-native-data-detector",
        description:
          "Cross-platform text data detection for React Native, using NSDataDetector on iOS and ML Kit Entity Extraction on Android to find phone numbers, URLs, emails, dates and addresses in text, with both imperative and hook-based APIs.",
      },
      {
        title: "Expo Demos",
        href: "https://expo.dev/demos",
        description:
          "Official gallery of demo apps built with Expo, showing real implementations of specific APIs and patterns you can reference or clone.",
      },
      {
        title: "Margelo",
        href: "https://margelo.com/",
        description:
          "Mobile app development studio specializing in high-performance React Native apps, known for widely used open-source libraries (Vision Camera, Nitro Modules and others) running on billions of devices.",
      },
      {
        title: "NativeWind",
        href: "https://www.nativewind.dev",
        description:
          "Brings Tailwind CSS's utility classes to React Native, so styling mobile components uses the same className syntax as a Tailwind web project.",
      },
      {
        title: "reactnative.se",
        href: "https://github.com/pontusab/reactnative.se",
        description:
          "Community showcase site listing React Native apps built in Sweden, by Pontus Abrahamsson.",
      },
      {
        title: "React Native ExecuTorch",
        href: "https://github.com/software-mansion/react-native-executorch",
        description:
          "Software Mansion library for declarative on-device inference: LLMs, Whisper speech-to-text and vision models via hooks like useLLM and useWhisper, running fully offline once a model is bundled.",
      },
      {
        title: "React Native RAG",
        href: "https://blog.swmansion.com/introducing-react-native-rag-fbb62efa4991",
        description:
          "Software Mansion library pairing on-device embeddings with an ExecuTorch-run LLM so a full RAG pipeline executes on-device with no server round trip.",
      },
      {
        title: "Expo Router v6",
        href: "https://expo.dev/blog/expo-router-v6",
        description:
          "File-based router for Expo that now forks parts of React Navigation directly instead of just wrapping it, and adds native tabs for a platform-native tab bar.",
      },
    ],
  },
  {
    title: "JavaScript and TypeScript",
    links: [
      {
        title: "Making html_of_jsx 10x faster",
        href: "https://sancho.dev/blog/making-html-of-jsx-10x-faster",
        description:
          "Explains how static analysis sped up the html_of_jsx library by pre-computing the static parts of HTML at build time instead of runtime, separating dynamic content from fixed structure for a 2-12x speedup depending on nesting.",
      },
      {
        title: "Eloquent JavaScript: values",
        href: "https://eloquentjavascript.net/01_values.html",
        description:
          "Chapter 1 of Marijn Haverbeke's free, well-known JavaScript book, covering values, types and expressions from first principles.",
      },
      {
        title: "Eloquent JavaScript: program structure",
        href: "https://eloquentjavascript.net/02_program_structure.html",
        description:
          "Chapter 2 of Eloquent JavaScript, covering control flow, functions and how JavaScript programs are structured.",
      },
      {
        title: "Exploring JS",
        href: "https://exploringjs.com/",
        description:
          "Axel Rauschmayer's free, deeply detailed online book covering modern JavaScript language features from the ground up, often used as a language reference rather than a beginner tutorial.",
      },
      {
        title: "You Don't Know JS",
        href: "https://github.com/getify/You-Dont-Know-JS",
        description:
          "Kyle Simpson's book series digging into JavaScript's actual mechanics (scope, closures, this, prototypes, async), aimed at developers who use JS daily but want to understand why it behaves the way it does.",
      },
      {
        title: "Myers diff algorithm",
        href: "https://www.30secondsofcode.org/js/s/myers-diff-algorithm/",
        description:
          "Explains and implements the Myers diff algorithm in JavaScript, the same algorithm behind `git diff` and most text-diffing tools.",
      },
      {
        title: "30 seconds of code",
        href: "https://www.30secondsofcode.org/js/p/1/",
        description:
          "Library of short, copy-paste JavaScript snippets for common tasks, each explained in a few lines, for when you want a working solution without pulling in a dependency.",
      },
      {
        title: "VisualizeJS",
        href: "https://visualizejs.com/javascript",
        description:
          "Interactive, step-by-step visualizations of core JavaScript runtime concepts (event loop, closures, promises, memory) across 15 topics from beginner to advanced.",
      },
      {
        title: "types.kitlangton.com",
        href: "https://types.kitlangton.com",
        description:
          "Visualizer for TypeScript type structures, for seeing how a complex generic or conditional type actually resolves.",
      },
      {
        title: "VueUse",
        href: "https://github.com/vueuse/vueuse",
        description:
          "Collection of 200+ Vue Composition API utility functions (useMouse, useStorage, useFetch and similar), by Anthony Fu, works with both Vue 2 and 3.",
      },
      {
        title: "Shiki",
        href: "https://github.com/shikijs/shiki",
        description:
          "Syntax highlighter that reuses TextMate grammars and real VS Code themes for byte-for-byte accurate highlighting, the engine behind VitePress and Nuxt Content's code blocks.",
      },
      {
        title: "magic-regexp",
        href: "https://github.com/danielroe/magic-regexp",
        description:
          "Compiled-away, type-safe, readable alternative to writing raw RegExp literals in TypeScript, by Daniel Roe.",
      },
    ],
  },
  {
    title: "Web platform, CSS and performance",
    links: [
      {
        title: "How modern browsers work",
        href: "https://addyo.substack.com/p/how-modern-browsers-work",
        description:
          "Addy Osmani newsletter post walking through what actually happens inside a browser between a URL request and pixels on screen: parsing, rendering, compositing and the performance implications of each step.",
      },
      {
        title: "A friendly intro to container queries",
        href: "https://www.joshwcomeau.com/css/container-queries-introduction/",
        description:
          "Josh Comeau's approachable explainer on CSS container queries, how they differ from media queries and when to reach for them instead.",
      },
      {
        title: "Picture perfect image optimization",
        href: "https://bholmes.dev/blog/picture-perfect-image-optimization/",
        description:
          "Deep dive on responsive image optimization on the web: srcset, sizes, formats and the picture element, aimed at shipping the right image for the right device.",
      },
      {
        title: "SVG tutorial",
        href: "https://svg-tutorial.com/summary",
        description:
          "Interactive, slide-based SVG tutorial starting from circles and rectangles and working up to paths, bezier curves, animation and dynamic transforms.",
      },
      {
        title: "WebHaptics",
        href: "https://haptics.lochie.me/",
        description:
          "Demo of haptic (vibration) feedback for the mobile web, showing how to add tactile response to web interactions instead of only visual/audio feedback.",
      },
      {
        title: "WebVitals",
        href: "https://webvitals.com/",
        description:
          "Free tool for measuring a site's real-world Core Web Vitals from actual user data, surfacing speed and responsiveness issues to fix.",
      },
      {
        title: "Media Cheatsheet",
        href: "https://mediacheatsheet.com",
        description:
          "Quick reference for common CSS media query breakpoints, saving a trip to check exact device widths.",
      },
      {
        title: "Turbopack persistent build cache",
        href: "https://nextjs.org/blog/next-16-3-turbopack",
        description:
          "Next.js 16.3 announcement extending Turbopack's cache to production builds, not just dev, citing roughly 90% dev memory reduction on Vercel's own large internal apps.",
      },
    ],
  },
  {
    title: "Frontend architecture and patterns",
    links: [
      {
        title: "Patterns.dev",
        href: "https://www.patterns.dev/",
        description:
          "Free book/reference on modern web app design patterns and rendering patterns (SSR, ISR, islands, and classic JS design patterns applied to React and Vue), from the team behind web.dev.",
      },
      {
        title: "GreatFrontend blog",
        href: "https://www.greatfrontend.com/blog",
        description:
          "Blog from GreatFrontend covering front-end interview prep and practical engineering topics, system design, JavaScript internals, and framework-specific deep dives.",
      },
      {
        title: "Fundamentals of Frontend Architecture",
        href: "https://frontendatscale.com/courses/frontend-architecture/foundations/introduction/",
        description:
          "Course on structuring large frontend codebases: module boundaries, state management strategy and architectural tradeoffs as an app scales past a handful of components.",
      },
      {
        title: "JSON Render",
        href: "https://json-render.dev/",
        description:
          "Generative UI framework where an AI generates JSON constrained to a predefined component catalog, streamed and progressively rendered in React or React Native, exportable as standalone code with no runtime dependency.",
      },
      {
        title: "Puck",
        href: "https://github.com/measuredco/puck",
        description:
          "Open-source, self-hosted visual page builder for React: drag-and-drop editing on top of your own component library, for giving non-developers a CMS-like editing experience.",
      },
      {
        title: "Workflow SDK",
        href: "https://workflow-sdk.dev/",
        description:
          "TypeScript library that makes async functions durable: automatic retries, state persistence and resumability, bringing reliability and observability to long-running JavaScript workflows and agents.",
      },
      {
        title: "Styleframe",
        href: "https://www.styleframe.dev",
        description:
          "TypeScript library for writing type-safe, composable CSS for design systems. Generates CSS at build time for performance, with optional runtime styling, and works with React, Vue or Astro.",
      },
      {
        title: "Pure UI",
        href: "https://rauchg.com/2015/pure-ui",
        description:
          "Guillermo Rauch's 2015 essay arguing UI is a pure function of state, an early articulation of the thinking that shaped React's component model.",
      },
      {
        title: "Nitro",
        href: "https://nitro.build",
        description:
          "Universal server engine originally built inside Nuxt then extracted standalone; the same codebase deploys unmodified to Node, Cloudflare Workers, Deno, Bun, AWS Lambda, Vercel and Netlify.",
      },
      {
        title: "fontaine",
        href: "https://github.com/danielroe/fontaine",
        description:
          "Daniel Roe's library that auto-generates font-fallback metrics to eliminate cumulative layout shift from web font loading.",
      },
      {
        title: "beasties",
        href: "https://github.com/danielroe/beasties",
        description:
          "Daniel Roe's maintained fork of Critters: inlines an app's critical CSS and lazy-loads the rest.",
      },
    ],
  },
  {
    title: "Icons",
    links: [
      {
        title: "Iconiqui",
        href: "https://iconiqui.com/",
        description:
          "Icon-focused design system built on shadcn/ui and Motion, with subtle, functional animation that stays out of the way rather than drawing attention to itself.",
      },
      {
        title: "Animate UI icons",
        href: "https://animate-ui.com/docs/icons?icon=volume-1",
        description:
          "Animated icon set from the Animate UI component library, each icon with a built-in hover/trigger animation instead of a static SVG.",
      },
      {
        title: "Phosphor Icons",
        href: "https://phosphoricons.com/",
        description:
          "Large, flexible open-source icon family with multiple weights (thin, light, regular, bold, fill, duotone), one of the most widely used icon sets in modern web UI.",
      },
      {
        title: "Reicon",
        href: "https://reicon.dev/usage/react",
        description:
          "React icon library with its own usage docs for dropping icons into a React app.",
      },
      {
        title: "Heroicons Animated",
        href: "https://www.heroicons-animated.com/",
        description:
          "Open-source set of 316 icons that adds smooth Motion-powered animation on top of the original Heroicons, free under MIT for React projects.",
      },
      {
        title: "Glyphs",
        href: "https://glyphs.fyi/dir?i=hourglass",
        description:
          "Icon directory site for browsing and picking glyphs, linked here to a specific hourglass icon entry.",
      },
      {
        title: "Smallbits",
        href: "https://smallbits.design",
        description:
          "Set of 290+ pixel icons constrained to an 8x8 grid, by Minor Adventures, minimalist icon design where every pixel counts.",
      },
      {
        title: "Gravity UI icons",
        href: "https://github.com/gravity-ui/icons",
        description:
          "Open-source icon set from Yandex's Gravity UI design system, consistent, interface-focused SVG icons free to use in any project.",
      },
      {
        title: "Icônes",
        href: "https://github.com/antfu-collective/icones",
        description:
          "Icon explorer by Anthony Fu searching 200,000+ icons across 150+ sets via the Iconify API, with instant local fuzzy search and one-click copy for multiple frameworks.",
      },
      {
        title: "unplugin-icons",
        href: "https://github.com/unplugin/unplugin-icons",
        description:
          "Bundler plugin (Vite, Webpack, Rollup, esbuild) that turns any Iconify icon set into an importable component on demand, no icon font or sprite sheet needed.",
      },
    ],
  },
  {
    title: "Animated icon libraries",
    links: [
      {
        title: "Icon Animator",
        href: "https://www.iconanimator.app/",
        description:
          "Web app for turning SVG icons into animated ones, adjusting motion, easing and timing in the browser, then exporting the result as code or Lottie for use in interfaces.",
      },
      {
        title: "Lucide Animated",
        href: "https://lucide-animated.com",
        description:
          "Free, open-source collection of 435+ animated React icons built on Lucide and Motion. Copy-paste ready, installable via the shadcn CLI, MIT licensed, with ports for Svelte, Vue, Angular and Flutter.",
      },
      {
        title: "Eva Icons",
        href: "https://akveo.github.io/eva-icons",
        description:
          "Open-source pack of carefully designed UI icons covering common interface actions and items, free to use in any project.",
      },
      {
        title: "Moving Icons",
        href: "https://www.movingicons.dev",
        description:
          "500+ hand-crafted, interaction-ready animated Lucide icons for Svelte 5. Tree-shakeable, zero dependencies, installable via npm or the shadcn-svelte registry, with animations controllable through props and hover states.",
      },
      {
        title: "useAnimations",
        href: "https://useanimations.com",
        description:
          "Free library of 90+ handcrafted animated icons built on the Lottie framework, working across React, iOS and Android, with both looping and click-triggered playback.",
      },
      {
        title: "Blendy",
        href: "https://blendy.tahazsh.com",
        description:
          "Library for morphing shapes smoothly from one icon or SVG into another, useful for animated icon-swap transitions instead of a hard cut.",
      },
      {
        title: "Animate Icons",
        href: "https://animateicons.vercel.app",
        description:
          "Collection of animated icon components for React, ready to drop into a project for hover and state-change micro-interactions.",
      },
      {
        title: "Lineicons",
        href: "https://lineicons.com",
        description:
          "Free line-style icon pack with a large, consistent set of outline icons for interfaces and marketing sites.",
      },
    ],
  },
  {
    title: "UI kit directories",
    links: [
      {
        title: "basecn",
        href: "http://basecn.dev",
        description:
          "shadcn/ui-style component distribution built on Base UI (the unstyled component library from the MUI team) instead of Radix primitives.",
      },
      {
        title: "smoothui",
        href: "http://smoothui.dev",
        description:
          "Copy-paste component library focused on smooth, physics-based motion and micro-interactions built with Tailwind and Motion.",
      },
      {
        title: "Hexta UI",
        href: "http://hextaui.com",
        description:
          "Library of extended components and blocks built on top of shadcn/ui, offering ready-to-use foundation components that go beyond shadcn's default set.",
      },
      {
        title: "Tailark",
        href: "http://tailark.com",
        description:
          "Collection of reusable marketing site components built with shadcn/ui and Tailwind, hundreds of premium blocks and ready-made landing pages across multiple design styles.",
      },
      {
        title: "Luxe UI",
        href: "http://luxeui.com",
        description:
          "Copy-paste component library aiming for an elegant, sophisticated visual style, built with React, Tailwind, Motion and Radix UI.",
      },
      {
        title: "Animate UI",
        href: "http://animate-ui.com",
        description:
          "shadcn/ui-style component library where every component ships with a built-in Motion animation, copy-paste like shadcn but animated by default.",
      },
      {
        title: "Magic UI",
        href: "http://magicui.design",
        description:
          "Popular free component library of animated, marketing-site-friendly effects (particles, beams, text animations) built on shadcn/ui and Tailwind.",
      },
      {
        title: "HeroUI",
        href: "http://heroui.com",
        description:
          "Full React UI library (formerly NextUI) built on Tailwind CSS and React Aria, providing accessible, themeable components as a complete design system rather than a copy-paste block collection.",
      },
      {
        title: "Coss UI",
        href: "http://coss.com/ui",
        description:
          "Modern component library built on Base UI aimed at both human developers and AI coding agents, with 496+ pre-built components from basic buttons to complex dialogs, date pickers and command palettes.",
      },
      {
        title: "Shoelace",
        href: "https://shoelace.style/",
        description:
          "Framework-agnostic library of standalone web components (custom elements), so components work the same in React, Vue, plain HTML or anything else without a JS framework dependency.",
      },
      {
        title: "Shoogle",
        href: "https://shoogle.dev",
        description:
          "Search engine for the shadcn ecosystem: search blocks and components across many different shadcn registries at once, browse what's new, and bookmark favorites.",
      },
      {
        title: "termcn",
        href: "https://www.termcn.dev",
        description:
          "shadcn, but for terminal-themed UI components, copy-paste pieces styled to look like a terminal window.",
      },
      {
        title: "formscn",
        href: "https://formscn.space",
        description:
          "shadcn, but for form components, copy-paste form fields and layouts styled to match shadcn/ui.",
      },
      {
        title: "servercn",
        href: "https://servercn.vercel.app",
        description:
          "shadcn, but for server and infrastructure status components, uptime badges and status displays styled to match shadcn/ui.",
      },
      {
        title: "Flowkit UI",
        href: "https://flowkit-ui.vzkiss.com",
        description:
          "Component library that fills in UI patterns shadcn/ui doesn't ship, following shadcn conventions, including a Creatable Combobox that combines multiselect, autocomplete and inline item creation.",
      },
      {
        title: "Satis UI",
        href: "https://satisui.xyz",
        description:
          "React component library on top of shadcn/ui with Awwwards-inspired, GSAP-powered animated components, built with Next.js, TypeScript and Tailwind for copy-paste use.",
      },
      {
        title: "bundui",
        href: "https://bundui.io",
        description:
          "shadcn/ui-based component and block library for quickly assembling marketing and app pages from copy-paste pieces.",
      },
      {
        title: "shadcnstore",
        href: "https://shadcnstore.com",
        description:
          "Marketplace of shadcn/ui blocks and page templates, both free and paid, for faster page assembly.",
      },
      {
        title: "Joly UI",
        href: "https://www.jolyui.dev/docs/components",
        description:
          "50+ free shadcn/ui components for React and Next.js, copy-paste ready, combining accessibility with Framer Motion and WebGL-driven animation across buttons, text effects, inputs and navigation.",
      },
      {
        title: "Assistant UI",
        href: "https://www.assistant-ui.com",
        description:
          "React component library specifically for building AI chat interfaces: message streams, tool-call rendering and input handling out of the box.",
      },
      {
        title: "9ui",
        href: "https://www.9ui.dev",
        description:
          "Minimal shadcn-style component library with a pared-back visual style.",
      },
      {
        title: "ui-layouts",
        href: "https://www.ui-layouts.com",
        description:
          "Copy-paste library of animated Tailwind layout components for building page sections quickly.",
      },
      {
        title: "hookcn",
        href: "https://hookcn.ouassim.tech",
        description:
          "shadcn, but for React hooks: copy-paste, well-typed hooks distributed the same way shadcn/ui distributes components.",
      },
      {
        title: "shadcnui-blocks",
        href: "https://www.shadcnui-blocks.com/blocks",
        description:
          "Free shadcn/ui page section blocks for assembling landing pages without building every section from scratch.",
      },
      {
        title: "buouui",
        href: "https://buouui.com/docs",
        description:
          "Minimal shadcn-style component library with a pared-back visual style.",
      },
      {
        title: "MynaUI",
        href: "https://mynaui.com",
        description:
          "Free, beautifully designed UI component library aimed at giving indie projects a polished look without a design team.",
      },
      {
        title: "HyperUI",
        href: "https://www.hyperui.dev",
        description:
          "Free, open-source Tailwind CSS component library with a large catalog of marketing and application UI sections to copy and paste.",
      },
      {
        title: "tocn",
        href: "https://tocn.vercel.app",
        description:
          "shadcn, but for terminal-themed components: copy-paste UI pieces styled to look like a terminal window.",
      },
      {
        title: "Geist Design System",
        href: "https://vercel.com/geist",
        description:
          "Vercel's open-sourced design system: React components, guidelines and the Geist Sans/Mono type family, the visual language behind Vercel's own products.",
      },
    ],
  },
  {
    title: "Component libraries and blocks",
    links: [
      {
        title: "Awesome shadcn/ui",
        href: "https://awesome-shadcn-ui.vercel.app/",
        description:
          "Curated list of shadcn/ui-compatible component libraries, blocks, themes and tools, the map of the whole shadcn ecosystem in one page.",
      },
      {
        title: "Origin UI",
        href: "https://github.com/origin-space/originui",
        description:
          "Large, well-known collection of copy-paste components built on shadcn/ui and Tailwind, hundreds of ready-made pieces from form fields to complex widgets, one of the most popular shadcn extensions.",
      },
      {
        title: "OriginKit",
        href: "https://originkit.dev",
        description:
          "Free library of animated interface components for adding polished motion and interactions to web projects.",
      },
      {
        title: "Fancy Components",
        href: "https://www.fancycomponents.dev/",
        description:
          "Component library focused on eye-catching visual effects (particles, distortions, creative hover states) for marketing sites that want to stand out.",
      },
      {
        title: "Componentry",
        href: "https://www.componentry.fun/docs",
        description:
          "Growing collection of animated primitives for React spanning text animations, interactive components, hero backgrounds and visual effects.",
      },
      {
        title: "React Bits",
        href: "https://reactbits.dev/",
        description:
          "Library of animated UI components for React, motion-enhanced, ready-to-use interface elements for adding visual polish quickly.",
      },
      {
        title: "Intent UI",
        href: "https://intentui.com/components",
        description:
          "Accessible React component library built on React Aria with 80+ production-ready components, positioned as 'copy, customize, and own your UI' rather than a locked-in dependency.",
      },
      {
        title: "Unlumen UI",
        href: "https://ui.unlumen.com/",
        description:
          "React component library offering both free and premium ready-to-use UI elements.",
      },
      {
        title: "Watermelon UI",
        href: "https://ui.watermelon.sh/animated-components/category/tabs",
        description:
          "Animated component library, this link points at its tabs category, showing motion-driven tab navigation components.",
      },
      {
        title: "Eldora UI",
        href: "https://www.eldoraui.site/docs",
        description:
          "Component library of animated, copy-paste React pieces, including creative hover effects like card flips.",
      },
      {
        title: "Bklit charts",
        href: "https://ui.bklit.com/",
        description:
          "Chart component library from Bklit, styled data visualization components (line, bar, funnel and more) for React dashboards.",
      },
      {
        title: "Reactix",
        href: "https://www.reacticx.com/",
        description:
          "React component library offering ready-to-use UI pieces for building interfaces faster.",
      },
      {
        title: "Nexvyn UI",
        href: "https://ui.nexvyn.dev/components/bounce-sidebar",
        description:
          "React component library emphasizing visual clarity and premium micro-interactions through physics-based animation, built with Framer Motion and semantic tokens that adapt to light/dark mode.",
      },
      {
        title: "beUI",
        href: "https://beui.dev/components/blocks/overflow-actions",
        description:
          "React motion component library with 30+ animated pieces, including an overflow-actions pill rail that springs open to reveal extra controls.",
      },
      {
        title: "ReUI",
        href: "https://reui.io/components/tooltip",
        description:
          "shadcn/ui-based component library with a broad catalog of individual components (this link points at its tooltip) plus full page patterns.",
      },
      {
        title: "Molecule UI",
        href: "https://www.moleculeui.design/docs/components/profile-menu",
        description:
          "Component library including pieces like a styled profile menu dropdown, for assembling app UI chrome quickly.",
      },
      {
        title: "Spectrum UI",
        href: "https://ui.spectrumhq.in/docs/multistepform",
        description:
          "React/Next.js component library spanning basic inputs to complex pieces like kanban boards, animated charts and multi-step forms.",
      },
      {
        title: "Shark UI",
        href: "https://shark.vini.one/docs/components/tour",
        description:
          "Design system with reusable, customizable UI elements, including a guided product-tour component for onboarding flows.",
      },
      {
        title: "GAIA UI",
        href: "https://ui.heygaia.io/docs/components/component-preview-tooltip",
        description:
          "Open-source component library with charts, cards, tooltips and interactive pieces, built for the HeyGaia product.",
      },
      {
        title: "Morphin",
        href: "https://morphin.dev/components/scroll-scramble-section",
        description:
          "Component library specializing in scroll-triggered text and layout effects, this link shows its scroll-scramble text component.",
      },
      {
        title: "uselayouts",
        href: "https://uselayouts.com/docs/components/animated-collection",
        description:
          "Component library including an Animated Collection piece that morphs between list, card and pack views with shared-element transitions.",
      },
      {
        title: "Boneyard",
        href: "https://boneyard.vercel.app/overview",
        description:
          "Tool that generates pixel-perfect skeleton loading screens by capturing a component's real rendered layout: wrap it in a Skeleton tag, run the CLI, and get placeholder 'bones' as JSON, framework-agnostic.",
      },
      {
        title: "Kairo UI",
        href: "https://www.kairoui.online/templates",
        description:
          "Free, open-source landing page templates built with Next.js and Tailwind, installable with a single command.",
      },
      {
        title: "Liquid Glass OSS",
        href: "https://liquid-glass-oss.vercel.app/",
        description:
          "Open-source recreation of Apple's Liquid Glass visual effect for the web.",
      },
      {
        title: "framecn",
        href: "https://www.framecn.dev/",
        description:
          "shadcn/ui-compatible collection of video components built on Editframe, for embedding polished, customizable video UI pieces.",
      },
      {
        title: "tweakcn",
        href: "https://tweakcn.com/editor/theme",
        description:
          "Visual theme editor for shadcn/ui: tweak colors, typography and component styling interactively and export the resulting theme, open source.",
      },
      {
        title: "Code Blocks by pheralb",
        href: "https://code-blocks.pheralb.dev/",
        description:
          "Component collection for displaying code snippets with syntax highlighting, line numbers, diff notation, focus effects and line highlighting.",
      },
      {
        title: "Shadcncraft tooltip",
        href: "https://shadcncraft.com/components/official-shadcn/tooltip",
        description:
          "Design system built on shadcn/ui offering production-ready components and blocks with matching Figma files, this link shows its tooltip component; serves 9,000+ builders.",
      },
      {
        title: "mindmapcn",
        href: "https://mindmapcn.vercel.app/docs/installation",
        description:
          "shadcn/ui-compatible mind map component for React, with automatic light/dark theming via OKLCH colors.",
      },
      {
        title: "Micro FAQs",
        href: "https://micro.bossadizenith.me/components/faqs",
        description:
          "Small, focused component from a library of reusable UI pieces (carousels, forms, navigation, accordions), this link shows its FAQ accordion component.",
      },
      {
        title: "Vengeance UI",
        href: "https://www.vengenceui.com/components/twisting-ribbon",
        description:
          "Component library featuring unusual, high-motion effects, this link shows its twisting ribbon component.",
      },
      {
        title: "jal-co JSON viewer",
        href: "https://ui.justinlevine.me/docs/components/json-viewer",
        description:
          "Open-source, always-free React/Tailwind component collection; this link shows its collapsible, syntax-highlighted JSON tree viewer with search and copy.",
      },
      {
        title: "Evil Charts",
        href: "https://evilcharts.com/docs",
        description:
          "Copy-paste chart component library built on Recharts and shadcn/ui, styled data visualizations that look better than the defaults out of the box.",
      },
      {
        title: "Eldora card flip hover",
        href: "https://www.eldoraui.site/docs/components/card-flip-hover",
        description:
          "Card component from Eldora UI that flips on hover to reveal a back face, a common pattern for feature or team cards.",
      },
      {
        title: "Border Beam",
        href: "https://beam.jakubantalik.com/",
        description:
          "Animated border-beam component for React: a light trail travels around an element's border, a popular highlight effect for cards and buttons.",
      },
      {
        title: "React Wheel Picker",
        href: "https://react-wheel-picker.chanhdai.com/",
        description:
          "iOS-style scrollable wheel picker component for React, the kind of control used for date/time or option selection on mobile.",
      },
      {
        title: "RigidUI",
        href: "https://www.rigidui.com/docs/hooks/use-location",
        description:
          "React component and hooks library; this link shows its useLocation hook, which handles browser geolocation and reverse geocoding via OpenStreetMap.",
      },
      {
        title: "Solace UI",
        href: "https://www.solaceui.com/sections/hero-section",
        description:
          "Component library of full page sections, this link shows a hero section example, for assembling marketing pages from bigger building blocks than single components.",
      },
      {
        title: "tnks data table",
        href: "https://github.com/jacksonkasi1/tnks-data-table",
        description:
          "Advanced React data table component with server-side sorting, filtering and pagination, backed by Hono.js, Drizzle ORM and PostgreSQL rather than doing the work client-side.",
      },
      {
        title: "Driver.js",
        href: "https://driverjs.com/",
        description:
          "Lightweight, dependency-free library for building product tours and onboarding walkthroughs: highlight an element, attach a popover, and step through a guided sequence.",
      },
      {
        title: "use-gesture",
        href: "https://use-gesture.netlify.app/",
        description:
          "React (and vanilla JS) library from the pmndrs ecosystem for handling drag, pinch, wheel, scroll and hover gestures with a single consistent hook.",
      },
      {
        title: "Tripwire dither kit",
        href: "https://www.tripwire.sh/dither-kit",
        description:
          "Dithering effect kit from Tripwire for applying retro, halftone-style dither patterns to images or UI in a web project.",
      },
      {
        title: "beUI motion radio",
        href: "https://beui.dev/components/motion/radio",
        description:
          "Animated radio button component from beUI's motion component set.",
      },
      {
        title: "Skiper UI drag and scroll",
        href: "https://skiper-ui.com/v1/skiper5",
        description:
          "Drag-and-scroll interaction component from Skiper UI's numbered component series, for building draggable horizontal scroll galleries.",
      },
      {
        title: "Klick Here",
        href: "https://klick-here.vercel.app/",
        description:
          "Small interactive demo site, minimal enough that its exact purpose isn't documented beyond the click interaction itself.",
      },
      {
        title: "Torph (lochie)",
        href: "https://torph.lochie.me",
        description:
          "Dependency-free animated text transition component, framework-agnostic with ports for React, TypeScript, Vue and Svelte, installable via npm for morphing text effects.",
      },
      {
        title: "Fluid Functionalism",
        href: "https://www.fluidfunctionalism.com",
        description:
          "Animated component library with a tactile, fluid feel to its interactions, one of the sources this registry ports components from.",
      },
      {
        title: "Trophy UI",
        href: "https://ui.trophy.so",
        description:
          "Open-source React gamification kit built on shadcn/ui and Tailwind: production-ready streak trackers, achievement badges, leaderboards and points displays as copy-paste components.",
      },
      {
        title: "LiveKit Agents UI",
        href: "https://livekit.com/products/agents-ui",
        description:
          "Prebuilt UI components from LiveKit for building voice AI agent interfaces: waveforms, transcripts and call controls out of the box.",
      },
      {
        title: "Sileo",
        href: "https://sileo.aaryan.design",
        description:
          "React toast notification library with SVG morphing, spring physics and a minimal API, described as 'beautiful by default'; available via npm with a docs playground.",
      },
      {
        title: "ReUI patterns",
        href: "https://reui.io/patterns",
        description:
          "Full-page UI pattern examples (not just single components) built with shadcn/ui, useful as reference for assembling whole screens.",
      },
      {
        title: "shadcnthemer",
        href: "https://shadcnthemer.com",
        description:
          "Visual theme editor for shadcn/ui: tweak colors, radius and spacing live and export the resulting theme config.",
      },
      {
        title: "ElevenLabs UI",
        href: "https://ui.elevenlabs.io",
        description:
          "Official component library from ElevenLabs for building voice AI interfaces, matching the components they use in their own products.",
      },
      {
        title: "Plate",
        href: "https://platejs.org",
        description:
          "Rich text editor framework for React, the kind of building blocks behind Notion-style editors, with a plugin system for extending it rather than building a WYSIWYG editor from scratch.",
      },
      {
        title: "AI Elements",
        href: "https://github.com/vercel/ai-elements",
        description:
          "Vercel's shadcn/ui registry built specifically for AI SDK apps: chat bubbles, streaming responses, reasoning blocks, tool-call UI and prompt input, installed the same way as any shadcn component.",
      },
      {
        title: "Nuxt UI",
        href: "https://ui.nuxt.com",
        description:
          "Vue component library built on Reka UI and Tailwind CSS, 110+ components; v4 merged the formerly paid Pro tier and Figma kit into the free MIT-licensed release.",
      },
    ],
  },
  {
    title: "Component demos and micro-interactions",
    links: [
      {
        title: "Line nav (chanhdai)",
        href: "https://chanhdai.com/components/line-nav",
        description:
          "Animated underline nav bar component from chanhdai's component collection, where the underline slides and morphs between tabs.",
      },
      {
        title: "Coverflow",
        href: "https://coverflow.ashishgogula.in",
        description:
          "Recreation of Apple's classic Coverflow browsing interaction in CSS and JS, a reference for building similar carousel-style pickers.",
      },
      {
        title: "Goey Toast",
        href: "https://goey-toast.vercel.app",
        description:
          "Squishy, gooey toast notification component with a blob-like morph animation instead of a plain slide-in.",
      },
      {
        title: "React Table Craft",
        href: "https://react-table-craft.vercel.app",
        description:
          "Drag-and-drop table builder for React, for visually assembling a data table instead of hand-coding columns and rows.",
      },
      {
        title: "Ali Imam blocks",
        href: "https://aliimam.in/blocks",
        description:
          "Collection of copy-paste Tailwind CSS UI blocks for quickly assembling common page sections.",
      },
      {
        title: "itshover",
        href: "https://www.itshover.com",
        description:
          "Open-source library of animated React icon components built to work with Next.js, described as 'icons that move with intent', browsable and customizable, with community contributions.",
      },
      {
        title: "Button (lakshb)",
        href: "https://button.lakshb.dev",
        description:
          "Collection of animated button styles and micro-interactions to copy into a project.",
      },
      {
        title: "Cult UI: dynamic island",
        href: "https://www.cult-ui.com/docs/components/dynamic-island",
        description:
          "Recreation of iOS's Dynamic Island as a React component, for pill-shaped expanding notification UI on the web.",
      },
      {
        title: "Codepen: simeydotme",
        href: "https://codepen.io/simeydotme/pen/myVddQ0",
        description:
          "CodePen demo by simeydotme, a well-known CSS/SVG animator, showing a creative UI interaction technique.",
      },
      {
        title: "Cult UI: family button",
        href: "https://www.cult-ui.com/docs/components/family-button",
        description:
          "Expanding action button group component from Cult UI, a single button that fans out into related actions.",
      },
      {
        title: "Cult UI: mock browser window",
        href: "https://www.cult-ui.com/docs/components/mock-browser-window",
        description:
          "Fake browser chrome component from Cult UI for framing screenshots and demos inside a realistic browser window.",
      },
      {
        title: "Codepen: jh3y",
        href: "https://codepen.io/jh3y/pen/QwyYoVr",
        description:
          "CodePen demo by jh3y, a prolific CSS animator known for physics-driven and generative interaction experiments.",
      },
      {
        title: "buttonyui",
        href: "https://buttonyui.com",
        description:
          "Library of animated button components ready to copy into a project.",
      },
      {
        title: "Wigggle UI widgets",
        href: "https://wigggle-ui.vercel.app/widgets",
        description:
          "Wobbly, spring-physics widget component kit with a deliberately playful, jiggly feel.",
      },
      {
        title: "Typed.js demo",
        href: "https://mattboldt.com/demos/typed-js",
        description:
          "Live demo of Typed.js, the long-running classic library for typewriter-style text animation on the web.",
      },
      {
        title: "SpoilerJS",
        href: "https://spoilerjs.sh4jid.me",
        description:
          "Discord-style spoiler text component that blurs text until clicked or hovered to reveal it.",
      },
      {
        title: "shadcnexamples: authentication",
        href: "https://shadcnexamples.com/authentication",
        description:
          "Full, ready-to-copy shadcn/ui authentication page example, not just an isolated form component.",
      },
      {
        title: "21st.dev: location tag",
        href: "https://21st.dev/community/components/jatin-yadav05/location-tag/default",
        description:
          "Community-submitted location tag component on 21st.dev, a small pill-style UI element for showing a place name.",
      },
      {
        title: "21st.dev: 3D folder",
        href: "https://21st.dev/community/components/jatin-yadav05/3d-folder/default",
        description:
          "Community-submitted 3D folder hover component on 21st.dev, a folder icon that opens with a 3D tilt on hover.",
      },
      {
        title: "21st.dev: AI chat",
        href: "https://21st.dev/community/components/s/ai-chat",
        description:
          "Community-submitted AI chat interface component on 21st.dev, a ready-made message thread UI for chatbot products.",
      },
      {
        title: "kokonutui: AI voice",
        href: "https://kokonutui.com/docs/components/ai-voice",
        description:
          "Voice AI waveform component from kokonutui's component library, for visualizing live audio input or playback in a voice assistant UI.",
      },
      {
        title: "21st.dev: agenticfleet",
        href: "https://21st.dev/community/agenticfleet",
        description:
          "Community components on 21st.dev built for AI agent fleet dashboards, monitoring multiple running agents at once.",
      },
      {
        title: "shadcnexamples: blog detail page",
        href: "https://shadcnexamples.com/blog-detail-page",
        description:
          "Full, ready-to-copy shadcn/ui blog post detail page example.",
      },
      {
        title: "21st.dev: moon chat",
        href: "https://21st.dev/community/components/ruixenui/ruixen-moon-chat/default",
        description:
          "Community-submitted AI chat widget on 21st.dev with a moon-themed visual style.",
      },
      {
        title: "Skiper UI: skiper87",
        href: "https://skiper-ui.com/v1/skiper87",
        description:
          "Drag-and-scroll interaction component from Skiper UI's numbered component series.",
      },
      {
        title: "21st.dev: blog cards",
        href: "https://21st.dev/community/components/sumonadotwork/blog-cards/default",
        description:
          "Community-submitted blog card component on 21st.dev for displaying post previews in a grid.",
      },
      {
        title: "21st.dev: reading text reveal",
        href: "https://21st.dev/community/components/wisedev/reading-text-reveal/default",
        description:
          "Community-submitted scroll-triggered text reveal component on 21st.dev, text that fades or highlights in as you scroll past it.",
      },
      {
        title: "21st.dev: retro button",
        href: "https://21st.dev/serafimcloud/button-retro/default",
        description:
          "Community-submitted retro-styled button component on 21st.dev with a chunky, skeuomorphic look.",
      },
      {
        title: "Magic UI: highlighter",
        href: "https://magicui.design/docs/components/highlighter",
        description:
          "Animated text highlighter component from Magic UI that draws a marker-style highlight stroke behind text on scroll or load.",
      },
      {
        title: "devl.dev",
        href: "https://www.devl.dev",
        description:
          "Collection of 158 production-ready UI experiments built with React, Tailwind and Base UI, spanning layouts, forms, dashboards, tables and charts, meant to be copied and adapted directly.",
      },
      {
        title: "JustGage",
        href: "https://toorshia.github.io/justgage",
        description:
          "Lightweight JavaScript library for drawing animated gauge and dial charts with no dependencies beyond Raphael/SVG.",
      },
    ],
  },
  {
    title: "Interface design guidelines and craft",
    links: [
      {
        title: "userinterface.wiki",
        href: "https://www.userinterface.wiki/",
        description:
          "Reference wiki of UI/UX best practices organized by category (animation, typography, forms, accessibility and more), with concrete do's and don'ts rather than abstract principles.",
      },
      {
        title: "Vercel Web Interface Guidelines",
        href: "https://vercel.com/design/guidelines",
        description:
          "Vercel's own published guidelines for building web interfaces: interaction, accessibility, performance and design details their product teams hold themselves to.",
      },
      {
        title: "Components Build principles",
        href: "https://www.components.build/principles",
        description:
          "Foundational principles for building modern UI components: favor composition over inheritance, and make components accessible, customizable, performant and transparent by default.",
      },
      {
        title: "System button",
        href: "https://devouringdetails.com/system/button",
        description:
          "Deep documentation of a single Button component's design system: variant/color/size props decoupled from appearance, smooth loading transitions, Safari force-press detection, and the reasoning behind its disabled and loading states.",
      },
      {
        title: "LINE Design System",
        href: "https://designsystem.line.me/",
        description:
          "LINE's official design system: the visual and interaction standards used to keep its products consistent across a huge, multi-team surface area.",
      },
      {
        title: "Impeccable",
        href: "https://impeccable.style/#downloads",
        description:
          "Design system and style resource focused on precise, considered visual details, downloadable assets for building interfaces with the same level of polish.",
      },
      {
        title: "Hit area",
        href: "https://bazza.dev/craft/2026/hit-area",
        description:
          "Introduces a small set of Tailwind utility classes (installable via the shadcn registry) for expanding an element's clickable area beyond its visual bounds, with patterns for checkboxes in tables and sidebar nav items.",
      },
      {
        title: "Designing Depth",
        href: "https://rauno.me/craft/depth",
        description:
          "Rauno Freiberg's essay on using shadow, blur and layering to create a real sense of depth in interfaces, rather than flat drop-shadows applied uniformly.",
      },
      {
        title: "New Interfaces",
        href: "https://www.interfaces.new/",
        description:
          "Platform and event series showcasing experimental digital interfaces and creative coding projects from independent artists and designers.",
      },
      {
        title: "Industrial Empathy",
        href: "https://www.industrialempathy.com/",
        description:
          "Marc Hedlund's widely cited essay collection on internal tools, engineering management and building software people actually want to use, including the well-known 'build internal tools for adoption, not mandate' piece.",
      },
      {
        title: "Notch case study",
        href: "https://iamnoman.com/notch",
        description:
          "Case study on refining a pixel-gradient tool's UI: working with Claude to go from a functional prototype to a polished interface by focusing specifically on how the notch moves, spring physics and transitions over instant state changes.",
      },
      {
        title: "Dot Matrix",
        href: "https://dotmatrix.zzzzshawn.cloud/",
        description:
          "Personal design/craft site by zzzzshawn exploring interface details and small interactive experiments.",
      },
      {
        title: "Interfaces.dev",
        href: "https://interfaces.dev/",
        description:
          "Subscription design engineering magazine by Jakub Krehel, monthly issues with interactive demos and source code covering animation, typography and micro-interactions.",
      },
      {
        title: "Make interfaces feel better",
        href: "https://jakub.kr/skills/make-interfaces-feel-better",
        description:
          "Claude Code skill that applies craft principles (typography, hover states, shadows, micro-interactions) to polish a UI's details, installable via CLI, with feedback on what it changed.",
      },
      {
        title: "Mockdown",
        href: "https://www.mockdown.design/",
        description:
          "Web-based tool for turning rough wireframes or sketches into structured design mockups.",
      },
      {
        title: "Unsung",
        href: "https://unsung.aresluna.org/",
        description:
          "Marcin Wichary's blog on software craft: essays on the small, easy-to-miss interface details, from keyboard shortcuts to typography to forgotten computing history, that shape how software actually feels to use.",
      },
      {
        title: "TOLIS technical drawing",
        href: "https://tol.is/blueprint",
        description:
          "Series of technical-drawing-style illustrations from design studio TOLIS, blueprint-style diagrams as a visual reference for precise, engineered-looking graphics.",
      },
      {
        title: "Rams",
        href: "https://www.rams.ai/",
        description:
          "Automated design-review platform that scores every UI change in a pull request against 194 design-system and accessibility rules (color, typography, spacing, motion, components, UX, craft), giving a senior design review on every PR with inline fix suggestions.",
      },
      {
        title: "10 principles for fluid UI",
        href: "https://karlkoch.me/writing/10-principles-for-fluid-ui",
        description:
          "Essay laying out ten concrete principles for building interfaces that feel fluid and responsive to touch and motion, not just visually animated.",
      },
      {
        title: "Good Microcopy",
        href: "https://goodmicrocopy.com",
        description:
          "Collection of real, well-written UX copy examples from shipped products, organized by use case (empty states, errors, confirmations) for writers to reference.",
      },
      {
        title: "State of AI Design",
        href: "https://stateofaidesign.com",
        description:
          "Annual report surveying how AI tools are changing design workflows, roles and output, with data from working designers.",
      },
      {
        title: "The UX of AI",
        href: "https://www.shapeof.ai",
        description:
          "Reference library of interaction patterns and case studies specifically for designing AI product features, from chat to agentic flows.",
      },
      {
        title: "UI Guideline components",
        href: "https://www.uiguideline.com/components",
        description:
          "Database compiling best practices from the top 20 design systems and UI libraries into one component-by-component reference, from buttons to data tables, with Figma kits included.",
      },
      {
        title: "Design Beyond Barriers",
        href: "https://designbeyondbarriers.com",
        description:
          "Accessibility guide written by designers for designers: 30 articles covering typography, color, form design and testing, arguing accessibility is a design decision, not just a developer checklist.",
      },
      {
        title: "Stack and Justify",
        href: "https://max-esnee.com/stack-and-justify",
        description:
          "Interactive cheatsheet for CSS flexbox stacking and justification, showing how justify-content and align-items combinations actually lay elements out.",
      },
      {
        title: "The Good Line Height",
        href: "https://thegoodlineheight.com",
        description:
          "Short interactive guide to picking a good line-height value for body text, showing the readability difference live.",
      },
    ],
  },
  {
    title: "Design inspiration galleries",
    links: [
      {
        title: "Details Inspo",
        href: "https://www.details.so/inspo",
        description:
          "Gallery focused specifically on small interface details (micro-interactions, transitions, edge cases) rather than whole-page layouts.",
      },
      {
        title: "Inspo Page",
        href: "https://www.inspo.page/",
        description:
          "Browsable gallery of website design inspiration, screenshots of real sites organized for quick scanning.",
      },
      {
        title: "Design Engineer Tools",
        href: "https://designengineer.tools/",
        description:
          "Curated directory of tools specifically for the design engineer workflow, bridging design and frontend implementation.",
      },
      {
        title: "Toolfolio design tools",
        href: "https://toolfolio.com/design",
        description:
          "Browsable directory of design tools, with filters for platform, pricing and integrations alongside tool-specific collections and articles.",
      },
      {
        title: "Search System",
        href: "https://searchsystem.co/",
        description:
          "A protected web reference retained for its search-focused experience and visual direction.",
      },
      {
        title: "Items Design",
        href: "https://items.design/",
        description:
          "Gallery of individual UI 'items' (components, patterns, micro-interactions) pulled from real products, for browsing at the piece level rather than full pages.",
      },
      {
        title: "Landbook",
        href: "https://land-book.com/",
        description:
          "Long-running landing page inspiration gallery, searchable by industry, style and layout.",
      },
      {
        title: "Recent Design",
        href: "https://recent.design/",
        description:
          "Feed of recently launched or redesigned websites, for seeing what's shipping right now rather than an evergreen archive.",
      },
      {
        title: "Dark Mode Design",
        href: "https://www.darkmodedesign.com/",
        description:
          "Gallery specifically curating sites and products with well-executed dark mode design.",
      },
      {
        title: "Next.js Design",
        href: "https://www.nextjs.design/products",
        description:
          "Showcase of products and sites built with Next.js, for seeing what real Next.js apps look like in production.",
      },
      {
        title: "Pillarstack",
        href: "https://www.pillarstack.com/resources/doing-cool-stuff",
        description:
          "Design resource collection under the theme 'doing cool stuff', a grab-bag of inspiring tools and references.",
      },
      {
        title: "Craftwork catalog",
        href: "https://craftwork.design/catalog?filterByPrice=paid_free&sort=recent",
        description:
          "Marketplace catalog of design assets (templates, illustrations, UI kits) filterable by price, this link is sorted to show recent free and paid items.",
      },
      {
        title: "Shoot Design",
        href: "https://www.shoot.design/",
        description:
          "Design inspiration gallery, screenshots of notable websites organized for browsing.",
      },
      {
        title: "Websitevice",
        href: "https://websitevice.com/examples-5",
        description:
          "Website design inspiration gallery, this link points at one of its curated example collections.",
      },
      {
        title: "Osmo collection",
        href: "https://www.osmo.supply/collection",
        description:
          "Osmo Supply's collection of interactive web experiments and design references, from the studio known for creative, high-craft site builds.",
      },
      {
        title: "Landing Love",
        href: "https://www.landing.love/",
        description:
          "Gallery specifically of landing page designs, for studying how real products structure their marketing pages.",
      },
      {
        title: "Best Designs on X",
        href: "https://bestdesignsonx.com/",
        description:
          "Curated roundup of well-designed sites and products that have been shared and praised on X (Twitter).",
      },
      {
        title: "Figma community resources",
        href: "https://www.figma.com/files/team/1072912386122463093/resources/community/file/1403172659817779958",
        description:
          "Shared Figma community file with design resources: components, templates or references published for others to duplicate and use.",
      },
      {
        title: "Viewport UI",
        href: "https://viewport-ui.design",
        description:
          "Curated gallery of UI design work organized by platform (web, mobile, iOS, Android), with links back to the designers who made it.",
      },
      {
        title: "ui.live",
        href: "https://ui.live",
        description:
          "Social platform for designers to post their work, rank up on trending leaderboards, and get discovered, a competitive spin on design inspiration feeds.",
      },
      {
        title: "UIBits",
        href: "https://uibits.co",
        description:
          "Curated feed of small UI component snippets for quick reference and reuse.",
      },
      {
        title: "Details Matter",
        href: "https://detailsmatter.framer.website",
        description:
          "Showcase collecting small, easy-to-miss UI details from real products, the kind of polish that separates good interfaces from great ones.",
      },
      {
        title: "Another Graphic",
        href: "https://anothergraphic.org",
        description:
          "Archive of graphic design focused on typographic treatment, curating editorial, identity and poster work from international designers, browsable by designer, year, medium or country.",
      },
      {
        title: "Pageflows: iOS",
        href: "https://pageflows.com/ios",
        description:
          "Library of recorded UX flows captured from real iOS apps, useful for studying how shipped products actually handle onboarding, checkout and other common flows.",
      },
      {
        title: "Screens Design",
        href: "https://screensdesign.com",
        description:
          "Gallery of mobile app screen designs organized by pattern and category, for browsing how real apps solve specific UI problems.",
      },
      {
        title: "User Inyerface",
        href: "https://userinyerface.com",
        description:
          "Game that makes you fight the worst dark-pattern UI ever built: fake buttons, hostile forms and deliberately confusing flows, a memorable way to feel why good UX matters.",
      },
      {
        title: "Nicely Done",
        href: "https://nicelydone.club",
        description:
          "Teardown reviews of well-designed products, breaking down the specific decisions that make them work.",
      },
      {
        title: "Hoverstat.es",
        href: "https://www.hoverstat.es",
        description:
          "Curated gallery of standout personal and studio portfolio sites, organized around featured designers.",
      },
      {
        title: "Craftwork: onfire",
        href: "https://onfire.craftwork.design",
        description:
          "Trending premium design assets currently popular on Craftwork's marketplace.",
      },
      {
        title: "Trending Design",
        href: "https://trending.design",
        description:
          "Curated marketplace recommending products for creative professionals across three categories: design tech (devices and tools), design books and design documentaries, each with independent reviews.",
      },
      {
        title: "Interfaces (rauno)",
        href: "https://interfaces.rauno.me",
        description:
          "Rauno Freiberg's curated collection of great interface details, screenshots of specific, well-executed UI moments from real products.",
      },
      {
        title: "Midday",
        href: "https://midday.ai",
        description:
          "Open-source financial OS for freelancers and small businesses (invoicing, time tracking, bank reconciliation), by Pontus Abrahamsson; featured twice on One Page Love for its interface craft.",
      },
    ],
  },
  {
    title: "Portfolios and studios",
    links: [
      {
        title: "Mek Gallery",
        href: "https://www.mek.gallery/design",
        description:
          "Portfolio of Michael Alexander spanning visual art, design, typography and development, presented as a browsable gallery of his work.",
      },
      {
        title: "Naked City Films",
        href: "https://www.nakedcityfilms.com/",
        description:
          "Portfolio site for a film production studio, showcasing its directing and cinematography work.",
      },
      {
        title: "Brass Hands",
        href: "https://brasshands.com/",
        description:
          "New York design studio specializing in branding for AI, robotics, defense and other advanced-technology companies, 'designing for the new industrial age'.",
      },
      {
        title: "Ning H",
        href: "https://ning-h.com/",
        description:
          "Portfolio of digital designer Ning Huang, expressive, code-driven websites blending art direction, interaction design and 3D.",
      },
      {
        title: "Maximilian Berndt",
        href: "https://maximilianberndt.com/",
        description:
          "Portfolio of Maximilian Berndt, an Amsterdam-based creative developer working in WebGL, motion design and design systems, with client work for Netflix, Adyen and MetaMask.",
      },
      {
        title: "Nitish Khagwal",
        href: "https://khagwal.com/",
        description:
          "Portfolio of Nitish Khagwal, a product designer with 12 years of experience, known for design systems work at Paytm and Figma plugins for the design community.",
      },
      {
        title: "Julia Plaza",
        href: "https://www.hoverstat.es/features/julia-plaza/",
        description:
          "Featured portfolio profile of designer Julia Plaza on Hoverstat.es.",
      },
      {
        title: "Fabio Ottaviani",
        href: "https://www.supah.it/portfolio/",
        description:
          "Portfolio of Fabio Ottaviani, a creative developer showcasing interactive web projects.",
      },
      {
        title: "Arlan Marat vault",
        href: "https://www.arlan.me/vault",
        description:
          "Arlan Marat's 'vault' of design and engineering experiments, dated project entries released under an MIT license for others to use.",
      },
      {
        title: "Jakub Krehel",
        href: "https://jakub.kr/",
        description:
          "Personal site of Jakub Krehel, a design engineer focused on craft and quality, publisher of Interfaces.dev, with writing on color systems and interface design.",
      },
      {
        title: "Here For Now",
        href: "https://www.herefornow.risd.gd/",
        description:
          "RISD Graphic Design senior thesis show site, showcasing student work across identity, print, motion and experience design under the theme of ephemeral spaces.",
      },
      {
        title: "Anaiis",
        href: "https://www.anaiis.world/#bpe",
        description:
          "Personal or studio site for Anaiis, minimal enough that its focus isn't documented beyond the name itself.",
      },
      {
        title: "Samuel Bernhardt",
        href: "https://www.samuelbernhardt.com/",
        description:
          "Portfolio of Sam Bernhardt, a technical product designer ('usually a designer, sometimes a developer'), featuring projects like UIFork alongside writing and experimental web tools.",
      },
      {
        title: "MILEZ",
        href: "https://milez.jp/article/kxhvhoyep55g/",
        description:
          "Article on the Japanese design/culture publication MILEZ.",
      },
      {
        title: "Emil Kowalski",
        href: "https://emilkowal.ski/",
        description:
          "Personal site and blog of Emil Kowalski, creator of the Sonner toast library and Vaul drawer component, with essays on interaction design and animation craft.",
      },
      {
        title: "Maxime Heckel",
        href: "https://maximeheckel.com/",
        description:
          "Blog of Maxime Heckel, a senior software engineer known for deeply technical, beautifully illustrated posts on WebGL, React Three Fiber and creative coding.",
      },
      {
        title: "Gustavo Fior",
        href: "https://www.gustavofior.com/",
        description:
          "Portfolio and writing site of Gustavo Fior, featuring projects including Foglamp, an open-source tool for improving AI agents.",
      },
      {
        title: "Igochi Studio",
        href: "https://www.igochi.studio/",
        description:
          "Object and experience design studio with a quiet, editorial presentation across stories, software, editions and archival work.",
      },
    ],
  },
  {
    title: "Color, gradients and palettes",
    links: [
      {
        title: "Super Color Palette",
        href: "https://supercolorpalette.com/",
        description:
          "Color palette generator and browser for exploring and exporting cohesive color sets.",
      },
      {
        title: "Pattern Craft",
        href: "https://patterncraft.fun/",
        description:
          "Tool for generating and customizing CSS background patterns to copy into a project.",
      },
      {
        title: "Gradient SCSS",
        href: "https://gradientscss.vercel.app/",
        description:
          "Library of ready-made CSS/SCSS gradient definitions to copy and drop into a stylesheet.",
      },
      {
        title: "WebGradients",
        href: "https://webgradients.com/",
        description:
          "Free collection of 180 linear gradients ready to use as CSS backgrounds, a long-running go-to gradient reference.",
      },
      {
        title: "MyColor Space",
        href: "https://mycolor.space/gradient?ori=to+right+top&hex=%23A1C4FD&hex2=%23C2E9FB&sub=1",
        description:
          "Color and gradient tool for exploring palettes and gradients built from a chosen base color, this link opens a specific two-color gradient.",
      },
      {
        title: "Understanding Gradients",
        href: "https://jakub.kr/work/gradients",
        description:
          "Guide to how CSS gradients actually work: linear, radial and conic types, how color space affects interpolation, plus color hints, layering and performance tradeoffs for more sophisticated effects.",
      },
      {
        title: "Poline",
        href: "https://meodai.github.io/poline",
        description:
          "Color palette generation library by Mikael Ainalem (meodai) that builds palettes by walking points around a color wheel in polar coordinates, producing smoother, more intentional palettes than random sampling.",
      },
      {
        title: "Colorflow",
        href: "https://colorflow.ls.graphics",
        description:
          "Interactive tool from LS.GRAPHICS for generating and animating smooth, flowing gradient combinations for use in design work.",
      },
      {
        title: "Colorize",
        href: "https://colorize.design",
        description:
          "Color palette generator aimed at designers picking cohesive color sets for a project.",
      },
      {
        title: "Colormoods",
        href: "https://colormoods.co",
        description:
          "Generates pairs of colors along a 0-100 'stimulation' scale, weighing intensity, contrast, hue separation and vibration to suggest combinations that read as calm or energetic.",
      },
      {
        title: "Color Palette Pro",
        href: "https://colorpalette.pro",
        description:
          "Color palette generator and export tool for building and downloading cohesive color sets.",
      },
      {
        title: "Harmonizer (Evil Martians)",
        href: "https://harmonizer.evilmartians.com",
        description:
          "Tool from Evil Martians that generates a harmonious color palette from a single base color, useful for quickly extending a brand color into a full UI palette.",
      },
      {
        title: "Radix Colors",
        href: "https://www.radix-ui.com/colors",
        description:
          "Accessible, systematic 12-step color scale system for UI design from the Radix team, designed so each step has a defined semantic role (backgrounds, borders, text) across light and dark mode.",
      },
      {
        title: "Background generator (ibelick)",
        href: "https://bg.ibelick.com",
        description:
          "Generates CSS gradient and pattern backgrounds you can copy straight out as CSS, no image export needed.",
      },
      {
        title: "Oklch.fyi",
        href: "https://oklch.fyi",
        description:
          "OKLCH color picker and converter, for working in the perceptually uniform OKLCH color space instead of RGB or HSL.",
      },
      {
        title: "ShapeFactory",
        href: "https://shapefactory.co",
        description:
          "Collection of browser-based logo, color and gradient tools for quickly exploring visual identity directions and exporting usable assets.",
      },
    ],
  },
  {
    title: "CSS and shape generators",
    links: [
      {
        title: "Cascade (Design Surface)",
        href: "https://designsurface.dev/cascade",
        description:
          "Set of visual icons representing individual CSS properties, giving styling attributes a graphical reference instead of plain text names.",
      },
      {
        title: "Grainrad",
        href: "https://grainrad.com",
        description:
          "Grain and noise texture generator for adding film-grain-style texture to designs.",
      },
      {
        title: "Shaders.com presets",
        href: "https://shaders.com/presets",
        description:
          "Library of ready-made WebGL shader presets to drop into a project instead of writing GLSL from scratch.",
      },
      {
        title: "Blobsketch",
        href: "https://cpreid2.github.io/blobsketch",
        description:
          "Browser tool for drawing organic blob shapes by hand and exporting them as SVG for use in designs.",
      },
      {
        title: "Tekdetek",
        href: "https://vikmil.com/tekdetek",
        description:
          "Browser-based VJ tool by Vik Mil for live, real-time manipulation of ASCII-style video during visual performances.",
      },
      {
        title: "Meshic",
        href: "https://meshic.app",
        description:
          "Procedural pattern generator for creating mesh-style visual patterns for design work.",
      },
      {
        title: "Easemaster",
        href: "https://easemaster.satisui.xyz",
        description:
          "Visual easing curve editor for animation, for dialing in a custom cubic-bezier by eye instead of guessing numbers.",
      },
      {
        title: "Clip Paths editor (ui-layouts)",
        href: "https://tools.ui-layouts.com/clip-paths#editor",
        description:
          "Visual editor for building CSS clip-path shapes by dragging points, then copying out the generated clip-path value.",
      },
      {
        title: "Monoco",
        href: "https://glass3d.dev",
        description:
          "Tiny JavaScript library that adds squircles and other smooth-corner types to HTML elements, generating dynamic SVG applied as a background image or clip-path. Available for vanilla JS, Svelte and React.",
      },
      {
        title: "Monoco (mirror)",
        href: "https://somonoco.com",
        description:
          "Alternate domain hosting Monoco, the smooth-corner (squircle) JavaScript library.",
      },
      {
        title: "aethercss",
        href: "https://aethercss.lovable.app",
        description:
          "Free generator for Liquid Glass, Glassmorphism and Neumorphism CSS effects with a live preview: adjust sliders and colors and copy the generated code. Works best in Chromium browsers.",
      },
      {
        title: "Lisse",
        href: "https://corne.rs",
        description:
          "Small JavaScript library that draws squircle corners, the same continuous curve Figma and iOS use. Ships bindings for React, Vue and Svelte plus a framework-agnostic core, with per-corner control, borders, and shadows included.",
      },
      {
        title: "Liquid Glass (shuding)",
        href: "https://github.com/shuding/liquid-glass",
        description:
          "CSS/JS recreation of Apple's Liquid Glass visual effect by Shu Ding (creator of SWR/Next.js contributor), for bringing the effect to the web.",
      },
    ],
  },
  {
    title: "Illustration and visual assets",
    links: [
      {
        title: "Popsy illustrations",
        href: "https://popsy.co/illustrations",
        description:
          "Free, customizable illustration pack (recolorable SVGs) for landing pages and product marketing.",
      },
      {
        title: "Grafik Stash",
        href: "https://grafikstash.com/class/freebies/",
        description:
          "Design resource shop offering device mockups, icons and illustrations, both free and premium, sold via Gumroad.",
      },
      {
        title: "Dither Garden",
        href: "https://www.dithergarden.com/editor.html",
        description:
          "Browser-based image dithering tool: upload a photo, apply different dithering algorithms and color modes, and export a stylized, retro-textured version.",
      },
      {
        title: "Custom text highlight",
        href: "https://custom-text-highlight.vercel.app/",
        description:
          "CSS tool/demo for building custom text highlight effects (marker-style or background-based) beyond the default text-selection highlight.",
      },
      {
        title: "Toolfolio OG Image Gallery",
        href: "https://toolfolio.io/og-image-gallery",
        description:
          "Gallery of Open Graph (social share) image designs from real products, for reference when designing your own OG images.",
      },
      {
        title: "SVG Logos",
        href: "https://svgl.app/",
        description:
          "Large, well-known library of brand and product SVG logos, searchable and copy-paste ready, with light/dark variants for many entries.",
      },
      {
        title: "Tiny Design Shop",
        href: "https://tinydesignshop.com/",
        description:
          "Shop selling tiny Carrd templates and free browser tools, lightweight, no-frills solutions for quick sites and small tasks.",
      },
      {
        title: "Image generation by Jakub",
        href: "https://image.jakubantalik.com/",
        description: "Jakub Antalik's image generation tool/experiment.",
      },
      {
        title: "Graphite.art",
        href: "https://graphite.art",
        description:
          "Free, open-source vector and raster graphics editor that runs in the browser, aiming to be a serious Illustrator/Photoshop-style alternative.",
      },
      {
        title: "theSVG",
        href: "https://thesvg.org",
        description:
          "Library of 6,400+ free brand SVG icons for developers and designers to download and drop into projects.",
      },
      {
        title: "SVG Studio",
        href: "https://svgstudio.org",
        description:
          "Browser-based animation editor for turning static vector art into smooth keyframe animations, exported as self-contained animated SVGs with embedded CSS, no software or account needed.",
      },
      {
        title: "SVG Path Editor",
        href: "https://yqnn.github.io/svg-path-editor",
        description:
          "Visual editor for SVG path data: drag control points and see the `d` attribute update live, instead of hand-editing path commands.",
      },
      {
        title: "Halftone Maker",
        href: "https://halftonemaker.com",
        description:
          "Turns an uploaded image into a halftone dot pattern, the classic newsprint-style effect, adjustable in the browser.",
      },
      {
        title: "SVG Converter",
        href: "https://svgconverter.online",
        description:
          "Converts images to and from SVG format directly in the browser.",
      },
      {
        title: "Halftone (xoihazard)",
        href: "https://halftone.xoihazard.com",
        description:
          "Another browser-based halftone generator for turning images into dot-pattern graphics.",
      },
    ],
  },
  {
    title: "Typography tools",
    links: [
      {
        title: "Fontshare pairs",
        href: "https://fontshare.com/pairs",
        description:
          "Font pairing tool from Fontshare (Indian Type Foundry's free font platform), suggesting complementary heading/body combinations from its free catalog.",
      },
      {
        title: "vibe.type",
        href: "https://typevibe.vercel.app/",
        description:
          "Typography exploration tool for browsing or generating type-driven visual styles.",
      },
      {
        title: "Precise Type",
        href: "https://precise-type.com",
        description:
          "Web tool for building harmonious type scales from musical-interval ratios like Major Third or Perfect Fifth. Exports implementation-ready CSS and CSV, and its 'Line Grid' constraint rounds line heights to pixel multiples for pixel-perfect alignment.",
      },
      {
        title: "Typograph Studio",
        href: "https://typograph.studio",
        description:
          "AI-powered custom typeface generator. Pick a style template like Neo Grotesk or Geometric, or describe the look you want, then fine-tune weight, width and contrast to produce a bespoke font.",
      },
      {
        title: "Fontastic",
        href: "https://fontastic.space",
        description:
          "Tool that finds mathematically complementary font pairings, taking the guesswork out of choosing a heading and body typeface that actually work together.",
      },
      {
        title: "Fluid Type Scale",
        href: "https://www.fluid-type-scale.com",
        description:
          "Generates a responsive fluid type scale using CSS clamp(), so font sizes scale smoothly between a minimum and maximum viewport instead of jumping at breakpoints.",
      },
      {
        title: "Letterbox",
        href: "https://www.letterbox.sh",
        description:
          "Generates 'letters made of letters', text-based typographic art with controls for font, weight, fill pattern, color and column layout.",
      },
      {
        title: "Font Trio pairs",
        href: "https://www.fonttrio.xyz/pairs",
        description:
          "Curated three-font pairing suggestions for heading, subheading and body text, aimed at designers who don't want to hand-pick every combination.",
      },
      {
        title: "Space Type Generator",
        href: "https://spacetypegenerator.com",
        description:
          "Kinetic type generator with over 20 animation modes (Cylinder, Field, Stripes, Coil and more) for rendering moving, space-themed typography in real time.",
      },
      {
        title: "Colors and Fonts",
        href: "https://www.colorsandfonts.com",
        description:
          "Curated feed of color palette and font pairing inspiration for designers.",
      },
      {
        title: "Font Radar",
        href: "https://www.fontradar.com",
        description:
          "Service that scans millions of sites and apps daily to detect unlicensed font usage, helping foundries enforce licensing and recover lost revenue.",
      },
      {
        title: "Font name checker",
        href: "https://namecheck.fontdata.com",
        description:
          "Checks whether a proposed font or product name collides with an existing typeface name, useful before shipping a new font or brand.",
      },
      {
        title: "Type scale (hihayk)",
        href: "https://hihayk.github.io/scale",
        description:
          "Classic visual type-scale generator by Hayk Ohanian: pick a base size and ratio and it lays out the resulting modular scale live.",
      },
    ],
  },
  {
    title: "Type foundries and directories",
    links: [
      {
        title: "Nouveau Grande by DDOTT",
        href: "https://ddott.net/font/nouveau-grande/",
        description:
          "High-contrast display typeface that combines an early grotesque skeleton with Art Nouveau swashes, whiplash ornaments and calligraphic alternates. Its broad OpenType set and chunky Black weight make it especially useful for expressive branding and editorial headlines.",
      },
      {
        title: "Collletttivo",
        href: "http://collletttivo.it",
        description:
          "Italian independent type foundry known for expressive, humanist typefaces and a distinctive, design-forward brand voice.",
      },
      {
        title: "Open Foundry",
        href: "http://open-foundry.com",
        description:
          "Directory of free and open-source typefaces, curating quality open fonts in one place instead of digging through scattered repos.",
      },
      {
        title: "League of Moveable Type",
        href: "http://theleagueofmoveabletype.com",
        description:
          "One of the original free, open-source font foundries, publishing high-quality typefaces under open licenses since the early web-fonts era.",
      },
      {
        title: "Use & Modify",
        href: "http://usemodify.com",
        description:
          "Curated directory of free and open-source fonts, filterable by style, for finding quality typefaces without licensing friction.",
      },
      {
        title: "Indestructible Type",
        href: "http://indestructibletype.com",
        description:
          "Independent type foundry publishing distinctive display and text typefaces, running since the early 2000s.",
      },
      {
        title: "Velvetyne",
        href: "http://velvetyne.fr",
        description:
          "French type foundry collective publishing free, open-source, often experimental typefaces (including Terminal Grotesque), a well-known source for distinctive free fonts.",
      },
      {
        title: "Uncut",
        href: "http://uncut.wtf",
        description:
          "Type or design resource site, didn't resolve on the last check.",
      },
      {
        title: "Free Faces",
        href: "http://freefaces.gallery",
        description:
          "Curated collection of typefaces available under free licenses somewhere on the web, organized by category (cursive, display, monospace, sans, serif, slab) by designer Simon Foster.",
      },
      {
        title: "Best Free Fonts",
        href: "http://bestfreefonts.com",
        description:
          "Directory aggregating free fonts from across the web into one searchable, browsable collection.",
      },
      {
        title: "Tunera",
        href: "http://tunera.xyz",
        description:
          "Type-related site or foundry, didn't resolve on the last check.",
      },
      {
        title: "Typotheque Luuse",
        href: "http://typotheque.luuse.fun",
        description:
          "Independent type foundry/specimen site publishing original typefaces.",
      },
      {
        title: "Republish font foundry",
        href: "https://republi.sh",
        description:
          "Self-initiated project by Behalf Studio that turns Vietnamese vernacular lettering (hand-painted shop signs, concrete building numerals, archival ephemera) into free, open-source digital typefaces, returned to the community they came from.",
      },
      {
        title: "MyFFFonts",
        href: "https://myfffonts.accentgrave.net",
        description:
          "Curated library of free, open-source typefaces spanning sans, monospace, display and variable fonts, with designer credit and licensing info attached to each.",
      },
      {
        title: "Maxibestof typefaces",
        href: "https://maxibestof.one/typefaces",
        description:
          "Hand-picked directory of free, high-quality independent typefaces, filtered down from the flood of free-font sites to ones actually worth using.",
      },
      {
        title: "Fonts in Movies",
        href: "https://fontsinmovies.com",
        description:
          "Catalog identifying the typefaces used in film posters, title cards and on-screen graphics, spanning movies from 1968 to 2023.",
      },
      {
        title: "Are.na: Type Type Type",
        href: "https://www.are.na/edwin-beauchamp/type-type-type-xvogvyjgxkq",
        description:
          "Curated Are.na channel collecting typography inspiration images, from signage to specimen sheets.",
      },
      {
        title: "Quarantine fonts",
        href: "https://github.com/jenskutilek/quarantine-fonts",
        description:
          "Grab-bag of unfinished typeface projects by type designer Jens Kutilek, released as raw Glyphs source files for other designers to pick up and refine, ranging from coding fonts to display faces.",
      },
    ],
  },
  {
    title: "Free typefaces",
    links: [
      {
        title: "Departure Mono",
        href: "https://departuremono.com/",
        description:
          "Free pixel-grid monospace typeface with a distinct retro-terminal look, popular for code blocks and developer-tool branding.",
      },
      {
        title: "Random Grotesque",
        href: "https://randommaerks.github.io/random-grotesque",
        description:
          "Multifunctional grotesque sans-serif with an inktrap detail, inspired by Helvetica; 36 styles across three widths and six weights.",
      },
      {
        title: "Overused Grotesk",
        href: "https://randommaerks.github.io/overused-grotesk",
        description:
          "Free, open-source sans-serif that started as a satirical Helvetica copycat and evolved into a genuinely practical, multilingual workhorse supporting 200+ languages across 16 styles.",
      },
      {
        title: "Base Neue Font",
        href: "https://befonts.com/base-neue-font.html",
        description:
          "Large type family (108 styles, thin to black, super-condensed to super-expanded) supporting 95 languages with InkTrap detailing, positioned as a modern reworking of basic grotesque typography.",
      },
      {
        title: "Fixelpont (Klotter)",
        href: "https://klotter.supply/fixelpont",
        description:
          "Playful pixel font by type designer falk, originally built for a comics project. Ships in two styles, regular and rounded, that align perfectly on top of each other, with post-binary ligatures for French.",
      },
      {
        title: "A Mono (Klotter)",
        href: "https://klotter.supply/a-mono",
        description:
          "Free variable monospace typeface by falk, inspired by Emil Gunnarsson. Deliberately drops the serifs around narrow letters like 'i' for a bit of structured irregularity, and includes weight and 'rotalic' axes plus full IPA support.",
      },
      {
        title: "Thestral (xCicero)",
        href: "https://xcicero.esad-gv.net/page/thestral/index.php",
        description:
          "Contemporary display typeface by student designer Pauline Maréchal, reviving a character from the historic Jacoby & Fils foundry. Bridges vintage type craft with a modernist redraw.",
      },
      {
        title: "Bonbance (xCicero)",
        href: "https://xcicero.esad-gv.net/page/bonbance",
        description:
          "Playful display typeface by student designer Louna Bourdon, also rooted in a Jacoby & Fils original character. Part of the xCicero student type foundry's archive-revival series.",
      },
      {
        title: "Caramel (xCicero)",
        href: "https://xcicero.esad-gv.net/page/caramel/index.php",
        description:
          "Display typeface by student designer Hugo Lopez, drawn from a wooden character cut by Turin's Augusta foundry. The whole specimen is presented as a caramel recipe, a visual pun between typography and confectionery.",
      },
      {
        title: "Terminal Grotesque (Velvetyne)",
        href: "https://velvetyne.fr/fonts/terminal-grotesque",
        description:
          "Free pixel font by Raphaël Bastide, inspired by Paul Renner's Futura and Radim Peško's grotesque drawings. Open source under the SIL license since 2010, with a distinctly punk, technical feel.",
      },
      {
        title: "Ghouls pixel blackletter font",
        href: "https://pixelsurplus.com/products/ghouls-pixel-blackletter-display-font",
        description:
          "Free pixel blackletter display font inspired by retro arcade type and modular design. Doubles as a layering font: stack copies of it and it produces a psychedelic dot effect.",
      },
      {
        title: "Acrata (Tortilla)",
        href: "https://tortilla.studio/fonts/acrata",
        description:
          "Free display typeface from Tortilla Studio's type collection.",
      },
      {
        title: "Arbutus Slab",
        href: "https://fonts.google.com/specimen/Arbutus+Slab",
        description:
          "Free decorative slab serif on Google Fonts, with heavy, rounded serifs that give it a friendly, vintage-poster feel.",
      },
      {
        title: "Trueno",
        href: "https://fontlibrary.org/en/font/trueno",
        description:
          "Free geometric sans-serif released on Font Library, popular as a lightweight alternative to paid grotesques like Century Gothic.",
      },
      {
        title: "Inclusive Sans",
        href: "https://www.oliviaking.com/inclusivesans/feature",
        description:
          "Free typeface engineered for accessibility: non-mirroring letterforms, wider counters and generous spacing for low-vision and neurodiverse readers, plus 48 extra glyphs supporting Aboriginal and Torres Strait Islander languages.",
      },
      {
        title: "Santello",
        href: "https://www.dafont.com/santello.font",
        description:
          "Free modern sans-serif display font on dafont, aimed at clean, professional branding and editorial use without decorative flourishes.",
      },
      {
        title: "Edge Cutting",
        href: "https://www.dafont.com/edgecutting.font",
        description:
          "Free geometric sans-serif on dafont inspired by the Aventa family, with the sharp, angular forms typical of the geometric-sans category.",
      },
      {
        title: "Hoky30",
        href: "https://zelowtype.gumroad.com/l/zthoky/Hoky30",
        description:
          "Retro-styled display font pack from independent foundry ZeLow Type, sold on Gumroad.",
      },
      {
        title: "Ta Fabricans",
        href: "https://www.dafont.com/ta-fabricans.font",
        description:
          "Free modern sans-serif on dafont with nine weights and multiple widths, built to flex across branding, editorial and interface work.",
      },
      {
        title: "Monoblock (Pixel Surplus)",
        href: "https://pixelsurplus.com/collections/free-fonts/products/monoblock",
        description:
          "Free blocky pixel monospace typeface from Pixel Surplus's free-fonts collection.",
      },
      {
        title: "GC Arbiter Mono Logic",
        href: "https://pixelsurplus.com/products/gc-arbiter-mono-logic-typeface",
        description:
          "Free monospace typeface that blends the technical feel of a coding font with a more refined, balanced letterform structure.",
      },
      {
        title: "WT Karsa Mono",
        href: "https://pixelsurplus.com/products/wt-karsa-mono-free-font",
        description:
          "Free monospace typeface with rigid, fixed-width structure softened by rounded corners and 45-degree diagonal cuts.",
      },
      {
        title: "TRT Interval Mono",
        href: "https://pixelsurplus.com/collections/free-fonts/products/trt-interval-mono-font",
        description:
          "Free monospace display font from Pixel Surplus's collection.",
      },
      {
        title: "Acro Mono Display",
        href: "https://pixelsurplus.com/collections/free-fonts/products/acro-mono-free-display-font",
        description:
          "Free monospace display font from Pixel Surplus's collection.",
      },
      {
        title: "Open Sauce Fonts",
        href: "https://github.com/marcologous/Open-Sauce-Fonts",
        description:
          "Free, open-source grotesque sans family originally commissioned by Sourcegraph, released with full variable-font support and a friendly, slightly rounded character.",
      },
      {
        title: "Plus Jakarta Sans",
        href: "https://github.com/tokotype/PlusJakartaSans",
        description:
          "Free geometric sans typeface family, a widely used default for SaaS marketing sites and dashboards.",
      },
      {
        title: "Onest",
        href: "https://github.com/simpals/onest",
        description:
          "Free modern grotesque sans typeface with strong Cyrillic support, designed to feel neutral and interface-friendly across scripts.",
      },
      {
        title: "Aspekta",
        href: "https://github.com/ivodolenc/aspekta",
        description:
          "Free variable grotesque sans typeface built as a single variable-font file spanning the whole weight range.",
      },
      {
        title: "Urbanist",
        href: "https://github.com/coreyhu/Urbanist",
        description:
          "Free low-contrast geometric sans typeface by Corey Hu, popular for clean, minimal UI type.",
      },
      {
        title: "Albert Sans",
        href: "https://github.com/usted/Albert-Sans",
        description:
          "Free grotesque sans typeface family with a wide weight range, built as a variable font.",
      },
      {
        title: "Inter",
        href: "https://github.com/rsms/inter",
        description:
          "The default UI sans-serif, used almost everywhere. Designed by Rasmus Andersson specifically for screens, with tall x-height and neutral letterforms tuned for small UI text.",
      },
      {
        title: "Geist Font",
        href: "https://github.com/vercel/geist-font",
        description:
          "Vercel's official sans and mono typeface family, designed in-house for their product UI and documentation, and free to use in any project.",
      },
      {
        title: "Hubot Sans",
        href: "https://github.com/github/hubot-sans",
        description:
          "GitHub's open-source display typeface, part of its in-house type system alongside Mona Sans.",
      },
      {
        title: "Mona Sans",
        href: "https://github.com/github/mona-sans",
        description:
          "GitHub's open-source variable sans typeface, used across github.com, with a wide axis range for weight and width.",
      },
      {
        title: "Rethink Sans",
        href: "https://github.com/hans-thiessen/Rethink-Sans",
        description:
          "Free grotesque sans typeface with a clean, contemporary character, released as a variable font.",
      },
      {
        title: "JetBrains Mono",
        href: "https://github.com/JetBrains/JetBrainsMono",
        description:
          "Popular monospace font built specifically for reading code: increased letter height for readability, distinct glyphs for easily confused characters, and built-in ligatures.",
      },
      {
        title: "Source Code Pro",
        href: "https://github.com/adobe-fonts/source-code-pro",
        description:
          "Adobe's open-source monospace coding font, designed as the monospaced companion to Source Sans.",
      },
      {
        title: "Roboto",
        href: "https://github.com/googlefonts/roboto",
        description:
          "Google's default Android and Material Design typeface, engineered to feel natural on both screen and print at any size.",
      },
      {
        title: "Monaspace",
        href: "https://github.com/githubnext/monaspace",
        description:
          "GitHub Next's monospace superfamily for code: five harmonized styles that share metrics so they can be mixed on one screen, plus opt-in texture healing and code-aware ligatures.",
      },
    ],
  },
  {
    title: "Branding and logo archives",
    links: [
      {
        title: "Logo System",
        href: "https://logosystem.co/",
        description:
          "Free logo inspiration library of 1,200+ curated logos, wordmarks, symbols and animated logos by top designers, browsable by type, industry, style, shape, color and mood.",
      },
      {
        title: "Logggos Club",
        href: "http://logggos.club",
        description:
          "Curated catalog of well-designed logos sorted by industry, theme, typography style and brand color, with logo submission and custom design request options.",
      },
      {
        title: "Brand Archive",
        href: "http://brandarchive.xyz",
        description:
          "Archive of brand identity work, logos and visual systems collected for reference.",
      },
      {
        title: "Rebrand Gallery",
        href: "http://rebrand.gallery",
        description:
          "Curated reference library specifically for brand designers, showcasing rebrands, identity launches and reveal videos from notable companies.",
      },
      {
        title: "Logo Archive",
        href: "http://logo-archive.org",
        description:
          "Positioned as the world's largest historical logo book, an extensive archive of logo design across eras and industries.",
      },
      {
        title: "Brand New",
        href: "http://underconsideration.com/brandnew",
        description:
          "Long-running, well-known branding criticism blog from UnderConsideration, publishing sharp, opinionated reviews of new corporate identities and rebrands as they launch.",
      },
      {
        title: "Cosmos",
        href: "http://cosmos.so",
        description:
          "Visual bookmarking and moodboarding tool for collecting and organizing images and references into shareable spaces.",
      },
      {
        title: "Are.na",
        href: "http://are.na",
        description:
          "Platform for collaborative research and visual bookmarking, organizing links, images and text into 'channels' that can be connected across users, widely used by designers for building reference libraries.",
      },
      {
        title: "Logobook",
        href: "http://logobook.com",
        description:
          "Online archive cataloging the world's logos, symbols and trademarks, browsable by letters/numbers, shapes, objects, nature imagery and business sector.",
      },
    ],
  },
  {
    title: "Design essays and culture",
    links: [
      {
        title: "Path to Design",
        href: "https://www.pathtodesign.com/",
        description:
          "Platform of real designer career stories across product, UI/UX and graphic design, with 57+ interviews, a career-path quiz, and curated tool/book recommendations.",
      },
      {
        title: "The World According to Umbra",
        href: "https://arenamag.com/articles/the-world-according-to-umbra",
        description:
          "Essay from Arena, a magazine covering technology, capitalism and civilization, examining its subject through that lens.",
      },
      {
        title: "Byrne's Euclid",
        href: "https://c82.net/euclid/",
        description:
          "Interactive digital reproduction by Nicholas Rougeux of Oliver Byrne's 1847 edition of Euclid's Elements, which replaced algebraic labels with bold colored diagrams, a landmark of information design centuries before the term existed.",
      },
      {
        title: "Bret Victor references",
        href: "https://worrydream.com/refs/",
        description:
          "Reference/bibliography page from Bret Victor's site (Worrydream), the influential essayist behind 'Up and Down the Ladder of Abstraction' and 'The Future of Programming', linking the sources behind his thinking.",
      },
      {
        title: "The Cypherpunk Library",
        href: "https://www.cypherpunkbooks.com/",
        description:
          "Curated collection of texts from cypherpunk and cryptography culture, the writing and manifestos behind the movement that shaped modern encryption and privacy tech.",
      },
      {
        title: "Design Research: By Womxn",
        href: "https://www.design-research.be/by-womxn",
        description:
          "Design research project centering women's perspectives and experiences in how design research gets done.",
      },
      {
        title: "Playlists.design",
        href: "https://playlists.design",
        description:
          "Curated music playlists for designers to work to, mood-matched to focused design sessions.",
      },
      {
        title: "Hey Designer",
        href: "https://heydesigner.com",
        description:
          "Daily-curated design newsletter running since 2012, hand-picking the week's best design links for over 10,000 subscribers covering design systems, UI/UX principles and new tools.",
      },
    ],
  },
  {
    title: "Animation and motion",
    links: [
      {
        title: "Fancy CSS Reveal Effects",
        href: "https://expensive.toys/blog/fancy-css-reveal-effects",
        description:
          "Blog post breaking down fancy CSS reveal effects, walking through the techniques for animating text and content into view on scroll and interaction.",
      },
      {
        title: "MotionSites",
        href: "https://motionsites.ai",
        description:
          "Collection of AI prompts for creating animated websites and motion-led interface experiences.",
      },
      {
        title: "Text Effects by Colorion",
        href: "https://text-effects.colorion.co",
        description:
          "Gallery of pure CSS text animations that can be studied and adapted without a JavaScript animation library.",
      },
      {
        title: "Kinetics by Colorion",
        href: "https://kinetics.colorion.co",
        description:
          "Interactive collection of spring-physics UI motion for exploring natural-feeling interface animation.",
      },
      {
        title: "Animations on the Web",
        href: "https://animations.dev/demo",
        description:
          "Course by Emil Kowalski (creator of Sonner and Vaul) on web animation fundamentals: easing, spring physics, and building interactions that feel right rather than just moving.",
      },
      {
        title: "Transitions.dev",
        href: "https://transitions.dev/",
        description:
          "Reference and demo site for view transitions on the web, showing what's possible with the View Transitions API and shared-element route animations.",
      },
      {
        title: "Ripplix",
        href: "https://www.ripplix.com/",
        description:
          "Collection of ripple and wave-style interaction effects for web interfaces.",
      },
      {
        title: "Motion Core",
        href: "https://motion-core.dev/",
        description:
          "Svelte-native motion component library powered by GSAP and WebGL, from subtle text effects to full 3D canvas systems.",
      },
      {
        title: "Tailwind CSS Animations",
        href: "https://tailwindcss-animations.vercel.app/",
        description:
          "Collection of ready-made CSS animations built to work as Tailwind utility classes, drop-in motion without writing custom keyframes.",
      },
      {
        title: "Animista",
        href: "https://animista.net/play/basic/flip/flip-diagonal-2-tl",
        description:
          "Long-running CSS animation playground: pick an effect, tune its parameters visually, and copy out the generated keyframes and classes.",
      },
      {
        title: "Fliiipbook",
        href: "https://www.fliiipbook.com/animate",
        description:
          "Simple web app for creating frame-by-frame GIF animations, with onion-skinning support and GIF export.",
      },
      {
        title: "Text Motion",
        href: "https://textmotion.dev/",
        description:
          "Lightweight, dependency-free library (slot-text) for character-by-character rolling text animation, built for tiny, tactile UI labels using pure CSS transforms.",
      },
      {
        title: "Spring Physics in CSS",
        href: "https://www.carmenansio.com/articles/spring-physics-css",
        description:
          "Article explaining how to implement realistic spring-physics motion using plain CSS, without reaching for a JS animation library.",
      },
      {
        title: "Anime.js",
        href: "https://animejs.com/",
        description:
          "Long-standing, widely used lightweight JavaScript animation engine, works across CSS properties, SVG, DOM attributes and JS objects with one consistent API.",
      },
      {
        title: "glimm",
        href: "https://glimm.dev/",
        description:
          "Lightweight (under 10KB) React/Next.js library for GPU-powered, shader-driven page transitions, a WebGL band sweeps across the screen on route change for meaningful moments rather than every navigation.",
      },
      {
        title: "Satteri",
        href: "https://satteri.bruits.org/",
        description:
          "Rust-based markdown processing pipeline for the JavaScript world, combining a fast Rust markdown engine with flexible JS plugins for processing Markdown and MDX.",
      },
      {
        title: "Lina scroll area",
        href: "https://lina.sameer.sh/",
        description:
          "Responsive scroll area component that feels native on touch devices: native scrollbars on mobile, custom-styled ones on desktop, with edge masking and polished micro-interactions.",
      },
      {
        title: "aMicro",
        href: "https://amicro.vercel.app/",
        description:
          "Micro-transitions tool/framework for small-scale UI state-change animations.",
      },
      {
        title: "Kexsio animations",
        href: "https://www.kexsio.com/animations",
        description:
          "Gallery of production-ready web components and animation templates with a copy-paste-build workflow, browsable by category with AI prompts or source code for each.",
      },
      {
        title: "Motionary",
        href: "https://motionary.dev/creators/6949b8263085772eb831634a",
        description:
          "Marketplace for premium animation and interactive UI components specifically for React Native and Expo apps, from common free effects to paid, more elaborate ones.",
      },
      {
        title: "Reactiive demos",
        href: "https://reactiive.io/demos",
        description:
          "Gallery of creative React animation demos for interaction and motion inspiration.",
      },
      {
        title: "ssgoi",
        href: "https://ssgoi.dev",
        description:
          "Page transition library for single-page apps, for animating between routes instead of hard page cuts.",
      },
      {
        title: "React Native Reanimated",
        href: "https://github.com/software-mansion/react-native-reanimated",
        description:
          "Software Mansion's animation library that runs animation logic on the UI thread via worklets; Meta's core team is now collaborating on a shared animation backend landing in React Native itself.",
      },
    ],
  },
  {
    title: "WebGL, shaders and creative coding",
    links: [
      {
        title: "Fleet",
        href: "https://tol.is/fleet",
        description:
          "Interactive flock dynamics experiment by Tolis, simulating boids-style flocking behaviour in the browser where many agents steer, align and swarm in real time.",
      },
      {
        title: "Matter.js",
        href: "https://brm.io/matter-js/",
        description:
          "Open-source 2D rigid-body physics engine for the web, with browser demos and guides for simulations, games and interaction experiments.",
      },
      {
        title: "Keramos",
        href: "https://keramos.vercel.app/",
        description:
          "Minimal browser-based creative coding experiment with a monospace control UI, worth a look for its restrained interface and interactive feel.",
      },
      {
        title: "Valessa",
        href: "https://valessa.riotters.com",
        description:
          "Browser-based 3D product visualizer for exploring interactive product presentation and real-time rendering.",
      },
      {
        title: "The Book of Shaders",
        href: "https://thebookofshaders.com/06/",
        description:
          "The canonical, widely used interactive guide to GLSL fragment shaders by Patricio Gonzalez Vivo, teaching shader programming from first principles with live, editable examples.",
      },
      {
        title: "Drei AsciiRenderer",
        href: "https://drei.docs.pmnd.rs/abstractions/ascii-renderer",
        description:
          "ASCII-art post-processing effect from Drei, the popular helper library for React Three Fiber, rendering a 3D scene as live ASCII characters.",
      },
      {
        title: "GLSL Sandbox",
        href: "https://mrdoob.com/#/139/glsl_sandbox",
        description:
          "Long-running community sandbox by mrdoob (Three.js creator) for writing and sharing GLSL shaders live in the browser.",
      },
      {
        title: "Chrome Experiments",
        href: "https://experiments.withgoogle.com/collection/chrome",
        description:
          "Google's showcase of creative web experiments pushing browser capabilities, WebGL, audio, and interaction demos from the early Chrome era onward.",
      },
      {
        title: "Fluid pendant",
        href: "https://mitxela.com/projects/fluid-pendant",
        description:
          "Handmade jewelry project by mitxela: a gold-plated pendant with a tiny LED matrix running a real-time FLIP fluid simulation on an STM32 microcontroller, motion-activated and coin-cell powered.",
      },
      {
        title: "Floor796",
        href: "https://floor796.com/#wandering",
        description:
          "Interactive isometric illustration of an office building where every window reveals an animated vignette, a well-known example of large-scale, detailed 2D animation on the web.",
      },
      {
        title: "Heerich",
        href: "https://meodai.github.io/heerich/",
        description:
          "Tiny engine by meodai for building 3D voxel scenes and rendering them as SVG, DOM-integrated so scenes can be styled with CSS and scale infinitely, inspired by sculptor Erwin Heerich's geometric forms.",
      },
      {
        title: "Whitespace Experiments",
        href: "https://experiments.thisiswhitespace.com/",
        description:
          "Playground of creative coding experiments from design studio Whitespace.",
      },
      {
        title: "Shaders hero section",
        href: "https://v0.app/templates/shaders-hero-section-cJOO8mnVR01?ref=Z0HBR4",
        description:
          "v0 template for a shader-driven animated hero section, ready to remix or drop into a project.",
      },
      {
        title: "Cells to Pixels",
        href: "https://cells2pixels.github.io/#growing",
        description:
          "Research project on Neural Cellular Automata: a coarse self-organizing grid paired with a lightweight decoder network generates high-resolution textures and patterns in real time, across 2D/3D grids and mesh surfaces.",
      },
      {
        title: "Awwwards WebGL and HTML course",
        href: "https://www.awwwards.com/academy/course/merging-webgl-and-html-worlds/lectures/7a14a7a1-72fe-428c-b5c1-680d7b90c026",
        description:
          "Awwwards Academy course on blending WebGL scenes with regular HTML/DOM content in the same page.",
      },
      {
        title: "Awwwards interactive 3D scenes course",
        href: "https://www.awwwards.com/academy/course/the-fun-process-of-creating-lively-interactive-3d-scenes-for-the-web/lectures/d84661d2-bc8d-4a55-9928-280aba8b92b2",
        description:
          "Awwwards Academy course on building lively, interactive 3D scenes for the web from start to finish.",
      },
      {
        title: "FluidCAD",
        href: "https://fluidcad.io",
        description:
          "Parametric CAD tool where you write JavaScript and see 3D geometry update live. Supports sketching, extrusions and fillets, STEP import/export, and keeps a parametric history so earlier steps stay editable.",
      },
      {
        title: "Pascal Editor",
        href: "https://editor.pascal.app",
        description:
          "Free, open-source, browser-based 3D building editor for turning physical spaces into digital twins, aimed at architects, developers and homeowners alike.",
      },
      {
        title: "Halftone Waves",
        href: "https://halftone-waves.ctate.dev",
        description:
          "Canvas-based generative art piece rendering an animated halftone dot pattern as flowing waves, by Vercel engineer Chris Tate (ctate.dev).",
      },
      {
        title: "Neon Maze",
        href: "https://neon-maze.ctate.dev",
        description:
          "Isometric maze rendered in glowing neon colors, a small creative-coding demo by Chris Tate (ctate.dev).",
      },
      {
        title: "Tetrahedron Physics",
        href: "https://tetrahedron-physics.ctate.dev",
        description:
          "Real-time 3D physics simulation of balls bouncing inside a rotating tetrahedron, by Chris Tate (ctate.dev).",
      },
      {
        title: "Audio Visualizer template",
        href: "https://v0.app/templates/audio-visualizer-eGfAJ9Uw70W",
        description:
          "v0 template for an audio-reactive visualizer, ready to remix or drop into a project.",
      },
    ],
  },
  {
    title: "Audio, video and media",
    links: [
      {
        title: "Cuelume",
        href: "https://cuelume-site.pages.dev/",
        description:
          "Lightweight JavaScript library that synthesizes interactive sound effects for web interfaces using the Web Audio API, no audio files or external dependencies required.",
      },
      {
        title: "Audio by Raphael Salaja",
        href: "https://audio.raphaelsalaja.com/",
        description:
          "@web-kits/audio, a declarative audio synthesis library for the web: define sounds as plain objects (sources, envelopes, effects) and play them with a simple function call. This is the library powering this site's own hover sounds.",
      },
      {
        title: "soundcn",
        href: "https://www.soundcn.xyz/",
        description:
          "Free sound effects library packaged for modern web apps, shadcn-style naming for a UI-ready audio asset collection.",
      },
      {
        title: "soundzjs",
        href: "https://soundzjs.vercel.app/docs",
        description:
          "React library for adding customizable sound effects to UI elements, with theming, haptic feedback and accessibility built in.",
      },
      {
        title: "Remocn",
        href: "https://www.remocn.dev/docs/compositions",
        description:
          "React animation library (built for Remotion-style video generation) offering higher-level compositions that combine primitives, UI blocks and transitions into finished animated 'shots', plus lower-level building blocks.",
      },
      {
        title: "Mediabunny",
        href: "https://mediabunny.dev/",
        description:
          "Zero-dependency JavaScript/TypeScript library for reading, writing and converting video and audio files directly in the browser, built from scratch for speed and small bundle size.",
      },
      {
        title: "VERT",
        href: "https://vert.sh/",
        description:
          "Free, open-source, privacy-friendly file converter that runs entirely client-side, no upload to a server for the conversion.",
      },
      {
        title: "Optimo",
        href: "https://optimo.microlink.io/",
        description:
          "Free, open-source CLI for optimizing and converting images and video, built on ImageMagick and FFmpeg, supporting 14 formats with batch resizing, lossy compression and metadata handling.",
      },
      {
        title: "Apple TV recreation",
        href: "https://www.frontend.fyi/tutorials/rebuilding-the-apple-tv-plus-website-with-framer-motion-and-tailwind",
        description:
          "Tutorial walking through rebuilding the Apple TV+ marketing site's interactions using Framer Motion and Tailwind, a practical reference for high-craft scroll and hover animation.",
      },
      {
        title: "Supertonic",
        href: "https://github.com/supertone-inc/supertonic",
        description:
          "Open-source project from Supertone (voice AI company) related to speech/audio synthesis technology.",
      },
      {
        title: "Web Reel",
        href: "https://webreel.dev/",
        description:
          "Tool that records scripted browser demos as video: describe interactions in JSON and it automates capture in a headless browser, adding cursor animation and keystroke overlays, for product demos, tutorials and CI pipelines.",
      },
      {
        title: "WebRTC video streaming",
        href: "https://blog.logrocket.com/webrtc-video-streaming/",
        description:
          "LogRocket guide to building real-time video streaming with WebRTC, covering the core APIs and common gotchas.",
      },
      {
        title: "Palmier",
        href: "https://www.palmier.io",
        description:
          "AI-native video editor: multi-track timeline editing plus the ability to generate images, video and audio inline via MCP-connected models like Claude, so AI generation and traditional editing live in one interface.",
      },
      {
        title: "Freesound",
        href: "https://freesound.org",
        description:
          "Large, long-running library of Creative Commons-licensed sound effects and field recordings, searchable and free to use with attribution.",
      },
      {
        title: "AVAL",
        href: "https://pixelpoint.io/aval/",
        description:
          "Pixel Point's open-source web video player for interactive, state-driven video experiences that respond to hover, focus and application state.",
      },
      {
        title: "RTMP streaming guide",
        href: "https://restream.io/blog/rtmp-streaming/",
        description:
          "Restream's practical guide to the RTMP live-streaming protocol, covering encoders, streaming-platform support, setup and how RTMP differs from HTTP streaming.",
      },
    ],
  },
  {
    title: "LLMs and AI engineering",
    links: [
      {
        title: "llms.txt Directory",
        href: "https://llmstxt.site/",
        description:
          "Directory of llms.txt file locations across the web with stats, tracking which sites publish the standard file that tells language models how to read and use their content.",
      },
      {
        title: "tokenmaxxing.sh",
        href: "https://tokenmaxxing.sh/#leaderboard",
        description:
          "Usage tracker and public leaderboard for AI coding-agent token consumption, spend and active days across supported tools.",
      },
      {
        title: "Vibe coding is not AI-assisted engineering",
        href: "https://addyo.substack.com/p/vibe-coding-is-not-the-same-as-ai",
        description:
          "Addy Osmani essay drawing a line between casually 'vibe coding' with an LLM and disciplined AI-assisted software engineering, arguing the two get conflated in ways that hurt production code quality.",
      },
      {
        title: "Building an elite AI engineering culture",
        href: "https://www.cjroth.com/blog/2026-02-18-building-an-elite-engineering-culture",
        description:
          "Argues AI amplifies a team's existing strengths rather than leveling the playing field; elite results need taste (knowing what to build), discipline (spec-driven process, real testing) and leverage (small teams, powerful tools) multiplied together, citing Linear, Cursor and Vercel.",
      },
      {
        title: "Effective communication in AI engineering",
        href: "https://jxnl.co/writing/2024/10/15/effective-communication-in-ai-engineering-moving-beyond-vague-updates/",
        description:
          "Jason Liu (jxnl) essay on why AI engineering teams need more precise status communication than 'still working on it', and how vague updates hide real progress and risk.",
      },
      {
        title: "How LLMs actually work",
        href: "https://www.0xkato.xyz/how-llms-actually-work/",
        description:
          "Plain-language explainer of how large language models work under the hood, aimed at engineers who use LLMs daily but haven't studied the internals.",
      },
      {
        title: "LLM Visualization",
        href: "https://bbycroft.net/llm",
        description:
          "Well-known interactive 3D visualization of a GPT-style language model, watch tokens flow through embeddings, attention and MLP layers in real time.",
      },
      {
        title: "The Transformers",
        href: "https://www.vizuaranewsletter.com/p/the-transformers",
        description:
          "Newsletter explainer on the Transformer architecture, the attention-based model behind essentially every modern LLM.",
      },
      {
        title: "LLM Architecture Gallery",
        href: "https://sebastianraschka.com/llm-architecture-gallery/",
        description:
          "Sebastian Raschka's visual gallery comparing the architectures of major LLM families side by side, a fast way to see how GPT, Llama, Mistral and others actually differ structurally.",
      },
      {
        title: "Hyperagents",
        href: "https://arxiv.org/abs/2603.19461",
        description:
          "Paper introducing 'hyperagents': self-referential AI systems pairing a task-solving agent with a meta-agent that can rewrite both itself and the task agent as editable code, extending the Darwin Gödel Machine framework so the improvement mechanism itself is improvable.",
      },
      {
        title: "arXiv 2501.02305",
        href: "https://arxiv.org/pdf/2501.02305",
        description:
          "Paper on open-addressed hash tables: shows they can achieve better search performance than previously believed, disproving Yao's long-standing 'Uniform Hashing is Optimal' conjecture with matching upper and lower bounds.",
      },
      {
        title: "FMHY AI",
        href: "https://fmhy.net/ai",
        description:
          "The AI section of the FMHY (Free Media Heck Yeah) wiki, a huge categorized directory of AI tools: chatbots, image/video/audio generators, local frontends, ML frameworks and benchmarks.",
      },
      {
        title: "Kill the bloat in Claude Code's system prompt",
        href: "https://www.aihero.dev/how-to-kill-the-bloat-in-claude-codes-system-prompt",
        description:
          "AI Hero post on trimming unnecessary context and instructions from a Claude Code system prompt to reduce token overhead and improve response quality.",
      },
      {
        title: "KV Cache explained intuitively",
        href: "https://medium.com/@saad.ahmed1926q/kv-cache-explained-intuitively-2b425a36dfc7",
        description:
          "Intuitive explainer of the KV (key-value) cache technique that makes autoregressive LLM inference fast by avoiding recomputing attention for tokens already generated.",
      },
      {
        title: "Berkeley EECS technical report",
        href: "https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/Archive/EECS-2016-143.pdf",
        description:
          "2016 UC Berkeley EECS technical report (PDF), archival research writeup from the department's technical report series.",
      },
      {
        title: "How I use LLMs, Karpathy",
        href: "https://www.youtube.com/watch?v=EWvNQjAaOHw",
        description:
          "Andrej Karpathy's practical walkthrough of his actual day-to-day LLM usage and workflow, widely watched for its concrete, unhyped take on using these tools well.",
      },
    ],
  },
  {
    title: "Machine learning and deep learning",
    links: [
      {
        title: "Maths, CS and AI compendium",
        href: "https://github.com/HenryNdubuaku/maths-cs-ai-compendium",
        description:
          "GitHub-hosted compendium of math, computer science and AI learning resources, organized as a structured reading path rather than a random link dump.",
      },
      {
        title: "ML Visualizer",
        href: "https://mlvisualizer.org/",
        description:
          "Interactive visualizations of machine learning concepts and model behavior, for building intuition beyond the equations.",
      },
      {
        title: "TensorFlow Playground",
        href: "https://playground.tensorflow.org/",
        description:
          "Google's classic interactive neural network visualizer: adjust layers, features and hyperparameters in the browser and watch a small network learn a toy dataset in real time.",
      },
      {
        title: "GPU Glossary",
        href: "https://modal.com/gpu-glossary",
        description:
          "Modal's reference glossary for GPU and CUDA terminology, demystifying the vocabulary (SMs, warps, tensor cores, memory hierarchy) that GPU performance work assumes you already know.",
      },
      {
        title: "Quantization from the ground up",
        href: "https://ngrok.com/blog/quantization",
        description:
          "Explainer on model quantization, how reducing numeric precision shrinks models and speeds inference, and the tradeoffs involved, from first principles.",
      },
      {
        title: "TurboQuant",
        href: "https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/",
        description:
          "Google Research blog post on TurboQuant, a technique for extreme model compression aimed at making AI inference dramatically more efficient.",
      },
      {
        title: "Best resources to learn deep learning",
        href: "https://www.mltut.com/best-resources-to-learn-deep-learning/",
        description:
          "Roundup of recommended courses, books and resources for learning deep learning from scratch.",
      },
      {
        title: "Algebrica",
        href: "https://algebrica.org/",
        description:
          "Resource site for learning the mathematics (algebra and beyond) underpinning machine learning and computer science.",
      },
      {
        title: "Label Studio",
        href: "https://labelstud.io",
        description:
          "Open-source data labeling tool for machine learning, supporting text, image, audio and video annotation for building training datasets.",
      },
    ],
  },
  {
    title: "AI tools, agents and search",
    links: [
      {
        title: "ReactBench",
        href: "https://www.reactbench.com/",
        description:
          "Evaluation platform that benchmarks coding agents on realistic React work, testing whether models can produce production-ready code that meets performance, accessibility and quality standards, not just pass basic functionality checks.",
      },
      {
        title: "ai-cli",
        href: "https://ai-cli.dev/",
        description:
          "Command-line tool for generating text, image, video and audio content from various AI models directly in the terminal, supports comparing multiple models in parallel and composes with Unix pipes.",
      },
      {
        title: "Models.dev",
        href: "https://models.dev/",
        description:
          "Well-known, frequently updated reference comparing LLM pricing, context windows and capabilities across providers, the go-to page when deciding which model to use for a task.",
      },
      {
        title: "ai-ng",
        href: "https://github.com/ai-ng",
        description:
          "GitHub organization building AI-powered developer tools, including Swift (a fast voice assistant) and 2txt (an image-to-text converter).",
      },
      {
        title: "AI tool system prompts",
        href: "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/Amp",
        description:
          "Widely referenced repository collecting the leaked/extracted system prompts and model configs of popular AI coding tools, this link points at the Amp entry specifically.",
      },
      {
        title: "Hegelian dialectic skill",
        href: "https://github.com/KyleAMathews/hegelian-dialectic-skill",
        description:
          "Claude Code skill that automates deep reasoning by spawning two agents to fully embody opposing positions on a topic ('Electric Monks'), then decomposes both arguments and synthesizes a richer, non-binary conclusion.",
      },
      {
        title: "c0da",
        href: "https://c0da.org/",
        description:
          "Feminist research and publishing platform exploring the intersection of feminist writing and the history of women in coding, commissioned essays and artworks on programming's overlooked female history.",
      },
      {
        title: "Ostralyan",
        href: "https://ostralyan.com/",
        description:
          "Interactive machine learning education platform: browser-based visualizations and live parameter tweaking across 25+ algorithms spanning neural networks, NLP, clustering and regression.",
      },
      {
        title: "Emil Kowalski skills",
        href: "https://github.com/emilkowalski/skills",
        description:
          "Claude Code skills published by Emil Kowalski (Sonner/Vaul creator), packaging his interaction-design and animation craft as installable agent skills.",
      },
      {
        title: "Matt Pocock skills",
        href: "https://github.com/mattpocock/skills",
        description:
          "Claude Code skills published by Matt Pocock (Total TypeScript), packaging his TypeScript expertise as installable agent skills.",
      },
      {
        title: "David Ondrej skills",
        href: "https://github.com/davidondrej/skills",
        description:
          "Claude Code skills published by David Ondrej, an AI-focused content creator.",
      },
      {
        title: "Building a web search engine from scratch",
        href: "https://blog.wilsonl.in/search-engine/",
        description:
          "Detailed, widely shared technical writeup on building a real web search engine from the ground up: crawling, indexing, ranking and the infrastructure decisions at each stage.",
      },
      {
        title: "Orama",
        href: "https://github.com/oramasearch/orama",
        description:
          "Fast, full-text and vector open-source search engine written in TypeScript, runs in the browser, Node or at the edge, popular as a lightweight Algolia/Elasticsearch alternative.",
      },
      {
        title: "Streamdown",
        href: "https://streamdown.ai/",
        description:
          "Markdown renderer built specifically for streaming AI model output: typography, syntax highlighting and animation handle text arriving incrementally, with optional math and diagram plugins.",
      },
      {
        title: "code-chunk",
        href: "https://github.com/supermemoryai/code-chunk/blob/main/packages/code-chunk/src/chunker.ts",
        description:
          "Chunking utility from Supermemory AI for splitting source code into semantically meaningful pieces, used for feeding code into embeddings/RAG pipelines without breaking mid-function.",
      },
      {
        title: "integrations.sh",
        href: "https://integrations.sh/",
        description:
          "Registry of 5,758+ publicly accessible integration specs across MCP, OpenAPI and GraphQL, letting AI agents discover and connect to third-party services from one catalog.",
      },
      {
        title: "Boring Computers",
        href: "https://boringcomputers.com/",
        description:
          "Open-source platform providing instant Firecracker microVMs, a terminal, a real browser and preinstalled coding agents driven by an AI, self-hostable with your own Anthropic and S3 keys.",
      },
      {
        title: "v0",
        href: "https://v0.app",
        description:
          "Vercel's text-to-app generator: describe a UI or product in prompts and get a working Next.js/Tailwind app back, with a sandboxed runtime and native GitHub branches/PRs.",
      },
      {
        title: "Cursor Directory",
        href: "https://cursor.directory",
        description:
          "Directory of Cursor .cursorrules and community plugins for tuning AI pair-programming behavior per language and framework.",
      },
      {
        title: "Languine",
        href: "https://languine.ai",
        description:
          "AI-powered CLI for app localization, built on the Vercel AI SDK, detects changed translation keys via git diff instead of re-translating everything.",
      },
      {
        title: "3D Model Generator",
        href: "https://3d-model-generator.ctate.dev",
        description:
          "AI tool that generates 3D models from a prompt via Hyper3D Rodin, by Chris Tate (ctate.dev).",
      },
    ],
  },
  {
    title: "AI agent platforms and infrastructure",
    links: [
      {
        title: "VibeUI",
        href: "https://vibeui.online",
        description:
          "Library of 92 layout prompts across 15 categories (auth forms, pricing pages, hero sections, dashboards) meant to be copy-pasted into an AI coding tool like Claude or GPT to scaffold a UI.",
      },
      {
        title: "String",
        href: "https://string.com",
        description:
          "Platform for building and deploying AI agents that can operate autonomously.",
      },
      {
        title: "Ship Studio",
        href: "https://www.ship.studio",
        description:
          "Free, open-source desktop app that unifies AI coding agents (like Claude Code), GitHub and hosting platforms (like Vercel) into one workspace, so code and deploys stay in your own accounts with no vendor lock-in.",
      },
      {
        title: "opencli",
        href: "https://opencli.info",
        description:
          "Gives a command-line interface or AI agent control of an already-logged-in browser session, so an agent can act on sites you're authenticated into instead of needing separate credentials.",
      },
      {
        title: "Flue Framework",
        href: "https://flueframework.com",
        description:
          "Open-source TypeScript framework for building autonomous AI agents with built-in durability and recovery, aiming to write once, deploy anywhere, and work with any LLM.",
      },
      {
        title: "Vercel Eve",
        href: "https://vercel.com/eve",
        description:
          "Vercel's framework for building AI agents, positioned as 'Next.js for agents': markdown for instructions and skills, TypeScript for tools, deployable to Slack, Discord and the web.",
      },
      {
        title: "Conductor",
        href: "https://www.conductor.build",
        description:
          "Runs multiple parallel coding agents (Claude Code, Codex, Cursor) on your Mac in isolated workspaces, so you can monitor several at once and merge the results together.",
      },
      {
        title: "Hyperframes",
        href: "https://github.com/heygen-com/hyperframes",
        description:
          "Open-source framework by HeyGen that converts HTML, CSS, media and animation into deterministic MP4 video, built for AI coding agents: write HTML, render video, with skills that automate the video-production workflow.",
      },
      {
        title: "Blueberry",
        href: "https://www.meetblueberry.com",
        description:
          "AI-native product development platform that unifies a code editor, terminal, browser preview and canvas into one workspace, with Claude wired in to see your code, browser output and running app at once.",
      },
      {
        title: "Lil Agents",
        href: "https://lilagents.xyz",
        description:
          "macOS app with two AI companions, Bruce and Jazz, that live above your dock with their own Claude sessions for chatting and coding, each with themes and visible thinking-status indicators.",
      },
      {
        title: "Feynman",
        href: "https://www.feynman.is",
        description:
          "Open-source AI research agent that reads papers, searches the web, writes research drafts, plans experiments and cites sources, with both a CLI and a local workbench app for notebooks and chat.",
      },
      {
        title: "Rivet Agent OS",
        href: "https://rivet.dev/agent-os",
        description:
          "Runtime and infrastructure platform for deploying AI agents, now published as agentos-sdk.dev, an SDK for giving agents durable, production-grade execution environments.",
      },
      {
        title: "Agentation",
        href: "https://www.agentation.com",
        description:
          "Desktop tool that turns UI feedback into structured data for AI coding agents: click an element, add a note, and it packages the CSS selector and source path so an agent like Claude Code can make a targeted fix.",
      },
      {
        title: "aitmpl",
        href: "https://www.aitmpl.com",
        description:
          "Marketplace of ready-to-use Claude Code configurations, 1000+ agents, commands, skills and MCP integrations, with a Stack Builder for assembling a custom setup.",
      },
      {
        title: "pi.dev",
        href: "https://pi.dev",
        description:
          "Minimal agent harness for building customizable AI coding workflows via extensions and skills, working across 15+ model providers instead of locking you into one.",
      },
      {
        title: "Baudbot",
        href: "https://baudbot.ai",
        description:
          "Coding agent that lives in Slack and works your Linux server directly: message it a task and it creates branches, writes code and opens pull requests, running persistently and learning your codebase over time.",
      },
      {
        title: "Promptfoo",
        href: "https://www.promptfoo.dev",
        description:
          "Open-source tool for testing and evaluating LLM prompts, running them against test cases and models to catch regressions before shipping a prompt change.",
      },
      {
        title: "Design Prompts",
        href: "https://www.designprompts.dev",
        description:
          "AI-powered design style explorer with curated prompts for generating different visual directions and creative styles.",
      },
      {
        title: "Actors.dev",
        href: "https://actors.dev",
        description:
          "Communication platform giving AI agents their own email addresses, mailboxes, phone calls and webhook forwarding. Note: shutting down permanently on August 11, 2026, with all API access ending that date.",
      },
      {
        title: "AgentCard",
        href: "https://agentcard.sh",
        description:
          "Issues single-use virtual Visa cards to AI agents with fixed, scoped budgets so they can make real purchases online, integrating natively with Claude and other MCP clients.",
      },
      {
        title: "iocaihost",
        href: "https://iocaihost.com",
        description:
          "No-account static site hosting built for AI agents: a simple REST API lets an agent claim a slug and deploy HTML from templates like portfolios or storefronts, with restrictions against scripts and malicious content.",
      },
      {
        title: "entire.io",
        href: "https://entire.io",
        description:
          "Developer platform that logs every agent session, prompt and tool call alongside your git commits as searchable checkpoints, plus a distributed Git network with regional mirrors so agents can clone repos fast without rate limits.",
      },
      {
        title: "Cloudflare Sandbox",
        href: "https://sandbox.cloudflare.com",
        description:
          "Runs untrusted code in isolated Cloudflare Workers sandboxes, useful for safely executing AI-generated or user-submitted code.",
      },
      {
        title: "Agents View",
        href: "https://www.agentsview.io",
        description:
          "Dashboard for monitoring AI agent activity across a fleet of running agents.",
      },
      {
        title: "Sparkbites",
        href: "https://sparkbites.dev",
        description:
          "Curated design inspiration directory covering 270+ sites, decoding each one's fonts, colors and tech stack specifically for AI agents to reference, with an MCP server for pulling the data into Claude or Cursor.",
      },
      {
        title: "agent-browser",
        href: "https://github.com/vercel-labs/agent-browser",
        description:
          "Browser automation CLI from Vercel Labs built for AI agents to drive a real browser session.",
      },
      {
        title: "ralph-loop-agent",
        href: "https://github.com/vercel-labs/ralph-loop-agent",
        description:
          "Experimental framework from Vercel Labs that wraps the AI SDK with outer iteration logic, running an autonomous agent loop until a verification function confirms the task is done, with stop conditions by iteration count, token budget or cost.",
      },
      {
        title: "Zero",
        href: "https://zerolang.ai",
        description:
          "Experimental programming language where the graph is the program instead of text files: agents query a semantic graph, submit compiler-checked edits, and humans review the changes as a readable projection.",
      },
      {
        title: "OpenUI Spec",
        href: "https://openuispec.org",
        description:
          "AI-native specification for describing UIs, aimed at giving agents a structured format to generate and reason about interfaces instead of raw markup.",
      },
      {
        title: "Tooly",
        href: "https://tooly.ctate.dev",
        description:
          "Packages popular APIs (GitHub, Stripe, Linear, Notion) as ready-made AI SDK/agent tools, by Chris Tate (ctate.dev).",
      },
      {
        title: "Executor",
        href: "https://github.com/UsefulSoftwareCo/executor",
        description:
          "Integration layer for AI agents: lets an agent call any OpenAPI, MCP, GraphQL or custom JS function inside a secure sandboxed environment, by Rhys Sullivan.",
      },
      {
        title: "Vercel AI SDK",
        href: "https://vercel.com/docs/ai-sdk",
        description:
          "TypeScript SDK unifying LLM provider APIs (OpenAI, Anthropic, Google and others) behind one streaming and tool-calling interface, one of the most widely used AI libraries in the JS ecosystem.",
      },
      {
        title: "shadcn AI SDK helpers",
        href: "https://ui.shadcn.com/docs/helpers/ai-sdk",
        description:
          "Helpers for creating AI SDK messages and streaming predefined useChat conversations without a model, API route, network request or API key, useful for UI demos and deterministic tests.",
      },
      {
        title: "Vercel Sandbox",
        href: "https://vercel.com/docs/sandbox",
        description:
          "MicroVM compute primitive for running untrusted or agent-generated code with persistent filesystem state, available through the standard Vercel CLI.",
      },
      {
        title: "Cloudflare Workers AI and AI Gateway",
        href: "https://developers.cloudflare.com/workers-ai/",
        description:
          "Inference at the edge plus a unified gateway across 14+ LLM providers, for routing, caching and logging AI requests from one place.",
      },
      {
        title: "Cloudflare Agents SDK",
        href: "https://developers.cloudflare.com/agents/",
        description:
          "JavaScript framework for building persistent, stateful AI agents on Cloudflare Workers, used as the runtime other agent frameworks build on top of.",
      },
      {
        title: "Polylane",
        href: "https://polylane.com/",
        description:
          "AI agents that read your code and watch your infrastructure to investigate production incidents and open pull requests with fixes, aimed at cutting down on-call load.",
      },
    ],
  },
  {
    title: "Backend engineering",
    links: [
      {
        title: "Next.js WebSocket upgrade in route handlers",
        href: "https://github.com/vercel/next.js/discussions/95514",
        description:
          "RFC for NextResponse.upgrade(), the first native way to handle WebSocket connections directly in a Next.js route handler with open/message/close/error hooks, powered by crossws with an API similar to Bun's.",
      },
      {
        title: "Laws of Software Engineering",
        href: "https://lawsofsoftwareengineering.com/",
        description:
          "Collection of named laws, heuristics and adages about software engineering (Conway's Law, Hyrum's Law and similar), a quick-reference for the rules of thumb the field keeps rediscovering.",
      },
      {
        title: "The hidden performance cost of Node and GraphQL",
        href: "https://www.softwareatscale.dev/p/the-hidden-performance-cost-of-nodejs",
        description:
          "Deep dive on performance pitfalls that show up specifically when running GraphQL servers on Node.js at scale, and how to avoid them.",
      },
      {
        title: "Systems Engineering",
        href: "https://www.ashpreetbedi.com/articles/systems-engineering",
        description:
          "Essay on systems engineering thinking applied to software: designing for the whole system's behavior, not just individual components.",
      },
      {
        title: "The many JavaScript runtimes of the last decade",
        href: "https://buttondown.com/whatever_jamie/archive/the-many-many-many-javascript-runtimes-of-the-last-decade/",
        description:
          "Retrospective tour of the JavaScript runtime landscape over the past decade, Node, Deno, Bun and the rest, and how we ended up with so many.",
      },
      {
        title: "Serverless Horrors",
        href: "https://serverlesshorrors.com/",
        description:
          "Collection of real-world serverless horror stories, cautionary tales of cost blowups, cold-start disasters and architecture gone wrong.",
      },
      {
        title: "V8 research grant",
        href: "https://v8.dev/grant",
        description:
          "Official V8 team page describing their research grant program for academic and open-source work related to the V8 JavaScript engine.",
      },
      {
        title: "Tech Vault",
        href: "https://github.com/moabukar/tech-vault/",
        description:
          "GitHub repository collecting curated technical resources and notes across backend, infrastructure and systems topics.",
      },
      {
        title: "Refactoring and Design Patterns",
        href: "https://refactoring.guru/",
        description:
          "Extremely well-known reference site cataloging classic design patterns and refactoring techniques with clear diagrams and code examples in multiple languages.",
      },
      {
        title: "JWT anatomy",
        href: "https://rmrf.tips/en/posts/jwt-anatomy/",
        description:
          "Breaks down the structure of a JSON Web Token piece by piece, header, payload and signature, and what each part actually does.",
      },
      {
        title: "Understanding Streams in Node.js",
        href: "https://nodesource.com/blog/understanding-streams-in-nodejs",
        description:
          "NodeSource guide to Node.js streams: readable, writable, duplex and transform streams, and when to reach for each.",
      },
      {
        title: "What Node.js is",
        href: "https://www.thenodebook.com/node-arch/what-is-nodejs",
        description:
          "Foundational explainer on Node.js's architecture: the event loop, libuv and how it achieves non-blocking I/O.",
      },
      {
        title: "SSE vs WebSockets",
        href: "https://neciudan.dev/sse-vs-websockets",
        description:
          "Comparison of Server-Sent Events and WebSockets for real-time features, covering when the simpler one-way SSE is enough versus needing full duplex WebSockets.",
      },
      {
        title: "Server survival",
        href: "https://github.com/pshenok/server-survival",
        description:
          "Interactive 3D tower-defense game that teaches cloud architecture through gameplay: build and scale infrastructure to handle traffic, manage budgets, defend against DDoS, and keep services healthy.",
      },
      {
        title: "Backend from first principles",
        href: "https://github.com/hanspaa2017108/backend-from-first-principles-sriniously",
        description:
          "Repository of notes following Sriniously's 'Backend from first principles' YouTube course, lecture-by-lecture writeups of backend fundamentals.",
      },
      {
        title: "tinbase",
        href: "https://www.tinbase.dev/",
        description:
          "Supabase-compatible backend that fits in a tin: a lightweight, open-source local dev stack running as a single process with real Postgres, works unchanged with the official supabase-js SDK, and can even run inside a browser tab.",
      },
      {
        title: "Arcjet",
        href: "https://arcjet.com",
        description:
          "Security-as-code SDK you drop into your app's own code: rate limiting, bot detection, and a WAF, configured in application logic instead of a separate infrastructure layer.",
      },
      {
        title: "Cap.js",
        href: "https://capjs.js.org",
        description:
          "Lightweight, privacy-friendly CAPTCHA alternative that avoids the tracking and heavy scripts of reCAPTCHA-style widgets.",
      },
      {
        title: "Trigger.dev",
        href: "https://trigger.dev",
        description:
          "Open-source background jobs and workflow platform for running long-running or scheduled tasks reliably outside the request/response cycle, with built-in retries and observability.",
      },
      {
        title: "Autumn",
        href: "https://useautumn.com",
        description:
          "Open-source billing platform that sits alongside Stripe rather than replacing it, managing subscriptions, usage tracking, credits and feature entitlements through a simple API, aimed at AI startups with usage-based pricing.",
      },
      {
        title: "MSW",
        href: "https://mswjs.io",
        description:
          "Mock Service Worker: intercepts real network requests at the browser/Node level for API mocking in tests and dev environments, so components hit realistic mocked responses instead of a mocked fetch function.",
      },
      {
        title: "Better Auth",
        href: "https://better-auth.com",
        description:
          "Framework-agnostic, self-hosted TypeScript authentication library configured entirely in code, with plugins for 2FA, SSO, SCIM and social login across Next.js, Nuxt, SvelteKit and 20+ other frameworks.",
      },
      {
        title: "Cloudflare Queues",
        href: "https://developers.cloudflare.com/queues/",
        description:
          "Managed message queue for Cloudflare Workers with pull-based consumers, for offloading work from the request/response cycle.",
      },
      {
        title: "The only scalable delete in Postgres is DROP TABLE",
        href: "https://planetscale.com/blog/the-only-scalable-delete-in-postgres-is-drop-table",
        description:
          "PlanetScale post arguing large-scale DELETE statements degrade badly from MVCC bloat and vacuum pressure, and recommending table partitioning so bulk deletion becomes DROP TABLE or TRUNCATE instead.",
      },
      {
        title: "Why we chose NanoIDs for PlanetScale's API",
        href: "https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api",
        description:
          "Covers the ID-design tradeoff of keeping a BIGINT auto-increment as the clustered primary key while exposing a separate NanoID column as the public-facing identifier.",
      },
      {
        title: "Deadlocks and downtime",
        href: "https://planetscale.com/blog/deadlocks-and-downtime",
        description:
          "PlanetScale walkthrough of how transaction lock contention escalates into full outages, and how retry logic plus traffic shaping prevents the cascade.",
      },
    ],
  },
  {
    title: "Databases and storage",
    links: [
      {
        title: "Databasemaxxing",
        href: "https://pthorpe92.dev/databasemaxxing/",
        description:
          "Post on pushing a single database as far as it can go before reaching for distributed/sharded architecture, in the spirit of the 'you're probably not Google' school of database advice.",
      },
      {
        title: "High memory usage in Postgres is good",
        href: "https://planetscale.com/blog/high-memory-usage-in-postgres-is-good-actually",
        description:
          "PlanetScale post arguing that Postgres using most of your server's RAM (via the OS page cache) is a healthy sign, not a leak, and explains why.",
      },
      {
        title: "Patterns for Postgres traffic control",
        href: "https://planetscale.com/blog/patterns-for-postgres-traffic-control",
        description:
          "PlanetScale post on managing and shaping traffic to a Postgres database, connection limits, queueing and backpressure patterns to avoid overload.",
      },
      {
        title: "FokosDB",
        href: "https://www.lambrospetrou.com/articles/fokosdb/",
        description:
          "Writeup of a custom database built on Cloudflare Durable Objects with strong consistency and bottomless storage, using a B+tree partition topology with hash/range splits to scale throughput to millions of items while keeping strict consistency.",
      },
      {
        title: "Database connections and pooling",
        href: "https://sagarshiroya.dev/posts/database-connection-and-pooling",
        description:
          "Explains how database connections actually work and why pooling matters at scale, including sizing a pool with Little's Law and Kingman's Formula.",
      },
      {
        title: "MySQL for developers",
        href: "https://planetscale.com/learn/courses/mysql-for-developers/schema/introduction-to-schema",
        description:
          "PlanetScale's free course on MySQL fundamentals for application developers, starting with schema design.",
      },
      {
        title: "IO devices and latency",
        href: "https://planetscale.com/blog/io-devices-and-latency",
        description:
          "PlanetScale post on the real latency characteristics of different storage IO devices, and why that matters for database performance tuning.",
      },
      {
        title: "Postgres OLTP benchmarks",
        href: "https://benjdd.com/pg-oltp/",
        description:
          "Interactive benchmark archive of Postgres OLTP transactions-per-second performance across scales, types and modes, tracing performance changes across Postgres history.",
      },
      {
        title: "How Agoda unified its data pipelines",
        href: "https://www.infoq.com/news/2026/01/agoda-unified-data-pipeline/",
        description:
          "InfoQ writeup on how Agoda consolidated its fragmented data pipeline infrastructure into a single unified system.",
      },
      {
        title: "Agoda financial metrics uptime",
        href: "https://medium.com/agoda-engineering/how-agoda-enhanced-the-uptime-and-consistency-of-financial-metrics-ef7d54c4e4f0",
        description:
          "Agoda engineering post on how they improved the uptime and consistency of their financial metrics pipeline, a real-world reliability case study.",
      },
      {
        title: "B-trees and database indexes",
        href: "https://planetscale.com/blog/btrees-and-database-indexes",
        description:
          "PlanetScale explainer on how B-tree indexes actually work under the hood and why they're the default structure for database indexing.",
      },
      {
        title: "Database transactions",
        href: "https://planetscale.com/blog/database-transactions",
        description:
          "PlanetScale explainer on database transactions: ACID guarantees, isolation levels, and what can go wrong when you don't understand them.",
      },
      {
        title: "Managing Postgres connections",
        href: "https://brandur.org/postgres-connections",
        description:
          "Brandur Leach's well-known deep dive on how Postgres handles connections, why each one is relatively expensive, and practical strategies for managing connection count at scale.",
      },
      {
        title: "Solving the hot key problem",
        href: "https://ximedes.com/blog/solving-the-hot-key-problem",
        description:
          "Interview with TigerBeetle's CEO on the 'hot key' problem, the roughly-100-TPS-per-account ceiling most databases hit, and how TigerBeetle's design (built for financial transactions, NASA-grade safety standards) avoids it while keeping predictable latency.",
      },
      {
        title: "airpipe",
        href: "https://github.com/sanyam-g/airpipe",
        description:
          "Lightweight data pipeline tool for moving and transforming data between sources without a heavyweight ETL platform.",
      },
      {
        title: "Azimutt",
        href: "https://azimutt.app",
        description:
          "Tool for exploring and documenting large, complex database schemas visually, built for schemas too big to reason about from raw SQL alone.",
      },
      {
        title: "Typesense",
        href: "https://typesense.org",
        description:
          "Fast, open-source, typo-tolerant search engine built as a simpler self-hostable alternative to Algolia or Elasticsearch for site and app search.",
      },
      {
        title: "Chroma",
        href: "https://www.trychroma.com",
        description:
          "Open-source embedding database for AI apps, the default vector store many RAG projects reach for when storing and querying embeddings.",
      },
      {
        title: "Convex",
        href: "https://www.convex.dev",
        description:
          "Reactive backend platform with a built-in database: write server functions in TypeScript and get automatic real-time sync to the client, no separate API layer to hand-wire.",
      },
      {
        title: "Drizzle ORM",
        href: "https://orm.drizzle.team",
        description:
          "TypeScript ORM with zero runtime dependencies and a SQL-like query builder, supporting Postgres, MySQL, SQLite and more, with drivers for serverless targets like Neon, Turso and Cloudflare D1.",
      },
      {
        title: "Cloudflare D1",
        href: "https://developers.cloudflare.com/d1/",
        description:
          "SQLite-based serverless SQL database on Cloudflare's edge network, designed to be sharded per-tenant rather than run as one central database.",
      },
      {
        title: "Cloudflare R2",
        href: "https://developers.cloudflare.com/r2/",
        description:
          "S3-compatible object storage on Cloudflare with zero egress fees, a common pick for teams that got burned by S3 bandwidth bills.",
      },
      {
        title: "Cloudflare Hyperdrive",
        href: "https://developers.cloudflare.com/hyperdrive/",
        description:
          "Connection pooling and acceleration layer that sits in front of an existing Postgres or MySQL database, for querying it fast from Cloudflare Workers.",
      },
      {
        title: "Vercel Blob",
        href: "https://vercel.com/docs/storage/vercel-blob",
        description:
          "Managed object storage for file uploads served through a global CDN, the same storage this registry's own asset pipeline runs on.",
      },
      {
        title: "Non-blocking schema changes",
        href: "https://planetscale.com/blog/non-blocking-schema-changes",
        description:
          "PlanetScale explains how it avoids running raw DDL against production: build a shadow table, backfill rows in batches, and apply ongoing writes via binlog streaming before cutover.",
      },
      {
        title: "RLS sounds great until it isn't",
        href: "https://planetscale.com/blog/rls-sounds-great-until-it-isnt",
        description:
          "PlanetScale details concrete failure modes of Postgres Row Level Security at scale: connection-pooler incompatibilities, planner cost blind spots, and per-query policy-evaluation overhead.",
      },
    ],
  },
  {
    title: "Infrastructure, observability and runtimes",
    links: [
      {
        title: "Domain SDK",
        href: "https://www.domain-sdk.dev/",
        description:
          "TypeScript library that gives one unified API for managing customer custom domains across hosting platforms like Vercel, Cloudflare, Railway, Render and Netlify, so you add, verify, monitor and remove domains without learning each provider's own implementation.",
      },
      {
        title: "Tracing a memory leak in an LRU cache",
        href: "https://blog.openresty.com/en/xray-casestudy-lua-lru/",
        description:
          "Case study of using OpenResty XRay to diagnose a memory leak caused by an oversized Lua LRU cache holding SSL certificate objects, memory analysis and flame graphs traced it to a specific table blocking garbage collection.",
      },
      {
        title: "OpenStatus",
        href: "https://www.openstatus.dev/",
        description:
          "Open-source uptime monitoring and status page platform, a self-hostable alternative to paid status-page SaaS.",
      },
      {
        title: "Just use evlog",
        href: "https://www.justfuckinguseevlog.com/",
        description:
          "Blunt marketing site for evlog, a TypeScript-first structured logger: one JSON event per operation with full context instead of scattered log lines, zero transitive dependencies.",
      },
      {
        title: "evlog",
        href: "https://www.evlog.dev/",
        description:
          "Main site for evlog, the modern TypeScript logger for scripts, libraries, jobs, edge and requests, with simple logging, wide-event context accumulation, and structured errors with actionable guidance.",
      },
      {
        title: "Workbench for BullMQ",
        href: "https://getworkbench.dev/",
        description:
          "Dashboard for inspecting, debugging and managing BullMQ job queues in real time, available as a native macOS app, embeddable Node integration, or standalone Docker container.",
      },
      {
        title: "A peek behind Colossus",
        href: "https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system",
        description:
          "Google Cloud blog post describing Colossus, Google's internal distributed file system that underpins most of its storage products, one of the few public looks at its design.",
      },
      {
        title: "Brendan Gregg's blog",
        href: "https://www.brendangregg.com/blog/index.html",
        description:
          "Blog of Brendan Gregg, one of the most respected performance engineers in the industry (BPF, flame graphs, USE method), essential reading for systems performance work.",
      },
      {
        title: "Perfetto UI",
        href: "https://ui.perfetto.dev/#!/query",
        description:
          "Google's web-based trace viewer and query tool for analyzing performance traces (Chrome, Android, Linux ftrace), this link opens its SQL-style trace query interface.",
      },
      {
        title: "AWS serverless topics",
        href: "https://builder.aws.com/learn/topics/serverless",
        description:
          "AWS's own learning hub for serverless architecture topics: Lambda, event-driven design, and related patterns.",
      },
      {
        title: "Kubernetes, what I wish I knew",
        href: "https://aws.plainenglish.io/kubernetes-still-feels-weird-what-i-wish-i-knew-sooner-dd61b90463db",
        description:
          "Personal retrospective on the Kubernetes concepts that took longest to click, written for engineers who still find k8s confusing despite using it daily.",
      },
      {
        title: "EC2 instances comparison",
        href: "https://instances.vantage.sh/",
        description:
          "Well-known, exhaustive comparison table of every AWS EC2 instance type, specs and pricing, side by side, for picking the right instance without digging through AWS docs.",
      },
      {
        title: "Akamai blog",
        href: "https://www.akamai.com/blog",
        description:
          "Akamai's engineering and industry blog, covering CDN, security and infrastructure topics from one of the largest edge networks in the world.",
      },
      {
        title: "here.now",
        href: "https://here.now",
        description:
          "Instant hosting for static sites, apps and files, built so an AI agent or a person can publish to a live URL with no account required. Offers temporary anonymous hosting or API-key-based permanent sites with access controls and analytics.",
      },
      {
        title: "Supabase docs over SSH",
        href: "https://supabase.com/blog/supabase-docs-over-ssh",
        description:
          "Supabase engineering blog post on serving their documentation through an SSH terminal session, a novel way to browse docs without a browser.",
      },
      {
        title: "LowEndBox",
        href: "https://lowendbox.com",
        description:
          "Long-running blog of deals and reviews for cheap VPS hosting, a go-to for finding low-cost virtual servers.",
      },
      {
        title: "OpenPanel",
        href: "https://openpanel.dev",
        description:
          "Open-source, privacy-friendly web analytics platform, a self-hostable alternative to Google Analytics or Mixpanel.",
      },
      {
        title: "tunnl.gg",
        href: "https://tunnl.gg",
        description:
          "Exposes a local development server to the internet via a public URL, similar to ngrok, for testing webhooks or sharing a local build.",
      },
      {
        title: "Cloudflare Workers",
        href: "https://developers.cloudflare.com/workers/",
        description:
          "V8-isolate-based edge compute platform officially supporting 18+ frameworks, one of the most widely deployed serverless runtimes.",
      },
      {
        title: "Alchemy",
        href: "https://alchemy.run/",
        description:
          "TypeScript-native infrastructure as code for defining and deploying Cloudflare and AWS resources as ordinary async functions. Particularly useful for colocating a Worker, KV, queues, bindings, local development and observability in one typed alchemy.run.ts file.",
      },
      {
        title: "Cloudflare Durable Objects",
        href: "https://developers.cloudflare.com/durable-objects/",
        description:
          "Stateful serverless compute with strict serializability for global request ordering, the primitive that Cloudflare's own D1 and Queues are built on top of.",
      },
      {
        title: "Cloudflare Containers",
        href: "https://developers.cloudflare.com/containers/",
        description:
          "Runs full Linux container workloads deployed via wrangler, for workloads that don't fit the Workers isolate model.",
      },
      {
        title: "Introducing Database Traffic Control",
        href: "https://planetscale.com/blog/introducing-database-traffic-control",
        description:
          "PlanetScale's proxy-layer system that enforces real-time budgets on query traffic using leaky-bucket rate limiting, estimating per-query resource cost from the planner before execution.",
      },
      {
        title: "EAS Build",
        href: "https://expo.dev/eas",
        description:
          "Expo's cloud service that compiles native iOS/Android builds without a local Xcode or Android Studio setup, configured through eas.json build profiles.",
      },
      {
        title: "EAS Update",
        href: "https://docs.expo.dev/eas-update/introduction/",
        description:
          "Ships JavaScript and asset changes over the air to already-installed Expo builds, bypassing App Store and Play Store review for non-native changes.",
      },
      {
        title: "EAS Workflows",
        href: "https://docs.expo.dev/eas/workflows/get-started/",
        description:
          "YAML-defined CI/CD pipelines for build, test, submit and update jobs that run on EAS infrastructure and trigger on GitHub events.",
      },
      {
        title: "EAS Observe",
        href: "https://expo.dev/blog/introducing-observe",
        description:
          "Expo's production performance monitoring in open beta, tracking cold and warm launch time, time to interactive and first render across real user sessions with per-release percentile breakdowns.",
      },
    ],
  },
  {
    title: "Distributed systems and computer science",
    links: [
      {
        title: "The TCP/IP Guide",
        href: "http://www.tcpipguide.com/free/t_toc.html",
        description:
          "Extremely thorough, free reference on TCP/IP networking, from the physical layer up through application protocols, a classic deep-reference for how the internet actually works.",
      },
      {
        title: "Computer Networks: A Systems Approach",
        href: "https://book.systemsapproach.org/",
        description:
          "Free online edition of Peterson and Davie's well-known networking textbook, teaching networks from a systems-design perspective rather than pure protocol trivia.",
      },
      {
        title: "RFC 791: Internet Protocol",
        href: "https://datatracker.ietf.org/doc/html/rfc791#section-1.2",
        description:
          "The IETF specification for Internet Protocol version 4, including its purpose, addressing model and packet format, the primary source for IP's original design.",
      },
      {
        title: "Putting the You in CPU",
        href: "https://cpu.land/",
        description:
          "Widely shared, illustrated explainer of how a program actually runs: multiprocessing, system calls, hardware interrupts, memory management and how Linux loads an executable, written for people without a CS background.",
      },
      {
        title: "Building Distributed Systems roadmap",
        href: "https://builddistributedsystem.com/roadmap",
        description:
          "Structured roadmap for learning distributed systems concepts in order, consensus, replication, partitioning and the rest, rather than picking topics at random.",
      },
      {
        title: "A tale of four fuzzers",
        href: "https://tigerbeetle.com/blog/2025-11-28-tale-of-four-fuzzers/",
        description:
          "TigerBeetle blog post comparing four different fuzzing approaches used to find bugs in their financial database, a look at how seriously they test for correctness.",
      },
      {
        title: "JGroups building blocks",
        href: "http://www.jgroups.org/blocks.html",
        description:
          "Documentation for JGroups' 'building blocks', higher-level clustering and group-communication primitives built on top of its core reliable multicast library.",
      },
      {
        title: "AO hyper parallel computer",
        href: "https://ao.arweave.net/",
        description:
          "AO is a decentralized, massively parallel compute layer built on Arweave, for running processes across a permanent, permissionless network instead of centralized cloud infrastructure.",
      },
      {
        title: "Lumen JS runtime in Rust",
        href: "https://github.com/lucid-softworks/lumen",
        description:
          "From-scratch JavaScript engine written in Rust with zero dependencies and an ARM64 JIT compiler, plus a Node-like runtime layer (event loop, filesystem, timers, web APIs) that passes the test262 conformance suite.",
      },
    ],
  },
  {
    title: "Books and fundamentals",
    links: [
      {
        title: "Crafting Interpreters",
        href: "https://craftinginterpreters.com/",
        description:
          "Robert Nystrom's beloved free book on building programming language interpreters from scratch, walking through a tree-walking interpreter and then a bytecode VM, widely considered one of the best hands-on CS books written.",
      },
      {
        title: "Software Design by Example",
        href: "https://third-bit.com/sdxjs/",
        description:
          "Greg Wilson's free book teaching software design by building small tools (a testing framework, a template engine, a version control system) from scratch in JavaScript, learning architecture by rebuilding it.",
      },
      {
        title: "Beej's Guide to Network Programming",
        href: "https://beej.us/guide/bgnet/pdf/bgnet_a4_c_1.pdf",
        description:
          "Classic, practical C guide to socket programming for TCP/IP networks, covering clients, servers, address resolution and multiplexing.",
      },
      {
        title: "Designing Data-Intensive Applications",
        href: "https://github.com/NirmalSilwal/system-design-resources/blob/master/Books/Designing%20Data%20Intensive%20Applications%20-%20Martin%20Kleppmann.pdf",
        description:
          "Martin Kleppmann's landmark book on the principles behind reliable, scalable data systems, replication, partitioning, transactions and consistency, essential reading for backend and systems engineers.",
      },
      {
        title: "Can Programming Be Liberated (Backus)",
        href: "https://worrydream.com/refs/Backus_1978_-_Can_Programming_Be_Liberated_from_the_von_Neumann_Style.pdf",
        description:
          "John Backus's 1977 Turing Award lecture arguing that imperative, von Neumann-style programming is fundamentally limiting, and proposing functional programming as an alternative, a foundational paper in PL theory.",
      },
      {
        title: "The Joy of Elixir",
        href: "https://joyofelixir.com/",
        description:
          "Friendly, beginner-focused book teaching Elixir from scratch, aimed at people with little to no prior programming experience.",
      },
      {
        title: "Build your own X",
        href: "https://github.com/codecrafters-io/build-your-own-x",
        description:
          "Massive, extremely popular curated list of tutorials for building real technology from scratch, your own Git, Docker, database, shell, regex engine and dozens more, learn by rebuilding it.",
      },
      {
        title: "System Design Primer",
        href: "https://github.com/donnemartin/system-design-primer",
        description:
          "One of the most-starred repos on GitHub, a comprehensive, organized primer on system design fundamentals for interviews and real architecture work alike.",
      },
      {
        title: "Big-O visualized",
        href: "https://samwho.dev/big-o",
        description:
          "Sam Rose's interactive, animated explainer of Big-O notation, making algorithmic complexity intuitive through visualization instead of just formulas.",
      },
      {
        title: "Announcing Neki",
        href: "https://planetscale.com/blog/announcing-neki",
        description:
          "PlanetScale's from-scratch sharded Postgres system, built by the Vitess team but not a Vitess fork, addressing Postgres's different planner and replication model instead of reusing MySQL-oriented sharding logic.",
      },
      {
        title: "What is Vitess",
        href: "https://planetscale.com/blog/what-is-vitess",
        description:
          "Explains the VTGate/VTTablet architecture: a stateless proxy layer routing queries to sharded MySQL tablets and presenting a single logical database to the application, originally built at YouTube in 2011.",
      },
    ],
  },
  {
    title: "Courses and learning paths",
    links: [
      {
        title: "Tech Interview Handbook",
        href: "https://www.techinterviewhandbook.org/software-engineering-interview-guide/",
        description:
          "Free, comprehensive guide to software engineering interviews: coding rounds, system design, behavioral questions and negotiation, widely used by candidates prepping for big-tech interviews.",
      },
      {
        title: "Frontend Masters courses",
        href: "https://frontendmasters.com/courses/",
        description:
          "Frontend Masters' full course catalog, in-depth video courses on JavaScript, frameworks, CSS and web performance taught by well-known practitioners.",
      },
      {
        title: "Frontend.fyi courses",
        href: "https://www.frontend.fyi/courses",
        description:
          "Course catalog from Frontend.fyi, practical frontend engineering courses and tutorials.",
      },
      {
        title: "Effective Software courses",
        href: "https://www.effective.software/courses",
        description:
          "Course catalog from Effective Software, focused on writing better, more maintainable software.",
      },
      {
        title: "Database School Convex course",
        href: "https://databaseschool.com/series/convex/videos/359",
        description:
          "Database School's video course specifically on Convex, the reactive backend platform, walking through its data model and real-time sync.",
      },
      {
        title: "HTML and CSS for absolute beginners",
        href: "https://www.youtube.com/playlist?list=PL4-IK0AVhVjOJs_UjdQeyEZ_cmEV3uJvx",
        description:
          "YouTube playlist teaching HTML and CSS from zero, aimed at people who have never written a line of code before.",
      },
      {
        title:
          "Digital Design and Computer Architecture (Spring 2026 livestream)",
        href: "https://www.youtube.com/playlist?list=PL5Q2soXY2Zi-yo9kK-BKrq11ykNKkVEpd",
        description:
          "Recorded livestream playlist of a Digital Design and Computer Architecture course, covering hardware fundamentals from logic gates up to processor design.",
      },
      {
        title: "Learn X in Y Minutes",
        href: "https://learnxinyminutes.com",
        description:
          "Learn a programming language's core syntax in minutes via heavily commented, runnable example code instead of a full tutorial.",
      },
      {
        title: "Flukeout: CSS Diner",
        href: "https://flukeout.github.io",
        description:
          "Game for learning CSS selectors: each level gives you a target element to select and you write the selector that hits it.",
      },
      {
        title: "Frontend Practice",
        href: "https://www.frontendpractice.com",
        description:
          "Practice site for building real UI from real designs, closing the gap between tutorials and actually implementing a design handoff.",
      },
      {
        title: "ui.dev",
        href: "https://ui.dev",
        description:
          "Frontend courses and tutorials, especially React, from the team behind the React Router and TanStack Query educational content.",
      },
      {
        title: "JavaScript30",
        href: "https://javascript30.com",
        description:
          "Wes Bos's free 30-day vanilla JavaScript coding challenge: 30 build-along tutorials with no frameworks or libraries.",
      },
      {
        title: "CSS Grid",
        href: "https://cssgrid.io",
        description:
          "Wes Bos's free 25-video course covering CSS Grid fundamentals through real-world layout examples.",
      },
      {
        title: "Beginner JavaScript",
        href: "https://beginnerjavascript.com",
        description:
          "Wes Bos's paid, exercise-heavy course teaching modern JavaScript from scratch.",
      },
      {
        title: "Command Line Power User",
        href: "https://commandlinepoweruser.com",
        description:
          "Wes Bos's free course on a modern command-line workflow: ZSH, aliases and related terminal tooling.",
      },
      {
        title: "Level Up Tutorials",
        href: "https://levelup.video",
        description:
          "Scott Tolinski's tutorial platform (founded 2012, merged into Syntax.fm in 2023), thousands of free and premium web dev video tutorials.",
      },
    ],
  },
  {
    title: "Coding challenges and practice",
    links: [
      {
        title: "Build your own load tester",
        href: "https://codingchallenges.fyi/challenges/challenge-load-tester",
        description:
          "Coding Challenges project spec for building your own HTTP load-testing tool from scratch, understanding load testing by implementing one instead of just using wrk or k6.",
      },
      {
        title: "One Billion Row Challenge",
        href: "https://1brc.dev/",
        description:
          "The viral 1BRC challenge: parse and aggregate a billion rows of temperature data as fast as possible, a popular benchmark for language and I/O performance tuning across many languages.",
      },
      {
        title: "One Trillion Row Challenge",
        href: "https://docs.coiled.io/blog/1trc.html",
        description:
          "Coiled's writeup tackling a trillion-row version of the 1BRC challenge, pushing the same problem into genuinely distributed-computing territory.",
      },
    ],
  },
  {
    title: "Developer tools and utilities",
    links: [
      {
        title: "Firecrawl",
        href: "https://www.firecrawl.dev/",
        description:
          "Popular API for turning any website into clean, LLM-ready markdown or structured data, crawling and scraping handled for you instead of hand-rolling a scraper.",
      },
      {
        title: "asccli",
        href: "https://asccli.sh/",
        description:
          "CLI tool, name suggests an App Store Connect command-line interface for automating app release tasks.",
      },
      {
        title: "Better-T Stack",
        href: "https://better-t-stack.dev/new?fe-w=next&rt=node&pm=pnpm&ex=todo",
        description:
          "Interactive scaffolding tool for a type-safe full-stack TypeScript project (frontend, backend, package manager, example app all configurable), this link opens a preconfigured Next.js/Node/pnpm/todo-app starter.",
      },
      {
        title: "Comark",
        href: "https://comark.dev/",
        description:
          "Markdown engine for the modern web: write markdown with embedded components and render it across React, Vue, Svelte or Angular from one unified parser, with plugins and streaming support built in.",
      },
      {
        title: "DevTool Lab",
        href: "https://devtoollab.com/tools",
        description:
          "Free browser-based developer utility site with 500+ tools: converters, formatters, PDF splitters, webhook testing and more, all running client-side for privacy.",
      },
      {
        title: "Digger",
        href: "https://digger.tools/",
        description:
          "Open-source CI/CD orchestrator for Terraform and OpenTofu, running plan/apply directly in your existing CI pipeline instead of a separate hosted service.",
      },
      {
        title: "Dev Resources API building",
        href: "https://devresourc.es/category/api-building",
        description:
          "Curated list of the top tools for API development, design and testing clients like Postman and Insomnia alongside backend frameworks like Appwrite and Encore.",
      },
      {
        title: "DrawDB",
        href: "https://www.drawdb.app/editor",
        description:
          "Free, open-source, browser-based entity-relationship diagram editor for designing database schemas visually and exporting to SQL.",
      },
      {
        title: "Emulate",
        href: "https://emulate.dev/",
        description:
          "Local API emulation tool providing stateful, production-fidelity stand-ins for Stripe, GitHub, Google, AWS and other services, so integrations can be tested offline without real API keys.",
      },
      {
        title: "Electrobun",
        href: "https://blackboard.sh/blog/electrobun-v1",
        description:
          "Lightweight alternative to Electron for building native desktop apps, using the OS's built-in webview instead of bundling a full Chromium runtime, for much smaller app sizes.",
      },
      {
        title: "Native SDK",
        href: "https://native-sdk.dev/introduction",
        description:
          "Framework for native desktop apps with TypeScript cores, customizable native UI, platform APIs, embedded web content and an automation-ready workflow.",
      },
      {
        title: "Graphite changelog",
        href: "https://graphite.dev/blog?category=changelog",
        description:
          "Changelog feed for Graphite, the stacked-PR code review tool, tracking new features as they ship.",
      },
      {
        title: "IT Tools",
        href: "https://it-tools.tech/",
        description:
          "Well-known, large collection of free online developer utilities (encoders, converters, generators, formatters) in one consistent, ad-free interface.",
      },
      {
        title: "Namae",
        href: "https://namae.dev/s/Blankershot",
        description:
          "Name-availability checker for developers, checking whether a project or product name is free across domains, npm, GitHub and social handles at once.",
      },
      {
        title: "nuqs",
        href: "https://www.npmjs.com/package/nuqs",
        description:
          "Type-safe search params state manager for React and Next.js: store UI state in the URL query string with a useState-like API instead of hand-parsing search params.",
      },
      {
        title: "Timezones Digital",
        href: "https://www.timezones.digital/",
        description:
          "Time zone conversion tool for figuring out what time it is elsewhere and coordinating schedules across regions.",
      },
      {
        title: "TypeDoc",
        href: "https://github.com/TypeStrong/typedoc",
        description:
          "Documentation generator that builds a full API reference site directly from TypeScript source and its type annotations, no separate doc-comment format to maintain.",
      },
      {
        title: "wterm",
        href: "https://wterm.dev/",
        description:
          "Web-based terminal emulator that renders to the real DOM, so native text selection, copy/paste, find-in-page and accessibility work for free; built on a Zig/WASM core for performance.",
      },
      {
        title: "WTF terminal dashboard",
        href: "https://wtfutil.com/",
        description:
          "Personal terminal dashboard for developers: configurable widgets (git status, todos, weather, calendars) all visible in one terminal window.",
      },
      {
        title: "xmcp",
        href: "https://xmcp.dev/docs",
        description:
          "Framework that simplifies building MCP servers, auto-registering tools, prompts and resources with no extra config, usable standalone or dropped into an existing Next.js or Express app.",
      },
      {
        title: "yt-dlp",
        href: "https://github.com/yt-dlp/yt-dlp",
        description:
          "The de facto standard command-line tool for downloading video and audio from YouTube and thousands of other sites, the actively maintained fork of youtube-dl.",
      },
      {
        title: "Mafs",
        href: "https://mafs.dev/",
        description:
          "React library for building interactive math visualizations: coordinate planes, functions and geometry that respond to user input, used for educational and explainer content.",
      },
      {
        title: "Affine",
        href: "https://affine.pro/",
        description:
          "Open-source, local-first workspace combining docs, whiteboards and databases, positioned as a privacy-respecting alternative to Notion.",
      },
      {
        title: "useSend",
        href: "https://usesend.com/",
        description:
          "Open-source transactional and marketing email platform, a self-hostable alternative to Resend or SendGrid.",
      },
      {
        title: "Documenso docs",
        href: "https://docs.documenso.com/",
        description:
          "Documentation for Documenso, the open-source DocuSign alternative, covering setup, self-hosting and API usage.",
      },
      {
        title: "listmonk",
        href: "https://listmonk.app/",
        description:
          "Self-hosted, high-performance newsletter and mailing list manager, a free alternative to Mailchimp with no subscriber-count pricing.",
      },
      {
        title: "AffiliateOtter",
        href: "https://www.affiliateotter.com/",
        description:
          "Directory of SaaS and software affiliate programs, aggregating commission rates and program details across thousands of products for people building affiliate income.",
      },
      {
        title: "OSINT4ALL",
        href: "https://start.me/p/L1rEYQ/osint4all",
        description:
          "Large curated start.me page of open-source intelligence (OSINT) tools and resources, organized by category for investigation and research work.",
      },
      {
        title: "Vercel Community",
        href: "https://community.vercel.com/",
        description:
          "Official Vercel community forum for questions, discussion and troubleshooting around Vercel and Next.js deployments.",
      },
      {
        title: "Hucre spreadsheet",
        href: "https://github.com/productdevbook/hucre",
        description:
          "Zero-dependency TypeScript spreadsheet engine reading and writing XLSX, CSV, ODS, JSON, NDJSON and XML with schema validation, streaming and round-trip preservation, works in any JS runtime including the browser and Cloudflare Workers.",
      },
      {
        title: "Unlighthouse",
        href: "https://unlighthouse.dev/",
        description:
          "Runs Google Lighthouse across an entire site automatically (not just one page), crawling every route and generating a site-wide performance/SEO/accessibility report.",
      },
      {
        title: "OSS Perks",
        href: "https://www.ossperks.com/",
        description:
          "Curated directory consolidating free credits, tools and infrastructure sponsorships available to open-source maintainers, 53 programs and 158 perks in one place.",
      },
      {
        title: "Vercel Doctor",
        href: "https://www.vercel-doctor.com/",
        description:
          "Scans a Next.js codebase for costly patterns (caching, dead code, function duration, images, invocations) and generates a health score aimed at reducing your Vercel bill.",
      },
      {
        title: "visual-diff",
        href: "https://github.com/acoyfellow/visual-diff",
        description:
          "Visual comparison tool that checks whether two rendered UIs are truly identical across three independent checks: DOM structure, computed styles and pixel-level diff, all three must pass for a match, catching what any single check alone would miss.",
      },
      {
        title: "Playbit",
        href: "https://playbit.app",
        description:
          "Platform for building 'joyful personal-scale software' once and running it across desktop, web and mobile without a full rebuild. Its runtime acts like a minimal OS kernel, adding sandboxing and collaborative features that don't fit well in a plain browser tab.",
      },
      {
        title: "TUI Studio",
        href: "https://tui.studio",
        description:
          "Figma-like visual editor for designing terminal UIs with drag-and-drop components, targeting code export to frameworks like Ink, BubbleTea, Blessed and Textual (in alpha).",
      },
      {
        title: "Graphify",
        href: "https://graphifylabs.ai",
        description:
          "Open-source tool that converts a codebase into a knowledge graph AI coding assistants can query, returning explicit graph paths with real file:line citations instead of vague embedding matches. Runs entirely on-device, no account or API key needed.",
      },
      {
        title: "Pencil",
        href: "https://www.pencil.dev",
        description:
          "Design tool built around the pitch 'design on canvas, land in code': designs made on a visual canvas translate directly into working code rather than static mockups.",
      },
      {
        title: "Paper",
        href: "https://paper.design",
        description:
          "Infinite canvas design tool for teams, positioned between a whiteboard and a full design app for collaborative visual work.",
      },
      {
        title: "design.dev",
        href: "https://design.dev",
        description:
          "Resource hub of code generators, cheat sheets and AI-powered tools for generating design systems and config files, plus a weekly front-end tools newsletter.",
      },
      {
        title: "nubjs",
        href: "https://nubjs.com",
        description:
          "All-in-one Node.js toolkit shipped as a single Rust binary: runs TypeScript directly, manages packages and Node versions, replacing tsx, npm, pnpm and nvm with faster equivalents while staying compatible with the existing ecosystem.",
      },
      {
        title: "Name That UI",
        href: "https://namethatui.com",
        description:
          "Visual reference for identifying the standard name of an interface element so it is easier to search for, discuss and implement.",
      },
      {
        title: "OpenTUI",
        href: "https://opentui.com",
        description:
          "Framework for building rich terminal interfaces with TypeScript, giving terminal apps a component model closer to modern web frameworks.",
      },
      {
        title: "Fallow Tools docs",
        href: "https://docs.fallow.tools",
        description:
          "Documentation site for the Fallow developer tools suite, covering setup, integrations and usage.",
      },
      {
        title: "SurveyJS library",
        href: "https://github.com/surveyjs/survey-library",
        description:
          "Open-source JavaScript survey and form builder, for embedding complex, logic-driven forms directly in your own app.",
      },
      {
        title: "ties (raffomania)",
        href: "https://github.com/raffomania/ties",
        description:
          "CLI tool for managing symlinked dotfiles, keeping your config files in one repo and symlinked into place across machines.",
      },
      {
        title: "html2rss",
        href: "https://github.com/html2rss/html2rss",
        description:
          "Turns any webpage into an RSS feed by scraping its structure, useful for sites that don't publish a feed of their own.",
      },
      {
        title: "ToolmateX",
        href: "https://toolmatex.com",
        description:
          "Collection of free, ad-free browser utilities for developers, designers and data people: code formatting, color conversion, text manipulation and security tools, most working fully offline.",
      },
      {
        title: "JSON for You",
        href: "https://json4u.com",
        description:
          "JSON formatter, viewer and validator for cleaning up and inspecting JSON payloads.",
      },
      {
        title: "GitInspect",
        href: "https://www.gitinspect.com",
        description:
          "Visualizes and inspects Git repository history for understanding how a codebase evolved over time.",
      },
      {
        title: "opensrc (Vercel Labs)",
        href: "https://github.com/vercel-labs/opensrc",
        description:
          "Vercel Labs experiment for open-source contribution tooling, exploring ways to make it easier to find and ship OSS contributions.",
      },
      {
        title: "almostnode",
        href: "https://almostnode.dev",
        description:
          "Runs Node.js, Next.js, Vite and Express entirely in the browser with no backend server, using a virtual filesystem and shimmed Node modules, useful for interactive demos and playgrounds.",
      },
      {
        title: "Ultracite",
        href: "https://www.ultracite.ai",
        description:
          "Zero-config Biome preset for linting and formatting, drop it in and get a sensible, opinionated ruleset without hand-tuning config.",
      },
      {
        title: "gists.sh",
        href: "https://gists.sh",
        description:
          "Cleaner viewer for GitHub Gists: swap 'gist.github.com' for 'gists.sh' in any Gist URL to get a minimal, formatted view with dark mode and display options.",
      },
      {
        title: "itty.dev",
        href: "https://itty.dev",
        description:
          "Family of ultra-small web dev libraries (itty-router, itty-fetcher, itty-time) optimized to run in a few hundred bytes each, built for serverless and edge environments where bundle size directly affects cost.",
      },
      {
        title: "Diffs",
        href: "https://diffs.com",
        description:
          "Tool for comparing and sharing text and code diffs via a link.",
      },
      {
        title: "RSSHub docs",
        href: "https://docs.rsshub.app",
        description:
          "Documentation for RSSHub, the open-source project that generates RSS feeds from almost any site, even ones that don't publish one natively.",
      },
      {
        title: "Web Check",
        href: "https://web-check.xyz",
        description:
          "Runs a full OSINT and security check on any website: DNS records, headers, certificates, hosting and more, in one report.",
      },
      {
        title: "Visual JSON",
        href: "https://visual-json.dev",
        description:
          "Interactive JSON editor with tree and raw views for reading and editing files like package.json without hand-editing brackets and commas.",
      },
      {
        title: "Portless",
        href: "https://portless.sh",
        description:
          "Replaces localhost port numbers with stable, named .localhost URLs for local dev, with HTTPS and HTTP/2 on by default via a reverse proxy.",
      },
      {
        title: "shadcn CLI v4",
        href: "https://ui.shadcn.com/docs/changelog/2026-03-cli-v4",
        description:
          "shadcn init now scaffolds full project templates (Next.js, Vite, Laravel, React Router, Astro, TanStack Start) plus shadcn/skills and presets, not just individual components.",
      },
      {
        title: "shadcn registry include and validate",
        href: "https://ui.shadcn.com/docs/changelog/2026-05-registry-include",
        description:
          "Lets registry authors split a large registry.json across files and validate a source registry before publishing, directly relevant to maintaining a shadcn-based component registry.",
      },
      {
        title: "Create v1",
        href: "https://github.com/midday-ai/v1",
        description:
          "Open-source production SaaS starter by Pontus Abrahamsson's Midday team: Next.js, Turborepo, Supabase and shadcn/ui, with i18n, email, analytics and background jobs pre-wired.",
      },
      {
        title: "create-t3-app",
        href: "https://create.t3.gg",
        description:
          "CLI maintained by Theo Browne and collaborators that scaffolds a typesafe Next.js app combining tRPC, Tailwind CSS, Auth.js and a choice of Prisma or Drizzle for the ORM.",
      },
      {
        title: "Varlock",
        href: "https://varlock.dev",
        description:
          "Schema-first environment variable and secrets manager: a committable .env.schema defines types, validation and defaults, and the CLI resolves real values while redacting secrets from logs.",
      },
      {
        title: "uv",
        href: "https://docs.astral.sh/uv/",
        description:
          "Rust-built Python package and project manager from Astral that replaces pip, poetry, pyenv and virtualenv with one tool, with a lockfile and built-in Python version management.",
      },
      {
        title: "ty",
        href: "https://docs.astral.sh/ty/",
        description:
          "Astral's Rust-based Python type checker and language server, positioned as a much faster alternative to mypy and Pyright.",
      },
      {
        title: "Wrangler",
        href: "https://developers.cloudflare.com/workers/wrangler/",
        description:
          "Cloudflare's primary CLI for developing and deploying Workers, D1, Containers and Queues.",
      },
      {
        title: "Answer Overflow",
        href: "https://www.answeroverflow.com",
        description:
          "Turns Discord thread content into indexable, searchable web pages, used by communities like Cloudflare, Nuxt and Valorant to make help-channel answers findable via search engines.",
      },
      {
        title: "Shiptalkers",
        href: "https://shiptalkers.dev",
        description:
          "Pulls GitHub and social activity into a ranked comparison of how much people actually ship versus how much they post about shipping, by Rhys Sullivan.",
      },
      {
        title: "UnoCSS",
        href: "https://github.com/unocss/unocss",
        description:
          "Atomic CSS engine by Anthony Fu with no core utilities of its own, generating classes on demand through presets like Wind4 and Mini.",
      },
      {
        title: "Vitest",
        href: "https://github.com/vitest-dev/vitest",
        description:
          "Vite-native test runner with a Jest-compatible API, in-source testing and a real browser mode.",
      },
      {
        title: "tsdown",
        href: "https://github.com/rolldown/tsdown",
        description:
          "TypeScript library bundler built on Rolldown, the Rust bundler from the former VoidZero, positioned as a faster tsup replacement.",
      },
      {
        title: "taze",
        href: "https://github.com/antfu-collective/taze",
        description:
          "CLI by Anthony Fu that checks and bumps package.json dependency versions with a mode-based range filter (major, minor, patch) in an interactive terminal UI.",
      },
      {
        title: "ni",
        href: "https://github.com/antfu-collective/ni",
        description:
          "Package-manager-agnostic CLI (ni, nr, nun, nlx) that detects a repo's lockfile and dispatches to npm, yarn, pnpm or bun automatically.",
      },
      {
        title: "vite-plugin-inspect",
        href: "https://github.com/antfu-collective/vite-plugin-inspect",
        description:
          "Vite plugin that exposes an inspector UI showing each intermediate transform step a module goes through across the full plugin pipeline.",
      },
      {
        title: "Nuxt DevTools",
        href: "https://github.com/nuxt/devtools",
        description:
          "In-browser devtools overlay for Nuxt apps showing pages, components, composables, server routes and the Vite module graph.",
      },
      {
        title: "UnJS",
        href: "https://unjs.io",
        description:
          "Umbrella org for framework-agnostic JS utilities extracted from Nuxt (h3, ofetch, unbuild, unstorage and others), each independently usable outside Nuxt or Vue.",
      },
      {
        title: "h3",
        href: "https://github.com/unjs/h3",
        description:
          "Minimal, composable HTTP server framework from UnJS that runs on Node, Deno, Bun and edge runtimes, and serves as Nitro's request layer.",
      },
      {
        title: "unstorage",
        href: "https://github.com/unjs/unstorage",
        description:
          "Async key-value storage API with one interface across 20+ drivers (filesystem, Redis, S3, Cloudflare KV, memory), mountable per-namespace and swappable without code changes.",
      },
      {
        title: "Nuxt Studio",
        href: "https://content.nuxt.com",
        description:
          "Free, open-source, self-hostable visual editing module for Nuxt Content sites that edits content directly on the production site.",
      },
      {
        title: "page-speed.dev",
        href: "https://page-speed.dev",
        description:
          "Daniel Roe's tool for capturing and sharing Core Web Vitals and PageSpeed Insights results as shareable links.",
      },
      {
        title: "vitess-operator",
        href: "https://github.com/planetscale/vitess-operator",
        description:
          "Kubernetes Operator for deploying and managing Vitess clusters declaratively, PlanetScale's primary open-source infrastructure tool outside the core Vitess project.",
      },
      {
        title: "Cobalt2 Theme",
        href: "https://github.com/wesbos/cobalt2-vscode",
        description:
          "Wes Bos's VS Code, Sublime and iTerm color theme, one of the most-installed themes on the VS Code marketplace.",
      },
      {
        title: "Syntax Snackpack",
        href: "https://syntax.fm/snackpack",
        description:
          "Syntax.fm's own newsletter, separate from Bytes, for tips, tricks and swag drops distinct from the podcast episode feed.",
      },
      {
        title: "Expo Atlas",
        href: "https://github.com/expo/atlas",
        description:
          "Module-level Metro bundle visualizer that walks Metro's dependency graph to show per-module size and Babel transform output for bundle-size debugging.",
      },
      {
        title: "Expo Orbit",
        href: "https://github.com/expo/orbit",
        description:
          "Open-source menu-bar app (React Native and Electron) for one-click install and launch of EAS builds, local .apk/.app files or Snack projects onto simulators and emulators.",
      },
      {
        title: "React Native Worklets",
        href: "https://docs.swmansion.com/react-native-worklets/",
        description:
          "Standalone multithreading engine, split out of Reanimated, that lets libraries run JS functions synchronously on separate threads via a shared worklet runtime.",
      },
    ],
  },
  {
    title: "Productivity and business tools",
    links: [
      {
        title: "getprojekt",
        href: "https://www.getprojekt.com",
        description:
          "Design-engineered project management tool ('Design Engineered' is its own tagline), aimed at freelancers and small teams.",
      },
      {
        title: "Galaxybrain",
        href: "https://galaxybrain.com",
        description:
          "Local-first information management tool combining document writing with spreadsheet-style calculations, a 'digital brain' for organizing files entirely on your desktop with no account or cloud storage required.",
      },
      {
        title: "Invoice Builder",
        href: "https://github.com/piratuks/invoice-builder",
        description:
          "Open-source invoice generator for creating and exporting invoices without a paid SaaS subscription.",
      },
      {
        title: "Gmail Cleaner",
        href: "https://gururagavendra.github.io/gmail-cleaner",
        description:
          "Browser tool for bulk-cleaning a Gmail inbox, finding and clearing out clutter faster than Gmail's own search-and-delete flow.",
      },
      {
        title: "Kanba",
        href: "https://www.kanba.co",
        description:
          "Free, open-source Kanban-style project management app for teams tracking and collaborating on work transparently.",
      },
      {
        title: "RxResume",
        href: "https://rxresu.me",
        description:
          "Free, open-source resume builder with a live preview editor and multiple export formats, an alternative to paid resume-builder SaaS.",
      },
      {
        title: "Invoicely",
        href: "https://invoicely.gg",
        description:
          "Simple online invoicing tool for creating and sending invoices without heavier accounting software.",
      },
      {
        title: "Remote Storage",
        href: "https://remote.storage",
        description:
          "Open protocol (remoteStorage) for per-user, per-app data storage that the user controls, letting apps read and write to a storage location the person owns rather than the app vendor.",
      },
      {
        title: "Domain Locker",
        href: "https://domain-locker.com",
        description:
          "Dashboard for tracking every domain you own across registrars in one place, with monitoring, renewal alerts, and security and performance insights.",
      },
      {
        title: "Domain SDK",
        href: "https://www.domain-sdk.dev",
        description:
          "TypeScript library for managing custom domains in a SaaS app: one API to add, verify, monitor and remove customer domains across hosting platforms like Vercel, Cloudflare and Railway, with honest status reporting on DNS routing, ownership and TLS certificates.",
      },
      {
        title: "Resume Matcher",
        href: "https://resumematcher.fyi",
        description:
          "Matches your resume against a specific job description using AI, highlighting gaps and keyword mismatches before you apply.",
      },
    ],
  },
  {
    title: "File sharing and conversion tools",
    links: [
      {
        title: "FileMock",
        href: "https://filemock.com",
        description:
          "Free, browser-based tool for generating test files (video, audio, image, document) in multiple formats with precise size control, for testing uploads, APIs, storage and media pipelines. Generation happens entirely client-side, nothing leaves the browser.",
      },
      {
        title: "convert (p2r3)",
        href: "https://github.com/p2r3/convert",
        description:
          "Simple command-line file conversion tool for quickly switching between common file formats.",
      },
      {
        title: "Transfer.zip",
        href: "https://transfer.zip",
        description:
          "Send large files via a link without creating an account, an alternative to WeTransfer for quick one-off transfers.",
      },
      {
        title: "PNG to ICO",
        href: "https://png-to-ico.com",
        description:
          "Converts PNG images into ICO favicons directly in the browser.",
      },
      {
        title: "Image Compress",
        href: "https://imgcompress.karimzouine.com",
        description:
          "Free browser-based image compressor for shrinking file size before upload.",
      },
      {
        title: "One Time Secret",
        href: "https://onetimesecret.com",
        description:
          "Share a password or secret via a link that self-destructs after being viewed once, so it never sits readable in chat history.",
      },
      {
        title: "Oneshot.zip",
        href: "https://oneshot.zip",
        description:
          "One-off file sharing tool for sending a file via a single-use link.",
      },
      {
        title: "Table Format Converter",
        href: "https://www.tableformatconverter.com",
        description:
          "Free tool for converting tabular data between CSV, HTML, JSON, Markdown and more, running fully client-side so data never leaves your browser.",
      },
      {
        title: "Bento PDF",
        href: "https://bentopdf.com",
        description:
          "Free set of browser-based PDF editing tools: merge, split, compress and edit PDFs without uploading to a paid service.",
      },
      {
        title: "8mb",
        href: "https://8mb.campuscal.tech",
        description:
          "File compressor built specifically for squeezing files under Discord's 8MB upload limit.",
      },
      {
        title: "Online-Convert",
        href: "https://www.online-convert.com",
        description:
          "Free online file format converter supporting a wide range of document, image, audio and video formats.",
      },
    ],
  },
  {
    title: "ASCII art and diagram tools",
    links: [
      {
        title: "Text Paint",
        href: "https://textpaint.com",
        description:
          "Draw pixel art directly using text characters, exportable as plain text or copy-pasted ASCII art.",
      },
      {
        title: "Video to ASCII (ezascii)",
        href: "https://ezascii.com/video-to-ascii",
        description:
          "Converts an uploaded video into playable ASCII art, frame by frame.",
      },
      {
        title: "ASCII Art Club",
        href: "https://asciiart.club",
        description:
          "Community gallery of user-submitted ASCII art for browsing and sharing.",
      },
      {
        title: "Video to ASCII (Melobytes)",
        href: "https://melobytes.com/en/app/video2ascii",
        description:
          "Another video-to-ASCII converter, turning uploaded clips into ASCII animation.",
      },
      {
        title: "Text Diagram",
        href: "https://weidagang.github.io/text-diagram",
        description:
          "Draws boxes-and-arrows diagrams from plain text descriptions, ASCII-art style output for docs and READMEs.",
      },
      {
        title: "Graph::Easy online",
        href: "https://graph-easy.online",
        description:
          "Browser version of the Perl Graph::Easy tool: describe a graph in simple text syntax and render it as an ASCII or boxed diagram.",
      },
      {
        title: "Wiretext",
        href: "https://wiretext.app",
        description:
          "Text-based wireframing tool: sketch the simplest possible wireframe using Unicode UI shapes and keyboard shortcuts, then export it as plain text or markdown for sharing.",
      },
      {
        title: "nomnoml",
        href: "https://nomnoml.com",
        description:
          "Draws UML diagrams from a simple text syntax, type a description and get a rendered class/sequence diagram.",
      },
      {
        title: "Monosketch",
        href: "https://monosketch.io",
        description:
          "Draw ASCII and box diagrams directly in the browser with a proper drag-and-drop editor instead of hand-typing characters.",
      },
    ],
  },
  {
    title: "Marketing and growth tools",
    links: [
      {
        title: "Seolo blog",
        href: "https://www.seolo.live/blogs",
        description:
          "SEO blog covering technical SEO, JavaScript SEO, crawling and indexing, and AI-driven search strategy, practical tutorials over generic advice.",
      },
      {
        title: "WinWinKit",
        href: "https://winwinkit.com",
        description:
          "Marketing platform for app developers to run affiliate campaigns, referral programs and promo codes, handling tracking, rewards and payouts across iOS, Android and desktop.",
      },
      {
        title: "EmailMD",
        href: "https://www.emailmd.dev",
        description:
          "Write responsive HTML emails using Markdown syntax instead of hand-coding table-based HTML, with an AI-assisted MCP integration for writing, linting and previewing emails live.",
      },
      {
        title: "Autosend",
        href: "https://autosend.com",
        description:
          "Automated email sending platform for scheduling and delivering transactional or campaign email.",
      },
      {
        title: "Unosend",
        href: "https://www.unosend.co",
        description:
          "Transactional email sending service for delivering app-generated emails like receipts and password resets.",
      },
      {
        title: "Typefully",
        href: "https://typefully.com",
        description:
          "Twitter/X thread writing and scheduling tool with a distraction-free composer built specifically for threads rather than single posts.",
      },
    ],
  },
  {
    title: "Effect ecosystem",
    links: [
      {
        title: "Visual Effect playground",
        href: "https://effect.kitlangton.com/",
        description:
          "Kit Langton's interactive visual playground for the Effect TypeScript library, watch effects, fibers and concurrency execute step by step instead of reading about it abstractly.",
      },
      {
        title: "Effect",
        href: "https://effect-ts.github.io/effect/",
        description:
          "Official docs for Effect, the TypeScript library for building robust, type-safe applications with structured concurrency, error handling and dependency injection built into the type system.",
      },
      {
        title: "Effect blog and v4 beta updates",
        href: "https://effect.website/blog",
        description:
          "Official Effect release notes and weekly engineering updates. This is the primary source for the Effect 4 beta runtime rewrite, consolidated packages, new Context.Service model, unstable modules and ongoing breaking API changes.",
      },
      {
        title: "Effect v3 to v4 migration guide",
        href: "https://github.com/Effect-TS/effect-smol/blob/main/MIGRATION.md",
        description:
          "Official migration index for Effect 4 beta, covering renamed and removed APIs across services, errors, schemas, layers, HTTP, streams, schedules and the rest of the rewritten runtime.",
      },
      {
        title: "use-effect-ts",
        href: "https://github.com/pkishorez/use-effect-ts",
        description:
          "Kishore's React hooks for running Effect programs with component scopes, latest-run cancellation, queues and live refs. The repository predates Effect 4, so use it for React integration ideas and verify APIs against the v4 migration guide.",
      },
      {
        title: "Dillon Mulroy's Effect guide",
        href: "https://github.com/dmmulroy/effect.guide",
        description:
          "Large module-by-module collection of practical Effect guides, testing notes and examples. The author marks it as generated, work in progress and not yet type-checked, so treat it as a discovery index rather than a source of current v4 truth.",
      },
      {
        title: "Dillon Mulroy's Effect Cloudflare experiment",
        href: "https://github.com/dmmulroy/effect-cloudflare",
        description:
          "Experimental wrappers for Cloudflare KV, D1, R2 and Worker runtime bindings using Effect services. It currently targets Effect 3, but is useful prior art for keeping Cloudflare capabilities behind typed service boundaries.",
      },
      {
        title: "alchemy-effect",
        href: "https://github.com/dmmulroy/alchemy-effect",
        description:
          "Dillon Mulroy's experimental Infrastructure-as-Effects project for type-checked infrastructure bindings, deployment plans and testable business logic. The project explicitly warns that it is not production-ready yet.",
      },
      {
        title: "better-result",
        href: "https://github.com/dmmulroy/better-result",
        description:
          "Lightweight Result type for TypeScript with tagged errors, pattern matching and generator-based composition. A useful smaller alternative to compare when a full Effect runtime, services and structured concurrency would be unnecessary.",
      },
      {
        title: "Effect runtime visualizer",
        href: "https://effect-viz.vercel.app/",
        description:
          "Visualizer for how Effect's runtime schedules and executes fibers, for building intuition about Effect's concurrency model.",
      },
      {
        title: "Effect Solutions",
        href: "https://www.effect.solutions/",
        description:
          "Consulting/resource site focused on helping teams adopt and use the Effect TypeScript library well.",
      },
      {
        title: "Effect to JS examples",
        href: "https://github.com/bmdavis419/effect-to-js-ex",
        description:
          "Repository of side-by-side examples translating Effect code to plain JavaScript/TypeScript equivalents, for understanding what Effect is actually doing under its abstractions.",
      },
      {
        title: "Effect API example",
        href: "https://github.com/TeamWarp/effect-api-example/blob/main/packages/typescript-config/base.json",
        description:
          "Example repository showing how to structure an API built with Effect, this link points at its shared TypeScript config.",
      },
      {
        title: "Effect client wrapper skill",
        href: "https://skills.sh/rhyssullivan/effect-client-wrapper-skill/effect-client-wrapper",
        description:
          "Claude Code agent skill for generating Effect-based API client wrappers following established Effect patterns.",
      },
    ],
  },
  {
    title: "Docs, slides and content tools",
    links: [
      {
        title: "Tahta for Slidev",
        href: "https://tahta.cagdas.io/",
        description:
          "Theme/toolkit for Slidev (the developer-focused, markdown-based slide framework), for building more polished presentation decks.",
      },
      {
        title: "Reveal.js",
        href: "https://revealjs.com/#/20",
        description:
          "Long-running, widely used open-source HTML presentation framework, build slide decks in markdown/HTML with built-in transitions, themes and speaker notes.",
      },
      {
        title: "Slidev",
        href: "https://sli.dev/",
        description:
          "Developer-focused slide deck framework built on markdown and Vue, write slides in a text file, get syntax highlighting, live coding blocks and full styling control.",
      },
      {
        title: "Quarkdown",
        href: "https://quarkdown.com",
        description:
          "Markdown superset that compiles into fully styled documents, books and slide decks, adding layout and theming on top of plain markdown syntax.",
      },
      {
        title: "getdesign.md",
        href: "https://getdesign.md",
        description:
          "Turns a markdown file into a polished, styled design document, useful for spec docs and design write-ups that shouldn't look like plain markdown.",
      },
      {
        title: "docmd",
        href: "https://docmd.io",
        description:
          "Turns a markdown source into a full documentation site, similar in spirit to Docusaurus but lighter weight.",
      },
      {
        title: "Accept Markdown",
        href: "https://acceptmarkdown.com",
        description:
          "Renders a markdown document as a clean, shareable web page without needing a full static site setup.",
      },
    ],
  },
  {
    title: "Personal blogs and sites",
    links: [
      {
        title: "Joel on Software",
        href: "https://www.joelonsoftware.com/",
        description:
          "Joel Spolsky's legendary software engineering blog (Fog Creek/Trello/Stack Overflow co-founder), essays like 'The Joel Test' and 'Leaky Abstractions' that shaped a generation of engineering management thinking.",
      },
      {
        title: "Making Software",
        href: "https://www.makingsoftware.com/",
        description:
          "Site/blog exploring how software actually gets made, the craft and process behind building it.",
      },
      {
        title: "Effective Software",
        href: "https://www.effective.software/",
        description:
          "Site publishing essays and courses on writing effective, maintainable software.",
      },
      {
        title: "I Hate Reading",
        href: "https://ihatereading.in/",
        description:
          "Developer blog distilling technical topics into short, digestible reads for people who'd rather skim than study a whole book.",
      },
      {
        title: "Evan Bacon",
        href: "https://evanbacon.dev/",
        description:
          "Blog of Evan Bacon, a core Expo/React Native engineer, writing about React Native internals, Expo Router and the mobile web platform.",
      },
      {
        title: "TK",
        href: "https://www.iamtk.co/",
        description:
          "Site of TK Kinoshita, a software engineer and researcher writing on mathematics, machine learning and software engineering, with deep technical pieces on deep learning, web performance and programming language theory.",
      },
      {
        title: "Jacob Paris",
        href: "https://www.jacobparis.com/content",
        description:
          "Blog of web developer Jacob Paris, tutorials and guides on React, Remix and TypeScript for building performant full-stack apps.",
      },
      {
        title: "Marvin Hagemeister",
        href: "https://marvinh.dev/",
        description:
          "Blog of Marvin Hagemeister, a core contributor to Preact (the 3kB React alternative used at Shopify and others), writing on JS tooling and frontend performance.",
      },
      {
        title: "mcyoung",
        href: "https://mcyoung.xyz/",
        description:
          "Blog covering low-level systems topics: compilers, language design and the kind of deep technical writing that goes past the surface of how languages actually work.",
      },
      {
        title: "Chris Lattner",
        href: "https://nondot.org/sabre/",
        description:
          "Personal site of Chris Lattner, creator of LLVM, Clang, Swift and Mojo, one of the most influential compiler engineers working today.",
      },
      {
        title: "Jordan Scales",
        href: "https://notes.jordanscales.com/",
        description:
          "Personal notes site with posts spanning programming concepts, career reflections and creative projects, drawn from notes the author keeps in Notion.",
      },
      {
        title: "pixperk",
        href: "https://www.pixperk.tech/blog",
        description:
          "Blog focused on deep technical explanations of backend systems: distributed databases, storage optimization, concurrency and system design, explained in plain language for practitioners.",
      },
      {
        title: "Zoltan Kochan",
        href: "https://www.kochan.io/",
        description:
          "Blog of Zoltán Kochan, creator and lead maintainer of pnpm, writing about package management internals and JavaScript tooling.",
      },
      {
        title: "Site Mini thoughts",
        href: "https://site-mini.vercel.app/thoughts",
        description:
          "Personal essay collection by Aiden Bai (creator of million.js/Million Lint), short pieces on research experiences and web dev technologies.",
      },
      {
        title: "Eli Rousso",
        href: "https://www.elirousso.com/",
        description:
          "Portfolio of Eli Rousso, a NYC-based product designer and developer offering one-week sprints, zero-to-one product builds, and ongoing design partnerships for founders.",
      },
    ],
  },
  {
    title: "Developer profiles and socials",
    links: [
      {
        title: "Cassidoo",
        href: "https://github.com/cassidoo",
        description:
          "GitHub of Cassidy Williams, a well-known developer educator and newsletter writer (previously at Netlify and GitHub) with a large following for practical, funny dev content.",
      },
      {
        title: "mrncstt",
        href: "https://github.com/mrncstt",
        description:
          "GitHub of Mariana Costa, a data engineer specializing in PySpark, Databricks and cloud infrastructure, sharing data-literacy learning resources.",
      },
      {
        title: "cosmeratech",
        href: "https://github.com/cosmeratech",
        description:
          "GitHub of a self-taught developer and AI researcher from India focused on C++ and Python machine learning work.",
      },
      {
        title: "Abhi on X",
        href: "https://x.com/abh1a0/status/1993033150323392720",
        description:
          "A specific X (Twitter) post from developer Abhi worth referencing.",
      },
      {
        title: "Srajan on X",
        href: "https://x.com/_Creation22/status/2027378310779752857",
        description:
          "Specific X post by Srajan (@_Creation22), retained as a focused design and technical reference.",
      },
      {
        title: "iximiuz on X",
        href: "https://x.com/iximiuz",
        description:
          "X account of Ivan Velichko (iximiuz), a well-known educator on containers, Linux internals and how the container runtime stack actually works under the hood.",
      },
      {
        title: "Anthony Fu",
        href: "https://github.com/antfu",
        description:
          "GitHub of Anthony Fu, extremely prolific open-source maintainer behind Vitest, UnoCSS, Slidev, VueUse and much of the Vite plugin ecosystem.",
      },
      {
        title: "Daniel Roe",
        href: "https://roe.dev",
        description:
          "Site of Daniel Roe, Nuxt core team member and maintainer of fontaine, beasties, magic-regexp and page-speed.dev.",
      },
      {
        title: "Aiden Bai on X: CN search",
        href: "https://x.com/search?q=from%3Aaidenybai%20cn&src=typed_query",
        description:
          "Saved X search for posts by Aiden Bai matching “cn”, useful for revisiting that focused thread of his work and commentary.",
      },
      {
        title: "Sebastien Chopin",
        href: "https://atinux.com",
        description:
          "Site of Sebastien Chopin (atinux), co-creator of Nuxt.js.",
      },
    ],
  },
  {
    title: "Engineering essays and culture",
    links: [
      {
        title: "Three ways to solve problems",
        href: "https://andreasfragner.com/writing/three-ways-to-solve-problems",
        description:
          "Argues every problem has three possible responses: push toward the outcome you want, reinterpret the situation, or change what you want, and that the latter two are underused, especially in resource-constrained environments like startups.",
      },
      {
        title: "The campfire no agent can replicate",
        href: "https://connect.mux.com/the-campfire-no-agent-can-replicate",
        description:
          "Argues that despite AI automating more of the work itself, in-person developer gatherings remain irreplaceable, the spontaneous conversation and community that only happens when people actually show up together.",
      },
      {
        title: "Dark Matter Developers",
        href: "https://www.hanselman.com/blog/dark-matter-developers-the-unseen-99",
        description:
          "Scott Hanselman's well-known essay on 'dark matter developers', the vast majority who never blog, tweet or speak at conferences, and why the loud minority isn't representative of the field.",
      },
      {
        title: "Building another blog engine",
        href: "https://jt.lol/posts/building-another-blog-engine",
        description:
          "Jamie Turner's writeup on building a blog engine with Convex and TanStack, generating the UI with v0, wiring the backend with Cursor, and building a markdown editor for drafting posts.",
      },
      {
        title: "The end of productivity theater",
        href: "https://muratbuffalo.blogspot.com/2026/02/end-of-productivity-theater.html",
        description:
          "Murat Demirbas's essay on 'productivity theater', looking busy versus actually shipping, and how AI tooling is exposing the difference more starkly.",
      },
      {
        title: "How to be 10x more productive",
        href: "https://newsletter.techworld-with-milan.com/p/how-to-be-10x-more-productive",
        description:
          "Newsletter piece on practical habits and systems for meaningfully increasing engineering output, not just working longer hours.",
      },
      {
        title: "The making of a JPEG",
        href: "https://www.sophielwang.com/blog/jpeg",
        description:
          "Explainer on how JPEG compression actually works: color space conversion, discrete cosine transform and quantization, the pipeline that turns a photo into a small file.",
      },
      {
        title: "How Margaret Hamilton landed NASA on the moon",
        href: "https://allthatsinteresting.com/margaret-hamilton",
        description:
          "The well-known story of Margaret Hamilton, who led the software team for the Apollo program's guidance computer and whose error-handling code saved the Apollo 11 landing.",
      },
      {
        title: "Bytes newsletter",
        href: "https://bytes.dev",
        description:
          "Twice-weekly JavaScript news newsletter from the Syntax.fm crew, summarizing what happened in the JS ecosystem with a conversational, funny tone.",
      },
      {
        title: "The Turbopack vision",
        href: "https://vercel.com/blog/the-turbopack-vision",
        description:
          "Architecture and rationale piece on Turbopack, the Rust bundler built to replace webpack, Babel and Terser in the Next.js toolchain.",
      },
      {
        title: "Building an MCP server for Nuxt",
        href: "https://nuxt.com/blog/building-nuxt-mcp",
        description:
          "Nuxt team's technical writeup on exposing Nuxt's docs to AI assistants via a structured MCP server with composable tools.",
      },
      {
        title: "Introducing the Nuxt Agent",
        href: "https://nuxt.com/blog/introducing-nuxt-agent",
        description:
          "Nuxt team's post on Nuxi, an in-docs AI assistant grounded in official documentation, built with the AI SDK and Nuxt UI components.",
      },
      {
        title: "New performance panel in React Native 0.83",
        href: "https://swmansion.com/blog/react-native-debugging-new-performance-panel-in-react-native-0-83-21ca90871f6d/",
        description:
          "Software Mansion post detailing the in-app performance-trace recording panel they built into React Native DevTools for measuring runtime performance without Flipper.",
      },
      {
        title: "Out with the old, in with the New Architecture",
        href: "https://expo.dev/blog/out-with-the-old-in-with-the-new-architecture",
        description:
          "Expo engineering post on the SDK 53 default-on switch to Fabric, TurboModules and JSI replacing the legacy bridge, plus the interop layer keeping old-architecture libraries working unmodified.",
      },
    ],
  },
  {
    title: "YouTube channels",
    links: [
      {
        title: "CodeTV",
        href: "https://www.youtube.com/@codetv-dev/videos",
        description:
          "Developer-focused video channel/network (from the founders of egghead.io) publishing interviews, talks and shows about the craft and culture of software engineering.",
      },
      {
        title: "Deep Learning with Yacine",
        href: "https://www.youtube.com/@deeplearningexplained",
        description:
          "YouTube channel explaining deep learning and AI concepts in an accessible way.",
      },
      {
        title: "Developer Voices",
        href: "https://www.youtube.com/@DeveloperVoices",
        description:
          "Kris Jenkins's long-form interview podcast/channel talking to engineers about programming languages, databases and systems, known for going deep rather than staying surface-level.",
      },
      {
        title: "Learn That Stack",
        href: "https://www.youtube.com/@LearnThatStack",
        description:
          "YouTube channel teaching specific tech stacks end to end, tutorial-style walkthroughs of building real projects.",
      },
      {
        title: "Performance Observer",
        href: "https://www.youtube.com/@PerformanceObserver/videos",
        description:
          "YouTube channel focused on web performance: profiling, Core Web Vitals and optimization techniques.",
      },
      {
        title: "Lydia Hallie",
        href: "https://www.youtube.com/@theavocoder",
        description:
          "Channel of Lydia Hallie ('theavocoder'), known for beautifully animated deep-dive explainers on JavaScript internals, Git and how dev tools actually work under the hood.",
      },
      {
        title: "Handmade Network podcast",
        href: "https://handmade.network/podcast",
        description:
          "Podcast from the Handmade Network, a community focused on building software from scratch with a deep understanding of the underlying systems, rather than stacking abstractions.",
      },
      {
        title: "John Hammond",
        href: "https://www.youtube.com/@_JohnHammond",
        description:
          "Well-known cybersecurity YouTuber covering CTF walkthroughs, malware analysis and offensive security techniques.",
      },
      {
        title: "Andrej Karpathy",
        href: "https://www.youtube.com/@AndrejKarpathy",
        description:
          "Channel of Andrej Karpathy (former Tesla AI director, OpenAI founding member), known for exceptionally clear, from-scratch explanations of neural networks and LLMs, including the 'zero to hero' series.",
      },
      {
        title: "Yannic Kilcher",
        href: "https://www.youtube.com/@YannicKilcher",
        description:
          "Channel dedicated to detailed, critical paper-review breakdowns of new machine learning research as it's published.",
      },
      {
        title: "The Net Ninja",
        href: "https://www.youtube.com/@NetNinja",
        description:
          "Long-running, widely used channel of concise, practical web development tutorials across frameworks and tools.",
      },
      {
        title: "Corey Schafer",
        href: "https://www.youtube.com/@coreyms",
        description:
          "Well-known channel of clear, thorough Python and general programming tutorials, a common recommendation for learning Python properly.",
      },
      {
        title: "TechWorld with Nana",
        href: "https://www.youtube.com/@TechWorldwithNana",
        description:
          "One of the most popular DevOps and Kubernetes education channels, known for clear diagrams and practical, no-fluff explanations.",
      },
      {
        title: "Luke Barousse",
        href: "https://www.youtube.com/@LukeBarousse",
        description:
          "Channel focused on data analytics careers and skills, portfolio projects, job market insights and practical data tooling.",
      },
      {
        title: "Gaurav Sen",
        href: "https://www.youtube.com/@gkcs",
        description:
          "Well-known system design education channel, walking through how to design scalable systems for both interviews and real architecture.",
      },
      {
        title: "Hussein Nasser",
        href: "https://www.youtube.com/@hnasr",
        description:
          "Prolific backend engineering channel covering databases, networking protocols and systems design in practical, code-adjacent detail.",
      },
      {
        title: "The Cherno",
        href: "https://www.youtube.com/@TheCherno",
        description:
          "Well-known C++ and game engine development channel, including the long-running Hazel game engine series built live on stream.",
      },
      {
        title: "Learn Linux TV",
        href: "https://www.youtube.com/@LearnLinuxTV",
        description:
          "Channel teaching Linux system administration, self-hosting and open-source tooling from the ground up.",
      },
      {
        title: "David Bombal",
        href: "https://www.youtube.com/@davidbombal",
        description:
          "Well-known networking and cybersecurity channel, covering CCNA content, ethical hacking and interviews with security researchers.",
      },
      {
        title: "3Blue1Brown",
        href: "https://www.youtube.com/@3blue1brown",
        description:
          "Grant Sanderson's iconic math visualization channel, famous for making linear algebra, calculus and neural networks intuitive through animated explanation.",
      },
    ],
  },
  {
    title: "Talks and individual videos",
    links: [
      {
        title: "AWS re:Invent",
        href: "https://www.youtube.com/playlist?list=PL2yQDdvlhXf_NqSnDKx7Hbb9FrNQKmxg7",
        description:
          "Playlist of official session recordings from AWS re:Invent, AWS's flagship annual conference.",
      },
      {
        title: "The DevOps roadmap that got me hired",
        href: "https://youtu.be/8s0DWeHuEaw",
        description:
          "Video: 'The DevOps Roadmap That Got Me Hired (No CS Degree, No Certs)', a personal account of the path into a DevOps role without a traditional CS background.",
      },
      {
        title: "The co-creator of Kubernetes",
        href: "https://youtu.be/FKijpCEH9D8",
        description:
          "Interview 'The Co-Creator of Kubernetes: Engineering-Led Direction and Convincing Management' with Brendan Burns, on how Kubernetes's technical direction actually got decided and sold internally at Google.",
      },
      {
        title: "React for Two Computers, Dan Abramov",
        href: "https://youtu.be/ozI4V_29fj4",
        description:
          "Dan Abramov talk exploring how React's model changes when you think about it as coordinating two computers (server and client) instead of one, relevant to Server Components and modern React architecture.",
      },
      {
        title: "Live streaming at world record scale",
        href: "https://youtu.be/qXJ3S3T3xJY",
        description:
          "Talk 'Live streaming at world-record scale' with Ashutosh Agrawal (ex-Jio/Disney+ Hotstar), on the infrastructure behind streaming live video to record-breaking concurrent audiences.",
      },
      {
        title: "The power of an interface for performance",
        href: "https://www.youtube.com/watch?v=yKgfk8lTQuE&t=2929s",
        description:
          "Talk '1000x: The Power of an Interface for Performance' by TigerBeetle's Joran Dirk Greef, on how the shape of an interface itself can unlock or block order-of-magnitude performance gains.",
      },
    ],
  },
  {
    title: "Self-hosted software",
    links: [
      {
        title: "Replacements.fyi",
        href: "https://replacements.fyi",
        description:
          "Directory pairing popular paid SaaS products with open-source, self-hostable alternatives that do roughly the same job.",
      },
      {
        title: "Spacebar Chat",
        href: "https://github.com/spacebarchat",
        description:
          "Open-source, Discord-API-compatible chat client and server, for running your own Discord-like chat platform.",
      },
      {
        title: "Plunk",
        href: "https://www.useplunk.com",
        description:
          "Open-source email platform positioned as an alternative to SendGrid, for sending transactional and marketing email from your own infrastructure.",
      },
      {
        title: "OpenStatus registry",
        href: "https://www.openstatus.dev/registry",
        description:
          "Open-source registry of self-hosted status page projects, cataloging tools like the ones in this list's self-hosted-software group.",
      },
      {
        title: "Documenso",
        href: "https://documenso.com",
        description:
          "Open-source alternative to DocuSign for collecting legally binding e-signatures on your own infrastructure.",
      },
      {
        title: "HeyForm",
        href: "https://github.com/heyform/heyform",
        description:
          "Open-source, self-hosted form builder, a free alternative to Typeform. Drag-and-drop editor, conditional logic, and multiple question types, deployable via Docker.",
      },
      {
        title: "Gotify",
        href: "https://github.com/gotify",
        description:
          "Simple self-hosted push notification server. Send messages to your phone or desktop over a lightweight REST API and WebSocket, without routing through a third-party service.",
      },
      {
        title: "LimeSurvey",
        href: "https://github.com/LimeSurvey/LimeSurvey",
        description:
          "Open-source, self-hosted survey tool with a long track record in academic and enterprise research, supporting complex branching logic, quotas and multilingual surveys.",
      },
      {
        title: "Cachet",
        href: "https://github.com/cachethq/cachet",
        description:
          "Open-source status page system for reporting incidents and uptime to your users, self-hosted instead of paying for a hosted status page product.",
      },
      {
        title: "Sessy (GitHub)",
        href: "https://github.com/marckohlbrugge/sessy",
        description:
          "Source code for Sessy, an open-source email observability platform that wraps Amazon SES to track sends, deliveries, bounces, opens and complaints without per-message fees.",
      },
      {
        title: "Sessy (app)",
        href: "https://sessy.do",
        description:
          "Hosted version of Sessy: a self-hosted-friendly dashboard giving visibility into Amazon SES email delivery, so you can monitor performance without an SES-wrapper subscription.",
      },
      {
        title: "Whoogle Search",
        href: "https://github.com/benbusby/whoogle-search",
        description:
          "Self-hosted, ad-free proxy for Google search results, stripping ads, JavaScript and tracking so you get Google's results without Google watching you search.",
      },
      {
        title: "Gitea",
        href: "https://about.gitea.com",
        description:
          "Lightweight, self-hosted Git service, a much smaller-footprint alternative to GitLab or a self-hosted GitHub, with issues, PRs, actions and packages built in.",
      },
      {
        title: "Coolify",
        href: "https://coolify.io",
        description:
          "Open-source, self-hostable alternative to Vercel or Heroku: point it at a VPS and it handles deploys, databases, SSL and previews for your apps.",
      },
      {
        title: "Slash",
        href: "https://github.com/yourselfhosted/slash",
        description:
          "Self-hosted link organizer built around short, memorable shortcuts like s/roadmap that redirect to your frequently used URLs. Includes analytics, a browser extension, and team sharing; built with TypeScript and Go.",
      },
      {
        title: "Docmost",
        href: "https://docmost.com",
        description:
          "Open-source, self-hosted wiki and documentation tool, positioned as a Notion/Confluence alternative with real-time collaborative editing and permissions.",
      },
      {
        title: "Glance",
        href: "https://github.com/glanceapp/glance",
        description:
          "Lightweight, highly customizable self-hosted dashboard that aggregates RSS, Reddit, YouTube, weather and more into one streamlined feed. Built in Go, low memory footprint, works well on mobile.",
      },
      {
        title: "Paymenter",
        href: "https://paymenter.org",
        description:
          "Open-source billing platform built specifically for hosting businesses: subscription management, invoicing and automated service provisioning, with pluggable payment gateways and no vendor lock-in.",
      },
      {
        title: "Windmill",
        href: "https://www.windmill.dev",
        description:
          "Code-first workflow orchestration platform for internal tools, apps and data pipelines. Write scripts in Python, TypeScript, Go, Bash or SQL, chain them into workflows, and it auto-generates a UI, all Git-backed.",
      },
      {
        title: "FileFlows",
        href: "https://fileflows.com",
        description:
          "Self-hosted automation platform for file processing pipelines: visually design workflows for video transcoding, audio processing and image optimization, scalable from a single box to a cluster.",
      },
      {
        title: "DocuSeal",
        href: "https://www.docuseal.com",
        description:
          "Open-source, self-hosted alternative to DocuSign: build PDF forms, collect legally binding e-signatures, and keep the whole signing flow off a third-party server.",
      },
      {
        title: "Postiz",
        href: "https://postiz.com",
        description:
          "Open-source, self-hosted social media scheduler: plan and publish posts across platforms from one dashboard instead of paying for Buffer or Hootsuite.",
      },
      {
        title: "Colanode",
        href: "https://colanode.com",
        description:
          "Local-first, open-source collaboration platform that bundles messaging, document editing, databases and file storage into one self-hostable app, syncing via conflict-free replication so you keep full data ownership.",
      },
      {
        title: "Mazanoke",
        href: "https://mazanoke.com",
        description:
          "Self-hosted image compressor: a fast, simple, privacy-respecting alternative to uploading photos to a third-party compression site.",
      },
      {
        title: "Cloudreve",
        href: "https://cloudreve.org",
        description:
          "Self-hosted cloud storage system for standing up your own file-sharing platform, with configurable public or private deployment and support for multiple storage backends.",
      },
      {
        title: "Karakeep",
        href: "https://karakeep.app",
        description:
          "Bookmark manager for links, notes, images and PDFs, with AI-generated tags, full-text search and automation rules. Available as a hosted service or a self-hosted, open-source deployment.",
      },
      {
        title: "WriteFreely",
        href: "https://writefreely.org",
        description:
          "Minimalist, self-hosted blogging platform behind the write.as network, focused on plain, distraction-free writing rather than themes and plugins.",
      },
      {
        title: "YOURLS",
        href: "https://yourls.org",
        description:
          "Self-hosted URL shortener you run on your own domain, with click stats, a plugin architecture, and full control over your short links instead of trusting a third-party shortener.",
      },
      {
        title: "MediaCMS",
        href: "https://mediacms.io",
        description:
          "Self-hosted, open-source video and media platform, essentially a YouTube you run yourself, with transcoding, playlists, categories and user channels.",
      },
      {
        title: "pad.ws",
        href: "https://pad.ws",
        description:
          "Self-hostable infinite whiteboard built on top of Excalidraw, for sketching and collaborating on a canvas you control.",
      },
      {
        title: "OpenCut",
        href: "https://opencut.app",
        description:
          "Open-source, self-hostable video editor built for the web, positioned as a free alternative to CapCut for cutting and assembling clips in the browser.",
      },
    ],
  },
  {
    title: "Mockups, textures and patterns",
    links: [
      {
        title: "iPhone 15 Pro in-hand mockups",
        href: "https://pixelsurplus.com/collections/free-mockups/products/15-iphone-15-pro-in-hand-mockups",
        description:
          "Free pack of in-hand iPhone 15 Pro mockup shots for presenting app screens in a realistic, held-in-hand context.",
      },
      {
        title: "MacBook mockup on wooden chair",
        href: "https://mockups-design.com/macbook-mockup-on-wooden-chair",
        description:
          "Free lifestyle MacBook mockup: a laptop on a wooden chair in naturally lit surroundings. Ships as three PSD files with multiple angles and smart objects for dropping in your own screenshot.",
      },
      {
        title: "MacBook Pro on folding chair",
        href: "https://unblast.com/macbook-pro-on-modern-folding-chair",
        description:
          "Free lifestyle MacBook Pro mockup staged on a modern folding chair, PSD with a smart-object screen for swapping in your own design.",
      },
      {
        title: "Ransom note letters",
        href: "https://resourceboy.com/graphics/ransom-note-letters",
        description:
          "Free set of cut-out, magazine-style ransom note letter graphics for collage-style headlines and covers.",
      },
      {
        title: "Scribble textures",
        href: "https://resourceboy.com/textures/scribble-textures",
        description:
          "Free pack of hand-drawn scribble textures for adding a rough, doodled layer to designs.",
      },
      {
        title: "200 crayon Photoshop brushes",
        href: "https://unblast.com/200-crayon-photoshop-brushes",
        description:
          "Free set of 200 crayon-texture Photoshop brushes for waxy, hand-colored strokes and shading.",
      },
      {
        title: "Grunge brushes",
        href: "https://resourceboy.com/photoshop-brushes/grunge-brushes",
        description:
          "Free pack of grunge-texture Photoshop brushes for distressed, worn-in surface effects.",
      },
      {
        title: "UltraMock",
        href: "https://www.ultramock.io",
        description:
          "Turns a plain product screenshot into a polished, presentation-ready visual automatically, without manual compositing in Photoshop.",
      },
      {
        title: "Resourceboy patterns",
        href: "https://resourceboy.com/patterns",
        description:
          "Large library of free seamless patterns, from floral and geometric to '90s and watercolor styles, alongside the site's fonts, textures and brushes.",
      },
      {
        title: "Heritage Type free vintage illustrations",
        href: "https://www.heritagetype.com/pages/free-vintage-illustrations",
        description:
          "Hundreds of themed bundles of vintage illustrations pulled from historical archives, free for personal and commercial use in PNG and vector formats.",
      },
      {
        title: "ls.graphics paaatterns",
        href: "https://www.ls.graphics/products/paaatterns",
        description:
          "Free collection of 22 vector patterns in a range of styles, colors and moods from LS.GRAPHICS, the studio behind Colorflow.",
      },
      {
        title: "Pattern Playground",
        href: "https://learn.every-tuesday.com/pattern-playground",
        description:
          "Free tool for testing seamless repeat patterns: upload an image, preview how it tiles, and try blend modes and repeat layouts like full drop, half drop and half brick.",
      },
      {
        title: "House of Mockups freebies",
        href: "https://houseofmockups.com/collections/freebies",
        description:
          "Free tier of House of Mockups' library of PSD device mockups, typefaces and branding assets, alongside its paid premium collection.",
      },
      {
        title: "Are.na: cool characters",
        href: "https://www.are.na/t-hanks/cool-characters",
        description:
          "Curated Are.na channel collecting character design references under the name 'cool characters', useful for illustration and mascot inspiration.",
      },
      {
        title: "Paliotta mockup",
        href: "https://paliotta.gumroad.com/l/zzumsc",
        description:
          "Premium product mockup pack sold on Gumroad by designer Paliotta.",
      },
      {
        title: "Architect mockup (Vitora)",
        href: "https://vitora.gumroad.com/l/architect-mockup",
        description:
          "Architectural presentation mockup pack sold on Gumroad by Vitora, for showcasing building and interior renders in a styled frame.",
      },
      {
        title: "iPhone 17 mockup (Mockuply)",
        href: "https://mockuply.gumroad.com/1/iPhone17",
        description:
          "iPhone 17 device mockup pack from Mockuply, for presenting app screens on the current-generation iPhone.",
      },
    ],
  },
  {
    title: "Agent skills directories",
    links: [
      {
        title: "Meng To Skills",
        href: "https://github.com/MengTo/Skills",
        description:
          "Collection of Claude skills for web design, packaging reusable visual design guidance and workflows for coding agents.",
      },
      {
        title: "0xdesign design-plugin",
        href: "https://github.com/0xdesign/design-plugin",
        description:
          "Claude Code plugin that iterates on UI design: generates multiple distinct component variations, lets you compare them side by side in the browser, and refines based on feedback, producing production-ready code (not mockups) for Next.js, Vite or Remix with Tailwind or Material UI.",
      },
      {
        title: "Sub-Agents Directory",
        href: "https://sub-agents.directory",
        description:
          "Directory of 200+ ready-to-copy Claude Code sub-agent prompts across React, Python, TypeScript and more, plus a collection of MCP servers for Slack, Postgres, Figma and Vercel.",
      },
      {
        title: "ui-skills.com",
        href: "https://www.ui-skills.com",
        description:
          "Directory of AI agent skills focused on UI and design work, for installing pre-built design knowledge into a coding agent instead of writing it from scratch.",
      },
      {
        title: "Dimillian skills",
        href: "https://github.com/dimillian/skills",
        description:
          "Collection of 16 reusable Claude Code skills by iOS developer Dimillian, covering Apple platform release notes, iOS debugging, SwiftUI and React performance work, macOS packaging, and multi-agent code review and bug-hunt swarms.",
      },
      {
        title: "Kit Langton skills",
        href: "https://github.com/kitlangton/skills",
        description:
          "Kit Langton's agent skills collection, currently featuring an installable skill for writing production TypeScript with Effect v4.",
      },
      {
        title: "Fallow Tools: agent skills integration",
        href: "https://docs.fallow.tools/integrations/agent-skills",
        description:
          "Docs for wiring agent skills into the Fallow Tools developer suite.",
      },
      {
        title: "shadcn skills docs",
        href: "https://ui.shadcn.com/docs/skills",
        description:
          "Official shadcn/ui documentation for its agent skills, packaging shadcn/ui conventions and component knowledge as an installable skill for coding agents.",
      },
      {
        title: "kalypso-claude-workflow",
        href: "https://github.com/Kalypsokichu-code/kalypso-claude-workflow",
        description:
          "Claude Code workflow configuration repo, the origin of the 'Kalypso' name used as a working title for this batch of links.",
      },
      {
        title: "Marketing skills",
        href: "https://github.com/coreyhaines31/marketingskills",
        description:
          "Claude Code skills for marketing tasks by Corey Haines, packaging marketing frameworks and copywriting know-how as installable agent skills.",
      },
      {
        title: "skills.sh",
        href: "https://skills.sh",
        description:
          "The open agent skills ecosystem: install reusable AI capabilities into coding agents with a single command, with a leaderboard of the most popular skills across categories like design, testing and cloud.",
      },
      {
        title: "Vercel composition patterns skill",
        href: "https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns",
        description:
          "Official Vercel Labs agent skill that teaches a coding agent Vercel's component composition patterns.",
      },
      {
        title: "Web design guidelines skill",
        href: "https://skills.sh/vercel-labs/agent-skills/web-design-guidelines",
        description:
          "Official Vercel Labs agent skill that packages web design best practices for a coding agent to apply automatically.",
      },
      {
        title: "SwiftUI Microinteractions",
        href: "https://github.com/iamvishal16/swiftui-microinteractions",
        description:
          "Claude Code / Cursor / Codex agent skill that generates production-ready SwiftUI micro-interactions from plain-English prompts, encoding spring physics presets, haptic feedback grammar and glass-morphism aesthetics drawn from the author's Animo animation library.",
      },
      {
        title: "Jakub Krehel skills",
        href: "https://jakub.kr/skills",
        description:
          "Jakub Krehel's directory of agent skills for product design and development, including /better-ui, /better-typography and /better-colors.",
      },
    ],
  },
  {
    title: "VPS and hosting videos",
    links: [
      {
        title: "Next.js hosting: Coolify, VPS, self-hosting",
        href: "https://www.youtube.com/watch?v=pk0DypMIZfM",
        description:
          "YouTube video walking through self-hosting a Next.js app with Coolify on a VPS, as an alternative to managed hosting platforms.",
      },
      {
        title: "VPS hosting explainer",
        href: "https://www.youtube.com/watch?v=4guOChx7poQ",
        description:
          "YouTube video explaining what VPS hosting is and how it works.",
      },
      {
        title: "Should you use a VPS instead of Vercel, Netlify & co?",
        href: "https://www.youtube.com/watch?v=yVuyh95kqXk",
        description:
          "YouTube video weighing running your own VPS against managed platforms like Vercel and Netlify, covering the cost and control tradeoffs.",
      },
      {
        title: "What is a VPS, everything you need to know",
        href: "https://www.youtube.com/watch?v=4zZiFTQoXRM",
        description:
          "Beginner-friendly YouTube explainer covering what a VPS is and the basics of setting one up.",
      },
      {
        title: "Best value VPS provider: price to performance",
        href: "https://www.youtube.com/watch?v=FZRBw-_s8i0",
        description:
          "YouTube video comparing VPS providers on price-to-performance to find the best value option.",
      },
    ],
  },
];

/** Full catalog as markdown for /inspiration/llms.txt and LLM tooling. */
export function inspirationGroupsToMarkdown(
  groups: InspirationGroup[] = inspirationGroups,
): string {
  const total = groups.reduce((n, g) => n + g.links.length, 0);
  const lines: string[] = [
    "# Inspiration",
    "",
    "Curated links from [ui.aryank.space/inspiration](https://ui.aryank.space/inspiration).",
    "",
    `${groups.length} categories, ${total} links.`,
    "",
    "---",
    "",
  ];

  for (const group of groups) {
    lines.push(`## ${group.title}`, "");
    for (const link of group.links) {
      const suffix = link.description ? `: ${link.description}` : "";
      lines.push(`- [${link.title}](${link.href})${suffix}`);
    }
    lines.push("");
  }

  lines.push("---", "");
  lines.push(
    "Source of truth: `src/lib/inspiration.ts` in the compronents registry.",
    "",
  );

  return lines.join("\n");
}
